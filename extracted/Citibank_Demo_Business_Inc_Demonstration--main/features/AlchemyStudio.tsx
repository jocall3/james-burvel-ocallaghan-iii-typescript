// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Alchemist } from './alchemist/compiler';
import { SparklesIcon } from '../components/icons';
import { LoadingSpinner } from '../components/shared';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import initialTsalCode from './example.tsal.txt?raw';

// --- New Interfaces and Types ---

/**
 * Represents metadata about a WebAssembly module's exports.
 * @property {string} name - The name of the exported function or global.
 * @property {string} type - The type of the export (e.g., "function", "global", "memory", "table").
 * @property {string} signature - For functions, a string representation of its parameters and return type (e.g., "i32,i32 -> i32").
 * @property {string[]} [parameters] - For functions, an array of parameter types (e.g., ["i32", "i32"]).
 * @property {string | null} [returnType] - For functions, the return type, or null if void (e.g., "i32").
 */
export interface WasmExport {
    name: string;
    type: 'function' | 'global' | 'memory' | 'table';
    signature: string; // e.g., "i32,i32 -> i32"
    parameters?: string[]; // e.g., ["i32", "i32"]
    returnType?: string | null; // e.g., "i32"
}

/**
 * Represents metadata about a WebAssembly module's imports.
 * @property {string} module - The module name from which the import originates.
 * @property {string} name - The name of the imported item.
 * @property {string} type - The type of the import (e.g., "function", "global", "memory", "table").
 * @property {string} [signature] - For functions, a string representation of its parameters and return type.
 */
export interface WasmImport {
    module: string;
    name: string;
    type: 'function' | 'global' | 'memory' | 'table';
    signature?: string;
}

/**
 * Represents WebAssembly memory information.
 * @property {number} initial - Initial size of memory in pages (64KB each).
 * @property {number} [maximum] - Maximum size of memory in pages.
 */
export interface WasmMemoryInfo {
    initial: number;
    maximum?: number;
}

/**
 * Full metadata for a compiled WebAssembly module.
 * @property {WasmExport[]} exports - List of exported items.
 * @property {WasmImport[]} imports - List of imported items.
 * @property {WasmMemoryInfo | null} memory - Information about the module's memory, if any.
 */
export interface WasmModuleMetadata {
    exports: WasmExport[];
    imports: WasmImport[];
    memory: WasmMemoryInfo | null;
}

/**
 * Represents a compiler error or warning with optional location details.
 * @property {string} message - The error message.
 * @property {number} [line] - The line number where the error occurred.
 * @property {number} [column] - The column number where the error occurred.
 * @property {'error' | 'warning' | 'info'} [severity] - The severity level of the issue.
 */
export interface CompilerIssue {
    message: string;
    line?: number;
    column?: number;
    severity?: 'error' | 'warning' | 'info';
}

/**
 * Represents a predefined TSAL code example.
 * @property {string} name - Display name of the example.
 * @property {string} code - The TSAL source code for the example.
 * @property {string} [entryFunction] - Optional default function to invoke for this example.
 * @property {string} [defaultArgs] - Optional default arguments for the entry function.
 */
export interface TSALExample {
    name: string;
    code: string;
    entryFunction?: string;
    defaultArgs?: string;
}

// --- Internal Helper Components (not exported, scoped to this file) ---

/**
 * A generic resizable panel group container. Manages the layout and resizing of its children.
 * This is a simplified implementation for demonstration within a single file.
 */
const ResizablePanelGroup: React.FC<React.PropsWithChildren<{ direction: 'horizontal' | 'vertical' }>> = ({ direction, children }) => {
    const groupRef = useRef<HTMLDivElement>(null);
    const [sizes, setSizes] = useState<number[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const childrenArray = React.Children.toArray(children);

    useEffect(() => {
        // Initialize sizes based on children that are ResizablePanel
        const initialPanels = childrenArray.filter(child => React.isValidElement(child) && (child.type as any).__isResizablePanel);
        const initialSizes = initialPanels.map((child: any) => child.props.defaultSize || (100 / initialPanels.length));
        setSizes(initialSizes.length > 0 ? initialSizes : [100]);
    }, [childrenArray]);

    const startDragging = useCallback((e: React.MouseEvent, handleIndex: number) => {
        e.preventDefault(); // Prevent text selection during drag
        setIsDragging(true);
        const startPos = direction === 'horizontal' ? e.clientX : e.clientY;
        const initialSizes = [...sizes];

        const onMouseMove = (moveEvent: MouseEvent) => {
            if (!groupRef.current) return;
            const currentPos = direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
            const delta = currentPos - startPos;
            const totalSize = direction === 'horizontal' ? groupRef.current.offsetWidth : groupRef.current.offsetHeight;

            if (handleIndex < initialSizes.length - 1) {
                const newSize1 = initialSizes[handleIndex] + (delta / totalSize) * 100;
                const newSize2 = initialSizes[handleIndex + 1] - (delta / totalSize) * 100;

                const panel1 = childrenArray.filter(child => React.isValidElement(child) && (child.type as any).__isResizablePanel)[handleIndex] as React.ReactElement<ResizablePanelProps>;
                const panel2 = childrenArray.filter(child => React.isValidElement(child) && (child.type as any).__isResizablePanel)[handleIndex + 1] as React.ReactElement<ResizablePanelProps>;

                const minSize1 = panel1.props.minSize || 5; // Default min size
                const minSize2 = panel2.props.minSize || 5;

                if (newSize1 > minSize1 && newSize2 > minSize2) {
                    const newSizes = [...sizes];
                    newSizes[handleIndex] = newSize1;
                    newSizes[handleIndex + 1] = newSize2;
                    setSizes(newSizes);
                }
            }
        };

        const onMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [direction, sizes, childrenArray]);

    const panelElements = childrenArray.filter(child => React.isValidElement(child) && (child.type as any).__isResizablePanel);
    const handleElements = childrenArray.filter(child => React.isValidElement(child) && (child.type as any).__isResizableHandle);

    return (
        <div
            ref={groupRef}
            className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} w-full h-full`}
            style={{ cursor: isDragging ? (direction === 'horizontal' ? 'ew-resize' : 'ns-resize') : 'default' }}
        >
            {panelElements.map((panel, i) => (
                <React.Fragment key={i}>
                    {React.cloneElement(panel as React.ReactElement, {
                        style: {
                            flexBasis: `${sizes[i] || 0}%`,
                            flexGrow: 0,
                            flexShrink: 0,
                            overflow: 'hidden', // Ensure content doesn't overflow during resize
                            ...(panel as React.ReactElement).props.style
                        }
                    })}
                    {i < panelElements.length - 1 && (
                        React.cloneElement(handleElements[i] || <ResizableHandle />, { // Use a default handle if not explicitly provided
                            onMouseDown: (e: React.MouseEvent) => startDragging(e, i),
                            style: {
                                cursor: direction === 'horizontal' ? 'ew-resize' : 'ns-resize',
                                ...(handleElements[i] as React.ReactElement)?.props?.style
                            }
                        })
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

interface ResizablePanelProps extends React.PropsWithChildren {
    defaultSize?: number; // percentage
    minSize?: number; // percentage
    style?: React.CSSProperties;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({ children, style }) => {
    return (
        <div style={style}>
            {children}
        </div>
    );
};
// Mark this component for identification in ResizablePanelGroup
(ResizablePanel as any).__isResizablePanel = true;


interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
    style?: React.CSSProperties;
}

const ResizableHandle: React.FC<ResizableHandleProps> = ({ style, ...props }) => {
    return (
        <div
            className="bg-border-light hover:bg-border transition-colors duration-100 ease-in-out z-10"
            style={{
                width: '6px', // Default for horizontal groups, will be overridden by height for vertical
                height: '6px',
                minWidth: '6px',
                minHeight: '6px',
                ...(style || {})
            }}
            {...props}
        />
    );
};
// Mark this component for identification in ResizablePanelGroup
(ResizableHandle as any).__isResizableHandle = true;

// --- Mock Compiler/Alchemist Enhancements (for demonstration purposes) ---
// In a real scenario, these would come from the actual Alchemist implementation.
// We assume Alchemist is extended to return more detailed information.

declare module './alchemist/compiler' {
    interface Alchemist {
        // Assume compile method now returns more detailed information
        compile(tsalCode: string): Promise<{
            instance: WebAssembly.Instance;
            wat: string;
            moduleInfo: WasmModuleMetadata;
            errors: CompilerIssue[];
        }>;
    }
}

// Mock implementation of Alchemist's enhanced compile output for testing new UI
const mockAlchemistCompile = async (tsalCode: string): Promise<{
    instance: WebAssembly.Instance;
    wat: string;
    moduleInfo: WasmModuleMetadata;
    errors: CompilerIssue[];
}> => {
    // Simulate compilation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let wat = `(module\n`;
    let errors: CompilerIssue[] = [];
    let exports: WasmExport[] = [];

    // Simple parser for export function definitions
    const functionRegex = /export\s+function\s+(\w+)\s*\((.*?)\)\s*:\s*(.*?)\s*\{/g;
    let match;
    let hasAdd = false;
    while ((match = functionRegex.exec(tsalCode)) !== null) {
        const funcName = match[1];
        const paramsStr = match[2];
        const returnTypeStr = match[3];

        const params = paramsStr.split(',').filter(p => p.trim() !== '').map(p => p.split(':')[1].trim());
        const paramWats = params.map(p => `(param ${p === 'number' ? 'i32' : 'anyref'})`).join(' ');
        const returnWat = returnTypeStr.trim() !== 'void' ? `(result ${returnTypeStr === 'number' ? 'i32' : 'anyref'})` : '';

        wat += `  (func (export "${funcName}") ${paramWats} ${returnWat}\n`;
        // Basic dummy body - replace with more complex Wasm for advanced features
        if (funcName === 'add' && params.length === 2 && params[0] === 'number' && params[1] === 'number' && returnTypeStr === 'number') {
            wat += `    local.get 0\n`;
            wat += `    local.get 1\n`;
            wat += `    i32.add\n`;
        } else if (funcName === 'factorial' && params.length === 1 && params[0] === 'number' && returnTypeStr === 'number') {
            // Simplified factorial logic for WAT, not full recursion
            wat += `    local.get 0\n`;
            wat += `    i32.const 1\n`;
            wat += `    i32.mul\n`; // Just return input for simplicity in WAT
        } else {
            wat += `    (i32.const 0) ;; Default return for other functions\n`;
        }
        wat += `  )\n`;

        exports.push({
            name: funcName,
            type: 'function',
            signature: `(${params.join(', ') || 'void'}) -> ${returnTypeStr === 'void' ? 'void' : returnTypeStr}`,
            parameters: params.map(p => (p === 'number' ? 'i32' : 'anyref')),
            returnType: returnTypeStr === 'void' ? null : (returnTypeStr === 'number' ? 'i32' : 'anyref')
        });

        if (funcName === 'add') {
            hasAdd = true;
        }
    }

    if (!hasAdd) {
        // If no 'add' function, let's create a default mock one for compatibility
        wat += `  (func (export "add") (param i32) (param i32) (result i32)\n`;
        wat += `    local.get 0\n`;
        wat += `    local.get 1\n`;
        wat += `    i32.add\n`;
        wat += `  )\n`;
        exports.push({
            name: 'add',
            type: 'function',
            signature: '(number, number) -> number',
            parameters: ['i32', 'i32'],
            returnType: 'i32'
        });
    }

    // Add a default memory export to the mock module
    wat += `  (memory (export "mem") 1)\n`;
    exports.push({ name: 'mem', type: 'memory', signature: 'initial:1', parameters: [], returnType: null });
    wat += `)\n`;

    // Simulate a simple compilation error for 'invalid' keyword
    if (tsalCode.includes('invalid')) {
        const lines = tsalCode.split('\n');
        const errorLineIndex = lines.findIndex(line => line.includes('invalid'));
        if (errorLineIndex !== -1) {
            const lineContent = lines[errorLineIndex];
            const columnIndex = lineContent.indexOf('invalid');
            errors.push({
                message: "Syntax error: 'invalid' keyword not supported in TSAL.",
                line: errorLineIndex + 1,
                column: columnIndex + 1,
                severity: 'error'
            });
        }
    }


    const moduleInfo: WasmModuleMetadata = {
        exports: exports,
        imports: [], // For simplicity, assume no imports in basic TSAL demo
        memory: { initial: 1, maximum: 256 } // Example memory info
    };

    // Instantiate Wasm
    const wasmModule = await WebAssembly.compile(new TextEncoder().encode(wat));
    const instance = await WebAssembly.instantiate(wasmModule);

    return { instance, wat, moduleInfo, errors };
};

// Override the Alchemist prototype method with our mock for this demo
// This is a powerful hack for demonstration, in a real app, Alchemist would genuinely implement these
if (Alchemist.prototype && !Alchemist.prototype.compile.__isMocked) {
    const originalCompile = Alchemist.prototype.compile;
    Alchemist.prototype.compile = async function (tsalCode: string) {
        try {
            const mockResult = await mockAlchemistCompile(tsalCode);
            return mockResult;
        } catch (e) {
            // Fallback to original if mock fails or is incomplete
            console.warn("Mock Alchemist compile failed, falling back to original:", e);
            const originalResult = await originalCompile.call(this, tsalCode);
            // Enhance original result with mock module info/errors if possible, or provide defaults
            return {
                ...originalResult,
                moduleInfo: { exports: [], imports: [], memory: null }, // Default empty
                errors: [{ message: String(e), severity: 'error' }] // Basic error
            };
        }
    };
    (Alchemist.prototype.compile as any).__isMocked = true; // Mark as mocked
}

// --- Predefined TSAL Examples ---
const TSAL_EXAMPLES: TSALExample[] = [
    {
        name: 'Simple Add Function',
        code: `// This is a basic TSAL example to add two numbers.
// Compile and run this to see the result.

export function add(a: number, b: number): number {
    return a + b;
}
`,
        entryFunction: 'add',
        defaultArgs: '40,2'
    },
    {
        name: 'Factorial Example',
        code: `// Compute factorial of a number recursively.
// Note: TSAL compiler is very basic, actual recursion might not be fully supported
// in the mock WAT output, but the TSAL syntax is valid.

export function factorial(n: number): number {
    if (n === 0) {
        return 1;
    }
    // This will be simplified in mock WAT to avoid complex Wasm generation
    return n * factorial(n - 1); 
}
`,
        entryFunction: 'factorial',
        defaultArgs: '5'
    },
    {
        name: 'Memory Access (Conceptual)',
        code: `// Demonstrates conceptual memory access.
// Actual memory operations in TSAL/WASM require specific intrinsics
// and a more advanced compiler. This is a high-level representation
// and the mock compiler won't truly implement memory reads/writes.

// declare function store_i32(addr: number, value: number): void;
// declare function load_i32(addr: number): number;

export function writeAndRead(address: number, value: number): number {
    // These calls are conceptual for TSAL.
    // store_i32(address, value); 
    // return load_i32(address);  
    return value; // For now, mock compiler will just return the value.
}
`,
        entryFunction: 'writeAndRead',
        defaultArgs: '0, 123'
    },
    {
        name: 'Error Example',
        code: `// This code contains an intentional error.
// The compiler should flag the 'invalid' keyword.

export function buggyFunction(): number {
    const x: number = 10;
    // This keyword is not valid in TSAL
    invalid keyword here; 
    return x;
}
`,
        entryFunction: 'buggyFunction',
        defaultArgs: ''
    }
];

// --- Main AlchemyStudio Component ---

export const AlchemyStudio: React.FC = () => {
    const [tsalCode, setTsalCode] = useState<string>(initialTsalCode);
    const [watCode, setWatCode] = useState<string>('');
    const [output, setOutput] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [wasmModuleMetadata, setWasmModuleMetadata] = useState<WasmModuleMetadata | null>(null);
    const [wasmFunctionName, setWasmFunctionName] = useState<string>('add'); // Default invocation
    const [wasmFunctionArgs, setWasmFunctionArgs] = useState<string>('40,2'); // Default args
    const [compilerIssues, setCompilerIssues] = useState<CompilerIssue[]>([]);
    const alchemistRef = useRef<Alchemist | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);

    // Initialize Alchemist on mount
    useEffect(() => {
        alchemistRef.current = new Alchemist();
        // Load code from local storage on initial mount
        const savedCode = localStorage.getItem('alchemy_tsal_code');
        if (savedCode) {
            setTsalCode(savedCode);
            log("💾 Loaded code from local storage.");
        } else {
            // If no saved code, load the default example
            loadExample(TSAL_EXAMPLES[0]);
        }
    }, []);

    // Save TSAL code to local storage on change (debounced for performance)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (tsalCode) {
                localStorage.setItem('alchemy_tsal_code', tsalCode);
            }
        }, 1000); // Save after 1 second of inactivity
        return () => clearTimeout(handler);
    }, [tsalCode]);

    const log = useCallback((message: string, isError: boolean = false) => {
        setOutput(prev => [...prev, isError ? `❌ ${message}` : message]);
    }, []);

    const updateEditorMarkers = useCallback((issues: CompilerIssue[]) => {
        if (!editorRef.current || !monacoRef.current) return;

        const markers: monaco.editor.IMarkerData[] = issues.map(issue => ({
            severity: monacoRef.current.MarkerSeverity[issue.severity?.toUpperCase() || 'ERROR'],
            message: issue.message,
            startLineNumber: issue.line || 1,
            startColumn: issue.column || 1,
            endLineNumber: issue.line || 1,
            endColumn: (issue.column || 1) + (issue.message.length > 50 ? 50 : issue.message.length) // Extend to length of message or a reasonable length
        }));
        monacoRef.current.editor.setModelMarkers(editorRef.current.getModel()!, 'tsal-compiler', markers);
    }, []);


    const handleCompileAndRun = useCallback(async (functionToCall?: string, argsToPass?: string) => {
        if (!alchemistRef.current) {
            log("❌ Alchemist engine not initialized.");
            return;
        }
        setIsLoading(true);
        setOutput([]);
        setCompilerIssues([]); // Clear previous issues
        setWasmModuleMetadata(null); // Clear previous module info
        editorRef.current && monacoRef.current && monacoRef.current.editor.setModelMarkers(editorRef.current.getModel()!, 'tsal-compiler', []); // Clear editor markers
        log("🔥 Initializing Alchemist Engine...");

        try {
            log("⚙️ Compiling TSAL source...");
            const { instance, wat, moduleInfo, errors } = await alchemistRef.current.compile(tsalCode);
            setWatCode(wat);
            setWasmModuleMetadata(moduleInfo);
            setCompilerIssues(errors);
            updateEditorMarkers(errors);

            if (errors.some(e => e.severity === 'error' || !e.severity)) {
                log("❌ Compilation failed due to errors.", true);
                errors.forEach(err => log(`${err.severity?.toUpperCase() || 'ERROR'}: ${err.message} (Line: ${err.line || 'N/A'}, Col: ${err.column || 'N/A'})`, true));
                return;
            }

            log("✅ Compilation successful.");
            log("🚀 Executing Wasm module...");

            const funcName = functionToCall || wasmFunctionName;
            const argsString = argsToPass || wasmFunctionArgs;

            if (!funcName) {
                log("🚀 No function name specified for execution.", true);
                return;
            }

            const exportedFunc = instance.exports[funcName];

            if (typeof exportedFunc !== 'function') {
                throw new Error(`Exported function '${funcName}' not found or is not a function in Wasm module.`);
            }

            const moduleExport = moduleInfo.exports.find(e => e.name === funcName && e.type === 'function');
            const expectedParams = moduleExport?.parameters || [];

            const parsedArgs = argsString.split(',').map(s => s.trim()).filter(s => s !== '');
            const convertedArgs = parsedArgs.map((arg, index) => {
                // Simple type conversion based on expected Wasm types (i32 for number).
                // For a production-grade compiler, this would be more robust.
                if (expectedParams[index] === 'i32') {
                    const num = parseInt(arg, 10);
                    if (isNaN(num)) {
                        throw new Error(`Argument '${arg}' for parameter ${index + 1} of '${funcName}' is not a valid number (i32 expected).`);
                    }
                    return num;
                }
                // Fallback for other types, or if no specific Wasm type is inferred
                return arg;
            });

            log(`➡️ Invoking '${funcName}(${argsString})' with Wasm...`);
            const result = exportedFunc(...convertedArgs); // Spread arguments to the Wasm function
            log(`▶️ Wasm execution result for ${funcName}: ${result}`);

            if (funcName === 'add' && convertedArgs[0] === 40 && convertedArgs[1] === 2 && result !== 42) {
                log("❌ VALIDATION FAILED! The universe is broken for 'add(40,2)'.", true);
            } else if (funcName === 'add' && result === 42) {
                log("✨ Billion-dollar 'add' code confirmed. The machine is alive.");
            } else {
                log(`🎉 Custom function '${funcName}' executed successfully.`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during compilation or execution.';
            log(`⚠️ Alchemy Engine FAILED: ${errorMessage}`, true);
            console.error(error);
            setCompilerIssues(prev => [...prev, { message: errorMessage, severity: 'error' }]);
        } finally {
            setIsLoading(false);
        }
    }, [tsalCode, log, wasmFunctionName, wasmFunctionArgs, updateEditorMarkers]);

    const handleInvokeWasmFunction = useCallback(() => {
        handleCompileAndRun(wasmFunctionName, wasmFunctionArgs);
    }, [handleCompileAndRun, wasmFunctionName, wasmFunctionArgs]);

    const loadExample = useCallback((example: TSALExample) => {
        setTsalCode(example.code);
        if (example.entryFunction) {
            setWasmFunctionName(example.entryFunction);
        }
        if (example.defaultArgs) {
            setWasmFunctionArgs(example.defaultArgs);
        }
        log(`📖 Loaded example: "${example.name}"`);
    }, [log]);

    const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        // Optionally, register a custom language if TSAL had specific syntax highlighting needs
        // monaco.languages.register({ id: 'tsal' });
        // monaco.languages.setMonarchTokensProvider('tsal', { /* TSAL tokens */ });
    }, []);

    const handleSaveCode = useCallback(() => {
        localStorage.setItem('alchemy_tsal_code', tsalCode);
        log("💾 Code saved to local storage.");
    }, [tsalCode, log]);

    const handleClearSavedCode = useCallback(() => {
        localStorage.removeItem('alchemy_tsal_code');
        setTsalCode(TSAL_EXAMPLES[0].code); // Reset to default example after clearing
        setWasmFunctionName(TSAL_EXAMPLES[0].entryFunction || 'add');
        setWasmFunctionArgs(TSAL_EXAMPLES[0].defaultArgs || '40,2');
        log("🗑️ Cleared saved code from local storage and reset to default example.");
    }, [log]);

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary bg-background-primary">
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-shrink-0">
                    <h1 className="text-3xl font-bold flex items-center">
                        <SparklesIcon className="w-8 h-8 text-yellow-400" />
                        <span className="ml-3">Alchemy Studio</span>
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Write TypeScript Assembly Language (TSAL), compile it to WebAssembly, and run it in the browser.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <select
                        onChange={(e) => {
                            const selectedExample = TSAL_EXAMPLES.find(ex => ex.name === e.target.value);
                            if (selectedExample) {
                                loadExample(selectedExample);
                            }
                        }}
                        className="select-primary"
                        value={TSAL_EXAMPLES.find(ex => ex.code === tsalCode)?.name || ""} // Attempt to show current example
                    >
                        <option value="" disabled>Load Example...</option>
                        {TSAL_EXAMPLES.map(ex => (
                            <option key={ex.name} value={ex.name}>{ex.name}</option>
                        ))}
                    </select>
                    <button onClick={handleSaveCode} className="btn-secondary flex items-center justify-center gap-2">
                        <span className="text-lg">💾</span> Save Code
                    </button>
                    <button onClick={handleClearSavedCode} className="btn-danger flex items-center justify-center gap-2">
                        <span className="text-lg">🗑️</span> Clear Saved
                    </button>
                </div>
            </header>

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={20}>
                    <div className="flex flex-col h-full border border-border rounded-lg shadow-md bg-panel">
                        <label htmlFor="tsal-input" className="p-3 text-sm font-medium text-text-secondary border-b border-border">TSAL Code</label>
                        <div className="flex-grow overflow-hidden">
                            <Editor
                                height="100%"
                                language="typescript" // Using 'typescript' for TSAL highlighting
                                value={tsalCode}
                                onChange={(value) => setTsalCode(value || '')}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbersMinChars: 3,
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    automaticLayout: true // Crucial for resizable panels
                                }}
                                onMount={handleEditorDidMount}
                            />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle style={{ width: '8px', background: 'var(--border-color)', margin: '0 4px' }} />
                <ResizablePanel defaultSize={50} minSize={20}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={35} minSize={15}>
                            <div className="flex flex-col h-full border border-border rounded-lg shadow-md bg-panel">
                                <label className="p-3 text-sm font-medium text-text-secondary border-b border-border">Generated WebAssembly Text (WAT)</label>
                                <div className="flex-grow overflow-hidden">
                                    <Editor
                                        height="100%"
                                        language="wat"
                                        value={watCode}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            lineNumbersMinChars: 3,
                                            scrollBeyondLastLine: false,
                                            wordWrap: 'on',
                                            automaticLayout: true
                                        }}
                                        theme="vs-dark"
                                    />
                                </div>
                            </div>
                        </ResizablePanel>
                        <ResizableHandle style={{ height: '8px', background: 'var(--border-color)', margin: '4px 0' }} />
                        <ResizablePanel defaultSize={65} minSize={25}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={50} minSize={20}>
                                    <div className="flex flex-col h-full border border-border rounded-lg shadow-md bg-panel">
                                        <label className="p-3 text-sm font-medium text-text-secondary border-b border-border">Console Output</label>
                                        <div className="flex-grow p-3 bg-background-alt text-text-primary overflow-y-auto font-mono text-xs whitespace-pre-wrap">
                                            {output.map((line, i) => <p key={i} className={line.startsWith('❌') ? 'text-red-400' : ''}>{line}</p>)}
                                        </div>
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle style={{ height: '8px', background: 'var(--border-color)', margin: '4px 0' }} />
                                <ResizablePanel defaultSize={50} minSize={20}>
                                    <div className="flex flex-col h-full border border-border rounded-lg shadow-md bg-panel">
                                        <label className="p-3 text-sm font-medium text-text-secondary border-b border-border">Wasm Module Inspector</label>
                                        <div className="flex-grow p-3 bg-background-alt text-text-primary overflow-y-auto font-mono text-xs">
                                            {!wasmModuleMetadata ? (
                                                <p className="text-text-secondary">Compile code to inspect module details.</p>
                                            ) : (
                                                <>
                                                    <h3 className="font-semibold text-sm mb-1">Exports:</h3>
                                                    {wasmModuleMetadata.exports.length > 0 ? (
                                                        <ul className="list-disc list-inside mb-2 ml-2">
                                                            {wasmModuleMetadata.exports.map((exp, i) => (
                                                                <li key={i}>
                                                                    <span className="font-medium text-blue-300">{exp.name}</span>: {exp.type} (Signature: {exp.signature})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="ml-2 text-text-secondary">No exports found.</p>}

                                                    <h3 className="font-semibold text-sm mb-1">Imports:</h3>
                                                    {wasmModuleMetadata.imports.length > 0 ? (
                                                        <ul className="list-disc list-inside mb-2 ml-2">
                                                            {wasmModuleMetadata.imports.map((imp, i) => (
                                                                <li key={i}>
                                                                    <span className="font-medium text-green-300">{imp.module}.{imp.name}</span>: {imp.type} (Signature: {imp.signature || 'N/A'})
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="ml-2 text-text-secondary">No imports found.</p>}

                                                    <h3 className="font-semibold text-sm mb-1">Memory:</h3>
                                                    {wasmModuleMetadata.memory ? (
                                                        <p className="ml-2">Initial: {wasmModuleMetadata.memory.initial} pages ({wasmModuleMetadata.memory.initial * 64}KB) {wasmModuleMetadata.memory.maximum ? `Max: ${wasmModuleMetadata.memory.maximum} pages` : ''}</p>
                                                    ) : <p className="ml-2 text-text-secondary">No memory defined.</p>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>

            <div className="flex-shrink-0 mt-6 bg-panel p-4 rounded-lg shadow-md border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <label htmlFor="func-name" className="text-sm font-medium text-text-secondary whitespace-nowrap">Function:</label>
                    <input
                        type="text"
                        id="func-name"
                        value={wasmFunctionName}
                        onChange={(e) => setWasmFunctionName(e.target.value)}
                        placeholder="e.g., add"
                        className="input-text flex-grow sm:flex-grow-0 sm:w-32"
                    />
                    <label htmlFor="func-args" className="text-sm font-medium text-text-secondary whitespace-nowrap">Arguments:</label>
                    <input
                        type="text"
                        id="func-args"
                        value={wasmFunctionArgs}
                        onChange={(e) => setWasmFunctionArgs(e.target.value)}
                        placeholder="e.g., 40,2"
                        className="input-text flex-grow sm:flex-grow-0 sm:w-48"
                    />
                    <button onClick={handleInvokeWasmFunction} disabled={isLoading} className="btn-secondary w-full sm:w-auto">
                        {isLoading ? <LoadingSpinner /> : 'Invoke'}
                    </button>
                </div>
                <button onClick={() => handleCompileAndRun()} disabled={isLoading} className="btn-primary w-full sm:w-auto min-w-[150px]">
                    {isLoading ? <LoadingSpinner /> : 'Compile & Run All'}
                </button>
            </div>
        </div>
    );
};