```typescript
// components/views/personal/CardCustomizationView.tsx
import React, { useState, useReducer, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Card from '../../Card';

// SECTION: Type Definitions for a Real-World Application
// =========================================================

/**
 * Represents a single generated card design.
 */
export type Design = {
    id: string;
    baseImage: string;
    generatedImage: string;
    prompt: string;
    customizationOptions: CustomizationOptions;
    story: string;
    createdAt: Date;
    isFavorite: boolean;
    author?: string; // For community gallery items
};

/**
 * Defines the structured customization options applied to a design.
 */
export type CustomizationOptions = {
    styleId: string;
    paletteId: string;
    finishId: string;
    textOverlays: TextOverlay[];
};

/**
 * Represents a text element to be placed on the card.
 */
export type TextOverlay = {
    id: string;
    text: string;
    fontId: string;
    fontSize: number;
    color: string;
    position: { x: number; y: number }; // Percentage-based position
};

/**
 * Describes a preset style for the AI generation.
 */
export type StylePreset = {
    id: string;
    name: string;
    description: string;
    promptFragment: string;
    thumbnailUrl: string; // URL for a visual representation
};

/**
 * Defines a color palette for the AI to use.
 */
export type ColorPalette = {
    id: string;
    name: string;
    colors: string[]; // Hex codes
};

/**
 * Represents a physical card finish simulation.
 */
export type CardFinish = {
    id: string;
    name: string;
    promptFragment: string;
};

/**
 * Represents a font option for text overlays.
 */
export type FontOption = {
    id: string;
    name: string;
    fontFamily: string; // CSS font-family value
};

// SECTION: Constants and Mock Data
// =========================================================

export const STYLE_PRESETS: StylePreset[] = [
    { id: 'default', name: 'Default', description: 'Your prompt, straight up.', promptFragment: '', thumbnailUrl: '/thumbnails/default.png' },
    { id: 'cyberpunk', name: 'Cyberpunk', description: 'High-tech, low-life, neon-drenched.', promptFragment: 'in a futuristic cyberpunk style, neon lights, gritty urban environment, chrome details', thumbnailUrl: '/thumbnails/cyberpunk.png' },
    { id: 'vintage', name: 'Vintage', description: 'Aged paper, retro-futurism, classic charm.', promptFragment: 'in a vintage photo style, sepia tones, aged paper texture, 1950s aesthetic', thumbnailUrl: '/thumbnails/vintage.png' },
    { id: 'watercolor', name: 'Watercolor', description: 'Soft, blended colors, artistic feel.', promptFragment: 'as a vibrant watercolor painting, with soft edges and beautiful color bleeds', thumbnailUrl: '/thumbnails/watercolor.png' },
    { id: 'minimalist', name: 'Minimalist', description: 'Clean lines, simple forms, elegant.', promptFragment: 'with a minimalist design, clean lines, simple shapes, and a limited color palette', thumbnailUrl: '/thumbnails/minimalist.png' },
    { id: 'holographic', name: 'Holographic', description: 'Shimmering, iridescent, and futuristic.', promptFragment: 'with a shimmering holographic and iridescent effect, reflecting rainbow colors', thumbnailUrl: '/thumbnails/holographic.png' },
];

export const COLOR_PALETTES: ColorPalette[] = [
    { id: 'default', name: 'Default', colors: [] },
    { id: 'ocean_breeze', name: 'Ocean Breeze', colors: ['#00A7E1', '#007EA7', '#003459', '#FFFFFF'] },
    { id: 'sunset_glow', name: 'Sunset Glow', colors: ['#FF6B6B', '#FFD166', '#EF7B7B', '#F7B267'] },
    { id: 'forest_depths', name: 'Forest Depths', colors: ['#0A3622', '#216869', '#49A078', '#99E2B4'] },
    { id: 'monochrome', name: 'Monochrome', colors: ['#1C1C1C', '#595959', '#D9D9D9', '#FFFFFF'] },
];

export const CARD_FINISHES: CardFinish[] = [
    { id: 'default', name: 'Standard Gloss', promptFragment: 'with a standard glossy finish' },
    { id: 'matte', name: 'Matte', promptFragment: 'with a premium non-reflective matte finish' },
    { id: 'brushed_metal', name: 'Brushed Metal', promptFragment: 'simulating a brushed aluminum metal texture' },
    { id: 'holographic_foil', name: 'Holographic Foil', promptFragment: 'with accents of holographic foil that shimmer in the light' },
];

export const FONT_OPTIONS: FontOption[] = [
    { id: 'inter', name: 'Inter', fontFamily: '"Inter", sans-serif' },
    { id: 'roboto_mono', name: 'Roboto Mono', fontFamily: '"Roboto Mono", monospace' },
    { id: 'playfair', name: 'Playfair Display', fontFamily: '"Playfair Display", serif' },
    { id: 'pacifico', name: 'Pacifico', fontFamily: '"Pacifico", cursive' },
];

export const MOCK_COMMUNITY_GALLERY: Design[] = [
    {
        id: 'comm1',
        baseImage: '/gallery/comm1_base.jpg',
        generatedImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAHBgsIBw8QEA0QDQ8PDQ4PEA8OFBEWFxYWFhYXFxMYHSggGBolHRcVITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAJgAqAMBIgACEQEDEQH/xAAZAAEBAQEBAQAAAAAAAAAAAAADAgEABAX/xAAfEAEBAQEAAwEBAQEBAQAAAAAAAQIRAyESMUEiURNhcf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD5wAAAAAAAAAAAM2AnAzYABmwGcjOAAE5GcjOAAAAAAAzyM5GcjOAAE5GcATkZwBmwAE5GcjOAAAAAAAAAAAAAAJ+GfG8/yTx8S/wBnq5/LX4T52/qXw3+s+H6/Xv+0/K/h/0/6n+X6/V7/eP+X5P9T9T/wCvj1f+P0+/3/P/2gAMAwEAAgADAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAwEBPxAf/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAgEBPxAf/8QAHBAAAwEBAQEBAQAAAAAAAAAAAREAITFBUWEg/9oACAEBAAE/EPySgBAQEA8AgHhAICAhgEEBBRBBAQQRB8MvjL5i+YviL4AIIIIgiCAgAgIBgBAICAgICAgICAgICAeAQCAAwBAICAgYBAICAgICAggEAgIIIB4BAEBAQCAgICAgICGgQCAgICAeB//Z',
        prompt: 'A dragon made of constellations in a nebula',
        customizationOptions: { styleId: 'cyberpunk', paletteId: 'ocean_breeze', finishId: 'holographic_foil', textOverlays: [] },
        story: 'This card embodies cosmic power, a reminder that your potential is as vast as the universe itself.',
        createdAt: new Date(Date.now() - 86400000 * 2),
        isFavorite: true,
        author: 'PixelDreamer'
    },
    {
        id: 'comm2',
        baseImage: '/gallery/comm2_base.jpg',
        generatedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        prompt: 'A tranquil Japanese garden inside a lightbulb',
        customizationOptions: { styleId: 'watercolor', paletteId: 'forest_depths', finishId: 'matte', textOverlays: [] },
        story: 'Carry a piece of tranquility with you. This design represents the bright ideas that grow in moments of peace.',
        createdAt: new Date(Date.now() - 86400000 * 1),
        isFavorite: false,
        author: 'ArtfulAdonis'
    }
];


// SECTION: State Management (useReducer) for Complex UI
// =========================================================

type EditorState = {
    baseImage: string | null;
    generatedImage: string | null;
    prompt: string;
    customizationOptions: CustomizationOptions;
    
    // UI Interaction State
    activeTab: 'DESIGN' | 'GALLERY';
    isGeneratingImage: boolean;
    isGeneratingStory: boolean;
    isSavingDesign: boolean;
    isOrderModalOpen: boolean;
    
    // Data & History
    currentStory: string;
    designHistory: Design[];
    communityGallery: Design[];
    
    // Error Handling
    error: string | null;
};

type Action =
    | { type: 'SET_BASE_IMAGE'; payload: string }
    | { type: 'SET_PROMPT'; payload: string }
    | { type: 'SET_CUSTOMIZATION_OPTION'; payload: { key: keyof CustomizationOptions, value: any } }
    | { type: 'START_IMAGE_GENERATION' }
    | { type: 'IMAGE_GENERATION_SUCCESS'; payload: { image: string, design: Design } }
    | { type: 'IMAGE_GENERATION_FAILURE'; payload: string }
    | { type: 'START_STORY_GENERATION' }
    | { type: 'STORY_GENERATION_SUCCESS'; payload: string }
    | { type: 'STORY_GENERATION_FAILURE'; payload: string }
    | { type: 'SAVE_CURRENT_DESIGN' }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_ACTIVE_TAB'; payload: 'DESIGN' | 'GALLERY' }
    | { type: 'TOGGLE_ORDER_MODAL' };

const initialState: EditorState = {
    baseImage: null,
    generatedImage: null,
    prompt: 'Add a phoenix rising from the center, with its wings made of glowing data streams.',
    customizationOptions: {
        styleId: 'default',
        paletteId: 'default',
        finishId: 'default',
        textOverlays: [],
    },
    activeTab: 'DESIGN',
    isGeneratingImage: false,
    isGeneratingStory: false,
    isSavingDesign: false,
    isOrderModalOpen: false,
    currentStory: '',
    designHistory: [],
    communityGallery: [],
    error: null,
};

function editorReducer(state: EditorState, action: Action): EditorState {
    switch (action.type) {
        case 'SET_BASE_IMAGE':
            return { ...state, baseImage: action.payload, generatedImage: null, error: null };
        case 'SET_PROMPT':
            return { ...state, prompt: action.payload };
        case 'SET_CUSTOMIZATION_OPTION':
            return { ...state, customizationOptions: { ...state.customizationOptions, [action.payload.key]: action.payload.value } };
        case 'START_IMAGE_GENERATION':
            return { ...state, isGeneratingImage: true, generatedImage: null, error: null };
        case 'IMAGE_GENERATION_SUCCESS':
            return { ...state, isGeneratingImage: false, generatedImage: action.payload.image, designHistory: [action.payload.design, ...state.designHistory] };
        case 'IMAGE_GENERATION_FAILURE':
            return { ...state, isGeneratingImage: false, error: action.payload };
        case 'START_STORY_GENERATION':
            return { ...state, isGeneratingStory: true, currentStory: '' };
        case 'STORY_GENERATION_SUCCESS':
            return { ...state, isGeneratingStory: false, currentStory: action.payload };
        case 'STORY_GENERATION_FAILURE':
            return { ...state, isGeneratingStory: false, currentStory: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_ACTIVE_TAB':
            return { ...state, activeTab: action.payload };
        case 'TOGGLE_ORDER_MODAL':
            return { ...state, isOrderModalOpen: !state.isOrderModalOpen };
        default:
            return state;
    }
}

// SECTION: Utility and Helper Functions
// =========================================================

/**
 * Converts a File object to a base64 encoded string.
 * @param file The file to convert.
 * @returns A promise that resolves with the base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string));
        reader.onerror = error => reject(error);
    });
};

/**
 * Simulates an API call with a delay.
 * @param data The data to return after the delay.
 * @param delay The delay in milliseconds.
 * @returns A promise that resolves with the data.
 */
export async function mockApiCall<T>(data: T, delay: number = 500): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
}

/**
 * Constructs a detailed prompt for the AI model based on user selections.
 * @param basePrompt The user's core instruction.
 * @param options The selected customization options.
 * @returns A comprehensive string prompt for the AI.
 */
export function buildAIPrompt(basePrompt: string, options: CustomizationOptions): string {
    let fullPrompt = basePrompt;

    const style = STYLE_PRESETS.find(s => s.id === options.styleId);
    if (style && style.promptFragment) {
        fullPrompt += `, ${style.promptFragment}`;
    }

    const palette = COLOR_PALETTES.find(p => p.id === options.paletteId);
    if (palette && palette.colors.length > 0) {
        fullPrompt += `, using a color palette dominated by ${palette.colors.join(', ')}`;
    }

    const finish = CARD_FINISHES.find(f => f.id === options.finishId);
    if (finish && finish.promptFragment) {
        fullPrompt += `, rendered to look like it has ${finish.promptFragment}`;
    }

    if (options.textOverlays.length > 0) {
        const textDescriptions = options.textOverlays.map(t => 
            `the text "${t.text}" in a ${t.fontId} style font`
        ).join(' and ');
        fullPrompt += `. The design should elegantly incorporate ${textDescriptions}.`;
    }

    return fullPrompt + ". The final output must be a high-resolution image of the card design only.";
}


// SECTION: Child Components (defined within the main file for simplicity)
// =========================================================

type StyleSelectorProps = {
    selectedStyleId: string;
    onSelect: (id: string) => void;
};
const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyleId, onSelect }) => (
    <div>
        <h4 className="text-lg font-semibold text-white mb-3">Style Preset</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STYLE_PRESETS.map(style => (
                <button
                    key={style.id}
                    onClick={() => onSelect(style.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedStyleId === style.id ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'}`}
                >
                    <p className="font-bold text-white">{style.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{style.description}</p>
                </button>
            ))}
        </div>
    </div>
);

type ColorPalettePickerProps = {
    selectedPaletteId: string;
    onSelect: (id: string) => void;
};
const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({ selectedPaletteId, onSelect }) => (
    <div className="mt-6">
        <h4 className="text-lg font-semibold text-white mb-3">Color Palette</h4>
        <div className="flex flex-wrap gap-3">
            {COLOR_PALETTES.map(palette => (
                <button
                    key={palette.id}
                    onClick={() => onSelect(palette.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedPaletteId === palette.id ? 'border-cyan-400 bg-cyan-900/50' : 'border-gray-600 bg-gray-800/50 hover:bg-gray-700/50'}`}
                >
                    <p className="font-bold text-white mb-2">{palette.name}</p>
                    <div className="flex space-x-1 h-5">
                        {palette.colors.length > 0 ? palette.colors.map(color => (
                            <div key={color} className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
                        )) : <div className="text-xs text-gray-400">As specified</div>}
                    </div>
                </button>
            ))}
        </div>
    </div>
);

type OrderModalProps = {
    isOpen: boolean;
    onClose: () => void;
    designImage: string | null;
};
const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, designImage }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-lg w-full border border-gray-600">
                <h3 className="text-2xl font-bold text-white mb-4">Order Your Custom Card</h3>
                {designImage && <img src={designImage} alt="Final Design" className="rounded-lg mb-4 w-full aspect-[85.6/54] object-cover" />}
                <p className="text-gray-400 mb-6">Enter your details to receive a physical copy of your unique design. (This is a mock-up, no real order will be placed).</p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Mock order submitted!'); onClose(); }}>
                    <div className="space-y-4">
                        <input type="text" placeholder="Full Name" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white" />
                        <input type="text" placeholder="Shipping Address" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white" />
                        <div className="flex gap-4">
                            <input type="text" placeholder="City" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white" />
                            <input type="text" placeholder="Postal Code" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Submit Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// SECTION: The Main Component
// =========================================================

const CardCustomizationView: React.FC = () => {
    const [state, dispatch] = useReducer(editorReducer, initialState);
    
    // Legacy state from original component for compatibility - these can be removed if fully refactoring
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cardStory, setCardStory] = useState('');
    const [isStoryLoading, setIsStoryLoading] = useState(false);

    // Effect to fetch community gallery data on mount
    useEffect(() => {
        // In a real app, this would be a fetch call.
        mockApiCall(MOCK_COMMUNITY_GALLERY).then(data => {
            // This would normally be dispatched to the reducer, but for this exercise we keep it simple.
        });
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            dispatch({ type: 'SET_BASE_IMAGE', payload: base64 });
        }
    };

    const handleGenerate = async () => {
        if (!state.baseImage || !state.prompt) return;
        dispatch({ type: 'START_IMAGE_GENERATION' });
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const base64Data = state.baseImage.split(',')[1];
            const mimeType = state.baseImage.match(/:(.*?);/)?.[1] || 'image/jpeg';
            
            const fullPrompt = buildAIPrompt(state.prompt, state.customizationOptions);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: fullPrompt }] },
                config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
            });

            const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                const generatedImage = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
                const newDesign: Design = {
                    id: new Date().toISOString(),
                    baseImage: state.baseImage,
                    generatedImage,
                    prompt: state.prompt,
                    customizationOptions: state.customizationOptions,
                    story: '',
                    createdAt: new Date(),
                    isFavorite: false,
                };
                dispatch({ type: 'IMAGE_GENERATION_SUCCESS', payload: { image: generatedImage, design: newDesign } });
            } else { 
                dispatch({ type: 'IMAGE_GENERATION_FAILURE', payload: "The AI didn't return an image. Try a different prompt." });
            }
        } catch (err) {
            console.error("Image generation error:", err);
            dispatch({ type: 'IMAGE_GENERATION_FAILURE', payload: "Sorry, I couldn't edit the image. Please try again." });
        }
    };

     const generateCardStory = async () => {
        dispatch({ type: 'START_STORY_GENERATION' });
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const storyPrompt = `Based on this generative AI prompt for a credit card design, write a short, inspiring "Card Story" (2-3 sentences) about what this card represents. Prompt: "${state.prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: storyPrompt });
            dispatch({ type: 'STORY_GENERATION_SUCCESS', payload: response.text });
        } catch (err) {
            dispatch({ type: 'STORY_GENERATION_FAILURE', payload: "Could not generate a story for this design." });
        }
    };

    const displayImage = state.generatedImage || state.baseImage;

    const mainContent = useMemo(() => {
        if (state.activeTab === 'GALLERY') {
            return (
                 <Card title="Community Gallery">
                    <p className="text-gray-400 mb-6">Explore designs created by other users.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_COMMUNITY_GALLERY.map(design => (
                            <div key={design.id} className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 group">
                                <img src={design.generatedImage} alt={design.prompt} className="w-full aspect-[85.6/54] object-cover transition-transform group-hover:scale-105" />
                                <div className="p-4">
                                    <p className="text-white font-semibold truncate group-hover:whitespace-normal">{design.prompt}</p>
                                    <p className="text-sm text-gray-400 mt-1 italic">by {design.author}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                {/* Left Column: Controls */}
                <div className="xl:col-span-2 space-y-6">
                    <Card title="1. Upload & Describe">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div>
                                <p className="text-gray-400 mb-4">Upload a base image.</p>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/50 file:text-cyan-200 hover:file:bg-cyan-600"/>
                            </div>
                             <div>
                                <p className="text-gray-400 mb-4">Describe your vision with AI.</p>
                                <textarea 
                                    value={state.prompt} 
                                    onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
                                    placeholder="e.g., Make this image look like a watercolor painting" 
                                    className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" 
                                    disabled={state.isGeneratingImage || !state.baseImage}
                                />
                             </div>
                        </div>
                    </Card>

                    <Card title="2. Refine with Advanced Options">
                        <StyleSelector
                            selectedStyleId={state.customizationOptions.styleId}
                            onSelect={(id) => dispatch({ type: 'SET_CUSTOMIZATION_OPTION', payload: { key: 'styleId', value: id }})}
                        />
                        <ColorPalettePicker
                             selectedPaletteId={state.customizationOptions.paletteId}
                             onSelect={(id) => dispatch({ type: 'SET_CUSTOMIZATION_OPTION', payload: { key: 'paletteId', value: id }})}
                        />
                         {/* Placeholder for more controls like Text Overlay, Finishes etc. */}
                    </Card>

                    <Card title="3. Generate & Finalize">
                        <div className="flex flex-col md:flex-row gap-4">
                            <button onClick={handleGenerate} disabled={state.isGeneratingImage || !state.baseImage || !state.prompt} className="flex-grow py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50 transition-all">
                                {state.isGeneratingImage ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Generating...
                                    </span>
                                ) : 'Forge My Design'}
                            </button>
                             <button onClick={() => dispatch({ type: 'TOGGLE_ORDER_MODAL' })} disabled={!state.generatedImage} className="flex-grow py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50">
                                Order Physical Card
                            </button>
                        </div>
                         {state.error && <p className="text-red-400 text-center mt-2">{state.error}</p>}
                    </Card>
                    
                    <Card title="AI-Generated Card Story">
                        {state.isGeneratingStory ? <p className="text-gray-400">Generating story...</p> : state.currentStory ? <p className="text-gray-300 italic">"{state.currentStory}"</p> : <p className="text-gray-400">Generate a story for your unique card design.</p>}
                        <button onClick={generateCardStory} disabled={state.isGeneratingStory || !displayImage} className="mt-4 px-4 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm disabled:opacity-50">{state.isGeneratingStory ? 'Writing...' : 'Generate Story'}</button>
                    </Card>
                </div>

                {/* Right Column: Preview & History */}
                <div className="xl:col-span-1 space-y-6 sticky top-8">
                     <Card title="Live Preview">
                        <div className="w-full max-w-sm mx-auto aspect-[85.6/54] rounded-xl bg-gray-900/50 overflow-hidden shadow-2xl border border-gray-600 flex items-center justify-center">
                            {state.isGeneratingImage && <div className="text-cyan-300 p-4 text-center">The AI is forging your vision...</div>}
                            {!state.isGeneratingImage && displayImage && <img src={displayImage} alt="Card Preview" className="w-full h-full object-cover"/>}
                            {!state.isGeneratingImage && !displayImage && <div className="text-gray-500 p-4 text-center">Upload an image and write a prompt to start</div>}
                        </div>
                    </Card>
                    <Card title="Design History">
                        {state.designHistory.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {state.designHistory.map(design => (
                                    <div key={design.id} className="flex items-center gap-4 p-2 bg-gray-800/50 rounded-lg">
                                        <img src={design.generatedImage} alt="design history" className="w-20 aspect-[85.6/54] object-cover rounded" />
                                        <div>
                                            <p className="text-sm text-white truncate">{design.prompt}</p>
                                            <p className="text-xs text-gray-400">{design.createdAt.toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-gray-500 text-center py-4">Your generated designs will appear here.</p>
                        )}
                    </Card>
                </div>
            </div>
        );
    }, [state, handleFileChange, handleGenerate, generateCardStory]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-white tracking-wider">Card Customization Forge</h2>
                <div className="flex-shrink-0">
                    <div className="flex items-center bg-gray-800 rounded-full p-1 border border-gray-700">
                        <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'DESIGN' })} className={`px-6 py-2 text-sm rounded-full ${state.activeTab === 'DESIGN' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Design Studio</button>
                        <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'GALLERY' })} className={`px-6 py-2 text-sm rounded-full ${state.activeTab === 'GALLERY' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Community Gallery</button>
                    </div>
                </div>
            </div>

            {mainContent}
            
            <OrderModal 
                isOpen={state.isOrderModalOpen}
                onClose={() => dispatch({ type: 'TOGGLE_ORDER_MODAL' })}
                designImage={state.generatedImage}
            />
        </div>
    );
};

export default CardCustomizationView;
```