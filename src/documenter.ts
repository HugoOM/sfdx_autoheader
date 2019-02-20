"use strict";

import SalesforceDocumenter from "./extension/salesforce-documenter";
import { ExtensionContext } from "vscode";

exports.activate = function(context: ExtensionContext): void {
  const documenter = new SalesforceDocumenter(context);

  console.log("Salesforce Documenter - Extension Activated");
};

exports.deactivate = function() {};
