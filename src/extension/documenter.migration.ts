import { workspace } from "vscode";

export default {
  init() {
    const old_Config = workspace.getConfiguration("SFDX_Autoheader");

    const new_Config = workspace.getConfiguration("SFDoc");

    const configKeys = [
      "username",
      "EnableForApex",
      "EnableForVisualforce",
      "EnableForLightningMarkup",
      "EnableForLightningJavascript"
    ];

    settingsPromiseChain(0);

    function settingsPromiseChain(i: number): Promise<number> {
      return new Promise(done => {
        const key = configKeys[i];

        if (!key) return done();

        if (!old_Config.has(key)) return done(settingsPromiseChain(i + 1));

        let oldValue = old_Config.get(key);

        if (oldValue === null || oldValue === undefined || oldValue === "")
          return done(settingsPromiseChain(i + 1));

        const oldConfigSetting = old_Config.inspect(key);

        if (!oldConfigSetting) return done(settingsPromiseChain(i + 1));

        if (oldValue === oldConfigSetting.defaultValue)
          return done(settingsPromiseChain(i + 1));

        new_Config
          .update(key, oldValue, true)
          .then(() => old_Config.update(key, undefined, true))
          .then(() => done(settingsPromiseChain(i + 1)));
      });
    }
  }
};
