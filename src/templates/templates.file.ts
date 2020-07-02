import helper from "../extension/documenter.helper";

/**
 * Generates and returns a file header, based on the language of the current file,
 * its name and the user/workspace SFDoc settings.
 * @param languageId VSCode language identifier for the current file
 * @param fileName Name of the current file
 */
export function getFileHeaderFromTemplate(languageId: string) {
  let blockStart = "/**",
    lineStart = " *",
    blockEnd = "**/";
  const formattedDate = helper.getFormattedDate();
  const username = helper.getConfiguredUsername();

  if (languageId === "html" || languageId === "visualforce") {
    blockStart = "<!--";
    lineStart = " ";
    blockEnd = "-->";
  }

  return `${blockStart}
${helper.getFormattedFileHeaderProperties(lineStart, username, formattedDate)}
${lineStart} Modifications Log 
${lineStart} Ver   ${"Date".padEnd(
    formattedDate.length,
    " "
  )}   ${"Author".padEnd(username.length, " ")}   Modification
${lineStart} 1.0   ${formattedDate}   ${username}   Initial Version
${blockEnd}
`;
}
