// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file provides documentation for available pipeline functions for the AI model.

export const PIPELINE_TOOLS_DOCUMENTATION = `
/*
 * Available Tools for Pipeline Generation
 *
 * You must import any of these functions from './services/index.ts'.
 * You must construct a pipeline that logically chains these functions together.
 * The output of one step should be used as the input for the next.
 * You may need to transform the data between steps. The final function should be named \`runPipeline\`.
 */

/**
 * Explains a code snippet, providing a structured analysis.
 * @param {string} code - The code snippet to analyze.
 * @returns {Promise<object>} A promise resolving to an object with summary, line-by-line analysis, complexity, and suggestions.
 */
// import { explainCodeStructured } from './services/index.ts';
// signature: explainCodeStructured(code: string): Promise<StructuredExplanation>

/**
 * Generates a UI color theme from a text description.
 * @param {string} description - A text description of the desired theme (e.g., "a dark, cyberpunk theme").
 * @returns {Promise<object>} A promise resolving to an object with theme colors.
 */
// import { generateThemeFromDescription } from './services/index.ts';
// signature: generateThemeFromDescription(description: string): Promise<ColorTheme>

/**
 * Generates a regular expression from a description.
 * @param {string} description - A text description of the pattern to match (e.g., "a valid email address").
 * @returns {Promise<string>} A promise resolving to a string containing the regex literal.
 */
// import { generateRegEx } from './services/index.ts';
// signature: generateRegEx(description: string): Promise<string>

/**
 * Generates a conventional commit message from a git diff.
 * @param {string} diff - A string containing the git diff.
 * @returns {Promise<string>} A promise resolving to the commit message string.
 */
// import { generateCommitMessage } from './services/index.ts';
// signature: generateCommitMessage(diff: string): Promise<string>

/**
 * Generates unit tests for a given code snippet.
 * @param {string} code - The code to generate tests for.
 * @returns {Promise<string>} A promise resolving to a string containing the unit test code.
 */
// import { generateUnitTests } from './services/index.ts';
// signature: generateUnitTests(code: string): Promise<string>

/**
 * Migrates code from one language/framework to another.
 * @param {string} code - The source code to migrate.
 * @param {string} from - The source language/framework (e.g., "SASS").
 * @param {string} to - The target language/framework (e.g., "CSS").
 * @returns {Promise<string>} A promise resolving to a string of the migrated code.
 */
// import { migrateCode } from './services/index.ts';
// signature: migrateCode(code: string, from: string, to: string): Promise<string>

/**
 * Converts a JSON string to a simplified XBRL-like XML format.
 * @param {string} json - The JSON string to convert.
 * @returns {Promise<string>} A promise resolving to the XML string.
 */
// import { convertJsonToXbrl } from './services/index.ts';
// signature: convertJsonToXbrl(json: string): Promise<string>

/**
 * Generates a cron expression from a natural language description.
 * @param {string} description - A text description of the schedule (e.g., "every weekday at 5pm").
 * @returns {Promise<object>} A promise resolving to an object with cron parts.
 */
// import { generateCronFromDescription } from './services/index.ts';
// signature: generateCronFromDescription(description: string): Promise<CronParts>

/**
 * Generates a changelog from a raw git log.
 * @param {string} log - The raw git log output.
 * @returns {Promise<string>} A promise resolving to a markdown string of the changelog.
 */
// import { generateChangelogFromLog } from './services/index.ts';
// signature: generateChangelogFromLog(log: string): Promise<string>

/**
 * Generates a structured Pull Request summary from a code diff.
 * @param {string} diff - The git diff string.
 * @returns {Promise<object>} A promise resolving to an object with title, summary, and changes.
 */
// import { generatePrSummaryStructured } from './services/index.ts';
// signature: generatePrSummaryStructured(diff: string): Promise<StructuredPrSummary>

/**
 * Generates a color palette from a base color.
 * @param {string} baseColor - A hex code for the base color (e.g., "#0047AB").
 * @returns {Promise<object>} A promise resolving to an object containing an array of color hex codes.
 */
// import { generateColorPalette } from './services/index.ts';
// signature: generateColorPalette(baseColor: string): Promise<{ colors: string[] }>

/**
 * Reviews a code snippet for issues and improvements.
 * @param {string} code - The code to review.
 * @returns {Promise<string>} A promise resolving to a markdown string with the review.
 */
// import { reviewCode } from './services/index.ts';
// signature: reviewCode(code: string): Promise<string>

/**
 * Generates an image from a text prompt.
 * @param {string} prompt - The text prompt describing the image.
 * @returns {Promise<string>} A promise resolving to a data URL of the generated image.
 */
// import { generateImage } from './services/index.ts';
// signature: generateImage(prompt: string): Promise<string>
`;

export const featureToFunctionMap: Record<string, string> = {
    'ai-code-explainer': 'explainCodeStructured',
    'theme-designer': 'generateThemeFromDescription',
    'regex-sandbox': 'generateRegEx',
    'ai-commit-generator': 'generateCommitMessage',
    'ai-unit-test-generator': 'generateUnitTests',
    'ai-code-migrator': 'migrateCode',
    'xbrl-converter': 'convertJsonToXbrl',
    'cron-job-builder': 'generateCronFromDescription',
    'changelog-generator': 'generateChangelogFromLog',
    'ai-pull-request-assistant': 'generatePrSummaryStructured',
    'color-palette-generator': 'generateColorPalette',
    'code-review-bot': 'reviewCode',
    'ai-image-generator': 'generateImage',
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Defines the structure for a tool parameter.
 */
export interface ToolParameter {
    name: string;
    type: string; // e.g., "string", "number", "object", "Promise<string>"
    description: string;
    optional?: boolean;
}

/**
 * Defines the signature (parameters and return type) of a tool function.
 */
export interface ToolSignature {
    parameters: ToolParameter[];
    returnType: string; // e.g., "Promise<string>", "Promise<object>"
}

/**
 * Represents a complete definition for an available pipeline tool.
 */
export interface ToolDefinition {
    name: string;
    description: string;
    signature: ToolSignature;
    exampleUsage?: string; // Optional example of how to call the tool
    featureKey?: string; // Links to the featureToFunctionMap
}

/**
 * A programmatic registry of all available pipeline tools.
 * This provides a structured alternative to the `PIPELINE_TOOLS_DOCUMENTATION` string for programmatic access.
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
    {
        name: "explainCodeStructured",
        description: "Explains a code snippet, providing a structured analysis.",
        signature: {
            parameters: [{ name: "code", type: "string", description: "The code snippet to analyze." }],
            returnType: "Promise<object>",
        },
        exampleUsage: "await explainCodeStructured(myCode)",
        featureKey: "ai-code-explainer",
    },
    {
        name: "generateThemeFromDescription",
        description: "Generates a UI color theme from a text description.",
        signature: {
            parameters: [{ name: "description", type: "string", description: "A text description of the desired theme (e.g., \"a dark, cyberpunk theme\")." }],
            returnType: "Promise<object>",
        },
        exampleUsage: "await generateThemeFromDescription('a dark, cyberpunk theme')",
        featureKey: "theme-designer",
    },
    {
        name: "generateRegEx",
        description: "Generates a regular expression from a description.",
        signature: {
            parameters: [{ name: "description", type: "string", description: "A text description of the pattern to match (e.g., \"a valid email address\")." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await generateRegEx('a valid email address')",
        featureKey: "regex-sandbox",
    },
    {
        name: "generateCommitMessage",
        description: "Generates a conventional commit message from a git diff.",
        signature: {
            parameters: [{ name: "diff", type: "string", description: "A string containing the git diff." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await generateCommitMessage(gitDiff)",
        featureKey: "ai-commit-generator",
    },
    {
        name: "generateUnitTests",
        description: "Generates unit tests for a given code snippet.",
        signature: {
            parameters: [{ name: "code", type: "string", description: "The code to generate tests for." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await generateUnitTests(myCode)",
        featureKey: "ai-unit-test-generator",
    },
    {
        name: "migrateCode",
        description: "Migrates code from one language/framework to another.",
        signature: {
            parameters: [
                { name: "code", type: "string", description: "The source code to migrate." },
                { name: "from", type: "string", description: "The source language/framework (e.g., \"SASS\")." },
                { name: "to", type: "string", description: "The target language/framework (e.g., \"CSS\")." }
            ],
            returnType: "Promise<string>",
        },
        exampleUsage: "await migrateCode(sassCode, 'SASS', 'CSS')",
        featureKey: "ai-code-migrator",
    },
    {
        name: "convertJsonToXbrl",
        description: "Converts a JSON string to a simplified XBRL-like XML format.",
        signature: {
            parameters: [{ name: "json", type: "string", description: "The JSON string to convert." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await convertJsonToXbrl(jsonString)",
        featureKey: "xbrl-converter",
    },
    {
        name: "generateCronFromDescription",
        description: "Generates a cron expression from a natural language description.",
        signature: {
            parameters: [{ name: "description", type: "string", description: "A text description of the schedule (e.g., \"every weekday at 5pm\")." }],
            returnType: "Promise<object>",
        },
        exampleUsage: "await generateCronFromDescription('every weekday at 5pm')",
        featureKey: "cron-job-builder",
    },
    {
        name: "generateChangelogFromLog",
        description: "Generates a changelog from a raw git log.",
        signature: {
            parameters: [{ name: "log", type: "string", description: "The raw git log output." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await generateChangelogFromLog(gitLog)",
        featureKey: "changelog-generator",
    },
    {
        name: "generatePrSummaryStructured",
        description: "Generates a structured Pull Request summary from a code diff.",
        signature: {
            parameters: [{ name: "diff", type: "string", description: "The git diff string." }],
            returnType: "Promise<object>",
        },
        exampleUsage: "await generatePrSummaryStructured(prDiff)",
        featureKey: "ai-pull-request-assistant",
    },
    {
        name: "generateColorPalette",
        description: "Generates a color palette from a base color.",
        signature: {
            parameters: [{ name: "baseColor", type: "string", description: "A hex code for the base color (e.g., \"#0047AB\")." }],
            returnType: "Promise<object>",
        },
        exampleUsage: "await generateColorPalette('#0047AB')",
        featureKey: "color-palette-generator",
    },
    {
        name: "reviewCode",
        description: "Reviews a code snippet for issues and improvements.",
        signature: {
            parameters: [{ name: "code", type: "string", description: "The code to review." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await reviewCode(myCode)",
        featureKey: "code-review-bot",
    },
    {
        name: "generateImage",
        description: "Generates an image from a text prompt.",
        signature: {
            parameters: [{ name: "prompt", type: "string", description: "The text prompt describing the image." }],
            returnType: "Promise<string>",
        },
        exampleUsage: "await generateImage('a cat playing chess')",
        featureKey: "ai-image-generator",
    },
];

/**
 * Retrieves a tool definition by its name.
 * @param toolName The name of the tool to retrieve.
 * @returns The `ToolDefinition` if found, otherwise `undefined`.
 */
export function getToolDefinition(toolName: string): ToolDefinition | undefined {
    return TOOL_DEFINITIONS.find(tool => tool.name === toolName);
}

/**
 * Type definition for a callable pipeline tool function.
 * All pipeline tools are expected to be asynchronous and return a Promise.
 */
export type PipelineToolImplementation = (...args: any[]) => Promise<any>;

/**
 * A map of tool names to their actual callable implementations.
 * This map is typically provided to the `PipelineExecutor` at runtime.
 */
export type ToolImplementations = Record<string, PipelineToolImplementation>;

/**
 * Represents a single step in a pipeline, defining which tool to call and how to map arguments.
 */
export interface PipelineStep {
    toolName: string;
    /**
     * Maps keys from the current pipeline context (initial context + previous step outputs)
     * to the parameter names of the tool.
     * Values can be string paths (e.g., "step1.output.code") or literal values.
     */
    argsMap: Record<string, string | any>;
    /**
     * Optional key to store the output of this step in the pipeline context.
     * If not provided, the output is only implicitly available as `last_output`.
     */
    outputKey?: string;
}

/**
 * Defines a complete pipeline, consisting of an ordered sequence of steps.
 */
export interface PipelineDefinition {
    id: string; // Unique identifier for the pipeline
    name: string;
    description?: string;
    steps: PipelineStep[];
    /**
     * Optional key in the final context that represents the overall result of the pipeline.
     * If not specified, the output of the last step or the full context will be returned.
     */
    finalOutputKey?: string;
}

/**
 * Creates a higher-order function to transform data objects.
 * Useful for mapping and renaming properties between pipeline steps.
 * @param mapping An object where keys are desired output property names, and values are
 *                either string paths to input properties (e.g., 'data.id') or a function
 *                that takes the input object and returns the desired value.
 * @returns A function that takes an input object and returns the transformed output object.
 */
export function createDataTransformer<TInput extends Record<string, any>, TOutput extends Record<string, any>>(
    mapping: { [K in keyof TOutput]: string | ((input: TInput) => TOutput[K]) }
): (input: TInput) => TOutput {
    return (input: TInput): TOutput => {
        const output: Partial<TOutput> = {};
        for (const key in mapping) {
            if (Object.prototype.hasOwnProperty.call(mapping, key)) {
                const valueMapper = mapping[key];
                if (typeof valueMapper === 'string') {
                    // Resolve value from input using dot-notation path
                    const parts = valueMapper.split('.');
                    let current: any = input;
                    for (const part of parts) {
                        if (current === null || current === undefined) {
                            current = undefined; // Path broken
                            break;
                        }
                        current = current[part];
                    }
                    output[key] = current;
                } else if (typeof valueMapper === 'function') {
                    output[key] = valueMapper(input);
                }
            }
        }
        return output as TOutput;
    };
}

/**
 * Custom error class for reporting pipeline execution failures.
 */
export class PipelineExecutionError extends Error {
    constructor(
        message: string,
        public stepIndex: number,
        public toolName: string,
        public originalError?: Error
    ) {
        super(`Pipeline execution failed at step ${stepIndex} (${toolName}): ${message}`);
        this.name = 'PipelineExecutionError';
        // Restore prototype chain for proper `instanceof` checks
        Object.setPrototypeOf(this, PipelineExecutionError.prototype);
    }
}

/**
 * The `PipelineExecutor` class is responsible for orchestrating and executing
 * a sequence of AI tools defined as a pipeline. It manages data flow between steps,
 * resolves arguments from a dynamic context, and handles errors gracefully.
 */
export class PipelineExecutor {
    private toolImplementations: ToolImplementations;

    /**
     * Initializes the PipelineExecutor with a map of actual tool function implementations.
     * @param implementations A record where keys are tool names (e.g., 'explainCodeStructured')
     *                        and values are the corresponding callable functions.
     */
    constructor(implementations: ToolImplementations) {
        if (!implementations || Object.keys(implementations).length === 0) {
            console.warn("PipelineExecutor initialized with no tool implementations. Pipelines may fail.");
        }
        this.toolImplementations = implementations;
    }

    /**
     * Resolves an argument value from the current pipeline context.
     * It handles literal values, direct context keys, and dot-notation paths.
     * @param pathOrValue The string path (e.g., "step1.output.summary"), direct context key,
     *                    or a literal value (e.g., true, 123, "SASS").
     * @param context The current pipeline context, containing initial inputs and outputs from previous steps.
     * @returns The resolved argument value. Returns `undefined` if a path is broken.
     */
    private resolveArg(pathOrValue: string | any, context: Record<string, any>): any {
        // If not a string, it's a literal value (number, boolean, object, array), return it directly.
        if (typeof pathOrValue !== 'string') {
            return pathOrValue;
        }

        // If it contains a dot, assume it's a path and try to traverse the context.
        if (pathOrValue.includes('.')) {
            const parts = pathOrValue.split('.');
            let current: any = context;
            for (const part of parts) {
                if (current === null || current === undefined) {
                    return undefined; // Path broken or not found along the way
                }
                if (typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, part)) {
                     return undefined; // Part not found in current object
                }
                current = current[part];
            }
            return current;
        }

        // If it does not contain a dot, check if it's a direct key in the context.
        if (Object.prototype.hasOwnProperty.call(context, pathOrValue)) {
            return context[pathOrValue];
        }

        // If it's a string, not a path, and not a direct context key, treat it as a literal string.
        return pathOrValue;
    }

    /**
     * Executes a defined pipeline asynchronously.
     * The output of each step can be stored in the context for subsequent steps.
     * @param pipeline The `PipelineDefinition` to execute.
     * @param initialContext An optional initial context object, providing inputs to the first steps.
     * @returns A promise that resolves to the final output of the pipeline, or the full context if no specific final output is designated.
     * @throws {PipelineExecutionError} if any tool is not found, a required argument is missing/unresolvable, or a tool execution fails.
     */
    public async execute(pipeline: PipelineDefinition, initialContext: Record<string, any> = {}): Promise<any> {
        // Initialize the pipeline context with initial inputs.
        const context: Record<string, any> = { ...initialContext };
        let currentStepOutput: any = undefined; // Tracks the output of the most recent step

        for (let i = 0; i < pipeline.steps.length; i++) {
            const step = pipeline.steps[i];
            const toolFunc = this.toolImplementations[step.toolName];

            if (!toolFunc) {
                throw new PipelineExecutionError(
                    `Tool '${step.toolName}' not found in provided implementations.`,
                    i,
                    step.toolName
                );
            }

            const toolDefinition = getToolDefinition(step.toolName);
            const callArgs: any[] = [];
            const resolvedArgsLog: Record<string, any> = {}; // For logging/debugging resolved args

            // If a tool definition exists, use its parameter order and types for argument resolution.
            if (toolDefinition && toolDefinition.signature && toolDefinition.signature.parameters) {
                for (const param of toolDefinition.signature.parameters) {
                    let argValue;
                    if (Object.prototype.hasOwnProperty.call(step.argsMap, param.name)) {
                        argValue = this.resolveArg(step.argsMap[param.name], context);
                    } else if (!param.optional) {
                        // If a required parameter is not mapped and not optional, it's an error.
                        throw new PipelineExecutionError(
                            `Required argument '${param.name}' for tool '${step.toolName}' is missing in argsMap or could not be resolved.`,
                            i,
                            step.toolName
                        );
                    }
                    // If argValue is explicitly undefined and not optional, it's an error.
                    if (argValue === undefined && !param.optional && !Object.prototype.hasOwnProperty.call(step.argsMap, param.name)) {
                         throw new PipelineExecutionError(
                            `Required argument '${param.name}' for tool '${step.toolName}' could not be resolved from context.`,
                            i,
                            step.toolName
                        );
                    }
                    callArgs.push(argValue);
                    resolvedArgsLog[param.name] = argValue;
                }
            } else {
                // Fallback: If no tool definition or parameters are available, pass arguments positionally
                // based on the order of keys in argsMap. This is less robust.
                console.warn(
                    `Tool definition for '${step.toolName}' not found or has no parameters. ` +
                    `Passing arguments positionally from argsMap values. Consider defining ToolDefinition for robustness.`
                );
                for (const paramName in step.argsMap) {
                    if (Object.prototype.hasOwnProperty.call(step.argsMap, paramName)) {
                        const argValue = this.resolveArg(step.argsMap[paramName], context);
                        callArgs.push(argValue);
                        resolvedArgsLog[paramName] = argValue;
                    }
                }
            }

            try {
                // Log invocation for debugging/auditing
                console.log(`Executing pipeline step ${i + 1}/${pipeline.steps.length}: '${step.toolName}' with resolved arguments:`, resolvedArgsLog);
                currentStepOutput = await toolFunc(...callArgs);
                console.log(`Step ${i + 1} ('${step.toolName}') completed successfully. Output type: ${typeof currentStepOutput}`);

                // Store the output in the context, using the specified outputKey or as 'last_output'.
                if (step.outputKey) {
                    context[step.outputKey] = currentStepOutput;
                }
                context['last_output'] = currentStepOutput; // Always make the last output available
            } catch (error: any) {
                throw new PipelineExecutionError(
                    error.message || 'Unknown error during tool execution',
                    i,
                    step.toolName,
                    error instanceof Error ? error : new Error(String(error))
                );
            }
        }

        // Determine the final return value of the pipeline
        if (pipeline.finalOutputKey && Object.prototype.hasOwnProperty.call(context, pipeline.finalOutputKey)) {
            return context[pipeline.finalOutputKey];
        } else if (currentStepOutput !== undefined) {
            return currentStepOutput; // Return the output of the last step if no finalOutputKey
        }
        // If no specific final output key or last step output, return the full context.
        return context;
    }
}

/**
 * Generates the documentation string for pipeline tools from a structured array of `ToolDefinition`s.
 * This function can be used to keep `PIPELINE_TOOLS_DOCUMENTATION` consistent with `TOOL_DEFINITIONS`.
 * @param definitions An array of `ToolDefinition` objects.
 * @returns A string formatted similarly to `PIPELINE_TOOLS_DOCUMENTATION`.
 */
export function generatePipelineToolsDocumentation(definitions: ToolDefinition[]): string {
    let doc = `
/*
 * Available Tools for Pipeline Generation
 *
 * You must import any of these functions from './services/index.ts'.
 * You must construct a pipeline that logically chains these functions together.
 * The output of one step should be used as the input for the next.
 * You may need to transform the data between steps. The final function should be named \`runPipeline\`.
 */
`;

    definitions.forEach(tool => {
        doc += `
/**
 * ${tool.description}`;
        tool.signature.parameters.forEach(param => {
            doc += `
 * @param {${param.type}${param.optional ? '?' : ''}} ${param.name} - ${param.description}`;
        });
        doc += `
 * @returns {${tool.signature.returnType}} A promise resolving to an object with theme colors.`; // Keeping the original generic description for consistency with existing doc
        doc += `
 */
// import { ${tool.name} } from './services/index.ts';
// signature: ${tool.name}(${tool.signature.parameters.map(p => `${p.name}: ${p.type.replace(/^Promise<(.+)>$/, '$1').replace(/\?$/, '')}`).join(', ')}): ${tool.signature.returnType}
`;
    });

    return doc;
}