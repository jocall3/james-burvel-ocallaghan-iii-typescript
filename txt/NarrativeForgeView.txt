import React, { useState, useReducer, useEffect, useCallback, createContext, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// --- Project Configuration and Constants ---
export const APP_NAME = "Narrative Forge Pro";
export const APP_VERSION = "2.0.0-beta";
export const LOCAL_STORAGE_KEY_PREFIX = "narrativeForgePro_";
export const DEBOUNCE_SAVE_MS = 1000;
export const MAX_AI_SUGGESTIONS = 5; // Max suggestions for simple prompts
export const AI_MAX_TOKENS_DEFAULT = 2048;
export const AI_TEMPERATURE_DEFAULT = 0.8;
export const AI_TOP_P_DEFAULT = 0.95;
export const AI_TOP_K_DEFAULT = 40;

// --- Utility Functions ---
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
export const formatDate = (date: Date): string => date.toLocaleString();
export const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

// --- Notifications System ---
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    timeoutId?: NodeJS.Timeout;
}

export type NotificationAction =
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'REMOVE_NOTIFICATION'; payload: string };

export const notificationReducer = (state: Notification[], action: NotificationAction): Notification[] => {
    switch (action.type) {
        case 'ADD_NOTIFICATION':
            return [...state, action.payload];
        case 'REMOVE_NOTIFICATION':
            return state.filter(n => n.id !== action.payload);
        default:
            return state;
    }
};

export const NotificationContext = createContext<{
    notifications: Notification[];
    dispatch: React.Dispatch<NotificationAction>;
    addNotification: (message: string, type: NotificationType, duration?: number) => void;
}>({
    notifications: [],
    dispatch: () => { },
    addNotification: () => { },
});

export const NotificationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [notifications, dispatch] = useReducer(notificationReducer, []);

    const addNotification = useCallback((message: string, type: NotificationType, duration: number = 5000) => {
        const id = generateUniqueId();
        const newNotification: Notification = { id, message, type };
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

        const timeoutId = setTimeout(() => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        }, duration);

        newNotification.timeoutId = timeoutId; // Store timeout ID for potential cleanup if component unmounts earlier
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, dispatch, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

export const NotificationContainer: React.FC = () => {
    const { notifications, dispatch } = useNotifications();

    const getNotificationColor = (type: NotificationType) => {
        switch (type) {
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            case 'info': return 'bg-blue-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-gray-700';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {notifications.map(n => (
                <div key={n.id}
                    className={`${getNotificationColor(n.type)} text-white p-3 rounded-lg shadow-md flex justify-between items-center transition-opacity duration-300 ease-out animate-fade-in`}>
                    <span>{n.message}</span>
                    <button onClick={() => {
                        dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id });
                        if (n.timeoutId) clearTimeout(n.timeoutId);
                    }}
                        className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

// --- Data Models and Interfaces ---

// Core AI Configuration
export interface AIConfig {
    model: string;
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
    responseMimeType: string;
    responseSchema?: any; // JSON schema for structured output
}

export const defaultAIConfig: AIConfig = {
    model: 'gemini-1.5-flash-latest', // Updated to a more recent model
    temperature: AI_TEMPERATURE_DEFAULT,
    topP: AI_TOP_P_DEFAULT,
    topK: AI_TOP_K_DEFAULT,
    maxOutputTokens: AI_MAX_TOKENS_DEFAULT,
    responseMimeType: "text/plain",
};

// Character Model
export type PersonalityTrait = 'sarcastic' | 'optimistic' | 'cynical' | 'brave' | 'cowardly' | 'loyal' | 'treacherous' | 'wise' | 'naive' | 'driven' | 'lazy' | 'charismatic' | 'reserved' | 'impulsive' | 'calm';

export interface Character {
    id: string;
    name: string;
    description: string; // Physical appearance, brief summary
    backstory: string; // Detailed history, upbringing
    motivations: string; // What drives them
    goals: string; // Short-term and long-term objectives
    personalityTraits: PersonalityTrait[];
    dialogueStyle: string; // How they speak (e.g., formal, slang, poetic, direct)
    relationships: { characterId: string; type: string; description: string }[]; // e.g., { characterId: 'char1', type: 'rival', description: 'Old school nemesis' }
    arcs: { arcId: string; type: 'internal' | 'external'; description: string }[]; // Character development arcs
    aiNotes: string; // AI generated insights or summaries
    createdAt: string;
    updatedAt: string;
}

export const emptyCharacter: Character = {
    id: '', name: '', description: '', backstory: '', motivations: '', goals: '',
    personalityTraits: [], dialogueStyle: '', relationships: [], arcs: [], aiNotes: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

// Location Model
export type LocationType = 'indoor' | 'outdoor' | 'city' | 'rural' | 'fantasy' | 'sci-fi' | 'historical' | 'specificBuilding' | 'naturalLandmark';

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    description: string; // Visuals, atmosphere, key features
    history: string; // Any significant past events tied to the location
    significance: string; // Why is this location important to the story?
    keyElements: string[]; // Specific objects, unique characteristics
    mood: string; // General feeling (e.g., eerie, bustling, peaceful)
    aiNotes: string; // AI generated insights or descriptions
    createdAt: string;
    updatedAt: string;
}

export const emptyLocation: Location = {
    id: '', name: '', type: 'outdoor', description: '', history: '', significance: '',
    keyElements: [], mood: '', aiNotes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

// Scene Model
export type SceneMood = 'tense' | 'humorous' | 'dramatic' | 'romantic' | 'suspenseful' | 'calm' | 'action-packed';
export type ScenePacing = 'slow' | 'medium' | 'fast';

export interface Scene {
    id: string;
    title: string;
    synopsis: string; // A brief summary of what happens in the scene
    content: string; // The actual script content for this scene
    locationId: string; // ID of the primary location
    characterIds: string[]; // IDs of characters present
    mood: SceneMood;
    pacing: ScenePacing;
    plotPointsCovered: string[]; // IDs of plot points advanced in this scene
    aiFeedback: string; // AI analysis or suggestions for the scene
    createdAt: string;
    updatedAt: string;
}

export const emptyScene: Scene = {
    id: '', title: '', synopsis: '', content: '', locationId: '', characterIds: [],
    mood: 'calm', pacing: 'medium', plotPointsCovered: [], aiFeedback: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

// Plot Point Model
export type PlotPointType = 'incitingIncident' | 'risingAction' | 'climax' | 'fallingAction' | 'resolution' | 'midpoint' | 'plotTwist' | 'reversal';

export interface PlotPoint {
    id: string;
    title: string;
    type: PlotPointType;
    description: string; // What happens in this plot point
    impactOnCharacters: string[]; // How it affects specific characters (character IDs)
    associatedScenes: string[]; // Scene IDs where this plot point is relevant
    requiredElements: string[]; // Specific items or information needed for this point
    aiSuggestions: string; // AI ideas for this plot point
    createdAt: string;
    updatedAt: string;
}

export const emptyPlotPoint: PlotPoint = {
    id: '', title: '', type: 'incitingIncident', description: '', impactOnCharacters: [],
    associatedScenes: [], requiredElements: [], aiSuggestions: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

// Story Arc Model
export type StoryArcType = 'main' | 'sub_plot' | 'character_arc' | 'thematic';

export interface StoryArc {
    id: string;
    title: string;
    type: StoryArcType;
    description: string;
    startPoint: string; // ID of a plot point or scene
    endPoint: string; // ID of a plot point or scene
    keyPlotPoints: string[]; // IDs of plot points that define this arc
    charactersInvolved: string[]; // IDs of characters central to this arc
    aiAnalysis: string; // AI-generated analysis of the arc's strength/completeness
    createdAt: string;
    updatedAt: string;
}

export const emptyStoryArc: StoryArc = {
    id: '', title: '', type: 'main', description: '', startPoint: '', endPoint: '',
    keyPlotPoints: [], charactersInvolved: [], aiAnalysis: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

// AI Chat/Interaction History
export type AIChatRole = 'user' | 'model';

export interface AIChatMessage {
    id: string;
    role: AIChatRole;
    content: string;
    timestamp: string;
    relatedEntityId?: string; // e.g., characterId, sceneId if the chat is about a specific entity
    relatedEntityType?: 'character' | 'scene' | 'location' | 'plot_point';
}

// Project Settings
export interface ProjectSettings {
    projectId: string; // Should match Project.id
    lastOpenedPanel: AppPanel;
    autosaveEnabled: boolean;
    autoAIPropositions: boolean; // Automatically suggest dialogue, plot points etc.
    preferredAIConfig: AIConfig;
    documentFont: string;
    documentFontSize: number;
    theme: 'dark' | 'light';
    showLineNumbers: boolean;
    exportFormat: 'fountain' | 'pdf' | 'html' | 'json';
    createdAt: string;
    updatedAt: string;
}

export const defaultProjectSettings: ProjectSettings = {
    projectId: '',
    lastOpenedPanel: 'scriptEditor',
    autosaveEnabled: true,
    autoAIPropositions: false,
    preferredAIConfig: defaultAIConfig,
    documentFont: 'Inter',
    documentFontSize: 16,
    theme: 'dark',
    showLineNumbers: true,
    exportFormat: 'fountain',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// Overall Project State
export interface Project {
    id: string;
    name: string;
    logline: string; // One-sentence summary
    synopsis: string; // Longer summary
    genre: string[];
    targetAudience: string;
    characters: Character[];
    locations: Location[];
    scenes: Scene[];
    plotPoints: PlotPoint[];
    storyArcs: StoryArc[];
    aiChatHistory: AIChatMessage[];
    settings: ProjectSettings;
    createdAt: string;
    updatedAt: string;
}

export const emptyProject: Project = {
    id: generateUniqueId(),
    name: 'New Project',
    logline: '',
    synopsis: '',
    genre: [],
    targetAudience: '',
    characters: [],
    locations: [],
    scenes: [{
        ...emptyScene,
        id: generateUniqueId(),
        title: 'Initial Scene',
        content: `[SCENE START]

INT. COFFEE SHOP - NIGHT

A coffee shop, moments before closing. Rain streaks down the windows.
ALEX (30s), tired and cynical, wipes down a counter.
MAYA (30s), energetic and optimistic, enters, shaking off an umbrella.

MAYA
You're still here.

ALEX
The world needs its caffeine, even at the bitter end.

MAYA
(Smiling)
The world needs its dreamers more. That's why I'm here. I have an idea.

ALEX
(Scoffs)
Another one? Does this one also involve teaching squirrels to code?
`
    }],
    plotPoints: [],
    storyArcs: [],
    aiChatHistory: [],
    settings: { ...defaultProjectSettings, projectId: '' }, // projectId will be set later
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// --- Application State and Reducer ---
export type AppPanel =
    | 'dashboard'
    | 'scriptEditor'
    | 'characters'
    | 'locations'
    | 'plotBoard'
    | 'worldBuilder'
    | 'aiChat'
    | 'aiConfig'
    | 'projectSettings'
    | 'exportImport';

export interface AppState {
    projects: Project[];
    activeProjectId: string | null;
    activePanel: AppPanel;
    currentAISuggestions: string[];
    isAILoading: boolean;
    aiError: string | null;
    currentAIRequestPrompt: string; // The last prompt sent to AI for quick access
    selectedCharacterId: string | null;
    selectedLocationId: string | null;
    selectedSceneId: string | null;
    selectedPlotPointId: string | null;
    selectedStoryArcId: string | null;
    showModal: {
        type: 'newProject' | 'editCharacter' | 'editLocation' | 'editScene' | 'editPlotPoint' | 'editStoryArc' | 'confirmDelete' | null;
        isOpen: boolean;
        data?: any; // Data to pass to the modal (e.g., entity ID, confirmation message)
    };
}

export const initialAppState: AppState = {
    projects: [],
    activeProjectId: null,
    activePanel: 'dashboard',
    currentAISuggestions: [],
    isAILoading: false,
    aiError: null,
    currentAIRequestPrompt: '',
    selectedCharacterId: null,
    selectedLocationId: null,
    selectedSceneId: null,
    selectedPlotPointId: null,
    selectedStoryArcId: null,
    showModal: { type: null, isOpen: false, data: null },
};

export type AppAction =
    | { type: 'SET_PROJECTS'; payload: Project[] }
    | { type: 'ADD_PROJECT'; payload: Project }
    | { type: 'UPDATE_PROJECT'; payload: Project }
    | { type: 'DELETE_PROJECT'; payload: string }
    | { type: 'SET_ACTIVE_PROJECT'; payload: string | null }
    | { type: 'SET_ACTIVE_PANEL'; payload: AppPanel }
    | { type: 'SET_AI_LOADING'; payload: boolean }
    | { type: 'SET_AI_SUGGESTIONS'; payload: string[] }
    | { type: 'SET_AI_ERROR'; payload: string | null }
    | { type: 'SET_CURRENT_AI_REQUEST_PROMPT'; payload: string }
    | { type: 'ADD_CHARACTER'; payload: { projectId: string; character: Character } }
    | { type: 'UPDATE_CHARACTER'; payload: { projectId: string; character: Character } }
    | { type: 'DELETE_CHARACTER'; payload: { projectId: string; characterId: string } }
    | { type: 'SET_SELECTED_CHARACTER'; payload: string | null }
    | { type: 'ADD_LOCATION'; payload: { projectId: string; location: Location } }
    | { type: 'UPDATE_LOCATION'; payload: { projectId: string; location: Location } }
    | { type: 'DELETE_LOCATION'; payload: { projectId: string; locationId: string } }
    | { type: 'SET_SELECTED_LOCATION'; payload: string | null }
    | { type: 'ADD_SCENE'; payload: { projectId: string; scene: Scene } }
    | { type: 'UPDATE_SCENE'; payload: { projectId: string; scene: Scene } }
    | { type: 'DELETE_SCENE'; payload: { projectId: string; sceneId: string } }
    | { type: 'SET_SELECTED_SCENE'; payload: string | null }
    | { type: 'ADD_PLOT_POINT'; payload: { projectId: string; plotPoint: PlotPoint } }
    | { type: 'UPDATE_PLOT_POINT'; payload: { projectId: string; plotPoint: PlotPoint } }
    | { type: 'DELETE_PLOT_POINT'; payload: { projectId: string; plotPointId: string } }
    | { type: 'SET_SELECTED_PLOT_POINT'; payload: string | null }
    | { type: 'ADD_STORY_ARC'; payload: { projectId: string; storyArc: StoryArc } }
    | { type: 'UPDATE_STORY_ARC'; payload: { projectId: string; storyArc: StoryArc } }
    | { type: 'DELETE_STORY_ARC'; payload: { projectId: string; storyArcId: string } }
    | { type: 'SET_SELECTED_STORY_ARC'; payload: string | null }
    | { type: 'ADD_AI_CHAT_MESSAGE'; payload: { projectId: string; message: AIChatMessage } }
    | { type: 'UPDATE_PROJECT_SETTINGS'; payload: { projectId: string; settings: Partial<ProjectSettings> } }
    | { type: 'OPEN_MODAL'; payload: { type: AppState['showModal']['type']; data?: any } }
    | { type: 'CLOSE_MODAL' };

export const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_PROJECTS':
            return { ...state, projects: action.payload };
        case 'ADD_PROJECT':
            return { ...state, projects: [...state.projects, action.payload] };
        case 'UPDATE_PROJECT':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : p
                ),
            };
        case 'DELETE_PROJECT':
            return {
                ...state,
                projects: state.projects.filter(p => p.id !== action.payload),
                activeProjectId: state.activeProjectId === action.payload ? null : state.activeProjectId,
            };
        case 'SET_ACTIVE_PROJECT':
            return { ...state, activeProjectId: action.payload };
        case 'SET_ACTIVE_PANEL':
            return { ...state, activePanel: action.payload };
        case 'SET_AI_LOADING':
            return { ...state, isAILoading: action.payload };
        case 'SET_AI_SUGGESTIONS':
            return { ...state, currentAISuggestions: action.payload };
        case 'SET_AI_ERROR':
            return { ...state, aiError: action.payload };
        case 'SET_CURRENT_AI_REQUEST_PROMPT':
            return { ...state, currentAIRequestPrompt: action.payload };

        case 'ADD_CHARACTER':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, characters: [...p.characters, { ...action.payload.character, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }
                        : p
                ),
            };
        case 'UPDATE_CHARACTER':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            characters: p.characters.map(c =>
                                c.id === action.payload.character.id ? { ...action.payload.character, updatedAt: new Date().toISOString() } : c
                            ),
                        }
                        : p
                ),
            };
        case 'DELETE_CHARACTER':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, characters: p.characters.filter(c => c.id !== action.payload.characterId) }
                        : p
                ),
                selectedCharacterId: state.selectedCharacterId === action.payload.characterId ? null : state.selectedCharacterId,
            };
        case 'SET_SELECTED_CHARACTER':
            return { ...state, selectedCharacterId: action.payload };

        case 'ADD_LOCATION':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, locations: [...p.locations, { ...action.payload.location, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }
                        : p
                ),
            };
        case 'UPDATE_LOCATION':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            locations: p.locations.map(l =>
                                l.id === action.payload.location.id ? { ...action.payload.location, updatedAt: new Date().toISOString() } : l
                            ),
                        }
                        : p
                ),
            };
        case 'DELETE_LOCATION':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, locations: p.locations.filter(l => l.id !== action.payload.locationId) }
                        : p
                ),
                selectedLocationId: state.selectedLocationId === action.payload.locationId ? null : state.selectedLocationId,
            };
        case 'SET_SELECTED_LOCATION':
            return { ...state, selectedLocationId: action.payload };

        case 'ADD_SCENE':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, scenes: [...p.scenes, { ...action.payload.scene, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }
                        : p
                ),
            };
        case 'UPDATE_SCENE':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            scenes: p.scenes.map(s =>
                                s.id === action.payload.scene.id ? { ...action.payload.scene, updatedAt: new Date().toISOString() } : s
                            ),
                        }
                        : p
                ),
            };
        case 'DELETE_SCENE':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, scenes: p.scenes.filter(s => s.id !== action.payload.sceneId) }
                        : p
                ),
                selectedSceneId: state.selectedSceneId === action.payload.sceneId ? null : state.selectedSceneId,
            };
        case 'SET_SELECTED_SCENE':
            return { ...state, selectedSceneId: action.payload };

        case 'ADD_PLOT_POINT':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, plotPoints: [...p.plotPoints, { ...action.payload.plotPoint, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }
                        : p
                ),
            };
        case 'UPDATE_PLOT_POINT':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            plotPoints: p.plotPoints.map(pp =>
                                pp.id === action.payload.plotPoint.id ? { ...action.payload.plotPoint, updatedAt: new Date().toISOString() } : pp
                            ),
                        }
                        : p
                ),
            };
        case 'DELETE_PLOT_POINT':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, plotPoints: p.plotPoints.filter(pp => pp.id !== action.payload.plotPointId) }
                        : p
                ),
                selectedPlotPointId: state.selectedPlotPointId === action.payload.plotPointId ? null : state.selectedPlotPointId,
            };
        case 'SET_SELECTED_PLOT_POINT':
            return { ...state, selectedPlotPointId: action.payload };

        case 'ADD_STORY_ARC':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, storyArcs: [...p.storyArcs, { ...action.payload.storyArc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }
                        : p
                ),
            };
        case 'UPDATE_STORY_ARC':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            storyArcs: p.storyArcs.map(sa =>
                                sa.id === action.payload.storyArc.id ? { ...action.payload.storyArc, updatedAt: new Date().toISOString() } : sa
                            ),
                        }
                        : p
                ),
            };
        case 'DELETE_STORY_ARC':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, storyArcs: p.storyArcs.filter(sa => sa.id !== action.payload.storyArcId) }
                        : p
                ),
                selectedStoryArcId: state.selectedStoryArcId === action.payload.storyArcId ? null : state.selectedStoryArcId,
            };
        case 'SET_SELECTED_STORY_ARC':
            return { ...state, selectedStoryArcId: action.payload };

        case 'ADD_AI_CHAT_MESSAGE':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, aiChatHistory: [...p.aiChatHistory, action.payload.message] }
                        : p
                ),
            };
        case 'UPDATE_PROJECT_SETTINGS':
            return {
                ...state,
                projects: state.projects.map(p =>
                    p.id === action.payload.projectId
                        ? { ...p, settings: { ...p.settings, ...action.payload.settings, updatedAt: new Date().toISOString() } }
                        : p
                ),
            };
        case 'OPEN_MODAL':
            return { ...state, showModal: { type: action.payload.type, isOpen: true, data: action.payload.data } };
        case 'CLOSE_MODAL':
            return { ...state, showModal: { type: null, isOpen: false, data: null } };
        default:
            return state;
    }
};

// --- Local Storage Persistence ---
export const saveAppStateToLocalStorage = (state: AppState) => {
    try {
        const serializedState = JSON.stringify(state.projects); // Only save projects
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}projects`, serializedState);
    } catch (error) {
        console.error("Error saving state to local storage:", error);
    }
};

export const loadAppStateFromLocalStorage = (): AppState['projects'] => {
    try {
        const serializedState = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}projects`);
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState) as Project[];
    } catch (error) {
        console.error("Error loading state from local storage:", error);
        return [];
    }
};

// --- AI Service Wrapper ---
export class GoogleGenAIService {
    private ai: GoogleGenAI;
    private apiKey: string;

    constructor(apiKey: string) {
        if (!apiKey) {
            console.warn("Google Gen AI API Key is missing. AI features will be disabled or limited.");
            this.apiKey = 'dummy_key'; // Use a dummy key to prevent crashes if not provided
        } else {
            this.apiKey = apiKey;
        }
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    }

    private getModelConfig(config: AIConfig) {
        return {
            model: config.model,
            contents: '', // Will be set in specific methods
            config: {
                temperature: config.temperature,
                topP: config.topP,
                topK: config.topK,
                maxOutputTokens: config.maxOutputTokens,
                responseMimeType: config.responseMimeType,
                responseSchema: config.responseSchema
            }
        };
    }

    public async generateContent(prompt: string, config: AIConfig): Promise<any> {
        if (this.apiKey === 'dummy_key') {
            throw new Error("AI functionality is disabled: API Key not configured.");
        }
        const modelConfig = this.getModelConfig(config);
        modelConfig.contents = prompt;
        const response = await this.ai.models.generateContent(modelConfig);
        return response.text;
    }

    public async generateDialogueSuggestions(scriptContext: string, requestPrompt: string, config: AIConfig): Promise<string[]> {
        const schema = { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } };
        const dialogueConfig = { ...config, responseMimeType: "application/json", responseSchema: schema };

        const fullPrompt = `You are an expert screenwriter. Based on the following scene context, generate ${MAX_AI_SUGGESTIONS} alternative lines of dialogue that match the user's request. Focus on tone, character voice, and plot advancement. Provide only the dialogue lines.

            **Scene Context:**
            ${scriptContext}
            
            **User Request:**
            ${requestPrompt}

            Output must be a JSON object with a single key 'suggestions' which is an array of strings.`;

        const responseText = await this.generateContent(fullPrompt, dialogueConfig);
        try {
            const result = JSON.parse(responseText);
            return result.suggestions || [];
        } catch (e) {
            console.error("Failed to parse AI dialogue suggestions:", responseText, e);
            throw new Error("Failed to parse AI dialogue suggestions.");
        }
    }

    public async generateCharacterConcept(characterDescription: string, config: AIConfig): Promise<Character> {
        const schema = {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                backstory: { type: Type.STRING },
                motivations: { type: Type.STRING },
                goals: { type: Type.STRING },
                personalityTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
                dialogueStyle: { type: Type.STRING },
                aiNotes: { type: Type.STRING }
            },
            required: ['name', 'description', 'backstory', 'motivations', 'goals', 'personalityTraits', 'dialogueStyle', 'aiNotes']
        };
        const characterConfig = { ...config, responseMimeType: "application/json", responseSchema: schema };

        const fullPrompt = `You are an expert character designer for a narrative. Based on the following high-level concept, generate a detailed character profile in JSON format.
            Concept: ${characterDescription}

            Ensure personalityTraits is an array of strings, and aiNotes contains additional insights.
            Output must be a JSON object following the provided schema.`;

        const responseText = await this.generateContent(fullPrompt, characterConfig);
        try {
            const result = JSON.parse(responseText);
            return {
                ...emptyCharacter,
                id: generateUniqueId(),
                ...result,
                personalityTraits: result.personalityTraits.filter((t: string): t is PersonalityTrait => true) || [], // Basic type guard
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (e) {
            console.error("Failed to parse AI character concept:", responseText, e);
            throw new Error("Failed to parse AI character concept.");
        }
    }

    public async analyzeScriptSection(scriptSection: string, analysisType: 'pacing' | 'character_arc' | 'plot_holes' | 'tone_consistency', config: AIConfig): Promise<string> {
        const fullPrompt = `As a professional script editor, analyze the following script section for ${analysisType}. Provide constructive feedback and suggestions for improvement.

            **Script Section:**
            ${scriptSection}

            **Analysis Focus:** ${analysisType}`;

        return this.generateContent(fullPrompt, config);
    }

    public async generatePlotPointIdeas(projectContext: Partial<Project>, config: AIConfig): Promise<string[]> {
        const schema = { type: Type.OBJECT, properties: { ideas: { type: Type.ARRAY, items: { type: Type.STRING } } } };
        const plotConfig = { ...config, responseMimeType: "application/json", responseSchema: schema };

        const projectSummary = `Project Name: ${projectContext.name || 'Untitled'}
            Logline: ${projectContext.logline || 'Not set'}
            Synopsis: ${projectContext.synopsis || 'Not set'}
            Characters: ${projectContext.characters?.map(c => c.name).join(', ') || 'None'}
            Existing Plot Points: ${projectContext.plotPoints?.map(pp => pp.title).join(', ') || 'None'}`;

        const fullPrompt = `You are an expert storyteller. Based on the following project context, suggest ${MAX_AI_SUGGESTIONS} compelling plot point ideas that could advance the narrative or introduce new conflicts.

            **Project Context:**
            ${projectSummary}

            Output must be a JSON object with a single key 'ideas' which is an array of strings.`;

        const responseText = await this.generateContent(fullPrompt, plotConfig);
        try {
            const result = JSON.parse(responseText);
            return result.ideas || [];
        } catch (e) {
            console.error("Failed to parse AI plot point ideas:", responseText, e);
            throw new Error("Failed to parse AI plot point ideas.");
        }
    }

    public async chatWithAI(messages: AIChatMessage[], currentProject: Project, config: AIConfig): Promise<string> {
        const projectContext = `Project Name: ${currentProject.name}
        Logline: ${currentProject.logline}
        Synopsis: ${currentProject.synopsis}
        Characters: ${currentProject.characters.map(c => c.name + " (" + c.description + ")").join('; ')}
        Locations: ${currentProject.locations.map(l => l.name + " (" + l.description + ")").join('; ')}
        Current Script Excerpt (if available, e.g. last scene): ${currentProject.scenes[currentProject.scenes.length - 1]?.content || 'N/A'}`;

        const chatHistory = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');

        const fullPrompt = `You are a helpful and creative AI writing assistant, specialized in narrative development. You have access to the following project information:

            **Project Context:**
            ${projectContext}

            **Chat History:**
            ${chatHistory}

            Please respond to the user's last message, taking into account the project context and chat history. Keep your responses concise and directly address the user's query.`;

        // The AI model itself handles multi-turn conversations better when given an array of Content objects.
        // For simplicity with this current wrapper, we're flattening it into a single prompt.
        // A more robust implementation would use `model.startChat()`
        // and structure the `contents` array for `generateContent`.

        // For now, let's adapt the modelConfig for multi-turn style interaction.
        const model = this.ai.getGenerativeModel({ model: config.model });
        const historyForAPI = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        const chat = model.startChat({
            history: historyForAPI.slice(0, -1) // Exclude the last user message, as it's the current prompt
        });

        const latestUserMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(latestUserMessage);
        const response = await result.response;
        return response.text();
    }
}

export const aiService = new GoogleGenAIService(process.env.NEXT_PUBLIC_API_KEY as string); // Use NEXT_PUBLIC for client-side env vars

// --- Reusable UI Components ---

export const Modal: React.FC<React.PropsWithChildren<{ isOpen: boolean; title: string; onClose: () => void }>> = ({ isOpen, title, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; className?: string }> = ({ label, value, onChange, placeholder, type = 'text', className }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full bg-gray-700/50 p-2 rounded text-white border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition-colors ${className}`}
        />
    </div>
);

export const TextareaField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; className?: string }> = ({ label, value, onChange, placeholder, rows = 3, className }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full bg-gray-700/50 p-2 rounded text-white border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition-colors ${className}`}
        />
    </div>
);

export const SelectField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: { value: string; label: string }[]; className?: string }> = ({ label, value, onChange, options, className }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className={`w-full bg-gray-700/50 p-2 rounded text-white border border-transparent focus:border-cyan-500 focus:ring-cyan-500 transition-colors ${className}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

// --- Modals for CRUD operations ---

export const ConfirmDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}> = ({ isOpen, onClose, onConfirm, message }) => (
    <Modal isOpen={isOpen} title="Confirm Deletion" onClose={onClose}>
        <p className="text-gray-300">{message}</p>
        <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white">Delete</button>
        </div>
    </Modal>
);

export const ProjectFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (project: Project) => void;
    initialProject?: Project;
}> = ({ isOpen, onClose, onSubmit, initialProject = emptyProject }) => {
    const [project, setProject] = useState<Project>(initialProject);

    useEffect(() => {
        setProject(initialProject);
    }, [initialProject, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProject(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSubmit({ ...project, id: project.id || generateUniqueId(), settings: { ...project.settings, projectId: project.id || generateUniqueId() } });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} title={initialProject.id ? "Edit Project" : "Create New Project"} onClose={onClose}>
            <InputField label="Project Name" name="name" value={project.name} onChange={handleChange} />
            <TextareaField label="Logline" name="logline" value={project.logline} onChange={handleChange} rows={2} />
            <TextareaField label="Synopsis" name="synopsis" value={project.synopsis} onChange={handleChange} rows={5} />
            <InputField label="Genre (comma separated)" name="genre" value={project.genre.join(', ')} onChange={(e) => setProject(prev => ({ ...prev, genre: e.target.value.split(',').map(g => g.trim()).filter(Boolean) }))} />
            <InputField label="Target Audience" name="targetAudience" value={project.targetAudience} onChange={handleChange} />
            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Project</button>
            </div>
        </Modal>
    );
};

export const CharacterFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (character: Character) => void;
    initialCharacter?: Character;
    aiSuggestions?: string[];
}> = ({ isOpen, onClose, onSubmit, initialCharacter = emptyCharacter, aiSuggestions = [] }) => {
    const [character, setCharacter] = useState<Character>(initialCharacter);
    const [newTrait, setNewTrait] = useState('');

    useEffect(() => {
        setCharacter(initialCharacter);
    }, [initialCharacter, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCharacter(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTrait = () => {
        if (newTrait.trim() && !character.personalityTraits.includes(newTrait.trim() as PersonalityTrait)) {
            setCharacter(prev => ({ ...prev, personalityTraits: [...prev.personalityTraits, newTrait.trim() as PersonalityTrait] }));
            setNewTrait('');
        }
    };

    const handleRemoveTrait = (traitToRemove: PersonalityTrait) => {
        setCharacter(prev => ({ ...prev, personalityTraits: prev.personalityTraits.filter(t => t !== traitToRemove) }));
    };

    const handleSubmit = () => {
        onSubmit({ ...character, id: character.id || generateUniqueId() });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} title={initialCharacter.id ? "Edit Character" : "Create New Character"} onClose={onClose}>
            <InputField label="Name" name="name" value={character.name} onChange={handleChange} />
            <TextareaField label="Description (Physical, brief summary)" name="description" value={character.description} onChange={handleChange} />
            <TextareaField label="Backstory" name="backstory" value={character.backstory} onChange={handleChange} />
            <TextareaField label="Motivations" name="motivations" value={character.motivations} onChange={handleChange} />
            <TextareaField label="Goals" name="goals" value={character.goals} onChange={handleChange} />
            <TextareaField label="Dialogue Style" name="dialogueStyle" value={character.dialogueStyle} onChange={handleChange} />

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Personality Traits</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {character.personalityTraits.map(trait => (
                        <span key={trait} className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            {trait}
                            <button onClick={() => handleRemoveTrait(trait)} className="ml-1 text-red-300 hover:text-red-500">
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newTrait}
                        onChange={(e) => setNewTrait(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTrait(); } }}
                        placeholder="Add new trait"
                        className="flex-grow bg-gray-700/50 p-2 rounded text-white border border-transparent focus:border-cyan-500"
                    />
                    <button onClick={handleAddTrait} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white">Add</button>
                </div>
            </div>

            {aiSuggestions.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-300">AI Suggestions:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                        {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Character</button>
            </div>
        </Modal>
    );
};

export const LocationFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (location: Location) => void;
    initialLocation?: Location;
    aiSuggestions?: string[];
}> = ({ isOpen, onClose, onSubmit, initialLocation = emptyLocation, aiSuggestions = [] }) => {
    const [location, setLocation] = useState<Location>(initialLocation);
    const [newElement, setNewElement] = useState('');

    useEffect(() => {
        setLocation(initialLocation);
    }, [initialLocation, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocation(prev => ({ ...prev, [name]: value }));
    };

    const handleAddElement = () => {
        if (newElement.trim() && !location.keyElements.includes(newElement.trim())) {
            setLocation(prev => ({ ...prev, keyElements: [...prev.keyElements, newElement.trim()] }));
            setNewElement('');
        }
    };

    const handleRemoveElement = (elementToRemove: string) => {
        setLocation(prev => ({ ...prev, keyElements: prev.keyElements.filter(el => el !== elementToRemove) }));
    };

    const handleSubmit = () => {
        onSubmit({ ...location, id: location.id || generateUniqueId() });
        onClose();
    };

    const locationTypeOptions = [
        { value: 'indoor', label: 'Indoor' }, { value: 'outdoor', label: 'Outdoor' },
        { value: 'city', label: 'City' }, { value: 'rural', label: 'Rural' },
        { value: 'fantasy', label: 'Fantasy' }, { value: 'sci-fi', label: 'Sci-Fi' },
        { value: 'historical', label: 'Historical' }, { value: 'specificBuilding', label: 'Specific Building' },
        { value: 'naturalLandmark', label: 'Natural Landmark' }
    ];

    return (
        <Modal isOpen={isOpen} title={initialLocation.id ? "Edit Location" : "Create New Location"} onClose={onClose}>
            <InputField label="Name" name="name" value={location.name} onChange={handleChange} />
            <SelectField label="Type" name="type" value={location.type} onChange={handleChange} options={locationTypeOptions} />
            <TextareaField label="Description (Visuals, atmosphere)" name="description" value={location.description} onChange={handleChange} />
            <TextareaField label="History" name="history" value={location.history} onChange={handleChange} />
            <TextareaField label="Significance to Story" name="significance" value={location.significance} onChange={handleChange} />
            <InputField label="Mood" name="mood" value={location.mood} onChange={handleChange} />

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Key Elements</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {location.keyElements.map(element => (
                        <span key={element} className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            {element}
                            <button onClick={() => handleRemoveElement(element)} className="ml-1 text-red-300 hover:text-red-500">
                                &times;
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newElement}
                        onChange={(e) => setNewElement(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddElement(); } }}
                        placeholder="Add key element"
                        className="flex-grow bg-gray-700/50 p-2 rounded text-white border border-transparent focus:border-cyan-500"
                    />
                    <button onClick={handleAddElement} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white">Add</button>
                </div>
            </div>

            {aiSuggestions.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-300">AI Suggestions:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                        {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Location</button>
            </div>
        </Modal>
    );
};

export const SceneFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (scene: Scene) => void;
    initialScene?: Scene;
    locations: Location[];
    characters: Character[];
    plotPoints: PlotPoint[];
    aiFeedback?: string;
}> = ({ isOpen, onClose, onSubmit, initialScene = emptyScene, locations, characters, plotPoints, aiFeedback }) => {
    const [scene, setScene] = useState<Scene>(initialScene);

    useEffect(() => {
        setScene(initialScene);
    }, [initialScene, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setScene(prev => ({ ...prev, [name]: value }));
    };

    const handleCharacterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setScene(prev => ({ ...prev, characterIds: selectedOptions }));
    };

    const handlePlotPointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setScene(prev => ({ ...prev, plotPointsCovered: selectedOptions }));
    };

    const handleSubmit = () => {
        onSubmit({ ...scene, id: scene.id || generateUniqueId() });
        onClose();
    };

    const sceneMoodOptions = [
        { value: 'tense', label: 'Tense' }, { value: 'humorous', label: 'Humorous' },
        { value: 'dramatic', label: 'Dramatic' }, { value: 'romantic', label: 'Romantic' },
        { value: 'suspenseful', label: 'Suspenseful' }, { value: 'calm', label: 'Calm' },
        { value: 'action-packed', label: 'Action-Packed' }
    ];
    const scenePacingOptions = [
        { value: 'slow', label: 'Slow' }, { value: 'medium', label: 'Medium' },
        { value: 'fast', label: 'Fast' }
    ];

    return (
        <Modal isOpen={isOpen} title={initialScene.id ? "Edit Scene" : "Create New Scene"} onClose={onClose}>
            <InputField label="Title" name="title" value={scene.title} onChange={handleChange} />
            <TextareaField label="Synopsis" name="synopsis" value={scene.synopsis} onChange={handleChange} />
            <TextareaField label="Content (Script)" name="content" value={scene.content} onChange={handleChange} rows={10} className="font-mono text-sm" />

            <SelectField
                label="Primary Location"
                name="locationId"
                value={scene.locationId}
                onChange={handleChange}
                options={[{ value: '', label: 'None' }, ...locations.map(loc => ({ value: loc.id, label: loc.name }))]}
            />
            <SelectField
                label="Characters Present"
                name="characterIds"
                value={''} // Value is handled by the multi-select logic
                onChange={handleCharacterChange}
                options={characters.map(char => ({ value: char.id, label: char.name }))}
                className="h-24"
            />
            <SelectField
                label="Plot Points Covered"
                name="plotPointsCovered"
                value={''} // Value is handled by the multi-select logic
                onChange={handlePlotPointChange}
                options={plotPoints.map(pp => ({ value: pp.id, label: pp.title }))}
                className="h-24"
            />
            <SelectField label="Mood" name="mood" value={scene.mood} onChange={handleChange} options={sceneMoodOptions} />
            <SelectField label="Pacing" name="pacing" value={scene.pacing} onChange={handleChange} options={scenePacingOptions} />

            {aiFeedback && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-300">AI Feedback:</h4>
                    <p className="text-gray-400 text-sm bg-gray-900/50 p-3 rounded italic">{aiFeedback}</p>
                </div>
            )}

            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Scene</button>
            </div>
        </Modal>
    );
};

export const PlotPointFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (plotPoint: PlotPoint) => void;
    initialPlotPoint?: PlotPoint;
    characters: Character[];
    scenes: Scene[];
    aiSuggestions?: string[];
}> = ({ isOpen, onClose, onSubmit, initialPlotPoint = emptyPlotPoint, characters, scenes, aiSuggestions = [] }) => {
    const [plotPoint, setPlotPoint] = useState<PlotPoint>(initialPlotPoint);

    useEffect(() => {
        setPlotPoint(initialPlotPoint);
    }, [initialPlotPoint, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPlotPoint(prev => ({ ...prev, [name]: value }));
    };

    const handleCharacterImpactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setPlotPoint(prev => ({ ...prev, impactOnCharacters: selectedOptions }));
    };

    const handleAssociatedScenesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setPlotPoint(prev => ({ ...prev, associatedScenes: selectedOptions }));
    };

    const handleRequiredElementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPlotPoint(prev => ({ ...prev, requiredElements: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) }));
    };

    const handleSubmit = () => {
        onSubmit({ ...plotPoint, id: plotPoint.id || generateUniqueId() });
        onClose();
    };

    const plotPointTypeOptions = [
        { value: 'incitingIncident', label: 'Inciting Incident' }, { value: 'risingAction', label: 'Rising Action' },
        { value: 'climax', label: 'Climax' }, { value: 'fallingAction', label: 'Falling Action' },
        { value: 'resolution', label: 'Resolution' }, { value: 'midpoint', label: 'Midpoint' },
        { value: 'plotTwist', label: 'Plot Twist' }, { value: 'reversal', label: 'Reversal' }
    ];

    return (
        <Modal isOpen={isOpen} title={initialPlotPoint.id ? "Edit Plot Point" : "Create New Plot Point"} onClose={onClose}>
            <InputField label="Title" name="title" value={plotPoint.title} onChange={handleChange} />
            <SelectField label="Type" name="type" value={plotPoint.type} onChange={handleChange} options={plotPointTypeOptions} />
            <TextareaField label="Description" name="description" value={plotPoint.description} onChange={handleChange} />

            <SelectField
                label="Impacts Characters"
                name="impactOnCharacters"
                value={''}
                onChange={handleCharacterImpactChange}
                options={characters.map(char => ({ value: char.id, label: char.name }))}
                className="h-24"
            />
            <SelectField
                label="Associated Scenes"
                name="associatedScenes"
                value={''}
                onChange={handleAssociatedScenesChange}
                options={scenes.map(scene => ({ value: scene.id, label: scene.title }))}
                className="h-24"
            />
            <TextareaField
                label="Required Elements (one per line)"
                name="requiredElements"
                value={plotPoint.requiredElements.join('\n')}
                onChange={handleRequiredElementsChange}
                placeholder="Key items, information, or events"
            />

            {aiSuggestions.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-300">AI Suggestions:</h4>
                    <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                        {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Plot Point</button>
            </div>
        </Modal>
    );
};

export const StoryArcFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (storyArc: StoryArc) => void;
    initialStoryArc?: StoryArc;
    characters: Character[];
    plotPoints: PlotPoint[];
    scenes: Scene[];
}> = ({ isOpen, onClose, onSubmit, initialStoryArc = emptyStoryArc, characters, plotPoints, scenes }) => {
    const [storyArc, setStoryArc] = useState<StoryArc>(initialStoryArc);

    useEffect(() => {
        setStoryArc(initialStoryArc);
    }, [initialStoryArc, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setStoryArc(prev => ({ ...prev, [name]: value }));
    };

    const handleCharactersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setStoryArc(prev => ({ ...prev, charactersInvolved: selectedOptions }));
    };

    const handleKeyPlotPointsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setStoryArc(prev => ({ ...prev, keyPlotPoints: selectedOptions }));
    };

    const handleSubmit = () => {
        onSubmit({ ...storyArc, id: storyArc.id || generateUniqueId() });
        onClose();
    };

    const storyArcTypeOptions = [
        { value: 'main', label: 'Main Plot' }, { value: 'sub_plot', label: 'Sub Plot' },
        { value: 'character_arc', label: 'Character Arc' }, { value: 'thematic', label: 'Thematic Arc' }
    ];

    const sceneOrPlotPointOptions = [
        { value: '', label: 'None' },
        { label: '--- Scenes ---', value: '', disabled: true },
        ...scenes.map(s => ({ value: s.id, label: `Scene: ${s.title}` })),
        { label: '--- Plot Points ---', value: '', disabled: true },
        ...plotPoints.map(pp => ({ value: pp.id, label: `Plot: ${pp.title}` }))
    ];

    return (
        <Modal isOpen={isOpen} title={initialStoryArc.id ? "Edit Story Arc" : "Create New Story Arc"} onClose={onClose}>
            <InputField label="Title" name="title" value={storyArc.title} onChange={handleChange} />
            <SelectField label="Type" name="type" value={storyArc.type} onChange={handleChange} options={storyArcTypeOptions} />
            <TextareaField label="Description" name="description" value={storyArc.description} onChange={handleChange} />

            <SelectField
                label="Start Point (Scene or Plot Point)"
                name="startPoint"
                value={storyArc.startPoint}
                onChange={handleChange}
                options={sceneOrPlotPointOptions}
            />
            <SelectField
                label="End Point (Scene or Plot Point)"
                name="endPoint"
                value={storyArc.endPoint}
                onChange={handleChange}
                options={sceneOrPlotPointOptions}
            />

            <SelectField
                label="Key Plot Points in this Arc"
                name="keyPlotPoints"
                value={''}
                onChange={handleKeyPlotPointsChange}
                options={plotPoints.map(pp => ({ value: pp.id, label: pp.title }))}
                className="h-24"
            />
            <SelectField
                label="Characters Involved"
                name="charactersInvolved"
                value={''}
                onChange={handleCharactersChange}
                options={characters.map(char => ({ value: char.id, label: char.name }))}
                className="h-24"
            />

            <div className="flex justify-end mt-4 space-x-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Story Arc</button>
            </div>
        </Modal>
    );
};


// --- Main Application Panels ---

export const DashboardPanel: React.FC<{
    projects: Project[];
    activeProjectId: string | null;
    dispatch: React.Dispatch<AppAction>;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ projects, activeProjectId, dispatch, addNotification }) => {
    const handleNewProject = (project: Project) => {
        dispatch({ type: 'ADD_PROJECT', payload: project });
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: project.id });
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'scriptEditor' });
        addNotification("New project created!", "success");
    };

    const handleSelectProject = (projectId: string) => {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
        const selectedProject = projects.find(p => p.id === projectId);
        if (selectedProject?.settings.lastOpenedPanel) {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: selectedProject.settings.lastOpenedPanel });
        } else {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'scriptEditor' });
        }
        addNotification(`Project '${selectedProject?.name}' loaded.`, "info");
    };

    const handleDeleteProject = (projectId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityId: projectId, message: "Are you sure you want to delete this project and all its data? This action cannot be undone." } } });
    };

    const handleEditProject = (project: Project) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'newProject', data: project } });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Your Projects</h2>
            <div className="flex justify-end">
                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'newProject' } })}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    New Project
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length === 0 ? (
                    <p className="text-gray-400 col-span-full">No projects yet. Start by creating a new one!</p>
                ) : (
                    projects.map(project => (
                        <Card key={project.id} className={`p-4 ${project.id === activeProjectId ? 'border-2 border-cyan-500' : 'border border-gray-700'}`}>
                            <h3 className="text-xl font-semibold text-white truncate">{project.name}</h3>
                            <p className="text-sm text-gray-400 italic mb-2 line-clamp-2">{project.logline || 'No logline provided.'}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                                <span>Created: {formatDate(new Date(project.createdAt))}</span>
                                <span>Updated: {formatDate(new Date(project.updatedAt))}</span>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleSelectProject(project.id)}
                                    className="flex-grow px-3 py-2 bg-cyan-700 hover:bg-cyan-800 rounded text-white text-sm">Open</button>
                                <button onClick={() => handleEditProject(project)}
                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm">Edit</button>
                                <button onClick={() => handleDeleteProject(project.id)}
                                    className="px-3 py-2 bg-red-700 hover:bg-red-800 rounded text-white text-sm">Delete</button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export const ScriptEditorPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    currentAISuggestions: string[];
    isAILoading: boolean;
    currentAIRequestPrompt: string;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, currentAISuggestions, isAILoading, currentAIRequestPrompt, addNotification }) => {
    const activeScene = project.scenes.find(s => s.id === project.settings.lastOpenedPanel); // If we want to open scene directly
    const [scriptContent, setScriptContent] = useState<string>(activeScene?.content || project.scenes[0]?.content || '');
    const [prompt, setPrompt] = useState(currentAIRequestPrompt || 'Suggest a witty, sarcastic comeback for Alex.');
    const [selectedSceneId, setSelectedSceneId] = useState(activeScene?.id || project.scenes[0]?.id || '');

    useEffect(() => {
        const sceneToDisplay = project.scenes.find(s => s.id === selectedSceneId);
        if (sceneToDisplay) {
            setScriptContent(sceneToDisplay.content);
        } else if (project.scenes.length > 0) {
            setSelectedSceneId(project.scenes[0].id);
            setScriptContent(project.scenes[0].content);
        } else {
            setScriptContent('');
            setSelectedSceneId('');
        }
    }, [selectedSceneId, project.scenes]);

    const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScriptContent(e.target.value);
        const updatedScene = project.scenes.find(s => s.id === selectedSceneId);
        if (updatedScene) {
            dispatch({
                type: 'UPDATE_SCENE',
                payload: { projectId: project.id, scene: { ...updatedScene, content: e.target.value } }
            });
        }
    };

    const handleGenerate = async () => {
        if (!selectedSceneId) {
            addNotification("Please select or create a scene first.", "warning");
            return;
        }
        dispatch({ type: 'SET_AI_LOADING', payload: true });
        dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [] });
        dispatch({ type: 'SET_CURRENT_AI_REQUEST_PROMPT', payload: prompt });
        try {
            const suggestions = await aiService.generateDialogueSuggestions(scriptContent, prompt, project.settings.preferredAIConfig);
            dispatch({ type: 'SET_AI_SUGGESTIONS', payload: suggestions });
            addNotification("AI suggestions generated!", "success");
        } catch (error: any) {
            console.error(error);
            dispatch({ type: 'SET_AI_ERROR', payload: error.message || "Failed to generate AI suggestions." });
            addNotification(`AI Error: ${error.message || "Failed to generate suggestions."}`, "error");
        } finally {
            dispatch({ type: 'SET_AI_LOADING', payload: false });
        }
    };

    const handleAddNewScene = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editScene', data: { ...emptyScene, projectId: project.id } } });
    };

    const handleUpdateScene = (scene: Scene) => {
        dispatch({ type: 'UPDATE_SCENE', payload: { projectId: project.id, scene } });
        addNotification("Scene updated.", "success");
    };

    const handleAddScene = (scene: Scene) => {
        dispatch({ type: 'ADD_SCENE', payload: { projectId: project.id, scene } });
        setSelectedSceneId(scene.id);
        addNotification("Scene created.", "success");
    };

    const handleDeleteScene = (sceneId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityId: sceneId, message: "Are you sure you want to delete this scene?" } } });
    };

    const currentEditScene = project.scenes.find(s => s.id === selectedSceneId);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Script Editor</h2>

            <div className="flex justify-between items-center mb-4">
                <SelectField
                    label="Active Scene"
                    value={selectedSceneId}
                    onChange={(e) => setSelectedSceneId(e.target.value)}
                    options={project.scenes.map(s => ({ value: s.id, label: s.title }))}
                    className="w-2/3"
                />
                <div className="flex space-x-2 ml-4">
                    <button onClick={handleAddNewScene} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm">New Scene</button>
                    {currentEditScene && (
                        <>
                            <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'editScene', data: currentEditScene } })} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm">Edit Scene Details</button>
                            <button onClick={() => handleDeleteScene(currentEditScene.id)} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm">Delete Scene</button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Script Content">
                        <textarea
                            value={scriptContent}
                            onChange={handleScriptChange}
                            className="w-full h-[60vh] bg-gray-900/50 p-4 rounded-lg font-mono text-sm text-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="Start writing your scene here..."
                        />
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card title="AI Co-Writer">
                        <div className="space-y-4">
                            <TextareaField
                                label="Your Request:"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                                placeholder="e.g., Suggest a witty, sarcastic comeback for Alex."
                            />
                            <button onClick={handleGenerate} disabled={isAILoading || !selectedSceneId} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                {isAILoading ? 'Generating...' : 'Get Suggestions'}
                            </button>
                            {currentAISuggestions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-gray-300">Suggestions:</h4>
                                    {currentAISuggestions.map((s, i) => (
                                        <p key={i} className="text-sm p-2 bg-gray-900/50 rounded italic break-words">"{s}"</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            <SceneFormModal
                isOpen={project.showModal.type === 'editScene' && project.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSubmit={project.showModal.data?.id ? handleUpdateScene : handleAddScene}
                initialScene={project.showModal.data || emptyScene}
                locations={project.locations}
                characters={project.characters}
                plotPoints={project.plotPoints}
            />
        </div>
    );
};

export const CharactersPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    isAILoading: boolean;
    currentAISuggestions: string[];
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, isAILoading, currentAISuggestions, addNotification }) => {
    const [characterConceptPrompt, setCharacterConceptPrompt] = useState('');
    const { selectedCharacterId } = project;
    const selectedCharacter = project.characters.find(c => c.id === selectedCharacterId);

    const handleAddCharacter = (character: Character) => {
        dispatch({ type: 'ADD_CHARACTER', payload: { projectId: project.id, character } });
        dispatch({ type: 'SET_SELECTED_CHARACTER', payload: character.id });
        addNotification(`Character '${character.name}' added.`, "success");
    };

    const handleUpdateCharacter = (character: Character) => {
        dispatch({ type: 'UPDATE_CHARACTER', payload: { projectId: project.id, character } });
        addNotification(`Character '${character.name}' updated.`, "success");
    };

    const handleDeleteCharacter = (characterId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityId: characterId, message: "Are you sure you want to delete this character?" } } });
    };

    const generateCharacterConcept = async () => {
        if (!characterConceptPrompt) {
            addNotification("Please enter a concept for the character first.", "warning");
            return;
        }
        dispatch({ type: 'SET_AI_LOADING', payload: true });
        dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [] });
        try {
            const generatedCharacter = await aiService.generateCharacterConcept(characterConceptPrompt, project.settings.preferredAIConfig);
            dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [`AI generated a concept for: ${generatedCharacter.name}`] });
            // Optionally open the form with the generated character
            dispatch({ type: 'OPEN_MODAL', payload: { type: 'editCharacter', data: generatedCharacter } });
            addNotification("AI character concept generated!", "success");
        } catch (error: any) {
            console.error(error);
            dispatch({ type: 'SET_AI_ERROR', payload: error.message || "Failed to generate character concept." });
            addNotification(`AI Error: ${error.message || "Failed to generate character concept."}`, "error");
        } finally {
            dispatch({ type: 'SET_AI_LOADING', payload: false });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Characters</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Character List">
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'editCharacter' } })}
                            className="w-full mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Add New Character
                        </button>
                        <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                            {project.characters.length === 0 ? (
                                <p className="text-gray-400">No characters added yet.</p>
                            ) : (
                                project.characters.map(char => (
                                    <li key={char.id}
                                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${selectedCharacterId === char.id ? 'bg-cyan-900 border border-cyan-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        onClick={() => dispatch({ type: 'SET_SELECTED_CHARACTER', payload: char.id })}>
                                        <span className="text-white font-medium">{char.name}</span>
                                        <div className="flex space-x-1">
                                            <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_MODAL', payload: { type: 'editCharacter', data: char } }); }} className="text-gray-400 hover:text-cyan-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCharacter(char.id); }} className="text-gray-400 hover:text-red-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {selectedCharacter ? (
                        <Card title={`${selectedCharacter.name}'s Profile`}>
                            <div className="space-y-3 text-gray-300">
                                <p><strong className="text-white">Description:</strong> {selectedCharacter.description}</p>
                                <p><strong className="text-white">Backstory:</strong> {selectedCharacter.backstory}</p>
                                <p><strong className="text-white">Motivations:</strong> {selectedCharacter.motivations}</p>
                                <p><strong className="text-white">Goals:</strong> {selectedCharacter.goals}</p>
                                <p><strong className="text-white">Dialogue Style:</strong> {selectedCharacter.dialogueStyle}</p>
                                <p><strong className="text-white">Personality:</strong> {selectedCharacter.personalityTraits.join(', ')}</p>
                                {selectedCharacter.aiNotes && <p className="italic text-gray-400">AI Notes: {selectedCharacter.aiNotes}</p>}
                            </div>
                        </Card>
                    ) : (
                        <Card title="Character Details">
                            <p className="text-gray-400">Select a character from the list or create a new one to view details.</p>
                        </Card>
                    )}
                    <Card title="AI Character Concept Generator">
                        <TextareaField
                            label="Concept Idea (e.g., 'A grizzled space pirate with a hidden soft spot for stray cats.')"
                            value={characterConceptPrompt}
                            onChange={(e) => setCharacterConceptPrompt(e.target.value)}
                            rows={4}
                        />
                        <button onClick={generateCharacterConcept} disabled={isAILoading}
                            className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50">
                            {isAILoading ? 'Generating Concept...' : 'Generate Character Concept'}
                        </button>
                        {currentAISuggestions.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-300">AI Output:</h4>
                                <p className="text-sm p-2 bg-gray-900/50 rounded italic text-gray-400">{currentAISuggestions[0]}</p>
                                <p className="text-sm text-gray-500">The generated character concept has been pre-filled into the 'Add New Character' modal. You can review and save it.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <CharacterFormModal
                isOpen={project.showModal.type === 'editCharacter' && project.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSubmit={project.showModal.data?.id ? handleUpdateCharacter : handleAddCharacter}
                initialCharacter={project.showModal.data || emptyCharacter}
                aiSuggestions={project.showModal.data ? [] : currentAISuggestions} // Only show AI suggestions when creating a new character based on AI
            />
        </div>
    );
};

export const LocationsPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    isAILoading: boolean;
    currentAISuggestions: string[];
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, isAILoading, currentAISuggestions, addNotification }) => {
    const [locationConceptPrompt, setLocationConceptPrompt] = useState('');
    const { selectedLocationId } = project;
    const selectedLocation = project.locations.find(l => l.id === selectedLocationId);

    const handleAddLocation = (location: Location) => {
        dispatch({ type: 'ADD_LOCATION', payload: { projectId: project.id, location } });
        dispatch({ type: 'SET_SELECTED_LOCATION', payload: location.id });
        addNotification(`Location '${location.name}' added.`, "success");
    };

    const handleUpdateLocation = (location: Location) => {
        dispatch({ type: 'UPDATE_LOCATION', payload: { projectId: project.id, location } });
        addNotification(`Location '${location.name}' updated.`, "success");
    };

    const handleDeleteLocation = (locationId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityId: locationId, message: "Are you sure you want to delete this location?" } } });
    };

    const generateLocationConcept = async () => {
        if (!locationConceptPrompt) {
            addNotification("Please enter a concept for the location first.", "warning");
            return;
        }
        dispatch({ type: 'SET_AI_LOADING', payload: true });
        dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [] });
        try {
            // Placeholder: A real AI call would generate structured location data
            const generatedLocationName = `AI-Generated ${locationConceptPrompt}`;
            const generatedLocation: Location = {
                ...emptyLocation,
                id: generateUniqueId(),
                name: generatedLocationName,
                description: `A vivid description for ${generatedLocationName} based on the prompt.`,
                history: `The long history of ${generatedLocationName}.`,
                aiNotes: `Generated from prompt: '${locationConceptPrompt}'.`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [`AI generated a concept for: ${generatedLocation.name}`] });
            dispatch({ type: 'OPEN_MODAL', payload: { type: 'editLocation', data: generatedLocation } });
            addNotification("AI location concept generated!", "success");
        } catch (error: any) {
            console.error(error);
            dispatch({ type: 'SET_AI_ERROR', payload: error.message || "Failed to generate location concept." });
            addNotification(`AI Error: ${error.message || "Failed to generate location concept."}`, "error");
        } finally {
            dispatch({ type: 'SET_AI_LOADING', payload: false });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Locations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Location List">
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'editLocation' } })}
                            className="w-full mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Add New Location
                        </button>
                        <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                            {project.locations.length === 0 ? (
                                <p className="text-gray-400">No locations added yet.</p>
                            ) : (
                                project.locations.map(loc => (
                                    <li key={loc.id}
                                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${selectedLocationId === loc.id ? 'bg-cyan-900 border border-cyan-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        onClick={() => dispatch({ type: 'SET_SELECTED_LOCATION', payload: loc.id })}>
                                        <span className="text-white font-medium">{loc.name}</span>
                                        <div className="flex space-x-1">
                                            <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_MODAL', payload: { type: 'editLocation', data: loc } }); }} className="text-gray-400 hover:text-cyan-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteLocation(loc.id); }} className="text-gray-400 hover:text-red-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {selectedLocation ? (
                        <Card title={`${selectedLocation.name} Details`}>
                            <div className="space-y-3 text-gray-300">
                                <p><strong className="text-white">Type:</strong> {selectedLocation.type}</p>
                                <p><strong className="text-white">Description:</strong> {selectedLocation.description}</p>
                                <p><strong className="text-white">History:</strong> {selectedLocation.history}</p>
                                <p><strong className="text-white">Significance:</strong> {selectedLocation.significance}</p>
                                <p><strong className="text-white">Mood:</strong> {selectedLocation.mood}</p>
                                <p><strong className="text-white">Key Elements:</strong> {selectedLocation.keyElements.join(', ')}</p>
                                {selectedLocation.aiNotes && <p className="italic text-gray-400">AI Notes: {selectedLocation.aiNotes}</p>}
                            </div>
                        </Card>
                    ) : (
                        <Card title="Location Details">
                            <p className="text-gray-400">Select a location from the list or create a new one to view details.</p>
                        </Card>
                    )}
                    <Card title="AI Location Concept Generator">
                        <TextareaField
                            label="Concept Idea (e.g., 'A desolate, futuristic space station built into an asteroid.')"
                            value={locationConceptPrompt}
                            onChange={(e) => setLocationConceptPrompt(e.target.value)}
                            rows={4}
                        />
                        <button onClick={generateLocationConcept} disabled={isAILoading}
                            className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50">
                            {isAILoading ? 'Generating Concept...' : 'Generate Location Concept'}
                        </button>
                        {currentAISuggestions.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-300">AI Output:</h4>
                                <p className="text-sm p-2 bg-gray-900/50 rounded italic text-gray-400">{currentAISuggestions[0]}</p>
                                <p className="text-sm text-gray-500">The generated location concept has been pre-filled into the 'Add New Location' modal. You can review and save it.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            <LocationFormModal
                isOpen={project.showModal.type === 'editLocation' && project.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSubmit={project.showModal.data?.id ? handleUpdateLocation : handleAddLocation}
                initialLocation={project.showModal.data || emptyLocation}
                aiSuggestions={project.showModal.data ? [] : currentAISuggestions}
            />
        </div>
    );
};

export const PlotBoardPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    isAILoading: boolean;
    currentAISuggestions: string[];
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, isAILoading, currentAISuggestions, addNotification }) => {
    const [plotIdeaPrompt, setPlotIdeaPrompt] = useState('');
    const { selectedPlotPointId } = project;
    const selectedPlotPoint = project.plotPoints.find(pp => pp.id === selectedPlotPointId);

    const handleAddPlotPoint = (plotPoint: PlotPoint) => {
        dispatch({ type: 'ADD_PLOT_POINT', payload: { projectId: project.id, plotPoint } });
        addNotification(`Plot Point '${plotPoint.title}' added.`, "success");
    };

    const handleUpdatePlotPoint = (plotPoint: PlotPoint) => {
        dispatch({ type: 'UPDATE_PLOT_POINT', payload: { projectId: project.id, plotPoint } });
        addNotification(`Plot Point '${plotPoint.title}' updated.`, "success");
    };

    const handleDeletePlotPoint = (plotPointId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityId: plotPointId, message: "Are you sure you want to delete this plot point?" } } });
    };

    const generatePlotPointIdeas = async () => {
        dispatch({ type: 'SET_AI_LOADING', payload: true });
        dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [] });
        try {
            const ideas = await aiService.generatePlotPointIdeas(project, project.settings.preferredAIConfig);
            dispatch({ type: 'SET_AI_SUGGESTIONS', payload: ideas });
            addNotification("AI plot point ideas generated!", "success");
        } catch (error: any) {
            console.error(error);
            dispatch({ type: 'SET_AI_ERROR', payload: error.message || "Failed to generate plot point ideas." });
            addNotification(`AI Error: ${error.message || "Failed to generate plot point ideas."}`, "error");
        } finally {
            dispatch({ type: 'SET_AI_LOADING', payload: false });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Plot Board</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Plot Points List">
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'editPlotPoint' } })}
                            className="w-full mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Add New Plot Point
                        </button>
                        <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                            {project.plotPoints.length === 0 ? (
                                <p className="text-gray-400">No plot points added yet.</p>
                            ) : (
                                project.plotPoints.map(pp => (
                                    <li key={pp.id}
                                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${selectedPlotPointId === pp.id ? 'bg-cyan-900 border border-cyan-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        onClick={() => dispatch({ type: 'SET_SELECTED_PLOT_POINT', payload: pp.id })}>
                                        <span className="text-white font-medium">{pp.title} ({pp.type})</span>
                                        <div className="flex space-x-1">
                                            <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_MODAL', payload: { type: 'editPlotPoint', data: pp } }); }} className="text-gray-400 hover:text-cyan-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeletePlotPoint(pp.id); }} className="text-gray-400 hover:text-red-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                    <Card title="AI Plot Point Ideas">
                        <button onClick={generatePlotPointIdeas} disabled={isAILoading}
                            className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50">
                            {isAILoading ? 'Generating Ideas...' : 'Generate Plot Point Ideas'}
                        </button>
                        {currentAISuggestions.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-300">Suggestions:</h4>
                                <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
                                    {currentAISuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        )}
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {selectedPlotPoint ? (
                        <Card title={`${selectedPlotPoint.title} Details`}>
                            <div className="space-y-3 text-gray-300">
                                <p><strong className="text-white">Type:</strong> {selectedPlotPoint.type}</p>
                                <p><strong className="text-white">Description:</strong> {selectedPlotPoint.description}</p>
                                <p><strong className="text-white">Impacts Characters:</strong> {selectedPlotPoint.impactOnCharacters.map(charId => project.characters.find(c => c.id === charId)?.name || 'Unknown').join(', ')}</p>
                                <p><strong className="text-white">Associated Scenes:</strong> {selectedPlotPoint.associatedScenes.map(sceneId => project.scenes.find(s => s.id === sceneId)?.title || 'Unknown').join(', ')}</p>
                                <p><strong className="text-white">Required Elements:</strong> {selectedPlotPoint.requiredElements.join(', ')}</p>
                                {selectedPlotPoint.aiSuggestions && <p className="italic text-gray-400">AI Suggestions: {selectedPlotPoint.aiSuggestions}</p>}
                            </div>
                        </Card>
                    ) : (
                        <Card title="Plot Point Details">
                            <p className="text-gray-400">Select a plot point from the list or create a new one to view details.</p>
                        </Card>
                    )}
                </div>
            </div>
            <PlotPointFormModal
                isOpen={project.showModal.type === 'editPlotPoint' && project.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSubmit={project.showModal.data?.id ? handleUpdatePlotPoint : handleAddPlotPoint}
                initialPlotPoint={project.showModal.data || emptyPlotPoint}
                characters={project.characters}
                scenes={project.scenes}
            />
        </div>
    );
};

export const WorldBuilderPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, addNotification }) => {
    const { selectedStoryArcId } = project;
    const selectedStoryArc = project.storyArcs.find(sa => sa.id === selectedStoryArcId);

    const handleAddStoryArc = (storyArc: StoryArc) => {
        dispatch({ type: 'ADD_STORY_ARC', payload: { projectId: project.id, storyArc } });
        addNotification(`Story Arc '${storyArc.title}' added.`, "success");
    };

    const handleUpdateStoryArc = (storyArc: StoryArc) => {
        dispatch({ type: 'UPDATE_STORY_ARC', payload: { projectId: project.id, storyArc } });
        addNotification(`Story Arc '${storyArc.title}' updated.`, "success");
    };

    const handleDeleteStoryArc = (storyArcId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityId: storyArcId, message: "Are you sure you want to delete this story arc?" } } });
    };

    // Placeholder for AI world-building generation
    const generateWorldLore = async () => {
        addNotification("AI World Lore generation is not yet fully implemented.", "info");
        // Implement AI call for generating lore, history, rules, etc.
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">World Builder & Story Arcs</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card title="Story Arcs">
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'editStoryArc' } })}
                            className="w-full mb-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Add New Story Arc
                        </button>
                        <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                            {project.storyArcs.length === 0 ? (
                                <p className="text-gray-400">No story arcs defined yet.</p>
                            ) : (
                                project.storyArcs.map(sa => (
                                    <li key={sa.id}
                                        className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${selectedStoryArcId === sa.id ? 'bg-cyan-900 border border-cyan-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                                        onClick={() => dispatch({ type: 'SET_SELECTED_STORY_ARC', payload: sa.id })}>
                                        <span className="text-white font-medium">{sa.title} ({sa.type})</span>
                                        <div className="flex space-x-1">
                                            <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_MODAL', payload: { type: 'editStoryArc', data: sa } }); }} className="text-gray-400 hover:text-cyan-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteStoryArc(sa.id); }} className="text-gray-400 hover:text-red-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    {selectedStoryArc ? (
                        <Card title={`${selectedStoryArc.title} Details`}>
                            <div className="space-y-3 text-gray-300">
                                <p><strong className="text-white">Type:</strong> {selectedStoryArc.type}</p>
                                <p><strong className="text-white">Description:</strong> {selectedStoryArc.description}</p>
                                <p><strong className="text-white">Start Point:</strong> {project.scenes.find(s => s.id === selectedStoryArc.startPoint)?.title || project.plotPoints.find(pp => pp.id === selectedStoryArc.startPoint)?.title || 'N/A'}</p>
                                <p><strong className="text-white">End Point:</strong> {project.scenes.find(s => s.id === selectedStoryArc.endPoint)?.title || project.plotPoints.find(pp => pp.id === selectedStoryArc.endPoint)?.title || 'N/A'}</p>
                                <p><strong className="text-white">Key Plot Points:</strong> {selectedStoryArc.keyPlotPoints.map(ppId => project.plotPoints.find(pp => pp.id === ppId)?.title || 'Unknown').join(', ')}</p>
                                <p><strong className="text-white">Characters Involved:</strong> {selectedStoryArc.charactersInvolved.map(charId => project.characters.find(c => c.id === charId)?.name || 'Unknown').join(', ')}</p>
                                {selectedStoryArc.aiAnalysis && <p className="italic text-gray-400">AI Analysis: {selectedStoryArc.aiAnalysis}</p>}
                            </div>
                        </Card>
                    ) : (
                        <Card title="Story Arc Details">
                            <p className="text-gray-400">Select a story arc or create a new one to view details.</p>
                        </Card>
                    )}
                    <Card title="World Lore & History">
                        <TextareaField
                            label="Project Lore / World Rules"
                            value={"This section would allow for free-form world-building. Future AI enhancements could parse this for consistency or generate new lore elements."}
                            onChange={() => { /* Placeholder */ }}
                            rows={8}
                        />
                        <button onClick={generateWorldLore} className="w-full py-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50">
                            Generate World Lore (Coming Soon)
                        </button>
                    </Card>
                </div>
            </div>
            <StoryArcFormModal
                isOpen={project.showModal.type === 'editStoryArc' && project.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSubmit={project.showModal.data?.id ? handleUpdateStoryArc : handleAddStoryArc}
                initialStoryArc={project.showModal.data || emptyStoryArc}
                characters={project.characters}
                plotPoints={project.plotPoints}
                scenes={project.scenes}
            />
        </div>
    );
};

export const AIChatPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    isAILoading: boolean;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, isAILoading, addNotification }) => {
    const [chatInput, setChatInput] = useState('');
    const chatContainerRef = React.useRef<HTMLDivElement>(null);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage: AIChatMessage = {
            id: generateUniqueId(),
            role: 'user',
            content: chatInput,
            timestamp: new Date().toISOString()
        };
        dispatch({ type: 'ADD_AI_CHAT_MESSAGE', payload: { projectId: project.id, message: userMessage } });
        setChatInput('');
        dispatch({ type: 'SET_AI_LOADING', payload: true });

        try {
            const aiResponseContent = await aiService.chatWithAI([...project.aiChatHistory, userMessage], project, project.settings.preferredAIConfig);
            const aiMessage: AIChatMessage = {
                id: generateUniqueId(),
                role: 'model',
                content: aiResponseContent,
                timestamp: new Date().toISOString()
            };
            dispatch({ type: 'ADD_AI_CHAT_MESSAGE', payload: { projectId: project.id, message: aiMessage } });
            addNotification("AI responded!", "success");
        } catch (error: any) {
            console.error(error);
            const errorMessage: AIChatMessage = {
                id: generateUniqueId(),
                role: 'model',
                content: `Error: ${error.message || "Failed to get AI response."}`,
                timestamp: new Date().toISOString()
            };
            dispatch({ type: 'ADD_AI_CHAT_MESSAGE', payload: { projectId: project.id, message: errorMessage } });
            addNotification(`AI Chat Error: ${error.message || "Failed to get AI response."}`, "error");
        } finally {
            dispatch({ type: 'SET_AI_LOADING', payload: false });
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [project.aiChatHistory, isAILoading]);

    return (
        <div className="space-y-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold text-white">AI Assistant Chat</h2>
            <Card className="flex-grow flex flex-col min-h-0">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-900/50 rounded-lg mb-4">
                    {project.aiChatHistory.length === 0 ? (
                        <p className="text-gray-500 italic">Start a conversation with your AI co-writer! Ask for ideas, feedback, or help with your story.</p>
                    ) : (
                        project.aiChatHistory.map(message => (
                            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg ${message.role === 'user' ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-100'}`}>
                                    <p className="font-semibold">{message.role === 'user' ? 'You' : 'AI Assistant'}</p>
                                    <p className="text-sm break-words">{message.content}</p>
                                    <span className="text-xs text-gray-400 block text-right mt-1">{formatDate(new Date(message.timestamp))}</span>
                                </div>
                            </div>
                        ))
                    )}
                    {isAILoading && (
                        <div className="flex justify-start">
                            <div className="max-w-[70%] p-3 rounded-lg bg-gray-700 text-gray-100 animate-pulse">
                                <p className="font-semibold">AI Assistant</p>
                                <p className="text-sm">Typing...</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex space-x-2">
                    <TextareaField
                        label=""
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        rows={2}
                        placeholder="Type your message to the AI..."
                        className="flex-grow"
                    />
                    <button onClick={handleSendMessage} disabled={isAILoading || !chatInput.trim()}
                        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white self-end disabled:opacity-50">
                        Send
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const AIConfigPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, addNotification }) => {
    const currentConfig = project.settings.preferredAIConfig;
    const [localConfig, setLocalConfig] = useState<AIConfig>(currentConfig);

    useEffect(() => {
        setLocalConfig(currentConfig);
    }, [currentConfig]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setLocalConfig(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSaveConfig = () => {
        dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { projectId: project.id, settings: { preferredAIConfig: localConfig } } });
        addNotification("AI configuration saved.", "success");
    };

    const handleResetToDefaults = () => {
        setLocalConfig(defaultAIConfig);
        addNotification("AI configuration reset to defaults.", "info");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">AI Configuration</h2>
            <Card title="General AI Settings">
                <div className="space-y-4">
                    <SelectField
                        label="AI Model"
                        name="model"
                        value={localConfig.model}
                        onChange={handleChange}
                        options={[
                            { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
                            { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
                            { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro (Legacy)' }
                        ]}
                    />
                    <InputField
                        label="Temperature (Creativity - 0.0 to 1.0)"
                        type="number"
                        name="temperature"
                        value={localConfig.temperature.toString()}
                        onChange={handleChange}
                        min="0" max="1" step="0.01"
                        placeholder="0.0 - 1.0"
                    />
                    <InputField
                        label="Top P (Diversity - 0.0 to 1.0)"
                        type="number"
                        name="topP"
                        value={localConfig.topP.toString()}
                        onChange={handleChange}
                        min="0" max="1" step="0.01"
                        placeholder="0.0 - 1.0"
                    />
                    <InputField
                        label="Top K (Diversity - integer)"
                        type="number"
                        name="topK"
                        value={localConfig.topK.toString()}
                        onChange={handleChange}
                        min="1" step="1"
                        placeholder="1 - 100"
                    />
                    <InputField
                        label="Max Output Tokens"
                        type="number"
                        name="maxOutputTokens"
                        value={localConfig.maxOutputTokens.toString()}
                        onChange={handleChange}
                        min="1" step="64"
                        placeholder="e.g., 2048"
                    />

                    <div className="flex justify-end space-x-2 mt-6">
                        <button onClick={handleResetToDefaults} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Reset to Defaults</button>
                        <button onClick={handleSaveConfig} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Configuration</button>
                    </div>
                </div>
            </Card>
            <Card title="API Key Status">
                <p className="text-gray-300">
                    Your Google Gen AI API Key is currently: {' '}
                    {process.env.NEXT_PUBLIC_API_KEY ? (
                        <span className="text-green-400">Configured (***********)</span>
                    ) : (
                        <span className="text-red-400">Not Configured. AI features may be limited or disabled.</span>
                    )}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                    To configure your API key, set the <code>NEXT_PUBLIC_API_KEY</code> environment variable in your project.
                </p>
            </Card>
        </div>
    );
};

export const ProjectSettingsPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, addNotification }) => {
    const [localSettings, setLocalSettings] = useState<ProjectSettings>(project.settings);

    useEffect(() => {
        setLocalSettings(project.settings);
    }, [project.settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveSettings = () => {
        dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { projectId: project.id, settings: localSettings } });
        addNotification("Project settings saved.", "success");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Project Settings</h2>
            <Card title="General Settings">
                <div className="space-y-4">
                    <InputField label="Project Name" name="name" value={project.name} onChange={() => { /* Name edited via modal */ }} disabled />
                    <InputField label="Logline" name="logline" value={project.logline} onChange={() => { /* Logline edited via modal */ }} disabled />
                    
                    <div>
                        <label className="inline-flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                name="autosaveEnabled"
                                checked={localSettings.autosaveEnabled}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                            />
                            <span className="ml-2">Enable Autosave</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-7">Automatically saves your project every few seconds.</p>
                    </div>

                    <div>
                        <label className="inline-flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                name="autoAIPropositions"
                                checked={localSettings.autoAIPropositions}
                                onChange={handleChange}
                                className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded"
                            />
                            <span className="ml-2">Enable Auto AI Propositions (Experimental)</span>
                        </label>
                        <p className="text-xs text-gray-500 ml-7">AI suggests dialogue/plot points in the background (may incur more AI costs).</p>
                    </div>

                    <SelectField
                        label="Theme"
                        name="theme"
                        value={localSettings.theme}
                        onChange={handleChange}
                        options={[
                            { value: 'dark', label: 'Dark' },
                            { value: 'light', label: 'Light' }
                        ]}
                    />
                    <InputField
                        label="Document Font"
                        name="documentFont"
                        value={localSettings.documentFont}
                        onChange={handleChange}
                        placeholder="e.g., Inter, Source Code Pro"
                    />
                    <InputField
                        label="Document Font Size (px)"
                        type="number"
                        name="documentFontSize"
                        value={localSettings.documentFontSize.toString()}
                        onChange={handleChange}
                        min="10" max="24" step="1"
                    />

                    <div className="flex justify-end mt-6">
                        <button onClick={handleSaveSettings} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Settings</button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export const ExportImportPanel: React.FC<{
    project: Project;
    dispatch: React.Dispatch<AppAction>;
    addNotification: (message: string, type: NotificationType) => void;
}> = ({ project, dispatch, addNotification }) => {
    const [exportFormat, setExportFormat] = useState<ProjectSettings['exportFormat']>(project.settings.exportFormat);
    const [importFile, setImportFile] = useState<File | null>(null);

    const handleExport = () => {
        try {
            let fileContent: string;
            let fileName: string;
            const projectData = { ...project, settings: { ...project.settings, preferredAIConfig: undefined } }; // Exclude sensitive AI config from export

            switch (exportFormat) {
                case 'json':
                    fileContent = JSON.stringify(projectData, null, 2);
                    fileName = `${project.name.replace(/\s/g, '_')}.json`;
                    break;
                case 'fountain':
                    // Basic Fountain export - would be much more complex for full screenplay formatting
                    fileContent = `# ${project.name}\n\n`;
                    if (project.logline) fileContent += `Logline: ${project.logline}\n\n`;
                    fileContent += project.scenes.map(s => s.content).join('\n\n');
                    fileName = `${project.name.replace(/\s/g, '_')}.fountain`;
                    break;
                case 'pdf':
                case 'html':
                default:
                    addNotification("PDF/HTML export not yet fully implemented. Exporting JSON for now.", "info");
                    fileContent = JSON.stringify(projectData, null, 2);
                    fileName = `${project.name.replace(/\s/g, '_')}.json`;
                    break;
            }

            const blob = new Blob([fileContent], { type: `application/${exportFormat === 'json' ? 'json' : 'text'}` });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification(`Project exported as ${exportFormat.toUpperCase()}.`, "success");
        } catch (error: any) {
            console.error("Export failed:", error);
            addNotification(`Export failed: ${error.message}`, "error");
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (!importFile) {
            addNotification("Please select a file to import.", "warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedProject: Project = JSON.parse(content);
                // Validate imported project structure
                if (importedProject && importedProject.id && importedProject.name && Array.isArray(importedProject.scenes)) {
                    const newProject = {
                        ...importedProject,
                        id: generateUniqueId(), // Assign new ID to avoid conflicts
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        settings: { ...importedProject.settings, projectId: generateUniqueId() } // Ensure settings also has new ID
                    };
                    dispatch({ type: 'ADD_PROJECT', payload: newProject });
                    dispatch({ type: 'SET_ACTIVE_PROJECT', payload: newProject.id });
                    addNotification(`Project '${newProject.name}' imported successfully!`, "success");
                    setImportFile(null);
                } else {
                    throw new Error("Invalid project file structure.");
                }
            } catch (error: any) {
                console.error("Import failed:", error);
                addNotification(`Import failed: ${error.message}`, "error");
            }
        };
        reader.readAsText(importFile);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Export / Import Project</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Export Project">
                    <div className="space-y-4">
                        <SelectField
                            label="Export Format"
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value as ProjectSettings['exportFormat'])}
                            options={[
                                { value: 'json', label: 'JSON (Full Project Data)' },
                                { value: 'fountain', label: 'Fountain (Screenplay Format)' },
                                { value: 'pdf', label: 'PDF (Print Format - Coming Soon)' },
                                { value: 'html', label: 'HTML (Web Preview - Coming Soon)' },
                            ]}
                        />
                        <button onClick={handleExport} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white">
                            Export Project
                        </button>
                    </div>
                </Card>
                <Card title="Import Project">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Select JSON Project File</label>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-cyan-500 file:text-white
                                hover:file:bg-cyan-600"
                            />
                        </div>
                        <button onClick={handleImport} disabled={!importFile} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-50">
                            Import Project
                        </button>
                        {importFile && <p className="text-sm text-gray-400">Selected: {importFile.name}</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};


// --- Main Application Layout ---
export const MainNavbar: React.FC<{
    activePanel: AppPanel;
    setActivePanel: (panel: AppPanel) => void;
    currentProjectName: string;
    clearActiveProject: () => void;
}> = ({ activePanel, setActivePanel, currentProjectName, clearActiveProject }) => {
    const navItems: { label: string; panel: AppPanel }[] = [
        { label: 'Dashboard', panel: 'dashboard' },
        { label: 'Script Editor', panel: 'scriptEditor' },
        { label: 'Characters', panel: 'characters' },
        { label: 'Locations', panel: 'locations' },
        { label: 'Plot Board', panel: 'plotBoard' },
        { label: 'World Builder', panel: 'worldBuilder' },
        { label: 'AI Chat', panel: 'aiChat' },
        { label: 'AI Config', panel: 'aiConfig' },
        { label: 'Settings', panel: 'projectSettings' },
        { label: 'Export/Import', panel: 'exportImport' },
    ];

    return (
        <nav className="bg-gray-900 shadow-lg p-4 sticky top-0 z-40">
            <div className="flex justify-between items-center flex-wrap">
                <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <h1 className="text-2xl font-bold text-white tracking-wider">{APP_NAME}</h1>
                    {currentProjectName && (
                        <>
                            <span className="text-gray-500 hidden sm:inline">|</span>
                            <span className="text-cyan-400 text-xl font-semibold">{currentProjectName}</span>
                            <button onClick={clearActiveProject} className="text-gray-400 hover:text-white text-sm ml-2">
                                [Change Project]
                            </button>
                        </>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                    {navItems.map(item => (
                        <button
                            key={item.panel}
                            onClick={() => setActivePanel(item.panel)}
                            className={`px-4 py-2 rounded-lg transition-colors duration-200
                                ${activePanel === item.panel
                                    ? 'bg-cyan-700 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

// --- Main NarrativeForgeView Component ---
export const NarrativeForgeView: React.FC = () => {
    const [appState, dispatch] = useReducer(appReducer, initialAppState);
    const { addNotification } = useNotifications();

    const currentProject = appState.activeProjectId
        ? appState.projects.find(p => p.id === appState.activeProjectId)
        : null;

    // Load projects from local storage on initial mount
    useEffect(() => {
        const loadedProjects = loadAppStateFromLocalStorage();
        if (loadedProjects.length > 0) {
            dispatch({ type: 'SET_PROJECTS', payload: loadedProjects });
            const lastActiveProjectId = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}lastActiveProject`);
            if (lastActiveProjectId && loadedProjects.some(p => p.id === lastActiveProjectId)) {
                dispatch({ type: 'SET_ACTIVE_PROJECT', payload: lastActiveProjectId });
                const proj = loadedProjects.find(p => p.id === lastActiveProjectId);
                if (proj && proj.settings.lastOpenedPanel) {
                    dispatch({ type: 'SET_ACTIVE_PANEL', payload: proj.settings.lastOpenedPanel });
                } else {
                    dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'scriptEditor' });
                }
            } else {
                dispatch({ type: 'SET_ACTIVE_PROJECT', payload: null });
                dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'dashboard' });
            }
        } else {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'dashboard' });
        }
    }, []);

    // Save projects to local storage whenever they change (debounced)
    const debouncedSaveState = useCallback(
        debounce((stateToSave: AppState) => {
            saveAppStateToLocalStorage(stateToSave);
            if (stateToSave.activeProjectId) {
                localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}lastActiveProject`, stateToSave.activeProjectId);
            } else {
                localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}lastActiveProject`);
            }
            addNotification("Project data autosaved!", "info");
        }, DEBOUNCE_SAVE_MS),
        [addNotification]
    );

    useEffect(() => {
        if (appState.projects.length > 0) {
            debouncedSaveState(appState);
            // Update lastOpenedPanel in settings if activePanel changes
            if (currentProject && currentProject.settings.lastOpenedPanel !== appState.activePanel) {
                dispatch({ type: 'UPDATE_PROJECT_SETTINGS', payload: { projectId: currentProject.id, settings: { lastOpenedPanel: appState.activePanel } } });
            }
        }
    }, [appState.projects, appState.activeProjectId, appState.activePanel, debouncedSaveState]);


    const handleSetActivePanel = useCallback((panel: AppPanel) => {
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: panel });
    }, []);

    const handleClearActiveProject = useCallback(() => {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: null });
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'dashboard' });
    }, []);

    const handleConfirmDelete = (entityId: string, message: string) => {
        const modalData = appState.showModal.data;
        if (modalData?.entityId !== entityId) return; // Ensure correct entity is being confirmed

        switch (appState.showModal.type) {
            case 'confirmDelete':
                if (modalData.entityId === entityId) { // Confirm it's the correct entity
                    // Determine which type of entity to delete
                    const projectToDelete = appState.projects.find(p => p.id === entityId);
                    if (projectToDelete) {
                        dispatch({ type: 'DELETE_PROJECT', payload: entityId });
                        addNotification("Project deleted permanently.", "success");
                    } else if (currentProject) {
                        // Check for other entities within the active project
                        if (currentProject.characters.some(c => c.id === entityId)) {
                            dispatch({ type: 'DELETE_CHARACTER', payload: { projectId: currentProject.id, characterId: entityId } });
                            addNotification("Character deleted.", "success");
                        } else if (currentProject.locations.some(l => l.id === entityId)) {
                            dispatch({ type: 'DELETE_LOCATION', payload: { projectId: currentProject.id, locationId: entityId } });
                            addNotification("Location deleted.", "success");
                        } else if (currentProject.scenes.some(s => s.id === entityId)) {
                            dispatch({ type: 'DELETE_SCENE', payload: { projectId: currentProject.id, sceneId: entityId } });
                            addNotification("Scene deleted.", "success");
                        } else if (currentProject.plotPoints.some(pp => pp.id === entityId)) {
                            dispatch({ type: 'DELETE_PLOT_POINT', payload: { projectId: currentProject.id, plotPointId: entityId } });
                            addNotification("Plot Point deleted.", "success");
                        } else if (currentProject.storyArcs.some(sa => sa.id === entityId)) {
                            dispatch({ type: 'DELETE_STORY_ARC', payload: { projectId: currentProject.id, storyArcId: entityId } });
                            addNotification("Story Arc deleted.", "success");
                        }
                    }
                }
                break;
            default:
                break;
        }
        dispatch({ type: 'CLOSE_MODAL' });
    };

    const renderPanel = () => {
        if (!currentProject && appState.activePanel !== 'dashboard') {
            dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'dashboard' });
            return null; // or show a message
        }

        switch (appState.activePanel) {
            case 'dashboard':
                return <DashboardPanel projects={appState.projects} activeProjectId={appState.activeProjectId} dispatch={dispatch} addNotification={addNotification} />;
            case 'scriptEditor':
                return currentProject && <ScriptEditorPanel
                    project={currentProject}
                    dispatch={dispatch}
                    currentAISuggestions={appState.currentAISuggestions}
                    isAILoading={appState.isAILoading}
                    currentAIRequestPrompt={appState.currentAIRequestPrompt}
                    addNotification={addNotification}
                />;
            case 'characters':
                return currentProject && <CharactersPanel
                    project={currentProject}
                    dispatch={dispatch}
                    isAILoading={appState.isAILoading}
                    currentAISuggestions={appState.currentAISuggestions}
                    addNotification={addNotification}
                />;
            case 'locations':
                return currentProject && <LocationsPanel
                    project={currentProject}
                    dispatch={dispatch}
                    isAILoading={appState.isAILoading}
                    currentAISuggestions={appState.currentAISuggestions}
                    addNotification={addNotification}
                />;
            case 'plotBoard':
                return currentProject && <PlotBoardPanel
                    project={currentProject}
                    dispatch={dispatch}
                    isAILoading={appState.isAILoading}
                    currentAISuggestions={appState.currentAISuggestions}
                    addNotification={addNotification}
                />;
            case 'worldBuilder':
                return currentProject && <WorldBuilderPanel
                    project={currentProject}
                    dispatch={dispatch}
                    addNotification={addNotification}
                />;
            case 'aiChat':
                return currentProject && <AIChatPanel
                    project={currentProject}
                    dispatch={dispatch}
                    isAILoading={appState.isAILoading}
                    addNotification={addNotification}
                />;
            case 'aiConfig':
                return currentProject && <AIConfigPanel
                    project={currentProject}
                    dispatch={dispatch}
                    addNotification={addNotification}
                />;
            case 'projectSettings':
                return currentProject && <ProjectSettingsPanel
                    project={currentProject}
                    dispatch={dispatch}
                    addNotification={addNotification}
                />;
            case 'exportImport':
                return currentProject && <ExportImportPanel
                    project={currentProject}
                    dispatch={dispatch}
                    addNotification={addNotification}
                />;
            default:
                return <DashboardPanel projects={appState.projects} activeProjectId={appState.activeProjectId} dispatch={dispatch} addNotification={addNotification} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <MainNavbar
                activePanel={appState.activePanel}
                setActivePanel={handleSetActivePanel}
                currentProjectName={currentProject?.name || ''}
                clearActiveProject={handleClearActiveProject}
            />
            <main className="flex-grow p-6 container mx-auto max-w-7xl">
                {renderPanel()}
            </main>

            {/* Global Modals */}
            <ProjectFormModal
                isOpen={appState.showModal.type === 'newProject' && appState.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onSubmit={(projectData) => {
                    if (projectData.id === (appState.showModal.data as Project)?.id) {
                        // Editing existing project
                        dispatch({ type: 'UPDATE_PROJECT', payload: projectData });
                        addNotification(`Project '${projectData.name}' updated.`, "success");
                    } else {
                        // Creating new project
                        const newProjectWithId = { ...projectData, id: generateUniqueId() };
                        dispatch({ type: 'ADD_PROJECT', payload: newProjectWithId });
                        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: newProjectWithId.id });
                        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'scriptEditor' });
                        addNotification("New project created!", "success");
                    }
                }}
                initialProject={appState.showModal.data as Project || emptyProject}
            />

            <ConfirmDeleteModal
                isOpen={appState.showModal.type === 'confirmDelete' && appState.showModal.isOpen}
                onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                onConfirm={() => handleConfirmDelete(appState.showModal.data?.entityId, appState.showModal.data?.message)}
                message={appState.showModal.data?.message || "Are you sure you want to delete this item?"}
            />
        </div>
    );
};

const NarrativeForgeViewWrapper: React.FC = () => (
    <NotificationProvider>
        <NarrativeForgeView />
        <NotificationContainer />
    </NotificationProvider>
);

export default NarrativeForgeViewWrapper;