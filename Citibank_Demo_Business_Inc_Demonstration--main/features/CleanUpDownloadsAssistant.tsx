// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { cleanupDownloads } from '../../services/api';
import { TrashIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFileList = `
- invoice_acme_corp.pdf
- vacation_photo_01.jpg
- project_brief_v3.docx
- Screenshot 2024-07-15.png
- tax_document_2023.pdf
`;

export const CleanUpDownloadsAssistant: React.FC = () => {
    const [fileList, setFileList] = useState<string>(exampleFileList);
    const [suggestions, setSuggestions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleCleanup = useCallback(async () => {
        if (!fileList.trim()) {
            setError('Please provide a list of files.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestions('');
        try {
            const stream = cleanupDownloads(fileList);
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
                    <TrashIcon />
                    <span className="ml-3">Clean Up Downloads Assistant</span>
                </h1>
                <p className="text-text-secondary mt-1">AI automatically categorizes and suggests folders for files from your Downloads folder.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="file-list-input" className="text-sm font-medium text-text-secondary mb-2">Files in Downloads Folder (one per line)</label>
                    <textarea
                        id="file-list-input"
                        value={fileList}
                        onChange={(e) => setFileList(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleCleanup} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Get Suggestions'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Organization Suggestions</label>
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
