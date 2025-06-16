import * as vscode from "vscode";
import * as path from "path";
import * as os from "os";

import { configurationManager } from "./configuration";

// get configuration values
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
export const getCurrentDocument = () => {
    const document = getDocument();

    if (document === null || !isWebsquareFile(document)) {
        return;
    }

    // Get the file path of the document
    return path.normalize(document.uri.path);
};

export const isWebsquareFile = (doc: vscode.TextDocument) => {
    // check xml
    return (
        doc.languageId === "xml" ||
        doc.fileName.endsWith(".xml") ||
        doc.getText().includes('xmlns:w2="http://www.inswave.com/websquare')
    );
};

export const selectExecutable = (): string => {
    const osType = os.platform();
    const linuxexec = "standalone_wpack-linux";

    return path.normalize(
        (() => {
            switch (osType) {
                case "win32":
                    return getWindowsPath(
                        path.join(
                            extensionHome,
                            "w-pack",
                            "standalone_wpack-win.exe"
                        )
                    );
                case "darwin":
                    return path.join(
                        extensionHome,
                        "w-pack",
                        "standalone_wpack-macos"
                    );
                case "linux":
                    return path.join(extensionHome, "w-pack", linuxexec);
                default:
                    console.log(`Unknown OS: ${osType}`);
                    return path.join(extensionHome, "w-pack", linuxexec); // Default to Linux
            }
        })()
    );
};

export const getWindowsPath = (p: string): string => {
    // Normalize the path for Windows
    return p.replace(/\/c:/, "c:");
};

export const getWindowsPathForWebsquare = (p: string): string => {
    // Normalize the path for Windows Websquare
    return p.replaceAll(/\\/g, "/").replace(/\/c:/, "c:");
};

export const selectTerminal = (): { shell: string; opt: string } => {
    let shell = "sh";
    let shellopt = "-c";

    if (os.platform() === "win32") {
        shell = "cmd.exe";
        shellopt = "/c";
    }

    return { shell: shell, opt: shellopt };
};

// command wrapper
export const wrapConvertCommand = (args: string[]) => {
    if (os.platform() === "win32") {
        return makeConverterCommandForWindows(args[0], args[1], args[2]);
    } else {
        return makeConvertCommand(args[0], args[1], args[2]);
    }
};
export const wrapRemoveCommand = (args: string[]) => {
    return makeRemoveCommand(args[0], args[1], args[2]);
};
export const wrapRemoveAllCommand = (args: string[]) => {
    return makeRemoveAllCommand(args[0], args[1], args[2]);
};
export const wrapDeployCommand = (args: string[]) => {
    return makeDeployCommand(args[0], args[1], args[2], args[3]);
};

// command generator
export const makeConverterCommandForWindows = (
    source: string,
    target: string,
    base: string
) => {
    // just use windows system path with slash(/)
    // windows example:
    const normalizedSource = getWindowsPathForWebsquare(source); // src
    const normalizedTarget = getWindowsPathForWebsquare(target); // base + '_wpack_'
    const normalizedBase = getWindowsPathForWebsquare(base); // base

    return `${selectExecutable()} -s "${normalizedSource}" -d "${normalizedTarget}" -b "${normalizedBase}" -j ${minifyJS} -c ${minifyCSS} -nd ${removeDebuggingCode}`;
};

export const makeConvertCommand = (
    source: string,
    target: string,
    base: string
) => {
    //, nodebug: string, jsminify: number, cssminify: number
    // Normalize paths for the current OS
    const normalizedSource = path.normalize(source); // src
    const normalizedTarget = path.normalize(target); // base + '_wpack_'
    const normalizedBase = path.normalize(base); // base

    return `"${selectExecutable()} -s '${normalizedSource}' -d '${normalizedTarget}' -b '${normalizedBase}' -j ${minifyJS} -c ${minifyCSS} -nd ${removeDebuggingCode}"`;
};

// delete single file
export const makeRemoveCommand = (
    source: string,
    target: string,
    base: string
) => {
    const relativeSourcePath = source.replace(base, "").replace(".xml", ".js");

    // Normalize the path for the current OS
    const normalizedRemoveTargetPath = path.normalize(
        path.join(target, relativeSourcePath)
    );

    if (os.platform() === "win32") {
        return `del /s /q ${getWindowsPath(normalizedRemoveTargetPath)}`;
    } else {
        return `"rm -rf '${normalizedRemoveTargetPath}'"`;
    }
};

// absolute path
// source src/main/webapp/wq
// target src/main/webapp/_wpack_/
// base   src/main/webapp/

// delete all files
export const makeRemoveAllCommand = (
    source: string,
    target: string,
    base: string
) => {
    const relativeSourcePath = source.replace(base, "");

    // Normalize the path for the current OS
    const normalizedRemoveTargetPath = path.normalize(
        path.join(target, relativeSourcePath)
    );
    // remove websquare *.js(output) files only
    if (os.platform() === "win32") {
        return `del /s /q ${getWindowsPath(normalizedRemoveTargetPath)}\\*.js`;
    } else {
        return `"find '${normalizedRemoveTargetPath}' -name '*.js' -exec rm -rf {} \\;"`;
    }
};

export const makeDeployCommand = (
    source: string,
    target: string,
    base: string,
    deployName: string
) => {
    const relativeSourcePath = source.replace(base, "").replace(".xml", ".js");

    // Normalize paths for the current OS
    const normalizedDeploySourcePath = path.normalize(
        path.join(target, relativeSourcePath)
    );
    const normalizedDeployTargetPath = path.normalize(
        path.join(base, "target", deployName, "_wpack_", relativeSourcePath)
    );

    if (os.platform() === "win32") {
        return `copy /y ${getWindowsPath(
            normalizedDeploySourcePath
        )} ${getWindowsPath(normalizedDeployTargetPath)}`;
    } else {
        return `"cp -f '${normalizedDeploySourcePath}' '${normalizedDeployTargetPath}'"`;
    }
};
