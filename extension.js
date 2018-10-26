'use strict'

const {
  Position,
  workspace,
  TextEdit,
  Range
} = require("vscode");

const defaultTemplate = require("./templates/default_cls.js");

class Extension {
  constructor() {}

  setListenerOnPreSave(context) {
    const preSaveHookListener = workspace.onWillSaveTextDocument
      .call(this, event => {
        if (!this.isLanguageSFDC(event.document)) return;

        if (this.isLineABlockComment(event.document.lineAt(0).text))
          event.waitUntil(this.updateHeaderValues(event.document));
        else event.waitUntil(this.prependFileHeader(event.document));
      });

    context.subscriptions.push(preSaveHookListener);
  }

  async prependFileHeader(document) {
    return [
      TextEdit.insert(
        new Position(0, 0),
        defaultTemplate(
          document.fileName.split(/\/|\\/g).pop(),
          this.getConfiguredUsername(),
          this.getHeaderFormattedDateTime()
        )
      )
    ];
  }

  isLineABlockComment(textContent) {
    const re = /^\/\*/g;
    return !!textContent.trim().match(re);
  }

  isLanguageSFDC(document) {
    return document.languageId === "apex";
  }

  getHeaderFormattedDateTime() {
    const currentDate = new Date(Date.now());
    return currentDate.toLocaleString();
  }

  getConfiguredUsername() {
    const settingsUsername = workspace
      .getConfiguration()
      .inspect("SFDX_Autoheader.username");

    return settingsUsername.globalValue || settingsUsername.defaultValue;
  }

  async updateHeaderValues(document) {
    return [
      TextEdit.replace(
        this.getFullDocumentRange(document),
        this.updateHeaderLastModifiedByAndDate(document.getText())
      )
    ];
  }

  updateHeaderLastModifiedByAndDate(documentText) {
    return this.updateLastModifiedDateTime(this.updateLastModifiedBy(documentText));
  }

  updateLastModifiedBy(fileContent) {
    const re = /(\s*\*\s*@Last\s*Modified\s*By\s*:\s*).*$/gm;
    return fileContent.replace(re, `$1${this.getConfiguredUsername()}`);
  }

  updateLastModifiedDateTime(fileContent) {
    const re = /(\s*\*\s*@Last\s*Modified\s*On\s*:\s*).*$/gm;
    return fileContent.replace(re, `$1${this.getHeaderFormattedDateTime()}`);
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
  console.log('Extension Activated');
}
exports.deactivate = function () {};
exports.Extension = Extension;