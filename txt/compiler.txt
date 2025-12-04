// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


/**
 * @fileoverview The main Alchemist compiler orchestrator.
 * This class ties together the lexer, parser, semantic analyzer, and code generator
 * to compile TSAL source code into WebAssembly.
 */

import { Lexer } from './pipeline/lexer';
import { Parser } from './pipeline/parser';
import { SemanticAnalyzer } from './pipeline/semantic';
import { CodeGenerator } from './pipeline/codegen';
import { AetherLink } from '../aetherlink/ffi';
import { watToWasm } from './wabt';

/**
 * Represents a severity level for a compilation message.
 * @export
 */
export enum Severity {
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
    Fatal = 'fatal',
}

/**
 * Represents a single diagnostic message from the compiler.
 * @export
 */
export interface CompilationMessage {
    severity: Severity;
    code: string;
    message: string;
    filePath?: string;
    line?: number;
    column?: number;
    stage?: string;
    timestamp?: number;
}

/**
 * Custom error class for compilation failures, carrying structured diagnostics.
 * @export
 */
export class CompilationFailedError extends Error {
    public readonly diagnostics: CompilationMessage[];

    constructor(message: string, diagnostics: CompilationMessage[]) {
        super(message);
        this.name = 'CompilationFailedError';
        this.diagnostics = diagnostics;
        Object.setPrototypeOf(this, CompilationFailedError.prototype);
    }
}

/**
 * Manages and reports compilation messages (errors, warnings, info).
 * @export
 */
export class ErrorReporter {
    private messages: CompilationMessage[] = [];

    /**
     * Reports a new compilation message.
     * @param message The message to report.
     */
    public report(message: CompilationMessage): void {
        this.messages.push({ ...message, timestamp: Date.now() });
    }

    /**
     * Checks if any messages of a specific severity (or higher) have been reported.
     * @param minSeverity The minimum severity level to check for. Defaults to Severity.Error.
     * @returns True if messages of the specified severity or higher exist, false otherwise.
     */
    public hasErrors(minSeverity: Severity = Severity.Error): boolean {
        const severityOrder = [Severity.Info, Severity.Warning, Severity.Error, Severity.Fatal];
        const minSeverityIndex = severityOrder.indexOf(minSeverity);
        return this.messages.some(msg => severityOrder.indexOf(msg.severity) >= minSeverityIndex);
    }

    /**
     * Retrieves all reported messages, optionally filtered by severity.
     * @param severity An optional severity level to filter messages.
     * @returns An array of compilation messages.
     */
    public getMessages(severity?: Severity): CompilationMessage[] {
        if (severity) {
            return this.messages.filter(msg => msg.severity === severity);
        }
        return [...this.messages];
    }

    /**
     * Formats all reported messages into a human-readable string.
     * @returns A string containing formatted compilation messages.
     */
    public formatMessages(): string {
        return this.messages
            .sort((a, b) => (a.filePath || '').localeCompare(b.filePath || '') || (a.line || 0) - (b.line || 0))
            .map(msg => {
                const location = msg.filePath ? `${msg.filePath}${msg.line !== undefined ? `:${msg.line}` : ''}${msg.column !== undefined ? `:${msg.column}` : ''}` : '';
                const stage = msg.stage ? `[${msg.stage}]` : '';
                return `[${msg.severity.toUpperCase()}] ${stage} ${location ? `(${location}) ` : ''}${msg.code}: ${msg.message}`;
            })
            .join('\n');
    }
}

/**
 * Defines the configurable options for the Alchemist compiler.
 * @export
 */
export interface CompilerOptions {
    /** Sets the optimization level. 'none' | 'basic' | 'advanced' */
    optimizationLevel: 'none' | 'basic' | 'advanced';
    /** Includes debug information in the compiled WASM (e.g., DWARF-like info). */
    debugInfo: boolean;
    /** Emits the intermediate WAT string in the compilation result. */
    emitWAT: boolean;
    /** Generates source maps for debugging. */
    sourceMap: boolean;
    /** Enforces stricter semantic rules. */
    strictMode: boolean;
    /** Specifies the target WebAssembly architecture. */
    target: 'wasm32' | 'wasm64';
    /** Enable experimental features. */
    experimentalFeatures: string[];
}

/**
 * Default compiler options.
 * @export
 */
export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
    optimizationLevel: 'basic',
    debugInfo: true,
    emitWAT: true,
    sourceMap: true,
    strictMode: false,
    target: 'wasm32',
    experimentalFeatures: [],
};

/**
 * Interface for a generic optimization pass.
 * @export
 */
export interface OptimizationPass {
    /** The name of the optimization pass. */
    readonly name: string;
    /** Applies the optimization to the given AST or intermediate representation. */
    apply(ast: any, options: CompilerOptions, reporter: ErrorReporter): any;
}

/**
 * A basic dead code elimination pass. (Illustrative, actual implementation would traverse AST/IR)
 * @export
 */
export class DeadCodeEliminationPass implements OptimizationPass {
    public readonly name = 'DeadCodeElimination';

    apply(ast: any, options: CompilerOptions, reporter: ErrorReporter): any {
        if (options.optimizationLevel === 'none') {
            return ast;
        }
        // In a real compiler, this would deeply traverse the AST/IR
        // and remove unreachable code blocks, unused variables, etc.
        reporter.report({
            severity: Severity.Info,
            message: `Applying Dead Code Elimination pass.`,
            stage: this.name,
            code: 'OPT001'
        });
        // Simulate removing some nodes or simplifying structure
        // For demonstration, we'll just return the AST, but a real pass
        // would modify it.
        return ast; // Return modified AST
    }
}

/**
 * A basic constant folding pass. (Illustrative, actual implementation would traverse AST/IR)
 * @export
 */
export class ConstantFoldingPass implements OptimizationPass {
    public readonly name = 'ConstantFolding';

    apply(ast: any, options: CompilerOptions, reporter: ErrorReporter): any {
        if (options.optimizationLevel === 'none') {
            return ast;
        }
        // In a real compiler, this would traverse the AST/IR looking for
        // constant expressions (e.g., 2 + 3) and replacing them with their
        // computed values (e.g., 5).
        reporter.report({
            severity: Severity.Info,
            message: `Applying Constant Folding pass.`,
            stage: this.name,
            code: 'OPT002'
        });
        // Simulate folding constants
        return ast; // Return modified AST
    }
}

/**
 * Orchestrates multiple optimization passes.
 * @export
 */
export class Optimizer {
    private passes: OptimizationPass[];
    private reporter: ErrorReporter;

    constructor(reporter: ErrorReporter) {
        this.reporter = reporter;
        // Initialize with default optimization passes based on level
        this.passes = [
            new DeadCodeEliminationPass(),
            new ConstantFoldingPass(),
            // Add more advanced passes for 'advanced' level
        ];
    }

    /**
     * Applies a sequence of optimization passes to the given AST.
     * @param ast The AST or intermediate representation to optimize.
     * @param options The compiler options.
     * @returns The optimized AST.
     */
    public optimize(ast: any, options: CompilerOptions): any {
        let currentAst = ast;
        if (options.optimizationLevel === 'none') {
            this.reporter.report({ severity: Severity.Info, message: 'Optimization level set to "none", skipping all passes.', stage: 'Optimizer' });
            return ast;
        }

        this.reporter.report({
            severity: Severity.Info,
            message: `Starting optimization pipeline (Level: ${options.optimizationLevel}).`,
            stage: 'Optimizer'
        });

        for (const pass of this.passes) {
            if (options.optimizationLevel === 'basic' && (pass instanceof DeadCodeEliminationPass || pass instanceof ConstantFoldingPass)) {
                // Apply basic passes for 'basic' level
            } else if (options.optimizationLevel === 'advanced') {
                // Apply all passes for 'advanced' level
            } else if (options.optimizationLevel === 'none') {
                continue; // Skip all passes if none
            } else {
                continue; // Skip non-configured passes
            }

            const passStartTime = performance.now();
            try {
                currentAst = pass.apply(currentAst, options, this.reporter);
                const passEndTime = performance.now();
                this.reporter.report({
                    severity: Severity.Info,
                    message: `${pass.name} pass completed in ${(passEndTime - passStartTime).toFixed(2)}ms.`,
                    stage: 'Optimizer'
                });
            } catch (e: any) {
                this.reporter.report({
                    severity: Severity.Error,
                    code: 'OPT999',
                    message: `Optimization pass "${pass.name}" failed: ${e.message}`,
                    stage: pass.name
                });
                // Potentially re-throw if it's a fatal error or continue with best effort
            }
        }
        this.reporter.report({
            severity: Severity.Info,
            message: `Optimization pipeline finished.`,
            stage: 'Optimizer'
        });
        return currentAst;
    }
}

/**
 * The result of a successful compilation.
 * @export
 */
export interface CompilerResult {
    /** The instantiated WebAssembly module instance. */
    instance: WebAssembly.Instance;
    /** The WebAssembly Text format (WAT) string, if emitWAT is true. */
    wat: string;
    /** The raw WebAssembly binary buffer. */
    wasmBuffer: Uint8Array;
    /** All diagnostics (info, warnings, errors) generated during compilation. */
    diagnostics: CompilationMessage[];
    /** Total compilation time in milliseconds. */
    compilationTimeMs: number;
    /** The generated source map string, if sourceMap is true. */
    sourceMap?: string;
}

/**
 * Alchemist compiler orchestrator. This class manages the entire
 * compilation pipeline from source code to WebAssembly instance.
 * @export
 */
export class Alchemist {
    private aetherLink: AetherLink;

    constructor() {
        this.aetherLink = new AetherLink();
    }

    /**
     * Compiles TSAL source code into a WebAssembly module instance.
     * This method orchestrates lexing, parsing, semantic analysis,
     * optimization, code generation, WASM assembly, and instantiation.
     *
     * @param source The TSAL source code string to compile.
     * @param filePath An optional file path for better error reporting. Defaults to 'main.tsal'.
     * @param options Optional compiler configuration. Overrides default options.
     * @returns A promise that resolves to a CompilerResult containing the WASM instance, WAT, and diagnostics.
     * @throws {CompilationFailedError} If fatal errors occur during compilation.
     */
    public async compile(
        source: string,
        filePath: string = 'main.tsal',
        options?: Partial<CompilerOptions>
    ): Promise<CompilerResult> {
        const reporter = new ErrorReporter();
        const resolvedOptions = { ...DEFAULT_COMPILER_OPTIONS, ...options };
        const startTime = performance.now();

        console.log(`--- Starting Alchemist Compilation Pipeline for "${filePath}" ---`);
        reporter.report({
            severity: Severity.Info,
            message: `Compilation started with options: ${JSON.stringify(resolvedOptions)}`,
            filePath, stage: 'CompilerInit'
        });

        try {
            let tokens: any[] = [];
            let ast: any;
            let validatedAst: any;
            let optimizedAst: any;
            let wat: string = '';
            let wasmBuffer: Uint8Array = new Uint8Array();
            let instance: WebAssembly.Instance;
            let sourceMap: string | undefined;

            // 1. Lexical Analysis
            const lexerStartTime = performance.now();
            try {
                const lexer = new Lexer(source);
                tokens = lexer.tokenize();
                reporter.report({
                    severity: Severity.Info,
                    message: `Lexical analysis produced ${tokens.length} tokens.`,
                    filePath, stage: 'Lexical Analysis'
                });
            } catch (e: any) {
                reporter.report({
                    severity: Severity.Fatal,
                    code: 'LEX001',
                    message: `Lexical analysis failed: ${e.message}`,
                    filePath, line: e.line, column: e.column, stage: 'Lexical Analysis'
                });
                throw new CompilationFailedError(`Lexical analysis failed for "${filePath}"`, reporter.getMessages());
            }
            const lexerEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `Lexical analysis completed in ${(lexerEndTime - lexerStartTime).toFixed(2)}ms.`,
                filePath, stage: 'Lexical Analysis'
            });


            // 2. Syntactic Analysis
            const parserStartTime = performance.now();
            try {
                const parser = new Parser(tokens);
                ast = parser.parse();
                reporter.report({
                    severity: Severity.Info,
                    message: `Syntactic analysis produced an AST.`,
                    filePath, stage: 'Syntactic Analysis'
                });
            } catch (e: any) {
                reporter.report({
                    severity: Severity.Fatal,
                    code: 'PAR001',
                    message: `Syntactic analysis failed: ${e.message}`,
                    filePath, line: e.line, column: e.column, stage: 'Syntactic Analysis'
                });
                throw new CompilationFailedError(`Syntactic analysis failed for "${filePath}"`, reporter.getMessages());
            }
            const parserEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `Syntactic analysis completed in ${(parserEndTime - parserStartTime).toFixed(2)}ms.`,
                filePath, stage: 'Syntactic Analysis'
            });


            // 3. Semantic Analysis
            const semanticStartTime = performance.now();
            try {
                const analyzer = new SemanticAnalyzer();
                validatedAst = analyzer.analyze(ast);
                reporter.report({
                    severity: Severity.Info,
                    message: `Semantic analysis completed. AST is valid.`,
                    filePath, stage: 'Semantic Analysis'
                });
            } catch (e: any) {
                reporter.report({
                    severity: Severity.Fatal,
                    code: 'SEM001',
                    message: `Semantic analysis failed: ${e.message}`,
                    filePath, line: e.line, column: e.column, stage: 'Semantic Analysis'
                });
                throw new CompilationFailedError(`Semantic analysis failed for "${filePath}"`, reporter.getMessages());
            }
            const semanticEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `Semantic analysis completed in ${(semanticEndTime - semanticStartTime).toFixed(2)}ms.`,
                filePath, stage: 'Semantic Analysis'
            });


            // 4. Optimization
            const optimizerStartTime = performance.now();
            if (resolvedOptions.optimizationLevel !== 'none') {
                const optimizer = new Optimizer(reporter);
                optimizedAst = optimizer.optimize(validatedAst, resolvedOptions);
            } else {
                optimizedAst = validatedAst; // No optimization
                reporter.report({
                    severity: Severity.Info,
                    message: `Optimization skipped (optimizationLevel set to 'none').`,
                    filePath, stage: 'Optimization'
                });
            }
            const optimizerEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `Optimization stage completed in ${(optimizerEndTime - optimizerStartTime).toFixed(2)}ms.`,
                filePath, stage: 'Optimization'
            });


            // 5. Code Generation
            const codegenStartTime = performance.now();
            try {
                const generator = new CodeGenerator();
                wat = generator.generate(optimizedAst);
                reporter.report({
                    severity: Severity.Info,
                    message: `Code generation produced ${wat.length} characters of WAT.`,
                    filePath, stage: 'Code Generation'
                });
            } catch (e: any) {
                reporter.report({
                    severity: Severity.Fatal,
                    code: 'CGN001',
                    message: `Code generation failed: ${e.message}`,
                    filePath, stage: 'Code Generation'
                });
                throw new CompilationFailedError(`Code generation failed for "${filePath}"`, reporter.getMessages());
            }
            const codegenEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `Code generation completed in ${(codegenEndTime - codegenStartTime).toFixed(2)}ms.`,
                filePath, stage: 'Code Generation'
            });


            // 6. Assemble WAT to Wasm Binary
            const assembleStartTime = performance.now();
            try {
                wasmBuffer = watToWasm(wat);
                reporter.report({
                    severity: Severity.Info,
                    message: `WAT assembled to ${wasmBuffer.byteLength} bytes of WASM binary.`,
                    filePath, stage: 'WASM Assembly'
                });
            } catch (e: any) {
                reporter.report({
                    severity: Severity.Fatal,
                    code: 'WASM001',
                    message: `WASM assembly failed: ${e.message}`,
                    filePath, stage: 'WASM Assembly'
                });
                throw new CompilationFailedError(`WASM assembly failed for "${filePath}"`, reporter.getMessages());
            }
            const assembleEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `WASM assembly completed in ${(assembleEndTime - assembleStartTime).toFixed(2)}ms.`,
                filePath, stage: 'WASM Assembly'
            });


            // 7. Instantiate Module with FFI
            const instantiateStartTime = performance.now();
            try {
                const importObject = this.aetherLink.createImportObject();
                const { instance: webAssemblyInstance } = await WebAssembly.instantiate(wasmBuffer, importObject);
                instance = webAssemblyInstance;
                this.aetherLink.setMemory(instance.exports.memory as WebAssembly.Memory);
                reporter.report({
                    severity: Severity.Info,
                    message: `WebAssembly module instantiated successfully.`,
                    filePath, stage: 'WASM Instantiation'
                });
            } catch (e: any) {
                reporter.report({
                    severity: Severity.Fatal,
                    code: 'WASM002',
                    message: `WebAssembly instantiation failed: ${e.message}`,
                    filePath, stage: 'WASM Instantiation'
                });
                throw new CompilationFailedError(`WASM instantiation failed for "${filePath}"`, reporter.getMessages());
            }
            const instantiateEndTime = performance.now();
            reporter.report({
                severity: Severity.Info,
                message: `WebAssembly instantiation completed in ${(instantiateEndTime - instantiateStartTime).toFixed(2)}ms.`,
                filePath, stage: 'WASM Instantiation'
            });


            // 8. Source Map Generation (conceptual placeholder)
            if (resolvedOptions.sourceMap) {
                const sourceMapStartTime = performance.now();
                sourceMap = this._generateSourceMap(wat, source, filePath);
                const sourceMapEndTime = performance.now();
                reporter.report({
                    severity: Severity.Info,
                    message: `Source map generation completed in ${(sourceMapEndTime - sourceMapStartTime).toFixed(2)}ms.`,
                    filePath, stage: 'Source Map Generation'
                });
            }


            const endTime = performance.now();
            const compilationTimeMs = endTime - startTime;

            // Final check for errors
            if (reporter.hasErrors(Severity.Error)) {
                reporter.report({
                    severity: Severity.Error,
                    code: 'COMP900',
                    message: `Compilation finished with errors for "${filePath}".`,
                    filePath, stage: 'Overall'
                });
                throw new CompilationFailedError(`Compilation for "${filePath}" finished with errors.`, reporter.getMessages());
            } else if (reporter.hasErrors(Severity.Warning)) {
                reporter.report({
                    severity: Severity.Warning,
                    code: 'COMP800',
                    message: `Compilation finished with warnings for "${filePath}".`,
                    filePath, stage: 'Overall'
                });
            } else {
                reporter.report({
                    severity: Severity.Info,
                    message: `Alchemist compilation finished successfully in ${compilationTimeMs.toFixed(2)}ms for "${filePath}".`,
                    filePath, stage: 'Overall'
                });
            }

            console.log("--- Alchemist Compilation Pipeline Finished ---");
            console.log(reporter.formatMessages());

            return {
                instance,
                wat: resolvedOptions.emitWAT ? wat : '',
                wasmBuffer,
                diagnostics: reporter.getMessages(),
                compilationTimeMs,
                sourceMap: resolvedOptions.sourceMap ? sourceMap : undefined
            };

        } catch (error: any) {
            // If it's already a CompilationFailedError, re-throw it.
            if (error instanceof CompilationFailedError) {
                console.error("ALCHEMIST COMPILATION FAILED (Structured Error):", error.message);
                console.error(reporter.formatMessages());
                throw error;
            }

            // For unexpected errors, wrap them in a CompilationFailedError.
            const errorMessage = error instanceof Error ? error.message : String(error);
            reporter.report({
                severity: Severity.Fatal,
                code: 'COMP999',
                message: `An unexpected critical error occurred during compilation: ${errorMessage}`,
                filePath, stage: 'Overall'
            });

            console.error("ALCHEMIST COMPILATION FAILED (Unexpected Error):", error);
            console.error(reporter.formatMessages());
            throw new CompilationFailedError(`An unexpected compilation error occurred for "${filePath}": ${errorMessage}`, reporter.getMessages());
        }
    }

    /**
     * Placeholder for source map generation logic.
     * In a real compiler, this would map WASM bytecode/WAT back to the original source.
     * This might involve `walrus` or `binaryen` tools, or custom logic during codegen.
     * @param wat The generated WebAssembly Text format.
     * @param originalSource The original source code.
     * @param filePath The file path of the original source.
     * @returns A conceptual source map string.
     * @private
     */
    private _generateSourceMap(wat: string, originalSource: string, filePath: string): string {
        // This is a simplified placeholder.
        // A real source map generator would track mappings during code generation.
        // For WAT, tools like `wat-sourcemap` or `wabt` might be used.
        // The output would be a JSON string adhering to the Source Map V3 specification.

        const dummySourceMap = {
            version: 3,
            file: `${filePath}.wasm`,
            sourceRoot: '',
            sources: [filePath],
            names: [],
            mappings: 'AAAA;', // A very basic, empty mapping
            sourcesContent: [originalSource]
        };

        // If debugInfo is enabled, we could enrich this with more meaningful mappings
        // based on the AST nodes and their original source locations.
        // For now, this is just a structural representation.
        return JSON.stringify(dummySourceMap, null, 2);
    }
}
