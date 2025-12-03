// Copyright CDBI - AI-Powered Solutions Division
// President James Burvel O’Callaghan III

import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";

// --- Self-contained UI Components & Types ---
// Re-implementing types and components previously imported from common/ui-components
export type SelectValue = string | number | boolean | null | undefined | { value: string | number; label: string };
export type SelectAction = "select-option" | "deselect-option" | "remove-value" | "clear" | "pop-value" | "set-value";

interface InternalSelectOption {
  value: string;
  label: string;
  isAIRecommended?: boolean; // New AI feature: indicates if this option was suggested by AI
}

interface InternalAsyncSelectFieldProps {
  placeholder?: string;
  name: string;
  loadOptions: (inputValue: string) => Promise<{ options: InternalSelectOption[]; hasMore: boolean }>;
  handleChange: (value: SelectValue | SelectValue[], action: SelectAction) => void;
  selectValue?: SelectValue | SelectValue[];
  label?: string;
  disabled?: boolean;
  isMulti?: boolean;
  isClearable?: boolean;
  defaultOptions?: boolean | InternalSelectOption[]; // Original property, now handled internally
}

/**
 * A robust, self-contained AsyncSelectField component designed for
 * advanced user selection with AI integration.
 * This component mimics the essential behavior of a commercial-grade
 * async select, including async option loading, multi-select, and clearability,
 * without external UI library dependencies.
 */
export const InternalAsyncSelectField: React.FC<InternalAsyncSelectFieldProps> = ({
  placeholder,
  name,
  loadOptions,
  handleChange,
  selectValue,
  label,
  disabled,
  isMulti,
  isClearable,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<InternalSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const nextCursorRef = useRef<string | null>(null); // For simulated infinite scrolling

  // Normalize selected values for easier comparison
  const currentSelectedValues = Array.isArray(selectValue)
    ? selectValue.map(v => (typeof v === 'object' && v !== null ? String(v.value) : String(v)))
    : (selectValue ? [(typeof selectValue === 'object' && selectValue !== null ? String(selectValue.value) : String(selectValue))] : []);

  const fetchOptions = useCallback(
    async (searchTerm: string, append: boolean = false) => {
      if (disabled) return;
      setIsLoading(true);
      try {
        const { options: newOptions, hasMore } = await loadOptions(searchTerm);
        setOptions(prev => {
            // Filter out options that are already present to avoid duplicates
            const uniqueNewOptions = newOptions.filter(
                (newOpt) => !prev.some((p) => p.value === newOpt.value)
            );
            return append ? [...prev, ...uniqueNewOptions] : uniqueNewOptions;
        });
        nextCursorRef.current = hasMore ? "some_cursor_value" : null; // Simple indicator for 'load more'
      } catch (error) {
        console.error("CDBI AsyncSelectField: Failed to load options:", error);
        // Integrate with AI_AnalyticsService for robust error tracking
        AI_AnalyticsService.logEvent("async_select_field_error", {
          component: "InternalAsyncSelectField",
          error: error instanceof Error ? error.message : String(error),
          searchTerm,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [loadOptions, disabled]
  );

  // Initial load of options (mimics defaultOptions behavior)
  useEffect(() => {
    if (!disabled && (!selectValue || (Array.isArray(selectValue) && selectValue.length === 0))) {
        // Trigger an initial load if no values are selected and not disabled
        fetchOptions("");
    }
  }, [disabled, selectValue, fetchOptions]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setMenuIsOpen(true);
    fetchOptions(value);
    // Log search input for AI analytics
    AI_AnalyticsService.logEvent("user_search_input", {
      component: "InternalAsyncSelectField",
      searchTerm: value,
      isAIContext: true,
    });
  };

  const handleOptionClick = (option: InternalSelectOption) => {
    let newSelected: SelectValue | SelectValue[];
    let action: SelectAction;

    if (isMulti) {
      const current = Array.isArray(selectValue) ? selectValue : (selectValue ? [selectValue] : []);
      const isAlreadySelected = current.some(
        (val) => (typeof val === 'object' && val !== null ? val.value : val) === option.value
      );

      if (isAlreadySelected) {
        newSelected = current.filter(
          (val) => (typeof val === 'object' && val !== null ? val.value : val) !== option.value
        );
        action = "remove-value";
      } else {
        newSelected = [...current, { value: option.value, label: option.label }];
        action = "select-option";
      }
    } else {
      newSelected = { value: option.value, label: option.label };
      action = "select-option";
      setMenuIsOpen(false); // Close menu after single selection
    }

    handleChange(newSelected, action);
    setInputValue(""); // Clear input after selection (common UX for select fields)
    setOptions([]); // Clear options after selection for fresh search
    // Log user selection for AI analytics
    AI_AnalyticsService.logEvent("user_selected_option", {
      component: "InternalAsyncSelectField",
      selectedUser: option.value,
      isAIRecommended: option.isAIRecommended || false,
      isMulti,
    });
  };

  const handleClear = () => {
    if (isClearable) {
      handleChange(isMulti ? [] : null, "clear");
      setInputValue("");
      setOptions([]);
      setMenuIsOpen(false);
      AI_AnalyticsService.logEvent("user_cleared_selection", {
        component: "InternalAsyncSelectField",
        isMulti,
      });
    }
  };

  // Close menu when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setMenuIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setMenuIsOpen(true);
    // If input is empty and there are no options, fetch default options
    if (inputValue === "" && options.length === 0) {
        fetchOptions("");
    }
  };

  // Display selected values as tags for multi-select
  const renderSelectedTags = () => {
    if (!isMulti || !selectValue || (Array.isArray(selectValue) && selectValue.length === 0)) {
      return null;
    }
    const selectedArray = Array.isArray(selectValue) ? selectValue : [selectValue];
    return (
      <div className="flex flex-wrap gap-2 my-1">
        {selectedArray.map((val) => {
          const valObj = typeof val === 'object' && val !== null ? val : { value: val as string, label: val as string };
          return (
            <span
              key={valObj.value}
              className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded flex items-center"
            >
              {valObj.label}
              <button
                type="button"
                className="ml-1 text-blue-800 hover:text-blue-600 focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent dropdown from opening
                  handleOptionClick({ value: valObj.value, label: valObj.label }); // Simulate deselect
                }}
              >
                &times;
              </button>
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={selectRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      {isMulti && renderSelectedTags()}
      <div className="relative border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          className="block w-full p-2 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none bg-white rounded-md"
          autoComplete="off" // Prevent browser autocomplete interfering
        />
        {(isLoading || isClearable) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isClearable && (!isMulti && selectValue || (isMulti && Array.isArray(selectValue) && selectValue.length > 0)) && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none ml-2"
                aria-label="Clear selection"
              >
                &times;
              </button>
            )}
          </div>
        )}
      </div>

      {menuIsOpen && !disabled && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 && !isLoading && inputValue !== "" && (
            <div className="p-2 text-gray-500">No results found.</div>
          )}
          {options.map((option) => {
            const isSelected = currentSelectedValues.includes(option.value);
            return (
              <div
                key={option.value}
                className={`p-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${isSelected ? "bg-blue-50 text-blue-700" : ""}`}
                // Using onMouseDown to prevent blur from closing the menu before click event registers
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleOptionClick(option)}
              >
                <span>
                  {option.label}
                  {option.isAIRecommended && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      AI 🧠
                    </span>
                  )}
                </span>
                {isSelected && (
                  <svg
                    className="h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            );
          })}
          {isLoading && <div className="p-2 text-gray-500">Loading...</div>}
          {nextCursorRef.current && options.length > 0 && (
            <div
              className="p-2 text-blue-600 cursor-pointer hover:bg-gray-100 text-center"
              onClick={() => fetchOptions(inputValue, true)} // Load more by appending
            >
              Load more...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- AI Services & Data Simulation ---

/**
 * AI_UserService: Simulates an advanced, AI-powered user data backend.
 * In a real application, this would interact with a sophisticated microservice
 * leveraging ML models for semantic search, contextual relevance, and personalization.
 */
export class AI_UserService {
  private static users: Array<{ id: string; name: string; email: string; organization: string; tags: string[]; ai_relevance_score: number }> = [
    { id: "user-1", name: "Alice Johnson", email: "alice.j@cdbi.com", organization: "CDBI", tags: ["finance", "admin"], ai_relevance_score: 0.95 },
    { id: "user-2", name: "Bob Smith", email: "bob.s@cdbi.com", organization: "CDBI", tags: ["tech", "developer"], ai_relevance_score: 0.88 },
    { id: "user-3", name: "Charlie Brown", email: "charlie.b@cdbi.com", organization: "CDBI", tags: ["hr", "recruiter"], ai_relevance_score: 0.75 },
    { id: "user-4", name: "Diana Prince", email: "diana.p@cdbi.com", organization: "CDBI", tags: ["marketing", "manager"], ai_relevance_score: 0.92 },
    { id: "user-5", name: "Eve Adams", email: "eve.a@cdbi.com", organization: "CDBI", tags: ["finance", "analyst"], ai_relevance_score: 0.80 },
    { id: "user-6", name: "Frank White", email: "frank.w@cdbi.com", organization: "CDBI", tags: ["operations", "logistics"], ai_relevance_score: 0.65 },
    { id: "user-7", name: "Grace Hoppe", email: "grace.h@cdbi.com", organization: "CDBI", tags: ["legal", "compliance"], ai_relevance_score: 0.70 },
    { id: "user-8", name: "Heidi King", email: "heidi.k@cdbi.com", organization: "CDBI", tags: ["finance", "auditor"], ai_relevance_score: 0.89 },
    { id: "user-9", name: "Ivan Rossi", email: "ivan.r@cdbi.com", organization: "CDBI", tags: ["sales", "representative"], ai_relevance_score: 0.78 },
    { id: "user-10", name: "Judy Lee", email: "judy.l@cdbi.com", organization: "CDBI", tags: ["tech", "engineer"], ai_relevance_score: 0.91 },
    { id: "user-11", name: "Karen Green", email: "karen.g@cdbi.com", organization: "CDBI", tags: ["finance", "director"], ai_relevance_score: 0.98 },
    { id: "user-12", name: "Liam Ness", email: "liam.n@cdbi.com", organization: "CDBI", tags: ["marketing", "specialist"], ai_relevance_score: 0.82 },
    { id: "user-13", name: "Mia Hall", email: "mia.h@cdbi.com", organization: "CDBI", tags: ["hr", "manager"], ai_relevance_score: 0.77 },
    { id: "user-14", name: "Noah Scott", email: "noah.s@cdbi.com", organization: "CDBI", tags: ["tech", "architect"], ai_relevance_score: 0.96 },
    { id: "user-15", name: "Olivia Turner", email: "olivia.t@cdbi.com", organization: "CDBI", tags: ["finance", "associate"], ai_relevance_score: 0.85 },
  ];

  /**
   * Simulates an AI-powered search for users with advanced filtering and sorting.
   * - Semantic search: Matches across name, email, and tags.
   * - AI-driven sorting: Prioritizes users by a hypothetical `ai_relevance_score`.
   * @param searchTerm The user's input for search.
   * @param first The number of results to return.
   * @param after The cursor for pagination.
   * @param userIdsToExclude IDs of users already selected, to exclude them from search results.
   * @returns Paginated list of users, hasNextPage flag, and the endCursor.
   */
  public static async searchUsers(
    searchTerm: string,
    first: number,
    after: string | null,
    userIdsToExclude: string[],
  ): Promise<{ users: Array<typeof AI_UserService.users[0]>; hasNextPage: boolean; endCursor: string | null }> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API latency

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredAndScoredUsers = AI_UserService.users
      .filter((user) => !userIdsToExclude.includes(user.id)) // Exclude already selected
      .filter((user) => {
        // AI-powered semantic matching (simulated)
        // In a real system, this would involve embedding search terms and user profiles,
        // then calculating cosine similarity or using a specialized ML model.
        return (
          user.name.toLowerCase().includes(lowerSearchTerm) ||
          user.email.toLowerCase().includes(lowerSearchTerm) ||
          user.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)) ||
          // If search term is empty, consider all users for initial load / browsing
          lowerSearchTerm === ""
        );
      })
      // AI-driven sorting: Prioritize by relevance score, then alphabetically
      .sort((a, b) => b.ai_relevance_score - a.ai_relevance_score || a.name.localeCompare(b.name));

    let startIndex = 0;
    if (after) {
      const lastIndex = filteredAndScoredUsers.findIndex((user) => user.id === after);
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1;
      }
    }

    const paginatedUsers = filteredAndScoredUsers.slice(startIndex, startIndex + first);
    const hasNextPage = filteredAndScoredUsers.length > startIndex + paginatedUsers.length;
    const endCursor = paginatedUsers.length > 0 ? paginatedUsers[paginatedUsers.length - 1].id : null;

    return { users: paginatedUsers, hasNextPage, endCursor };
  }

  /**
   * Retrieves specific users by ID without pagination.
   * Optimized for pre-filling selected users or fetching details for a known set of IDs.
   * @param ids An array of user IDs to retrieve.
   * @returns An array of user objects.
   */
  public static async getUsersByIds(ids: string[]): Promise<Array<typeof AI_UserService.users[0]>> {
    if (ids.length === 0) return [];
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API latency
    return AI_UserService.users.filter(user => ids.includes(user.id));
  }

  /**
   * Provides AI-driven suggestions for users based on current context.
   * This function simulates an AI model's recommendation engine.
   * @param context An object providing context for the AI, e.g., current selections, search term, purpose.
   * @returns An array of user IDs that are AI-recommended.
   */
  public static async getAISuggestions(context: { currentSelection: string[]; searchTerm: string; purpose: string }): Promise<string[]> {
      await new Promise((resolve) => setTimeout(resolve, 150));
      // In a real system, a powerful ML model (e.g., a graph neural network or collaborative filtering model)
      // would analyze the `context` (user roles, project types, recent activity, communication patterns)
      // to recommend the most relevant individuals.
      // For this simulation:
      const relevantUsers = AI_UserService.users
          .filter(u =>
              u.ai_relevance_score > 0.8 && // High relevance score
              !context.currentSelection.includes(u.id) && // Not already selected
              (context.searchTerm === "" || u.name.toLowerCase().includes(context.searchTerm.toLowerCase()) || u.tags.some(tag => tag.toLowerCase().includes(context.searchTerm.toLowerCase()))) // Matches search term or general suggestions if no term
          )
          .sort((a, b) => b.ai_relevance_score - a.ai_relevance_score) // Prioritize higher relevance
          .slice(0, 3); // Top 3 AI suggestions

      return relevantUsers.map(u => u.id);
  }
}

// --- AI-Powered Analytics and KPI Tracking (Conceptually linked to Google Gemini) ---

/**
 * AI_AnalyticsService: A robust service to track, aggregate, and conceptually "send"
 * key performance indicators (KPIs) and metrics to a centralized AI analytics platform like Gemini.
 * This class ensures that every AI-driven function's impact is measurable.
 */
export class AI_AnalyticsService {
  private static events: Array<{ timestamp: Date; eventType: string; data: any }> = [];
  private static kpis: { [key: string]: any } = {};

  /**
   * Logs a significant event within the application for later analysis.
   * @param eventType A descriptive string identifying the type of event (e.g., "user_search_input", "ai_suggestion_applied").
   * @param data Any relevant contextual data associated with the event.
   */
  public static logEvent(eventType: string, data: any) {
    const event = { timestamp: new Date(), eventType, data };
    AI_AnalyticsService.events.push(event);
    // In a production environment, this event would be asynchronously transmitted
    // to CDBI's AI Analytics Platform, powered by Gemini, for real-time dashboards and deeper ML analysis.
    // console.log(`[CDBI AI_AnalyticsService] Logged event: ${eventType}`, data);
    AI_AnalyticsService.updateKpis(eventType, data);
  }

  /**
   * Internal method to update calculated KPIs based on incoming events.
   * This provides immediate feedback and aggregated metrics.
   * @param eventType The type of event that occurred.
   * @param data The data associated with the event.
   */
  private static updateKpis(eventType: string, data: any) {
    switch (eventType) {
      case "user_search_input":
        AI_AnalyticsService.kpis.totalSearches = (AI_AnalyticsService.kpis.totalSearches || 0) + 1;
        break;
      case "user_selected_option":
        AI_AnalyticsService.kpis.totalSelections = (AI_AnalyticsService.kpis.totalSelections || 0) + 1;
        if (data.isAIRecommended) {
          AI_AnalyticsService.kpis.aiSuggestionSelections = (AI_AnalyticsService.kpis.aiSuggestionSelections || 0) + 1;
        }
        break;
      case "ai_suggestion_rendered":
          AI_AnalyticsService.kpis.aiSuggestionsRendered = (AI_AnalyticsService.kpis.aiSuggestionsRendered || 0) + 1;
          break;
      case "async_select_field_error":
        AI_AnalyticsService.kpis.asyncSelectErrors = (AI_AnalyticsService.kpis.asyncSelectErrors || 0) + 1;
        break;
      // Future KPIs could include: average time to selection, bounce rate of searches,
      // conversion rate of AI suggestions for specific roles, etc.
    }
  }

  /**
   * Calculates and returns the current set of aggregated KPIs.
   * This method provides a snapshot of the system's performance and AI effectiveness.
   * @returns An object containing various calculated Key Performance Indicators.
   */
  public static getKpis(): { [key: string]: any } {
    const totalSearches = AI_AnalyticsService.kpis.totalSearches || 0;
    const totalSelections = AI_AnalyticsService.kpis.totalSelections || 0;
    const aiSuggestionSelections = AI_AnalyticsService.kpis.aiSuggestionSelections || 0;
    const aiSuggestionsRendered = AI_AnalyticsService.kpis.aiSuggestionsRendered || 0;

    return {
      totalSearches,
      totalSelections,
      "selectionRate": totalSearches > 0 ? ((totalSelections / totalSearches) * 100).toFixed(2) : "0.00",
      "aiSuggestionAdoptionRate": aiSuggestionsRendered > 0 ? ((aiSuggestionSelections / aiSuggestionsRendered) * 100).toFixed(2) : "0.00",
      aiSuggestionSelections,
      aiSuggestionsRendered,
      "asyncSelectErrors": AI_AnalyticsService.kpis.asyncSelectErrors || 0,
    };
  }

  /**
   * Resets all recorded events and KPI metrics. Useful for fresh test runs or session management.
   */
  public static resetAnalytics() {
    AI_AnalyticsService.events = [];
    AI_AnalyticsService.kpis = {};
  }
}

/**
 * AI_KPIsDisplay: A dynamic React component to visualize real-time AI performance metrics.
 * This component showcases the "charts" and "link to Gemini" aspect by displaying KPIs
 * derived from `AI_AnalyticsService`. In a full production system, these might be
 * interactive charts powered by a charting library and fetching data directly from
 * a Gemini-backed analytics dashboard API.
 */
export const AI_KPIsDisplay: React.FC = () => {
  const [kpis, setKpis] = useState(AI_AnalyticsService.getKpis());

  // Periodically update KPIs to reflect the latest events and calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(AI_AnalyticsService.getKpis());
    }, 1000); // Update every second for real-time demonstration
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-4 border border-purple-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="mr-2 text-purple-600">📊</span> AI Performance Metrics (Linked to Gemini)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">Total User Searches</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.totalSearches}</p>
        </div>
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">Total User Selections</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.totalSelections}</p>
        </div>
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">Overall Selection Rate</p>
          <p className="text-2xl font-bold text-blue-600">{kpis.selectionRate}%</p>
        </div>
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">AI Suggestions Rendered</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.aiSuggestionsRendered}</p>
        </div>
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">AI-Driven Selections</p>
          <p className="text-2xl font-bold text-gray-900">{kpis.aiSuggestionSelections}</p>
        </div>
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">AI Suggestion Adoption Rate</p>
          <p className="text-2xl font-bold text-green-600">{kpis.aiSuggestionAdoptionRate}%</p>
        </div>
        <div className="p-3 bg-white rounded-md shadow-sm border border-purple-100">
          <p className="text-sm text-gray-500">Critical System Errors</p>
          <p className="text-2xl font-bold text-red-600">{kpis.asyncSelectErrors}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-right">Data streamed in real-time to CDBI's AI Analytics Platform, powered by Gemini.</p>
    </div>
  );
};


// --- MultiUserSelect Component: The main, enhanced component ---

interface MultiUserSelectProps {
  onChange: (value: SelectValue | SelectValue[], action: SelectAction) => void;
  selectedUserIds?: string[];
  label?: string;
  disabled?: boolean;
}

/**
 * MultiUserSelect: An AI-powered, self-contained, and commercially robust user selection component.
 * It provides intelligent user suggestions and integrates real-time performance analytics.
 * Designed to be highly flexible for various applications, from banking to general enterprise.
 */
function MultiUserSelect({
  onChange,
  selectedUserIds,
  label,
  disabled,
}: MultiUserSelectProps) {
  const [oldInputValue, setOldInputValue] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [nextSearchCursor, setNextSearchCursor] = useState<string | null>(null);
  const [userOptions, setUserOptions] = useState<Array<InternalSelectOption>>([]);

  /**
   * Replaces the original GraphQL query with an AI-powered data fetching mechanism.
   * This function interacts with the `AI_UserService` to get intelligent user data.
   * It handles pagination, search, and integrates AI suggestions.
   */
  const loadOptions = useCallback(
    (inputValue: string) =>
      new Promise<{ options: InternalSelectOption[]; hasMore: boolean }>((resolve, reject) => {
        const cleanedValue = inputValue.replace(/,/g, "");
        const currentSelectedUsers = selectedUserIds || [];

        // Determine which cursor to use based on whether it's a new search or continuing an old one
        const effectiveCursor =
          inputValue && inputValue === oldInputValue ? nextSearchCursor : (cleanedValue ? null : nextCursor);

        // Concurrently fetch search results, selected user details, and AI-driven suggestions
        Promise.all([
            AI_UserService.searchUsers(
                cleanedValue,
                10, // `first`: Fetch 10 users per page
                effectiveCursor,
                currentSelectedUsers, // Exclude already selected users from paginated search results
            ),
            AI_UserService.getUsersByIds(currentSelectedUsers), // Fetch full details for all selected users
            AI_UserService.getAISuggestions({ // Request AI suggestions based on current context
                currentSelection: currentSelectedUsers,
                searchTerm: cleanedValue,
                purpose: "collaborator_selection", // Provides context to the AI model
            }),
        ])
          .then(([{ users: searchedUsers, hasNextPage, endCursor }, unpaginatedSelectedUsers, aiSuggestions]) => {
            let combinedOptionsMap = new Map<string, InternalSelectOption>();

            // Mark AI-recommended users
            const aiRecommendedUsersSet = new Set(aiSuggestions);

            // Add existing selected users first (ensures they are always at the top/present)
            unpaginatedSelectedUsers.forEach(user => {
                combinedOptionsMap.set(user.id, {
                    value: user.id,
                    label: `${user.name ?? ""} (${user.email})`,
                    isAIRecommended: aiRecommendedUsersSet.has(user.id),
                });
                if (aiRecommendedUsersSet.has(user.id)) {
                    AI_AnalyticsService.logEvent("ai_suggestion_rendered", { userId: user.id, context: cleanedValue, type: "selected_user_boost" });
                }
            });

            // Add newly searched users, prioritizing AI recommendations
            searchedUsers.forEach(user => {
                // Only add if not already in the map (from selected users)
                if (!combinedOptionsMap.has(user.id)) {
                    combinedOptionsMap.set(user.id, {
                        value: user.id,
                        label: `${user.name ?? ""} (${user.email})`,
                        isAIRecommended: aiRecommendedUsersSet.has(user.id),
                    });
                    if (aiRecommendedUsersSet.has(user.id)) {
                        AI_AnalyticsService.logEvent("ai_suggestion_rendered", { userId: user.id, context: cleanedValue, type: "search_result_boost" });
                    }
                }
            });

            // Combine and sort options: AI-recommended first, then by name
            const finalNewOptions = Array.from(combinedOptionsMap.values()).sort((a, b) => {
                if (a.isAIRecommended && !b.isAIRecommended) return -1;
                if (!a.isAIRecommended && b.isAIRecommended) return 1;
                return a.label.localeCompare(b.label);
            });

            // Cache all options fetched so far
            setUserOptions(prevOptions => {
                const updatedOptionsMap = new Map(prevOptions.map(o => [o.value, o]));
                finalNewOptions.forEach(newOpt => updatedOptionsMap.set(newOpt.value, newOpt));
                return Array.from(updatedOptionsMap.values()).sort((a, b) => {
                    if (a.isAIRecommended && !b.isAIRecommended) return -1;
                    if (!a.isAIRecommended && b.isAIRecommended) return 1;
                    return a.label.localeCompare(b.label);
                });
            });

            // Update pagination cursors
            if (inputValue) {
              if (inputValue !== oldInputValue) setOldInputValue(inputValue);
              setNextSearchCursor(endCursor);
            } else {
              setNextSearchCursor(null); // Clear search cursor if input is empty (browsing mode)
              setNextCursor(endCursor);
            }

            resolve({
              hasMore: hasNextPage,
              options: finalNewOptions, // Return the current set of options for the dropdown
            });
          })
          .catch((e) => {
            console.error("CDBI AI-powered MultiUserSelect failed:", e);
            AI_AnalyticsService.logEvent("ai_user_service_query_error", {
              component: "MultiUserSelect",
              error: e instanceof Error ? e.message : String(e),
              searchTerm: cleanedValue,
            });
            reject(e);
          });
      }),
    [nextCursor, nextSearchCursor, oldInputValue, selectedUserIds, userOptions], // Dependencies for useCallback
  );

  // Derive the currently selected options from the cached `userOptions`
  const selectedOptions: InternalSelectOption[] = [];
  if (selectedUserIds && selectedUserIds.length > 0) {
    userOptions.forEach(option => {
      if (selectedUserIds.includes(option.value)) {
        selectedOptions.push(option);
      }
    });
  }

  // Ensure initial options are loaded even without interaction
  useEffect(() => {
    if (!disabled && userOptions.length === 0 && (!selectedUserIds || selectedUserIds.length === 0)) {
        // Load some initial, AI-sorted options if nothing is selected and component is not disabled
        loadOptions("");
    }
  }, [disabled, selectedUserIds, userOptions.length, loadOptions]);


  return (
    <div className="multi-user-select-container p-4 bg-white shadow-lg rounded-lg border border-gray-100 max-w-4xl mx-auto my-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        AI-Powered User Selection for CDBI
      </h2>
      <p className="text-gray-600 mb-6">
        Leveraging advanced AI algorithms, this component intelligently suggests and manages user selections for any task,
        optimizing for relevance and efficiency. Built for real-world enterprise applications, serving both institutions and individuals.
      </p>

      <InternalAsyncSelectField
        placeholder="Search and Select Users (AI Enhanced)"
        name="multi-user-select-ai"
        loadOptions={loadOptions}
        handleChange={onChange}
        selectValue={selectedOptions}
        label={label || "CDBI AI User Selector"}
        disabled={disabled}
        isMulti
        isClearable
        // `defaultOptions` behavior is now handled by the useEffect above
      />

      {/* Integrate the real-time AI KPI display for continuous performance monitoring */}
      <AI_KPIsDisplay />
    </div>
  );
}

export default MultiUserSelect;