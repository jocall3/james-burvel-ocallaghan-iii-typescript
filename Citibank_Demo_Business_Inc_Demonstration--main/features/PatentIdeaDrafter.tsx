// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const PatentIdeaDrafter: React.FC = () => {
    const [idea, setIdea] = useState<string>('A method for using AI to predict stock market trends based on social media sentiment.');
    const [draft, setDraft] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!idea.trim()) {
            setError('Please describe your invention idea.');
            return;
        }
        setIsLoading(true);
        setError('');
        setDraft('');
        try {
            const prompt = `Draft a preliminary patent application abstract and claims for the following invention: "${idea}"`;
            const stream = streamContent(prompt, "You are a patent agent AI assistant.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setDraft(fullResponse);
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
                    <DocumentTextIcon />
                    <span className="ml-3">Patent Idea Drafter</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe an invention to generate a preliminary patent draft.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="idea-input" className="text-sm font-medium text-text-secondary mb-2">Invention Idea</label>
                    <textarea
                        id="idea-input"
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Draft Patent Idea'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {draft && <MarkdownRenderer content={draft} />}
                </div>
            </div>
        </div>
    );
};
