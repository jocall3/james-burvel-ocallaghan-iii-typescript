// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiDataPrivacyImpact: React.FC = () => {
    const [description, setDescription] = useState<string>('A new feature that collects user location data to provide local weather recommendations.');
    const [assessment, setAssessment] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAssess = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe the data handling process.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAssessment('');
        try {
            const prompt = `Generate a Data Privacy Impact Assessment (PIA) in markdown format for the following process. Identify potential privacy risks and suggest mitigations. Process: "${description}"`;
            const stream = streamContent(prompt, "You are a data privacy and compliance expert.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAssessment(fullResponse);
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
                    <ShieldCheckIcon />
                    <span className="ml-3">AI Data Privacy Impact Assessment</span>
                </h1>
                <p className="text-text-secondary mt-1">Assess the privacy impact of data handling within a project.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Data Handling Process Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleAssess} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Assess Privacy Impact'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {assessment && <MarkdownRenderer content={assessment} />}
                </div>
            </div>
        </div>
    );
};
