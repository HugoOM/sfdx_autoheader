// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
// const {
//   commands,
//   Position,
//   languages
// } = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "sfdx-autoheader" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  // let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
  //     // The code you place here will be executed every time your command is executed

  //     // Display a message box to the user
  //     vscode.window.showInformationMessage('Hello World!');
  // });

  let injectFileHeader = vscode.commands.registerTextEditorCommand(
    'extension.injectFileHeader',
    (textEditor, textEditorEdit) => {
      // let documentInitialPosition = new vscode.Position(1, 1);
      // let textContent = textEditor.document.getText(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, Number.MAX_SAFE_INTEGER)));

      vscode.workspace.onWillSaveTextDocument;

      debugger;

      let firstLine = textEditor.document.lineAt(0);

      if (lineIsComment(firstLine.text)) return;

      // vscode.languages.getLanguages().then(res => {
      //   debugger;
      // })

      textEditorEdit.insert(new vscode.Position(1, 1), `/*Test String`);
    })

  context.subscriptions.push(injectFileHeader);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;

function lineIsComment(textContent) {
  const re = /(^\/\/)|(^\/\*)/g;
  return !!textContent.trim().match(re);
}

// let saveEventListener = function (event) {}