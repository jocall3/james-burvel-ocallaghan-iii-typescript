// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { TrashIcon } from '../icons';

export const AutomatedFileSystemCleanup: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <TrashIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                Automated File System Cleanup
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This conceptual feature shows how a user could schedule and execute automated cleanup tasks, powered by AI to identify what's safe to remove.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-4 max-w-lg">
                <p className="font-semibold">Example Cleanup Rule:</p>
                 <div className="font-mono bg-background p-3 rounded">
                    <p><span className="text-primary">WHEN:</span> Every Sunday at 2:00 AM</p>
                    <p><span className="text-primary">IF:</span> File is in '/Downloads' AND is older than 30 days AND AI classifies as 'Installer' or 'Temporary Archive'</p>
                    <p><span className="text-primary">THEN:</span> Move to Trash</p>
                </div>
                <div className="text-center">
                    <button className="btn-primary" disabled>Save and Schedule</button>
                </div>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI for an advanced scheduling feature.</p>
        </div>
    );
};
