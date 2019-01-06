"use strict";

const {
  Position,
  workspace,
  TextEdit,
  Range,
  window,
  Selection
} = require("vscode");

const defaultTemplates = require("./templates/default.js");

class Extension {
  constructor() {
    this.cursorPosition = null;
    this.isHeaderExistsOnFile = null;
    this.HEADER_LENGTH_LINES = 13;
  }

  setListenerOnPreSave(context) {
    const preSaveHookListener = workspace.onWillSaveTextDocument.call(
      this,
      event => {
        if (!event.document.isDirty) return;
        if (!this.isValidLanguage(event.document)) return;

        const firstLineText = event.document.lineAt(0).text;

        this.checkForHeader(firstLineText);

        //* Prevent capturing the Cursor position when saving from script
        if (window.activeTextEditor)
          this.cursorPosition = window.activeTextEditor.selection.active;

        if (!this.isHeaderExistsOnFile)
          event.waitUntil(this.getInsertFileHeaderEdit(event.document));
        else event.waitUntil(this.getUpdateHeaderValueEdit(event.document));
      }
    );

    context.subscriptions.push(preSaveHookListener);
  }

  setListenerOnPostSave(context) {
    const postSaveHookListener = workspace.onDidSaveTextDocument.call(
      this,
      () => {
        if (!this.cursorPosition) return;

        window.activeTextEditor.selection = new Selection(
          this.getLastSavedCursorPosition(),
          this.getLastSavedCursorPosition()
        );

        this.cursorPosition = null;
      }
    );

    context.subscriptions.push(postSaveHookListener);
  }

  checkForHeader(firstLineText) {
    this.isHeaderExistsOnFile =
      this.isLineABlockComment(firstLineText) ||
      this.isLineAnXMLComment(firstLineText);
  }

  getLastSavedCursorPosition() {
    return new Position(
      this.cursorPosition.line +
        (!this.isHeaderExistsOnFile ? this.HEADER_LENGTH_LINES : 0),
      this.cursorPosition.character
    );
  }

  async getInsertFileHeaderEdit(document) {
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

  isLineABlockComment(lineContent) {
    const re = /^\s*\/\*/g;
    return re.test(lineContent);
  }

  isLineAnXMLComment(lineContent) {
    const re = /^\s*<!--/g;
    return re.test(lineContent);
  }

  isValidLanguage(document) {
    const lang = document.languageId;
    const configs = workspace.getConfiguration("SFDX_Autoheader");
    const enabledForAllWebFiles = configs.get("EnableForAllWebFiles");
    const enabledForApex = configs.get("EnableForApex");
    const enabledForVf = configs.get("EnableForVisualforce");
    const enabledForLightMarkup = configs.get("EnableForLightningMarkup");
    const enabledForLightJavaScript = configs.get(
      "EnableForLightningJavascript"
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
        (enabledForLightJavaScript && this.isLightning(document))
      );

    return false;
  }

  isLightning(document) {
    const validExtensions = ["htm", "html", "cmp", "js"];
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
    if (!validSalesforceFolderNames.includes(parentFolderName)) return false;

    return true;
  }

  getHeaderFormattedDateTime() {
    const currentDate = new Date(Date.now());
    return currentDate.toLocaleString();
  }

  getConfiguredUsername() {
    const settingsUsername = workspace.getConfiguration("SFDX_Autoheader");

    return (
      settingsUsername.get("username") ||
      settingsUsername.inspect("username").defaultValue
    );
  }

  async getUpdateHeaderValueEdit(document) {
    return [
      TextEdit.replace(
        this.getFullDocumentRange(document),
        this.updateHeaderLastModifiedByAndDate(document.getText())
      )
    ];
  }

  updateHeaderLastModifiedByAndDate(documentText) {
    return this.updateLastModifiedDateTime(
      this.updateLastModifiedBy(documentText)
    );
  }

  updateLastModifiedBy(fileContent) {
    const re = /^(\s*[\*\s]*@Last\s*Modified\s*By\s*:).*/gm;
    return fileContent.replace(re, `$1 ${this.getConfiguredUsername()}`);
  }

  updateLastModifiedDateTime(fileContent) {
    const re = /^(\s*[\*\s]*@Last\s*Modified\s*On\s*:).*/gm;
    return fileContent.replace(re, `$1 ${this.getHeaderFormattedDateTime()}`);
  }

  getFullDocumentRange(document) {
    const lastChar = document.lineAt(document.lineCount - 1).length;

    return new Range(
      new Position(0, 0),
      new Position(document.lineCount, lastChar)
    );
  }
}

exports.activate = function(context) {
  const ext = new Extension();
  ext.setListenerOnPreSave(context);
  ext.setListenerOnPostSave(context);
  console.log("SFDX Autoheader - Extension Activated");
};
exports.deactivate = function() {};
exports.Extension = Extension;
