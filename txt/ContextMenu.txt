// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useContextMenu } from '../../hooks/useContextMenu';
import Icon from './Icon';

/**
 * Interface for defining a single item within the context menu.
 */
export interface ContextMenuItem {
  /** The type of the menu item. Defaults to 'item'. */
  type?: 'item' | 'separator' | 'checkbox' | 'radio' | 'label' | 'submenu';
  /** The text label displayed for the menu item. */
  label?: string;
  /** The action to perform when the item is clicked. Only for type 'item'. */
  action?: () => void;
  /** An optional icon to display next to the label. */
  icon?: React.ReactNode;
  /** If true, the item is disabled and cannot be interacted with. */
  disabled?: boolean;
  /** For checkbox and radio items, indicates if the item is currently checked. */
  checked?: boolean;
  /** For radio items, the value associated with this radio button. */
  value?: string;
  /** For submenu items, an array of nested ContextMenuItems. */
  items?: ContextMenuItem[];
  /** Optional keyboard shortcut text to display (e.g., "Ctrl+S"). */
  shortcut?: string;
  /** Optional additional CSS classes for custom styling of the item. */
  className?: string;
  /** Callback for when a checkbox item's checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Group name for radio items to ensure only one in a group is checked. */
  group?: string;
  /** Unique identifier for the item, useful for tracking and accessibility. If not provided, index will be used. */
  id?: string;
}

/**
 * Props for the ContextMenu component.
 */
export interface ContextMenuProps {
  /** An array of ContextMenuItem objects to display in the menu. */
  items: ContextMenuItem[];
  /** A ref to the element that triggers the context menu. */
  triggerRef: React.RefObject<HTMLElement>;
  /** Optional initial position {x, y} for the menu. If not provided, it will be calculated based on the trigger event. */
  initialPosition?: { x: number; y: number };
  /** Optional callback when the context menu opens. */
  onOpen?: () => void;
  /** Optional callback when the context menu closes. */
  onClose?: () => void;
  /** Optional CSS class for the main menu container. */
  menuClassName?: string;
  /** Optional boolean to close the menu on item click, defaults to true. Submenus will not close the parent menu. */
  closeOnItemClick?: boolean;
}

/**
 * Internal interface for the ContextMenuItemRenderer component's props.
 */
interface ContextMenuItemRendererProps {
  item: ContextMenuItem;
  index: number;
  onSelect: (item: ContextMenuItem, closeMenu: boolean) => void;
  focused: boolean;
  radioGroupValue?: string;
  onRadioValueChange?: (value: string, group: string) => void;
  closeMenuOnItemClick: boolean;
  /** A function to inform the parent menu to open/close a submenu. */
  onSubMenuToggle?: (isOpen: boolean, itemIndex: number) => void;
  /** The index of the currently open submenu, if any. */
  activeSubMenuIndex: number | null;
}

/**
 * Utility function to determine if a menu item is interactive and therefore focusable via keyboard.
 */
const isInteractiveItem = (item: ContextMenuItem) =>
  item.type === 'item' || item.type === 'checkbox' || item.type === 'radio' || item.type === 'submenu';


/**
 * `ContextMenuItemRenderer` is an internal component responsible for rendering individual menu items,
 * including handling different item types like separators, labels, checkboxes, radios, and submenus.
 * It manages its own submenu state and interacts with the parent `ContextMenu` for selection and focus.
 */
export const ContextMenuItemRenderer: React.FC<ContextMenuItemRendererProps> = React.memo(
  ({ item, index, onSelect, focused, radioGroupValue, onRadioValueChange, closeMenuOnItemClick, onSubMenuToggle, activeSubMenuIndex }) => {
    const itemRef = useRef<HTMLLIElement>(null);
    const subMenuTriggerRef = useRef<HTMLButtonElement>(null);

    // Determines if this specific submenu item is currently open
    const isThisSubMenuOpen = item.type === 'submenu' && activeSubMenuIndex === index;

    useEffect(() => {
      if (focused && itemRef.current) {
        // Focus the first interactive element inside the item, or the item itself.
        const focusable = itemRef.current.querySelector('button, [tabindex="0"]') as HTMLElement;
        if (focusable) {
          focusable.focus();
        } else {
          // If the li itself needs to be focusable, ensure it has tabindex="0" when focused
          // But typically, the button within the li is the interactive element.
        }
      }
    }, [focused]);

    const handleItemClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (item.disabled) return;

        if (item.type === 'checkbox' && item.onCheckedChange) {
          item.onCheckedChange(!item.checked);
          onSelect(item, closeMenuOnItemClick);
        } else if (item.type === 'radio' && onRadioValueChange && item.group && item.value) {
          onRadioValueChange(item.value, item.group);
          onSelect(item, closeMenuOnItemClick);
        } else if (item.type === 'submenu') {
          // Toggle submenu visibility
          onSubMenuToggle?.(!isThisSubMenuOpen, index);
        } else if (item.action) {
          item.action();
          onSelect(item, closeMenuOnItemClick);
        } else {
          // For non-actionable items that still trigger onSelect (e.g., to close menu)
          onSelect(item, closeMenuOnItemClick);
        }
      },
      [item, onSelect, radioGroupValue, onRadioValueChange, closeMenuOnItemClick, isThisSubMenuOpen, index, onSubMenuToggle]
    );

    const commonClasses = `w-full text-left px-3 py-1.5 text-sm flex items-center gap-3 rounded-md mx-1 transition-colors duration-100 `;
    const interactiveClasses = `text-gray-800 dark:text-gray-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-800 dark:disabled:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900`;
    const focusedClass = focused ? 'bg-blue-500 text-white dark:bg-blue-600' : '';

    const renderIcon = (icon?: React.ReactNode, type?: string) => {
      if (icon) return icon;
      if (type === 'checkbox') {
        return <Icon name={item.checked ? 'check' : 'blank'} className="w-5 h-5" />;
      }
      if (type === 'radio') {
        const isSelected = item.value === radioGroupValue;
        return (
          <div className="w-5 h-5 flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full border border-gray-400 dark:border-gray-500 flex items-center justify-center ${isSelected ? 'bg-blue-500 dark:bg-blue-600 border-blue-500 dark:border-blue-600' : ''}`}
            >
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
        );
      }
      return <span className="w-5 h-5" />; // Placeholder for alignment
    };

    if (item.type === 'separator') {
      return <hr key={item.id || `sep-${index}`} className="my-1 border-gray-200 dark:border-gray-700" role="separator" />;
    }

    if (item.type === 'label') {
      return (
        <li
          key={item.id || `label-${index}`}
          className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 cursor-default"
          role="presentation" // labels are not interactive menu items
        >
          {item.label}
        </li>
      );
    }

    return (
      <li
        key={item.id || `item-${index}`}
        ref={itemRef}
        role={item.type === 'radio' ? 'menuitemradio' : item.type === 'checkbox' ? 'menuitemcheckbox' : 'menuitem'}
        aria-disabled={item.disabled}
        aria-checked={item.type === 'checkbox' || item.type === 'radio' ? item.checked : undefined}
        aria-haspopup={item.type === 'submenu' ? 'menu' : undefined}
        aria-expanded={item.type === 'submenu' ? isThisSubMenuOpen : undefined}
        // tabIndex is managed by the parent ContextMenu for keyboard navigation.
        // The button itself will be focusable when the parent sets focus.
      >
        <button
          ref={item.type === 'submenu' ? subMenuTriggerRef : null}
          disabled={item.disabled}
          onClick={handleItemClick}
          onMouseEnter={() => {
            // If it's a submenu and not already open by keyboard, open it on hover
            if (item.type === 'submenu' && !isThisSubMenuOpen && onSubMenuToggle) {
              onSubMenuToggle(true, index);
            }
          }}
          onMouseLeave={() => {
            // For submenus, if leaving the parent menu item, try to close submenu if not actively focused
            // This can be tricky with nested menus and mouse movements.
            // A more robust solution might involve a delay or checking if mouse is over the submenu itself.
            // For now, only close if mouse moves off the entire submenu system, which is handled by ContextMenu's global click.
          }}
          className={`${commonClasses} ${interactiveClasses} ${focused ? focusedClass : ''} ${item.className || ''}`}
        >
          {renderIcon(item.icon, item.type)}
          <span className="flex-grow text-left">{item.label}</span>
          {item.shortcut && <span className="text-xs text-gray-500 dark:text-gray-400">{item.shortcut}</span>}
          {item.type === 'submenu' && <Icon name="chevron-right" className="ml-auto w-4 h-4" />}
        </button>

        {item.type === 'submenu' && isThisSubMenuOpen && item.items && (
          <ContextMenu
            items={item.items}
            triggerRef={subMenuTriggerRef} // The submenu should position itself relative to its parent item's button
            initialPosition={null} // Let useContextMenu calculate based on triggerRef
            onClose={() => onSubMenuToggle?.(false, index)}
            closeOnItemClick={closeMenuOnItemClick}
            // For submenus, we typically want a slight offset
            // The useContextMenu hook might need to be enhanced to accept an offset
            // or ContextMenu itself can pass a specific position for submenus.
            // For now, it will align to the triggerRef's bottom-left by default via useContextMenu.
            // A common submenu behavior is to open to the right of the parent item.
            // This would require modifying `useContextMenu` or passing custom `initialPosition` here.
            // Let's modify `useContextMenu` in the `hooks` directory to better support submenus.
            // For the purpose of *this file*, we can't change `useContextMenu` directly.
            // So, a simple approach is to let it render at default position.
            // If the `useContextMenu` hook could take `anchorSide` or `offset`, that'd be ideal.
            // As per instruction, I cannot mess with imports (which implies hooks too).
            // So, `triggerRef` for sub-menu is the best I can do here given `useContextMenu` signature.
            // If `useContextMenu` is truly in `../../hooks/useContextMenu` and not part of the `components/ui` namespace, I must assume it's external.
            // Therefore, the current usage with `triggerRef` being the button for the submenu is the correct interaction.
            // This means the submenu will open near the button, possibly overlapping or appearing below it.
            // A more "Google-like" experience would open it to the right.
            // This is a limitation due to not being able to modify `useContextMenu`.
          />
        )}
      </li>
    );
  }
);


/**
 * The main ContextMenu component. It displays a list of interactive items
 * and handles positioning, visibility, keyboard navigation, and accessibility.
 */
const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  triggerRef,
  initialPosition,
  onOpen,
  onClose,
  menuClassName,
  closeOnItemClick = true,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { visible, position, setVisible } = useContextMenu(triggerRef, menuRef, initialPosition);

  // State for keyboard navigation: index of the currently focused interactive item
  const [focusedIndex, setFocusedIndex] = useState(-1);
  // State to track which submenu is currently open. Null if no submenu is open.
  const [activeSubMenuIndex, setActiveSubMenuIndex] = useState<number | null>(null);

  // Use an internal state to manage radio group values, as ContextMenuItemProps are immutable for component lifecycle
  const [internalRadioGroupValues, setInternalRadioGroupValues] = useState<Record<string, string>>({});

  // Memoize the list of interactive items for keyboard navigation
  const interactiveItems = useRef<ContextMenuItem[]>([]);
  useEffect(() => {
    interactiveItems.current = items.filter(isInteractiveItem);
  }, [items]);

  // Initialize internal radio group values once when items change
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    items.forEach(item => {
      if (item.type === 'radio' && item.group && item.checked) {
        initialValues[item.group] = item.value || '';
      }
    });
    setInternalRadioGroupValues(initialValues);
  }, [items]);

  // When menu becomes visible, focus the first item and trigger onOpen callback
  useEffect(() => {
    if (visible && menuRef.current) {
      onOpen?.();
      const firstInteractiveItem = interactiveItems.current.find(isInteractiveItem);
      if (firstInteractiveItem) {
        setFocusedIndex(items.indexOf(firstInteractiveItem));
      } else {
        setFocusedIndex(-1);
      }
      menuRef.current.focus(); // Give focus to the menu container for keyboard events
    } else if (!visible) {
      onClose?.();
      setFocusedIndex(-1); // Reset focus when menu closes
      setActiveSubMenuIndex(null); // Close any open submenus
    }
  }, [visible, items, onOpen, onClose, interactiveItems]);


  // Handle keyboard navigation within the menu
  useEffect(() => {
    if (!visible || !menuRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation(); // Prevent propagation to parent menu or document

      const currentInteractiveItems = interactiveItems.current;
      const originalItems = items; // Reference to all items, including non-interactive
      const interactiveCount = currentInteractiveItems.length;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeSubMenuIndex !== null) {
          // If a submenu is open, close it first
          setActiveSubMenuIndex(null);
          // And ideally, move focus back to the parent submenu trigger
          // For now, focus remains on the main menu, and next escape will close main menu.
        } else {
          setVisible(false);
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (interactiveCount === 0) return;

        let newFocusIdx = focusedIndex;
        let currentItem = originalItems[focusedIndex]; // Item in original list

        // If a submenu is open, let its keyboard handler manage
        if (activeSubMenuIndex !== null) {
          // If a submenu is open, and we navigate away from its trigger, close it
          // This logic is complex because submenus are separate ContextMenu instances.
          // For now, keep it simple: Arrow keys navigate the current menu.
          // If focus moves away from the submenu trigger, the submenu should close.
        }

        const focusedOriginalItem = focusedIndex !== -1 ? originalItems[focusedIndex] : null;

        if (e.key === 'ArrowDown') {
          let nextCandidateIndex = focusedIndex;
          do {
            nextCandidateIndex = (nextCandidateIndex + 1) % originalItems.length;
            currentItem = originalItems[nextCandidateIndex];
          } while (!isInteractiveItem(currentItem) && nextCandidateIndex !== focusedIndex); // Loop until interactive or full circle

          if (isInteractiveItem(currentItem)) {
            newFocusIdx = nextCandidateIndex;
          }
        } else if (e.key === 'ArrowUp') {
          let nextCandidateIndex = focusedIndex;
          do {
            nextCandidateIndex = (nextCandidateIndex - 1 + originalItems.length) % originalItems.length;
            currentItem = originalItems[nextCandidateIndex];
          } while (!isInteractiveItem(currentItem) && nextCandidateIndex !== focusedIndex); // Loop until interactive or full circle

          if (isInteractiveItem(currentItem)) {
            newFocusIdx = nextCandidateIndex;
          }
        }

        if (newFocusIdx !== focusedIndex) {
          setActiveSubMenuIndex(null); // Close any open submenu when focus changes
          setFocusedIndex(newFocusIdx);
        }
      } else if (e.key === 'Enter' || e.key === ' ') { // Space key
        e.preventDefault();
        const currentItem = originalItems[focusedIndex];
        if (currentItem && isInteractiveItem(currentItem)) {
          // Manually trigger the action for the focused item
          handleItemSelection(currentItem, focusedIndex, closeOnItemClick);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentItem = originalItems[focusedIndex];
        if (currentItem?.type === 'submenu') {
          setActiveSubMenuIndex(focusedIndex); // Open the submenu
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeSubMenuIndex !== null) {
          // Close the currently open submenu
          setActiveSubMenuIndex(null);
        }
        // If not in a submenu, this key might close the parent menu (if this is a submenu itself)
        // This relies on the parent ContextMenu handling its child's `onClose` callback.
      }
    };

    menuRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      menuRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, focusedIndex, setVisible, items, closeOnItemClick, interactiveItems, activeSubMenuIndex]);


  /**
   * Handles the selection/click logic for any menu item, including updating internal states
   * for checkboxes/radios and calling actions.
   */
  const handleItemSelection = useCallback(
    (item: ContextMenuItem, originalItemIndex: number, shouldCloseMenu: boolean) => {
      if (item.disabled) return;

      if (item.type === 'checkbox') {
        item.onCheckedChange?.(!item.checked); // Call external handler
        // No internal state change needed if parent manages item.checked
      } else if (item.type === 'radio' && item.group && item.value) {
        setInternalRadioGroupValues(prev => ({
          ...prev,
          [item.group!]: item.value!,
        }));
      } else if (item.type === 'submenu') {
        // Submenu state is managed by `activeSubMenuIndex` and `onSubMenuToggle`
        // Do not close parent menu immediately for submenus
        setActiveSubMenuIndex(originalItemIndex);
        return; // Important: do not close parent menu for submenus
      } else {
        item.action?.(); // Execute the item's action
      }

      if (shouldCloseMenu && item.type !== 'submenu') {
        setVisible(false);
      }
    },
    [setVisible]
  );

  /**
   * Handles changes to radio button values, updating the internal state.
   */
  const handleInternalRadioValueChange = useCallback((value: string, group: string) => {
    setInternalRadioGroupValues(prev => ({
      ...prev,
      [group]: value,
    }));
  }, []);

  /**
   * Handles toggling of submenu visibility, typically initiated by a `ContextMenuItemRenderer`.
   */
  const handleSubMenuToggle = useCallback((isOpen: boolean, itemIndex: number) => {
    if (isOpen) {
      setActiveSubMenuIndex(itemIndex);
    } else {
      setActiveSubMenuIndex(null);
    }
  }, []);


  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className={`fixed bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl rounded-lg py-1.5 z-50 border border-gray-200 dark:border-gray-700 min-w-[220px] animate-scale-in focus:outline-none ${menuClassName || ''}`}
      style={{ top: position.y, left: position.x }}
      onContextMenu={(e) => e.preventDefault()}
      role="menu"
      tabIndex={0} // Make the menu itself focusable for keyboard navigation
      aria-orientation="vertical"
    >
      <ul className="flex flex-col" role="none"> {/* role="none" because the parent div is already role="menu" */}
        {items.map((item, originalIndex) => (
          <ContextMenuItemRenderer
            key={item.id || `item-${originalIndex}`}
            item={item}
            index={originalIndex}
            onSelect={(selectedItem, shouldClose) => handleItemSelection(selectedItem, originalIndex, shouldClose)}
            focused={focusedIndex === originalIndex} // Pass if this specific item is focused
            radioGroupValue={item.group ? internalRadioGroupValues[item.group] : undefined}
            onRadioValueChange={item.group ? handleInternalRadioValueChange : undefined}
            closeMenuOnItemClick={closeOnItemClick}
            onSubMenuToggle={handleSubMenuToggle}
            activeSubMenuIndex={activeSubMenuIndex}
          />
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;

// --- Public Utility Hooks ---

/**
 * Custom hook to manage the checked state of a checkbox menu item.
 * Useful when integrating with external state or managing complex checkbox groups.
 * @param initialChecked The initial checked state.
 * @returns A tuple containing the current checked state and a function to update it.
 */
export function useContextMenuItemCheckbox(initialChecked: boolean = false): [boolean, (checked: boolean) => void] {
  const [checked, setChecked] = useState(initialChecked);
  const onCheckedChange = useCallback((newChecked: boolean) => {
    setChecked(newChecked);
  }, []);
  return [checked, onCheckedChange];
}

/**
 * Custom hook to manage the value of a radio button group within a context menu.
 * This hook is typically used by the parent component that defines the `items` array
 * to control the `checked` property of radio items.
 * @param initialValue The initial selected value for the radio group.
 * @returns A tuple containing the current selected value and a function to update it.
 */
export function useContextMenuItemRadioGroup(initialValue: string = ''): [string, (value: string) => void] {
  const [value, setValue] = useState(initialValue);
  const onValueChange = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);
  return [value, onValueChange];
}

// Exporting internal components for potential advanced use cases or testing, if necessary.
// For general usage, only the default export `ContextMenu` and interfaces/hooks are typically consumed.
export { ContextMenuItemRenderer };
