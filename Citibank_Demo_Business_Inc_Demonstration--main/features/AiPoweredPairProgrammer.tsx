// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { streamContent } from '../../services/geminiCore';
import { SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const AiPoweredPairProgrammer: React.FC = () => {
    const [code, setCode] = useState<string>('function calculateSum(arr) {\n  // TODO: implement this function\n}');
    const [instruction, setInstruction] = useState<string>('Implement the function to return the sum of all numbers in the array.');
    const [result, setResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!code.trim() || !instruction.trim()) {
            setError('Please provide both code and an instruction.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const prompt = `Act as an AI pair programmer. The user has provided the following code and an instruction. Your task is to modify the code to fulfill the instruction. Only output the new, complete code block.\n\nInstruction: "${instruction}"\n\nCode:\n\`\`\`\n${code}\n\`\`\``;
            const stream = streamContent(prompt, "You are an AI pair programmer.");
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResult(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code, instruction]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <SparklesIcon />
                    <span className="ml-3">AI-Powered Pair Programmer</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide code and an instruction to have the AI modify it for you.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Your Code</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="instruction-input" className="text-sm font-medium text-text-secondary mb-2">Your Instruction</label>
                    <textarea
                        id="instruction-input"
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                        className="h-24 p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4">
                        {isLoading ? <LoadingSpinner /> : 'Generate Code'}
                    </button>
                    <label className="text-sm font-medium text-text-secondary mb-2 mt-4">AI's Code</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {result && <MarkdownRenderer content={result} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
