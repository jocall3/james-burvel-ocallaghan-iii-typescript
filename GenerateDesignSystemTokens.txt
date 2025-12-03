// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateDesignTokens } from '../../services/api';
import { ThemeDesignerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GenerateDesignSystemTokens: React.FC = () => {
    const [description, setDescription] = useState<string>('A modern, minimalist brand with a primary color of electric blue. Use a geometric sans-serif font.');
    const [tokens, setTokens] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please provide a brand description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTokens('');
        try {
            const stream = generateDesignTokens(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setTokens(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [description]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ThemeDesignerIcon />
                    <span className="ml-3">AI Design System Token Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a comprehensive set of design tokens from a brand description.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Brand Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Tokens'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {tokens && <MarkdownRenderer content={tokens} />}
                </div>
            </div>
        </div>
    );
};
