import { WorkspaceConfiguration, workspace } from "vscode";

export default {
  getHeaderFormattedDateTime(): string {
    return new Date().toLocaleString();
  },

  getHeaderFormattedDate(): string {
    return new Date().toLocaleDateString();
  },

  getConfiguredUsername(): string {
    const settingsUsername: WorkspaceConfiguration = workspace.getConfiguration(
      "SFDoc"
    );

    return settingsUsername.get("username", "phUser@phDomain.com");
  }
};
