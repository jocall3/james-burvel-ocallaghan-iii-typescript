// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React from 'react';
import { useAppContext } from '../contexts/GlobalStateContext.tsx';
import { logout } from '../services';
import { ArrowLeftOnRectangleIcon, CommandCenterIcon, ProjectExplorerIcon, ConnectionsIcon, Cog6ToothIcon } from './icons.tsx';

interface LeftSidebarProps {
  onLaunchFeature: (featureId: string) => void;
}

const Tooltip: React.FC<{ text: string, children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="group relative flex justify-center">
      {children}
      <span className="absolute left-16 p-2 scale-0 transition-all rounded bg-background border border-border text-xs text-text-primary group-hover:scale-100 whitespace-nowrap z-50">
        {text}
      </span>
    </div>
  );
};

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ onLaunchFeature }) => {
    const { state, dispatch } = useAppContext();
    const { githubUser: user } = state;

    const handleLogout = async () => {
        await logout();
        dispatch({ type: 'LOGOUT' });
    };

  const coreItems = [
    { id: 'ai-command-center', label: 'AI Command Center', icon: <CommandCenterIcon /> },
    { id: 'project-explorer', label: 'Project Explorer', icon: <ProjectExplorerIcon /> },
    { id: 'connections', label: 'Connections', icon: <ConnectionsIcon /> },
  ];

  return (
    <nav className="w-20 h-full bg-surface/50 backdrop-blur-xl border-r border-border flex flex-col py-4 px-2 z-20">
      <div className="flex-shrink-0 flex justify-center p-2 mb-4">
            <img 
                src="https://citibankdemobusiness.dev/wp-content/uploads/2025/08/cropped-Untitled-1-180x180.png" 
                alt="Company Logo" 
                className="w-12 h-12"
            />
      </div>
       <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center gap-2 pt-4">
        {coreItems.map((item) => (
            <Tooltip key={item.id} text={item.label}>
              <button
                onClick={() => onLaunchFeature(item.id)}
                className="flex items-center justify-center w-12 h-12 rounded-lg transition-colors duration-200 text-text-secondary hover:bg-primary/10 hover:text-primary"
              >
                {item.icon}
              </button>
            </Tooltip>
        ))}
      </div>
      <div className="mt-auto flex-shrink-0 flex flex-col items-center gap-4">
         <Tooltip text="Settings">
            <button
              onClick={() => onLaunchFeature('settings')}
              className="flex items-center justify-center w-12 h-12 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary"
            >
              <Cog6ToothIcon />
            </button>
         </Tooltip>
         {user && (
            <Tooltip text={user.name || user.login}>
                 <img src={user.avatar_url} alt={user.login} className="w-10 h-10 rounded-full border-2 border-border" />
            </Tooltip>
         )}
         {user && (
            <Tooltip text="Logout">
                <button
                onClick={handleLogout}
                className="flex items-center justify-center w-12 h-12 rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary"
                >
                <ArrowLeftOnRectangleIcon />
                </button>
            </Tooltip>
         )}
      </div>
    </nav>
  );
};