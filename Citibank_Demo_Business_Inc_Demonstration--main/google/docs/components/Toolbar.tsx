// google/docs/components/Toolbar.tsx
// The Scribe's Tools. A collection of instruments for shaping the form and style of the written word.

import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';

// --- MOCK CONTEXTS AND TYPES (To simulate interaction with other parts of the app) ---
// These contexts would typically be defined in a higher-level directory or global state manager.
// For this exercise, they are co-located to demonstrate interaction potential and
// allow the Toolbar components to "intelligently interact" with hypothetical application state.

/**
 * Represents the comprehensive state of an active document.
 * This type expands significantly to cover all envisioned features.
 */
export type DocumentState = {
    content: string; // Current document content (simplified)
    selection: { start: number; end: number; } | null; // Current text selection
    fontFamily: string;
    fontSize: number;
    textColor: string;
    highlightColor: string;
    alignment: 'left' | 'center' | 'right' | 'justify';
    lineSpacing: number;
    zoomLevel: number; // Percentage, e.g., 100
    trackChangesEnabled: boolean;
    comments: Array<{ id: string; text: string; author: string; resolved: boolean; range: { start: number; end: number; } }>;
    versionHistory: Array<{ versionId: string; timestamp: string; editor: string; summary: string }>;
    darkMode: boolean;
    language: string; // e.g., 'en-US', 'es-ES'
    aiAssistantActive: boolean;
    userPermissions: { canEdit: boolean; canComment: boolean; canShare: boolean; canAdmin: boolean };
    pageSetup: {
        orientation: 'portrait' | 'landscape';
        pageSize: 'A4' | 'Letter' | 'Legal' | 'Tabloid' | 'Executive' | 'Custom';
        margins: { top: number; bottom: number; left: number; right: number };
        columns: number;
        lineNumbers: 'none' | 'continuous' | 'restartEachPage' | 'restartEachSection';
        hyphenation: boolean;
        theme: string; // Name of active theme
        backgroundColor: string;
        watermark: string | null; // e.g., 'Draft', 'Confidential', or image URL
    };
    integrations: {
        googleDriveConnected: boolean;
        googleCalendarConnected: boolean;
        crmConnected: boolean;
        jiraConnected: boolean;
        slackConnected: boolean;
        // ... many more integration states
    };
    accessibilitySettings: {
        highContrast: boolean;
        dyslexiaFont: boolean; // Toggles a specific font like OpenDyslexic
        screenReaderSupport: boolean;
        liveCaptionsEnabled: boolean;
        keyboardNavigationGuide: boolean;
        voiceControlEnabled: boolean;
        textToSpeechRate: number; // words per minute
        textToSpeechVoice: string; // voice ID
    };
    customMacros: Array<{ name: string; script: string; shortcut?: string }>;
    proofingSettings: {
        spellCheckEnabled: boolean;
        grammarCheckEnabled: boolean;
        styleCheckEnabled: boolean;
        customDictionary: string[];
    };
    documentStatus: 'draft' | 'review' | 'final';
    security: {
        encryptionEnabled: boolean;
        digitalSignaturePresent: boolean;
        irmApplied: boolean; // Information Rights Management
        restrictedEditing: boolean; // If editing is locked
    };
    outlineStructure: Array<{ id: string; level: number; text: string }>;
    currentPage: number;
    totalPageCount: number;
    wordCount: number;
    charCount: number;
    // ... many more document-specific states
};

/**
 * Represents the state of the current user.
 */
export type UserState = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    preferences: {
        defaultFont: string;
        theme: 'light' | 'dark' | 'system'; // System theme respects OS preference
        keyboardShortcuts: { [key: string]: string }; // Custom shortcuts
        defaultLanguage: string;
        timezone: string;
        notificationSettings: {
            email: boolean;
            inApp: boolean;
            desktop: boolean;
        };
    };
    roles: string[]; // e.g., ['editor', 'admin', 'guest']
    recentDocuments: Array<{ id: string; title: string; lastAccessed: string }>;
};

/**
 * Represents the state of AI-powered features.
 */
export type AIState = {
    suggestions: string[]; // General AI suggestions (rephrase, expand, etc.)
    sentimentScore: number | null; // -1 to 1 for selection/document
    translationInProgress: boolean;
    translationResult: string | null;
    grammarErrors: Array<{ text: string; suggestion: string; range: { start: number; end: number; } }>;
    summarizedContent: string | null;
    contentGenerationStatus: 'idle' | 'generating' | 'error';
    plagiarismReport: { score: number; sources: string[]; } | null;
    accessibilityReport: Array<{ rule: string; description: string; fix: string; severity: 'low' | 'medium' | 'high' }>;
};

// --- Context Interfaces ---
export interface DocumentContextType {
    documentState: DocumentState;
    updateDocumentState: (newState: Partial<DocumentState>) => void;
    performAction: (actionType: string, payload?: any) => Promise<any>; // Generic action handler for document modifications
}

export interface UserContextType {
    userState: UserState;
    updateUserState: (newState: Partial<UserState>) => void;
}

export interface AIContextType {
    aiState: AIState;
    triggerAISuggestion: (text: string, type: 'rephrase' | 'summarize' | 'expand' | 'grammar' | 'style' | 'tone') => Promise<void>;
    triggerTranslation: (text: string, sourceLang: string, targetLang: string) => Promise<void>;
    analyzeSentiment: (text: string) => Promise<void>;
    generateContent: (prompt: string, context?: string) => Promise<string>;
    runPlagiarismCheck: (text: string) => Promise<void>;
    runAccessibilityCheck: (documentContent: string) => Promise<void>;
}

// --- Context Providers ---
export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);
export const UserContext = createContext<UserContextType | undefined>(undefined);
export const AIContext = createContext<AIContextType | undefined>(undefined);

// Mock implementation of hooks to consume contexts
export const useDocument = () => {
    const context = useContext(DocumentContext);
    if (!context) throw new Error("useDocument must be used within a DocumentProvider");
    return context;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) throw new Error("useAI must be used within an AIProvider");
    return context;
};

// --- MOCK UTILITY COMPONENTS ---

interface ToolbarButtonProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    isActive?: boolean;
    disabled?: boolean;
    className?: string;
    title?: string;
    children?: React.ReactNode; // For more complex buttons with custom content
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, icon, onClick, isActive, disabled, className, title, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors duration-150 ease-in-out
            ${isActive ? 'bg-blue-600 hover:bg-blue-500 ring-2 ring-blue-300' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-700' : ''}
            ${className || ''}`}
        title={title || label}
    >
        {icon && <span className="mr-1">{icon}</span>}
        {children || label}
    </button>
);

interface ToolbarDropdownProps {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    title?: string;
    align?: 'left' | 'right';
}

export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({ label, icon, children, disabled, className, title, align = 'left' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuPositionClass = align === 'right' ? 'right-0' : 'left-0';

    return (
        <div className={`relative ${className || ''}`} ref={dropdownRef}>
            <ToolbarButton
                label={label}
                icon={icon}
                onClick={toggleDropdown}
                disabled={disabled}
                className={`flex-shrink-0 ${isOpen ? 'bg-blue-700 hover:bg-blue-600' : ''}`}
                title={title}
            >
                {label}
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </ToolbarButton>
            {isOpen && (
                <div className={`absolute z-50 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none ${menuPositionClass}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

interface DropdownItemProps {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    isActive?: boolean;
    className?: string;
    children?: React.ReactNode; // For nested dropdowns/sub-items or custom content
}

export const DropdownItem: React.FC<DropdownItemProps> = ({ label, icon, onClick, disabled, isActive, className, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700
            ${isActive ? 'bg-blue-600 text-white' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed text-gray-500' : ''}
            ${className || ''}`}
        role="menuitem"
    >
        {icon && <span className="mr-2">{icon}</span>}
        {children || label}
    </button>
);

interface ToolbarSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (newValue: number) => void;
    unit?: string;
    className?: string;
}

export const ToolbarSlider: React.FC<ToolbarSliderProps> = ({ label, value, min, max, step, onChange, unit, className }) => (
    <div className={`flex items-center space-x-2 text-white ${className || ''}`} title={label}>
        <span className="text-xs shrink-0 min-w-[30px]">{label}</span>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-24 h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer range-sm accent-blue-500"
        />
        <span className="text-xs min-w-[30px] text-right">{value}{unit}</span>
    </div>
);

interface ToolbarInputProps {
    label: string;
    value: string | number;
    onChange: (newValue: string | number) => void;
    type?: 'text' | 'number' | 'color' | 'email' | 'password';
    placeholder?: string;
    className?: string;
    title?: string;
    min?: number;
    max?: number;
    step?: number;
}

export const ToolbarInput: React.FC<ToolbarInputProps> = ({ label, value, onChange, type = 'text', placeholder, className, title, min, max, step }) => (
    <div className={`flex items-center space-x-2 text-white ${className || ''}`} title={title || label}>
        <label htmlFor={`toolbar-input-${label}`} className="text-xs shrink-0">{label}:</label>
        <input
            id={`toolbar-input-${label}`}
            type={type}
            value={value}
            onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className="w-24 p-1 text-sm bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
        />
    </div>
);

// --- ICON LIBRARY (Mocking a comprehensive icon system with simple SVG placeholders) ---
// In a real application, these would be robust SVG components or imported from an icon library.
export const Icons = {
    Bold: () => <span className="font-bold">B</span>,
    Italic: () => <span className="italic">I</span>,
    Underline: () => <span className="underline">U</span>,
    Strikethrough: () => <span className="line-through">S</span>,
    Superscript: () => <span className="align-super text-[0.7em]">X²</span>,
    Subscript: () => <span className="align-sub text-[0.7em]">X₂</span>,
    AlignLeft: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h10a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"></path></svg>,
    AlignCenter: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12a1 1 0 010 2H4a1 1 0 010-2zm0 4h10a1 1 0 010 2H5a1 1 0 010-2zm0 4h12a1 1 0 010 2H4a1 1 0 010-2z"></path></svg>,
    AlignRight: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14a1 1 0 010 2H3a1 1 0 010-2zm4 4h10a1 1 0 010 2H7a1 1 0 010-2zm-4 4h14a1 1 0 010 2H3a1 1 0 010-2z"></path></svg>,
    AlignJustify: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"></path></svg>,
    Font: () => <span className="font-serif">Aa</span>,
    FontSize: () => <span className="font-bold text-xs">12</span>,
    TextColor: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"></path></svg>,
    HighlightColor: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.5 2a1.5 1.5 0 011.5 1.5v6.293l-4 4V13a1 1 0 00-1-1H3.5a1.5 1.5 0 01-1.5-1.5V3.5A1.5 1.5 0 013.5 2h10zM12 4H6a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1z"></path></svg>,
    Link: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12 5H9a5 5 0 00-5 5v2a5 5 0 005 5h3a5 5 0 005-5v-2a5 5 0 00-5-5zM9 7h3a3 3 0 010 6H9a3 3 0 010-6z"></path></svg>,
    Image: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 4 4 4-4v4zM6 9a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"></path></svg>,
    Table: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H5zm3 2h4v3H8V4zm-3 7h4v3H5v-3zm5 0h4v3h-4v-3z" clipRule="evenodd"></path></svg>,
    ListBulleted: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>,
    ListNumbered: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>,
    Checklist: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>,
    IndentIncrease: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6H7V4h6v2zm-2 4H7V8h4v2zm4 4H7v-2h8v2zM5 4h2v12H5V4z"></path></svg>,
    IndentDecrease: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7 6h6V4H7v2zm4 4H7V8h4v2zm-4 4h8v-2H7v2zM15 4h-2v12h2V4z"></path></svg>,
    Comment: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.888 8.888 0 01-4.706-1.579l-4.238 1.838a1 1 0 01-1.218-1.218l1.838-4.238A8.888 8.888 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM9 9a1 1 0 100 2h2a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>,
    TrackChanges: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18H4v-1a4 4 0 011.535-3.045L5.5 14h9l-.035.045A4 4 0 0116 17v1z"></path></svg>,
    History: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>,
    Share: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H5a1 1 0 110-2h3V5a1 1 0 011-1z" clipRule="evenodd"></path></svg>,
    AI: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 8a3 3 0 116 0 3 3 0 01-6 0z"></path></svg>, // Represents a brain or cog
    Translate: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 8a3 3 0 116 0 3 3 0 01-6 0z"></path></svg>,
    Check: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>,
    ZoomIn: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>,
    ZoomOut: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>,
    Settings: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.176a.75.75 0 011.06 0l3.125 3.125a.75.75 0 010 1.06L13.176 11.49a.75.75 0 01-1.06 0L8.99 8.354a.75.75 0 010-1.06l3.125-3.125a.75.75 0 010-1.06zM7 7.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" clipRule="evenodd"></path></svg>,
    Save: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 2a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7.414A2 2 0 0015.414 6L11.414 2H5zm2 13a1 1 0 100 2h6a1 1 0 100-2H7zm0-4a1 1 0 100 2h6a1 1 0 100-2H7z"></path></svg>,
    Open: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>,
    NewDoc: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 9V8a1 1 0 112 0v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3z"></path></svg>,
    Print: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2V0H2a2 2 0 00-2 2v10a2 2 0 002 2h4v5a1 1 0 001 1h8a1 1 0 001-1v-5h4a2 2 0 002-2V2a2 2 0 00-2-2H6zm0 14H2v-4h4v4zm12-4h-4V2h4v10zM9 2h2v4H9V2zm0 14h2v4H9v-4z"></path></svg>,
    Download: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"></path></svg>,
    Undo: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.928 6.447a1 1 0 00-1.414-1.414L8 8.586l-3.514-3.514a1 1 0 10-1.414 1.414L6.586 10l-3.514 3.514a1 1 0 101.414 1.414L8 11.414l3.514 3.514a1 1 0 001.414-1.414L9.414 10l3.514-3.514z"></path></svg>,
    Redo: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.928 6.447a1 1 0 00-1.414-1.414L8 8.586l-3.514-3.514a1 1 0 10-1.414 1.414L6.586 10l-3.514 3.514a1 1 0 101.414 1.414L8 11.414l3.514 3.514a1 1 0 001.414-1.414L9.414 10l3.514-3.514z"></path></svg>,
    Cut: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12 5H9a5 5 0 00-5 5v2a5 5 0 005 5h3a5 5 0 005-5V7a2 2 0 00-2-2zM9 7h3a3 3 0 010 6H9a3 3 0 010-6z"></path></svg>, // scissor icon
    Copy: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 000 2h2a1 1 0 100-2H8z"></path><path d="M3 8a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zM11 5a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zM11 10a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zM11 15a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"></path></svg>,
    Paste: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 3a1 1 0 000 2h2a1 1 0 100-2H8z"></path><path d="M3 8a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zM11 5a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zM11 10a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zM11 15a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z"></path></svg>,
    FormatPainter: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414L13.414 10l3.293 3.293a1 1 0 01-1.414 1.414L12 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414L12 8.586l3.293-3.293a1 1 0 011.414 0z"></path></svg>,
    Find: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>,
    Replace: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12.928 6.447a1 1 0 00-1.414-1.414L8 8.586l-3.514-3.514a1 1 0 10-1.414 1.414L6.586 10l-3.514 3.514a1 1 0 101.414 1.414L8 11.414l3.514 3.514a1 1 0 001.414-1.414L9.414 10l3.514-3.514z"></path></svg>,
    Equation: () => <span className="font-serif text-lg">∑</span>,
    Symbol: () => <span className="font-serif text-lg">Ω</span>,
    PageSetup: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z"></path></svg>,
    HeaderFooter: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v2H4V5zm0 8h12v2H4v-2z"></path></svg>,
    TOC: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h10a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z"></path></svg>,
    MailMerge: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16 4h-4V2a2 2 0 00-2-2H8a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zm-6-2h4v2h-4V2zm6 14H4V6h12v10z"></path></svg>,
    Macro: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 8a3 3 0 116 0 3 3 0 01-6 0z"></path></svg>,
    Accessibility: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12a1 1 0 100-2 1 1 0 000 2zm6-4a1 1 0 100-2 1 1 0 000 2zM12 2a8 8 0 100 16 8 8 0 000-16zM4.332 7.749A6.992 6.992 0 0110 3a7 7 0 016.708 4.749c-.563.14-.811.458-.811.851-.013.344.208.57.733.727A6.992 6.992 0 0110 17a7 7 0 01-6.708-4.749c.563-.14.811-.458.811-.851.013-.344-.208-.57-.733-.727z"></path></svg>,
    DarkLightMode: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.451 4.275a.5.5 0 00.11-.13l.42-.84a.5.5 0 00-.012-.516l-.766-.766a.5.5 0 00-.516-.012l-.84.42a.5.5 0 00-.13.11l-.42.84a.5.5 0 00.012.516l.766.766a.5.5 0 00.516.012l.84-.42zM15.464 6.343a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707zm-10.928 0a1 1 0 00-1.414 1.414l.707.707a1 1 0 101.414-1.414l-.707-.707zM17 10a1 1 0 11-2 0 1 1 0 012 0zM3 10a1 1 0 11-2 0 1 1 0 012 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1z" clipRule="evenodd"></path></svg>,
    Integrations: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v2H5V5zm0 4h10v6H5V9z"></path></svg>,
    Plagiarism: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-8V6a1 1 0 012 0v2a1 1 0 002 0v-2a3 3 0 00-6 0v4a1 1 0 002 0v-2h2v4h-4a1 1 0 000 2h6a1 1 0 000-2h-4V8h2z"></path></svg>,
    Dictate: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.857c-1.427-.513-2.67-1.442-3.665-2.664a1 1 0 00-1.408 1.408c1.378 1.378 3.12 2.373 5.073 2.768V18a1 1 0 002 0v-2a1 1 0 00-1-1zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>,
    ReadAloud: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 4a1 1 0 011 1v4a1 1 0 11-2 0V5a1 1 0 011-1zm2.857 6.143a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 111.414-1.414l.707.707zM6.143 10.857a1 1 0 111.414-1.414l.707.707a1 1 0 01-1.414 1.414l-.707-.707zM10 18a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd"></path></svg>,
    Forms: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v2H5V5zm0 4h10v2H5V9zm0 4h10v2H5v-2z"></path></svg>,
    DataExtraction: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12V2H4a2 2 0 00-2 2v12h2V4zm2 2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2zm0 2v10h12V8H6zm2 2h8v2H8v-2zm0 4h8v2H8v-2z"></path></svg>,
    Export: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17 16V6H7v10h10zM5 4h12a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v10h12V6H5z"></path></svg>,
    CloudSync: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 10a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M15 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM5 4h10v12H5V4z"></path></svg>,
    Security: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 8H2V6h16v2zM2 12h16v-2H2v2zm0 4h16v-2H2v2z" clipRule="evenodd"></path></svg>,
    Templates: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H9zm0 2h6v12H9V4zm0 14a2 2 0 00-2-2h-2V4h2a2 2 0 002-2v16z"></path></svg>,
    Code: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051A1 1 0 0113 4v1.5a1 1 0 01-2 0V4a1 1 0 01-1-1v-.5l.316-.316a1 1 0 011.368 0L12 3.5l.316-.316a1 1 0 011.368 0zM7 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM7 16a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm7 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"></path></svg>,
    Shapes: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 8a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0zM8 15a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>,
    Charts: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16 2a2 2 0 00-2-2H4a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V2zM4 2h12v16H4V2zm2 4h2v8H6V6zm4 0h2v12h-2V6zm4 0h2v6h-2V6z"></path></svg>,
    Date: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>,
    HorizontalRule: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>,
    FindReplace: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>,
    WordCount: () => <span className="text-xs font-semibold">WC</span>,
    Thesaurus: () => <span className="text-xs font-semibold">Th</span>,
    Research: () => <span className="text-xs font-semibold">Rch</span>,
    CheckAccessibility: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 8a3 3 0 116 0 3 3 0 01-6 0z"></path></svg>,
    Proofing: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-3 8a3 3 0 116 0 3 3 0 01-6 0z"></path></svg>,
    Watermark: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 8a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0zM8 15a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>,
    PageNumbers: () => <span className="text-xs font-bold">123</span>,
    Outline: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"></path></svg>,
    Columns: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3h4v14H3V3zm6 0h4v14H9V3zm6 0h4v14h-4V3z"></path></svg>,
    ClipboardHistory: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v2H5V5zm0 4h10v2H5V9zm0 4h10v2H5v-2z"></path></svg>,
    ViewFullScreen: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3h2v2H3V3zm0 12h2v2H3v-2zm12 0h2v2h-2v-2zm0-12h2v2h-2V3z"></path><path d="M5 5h10v10H5V5zm0 0H3v2h2V5zm0 8H3v2h2v-2z"></path></svg>,
    FocusMode: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 11-2 0 1 1 0 012 0zM10 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"></path></svg>,
    SplitView: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 00-1 1v12a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1H2zm0 2h7v10H2V5zm9 0h7v10h-7V5z"></path></svg>,
};


// --- CORE TOOLBAR SECTIONS ---
// Each section represents a major functional grouping, similar to a "ribbon tab" in desktop editors.

interface ToolbarSectionProps {
    title: string;
    children: React.ReactNode;
}

export const ToolbarSection: React.FC<ToolbarSectionProps> = ({ title, children }) => (
    <div className="flex flex-col items-center p-2 border-r border-gray-600 last:border-r-0 flex-grow-0 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-1 flex-wrap justify-center">{children}</div>
        <span className="text-xs text-gray-400 mt-0.5">{title}</span>
    </div>
);

export const FileSection: React.FC = () => {
    const { performAction } = useDocument();
    return (
        <ToolbarSection title="File">
            <ToolbarDropdown label="File" icon={<Icons.NewDoc />}>
                <DropdownItem label="New Document" icon={<Icons.NewDoc />} onClick={() => performAction('NEW_DOCUMENT')} />
                <DropdownItem label="Open..." icon={<Icons.Open />} onClick={() => performAction('OPEN_DOCUMENT')} />
                <DropdownItem label="Save" icon={<Icons.Save />} onClick={() => performAction('SAVE_DOCUMENT')} />
                <ToolbarDropdown label="Save As..." >
                    <DropdownItem label="Save as Copy" onClick={() => performAction('SAVE_AS_COPY')} />
                    <DropdownItem label="Save as Template" onClick={() => performAction('SAVE_AS_TEMPLATE')} />
                    <DropdownItem label="Save to Cloud" icon={<Icons.CloudSync />} onClick={() => performAction('SAVE_TO_CLOUD')} />
                    <DropdownItem label="Publish to Web" onClick={() => performAction('PUBLISH_TO_WEB')} />
                </ToolbarDropdown>
                <ToolbarDropdown label="Export">
                    <DropdownItem label="PDF" icon={<Icons.Export />} onClick={() => performAction('EXPORT_PDF')} />
                    <DropdownItem label="DOCX" icon={<Icons.Export />} onClick={() => performAction('EXPORT_DOCX')} />
                    <DropdownItem label="HTML" icon={<Icons.Export />} onClick={() => performAction('EXPORT_HTML')} />
                    <DropdownItem label="Markdown" icon={<Icons.Export />} onClick={() => performAction('EXPORT_MD')} />
                    <DropdownItem label="ePub" icon={<Icons.Export />} onClick={() => performAction('EXPORT_EPUB')} />
                    <DropdownItem label="JSON (for API)" icon={<Icons.Code />} onClick={() => performAction('EXPORT_JSON')} />
                </ToolbarDropdown>
                <DropdownItem label="Print" icon={<Icons.Print />} onClick={() => performAction('PRINT_DOCUMENT')} />
                <DropdownItem label="Share" icon={<Icons.Share />} onClick={() => performAction('OPEN_SHARE_DIALOG')} />
                <DropdownItem label="Version History" icon={<Icons.History />} onClick={() => performAction('VIEW_VERSION_HISTORY')} />
                <DropdownItem label="Document Properties" onClick={() => performAction('VIEW_DOCUMENT_PROPERTIES')} />
                <DropdownItem label="Go Offline Mode" onClick={() => performAction('TOGGLE_OFFLINE_MODE')} />
                <ToolbarDropdown label="Integrations">
                    <DropdownItem label="Connect Google Drive" icon={<Icons.CloudSync />} onClick={() => performAction('CONNECT_GOOGLE_DRIVE')} />
                    <DropdownItem label="Connect Google Calendar" icon={<Icons.Integrations />} onClick={() => performAction('CONNECT_GOOGLE_CALENDAR')} />
                    <DropdownItem label="Connect CRM (Salesforce)" icon={<Icons.Integrations />} onClick={() => performAction('CONNECT_CRM')} />
                    <DropdownItem label="Connect Jira" icon={<Icons.Integrations />} onClick={() => performAction('CONNECT_JIRA')} />
                    <DropdownItem label="Connect Slack" icon={<Icons.Integrations />} onClick={() => performAction('CONNECT_SLACK')} />
                    <DropdownItem label="Manage API Keys & Webhooks" onClick={() => performAction('MANAGE_APIS_WEBHOOKS')} />
                </ToolbarDropdown>
                <DropdownItem label="App Settings" icon={<Icons.Settings />} onClick={() => performAction('OPEN_APP_SETTINGS')} />
                <DropdownItem label="Exit/Close" onClick={() => performAction('EXIT_APP')} />
            </ToolbarDropdown>
        </ToolbarSection>
    );
};

export const EditSection: React.FC = () => {
    const { performAction } = useDocument();
    return (
        <ToolbarSection title="Edit">
            <ToolbarButton label="Undo" icon={<Icons.Undo />} onClick={() => performAction('UNDO')} title="Undo (Ctrl+Z)" />
            <ToolbarButton label="Redo" icon={<Icons.Redo />} onClick={() => performAction('REDO')} title="Redo (Ctrl+Y)" />
            <ToolbarButton label="Cut" icon={<Icons.Cut />} onClick={() => performAction('CUT')} title="Cut (Ctrl+X)" />
            <ToolbarButton label="Copy" icon={<Icons.Copy />} onClick={() => performAction('COPY')} title="Copy (Ctrl+C)" />
            <ToolbarDropdown label="Paste" icon={<Icons.Paste />} title="Paste (Ctrl+V)">
                <DropdownItem label="Paste" onClick={() => performAction('PASTE', { format: 'default' })} />
                <DropdownItem label="Paste Plain Text" onClick={() => performAction('PASTE', { format: 'plain' })} />
                <DropdownItem label="Paste with Formatting" onClick={() => performAction('PASTE', { format: 'rich' })} />
                <DropdownItem label="Paste Special..." onClick={() => performAction('OPEN_PASTE_SPECIAL_DIALOG')} />
                <DropdownItem label="Clipboard History" icon={<Icons.ClipboardHistory />} onClick={() => performAction('OPEN_CLIPBOARD_HISTORY')} />
            </ToolbarDropdown>
            <ToolbarButton label="Format Painter" icon={<Icons.FormatPainter />} onClick={() => performAction('ACTIVATE_FORMAT_PAINTER')} title="Copy formatting" />
            <ToolbarDropdown label="Find & Replace" icon={<Icons.FindReplace />}>
                <DropdownItem label="Find..." icon={<Icons.Find />} onClick={() => performAction('OPEN_FIND_DIALOG')} />
                <DropdownItem label="Replace..." icon={<Icons.Replace />} onClick={() => performAction('OPEN_REPLACE_DIALOG')} />
                <DropdownItem label="Go To..." onClick={() => performAction('GO_TO_ELEMENT')} />
                <DropdownItem label="Advanced Search (Regex)" onClick={() => performAction('OPEN_ADVANCED_SEARCH')} />
            </ToolbarDropdown>
            <ToolbarButton label="Select All" onClick={() => performAction('SELECT_ALL')} title="Select all content (Ctrl+A)" />
        </ToolbarSection>
    );
};

export const ViewSection: React.FC = () => {
    const { documentState, updateDocumentState, performAction } = useDocument();
    const { userState, updateUserState } = useUser();

    const toggleDarkMode = useCallback(() => {
        const newTheme = documentState.darkMode ? 'light' : 'dark';
        updateDocumentState({ darkMode: !documentState.darkMode });
        updateUserState({ preferences: { ...userState.preferences, theme: newTheme } });
        // Apply actual theme change to document root for real effect
        document.documentElement.classList.toggle('dark', !documentState.darkMode);
        document.documentElement.classList.toggle('light', documentState.darkMode);
    }, [documentState.darkMode, userState.preferences, updateDocumentState, updateUserState]);

    const handleZoomChange = useCallback((value: number) => {
        updateDocumentState({ zoomLevel: value });
    }, [updateDocumentState]);

    return (
        <ToolbarSection title="View">
            <ToolbarDropdown label="View Modes">
                <DropdownItem label="Editing Mode" onClick={() => performAction('SET_VIEW_MODE', 'EDITING')} isActive={true} />
                <DropdownItem label="Suggesting Mode" onClick={() => performAction('SET_VIEW_MODE', 'SUGGESTING')} />
                <DropdownItem label="Viewing Only Mode" onClick={() => performAction('SET_VIEW_MODE', 'VIEWING')} />
                <DropdownItem label="Focus Mode" icon={<Icons.FocusMode />} onClick={() => performAction('SET_VIEW_MODE', 'FOCUS')} />
                <DropdownItem label="Reading Mode" onClick={() => performAction('SET_VIEW_MODE', 'READING')} />
                <DropdownItem label="Full Screen" icon={<Icons.ViewFullScreen />} onClick={() => performAction('SET_FULL_SCREEN')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Show/Hide">
                <DropdownItem label="Ruler" isActive={true} onClick={() => performAction('TOGGLE_RULER')} />
                <DropdownItem label="Gridlines" onClick={() => performAction('TOGGLE_GRIDLINES')} />
                <DropdownItem label="Navigation Pane" isActive={true} onClick={() => performAction('TOGGLE_NAV_PANE')} />
                <DropdownItem label="Document Outline" icon={<Icons.Outline />} isActive={true} onClick={() => performAction('TOGGLE_DOCUMENT_OUTLINE')} />
                <DropdownItem label="Non-printing characters" onClick={() => performAction('TOGGLE_NON_PRINTING_CHARS')} />
                <DropdownItem label="Comments Panel" isActive={true} onClick={() => performAction('TOGGLE_COMMENTS_PANEL')} />
                <DropdownItem label="AI Assistant Panel" onClick={() => performAction('TOGGLE_AI_PANEL')} />
                <DropdownItem label="Collaborators List" isActive={true} onClick={() => performAction('TOGGLE_COLLABORATORS_LIST')} />
                <DropdownItem label="Mini Map / Scroll Map" onClick={() => performAction('TOGGLE_MINI_MAP')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Zoom" icon={<Icons.ZoomIn />}>
                <DropdownItem label="Fit to Page" onClick={() => handleZoomChange(100)} />
                <DropdownItem label="Fit to Width" onClick={() => handleZoomChange(125)} />
                <DropdownItem label="50%" onClick={() => handleZoomChange(50)} />
                <DropdownItem label="75%" onClick={() => handleZoomChange(75)} />
                <DropdownItem label="100%" onClick={() => handleZoomChange(100)} />
                <DropdownItem label="125%" onClick={() => handleZoomChange(125)} />
                <DropdownItem label="150%" onClick={() => handleZoomChange(150)} />
                <DropdownItem label="200%" onClick={() => handleZoomChange(200)} />
                <div className="p-2">
                    <ToolbarSlider label="Custom" min={10} max={400} step={10} value={documentState.zoomLevel} onChange={handleZoomChange} unit="%" />
                </div>
            </ToolbarDropdown>
            <ToolbarButton
                label={documentState.darkMode ? 'Light Mode' : 'Dark Mode'}
                icon={<Icons.DarkLightMode />}
                onClick={toggleDarkMode}
                title="Toggle Dark/Light Mode"
            />
            <ToolbarButton label="Split View" icon={<Icons.SplitView />} onClick={() => performAction('TOGGLE_SPLIT_VIEW')} />
        </ToolbarSection>
    );
};

export const FormatSection: React.FC = () => {
    const { documentState, updateDocumentState, performAction } = useDocument();

    const handleStyleChange = useCallback((key: keyof DocumentState, value: any) => {
        updateDocumentState({ [key]: value });
    }, [updateDocumentState]);

    const handleToggle = useCallback((key: string, feature: string) => {
        // Simplified: In a real app, this would apply/remove formatting to the current selection.
        console.log(`Toggling ${feature} for current selection.`);
        performAction(`TOGGLE_${key.toUpperCase()}`);
    }, [performAction]);

    const fontFamilies = ['Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New', 'Roboto', 'Open Sans', 'Lato', 'Impact', 'Monospace', 'Cursive', 'Fantasy', 'System UI'];
    const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72, 96];
    const lineSpacings = [1, 1.15, 1.5, 2, 2.5, 3];
    const standardColors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080', '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'];
    const highlightColors = ['transparent', '#FFB3BA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#FFD1DC', '#F0F8FF', '#FAEBD7', '#FFEFD5', '#DDA0DD'];

    return (
        <ToolbarSection title="Format">
            <ToolbarButton label="B" icon={<Icons.Bold />} isActive={/* check if bold */ false} onClick={() => handleToggle('bold', 'Bold')} title="Bold (Ctrl+B)" />
            <ToolbarButton label="I" icon={<Icons.Italic />} isActive={/* check if italic */ false} onClick={() => handleToggle('italic', 'Italic')} title="Italic (Ctrl+I)" />
            <ToolbarButton label="U" icon={<Icons.Underline />} isActive={/* check if underline */ false} onClick={() => handleToggle('underline', 'Underline')} title="Underline (Ctrl+U)" />
            <ToolbarButton label="S" icon={<Icons.Strikethrough />} isActive={/* check if strikethrough */ false} onClick={() => handleToggle('strikethrough', 'Strikethrough')} title="Strikethrough" />
            <ToolbarButton label="X²" icon={<Icons.Superscript />} isActive={false} onClick={() => handleToggle('superscript', 'Superscript')} title="Superscript" />
            <ToolbarButton label="X₂" icon={<Icons.Subscript />} isActive={false} onClick={() => handleToggle('subscript', 'Subscript')} title="Subscript" />
            <ToolbarDropdown label="Font" icon={<Icons.Font />} title="Font Family">
                {fontFamilies.map(font => (
                    <DropdownItem
                        key={font}
                        label={font}
                        isActive={documentState.fontFamily === font}
                        onClick={() => handleStyleChange('fontFamily', font)}
                        className={`font-${font.replace(/\s/g, '').toLowerCase()}`} // Mocking font class for visual differentiation
                    />
                ))}
                <DropdownItem label="More Fonts..." onClick={() => performAction('OPEN_FONT_MANAGER')} />
            </ToolbarDropdown>
            <ToolbarDropdown label={`${documentState.fontSize} pt`} icon={<Icons.FontSize />} title="Font Size">
                {fontSizes.map(size => (
                    <DropdownItem
                        key={size}
                        label={`${size} pt`}
                        isActive={documentState.fontSize === size}
                        onClick={() => handleStyleChange('fontSize', size)}
                    />
                ))}
                <DropdownItem label="Custom Size..." onClick={() => performAction('OPEN_CUSTOM_FONT_SIZE_DIALOG')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Text Color" icon={<Icons.TextColor />} title="Text Color">
                {standardColors.map(color => (
                    <DropdownItem
                        key={color}
                        label=""
                        icon={<span className="inline-block w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: color }}></span>}
                        onClick={() => handleStyleChange('textColor', color)}
                        isActive={documentState.textColor === color}
                    />
                ))}
                <DropdownItem label="More Colors..." onClick={() => performAction('OPEN_COLOR_PICKER_TEXT')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Highlight" icon={<Icons.HighlightColor />} title="Highlight Color">
                {highlightColors.map(color => (
                    <DropdownItem
                        key={color}
                        label=""
                        icon={<span className="inline-block w-4 h-4 rounded-full border border-gray-500" style={{ backgroundColor: color }}></span>}
                        onClick={() => handleStyleChange('highlightColor', color)}
                        isActive={documentState.highlightColor === color}
                    />
                ))}
                <DropdownItem label="No Highlight" onClick={() => handleStyleChange('highlightColor', 'transparent')} />
                <DropdownItem label="Custom Highlight..." onClick={() => performAction('OPEN_COLOR_PICKER_HIGHLIGHT')} />
            </ToolbarDropdown>
            <ToolbarButton
                label="Clear Formatting"
                onClick={() => performAction('CLEAR_FORMATTING')}
                title="Clear all formatting from selection"
            />
            <ToolbarDropdown label="Styles" >
                <DropdownItem label="Normal text" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'NORMAL')} />
                <DropdownItem label="Title" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'TITLE')} />
                <DropdownItem label="Subtitle" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'SUBTITLE')} />
                <DropdownItem label="Heading 1" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'H1')} />
                <DropdownItem label="Heading 2" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'H2')} />
                <DropdownItem label="Heading 3" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'H3')} />
                <DropdownItem label="Heading 4" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'H4')} />
                <DropdownItem label="Heading 5" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'H5')} />
                <DropdownItem label="Heading 6" onClick={() => performAction('APPLY_PARAGRAPH_STYLE', 'H6')} />
                <DropdownItem label="Create/Update Style..." onClick={() => performAction('OPEN_STYLE_EDITOR')} />
                <DropdownItem label="Manage Styles..." onClick={() => performAction('OPEN_STYLE_MANAGER')} />
            </ToolbarDropdown>
            <ToolbarButton label="Left" icon={<Icons.AlignLeft />} isActive={documentState.alignment === 'left'} onClick={() => handleStyleChange('alignment', 'left')} />
            <ToolbarButton label="Center" icon={<Icons.AlignCenter />} isActive={documentState.alignment === 'center'} onClick={() => handleStyleChange('alignment', 'center')} />
            <ToolbarButton label="Right" icon={<Icons.AlignRight />} isActive={documentState.alignment === 'right'} onClick={() => handleStyleChange('alignment', 'right')} />
            <ToolbarButton label="Justify" icon={<Icons.AlignJustify />} isActive={documentState.alignment === 'justify'} onClick={() => handleStyleChange('alignment', 'justify')} />
            <ToolbarDropdown label="Line Spacing">
                {lineSpacings.map(spacing => (
                    <DropdownItem
                        key={spacing}
                        label={`${spacing}`}
                        isActive={documentState.lineSpacing === spacing}
                        onClick={() => handleStyleChange('lineSpacing', spacing)}
                    />
                ))}
                <DropdownItem label="Add Space Before Paragraph" onClick={() => performAction('ADD_SPACE_BEFORE_PARAGRAPH')} />
                <DropdownItem label="Add Space After Paragraph" onClick={() => performAction('ADD_SPACE_AFTER_PARAGRAPH')} />
                <DropdownItem label="Custom Spacing..." onClick={() => performAction('OPEN_CUSTOM_LINE_SPACING_DIALOG')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Lists">
                <DropdownItem label="Bulleted List" icon={<Icons.ListBulleted />} onClick={() => performAction('TOGGLE_BULLETED_LIST')} />
                <DropdownItem label="Numbered List" icon={<Icons.ListNumbered />} onClick={() => performAction('TOGGLE_NUMBERED_LIST')} />
                <DropdownItem label="Checklist" icon={<Icons.Checklist />} onClick={() => performAction('TOGGLE_CHECKLIST')} />
                <DropdownItem label="Multilevel List" onClick={() => performAction('APPLY_MULTI_LEVEL_LIST_STYLE')} />
                <DropdownItem label="List Options..." onClick={() => performAction('OPEN_LIST_OPTIONS')} />
            </ToolbarDropdown>
            <ToolbarButton label="Indent" icon={<Icons.IndentIncrease />} onClick={() => performAction('INDENT_INCREASE')} />
            <ToolbarButton label="Outdent" icon={<Icons.IndentDecrease />} onClick={() => performAction('INDENT_DECREASE')} />
            <ToolbarDropdown label="Case">
                <DropdownItem label="Sentence case" onClick={() => performAction('CHANGE_CASE', 'SENTENCE')} />
                <DropdownItem label="lowercase" onClick={() => performAction('CHANGE_CASE', 'LOWER')} />
                <DropdownItem label="UPPERCASE" onClick={() => performAction('CHANGE_CASE', 'UPPER')} />
                <DropdownItem label="Capitalize Each Word" onClick={() => performAction('CHANGE_CASE', 'CAPITALIZE')} />
                <DropdownItem label="tOggLE cASE" onClick={() => performAction('CHANGE_CASE', 'TOGGLE')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Borders & Shading">
                <DropdownItem label="Paragraph Border" onClick={() => performAction('APPLY_PARAGRAPH_BORDER')} />
                <DropdownItem label="Page Border" onClick={() => performAction('APPLY_PAGE_BORDER')} />
                <DropdownItem label="Paragraph Shading" onClick={() => performAction('APPLY_PARAGRAPH_SHADING')} />
                <DropdownItem label="Table Borders & Shading" onClick={() => performAction('EDIT_TABLE_BORDERS_SHADING')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Text Direction">
                <DropdownItem label="Left-to-Right" onClick={() => performAction('SET_TEXT_DIRECTION', 'LTR')} />
                <DropdownItem label="Right-to-Left" onClick={() => performAction('SET_TEXT_DIRECTION', 'RTL')} />
            </ToolbarDropdown>
        </ToolbarSection>
    );
};


export const InsertSection: React.FC = () => {
    const { performAction } = useDocument();
    return (
        <ToolbarSection title="Insert">
            <ToolbarDropdown label="Image" icon={<Icons.Image />}>
                <DropdownItem label="Upload from computer" onClick={() => performAction('INSERT_IMAGE_UPLOAD')} />
                <DropdownItem label="Image from URL" onClick={() => performAction('INSERT_IMAGE_URL')} />
                <DropdownItem label="Search web images" onClick={() => performAction('INSERT_IMAGE_SEARCH_WEB')} />
                <DropdownItem label="Google Drive" onClick={() => performAction('INSERT_IMAGE_DRIVE')} />
                <DropdownItem label="Google Photos" onClick={() => performAction('INSERT_IMAGE_PHOTOS')} />
                <DropdownItem label="Take a snapshot" onClick={() => performAction('INSERT_IMAGE_SNAPSHOT')} />
                <DropdownItem label="Alt Text Editor" onClick={() => performAction('EDIT_IMAGE_ALT_TEXT')} />
                <DropdownItem label="Image Editor" onClick={() => performAction('OPEN_IMAGE_EDITOR')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Table" icon={<Icons.Table />}>
                <DropdownItem label="Insert Table..." onClick={() => performAction('OPEN_INSERT_TABLE_DIALOG')} />
                <DropdownItem label="Draw Table" onClick={() => performAction('ACTIVATE_DRAW_TABLE')} />
                <DropdownItem label="Convert text to table" onClick={() => performAction('CONVERT_TEXT_TO_TABLE')} />
                <DropdownItem label="Table from template" onClick={() => performAction('INSERT_TABLE_TEMPLATE')} />
                <DropdownItem label="Table Properties" onClick={() => performAction('OPEN_TABLE_PROPERTIES')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Drawing" icon={<Icons.Shapes />}>
                <DropdownItem label="New Drawing" onClick={() => performAction('CREATE_NEW_DRAWING')} />
                <DropdownItem label="From Google Drawings" onClick={() => performAction('INSERT_GOOGLE_DRAWING')} />
                <DropdownItem label="Shapes" onClick={() => performAction('INSERT_SHAPE_PICKER')} />
                <DropdownItem label="Arrows" onClick={() => performAction('INSERT_ARROW_PICKER')} />
                <DropdownItem label="Callouts" onClick={() => performAction('INSERT_CALLOUT_PICKER')} />
                <DropdownItem label="Flowchart Symbols" onClick={() => performAction('INSERT_FLOWCHART_SYMBOLS')} />
                <DropdownItem label="Word Art" onClick={() => performAction('INSERT_WORD_ART')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Chart" icon={<Icons.Charts />}>
                <DropdownItem label="Bar Chart" onClick={() => performAction('INSERT_CHART', 'BAR')} />
                <DropdownItem label="Column Chart" onClick={() => performAction('INSERT_CHART', 'COLUMN')} />
                <DropdownItem label="Line Chart" onClick={() => performAction('INSERT_CHART', 'LINE')} />
                <DropdownItem label="Pie Chart" onClick={() => performAction('INSERT_CHART', 'PIE')} />
                <DropdownItem label="Scatter Chart" onClick={() => performAction('INSERT_CHART', 'SCATTER')} />
                <DropdownItem label="Area Chart" onClick={() => performAction('INSERT_CHART', 'AREA')} />
                <DropdownItem label="From Google Sheets" onClick={() => performAction('INSERT_CHART_FROM_SHEETS')} />
                <DropdownItem label="Chart Editor" onClick={() => performAction('OPEN_CHART_EDITOR')} />
            </ToolbarDropdown>
            <ToolbarButton label="Link" icon={<Icons.Link />} onClick={() => performAction('INSERT_LINK')} />
            <ToolbarDropdown label="Special Chars" icon={<Icons.Symbol />}>
                <DropdownItem label="Emoji Picker" onClick={() => performAction('INSERT_EMOJI')} />
                <DropdownItem label="Symbol Picker" onClick={() => performAction('OPEN_SYMBOL_PICKER')} />
                <DropdownItem label="Math Operators" onClick={() => performAction('OPEN_MATH_OPERATOR_PICKER')} />
                <DropdownItem label="Currency Symbols" onClick={() => performAction('OPEN_CURRENCY_SYMBOL_PICKER')} />
                <DropdownItem label="Greek Letters" onClick={() => performAction('OPEN_GREEK_LETTERS_PICKER')} />
            </ToolbarDropdown>
            <ToolbarButton label="Equation" icon={<Icons.Equation />} onClick={() => performAction('INSERT_EQUATION_EDITOR')} />
            <ToolbarDropdown label="Structure">
                <DropdownItem label="Horizontal Line" icon={<Icons.HorizontalRule />} onClick={() => performAction('INSERT_HORIZONTAL_LINE')} />
                <DropdownItem label="Page Break" onClick={() => performAction('INSERT_PAGE_BREAK')} />
                <DropdownItem label="Column Break" onClick={() => performAction('INSERT_COLUMN_BREAK')} />
                <DropdownItem label="Section Break (Next Page)" onClick={() => performAction('INSERT_SECTION_BREAK_NEXT')} />
                <DropdownItem label="Section Break (Continuous)" onClick={() => performAction('INSERT_SECTION_BREAK_CONTINUOUS')} />
            </ToolbarDropdown>
            <ToolbarButton label="Header/Footer" icon={<Icons.HeaderFooter />} onClick={() => performAction('EDIT_HEADERS_FOOTERS')} />
            <ToolbarButton label="Page Numbers" icon={<Icons.PageNumbers />} onClick={() => performAction('INSERT_PAGE_NUMBERS')} />
            <ToolbarButton label="Table of Contents" icon={<Icons.TOC />} onClick={() => performAction('INSERT_TABLE_OF_CONTENTS')} />
            <ToolbarDropdown label="Other Media">
                <DropdownItem label="Video (Embed/Upload)" onClick={() => performAction('INSERT_VIDEO')} />
                <DropdownItem label="Audio (Embed/Upload)" onClick={() => performAction('INSERT_AUDIO')} />
                <DropdownItem label="Google Map" onClick={() => performAction('INSERT_GOOGLE_MAP')} />
                <DropdownItem label="Custom Code Block" icon={<Icons.Code />} onClick={() => performAction('INSERT_CODE_BLOCK')} />
                <DropdownItem label="File (Embed/Link)" onClick={() => performAction('INSERT_FILE_EMBED')} />
                <DropdownItem label="3D Model" onClick={() => performAction('INSERT_3D_MODEL')} />
                <DropdownItem label="Live Stream Embed" onClick={() => performAction('INSERT_LIVE_STREAM_EMBED')} />
                <DropdownItem label="Interactive Widget" onClick={() => performAction('INSERT_INTERACTIVE_WIDGET')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Form Controls" icon={<Icons.Forms />}>
                <DropdownItem label="Checkbox" onClick={() => performAction('INSERT_FORM_CHECKBOX')} />
                <DropdownItem label="Radio Button Group" onClick={() => performAction('INSERT_FORM_RADIO_GROUP')} />
                <DropdownItem label="Text Input Field" onClick={() => performAction('INSERT_FORM_TEXT_INPUT')} />
                <DropdownItem label="Dropdown List" onClick={() => performAction('INSERT_FORM_DROPDOWN')} />
                <DropdownItem label="Date Picker" icon={<Icons.Date />} onClick={() => performAction('INSERT_DATE_PICKER')} />
                <DropdownItem label="Signature Field" onClick={() => performAction('INSERT_SIGNATURE_FIELD')} />
                <DropdownItem label="File Upload Field" onClick={() => performAction('INSERT_FILE_UPLOAD_FIELD')} />
                <DropdownItem label="Form Properties" onClick={() => performAction('OPEN_FORM_PROPERTIES')} />
            </ToolbarDropdown>
            <ToolbarButton label="Date & Time" icon={<Icons.Date />} onClick={() => performAction('INSERT_CURRENT_DATETIME')} />
            <ToolbarButton label="Bookmark" onClick={() => performAction('INSERT_BOOKMARK')} />
            <ToolbarButton label="Footnote" onClick={() => performAction('INSERT_FOOTNOTE')} />
            <ToolbarButton label="Endnote" onClick={() => performAction('INSERT_ENDNOTE')} />
            <ToolbarButton label="Watermark" icon={<Icons.Watermark />} onClick={() => performAction('ADD_WATERMARK')} />
        </ToolbarSection>
    );
};

export const LayoutSection: React.FC = () => {
    const { documentState, updateDocumentState, performAction } = useDocument();

    const pageSizes = ['A4', 'Letter', 'Legal', 'Tabloid', 'Executive', 'Statement', 'Custom'];
    const orientations = ['portrait', 'landscape'];

    const handlePageSetupChange = useCallback((key: string, value: any) => {
        updateDocumentState({ pageSetup: { ...documentState.pageSetup, [key]: value } });
    }, [documentState.pageSetup, updateDocumentState]);

    return (
        <ToolbarSection title="Layout">
            <ToolbarDropdown label="Margins">
                <DropdownItem label="Normal" onClick={() => performAction('SET_MARGINS', 'NORMAL')} />
                <DropdownItem label="Narrow" onClick={() => performAction('SET_MARGINS', 'NARROW')} />
                <DropdownItem label="Moderate" onClick={() => performAction('SET_MARGINS', 'MODERATE')} />
                <DropdownItem label="Wide" onClick={() => performAction('SET_MARGINS', 'WIDE')} />
                <DropdownItem label="Custom Margins..." onClick={() => performAction('OPEN_CUSTOM_MARGINS_DIALOG')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Orientation">
                {orientations.map(orientation => (
                    <DropdownItem
                        key={orientation}
                        label={orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                        isActive={documentState.pageSetup.orientation === orientation}
                        onClick={() => handlePageSetupChange('orientation', orientation)}
                    />
                ))}
            </ToolbarDropdown>
            <ToolbarDropdown label="Size">
                {pageSizes.map(size => (
                    <DropdownItem
                        key={size}
                        label={size}
                        isActive={documentState.pageSetup.pageSize === size}
                        onClick={() => handlePageSetupChange('pageSize', size)}
                    />
                ))}
                <DropdownItem label="More Page Sizes..." onClick={() => performAction('OPEN_CUSTOM_PAGE_SIZE_DIALOG')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Columns" icon={<Icons.Columns />}>
                <DropdownItem label="One Column" onClick={() => handlePageSetupChange('columns', 1)} isActive={documentState.pageSetup.columns === 1} />
                <DropdownItem label="Two Columns" onClick={() => handlePageSetupChange('columns', 2)} isActive={documentState.pageSetup.columns === 2} />
                <DropdownItem label="Three Columns" onClick={() => handlePageSetupChange('columns', 3)} isActive={documentState.pageSetup.columns === 3} />
                <DropdownItem label="Left Sidebar (Two Uneven)" onClick={() => performAction('APPLY_UNEQUAL_COLUMNS', 'LEFT')} />
                <DropdownItem label="Right Sidebar (Two Uneven)" onClick={() => performAction('APPLY_UNEQUAL_COLUMNS', 'RIGHT')} />
                <DropdownItem label="More Columns..." onClick={() => performAction('OPEN_CUSTOM_COLUMNS_DIALOG')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Breaks">
                <DropdownItem label="Page Break" onClick={() => performAction('INSERT_PAGE_BREAK')} />
                <DropdownItem label="Column Break" onClick={() => performAction('INSERT_COLUMN_BREAK')} />
                <DropdownItem label="Text Wrapping Break" onClick={() => performAction('INSERT_TEXT_WRAP_BREAK')} />
                <DropdownItem label="Section Break (Next Page)" onClick={() => performAction('INSERT_SECTION_BREAK_NEXT')} />
                <DropdownItem label="Section Break (Continuous)" onClick={() => performAction('INSERT_SECTION_BREAK_CONTINUOUS')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Line Numbers">
                <DropdownItem label="None" isActive={documentState.pageSetup.lineNumbers === 'none'} onClick={() => handlePageSetupChange('lineNumbers', 'none')} />
                <DropdownItem label="Continuous" isActive={documentState.pageSetup.lineNumbers === 'continuous'} onClick={() => handlePageSetupChange('lineNumbers', 'continuous')} />
                <DropdownItem label="Restart Each Page" isActive={documentState.pageSetup.lineNumbers === 'restartEachPage'} onClick={() => handlePageSetupChange('lineNumbers', 'restartEachPage')} />
                <DropdownItem label="Restart Each Section" isActive={documentState.pageSetup.lineNumbers === 'restartEachSection'} onClick={() => handlePageSetupChange('lineNumbers', 'restartEachSection')} />
                <DropdownItem label="Line Numbering Options..." onClick={() => performAction('OPEN_LINE_NUMBERING_OPTIONS')} />
            </ToolbarDropdown>
            <ToolbarButton label="Hyphenation" onClick={() => handlePageSetupChange('hyphenation', !documentState.pageSetup.hyphenation)} isActive={documentState.pageSetup.hyphenation} />
            <ToolbarDropdown label="Theme">
                <DropdownItem label="Theme Colors" onClick={() => performAction('OPEN_THEME_COLOR_PICKER')} />
                <DropdownItem label="Theme Fonts" onClick={() => performAction('OPEN_THEME_FONT_PICKER')} />
                <DropdownItem label="Theme Effects" onClick={() => performAction('OPEN_THEME_EFFECTS_PICKER')} />
                <DropdownItem label="Save Current Theme" onClick={() => performAction('SAVE_CURRENT_THEME')} />
                <DropdownItem label="Browse Themes" onClick={() => performAction('BROWSE_THEMES')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Background">
                <DropdownItem label="Page Color" onClick={() => performAction('SET_PAGE_COLOR')} />
                <DropdownItem label="Watermark" icon={<Icons.Watermark />} onClick={() => performAction('ADD_WATERMARK')} />
                <DropdownItem label="Page Borders" onClick={() => performAction('ADD_PAGE_BORDERS')} />
            </ToolbarDropdown>
        </ToolbarSection>
    );
};

export const ReferencesSection: React.FC = () => {
    const { performAction } = useDocument();
    return (
        <ToolbarSection title="References">
            <ToolbarButton label="Table of Contents" icon={<Icons.TOC />} onClick={() => performAction('INSERT_TABLE_OF_CONTENTS')} />
            <ToolbarButton label="Update TOC" onClick={() => performAction('UPDATE_TABLE_OF_CONTENTS')} />
            <ToolbarButton label="Insert Footnote" onClick={() => performAction('INSERT_FOOTNOTE')} />
            <ToolbarButton label="Insert Endnote" onClick={() => performAction('INSERT_ENDNOTE')} />
            <ToolbarButton label="Next Footnote/Endnote" onClick={() => performAction('NAVIGATE_NEXT_NOTE')} />
            <ToolbarDropdown label="Citations & Bibliography">
                <DropdownItem label="Insert Citation" onClick={() => performAction('INSERT_CITATION')} />
                <DropdownItem label="Manage Sources" onClick={() => performAction('MANAGE_SOURCES')} />
                <DropdownItem label="Bibliography" onClick={() => performAction('INSERT_BIBLIOGRAPHY')} />
                <DropdownItem label="Citation Style" onClick={() => performAction('SELECT_CITATION_STYLE')} />
                <DropdownItem label="Update Citations" onClick={() => performAction('UPDATE_CITATIONS')} />
            </ToolbarDropdown>
            <ToolbarButton label="Insert Caption" onClick={() => performAction('INSERT_CAPTION')} />
            <ToolbarButton label="Cross-reference" onClick={() => performAction('INSERT_CROSS_REFERENCE')} />
            <ToolbarDropdown label="Index">
                <DropdownItem label="Mark Entry" onClick={() => performAction('MARK_INDEX_ENTRY')} />
                <DropdownItem label="Insert Index" onClick={() => performAction('INSERT_INDEX')} />
                <DropdownItem label="Update Index" onClick={() => performAction('UPDATE_INDEX')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Table of Figures">
                <DropdownItem label="Insert Table of Figures" onClick={() => performAction('INSERT_TABLE_OF_FIGURES')} />
                <DropdownItem label="Update Table of Figures" onClick={() => performAction('UPDATE_TABLE_OF_FIGURES')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Table of Authorities">
                <DropdownItem label="Mark Citation" onClick={() => performAction('MARK_CITATION_AUTHORITIES')} />
                <DropdownItem label="Insert Table of Authorities" onClick={() => performAction('INSERT_TABLE_OF_AUTHORITIES')} />
                <DropdownItem label="Update Table of Authorities" onClick={() => performAction('UPDATE_TABLE_OF_AUTHORITIES')} />
            </ToolbarDropdown>
            <ToolbarButton label="Smart Lookup" onClick={() => performAction('PERFORM_SMART_LOOKUP')} />
            <ToolbarButton label="Research Tool" icon={<Icons.Research />} onClick={() => performAction('OPEN_RESEARCH_TOOL')} />
            <ToolbarButton label="Mail Merge" icon={<Icons.MailMerge />} onClick={() => performAction('START_MAIL_MERGE')} />
        </ToolbarSection>
    );
};

export const ReviewSection: React.FC = () => {
    const { documentState, updateDocumentState, performAction } = useDocument();
    const { aiState, triggerAISuggestion, analyzeSentiment, runPlagiarismCheck, runAccessibilityCheck } = useAI();

    const toggleTrackChanges = useCallback(() => {
        updateDocumentState({ trackChangesEnabled: !documentState.trackChangesEnabled });
    }, [documentState.trackChangesEnabled, updateDocumentState]);

    const handleProofing = useCallback(() => {
        performAction('RUN_PROOFING_CHECK');
        analyzeSentiment(documentState.content.slice(0, 500)); // Example AI interaction with content
    }, [performAction, analyzeSentiment, documentState.content]);

    const handlePlagiarismCheck = useCallback(() => {
        runPlagiarismCheck(documentState.content);
    }, [runPlagiarismCheck, documentState.content]);

    const handleAccessibilityCheck = useCallback(() => {
        runAccessibilityCheck(documentState.content);
    }, [runAccessibilityCheck, documentState.content]);

    return (
        <ToolbarSection title="Review">
            <ToolbarDropdown label="Proofing" icon={<Icons.Proofing />}>
                <DropdownItem label="Spelling & Grammar" icon={<Icons.Check />} onClick={handleProofing} />
                <DropdownItem label="Thesaurus" icon={<Icons.Thesaurus />} onClick={() => performAction('OPEN_THESAURUS')} />
                <DropdownItem label="Word Count" icon={<Icons.WordCount />} onClick={() => performAction('SHOW_WORD_COUNT')} />
                <DropdownItem label="Set Proofing Language" onClick={() => performAction('SET_PROOFING_LANGUAGE')} />
                <DropdownItem label="Custom Dictionary" onClick={() => performAction('MANAGE_CUSTOM_DICTIONARY')} />
            </ToolbarDropdown>
            <ToolbarButton label="Translate" icon={<Icons.Translate />} onClick={() => performAction('OPEN_TRANSLATION_PANEL')} />
            <ToolbarButton
                label="Track Changes"
                icon={<Icons.TrackChanges />}
                isActive={documentState.trackChangesEnabled}
                onClick={toggleTrackChanges}
            />
            <ToolbarDropdown label="Accept/Reject">
                <DropdownItem label="Accept All Changes" onClick={() => performAction('ACCEPT_ALL_CHANGES')} />
                <DropdownItem label="Accept Current Change" onClick={() => performAction('ACCEPT_CURRENT_CHANGE')} />
                <DropdownItem label="Reject All Changes" onClick={() => performAction('REJECT_ALL_CHANGES')} />
                <DropdownItem label="Reject Current Change" onClick={() => performAction('REJECT_CURRENT_CHANGE')} />
                <DropdownItem label="Next Change" onClick={() => performAction('NAVIGATE_NEXT_CHANGE')} />
                <DropdownItem label="Previous Change" onClick={() => performAction('NAVIGATE_PREVIOUS_CHANGE')} />
                <DropdownItem label="Highlight Changes" onClick={() => performAction('TOGGLE_HIGHLIGHT_CHANGES')} />
            </ToolbarDropdown>
            <ToolbarButton label="Add Comment" icon={<Icons.Comment />} onClick={() => performAction('ADD_COMMENT')} />
            <ToolbarButton label="Show Comments" icon={<Icons.Comment />} isActive={true} onClick={() => performAction('TOGGLE_COMMENTS_PANEL')} />
            <ToolbarButton label="Read Aloud" icon={<Icons.ReadAloud />} onClick={() => performAction('READ_ALOUD')} />
            <ToolbarButton label="Dictate" icon={<Icons.Dictate />} onClick={() => performAction('START_DICTATION')} />
            <ToolbarButton label="Accessibility Check" icon={<Icons.CheckAccessibility />} onClick={handleAccessibilityCheck} />
            <ToolbarButton label="Plagiarism Check" icon={<Icons.Plagiarism />} onClick={handlePlagiarismCheck} />
            <ToolbarDropdown label="Security">
                <DropdownItem label="Restrict Editing" onClick={() => performAction('RESTRICT_EDITING')} />
                <DropdownItem label="Encrypt Document" onClick={() => performAction('ENCRYPT_DOCUMENT')} />
                <DropdownItem label="Digital Signature" onClick={() => performAction('ADD_DIGITAL_SIGNATURE')} />
                <DropdownItem label="Information Rights Management (IRM)" onClick={() => performAction('APPLY_IRM')} />
                <DropdownItem label="Set Document Password" onClick={() => performAction('SET_DOCUMENT_PASSWORD')} />
            </ToolbarDropdown>
        </ToolbarSection>
    );
};

export const AISuperpowersSection: React.FC = () => {
    const { documentState, performAction } = useDocument();
    const { aiState, triggerAISuggestion, generateContent, triggerTranslation, analyzeSentiment } = useAI();

    const handleAISuggestion = useCallback((type: 'rephrase' | 'summarize' | 'expand' | 'grammar' | 'style' | 'tone') => {
        // In a real app, this would use selected text. For now, mock with current content.
        const textToProcess = documentState.selection ? "Selected text example" : documentState.content.substring(0, 100) + "...";
        triggerAISuggestion(textToProcess, type);
    }, [documentState.content, documentState.selection, triggerAISuggestion]);

    const handleContentGeneration = useCallback(async () => {
        const promptInput = prompt("Enter prompt for AI content generation:");
        if (promptInput) {
            performAction('SET_AI_GENERATION_STATUS', 'generating');
            const generated = await generateContent(promptInput, documentState.content);
            console.log("AI Generated Content:", generated); // In reality, insert into document
            performAction('INSERT_AI_GENERATED_CONTENT', generated);
            performAction('SET_AI_GENERATION_STATUS', 'idle');
        }
    }, [generateContent, performAction, documentState.content]);

    const handleTranslate = useCallback(async () => {
        const targetLang = prompt("Translate to (e.g., 'es', 'fr', 'de'):");
        if (targetLang) {
            triggerTranslation(documentState.selection ? "Selected text" : documentState.content.substring(0, 50) + "...", documentState.language, targetLang);
        }
    }, [triggerTranslation, documentState.content, documentState.language, documentState.selection]);

    const handleSentimentAnalysis = useCallback(() => {
        analyzeSentiment(documentState.content.substring(0, 500));
    }, [analyzeSentiment, documentState.content]);

    return (
        <ToolbarSection title="AI Superpowers">
            <ToolbarButton
                label="AI Assistant"
                icon={<Icons.AI />}
                isActive={documentState.aiAssistantActive}
                onClick={() => performAction('TOGGLE_AI_ASSISTANT_PANEL')}
            />
            <ToolbarDropdown label="Magic Write" icon={<Icons.AI />}>
                <DropdownItem label="Rephrase Selection" onClick={() => handleAISuggestion('rephrase')} />
                <DropdownItem label="Summarize Selection" onClick={() => handleAISuggestion('summarize')} />
                <DropdownItem label="Expand Selection" onClick={() => handleAISuggestion('expand')} />
                <DropdownItem label="Improve Grammar/Style" onClick={() => handleAISuggestion('grammar')} />
                <DropdownItem label="Change Tone" onClick={() => handleAISuggestion('tone')} />
                <DropdownItem label="Generate from Prompt..." onClick={handleContentGeneration} />
                <DropdownItem label="Suggest Related Content" onClick={() => performAction('AI_SUGGEST_RELATED_CONTENT')} />
                <DropdownItem label="Image Captioning" onClick={() => performAction('AI_IMAGE_CAPTIONING')} />
                <DropdownItem label="Data Extraction" icon={<Icons.DataExtraction />} onClick={() => performAction('AI_DATA_EXTRACTION')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Smart Tools">
                <DropdownItem label="Semantic Search" onClick={() => performAction('AI_SEMANTIC_SEARCH')} />
                <DropdownItem label="Auto-complete" onClick={() => performAction('TOGGLE_AI_AUTOCOMPLETE')} />
                <DropdownItem label="Personalized Suggestions" onClick={() => performAction('TOGGLE_AI_PERSONALIZED_SUGGESTIONS')} />
                <DropdownItem label="Contextual Help" onClick={() => performAction('AI_CONTEXTUAL_HELP')} />
                <DropdownItem label="Auto-Correction Settings" onClick={() => performAction('OPEN_AI_AUTOCORRECT_SETTINGS')} />
                <DropdownItem label="Smart Templates" onClick={() => performAction('OPEN_AI_SMART_TEMPLATES')} />
            </ToolbarDropdown>
            <ToolbarButton
                label="Live Translate"
                icon={<Icons.Translate />}
                isActive={aiState.translationInProgress}
                onClick={handleTranslate}
            />
            <ToolbarButton label="AI Proofreading" icon={<Icons.Proofing />} onClick={() => handleAISuggestion('grammar')} />
            <ToolbarButton label="AI Content Audit" onClick={() => performAction('RUN_AI_CONTENT_AUDIT')} />
            <ToolbarButton label="Sentiment Analysis" onClick={handleSentimentAnalysis} />
            <ToolbarButton label="Content Rating/Quality" onClick={() => performAction('AI_CONTENT_QUALITY_RATING')} />
            <ToolbarButton label="Summarize Document" onClick={() => handleAISuggestion('summarize')} />
            <ToolbarButton label="Key Phrase Extraction" onClick={() => performAction('AI_KEY_PHRASE_EXTRACTION')} />
        </ToolbarSection>
    );
};

export const CustomMacrosSection: React.FC = () => {
    const { documentState, performAction } = useDocument();

    return (
        <ToolbarSection title="Macros">
            <ToolbarButton label="Record Macro" icon={<Icons.Macro />} onClick={() => performAction('START_MACRO_RECORDING')} />
            <ToolbarDropdown label="Run Macro">
                {documentState.customMacros.length > 0 ? (
                    documentState.customMacros.map(macro => (
                        <DropdownItem key={macro.name} label={macro.name} onClick={() => performAction('RUN_MACRO', macro.name)} />
                    ))
                ) : (
                    <DropdownItem label="No Custom Macros" disabled />
                )}
                <DropdownItem label="Manage Macros..." onClick={() => performAction('OPEN_MACRO_MANAGER')} />
            </ToolbarDropdown>
            <ToolbarButton label="Add Script" onClick={() => performAction('ADD_MACRO_SCRIPT')} />
            <ToolbarButton label="Import Macros" onClick={() => performAction('IMPORT_MACROS')} />
        </ToolbarSection>
    );
};

export const AccessibilitySection: React.FC = () => {
    const { documentState, updateDocumentState, performAction } = useDocument();

    const toggleSetting = useCallback((key: keyof typeof documentState.accessibilitySettings) => {
        updateDocumentState({
            accessibilitySettings: {
                ...documentState.accessibilitySettings,
                [key]: !documentState.accessibilitySettings[key],
            },
        });
        performAction(`TOGGLE_ACCESSIBILITY_${key.toUpperCase()}`);
    }, [documentState.accessibilitySettings, updateDocumentState, performAction]);

    const handleTextToSpeechRateChange = useCallback((value: number) => {
        updateDocumentState({ accessibilitySettings: { ...documentState.accessibilitySettings, textToSpeechRate: value } });
    }, [documentState.accessibilitySettings, updateDocumentState]);

    const handleTextToSpeechVoiceChange = useCallback((voice: string) => {
        updateDocumentState({ accessibilitySettings: { ...documentState.accessibilitySettings, textToSpeechVoice: voice } });
    }, [documentState.accessibilitySettings, updateDocumentState]);

    const mockVoices = ['Default Female', 'Default Male', 'British Female', 'American Male', 'Spanish Female'];

    return (
        <ToolbarSection title="Accessibility">
            <ToolbarDropdown label="Accessibility" icon={<Icons.Accessibility />}>
                <DropdownItem
                    label="High Contrast Mode"
                    isActive={documentState.accessibilitySettings.highContrast}
                    onClick={() => toggleSetting('highContrast')}
                />
                <DropdownItem
                    label="Dyslexia-friendly Font"
                    isActive={documentState.accessibilitySettings.dyslexiaFont}
                    onClick={() => toggleSetting('dyslexiaFont')}
                />
                <DropdownItem
                    label="Screen Reader Support"
                    isActive={documentState.accessibilitySettings.screenReaderSupport}
                    onClick={() => toggleSetting('screenReaderSupport')}
                />
                <DropdownItem
                    label="Live Captions"
                    isActive={documentState.accessibilitySettings.liveCaptionsEnabled}
                    onClick={() => toggleSetting('liveCaptionsEnabled')}
                />
                <DropdownItem
                    label="Keyboard Navigation Guide"
                    isActive={documentState.accessibilitySettings.keyboardNavigationGuide}
                    onClick={() => toggleSetting('keyboardNavigationGuide')}
                />
                <DropdownItem label="Accessibility Checker" icon={<Icons.CheckAccessibility />} onClick={() => performAction('RUN_ACCESSIBILITY_CHECK')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Read Aloud Options" icon={<Icons.ReadAloud />}>
                <DropdownItem label="Start Reading" onClick={() => performAction('READ_ALOUD_START')} />
                <DropdownItem label="Pause Reading" onClick={() => performAction('READ_ALOUD_PAUSE')} />
                <DropdownItem label="Stop Reading" onClick={() => performAction('READ_ALOUD_STOP')} />
                <div className="p-2">
                    <ToolbarSlider label="Speed" min={50} max={300} step={10} value={documentState.accessibilitySettings.textToSpeechRate} onChange={handleTextToSpeechRateChange} unit="WPM" />
                </div>
                <ToolbarDropdown label="Voice">
                    {mockVoices.map(voice => (
                        <DropdownItem
                            key={voice}
                            label={voice}
                            isActive={documentState.accessibilitySettings.textToSpeechVoice === voice}
                            onClick={() => handleTextToSpeechVoiceChange(voice)}
                        />
                    ))}
                    <DropdownItem label="More Voices..." onClick={() => performAction('OPEN_TEXT_TO_SPEECH_VOICE_SETTINGS')} />
                </ToolbarDropdown>
            </ToolbarDropdown>
            <ToolbarDropdown label="Voice Control" icon={<Icons.Dictate />}>
                <DropdownItem
                    label="Enable Voice Control"
                    isActive={documentState.accessibilitySettings.voiceControlEnabled}
                    onClick={() => toggleSetting('voiceControlEnabled')}
                />
                <DropdownItem label="Voice Commands List" onClick={() => performAction('OPEN_VOICE_COMMANDS_LIST')} />
                <DropdownItem label="Voice Control Settings" onClick={() => performAction('OPEN_VOICE_CONTROL_SETTINGS')} />
            </ToolbarDropdown>
            <ToolbarButton label="Screen Magnifier" onClick={() => performAction('TOGGLE_SCREEN_MAGNIFIER')} />
            <ToolbarButton label="Color Filters" onClick={() => performAction('OPEN_COLOR_FILTERS')} />
        </ToolbarSection>
    );
};

export const AdminToolsSection: React.FC = () => {
    const { performAction } = useDocument();
    const { userState } = useUser();

    // Mock an admin check based on user roles
    const isAdmin = userState.roles.includes('admin');

    if (!isAdmin) {
        return null; // Don't render admin tools for non-admins
    }

    return (
        <ToolbarSection title="Admin Tools">
            <ToolbarDropdown label="User Management">
                <DropdownItem label="Manage Permissions" onClick={() => performAction('ADMIN_MANAGE_PERMISSIONS')} />
                <DropdownItem label="View Activity Logs" onClick={() => performAction('ADMIN_VIEW_ACTIVITY_LOGS')} />
                <DropdownItem label="Force Save Documents" onClick={() => performAction('ADMIN_FORCE_SAVE_DOCUMENTS')} />
                <DropdownItem label="Impersonate User" onClick={() => performAction('ADMIN_IMPERSONATE_USER')} />
                <DropdownItem label="Audit User Actions" onClick={() => performAction('ADMIN_AUDIT_USER_ACTIONS')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="Template Management" icon={<Icons.Templates />}>
                <DropdownItem label="Create New Global Template" onClick={() => performAction('ADMIN_CREATE_GLOBAL_TEMPLATE')} />
                <DropdownItem label="Edit Global Templates" onClick={() => performAction('ADMIN_EDIT_GLOBAL_TEMPLATES')} />
                <DropdownItem label="Publish Template" onClick={() => performAction('ADMIN_PUBLISH_TEMPLATE')} />
                <DropdownItem label="Template Versioning" onClick={() => performAction('ADMIN_TEMPLATE_VERSIONING')} />
            </ToolbarDropdown>
            <ToolbarDropdown label="App Customization">
                <DropdownItem label="Global Font Settings" onClick={() => performAction('ADMIN_GLOBAL_FONT_SETTINGS')} />
                <DropdownItem label="Custom UI Themes" onClick={() => performAction('ADMIN_CUSTOM_UI_THEMES')} />
                <DropdownItem label="Manage Plugins/Extensions" onClick={() => performAction('ADMIN_MANAGE_PLUGINS')} />
                <DropdownItem label="Configure Toolbar Layout" onClick={() => performAction('ADMIN_CONFIGURE_TOOLBAR_LAYOUT')} />
                <DropdownItem label="Custom Keyboard Shortcuts (Global)" onClick={() => performAction('ADMIN_CUSTOM_GLOBAL_SHORTCUTS')} />
            </ToolbarDropdown>
            <ToolbarButton label="Backup & Restore" icon={<Icons.CloudSync />} onClick={() => performAction('ADMIN_BACKUP_RESTORE')} />
            <ToolbarButton label="Compliance Settings" icon={<Icons.Security />} onClick={() => performAction('ADMIN_COMPLIANCE_SETTINGS')} />
            <ToolbarButton label="System Health Monitor" onClick={() => performAction('ADMIN_SYSTEM_HEALTH_MONITOR')} />
            <ToolbarButton label="Generate Usage Reports" onClick={() => performAction('ADMIN_GENERATE_USAGE_REPORTS')} />
            <ToolbarButton label="Manage Integrations" onClick={() => performAction('ADMIN_MANAGE_INTEGRATIONS')} />
        </ToolbarSection>
    );
};

// --- MAIN TOOLBAR COMPONENT (Orchestrator) ---

const Toolbar: React.FC = () => {
    // Mock state for the providers - this would typically come from a global state store (Redux, Zustand, etc.)
    const [mockDocumentState, setMockDocumentState] = useState<DocumentState>({
        content: "This is a sample document content. It will be used for AI suggestions and other features. The quick brown fox jumps over the lazy dog.",
        selection: null,
        fontFamily: 'Arial',
        fontSize: 12,
        textColor: '#000000',
        highlightColor: 'transparent',
        alignment: 'left',
        lineSpacing: 1.15,
        zoomLevel: 100,
        trackChangesEnabled: false,
        comments: [],
        versionHistory: [],
        darkMode: false,
        language: 'en-US',
        aiAssistantActive: false,
        userPermissions: { canEdit: true, canComment: true, canShare: true, canAdmin: false }, // Set canAdmin to true to see AdminToolsSection
        pageSetup: {
            orientation: 'portrait',
            pageSize: 'Letter',
            margins: { top: 1, bottom: 1, left: 1, right: 1 },
            columns: 1,
            lineNumbers: 'none',
            hyphenation: false,
            theme: 'default',
            backgroundColor: '#FFFFFF',
            watermark: null,
        },
        integrations: {
            googleDriveConnected: true,
            googleCalendarConnected: false,
            crmConnected: false,
            jiraConnected: false,
            slackConnected: false,
        },
        accessibilitySettings: {
            highContrast: false,
            dyslexiaFont: false,
            screenReaderSupport: false,
            liveCaptionsEnabled: false,
            keyboardNavigationGuide: false,
            voiceControlEnabled: false,
            textToSpeechRate: 180, // words per minute
            textToSpeechVoice: 'Default Female',
        },
        customMacros: [{ name: 'InsertCurrentDateTime', script: 'editor.insertText(new Date().toLocaleString())' }],
        proofingSettings: {
            spellCheckEnabled: true,
            grammarCheckEnabled: true,
            styleCheckEnabled: false,
            customDictionary: ['React', 'TypeScript', 'Tailwind'],
        },
        documentStatus: 'draft',
        security: {
            encryptionEnabled: false,
            digitalSignaturePresent: false,
            irmApplied: false,
            restrictedEditing: false,
        },
        outlineStructure: [],
        currentPage: 1,
        totalPageCount: 1,
        wordCount: 15,
        charCount: 96,
    });

    const [mockUserState, setMockUserState] = useState<UserState>({
        id: 'user123',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        avatar: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
        preferences: {
            defaultFont: 'Roboto',
            theme: 'system',
            keyboardShortcuts: {},
            defaultLanguage: 'en-US',
            timezone: 'America/New_York',
            notificationSettings: { email: true, inApp: true, desktop: false },
        },
        roles: ['editor'], // Change to ['editor', 'admin'] to see admin tools
        recentDocuments: [],
    });

    const [mockAIState, setMockAIState] = useState<AIState>({
        suggestions: [],
        sentimentScore: null,
        translationInProgress: false,
        translationResult: null,
        grammarErrors: [],
        summarizedContent: null,
        contentGenerationStatus: 'idle',
        plagiarismReport: null,
        accessibilityReport: [],
    });

    // Update handlers for the mock states
    const updateDocumentState = useCallback((newState: Partial<DocumentState>) => {
        console.log('Document State Update:', newState);
        setMockDocumentState(prev => ({ ...prev, ...newState }));
    }, []);

    const updateUserState = useCallback((newState: Partial<UserState>) => {
        console.log('User State Update:', newState);
        setMockUserState(prev => ({ ...prev, ...newState }));
    }, []);

    const performDocumentAction = useCallback(async (actionType: string, payload?: any) => {
        console.log(`Performing document action: ${actionType}`, payload);
        // This is a mock dispatcher. In a real app, it would interact with a document editor's API,
        // a global state manager, or other services.
        switch (actionType) {
            case 'SAVE_DOCUMENT':
                alert('Document saved to server!');
                break;
            case 'TOGGLE_DARK_MODE':
                updateDocumentState({ darkMode: !mockDocumentState.darkMode });
                break;
            case 'INSERT_AI_GENERATED_CONTENT':
                updateDocumentState({ content: mockDocumentState.content + "\n\n" + payload });
                break;
            case 'SET_AI_GENERATION_STATUS':
                setMockAIState(prev => ({ ...prev, contentGenerationStatus: payload }));
                break;
            case 'RUN_PROOFING_CHECK':
                setMockAIState(prev => ({ ...prev, grammarErrors: [{ text: 'jumps', suggestion: 'jumped' }] }));
                alert(`Proofing check completed. Found ${mockAIState.grammarErrors.length} errors.`);
                break;
            case 'SHOW_WORD_COUNT':
                alert(`Word Count: ${mockDocumentState.wordCount}, Character Count: ${mockDocumentState.charCount}`);
                break;
            case 'ADD_WATERMARK':
                const watermarkText = prompt('Enter watermark text (e.g., DRAFT):');
                if (watermarkText) updateDocumentState({ pageSetup: { ...mockDocumentState.pageSetup, watermark: watermarkText } });
                break;
            case 'EDIT_HEADERS_FOOTERS':
                alert('Header/Footer editor modal would open.');
                break;
            case 'OPEN_SHARE_DIALOG':
                alert('Share document dialog opened. User permissions: ' + JSON.stringify(mockDocumentState.userPermissions));
                break;
            // Add more specific mock responses for other actions as needed
            default:
                // For all other actions, just log for demonstration
                // alert(`Action "${actionType}" dispatched with payload: ${JSON.stringify(payload)}`);
                break;
        }
        return Promise.resolve({ success: true, action: actionType, payload });
    }, [mockDocumentState.darkMode, mockDocumentState.content, mockDocumentState.wordCount, mockDocumentState.charCount, mockDocumentState.pageSetup, mockDocumentState.userPermissions, mockAIState.grammarErrors.length, updateDocumentState]);

    const triggerAISuggestion = useCallback(async (text: string, type: 'rephrase' | 'summarize' | 'expand' | 'grammar' | 'style' | 'tone') => {
        setMockAIState(prev => ({ ...prev, suggestions: ['AI is thinking...'] }));
        console.log(`AI: Suggesting '${type}' for text: "${text}"`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        let suggestion = "";
        switch (type) {
            case 'rephrase': suggestion = `AI rephrased: "${text.substring(0, 20)}... (new eloquent wording)"`; break;
            case 'summarize': suggestion = `AI summarized: "${text.substring(0, 30)}... (key points extracted)"`; break;
            case 'expand': suggestion = `AI expanded: "${text} and much more detail, context, and examples..."`; break;
            case 'grammar': suggestion = `AI grammar fix: "${text}" -> "Corrected and polished version."`; setMockAIState(prev => ({ ...prev, grammarErrors: [{ text: 'original error', suggestion: 'corrected phrase', range: { start: 0, end: 0 } }] })); break;
            case 'style': suggestion = `AI style suggestion: "${text}" -> "More professional tone and flow."`; break;
            case 'tone': suggestion = `AI tone adjustment: "${text}" -> "Shifted to a more ${payload} tone."`; break;
            default: suggestion = `AI processed "${text}" for ${type}.`;
        }
        setMockAIState(prev => ({ ...prev, suggestions: [suggestion] }));
        console.log("AI Suggestion:", suggestion);
    }, []);

    const triggerTranslation = useCallback(async (text: string, sourceLang: string, targetLang: string) => {
        setMockAIState(prev => ({ ...prev, translationInProgress: true, translationResult: null }));
        console.log(`AI: Translating "${text}" from ${sourceLang} to ${targetLang}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setMockAIState(prev => ({ ...prev, translationInProgress: false, translationResult: `Translated "${text}" to ${targetLang} (mock result).` }));
        console.log("AI Translation finished.");
    }, []);

    const analyzeSentiment = useCallback(async (text: string) => {
        setMockAIState(prev => ({ ...prev, sentimentScore: null }));
        console.log(`AI: Analyzing sentiment for "${text.substring(0, 50)}..."`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const score = Math.random() * 2 - 1; // -1 to 1
        setMockAIState(prev => ({ ...prev, sentimentScore: parseFloat(score.toFixed(2)) }));
        alert(`Sentiment Analysis Score: ${score.toFixed(2)} (1 is positive, -1 is negative)`);
        console.log("Sentiment Analysis:", score.toFixed(2));
    }, []);

    const generateContent = useCallback(async (prompt: string, context?: string) => {
        setMockAIState(prev => ({ ...prev, contentGenerationStatus: 'generating' }));
        console.log(`AI: Generating content for prompt: "${prompt}" with context: "${context?.substring(0, 50)}..."`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        const generatedText = `Generated content based on "${prompt}" (and context): This is a highly sophisticated, multi-paragraph AI-generated response. It demonstrates contextual understanding, adheres to stylistic requirements, integrates information from the provided document context, and aims for factual accuracy. It could be an entire report section, a detailed blog post, a creative story segment, or a comprehensive answer to a complex query. The AI engine leveraged vast datasets and deep learning models to produce this output, which is intended to be indistinguishable from human-written text, featuring logical flow, coherent arguments, and appropriate vocabulary.`;
        setMockAIState(prev => ({ ...prev, contentGenerationStatus: 'idle' }));
        return generatedText;
    }, []);

    const runPlagiarismCheck = useCallback(async (text: string) => {
        console.log(`AI: Running plagiarism check on "${text.substring(0, 50)}..."`);
        await new Promise(resolve => setTimeout(resolve, 2500));
        const score = Math.floor(Math.random() * 30);
        setMockAIState(prev => ({ ...prev, plagiarismReport: { score, sources: [`https://example.com/source1.html (${score / 2}%)`, 'https://another.org/reference2.pdf (low match)'] } }));
        alert(`Plagiarism Check Complete: ${score}% similarity found.`);
    }, []);

    const runAccessibilityCheck = useCallback(async (documentContent: string) => {
        console.log(`AI: Running accessibility check on document content...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockReport = [
            { rule: "Missing Alt Text", description: "Image X lacks descriptive alt text.", fix: "Add alt text via image editor.", severity: "high" },
            { rule: "Insufficient Color Contrast", description: "Text 'Hello World' has poor contrast (ratio 2.5:1).", fix: "Change text or background color.", severity: "medium" },
            { rule: "Untagged Headings", description: "Detected potential headings not marked semantically.", fix: "Apply H1-H6 styles.", severity: "low" },
        ];
        setMockAIState(prev => ({ ...prev, accessibilityReport: mockReport }));
        alert(`Accessibility Check Complete: Found ${mockReport.length} issues.`);
    }, []);

    // Memoized context values for performance
    const documentContextValue = React.useMemo(() => ({
        documentState: mockDocumentState,
        updateDocumentState,
        performAction: performDocumentAction,
    }), [mockDocumentState, updateDocumentState, performDocumentAction]);

    const userContextValue = React.useMemo(() => ({
        userState: mockUserState,
        updateUserState,
    }), [mockUserState, updateUserState]);

    const aiContextValue = React.useMemo(() => ({
        aiState: mockAIState,
        triggerAISuggestion,
        triggerTranslation,
        analyzeSentiment,
        generateContent,
        runPlagiarismCheck,
        runAccessibilityCheck,
    }), [mockAIState, triggerAISuggestion, triggerTranslation, analyzeSentiment, generateContent, runPlagiarismCheck, runAccessibilityCheck]);

    // Apply dark mode class to body or html element for demonstration
    useEffect(() => {
        if (mockDocumentState.darkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        }
    }, [mockDocumentState.darkMode]);


    return (
        <DocumentContext.Provider value={documentContextValue}>
            <UserContext.Provider value={userContextValue}>
                <AIContext.Provider value={aiContextValue}>
                    {/* The main toolbar container */}
                    <div className="w-full bg-gray-700 p-2 mt-4 rounded-lg shadow-xl flex flex-wrap gap-2 justify-center items-start text-white font-sans text-sm border border-gray-600 overflow-x-auto">
                        <FileSection />
                        <EditSection />
                        <ViewSection />
                        <FormatSection />
                        <InsertSection />
                        <LayoutSection />
                        <ReferencesSection />
                        <ReviewSection />
                        <AISuperpowersSection />
                        <CustomMacrosSection />
                        <AccessibilitySection />
                        <AdminToolsSection /> {/* This section only renders if user is admin */}
                        {/* Future sections could include:
                            - Developer Tools (API access, custom scripting, webhook management)
                            - Analytics & Insights (Document performance, reading time, engagement)
                            - Collaboration Hub (Project management, team spaces)
                            - Data Visualization Studio (Advanced chart/graph customization)
                            - Presentation Mode (Export to slides, live presentation tools)
                            - AR/VR Integration (Viewing documents in immersive environments)
                        */}
                    </div>
                </AIContext.Provider>
            </UserContext.Provider>
        </DocumentContext.Provider>
    );
};

export default Toolbar;