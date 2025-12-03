// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateCloudDiagram } from '../../services/api';
import { CloudArrowUpIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const CloudArchitectureDiagramGenerator: React.FC = () => {
    const [description, setDescription] = useState<string>('A web application with a load balancer, two web servers, and a PostgreSQL database.');
    const [diagram, setDiagram] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe the architecture.');
            return;
        }
        setIsLoading(true);
        setError('');
        setDiagram('');
        try {
            const stream = generateCloudDiagram(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setDiagram(fullResponse);
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
                    <CloudArrowUpIcon />
                    <span className="ml-3">Cloud Architecture Diagram Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your architecture and get a Mermaid.js diagram.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Architecture Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Diagram'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {diagram && <MarkdownRenderer content={diagram} />}
                </div>
            </div>
        </div>
    );
};
