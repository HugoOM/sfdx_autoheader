import FileDocumenter from "./documenter.file";
import MethodDocumenter from "./documenter.method";
import { commands, window, workspace, WorkspaceEdit } from "vscode";

export default class DocumenterCommands {
  constructor(
    private methodDocumenter: MethodDocumenter,
    private fileDocumenter: FileDocumenter
  ) {
    commands.registerCommand(
      "extension.generateMethodHeader",
      this.methodDocumenter.getMethodHeaderInsertEdit,
      this.methodDocumenter
    );

    commands.registerCommand(
      "extension.insertFileHeader",
      this.insertFileHeader,
      this
    );
  }

  // TODO: Manage messages through header
  insertFileHeader() {
    if (!window.activeTextEditor) return;
    const document = window.activeTextEditor.document;

    if (!this.fileDocumenter.isValidLanguage(document)) return;

    this.fileDocumenter.getInsertFileHeaderEdit(document).then(edits => {
      const edit: WorkspaceEdit = new WorkspaceEdit();
      edit.set(document.uri, edits);
      workspace.applyEdit(edit);
    });
  }
}
