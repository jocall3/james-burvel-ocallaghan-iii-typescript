// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.


import React from 'react';
import type { FileNode } from '../../types';
import Icon from '../ui/Icon';

/**
 * Formats a date string into a human-readable "time ago" format or a specific date/time.
 * This utility function is exported for potential reuse across the application, adhering to
 * the instruction that new top-level functions must be exported.
 * @param dateString The date string (e.g., ISO 8601) to format.
 * @returns A formatted string indicating how long ago the event occurred or its specific date/time.
 */
export const formatLastSavedTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `Saved ${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago`;
    if (diffMinutes < 60) return `Saved ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Saved ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `Saved ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    // Fallback for older dates: "Saved on [Date] at [Time]"
    return `Saved on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (error) {
    console.error("Error formatting date string:", dateString, error);
    return 'Invalid Date';
  }
};

/**
 * Defines the properties for the Footer component.
 * Expanded to include more actions and status indicators for a comprehensive user experience.
 */
interface FooterProps {
  selectedFiles: FileNode[];
  onRename: () => void;
  onDelete: () => void;
  onToggleTerminal: () => void;
  // New action handlers for common file operations, making the footer more robust
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDownload?: () => void;
  onMove?: () => void;
  onViewDetails?: () => void;
  // Global UI/App controls and status indicators
  onToggleTheme?: (isDark: boolean) => void; // Callback to toggle the application theme
  isDarkTheme?: boolean; // Current theme status, used for displaying appropriate icon
  clipboardHasItems?: boolean; // Indicates if there's content in the clipboard to enable paste
  currentProjectName?: string; // Name of the currently active project/workspace
  appVersion?: string; // Application version for display
  lastSavedAt?: string; // Timestamp of the last save operation (e.g., ISO string)
  terminalOpen?: boolean; // Boolean indicating if the terminal is currently open
}

/**
 * The Footer component provides status information and quick access to common actions.
 * It has been enhanced to offer a wider range of file manipulation options,
 * application status displays, and UI controls, aiming for a "Google quality" end product.
 * The footer is always rendered, with actions conditionally enabled/disabled based on context.
 */
const Footer: React.FC<FooterProps> = ({
  selectedFiles,
  onRename,
  onDelete,
  onToggleTerminal,
  onCopy,
  onCut,
  onPaste,
  onDownload,
  onMove,
  onViewDetails,
  onToggleTheme,
  isDarkTheme = false,
  clipboardHasItems = false,
  currentProjectName = "Untitled Project", // Default value for market-ready robustness
  appVersion = "1.0.0", // Default value
  lastSavedAt,
  terminalOpen = false,
}) => {
  const count = selectedFiles.length;

  // Determine action enablement based on selected file count and handler availability
  const canRename = count === 1 && !!onRename;
  const canDelete = count >= 1 && !!onDelete;
  const canCopy = count >= 1 && !!onCopy;
  const canCut = count >= 1 && !!onCut;
  const canPaste = clipboardHasItems && !!onPaste; // Paste depends on clipboard state, not selected files
  const canDownload = count >= 1 && !!onDownload;
  const canMove = count >= 1 && !!onMove;
  const canViewDetails = count === 1 && !!onViewDetails;

  return (
    <footer className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-slide-up flex-shrink-0 text-gray-700 dark:text-gray-300">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
        {/* Left Section: Selection Status & File Actions */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold whitespace-nowrap">
            {count > 0 ? `${count} item${count > 1 ? 's' : ''} selected` : 'No items selected'}
          </span>

          <div className="flex items-center space-x-1">
            {/* Rename Action */}
            <button
              onClick={onRename}
              disabled={!canRename}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Rename selected item"
              aria-label="Rename selected item"
            >
              <Icon name="rename" />
            </button>
            {/* Delete Action */}
            <button
              onClick={onDelete}
              disabled={!canDelete}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Delete selected items"
              aria-label="Delete selected items"
            >
              <Icon name="trash" />
            </button>
            {/* Copy Action */}
            <button
              onClick={onCopy}
              disabled={!canCopy}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Copy selected items to clipboard"
              aria-label="Copy selected items"
            >
              <Icon name="copy" />
            </button>
            {/* Cut Action */}
            <button
              onClick={onCut}
              disabled={!canCut}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Cut selected items to clipboard"
              aria-label="Cut selected items"
            >
              <Icon name="cut" />
            </button>
            {/* Paste Action */}
            <button
              onClick={onPaste}
              disabled={!canPaste}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Paste items from clipboard"
              aria-label="Paste items from clipboard"
            >
              <Icon name="paste" />
            </button>
            {/* Download Action */}
            <button
              onClick={onDownload}
              disabled={!canDownload}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Download selected items"
              aria-label="Download selected items"
            >
              <Icon name="download" />
            </button>
            {/* Move Action */}
            <button
              onClick={onMove}
              disabled={!canMove}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="Move selected items to another location"
              aria-label="Move selected items"
            >
              <Icon name="folder-move" /> {/* Assuming 'folder-move' icon exists */}
            </button>
            {/* View Details Action */}
            <button
              onClick={onViewDetails}
              disabled={!canViewDetails}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors duration-200"
              title="View details of the selected item"
              aria-label="View details of the selected item"
            >
              <Icon name="info" /> {/* Assuming 'info' or 'properties' icon exists */}
            </button>
          </div>
        </div>

        {/* Right Section: Global Controls & Application Status */}
        <div className="flex items-center space-x-4">
          {/* Terminal Toggle */}
          <button
            onClick={onToggleTerminal}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title={terminalOpen ? "Hide Terminal" : "Show Terminal"}
            aria-label={terminalOpen ? "Hide Terminal" : "Show Terminal"}
          >
            <Icon name="terminal" className={terminalOpen ? "text-blue-500 dark:text-blue-400" : ""} />
          </button>

          {/* Theme Toggle (conditionally rendered if handler is provided) */}
          {onToggleTheme && (
            <button
              onClick={() => onToggleTheme(!isDarkTheme)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <Icon name={isDarkTheme ? "sun" : "moon"} /> {/* Assuming 'sun' and 'moon' icons */}
            </button>
          )}

          {/* Application Status Information (responsive visibility) */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            {currentProjectName && (
              <span className="hidden sm:inline-block">Project: <span className="font-medium">{currentProjectName}</span></span>
            )}
            {appVersion && (
              <span className="hidden md:inline-block">Ver: <span className="font-medium">{appVersion}</span></span>
            )}
            {lastSavedAt && (
              <span className="hidden lg:inline-block">
                {formatLastSavedTime(lastSavedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;