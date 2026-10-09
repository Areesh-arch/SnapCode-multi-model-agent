const vscode = acquireVsCodeApi();

document.getElementById('generateBtn').addEventListener('click', () => {
    const provider = document.getElementById('modelSelect').value;
    const prompt = document.getElementById('promptInput').value;
    
    const btn = document.getElementById('generateBtn');
    btn.textContent = 'Generating...';
    btn.disabled = true;

    vscode.postMessage({
        command: 'generate',
        provider: provider,
        prompt: prompt
    });
});

window.addEventListener('message', event => {
    const message = event.data;
    const outputArea = document.getElementById('outputArea');
    const btn = document.getElementById('generateBtn');
    
    btn.textContent = 'Generate Workspace Architecture';
    btn.disabled = false;
    outputArea.style.display = 'block';

    if (message.command === 'showResult') {
        outputArea.textContent = message.text;
    } else if (message.command === 'showError') {
        outputArea.textContent = 'Error: ' + message.text;
    }
});