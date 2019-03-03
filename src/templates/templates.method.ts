import helper from "../extension/documenter.helper";

export default {
  base(): string {
    return "/**\n";
  },
  scope(...scopes: string[]): string {
    return `* @scope ${scopes.toString().replace(/,/gi, " ")}\n`;
  },
  parameters(parameters: string[]): string {
    return parameters.reduce((parametersString: string, parameter: string) => {
      return (parametersString += `* @param ${parameter}\n`);
    }, "");
  },
  returnType(returnType: string): string {
    return `* @return ${returnType}\n`;
  },
  description(): string {
    return `* @description\n`;
  },
  author(): string {
    return `* @author ${helper.getConfiguredUsername()} | ${helper.getHeaderFormattedDate()}\n`;
  },
  end(): string {
    return "*/\n";
  }
};
