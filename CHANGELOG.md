# Change Log

## [Future]

- Code refactoring and cleanup for release [0.7.0] features
- Full re-do of the extension's unit tests
- File-wide method header injection
- Finer grain tuning of the method header tags through settings

## [0.7.0]

- Fully customizeable File Header properties.
- Customizeable Date format.
- Support for Method Headers on Constructor methods.
- Automatic updating of File Headers regardless of the "EnableForApex" setting.
- Default tags now ApexDoc compliant by default.

## [0.6.1]

- Method headers are now inserted before annotations, if any are present on the preceding lines.
- Method headers now properly consider "inline" annotations as valid tokens. This prevents an issue where an annotations would be recognized as the return type.

## [0.6.0]

- Removed "=" characters line around the "@Modification Log" header row, to improve formatting in VSCode's class peek overlay. It made the text very large and bold.
- Removed legacy "SFDX-Autoheader" configuration items and related migration feature.
- Removed method param type by default. Now behind a setting.
- Removed the Time component from the default entry in the file header modification log.
- Removed the Param types for method header by default, now behind a setting.
- Full code comenting and tidying (DRY on method header)
- Changed CI from Travis to Azure Pipelines

## [0.5.3]

- Hotfix to remove .xml file extension from support. Only the language binding under .cmp should be valid.

## [0.5.2]

- Added support for XML language binding under Aura .cmp files

## [0.5.1]

- Fixed an issue where two spaces would be added between a param type and it's name, for method headers

## [0.5.0]

- Complete rebranding into **_Salesforce Documenter_**
- TypeScript rewrite
- Method header generation
- Commands support for File & Method Headers
- Validation and user feedback
- Deprecated the "Enable For All Web Files" setting. Use on-demand commands instead
- Depracated old "SFDX_Autoheader..." settings for "SFDoc..."
- Added migration logic to transfer old settings to the new model, on activation

## [0.4.2]

- More accurate logic to identify Lightning files

## [0.4.1]

- Regex and Header analysis improvements
- Tests improvements
- Prettier code formatting

## [0.4.0]

- LWC Support

## [0.3.0]

- Lightning Support!
- On/Off Toggle Settings for On-Save Headers
- Document Range Perf Improvement
- First save (insert) Cursor Bug Fix
- Default Templates Indent Fix
- Test Coverage Update - Complete & Current
- New _fancier_ name

## [0.2.3]

- Fixed cursor being sent to EOF for Non-SFDC files in SFDC workspaces

## [0.2.2]

- Marketplace color theme hotfix

## [0.2.1]

- Fixed the "Jumping Cursor" issue

## [0.2.0]

- Visualforce Support

## [0.1.0]

- Beta Version
- Apex Support
- Full MochaChai Unit Testing Coverage - Current Features
- Travis CI Sanity Check

## [0.0.1]

- Alpha Version
