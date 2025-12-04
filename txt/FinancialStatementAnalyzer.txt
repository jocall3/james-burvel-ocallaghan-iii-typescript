// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleData = `Revenue: $10M, COGS: $4M, Operating Expenses: $3M, Net Income: $3M`;

export const FinancialStatementAnalyzer: React.FC = () => {
    const [data, setData] = useState<string>(exampleData);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!data.trim()) {
            setError('Please provide financial data.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysis('');
        try {
            const prompt = `Analyze the following financial statement data and provide a summary with key ratios and insights. Data: ${data}`;
            const stream = streamContent(prompt, "You are a senior financial analyst.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnalysis(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">Financial Statement Analyzer</span>
                </h1>
                <p className="text-text-secondary mt-1">Input financial data to get an AI-powered analysis and key insights.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="data-input" className="text-sm font-medium text-text-secondary mb-2">Financial Data</label>
                    <textarea
                        id="data-input"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Analyze Financials'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Analysis Report</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {analysis && <MarkdownRenderer content={analysis} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
