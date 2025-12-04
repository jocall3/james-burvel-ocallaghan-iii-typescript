// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const NamedEntityRecognizer: React.FC = () => {
    const [text, setText] = useState<string>('Apple Inc., led by Tim Cook, announced its new headquarters in Cupertino.');
    const [entities, setEntities] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleRecognize = useCallback(async () => {
        if (!text.trim()) {
            setError('Please provide text to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setEntities('');
        try {
            const prompt = `Perform Named Entity Recognition (NER) on the following text. Identify entities like people, organizations, and locations. Text: "${text}"`;
            const stream = streamContent(prompt, "You are a natural language processing expert.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setEntities(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [text]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Named Entity Recognizer (NER)</span>
                </h1>
                <p className="text-text-secondary mt-1">Identify people, organizations, locations, and more in your text.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Text to Analyze</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleRecognize} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Recognize Entities'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Recognized Entities</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {entities && <MarkdownRenderer content={entities} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
