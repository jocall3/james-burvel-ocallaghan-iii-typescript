// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// globals.d.ts
declare global {
  /**
   * Loads the Pyodide WebAssembly module.
   * @param config Optional configuration for Pyodide.
   */
  function loadPyodide(config?: { indexURL?: string }): Promise<any>;

  interface Window {
    google?: {
      accounts: {
        id: {
          disableAutoSelect: () => void;
        };
      };
    };
    // For File System Access API
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    // For PDF.js
    pdfjsLib: any;
    // For Speech Recognition API
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }

  // File System Access API interfaces
  interface FileSystemHandlePermissionDescriptor {
    mode?: 'read' | 'readwrite';
  }

  interface FileSystemHandle {
    // FIX: Add readonly modifier to match derived interfaces
    readonly kind: 'file' | 'directory';
    // FIX: Add readonly modifier to match derived interfaces
    readonly name: string;
    isSameEntry(other: FileSystemHandle): Promise<boolean>;
    queryPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
    requestPermission(descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState>;
  }

  interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
  }

  interface FileSystemFileHandle extends FileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
  }

  interface FileSystemDirectoryHandle extends FileSystemHandle {
    readonly kind: 'directory';
    getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
    removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
    resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
    keys(): AsyncIterable<string>;
    values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
    entries(): AsyncIterable<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
  }
  
  // --- Speech Recognition API interfaces ---
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionStatic {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    grammars: any; // SpeechGrammarList
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  }

  // FIX: Removed 'declare' modifier, as it cannot be used in an already ambient context.
  var SpeechRecognition: SpeechRecognitionStatic;
    
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

}

// This export statement is required to make the file a module.
export {};