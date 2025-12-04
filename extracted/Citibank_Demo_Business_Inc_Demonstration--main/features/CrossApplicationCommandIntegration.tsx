// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { ConnectionsIcon } from '../icons';

export const CrossApplicationCommandIntegration: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <ConnectionsIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                Cross-Application Command Integration
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This feature demonstrates how the AI Command Center could be extended beyond this toolkit to interact with other applications on your local machine.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-lg">
                <p className="font-semibold">Example Prompts:</p>
                <p className="text-text-secondary font-mono bg-background p-2 rounded">"Open Photoshop and create a new 1920x1080 document."</p>
                <p className="text-text-secondary font-mono bg-background p-2 rounded">"Take the code from my active window, run it in iTerm, and show me the output."</p>
                <p className="text-text-secondary font-mono bg-background p-2 rounded">"Find all my Slack messages from 'John Doe' about Project Phoenix."</p>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI. Actual integration would require system-level permissions and APIs.</p>
        </div>
    );
};
