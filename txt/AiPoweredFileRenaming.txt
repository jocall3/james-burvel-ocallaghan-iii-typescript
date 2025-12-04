// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { suggestFileRename } from '../../services/api';
import { PencilIcon } from '../icons';
import { LoadingSpinner } from '../shared';

export const AiPoweredFileRenaming: React.FC = () => {
    const [fileName, setFileName] = useState<string>('doc_final_v2_updated.pdf');
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSuggest = useCallback(async () => {
        if (!fileName.trim()) {
            setError('Please enter a file name.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestion('');
        try {
            const result = await suggestFileRename(fileName);
            setSuggestion(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [fileName]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary items-center">
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold flex items-center justify-center">
                    <PencilIcon />
                    <span className="ml-3">AI-Powered File Renaming</span>
                </h1>
                <p className="text-text-secondary mt-1">Get intelligent, consistent renaming suggestions for your files.</p>
            </header>
            <div className="w-full max-w-lg space-y-4">
                <div>
                    <label htmlFor="file-name-input" className="text-sm font-medium text-text-secondary mb-2">Original File Name</label>
                    <input
                        id="file-name-input"
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md"
                    />
                </div>
                <button onClick={handleSuggest} disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? <LoadingSpinner /> : 'Suggest New Name'}
                </button>
                <div className="p-4 bg-background border border-border rounded-md min-h-[6rem]">
                    <h3 className="font-semibold mb-2">Suggestion:</h3>
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {suggestion && <p className="font-mono text-green-600">{suggestion}</p>}
                </div>
            </div>
        </div>
    );
};
