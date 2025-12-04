// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateCompetitiveAnalysis } from '../../services/api';
import { BuildingStorefrontIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const CompetitiveAnalysisGenerator: React.FC = () => {
    const [competitors, setCompetitors] = useState<string>('Zoom, Microsoft Teams, Google Meet');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!competitors.trim()) {
            setError('Please list some competitors.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = generateCompetitiveAnalysis(competitors);
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
    }, [competitors]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BuildingStorefrontIcon />
                    <span className="ml-3">Competitive Analysis Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Input competitor names or URLs to get an AI-generated analysis.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="competitors-input" className="text-sm font-medium text-text-secondary mb-2">Competitors (comma-separated)</label>
                    <textarea
                        id="competitors-input"
                        value={competitors}
                        onChange={(e) => setCompetitors(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Analysis'}
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
