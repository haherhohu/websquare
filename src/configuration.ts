import path from 'path';
import * as vscode from 'vscode';

class ConfigurationManager {
    private static instance: ConfigurationManager;
    private config: vscode.WorkspaceConfiguration;
    // Add a property to store configuration values
    private configvalues: {
        deployName: string | undefined;
        websquareSource: string | undefined;
        websquareBase: string | undefined;
        removeDebuggingCode: boolean | undefined;
        minifyJS: string | undefined;
        minifyCSS: boolean | undefined;
    };

    // Create an output channel for logging
    private outputChannel: vscode.OutputChannel;

    // Construct the path to the extensions directory (extensions home dir)
    private extensionHome: string;
    private workspaceHome: string;

    private disposables: vscode.Disposable[] = [];

    private constructor() {
        // Get the configuration object for your extension
        this.config = vscode.workspace.getConfiguration('websquare');
        // get configuration values
        // Retrieve the value of the 'deployName' setting
        this.configvalues = {
            deployName : this.config.get<string>('deployName'),
            websquareSource : this.config.get<string>('websquareSource'),
            websquareBase : this.config.get<string>('websquareBase'),
            removeDebuggingCode : this.config.get<boolean>('removeDebuggingCode'),
            minifyJS : this.config.get<string>('minifyJS'),
            minifyCSS : this.config.get<boolean>('minifyCSS'),
        };
        // logging and environment variables
        this.outputChannel = vscode.window.createOutputChannel('Websquare Logs');
        // global environment variables
        this.extensionHome = vscode.extensions.getExtension('haherhohu.websquare')?.extensionPath || '';
        this.workspaceHome = vscode.workspace.workspaceFolders?.[0].uri.path || '';

        // Listen for configuration changes
        const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
            // Iterate over all keys in the configvalues object
            for (const key in this.configvalues) {
                if (event.affectsConfiguration(`websquare.${key}`)) {
                    // Dynamically update the specific configuration value
                    (this.configvalues as any)[key] = vscode.workspace.getConfiguration('websquare').get<any>(key);
                    // Alert the updated value
                    vscode.window.showInformationMessage(`Configuration updated: ${key} = ${(this.configvalues as any)[key]}`);
                }
            }
        });  

        this.disposables.push(disposable);
    }

    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }

    public getDeployName(): string {
        return this.configvalues.deployName?.toString() || '';
    }
    public getWebsquareSource(): string {
        return path.join(this.workspaceHome, this.configvalues.websquareSource?.toString() || '/src/main/webapp/');
    }
    public getWebsquareBase(): string {
        return path.join(this.workspaceHome, this.configvalues.websquareBase?.toString() || '/src/main/webapp/');
    }
    public getRemoveDebuggingCode(): string {
        return this.configvalues.removeDebuggingCode?.toString() || 'false';
    }
    public getMinifyJS(): number {
        if(this.configvalues.minifyJS === 'none'){ return 0;}
        if(this.configvalues.minifyJS === 'normal'){ return 1; }
        if(this.configvalues.minifyJS === 'high'){ return 2; }
        return 0;
    }
    public getMinifyCSS(): number {
        return this.configvalues.minifyCSS === true ? 1 : 0;
    }

    public getExtensionHome(): string {
        let home = this.extensionHome;
        if (!home.startsWith('/') || !home.startsWith('\\' )){ home = '\\' + home; }
        return home;
    }

    public getWorkspaceHome(): string {
        return this.workspaceHome;    
    }
    
    public getOutputChannel(): vscode.OutputChannel {
        return this.outputChannel;
    }

    public refreshConfiguration(): void {
        this.config = vscode.workspace.getConfiguration('websquare');
        this.configvalues = {
            deployName : this.config.get<string>('deployName'),
            websquareSource : this.config.get<string>('websquareSource'),
            websquareBase : this.config.get<string>('websquareBase'),
            removeDebuggingCode : this.config.get<boolean>('removeDebuggingCode'),
            minifyJS : this.config.get<string>('minifyJS'),
            minifyCSS : this.config.get<boolean>('minifyCSS'),
        };
    }

    public dispose(): void {
        // Dispose of all registered disposables
        this.disposables.forEach((disposable) => disposable.dispose());
        this.disposables = [];
    }
}

export const configurationManager = ConfigurationManager.getInstance();