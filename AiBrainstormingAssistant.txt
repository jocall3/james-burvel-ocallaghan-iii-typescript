// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { brainstormIdeas } from '../../services/api';
import { SparklesIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const AiBrainstormingAssistant: React.FC = () => {
    const [topic, setTopic] = useState<string>('new features for a file manager');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!topic.trim()) {
            setError('Please enter a topic to brainstorm.');
            return;
        }
        setIsLoading(true);
        setError('');
        setIdeas([]);
        try {
            const result = await brainstormIdeas(topic);
            setIdeas(result);
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
                    <SparklesIcon />
                    <span className="ml-3">AI Brainstorming Assistant</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide a topic and get a list of creative ideas.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., app ideas for pet owners"
                        className="flex-grow p-3 bg-surface border border-border rounded-md"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-6 py-3">
                        {isLoading ? <LoadingSpinner /> : 'Generate Ideas'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {ideas.length > 0 && (
                        <ul className="list-disc list-inside space-y-2">
                            {ideas.map((idea, index) => <li key={index}>{idea}</li>)}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
