import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AIProvider } from '../provider';

export class SnapCodePanel {
    public static currentPanel: SnapCodePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        this._update();

        this._panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'generate':
                        try {
                            const responseText = await AIProvider.generateCode(message.provider, message.prompt);
                            vscode.window.showInformationMessage(`[SnapCode] Success from ${message.provider}!`);
                            
                            this._panel.webview.postMessage({
                                command: 'showResult',
                                text: responseText
                            });
                        } catch (error: any) {
                            vscode.window.showErrorMessage(`[SnapCode Error] ${error.message}`);
                            this._panel.webview.postMessage({
                                command: 'showError',
                                text: error.message
                            });
                        }
                        return;
                }
            },
            null,
            this._disposables
        );

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SnapCodePanel.currentPanel) {
            SnapCodePanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'snapcodeAgent',
            'SnapCode AI Agent',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        SnapCodePanel.currentPanel = new SnapCodePanel(panel, extensionUri);
    }

    public dispose() {
        SnapCodePanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview(): string {
        const webview = this._panel.webview;

        // Disk se paths map karna
        const htmlPath = path.join(this._extensionUri.fsPath, 'src', 'webview', 'ui.html');
        const stylePath = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'src', 'webview', 'style.css')));
        const scriptPath = webview.asWebviewUri(vscode.Uri.file(path.join(this._extensionUri.fsPath, 'src', 'webview', 'main.js')));

        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Placeholders ko active URIs se replace karna
        htmlContent = htmlContent
            .replace('{{styleUri}}', stylePath.toString())
            .replace('{{scriptUri}}', scriptPath.toString());

        return htmlContent;
    }
}