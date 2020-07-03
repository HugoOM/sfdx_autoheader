# ️️☁️ Salesforce Documenter ~ Beta ☁️

[![Build Status](https://dev.azure.com/HugoOM/Salesforce%20Documenter/_apis/build/status/HugoOM.sfdx_autoheader?branchName=master)](https://dev.azure.com/HugoOM/Salesforce%20Documenter/_build/latest?definitionId=2&branchName=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/64c16d2180411eb66da5/maintainability)](https://codeclimate.com/github/HugoOM/sfdx_autoheader/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![marketplace](https://vsmarketplacebadge.apphb.com/version/hugoom.sfdx-autoheader.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=HugoOM.sfdx-autoheader)

## **Important**

### _This extension depends on the official [Salesforce Extensions for VSCode](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for language support._

# Summary

Salesforce Documenter aims at facilitating properly structured code documentation for Salesforce-related files by automating related tasks such as generating & maintaining File and Method headers.

_SFDoc_ can be adopted as a project-wide and/or team-wide standard, in an effort to encourage, and eventually enforce, proper code documenting.

Through these means, code becomes easier to understand, maintain, and evolve.

# Features

- Add a Method header to any Apex method; generating ApexDoc-compliant tags.

![Method Header Demo](https://github.com/HugoOM/sfdx_autoheader/blob/master/images/Instructions_MethodHeader.gif?raw=true)

- Add a File header to any Salesforce file (Apex, Visualforce, Aura, LWC, JavaScript).

![File Header Demo](https://github.com/HugoOM/sfdx_autoheader/blob/master/images/Instructions_FileHeader.gif?raw=true)

# Commands

| Command                          | Description                                                                                                     | Applies To                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| SFDoc: Insert Apex Method Header | Place cursor on the first line of a method declaration. Insert a method header based on the method's signature. | Apex                                |
| SFDoc: Insert File Header        | Insert a file header at the top of the current file, if it doesn't already include one.                         | Apex, Visualforce, HTML, JavaScript |

# Settings

| Property                                | Description                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| SFDoc.username                          | Username that will appear in File and Method headers.                                                                             |
| SFDoc.DateFormat                        | The format in which SFDoc will output dates. Needs to include [DD, MM, YYYY] in the desired order and with the desired separator. |
| SFDoc.FileHeaderProperties              | Array of properties to be added to the File Headers. Format of entries is : `{name: string, defaultValue?: string}`               |
| SFDoc.EnableForApex                     | Enable automatic on-save file header insertion and update for Apex classes                                                        |
| SFDoc.EnableForVisualforce              | Enable automatic on-save file header insertion and update for Visualforce pages                                                   |
| SFDoc.EnableForLightningMarkup          | Enable automatic on-save file header insertion and update for Lightning Markup files                                              |
| SFDoc.EnableForLightningJavascript      | Enable automatic on-save file header insertion and update for Lightning JavaScript files                                          |
| SFDoc.IncludParameterTypeInMethodHeader | Include Parameters' Type in method header                                                                                         |
