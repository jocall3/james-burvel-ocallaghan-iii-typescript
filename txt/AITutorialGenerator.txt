// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { AcademicCapIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AITutorialGenerator: React.FC = () => {
    const [topic, setTopic] = useState<string>('How to use Git for version control');
    const [tutorial, setTutorial] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please provide a topic for the tutorial.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTutorial('');
        try {
            const prompt = `Generate a beginner-friendly tutorial on the topic: "${topic}". Include code examples where appropriate. Format as markdown.`;
            const stream = streamContent(prompt, "You are an expert technical instructor.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setTutorial(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <AcademicCapIcon />
                    <span className="ml-3">AI Tutorial Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a step-by-step tutorial for any technical topic.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="topic-input" className="text-sm font-medium text-text-secondary mb-2">Tutorial Topic</label>
                    <input
                        id="topic-input"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Tutorial'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {tutorial && <MarkdownRenderer content={tutorial} />}
                </div>
            </div>
        </div>
    );
};
