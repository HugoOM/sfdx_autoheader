import FileDocumenter from "./extension/file_documenter";
import MethodDocumenter from "./extension/method_documenter";
import { ExtensionContext, commands } from "vscode";

exports.activate = function(
  context: ExtensionContext
): { fileDocumenter: FileDocumenter; methodDocumenter: MethodDocumenter } {
  const fileDocumenter = new FileDocumenter(context);
  const methodDocumenter = new MethodDocumenter();

  console.log("Salesforce Documenter - Extension Activated");

  commands.registerCommand(
    "extension.generateMethodHeader",
    methodDocumenter.generateMethodHeader
  );

  return { fileDocumenter, methodDocumenter };
};

exports.deactivate = function() {};
