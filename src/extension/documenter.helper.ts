import { workspace } from "vscode";

export default {
  apexReservedTerms: [
    "public",
    "private",
    "protected",
    "global",
    "override",
    "static",
    "webservice",
    "testMethod"
  ],
  getHeaderFormattedDateTime(): string {
    return new Date().toLocaleString();
  },

  getHeaderFormattedDate(): string {
    return new Date().toLocaleDateString();
  },

  getConfiguredUsername(): string {
    return workspace
      .getConfiguration("SFDoc")
      .get("username", "phUser@phDomain.com");
  }
};
