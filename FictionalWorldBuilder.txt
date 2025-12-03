// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { buildFictionalWorld } from '../../services/api';
import { MapIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const FictionalWorldBuilder: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A high fantasy world where magic is drawn from the two moons.');
    const [world, setWorld] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please provide a prompt for your world.');
            return;
        }
        setIsLoading(true);
        setError('');
        setWorld('');
        try {
            const stream = buildFictionalWorld(prompt);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setWorld(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MapIcon />
                    <span className="ml-3">Fictional World Builder</span>
                </h1>
                <p className="text-text-secondary mt-1">An AI assistant for creating cohesive fictional worlds (maps, history, cultures).</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary mb-2">World Concept</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Build World'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {world && <MarkdownRenderer content={world} />}
                </div>
            </div>
        </div>
    );
};