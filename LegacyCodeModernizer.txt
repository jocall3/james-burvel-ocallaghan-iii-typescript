// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { modernizeLegacyCode } from '../../services/api';
import { CodeMigratorIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
$('#myButton').on('click', function() {
  $('#myDiv').text('Button was clicked!');
});
`;

export const LegacyCodeModernizer: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [pattern, setPattern] = useState<string>('jQuery to React');
    const [modernizedCode, setModernizedCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleModernize = useCallback(async () => {
        if (!code.trim() || !pattern.trim()) {
            setError('Please provide code and a modernization pattern.');
            return;
        }
        setIsLoading(true);
        setError('');
        setModernizedCode('');
        try {
            const stream = modernizeLegacyCode(code, pattern);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setModernizedCode(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code, pattern]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeMigratorIcon />
                    <span className="ml-3">Legacy Code Modernizer</span>
                </h1>
                <p className="text-text-secondary mt-1">Modernize legacy code by specifying a target pattern (e.g., jQuery to React).</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Legacy Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="pattern-input" className="text-sm font-medium text-text-secondary mb-2">Modernization Pattern</label>
                    <input
                        id="pattern-input"
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-md mb-2"
                    />
                    <button onClick={handleModernize} disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? <LoadingSpinner /> : 'Modernize Code'}
                    </button>
                    <label className="text-sm font-medium text-text-secondary mb-2 mt-4">Modernized Code</label>
                     <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {modernizedCode && <MarkdownRenderer content={modernizedCode} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
