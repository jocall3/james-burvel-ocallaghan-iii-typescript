// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { performResearch } from '../../services/api';
import { MagnifyingGlassIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiPoweredResearchAssistant: React.FC = () => {
    const [topic, setTopic] = useState<string>('the impact of WebAssembly on frontend development');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleResearch = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a research topic.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = performResearch(topic);
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
    }, [topic]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MagnifyingGlassIcon />
                    <span className="ml-3">AI-Powered Research Assistant</span>
                </h1>
                <p className="text-text-secondary mt-1">Get a summary, key points, and sources for any topic.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a research topic..."
                        className="flex-grow p-3 bg-surface border border-border rounded-md"
                    />
                    <button onClick={handleResearch} disabled={isLoading} className="btn-primary px-6 py-3">
                        {isLoading ? <LoadingSpinner /> : 'Research'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && <MarkdownRenderer content={report} />}
                </div>
            </div>
        </div>
    );
};
