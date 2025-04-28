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
- minifyCSS: converting minify level for css.

## Release Notes

### 0.0.5

- Fix websqaure clean error. Just remove generated files only.
- Tested on windows. (but not fully working.)
  - shell command (find, cp, rm) isn't working on cmd

## License

MIT License
