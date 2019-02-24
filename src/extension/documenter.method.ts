import { window, WorkspaceEdit, Position, workspace } from "vscode";

type Method = {
  name: string;
  scope: string;
  isStatic: boolean;
  isOverride: boolean;
  parameters: string[];
  returnType: string;
};

import templates from "../templates/templates.method";

export default class MethodDocumenter {
  getMethodHeaderInsertEdit(): void {
    const methodHeader = this.constructMethodHeader();

    window.showInformationMessage("Injecting Header!");

    if (!methodHeader) return;
    if (!window.activeTextEditor) return;

    const methodPosition: Position = window.activeTextEditor.selection.anchor;

    const edit: WorkspaceEdit = new WorkspaceEdit();
    edit.insert(
      window.activeTextEditor.document.uri,
      new Position(methodPosition.line, 0),
      methodHeader
    );
    workspace.applyEdit(edit);
  }

  constructMethodHeader(): string | void {
    const method = this.parseSignatureIntoMethod();

    if (!method) return;

    if (!window.activeTextEditor) return;

    const str =
      templates.base() +
      templates.description() +
      templates.parameters(method.parameters) +
      templates.returnType(method.returnType) +
      templates.end();

    const indentation = window.activeTextEditor.document
      .lineAt(window.activeTextEditor.selection.anchor.line)
      .text.match(/^\s*/gi);

    return str.split(/\n/gim).reduce((lines: string, line: string) => {
      if (!line) return lines;

      return (lines += indentation + line + "\n");
    }, "\n");
  }

  parseSignatureIntoMethod(): Method | void {
    if (!window.activeTextEditor) return;

    const method: Method = {
      parameters: [],
      name: "",
      scope: "",
      returnType: "",
      isStatic: false,
      isOverride: false
    };

    const apexReservedTerms = [
      "public",
      "private",
      "protected",
      "global",
      "override",
      "static"
    ];

    const document = window.activeTextEditor.document;
    const re_methodDefinitionEnd = /\)/gi;
    let currentLineId = window.activeTextEditor.selection.anchor.line;

    let methodText = document.lineAt(currentLineId).text;
    while (!re_methodDefinitionEnd.test(methodText)) {
      if (currentLineId >= window.activeTextEditor.document.lineCount) return;

      methodText += document.lineAt(++currentLineId).text;
    }

    const re_ScopeModifier = /public|private|protected|global/i;
    const [methodSignature, methodParameters] = methodText.split("(");

    let signatureTokens = methodSignature
      .split(/\s+/)
      .filter((token: string) => token !== "");

    method.name = signatureTokens.pop() || "";

    method.scope =
      signatureTokens.find(token => re_ScopeModifier.test(token)) || "";

    method.returnType =
      signatureTokens.find(
        token => !apexReservedTerms.includes(token.toLowerCase())
      ) || "";

    method.isStatic = signatureTokens.some(
      (token: string) => token.toLowerCase() === "static"
    );

    method.isOverride = signatureTokens.some(
      (token: string) => token.toLowerCase() === "override"
    );

    method.parameters = getParametersAsTokens(methodParameters);

    return method;

    function getParametersAsTokens(parametersString: string): string[] {
      const tokens = parametersString
        .split(/\(|\)|,|<|>|\s|\{|\}/gi)
        .filter(token => !!token);

      const processedTokens: string[] = [];
      let currentIndex = -1;

      if (!tokens || !tokens.length) return processedTokens;

      while (currentIndex + 1 < tokens.length) {
        processedTokens.push(
          recursiveProcessToken(tokens[(currentIndex += 1)], false, false)
        );
      }

      return processedTokens
        .filter(token => token !== "")
        .map(token => token.trim());

      function recursiveProcessToken(
        token: string,
        isRoot: boolean,
        isWithinCollection: boolean
      ): string {
        let currentProcessedToken = "";

        if (!token) return currentProcessedToken;

        if (token.toLowerCase() === "map")
          currentProcessedToken = processMapToken(token, isWithinCollection);
        else if (
          token.toLowerCase() === "list" ||
          token.toLowerCase() === "set"
        )
          currentProcessedToken = processListOrMapToken(
            token,
            isWithinCollection
          );
        else if (!isRoot)
          currentProcessedToken =
            token +
            " " +
            recursiveProcessToken(tokens[(currentIndex += 1)], true, false);
        else currentProcessedToken = (isWithinCollection ? "" : " ") + token;

        return currentProcessedToken;
      }

      function processMapToken(
        token: string,
        isWithinCollection: boolean
      ): string {
        let processedToken: string = "";

        processedToken =
          token +
          "<" +
          recursiveProcessToken(tokens[(currentIndex += 1)], true, true) +
          ", " +
          recursiveProcessToken(tokens[(currentIndex += 1)], true, true) +
          ">";

        if (!isWithinCollection)
          processedToken += recursiveProcessToken(
            tokens[(currentIndex += 1)],
            true,
            false
          );

        return processedToken;
      }

      function processListOrMapToken(
        token: string,
        isWithinCollection: boolean
      ): string {
        let processedToken = "";

        processedToken =
          token +
          "<" +
          recursiveProcessToken(tokens[(currentIndex += 1)], true, true) +
          ">";

        if (!isWithinCollection)
          processedToken += recursiveProcessToken(
            tokens[(currentIndex += 1)],
            true,
            false
          );

        return processedToken;
      }
    }
  }
}
