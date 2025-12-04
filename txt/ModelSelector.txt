```typescript
// google/ai_studio/components/ModelSelector.tsx
// The Pantheon. A list of the available minds, each with its own strengths and purpose.

import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';

// --- I. Core Data Interfaces for the Model Universe ---

/**
 * Represents a specific capability of an AI model.
 */
export interface ICapability {
    id: string;
    name: string;
    description: string;
    icon?: string; // e.g., 'text-generation', 'image-synthesis', 'code-completion'
    category?: 'core' | 'extended' | 'domain-specific';
}

/**
 * Represents a domain or industry where a model is applicable.
 */
export interface IDomain {
    id: string;
    name: string;
    description: string;
    color?: string; // For UI display
}

/**
 * Represents a specific use case for a model.
 */
export interface IUseCase {
    id: string;
    name: string;
    description: string;
    exampleQueries?: string[]; // Example prompts for this use case
}

/**
 * Represents a tag for categorizing models.
 */
export interface ITag {
    id: string;
    name: string;
    color?: string; // e.g., 'blue', 'green', '#FF5733'
    type?: 'technical' | 'application' | 'performance'; // e.g., 'small', 'multilingual', 'fast'
}

/**
 * Represents pricing information for a model.
 */
export interface IPricing {
    inputTokenCostPerMillion?: number; // e.g., USD
    outputTokenCostPerMillion?: number;
    imageGenerationCostPerImage?: number;
    videoGenerationCostPerSecond?: number;
    audioGenerationCostPerMinute?: number;
    embeddingCostPerMillion?: number;
    unit: string; // e.g., 'USD'
    modelCallCost?: number; // per API call
    freeTierAvailable: boolean;
    currencySymbol: string;
}

/**
 * Represents performance metrics for a model.
 */
export interface IPerformanceMetrics {
    latencyMs: { p50: number; p90: number; p99: number; }; // Percentiles for latency
    throughputTokensPerSecond: number; // For text models
    accuracyScore?: number; // e.g., 0-1.0
    robustnessScore?: number; // 0-1.0
    f1Score?: number; // For classification tasks
    bleuScore?: number; // For text generation
    fidScore?: number; // For image generation
    inferenceCostPerUnit?: number; // Dynamic cost calculation based on actual usage
    maxConcurrentRequests?: number;
    coldStartLatencyMs?: number;
}

/**
 * Represents safety and ethical considerations for a model.
 */
export interface ISafetyEthicalMetrics {
    harmfulContentScore: number; // 0-1.0, lower is better
    biasScores: {
        gender?: number;
        race?: number;
        age?: number;
        political?: number;
        general?: number;
    };
    transparencyScore: number; // 0-1.0, how transparent its workings/data are
    explainabilityScore: number; // 0-1.0, how easily its outputs can be explained
    dataPrivacyCompliance: string[]; // e.g., ['GDPR', 'CCPA', 'HIPAA']
    responsibleAIGuidelinesAdherence: string[]; // e.g., ['Fairness', 'Safety', 'Privacy', 'Accountability']
    riskAssessmentLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigationStrategies?: string[]; // Descriptions of how risks are addressed
}

/**
 * Represents version details for a model.
 */
export interface IModelVersion {
    version: string;
    releaseDate: string; // ISO string
    changelogUrl?: string;
    status: 'stable' | 'beta' | 'deprecated' | 'experimental' | 'preview';
    breakingChanges?: string[];
    migrationGuideUrl?: string;
    performanceImprovements?: string[];
    bugFixes?: string[];
    featuresAdded?: string[];
    securityPatches?: string[];
}

/**
 * Represents an AI model provider.
 */
export interface IProvider {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    websiteUrl?: string;
    termsOfServiceUrl?: string;
    privacyPolicyUrl?: string;
    contactEmail?: string;
    regionAvailability: string[]; // e.g., ['US', 'EU', 'APAC']
}

/**
 * Represents a full AI model with all its metadata.
 */
export interface IModel {
    id: string;
    uniqueName: string; // e.g., 'google/gemini-pro-1.5-flash-20240723'
    displayName: string; // e.g., 'Gemini Pro 1.5 Flash (latest)'
    description: string;
    longDescription?: string; // More detailed markdown content
    provider: IProvider;
    currentVersion: IModelVersion;
    allVersions: IModelVersion[];
    capabilities: ICapability[];
    inputModalities: string[]; // e.g., ['text', 'image', 'audio', 'video']
    outputModalities: string[]; // e.g., ['text', 'image', 'audio', 'video']
    supportedLanguages: string[]; // ISO 639-1 codes, e.g., ['en', 'es', 'fr']
    domains: IDomain[];
    useCases: IUseCase[];
    tags: ITag[];
    pricing: IPricing;
    performance: IPerformanceMetrics;
    safetyEthical: ISafetyEthicalMetrics;
    documentationUrl?: string;
    apiReferenceUrl?: string;
    playgroundUrl?: string;
    learnMoreUrl?: string;
    recommendedFor?: string[]; // e.g., ['low-latency-chatbots', 'creative-writing']
    deprecatedDate?: string; // ISO string
    status: 'available' | 'limited-access' | 'soon' | 'deprecated' | 'experimental';
    isCustomizable: boolean; // Can this model be fine-tuned?
    isCommunityContributed: boolean; // Is it an open-source model?
    rating?: number; // 0-5 stars
    reviewCount?: number;
    communityForumUrl?: string;
    releaseNotesUrl?: string;
    inferenceEndpointUrl?: string; // Default or recommended endpoint
    licensingInfo?: string; // e.g., 'Proprietary', 'Apache-2.0', 'MIT'
    hardwareRequirements?: string; // for self-hosting options (e.g., '8GB VRAM GPU')
    carbonFootprintEstimate?: 'very-low' | 'low' | 'medium' | 'high' | 'very-high' | 'user-dependent';
    integrationGuides?: { platform: string; url: string; }[]; // e.g., { platform: 'LangChain', url: '...' }
    exampleCode?: { language: string; snippet: string; description: string; }[];
    relatedModels?: string[]; // IDs of related models
}

/**
 * Represents a fine-tuning job for a model.
 */
export interface IFineTuningJob {
    jobId: string;
    modelId: string; // Base model ID
    baseModelDisplayName: string;
    datasetId: string; // Reference to a dataset
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: string; // ISO string
    endTime?: string; // ISO string
    durationMs?: number;
    costEstimate?: number; // USD
    actualCost?: number;
    metrics?: {
        validationLoss?: number;
        accuracy?: number;
        perplexity?: number;
        // ... other job-specific metrics
    };
    hyperparameters: Record<string, any>;
    fineTunedModelId?: string; // ID of the resulting custom model
    fineTunedModelName?: string; // Display name of the resulting custom model
    logsUrl?: string;
    createdBy?: string; // User ID
    createdAt: string; // ISO string
    callbackUrl?: string; // Webhook for completion
}

/**
 * Represents a deployment configuration for a model.
 */
export interface IDeploymentConfig {
    deploymentId: string;
    modelId: string;
    version: string; // Model version being deployed
    region: string; // e.g., 'us-central1', 'europe-west4'
    scalingConfig: {
        minNodes: number;
        maxNodes: number;
        autoScaleEnabled: boolean;
        targetMetric?: 'cpu_utilization' | 'qps' | 'latency';
        targetValue?: number;
    };
    status: 'provisioning' | 'deployed' | 'updating' | 'failed' | 'deleted' | 'scaling';
    endpointUrl: string;
    creationDate: string; // ISO string
    lastUpdated: string; // ISO string
    costEstimatePerHour: number; // USD
    actualCostPerHour?: number;
    accessControlList: string[]; // User IDs or group IDs with access
    healthStatus: 'healthy' | 'unhealthy' | 'degraded';
    monitoringDashboardUrl?: string;
    alertsConfig?: { type: 'email' | 'slack'; threshold: number; };
    loadBalancerConfig?: { type: string; };
    customDomain?: string;
    sslEnabled: boolean;
}

/**
 * Represents an experiment (e.g., A/B test) for models.
 */
export interface IExperiment {
    experimentId: string;
    name: string;
    description: string;
    status: 'draft' | 'running' | 'completed' | 'paused' | 'archived';
    startTime: string;
    endTime?: string;
    variants: {
        variantName: string;
        modelId: string;
        trafficSplit: number; // e.g., 0.5 for 50%
        deploymentId?: string; // If using a specific deployment
        customConfig?: Record<string, any>; // Specific configs for this variant
    }[];
    metricsToTrack: string[]; // e.g., ['response_latency', 'accuracy', 'user_satisfaction']
    resultsSummary?: Record<string, any>; // Aggregated results
    dashboardUrl?: string;
    createdBy?: string;
    createdAt: string;
    targetAudience?: string;
}

/**
 * Represents a dataset used for fine-tuning or evaluation.
 */
export interface IDataset {
    id: string;
    name: string;
    description: string;
    type: 'text' | 'image' | 'audio' | 'video' | 'multimodal' | 'code';
    sizeBytes: number;
    recordCount: number;
    uploadDate: string; // ISO string
    owner: string; // User or team ID
    accessControl: string[]; // User IDs or group IDs with access
    storageLocation: string; // e.g., 'gs://my-bucket/dataset-v1'
    schema?: Record<string, string>; // e.g., { 'prompt': 'string', 'completion': 'string' }
    previewUrl?: string;
    dataFormat: string; // e.g., 'JSONL', 'CSV', 'TFRecord'
    validationStatus: 'pending' | 'validated' | 'failed' | 'warning';
    lastValidated?: string;
    tags?: string[];
}

/**
 * Represents a tool or function that an agentic model can call.
 */
export interface ITool {
    id: string;
    name: string;
    description: string;
    schema: Record<string, any>; // OpenAPI schema for the tool
    endpoint: string;
    parameters: {
        name: string;
        type: string;
        description: string;
        required: boolean;
    }[];
    iconUrl?: string;
    provider?: string;
    tags?: string[];
}

/**
 * Represents an Agentic Workflow or Composition of models/tools.
 */
export interface IAgenticWorkflow {
    id: string;
    name: string;
    description: string;
    modelsUsed: string[]; // IDs of models involved
    toolsUsed: string[]; // IDs of tools involved
    steps: {
        order: number;
        type: 'model_call' | 'tool_call' | 'decision_node' | 'human_in_loop';
        refId: string; // Model ID or Tool ID
        logic?: string; // pseudo-code or description
    }[];
    status: 'draft' | 'active' | 'archived';
    version: string;
    createdBy: string;
    createdAt: string;
    lastUpdated: string;
    diagramUrl?: string; // Link to a visual representation of the workflow
    playgroundUrl?: string;
}


// --- II. Mock Data Service (Simulating API Calls) ---

// Helper for consistent dates
const now = new Date();
const daysAgo = (days: number) => new Date(now.setDate(now.getDate() - days)).toISOString();

const mockProviders: IProvider[] = [
    {
        id: 'google',
        name: 'Google AI',
        description: 'Pioneering AI research and products.',
        logoUrl: 'https://www.gstatic.com/devrel-devsite/prod/vc3d1f4350529d3c5ed83e18a9010373c224f2249/ai/images/ai-logo.svg',
        websiteUrl: 'https://ai.google/',
        termsOfServiceUrl: 'https://cloud.google.com/terms',
        privacyPolicyUrl: 'https://policies.google.com/privacy',
        contactEmail: 'ai-support@google.com',
        regionAvailability: ['US', 'EU', 'APAC', 'SA'],
    },
    {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Building reliable, interpretable, and steerable AI systems.',
        logoUrl: 'https://www.anthropic.com/images/anthropic-logo.svg',
        websiteUrl: 'https://www.anthropic.com/',
        termsOfServiceUrl: 'https://www.anthropic.com/legal/terms',
        privacyPolicyUrl: 'https://www.anthropic.com/legal/privacy',
        contactEmail: 'support@anthropic.com',
        regionAvailability: ['US', 'EU'],
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'Ensuring that artificial general intelligence benefits all of humanity.',
        logoUrl: 'https://openai.com/assets/images/logo.svg',
        websiteUrl: 'https://openai.com/',
        termsOfServiceUrl: 'https://openai.com/policies/terms-of-use',
        privacyPolicyUrl: 'https://openai.com/policies/privacy-policy',
        contactEmail: 'support@openai.com',
        regionAvailability: ['US', 'EU', 'APAC'],
    },
    {
        id: 'huggingface',
        name: 'Hugging Face',
        description: 'The AI community building the future.',
        logoUrl: 'https://huggingface.co/front/assets/huggingface_logo.svg',
        websiteUrl: 'https://huggingface.co/',
        termsOfServiceUrl: 'https://huggingface.co/terms',
        privacyPolicyUrl: 'https://huggingface.co/privacy',
        contactEmail: 'contact@huggingface.co',
        regionAvailability: ['GLOBAL'],
    },
    {
        id: 'meta',
        name: 'Meta AI',
        description: 'Advancing AI for next-generation social experiences.',
        logoUrl: 'https://about.fb.com/wp-content/uploads/2021/08/Meta_Lockup_23.svg',
        websiteUrl: 'https://ai.meta.com/',
        regionAvailability: ['GLOBAL'], // Primarily open-source for self-hosting
    },
    {
        id: 'stability-ai',
        name: 'Stability AI',
        description: 'The world\'s leading open-source generative AI company.',
        logoUrl: 'https://stability.ai/favicon.ico',
        websiteUrl: 'https://stability.ai/',
        regionAvailability: ['GLOBAL'],
    },
];

const mockCapabilities: ICapability[] = [
    { id: 'text-gen', name: 'Text Generation', description: 'Generates human-like text.', icon: '✍️', category: 'core' },
    { id: 'image-gen', name: 'Image Synthesis', description: 'Creates images from text or other inputs.', icon: '🖼️', category: 'core' },
    { id: 'video-gen', name: 'Video Generation', description: 'Generates video clips.', icon: '🎬', category: 'core' },
    { id: 'audio-gen', name: 'Audio Synthesis', description: 'Creates audio, music, or speech.', icon: '🔊', category: 'core' },
    { id: 'code-gen', name: 'Code Generation', description: 'Writes or completes code.', icon: '💻', category: 'core' },
    { id: 'multimodal', name: 'Multimodal', description: 'Processes and generates across multiple data types (text, image, video, audio).', icon: '🧠', category: 'core' },
    { id: 'reasoning', name: 'Complex Reasoning', description: 'Solves complex problems requiring logical inference.', icon: '💡', category: 'extended' },
    { id: 'summarization', name: 'Summarization', description: 'Condenses long texts into shorter versions.', icon: '📝', category: 'extended' },
    { id: 'translation', name: 'Translation', description: 'Translates text between languages.', icon: '🌍', category: 'extended' },
    { id: 'sentiment', name: 'Sentiment Analysis', description: 'Determines emotional tone of text.', icon: '😊', category: 'domain-specific' },
    { id: 'embedding', name: 'Text Embedding', description: 'Converts text into numerical vectors.', icon: '📊', category: 'technical' },
    { id: 'vision', name: 'Computer Vision', description: 'Analyzes and understands images/videos (e.g., object detection, classification).', icon: '👁️', category: 'extended' },
    { id: 'speech-rec', name: 'Speech Recognition', description: 'Converts spoken language to text.', icon: '🗣️', category: 'extended' },
    { id: 'tool-use', name: 'Tool Use / Function Calling', description: 'Can call external tools or APIs to perform actions.', icon: '🛠️', category: 'technical' },
    { id: 'agentic', name: 'Agentic Behavior', description: 'Capable of planning and executing multi-step tasks.', icon: '🤖', category: 'technical' },
    { id: 'fine-tuning', name: 'Fine-tuning Ready', description: 'Can be adapted with custom data for specific tasks.', icon: '⚙️', category: 'technical' },
    { id: 'real-time', name: 'Real-time Processing', description: 'Optimized for low-latency, real-time applications.', icon: '⚡', category: 'performance' },
];

const mockDomains: IDomain[] = [
    { id: 'creative-arts', name: 'Creative Arts', description: 'Art, music, writing, design.', color: '#FF5733' },
    { id: 'software-dev', name: 'Software Development', description: 'Coding, testing, documentation.', color: '#2196F3' },
    { id: 'customer-svc', name: 'Customer Service', description: 'Chatbots, support automation.', color: '#8BC34A' },
    { id: 'healthcare', name: 'Healthcare', description: 'Diagnostics, research, patient care.', color: '#E91E63' },
    { id: 'finance', name: 'Finance', description: 'Market analysis, fraud detection.', color: '#FFC107' },
    { id: 'education', name: 'Education', description: 'Tutoring, content creation.', color: '#673AB7' },
    { id: 'marketing', name: 'Marketing', description: 'Content generation, ad optimization.', color: '#00BCD4' },
    { id: 'research', name: 'Scientific Research', description: 'Data analysis, hypothesis generation.', color: '#9C27B0' },
    { id: 'legal', name: 'Legal', description: 'Document review, case analysis.', color: '#795548' },
    { id: 'gaming', name: 'Gaming', description: 'NPC behavior, story generation, asset creation.', color: '#F44336' },
];

const mockUseCases: IUseCase[] = [
    { id: 'chatbot', name: 'Intelligent Chatbot', description: 'Conversational AI assistants.', exampleQueries: ['Explain quantum physics.', 'Write a poem about a cat.'] },
    { id: 'content-creation', name: 'Content Generation', description: 'Blogs, articles, social media posts.', exampleQueries: ['Generate a blog post about sustainable living.', 'Write 5 catchy tweets for a new product launch.'] },
    { id: 'image-editing', name: 'AI-Powered Image Editing', description: 'Stylization, inpainting, outpainting.', exampleQueries: ['Remove the background from this image.', 'Change the style of this photo to watercolor.'] },
    { id: 'code-completion', name: 'Code Autocompletion', description: 'Assisting developers with code.', exampleQueries: ['Implement a quicksort algorithm in Python.', 'Generate unit tests for this JavaScript function.'] },
    { id: 'drug-discovery', name: 'Drug Discovery', description: 'Accelerating pharmaceutical research.', exampleQueries: ['Predict the binding affinity of this molecule.', 'Design a novel protein structure for enzyme X.'] },
    { id: 'financial-forecasting', name: 'Financial Forecasting', description: 'Predicting market trends.', exampleQueries: ['Forecast stock prices for AAPL for the next quarter.', 'Analyze market sentiment from recent news.'] },
    { id: 'personalized-learning', name: 'Personalized Learning', description: 'Adaptive educational content.', exampleQueries: ['Create a personalized study plan for calculus.', 'Explain Bayes theorem to a high school student.'] },
    { id: 'virtual-assistant', name: 'Virtual Assistant', description: 'Automating tasks and scheduling.', exampleQueries: ['Summarize my emails from yesterday.', 'Schedule a meeting with John for Tuesday.'] },
    { id: 'medical-imaging-analysis', name: 'Medical Imaging Analysis', description: 'Assisting diagnosis from scans.', exampleQueries: ['Detect anomalies in this X-ray image.', 'Segment the tumor from the MRI scan.'] },
    { id: 'legal-research', name: 'Legal Research', description: 'Automating legal document analysis.', exampleQueries: ['Summarize key points from this legal brief.', 'Find relevant case law for contract dispute X.'] },
];

const mockTags: ITag[] = [
    { id: 'fast', name: 'Fast Inference', color: '#4CAF50', type: 'performance' },
    { id: 'cost-effective', name: 'Cost-Effective', color: '#2196F3', type: 'performance' },
    { id: 'high-quality', name: 'High Quality', color: '#9C27B0', type: 'performance' },
    { id: 'multilingual', name: 'Multilingual', color: '#FF9800', type: 'application' },
    { id: 'small', name: 'Small Model', color: '#795548', type: 'technical' },
    { id: 'large', name: 'Large Model', color: '#607D8B', type: 'technical' },
    { id: 'opensource', name: 'Open Source', color: '#00BCD4', type: 'technical' },
    { id: 'proprietary', name: 'Proprietary', color: '#E91E63', type: 'technical' },
    { id: 'research', name: 'Research-focused', color: '#F44336', type: 'application' },
    { id: 'production-ready', name: 'Production-Ready', color: '#8BC34A', type: 'application' },
    { id: 'on-device', name: 'On-Device Capable', color: '#FFEB3B', type: 'technical' },
    { id: 'quantized', name: 'Quantized', color: '#9E9E9E', type: 'technical' },
];

// A much richer set of models, showcasing diversity
const mockModels: IModel[] = [
    {
        id: 'gemini-2.5-flash-001',
        uniqueName: 'google/gemini-2.5-flash-001',
        displayName: 'Gemini 2.5 Flash',
        description: 'Google\'s fastest and most efficient multimodal model, optimized for high-volume, low-latency applications.',
        longDescription: 'Gemini 2.5 Flash excels at tasks requiring rapid responses, such as chatbots, real-time analytics, and quick content generation. It supports extensive context windows and is highly cost-effective for large-scale deployments. Its multimodal capabilities allow it to process and generate content across text, image, and video.',
        provider: mockProviders[0], // Google AI
        currentVersion: {
            version: '2.5.0-flash-001',
            releaseDate: daysAgo(10).toString(),
            changelogUrl: 'https://ai.google/models/gemini-flash-changelog',
            status: 'stable',
            featuresAdded: ['Improved multimodal understanding', 'Enhanced safety guardrails'],
        },
        allVersions: [
            {
                version: '2.5.0-flash-001',
                releaseDate: daysAgo(10).toString(),
                changelogUrl: 'https://ai.google/models/gemini-flash-changelog',
                status: 'stable',
                featuresAdded: ['Improved multimodal understanding', 'Enhanced safety guardrails'],
            },
            {
                version: '2.0.0-flash-beta',
                releaseDate: daysAgo(150).toString(),
                changelogUrl: 'https://ai.google/models/gemini-flash-beta-changelog',
                status: 'deprecated',
                breakingChanges: ['API endpoint changed', 'Tokenization updates'],
                migrationGuideUrl: 'https://ai.google/models/gemini-flash-migration',
                bugFixes: ['Addressed minor hallucinations'],
            },
        ],
        capabilities: [
            mockCapabilities[0], // Text Generation
            mockCapabilities[1], // Image Synthesis
            mockCapabilities[5], // Multimodal
            mockCapabilities[7], // Summarization
            mockCapabilities[13], // Tool Use
            mockCapabilities[15], // Fine-tuning Ready
            mockCapabilities[16], // Real-time
        ],
        inputModalities: ['text', 'image', 'audio', 'video'],
        outputModalities: ['text', 'image', 'audio'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko'],
        domains: [mockDomains[2], mockDomains[6], mockDomains[0]],
        useCases: [mockUseCases[0], mockUseCases[1], mockUseCases[7]],
        tags: [mockTags[0], mockTags[1], mockTags[3], mockTags[5], mockTags[7], mockTags[9]],
        pricing: {
            inputTokenCostPerMillion: 0.1,
            outputTokenCostPerMillion: 0.2,
            imageGenerationCostPerImage: 0.002,
            unit: 'USD',
            freeTierAvailable: true,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 50, p90: 80, p99: 150 },
            throughputTokensPerSecond: 120000,
            accuracyScore: 0.92,
            robustnessScore: 0.88,
            maxConcurrentRequests: 5000,
            coldStartLatencyMs: 100,
        },
        safetyEthical: {
            harmfulContentScore: 0.05,
            biasScores: { general: 0.1 },
            transparencyScore: 0.7,
            explainabilityScore: 0.65,
            dataPrivacyCompliance: ['GDPR', 'CCPA'],
            responsibleAIGuidelinesAdherence: ['Fairness', 'Safety', 'Privacy'],
            riskAssessmentLevel: 'low',
            mitigationStrategies: ['Reinforcement Learning from Human Feedback (RLHF)', 'Continuous monitoring'],
        },
        documentationUrl: 'https://ai.google/docs/gemini-flash',
        apiReferenceUrl: 'https://ai.google/api/gemini-flash',
        playgroundUrl: 'https://ai.google/gemini-playground',
        learnMoreUrl: 'https://blog.google/technology/ai/gemini-flash-overview/',
        recommendedFor: ['real-time-chat', 'large-scale-summarization', 'multimodal-content-analysis'],
        status: 'available',
        isCustomizable: true,
        isCommunityContributed: false,
        rating: 4.8,
        reviewCount: 1200,
        communityForumUrl: 'https://ai.google/community/gemini',
        releaseNotesUrl: 'https://ai.google/gemini/releasenotes',
        inferenceEndpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        licensingInfo: 'Proprietary, Google Cloud Terms',
        hardwareRequirements: 'Cloud-hosted',
        carbonFootprintEstimate: 'low',
        integrationGuides: [{ platform: 'LangChain', url: 'https://python.langchain.com/docs/integrations/llms/google_generative_ai' }],
        exampleCode: [{ language: 'Python', description: 'Basic text generation', snippet: `import google.generativeai as genai\n\ngenai.configure(api_key="YOUR_API_KEY")\nmodel = genai.GenerativeModel('gemini-2.5-flash')\nresponse = model.generate_content("Hello world!")\nprint(response.text)` }],
    },
    {
        id: 'gemini-1.5-pro-001',
        uniqueName: 'google/gemini-1.5-pro-001',
        displayName: 'Gemini 1.5 Pro',
        description: 'Google\'s most capable general-purpose multimodal model, designed for complex reasoning and long context windows.',
        longDescription: 'Gemini 1.5 Pro features a massive context window (up to 1 million tokens), enabling it to process and analyze incredibly long documents, codebases, or videos. It excels at complex reasoning, multi-turn conversations, and highly accurate content generation. Ideal for advanced R&D and applications requiring deep understanding.',
        provider: mockProviders[0],
        currentVersion: {
            version: '1.5.0-pro-001',
            releaseDate: daysAgo(90).toString(),
            changelogUrl: 'https://ai.google/models/gemini-pro-changelog',
            status: 'stable',
            featuresAdded: ['1M token context window', 'Improved video understanding'],
        },
        allVersions: [
            {
                version: '1.5.0-pro-001',
                releaseDate: daysAgo(90).toString(),
                changelogUrl: 'https://ai.google/models/gemini-pro-changelog',
                status: 'stable',
                featuresAdded: ['1M token context window', 'Improved video understanding'],
            },
            {
                version: '1.0.0-pro-beta',
                releaseDate: daysAgo(250).toString(),
                changelogUrl: 'https://ai.google/models/gemini-pro-beta-changelog',
                status: 'deprecated',
                breakingChanges: ['Context window limit increased significantly'],
            },
        ],
        capabilities: [
            mockCapabilities[0], // Text Generation
            mockCapabilities[1], // Image Synthesis
            mockCapabilities[2], // Video Generation (im)
            mockCapabilities[5], // Multimodal
            mockCapabilities[6], // Reasoning
            mockCapabilities[7], // Summarization
            mockCapabilities[8], // Translation
            mockCapabilities[4], // Code Generation
            mockCapabilities[13], // Tool Use
            mockCapabilities[14], // Agentic
            mockCapabilities[15], // Fine-tuning Ready
        ],
        inputModalities: ['text', 'image', 'audio', 'video'],
        outputModalities: ['text', 'image', 'audio'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'hi', 'pt', 'ru'],
        domains: [mockDomains[1], mockDomains[3], mockDomains[7], mockDomains[0]],
        useCases: [mockUseCases[1], mockUseCases[3], mockUseCases[4], mockUseCases[6], mockUseCases[0]],
        tags: [mockTags[2], mockTags[3], mockTags[5], mockTags[7], mockTags[9]],
        pricing: {
            inputTokenCostPerMillion: 3.5,
            outputTokenCostPerMillion: 10.5,
            imageGenerationCostPerImage: 0.005,
            videoGenerationCostPerSecond: 0.01,
            unit: 'USD',
            freeTierAvailable: false,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 300, p90: 600, p99: 1200 },
            throughputTokensPerSecond: 15000,
            accuracyScore: 0.95,
            robustnessScore: 0.93,
            maxConcurrentRequests: 1000,
            coldStartLatencyMs: 500,
        },
        safetyEthical: {
            harmfulContentScore: 0.03,
            biasScores: { gender: 0.05, race: 0.04, general: 0.06 },
            transparencyScore: 0.8,
            explainabilityScore: 0.75,
            dataPrivacyCompliance: ['GDPR', 'HIPAA', 'CCPA'],
            responsibleAIGuidelinesAdherence: ['Fairness', 'Safety', 'Privacy', 'Accountability'],
            riskAssessmentLevel: 'medium',
            mitigationStrategies: ['Extensive red teaming', 'Ethical AI review board'],
        },
        documentationUrl: 'https://ai.google/docs/gemini-pro',
        apiReferenceUrl: 'https://ai.google/api/gemini-pro',
        playgroundUrl: 'https://ai.google/gemini-playground',
        learnMoreUrl: 'https://blog.google/technology/ai/gemini-1-5-pro-overview/',
        recommendedFor: ['complex-analysis', 'long-document-processing', 'advanced-code-generation'],
        status: 'available',
        isCustomizable: true,
        isCommunityContributed: false,
        rating: 4.9,
        reviewCount: 2500,
        communityForumUrl: 'https://ai.google/community/gemini',
        releaseNotesUrl: 'https://ai.google/gemini/releasenotes',
        inferenceEndpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        licensingInfo: 'Proprietary, Google Cloud Terms',
        hardwareRequirements: 'Cloud-hosted',
        carbonFootprintEstimate: 'medium',
        integrationGuides: [{ platform: 'LangChain', url: 'https://python.langchain.com/docs/integrations/llms/google_generative_ai' }],
        exampleCode: [{ language: 'Python', description: 'Multi-modal prompt with image', snippet: `import google.generativeai as genai\nfrom PIL import Image\n\ngenai.configure(api_key="YOUR_API_KEY")\nmodel = genai.GenerativeModel('gemini-1.5-pro')\nimg = Image.open('cat.jpg')\nresponse = model.generate_content(["Describe this image:", img])\nprint(response.text)` }],
        relatedModels: ['gemini-2.5-flash-001'],
    },
    {
        id: 'imagen-4.0-generate-001',
        uniqueName: 'google/imagen-4.0-generate-001',
        displayName: 'Imagen 4.0 Generate',
        description: 'Google\'s state-of-the-art text-to-image and image-to-image generation model.',
        longDescription: 'Imagen 4.0 Generate produces photorealistic images and supports advanced features like inpainting, outpainting, and style transfer. It is highly capable of understanding nuanced prompts and generating diverse, high-quality visual content. Ideal for creative professionals and marketing teams.',
        provider: mockProviders[0],
        currentVersion: {
            version: '4.0.0-generate-001',
            releaseDate: daysAgo(60).toString(),
            changelogUrl: 'https://ai.google/models/imagen-changelog',
            status: 'stable',
            featuresAdded: ['Improved photorealism', 'New control mechanisms for generation'],
        },
        allVersions: [
            {
                version: '4.0.0-generate-001',
                releaseDate: daysAgo(60).toString(),
                changelogUrl: 'https://ai.google/models/imagen-changelog',
                status: 'stable',
                featuresAdded: ['Improved photorealism', 'New control mechanisms for generation'],
            },
            {
                version: '3.0.0-generate-beta',
                releaseDate: daysAgo(270).toString(),
                changelogUrl: 'https://ai.google/models/imagen-beta-changelog',
                status: 'deprecated',
            },
        ],
        capabilities: [mockCapabilities[1], mockCapabilities[5], mockCapabilities[11]],
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportedLanguages: ['en'],
        domains: [mockDomains[0], mockDomains[6], mockDomains[9]],
        useCases: [mockUseCases[1], mockUseCases[2]],
        tags: [mockTags[2], mockTags[5], mockTags[7], mockTags[9]],
        pricing: {
            imageGenerationCostPerImage: 0.015,
            unit: 'USD',
            freeTierAvailable: false,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 1500, p90: 3000, p99: 5000 },
            throughputTokensPerSecond: 0, // N/A
            accuracyScore: 0.98, // perceptual quality
            fidScore: 12.5, // lower is better
            maxConcurrentRequests: 500,
            coldStartLatencyMs: 2000,
        },
        safetyEthical: {
            harmfulContentScore: 0.07,
            biasScores: { general: 0.15 },
            transparencyScore: 0.6,
            explainabilityScore: 0.5,
            dataPrivacyCompliance: ['GDPR'],
            responsibleAIGuidelinesAdherence: ['Safety', 'Fairness'],
            riskAssessmentLevel: 'medium',
            mitigationStrategies: ['Content moderation filters', 'Bias detection during training'],
        },
        documentationUrl: 'https://ai.google/docs/imagen',
        apiReferenceUrl: 'https://ai.google/api/imagen',
        playgroundUrl: 'https://ai.google/imagen-playground',
        learnMoreUrl: 'https://blog.google/technology/ai/imagen-4-overview/',
        recommendedFor: ['high-fidelity-image-creation', 'marketing-campaigns', 'digital-art'],
        status: 'available',
        isCustomizable: true,
        isCommunityContributed: false,
        rating: 4.7,
        reviewCount: 800,
        communityForumUrl: 'https://ai.google/community/imagen',
        releaseNotesUrl: 'https://ai.google/imagen/releasenotes',
        inferenceEndpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate:generate',
        licensingInfo: 'Proprietary, Google Cloud Terms',
        hardwareRequirements: 'Cloud-hosted',
        carbonFootprintEstimate: 'medium',
        exampleCode: [{ language: 'Python', description: 'Basic image generation', snippet: `from google.cloud import aiplatform\n\naiplatform.init(project="your-project", location="us-central1")\nmodel = aiplatform.ImageGenerationModel.from_pretrained("imagegeneration@latest")\n\nresponse = model.generate_images(prompt="a dog riding a skateboard")\nprint(response.images[0]._image_bytes)` }],
    },
    {
        id: 'veo-2.0-generate-001',
        uniqueName: 'google/veo-2.0-generate-001',
        displayName: 'Veo 2.0 Generate',
        description: 'Google\'s advanced text-to-video generation model, producing high-quality, consistent video clips.',
        longDescription: 'Veo 2.0 Generate enables users to create realistic and stylized videos from text prompts, images, or even other videos. It supports granular control over camera movements, character actions, and scene details, making it a powerful tool for filmmakers, advertisers, and content creators.',
        provider: mockProviders[0],
        currentVersion: {
            version: '2.0.0-generate-001',
            releaseDate: daysAgo(5).toString(),
            changelogUrl: 'https://ai.google/models/veo-changelog',
            status: 'experimental',
            featuresAdded: ['Improved motion control', 'Higher resolution output'],
        },
        allVersions: [
            {
                version: '2.0.0-generate-001',
                releaseDate: daysAgo(5).toString(),
                changelogUrl: 'https://ai.google/models/veo-changelog',
                status: 'experimental',
                featuresAdded: ['Improved motion control', 'Higher resolution output'],
            },
        ],
        capabilities: [mockCapabilities[2], mockCapabilities[5], mockCapabilities[11]],
        inputModalities: ['text', 'image', 'video'],
        outputModalities: ['video'],
        supportedLanguages: ['en'],
        domains: [mockDomains[0], mockDomains[6], mockDomains[9]],
        useCases: [mockUseCases[1]],
        tags: [mockTags[2], mockTags[5], mockTags[7], mockTags[8]],
        pricing: {
            videoGenerationCostPerSecond: 0.05,
            unit: 'USD',
            freeTierAvailable: false,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 10000, p90: 20000, p99: 30000 }, // Video takes longer
            throughputTokensPerSecond: 0,
            accuracyScore: 0.90, // perceptual quality
            maxConcurrentRequests: 100,
            coldStartLatencyMs: 5000,
        },
        safetyEthical: {
            harmfulContentScore: 0.1,
            biasScores: { general: 0.2 },
            transparencyScore: 0.5,
            explainabilityScore: 0.4,
            dataPrivacyCompliance: ['GDPR'],
            responsibleAIGuidelinesAdherence: ['Safety'],
            riskAssessmentLevel: 'high', // High risk due to potential for deepfakes
            mitigationStrategies: ['Watermarking generated content', 'Strict content policies'],
        },
        documentationUrl: 'https://ai.google/docs/veo',
        apiReferenceUrl: 'https://ai.google/api/veo',
        playgroundUrl: 'https://ai.google/veo-playground',
        learnMoreUrl: 'https://blog.google/technology/ai/veo-2-overview/',
        recommendedFor: ['film-production', 'advertising', 'social-media-video'],
        status: 'experimental',
        isCustomizable: false,
        isCommunityContributed: false,
        rating: 4.5,
        reviewCount: 150,
        communityForumUrl: 'https://ai.google/community/veo',
        releaseNotesUrl: 'https://ai.google/veo/releasenotes',
        inferenceEndpointUrl: 'https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate:generate',
        licensingInfo: 'Proprietary, Google Cloud Terms',
        hardwareRequirements: 'Cloud-hosted',
        carbonFootprintEstimate: 'high',
    },
    {
        id: 'claude-3-opus',
        uniqueName: 'anthropic/claude-3-opus',
        displayName: 'Claude 3 Opus',
        description: 'Anthropic\'s most intelligent model, offering state-of-the-art performance on highly complex tasks.',
        provider: mockProviders[1], // Anthropic
        currentVersion: {
            version: '3.0.0-opus',
            releaseDate: daysAgo(180).toString(),
            changelogUrl: 'https://www.anthropic.com/news/claude-3-family',
            status: 'stable',
            featuresAdded: ['Improved multimodal vision', 'Reduced hallucination rate'],
        },
        allVersions: [
            {
                version: '3.0.0-opus',
                releaseDate: daysAgo(180).toString(),
                changelogUrl: 'https://www.anthropic.com/news/claude-3-family',
                status: 'stable',
                featuresAdded: ['Improved multimodal vision', 'Reduced hallucination rate'],
            },
        ],
        capabilities: [
            mockCapabilities[0], // Text Generation
            mockCapabilities[6], // Reasoning
            mockCapabilities[7], // Summarization
            mockCapabilities[4], // Code Generation
            mockCapabilities[5], // Multimodal (vision)
            mockCapabilities[13], // Tool Use
            mockCapabilities[14], // Agentic
        ],
        inputModalities: ['text', 'image'],
        outputModalities: ['text'],
        supportedLanguages: ['en'],
        domains: [mockDomains[1], mockDomains[3], mockDomains[7], mockDomains[8]],
        useCases: [mockUseCases[0], mockUseCases[1], mockUseCases[3], mockUseCases[4], mockUseCases[9]],
        tags: [mockTags[2], mockTags[5], mockTags[7], mockTags[9]],
        pricing: {
            inputTokenCostPerMillion: 15.0,
            outputTokenCostPerMillion: 75.0,
            unit: 'USD',
            freeTierAvailable: false,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 800, p90: 1500, p99: 2500 },
            throughputTokensPerSecond: 10000,
            accuracyScore: 0.96,
            robustnessScore: 0.94,
            maxConcurrentRequests: 800,
            coldStartLatencyMs: 300,
        },
        safetyEthical: {
            harmfulContentScore: 0.02,
            biasScores: { general: 0.04 },
            transparencyScore: 0.85,
            explainabilityScore: 0.8,
            dataPrivacyCompliance: ['GDPR', 'HIPAA'],
            responsibleAIGuidelinesAdherence: ['Constitutional AI', 'Safety', 'Privacy', 'Fairness'],
            riskAssessmentLevel: 'medium',
            mitigationStrategies: ['Constitutional AI principles', 'Extensive safety evaluations'],
        },
        documentationUrl: 'https://docs.anthropic.com/claude/reference/claude-3-opus',
        apiReferenceUrl: 'https://docs.anthropic.com/claude/reference/getting-started',
        playgroundUrl: 'https://console.anthropic.com/playground',
        learnMoreUrl: 'https://www.anthropic.com/news/claude-3-family',
        recommendedFor: ['strategic-analysis', 'complex-problem-solving', 'advanced-research-assistant'],
        status: 'available',
        isCustomizable: false,
        isCommunityContributed: false,
        rating: 4.9,
        reviewCount: 1800,
        communityForumUrl: 'https://www.anthropic.com/community',
        releaseNotesUrl: 'https://www.anthropic.com/news/claude-3-family',
        inferenceEndpointUrl: 'https://api.anthropic.com/v1/messages',
        licensingInfo: 'Proprietary, Anthropic Terms',
        hardwareRequirements: 'Cloud-hosted',
        carbonFootprintEstimate: 'medium',
    },
    {
        id: 'llama-3-8b-instruct',
        uniqueName: 'meta/llama-3-8b-instruct',
        displayName: 'Llama 3 8B Instruct',
        description: 'Meta\'s powerful open-source large language model, fine-tuned for instruction following, ideal for self-hosting.',
        provider: mockProviders[4], // Meta AI
        currentVersion: {
            version: '3.0.0-instruct-8b',
            releaseDate: daysAgo(120).toString(),
            changelogUrl: 'https://ai.meta.com/blog/llama-3-announcement/',
            status: 'stable',
            featuresAdded: ['Improved instruction following', 'Better multilingual support'],
        },
        allVersions: [
            {
                version: '3.0.0-instruct-8b',
                releaseDate: daysAgo(120).toString(),
                changelogUrl: 'https://ai.meta.com/blog/llama-3-announcement/',
                status: 'stable',
                featuresAdded: ['Improved instruction following', 'Better multilingual support'],
            },
        ],
        capabilities: [mockCapabilities[0], mockCapabilities[7], mockCapabilities[4], mockCapabilities[15]],
        inputModalities: ['text'],
        outputModalities: ['text'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt'],
        domains: [mockDomains[1], mockDomains[2], mockDomains[0]],
        useCases: [mockUseCases[0], mockUseCases[1], mockUseCases[3]],
        tags: [mockTags[0], mockTags[1], mockTags[4], mockTags[6], mockTags[9], mockTags[10]],
        pricing: {
            inputTokenCostPerMillion: 0, // Open-source, self-hosted
            outputTokenCostPerMillion: 0,
            unit: 'N/A',
            freeTierAvailable: true,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 100, p90: 200, p99: 400 }, // Self-hosted performance can vary
            throughputTokensPerSecond: 50000,
            accuracyScore: 0.89,
            robustnessScore: 0.85,
            maxConcurrentRequests: 1000, // Depends on hardware
            coldStartLatencyMs: 0, // If always loaded
        },
        safetyEthical: {
            harmfulContentScore: 0.08,
            biasScores: { general: 0.12 },
            transparencyScore: 0.9,
            explainabilityScore: 0.7,
            dataPrivacyCompliance: ['User-managed'], // User's responsibility for deployment
            responsibleAIGuidelinesAdherence: ['Transparency'],
            riskAssessmentLevel: 'medium',
            mitigationStrategies: ['Community guidelines for fine-tuning', 'Open-source safety research'],
        },
        documentationUrl: 'https://llama.meta.com/llama3/docs/',
        apiReferenceUrl: 'https://llama.meta.com/llama3/api/', // For inference on hosted endpoints
        playgroundUrl: 'https://replicate.com/meta/llama-3-8b-instruct',
        learnMoreUrl: 'https://ai.meta.com/blog/llama-3-announcement/',
        recommendedFor: ['local-deployment', 'custom-fine-tuning', 'open-source-projects'],
        status: 'available',
        isCustomizable: true,
        isCommunityContributed: true,
        rating: 4.6,
        reviewCount: 3000,
        communityForumUrl: 'https://github.com/meta-llama/llama3',
        releaseNotesUrl: 'https://ai.meta.com/blog/llama-3-announcement/',
        licensingInfo: 'Llama 3 Community License',
        hardwareRequirements: '8GB VRAM GPU',
        carbonFootprintEstimate: 'user-dependent',
    },
    {
        id: 'whisper-large-v3',
        uniqueName: 'openai/whisper-large-v3',
        displayName: 'Whisper Large v3',
        description: 'OpenAI\'s state-of-the-art multilingual speech recognition model.',
        provider: mockProviders[2], // OpenAI
        currentVersion: {
            version: '3.0.0',
            releaseDate: daysAgo(270).toString(),
            changelogUrl: 'https://openai.com/blog/new-models-and-developer-products-announced-at-devday',
            status: 'stable',
            featuresAdded: ['Improved accuracy for challenging audio', 'Expanded language support'],
        },
        allVersions: [
            {
                version: '3.0.0',
                releaseDate: daysAgo(270).toString(),
                changelogUrl: 'https://openai.com/blog/new-models-and-developer-products-announced-at-devday',
                status: 'stable',
                featuresAdded: ['Improved accuracy for challenging audio', 'Expanded language support'],
            },
        ],
        capabilities: [mockCapabilities[12], mockCapabilities[8]], // Speech Recognition, Translation
        inputModalities: ['audio'],
        outputModalities: ['text'],
        supportedLanguages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'hi', 'pt', 'ru', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'pl', 'cs', 'hu', 'el', 'tr', 'vi', 'th', 'id', 'ms', 'uk', 'fa', 'he', 'bg', 'ro', 'sk', 'sl', 'sr', 'hr', 'et', 'lt', 'lv', 'sq', 'mk', 'mn', 'lo', 'km', 'my', 'ka', 'am', 'az', 'bn', 'gu', 'kn', 'ml', 'mr', 'ne', 'or', 'pa', 'si', 'ta', 'te', 'ur', 'uz', 'ps', 'sd'],
        domains: [mockDomains[2], mockDomains[3], mockDomains[6], mockDomains[7]],
        useCases: [mockUseCases[7], mockUseCases[0]],
        tags: [mockTags[1], mockTags[2], mockTags[3], mockTags[5], mockTags[7], mockTags[9]],
        pricing: {
            audioGenerationCostPerMinute: 0.006, // $0.006 / minute
            unit: 'USD',
            freeTierAvailable: true, // Limited free tier
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 1000, p90: 2000, p99: 4000 }, // Depending on audio length
            throughputTokensPerSecond: 0, // N/A, audio processing
            accuracyScore: 0.97,
            robustnessScore: 0.95,
            maxConcurrentRequests: 2000,
            coldStartLatencyMs: 500,
        },
        safetyEthical: {
            harmfulContentScore: 0.01, // Low for transcription
            biasScores: { general: 0.03 },
            transparencyScore: 0.8,
            explainabilityScore: 0.7,
            dataPrivacyCompliance: ['GDPR', 'CCPA'],
            responsibleAIGuidelinesAdherence: ['Safety', 'Fairness', 'Privacy'],
            riskAssessmentLevel: 'low',
            mitigationStrategies: ['Data anonymization', 'Regular security audits'],
        },
        documentationUrl: 'https://platform.openai.com/docs/guides/speech-to-text',
        apiReferenceUrl: 'https://platform.openai.com/docs/api-reference/audio',
        playgroundUrl: 'https://platform.openai.com/playground?mode=audio',
        learnMoreUrl: 'https://openai.com/blog/new-models-and-developer-products-announced-at-devday',
        recommendedFor: ['multilingual-transcription', 'voice-assistants', 'meeting-summaries'],
        status: 'available',
        isCustomizable: false,
        isCommunityContributed: false,
        rating: 4.9,
        reviewCount: 2000,
        communityForumUrl: 'https://community.openai.com/',
        releaseNotesUrl: 'https://openai.com/blog/new-models-and-developer-products-announced-at-devday',
        inferenceEndpointUrl: 'https://api.openai.com/v1/audio/transcriptions',
        licensingInfo: 'Proprietary, OpenAI Terms',
        hardwareRequirements: 'Cloud-hosted',
        carbonFootprintEstimate: 'low',
    },
    {
        id: 'distilbert-base-uncased',
        uniqueName: 'huggingface/distilbert-base-uncased',
        displayName: 'DistilBERT Base Uncased',
        description: 'A smaller, faster, and cheaper version of BERT for general-purpose natural language understanding.',
        provider: mockProviders[3], // Hugging Face
        currentVersion: {
            version: '1.0.0',
            releaseDate: daysAgo(1800).toString(),
            changelogUrl: 'https://huggingface.co/docs/transformers/model_doc/distilbert',
            status: 'stable',
            featuresAdded: ['Initial release'],
        },
        allVersions: [
            {
                version: '1.0.0',
                releaseDate: daysAgo(1800).toString(),
                changelogUrl: 'https://huggingface.co/docs/transformers/model_doc/distilbert',
                status: 'stable',
                featuresAdded: ['Initial release'],
            },
        ],
        capabilities: [mockCapabilities[9], mockCapabilities[10]], // Sentiment Analysis, Text Embedding
        inputModalities: ['text'],
        outputModalities: ['text'],
        supportedLanguages: ['en'],
        domains: [mockDomains[2], mockDomains[6], mockDomains[8]],
        useCases: [mockUseCases[0]],
        tags: [mockTags[0], mockTags[1], mockTags[4], mockTags[6], mockTags[9], mockTags[10], mockTags[11]],
        pricing: {
            inputTokenCostPerMillion: 0, // Open-source, self-hosted
            outputTokenCostPerMillion: 0,
            embeddingCostPerMillion: 0,
            unit: 'N/A',
            freeTierAvailable: true,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 10, p90: 20, p99: 50 }, // Very fast
            throughputTokensPerSecond: 1000000,
            accuracyScore: 0.90,
            robustnessScore: 0.87,
            maxConcurrentRequests: 10000, // Highly scalable on good hardware
            coldStartLatencyMs: 0,
        },
        safetyEthical: {
            harmfulContentScore: 0.03,
            biasScores: { general: 0.1 },
            transparencyScore: 0.95,
            explainabilityScore: 0.85,
            dataPrivacyCompliance: ['User-managed'],
            responsibleAIGuidelinesAdherence: ['Transparency', 'Reproducibility'],
            riskAssessmentLevel: 'low',
            mitigationStrategies: ['Community audits of model weights', 'Public discussions on limitations'],
        },
        documentationUrl: 'https://huggingface.co/distilbert-base-uncased',
        apiReferenceUrl: 'https://huggingface.co/docs/transformers/model_doc/distilbert',
        playgroundUrl: 'https://huggingface.co/distilbert-base-uncased#model-inputs',
        learnMoreUrl: 'https://huggingface.co/distilbert-base-uncased',
        recommendedFor: ['edge-inference', 'resource-constrained-environments', 'fast-embedding'],
        status: 'available',
        isCustomizable: true,
        isCommunityContributed: true,
        rating: 4.5,
        reviewCount: 1500,
        communityForumUrl: 'https://discuss.huggingface.co/',
        releaseNotesUrl: 'https://huggingface.co/distilbert-base-uncased',
        licensingInfo: 'Apache-2.0',
        hardwareRequirements: 'CPU-friendly',
        carbonFootprintEstimate: 'very-low',
    },
    {
        id: 'stable-diffusion-xl',
        uniqueName: 'stability-ai/stable-diffusion-xl',
        displayName: 'Stable Diffusion XL',
        description: 'Stability AI\'s most advanced open-source text-to-image model for high-quality image generation.',
        longDescription: 'SDXL 1.0 is an advanced generative AI model designed for image synthesis. It offers enhanced image quality, improved composition, and better understanding of complex prompts compared to previous versions. It is particularly strong at generating realistic and artistic images, ideal for creative applications and design workflows. Being open-source, it allows for extensive customization and local deployment.',
        provider: mockProviders[5], // Stability AI
        currentVersion: {
            version: '1.0.0',
            releaseDate: daysAgo(365).toString(),
            changelogUrl: 'https://stability.ai/blog/stable-diffusion-xl-release',
            status: 'stable',
            featuresAdded: ['1024x1024 base resolution', 'Improved aesthetic quality'],
        },
        allVersions: [
            {
                version: '1.0.0',
                releaseDate: daysAgo(365).toString(),
                changelogUrl: 'https://stability.ai/blog/stable-diffusion-xl-release',
                status: 'stable',
                featuresAdded: ['1024x1024 base resolution', 'Improved aesthetic quality'],
            },
            {
                version: '0.9.0',
                releaseDate: daysAgo(400).toString(),
                changelogUrl: 'https://stability.ai/blog/stable-diffusion-xl-09-release',
                status: 'deprecated',
            }
        ],
        capabilities: [mockCapabilities[1], mockCapabilities[15]],
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportedLanguages: ['en'],
        domains: [mockDomains[0], mockDomains[6], mockDomains[9]],
        useCases: [mockUseCases[1], mockUseCases[2]],
        tags: [mockTags[2], mockTags[5], mockTags[6], mockTags[9]],
        pricing: {
            inputTokenCostPerMillion: 0,
            outputTokenCostPerMillion: 0,
            imageGenerationCostPerImage: 0, // Self-hosted, user pays for hardware
            unit: 'N/A',
            freeTierAvailable: true,
            currencySymbol: '$',
        },
        performance: {
            latencyMs: { p50: 2000, p90: 5000, p99: 10000 }, // Depending on hardware and steps
            throughputTokensPerSecond: 0,
            accuracyScore: 0.94, // Perceptual quality
            fidScore: 20.1, // Depends on specific config
            maxConcurrentRequests: 10, // Depends on hardware
            coldStartLatencyMs: 0, // If locally hosted
        },
        safetyEthical: {
            harmfulContentScore: 0.12, // More flexible due to open-source nature
            biasScores: { general: 0.18 },
            transparencyScore: 0.85,
            explainabilityScore: 0.6,
            dataPrivacyCompliance: ['User-managed'],
            responsibleAIGuidelinesAdherence: ['Transparency', 'Open Science'],
            riskAssessmentLevel: 'high',
            mitigationStrategies: ['Community-driven safety research', 'Optional safety filters'],
        },
        documentationUrl: 'https://github.com/Stability-AI/generative-models',
        apiReferenceUrl: 'https://platform.stability.ai/docs/api-reference', // For Stability AI hosted endpoints
        playgroundUrl: 'https://dreamstudio.ai/generate',
        learnMoreUrl: 'https://stability.ai/stable-diffusion',
        recommendedFor: ['custom-art-generation', 'local-deployment', 'research-prototyping'],
        status: 'available',
        isCustomizable: true,
        isCommunityContributed: true,
        rating: 4.7,
        reviewCount: 4000,
        communityForumUrl: 'https://discord.gg/stabilityai',
        releaseNotesUrl: 'https://stability.ai/blog/stable-diffusion-xl-release',
        licensingInfo: 'CreativeML Open RAIL++-M License',
        hardwareRequirements: '16GB VRAM GPU recommended',
        carbonFootprintEstimate: 'user-dependent',
    },
];

const mockFineTuningJobs: IFineTuningJob[] = [
    {
        jobId: 'ft-gemini-25f-001',
        modelId: 'gemini-2.5-flash-001',
        baseModelDisplayName: 'Gemini 2.5 Flash',
        datasetId: 'ds-chat-history-v2',
        status: 'completed',
        startTime: daysAgo(5).toString(),
        endTime: daysAgo(4).toString(),
        durationMs: 90 * 60 * 1000,
        costEstimate: 25.0,
        actualCost: 28.50,
        metrics: {
            validationLoss: 0.015,
            accuracy: 0.98,
        },
        hyperparameters: {
            epochs: 3,
            learningRate: 1e-5,
            batchSize: 8,
        },
        fineTunedModelId: 'custom-gemini-flash-my-chatbot',
        fineTunedModelName: 'MyCompany Chatbot - v1',
        logsUrl: 'https://console.ai.google/finetuning/logs/ft-gemini-25f-001',
        createdBy: 'user:dev_team@mycompany.com',
        createdAt: daysAgo(5).toString(),
    },
    {
        jobId: 'ft-imagen-40-002',
        modelId: 'imagen-4.0-generate-001',
        baseModelDisplayName: 'Imagen 4.0 Generate',
        datasetId: 'ds-company-brand-assets',
        status: 'running',
        startTime: daysAgo(1).toString(),
        costEstimate: 120.0,
        hyperparameters: {
            steps: 20000,
            learningRate: 5e-6,
            lora_rank: 64,
        },
        fineTunedModelId: 'custom-imagen-brand-v1',
        fineTunedModelName: 'Brand Style Generator - v1',
        logsUrl: 'https://console.ai.google/finetuning/logs/ft-imagen-40-002',
        createdBy: 'user:creative_lead@mycompany.com',
        createdAt: daysAgo(1).toString(),
    },
];

const mockDeployments: IDeploymentConfig[] = [
    {
        deploymentId: 'dep-chatbot-prod-us-1',
        modelId: 'custom-gemini-flash-my-chatbot',
        version: '1.0.0', // Fine-tuned models have their own versions
        region: 'us-central1',
        scalingConfig: {
            minNodes: 2,
            maxNodes: 10,
            autoScaleEnabled: true,
            targetMetric: 'qps',
            targetValue: 50,
        },
        status: 'deployed',
        endpointUrl: 'https://api.mycompany.com/v1/chatbot',
        creationDate: daysAgo(3).toString(),
        lastUpdated: daysAgo(1).toString(),
        costEstimatePerHour: 0.75,
        accessControlList: ['user:admin@mycompany.com', 'group:developers'],
        healthStatus: 'healthy',
        monitoringDashboardUrl: 'https://console.cloud.google.com/monitoring/dashboards/chatbot',
        sslEnabled: true,
    },
    {
        deploymentId: 'dep-image-gen-test-eu-1',
        modelId: 'imagen-4.0-generate-001',
        version: '4.0.0-generate-001',
        region: 'europe-west4',
        scalingConfig: {
            minNodes: 1,
            maxNodes: 2,
            autoScaleEnabled: false,
        },
        status: 'provisioning',
        endpointUrl: 'https://api.mycompany.com/v1/imagegen-test',
        creationDate: daysAgo(0.5).toString(),
        lastUpdated: daysAgo(0.5).toString(),
        costEstimatePerHour: 0.40,
        accessControlList: ['user:qa-team@mycompany.com'],
        healthStatus: 'provisioning',
        sslEnabled: true,
    },
];

const mockExperiments: IExperiment[] = [
    {
        experimentId: 'exp-chat-v1',
        name: 'Chatbot Model A/B Test v1',
        description: 'Comparing Gemini 2.5 Flash vs. fine-tuned Gemini 2.5 Flash for customer support.',
        status: 'running',
        startTime: daysAgo(7).toString(),
        variants: [
            { variantName: 'Control (Gemini Flash)', modelId: 'gemini-2.5-flash-001', trafficSplit: 0.5, deploymentId: 'dep-chatbot-prod-us-1' },
            { variantName: 'Variant (Fine-tuned Flash)', modelId: 'custom-gemini-flash-my-chatbot', trafficSplit: 0.5, deploymentId: 'dep-chatbot-prod-us-1' },
        ],
        metricsToTrack: ['response_latency', 'customer_satisfaction_score', 'escalation_rate', 'cost_per_query'],
        resultsSummary: {},
        dashboardUrl: 'https://datadog.com/dashboards/exp-chat-v1',
        createdBy: 'user:pm@mycompany.com',
        createdAt: daysAgo(10).toString(),
    },
];

const mockDatasets: IDataset[] = [
    {
        id: 'ds-chat-history-v2',
        name: 'Customer Chat History V2',
        description: 'Anonymized chat logs for customer support fine-tuning.',
        type: 'text',
        sizeBytes: 150 * 1024 * 1024, // 150 MB
        recordCount: 500000,
        uploadDate: daysAgo(15).toString(),
        owner: 'data-team@mycompany.com',
        accessControl: ['group:ai-engineers'],
        storageLocation: 'gs://my-company-datasets/chat-history-v2.jsonl',
        schema: { prompt: 'string', completion: 'string' },
        previewUrl: 'https://console.ai.google/datasets/ds-chat-history-v2/preview',
        dataFormat: 'JSONL',
        validationStatus: 'validated',
        lastValidated: daysAgo(14).toString(),
        tags: ['chat', 'customer-service', 'text'],
    },
    {
        id: 'ds-company-brand-assets',
        name: 'Company Brand Image Assets',
        description: 'Collection of approved brand images for custom image generation.',
        type: 'image',
        sizeBytes: 5 * 1024 * 1024 * 1024, // 5 GB
        recordCount: 15000,
        uploadDate: daysAgo(70).toString(),
        owner: 'marketing-team@mycompany.com',
        accessControl: ['group:marketing-creative'],
        storageLocation: 'gs://my-company-datasets/brand-assets/',
        previewUrl: 'https://console.ai.google/datasets/ds-company-brand-assets/preview',
        dataFormat: 'JPEG/PNG',
        validationStatus: 'validated',
        lastValidated: daysAgo(68).toString(),
        tags: ['brand', 'images', 'marketing'],
    },
];

const mockTools: ITool[] = [
    {
        id: 'calculator-tool',
        name: 'Calculator',
        description: 'A tool for performing basic arithmetic calculations.',
        schema: {
            type: 'object',
            properties: {
                expression: { type: 'string', description: 'The mathematical expression to evaluate.' }
            },
            required: ['expression']
        },
        endpoint: 'https://api.example.com/calculator',
        parameters: [{ name: 'expression', type: 'string', description: 'The mathematical expression to evaluate.', required: true }],
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/2619/2619472.png',
        provider: 'Acme Tools',
        tags: ['math', 'utility'],
    },
    {
        id: 'web-search-tool',
        name: 'Web Search',
        description: 'Searches the internet for information.',
        schema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'The search query.' }
            },
            required: ['query']
        },
        endpoint: 'https://api.example.com/websearch',
        parameters: [{ name: 'query', type: 'string', description: 'The search query.', required: true }],
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/54/54481.png',
        provider: 'Acme Tools',
        tags: ['information-retrieval'],
    },
];

const mockAgenticWorkflows: IAgenticWorkflow[] = [
    {
        id: 'workflow-content-generator-v1',
        name: 'Automated Blog Post Generator',
        description: 'Generates full blog posts from a single topic, using multiple models and a web search tool.',
        modelsUsed: ['gemini-1.5-pro-001', 'imagen-4.0-generate-001'],
        toolsUsed: ['web-search-tool'],
        steps: [
            { order: 1, type: 'model_call', refId: 'gemini-1.5-pro-001', logic: 'Generate blog post outline and keywords from topic.' },
            { order: 2, type: 'tool_call', refId: 'web-search-tool', logic: 'Research relevant facts for each keyword.' },
            { order: 3, type: 'model_call', refId: 'gemini-1.5-pro-001', logic: 'Write detailed sections based on outline and research.' },
            { order: 4, type: 'model_call', refId: 'imagen-4.0-generate-001', logic: 'Generate a hero image from blog post title.' },
            { order: 5, type: 'model_call', refId: 'gemini-1.5-pro-001', logic: 'Review and refine for coherence and tone.' },
        ],
        status: 'active',
        version: '1.0.0',
        createdBy: 'user:content_manager@mycompany.com',
        createdAt: daysAgo(30).toString(),
        lastUpdated: daysAgo(5).toString(),
        diagramUrl: 'https://www.example.com/workflow-diagrams/blog-post-gen.png',
        playgroundUrl: 'https://ai.google/workflow-playground/content-generator',
    },
];


export interface IModelService {
    getModels: (filters?: ModelFilterOptions, sort?: ModelSortOptions) => Promise<IModel[]>;
    getModelById: (id: string) => Promise<IModel | undefined>;
    getProviders: () => Promise<IProvider[]>;
    getCapabilities: () => Promise<ICapability[]>;
    getDomains: () => Promise<IDomain[]>;
    getUseCases: () => Promise<IUseCase[]>;
    getTags: () => Promise<ITag[]>;
    getFineTuningJobs: (modelId?: string) => Promise<IFineTuningJob[]>;
    getDeployments: (modelId?: string) => Promise<IDeploymentConfig[]>;
    getExperiments: (modelId?: string) => Promise<IExperiment[]>;
    getDatasets: (owner?: string) => Promise<IDataset[]>;
    getTools: (modelId?: string) => Promise<ITool[]>;
    getAgenticWorkflows: (modelId?: string) => Promise<IAgenticWorkflow[]>;
    // Future: createFineTuningJob, deployModel, etc.
}

export interface ModelFilterOptions {
    searchTerm?: string;
    providerIds?: string[];
    capabilityIds?: string[];
    domainIds?: string[];
    useCaseIds?: string[];
    tagIds?: string[];
    minRating?: number;
    isCustomizable?: boolean;
    isCommunityContributed?: boolean;
    status?: IModel['status'][];
    minLatencyMs?: number; // P50 latency
    maxCostPerMillionTokens?: number; // Simplified avg cost filter
    inputModality?: string;
    outputModality?: string;
    freeTierAvailable?: boolean;
}

export interface ModelSortOptions {
    field: keyof IModel | 'rating' | 'costEfficiency' | 'performance.latencyMs.p50' | 'currentVersion.releaseDate';
    direction: 'asc' | 'desc';
}

/**
 * Mock Model Service implementation. In a real app, this would interact with a backend API.
 */
export const MockModelService: IModelService = {
    getModels: async (filters = {}, sort = { field: 'displayName', direction: 'asc' }) => {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100)); // Simulate API call delay
        let filteredModels = [...mockModels];

        if (filters.searchTerm) {
            const lowerSearchTerm = filters.searchTerm.toLowerCase();
            filteredModels = filteredModels.filter(model =>
                model.displayName.toLowerCase().includes(lowerSearchTerm) ||
                model.description.toLowerCase().includes(lowerSearchTerm) ||
                model.provider.name.toLowerCase().includes(lowerSearchTerm) ||
                model.tags.some(tag => tag.name.toLowerCase().includes(lowerSearchTerm)) ||
                model.capabilities.some(cap => cap.name.toLowerCase().includes(lowerSearchTerm)) ||
                model.useCases.some(uc => uc.name.toLowerCase().includes(lowerSearchTerm)) ||
                model.domains.some(dom => dom.name.toLowerCase().includes(lowerSearchTerm))
            );
        }
        if (filters.providerIds && filters.providerIds.length > 0) {
            filteredModels = filteredModels.filter(model => filters.providerIds!.includes(model.provider.id));
        }
        if (filters.capabilityIds && filters.capabilityIds.length > 0) {
            filteredModels = filteredModels.filter(model =>
                model.capabilities.some(cap => filters.capabilityIds!.includes(cap.id))
            );
        }
        if (filters.domainIds && filters.domainIds.length > 0) {
            filteredModels = filteredModels.filter(model =>
                model.domains.some(domain => filters.domainIds!.includes(domain.id))
            );
        }
        if (filters.useCaseIds && filters.useCaseIds.length > 0) {
            filteredModels = filteredModels.filter(model =>
                model.useCases.some(useCase => filters.useCaseIds!.includes(useCase.id))
            );
        }
        if (filters.tagIds && filters.tagIds.length > 0) {
            filteredModels = filteredModels.filter(model =>
                model.tags.some(tag => filters.tagIds!.includes(tag.id))
            );
        }
        if (filters.minRating !== undefined && filters.minRating > 0) {
            filteredModels = filteredModels.filter(model => model.rating && model.rating >= filters.minRating!);
        }
        if (filters.isCustomizable !== undefined) {
            filteredModels = filteredModels.filter(model => model.isCustomizable === filters.isCustomizable);
        }
        if (filters.isCommunityContributed !== undefined) {
            filteredModels = filteredModels.filter(model => model.isCommunityContributed === filters.isCommunityContributed);
        }
        if (filters.status && filters.status.length > 0) {
            filteredModels = filteredModels.filter(model => filters.status!.includes(model.status));
        }
        if (filters.minLatencyMs !== undefined) {
            filteredModels = filteredModels.filter(model => model.performance.latencyMs.p50 <= filters.minLatencyMs!);
        }
        if (filters.maxCostPerMillionTokens !== undefined && filters.maxCostPerMillionTokens < 50) { // Assuming 50 is max range
            filteredModels = filteredModels.filter(model => {
                const avgTokenCost = (model.pricing.inputTokenCostPerMillion || 0) + (model.pricing.outputTokenCostPerMillion || 0) / 2;
                // If token cost is 0 (e.g., open source), treat as very low cost
                return avgTokenCost > 0 ? avgTokenCost <= filters.maxCostPerMillionTokens! : true;
            });
        }
        if (filters.inputModality) {
            filteredModels = filteredModels.filter(model => model.inputModalities.includes(filters.inputModality!));
        }
        if (filters.outputModality) {
            filteredModels = filteredModels.filter(model => model.outputModalities.includes(filters.outputModality!));
        }
        if (filters.freeTierAvailable !== undefined) {
            filteredModels = filteredModels.filter(model => model.pricing.freeTierAvailable === filters.freeTierAvailable);
        }


        // Sorting logic
        filteredModels.sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sort.field) {
                case 'costEfficiency':
                    // Prioritize models with lower token cost. Handle non-token cost models gracefully.
                    valA = ((a.pricing.inputTokenCostPerMillion || 0) + (a.pricing.outputTokenCostPerMillion || 0)) / 2;
                    if (valA === 0 && a.pricing.modelCallCost !== undefined) valA = a.pricing.modelCallCost * 1000; // Small heuristic for comparison
                    valB = ((b.pricing.inputTokenCostPerMillion || 0) + (b.pricing.outputTokenCostPerMillion || 0)) / 2;
                    if (valB === 0 && b.pricing.modelCallCost !== undefined) valB = b.pricing.modelCallCost * 1000;
                    break;
                case 'rating':
                    valA = a.rating || 0;
                    valB = b.rating || 0;
                    break;
                case 'performance.latencyMs.p50':
                    valA = a.performance.latencyMs.p50;
                    valB = b.performance.latencyMs.p50;
                    break;
                case 'currentVersion.releaseDate':
                    valA = new Date(a.currentVersion.releaseDate).getTime();
                    valB = new Date(b.currentVersion.releaseDate).getTime();
                    break;
                default:
                    valA = a[sort.field as keyof IModel];
                    valB = b[sort.field as keyof IModel];
            }

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sort.direction === 'asc' ? valA - valB : valB - valA;
            }
            return 0; // Fallback
        });

        return filteredModels;
    },
    getModelById: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return mockModels.find(model => model.id === id);
    },
    getProviders: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...mockProviders];
    },
    getCapabilities: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...mockCapabilities];
    },
    getDomains: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...mockDomains];
    },
    getUseCases: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...mockUseCases];
    },
    getTags: async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return [...mockTags];
    },
    getFineTuningJobs: async (modelId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        // Also include jobs for fine-tuned models derived from the base model
        return modelId ? mockFineTuningJobs.filter(job => job.modelId === modelId || job.fineTunedModelId === modelId) : [...mockFineTuningJobs];
    },
    getDeployments: async (modelId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        // Include deployments of fine-tuned models where base model matches
        const relatedFineTunedModelIds = mockFineTuningJobs.filter(job => job.modelId === modelId && job.fineTunedModelId).map(job => job.fineTunedModelId!);
        return modelId ? mockDeployments.filter(dep => dep.modelId === modelId || relatedFineTunedModelIds.includes(dep.modelId)) : [...mockDeployments];
    },
    getExperiments: async (modelId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        const relatedFineTunedModelIds = mockFineTuningJobs.filter(job => job.modelId === modelId && job.fineTunedModelId).map(job => job.fineTunedModelId!);
        const relevantModelIds = [modelId, ...relatedFineTunedModelIds];
        return modelId ? mockExperiments.filter(exp => exp.variants.some(v => relevantModelIds.includes(v.modelId))) : [...mockExperiments];
    },
    getDatasets: async (owner?: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return owner ? mockDatasets.filter(ds => ds.owner === owner) : [...mockDatasets];
    },
    getTools: async (modelId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (!modelId) return mockTools; // Return all tools if no specific model is requested
        // In a real scenario, models would have a 'supportedTools' array or similar
        // For mock, assume all models with 'tool-use' capability support all tools
        const model = mockModels.find(m => m.id === modelId);
        if (model?.capabilities.some(cap => cap.id === 'tool-use')) {
            return mockTools;
        }
        return [];
    },
    getAgenticWorkflows: async (modelId?: string) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return modelId ? mockAgenticWorkflows.filter(wf => wf.modelsUsed.includes(modelId)) : [...mockAgenticWorkflows];
    }
};


// --- III. React Context for Global Model State ---

export interface ModelUniverseContextType {
    selectedModelId: string | null;
    setSelectedModelId: (id: string | null) => void;
    models: IModel[];
    providers: IProvider[];
    capabilities: ICapability[];
    domains: IDomain[];
    useCases: IUseCase[];
    tags: ITag[];
    loadingModels: boolean;
    loadingMetadata: boolean;
    filters: ModelFilterOptions;
    setFilters: React.Dispatch<React.SetStateAction<ModelFilterOptions>>;
    sort: ModelSortOptions;
    setSort: React.Dispatch<React.SetStateAction<ModelSortOptions>>;
    refreshModels: () => void;
}

export const ModelUniverseContext = createContext<ModelUniverseContextType | undefined>(undefined);

/**
 * Custom hook to consume the ModelUniverseContext.
 * @returns ModelUniverseContextType
 */
export const useModelUniverse = () => {
    const context = useContext(ModelUniverseContext);
    if (!context) {
        throw new Error('useModelUniverse must be used within a ModelUniverseProvider');
    }
    return context;
};

/**
 * Provider component for the Model Universe Context.
 * Manages fetching and state for models and metadata.
 */
export const ModelUniverseProvider: React.FC<React.PropsWithChildren<{ service: IModelService }>> = ({ children, service }) => {
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [models, setModels] = useState<IModel[]>([]);
    const [providers, setProviders] = useState<IProvider[]>([]);
    const [capabilities, setCapabilities] = useState<ICapability[]>([]);
    const [domains, setDomains] = useState<IDomain[]>([]);
    const [useCases, setUseCases] = useState<IUseCase[]>([]);
    const [tags, setTags] = useState<ITag[]>([]);
    const [loadingModels, setLoadingModels] = useState(true);
    const [loadingMetadata, setLoadingMetadata] = useState(true);
    const [filters, setFilters] = useState<ModelFilterOptions>({});
    const [sort, setSort] = useState<ModelSortOptions>({ field: 'displayName', direction: 'asc' });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshModels = useCallback(() => setRefreshTrigger(prev => prev + 1), []);

    useEffect(() => {
        const fetchMetadata = async () => {
            setLoadingMetadata(true);
            try {
                const [provs, caps, doms, uses, tgs] = await Promise.all([
                    service.getProviders(),
                    service.getCapabilities(),
                    service.getDomains(),
                    service.getUseCases(),
                    service.getTags(),
                ]);
                setProviders(provs);
                setCapabilities(caps);
                setDomains(doms);
                setUseCases(uses);
                setTags(tgs);
            } catch (error) {
                console.error("Failed to fetch model metadata:", error);
            } finally {
                setLoadingMetadata(false);
            }
        };
        fetchMetadata();
    }, [service]);

    useEffect(() => {
        const fetchModels = async () => {
            setLoadingModels(true);
            try {
                const fetchedModels = await service.getModels(filters, sort);
                setModels(fetchedModels);
            } catch (error) {
                console.error("Failed to fetch models:", error);
            } finally {
                setLoadingModels(false);
            }
        };
        fetchModels();
    }, [service, filters, sort, refreshTrigger]);

    const value = useMemo(() => ({
        selectedModelId,
        setSelectedModelId,
        models,
        providers,
        capabilities,
        domains,
        useCases,
        tags,
        loadingModels,
        loadingMetadata,
        filters,
        setFilters,
        sort,
        setSort,
        refreshModels,
    }), [selectedModelId, models, providers, capabilities, domains, useCases, tags, loadingModels, loadingMetadata, filters, sort, refreshModels]);

    return (
        <ModelUniverseContext.Provider value={value}>
            {children}
        </ModelUniverseContext.Provider>
    );
};

// --- IV. UI Components for the Model Universe ---

/**
 * Basic button component.
 */
export const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'; icon?: string; }>> = ({ children, onClick, className = '', disabled, variant = 'primary', icon }) => {
    let baseStyle = 'px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 flex items-center justify-center';
    let variantStyle = '';
    switch (variant) {
        case 'primary':
            variantStyle = 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50';
            break;
        case 'secondary':
            variantStyle = 'bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50';
            break;
        case 'danger':
            variantStyle = 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50';
            break;
        case 'ghost':
            baseStyle = 'p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200';
            variantStyle = '';
            break;
        case 'icon':
            baseStyle = 'w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200';
            variantStyle = '';
            break;
    }
    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variantStyle} ${className}`}
            disabled={disabled}
        >
            {icon && <span className="material-icons mr-1">{icon}</span>}
            {children}
        </button>
    );
};

/**
 * A simple dropdown/select component.
 */
export const Select: React.FC<React.PropsWithChildren<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    className?: string;
    options: { value: string; label: string; }[];
    disabled?: boolean;
}>> = ({ value, onChange, className, options, disabled }) => {
    return (
        <select value={value} onChange={onChange} disabled={disabled} className={`w-full bg-gray-700 rounded p-2 text-gray-200 border border-gray-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    );
};

/**
 * A chip/tag display component.
 */
export const TagChip: React.FC<{ tag: ITag; onClick?: (tag: ITag) => void; removable?: boolean }> = ({ tag, onClick, removable }) => (
    <span
        style={{ backgroundColor: tag.color || '#6B7280', color: 'white' }}
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-1 mb-1 ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={() => onClick && onClick(tag)}
    >
        {tag.name}
        {removable && (
            <button className="ml-1 -mr-0.5 h-4 w-4 rounded-full flex items-center justify-center bg-white bg-opacity-20 hover:bg-opacity-30" onClick={(e) => { e.stopPropagation(); onClick && onClick(tag); }}>
                ✕
            </button>
        )}
    </span>
);

/**
 * Rating display component.
 */
export const StarRating: React.FC<{ rating?: number; reviewCount?: number; maxStars?: number }> = ({ rating, reviewCount, maxStars = 5 }) => {
    if (rating === undefined || rating === null) return null;
    const clampedRating = Math.max(0, Math.min(maxStars, rating));
    const fullStars = Math.floor(clampedRating);
    const hasHalfStar = clampedRating % 1 !== 0;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center text-sm text-yellow-400">
            {[...Array(fullStars)].map((_, i) => (
                <span key={`full-${i}`} className="material-icons-star">★</span>
            ))}
            {hasHalfStar && <span className="material-icons-star-half">½</span>}
            {[...Array(emptyStars)].map((_, i) => (
                <span key={`empty-${i}`} className="material-icons-star-empty">☆</span>
            ))}
            {reviewCount !== undefined && <span className="ml-1 text-gray-400">({reviewCount})</span>}
        </div>
    );
};

/**
 * Generic Loading Spinner.
 */
export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
);

/**
 * Small info card for metadata (e.g., capability, domain, use case).
 */
export const InfoCard: React.FC<{ title: string; items: { id: string; name: string; icon?: string; color?: string; }[]; type?: 'tags' | 'chips' | 'list' }> = ({ title, items, type = 'chips' }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mb-4">
            <h4 className="font-semibold text-gray-200 mb-1">{title}:</h4>
            {type === 'chips' && (
                <div className="flex flex-wrap">
                    {items.map(item => (
                        <TagChip key={item.id} tag={{ id: item.id, name: item.name, color: item.color || (title === 'Capabilities' ? '#4CAF50' : title === 'Domains' ? '#2196F3' : '#FF9800') }} />
                    ))}
                </div>
            )}
            {type === 'list' && (
                <ul className="list-disc list-inside text-sm text-gray-300">
                    {items.map(item => <li key={item.id}>{item.name}</li>)}
                </ul>
            )}
            {type === 'tags' && ( // For general purpose tags, might not have colors
                 <div className="flex flex-wrap">
                 {items.map(item => (
                     <TagChip key={item.id} tag={{ id: item.id, name: item.name, color: item.color }} />
                 ))}
             </div>
            )}
        </div>
    );
};

/**
 * Displays detailed information about a single model.
 */
export const ModelDetailsPanel: React.FC<{ model: IModel, onClose: () => void }> = ({ model, onClose }) => {
    const { capabilities, domains, useCases, tags, pricing, performance, safetyEthical, provider, currentVersion, allVersions } = model;
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'versions', 'fine-tuning', 'deployments', 'experiments', 'api', 'agentic-workflows'

    const { getFineTuningJobs, getDeployments, getExperiments, getDatasets, getTools, getAgenticWorkflows } = MockModelService; // Use mock service directly here for simplicity within the component
    const [fineTuningJobs, setFineTuningJobs] = useState<IFineTuningJob[]>([]);
    const [deployments, setDeployments] = useState<IDeploymentConfig[]>([]);
    const [experiments, setExperiments] = useState<IExperiment[]>([]);
    const [datasets, setDatasets] = useState<IDataset[]>([]);
    const [tools, setTools] = useState<ITool[]>([]);
    const [agenticWorkflows, setAgenticWorkflows] = useState<IAgenticWorkflow[]>([]);
    const [loadingRelatedData, setLoadingRelatedData] = useState(false);

    useEffect(() => {
        const fetchRelatedData = async () => {
            setLoadingRelatedData(true);
            try {
                const [jobs, deps, exps, dsets, ttools, workflows] = await Promise.all([
                    getFineTuningJobs(model.id),
                    getDeployments(model.id),
                    getExperiments(model.id),
                    getDatasets(), // Fetch all datasets to resolve by ID
                    getTools(model.id),
                    getAgenticWorkflows(model.id),
                ]);
                setFineTuningJobs(jobs);
                setDeployments(deps);
                setExperiments(exps);
                setDatasets(dsets);
                setTools(ttools);
                setAgenticWorkflows(workflows);
            } catch (error) {
                console.error("Failed to fetch related data for model:", error);
            } finally {
                setLoadingRelatedData(false);
            }
        };
        fetchRelatedData();
    }, [model.id, getFineTuningJobs, getDeployments, getExperiments, getDatasets, getTools, getAgenticWorkflows]);

    const findDatasetName = (datasetId: string) => {
        return datasets.find(ds => ds.id === datasetId)?.name || datasetId;
    };
    const findModelName = (modelId: string) => {
        return MockModelService.getModelById(modelId).then(m => m?.displayName || modelId).catch(() => modelId);
    };
    const findToolName = (toolId: string) => {
        return tools.find(t => t.id === toolId)?.name || toolId;
    };


    const versionOptions = allVersions.map(v => ({ value: v.version, label: `${v.version} (${v.status}) - ${new Date(v.releaseDate).toLocaleDateString()}` }));

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-75 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col border border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-100">{model.displayName}</h2>
                    <Button onClick={onClose} variant="ghost" className="text-gray-400 hover:text-white">✕</Button>
                </div>

                <div className="flex border-b border-gray-700 overflow-x-auto custom-scrollbar-horizontal">
                    {['overview', 'versions', 'fine-tuning', 'deployments', 'experiments', 'api', 'agentic-workflows'].map(tab => (
                        <button
                            key={tab}
                            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    {loadingRelatedData && <LoadingSpinner />}
                    {!loadingRelatedData && activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-100 mb-3">General Information</h3>
                                <p className="mb-4 text-gray-400 leading-relaxed">{model.longDescription || model.description}</p>
                                <p><strong>Provider:</strong> <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{provider.name}</a></p>
                                <p><strong>Status:</strong> <span className={`capitalize ${model.status === 'experimental' || model.status === 'preview' ? 'text-yellow-400' : model.status === 'deprecated' ? 'text-red-400' : 'text-green-400'}`}>{model.status}</span></p>
                                {model.deprecatedDate && <p className="text-red-400"><strong>Deprecated:</strong> {new Date(model.deprecatedDate).toLocaleDateString()}</p>}
                                <p><strong>Rating:</strong> <StarRating rating={model.rating} reviewCount={model.reviewCount} /></p>
                                <p><strong>Current Version:</strong> {currentVersion.version} (<span className={`capitalize ${currentVersion.status === 'experimental' || currentVersion.status === 'preview' ? 'text-yellow-400' : currentVersion.status === 'deprecated' ? 'text-red-400' : 'text-green-400'}`}>{currentVersion.status}</span>)</p>
                                <p><strong>Release Date:</strong> {new Date(currentVersion.releaseDate).toLocaleDateString()}</p>
                                <p><strong>Licensing:</strong> <span className="text-indigo-400">{model.licensingInfo}</span></p>
                                {model.hardwareRequirements && <p><strong>Hardware:</strong> {model.hardwareRequirements}</p>}
                                {model.carbonFootprintEstimate && <p><strong>Carbon Footprint:</strong> <span className={`capitalize ${model.carbonFootprintEstimate === 'high' || model.carbonFootprintEstimate === 'very-high' ? 'text-red-400' : model.carbonFootprintEstimate === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{model.carbonFootprintEstimate.replace(/-/g, ' ')}</span></p>}
                                <div className="mt-4">
                                    <h4 className="font-semibold text-gray-200">Links:</h4>
                                    {model.documentationUrl && <p><a href={model.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Documentation</a></p>}
                                    {model.learnMoreUrl && <p><a href={model.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Learn More</a></p>}
                                    {model.communityForumUrl && <p><a href={model.communityForumUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Community Forum</a></p>}
                                    {model.releaseNotesUrl && <p><a href={model.releaseNotesUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Release Notes</a></p>}
                                    {model.integrationGuides && model.integrationGuides.length > 0 && (
                                        <>
                                            <h5 className="font-semibold text-gray-300 mt-2">Integration Guides:</h5>
                                            <ul className="list-disc list-inside text-sm">
                                                {model.integrationGuides.map((guide, i) => (
                                                    <li key={i}><a href={guide.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{guide.platform}</a></li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-100 mb-3">Technical Details</h3>
                                <InfoCard title="Capabilities" items={capabilities} />
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-200">Input Modalities:</h4>
                                    <p>{model.inputModalities.join(', ')}</p>
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-200">Output Modalities:</h4>
                                    <p>{model.outputModalities.join(', ')}</p>
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-semibold text-gray-200">Supported Languages:</h4>
                                    <p>{model.supportedLanguages.slice(0, 5).join(', ')}{model.supportedLanguages.length > 5 ? ` +${model.supportedLanguages.length - 5} more` : ''}</p>
                                </div>
                                <InfoCard title="Domains" items={domains} />
                                <InfoCard title="Use Cases" items={useCases} />
                                <InfoCard title="Tags" items={tags} type="tags" />
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold text-gray-100 mb-3">Performance & Pricing</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-200">Performance Metrics:</h4>
                                        <p><strong>P50 Latency:</strong> {performance.latencyMs.p50} ms</p>
                                        <p><strong>P90 Latency:</strong> {performance.latencyMs.p90} ms</p>
                                        <p><strong>P99 Latency:</strong> {performance.latencyMs.p99} ms</p>
                                        <p><strong>Cold Start:</strong> {performance.coldStartLatencyMs} ms</p>
                                        {performance.throughputTokensPerSecond > 0 && <p><strong>Throughput:</strong> {performance.throughputTokensPerSecond} tokens/sec</p>}
                                        {performance.accuracyScore && <p><strong>Accuracy:</strong> {(performance.accuracyScore * 100).toFixed(1)}%</p>}
                                        {performance.robustnessScore && <p><strong>Robustness:</strong> {(performance.robustnessScore * 100).toFixed(1)}%</p>}
                                        {performance.fidScore && <p><strong>FID Score (Image):</strong> {performance.fidScore}</p>}
                                        {performance.maxConcurrentRequests && <p><strong>Max Concurrent Requests:</strong> {performance.maxConcurrentRequests}</p>}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-200">Pricing ({pricing.currencySymbol}):</h4>
                                        {pricing.inputTokenCostPerMillion !== undefined && <p><strong>Input Token Cost:</strong> {pricing.currencySymbol}{pricing.inputTokenCostPerMillion.toFixed(3)}/M tokens</p>}
                                        {pricing.outputTokenCostPerMillion !== undefined && <p><strong>Output Token Cost:</strong> {pricing.currencySymbol}{pricing.outputTokenCostPerMillion.toFixed(3)}/M tokens</p>}
                                        {pricing.imageGenerationCostPerImage !== undefined && <p><strong>Image Gen Cost:</strong> {pricing.currencySymbol}{pricing.imageGenerationCostPerImage.toFixed(3)}/image</p>}
                                        {pricing.videoGenerationCostPerSecond !== undefined && <p><strong>Video Gen Cost:</strong> {pricing.currencySymbol}{pricing.videoGenerationCostPerSecond.toFixed(3)}/sec</p>}
                                        {pricing.audioGenerationCostPerMinute !== undefined && <p><strong>Audio Gen Cost:</strong> {pricing.currencySymbol}{pricing.audioGenerationCostPerMinute.toFixed(3)}/min</p>}
                                        {pricing.embeddingCostPerMillion !== undefined && <p><strong>Embedding Cost:</strong> {pricing.currencySymbol}{pricing.embeddingCostPerMillion.toFixed(3)}/M embeddings</p>}
                                        {pricing.modelCallCost !== undefined && <p><strong>Per Call Cost:</strong> {pricing.currencySymbol}{pricing.modelCallCost.toFixed(4)}/call</p>}
                                        {pricing.freeTierAvailable && <p className="text-green-400">✅ Free Tier Available</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="text-xl font-semibold text-gray-100 mb-3">Safety & Ethical AI</h3>
                                <p><strong>Harmful Content Score:</strong> {(safetyEthical.harmfulContentScore * 100).toFixed(1)}% (Lower is better)</p>
                                <p><strong>General Bias Score:</strong> {(safetyEthical.biasScores.general * 100).toFixed(1)}%</p>
                                <p><strong>Transparency Score:</strong> {(safetyEthical.transparencyScore * 100).toFixed(1)}%</p>
                                <p><strong>Explainability Score:</strong> {(safetyEthical.explainabilityScore * 100).toFixed(1)}%</p>
                                <p><strong>Data Privacy:</strong> {safetyEthical.dataPrivacyCompliance.join(', ') || 'N/A'}</p>
                                <p><strong>Responsible AI Adherence:</strong> {safetyEthical.responsibleAIGuidelinesAdherence.join(', ') || 'None stated'}</p>
                                <p><strong>Risk Level:</strong> <span className={`capitalize ${safetyEthical.riskAssessmentLevel === 'high' || safetyEthical.riskAssessmentLevel === 'critical' ? 'text-red-400' : safetyEthical.riskAssessmentLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{safetyEthical.riskAssessmentLevel}</span></p>
                                {safetyEthical.mitigationStrategies && safetyEthical.mitigationStrategies.length > 0 && (
                                    <div className="mt-2">
                                        <h5 className="font-semibold text-gray-300">Mitigation Strategies:</h5>
                                        <ul className="list-disc list-inside text-sm">
                                            {safetyEthical.mitigationStrategies.map((strat, i) => <li key={i}>{strat}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!loadingRelatedData && activeTab === 'versions' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">Version History ({allVersions.length})</h3>
                            <div className="space-y-4">
                                {allVersions.map((v, index) => (
                                    <div key={v.version} className="bg-gray-700 p-4 rounded-md shadow border border-gray-600">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-lg font-semibold text-gray-100">Version: {v.version}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${v.status === 'stable' ? 'bg-green-600' : v.status === 'beta' || v.status === 'preview' ? 'bg-blue-600' : v.status === 'deprecated' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
                                                {v.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">Released: {new Date(v.releaseDate).toLocaleDateString()}</p>
                                        {v.changelogUrl && <p className="mb-1"><a href={v.changelogUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline text-sm">Changelog</a></p>}
                                        {v.featuresAdded && v.featuresAdded.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-green-300">New Features:</p>
                                                <ul className="list-disc list-inside text-green-300 text-sm">
                                                    {v.featuresAdded.map((feat, i) => <li key={i}>{feat}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {v.performanceImprovements && v.performanceImprovements.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-blue-300">Performance Improvements:</p>
                                                <ul className="list-disc list-inside text-blue-300 text-sm">
                                                    {v.performanceImprovements.map((imp, i) => <li key={i}>{imp}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {v.bugFixes && v.bugFixes.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-cyan-300">Bug Fixes:</p>
                                                <ul className="list-disc list-inside text-cyan-300 text-sm">
                                                    {v.bugFixes.map((fix, i) => <li key={i}>{fix}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {v.securityPatches && v.securityPatches.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-orange-300">Security Patches:</p>
                                                <ul className="list-disc list-inside text-orange-300 text-sm">
                                                    {v.securityPatches.map((patch, i) => <li key={i}>{patch}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {v.breakingChanges && v.breakingChanges.length > 0 && (
                                            <div className="mt-2">
                                                <p className="font-semibold text-red-300">Breaking Changes:</p>
                                                <ul className="list-disc list-inside text-red-300 text-sm">
                                                    {v.breakingChanges.map((change, i) => <li key={i}>{change}</li>)}
                                                </ul>
                                                {v.migrationGuideUrl && <p className="text-sm mt-1"><a href={v.migrationGuideUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Migration Guide</a></p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loadingRelatedData && activeTab === 'fine-tuning' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">Fine-tuning Jobs ({fineTuningJobs.length})</h3>
                            {model.isCustomizable ? (
                                <>
                                    <Button className="mb-4">Start New Fine-tuning Job</Button>
                                    {fineTuningJobs.length === 0 ? (
                                        <p className="text-gray-400">No fine-tuning jobs found for this model. <span className="text-indigo-400">Click "Start New Fine-tuning Job" to begin.</span></p>
                                    ) : (
                                        <div className="space-y-4">
                                            {fineTuningJobs.map(job => (
                                                <div key={job.jobId} className="bg-gray-700 p-4 rounded-md shadow border border-gray-600">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-100">Job: {job.fineTunedModelName || job.jobId}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${job.status === 'completed' ? 'bg-green-600' : job.status === 'running' ? 'bg-blue-600' : job.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'} text-white`}>
                                                            {job.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400">Base Model: {job.baseModelDisplayName}</p>
                                                    <p className="text-sm text-gray-400">Dataset: <a href={`#dataset-${job.datasetId}`} className="text-indigo-400 hover:underline">{findDatasetName(job.datasetId)}</a></p>
                                                    <p className="text-sm text-gray-400">Started: {new Date(job.startTime).toLocaleString()}</p>
                                                    {job.endTime && <p className="text-sm text-gray-400">Completed: {new Date(job.endTime).toLocaleString()}</p>}
                                                    {job.fineTunedModelId && <p className="text-sm text-gray-400">Resulting Model ID: <span className="text-indigo-400">{job.fineTunedModelId}</span></p>}
                                                    {job.costEstimate && <p className="text-sm text-gray-400">Estimated Cost: ${job.costEstimate.toFixed(2)}</p>}
                                                    {job.actualCost && <p className="text-sm text-gray-400">Actual Cost: ${job.actualCost.toFixed(2)}</p>}
                                                    {job.metrics && (
                                                        <div className="mt-2 text-sm text-gray-400">
                                                            <p className="font-semibold text-gray-200">Metrics:</p>
                                                            <ul className="list-disc list-inside">
                                                                {Object.entries(job.metrics).map(([key, value]) => (
                                                                    <li key={key}>{key}: {typeof value === 'number' ? value.toFixed(3) : value}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {job.hyperparameters && (
                                                        <div className="mt-2 text-sm text-gray-400">
                                                            <p className="font-semibold text-gray-200">Hyperparameters:</p>
                                                            <pre className="bg-gray-800 p-2 rounded-md overflow-x-auto text-xs">{JSON.stringify(job.hyperparameters, null, 2)}</pre>
                                                        </div>
                                                    )}
                                                    {job.logsUrl && <p className="text-sm mt-2"><a href={job.logsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">View Logs</a></p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-400">This model is not customizable via fine-tuning or has no public fine-tuning interface.</p>
                            )}
                        </div>
                    )}

                    {!loadingRelatedData && activeTab === 'deployments' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">Deployments ({deployments.length})</h3>
                            <Button className="mb-4">Create New Deployment</Button>
                            {deployments.length === 0 ? (
                                <p className="text-gray-400">No deployments found for this model. <span className="text-indigo-400">Click "Create New Deployment" to set up an endpoint.</span></p>
                            ) : (
                                <div className="space-y-4">
                                    {deployments.map(dep => (
                                        <div key={dep.deploymentId} className="bg-gray-700 p-4 rounded-md shadow border border-gray-600">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-lg font-semibold text-gray-100">Deployment: {dep.deploymentId}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${dep.status === 'deployed' ? 'bg-green-600' : dep.status === 'provisioning' || dep.status === 'scaling' ? 'bg-blue-600' : dep.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'} text-white`}>
                                                    {dep.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">Model Version: {dep.version}</p>
                                            <p className="text-sm text-gray-400">Region: {dep.region}</p>
                                            <p className="text-sm text-gray-400">Endpoint: <a href={dep.endpointUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{dep.endpointUrl}</a></p>
                                            {dep.customDomain && <p className="text-sm text-gray-400">Custom Domain: <a href={`https://${dep.customDomain}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{dep.customDomain}</a></p>}
                                            <p className="text-sm text-gray-400">Scaling: {dep.scalingConfig.minNodes}-{dep.scalingConfig.maxNodes} nodes (Auto-scale: {dep.scalingConfig.autoScaleEnabled ? 'Enabled' : 'Disabled'})</p>
                                            <p className="text-sm text-gray-400">Cost Est.: ${dep.costEstimatePerHour.toFixed(2)}/hour {dep.actualCostPerHour && `(Actual: $${dep.actualCostPerHour.toFixed(2)}/hour)`}</p>
                                            <p className="text-sm text-gray-400">Health: <span className={`capitalize ${dep.healthStatus === 'healthy' ? 'text-green-400' : dep.healthStatus === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>{dep.healthStatus}</span></p>
                                            <p className="text-sm text-gray-400">Created: {new Date(dep.creationDate).toLocaleString()}</p>
                                            <p className="text-sm text-gray-400">Last Updated: {new Date(dep.lastUpdated).toLocaleString()}</p>
                                            <div className="mt-2 flex space-x-2">
                                                <Button variant="secondary" className="text-xs py-1">Manage Scaling</Button>
                                                <Button variant="danger" className="text-xs py-1">Delete Deployment</Button>
                                                {dep.monitoringDashboardUrl && <Button variant="ghost" className="text-xs py-1"><a href={dep.monitoringDashboardUrl} target="_blank" rel="noopener noreferrer">Monitoring</a></Button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!loadingRelatedData && activeTab === 'experiments' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">Experiments Involving This Model ({experiments.length})</h3>
                            <Button className="mb-4">Create New Experiment</Button>
                            {experiments.length === 0 ? (
                                <p className="text-gray-400">No experiments found for this model. <span className="text-indigo-400">Click "Create New Experiment" to start an A/B test.</span></p>
                            ) : (
                                <div className="space-y-4">
                                    {experiments.map(exp => (
                                        <div key={exp.experimentId} className="bg-gray-700 p-4 rounded-md shadow border border-gray-600">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-lg font-semibold text-gray-100">Experiment: {exp.name}</h4>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${exp.status === 'running' ? 'bg-blue-600' : exp.status === 'completed' ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                                                    {exp.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">Description: {exp.description}</p>
                                            <p className="text-sm text-gray-400">Started: {new Date(exp.startTime).toLocaleString()}</p>
                                            {exp.endTime && <p className="text-sm text-gray-400">Ended: {new Date(exp.endTime).toLocaleString()}</p>}
                                            {exp.createdBy && <p className="text-sm text-gray-400">Created By: {exp.createdBy}</p>}
                                            <div className="mt-2">
                                                <p className="font-semibold text-gray-200">Variants:</p>
                                                <ul className="list-disc list-inside text-sm text-gray-400">
                                                    {exp.variants.map((variant, i) => (
                                                        <li key={i}>{variant.variantName} (Model: <span className="text-indigo-400">{variant.modelId}</span>) - {variant.trafficSplit * 100}% Traffic</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="mt-2">
                                                <p className="font-semibold text-gray-200">Metrics Tracked:</p>
                                                <p className="text-sm text-gray-400">{exp.metricsToTrack.join(', ')}</p>
                                            </div>
                                            {exp.dashboardUrl && <p className="text-sm mt-2"><a href={exp.dashboardUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">View Dashboard</a></p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!loadingRelatedData && activeTab === 'api' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">API & Integration</h3>
                            <p className="text-gray-400 mb-4">Explore how to integrate this model into your applications.</p>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-200">API Reference:</h4>
                                    {model.apiReferenceUrl ? (
                                        <p><a href={model.apiReferenceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{model.apiReferenceUrl}</a></p>
                                    ) : <p className="text-gray-500">API Reference not available or not applicable (e.g., self-hosted).</p>}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-200">Default Inference Endpoint:</h4>
                                    {model.inferenceEndpointUrl ? (
                                        <p className="bg-gray-700 p-3 rounded-md font-mono text-sm text-indigo-200 break-all">{model.inferenceEndpointUrl}</p>
                                    ) : <p className="text-gray-500">Default endpoint not specified. Check deployments for custom endpoints.</p>}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-200">Playground:</h4>
                                    {model.playgroundUrl ? (
                                        <p><a href={model.playgroundUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{model.playgroundUrl}</a></p>
                                    ) : <p className="text-gray-500">Playground not available.</p>}
                                </div>
                                {model.exampleCode && model.exampleCode.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-200">Example Usage:</h4>
                                        {model.exampleCode.map((example, index) => (
                                            <div key={index} className="mb-4">
                                                <p className="text-gray-400 text-sm mb-1"><strong>{example.language}:</strong> {example.description}</p>
                                                <pre className="bg-gray-900 p-4 rounded-md text-sm text-green-300 overflow-x-auto">
                                                    <code>{example.snippet}</code>
                                                </pre>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {tools.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-200 mb-2">Available Tools (Function Calling):</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {tools.map(tool => (
                                                <div key={tool.id} className="bg-gray-700 p-3 rounded-md flex items-center">
                                                    {tool.iconUrl && <img src={tool.iconUrl} alt={tool.name} className="h-6 w-6 mr-3" />}
                                                    <div>
                                                        <p className="font-semibold text-gray-100">{tool.name}</p>
                                                        <p className="text-xs text-gray-400">{tool.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {!loadingRelatedData && activeTab === 'agentic-workflows' && (
                        <div>
                            <h3 className="text-xl font-semibold text-gray-100 mb-3">Agentic Workflows ({agenticWorkflows.length})</h3>
                            {model.capabilities.some(cap => cap.id === 'agentic') ? (
                                <>
                                    <Button className="mb-4">Create New Workflow</Button>
                                    {agenticWorkflows.length === 0 ? (
                                        <p className="text-gray-400">No agentic workflows found using this model. <span className="text-indigo-400">Click "Create New Workflow" to build one.</span></p>
                                    ) : (
                                        <div className="space-y-4">
                                            {agenticWorkflows.map(wf => (
                                                <div key={wf.id} className="bg-gray-700 p-4 rounded-md shadow border border-gray-600">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-100">Workflow: {wf.name}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${wf.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white`}>
                                                            {wf.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 mb-2">Description: {wf.description}</p>
                                                    <p className="text-sm text-gray-400">Version: {wf.version} | Created: {new Date(wf.createdAt).toLocaleDateString()}</p>
                                                    <div className="mt-2">
                                                        <p className="font-semibold text-gray-200">Models Involved:</p>
                                                        <ul className="list-disc list-inside text-sm text-gray-400">
                                                            {wf.modelsUsed.map((mId, i) => (
                                                                <li key={i}><span className="text-indigo-400">{mId}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="font-semibold text-gray-200">Tools Involved:</p>
                                                        <ul className="list-disc list-inside text-sm text-gray-400">
                                                            {wf.toolsUsed.map((tId, i) => (
                                                                <li key={i}><span className="text-indigo-400">{tId}</span></li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="font-semibold text-gray-200">Key Steps:</p>
                                                        <ol className="list-decimal list-inside text-sm text-gray-400">
                                                            {wf.steps.map((step, i) => (
                                                                <li key={i}><span className="capitalize">{step.type.replace(/_/g, ' ')}:</span> {step.logic || step.refId}</li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                    {wf.playgroundUrl && <p className="text-sm mt-2"><a href={wf.playgroundUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Test Workflow in Playground</a></p>}
                                                    {wf.diagramUrl && <p className="text-sm mt-2"><a href={wf.diagramUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">View Workflow Diagram</a></p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-400">This model does not directly support agentic capabilities or is not commonly used in agentic workflows.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


/**
 * Filter and Search Bar for models.
 */
export const ModelFilterSidebar: React.FC = () => {
    const { filters, setFilters, providers, capabilities, domains, useCases, tags, loadingMetadata } = useModelUniverse();
    const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearchTerm !== filters.searchTerm) {
                setFilters(prev => ({ ...prev, searchTerm: localSearchTerm }));
            }
        }, 300); // Debounce search input
        return () => clearTimeout(handler);
    }, [localSearchTerm, filters.searchTerm, setFilters]);

    const handleFilterChange = (filterName: keyof ModelFilterOptions, value: any) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleMultiSelectChange = (filterName: keyof ModelFilterOptions, optionId: string, isChecked: boolean) => {
        setFilters(prev => {
            const currentIds = (prev[filterName] as string[] || []);
            if (isChecked) {
                return { ...prev, [filterName]: [...currentIds, optionId] };
            } else {
                return { ...prev, [filterName]: currentIds.filter(id => id !== optionId) };
            }
        });
    };

    if (loadingMetadata) {
        return <div className="w-64 p-4 bg-gray-900 text-gray-300 border-r border-gray-700 flex-shrink-0"><LoadingSpinner /></div>;
    }

    return (
        <div className="w-64 p-4 bg-gray-900 text-gray-300 border-r border-gray-700 flex-shrink-0 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Filters</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                <input
                    type="text"
                    placeholder="Search models..."
                    className="w-full bg-gray-700 rounded p-2 text-gray-200 border border-gray-600 focus:outline-none focus:border-indigo-500"
                    value={localSearchTerm}
                    onChange={(e) => setLocalSearchTerm(e.target.value)}
                />
            </div>

            <