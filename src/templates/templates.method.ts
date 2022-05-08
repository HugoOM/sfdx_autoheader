import helper from "../extension/documenter.helper";

/**
 * Generate a header for the selected Apex method, based on the SFDoc template and
 * the method's signature.
 * @param parameters List of tokenized parameters in the Apex method's signature
 * @param returnType The return type of the Apex method
 */
export function getMethodHeaderFromTemplate(
  parameters: string[],
  returnType: string
) {
	const formattedDate = helper.getFormattedDate();
  const username = helper.getConfiguredUsername();
  return (
    "/**\n" +helper.getFormattedMethodHeaderProperties(
    username,
    formattedDate
  )+"\n"+
    `${parameters
      .map((param) => ` * @param ${param} \n`)
      .toString()	
      .replace(/,/gim, "")}` +
    (returnType === "void" ? "" : ` * @return ${returnType} `) +
    "\n**/"
  );
}
