```typescript
/**
 * This module provides a suite of advanced custom React hooks designed to enhance
 * the interactivity, accessibility, and state management of Card components.
 * It encapsulates complex UI logic, offering a robust, performant, and extensible
 * foundation for dynamic user interfaces.
 *
 * Business value: These hooks significantly accelerate development cycles for interactive
 * dashboards and configurable workspaces by abstracting common UI patterns like
 * drag-and-drop, resizing, keyboard navigation, and context menus. This reduces
 * engineering overhead, improves UI consistency, and enables rapid prototyping
 * of sophisticated user experiences. The built-in state persistence and logging
 * capabilities ensure a commercial-grade implementation, supporting audit trails
 * and user preference management, which translates to superior user engagement
 * and operational efficiency worth millions in developer time and user satisfaction.
 */
import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import {
  CardKeyboardNavConfig,
  CardDraggableConfig,
  CardResizableConfig,
  CardPersistenceConfig,
  CardContextMenuItem,
} from '../../components/Card'; // Adjust path based on actual project structure

/**
 * Represents the state of a draggable item, including its position and dragging status.
 */
interface DraggableState {
  x: number;
  y: number;
  isDragging: boolean;
}

/**
 * Represents the state of a resizable item, including its dimensions and resizing status.
 */
interface ResizableState {
  width: number | undefined;
  height: number | undefined;
  isResizing: boolean;
  activeHandle: 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne' | null;
}

/**
 * Represents the configuration for a drop target.
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

/**
 * Represents the configuration for a context menu.
 */
export interface CardContextMenuConfig {
  enabled: boolean;
  items: CardContextMenuItem[];
  onOpen?: (event: React.MouseEvent) => void;
  onClose?: () => void;
  onMenuItemClick?: (item: CardContextMenuItem, event: React.MouseEvent) => void;
}

/**
 * Represents the state of a context menu, including its visibility and position.
 */
export interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: CardContextMenuItem[];
}

/**
 * Calculates the new position of an element based on drag events and bounds.
 *
 * @param {DraggableState} currentPos - The current {x, y} position.
 * @param {{clientX: number; clientY: number}} startCoords - The initial mouse/touch clientX/Y.
 * @param {{clientX: number; clientY: number}} currentCoords - The current mouse/touch clientX/Y.
 * @param {HTMLElement} element - The DOM element being dragged.
 * @param {CardDraggableConfig['bounds']} bounds - The bounding container for the drag.
 * @param {CardDraggableConfig['grid']} grid - Grid snap configuration [x, y].
 * @param {'x' | 'y' | 'both'} axis - Axis constraint for dragging.
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

  if (grid && grid[0] > 0) {
    newX = Math.round(newX / grid[0]) * grid[0];
  }
  if (grid && grid[1] > 0) {
    newY = Math.round(newY / grid[1]) * grid[1];
  }

  if (axis === 'x') {
    newY = currentPos.y;
  } else if (axis === 'y') {
    newX = currentPos.x;
  }

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
 * Calculates new dimensions for resizing based on handle, mouse movement, and constraints.
 *
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

  if (config.lockAspectRatio && initialElementSize.width > 0 && initialElementSize.height > 0) {
    const aspectRatio = initialElementSize.width / initialElementSize.height;
    if ((newWidth !== initialElementSize.width && (activeHandle.includes('e') || activeHandle.includes('w'))) && newWidth !== undefined) {
      newHeight = newWidth / aspectRatio;
    } else if ((newHeight !== initialElementSize.height && (activeHandle.includes('s') || activeHandle.includes('n'))) && newHeight !== undefined) {
      newWidth = newHeight * aspectRatio;
    }
  }

  newWidth = Math.max(config.minWidth || 50, Math.min(newWidth || Infinity, config.maxWidth || Infinity));
  newHeight = Math.max(config.minHeight || 50, Math.min(newHeight || Infinity, config.maxHeight || Infinity));

  if (config.grid && config.grid[0] > 0 && newWidth !== undefined) {
    newWidth = Math.round(newWidth / config.grid[0]) * config.grid[0];
  }
  if (config.grid && config.grid[1] > 0 && newHeight !== undefined) {
    newHeight = Math.round(newHeight / config.grid[1]) * config.grid[1];
  }

  return { width: newWidth, height: newHeight };
};

/**
 * Custom hook for managing keyboard navigation and shortcuts for a Card.
 * It provides props to be spread onto the card's root element, enhancing accessibility
 * and user efficiency through keyboard-driven interactions.
 *
 * Business value: Improves user experience and accessibility, which is crucial for
 * enterprise applications where keyboard navigation is a key requirement for power users
 * and compliance with accessibility standards (e.g., WCAG). This leads to broader
 * adoption and higher productivity for users managing complex data interfaces.
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

    const preventDefaultForKeys = new Set(Object.values(config?.shortcuts || {}));
    if (preventDefaultForKeys.has(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (config?.shortcuts?.collapseToggle && event.key === config.shortcuts.collapseToggle && isCollapsible) {
      toggleCollapse();
      onCardInteraction?.(cardId, 'keyboard_shortcut_collapse', { key: event.key, isCollapsed: !isCollapsible });
    }

    if (config?.shortcuts?.selectToggle && event.key === config.shortcuts.selectToggle && isSelectable) {
      onSelect();
      onCardInteraction?.(cardId, 'keyboard_shortcut_select', { key: event.key });
    }

  }, [isNavEnabled, config, isCollapsible, toggleCollapse, isSelectable, onSelect, cardId, onCardInteraction]);

  return {
    tabIndex,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
  };
};

/**
 * Custom hook for enabling drag interaction for a Card.
 * It manages the card's position and dragging state, with optional persistence,
 * allowing users to freely arrange content within dashboards or workspaces.
 *
 * Business value: Enables highly customizable and dynamic user interfaces,
 * essential for agentic AI dashboards, workflow orchestration UIs, and data visualization.
 * This flexibility enhances user productivity and satisfaction, allowing configuration
 * of individual workspaces, which directly supports complex operational tasks and
 * reduces cognitive load.
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

  useEffect(() => {
    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('position')) {
      setDraggableState(prev => ({
        ...prev,
        x: config?.initialPosition?.x || prev.x,
        y: config?.initialPosition?.y || prev.y,
      }));
    }
  }, [config?.initialPosition, persistenceConfig?.enabled, persistenceConfig?.fields]);


  const handleDragStart = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled || !cardRef.current) return;

    if (config.handleSelector) {
      const target = event.target as HTMLElement;
      const handleElement = cardRef.current.querySelector(config.handleSelector);
      if (!handleElement || !handleElement.contains(target)) {
        return;
      }
      dragHandleRef.current = handleElement;
    }

    event.stopPropagation();
    setDraggableState(prev => ({ ...prev, isDragging: true }));

    dragStartCoords.current = { clientX: event.clientX, clientY: event.clientY };
    initialElementPosition.current = { x: draggableState.x, y: draggableState.y };

    event.dataTransfer.setData("card/id", cardId);
    event.dataTransfer.effectAllowed = "move";

    config.onDragStart?.(event as any, { x: draggableState.x, y: draggableState.y });
    onCardInteraction?.(cardId, 'drag_start', { initialPosition: { x: draggableState.x, y: draggableState.y } });
  }, [config, draggableState.x, draggableState.y, cardRef, cardId, onCardInteraction]);

  const handleDrag = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled || !draggableState.isDragging || !cardRef.current) return;

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

    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('position')) {
      updatePersistedState('position', newPosition);
    }

    dragHandleRef.current = null;
  }, [config, draggableState.isDragging, cardRef, persistenceConfig, updatePersistedState, cardId, onCardInteraction]);

  const draggableStyle: CSSProperties = config?.enabled
    ? {
      position: 'absolute',
      left: draggableState.x,
      top: draggableState.y,
      cursor: draggableState.isDragging ? 'grabbing' : (config.handleSelector ? 'default' : 'grab'),
      zIndex: draggableState.isDragging ? 100 : 'auto',
      touchAction: 'none',
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
 * Custom hook for enabling resize interaction for a Card.
 * It manages the card's dimensions and resizing state, with optional persistence,
 * providing responsive layout capabilities for dynamic content.
 *
 * Business value: Essential for building flexible, user-configurable dashboards and
 * analytical workspaces where users need to adjust the size of information panels
 * dynamically. This feature enhances data visibility and user control, improving
 * the utility of complex monitoring and orchestration interfaces for agentic systems,
 * directly contributing to operational efficiency and user satisfaction.
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

  useEffect(() => {
    if (persistenceConfig?.enabled && persistenceConfig.fields?.includes('size')) {
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
    event.preventDefault();

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
    config?.onResize?.(event as any, newSize);
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
      overflow: 'hidden',
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
            role="separator"
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
 * Custom hook for making a Card a drop target for drag-and-drop operations.
 * It manages the visual feedback when an item is dragged over the card,
 * and handles the logic for processing dropped items.
 *
 * Business value: Essential for creating interactive data entry points,
 * organizing agent tasks, or categorizing financial transactions via drag-and-drop.
 * This simplifies complex operations, improves intuitive interaction, and provides
 * a visual metaphor for data flow and system configuration, crucial for
 * real-time payment orchestration and identity management systems.
 *
 * @param {string} cardId - Unique identifier for the card.
 * @param {CardDropTargetConfig | undefined} config - Configuration for the drop target.
 * @param {(droppedItemId: string, event: React.DragEvent) => void} [onDropHandler] - Optional callback for when an item is dropped.
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
    event.stopPropagation();

    const hasAcceptedType = config.acceptedDataTypes?.some(type => event.dataTransfer.types.includes(type));
    if (!config.acceptedDataTypes || hasAcceptedType) {
      setIsDragOver(true);
      config.onDragEnter?.(event);
      onCardInteraction?.(cardId, 'drag_enter', { types: event.dataTransfer.types });
    }
  }, [config, cardId, onCardInteraction]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled) return;
    event.preventDefault();
    event.stopPropagation();

    event.dataTransfer.dropEffect = "move";
    config.onDragOver?.(event);
  }, [config]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!config?.enabled) return;
    event.stopPropagation();

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

    setIsDragOver(false);

    const droppedDataId = event.dataTransfer.getData("card/id");
    const hasAcceptedType = config.acceptedDataTypes?.some(type => event.dataTransfer.types.includes(type));

    if ((!config.acceptedDataTypes || hasAcceptedType) && droppedDataId) {
      config.onDrop?.(event.dataTransfer, event);
      onDropHandler?.(droppedDataId, event);
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
 * Custom hook for managing context menus on a Card.
 * It handles displaying and positioning the menu, and triggering item actions.
 *
 * Business value: Provides advanced interactive capabilities, allowing users to
 * access context-sensitive actions for cards, critical for managing complex objects
 * like agent configurations, token transactions, or identity profiles. This streamlines
 * workflows and reduces clutter, enabling a more powerful and efficient user interface.
 *
 * @param {string} cardId - Unique identifier for the card.
 * @param {CardContextMenuConfig | undefined} config - Configuration for the context menu.
 * @param {(cardId: string, action: string, details?: any) => void} [onCardInteraction] - Optional callback for logging card interactions.
 * @returns {{
 *   contextMenuProps: { onContextMenu: React.MouseEventHandler<HTMLElement>; };
 *   contextMenuState: ContextMenuState;
 *   closeContextMenu: () => void;
 *   handleMenuItemClick: (item: CardContextMenuItem, event: React.MouseEvent) => void;
 * }} Props for the card element, current menu state, and control functions.
 */
export const useCardContextMenu = (
  cardId: string,
  config: CardContextMenuConfig | undefined,
  onCardInteraction?: (cardId: string, action: string, details?: any) => void
) => {
  const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    items: [],
  });

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (!config?.enabled) return;

    event.preventDefault();
    event.stopPropagation();

    setContextMenuState({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      items: config.items,
    });
    config.onOpen?.(event);
    onCardInteraction?.(cardId, 'context_menu_open', { x: event.clientX, y: event.clientY });
  }, [config, cardId, onCardInteraction]);

  const closeContextMenu = useCallback(() => {
    if (contextMenuState.visible) {
      setContextMenuState(prev => ({ ...prev, visible: false }));
      config?.onClose?.();
      onCardInteraction?.(cardId, 'context_menu_close');
    }
  }, [contextMenuState.visible, config, cardId, onCardInteraction]);

  const handleMenuItemClick = useCallback((item: CardContextMenuItem, event: React.MouseEvent) => {
    config?.onMenuItemClick?.(item, event);
    onCardInteraction?.(cardId, 'context_menu_item_click', { itemId: item.id, label: item.label });
    closeContextMenu();
  }, [config, cardId, onCardInteraction, closeContextMenu]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuState.visible) {
        closeContextMenu();
      }
    };

    if (contextMenuState.visible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside); // Also close if another context menu opens
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenuState.visible, closeContextMenu]);

  const contextMenuProps = config?.enabled
    ? {
      onContextMenu: handleContextMenu,
    }
    : {
      onContextMenu: () => { },
    };

  return {
    contextMenuProps,
    contextMenuState,
    closeContextMenu,
    handleMenuItemClick,
  };
};

/**
 * Provides a comprehensive set of interaction props and states for a Card,
 * consolidating multiple specialized hooks. This is useful for passing all interaction
 * capabilities to a single component efficiently.
 *
 * This hook acts as a central aggregator for card-specific interaction behaviors,
 * simplifying the consuming component's code while providing a full suite of
 * production-ready UI features.
 *
 * Business value: This aggregated hook represents a significant engineering efficiency gain,
 * consolidating multiple UI interaction patterns into a single, clean API. It reduces
 * boilerplate code, ensures consistent behavior across interactive components, and
 * simplifies the management of complex state interactions, directly contributing
 * to faster feature development and higher code quality. This foundational utility
 * streamlines the creation of sophisticated UIs required for agentic systems,
 * token rails, and payment orchestration, enhancing developer velocity for features
 * that deliver millions in business value.
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
 * @param {CardContextMenuConfig | undefined} params.contextMenuConfig - Config for context menu behavior.
 * @param {CardPersistenceConfig | undefined} params.persistenceConfig - Config for state persistence.
 * @param {(field: string, value: any) => void} params.updatePersistedState - Function to update persisted state.
 * @param {(droppedItemId: string, event: React.DragEvent) => void} [params.onDropHandler] - General drop handler for the card.
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
 *     onContextMenu: React.MouseEventHandler<HTMLElement>;
 *     style: React.CSSProperties;
 *     className: string;
 *   };
 *   interactionStates: {
 *     isDragging: boolean;
 *     isResizing: boolean;
 *     isDragOver: boolean;
 *     isContextMenuVisible: boolean;
 *     currentPosition: { x: number; y: number; };
 *     currentSize: { width: number | undefined; height: number | undefined; };
 *     contextMenu: ContextMenuState;
 *   };
 *   renderResizeHandles: () => React.ReactNode;
 *   closeContextMenu: () => void;
 *   handleContextMenuItemClick: (item: CardContextMenuItem, event: React.MouseEvent) => void;
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
  contextMenuConfig,
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
  contextMenuConfig?: CardContextMenuConfig;
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

  const {
    contextMenuProps,
    contextMenuState,
    closeContextMenu,
    handleMenuItemClick: handleContextMenuItemClick,
  } = useCardContextMenu(
    cardId,
    contextMenuConfig,
    onCardInteraction
  );

  const mergedStyle: CSSProperties = {
    ...draggableProps.style,
    ...resizableProps.style,
  };

  const mergedClassName = [
    draggableProps.className,
    resizableProps.className,
    dropTargetProps.className,
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
      onContextMenu: contextMenuProps.onContextMenu,
      style: mergedStyle,
      className: mergedClassName,
    },
    interactionStates: {
      isDragging,
      isResizing,
      isDragOver,
      isContextMenuVisible: contextMenuState.visible,
      currentPosition,
      currentSize,
      contextMenu: contextMenuState,
    },
    renderResizeHandles,
    closeContextMenu,
    handleContextMenuItemClick,
  };
};
```