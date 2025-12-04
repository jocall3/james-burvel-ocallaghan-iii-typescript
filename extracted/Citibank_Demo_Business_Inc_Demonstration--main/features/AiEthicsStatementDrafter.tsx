// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { draftAiEthicsStatement } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiEthicsStatementDrafter: React.FC = () => {
    const [project, setProject] = useState<string>('An AI system that recommends loan applications for approval or denial based on financial history.');
    const [statement, setStatement] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!project.trim()) {
            setError('Please describe the AI project.');
            return;
        }
        setIsLoading(true);
        setError('');
        setStatement('');
        try {
            const stream = draftAiEthicsStatement(project);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setStatement(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [project]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">AI Ethics Statement Drafter</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe an AI project to draft an ethics and transparency statement.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="project-input" className="text-sm font-medium text-text-secondary mb-2">AI Project Description</label>
                    <textarea
                        id="project-input"
                        value={project}
                        onChange={(e) => setProject(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Draft Statement'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {statement && <MarkdownRenderer content={statement} />}
                </div>
            </div>
        </div>
    );
};
