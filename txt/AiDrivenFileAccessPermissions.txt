// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { suggestAccessPermissions } from '../../services/api';
import { LockClosedIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiDrivenFileAccessPermissions: React.FC = () => {
    const [context, setContext] = useState<string>('A project folder containing sensitive financial reports and general marketing materials.');
    const [permissions, setPermissions] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!context.trim()) {
            setError('Please provide a context.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPermissions('');
        try {
            const stream = suggestAccessPermissions(context);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setPermissions(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [context]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <LockClosedIcon />
                    <span className="ml-3">AI File Access Permissions</span>
                </h1>
                <p className="text-text-secondary mt-1">Get AI-driven suggestions for optimal access permissions based on content and team roles.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="context-input" className="text-sm font-medium text-text-secondary mb-2">Context Description</label>
                    <textarea
                        id="context-input"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Permissions'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {permissions && <MarkdownRenderer content={permissions} />}
                </div>
            </div>
        </div>
    );
};
