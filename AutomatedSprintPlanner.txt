// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ClipboardDocumentIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleBacklog = `
- User authentication (High priority, 8 story points)
- Profile page (Medium priority, 5 story points)
- Fix login bug (High priority, 3 story points)
- Onboarding tour (Low priority, 5 story points)
`;

export const AutomatedSprintPlanner: React.FC = () => {
    const [backlog, setBacklog] = useState<string>(exampleBacklog);
    const [plan, setPlan] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!backlog.trim()) {
            setError('Please provide a product backlog.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPlan('');
        try {
            const prompt = `Create a sprint plan for a 2-week sprint with a capacity of 20 story points, using this product backlog. Prioritize high-priority items. Format as a markdown list. Backlog:\n${backlog}`;
            const stream = streamContent(prompt, "You are a Scrum Master and agile project management expert.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setPlan(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [backlog]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ClipboardDocumentIcon />
                    <span className="ml-3">Automated Sprint Planner</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide a product backlog to generate a sprint plan.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="backlog-input" className="text-sm font-medium text-text-secondary mb-2">Product Backlog</label>
                    <textarea
                        id="backlog-input"
                        value={backlog}
                        onChange={(e) => setBacklog(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Sprint Plan'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Sprint Plan</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {plan && <MarkdownRenderer content={plan} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
