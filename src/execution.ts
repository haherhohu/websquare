import * as vscode from 'vscode';
import * as os from 'os';

import { spawn, ExecException } from 'child_process';

import {
	wrapConvertCommand,
    wrapRemoveCommand,
	wrapRemoveAllCommand,
	wrapDeployCommand,
} from './utils';

import { configurationManager } from './configuration';
import path from 'path';
import { error } from 'console';

const outputChannel = configurationManager.getOutputChannel();
const workspaceHome = configurationManager.getWorkspaceHome();
const base = configurationManager.getWebsquareBase(); // src/main/webapp/
const target = path.join(base, '_wpack_/'); // src/main/webapp/_wpack_/
const extensionHome = configurationManager.getExtensionHome();
const deployName = configurationManager.getDeployName();

// run on windows git-bash (sh)
// normalized path only using shell and git-bash (windows os not working??)
const shell = 'sh'; //os.platform() === 'win32' ? 'cmd.exe' : 'sh';
const shellopt = '-c'; //os.platform() === 'win32' ? '/c' : '-c';

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

// command shortcut
export const runCommand = async (commandMaker: Function, args: string[], cwd: string) => {
    const cmd = commandMaker(args);
    outputChannel.appendLine(`Executing command: ${cmd}`);
    await runCommandWithRealtimeOutput(shell, [shellopt, cmd], cwd );
};

export const checkDeployName = (deployName: string) => {
    if (!deployName) {
        vscode.window.showErrorMessage('Please set the deployName in settings.');
        new Error('Error: Deploy name is not set.');
    }
};

// run websquare converter command
export const runConverterWithProgress = (websquareFilePath: string, dodeploy: boolean = true) => {

    const isSingleFile = (websquareFilePath.endsWith('.xml'));
    
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification, // Show in the notification area
            title: 'Running Websquare Converter: ', // Title of the progress bar
            cancellable: false, // Make it non-cancellable
        },
        async (progress) => {
            try {
                if(isSingleFile){
                    outputChannel.appendLine(`Running converter for file: ${websquareFilePath}`);
                }
                
                // source src/main/webapp/wq
                // target src/main/webapp/_wpack_/
                // base   src/main/webapp/
                // Clean target file
                if(!isSingleFile){
                    progress.report({ message: 'Cleaning target files...' });
                    await runCommand(wrapRemoveAllCommand, [websquareFilePath, target, base], extensionHome);
                }
                else{
                    await runCommand(wrapRemoveCommand, [websquareFilePath, target, base], extensionHome);
                }
                
                // Convert file
                if(!isSingleFile){progress.report({ message: 'Converting files...' });}
                await runCommand(wrapConvertCommand, [websquareFilePath, target, base], extensionHome);

                // Deploy file
                if (dodeploy) {
                    checkDeployName(deployName);
                    if(!isSingleFile){progress.report({ message: 'Deploying files...' });}
                    await runCommand(wrapDeployCommand, [websquareFilePath, target, workspaceHome, deployName], extensionHome); 
                }

                if(!isSingleFile){
                    progress.report({ message: 'Process complete!' });
                    vscode.window.showInformationMessage('Websquare conversion process completed successfully!');
                }
                else{
                    vscode.window.showInformationMessage('Process complete!');
                }
            } catch (error) {
                outputChannel.appendLine(`Error: ${error}`);
                vscode.window.showErrorMessage('An error occurred during the conversion process.');
            }
        }
    );
};