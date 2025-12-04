// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { UnitTestGeneratorIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const APILoadTestScriptGenerator: React.FC = () => {
    const [description, setDescription] = useState<string>('A load test for the GET /api/users endpoint, ramping up from 1 to 100 virtual users over 1 minute, and holding for 2 minutes.');
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe the load test scenario.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');
        try {
            const prompt = `Generate a load testing script using k6 for the following scenario: ${description}`;
            const stream = streamContent(prompt, "You are a performance testing expert specializing in k6.");
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
    }, [description]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <UnitTestGeneratorIcon />
                    <span className="ml-3">API Load Test Script Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a scenario to generate an API load test script (e.g., using k6).</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Load Test Scenario</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Script'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {script && <MarkdownRenderer content={script} />}
                </div>
            </div>
        </div>
    );
};
