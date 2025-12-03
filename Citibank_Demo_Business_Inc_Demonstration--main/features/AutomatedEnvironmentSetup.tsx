// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { TerminalIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AutomatedEnvironmentSetup: React.FC = () => {
    const [description, setDescription] = useState<string>('a basic React application with TypeScript and Tailwind CSS');
    const [guide, setGuide] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe the environment you want to set up.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGuide('');
        try {
            const prompt = `Generate a step-by-step guide for setting up a local development environment for the following project. Include necessary commands for installation and initialization. Format as markdown. Project: "${description}"`;
            const stream = streamContent(prompt, "You are a DevOps expert who creates clear, step-by-step setup guides.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setGuide(fullResponse);
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
                    <TerminalIcon />
                    <span className="ml-3">AI-Assisted Environment Setup</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your project, and get a setup guide.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., a Python Flask app with a Postgres database"
                        className="flex-grow p-3 bg-surface border border-border rounded-md"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-6 py-3">
                        {isLoading ? <LoadingSpinner /> : 'Generate Guide'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {guide && <MarkdownRenderer content={guide} />}
                </div>
            </div>
        </div>
    );
};
