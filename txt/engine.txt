// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { generateJson } from '../services/geminiCore';
import type { Feature } from '../types';
import type { SemanticFeature, FeatureCatalog } from './types';
import { Type } from "@google/genai";

// Enhanced semantic feature schema for more detailed analysis and workflow planning.
const semanticFeatureSchema = {
    type: Type.OBJECT,
    properties: {
        purpose: { 
            type: Type.STRING, 
            description: "A concise, one-sentence summary of what this tool's primary function is." 
        },
        expectedInput: { 
            type: Type.STRING, 
            description: "A short phrase describing the main type of data this tool takes as input (e.g., 'code snippet', 'natural language prompt', 'image data')."
        },
        inputSchemaHint: { // New property
            type: Type.STRING,
            description: "A brief, informal hint about the structure or format of the expected input (e.g., 'JSON object with 'query' field', 'base64 encoded image', 'plain text string')."
        },
        primaryOutput: {
            type: Type.STRING,
            description: "A short phrase describing the main type of data this tool produces (e.g., 'markdown report', 'generated code', 'JSON object')."
        },
        outputSchemaHint: { // New property
            type: Type.STRING,
            description: "A brief, informal hint about the structure or format of the primary output (e.g., 'JSON object with 'result' and 'confidence' fields', 'XML document', 'URL to a generated file')."
        },
        potentialConnections: {
            type: Type.ARRAY,
            description: "An array of 2-3 other tool IDs that could logically follow this one in a workflow, based on its output.",
            items: { type: Type.STRING }
        },
        categoryTags: { // New property
            type: Type.ARRAY,
            description: "An array of relevant keywords or categories that describe the tool's domain or function (e.g., 'AI', 'NLP', 'image processing', 'data analysis', 'utility').",
            items: { type: Type.STRING }
        }
    },
    required: ["purpose", "expectedInput", "inputSchemaHint", "primaryOutput", "outputSchemaHint", "potentialConnections", "categoryTags"] // Updated required fields
};

/**
 * Represents a single step in a recommended workflow.
 */
export interface WorkflowStep {
    feature: SemanticFeature;
    stepNumber: number;
    description: string; // A concise description of this step in the context of the workflow.
}

/**
 * Represents a complete recommended workflow, a sequence of interconnected features.
 */
export interface RecommendedWorkflow {
    id: string; // Unique ID for this recommended workflow
    steps: WorkflowStep[];
    startFeatureId: string | null;
    targetOutputType: string;
    score?: number; // Optional score indicating relevance or confidence
    summary: string; // A high-level summary of what the workflow achieves.
}

/**
 * The AlchemistEngine is responsible for ingesting raw feature definitions
 * and transforming them into a semantically rich, interconnected catalog of tools.
 * This catalog forms the foundation for intelligent workflow orchestration.
 */
export class AlchemistEngine {
    private catalog: FeatureCatalog = {};
    private isBuildingCatalog: boolean = false; // Flag to prevent concurrent catalog builds

    constructor() {
        console.log("Alchemist Engine awakening... Ready to transmute features into intelligence.");
    }

    /**
     * Analyzes a list of features to build or update a semantic catalog of the application's capabilities.
     * This process leverages advanced AI to understand each tool's function and potential connections.
     * @param features - An array of Feature objects to be cataloged or updated.
     * @param forceReanalyze - If true, existing features in the catalog will be re-analyzed.
     * @returns A promise that resolves to the fully built or updated FeatureCatalog.
     */
    async buildCatalog(features: Feature[], forceReanalyze: boolean = false): Promise<FeatureCatalog> {
        if (this.isBuildingCatalog) {
            console.warn("Catalog build already in progress. Skipping new request.");
            return this.catalog;
        }

        this.isBuildingCatalog = true;
        console.log(`Starting catalog build for ${features.length} features...`);
        const systemInstruction = `You are an expert software architect analyzing a developer toolkit. Your task is to understand what each tool does, its precise input/output types, and how it might logically connect to others. Provide detailed semantic properties.`;

        const newFeaturesAdded: string[] = [];
        const featuresUpdated: string[] = [];
        const featuresSkipped: string[] = [];

        for (const feature of features) {
            if (this.catalog[feature.id] && !forceReanalyze) {
                featuresSkipped.push(feature.name);
                continue; // Skip if already cataloged and not forced to re-analyze
            }

            const prompt = `Analyze the following tool to determine its semantic properties, including precise input/output hints and logical connections to other tools:\n\nName: "${feature.name}"\nDescription: "${feature.description}"\nCategory: "${feature.category}"\n\nBased on this information, provide its semantic properties. Ensure 'potentialConnections' contains IDs of tools whose expectedInput matches this tool's primaryOutput, or tools that logically extend its function.`;
            
            try {
                // The generateJson function now expects a schema that includes the new properties
                const analysisResult = await generateJson<Omit<SemanticFeature, 'id' | 'name'>>(
                    prompt,
                    systemInstruction,
                    semanticFeatureSchema
                );
                
                // Ensure potentialConnections is an array of strings, even if AI returns null/undefined
                if (!Array.isArray(analysisResult.potentialConnections)) {
                    analysisResult.potentialConnections = [];
                }
                analysisResult.potentialConnections = analysisResult.potentialConnections.map(id => String(id));

                // Ensure categoryTags is an array of strings
                if (!Array.isArray(analysisResult.categoryTags)) {
                    analysisResult.categoryTags = [];
                }
                analysisResult.categoryTags = analysisResult.categoryTags.map(tag => String(tag));


                if (this.catalog[feature.id]) {
                    featuresUpdated.push(feature.name);
                } else {
                    newFeaturesAdded.push(feature.name);
                }

                this.catalog[feature.id] = {
                    id: feature.id,
                    name: feature.name,
                    ...analysisResult,
                };
                console.log(`Successfully analyzed and cataloged: ${feature.name}`);

            } catch (error) {
                console.error(`Failed to analyze feature "${feature.name}":`, error);
            }
        }
        this.isBuildingCatalog = false;
        console.log(`Catalog build complete. Added: ${newFeaturesAdded.length}, Updated: ${featuresUpdated.length}, Skipped: ${featuresSkipped.length}.`);
        return this.catalog;
    }

    /**
     * Clears the entire feature catalog. Use with caution.
     */
    public clearCatalog(): void {
        this.catalog = {};
        console.log("Alchemist Engine catalog has been reset.");
    }

    /**
     * Retrieves the current state of the feature catalog.
     * @returns The current FeatureCatalog.
     */
    public getCatalog(): FeatureCatalog {
        return this.catalog;
    }

    /**
     * Retrieves a specific semantic feature from the catalog by its ID.
     * @param featureId The ID of the feature to retrieve.
     * @returns The SemanticFeature object or undefined if not found.
     */
    public getFeatureById(featureId: string): SemanticFeature | undefined {
        return this.catalog[featureId];
    }

    /**
     * Initiates an update or re-analysis for a single feature.
     * This is useful for incremental updates without rebuilding the entire catalog.
     * @param feature The Feature object to update.
     * @returns A promise that resolves when the feature has been updated in the catalog.
     */
    public async updateFeature(feature: Feature): Promise<void> {
        console.log(`Updating feature: ${feature.name} (ID: ${feature.id})...`);
        const systemInstruction = `You are an expert software architect analyzing a developer toolkit. Your task is to understand what each tool does, its precise input/output types, and how it might logically connect to others. Provide detailed semantic properties.`;
        const prompt = `Re-analyze the following tool to determine its updated semantic properties, including precise input/output hints and logical connections to other tools:\n\nName: "${feature.name}"\nDescription: "${feature.description}"\nCategory: "${feature.category}"\n\nBased on this information, provide its semantic properties. Ensure 'potentialConnections' contains IDs of tools whose expectedInput matches this tool's primaryOutput, or tools that logically extend its function.`;

        try {
            const analysisResult = await generateJson<Omit<SemanticFeature, 'id' | 'name'>>(
                prompt,
                systemInstruction,
                semanticFeatureSchema
            );

            // Ensure potentialConnections is an array of strings
            if (!Array.isArray(analysisResult.potentialConnections)) {
                analysisResult.potentialConnections = [];
            }
            analysisResult.potentialConnections = analysisResult.potentialConnections.map(id => String(id));

            // Ensure categoryTags is an array of strings
            if (!Array.isArray(analysisResult.categoryTags)) {
                analysisResult.categoryTags = [];
            }
            analysisResult.categoryTags = analysisResult.categoryTags.map(tag => String(tag));

            this.catalog[feature.id] = {
                id: feature.id,
                name: feature.name,
                ...analysisResult,
            };
            console.log(`Feature "${feature.name}" successfully updated.`);
        } catch (error) {
            console.error(`Failed to update feature "${feature.name}":`, error);
            throw new Error(`Failed to update feature: ${feature.name}`);
        }
    }
}

/**
 * Utility function to find features in a catalog by a keyword across various fields.
 * @param catalog The FeatureCatalog to search within.
 * @param keyword The keyword to search for (case-insensitive).
 * @returns An array of matching SemanticFeature objects.
 */
export function findFeaturesByKeyword(catalog: FeatureCatalog, keyword: string): SemanticFeature[] {
    const lowerKeyword = keyword.toLowerCase();
    return Object.values(catalog).filter(feature =>
        feature.name.toLowerCase().includes(lowerKeyword) ||
        feature.description.toLowerCase().includes(lowerKeyword) ||
        feature.purpose.toLowerCase().includes(lowerKeyword) ||
        feature.expectedInput.toLowerCase().includes(lowerKeyword) ||
        feature.primaryOutput.toLowerCase().includes(lowerKeyword) ||
        feature.inputSchemaHint.toLowerCase().includes(lowerKeyword) ||
        feature.outputSchemaHint.toLowerCase().includes(lowerKeyword) ||
        feature.categoryTags.some(tag => tag.toLowerCase().includes(lowerKeyword))
    );
}

/**
 * Utility function to find features in a catalog by their expected input type.
 * @param catalog The FeatureCatalog to search within.
 * @param inputType The input type to match (case-insensitive).
 * @returns An array of matching SemanticFeature objects.
 */
export function findFeaturesByInputType(catalog: FeatureCatalog, inputType: string): SemanticFeature[] {
    const lowerInputType = inputType.toLowerCase();
    return Object.values(catalog).filter(feature =>
        feature.expectedInput.toLowerCase().includes(lowerInputType)
    );
}

/**
 * Utility function to find features in a catalog by their primary output type.
 * @param catalog The FeatureCatalog to search within.
 * @param outputType The output type to match (case-insensitive).
 * @returns An array of matching SemanticFeature objects.
 */
export function findFeaturesByOutputType(catalog: FeatureCatalog, outputType: string): SemanticFeature[] {
    const lowerOutputType = outputType.toLowerCase();
    return Object.values(catalog).filter(feature =>
        feature.primaryOutput.toLowerCase().includes(lowerOutputType)
    );
}

/**
 * Utility function to find features by category tags.
 * @param catalog The FeatureCatalog to search within.
 * @param tag The category tag to match (case-insensitive).
 * @returns An array of matching SemanticFeature objects.
 */
export function findFeaturesByCategoryTag(catalog: FeatureCatalog, tag: string): SemanticFeature[] {
    const lowerTag = tag.toLowerCase();
    return Object.values(catalog).filter(feature =>
        feature.categoryTags.some(ftag => ftag.toLowerCase().includes(lowerTag))
    );
}

/**
 * The WorkflowOrchestrator takes a pre-built FeatureCatalog and provides
 * capabilities to suggest and construct intelligent workflows.
 * It leverages the semantic connections identified by the AlchemistEngine.
 */
export class WorkflowOrchestrator {
    private catalog: FeatureCatalog;

    constructor(catalog: FeatureCatalog) {
        if (!catalog || Object.keys(catalog).length === 0) {
            console.warn("WorkflowOrchestrator initialized with an empty or undefined catalog. Workflow recommendations may be limited.");
        }
        this.catalog = catalog;
        console.log("Workflow Orchestrator ready to craft intelligent sequences.");
    }

    /**
     * Updates the internal catalog of the orchestrator. This is useful if the AlchemistEngine
     * has updated its catalog and the orchestrator needs to reflect those changes.
     * @param newCatalog The updated FeatureCatalog.
     */
    public updateCatalog(newCatalog: FeatureCatalog): void {
        this.catalog = newCatalog;
        console.log("Workflow Orchestrator catalog updated.");
    }

    /**
     * Recommends a workflow (sequence of features) to achieve a target output type,
     * starting from an optional initial feature. This uses a breadth-first search-like approach.
     * @param startFeatureId The ID of the starting feature. If null, any feature producing the targetOutputType or with a matching input hint can start.
     * @param targetOutputType The desired primary output type of the final feature in the workflow.
     * @param maxSteps The maximum number of steps allowed in the recommended workflow. Defaults to 5.
     * @returns A RecommendedWorkflow object or null if no path is found.
     */
    public recommendWorkflow(
        startFeatureId: string | null,
        targetOutputType: string,
        maxSteps: number = 5
    ): RecommendedWorkflow | null {
        console.log(`Attempting to recommend workflow: Start=${startFeatureId || 'Any'}, TargetOutput='${targetOutputType}', MaxSteps=${maxSteps}`);

        if (maxSteps <= 0) {
            console.warn("maxSteps must be greater than 0.");
            return null;
        }

        const targetOutputLower = targetOutputType.toLowerCase();
        const queue: { path: SemanticFeature[], visited: Set<string> }[] = [];
        const initialVisited = new Set<string>();

        // 1. Initialize the queue with starting points
        if (startFeatureId) {
            const startFeature = this.catalog[startFeatureId];
            if (startFeature) {
                if (startFeature.primaryOutput.toLowerCase().includes(targetOutputLower)) {
                    // Direct match for target output from start feature
                    console.log(`Direct match found for target output from start feature ${startFeature.name}.`);
                    return this._buildRecommendedWorkflow(null, targetOutputType, [startFeature]);
                }
                initialVisited.add(startFeature.id);
                queue.push({ path: [startFeature], visited: initialVisited });
            } else {
                console.warn(`Starting feature with ID "${startFeatureId}" not found in catalog.`);
                return null;
            }
        } else {
            // If no startFeatureId, consider all features as potential starting points
            for (const feature of Object.values(this.catalog)) {
                if (feature.primaryOutput.toLowerCase().includes(targetOutputLower)) {
                     // Direct match
                    console.log(`Direct match found for target output from feature ${feature.name} (no explicit start).`);
                    return this._buildRecommendedWorkflow(null, targetOutputType, [feature]);
                }
                queue.push({ path: [feature], visited: new Set([feature.id]) });
            }
        }

        while (queue.length > 0) {
            const { path, visited } = queue.shift()!;
            const currentFeature = path[path.length - 1];

            if (path.length >= maxSteps) {
                continue; // Path too long
            }

            // Check if current feature's output matches target
            if (currentFeature.primaryOutput.toLowerCase().includes(targetOutputLower)) {
                console.log(`Workflow found reaching target output: ${path.map(f => f.name).join(' -> ')}`);
                return this._buildRecommendedWorkflow(startFeatureId, targetOutputType, path);
            }

            // Explore potential connections
            for (const nextFeatureId of currentFeature.potentialConnections) {
                const nextFeature = this.catalog[nextFeatureId];
                if (nextFeature && !visited.has(nextFeature.id)) {
                    // Basic check: Does the next feature's expected input roughly match the current feature's primary output?
                    // This is a heuristic; more advanced matching might be needed in a real system.
                    const inputOutputMatch = nextFeature.expectedInput.toLowerCase().includes(currentFeature.primaryOutput.toLowerCase()) ||
                                             currentFeature.primaryOutput.toLowerCase().includes(nextFeature.expectedInput.toLowerCase()) ||
                                             (nextFeature.inputSchemaHint && currentFeature.outputSchemaHint && 
                                              nextFeature.inputSchemaHint.toLowerCase().includes(currentFeature.outputSchemaHint.toLowerCase()));

                    if (inputOutputMatch) {
                        const newVisited = new Set(visited);
                        newVisited.add(nextFeature.id);
                        queue.push({ path: [...path, nextFeature], visited: newVisited });
                    }
                }
            }
        }

        console.log(`No workflow found for target output '${targetOutputType}' within ${maxSteps} steps.`);
        return null; // No workflow found
    }

    /**
     * A private helper method to construct the RecommendedWorkflow object.
     * @param startFeatureId The ID of the starting feature.
     * @param targetOutputType The target output type.
     * @param path The sequence of SemanticFeature objects forming the path.
     * @returns A fully constructed RecommendedWorkflow.
     */
    private _buildRecommendedWorkflow(startFeatureId: string | null, targetOutputType: string, path: SemanticFeature[]): RecommendedWorkflow {
        const workflowSteps: WorkflowStep[] = path.map((feature, index) => ({
            feature: feature,
            stepNumber: index + 1,
            description: `Step ${index + 1}: Use "${feature.name}" to process ${index === 0 ? (startFeatureId ? 'initial input' : 'incoming data') : path[index-1].primaryOutput} into ${feature.primaryOutput}.`
        }));

        const summary = `Workflow from ${startFeatureId ? this.catalog[startFeatureId]?.name : 'an inferred start'} to produce "${targetOutputType}". Steps: ${path.map(f => f.name).join(' -> ')}.`;

        return {
            id: `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            steps: workflowSteps,
            startFeatureId: startFeatureId,
            targetOutputType: targetOutputType,
            summary: summary,
            score: path.length > 0 ? 100 / path.length : 0 // Simple scoring: shorter paths are better
        };
    }

    /**
     * Executes a given workflow by calling a callback for each step.
     * In a real system, this would involve actual API calls or logic execution.
     * @param workflow The RecommendedWorkflow to execute.
     * @param executeStepCallback A callback function that takes a WorkflowStep and an optional input, and returns a promise for the step's output.
     * @param initialInput Optional initial input for the first step of the workflow.
     * @returns A promise that resolves to the final output of the workflow.
     */
    public async executeWorkflow<TInput, TOutput>(
        workflow: RecommendedWorkflow,
        executeStepCallback: (step: WorkflowStep, input: any) => Promise<any>,
        initialInput: TInput | null = null
    ): Promise<TOutput | null> {
        console.log(`Executing workflow ID: ${workflow.id}`);
        let currentOutput: any = initialInput;

        for (const step of workflow.steps) {
            console.log(`Executing step ${step.stepNumber}: ${step.feature.name}`);
            try {
                currentOutput = await executeStepCallback(step, currentOutput);
                console.log(`Step ${step.stepNumber} output:`, currentOutput);
            } catch (error) {
                console.error(`Workflow execution failed at step ${step.stepNumber} (${step.feature.name}):`, error);
                throw new Error(`Workflow execution failed at step ${step.stepNumber}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        console.log(`Workflow ID ${workflow.id} completed successfully.`);
        return currentOutput as TOutput;
    }

    /**
     * Provides a high-level summary of the features available in the catalog,
     * organized by their primary output types.
     * @returns A structured object summarizing the catalog.
     */
    public getCatalogSummary(): { totalFeatures: number, outputTypeCounts: Record<string, number>, inputTypeCounts: Record<string, number>, categoryCounts: Record<string, number> } {
        const totalFeatures = Object.keys(this.catalog).length;
        const outputTypeCounts: Record<string, number> = {};
        const inputTypeCounts: Record<string, number> = {};
        const categoryCounts: Record<string, number> = {};

        for (const feature of Object.values(this.catalog)) {
            outputTypeCounts[feature.primaryOutput] = (outputTypeCounts[feature.primaryOutput] || 0) + 1;
            inputTypeCounts[feature.expectedInput] = (inputTypeCounts[feature.expectedInput] || 0) + 1;
            feature.categoryTags.forEach(tag => {
                categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
            });
        }

        return {
            totalFeatures,
            outputTypeCounts,
            inputTypeCounts,
            categoryCounts
        };
    }
}