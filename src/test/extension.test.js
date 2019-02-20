//TODO Improve tests to validate header content instead of simply it's presence

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
  Uri
} = require("vscode");

const path = require("path");

suite("Salesforce Documenter - Extension Suite", function() {
  this.timeout(60000);

  let ext;

  suiteSetup(function(done) {
    loadExtension().then(function(api) {
      ext = api;
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

  test("Testing PreSaveListener - Lightning Aura JavaScript Positive", async function() {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );

    await docConfigs.update("EnableForAllWebFiles", false, 1);
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
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );

    await docConfigs.update("EnableForAllWebFiles", false, 1);
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
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );

    await docConfigs.update("EnableForAllWebFiles", false, 1);
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
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );

    await docConfigs.update("EnableForAllWebFiles", false, 1);
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
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );

    await docConfigs.update("EnableForAllWebFiles", false, 1);
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
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );

    await docConfigs.update("EnableForAllWebFiles", false, 1);
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

    const insertFileHeaderEdit = await ext.getInsertFileHeaderEdit(document);

    assert.exists(insertFileHeaderEdit);
    assert.notEqual(insertFileHeaderEdit.newText, "");
    assert.strictEqual(document.lineAt(0).text, "/**");
  });

  test("Testing getInsertFileHeaderEdit - Markup", async () => {
    const document = await openTestDocumentByFileIdentifier("page");

    const insertFileHeaderEdit = await ext.getInsertFileHeaderEdit(document);

    assert.exists(insertFileHeaderEdit);
    assert.notEqual(insertFileHeaderEdit.newText, "");
    assert.strictEqual(document.lineAt(0).text, "<!--");
  });

  test("Testing isLineABlockComment", done => {
    const blockCommentString = `/* 
    * Block Comment 
    */`;
    const singleCommentString = "// Single Comment";
    const notACommentString = "HugoOM";

    assert.isTrue(ext.isLineABlockComment(blockCommentString));
    assert.isFalse(ext.isLineABlockComment(singleCommentString));
    assert.isFalse(ext.isLineABlockComment(notACommentString));

    done();
  });

  test("Testing isLineAnXMLComment", done => {
    const xmlCommentString = `<!--
     Block Comment 
    -->`;
    const blockCommentString = "/* blockComment */";
    const notACommentString = "HugoOM";

    assert.isTrue(ext.isLineAnXMLComment(xmlCommentString));
    assert.isFalse(ext.isLineAnXMLComment(blockCommentString));
    assert.isFalse(ext.isLineAnXMLComment(notACommentString));

    done();
  });

  test("Testing isValidLanguage - Apex Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForApex", false, 1);

    assert.isFalse(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Apex Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForApex", true, 1);

    assert.isTrue(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Visalforce Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("page");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForVisualforce", false, 1);

    assert.isFalse(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Visalforce Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("page");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForVisualforce", true, 1);

    assert.isTrue(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning Component Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningMarkup", false, 1);

    assert.isFalse(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning Component Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningMarkup", true, 1);

    assert.isTrue(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning JavaScript Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningJavascript", false, 1);

    assert.isFalse(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning JavaScript Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningJavascript", true, 1);

    assert.isTrue(ext.isValidLanguage(document));
  });

  test("Testing isValidLanguage - Lightning Component Web Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningMarkup", false, 1);
    await docConfigs.update("EnableForLightningJavascript", false, 1);
    await docConfigs.update("EnableForAllWebFiles", true, 1);

    assert.isTrue(ext.isValidLanguage(document));

    await docConfigs.update("EnableForLightningMarkup", true, 1);
    await docConfigs.update("EnableForLightningJavascript", true, 1);
    await docConfigs.update("EnableForAllWebFiles", false, 1);
  });

  test("Testing isValidLanguage - Lightning JavaScript Web Setting On", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningMarkup", false, 1);
    await docConfigs.update("EnableForLightningJavascript", false, 1);
    await docConfigs.update("EnableForAllWebFiles", true, 1);

    assert.isTrue(ext.isValidLanguage(document));

    await docConfigs.update("EnableForLightningMarkup", true, 1);
    await docConfigs.update("EnableForLightningJavascript", true, 1);
    await docConfigs.update("EnableForAllWebFiles", false, 1);
  });

  test("Testing isValidLanguage - Lightning Component Web Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningMarkup", false, 1);
    await docConfigs.update("EnableForLightningJavascript", false, 1);
    await docConfigs.update("EnableForAllWebFiles", false, 1);

    assert.isFalse(ext.isValidLanguage(document));

    await docConfigs.update("EnableForLightningMarkup", true, 1);
    await docConfigs.update("EnableForLightningJavascript", true, 1);
  });

  test("Testing isValidLanguage - Lightning JavaScript Web Setting Off", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");
    const docConfigs = await workspace.getConfiguration(
      "SFDX_Autoheader",
      document.uri
    );
    await docConfigs.update("EnableForLightningMarkup", false, 1);
    await docConfigs.update("EnableForLightningJavascript", false, 1);
    await docConfigs.update("EnableForAllWebFiles", false, 1);

    assert.isFalse(ext.isValidLanguage(document));

    await docConfigs.update("EnableForLightningMarkup", true, 1);
    await docConfigs.update("EnableForLightningJavascript", true, 1);
  });

  test("Testing isLightning - Invalid File", async () => {
    const document = await openTestDocumentByFileIdentifier("java");

    assert.isFalse(ext.isLightning(document));
  });

  test("Testing isLightning - Lightning Component", async () => {
    const document = await openTestDocumentByFileIdentifier("cmp");

    assert.isTrue(ext.isLightning(document));
  });

  test("Testing isLightning - Lightning Controller", async () => {
    const document = await openTestDocumentByFileIdentifier("jsCtrl");

    assert.isTrue(ext.isLightning(document));

    //TODO Test for Helper & Invalid JS File
  });

  /* Update following rework
    test("Testing checkForHeader", done => {
      const blockComment = "/*";
      const xmlComment = "<!--";
      const notAComment = "abc";
  
      ext.checkForHeader(blockComment);
      assert.isTrue(ext.isHeaderExistsOnFile);
  
      ext.checkForHeader(xmlComment);
      assert.isTrue(ext.isHeaderExistsOnFile);
  
      ext.checkForHeader(notAComment);
      assert.isFalse(ext.isHeaderExistsOnFile);
  
      done();
    });
  
    test("Testing getLastSavedCursorPosition", done => {
      const testPosition = new Position(15, 15);
      ext.cursorPosition = testPosition;
      ext.isHeaderExistsOnFile = true;
  
      assert.deepEqual(testPosition, ext.getLastSavedCursorPosition());
  
      ext.isHeaderExistsOnFile = false;
  
      assert.equal(
        testPosition.line + ext.HEADER_LENGTH_LINES,
        ext.getLastSavedCursorPosition().line
      );
  
      done();
    });
    */

  test("Testing getHeaderFormattedDateTime", done => {
    assert.isString(ext.getHeaderFormattedDateTime());
    done();
  });

  test("Testing getConfiguredUsername", done => {
    /* Single VSCode package functionality, simply test that 
           a value is returned and/or that default is leveraged from config */
    assert.isString(ext.getConfiguredUsername());
    done();
  });

  test("Testing getUpdateHeaderValueEdit", async () => {
    const document = await openTestDocumentByFileIdentifier("apex");

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
  });

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
     **/`;
    const lastModByRegex = /^(\s*\*\s*@Last\s*Modified\s*By\s*:).*/gm;
    const lastModOnRegex = /^(\s*\*\s*@Last\s*Modified\s*On\s*:).*/gm;
    const testHeaderUpdated = ext.updateHeaderLastModifiedByAndDate(
      testHeaderInitial
    );

    assert.notStrictEqual(
      testHeaderUpdated.match(lastModByRegex).pop(),
      testHeaderInitial.match(lastModByRegex).pop()
    );
    assert.notStrictEqual(
      testHeaderUpdated.match(lastModOnRegex).pop(),
      testHeaderInitial.match(lastModOnRegex).pop()
    );

    done();
  });

  test("Testing updateLastModifiedBy", done => {
    const testModByString = "* @Last Modified By: NotHugoOM@GitHub.com";
    assert.notStrictEqual(
      ext.updateLastModifiedBy(testModByString),
      testModByString
    );
    done();
  });

  test("Testing updateLastModifiedDateTime", done => {
    const testModOnString = "* @Last Modified On: 02/02/2222 22:22";
    assert.notStrictEqual(
      ext.updateLastModifiedDateTime(testModOnString),
      testModOnString
    );
    done();
  });

  test("Testing getFullDocumentRange", async () => {
    /* Single VSCode package functionality */
    const document = await openTestDocumentByFileIdentifier("apex");
    const testRange = ext.getFullDocumentRange(document);
    assert.equal(testRange.end.line, document.lineCount);
    return;
  });
});

function wait(timeToWaitInMS) {
  return new Promise(resolve => setTimeout(resolve, timeToWaitInMS));
}

async function openTestDocumentByFileIdentifier(ext) {
  const fileIdentifierAssociation = {
    apex: "testFile_SFDXAutoheader.apex",
    page: "testFile_SFDXAutoheader.page",
    cmp: "aura/testFile_SFDXAutoheader/testFile_SFDXAutoheader.cmp",
    java: "testFile_SFDXAutoheader.java",
    jsCtrl: "aura/testFile_SFDXAutoheader/testFile_SFDXAutoheaderController.js",
    js: "lwc/testFile_SFDXAutoheader/testFile_SFDXAutoheader.js",
    html: "lwc/testFile_SFDXAutoheader/testFile_SFDXAutoheader.html"
  };

  // await loadExtension();

  await workspace.updateWorkspaceFolders(0, 0, {
    name: "testFile_SFDXAutoheader",
    uri: Uri.file(
      path.join(__dirname, "../../test_files/", "testFile_SFDXAutoheader")
    )
  });

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

async function loadExtension() {
  const testExt = extensions.getExtension("HugoOM.sfdx-autoheader");

  return await testExt.activate();
}

async function clearFile(document) {
  const wEdit = new WorkspaceEdit();

  wEdit.set(document.uri, [TextEdit.delete(new Range(0, 0, 100, 100))]);

  await workspace.applyEdit(wEdit);

  //! Hack since workspace.applyEdit(...) seems to resolve too early
  return wait(2000);
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