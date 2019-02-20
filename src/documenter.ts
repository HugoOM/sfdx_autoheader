import SalesforceDocumenter from "./extension/salesforce-documenter";
import { ExtensionContext, extensions } from "vscode";

exports.activate = function(context: ExtensionContext): any {
  const documenter = new SalesforceDocumenter(context);

  console.log("Salesforce Documenter - Extension Activated");

  return documenter;
};

exports.deactivate = function() {};
