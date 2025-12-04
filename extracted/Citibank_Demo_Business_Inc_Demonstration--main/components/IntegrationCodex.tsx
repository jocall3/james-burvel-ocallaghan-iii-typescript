```tsx
// components/IntegrationCodex.tsx
// This is the sacred heart of the platform's new vision: a universal, AI-powered
// component that reveals the infinite connections of any module it inhabits.

// FIX: Added useEffect to the React import to resolve 'Cannot find name' error.
import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';
import Card from './Card';
import { INTEGRATION_DATA } from '../data/integrationData';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Language } from '../types';


// ================================================================================================
// EXTENDED TYPES & INTERFACES (New)
// ================================================================================================

// Extending the existing Language type from '../types' locally to include more options.
// This assumes 'Language' from '../types' might be a union type that can be extended,
// or that this local definition will be cast/used carefully where the broader set is needed.
export type ExtendedLanguage = Language | 'java' | 'csharp' | 'nodejs' | 'php' | 'ruby' | 'kotlin' | 'swift' | 'dart' | 'r' | 'scala' | 'rust' | 'elixir' | 'clojure' | 'haskell' | 'shell' | 'powershell' | 'terraform' | 'ansible' | 'dockerfile' | 'graphql' | 'json' | 'yaml' | 'xml' | 'csv' | 'markdown' | 'diff' | 'plaintext';

export interface AIComposedCodeSnippet {
    id: string;
    description: string;
    code: string;
    language: ExtendedLanguage;
    tags: string[];
    createdAt: string;
    lastModified: string;
}

// ================================================================================================
// ICON COMPONENTS (Self-contained for portability) - EXPANDED
// ================================================================================================
export const TypeScriptIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#3178C6" d="M0 0h24v24H0z"/><path fill="#fff" d="M9.4 16.6h1.4v-1.4H9.4v1.4zm2.8 0h1.4v-1.4h-1.4v1.4zm2.8 0h1.4v-1.4h-1.4v1.4zM21 4H3v16h18V4zm-3.5 14H16v-1.4h-1.4v-1.4H16v-1.4h1.4v4.2zM12.6 18v-1.4h1.4V18h-1.4zm-2.8 0v-1.4h1.4V18H9.8zm-2.8 0v-1.4h1.4V18H7zm-2.1-4.2H6.3V18H4.9v-4.2h1.4v1.4H4.9v1.4h1.4v-1.4zM16.8 14h-1.4v-1.4h1.4v-1.4h1.4V14h-1.4zm-4.2-1.4H11.2V14h1.4v-1.4zm-2.8 0H8.4V14h1.4v-1.4z"/></svg>;
export const PythonIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#3776AB" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 13h-2v2h-4v-2H8v-2h2V9H8V7h4v2h2v2h2v2z"/><path fill="#FFD43B" d="M12 15h2v-2h-2v2zm-4 0h2v-2H8v2z"/></svg>;
export const GoIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#00ADD8" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-4v-2h2v2h-2zm0-4V7h2v2h-2z"/></svg>;
export const JavaIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#E62C34" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1 15v-2h2v2h-2zm0-4v-2h2v2h-2zm0-4V7h2v2h-2z"/><path fill="#007396" d="M12 10h2v2h-2v-2zm0 4h2v2h-2v-2zM8 10h2v2H8v-2zm0 4h2v2H8v-2z"/></svg>; // Simplified Java logo colors
export const CSharpIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#9C27B0" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/></svg>; // Simplified C# logo
export const NodeJSIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#68A063" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#303030" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified NodeJS logo
export const PHPIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#777BB4" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#4F5D95" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified PHP logo
export const RubyIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#CC342D" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#991A00" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Ruby logo
export const KotlinIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#7F52FF" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#B125EA" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Kotlin logo
export const SwiftIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#F05138" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#E65829" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Swift logo
export const DartIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#0175C2" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#00B4AB" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Dart logo
export const RIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#276DC3" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#314B7F" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified R logo
export const ScalaIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#DC322F" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#B02C29" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Scala logo
export const RustIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#DEA584" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#DD7727" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Rust logo
export const ElixirIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#6E4A7E" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#9C449C" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Elixir logo
export const ClojureIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#5881D8" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#4673C4" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Clojure logo
export const HaskellIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#5D4F85" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#9E8AD0" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Haskell logo
export const ShellIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#4EAA25" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#3D821C" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Shell logo
export const PowershellIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#0172B5" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#024B85" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Powershell logo
export const TerraformIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#623CE4" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#8445DD" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Terraform logo
export const AnsibleIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#EE0000" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#CC0000" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Ansible logo
export const DockerfileIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#2496ED" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#0DB7ED" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Dockerfile icon
export const GraphQLIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#E10098" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#D6017B" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified GraphQL icon
export const JSONIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#000000" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#4C4C4C" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified JSON icon
export const YAMLIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#CB1717" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#AA0000" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified YAML icon
export const XMLIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#1A73E8" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#4285F4" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified XML icon
export const CSVIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#4CAF50" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#66BB6A" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified CSV icon
export const MarkdownIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#E040FB" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#880ED4" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Markdown icon
export const DiffIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#FF6D00" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#FF8F00" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Diff icon
export const PlaintextIcon: React.FC = () => <svg viewBox="0 0 24 24"><path fill="#AAAAAA" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm-1.5 13.5v-7h-1.5v-1h3v1h-1.5v7h-1.5z"/><path fill="#CCCCCC" d="M12 10h2v2h-2v-2zM8 10h2v2H8v-2z"/></svg>; // Simplified Plaintext icon


// ================================================================================================
// UTILITY COMPONENTS (New)
// ================================================================================================

// Note: `custom-scrollbar` is a placeholder class, assuming global CSS is available elsewhere.
// e.g.,
// .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: #333; border-radius: 10px; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 10px; }
// .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #777; }

export const SyntaxHighlighter: React.FC<{ code: string, language: ExtendedLanguage }> = ({ code, language }) => {
    // In a real application, this would use a library like react-syntax-highlighter.
    // For this exercise, we'll simulate it with basic styling.
    const displayCode = code.startsWith('// AI is generating') ? code : `// AI-generated ${language} code with syntax highlighting (simulated)\n` + code;
    return (
        <pre className="text-xs text-gray-300 bg-black/50 p-4 rounded-lg overflow-x-auto custom-scrollbar font-mono">
            <code className={`language-${language}`}>{displayCode}</code>
        </pre>
    );
};

export const DiagramRenderer: React.FC<{ definition: string, type: 'mermaid' | 'graphviz' | 'ascii' | 'custom' }> = ({ definition, type }) => {
    // In a real application, this would render a diagram using Mermaid.js, Graphviz, or a custom engine.
    // For this exercise, we'll just display the definition or a placeholder.
    let content;
    if (type === 'ascii') {
        content = <pre className="text-xs text-green-300 bg-black/50 p-4 rounded-lg overflow-x-auto custom-scrollbar font-mono">{definition}</pre>;
    } else {
        content = (
            <div className="bg-gray-800/50 p-4 rounded-lg text-sm text-gray-400">
                <p><strong>{type.toUpperCase()} Diagram (Simulated)</strong></p>
                <p className="mt-2">A visually rich {type} diagram would be rendered here.</p>
                <p className="mt-2 text-gray-500">Definition for {type} renderer:</p>
                <pre className="text-xs text-gray-300 bg-black/50 p-2 rounded overflow-x-auto custom-scrollbar font-mono">{definition}</pre>
            </div>
        );
    }
    return content;
};

export const AIChatMessage: React.FC<{ role: 'user' | 'model', text: string }> = ({ role, text }) => {
    // Basic markdown parsing for code blocks and diagrams. In a real app, use a markdown library.
    // This regex splits the text by ``` code blocks and ```mermaid/```graphviz blocks.
    const parts = text.split(/(```(?:mermaid|graphviz|json|yaml|xml|csv|markdown|diff|\w+)?[\s\S]*?```)/g).filter(Boolean);
    
    return (
        <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl p-3 rounded-lg text-sm whitespace-pre-line ${role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                {parts.map((part, index) => {
                    if (part.startsWith('```')) {
                        const codeContent = part.replace(/```(.*?)\n/, '').replace(/```/, '').trim();
                        const langMatch = part.match(/```(\w+)\n/);
                        const language: ExtendedLanguage = langMatch ? (langMatch[1].toLowerCase() as ExtendedLanguage) : 'plaintext';

                        if (language === 'mermaid') {
                            return <DiagramRenderer key={index} definition={codeContent} type="mermaid" />;
                        }
                        if (language === 'graphviz') {
                            return <DiagramRenderer key={index} definition={codeContent} type="graphviz" />;
                        }
                        return <SyntaxHighlighter key={index} code={codeContent} language={language} />;
                    }
                    // Simple text rendering, replace bold markdown (not exhaustive)
                    const renderedText = part
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');
                    return <p key={index} dangerouslySetInnerHTML={{ __html: renderedText }}></p>;
                })}
            </div>
        </div>
    );
};


// ================================================================================================
// MAIN COMPONENT: IntegrationCodex - EXPANDED TABS
// ================================================================================================

interface IntegrationCodexProps {
    module: View;
}

export const IntegrationCodex: React.FC<IntegrationCodexProps> = ({ module }) => {
    type CodexTab = 'integrations' | 'useCases' | 'oracle' | 'aiComposer' | 'dataFlow' | 'schemaNexus' | 'lifecycle' | 'community' | 'securityAuditor' | 'predictiveAnalytics' | 'autonomousAgents' | 'globalOrchestrator' | 'quantumGateway' | 'metaVerse' | 'codexSettings' | 'realtimeDebugger' | 'aiOpsInsights' | 'eventSourcing';
    const [activeTab, setActiveTab] = useState<CodexTab>('integrations');
    const data = INTEGRATION_DATA[module];

    if (!data) {
        return null; // Don't render if there's no integration data for this module
    }

    const tabs: {id: CodexTab, label: string}[] = [
        { id: 'integrations', label: 'Integrations' },
        { id: 'useCases', label: 'Use Cases' },
        { id: 'oracle', label: 'Nexus Oracle' },
        { id: 'aiComposer', label: 'AI Composer' },
        { id: 'dataFlow', label: 'Data Flow Vision' },
        { id: 'schemaNexus', label: 'Schema Nexus' },
        { id: 'lifecycle', label: 'Lifecycle Mgr' },
        { id: 'community', label: 'Community Hub' },
        { id: 'securityAuditor', label: 'Security Auditor' },
        { id: 'predictiveAnalytics', label: 'Predictive Analytics' },
        { id: 'autonomousAgents', label: 'Autonomous Agents' },
        { id: 'globalOrchestrator', label: 'Global Orchestrator' },
        { id: 'eventSourcing', label: 'Event Sourcing' },
        { id: 'realtimeDebugger', label: 'Realtime Debugger' },
        { id: 'aiOpsInsights', label: 'AIOps Insights' },
        { id: 'quantumGateway', label: 'Quantum Gateway' },
        { id: 'metaVerse', label: 'MetaVerse Explorer' },
        { id: 'codexSettings', label: 'Codex Settings' },
    ];

    return (
        <Card title="Integration Codex" className="mt-6" isCollapsible defaultCollapsed>
            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                {tabs.map(tab => (
                    <TabButton 
                        key={tab.id} 
                        label={tab.label} 
                        isActive={activeTab === tab.id} 
                        onClick={() => setActiveTab(tab.id)} 
                    />
                ))}
            </div>
            <div>
                {activeTab === 'integrations' && <IntegrationsPanel integrations={data.integrations} />}
                {activeTab === 'useCases' && <UseCasesPanel useCases={data.useCases} />}
                {activeTab === 'oracle' && <NexusOraclePanel moduleName={module} />}
                {activeTab === 'aiComposer' && <AIComposerPanel moduleName={module} />}
                {activeTab === 'dataFlow' && <DataFlowPanel moduleName={module} />}
                {activeTab === 'schemaNexus' && <SchemaNexusPanel moduleName={module} />}
                {activeTab === 'lifecycle' && <LifecycleManagementPanel moduleName={module} />}
                {activeTab === 'community' && <CommunityHubPanel moduleName={module} />}
                {activeTab === 'securityAuditor' && <SecurityAuditorPanel moduleName={module} />}
                {activeTab === 'predictiveAnalytics' && <PredictiveAnalyticsPanel moduleName={module} />}
                {activeTab === 'autonomousAgents' && <AutonomousAgentPanel moduleName={module} />}
                {activeTab === 'globalOrchestrator' && <GlobalOrchestratorPanel moduleName={module} />}
                {activeTab === 'eventSourcing' && <EventSourcingPanel moduleName={module} />}
                {activeTab === 'realtimeDebugger' && <RealtimeDebuggerPanel moduleName={module} />}
                {activeTab === 'aiOpsInsights' && <AIOpsInsightsPanel moduleName={module} />}
                {activeTab === 'quantumGateway' && <QuantumGatewayPanel moduleName={module} />}
                {activeTab === 'metaVerse' && <MetaVerseExplorerPanel moduleName={module} />}
                {activeTab === 'codexSettings' && <CodexSettingsPanel moduleName={module} />}
            </div>
        </Card>
    );
};

export const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px ${isActive ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-white'}`}>
        {label}
    </button>
);


// ================================================================================================
// PANELS - EXPANDED AND NEW
// ================================================================================================

export const IntegrationsPanel: React.FC<{integrations: any[]}> = ({ integrations }) => {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(integrations[0]?.name || null);
    const [selectedLanguage, setSelectedLanguage] = useState<ExtendedLanguage>('typescript'); // Use ExtendedLanguage
    const [copySuccess, setCopySuccess] = useState('');
    const [activeSubTab, setActiveSubTab] = useState<'snippets' | 'apiExplorer' | 'sdkManager' | 'versionControl' | 'lowCodeConnectors'>('snippets');


    const activeSnippet = integrations
        .find(p => p.name === selectedPlatform)?.snippets
        ?.find((s: any) => s.language === selectedLanguage);
    
    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const getLanguageIcon = (lang: ExtendedLanguage) => {
        switch (lang) {
            case 'typescript': return TypeScriptIcon; case 'python': return PythonIcon; case 'go': return GoIcon;
            case 'java': return JavaIcon; case 'csharp': return CSharpIcon; case 'nodejs': return NodeJSIcon;
            case 'php': return PHPIcon; case 'ruby': return RubyIcon; case 'kotlin': return KotlinIcon;
            case 'swift': return SwiftIcon; case 'dart': return DartIcon; case 'r': return RIcon;
            case 'scala': return ScalaIcon; case 'rust': return RustIcon; case 'elixir': return ElixirIcon;
            case 'clojure': return ClojureIcon; case 'haskell': return HaskellIcon; case 'shell': return ShellIcon;
            case 'powershell': return PowershellIcon; case 'terraform': return TerraformIcon; case 'ansible': return AnsibleIcon;
            case 'dockerfile': return DockerfileIcon; case 'graphql': return GraphQLIcon; case 'json': return JSONIcon;
            case 'yaml': return YAMLIcon; case 'xml': return XMLIcon; case 'csv': return CSVIcon; case 'markdown': return MarkdownIcon;
            case 'diff': return DiffIcon; case 'plaintext': return PlaintextIcon;
            default: return PlaintextIcon; // Fallback
        }
    }

    const availableLanguages: ExtendedLanguage[] = [
        'typescript', 'python', 'go', 'java', 'csharp', 'nodejs', 'php', 'ruby', 'kotlin', 'swift', 'dart', 'r', 'scala', 'rust',
        'elixir', 'clojure', 'haskell', 'shell', 'powershell', 'terraform', 'ansible', 'dockerfile', 'graphql', 'json', 'yaml', 'xml', 'csv', 'markdown', 'diff', 'plaintext'
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
                <h3 className="text-lg font-semibold text-white mb-3">Integrated Platforms</h3>
                {integrations.map(platform => (
                    <button key={platform.name} onClick={() => setSelectedPlatform(platform.name)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${selectedPlatform === platform.name ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}>
                        <div className="w-8 h-8 flex-shrink-0">{platform.logo}</div>
                        <span className="text-sm font-medium text-white">{platform.name}</span>
                    </button>
                ))}
                {integrations.length === 0 && <p className="text-gray-500 text-sm italic">No integrations defined.</p>}
            </div>
            <div className="md:col-span-3">
                {integrations.find(p => p.name === selectedPlatform) ? (
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-2">{selectedPlatform}</h3>
                        <p className="text-sm text-gray-300 mb-4">{integrations.find(p => p.name === selectedPlatform)!.description}</p>
                        
                        <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                            <TabButton label="Code Snippets" isActive={activeSubTab === 'snippets'} onClick={() => setActiveSubTab('snippets')} />
                            <TabButton label="API Explorer" isActive={activeSubTab === 'apiExplorer'} onClick={() => setActiveSubTab('apiExplorer')} />
                            <TabButton label="SDK Manager" isActive={activeSubTab === 'sdkManager'} onClick={() => setActiveSubTab('sdkManager')} />
                            <TabButton label="Version Control" isActive={activeSubTab === 'versionControl'} onClick={() => setActiveSubTab('versionControl')} />
                            <TabButton label="Low-Code Connectors" isActive={activeSubTab === 'lowCodeConnectors'} onClick={() => setActiveSubTab('lowCodeConnectors')} />
                        </div>

                        {activeSubTab === 'snippets' && (
                            <>
                                <div className="flex gap-2 mb-2 p-1 bg-gray-800/50 rounded-lg overflow-x-auto custom-scrollbar">
                                    {availableLanguages.map(lang => {
                                        const IconComponent = getLanguageIcon(lang);
                                        return (
                                            <LangButton 
                                                key={lang} 
                                                lang={lang} 
                                                Icon={IconComponent} 
                                                selected={selectedLanguage} 
                                                setSelected={setSelectedLanguage} 
                                            />
                                        );
                                    })}
                                </div>
                                <div className="relative">
                                    <SyntaxHighlighter code={activeSnippet?.code || `// No snippet available for ${selectedLanguage} for ${selectedPlatform}.`} language={selectedLanguage} />
                                    <button onClick={() => handleCopy(activeSnippet?.code || '')} className="absolute top-2 right-2 text-xs bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded">
                                        {copySuccess || 'Copy'}
                                    </button>
                                </div>
                            </>
                        )}

                        {activeSubTab === 'apiExplorer' && (<APIExplorer platform={selectedPlatform} />)}
                        {activeSubTab === 'sdkManager' && (<SDKManager platform={selectedPlatform} />)}
                        {activeSubTab === 'versionControl' && (<VersionControlIntegration platform={selectedPlatform} />)}
                        {activeSubTab === 'lowCodeConnectors' && (<LowCodeConnectors platform={selectedPlatform} />)}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-900/50 rounded-lg text-gray-400">
                        <p className="text-lg">Select a platform to explore its integration capabilities.</p>
                        <p className="mt-2 text-sm">Or add a new integration via the Codex Settings.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const LangButton: React.FC<{lang: ExtendedLanguage, Icon: React.FC, selected: ExtendedLanguage, setSelected: (l: ExtendedLanguage) => void}> = ({ lang, Icon, selected, setSelected }) => (
    <button onClick={() => setSelected(lang)} title={lang.charAt(0).toUpperCase() + lang.slice(1)} className={`p-1 rounded-md ${selected === lang ? 'bg-cyan-600' : 'hover:bg-gray-700'}`}>
        <Icon />
    </button>
);


export const UseCasesPanel: React.FC<{useCases: any[]}> = ({ useCases }) => (
    <div className="space-y-4">
        {useCases.length === 0 && <p className="text-gray-400 text-sm text-center p-4">No specific use cases defined for this module. Ask the Nexus Oracle for ideas!</p>}
        {useCases.map(useCase => (
            <div key={useCase.title} className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                <h4 className="font-semibold text-white">{useCase.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{useCase.description}</p>
                {useCase.steps && (
                    <ol className="list-decimal list-inside text-sm text-gray-500 mt-2">
                        {useCase.steps.map((step: string, idx: number) => <li key={idx}>{step}</li>)}
                    </ol>
                )}
                {useCase.exampleCode && (
                    <div className="mt-3">
                        <SyntaxHighlighter code={useCase.exampleCode} language={useCase.exampleLanguage || 'typescript'} />
                    </div>
                )}
            </div>
        ))}
    </div>
);


export const NexusOraclePanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const AI_SYSTEM_INSTRUCTION = `You are the Nexus Oracle, an expert AI assistant within the "${moduleName}" module of Demo Bank. 
    Your purpose is to provide highly detailed, context-aware guidance on integration challenges, best practices,
    architecture, security, performance optimization, and future-proofing. You can generate production-ready code snippets
    in any major language, suggest API endpoints, illustrate data flows, propose schema mappings, and analyze potential
    risks. Think step-by-step. Provide code in markdown code blocks, specifying language (e.g., \`\`\`typescript).
    Use Mermaid syntax for diagrams when applicable (e.g., \`\`\`mermaid).
    Assume access to all Demo Bank's internal documentation and external integration specs. Offer multiple perspectives and alternatives.`;

     useEffect(() => {
        if (!chatRef.current) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // The original code used `ai.chats.create`. While newer SDKs might prefer `startChat` for history,
            // we'll maintain the original `create` call with `systemInstruction` as it was presented.
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: AI_SYSTEM_INSTRUCTION }
            });
            // Initial greeting from Oracle
            setMessages([
                { role: 'model', text: `Greetings, developer. I am the Nexus Oracle, ready to illuminate the infinite possibilities of integration for the **${moduleName}** module. How may I assist your quest today?` }
            ]);
        }
    }, [moduleName]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || !chatRef.current) return;

        setIsLoading(true);
        const userMessage = { role: 'user' as const, text: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const result = await chatRef.current.sendMessage({ message: messageText });
            setMessages(prev => [...prev, { role: 'model', text: result.text }]);
        } catch (error) {
            console.error("Nexus Oracle error:", error);
            setMessages(prev => [...prev, { role: 'model', text: `An error occurred while consulting the Oracle. Please try again. Error: ${error instanceof Error ? error.message : String(error)}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-96 bg-gray-900/50 rounded-lg">
             <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {messages.length === 0 && <p className="text-gray-400 text-sm text-center p-4">Ask the Oracle how to build an integration. For example: "How do I create a new customer in Stripe?" Or ask about complex topics: "What's the best strategy for real-time fraud detection integration?"</p>}
                {messages.map((msg, index) => (
                    <AIChatMessage key={index} role={msg.role} text={msg.text} />
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-700 text-gray-200">Processing query...</div></div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-700">
                <form onSubmit={e => {e.preventDefault(); handleSendMessage(input);}} className="flex gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask the Oracle anything about integrations..." className="w-full bg-gray-700/50 p-2 rounded text-sm text-white" disabled={isLoading} />
                    <button type="submit" disabled={isLoading || !input.trim()} className="px-4 bg-cyan-600 rounded disabled:opacity-50">Send</button>
                </form>
            </div>
        </div>
    );
};

// ================================================================================================
// NEW PANELS (THE UNIVERSE EXPANSION)
// ================================================================================================

export const AIComposerPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [task, setTask] = useState<'generate' | 'refactor' | 'optimize' | 'test' | 'debug' | 'document'>('generate');
    const [language, setLanguage] = useState<ExtendedLanguage>('typescript');
    const [prompt, setPrompt] = useState('');
    const [codeOutput, setCodeOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [savedSnippets, setSavedSnippets] = useState<AIComposedCodeSnippet[]>([]);

    const handleGenerateCode = async () => {
        setIsLoading(true);
        setCodeOutput(`// AI is ${task === 'generate' ? 'generating' : task + 'ing'} ${language} code for: "${prompt}" in ${moduleName} module...\n\nawait new Promise(resolve => setTimeout(resolve, 2500));\n// Simulated AI-${task}-ed code:\n${
            task === 'generate' ? 
            `class ${moduleName}IntegrationService {\n  ${language === 'typescript' ? 'async ' : ''}function ${language === 'typescript' ? 'fetchData' : 'fetch_data'}(${language === 'typescript' ? 'query: string' : 'query'}) {\n    console.log('${language === 'typescript' ? 'Fetching data' : 'Fetching data for'} ' + query);\n    // AI-generated logic for ${prompt}\n    return { status: 'success', data: 'AI-composed data' };\n  }\n}` :
            task === 'refactor' ? `// Refactored code for: "${prompt}"\n\n// Original: (Assume original code was here)\n\n// Refactored for better readability and ${language} idioms\nfunction refactoredFunction(input) { /* ... */ }` :
            task === 'optimize' ? `// Optimized code for: "${prompt}"\n\n// Original: (Assume original code was here)\n\n// Optimized for ${language} performance and resource efficiency\nfunction optimizedFunction(input) { /* ... */ }` :
            task === 'test' ? `// AI-generated test cases for: "${prompt}"\n\nimport { expect } from 'chai';\ndescribe('${moduleName} Integration', () => {\n  it('should handle ${prompt} correctly', () => {\n    // Test logic here with mock data\n    expect(true).to.be.true;\n  });\n});` :
            task === 'debug' ? `// AI-assisted debugging for: "${prompt}"\n\n// Analysis: Found potential null pointer dereference in line 123 of src/core.ts\n// Suggestion: Add a null check before accessing property. \n// Recommended Fix:\n\`\`\`${language}\nif (${language === 'typescript' ? 'data != null' : 'data is not None'}) {\n  // Access data properties\n}\n\`\`\`` :
            `// AI-generated documentation for: "${prompt}"\n\n\`\`\`markdown\n### Integration Function: \`process${moduleName}Request\`\n\nThis function is responsible for orchestrating the processing of incoming requests related to the ${moduleName} module.\n\n**Parameters:**\n- \`payload\`: The raw request payload, expected to be a JSON object conforming to the [RequestSchema](#request-schema).\n- \`options\`: (Optional) Configuration options for processing, e.g., \`{ validate: true }\`.\n\n**Returns:**\n- \`Promise<ResponseObject>\`: An asynchronous operation resolving to a standardized response object, including status and processed data.\n\n**Flow Diagram:**\n\`\`\`mermaid\ngraph TD\n    A[Receive Request] --> B{Validate Payload}\n    B -- Valid --> C(Transform Data)\n    C --> D[Call External Service]\n    D --> E{Handle Response}\n    E -- Success --> F[Update Database]\n    F --> G[Return Success]\n    B -- Invalid --> H[Return Error]\n    E -- Failure --> H\n\`\`\`\n\`\`\``
        }`);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
        setIsLoading(false);
    };

    const handleSaveSnippet = () => {
        if (codeOutput.trim()) {
            const newSnippet: AIComposedCodeSnippet = {
                id: `ai-${Date.now()}`,
                description: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
                code: codeOutput,
                language: language,
                tags: [task, language, moduleName],
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
            };
            setSavedSnippets(prev => [...prev, newSnippet]);
            alert('Snippet saved to AI Composed Library!');
        }
    };

    const availableLanguages: ExtendedLanguage[] = [
        'typescript', 'python', 'go', 'java', 'csharp', 'nodejs', 'php', 'ruby', 'kotlin', 'swift', 'dart', 'r', 'scala', 'rust',
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">AI-Powered Code Composer for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Generate, refactor, optimize, test, debug, and document code snippets for integrations using advanced AI models. Your personal co-pilot.</p>

            <div className="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-lg w-full mb-4 overflow-x-auto custom-scrollbar">
                {['generate', 'refactor', 'optimize', 'test', 'debug', 'document'].map(t => (
                    <TabButton 
                        key={t} 
                        label={t.charAt(0).toUpperCase() + t.slice(1)} 
                        isActive={task === t} 
                        onClick={() => setTask(t as any)} 
                    />
                ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-4 p-1 bg-gray-800/50 rounded-lg w-fit">
                {availableLanguages.map(lang => {
                    const IconComponent = getLanguageIcon(lang);
                    return <LangButton key={lang} lang={lang} Icon={IconComponent} selected={language} setSelected={setLanguage} />;
                })}
            </div>

            <textarea
                className="w-full h-24 bg-gray-700/50 p-3 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                placeholder={`Enter your ${task} prompt for the ${moduleName} module... (e.g., "function to validate incoming webhook payload from Stripe" or "debug why API calls are failing post-deployment")`}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={isLoading}
            ></textarea>
            <button
                onClick={handleGenerateCode}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={isLoading || !prompt.trim()}
            >
                {isLoading ? `AI is ${task === 'generate' ? 'composing' : task + 'ing'}...` : `Intelligent ${task.charAt(0).toUpperCase() + task.slice(1)}`}
            </button>

            {codeOutput && (
                <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Generated Output:</h4>
                    <AIChatMessage role="model" text={codeOutput} />
                    <button onClick={handleSaveSnippet} className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50" disabled={!codeOutput.trim()}>
                        Save to AI Composed Library
                    </button>
                </div>
            )}
            
            {savedSnippets.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-semibold text-white mb-3">AI Composed Library:</h4>
                    <div className="space-y-3">
                        {savedSnippets.map(snippet => (
                            <div key={snippet.id} className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-emerald-500">
                                <h5 className="font-semibold text-white">{snippet.description} ({snippet.language})</h5>
                                <p className="text-xs text-gray-500">Created: {new Date(snippet.createdAt).toLocaleString()}</p>
                                <button onClick={() => setCodeOutput(snippet.code)} className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm">Load Snippet</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">Note: AI Composer leverages advanced contextual learning from global integration patterns, Demo Bank's internal codebases, and real-time operational feedback for superior code quality and relevance. It can adapt to your team's coding style and architectural preferences.</p>
        </div>
    );
};

export const DataFlowPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [flowDefinition, setFlowDefinition] = useState('graph TD\n    A[Event Source: CRM Customer Create] --> B(Data Transformation Service)\n    B --> C{Decision: Notify External?}\n    C -- Yes --> D[External API Call: Marketing Platform]\n    C -- No --> E[Internal Log]\n    D --> F[Success Acknowledge]\n    E --> F\n    F --> G(Update Internal Status)\n    G --> H[Completion]');
    const [eventsLog, setEventsLog] = useState<string[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [filterEvent, setFilterEvent] = useState('');
    const [activeTopology, setActiveTopology] = useState<'logical' | 'physical' | 'realtime'>('logical');


    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isMonitoring) {
            interval = setInterval(() => {
                const eventTypes = ['Customer_Update', 'Transaction_Processed', 'Loan_Application', 'Fraud_Alert'];
                const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                const newEvent = `[${new Date().toLocaleTimeString()}] Event: ${randomEventType}_${Math.random().toFixed(4)} through ${moduleName} flow. Status: ${Math.random() > 0.1 ? 'SUCCESS' : 'FAILURE'}. Latency: ${Math.floor(Math.random() * 200)}ms.`;
                setEventsLog(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [isMonitoring, moduleName]);

    const filteredEvents = eventsLog.filter(event => event.toLowerCase().includes(filterEvent.toLowerCase()));

    const getTopologyDescription = (topology: typeof activeTopology) => {
        if (topology === 'logical') return "High-level view of data movement and transformation stages.";
        if (topology === 'physical') return "Underlying infrastructure, microservices, and network paths involved.";
        if (topology === 'realtime') return "Live-updating view with metrics like latency, throughput, and error rates.";
        return "";
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Data Flow Vision for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Visualize, monitor, and configure data pipelines. Understand event propagation, transformations, and potential bottlenecks across integrated systems.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                {['logical', 'physical', 'realtime'].map(t => (
                    <TabButton 
                        key={t} 
                        label={t.charAt(0).toUpperCase() + t.slice(1) + ' Topology'} 
                        isActive={activeTopology === t} 
                        onClick={() => setActiveTopology(t as any)} 
                    />
                ))}
            </div>

            <div>
                <h4 className="font-semibold text-white mb-2">{activeTopology.charAt(0).toUpperCase() + activeTopology.slice(1)} Data Flow Diagram (Mermaid Syntax)</h4>
                <p className="text-sm text-gray-500 mb-2">{getTopologyDescription(activeTopology)}</p>
                <DiagramRenderer definition={flowDefinition} type="mermaid" />
                <textarea
                    className="w-full h-32 bg-gray-700/50 p-3 rounded text-sm text-white mt-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                    placeholder="Edit Mermaid diagram definition here or use AI to generate..."
                    value={flowDefinition}
                    onChange={e => setFlowDefinition(e.target.value)}
                ></textarea>
                <button className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded">AI Suggest Flow Optimization</button>
            </div>

            <div>
                <h4 className="font-semibold text-white mb-2">Real-time Event Monitor</h4>
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() => setIsMonitoring(!isMonitoring)}
                        className={`px-4 py-2 rounded text-sm font-medium ${isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                    >
                        {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                    </button>
                    <input
                        type="text"
                        placeholder="Filter events..."
                        className="flex-grow bg-gray-700/50 p-2 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={filterEvent}
                        onChange={e => setFilterEvent(e.target.value)}
                    />
                </div>
                <div className="bg-black/50 p-4 rounded-lg h-48 overflow-y-auto custom-scrollbar text-xs text-gray-300">
                    {filteredEvents.length === 0 && <p className="text-gray-500">No events captured yet or no events matching filter. Start monitoring to see live data flow events.</p>}
                    {filteredEvents.map((event, index) => (
                        <p key={index} className="truncate">{event}</p>
                    ))}
                </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">This panel offers predictive anomaly detection, AI-driven optimization suggestions for data throughput and latency, and integrates with distributed tracing systems (e.g., OpenTelemetry, Zipkin).</p>
        </div>
    );
};

export const SchemaNexusPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [sourceSchema, setSourceSchema] = useState(`type User { id: ID!, name: String!, email: String, addressId: ID }`);
    const [targetSchema, setTargetSchema] = useState(`interface CustomerDTO { customerId: string, fullName: string, contactEmail: string, postalCode: string, loyaltyTier?: string }`);
    const [mappingOutput, setMappingOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'mapper' | 'validator' | 'discovery'>('mapper');

    const handleGenerateMapping = async () => {
        setIsLoading(true);
        setMappingOutput(`// AI-generated mapping for ${moduleName}:\n\nMapping for User (Source) to CustomerDTO (Target):\nUser.id (ID!) -> CustomerDTO.customerId (string) : **Mandatory, Type Cast**\nUser.name (String!) -> CustomerDTO.fullName (string) : **Mandatory, Direct Map**\nUser.email (String) -> CustomerDTO.contactEmail (string) : **Optional, Direct Map**\nUser.addressId (ID) -> CustomerDTO.postalCode (string) : **Optional, Transform: Lookup Address Service, then Extract Postal Code**\n\n\`\`\`json\n{\n  "source": "User",\n  "target": "CustomerDTO",\n  "mappings": [\n    {"from": "id", "to": "customerId", "transform": "toString", "required": true},\n    {"from": "name", "to": "fullName", "required": true},\n    {"from": "email", "to": "contactEmail", "required": false},\n    {"from": "addressId", "to": "postalCode", "transform": "lookupAddressPostalCode", "required": false}\n  ],\n  "unmapped_target_fields": ["loyaltyTier"],\n  "ai_recommendations": [\n    "Consider a default value or explicit handling for unmapped 'loyaltyTier' in CustomerDTO.",\n    "Implement robust error handling for 'lookupAddressPostalCode' transformation."\n  ]\n}\n\`\`\``);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
    };

    const handleValidateSchema = async () => {
        setIsLoading(true);
        setMappingOutput(`// AI-powered Schema Validation for ${moduleName}:\n\n**Validation Report:**\n- **Source Schema (User):** \n  - Valid GraphQL SDL syntax. \n  - No critical issues detected.\n- **Target Schema (CustomerDTO):** \n  - Valid TypeScript interface syntax. \n  - **Warning:** \`loyaltyTier\` is optional in Target but has no corresponding source field. Consider if this is intentional for new data or if a default/transformation is needed.\n- **Compatibility Check:** \n  - All mandatory target fields can be sourced or transformed. \n  - Potential data type mismatch risk: \`ID\` to \`string\` for \`id\`/\`customerId\` - explicit conversion needed.\n\`\`\`json\n{\n  "status": "warning",\n  "issues": [\n    {"type": "compatibility", "severity": "medium", "description": "Type conversion from ID to string needed for customer ID."}, \n    {"type": "completeness", "severity": "low", "description": "Target field 'loyaltyTier' is unmapped."}\n  ]\n}\n\`\`\``);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
    };

    const handleDiscoverSchemas = async () => {
        setIsLoading(true);
        setMappingOutput(`// AI-powered Schema Discovery for ${moduleName}:\n\n**Discovered Schemas in Demo Bank Ecosystem:**\n\n- **Internal Microservices:**\n  - \`CustomerProfileService (GraphQL)\`: Contains \`User\`, \`Account\`, \`Address\` types.\n  - \`LoanProcessingService (Protobuf)\`: Defines \`LoanApplication\`, \`CreditScoreRequest\` messages.\n  - \`TransactionService (JSON Schema)\`: Describes \`TransactionEvent\`.\n\n- **External Integrations (Detected from API Specs):**\n  - \`Stripe API (OpenAPI 3.0)\`: \`PaymentIntent\`, \`Customer\`, \`Charge\` schemas.\n  - \`Salesforce CRM (SOAP/REST WSDL)\`: \`Lead\`, \`Contact\`, \`Opportunity\` objects.\n\n\`\`\`json\n[\n  {"name": "CustomerProfileService.User", "type": "GraphQL"}, \n  {"name": "LoanProcessingService.LoanApplication", "type": "Protobuf"}, \n  {"name": "Stripe.PaymentIntent", "type": "OpenAPI"}\n]\n\`\`\`\n*Recommendation: AI suggests generating a unified data model based on common entities across these discovered schemas to improve interoperability.*`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Schema Nexus for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Intelligent schema discovery, mapping, and validation across diverse data models (e.g., GraphQL, JSON, Protobuf, SQL, Avro, XML) for robust data integration.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                <TabButton label="AI Mapper" isActive={activeTab === 'mapper'} onClick={() => setActiveTab('mapper')} />
                <TabButton label="Schema Validator" isActive={activeTab === 'validator'} onClick={() => setActiveTab('validator')} />
                <TabButton label="Discovery Engine" isActive={activeTab === 'discovery'} onClick={() => setActiveTab('discovery')} />
            </div>

            {activeTab === 'mapper' && (
                <>
                    <div>
                        <h4 className="font-semibold text-white mb-2">Source Schema Definition (e.g., GraphQL SDL, JSON Schema)</h4>
                        <textarea
                            className="w-full h-28 bg-gray-700/50 p-3 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                            placeholder="Define your source schema..."
                            value={sourceSchema}
                            onChange={e => setSourceSchema(e.target.value)}
                            disabled={isLoading}
                        ></textarea>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-2">Target Schema Definition</h4>
                        <textarea
                            className="w-full h-28 bg-gray-700/50 p-3 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                            placeholder="Define your target schema..."
                            value={targetSchema}
                            onChange={e => setTargetSchema(e.target.value)}
                            disabled={isLoading}
                        ></textarea>
                    </div>

                    <button
                        onClick={handleGenerateMapping}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        disabled={isLoading || !sourceSchema.trim() || !targetSchema.trim()}
                    >
                        {isLoading ? 'Generating Mapping...' : 'AI-Generate Schema Mapping'}
                    </button>
                </>
            )}

            {activeTab === 'validator' && (
                <>
                    <p className="text-gray-400 text-sm">Validate your schemas for syntax, semantic consistency, and compatibility. Identify potential data loss or integrity issues before deployment.</p>
                    <button
                        onClick={handleValidateSchema}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Validating Schemas...' : 'AI-Validate Schemas'}
                    </button>
                </>
            )}

            {activeTab === 'discovery' && (
                <>
                    <p className="text-gray-400 text-sm">Automatically discover and catalog data schemas from connected systems, APIs, and data stores across your enterprise.</p>
                    <button
                        onClick={handleDiscoverSchemas}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Discovering Schemas...' : 'AI-Discover Ecosystem Schemas'}
                    </button>
                </>
            )}

            {mappingOutput && (
                <div className="mt-4">
                    <h4 className="font-semibold text-white mb-2">Generated Output:</h4>
                    <AIChatMessage role="model" text={mappingOutput} />
                </div>
            )}
            <p className="text-xs text-gray-500 mt-4">Schema Nexus leverages AI for semantic understanding of data fields, suggesting optimal transformations, flagging potential data loss risks, and maintaining a dynamic schema registry.</p>
        </div>
    );
};

export const LifecycleManagementPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [deployments, setDeployments] = useState([
        { id: 1, version: '1.0.0', stage: 'Production', status: 'Deployed', timestamp: '2023-10-26 10:00 AM', branch: 'main', commit: 'a1b2c3d4' },
        { id: 2, version: '1.0.1-beta', stage: 'Staging', status: 'In Progress', timestamp: '2023-10-26 02:30 PM', branch: 'feature/new-api', commit: 'e5f6g7h8' },
        { id: 3, version: '0.9.5', stage: 'Production', status: 'Rolled Back', timestamp: '2023-10-25 04:00 PM', branch: 'main', commit: 'f9h0j1k2' },
    ]);
    const [selectedDeployment, setSelectedDeployment] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'history' | 'pipelines' | 'environments'>('history');

    const handleRollback = (id: number) => {
        alert(`Initiating AI-assisted rollback for deployment ID ${id}. This would trigger a secure, validated CI/CD pipeline.`);
        setDeployments(prev => prev.map(d => d.id === id ? { ...d, status: 'Rollback Initiated (AI)', timestamp: new Date().toLocaleString() } : d));
    };

    const handlePromote = (id: number) => {
        alert(`Initiating AI-optimized promotion for deployment ID ${id} to next stage.`);
        setDeployments(prev => prev.map(d => d.id === id ? { ...d, status: 'Promoting (AI)', timestamp: new Date().toLocaleString() } : d));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Integration Lifecycle Manager for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Manage, deploy, and monitor versions of your integrations. Facilitate seamless CI/CD, version control, rollback, and environment management.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                <TabButton label="Deployment History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                <TabButton label="CI/CD Pipelines" isActive={activeTab === 'pipelines'} onClick={() => setActiveTab('pipelines')} />
                <TabButton label="Environments" isActive={activeTab === 'environments'} onClick={() => setActiveTab('environments')} />
            </div>

            {activeTab === 'history' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Deployment History & Status</h4>
                    <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Version</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stage</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {deployments.map(deployment => (
                                    <tr key={deployment.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{deployment.version}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deployment.stage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                deployment.status === 'Deployed' ? 'bg-green-100 text-green-800' :
                                                deployment.status.includes('Progress') || deployment.status.includes('Initiated') || deployment.status.includes('Promoting') ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>{deployment.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{deployment.timestamp}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {deployment.status === 'Deployed' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRollback(deployment.id)} className="text-indigo-400 hover:text-indigo-600">Rollback</button>
                                                    {deployment.stage !== 'Production' && <button onClick={() => handlePromote(deployment.id)} className="text-emerald-400 hover:text-emerald-600">Promote</button>}
                                                </div>
                                            )}
                                            {deployment.status.includes('Progress') || deployment.status.includes('Initiated') || deployment.status.includes('Promoting') && (
                                                <span className="text-gray-500">Working...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'pipelines' && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-white mb-2">Automated CI/CD Pipelines</h4>
                    <p className="text-gray-400 text-sm">Monitor and configure your Continuous Integration and Continuous Deployment pipelines. AI provides pipeline health predictions and optimization suggestions.</p>
                    <div className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-yellow-500">
                        <h5 className="font-semibold text-white">Pipeline: {moduleName} Integration Build & Deploy</h5>
                        <p className="text-sm text-gray-400">Last Run: 2 mins ago, Status: <span className="text-green-400">Success</span></p>
                        <ul className="list-disc list-inside text-sm text-gray-500 mt-2">
                            <li>Source Code Check (Gitlab): <span className="text-green-400">Passed</span></li>
                            <li>Static Code Analysis (SonarQube): <span className="text-green-400">Passed</span></li>
                            <li>Unit Tests (Jest/Pytest): <span className="text-green-400">Passed</span> (98% coverage)</li>
                            <li>Integration Tests (Postman/Playwright): <span className="text-green-400">Passed</span></li>
                            <li>Security Scan (OWASP ZAP): <span className="text-yellow-400">Warnings</span> (2 low-risk)</li>
                            <li>Deploy to Staging (Kubernetes): <span className="text-green-400">Completed</span></li>
                        </ul>
                        <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">View Logs & AI Analysis</button>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded">Trigger New Build</button>
                </div>
            )}

            {activeTab === 'environments' && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-white mb-2">Environment Management</h4>
                    <p className="text-gray-400 text-sm">Define and manage integration environments (Dev, QA, Staging, Production). AI ensures environment consistency and compliance.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-blue-400">
                            <h5 className="font-semibold text-white">Production Environment</h5>
                            <p className="text-sm text-gray-400">Status: Stable</p>
                            <p className="text-xs text-gray-500">Deployed Version: 1.0.0, 0.9.5 (Rolled Back)</p>
                            <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">View Live Metrics</button>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-yellow-400">
                            <h5 className="font-semibold text-white">Staging Environment</h5>
                            <p className="text-sm text-gray-400">Status: Testing</p>
                            <p className="text-xs text-gray-500">Deployed Version: 1.0.1-beta (In Progress)</p>
                            <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">Run Regression Tests</button>
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded">Provision New Environment</button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">Integrates with Git repositories (GitHub, GitLab, Bitbucket) and CI/CD platforms (Jenkins, GitHub Actions, CircleCI). Offers AI-driven canary deployments, blue/green strategies, and automated incident response for deployment failures.</p>
        </div>
    );
};

export const CommunityHubPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'marketplace' | 'forums' | 'expertSystem'>('marketplace');
    const [integrationsList, setIntegrationsList] = useState([
        { id: 1, name: 'Stripe Payment Gateway for E-commerce', author: 'Global Fintech Team', rating: 4.8, downloads: '1.2M', tags: ['payment', 'e-commerce', 'fintech'], preview: 'Seamlessly integrate Stripe for card processing...' },
        { id: 2, name: 'Salesforce CRM Lead Sync', author: 'CRM Solutions Inc.', rating: 4.5, downloads: '800K', tags: ['crm', 'sales', 'data-sync'], preview: 'Two-way synchronization of leads and contacts.' },
        { id: 3, name: 'Twilio SMS Notification Service', author: 'DevConnect Community', rating: 4.2, downloads: '550K', tags: ['messaging', 'notifications', 'twilio'], preview: 'Send SMS alerts for transactions, login attempts, etc.' },
        { id: 4, name: `Custom Loan Application Data Ingest for ${moduleName}`, author: 'Demo Bank Labs', rating: 5.0, downloads: '10K', tags: ['internal', 'loan', 'data-ingest'], preview: 'Optimized pipeline for ingesting loan application data.' },
        { id: 5, name: 'Blockchain KYC Verification Module', author: 'Web3 Innovators', rating: 4.9, downloads: '50K', tags: ['blockchain', 'kyc', 'compliance', 'web3'], preview: 'Leverages decentralized ledgers for identity verification.' },
    ]);
    const [forumPosts, setForumPosts] = useState([
        { id: 1, title: 'Best practices for secure webhook endpoints?', author: 'Security Guru', replies: 12, lastActivity: '2 hours ago', tags: ['security', 'webhooks'] },
        { id: 2, title: 'How to optimize large batch data transfers to S3?', author: 'Data Engineer Mike', replies: 7, lastActivity: '1 day ago', tags: ['performance', 'aws', 'data-transfer'] },
        { id: 3, title: `AI Composer for ${moduleName} module - tips & tricks`, author: 'AI Fanatic', replies: 25, lastActivity: 'Yesterday', tags: ['ai', 'composer', 'tips'] },
    ]);
    const [expertQuery, setExpertQuery] = useState('');
    const [expertResponse, setExpertResponse] = useState('');
    const [isQueryingExpert, setIsQueryingExpert] = useState(false);

    const filteredIntegrations = integrationsList.filter(integration =>
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        integration.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredForumPosts = forumPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExpertQuery = async () => {
        setIsQueryingExpert(true);
        setExpertResponse(`Consulting the AI Expert System for "${expertQuery}"...\n\nAnalyzing knowledge graph, community discussions, and official documentation...\n\n`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setExpertResponse(`**AI Expert System Response for: "${expertQuery}"**\n\nBased on your query, here's a synthesized answer drawing from collective expertise:\n\nIf you're asking about "${expertQuery}", here are some key considerations and resources:\n\n1.  **Best Practices:** [Link to Doc/Forum Post]\n2.  **Related Integrations:** [Link to Marketplace Item]\n3.  **AI Composer Template:** [Link to AI Composed Snippet]\n\n\`\`\`plaintext\n"AI suggests a multi-faceted approach, emphasizing modular design and leveraging existing patterns within the Codex. For specific code examples, refer to the AI Composer."\n\`\`\``);
        setIsQueryingExpert(false);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Community & Collaboration Hub for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Discover, share, and collaborate on integration patterns, code, and best practices. Access community forums and AI-powered expert insights.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                <TabButton label="Integration Marketplace" isActive={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
                <TabButton label="Developer Forums" isActive={activeTab === 'forums'} onClick={() => setActiveTab('forums')} />
                <TabButton label="AI Expert System" isActive={activeTab === 'expertSystem'} onClick={() => setActiveTab('expertSystem')} />
            </div>

            <input
                type="text"
                placeholder="Search across Marketplace & Forums..."
                className="w-full bg-gray-700/50 p-2 rounded text-sm text-white mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />

            {activeTab === 'marketplace' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Integration Marketplace ({filteredIntegrations.length} results)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredIntegrations.map(integration => (
                            <div key={integration.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors">
                                <h5 className="font-semibold text-white text-lg">{integration.name}</h5>
                                <p className="text-sm text-gray-400">{integration.preview}</p>
                                <p className="text-sm text-gray-500">by {integration.author}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <span className="mr-3">⭐ {integration.rating}</span>
                                    <span className="mr-3">⬇️ {integration.downloads}</span>
                                    {integration.tags.map(tag => (
                                        <span key={tag} className="bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-300 mr-1">{tag}</span>
                                    ))}
                                </div>
                                <button className="mt-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-sm text-white">View Details & Deploy</button>
                            </div>
                        ))}
                        {filteredIntegrations.length === 0 && <p className="col-span-2 text-center text-gray-500 italic">No integrations found matching your search.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'forums' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Developer Forums & Discussions ({filteredForumPosts.length} results)</h4>
                    <div className="space-y-3">
                        {filteredForumPosts.map(post => (
                            <div key={post.id} className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-indigo-500">
                                <h5 className="font-semibold text-white">{post.title}</h5>
                                <p className="text-sm text-gray-400">by {post.author} &bull; {post.replies} replies &bull; Last activity: {post.lastActivity}</p>
                                <div className="flex flex-wrap mt-1">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="bg-gray-700 px-2 py-0.5 rounded-full text-xs text-gray-300 mr-1 mb-1">{tag}</span>
                                    ))}
                                </div>
                                <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">Join Discussion</button>
                            </div>
                        ))}
                        {filteredForumPosts.length === 0 && <p className="text-center text-gray-500 italic">No forum posts found matching your search.</p>}
                    </div>
                </div>
            )}

            {activeTab === 'expertSystem' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">AI Expert System</h4>
                    <p className="text-gray-400 text-sm mb-3">Leverage the collective intelligence of thousands of integration experts, distilled and made accessible through advanced AI. Ask complex questions and receive synthesized, actionable advice.</p>
                    <textarea
                        className="w-full h-24 bg-gray-700/50 p-3 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                        placeholder="Ask the AI Expert System for advice (e.g., 'How do I handle eventual consistency in a multi-region payment integration?')..."
                        value={expertQuery}
                        onChange={e => setExpertQuery(e.target.value)}
                        disabled={isQueryingExpert}
                    ></textarea>
                    <button
                        onClick={handleExpertQuery}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mt-2"
                        disabled={isQueryingExpert || !expertQuery.trim()}
                    >
                        {isQueryingExpert ? 'Consulting Experts (AI)...' : 'Ask AI Expert'}
                    </button>
                    {expertResponse && (
                        <div className="mt-4">
                            <h5 className="font-semibold text-white mb-2">AI Expert Response:</h5>
                            <AIChatMessage role="model" text={expertResponse} />
                        </div>
                    )}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">The Community Hub is integrated with an AI-driven expert system to provide instant answers and suggest relevant resources from a vast knowledge graph encompassing internal documentation, public best practices, and community discussions.</p>
        </div>
    );
};

export const SecurityAuditorPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [scanResults, setScanResults] = useState<any[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [complianceReports, setComplianceReports] = useState([
        { id: 1, standard: 'PCI DSS 4.0', status: '85% Compliant', lastScan: '2023-10-25', details: ['Missing MFA on some APIs', 'Weak encryption found'] },
        { id: 2, standard: 'GDPR', status: '98% Compliant', lastScan: '2023-10-20', details: ['Minor data residency issues'] },
        { id: 3, standard: 'SOC 2 Type II', status: '92% Compliant', lastScan: '2023-09-30', details: ['Logging gaps in non-prod environments'] },
    ]);
    const [activeTab, setActiveTab] = useState<'scan' | 'compliance' | 'threatIntel'>('scan');

    const handleScan = async () => {
        setIsScanning(true);
        setScanResults([]);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setScanResults([
            { id: 1, type: 'Vulnerability', severity: 'High', description: 'Insecure API key handling in Payments module integration', file: 'src/integrations/paymentGateway.ts', line: 45, remediation: 'Use environment variables or a secret management service. AI can generate code for secure key rotation.' },
            { id: 2, type: 'Misconfiguration', severity: 'Medium', description: 'Outdated TLS version detected on webhook endpoint (TLS 1.1)', file: 'infra/webhook-config.yml', line: 12, remediation: 'Upgrade TLS to 1.3 for all critical endpoints. AI can suggest configuration changes.' },
            { id: 3, type: 'Best Practice', severity: 'Low', description: 'Lack of rate limiting on user profile update API', file: 'src/api/user.py', line: 100, remediation: 'Implement client-side and server-side rate limiting. AI can generate rate-limiting middleware.' },
            { id: 4, type: 'Data Exposure', severity: 'High', description: 'Unencrypted sensitive data found in logs for external integration calls', file: 'logs/payment-integration.log', line: 'N/A', remediation: 'Implement PII redaction/masking for logging. AI can generate log processing filters.' },
            { id: 5, type: 'Dependency Vulnerability', severity: 'Critical', description: 'CVE-2023-1234 in `axios` (old version) used by Auth integration', file: 'package.json', line: 'dependencies', remediation: 'Upgrade `axios` to latest patched version. AI can generate automated dependency update PR.' },
        ]);
        setIsScanning(false);
    };

    const handleAIFix = (result: any) => {
        alert(`AI is attempting to generate a fix for: ${result.description}. (Simulated)`);
        // In a real scenario, this would trigger an AI Composer task to generate a patch or configuration.
    };

    const threatIntelligenceData = `**AI-Powered Threat Intelligence Briefing:**\n\n*   **Emerging Threats:** Increase in supply chain attacks targeting npm/PyPI packages. AI recommends proactive dependency scanning and software bill of materials (SBOM) generation.\n*   **Module-Specific Risks for ${moduleName}:** Given its financial nature, ${moduleName} is a high-value target for phishing and payment fraud. AI detects unusual access patterns and behavioral anomalies indicative of account takeover attempts.\n*   **Automated Defense:** Our AI-driven WAF (Web Application Firewall) has blocked 1,200 suspicious requests in the last 24 hours targeting integration endpoints.\n\n*Recommendation: Review recent security alerts in the AIOps Insights panel for real-time threat detection.*\n`;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Security Auditor & Compliance for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Automated security scanning, vulnerability detection, compliance checks, and AI-driven threat intelligence for all integration code and configurations.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                <TabButton label="Security Scan" isActive={activeTab === 'scan'} onClick={() => setActiveTab('scan')} />
                <TabButton label="Compliance Dashboard" isActive={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} />
                <TabButton label="AI Threat Intelligence" isActive={activeTab === 'threatIntel'} onClick={() => setActiveTab('threatIntel')} />
            </div>

            {activeTab === 'scan' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Security Scan Results</h4>
                    <button
                        onClick={handleScan}
                        className="px-4 py-2 rounded text-sm font-medium bg-red-700 hover:bg-red-800 text-white mb-4 disabled:opacity-50"
                        disabled={isScanning}
                    >
                        {isScanning ? 'Scanning Integrations...' : 'Run Comprehensive Security Scan'}
                    </button>
                    {scanResults.length === 0 && !isScanning && (
                        <p className="text-gray-500 text-sm italic">No security scan results yet. Click "Run Comprehensive Security Scan" to analyze your integrations (Static Analysis, Dynamic Analysis, Dependency Scan).</p>
                    )}
                    {scanResults.map(result => (
                        <div key={result.id} className={`p-3 bg-gray-800/50 rounded-lg border-l-4 ${result.severity === 'Critical' ? 'border-purple-500' : result.severity === 'High' ? 'border-red-500' : result.severity === 'Medium' ? 'border-orange-500' : 'border-yellow-500'} mb-3`}>
                            <h5 className="font-semibold text-white">{result.type}: {result.description}</h5>
                            <p className="text-sm text-gray-400">Severity: {result.severity} | File: {result.file}{result.line !== 'N/A' ? `:${result.line}` : ''}</p>
                            <p className="text-sm text-gray-500 mt-1">Remediation: {result.remediation}</p>
                            <button onClick={() => handleAIFix(result)} className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">AI Suggest & Fix</button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'compliance' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Compliance Dashboard</h4>
                    <p className="text-gray-400 text-sm mb-3">Continuously monitor your integration landscape against industry regulations and internal security policies. AI provides real-time compliance posture.</p>
                    {complianceReports.map(report => (
                        <div key={report.id} className="p-3 bg-gray-800/50 rounded-lg border-l-4 border-green-500 mb-3">
                            <h5 className="font-semibold text-white">{report.standard}</h5>
                            <p className="text-sm text-gray-400">Status: {report.status} | Last Scan: {report.lastScan}</p>
                            <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
                                {report.details.map((detail, idx) => <li key={idx}>{detail}</li>)}
                            </ul>
                            <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">View Detailed Report & AI Recommendations</button>
                        </div>
                    ))}
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded mt-4">Generate New Compliance Report</button>
                </div>
            )}

            {activeTab === 'threatIntel' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">AI Threat Intelligence</h4>
                    <p className="text-gray-400 text-sm mb-3">Receive real-time, AI-curated threat intelligence relevant to your integration architecture, proactively identifying emerging risks and attack vectors.</p>
                    <AIChatMessage role="model" text={threatIntelligenceData} />
                    <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded mt-4">Request Customized Threat Briefing</button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">Integrated with AI-driven threat intelligence platforms, policy engines, and security information and event management (SIEM) systems to continuously monitor, enforce security standards, and automate remediation. AI can also generate verified code patches for identified vulnerabilities.</p>
        </div>
    );
};

export const PredictiveAnalyticsPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [activePrediction, setActivePrediction] = useState<'health' | 'usage' | 'costs' | 'performance' | 'complianceRisk'>('health');
    const [predictionData, setPredictionData] = useState<string>('Loading AI insights...');
    const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

    useEffect(() => {
        setIsLoadingPrediction(true);
        setPredictionData('Loading AI insights...');
        const timer = setTimeout(() => {
            if (activePrediction === 'health') {
                setPredictionData(`**Integration Health Prediction for ${moduleName}:**\n\nAI predicts a 98% uptime confidence for the next 30 days. \nPotential issues: A slight increase in latency (avg. 15ms) predicted for external payment gateway calls during peak hours (10 AM - 2 PM PST), likely due to upstream provider load. \n*Recommendation: Consider dynamic load balancing or caching strategies for critical payment paths.*`);
            } else if (activePrediction === 'usage') {
                setPredictionData(`**Usage Pattern Forecasting for ${moduleName}:**\n\nForecast indicates a 20% increase in API calls to credit agencies next quarter, driven by new marketing campaigns. \nSpecific spike expected in the 'Loan Application' module. \n*Recommendation: Review existing rate limits and consider scaling options for related services.*`);
            } else if (activePrediction === 'costs') {
                setPredictionData(`**Cost Optimization Insights for ${moduleName}:**\n\nAI identifies a potential 15% cost saving by optimizing data transfer protocols for large batch operations, reducing egress fees by ~\$500/month. \nAnother 5% saving possible by rightsizing certain integration microservices in off-peak hours. \n*Recommendation: Implement compressed data transfers and explore serverless compute for batch jobs.*`);
            } else if (activePrediction === 'performance') {
                setPredictionData(`**Performance Bottleneck Prediction for ${moduleName}:**\n\nAI predicts a high probability (75%) of performance degradation in the 'Customer_Create' integration flow if concurrent requests exceed 500/second. The bottleneck is identified in the legacy data enrichment service. \n*Recommendation: Implement async processing for enrichment or explore microservice re-architecture for this component.*`);
            } else if (activePrediction === 'complianceRisk') {
                setPredictionData(`**Compliance Risk Prediction for ${moduleName}:**\n\nPredicted compliance risk for GDPR is trending upwards (10% increase in 60 days) due to increasing data transfer volumes to non-EU regions without explicit consent logging. \n*Recommendation: Implement automated consent tracking for cross-border data flows and consult legal counsel on data residency policies.*`);
            }
            setIsLoadingPrediction(false);
        }, 1500);
        return () => { clearTimeout(timer); setIsLoadingPrediction(false); };
    }, [activePrediction, moduleName]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Predictive Analytics for {moduleName} Integrations</h3>
            <p className="text-gray-400 text-sm">Leverage AI to predict future integration health, usage patterns, potential costs, performance bottlenecks, and compliance risks. Receive proactive, actionable optimizations.</p>

            <div className="flex flex-wrap gap-2 p-1 bg-gray-800/50 rounded-lg w-full mb-4 overflow-x-auto custom-scrollbar">
                {['health', 'usage', 'costs', 'performance', 'complianceRisk'].map(t => (
                    <TabButton 
                        key={t} 
                        label={t.charAt(0).toUpperCase() + t.replace(/([A-Z])/g, ' $1').slice(1) + ' Predictions'} 
                        isActive={activePrediction === t} 
                        onClick={() => setActivePrediction(t as any)} 
                    />
                ))}
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">{activePrediction.charAt(0).toUpperCase() + activePrediction.replace(/([A-Z])/g, ' $1').slice(1)} Insights:</h4>
                {isLoadingPrediction ? (
                    <div className="flex justify-center items-center h-24 text-gray-400">Generating AI Prediction...</div>
                ) : (
                    <AIChatMessage role="model" text={predictionData} />
                )}
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded mt-4 disabled:opacity-50" disabled={isLoadingPrediction}>
                Generate Detailed Prediction Report
            </button>

            <p className="text-xs text-gray-500 mt-4">Utilizes deep learning models trained on historical performance, operational logs, global market trends, and regulatory changes to provide actionable foresight. This powers proactive auto-scaling, intelligent caching, and anomaly detection.</p>
        </div>
    );
};

export const AutonomousAgentPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [agents, setAgents] = useState([
        { id: 1, name: 'Data Synchronization Agent', status: 'Active', goal: 'Keep CRM and ERP data consistent in real-time', lastRun: '2 mins ago', health: 'Healthy' },
        { id: 2, name: 'Fraud Detection Agent', status: 'Active', goal: 'Monitor transactions for anomalies and alert security', lastRun: '10 seconds ago', health: 'Healthy' },
        { id: 3, name: 'Integration Health Remediation Agent', status: 'Idle', goal: 'Automatically diagnose and fix minor integration errors', lastRun: 'N/A', health: 'Healthy' },
        { id: 4, name: 'API Rate Limit Optimization Agent', status: 'Active', goal: 'Dynamically adjust external API call rates to avoid throttling', lastRun: '1 min ago', health: 'Warning' },
    ]);
    const [newTask, setNewTask] = useState('');
    const [agentName, setAgentName] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'logs'>('overview');

    const handleCreateAgent = () => {
        if (agentName.trim() && newTask.trim()) {
            setAgents(prev => [...prev, { id: prev.length + 1, name: agentName, status: 'Provisioning', goal: newTask, lastRun: 'N/A', health: 'Unknown' }]);
            setAgentName('');
            setNewTask('');
            setActiveTab('overview');
            alert(`Autonomous Agent '${agentName}' with goal '${newTask}' is being provisioned!`);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Autonomous Agents for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Deploy and manage AI-powered autonomous agents to self-manage, optimize, troubleshoot, and evolve your integration landscape.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                <TabButton label="Agent Overview" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                <TabButton label="Create New Agent" isActive={activeTab === 'create'} onClick={() => setActiveTab('create')} />
                <TabButton label="Agent Activity Logs" isActive={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
            </div>

            {activeTab === 'overview' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Deployed Agents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agents.map(agent => (
                            <div key={agent.id} className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-lime-500">
                                <h5 className="font-semibold text-white">{agent.name}</h5>
                                <p className="text-sm text-gray-400">Status: {agent.status} | Health: <span className={agent.health === 'Healthy' ? 'text-green-400' : 'text-yellow-400'}>{agent.health}</span></p>
                                <p className="text-xs text-gray-500">Goal: {agent.goal}</p>
                                <p className="text-xs text-gray-500">Last Activity: {agent.lastRun}</p>
                                <div className="mt-2 flex gap-2">
                                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white">Monitor</button>
                                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white">Stop</button>
                                    <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs text-white">Configure</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'create' && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Define & Provision New Autonomous Agent</h4>
                    <p className="text-gray-400 text-sm mb-3">Describe the agent's purpose in natural language. The AI will translate it into an executable integration automation strategy.</p>
                    <input
                        type="text"
                        placeholder="Agent Name (e.g., 'Data Reconciliation Bot')"
                        className="w-full bg-gray-700/50 p-2 rounded text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={agentName}
                        onChange={e => setAgentName(e.target.value)}
                    />
                    <textarea
                        className="w-full h-20 bg-gray-700/50 p-3 rounded text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                        placeholder="Define Agent's Goal/Task (e.g., 'Ensure all customer records in Salesforce are synced to internal CRM within 5 minutes of creation, resolving conflicts automatically.')"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                    ></textarea>
                    <button
                        onClick={handleCreateAgent}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        disabled={!agentName.trim() || !newTask.trim()}
                    >
                        AI-Provision Autonomous Agent
                    </button>
                </div>
            )}

            {activeTab === 'logs' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Agent Activity & Communication Logs</h4>
                    <p className="text-gray-400 text-sm mb-3">Monitor the real-time actions, decisions, and inter-agent communication of your autonomous integration fleet. AI provides summaries and anomaly detection.</p>
                    <div className="bg-black/50 p-4 rounded-lg h-64 overflow-y-auto custom-scrollbar text-xs text-gray-300">
                        <p>[2023-10-27 15:30:01] Data Synchronization Agent: Initiating sync cycle for CRM.</p>
                        <p>[2023-10-27 15:30:05] Fraud Detection Agent: Performing real-time transaction analysis on batch #12345.</p>
                        <p>[2023-10-27 15:30:10] Data Synchronization Agent: Conflict detected for 'John Doe' record. Attempting AI-assisted resolution.</p>
                        <p>[2023-10-27 15:30:12] Integration Health Remediation Agent: Alert: High latency detected in Payment Gateway. Preparing self-healing action.</p>
                        <p>[2023-10-27 15:30:15] Data Synchronization Agent: Conflict for 'John Doe' resolved. Merged changes. Logging details.</p>
                        <p>[2023-10-27 15:30:20] API Rate Limit Optimization Agent: External API rate limit nearing. Dynamically reducing call frequency by 15% to prevent throttling.</p>
                        <p className="text-gray-500 mt-4">...</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded mt-4">Request AI Log Summary</button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">Autonomous agents utilize a multi-modal AI architecture, capable of interpreting natural language goals, executing code, interacting with APIs, learning from observed behaviors, and collaborating with other agents to achieve complex integration objectives. They form a self-optimizing, self-healing integration ecosystem.</p>
        </div>
    );
};

export const GlobalOrchestratorPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [workflowDefinition, setWorkflowDefinition] = useState('graph LR\n    Start --> ValidateInput[Validate Input]\n    ValidateInput --> ProcessData(Process Data in Service A)\n    ProcessData -- Success --> CallAPI[Call External API (Service B)]\n    ProcessData -- Failure --> ErrorHandling[Log Error]\n    CallAPI --> StoreResult{Store Result?}\n    StoreResult -- Yes --> Database[Write to DB (Service C)]\n    StoreResult -- No --> Notification[Send Alert]\n    Database --> End\n    Notification --> End\n    ErrorHandling --> End');
    const [activeWorkflows, setActiveWorkflows] = useState([
        { id: 1, name: 'Customer Onboarding Workflow', status: 'Running', health: 'Healthy', lastRun: '5 mins ago', successfulRuns: 987, failedRuns: 3 },
        { id: 2, name: 'End-of-Month Reconciliation', status: 'Scheduled', health: 'Warning', lastRun: 'N/A', successfulRuns: 0, failedRuns: 0 },
        { id: 3, name: 'Cross-System Payment Transfer', status: 'Running', health: 'Degraded', lastRun: '30 seconds ago', successfulRuns: 5432, failedRuns: 12 },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'designer' | 'monitoring' | 'templates'>('designer');

    const handleDeployWorkflow = async () => {
        setIsLoading(true);
        alert('Deploying workflow: ' + workflowDefinition);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setActiveWorkflows(prev => [...prev, { id: prev.length + 1, name: `New Workflow (${new Date().toLocaleTimeString()})`, status: 'Deploying', health: 'Unknown', lastRun: 'Now', successfulRuns: 0, failedRuns: 0 }]);
        setIsLoading(false);
        setActiveTab('monitoring');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Global Integration Orchestrator for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Design, deploy, and monitor complex, multi-step, distributed integration workflows spanning internal microservices and external systems with advanced orchestration.</p>

            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto custom-scrollbar">
                <TabButton label="Workflow Designer" isActive={activeTab === 'designer'} onClick={() => setActiveTab('designer')} />
                <TabButton label="Live Monitoring" isActive={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} />
                <TabButton label="Workflow Templates" isActive={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
            </div>

            {activeTab === 'designer' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Workflow Designer (Mermaid Syntax)</h4>
                    <p className="text-gray-400 text-sm mb-3">Visually compose complex workflows. AI can assist in generating sub-flows, error handling, and parallel processing logic.</p>
                    <DiagramRenderer definition={workflowDefinition} type="mermaid" />
                    <textarea
                        className="w-full h-40 bg-gray-700/50 p-3 rounded text-sm text-white mt-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                        placeholder="Define your workflow using Mermaid syntax (e.g., graph TD A-->B)... or paste from AI Composer."
                        value={workflowDefinition}
                        onChange={e => setWorkflowDefinition(e.target.value)}
                        disabled={isLoading}
                    ></textarea>
                    <button
                        onClick={handleDeployWorkflow}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deploying Workflow...' : 'Deploy & Activate Workflow'}
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mt-2">
                        AI Optimize Workflow for Resilience
                    </button>
                </div>
            )}

            {activeTab === 'monitoring' && (
                <div>
                    <h4 className="font-semibold text-white mb-2">Active Workflows & Real-time Status</h4>
                    <p className="text-gray-400 text-sm mb-3">Monitor the execution of all active workflows, track their health, identify bottlenecks, and review logs.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeWorkflows.map(workflow => (
                            <div key={workflow.id} className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-blue-500">
                                <h5 className="font-semibold text-white">{workflow.name}</h5>
                                <p className="text-sm text-gray-400">Status: {workflow.status}</p>
                                <p className="text-xs text-gray-500">Health: <span className={workflow.health === 'Healthy' ? 'text-green-400' : workflow.health === 'Warning' ? 'text-yellow-400' : 'text-red-400'}>{workflow.health}</span></p>
                                <p className="text-xs text-gray-500">Last Run: {workflow.lastRun}</p>
                                <p className="text-xs text-gray-500">Runs: {workflow.successfulRuns} Success / {workflow.failedRuns} Failed</p>
                                <div className="mt-2 flex gap-2">
                                    <button className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs text-white">View Logs & Trace</button>
                                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white">Pause</button>
                                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white">Resume</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded mt-4">AI Forecast Workflow Failures</button>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-4">
                    <h4 className="font-semibold text-white mb-2">Pre-built Workflow Templates</h4>
                    <p className="text-gray-400 text-sm">Jumpstart your integration development with AI-curated workflow templates for common patterns and industry-specific use cases.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-emerald-500">
                            <h5 className="font-semibold text-white">Customer Sync (CRM-ERP)</h5>
                            <p className="text-sm text-gray-400">Template for two-way customer data synchronization.</p>
                            <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">Use Template</button>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-emerald-500">
                            <h5 className="font-semibold text-white">Payment Processing (Multi-Gateway)</h5>
                            <p className="text-sm text-gray-400">Workflow for routing payments through multiple providers based on rules.</p>
                            <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">Use Template</button>
                        </div>
                        <div className="p-4 bg-gray-800/50 rounded-lg border-l-4 border-emerald-500">
                            <h5 className="font-semibold text-white">Fraud Alert Escalation</h5>
                            <p className="text-sm text-gray-400">Automated workflow for escalating suspicious activities.</p>
                            <button className="mt-2 text-xs text-cyan-400 hover:text-cyan-300">Use Template</button>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-4">The orchestration engine supports dynamic scaling, fault tolerance, distributed transaction management (Sagas, Two-Phase Commit), and AI-driven workflow optimization, including automated self-healing, predictive routing, and resource allocation.</p>
        </div>
    );
};

export const EventSourcingPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [events, setEvents] = useState([
        { id: 1, type: 'CustomerCreated', aggregateId: 'cust-001', payload: { customerName: 'Alice', email: 'alice@example.com' }, timestamp: '2023-10-27 10:00:00' },
        { id: 2, type: 'AccountOpened', aggregateId: 'acc-001', payload: { customerId: 'cust-001', accountType: 'Savings' }, timestamp: '2023-10-27 10:00:05' },
        { id: 3, type: 'TransactionPosted', aggregateId: 'tx-001', payload: { accountId: 'acc-001', amount: 100, currency: 'USD' }, timestamp: '2023-10-27 10:01:10' },
    ]);
    const [eventDefinition, setEventDefinition] = useState('type CustomerCreatedEvent { customerId: string, customerName: string, email: string }');
    const [streamName, setStreamName] = useState('customer-events');
    const [isLoading, setIsLoading] = useState(false);

    const handlePublishEvent = async () => {
        setIsLoading(true);
        const newEvent = {
            id: events.length + 1,
            type: 'TransactionPosted',
            aggregateId: `tx-${Math.floor(Math.random() * 1000)}`,
            payload: { accountId: `acc-${Math.floor(Math.random() * 100)}`, amount: Math.floor(Math.random() * 1000), currency: 'USD' },
            timestamp: new Date().toLocaleString(),
        };
        setEvents(prev => [...prev, newEvent]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        alert('Simulated event published!');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Event Sourcing Hub for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Design, manage, and visualize event streams and aggregates. Implement robust event-driven architectures with AI-assisted event modeling and projection management.</p>

            <div>
                <h4 className="font-semibold text-white mb-2">Event Streams & Recent Events ({streamName})</h4>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        placeholder="Event Stream Name (e.g., customer-events)"
                        className="flex-grow bg-gray-700/50 p-2 rounded text-sm text-white"
                        value={streamName}
                        onChange={e => setStreamName(e.target.value)}
                    />
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded">Load Stream</button>
                </div>
                <div className="bg-black/50 p-4 rounded-lg h-64 overflow-y-auto custom-scrollbar text-xs text-gray-300 space-y-2">
                    {events.map(event => (
                        <div key={event.id} className="border-b border-gray-700 pb-1 last:border-b-0">
                            <span className="text-cyan-400">{event.type}</span> (ID: {event.aggregateId}) - {event.timestamp}
                            <pre className="ml-4 text-gray-400">Payload: {JSON.stringify(event.payload, null, 2)}</pre>
                        </div>
                    ))}
                    {events.length === 0 && <p className="text-gray-500 italic">No events in this stream. Publish one!</p>}
                </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Event Definition & Publishing</h4>
                <p className="text-gray-400 text-sm mb-3">Define event schemas and simulate publishing events to the stream. AI assists with schema evolution.</p>
                <textarea
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-sm text-white mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                    placeholder="Define event schema (e.g., JSON Schema, Avro IDL)..."
                    value={eventDefinition}
                    onChange={e => setEventDefinition(e.target.value)}
                ></textarea>
                <button
                    onClick={handlePublishEvent}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? 'Publishing Event...' : 'Publish Simulated Event'}
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">The Event Sourcing Hub provides tools for event schema registry, automated projection generation (CQRS), and AI-driven anomaly detection on event streams for fraud and operational issues.</p>
        </div>
    );
};

export const RealtimeDebuggerPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [debugSessionId, setDebugSessionId] = useState('');
    const [debugOutput, setDebugOutput] = useState<string[]>([]);
    const [isDebugging, setIsDebugging] = useState(false);
    const [breakpoint, setBreakpoint] = useState('src/service.ts:120');

    const handleStartDebug = async () => {
        setIsDebugging(true);
        setDebugOutput(['Establishing secure connection to remote debug agent...', 'Attaching to integration process...', `Breakpoint set at ${breakpoint}. Waiting for hit...`]);
        setDebugSessionId(`debug-${Date.now()}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        setDebugOutput(prev => [...prev, '[Breakpoint Hit] at CustomerService.processRequest()', 'Variables: { customerId: "cust_123", status: "pending" }', 'Stack Trace: ...', 'Next line: call external API']);
        setIsDebugging(false);
        alert('Simulated breakpoint hit!');
    };

    const handleStopDebug = () => {
        setIsDebugging(false);
        setDebugSessionId('');
        setDebugOutput(prev => [...prev, 'Debug session ended.']);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">Real-time Integration Debugger for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Perform live debugging of integration code in development, staging, or even production environments (with safeguards). Set breakpoints, inspect variables, and trace execution paths across distributed systems.</p>

            <div>
                <h4 className="font-semibold text-white mb-2">Debug Session Controls</h4>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        placeholder="Breakpoint (e.g., src/file.ts:120)"
                        className="flex-grow bg-gray-700/50 p-2 rounded text-sm text-white"
                        value={breakpoint}
                        onChange={e => setBreakpoint(e.target.value)}
                        disabled={isDebugging}
                    />
                    <button
                        onClick={handleStartDebug}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded disabled:opacity-50"
                        disabled={isDebugging || !breakpoint.trim()}
                    >
                        {isDebugging ? 'Debugging...' : 'Start Debug Session'}
                    </button>
                    <button
                        onClick={handleStopDebug}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded disabled:opacity-50"
                        disabled={!isDebugging}
                    >
                        Stop Debug
                    </button>
                </div>
                {debugSessionId && <p className="text-sm text-gray-500">Active Session ID: <span className="font-mono">{debugSessionId}</span></p>}
            </div>

            <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Debug Console Output</h4>
                <div className="bg-black/50 p-4 rounded-lg h-64 overflow-y-auto custom-scrollbar text-xs text-gray-300 font-mono">
                    {debugOutput.length === 0 && <p className="text-gray-500 italic">No debug output yet. Start a session.</p>}
                    {debugOutput.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">The Real-time Debugger uses distributed tracing, AI-assisted log analysis, and secure runtime instrumentation to provide deep visibility into complex integration failures. It supports multiple languages and runtime environments, offering intelligent suggestions for fixing errors.</p>
        </div>
    );
};

export const AIOpsInsightsPanel: React.FC<{ moduleName: string }> = ({ moduleName }) => {
    const [incidents, setIncidents] = useState([
        { id: 1, title: 'External Payment Gateway Unavailable', status: 'Resolved (AI)', severity: 'High', detected: '2023-10-27 14:05', duration: '15 min', rootCause: 'Upstream provider outage', aiAction: 'Auto-rerouted payments' },
        { id: 2, title: 'CRM Data Sync Latency Spike', status: 'Investigating', severity: 'Medium', detected: '2023-10-27 15:10', duration: '25 min', rootCause: 'Increased data volume', aiAction: 'Scaled data processing nodes' },
        { id: 3, title: 'Authentication Service Errors', status: 'New', severity: 'Critical', detected: '2023-10-27 16:00', duration: '5 min', rootCause: 'Unknown', aiAction: 'Alerted human operator, initiated diagnostic run' },
    ]);
    const [aiRecommendations, setAiRecommendations] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        setAiRecommendations('Generating AI operational insights...');
        const timer = setTimeout(() => {
            setAiRecommendations(`**AI Operational Insights for ${moduleName} Integrations:**\n\n*   **Incident Summary:** AI successfully detected and auto-remediated 60% of critical incidents in the last 24 hours. The remaining 40% required human intervention but benefited from AI-driven diagnostics.\n*   **Root Cause Analysis (AI):** The recent Authentication Service Errors point to a possible misconfiguration in the new JWT token validation module. AI has identified a similar pattern in pre-production tests.\n*   **Proactive Mitigation:** AI suggests implementing a circuit breaker pattern for external API calls that show intermittent failure patterns, preventing cascading failures.\n*   **Resource Optimization:** AI identified idle resources in the data processing cluster during off-peak hours, recommending dynamic scaling down by 30% to save costs.\n\n\`\`\`mermaid\ngraph TD\n    A[Monitoring Alerts] --> B{AI Triage}\n    B -- Auto-Remediate --> C[Self-Healing System]\n    B -- Human Intervention --> D[Incident Response Team]\n    C --> E[Resolution]\n    D --> E\n\`\`\`\n\n*Next Steps: Review critical incidents and leverage AI Composer to implement suggested fixes.*`);
            setIsLoading(false);
        }, 2500);
        return () => { clearTimeout(timer); setIsLoading(false); };
    }, [moduleName]);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white">AIOps Insights for {moduleName}</h3>
            <p className="text-gray-400 text-sm">Unify monitoring, logging, and tracing data with advanced AI to detect anomalies, predict incidents, automate root cause analysis, and enable self-healing integration operations.</p>