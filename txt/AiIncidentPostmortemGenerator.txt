// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generatePostmortem } from '../../services/api';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiIncidentPostmortemGenerator: React.FC = () => {
    const [incident, setIncident] = useState<string>('The user authentication service was down for 15 minutes due to a database connection pool exhaustion.');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!incident.trim()) {
            setError('Please describe the incident.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = generatePostmortem(incident);
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
    }, [incident]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">AI Incident Post-mortem Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate a blame-free post-mortem from incident details.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="incident-input" className="text-sm font-medium text-text-secondary mb-2">Incident Description</label>
                    <textarea
                        id="incident-input"
                        value={incident}
                        onChange={(e) => setIncident(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Post-mortem'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && <MarkdownRenderer content={report} />}
                </div>
            </div>
        </div>
    );
};
