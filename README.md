# prop2yaml
i18n tool based on Google Sheets.  Compatible with e.g. kazupon::vue-i18n

// this is "proof of concept" level tool: completes a translation 
//    workflow based on Google Sheet 
//     -- sharable with translators
//     -- use existing tool => gen default strings with Google Translate
//     -- use existing tool => generate Java prop files, and download to you
//  THEN: this script prepares the i18n file expected by Vue i18n

//   these are the tools reqd, in the Google Sheets add-ons shop:
//     Add-on Easy Localization by www.modernalchemy.de (execute Google translate, leaving non-empty cells)
//     Add-on Java Translations Tool by simon.niederberger (downloads zip of java properties files, to convert to yaml)
 
Create your Google Sheet, add the add-ons Easy Localization, Java Translations Tool.
Follow Easy Location Layout, try the auto translations
Run the Java Translations tool to gen prop files and download as zip.
Run this tool to create the YAML.

This was created for an Electron project (desktop) with dynamic language change.  Web apps might need to isolate languages more.
