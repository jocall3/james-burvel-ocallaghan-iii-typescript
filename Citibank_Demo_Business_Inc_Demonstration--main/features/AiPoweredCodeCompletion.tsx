// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { CpuChipIcon } from '../icons';

export const AiPoweredCodeCompletion: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-text-primary">
            <div className="text-6xl mb-4 text-primary" aria-hidden="true">
                <CpuChipIcon />
            </div>
            <h1 className="text-3xl font-bold mb-2">
                AI-Powered Code Completion
            </h1>
            <p className="text-lg text-text-secondary max-w-lg">
                This feature demonstrates an advanced form of code completion where the AI predicts not just single words or lines, but entire blocks of code, functions, or even architectural patterns based on the current context.
            </p>
            <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm text-left space-y-2 max-w-2xl">
                <p className="font-semibold">Example Scenario:</p>
                <div className="text-text-secondary font-mono bg-background p-3 rounded">
                    <p>// User types:</p>
                    <p className="text-text-primary">function fetchAndProcessUserData(userId) &#123;</p>
                    <p className="text-gray-500 bg-gray-700 p-2 rounded my-1">
                        // AI Suggestion (ghost text):
                        <br />
                        {'  try {'}
                        <br />
                        {'    const response = await fetch(`/api/users/${userId}`);'}
                        <br />
                        {'    if (!response.ok) throw new Error("Network response was not ok");'}
                        <br />
                        {'    const user = await response.json();'}
                        <br />
                        {'    return { ...user, fullName: `${user.firstName} ${user.lastName}` };'}
                        <br />
                        {'  } catch (error) {'}
                        <br />
                        {'    console.error("Fetch error:", error);'}
                        <br />
                        {'    return null;'}
                        <br />
                        {'  }'}
                    </p>
                    <p>&#125;</p>
                </div>
            </div>
             <p className="text-xs text-text-secondary mt-4">Note: This is a conceptual UI demonstrating an advanced code completion feature.</p>
        </div>
    );
};
