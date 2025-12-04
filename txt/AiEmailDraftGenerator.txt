// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { draftEmail } from '../../services/api';
import { PaperAirplaneIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const AiEmailDraftGenerator: React.FC = () => {
    const [context, setContext] = useState<string>('A follow-up email to a client after a project kickoff meeting, summarizing the next steps.');
    const [draft, setDraft] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!context.trim()) {
            setError('Please provide context for the email.');
            return;
        }
        setIsLoading(true);
        setError('');
        setDraft('');
        try {
            const stream = draftEmail(context);
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
    }, [context]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <PaperAirplaneIcon />
                    <span className="ml-3">AI Email Draft Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Draft professional emails based on context.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="context-input" className="text-sm font-medium text-text-secondary mb-2">Email Context</label>
                    <textarea
                        id="context-input"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Draft Email'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {draft && <pre className="whitespace-pre-wrap">{draft}</pre>}
                </div>
            </div>
        </div>
    );
};
