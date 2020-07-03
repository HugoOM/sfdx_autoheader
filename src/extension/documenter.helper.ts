import { workspace, TextDocument } from "vscode";

type FileHeaderProperty = {
  name: string;
  defaultValue?: string;
};

export default {
  apexReservedTerms: [
    "public",
    "private",
    "protected",
    "global",
    "override",
    "static",
    "webservice",
    "testMethod",
  ],

  apexAnnotationsRegex: /^\s*@\s*\D*/,

  /**
   * Get an array of all File Header properties configured in the extension's settings.
   */
  getFileHeaderRawProperties(): Array<FileHeaderProperty> {
    return workspace.getConfiguration("SFDoc").get("FileHeaderProperties", []);
  },

  /**
   * Get a File-Header-suitable formatted string of all configured File Header properties.
   */
  getFormattedFileHeaderProperties(
    lineStartChar: string,
    username: string,
    date: string
  ): string {
    const rawProperties: Array<FileHeaderProperty> = workspace
      .getConfiguration("SFDoc")
      .get("FileHeaderProperties", []);

    const paddingSize =
      Math.max(...rawProperties.map(({ name }) => name.length)) + 2;

    return rawProperties
      .map(({ name, defaultValue = "" }, index) => {
        let content: string = `${lineStartChar} @${name.padEnd(
          paddingSize,
          " "
        )}: ${defaultValue
          .replace(/^\$username$/, username)
          .replace(/^\$date$/, date)}`;

        if (index != rawProperties.length - 1) content += "\n";

        return content;
      })
      .toString()
      .replace(/\,/gm, "");
  },

  /**
   * Get a date formatted according to the format set in the extension's settings under DateFormat.
   */
  getFormattedDate(): string {
    const currentDate = new Date();

    const dateFormat = workspace
      .getConfiguration("SFDoc")
      .get("DateFormat", "MM-DD-YYYY");

    return dateFormat
      .replace("DD", `${currentDate.getDate()}`.padStart(2, "0"))
      .replace("MM", `${currentDate.getMonth() + 1}`.padStart(2, "0"))
      .replace("YYYY", `${currentDate.getFullYear()}`);
  },

  getConfiguredUsername(): string {
    return workspace.getConfiguration("SFDoc").get("username", "");
  },

  /**
   * Walk the document's contents updwards from the current location (command's call site) to find the containing class's name.
   */
  getContainingClassName(document: TextDocument, lineNumber: number): string {
    const re = /class\s*\S*/;

    do {
      const line = document.lineAt(--lineNumber);

      if (line.isEmptyOrWhitespace) continue;

      const matches = line.text.match(re);

      if (!matches) continue;

      return matches[0].split(" ")[1];
    } while (lineNumber > 0);

    return "";
  },
};
