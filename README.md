# ️️☁️ Salesforce Documenter ~ Beta ☁️

[![Build Status](https://travis-ci.org/HugoOM/sfdx_autoheader.svg?branch=master)](https://travis-ci.org/HugoOM/sfdx_autoheader)
[![Maintainability](https://api.codeclimate.com/v1/badges/64c16d2180411eb66da5/maintainability)](https://codeclimate.com/github/HugoOM/sfdx_autoheader/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![marketplace](https://vsmarketplacebadge.apphb.com/version/hugoom.sfdx-autoheader.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=HugoOM.sfdx-autoheader)

## **Important**

### _This extension depends on the official [Salesforce Extensions for VSCode](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for language support._

# Summary

Salesforce Documenter aims at facilitating proper and structured code documenting for Salesforce-related files, by automating related tasks such as File Header Insertion & Update, as well as Method Header insertion.

Salesforce Documenter can be adopted as a project-wide and/or team-wide standard, in an effort to encourage and eventually enforce proper code documenting.

Through these means, code becomes easier to understand, maintain, and evolve.

# Features

- Add a method header to any Apex method, with JavaDoc-Like tags to be completed with the method's and contextual details

![Method Header Demo](https://github.com/HugoOM/sfdx_autoheader/blob/rewrite_Typescript/images/Instructions_MethodHeader.gif?raw=true)

- Add/Update a header to any Salesforce file (Apex, Visualforce, Aura, LWC, JavaScript)

![File Header Demo](https://github.com/HugoOM/sfdx_autoheader/blob/rewrite_Typescript/images/Instructions_FileHeader.gif?raw=true)

# Commands

| Command                            | Description                                                                                                     | Applies To                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| SFDoc: Generate Apex Method Header | Place cursor on the first line of a method declaration. Insert a method header based on the method's signature. | Apex Methods                        |
| SFDoc: Insert File Header          | Insert a file header at the top of the current file, if it doesn't already include one.                         | Apex, Visualforce, HTML, JavaScript |

# Settings

| Property                           | Description                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| SFDoc.username                     | Username that will appear in File and Method headers.                                    |
| SFDoc.EnableForApex                | Enable automatic on-save file header insertion and update for Apex classes               |
| SFDoc.EnableForVisualforce         | Enable automatic on-save file header insertion and update for Visualforce pages          |
| SFDoc.EnableForLightningMarkup     | Enable automatic on-save file header insertion and update for Lightning Markup files     |
| SFDoc.EnableForLightningJavascript | Enable automatic on-save file header insertion and update for Lightning JavaScript files |
