// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * A robust way to convert an ArrayBuffer to a Base64 string.
 * @param buffer The ArrayBuffer to convert.
 * @returns The Base64 encoded string.
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * Converts a Blob object to a Base64 encoded string.
 * This implementation uses readAsArrayBuffer for greater robustness across environments.
 * @param blob The Blob object to convert.
 * @returns A promise that resolves with the Base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
                resolve(arrayBufferToBase64(reader.result));
            } else {
                // This case should ideally not happen if readAsArrayBuffer is used correctly.
                // But for robustness, handle potential FileReader.result type mismatch.
                reject(new Error("FileReader did not return an ArrayBuffer."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(blob);
    });
};

/**
 * Converts a File object to a Base64 encoded string.
 * This function is an alias for blobToBase64.
 * @param file The File object to convert.
 * @returns A promise that resolves with the Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return blobToBase64(file);
};

/**
 * Converts a Blob object to a Data URL string.
 * This implementation uses readAsArrayBuffer for greater robustness across environments.
 * This function keeps the Data URL prefix (e.g., "data:image/png;base64,").
 * @param blob The Blob object to convert.
 * @returns A promise that resolves with the Data URL string.
 */
export const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
                const base64 = arrayBufferToBase64(reader.result);
                resolve(`data:${blob.type};base64,${base64}`);
            } else {
                reject(new Error("FileReader did not return an ArrayBuffer."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(blob);
    });
};

/**
 * Triggers a browser download for the given string content.
 * Note: For Blob or Data URL, use `downloadBlob` or `downloadDataURL` respectively.
 * @param content The string content to download.
 * @param filename The name of the file.
 * @param mimeType The MIME type of the file. Defaults to 'text/plain'.
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


// --- New Features Below ---

/**
 * Converts a Base64 encoded string back to an ArrayBuffer.
 * This function uses `window.atob` for decoding.
 * @param base64 The Base64 encoded string.
 * @returns The decoded ArrayBuffer.
 * @throws {Error} if the Base64 string is not valid.
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    try {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    } catch (error) {
        throw new Error(`Failed to decode Base64 string: ${(error as Error).message}`);
    }
};

/**
 * Converts a Base64 encoded string to a Blob object.
 * @param base64 The Base64 encoded string.
 * @param mimeType The MIME type of the blob (e.g., 'image/png'). Defaults to 'application/octet-stream'.
 * @returns The Blob object.
 * @throws {Error} if the Base64 string is not valid.
 */
export const base64ToBlob = (base64: string, mimeType: string = 'application/octet-stream'): Blob => {
    const arrayBuffer = base64ToArrayBuffer(base64);
    return new Blob([arrayBuffer], { type: mimeType });
};

/**
 * Converts a Base64 encoded string to a File object.
 * Note: File objects require a filename and simulate a File more accurately for APIs that expect it.
 * @param base64 The Base64 encoded string.
 * @param filename The name of the file (e.g., 'image.png').
 * @param mimeType The MIME type of the file (e.g., 'image/png').
 * @param lastModified Optional timestamp for the file. Defaults to current time.
 * @returns The File object.
 * @throws {Error} if the Base64 string is not valid.
 */
export const base64ToFile = (base64: string, filename: string, mimeType: string = 'application/octet-stream', lastModified?: number): File => {
    const blob = base64ToBlob(base64, mimeType);
    // File constructor: new File(fileBits, fileName, options);
    return new File([blob], filename, { type: mimeType, lastModified: lastModified ?? Date.now() });
};

/**
 * Extracts MIME type and Base64 data from a Data URL and converts it to a Blob object.
 * This function parses the Data URL string (e.g., "data:image/png;base64,iVBORw0KGgo...")
 * to extract the necessary information.
 * @param dataURL The Data URL string.
 * @returns The Blob object.
 * @throws {Error} if the Data URL format is invalid or encoding is unsupported.
 */
export const dataURLToBlob = (dataURL: string): Blob => {
    const parts = dataURL.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid Data URL format. Expected "data:[<mediatype>][;base64],<data>"');
    }

    const mimePart = parts[0].split(';');
    const mimeType = mimePart[0].replace('data:', '');
    const isBase64 = mimePart.includes('base64');
    const data = parts[1];

    if (!isBase64) {
        // For non-base64 (e.g., plain text), could use decodeURIComponent, but for robust file utils,
        // we primarily target binary data handled via base64.
        throw new Error('Unsupported Data URL encoding. Only base64 is currently supported for conversion to Blob.');
    }

    return base64ToBlob(data, mimeType);
};

/**
 * Extracts MIME type and data from a Data URL and converts it to a File object.
 * This is useful for reconstructing a File object from a Data URL.
 * @param dataURL The Data URL string.
 * @param filename The name of the file.
 * @param lastModified Optional timestamp for the file. Defaults to current time.
 * @returns The File object.
 * @throws {Error} if the Data URL format is invalid or encoding is unsupported.
 */
export const dataURLToFile = (dataURL: string, filename: string, lastModified?: number): File => {
    const parts = dataURL.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid Data URL format. Expected "data:[<mediatype>][;base64],<data>"');
    }

    const mimePart = parts[0].split(';');
    const mimeType = mimePart[0].replace('data:', '');
    const isBase64 = mimePart.includes('base64');
    const data = parts[1];

    if (!isBase64) {
        throw new Error('Unsupported Data URL encoding. Only base64 is currently supported for conversion to File.');
    }

    return base64ToFile(data, filename, mimeType, lastModified);
};


// --- File/Blob Metadata & Utilities ---

const commonMimeTypes: { [key: string]: string } = {
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'csv': 'text/csv',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    'gif': 'image/gif',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Add more common types as needed
};

/**
 * Tries to determine the MIME type of a file based on its extension.
 * This is a best-effort function using a predefined map and might not cover all cases or be perfectly accurate.
 * For unknown extensions, it defaults to 'application/octet-stream'.
 * @param filename The name of the file, including its extension (e.g., 'document.pdf').
 * @returns The predicted MIME type, or 'application/octet-stream' if unknown.
 */
export const getMimeTypeFromFilename = (filename: string): string => {
    const extension = getFileExtension(filename);
    if (extension) {
        const lowerExt = extension.toLowerCase();
        return commonMimeTypes[lowerExt] || 'application/octet-stream';
    }
    return 'application/octet-octet-stream'; // Default for no extension
};

/**
 * Extracts the file extension from a filename.
 * @param filename The name of the file (e.g., 'document.pdf', 'archive.tar.gz').
 * @returns The last file extension (e.g., 'pdf', 'gz'), or null if no extension found.
 */
export const getFileExtension = (filename: string): string | null => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0 || lastDotIndex === filename.length - 1) {
        return null; // No extension, or dot is at the start/end
    }
    return filename.substring(lastDotIndex + 1);
};

/**
 * Converts a file size in bytes to a human-readable format (e.g., "1.23 MiB").
 * Uses binary units (KiB, MiB) by default, or SI units (KB, MB) if `si` is true.
 * @param bytes The file size in bytes.
 * @param si If true, use SI units (KB, MB, GB); otherwise, use binary units (KiB, MiB, GiB). Default is false (binary).
 * @param decimalPlaces The number of decimal places to include. Default is 2.
 * @returns A string representing the human-readable file size (e.g., "1.23 MiB").
 */
export const humanReadableFileSize = (bytes: number, si: boolean = false, decimalPlaces: number = 2): string => {
    const threshold = si ? 1000 : 1024;
    if (Math.abs(bytes) < threshold) {
        return `${bytes} B`;
    }
    const units = si
        ? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** decimalPlaces; // Multiplier for rounding

    do {
        bytes /= threshold;
        u++;
    } while (Math.abs(bytes) >= threshold && u < units.length - 1);

    return `${Math.round(bytes * r) / r} ${units[u]}`;
};

/**
 * Checks if a given Blob or File object represents an image based on its MIME type.
 * @param file The Blob or File object.
 * @returns True if it's an image, false otherwise.
 */
export const isImageFile = (file: Blob | File): boolean => {
    return file.type.startsWith('image/');
};

/**
 * Checks if a given Blob or File object represents a video based on its MIME type.
 * @param file The Blob or File object.
 * @returns True if it's a video, false otherwise.
 */
export const isVideoFile = (file: Blob | File): boolean => {
    return file.type.startsWith('video/');
};

/**
 * Checks if a given Blob or File object represents audio based on its MIME type.
 * @param file The Blob or File object.
 * @returns True if it's audio, false otherwise.
 */
export const isAudioFile = (file: Blob | File): boolean => {
    return file.type.startsWith('audio/');
};

/**
 * Checks if a given Blob or File object represents text content based on its MIME type.
 * This includes generic 'text/*' types as well as common text-based application types (e.g., JSON, XML, JavaScript).
 * @param file The Blob or File object.
 * @returns True if it's text, false otherwise.
 */
export const isTextFile = (file: Blob | File): boolean => {
    const type = file.type;
    return type.startsWith('text/') ||
           type === 'application/json' ||
           type === 'application/xml' ||
           type === 'application/javascript' ||
           type === 'application/ecmascript' ||
           type === 'application/x-sh' || // Shell script
           type === 'application/x-javascript'; // Legacy JS type
};

// --- Advanced File Operations ---

/**
 * Calculates the hash of a file or blob using the Web Crypto API.
 * Supports 'SHA-256', 'SHA-1', 'SHA-384', and 'SHA-512' algorithms.
 * Note: MD5 is not supported by the Web Crypto API's `subtle.digest`.
 * @param file The File or Blob object to hash.
 * @param algorithm The hashing algorithm to use ('SHA-256' | 'SHA-1' | 'SHA-384' | 'SHA-512').
 * @returns A promise that resolves with the hexadecimal string representation of the hash.
 * @throws {Error} if Web Crypto API is not available or algorithm is unsupported.
 */
export const calculateFileHash = async (
    file: File | Blob,
    algorithm: 'SHA-256' | 'SHA-1' | 'SHA-384' | 'SHA-512'
): Promise<string> => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API is not available in this environment.');
    }

    // Check if the algorithm is supported by Web Crypto API
    const supportedAlgorithms = ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512'];
    if (!supportedAlgorithms.includes(algorithm)) {
        throw new Error(`Unsupported hashing algorithm: ${algorithm}. Supported algorithms are: ${supportedAlgorithms.join(', ')}.`);
    }

    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await window.crypto.subtle.digest(algorithm, buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hexHash;
    } catch (error) {
        throw new Error(`Failed to calculate file hash: ${(error as Error).message}`);
    }
};

/**
 * Reads the content of a text file (or blob) into a string.
 * @param file The File or Blob object to read.
 * @param encoding The character encoding (e.g., 'UTF-8'). Defaults to 'UTF-8'.
 * @returns A promise that resolves with the file content as a string.
 * @throws {Error} if the file cannot be read or encoding is invalid.
 */
export const readTextFile = (file: File | Blob, encoding: string = 'UTF-8'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("FileReader did not return a string."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file, encoding);
    });
};

/**
 * Reads the content of a JSON file (or blob) and parses it into a JavaScript object.
 * @param file The File or Blob object to read.
 * @param encoding The character encoding (e.g., 'UTF-8'). Defaults to 'UTF-8'.
 * @returns A promise that resolves with the parsed JSON object.
 * @throws {SyntaxError} if the file content is not valid JSON.
 * @throws {Error} if the file cannot be read.
 */
export const readJSONFile = async <T>(file: File | Blob, encoding: string = 'UTF-8'): Promise<T> => {
    try {
        const textContent = await readTextFile(file, encoding);
        return JSON.parse(textContent) as T;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new SyntaxError(`Failed to parse JSON file: ${(error as Error).message}`);
        }
        throw new Error(`Error reading JSON file: ${(error as Error).message}`);
    }
};

/**
 * Creates a hidden HTMLInputElement of type 'file' and programmatically triggers a click,
 * allowing the user to select files from their system.
 * This provides a programmatic way to open the file selection dialog.
 * @param accept A string specifying the file types the user can select (e.g., 'image/*', '.pdf', '.doc, .docx').
 * @param multiple Whether to allow multiple file selections. Default is false.
 * @returns A promise that resolves with the selected File object(s).
 *          Rejects if no files are selected, the selection is cancelled, or an error occurs.
 */
export const selectFile = (accept?: string, multiple: boolean = false): Promise<File | File[]> => {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        if (accept) {
            input.accept = accept;
        }
        input.multiple = multiple;
        input.style.display = 'none'; // Hide the input element

        document.body.appendChild(input);

        let resolvedOrRejected = false;

        const cleanup = () => {
            if (input.parentNode === document.body) {
                document.body.removeChild(input);
            }
            window.removeEventListener('focus', focusHandler); // Ensure cleanup of focus listener
        };

        const onFileChange = (event: Event) => {
            if (resolvedOrRejected) return;
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                resolvedOrRejected = true;
                const files = Array.from(target.files);
                resolve(multiple ? files : files[0]);
            } else {
                // This might occur if files are added then immediately removed,
                // or in certain browser quirks if the 'change' event fires with no files.
                resolvedOrRejected = true;
                reject(new Error('No files selected.'));
            }
            cleanup();
        };

        input.addEventListener('change', onFileChange, { once: true }); // Ensure listener is only called once

        // A common pattern to detect cancellation: when the window regains focus after the input click,
        // if no file change event has occurred, assume cancellation.
        const focusHandler = () => {
            setTimeout(() => { // Give a tiny delay for browser to process the dialog closure
                if (!resolvedOrRejected && (!input.files || input.files.length === 0)) {
                    resolvedOrRejected = true;
                    reject(new Error('File selection cancelled by user.'));
                }
                cleanup(); // Always ensure cleanup
            }, 50); // Small delay
        };

        // Attach focus listener *after* input.click() to avoid false positives
        // but before input.click() to ensure it's ready.
        // It's a delicate balance. Attaching it to window is generally safer than document for focus.
        window.addEventListener('focus', focusHandler);

        // Programmatically click the hidden input
        input.click();
    });
};

/**
 * Triggers a browser download for a given Blob object.
 * This is an alternative to `downloadFile` when you already have a Blob.
 * @param blob The Blob object to download.
 * @param filename The desired filename for the download.
 */
export const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Triggers a browser download for content represented by a Data URL string.
 * This is useful for downloading content directly from a Data URL string.
 * @param dataURL The Data URL string (e.g., "data:image/png;base64,...").
 * @param filename The desired filename for the download.
 * @throws {Error} if the Data URL format is invalid.
 */
export const downloadDataURL = (dataURL: string, filename: string) => {
    const blob = dataURLToBlob(dataURL); // Reuse existing dataURLToBlob
    downloadBlob(blob, filename);
};


/**
 * @class FileUploader
 * A utility class to simplify handling file uploads, including drag-and-drop
 * and programmatic file selection. It abstracts away common patterns for
 * file input and drop zones, providing a clean API for interacting with files.
 */
export class FileUploader {
    private fileInput: HTMLInputElement | null = null;
    private dropZoneElement: HTMLElement | null = null;
    private onChangeCallback: ((files: File[]) => void) | null = null;
    private onDropCallback: ((files: File[]) => void) | null = null;
    private onDragOverCallback: ((event: DragEvent) => void) | null = null;
    private onDragLeaveCallback: ((event: DragEvent) => void) | null = null;
    private onCancelCallback: (() => void) | null = null;
    private onErrorCallback: ((error: Error) => void) | null = null;

    constructor() {
        // No-op constructor, initialization happens via methods
    }

    /**
     * Attaches event listeners to a given HTMLInputElement of type 'file'.
     * When the user selects files through this input, the `onFileChange` callback is triggered.
     * @param inputElement The HTMLInputElement (must be type="file").
     * @throws {Error} if the provided element is not a file input.
     */
    public attachFileInput(inputElement: HTMLInputElement): void {
        if (inputElement.type !== 'file') {
            throw new Error('Provided element must be an HTMLInputElement with type="file".');
        }
        this.fileInput = inputElement;
        this.fileInput.addEventListener('change', this.handleFileInputChange);
    }

    /**
     * Attaches drag-and-drop event listeners to a specified HTMLElement, turning it into a drop zone.
     * When files are dropped, the `onFilesDropped` callback is triggered.
     * @param element The HTMLElement to be used as a drop zone.
     * @param preventDefaults Optional. If true, prevent default drag/drop behaviors (e.g., opening file in browser). Default is true.
     */
    public attachDropZone(element: HTMLElement, preventDefaults: boolean = true): void {
        this.dropZoneElement = element;
        if (preventDefaults) {
            this.dropZoneElement.addEventListener('dragover', this.handleDragOver);
            this.dropZoneElement.addEventListener('dragleave', this.handleDragLeave);
            this.dropZoneElement.addEventListener('drop', this.handleDrop);
        } else {
            // Still add our handlers, but allow defaults if specified not to prevent
            this.dropZoneElement.addEventListener('dragover', this.handleDragOverOnlyCallback);
            this.dropZoneElement.addEventListener('dragleave', this.handleDragLeaveOnlyCallback);
            this.dropZoneElement.addEventListener('drop', this.handleDropOnlyCallback);
        }
    }

    /**
     * Detaches all event listeners from the file input and drop zone elements.
     * This method should be called when the `FileUploader` instance is no longer needed
     * to prevent memory leaks and ensure proper resource cleanup.
     */
    public destroy(): void {
        if (this.fileInput) {
            this.fileInput.removeEventListener('change', this.handleFileInputChange);
            this.fileInput.value = ''; // Clear selection for security/privacy
            this.fileInput = null;
        }
        if (this.dropZoneElement) {
            this.dropZoneElement.removeEventListener('dragover', this.handleDragOver);
            this.dropZoneElement.removeEventListener('dragleave', this.handleDragLeave);
            this.dropZoneElement.removeEventListener('drop', this.handleDrop);
            this.dropZoneElement.removeEventListener('dragover', this.handleDragOverOnlyCallback);
            this.dropZoneElement.removeEventListener('dragleave', this.handleDragLeaveOnlyCallback);
            this.dropZoneElement.removeEventListener('drop', this.handleDropOnlyCallback);
            this.dropZoneElement = null;
        }
        this.onChangeCallback = null;
        this.onDropCallback = null;
        this.onDragOverCallback = null;
        this.onDragLeaveCallback = null;
        this.onCancelCallback = null;
        this.onErrorCallback = null;
    }

    /**
     * Registers a callback function to be invoked when files are selected via an attached file input.
     * @param callback A function that receives an array of selected File objects.
     */
    public onFileChange(callback: (files: File[]) => void): void {
        this.onChangeCallback = callback;
    }

    /**
     * Registers a callback function to be invoked when files are dropped onto an attached drop zone.
     * @param callback A function that receives an array of dropped File objects.
     */
    public onFilesDropped(callback: (files: File[]) => void): void {
        this.onDropCallback = callback;
    }

    /**
     * Registers a callback function to be invoked when files are dragged over the drop zone.
     * This can be used for UI feedback, e.g., highlighting the drop zone.
     * @param callback A function that receives the DragEvent.
     */
    public onDragOver(callback: (event: DragEvent) => void): void {
        this.onDragOverCallback = callback;
    }

    /**
     * Registers a callback function to be invoked when files are dragged out of the drop zone.
     * This can be used to remove UI feedback.
     * @param callback A function that receives the DragEvent.
     */
    public onDragLeave(callback: (event: DragEvent) => void): void {
        this.onDragLeaveCallback = callback;
    }

    /**
     * Registers a callback function to be invoked when a file selection is cancelled,
     * particularly when using `openFileSelectionDialog`.
     * @param callback A function to be called on cancellation.
     */
    public onCancel(callback: () => void): void {
        this.onCancelCallback = callback;
    }

    /**
     * Registers a callback function to be invoked if an error occurs during file operations,
     * such as programmatic file selection.
     * @param callback A function that receives an Error object.
     */
    public onError(callback: (error: Error) => void): void {
        this.onErrorCallback = callback;
    }

    /**
     * Programmatically opens the browser's native file selection dialog.
     * This method utilizes the `selectFile` utility function.
     * @param accept A string specifying the file types (e.g., 'image/*', '.pdf').
     * @param multiple Whether to allow multiple file selections.
     * @returns A promise that resolves with the selected File or File[] object(s).
     */
    public async openFileSelectionDialog(accept?: string, multiple: boolean = false): Promise<File | File[]> {
        try {
            const files = await selectFile(accept, multiple);
            // For consistency, if an onChangeCallback is registered, call it.
            if (this.onChangeCallback) {
                const fileArray = Array.isArray(files) ? files : [files];
                this.onChangeCallback(fileArray);
            }
            return files;
        } catch (error) {
            const err = error as Error;
            if (this.onCancelCallback && err.message.includes('cancelled')) {
                this.onCancelCallback();
            } else if (this.onErrorCallback) {
                this.onErrorCallback(err);
            }
            throw err; // Re-throw the error for external handling
        }
    }

    private handleFileInputChange = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const filesArray = Array.from(input.files);
            if (this.onChangeCallback) {
                this.onChangeCallback(filesArray);
            }
            // Clear the input value to allow selecting the same file(s) consecutively
            input.value = '';
        }
    };

    private handleDragOver = (event: DragEvent): void => {
        event.preventDefault(); // Crucial to allow dropping files
        if (this.onDragOverCallback) {
            this.onDragOverCallback(event);
        }
    };

    private handleDragLeave = (event: DragEvent): void => {
        event.preventDefault();
        if (this.onDragLeaveCallback) {
            this.onDragLeaveCallback(event);
        }
    };

    private handleDrop = (event: DragEvent): void => {
        event.preventDefault(); // Prevent default browser behavior (e.g., opening file)
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const filesArray = Array.from(event.dataTransfer.files);
            if (this.onDropCallback) {
                this.onDropCallback(filesArray);
            }
        }
    };

    // Handlers for when preventDefaults is explicitly false (callbacks still fire but defaults are not stopped)
    private handleDragOverOnlyCallback = (event: DragEvent): void => {
        if (this.onDragOverCallback) {
            this.onDragOverCallback(event);
        }
    };

    private handleDragLeaveOnlyCallback = (event: DragEvent): void => {
        if (this.onDragLeaveCallback) {
            this.onDragLeaveCallback(event);
        }
    };

    private handleDropOnlyCallback = (event: DragEvent): void => {
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const filesArray = Array.from(event.dataTransfer.files);
            if (this.onDropCallback) {
                this.onDropCallback(filesArray);
            }
        }
    };
}