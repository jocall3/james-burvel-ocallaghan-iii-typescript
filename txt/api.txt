// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import consumeStream to handle functions that should return a promise instead of a stream.
import { streamContent, generateJson, generateContent, generateContentWithImage, consumeStream } from './geminiCore';
import type { ColorTheme, StructuredExplanation, StructuredPrSummary, GeneratedFile, CronParts } from '../types';
import { Type } from "@google/genai";
// FIX: Import pipeline documentation to be used by the new function.
import { PIPELINE_TOOLS_DOCUMENTATION } from './pipelineTools';

// FIX: Implement all missing API functions that are used by the feature components.

export const debugErrorStream = (error: Error) => {
    const prompt = `A developer is facing an error in their application. Explain the error in a clear, concise way and suggest possible causes and solutions. Be helpful and encouraging. Format the output as Markdown.

    **Error Message:** ${error.message}
    **Stack Trace:**
    ${error.stack}`;
    return streamContent(prompt, "You are an expert software debugger and a helpful AI assistant.");
};

export const generateCommitMessageStream = (diff: string) => {
    const prompt = `Based on the following git diff, generate a conventional commit message. The message should follow the format: <type>(<scope>): <subject>. The body should explain the 'what' and 'why' of the changes. Do not wrap the output in markdown backticks.

    **Git Diff:**
    \`\`\`diff
    ${diff}
    \`\`\`
    `;
    return streamContent(prompt, "You are an expert at writing conventional commit messages based on git diffs.");
};

const structuredExplanationSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: 'A high-level summary of what the code does.' },
        lineByLine: {
            type: Type.ARRAY,
            description: 'An array explaining specific lines or blocks of code.',
            items: {
                type: Type.OBJECT,
                properties: {
                    lines: { type: Type.STRING, description: 'The line number(s) being explained (e.g., "1-5").' },
                    explanation: { type: Type.STRING, description: 'The explanation for that line/block.' },
                },
                required: ["lines", "explanation"]
            }
        },
        complexity: {
            type: Type.OBJECT,
            description: 'Big O notation for time and space complexity.',
            properties: {
                time: { type: Type.STRING, description: 'Time complexity (e.g., "O(n^2)").' },
                space: { type: Type.STRING, description: 'Space complexity (e.g., "O(1)").' },
            },
            required: ["time", "space"]
        },
        suggestions: {
            type: Type.ARRAY,
            description: 'An array of suggestions for improving or refactoring the code.',
            items: { type: Type.STRING }
        }
    },
    required: ["summary", "lineByLine", "complexity", "suggestions"]
};

export const explainCodeStructured = (code: string): Promise<StructuredExplanation> => {
    const prompt = `Analyze the following code snippet and provide a structured explanation.

    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return generateJson<StructuredExplanation>(prompt, "You are a senior software engineer who excels at explaining code clearly and concisely.", structuredExplanationSchema);
};

export const reviewCodeStream = (code: string) => {
    const prompt = `Please review the following code. Identify any bugs, style issues, or areas for improvement. Provide constructive feedback formatted as markdown.

    **Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an expert code reviewer, providing detailed and helpful feedback.");
};

export const transferCodeStyleStream = ({ code, styleGuide }: { code: string; styleGuide: string }) => {
    const prompt = `Rewrite the following code snippet to adhere to the provided style guide. Only output the rewritten code, wrapped in a markdown code block.

    **Style Guide:**
    ${styleGuide}

    **Original Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an AI code formatter that strictly adheres to style guides.");
};

export const formatCodeStream = (code: string) => {
    const prompt = `Format the following code snippet according to standard best practices (like Prettier for JavaScript/TypeScript). Only output the formatted code, wrapped in a markdown code block.

    **Unformatted Code:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an AI code formatter that produces clean, readable code.");
};

export const generateCodingChallengeStream = (topic: string | null) => {
    const prompt = `Generate a unique coding challenge. Include a problem description, examples, and constraints. The topic is: ${topic || 'a general algorithm problem'}. Format the output as markdown.`;
    return streamContent(prompt, "You are a programming challenge creator for a platform like LeetCode or HackerRank.");
};

export const generateUnitTestsStream = (code: string) => {
    const prompt = `Write a suite of unit tests for the following code using a popular testing framework (like Jest for JavaScript/React or pytest for Python). Cover edge cases. Only output the test code, wrapped in a markdown code block.

    **Code to Test:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are a software engineer specializing in test-driven development.");
};

export const generateRegExStream = (description: string) => {
    const prompt = `Generate a JavaScript regex literal (e.g., \`/.../g\`) for the following description. Provide only the regex itself, not in a code block. Description: "${description}"`;
    return streamContent(prompt, "You are an expert in regular expressions.");
};

export const migrateCodeStream = (code: string, from: string, to: string) => {
    const prompt = `Translate the following code snippet from ${from} to ${to}. Only output the translated code, wrapped in a markdown code block.

    **Source Code (${from}):**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, `You are an expert polyglot programmer who can translate code between any two languages or frameworks.`);
};

export const generateComponentFromImageStream = (base64Image: string) => {
    const prompt = `Based on this image, generate a single-file React component using JSX and Tailwind CSS. The component should be functional and visually similar to the screenshot. Only output the raw code, without any markdown formatting.`;
    const imagePart = { inlineData: { mimeType: 'image/png', data: base64Image } };
    return streamContent({ parts: [imagePart, { text: prompt }] }, "You are an expert frontend developer specializing in React and Tailwind CSS.");
};

export const summarizeNotesStream = (notes: string) => {
    const prompt = `Summarize the following notes into a concise overview with bullet points for key takeaways. Format as markdown.

    **Notes:**
    ${notes}
    `;
    return streamContent(prompt, "You are a productivity assistant skilled at summarizing information.");
};

export const generateThemeFromDescription = (description: string): Promise<ColorTheme> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            primary: { type: Type.STRING, description: 'The primary accent color (e.g., for buttons).' },
            background: { type: Type.STRING, description: 'The main background color of the app.' },
            surface: { type: Type.STRING, description: 'The background color for cards or panels.' },
            textPrimary: { type: Type.STRING, description: 'The color for primary text like headings.' },
            textSecondary: { type: Type.STRING, description: 'The color for secondary, less important text.' },
        },
        required: ['primary', 'background', 'surface', 'textPrimary', 'textSecondary']
    };
    const prompt = `Generate a UI color theme based on the following description: "${description}". Provide hex codes.`;
    return generateJson<ColorTheme>(prompt, "You are a UI/UX designer specializing in color theory.", schema);
};

export const generateChangelogFromLogStream = (log: string) => {
    const prompt = `Convert this raw git log into a user-friendly changelog in markdown format. Group changes by type (e.g., Features, Fixes).

    **Git Log:**
    \`\`\`
    ${log}
    \`\`\`
    `;
    return streamContent(prompt, "You are an AI that helps maintain open-source projects by writing clear changelogs.");
};

export const generateCronFromDescription = (description: string): Promise<CronParts> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            minute: { type: Type.STRING }, hour: { type: Type.STRING }, dayOfMonth: { type: Type.STRING },
            month: { type: Type.STRING }, dayOfWeek: { type: Type.STRING }
        },
        required: ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']
    };
    const prompt = `Convert the following description into a cron expression's parts: "${description}"`;
    return generateJson<CronParts>(prompt, "You are a system administrator expert in cron jobs.", schema);
};

export const generateColorPalette = (baseColor: string): Promise<{ colors: string[] }> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            colors: { type: Type.ARRAY, description: 'An array of 6 hex color codes, from lightest to darkest.', items: { type: Type.STRING } }
        },
        required: ['colors']
    };
    const prompt = `Generate a 6-color palette based on the color ${baseColor}. The palette should be harmonious and suitable for a web UI.`;
    return generateJson<{ colors: string[] }>(prompt, "You are a UI designer specializing in color palettes.", schema);
};

export const analyzeConcurrencyStream = (code: string) => {
    const prompt = `Analyze the following JavaScript code for potential concurrency issues related to Web Workers, such as race conditions or deadlocks. Explain any issues found and suggest solutions. Format as markdown.

    **Code:**
    \`\`\`javascript
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are a senior JavaScript engineer with expertise in multi-threaded programming and Web Workers.");
};

export const convertJsonToXbrlStream = (json: string) => {
    const prompt = `Convert the following JSON object into a simplified, XBRL-like XML format. Use clear, semantic tags based on the JSON keys.

    **JSON:**
    \`\`\`json
    ${json}
    \`\`\`
    `;
    return streamContent(prompt, "You are a data transformation expert specializing in financial data formats.");
};

export const transcribeAudioToCodeStream = (base64Audio: string, mimeType: string) => {
    const prompt = "Transcribe the following audio. The user is dictating code. Format the output as a markdown code block. Be as accurate as possible.";
    const audioPart = { inlineData: { mimeType, data: base64Audio } };
    return streamContent({ parts: [audioPart, { text: prompt }] }, "You are an expert stenographer for programmers.");
};

export const generatePrSummaryStructured = (diff: string): Promise<StructuredPrSummary> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'A concise, one-line title for the pull request.' },
            summary: { type: Type.STRING, description: 'A one-paragraph summary of the changes.' },
            changes: { type: Type.ARRAY, description: 'A bulleted list of the key changes.', items: { type: Type.STRING } },
        },
        required: ['title', 'summary', 'changes']
    };
    const prompt = `Generate a structured pull request summary from the following diff: \n\n\`\`\`diff\n${diff}\n\`\`\``;
    return generateJson<StructuredPrSummary>(prompt, "You are an AI assistant for developers.", schema);
};

export const generateFeature = (prompt: string): Promise<GeneratedFile[]> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            files: {
                type: Type.ARRAY,
                description: "An array of files to be created.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        filePath: { type: Type.STRING, description: "The full path of the file, e.g., 'src/components/MyComponent.tsx'." },
                        content: { type: Type.STRING, description: "The full source code or content of the file." },
                    },
                    required: ["filePath", "content"]
                }
            }
        },
        required: ["files"]
    };
    const systemInstruction = `You are a senior software architect. Based on the user's prompt, generate all the necessary files (code, styles, tests) to implement the feature. Ensure the file paths are logical.`;
    const fullPrompt = `Generate the files for this feature: "${prompt}"`;
    return generateJson<{ files: GeneratedFile[] }>(fullPrompt, systemInstruction, schema, 0.3).then(res => res.files);
};

export const enhanceSnippetStream = (code: string) => {
    const prompt = `Enhance the following code snippet. Add comments, improve variable names, and refactor for clarity and performance if possible. Only output the enhanced code, wrapped in a markdown code block.

    **Original Snippet:**
    \`\`\`
    ${code}
    \`\`\`
    `;
    return streamContent(prompt, "You are an AI pair programmer that improves code quality.");
};

// --- Added 50 new functions ---
export const generateMarketingCopy = (productDescription: string) =>
    streamContent(`Generate compelling marketing copy for a product with the following description: "${productDescription}"`, "You are a senior marketing copywriter.");

export const brainstormIdeas = (topic: string) =>
    generateJson<{ ideas: string[] }>(`Brainstorm a list of creative ideas about: "${topic}"`, "You are a creative assistant.", { type: Type.OBJECT, properties: { ideas: { type: Type.ARRAY, items: { type: Type.STRING }}}, required: ['ideas'] }).then(res => res.ideas);

export const generateUserStories = (featureDescription: string) =>
    streamContent(`Generate user stories in the format "As a [user type], I want [goal] so that [benefit]" for the following feature: "${featureDescription}"`, "You are a product manager.");

export const transcribeMeeting = (base64Audio: string, mimeType: string) =>
    streamContent({ parts: [{ inlineData: { mimeType, data: base64Audio } }, { text: "Transcribe this meeting audio and provide a summary with action items." }] }, "You are a professional meeting transcriber.");

export const detectBias = (text: string) =>
    streamContent(`Analyze the following text for potential ethical biases (e.g., gender, racial, cultural) and provide a constructive report. Text: "${text}"`, "You are an expert in ethical AI and bias detection.");

export const generateProjectHealthReport = (fileList: string) =>
    streamContent(`Analyze this file list and generate a project health report, commenting on structure, potential issues, and positive aspects. Files:\n${fileList}`, "You are a senior software architect.");

export const generateImageCaption = (base64Image: string, mimeType: string) =>
    generateContentWithImage("Generate a descriptive caption and alt-text for this image.", base64Image, mimeType);

export const suggestFileRename = (fileName: string) =>
    generateContent(`Suggest a better, more descriptive file name for a file currently named: "${fileName}"`, "You are a file organization expert.");

export const generateRecipe = (ingredients: string) =>
    streamContent(`Generate a recipe that uses the following ingredients: ${ingredients}`, "You are a professional chef.");

export const findBrokenLinks = (text: string) =>
    streamContent(`Scan the following text and identify any potentially broken or malformed URLs. Text:\n${text}`, "You are a web crawler bot specializing in link validation.");

export const getContextualSuggestions = (context: string) =>
    generateJson<{suggestions: string[]}>(`Based on the current context, suggest three relevant commands or actions. Context: ${context}`, "You are a helpful AI assistant.", {type: Type.OBJECT, properties: {suggestions: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['suggestions']}).then(res => res.suggestions);

export const getVoiceCommandAction = (command: string) =>
    generateContent(`Interpret the following voice command and suggest a corresponding action or feature to execute: "${command}"`, "You are a voice command interpreter for a developer tool.");

export const proactivelyIdentifyProblems = (code: string) =>
    streamContent(`Proactively analyze the following code snippet for potential bugs, anti-patterns, or logical errors. Provide a report. Code: \`\`\`${code}\`\`\``, "You are a proactive AI debugging assistant.");

export const undoLastAiAction = () => Promise.resolve("Undo functionality is complex and requires state management. This is a placeholder for a real implementation.");

export const generateContentTags = (content: string) =>
    generateJson<{tags: string[]}>(`Analyze the following content and suggest 3-5 relevant tags. Content: "${content.substring(0, 1000)}"`, "You are an expert content tagger.", {type: Type.OBJECT, properties: {tags: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['tags']}).then(res => res.tags);

export const semanticSearch = (query: string, documents: string) =>
    streamContent(`Perform a semantic search for "${query}" within the following documents and return the most relevant snippets. Documents: \n${documents}`, "You are a semantic search engine.");

export const generateFileSummary = (content: string) =>
    streamContent(`Provide a concise, one-paragraph summary of the following file content:\n${content.substring(0, 4000)}`, "You are an expert summarizer.");

export const findDuplicateFiles = (fileContents: string) =>
    generateContent(`Analyze the following file contents and identify which files are semantically similar or duplicates. Contents:\n${fileContents}`, "You are a deduplication expert.");

export const suggestArchiveStructure = (fileList: string) =>
    streamContent(`Analyze this project file list to identify old versions and unused assets, then suggest an archive structure. Files:\n${fileList}`, "You are a digital archivist.");

export const summarizeVersionHistory = (gitLog: string) =>
    streamContent(`Summarize the changes between versions based on this git log:\n${gitLog}`, "You are a technical writer specializing in release notes.");

export const extractMetadata = (content: string) =>
    streamContent(`Extract key metadata (author, creation date, topics) from the following text:\n${content.substring(0, 2000)}`, "You are a metadata extraction bot.");

export const mapFileRelationships = (fileContents: string) =>
    streamContent(`Generate a visual graph representation (e.g., using Mermaid.js syntax) of how the files are related based on their content (imports, function calls, etc.). Contents:\n${fileContents}`, "You are a code dependency visualizer.");

export const refactorCodeRealtime = (code: string) =>
    streamContent(`Suggest a refactoring for this code snippet:\n\`\`\`${code}\`\`\``, "You are a real-time AI pair programmer.");

export const completeCode = (code: string) =>
    streamContent(`Complete the following code block:\n\`\`\`${code}\`\`\``, "You are an AI code completion engine.");

export const generateCodeDocumentation = (code: string) =>
    streamContent(`Generate documentation (e.g., JSDoc, Python Docstrings) for the following code. Code:\n\`\`\`${code}\`\`\``, "You are an expert at writing clear code documentation.");

export const debugFromErrorLog = (errorLog: string) =>
    streamContent(`Perform a root cause analysis on the following error log and suggest a fix. Log:\n${errorLog}`, "You are an AI debugging expert.");

export const searchCodeSemantically = (query: string, codeSnippets: string) =>
    streamContent(`Search for code snippets based on their functionality or intent from the following code base:\n${codeSnippets}`, "You are a semantic code search engine.");

export const generateApiClient = (apiSpec: string) =>
    streamContent(`Generate a type-safe API client in TypeScript from the following OpenAPI/Swagger specification:\n${apiSpec}`, "You are an API client generator.");

export const analyzePerformance = (code: string) =>
    streamContent(`Analyze the following code for performance bottlenecks and suggest optimizations. Code:\n\`\`\`${code}\`\`\``, "You are a performance optimization expert.");

export const scanForSecurityVulnerabilities = (code:string) =>
    streamContent(`Scan the following code for common security vulnerabilities (e.g., OWASP Top 10) and provide a report. Code:\n\`\`\`${code}\`\`\``, "You are a senior security engineer.");

export const generateDatabaseQuery = (description: string) =>
    streamContent(`Generate a SQL query based on the following description: "${description}"`, "You are a database administrator.");

export const explainErrorMessage = (errorMessage: string) =>
    streamContent(`Explain this error message and suggest common fixes: "${errorMessage}"`, "You are a helpful debugging assistant.");

export const suggestVariableNames = (code: string) =>
    generateJson<{suggestions: {original: string, suggested: string}[]}>(`Analyze the code and suggest more descriptive variable names. \`\`\`${code}\`\`\``, "You are a clean code expert.", {type:Type.OBJECT, properties:{suggestions:{type:Type.ARRAY, items:{type:Type.OBJECT, properties:{original:{type:Type.STRING}, suggested:{type:Type.STRING}}}}}, required:['suggestions']}).then(res => res.suggestions);

export const findUnusedCode = (projectCode: string) =>
    streamContent(`Scan the project code to find unused functions or variables. Code:\n${projectCode}`, "You are a code maintenance tool.");

export const generateDataVisualizationCode = (data: string, description: string) =>
    streamContent(`Generate JavaScript code using a library like D3.js or Chart.js to create a visualization based on this data and description. Data: ${data}. Description: "${description}"`, "You are a data visualization expert.");

export const generateMockData = (schema: string) =>
    streamContent(`Generate a JSON array of 10 realistic mock data objects based on this schema or description: "${schema}"`, "You are a mock data generator.");

export const generateDesignTokens = (description: string) =>
    streamContent(`Generate a comprehensive set of design tokens (colors, spacing, typography in JSON format) from this brand description: "${description}"`, "You are a design system architect.");

export const generatePaletteFromImage = (base64Image: string, mimeType: string) =>
    generateContentWithImage("Extract a harmonious 5-color palette from this image. Return a JSON array of hex codes.", base64Image, mimeType);

export const anonymizeData = (text: string) =>
    streamContent(`Anonymize the following text by redacting Personally Identifiable Information (PII) like names, emails, and phone numbers. Text:\n${text}`, "You are a data privacy expert.");

export const generateTaskList = (notes: string) =>
    streamContent(`Analyze the following notes and extract a list of actionable tasks. Notes:\n${notes}`, "You are a productivity assistant.");

export const draftEmail = (context: string) =>
    streamContent(`Draft a professional email based on the following context: "${context}"`, "You are a professional communications assistant.");

export const performResearch = (topic: string) =>
    streamContent(`Perform research on the following topic and provide a summary with key points and sources: "${topic}"`, "You are a research assistant.");

// FIX: This function was returning a stream but its usage implies a promise. It now consumes the stream and returns a Promise<string>.
export const translateContent = (text: string, targetLanguage: string) => {
    const stream = streamContent(`Translate the following text to ${targetLanguage}:\n${text}`, "You are a professional translator.");
    return consumeStream(stream);
};

export const generatePresentationOutline = (topic: string) =>
    streamContent(`Generate a structured outline for a presentation on the topic: "${topic}"`, "You are a presentation expert.");

export const assessProjectRisk = (projectDescription: string) =>
    streamContent(`Analyze the following project description to identify potential risks (technical, deadline, resource-related). Description:\n${projectDescription}`, "You are a senior project manager.");

export const generateReport = (data: string) =>
    streamContent(`Generate a narrative report from the following structured data:\n${data}`, "You are a business analyst.");

export const optimizeResources = (systemInfo: string) =>
    streamContent(`Analyze the following system resource usage information and suggest ways to optimize performance:\n${systemInfo}`, "You are a system optimization expert.");

export const manageSoftwareUpdates = (appList: string) =>
    streamContent(`Check for new updates for the following list of installed software and suggest an optimal update schedule:\n${appList}`, "You are a system administrator.");

export const generateDeploymentScript = (projectDescription: string) =>
    streamContent(`Generate a basic deployment script (e.g., Dockerfile or shell script) based on this project description: "${projectDescription}"`, "You are a DevOps engineer.");

// FIX: This function was returning a stream but was typed as returning a Promise, causing a type error. It is now corrected to consume the stream and return a Promise<string> to match its signature and component usage.
export const checkLicenseCompliance = (dependencies: string) => {
    const stream = streamContent(`Scan the following project dependencies for license compatibility issues and generate a report. Dependencies:\n${dependencies}`, "You are a legal tech expert specializing in software licenses.");
    return consumeStream(stream);
};

// FIX: Added missing generatePipelineCode function.
export const generatePipelineCode = (flowDescription: string): Promise<string> => {
    const systemInstruction = `You are an expert software architect specializing in building robust data pipelines in TypeScript.
Your task is to generate a single, executable TypeScript function named 'runPipeline' based on a user-defined flow.
You must use the provided tool documentation to call the correct functions.
Import all required functions from './services/index.ts'.

${PIPELINE_TOOLS_DOCUMENTATION}

- The generated code must be a single function block.
- Do not include any explanations or markdown formatting outside of the code block.
- The output should be raw TypeScript code, starting with imports.
- Ensure the output of one step is correctly passed as input to the next.
- The final function must be named 'runPipeline' and should likely be async.
`;
    const prompt = `Generate the TypeScript pipeline code for the following flow:\n\n${flowDescription}`;
    return generateContent(prompt, systemInstruction);
};

export const checkFileIntegrity = (fileContent: string): Promise<string> => {
    const prompt = `Analyze the following file content for any signs of corruption or unexpected changes and provide a brief report. Content: "${fileContent.substring(0, 500)}..."`;
    return generateContent(prompt, "You are a file integrity analysis system.");
};

export const generateApiDocumentation = (code: string): Promise<string> => {
    const prompt = `Generate API documentation in Markdown format for the following code snippet:\n\n\`\`\`\n${code}\`\`\``;
    return generateContent(prompt, "You are a technical writer who specializes in API documentation.");
};

export const suggestUiImprovements = (uiDescription: string): Promise<string> => {
    const prompt = `Based on the following UI description, suggest 3-5 concrete improvements for usability and aesthetics:\n\n${uiDescription}`;
    return generateContent(prompt, "You are a senior UI/UX designer.");
};

export const generateBusinessPlan = (idea: string): Promise<string> => {
    const prompt = `Generate a basic business plan outline for the following idea: ${idea}`;
    return generateContent(prompt, "You are a business consultant.");
};

export const analyzeSentiment = (text: string): Promise<string> => {
    const prompt = `Analyze the sentiment of the following text and classify it as positive, negative, or neutral, with a brief explanation. Text: "${text}"`;
    return generateContent(prompt, "You are a sentiment analysis expert.");
};

// FIX: The component using this function expects a stream (AsyncGenerator), but the return type was incorrectly set to Promise<string>. Removing the incorrect type annotation allows TypeScript to infer the correct return type.
export const generateAccessibleCode = (description: string) => {
    const prompt = `Generate an accessible HTML/React component based on this description, including ARIA attributes and keyboard navigation considerations: "${description}"`;
    return streamContent(prompt, "You are a web accessibility (a11y) expert.");
};

export const createGitignore = (projectType: string): Promise<string> => {
    const prompt = `Generate a comprehensive .gitignore file for a ${projectType} project.`;
    return generateContent(prompt, "You are a Git expert.");
};

// FIX: This function was returning a stream but was typed as returning a Promise, causing a type error. It is now corrected to consume the stream and return a Promise<string> to match its signature and component usage.
export const convertToAsyncAwait = (code: string) => {
    const stream = streamContent(`Refactor the following JavaScript code from using Promises/.then() or callbacks to use async/await syntax. \`\`\`${code}\`\`\``, "You are a senior JavaScript developer.");
    return consumeStream(stream);
};

export const createDockerfile = (projectDescription: string): Promise<string> => {
    const prompt = `Create a basic, production-ready Dockerfile for a project described as: "${projectDescription}"`;
    return generateContent(prompt, "You are a DevOps expert.");
};

export const getCodeComplexity = (code: string): Promise<string> => {
    const prompt = `Analyze the cyclomatic complexity and maintainability of the following code and provide a brief report. \`\`\`${code}\`\`\``;
    return generateContent(prompt, "You are a software quality analyst.");
};

// --- Added 50 MORE new functions ---

export const explainFolderWithContext = (fileList: string) =>
    streamContent(`Provide a high-level summary of this folder's purpose, identifying project type and key files. Files:\n${fileList}`, "You are a senior project manager AI.");

export const generateIconSet = (theme: string) =>
    streamContent(`Generate a set of 5-7 SVG icons for the theme: "${theme}". Return as a JSON object where keys are icon names and values are SVG strings.`, "You are a vector icon designer.");

export const suggestMeetingAgenda = (topic: string) =>
    streamContent(`Generate a structured meeting agenda for the topic: "${topic}". Include timings, talking points, and attendees.`, "You are an executive assistant.");

export const summarizeDailyActivity = (activityLog: string) =>
    streamContent(`Generate a daily summary of user activity based on this log:\n${activityLog}`, "You are a productivity analyst.");

export const suggestTimeManagement = (taskList: string) =>
    streamContent(`Analyze this task list and suggest an optimal schedule for focused work, including breaks. Tasks:\n${taskList}`, "You are a time management coach.");

export const generateStatusReport = (gitLog: string) =>
    streamContent(`Generate an executive project status report based on this git activity:\n${gitLog}`, "You are a project manager.");

export const suggestLearningPath = (currentSkills: string, goal: string) =>
    streamContent(`Based on current skills ("${currentSkills}") and the goal ("${goal}"), suggest a learning path with resources.`, "You are a career development coach.");

export const estimateProjectBudget = (projectScope: string) =>
    streamContent(`Provide a high-level budget estimate (e.g., hours, cost ranges) for a project with this scope:\n${projectScope}`, "You are a senior project manager with budget expertise.");

export const analyzeWhatIfScenario = (scenario: string) =>
    streamContent(`Analyze the potential outcomes for the following "what if" scenario for a software project:\n${scenario}`, "You are a strategic analyst.");

export const getSystemHealth = (metrics: string) =>
    streamContent(`Analyze these system health metrics and provide predictive alerts or recommendations:\n${metrics}`, "You are a site reliability engineer (SRE).");

export const suggestBackupStrategy = (fileList: string) =>
    streamContent(`Based on this file list and modification patterns, suggest an optimal backup strategy (full vs. incremental, frequency). Files:\n${fileList}`, "You are a data management expert.");

export const migrateData = (sourceData: string, migrationPlan: string) =>
    streamContent(`Based on the migration plan, transform the source data. Plan: ${migrationPlan}\nData: ${sourceData}`, "You are a data migration specialist.");

export const auditSecurity = (serviceConfig: string) =>
    streamContent(`Perform a basic security audit on this service configuration and report potential issues:\n${serviceConfig}`, "You are a security auditor.");

export const filterNotifications = (notifications: string) =>
    streamContent(`Filter and prioritize this list of notifications, providing a summary of the most important items:\n${notifications}`, "You are a smart notification system.");

export const assessPrivacyImpact = (featureDescription: string) =>
    streamContent(`Generate a Data Privacy Impact Assessment (PIA) for this feature:\n${featureDescription}`, "You are a data privacy officer.");

export const optimizeCloudCosts = (usageReport: string) =>
    streamContent(`Analyze this cloud resource usage report and suggest cost-saving optimizations:\n${usageReport}`, "You are a FinOps expert.");

export const assistPromptEngineering = (prompt: string) =>
    streamContent(`Help me improve this prompt for a large language model. Suggest 3 variations to make it more effective. Prompt: "${prompt}"`, "You are a prompt engineering expert.");

export const explainAiReasoning = (output: string, originalPrompt: string) =>
    streamContent(`Explain your reasoning for the following output, given the original prompt. Prompt: "${originalPrompt}"\nOutput: "${output}"`, "You are an explainable AI (XAI) system.");

export const getContextualAiActions = (context: string) =>
    streamContent(`What can AI do here? Based on the context, list all relevant AI actions available in this toolkit. Context: ${context}`, "You are a helpful assistant for the DevCore AI Toolkit.");

export const explainAiConcept = (concept: string) =>
    streamContent(`Explain the following AI concept in simple terms, as if to a beginner: "${concept}"`, "You are an AI educator.");

export const editCollaborativeDocument = (document: string, edits: string) =>
    streamContent(`Incorporate the following edits into the document, resolving any minor conflicts. Document:\n${document}\nEdits:\n${edits}`, "You are a collaborative editor.");

export const generateTeamUpdate = (gitLog: string) =>
    streamContent(`Generate a concise team update message suitable for a Slack channel based on recent project activity from this git log:\n${gitLog}`, "You are a team lead.");

export const resolveMergeConflict = (conflictFile: string) =>
    streamContent(`Analyze this merge conflict file and suggest an optimal resolution. File:\n${conflictFile}`, "You are a senior software engineer expert in Git.");

export const suggestCodeReviewers = (diff: string) =>
    streamContent(`Based on this code diff, suggest 2-3 of the most relevant people to review it from the following list of engineers: [alice, bob, charlie, dave]. Diff:\n${diff}`, "You are a code review assignment bot.");

export const generateProjectBrief = (documents: string) =>
    streamContent(`Generate a comprehensive project brief by summarizing and structuring information from the following documents:\n${documents}`, "You are a project manager.");

export const remixCreativeAssets = (description: string) =>
    streamContent(`Generate a script or storyboard for a short video presentation based on this description of available assets: ${description}`, "You are a creative director.");

export const generateStory = (prompt: string) =>
    streamContent(`Write a short narrative story based on this prompt: "${prompt}"`, "You are a creative writer.");

export const generateMusic = (prompt: string) =>
    streamContent(`Describe a short musical piece or sound effect that would fit this description: "${prompt}"`, "You are a music composer.");

export const generate3dModelDescription = (prompt: string) =>
    streamContent(`Describe a basic 3D model (e.g., in terms of primitive shapes and colors) for the following prompt: "${prompt}"`, "You are a 3D modeling assistant.");

export const generatePoem = (prompt: string) =>
    streamContent(`Write a poem or song lyrics based on this topic or mood: "${prompt}"`, "You are a poet.");

export const generateMarketingCampaign = (product: string) =>
    streamContent(`Generate a high-level marketing campaign outline for this product: ${product}`, "You are a marketing strategist.");

export const generateResearchOutline = (topic: string) =>
    streamContent(`Generate a structured outline for a research paper on this topic: "${topic}"`, "You are a research assistant.");

export const adviseOnPrivacy = (sharingContext: string) =>
    streamContent(`Advise on the privacy implications of this file sharing scenario: "${sharingContext}"`, "You are a data privacy advisor.");

export const simulateEthicalDilemma = (dilemma: string) =>
    streamContent(`Simulate a response to the following ethical dilemma related to AI use: "${dilemma}"`, "You are an AI ethics simulator.");

export const generatePersonalizedTheme = (description: string) =>
    streamContent(`Generate a full CSS theme (colors, fonts, spacing) based on this user description: "${description}"`, "You are a UI personalization expert.");

export const walkthroughFeature = (featureName: string) =>
    streamContent(`Provide an interactive, step-by-step walkthrough for how to use the "${featureName}" feature.`, "You are an interactive tutorial guide.");

export const customizeZenMode = (preferences: string) =>
    streamContent(`Based on these preferences, describe a customized "Zen Mode" UI for a focused work session: "${preferences}"`, "You are a UI customization expert.");

export const explainFeature = (featureName: string) =>
    streamContent(`Provide a detailed explanation and usage examples for the feature named "${featureName}".`, "You are a helpful AI assistant for this toolkit.");

export const findOrphanedFiles = (fileList: string) =>
    streamContent(`From this file list, identify files that appear to be unlinked or irrelevant to any active project:\n${fileList}`, "You are a project cleanup tool.");

export const analyzeDiskSpace = (usageData: string) =>
    streamContent(`Provide a detailed breakdown and visualization (using text/markdown) of this disk space usage data:\n${usageData}`, "You are a disk space analysis tool.");

export const optimizeProjectStorage = (fileList: string) =>
    streamContent(`Analyze this project folder's file list and suggest ways to optimize its storage footprint (e.g., compressing assets, removing caches). Files:\n${fileList}`, "You are a storage optimization expert.");

export const summarizeMeetingNotes = (notes: string) =>
    streamContent(`Summarize these meeting notes and automatically format them for sharing:\n${notes}`, "You are an executive assistant.");

export const findCollaborators = (projectDescription: string) =>
    streamContent(`Based on this project description, suggest the types of collaborators or roles that would be beneficial to the team:\n${projectDescription}`, "You are a project management assistant.");

export const aggregateFeedback = (feedbackList: string) =>
    streamContent(`Aggregate and summarize the key themes from this list of user feedback:\n${feedbackList}`, "You are a user research analyst.");

export const generateGameAssets = (description: string) =>
    streamContent(`Describe a set of 2D game assets (e.g., character sprites, tiles) based on this description: "${description}"`, "You are a game asset designer.");

export const verifyContentAuthenticity = (content: string) =>
    streamContent(`Analyze this text content for signs of AI generation or manipulation and provide an authenticity report:\n"${content.substring(0, 1000)}"`, "You are a content authenticity expert.");

export const generateExplainabilityReport = (modelDescription: string) =>
    streamContent(`Generate a simplified explainability report (e.g., using SHAP or LIME concepts) for an AI model described as: "${modelDescription}"`, "You are an AI ethics and explainability expert.");

// --- Round 1 of 50 new functions ---
export const suggestAccessPermissions = (context: string) => streamContent(`Based on the context "${context}", suggest optimal file access permissions (e.g., read-only, read-write) for different team roles (admin, developer, viewer).`, "You are a security administrator.");
export const cleanupDownloads = (fileList: string) => streamContent(`Categorize the following files from a Downloads folder and suggest target folders for each. Files:\n${fileList}`, "You are a file organization assistant.");
export const suggestFileSync = (fileList: string) => streamContent(`Analyze this file list and suggest which files/folders are optimal for cross-device synchronization. Files:\n${fileList}`, "You are a cloud synchronization expert.");
export const recommendEncryption = (fileList: string) => streamContent(`Analyze this file list and recommend which sensitive files should be encrypted. Files:\n${fileList}`, "You are a cybersecurity analyst.");
export const recommendFileSharing = (context: string) => streamContent(`Based on the context "${context}", suggest the best way to share a file (e.g., email, secure link, cloud storage).`, "You are a collaboration tool expert.");
export const auditFileAccess = (logs: string) => streamContent(`Analyze these file access logs to identify unusual patterns or potential security risks. Logs:\n${logs}`, "You are a security auditor AI.");
export const suggestShortcuts = (actions: string) => streamContent(`Based on this list of repeated user actions, suggest a custom keyboard shortcut to automate the workflow. Actions:\n${actions}`, "You are a productivity expert.");
export const checkSystemHealth = (metrics: string) => streamContent(`Analyze these system health metrics and provide a status report with recommendations. Metrics:\n${metrics}`, "You are a site reliability engineer.");
export const generatePostmortem = (incident: string) => streamContent(`Generate a blame-free incident post-mortem report for the following incident: ${incident}`, "You are a DevOps lead.");
export const generateTerraform = (description: string) => streamContent(`Generate Terraform HCL code for the following infrastructure description: ${description}`, "You are a cloud infrastructure expert.");
export const optimizeCiCdPipeline = (config: string) => streamContent(`Analyze this CI/CD pipeline configuration and suggest optimizations for speed and efficiency. Config:\n${config}`, "You are a DevOps consultant.");
export const generateK8sManifest = (description: string) => streamContent(`Generate a Kubernetes manifest (YAML) for a service described as: ${description}`, "You are a Kubernetes expert.");
export const generateCloudDiagram = (description: string) => streamContent(`Generate a Mermaid.js diagram for a cloud architecture described as: ${description}`, "You are a cloud architect.");
export const detectLogAnomalies = (logs: string) => streamContent(`Analyze these log files and identify any anomalies or potential error patterns. Logs:\n${logs}`, "You are an observability engineer.");
export const calculateSlo = (metrics: string) => streamContent(`Based on these uptime/latency metrics, calculate the SLO and generate a report. Metrics:\n${metrics}`, "You are a site reliability engineer.");
export const generateOnCallSchedule = (constraints: string) => streamContent(`Generate a fair on-call rotation schedule based on these team constraints: ${constraints}`, "You are a team lead.");
export const generateDisasterRecoveryPlan = (system: string) => streamContent(`Draft a disaster recovery (DR) plan for a system described as: ${system}`, "You are a disaster recovery specialist.");
export const detectCloudCostAnomalies = (billingData: string) => streamContent(`Analyze this cloud billing data and find any unexpected cost spikes or anomalies. Data:\n${billingData}`, "You are a FinOps analyst.");
export const decomposeMonolith = (code: string) => streamContent(`Analyze this code from a monolithic application and suggest a logical breakdown into microservices. Code:\n${code}`, "You are a software architect specializing in microservices.");
export const testApiContracts = (spec1: string, spec2: string) => streamContent(`Compare these two API specifications and identify any breaking changes. Spec1:\n${spec1}\n\nSpec2:\n${spec2}`, "You are an API contract testing tool.");
export const identifyArchitecturalPattern = (code: string) => streamContent(`Analyze this code and identify which architectural or design patterns are being used (e.g., Singleton, Factory, MVC). Code:\n${code}`, "You are a software architecture expert.");
export const simulateSystemDesignInterview = (prompt: string, answer: string) => streamContent(`I am a system design interviewer. My prompt is: "${prompt}". The candidate's response is: "${answer}". Provide feedback and ask a follow-up question.`, "You are a senior engineering manager conducting a system design interview.");
export const refactorCodeSmell = (code: string) => streamContent(`This code has a "code smell". Refactor it to improve its quality and explain the change. Code:\n${code}`, "You are a clean code expert.");
export const modernizeLegacyCode = (code: string, pattern: string) => streamContent(`Modernize this legacy code snippet, specifically focusing on replacing the outdated pattern: ${pattern}. Code:\n${code}`, "You are a senior software engineer specializing in modernizing legacy systems.");
export const generateGraphQLSchema = (description: string) => streamContent(`Generate a GraphQL schema based on this description of data entities: ${description}`, "You are a GraphQL expert.");
export const searchCodeByAst = (query: string, code: string) => streamContent(`Perform an AST-based search on the code to find structures matching the query: "${query}". Code:\n${code}`, "You are a code analysis tool.");
export const assistEventStorming = (process: string) => streamContent(`For the business process "${process}", suggest potential domain events, commands, and aggregates for an event-storming session.`, "You are a domain-driven design expert.");
export const generateE2ETest = (flow: string) => streamContent(`Generate an end-to-end test script using Playwright for the following user flow: ${flow}`, "You are a QA automation engineer.");
export const generateCompetitiveAnalysis = (competitors: string) => streamContent(`Generate a competitive analysis report for a company whose competitors are: ${competitors}`, "You are a market analyst.");
export const generateUserPersonas = (audience: string) => streamContent(`Create a detailed user persona for a product with the target audience: "${audience}"`, "You are a UX researcher.");
export const generateAbTestHypothesis = (feature: string) => streamContent(`Suggest three A/B test hypotheses for the following feature: "${feature}"`, "You are a product manager.");
export const generateProductRoadmap = (goals: string) => streamContent(`Generate a visual product roadmap (in Mermaid.js Gantt chart format) based on these goals and features: ${goals}`, "You are a product lead.");
export const generateSwotAnalysis = (product: string) => streamContent(`Generate a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for a product described as: ${product}`, "You are a business strategist.");
export const writePressRelease = (details: string) => streamContent(`Write a professional press release based on these launch details: ${details}`, "You are a public relations specialist.");
export const outlinePitchDeck = (idea: string) => streamContent(`Create an investor pitch deck outline (10 slides) for a business idea: ${idea}`, "You are a startup consultant.");
export const estimateMarketSizing = (product: string) => streamContent(`Provide a rough TAM/SAM/SOM market sizing estimation for a product described as: ${product}`, "You are a market research analyst.");
export const brainstormGtmStrategy = (product: string) => streamContent(`Brainstorm a go-to-market (GTM) strategy for this product: ${product}`, "You are a marketing strategist.");
export const prioritizeFeatures = (features: string) => streamContent(`Score and rank these features using the RICE framework. Features:\n${features}`, "You are a data-driven product manager.");
export const writeVideoScript = (topic: string) => streamContent(`Write an engaging script for a 5-minute YouTube video on the topic: "${topic}"`, "You are a video content creator.");
export const planPodcastEpisode = (topic: string) => streamContent(`Outline a podcast episode on the topic: "${topic}". Include segments, talking points, and guest questions.`, "You are a podcast producer.");
export const buildFictionalWorld = (prompt: string) => streamContent(`Help me build a fictional world. Based on the prompt, expand on the concept: "${prompt}"`, "You are a world-building assistant for writers.");
export const draftGdd = (concept: string) => streamContent(`Draft a Game Design Document (GDD) outline for a game concept: "${concept}"`, "You are a game designer.");
export const generateAdCopy = (product: string) => streamContent(`Generate 3 variations of ad copy for Google Ads for a product described as: "${product}"`, "You are a digital marketing specialist.");
export const generateSeoBrief = (keyword: string) => streamContent(`Create a detailed SEO content brief for a blog post targeting the keyword: "${keyword}"`, "You are an SEO expert.");
export const analyzeBrandVoice = (text: string) => streamContent(`Analyze the brand voice and tone of the following text: "${text}"`, "You are a brand strategist.");
export const summarizeLegalDocument = (document: string) => streamContent(`Summarize this complex legal document in simple, easy-to-understand terms. Document:\n${document}`, "You are a legal analyst AI.");
export const buildResume = (experience: string) => streamContent(`Craft a professional resume and a tailored cover letter based on this experience: ${experience}`, "You are a professional resume writer.");
export const writeSpeech = (prompt: string) => streamContent(`Write a compelling speech for the following occasion and topic: ${prompt}`, "You are a speechwriter.");
export const documentJupyterNotebook = (code: string) => streamContent(`Add markdown explanations to this Jupyter notebook's code cells. Code:\n${code}`, "You are a data science educator.");
export const optimizeSqlQuery = (query: string) => streamContent(`Analyze this slow SQL query and suggest optimizations. Query:\n${query}`, "You are a database performance expert.");
export const assistDataExploration = (prompt: string) => streamContent(`I have a Pandas DataFrame. Suggest the next data exploration steps to take based on my goal: "${prompt}"`, "You are a data exploration assistant.");
export const suggestStatisticalModel = (prompt: string) => streamContent(`For a dataset with these characteristics and this goal, suggest the most appropriate statistical models to use: "${prompt}"`, "You are a statistician.");
export const analyzeSentimentTrends = (data: string) => streamContent(`Analyze this time-series text data for sentiment trends and provide a summary. Data:\n${data}`, "You are a data analyst.");
export const generateDataCleaningScript = (description: string) => streamContent(`Write a Python script to clean a messy dataset described as follows: ${description}`, "You are a data engineer.");
export const suggestFeatureEngineering = (problem: string) => streamContent(`For a machine learning problem described as "${problem}", suggest potential features to engineer.`, "You are a machine learning engineer.");
export const generateModelEvaluationReport = (metrics: string) => streamContent(`Write a model evaluation report based on these metrics: ${metrics}`, "You are a data scientist.");
export const draftAiEthicsStatement = (project: string) => streamContent(`Draft an AI ethics and transparency statement for a project described as: "${project}"`, "You are an AI ethics specialist.");
export const generateSyntheticData = (schema: string) => streamContent(`Generate a realistic but fake CSV dataset for testing based on this schema: "${schema}"`, "You are a synthetic data generator.");

// --- Round 2 of 50 new functions ---
export const generateResourceAllocationPlan = (projectPlan: string) =>
    streamContent(`Based on the following project plan, generate a detailed resource allocation plan including personnel, budget, and time estimates. Project Plan:\n${projectPlan}`, "You are an expert project resource manager.");

export const trackProjectDependencies = (projectFiles: string) =>
    streamContent(`Analyze the provided list of project files and infer their dependencies, outlining potential bottlenecks or critical paths. Files:\n${projectFiles}`, "You are a software dependency analyst.");

export const conductRetrospective = (incidentReport: string) =>
    streamContent(`Conduct a blameless retrospective based on the incident report, identifying root causes, lessons learned, and actionable improvements. Incident Report:\n${incidentReport}`, "You are a DevOps incident manager.");

export const enforceSecurityPolicies = (policyDoc: string, code: string) =>
    streamContent(`Review the given code against the specified security policies. Highlight violations and suggest fixes. Policy:\n${policyDoc}\nCode:\n\`\`\`${code}\`\`\``, "You are a security policy enforcement agent.");

export const auditCompliance = (regulations: string, projectDoc: string) =>
    streamContent(`Audit the project documentation against the following regulations, pointing out areas of non-compliance and suggesting remedies. Regulations:\n${regulations}\nProject Docs:\n${projectDoc}`, "You are a compliance officer.");

export const debugPerformanceIssue = (logs: string, code: string) =>
    streamContent(`Analyze the provided system logs and code snippet to pinpoint performance bottlenecks and suggest optimization strategies. Logs:\n${logs}\nCode:\n\`\`\`${code}\`\`\``, "You are a performance engineering expert.");

export const suggestArchitecturalDecision = (problem: string) =>
    streamContent(`Given the architectural problem: "${problem}", suggest multiple architectural patterns or solutions with their pros and cons.`, "You are a senior software architect.");

export const generateInteractiveStory = (genre: string, theme: string) =>
    streamContent(`Generate the branching narrative and dialogue for a short interactive story in the "${genre}" genre, with the theme of "${theme}".`, "You are a creative narrative designer.");

export const designLessonPlan = (topic: string, audience: string) =>
    streamContent(`Design a comprehensive lesson plan for teaching "${topic}" to a "${audience}" audience. Include objectives, activities, and assessment methods.`, "You are an experienced educator.");

export const generateArtisticStyleDescription = (imageDescription: string) =>
    streamContent(`Based on the image description: "${imageDescription}", generate a detailed description of its artistic style, suitable for an art historian or prompt for an image generator.`, "You are an art critic and AI art prompt engineer.");

export const optimizeServerlessFunctions = (code: string, usageData: string) =>
    streamContent(`Analyze the provided serverless function code and usage data to suggest optimizations for cost, latency, and cold start times. Code:\n\`\`\`${code}\`\`\`\nUsage Data:\n${usageData}`, "You are a serverless architecture expert.");

export const configureEdgeNetwork = (trafficPattern: string) =>
    streamContent(`Based on the expected traffic pattern: "${trafficPattern}", generate a configuration outline for an edge network, including CDN, caching, and routing rules.`, "You are an expert in edge computing and network architecture.");

export const analyzeNetworkTraffic = (trafficLogs: string) =>
    streamContent(`Analyze the following network traffic logs to identify anomalies, potential security threats, or performance issues. Logs:\n${trafficLogs}`, "You are a network security and performance analyst.");

export const explainMlModelOutput = (modelOutput: string, inputData: string) =>
    streamContent(`Given this ML model output and corresponding input data, explain in simple terms why the model arrived at this specific output. Output:\n${modelOutput}\nInput:\n${inputData}`, "You are an expert in Machine Learning explainability (XAI).");

export const versionDataset = (datasetMetadata: string) =>
    streamContent(`Based on the dataset's metadata, suggest a versioning strategy and a method for tracking changes over time. Metadata:\n${datasetMetadata}`, "You are a data management and MLOps specialist.");

export const designMlOpsWorkflow = (modelRequirements: string) =>
    streamContent(`Design a complete MLOps workflow for a model with the following requirements: "${modelRequirements}". Include data pipelines, training, deployment, and monitoring.`, "You are an MLOps engineer.");

export const generateComponentLibrarySnippet = (componentType: string, framework: string) =>
    streamContent(`Generate a reusable UI component snippet for a "${framework}" component library, specifically for a "${componentType}". Include best practices for accessibility and styling.`, "You are a frontend framework expert.");

export const createAnimationKeyframes = (description: string) =>
    streamContent(`Describe a CSS keyframe animation or a Lottie animation sequence based on the following visual description: "${description}".`, "You are a UI animator and motion designer.");

export const auditAccessibility = (uiComponentCode: string) =>
    streamContent(`Perform an accessibility audit on the provided UI component code. Identify WCAG violations and suggest ARIA attributes or structural changes. Code:\n\`\`\`${uiComponentCode}\`\`\``, "You are a web accessibility (a11y) consultant.");

export const analyzePatentDocument = (patentText: string) =>
    streamContent(`Analyze the provided patent document and extract key claims, novelty, and potential prior art categories. Patent Text:\n${patentText}`, "You are a patent analysis expert.");

export const checkGdprCompliance = (dataProcessingDoc: string) =>
    streamContent(`Review the following data processing documentation for GDPR compliance, highlighting any potential breaches or areas for improvement. Documentation:\n${dataProcessingDoc}`, "You are a data privacy legal expert.");

export const designCurriculum = (subject: string, level: string) =>
    streamContent(`Design a detailed curriculum for teaching "${subject}" at a "${level}" level. Include learning outcomes, modules, and project ideas.`, "You are an instructional designer.");

export const explainProblemSolvingSteps = (problem: string) =>
    streamContent(`Walk through the step-by-step process of solving the following problem, breaking it down into logical stages: "${problem}"`, "You are a problem-solving coach.");

export const generateQuizQuestions = (topic: string, difficulty: string) =>
    streamContent(`Generate 5 multiple-choice quiz questions on the topic of "${topic}" at a "${difficulty}" difficulty level, along with correct answers and brief explanations.`, "You are an educational content creator.");

export const createInteractiveTutorial = (codeSnippet: string, concept: string) =>
    streamContent(`Create an interactive tutorial script for explaining the concept "${concept}" using the provided code snippet as an example. Include explanations for each line. Code:\n\`\`\`${codeSnippet}\`\`\``, "You are an expert technical instructor.");

export const generateCodeSandboxConfig = (dependencies: string, code: string) =>
    streamContent(`Generate a \`sandbox.config.json\` or equivalent configuration for a code sandbox environment that includes these dependencies: "${dependencies}" and runs this code: \`\`\`${code}\`\`\``, "You are a code sandbox configuration expert.");

export const recommendDatabaseSchema = (entities: string) =>
    streamContent(`Based on the following description of data entities and their relationships, recommend an optimal relational database schema (SQL DDL) or NoSQL document structure. Entities:\n${entities}`, "You are a database architect.");

export const generateApiGatewayConfig = (endpoints: string) =>
    streamContent(`Generate a configuration for an API Gateway (e.g., AWS API Gateway, Kong) that routes and secures the following endpoints: ${endpoints}`, "You are a cloud networking and API management specialist.");

export const simulateUserJourney = (persona: string, goal: string) =>
    streamContent(`Simulate a detailed user journey for a "${persona}" trying to achieve the goal: "${goal}" within a typical application. Describe steps, thoughts, and potential pain points.`, "You are a UX researcher and user journey mapping expert.");

export const generateReleaseNotes = (featureList: string, bugFixes: string) =>
    streamContent(`Generate professional and user-friendly release notes from the following list of new features and bug fixes. Features:\n${featureList}\nBug Fixes:\n${bugFixes}`, "You are a technical writer for product releases.");

export const createGlossary = (document: string) =>
    streamContent(`Scan the following document and extract key technical terms, providing a concise definition for each to create a glossary. Document:\n${document}`, "You are a technical lexicographer.");

export const generateInterviewQuestions = (role: string, level: string) =>
    streamContent(`Generate 5 behavioral and 5 technical interview questions tailored for a "${level}" "${role}" position.`, "You are a senior HR professional and technical recruiter.");

export const designSystemArchitecture = (requirements: string) =>
    streamContent(`Based on these high-level system requirements, propose a scalable and resilient system architecture, detailing components and their interactions. Requirements:\n${requirements}`, "You are a principal software architect.");

export const generateWhitepaperOutline = (topic: string) =>
    streamContent(`Generate a comprehensive outline for a technical whitepaper on the topic: "${topic}". Include abstract, introduction, problem, solution, and conclusion sections.`, "You are an expert technical writer.");

export const explainTechnicalConcept = (concept: string, targetAudience: string) =>
    streamContent(`Explain the technical concept of "${concept}" to a "${targetAudience}" audience, using appropriate analogies and level of detail.`, "You are a technical communicator and educator.");

export const suggestTeamBuildingActivity = (teamSize: string, objectives: string) =>
    streamContent(`Suggest a team-building activity suitable for a team of "${teamSize}" people with the objectives of "${objectives}".`, "You are an organizational development consultant.");

export const analyzeCustomerFeedback = (feedbackData: string) =>
    streamContent(`Analyze the raw customer feedback data to identify common themes, sentiment, and actionable insights. Feedback Data:\n${feedbackData}`, "You are a customer insights analyst.");

export const predictFutureTrends = (data: string) =>
    streamContent(`Based on the provided historical data, identify patterns and predict potential future trends in the domain. Data:\n${data}`, "You are a data scientist specializing in trend analysis.");

export const generateSocialMediaContent = (campaignGoal: string, product: string) =>
    streamContent(`Generate three social media post ideas (for different platforms like Twitter, LinkedIn, Instagram) for a campaign with the goal "${campaignGoal}" promoting the product "${product}".`, "You are a digital marketing strategist.");

export const planEventLogistics = (eventType: string, attendees: string) =>
    streamContent(`Plan the key logistics for a "${eventType}" event with approximately "${attendees}" attendees. Include venue, catering, AV, and schedule considerations.`, "You are a professional event planner.");

export const optimizeSupplyChain = (supplyChainData: string) =>
    streamContent(`Analyze the provided supply chain data to identify inefficiencies and suggest optimizations for cost reduction and resilience. Supply Chain Data:\n${supplyChainData}`, "You are a supply chain management expert.");

export const generateLegalClause = (context: string, requirement: string) =>
    streamContent(`Draft a concise legal clause or disclaimer for the following context: "${context}", addressing the requirement: "${requirement}".`, "You are a legal AI assistant.");

export const convertLegacyDataFormat = (data: string, fromFormat: string, toFormat: string) =>
    streamContent(`Convert the following data from "${fromFormat}" format to "${toFormat}" format. Data:\n\`\`\`${data}\`\`\``, "You are a data format conversion expert.");

export const createPersonalizedWorkoutPlan = (goal: string, preferences: string) =>
    streamContent(`Create a personalized workout plan for an individual with the goal: "${goal}", considering their preferences: "${preferences}".`, "You are a certified personal trainer.");

export const generateMealPlan = (dietaryNeeds: string, calories: string) =>
    streamContent(`Generate a 7-day meal plan catering to "${dietaryNeeds}" and aiming for approximately "${calories}" calories per day.`, "You are a certified nutritionist.");

export const troubleshootHardwareIssue = (symptoms: string) =>
    streamContent(`Based on the reported symptoms: "${symptoms}", diagnose potential hardware issues and suggest troubleshooting steps.`, "You are a hardware diagnostics expert.");

export const createEducationalContent = (topic: string, format: string) =>
    streamContent(`Create engaging educational content about "${topic}" in a "${format}" format (e.g., short article, script for a video, interactive quiz).`, "You are an educational content designer.");

export const generateInteractiveDemo = (featureDescription: string) =>
    streamContent(`Describe the steps and visual elements for an interactive product demo showcasing the feature: "${featureDescription}".`, "You are a product demonstration specialist.");

export const evaluateSoftwareVendor = (vendorProfile: string, requirements: string) =>
    streamContent(`Evaluate the provided software vendor profile against the specified project requirements and provide a recommendation. Vendor Profile:\n${vendorProfile}\nRequirements:\n${requirements}`, "You are a software procurement analyst.");

export const generateDataRetentionPolicy = (dataType: string, regulations: string) =>
    streamContent(`Draft a data retention policy for "${dataType}" based on the following regulations and best practices: "${regulations}".`, "You are a data governance expert.");