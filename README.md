# 🔥 SFDX Autoheader ~ Alpha 🔥

## **Important**

### _This extension depends on the official [Salesforce Extensions for VSCode](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode), for language support._ ☁️

# Features

- #### Add a file header to any Apex-language files on save
- #### Dynamically updates the "Last Updated By" and "Last Updated On" values on save

# Usage

Upon first saving any Apex files [ .cls | .apex ], a file header will be added at the beginning of the file.
Further saves will update the "Last Modified By" and "Last Modified On" values to the current user and current time.

# Config

1.  Under "Settings" (Preferences > Open Settings), look for "SFDX".
2.  Set the desired Username under "SFDX_Autoheader: Username".

# WIP, Roadmap & Ideas

- Full test coverage
- Improve update logic so that the replacement is limited to the header
- Programmatic improvements around the Pre-Save edits
- Flexible templates and/or template options
- Support for additional SFDX languages (Visualforce, Lightning)
