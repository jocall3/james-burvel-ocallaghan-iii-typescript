// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { detectCloudCostAnomalies } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleData = `
Date,Service,Cost
2024-07-01,EC2,50.00
2024-07-01,S3,10.50
2024-07-02,EC2,51.00
2024-07-02,S3,10.55
2024-07-03,EC2,150.00
2024-07-03,S3,10.60
`;

export const CloudCostAnomalyDetection: React.FC = () => {
    const [data, setData] = useState<string>(exampleData);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!data.trim()) {
            setError('Please provide billing data.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = detectCloudCostAnomalies(data);
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
                    <ChartBarIcon />
                    <span className="ml-3">Cloud Cost Anomaly Detection</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste billing data to find unexpected cost spikes.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="data-input" className="text-sm font-medium text-text-secondary mb-2">Billing Data (CSV format)</label>
                    <textarea
                        id="data-input"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Find Anomalies'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Anomaly Report</label>
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
