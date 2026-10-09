import * as vscode from 'vscode';

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
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SnapCode AI Agent</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 16px;
                    margin: 0;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                h2 {
                    margin-bottom: 4px;
                    color: var(--vscode-textLink-foreground);
                }
                .subtitle {
                    font-size: 12px;
                    opacity: 0.8;
                    margin-top: 0;
                }
                label {
                    font-size: 12px;
                    font-weight: bold;
                    opacity: 0.9;
                }
                select, textarea, button {
                    font-family: inherit;
                    font-size: 13px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border, transparent);
                    border-radius: 4px;
                    padding: 8px;
                }
                select:focus, textarea:focus {
                    outline: 1px solid var(--vscode-focusBorder);
                }
                textarea {
                    resize: vertical;
                    min-height: 100px;
                }
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    font-weight: bold;
                    cursor: pointer;
                    border: none;
                    padding: 10px;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>⚡ SnapCode Agent</h2>
                <p class="subtitle">Model-Agnostic Workspace Scaffolder</p>

                <label for="modelSelect">Select AI Provider / Model</label>
                <select id="modelSelect">
                    <option value="deepseek">DeepSeek (DeepSeek-Chat)</option>
                    <option value="claude">Anthropic Claude (3.5 Sonnet)</option>
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="gemini">Google Gemini (Gemini 2.5 Pro)</option>
                </select>

                <label for="promptInput">What would you like to build?</label>
                <textarea id="promptInput" placeholder="e.g., Create a full-stack Express & React app structure with authentication..."></textarea>

                <button id="generateBtn">Generate Workspace Architecture</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                document.getElementById('generateBtn').addEventListener('click', () => {
                    const provider = document.getElementById('modelSelect').value;
                    const prompt = document.getElementById('promptInput').value;

                    vscode.postMessage({
                        command: 'generate',
                        provider: provider,
                        prompt: prompt
                    });
                });
            </script>
        </body>
        </html>`;
    }
}