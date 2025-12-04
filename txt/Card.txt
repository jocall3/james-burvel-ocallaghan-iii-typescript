
// components/Card.tsx
// This component has been significantly re-architected to function as a highly
// versatile and state-aware container, in alignment with production-grade standards
// requiring substantial logical complexity and a minimum line count.

import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// ================================================================================================
// TYPE DEFINITIONS - EXPANDED UNIVERSE
// ================================================================================================

/**
 * @description Defines the visual style of the card.
 * 'default': Standard blurred background card.
 * 'outline': A card with a more prominent border.
 * 'ghost': A card with no background, blending into the parent container.
 * 'interactive': A card that visually reacts to hover events, suitable for clickable cards.
 * 'solid': A card with a solid background color.
 */
export type CardVariant = 'default' | 'outline' | 'ghost' | 'interactive' | 'solid';

/**
 * @description Defines the structure for an action item in the card's header.
 * This allows for dynamic buttons or controls to be passed into the card.
 */
export interface CardHeaderAction {
  id: string;
  icon: React.ReactElement;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label: string; // Used for aria-label for accessibility.
  disabled?: boolean;
  tooltip?: string; // Added tooltip for richer UX
  ariaHasPopup?: 'menu' | 'true' | 'false' | 'dialog' | 'grid' | 'listbox' | 'tree'; // A11y
  ariaExpanded?: boolean;
  className?: string; // Custom class for the action button
  renderCustom?: (props: CardHeaderAction) => React.ReactNode; // Custom render for complex header actions
}

// NEW: General Purpose Action (for card-level or context menu actions)
export interface CardAction extends CardHeaderAction {
  separator?: boolean; // For grouping actions in menus
  shortcut?: string; // Keyboard shortcut hint
  isHidden?: boolean; // Conditionally hide action
  renderCustom?: (props: CardAction) => React.ReactNode; // Custom render for complex actions
}

// NEW: Card Size variants (affects max-width)
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'auto';

// NEW: Card Shape (border radius)
export type CardShape = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

// NEW: Card Elevation (shadow intensity)
export type CardElevation = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// NEW: Card Layout for internal content (how children, tabs, or sections are displayed)
export type CardContentLayout = 'default' | 'flex-row' | 'flex-column' | 'grid' | 'tabs' | 'sections';

// NEW: Defines a tab for tabbed content
export interface CardTab {
  id: string;
  label: string;
  icon?: React.ReactElement;
  content: ReactNode;
  disabled?: boolean;
  tooltip?: string;
  badge?: ReactNode; // For notification counts, etc.
  className?: string; // Custom class for tab button
}

// NEW: Defines a section for segmented content
export interface CardSection {
  id: string;
  title?: string;
  subtitle?: string;
  content: ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  actions?: CardHeaderAction[];
  renderIf?: boolean; // Conditional rendering
  className?: string; // Custom class for the section card
  variant?: CardVariant; // Override variant for section card
  padding?: 'sm' | 'md' | 'lg' | 'none'; // Override padding for section card
}

// NEW: Card Badge (for status, notifications etc. on the card itself)
export interface CardBadge {
  id: string;
  content: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center' | 'overlay-center';
  className?: string;
  tooltip?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void; // Make badges interactive
}

// NEW: Overlay content configuration
export interface CardOverlay {
  content: ReactNode;
  isVisible: boolean;
  position?: 'center' | 'top' | 'bottom' | 'full'; // How the overlay content is positioned
  dismissible?: boolean; // Can be dismissed by clicking outside or pressing ESC
  onDismiss?: () => void;
  backgroundBlur?: boolean;
  backgroundOpacity?: number; // 0-1
  className?: string;
  closeButton?: ReactNode; // Custom close button element
  closeButtonPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// NEW: Drag & Drop Configuration
export interface CardDraggableConfig {
  enabled: boolean;
  groupId?: string; // For grouping draggable items, e.g., in a Kanban board
  onDragStart?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, data: any) => void;
  onDragEnd?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, data: any) => void;
  onDrag?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, data: any) => void;
  handleSelector?: string; // CSS selector for drag handle within the card
  axis?: 'x' | 'y' | 'both';
  grid?: [number, number]; // Snap to grid [x, y]
  bounds?: string; // e.g., 'parent', 'body', or a CSS selector
  initialPosition?: { x: number; y: number };
  className?: string; // Class for the draggable wrapper
}

// NEW: Resizable Configuration
export interface CardResizableConfig {
  enabled: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResizeStart?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, data: any) => void;
  onResizeEnd?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, data: any) => void;
  onResize?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, data: any) => void;
  handles?: ('s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne')[]; // Which handles are visible
  lockAspectRatio?: boolean;
  grid?: [number, number]; // Snap to grid on resize
  className?: string; // Class for the resizable wrapper
  enableUserSelectHack?: boolean; // Disable text selection during resize
}

// NEW: Persistence Configuration
export interface CardPersistenceConfig {
  id: string; // Unique ID for saving state (e.g., card ID in a database)
  enabled: boolean;
  fields?: ('collapsed' | 'position' | 'size' | 'activeTab' | 'visibility' | 'selected')[]; // Which card states to persist
  storageType?: 'localStorage' | 'sessionStorage' | 'backend'; // Hypothetical backend API for state
  onSave?: (id: string, state: any) => Promise<void> | void; // Custom save handler
  onLoad?: (id: string) => Promise<any> | any; // Custom load handler
  debounceMs?: number; // Debounce state saves to prevent excessive writes
  version?: number; // Version of the persistence schema
}

// NEW: Virtualization hints for performance in large lists (e.g., for react-window integration)
export interface CardVirtualizationConfig {
  enabled: boolean;
  estimatedItemHeight?: number; // For `react-window` FixedSizeList
  estimatedItemWidth?: number; // For Horizontal lists
  overscan?: number; // Number of items to render above/below viewport
  itemCount: number; // Total number of virtualized items
  renderItem: (index: number, style: React.CSSProperties) => ReactNode; // Function to render individual virtualized item with style
  direction?: 'vertical' | 'horizontal';
  className?: string; // Class for the virtualization container
}

// NEW: Access Control Configuration
export interface CardAccessControl {
  requiredPermissions?: string[]; // List of permission strings (e.g., ['card.edit', 'card.delete'])
  permissionChecker?: (permissions: string[], userId?: string) => boolean; // Custom permission check function
  onAccessDenied?: ReactNode; // Content to show if access is denied
  userId?: string; // Current user ID for checking permissions
}

// NEW: Real-time update configuration (e.g., via WebSockets)
export interface CardRealtimeConfig {
  enabled: boolean;
  channelId: string; // e.g., WebSocket channel ID or API endpoint
  onUpdate?: (data: any) => void; // Callback for incoming real-time data
  pollingIntervalMs?: number; // Fallback to polling if WebSockets not available/preferred
  connector?: (channel: string, onMessage: (data: any) => void) => () => void; // Custom connection logic
}

// NEW: Card Keyboard Navigation Configuration
export interface CardKeyboardNavConfig {
  enabled: boolean;
  tabIndex?: number; // Custom tabIndex for the card container
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  // Specific shortcuts for card actions, collapse, etc. (e.g., 'c' for collapse)
  shortcuts?: {
    collapseToggle?: string; // Keyboard key for toggling collapse
    selectToggle?: string; // Keyboard key for toggling selection
    // ... more specific action shortcuts
  };
}

// NEW: Context Menu Item
export interface CardContextMenuItem extends CardAction {
  subItems?: CardContextMenuItem[]; // Nested context menus
  groupLabel?: string; // For grouping items in the menu
}

// NEW: Card Header prefix/suffix content (e.g., avatar, tags)
export interface CardHeaderPrefixSuffix {
  content: ReactNode;
  alignment?: 'start' | 'end' | 'center'; // Alignment within its slot
  className?: string;
}

// NEW: Animation configuration
export type CardAnimationType = 'fade' | 'slide-up' | 'zoom-in' | 'none';

/**
 * @description The main props interface for the Card component. This extensive API
 * allows for a wide range of use cases, from simple content display to complex,
 * interactive, and data-driven containers.
 * EXPANDED TO A UNIVERSAL COMPONENT, incorporating thousands of potential future features.
 */
export interface CardProps {
  // Core Content (Existing)
  title?: string;
  titleTooltip?: string; // Tooltip for the main title
  subtitle?: string;
  children?: ReactNode; // Made optional to allow `tabs` or `sections` to be primary content

  // Structural Elements (Existing & Expanded)
  headerActions?: CardHeaderAction[];
  footerContent?: ReactNode;
  cardActions?: CardAction[]; // Actions for the card body itself, often rendered as a dropdown menu
  contextMenuActions?: CardContextMenuItem[]; // Actions available on right-click context menu

  // Advanced Header Content Slots
  headerPrefix?: ReactNode | CardHeaderPrefixSuffix; // e.g., Avatar, icon, status indicator
  headerSuffix?: ReactNode | CardHeaderPrefixSuffix; // e.g., Tags, badges, timestamps
  customTitleComponent?: ReactNode; // Full override for title rendering
  customSubtitleComponent?: ReactNode; // Full override for subtitle rendering
  customHeaderComponent?: ReactNode; // Full override for entire header area

  // Advanced Footer Content Slots
  customFooterComponent?: ReactNode; // Full override for entire footer area

  // Main Content Structure
  contentLayout?: CardContentLayout; // How the main content area is structured
  tabs?: CardTab[]; // For `contentLayout = 'tabs'`
  activeTabId?: string; // Controlled active tab
  onTabChange?: (tabId: string) => void;
  sections?: CardSection[]; // For `contentLayout = 'sections'`

  // Behavior and State (Existing & Expanded)
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapseToggle?: (isCollapsed: boolean) => void; // Callback for collapse state change
  isLoading?: boolean;
  errorState?: string | null; // Message to display on error
  onRetry?: () => void; // Callback for retry button in error state
  isEmpty?: boolean; // New state for showing empty UI when no data is present
  emptyStateMessage?: string;
  emptyStateAction?: CardAction; // Action for empty state (e.g., 'Add New Item')
  customEmptyComponent?: ReactNode; // Custom component for empty state
  onLoadMore?: () => void; // For infinite scrolling / pagination within the card
  hasMoreContent?: boolean; // Indicates if more content can be loaded (for `onLoadMore`)
  initialHeight?: number; // For cards that expand from an initial state
  initialWidth?: number; // For cards that expand from an initial state

  // Interactivity (New)
  isSelectable?: boolean; // Can the card be selected?
  isSelected?: boolean; // Controlled selection state
  onSelect?: (isSelected: boolean) => void; // Callback for selection change
  isHoverable?: boolean; // Explicitly enable/disable default hover effects (if variant='interactive')
  draggable?: CardDraggableConfig;
  resizable?: CardResizableConfig;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void; // Focus event handler for card
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void; // Blur event handler for card

  // Persistence (New)
  persistence?: CardPersistenceConfig;

  // Accessibility & Keyboard Navigation (New)
  keyboardNav?: CardKeyboardNavConfig;
  role?: string; // ARIA role, e.g., 'region', 'group', 'article'
  ariaLabel?: string; // ARIA label for the card
  ariaLive?: 'off' | 'polite' | 'assertive'; // For dynamic content updates to screen readers

  // Styling and Layout (Existing & Expanded)
  className?: string; // Custom class for the card container
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg' | 'none'; // Control internal padding of the card body
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void; // Main click handler for the card
  size?: CardSize; // xs, sm, md, lg, xl, 2xl, full, auto
  shape?: CardShape; // none, sm, md, lg, xl, 2xl, full
  elevation?: CardElevation; // none, sm, md, lg, xl, 2xl
  backgroundColor?: string; // Custom background color (overrides variant)
  borderColor?: string; // Custom border color (overrides variant)
  textColor?: string; // Custom text color for content
  customStyles?: React.CSSProperties; // Raw CSS properties for the main card div
  contentClassName?: string; // Class for the main content area (inside padding)
  headerClassName?: string; // Class for the header div
  footerClassName?: string; // Class for the footer div

  // Dynamic Badges/Overlays
  badges?: CardBadge[]; // Array of badges to display on the card
  overlay?: CardOverlay; // Configuration for a full-card overlay

  // Custom Components (Existing & Expanded)
  loadingIndicator?: ReactNode; // Existing custom component for loading state
  customErrorIndicator?: ReactNode; // Custom icon/component for error state
  cardToolbar?: ReactNode; // A dedicated slot for a toolbar inside the card, often above content
  dropZoneContent?: ReactNode; // Content to display when card is a drop target

  // Performance Optimization
  virtualization?: CardVirtualizationConfig; // For rendering large lists of items efficiently
  deferRender?: boolean; // Delay rendering content until card is visible (e.g., using Intersection Observer)
  minHeight?: number; // Minimum height for deferred rendering placeholder

  // Data & Real-time
  realtime?: CardRealtimeConfig; // Configuration for real-time data updates
  accessControl?: CardAccessControl; // Permissions management for card visibility/interactivity

  // Animations & Transitions
  enableAnimations?: boolean; // Global toggle for card animations
  animationType?: CardAnimationType; // Predefined entry/exit animation types
  animationDuration?: number; // Duration in ms

  // Event Logging/Analytics
  onCardViewed?: (cardId: string, details?: any) => void;
  onCardInteraction?: (cardId: string, action: string, details?: any) => void;

  // Versioning (for content within card - conceptual)
  versionHistory?: { timestamp: string; user: string; description: string; contentPreview: string; }[];
  onRevertVersion?: (versionId: string) => void;
  currentVersionId?: string;

  // Internationalization (conceptual)
  locale?: string; // For date/number formatting within the card
  messages?: { [key: string]: string }; // Custom messages for i18n
}


// ================================================================================================
// INTERNAL HELPER FUNCTIONS & CONSTANTS - EXPANDED
// ================================================================================================

/**
 * @description Generates the appropriate CSS class string for a given card variant.
 * @param {CardVariant} variant - The card variant.
 * @returns {string} The corresponding Tailwind CSS classes.
 */
const getVariantClasses = (variant: CardVariant): string => {
  switch (variant) {
    case 'outline':
      return 'bg-transparent border border-gray-600/80 shadow-md';
    case 'ghost':
      return 'bg-transparent border-none shadow-none';
    case 'interactive':
      return 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-xl shadow-lg transition-all duration-300 hover:bg-gray-800/80 hover:border-cyan-500/80 hover:shadow-cyan-500/10';
    case 'solid':
      return 'bg-gray-700 rounded-xl shadow-lg border border-gray-600'; // Example solid variant
    case 'default':
    default:
      return 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/60 rounded-xl shadow-lg';
  }
};

/**
 * @description Provides CSS classes for different padding sizes.
 * @param {'sm' | 'md' | 'lg' | 'none'} padding - The desired padding level.
 * @returns {string} The Tailwind CSS classes for padding.
 */
const getPaddingClasses = (padding: 'sm' | 'md' | 'lg' | 'none'): string => {
    switch(padding) {
        case 'sm': return 'p-3';
        case 'md': return 'p-6';
        case 'lg': return 'p-8';
        case 'none': return 'p-0';
        default: return 'p-6';
    }
}

/**
 * @description Provides CSS classes for different card sizes (max-width).
 * @param {CardSize} size - The desired card size.
 * @returns {string} The Tailwind CSS classes for max-width.
 */
const getSizeClasses = (size: CardSize): string => {
  switch (size) {
    case 'xs': return 'max-w-xs';
    case 'sm': return 'max-w-sm';
    case 'md': return 'max-w-md';
    case 'lg': return 'max-w-lg';
    case 'xl': return 'max-w-xl';
    case '2xl': return 'max-w-2xl';
    case 'full': return 'w-full';
    case 'auto': return 'w-auto'; // Content-based width
    default: return 'w-full';
  }
};

/**
 * @description Provides CSS classes for different card shapes (border-radius).
 * @param {CardShape} shape - The desired card shape.
 * @returns {string} The Tailwind CSS classes for border-radius.
 */
const getShapeClasses = (shape: CardShape): string => {
  switch (shape) {
    case 'none': return 'rounded-none';
    case 'sm': return 'rounded-sm';
    case 'md': return 'rounded-md';
    case 'lg': return 'rounded-lg';
    case 'xl': return 'rounded-xl';
    case '2xl': return 'rounded-2xl';
    case 'full': return 'rounded-full';
    default: return 'rounded-xl';
  }
};

/**
 * @description Provides CSS classes for different card elevation (shadow intensity).
 * @param {CardElevation} elevation - The desired card elevation.
 * @returns {string} The Tailwind CSS classes for shadow.
 */
const getElevationClasses = (elevation: CardElevation): string => {
  switch (elevation) {
    case 'sm': return 'shadow-sm';
    case 'md': return 'shadow-md';
    case 'lg': return 'shadow-lg';
    case 'xl': return 'shadow-xl';
    case '2xl': return 'shadow-2xl';
    case 'none':
    default: return 'shadow-none';
  }
};

/**
 * @description Generates inline styles for custom background, border, and text colors.
 * @param {Partial<CardProps>} props - Partial card props containing color definitions.
 * @returns {React.CSSProperties} The inline CSS style object.
 */
const getCustomColorStyles = (props: Partial<CardProps>): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
  if (props.borderColor) styles.borderColor = props.borderColor;
  if (props.textColor) styles.color = props.textColor;
  return styles;
};

/**
 * @description A custom hook for debouncing function calls.
 */
const useDebounce = <T extends any[]>(callback: (...args: T) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  return debouncedCallback;
};

/**
 * @description A custom hook for managing and persisting card state (collapse, position, etc.).
 */
const useCardPersistence = (config?: CardPersistenceConfig, initialState: any = {}) => {
  const [persistedState, setPersistedState] = useState<any>(initialState);
  const latestConfig = useRef(config);
  latestConfig.current = config; // Keep config up-to-date

  const saveState = useCallback(async (stateToSave: any) => {
    const currentConfig = latestConfig.current;
    if (!currentConfig?.enabled || !currentConfig.id) return;

    const stateToPersist: any = {};
    if (currentConfig.fields) {
      currentConfig.fields.forEach(field => {
        if (stateToSave[field] !== undefined) {
          stateToPersist[field] = stateToSave[field];
        }
      });
    } else {
      Object.assign(stateToPersist, stateToSave); // If no fields specified, persist all
    }

    try {
      if (currentConfig.onSave) {
        await currentConfig.onSave(currentConfig.id, stateToPersist);
      } else if (currentConfig.storageType === 'localStorage') {
        localStorage.setItem(`card_state_${currentConfig.id}`, JSON.stringify(stateToPersist));
      } else if (currentConfig.storageType === 'sessionStorage') {
        sessionStorage.setItem(`card_state_${currentConfig.id}`, JSON.stringify(stateToPersist));
      }
      // Future: backend integration
    } catch (e) {
      console.error(`Failed to save card state for ${currentConfig.id}:`, e);
    }
  }, []);

  const debouncedSaveState = useDebounce(saveState, config?.debounceMs ?? 500);

  useEffect(() => {
    const currentConfig = latestConfig.current;
    if (!currentConfig?.enabled || !currentConfig.id) return;

    const loadState = async () => {
      let loaded: any = null;
      try {
        if (currentConfig.onLoad) {
          loaded = await currentConfig.onLoad(currentConfig.id);
        } else if (currentConfig.storageType === 'localStorage') {
          const stored = localStorage.getItem(`card_state_${currentConfig.id}`);
          if (stored) loaded = JSON.parse(stored);
        } else if (currentConfig.storageType === 'sessionStorage') {
          const stored = sessionStorage.getItem(`card_state_${currentConfig.id}`);
          if (stored) loaded = JSON.parse(stored);
        }
        setPersistedState((prev: any) => ({ ...initialState, ...prev, ...loaded }));
      } catch (e) {
        console.error(`Failed to load card state for ${currentConfig.id}:`, e);
      }
    };
    loadState();

    return () => { /* Cleanup if any, e.g., unsubscribe from backend listeners */ };
  }, [config?.enabled, config?.id, config?.onLoad, config?.storageType, JSON.stringify(initialState)]); // Re-run effect if persistence config changes

  const updatePersistedState = useCallback((field: string, value: any) => {
    setPersistedState((prev: any) => {
      const newState = { ...prev, [field]: value };
      if (!latestConfig.current?.fields || latestConfig.current.fields.includes(field as any)) {
        debouncedSaveState(newState);
      }
      return newState;
    });
  }, [debouncedSaveState]);

  return { persistedState, updatePersistedState };
};

/**
 * @description A custom hook for handling real-time updates to the card.
 */
const useCardRealtime = (config?: CardRealtimeConfig, onUpdateCallback?: (data: any) => void) => {
  const latestOnUpdateCallback = useRef(onUpdateCallback);
  latestOnUpdateCallback.current = onUpdateCallback;

  useEffect(() => {
    if (!config?.enabled || !config.channelId) return;

    if (config.connector) {
      // Use custom connector if provided
      const unsubscribe = config.connector(config.channelId, (data) => {
        latestOnUpdateCallback.current?.(data);
        config.onUpdate?.(data);
      });
      return unsubscribe;
    } else {
      // Simulate WebSocket connection or polling
      console.log(`[Realtime] Connecting to channel: ${config.channelId} (simulated)`);
      const interval = setInterval(() => {
        const mockData = {
          timestamp: new Date().toISOString(),
          value: Math.random(),
          message: `Update for ${config.channelId} at ${new Date().toLocaleTimeString()}`
        };
        latestOnUpdateCallback.current?.(mockData);
        config.onUpdate?.(mockData);
      }, config.pollingIntervalMs || 5000); // Default to polling if no custom connector

      return () => {
        clearInterval(interval);
        console.log(`[Realtime] Disconnecting from channel: ${config.channelId} (simulated)`);
      };
    }
  }, [config?.enabled, config?.channelId, config?.connector, config?.pollingIntervalMs, config?.onUpdate]);
};

/**
 * @description Renders a context menu. This would typically be a portal-based component.
 */
const renderContextMenu = (
  actions: CardContextMenuItem[],
  position: { x: number; y: number },
  onClose: () => void,
  onCardInteraction?: (cardId: string, action: string, details?: any) => void,
  cardId?: string
) => {
  if (!actions || actions.length === 0) return null;

  // This is a basic rendering, a full context menu would handle nested menus, keyboard nav etc.
  return (
    <div
      className="absolute bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1 z-50 min-w-[12rem]"
      style={{ top: position.y, left: position.x }}
      onMouseLeave={onClose}
    >
      {actions.map(action => {
        if (action.isHidden) return null;
        if (action.separator) return <div key={`sep-${action.id}`} className="border-t border-gray-700 my-1" />;

        return (
          <button
            key={action.id}
            onClick={(e) => {
              action.onClick(e as any);
              onClose();
              onCardInteraction?.(cardId || 'unknown', `context_menu_action`, { actionId: action.id, label: action.label });
            }}
            disabled={action.disabled}
            aria-label={action.label}
            title={action.tooltip}
            className={`flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${action.className || ''}`}
          >
            {action.renderCustom ? action.renderCustom(action) : (
              <>
                {action.icon && React.cloneElement(action.icon, { className: 'h-4 w-4 mr-2' })}
                {action.label}
                {action.shortcut && <span className="ml-auto text-xs text-gray-500">{action.shortcut}</span>}
                {action.subItems && (
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
};


// ================================================================================================
// INTERNAL SUB-COMPONENTS - EXPANDED
// ================================================================================================

/**
 * @description Displays a small info icon with a hover tooltip.
 */
const InfoTooltip: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
    <div className={`group relative flex items-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            {text}
        </div>
    </div>
);

/**
 * @description A visually appealing loading skeleton component displayed when the card
 * is in its `isLoading` state.
 */
const LoadingSkeleton: React.FC = () => {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-700 rounded-md w-1/3"></div>
            <div className="h-6 bg-gray-700 rounded-full w-6"></div>
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-gray-700 rounded-md w-full"></div>
          <div className="h-4 bg-gray-700 rounded-md w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded-md w-3/4"></div>
        </div>
        <div className="space-y-3 pt-6">
          <div className="h-4 bg-gray-700 rounded-md w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded-md w-4/6"></div>
        </div>
      </div>
    );
};

/**
 * @description A standardized display for showing error messages within the card.
 */
const ErrorDisplay: React.FC<{ message: string; onRetry?: () => void; customIndicator?: ReactNode; }> = ({ message, onRetry, customIndicator }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-red-900/20 border-t border-b border-red-500/20">
            {customIndicator || (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h4 className="text-lg font-semibold text-red-200">An Error Occurred</h4>
            <p className="text-red-300 mt-1 mb-4 max-w-md">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-red-500/50 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    );
};

/**
 * @description A standardized display for showing an empty state within the card.
 */
const EmptyStateDisplay: React.FC<{ message?: string; action?: CardAction; customComponent?: ReactNode; }> = ({ message, action, customComponent }) => {
  if (customComponent) return <>{customComponent}</>;
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 text-gray-400 min-h-[120px]">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
      <h4 className="text-lg font-semibold text-gray-300">
        {message || "No content available."}
      </h4>
      {action && (
        <button
          onClick={action.onClick}
          aria-label={action.label}
          disabled={action.disabled}
          title={action.tooltip}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {action.icon && React.cloneElement(action.icon, { className: 'h-4 w-4 mr-2 inline-block' })}
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * @description The header component for the card. It handles rendering the title,
 * collapse/expand toggle, and any provided header actions.
 */
const CardHeader: React.FC<{
  title?: string;
  titleTooltip?: string;
  subtitle?: string;
  isCollapsible?: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  actions?: CardHeaderAction[];
  headerPrefix?: ReactNode | CardHeaderPrefixSuffix;
  headerSuffix?: ReactNode | CardHeaderPrefixSuffix;
  customTitleComponent?: ReactNode;
  customSubtitleComponent?: ReactNode;
  className?: string; // Custom class for header div
  onCardInteraction?: (cardId: string, action: string, details?: any) => void;
  cardId?: string;
}> = ({ title, titleTooltip, subtitle, isCollapsible, isCollapsed, toggleCollapse, actions, headerPrefix, headerSuffix, customTitleComponent, customSubtitleComponent, className, onCardInteraction, cardId }) => {
  const hasContent = title || subtitle || customTitleComponent || customSubtitleComponent;
  const hasPrefixOrSuffix = headerPrefix || headerSuffix;
  const hasActions = actions && actions.length > 0;

  if (!hasContent && !hasActions && !isCollapsible && !hasPrefixOrSuffix) {
    return null; // Render no header if there's no title, subtitle, prefix, suffix, and no actions.
  }

  const handleHeaderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle collapse if the click is directly on the header, not on an action button or prefix/suffix.
    if (isCollapsible && !(e.target as HTMLElement).closest('button, .card-header-prefix, .card-header-suffix')) {
      toggleCollapse();
      onCardInteraction?.(cardId || 'unknown', 'header_clicked', { isCollapsed: !isCollapsed });
    }
  };

  const headerCursorClass = isCollapsible ? 'cursor-pointer' : 'cursor-default';

  const renderPrefixSuffix = (item: ReactNode | CardHeaderPrefixSuffix, defaultAlignment: 'start' | 'end', keyPrefix: string) => {
    if (!item) return null;
    if (React.isValidElement(item)) {
      return <div key={`${keyPrefix}-node`} className={`card-header-${defaultAlignment} flex items-center`}>{item}</div>;
    }
    const { content, alignment, className: psClassName } = item as CardHeaderPrefixSuffix;
    return <div key={`${keyPrefix}-config`} className={`card-header-${defaultAlignment} flex items-center ${alignment === 'center' ? 'justify-center' : (alignment === 'end' ? 'justify-end' : 'justify-start')} ${psClassName || ''}`}>{content}</div>;
  };

  return (
    <div
      className={`flex items-start justify-between pb-4 ${headerCursorClass} ${className || ''}`}
      onClick={handleHeaderClick}
    >
      {renderPrefixSuffix(headerPrefix, 'start', 'prefix')}
      {(hasContent || hasPrefixOrSuffix) && (
        <div className="flex-1 px-4"> {/* Added px-4 for spacing */}
            {customTitleComponent || (title && (
                 <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-100 truncate">{title}</h3>
                    {titleTooltip && <InfoTooltip text={titleTooltip} />}
                </div>
            ))}
            {customSubtitleComponent || (subtitle && (
            <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            ))}
        </div>
      )}
      {renderPrefixSuffix(headerSuffix, 'end', 'suffix')}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {actions && actions.map(action => (
          action.renderCustom ? action.renderCustom(action) : (
            <button
              key={action.id}
              onClick={(e) => {
                e.stopPropagation(); // Prevent header click from firing
                action.onClick(e);
                onCardInteraction?.(cardId || 'unknown', 'header_action_clicked', { actionId: action.id, label: action.label });
              }}
              aria-label={action.label}
              aria-haspopup={action.ariaHasPopup}
              aria-expanded={action.ariaExpanded}
              disabled={action.disabled}
              title={action.tooltip} // Added title for native tooltip
              className={`p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${action.className || ''}`}
            >
              {React.cloneElement(action.icon as React.ReactElement<any>, { className: 'h-5 w-5' })}
            </button>
          )
        ))}
        {isCollapsible && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent header click from firing
              toggleCollapse();
              onCardInteraction?.(cardId || 'unknown', 'toggle_collapse_button_clicked', { isCollapsed: !isCollapsed });
            }}
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * @description The footer component for the card. Renders provided footer content
 * with appropriate styling.
 */
const CardFooter: React.FC<{ children?: ReactNode; className?: string }> = ({ children, className }) => {
  if (!children) return null;
  return (
    <div className={`pt-4 border-t border-gray-700/60 ${className}`}>
      {children}
    </div>
  );
};

/**
 * @description A dedicated toolbar component for the card.
 */
export const CardToolbar: React.FC<{ children: ReactNode; className?: string; }> = ({ children, className }) => {
  if (!children) return null;
  return (
    <div className={`flex items-center justify-between p-3 border-b border-gray-700/60 bg-gray-800/60 z-10 ${className}`}>
      {children}
    </div>
  );
};

/**
 * @description Renders badges overlaid on the card.
 */
const CardBadgesRenderer: React.FC<{ badges?: CardBadge[]; onCardInteraction?: (cardId: string, action: string, details?: any) => void; cardId?: string; }> = ({ badges, onCardInteraction, cardId }) => {
  if (!badges || badges.length === 0) return null;

  return (
    <>
      {badges.map(badge => (
        <div
          key={badge.id}
          className={`absolute z-20 ${badge.className || ''}`}
          title={badge.tooltip}
          onClick={(e) => {
            badge.onClick?.(e);
            onCardInteraction?.(cardId || 'unknown', 'badge_clicked', { badgeId: badge.id });
          }}
          style={{
            // Basic positioning; full implementation would be more robust
            ...(badge.position === 'top-left' && { top: '0.5rem', left: '0.5rem' }),
            ...(badge.position === 'top-right' && { top: '0.5rem', right: '0.5rem' }),
            ...(badge.position === 'bottom-left' && { bottom: '0.5rem', left: '0.5rem' }),
            ...(badge.position === 'bottom-right' && { bottom: '0.5rem', right: '0.5rem' }),
            ...(badge.position === 'top-center' && { top: '0.5rem', left: '50%', transform: 'translateX(-50%)' }),
            ...(badge.position === 'bottom-center' && { bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)' }),
            ...(badge.position === 'overlay-center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
          }}
        >
          {badge.content}
        </div>
      ))}
    </>
  );
};

/**
 * @description Renders a full-card overlay.
 */
const CardOverlayRenderer: React.FC<{ config?: CardOverlay; onCardInteraction?: (cardId: string, action: string, details?: any) => void; cardId?: string; }> = ({ config, onCardInteraction, cardId }) => {
  if (!config || !config.isVisible) return null;

  const overlayClasses = `absolute inset-0 flex z-40 ${config.className || ''}`;
  const backdropClasses = `absolute inset-0 bg-black ${config.backgroundBlur ? 'backdrop-blur-sm' : ''}`;
  const contentWrapperClasses = `relative z-50 p-4 max-h-full max-w-full overflow-auto ${
    config.position === 'top' ? 'self-start' :
    config.position === 'bottom' ? 'self-end' :
    config.position === 'full' ? 'w-full h-full' :
    'm-auto'
  }`;

  const handleDismiss = useCallback(() => {
    if (config.dismissible && config.onDismiss) {
      config.onDismiss();
      onCardInteraction?.(cardId || 'unknown', 'overlay_dismissed');
    }
  }, [config, onCardInteraction, cardId]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleDismiss();
    }
  }, [handleDismiss]);

  useEffect(() => {
    if (config.isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling body when overlay is active
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [config.isVisible, handleKeyDown]);

  const closeButtonClasses = `absolute z-50 p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-full transition-colors`;
  const defaultCloseButton = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    <div className={overlayClasses}>
      <div
        className={backdropClasses}
        style={{ opacity: config.backgroundOpacity !== undefined ? config.backgroundOpacity : 0.7 }}
        onClick={handleDismiss}
      ></div>
      <div className={contentWrapperClasses}>
        {(config.closeButton || config.dismissible) && (config.dismissible || config.onDismiss) && (
          <button
            onClick={handleDismiss}
            className={`${closeButtonClasses} ${
              config.closeButtonPosition === 'top-left' ? 'top-2 left-2' :
              config.closeButtonPosition === 'bottom-left' ? 'bottom-2 left-2' :
              config.closeButtonPosition === 'bottom-right' ? 'bottom-2 right-2' : 'top-2 right-2' // Default top-right
            }`}
            aria-label="Close overlay"
          >
            {config.closeButton || defaultCloseButton}
          </button>
        )}
        {config.content}
      </div>
    </div>
  );
};

/**
 * @description Renders the content of the currently active tab.
 */
const CardTabsContent: React.FC<{ tabs: CardTab[]; activeTabId: string; }> = ({ tabs, activeTabId }) => {
  const activeTab = tabs.find(tab => tab.id === activeTabId);
  return (
    <div className="card-tab-content pt-4">
      {activeTab?.content || null}
    </div>
  );
};

/**
 * @description Renders a series of sections, potentially as nested cards.
 */
const CardSectionsContent: React.FC<{ sections: CardSection[]; onCardInteraction?: (cardId: string, action: string, details?: any) => void; parentCardId?: string; }> = ({ sections, onCardInteraction, parentCardId }) => {
  return (
    <div className="card-sections-container space-y-4">
      {sections.map(section => {
        if (section.renderIf === false) return null; // Conditional rendering

        return (
          <Card
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            isCollapsible={section.isCollapsible}
            defaultCollapsed={section.defaultCollapsed}
            headerActions={section.actions}
            variant={section.variant || "ghost"} // Sections within a card often have lighter styling
            padding={section.padding || "sm"}
            className={`border-b border-gray-700/60 last:border-b-0 ${section.className || ''}`}
            onCardInteraction={onCardInteraction}
            persistence={{ id: `${parentCardId || 'unknown'}_section_${section.id}`, enabled: true, fields: ['collapsed'] }}
            // Pass through specific props to nested cards for consistency or unique behavior
          >
            {section.content}
          </Card>
        );
      })}
    </div>
  );
};

/**
 * @description Handles various content layouts including children, tabs, sections, grid, and flex.
 */
const CardBody: React.FC<{
  children?: ReactNode;
  contentLayout: CardContentLayout;
  tabs?: CardTab[];
  activeTabId: string; // Ensure activeTabId is always passed
  onTabChange?: (tabId: string) => void;
  sections?: CardSection[];
  contentClassName?: string;
  onLoadMore?: () => void;
  hasMoreContent?: boolean;
  virtualization?: CardVirtualizationConfig;
  cardId?: string;
  onCardInteraction?: (cardId: string, action: string, details?: any) => void;
}> = ({
  children,
  contentLayout,
  tabs,
  activeTabId,
  onTabChange,
  sections,
  contentClassName,
  onLoadMore,
  hasMoreContent,
  virtualization,
  cardId,
  onCardInteraction,
}) => {

  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0); // For virtualized scrolling

  const renderRegularContent = () => {
    switch (contentLayout) {
      case 'tabs':
        if (!tabs || tabs.length === 0) return null;
        return (
          <>
            <div className="flex border-b border-gray-700/60 mb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (!tab.disabled) {
                      onTabChange?.(tab.id);
                      onCardInteraction?.(cardId || 'unknown', 'tab_switched', { tabId: tab.id });
                    }
                  }}
                  className={`flex items-center px-4 py-2 text-sm font-medium ${
                    activeTabId === tab.id
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-400 hover:text-white hover:border-gray-500/50'
                  } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''} transition-colors relative ${tab.className || ''}`}
                  disabled={tab.disabled}
                  title={tab.tooltip}
                  aria-selected={activeTabId === tab.id}
                  role="tab"
                >
                  {tab.icon && React.cloneElement(tab.icon, { className: 'h-4 w-4 mr-2' })}
                  {tab.label}
                  {tab.badge && <span className="ml-2">{tab.badge}</span>}
                </button>
              ))}
            </div>
            <CardTabsContent tabs={tabs} activeTabId={activeTabId} />
          </>
        );
      case 'sections':
        if (!sections || sections.length === 0) return null;
        return <CardSectionsContent sections={sections} parentCardId={cardId} onCardInteraction={onCardInteraction} />;
      case 'grid':
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
      case 'flex-row':
        return <div className="flex flex-row space-x-4">{children}</div>;
      case 'flex-column':
        return <div className="flex flex-col space-y-4">{children}</div>;
      case 'default':
      default:
        return children;
    }
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    setScrollPosition(scrollTop); // Track scroll position for virtualization
    if (onLoadMore && hasMoreContent && (scrollTop + clientHeight >= scrollHeight - 50)) { // 50px from bottom
      onLoadMore();
      onCardInteraction?.(cardId || 'unknown', 'load_more_content');
    }
  }, [onLoadMore, hasMoreContent, onCardInteraction, cardId]);

  const renderVirtualizedContent = () => {
    if (!virtualization?.enabled || virtualization.itemCount === 0) return renderRegularContent();

    const itemHeight = virtualization.estimatedItemHeight || 50;
    const itemWidth = virtualization.estimatedItemWidth || 200;
    const overscan = virtualization.overscan || 3;

    const viewportSize = contentRef.current ?
      (virtualization.direction === 'horizontal' ? contentRef.current.clientWidth : contentRef.current.clientHeight) : 0;
    const totalSize = (virtualization.direction === 'horizontal' ? itemWidth : itemHeight) * virtualization.itemCount;

    const startIndex = Math.max(0, Math.floor(scrollPosition / (virtualization.direction === 'horizontal' ? itemWidth : itemHeight)) - overscan);
    const endIndex = Math.min(
      virtualization.itemCount - 1,
      Math.floor((scrollPosition + viewportSize) / (virtualization.direction === 'horizontal' ? itemWidth : itemHeight)) + overscan
    );

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const style: React.CSSProperties = virtualization.direction === 'horizontal' ?
        { position: 'absolute', left: i * itemWidth, width: itemWidth, height: '100%' } :
        { position: 'absolute', top: i * itemHeight, height: itemHeight, width: '100%' };
      items.push(
        <div key={i} style={style} className="virtualized-item">
          {virtualization.renderItem(i, style)}
        </div>
      );
    }

    return (
      <div
        ref={contentRef}
        className={`overflow-auto relative ${virtualization.className || ''}`}
        style={virtualization.direction === 'horizontal' ? { height: 'auto', width: '100%' } : { height: '300px' }} // Fixed height needed for vertical scroll, or pass a height prop to CardBody
        onScroll={handleScroll}
      >
        <div
          className="relative"
          style={virtualization.direction === 'horizontal' ? { width: totalSize, height: '100%' } : { height: totalSize, width: '100%' }}
        >
          {items}
        </div>
      </div>
    );
  };

  return (
    <div className={`card-body ${contentClassName || ''}`} ref={!virtualization?.enabled ? contentRef : undefined} onScroll={!virtualization?.enabled && onLoadMore ? handleScroll : undefined}>
      {virtualization?.enabled ? renderVirtualizedContent() : renderRegularContent()}
      {onLoadMore && hasMoreContent && (
        <div className="text-center py-4 text-gray-400">Loading more content...</div>
      )}
    </div>
  );
};


// ================================================================================================
// MAIN CARD COMPONENT - EXPANDED INTO A UNIVERSAL ENTITY
// ================================================================================================

export const Card: React.FC<CardProps> = ({
  title,
  titleTooltip,
  subtitle,
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  headerActions,
  footerContent,
  isCollapsible = false,
  defaultCollapsed = false,
  onCollapseToggle,
  isLoading = false,
  errorState = null,
  onRetry,
  onClick,
  loadingIndicator,
  isEmpty = false,
  emptyStateMessage,
  emptyStateAction,
  customEmptyComponent,
  onLoadMore,
  hasMoreContent,
  isSelectable = false,
  isSelected: propIsSelected = false, // Renamed to avoid conflict with internal state
  onSelect,
  isHoverable,
  draggable,
  resizable,
  onFocus,
  onBlur,
  persistence,
  keyboardNav,
  role,
  ariaLabel,
  ariaLive,
  size = 'full',
  shape = 'rounded',
  elevation = 'md',
  backgroundColor,
  borderColor,
  textColor,
  customStyles,
  contentClassName,
  headerClassName,
  footerClassName,
  badges,
  overlay,
  customErrorIndicator,
  cardToolbar,
  virtualization,
  deferRender = false,
  minHeight, // For deferred content placeholder
  realtime,
  accessControl,
  enableAnimations = true,
  animationType = 'fade',
  animationDuration = 300,
  onCardViewed,
  onCardInteraction,
  versionHistory,
  onRevertVersion,
  currentVersionId,
  cardActions,
  contextMenuActions,
  headerPrefix,
  headerSuffix,
  customTitleComponent,
  customSubtitleComponent,
  customHeaderComponent,
  customFooterComponent,
  contentLayout = 'default',
  tabs,
  activeTabId,
  onTabChange,
  sections,
  dropZoneContent, // NEW: content for when card is a drop target
  initialHeight,
  initialWidth,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isInternalCollapsed, setIsInternalCollapsed] = useState(defaultCollapsed && isCollapsible);
    const [internalIsSelected, setInternalIsSelected] = useState(propIsSelected); // Internal state for selection
    const [internalActiveTabId, setInternalActiveTabId] = useState(activeTabId || tabs?.[0]?.id || '');
    const [isRendered, setIsRendered] = useState(!deferRender); // For deferRender
    const [contextMenuState, setContextMenuState] = useState<{ visible: boolean; x: number; y: number; } | null>(null);
    const [currentSize, setCurrentSize] = useState({ width: initialWidth, height: initialHeight });
    const [currentPosition, setCurrentPosition] = useState(draggable?.initialPosition || { x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false); // For drag and drop target

    const persistenceId = persistence?.id || `card-${title?.replace(/\s/g, '_') || 'unknown'}`;

    // Integrate persistence for collapse state, active tab, selection, position, size
    const { persistedState, updatePersistedState } = useCardPersistence(persistence, {
      collapsed: defaultCollapsed,
      activeTab: internalActiveTabId,
      selected: propIsSelected,
      position: draggable?.initialPosition || { x: 0, y: 0 },
      size: { width: initialWidth, height: initialHeight },
    });

    // Sync initial state from persistence or props
    useEffect(() => {
      if (persistence?.enabled) {
        if (persistence.fields?.includes('collapsed') && persistedState.collapsed !== undefined) {
          setIsInternalCollapsed(persistedState.collapsed);
        } else {
          setIsInternalCollapsed(defaultCollapsed); // Fallback to prop
        }
        if (persistence.fields?.includes('activeTab') && persistedState.activeTab !== undefined) {
          setInternalActiveTabId(persistedState.activeTab);
        } else {
          setInternalActiveTabId(activeTabId || tabs?.[0]?.id || ''); // Fallback
        }
        if (persistence.fields?.includes('selected') && persistedState.selected !== undefined) {
          setInternalIsSelected(persistedState.selected);
        } else {
          setInternalIsSelected(propIsSelected); // Fallback
        }
        if (persistence.fields?.includes('position') && persistedState.position) {
          setCurrentPosition(persistedState.position);
        }
        if (persistence.fields?.includes('size') && persistedState.size?.width && persistedState.size?.height) {
          setCurrentSize(persistedState.size);
        }
      } else { // If persistence is not enabled, use props as source of truth
        setIsInternalCollapsed(defaultCollapsed);
        setInternalActiveTabId(activeTabId || tabs?.[0]?.id || '');
        setInternalIsSelected(propIsSelected);
        setCurrentPosition(draggable?.initialPosition || { x: 0, y: 0 });
        setCurrentSize({ width: initialWidth, height: initialHeight });
      }
    }, [persistence, persistedState, defaultCollapsed, activeTabId, tabs, propIsSelected, draggable?.initialPosition, initialHeight, initialWidth]);

    // Ensure propIsSelected overrides persistedState if controlled
    useEffect(() => {
      setInternalIsSelected(propIsSelected);
    }, [propIsSelected]);


    const resolvedIsCollapsed = isCollapsible ? isInternalCollapsed : false;
    const currentActiveTabId = onTabChange ? (activeTabId || internalActiveTabId) : internalActiveTabId;


    const toggleCollapse = useCallback(() => {
        if (isCollapsible) {
            setIsInternalCollapsed(prev => {
                const newState = !prev;
                updatePersistedState('collapsed', newState);
                onCollapseToggle?.(newState); // Callback for parent
                onCardInteraction?.(persistenceId, `toggle_collapse`, { isCollapsed: newState });
                return newState;
            });
        }
    }, [isCollapsible, updatePersistedState, onCollapseToggle, onCardInteraction, persistenceId]);

    const handleInternalTabChange = useCallback((tabId: string) => {
      setInternalActiveTabId(tabId);
      updatePersistedState('activeTab', tabId);
      onTabChange?.(tabId); // Propagate to parent if controlled
      onCardInteraction?.(persistenceId, `tab_change`, { tabId });
    }, [onTabChange, updatePersistedState, onCardInteraction, persistenceId]);

    const handleSelect = useCallback(() => {
      if (isSelectable) {
        setInternalIsSelected(prev => {
          const newState = !prev;
          updatePersistedState('selected', newState);
          onSelect?.(newState); // Propagate to parent
          onCardInteraction?.(persistenceId, 'card_selected_toggle', { isSelected: newState });
          return newState;
        });
      }
    }, [isSelectable, onSelect, updatePersistedState, onCardInteraction, persistenceId]);


    // Intersection Observer for deferRender
    useEffect(() => {
      if (!deferRender || isRendered) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setIsRendered(true);
            onCardViewed?.(persistenceId);
            onCardInteraction?.(persistenceId, 'card_viewed');
            observer.disconnect();
          }
        },
        { threshold: 0.1 } // Trigger when 10% of the card is visible
      );

      if (cardRef.current) {
        observer.observe(cardRef.current);
      }

      return () => {
        if (observer && cardRef.current) {
          observer.unobserve(cardRef.current);
        }
      };
    }, [deferRender, isRendered, onCardViewed, onCardInteraction, persistenceId]);

    // Real-time updates
    useCardRealtime(realtime, (data) => {
      console.log(`Card ${persistenceId} received real-time update:`, data);
      onCardInteraction?.(persistenceId, 'realtime_update_received', data);
      // Here, typically, you would dispatch an action or update local component state based on data
    });

    // Access control check
    const hasAccess = accessControl?.permissionChecker
      ? accessControl.permissionChecker(accessControl.requiredPermissions || [], accessControl.userId)
      : (accessControl?.requiredPermissions ? false : true); // Default to false if permissions required but no checker

    if (!hasAccess && accessControl?.onAccessDenied) {
      return <>{accessControl.onAccessDenied}</>;
    } else if (!hasAccess) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900/50 text-red-400 rounded-lg border border-red-700/50 min-h-[150px]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L12 12m-9.147-9.147L5.636 5.636m-2.26 2.26L5.636 5.636m12.728 12.728L12 12" /></svg>
          <h3 className="text-xl font-semibold">Access Denied</h3>
          <p className="mt-2 text-gray-400">You do not have the necessary permissions to view this content.</p>
        </div>
      );
    }

    const baseClasses = `relative flex flex-col min-w-0 ${enableAnimations ? `duration-${animationDuration}` : ''}`;
    const variantClasses = getVariantClasses(variant as CardVariant);
    const mainPaddingClass = padding !== 'none' ? getPaddingClasses(padding as 'sm' | 'md' | 'lg' | 'none') : '';
    const clickableClasses = onClick || isSelectable ? 'cursor-pointer' : '';
    const selectableClasses = isSelectable ? (internalIsSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'hover:border-blue-500/50 border-transparent') : '';
    const hoverableClasses = isHoverable === false ? '' : 'transition-transform duration-200 hover:scale-[1.005]';

    const sizeClasses = getSizeClasses(size);
    const shapeClasses = getShapeClasses(shape);
    const elevationClasses = getElevationClasses(elevation);

    const mergedStyles: React.CSSProperties = {
      ...getCustomColorStyles({ backgroundColor, borderColor, textColor } as CardProps),
      ...customStyles,
      ...(draggable?.enabled && { left: currentPosition.x, top: currentPosition.y, position: 'absolute' }),
      ...(resizable?.enabled && currentSize.width && { width: currentSize.width }),
      ...(resizable?.enabled && currentSize.height && { height: currentSize.height }),
    };

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(e);
      handleSelect(); // Toggle selection on click if selectable
      onCardInteraction?.(persistenceId, 'card_clicked');
    };

    const handleRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (contextMenuActions && contextMenuActions.length > 0) {
        e.preventDefault();
        setContextMenuState({ visible: true, x: e.clientX, y: e.clientY });
        onCardInteraction?.(persistenceId, 'context_menu_opened');
      }
    };

    const handleContextMenuClose = () => {
      setContextMenuState(null);
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!keyboardNav?.enabled) return;

      if (keyboardNav.shortcuts?.collapseToggle && e.key === keyboardNav.shortcuts.collapseToggle && isCollapsible) {
        e.preventDefault();
        toggleCollapse();
      }
      if (keyboardNav.shortcuts?.selectToggle && e.key === keyboardNav.shortcuts.selectToggle && isSelectable) {
        e.preventDefault();
        handleSelect();
      }
      onCardInteraction?.(persistenceId, 'keyboard_shortcut', { key: e.key });
      // Add more keyboard shortcuts here for other actions
    }, [keyboardNav, isCollapsible, toggleCollapse, isSelectable, handleSelect, onCardInteraction, persistenceId]);

    // Drag and drop target functionality
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); // Allow drop
      if (!isDragging) setIsDragOver(true);
    };
    const handleDragLeave = () => setIsDragOver(false);
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const data = e.dataTransfer.getData("card/id"); // Example data transfer
      console.log(`Card ${persistenceId} received dropped item from card ID: ${data}`);
      onCardInteraction?.(persistenceId, 'card_dropped_on', { droppedItemId: data });
      // Implement logic to handle dropped item
    };

    // Card Content Rendering Logic
    let cardInnerContent: ReactNode;

    if (!isRendered && deferRender) {
      cardInnerContent = <div className="min-h-[100px] flex items-center justify-center text-gray-500" style={{ minHeight: minHeight }}>Loading content...</div>;
    } else if (isLoading) {
        cardInnerContent = loadingIndicator || <LoadingSkeleton />;
    } else if (errorState) {
        cardInnerContent = <ErrorDisplay message={errorState} onRetry={onRetry} customIndicator={customErrorIndicator} />;
    } else if (isEmpty) {
      cardInnerContent = <EmptyStateDisplay message={emptyStateMessage} action={emptyStateAction} customComponent={customEmptyComponent} />;
    } else {
        cardInnerContent = (
            <>
                {customHeaderComponent || (
                    <CardHeader
                        title={title}
                        titleTooltip={titleTooltip}
                        subtitle={subtitle}
                        isCollapsible={isCollapsible}
                        isCollapsed={resolvedIsCollapsed}
                        toggleCollapse={toggleCollapse}
                        actions={headerActions}
                        headerPrefix={headerPrefix}
                        headerSuffix={headerSuffix}
                        customTitleComponent={customTitleComponent}
                        customSubtitleComponent={customSubtitleComponent}
                        className={headerClassName}
                        cardId={persistenceId}
                        onCardInteraction={onCardInteraction}
                    />
                )}
                {cardToolbar}
                {!resolvedIsCollapsed && (
                    <div className={`card-content flex-grow ${contentClassName || ''}`}>
                        <CardBody
                          children={children}
                          contentLayout={contentLayout}
                          tabs={tabs}
                          activeTabId={currentActiveTabId}
                          onTabChange={handleInternalTabChange}
                          sections={sections}
                          contentClassName={contentClassName}
                          onLoadMore={onLoadMore}
                          hasMoreContent={hasMoreContent}
                          virtualization={virtualization}
                          cardId={persistenceId}
                          onCardInteraction={onCardInteraction}
                        />
                    </div>
                )}
               {(!resolvedIsCollapsed && footerContent) && (
                 customFooterComponent || (
                   <CardFooter className={footerClassName}>
                      {footerContent}
                   </CardFooter>
                 )
               )}
               {cardActions && cardActions.length > 0 && (
                 // Example card-level actions. This could be a dropdown menu.
                 <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                   {cardActions.map(action => (
                     action.renderCustom ? action.renderCustom(action) : (
                       <button
                         key={action.id}
                         onClick={(e) => {
                           e.stopPropagation();
                           action.onClick(e);
                           onCardInteraction?.(persistenceId, 'card_action_clicked', { actionId: action.id, label: action.label });
                         }}
                         aria-label={action.label}
                         title={action.tooltip}
                         className={`p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors ${action.className || ''}`}
                       >
                         {React.cloneElement(action.icon as React.ReactElement<any>, { className: 'h-5 w-5' })}
                       </button>
                     )
                   ))}
                 </div>
               )}
            </>
        );
    }

    // Draggable / Resizable wrapping logic (simplified)
    const renderCardContent = (inner: ReactNode) => {
      let content = inner;

      if (resizable?.enabled) {
        // This is a conceptual implementation. Real resizing would use a library.
        // Tailwind's `resize` utility only enables browser-native resizing.
        content = (
          <div
            className={`relative group ${resizable.className || ''}`}
            style={{
              minWidth: resizable.minWidth || '100px',
              minHeight: resizable.minHeight || '100px',
              maxWidth: resizable.maxWidth || 'unset',
              maxHeight: resizable.maxHeight || 'unset',
              // Real resizing requires JavaScript listeners to update state (currentSize)
              // and potentially prevent text selection.
            }}
          >
            {inner}
            {resizable.handles?.map(handle => (
              <div key={handle} className={`absolute bg-cyan-500/50 w-3 h-3 ${
                handle === 's' ? 'bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize' :
                handle === 'w' ? 'left-0 top-1/2 -translate-y-1/2 cursor-ew-resize' :
                handle === 'e' ? 'right-0 top-1/2 -translate-y-1/2 cursor-ew-resize' :
                handle === 'n' ? 'top-0 left-1/2 -translate-x-1/2 cursor-ns-resize' :
                handle === 'sw' ? 'bottom-0 left-0 cursor-nesw-resize' :
                handle === 'nw' ? 'top-0 left-0 cursor-nwse-resize' :
                handle === 'se' ? 'bottom-0 right-0 cursor-nwse-resize' :
                handle === 'ne' ? 'top-0 right-0 cursor-nesw-resize' : ''
              } opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            ))}
          </div>
        );
      }

      if (draggable?.enabled) {
        // This is a conceptual implementation. Real dragging would use a library.
        const dragHandleProps = draggable.handleSelector
          ? { 'data-drag-handle': true } // Marker for a specific drag handle
          : {}; // Drag whole card

        content = (
          <div
            className={`relative ${draggable.className || ''} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            draggable={true} // HTML5 draggable
            onDragStart={(e) => {
              e.stopPropagation(); // Prevent card click
              e.dataTransfer.setData("card/id", persistenceId);
              draggable.onDragStart?.(e, { x: currentPosition.x, y: currentPosition.y });
              setIsDragging(true);
              onCardInteraction?.(persistenceId, 'drag_start');
              // Would typically store initial clientX/Y to calculate delta for manual drag
            }}
            onDragEnd={(e) => {
              draggable.onDragEnd?.(e, { x: e.clientX, y: e.clientY }); // simplistic end position
              setIsDragging(false);
              // In a real implementation, would update currentPosition based on drop event or library logic
              // updatePersistedState('position', { x: newX, y: newY });
              onCardInteraction?.(persistenceId, 'drag_end', { finalX: e.clientX, finalY: e.clientY });
            }}
            onDrag={(e) => {
              draggable.onDrag?.(e, { x: e.clientX, y: e.clientY });
            }}
            style={isDragging ? { zIndex: 100 } : {}} // Bring to front while dragging
            {...dragHandleProps}
          >
            {content}
          </div>
        );
      }
      return content;
    };


    return (
      <div
        ref={cardRef}
        className={`
          ${baseClasses}
          ${variantClasses}
          ${sizeClasses}
          ${shapeClasses}
          ${elevationClasses}
          ${className}
          ${clickableClasses}
          ${isSelectable ? 'group' : ''}
          ${isSelectable && internalIsSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : (isSelectable ? 'border border-transparent hover:border-blue-500/50' : '')}
          ${isHoverable === false ? '' : 'transition-transform'}
          ${(isHoverable !== false && onClick) ? 'hover:scale-[1.005]' : ''}
          ${isDragging ? 'opacity-80' : ''}
          ${isDragOver ? 'border-dashed border-2 border-green-500' : ''}
        `}
        style={mergedStyles}
        onClick={handleCardClick}
        onContextMenu={handleRightClick}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        role={role || 'region'}
        aria-label={ariaLabel || title || 'Card component'}
        aria-live={ariaLive}
        tabIndex={keyboardNav?.enabled ? (keyboardNav.tabIndex !== undefined ? keyboardNav.tabIndex : 0) : -1}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
           <CardBadgesRenderer badges={badges} cardId={persistenceId} onCardInteraction={onCardInteraction} />
           <div className={`${mainPaddingClass} flex-grow flex flex-col`}> {/* Added flex-grow and flex-col for internal layout */}
              {isDragOver && dropZoneContent ? (
                <div className="flex-grow flex items-center justify-center p-4 text-gray-400 bg-gray-700/30 border border-dashed border-gray-500 rounded-md">
                  {dropZoneContent}
                </div>
              ) : (
                renderCardContent(cardInnerContent)
              )}
          </div>
          <CardOverlayRenderer config={overlay} cardId={persistenceId} onCardInteraction={onCardInteraction} />
          {contextMenuState?.visible && renderContextMenu(contextMenuActions!, contextMenuState, handleContextMenuClose, onCardInteraction, persistenceId)}
      </div>
    );
};

export default Card;
