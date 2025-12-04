// types/models/integration/code-snippet.ts
export type Language = 'typescript' | 'python' | 'go';

export interface CodeSnippet {
    language: Language;
    label: string;
    code: string;
}