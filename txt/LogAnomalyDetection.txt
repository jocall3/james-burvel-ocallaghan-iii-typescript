// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { detectLogAnomalies } from '../../services/api';
import { BugAntIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleLogs = `
[INFO] 2024-07-15 10:00:01 User 'alice' logged in.
[INFO] 2024-07-15 10:00:05 Request to /api/data successful.
[ERROR] 2024-07-15 10:00:10 Database connection failed: timeout.
[ERROR] 2024-07-15 10:00:15 Database connection failed: timeout.
[INFO] 2024-07-15 10:00:20 User 'bob' logged in.
`;

export const LogAnomalyDetection: React.FC = () => {
    const [logs, setLogs] = useState<string>(exampleLogs);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!logs.trim()) {
            setError('Please provide log data.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = detectLogAnomalies(logs);
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
    }, [logs]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BugAntIcon />
                    <span className="ml-3">Log Anomaly Detection</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste log files and let AI identify unusual patterns.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="logs-input" className="text-sm font-medium text-text-secondary mb-2">Log Data</label>
                    <textarea
                        id="logs-input"
                        value={logs}
                        onChange={(e) => setLogs(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Analyze Logs'}
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
