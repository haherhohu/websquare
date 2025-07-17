# websquare XML Converter

It's hard to develop in a national institution and offline development.

This is an wrapper of "websquare" for make ui on vscode.

## Features

- "websquare-ui" xml file to convert js.
- Convert Websquare XML to JS
- Convert Websquare XML to JS and Deploy to Target
- Convert All Websquare XML to JS in workspace
- Convert All Websquare XML to JS in workspace and Deploy to Target

## Extension Settings

- DeployName: web deployable context name (eg. ndms-prevent)
- WebsquareSource: source of websquare directory for convert All. default variable is "src/main/webapp/",
- WebsquareBase: base of websquare directory for convert. default variable is "src/main/webapp/",
- RemoveDebuggingCode: remove javascript debugging code when converting. default variable is "false".
- minifyJS: converting minify level for javascript.
  - 0: no-minify
  - 1: remove comment and spaces
  - 2: remove comment, spaces and convert local variables
- minifyCSS: converting minify level for css.
  - 0: no-minify
  - 1: "clean-css" optimize level to 1. Only apply to single property. Remove Units and change RGB Color to Hex expression and remove comments.
  - 2: "clean-css" optimize level to 2. Remove duplicated rules and more simplify css rules if needed.

## Release Notes

### 0.0.9

- fix command generater for not-working on some windows os

## License

MIT License
