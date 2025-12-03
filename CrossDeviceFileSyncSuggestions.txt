// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { suggestFileSync } from '../../services/api';
import { CloudIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFileList = `
- /Projects/Urgent-Project/main.js
- /Documents/Taxes/2023.pdf
- /Downloads/large_video.mp4
- /Work/active-brief.docx
- /Cache/temp-file.tmp
`;

export const CrossDeviceFileSyncSuggestions: React.FC = () => {
    const [fileList, setFileList] = useState<string>(exampleFileList);
    const [suggestions, setSuggestions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSuggest = useCallback(async () => {
        if (!fileList.trim()) {
            setError('Please provide a file list.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions('');
        try {
            const stream = suggestFileSync(fileList);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSuggestions(fullResponse);
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
                    <CloudIcon />
                    <span className="ml-3">Cross-Device File Sync Suggestions</span>
                </h1>
                <p className="text-text-secondary mt-1">Get AI suggestions for which files to sync across devices.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="file-list-input" className="text-sm font-medium text-text-secondary mb-2">File List (one per line)</label>
                    <textarea
                        id="file-list-input"
                        value={fileList}
                        onChange={(e) => setFileList(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleSuggest} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Get Sync Suggestions'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">AI Suggestions</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {suggestions && <MarkdownRenderer content={suggestions} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
