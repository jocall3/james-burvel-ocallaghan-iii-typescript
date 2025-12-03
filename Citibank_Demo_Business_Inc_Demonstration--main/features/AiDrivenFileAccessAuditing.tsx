// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { auditFileAccess } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleLogs = `
[2024-07-15 10:00] user:alice, action:read, file:/reports/q2.pdf
[2024-07-15 10:05] user:bob, action:write, file:/data/customers.csv
[2024-07-15 23:30] user:bob, action:read, file:/reports/q2.pdf
[2024-07-15 23:32] user:bob, action:read, file:/reports/q1.pdf
[2024-07-15 23:35] user:bob, action:delete, file:/temp/old_data.csv
`;

export const AiDrivenFileAccessAuditing: React.FC = () => {
    const [logs, setLogs] = useState<string>(exampleLogs);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAudit = useCallback(async () => {
        if (!logs.trim()) {
            setError('Please provide access logs.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = auditFileAccess(logs);
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
                    <ShieldCheckIcon />
                    <span className="ml-3">AI File Access Auditing</span>
                </h1>
                <p className="text-text-secondary mt-1">Analyze file access logs to identify unusual patterns or potential security risks.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="logs-input" className="text-sm font-medium text-text-secondary mb-2">Access Logs</label>
                    <textarea
                        id="logs-input"
                        value={logs}
                        onChange={(e) => setLogs(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleAudit} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Audit Logs'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Audit Report</label>
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
