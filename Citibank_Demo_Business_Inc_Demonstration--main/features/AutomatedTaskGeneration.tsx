// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateTaskList } from '../../services/api';
import { ClipboardDocumentIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleNotes = `
Meeting Notes - Project Phoenix
- Alex to follow up with the design team about the new mockups.
- Need to fix the login bug reported in ticket #582 before the end of the week.
- Remember to schedule the Q3 planning session.
- The documentation for the API needs to be updated.
`;

export const AutomatedTaskGeneration: React.FC = () => {
    const [notes, setNotes] = useState<string>(exampleNotes);
    const [tasks, setTasks] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!notes.trim()) {
            setError('Please provide notes to generate tasks from.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTasks('');
        try {
            const stream = generateTaskList(notes);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setTasks(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [notes]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ClipboardDocumentIcon />
                    <span className="ml-3">AI Task List Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Extract actionable tasks from your notes.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="notes-input" className="text-sm font-medium text-text-secondary mb-2">Your Notes</label>
                    <textarea
                        id="notes-input"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Extract Tasks'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated Task List</label>
                    <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="text-red-500">{error}</p>}
                        {tasks && <MarkdownRenderer content={tasks} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
