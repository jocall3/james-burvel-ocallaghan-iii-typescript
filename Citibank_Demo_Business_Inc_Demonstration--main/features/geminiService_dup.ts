// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { GoogleGenAI, Type } from "@google/genai";
import type { OrganizationSuggestion, FileNode, DashboardData } from '../types';
import * as db from './database';
import { readFileContent } from './fileSystemService';

// Exported interfaces for structured AI responses
export interface CodeImprovementSuggestion {
  overallFeedback: string;
  refactorings?: Array<{
    suggestion: string;
    oldCodeSnippet?: string;
    newCodeSnippet?: string;
    reason: string;
  }>;
  performanceOptimizations?: Array<{
    suggestion: string;
    codeSnippet?: string;
    reason: string;
  }>;
  securityNotes?: Array<{
    issue: string;
    codeSnippet?: string;
    recommendation: string;
  }>;
}

export interface ErrorDiagnosis {
  diagnosis: string;
  possibleCauses: string[];
  suggestedFixes: Array<{
    fixDescription: string;
    codeSnippet?: string;
  }>;
}

export interface CodeReviewFeedback {
  overallRating: string;
  reviewComments: Array<{
    category: 'Readability' | 'Performance' | 'Maintainability' | 'Bugs' | 'Security' | 'Style' | 'Other';
    lineNumber?: number;
    snippet?: string;
    comment: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
  }>;
  summaryOfImprovements?: string;
}

const MODEL_NAME = 'gemini-2.5-flash';
// FIX: Use VITE_GEMINI_API_KEY consistent with vite.config.ts and .env.local
const API_KEY = process.env.VITE_GEMINI_API_KEY; 

if (!API_KEY) {
  // FIX: Updated error message for consistency.
  throw new Error("VITE_GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Constants for content limits when interacting with AI models
const MAX_PREVIEW_LENGTH = 2000; // Max characters for file previews
const MAX_CODE_ANALYZE_LENGTH = 8000; // Max characters for code analysis (refactoring, review, diagnosis)
const MAX_SEMANTIC_SEARCH_CONTENT_LENGTH = 4000; // Max characters for content sent during semantic search

const organizationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      folderName: {
        type: Type.STRING,
        description: 'The suggested name for the new folder.',
      },
      fileNames: {
        type: Type.ARRAY,
        description: 'An array of file names that should be moved into this folder.',
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["folderName", "fileNames"],
  },
};

const dashboardSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise, one-paragraph summary of the folder's purpose and contents."
    },
    projectType: {
      type: Type.STRING,
      description: "A short label for the detected project type (e.g., 'React Application', 'Image Collection', 'Python Scripts', 'Document Archive')."
    },
    keyFiles: {
      type: Type.ARRAY,
      description: "An array of the 3-5 most important files in this directory.",
      items: {
        type: Type.OBJECT,
        properties: {
          fileName: { type: Type.STRING, description: "The name of the key file." },
          reason: { type: Type.STRING, description: "A brief, one-sentence reason why this file is important." }
        },
        required: ['fileName', 'reason']
      }
    },
    suggestedActions: {
      type: Type.ARRAY,
      description: "A list of 2-3 suggested next actions for the user.",
      items: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING, description: "A short, actionable suggestion (e.g., 'Install dependencies')." },
          command: { type: Type.STRING, description: "An optional terminal command related to the action (e.g., 'npm install')." }
        },
        required: ['action']
      }
    },
    techStack: {
      type: Type.ARRAY,
      description: "A list of technologies, libraries, or frameworks detected in the folder.",
      items: { type: Type.STRING }
    }
  },
  required: ['summary', 'projectType', 'keyFiles', 'suggestedActions', 'techStack']
};

const codeImprovementSchema = {
  type: Type.OBJECT,
  properties: {
    overallFeedback: {
      type: Type.STRING,
      description: "A high-level summary of the code's quality and potential areas for improvement."
    },
    refactorings: {
      type: Type.ARRAY,
      description: "Specific suggestions for refactoring or improving code structure.",
      items: {
        type: Type.OBJECT,
        properties: {
          suggestion: { type: Type.STRING, description: "Description of the refactoring." },
          oldCodeSnippet: { type: Type.STRING, description: "Original code snippet to be refactored (if applicable)." },
          newCodeSnippet: { type: Type.STRING, description: "Suggested new code snippet (if applicable)." },
          reason: { type: Type.STRING, description: "Why this refactoring is beneficial." }
        },
        required: ['suggestion', 'reason']
      }
    },
    performanceOptimizations: {
      type: Type.ARRAY,
      description: "Suggestions for improving performance.",
      items: {
        type: Type.OBJECT,
        properties: {
          suggestion: { type: Type.STRING, description: "Description of the optimization." },
          codeSnippet: { type: Type.STRING, description: "Relevant code snippet." },
          reason: { type: Type.STRING, description: "Why this optimization is beneficial." }
        },
        required: ['suggestion', 'reason']
      }
    },
    securityNotes: {
      type: Type.ARRAY,
      description: "Potential security vulnerabilities or best practices to consider.",
      items: {
        type: Type.OBJECT,
        properties: {
          issue: { type: Type.STRING, description: "Description of the security issue." },
          codeSnippet: { type: Type.STRING, description: "Relevant code snippet." },
          recommendation: { type: Type.STRING, description: "Suggested fix or mitigation." }
        },
        required: ['issue', 'recommendation']
      }
    }
  },
  required: ['overallFeedback']
};

const errorDiagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: {
      type: Type.STRING,
      description: "A clear explanation of the error message."
    },
    possibleCauses: {
      type: Type.ARRAY,
      description: "A list of potential reasons for the error.",
      items: { type: Type.STRING }
    },
    suggestedFixes: {
      type: Type.ARRAY,
      description: "Actionable steps or code modifications to resolve the error.",
      items: {
        type: Type.OBJECT,
        properties: {
          fixDescription: { type: Type.STRING, description: "Description of the suggested fix." },
          codeSnippet: { type: Type.STRING, description: "Optional code snippet illustrating the fix." }
        },
        required: ['fixDescription']
      }
    }
  },
  required: ['diagnosis', 'possibleCauses', 'suggestedFixes']
};

const codeReviewSchema = {
  type: Type.OBJECT,
  properties: {
    overallRating: {
      type: Type.STRING,
      description: "A general statement about the code's quality, e.g., 'Good', 'Needs Improvement', 'Excellent'."
    },
    reviewComments: {
      type: Type.ARRAY,
      description: "Detailed comments on various aspects of the code.",
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Category of the comment (e.g., 'Readability', 'Performance', 'Maintainability', 'Bugs', 'Security', 'Style')."
          },
          lineNumber: { type: Type.NUMBER, description: "Optional line number for the comment." },
          snippet: { type: Type.STRING, description: "Optional code snippet related to the comment." },
          comment: { type: Type.STRING, description: "The detailed review comment." },
          severity: { type: Type.STRING, description: "Severity of the issue (e.g., 'Low', 'Medium', 'High', 'Critical')." }
        },
        required: ['category', 'comment', 'severity']
      }
    },
    summaryOfImprovements: {
      type: Type.STRING,
      description: "A concluding summary of key areas for improvement."
    }
  },
  required: ['overallRating', 'reviewComments']
};

/**
 * Suggests a logical folder structure for a given list of file names.
 * @param fileNames - An array of file names to organize.
 * @returns A promise that resolves to an array of organization suggestions.
 */
export async function suggestOrganization(fileNames: string[]): Promise<OrganizationSuggestion[]> {
  if (fileNames.length === 0) return [];
  const prompt = `Given the following list of file names, suggest a folder structure. Group related files into new folders.
  File list: ${fileNames.join(', ')}`;
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt, config: { responseMimeType: "application/json", responseSchema: organizationSchema }});
  const suggestions = JSON.parse(response.text.trim()) as OrganizationSuggestion[];
  const validFileNames = new Set(fileNames);
  return suggestions.map(s => ({ ...s, fileNames: s.fileNames.filter(f => validFileNames.has(f)) })).filter(s => s.fileNames.length > 0);
}

/**
 * Explains the probable purpose of a folder based on its contents' filenames.
 * @param fileNames - An array of file names within the folder.
 * @returns A promise that resolves to a string summarizing the folder's purpose.
 */
export async function explainFolder(fileNames: string[]): Promise<string> {
  if (fileNames.length === 0) return "This folder is empty.";
  const prompt = `Based on these filenames, summarize the folder's purpose: ${fileNames.join(', ')}`;
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  return response.text;
}

/**
 * Generates a brief, one-sentence preview summary of a file's content.
 * @param fileName - The name of the file.
 * @param fileContent - The content of the file.
 * @returns A promise that resolves to a one-sentence summary.
 */
export async function generatePreview(fileName: string, fileContent: string): Promise<string> {
    const prompt = `Provide a very brief, one-sentence summary of the file named "${fileName}". Content excerpt: "${fileContent.substring(0, MAX_PREVIEW_LENGTH)}"`;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text;
}

/**
 * Performs a semantic search across file contents based on a user query.
 * @param query - The search query.
 * @param rootHandle - The root directory handle to resolve file paths.
 * @returns A promise that resolves to an array of relevant FileNode objects.
 */
export async function performSemanticSearch(query: string, rootHandle: FileSystemDirectoryHandle): Promise<FileNode[]> {
    const allDbFiles = await db.getAllFilesFromDB();
    const filesWithContent = await Promise.all(
        allDbFiles.filter(f => !f.isDirectory).map(async f => {
            try {
                const relativePath = f.path.split('/').slice(1).join('/');
                if (!relativePath) return null; // Skip root directory or invalid paths
                const handle = await rootHandle.getFileHandle(relativePath, { create: false });
                const content = await readFileContent(handle);
                return { name: f.path, content: content.substring(0, MAX_SEMANTIC_SEARCH_CONTENT_LENGTH) };
            }
            catch (error) { 
                console.warn(`Could not read content for semantic search: ${f.path}`, error);
                return null;
            }
        })
    );

    const validFiles = filesWithContent.filter(Boolean) as { name: string, content: string }[];
    if (validFiles.length === 0) return [];

    const prompt = `
      You are an expert file content search engine.
      Search for: "${query}".
      From the files provided, return a JSON array of the FULL file paths that are most relevant to the query.
      Only return paths from the provided list.
      Files: ${JSON.stringify(validFiles)}
    `;
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt, config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } }});
    const relevantPaths = JSON.parse(response.text.trim()) as string[];
    
    const relevantFileNodes: FileNode[] = [];
    for(const path of relevantPaths) {
        const file = allDbFiles.find(f => f.path === path);
        if (file) {
            try {
                const relativePath = file.path.split('/').slice(1).join('/');
                if (!relativePath) continue; // Skip root directory or invalid paths
                const handle = await rootHandle.getFileHandle(relativePath, { create: false });
                relevantFileNodes.push({ ...file, handle });
            } catch (error) {
                console.warn(`Could not get handle for relevant file ${file.path} after semantic search.`, error);
            }
        }
    }
    return relevantFileNodes;
}

/**
 * Performs a contextual action (summarization or code explanation) on provided file content.
 * @param action - The type of action to perform ('summarize' or 'explain_code').
 * @param fileContent - The content of the file.
 * @returns A promise that resolves to a string with the result of the action.
 */
export async function performContextualAction(action: 'summarize' | 'explain_code', fileContent: string): Promise<string> {
    let prompt = '';
    switch (action) {
        case 'summarize':
            prompt = `Provide a detailed summary of the following document:\n---\n${fileContent}\n---`;
            break;
        case 'explain_code':
            prompt = `Provide a detailed explanation of the following code, focusing on its purpose, functionality, and key components:\n---\n${fileContent}\n---`;
            break;
    }
    const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
    return response.text;
}

/**
 * Generates a project dashboard overview based on a list of files in a directory.
 * @param files - An array of FileNode objects representing the files in the directory.
 * @returns A promise that resolves to a DashboardData object.
 */
export async function generateProjectDashboard(files: FileNode[]): Promise<DashboardData> {
  const fileList = files.map(f => `${f.name}${f.isDirectory ? '/' : ` (${f.size} bytes)`}`).join('\n');
  const prompt = `
    As a senior project manager AI, analyze the following file list from a directory and provide a structured overview.

    File List:
    ---
    ${fileList}
    ---

    Based on this list, generate a JSON object that provides a summary, identifies the project type, lists key files, suggests next actions, and identifies the tech stack. Be concise and helpful.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dashboardSchema,
    }
  });
  
  const dashboardData = JSON.parse(response.text.trim()) as DashboardData;
  const validFileNames = new Set(files.map(f => f.name));
  dashboardData.keyFiles = dashboardData.keyFiles.filter(kf => validFileNames.has(kf.fileName));

  return dashboardData;
}

/**
 * Analyzes code and suggests improvements such as refactorings, performance optimizations, and security enhancements.
 * @param fileName - The name of the file being analyzed.
 * @param fileContent - The content of the file.
 * @param userGoal - An optional specific goal or focus for the improvements (e.g., "reduce boilerplate", "fix memory leak").
 * @returns A promise that resolves to a structured CodeImprovementSuggestion object.
 */
export async function suggestCodeImprovements(fileName: string, fileContent: string, userGoal?: string): Promise<CodeImprovementSuggestion> {
  const prompt = `
    Analyze the following code from file "${fileName}" and suggest refactorings, performance optimizations, and security improvements.
    ${userGoal ? `Focus specifically on the user's goal: "${userGoal}".` : ''}
    Prioritize actionable and clear suggestions.

    Code:
    \`\`\`
    ${fileContent.substring(0, MAX_CODE_ANALYZE_LENGTH)}
    \`\`\`

    Provide a structured JSON output with an overall feedback, specific refactoring suggestions (with old and new snippets if applicable), performance optimizations, and security notes.
  `;
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: codeImprovementSchema,
    }
  });
  return JSON.parse(response.text.trim()) as CodeImprovementSuggestion;
}

/**
 * Generates various types of documentation (function docstring, README section, API fragment) for a given file content.
 * @param fileName - The name of the file for which to generate documentation.
 * @param fileContent - The content of the file.
 * @param docType - The type of documentation to generate ('function_docstring', 'readme_section', 'api_docs_fragment').
 * @param context - Optional additional context to guide documentation generation.
 * @returns A promise that resolves to the generated documentation text.
 */
export async function generateDocumentation(fileName: string, fileContent: string, docType: 'function_docstring' | 'readme_section' | 'api_docs_fragment', context?: string): Promise<string> {
  let prompt = '';
  const trimmedContent = fileContent.substring(0, MAX_CODE_ANALYZE_LENGTH);

  switch (docType) {
    case 'function_docstring':
      prompt = `
        Generate a detailed JSDoc (or similar style for the detected language) docstring for the primary function, class, or module in the following code.
        Focus on parameters, return values, and overall purpose.
        File: "${fileName}"
        Code:
        \`\`\`
        ${trimmedContent}
        \`\`\`
      `;
      break;
    case 'readme_section':
      prompt = `
        Generate a comprehensive and well-formatted README.md section for the file "${fileName}".
        It should explain its purpose, how to use it, installation steps if relevant, and any important notes.
        ${context ? `Additional context: ${context}` : ''}
        Code:
        \`\`\`
        ${trimmedContent}
        \`\`\`
      `;
      break;
    case 'api_docs_fragment':
      prompt = `
        Generate an OpenAPI/Swagger or similar API documentation fragment (e.g., for a specific endpoint, data model, or component) based on the following code.
        Focus on API paths, methods, request/response bodies, and status codes.
        File: "${fileName}"
        Code:
        \`\`\`
        ${trimmedContent}
        \`\`\`
      `;
      break;
    default:
      throw new Error("Invalid documentation type specified. Must be 'function_docstring', 'readme_section', or 'api_docs_fragment'.");
  }
  const response = await ai.models.generateContent({ model: MODEL_NAME, contents: prompt });
  return response.text;
}

/**
 * Diagnoses a given error log, identifies possible causes, and suggests fixes.
 * Optionally takes relevant code content for more accurate diagnosis.
 * @param errorLog - The full error log or message.
 * @param fileContent - Optional: The content of the file where the error occurred.
 * @param fileName - Optional: The name of the file where the error occurred.
 * @returns A promise that resolves to a structured ErrorDiagnosis object.
 */
export async function diagnoseCodeError(errorLog: string, fileContent?: string, fileName?: string): Promise<ErrorDiagnosis> {
  let prompt = `
    Analyze the following error log and provide a clear diagnosis, possible causes, and suggested fixes.
    Error Log:
    \`\`\`
    ${errorLog}
    \`\`\`
  `;
  if (fileContent && fileName) {
    prompt += `
      Consider this relevant code from "${fileName}" to help pinpoint the issue:
      \`\`\`
      ${fileContent.substring(0, MAX_CODE_ANALYZE_LENGTH)}
      \`\`\`
    `;
  } else if (fileContent) {
    prompt += `
      Consider this relevant code snippet:
      \`\`\`
      ${fileContent.substring(0, MAX_CODE_ANALYZE_LENGTH)}
      \`\`\`
    `;
  }

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: errorDiagnosisSchema,
    }
  });
  return JSON.parse(response.text.trim()) as ErrorDiagnosis;
}

/**
 * Provides a detailed code review focusing on best practices, readability, performance, maintainability, and security.
 * @param fileName - The name of the file to review.
 * @param fileContent - The content of the file.
 * @param language - Optional: The programming language of the file (e.g., 'TypeScript', 'JavaScript', 'Python').
 * @returns A promise that resolves to a structured CodeReviewFeedback object.
 */
export async function reviewCodeForBestPractices(fileName: string, fileContent: string, language?: string): Promise<CodeReviewFeedback> {
  const prompt = `
    Perform a detailed code review for the file "${fileName}" written in ${language || 'the detected language'}.
    Focus on best practices regarding readability, modularity, performance, maintainability, potential bugs, and common security vulnerabilities.
    Provide constructive feedback and actionable suggestions.

    Code:
    \`\`\`
    ${fileContent.substring(0, MAX_CODE_ANALYZE_LENGTH)}
    \`\`\`

    Provide an overall rating, a list of specific comments categorized by aspect (e.g., Readability, Performance, Security),
    including optional line numbers and snippets where applicable, and a severity level for each comment (Low, Medium, High, Critical).
    Conclude with a concise summary of key areas for improvement.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: codeReviewSchema,
    }
  });
  return JSON.parse(response.text.trim()) as CodeReviewFeedback;
}