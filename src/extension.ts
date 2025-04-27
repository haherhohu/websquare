// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';

import {
	getCurrentDocument,
} from './utils';

import {
	runConverterWithProgress,
} from './execution';

import { configurationManager } from './configuration';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const outputChannel = configurationManager.getOutputChannel();
	const source = configurationManager.getWebsquareSource();

	// Log a message when the extension is activated
	outputChannel.appendLine('Websquare extension activated.');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	
	// start command registration
	const convert = vscode.commands.registerCommand('websquare.convert', async () => {
		const websquareFilePath = getCurrentDocument();

		if (!websquareFilePath) { 
			vscode.window.showErrorMessage('This command can only be used in XML files.');
            outputChannel.appendLine('Error: No valid XML file selected.');
			return; 
		}
        outputChannel.appendLine(`Executing "websquare.convert" for file: ${websquareFilePath}`);
		runConverterWithProgress(websquareFilePath, false);
	});

	const convertanddeploy = vscode.commands.registerCommand('websquare.convert_and_deploy', async () => {
		const websquareFilePath = getCurrentDocument();

		// error handling
		if (!websquareFilePath) { 
			vscode.window.showErrorMessage('This command can only be used in XML files.');
            outputChannel.appendLine('Error: No valid XML file selected.');
			return; 
		}
        outputChannel.appendLine(`Executing "websquare.convert_and_deploy" for file: ${websquareFilePath}`);
		runConverterWithProgress(websquareFilePath);
	});

	const convertall = vscode.commands.registerCommand('websquare.convert_all', async () => {
		runConverterWithProgress(source, false);
	});

	const convertallanddeploy = vscode.commands.registerCommand('websquare.convert_all_and_deploy', async () => {
		runConverterWithProgress(source);
	});

	// Register the commands
	context.subscriptions.push(convert);
	context.subscriptions.push(convertanddeploy);
	context.subscriptions.push(convertall);
	context.subscriptions.push(convertallanddeploy);
	
	// Log a message when the extension is deactivated
    context.subscriptions.push({
        dispose: () => outputChannel.appendLine('Websquare extension deactivated.'),
    });

}

// This method is called when your extension is deactivated
export function deactivate() { 
	// Dispose of the ConfigurationManager singleton
	configurationManager.dispose();	
}
