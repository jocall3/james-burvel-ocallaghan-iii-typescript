// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from 'react';
import type { OmniStruct } from '../../types';
import { buildOmniStruct, type OmniStructFormData } from '../../services/omniStructService';
import OmniStructCreator from './omnistruct/OmniStructCreator';
import OmniStructViewer from './omnistruct/OmniStructViewer';
import { ServerStackIcon } from '../icons';

type ViewState = 'creator' | 'viewer';

export const OmniStructFramework: React.FC = () => {
    const [omniStruct, setOmniStruct] = useState<OmniStruct | null>(null);
    const [view, setView] = useState<ViewState>('creator');

    const handleGenerate = (formData: OmniStructFormData) => {
        const newOmniStruct = buildOmniStruct(formData);
        setOmniStruct(newOmniStruct);
        setView('viewer');
    };

    const handleGoHome = () => {
        setOmniStruct(null);
        setView('creator');
    }

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background">
            <header className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-bold flex items-center">
                    <ServerStackIcon />
                    <span className="ml-3">OmniStruct Enterprise Framework</span>
                </h1>
                <p className="text-text-secondary mt-1">
                    {view === 'creator'
                        ? 'Define a new enterprise-grade project structure.'
                        : 'Interact with your generated OmniStruct.'
                    }
                </p>
            </header>
            <main className="flex-grow min-h-0">
                {view === 'creator' && <OmniStructCreator onGenerate={handleGenerate} />}
                {view === 'viewer' && omniStruct && (
                    <OmniStructViewer
                        initialOmniStruct={omniStruct}
                        onNewOmniStruct={handleGoHome}
                    />
                )}
            </main>
        </div>
    );
};
