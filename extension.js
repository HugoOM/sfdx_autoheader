const {
  Position,
  workspace,
  TextEdit,
  Disposable
} = require('vscode');

const defaultTemplate = require('./templates/default_cls.js')

const disposables = []

function activate(context) {
  const preSaveHookListener = workspace.onWillSaveTextDocument(event => {
    if (!isLanguageSFDC(event.document)) return;
    if (isLineAComment(event.document.lineAt(0).text)) return;

    event.waitUntil(prependFileHeader(event.document));
    // event.waitUntil(updateLastModifiedBy(event.document.getText()));
  })

  context.subscriptions.push(preSaveHookListener);
}

exports.activate = activate;
exports.deactivate = function () {
  // disposables.forEach(disposable => disposable.dispose())
};

async function prependFileHeader(document) {
  return [
    TextEdit.insert(
      new Position(0, 0),
      defaultTemplate(document.fileName.split(/\/|\\/g).pop(), 'hmonette@deloitte.ca', getHeaderFormattedDateTime())
    )
  ]
}

function isLineAComment(textContent) {
  const re = /(^\/\/)|(^\/\*)/g;
  return !!textContent.trim().match(re);
}

function isLanguageSFDC(document) {
  return document.languageId === "apex"
}

function getHeaderFormattedDateTime() {
  const currentDate = new Date(Date.now());
  return currentDate.toLocaleString()
}

async function updateLastModifiedBy(fileContent) {
  const re = /(?<=\s*\*\s*@Last\s*Modified\s*by\s*:\s*).*$/gim;
  headerContent.replace(re, 'bamboo@lit.com')
}