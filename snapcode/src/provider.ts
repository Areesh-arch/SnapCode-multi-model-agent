import * as vscode from 'vscode';

export class AIProvider {
    public static async generateCode(provider: string, prompt: string): Promise<string> {
        // VS Code configuration se API keys read karne ka tareeqa
        const config = vscode.workspace.getConfiguration('snapcode');
        
        switch (provider) {
            case 'gemini':
                return await this.callGemini(prompt, config);
            case 'openai':
                return await this.callOpenAI(prompt, config);
            case 'claude':
                return await this.callClaude(prompt, config);
            case 'deepseek':
                return await this.callDeepSeek(prompt, config);
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }

    private static async callGemini(prompt: string, config: vscode.WorkspaceConfiguration): Promise<string> {
        const apiKey = config.get<string>('geminiApiKey');
        if (!apiKey) {
            throw new Error('Gemini API Key is missing! Please configure it in VS Code settings (Snapcode: Gemini Api Key).');
        }

        // Gemini API endpoint (using gemini-2.5-pro or gemini-1.5-pro)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `You are SnapCode, an expert AI coding agent. Generate clean, modular, and production-ready code structure based on the following request:\n\n${prompt}` }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorData}`);
        }

        const data: any = await response.json();
        const candidate = data.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
            throw new Error('Received an empty response from Gemini.');
        }

        return candidate.content.parts[0].text;
    }

    private static async callOpenAI(prompt: string, config: vscode.WorkspaceConfiguration): Promise<string> {
        const apiKey = config.get<string>('openaiApiKey');
        if (!apiKey) {
            throw new Error('OpenAI API Key is missing!');
        }
        return `[OpenAI Response Placeholder] Generated architecture for: "${prompt}"`;
    }

    private static async callClaude(prompt: string, config: vscode.WorkspaceConfiguration): Promise<string> {
        const apiKey = config.get<string>('claudeApiKey');
        if (!apiKey) {
            throw new Error('Claude API Key is missing!');
        }
        return `[Claude Response Placeholder] Generated code for: "${prompt}"`;
    }

    private static async callDeepSeek(prompt: string, config: vscode.WorkspaceConfiguration): Promise<string> {
        const apiKey = config.get<string>('deepseekApiKey');
        if (!apiKey) {
            throw new Error('DeepSeek API Key is missing!');
        }
        return `[DeepSeek Response Placeholder] Generated structure for: "${prompt}"`;
    }
}