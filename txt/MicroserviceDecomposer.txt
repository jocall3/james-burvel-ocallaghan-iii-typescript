// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { decomposeMonolith } from '../../services/api';
import { RectangleGroupIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
class ECommerceApp {
  handleUserLogin() { /* ... */ }
  processPayment() { /* ... */ }
  updateInventory() { /* ... */ }
  sendShippingNotification() { /* ... */ }
}
`;

export const MicroserviceDecomposer: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [suggestion, setSuggestion] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleDecompose = useCallback(async () => {
        if (!code.trim()) {
            setError('Please provide code from your monolith.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSuggestion('');
        try {
            const stream = decomposeMonolith(code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSuggestion(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <RectangleGroupIcon />
                    <span className="ml-3">Microservice Decomposer</span>
                </h1>
                <p className="text-text-secondary mt-1">Get AI suggestions on how to break a monolith into microservices.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Monolith Code Snippet</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleDecompose} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Decomposition'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Decomposition Plan</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {suggestion && <MarkdownRenderer content={suggestion} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
