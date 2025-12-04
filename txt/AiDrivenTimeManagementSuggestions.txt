// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { suggestTimeManagement } from '../../services/api';
import { Cog6ToothIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleTasks = `
- Write documentation for the API (High priority, 3 hours)
- Fix login button bug (High priority, 1 hour)
- Team meeting (1 hour)
- Respond to emails (Low priority, 30 mins)
- Plan Q3 features (Medium priority, 2 hours)
`;

export const AiDrivenTimeManagementSuggestions: React.FC = () => {
    const [tasks, setTasks] = useState<string>(exampleTasks);
    const [schedule, setSchedule] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSuggest = useCallback(async () => {
        if (!tasks.trim()) {
            setError('Please provide a task list.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSchedule('');
        try {
            const stream = suggestTimeManagement(tasks);
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
    }, [tasks]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <Cog6ToothIcon />
                    <span className="ml-3">AI Time Management Suggestions</span>
                </h1>
                <p className="text-text-secondary mt-1">Get an AI-suggested schedule for focused work based on your task list.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="tasks-input" className="text-sm font-medium text-text-secondary mb-2">Your Task List</label>
                    <textarea
                        id="tasks-input"
                        value={tasks}
                        onChange={(e) => setTasks(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleSuggest} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Suggest Schedule'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Suggested Schedule</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {schedule && <MarkdownRenderer content={schedule} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
