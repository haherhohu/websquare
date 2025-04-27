# Change Log

All notable changes to the "websquare" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.4]

- Add more settings for websquare source, target, base dir.

  - WebsquareSource: source of websquare directory for convert All. default variable is "src/main/webapp/",
  - WebsquareBase: base of websquare directory for convert. default variable is "src/main/webapp/",

- Add more converting optons for debugging, minify.

  - RemoveDebuggingCode: remove javascript debugging code when converting. default variable is "false".
  - minifyJS: converting minify level for javascript.
  - minifyCSS: converting minify level for css.

## [0.0.3]

- Add "Covert All" functions
- Divide Convert and Deploy Process
- Add Websquare Logs for "Convert All" (it's too long)
- Add Progress Bar on convertion

## [0.0.2]

- Bug Fix: Command Targeted change.
- Fixed Editor Document to Current(Active) Editor Document

## [0.0.1]

- Initial release
- Add Command Convert to Webquare XML to JS
