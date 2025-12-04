// google/ai_studio/components/PromptInterface.tsx
// The Interrogation Room. A direct conduit to the AI, where questions become answers.

import React, { useState } from 'react';
import ModelSelector from './ModelSelector';
import { GeminiService } from '../services/GeminiService';

const PromptInterface: React.FC = () => {
    const [prompt, setPrompt] = useState('Write a short story about a robot who discovers music.');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        const result = await GeminiService.generateText(prompt);
        setResponse(result);
        setIsLoading(false);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4">
            <h1 className="text-xl font-bold mb-4">AI Studio</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <ModelSelector />
                    <textarea 
                        className="w-full h-64 bg-gray-800 rounded-lg p-3"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                    />
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading}
                        className="w-full py-2 bg-cyan-600 rounded-lg disabled:opacity-50"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
                <div className="md:col-span-2 bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Response</h3>
                    <div className="whitespace-pre-wrap">{response}</div>
                </div>
            </div>
        </div>
    );
};

export default PromptInterface;
