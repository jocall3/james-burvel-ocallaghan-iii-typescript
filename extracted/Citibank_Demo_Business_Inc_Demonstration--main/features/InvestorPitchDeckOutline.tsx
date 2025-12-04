// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { outlinePitchDeck } from '../../services/api';
import { PresentationChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const InvestorPitchDeckOutline: React.FC = () => {
    const [idea, setIdea] = useState<string>('A mobile app that uses AI to identify plants from photos and provide care instructions.');
    const [outline, setOutline] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!idea.trim()) {
            setError('Please provide a business idea.');
            return;
        }
        setIsLoading(true);
        setError('');
        setOutline('');
        try {
            const stream = outlinePitchDeck(idea);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setOutline(fullResponse);
            }
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
                    <PresentationChartBarIcon />
                    <span className="ml-3">Investor Pitch Deck Outline</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a business idea to create a 10-slide pitch deck structure.</p>
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
                        {isLoading ? <LoadingSpinner /> : 'Generate Outline'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {outline && <MarkdownRenderer content={outline} />}
                </div>
            </div>
        </div>
    );
};