import {
  Selection,
  TextEditor,
  TextEditorEdit,
  window,
  Position,
  TextDocument
} from "vscode";
import { getMethodHeaderFromTemplate } from "../templates/templates.method";
import helper from "./documenter.helper";

/**
 * Standard data structure reprensenting an Apex method signature being parsed
 * and processed by the extension.
 */
type Method = {
  name: string;
  parameters: string[];
  returnType: string;
};

/**
 * Class that contains the methods related to generating and populating an Apex method header.
 */
export default class MethodDocumenter {
  /**
   * Method exposed as an editor command to insert an Apex method header.
   * @param editor The current and active VSCode editor
   * @param edit
   */
  insertMethodHeaderFromCommand(
    editor: TextEditor,
    edit: TextEditorEdit
  ): void {
    const methodSelection: Selection = editor.selection;

    const currentLineId = methodSelection.anchor.line;

    //TODO: Move to its own method "CheckForComment"
    if (/\/\/|\*\//i.test(editor.document.lineAt(currentLineId - 1).text)) {
      window.showErrorMessage("SFDoc: Method comment already present.");
      return;
    }

    if (methodSelection.active.line !== currentLineId) {
      window.showErrorMessage(
        "SFDoc: Multiline selection is not supported. Set the cursor's position on the first line of the method's declaration."
      );
      return;
    }

    const methodHeader = this.constructMethodHeader(currentLineId);

    if (!methodHeader) {
      window.showErrorMessage(
        "SFDoc: Apex method's signature not recognized on selected line."
      );
      return;
    }

    edit.insert(new Position(currentLineId, 0), methodHeader);
  }

  /**
   * Entry-point method to construct a header for Apex method present on the selected line
   * @param currentLineId Id of the currently selected line, for which a header
   *  will be generated
   */
  private constructMethodHeader(currentLineId: number): string | void {
    const method = this.parseApexMethodSignature();

    if (!method) return;

    if (!window.activeTextEditor) return;

    const str = getMethodHeaderFromTemplate(
      method.parameters,
      method.returnType
    );

    const indentation = window.activeTextEditor.document
      .lineAt(currentLineId)
      .text.match(/^\s*/gi);

    return this.matchIndentation(str, indentation);
  }

  /**
   * Apply the indentation of the method being processed to the generated header.
   * @param methodHeaderString The header being generated
   * @param indentation The indentation that precedes the selected line
   */
  private matchIndentation(
    methodHeaderString: string,
    indentation: RegExpMatchArray | null
  ): string {
    if (!indentation) return methodHeaderString;

    return methodHeaderString
      .split(/\n/gim)
      .reduce(
        (lines: string, line: string) =>
          line ? (lines += indentation + line + "\n") : lines,
        ""
      );
  }

  /**
   * Parse the signature of the Apex method being process into the TS "Method" type.
   */
  private parseApexMethodSignature(): Method | void {
    if (!window.activeTextEditor) return;

    const method: Method = {
      parameters: [],
      name: "",
      returnType: ""
    };

    const document = window.activeTextEditor.document;
    let currentLineId = window.activeTextEditor.selection.anchor.line;

    if (!document.lineAt(currentLineId).text.replace(/\s/gi, "")) {
      window.showErrorMessage(
        "SFDoc: Cannot insert method header on empty line."
      );
      return;
    }

    const methodText = this.getMethodTextFromDocument(currentLineId, document);

    if (!methodText) return;

    const [methodSignature, methodParameters] = methodText.split("(");

    let signatureTokens = this.tokenizeApexMethod(methodSignature, true);

    method.name = signatureTokens.pop() || "";

    method.returnType =
      signatureTokens.find(
        token => !helper.apexReservedTerms.includes(token.toLowerCase())
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

    method.parameters = this.tokenizeApexMethod(methodParameters, false);

    return method;
  }

  /**
   * Parse the method's parameters into tokens, to be utilized in the
   *  generated method's header.
   * @param content Method's parameters as text
   */
  private tokenizeApexMethod(content: string, isSignature: boolean): string[] {
    const tokens = content
      .split(/\(|\)|,|<|>|\s|\{|\}/gi)
      .filter(token => !!token);

    const processedTokens: string[] = [];

    if (!tokens || !tokens.length) return processedTokens;

    const tokensIterator = tokens[Symbol.iterator]();

    let iterVal = tokensIterator.next();

    while (!iterVal.done) {
      processedTokens.push(
        this.processToken(
          iterVal.value,
          tokensIterator,
          isSignature,
          false,
          isSignature
        )
      );
      iterVal = tokensIterator.next();
    }

    return processedTokens
      .filter(token => token !== "")
      .map(token => token.trim());
  }

  private processToken(
    token: string,
    tokensIterator: IterableIterator<string>,
    isRoot: boolean,
    isWithinCollection: boolean,
    isSignature: boolean = false
  ): string {
    let currentProcessedToken = "";

    if (!token) return currentProcessedToken;

    if (token.toLowerCase() === "map")
      currentProcessedToken = this.processTokenMap(
        token,
        tokensIterator,
        isWithinCollection,
        isSignature
      );
    else if (token.toLowerCase() === "list" || token.toLowerCase() === "set")
      currentProcessedToken = this.processTokenListOrSet(
        token,
        tokensIterator,
        isWithinCollection,
        isSignature
      );
    else if (!isRoot)
      currentProcessedToken =
        token +
        this.processToken(
          tokensIterator.next().value,
          tokensIterator,
          true,
          false
        );
    else currentProcessedToken = (isWithinCollection ? "" : " ") + token;

    return currentProcessedToken;
  }

  private processTokenMap(
    token: string,
    tokensIterator: IterableIterator<string>,
    isWithinCollection: boolean,
    isSignature: boolean
  ): string {
    let processedToken =
      token +
      "<" +
      this.processToken(
        tokensIterator.next().value,
        tokensIterator,
        true,
        true
      ) +
      ", " +
      this.processToken(
        tokensIterator.next().value,
        tokensIterator,
        true,
        true
      ) +
      ">";

    if (!isWithinCollection && !isSignature)
      processedToken += this.processToken(
        tokensIterator.next().value,
        tokensIterator,
        true,
        false
      );

    return processedToken;
  }

  private processTokenListOrSet(
    token: string,
    tokensIterator: IterableIterator<string>,
    isWithinCollection: boolean,
    isSignature: boolean
  ): string {
    let processedToken =
      token +
      "<" +
      this.processToken(
        tokensIterator.next().value,
        tokensIterator,
        true,
        true
      ) +
      ">";

    if (!isWithinCollection && !isSignature)
      processedToken += this.processToken(
        tokensIterator.next().value,
        tokensIterator,
        true,
        false
      );

    return processedToken;
  }

  /**
   * Parse and return the Apex method's signature for which a header was requested,
   *  by going down through the lines from the cursor's position to the end of the
   *  method's arguments definition.
   * @param lineNumber Line number/id where the User's cursor is positionned and
   *  where the processing of the Apex method's signature should begin
   * @param document The currently active text document
   */
  private getMethodTextFromDocument(
    lineNumber: number,
    document: TextDocument
  ): string | void {
    const re_methodDefinitionEnd = /\)/gi;
    let methodText = "";

    while (true) {
      let currentLine = document.lineAt(lineNumber).text;

      methodText += currentLine;

      if (re_methodDefinitionEnd.test(methodText)) break;

      if (/\*\/|\/\*|\bclass\b|\}/gi.test(currentLine)) return;

      if (lineNumber === document.lineCount) return;

      lineNumber++;
    }

    return methodText;
  }
}
