// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateDatabaseQuery } from '../../services/api';
import { ServerStackIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GenerateDatabaseQuery: React.FC = () => {
    const [description, setDescription] = useState<string>('Find all users who signed up in the last 30 days and have made more than 5 purchases.');
    const [query, setQuery] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe the query you need.');
            return;
        }
        setIsLoading(true);
        setError('');
        setQuery('');
        try {
            const stream = generateDatabaseQuery(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setQuery(fullResponse);
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
                    <ServerStackIcon />
                    <span className="ml-3">AI Database Query Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate SQL or ORM queries from a natural language description.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Query Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate SQL Query'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {query && <MarkdownRenderer content={query} />}
                </div>
            </div>
        </div>
    );
};
