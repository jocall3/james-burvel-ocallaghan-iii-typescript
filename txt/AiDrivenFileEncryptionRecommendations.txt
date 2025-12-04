// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { recommendEncryption } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFileList = `
- financial_report_q2.xlsx
- marketing_brochure.pdf
- user_passwords.txt
- meeting_notes.md
- api_keys.env
`;

export const AiDrivenFileEncryptionRecommendations: React.FC = () => {
    const [fileList, setFileList] = useState<string>(exampleFileList);
    const [recommendations, setRecommendations] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleRecommend = useCallback(async () => {
        if (!fileList.trim()) {
            setError('Please provide a file list.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRecommendations('');
        try {
            const stream = recommendEncryption(fileList);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setRecommendations(fullResponse);
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
                    <ShieldCheckIcon />
                    <span className="ml-3">AI File Encryption Recommendations</span>
                </h1>
                <p className="text-text-secondary mt-1">AI recommends which sensitive files should be encrypted based on their names.</p>
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
                    <button onClick={handleRecommend} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Get Recommendations'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">AI Recommendations</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {recommendations && <MarkdownRenderer content={recommendations} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
