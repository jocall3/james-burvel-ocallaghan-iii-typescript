// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { EyeIcon } from '../icons.tsx';

export const ExplainThisUiElement: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <EyeIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                Explain This UI Element
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This feature demonstrates how an AI could provide contextual help. In a real implementation, you could activate an "explain mode," hover over any button or panel in this application, and the AI would provide a pop-up explaining its purpose and how to use it.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-lg">
                <p className="font-semibold">Example Usage:</p>
                <p className="text-text-secondary mt-1">User hovers over the "AI Commit Generator" icon.</p>
                <p className="text-text-secondary mt-1">AI Popup: "This tool generates a conventional commit message from your code changes. Paste a git diff to get started."</p>
            </div>
        </div>
    );
};
