// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateBusinessPlan } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GenerateBusinessPlan: React.FC = () => {
    const [idea, setIdea] = useState<string>('An online service that uses AI to create personalized travel itineraries.');
    const [plan, setPlan] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!idea.trim()) {
            setError('Please provide a business idea.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan('');
        try {
            const result = await generateBusinessPlan(idea);
            setPlan(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [idea]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">AI Business Plan Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide a business idea and get a basic business plan outline.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="idea-input" className="text-sm font-medium text-text-secondary mb-2">Business Idea</label>
                    <textarea
                        id="idea-input"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Business Plan'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {plan && <MarkdownRenderer content={plan} />}
                </div>
            </div>
        </div>
    );
};
