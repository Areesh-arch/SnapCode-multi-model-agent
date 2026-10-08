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