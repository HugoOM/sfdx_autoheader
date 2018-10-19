const {
  commands,
  Position,
  languages,
  workspace,
  TextEdit
} = require('vscode');

function activate(context) {
  workspace.onWillSaveTextDocument(event => {
    if (isLineAComment(event.document.lineAt(0).text)) return;

    event.waitUntil(prependFileHeader());
  });
}

exports.activate = activate;
exports.deactivate = function () {};

function prependFileHeader() {
  return Promise.resolve([TextEdit.insert(new Position(0, 0), `//Test String \n`)])
}

function isLineAComment(textContent) {
  const re = /(^\/\/)|(^\/\*)/g;
  return !!textContent.trim().match(re);
}