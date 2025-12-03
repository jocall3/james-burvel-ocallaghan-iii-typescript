// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { draftGdd } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GameDesignDocumentDrafter: React.FC = () => {
    const [concept, setConcept] = useState<string>('A cozy life simulation game where you run a magical bookstore in a small town.');
    const [gdd, setGdd] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!concept.trim()) {
            setError('Please provide a game concept.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGdd('');
        try {
            const stream = draftGdd(concept);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setGdd(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [concept]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Game Design Document (GDD) Drafter</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a game concept to draft a GDD outline.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="concept-input" className="text-sm font-medium text-text-secondary mb-2">Game Concept</label>
                    <textarea
                        id="concept-input"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Draft GDD'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {gdd && <MarkdownRenderer content={gdd} />}
                </div>
            </div>
        </div>
    );
};
