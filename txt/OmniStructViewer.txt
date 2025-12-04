// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { OmniStruct } from '../../../types';
import { executeReference } from '../../../services/omniStructService';
import { downloadFile } from '../../../services/fileUtils';
import Editor from '@monaco-editor/react';
import { HomeIcon, ArrowDownTrayIcon } from '../../icons';
import { LoadingSpinner } from '../../shared';
// New icons for history navigation, copy, and browsing references
import { ChevronLeftIcon, ChevronRightIcon, DocumentDuplicateIcon, ListBulletIcon } from '../../icons';

/**
 * Utility function to extract potential callable references from an OmniStruct.
 * It uses a heuristic based on common OmniStruct patterns (e.g., Module:Function).
 *
 * @param omniStruct The OmniStruct object to parse.
 * @returns An array of strings representing callable references.
 */
export function extractCallableReferences(omniStruct: OmniStruct): string[] {
    const references: string[] = [];

    if (typeof omniStruct !== 'object' || omniStruct === null) {
        return references;
    }

    // Heuristic: iterate over top-level keys as potential module names
    for (const moduleName in omniStruct) {
        if (Object.prototype.hasOwnProperty.call(omniStruct, moduleName)) {
            const moduleContent = omniStruct[moduleName];

            // If moduleContent is an object, its keys might be function names
            // Exclude common non-function metadata keys or arrays
            if (typeof moduleContent === 'object' && moduleContent !== null && !Array.isArray(moduleContent)) {
                // Heuristic: Further filter out keys that likely aren't function names
                // This list can be expanded based on common OmniStruct patterns
                const excludedKeys = ['metadata', 'description', '$schema', '_internal', 'config', 'id', 'type'];
                const potentialFunctionNames = Object.keys(moduleContent).filter(key =>
                    !excludedKeys.includes(key.toLowerCase())
                );

                for (const functionName of potentialFunctionNames) {
                    // Only add if the functionName actually corresponds to an object or a non-primitive value
                    // that might represent a callable definition. A string could be a reference to another part.
                    const potentialFunctionDefinition = moduleContent[functionName];
                    if (typeof potentialFunctionDefinition === 'object' && potentialFunctionDefinition !== null) {
                        references.push(`${moduleName}:${functionName}`);
                    }
                }
            }
        }
    }
    // Sort for better presentation
    return references.sort();
}

/**
 * Props for the OmniStructReferenceBrowser component.
 */
export interface OmniStructReferenceBrowserProps {
    omniStruct: OmniStruct;
    onSelectReference: (ref: string) => void;
    onClose: () => void;
}

/**
 * A modal component to browse and select callable references within the OmniStruct.
 * It uses the `extractCallableReferences` utility to populate the list.
 */
export const OmniStructReferenceBrowser: React.FC<OmniStructReferenceBrowserProps> = ({ omniStruct, onSelectReference, onClose }) => {
    const availableReferences = useMemo(() => extractCallableReferences(omniStruct), [omniStruct]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredReferences = useMemo(() => {
        if (!searchTerm) return availableReferences;
        return availableReferences.filter(ref =>
            ref.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [availableReferences, searchTerm]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
            <div className="bg-surface p-6 rounded-lg shadow-xl w-11/12 max-w-lg max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Browse References</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-light leading-none transition-colors duration-200">&times;</button>
                </div>
                <input
                    type="text"
                    placeholder="Search references..."
                    className="w-full p-2 bg-background border border-border rounded-md mb-4 font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search references"
                />
                <div className="flex-grow overflow-y-auto border border-border rounded-md p-2 mb-4 bg-background custom-scrollbar">
                    {filteredReferences.length === 0 ? (
                        <p className="text-text-secondary text-sm text-center py-4">No references found or matching your search.</p>
                    ) : (
                        <ul className="space-y-1">
                            {filteredReferences.map((refItem) => (
                                <li key={refItem}>
                                    <button
                                        onClick={() => { onSelectReference(refItem); onClose(); }}
                                        className="w-full text-left p-2 hover:bg-gray-700 rounded-md text-sm font-mono transition-colors duration-200"
                                        aria-label={`Select reference ${refItem}`}
                                    >
                                        {refItem}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button onClick={onClose} className="btn-secondary w-full py-2">Close</button>
            </div>
        </div>
    );
};


interface OmniStructViewerProps {
    initialOmniStruct: OmniStruct;
    onNewOmniStruct: () => void;
}

const OmniStructViewer: React.FC<OmniStructViewerProps> = ({ initialOmniStruct, onNewOmniStruct }) => {
    // History management states
    const [omniStructHistory, setOmniStructHistory] = useState<OmniStruct[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

    // Existing states
    const [ref, setRef] = useState('Plan:getPlanDetails');
    const [args, setArgs] = useState('{}');
    const [result, setResult] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showReferenceBrowser, setShowReferenceBrowser] = useState(false);
    const [lastActionStatus, setLastActionStatus] = useState<'success' | 'error' | null>(null);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    // Initialize history with initialOmniStruct and reset view states
    useEffect(() => {
        setOmniStructHistory([initialOmniStruct]);
        setCurrentHistoryIndex(0);
        setRef('Plan:getPlanDetails'); // Reset reference to a sensible default or first available
        setArgs('{}'); // Reset args
        setResult(null); // Clear previous result
        setLastActionStatus(null);
        setActionMessage(null);
    }, [initialOmniStruct]);

    // Derive the currently viewed OmniStruct from history
    const currentOmniStruct = useMemo(() => omniStructHistory[currentHistoryIndex], [omniStructHistory, currentHistoryIndex]);

    /**
     * Handles the execution of a function reference against the current OmniStruct.
     * Manages loading state, result, and updates the OmniStruct history.
     */
    const handleRun = useCallback(() => {
        setIsLoading(true);
        setResult(null);
        setLastActionStatus(null);
        setActionMessage(null);

        try {
            const parsedArgs = args.trim() ? JSON.parse(args) : {};
            const { newOmniStruct, result: executionResult } = executeReference(currentOmniStruct, ref, parsedArgs);

            // Update history: truncate if not at the latest, then append new state
            setOmniStructHistory(prevHistory => {
                const newHistory = prevHistory.slice(0, currentHistoryIndex + 1);
                return [...newHistory, newOmniStruct];
            });
            setCurrentHistoryIndex(prevIndex => prevIndex + 1);
            setResult(executionResult);
            setLastActionStatus('success');
            setActionMessage('Function executed successfully!');
        } catch (e) {
            const errorMessage = (e as Error).message;
            setResult({ error: `Execution failed: ${errorMessage}` });
            setLastActionStatus('error');
            setActionMessage(`Execution failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [currentOmniStruct, ref, args, currentHistoryIndex]);

    /**
     * Handles downloading the current state of the OmniStruct.
     */
    const handleDownload = useCallback(() => {
        try {
            const omniJson = JSON.stringify(currentOmniStruct, null, 2);
            downloadFile(omniJson, `omnistruct_v${currentHistoryIndex + 1}.omni`, 'application/json');
            setLastActionStatus('success');
            setActionMessage(`OmniStruct v.${currentHistoryIndex + 1} downloaded successfully!`);
        } catch (error) {
            setLastActionStatus('error');
            setActionMessage(`Failed to download OmniStruct: ${(error as Error).message}`);
        }
    }, [currentOmniStruct, currentHistoryIndex]);

    /**
     * Navigates back in the OmniStruct history.
     */
    const handleUndo = useCallback(() => {
        if (currentHistoryIndex > 0) {
            setCurrentHistoryIndex(prevIndex => prevIndex - 1);
            setResult(null); // Clear result when navigating history
            setLastActionStatus(null);
            setActionMessage(null);
        }
    }, [currentHistoryIndex]);

    /**
     * Navigates forward in the OmniStruct history.
     */
    const handleRedo = useCallback(() => {
        if (currentHistoryIndex < omniStructHistory.length - 1) {
            setCurrentHistoryIndex(prevIndex => prevIndex + 1);
            setResult(null); // Clear result when navigating history
            setLastActionStatus(null);
            setActionMessage(null);
        }
    }, [currentHistoryIndex, omniStructHistory.length]);

    const canUndo = currentHistoryIndex > 0;
    const canRedo = currentHistoryIndex < omniStructHistory.length - 1;

    /**
     * Copies the execution result to the clipboard.
     */
    const handleCopyResult = useCallback(() => {
        if (result) {
            try {
                navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                setLastActionStatus('success');
                setActionMessage('Result copied to clipboard!');
            } catch (error) {
                setLastActionStatus('error');
                setActionMessage(`Failed to copy result: ${(error as Error).message}`);
            }
        }
    }, [result]);

    /**
     * Callback for when a reference is selected from the browser.
     * Also provides basic argument template suggestions.
     */
    const handleSelectReference = useCallback((selectedRef: string) => {
        setRef(selectedRef);
        // Basic argument template suggestion based on common function name patterns
        const functionName = selectedRef.split(':').pop()?.toLowerCase();
        if (functionName?.includes('get') || functionName?.includes('fetch')) {
            setArgs(JSON.stringify({ id: "exampleId" }, null, 2));
        } else if (functionName?.includes('create') || functionName?.includes('update') || functionName?.includes('set')) {
            setArgs(JSON.stringify({ payload: { /* your data here */ } }, null, 2));
        } else if (functionName?.includes('delete')) {
            setArgs(JSON.stringify({ id: "exampleId" }, null, 2));
        }
        else {
            setArgs('{}');
        }
    }, []);

    /**
     * Memoized value for the result editor, handling loading and error states.
     */
    const resultEditorValue = useMemo(() => {
        if (isLoading) return '// Executing... Please wait.';
        if (result === null) return '// Execution result will appear here.';
        if (typeof result === 'object' && result !== null && 'error' in result) {
            // Highlight errors explicitly
            return JSON.stringify(result, null, 2);
        }
        return JSON.stringify(result, null, 2);
    }, [result, isLoading]);

    // Helper to determine status banner styling
    const getStatusBannerClasses = useMemo(() => {
        if (!lastActionStatus) return "hidden";
        const base = "absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow-lg text-sm transition-all duration-300 z-50";
        if (lastActionStatus === 'success') return `${base} bg-green-500 text-white`;
        if (lastActionStatus === 'error') return `${base} bg-red-600 text-white`;
        return "hidden";
    }, [lastActionStatus]);

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 relative">
            {/* Action Status Banner */}
            {actionMessage && (
                <div className={getStatusBannerClasses} role="alert">
                    {actionMessage}
                </div>
            )}

            {/* Left Column: OmniStruct JSON and Actions */}
            <div className="flex flex-col h-full bg-surface p-4 rounded-lg border border-border shadow-md">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">OmniStruct Generated <span className="text-sm font-normal text-text-secondary">(v.{currentHistoryIndex + 1} of {omniStructHistory.length})</span></h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onNewOmniStruct}
                            className="btn-icon bg-gray-100 hover:bg-gray-200 text-xs rounded-md px-3 py-1 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                            title="Go back to OmniStruct creation"
                        >
                            <HomeIcon className="w-4 h-4" /> Go Home
                        </button>
                        <button
                            onClick={handleDownload}
                            className="btn-icon bg-gray-100 hover:bg-gray-200 text-xs rounded-md px-3 py-1 flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                            title={`Download current OmniStruct (v.${currentHistoryIndex + 1})`}
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" /> Download .omni
                        </button>
                    </div>
                </div>
                {/* History Navigation */}
                <div className="flex justify-center items-center gap-2 mb-2 flex-shrink-0">
                    <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`btn-icon p-1 rounded-md transition-colors duration-200 ${canUndo ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        title="Undo last OmniStruct change"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-text-secondary select-none">Version {currentHistoryIndex + 1} / {omniStructHistory.length}</span>
                    <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`btn-icon p-1 rounded-md transition-colors duration-200 ${canRedo ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        title="Redo next OmniStruct change"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow min-h-0 border border-border rounded-md overflow-hidden shadow-inner bg-background">
                    <Editor
                        height="100%"
                        language="json"
                        value={JSON.stringify(currentOmniStruct, null, 2)}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollbar: { vertical: 'auto', horizontal: 'auto' },
                            fontSize: 14,
                            lineNumbersMinChars: 3,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            folding: true,
                            // theme: 'vs-dark' // Already set by default if not overridden by the prop
                        }}
                        theme="vs-dark"
                    />
                </div>
            </div>

            {/* Right Column: Function Runner and Results */}
            <div className="flex flex-col h-full space-y-4">
                <div className="flex flex-col bg-surface p-4 rounded-lg border border-border shadow-md">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-text-primary">Execute a Function</h2>
                        <button
                            onClick={() => setShowReferenceBrowser(true)}
                            className="btn-secondary px-3 py-1 text-sm flex items-center gap-2 transition-colors duration-200"
                            title="Browse available function references in the OmniStruct"
                        >
                            <ListBulletIcon className="w-4 h-4" /> Browse References
                        </button>
                    </div>

                    {/* Function Reference */}
                    <div className="mb-2">
                        <label htmlFor="ref-input" className="block text-sm font-medium text-text-secondary mb-1">Function Reference:</label>
                        <input
                            id="ref-input"
                            type="text"
                            value={ref}
                            onChange={e => setRef(e.target.value)}
                            placeholder="e.g., Module:functionName"
                            className="w-full p-2 bg-background border border-border rounded-md font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                            aria-label="Function reference input"
                        />
                    </div>

                    {/* Arguments Editor */}
                    <div className="flex-grow flex flex-col mb-4">
                        <label htmlFor="args-editor" className="block text-sm font-medium text-text-secondary mb-1">Arguments (JSON):</label>
                        <div id="args-editor" className="h-40 border border-border rounded-md overflow-hidden shadow-inner bg-background">
                             <Editor
                                height="100%"
                                language="json"
                                value={args}
                                onChange={(value) => setArgs(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    folding: true,
                                }}
                                theme="vs-dark"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleRun}
                        disabled={isLoading}
                        className="btn-primary w-full py-2 flex items-center justify-center gap-2 transition-colors duration-200"
                        title="Run the selected function with provided arguments"
                    >
                        {isLoading ? <><LoadingSpinner className="w-5 h-5" /> Running...</> : 'Run Function'}
                    </button>
                </div>

                {/* Execution Result */}
                <div className="flex-grow flex flex-col bg-surface p-4 rounded-lg border border-border shadow-md">
                    <div className="flex justify-between items-center mb-2 flex-shrink-0">
                        <h2 className="text-xl font-bold text-text-primary">Execution Result</h2>
                        <button
                            onClick={handleCopyResult}
                            disabled={!result || isLoading} // Disable copy if no result or still loading
                            className={`btn-icon bg-gray-100 hover:bg-gray-200 text-xs rounded-md px-3 py-1 flex items-center gap-2 transition-colors duration-200 ${(!result || isLoading) ? 'opacity-50 cursor-not-allowed' : 'text-text-secondary hover:text-text-primary'}`}
                            title="Copy the execution result to clipboard"
                        >
                            <DocumentDuplicateIcon className="w-4 h-4" /> Copy Result
                        </button>
                    </div>
                    <div className="flex-grow min-h-0 bg-background border border-border rounded-md overflow-hidden shadow-inner">
                        <Editor
                            height="100%"
                            language="json"
                            value={resultEditorValue}
                            options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollbar: { vertical: 'auto', horizontal: 'auto' },
                                fontSize: 14,
                                lineNumbersMinChars: 3,
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                folding: true,
                            }}
                            theme="vs-dark"
                        />
                    </div>
                </div>
            </div>
            {showReferenceBrowser && (
                <OmniStructReferenceBrowser
                    omniStruct={currentOmniStruct}
                    onSelectReference={handleSelectReference}
                    onClose={() => setShowReferenceBrowser(false)}
                />
            )}
        </div>
    );
};

export default OmniStructViewer;