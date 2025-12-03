// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { anonymizeData } from '../../services/api';
import { ShieldCheckIcon } from '../icons';
import { LoadingSpinner } from '../shared';

const exampleText = `
From: John Doe (john.doe@example.com)
To: Jane Smith
Date: 2024-07-15

Hi Jane,

Please process invoice #12345 for our client, Acme Corp. Their contact is Robert Paulson at 555-123-4567.

Thanks,
John
`;

export const AiDataAnonymization: React.FC = () => {
    const [text, setText] = useState<string>(exampleText);
    const [anonymizedText, setAnonymizedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnonymize = useCallback(async () => {
        if (!text.trim()) {
            setError('Please provide text to anonymize.');
            return;
        }
        setIsLoading(true);
        setError('');
        setAnonymizedText('');
        try {
            const stream = anonymizeData(text);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setAnonymizedText(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [text]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ShieldCheckIcon />
                    <span className="ml-3">AI Data Anonymization</span>
                </h1>
                <p className="text-text-secondary mt-1">Redact Personally Identifiable Information (PII) from text.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm font-medium text-text-secondary mb-2">Original Text</label>
                    <textarea
                        id="text-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleAnonymize} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Anonymize Text'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Anonymized Text</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {anonymizedText && <pre className="whitespace-pre-wrap">{anonymizedText}</pre>}
                    </div>
                </div>
            </div>
        </div>
    );
};
