// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateE2ETest } from '../../services/api';
import { UnitTestGeneratorIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const E2eTestScriptGenerator: React.FC = () => {
    const [flow, setFlow] = useState<string>('User navigates to the login page, enters their credentials, and clicks the submit button. They should then see the dashboard heading.');
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!flow.trim()) {
            setError('Please describe the user flow.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');
        try {
            const stream = generateE2ETest(flow);
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
    }, [flow]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <UnitTestGeneratorIcon />
                    <span className="ml-3">E2E Test Script Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a user flow to generate a Playwright/Cypress test script.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="flow-input" className="text-sm font-medium text-text-secondary mb-2">User Flow Description</label>
                    <textarea
                        id="flow-input"
                        value={flow}
                        onChange={(e) => setFlow(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Test Script'}
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
