const {
  Position,
  workspace,
  TextEdit,
  Range
} = require('vscode');

const defaultTemplate = require('./templates/default_cls.js')

function activate(context) {
  const preSaveHookListener = workspace.onWillSaveTextDocument(event => {
    if (!isLanguageSFDC(event.document)) return;

    if (isLineABlockComment(event.document.lineAt(0).text))
      event.waitUntil(updateHeaderValues(event.document));
    else
      event.waitUntil(prependFileHeader(event.document));
  })

  context.subscriptions.push(preSaveHookListener);
}

exports.activate = activate;
exports.deactivate = function () {}

async function prependFileHeader(document) {
  return [
    TextEdit.insert(
      new Position(0, 0),
      defaultTemplate(
        document.fileName.split(/\/|\\/g).pop(),
        getConfiguredUsername(),
        getHeaderFormattedDateTime()
      )
    )
  ]
}

function isLineABlockComment(textContent) {
  const re = /^\/\*/g;
  return !!textContent.trim().match(re);
}

function isLanguageSFDC(document) {
  return document.languageId === "apex"
}

function getHeaderFormattedDateTime() {
  const currentDate = new Date(Date.now());
  return currentDate.toLocaleString()
}

function getConfiguredUsername() {
  const settingsUsername = workspace.getConfiguration().inspect('SFDX_Autoheader.username');
  return settingsUsername.globalValue || settingsUsername.defaultValue
}

function updateHeaderLastModifiedByAndDate(documentText) {
  return updateLastModifiedDateTime(updateLastModifiedBy(documentText))

  function updateLastModifiedBy(fileContent) {
    //! RegExp Lookbehind not supported in vscode runtime (It is based on ES5 specs)
    //https://github.com/Microsoft/vscode/issues/8635
    // const re = /(?<=\s*\*\s*@Last\s*Modified\s*by\s*:\s*).*$/gm;
    const re = /(\s*\*\s*@Last\s*Modified\s*by\s*:\s*).*$/gm;
    return fileContent.replace(re, `$1${getConfiguredUsername()}`)
  }

  function updateLastModifiedDateTime(fileContent) {
    // const re = /(?<=\s*\*\s*@Last\s*Modified\s*time\s*:\s*).*$/gm;
    const re = /(\s*\*\s*@Last\s*Modified\s*time\s*:\s*).*$/gm;
    return fileContent.replace(re, `$1${getHeaderFormattedDateTime()}`)
  }
}

function updateHeaderValues(document) {
  //* Find a way to get multiple TextEdit in the return Array and get them processed by waitUntil
  return [
    TextEdit.replace(
      getFullDocumentRange(document),
      updateHeaderLastModifiedByAndDate(document.getText())
    )
  ]
}

//* Find a way to select and replace ONLY the Header instead of the whole file
function getFullDocumentRange(document) {
  return new Range(new Position(0, 0), new Position(document.lineCount, Number.MAX_SAFE_INTEGER))
}