
// Copyright James Burvel OCallaghan III
// President Citibank Demo Business Inc.

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature } from '../../types.ts';

// --- Local Storage Keys ---
const LS_KEY_PINNED_FEATURES = 'feature_dock_pinned_features';
const LS_KEY_RECENT_FEATURES = 'feature_dock_recent_features';
const LS_KEY_DOCK_PREFERENCES = 'feature_dock_preferences'; // NEW: For user-specific dock settings
const LS_KEY_SHOW_ONBOARDING_HINT = 'feature_dock_show_onboarding_hint'; // NEW: For onboarding hint visibility
const MAX_RECENT_FEATURES = 10; // Limit for recently used features

// --- New Interfaces and Default Preferences ---
export type FeatureSortOrder = 'default' | 'name-asc' | 'name-desc' | 'category-asc' | 'category-desc';
export type FeatureGridSize = 'small' | 'medium' | 'large'; // NEW: Grid size for feature buttons
export interface FeatureDockPreferences {
    sortOrder: FeatureSortOrder;
    gridSize: FeatureGridSize; // NEW
    showRecentSection: boolean; // NEW: Toggle visibility of recent features section
    showCategoryFilters: boolean; // NEW: Toggle visibility of category filter buttons
    columnCount: number; // NEW: Number of columns for the feature grids
}
const DEFAULT_DOCK_PREFERENCES: FeatureDockPreferences = {
    sortOrder: 'default',
    gridSize: 'medium', // NEW
    showRecentSection: true, // NEW
    showCategoryFilters: true, // NEW
    columnCount: 6, // NEW: Default to 6 columns
};

// --- Local Storage Helper Functions (Fixes build error by adding 'extends unknown' to generic types) ---
const getLocalStorageItem = <T extends unknown>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error: unknown) { // FIX: Explicitly type error
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

const setLocalStorageItem = <T extends unknown>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error: unknown) { // FIX: Explicitly type error
        console.error(`Error writing to localStorage for key "${key}":`, error);
    }
};

// --- Utility Hooks ---
// NEW: useDebounce hook for search input (Fixes build error by adding 'extends unknown' to generic type)
export const useDebounce = <T extends unknown>(value: T, delay: number): T => {
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
};

// --- Exported FeatureContextMenu Component ---
export interface FeatureContextMenuProps {
    feature: Feature;
    position: { x: number; y: number };
    isPinned: boolean;
    onClose: () => void;
    onPinToggle: (id: string) => void;
    onShowDetails: (id: string) => void;
}

export const FeatureContextMenu: React.FC<FeatureContextMenuProps> = ({
    feature,
    position,
    isPinned,
    onClose,
    onPinToggle,
    onShowDetails,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Adjust position to keep menu within viewport
    const style: React.CSSProperties = {
        top: position.y,
        left: position.x,
        position: 'fixed',
        zIndex: 1000,
    };

    return (
        <div
            ref={menuRef}
            style={style}
            className="bg-surface border border-border rounded-lg shadow-lg py-1 text-text-primary text-sm min-w-[150px]"
            onClick={onClose} // Close menu on any item click
        >
            <button
                className="block w-full text-left px-4 py-2 hover:bg-background/80"
                onClick={() => onPinToggle(feature.id)}
            >
                {isPinned ? 'Unpin from Dock' : 'Pin to Dock'}
            </button>
            <button
                className="block w-full text-left px-4 py-2 hover:bg-background/80"
                onClick={() => onShowDetails(feature.id)}
            >
                Feature Details
            </button>
            {/* Add more context menu items here if needed */}
        </div>
    );
};

// --- Exported FeatureDetailsModal Component ---
export interface FeatureDetailsModalProps {
    feature: Feature | null;
    onClose: () => void;
}

export const FeatureDetailsModal: React.FC<FeatureDetailsModalProps> = ({ feature, onClose }) => {
    if (!feature) return null;

    return (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">{feature.name}</h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary text-2xl"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <p className="text-text-secondary text-sm mb-4">
                    Category: <span className="text-text-primary font-medium">{feature.category}</span>
                </p>
                <div className="text-text-primary text-6xl mb-4 text-center">{feature.icon}</div>
                <p className="text-text-secondary leading-relaxed">
                    {/* Placeholder description as Feature type doesn't expose it. */}
                    This is a comprehensive description for the "{feature.name}" feature. It is a key component of our system, designed to facilitate specific tasks within the "{feature.category}" category. Users can expect a smooth and intuitive experience, with robust performance and seamless integration with other modules. For more information, please refer to the internal documentation or contact support.
                </p>
                {/* Add more details here if Feature type expands */}
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW: ConfirmationModal Component ---
export interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    return (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-xl font-semibold text-text-primary mb-4">{title}</h3>
                <p className="text-text-secondary mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-background/80 text-text-secondary rounded-lg hover:bg-background/60 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW: SuggestFeatureModal Component ---
export interface SuggestFeatureModalProps {
    onClose: () => void;
    onSubmit: (suggestion: string) => void;
}

export const SuggestFeatureModal: React.FC<SuggestFeatureModalProps> = ({ onClose, onSubmit }) => {
    const [suggestion, setSuggestion] = useState('');

    const handleSubmit = () => {
        if (suggestion.trim()) {
            onSubmit(suggestion);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-primary">Suggest a New Feature</h2>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-text-primary text-2xl"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>
                <p className="text-text-secondary mb-4">
                    Have an idea for a new feature or improvement? Let us know!
                </p>
                <textarea
                    className="w-full h-32 p-3 bg-background/80 border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:outline-none resize-y"
                    placeholder="Describe your feature idea here..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    aria-label="Feature suggestion text area"
                />
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-background/80 text-text-secondary rounded-lg hover:bg-background/60 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!suggestion.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Suggestion
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW: OnboardingHint Component ---
export interface OnboardingHintProps {
    onClose: () => void;
}

export const OnboardingHint: React.FC<OnboardingHintProps> = ({ onClose }) => {
    return (
        <div className="bg-gradient-to-r from-blue-500 to-primary text-white p-4 rounded-lg shadow-lg mb-4 relative">
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-white/80 hover:text-white text-xl"
                aria-label="Dismiss hint"
            >
                &times;
            </button>
            <h4 className="font-bold text-lg mb-2">Welcome to your Feature Dock!</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
                <li><span className="font-semibold">Right-click</span> on any feature to pin it to your dock or view details.</li>
                <li><span className="font-semibold">Drag & Drop</span> pinned features to reorder them easily.</li>
                <li>Use the <span className="font-semibold">Search bar</span> to quickly find features.</li>
                <li>Customize your view with <span className="font-semibold">Sort options, Grid Size, and Category Filters</span>.</li>
            </ul>
        </div>
    );
};


// --- FeatureButton Component (enhanced with drag & drop props and new grid size) ---
interface FeatureButtonProps {
    feature: Feature;
    onOpen: (id: string) => void;
    onContextMenu: (event: React.MouseEvent, feature: Feature) => void;
    isPinned?: boolean;
    // NEW Drag and Drop Props
    draggable?: boolean;
    onDragStart?: (event: React.DragEvent, id: string) => void;
    onDragEnter?: (event: React.DragEvent, id: string) => void;
    onDragLeave?: (event: React.DragEvent, id: string) => void;
    onDragEnd?: (event: React.DragEvent) => void;
    onDrop?: (event: React.DragEvent, id: string) => void;
    onDragOver?: (event: React.DragEvent) => void;
    isDraggingOver?: boolean; // NEW: to apply visual feedback during drag
    gridSize?: FeatureGridSize; // NEW: for dynamic sizing
}

const FeatureButton: React.FC<FeatureButtonProps> = ({
    feature,
    onOpen,
    onContextMenu,
    isPinned,
    // NEW D&D
    draggable = false,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragEnd,
    onDrop,
    onDragOver,
    isDraggingOver,
    gridSize = 'medium', // Default to medium if not provided
}) => {
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default browser context menu
        onContextMenu(e, feature);
    };

    const handleDragStart = (e: React.DragEvent) => {
        if (onDragStart) onDragStart(e, feature.id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', feature.id); // Set data for drag operation
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); // Prevent default browser behavior
        if (onDrop) onDrop(e, feature.id);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault(); // Required to allow drop
        if (onDragEnter) onDragEnter(e, feature.id);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (onDragLeave) onDragLeave(e, feature.id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Required to allow drop
        if (onDragOver) onDragOver(e);
        e.dataTransfer.dropEffect = 'move';
    };

    // Dynamic classes based on gridSize
    const featureButtonSizeClasses: Record<FeatureGridSize, string> = {
        small: 'w-20 h-20 p-1',
        medium: 'w-24 h-24 p-2',
        large: 'w-32 h-32 p-3',
    };

    const iconSizeClasses: Record<FeatureGridSize, string> = {
        small: 'text-xl',
        medium: 'text-2xl',
        large: 'text-3xl',
    };

    const nameTextSizeClasses: Record<FeatureGridSize, string> = {
        small: 'text-[10px]',
        medium: 'text-xs',
        large: 'text-sm font-medium',
    };

    const buttonClass = `relative flex flex-col items-center justify-center rounded-lg bg-surface/50 hover:bg-surface/80 transition-colors group border ${
        featureButtonSizeClasses[gridSize]
    } ${isPinned ? 'border-primary' : 'border-transparent hover:border-border'} ${isDraggingOver ? 'ring-2 ring-blue-400' : ''}`;

    return (
        <button
            onClick={() => onOpen(feature.id)}
            onContextMenu={handleContextMenu}
            draggable={draggable}
            onDragStart={draggable ? handleDragStart : undefined}
            onDragEnter={draggable ? handleDragEnter : undefined}
            onDragLeave={draggable ? handleDragLeave : undefined}
            onDragEnd={draggable ? onDragEnd : undefined}
            onDrop={draggable ? handleDrop : undefined}
            onDragOver={draggable ? handleDragOver : undefined}
            className={buttonClass}
            title={feature.name}
            aria-label={feature.name}
        >
            {isPinned && (
                <span className={`absolute top-1 right-1 text-xs text-primary bg-background rounded-full px-1 py-0.5 ${gridSize === 'small' ? 'scale-75 origin-top-right' : ''}`} aria-hidden="true">
                    &#9733; {/* Star icon */}
                </span>
            )}
            <div className={`text-primary group-hover:scale-110 transition-transform ${iconSizeClasses[gridSize]}`}>{feature.icon}</div>
            <span className={`mt-2 text-center w-full break-words line-clamp-2 ${nameTextSizeClasses[gridSize]}`}>
                {feature.name}
            </span>
        </button>
    );
};

// --- FeatureDock Main Component ---
interface FeatureDockProps {
    onOpen: (id: string) => void;
}

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300); // NEW: Debounced search term
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [pinnedFeatureIds, setPinnedFeatureIds] = useState<string[]>([]);
    const [recentFeatureIds, setRecentFeatureIds] = useState<string[]>([]);
    const [dockPreferences, setDockPreferences] = useState<FeatureDockPreferences>(DEFAULT_DOCK_PREFERENCES); // NEW: Dock preferences

    // State for context menu and details modal
    const [contextMenuState, setContextMenuState] = useState<{
        feature: Feature;
        position: { x: number; y: number };
    } | null>(null);
    const [detailsModalFeature, setDetailsModalFeature] = useState<Feature | null>(null);
    const [showClearRecentConfirm, setShowClearRecentConfirm] = useState(false); // NEW: Confirmation for clearing recent features
    const [showClearPinnedConfirm, setShowClearPinnedConfirm] = useState(false); // NEW: Confirmation for clearing pinned features
    const [showSuggestFeatureModal, setShowSuggestFeatureModal] = useState(false); // NEW: State for suggestion modal
    const [showOnboardingHint, setShowOnboardingHint] = useState(false); // NEW: State for onboarding hints

    // NEW: States for drag & drop reordering of pinned items
    const [draggingFeatureId, setDraggingFeatureId] = useState<string | null>(null);
    const [dragOverFeatureId, setDragOverFeatureId] = useState<string | null>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        setPinnedFeatureIds(getLocalStorageItem(LS_KEY_PINNED_FEATURES, []));
        setRecentFeatureIds(getLocalStorageItem(LS_KEY_RECENT_FEATURES, []));
        setDockPreferences(getLocalStorageItem(LS_KEY_DOCK_PREFERENCES, DEFAULT_DOCK_PREFERENCES)); // NEW

        const hintDismissed = getLocalStorageItem(LS_KEY_SHOW_ONBOARDING_HINT, false);
        if (!hintDismissed) {
            setShowOnboardingHint(true);
        }
    }, []);

    // Save pinned features to localStorage whenever it changes
    useEffect(() => {
        setLocalStorageItem(LS_KEY_PINNED_FEATURES, pinnedFeatureIds);
    }, [pinnedFeatureIds]);

    // Save recent features to localStorage whenever it changes, limit to MAX_RECENT_FEATURES
    useEffect(() => {
        setLocalStorageItem(LS_KEY_RECENT_FEATURES, recentFeatureIds.slice(0, MAX_RECENT_FEATURES));
    }, [recentFeatureIds]);

    // Save dock preferences to localStorage whenever it changes
    useEffect(() => {
        setLocalStorageItem(LS_KEY_DOCK_PREFERENCES, dockPreferences); // NEW
    }, [dockPreferences]);


    // Add a feature to the recent list
    const addRecentFeature = useCallback((featureId: string) => {
        setRecentFeatureIds(prev => {
            const newRecents = [featureId, ...prev.filter(id => id !== featureId)];
            return newRecents;
        });
    }, []);

    // Handle opening a feature, also adds it to recent list
    const handleOpenFeature = useCallback((featureId: string) => {
        onOpen(featureId);
        addRecentFeature(featureId);
    }, [onOpen, addRecentFeature]);

    // Toggle pin status of a feature
    const handleTogglePin = useCallback((featureId: string) => {
        setPinnedFeatureIds(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    }, []);

    // NEW: Handle clearing recent features
    const handleClearRecentFeatures = useCallback(() => {
        setRecentFeatureIds([]);
    }, []);

    // NEW: Handle clearing pinned features
    const handleClearPinnedFeatures = useCallback(() => {
        setPinnedFeatureIds([]);
    }, []);

    // NEW: Handle sort order change
    const handleSortOrderChange = useCallback((order: FeatureSortOrder) => {
        setDockPreferences(prev => ({ ...prev, sortOrder: order }));
    }, []);

    // NEW: Handle feature suggestion
    const handleSubmitSuggestion = useCallback((suggestion: string) => {
        console.log("New feature suggestion:", suggestion);
        // In a real application, this would send data to a backend API
        alert(`Thank you for your suggestion: "${suggestion}"!`); // Placeholder feedback
    }, []);

    // NEW: Handle dismissing onboarding hint
    const handleDismissOnboardingHint = useCallback(() => {
        setShowOnboardingHint(false);
        setLocalStorageItem(LS_KEY_SHOW_ONBOARDING_HINT, true); // Mark as dismissed
    }, []);

    // Context menu handlers
    const handleOpenContextMenu = useCallback((event: React.MouseEvent, feature: Feature) => {
        setContextMenuState({
            feature,
            position: { x: event.clientX, y: event.clientY },
        });
    }, []);

    const handleCloseContextMenu = useCallback(() => {
        setContextMenuState(null);
    }, []);

    const handlePinFromContextMenu = useCallback((featureId: string) => {
        handleTogglePin(featureId);
        handleCloseContextMenu();
    }, [handleTogglePin, handleCloseContextMenu]);

    const handleShowDetailsFromContextMenu = useCallback((featureId: string) => {
        const feature = ALL_FEATURES.find(f => f.id === featureId);
        if (feature) {
            setDetailsModalFeature(feature);
        }
        handleCloseContextMenu();
    }, [handleCloseContextMenu]);

    const handleCloseDetailsModal = useCallback(() => {
        setDetailsModalFeature(null);
    }, []);

    // NEW: Drag and drop handlers for reordering pinned features
    const handleDragStart = useCallback((event: React.DragEvent, id: string) => {
        setDraggingFeatureId(id);
        event.dataTransfer.effectAllowed = 'move';
        // Add a visual cue to the dragged item
        const target = event.currentTarget as HTMLButtonElement;
        target.classList.add('opacity-50', 'border-dashed', 'border-2', 'border-blue-500');
    }, []);

    const handleDragEnter = useCallback((event: React.DragEvent, id: string) => {
        event.preventDefault();
        setDragOverFeatureId(id);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent, id: string) => {
        if (dragOverFeatureId === id) {
            setDragOverFeatureId(null);
        }
    }, [dragOverFeatureId]);

    const handleDragEnd = useCallback((event: React.DragEvent) => {
        setDraggingFeatureId(null);
        setDragOverFeatureId(null);
        // Remove the visual cue from the dragged item
        const target = event.currentTarget as HTMLButtonElement;
        target.classList.remove('opacity-50', 'border-dashed', 'border-2', 'border-blue-500');
    }, []);

    const handleDrop = useCallback((event: React.DragEvent, targetId: string) => {
        event.preventDefault();
        if (draggingFeatureId && draggingFeatureId !== targetId) {
            setPinnedFeatureIds(prevPinnedIds => {
                const newPinnedIds = [...prevPinnedIds];
                const sourceIndex = newPinnedIds.indexOf(draggingFeatureId);
                const targetIndex = newPinnedIds.indexOf(targetId);

                if (sourceIndex !== -1 && targetIndex !== -1) {
                    const [draggedItem] = newPinnedIds.splice(sourceIndex, 1);
                    newPinnedIds.splice(targetIndex, 0, draggedItem);
                    return newPinnedIds;
                }
                return prevPinnedIds;
            });
        }
        setDraggingFeatureId(null);
        setDragOverFeatureId(null);
    }, [draggingFeatureId]);

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault(); // Essential to allow a drop
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Memoized list of unique categories for filtering
    const uniqueCategories = useMemo(() => {
        const categories = new Set(ALL_FEATURES.map(f => f.category));
        return ['All', ...Array.from(categories).sort()];
    }, []);

    // NEW: Helper to apply sorting based on current preferences
    const applySortOrder = useCallback((features: Feature[]): Feature[] => {
        const order = dockPreferences.sortOrder;
        if (order === 'default') return features;

        return [...features].sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            const categoryA = a.category.toLowerCase();
            const categoryB = b.category.toLowerCase();

            if (order === 'name-asc') return nameA.localeCompare(nameB);
            if (order === 'name-desc') return nameB.localeCompare(nameA);
            if (order === 'category-asc') {
                if (categoryA === categoryB) return nameA.localeCompare(nameB);
                return categoryA.localeCompare(categoryB);
            }
            if (order === 'category-desc') {
                if (categoryA === categoryB) return nameA.localeCompare(nameB);
                return categoryB.localeCompare(categoryA);
            }
            return 0;
        });
    }, [dockPreferences.sortOrder]);

    // Memoized filtered features based on debounced search term and selected category
    const filteredFeatures = useMemo(() => {
        let features = ALL_FEATURES;
        if (selectedCategory && selectedCategory !== 'All') {
            features = features.filter(f => f.category === selectedCategory);
        }
        if (debouncedSearchTerm) { // Use debounced search term
            const lowerSearch = debouncedSearchTerm.toLowerCase();
            features = features.filter(
                f => f.name.toLowerCase().includes(lowerSearch) || f.category.toLowerCase().includes(lowerSearch)
            );
        }
        return features;
    }, [debouncedSearchTerm, selectedCategory]); // Dependency updated to use debouncedSearchTerm

    // Memoized and sorted lists for pinned, recent, and all features
    const pinnedFeaturesList = useMemo(() => {
        const list = pinnedFeatureIds
            .map(id => ALL_FEATURES.find(f => f.id === id))
            .filter(Boolean) as Feature[];
        return applySortOrder(list); // Apply sorting
    }, [pinnedFeatureIds, applySortOrder]);

    const recentFeaturesList = useMemo(() => {
        const list = recentFeatureIds
            .map(id => ALL_FEATURES.find(f => f.id === id))
            .filter(Boolean) as Feature[];
        return applySortOrder(list); // Apply sorting
    }, [recentFeatureIds, applySortOrder]);

    const sortedFilteredFeatures = useMemo(() => { // NEW: Sorted version of filtered features
        return applySortOrder(filteredFeatures);
    }, [filteredFeatures, applySortOrder]);

    return (
        <div className="absolute top-0 left-0 right-0 bg-surface/30 backdrop-blur-sm border-b border-border p-3 z-10">
            <div className="max-w-7xl mx-auto flex flex-col h-full">
                {/* Onboarding Hint */}
                {showOnboardingHint && (
                    <OnboardingHint onClose={handleDismissOnboardingHint} />
                )}

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search all features..."
                    value={searchTerm} // searchTerm (not debounced) for immediate UI feedback
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 mb-3 rounded-lg bg-background/80 border border-border focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-text-primary"
                    aria-label="Search features"
                />

                {/* Category Filters (Conditional Rendering) */}
                {dockPreferences.showCategoryFilters && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {uniqueCategories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === category || (category === 'All' && selectedCategory === null)
                                        ? 'bg-primary text-white'
                                        : 'bg-background/80 text-text-secondary hover:bg-background/60'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sort Order, Grid Size, and Column Count Selection (NEW) */}
                <div className="flex justify-center mb-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-sm">Sort by:</span>
                        <select
                            value={dockPreferences.sortOrder}
                            onChange={(e) => handleSortOrderChange(e.target.value as FeatureSortOrder)}
                            className="bg-background/80 border border-border rounded-lg px-3 py-1 text-text-primary text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            aria-label="Sort features by"
                        >
                            <option value="default">Default</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                            <option value="category-asc">Category (A-Z)</option>
                            <option value="category-desc">Category (Z-A)</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-sm">Grid Size:</span>
                        <select
                            value={dockPreferences.gridSize}
                            onChange={(e) => setDockPreferences(prev => ({ ...prev, gridSize: e.target.value as FeatureGridSize }))}
                            className="bg-background/80 border border-border rounded-lg px-3 py-1 text-text-primary text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            aria-label="Select feature grid size"
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-text-secondary text-sm">Columns:</span>
                        <select
                            value={dockPreferences.columnCount}
                            onChange={(e) => setDockPreferences(prev => ({ ...prev, columnCount: parseInt(e.target.value, 10) }))}
                            className="bg-background/80 border border-border rounded-lg px-3 py-1 text-text-primary text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            aria-label="Select number of columns for feature grids"
                        >
                            {[2, 3, 4, 5, 6, 7, 8].map(count => (
                                <option key={count} value={count}>{count}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section Visibility Toggles (NEW) and other actions*/}
                <div className="flex justify-center mb-4 gap-4 flex-wrap">
                    <label className="flex items-center space-x-2 text-text-secondary text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dockPreferences.showRecentSection}
                            onChange={(e) => setDockPreferences(prev => ({ ...prev, showRecentSection: e.target.checked }))}
                            className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary"
                            aria-label="Toggle visibility of recently used features section"
                        />
                        <span>Show Recent Section</span>
                    </label>
                    <label className="flex items-center space-x-2 text-text-secondary text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={dockPreferences.showCategoryFilters}
                            onChange={(e) => setDockPreferences(prev => ({ ...prev, showCategoryFilters: e.target.checked }))}
                            className="form-checkbox h-4 w-4 text-primary rounded border-border focus:ring-primary"
                            aria-label="Toggle visibility of category filter buttons"
                        />
                        <span>Show Category Filters</span>
                    </label>
                    <button
                        onClick={() => setShowSuggestFeatureModal(true)}
                        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                        aria-label="Suggest a new feature"
                    >
                        Suggest Feature
                    </button>
                    <button
                        onClick={() => setShowOnboardingHint(prev => !prev)}
                        className="px-4 py-2 bg-info text-white rounded-lg hover:bg-info/80 transition-colors text-sm"
                        aria-label="Toggle help and onboarding hints"
                    >
                        Help {showOnboardingHint ? '(Hide)' : '(Show)'}
                    </button>
                </div>


                {/* Main scrollable content area */}
                <div className="flex-grow overflow-y-auto pb-4">
                    {/* Pinned Features Section */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-text-primary">Pinned Features (Drag to reorder)</h3>
                            {pinnedFeaturesList.length > 0 && ( // Only show clear button if there are pinned items
                                <button
                                    onClick={() => setShowClearPinnedConfirm(true)} // Open confirmation modal
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                    aria-label="Unpin all features from the dock"
                                >
                                    Clear Pinned
                                </button>
                            )}
                        </div>
                        {pinnedFeaturesList.length > 0 ? (
                            <div
                                className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${dockPreferences.columnCount} gap-3 justify-items-center`}
                                onDragOver={handleDragOver} // Allow drops over the container
                            >
                                {pinnedFeaturesList.map(feature => (
                                    <FeatureButton
                                        key={feature.id}
                                        feature={feature}
                                        onOpen={handleOpenFeature}
                                        onContextMenu={handleOpenContextMenu}
                                        isPinned={true}
                                        draggable={true} // Pinned features are draggable
                                        onDragStart={handleDragStart}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragEnd={handleDragEnd}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver} // Individual items also need drag over
                                        isDraggingOver={dragOverFeatureId === feature.id && draggingFeatureId !== feature.id}
                                        gridSize={dockPreferences.gridSize} // Pass gridSize
                                    />
                                ))}
                            </div>
                        ) : (
                            // NEW: Empty state for pinned features with drop zone functionality
                            <div
                                className="p-4 text-center text-text-secondary bg-background/50 rounded-lg border border-dashed border-border min-h-[100px] flex items-center justify-center cursor-pointer"
                                onDragOver={handleDragOver}
                                onDrop={(e) => { // Handle drop for empty section
                                    e.preventDefault();
                                    const draggedId = e.dataTransfer.getData('text/plain');
                                    if (draggedId && !pinnedFeatureIds.includes(draggedId)) {
                                        // Find the feature and add it to pinned.
                                        const featureToPin = ALL_FEATURES.find(f => f.id === draggedId);
                                        if (featureToPin) {
                                            setPinnedFeatureIds(prev => [...prev, draggedId]);
                                        }
                                    }
                                    setDraggingFeatureId(null);
                                    setDragOverFeatureId(null);
                                }}
                                onDragEnter={(e) => e.preventDefault()} // Need this for drop to work
                                aria-label="Drop features here to pin them"
                            >
                                <p>No features pinned yet. Right-click any feature and select 'Pin to Dock' to add it here, or drag a feature from 'All Features' below!</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Features Section (Conditional Rendering) */}
                    {dockPreferences.showRecentSection && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-text-primary">Recently Used</h3>
                                {recentFeaturesList.length > 0 && ( // Only show clear button if there are recents
                                    <button
                                        onClick={() => setShowClearRecentConfirm(true)} // Open confirmation modal
                                        className="px-3 py-1 text-xs bg-background/80 text-text-secondary rounded-full hover:bg-background/60 transition-colors"
                                        aria-label="Clear all recently used features"
                                    >
                                        Clear Recent
                                    </button>
                                )}
                            </div>
                            {recentFeaturesList.length > 0 ? (
                                <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${dockPreferences.columnCount} gap-3 justify-items-center`}>
                                    {recentFeaturesList.map(feature => (
                                        <FeatureButton
                                            key={feature.id}
                                            feature={feature}
                                            onOpen={handleOpenFeature}
                                            onContextMenu={handleOpenContextMenu}
                                            isPinned={pinnedFeatureIds.includes(feature.id)}
                                            gridSize={dockPreferences.gridSize} // Pass gridSize
                                            // Recent features are not draggable for reordering
                                        />
                                    ))}
                                </div>
                            ) : (
                                // NEW: Empty state for recent features
                                <div className="p-4 text-center text-text-secondary bg-background/50 rounded-lg border border-dashed border-border">
                                    <p>No features used recently. Start using some features to see them here!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Features Section (with Search/Category Filter and Sorting) */}
                    <h3 className="text-lg font-semibold text-text-primary mb-3">All Features</h3>
                    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${dockPreferences.columnCount} gap-3 justify-items-center`}>
                        {sortedFilteredFeatures.length > 0 ? ( // Use sorted filtered list
                            sortedFilteredFeatures.map(feature => (
                                <FeatureButton
                                    key={feature.id}
                                    feature={feature}
                                    onOpen={handleOpenFeature}
                                    onContextMenu={handleOpenContextMenu}
                                    isPinned={pinnedFeatureIds.includes(feature.id)}
                                    gridSize={dockPreferences.gridSize} // Pass gridSize
                                    // All features are draggable to be pinned (but not for reordering within this section)
                                    draggable={true}
                                    onDragStart={handleDragStart}
                                />
                            ))
                        ) : (
                            <p className="text-text-secondary text-center w-full py-8 col-span-full">
                                No features match your criteria. Try adjusting your search or category filter.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Render FeatureContextMenu if active */}
            {contextMenuState && (
                <FeatureContextMenu
                    feature={contextMenuState.feature}
                    position={contextMenuState.position}
                    isPinned={pinnedFeatureIds.includes(contextMenuState.feature.id)}
                    onClose={handleCloseContextMenu}
                    onPinToggle={handlePinFromContextMenu}
                    onShowDetails={handleShowDetailsFromContextMenu}
                />
            )}

            {/* Render FeatureDetailsModal if active */}
            {detailsModalFeature && (
                <FeatureDetailsModal
                    feature={detailsModalFeature}
                    onClose={handleCloseDetailsModal}
                />
            )}

            {/* Render ConfirmationModal for clearing recent features */}
            {showClearRecentConfirm && (
                <ConfirmationModal
                    title="Clear Recently Used Features?"
                    message="Are you sure you want to clear your list of recently used features? This action cannot be undone."
                    onConfirm={() => {
                        handleClearRecentFeatures();
                        setShowClearRecentConfirm(false);
                    }}
                    onCancel={() => setShowClearRecentConfirm(false)}
                    confirmText="Clear"
                    cancelText="Keep"
                />
            )}

            {/* Render ConfirmationModal for clearing pinned features (NEW) */}
            {showClearPinnedConfirm && (
                <ConfirmationModal
                    title="Clear Pinned Features?"
                    message="Are you sure you want to unpin all features from your dock? You can always pin them again later."
                    onConfirm={() => {
                        handleClearPinnedFeatures();
                        setShowClearPinnedConfirm(false);
                    }}
                    onCancel={() => setShowClearPinnedConfirm(false)}
                    confirmText="Unpin All"
                    cancelText="Keep"
                />
            )}

            {/* Render SuggestFeatureModal if active (NEW) */}
            {showSuggestFeatureModal && (
                <SuggestFeatureModal
                    onClose={() => setShowSuggestFeatureModal(false)}
                    onSubmit={handleSubmitSuggestion}
                />
            )}
        </div>
    );
};
