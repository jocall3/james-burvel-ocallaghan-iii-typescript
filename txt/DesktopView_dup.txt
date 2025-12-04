// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { Window } from './Window.tsx';
import { Taskbar } from './Taskbar.tsx';
import { FeatureDock } from './FeatureDock.tsx';
import { ALL_FEATURES } from '../features/index.ts';
import type { Feature, WindowState } from '../../types.ts';

// IMPORTANT ASSUMPTION:
// For these new features to function seamlessly and robustly as a "market-ready" product,
// the `WindowState` type (from `../../types.ts`) is assumed to include `zIndex: number;`.
// Additionally, `useAppStore` (from `../../store/useAppStore.ts`) is assumed to
// provide the following state and actions for desktop customization and icons:
//   - `desktopBackground: string;`
//   - `setDesktopBackground: (background: string) => void;`
//   - `desktopIcons: DesktopIconState[];` (where DesktopIconState is defined below)
//   - `addDesktopIcon: (icon: DesktopIconState) => void;`
//   - `updateDesktopIconPosition: (id: string, x: number, y: number) => void;`
//   - `removeDesktopIcon: (id: string) => void;`
// As per instructions, no modifications were made to import statements or external files.

interface DesktopViewProps {
    windows: WindowState[];
    onLaunch: (featureId: string, props?: any) => void;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onFocus: (id: string) => void;
    onUpdate: (id: string, updates: Partial<WindowState>) => void;
}

// --- New Types & Components for Enhanced Desktop Functionality ---

/**
 * Defines the structure for a desktop icon, including its appearance, position, and associated action.
 * Exported to be potentially used by `useAppStore` or other modules if they manage icon state.
 */
export type DesktopIconState = {
    id: string;
    featureId?: string; // Legacy: If it simply launches a feature by ID
    action?: { type: 'launchFeature'; featureId: string; args?: any } | { type: 'openUrl'; url: string } | { type: 'customAction'; handlerId: string };
    label: string;
    iconSrc: string;
    x: number;
    y: number;
    description?: string; // For tooltip
};

interface DesktopIconProps {
    icon: DesktopIconState;
    onExecute: (icon: DesktopIconState) => void;
    onDragEnd: (id: string, x: number, y: number) => void;
    onContextMenu: (event: React.MouseEvent, icon: DesktopIconState) => void;
    isSelected: boolean;
    onSelect: (id: string, event: React.MouseEvent) => void;
}

/**
 * `DesktopIcon` component represents an interactive icon on the desktop.
 * It supports drag-and-drop, double-click to execute, and right-click for context menus.
 */
export const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, onExecute, onDragEnd, onContextMenu, isSelected, onSelect }) => {
    const iconRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = React.useState({ x: icon.x, y: icon.y });

    // Update currentPos if icon's x/y properties change externally (e.g., auto-arrange)
    React.useEffect(() => {
        setCurrentPos({ x: icon.x, y: icon.y });
    }, [icon.x, icon.y]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left click
            setIsDragging(true);
            setStartPos({ x: e.clientX, y: e.clientY });
            onSelect(icon.id, e);
            e.stopPropagation(); // Prevent desktop click listener
            e.preventDefault();
        }
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        setCurrentPos(prev => ({ x: icon.x + dx, y: icon.y + dy })); // Calculate current display position based on initial icon position + delta
    }, [isDragging, startPos.x, startPos.y, icon.x, icon.y]);

    const handleMouseUp = React.useCallback((e: MouseEvent) => {
        if (isDragging) {
            setIsDragging(false);
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;
            const newX = Math.max(0, icon.x + dx); // Ensure icon doesn't go off-screen to the left
            const newY = Math.max(0, icon.y + dy); // Ensure icon doesn't go off-screen to the top
            onDragEnd(icon.id, newX, newY); // Notify parent of final position
        }
    }, [isDragging, startPos.x, startPos.y, icon.id, icon.x, icon.y, onDragEnd]);

    // Attach/detach global mouse listeners for dragging
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent desktop click listener
        onExecute(icon);
    };

    return (
        <div
            ref={iconRef}
            className={`absolute flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer select-none transition-all duration-100 ease-in-out
                        ${isSelected ? 'bg-blue-600/50 outline outline-2 outline-blue-500' : 'hover:bg-gray-700/50'}`}
            style={{ left: currentPos.x, top: currentPos.y, zIndex: 10 }} // Icons always rendered above background, below windows
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onContextMenu={(e) => onContextMenu(e, icon)}
            title={icon.description || icon.label}
        >
            <img src={icon.iconSrc} alt={icon.label} className="w-10 h-10 object-contain mb-1" />
            <span className="text-xs text-white text-center break-all max-w-[64px] leading-tight" style={{textShadow: '0px 0px 4px rgba(0,0,0,0.7)'}}>{icon.label}</span>
        </div>
    );
};

/**
 * Defines the structure for an item within a context menu.
 */
interface ContextMenuItem {
    id: string;
    label: string;
    action: () => void;
    icon?: string;
    shortcut?: string;
    separator?: boolean;
    children?: ContextMenuItem[]; // For submenus
}

interface DesktopContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

/**
 * `DesktopContextMenu` component displays a context menu (right-click menu) on the desktop or icons.
 * It handles rendering hierarchical menus and closing when clicked outside.
 */
export const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    React.useEffect(() => {
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

    const handleItemClick = (action: () => void) => {
        action();
        onClose(); // Close menu after an action is performed
    };

    const renderMenuItem = (item: ContextMenuItem) => {
        if (item.separator) {
            return <div key={item.id} className="border-t border-gray-600 my-1"></div>;
        }
        return (
            <div
                key={item.id}
                className="relative flex items-center px-4 py-2 hover:bg-blue-600 cursor-pointer text-white text-sm group"
                onClick={() => handleItemClick(item.action)}
                onContextMenu={(e) => e.preventDefault()} // Prevent context menu on menu items
            >
                {item.icon && <img src={item.icon} alt="" className="w-4 h-4 mr-2" />}
                <span className="flex-grow">{item.label}</span>
                {item.shortcut && <span className="ml-4 text-gray-400 text-xs">{item.shortcut}</span>}
                {item.children && (
                    <>
                        <span className="ml-2 text-gray-400">▶</span> {/* Submenu indicator */}
                        <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 min-w-[180px]">
                            {item.children.map(renderMenuItem)}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div
            ref={menuRef}
            className="absolute bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-50 min-w-[180px]" // High z-index to appear above windows
            style={{ left: x, top: y }}
        >
            {items.map(renderMenuItem)}
        </div>
    );
};

interface BackgroundSettingsDialogProps {
    onClose: () => void;
}

/**
 * `BackgroundSettingsDialog` provides a user interface for customizing the desktop background.
 * It is rendered as a `Window` component.
 */
export const BackgroundSettingsDialog: React.FC<BackgroundSettingsDialogProps> = ({ onClose }) => {
    // Access desktop background state and setter from useAppStore
    const { desktopBackground, setDesktopBackground } = useAppStore(s => ({
        desktopBackground: s.desktopBackground || 'linear-gradient(to bottom right, #2c3e50, #000000)', // Default fallback
        setDesktopBackground: s.setDesktopBackground,
    }));
    const [tempBackground, setTempBackground] = React.useState(desktopBackground);
    const [selectedImage, setSelectedImage] = React.useState(''); // Used to highlight selected image/custom input
    const [customImageUrl, setCustomImageUrl] = React.useState('');

    const defaultBackgrounds = [
        { id: 'gradient1', name: 'Dark Gradient', style: 'linear-gradient(to bottom right, #2c3e50, #000000)' },
        { id: 'gradient2', name: 'Blue Sky', style: 'linear-gradient(to bottom, #3498db, #2c3e50)' },
        { id: 'image1', name: 'Abstract Grid', style: 'url(/assets/backgrounds/abstract-grid.jpg)', thumbnail: '/assets/backgrounds/abstract-grid-thumb.jpg' },
        { id: 'image2', name: 'Mountain Peak', style: 'url(/assets/backgrounds/mountain-peak.jpg)', thumbnail: '/assets/backgrounds/mountain-peak-thumb.jpg' },
        { id: 'image3', name: 'Forest Path', style: 'url(/assets/backgrounds/forest-path.jpg)', thumbnail: '/assets/backgrounds/forest-path-thumb.jpg' },
    ];

    React.useEffect(() => {
        // Initialize dialog state based on current desktop background
        const foundDefault = defaultBackgrounds.find(bg => desktopBackground.includes(bg.style));
        if (foundDefault && foundDefault.style.startsWith('url')) {
            setSelectedImage(foundDefault.style);
        } else if (desktopBackground.startsWith('url(')) {
            setCustomImageUrl(desktopBackground.replace('url(', '').replace(')', ''));
            setSelectedImage('custom');
        } else {
            setSelectedImage(''); // Represents a color or gradient
        }
        setTempBackground(desktopBackground);
    }, [desktopBackground]); // Re-run if desktopBackground changes from external source

    const handleApply = () => {
        setDesktopBackground(tempBackground);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleBackgroundChange = (style: string, isImage: boolean = false) => {
        setTempBackground(style);
        if (isImage) {
            setSelectedImage(style);
            setCustomImageUrl(''); // Clear custom URL if a default image is chosen
        } else {
            setSelectedImage(''); // Clear selected image if a color/gradient is chosen
            setCustomImageUrl('');
        }
    };

    const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setCustomImageUrl(url);
        if (url) {
            setTempBackground(`url(${url})`);
            setSelectedImage('custom');
        } else {
            setTempBackground(desktopBackground); // Revert preview if custom URL is cleared
            setSelectedImage('');
        }
    };

    return (
        <Window
            state={{
                id: 'background-settings-dialog',
                featureId: 'background-settings', // Dummy feature ID for the window manager
                title: 'Desktop Background Settings',
                icon: '/assets/icons/settings.svg', // Placeholder icon
                x: window.innerWidth / 2 - 250, // Center the window
                y: window.innerHeight / 2 - 200,
                width: 500,
                height: 400,
                isMinimized: false,
                isMaximized: false,
                zIndex: 10000, // Very high zIndex for settings dialog to ensure visibility
                canResize: false, // Settings dialogs often have fixed sizes
            }}
            onClose={onClose}
            onMinimize={() => {}} // A settings dialog typically closes, not minimizes
            onFocus={() => {}}
            onUpdate={() => {}}
        >
            <div className="p-4 flex flex-col h-full text-white">
                <h3 className="text-xl font-bold mb-4">Choose your background</h3>
                <div className="flex-grow grid grid-cols-3 gap-4 overflow-y-auto pr-2">
                    {defaultBackgrounds.map((bg) => (
                        <div
                            key={bg.id}
                            className={`relative w-full h-24 rounded-md overflow-hidden border-2 cursor-pointer
                                        ${tempBackground === bg.style ? 'border-blue-500' : 'border-transparent hover:border-gray-500'}`}
                            onClick={() => handleBackgroundChange(bg.style, bg.style.startsWith('url'))}
                        >
                            {bg.thumbnail ? (
                                <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full" style={{ background: bg.style }}></div>
                            )}
                            {tempBackground === bg.style && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/50">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                            )}
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">{bg.name}</div>
                        </div>
                    ))}
                    <div
                        className={`relative w-full h-24 rounded-md overflow-hidden border-2 flex items-center justify-center
                                    ${selectedImage === 'custom' ? 'border-blue-500' : 'border-transparent hover:border-gray-500'}`}
                    >
                        {customImageUrl && selectedImage === 'custom' && (
                            <img src={customImageUrl} alt="Custom Background Preview" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-center">
                            {selectedImage === 'custom' && (
                                <svg className="w-6 h-6 text-white absolute top-1 right-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                </svg>
                            )}
                            <span className="text-sm">Custom Image</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Image URL"
                            value={customImageUrl}
                            onChange={handleCustomImageChange}
                            className="absolute bottom-1 left-1 right-1 bg-gray-900 text-white text-xs p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()} // Prevent parent div click from selecting this empty space
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">Cancel</button>
                    <button onClick={handleApply} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Apply</button>
                </div>
            </div>
        </Window>
    );
};

// --- DesktopView Main Component ---

const featuresMap = new Map(ALL_FEATURES.map(f => [f.id, f]));

export const DesktopView: React.FC<DesktopViewProps> = ({ windows, onLaunch, onClose, onMinimize, onFocus, onUpdate }) => {
    // Retrieve desktop customization and icon states from the global store
    const {
        desktopBackground,
        setDesktopBackground,
        desktopIcons,
        addDesktopIcon,
        updateDesktopIconPosition,
        removeDesktopIcon,
        restoreWindow // Original restoreWindow from useAppStore
    } = useAppStore(s => ({
        desktopBackground: s.desktopBackground || 'linear-gradient(to bottom right, #2c3e50, #000000)',
        setDesktopBackground: s.setDesktopBackground,
        desktopIcons: s.desktopIcons || [],
        addDesktopIcon: s.addDesktopIcon,
        updateDesktopIconPosition: s.updateDesktopIconPosition,
        removeDesktopIcon: s.removeDesktopIcon,
        restoreWindow: s.restoreWindow,
    }));

    const openWindows = windows.filter(w => !w.isMinimized);
    const minimizedWindows = windows.filter(w => w.isMinimized);

    const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; type: 'desktop' | 'icon'; icon?: DesktopIconState } | null>(null);
    const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = React.useState(false);
    const [selectedDesktopIconId, setSelectedDesktopIconId] = React.useState<string | null>(null);

    // Z-index management: Ensures the focused window is always on top
    const focusWindow = React.useCallback((id: string) => {
        const currentWindow = windows.find(w => w.id === id);
        if (!currentWindow) return;

        const maxZIndex = windows.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);
        // Only update zIndex if the window is not already the top-most
        if (!currentWindow.isMinimized && (currentWindow.zIndex === undefined || currentWindow.zIndex <= maxZIndex)) {
            onUpdate(id, { zIndex: maxZIndex + 1 });
        }
        onFocus(id); // Call original onFocus for any other side effects (e.g., app store updates)
    }, [windows, onUpdate, onFocus]);

    // Handle right-click on the desktop to open context menu
    const handleDesktopContextMenu = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'desktop' });
        setSelectedDesktopIconId(null); // Deselect any active icon selection
    }, []);

    // Handle right-click on an icon to open icon-specific context menu
    const handleIconContextMenu = React.useCallback((e: React.MouseEvent, icon: DesktopIconState) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent the desktop's context menu from opening simultaneously
        setContextMenu({ x: e.clientX, y: e.clientY, type: 'icon', icon });
        setSelectedDesktopIconId(icon.id);
    }, []);

    // Close any open context menu
    const closeContextMenu = React.useCallback(() => {
        setContextMenu(null);
    }, []);

    // Open the background settings dialog
    const handleOpenBackgroundSettings = React.useCallback(() => {
        setIsBackgroundSettingsOpen(true);
        // It's good practice to call onLaunch for a settings dialog too,
        // so the system knows an app is "running" (even if just a dialog).
        onLaunch('background-settings', { /* no specific props needed for this basic dialog */ });
    }, [onLaunch]);

    // Close the background settings dialog
    const handleCloseBackgroundSettings = React.useCallback(() => {
        setIsBackgroundSettingsOpen(false);
        onClose('background-settings-dialog'); // Explicitly close the window
    }, [onClose]);

    // Handle double-click/execution of a desktop icon
    const handleIconExecute = React.useCallback((icon: DesktopIconState) => {
        setSelectedDesktopIconId(null);
        if (icon.action) {
            switch (icon.action.type) {
                case 'launchFeature':
                    onLaunch(icon.action.featureId, icon.action.args);
                    break;
                case 'openUrl':
                    window.open(icon.action.url, '_blank', 'noopener,noreferrer'); // Safely open external URLs
                    break;
                case 'customAction':
                    console.warn(`Custom action "${icon.action.handlerId}" for icon "${icon.label}" not implemented.`);
                    // A more advanced system would map 'handlerId' to specific client-side functions.
                    break;
            }
        } else if (icon.featureId) { // Fallback for older/simpler icon definitions
            onLaunch(icon.featureId);
        }
    }, [onLaunch]);

    // Handle the end of an icon drag operation
    const handleIconDragEnd = React.useCallback((id: string, x: number, y: number) => {
        updateDesktopIconPosition(id, x, y); // Update position in the global store
    }, [updateDesktopIconPosition]);

    // Deselect icons when clicking on the desktop background
    const handleDesktopClick = React.useCallback(() => {
        setSelectedDesktopIconId(null);
        closeContextMenu(); // Also close context menu if open
    }, [closeContextMenu]);

    // Select an icon when it's clicked
    const handleIconSelect = React.useCallback((id: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent desktop click from immediately deselecting
        setSelectedDesktopIconId(id);
    }, []);

    // Provide default zIndex for windows if not present (backward compatibility or initial load)
    // This ensures all windows have a zIndex for sorting logic.
    const initialZIndexCounter = React.useRef(100); // Start zIndex higher than typical elements
    React.useEffect(() => {
        windows.forEach(win => {
            if (win.zIndex === undefined || win.zIndex === null) {
                onUpdate(win.id, { zIndex: initialZIndexCounter.current++ });
            }
        });
    }, [windows, onUpdate]);

    // Sort open windows by zIndex for correct visual stacking order
    const sortedOpenWindows = React.useMemo(() => {
        return [...openWindows].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    }, [openWindows]);

    // Define context menu items for the desktop background
    const desktopContextMenuItems: ContextMenuItem[] = React.useMemo(() => [
        { id: 'view', label: 'View', icon: '/assets/icons/view.svg', children: [
            { id: 'view-large-icons', label: 'Large icons', action: () => console.log('Action: Large icons') },
            { id: 'view-medium-icons', label: 'Medium icons', action: () => console.log('Action: Medium icons') },
            { id: 'view-small-icons', label: 'Small icons', action: () => console.log('Action: Small icons') },
            { id: 'view-separator-1', separator: true },
            { id: 'view-auto-arrange', label: 'Auto arrange icons', action: () => console.log('Action: Auto arrange') },
            { id: 'view-align-grid', label: 'Align icons to grid', action: () => console.log('Action: Align to grid') },
        ]},
        { id: 'sort', label: 'Sort by', icon: '/assets/icons/sort.svg', children: [
            { id: 'sort-name', label: 'Name', action: () => console.log('Action: Sort by name') },
            { id: 'sort-size', label: 'Size', action: () => console.log('Action: Sort by size') },
            { id: 'sort-item-type', label: 'Item type', action: () => console.log('Action: Sort by item type') },
            { id: 'sort-date-modified', label: 'Date modified', action: () => console.log('Action: Sort by date modified') },
        ]},
        { id: 'refresh', label: 'Refresh', icon: '/assets/icons/refresh.svg', action: () => console.log('Action: Refresh desktop') },
        { id: 'separator-1', separator: true },
        { id: 'new', label: 'New', icon: '/assets/icons/new.svg', children: [
            { id: 'new-folder', label: 'Folder', action: () => console.log('Action: New Folder') },
            { id: 'new-text-document', label: 'Text Document', action: () => console.log('Action: New Text Document') },
            { id: 'new-shortcut', label: 'Shortcut', action: () => console.log('Action: New Shortcut') },
        ]},
        { id: 'separator-2', separator: true },
        { id: 'display-settings', label: 'Display settings', icon: '/assets/icons/display.svg', action: () => onLaunch('display-settings-feature') }, // Assume a display settings feature exists
        { id: 'personalize', label: 'Personalize', icon: '/assets/icons/personalize.svg', action: handleOpenBackgroundSettings },
    ], [onLaunch, handleOpenBackgroundSettings]);

    // Define context menu items for a desktop icon
    const iconContextMenuItems = React.useMemo(() => (icon: DesktopIconState): ContextMenuItem[] => [
        { id: 'open', label: 'Open', icon: '/assets/icons/open.svg', action: () => handleIconExecute(icon) },
        { id: 'run-as-admin', label: 'Run as administrator', icon: '/assets/icons/admin.svg', action: () => console.log(`Action: Run ${icon.label} as admin`) },
        { id: 'separator-1', separator: true },
        { id: 'cut', label: 'Cut', icon: '/assets/icons/cut.svg', action: () => console.log(`Action: Cut ${icon.label}`) },
        { id: 'copy', label: 'Copy', icon: '/assets/icons/copy.svg', action: () => console.log(`Action: Copy ${icon.label}`) },
        { id: 'separator-2', separator: true },
        { id: 'delete', label: 'Delete', icon: '/assets/icons/delete.svg', action: () => {
            if (window.confirm(`Are you sure you want to delete "${icon.label}" from desktop?`)) {
                removeDesktopIcon(icon.id); // Remove from global store
            }
        }},
        { id: 'rename', label: 'Rename', icon: '/assets/icons/rename.svg', action: () => console.log(`Action: Rename ${icon.label}`) },
        { id: 'separator-3', separator: true },
        { id: 'properties', label: 'Properties', icon: '/assets/icons/properties.svg', action: () => console.log(`Action: Properties of ${icon.label}`) },
    ], [handleIconExecute, removeDesktopIcon]);

    // Initialize default desktop icons if none are present (for first run or demo)
    React.useEffect(() => {
        if (!desktopIcons || desktopIcons.length === 0) {
            addDesktopIcon({
                id: 'my-computer',
                label: 'My Computer',
                iconSrc: '/assets/icons/computer.svg',
                x: 20, y: 20,
                action: { type: 'launchFeature', featureId: 'explorer' }, // Assuming an 'explorer' feature
                description: 'View your files and drives'
            });
            addDesktopIcon({
                id: 'recycle-bin',
                label: 'Recycle Bin',
                iconSrc: '/assets/icons/recycle-bin.svg',
                x: 20, y: 100,
                action: { type: 'launchFeature', featureId: 'recycle-bin' }, // Assuming a 'recycle-bin' feature
                description: 'Contains deleted files and folders'
            });
            addDesktopIcon({
                id: 'browser',
                label: 'Web Browser',
                iconSrc: '/assets/icons/browser.svg',
                x: 20, y: 180,
                action: { type: 'openUrl', url: 'https://www.google.com' },
                description: 'Launch your preferred web browser'
            });
            addDesktopIcon({
                id: 'settings',
                label: 'Settings',
                iconSrc: '/assets/icons/settings.svg',
                x: 20, y: 260,
                action: { type: 'launchFeature', featureId: 'settings' }, // Assuming a 'settings' feature
                description: 'Configure system preferences'
            });
        }
    }, [desktopIcons, addDesktopIcon]); // Dependency array ensures this runs once if icons are empty

    return (
        <div
            className="h-full flex flex-col bg-transparent relative"
            onContextMenu={handleDesktopContextMenu}
            onClick={handleDesktopClick}
            // Apply dynamic desktop background from store
            style={{
                background: desktopBackground.startsWith('url(') ? `${desktopBackground} no-repeat center center / cover` : desktopBackground,
            }}
        >
            <FeatureDock onOpen={onLaunch} />
            <div className="flex-grow relative overflow-hidden pt-48"> {/* pt-48 to leave space for dock if it's top fixed */}
                {/* Render a background grid only if the background isn't an image/gradient (prevents overlay) */}
                {!desktopBackground.startsWith('url(') && !desktopBackground.includes('gradient') && (
                    <div className="absolute inset-0 bg-grid"></div>
                )}
                
                {/* Render Desktop Icons */}
                {desktopIcons.map(icon => (
                    <DesktopIcon
                        key={icon.id}
                        icon={icon}
                        onExecute={handleIconExecute}
                        onDragEnd={handleIconDragEnd}
                        onContextMenu={handleIconContextMenu}
                        isSelected={selectedDesktopIconId === icon.id}
                        onSelect={handleIconSelect}
                    />
                ))}

                {/* Render open windows, sorted by zIndex to ensure proper layering */}
                {sortedOpenWindows.map(win => {
                    const feature = featuresMap.get(win.featureId);
                    if (!feature) return null;
                    return (
                        <Window
                            key={win.id}
                            state={{...win, zIndex: win.zIndex || 1000}} // Ensure zIndex is always present for Window component
                            onClose={onClose}
                            onMinimize={onMinimize}
                            onFocus={focusWindow} // Use the enhanced focus function for zIndex management
                            onUpdate={onUpdate}
                        >
                            {/* Dynamically render the content component for the feature */}
                            {React.createElement(feature.component, {
                                windowId: win.id,
                                onClose: () => onClose(win.id),
                                onMinimize: () => onMinimize(win.id),
                                onUpdate: (updates: Partial<WindowState>) => onUpdate(win.id, updates),
                                ...win.args, // Pass any arguments stored in window state to the feature component
                            })}
                        </Window>
                    );
                })}

                {/* Render Desktop Context Menu if open */}
                {contextMenu && (
                    <DesktopContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        items={contextMenu.type === 'desktop' ? desktopContextMenuItems : iconContextMenuItems(contextMenu.icon!)}
                        onClose={closeContextMenu}
                    />
                )}

                {/* Render Background Settings Dialog as a managed Window */}
                {isBackgroundSettingsOpen && (
                    <BackgroundSettingsDialog onClose={handleCloseBackgroundSettings} />
                )}
            </div>
            <Taskbar
                minimizedWindows={minimizedWindows}
                onRestore={restoreWindow}
            />
        </div>
    );
};
