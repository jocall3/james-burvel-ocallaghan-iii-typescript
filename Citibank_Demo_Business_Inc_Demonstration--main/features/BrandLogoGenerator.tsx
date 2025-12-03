// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useRef } from 'react';
// FIX: Corrected the import path to the main services barrel file.
import { generateImage } from '../../services/index.ts';
import { ImageGeneratorIcon } from '../icons.tsx';
import { LoadingSpinner } from '../shared/index.tsx';

export const BrandLogoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A minimalist logo for a tech company named "Orbit", featuring a stylized planet and rings, vector art, SVG.');
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please describe the logo you want.');
            return;
        }
        setIsLoading(true);
        setError('');
        setImageUrl('');
        try {
            const result = await generateImage(prompt);
            setImageUrl(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ImageGeneratorIcon />
                    <span className="ml-3">Brand Logo Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your brand to generate logo concepts.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="prompt-input" className="text-sm font-medium text-text-secondary mb-2">Logo Description</label>
                    <textarea
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Logo'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md flex items-center justify-center">
                    {isLoading && <LoadingSpinner />}
                    {error && <p className="text-red-500">{error}</p>}
                    {imageUrl && <img src={imageUrl} alt="Generated logo" className="max-w-full max-h-full object-contain"/>}
                </div>
            </div>
        </div>
    );
};
