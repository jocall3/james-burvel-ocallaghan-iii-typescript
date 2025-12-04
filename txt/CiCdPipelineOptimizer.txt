// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { optimizeCiCdPipeline } from '../../services/api';
import { CloudArrowUpIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleConfig = `
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm test
`;

export const CiCdPipelineOptimizer: React.FC = () => {
    const [config, setConfig] = useState<string>(exampleConfig);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = useCallback(async () => {
        if (!config.trim()) {
            setError('Please provide a CI/CD configuration.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = optimizeCiCdPipeline(config);
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
    }, [config]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CloudArrowUpIcon />
                    <span className="ml-3">CI/CD Pipeline Optimizer</span>
                </h1>
                <p className="text-text-secondary mt-1">Paste a CI/CD config to get optimization suggestions.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="config-input" className="text-sm font-medium text-text-secondary mb-2">CI/CD Configuration (e.g., GitHub Actions YAML)</label>
                    <textarea
                        id="config-input"
                        value={config}
                        onChange={(e) => setConfig(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleAnalyze} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Optimize Pipeline'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Optimization Report</label>
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
