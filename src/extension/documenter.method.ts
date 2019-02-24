import { window } from "vscode";

type Method = {
  text: string;
  signature: string;
  parameters: string;
  signatureTokens: string[];
  parameterTokens: string[];
  name: string;
  scope: string;
  returnType: string;
  isStatic: boolean;
  isOverride: boolean;
};

import templates from "../templates/templates.method";

export default class MethodDocumenter {
  constructor() {}

  constructMethodHeader(): string | void {
    debugger;

    const method = this.parseSignatureIntoMethod();

    if (!method) return;

    const str =
      templates.base() +
      templates.scope(method.scope) +
      templates.parameters(method.parameterTokens) +
      templates.returnType(method.returnType) +
      templates.end();

    debugger;
  }

  parseSignatureIntoMethod(): Method | void {
    if (!window.activeTextEditor) return;

    const document = window.activeTextEditor.document;
    const re_methodDefinitionEnd = /\)/gi;
    let currentLineId = window.activeTextEditor.selection.anchor.line;

    const method: Method = {
      text: document.lineAt(currentLineId).text,
      signature: "",
      parameters: "",
      signatureTokens: [],
      parameterTokens: [],
      name: "",
      scope: "",
      returnType: "",
      isStatic: false,
      isOverride: false
    };

    while (!re_methodDefinitionEnd.test(method.text)) {
      if (currentLineId >= window.activeTextEditor.document.lineCount) return;

      method.text += document.lineAt(++currentLineId).text;
    }

    const apexReservedTerms = [
      "public",
      "private",
      "protected",
      "global",
      "override",
      "static"
    ];

    const re_ScopeModifier = /public|private|protected|global/i;
    [method.signature, method.parameters] = method.text.split("(");

    method.signatureTokens = method.signature
      .split(/\s+/)
      .filter((token: string) => token !== "");

    method.name = method.signatureTokens.pop() || "";

    method.scope =
      method.signatureTokens.find(token => re_ScopeModifier.test(token)) || "";

    method.returnType =
      method.signatureTokens.find(
        token => !apexReservedTerms.includes(token.toLowerCase())
      ) || "";

    method.isStatic = method.signatureTokens.some(
      (token: string) => token.toLowerCase() === "static"
    );

    method.isOverride = method.signatureTokens.some(
      (token: string) => token.toLowerCase() === "override"
    );

    method.parameterTokens = getParametersAsTokens(method.parameters);

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
