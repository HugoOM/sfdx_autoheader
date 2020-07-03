import { commands } from "vscode";
import FileDocumenter from "./documenter.file";
import MethodDocumenter from "./documenter.method";

export default class DocumenterCommands {
  constructor(
    private methodDocumenter: MethodDocumenter,
    private fileDocumenter: FileDocumenter
  ) {
    commands.registerTextEditorCommand(
      "extension.insertApexMethodHeader",
      this.methodDocumenter.insertMethodHeaderFromCommand,
      this.methodDocumenter
    );

    commands.registerTextEditorCommand(
      "extension.insertFileHeader",
      this.fileDocumenter.insertFileHeaderFromCommand,
      this.fileDocumenter
    );
  }
}
