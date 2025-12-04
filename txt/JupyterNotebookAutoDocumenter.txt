// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { documentJupyterNotebook } from '../../services/api';
import { MicroscopeIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
import pandas as pd
df = pd.read_csv('data.csv')
print(df.head())

# Filter for users older than 30
df_filtered = df[df['age'] > 30]
`;

export const JupyterNotebookAutoDocumenter: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [notebook, setNotebook] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!code.trim()) {
            setError('Please provide notebook code.');
            return;
        }
        setIsLoading(true);
        setError('');
        setNotebook('');
        try {
            const stream = documentJupyterNotebook(code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setNotebook(fullResponse);
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
                    <MicroscopeIcon />
                    <span className="ml-3">Jupyter Notebook Auto-Documenter</span>
                </h1>
                <p className="text-text-secondary mt-1">AI adds markdown explanations to a Jupyter notebook's code cells.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Jupyter Notebook Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Auto-Document Notebook'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Documented Notebook</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {notebook && <MarkdownRenderer content={notebook} />}
                    </div>
                </div>
            </div>
        </div>
    );
};