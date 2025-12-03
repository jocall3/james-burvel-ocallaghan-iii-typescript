// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from './Icon';

// --- New Types and Interfaces ---

/**
 * Represents a single item in the breadcrumb path.
 * It can support various ways of handling navigation.
 */
export interface BreadcrumbItem {
    /** The display name for the breadcrumb item. */
    name: string;
    /** An optional unique identifier for the item. If not provided, `name` + `index` will be used as a key. */
    id?: string;
    /** An optional href for direct link navigation (e.g., for standard anchor tags). */
    href?: string;
    /** An optional FileSystemDirectoryHandle for file system specific contexts. */
    handle?: FileSystemDirectoryHandle;
    /** An optional click handler for this specific item, overriding the global onNavigate. */
    onClick?: (item: BreadcrumbItem, index: number) => void;
    /** Optional, additional data associated with the item. */
    data?: any;
    /** Indicates if the item is currently loading or in a pending state. */
    isLoading?: boolean;
}

/**
 * Props for the main Breadcrumbs component.
 */
export interface BreadcrumbsProps {
    /** An array of BreadcrumbItem objects representing the path. */
    path: BreadcrumbItem[];
    /**
     * A global navigation handler that is called when an item is clicked,
     * unless the item has its own `onClick` handler.
     * @param index The index of the clicked item in the original path array.
     * @param item The clicked BreadcrumbItem object.
     */
    onNavigate?: (index: number, item: BreadcrumbItem) => void;
    /**
     * The maximum number of breadcrumb items to display before truncating the path.
     * If 0 or less, truncation is disabled.
     */
    maxItems?: number;
    /**
     * The number of items to always show at the beginning of the path when truncated.
     * Defaults to 1. Must be positive or zero.
     */
    numStartItems?: number;
    /**
     * The number of items to always show at the end of the path when truncated.
     * Defaults to 1. Must be positive or zero.
     */
    numEndItems?: number;
    /**
     * Custom separator component to display between breadcrumb items.
     * Defaults to a 'chevronRight' Icon.
     */
    separator?: React.ReactNode;
    /** Additional CSS class names for the navigation container. */
    className?: string;
    /** Aria label for the navigation container. */
    ariaLabel?: string;
    /** Callback for when the ellipsis dropdown opens. */
    onEllipsisOpen?: () => void;
    /** Callback for when the ellipsis dropdown closes. */
    onEllipsisClose?: () => void;
    /** Custom class for individual breadcrumb items (excluding the last one). */
    itemClassName?: string;
    /** Custom class for the last (current) breadcrumb item. */
    lastItemClassName?: string;
    /** Custom class for the ellipsis button. */
    ellipsisClassName?: string;
    /** Custom class for the ellipsis dropdown menu container. */
    ellipsisDropdownClassName?: string;
    /** Custom class for items within the ellipsis dropdown. */
    ellipsisDropdownItemClassName?: string;
}

// --- Helper Components / Sub-Components ---

interface BreadcrumbItemComponentProps {
    item: BreadcrumbItem;
    originalIndex: number; // The index in the original full path
    isLast: boolean;
    onClick: (index: number, item: BreadcrumbItem) => void;
    itemClassName?: string;
    lastItemClassName?: string;
}

const BreadcrumbItemComponent: React.FC<BreadcrumbItemComponentProps> = ({ item, originalIndex, isLast, onClick, itemClassName, lastItemClassName }) => {
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (item.href && !isLast) { // If it's a link and not the last item, let browser handle by default
            if (item.onClick) {
                e.preventDefault(); // Prevent default if custom onClick is defined for a link
                item.onClick(item, originalIndex);
            }
            return;
        }
        e.preventDefault(); // Prevent default for button or if custom onClick for link without href
        if (item.onClick) {
            item.onClick(item, originalIndex);
        } else {
            onClick(originalIndex, item);
        }
    }, [item, originalIndex, isLast, onClick]);

    const content = (
        <>
            {item.isLoading && (
                <span className="animate-spin mr-1 text-blue-500 dark:text-blue-400" role="status" aria-label="Loading">
                    <Icon name="spinner" size={16} />
                </span>
            )}
            {item.name}
        </>
    );

    const baseClass = "px-2 py-1.5 rounded-md transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50";
    const dynamicClass = isLast
        ? `text-gray-800 dark:text-gray-100 font-semibold cursor-default ${lastItemClassName || ''}`
        : `hover:bg-gray-200 dark:hover:bg-gray-700 ${itemClassName || ''}`;

    const commonProps = {
        className: `${baseClass} ${dynamicClass}`,
        'aria-current': isLast ? 'page' : undefined,
        'aria-label': isLast ? `Current page: ${item.name}` : `Navigate to ${item.name}`,
        title: item.name, // Tooltip for full name
        'data-breadcrumb-index': originalIndex, // Custom data attribute for testing or analytics
    };

    if (item.href && !isLast) {
        return (
            <a {...commonProps} href={item.href} onClick={handleClick}>
                {content}
            </a>
        );
    }

    return (
        <button
            {...commonProps}
            onClick={handleClick}
            disabled={isLast}
            type="button"
        >
            {content}
        </button>
    );
};

interface BreadcrumbEllipsisProps {
    items: BreadcrumbItem[]; // These are the hidden items
    offsetIndex: number; // The starting index in the original path for these hidden items
    onItemClick: (index: number, item: BreadcrumbItem) => void;
    onOpen?: () => void;
    onClose?: () => void;
    ellipsisClassName?: string;
    ellipsisDropdownClassName?: string;
    ellipsisDropdownItemClassName?: string;
}

export const BreadcrumbEllipsis: React.FC<BreadcrumbEllipsisProps> = ({
    items,
    offsetIndex,
    onItemClick,
    onOpen,
    onClose,
    ellipsisClassName,
    ellipsisDropdownClassName,
    ellipsisDropdownItemClassName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleDropdown = useCallback(() => {
        setIsOpen(prev => {
            const newState = !prev;
            if (newState) {
                onOpen?.();
            } else {
                onClose?.();
            }
            return newState;
        });
    }, [onOpen, onClose]);

    const closeDropdown = useCallback(() => {
        if (isOpen) {
            setIsOpen(false);
            onClose?.();
        }
    }, [isOpen, onClose]);

    const handleItemClick = useCallback((item: BreadcrumbItem, relativeIndex: number) => {
        onItemClick(offsetIndex + relativeIndex, item); // Calculate true original index
        closeDropdown();
    }, [onItemClick, offsetIndex, closeDropdown]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                closeDropdown();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeDropdown]);

    return (
        <div className="relative inline-flex items-center">
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className={`px-2 py-1.5 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${ellipsisClassName || ''}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Show hidden breadcrumb items"
                type="button"
            >
                <Icon name="ellipsisHorizontal" size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`absolute z-10 top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${ellipsisDropdownClassName || ''}`}
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="py-1" role="none">
                        {items.map((item, index) => (
                            <a
                                key={item.id || item.name + index}
                                href={item.href || '#'}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleItemClick(item, index);
                                }}
                                className={`block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap overflow-hidden text-ellipsis ${ellipsisDropdownItemClassName || ''}`}
                                role="menuitem"
                                tabIndex={0}
                                title={item.name}
                            >
                                {item.isLoading && (
                                    <span className="animate-spin mr-1 text-blue-500 dark:text-blue-400" role="status" aria-label="Loading">
                                        <Icon name="spinner" size={12} />
                                    </span>
                                )}
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Breadcrumbs Component ---

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    path,
    onNavigate,
    maxItems = 0,
    numStartItems = 1,
    numEndItems = 1,
    separator = <Icon name="chevronRight" size={16} className="mx-1 flex-shrink-0 text-gray-400 dark:text-gray-500" />,
    className,
    ariaLabel = "Breadcrumb",
    onEllipsisOpen,
    onEllipsisClose,
    itemClassName,
    lastItemClassName,
    ellipsisClassName,
    ellipsisDropdownClassName,
    ellipsisDropdownItemClassName,
}) => {
    const handleGlobalNavigate = useCallback((index: number, item: BreadcrumbItem) => {
        onNavigate?.(index, item);
    }, [onNavigate]);

    const effectivePath = path || [];

    // Ensure numStartItems and numEndItems are valid (non-negative)
    const validatedNumStartItems = Math.max(0, numStartItems);
    const validatedNumEndItems = Math.max(0, numEndItems);

    const totalLength = effectivePath.length;
    const shouldTruncate = maxItems > 0 && totalLength > maxItems;

    let displayPath: BreadcrumbItem[] = effectivePath;
    let hiddenItems: BreadcrumbItem[] = [];
    let hiddenItemsStartIndex = -1; // Index in original path where hidden items start

    if (shouldTruncate) {
        // Calculate the actual number of start and end items to show, respecting maxItems
        // and ensuring they don't overlap in a way that causes issues.
        const effectiveNumStart = Math.min(validatedNumStartItems, maxItems - (validatedNumEndItems > 0 ? 1 : 0)); // -1 for ellipsis
        const effectiveNumEnd = Math.min(validatedNumEndItems, maxItems - effectiveNumStart - (effectiveNumStart > 0 || totalLength - effectiveNumEnd > effectiveNumStart ? 1 : 0));

        // If after considering ellipsis, we can show all items, don't truncate.
        if (effectiveNumStart + effectiveNumEnd >= totalLength) {
            displayPath = effectivePath;
        } else {
            const startItems = effectivePath.slice(0, effectiveNumStart);
            const endItems = effectivePath.slice(totalLength - effectiveNumEnd);

            hiddenItems = effectivePath.slice(effectiveNumStart, totalLength - effectiveNumEnd);
            hiddenItemsStartIndex = effectiveNumStart;

            // Add a placeholder for the ellipsis
            displayPath = [
                ...startItems,
                { name: '...', id: 'breadcrumb-ellipsis', data: hiddenItems },
                ...endItems,
            ];
        }
    }

    return (
        <nav aria-label={ariaLabel} className={`flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 ${className || ''}`}>
            {displayPath.map((item, index) => {
                const isLast = index === displayPath.length - 1;
                const isEllipsis = item.id === 'breadcrumb-ellipsis';

                // Determine the original index for the current item
                let originalIndex;
                if (isEllipsis) {
                    originalIndex = -1; // Ellipsis itself doesn't map to a single original index
                } else if (!shouldTruncate || index < validatedNumStartItems) {
                    // For non-truncated paths or items in the 'start' segment
                    originalIndex = index;
                } else {
                    // For items in the 'end' segment when truncated
                    originalIndex = totalLength - (displayPath.length - index);
                }

                return (
                    <div key={item.id || item.name + originalIndex} className="flex items-center">
                        {index > 0 && (
                            <span className="flex items-center">{separator}</span>
                        )}

                        {isEllipsis ? (
                            <BreadcrumbEllipsis
                                items={hiddenItems}
                                offsetIndex={hiddenItemsStartIndex}
                                onItemClick={handleGlobalNavigate}
                                onOpen={onEllipsisOpen}
                                onClose={onEllipsisClose}
                                ellipsisClassName={ellipsisClassName}
                                ellipsisDropdownClassName={ellipsisDropdownClassName}
                                ellipsisDropdownItemClassName={ellipsisDropdownItemClassName}
                            />
                        ) : (
                            <BreadcrumbItemComponent
                                item={item}
                                originalIndex={originalIndex}
                                isLast={isLast}
                                onClick={handleGlobalNavigate}
                                itemClassName={itemClassName}
                                lastItemClassName={lastItemClassName}
                            />
                        )}
                    </div>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;