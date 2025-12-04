// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateReport } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleData = `{
  "sales_q2_2024": [
    { "region": "North America", "total": 5200000, "change_qoq": 0.05 },
    { "region": "Europe", "total": 3100000, "change_qoq": -0.02 },
    { "region": "Asia", "total": 4500000, "change_qoq": 0.12 }
  ]
}`;

export const AutomatedReportGeneration: React.FC = () => {
    const [data, setData] = useState<string>(exampleData);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!data.trim()) {
            setError('Please provide data to generate a report from.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = generateReport(data);
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
    }, [data]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">AI Report Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide structured data to generate a narrative report.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="data-input" className="text-sm font-medium text-text-secondary mb-2">Structured Data (JSON)</label>
                    <textarea
                        id="data-input"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Report'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Report</label>
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
