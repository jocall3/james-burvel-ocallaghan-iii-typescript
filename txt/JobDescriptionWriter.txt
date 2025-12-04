// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const JobDescriptionWriter: React.FC = () => {
    const [role, setRole] = useState<string>('Senior Frontend Engineer with experience in React, TypeScript, and performance optimization.');
    const [jd, setJd] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!role.trim()) {
            setError('Please provide a job role and requirements.');
            return;
        }
        setIsLoading(true);
        setError('');
        setJd('');
        try {
            const prompt = `Write a compelling and inclusive job description for the following role: ${role}`;
            const stream = streamContent(prompt, "You are an expert technical recruiter and copywriter.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setJd(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [role]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Job Description Writer</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a professional job description from a role and key requirements.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="role-input" className="text-sm font-medium text-text-secondary mb-2">Job Role & Requirements</label>
                    <textarea
                        id="role-input"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Write Job Description'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {jd && <MarkdownRenderer content={jd} />}
                </div>
            </div>
        </div>
    );
};
