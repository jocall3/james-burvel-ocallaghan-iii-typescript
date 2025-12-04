// types/models/documents/uploaded-file.ts
export interface UploadedFile {
    name: string;
    type: string;
    size: number;
    content: ArrayBuffer;
}
