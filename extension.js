const {
  Position,
  workspace,
  TextEdit
} = require('vscode');
const defaultTemplate = require('./templates/default_cls.js')

function activate() {
  workspace.onWillSaveTextDocument(event => {
    if (isLineAComment(event.document.lineAt(0).text)) return;

    event.waitUntil(prependFileHeader(event.document));
  });
}

exports.activate = activate;
exports.deactivate = function () {};

function prependFileHeader(document) {
  return Promise.resolve([
    TextEdit.insert(
      new Position(0, 0),
      defaultTemplate(document.fileName.split('/')[document.fileName.split('/').length - 1], 'hmonette@deloitte.ca', 'placeholder')
    )
  ])
}

function isLineAComment(textContent) {
  const re = /(^\/\/)|(^\/\*)/g;
  return !!textContent.trim().match(re);
}