// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateAbTestHypothesis } from '../../services/api';
import { BeakerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AbTestHypothesisGenerator: React.FC = () => {
    const [feature, setFeature] = useState<string>('The color of the main call-to-action button on the homepage.');
    const [hypotheses, setHypotheses] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!feature.trim()) {
            setError('Please describe the feature to test.');
            return;
        }
        setIsLoading(true);
        setError('');
        setHypotheses('');
        try {
            const stream = generateAbTestHypothesis(feature);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setHypotheses(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [feature]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BeakerIcon />
                    <span className="ml-3">A/B Test Hypothesis Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a feature to get AI-generated A/B test ideas.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="feature-input" className="text-sm font-medium text-text-secondary mb-2">Feature or Element to Test</label>
                    <textarea
                        id="feature-input"
                        value={feature}
                        onChange={(e) => setFeature(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Hypotheses'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {hypotheses && <MarkdownRenderer content={hypotheses} />}
                </div>
            </div>
        </div>
    );
};
