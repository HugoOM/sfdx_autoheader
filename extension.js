const {
  commands,
  Position,
  languages,
  workspace
} = require('vscode');

function activate(context) {
  let injectFileHeader = commands.registerTextEditorCommand(
    'extension.injectFileHeader',
    (textEditor, textEditorEdit) => prependFileHeader(textEditor, textEditorEdit)
  )
  context.subscriptions.push(injectFileHeader);

  workspace.onWillSaveTextDocument(() => {
    commands.executeCommand('extension.injectFileHeader');
  });
}

exports.activate = activate;
exports.deactivate = function () {};

function prependFileHeader(textEditor, textEditorEdit) {
  let firstLine = textEditor.document.lineAt(0);

  if (isLineAComment(firstLine.text)) return;

  //TODO: Make into a TextEdit for pre-save sync chaining
  textEditorEdit.insert(new Position(0, 0), `//Test String \n`);
}

function isLineAComment(textContent) {
  const re = /(^\/\/)|(^\/\*)/g;
  return !!textContent.trim().match(re);
}