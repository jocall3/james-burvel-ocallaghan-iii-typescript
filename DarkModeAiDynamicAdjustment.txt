// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { MoonIcon } from '../icons';

export const DarkModeAiDynamicAdjustment: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <MoonIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                Dark Mode AI Dynamic Adjustment
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This conceptual feature demonstrates how the application could use your device's ambient light sensor to dynamically adjust the dark mode theme for optimal viewing comfort.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-lg">
                <p className="font-semibold">Example Scenarios:</p>
                 <ul className="list-disc list-inside text-text-secondary">
                    <li><strong>Bright Room:</strong> AI detects high ambient light and increases the contrast of the dark theme to reduce glare and improve readability.</li>
                    <li><strong>Dark Room:</strong> AI detects low ambient light and lowers the contrast, using a true black background and dimmer text to reduce eye strain.</li>
                </ul>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI. Actual implementation would require access to the Ambient Light Sensor API.</p>
        </div>
    );
};
