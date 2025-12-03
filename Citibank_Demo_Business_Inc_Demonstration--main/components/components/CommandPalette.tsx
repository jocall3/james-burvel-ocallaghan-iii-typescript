/**
 * This module implements a sophisticated Command Palette, a universal search and action interface for rapid navigation and
 * interaction within the financial orchestration platform.
 *
 * Business value: This core component significantly enhances user productivity and operational velocity by providing
 * instant access to critical functions, agent commands, payment rails, and identity management features, reducing cognitive
 * load and time-to-action. It serves as a central hub for proactive AI suggestions and real-time operational insights,
 * directly contributing to accelerated decision-making, reduced error rates, and increased throughput for high-value
 * financial operations. This translates into millions in operational efficiency and strategic agility for enterprise
 * clients, enabling new revenue models and substantial cost arbitrage.
 */
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { NAV_ITEMS } from '../../constants';
import { useAppContext, getIcon, QuickAction, AISuggestion, RecentActivityItem } from '../Sidebar';
import { View } from '../../types';

interface PaletteItem {
    id: string;
    label: string;
    icon?: React.ReactElement;
    action: () => void;
    type: 'nav' | 'action' | 'ai' | 'recent' | 'general-search' | 'agent-action' | 'payment-action' | 'identity-action' | 'governance-action';
    category: string;
    keywords?: string[];
}

export const CommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dynamicAiSuggestions, setDynamicAiSuggestions] = useState<AISuggestion[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const {
        availableQuickActions,
        aiSuggestions: staticAiSuggestions,
        recentActivities,
        searchConfig,
        triggerNotification,
        trackEvent,
        // Assuming these are provided by useAppContext, with fallbacks for robustness
        navigateTo = (path: View) => console.log(`[CommandPalette] Navigating to: ${path}`),
        agentActions = [], // Placeholder/default for agent-specific quick actions
        paymentActions = [], // Placeholder/default for payment-specific quick actions
        identityActions = [], // Placeholder/default for identity-specific quick actions
        governanceActions = [], // Placeholder/default for governance-specific quick actions
        currentView = 'dashboard', // Placeholder/default for current application view
        generateDynamicAISuggestions = async (_term: string, _view: View) => {
            // Simulate a delayed response from an AI agent
            await new Promise(resolve => setTimeout(resolve, 100));
            // In a real system, this would involve calling an AI service with context
            console.log(`[CommandPalette] Simulating AI suggestion generation for term: ${_term}, view: ${_view}`);
            const lowerTerm = _term.toLowerCase();
            const suggestions: AISuggestion[] = [];

            if (lowerTerm.includes('fraud') && _view === 'transactions') {
                suggestions.push({
                    id: 'ai-fraud-alert',
                    label: 'Investigate potential fraud incident',
                    icon: getIcon('alert'),
                    context: 'Anomalous transaction detected',
                    action: () => console.log('Simulating fraud investigation workflow'),
                });
            }
            if (lowerTerm.includes('balance') && _view === 'accounts') {
                suggestions.push({
                    id: 'ai-check-balance',
                    label: 'View aggregated account balances',
                    icon: getIcon('wallet'),
                    context: 'User queried account balance',
                    action: () => navigateTo('accounts' as View), // Cast for type safety with placeholder
                });
            }
            if (lowerTerm.includes('agent') && _view === 'agents') {
                suggestions.push({
                    id: 'ai-optimize-agent-workflow',
                    label: 'Optimize Agent workflow for throughput',
                    icon: getIcon('agent'),
                    context: 'Agent performance anomaly detected',
                    action: () => console.log('Simulating agent optimization'),
                });
            }
            return suggestions;
        },
    } = useAppContext();

    const togglePalette = useCallback(() => {
        setIsOpen(prev => {
            const newState = !prev;
            if (newState) {
                setSearchTerm('');
                setSelectedIndex(0);
                setDynamicAiSuggestions([]);
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
                setDynamicAiSuggestions([]);
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

    useEffect(() => {
        if (!isOpen || searchTerm.length < 3) {
            setDynamicAiSuggestions([]);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            try {
                const suggestions = await generateDynamicAISuggestions(searchTerm, currentView);
                setDynamicAiSuggestions(suggestions);
                trackEvent('command_palette_dynamic_ai_suggestions_fetched', { term: searchTerm, view: currentView, count: suggestions.length });
            } catch (error: any) {
                console.error('[CommandPalette] Error fetching dynamic AI suggestions:', error);
                triggerNotification('Failed to fetch AI suggestions.', 'error');
                trackEvent('command_palette_dynamic_ai_suggestions_failed', { term: searchTerm, error: error.message });
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, currentView, isOpen, generateDynamicAISuggestions, trackEvent, triggerNotification]);


    const allSearchableItems = useMemo(() => {
        const items: PaletteItem[] = [];

        // 1. Navigation Items
        NAV_ITEMS.forEach(navItem => {
            items.push({
                id: `nav-${navItem.id}`,
                label: navItem.name,
                icon: getIcon(navItem.icon),
                action: () => {
                    try {
                        navigateTo(navItem.path);
                        setIsOpen(false);
                        trackEvent('command_palette_navigate', { item: navItem.name, path: navItem.path });
                    } catch (error: any) {
                        triggerNotification(`Failed to navigate to ${navItem.name}.`, 'error');
                        console.error(`[CommandPalette] Navigation error: ${error.message}`);
                    }
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
                        try {
                            navigateTo(subItem.path);
                            setIsOpen(false);
                            trackEvent('command_palette_navigate_sub', { item: subItem.name, path: subItem.path });
                        } catch (error: any) {
                            triggerNotification(`Failed to navigate to ${subItem.name}.`, 'error');
                            console.error(`[CommandPalette] Sub-navigation error: ${error.message}`);
                        }
                    },
                    type: 'nav',
                    category: 'Navigation',
                    keywords: [navItem.name.toLowerCase(), subItem.name.toLowerCase(), subItem.path.toLowerCase()],
                });
            });
        });

        // 2. Available Quick Actions
        availableQuickActions.forEach(action => {
            items.push({
                id: `quick-action-${action.id}`,
                label: action.label,
                icon: action.icon,
                action: async () => {
                    try {
                        await action.action();
                        setIsOpen(false);
                        triggerNotification(`Executed Quick Action: ${action.label}`, 'success');
                        trackEvent('command_palette_quick_action', { action: action.label });
                    } catch (error: any) {
                        triggerNotification(`Failed to execute action: ${action.label}.`, 'error');
                        console.error(`[CommandPalette] Quick Action error: ${error.message}`);
                    }
                },
                type: 'action',
                category: 'Quick Actions',
                keywords: [action.label.toLowerCase()],
            });
        });

        // 3. AI Suggestions (Static and Dynamic combined)
        const combinedAiSuggestions = [...staticAiSuggestions, ...dynamicAiSuggestions];
        combinedAiSuggestions.forEach(suggestion => {
            items.push({
                id: `ai-suggestion-${suggestion.id}`,
                label: suggestion.label,
                icon: suggestion.icon,
                action: async () => {
                    try {
                        await suggestion.action();
                        setIsOpen(false);
                        triggerNotification(`Actioned AI Suggestion: ${suggestion.label}`, 'info');
                        trackEvent('command_palette_ai_suggestion', { suggestion: suggestion.label });
                    } catch (error: any) {
                        triggerNotification(`Failed to action AI suggestion: ${suggestion.label}.`, 'error');
                        console.error(`[CommandPalette] AI Suggestion error: ${error.message}`);
                    }
                },
                type: 'ai',
                category: 'AI Suggestions',
                keywords: [suggestion.label.toLowerCase(), suggestion.context.toLowerCase()],
            });
        });

        // 4. Agent Management Actions
        agentActions.forEach(action => {
            items.push({
                id: `agent-action-${action.id}`,
                label: action.label,
                icon: action.icon || getIcon('agent'),
                action: async () => {
                    try {
                        await action.action();
                        setIsOpen(false);
                        triggerNotification(`Executed Agent Action: ${action.label}`, 'success');
                        trackEvent('command_palette_agent_action', { action: action.label });
                    } catch (error: any) {
                        triggerNotification(`Failed to execute agent action: ${action.label}.`, 'error');
                        console.error(`[CommandPalette] Agent Action error: ${error.message}`);
                    }
                },
                type: 'agent-action',
                category: 'Agent Management',
                keywords: [action.label.toLowerCase()],
            });
        });

        // 5. Payment Infrastructure Actions
        paymentActions.forEach(action => {
            items.push({
                id: `payment-action-${action.id}`,
                label: action.label,
                icon: action.icon || getIcon('wallet'),
                action: async () => {
                    try {
                        await action.action();
                        setIsOpen(false);
                        triggerNotification(`Executed Payment Action: ${action.label}`, 'success');
                        trackEvent('command_palette_payment_action', { action: action.label });
                    } catch (error: any) {
                        triggerNotification(`Failed to execute payment action: ${action.label}.`, 'error');
                        console.error(`[CommandPalette] Payment Action error: ${error.message}`);
                    }
                },
                type: 'payment-action',
                category: 'Payments & Rails',
                keywords: [action.label.toLowerCase()],
            });
        });

        // 6. Digital Identity & Security Actions
        identityActions.forEach(action => {
            items.push({
                id: `identity-action-${action.id}`,
                label: action.label,
                icon: action.icon || getIcon('user'),
                action: async () => {
                    try {
                        await action.action();
                        setIsOpen(false);
                        triggerNotification(`Executed Identity Action: ${action.label}`, 'success');
                        trackEvent('command_palette_identity_action', { action: action.label });
                    } catch (error: any) {
                        triggerNotification(`Failed to execute identity action: ${action.label}.`, 'error');
                        console.error(`[CommandPalette] Identity Action error: ${error.message}`);
                    }
                },
                type: 'identity-action',
                category: 'Identity & Security',
                keywords: [action.label.toLowerCase()],
            });
        });

        // 7. Governance & Observability Actions
        governanceActions.forEach(action => {
            items.push({
                id: `governance-action-${action.id}`,
                label: action.label,
                icon: action.icon || getIcon('settings'),
                action: async () => {
                    try {
                        await action.action();
                        setIsOpen(false);
                        triggerNotification(`Executed Governance Action: ${action.label}`, 'success');
                        trackEvent('command_palette_governance_action', { action: action.label });
                    } catch (error: any) {
                        triggerNotification(`Failed to execute governance action: ${action.label}.`, 'error');
                        console.error(`[CommandPalette] Governance Action error: ${error.message}`);
                    }
                },
                type: 'governance-action',
                category: 'Governance & Observability',
                keywords: [action.label.toLowerCase()],
            });
        });


        // 8. Recent Activity
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
                    try {
                        if (activity.link) {
                            console.log(`[CommandPalette] Opening recent activity link: ${activity.link}`);
                            if (typeof activity.link === 'string') {
                                navigateTo(activity.link as View);
                            } else {
                                console.warn('[CommandPalette] Activity link is not a string, cannot navigate.', activity.link);
                            }
                            setIsOpen(false);
                            triggerNotification(`Opened recent activity: ${activity.description}`);
                            trackEvent('command_palette_recent_activity', { activity: activity.description, link: activity.link });
                        } else {
                            console.log(`[CommandPalette] No specific link for activity: ${activity.description}`);
                            triggerNotification(`Viewed recent activity: ${activity.description}`, 'info');
                            setIsOpen(false);
                            trackEvent('command_palette_recent_activity_no_link', { activity: activity.description });
                        }
                    } catch (error: any) {
                        triggerNotification(`Failed to view recent activity: ${activity.description}.`, 'error');
                        console.error(`[CommandPalette] Recent Activity error: ${error.message}`);
                    }
                },
                type: 'recent',
                category: 'Recent Activity',
                keywords: [activity.description.toLowerCase(), activity.type.toLowerCase()],
            });
        });

        return items;
    }, [NAV_ITEMS, availableQuickActions, staticAiSuggestions, dynamicAiSuggestions, recentActivities, agentActions, paymentActions, identityActions, governanceActions, triggerNotification, trackEvent, navigateTo]);

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
                    label: `Search "${searchTerm}" in ${searchConfig.defaultScope || 'Agents, Payments, Identity, Reports'}`,
                    icon: getIcon('search'),
                    action: () => {
                        try {
                            searchConfig.onSearchSubmit(searchTerm, searchConfig.defaultScope || 'all');
                            setIsOpen(false);
                            triggerNotification(`Searching for "${searchTerm}"...`, 'info');
                            trackEvent('command_palette_general_search', { term: searchTerm, scope: searchConfig.defaultScope });
                        } catch (error: any) {
                            triggerNotification(`Global search failed for "${searchTerm}".`, 'error');
                            console.error(`[CommandPalette] Global search error: ${error.message}`);
                        }
                    },
                    type: 'general-search',
                    category: 'Global Search',
                    keywords: ['search', searchTerm.toLowerCase(), 'global'],
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
        } else {
            let newIndex = Math.min(selectedIndex, filteredResults.length - 1);
            let attempts = 0;
            while (filteredResults[newIndex]?.type === 'category-header' && attempts < filteredResults.length) {
                newIndex = (newIndex + 1) % filteredResults.length;
                attempts++;
            }
            if (attempts === filteredResults.length) { // All items are headers or no non-header items
                newIndex = 0;
            }
            setSelectedIndex(newIndex < 0 ? 0 : newIndex);
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
                    let attempts = 0;
                    do {
                        nextIndex = (nextIndex + 1) % filteredResults.length;
                        attempts++;
                    } while (filteredResults[nextIndex]?.type === 'category-header' && attempts < filteredResults.length);
                    return nextIndex;
                });
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => {
                    let nextIndex = prev;
                    let attempts = 0;
                    do {
                        nextIndex = (nextIndex - 1 + filteredResults.length) % filteredResults.length;
                        attempts++;
                    } while (filteredResults[nextIndex]?.type === 'category-header' && attempts < filteredResults.length);
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
        <div className="fixed inset-0 z-[100] bg-black/75 flex items-start justify-center p-4 sm:p-8 overflow-y-auto" onClick={() => setIsOpen(false)}>
            <div
                className="relative w-full max-w-2xl bg-gray-900 rounded-xl shadow-2xl mt-16 transform transition-all duration-300 scale-100 opacity-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700 flex items-center">
                    {getIcon('search', 'h-5 w-5 text-gray-400 mr-3')}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={searchConfig.placeholder || "Search agents, payments, identity, reports..."}
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

                        let typeTextColor = 'text-gray-400';
                        switch (paletteItem.type) {
                            case 'nav': typeTextColor = 'text-blue-300'; break;
                            case 'action': typeTextColor = 'text-cyan-300'; break;
                            case 'ai': typeTextColor = 'text-purple-300'; break;
                            case 'recent': typeTextColor = 'text-green-300'; break;
                            case 'general-search': typeTextColor = 'text-yellow-300'; break;
                            case 'agent-action': typeTextColor = 'text-indigo-300'; break;
                            case 'payment-action': typeTextColor = 'text-lime-300'; break;
                            case 'identity-action': typeTextColor = 'text-orange-300'; break;
                            case 'governance-action': typeTextColor = 'text-pink-300'; break;
                        }

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
                                {paletteItem.type && <span className={`ml-2 text-xs ${typeTextColor}`}>{
                                    paletteItem.type === 'nav' ? 'Navigation' :
                                    paletteItem.type === 'action' ? 'Action' :
                                    paletteItem.type === 'ai' ? 'AI Suggestion' :
                                    paletteItem.type === 'recent' ? 'Recent' :
                                    paletteItem.type === 'general-search' ? 'Global Search' :
                                    paletteItem.type === 'agent-action' ? 'Agent Cmd' :
                                    paletteItem.type === 'payment-action' ? 'Payment Cmd' :
                                    paletteItem.type === 'identity-action' ? 'Identity Cmd' :
                                    paletteItem.type === 'governance-action' ? 'Gov. Cmd' :
                                    ''
                                }</span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;