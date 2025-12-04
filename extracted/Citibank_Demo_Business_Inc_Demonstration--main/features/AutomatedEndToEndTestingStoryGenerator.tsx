// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateE2ETest } from '../../services/api';
import { UnitTestGeneratorIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AutomatedEndToEndTestingStoryGenerator: React.FC = () => {
    const [story, setStory] = useState<string>('As a user, I should be able to log in with my credentials and see my dashboard.');
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!story.trim()) {
            setError('Please provide a user story or flow.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');
        try {
            const stream = generateE2ETest(story);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setScript(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [story]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <UnitTestGeneratorIcon />
                    <span className="ml-3">Automated E2E Test Story Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Write a user story to generate a Playwright/Cypress E2E test script.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="story-input" className="text-sm font-medium text-text-secondary mb-2">User Story / Flow</label>
                    <textarea
                        id="story-input"
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Test Script'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Test Script</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {script && <MarkdownRenderer content={script} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
