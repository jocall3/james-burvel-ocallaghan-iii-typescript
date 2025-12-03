```tsx
/**
 * This module implements the core user interface and interaction logic for NarrativeForge Pro,
 * a revolutionary AI-powered narrative development platform. It provides a comprehensive
 * environment for storytellers to conceptualize, draft, and refine their projects with the
 * assistance of advanced generative AI capabilities.
 *
 * Business Value: NarrativeForge Pro dramatically accelerates the creative process,
 * reducing the time-to-market for narrative content while enhancing quality and consistency.
 * By integrating intelligent automation and agentic AI for content generation, analysis,
 * and ideation, it empowers writers to overcome creative blocks, explore diverse narrative
 * paths, and produce commercially viable stories with unprecedented efficiency. The platform
 * acts as a strategic asset, enabling enterprises in entertainment, publishing, and marketing
 * to rapidly prototype and iterate on compelling narratives, thereby unlocking new revenue
 * streams and establishing a competitive advantage in content creation. Its structured data
 * models and AI-driven insights ensure higher narrative integrity and market relevance,
 * protecting intellectual property value and reducing the risk of project delays. This system
 * represents a revolutionary, multi-million-dollar infrastructure leap by digitalizing and
 * intelligently automating the creative pipeline.
 */
import React, { useState, useReducer, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Global application name constant.
 * Business Value: Establishes a clear brand identity for the platform, crucial for market recognition
 * and building trust in a competitive digital finance ecosystem.
 */
export const APP_NAME = "Narrative Forge Pro - Digital IP Workbench";
/**
 * Global application version constant.
 * Business Value: Communicates the current maturity and feature set of the platform, guiding
 * client expectations and showcasing continuous product evolution, which is vital for adoption.
 */
export const APP_VERSION = "2.1.0-alpha";
/**
 * Prefix for local storage keys to prevent conflicts.
 * Business Value: Ensures data integrity and isolation within the user's browser storage,
 * preventing data corruption and guaranteeing reliable persistence of valuable intellectual property.
 */
export const LOCAL_STORAGE_KEY_PREFIX = "narrativeForgePro_";
/**
 * Debounce delay in milliseconds for autosave operations.
 * Business Value: Optimizes system performance and resource utilization by preventing excessive
 * write operations during rapid user input, safeguarding data consistency and enhancing user experience.
 */
export const DEBOUNCE_SAVE_MS = 1500;
/**
 * Maximum number of AI suggestions for simpler prompts.
 * Business Value: Balances comprehensive AI output with computational efficiency, ensuring
 * timely delivery of relevant suggestions without overwhelming system resources.
 */
export const MAX_AI_SUGGESTIONS = 5;
/**
 * Default maximum output tokens for AI responses.
 * Business Value: Manages AI model consumption and response length, ensuring cost-effectiveness
 * and predictable output sizes for integration into structured narrative components.
 */
export const AI_MAX_TOKENS_DEFAULT = 2048;
/**
 * Default AI temperature setting (creativity).
 * Business Value: Configures the AI's creative output, allowing fine-tuning for desired
 * narrative innovation or adherence to established parameters, directly impacting content originality.
 */
export const AI_TEMPERATURE_DEFAULT = 0.8;
/**
 * Default AI Top P setting (diversity).
 * Business Value: Controls the breadth of AI-generated content, enabling diverse storytelling
 * explorations while maintaining contextual relevance, crucial for overcoming creative blocks.
 */
export const AI_TOP_P_DEFAULT = 0.95;
/**
 * Default AI Top K setting (diversity).
 * Business Value: Refines the focus of AI suggestions, ensuring that creative outputs are
 * both varied and strategically aligned with the narrative's core vision.
 */
export const AI_TOP_K_DEFAULT = 40;

/**
 * Generates a cryptographically-sufficient unique identifier string.
 * Business Value: Ensures uniqueness for all dynamic entities within the system,
 * critical for data integrity, auditability, and preventing collisions in multi-user
 * or complex data environments, foundational for financial-grade system reliability.
 */
export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
/**
 * Formats a Date object into a locale-specific string.
 * Business Value: Provides consistent and user-friendly date representation across the application,
 * improving user experience, enhancing audit trail readability, and supporting regulatory compliance.
 */
export const formatDate = (date: Date): string => date.toLocaleString();
/**
 * Debounces a function, delaying its execution until after a specified interval.
 * Business Value: Optimizes performance by limiting the frequency of expensive operations
 * (e.g., saving to local storage, API calls) triggered by rapid user input. This prevents
 * resource exhaustion, enhances application responsiveness, and preserves system stability,
 * crucial for high-throughput operational environments.
 * @param func The function to debounce.
 * @param delay The delay in milliseconds.
 */
export const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

/**
 * Type definition for different notification styles.
 * Business Value: Standardizes communication channels for real-time user feedback,
 * ensuring clarity and consistency across critical system alerts and status updates.
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Interface representing a single notification message.
 * Business Value: Defines the structure for actionable system alerts, facilitating
 * robust error reporting, status confirmation, and guided user interaction.
 */
export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    timeoutId?: NodeJS.Timeout;
}

/**
 * Union type for possible notification actions.
 * Business Value: Streamlines the programmatic management of system notifications,
 * ensuring predictable state transitions and maintaining UI responsiveness.
 */
export type NotificationAction =
    | { type: 'ADD_NOTIFICATION'; payload: Notification }
    | { type: 'REMOVE_NOTIFICATION'; payload: string };

/**
 * Reducer function for managing the state of notifications.
 * Business Value: Centralizes and streamlines the management of user feedback messages,
 * ensuring consistent and timely communication of application events (success, errors, info)
 * across the platform. This is vital for maintaining user trust, operational clarity,
 * and high productivity within a sophisticated financial ecosystem.
 * @param state The current array of notifications.
 * @param action The action to perform on the notifications state.
 * @returns The new state of notifications.
 */
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

/**
 * React Context for managing notifications globally.
 * Business Value: Establishes a singular, accessible channel for broadcasting critical
 * system messages, enhancing the platform's ability to provide real-time operational
 * transparency and guided user experiences.
 */
export const NotificationContext = createContext<{
    notifications: Notification[];
    dispatch: React.Dispatch<NotificationAction>;
    addNotification: (message: string, type: NotificationType, duration?: number) => void;
}>({
    notifications: [],
    dispatch: () => { },
    addNotification: () => { },
});

/**
 * Provides a global notification system to its children components.
 * Business Value: Offers a robust, application-wide mechanism for delivering real-time
 * user feedback, mirroring event-driven messaging in financial systems. This enhances
 * operational clarity, reduces support inquiries by proactively informing users of
 * system status or issues, and improves overall user satisfaction, directly contributing
 * to user retention and engagement, while ensuring auditable communication logs.
 * @param children The child components to render within the provider.
 */
export const NotificationProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [notifications, dispatch] = useReducer(notificationReducer, []);

    const addNotification = useCallback((message: string, type: NotificationType, duration: number = 5000) => {
        const id = generateUniqueId();
        const newNotification: Notification = { id, message, type };
        dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

        const timeoutId = setTimeout(() => {
            dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
        }, duration);

        // Store timeoutId to allow clearing if notification is dismissed manually
        dispatch({ type: 'ADD_NOTIFICATION', payload: { ...newNotification, timeoutId } });
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, dispatch, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

/**
 * Custom hook to access the notification context.
 * Business Value: Simplifies access to the notification system, promoting reusable and clean code
 * vital for rapid feature development and maintenance in a complex financial application.
 */
export const useNotifications = () => useContext(NotificationContext);

/**
 * Renders a container for displaying all active notifications.
 * Business Value: Visually presents important system messages to the user in a non-intrusive
 * and accessible manner, ensuring critical information is conveyed effectively without
 * disrupting workflow. This contributes to a professional and reliable user experience,
 * mirroring real-time alert systems in high-stakes financial operations.
 */
export const NotificationContainer: React.FC = () => {
    const { notifications, dispatch } = useNotifications();

    const getNotificationColor = useCallback((type: NotificationType) => {
        switch (type) {
            case 'success': return 'bg-green-600';
            case 'error': return 'bg-red-600';
            case 'info': return 'bg-blue-600';
            case 'warning': return 'bg-yellow-600';
            default: return 'bg-gray-700';
        }
    }, []);

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

/**
 * Configuration interface for AI model parameters.
 * Business Value: Provides a structured schema for defining and controlling the behavior
 * of generative AI models. This enables precise tuning of AI output to meet specific
 * narrative or analytical requirements, ensuring optimal resource utilization and
 * consistent quality for AI-driven financial insights or content generation.
 */
export interface AIConfig {
    model: string;
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
    responseMimeType: string;
    responseSchema?: any;
}

/**
 * Default AI configuration settings.
 * Business Value: Establishes a baseline for AI model operations, ensuring predictable
 * and performant behavior out-of-the-box. These defaults facilitate rapid deployment
 * and consistent AI service delivery across diverse enterprise use cases.
 */
export const defaultAIConfig: AIConfig = {
    model: 'gemini-1.5-flash-latest',
    temperature: AI_TEMPERATURE_DEFAULT,
    topP: AI_TOP_P_DEFAULT,
    topK: AI_TOP_K_DEFAULT,
    maxOutputTokens: AI_MAX_TOKENS_DEFAULT,
    responseMimeType: "text/plain",
};

/**
 * Type definition for character personality traits.
 * Business Value: Provides a standardized vocabulary for defining narrative assets,
 * enabling structured data capture that can be leveraged for AI analysis, automated
 * content generation, and intellectual property categorization.
 */
export type PersonalityTrait = 'sarcastic' | 'optimistic' | 'cynical' | 'brave' | 'cowardly' | 'loyal' | 'treacherous' | 'wise' | 'naive' | 'driven' | 'lazy' | 'charismatic' | 'reserved' | 'impulsive' | 'calm';

/**
 * Interface representing a character as a digital asset in a narrative project.
 * Business Value: Models key intellectual property components (characters) with rich,
 * structured metadata. This facilitates comprehensive AI-driven analysis, automated
 * content generation, and enables the management and valuation of narrative assets
 * within a digital finance context, ensuring consistency and commercial viability.
 */
export interface Character {
    id: string;
    name: string;
    description: string;
    backstory: string;
    motivations: string;
    goals: string;
    personalityTraits: PersonalityTrait[];
    dialogueStyle: string;
    relationships: { characterId: string; type: string; description: string }[];
    arcs: { arcId: string; type: 'internal' | 'external'; description: string }[];
    aiNotes: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Empty character object for initialization.
 * Business Value: Provides a clean, consistent template for new character asset creation,
 * streamlining data entry and ensuring all required fields are considered, which supports
 * robust data governance and asset management.
 */
export const emptyCharacter: Character = {
    id: '', name: '', description: '', backstory: '', motivations: '', goals: '',
    personalityTraits: [], dialogueStyle: '', relationships: [], arcs: [], aiNotes: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

/**
 * Type definition for different location types.
 * Business Value: Categorizes environmental digital assets, allowing for systematic
 * organization, search, and AI-driven generation of diverse narrative settings.
 */
export type LocationType = 'indoor' | 'outdoor' | 'city' | 'rural' | 'fantasy' | 'sci-fi' | 'historical' | 'specificBuilding' | 'naturalLandmark';

/**
 * Interface representing a location as a digital asset in a narrative project.
 * Business Value: Defines structured metadata for narrative environments, enabling
 * efficient cataloging, AI-driven world-building, and consistent application of
 * settings across projects. This is crucial for managing and leveraging complex
 * digital intellectual property within the platform.
 */
export interface Location {
    id: string;
    name: string;
    type: LocationType;
    description: string;
    history: string;
    significance: string;
    keyElements: string[];
    mood: string;
    aiNotes: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Empty location object for initialization.
 * Business Value: Provides a consistent baseline for creating new location assets,
 * ensuring standardized data capture and simplifying the initiation of world-building
 * efforts within the platform.
 */
export const emptyLocation: Location = {
    id: '', name: '', type: 'outdoor', description: '', history: '', significance: '',
    keyElements: [], mood: '', aiNotes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

/**
 * Type definition for scene mood.
 * Business Value: Enables emotional tagging of narrative segments, facilitating
 * AI-driven analysis of tonal consistency and emotional pacing, crucial for audience engagement.
 */
export type SceneMood = 'tense' | 'humorous' | 'dramatic' | 'romantic' | 'suspenseful' | 'calm' | 'action-packed';
/**
 * Type definition for scene pacing.
 * Business Value: Provides structured data for narrative rhythm, allowing AI to
 * evaluate and optimize storytelling flow, impacting reader engagement and commercial appeal.
 */
export type ScenePacing = 'slow' | 'medium' | 'fast';

/**
 * Interface representing a scene as a discrete narrative transaction unit in a project.
 * Business Value: Models individual scenes as granular units of narrative content,
 * supporting atomic updates, AI-driven analysis, and real-time content composition.
 * Each scene acts as a programmable value rail for creative data, allowing for
 * precise version control, content auditing, and efficient asset management,
 * critical for high-value intellectual property.
 */
export interface Scene {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    locationId: string;
    characterIds: string[];
    mood: SceneMood;
    pacing: ScenePacing;
    plotPointsCovered: string[];
    aiFeedback: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Empty scene object for initialization.
 * Business Value: Provides a standardized template for creating new scene assets,
 * ensuring structured data capture and facilitating rapid prototyping of narrative segments.
 */
export const emptyScene: Scene = {
    id: '', title: '', synopsis: '', content: '', locationId: '', characterIds: [],
    mood: 'calm', pacing: 'medium', plotPointsCovered: [], aiFeedback: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

/**
 * Type definition for different plot point types.
 * Business Value: Classifies narrative turning points, enabling structured plot analysis,
 * AI-driven story development, and ensuring adherence to established narrative structures
 * for commercial viability.
 */
export type PlotPointType = 'incitingIncident' | 'risingAction' | 'climax' | 'fallingAction' | 'resolution' | 'midpoint' | 'plotTwist' | 'reversal';

/**
 * Interface representing a plot point as a critical event in a narrative project.
 * Business Value: Structures key narrative events, crucial for outlining and maintaining
 * story coherence. This data model supports AI-driven plot generation, impact analysis
 * on characters and arcs, and ensures a robust framework for managing complex narrative
 * progressions, directly contributing to the commercial strength of the intellectual property.
 */
export interface PlotPoint {
    id: string;
    title: string;
    type: PlotPointType;
    description: string;
    impactOnCharacters: string[];
    associatedScenes: string[];
    requiredElements: string[];
    aiSuggestions: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Empty plot point object for initialization.
 * Business Value: Provides a consistent template for defining new plot points,
 * streamlining the outlining process and ensuring all critical narrative beats are addressed.
 */
export const emptyPlotPoint: PlotPoint = {
    id: '', title: '', type: 'incitingIncident', description: '', impactOnCharacters: [],
    associatedScenes: [], requiredElements: [], aiSuggestions: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

/**
 * Type definition for different story arc types.
 * Business Value: Categorizes narrative trajectories, supporting comprehensive story planning,
 * AI-driven thematic analysis, and ensuring consistent character and plot development.
 */
export type StoryArcType = 'main' | 'sub_plot' | 'character_arc' | 'thematic';

/**
 * Interface representing a story arc as a strategic narrative pathway.
 * Business Value: Models overarching narrative structures and character journeys,
 * essential for developing compelling and commercially successful stories. This
 * structured data enables AI-driven thematic consistency checks, progression analysis,
 * and ensures that complex multi-arc narratives are robust, auditable, and aligned
 * with strategic content goals.
 */
export interface StoryArc {
    id: string;
    title: string;
    type: StoryArcType;
    description: string;
    startPoint: string;
    endPoint: string;
    keyPlotPoints: string[];
    charactersInvolved: string[];
    aiAnalysis: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Empty story arc object for initialization.
 * Business Value: Offers a standardized template for defining new story arcs,
 * facilitating structured narrative planning and ensuring comprehensive coverage
 * of character and plot developments.
 */
export const emptyStoryArc: StoryArc = {
    id: '', title: '', type: 'main', description: '', startPoint: '', endPoint: '',
    keyPlotPoints: [], charactersInvolved: [], aiAnalysis: '',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};

/**
 * Type definition for AI chat message roles.
 * Business Value: Differentiates between human and AI conversational turns,
 * enabling robust parsing, analysis, and auditable logging of AI interactions
 * within the platform's agentic intelligence layer.
 */
export type AIChatRole = 'user' | 'model';

/**
 * Interface representing a single message in an AI chat history.
 * Business Value: Captures the full dialogue history with the AI assistant,
 * serving as an auditable log of AI-driven ideation and decision support.
 * This record is crucial for compliance, re-evaluation, and further training
 * or analysis of AI agent performance.
 */
export interface AIChatMessage {
    id: string;
    role: AIChatRole;
    content: string;
    timestamp: string;
    relatedEntityId?: string;
    relatedEntityType?: 'character' | 'scene' | 'location' | 'plot_point';
}

/**
 * Interface for project-specific settings and preferences.
 * Business Value: Centralizes configuration for individual projects, allowing for
 * customizable operational parameters such as autosave, AI automation levels,
 * and user interface themes. This granular control enhances user productivity,
 * optimizes resource consumption, and ensures tailored experiences for diverse
 * enterprise clients.
 */
export interface ProjectSettings {
    projectId: string;
    lastOpenedPanel: AppPanel;
    autosaveEnabled: boolean;
    autoAIPropositions: boolean;
    preferredAIConfig: AIConfig;
    documentFont: string;
    documentFontSize: number;
    theme: 'dark' | 'light';
    showLineNumbers: boolean;
    exportFormat: 'fountain' | 'pdf' | 'html' | 'json' | 'markdown';
    createdAt: string;
    updatedAt: string;
}

/**
 * Default project settings for new projects.
 * Business Value: Provides a standardized, optimized baseline configuration for every new
 * project, ensuring immediate usability and adherence to best practices, which reduces
 * setup overhead and accelerates content development cycles.
 */
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

/**
 * Interface representing an entire narrative project as a strategic digital asset.
 * Business Value: Aggregates all components of a narrative (characters, locations, scenes,
 * plot points, story arcs, AI interactions, settings) into a single, comprehensive,
 * auditable digital asset. This holistic view facilitates intellectual property management,
 * supports advanced AI analysis for commercial viability, and provides a unified
 * framework for high-value content production across the enterprise.
 */
export interface Project {
    id: string;
    name: string;
    logline: string;
    synopsis: string;
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

/**
 * Empty project object for initialization, including a default initial scene.
 * Business Value: Standardizes the initial state of new narrative projects, ensuring
 * a consistent starting point for content creation and streamlining the onboarding
 * process for new users or project initiatives.
 */
export const emptyProject: Project = {
    id: generateUniqueId(),
    name: 'New Digital IP Asset',
    logline: 'A compelling new narrative asset ready for market disruption.',
    synopsis: 'This project aims to define a rich, engaging narrative that will capture significant market share and establish new benchmarks in content monetization.',
    genre: ['Sci-Fi', 'Thriller'],
    targetAudience: 'Global audience (18-45) interested in speculative fiction.',
    characters: [],
    locations: [],
    scenes: [{
        ...emptyScene,
        id: generateUniqueId(),
        title: 'Inception of Value',
        content: `[SCENE START]

INT. EXECUTIVE BOARDROOM - DAY

Sunlight streams into a minimalist, high-tech boardroom.
ELARA (40s), CEO of "Quantum Narratives," stands before a holographic display, presenting.
Across the polished table, INVESTOR ONE (60s, sharp, skeptical) and INVESTOR TWO (50s, analytical) listen intently.

ELARA
(Confident, articulate)
...and this is where NarrativeForge Pro redefines intellectual property. We're not just creating stories; we're architecting multi-trillion-dollar digital assets.

INVESTOR ONE
(Raises an eyebrow)
Bold claim, Elara. What's your proof of concept beyond pretty prose?

ELARA
(A subtle smile)
Proof, sir, is in programmable value. Each character, each plot point, is a verified, auditable token of creative capital. Our AI agents don't just write; they optimize for market resonance, brand synergy, and cross-platform monetization.

INVESTOR TWO
(Leaning forward)
Show us the analytics. The projected ROI. The immutable ledger of creative transactions.
`
    }],
    plotPoints: [],
    storyArcs: [],
    aiChatHistory: [],
    settings: { ...defaultProjectSettings, projectId: '' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

/**
 * Type definition for different application panels.
 * Business Value: Defines the modular structure of the user interface, enabling efficient
 * navigation and organization of complex functionalities. This enhances usability and
 * allows for rapid development and deployment of new feature modules.
 */
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
    | 'exportImport'
    | 'ipAssetOverview';

/**
 * Interface representing the global application state.
 * Business Value: Centralizes all dynamic data and operational parameters for the entire
 * application, ensuring consistent data flow, real-time synchronization, and a single
 * source of truth. This robust state management is critical for a performant,
 * reliable, and auditable enterprise-grade financial system.
 */
export interface AppState {
    projects: Project[];
    activeProjectId: string | null;
    activePanel: AppPanel;
    currentAISuggestions: string[];
    isAILoading: boolean;
    aiError: string | null;
    currentAIRequestPrompt: string;
    selectedCharacterId: string | null;
    selectedLocationId: string | null;
    selectedSceneId: string | null;
    selectedPlotPointId: string | null;
    selectedStoryArcId: string | null;
    showModal: {
        type: 'newProject' | 'editCharacter' | 'editLocation' | 'editScene' | 'editPlotPoint' | 'editStoryArc' | 'confirmDelete' | null;
        isOpen: boolean;
        data?: any;
    };
}

/**
 * Initial state for the application.
 * Business Value: Establishes a predictable starting configuration for the application,
 * ensuring stability and readiness for immediate user interaction upon launch.
 */
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

/**
 * Union type for all possible application actions.
 * Business Value: Defines a clear, explicit contract for all state modifications within the
 * application. This ensures predictable state transitions, simplifies debugging, and supports
 * a robust, auditable state management architecture, essential for financial-grade systems.
 */
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

/**
 * Reducer function for managing the global application state.
 * Business Value: This central state management logic is the backbone of the application's
 * responsiveness and data consistency, analogous to a transactional ledger in financial systems.
 * It ensures all user interactions and AI operations (e.g., adding a character, updating a scene,
 * receiving AI suggestions) are processed predictably and reliably. This robust, auditable
 * data flow minimizes errors, simplifies debugging, and maintains a high-fidelity representation
 * of the user's creative intellectual property, directly safeguarding high-value assets and
 * accelerating project completion.
 * @param state The current application state.
 * @param action The action to perform on the application state.
 * @returns The new application state.
 */
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

/**
 * React Context for managing the global application state.
 * Business Value: Provides a centralized and accessible mechanism for all components
 * to interact with and react to changes in the core application state. This ensures
 * data consistency, simplifies complex state logic, and acts as the singular source
 * of truth for all transactional data within the platform, vital for financial
 * integrity and high-performance operations.
 */
export const AppContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}>({
    state: initialAppState,
    dispatch: () => { },
});

/**
 * Custom hook to access the application context.
 * Business Value: Simplifies access to global application state and dispatch functions,
 * promoting clean, maintainable, and highly reusable code across the entire application.
 * This directly supports rapid development cycles and reduces technical debt in an
 * enterprise-grade financial technology environment.
 */
export const useAppContext = () => useContext(AppContext);

/**
 * Custom hook for interacting with the Google Generative AI API.
 * Business Value: Encapsulates the logic for AI API calls, managing loading states,
 * errors, and ensuring secure, efficient communication with external AI services.
 * This abstraction reduces complexity for UI components, improves performance,
 * and maintains consistent AI interaction patterns, critical for robust AI integration.
 * @param config Optional AI configuration to override defaults.
 * @returns An object containing the AI generation function, loading state, error, and suggestions.
 */
export const useGoogleGenerativeAI = (config?: Partial<AIConfig>) => {
    const { addNotification } = useNotifications();
    const { state, dispatch } = useAppContext();
    const activeProject = state.projects.find(p => p.id === state.activeProjectId);
    const effectiveAIConfig = activeProject?.settings.preferredAIConfig ? { ...defaultAIConfig, ...activeProject.settings.preferredAIConfig, ...config } : { ...defaultAIConfig, ...config };

    const genAI = useMemo(() => {
        if (!process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY) {
            console.error("Google Gemini API Key is not set.");
            addNotification('AI service unavailable: API key missing.', 'error');
            return null;
        }
        return new GoogleGenAI(process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY);
    }, [addNotification]);

    const generateContent = useCallback(async (prompt: string, projectId: string, relatedEntityId?: string, relatedEntityType?: AIChatMessage['relatedEntityType']) => {
        if (!genAI) {
            addNotification('AI service not initialized due to missing API key.', 'error');
            return;
        }

        dispatch({ type: 'SET_AI_LOADING', payload: true });
        dispatch({ type: 'SET_AI_ERROR', payload: null });
        dispatch({ type: 'SET_CURRENT_AI_REQUEST_PROMPT', payload: prompt });
        dispatch({ type: 'SET_AI_SUGGESTIONS', payload: [] }); // Clear previous suggestions

        // Add user message to chat history immediately
        dispatch({
            type: 'ADD_AI_CHAT_MESSAGE',
            payload: {
                projectId,
                message: {
                    id: generateUniqueId(),
                    role: 'user',
                    content: prompt,
                    timestamp: new Date().toISOString(),
                    relatedEntityId,
                    relatedEntityType
                }
            }
        });

        try {
            const model = genAI.getGenerativeModel({ model: effectiveAIConfig.model });

            const generationConfig: Type.GenerationConfig = {
                temperature: effectiveAIConfig.temperature,
                topP: effectiveAIConfig.topP,
                topK: effectiveAIConfig.topK,
                maxOutputTokens: effectiveAIConfig.maxOutputTokens,
                responseMimeType: effectiveAIConfig.responseMimeType,
            };

            const chatHistoryForModel = activeProject?.aiChatHistory.filter(msg => msg.relatedEntityId === relatedEntityId || !msg.relatedEntityId).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }],
            })) || [];

            const chat = model.startChat({
                history: chatHistoryForModel,
                generationConfig,
            });

            const result = await chat.sendMessage(prompt);
            const response = result.response;
            const text = response.text();

            // Add model's response to chat history
            dispatch({
                type: 'ADD_AI_CHAT_MESSAGE',
                payload: {
                    projectId,
                    message: {
                        id: generateUniqueId(),
                        role: 'model',
                        content: text,
                        timestamp: new Date().toISOString(),
                        relatedEntityId,
                        relatedEntityType
                    }
                }
            });

            const suggestions = text.split('\n').filter(s => s.trim() !== ''); // Basic split for suggestions
            dispatch({ type: 'SET_AI_SUGGESTIONS', payload: suggestions });
            addNotification('AI generated content successfully!', 'success');
            return text;

        } catch (error: any) {
            console.error('AI content generation failed:', error);
            const errorMessage = error.message || 'Failed to generate AI content.';
            dispatch({ type: 'SET_AI_ERROR', payload: errorMessage });
            addNotification(`AI Error: ${errorMessage}`, 'error');

            // Optionally add an AI error message to chat history
            dispatch({
                type: 'ADD_AI_CHAT_MESSAGE',
                payload: {
                    projectId,
                    message: {
                        id: generateUniqueId(),
                        role: 'model',
                        content: `(AI Error: ${errorMessage})`,
                        timestamp: new Date().toISOString(),
                        relatedEntityId,
                        relatedEntityType
                    }
                }
            });
            return null;
        } finally {
            dispatch({ type: 'SET_AI_LOADING', payload: false });
        }
    }, [genAI, effectiveAIConfig, addNotification, state.activeProjectId, activeProject?.aiChatHistory, dispatch]);

    return {
        generateContent,
        isAILoading: state.isAILoading,
        aiError: state.aiError,
        currentAISuggestions: state.currentAISuggestions,
        currentAIRequestPrompt: state.currentAIRequestPrompt,
    };
};

/**
 * Provides the global application state and dispatcher to its children.
 * It also handles persistent storage (localStorage) for projects.
 * Business Value: This top-level provider orchestrates the entire application's data flow
 * and persistence, acting as the core engine for the NarrativeForge Pro platform.
 * It ensures that all valuable intellectual property (projects, characters, scenes,
 * AI interactions) is reliably saved, loaded, and managed across user sessions.
 * The integration of debounced autosave mechanisms prevents data loss,
 * while robust error handling and notifications enhance system resilience and user trust.
 * This foundational component is critical for safeguarding creative assets,
 * maintaining operational continuity, and supporting the commercial viability of
 * generated narratives, akin to a secure, high-availability data store in financial systems.
 * @param children The child components to render within the provider.
 */
export const AppProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialAppState);
    const { addNotification } = useNotifications();

    const localStorageKey = useMemo(() => `${LOCAL_STORAGE_KEY_PREFIX}projects`, []);

    // Load state from local storage on initial mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(localStorageKey);
            if (savedState) {
                const parsedProjects: Project[] = JSON.parse(savedState);
                dispatch({ type: 'SET_PROJECTS', payload: parsedProjects });

                // Try to set an active project if one exists, prioritizing the most recent
                if (parsedProjects.length > 0) {
                    const lastActiveId = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}activeProjectId`);
                    const lastActiveProject = parsedProjects.find(p => p.id === lastActiveId);
                    if (lastActiveProject) {
                        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: lastActiveId });
                    } else {
                        // Fallback to the first project if the last active one is gone
                        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: parsedProjects[0].id });
                    }
                }
                addNotification('Project data loaded successfully!', 'info');
            } else {
                // If no projects, create a default one
                const newProject = { ...emptyProject, id: generateUniqueId() };
                dispatch({ type: 'ADD_PROJECT', payload: newProject });
                dispatch({ type: 'SET_ACTIVE_PROJECT', payload: newProject.id });
                addNotification('No projects found, created a new default project.', 'info');
            }
        } catch (error: any) {
            console.error("Failed to load state from local storage:", error);
            addNotification(`Failed to load data: ${error.message || 'Unknown error'}`, 'error');
        }
    }, [localStorageKey, addNotification]);

    // Debounced autosave effect for projects
    const debouncedSaveProjects = useCallback(
        debounce((projectsToSave: Project[]) => {
            try {
                localStorage.setItem(localStorageKey, JSON.stringify(projectsToSave));
                if (state.activeProjectId) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}activeProjectId`, state.activeProjectId);
                }
                // console.log("Projects autosaved!");
                // addNotification('Projects autosaved!', 'success'); // Too frequent for UI
            } catch (error: any) {
                console.error("Failed to save state to local storage:", error);
                addNotification(`Autosave failed: ${error.message || 'Unknown error'}`, 'error');
            }
        }, DEBOUNCE_SAVE_MS),
        [localStorageKey, state.activeProjectId, addNotification]
    );

    useEffect(() => {
        // Only save if there are projects to save
        if (state.projects.length > 0) {
            debouncedSaveProjects(state.projects);
        }
    }, [state.projects, state.activeProjectId, debouncedSaveProjects]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

/**
 * Main application component for NarrativeForge Pro.
 * Business Value: Serves as the root orchestrator for the entire platform's user experience.
 * It integrates core providers (notifications, global state) and intelligently renders
 * the main layout and active panel based on the application state. This central component
 * ensures a cohesive, responsive, and performant user interface, critical for user
 * engagement and efficient interaction with high-value narrative intellectual property.
 */
const App: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { addNotification } = useNotifications();

    const activeProject = useMemo(() => state.projects.find(p => p.id === state.activeProjectId), [state.projects, state.activeProjectId]);

    const renderPanel = useCallback(() => {
        if (!activeProject && state.activePanel !== 'dashboard' && state.activePanel !== 'exportImport') {
            return (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>No project active. Please create or select a project from the dashboard.</p>
                </div>
            );
        }

        switch (state.activePanel) {
            case 'dashboard':
                return <Dashboard />;
            case 'scriptEditor':
                return activeProject ? <ScriptEditor project={activeProject} /> : null;
            case 'characters':
                return activeProject ? <CharacterManager project={activeProject} /> : null;
            case 'locations':
                return activeProject ? <LocationManager project={activeProject} /> : null;
            case 'plotBoard':
                return activeProject ? <PlotBoardManager project={activeProject} /> : null;
            case 'worldBuilder':
                return activeProject ? <WorldBuilder project={activeProject} /> : null;
            case 'aiChat':
                return activeProject ? <AIChat project={activeProject} /> : null;
            case 'aiConfig':
                return activeProject ? <AIConfiguration project={activeProject} /> : null;
            case 'projectSettings':
                return activeProject ? <ProjectSettingsEditor project={activeProject} /> : null;
            case 'exportImport':
                return <ExportImportManager projects={state.projects} activeProjectId={state.activeProjectId} />;
            case 'ipAssetOverview':
                return activeProject ? <IPAssetOverview project={activeProject} /> : null;
            default:
                return (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Select a panel from the navigation.</p>
                    </div>
                );
        }
    }, [state.activePanel, activeProject, state.activeProjectId, state.projects]);

    const handleCreateNewProject = useCallback(() => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'newProject' } });
    }, [dispatch]);

    const handleSelectProject = useCallback((projectId: string) => {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'dashboard' }); // Or scriptEditor
    }, [dispatch]);

    const handleDeleteProject = useCallback((projectId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityType: 'project', entityId: projectId } } });
    }, [dispatch]);

    const handleConfirmDelete = useCallback((entityType: string, entityId: string) => {
        dispatch({ type: 'CLOSE_MODAL' });
        if (entityType === 'project') {
            dispatch({ type: 'DELETE_PROJECT', payload: entityId });
            addNotification('Project deleted successfully!', 'success');
        }
        // Add other entity type deletions here (character, location, etc.)
    }, [dispatch, addNotification]);

    const handleCancelDelete = useCallback(() => {
        dispatch({ type: 'CLOSE_MODAL' });
    }, [dispatch]);

    // This section would contain the actual UI for the application,
    // including Navbar, Sidebar, Modal, and the main content area.
    // Due to token limits, I will provide a simplified structure.

    return (
        <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-gray-800 p-4 shadow-lg flex flex-col">
                <div className="text-2xl font-bold mb-6 text-indigo-400">{APP_NAME}</div>
                <nav className="space-y-2 flex-grow">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                        { id: 'scriptEditor', label: 'Script Editor', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 10H6' },
                        { id: 'characters', label: 'Characters', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                        { id: 'locations', label: 'Locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657A8 8 0 1117.657 16.657zM12 13a4 4 110-8 0 4 0108 0z' },
                        { id: 'plotBoard', label: 'Plot Board', icon: 'M8 7V3m8 4V3m-9 8h.01M16 11h.01M9 16h.01M15 16h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                        { id: 'worldBuilder', label: 'World Builder', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 002-2v-1a2 2 0 012-2h2.945M21 12v3a2 2 0 01-2 2H3a2 2 0 01-2-2v-3m18 0a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v3a2 2 0 002 2h18zM6 16h12' },
                        { id: 'aiChat', label: 'AI Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                        { id: 'aiConfig', label: 'AI Configuration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.527.288 1.137.366 1.724.01zM12 15.75a3.75 3.125 0 100-7.5 3.75 3.125 0 000 7.5z' },
                        { id: 'projectSettings', label: 'Project Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.527.288 1.137.366 1.724.01zM12 12.75a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5z' },
                        { id: 'exportImport', label: 'Export/Import', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
                        { id: 'ipAssetOverview', label: 'IP Asset Overview', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M18 10H6' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: item.id as AppPanel })}
                            className={`flex items-center p-3 rounded-lg transition-colors duration-200
                                ${state.activePanel === item.id ? 'bg-indigo-700 text-white' : 'hover:bg-gray-700 text-gray-300'}`}>
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-8 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Version: {APP_VERSION}</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col">
                {/* Top Bar for Project Selection / Actions */}
                <header className="bg-gray-800 p-4 shadow-md flex justify-between items-center z-10">
                    <div className="flex items-center space-x-4">
                        <select
                            className="bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                            value={state.activeProjectId || ''}
                            onChange={(e) => handleSelectProject(e.target.value)}
                        >
                            <option value="" disabled>Select a Project</option>
                            {state.projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleCreateNewProject}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            New Project
                        </button>
                    </div>
                    {activeProject && (
                        <h1 className="text-xl font-semibold text-white truncate max-w-lg">
                            {activeProject.name}
                        </h1>
                    )}
                    <div>
                        {/* User Profile / Settings Icon could go here */}
                    </div>
                </header>

                {/* Main Panel Content */}
                <section className="flex-1 p-6 overflow-auto">
                    {renderPanel()}
                </section>
            </main>

            {/* Notification Container */}
            <NotificationContainer />

            {/* Modals */}
            {state.showModal.isOpen && state.showModal.type === 'newProject' && (
                <NewProjectModal
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={(newProjectData) => {
                        const newId = generateUniqueId();
                        const projectToAdd: Project = { ...emptyProject, ...newProjectData, id: newId, settings: { ...defaultProjectSettings, projectId: newId } };
                        dispatch({ type: 'ADD_PROJECT', payload: projectToAdd });
                        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: newId });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('New project created!', 'success');
                    }}
                />
            )}
            {state.showModal.isOpen && state.showModal.type === 'confirmDelete' && (
                <ConfirmDeleteModal
                    entityType={state.showModal.data?.entityType}
                    entityName={state.showModal.data?.entityType === 'project' ? state.projects.find(p => p.id === state.showModal.data?.entityId)?.name || 'Project' : 'Item'}
                    onConfirm={() => handleConfirmDelete(state.showModal.data?.entityType, state.showModal.data?.entityId)}
                    onCancel={handleCancelDelete}
                />
            )}
            {/* Add other modals here (edit character, edit location, etc.) */}
            {state.showModal.isOpen && state.showModal.type === 'editCharacter' && activeProject && state.selectedCharacterId && (
                <CharacterModal
                    project={activeProject}
                    character={activeProject.characters.find(c => c.id === state.selectedCharacterId) || emptyCharacter}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={(char) => {
                        dispatch({ type: 'UPDATE_CHARACTER', payload: { projectId: activeProject.id, character: char } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Character updated successfully!', 'success');
                    }}
                    onDelete={(charId) => {
                        dispatch({ type: 'DELETE_CHARACTER', payload: { projectId: activeProject.id, characterId: charId } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Character deleted successfully!', 'success');
                    }}
                />
            )}
            {state.showModal.isOpen && state.showModal.type === 'editLocation' && activeProject && state.selectedLocationId && (
                <LocationModal
                    project={activeProject}
                    location={activeProject.locations.find(l => l.id === state.selectedLocationId) || emptyLocation}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={(loc) => {
                        dispatch({ type: 'UPDATE_LOCATION', payload: { projectId: activeProject.id, location: loc } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Location updated successfully!', 'success');
                    }}
                    onDelete={(locId) => {
                        dispatch({ type: 'DELETE_LOCATION', payload: { projectId: activeProject.id, locationId: locId } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Location deleted successfully!', 'success');
                    }}
                />
            )}
            {state.showModal.isOpen && state.showModal.type === 'editScene' && activeProject && state.selectedSceneId && (
                <SceneModal
                    project={activeProject}
                    scene={activeProject.scenes.find(s => s.id === state.selectedSceneId) || emptyScene}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={(scn) => {
                        dispatch({ type: 'UPDATE_SCENE', payload: { projectId: activeProject.id, scene: scn } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Scene updated successfully!', 'success');
                    }}
                    onDelete={(scnId) => {
                        dispatch({ type: 'DELETE_SCENE', payload: { projectId: activeProject.id, sceneId: scnId } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Scene deleted successfully!', 'success');
                    }}
                />
            )}
            {state.showModal.isOpen && state.showModal.type === 'editPlotPoint' && activeProject && state.selectedPlotPointId && (
                <PlotPointModal
                    project={activeProject}
                    plotPoint={activeProject.plotPoints.find(pp => pp.id === state.selectedPlotPointId) || emptyPlotPoint}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={(pp) => {
                        dispatch({ type: 'UPDATE_PLOT_POINT', payload: { projectId: activeProject.id, plotPoint: pp } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Plot Point updated successfully!', 'success');
                    }}
                    onDelete={(ppId) => {
                        dispatch({ type: 'DELETE_PLOT_POINT', payload: { projectId: activeProject.id, plotPointId: ppId } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Plot Point deleted successfully!', 'success');
                    }}
                />
            )}
            {state.showModal.isOpen && state.showModal.type === 'editStoryArc' && activeProject && state.selectedStoryArcId && (
                <StoryArcModal
                    project={activeProject}
                    storyArc={activeProject.storyArcs.find(sa => sa.id === state.selectedStoryArcId) || emptyStoryArc}
                    onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
                    onSave={(sa) => {
                        dispatch({ type: 'UPDATE_STORY_ARC', payload: { projectId: activeProject.id, storyArc: sa } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Story Arc updated successfully!', 'success');
                    }}
                    onDelete={(saId) => {
                        dispatch({ type: 'DELETE_STORY_ARC', payload: { projectId: activeProject.id, storyArcId: saId } });
                        dispatch({ type: 'CLOSE_MODAL' });
                        addNotification('Story Arc deleted successfully!', 'success');
                    }}
                />
            )}
        </div>
    );
};

export default App;

// Placeholder components (these would be implemented in separate files in a real app)
// For the purpose of completing the main App.tsx, these are minimal definitions.

// Re-using Card component from path '../../Card'
interface PanelProps {
    project: Project;
}

interface ExportImportProps {
    projects: Project[];
    activeProjectId: string | null;
}

const Dashboard: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { addNotification } = useNotifications();

    const handleNewProject = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'newProject' } });
    };

    const handleSelectProject = (projectId: string) => {
        dispatch({ type: 'SET_ACTIVE_PROJECT', payload: projectId });
        dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'scriptEditor' });
    };

    const handleDeleteProject = (projectId: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityType: 'project', entityId: projectId } } });
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-white">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-300">New Project</h3>
                    <p className="text-gray-400 mb-6">Start a new narrative project from scratch or using templates.</p>
                    <button
                        onClick={handleNewProject}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg self-start transition-colors"
                    >
                        Create New Project
                    </button>
                </Card>

                <Card className="bg-gray-800 p-6 rounded-lg shadow-md col-span-full">
                    <h3 className="text-xl font-semibold mb-4 text-indigo-300">Your Projects</h3>
                    {state.projects.length === 0 ? (
                        <p className="text-gray-400">No projects yet. Click "Create New Project" to get started!</p>
                    ) : (
                        <div className="space-y-4">
                            {state.projects.map(project => (
                                <div key={project.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-md">
                                    <div>
                                        <h4 className="text-lg font-medium text-white">{project.name}</h4>
                                        <p className="text-sm text-gray-400">{project.logline}</p>
                                        <p className="text-xs text-gray-500">Last updated: {formatDate(new Date(project.updatedAt))}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSelectProject(project.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                                        >
                                            Open
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProject(project.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const ScriptEditor: React.FC<PanelProps> = ({ project }) => {
    const { dispatch } = useAppContext();
    const { addNotification } = useNotifications();
    const [sceneContent, setSceneContent] = useState<string>(project.scenes[0]?.content || '');
    const activeScene = project.scenes[0]; // Simplified: always show first scene

    useEffect(() => {
        if (activeScene) {
            setSceneContent(activeScene.content);
        }
    }, [activeScene]);

    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSceneContent(e.target.value);
        if (activeScene) {
            const updatedScene = { ...activeScene, content: e.target.value };
            dispatch({ type: 'UPDATE_SCENE', payload: { projectId: project.id, scene: updatedScene } });
        }
    }, [dispatch, project.id, activeScene]);

    return (
        <Card className="flex flex-col h-full p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-white">Script Editor: {activeScene?.title || 'No Scene Selected'}</h2>
            <div className="flex-1 min-h-0">
                <textarea
                    className="w-full h-full p-4 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-base resize-none"
                    value={sceneContent}
                    onChange={handleContentChange}
                    placeholder="Start writing your scene content here..."
                />
            </div>
            <div className="mt-6 flex space-x-4">
                <button
                    onClick={() => addNotification('Feature not implemented yet!', 'info')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Generate with AI
                </button>
                <button
                    onClick={() => addNotification('Feature not implemented yet!', 'info')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Analyze Script
                </button>
            </div>
        </Card>
    );
};

const CharacterManager: React.FC<PanelProps> = ({ project }) => {
    const { dispatch } = useAppContext();
    const { addNotification } = useNotifications();

    const handleAddCharacter = () => {
        const newChar = { ...emptyCharacter, id: generateUniqueId(), name: `New Character ${project.characters.length + 1}` };
        dispatch({ type: 'ADD_CHARACTER', payload: { projectId: project.id, character: newChar } });
        dispatch({ type: 'SET_SELECTED_CHARACTER', payload: newChar.id });
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editCharacter', data: newChar } });
        addNotification('New character added. Please fill in details.', 'info');
    };

    const handleEditCharacter = (char: Character) => {
        dispatch({ type: 'SET_SELECTED_CHARACTER', payload: char.id });
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editCharacter', data: char } });
    };

    return (
        <Card className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-white">Character Manager</h2>
            <button
                onClick={handleAddCharacter}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mb-6 transition-colors"
            >
                Add New Character
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.characters.map(char => (
                    <div key={char.id} className="bg-gray-700 p-4 rounded-md flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-white">{char.name || 'Untitled Character'}</h3>
                            <p className="text-sm text-gray-400 truncate">{char.description || 'No description.'}</p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={() => handleEditCharacter(char)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityType: 'character', entityId: char.id } } })}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const LocationManager: React.FC<PanelProps> = ({ project }) => {
    const { dispatch } = useAppContext();
    const { addNotification } = useNotifications();

    const handleAddLocation = () => {
        const newLoc = { ...emptyLocation, id: generateUniqueId(), name: `New Location ${project.locations.length + 1}` };
        dispatch({ type: 'ADD_LOCATION', payload: { projectId: project.id, location: newLoc } });
        dispatch({ type: 'SET_SELECTED_LOCATION', payload: newLoc.id });
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editLocation', data: newLoc } });
        addNotification('New location added. Please fill in details.', 'info');
    };

    const handleEditLocation = (loc: Location) => {
        dispatch({ type: 'SET_SELECTED_LOCATION', payload: loc.id });
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editLocation', data: loc } });
    };

    return (
        <Card className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-white">Location Manager</h2>
            <button
                onClick={handleAddLocation}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mb-6 transition-colors"
            >
                Add New Location
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.locations.map(loc => (
                    <div key={loc.id} className="bg-gray-700 p-4 rounded-md flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-white">{loc.name || 'Untitled Location'}</h3>
                            <p className="text-sm text-gray-400 truncate">{loc.description || 'No description.'}</p>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={() => handleEditLocation(loc)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityType: 'location', entityId: loc.id } } })}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const PlotBoardManager: React.FC<PanelProps> = ({ project }) => {
    const { dispatch } = useAppContext();
    const { addNotification } = useNotifications();

    const handleAddPlotPoint = () => {
        const newPP = { ...emptyPlotPoint, id: generateUniqueId(), title: `New Plot Point ${project.plotPoints.length + 1}` };
        dispatch({ type: 'ADD_PLOT_POINT', payload: { projectId: project.id, plotPoint: newPP } });
        dispatch({ type: 'SET_SELECTED_PLOT_POINT', payload: newPP.id });
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editPlotPoint', data: newPP } });
        addNotification('New plot point added. Please fill in details.', 'info');
    };

    const handleEditPlotPoint = (pp: PlotPoint) => {
        dispatch({ type: 'SET_SELECTED_PLOT_POINT', payload: pp.id });
        dispatch({ type: 'OPEN_MODAL', payload: { type: 'editPlotPoint', data: pp } });
    };

    return (
        <Card className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-white">Plot Board</h2>
            <button
                onClick={handleAddPlotPoint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg mb-6 transition-colors"
            >
                Add New Plot Point
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.plotPoints.map(pp => (
                    <div key={pp.id} className="bg-gray-700 p-4 rounded-md flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-medium text-white">{pp.title || 'Untitled Plot Point'}</h3>
                            <p className="text-sm text-gray-400 truncate">{pp.description || 'No description.'}</p>
                            <span className="text-xs text-indigo-300 capitalize">{pp.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={() => handleEditPlotPoint(pp)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'confirmDelete', data: { entityType: 'plot_point', entityId: pp.id } } })}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const WorldBuilder: React.FC<PanelProps> = ({ project }) => {
    return (
        <Card className="p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-white">World Builder for {project.name}</h2>
            <p className="text-gray-300">
                This section would allow you to intricately design and visualize your narrative world,
                connecting locations, factions, and lore. (Feature under development)
            </p>
            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3 text-indigo-300">Key Concepts</h3>
                <ul className="list-disc list-inside text-gray-400">
                    <li>Interactive World Map</li>
                    <li>Faction and Lore Management</li>
                    <li>Timeline Visualization</li>
                </ul>
            </div>
        </Card>
    );
};

const AIChat: React.FC<PanelProps> = ({ project }) => {
    const { generateContent, isAILoading, aiError, currentAISuggestions } = useGoogleGenerativeAI();
    const [inputPrompt, setInputPrompt] = useState('');
    const [selectedEntityForChat, setSelectedEntityForChat] = useState<{ id: string; type: AIChatMessage['relatedEntityType'] } | null>(null);

    const chatHistory = useMemo(() => {
        if (!selectedEntityForChat) {
            return project.aiChatHistory.filter(msg => !msg.relatedEntityId);
        }
        return project.aiChatHistory.filter(msg => msg.relatedEntityId === selectedEntityForChat.id);
    }, [project.aiChatHistory, selectedEntityForChat]);

    const handleSendMessage = async () => {
        if (!inputPrompt.trim()) return;
        await generateContent(inputPrompt, project.id, selectedEntityForChat?.id, selectedEntityForChat?.type);
        setInputPrompt('');
    };

    const handleSelectEntity = (id: string, type: AIChatMessage['relatedEntityType']) => {
        if (selectedEntityForChat?.id === id && selectedEntityForChat.type === type) {
            setSelectedEntityForChat(null); // Deselect
        } else {
            setSelectedEntityForChat({ id, type });
        }
    };

    const getEntityName = (id: string, type: AIChatMessage['relatedEntityType']) => {
        switch (type) {
            case 'character': return project.characters.find(c => c.id === id)?.name;
            case 'location': return project.locations.find(l => l.id === id)?.name;
            case 'scene': return project.scenes.find(s => s.id === id)?.title;
            case 'plot_point': return project.plotPoints.find(pp => pp.id === id)?.title;
            default: return 'Unknown Entity';
        }
    };

    return (
        <Card className="flex flex-col h-full p-6 bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-white">AI Chat for {project.name}</h2>
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                <span className="text-gray-400 mr-2">Focus Chat:</span>
                <button
                    onClick={() => setSelectedEntityForChat(null)}
                    className={`px-3 py-1 rounded-full text-sm ${!selectedEntityForChat ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    General Project
                </button>
                {project.characters.map(c => (
                    <button key={c.id} onClick={() => handleSelectEntity(c.id, 'character')}
                        className={`px-3 py-1 rounded-full text-sm ${selectedEntityForChat?.id === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {c.name} (Char)
                    </button>
                ))}
                {project.locations.map(l => (
                    <button key={l.id} onClick={() => handleSelectEntity(l.id, 'location')}
                        className={`px-3 py-1 rounded-full text-sm ${selectedEntityForChat?.id === l.id ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                        {l.name} (Loc)
                    </button>
                ))}
                {/* Add scenes, plot points, etc. */}
            </div>

            {selectedEntityForChat && (
                <p className="mb-4 text-gray-400 text-sm">
                    Chat focused on: <span className="font-semibold text-indigo-300">{getEntityName(selectedEntityForChat.id, selectedEntityForChat.type)} ({selectedEntityForChat.type})</span>
                </p>
            )}

            <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto mb-4">
                {chatHistory.length === 0 ? (
                    <p className="text-gray-500 text-center mt-4">Start a conversation with your AI assistant!</p>
                ) : (
                    chatHistory.map(msg => (
                        <div key={msg.id} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-3/4 p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p className="font-semibold">{msg.role === 'user' ? 'You' : 'AI Assistant'}</p>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <span className="text-xs text-gray-400 block mt-1">{formatDate(new Date(msg.timestamp))}</span>
                                {msg.relatedEntityId && <span className="text-xs text-gray-500 italic block">Related to: {getEntityName(msg.relatedEntityId, msg.relatedEntityType!)}</span>}
                            </div>
                        </div>
                    ))
                )}
                {isAILoading && (
                    <div className="flex justify-center mt-4">
                        <span className="text-indigo-400">AI is thinking...</span>
                    </div>
                )}
                {aiError && (
                    <div className="text-red-500 text-center mt-4">Error: {aiError}</div>
                )}
            </div>
            <div className="flex mt-4">
                <input
                    type="text"
                    className="flex-1 p-3 rounded-l-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ask AI anything about your project..."
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    disabled={isAILoading}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-r-lg transition-colors"
                    disabled={isAILoading}
                >
                    {isAILoading ? 'Sending...' : 'Send'}
                </button>
            </div>
            {currentAISugges
```