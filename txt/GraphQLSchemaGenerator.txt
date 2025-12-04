// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback } from 'react';
import { generateGraphQLSchema } from '../../services/api';
import { SchemaDesignerIcon } from '../icons';
import { LoadingSpinner, MarkdownRenderer } from '../shared';

export const GraphQLSchemaGenerator: React.FC = () => {
    const [description, setDescription] = useState<string>('A blog with Posts and Authors. A Post has a title, content, and an Author. An Author has a name.');
    const [schema, setSchema] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async () => {
        if (!description.trim()) {
            setError('Please describe your data entities.');
            return;
        }
        setIsLoading(true);
        setError('');
        setSchema('');
        try {
            const stream = generateGraphQLSchema(description);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk;
                setSchema(fullResponse);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [description]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <SchemaDesignerIcon />
                    <span className="ml-3">GraphQL Schema Generator</span>
                </h1>
                <p className="text-text-secondary mt-1">Describe your data entities and get a GraphQL schema.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                <div className="flex flex-col">
                    <label htmlFor="description-input" className="text-sm font-medium text-text-secondary mb-2">Data Description</label>
                    <textarea
                        id="description-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex-grow p-4 bg-surface border border-border rounded-md resize-none"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary mt-4 w-full">
                        {isLoading ? <LoadingSpinner /> : 'Generate Schema'}
                    </button>
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-text-secondary mb-2">Generated GraphQL Schema</label>
                    <div className="flex-grow p-1 bg-background border border-border rounded-md overflow-y-auto">
                        {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                        {error && <p className="p-4 text-red-500">{error}</p>}
                        {schema && <MarkdownRenderer content={schema} />}
                    </div>
                </div>
            </div>
        </div>
    );
};
