# 🔥 SFDX Autoheader ~ Beta 🔥

## **Important**

### _This extension depends on the official [☁ Salesforce Extensions for VSCode ☁](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for language support._

# Features

- #### Add a file header to any Apex-language files on save
- #### Dynamically updates the "Last Updated By" and "Last Updated On" values on save

# Thoughts & Recommendation 🧠

The point of this extension is to provide a simple way to identify and qualify files that are part of a Salesforce development project, as well as to keep track of changes made to them, why, by whom, and when.

It is **mostly aimed at projects that do NOT have a VCS**.

A well configured and maintained VCS should provide most of the functionalities that a file header provides, like authoring, changes tracking, and so on; and in a much simpler and complete way. In such cases, it might be worth considering adding a simple block comment to provide file description for complex and/or specific classes, instead of relying on a full header as a project-wide standard.

# Usage

Upon first saving any Apex files [ .cls | .apex ], a file header will be added at the beginning of the file.
Further saves will update the "Last Modified By" and "Last Modified On" values to the current user and current time.

# Config

1.  Under "Settings" (Preferences > Open Settings), look for "SFDX".
2.  Set the desired Username under "SFDX_Autoheader: Username".

# WIP, Roadmap & Ideas 🦄

- Support for additional SFDX languages (Visualforce, Lightning)
- Improve update logic so that replacement is scoped to the header
- Programmatic improvements around the Pre-Save edits
- Flexible templates and/or template options
- Test Quality Improvements
