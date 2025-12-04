// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateDataVisualizationCode } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleData = `[{"year": 2020, "revenue": 100}, {"year": 2021, "revenue": 120}]`;

export const DataVisualizationTool: React.FC = () => {
    const [data, setData] = useState<string>(exampleData);
    const [prompt, setPrompt] = useState<string>('a line chart of revenue over year');
    const [code, setCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!data.trim() || !prompt.trim()) {
            setError('Please provide data and a description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCode('');
        try {
            const stream = generateDataVisualizationCode(data, prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setCode(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [data, prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">Data Visualization Tool</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate visualization code from your data.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="data-input" className="text-sm font-medium text-text-secondary mb-2">Data (JSON)</label>
                    <textarea id="data-input" value={data} onChange={e => setData(e.target.value)} className="h-40 p-2 bg-surface border border-border rounded-md resize-none font-mono text-sm"/>
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary my-2">Description</label>
                    <input id="prompt-input" type="text" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full p-2 bg-surface border border-border rounded-md"/>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Chart Code'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Code</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {code && <MarkdownRenderer content={code} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
