import { window } from "vscode";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

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

    let collectionCount: number = 0;
    method.parameterTokens = method.parameters
      .replace(/\s+/gi, " ")
      .replace(/\)|\{|\}/gi, "")
      .split(",")
      .map((token: string) => token.trim())
      .reduce((processedTokens: any, currentToken: string) => {
        if (/list|map|set/gi.test(currentToken)) collectionCount++;

        const collectionClosingTags = currentToken.match(/>/gi);

        if (collectionCount > 1)
          processedTokens[processedTokens.length - 1] += ", " + currentToken;
        else processedTokens.push(currentToken);

        if (collectionClosingTags && collectionClosingTags.length)
          collectionCount -= collectionClosingTags.length;

        return processedTokens;
      }, []);
    debugger;
  }
}
