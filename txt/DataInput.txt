// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { UploadIcon, SparklesIcon } from '../../icons.tsx';

// Define the global pdfjsLib interface if not already defined elsewhere,
// to satisfy TypeScript for window.pdfjsLib.
// This is a common pattern when using globally loaded libraries.
declare global {
    interface Window {
        pdfjsLib: any; // Using 'any' for simplicity, could be more specific with actual PDF.js types
    }
}

interface DataInputProps {
    onProcess: (data: string, mood: string) => void;
    // New prop: optional callback for when input mode changes
    onInputModeChange?: (mode: 'file' | 'text') => void;
    // New prop: optional initial mood
    initialMood?: string;
}

// Constants for configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_TEXT_LENGTH = 50000; // Roughly 50KB of text, adjustable based on AI model limits
const DEFAULT_MOOD = 'cinematic, detailed illustration';
const MOOD_SUGGESTIONS = [
    'dark fantasy',
    'watercolor',
    'cyberpunk neon',
    'storybook illustration',
    'noir detective',
    'ethereal glow',
    'vintage comic',
    'pixel art',
    'steampunk',
    'ghibli inspired',
    'impressionistic',
    'modern minimalist'
];

/**
 * A utility function to debounce another function, delaying its execution.
 * Useful for limiting the rate at which a function is called, e.g., on input changes.
 * @param func The function to debounce.
 * @param delay The delay in milliseconds before the function is executed.
 * @returns A debounced version of the original function.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    }) as T;
}

/**
 * A reusable component for displaying informational, error, or success messages.
 * @param type The type of message ('error' | 'info' | 'success').
 * @param message The message string to display.
 */
export const MessageDisplay: React.FC<{ type: 'error' | 'info' | 'success', message: string }> = ({ type, message }) => {
    let textColor = 'text-gray-400';
    if (type === 'error') textColor = 'text-red-400';
    if (type === 'success') textColor = 'text-green-400';
    if (type === 'info') textColor = 'text-blue-400'; // Added info type for parsing status

    return (
        <p className={`mt-2 text-sm ${textColor}`}>
            {message}
        </p>
    );
};

/**
 * A component for allowing users to directly input or paste text.
 * Includes character count and a clear text button.
 * @param value The current text value.
 * @param onChange Callback function for when the text changes.
 * @param maxLength The maximum allowed length for the text.
 * @param placeholder The placeholder text for the textarea.
 * @param onClear Callback function to clear the text.
 * @param characterCount The current character count of the text.
 */
export const DirectTextInput: React.FC<{
    value: string;
    onChange: (text: string) => void;
    maxLength: number;
    placeholder?: string;
    onClear?: () => void;
    characterCount: number;
}> = ({
    value,
    onChange,
    maxLength,
    placeholder = `Paste your text here (up to ${maxLength} characters)`,
    onClear,
    characterCount
}) => {
    return (
        <div className="relative w-full">
            <textarea
                id="direct-text-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLength}
                rows={10}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-500 resize-y min-h-[160px]"
                placeholder={placeholder}
            />
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2 px-1">
                <span>{characterCount}/{maxLength} characters</span>
                {onClear && value.length > 0 && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-violet-400 hover:text-violet-300 transition-colors focus:outline-none"
                    >
                        Clear Text
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * A component that displays a list of clickable mood suggestions.
 * @param suggestions An array of strings representing mood suggestions.
 * @param onSelect Callback function for when a mood suggestion is selected.
 * @param currentMood The currently selected mood, used for highlighting.
 */
export const MoodSuggestions: React.FC<{
    suggestions: string[];
    onSelect: (mood: string) => void;
    currentMood: string;
}> = ({ suggestions, onSelect, currentMood }) => {
    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => onSelect(suggestion)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        currentMood.toLowerCase().includes(suggestion.toLowerCase())
                            ? 'bg-violet-600 border-violet-600 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600'
                    }`}
                >
                    {suggestion}
                </button>
            ))}
        </div>
    );
};


const DataInput: React.FC<DataInputProps> = ({ onProcess, onInputModeChange, initialMood }) => {
    const [file, setFile] = useState<File | null>(null);
    const [mood, setMood] = useState<string>(initialMood || ''); // Use initialMood if provided
    const [isParsing, setIsParsing] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTextInputMode, setIsTextInputMode] = useState(false); // New state to toggle between file/text input
    const [directText, setDirectText] = useState(''); // New state for direct text input
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input to programmatically click and clear

    // Effect to notify parent when input mode changes
    useEffect(() => {
        if (onInputModeChange) {
            onInputModeChange(isTextInputMode ? 'text' : 'file');
        }
    }, [isTextInputMode, onInputModeChange]);

    /**
     * Extracts text content from a PDF file using pdf.js library.
     * @param pdfFile The PDF File object.
     * @returns A promise that resolves with the extracted text.
     */
    const extractTextFromPdf = async (pdfFile: File): Promise<string> => {
        // Ensure pdfjsLib is available globally (assumed to be loaded via a script tag)
        if (!window.pdfjsLib) {
            throw new Error("PDF.js library is not loaded. Please ensure `pdf.js` is included globally.");
        }
        // Set worker source for pdf.js
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;
        const loadingTask = window.pdfjsLib.getDocument(URL.createObjectURL(pdfFile));
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Using a more robust way to join text items, handling potential spacing issues
            const pageText = textContent.items.map((item: any) => item.str).join(' ').replace(/\s\s+/g, ' ').trim();
            fullText += pageText + '\n\n';
        }
        return fullText.trim();
    };

    /**
     * Extracts text content from a TXT file.
     * @param txtFile The TXT File object.
     * @returns A promise that resolves with the extracted text.
     */
    const extractTextFromTxt = (txtFile: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (result.length > MAX_TEXT_LENGTH) {
                    reject(new Error(`Text file content exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters.`));
                } else {
                    resolve(result);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsText(txtFile);
        });
    };

    /**
     * Handles the selection or drop of a file, performing validation.
     * @param selectedFile The File object to handle.
     */
    const handleFile = useCallback((selectedFile: File | null) => {
        if (!selectedFile) {
            setFile(null);
            setError(null); // Clear error if no file selected
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
            return;
        }

        if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain') {
            setFile(selectedFile);
            setError(null);
            setDirectText(''); // Clear direct text if a file is selected to avoid conflict
        } else {
            setFile(null);
            setError('Please upload a valid PDF or TXT file.');
            if (fileInputRef.current) fileInputRef.current.value = ''; // Clear file input
        }
    }, []);

    /**
     * Handles drag events for the file upload area.
     * @param e The React.DragEvent.
     */
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    }, []);

    /**
     * Handles file drop events for the file upload area.
     * @param e The React.DragEvent.
     */
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);

    /**
     * Handles file selection from the input element.
     * @param e The React.ChangeEvent from the file input.
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    }, [handleFile]);

    /**
     * Clears the currently selected file and any associated errors.
     */
    const handleClearFile = useCallback(() => {
        setFile(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset the hidden file input
    }, []);

    /**
     * Clears the direct text input and any associated errors.
     */
    const handleClearDirectText = useCallback(() => {
        setDirectText('');
        setError(null);
    }, []);

    /**
     * Handles the form submission, processing either the uploaded file or the direct text input.
     * @param e The React.FormEvent.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        let contentToProcess: string | null = null;

        if (isTextInputMode) {
            contentToProcess = directText.trim();
            if (!contentToProcess) {
                setError('Please enter some text to generate a story scaffold.');
                return;
            }
            if (contentToProcess.length > MAX_TEXT_LENGTH) {
                setError(`Entered text exceeds maximum allowed length of ${MAX_TEXT_LENGTH} characters.`);
                return;
            }
        } else { // File upload mode
            if (!file) {
                setError('Please upload a file or switch to text input mode.');
                return;
            }
            setIsParsing(true); // Indicate that parsing is in progress
            try {
                contentToProcess = file.type === 'application/pdf' ? await extractTextFromPdf(file) : await extractTextFromTxt(file);
                if (!contentToProcess.trim()) {
                    setError('Could not extract any text from the file. The file might be empty or unreadable.');
                    setIsParsing(false);
                    return;
                }
            } catch (err: any) {
                console.error("Failed to parse file", err);
                setError(`Could not read the file: ${err.message || "It might be corrupted or in an unsupported format."}`);
                setIsParsing(false);
                return;
            }
        }

        // Final check and process
        if (contentToProcess) {
            onProcess(contentToProcess, mood.trim() || DEFAULT_MOOD);
            // Optionally clear inputs after successful submission for next scaffold
            // This part is commented out to allow users to refine the mood or content for subsequent generations.
            // setFile(null);
            // setDirectText('');
            // setMood('');
        }
        setIsParsing(false); // Ensure loading state is reset regardless of success or failure after initial error check
    };

    /**
     * Handles changes to the mood input field.
     * @param e The React.ChangeEvent from the mood input.
     */
    const handleMoodChange = (e: ChangeEvent<HTMLInputElement>) => {
        setMood(e.target.value);
    };

    /**
     * Handles selection of a mood from the suggestions.
     * @param selectedMood The mood string selected from suggestions.
     */
    const handleMoodSuggestionSelect = (selectedMood: string) => {
        setMood(selectedMood);
    };

    // Determine if the submit button should be disabled
    const isSubmitDisabled = isParsing ||
                             (isTextInputMode && directText.trim().length === 0) || // Disabled if text input mode and text is empty
                             (!isTextInputMode && !file); // Disabled if file upload mode and no file is selected

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-full max-w-2xl">
                <UploadIcon className="mx-auto h-16 w-16 text-violet-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Generate Story Scaffold</h2>
                <p className="text-gray-400 mb-6">
                    Provide source material (file or text) and an optional art style.
                    The AI will generate a detailed story scaffold.
                </p>

                {/* Mode Selector for File Upload vs. Text Input */}
                <div className="flex justify-center mb-6 rounded-lg bg-gray-800 p-1">
                    <button
                        type="button"
                        onClick={() => setIsTextInputMode(false)}
                        className={`flex-1 px-6 py-2 rounded-md transition-colors duration-200 ${
                            !isTextInputMode
                                ? 'bg-violet-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Upload Document
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTextInputMode(true)}
                        className={`flex-1 px-6 py-2 rounded-md transition-colors duration-200 ${
                            isTextInputMode
                                ? 'bg-violet-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                        Enter Text
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    {/* Conditional rendering based on input mode */}
                    {isTextInputMode ? (
                        <DirectTextInput
                            value={directText}
                            onChange={setDirectText}
                            maxLength={MAX_TEXT_LENGTH}
                            onClear={handleClearDirectText}
                            characterCount={directText.length}
                        />
                    ) : (
                        <label
                            htmlFor="file-upload"
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center w-full h-40 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragActive ? "border-violet-400 bg-violet-900/30" : "border-gray-600 hover:border-gray-500"}`}
                        >
                            <UploadIcon className="h-10 w-10 text-violet-400 mb-2" />
                            <p className="text-gray-400 mb-1">
                                {file ? (
                                    <span className="flex items-center">
                                        {file.name}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleClearFile(); }} // Prevent label click
                                            className="ml-2 text-red-400 hover:text-red-300 text-sm focus:outline-none"
                                            aria-label="Clear selected file"
                                        >
                                            (clear)
                                        </button>
                                    </span>
                                ) : 'Drag & drop a file here, or click to select'}
                            </p>
                            <p className="text-xs text-gray-500">PDF or TXT, up to {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleChange}
                                accept="application/pdf,text/plain"
                                ref={fileInputRef}
                            />
                        </label>
                    )}

                    {/* Mood Input and Suggestions */}
                    <input
                        id="mood-input"
                        type="text"
                        value={mood}
                        onChange={handleMoodChange}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-500"
                        placeholder="Optional: Describe the art style (e.g., dark fantasy, watercolor)"
                        aria-label="Art style description"
                    />
                    <MoodSuggestions
                        suggestions={MOOD_SUGGESTIONS}
                        onSelect={handleMoodSuggestionSelect}
                        currentMood={mood}
                    />

                    {/* Error and Info Messages */}
                    {error && <MessageDisplay type="error" message={error} />}
                    {isParsing && <MessageDisplay type="info" message="Parsing document, this may take a moment for large PDFs..." />}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className="mt-4 group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="absolute -inset-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 opacity-75 blur transition-all duration-1000 group-hover:opacity-100 group-hover:-inset-1 disabled:opacity-0"></span>
                        <SparklesIcon className="w-6 h-6 mr-3 relative z-10"/>
                        <span className="relative z-10">
                            {isParsing ? 'Reading file...' : 'Generate Story Scaffold'}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DataInput;