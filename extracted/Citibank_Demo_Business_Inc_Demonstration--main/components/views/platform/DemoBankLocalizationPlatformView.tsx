// components/views/platform/DemoBankLocalizationPlatformView.tsx
import React, { useState, useReducer, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// --- NEW FEATURES AND EXPANDED CODE FOR A REAL-WORLD APPLICATION ---

// SECTION 1: CONSTANTS & CONFIGURATION
// ============================================================================

/**
 * @const SUPPORTED_LANGUAGES
 * A comprehensive list of languages supported by the localization platform.
 * Each language object includes its code (ISO 639-1), name, and native name.
 */
export const SUPPORTED_LANGUAGES = [
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' }
];

/**
 * @const SUPPORTED_TONES
 * Defines the various tones of voice the AI can use for translations.
 * Each tone has a key, a user-facing name, and a descriptive prompt fragment.
 */
export const SUPPORTED_TONES = [
    { key: 'neutral', name: 'Neutral', description: 'Maintain a standard, neutral tone.' },
    { key: 'formal', name: 'Formal', description: 'Use formal language, suitable for official documents or formal communication.' },
    { key: 'informal', name: 'Informal', description: 'Use casual, everyday language, as if speaking to a friend.' },
    { key: 'professional', name: 'Professional (Banking)', description: 'Use professional, courteous language appropriate for a financial institution.' },
    { key: 'marketing', name: 'Marketing', description: 'Use persuasive and engaging language designed to attract customers.' },
    { key: 'technical', name: 'Technical', description: 'Use precise and specific terminology related to a technical field.' }
];

/**
 * @const API_CONFIG
 * Configuration for the Google GenAI API.
 */
export const API_CONFIG = {
    model: 'gemini-2.5-flash',
    responseMimeType: 'application/json',
    apiKey: process.env.API_KEY as string,
};

/**
 * @const DEBOUNCE_DELAY
 * Standard debounce delay in milliseconds for user inputs to prevent excessive API calls.
 */
export const DEBOUNCE_DELAY = 500;

/**
 * @const LOCAL_STORAGE_KEYS
 * Keys used for storing application state in the browser's local storage.
 */
export const LOCAL_STORAGE_KEYS = {
    PROJECTS: 'demoBankLocalizationProjects_v2',
    ACTIVE_PROJECT_ID: 'demoBankLocalizationActiveProjectId_v2',
    USER_SETTINGS: 'demoBankLocalizationUserSettings_v2',
};

// SECTION 2: TYPESCRIPT INTERFACES
// ============================================================================

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
export type ToneKey = typeof SUPPORTED_TONES[number]['key'];

export interface Language {
    code: LanguageCode;
    name: string;
    nativeName: string;
}

export interface Tone {
    key: ToneKey;
    name: string;
    description: string;
}

export interface GlossaryTerm {
    id: string;
    source: string;
    translation: string;
    notes?: string;
    isCaseSensitive: boolean;
    doNotTranslate: boolean;
}

export interface Translation {
    id: string;
    language: Language;
    text: string;
    qualityScore?: number; // Simulated score from AI
    edited: boolean;
}

export interface TranslationRequest {
    id: string;
    timestamp: string;
    sourceText: string;
    sourceLanguage: Language;
    targetLanguages: Language[];
    tone: Tone;
    context?: string;
    glossaryUsed: GlossaryTerm[];
    translations: Translation[];
    status: 'completed' | 'failed' | 'in_progress';
    error?: string;
}

export interface ProjectSettings {
    defaultTargetLanguages: LanguageCode[];
    defaultTone: ToneKey;
    autoSave: boolean;
}

export interface LocalizationProject {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    history: TranslationRequest[];
    glossary: GlossaryTerm[];
    settings: ProjectSettings;
}

export interface UserSettings {
    theme: 'dark' | 'light';
    showTooltips: boolean;
    defaultName: string;
}

// --- State Management Types (useReducer) ---

export type AppState = {
    projects: LocalizationProject[];
    activeProjectId: string | null;
    isLoading: boolean;
    error: string | null;
    currentApiRequest: TranslationRequest | null;
    userSettings: UserSettings;
};

export type Action =
    | { type: 'INITIALIZE_STATE'; payload: Partial<AppState> }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'CREATE_PROJECT'; payload: { name: string; description: string } }
    | { type: 'DELETE_PROJECT'; payload: { projectId: string } }
    | { type: 'UPDATE_PROJECT'; payload: { projectId: string; data: Partial<Omit<LocalizationProject, 'id'>> } }
    | { type: 'SET_ACTIVE_PROJECT'; payload: { projectId: string | null } }
    | { type: 'ADD_TRANSLATION_HISTORY'; payload: { projectId: string; request: TranslationRequest } }
    | { type: 'UPDATE_TRANSLATION_IN_HISTORY'; payload: { projectId: string; requestId: string; translationId: string; newText: string } }
    | { type: 'DELETE_TRANSLATION_HISTORY'; payload: { projectId: string; requestId: string } }
    | { type: 'ADD_GLOSSARY_TERM'; payload: { projectId: string; term: Omit<GlossaryTerm, 'id'> } }
    | { type: 'UPDATE_GLOSSARY_TERM'; payload: { projectId: string; term: GlossaryTerm } }
    | { type: 'DELETE_GLOSSARY_TERM'; payload: { projectId: string; termId: string } }
    | { type: 'UPDATE_PROJECT_SETTINGS'; payload: { projectId: string; settings: Partial<ProjectSettings> } }
    | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<UserSettings> }
    | { type: 'API_REQUEST_START'; payload: TranslationRequest }
    | { type: 'API_REQUEST_SUCCESS'; payload: TranslationRequest }
    | { type: 'API_REQUEST_FAILURE'; payload: { error: string } };


// SECTION 3: UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a simple v4 UUID.
 * @returns {string} A new UUID.
 */
export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Formats a date string or Date object into a readable format.
 * @param {string | Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Truncates a string to a specified length, adding an ellipsis if truncated.
 * @param {string} str - The string to truncate.
 * @param {number} length - The maximum length of the string.
 * @returns {string} The truncated string.
 */
export const truncateString = (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
};

/**
 * Triggers a download of a JSON file.
 * @param {any} data - The data to be included in the JSON file.
 * @param {string} filename - The name of the file to be downloaded.
 */
export const exportAsJSON = (data: any, filename: string = 'translations.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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
 * Converts an array of objects to a CSV string.
 * @param {TranslationRequest} data - The translation request data.
 * @returns {string} The data formatted as a CSV string.
 */
export const convertToCSV = (data: TranslationRequest): string => {
    if (!data || !data.translations || data.translations.length === 0) {
        return '';
    }

    const headers = ['SourceText', 'LanguageCode', 'LanguageName', 'TranslatedText', 'QualityScore'];
    const rows = data.translations.map(t => [
        `"${data.sourceText.replace(/"/g, '""')}"`,
        t.language.code,
        t.language.name,
        `"${t.text.replace(/"/g, '""')}"`,
        t.qualityScore || 'N/A'
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
};

/**
 * Triggers a download of a CSV file.
 * @param {TranslationRequest} data - The translation request data.
 * @param {string} filename - The name of the file to be downloaded.
 */
export const exportAsCSV = (data: TranslationRequest, filename: string = 'translations.csv') => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};


// SECTION 4: CUSTOM HOOKS
// ============================================================================

/**
 * A custom hook for managing state in localStorage.
 * @template T
 * @param {string} key - The key for the localStorage item.
 * @param {T} initialValue - The initial value if nothing is found in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} The state value and its setter.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}

/**
 * A custom hook to debounce a value.
 * @template T
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// SECTION 5: STATE MANAGEMENT (Context & Reducer)
// ============================================================================

export const initialState: AppState = {
    projects: [],
    activeProjectId: null,
    isLoading: false,
    error: null,
    currentApiRequest: null,
    userSettings: {
        theme: 'dark',
        showTooltips: true,
        defaultName: 'User',
    }
};

/**
 * The main reducer for the localization platform's state.
 * @param {AppState} state - The current state.
 * @param {Action} action - The dispatched action.
 * @returns {AppState} The new state.
 */
export const localizationReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'INITIALIZE_STATE':
            return { ...state, ...action.payload, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'CREATE_PROJECT': {
            const newProject: LocalizationProject = {
                id: generateUUID(),
                name: action.payload.name,
                description: action.payload.description,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                history: [],
                glossary: [],
                settings: {
                    defaultTargetLanguages: ['es', 'fr', 'de', 'ja'],
                    defaultTone: 'professional',
                    autoSave: true,
                },
            };
            return {
                ...state,
                projects: [...state.projects, newProject],
                activeProjectId: newProject.id,
            };
        }
        case 'DELETE_PROJECT': {
            const newProjects = state.projects.filter(p => p.id !== action.payload.projectId);
            const newActiveId = state.activeProjectId === action.payload.projectId
                ? newProjects[0]?.id || null
                : state.activeProjectId;
            return { ...state, projects: newProjects, activeProjectId: newActiveId };
        }
        case 'SET_ACTIVE_PROJECT':
            return { ...state, activeProjectId: action.payload.projectId };
        case 'ADD_TRANSLATION_HISTORY': {
            const { projectId, request } = action.payload;
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === projectId
                        ? { ...p, history: [request, ...p.history], updatedAt: new Date().toISOString() }
                        : p
                ),
            };
        }
        case 'UPDATE_TRANSLATION_IN_HISTORY': {
            const { projectId, requestId, translationId, newText } = action.payload;
            return {
                ...state,
                projects: state.projects.map(p => {
                    if (p.id !== projectId) return p;
                    return {
                        ...p,
                        history: p.history.map(req => {
                            if (req.id !== requestId) return req;
                            return {
                                ...req,
                                translations: req.translations.map(t =>
                                    t.id === translationId ? { ...t, text: newText, edited: true } : t
                                )
                            };
                        })
                    };
                })
            };
        }
        case 'ADD_GLOSSARY_TERM': {
            const { projectId, term } = action.payload;
            const newTerm: GlossaryTerm = { ...term, id: generateUUID() };
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === projectId
                        ? { ...p, glossary: [...p.glossary, newTerm], updatedAt: new Date().toISOString() }
                        : p
                ),
            };
        }
        case 'DELETE_GLOSSARY_TERM': {
             const { projectId, termId } = action.payload;
             return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === projectId
                        ? { ...p, glossary: p.glossary.filter(t => t.id !== termId), updatedAt: new Date().toISOString() }
                        : p
                ),
            };
        }
        case 'UPDATE_PROJECT_SETTINGS': {
            const { projectId, settings } = action.payload;
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === projectId
                        ? { ...p, settings: { ...p.settings, ...settings }, updatedAt: new Date().toISOString() }
                        : p
                ),
            };
        }
        case 'UPDATE_USER_SETTINGS':
            return { ...state, userSettings: { ...state.userSettings, ...action.payload } };

        case 'API_REQUEST_START':
            return { ...state, isLoading: true, error: null, currentApiRequest: action.payload };
        case 'API_REQUEST_SUCCESS':
            const completedRequest = action.payload;
            return {
                ...state,
                isLoading: false,
                currentApiRequest: completedRequest,
                projects: state.projects.map(p =>
                    p.id === state.activeProjectId
                        ? { ...p, history: [completedRequest, ...p.history], updatedAt: new Date().toISOString() }
                        : p
                ),
            };
        case 'API_REQUEST_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
                currentApiRequest: state.currentApiRequest ? { ...state.currentApiRequest, status: 'failed', error: action.payload.error } : null,
            };
        default:
            return state;
    }
};

export const LocalizationContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

/**
 * Provides the localization state to its children components.
 */
export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(localizationReducer, initialState);

    // Load state from localStorage on initial render
    useEffect(() => {
        try {
            const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
            const savedActiveId = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVE_PROJECT_ID);
            const savedUserSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_SETTINGS);
            
            const payload: Partial<AppState> = {};
            if (savedProjects) payload.projects = JSON.parse(savedProjects);
            if (savedActiveId) payload.activeProjectId = JSON.parse(savedActiveId);
            if (savedUserSettings) payload.userSettings = JSON.parse(savedUserSettings);

            if (Object.keys(payload).length > 0) {
                 dispatch({ type: 'INITIALIZE_STATE', payload });
            }
        } catch (error) {
            console.error("Failed to load state from localStorage", error);
            dispatch({ type: 'SET_ERROR', payload: 'Could not load saved data.' });
        }
    }, []);

    // Persist state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(state.projects));
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_PROJECT_ID, JSON.stringify(state.activeProjectId));
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SETTINGS, JSON.stringify(state.userSettings));
        } catch (error) {
            console.error("Failed to save state to localStorage", error);
        }
    }, [state.projects, state.activeProjectId, state.userSettings]);

    return (
        <LocalizationContext.Provider value={{ state, dispatch }}>
            {children}
        </LocalizationContext.Provider>
    );
};

/**
 * Custom hook to easily access localization state and dispatch function.
 * @returns {{ state: AppState; dispatch: React.Dispatch<Action> }}
 */
export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};

// SECTION 6: API ABSTRACTION
// ============================================================================

/**
 * Builds a detailed prompt for the AI based on user inputs.
 * @param {object} params - The parameters for building the prompt.
 * @returns {string} The constructed prompt string.
 */
export const buildAIPrompt = ({
    sourceText,
    targetLanguages,
    tone,
    context,
    glossary
}: {
    sourceText: string;
    targetLanguages: Language[];
    tone: Tone;
    context?: string;
    glossary: GlossaryTerm[];
}): string => {
    const languageList = targetLanguages.map(l => `${l.name} (${l.code})`).join(', ');
    let prompt = `You are a professional localization expert for a financial institution called "DemoBank".
Translate the following English source string into these languages: ${languageList}.
The source string is: "${sourceText}"

Translation requirements:
1.  **Tone**: The translation must have a "${tone.name}" tone. ${tone.description}
`;

    if (context) {
        prompt += `2.  **Context**: The string is used in the following context: "${context}". This information is crucial for an accurate translation.\n`;
    }

    if (glossary && glossary.length > 0) {
        const glossaryInstructions = glossary.map(term => {
            if (term.doNotTranslate) {
                return `- The term "${term.source}" must not be translated. It should remain as "${term.source}".`;
            }
            return `- The term "${term.source}" must be translated as "${term.translation}".`;
        }).join('\n');
        prompt += `3.  **Glossary**: Adhere strictly to the following glossary terms:\n${glossaryInstructions}\n`;
    }
    
    prompt += `Provide the output as a JSON object, following the specified schema exactly. Each translation object should include a "languageCode" (ISO 639-1), "translatedText", and a "qualityScore" from 0.0 to 1.0, representing your confidence in the translation's accuracy and appropriateness.`;
    
    return prompt;
};


/**
 * The schema for the AI's JSON response.
 */
export const AI_RESPONSE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        translations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    languageCode: { type: Type.STRING },
                    translatedText: { type: Type.STRING },
                    qualityScore: { type: Type.NUMBER },
                }
            }
        }
    }
};

/**
 * Handles the call to the Google GenAI API.
 * @param {object} params - The parameters for the translation.
 * @param {React.Dispatch<Action>} dispatch - The reducer dispatch function.
 */
export const executeTranslation = async (
    { sourceText, targetLanguages, tone, context, glossary }: {
        sourceText: string;
        targetLanguages: Language[];
        tone: Tone;
        context?: string;
        glossary: GlossaryTerm[];
    },
    dispatch: React.Dispatch<Action>
) => {
    if (!API_CONFIG.apiKey) {
        dispatch({ type: 'API_REQUEST_FAILURE', payload: { error: 'API key is not configured.' } });
        return;
    }

    const startRequest: TranslationRequest = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        sourceText,
        sourceLanguage: { code: 'en', name: 'English', nativeName: 'English' },
        targetLanguages,
        tone,
        context,
        glossaryUsed: glossary,
        translations: [],
        status: 'in_progress'
    };
    dispatch({ type: 'API_REQUEST_START', payload: startRequest });

    try {
        const ai = new GoogleGenAI({ apiKey: API_CONFIG.apiKey });
        const fullPrompt = buildAIPrompt({ sourceText, targetLanguages, tone, context, glossary });
        
        const response = await ai.models.generateContent({
            model: API_CONFIG.model,
            contents: fullPrompt,
            config: {
                responseMimeType: API_CONFIG.responseMimeType,
                responseSchema: AI_RESPONSE_SCHEMA
            }
        });

        const parsedResponse = JSON.parse(response.text);
        const translations: Translation[] = parsedResponse.translations.map((t: any) => {
            const lang = SUPPORTED_LANGUAGES.find(l => l.code === t.languageCode);
            return {
                id: generateUUID(),
                language: lang || { code: t.languageCode, name: t.languageCode.toUpperCase(), nativeName: t.languageCode.toUpperCase() },
                text: t.translatedText,
                qualityScore: t.qualityScore,
                edited: false
            };
        });

        const successRequest: TranslationRequest = { ...startRequest, translations, status: 'completed' };
        dispatch({ type: 'API_REQUEST_SUCCESS', payload: successRequest });

    } catch (error: any) {
        console.error("AI Translation Error:", error);
        const errorMessage = error.message || 'An unknown error occurred during translation.';
        dispatch({ type: 'API_REQUEST_FAILURE', payload: { error: errorMessage } });
    }
};


// SECTION 7: UI COMPONENTS
// ============================================================================

// --- SVG Icon Components ---

export const IconCopy: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

export const IconCheck: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export const IconEdit: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

export const IconTrash: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);

export const IconPlus: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

// --- Form & UI Components ---

export const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => {
    const { state } = useLocalization();
    if (!state.userSettings.showTooltips) return <>{children}</>;
    return (
        <div className="relative group">
            {children}
            <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 text-sm font-medium text-white bg-gray-900/80 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                {text}
            </div>
        </div>
    );
};

export const LanguageSelector: React.FC<{
    selectedLanguages: LanguageCode[];
    onChange: (codes: LanguageCode[]) => void;
}> = ({ selectedLanguages, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredLanguages = useMemo(() =>
        SUPPORTED_LANGUAGES.filter(lang =>
            lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm]);

    const handleToggle = (code: LanguageCode) => {
        const newSelection = selectedLanguages.includes(code)
            ? selectedLanguages.filter(c => c !== code)
            : [...selectedLanguages, code];
        onChange(newSelection);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-300 mb-1">Target Languages</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-700/50 p-3 rounded text-white text-sm text-left flex justify-between items-center focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
                <span className="truncate">{selectedLanguages.length > 0 ? `${selectedLanguages.length} languages selected` : 'Select languages...'}</span>
                <span className="ml-2">▼</span>
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                        <input
                            type="text"
                            placeholder="Search languages..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-900 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <ul>
                        {filteredLanguages.map(lang => (
                            <li key={lang.code} className="px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 cursor-pointer flex items-center" onClick={() => handleToggle(lang.code)}>
                                <input
                                    type="checkbox"
                                    checked={selectedLanguages.includes(lang.code)}
                                    readOnly
                                    className="mr-3 h-4 w-4 rounded border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span>{lang.name} <span className="text-gray-400">({lang.nativeName})</span></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const ToneSelector: React.FC<{
    selectedTone: ToneKey;
    onChange: (key: ToneKey) => void;
}> = ({ selectedTone, onChange }) => {
    return (
        <div>
            <label htmlFor="tone-selector" className="block text-sm font-medium text-gray-300 mb-1">Tone of Voice</label>
            <select
                id="tone-selector"
                value={selectedTone}
                onChange={e => onChange(e.target.value as ToneKey)}
                className="w-full bg-gray-700/50 p-3 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
                {SUPPORTED_TONES.map(tone => (
                    <option key={tone.key} value={tone.key}>{tone.name}</option>
                ))}
            </select>
        </div>
    );
};

export const TranslationInputForm: React.FC<{
    project: LocalizationProject;
}> = ({ project }) => {
    const { dispatch } = useLocalization();
    const [sourceText, setSourceText] = useState("Welcome to your dashboard");
    const [targetLanguages, setTargetLanguages] = useState<LanguageCode[]>(project.settings.defaultTargetLanguages);
    const [tone, setTone] = useState<ToneKey>(project.settings.defaultTone);
    const [context, setContext] = useState("");

    const handleGenerate = () => {
        const languages = SUPPORTED_LANGUAGES.filter(l => targetLanguages.includes(l.code));
        const selectedTone = SUPPORTED_TONES.find(t => t.key === tone);
        if (languages.length === 0 || !selectedTone) {
            dispatch({ type: 'SET_ERROR', payload: "Please select at least one target language and a tone." });
            return;
        }

        executeTranslation({
            sourceText,
            targetLanguages: languages,
            tone: selectedTone,
            context,
            glossary: project.glossary
        }, dispatch);
    };
    
    return (
        <Card title="AI Translation Generator">
            <div className="space-y-4">
                <div>
                    <label htmlFor="source-text" className="block text-sm font-medium text-gray-300 mb-1">Source Text (English)</label>
                    <textarea
                        id="source-text"
                        rows={4}
                        value={sourceText}
                        onChange={e => setSourceText(e.target.value)}
                        className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Enter English text to translate..."
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LanguageSelector selectedLanguages={targetLanguages} onChange={setTargetLanguages} />
                    <ToneSelector selectedTone={tone} onChange={setTone} />
                </div>
                <div>
                    <label htmlFor="context" className="block text-sm font-medium text-gray-300 mb-1">Context (Optional)</label>
                    <input
                        id="context"
                        type="text"
                        value={context}
                        onChange={e => setContext(e.target.value)}
                        className="w-full bg-gray-700/50 p-3 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., 'A button on the main dashboard'"
                    />
                </div>
                <button onClick={handleGenerate} className="w-full mt-2 py-3 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors text-white font-semibold">
                    Generate Translations
                </button>
            </div>
        </Card>
    );
};

export const TranslationResultItem: React.FC<{
    translation: Translation;
    onUpdate: (newText: string) => void;
}> = ({ translation, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(translation.text);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(translation.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        onUpdate(editedText);
        setIsEditing(false);
    };
    
    const scoreColor = (score: number) => {
        if (score > 0.9) return 'text-green-400';
        if (score > 0.7) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm p-3 bg-gray-900/50 rounded-lg space-y-2 md:space-y-0">
            <div className="flex-shrink-0 w-full md:w-1/4">
                <p className="font-semibold text-cyan-300">{translation.language.name}</p>
                <p className="text-gray-400 text-xs">{translation.language.nativeName}</p>
            </div>
            <div className="flex-grow w-full md:w-1/2">
                {isEditing ? (
                    <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="w-full bg-gray-700 p-2 rounded text-white font-mono text-sm"
                        autoFocus
                    />
                ) : (
                    <p className="text-gray-200 font-mono pr-4">{translation.text} {translation.edited && <span className="text-yellow-400 text-xs italic ml-2">(edited)</span>}</p>
                )}
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                {translation.qualityScore && (
                     <Tooltip text={`AI Confidence Score: ${Math.round(translation.qualityScore * 100)}%`}>
                        <span className={`font-mono text-xs ${scoreColor(translation.qualityScore)}`}>
                            {translation.qualityScore.toFixed(2)}
                        </span>
                    </Tooltip>
                )}
                <Tooltip text="Edit">
                    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-white transition-colors">
                        <IconEdit className="w-4 h-4" />
                    </button>
                </Tooltip>
                 <Tooltip text={copied ? "Copied!" : "Copy"}>
                    <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors">
                        {copied ? <IconCheck className="w-4 h-4 text-green-400" /> : <IconCopy className="w-4 h-4" />}
                    </button>
                </Tooltip>
            </div>
        </div>
    );
};

export const ExportControls: React.FC<{ request: TranslationRequest }> = ({ request }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Export as:</span>
            <button onClick={() => exportAsJSON(request, `translation_${request.id}.json`)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors">JSON</button>
            <button onClick={() => exportAsCSV(request, `translation_${request.id}.csv`)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors">CSV</button>
        </div>
    );
};

export const TranslationResultsDisplay: React.FC = () => {
    const { state, dispatch } = useLocalization();
    const { isLoading, error, currentApiRequest } = state;

    if (isLoading && !currentApiRequest) {
        return (
            <Card title="Generating Translations">
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <LoadingSpinner />
                    <p className="text-gray-300">AI is processing your request...</p>
                </div>
            </Card>
        );
    }
    
    if (!currentApiRequest) {
        return null;
    }

    const { id: requestId, status, sourceText, translations } = currentApiRequest;

    const handleUpdateTranslation = (translationId: string, newText: string) => {
        if (!state.activeProjectId) return;
        dispatch({
            type: 'UPDATE_TRANSLATION_IN_HISTORY',
            payload: { projectId: state.activeProjectId, requestId, translationId, newText }
        });
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-white">Generated Translations</h3>
                 {status === 'completed' && <ExportControls request={currentApiRequest} />}
            </div>
            <div className="p-3 bg-gray-800 rounded-md mb-4">
                 <p className="text-xs text-gray-400">Source Text</p>
                 <p className="font-mono text-white">"{sourceText}"</p>
            </div>
            <div className="space-y-3">
                {isLoading && status === 'in_progress' && (
                     <div className="flex flex-col items-center justify-center p-8 space-y-4">
                         <LoadingSpinner />
                         <p className="text-gray-300">Receiving translations...</p>
                    </div>
                )}

                {status === 'completed' && translations.map((t) => (
                    <TranslationResultItem
                        key={t.id}
                        translation={t}
                        onUpdate={(newText) => handleUpdateTranslation(t.id, newText)}
                    />
                ))}

                {status === 'failed' && (
                    <div className="p-4 bg-red-900/50 border border-red-500 rounded-md text-red-300">
                        <p className="font-bold">Translation Failed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export const ProjectManager: React.FC = () => {
    const { state, dispatch } = useLocalization();
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    const handleCreateProject = () => {
        if (newName.trim()) {
            dispatch({ type: 'CREATE_PROJECT', payload: { name: newName, description: newDesc } });
            setNewName('');
            setNewDesc('');
            setIsCreating(false);
        }
    };
    
    return (
        <Card title="Project Management">
            <div className="space-y-4">
                <div>
                    <label htmlFor="project-select" className="block text-sm font-medium text-gray-300 mb-1">Active Project</label>
                    <div className="flex space-x-2">
                        <select
                            id="project-select"
                            value={state.activeProjectId || ''}
                            onChange={(e) => dispatch({ type: 'SET_ACTIVE_PROJECT', payload: { projectId: e.target.value } })}
                            className="w-full bg-gray-700/50 p-3 rounded text-white text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={state.projects.length === 0}
                        >
                            {state.projects.length === 0 && <option>No projects yet</option>}
                            {state.projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button onClick={() => setIsCreating(true)} className="p-3 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"><IconPlus className="w-5 h-5" /></button>
                    </div>
                </div>

                {isCreating && (
                    <div className="p-4 bg-gray-900/50 rounded-lg space-y-3">
                        <h4 className="text-md font-semibold text-white">Create New Project</h4>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Project Name"
                            className="w-full bg-gray-700 p-2 rounded text-white text-sm"
                        />
                        <textarea
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                            placeholder="Project Description (optional)"
                            rows={2}
                            className="w-full bg-gray-700 p-2 rounded text-white text-sm"
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsCreating(false)} className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">Cancel</button>
                            <button onClick={handleCreateProject} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-xs">Create</button>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

// SECTION 8: MAIN VIEW COMPONENT
// ============================================================================

const EnhancedDemoBankLocalizationPlatformView: React.FC = () => {
    const { state } = useLocalization();
    const activeProject = useMemo(() => state.projects.find(p => p.id === state.activeProjectId), [state.projects, state.activeProjectId]);
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Advanced Localization Platform</h2>
            
            <ProjectManager />

            {activeProject ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <TranslationInputForm project={activeProject} />
                        <TranslationResultsDisplay />
                    </div>
                    <div>
                        {/* Placeholder for History/Glossary sidebar */}
                        <Card title="Project Details">
                           <div className="space-y-2 text-sm text-gray-300">
                               <p><span className="font-semibold text-gray-100">Project:</span> {activeProject.name}</p>
                               <p><span className="font-semibold text-gray-100">Description:</span> {activeProject.description || 'N/A'}</p>
                               <p><span className="font-semibold text-gray-100">History Items:</span> {activeProject.history.length}</p>
                               <p><span className="font-semibold text-gray-100">Glossary Terms:</span> {activeProject.glossary.length}</p>
                               <p><span className="font-semibold text-gray-100">Last Updated:</span> {formatDate(activeProject.updatedAt)}</p>
                           </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card>
                    <div className="text-center p-8">
                        <h3 className="text-xl font-semibold text-white">No Project Selected</h3>
                        <p className="text-gray-400 mt-2">Please create or select a project to begin translating.</p>
                    </div>
                </Card>
            )}

             {state.error && (
                <div className="fixed bottom-5 right-5 bg-red-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
                    <h4 className="font-bold">An Error Occurred</h4>
                    <p className="text-sm">{state.error}</p>
                </div>
            )}
        </div>
    );
};

// This is the final component that wraps everything in the provider.
const DemoBankLocalizationPlatformView: React.FC = () => {
    return (
        <LocalizationProvider>
            <EnhancedDemoBankLocalizationPlatformView />
        </LocalizationProvider>
    );
};


export default DemoBankLocalizationPlatformView;
