'use strict'

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
    this.isFirstInsert = null;
  }

  setListenerOnPreSave(context) {
    const preSaveHookListener = workspace.onWillSaveTextDocument
      .call(this, event => {
        if (!event.document.isDirty) return;
        if (!this.isValidLanguage(event.document)) return;

        const firstLine = event.document.lineAt(0).text;

        //* Prevent capturing the Cursor position when saving from script
        if (window.activeTextEditor)
          this.cursorPosition = window.activeTextEditor.selection.active;

        if (this.isLineABlockComment(firstLine) || this.isLineAnXMLComment(firstLine))
          event.waitUntil(this.getUpdateHeaderValueEdit(event.document))
        else
          event.waitUntil(this.getInsertFileHeaderEdit(event.document))
      });

    context.subscriptions.push(preSaveHookListener);
  }

  setListenerOnPostSave(context) {
    const postSaveHookListener = workspace.onDidSaveTextDocument
      .call(this, () => {
        if (!this.cursorPosition) return;

        //TODO Improve for initial insertion (extension flag)
        window.activeTextEditor.selection = new Selection(
          this.getLastSavedCursorPosition(),
          this.getLastSavedCursorPosition()
        );
      });

    this.cursorPosition = null;

    context.subscriptions.push(postSaveHookListener);
  }

  getLastSavedCursorPosition() {
    return new Position(this.cursorPosition.line, this.cursorPosition.character);
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
    ]
  }

  isLineABlockComment(lineContent) {
    const re = /^\/\*/g;
    return !!lineContent.trim().match(re);
  }

  isLineAnXMLComment(lineContent) {
    const re = /<!--/g;
    return !!lineContent.trim().match(re);
  }

  isValidLanguage(document) {
    const lang = document.languageId;
    const configs = workspace.getConfiguration("SFDX_Autoheader");
    const enabledForAllWebFiles = configs.get("EnableForAllWebFiles");
    const enabledForApex = configs.get("EnableForApex");
    const enabledForVf = configs.get("EnableForVisualforce");
    const enabledForLightMarkup = configs.get("EnableForLightningMarkup");
    const enabledForLightJavaScript = configs.get("EnableForLightningJavascript");

    if (lang === "apex" && enabledForApex) return true;
    if (lang === "visualforce" && enabledForVf) return true;
    if (lang === "html") return enabledForAllWebFiles || (enabledForLightMarkup ? this.isLightning(document) : false);
    if (lang === "javascript") return enabledForAllWebFiles || (enabledForLightJavaScript ? this.isLightning(document) : false);

    return false;
  }

  isLightning(document) {
    const validExtensions = ['cmp', 'js'];
    const pathTokens = document.uri.path.split('/');
    const documentFolder = pathTokens[pathTokens.length - 2];
    const lightningJavaScriptFileRegex = /Controller|Helper/gi;
    const [fileName, fileExtension] = pathTokens[pathTokens.length - 1].split('.');
    const processedFileName =
      document.languageId === 'javascript' ?
      fileName.replace(lightningJavaScriptFileRegex, '') :
      fileName;

    //* Lightning Components' files should have the same name as their parent folder
    if (processedFileName !== documentFolder) return false;
    if (!validExtensions.includes(fileExtension)) return false;

    return true;
  }

  getHeaderFormattedDateTime() {
    const currentDate = new Date(Date.now());
    return currentDate.toLocaleString();
  }

  getConfiguredUsername() {
    const settingsUsername = workspace.getConfiguration("SFDX_Autoheader");

    return settingsUsername.get('username') || settingsUsername.inspect('username').defaultValue;
  }

  async getUpdateHeaderValueEdit(document) {
    return [
      TextEdit.replace(
        this.getFullDocumentRange(document),
        this.updateHeaderLastModifiedByAndDate(document.getText())
      )
    ]
  }

  updateHeaderLastModifiedByAndDate(documentText) {
    return this.updateLastModifiedDateTime(this.updateLastModifiedBy(documentText));
  }

  updateLastModifiedBy(fileContent) {
    const re = /^(\s*[\*\s]*@Last\s*Modified\s*By\s*:).*$/gm;
    return fileContent.replace(re, `$1 ${this.getConfiguredUsername()}`);
  }

  updateLastModifiedDateTime(fileContent) {
    const re = /^(\s*[\*\s]*@Last\s*Modified\s*On\s*:).*$/gm;
    return fileContent.replace(re, `$1 ${this.getHeaderFormattedDateTime()}`);
  }

  getFullDocumentRange(document) {
    return new Range(
      new Position(0, 0),
      new Position(document.lineCount, Number.MAX_SAFE_INTEGER)
    );
  }
}

exports.activate = function (context) {
  const ext = new Extension();
  ext.setListenerOnPreSave(context);
  ext.setListenerOnPostSave(context);
  console.log('SFDX Autoheader - Extension Activated');
}
exports.deactivate = function () {};
exports.Extension = Extension;