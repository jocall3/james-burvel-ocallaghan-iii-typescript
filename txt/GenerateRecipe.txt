// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateRecipe } from '../../services/api';
import { BeakerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GenerateRecipe: React.FC = () => {
    const [ingredients, setIngredients] = useState<string>('chicken breast, rice, broccoli, soy sauce');
    const [recipe, setRecipe] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!ingredients.trim()) {
            setError('Please list some ingredients.');
            return;
        }
        setIsLoading(true);
        setError('');
        setRecipe('');
        try {
            const stream = generateRecipe(ingredients);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setRecipe(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [ingredients]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <BeakerIcon />
                    <span className="ml-3">AI Recipe Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Provide a list of ingredients, and get a recipe.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="ingredients-input" className="text-sm font-medium text-text-secondary mb-2">Available Ingredients</label>
                    <textarea
                        id="ingredients-input"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                        placeholder="e.g., ground beef, tomatoes, onions, pasta"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Generate Recipe'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {recipe && <MarkdownRenderer content={recipe} />}
                </div>
            </div>
        </div>
    );
};
