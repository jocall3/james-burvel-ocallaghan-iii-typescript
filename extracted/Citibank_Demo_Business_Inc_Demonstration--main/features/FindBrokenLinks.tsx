// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { findBrokenLinks } from '../../services/api';
import { LinkIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleText = `
Check out our main site: https://example.com
Our blog is at http://example.com/blog
And the old docs are at http://example.com/docs/v1 (this link might be dead).
Also, a malformed link: www.google.com
`;

export const FindBrokenLinks: React.FC = () => {
    const [text, setText] = useState<string>(exampleText);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleScan = useCallback(async () => {
        if (!text.trim()) {
            setError('Please provide text to scan.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = findBrokenLinks(text);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setReport(fullResponse);
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
                    <LinkIcon />
                    <span className="ml-3">Find Broken Links</span>
                </h1>
                <p className="text-text-secondary mt-1">Scan documents and code for broken or malformed links.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Text to Scan</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleScan} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Scan Links'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Scan Report</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {report && <MarkdownRenderer content={report} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
