// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { convertToAsyncAwait } from '../../services/api';
import { ArrowPathIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
`;

export const ConvertToAsyncAwait: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [refactoredCode, setRefactoredCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleRefactor = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter code to refactor.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRefactoredCode('');
        try {
            const stream = await convertToAsyncAwait(code);
            let fullResponse = '';
            // This service uses streamContent but we consume it fully here
            for await (const chunk of stream) {
                fullResponse += chunk;
            }
            setRefactoredCode(fullResponse);
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
                    <ArrowPathIcon />
                    <span className="ml-3">Refactor to Async/Await</span>
                </h1>
                <p className="text-text-secondary mt-1">Automatically refactor callback or .then() based code to modern async/await syntax.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Original Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleRefactor} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Refactor'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Refactored Code</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {refactoredCode && <MarkdownRenderer content={refactoredCode} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
