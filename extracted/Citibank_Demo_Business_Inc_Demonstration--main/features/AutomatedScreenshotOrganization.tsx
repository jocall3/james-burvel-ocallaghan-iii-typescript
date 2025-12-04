// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { ScreenshotToComponentIcon } from '../icons.tsx';

// This is a conceptual UI, actual file operations are not performed.
const exampleScreenshots = [
    { id: 1, name: 'Screenshot-2024-07-15.png', aiCategory: 'Code (React)', aiName: 'react-component-state.png' },
    { id: 2, name: 'Screen Shot 2024-07-14 at 10.30.AM.png', aiCategory: 'Social Media (Twitter)', aiName: 'twitter-thread-reply.png' },
    { id: 3, name: 'Screenshot_1.png', aiCategory: 'Design (Figma)', aiName: 'figma-wireframe-dashboard.png' },
];

export const AutomatedScreenshotOrganization: React.FC = () => {
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <ScreenshotToComponentIcon />
                    <span className="ml-3">Automated Screenshot Organizer</span>
                </h1>
                <p className="text-text-secondary mt-1">AI automatically categorizes and suggests new names for screenshots based on content.</p>
            </header>
            <div className="flex-grow overflow-y-auto bg-surface p-4 rounded-lg border border-border">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-border">
                        <tr>
                            <th className="p-2">Original Name</th>
                            <th className="p-2">AI-Detected Category</th>
                            <th className="p-2">AI-Suggested Name</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exampleScreenshots.map(ss => (
                            <tr key={ss.id} className="border-b border-border hover:bg-gray-100">
                                <td className="p-2 font-mono truncate">{ss.name}</td>
                                <td className="p-2"><span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-semibold">{ss.aiCategory}</span></td>
                                <td className="p-2 font-mono text-green-600">{ss.aiName}</td>
                                <td className="p-2 text-center">
                                    <button className="px-3 py-1 bg-gray-100 rounded-md text-xs hover:bg-gray-200">Apply</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <p className="text-xs text-center text-text-secondary mt-4">Note: This is a conceptual UI. File operations are not performed.</p>
            </div>
        </div>
    );
};
