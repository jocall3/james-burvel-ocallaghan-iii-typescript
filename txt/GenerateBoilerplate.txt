// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { FileCodeIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const boilerplateTypes = [
    'React functional component with props',
    'Basic HTML5 page structure',
    'Python class with constructor',
    'Node.js Express server setup'
];

export const GenerateBoilerplate: React.FC = () => {
    const [type, setType] = useState<string>(boilerplateTypes[0]);
    const [code, setCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!type.trim()) {
            setError('Please select a boilerplate type.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCode('');
        try {
            const prompt = `Generate boilerplate code for a "${type}". Only output the code, wrapped in a markdown code block.`;
            const stream = streamContent(prompt, "You are a boilerplate code generator.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setCode(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [type]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <FileCodeIcon />
                    <span className="ml-3">Generate Boilerplate</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate boilerplate code for common file types and structures.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="flex items-center gap-4">
                    <select value={type} onChange={e => setType(e.target.value)} className="flex-grow p-3 bg-surface border border-border rounded-md">
                        {boilerplateTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-6 py-3">
                        {isLoading ? <LoadingSpinner /> : 'Generate'}
                    </button>
                </div>
                <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {code && <MarkdownRenderer content={code} />}
                </div>
            </div>
        </div>
    );
};
