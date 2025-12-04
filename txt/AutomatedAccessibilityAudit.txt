// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { EyeIcon } from '../icons.tsx';

const accessibilityChecks = [
    { category: 'Keyboard Navigation', items: ['All interactive elements are focusable.', 'Focus order is logical and intuitive.', 'Focus is clearly visible.', 'No keyboard traps exist.'] },
    { category: 'Screen Reader Compatibility', items: ['Images have descriptive alt text.', 'Buttons and links have descriptive text.', 'ARIA roles and attributes are used correctly.', 'Forms have proper labels.'] },
    { category: 'Content & Readability', items: ['Color contrast meets WCAG AA standards.', 'Text is resizable without breaking layout.', 'Content is structured with proper headings (H1, H2, etc.).'] },
    { category: 'Media', items: ['Videos have captions and/or transcripts.', 'Audio content has a transcript.'] }
];

export const AutomatedAccessibilityAudit: React.FC = () => {
    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6">
                <h1 className="text-3xl font-bold flex items-center">
                    <EyeIcon />
                    <span className="ml-3">Accessibility Audit Checklist</span>
                </h1>
                <p className="text-text-secondary mt-1">A manual checklist for performing a UI accessibility audit. This tool does not use AI.</p>
            </header>
            <div className="flex-grow overflow-y-auto space-y-6">
                {accessibilityChecks.map(section => (
                    <div key={section.category} className="bg-surface p-4 rounded-lg border border-border">
                        <h2 className="text-lg font-bold text-primary mb-3">{section.category}</h2>
                        <ul className="space-y-2">
                            {section.items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <input type="checkbox" id={`${section.category}-${index}`} className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <label htmlFor={`${section.category}-${index}`} className="text-text-primary">{item}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
