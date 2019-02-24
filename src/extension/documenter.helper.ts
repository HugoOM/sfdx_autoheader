import { WorkspaceConfiguration, workspace } from "vscode";

export default {
  getHeaderFormattedDateTime(): string {
    const currentDate = new Date(Date.now());
    return currentDate.toLocaleString();
  },

  getConfiguredUsername(): string {
    const settingsUsername: WorkspaceConfiguration = workspace.getConfiguration(
      "SFDoc"
    );

    return settingsUsername.get("username", "phUser@phDomain.com");
  }
};
