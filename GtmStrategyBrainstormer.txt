// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { brainstormGtmStrategy } from '../../services/api';
import { SparklesIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GtmStrategyBrainstormer: React.FC = () => {
    const [product, setProduct] = useState<string>('A new AI-powered code review tool for enterprise teams.');
    const [strategy, setStrategy] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!product.trim()) {
            setError('Please describe the product.');
            return;
        }
        setIsLoading(true);
        setError('');
        setStrategy('');
        try {
            const stream = brainstormGtmStrategy(product);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setStrategy(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [product]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <SparklesIcon />
                    <span className="ml-3">GTM Strategy Brainstormer</span>
                </h1>
                <p className="text-text-secondary mt-1">Input a product to brainstorm go-to-market strategies.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="product-input" className="text-sm font-medium text-text-secondary mb-2">Product Description</label>
                    <textarea
                        id="product-input"
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Brainstorm GTM Strategy'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {strategy && <MarkdownRenderer content={strategy} />}
                </div>
            </div>
        </div>
    );
};
