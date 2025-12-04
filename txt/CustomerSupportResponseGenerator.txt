// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { DocumentTextIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const CustomerSupportResponseGenerator: React.FC = () => {
    const [ticket, setTicket] = useState<string>('The user is reporting that they cannot reset their password. They say the reset link is not arriving in their email.');
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!ticket.trim()) {
            setError('Please provide the customer support ticket details.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResponse('');
        try {
            const prompt = `Draft a helpful and empathetic customer support response for the following ticket: "${ticket}"`;
            const stream = streamContent(prompt, "You are a senior customer support agent.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResponse(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [ticket]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <DocumentTextIcon />
                    <span className="ml-3">Customer Support Response Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate empathetic and helpful customer support responses.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="ticket-input" className="text-sm font-medium text-text-secondary mb-2">Customer Ticket</label>
                    <textarea
                        id="ticket-input"
                        value={ticket}
                        onChange={(e) => setTicket(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Response'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Response</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {response && <MarkdownRenderer content={response} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
