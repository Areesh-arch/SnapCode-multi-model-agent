import * as vscode from 'vscode';
import { SnapCodePanel } from './webview/panel';

export function activate(context: vscode.ExtensionContext) {
    console.log('SnapCode extension is now active!');

    let disposable = vscode.commands.registerCommand('snapcode.openAgent', () => {
        SnapCodePanel.createOrShow(context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}