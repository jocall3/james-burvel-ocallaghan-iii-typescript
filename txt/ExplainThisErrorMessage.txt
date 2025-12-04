// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { explainErrorMessage } from '../../services/api';
import { CodeExplainerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const ExplainThisErrorMessage: React.FC = () => {
    const [errorMsg, setErrorMsg] = useState<string>('TypeError: Cannot read properties of undefined (reading \'map\')');
    const [explanation, setExplanation] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleExplain = useCallback(async () => {
        if (!errorMsg.trim()) {
            setError('Please enter an error message.');
            return;
        }
        setIsLoading(true);
        setError('');
        setExplanation('');
        try {
            const stream = explainErrorMessage(errorMsg);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setExplanation(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [errorMsg]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <CodeExplainerIcon />
                    <span className="ml-3">Explain This Error Message</span>
                </h1>
                <p className="text-text-secondary mt-1">Get a clear explanation and potential fixes for cryptic error messages.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="error-input" className="text-sm font-medium text-text-secondary mb-2">Error Message</label>
                    <textarea
                        id="error-input"
                        value={errorMsg}
                        onChange={(e) => setErrorMsg(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y font-mono"
                        rows={3}
                    />
                    <button onClick={handleExplain} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Explain Error'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {explanation && <MarkdownRenderer content={explanation} />}
                </div>
            </div>
        </div>
    );
};
