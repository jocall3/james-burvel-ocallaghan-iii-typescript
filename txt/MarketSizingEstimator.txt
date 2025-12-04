// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { estimateMarketSizing } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const MarketSizingEstimator: React.FC = () => {
    const [product, setProduct] = useState<string>('A subscription service for gourmet dog food delivery in the United States.');
    const [report, setReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!product.trim()) {
            setError('Please describe the product.');
            return;
        }
        setIsLoading(true);
        setError('');
        setReport('');
        try {
            const stream = estimateMarketSizing(product);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setReport(fullResponse);
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
                    <ChartBarIcon />
                    <span className="ml-3">Market Sizing Estimator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe a product to get a rough TAM/SAM/SOM estimation.</p>
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
                        {isLoading ? <LoadingSpinner /> : 'Estimate Market Size'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {report && <MarkdownRenderer content={report} />}
                </div>
            </div>
        </div>
    );
};
