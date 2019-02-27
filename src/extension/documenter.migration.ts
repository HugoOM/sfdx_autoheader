import { workspace } from "vscode";

export default {
  init() {
    const config = workspace
      .getConfiguration("SFDX_Autoheader")
      .get("username");

    // TODO: Implement migration of SFDX_Autoheader settings to SFDoc ...

    debugger;
  }
};
