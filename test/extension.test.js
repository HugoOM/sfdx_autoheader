//TODO Improve tests to validate header content instead of simply it's presence

const {
  assert
} = require("chai");

const {
  Extension
} = require("../extension");

const ext = new Extension();

const {
  workspace,
  Position,
  WorkspaceEdit,
  Range,
  extensions,
  window,
  Selection
} = require("vscode");

const path = require("path");

suite("Extension Tests", function () {
  this.timeout(10000);

  test("Testing PreSaveListener - Apex Positive", async () => {
    const document = await openTestDocumentByFileExt('apex');

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");

    return;
  });

  test("Testing PreSaveListener - Visualforce Positive", async () => {
    const document = await openTestDocumentByFileExt('page');

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");

    return;
  });

  test("Testing PreSaveListener - Negative", async () => {
    const document = await openTestDocumentByFileExt('js');

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.strictEqual(document.getText(), "");

    await resetJSTestFile(document);

    await document.save();

    return;
  })

  test("Testing PostSaveListener", async () => {
    const document = await openTestDocumentByFileExt('apex');
  })

  test("Testing getInsertFileHeaderEdit", async () => {
    const document = await openTestDocumentByFileExt('apex');

    const insertFileHeaderEdit =
      await ext.getInsertFileHeaderEdit(document);

    assert.exists(insertFileHeaderEdit);
    assert.notEqual(insertFileHeaderEdit.newText, "");

    //TODO Test for content for both Apex and Visualforce

    return;
  })

  test("Testing isLineABlockComment", done => {
    const blockCommentString =
      `/* 
    * Block Comment 
    */`;
    const singleCommentString = '// Single Comment';
    const notACommentString = 'HugoOM';

    assert.isTrue(ext.isLineABlockComment(blockCommentString));
    assert.isFalse(ext.isLineABlockComment(singleCommentString));
    assert.isFalse(ext.isLineABlockComment(notACommentString));

    done();
  })

  test("Testing isLineAnXMLComment", done => {
    const xmlCommentString =
      `<!--
     Block Comment 
    -->`;
    const blockCommentString = '/* blockComment */';
    const notACommentString = 'HugoOM';

    assert.isTrue(ext.isLineAnXMLComment(xmlCommentString));
    assert.isFalse(ext.isLineAnXMLComment(blockCommentString));
    assert.isFalse(ext.isLineAnXMLComment(notACommentString));

    done();
  })

  test("Testing isLanguageSFDC", done => {
    const sfdcLanguageIdApex = 'apex';
    const sfdcLanguageIdVisualforce = 'visualforce';
    const languageIdJS = 'JavaScript';

    assert.isTrue(ext.isLanguageSFDC(sfdcLanguageIdApex));
    assert.isTrue(ext.isLanguageSFDC(sfdcLanguageIdVisualforce));
    assert.isFalse(ext.isLanguageSFDC(languageIdJS));

    done();
  })

  test("Testing getHeaderFormattedDateTime", done => {
    assert.isString(ext.getHeaderFormattedDateTime());
    done();
  })

  test("Testing getConfiguredUsername", done => {
    /* Single VSCode package functionality, simply test that 
         a value is returned and/or that default is leveraged from config */
    assert.isString(ext.getConfiguredUsername());
    done();
  })

  test("Testing getUpdateHeaderValueEdit", async () => {
    const document = await openTestDocumentByFileExt('apex');

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");

    const preUpdateHeader = document.getText();

    await wait(2000);

    await clearFile(document);

    await document.save();

    const postUpdateHeader = document.getText();

    assert.notStrictEqual(postUpdateHeader, preUpdateHeader);

    return;
  })

  test("Testing updateHeaderLastModifiedByAndDate", done => {
    const testHeaderInitial = `/**
     * @File Name          :
     * @Description        : 
     * @Author             : 
     * @Group              : 
     * @Last Modified By   : 
     * @Last Modified On   : 
     * @Modification Log   : 
     *------------------------------------------------------------------------------
     * Ver       	   Date           Author      		   Modification
     *------------------------------------------------------------------------------
     **/`
    const lastModByRegex = /^(\s*\*\s*@Last\s*Modified\s*By\s*:).*/gm;
    const lastModOnRegex = /^(\s*\*\s*@Last\s*Modified\s*On\s*:).*/gm;
    const testHeaderUpdated = ext.updateHeaderLastModifiedByAndDate(testHeaderInitial);

    assert.notStrictEqual(testHeaderUpdated.match(lastModByRegex).pop(), testHeaderInitial.match(lastModByRegex).pop())
    assert.notStrictEqual(testHeaderUpdated.match(lastModOnRegex).pop(), testHeaderInitial.match(lastModOnRegex).pop())

    done();
  })

  test("Testing updateLastModifiedBy", done => {
    const testModByString = '* @Last Modified By: HugoOM@GitHub.com';
    assert.notStrictEqual(ext.updateLastModifiedBy(testModByString), testModByString);
    done();
  })

  test("Testing updateLastModifiedDateTime", done => {
    const testModOnString = '* @Last Modified On: 02/02/2222 22:22';
    assert.notStrictEqual(ext.updateLastModifiedDateTime(testModOnString), testModOnString);
    done();
  })

  test("Testing getFullDocumentRange", async () => {
    /* Single VSCode package functionality */
    const document = await openTestDocumentByFileExt('apex');
    const testRange = ext.getFullDocumentRange(document);
    assert.equal(testRange.end.line, document.lineCount);
    return;
  })
});

function wait(timeToWaitInMS) {
  return new Promise(resolve => setTimeout(resolve, timeToWaitInMS))
}

async function openTestDocumentByFileExt(ext) {
  await loadExtension();

  const doc = await workspace.openTextDocument(
    path.join(
      __dirname,
      "test_files",
      `testFile_SFDXAutoheader.${ext}`
    )
  );

  await window.showTextDocument(doc);

  return doc;
}

function loadExtension() {
  const testExt = extensions.getExtension("HugoOM.sfdx-autoheader");
  return testExt.activate();
}

async function clearFile(document) {
  const edit = new WorkspaceEdit();

  edit.delete(
    document.uri,
    new Range(
      new Position(0, 0),
      new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
    )
  );

  edit.set(edit);

  return workspace.applyEdit(edit);
}

async function resetJSTestFile(document) {
  const edit = new WorkspaceEdit();

  edit.insert(
    document.uri,
    new Position(0, 0),
    '// Test Javascript File'
  );

  edit.set(edit);

  return workspace.applyEdit(edit);
}