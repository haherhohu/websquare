import * as vscode from 'vscode';
import { spawn, ExecException } from 'child_process';

import {
	makeConvertCommand,
	makeCleanCommand,
	makeDeployCommand,
} from './utils';

import { configurationManager } from './configuration';
import path from 'path';

const outputChannel = configurationManager.getOutputChannel();
const workspaceHome = configurationManager.getWorkspaceHome();
const base = configurationManager.getWebsquareBase(); // src/main/webapp/
const target = path.join(base, '_wpack_/'); // src/main/webapp/_wpack_/
const extensionHome = configurationManager.getExtensionHome();
const deployName = configurationManager.getDeployName();

export const setOutputChannel = (outputChannel: vscode.OutputChannel) => {
    outputChannel = outputChannel;
};

export const notificator = (error:ExecException|null, stdout:string|Buffer<ArrayBufferLike>, stderr:string|Buffer<ArrayBufferLike>) => {
    if (error) {
        outputChannel.appendLine(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        outputChannel.appendLine(`stderr: ${stderr}`);
        return;
    }
    outputChannel.appendLine(`stdout: ${stdout}`);
};

export const runCommandWithRealtimeOutput = (command: string, args: string[], cwd: string) => {
    return new Promise<void>((resolve, reject) => {
        const process = spawn(command, args, { cwd, shell: true });

        // Capture stdout and write to the output channel in real-time
        process.stdout.on('data', (data) => {
            outputChannel.appendLine(`stdout: ${data}`);
        });

        // Capture stderr and write to the output channel in real-time
        process.stderr.on('data', (data) => {
            outputChannel.appendLine(`stderr: ${data}`);
        });

        // Handle process exit
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        // Handle errors
        process.on('error', (error) => {
            outputChannel.appendLine(`Error: ${error.message}`);
            reject(error);
        });
    });
};

// TODO: test
export const runCommand = (command: string, cwd: string) => {
    outputChannel.appendLine(`Executing command: ${command}`);
    return runCommandWithRealtimeOutput('sh', ['-c', command], cwd );
};

// run websquare converter command
export const runConverter = async (websquareFilePath: string, dodeploy : boolean = true) => {
    outputChannel.appendLine(`Running converter for file: ${websquareFilePath}`);

    try {
        // clean target file
        // source src/main/webapp/wq
        // target src/main/webapp/_wpack_/
        // base   src/main/webapp/
        outputChannel.appendLine(`Cleaning target directory: ${target}`);
        const clean = makeCleanCommand(websquareFilePath, target, base);
        outputChannel.appendLine(`Executing clean command: ${clean}`);
        await runCommandWithRealtimeOutput('sh', ['-c', clean], extensionHome );

        // Execute a shell command in the extension directory
        const convert = makeConvertCommand(websquareFilePath, target, base);
        outputChannel.appendLine(`Executing conversion command: ${convert}`);
        await runCommandWithRealtimeOutput('sh', ['-c', convert], extensionHome );
        
        // deploy command
        if(dodeploy) {
            if(!deployName)
            {
                vscode.window.showErrorMessage('Please set the deployName in settings.');
                return;
            }
            const deploy = makeDeployCommand(websquareFilePath, target, workspaceHome, deployName);			
            outputChannel.appendLine(`Executing deploy command: ${deploy}`);
            await runCommandWithRealtimeOutput('sh', ['-c', deploy], extensionHome );
        }
        vscode.window.showInformationMessage('Process complete!');
    } catch (error) {
        outputChannel.appendLine(`Error: ${error}`);
        vscode.window.showErrorMessage('An error occurred during the conversion process.');
    }
};

export const runConverterWithProgress = async (websquareFilePath: string, dodeploy: boolean = true) => {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification, // Show in the notification area
            title: 'Running Websquare Converter: ', // Title of the progress bar
            cancellable: false, // Make it non-cancellable
        },
        async (progress) => {
            progress.report({ message: 'Cleaning target files...' });

            // Clean target file
            const clean = makeCleanCommand(websquareFilePath, target, base);
            outputChannel.appendLine(`Executing clean command: ${clean}`);
            await runCommandWithRealtimeOutput('sh', ['-c', clean], extensionHome );

            progress.report({ message: 'Converting files...' });

            // Convert file
            const convert = makeConvertCommand(websquareFilePath, target, base);
            outputChannel.appendLine(`Executing conversion command: ${convert}`);
            await runCommandWithRealtimeOutput('sh', ['-c', convert], extensionHome );

            if (dodeploy) {
                progress.report({ message: 'Deploying files...' });

                if (!deployName) {
                    vscode.window.showErrorMessage('Please set the deployName in settings.');
                    return;
                }

                // Deploy file
                const deploy = makeDeployCommand(websquareFilePath, target, workspaceHome, deployName);
                outputChannel.appendLine(`Executing deploy command: ${deploy}`);
                await runCommandWithRealtimeOutput('sh', ['-c', deploy], extensionHome );
            }

            progress.report({ message: 'Process complete!' });
            vscode.window.showInformationMessage('Websquare conversion process completed successfully!');
        }
    );
};