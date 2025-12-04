// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { searchCodeByAst } from '../../services/api';
import { MagnifyingGlassIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

const exampleCode = `
import { useState } from 'react';

function MyComponent() {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        fetch('/api/data').then(res => res.json());
        setCount(c => c + 1);
    };

    return <button onClick={handleClick}>Count: {count}</button>;
}
`;

export const AstBasedCodeSearch: React.FC = () => {
    const [code, setCode] = useState<string>(exampleCode);
    const [query, setQuery] = useState<string>('find all fetch calls');
    const [results, setResults] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleSearch = useCallback(async () => {
        if (!code.trim() || !query.trim()) {
            setError('Please provide code and a search query.');
            return;
        }
        setIsLoading(true);
        setError('');
        setResults('');
        try {
            const stream = searchCodeByAst(query, code);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setResults(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [code, query]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <MagnifyingGlassIcon />
                    <span className="ml-3">AST-Based Code Search</span>
                </h1>
                <p className="text-text-secondary mt-1">Search code by its structure, not just text (e.g., 'find all async functions').</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="code-input" className="text-sm font-medium text-text-secondary mb-2">Code to Search</label>
                    <textarea
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none font-mono text-sm"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="query-input" className="text-sm font-medium text-text-secondary mb-2">Search Query</label>
                    <input
                        id="query-input"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full p-2 bg-surface border border-border rounded-md mb-2"
                    />
                    <button onClick={handleSearch} disabled={isLoading} className="btn-primary w-full">
                        {isLoading ? <LoadingSpinner /> : 'Search by Structure'}
                    </button>
                    <label className="text-sm font-medium text-text-secondary mb-2 mt-4">Search Results</label>
                     <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {results && <MarkdownRenderer content={results} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
