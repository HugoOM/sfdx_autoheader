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
    if (!window.activeTextEditor) return;

    const methodPosition: Position = window.activeTextEditor.selection.anchor;

    const methodHeader = this.constructMethodHeader();

    if (!methodHeader) return;

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
      templates.author() +
      templates.parameters(method.parameters) +
      templates.returnType(method.returnType) +
      templates.end();

    const indentation = window.activeTextEditor.document
      .lineAt(window.activeTextEditor.selection.anchor.line)
      .text.match(/^\s*/gi);

    return str
      .split(/\n/gim)
      .reduce(
        (lines: string, line: string) =>
          line ? (lines += indentation + line + "\n") : lines,
        "\n"
      );
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

    if (!methodText.replace(/\s/gi, "")) {
      window.showErrorMessage(
        "SFDoc: Cannot insert method header on empty line."
      );
      return;
    }

    for (
      ++currentLineId;
      currentLineId <= window.activeTextEditor.document.lineCount;
      currentLineId++
    ) {
      try {
        if (re_methodDefinitionEnd.test(methodText)) break;

        let currentLine = document.lineAt(currentLineId).text;

        if (/\*\/|\/\*|\bclass\b|\}/gi.test(currentLine)) throw Error();

        if (currentLineId === window.activeTextEditor.document.lineCount)
          throw Error();

        methodText += currentLine;
      } catch (err) {
        window.showErrorMessage(
          "SFDoc: Apex method's signature not recognized on selected line."
        );
        return;
      }
    }

    const re_ScopeModifier = /public|private|protected|global/i;
    const [methodSignature, methodParameters] = methodText.split("(");

    let signatureTokens = this.getSignatureAsTokens(methodSignature);

    method.name = signatureTokens.pop() || "";

    method.scope =
      signatureTokens.find(token => re_ScopeModifier.test(token)) || "";

    method.returnType =
      signatureTokens.find(
        token => !apexReservedTerms.includes(token.toLowerCase())
      ) || "";

    if (
      !method.name ||
      !method.returnType ||
      !methodSignature ||
      !methodParameters
    ) {
      window.showErrorMessage(
        "SFDoc: Apex method's signature not recognized on selected line."
      );
      return;
    }

    method.isStatic = signatureTokens.some(
      (token: string) => token.toLowerCase() === "static"
    );

    method.isOverride = signatureTokens.some(
      (token: string) => token.toLowerCase() === "override"
    );

    method.parameters = this.getParametersAsTokens(methodParameters);

    return method;
  }

  private getSignatureAsTokens(signatureString: string): string[] {
    const tokens = signatureString
      .split(/\(|\)|,|<|>|\s|\{|\}/gi)
      .filter(token => !!token);

    const processedTokens: string[] = [];
    let currentIndex = -1;

    if (!tokens || !tokens.length) return processedTokens;

    while (currentIndex + 1 < tokens.length) {
      processedTokens.push(
        recursiveProcessSignatureToken(tokens[(currentIndex += 1)])
      );
    }

    return processedTokens
      .filter(token => token !== "")
      .map(token => token.trim());

    function recursiveProcessSignatureToken(token: string): string {
      let currentProcessedToken = "";

      if (!token) return currentProcessedToken;

      if (token.toLowerCase() === "map")
        currentProcessedToken = processSignatureMapToken(token);
      else if (token.toLowerCase() === "list" || token.toLowerCase() === "set")
        currentProcessedToken = processSignatureListOrSetToken(token);
      else currentProcessedToken = token;

      return currentProcessedToken;
    }

    function processSignatureMapToken(token: string): string {
      return (
        token +
        "<" +
        recursiveProcessSignatureToken(tokens[(currentIndex += 1)]) +
        ", " +
        recursiveProcessSignatureToken(tokens[(currentIndex += 1)]) +
        ">"
      );
    }

    function processSignatureListOrSetToken(token: string): string {
      return (
        token +
        "<" +
        recursiveProcessSignatureToken(tokens[(currentIndex += 1)]) +
        ">"
      );
    }
  }

  private getParametersAsTokens(parametersString: string): string[] {
    const tokens = parametersString
      .split(/\(|\)|,|<|>|\s|\{|\}/gi)
      .filter(token => !!token);

    const processedTokens: string[] = [];
    let currentIndex = -1;

    if (!tokens || !tokens.length) return processedTokens;

    while (currentIndex + 1 < tokens.length) {
      processedTokens.push(
        recursiveProcessParamToken(tokens[(currentIndex += 1)], false, false)
      );
    }

    return processedTokens
      .filter(token => token !== "")
      .map(token => token.trim());

    function recursiveProcessParamToken(
      token: string,
      isRoot: boolean,
      isWithinCollection: boolean
    ): string {
      let currentProcessedToken = "";

      if (!token) return currentProcessedToken;

      if (token.toLowerCase() === "map")
        currentProcessedToken = processParamMapToken(token, isWithinCollection);
      else if (token.toLowerCase() === "list" || token.toLowerCase() === "set")
        currentProcessedToken = processParamListOrSetToken(
          token,
          isWithinCollection
        );
      else if (!isRoot)
        currentProcessedToken =
          token +
          " " +
          recursiveProcessParamToken(tokens[(currentIndex += 1)], true, false);
      else currentProcessedToken = (isWithinCollection ? "" : " ") + token;

      return currentProcessedToken;
    }

    function processParamMapToken(
      token: string,
      isWithinCollection: boolean
    ): string {
      let processedToken =
        token +
        "<" +
        recursiveProcessParamToken(tokens[(currentIndex += 1)], true, true) +
        ", " +
        recursiveProcessParamToken(tokens[(currentIndex += 1)], true, true) +
        ">";

      if (!isWithinCollection)
        processedToken += recursiveProcessParamToken(
          tokens[(currentIndex += 1)],
          true,
          false
        );

      return processedToken;
    }

    function processParamListOrSetToken(
      token: string,
      isWithinCollection: boolean
    ): string {
      let processedToken =
        token +
        "<" +
        recursiveProcessParamToken(tokens[(currentIndex += 1)], true, true) +
        ">";

      if (!isWithinCollection)
        processedToken += recursiveProcessParamToken(
          tokens[(currentIndex += 1)],
          true,
          false
        );

      return processedToken;
    }
  }
}
