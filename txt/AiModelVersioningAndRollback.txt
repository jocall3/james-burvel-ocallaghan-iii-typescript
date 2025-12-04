// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { GitBranchIcon } from '../icons';

export const AiModelVersioningAndRollback: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <GitBranchIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                AI Model Versioning & Rollback
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This conceptual feature shows how the Toolkit could manage different versions of its local or fine-tuned AI models, allowing for rollbacks if an updated model shows performance degradation or unexpected behavior.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-lg">
                <p className="font-semibold">Model Version History:</p>
                 <ul className="list-disc list-inside text-text-secondary font-mono">
                    <li><span className="text-green-400">v1.2 (Active):</span> Improved code generation accuracy by 5%.</li>
                    <li><span className="text-gray-400">v1.1:</span> Initial release with summarization features.</li>
                    <li><span className="text-red-400">v1.0 (Rolled Back):</span> Introduced higher latency in code explanation.</li>
                </ul>
                <div className="text-center mt-4">
                    <button className="btn-primary" disabled>Rollback to v1.1</button>
                </div>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI for an advanced MLOps feature.</p>
        </div>
    );
};
