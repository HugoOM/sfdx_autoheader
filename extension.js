'use strict'

const {
  Position,
  workspace,
  TextEdit,
  Range
} = require("vscode");

const {
  apexTemplate,
  vfTemplate
} = require("./templates/default.js");

class Extension {
  constructor() {}

  setListenerOnPreSave(context) {
    const preSaveHookListener = workspace.onWillSaveTextDocument
      .call(this, event => {
        if (!this.isLanguageSFDC(event.document.languageId)) return;

        if (this.isLineABlockComment(event.document.lineAt(0).text))
          event.waitUntil(this.getUpdateHeaderValueEdit(event.document));
        else event.waitUntil(this.getInsertFileHeaderEdit(event.document));
      });

    context.subscriptions.push(preSaveHookListener);
  }

  async getInsertFileHeaderEdit(document) {
    return [
      TextEdit.insert(
        new Position(0, 0),
        apexTemplate(
          document.fileName.split(/\/|\\/g).pop(),
          this.getConfiguredUsername(),
          this.getHeaderFormattedDateTime()
        )
      )
    ];
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
    ];
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
  console.log('Extension Activated');
}
exports.deactivate = function () {};
exports.Extension = Extension;