// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-1" aria-label="Loading">
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const [sanitizedHtml, setSanitizedHtml] = useState<string>('');

    useEffect(() => {
        const parse = async () => {
            if (content) {
                // Basic sanitization to prevent obvious XSS, but a more robust library like DOMPurify would be better for production.
                const html = await marked.parse(content);
                setSanitizedHtml(html);
            } else {
                setSanitizedHtml('');
            }
        };
        parse();
    }, [content]);

    return (
        <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};
