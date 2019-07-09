import helper from "../extension/documenter.helper";

export default function(languageId: string, fileName: string | undefined) {
  let blockStart, lineStart, blockEnd;

  if (languageId === "apex" || languageId === "javascript") {
    blockStart = "/**";
    lineStart = " *";
    blockEnd = "**/";
  } else if (languageId === "html" || languageId === "visualforce") {
    blockStart = "<!--";
    lineStart = " ";
    blockEnd = "-->";
  }

  return `${blockStart}
${lineStart} @File Name          : ${fileName}
${lineStart} @Description        : 
${lineStart} @Author             : ${helper.getConfiguredUsername()}
${lineStart} @Group              : 
${lineStart} @Last Modified By   : ${helper.getConfiguredUsername()}
${lineStart} @Last Modified On   : ${helper.getHeaderFormattedDateTime()}
${lineStart} @Modification Log   : 
${lineStart}==============================================================================
${lineStart} Ver       Date            Author      		    Modification
${lineStart}==============================================================================
${lineStart} 1.0    ${helper.getHeaderFormattedDate()}   ${helper.getConfiguredUsername()}     Initial Version
${blockEnd}
`;
}
