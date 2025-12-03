// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { recommendFileSharing } from '../../services/api';
import { PaperAirplaneIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiPoweredFileSharingRecommendations: React.FC = () => {
    const [context, setContext] = useState<string>('Sharing a large video file with a client for review.');
    const [recommendation, setRecommendation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleRecommend = useCallback(async () => {
        if (!context.trim()) {
            setError('Please provide a sharing context.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRecommendation('');
        try {
            const stream = recommendFileSharing(context);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setRecommendation(fullResponse);
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
                    <span className="ml-3">AI File Sharing Recommendations</span>
                </h1>
                <p className="text-text-secondary mt-1">Get AI suggestions on the best way to share a file based on its content and recipient.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="context-input" className="text-sm font-medium text-text-secondary mb-2">Sharing Scenario</label>
                    <textarea
                        id="context-input"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                        placeholder="e.g., Sending a sensitive contract to a lawyer."
                    />
                    <button onClick={handleRecommend} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Get Recommendation'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {recommendation && <MarkdownRenderer content={recommendation} />}
                </div>
            </div>
        </div>
    );
};
