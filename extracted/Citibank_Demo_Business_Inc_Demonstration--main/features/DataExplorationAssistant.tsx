// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { assistDataExploration } from '../../services/api';
import { MicroscopeIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const DataExplorationAssistant: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('My DataFrame has columns "age", "city", and "purchase_amount". I want to find the average purchase amount per city.');
    const [suggestions, setSuggestions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe your data and goal.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions('');
        try {
            const stream = assistDataExploration(prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSuggestions(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MicroscopeIcon />
                    <span className="ml-3">Data Exploration Assistant (Pandas)</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your DataFrame and goal to get Pandas operation suggestions.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary mb-2">Data Description & Goal</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Pandas Operations'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {suggestions && <MarkdownRenderer content={suggestions} />}
                </div>
            </div>
        </div>
    );
};
