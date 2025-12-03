import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { NAV_ITEMS, NavItem } from '../../constants';
import { useAppContext, getIcon, QuickAction, AISuggestion, RecentActivityItem } from '../Sidebar';
import { View } from '../../types';

interface PaletteItem {
    id: string;
    label: string;
    icon?: React.ReactElement;
    action: () => void;
    type: 'nav' | 'action' | 'ai' | 'recent' | 'general-search';
    category: string;
    keywords?: string[];
}

const navigate = (path: View) => {
    console.log(`[CommandPalette] Navigating to: ${path}`);
};

const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const {
        availableQuickActions,
        aiSuggestions,
        recentActivities,
        searchConfig,
        triggerNotification,
        trackEvent,
    } = useAppContext();

    const togglePalette = useCallback(() => {
        setIsOpen(prev => {
            const newState = !prev;
            if (newState) {
                setSearchTerm('');
                setSelectedIndex(0);
                trackEvent('command_palette_opened');
            } else {
                trackEvent('command_palette_closed');
            }
            return newState;
        });
    }, [trackEvent]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                togglePalette();
            } else if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                setIsOpen(false);
                setSearchTerm('');
                setSelectedIndex(0);
                trackEvent('command_palette_closed_escape');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, togglePalette, trackEvent]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            trackEvent('command_palette_input_focused');
        }
    }, [isOpen, trackEvent]);

    const allSearchableItems = useMemo(() => {
        const items: PaletteItem[] = [];

        NAV_ITEMS.forEach(navItem => {
            items.push({
                id: `nav-${navItem.id}`,
                label: navItem.name,
                icon: getIcon(navItem.icon),
                action: () => {
                    navigate(navItem.path);
                    setIsOpen(false);
                    trackEvent('command_palette_navigate', { item: navItem.name, path: navItem.path });
                },
                type: 'nav',
                category: 'Navigation',
                keywords: [navItem.name.toLowerCase(), navItem.path.toLowerCase()],
            });
            navItem.subItems?.forEach(subItem => {
                items.push({
                    id: `nav-sub-${subItem.id}`,
                    label: `${navItem.name} > ${subItem.name}`,
                    icon: getIcon(subItem.icon),
                    action: () => {
                        navigate(subItem.path);
                        setIsOpen(false);
                        trackEvent('command_palette_navigate_sub', { item: subItem.name, path: subItem.path });
                    },
                    type: 'nav',
                    category: 'Navigation',
                    keywords: [navItem.name.toLowerCase(), subItem.name.toLowerCase(), subItem.path.toLowerCase()],
                });
            });
        });

        availableQuickActions.forEach(action => {
            items.push({
                id: `quick-action-${action.id}`,
                label: action.label,
                icon: action.icon,
                action: () => {
                    action.action();
                    setIsOpen(false);
                    triggerNotification(`Executed Quick Action: ${action.label}`, 'success');
                    trackEvent('command_palette_quick_action', { action: action.label });
                },
                type: 'action',
                category: 'Quick Actions',
                keywords: [action.label.toLowerCase()],
            });
        });

        aiSuggestions.forEach(suggestion => {
            items.push({
                id: `ai-suggestion-${suggestion.id}`,
                label: suggestion.label,
                icon: suggestion.icon,
                action: () => {
                    suggestion.action();
                    setIsOpen(false);
                    triggerNotification(`Actioned AI Suggestion: ${suggestion.label}`, 'info');
                    trackEvent('command_palette_ai_suggestion', { suggestion: suggestion.label });
                },
                type: 'ai',
                category: 'AI Suggestions',
                keywords: [suggestion.label.toLowerCase(), suggestion.context.toLowerCase()],
            });
        });

        recentActivities.forEach(activity => {
            items.push({
                id: `recent-${activity.id}`,
                label: `Activity: ${activity.description}`,
                icon: getIcon(
                    activity.type === 'message' ? 'message' :
                    activity.type === 'alert' ? 'bell' :
                    activity.type === 'transaction' ? 'wallet' :
                    activity.type === 'document' ? 'document' :
                    activity.type === 'report' ? 'chart' :
                    activity.type === 'login' ? 'user' :
                    'activity'
                ),
                action: () => {
                    if (activity.link) {
                        console.log(`[CommandPalette] Opening recent activity link: ${activity.link}`);
                        setIsOpen(false);
                        triggerNotification(`Opened recent activity: ${activity.description}`);
                        trackEvent('command_palette_recent_activity', { activity: activity.description, link: activity.link });
                    } else {
                        console.log(`[CommandPalette] No specific link for activity: ${activity.description}`);
                        triggerNotification(`Viewed recent activity: ${activity.description}`, 'info');
                        setIsOpen(false);
                        trackEvent('command_palette_recent_activity_no_link', { activity: activity.description });
                    }
                },
                type: 'recent',
                category: 'Recent Activity',
                keywords: [activity.description.toLowerCase(), activity.type.toLowerCase()],
            });
        });

        return items;
    }, [NAV_ITEMS, availableQuickActions, aiSuggestions, recentActivities, triggerNotification, trackEvent]);

    const filteredResults = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let results = allSearchableItems.filter(item =>
            item.label.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.keywords?.some(keyword => keyword.includes(lowerCaseSearchTerm))
        );

        if (searchTerm.length > 0) {
            const hasExactMatch = results.some(item => item.label.toLowerCase() === lowerCaseSearchTerm);
            if (!hasExactMatch) {
                const generalSearchItem: PaletteItem = {
                    id: 'general-search-action',
                    label: `Search for "${searchTerm}" in ${searchConfig.defaultScope || 'All Systems'}`,
                    icon: getIcon('search'),
                    action: () => {
                        searchConfig.onSearchSubmit(searchTerm, searchConfig.defaultScope || 'all');
                        setIsOpen(false);
                        triggerNotification(`Searching for "${searchTerm}"...`, 'info');
                        trackEvent('command_palette_general_search', { term: searchTerm, scope: searchConfig.defaultScope });
                    },
                    type: 'general-search',
                    category: 'Global Search',
                };
                results = [generalSearchItem, ...results];
            }
        }

        const categorizedResults = results.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {} as Record<string, PaletteItem[]>);

        let finalResults: (PaletteItem | { type: 'category-header'; label: string; id: string })[] = [];
        Object.keys(categorizedResults).forEach(category => {
            finalResults.push({ id: `header-${category.replace(/\s/g, '-')}`, type: 'category-header', label: category });
            finalResults.push(...categorizedResults[category]);
        });

        return finalResults;
    }, [searchTerm, allSearchableItems, searchConfig, triggerNotification, trackEvent]);

    useEffect(() => {
        if (filteredResults.length === 0) {
            setSelectedIndex(0);
        } else if (selectedIndex >= filteredResults.length) {
            setSelectedIndex(filteredResults.length > 0 ? filteredResults.length - 1 : 0);
        }
    }, [filteredResults, selectedIndex]);

    const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setSelectedIndex(0);
    }, []);

    const handleResultKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (filteredResults.length === 0) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => {
                    let nextIndex = prev;
                    do {
                        nextIndex = (nextIndex + 1) % filteredResults.length;
                    } while (filteredResults[nextIndex]?.type === 'category-header' && nextIndex !== prev);
                    return nextIndex;
                });
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => {
                    let nextIndex = prev;
                    do {
                        nextIndex = (nextIndex - 1 + filteredResults.length) % filteredResults.length;
                    } while (filteredResults[nextIndex]?.type === 'category-header' && nextIndex !== prev);
                    return nextIndex;
                });
                break;
            case 'Enter':
                event.preventDefault();
                const selectedItem = filteredResults[selectedIndex];
                if (selectedItem && selectedItem.type !== 'category-header') {
                    (selectedItem as PaletteItem).action();
                }
                break;
        }
    }, [filteredResults, selectedIndex]);

    useEffect(() => {
        if (resultsRef.current && filteredResults.length > 0) {
            const selectedElement = resultsRef.current.children[selectedIndex];
            selectedElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [selectedIndex, filteredResults]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/75 flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
            <div
                className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl mt-16 transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex items-center">
                    {getIcon('search', 'h-5 w-5 text-gray-400 mr-3')}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={searchConfig.placeholder || "Search the Multiverse..."}
                        className="flex-grow bg-transparent text-white text-lg placeholder-gray-500 outline-none border-none focus:ring-0"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleResultKeyDown}
                        aria-label="Search command palette"
                    />
                    <span className="ml-3 text-gray-500 text-sm hidden sm:block">
                        <kbd className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md">Esc</kbd> to close
                    </span>
                </div>

                <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto p-2 scrollbar-hide">
                    {filteredResults.length === 0 && searchTerm.length > 0 && (
                        <div className="p-4 text-center text-gray-500">
                            No results found for "{searchTerm}".
                        </div>
                    )}
                     {filteredResults.length === 0 && searchTerm.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                            Start typing to search for navigation, actions, or AI suggestions.
                        </div>
                    )}

                    {filteredResults.map((item, index) => {
                        if (item.type === 'category-header') {
                            return (
                                <div key={item.id} className="sticky top-0 bg-gray-900 z-10 px-4 py-2 text-xs font-semibold text-blue-400 uppercase tracking-wide border-b border-gray-800 -mx-2">
                                    {item.label}
                                </div>
                            );
                        }
                        const isSelected = index === selectedIndex;
                        const paletteItem = item as PaletteItem;

                        return (
                            <button
                                key={paletteItem.id}
                                className={`flex items-center w-full p-3 my-1 rounded-lg text-left transition-colors duration-200
                                    ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-200'}
                                    ${paletteItem.type === 'general-search' ? 'border border-dashed border-gray-600' : ''}
                                `}
                                onClick={paletteItem.action}
                                onMouseEnter={() => setSelectedIndex(index)}
                                role="option"
                                aria-selected={isSelected}
                            >
                                {paletteItem.icon && <span className="mr-3 flex-shrink-0">{paletteItem.icon}</span>}
                                <span className="flex-grow truncate">{paletteItem.label}</span>
                                {paletteItem.type === 'nav' && <span className="ml-2 text-xs text-gray-400">Navigation</span>}
                                {paletteItem.type === 'action' && <span className="ml-2 text-xs text-gray-400">Action</span>}
                                {paletteItem.type === 'ai' && <span className="ml-2 text-xs text-purple-300">AI Suggestion</span>}
                                {paletteItem.type === 'recent' && <span className="ml-2 text-xs text-green-300">Recent</span>}
                                {paletteItem.type === 'general-search' && <span className="ml-2 text-xs text-yellow-300">Global Search</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;