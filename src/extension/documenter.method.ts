import {
  Selection,
  TextEditor,
  TextEditorEdit,
  window,
  Position,
  TextDocument,
  workspace,
} from "vscode";
import { getMethodHeaderFromTemplate } from "../templates/templates.method";
import helper from "./documenter.helper";

/**
 * Standard data structure representing an Apex method signature being parsed
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
   * @param edit Edit to be applied to the file, provided by VSCode when registering a command
   */
  insertMethodHeaderFromCommand(
    editor: TextEditor,
    edit: TextEditorEdit
  ): void {
    const methodSelection: Selection = editor.selection;

    const currentLineId = methodSelection.anchor.line;

    const lineToInsertId = this.getMethodFirstLineIncludingAnnotations(
      editor.document,
      currentLineId
    );

    if (lineToInsertId === null) {
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

    edit.insert(new Position(lineToInsertId, 0), methodHeader);
  }

  /**
   * Get the line Id (number) from the current document where the method header should
   *  be inserted, while considering the annotations if any are present. The insertion
   *  line should be prior to the annotations.
   * @param document  The current text document
   * @param methodFirstLineId Line number where the method's declaration starts
   */
  private getMethodFirstLineIncludingAnnotations(
    document: TextDocument,
    methodFirstLineId: number
  ): number | null {
    let methodFirstLineBeforeAnnotations = methodFirstLineId;

    while (
      helper.apexAnnotationsRegex.test(
        document.lineAt(methodFirstLineBeforeAnnotations - 1).text
      )
    )
      methodFirstLineBeforeAnnotations--;

    // TODO: Move to its own method "checkForMethodHeader"
    return /\/\/|\*\//i.test(
      document.lineAt(methodFirstLineBeforeAnnotations - 1).text
    )
      ? null
      : methodFirstLineBeforeAnnotations;
  }

  /**
   * Entry-point method to construct a header for Apex method present on the selected line
   * @param currentLineId Id of the currently selected line, for which a header
   *  will be generated
   */
  private constructMethodHeader(currentLineId: number): string | void {
    if (!window.activeTextEditor) return;

    const method = this.parseApexMethodSignature();

    if (!method) return;

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
      returnType: "",
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
        (token) =>
          !helper.apexReservedTerms.includes(token.toLowerCase()) &&
          !helper.apexAnnotationsRegex.test(token)
      ) || "";

    if (!method.returnType) {
      const isMethodAConstructror =
        helper.getContainingClassName(document, currentLineId) === method.name;

      if (isMethodAConstructror) method.returnType = "void";
    }

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

    const isIncludeParameterType = workspace
      .getConfiguration("SFDoc")
      .get("IncludParameterTypeInMethodHeader", false);

    method.parameters = this.tokenizeApexMethod(methodParameters, false);

    // Remove the parameter type from the parameter token strings
    if (!isIncludeParameterType)
      method.parameters = method.parameters.map(
        (token) => token.split(" ").pop() || ""
      );

    return method;
  }

  /**
   * Parse the method's parameters into tokens, to be utilized in the
   *  generated method's header.
   * @param content Method's parameters as text
   * @param isSignature True if the current
   */
  private tokenizeApexMethod(content: string, isSignature: boolean): string[] {
    const tokens = content
      .split(/\(|\)|,|<|>|\s|\{|\}/gi)
      .map((token, index, tokens) => {
        if (token === "@") tokens[index + 1] = "@" + tokens[index + 1];
        return token;
      })
      .filter((token) => !!token && token !== "@");

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
      .filter((token) => token !== "")
      .map((token) => token.trim());
  }

  /**
   * Identify the type of the current token and process it, that it structure it
   *  so that it can be inserted into the header, accordingly.
   *  This method makes recursive calls to process collection-type token.
   * @param token The string token being processed
   * @param tokensIterator The tokens array iterator
   * @param isFirstOfLine Indicate whether the current token is at the first position of a token string.
   *  Is true for any token that is parsed alone, like signature arguments like "static"
   * @param isWithinCollection Indicates whether the current token is within a collection declaration
   * @param isSignature Indicates whether the current token is part of the methods signature.
   *  A false value indicates that method parameters token are being processed instead
   */
  private processToken(
    token: string,
    tokensIterator: IterableIterator<string>,
    isFirstOfLine: boolean,
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
    else if (!isFirstOfLine)
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

  /**
   * Process a token that is Map declaration
   * @param token The string token being processed
   * @param tokensIterator The tokens array iterator
   * @param isWithinCollection Indicates whether the current token is within a collection declaration
   * @param isSignature Indicates whether the current token is part of the methods signature.
   *  A false value indicates that method parameters token are being processed instead
   */
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

  /**
   * Process a token that is a List or Set declaration
   * @param token The string token being processed
   * @param tokensIterator The tokens array iterator
   * @param isWithinCollection Indicates whether the current token is within a collection declaration
   * @param isSignature Indicates whether the current token is part of the methods signature.
   *  A false value indicates that method parameters token are being processed instead
   */
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
