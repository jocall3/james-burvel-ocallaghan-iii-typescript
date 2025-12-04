// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { prioritizeFeatures } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFeatures = `
- Feature A: Reach=100, Impact=3, Confidence=0.8, Effort=5
- Feature B: Reach=50, Impact=2, Confidence=0.9, Effort=2
- Feature C: Reach=200, Impact=1, Confidence=1.0, Effort=3
`;

export const FeaturePrioritizationAssistant: React.FC = () => {
    const [features, setFeatures] = useState<string>(exampleFeatures);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!features.trim()) {
            setError('Please provide features to prioritize.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = prioritizeFeatures(features);
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
    }, [features]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">Feature Prioritization Assistant</span>
                </h1>
                <p className="text-text-secondary mt-1">Input features with RICE parameters to get a prioritized list.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="features-input" className="text-sm font-medium text-text-secondary mb-2">Features List (with RICE scores)</label>
                    <textarea
                        id="features-input"
                        value={features}
                        onChange={(e) => setFeatures(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Prioritize Features'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Prioritized List</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {report && <MarkdownRenderer content={report} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
