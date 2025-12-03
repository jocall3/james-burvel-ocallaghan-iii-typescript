// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { testApiContracts } from '../../services/api';
import { CodeDiffGhostIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleSpec1 = `
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
`;
const exampleSpec2 = `
openapi: 3.0.0
info:
  title: User API
  version: 1.1.0
paths:
  /users/{userId}:
    get:
      summary: Get user by user ID
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: integer
`;

export const ApiContractTester: React.FC = () => {
    const [spec1, setSpec1] = useState<string>(exampleSpec1);
    const [spec2, setSpec2] = useState<string>(exampleSpec2);
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleTest = useCallback(async () => {
        if (!spec1.trim() || !spec2.trim()) {
            setError('Please provide both API specifications.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = testApiContracts(spec1, spec2);
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
    }, [spec1, spec2]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeDiffGhostIcon />
                    <span className="ml-3">API Contract Tester</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide two API specs (e.g., OpenAPI) to check for breaking changes.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="spec1-input" className="text-sm font-medium text-text-secondary mb-2">API Spec v1</label>
                    <textarea
                        id="spec1-input"
                        value={spec1}
                        onChange={(e) => setSpec1(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="spec2-input" className="text-sm font-medium text-text-secondary mb-2">API Spec v2</label>
                    <textarea
                        id="spec2-input"
                        value={spec2}
                        onChange={(e) => setSpec2(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
            </div>
            <div className="flex-shrink-0 mt-4">
                <button onClick={handleTest} disabled={isLoading} className="btn-primary w-full max-w-sm mx-auto">
                    {isLoading ? <LoadingSpinner /> : 'Check for Breaking Changes'}
                </button>
            </div>
            <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto mt-4">
                <h3 className="font-semibold mb-2">Analysis Report:</h3>
                {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                {error && <p className="text-red-500">{error}</p>}
                {report && <MarkdownRenderer content={report} />}
            </div>
        </div>
    );
};
