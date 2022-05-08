import { workspace, TextDocument } from "vscode";

type HeaderProperty = {
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
  getFileHeaderRawProperties(): Array<HeaderProperty> {
    return workspace.getConfiguration("SFDoc").get("FileHeaderProperties", []);
  },

  /**
   * Get a Header-suitable formatted string of all given Header properties.
   */
  getFormattedHeaderProperties(
    lineStartChar: string,
    username: string,
    date: string,
	propertyName: string
  ): string {
    const rawProperties: Array<HeaderProperty> = workspace
      .getConfiguration("SFDoc")
      .get(propertyName, []);
	const separator: string = workspace
		  .getConfiguration("SFDoc")
		  .get(propertyName+"Separator", "");
    const paddingSize =
      Math.max(...rawProperties.map(({ name }) => name.length)) + 2;
	
	const alignLeft: boolean = workspace
      .getConfiguration("SFDoc")
      .get(propertyName+"AlignLeft", false)
	  
    return rawProperties
      .map(({ name, defaultValue = "" }, index) => {
		
		var propertyNameValue: string = name;		
		if(alignLeft) {
			propertyNameValue = propertyNameValue.padEnd(paddingSize, " ");
		}
		var content: string = (separator == "")?`${lineStartChar} @${propertyNameValue} ${defaultValue
          .replace(/\$username/gi, username)
          .replace(/\$date/gi, date)}`:`${lineStartChar} @${propertyNameValue} ${separator} ${defaultValue
          .replace(/\$username/gi, username)
          .replace(/\$date/gi, date)}`;
		
        if (index != rawProperties.length - 1) content += "\n";

        return content;
      })
      .toString()
      .replace(/\,/gm, "");
  },
  
  /**
   * Get a File-Header-suitable formatted string of all configured File Header properties.
   */
  getFormattedFileHeaderProperties(
    lineStartChar: string,
    username: string,
    date: string
  ): string {
    return this.getFormattedHeaderProperties(lineStartChar, username, date, "FileHeaderProperties");
  },

  /**
   * Get a Method-Header-suitable formatted string of all configured Method Header properties.
   */
  getFormattedMethodHeaderProperties(
	username: string,
    date: string
  ): string {
    return this.getFormattedHeaderProperties(" *",username,date, "MethodHeaderProperties");
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

  /**
   * Get the height of the file header that would be inserted based on the
   *  current settings, by computing the number of file header properties,
   * as well as the length of the modification log (if enabled).
   * @returns The height of the file header in number of rows (lines)
   */
  getFileHeaderRowsCount(): number {
    const configurations = workspace.getConfiguration("SFDoc");

    const fileHeaderPropertiesCount = configurations.get(
      "FileHeaderProperties",
      []
    ).length;

    const isModificationsLogEnabled = configurations.get(
      "IncludeModificationLogScaffoldInFileHeader",
      false
    );

    return 2 + fileHeaderPropertiesCount + (isModificationsLogEnabled ? 3 : 0);
  },
};
