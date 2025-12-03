// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { CpuChipIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
import React from 'react';
import { render } from 'react-dom';
import './styles.css';

const App = () => <h1>Hello, World!</h1>;

render(<App />, document.getElementById('root'));
`;

export const CodebaseTechnologyDetector: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!code.trim()) {
            setError('Please provide code to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const prompt = `Analyze this code snippet and identify the technologies, frameworks, and libraries being used. Provide a list. Code:\n\`\`\`\n${code}\n\`\`\``;
            const stream = streamContent(prompt, "You are an expert at identifying software technologies.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setReport(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CpuChipIcon />
                    <span className="ml-3">Codebase Technology Detector</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste a code snippet to detect the technologies being used.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Code Snippet</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Detect Technologies'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Detected Technologies</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {report && <MarkdownRenderer content={report} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
