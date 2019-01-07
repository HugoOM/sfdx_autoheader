# 🔥 Salesforce Autoheader ~ Beta 🔥

[![Build Status](https://travis-ci.org/HugoOM/sfdx_autoheader.svg?branch=master)](https://travis-ci.org/HugoOM/sfdx_autoheader)
[![Maintainability](https://api.codeclimate.com/v1/badges/64c16d2180411eb66da5/maintainability)](https://codeclimate.com/github/HugoOM/sfdx_autoheader/maintainability)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## **Important**

### _This extension depends on the official [☁ Salesforce Extensions for VSCode ☁](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode) for language support._

# Features

- #### Add a file header to any Apex, Visualforce or Lightning (Aura & LWC) file on save
- #### Dynamically updates the "Last Updated By" and "Last Updated On" values on save

# Thoughts & Recommendation 🧠

The point of this extension is to provide a simple way to identify and qualify files that are part of a Salesforce development project, as well as to keep track of changes made to them, why, by whom, and when.

# Usage

Upon first saving any Apex, Visualforce or Lightning file, a matching header will be added at the top.
Further saves will update the "Last Modified By" and "Last Modified On" values to the current user and time.

# Config

1.  Under "Settings" (Preferences > Open Settings), look for "SFDX".
2.  Set the desired Username under "SFDX_Autoheader: Username".
3.  Toggle (On/Off) the "On-Save" header by file type.

# WIP & Ideas 🦄

- On-Demand file headers
- Methods Javadoc-like comments
