# ️️☁️ Salesforce Documenter ~ Beta ☁️

[![Build Status](https://travis-ci.org/HugoOM/sfdx_autoheader.svg?branch=master)](https://travis-ci.org/HugoOM/sfdx_autoheader)
[![Maintainability](https://api.codeclimate.com/v1/badges/64c16d2180411eb66da5/maintainability)](https://codeclimate.com/github/HugoOM/sfdx_autoheader/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![marketplace](https://vsmarketplacebadge.apphb.com/version/hugoom.sfdx-autoheader.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=HugoOM.sfdx-autoheader)

## **Important**

### _This extension depends on the official [Salesforce Extensions for VSCode](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for language support._

# Features

- Add a method header to any Apex method

![marketplace](https://github.com/HugoOM/sfdx_autoheader/blob/rewrite_Typescript/images/Instructions_MethodHeader.gif?raw=true)

- Add/Update a header to any Salesforce file (Apex, Visualforce, Aura, LWC, JavaScript)

![marketplace](https://github.com/HugoOM/sfdx_autoheader/blob/rewrite_Typescript/images/Instructions_FileHeader.gif?raw=true)

# Commands

| Property | Description | Applies To |
| -------- | ----------- | ---------- |
| SFDoc:   |             |            |
| SFDoc:   |             |            |

# Settings

| Property                           | Description |
| ---------------------------------- | ----------- |
| SFDoc.username                     |             |
| SFDoc.EnableForApex                |             |
| SFDoc.EnableForVisualforce         |             |
| SFDoc.EnableForLightningMarkup     |             |
| SFDoc.EnableForLightningJavascript |             |

<!-- # Thoughts & Recommendation 🧠

The point of this extension is to provide a simple way to identify and qualify files that are part of a Salesforce development project, as well as to keep track of changes made to them, why, by whom, and when. -->

<!-- # Usage

Upon first saving any Apex, Visualforce or Lightning file, a matching header will be added at the top.
Further saves will update the "Last Modified By" and "Last Modified On" values to the current user and time. -->

<!-- # Config

1.  Under "Settings" (Preferences > Open Settings), look for "SFDX".
2.  Set the desired Username under "SFDX_Autoheader: Username".
3.  Toggle (On/Off) the "On-Save" header by file type. -->
