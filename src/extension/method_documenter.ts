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

    const method: Method = {
      text: "",
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

    const document = window.activeTextEditor.document;
    const re_methodDeclarationStart = /\{/gi;
    let currentLineId = window.activeTextEditor.selection.anchor.line;
    method.text = document.lineAt(currentLineId).text;

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

    method.parameterTokens = method.parameters
      .replace(/\)|\{|\}|\s*/gi, "")
      .split(",")
      .map((token: string) => token.trim());
  }
}
