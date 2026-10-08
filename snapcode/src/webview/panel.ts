import * as vscode from 'vscode';
import * as fs from 'fs';

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
            message => {
                switch (message.command) {
                    case 'generate':
                        vscode.window.showInformationMessage(
                            `[SnapCode] Model: ${message.provider} | Prompt: ${message.prompt}`
                        );
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
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'src', 'webview')
                ]
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
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'ui.html');
        const stylePath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'style.css');
        const scriptPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'main.js');

        const styleUri = webview.asWebviewUri(stylePath);
        const scriptUri = webview.asWebviewUri(scriptPath);

        let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

        return htmlContent
            .replace('{{styleUri}}', styleUri.toString())
            .replace('{{scriptUri}}', scriptUri.toString());
    }
}