import React, { useState, useCallback, useMemo, useEffect, Fragment, useRef } from 'react';
import { useAIInsightManagement, InsightTypeIconMap, ExtendedAIInsight, AIModel, AIPerformanceMetrics, DataSourceConfig, AINotification, InsightPrioritizationRule } from '../useAIInsightManagement';

// Helper for dynamic styling based on urgency/status - keeping it simple with classes
const getUrgencyClass = (urgency: ExtendedAIInsight['urgency'] | AINotification['priority']) => {
    switch (urgency) {
        case 'critical': return 'bg-red-500 text-white';
        case 'high': return 'bg-orange-500 text-white';
        case 'medium': return 'bg-yellow-400 text-black';
        case 'low': return 'bg-green-400 text-black';
        case 'informational': return 'bg-blue-300 text-black';
        default: return 'bg-gray-300 text-black';
    }
};

const getStatusClass = (status: ExtendedAIInsight['status']) => {
    switch (status) {
        case 'active': return 'bg-blue-200 text-blue-800';
        case 'actioned': return 'bg-green-200 text-green-800';
        case 'resolved': return 'bg-emerald-200 text-emerald-800';
        case 'pending review': return 'bg-yellow-200 text-yellow-800';
        case 'dismissed': return 'bg-gray-200 text-gray-800';
        case 'archived': return 'bg-slate-200 text-slate-800';
        case 'reopened': return 'bg-red-200 text-red-800';
        default: return 'bg-gray-100 text-gray-700';
    }
};

// Basic Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', width: '90%',
                boxShadow: '0 5px 15px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
            }}>
                <h2 style={{ fontSize: '1.8em', marginBottom: '20px', color: '#333' }}>{title}</h2>
                <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>{children}</div>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        backgroundColor: '#eee', border: 'none', borderRadius: '50%',
                        width: '30px', height: '30px', cursor: 'pointer', fontSize: '1.2em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

// Main Dashboard Component
const AIInsightsDashboard = () => {
    // Harnessing the power of our AI insight management system! This is where the magic happens, folks.
    // We're pulling in all the brains, brawn, and beautiful data from our custom hook.
    // Think of it as plugging into the matrix, but with less Neo and more 'Oh my gosh, that's brilliant!' moments.
    const {
        // Core Insight Display & Actions - Your AI's daily wisdom, hot off the press!
        aiInsights, isInsightsLoading, generateDashboardInsights, dismissInsight, markInsightAsActioned,
        updateInsightStatus, addInsightAttachment,

        // AI Query Interface - Got a burning question? Ask our AI. It's better than a Magic 8-Ball, trust us.
        queryInput, setQueryInput, queryResults, isQuerying, submitAIQuery, clearQueryResults,

        // Preferences Management - Make our AI work *your* way. Customization is king (or queen)!
        preferences, handlePreferenceChange, handleSavePreferences, resetPreferences,
        availableInsightTypes, availableDataSources, availableAIModels,

        // Insight Feedback - Tell us what you think! Our AI is smart, but it loves feedback (unlike some exes).
        provideInsightFeedback,

        // AI System Performance - Peek under the hood. Everything's running smoother than a buttered cheetah!
        aiSystemStatus, aiPerformanceMetrics, getAIModelDetails, checkSystemHealth,

        // Historical Insights - The archives! Learning from the past without repeating fashion disasters.
        historicalSearchTerm, setHistoricalSearchTerm, historicalFilters, setHistoricalFilters, handleHistoricalFilterChange,
        handleHistoricalSearch, historicalSearchResults, isHistoricalLoading, historicalTotalResults,
        historicalCurrentPage, setHistoricalCurrentPage, historicalPageSize, setHistoricalPageSize,
        historicalSortBy, historicalSortOrder, handleHistoricalSortChange,

        // Collaboration Hub - Teamwork makes the dream work. Humans and AI, together at last!
        selectedCollaborationInsightId, setSelectedCollaborationInsightId, newCommentText, setNewCommentText,
        assignedUserForCollaboration, setAssignedUserForCollaboration, assignActionToUser, setAssignActionToUser,
        collaborationUsers, handleAddComment, handleAssignInsight, assignActionToUserInInsight,

        // Insight Prioritization Engine - What's important to you? Our AI wants to know!
        prioritizationRules, addPrioritizationRule, updatePrioritizationRule, deletePrioritizationRule,
        recalculateAllInsightPriorities,

        // AI Model Management - The actual brains. Don't worry, they're friendly. Mostly.
        selectedAIModelForDetails, setSelectedAIModelForDetails, isModelTesting, deployAIModel,
        compareAIModels, modelComparisonResults,

        // Notification System - Your AI's personal messenger. Keeping you in the loop, not lost in limbo.
        notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, dismissNotification,

        // Data Source Management - Fueling the genius. Clean data, brilliant insights, happy you.
        dataSourcesConfig, isDataSourceLoading, fetchDataSourceStatus, updateDataSourceConfiguration, triggerManualSync,
    } = useAIInsightManagement();

    // Local UI State - Managing the dashboard's hustle and bustle.
    const [activeTab, setActiveTab] = useState('insights');
    const [isInsightDetailsModalOpen, setIsInsightDetailsModalOpen] = useState(false);
    const [selectedInsightForDisplay, setSelectedInsightForDisplay] = useState<ExtendedAIInsight | null>(null);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
    const [isSystemHealthModalOpen, setIsSystemHealthModalOpen] = useState(false);
    const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
    const [isModelDetailsModalOpen, setIsModelDetailsModalOpen] = useState(false);
    const [isDataSourceConfigModalOpen, setIsDataSourceConfigModalOpen] = useState(false);
    const [selectedDataSourceConfig, setSelectedDataSourceConfig] = useState<DataSourceConfig | null>(null);
    const [newRuleForm, setNewRuleForm] = useState<Partial<Omit<InsightPrioritizationRule, 'id' | 'lastModified'>>>({
        name: '', isActive: true, boostFactor: 1.2, criteria: {}
    });
    const [feedbackInput, setFeedbackInput] = useState({ rating: 5, comment: '' });

    // Open an insight's full details modal. Because sometimes, you need the full story.
    const openInsightDetails = useCallback((insight: ExtendedAIInsight) => {
        setSelectedInsightForDisplay(insight);
        setIsInsightDetailsModalOpen(true);
    }, []);

    // Close the insight details modal. All good things must come to an end, even brilliant insights.
    const closeInsightDetails = useCallback(() => {
        setSelectedInsightForDisplay(null);
        setIsInsightDetailsModalOpen(false);
        setSelectedCollaborationInsightId(null); // Clear collaboration context when closing
    }, []);

    // Handle feedback submission. Let's make our AI even smarter (if that's even possible).
    const handleSubmitFeedback = useCallback((insightId: string) => {
        provideInsightFeedback(insightId, feedbackInput.rating, feedbackInput.comment, collaborationUsers[0].id, collaborationUsers[0].name);
        setFeedbackInput({ rating: 5, comment: '' });
        alert('Feedback submitted! Thanks for helping our AI grow!');
    }, [provideInsightFeedback, feedbackInput, collaborationUsers]);

    // Handle saving new prioritization rules. You're basically a super-strategist now.
    const handleSaveNewRule = useCallback(() => {
        if (newRuleForm.name && newRuleForm.boostFactor) {
            addPrioritizationRule(newRuleForm as Omit<InsightPrioritizationRule, 'id' | 'lastModified'>);
            setNewRuleForm({ name: '', isActive: true, boostFactor: 1.2, criteria: {} });
            setIsAddRuleModalOpen(false);
            alert('New prioritization rule added! Watch those insights align!');
        } else {
            alert('Rule name and boost factor are required, champ!');
        }
    }, [newRuleForm, addPrioritizationRule]);

    // Handle data source configuration update. Keeping the data flowing, like a digital river of gold!
    const handleSaveDataSourceConfig = useCallback(async () => {
        if (selectedDataSourceConfig) {
            await updateDataSourceConfiguration(selectedDataSourceConfig.id, selectedDataSourceConfig);
            setIsDataSourceConfigModalOpen(false);
        }
    }, [selectedDataSourceConfig, updateDataSourceConfiguration]);

    // Handle a specific action completion. Marking it done like a boss!
    const handleMarkRecommendedActionComplete = useCallback((insightId: string, actionId: string) => {
        markInsightAsActioned(insightId, actionId);
        alert('Action marked as completed! You\'re a productivity machine!');
        // Ideally, refresh insights or update the specific insight here
        if (selectedInsightForDisplay?.id === insightId) {
            setSelectedInsightForDisplay(prev => prev ? {
                ...prev,
                recommendedActions: prev.recommendedActions?.map(action =>
                    action.id === actionId ? { ...action, status: 'completed' } : action
                )
            } : null);
        }
    }, [markInsightAsActioned, selectedInsightForDisplay]);

    // Helper to render a single insight card - a quick glance at brilliance.
    const InsightCard = ({ insight }: { insight: ExtendedAIInsight }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col" style={{ minHeight: '280px' }}>
            <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getUrgencyClass(insight.urgency)}`}>
                    {insight.urgency.toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(insight.status || 'active')}`}>
                    {insight.status ? insight.status.replace('-', ' ').toUpperCase() : 'ACTIVE'}
                </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">
                {InsightTypeIconMap[insight.type]} {insight.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                {insight.description}
            </p>
            <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                <button
                    onClick={() => openInsightDetails(insight)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                    View Details (It's worth it!)
                </button>
            </div>
        </div>
    );

    // Helper to render a single notification item - because you need to know, without the drama.
    const NotificationItem = ({ notification }: { notification: AINotification }) => (
        <div className={`bg-white rounded-lg shadow p-4 mb-3 flex items-start ${!notification.isRead ? 'border-l-4 border-blue-500' : 'border-l-4 border-gray-200'}`}>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{notification.message}</p>
                <p className="text-sm text-gray-500 mt-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getUrgencyClass(notification.priority)} mr-2`}>
                        {notification.priority.toUpperCase()}
                    </span>
                    {new Date(notification.timestamp).toLocaleString()}
                </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                {!notification.isRead && (
                    <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Mark as Read"
                    >
                        Read
                    </button>
                )}
                <button
                    onClick={() => dismissNotification(notification.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    title="Dismiss Notification"
                >
                    Dismiss
                </button>
                {notification.link && (
                    <a href={notification.link} className="text-gray-600 hover:text-gray-900 text-sm font-medium" title="Go to Insight">
                        Go
                    </a>
                )}
            </div>
        </div>
    );

    // The entire dashboard structure. Get ready for some serious business wisdom!
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
            {/* Header: The grand welcome to your AI-powered future! */}
            <header className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-blue-700 leading-tight mb-4">
                    "The Brainiac Barometer: Your AI's Inner Thoughts, Declassified!"
                </h1>
                <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-6">
                    Ever wish your business came with a crystal ball? Well, we got something even better. This isn't just about drowning in data; it's about making that data *do* something. This dashboard is your backstage pass to what our AI is *really* thinking, helping you spot opportunities before they even know they're opportunities. Less guesswork, more 'Heck yeah, I knew that!' moments. And don't worry, it's so easy, your coffee machine will be jealous. It's time to leverage AI, not just for efficiency, but for genuine, game-changing insights that propel you forward. This is how you don't just survive in the market, you *thrive*.
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => setIsPreferencesModalOpen(true)}
                        className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md"
                    >
                        Adjust My AI Genius Settings (Seriously, Do It!)
                    </button>
                    <button
                        onClick={() => setIsSystemHealthModalOpen(true)}
                        className="bg-teal-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 transition-colors duration-200 shadow-md"
                    >
                        Check AI's Pulse (It's Healthy, Don't Worry!)
                    </button>
                </div>
            </header>

            {/* Navigation Tabs: Your guided tour through AI brilliance */}
            <nav className="mb-8 bg-white p-3 rounded-lg shadow-sm flex flex-wrap justify-center space-x-2 sm:space-x-4">
                {['insights', 'query', 'historical', 'collaboration', 'prioritization', 'models', 'notifications', 'data-sources'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-md text-lg font-medium transition-colors duration-200 ${
                            activeTab === tab
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                        {tab === 'notifications' && unreadNotificationCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                {unreadNotificationCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Main Content Area: Where the AI-powered action unfolds! */}
            <div className="dashboard-content bg-white p-8 rounded-lg shadow-xl">

                {/* Tab: Current Insights - Your daily dose of brilliance, served hot! */}
                {activeTab === 'insights' && (
                    <section className="section-dashboard-summary">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Your Daily Dose of Brilliance: Insights on Tap!
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            No more drowning in spreadsheets or guessing what's next. Our AI sifts through the noise, identifies the hidden gems, and serves up the golden nuggets of wisdom you need to make swift, impactful decisions. It's like having a team of genius analysts working 24/7, but they only ask for electricity and occasionally a software update. Bargain! This isn't just data visualization; it's *actionable intelligence* designed to elevate your strategy. We're talking about finding problems before they become crises and seizing opportunities before your competitors even smell them. This is the future of proactive business.
                        </p>
                        <div className="text-center mb-8">
                            <button
                                onClick={generateDashboardInsights}
                                disabled={isInsightsLoading}
                                className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-green-600 hover:to-green-800 transition-all duration-300 shadow-lg transform hover:scale-105"
                            >
                                {isInsightsLoading ? "Brainstorming Brilliance... (Hold On Tight!)" : "Generate Fresh Insights (Go On, Press It! Your Business Will Thank You!)"}
                            </button>
                        </div>

                        {isInsightsLoading && <p className="text-center text-blue-600 text-lg mt-4">AI is crunching numbers, predicting futures, and generally being awesome. Please wait...</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {aiInsights.length > 0 ? (
                                aiInsights.map(insight => <InsightCard key={insight.id} insight={insight} />)
                            ) : (
                                !isInsightsLoading && (
                                    <p className="col-span-full text-center text-gray-600 text-lg py-10">
                                        No active insights right now. Maybe hit that 'Generate Fresh Insights' button?
                                        Or perhaps our AI is just too good, and you've already actioned everything! You rock!
                                    </p>
                                )
                            )}
                        </div>
                    </section>
                )}

                {/* Tab: AI Query - Your personal genius, ready for Q&A. */}
                {activeTab === 'query' && (
                    <section className="section-ai-query">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Ask the Oracle (Our AI, Not That Other One)
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Got a burning question that goes beyond the current dashboard views? Want to dive deeper into a specific scenario or test a hypothesis? Type it in! Our AI isn't just passively generating insights; it's ready to engage in a dynamic conversation. Think of it as having your most knowledgeable (and non-judgmental) colleague on speed dial. No silly questions, just smarter, on-demand answers to guide your strategic thinking. This empowers you to explore possibilities and get quick answers to complex business questions without waiting for manual reports. It's about empowering your curiosity with immediate, intelligent responses.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                value={queryInput}
                                onChange={(e) => setQueryInput(e.target.value)}
                                placeholder="E.g., 'What's the predicted impact of recent supply chain disruptions on Q2 profits?'"
                                className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
                                disabled={isQuerying}
                            />
                            <button
                                onClick={() => submitAIQuery(queryInput)}
                                disabled={isQuerying || !queryInput.trim()}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                {isQuerying ? "AI Brainstorming..." : "Get AI Answer (Prepare to Be Amazed!)"}
                            </button>
                            <button
                                onClick={clearQueryResults}
                                className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                            >
                                Clear Results
                            </button>
                        </div>
                        {isQuerying && <p className="text-center text-blue-600 text-lg mt-4">AI is formulating its response. It's probably thinking about world domination... or just your query.</p>}
                        {queryResults.length > 0 && (
                            <div className="bg-gray-100 p-6 rounded-lg shadow-inner mt-6">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">AI's Wisdom Unveiled:</h3>
                                {queryResults.map((result, index) => (
                                    <p key={index} className="text-gray-800 mb-3 leading-relaxed border-l-4 border-blue-400 pl-4 py-2">
                                        {result}
                                    </p>
                                ))}
                                <p className="text-sm text-gray-500 italic mt-6">
                                    (Disclaimer: AI's answers are for strategic guidance. Always combine with human expertise and a good cup of coffee.)
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* Tab: Historical Insights - Learning from yesterday to conquer tomorrow. */}
                {activeTab === 'historical' && (
                    <section className="section-historical-archive">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            The Hall of Fame (and Shame): Past Insights
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Every insight, every action, every "Oh, that's what that meant!" moment – it's all archived here, meticulously categorized and ready for review. This isn't just a digital attic; it's a treasure trove of past brilliance (and sometimes, lessons learned the hard way). It's like a business diary, but way more useful and less likely to contain embarrassing teenage poetry. Find patterns, learn from history, and impress your boss with your newfound wisdom about how situations evolved over time. This historical context is invaluable for refining future strategies and understanding long-term trends, ensuring you're always building on success, not just starting from scratch.
                        </p>
                        <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
                            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Search & Filter Your Past Victories:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Search by keyword, title, tag..."
                                    value={historicalSearchTerm}
                                    onChange={(e) => setHistoricalSearchTerm(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <select
                                    name="type"
                                    value={historicalFilters.type}
                                    onChange={handleHistoricalFilterChange}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    {availableInsightTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>
                                <select
                                    name="urgency"
                                    value={historicalFilters.urgency}
                                    onChange={handleHistoricalFilterChange}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Urgencies</option>
                                    {['critical', 'high', 'medium', 'low', 'informational'].map(urgency => (
                                        <option key={urgency} value={urgency}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</option>
                                    ))}
                                </select>
                                <select
                                    name="status"
                                    value={historicalFilters.status}
                                    onChange={handleHistoricalFilterChange}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Statuses</option>
                                    {['active', 'actioned', 'resolved', 'dismissed', 'archived', 'pending review'].map(status => (
                                        <option key={status} value={status}>{status.replace('-', ' ').charAt(0).toUpperCase() + status.replace('-', ' ').slice(1)}</option>
                                    ))}
                                </select>
                                <label className="flex items-center space-x-2">
                                    <span>From:</span>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={historicalFilters.startDate}
                                        onChange={handleHistoricalFilterChange}
                                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                                    />
                                </label>
                                <label className="flex items-center space-x-2">
                                    <span>To:</span>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={historicalFilters.endDate}
                                        onChange={handleHistoricalFilterChange}
                                        className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
                                    />
                                </label>
                                <select
                                    name="sortBy"
                                    value={historicalSortBy}
                                    onChange={(e) => handleHistoricalSortChange(e.target.value, historicalSortOrder)}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="timestamp">Sort by Date</option>
                                    <option value="urgency">Sort by Urgency</option>
                                    <option value="impactScore">Sort by Impact</option>
                                    <option value="priorityScore">Sort by Priority</option>
                                </select>
                                <select
                                    name="sortOrder"
                                    value={historicalSortOrder}
                                    onChange={(e) => handleHistoricalSortChange(historicalSortBy, e.target.value as 'asc' | 'desc')}
                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>

                        {isHistoricalLoading && <p className="text-center text-blue-600 text-lg mt-4">Rummaging through the archives... patience, grasshopper!</p>}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {historicalSearchResults.length > 0 ? (
                                historicalSearchResults.map(insight => <InsightCard key={insight.id} insight={insight} />)
                            ) : (
                                !isHistoricalLoading && (
                                    <p className="col-span-full text-center text-gray-600 text-lg py-10">
                                        No historical insights match your criteria. Time to make some new history, perhaps? Or adjust those filters!
                                    </p>
                                )
                            )}
                        </div>
                        {historicalTotalResults > historicalPageSize && (
                            <div className="flex justify-center mt-8 space-x-4">
                                <button
                                    onClick={() => setHistoricalCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={historicalCurrentPage === 1}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Previous
                                </button>
                                <span className="flex items-center text-lg">
                                    Page {historicalCurrentPage} of {Math.ceil(historicalTotalResults / historicalPageSize)}
                                </span>
                                <button
                                    onClick={() => setHistoricalCurrentPage(prev => Math.min(Math.ceil(historicalTotalResults / historicalPageSize), prev + 1))}
                                    disabled={historicalCurrentPage === Math.ceil(historicalTotalResults / historicalPageSize)}
                                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                >
                                    Next
                                </button>
                                <select
                                    value={historicalPageSize}
                                    onChange={(e) => setHistoricalPageSize(Number(e.target.value))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                </select>
                            </div>
                        )}
                    </section>
                )}

                {/* Tab: Collaboration Hub - Where humans and AI co-create greatness! */}
                {activeTab === 'collaboration' && (
                    <section className="section-collaboration-hub">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Team Up with the Brains (Human & AI Edition)
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Insights are fantastic, but *action* is where the real magic happens. This is your digital war room where brilliant humans and our even more brilliant AI play nicely, turning 'aha!' moments into 'cha-ching!' results. Discuss, delegate, and conquer complex challenges together, ensuring every insight gets the attention and execution it deserves. No more insights sitting in a silo; this is about breaking down barriers and fostering a truly collaborative environment. It's how you amplify the intelligence of your team with the analytical power of AI, making every decision a shared victory.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Insights for Discussion:</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                    {aiInsights.length > 0 ? (
                                        aiInsights.map(insight => (
                                            <div
                                                key={insight.id}
                                                onClick={() => setSelectedCollaborationInsightId(insight.id)}
                                                className={`p-4 border rounded-md cursor-pointer hover:bg-gray-200 transition-colors ${selectedCollaborationInsightId === insight.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                            >
                                                <h4 className="font-semibold text-lg text-gray-800">{insight.title}</h4>
                                                <p className="text-sm text-gray-600">{insight.description.substring(0, 100)}...</p>
                                                {insight.assignedTo && insight.assignedTo.length > 0 && (
                                                    <p className="text-xs text-blue-700 mt-2">
                                                        Assigned to: {insight.assignedTo.map(a => a.name).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No insights to collaborate on. Time to generate some!</p>
                                    )}
                                </div>
                            </div>

                            {selectedCollaborationInsightId && (
                                <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
                                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">Discussion & Actions for "{aiInsights.find(i => i.id === selectedCollaborationInsightId)?.title || 'Selected Insight'}"</h3>
                                    <div className="max-h-96 overflow-y-auto pr-2 mb-4">
                                        {(aiInsights.find(i => i.id === selectedCollaborationInsightId)?.comments || []).length > 0 ? (
                                            aiInsights.find(i => i.id === selectedCollaborationInsightId)?.comments?.map(comment => (
                                                <div key={comment.id} className="mb-3 p-3 bg-white rounded-md border border-gray-200">
                                                    <p className="text-sm font-semibold text-blue-700">{comment.userName} <span className="text-gray-500 font-normal text-xs ml-2">{new Date(comment.timestamp).toLocaleString()}</span></p>
                                                    <p className="text-gray-800 mt-1">{comment.text}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-600">No comments yet. Be the first to spark a conversation!</p>
                                        )}
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            value={newCommentText}
                                            onChange={(e) => setNewCommentText(e.target.value)}
                                            placeholder="Add a brilliant comment or question..."
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                                        ></textarea>
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!newCommentText.trim()}
                                            className="mt-2 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm"
                                        >
                                            Post Comment
                                        </button>
                                    </div>

                                    {/* Insight Assignment */}
                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                        <h4 className="font-semibold text-blue-800 mb-2">Assign Insight to Team:</h4>
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <select
                                                value={assignedUserForCollaboration}
                                                onChange={(e) => setAssignedUserForCollaboration(e.target.value)}
                                                className="p-2 border border-blue-300 rounded-md flex-grow"
                                            >
                                                <option value="">Select Team Member</option>
                                                {collaborationUsers.map(user => (
                                                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleAssignInsight}
                                                disabled={!assignedUserForCollaboration}
                                                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                                            >
                                                Assign Insight
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Assignment - because every recommended action needs a hero! */}
                                    {(selectedInsightForDisplay?.recommendedActions && selectedInsightForDisplay.recommendedActions.filter(a => a.status !== 'completed').length > 0) && (
                                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <h4 className="font-semibold text-yellow-800 mb-2">Assign Recommended Actions:</h4>
                                            {selectedInsightForDisplay.recommendedActions?.filter(a => a.status !== 'completed').map(action => (
                                                <div key={action.id} className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-white rounded-md shadow-sm">
                                                    <span className="font-medium flex-grow">{action.description}</span>
                                                    <select
                                                        value={assignActionToUser?.actionId === action.id ? assignActionToUser.userId : ''}
                                                        onChange={(e) => setAssignActionToUser({ actionId: action.id, userId: e.target.value })}
                                                        className="p-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="">Assign To...</option>
                                                        {collaborationUsers.map(user => (
                                                            <option key={user.id} value={user.id}>{user.name}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => assignActionToUserInInsight(selectedCollaborationInsightId, action.id, assignActionToUser?.userId || '')}
                                                        disabled={assignActionToUser?.actionId !== action.id || !assignActionToUser.userId}
                                                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm"
                                                    >
                                                        Assign
                                                    </button>
                                                    <button
                                                        onClick={() => handleMarkRecommendedActionComplete(selectedCollaborationInsightId, action.id)}
                                                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors duration-200 text-sm"
                                                    >
                                                        Mark Done!
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Tab: Prioritization Engine - You're the conductor of this AI symphony! */}
                {activeTab === 'prioritization' && (
                    <section className="section-prioritization-engine">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Your Wish is Our AI's Command: Insight Prioritization Rules
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Ever felt like some insights just scream for attention more than others? Our AI agrees! This is where you become the maestro, conducting your AI to highlight what truly matters most to *your* business. Got a critical risk alert? Boost it! A high-impact opportunity? Amplify it! It's like giving your assistant superpowers, but without the cape (unless you provide one, we're not judging). By customizing these prioritization rules, you ensure your team's focus is always aligned with your strategic objectives, cutting through the noise to the signals that drive success. This is about strategic steering, not just reactive responses.
                        </p>
                        <div className="flex justify-center mb-8 space-x-4">
                            <button
                                onClick={() => setIsAddRuleModalOpen(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                            >
                                Add New Super-Rule!
                            </button>
                            <button
                                onClick={recalculateAllInsightPriorities}
                                className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md"
                            >
                                Recalculate All Priorities (Feel the Power!)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prioritizationRules.length > 0 ? (
                                prioritizationRules.map(rule => (
                                    <div key={rule.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{rule.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3">Boost Factor: <span className="font-semibold">{rule.boostFactor}x</span></p>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Status: <span className={`font-semibold ${rule.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                {rule.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Criteria: {Object.entries(rule.criteria).map(([key, val]) =>
                                                val && `${key}: ${(Array.isArray(val) ? val.join(', ') : val)}`
                                            ).filter(Boolean).join('; ')}
                                        </p>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => updatePrioritizationRule(rule.id, { isActive: !rule.isActive })}
                                                className={`px-4 py-2 rounded-md text-white text-sm font-medium ${rule.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                                            >
                                                {rule.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => deletePrioritizationRule(rule.id)}
                                                className="px-4 py-2 rounded-md bg-gray-400 text-white text-sm font-medium hover:bg-gray-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-600 text-lg py-10">
                                    No custom prioritization rules set yet. Let's create some to shape your AI's focus!
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Tab: AI Model Management - Meet the unsung heroes of your data! */}
                {activeTab === 'models' && (
                    <section className="section-ai-model-management">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Under the Hood: Meet the Brains of the Operation
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            These are the powerful AI models working tirelessly behind the scenes, crunching numbers, spotting patterns, and predicting the future. Think of them as the super-athletes of data processing. We let them lift the heavy data, so you can lift a celebratory glass. They're doing great, but you can always peek in, see their performance stats, compare their capabilities, and even deploy a new champion! This transparency and control over your AI models isn't just cool; it's essential for trust, optimization, and staying ahead of the curve. It means you're investing in a robust, evolving intelligence.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {availableAIModels.map(model => (
                                <div key={model.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{model.name} <span className="text-sm font-normal text-gray-500">v{model.version}</span></h3>
                                    <p className="text-sm text-gray-600 mb-3 flex-grow">{model.description}</p>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${model.status === 'active' ? 'bg-green-200 text-green-800' : model.status === 'training' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {model.status.toUpperCase()}
                                        </span>
                                        <span className="text-gray-500">Updated: {new Date(model.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-auto flex justify-end space-x-3">
                                        <button
                                            onClick={() => { setSelectedAIModelForDetails(model.id); setIsModelDetailsModalOpen(true); }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => deployAIModel(model.id)}
                                            disabled={isModelTesting || model.status === 'active'}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm disabled:opacity-50"
                                        >
                                            {isModelTesting && selectedAIModelForDetails === model.id ? 'Deploying...' : 'Deploy'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-100 p-6 rounded-lg shadow-sm mt-8">
                            <h3 className="text-2xl font-semibold text-gray-700 mb-4">AI Model Face-Off! (Comparison)</h3>
                            <p className="text-md text-gray-700 mb-4">
                                Can't decide which model is the MVP? Let's put them to the test! Select a few of your favorites and see how they stack up against each other. It's like a scientific cage match, but for data. Choose wisely, the future of your insights depends on it! (Just kidding, they're all pretty great.)
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <select
                                    multiple
                                    value={[]} // Controlled internally for demonstration
                                    onChange={(e) => {
                                        const selectedOptions = Array.from(e.target.options).filter(opt => opt.selected).map(opt => opt.value);
                                        // For simplicity, directly comparing selected models
                                        compareAIModels(selectedOptions);
                                    }}
                                    className="p-3 border border-gray-300 rounded-md shadow-sm text-base h-32 flex-grow"
                                >
                                    <option disabled>Select models to compare</option>
                                    {availableAIModels.map(model => (
                                        <option key={model.id} value={model.id}>{model.name} v{model.version}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => compareAIModels(availableAIModels.slice(0, 2).map(m => m.id))} // Example: Compare first two
                                    disabled={isModelTesting}
                                    className="bg-orange-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-orange-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                                >
                                    {isModelTesting ? 'Comparing Brains...' : 'Run Comparison!'}
                                </button>
                            </div>
                            {isModelTesting && <p className="text-center text-orange-600 text-lg mt-4">Models are duking it out behind the scenes. May the best algorithm win!</p>}
                            {modelComparisonResults.length > 0 && (
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modelComparisonResults.map(result => (
                                        <div key={result.modelId} className="bg-white p-4 rounded-md shadow-sm border border-orange-200">
                                            <h4 className="font-bold text-orange-800 text-lg mb-2">
                                                {availableAIModels.find(m => m.id === result.modelId)?.name || 'Unknown Model'}
                                            </h4>
                                            <p className="text-gray-700 text-sm">Insights Generated: <span className="font-semibold">{result.insightsGenerated.toLocaleString()}</span></p>
                                            <p className="text-gray-700 text-sm">Average Accuracy: <span className="font-semibold">{(result.avgAccuracy * 100).toFixed(2)}%</span></p>
                                            <p className="text-sm text-gray-500 italic mt-2">
                                                (These numbers are just to show off, they're pretty darn good!)
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Tab: Notification System - Your AI's personal messenger. */}
                {activeTab === 'notifications' && (
                    <section className="section-notifications">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Your Personal AI Whisperer: Notifications!
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Never miss a beat, or a critical insight. Our AI will give you the heads-up on the really important stuff, ensuring you're always in the loop and never lost in limbo. It's like having a very polite, incredibly smart friend tapping you on the shoulder and saying, "Hey, you might want to see this!" These aren't just annoying pop-ups; they're tailored alerts designed to bring timely, actionable intelligence directly to your attention, enabling rapid response and informed decision-making. No more sifting through emails; just clear, concise updates that respect your time.
                        </p>
                        <div className="flex justify-center mb-8 space-x-4">
                            <button
                                onClick={markAllNotificationsAsRead}
                                disabled={unreadNotificationCount === 0}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                            >
                                Mark All as Read (Feeling Efficient?)
                            </button>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))
                            ) : (
                                <p className="text-center text-gray-600 text-lg py-10">
                                    All quiet on the notification front! Enjoy the peace, or go generate some new insights to stir things up!
                                </p>
                            )}
                        </div>
                    </section>
                )}

                {/* Tab: Data Source Management - Fueling the genius! */}
                {activeTab === 'data-sources' && (
                    <section className="section-data-sources">
                        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">
                            Fueling the Genius: Data Sources Unleashed
                        </h2>
                        <p className="text-md text-gray-700 max-w-3xl mx-auto mb-8 text-center">
                            Our AI is only as smart as the data it gets. This is where we ensure those data pipelines are flowing smoothly, clean, and happy. Think of it as the AI's gourmet kitchen – fresh, quality ingredients lead to Michelin-star insights! Keeping these connections robust and optimized is crucial because happy data makes for brilliant insights, and brilliant insights make you look like a genius. It's a win-win-win! This comprehensive view and control over your data sources ensure that your AI always has the most accurate, real-time information to work with, guaranteeing the relevance and power of every insight. This is foundational for intelligent operations.
                        </p>
                        {isDataSourceLoading && <p className="text-center text-blue-600 text-lg mb-4">Checking connections, ensuring data happiness...</p>}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dataSourcesConfig.map(ds => (
                                <div key={ds.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{ds.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3 flex-grow">{ds.description}</p>
                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ds.status === 'connected' ? 'bg-green-200 text-green-800' : ds.status === 'error' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                            {ds.status.toUpperCase()}
                                        </span>
                                        <span className="text-gray-500">Last Sync: {ds.lastSync === 'N/A' ? ds.lastSync : new Date(ds.lastSync).toLocaleString()}</span>
                                    </div>
                                    <div className="mt-auto flex justify-end space-x-3">
                                        <button
                                            onClick={() => fetchDataSourceStatus(ds.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                                        >
                                            Check Status
                                        </button>
                                        <button
                                            onClick={() => { setSelectedDataSourceConfig(ds); setIsDataSourceConfigModalOpen(true); }}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm"
                                        >
                                            Configure
                                        </button>
                                        <button
                                            onClick={() => triggerManualSync(ds.id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm"
                                        >
                                            Manual Sync
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Modals - Because sometimes, you need a closer look, or to tweak things just right. */}

            {/* Insight Details Modal - Dive deep into that brilliance! */}
            <Modal isOpen={isInsightDetailsModalOpen} onClose={closeInsightDetails} title={`Insight Details: ${selectedInsightForDisplay?.title || 'Loading...'}`}>
                {selectedInsightForDisplay ? (
                    <div className="space-y-4">
                        <p className="text-xl font-bold text-blue-700">{selectedInsightForDisplay.title}</p>
                        <p className="text-gray-700 leading-relaxed">{selectedInsightForDisplay.description}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className={`px-3 py-1 rounded-full text-white ${getUrgencyClass(selectedInsightForDisplay.urgency)}`}>
                                Urgency: {selectedInsightForDisplay.urgency.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-white ${getStatusClass(selectedInsightForDisplay.status || 'active')}`}>
                                Status: {(selectedInsightForDisplay.status || 'active').replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Type: {selectedInsightForDisplay.type.charAt(0).toUpperCase() + selectedInsightForDisplay.type.slice(1)}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                Source: {selectedInsightForDisplay.source}
                            </span>
                        </div>
                        {selectedInsightForDisplay.explanation && (
                            <div>
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-blue-800">AI's Thought Process (XAI):</h3>
                                <p className="bg-blue-50 p-3 rounded-md border border-blue-200 leading-relaxed">{selectedInsightForDisplay.explanation}</p>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (Yes, our AI even explains itself. It's very polite.)
                                </p>
                            </div>
                        )}
                        {selectedInsightForDisplay.recommendedActions && selectedInsightForDisplay.recommendedActions.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-green-800">Recommended Actions (Go forth and conquer!):</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {selectedInsightForDisplay.recommendedActions.map(action => (
                                        <li key={action.id} className={`p-2 rounded-md ${action.status === 'completed' ? 'bg-green-100 line-through text-gray-500' : 'bg-white border border-gray-200'}`}>
                                            {action.description}
                                            {action.assignedTo && <span className="ml-2 text-blue-700"> (Assigned to: {collaborationUsers.find(u => u.id === action.assignedTo)?.name || action.assignedTo})</span>}
                                            {action.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleMarkRecommendedActionComplete(selectedInsightForDisplay.id, action.id)}
                                                    className="ml-3 px-3 py-1 bg-emerald-500 text-white rounded-md text-xs hover:bg-emerald-600 transition-colors"
                                                >
                                                    Mark Done
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (Our AI doesn't just tell you what's happening, it tells you what to *do* about it. Talk about service!)
                                </p>
                            </div>
                        )}
                         {selectedInsightForDisplay.comments && selectedInsightForDisplay.comments.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Discussion & Collaboration:</h3>
                                <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200">
                                {selectedInsightForDisplay.comments.map(comment => (
                                    <div key={comment.id} className="mb-2 p-2 bg-white rounded-md border border-gray-100">
                                        <p className="text-sm font-semibold text-blue-700">{comment.userName} <span className="text-gray-500 font-normal text-xs ml-2">{new Date(comment.timestamp).toLocaleString()}</span></p>
                                        <p className="text-gray-800 mt-1">{comment.text}</p>
                                    </div>
                                ))}
                                </div>
                                <p className="text-xs italic text-gray-500 mt-2">
                                    (This is where the human genius meets AI insights. A beautiful partnership!)
                                </p>
                            </div>
                        )}

                        {/* Insight Feedback Section - because even AI needs a little love (or constructive criticism). */}
                        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Provide Feedback (Help us make AI even better!):</h3>
                            <div className="flex items-center space-x-3 mb-3">
                                <label className="text-gray-700 font-medium">Rating:</label>
                                <select
                                    value={feedbackInput.rating}
                                    onChange={(e) => setFeedbackInput(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                    className="p-2 border border-gray-300 rounded-md"
                                >
                                    {[1, 2, 3, 4, 5].map(rating => <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>)}
                                </select>
                            </div>
                            <textarea
                                value={feedbackInput.comment}
                                onChange={(e) => setFeedbackInput(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your thoughts on this insight... be nice, our AI has feelings (probably)."
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                            ></textarea>
                            <button
                                onClick={() => handleSubmitFeedback(selectedInsightForDisplay.id)}
                                disabled={!feedbackInput.comment.trim()}
                                className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
                            >
                                Submit Feedback
                            </button>
                            <p className="text-xs italic text-gray-500 mt-2">
                                (Your input directly trains our AI to be more aligned with your business needs. You're basically an AI trainer now!)
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading insight details... or perhaps the AI is taking a coffee break.</p>
                )}
            </Modal>

            {/* AI Preferences Modal - Fine-tune your genius! */}
            <Modal isOpen={isPreferencesModalOpen} onClose={() => setIsPreferencesModalOpen(false)} title="Fine-Tune Your Genius: AI Preferences">
                <p className="text-md text-gray-700 mb-6 leading-relaxed">
                    This is where you tell our AI exactly how you like your insights served: hot, fresh, and perfectly tailored to your taste. Customize away, maestro! Adjust everything from the types of insights you prioritize to how you receive notifications. This level of granular control ensures that the AI is always working in perfect harmony with your strategic focus and operational rhythms. It’s not just about what the AI can do; it’s about what the AI can do *for you*, precisely how you need it. This personalization is key to unlocking its full, transformative potential.
                </p>
                <div className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Favorite Insight Types (Pick Your Brain Food!):</label>
                        <select
                            name="insightTypes"
                            multiple
                            value={preferences.insightTypes}
                            onChange={handlePreferenceChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-48 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {availableInsightTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)} ({InsightTypeIconMap[type]})
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            (Tell our AI which insights make your strategic heart sing. It'll pay extra attention to these!)
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Urgency Threshold (What's Your 'Drop Everything' Level?):</label>
                        <select
                            name="urgencyThreshold"
                            value={preferences.urgencyThreshold}
                            onChange={handlePreferenceChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {['informational', 'low', 'medium', 'high', 'critical'].map(urgency => (
                                <option key={urgency} value={urgency}>{urgency.charAt(0).toUpperCase() + urgency.slice(1)}</option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            (Set the bar for what really needs your immediate attention. No more false alarms, just focused brilliance.)
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Preferred AI Model (Choose Your Champion!):</label>
                        <select
                            name="modelSelection"
                            value={preferences.modelSelection}
                            onChange={handlePreferenceChange}
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            {availableAIModels.map(model => (
                                <option key={model.id} value={model.id}>
                                    {model.name} v{model.version} ({model.status.charAt(0).toUpperCase() + model.status.slice(1)})
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500 mt-2">
                            (Pick the AI brain that best suits your needs – some are speed demons, some are deep thinkers!)
                        </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-3">Notification Settings (How do you like your pings?):</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="notificationSettings.email"
                                    checked={preferences.notificationSettings.email}
                                    onChange={handlePreferenceChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">Email Me (For when you're not glued to the dashboard)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="notificationSettings.push"
                                    checked={preferences.notificationSettings.push}
                                    onChange={handlePreferenceChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">Push Notifications (Instant updates, like a digital tap on the shoulder)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="notificationSettings.sms"
                                    checked={preferences.notificationSettings.sms}
                                    onChange={handlePreferenceChange}
                                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">SMS Alerts (Only for the REALLY critical stuff!)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <span className="text-gray-700">Notification Threshold:</span>
                                <select
                                    name="notificationSettings.threshold"
                                    value={preferences.notificationSettings.threshold}
                                    onChange={handlePreferenceChange}
                                    className="p-2 border border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="all">All Insights</option>
                                    <option value="medium">Medium +</option>
                                    <option value="high">High +</option>
                                    <option value="critical">Critical Only</option>
                                </select>
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            (Control the noise! Only get pinged when it truly matters, because your focus is gold.)
                        </p>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">Refresh Interval (How fresh do you like your insights?):</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                name="refreshIntervalMinutes"
                                value={preferences.refreshIntervalMinutes}
                                onChange={handlePreferenceChange}
                                min="1"
                                className="w-24 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <span className="text-gray-700">Minutes</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            (Our AI is always watching, but you get to decide how often it whispers sweet nothings (aka insights) into your ear.)
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={resetPreferences}
                        className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                    >
                        Reset to Defaults (If you dare!)
                    </button>
                    <button
                        onClick={handleSavePreferences}
                        className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                    >
                        Save My AI Masterpiece!
                    </button>
                </div>
            </Modal>

            {/* AI System Health Modal - All systems go! */}
            <Modal isOpen={isSystemHealthModalOpen} onClose={() => setIsSystemHealthModalOpen(false)} title="The AI Engine Room: Performance Metrics">
                <p className="text-md text-gray-700 mb-6 leading-relaxed">
                    All green lights here! Or, well, mostly green. This is where we monitor our AI's vital signs, ensuring it's always running at peak performance to deliver those gold-standard insights. It's always working hard, processing mountains of data so you don't have to. You can just sit back, enjoy the show, and rest assured your intelligent assistant is always on the job. A healthy AI means healthy insights, and healthy insights mean a healthier bottom line. We're talking about robust, reliable, and continuously optimized intelligence working for you 24/7.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                        <h3 className="font-bold text-blue-800 text-lg mb-2">Overall Status: <span className="text-green-600">{aiSystemStatus.toUpperCase()}</span></h3>
                        <p className="text-gray-700 text-sm">Last Heartbeat: {new Date(aiPerformanceMetrics.lastHeartbeat).toLocaleString()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
                        <h3 className="font-bold text-purple-800 text-lg mb-2">Insight Generation Rate:</h3>
                        <p className="text-gray-700 text-sm">{aiPerformanceMetrics.insightGenerationRate.toFixed(1)} Insights/minute</p>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-md border border-teal-200">
                        <h3 className="font-bold text-teal-800 text-lg mb-2">Average Response Time:</h3>
                        <p className="text-gray-700 text-sm">{aiPerformanceMetrics.averageResponseTime.toFixed(0)} ms</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h3 className="font-bold text-yellow-800 text-lg mb-2">Data Processing Volume:</h3>
                        <p className="text-gray-700 text-sm">{aiPerformanceMetrics.dataProcessingVolume.toFixed(2)} GB/hour</p>
                    </div>
                </div>
                <div className="bg-gray-100 p-4 rounded-md border border-gray-200 mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Resource Utilization (The AI's workload):</h3>
                    <p className="text-gray-700 text-sm">CPU: {aiPerformanceMetrics.resourceUtilization.cpu.toFixed(1)}%</p>
                    <p className="text-gray-700 text-sm">Memory: {aiPerformanceMetrics.resourceUtilization.memory.toFixed(1)}%</p>
                    {aiPerformanceMetrics.resourceUtilization.gpu && (
                        <p className="text-gray-700 text-sm">GPU: {aiPerformanceMetrics.resourceUtilization.gpu.toFixed(1)}%</p>
                    )}
                </div>
                <button
                    onClick={checkSystemHealth}
                    className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                >
                    Run Quick Health Check (Just to be sure!)
                </button>
                <p className="text-xs italic text-gray-500 mt-4">
                    (Our AI is designed to be resilient, but a little check-up never hurt anyone. Except maybe the bugs we squash!)
                </p>
            </Modal>

            {/* Add Prioritization Rule Modal - Become an AI rule-making guru! */}
            <Modal isOpen={isAddRuleModalOpen} onClose={() => setIsAddRuleModalOpen(false)} title="Craft a New Super-Rule!">
                <p className="text-md text-gray-700 mb-6 leading-relaxed">
                    Let's make some insights *really* pop. Add a rule to tell our AI exactly what kind of brilliance you want amplified. Do certain types of insights need more attention? Should critical risks get an extra boost? This is your chance to explicitly tell the AI what's paramount to your business objectives. This mechanism ensures that the AI's output is not just intelligent, but *strategically aligned* with your most pressing needs, making your decision-making processes even more targeted and effective. You're not just observing; you're *directing* the intelligence.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Rule Name (Make it snappy!):</label>
                        <input
                            type="text"
                            value={newRuleForm.name || ''}
                            onChange={(e) => setNewRuleForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="E.g., 'Boost Critical Financial Risks'"
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Boost Factor (How much oomph does it need? E.g., 1.5 for 50% more priority):</label>
                        <input
                            type="number"
                            step="0.1"
                            value={newRuleForm.boostFactor || 1.2}
                            onChange={(e) => setNewRuleForm(prev => ({ ...prev, boostFactor: Number(e.target.value) }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-1">Criteria (When does this rule kick in?):</label>
                        <p className="text-sm text-gray-500 mb-2">(Select specific conditions to trigger this priority boost.)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-md font-medium text-gray-600 mb-1">Insight Types:</label>
                                <select
                                    multiple
                                    value={newRuleForm.criteria?.type || []}
                                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, criteria: { ...prev.criteria, type: Array.from(e.target.options).filter(o => o.selected).map(o => o.value) } }))}
                                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                                >
                                    {availableInsightTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-md font-medium text-gray-600 mb-1">Urgencies:</label>
                                <select
                                    multiple
                                    value={newRuleForm.criteria?.urgency || []}
                                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, criteria: { ...prev.criteria, urgency: Array.from(e.target.options).filter(o => o.selected).map(o => o.value) as any } }))}
                                    className="w-full p-2 border border-gray-300 rounded-md h-24"
                                >
                                    {['critical', 'high', 'medium', 'low', 'informational'].map(urgency => <option key={urgency} value={urgency}>{urgency}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-md font-medium text-gray-600 mb-1">Minimum Impact Score:</label>
                                <input
                                    type="number"
                                    value={newRuleForm.criteria?.minImpactScore || ''}
                                    onChange={(e) => setNewRuleForm(prev => ({ ...prev, criteria: { ...prev.criteria, minImpactScore: Number(e.target.value) } }))}
                                    placeholder="e.g., 75"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            {/* Add more criteria fields as needed: source, tags, keywords etc. */}
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={() => setIsAddRuleModalOpen(false)}
                        className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                    >
                        Cancel (No masterpiece today!)
                    </button>
                    <button
                        onClick={handleSaveNewRule}
                        className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                    >
                        Save New Rule (Unleash the priority!)
                    </button>
                </div>
            </Modal>

            {/* AI Model Details Modal - Get up close and personal with a digital brain! */}
            <Modal isOpen={isModelDetailsModalOpen} onClose={() => setIsModelDetailsModalOpen(false)} title={`AI Model Details: ${getAIModelDetails(selectedAIModelForDetails || '')?.name || 'Unknown Model'}`}>
                {selectedAIModelForDetails ? (() => {
                    const model = getAIModelDetails(selectedAIModelForDetails);
                    if (!model) return <p className="text-gray-600">Model details not found. Did it sneak off for a coffee break?</p>;

                    return (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-blue-700">{model.name} <span className="text-sm font-normal text-gray-500">v{model.version}</span></h3>
                            <p className="text-gray-700 leading-relaxed">{model.description}</p>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className={`px-3 py-1 rounded-full text-white ${model.status === 'active' ? 'bg-green-500' : model.status === 'training' ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                                    Status: {model.status.toUpperCase()}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                    Deployment Date: {new Date(model.deploymentDate).toLocaleDateString()}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                                    Last Updated: {new Date(model.lastUpdated).toLocaleDateString()}
                                </span>
                            </div>
                            {model.performanceMetrics && (
                                <div className="p-4 bg-purple-50 rounded-md border border-purple-200">
                                    <h4 className="font-semibold text-purple-800 text-lg mb-2">Performance Metrics:</h4>
                                    <p className="text-gray-700 text-sm">Accuracy: <span className="font-semibold">{(model.performanceMetrics.accuracy * 100).toFixed(2)}%</span></p>
                                    <p className="text-gray-700 text-sm">Precision: <span className="font-semibold">{(model.performanceMetrics.precision * 100).toFixed(2)}%</span></p>
                                    <p className="text-gray-700 text-sm">Recall: <span className="font-semibold">{(model.performanceMetrics.recall * 100).toFixed(2)}%</span></p>
                                    <p className="text-gray-700 text-sm">F1 Score: <span className="font-semibold">{(model.performanceMetrics.f1_score * 100).toFixed(2)}%</span></p>
                                    <p className="text-xs italic text-gray-500 mt-2">
                                        (These numbers mean it's doing a really, *really* good job. Like, "employee of the month" good!)
                                    </p>
                                </div>
                            )}
                            {model.trainingDataInfo && (
                                <div className="p-4 bg-teal-50 rounded-md border border-teal-200">
                                    <h4 className="font-semibold text-teal-800 text-lg mb-2">Training Data Info:</h4>
                                    <p className="text-gray-700 text-sm">Size: <span className="font-semibold">{model.trainingDataInfo.sizeGB} GB</span></p>
                                    <p className="text-gray-700 text-sm">Last Refresh: <span className="font-semibold">{new Date(model.trainingDataInfo.lastRefresh).toLocaleDateString()}</span></p>
                                    <p className="text-gray-700 text-sm">Bias Detected: <span className={`font-semibold ${model.trainingDataInfo.biasDetected ? 'text-red-600' : 'text-green-600'}`}>{model.trainingDataInfo.biasDetected ? 'Yes (Managed)' : 'No'}</span></p>
                                    <p className="text-xs italic text-gray-500 mt-2">
                                        (We keep an eye on everything, even the data's manners. Bias is like glitter, it gets everywhere, but we clean it up!)
                                    </p>
                                </div>
                            )}
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => deployAIModel(model.id)}
                                    disabled={model.status === 'active' || isModelTesting}
                                    className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50"
                                >
                                    {isModelTesting && selectedAIModelForDetails === model.id ? 'Deploying...' : 'Deploy Model'}
                                </button>
                            </div>
                        </div>
                    );
                })() : <p className="text-center text-gray-600">Selecting model for details... or maybe it's just shy.</p>}
            </Modal>

            {/* Data Source Configuration Modal - Nurturing your AI's food source. */}
            <Modal isOpen={isDataSourceConfigModalOpen} onClose={() => setIsDataSourceConfigModalOpen(false)} title={`Configure Data Source: ${selectedDataSourceConfig?.name || 'Unknown Source'}`}>
                {selectedDataSourceConfig ? (
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed text-md mb-4">
                            This is where you can fine-tune the connection and behavior of your data sources. Ensuring these sources are optimized and connected reliably is paramount, as they are the lifeblood of our AI. Happy, healthy data streams mean more accurate, timely, and impactful insights. It’s like tending to a garden; well-nourished plants (data) yield the best fruits (insights). This management ensures the AI always has the freshest, most relevant information to work with, keeping your strategic decisions grounded in reality and primed for success.
                        </p>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Data Source Name:</label>
                            <input
                                type="text"
                                value={selectedDataSourceConfig.name}
                                onChange={(e) => setSelectedDataSourceConfig(prev => prev ? { ...prev, name: e.target.value } : null)}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Description:</label>
                            <textarea
                                value={selectedDataSourceConfig.description}
                                onChange={(e) => setSelectedDataSourceConfig(prev => prev ? { ...prev, description: e.target.value } : null)}
                                rows={3}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Refresh Interval (Minutes):</label>
                            <input
                                type="number"
                                value={selectedDataSourceConfig.refreshIntervalMinutes}
                                onChange={(e) => setSelectedDataSourceConfig(prev => prev ? { ...prev, refreshIntervalMinutes: Number(e.target.value) } : null)}
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-1">Type:</label>
                            <span className="p-3 bg-gray-100 rounded-md block text-gray-800">{selectedDataSourceConfig.type.toUpperCase()} (Read-only for security)</span>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => setIsDataSourceConfigModalOpen(false)}
                                className="bg-gray-400 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-500 transition-colors duration-200 shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveDataSourceConfig}
                                className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 shadow-md"
                            >
                                Save Configuration
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">Loading data source configuration...</p>
                )}
            </Modal>
        </div>
    );
};

export default AIInsightsDashboard;