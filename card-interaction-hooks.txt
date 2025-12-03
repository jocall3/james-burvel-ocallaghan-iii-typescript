// components/components/card-interaction-hooks.ts
// This file provides a suite of advanced custom React hooks designed to enhance
// the interactivity, accessibility, and state management of Card components,
// aligning with a comprehensive, production-grade architectural blueprint.

import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import {
  CardKeyboardNavConfig,
  CardDraggableConfig,
  CardResizableConfig,
  CardPersistenceConfig,
  CardContextMenuItem,
} from '../../components/Card'; // Adjust path based on actual project structure

// ================================================================================================
// TYPE DEFINITIONS FOR HOOKS - EXPANDED UNIVERSE
// ================================================================================================

/**
 * @description Represents the state of a draggable item, including its position and dragging status.
 */
interface DraggableState {
  x: number;
  y: number;
  isDragging: boolean;
}

/**
 * @description Represents the state of a resizable item, including its dimensions and resizing status.
 */
interface ResizableState {
  width: number | undefined;
  height: number | undefined;
  isResizing: boolean;
  activeHandle: 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne' | null;
}

/**
 * @description Represents the configuration for a drop target.
 */
export interface CardDropTargetConfig {
  enabled: boolean;
  acceptedDataTypes?: string[]; // e.g., ['text/plain', 'card/id']
  onDrop?: (dataTransfer: DataTransfer, event: React.DragEvent) => void;
  onDragEnter?: (event: React.DragEvent) => void;
  onDragLeave?: (event: React.DragEvent) => void;
  onDragOver?: (event: React.DragEvent) => void;
  highlightClass?: string; // Class to apply when item is dragged over
}

// ================================================================================================
// INTERNAL HELPER FUNCTIONS FOR HOOKS - EXPANDED
// ================================================================================================

/**
 * @description Calculates the new position of an element based on drag events and bounds.
 * @param {DraggableState} currentPos - The current {x, y} position.
 * @param {{clientX: number; clientY: number}} startCoords - The initial mouse/touch clientX/Y.
 * @param {{clientX: number; clientY: number}} currentCoords - The current mouse/touch clientX/Y.
 * @param {HTMLElement} element - The DOM element being dragged.
 * @param {CardDraggableConfig['bounds']} bounds - The bounding container for the drag.
 * @param {CardDraggableConfig['grid']} grid - Grid snap configuration [x, y].
 * @returns {{x: number; y: number}} The new calculated position.
 */
const calculateNewPosition = (
  currentPos: { x: number; y: number },
  startCoords: { clientX: number; clientY: number },
  currentCoords: { clientX: number; clientY: number },
  element: HTMLElement,
  bounds?: CardDraggableConfig['bounds'],
  grid?: [number, number],
  axis?: 'x' | 'y' | 'both'
): { x: number; y: number } => {
  let deltaX = currentCoords.clientX - startCoords.clientX;
  let deltaY = currentCoords.clientY - startCoords.clientY;

  let newX = currentPos.x + deltaX;
  let newY = currentPos.y + deltaY;

  // Apply grid snapping
  if (grid && grid[0] > 0) {
    newX = Math.round(newX / grid[0]) * grid[0];
  }
  if (grid && grid[1] > 0) {
    newY = Math.round(newY / grid[1]) * grid[1];
  }

  // Apply axis constraints
  if (axis === 'x') {
    newY = currentPos.y;
  } else if (axis === 'y') {
    newX = currentPos.x;
  }

  // Apply bounds
  if (bounds) {
    let parentRect: DOMRect;
    if (bounds === 'parent' && element.parentElement) {
      parentRect = element.parentElement.getBoundingClientRect();
    } else if (bounds === 'body') {
      parentRect = document.body.getBoundingClientRect();
    } else {
      const customBoundElement = document.querySelector(bounds);
      if (customBoundElement) {
        parentRect = customBoundElement.getBoundingClientRect();
      } else {
        // Fallback to body if custom selector not found
        console.warn(`[useCardDragInteraction] Custom bounds selector "${bounds}" not found. Falling back to body.`);
        parentRect = document.body.getBoundingClientRect();
      }
    }

    const elementRect = element.getBoundingClientRect();

    const minX = parentRect.left + (element.offsetLeft - elementRect.left);
    const minY = parentRect.top + (element.offsetTop - elementRect.top);
    const maxX = parentRect.right - elementRect.width + (element.offsetLeft - elementRect.left);
    const maxY = parentRect.bottom - elementRect.height + (element.offsetTop - elementRect.top);

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));
  }

  return { x: newX, y: newY };
};

/**
 * @description Calculates new dimensions for resizing based on handle, mouse movement, and constraints.
 * @param {ResizableState} currentSize - The current {width, height} dimensions.
 * @param {{width: number; height: number}} initialElementSize - The element's size at resize start.
 * @param {{clientX: number; clientY: number}} startCoords - The initial mouse/touch clientX/Y.
 * @param {{clientX: number; clientY: number}} currentCoords - The current mouse/touch clientX/Y.
 * @param {'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'} activeHandle - The active resize handle.
 * @param {CardResizableConfig} config - The resizable configuration.
 * @returns {{width: number; height: number}} The new calculated dimensions.
 */
const calculateNewSize = (
  currentSize: { width: number | undefined; height: number | undefined },
  initialElementSize: { width: number; height: number },
  startCoords: { clientX: number; clientY: number },
  currentCoords: { clientX: number; clientY: number },
  activeHandle: 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne',
  config: CardResizableConfig
): { width: number | undefined; height: number | undefined } => {
  let newWidth = initialElementSize.width;
  let newHeight = initialElementSize.height;

  const deltaX = currentCoords.clientX - startCoords.clientX;
  const deltaY = currentCoords.clientY - startCoords.clientY;

  switch (activeHandle) {
    case 'e':
    case 'se':
    case 'ne':
      newWidth = initialElementSize.width + deltaX;
      break;
    case 'w':
    case 'sw':
    case 'nw':
      newWidth = initialElementSize.width - deltaX;
      break;
  }

  switch (activeHandle) {
    case 's':
    case 'se':
    case 'sw':
      newHeight = initialElementSize.height + deltaY;
      break;
    case 'n':
    case 'nw':
    case 'ne':
      newHeight = initialElementSize.height - deltaY;
      break;
  }

  // Apply aspect ratio lock
  if (config.lockAspectRatio && initialElementSize.width > 0 && initialElementSize.height > 0) {
    const aspectRatio = initialElementSize.width / initialElementSize.height;
    if (newWidth !== initialElementSize.width && activeHandle.includes('e') || activeHandle.includes('w')) {
      newHeight = newWidth / aspectRatio;
    } else if (newHeight !== initialElementSize.height && activeHandle.includes('s') || activeHandle.includes('n')) {
      newWidth = newHeight * aspectRatio;
    }
  }

  // Apply min/max constraints
  newWidth = Math.max(config.minWidth || 50, Math.min(newWidth || Infinity, config.maxWidth || Infinity));
  newHeight = Math.max(config.minHeight || 50, Math.min(newHeight || Infinity, config.maxHeight || Infinity));

  // Apply grid snapping
  if (config.grid && config.grid[0] > 0 && newWidth !== undefined) {
    newWidth = Math.round(newWidth / config.grid[0]) * config.grid[0];
  }
  if (config.grid && config.grid[1] > 0 && newHeight !== undefined) {
    newHeight = Math.round(newHeight / config.grid[1]) * config.grid[1];
  }

  return { width: newWidth, height: newHeight };
};

// ================================================================================================
// CUSTOM REACT HOOKS FOR CARD INTERACTIONS - EXPANDED
// ================================================================================================

/**
 * @description Custom hook for managing keyboard navigation and shortcuts for a Card.
 * It provides props to be spread onto the card's root element.
 *
 * @param {CardKeyboardNavConfig | undefined} config - Configuration for keyboard navigation.
 * @param {boolean} isCollapsible - Whether the card is collapsible.
 * @param {() => void} toggleCollapse - Function to toggle card collapse state.
 * @param {boolean} isSelectable - Whether the card is selectable.
 * @param {() => void} onSelect - Function to toggle card selection state.
 * @param {React.RefObject<HTMLElement>} cardRef - Ref to the card's root DOM element.
 * @param {string} cardId - Unique identifier for the card (for analytics).
 * @param {(cardId: string, action: string, details?: any) => void} [onCardInteraction] - Optional callback for logging card interactions.
 * @returns {{
 *   tabIndex: number;
 *   onFocus: React.FocusEventHandler<HTMLElement>;
 *   onBlur: React.FocusEventHandler<HTMLElement>;
 *   onKeyDown: React.KeyboardEventHandler<HTMLElement>;
 * }} Props to be spread on the card's main div.
 */
export const useCardKeyboardNavigation = (
  config: CardKeyboardNavConfig | undefined,
  isCollapsible: boolean,
  toggleCollapse: () => void,
  isSelectable: boolean,
  onSelect: () => void,
  cardRef: React.RefObject<HTMLElement>,
  cardId: string,
  onCardInteraction?: (cardId: string, action: string, details?: any) => void
) => {
  const isNavEnabled = config?.enabled ?? false;
  const tabIndex = isNavEnabled ? (config?.tabIndex !== undefined ? config.tabIndex : 0) : -1;

  const handleFocus = useCallback((event: React.FocusEvent<HTMLElement>) => {
    config?.onFocus?.(event);
    onCardInteraction?.(cardId, 'keyboard_focus', { element: event.target.tagName });
  }, [config, cardId, onCardInteraction]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLElement>) => {
    config?.onBlur?.(event);
    onCardInteraction?.(cardId, 'keyboard_blur', { element: event.target.tagName });
  }, [config, cardId, onCardInteraction]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (!isNavEnabled) return;

    // Prevent default browser behavior for certain keys if they are shortcuts
    const preventDefaultForKeys = new Set(Object.values(config?.shortcuts || {}));
    if (preventDefaultForKeys.has(event.key)) {
      event.preventDefault();
      event.stopPropagation(); // Stop propagation to avoid interfering with parent components
    }

    if (config?.shortcuts?.collapseToggle && event.key === config.shortcuts.collapseToggle && isCollapsible) {
      toggleCollapse();
      onCardInteraction?.(cardId, 'keyboard_shortcut_collapse', { key: event.key, isCollapsed: !isCollapsible });
    }

    if (config?.shortcuts?.selectToggle && event.key === config.shortcuts.selectToggle && isSelectable) {
      onSelect();
      onCardInteraction?.(cardId, 'keyboard_shortcut_select', { key: event.key });
    }

    // Add more global card-level keyboard shortcuts here
    // Example: 'delete' key to trigger a delete action (if available)
    // if (config?.shortcuts?.deleteCard && event.key === config.shortcuts.deleteCard) {
    //   // trigger card delete logic
    //   onCardInteraction?.(cardId, 'keyboard_shortcut_delete', { key: event.key });
    // }

    // Custom keyboard handler from config
    // Note: The CardKeyboardNavConfig does not currently have a general `onKeyDown` prop,
    // but it could be added for maximum flexibility.
    // For now, we only handle specific shortcuts.

  }, [isNavEnabled, config, isCollapsible, toggleCollapse, isSelectable, onSelect, cardId, onCardInteraction]);

  return {
    tabIndex,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
  };
};

/**
 * @description Custom hook for enabling drag interaction for a Card.
 * It manages the card's position and dragging state, with optional persistence.
 *
 * @param {CardDraggableConfig | undefined} config - Configuration for draggable behavior.
 * @param {CardPersistenceConfig | undefined} persistenceConfig - Configuration for state persistence.
 * @param {(field: string, value: any) => void} updatePersistedState - Function to update persisted state.
 * @param {React.RefObject<HTMLElement>} cardRef - Ref to the card's root DOM element.
 * @param {string} cardId - Unique identifier for the card (for analytics).
 * @param {(cardId: string, action: string, details?: any) => void} [onCardInteraction] - Optional callback for logging card interactions.
 * @returns {{
 *   draggableProps: { draggable: boolean; onDragStart: React.DragEventHandler; style: React.CSSProperties; };
 *   isDragging: boolean;
 *   currentPosition: { x: number; y: number; };
 * }} Props to be spread on the draggable card element, and current state.
 */
export const useCardDragInteraction = (
  config: CardDraggableConfig | undefined,
  persistenceConfig: CardPersistenceConfig | undefined,
  updatePersistedState: (field: string, value: any) => void,
  cardRef: React.RefObject<HTMLElement>,
  cardId: string,
  onCardInteraction?: (cardId: string, action: string, details?: any) => void
) => {
  const [draggableState, setDraggableState] = useState<DraggableState>(() => ({
    x: config?.initialPosition?.x || 0,
    y: config?.initialPosition?.y || 0,
    isDragging: false,
  }));

  const dragStartCoords = useRef({ clientX: 0, clientY: 0 });
  const initialElementPosition = useRef({ x: 0, y: 0 });
  const dragHandleRef = useRef<HTMLElement | null>(null);

  // Load initial position from persistence
  useEffect(() => {
    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('position')) {
      // This assumes `updatePersistedState` can also *read* initial state.
      // In a real scenario, useCardPersistence would return `persistedState` directly.
      // For this hook, we simulate by assuming initialPosition prop comes from persistence if enabled.
      // If the Card component handles loading, this useEffect might be redundant for initial state.
      // For a self-contained hook, it would load from persistence.
      // Let's assume the `Card` component passes the resolved initial position into `config.initialPosition`.
      setDraggableState(prev => ({
        ...prev,
        x: config?.initialPosition?.x || prev.x,
        y: config?.initialPosition?.y || prev.y,
      }));
    }
  }, [config?.initialPosition, persistenceConfig?.enabled, persistenceConfig?.fields]);


  const handleDragStart = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled || !cardRef.current) return;

    // If a handleSelector is specified, only start drag if the event target is the handle or inside it.
    if (config.handleSelector) {
      const target = event.target as HTMLElement;
      const handleElement = cardRef.current.querySelector(config.handleSelector);
      if (!handleElement || !handleElement.contains(target)) {
        return; // Don't drag if click is not on the handle
      }
      dragHandleRef.current = handleElement;
    }

    event.stopPropagation(); // Prevent parent drag events
    setDraggableState(prev => ({ ...prev, isDragging: true }));

    dragStartCoords.current = { clientX: event.clientX, clientY: event.clientY };
    initialElementPosition.current = { x: draggableState.x, y: draggableState.y };

    // Set data for potential drop targets
    event.dataTransfer.setData("card/id", cardId);
    event.dataTransfer.effectAllowed = "move"; // Indicate allowed drag effect

    config.onDragStart?.(event as any, { x: draggableState.x, y: draggableState.y });
    onCardInteraction?.(cardId, 'drag_start', { initialPosition: { x: draggableState.x, y: draggableState.y } });
  }, [config, draggableState.x, draggableState.y, cardRef, cardId, onCardInteraction]);

  const handleDrag = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled || !draggableState.isDragging || !cardRef.current) return;

    // HTML5 drag event doesn't provide clientX/Y during drag, only on start/end.
    // This hook is designed to intercept native drag. For real-time position updates during drag,
    // a non-native drag system with `mousemove` listeners would be used.
    // For now, we'll just call the configured `onDrag` if it exists.
    config.onDrag?.(event as any, { x: event.clientX, y: event.clientY });

  }, [config, draggableState.isDragging, cardRef]);


  const handleDragEnd = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled || !draggableState.isDragging || !cardRef.current) return;

    event.stopPropagation();
    setDraggableState(prev => ({ ...prev, isDragging: false }));

    const newPosition = calculateNewPosition(
      initialElementPosition.current,
      dragStartCoords.current,
      { clientX: event.clientX, clientY: event.clientY },
      cardRef.current,
      config.bounds,
      config.grid,
      config.axis
    );

    setDraggableState(prev => ({ ...prev, x: newPosition.x, y: newPosition.y }));

    config.onDragEnd?.(event as any, newPosition);
    onCardInteraction?.(cardId, 'drag_end', { finalPosition: newPosition });

    // Persist new position
    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('position')) {
      updatePersistedState('position', newPosition);
    }

    dragHandleRef.current = null;
  }, [config, draggableState.isDragging, cardRef, persistenceConfig, updatePersistedState, cardId, onCardInteraction]);

  // For a more dynamic drag (without HTML5 draggable constraints),
  // one would attach mousemove/mouseup listeners to `window` in `handleDragStart`.
  // The current implementation leverages native HTML5 drag events primarily.

  // The style is returned for the consuming component to apply `transform: translate()` or `left/top`
  const draggableStyle: CSSProperties = config?.enabled
    ? {
      position: 'absolute', // Card needs to be absolutely positioned for direct x/y manipulation
      left: draggableState.x,
      top: draggableState.y,
      cursor: draggableState.isDragging ? 'grabbing' : (config.handleSelector ? 'default' : 'grab'),
      zIndex: draggableState.isDragging ? 100 : 'auto',
      touchAction: 'none', // Prevent default touch actions like scrolling
    }
    : {};

  return {
    draggableProps: config?.enabled
      ? {
        draggable: true,
        onDragStart: handleDragStart,
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        style: draggableStyle,
        className: config.className,
      }
      : {
        draggable: false,
        onDragStart: () => { },
        onDrag: () => { },
        onDragEnd: () => { },
        style: {},
        className: '',
      },
    isDragging: draggableState.isDragging,
    currentPosition: { x: draggableState.x, y: draggableState.y },
  };
};

/**
 * @description Custom hook for enabling resize interaction for a Card.
 * It manages the card's dimensions and resizing state, with optional persistence.
 *
 * @param {CardResizableConfig | undefined} config - Configuration for resizable behavior.
 * @param {CardPersistenceConfig | undefined} persistenceConfig - Configuration for state persistence.
 * @param {(field: string, value: any) => void} updatePersistedState - Function to update persisted state.
 * @param {React.RefObject<HTMLElement>} cardRef - Ref to the card's root DOM element.
 * @param {string} cardId - Unique identifier for the card (for analytics).
 * @param {(cardId: string, action: string, details?: any) => void} [onCardInteraction] - Optional callback for logging card interactions.
 * @returns {{
 *   resizableProps: { style: React.CSSProperties; };
 *   renderResizeHandles: () => React.ReactNode;
 *   isResizing: boolean;
 *   currentSize: { width: number | undefined; height: number | undefined; };
 * }} Props to be spread on the resizable card element, a function to render handles, and current state.
 */
export const useCardResizeInteraction = (
  config: CardResizableConfig | undefined,
  persistenceConfig: CardPersistenceConfig | undefined,
  updatePersistedState: (field: string, value: any) => void,
  cardRef: React.RefObject<HTMLElement>,
  cardId: string,
  onCardInteraction?: (cardId: string, action: string, details?: any) => void
) => {
  const [resizableState, setResizableState] = useState<ResizableState>(() => ({
    width: config?.minWidth || undefined,
    height: config?.minHeight || undefined,
    isResizing: false,
    activeHandle: null,
  }));

  const resizeStartCoords = useRef({ clientX: 0, clientY: 0 });
  const initialElementSize = useRef({ width: 0, height: 0 });

  // Load initial size from persistence or config
  useEffect(() => {
    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('size')) {
      // Assuming initialWidth/Height passed to Card component already reflects persistence.
      // If hook were truly standalone, it would fetch from persistence here.
      setResizableState(prev => ({
        ...prev,
        width: config?.initialWidth || prev.width,
        height: config?.initialHeight || prev.height,
      }));
    } else {
      setResizableState(prev => ({
        ...prev,
        width: config?.initialWidth || prev.width,
        height: config?.initialHeight || prev.height,
      }));
    }
  }, [config?.initialWidth, config?.initialHeight, persistenceConfig?.enabled, persistenceConfig?.fields]);

  const handleMouseDown = useCallback((
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    handle: ResizableState['activeHandle']
  ) => {
    if (!config?.enabled || !cardRef.current || !handle) return;

    event.stopPropagation();
    event.preventDefault(); // Prevent text selection etc. during resize

    setResizableState(prev => ({ ...prev, isResizing: true, activeHandle: handle }));

    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

    resizeStartCoords.current = { clientX, clientY };
    initialElementSize.current = {
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
    };

    config.onResizeStart?.(event as any, {
      width: initialElementSize.current.width,
      height: initialElementSize.current.height,
    });
    onCardInteraction?.(cardId, 'resize_start', { handle, initialSize: initialElementSize.current });

    if (config.enableUserSelectHack) {
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
    }
  }, [config, cardRef, cardId, onCardInteraction]);

  const handleMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!resizableState.isResizing || !cardRef.current || !resizableState.activeHandle) return;

    const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
    const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

    const newSize = calculateNewSize(
      resizableState,
      initialElementSize.current,
      resizeStartCoords.current,
      { clientX, clientY },
      resizableState.activeHandle,
      config!
    );

    setResizableState(prev => ({ ...prev, ...newSize }));
    config?.onResize?.(event as any, newSize); // Pass latest size
    onCardInteraction?.(cardId, 'resize_dragging', { handle: resizableState.activeHandle, currentSize: newSize });

  }, [resizableState, cardRef, config, cardId, onCardInteraction]);

  const handleMouseUp = useCallback((event: MouseEvent | TouchEvent) => {
    if (!resizableState.isResizing || !resizableState.activeHandle) return;

    setResizableState(prev => ({ ...prev, isResizing: false, activeHandle: null }));

    config?.onResizeEnd?.(event as any, {
      width: resizableState.width,
      height: resizableState.height,
    });
    onCardInteraction?.(cardId, 'resize_end', { finalSize: { width: resizableState.width, height: resizableState.height } });

    // Persist new size
    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('size')) {
      updatePersistedState('size', { width: resizableState.width, height: resizableState.height });
    }

    if (config?.enableUserSelectHack) {
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    }
  }, [resizableState, config, persistenceConfig, updatePersistedState, cardId, onCardInteraction]);

  useEffect(() => {
    if (resizableState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [resizableState.isResizing, handleMouseMove, handleMouseUp]);

  const resizableStyle: CSSProperties = config?.enabled
    ? {
      width: resizableState.width ? `${resizableState.width}px` : undefined,
      height: resizableState.height ? `${resizableState.height}px` : undefined,
      minWidth: config.minWidth || '50px',
      minHeight: config.minHeight || '50px',
      maxWidth: config.maxWidth ? `${config.maxWidth}px` : undefined,
      maxHeight: config.maxHeight ? `${config.maxHeight}px` : undefined,
      overflow: 'hidden', // Prevent content overflow during resize
      userSelect: resizableState.isResizing && config.enableUserSelectHack ? 'none' : 'auto',
    }
    : {};

  const renderResizeHandles = useCallback(() => {
    if (!config?.enabled || !config.handles) return null;

    const handleClasses = (handle: ResizableState['activeHandle']) => `absolute bg-cyan-500/50 hover:bg-cyan-400 w-3 h-3 group-hover:opacity-100 transition-opacity z-50 ${
      resizableState.isResizing && resizableState.activeHandle === handle ? 'opacity-100' : 'opacity-0'
    }`;
    const handlePositions: { [key in ResizableState['activeHandle']]: string } = {
      's': 'bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize',
      'w': 'left-0 top-1/2 -translate-y-1/2 cursor-ew-resize',
      'e': 'right-0 top-1/2 -translate-y-1/2 cursor-ew-resize',
      'n': 'top-0 left-1/2 -translate-x-1/2 cursor-ns-resize',
      'sw': 'bottom-0 left-0 cursor-nesw-resize',
      'nw': 'top-0 left-0 cursor-nwse-resize',
      'se': 'bottom-0 right-0 cursor-nwse-resize',
      'ne': 'top-0 right-0 cursor-nesw-resize',
      null: ''
    };

    return (
      <>
        {config.handles.map(handle => (
          <div
            key={handle}
            className={`${handleClasses(handle)} ${handlePositions[handle]}`}
            onMouseDown={(e) => handleMouseDown(e, handle)}
            onTouchStart={(e) => handleMouseDown(e, handle)}
            aria-label={`Resize handle ${handle}`}
            role="separator" // ARIA role for resizable elements
          />
        ))}
      </>
    );
  }, [config, resizableState.isResizing, resizableState.activeHandle, handleMouseDown]);

  return {
    resizableProps: {
      style: resizableStyle,
      className: config?.className,
    },
    renderResizeHandles,
    isResizing: resizableState.isResizing,
    currentSize: { width: resizableState.width, height: resizableState.height },
  };
};


/**
 * @description Custom hook for making a Card a drop target for drag-and-drop operations.
 * It manages the visual feedback when an item is dragged over the card.
 *
 * @param {string} cardId - Unique identifier for the card.
 * @param {CardDropTargetConfig | undefined} config - Configuration for the drop target.
 * @param {(dataTransfer: DataTransfer, event: React.DragEvent) => void} [onDropHandler] - Optional callback for when an item is dropped.
 * @param {(cardId: string, action: string, details?: any) => void} [onCardInteraction] - Optional callback for logging card interactions.
 * @returns {{
 *   dropTargetProps: {
 *     onDragOver: React.DragEventHandler;
 *     onDragLeave: React.DragEventHandler;
 *     onDrop: React.DragEventHandler;
 *     onDragEnter: React.DragEventHandler;
 *   };
 *   isDragOver: boolean;
 * }} Props to be spread on the drop target element, and current state.
 */
export const useCardDropTarget = (
  cardId: string,
  config: CardDropTargetConfig | undefined,
  onDropHandler?: (droppedItemId: string, event: React.DragEvent) => void,
  onCardInteraction?: (cardId: string, action: string, details?: any) => void
) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled) return;
    event.preventDefault();
    event.stopPropagation(); // Prevents propagation to parent drop targets

    // Check if any accepted data type is present
    const hasAcceptedType = config.acceptedDataTypes?.some(type => event.dataTransfer.types.includes(type));
    if (!config.acceptedDataTypes || hasAcceptedType) {
      setIsDragOver(true);
      config.onDragEnter?.(event);
      onCardInteraction?.(cardId, 'drag_enter', { types: event.dataTransfer.types });
    }
  }, [config, cardId, onCardInteraction]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled) return;
    event.preventDefault(); // This is crucial to allow a drop
    event.stopPropagation();

    // Set allowed drop effect
    event.dataTransfer.dropEffect = "move"; // or "copy", "link"
    config.onDragOver?.(event);
  }, [config]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled) return;
    event.stopPropagation();

    // Ensure the event target is still the card or one of its children
    // to prevent flickering when moving over child elements.
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
      setIsDragOver(false);
      config.onDragLeave?.(event);
      onCardInteraction?.(cardId, 'drag_leave');
    }
  }, [config, cardId, onCardInteraction]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled) return;
    event.preventDefault();
    event.stopPropagation();

    setIsDragOver(false); // Reset drag over state

    const droppedDataId = event.dataTransfer.getData("card/id"); // Example data type
    const hasAcceptedType = config.acceptedDataTypes?.some(type => event.dataTransfer.types.includes(type));

    if ((!config.acceptedDataTypes || hasAcceptedType) && droppedDataId) {
      config.onDrop?.(event.dataTransfer, event);
      onDropHandler?.(droppedDataId, event); // Use general onDropHandler if provided
      onCardInteraction?.(cardId, 'card_dropped_on', {
        droppedItemId: droppedDataId,
        dataTransferTypes: event.dataTransfer.types,
      });
    } else {
      onCardInteraction?.(cardId, 'drop_ignored', {
        reason: 'no_accepted_type_or_data',
        dataTransferTypes: event.dataTransfer.types,
      });
    }
  }, [config, onDropHandler, cardId, onCardInteraction]);

  const dropTargetProps = config?.enabled
    ? {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onDragEnter: handleDragEnter,
      className: isDragOver ? (config.highlightClass || 'bg-blue-800/20 border-blue-500/50') : '',
    }
    : {
      onDragOver: () => { },
      onDragLeave: () => { },
      onDrop: () => { },
      onDragEnter: () => { },
      className: '',
    };

  return {
    dropTargetProps,
    isDragOver,
  };
};

/**
 * @description Provides a comprehensive set of interaction props and states for a Card,
 * consolidating multiple specialized hooks. This is useful for passing all interaction
 * capabilities to a single component efficiently.
 *
 * This hook acts as a central aggregator for card-specific interaction behaviors,
 * simplifying the consuming component's code.
 *
 * @param {object} params - Parameters for configuring all interactions.
 * @param {string} params.cardId - Unique identifier for the card.
 * @param {React.RefObject<HTMLElement>} params.cardRef - Ref to the card's root DOM element.
 * @param {CardKeyboardNavConfig | undefined} params.keyboardNavConfig - Config for keyboard navigation.
 * @param {boolean} params.isCollapsible - Whether the card is collapsible.
 * @param {() => void} params.toggleCollapse - Function to toggle card collapse state.
 * @param {boolean} params.isSelectable - Whether the card is selectable.
 * @param {() => void} params.onSelect - Function to toggle card selection state.
 * @param {CardDraggableConfig | undefined} params.draggableConfig - Config for draggable behavior.
 * @param {CardResizableConfig | undefined} params.resizableConfig - Config for resizable behavior.
 * @param {CardDropTargetConfig | undefined} params.dropTargetConfig - Config for drop target behavior.
 * @param {CardPersistenceConfig | undefined} params.persistenceConfig - Config for state persistence.
 * @param {(field: string, value: any) => void} params.updatePersistedState - Function to update persisted state.
 * @param {React.DragEventHandler<HTMLElement>} [params.onDropHandler] - General drop handler for the card.
 * @param {(cardId: string, action: string, details?: any) => void} [params.onCardInteraction] - Optional callback for logging card interactions.
 * @returns {{
 *   interactionProps: {
 *     tabIndex: number;
 *     onFocus: React.FocusEventHandler<HTMLElement>;
 *     onBlur: React.FocusEventHandler<HTMLElement>;
 *     onKeyDown: React.KeyboardEventHandler<HTMLElement>;
 *     draggable: boolean;
 *     onDragStart: React.DragEventHandler;
 *     onDrag: React.DragEventHandler;
 *     onDragEnd: React.DragEventHandler;
 *     onDragOver: React.DragEventHandler;
 *     onDragLeave: React.DragEventHandler;
 *     onDrop: React.DragEventHandler;
 *     onDragEnter: React.DragEventHandler;
 *     style: React.CSSProperties; // Merged styles for drag and resize
 *     className: string; // Merged classes for drag and drop highlighting
 *   };
 *   interactionStates: {
 *     isDragging: boolean;
 *     isResizing: boolean;
 *     isDragOver: boolean;
 *     currentPosition: { x: number; y: number; };
 *     currentSize: { width: number | undefined; height: number | undefined; };
 *   };
 *   renderResizeHandles: () => React.ReactNode;
 * }} Consolidated props, states, and render functions for card interactions.
 */
export const useCardInteractions = ({
  cardId,
  cardRef,
  keyboardNavConfig,
  isCollapsible,
  toggleCollapse,
  isSelectable,
  onSelect,
  draggableConfig,
  resizableConfig,
  dropTargetConfig,
  persistenceConfig,
  updatePersistedState,
  onDropHandler,
  onCardInteraction,
}: {
  cardId: string;
  cardRef: React.RefObject<HTMLElement>;
  keyboardNavConfig?: CardKeyboardNavConfig;
  isCollapsible: boolean;
  toggleCollapse: () => void;
  isSelectable: boolean;
  onSelect: () => void;
  draggableConfig?: CardDraggableConfig;
  resizableConfig?: CardResizableConfig;
  dropTargetConfig?: CardDropTargetConfig;
  persistenceConfig?: CardPersistenceConfig;
  updatePersistedState: (field: string, value: any) => void;
  onDropHandler?: (droppedItemId: string, event: React.DragEvent) => void;
  onCardInteraction?: (cardId: string, action: string, details?: any) => void;
}) => {
  const { tabIndex, onFocus, onBlur, onKeyDown } = useCardKeyboardNavigation(
    keyboardNavConfig,
    isCollapsible,
    toggleCollapse,
    isSelectable,
    onSelect,
    cardRef,
    cardId,
    onCardInteraction
  );

  const { draggableProps, isDragging, currentPosition } = useCardDragInteraction(
    draggableConfig,
    persistenceConfig,
    updatePersistedState,
    cardRef,
    cardId,
    onCardInteraction
  );

  const { resizableProps, renderResizeHandles, isResizing, currentSize } = useCardResizeInteraction(
    resizableConfig,
    persistenceConfig,
    updatePersistedState,
    cardRef,
    cardId,
    onCardInteraction
  );

  const { dropTargetProps, isDragOver } = useCardDropTarget(
    cardId,
    dropTargetConfig,
    onDropHandler,
    onCardInteraction
  );

  // Merge styles and class names from different interaction hooks
  const mergedStyle: CSSProperties = {
    ...draggableProps.style,
    ...resizableProps.style,
  };

  const mergedClassName = [
    draggableProps.className,
    resizableProps.className,
    dropTargetProps.className,
    // Add any other interaction-specific classes here
  ].filter(Boolean).join(' ');

  return {
    interactionProps: {
      tabIndex,
      onFocus,
      onBlur,
      onKeyDown,
      draggable: draggableProps.draggable,
      onDragStart: draggableProps.onDragStart,
      onDrag: draggableProps.onDrag,
      onDragEnd: draggableProps.onDragEnd,
      onDragOver: dropTargetProps.onDragOver,
      onDragLeave: dropTargetProps.onDragLeave,
      onDrop: dropTargetProps.onDrop,
      onDragEnter: dropTargetProps.onDragEnter,
      style: mergedStyle,
      className: mergedClassName,
    },
    interactionStates: {
      isDragging,
      isResizing,
      isDragOver,
      currentPosition,
      currentSize,
    },
    renderResizeHandles,
  };
};

// ================================================================================================
// END OF HOOKS FILE
// ================================================================================================