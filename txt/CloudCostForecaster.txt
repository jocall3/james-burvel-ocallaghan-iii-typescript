// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { detectCloudCostAnomalies } from '../../services/api';
import { ChartBarIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const CloudCostForecaster: React.FC = () => {
    const [data, setData] = useState<string>('Current monthly spend: $5,000. Projected user growth: 15% month-over-month. Services: AWS EC2, S3, RDS.');
    const [forecast, setForecast] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleForecast = useCallback(async () => {
        if (!data.trim()) {
            setError('Please provide current usage and growth data.');
            return;
        }
        setIsLoading(true);
        setError('');
        setForecast('');
        try {
            // Re-using a similar function for demonstration purposes
            const stream = detectCloudCostAnomalies(`Forecast future cloud costs based on this data:\n${data}`);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setForecast(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [data]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ChartBarIcon />
                    <span className="ml-3">Cloud Cost Forecaster</span>
                </h1>
                <p className="text-text-secondary mt-1">Forecast future cloud costs based on current usage and growth projections.</p>
            </header>
            <div className="flex flex-col gap-4 flex-grow min-h-0">
                 <div>
                    <label htmlFor="data-input" className="text-sm font-medium text-text-secondary mb-2">Current Usage & Growth Data</label>
                    <textarea
                        id="data-input"
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full p-3 bg-surface border border-border rounded-md resize-y"
                        rows={4}
                    />
                    <button onClick={handleForecast} disabled={isLoading} className="btn-primary mt-2">
                        {isLoading ? <LoadingSpinner /> : 'Forecast Costs'}
                    </button>
                </div>
                <div className="flex-grow p-4 bg-background border border-border rounded-md overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {error && <p className="text-red-500">{error}</p>}
                    {forecast && <MarkdownRenderer content={forecast} />}
                </div>
            </div>
        </div>
    );
};
