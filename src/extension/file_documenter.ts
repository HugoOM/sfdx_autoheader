import {
  Disposable,
  ExtensionContext,
  Position,
  Range,
  Selection,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  window,
  workspace,
  WorkspaceConfiguration
} from "vscode";

const defaultTemplates = require("../templates/default.js");

export default class FileDocumenter {
  private cursorPosition: Position | null = null;
  private readonly HEADER_LENGTH_LINES: number = 13;
  private isHeaderBeingInserted: boolean = false;

  constructor(context: ExtensionContext) {
    this.setListenerOnPreSave(context);
    this.setListenerOnPostSave(context);
  }

  setListenerOnPreSave(context: ExtensionContext): void {
    const preSaveHookListener: Disposable = workspace.onWillSaveTextDocument.call(
      this,
      (event: TextDocumentWillSaveEvent) => {
        if (!event.document.isDirty) return;
        if (!this.isValidLanguage(event.document)) return;

        event.waitUntil(this.insertOrUpdateHeader(event.document));
      }
    );
    context.subscriptions.push(preSaveHookListener);
  }

  setListenerOnPostSave(context: ExtensionContext): void {
    const postSaveHookListener = workspace.onDidSaveTextDocument(
      this.replaceCursor.bind(this)
    );
    context.subscriptions.push(postSaveHookListener);
  }

  replaceCursor(): void {
    if (!this.cursorPosition) return;
    if (!window.activeTextEditor) return;

    // TODO: Change to "All Visible Text Editors" and manage through a map
    window.activeTextEditor.selection = new Selection(
      this.getLastSavedCursorPosition(),
      this.getLastSavedCursorPosition()
    );

    this.cursorPosition = null;
  }

  insertOrUpdateHeader(document: TextDocument): Thenable<TextEdit[]> {
    //* Prevent capturing the Cursor position when saving from script
    if (window.activeTextEditor)
      this.cursorPosition = window.activeTextEditor.selection.active;

    this.isHeaderBeingInserted = this.checkForHeaderOnDoc(document);

    return this.isHeaderBeingInserted
      ? this.getUpdateHeaderValueEdit(document)
      : this.getInsertFileHeaderEdit(document);
  }

  checkForHeaderOnDoc(document: TextDocument): boolean {
    const firstLineText: string = document.lineAt(0).text;

    return (
      this.isLineABlockComment(firstLineText) ||
      this.isLineAnXMLComment(firstLineText)
    );
  }

  getLastSavedCursorPosition(): Position {
    if (!this.cursorPosition)
      return new Position(
        this.isHeaderBeingInserted ? 0 : this.HEADER_LENGTH_LINES,
        0
      );

    return new Position(
      this.cursorPosition.line +
        (this.isHeaderBeingInserted ? 0 : this.HEADER_LENGTH_LINES),
      this.cursorPosition.character
    );
  }

  async getInsertFileHeaderEdit(document: TextDocument): Promise<TextEdit[]> {
    return [
      TextEdit.insert(
        new Position(0, 0),
        defaultTemplates[document.languageId](
          document.fileName.split(/\/|\\/g).pop(),
          this.getConfiguredUsername(),
          this.getHeaderFormattedDateTime()
        )
      )
    ];
  }

  isLineABlockComment(lineContent: string): boolean {
    const re = /^\s*\/\*/g;
    return re.test(lineContent);
  }

  isLineAnXMLComment(lineContent: string): boolean {
    const re = /^\s*<!--/g;
    return re.test(lineContent);
  }

  isValidLanguage(document: TextDocument): boolean {
    const lang = document.languageId;
    const configs = workspace.getConfiguration("SFDX_Autoheader");
    const enabledForAllWebFiles = configs.get("EnableForAllWebFiles", false);
    const enabledForApex = configs.get("EnableForApex");
    const enabledForVf = configs.get("EnableForVisualforce");
    const enabledForLightMarkup = configs.get("EnableForLightningMarkup", true);
    const enabledForLightningJavaScript = configs.get(
      "EnableForLightningJavascript",
      false
    );

    if (lang === "apex" && enabledForApex) return true;

    if (lang === "visualforce" && enabledForVf) return true;

    if (lang === "html")
      return (
        enabledForAllWebFiles ||
        (enabledForLightMarkup && this.isLightning(document))
      );

    if (lang === "javascript")
      return (
        enabledForAllWebFiles ||
        (enabledForLightningJavaScript && this.isLightning(document))
      );

    return false;
  }

  isLightning(document: TextDocument): boolean {
    const validExtensions: string[] = ["htm", "html", "cmp", "js"];
    const validSalesforceFolderNames = ["aura", "lwc"];
    const pathTokens = document.uri.path.split("/");
    const folderName = pathTokens[pathTokens.length - 2];
    const parentFolderName =
      pathTokens.length >= 3 ? pathTokens[pathTokens.length - 3] : null;
    const [fileName, fileExtension] = pathTokens[pathTokens.length - 1].split(
      "."
    );
    const lightningJavaScriptFileRegex = /Controller|Helper/gi;
    const folderNameMatchRegex = new RegExp(`^${folderName}$`);
    const processedFileName =
      document.languageId === "javascript"
        ? fileName.replace(lightningJavaScriptFileRegex, "")
        : fileName;

    if (!folderNameMatchRegex.test(processedFileName)) return false;
    if (!validExtensions.includes(fileExtension)) return false;
    if (!parentFolderName) return false;
    if (!validSalesforceFolderNames.includes(parentFolderName)) return false;

    return true;
  }

  getHeaderFormattedDateTime(): string {
    const currentDate = new Date(Date.now());
    return currentDate.toLocaleString();
  }

  getConfiguredUsername(): string {
    const settingsUsername: WorkspaceConfiguration = workspace.getConfiguration(
      "SFDX_Autoheader"
    );

    return settingsUsername.get("username", "phUser@phDomain.com");
  }

  async getUpdateHeaderValueEdit(document: TextDocument): Promise<TextEdit[]> {
    return [
      TextEdit.replace(
        this.getFullDocumentRange(document),
        this.updateHeaderLastModifiedByAndDate(document.getText())
      )
    ];
  }

  updateHeaderLastModifiedByAndDate(documentText: string): string {
    return this.updateLastModifiedDateTime(
      this.updateLastModifiedBy(documentText)
    );
  }

  updateLastModifiedBy(fileContent: string): string {
    const re = /^(\s*[\*\s]*@Last\s*Modified\s*By\s*:).*/gm;
    return fileContent.replace(re, `$1 ${this.getConfiguredUsername()}`);
  }

  updateLastModifiedDateTime(fileContent: string): string {
    const re = /^(\s*[\*\s]*@Last\s*Modified\s*On\s*:).*/gm;
    return fileContent.replace(re, `$1 ${this.getHeaderFormattedDateTime()}`);
  }

  getFullDocumentRange(document: TextDocument): Range {
    const lastChar = document.lineAt(document.lineCount - 1).text.length;

    return new Range(
      new Position(0, 0),
      new Position(document.lineCount, lastChar)
    );
  }
}
