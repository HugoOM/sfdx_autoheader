import FileDocumenter from "./extension/documenter.file";
import MethodDocumenter from "./extension/documenter.method";
import { ExtensionContext, commands } from "vscode";

exports.activate = function(
  context: ExtensionContext
): { fileDocumenter: FileDocumenter; methodDocumenter: MethodDocumenter } {
  const fileDocumenter = new FileDocumenter(context);
  const methodDocumenter = new MethodDocumenter();

  console.log("Salesforce Documenter - Extension Activated");

  commands.registerCommand(
    "extension.generateMethodHeader",
    methodDocumenter.getMethodHeaderInsertEdit,
    methodDocumenter
  );

  return { fileDocumenter, methodDocumenter };
};

exports.deactivate = function() {};
