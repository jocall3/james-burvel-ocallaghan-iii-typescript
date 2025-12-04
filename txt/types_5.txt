// google/docs/types.ts
// The Grammar of the Word. Defines the structure of a document.

export interface Document {
    id: string;
    title: string;
    content: string; // Could be a more complex format like Delta
    lastModified: string;
}
