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
  }

  setListenerOnPreSave(context) {
    const preSaveHookListener = workspace.onWillSaveTextDocument
      .call(this, event => {
        if (!event.document.isDirty) return;
        if (!this.isLanguageSFDC(event.document.languageId)) return;

        const firstLine = event.document.lineAt(0).text;

        /* Prevent capturing the Cursor position when saving from script */
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
      .call(this, event => {
        if (!this.cursorPosition) return;
        if (!this.isLanguageSFDC(event.languageId)) return;
        if (!window.activeTextEditor) return;

        window.activeTextEditor.selection = this.getCursorPositionSelection(
          this.getLastSavedCursorPosition(),
          this.getLastSavedCursorPosition()
        );
      });

    context.subscriptions.push(postSaveHookListener);
  }

  //TODO Improve for initial insertion (extension flag)
  getCursorPositionSelection(startPos, endPos) {
    return new Selection(startPos, endPos);
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

  isLanguageSFDC(languageId) {
    if (languageId === "apex") return true;
    if (languageId === "visualforce") return true;

    return false;
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