// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { detectBias } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleText = `The system requires the foreman to submit his report by the end of the day. The ideal candidate will be a recent graduate with a lot of energy.`;

export const AiDrivenBiasDetection: React.FC = () => {
    const [text, setText] = useState<string>(exampleText);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleScan = useCallback(async () => {
        if (!text.trim()) {
            setError('Please provide text to scan for bias.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = detectBias(text);
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
                    <ShieldCheckIcon />
                    <span className="ml-3">AI-Driven Bias Detection</span>
                </h1>
                <p className="text-text-secondary mt-1">Scan text for potential ethical biases.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Text to Analyze</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleScan} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Scan for Bias'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Bias Report</label>
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
