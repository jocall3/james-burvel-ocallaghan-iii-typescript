// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateUserStories } from '../../services/api';
import { FeatureBuilderIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GenerateUserStories: React.FC = () => {
    const [description, setDescription] = useState<string>('A user profile page where users can update their name, avatar, and bio.');
    const [stories, setStories] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please provide a feature description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setStories('');
        try {
            const stream = generateUserStories(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setStories(fullResponse);
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
                    <FeatureBuilderIcon />
                    <span className="ml-3">AI User Story Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide a feature description to generate a set of user stories.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Feature Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate User Stories'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {stories && <MarkdownRenderer content={stories} />}
                </div>
            </div>
        </div>
    );
};
