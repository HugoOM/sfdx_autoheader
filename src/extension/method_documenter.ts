import { window } from "vscode";

type Method = {
  text: string;
  signature: string;
  parameters: string;
  signatureTokens: string[];
  parameterTokens: string[];
  name: string | undefined;
  scope: string | undefined;
  returnType: string | undefined;
  isStatic: boolean;
  isOverride: boolean;
};

export default class MethodDocumenter {
  generateMethodHeader(): void {
    if (!window.activeTextEditor) return;

    const document = window.activeTextEditor.document;
    const re_methodDeclarationStart = /\{/gi;
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

    while (!re_methodDeclarationStart.test(method.text)) {
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

    method.name = method.signatureTokens.pop();

    method.scope = method.signatureTokens.find(token =>
      re_ScopeModifier.test(token)
    );

    method.returnType = method.signatureTokens.find(
      token => !apexReservedTerms.includes(token.toLowerCase())
    );

    method.isStatic = method.signatureTokens.some(
      (token: string) => token.toLowerCase() === "static"
    );

    method.isOverride = method.signatureTokens.some(
      (token: string) => token.toLowerCase() === "override"
    );

    method.parameterTokens = getParametersAsTokens(method.parameters);

    function getParametersAsTokens(parametersString: string): string[] {
      const tokens = parametersString
        .split(/\(|\)|,|<|>|\s|\{|\}/gi)
        .filter(token => !!token);

      const processedTokens: string[] = [];
      let currentIndex = -1;

      if (!tokens || !tokens.length) return processedTokens;

      while (currentIndex < tokens.length) {
        processedTokens.push(
          recursiveProcessToken(tokens[(currentIndex += 1)], false, false)
        );
      }

      return processedTokens
        .filter(token => token !== "")
        .map(token => token.trim());

      function recursiveProcessToken(
        token: string,
        isNextValue: boolean,
        isWithinCollection: boolean
      ): string {
        let currentProcessedToken = "";

        if (!token || currentIndex > tokens.length)
          return currentProcessedToken;

        if (token.toLowerCase() === "map")
          currentProcessedToken =
            token +
            "<" +
            recursiveProcessToken(tokens[(currentIndex += 1)], true, true) +
            ", " +
            recursiveProcessToken(tokens[(currentIndex += 1)], true, true) +
            ">" +
            (isWithinCollection
              ? ""
              : recursiveProcessToken(
                  tokens[(currentIndex += 1)],
                  true,
                  false
                ));
        else if (
          token.toLowerCase() === "list" ||
          token.toLowerCase() === "set"
        )
          currentProcessedToken =
            token +
            "<" +
            recursiveProcessToken(tokens[(currentIndex += 1)], true, true) +
            ">" +
            (isWithinCollection
              ? ""
              : recursiveProcessToken(
                  tokens[(currentIndex += 1)],
                  true,
                  false
                ));
        else if (!isNextValue)
          currentProcessedToken =
            token +
            " " +
            recursiveProcessToken(tokens[(currentIndex += 1)], true, false);
        else currentProcessedToken = (isWithinCollection ? "" : " ") + token;

        return currentProcessedToken;
      }
    }
  }
}
