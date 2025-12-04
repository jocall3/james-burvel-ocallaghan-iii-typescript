// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateOnCallSchedule } from '../../services/api';
import { BellIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const OnCallScheduleGenerator: React.FC = () => {
    const [constraints, setConstraints] = useState<string>('Team members: Alice, Bob, Charlie. No one should be on-call for two consecutive weeks. Charlie is on vacation the first week of August.');
    const [schedule, setSchedule] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!constraints.trim()) {
            setError('Please provide team constraints.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSchedule('');
        try {
            const stream = generateOnCallSchedule(constraints);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSchedule(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [constraints]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BellIcon />
                    <span className="ml-3">On-Call Schedule Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Input team constraints to generate a fair on-call rotation.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="constraints-input" className="text-sm font-medium text-text-secondary mb-2">Team Constraints</label>
                    <textarea
                        id="constraints-input"
                        value={constraints}
                        onChange={(e) => setConstraints(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Schedule'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {schedule && <MarkdownRenderer content={schedule} />}
                </div>
            </div>
        </div>
    );
};
