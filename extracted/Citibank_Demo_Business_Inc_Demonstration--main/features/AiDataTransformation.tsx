// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { LogicFlowBuilderIcon } from '../icons';
import { LoadingSpinner } from '../shared';

const exampleInput = `[
  {"id": 1, "firstName": "John", "lastName": "Doe", "age": 30},
  {"id": 2, "firstName": "Jane", "lastName": "Smith", "age": 25}
]`;

export const AiDataTransformation: React.FC = () => {
    const [input, setInput] = useState<string>(exampleInput);
    const [prompt, setPrompt] = useState<string>('Combine firstName and lastName into a single "fullName" field.');
    const [output, setOutput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleTransform = useCallback(async () => {
        if (!input.trim() || !prompt.trim()) {
            setError('Please provide both input data and a transformation description.');
            return;
        }
        setIsLoading(true);
        setError('');
        setOutput('');
        try {
            const fullPrompt = `Transform the following data based on the instruction. Only output the transformed data.\n\nInstruction: "${prompt}"\n\nInput Data:\n\`\`\`json\n${input}\n\`\`\``;
            const stream = streamContent(fullPrompt, "You are a data transformation engine.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setOutput(fullResponse.replace(/^```(json)?\n|```$/g, ''));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [input, prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <LogicFlowBuilderIcon />
                    <span className="ml-3">AI Data Transformation</span>
                </h1>
                <p className="text-text-secondary mt-1">Generate code for complex data transformations.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="input-data" className="text-sm font-medium text-text-secondary mb-2">Input Data</label>
                    <textarea id="input-data" value={input} onChange={e => setInput(e.target.value)} className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"/>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Output Data</label>
                    <pre className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto whitespace-pre-wrap font-mono text-sm">
                        {isLoading ? <div className="flex justify-center items-center h-full"><LoadingSpinner /></div> : output}
                        {error && <p className="text-red-500">{error}</p>}
                    </pre>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
                 <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe transformation..." className="flex-grow p-3 bg-surface border border-border rounded-md"/>
                 <button onClick={handleTransform} disabled={isLoading} className="btn-primary px-6 py-3">
                    {isLoading ? <LoadingSpinner /> : 'Transform'}
                </button>
            </div>
        </div>
    );
};
