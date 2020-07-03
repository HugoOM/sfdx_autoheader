const { assert } = require("chai");

const {
  workspace,
  Position,
  WorkspaceEdit,
  TextEdit,
  Range,
  extensions,
  window,
  Selection,
} = require("vscode");

const path = require("path");

suite("Salesforce Documenter - Extension Suite", function () {
  this.timeout(0);

  let fileDocumenter, methodDocumenter;

  suiteSetup(function (done) {
    loadExtension().then((api) => {
      ({ fileDocumenter, methodDocumenter } = api);
      done();
    });
  });

  test("Testing PreSaveListener - Apex Positive", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");
  });

  test("Testing PreSaveListener - Visualforce Positive", async () => {
    const document = await openTestDocumentByFileIdentifier("page");

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");
  });

  test("Testing PreSaveListener - Lightning Aura Component Positive (Default)", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");

    await clearFile(document);

    assert.strictEqual(document.getText(), "");

    await document.save();

    assert.notEqual(document.getText(), "");
  });

  test("Testing PreSaveListener - Lightning Aura JavaScript Positive", async function () {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);

    await docConfigs.update("EnableForLightningJavascript", true, 1);

    await clearFile(document);

    assert.isEmpty(document.getText());
    assert.isTrue(document.isDirty);

    await document.save();

    assert.isNotEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PreSaveListener - Lightning Aura JavaScript Negative (Default)", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);

    await docConfigs.update("EnableForLightningJavascript", false, 1);

    await clearFile(document);

    assert.isEmpty(document.getText());
    assert.isTrue(document.isDirty);

    await document.save();

    assert.isEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PreSaveListener - Lightning LWC JavaScript Positive", async () => {
    const document = await openTestDocumentByFileIdentifier("js");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);

    await docConfigs.update("EnableForLightningJavascript", true, 1);

    await clearFile(document);

    assert.isEmpty(document.getText());
    assert.isTrue(document.isDirty);

    await document.save();

    assert.isNotEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PreSaveListener - Lightning LWC JavaScript Negative", async () => {
    const document = await openTestDocumentByFileIdentifier("js");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);

    await docConfigs.update("EnableForLightningJavascript", false, 1);

    await clearFile(document);

    assert.isEmpty(document.getText());
    assert.isTrue(document.isDirty);

    await document.save();

    assert.isEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PreSaveListener - Lightning LWC Markup Positive", async () => {
    const document = await openTestDocumentByFileIdentifier("html");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);

    await docConfigs.update("EnableForLightningMarkup", true, 1);

    await clearFile(document);

    assert.isEmpty(document.getText());
    assert.isTrue(document.isDirty);

    await document.save();

    assert.isNotEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PreSaveListener - Lightning LWC Markup Negative", async () => {
    const document = await openTestDocumentByFileIdentifier("html");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);

    await docConfigs.update("EnableForLightningMarkup", false, 1);

    await clearFile(document);

    assert.isEmpty(document.getText());
    assert.isTrue(document.isDirty);

    await document.save();

    assert.isEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PreSaveListener - Negative", async () => {
    const document = await openTestDocumentByFileIdentifier("java");

    await clearFile(document);

    assert.isEmpty(document.getText());

    await document.save();

    assert.isEmpty(document.getText());

    await resetTestFile(document);

    await document.save();
  });

  test("Testing PostSaveListener - Cursor Reset", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");
    const edit = new WorkspaceEdit();
    const initialCursorSelection = new Selection(14, 12, 14, 12);

    edit.insert(
      document.uri,
      getEOFPosition(document),
      `public class testContent {
  //Cursor Position Test
}`
    );

    edit.set(edit);

    await workspace.applyEdit(edit);

    window.activeTextEditor.selection = initialCursorSelection;

    await document.save();

    assert.deepEqual(initialCursorSelection, window.activeTextEditor.selection);
  });

  test("Testing getInsertFileHeaderEdit - Javalike", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");

    const insertFileHeaderEdit = await fileDocumenter.getInsertFileHeaderEdit(
      document
    );

    assert.exists(insertFileHeaderEdit);
    assert.notEqual(insertFileHeaderEdit.newText, "");
    assert.strictEqual(document.lineAt(0).text, "/**");
  });

  test("Testing getInsertFileHeaderEdit - Markup", async () => {
    const document = await openTestDocumentByFileIdentifier("page");

    const insertFileHeaderEdit = await fileDocumenter.getInsertFileHeaderEdit(
      document
    );

    assert.exists(insertFileHeaderEdit);
    assert.notEqual(insertFileHeaderEdit.newText, "");
    assert.strictEqual(document.lineAt(0).text, "<!--");
  });

  test("Testing isLineABlockComment", (done) => {
    const blockCommentString = `/* 
    * Block Comment 
    */`;
    const singleCommentString = "// Single Comment";
    const notACommentString = "HugoOM";

    assert.isTrue(fileDocumenter.isLineABlockComment(blockCommentString));
    assert.isFalse(fileDocumenter.isLineABlockComment(singleCommentString));
    assert.isFalse(fileDocumenter.isLineABlockComment(notACommentString));

    done();
  });

  test("Testing isLineAnXMLComment", (done) => {
    const xmlCommentString = `<!--
     Block Comment 
    -->`;
    const blockCommentString = "/* blockComment */";
    const notACommentString = "HugoOM";

    assert.isTrue(fileDocumenter.isLineAnXMLComment(xmlCommentString));
    assert.isFalse(fileDocumenter.isLineAnXMLComment(blockCommentString));
    assert.isFalse(fileDocumenter.isLineAnXMLComment(notACommentString));

    done();
  });

  test("Testing isValidLanguage - Apex Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForApex", false, 1);

    assert.isFalse(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Apex Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForApex", true, 1);

    assert.isTrue(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Visalforce Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("page");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForVisualforce", false, 1);

    assert.isFalse(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Visalforce Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("page");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForVisualforce", true, 1);

    assert.isTrue(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning Component Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForLightningMarkup", false, 1);

    assert.isFalse(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning Component Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForLightningMarkup", true, 1);

    assert.isTrue(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning JavaScript Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForLightningJavascript", false, 1);

    assert.isFalse(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning JavaScript Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration("SFDoc", document.uri);
    await docConfigs.update("EnableForLightningJavascript", true, 1);

    assert.isTrue(fileDocumenter.isValidLanguage(document));
  });

  test("Testing isLightning - Invalid File", async () => {
    const document = await openTestDocumentByFileIdentifier("java");

    assert.isFalse(fileDocumenter.isLightning(document));
  });

  test("Testing isLightning - Lightning Component", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");

    assert.isTrue(fileDocumenter.isLightning(document));
  });

  test("Testing isLightning - Lightning Controller", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");

    assert.isTrue(fileDocumenter.isLightning(document));
  });

  // FIXME: Update to check content from a file
  // test("Testing checkForHeader", async done => {
  //   const blockComment = "/*";
  //   const xmlComment = "<!--";
  //   const notAComment = "abc";

  //   const document = await openTestDocumentByFileIdentifier("apex");

  //   assert.isTrue(fileDocumenter.isHeaderPresentOnDoc(blockComment));

  //   assert.isTrue(fileDocumenter.isHeaderPresentOnDoc(xmlComment));

  //   assert.isFalse(fileDocumenter.isHeaderPresentOnDoc(notAComment));

  //   done();
  // });

  // FIXME: Fix ...
  // test("Testing getLastSavedCursorPosition", done => {
  //   const testPosition = new Position(15, 15);
  //   fileDocumenter.cursorPosition = testPosition;
  //   // fileDocumenter.isHeaderExistsOnFile = true;

  //   assert.deepEqual(testPosition, fileDocumenter.getLastSavedCursorPosition());

  //   assert.equal(
  //     testPosition.line + fileDocumenter.HEADER_LENGTH_LINES,
  //     fileDocumenter.getLastSavedCursorPosition().line
  //   );

  //   done();
  // });

  test("Testing getUpdateHeaderValueEdit", async () => {
    // const document = await openTestDocumentByFileIdentifier("apex");
    // await clearFile(document);
    // assert.strictEqual(document.getText(), "");
    // await document.save();
    // assert.notEqual(document.getText(), "");
    // const preUpdateHeader = document.getText();
    // await wait(2000);
    // await clearFile(document);
    // await document.save();
    // const postUpdateHeader = document.getText();
    // assert.notStrictEqual(postUpdateHeader, preUpdateHeader);
  });

  test("Testing updateHeaderLastModifiedByAndDate", (done) => {
    // const testHeaderInitial = `/**
    //  * @Description        :
    //  * @Author             :
    //  * @Group              :
    //  * @Last Modified By   : hi@hugo.dev
    //  * @Last Modified On   : 2019-02-27, 10:42:33 p.m.
    //  * @Modification Log   :
    //  * Ver       	   Date           Author      		   Modification
    //  **/`;
    // const lastModByRegex = /^(\s*\*\s*@Last\s*Modified\s*By\s*:).*/gm;
    // const lastModOnRegex = /^(\s*\*\s*@Last\s*Modified\s*On\s*:).*/gm;
    // const testHeaderUpdated = fileDocumenter.updateHeaderLastModifiedByAndDate(
    //   testHeaderInitial
    // );

    // assert.notStrictEqual(
    //   testHeaderUpdated.match(lastModByRegex).pop(),
    //   testHeaderInitial.match(lastModByRegex).pop()
    // );
    // assert.notStrictEqual(
    //   testHeaderUpdated.match(lastModOnRegex).pop(),
    //   testHeaderInitial.match(lastModOnRegex).pop()
    // );

    done();
  });

  test("Testing updateLastModifiedBy", (done) => {
    const testModByString = "* @Last Modified By: NotHugoOM@GitHub.com";
    assert.notStrictEqual(
      fileDocumenter.updateLastModifiedBy(testModByString),
      testModByString
    );
    done();
  });

  test("Testing updateLastModifiedDateTime", (done) => {
    const testModOnString = "* @Last Modified On: 02/02/2222 22:22";
    assert.notStrictEqual(
      fileDocumenter.updateLastModifiedDate(testModOnString),
      testModOnString
    );
    done();
  });

  test("Testing getFullDocumentRange", async () => {
    /* Single VSCode package functionality */
    const document = await openTestDocumentByFileIdentifier("apex");
    const testRange = fileDocumenter.getFullDocumentRange(document);
    assert.equal(testRange.end.line, document.lineCount);
    return;
  });

  /* -- Method Documenter Tests -- */
  // test("Testing Insert Method Header From Command", done => {
  //   // TODO: Implement
  //   const doc = openTestDocumentByFileIdentifier("apex");

  //   methodDocumenter.insertMethodHeaderFromCommand();

  //   done();
  // });
});

function wait(timeToWaitInMS) {
  return new Promise((resolve) => setTimeout(resolve, timeToWaitInMS));
}

async function openTestDocumentByFileIdentifier(ext) {
  const fileIdentifierAssociation = {
    apex: "testFile_SFDXAutoheader.apex",
    page: "testFile_SFDXAutoheader.page",
    cmp: "aura/testFile_SFDXAutoheader/testFile_SFDXAutoheader.cmp",
    java: "testFile_SFDXAutoheader.java",
    jsCtrl: "aura/testFile_SFDXAutoheader/testFile_SFDXAutoheaderController.js",
    js: "lwc/testFile_SFDXAutoheader/testFile_SFDXAutoheader.js",
    html: "lwc/testFile_SFDXAutoheader/testFile_SFDXAutoheader.html",
  };

  const doc = await workspace.openTextDocument(
    path.join(
      __dirname,
      "../../test_files/",
      "testFile_SFDXAutoheader",
      fileIdentifierAssociation[ext]
    )
  );

  await window.showTextDocument(doc);

  return doc;
}

function loadExtension() {
  const testExt = extensions.getExtension("HugoOM.sfdx-autoheader");

  if (testExt.isActive) return Promise.resolve(testExt.exports);

  return testExt.activate();
}

async function clearFile(document) {
  const wEdit = new WorkspaceEdit();

  wEdit.set(document.uri, [TextEdit.delete(new Range(0, 0, 100, 100))]);

  return workspace.applyEdit(wEdit);
}

async function resetTestFile(document) {
  await clearFile(document);

  const edit = new WorkspaceEdit();

  edit.insert(
    document.uri,
    new Position(0, 0),
    `({
  test: function(cmp, evt, helper) {
    //This Is A Test File
  }
})`
  );

  edit.set(edit);

  return workspace.applyEdit(edit);
}

function getEOFPosition(document) {
  const lastLineNumber = document.lineCount - 1;
  const lastLineLastChar = document.lineAt(lastLineNumber).length - 1;

  return new Position(lastLineNumber, lastLineLastChar);
}
