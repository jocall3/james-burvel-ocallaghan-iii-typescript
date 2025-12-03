// components/views/personal/PersonalizationView.tsx
import React, { useContext, useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { IllusionType } from '../../../types';
import { GoogleGenAI } from '@google/genai';

// --- Enhanced Types for a Real-World Application ---

export type ColorValue = string; // e.g., '#RRGGBB', 'rgba(r,g,b,a)'
export type Gradient = { from: ColorValue; to: ColorValue; direction?: string };
export type FontStyle = 'normal' | 'italic' | 'oblique';
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

export interface ThemeFont {
    family: string;
    weight: FontWeight;
    style: FontStyle;
    size: string; // e.g., '16px', '1rem'
}

export interface Theme {
    id: string;
    name: string;
    isCustom?: boolean;
    colors: {
        primary: ColorValue;
        secondary: ColorValue;
        accent: ColorValue;
        textPrimary: ColorValue;
        textSecondary: ColorValue;
        background: ColorValue | Gradient;
        cardBackground: ColorValue;
        borderColor: ColorValue;
        success: ColorValue;
        warning: ColorValue;
        error: ColorValue;
    };
    fonts: {
        heading: ThemeFont;
        body: ThemeFont;
    };
    styles: {
        borderRadius: string;
        cardShadow: string;
        blurIntensity?: string; // for glassmorphism effects
    };
}

export interface Widget {
    id: string;
    name: string;
    description: string;
    component: string; // Component identifier
    defaultSize: { width: number; height: number }; // Grid units
}

export interface LayoutConfiguration {
    [widgetId: string]: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

export type SoundPack = {
    id: string;
    name: string;
    sounds: {
        notification: string; // URL to sound file
        confirmation: string;
        error: string;
        uiClick: string;
    };
};

export interface AccessibilitySettings {
    fontSizeMultiplier: number; // 1 = normal, 1.5 = 50% larger
    highContrastMode: boolean;
    reducedMotion: boolean;
    colorBlindFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// --- Mock Data and Constants ---

export const PREDEFINED_THEMES: Theme[] = [
    {
        id: 'default-dark',
        name: 'Default Dark',
        colors: {
            primary: '#0D9488', // Teal-600
            secondary: '#475569', // Slate-600
            accent: '#38BDF8', // Sky-400
            textPrimary: '#F8FAFC', // Slate-50
            textSecondary: '#94A3B8', // Slate-400
            background: { from: '#0F172A', to: '#1E293B', direction: 'to bottom right' }, // Slate-900 to Slate-800
            cardBackground: 'rgba(30, 41, 59, 0.5)', // Slate-800 with transparency
            borderColor: '#334155', // Slate-700
            success: '#22C55E', // Green-500
            warning: '#F59E0B', // Amber-500
            error: '#EF4444', // Red-500
        },
        fonts: {
            heading: { family: 'Inter, sans-serif', weight: 'bold', style: 'normal', size: '1.5rem' },
            body: { family: 'Inter, sans-serif', weight: 'normal', style: 'normal', size: '1rem' },
        },
        styles: {
            borderRadius: '0.75rem',
            cardShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            blurIntensity: '10px',
        },
    },
    {
        id: 'cyberpunk-neon',
        name: 'Cyberpunk Neon',
        colors: {
            primary: '#F43F5E', // Rose-500
            secondary: '#6D28D9', // Violet-700
            accent: '#00FFFF', // Cyan
            textPrimary: '#ECFDF5',
            textSecondary: '#A78BFA', // Violet-400
            background: { from: '#020617', to: '#1D1B44' }, // Slate-950 to Indigo-950
            cardBackground: 'rgba(28, 25, 62, 0.6)',
            borderColor: '#4F46E5', // Indigo-600
            success: '#39FF14', // Neon Green
            warning: '#FFFF00', // Neon Yellow
            error: '#FF073A', // Neon Red
        },
        fonts: {
            heading: { family: '"Orbitron", sans-serif', weight: 700, style: 'normal', size: '1.6rem' },
            body: { family: '"Rajdhani", sans-serif', weight: 400, style: 'normal', size: '1.1rem' },
        },
        styles: {
            borderRadius: '0.25rem',
            cardShadow: '0 0 15px rgba(244, 63, 94, 0.5)',
            blurIntensity: '5px',
        },
    },
    {
        id: 'solar-flare',
        name: 'Solar Flare',
        colors: {
            primary: '#F97316', // Orange-500
            secondary: '#DC2626', // Red-600
            accent: '#FACC15', // Yellow-400
            textPrimary: '#FFFFFF',
            textSecondary: '#FDE68A', // Yellow-200
            background: { from: '#450A0A', to: '#7F1D1D' }, // Red-950 to Red-900
            cardBackground: 'rgba(127, 29, 29, 0.4)',
            borderColor: '#991B1B', // Red-800
            success: '#84CC16', // Lime-500
            warning: '#F59E0B', // Amber-500
            error: '#E11D48', // Rose-600
        },
        fonts: {
            heading: { family: '"Exo 2", sans-serif', weight: 800, style: 'normal', size: '1.5rem' },
            body: { family: '"Roboto", sans-serif', weight: 400, style: 'normal', size: '1rem' },
        },
        styles: {
            borderRadius: '1rem',
            cardShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
            blurIntensity: '15px',
        },
    },
    {
        id: 'minimalist-light',
        name: 'Minimalist Light',
        colors: {
            primary: '#2563EB', // Blue-600
            secondary: '#475569', // Slate-600
            accent: '#16A34A', // Green-600
            textPrimary: '#1E293B', // Slate-800
            textSecondary: '#64748B', // Slate-500
            background: '#F1F5F9', // Slate-100
            cardBackground: '#FFFFFF',
            borderColor: '#E2E8F0', // Slate-200
            success: '#16A34A',
            warning: '#F59E0B',
            error: '#DC2626',
        },
        fonts: {
            heading: { family: 'system-ui, sans-serif', weight: 600, style: 'normal', size: '1.5rem' },
            body: { family: 'system-ui, sans-serif', weight: 400, style: 'normal', size: '1rem' },
        },
        styles: {
            borderRadius: '0.5rem',
            cardShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            blurIntensity: '0px',
        },
    }
];

export const AVAILABLE_WIDGETS: Widget[] = [
    { id: 'clock', name: 'World Clock', description: 'Display time from different timezones.', component: 'ClockWidget', defaultSize: { width: 2, height: 1 } },
    { id: 'weather', name: 'Weather Forecast', description: 'Show current weather and forecast.', component: 'WeatherWidget', defaultSize: { width: 2, height: 2 } },
    { id: 'news', name: 'News Feed', description: 'Latest headlines from your favorite sources.', component: 'NewsWidget', defaultSize: { width: 3, height: 3 } },
    { id: 'system', name: 'System Monitor', description: 'CPU, RAM, and network usage.', component: 'SystemWidget', defaultSize: { width: 2, height: 2 } },
    { id: 'notes', name: 'Quick Notes', description: 'Jot down your thoughts.', component: 'NotesWidget', defaultSize: { width: 2, height: 2 } },
    { id: 'calendar', name: 'Calendar', description: 'View your upcoming events.', component: 'CalendarWidget', defaultSize: { width: 3, height: 3 } },
];

export const SOUND_PACKS: SoundPack[] = [
    { id: 'modern', name: 'Modern', sounds: { notification: '/sounds/modern_notification.mp3', confirmation: '/sounds/modern_confirmation.mp3', error: '/sounds/modern_error.mp3', uiClick: '/sounds/modern_click.mp3' } },
    { id: 'retro', name: 'Retro Gaming', sounds: { notification: '/sounds/retro_notification.wav', confirmation: '/sounds/retro_confirmation.wav', error: '/sounds/retro_error.wav', uiClick: '/sounds/retro_click.wav' } },
    { id: 'sci-fi', name: 'Sci-Fi Interface', sounds: { notification: '/sounds/scifi_notification.ogg', confirmation: '/sounds/scifi_confirmation.ogg', error: '/sounds/scifi_error.ogg', uiClick: '/sounds/scifi_click.ogg' } },
    { id: 'none', name: 'Silent', sounds: { notification: '', confirmation: '', error: '', uiClick: '' } },
];

// --- Helper Components ---

export const ColorPicker: React.FC<{ label: string; color: ColorValue; onChange: (color: ColorValue) => void }> = ({ label, color, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <div className="relative">
            <input
                type="color"
                value={color.startsWith('#') ? color : '#ffffff'}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 p-0 border-none rounded-md cursor-pointer appearance-none"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

export const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; unit?: string }> = ({ label, value, min, max, step, onChange, unit }) => (
    <div>
        <label className="text-sm text-gray-300 flex justify-between">
            <span>{label}</span>
            <span>{value}{unit}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm"
        />
    </div>
);

export const FontSelector: React.FC<{ label: string; font: ThemeFont; onChange: (font: ThemeFont) => void }> = ({ label, font, onChange }) => {
    const availableFonts = ['Inter', 'Roboto', 'Orbitron', 'Rajdhani', 'Exo 2', 'system-ui', 'monospace'];
    const availableWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900, 'normal', 'bold'];

    return (
        <div className="space-y-2 p-2 border border-gray-700 rounded-lg">
            <h5 className="font-semibold text-white">{label}</h5>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-gray-400">Family</label>
                    <select value={font.family.split(',')[0]} onChange={e => onChange({ ...font, family: `${e.target.value}, sans-serif` })} className="select select-bordered select-sm w-full bg-gray-700/50">
                        {availableFonts.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400">Weight</label>
                    <select value={font.weight} onChange={e => onChange({ ...font, weight: typeof e.target.value === 'string' ? e.target.value : parseInt(e.target.value, 10) })} className="select select-bordered select-sm w-full bg-gray-700/50">
                        {availableWeights.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400">Size (px)</label>
                    <input type="number" value={parseInt(font.size, 10)} onChange={e => onChange({ ...font, size: `${e.target.value}px` })} className="input input-sm w-full bg-gray-700/50" />
                </div>
                <div>
                    <label className="text-xs text-gray-400">Style</label>
                    <select value={font.style} onChange={e => onChange({ ...font, style: e.target.value as FontStyle })} className="select select-bordered select-sm w-full bg-gray-700/50">
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                        <option value="oblique">Oblique</option>
                    </select>
                </div>
            </div>
        </div>
    );
};


// --- Main View and Sub-Components ---

type PersonalizationState = {
    activeTheme: Theme;
    customThemes: Theme[];
    dashboardLayout: LayoutConfiguration;
    activeSoundPack: SoundPack;
    accessibility: AccessibilitySettings;
    aiBackgroundHistory: string[];
    showThemeCreator: boolean;
};

type PersonalizationAction =
    | { type: 'SET_THEME'; payload: Theme }
    | { type: 'UPDATE_CUSTOM_THEME'; payload: Theme }
    | { type: 'SAVE_CUSTOM_THEME'; payload: Theme }
    | { type: 'DELETE_CUSTOM_THEME'; payload: string }
    | { type: 'SET_LAYOUT'; payload: LayoutConfiguration }
    | { type: 'SET_SOUND_PACK'; payload: SoundPack }
    | { type: 'SET_ACCESSIBILITY'; payload: Partial<AccessibilitySettings> }
    | { type: 'ADD_AI_HISTORY'; payload: string }
    | { type: 'TOGGLE_THEME_CREATOR'; payload: boolean }
    | { type: 'RESET_SETTINGS' };

const initialState: PersonalizationState = {
    activeTheme: PREDEFINED_THEMES[0],
    customThemes: [],
    dashboardLayout: {
        'clock': { x: 0, y: 0, w: 2, h: 1 },
        'weather': { x: 2, y: 0, w: 2, h: 2 },
    },
    activeSoundPack: SOUND_PACKS[0],
    accessibility: {
        fontSizeMultiplier: 1,
        highContrastMode: false,
        reducedMotion: false,
        colorBlindFilter: 'none',
    },
    aiBackgroundHistory: [],
    showThemeCreator: false,
};

const personalizationReducer = (state: PersonalizationState, action: PersonalizationAction): PersonalizationState => {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, activeTheme: action.payload };
        case 'SAVE_CUSTOM_THEME':
            const existingIndex = state.customThemes.findIndex(t => t.id === action.payload.id);
            if (existingIndex > -1) {
                const updatedThemes = [...state.customThemes];
                updatedThemes[existingIndex] = action.payload;
                return { ...state, customThemes: updatedThemes, activeTheme: action.payload };
            }
            return { ...state, customThemes: [...state.customThemes, action.payload], activeTheme: action.payload };
        case 'DELETE_CUSTOM_THEME':
            return {
                ...state,
                customThemes: state.customThemes.filter(t => t.id !== action.payload),
                activeTheme: state.activeTheme.id === action.payload ? PREDEFINED_THEMES[0] : state.activeTheme,
            };
        case 'UPDATE_CUSTOM_THEME':
             return { ...state, activeTheme: action.payload };
        case 'SET_LAYOUT':
            return { ...state, dashboardLayout: action.payload };
        case 'SET_SOUND_PACK':
            return { ...state, activeSoundPack: action.payload };
        case 'SET_ACCESSIBILITY':
            return { ...state, accessibility: { ...state.accessibility, ...action.payload } };
        case 'ADD_AI_HISTORY':
            return { ...state, aiBackgroundHistory: [action.payload, ...state.aiBackgroundHistory].slice(0, 10) };
        case 'TOGGLE_THEME_CREATOR':
            return { ...state, showThemeCreator: action.payload };
        case 'RESET_SETTINGS':
            return { ...initialState, customThemes: state.customThemes }; // Keep custom themes on reset
        default:
            return state;
    }
};

export const ThemePreview: React.FC<{ theme: Theme }> = ({ theme }) => {
    const backgroundStyle = typeof theme.colors.background === 'string'
        ? { backgroundColor: theme.colors.background }
        : { backgroundImage: `linear-gradient(${theme.colors.background.direction || 'to bottom right'}, ${theme.colors.background.from}, ${theme.colors.background.to})` };

    return (
        <div className="p-4 rounded-lg border-2" style={{ borderColor: theme.colors.borderColor, ...backgroundStyle }}>
            <h3 style={{ ...theme.fonts.heading, color: theme.colors.textPrimary, fontSize: '1.2rem' }}>{theme.name}</h3>
            <div
                className="p-3 mt-2 rounded-md"
                style={{
                    backgroundColor: theme.colors.cardBackground,
                    boxShadow: theme.styles.cardShadow,
                    borderRadius: theme.styles.borderRadius,
                    backdropFilter: `blur(${theme.styles.blurIntensity})`,
                }}
            >
                <p style={{ ...theme.fonts.body, color: theme.colors.textSecondary }}>This is how body text will look. It's designed for readability.</p>
                <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1 text-sm rounded-md" style={{ backgroundColor: theme.colors.primary, color: theme.colors.textPrimary }}>Primary</button>
                    <button className="px-3 py-1 text-sm rounded-md" style={{ backgroundColor: theme.colors.accent, color: '#000' }}>Accent</button>
                </div>
            </div>
        </div>
    );
};

export const ThemeCustomizer: React.FC<{ theme: Theme; onThemeChange: (theme: Theme) => void; onSave: (theme: Theme) => void; onCancel: () => void }> = ({ theme, onThemeChange, onSave, onCancel }) => {
    const [name, setName] = useState(theme.name);
    const handleColorChange = (key: keyof Theme['colors'], value: ColorValue) => {
        onThemeChange({ ...theme, colors: { ...theme.colors, [key]: value } });
    };

    const handleFontChange = (key: keyof Theme['fonts'], value: ThemeFont) => {
        onThemeChange({ ...theme, fonts: { ...theme.fonts, [key]: value } });
    };

    return (
        <div className="space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white">Theme Customizer</h3>
            <div>
                <label className="text-sm text-gray-300">Theme Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white">Colors</h4>
                    <ColorPicker label="Primary" color={theme.colors.primary} onChange={v => handleColorChange('primary', v)} />
                    <ColorPicker label="Accent" color={theme.colors.accent} onChange={v => handleColorChange('accent', v)} />
                    <ColorPicker label="Text" color={theme.colors.textPrimary} onChange={v => handleColorChange('textPrimary', v)} />
                    <ColorPicker label="Card BG" color={theme.colors.cardBackground} onChange={v => handleColorChange('cardBackground', v)} />
                    <ColorPicker label="Border" color={theme.colors.borderColor} onChange={v => handleColorChange('borderColor', v)} />
                </div>
                <div className="space-y-2 p-3 bg-gray-800/50 rounded-lg">
                    <h4 className="font-semibold text-white">Styles</h4>
                    <Slider label="Border Radius" value={parseInt(theme.styles.borderRadius)} min={0} max={32} step={1} unit="px" onChange={v => onThemeChange({ ...theme, styles: { ...theme.styles, borderRadius: `${v}px` } })} />
                    <Slider label="Glassmorphism Blur" value={parseInt(theme.styles.blurIntensity || '0')} min={0} max={20} step={1} unit="px" onChange={v => onThemeChange({ ...theme, styles: { ...theme.styles, blurIntensity: `${v}px` } })} />
                </div>
            </div>
            
            <FontSelector label="Heading Font" font={theme.fonts.heading} onChange={f => handleFontChange('heading', f)} />
            <FontSelector label="Body Font" font={theme.fonts.body} onChange={f => handleFontChange('body', f)} />

            <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Live Preview</h4>
                <ThemePreview theme={theme} />
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
                <button onClick={() => onSave({ ...theme, name })} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Save Theme</button>
            </div>
        </div>
    );
};

export const WidgetLayoutEditor: React.FC<{ layout: LayoutConfiguration; onLayoutChange: (layout: LayoutConfiguration) => void }> = ({ layout, onLayoutChange }) => {
    const [widgets, setWidgets] = useState(AVAILABLE_WIDGETS.filter(w => layout[w.id]));

    const addWidget = (widget: Widget) => {
        if (!layout[widget.id]) {
            const newLayout = { ...layout, [widget.id]: { x: 0, y: 0, ...widget.defaultSize } };
            onLayoutChange(newLayout);
            setWidgets([...widgets, widget]);
        }
    };
    
    const removeWidget = (widgetId: string) => {
        const { [widgetId]: _, ...restLayout } = layout;
        onLayoutChange(restLayout);
        setWidgets(widgets.filter(w => w.id !== widgetId));
    };
    
    // In a real app, this would be a drag and drop interface.
    // For this example, we'll use a simplified list manager.
    return (
        <div>
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-600 min-h-[200px]">
                {widgets.map(widget => (
                    <div key={widget.id} className="bg-cyan-900/50 p-3 rounded-lg flex flex-col justify-between" style={{ gridColumn: `span ${layout[widget.id].w}`, gridRow: `span ${layout[widget.id].h}` }}>
                        <div>
                            <h5 className="font-bold text-white">{widget.name}</h5>
                            <p className="text-xs text-gray-400">{widget.description}</p>
                        </div>
                        <button onClick={() => removeWidget(widget.id)} className="text-red-400 text-xs self-end hover:underline">Remove</button>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Available Widgets</h4>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_WIDGETS.map(widget => (
                        !layout[widget.id] && (
                            <button key={widget.id} onClick={() => addWidget(widget)} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                                + {widget.name}
                            </button>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export const AccessibilityManager: React.FC<{ settings: AccessibilitySettings; onChange: (settings: Partial<AccessibilitySettings>) => void }> = ({ settings, onChange }) => {
    return (
        <div className="space-y-4">
            <Slider 
                label="Font Size" 
                value={settings.fontSizeMultiplier} 
                min={0.8} max={2} step={0.1} 
                onChange={v => onChange({ fontSizeMultiplier: v })} 
                unit="x" 
            />
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <label className="text-white">High Contrast Mode</label>
                <input type="checkbox" className="toggle toggle-primary" checked={settings.highContrastMode} onChange={e => onChange({ highContrastMode: e.target.checked })} />
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                <label className="text-white">Reduce Motion</label>
                <input type="checkbox" className="toggle toggle-primary" checked={settings.reducedMotion} onChange={e => onChange({ reducedMotion: e.target.checked })} />
            </div>
            <div>
                <label className="text-sm text-gray-300">Color Blindness Filter</label>
                <select 
                    value={settings.colorBlindFilter} 
                    onChange={e => onChange({ colorBlindFilter: e.target.value as AccessibilitySettings['colorBlindFilter'] })} 
                    className="select select-bordered w-full bg-gray-700/50"
                >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia</option>
                    <option value="deuteranopia">Deuteranopia</option>
                    <option value="tritanopia">Tritanopia</option>
                </select>
            </div>
        </div>
    );
};


// --- The Main Component ---

const PersonalizationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PersonalizationView must be within a DataProvider.");

    const { customBackgroundUrl, setCustomBackgroundUrl, activeIllusion, setActiveIllusion } = context;

    // --- State Management ---
    const [state, dispatch] = useReducer(personalizationReducer, initialState);
    const [imageUrl, setImageUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('An isolated lighthouse on a stormy sea, digital painting');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [currentCustomTheme, setCurrentCustomTheme] = useState<Theme | null>(null);

    // --- Side Effects ---
    useEffect(() => {
        // Here you would apply the theme to the entire application,
        // for example by setting CSS variables on the :root element.
        const root = document.documentElement;
        const theme = state.activeTheme;
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-text-primary', theme.colors.textPrimary);
        // ... and so on for all theme properties
        
        // Apply accessibility settings
        root.style.fontSize = `${16 * state.accessibility.fontSizeMultiplier}px`;
        root.classList.toggle('high-contrast', state.accessibility.highContrastMode);
        root.classList.toggle('reduced-motion', state.accessibility.reducedMotion);
        root.setAttribute('data-color-filter', state.accessibility.colorBlindFilter);

    }, [state.activeTheme, state.accessibility]);
    
    useEffect(() => {
        // Persist settings to local storage
        try {
            const settingsToSave = {
                activeThemeId: state.activeTheme.id,
                customThemes: state.customThemes,
                layout: state.dashboardLayout,
                soundPackId: state.activeSoundPack.id,
                accessibility: state.accessibility
            };
            localStorage.setItem('personalizationSettings', JSON.stringify(settingsToSave));
        } catch (err) {
            console.error("Failed to save settings to local storage", err);
        }
    }, [state]);

    useEffect(() => {
        // Load settings from local storage on initial mount
        try {
            const savedSettings = localStorage.getItem('personalizationSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                const allThemes = [...PREDEFINED_THEMES, ...parsed.customThemes];
                const activeTheme = allThemes.find(t => t.id === parsed.activeThemeId) || PREDEFINED_THEMES[0];
                const activeSoundPack = SOUND_PACKS.find(s => s.id === parsed.soundPackId) || SOUND_PACKS[0];
                
                dispatch({ type: 'SET_THEME', payload: activeTheme });
                if (parsed.customThemes) {
                    parsed.customThemes.forEach((theme: Theme) => dispatch({ type: 'SAVE_CUSTOM_THEME', payload: theme }));
                }
                if (parsed.layout) dispatch({ type: 'SET_LAYOUT', payload: parsed.layout });
                if (activeSoundPack) dispatch({ type: 'SET_SOUND_PACK', payload: activeSoundPack });
                if (parsed.accessibility) dispatch({ type: 'SET_ACCESSIBILITY', payload: parsed.accessibility });
            }
        } catch (err) {
            console.error("Failed to load settings from local storage", err);
        }
    }, []);


    // --- Event Handlers ---
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: aiPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setCustomBackgroundUrl(generatedUrl);
            dispatch({ type: 'ADD_AI_HISTORY', payload: generatedUrl });
        } catch (err) {
            setError('Could not generate image. The model may have safety concerns with your prompt.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const startNewTheme = () => {
        const newTheme: Theme = {
            ...PREDEFINED_THEMES[0], // Start from default
            id: `custom-${Date.now()}`,
            name: 'My New Theme',
            isCustom: true,
        };
        setCurrentCustomTheme(newTheme);
        dispatch({ type: 'TOGGLE_THEME_CREATOR', payload: true });
    };
    
    const editTheme = (theme: Theme) => {
        setCurrentCustomTheme(theme);
        dispatch({ type: 'TOGGLE_THEME_CREATOR', payload: true });
    };
    
    const handleSaveTheme = (theme: Theme) => {
        dispatch({ type: 'SAVE_CUSTOM_THEME', payload: theme });
        dispatch({ type: 'TOGGLE_THEME_CREATOR', payload: false });
        setCurrentCustomTheme(null);
    };

    const handleCancelThemeEdit = () => {
        dispatch({ type: 'TOGGLE_THEME_CREATOR', payload: false });
        setCurrentCustomTheme(null);
    };
    
    const allThemes = useMemo(() => [...PREDEFINED_THEMES, ...state.customThemes], [state.customThemes]);

    const exportSettings = () => {
        const settingsString = localStorage.getItem('personalizationSettings');
        if (settingsString) {
            const blob = new Blob([settingsString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'app-settings.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        localStorage.setItem('personalizationSettings', text);
                        // Trigger a reload or re-initialization to apply settings
                        window.location.reload();
                    }
                } catch (err) {
                    console.error("Error importing settings:", err);
                    setError("Failed to import settings file. It may be corrupt.");
                }
            };
            reader.readAsText(file);
        }
    };

    
    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            
             {state.showThemeCreator && currentCustomTheme ? (
                <ThemeCustomizer 
                    theme={currentCustomTheme} 
                    onThemeChange={setCurrentCustomTheme}
                    onSave={handleSaveTheme} 
                    onCancel={handleCancelThemeEdit} 
                />
            ) : (
             <>
                <Card title="Appearance Theme">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allThemes.map(theme => (
                             <div key={theme.id} className={`relative p-1 rounded-lg cursor-pointer border-2 ${state.activeTheme.id === theme.id ? 'border-cyan-400' : 'border-transparent'}`} onClick={() => dispatch({ type: 'SET_THEME', payload: theme })}>
                                <ThemePreview theme={theme} />
                                {theme.isCustom && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                         <button onClick={(e) => { e.stopPropagation(); editTheme(theme); }} className="p-1 bg-gray-800/70 rounded-full hover:bg-cyan-600 text-white text-xs">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_CUSTOM_THEME', payload: theme.id }) }} className="p-1 bg-gray-800/70 rounded-full hover:bg-red-600 text-white text-xs">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div onClick={startNewTheme} className="flex items-center justify-center p-4 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-cyan-400 hover:bg-gray-800 cursor-pointer transition-colors">
                            <div className="text-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                <span className="mt-2 block font-semibold text-white">Create New Theme</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Background Style">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-white mb-2">Dynamic Illusion</h4>
                            <div className="flex gap-4">
                                <div className="flex-1 flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-white">Aurora Illusion</h4>
                                        <p className="text-sm text-gray-400">A dynamic, flowing gradient inspired by the northern lights.</p>
                                    </div>
                                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'aurora'} onChange={() => setActiveIllusion('aurora')} />
                                </div>
                                 <div className="flex-1 flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                                    <div><h4 className="font-semibold text-white">None</h4><p className="text-sm text-gray-400">Use theme background color.</p></div>
                                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'none'} onChange={() => setActiveIllusion('none')} />
                                </div>
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-white mb-2">AI Background Generator</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div>
                                    <p className="text-gray-400 mb-4">Describe the background you want, and our AI will create it for you.</p>
                                    <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                                    <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate & Set Background'}</button>
                                    {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                                </div>
                                <div className="h-48 rounded-lg bg-gray-900/50 flex items-center justify-center overflow-hidden">
                                    {isGenerating ? <div className="loading loading-lg text-cyan-300"></div> : 
                                    customBackgroundUrl && customBackgroundUrl.startsWith('data:image') ? 
                                        <img src={customBackgroundUrl} alt="Generated background" className="w-full h-full object-cover" /> :
                                        <p className="text-gray-500">Preview will appear here</p>
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white mb-2">Custom Background Image</h4>
                            <p className="text-gray-400 mb-4">Or, paste an image URL for a static background.</p>
                            <div className="flex gap-2">
                                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                                <button onClick={() => setCustomBackgroundUrl(imageUrl)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Set Image</button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Dashboard Layout">
                    <WidgetLayoutEditor layout={state.dashboardLayout} onLayoutChange={layout => dispatch({ type: 'SET_LAYOUT', payload: layout })} />
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Sound & Notifications">
                        <div className="space-y-4">
                            <label className="text-sm text-gray-300">Sound Pack</label>
                            <select value={state.activeSoundPack.id} onChange={e => dispatch({type: 'SET_SOUND_PACK', payload: SOUND_PACKS.find(s => s.id === e.target.value)!})} className="select select-bordered w-full bg-gray-700/50">
                                {SOUND_PACKS.map(pack => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
                            </select>
                            {/* Add volume sliders here in a real app */}
                        </div>
                    </Card>

                    <Card title="Accessibility">
                        <AccessibilityManager settings={state.accessibility} onChange={settings => dispatch({ type: 'SET_ACCESSIBILITY', payload: settings })} />
                    </Card>
                </div>
                
                <Card title="Data Management">
                    <div className="space-y-4">
                        <p className="text-gray-400">Export your personalization settings to a file, or import them to restore a previous configuration.</p>
                        <div className="flex gap-4">
                            <button onClick={exportSettings} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Export Settings</button>
                             <label htmlFor="import-button" className="flex-1 py-2 text-center bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer">
                                Import Settings
                            </label>
                            <input type="file" id="import-button" className="hidden" accept=".json" onChange={importSettings} />
                        </div>
                        <div className="pt-4 border-t border-gray-700">
                             <p className="text-gray-400 mb-2">Reset all your personalization settings to their default values. This action cannot be undone.</p>
                             <button onClick={() => dispatch({ type: 'RESET_SETTINGS' })} className="w-full py-2 bg-red-800/80 hover:bg-red-700 text-white rounded-lg">Reset All Settings</button>
                        </div>
                    </div>
                </Card>
             </>
            )}
        </div>
    );
};

export default PersonalizationView;
