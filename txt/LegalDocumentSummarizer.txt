// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { summarizeLegalDocument } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleText = `This End-User License Agreement ("EULA") is a legal agreement between you and Example Corp. for the software product...`;

export const LegalDocumentSummarizer: React.FC = () => {
    const [document, setDocument] = useState<string>(exampleText);
    const [summary, setSummary] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSummarize = useCallback(async () => {
        if (!document.trim()) {
            setError('Please provide a legal document to summarize.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSummary('');
        try {
            const stream = summarizeLegalDocument(document);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSummary(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [document]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Legal Document Summarizer</span>
                </h1>
                <p className="text-text-secondary mt-1">Simplify complex legal text (e.g., Privacy Policy, Terms of Service).</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="document-input" className="text-sm font-medium text-text-secondary mb-2">Legal Document</label>
                    <textarea
                        id="document-input"
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleSummarize} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Summarize Document'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Simplified Summary</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {summary && <MarkdownRenderer content={summary} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
