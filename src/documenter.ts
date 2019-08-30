import FileDocumenter from "./extension/documenter.file";
import MethodDocumenter from "./extension/documenter.method";
import DocumenterCommands from "./extension/documenter.commands";
import { ExtensionContext } from "vscode";

exports.activate = function(
  context: ExtensionContext
): { fileDocumenter: FileDocumenter; methodDocumenter: MethodDocumenter } {
  const fileDocumenter = new FileDocumenter(context);
  const methodDocumenter = new MethodDocumenter();
  new DocumenterCommands(methodDocumenter, fileDocumenter);

  return { fileDocumenter, methodDocumenter };
};

exports.deactivate = function() {};
