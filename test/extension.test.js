const {
  assert
} = require('chai');

const {
  Extension,
  deactivate
} = require('../extension');

const ext = new Extension();

const {
  workspace,
  TextEdit,
  Position,
  WorkspaceEdit,
  Range
} = require('vscode');

const path = require('path');

suite("Extension Tests", function () {

  test('Testing PreSaveListener',
    done => {
      workspace.openTextDocument(path.join(__dirname, 'test_files', 'testFile_Apex.apex'))
        .then(async document => {
          const edit = new WorkspaceEdit();

          edit.delete(
            document.uri,
            new Range(
              new Position(0, 0),
              new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
            )
          );

          edit.set(edit);

          await workspace.applyEdit(edit);

          assert.strictEqual(document.getText(), "");

          await document.save();

          assert.notEqual(document.getText(), "");

          done();
        })
    })
});