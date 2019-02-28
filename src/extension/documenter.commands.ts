import FileDocumenter from "./documenter.file";
import MethodDocumenter from "./documenter.method";
import { commands, window, TextEditor, TextEditorEdit, Position } from "vscode";

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

    commands.registerTextEditorCommand(
      "extension.insertFileHeader",
      this.insertFileHeader,
      this
    );
  }

  insertFileHeader(editor: TextEditor, edit: TextEditorEdit) {
    if (!this.fileDocumenter.isValidLanguageOnRequest(editor.document)) {
      window.showErrorMessage("SFDoc: Unsupported file type and/or language");
      return;
    }

    if (this.fileDocumenter.checkForHeaderOnDoc(editor.document)) {
      window.showErrorMessage(
        "SFDoc: Header already present on file's first line"
      );
      return;
    }

    edit.insert(
      new Position(0, 0),
      this.fileDocumenter.getFileHeader(editor.document)
    );
  }
}
