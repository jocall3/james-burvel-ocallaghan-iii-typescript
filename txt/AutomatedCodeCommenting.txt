// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `function calculateTotalPrice(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i].price > 100) {
      total += items[i].price * 0.9;
    } else {
      total += items[i].price;
    }
  }
  return total;
}`;

export const AutomatedCodeCommenting: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [commentedCode, setCommentedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!code.trim()) {
            setError('Please enter some code to comment.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCommentedCode('');
        try {
            const prompt = `Add explanatory comments to the following code snippet. Only output the commented code, wrapped in a markdown code block.\n\n\`\`\`\n${code}\n\`\`\``;
            const stream = streamContent(prompt, "You are an expert at writing clear and concise code comments.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setCommentedCode(fullResponse);
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
                    <DocumentTextIcon />
                    <span className="ml-3">AI Code Commenting</span>
                </h1>
                <p className="text-text-secondary mt-1">Automatically add explanatory comments to your code.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Uncommented Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Add Comments'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Commented Code</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {commentedCode && <MarkdownRenderer content={commentedCode} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
