// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { ViewType } from '../../types';
import Icon from '../ui/Icon';
import Breadcrumbs from '../ui/Breadcrumbs';
import SearchBar from '../ui/SearchBar';

/**
 * Represents the structure for a project or workspace identifier,
 * allowing for distinct display and selection.
 */
export type ProjectIdentifier = {
  id: string;
  name: string;
  icon?: string; // Optional icon name (e.g., 'folder', 'briefcase') for visual distinction
};

interface HeaderProps {
  path: { name: string; handle: FileSystemDirectoryHandle }[];
  viewType: ViewType;
  onViewChange: (viewType: ViewType) => void;
  onBreadcrumbNavigate: (index: number) => void;
  onSmartOrganize: () => void;
  onExplainFolder: () => void;
  disableSmartOrganize: boolean;
  onSearch: (query: string) => void;
  isSearching: boolean;
  onClearSearch: () => void;
  isSearchResults: boolean;
  onToggleDashboard: () => void;
  isDashboardVisible: boolean;

  // --- New features and props for an enhanced header ---
  onNewFile: () => void; // Callback for creating a new item (e.g., file, folder). Implies a dropdown in a full UI.
  onOpenAIAssistant: () => void; // Callback to open a dedicated AI assistant interface.
  onOpenNotifications: () => void; // Callback to open the notifications panel.
  unreadNotificationsCount?: number; // Optional count to display on the notification icon.
  onOpenUserSettings: () => void; // Callback to open the user's settings or profile menu.
  userName: string; // The display name of the current user.
  userAvatarUrl?: string; // Optional URL for the user's avatar image.
  isDarkMode: boolean; // Indicates if dark mode is currently active.
  onToggleDarkMode: () => void; // Callback to switch between dark and light modes.
  currentProject: ProjectIdentifier; // Details of the currently active project/workspace.
  onOpenProjectSwitcher: () => void; // Callback to open a dialog or menu for switching projects.
}

const Header: React.FC<HeaderProps> = ({
  path,
  viewType,
  onViewChange,
  onBreadcrumbNavigate,
  onSmartOrganize,
  onExplainFolder,
  disableSmartOrganize,
  onSearch,
  isSearching,
  onClearSearch,
  isSearchResults,
  onToggleDashboard,
  isDashboardVisible,

  // Destructure new props
  onNewFile,
  onOpenAIAssistant,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenUserSettings,
  userName,
  userAvatarUrl,
  isDarkMode,
  onToggleDarkMode,
  currentProject,
  onOpenProjectSwitcher,
}) => {
  return (
    <header className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0 h-14">
      {/* Left Section: Project Selector & Breadcrumbs */}
      <div className="flex items-center gap-2 pr-2 min-w-0">
        <button
          onClick={onOpenProjectSwitcher}
          className="flex items-center gap-1 text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-2 py-1 -ml-2"
          title="Switch Project"
          aria-label={`Current project: ${currentProject.name}. Click to switch projects.`}
        >
          <Icon name={currentProject.icon || "folder"} size={20} />
          <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentProject.name}</span>
          <Icon name="chevron-down" size={16} className="ml-1 text-gray-400 dark:text-gray-500" /> {/* Indicate dropdown */}
        </button>
        {path.length > 0 && ( // Only show separator and breadcrumbs if there's an active path
          <>
            <span className="text-gray-400 dark:text-gray-500 text-lg" aria-hidden="true">/</span>
            <div className="min-w-0 flex-1">
              <Breadcrumbs path={path} onNavigate={onBreadcrumbNavigate} />
            </div>
          </>
        )}
      </div>
      
      {/* Center Section: Search Bar */}
      <div className="flex-1 flex justify-center min-w-[200px] max-w-lg px-4">
        <SearchBar onSearch={onSearch} isSearching={isSearching} onClear={onClearSearch} isResults={isSearchResults} />
      </div>
      
      {/* Right Section: Actions and Utilities */}
      <div className="flex items-center space-x-2 pl-2">
        {/* New Item Button */}
        <button
          onClick={onNewFile} // This button typically opens a dropdown for new file/folder/upload in a full implementation
          className="p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          title="Create New Item"
          aria-label="Create new file or folder"
        >
          <Icon name="plus" size={18} />
        </button>

        {/* AI Actions Group */}
        <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-2">
          <button
              onClick={onOpenAIAssistant}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-opacity-50"
              title="Open AI Assistant"
              aria-label="Open AI Assistant"
          >
              <Icon name="message-square" size={18} />
          </button>
          <button 
              onClick={onExplainFolder}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Explain this Folder with AI"
              title="Explain this Folder with AI"
          >
              <Icon name="brain" size={18} />
              <span className="hidden sm:inline">Explain</span>
          </button>
          <button 
              onClick={onSmartOrganize}
              disabled={disableSmartOrganize}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              aria-label="Smart Organize Files"
              title="Smart Organize Files"
          >
              <Icon name="sparkles" size={18} />
              <span className="hidden sm:inline">Organize</span>
          </button>
        </div>

        {/* View & Dashboard Group */}
        <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-2">
          <button
              onClick={onToggleDashboard}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isDashboardVisible ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              title="Toggle Project Dashboard"
              aria-label="Toggle Project Dashboard visibility"
          >
              <Icon name="dashboard" size={18} />
          </button>
          <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
            <button
                onClick={() => onViewChange('list')}
                className={`p-1.5 rounded-md ${viewType === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-300/50 dark:hover:bg-gray-600/50'} focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-opacity-50`}
                aria-label="List view"
                title="List view"
            >
                <Icon name="list" size={18} />
            </button>
            <button
                onClick={() => onViewChange('grid')}
                className={`p-1.5 rounded-md ${viewType === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'hover:bg-gray-300/50 dark:hover:bg-gray-600/50'} focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-opacity-50`}
                aria-label="Grid view"
                title="Grid view"
            >
                <Icon name="grid" size={18} />
            </button>
          </div>
        </div>

        {/* Utility & User Group */}
        <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-700 pl-2">
          <button
              onClick={onOpenNotifications}
              className="p-2 rounded-lg relative hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-opacity-50"
              title="Notifications"
              aria-label={`Notifications${unreadNotificationsCount ? ` (${unreadNotificationsCount} unread)` : ''}`}
          >
              <Icon name="bell" size={18} />
              {unreadNotificationsCount !== undefined && unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500 dark:ring-gray-800 animate-pulse" aria-hidden="true"></span>
              )}
          </button>
          <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-opacity-50"
              title="Toggle Dark Mode"
              aria-label={`Toggle ${isDarkMode ? 'light' : 'dark'} mode`}
          >
              <Icon name={isDarkMode ? "sun" : "moon"} size={18} />
          </button>
          <button
              onClick={onOpenUserSettings}
              className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              title={`Signed in as ${userName}`}
              aria-label={`User settings for ${userName}`}
          >
              {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt={userName} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                  <Icon name="user" size={18} />
              )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;