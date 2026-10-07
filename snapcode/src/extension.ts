import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('SnapCode extension is now active!');

    let disposable = vscode.commands.registerCommand('snapcode.helloWorld', () => {
        const panel = vscode.window.createWebviewPanel(
            'snapCodePanel',
            'SnapCode AI Agent',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getWebviewContent();
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(): string {
    return 'SnapCode Agent'; }