import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';

import { configurationManager } from './configuration';

const extensionHome = configurationManager.getExtensionHome();
const removeDebuggingCode = configurationManager.getRemoveDebuggingCode();
const minifyJS = configurationManager.getMinifyJS();
const minifyCSS = configurationManager.getMinifyCSS();

// start basic functions
export const getDocument = (): vscode.TextDocument | null => {
    // get the currently active text editor. this will be changed on selection.
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        return editor.document;
    }
    return null;
};

    // get the current document
export const getCurrentDocument = ()=> {
    const document = getDocument();
    
    if (document === null || !isWebsquareFile(document)) {
        return;
    }

    // Get the file path of the document
    return document.uri.path;
};

export const isWebsquareFile = (doc: vscode.TextDocument) => {
    // check xml
    return doc.languageId === 'xml' 
            || doc.fileName.endsWith('.xml') 
            || doc.getText().includes('xmlns:w2="http://www.inswave.com/websquare');
};


export const selectExecutable = (): string => {
    const osType = os.platform();
    const linuxexec = 'standalone_wpack-linux';

    return path.normalize( (() => {
        switch(osType){
            case 'win32':
                // windows bash can't add root(/)
                return path.join(extensionHome, 'w-pack', 'standalone_wpack-win.exe');
            case 'darwin':
                return path.join(extensionHome, 'w-pack', 'standalone_wpack-macos');
            case 'linux':
                return path.join(extensionHome, 'w-pack', linuxexec);
            default:
                console.log(`Unknown OS: ${osType}`);
                return path.join(extensionHome, 'w-pack', linuxexec); // Default to Linux
        }} )() );
};

export const makeConvertCommand = (source: string, target: string, base: string) => {

    //, nodebug: string, jsminify: number, cssminify: number 
    // Normalize paths for the current OS
    const normalizedSource = path.normalize(source); // src
    const normalizedTarget = path.normalize(target); // base + '_wpack_'
    const normalizedBase = path.normalize(base); // base

    return `"'${selectExecutable()}' -s '${normalizedSource}' -d '${normalizedTarget}' -b '${normalizedBase}' -j ${minifyJS} -c ${minifyCSS} -nd ${removeDebuggingCode}"`;
};

// absolute path
// source src/main/webapp/wq
// target src/main/webapp/_wpack_/
// base   src/main/webapp/
export const makeCleanCommand = (source: string, target: string, base: string) => {
    const relativeSourcePath = source.replace(base, '');

    // Normalize the path for the current OS
    const normalizedRemoveTargetPath = path.normalize(path.join(target, relativeSourcePath));

    //return `"rm -rf '${normalizedRemoveTargetPath}'"`;
    if (os.platform() === 'win32') {
        return `"del /s /q '${normalizedRemoveTargetPath}'"`;
    } else
    {
        return `"rm -rf '${normalizedRemoveTargetPath}'"`;
    }
};

export const makeDeployCommand = (source: string, target: string, base: string, deployName: string) => {
    const relativeSourcePath = source.replace(base, '').replace(".xml", ".js");

    // Normalize paths for the current OS
    const normalizedDeploySourcePath = path.normalize(path.join(target, relativeSourcePath));
    const normalizedDeployTargetPath = path.normalize(path.join(base, "target", deployName, "_wpack_", relativeSourcePath));

    if (os.platform() === 'win32') {
        return `"copy /y '${normalizedDeploySourcePath}' '${normalizedDeployTargetPath}'"`;
    } else
    {
        return `"cp -f '${normalizedDeploySourcePath}' '${normalizedDeployTargetPath}'"`;
    }
};

