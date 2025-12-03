// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { CommandLineIcon } from '../icons';

export const PersonalizedShortcutLearning: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <CommandLineIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                Personalized Shortcut Learning
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This conceptual feature demonstrates how the AI could observe your repeated manual actions and suggest creating custom keyboard shortcuts to automate those workflows, making you more efficient.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-lg">
                <p className="font-semibold">Example AI Suggestion:</p>
                <div className="text-text-secondary font-mono bg-background p-3 rounded">
                    <p>"I've noticed you frequently select a JavaScript file and then open the AI Unit Test Generator."</p>
                    <p className="mt-2">"Would you like to create a shortcut? For example, pressing <kbd className="mx-1 font-sans px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Ctrl</kbd> + <kbd className="mx-1 font-sans px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">Shift</kbd> + <kbd className="mx-1 font-sans px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">T</kbd> could automatically run this action on your selected file."</p>
                </div>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI explaining a potential productivity feature.</p>
        </div>
    );
};
