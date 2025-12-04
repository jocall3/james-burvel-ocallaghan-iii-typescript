// types/models/integration/integration-platform.ts
import React from 'react';
import type { CodeSnippet } from './code-snippet';

export interface IntegrationPlatform {
    name: string;
    logo: React.ReactElement;
    description: string;
    snippets: CodeSnippet[];
}