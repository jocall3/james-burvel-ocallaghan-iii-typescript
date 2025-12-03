# The Personalization

This is the studio of the self. The space where the inner landscape is projected onto the outer vessel. It is the act of shaping your environment to be a true reflection of your inner state. To personalize is to attune your reality to your own frequency, creating a world that resonates in perfect harmony with the vision you hold within.

---

### A Fable for the Builder: The Color of the Sky

(They say you cannot change the world. That you can only change yourself. We thought, why not both? This `Personalization` view is a testament to that idea. It is the place where you, the creator, are given the power to change the very color of the sky in your own digital world.)

(A simple background image may seem trivial. A cosmetic choice. But we saw it as something deeper. It is an act of claiming a space, of making it your own. It is the difference between a sterile, generic hotel room and your own home. We wanted this Instrument to feel like home.)

(But we wanted to give you more than just a paintbrush. We wanted to give you a muse. That is the purpose of the `AI Background Generator`. You do not have to be an artist. You only need to have a feeling, an idea, a dream. You speak that dream into the promptâ€”"an isolated lighthouse on a stormy sea"â€”and the AI becomes your hands. It translates your feeling into light and color, and projects it onto the canvas of your world.)

(This is a profound partnership. The AI does not create on its own. It requires the spark of your intent. It is a tool for the manifestation of your inner landscape. The choice of the 'Aurora Illusion' is another path. It is for those who prefer their world not to be static, but to be alive, dynamic, a constant, gentle flow of color and light.)

(This is our 'Aesthetic Resonance' principle. We believe that the environment in which you think affects the quality of your thoughts. By giving you the power to shape this environment, to make it a true reflection of your inner state, we believe we are helping you to think more clearly, more creatively, more powerfully. It is a simple truth: a person who feels at home in their world is a person who can do great things within it.)

---
import React, { 
    useState, 
    useEffect, 
    useCallback, 
    useMemo, 
    createContext, 
    useContext, 
    useReducer, 
    useRef, 
    FC, 
    ReactNode,
    CSSProperties,
    ChangeEvent,
    DragEvent
} from 'react';
import { DndProvider, useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { throttle } from 'lodash';

// --- SECTION 1: TYPE DEFINITIONS ---

/**
 * Represents the configuration for a single widget on the dashboard.
 */
export type WidgetConfig = {
    id: string;
    name: string;
    enabled: boolean;
    component: string; // Identifier for the component to render
};

/**
 * Options for the Aurora dynamic background.
 */
export type AuroraOptions = {
    speed: number; // 0-100
    complexity: number; // 0-100
    colorPalette: string[];
};

/**
 * Options for the Waves dynamic background.
 */
export type WavesOptions = {
    speed: number; // 0-100
    amplitude: number; // 0-100
    color: string;
};

/**
 * Options for the Starfield dynamic background.
 */
export type StarfieldOptions = {
    starCount: number; // 50-1000
    speed: number; // 0-100
};

/**
 * The main state object for all personalization settings.
 */
export type PersonalizationState = {
    theme: {
        mode: 'light' | 'dark' | 'system';
        primaryColor: string;
        accentColor: string;
        fontFamily: 'sans-serif' | 'serif' | 'monospace';
        fontSize: number; // in rem
        uiDensity: 'compact' | 'comfortable' | 'spacious';
    };
    background: {
        type: 'solid' | 'image' | 'ai' | 'dynamic';
        solid: {
            color: string;
        };
        image: {
            url: string;
            blur: number; // 0-100
            brightness: number; // 0-100
            position: 'cover' | 'contain' | 'tile';
        };
        ai: {
            prompt: string;
            negativePrompt: string;
            style: string;
            history: { prompt: string; url: string; timestamp: number }[];
            isGenerating: boolean;
            error: string | null;
            currentImageUrl: string | null;
        };
        dynamic: {
            type: 'aurora' | 'waves' | 'starfield';
            options: AuroraOptions | WavesOptions | StarfieldOptions;
        };
    };
    layout: {
        sidebarPosition: 'left' | 'right';
        widgets: WidgetConfig[];
    };
    sound: {
        enabled: boolean;
        volume: number; // 0-100
        theme: 'default' | 'calm' | 'tech';
    };
    accessibility: {
        highContrast: boolean;
        reduceMotion: boolean;
    };
    metadata: {
        lastSaved: number | null;
        hasUnsavedChanges: boolean;
    };
};

/**
 * Action types for the personalization reducer.
 */
export type PersonalizationAction =
    | { type: 'SET_STATE'; payload: PersonalizationState }
    | { type: 'SET_THEME_MODE'; payload: 'light' | 'dark' | 'system' }
    | { type: 'SET_PRIMARY_COLOR'; payload: string }
    | { type: 'SET_ACCENT_COLOR'; payload: string }
    | { type: 'SET_FONT_FAMILY'; payload: 'sans-serif' | 'serif' | 'monospace' }
    | { type: 'SET_FONT_SIZE'; payload: number }
    | { type: 'SET_UI_DENSITY'; payload: 'compact' | 'comfortable' | 'spacious' }
    | { type: 'SET_BACKGROUND_TYPE'; payload: 'solid' | 'image' | 'ai' | 'dynamic' }
    | { type: 'SET_SOLID_BACKGROUND_COLOR'; payload: string }
    | { type: 'SET_IMAGE_BACKGROUND_URL'; payload: string }
    | { type: 'SET_IMAGE_BACKGROUND_BLUR'; payload: number }
    | { type: 'SET_IMAGE_BACKGROUND_BRIGHTNESS'; payload: number }
    | { type: 'SET_IMAGE_BACKGROUND_POSITION'; payload: 'cover' | 'contain' | 'tile' }
    | { type: 'SET_AI_PROMPT'; payload: string }
    | { type: 'SET_AI_NEGATIVE_PROMPT'; payload: string }
    | { type: 'SET_AI_STYLE'; payload: string }
    | { type: 'START_AI_GENERATION' }
    | { type: 'AI_GENERATION_SUCCESS'; payload: { url: string; prompt: string } }
    | { type: 'AI_GENERATION_FAILURE'; payload: string }
    | { type: 'SET_AI_BACKGROUND_IMAGE'; payload: string }
    | { type: 'CLEAR_AI_HISTORY' }
    | { type: 'SET_DYNAMIC_BACKGROUND_TYPE'; payload: 'aurora' | 'waves' | 'starfield' }
    | { type: 'UPDATE_DYNAMIC_BACKGROUND_OPTIONS'; payload: Partial<AuroraOptions | WavesOptions | StarfieldOptions> }
    | { type: 'SET_SIDEBAR_POSITION'; payload: 'left' | 'right' }
    | { type: 'REORDER_WIDGETS'; payload: { dragIndex: number; hoverIndex: number } }
    | { type: 'TOGGLE_WIDGET'; payload: string } // by widget id
    | { type: 'SET_SOUND_ENABLED'; payload: boolean }
    | { type: 'SET_SOUND_VOLUME'; payload: number }
    | { type: 'SET_SOUND_THEME'; payload: 'default' | 'calm' | 'tech' }
    | { type: 'SET_HIGH_CONTRAST'; payload: boolean }
    | { type: 'SET_REDUCE_MOTION'; payload: boolean }
    | { type: 'RESET_TO_DEFAULTS' }
    | { type: 'SAVE_SETTINGS_START' }
    | { type: 'SAVE_SETTINGS_SUCCESS' }
    | { type: 'SAVE_SETTINGS_FAILURE' };


/**
 * The shape of the personalization context.
 */
export interface PersonalizationContextType {
    state: PersonalizationState;
    dispatch: React.Dispatch<PersonalizationAction>;
    isSaving: boolean;
    saveError: string | null;
    saveSettings: () => void;
}

// --- SECTION 2: MOCK DATA & API LAYER ---

export const AI_ART_STYLES = [
    'Photorealistic', 'Oil Painting', 'Watercolor', 'Cyberpunk', 'Steampunk', 'Anime',
    'Concept Art', 'Surrealism', 'Minimalist', 'Impressionism', 'Art Deco'
];

export const DYNAMIC_BACKGROUND_PALETTES = {
    aurora: [
        '#00ff99', '#00ccff', '#9933ff', '#ff3399', '#00ff99'
    ],
    sunset: [
        '#ff5e00', '#ff9900', '#ffcc00', '#ff9900', '#ff5e00'
    ],
    ocean: [
        '#003366', '#006699', '#0099cc', '#33ccff', '#0099cc'
    ]
};

/**
 * Simulates calling an AI image generation API.
 * @param prompt The user's text prompt.
 * @param style The selected art style.
 * @returns A promise that resolves to a URL of a generated image.
 */
export const mockGenerateImageAPI = (prompt: string, style: string): Promise<{ url: string }> => {
    console.log(`Generating image for prompt: "${prompt}" with style: "${style}"`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (prompt.toLowerCase().includes('error')) {
                reject(new Error("Failed to generate image due to an explicit error request."));
                return;
            }
            const seed = Math.random().toString(36).substring(7);
            const url = `https://picsum.photos/seed/${seed}/1920/1080`;
            console.log(`Generated image URL: ${url}`);
            resolve({ url });
        }, 2500); // Simulate network latency
    });
};

/**
 * Simulates fetching inspirational prompts.
 * @returns A promise that resolves to a random prompt string.
 */
export const mockGetInspirationAPI = (): Promise<{ prompt: string }> => {
    const inspirations = [
        "A cyberpunk city in the rain, neon lights reflecting on the wet streets.",
        "An ancient library inside a giant, hollowed-out tree.",
        "A lone astronaut discovering a glowing alien artifact on Mars.",
        "A tranquil Japanese garden with a koi pond under a cherry blossom tree.",
        "A steampunk airship navigating through a storm of clouds.",
        "A hidden waterfall in a lush, tropical jungle at sunset."
    ];
    return new Promise(resolve => {
        setTimeout(() => {
            const prompt = inspirations[Math.floor(Math.random() * inspirations.length)];
            resolve({ prompt });
        }, 500);
    });
};

/**
 * Simulates fetching a gallery of curated background images.
 * @returns A promise that resolves to an array of image URLs.
 */
export const mockFetchGalleryImagesAPI = (): Promise<{ images: { id: string; url: string; author: string }[] }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const images = Array.from({ length: 20 }).map((_, i) => ({
                id: `gallery_${i}`,
                url: `https://picsum.photos/seed/gallery${i}/800/600`,
                author: `Artist ${i + 1}`
            }));
            resolve({ images });
        }, 1000);
    });
};

/**
 * Simulates saving personalization settings to a server or local storage.
 * @param settings The settings to save.
 * @returns A promise that resolves on successful save.
 */
export const mockSaveSettingsAPI = (settings: PersonalizationState): Promise<void> => {
    console.log("Saving settings...", settings);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                localStorage.setItem('personalizationSettings', JSON.stringify(settings));
                console.log("Settings saved successfully.");
                resolve();
            } catch (error) {
                console.error("Failed to save settings:", error);
                reject(new Error("Could not save settings to local storage."));
            }
        }, 1500);
    });
};

/**
 * Simulates loading personalization settings.
 * @returns A promise that resolves with the loaded settings or null if none exist.
 */
export const mockLoadSettingsAPI = (): Promise<PersonalizationState | null> => {
    console.log("Loading settings...");
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                const savedSettings = localStorage.getItem('personalizationSettings');
                if (savedSettings) {
                    console.log("Settings loaded successfully.");
                    resolve(JSON.parse(savedSettings));
                } else {
                    console.log("No saved settings found.");
                    resolve(null);
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
                resolve(null);
            }
        }, 500);
    });
};


// --- SECTION 3: STATE MANAGEMENT (CONTEXT & REDUCER) ---

export const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'widget-1', name: 'Welcome Quickstart', component: 'Welcome', enabled: true },
    { id: 'widget-2', name: 'Daily Focus', component: 'Focus', enabled: true },
    { id: 'widget-3', name: 'Scratchpad', component: 'Scratchpad', enabled: true },
    { id: 'widget-4', name: 'Recent Projects', component: 'Projects', enabled: false },
    { id: 'widget-5', name: 'Calendar Events', component: 'Calendar', enabled: true },
];

export const defaultPersonalizationState: PersonalizationState = {
    theme: {
        mode: 'system',
        primaryColor: '#6e44ff',
        accentColor: '#ff6b4a',
        fontFamily: 'sans-serif',
        fontSize: 1, // rem
        uiDensity: 'comfortable',
    },
    background: {
        type: 'dynamic',
        solid: { color: '#1a1a2e' },
        image: {
            url: '',
            blur: 5,
            brightness: 80,
            position: 'cover',
        },
        ai: {
            prompt: '',
            negativePrompt: '',
            style: AI_ART_STYLES[0],
            history: [],
            isGenerating: false,
            error: null,
            currentImageUrl: null,
        },
        dynamic: {
            type: 'aurora',
            options: {
                speed: 50,
                complexity: 60,
                colorPalette: DYNAMIC_BACKGROUND_PALETTES.aurora,
            },
        },
    },
    layout: {
        sidebarPosition: 'left',
        widgets: DEFAULT_WIDGETS,
    },
    sound: {
        enabled: true,
        volume: 75,
        theme: 'default',
    },
    accessibility: {
        highContrast: false,
        reduceMotion: false,
    },
    metadata: {
        lastSaved: null,
        hasUnsavedChanges: false,
    },
};

/**
 * Reducer function for managing personalization state.
 * @param state The current state.
 * @param action The dispatched action.
 * @returns The new state.
 */
export const personalizationReducer = (state: PersonalizationState, action: PersonalizationAction): PersonalizationState => {
    // A helper to wrap state updates and automatically set the unsaved changes flag
    const withUnsavedChanges = (newState: Partial<PersonalizationState>): PersonalizationState => ({
        ...state,
        ...newState,
        metadata: { ...state.metadata, hasUnsavedChanges: true },
    });

    switch (action.type) {
        case 'SET_STATE':
            return action.payload;
        case 'SET_THEME_MODE':
            return withUnsavedChanges({ theme: { ...state.theme, mode: action.payload } });
        case 'SET_PRIMARY_COLOR':
            return withUnsavedChanges({ theme: { ...state.theme, primaryColor: action.payload } });
        case 'SET_ACCENT_COLOR':
            return withUnsavedChanges({ theme: { ...state.theme, accentColor: action.payload } });
        case 'SET_FONT_FAMILY':
            return withUnsavedChanges({ theme: { ...state.theme, fontFamily: action.payload } });
        case 'SET_FONT_SIZE':
            return withUnsavedChanges({ theme: { ...state.theme, fontSize: action.payload } });
        case 'SET_UI_DENSITY':
            return withUnsavedChanges({ theme: { ...state.theme, uiDensity: action.payload } });
        case 'SET_BACKGROUND_TYPE':
            return withUnsavedChanges({ background: { ...state.background, type: action.payload } });
        case 'SET_SOLID_BACKGROUND_COLOR':
            return withUnsavedChanges({ background: { ...state.background, solid: { ...state.background.solid, color: action.payload } } });
        case 'SET_IMAGE_BACKGROUND_URL':
            return withUnsavedChanges({ background: { ...state.background, image: { ...state.background.image, url: action.payload } } });
        case 'SET_IMAGE_BACKGROUND_BLUR':
            return withUnsavedChanges({ background: { ...state.background, image: { ...state.background.image, blur: action.payload } } });
        case 'SET_IMAGE_BACKGROUND_BRIGHTNESS':
            return withUnsavedChanges({ background: { ...state.background, image: { ...state.background.image, brightness: action.payload } } });
        case 'SET_IMAGE_BACKGROUND_POSITION':
            return withUnsavedChanges({ background: { ...state.background, image: { ...state.background.image, position: action.payload } } });
        case 'SET_AI_PROMPT':
            return withUnsavedChanges({ background: { ...state.background, ai: { ...state.background.ai, prompt: action.payload } } });
        case 'SET_AI_NEGATIVE_PROMPT':
            return withUnsavedChanges({ background: { ...state.background, ai: { ...state.background.ai, negativePrompt: action.payload } } });
        case 'SET_AI_STYLE':
            return withUnsavedChanges({ background: { ...state.background, ai: { ...state.background.ai, style: action.payload } } });
        case 'START_AI_GENERATION':
            return withUnsavedChanges({ background: { ...state.background, ai: { ...state.background.ai, isGenerating: true, error: null } } });
        case 'AI_GENERATION_SUCCESS':
            const newHistoryEntry = { prompt: action.payload.prompt, url: action.payload.url, timestamp: Date.now() };
            return withUnsavedChanges({
                background: {
                    ...state.background,
                    type: 'ai',
                    ai: {
                        ...state.background.ai,
                        isGenerating: false,
                        currentImageUrl: action.payload.url,
                        history: [newHistoryEntry, ...state.background.ai.history].slice(0, 20), // Keep last 20
                    }
                }
            });
        case 'AI_GENERATION_FAILURE':
            return withUnsavedChanges({ background: { ...state.background, ai: { ...state.background.ai, isGenerating: false, error: action.payload } } });
        case 'SET_AI_BACKGROUND_IMAGE':
            return withUnsavedChanges({ background: { ...state.background, type: 'ai', ai: { ...state.background.ai, currentImageUrl: action.payload } } });
        case 'CLEAR_AI_HISTORY':
            return withUnsavedChanges({ background: { ...state.background, ai: { ...state.background.ai, history: [] } } });
        case 'SET_DYNAMIC_BACKGROUND_TYPE':
            return withUnsavedChanges({ background: { ...state.background, dynamic: { ...state.background.dynamic, type: action.payload } } });
        case 'UPDATE_DYNAMIC_BACKGROUND_OPTIONS':
            return withUnsavedChanges({ background: { ...state.background, dynamic: { ...state.background.dynamic, options: { ...state.background.dynamic.options, ...action.payload } as any } } });
        case 'SET_SIDEBAR_POSITION':
            return withUnsavedChanges({ layout: { ...state.layout, sidebarPosition: action.payload } });
        case 'REORDER_WIDGETS':
            const newWidgets = [...state.layout.widgets];
            const [removed] = newWidgets.splice(action.payload.dragIndex, 1);
            newWidgets.splice(action.payload.hoverIndex, 0, removed);
            return withUnsavedChanges({ layout: { ...state.layout, widgets: newWidgets } });
        case 'TOGGLE_WIDGET':
            return withUnsavedChanges({
                layout: {
                    ...state.layout,
                    widgets: state.layout.widgets.map(w => w.id === action.payload ? { ...w, enabled: !w.enabled } : w)
                }
            });
        case 'SET_SOUND_ENABLED':
            return withUnsavedChanges({ sound: { ...state.sound, enabled: action.payload } });
        case 'SET_SOUND_VOLUME':
            return withUnsavedChanges({ sound: { ...state.sound, volume: action.payload } });
        case 'SET_SOUND_THEME':
            return withUnsavedChanges({ sound: { ...state.sound, theme: action.payload } });
        case 'SET_HIGH_CONTRAST':
            return withUnsavedChanges({ accessibility: { ...state.accessibility, highContrast: action.payload } });
        case 'SET_REDUCE_MOTION':
            return withUnsavedChanges({ accessibility: { ...state.accessibility, reduceMotion: action.payload } });
        case 'RESET_TO_DEFAULTS':
            return { ...defaultPersonalizationState, metadata: { ...state.metadata, hasUnsavedChanges: true } };
        case 'SAVE_SETTINGS_SUCCESS':
            return { ...state, metadata: { ...state.metadata, lastSaved: Date.now(), hasUnsavedChanges: false } };
        // These are handled by the provider's state, not the reducer
        case 'SAVE_SETTINGS_START':
        case 'SAVE_SETTINGS_FAILURE':
            return state;
        default:
            return state;
    }
};

export const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

/**
 * Provider component for the Personalization context.
 */
export const PersonalizationProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(personalizationReducer, defaultPersonalizationState);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        // Load settings on initial mount
        mockLoadSettingsAPI().then(loadedSettings => {
            if (loadedSettings) {
                dispatch({ type: 'SET_STATE', payload: { ...loadedSettings, metadata: { ...loadedSettings.metadata, hasUnsavedChanges: false } } });
            }
        });
    }, []);

    const saveSettings = useCallback(async () => {
        setIsSaving(true);
        setSaveError(null);
        dispatch({ type: 'SAVE_SETTINGS_START' });
        try {
            await mockSaveSettingsAPI(state);
            dispatch({ type: 'SAVE_SETTINGS_SUCCESS' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setSaveError(errorMessage);
            dispatch({ type: 'SAVE_SETTINGS_FAILURE' });
        } finally {
            setIsSaving(false);
        }
    }, [state]);

    const value = useMemo(() => ({
        state,
        dispatch,
        isSaving,
        saveError,
        saveSettings,
    }), [state, isSaving, saveError, saveSettings]);

    return (
        <PersonalizationContext.Provider value={value}>
            {children}
        </PersonalizationContext.Provider>
    );
};

/**
 * Custom hook to easily access the Personalization context.
 */
export const usePersonalization = (): PersonalizationContextType => {
    const context = useContext(PersonalizationContext);
    if (context === undefined) {
        throw new Error('usePersonalization must be used within a PersonalizationProvider');
    }
    return context;
};


// --- SECTION 4: UTILITY FUNCTIONS & HOOKS ---

/**
 * Converts a hex color to an RGBA string.
 * @param hex The hex color code.
 * @param alpha The alpha transparency value (0-1).
 * @returns The RGBA color string.
 */
export const hexToRgba = (hex: string, alpha: number = 1): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
        : 'rgba(0,0,0,1)';
};

/**
 * A custom hook to debounce a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


// --- SECTION 5: CANVAS-BASED DYNAMIC BACKGROUND ---

/**
 * Represents a single particle in the Aurora simulation.
 */
export class AuroraParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    life: number;
    maxLife: number;

    constructor(canvasWidth: number, canvasHeight: number, colors: string[]) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight * 1.2;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.2 - 0.3;
        this.radius = Math.random() * 80 + 40;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.maxLife = Math.random() * 200 + 100;
        this.life = this.maxLife;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const alpha = Math.max(0, this.life / this.maxLife) * 0.2;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, hexToRgba(this.color, alpha));
        gradient.addColorStop(1, hexToRgba(this.color, 0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * The DynamicBackgroundCanvas component renders a procedural animation on a canvas.
 */
export const DynamicBackgroundCanvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { state } = usePersonalization();
    const { reduceMotion } = state.accessibility;
    const { type, options } = state.background.dynamic;

    useEffect(() => {
        if (reduceMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: AuroraParticle[] = [];
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const resizeHandler = () => {
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        };
        window.addEventListener('resize', resizeHandler);

        const initAurora = () => {
            const auroraOptions = options as AuroraOptions;
            const particleCount = Math.floor(auroraOptions.complexity / 100 * 50) + 10;
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new AuroraParticle(canvasWidth, canvasHeight, auroraOptions.colorPalette));
            }
        };

        const renderAurora = () => {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.globalCompositeOperation = 'lighter';

            const auroraOptions = options as AuroraOptions;
            const speedFactor = auroraOptions.speed / 50;

            particles.forEach((p, i) => {
                p.update();
                p.draw(ctx);

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    particles.push(new AuroraParticle(canvasWidth, canvasHeight, auroraOptions.colorPalette));
                }
            });
            ctx.globalCompositeOperation = 'source-over';
        };
        
        // Placeholder for other dynamic background types
        const renderWaves = () => {
            // ... wave rendering logic ...
        };
        const renderStarfield = () => {
            // ... starfield rendering logic ...
        };

        const renderSwitch = {
            'aurora': renderAurora,
            'waves': renderWaves,
            'starfield': renderStarfield,
        };

        if (type === 'aurora') {
            initAurora();
        }

        const animate = () => {
            renderSwitch[type]();
            animationFrameId = window.requestAnimationFrame(animate);
        };
        
        animate();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeHandler);
        };
    }, [type, options, reduceMotion]);

    if (reduceMotion) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                backgroundColor: '#000',
            }}
        />
    );
};


// --- SECTION 6: UI PRIMITIVE COMPONENTS ---

export const commonStyles: { [key: string]: CSSProperties } = {
    controlWrapper: {
        marginBottom: '1rem',
    },
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#ccc',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    button: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '4px',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 600,
        transition: 'background-color 0.2s',
    },
};

export const Slider: FC<{
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
}> = ({ label, value, min = 0, max = 100, step = 1, onChange }) => (
    <div style={commonStyles.controlWrapper}>
        <label style={commonStyles.label}>{label} ({value})</label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: usePersonalization().state.theme.accentColor }}
        />
    </div>
);

export const ToggleSwitch: FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => {
    const { state } = usePersonalization();
    const switchStyle: CSSProperties = {
        position: 'relative',
        display: 'inline-block',
        width: '50px',
        height: '28px',
    };
    const sliderStyle: CSSProperties = {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? state.theme.accentColor : '#444',
        transition: '0.4s',
        borderRadius: '28px',
    };
    const knobStyle: CSSProperties = {
        position: 'absolute',
        content: '""',
        height: '20px',
        width: '20px',
        left: '4px',
        bottom: '4px',
        backgroundColor: 'white',
        transition: '0.4s',
        borderRadius: '50%',
        transform: checked ? 'translateX(22px)' : 'translateX(0)',
    };
    
    return (
        <div style={{ ...commonStyles.controlWrapper, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={commonStyles.label}>{label}</span>
            <label style={switchStyle}>
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }}/>
                <span style={sliderStyle}><span style={knobStyle}></span></span>
            </label>
        </div>
    );
};

export const ColorPicker: FC<{ label: string; color: string; onChange: (color: string) => void }> = ({ label, color, onChange }) => (
    <div style={commonStyles.controlWrapper}>
        <label style={commonStyles.label}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <input 
                type="color" 
                value={color} 
                onChange={e => onChange(e.target.value)} 
                style={{
                    width: '40px',
                    height: '40px',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                }}
            />
            <span style={{ marginLeft: '1rem', fontFamily: 'monospace' }}>{color}</span>
        </div>
    </div>
);

export const Select: FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
    <div style={commonStyles.controlWrapper}>
        <label style={commonStyles.label}>{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...commonStyles.input, appearance: 'none' }}>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export const SegmentedControl: FC<{
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
}> = ({ label, options, value, onChange }) => {
    const { state } = usePersonalization();
    return (
        <div style={commonStyles.controlWrapper}>
            <label style={commonStyles.label}>{label}</label>
            <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                {options.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        style={{
                            ...commonStyles.button,
                            flex: 1,
                            borderRadius: 0,
                            backgroundColor: value === opt.value ? state.theme.accentColor : 'transparent',
                            borderRight: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const Spinner: FC<{ size?: number }> = ({ size = 24 }) => (
    <div style={{
        width: size,
        height: size,
        border: `${size * 0.15}px solid rgba(255, 255, 255, 0.3)`,
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    }}>
        <style>{`
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export const Modal: FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#2a2a3e', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', position: 'relative' }}>
                <h2 style={{ marginTop: 0 }}>{title}</h2>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                {children}
            </div>
        </div>
    );
};


// --- SECTION 7: SETTINGS SECTION COMPONENTS ---

/**
 * A reusable wrapper for each settings section.
 */
export const SectionWrapper: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            {title}
        </h2>
        {children}
    </div>
);

/**
 * Component for managing theme settings.
 */
export const ThemeSettings: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { theme } = state;

    return (
        <SectionWrapper title="Aesthetic & Theme">
            <SegmentedControl
                label="Color Mode"
                value={theme.mode}
                onChange={value => dispatch({ type: 'SET_THEME_MODE', payload: value as any })}
                options={[{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }]}
            />
            <ColorPicker label="Primary Color" color={theme.primaryColor} onChange={c => dispatch({ type: 'SET_PRIMARY_COLOR', payload: c })} />
            <ColorPicker label="Accent Color" color={theme.accentColor} onChange={c => dispatch({ type: 'SET_ACCENT_COLOR', payload: c })} />
            <Select
                label="Font Family"
                value={theme.fontFamily}
                onChange={value => dispatch({ type: 'SET_FONT_FAMILY', payload: value as any })}
                options={['sans-serif', 'serif', 'monospace']}
            />
            <Slider
                label="Font Size"
                value={theme.fontSize}
                min={0.8}
                max={1.5}
                step={0.1}
                onChange={v => dispatch({ type: 'SET_FONT_SIZE', payload: v })}
            />
            <SegmentedControl
                label="UI Density"
                value={theme.uiDensity}
                onChange={value => dispatch({ type: 'SET_UI_DENSITY', payload: value as any })}
                options={[{ label: 'Compact', value: 'compact' }, { label: 'Comfortable', value: 'comfortable' }, { label: 'Spacious', value: 'spacious' }]}
            />
        </SectionWrapper>
    );
};

/**
 * Component for AI image generation panel.
 */
export const AIGeneratorPanel: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { ai } = state.background;

    const handleGenerate = async () => {
        dispatch({ type: 'START_AI_GENERATION' });
        try {
            const { url } = await mockGenerateImageAPI(ai.prompt, ai.style);
            dispatch({ type: 'AI_GENERATION_SUCCESS', payload: { url, prompt: ai.prompt } });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            dispatch({ type: 'AI_GENERATION_FAILURE', payload: message });
        }
    };
    
    const handleInspireMe = async () => {
        const { prompt } = await mockGetInspirationAPI();
        dispatch({ type: 'SET_AI_PROMPT', payload: prompt });
    };

    return (
        <div>
            <div style={commonStyles.controlWrapper}>
                <label style={commonStyles.label}>Your Vision (Prompt)</label>
                <textarea
                    value={ai.prompt}
                    onChange={e => dispatch({ type: 'SET_AI_PROMPT', payload: e.target.value })}
                    placeholder="e.g., An isolated lighthouse on a stormy sea..."
                    style={{ ...commonStyles.input, minHeight: '80px', resize: 'vertical' }}
                />
            </div>
            <div style={commonStyles.controlWrapper}>
                <label style={commonStyles.label}>Negative Prompt (Optional)</label>
                <input
                    type="text"
                    value={ai.negativePrompt}
                    onChange={e => dispatch({ type: 'SET_AI_NEGATIVE_PROMPT', payload: e.target.value })}
                    placeholder="e.g., blurry, text, watermark"
                    style={commonStyles.input}
                />
            </div>
            <Select
                label="Art Style"
                value={ai.style}
                options={AI_ART_STYLES}
                onChange={value => dispatch({ type: 'SET_AI_STYLE', payload: value })}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    onClick={handleGenerate}
                    disabled={ai.isGenerating || !ai.prompt}
                    style={{ ...commonStyles.button, backgroundColor: state.theme.accentColor, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                    {ai.isGenerating && <Spinner size={20} />}
                    {ai.isGenerating ? 'Generating...' : 'Manifest'}
                </button>
                <button
                    onClick={handleInspireMe}
                    disabled={ai.isGenerating}
                    style={{ ...commonStyles.button, backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                    Inspire Me
                </button>
            </div>
            {ai.error && <p style={{ color: '#ff4d4d', marginTop: '1rem' }}>Error: {ai.error}</p>}

            {ai.currentImageUrl && (
                <div style={{ marginTop: '2rem' }}>
                    <h4>Current Background:</h4>
                    <img src={ai.currentImageUrl} alt="Generated background" style={{ width: '100%', borderRadius: '4px', border: '2px solid' + state.theme.accentColor }} />
                </div>
            )}
            
            {ai.history.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>History</h4>
                        <button onClick={() => dispatch({ type: 'CLEAR_AI_HISTORY' })} style={{...commonStyles.button, padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'rgba(255,0,0,0.3)'}}>Clear</button>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
                        {ai.history.map(item => (
                            <img
                                key={item.timestamp}
                                src={item.url}
                                alt={item.prompt}
                                title={item.prompt}
                                onClick={() => dispatch({ type: 'SET_AI_BACKGROUND_IMAGE', payload: item.url })}
                                style={{ width: '100%', height: 'auto', borderRadius: '4px', cursor: 'pointer', border: ai.currentImageUrl === item.url ? `2px solid ${state.theme.accentColor}` : '2px solid transparent' }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Component for image upload and gallery selection.
 */
export const ImageBackgroundPanel: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { image } = state.background;
    const [galleryImages, setGalleryImages] = useState<{ id: string, url: string, author: string }[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(true);

    useEffect(() => {
        mockFetchGalleryImagesAPI().then(data => {
            setGalleryImages(data.images);
            setIsLoadingGallery(false);
        });
    }, []);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    dispatch({ type: 'SET_IMAGE_BACKGROUND_URL', payload: event.target.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <h4>Upload Your Own</h4>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...commonStyles.input, padding: '0.5rem' }}/>
            {image.url && (
                <div style={{ marginTop: '1rem' }}>
                    <p>Preview:</p>
                    <img src={image.url} alt="Uploaded background" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }} />
                </div>
            )}
            <div style={{ marginTop: '1.5rem' }}>
                <Slider label="Blur" value={image.blur} onChange={v => dispatch({ type: 'SET_IMAGE_BACKGROUND_BLUR', payload: v })} />
                <Slider label="Brightness" value={image.brightness} onChange={v => dispatch({ type: 'SET_IMAGE_BACKGROUND_BRIGHTNESS', payload: v })} />
                <SegmentedControl
                    label="Position"
                    value={image.position}
                    onChange={v => dispatch({ type: 'SET_IMAGE_BACKGROUND_POSITION', payload: v as any })}
                    options={[{ label: 'Cover', value: 'cover' }, { label: 'Contain', value: 'contain' }, { label: 'Tile', value: 'tile' }]}
                />
            </div>
            <h4 style={{ marginTop: '2rem' }}>Or Select from Gallery</h4>
            {isLoadingGallery ? <Spinner /> : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                    {galleryImages.map(img => (
                        <img
                            key={img.id}
                            src={img.url}
                            alt={`Gallery image by ${img.author}`}
                            onClick={() => dispatch({ type: 'SET_IMAGE_BACKGROUND_URL', payload: img.url })}
                            style={{ width: '100%', height: 'auto', borderRadius: '4px', cursor: 'pointer', border: image.url === img.url ? `2px solid ${state.theme.accentColor}` : '2px solid transparent' }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


/**
 * Component for dynamic background settings.
 */
export const DynamicBackgroundPanel: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { dynamic } = state.background;

    const renderOptions = () => {
        switch (dynamic.type) {
            case 'aurora':
                const auroraOpts = dynamic.options as AuroraOptions;
                return (
                    <>
                        <Slider label="Speed" value={auroraOpts.speed} onChange={v => dispatch({ type: 'UPDATE_DYNAMIC_BACKGROUND_OPTIONS', payload: { speed: v } })} />
                        <Slider label="Complexity" value={auroraOpts.complexity} onChange={v => dispatch({ type: 'UPDATE_DYNAMIC_BACKGROUND_OPTIONS', payload: { complexity: v } })} />
                    </>
                );
            // Add cases for 'waves' and 'starfield'
            default: return null;
        }
    };
    
    return (
        <div>
            <SegmentedControl
                label="Effect Type"
                value={dynamic.type}
                onChange={v => dispatch({ type: 'SET_DYNAMIC_BACKGROUND_TYPE', payload: v as any })}
                options={[
                    { label: 'Aurora Illusion', value: 'aurora' }, 
                    { label: 'Gentle Waves', value: 'waves' }, 
                    { label: 'Starfield', value: 'starfield' }
                ]}
            />
            <div style={{ marginTop: '1.5rem' }}>
                {renderOptions()}
            </div>
        </div>
    );
};


/**
 * Component for managing background settings with a tabbed interface.
 */
export const BackgroundSettings: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { background } = state;
    const { type } = background;
    
    const tabs = [
        { id: 'dynamic', label: 'Dynamic' },
        { id: 'ai', label: 'AI Generator' },
        { id: 'image', label: 'Image' },
        { id: 'solid', label: 'Solid Color' }
    ];

    const renderContent = () => {
        switch (type) {
            case 'solid':
                return <ColorPicker label="Background Color" color={background.solid.color} onChange={c => dispatch({ type: 'SET_SOLID_BACKGROUND_COLOR', payload: c })} />;
            case 'image':
                return <ImageBackgroundPanel />;
            case 'ai':
                return <AIGeneratorPanel />;
            case 'dynamic':
                return <DynamicBackgroundPanel />;
            default:
                return null;
        }
    };

    return (
        <SectionWrapper title="World Canvas (Background)">
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => dispatch({ type: 'SET_BACKGROUND_TYPE', payload: tab.id as any })}
                        style={{
                            ...commonStyles.button,
                            backgroundColor: 'transparent',
                            color: type === tab.id ? state.theme.accentColor : '#ccc',
                            borderBottom: type === tab.id ? `2px solid ${state.theme.accentColor}` : '2px solid transparent',
                            borderRadius: 0,
                            padding: '0.75rem 1rem',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {renderContent()}
        </SectionWrapper>
    );
};


/**
 * Draggable widget item for the layout settings.
 */
const DraggableWidgetItem: FC<{ widget: WidgetConfig; index: number; moveWidget: (d: number, h: number) => void }> = ({ widget, index, moveWidget }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { dispatch } = usePersonalization();

    const [, drop] = useDrop({
        accept: 'widget',
        hover(item: { index: number }, monitor: DropTargetMonitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveWidget(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'widget',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div ref={ref} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
            <span>{widget.name}</span>
            <ToggleSwitch label="" checked={widget.enabled} onChange={() => dispatch({ type: 'TOGGLE_WIDGET', payload: widget.id })} />
        </div>
    );
};


/**
 * Component for managing layout settings.
 */
export const LayoutSettings: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { layout } = state;

    const moveWidget = (dragIndex: number, hoverIndex: number) => {
        dispatch({ type: 'REORDER_WIDGETS', payload: { dragIndex, hoverIndex } });
    };

    return (
        <SectionWrapper title="Environment & Layout">
            <SegmentedControl
                label="Sidebar Position"
                value={layout.sidebarPosition}
                onChange={v => dispatch({ type: 'SET_SIDEBAR_POSITION', payload: v as any })}
                options={[{ label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }]}
            />
            <div style={{ marginTop: '1.5rem' }}>
                <label style={commonStyles.label}>Dashboard Widgets (Drag to reorder)</label>
                <div>
                    {layout.widgets.map((widget, i) => (
                        <DraggableWidgetItem key={widget.id} index={i} widget={widget} moveWidget={moveWidget} />
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
};

/**
 * Component for managing sound settings.
 */
export const SoundSettings: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { sound } = state;

    return (
        <SectionWrapper title="Auditory Resonance">
            <ToggleSwitch label="Enable UI Sounds" checked={sound.enabled} onChange={c => dispatch({ type: 'SET_SOUND_ENABLED', payload: c })} />
            {sound.enabled && (
                <>
                    <Slider label="Volume" value={sound.volume} onChange={v => dispatch({ type: 'SET_SOUND_VOLUME', payload: v })} />
                    <Select
                        label="Sound Theme"
                        value={sound.theme}
                        onChange={v => dispatch({ type: 'SET_SOUND_THEME', payload: v as any })}
                        options={['default', 'calm', 'tech']}
                    />
                </>
            )}
        </SectionWrapper>
    );
};

/**
 * Component for managing accessibility settings.
 */
export const AccessibilitySettings: FC = () => {
    const { state, dispatch } = usePersonalization();
    const { accessibility } = state;

    return (
        <SectionWrapper title="Accessibility">
            <ToggleSwitch label="High Contrast Mode" checked={accessibility.highContrast} onChange={c => dispatch({ type: 'SET_HIGH_CONTRAST', payload: c })} />
            <ToggleSwitch label="Reduce Motion" checked={accessibility.reduceMotion} onChange={c => dispatch({ type: 'SET_REDUCE_MOTION', payload: c })} />
            <p style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '1rem' }}>Note: Font size is managed under "Aesthetic & Theme".</p>
        </SectionWrapper>
    );
};


// --- SECTION 8: MAIN VIEW COMPONENT ---

/**
 * The main PersonalizationView component that brings all settings together.
 */
export const PersonalizationView: FC = () => {
    const { state, dispatch, saveSettings, isSaving, saveError } = usePersonalization();
    const { hasUnsavedChanges } = state.metadata;

    return (
        <div style={{
            color: '#fff',
            backgroundColor: '#1a1a2e',
            minHeight: '100vh',
            fontFamily: 'sans-serif',
            padding: '2rem 4rem',
        }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Personalization</h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#aaa' }}>Shape your environment to be a true reflection of your inner state.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => dispatch({ type: 'RESET_TO_DEFAULTS' })}
                        style={{ ...commonStyles.button, backgroundColor: 'rgba(255,255,255,0.2)' }}
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={saveSettings}
                        disabled={!hasUnsavedChanges || isSaving}
                        style={{ ...commonStyles.button, backgroundColor: state.theme.primaryColor, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {isSaving && <Spinner size={20} />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                        {hasUnsavedChanges && <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: state.theme.accentColor, marginLeft: '0.5rem'}}></div>}
                    </button>
                </div>
            </header>
            
            {saveError && <div style={{ backgroundColor: '#5c1f1f', color: '#ffc1c1', padding: '1rem', borderRadius: '4px', marginBottom: '2rem' }}>Error saving settings: {saveError}</div>}
            
            <DndProvider backend={HTML5Backend}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <ThemeSettings />
                    <BackgroundSettings />
                    <LayoutSettings />
                    <SoundSettings />
                    <AccessibilitySettings />
                </div>
            </DndProvider>

            <DynamicBackgroundCanvas />
        </div>
    );
};

/**
 * A wrapper component that includes the necessary providers for the PersonalizationView.
 * This would typically be used in the application's routing system.
 */
export const PersonalizationViewWithProvider: FC = () => {
    return (
        <PersonalizationProvider>
            <PersonalizationView />
        </PersonalizationProvider>
    );
};
