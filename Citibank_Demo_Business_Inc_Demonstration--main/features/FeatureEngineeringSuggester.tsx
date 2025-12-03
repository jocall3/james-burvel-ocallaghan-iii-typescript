// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { suggestFeatureEngineering } from '../../services/api';
import { SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const FeatureEngineeringSuggester: React.FC = () => {
    const [problem, setProblem] = useState<string>('Predicting customer lifetime value based on purchase history, timestamps, and product categories.');
    const [suggestions, setSuggestions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!problem.trim()) {
            setError('Please describe the machine learning problem.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions('');
        try {
            const stream = suggestFeatureEngineering(problem);
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
    }, [problem]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <SparklesIcon />
                    <span className="ml-3">Feature Engineering Suggester</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe an ML problem to get suggestions for potential features to engineer.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="problem-input" className="text-sm font-medium text-text-secondary mb-2">Machine Learning Problem</label>
                    <textarea
                        id="problem-input"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Features'}
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
