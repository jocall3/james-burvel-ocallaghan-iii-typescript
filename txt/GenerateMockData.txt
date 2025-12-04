// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateMockData } from '../../services/api';
import { JsonTreeIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GenerateMockData: React.FC = () => {
    const [schema, setSchema] = useState<string>('A list of users with id, name, email, and a boolean isActive status.');
    const [data, setData] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!schema.trim()) {
            setError('Please provide a schema or description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setData('');
        try {
            const stream = generateMockData(schema);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setData(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [schema]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <JsonTreeIcon />
                    <span className="ml-3">AI Mock Data Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate realistic mock data based on a schema or description.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="schema-input" className="text-sm font-medium text-text-secondary mb-2">Schema Description</label>
                    <textarea
                        id="schema-input"
                        value={schema}
                        onChange={(e) => setSchema(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Mock Data'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {data && <MarkdownRenderer content={data} />}
                </div>
            </div>
        </div>
    );
};
