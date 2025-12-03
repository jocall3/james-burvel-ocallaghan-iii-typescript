// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { findDuplicateFiles } from '../../services/api';
import { CodeDiffGhostIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleFiles = `
--- FILE: report_q1.txt ---
The first quarter showed strong growth, with revenue up 15%.

--- FILE: quarter1_summary.txt ---
Q1 performance was robust, seeing a 15% increase in revenue.

--- FILE: todo.txt ---
- Buy milk
- Finish presentation
`;

export const FindSimilarFiles: React.FC = () => {
    const [content, setContent] = useState<string>(exampleFiles);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!content.trim()) {
            setError('Please provide file content to analyze.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const result = await findDuplicateFiles(content);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [content]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeDiffGhostIcon />
                    <span className="ml-3">Find Similar Files</span>
                </h1>
                <p className="text-text-secondary mt-1">Identify semantically similar files and duplicates based on content.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="content-input" className="text-sm font-medium text-text-secondary mb-2">File Contents</label>
                    <textarea
                        id="content-input"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                        placeholder="Paste file contents, separated by '--- FILE: filename ---'"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Find Similar Files'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Similarity Report</label>
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
