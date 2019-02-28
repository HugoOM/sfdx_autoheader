import { workspace } from "vscode";

export default {
  init() {
    const old_Config = workspace.getConfiguration("SFDX_Autoheader");

    const new_Config = workspace.getConfiguration("SFDoc");

    const configKeys = [
      "username",
      "EnableForAllWebFiles",
      "EnableForApex",
      "EnableForVisualforce",
      "EnableForLightningMarkup",
      "EnableForLightningJavascript"
    ];

    configKeys.forEach(key => {
      if (!old_Config.has(key)) return;

      let oldValue = old_Config.get(key);

      if (oldValue === null || oldValue === undefined || oldValue === "")
        return;

      const oldConfigSetting = old_Config.inspect(key);

      if (!oldConfigSetting) return;

      if (oldValue === oldConfigSetting.defaultValue) return;

      new_Config.update(key, oldValue, true).then(() => {
        old_Config.update(key, undefined, true);
      });
    });
  }
};
