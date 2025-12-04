// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { refactorCodeSmell } from '../../services/api';
import { SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
// This function has a "long method" code smell.
function processOrder(order) {
    // validation
    if (!order.id || !order.items) {
        console.error("Invalid order");
        return;
    }

    // calculate total
    let total = 0;
    for(const item of order.items) {
        total += item.price * item.quantity;
    }

    // apply discount
    if (order.customer.isVip) {
        total *= 0.9;
    }

    // save to database
    console.log("Saving order " + order.id + " with total " + total);
}
`;

export const CodeSmellRefactorer: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [refactoredCode, setRefactoredCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleRefactor = useCallback(async () => {
        if (!code.trim()) {
            setError('Please provide code to refactor.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRefactoredCode('');
        try {
            const stream = refactorCodeSmell(code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setRefactoredCode(fullResponse);
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
                    <SparklesIcon />
                    <span className="ml-3">Code Smell Refactorer</span>
                </h1>
                <p className="text-text-secondary mt-1">Automatically refactor common code smells like long methods or large classes.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Code with "Smells"</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                    <button onClick={handleRefactor} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Refactor Code'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Refactored Code</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {refactoredCode && <MarkdownRenderer content={refactoredCode} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
