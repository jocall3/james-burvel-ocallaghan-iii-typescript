// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ProjectExplorerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFileList = `
- package.json
- src/index.js
- src/App.js
- src/components/Header.js
- src/utils/api.js
- README.md
`;

export const AutomatedProjectOnboarding: React.FC = () => {
    const [fileList, setFileList] = useState<string>(exampleFileList);
    const [guide, setGuide] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!fileList.trim()) {
            setError('Please provide a list of project files.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGuide('');
        try {
            const prompt = `Generate a comprehensive onboarding guide for a new developer joining a project with the following file structure. Include sections for setup, key files, and how to run the project. Format as markdown.\n\nFile List:\n${fileList}`;
            const stream = streamContent(prompt, "You are a senior developer who excels at creating onboarding documentation.");
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
    }, [fileList]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ProjectExplorerIcon />
                    <span className="ml-3">AI Project Onboarding Guide</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a personalized onboarding guide for new team members.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="file-list-input" className="text-sm font-medium text-text-secondary mb-2">Project File List</label>
                    <textarea
                        id="file-list-input"
                        value={fileList}
                        onChange={(e) => setFileList(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Onboarding Guide'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Guide</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {guide && <MarkdownRenderer content={guide} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
