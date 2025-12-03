/* eslint-disable no-param-reassign */
import pickBy from "lodash/pickBy";
import {
    createEntityAdapter,
    createAsyncThunk,
    createSlice,
    createSelector,
} from "@reduxjs/toolkit";

import {
    fetchAPI
} from "../../common/utilities/requestApi";
import {
    stringify
} from "../../common/utilities/queryString";

/**
 * @typedef {Object} EntityId
 * @property {string | number} id - The unique identifier of an entity.
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} total - Total number of entities across all pages.
 * @property {number} page - Current page number.
 * @property {number} perPage - Number of entities per page.
 * @property {number} pageLowerBound - The lower bound index of items on the current page.
 * @property {number} pageUpperBound - The upper bound index of items on the current page.
 * @property {boolean} hasPrevPage - True if a previous page exists.
 * @property {boolean} hasNextPage - True if a next page exists.
 */

/**
 * @typedef {'idle' | 'loading' | 'succeeded' | 'failed'} AsyncStatus
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - A user-friendly error message.
 * @property {string} code - An internal error code.
 * @property {number} status - HTTP status code of the response.
 * @property {Object} [details] - Additional error details, e.g., validation errors.
 */

/**
 * @typedef {Object} EntityStateExtra
 * @property {Object.<string, any>} query - Current query parameters for search.
 * @property {PaginationMeta} pagination - Pagination metadata.
 * @property {boolean} loading - Global loading indicator for major operations.
 * @property {string | null} currentRequestId - ID of the currently executing async request.
 * @property {AsyncStatus} status - Overall status of the entity slice (e.g., 'idle', 'loading').
 * @property {ApiError | null} error - Stores the last encountered API error.
 * @property {number | null} lastFetched - Timestamp of the last successful data fetch.
 * @property {Object.<string, any>} aiInsights - Stores AI-generated insights related to the entities.
 * @property {Object.<string, {type: 'create' | 'save' | 'delete', data?: Object, original?: Object}>} optimisticUpdates - Stores information about pending optimistic updates, keyed by entity ID.
 */

/**
 * @typedef {Object} SliceOptions
 * @property {string} [idProperty='id'] - The property name on the entity that serves as its unique ID.
 * @property {function(any): string | number} [selectId] - A function to extract the ID from an entity.
 * @property {function(any, any): number} [sortComparer] - A function to sort entities.
 * @property {number} [cacheDuration=300000] - Duration in milliseconds to cache data (5 minutes default).
 * @property {number} [retryAttempts=3] - Number of times to retry failed network requests.
 * @property {number} [retryDelay=1000] - Initial delay in milliseconds for retries (exponential backoff).
 * @property {boolean} [enableOptimisticUpdates=true] - Whether to enable optimistic updates for CUD operations.
 * @property {Object} [geminiAIFeatures] - Configuration for Gemini AI integrations.
 * @property {boolean} [geminiAIFeatures.predictivePrefetch=false] - Enable AI predictive prefetching.
 * @property {boolean} [geminiAIFeatures.anomalyDetection=false] - Enable AI anomaly detection.
 * @property {boolean} [geminiAIFeatures.semanticSearch=false] - Enable AI semantic search capabilities.
 * @property {boolean} [geminiAIFeatures.dataNormalization=false] - Enable AI-driven data normalization suggestions.
 * @property {boolean} [geminiAIFeatures.summaryGeneration=false] - Enable AI-driven entity summary generation.
 */


/**
 * Global constants for API headers and status.
 * @type {Object.<string, string>}
 */
export const API_HEADERS = {
    PAGE: "X-Page",
    PER_PAGE: "X-Per-Page",
    TOTAL_COUNT: "X-Total-Count",
    PAGE_LOWER_BOUND: "X-Page-Lower-Bound",
    PAGE_UPPER_BOUND: "X-Page-Upper-Bound",
    LINK: "Link",
};

/**
 * Standard HTTP methods.
 * @enum {string}
 */
export const HttpMethod = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
};

/**
 * Structured logger for consistency and future integration with observability platforms.
 * @param {string} level - Log level (e.g., 'info', 'warn', 'error', 'debug').
 * @param {string} message - The log message.
 * @param {Object} [meta] - Additional metadata for the log entry.
 */
export function logActivity(level, message, meta = {}) {
    // In a real application, this would integrate with a logging service like Winston, Pino, or a cloud logger.
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (console[level]) {
        console[level](formattedMessage, meta);
    } else {
        console.log(formattedMessage, meta); // Fallback for unsupported levels
    }
}

/**
 * Custom error class for API-related issues, providing structured error information.
 * @augments Error
 */
export class EntityApiError extends Error {
    /**
     * @param {string} message - Error message.
     * @param {string} code - Specific error code.
     * @param {number} status - HTTP status code.
     * @param {Object} [details={}] - Additional error details.
     */
    constructor(message, code, status, details = {}) {
        super(message);
        this.name = "EntityApiError";
        this.code = code;
        this.status = status;
        this.details = details;
        logActivity('error', `API Error: ${message}`, {
            code,
            status,
            details
        });
    }
}

/**
 * Retries an asynchronous function with exponential backoff.
 * @template T
 * @param {function(): Promise<T>} fn - The asynchronous function to retry.
 * @param {number} retries - Maximum number of retry attempts.
 * @param {number} delay - Initial delay in milliseconds before the first retry.
 * @returns {Promise<T>} - The result of the function or an error after all retries fail.
 */
export async function withRetry(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            logActivity('warn', `Attempt ${i + 1}/${retries} failed. Retrying in ${delay}ms...`, {
                error: error.message
            });
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw error; // Re-throw if all retries fail
            }
        }
    }
}

/**
 * Represents a sophisticated Gemini AI Service capable of generating insights,
 * predicting data, and performing advanced analytical tasks.
 * This is a conceptual implementation. In a real scenario, it would interface with a cloud AI API.
 */
export class GeminiAIService {
    constructor() {
        logActivity('info', 'GeminiAIService initialized, ready for advanced entity intelligence.');
    }

    /**
     * Analyzes entity data for potential anomalies or outliers.
     * @param {Array<Object>} entities - The list of entities to analyze.
     * @param {Object} [options={}] - Configuration options for anomaly detection.
     * @returns {Promise<Object.<string, any>>} - A promise resolving to an object containing anomaly insights.
     */
    async analyzeAnomalies(entities, options = {}) {
        logActivity('info', 'Gemini AI: Analyzing data for anomalies...', {
            entityCount: entities.length,
            options
        });
        // Simulate AI processing time and generate insights.
        await new Promise(resolve => setTimeout(resolve, 1500));
        const anomalies = entities.filter(e => Math.random() < 0.05); // 5% chance of being an "anomaly"
        if (anomalies.length > 0) {
            logActivity('warn', `Gemini AI: Detected ${anomalies.length} potential anomalies.`, {
                anomalies: anomalies.map(a => a.id)
            });
            return {
                hasAnomalies: true,
                count: anomalies.length,
                anomalousEntities: anomalies.map(a => ({
                    id: a.id,
                    reason: `Simulated anomaly based on property X value: ${JSON.stringify(a)}`
                })),
                suggestedAction: "Review these entities for data integrity or suspicious activity."
            };
        }
        logActivity('info', 'Gemini AI: No significant anomalies detected.');
        return {
            hasAnomalies: false,
            count: 0,
            message: "No significant anomalies detected in the provided dataset."
        };
    }

    /**
     * Predicts related entities based on current entity context or user behavior.
     * @param {string | number} entityId - The ID of the primary entity.
     * @param {Object} [context={}] - Additional context for prediction (e.g., user preferences, recent activity).
     * @returns {Promise<Array<EntityId>>} - A promise resolving to a list of predicted related entity IDs.
     */
    async predictRelatedEntities(entityId, context = {}) {
        logActivity('info', `Gemini AI: Predicting related entities for ID: ${entityId}...`, {
            context
        });
        await new Promise(resolve => setTimeout(resolve, 800));
        // Simulate finding related entities (e.g., based on common tags, categories, user interactions)
        const relatedIds = Array.from({
            length: Math.floor(Math.random() * 3) + 1
        }).map((_, i) => `${entityId}-${i + 1}-related`);
        logActivity('info', `Gemini AI: Predicted ${relatedIds.length} related entities for ${entityId}.`, {
            relatedIds
        });
        return relatedIds;
    }

    /**
     * Performs a semantic search using AI to understand natural language queries.
     * @param {string} queryText - The natural language query.
     * @param {Object} [options={}] - Options for search, e.g., result limits, categories.
     * @returns {Promise<Array<EntityId>>} - A promise resolving to a list of entity IDs matching the semantic intent.
     */
    async semanticSearch(queryText, options = {}) {
        logActivity('info', `Gemini AI: Performing semantic search for query: "${queryText}"...`, {
            options
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Simulate mapping natural language to structured query or direct entity IDs
        const simulatedIds = Array.from({
            length: Math.floor(Math.random() * 5) + 2
        }).map((_, i) => `sem_res_${i}_${queryText.length}`);
        logActivity('info', `Gemini AI: Semantic search for "${queryText}" returned ${simulatedIds.length} results.`, {
            simulatedIds
        });
        return simulatedIds;
    }

    /**
     * Suggests data normalization or enhancement strategies for entities.
     * @param {Object} entityData - The entity data to analyze.
     * @returns {Promise<Object.<string, any>>} - Suggestions for normalization or enhancements.
     */
    async suggestDataNormalization(entityData) {
        logActivity('info', `Gemini AI: Analyzing entity data for normalization suggestions...`, {
            entityId: entityData.id
        });
        await new Promise(resolve => setTimeout(resolve, 700));
        // Simulate suggestions, e.g., standardize date formats, capitalize names, suggest missing fields.
        const suggestions = {};
        if (entityData.name && entityData.name !== entityData.name.trim()) {
            suggestions.name = `Trim whitespace: '${entityData.name.trim()}'`;
        }
        if (entityData.status && typeof entityData.status === 'string' && !['active', 'inactive', 'pending'].includes(entityData.status.toLowerCase())) {
            suggestions.status = `Suggest standardizing status to 'active', 'inactive', or 'pending'. Current: '${entityData.status}'`;
        }
        if (Object.keys(suggestions).length > 0) {
            logActivity('info', `Gemini AI: Found data normalization suggestions for entity ${entityData.id}.`, {
                suggestions
            });
            return {
                suggestedChanges: suggestions,
                message: "Review the suggested changes for data consistency."
            };
        }
        logActivity('info', `Gemini AI: No significant normalization suggestions for entity ${entityData.id}.`);
        return {
            suggestedChanges: {},
            message: "Data appears well-formed."
        };
    }

    /**
     * Generates a comprehensive summary or report for an entity.
     * @param {Object} entity - The entity object.
     * @returns {Promise<string>} - A detailed AI-generated summary.
     */
    async generateEntitySummary(entity) {
        logActivity('info', `Gemini AI: Generating summary for entity ${entity.id}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Construct a narrative summary based on entity properties
        const summary = `Comprehensive AI-generated summary for entity ID ${entity.id}:\n` +
            `- Name: ${entity.name || 'N/A'}\n` +
            `- Status: ${entity.status || 'N/A'}\n` +
            `- Creation Date: ${entity.createdAt ? new Date(entity.createdAt).toLocaleString() : 'N/A'}\n` +
            `- Last Updated: ${entity.updatedAt ? new Date(entity.updatedAt).toLocaleString() : 'N/A'}\n` +
            `AI Note: This entity appears to be in a ${entity.status || 'unknown'} state. Further analysis of its historical trends and related entities (if any) could provide deeper insights into its operational context and potential impact on other systems.` +
            `[End of AI Summary]`;
        logActivity('info', `Gemini AI: Summary generated for entity ${entity.id}.`);
        return summary;
    }
}

/**
 * Singleton instance of the GeminiAIService.
 * @type {GeminiAIService}
 */
export const geminiAIServiceInstance = new GeminiAIService();

const hasPrevPage = (linkHeader) => linkHeader && linkHeader.includes('rel="prev"');
const hasNextPage = (linkHeader) => linkHeader && linkHeader.includes('rel="next"');


/**
 * Creates a Redux Toolkit slice with comprehensive CRUD operations, pagination,
 * querying, advanced selectors, and integrated AI capabilities.
 *
 * @param {string} name - The name of the slice (e.g., 'users', 'products').
 * @param {string} resourcePath - The base API path for the entity (e.g., '/api/users').
 * @param {function(Object): Object} [stateSelector=(state) => state[name]] - A selector function to get the entity slice state.
 * @param {SliceOptions} [options={}] - Configuration options for the slice.
 * @returns {{slice: import('@reduxjs/toolkit').Slice, adapter: import('@reduxjs/toolkit').EntityAdapter, selector: import('@reduxjs/toolkit').Selector, simpleSelectors: import('@reduxjs/toolkit').EntitySelectors, queryStringSelector: import('@reduxjs/toolkit').Selector, fullQueryStringSelector: import('@reduxjs/toolkit').Selector, selectFilteredAndSortedEntities: import('@reduxjs/toolkit').Selector, selectEntityLoadingStatus: import('@reduxjs/toolkit').Selector}}
 *          An object containing the created slice, entity adapter, and various selectors.
 */
export default function createEntitySlice(
    name,
    resourcePath,
    stateSelector = (state) => state[name],
    options = {},
) {
    const defaultOptions = {
        idProperty: 'id',
        cacheDuration: 300000, // 5 minutes
        retryAttempts: 3,
        retryDelay: 1000,
        enableOptimisticUpdates: true,
        geminiAIFeatures: {
            predictivePrefetch: false,
            anomalyDetection: false,
            semanticSearch: false,
            dataNormalization: false,
            summaryGeneration: false,
        },
    };

    const mergedOptions = { ...defaultOptions,
        ...options,
        geminiAIFeatures: {
            ...defaultOptions.geminiAIFeatures,
            ...options.geminiAIFeatures
        }
    };

    const adapter = createEntityAdapter({
        selectId: mergedOptions.selectId || ((entity) => entity[mergedOptions.idProperty]),
        sortComparer: mergedOptions.sortComparer,
    });
    const simpleSelectors = adapter.getSelectors(stateSelector);

    /**
     * Selects the current query string parameters, excluding pagination.
     * @type {import('@reduxjs/toolkit').Selector}
     */
    const queryStringSelector = createSelector(
        (state) => stateSelector(state).query,
        (query) => stringify(pickBy(query), "brackets"),
    );

    /**
     * Selects the full query string including pagination parameters.
     * @type {import('@reduxjs/toolkit').Selector}
     */
    const fullQueryStringSelector = createSelector(
        (state) => stateSelector(state).query,
        (state) => stateSelector(state).pagination,
        (query, pagination) =>
        stringify({
                ...pickBy(query),
                ...{
                    page: pagination.page,
                    per_page: pagination.perPage
                },
            },
            "brackets",
        ),
    );

    /**
     * Comprehensive selector for the entity slice state, combining various aspects.
     * @type {import('@reduxjs/toolkit').Selector<Object, { loading: boolean, pagination: PaginationMeta, data: Array<any>, query: Object, queryString: string, status: AsyncStatus, error: ApiError | null, lastFetched: number | null, aiInsights: Object.<string, any>, selectedEntity?: any, optimisticUpdates: Object.<string, any> }>}
     */
    const selector = createSelector(
        (state) => stateSelector(state).loading,
        (state) => stateSelector(state).pagination,
        simpleSelectors.selectAll, // All entities as an array
        (state) => stateSelector(state).query,
        queryStringSelector,
        (state) => stateSelector(state).status,
        (state) => stateSelector(state).error,
        (state) => stateSelector(state).lastFetched,
        (state) => stateSelector(state).aiInsights,
        (state) => stateSelector(state).optimisticUpdates,
        // Also add a selector for a potentially 'selected' single entity if implementing dedicated single entity views.
        (state, entityId) => (entityId ? simpleSelectors.selectById(state, entityId) : undefined),
        (loading, pagination, data, query, queryString, status, error, lastFetched, aiInsights, optimisticUpdates, selectedEntity) => ({
            loading,
            pagination,
            data,
            query,
            queryString,
            status,
            error,
            lastFetched,
            aiInsights,
            optimisticUpdates,
            selectedEntity,
        }),
    );

    /**
     * Selector for entities filtered and sorted based on current query and custom sort.
     * This is a higher-order selector that takes a state and returns an array of entities.
     * @param {Object} rootState - The root Redux state.
     * @returns {Array<Object>} An array of filtered and sorted entities.
     */
    export const selectFilteredAndSortedEntities = createSelector(
        simpleSelectors.selectAll,
        (state) => stateSelector(state).query,
        (entities, query) => {
            let filtered = [...entities];

            // Basic filtering based on 'searchTerm' if present in query
            if (query.searchTerm && typeof query.searchTerm === 'string') {
                const lowerCaseSearchTerm = query.searchTerm.toLowerCase();
                filtered = filtered.filter(entity =>
                    Object.values(entity).some(value =>
                        String(value).toLowerCase().includes(lowerCaseSearchTerm)
                    )
                );
            }

            // Basic sorting based on 'sortBy' and 'sortOrder'
            if (query.sortBy && filtered.length > 0) {
                const {
                    sortBy,
                    sortOrder = 'asc'
                } = query;
                filtered.sort((a, b) => {
                    const valA = a[sortBy];
                    const valB = b[sortBy];

                    if (typeof valA === 'string' && typeof valB === 'string') {
                        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                    if (typeof valA === 'number' && typeof valB === 'number') {
                        return sortOrder === 'asc' ? valA - valB : valB - valA;
                    }
                    return 0; // Fallback for incomparable types
                });
            }

            return filtered;
        }
    );

    /**
     * Selects the current loading status for various operations within the slice.
     * Provides granular loading states.
     * @param {Object} rootState - The root Redux state.
     * @returns {{ status: AsyncStatus, globalLoading: boolean, isFetching: boolean, isSaving: boolean, isCreating: boolean, isDeleting: boolean, isAnalyzingAI: boolean, isAISearching: boolean }}
     */
    export const selectEntityLoadingStatus = createSelector(
        (state) => stateSelector(state).status,
        (state) => stateSelector(state).loading, // General purpose loading flag
        (state) => stateSelector(state).currentRequestId,
        (status, globalLoading, currentRequestId) => ({
            status, // 'idle', 'loading', 'succeeded', 'failed'
            globalLoading, // Legacy global loading flag, for backwards compatibility
            isFetching: (status === 'loading' && currentRequestId && (
                currentRequestId.startsWith(`${name}/show`) || currentRequestId.startsWith(`${name}/search`)
            )),
            isSaving: (status === 'loading' && currentRequestId && currentRequestId.startsWith(`${name}/save`)),
            isCreating: (status === 'loading' && currentRequestId && currentRequestId.startsWith(`${name}/createOne`)),
            isDeleting: (status === 'loading' && currentRequestId && currentRequestId.startsWith(`${name}/deleteOne`)),
            isAnalyzingAI: (status === 'loading' && currentRequestId && currentRequestId.startsWith(`${name}/analyzeEntityForNormalizationAI`)),
            isAISearching: (status === 'loading' && currentRequestId && currentRequestId.startsWith(`${name}/semanticSearchAI`)),
        })
    );


    /**
     * Fetches a single entity by its ID. Integrates caching and AI prefetching.
     * @param {string | number} entityId - The ID of the entity to fetch.
     * @returns {Promise<any>} The fetched entity.
     */
    const show = createAsyncThunk(`${name}/show`, async (entityId, {
        getState,
        rejectWithValue,
        dispatch
    }) => {
        const state = getState();
        const {
            lastFetched,
            entities
        } = stateSelector(state);
        const cachedEntity = entities[entityId];

        // Advanced caching logic: if entity exists and was recently fetched, return cached.
        if (cachedEntity && lastFetched && (Date.now() - lastFetched < mergedOptions.cacheDuration)) {
            logActivity('info', `Cache hit for ${name}/${entityId}. Returning cached data.`);
            return cachedEntity; // Return a copy to prevent direct state mutation
        }

        try {
            const response = await withRetry(() => fetchAPI(`${resourcePath}/${entityId}/load`), mergedOptions.retryAttempts, mergedOptions.retryDelay);
            const data = await response.json();
            logActivity('info', `Successfully fetched ${name}/${entityId}.`, {
                entityId,
                data
            });
            // If AI predictive prefetch is enabled, trigger it after fetching.
            if (mergedOptions.geminiAIFeatures.predictivePrefetch) {
                geminiAIServiceInstance.predictRelatedEntities(entityId)
                    .then(relatedIds => {
                        logActivity('info', `AI predicted related entities for ${entityId}: ${relatedIds.join(', ')}`);
                        // Dispatch an action to potentially prefetch these, or just store the insights
                        dispatch(slice.actions.addAIInsight({
                            type: 'predictivePrefetch',
                            entityId,
                            data: relatedIds
                        }));
                    })
                    .catch(error => logActivity('error', `AI predictive prefetch failed for ${entityId}: ${error.message}`));
            }
            if (mergedOptions.geminiAIFeatures.summaryGeneration) {
                geminiAIServiceInstance.generateEntitySummary(data)
                    .then(summary => {
                        logActivity('info', `AI generated summary for entity ${entityId}.`);
                        dispatch(slice.actions.addAIInsight({
                            type: 'entitySummary',
                            entityId,
                            data: summary
                        }));
                    })
                    .catch(error => logActivity('error', `AI summary generation failed for ${entityId}: ${error.message}`));
            }
            return data;
        } catch (err) {
            logActivity('error', `Failed to fetch ${name}/${entityId}.`, {
                error: err.message
            });
            return rejectWithValue(new EntityApiError(`Failed to retrieve ${name}.`, 'ENTITY_FETCH_FAILED', err.status || 500, err.details));
        }
    });

    const defaultSearchArgs = {
        replaceState: true,
    };

    /**
     * Performs a search operation for entities based on current query and pagination.
     * Updates URL with query string.
     * @param {Object} [args={}] - Optional arguments for search.
     * @param {boolean} [args.replaceState=true] - Whether to replace the browser history state.
     * @returns {Promise<{ body: Array<any>, pagination: PaginationMeta } | null>} Search results and pagination.
     */
    const search = createAsyncThunk(
        `${name}/search`,
        async (args = {}, {
            getState,
            requestId,
            rejectWithValue,
            dispatch
        }) => {
            const state = getState();
            const {
                loading,
                currentRequestId,
                status
            } = stateSelector(state);
            const queryString = `?${fullQueryStringSelector(state)}`;

            const options = { ...defaultSearchArgs,
                ...args
            };

            // Prevent multiple concurrent searches or stale requests
            if (loading && requestId !== currentRequestId) {
                logActivity('info', `Canceling stale search request for ${name}. Request ID: ${requestId}, Current: ${currentRequestId}`);
                return rejectWithValue(new EntityApiError('Stale request cancelled.', 'STALE_REQUEST_CANCELLED', 409));
            }
            if (status === 'loading') {
                logActivity('info', `Search already in progress for ${name}. Skipping new request.`);
                return rejectWithValue(new EntityApiError('Search already in progress.', 'SEARCH_IN_PROGRESS', 409));
            }

            if (options.replaceState) {
                window.history.replaceState(null, null, queryString);
            }

            try {
                const response = await withRetry(() => fetchAPI(`${resourcePath}/search${queryString}`), mergedOptions.retryAttempts, mergedOptions.retryDelay);
                const data = await response.json();
                const paginationHeaders = {
                    page: parseInt(response.headers.get(API_HEADERS.PAGE), 10),
                    perPage: parseInt(response.headers.get(API_HEADERS.PER_PAGE), 10),
                    total: parseInt(response.headers.get(API_HEADERS.TOTAL_COUNT), 10),
                    pageLowerBound: parseInt(
                        response.headers.get(API_HEADERS.PAGE_LOWER_BOUND),
                        10,
                    ),
                    pageUpperBound: parseInt(
                        response.headers.get(API_HEADERS.PAGE_UPPER_BOUND),
                        10,
                    ),
                    hasPrevPage: hasPrevPage(response.headers.get(API_HEADERS.LINK)),
                    hasNextPage: hasNextPage(response.headers.get(API_HEADERS.LINK)),
                };
                logActivity('info', `Successfully executed search for ${name}.`, {
                    query: queryString,
                    resultCount: data.length,
                    pagination: paginationHeaders
                });

                // AI Anomaly Detection after search results are fetched
                if (mergedOptions.geminiAIFeatures.anomalyDetection && data.length > 0) {
                    geminiAIServiceInstance.analyzeAnomalies(data)
                        .then(insights => {
                            logActivity('info', `AI anomaly detection completed for ${name} search results.`);
                            dispatch(slice.actions.setAIInsights({
                                type: 'anomalyDetection',
                                data: insights
                            }));
                        })
                        .catch(error => logActivity('error', `AI anomaly detection failed for ${name} search: ${error.message}`));
                }

                return {
                    body: data,
                    pagination: paginationHeaders,
                };
            } catch (err) {
                logActivity('error', `Search failed for ${name}.`, {
                    error: err.message,
                    query: queryString
                });
                return rejectWithValue(new EntityApiError(`Failed to search ${name} entities.`, 'ENTITY_SEARCH_FAILED', err.status || 500, err.details));
            }
        },
    );

    /**
     * Saves (updates) an existing entity. Supports optimistic updates and retry logic.
     * @param {Object} payload
     * @param {string | number} payload.entityId - The ID of the entity to save.
     * @param {Object} payload.data - The data to update.
     * @returns {Promise<any>} The updated entity.
     */
    const save = createAsyncThunk(
        `${name}/save`,
        async ({
            entityId,
            data
        }, {
            getState,
            requestId,
            rejectWithValue,
            dispatch
        }) => {
            const state = getState();
            const {
                loading,
                currentRequestId,
                entities
            } = stateSelector(state);

            if (loading && requestId !== currentRequestId) {
                logActivity('info', `Canceling stale save request for ${name}/${entityId}.`);
                return rejectWithValue(new EntityApiError('Stale request cancelled.', 'STALE_REQUEST_CANCELLED', 409));
            }

            const originalEntity = entities[entityId];

            if (mergedOptions.enableOptimisticUpdates && originalEntity) {
                dispatch(slice.actions.addOptimisticUpdate({
                    id: entityId,
                    type: 'save',
                    data: { ...originalEntity,
                        ...data
                    },
                    original: originalEntity
                }));
            }

            try {
                const body = JSON.stringify(data);
                const response = await withRetry(() => fetchAPI(
                    `${resourcePath}/${entityId}`,
                    HttpMethod.PATCH,
                    body,
                    "application/json",
                ), mergedOptions.retryAttempts, mergedOptions.retryDelay);
                const updatedEntity = await response.json();
                logActivity('info', `Successfully saved ${name}/${entityId}.`, {
                    entityId,
                    updatedEntity
                });
                if (mergedOptions.enableOptimisticUpdates) {
                    dispatch(slice.actions.removeOptimisticUpdate({
                        id: entityId,
                        type: 'save'
                    }));
                }
                return updatedEntity;
            } catch (err) {
                logActivity('error', `Failed to save ${name}/${entityId}.`, {
                    error: err.message,
                    entityId,
                    data
                });
                if (mergedOptions.enableOptimisticUpdates && originalEntity) {
                    dispatch(slice.actions.revertOptimisticUpdate({
                        id: entityId,
                        type: 'save'
                    }));
                }
                return rejectWithValue(new EntityApiError(`Failed to save ${name} entity.`, 'ENTITY_SAVE_FAILED', err.status || 500, err.details));
            }
        },
    );

    /**
     * Creates a new entity. Supports optimistic updates and retry logic.
     * @param {Object} data - The data for the new entity.
     * @returns {Promise<any>} The created entity.
     */
    export const createOne = createAsyncThunk(
        `${name}/createOne`,
        async (data, {
            requestId,
            rejectWithValue,
            dispatch
        }) => {
            // A temporary ID for optimistic update
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            if (mergedOptions.enableOptimisticUpdates) {
                dispatch(slice.actions.addOptimisticUpdate({
                    id: tempId,
                    type: 'create',
                    data: { ...data,
                        [mergedOptions.idProperty]: tempId,
                        __isOptimistic: true
                    },
                }));
            }

            try {
                const body = JSON.stringify(data);
                const response = await withRetry(() => fetchAPI(
                    resourcePath, // POST to collection endpoint
                    HttpMethod.POST,
                    body,
                    "application/json",
                ), mergedOptions.retryAttempts, mergedOptions.retryDelay);
                const newEntity = await response.json();
                logActivity('info', `Successfully created new ${name}.`, {
                    newEntity
                });
                if (mergedOptions.enableOptimisticUpdates) {
                    dispatch(slice.actions.removeOptimisticUpdate({
                        id: tempId,
                        type: 'create',
                        realId: newEntity[mergedOptions.idProperty]
                    }));
                }
                return newEntity;
            } catch (err) {
                logActivity('error', `Failed to create new ${name}.`, {
                    error: err.message,
                    data
                });
                if (mergedOptions.enableOptimisticUpdates) {
                    dispatch(slice.actions.revertOptimisticUpdate({
                        id: tempId,
                        type: 'create'
                    }));
                }
                return rejectWithValue(new EntityApiError(`Failed to create new ${name} entity.`, 'ENTITY_CREATE_FAILED', err.status || 500, err.details));
            }
        }
    );

    /**
     * Deletes an existing entity. Supports optimistic updates and retry logic.
     * @param {string | number} entityId - The ID of the entity to delete.
     * @returns {Promise<string | number>} The ID of the deleted entity.
     */
    export const deleteOne = createAsyncThunk(
        `${name}/deleteOne`,
        async (entityId, {
            getState,
            requestId,
            rejectWithValue,
            dispatch
        }) => {
            const state = getState();
            const originalEntity = stateSelector(state).entities[entityId];

            if (mergedOptions.enableOptimisticUpdates && originalEntity) {
                dispatch(slice.actions.addOptimisticUpdate({
                    id: entityId,
                    type: 'delete',
                    original: originalEntity
                }));
            }

            try {
                await withRetry(() => fetchAPI(
                    `${resourcePath}/${entityId}`,
                    HttpMethod.DELETE,
                ), mergedOptions.retryAttempts, mergedOptions.retryDelay);
                logActivity('info', `Successfully deleted ${name}/${entityId}.`, {
                    entityId
                });
                if (mergedOptions.enableOptimisticUpdates) {
                    dispatch(slice.actions.removeOptimisticUpdate({
                        id: entityId,
                        type: 'delete'
                    }));
                }
                return entityId;
            } catch (err) {
                logActivity('error', `Failed to delete ${name}/${entityId}.`, {
                    error: err.message,
                    entityId
                });
                if (mergedOptions.enableOptimisticUpdates && originalEntity) {
                    dispatch(slice.actions.revertOptimisticUpdate({
                        id: entityId,
                        type: 'delete'
                    }));
                }
                return rejectWithValue(new EntityApiError(`Failed to delete ${name} entity.`, 'ENTITY_DELETE_FAILED', err.status || 500, err.details));
            }
        }
    );

    /**
     * Performs a semantic search using Gemini AI to find entities based on natural language.
     * Fetches details for the identified entities and updates the store.
     * @param {string} queryText - The natural language query.
     * @returns {Promise<Array<any>>} - A promise resolving to an array of entities found by semantic search.
     */
    export const semanticSearchAI = createAsyncThunk(
        `${name}/semanticSearchAI`,
        async (queryText, {
            rejectWithValue,
            dispatch
        }) => {
            if (!mergedOptions.geminiAIFeatures.semanticSearch) {
                logActivity('warn', `Gemini AI semantic search is disabled for ${name} slice.`);
                return rejectWithValue(new EntityApiError('Semantic search is not enabled.', 'AI_FEATURE_DISABLED', 400));
            }
            try {
                // First, use AI to get relevant entity IDs
                const entityIds = await geminiAIServiceInstance.semanticSearch(queryText);

                if (entityIds.length === 0) {
                    logActivity('info', `Gemini AI semantic search for "${queryText}" returned no results.`);
                    dispatch(slice.actions.setAIInsights({
                        type: 'semanticSearch',
                        query: queryText,
                        results: []
                    }));
                    return [];
                }

                logActivity('info', `Gemini AI semantic search identified ${entityIds.length} potential entities. Fetching details...`);

                // Then, fetch the full entity data for these IDs
                // This would ideally be a bulk fetch endpoint, but for demo, simulate individual fetches.
                const entitiesPromises = entityIds.map(id =>
                    withRetry(() => fetchAPI(`${resourcePath}/${id}/load`), mergedOptions.retryAttempts, mergedOptions.retryDelay)
                    .then(res => res.json())
                    .catch(err => {
                        logActivity('error', `Failed to fetch AI-suggested entity ${id}: ${err.message}`);
                        return null; // Skip if fetching one fails
                    })
                );

                const entities = (await Promise.all(entitiesPromises)).filter(Boolean); // Filter out failed fetches

                logActivity('info', `Successfully fetched ${entities.length} entities based on Gemini AI semantic search.`);
                // Dispatch action to update entity store with these new entities, and set AI insights
                dispatch(slice.actions.addEntitiesFromAISearch(entities));
                dispatch(slice.actions.setAIInsights({
                    type: 'semanticSearch',
                    query: queryText,
                    results: entities.map(e => e[mergedOptions.idProperty])
                }));

                return entities;
            } catch (err) {
                logActivity('error', `Gemini AI semantic search failed for ${name}.`, {
                    error: err.message,
                    queryText
                });
                return rejectWithValue(new EntityApiError(`Gemini AI semantic search failed.`, 'AI_SEMANTIC_SEARCH_FAILED', err.status || 500, err.details));
            }
        }
    );


    /**
     * Asynchronously analyzes a specific entity's data for normalization suggestions using Gemini AI.
     * @param {string | number} entityId - The ID of the entity to analyze.
     * @returns {Promise<Object>} - An object containing normalization suggestions or an error.
     */
    export const analyzeEntityForNormalizationAI = createAsyncThunk(
        `${name}/analyzeEntityForNormalizationAI`,
        async (entityId, {
            getState,
            rejectWithValue,
            dispatch
        }) => {
            if (!mergedOptions.geminiAIFeatures.dataNormalization) {
                logActivity('warn', `Gemini AI data normalization is disabled for ${name} slice.`);
                return rejectWithValue(new EntityApiError('Data normalization feature is not enabled.', 'AI_FEATURE_DISABLED', 400));
            }

            const state = getState();
            const entity = stateSelector(state).entities[entityId];

            if (!entity) {
                return rejectWithValue(new EntityApiError(`Entity with ID ${entityId} not found for AI analysis.`, 'ENTITY_NOT_FOUND', 404));
            }

            try {
                const insights = await geminiAIServiceInstance.suggestDataNormalization(entity);
                logActivity('info', `Gemini AI generated normalization suggestions for entity ${entityId}.`, {
                    insights
                });
                dispatch(slice.actions.addAIInsight({
                    type: 'normalizationSuggestion',
                    entityId,
                    data: insights
                }));
                return insights;
            } catch (err) {
                logActivity('error', `Gemini AI normalization analysis failed for entity ${entityId}: ${err.message}.`);
                return rejectWithValue(new EntityApiError(`AI normalization analysis failed.`, 'AI_NORMALIZATION_FAILED', err.status || 500, err.details));
            }
        }
    );

    const initialState = {
        query: {},
        pagination: {
            total: 0,
            page: 1,
            perPage: 25,
            pageLowerBound: 0,
            pageUpperBound: 0,
            hasPrevPage: false,
            hasNextPage: false,
        },
        loading: false, // Legacy global loading flag for backwards compatibility
        currentRequestId: null, // Legacy request ID for cancellation, tied to 'loading'
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed' - modern status tracking
        error: null, // Stores a detailed error object
        lastFetched: null, // Timestamp of last successful fetch operation
        aiInsights: {}, // Stores AI-generated insights, structured by insight type
        optimisticUpdates: {}, // Stores pending optimistic updates by entity ID
    };

    const slice = createSlice({
        name,
        initialState: adapter.getInitialState(initialState),
        reducers: {
            /**
             * Sets a single entity in the store. Uses upsert for consistency (adds if not exists, updates if exists).
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Object} action.payload - The entity to set.
             */
            setOne: (state, action) => {
                const {
                    payload
                } = action;
                adapter.upsertOne(state, payload);
                logActivity('debug', `Reducer: ${name}/setOne`, {
                    entityId: payload[mergedOptions.idProperty]
                });
            },
            /**
             * Sets all entities, replacing current ones.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Array<Object>} action.payload - Array of entities.
             */
            setAll: adapter.setAll,
            /**
             * Updates a single entity by its ID.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Object} action.payload - Update object ({ id, changes }).
             */
            updateOne: adapter.updateOne,
            /**
             * Removes an entity by ID.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {string | number} action.payload - The ID of the entity to remove.
             */
            removeOne: adapter.removeOne,
            /**
             * Removes multiple entities by their IDs.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Array<string | number>} action.payload - Array of IDs to remove.
             */
            removeMany: adapter.removeMany,
            /**
             * Clears all entities from the state.
             * @param {Object} state - The current Redux state.
             */
            removeAll: adapter.removeAll,
            /**
             * Updates the query parameters. Merges with existing query parameters.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Object} action.payload - New query parameters to merge.
             */
            updateQuery: (state, action) => {
                state.query = { ...state.query,
                    ...action.payload
                };
                logActivity('debug', `Reducer: ${name}/updateQuery`, {
                    newQuery: action.payload
                });
            },
            /**
             * Updates the pagination state. Merges with existing pagination parameters.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Partial<PaginationMeta>} action.payload - New pagination parameters to merge.
             */
            updatePagination: (state, action) => {
                state.pagination = { ...state.pagination,
                    ...action.payload
                };
                logActivity('debug', `Reducer: ${name}/updatePagination`, {
                    newPagination: action.payload
                });
            },
            /**
             * Sets the API error state and updates status to 'failed'.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {ApiError} action.payload - The error object to store.
             */
            setError: (state, action) => {
                state.error = action.payload;
                state.status = 'failed';
                logActivity('error', `Reducer: ${name}/setError`, {
                    error: action.payload
                });
            },
            /**
             * Clears the API error state and resets status to 'idle'.
             * @param {Object} state - The current Redux state.
             */
            clearError: (state) => {
                state.error = null;
                state.status = 'idle';
                logActivity('debug', `Reducer: ${name}/clearError`);
            },
            /**
             * Adds an AI-generated insight to the state. Supports insights specific to an entity or global.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {{type: string, entityId?: string | number, data: Object}} action.payload - The AI insight.
             */
            addAIInsight: (state, action) => {
                const {
                    type,
                    entityId,
                    data
                } = action.payload;
                if (!state.aiInsights[type]) {
                    state.aiInsights[type] = {};
                }
                if (entityId) {
                    state.aiInsights[type][entityId] = data;
                } else {
                    state.aiInsights[type] = data; // For global insights related to the slice
                }
                logActivity('info', `Reducer: ${name}/addAIInsight: ${type} for ${entityId || 'global'}`);
            },
            /**
             * Sets AI insights, overwriting existing for a specific type.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {{type: string, data: Object}} action.payload - The AI insights to set.
             */
            setAIInsights: (state, action) => {
                const {
                    type,
                    data
                } = action.payload;
                state.aiInsights[type] = data;
                logActivity('info', `Reducer: ${name}/setAIInsights: ${type}`);
            },
            /**
             * Adds an optimistic update entry to the state. Applies the change to the entity adapter immediately.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {{id: string | number, type: 'create' | 'save' | 'delete', data?: Object, original?: Object}} action.payload - Optimistic update details.
             */
            addOptimisticUpdate: (state, action) => {
                const {
                    id,
                    type,
                    data,
                    original
                } = action.payload;
                state.optimisticUpdates[id] = {
                    type,
                    original
                };
                if (type === 'create' || type === 'save') {
                    adapter.upsertOne(state, data); // Apply optimistic change
                } else if (type === 'delete') {
                    adapter.removeOne(state, id); // Optimistically remove
                }
                logActivity('debug', `Reducer: ${name}/addOptimisticUpdate: ${type} for ${id}`);
            },
            /**
             * Removes an optimistic update entry and potentially replaces a temporary ID with a real ID for 'create' operations.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {{id: string | number, type: 'create' | 'save' | 'delete', realId?: string | number}} action.payload - Optimistic update details.
             */
            removeOptimisticUpdate: (state, action) => {
                const {
                    id,
                    type,
                    realId
                } = action.payload;
                delete state.optimisticUpdates[id];
                if (type === 'create' && realId && state.entities[id]) {
                    // Replace temp ID with real ID, update entity object and ids array
                    const tempEntity = state.entities[id];
                    delete state.entities[id];
                    state.entities[realId] = { ...tempEntity,
                        [mergedOptions.idProperty]: realId,
                        __isOptimistic: undefined
                    };
                    state.ids = state.ids.map(existingId => existingId === id ? realId : existingId);
                }
                logActivity('debug', `Reducer: ${name}/removeOptimisticUpdate: ${type} for ${id}`);
            },
            /**
             * Reverts an optimistic update, typically on API failure, restoring the previous state of the entity.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {{id: string | number, type: 'create' | 'save' | 'delete'}} action.payload - Optimistic update details.
             */
            revertOptimisticUpdate: (state, action) => {
                const {
                    id,
                    type
                } = action.payload;
                const optimisticData = state.optimisticUpdates[id];
                if (optimisticData) {
                    if (type === 'create') {
                        adapter.removeOne(state, id); // Remove the optimistically added entity
                    } else if (type === 'save' && optimisticData.original) {
                        adapter.upsertOne(state, optimisticData.original); // Revert to original data
                    } else if (type === 'delete' && optimisticData.original) {
                        adapter.upsertOne(state, optimisticData.original); // Restore the deleted entity
                    }
                    delete state.optimisticUpdates[id];
                    logActivity('warn', `Reducer: ${name}/revertOptimisticUpdate: ${type} for ${id}`);
                }
            },
            /**
             * Adds entities retrieved from an AI semantic search to the store. Uses upsertMany to add or update.
             * @param {Object} state - The current Redux state.
             * @param {Object} action - The action object with payload.
             * @param {Array<Object>} action.payload - Array of entities found by AI search.
             */
            addEntitiesFromAISearch: adapter.upsertMany,
        },
        extraReducers: (builder) => {
            builder
                .addCase(show.pending, (state, action) => {
                    // Only update loading status if it's the first pending request or a new one.
                    // This prevents flickering if requests are cancelled quickly.
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        state.status = 'loading';
                        state.error = null;
                        logActivity('debug', `ExtraReducer: ${name}/show.pending`);
                    }
                })
                .addCase(show.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        adapter.upsertOne(state, action.payload); // Use upsert for single entity
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'succeeded';
                        state.lastFetched = Date.now();
                        logActivity('debug', `ExtraReducer: ${name}/show.fulfilled`);
                    }
                })
                .addCase(show.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Failed to fetch ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        logActivity('debug', `ExtraReducer: ${name}/show.rejected`, {
                            error: state.error
                        });
                    }
                })
                .addCase(search.pending, (state, action) => {
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        state.status = 'loading';
                        state.error = null;
                        logActivity('debug', `ExtraReducer: ${name}/search.pending`);
                    }
                })
                .addCase(search.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        if (action.payload) { // Payload can be null if request was cancelled by rejectWithValue
                            adapter.setAll(state, action.payload.body);
                            state.pagination = action.payload.pagination;
                        }
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'succeeded';
                        state.lastFetched = Date.now();
                        logActivity('debug', `ExtraReducer: ${name}/search.fulfilled`);
                    }
                })
                .addCase(search.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Failed to search ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        logActivity('debug', `ExtraReducer: ${name}/search.rejected`, {
                            error: state.error
                        });
                    }
                })
                .addCase(save.pending, (state, action) => {
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        state.status = 'loading';
                        state.error = null;
                        logActivity('debug', `ExtraReducer: ${name}/save.pending`);
                    }
                })
                .addCase(save.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        if (action.payload) {
                            adapter.upsertOne(state, action.payload);
                        }
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'succeeded';
                        state.lastFetched = Date.now(); // Update last fetched for saved entity
                        logActivity('debug', `ExtraReducer: ${name}/save.fulfilled`);
                    }
                })
                .addCase(save.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Failed to save ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        logActivity('debug', `ExtraReducer: ${name}/save.rejected`, {
                            error: state.error
                        });
                    }
                })
                // New thunks' extra reducers
                .addCase(createOne.pending, (state, action) => {
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.status = 'loading';
                        state.error = null;
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        logActivity('debug', `ExtraReducer: ${name}/createOne.pending`);
                    }
                })
                .addCase(createOne.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        // Optimistic update handled in `removeOptimisticUpdate` through realId.
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'succeeded';
                        state.lastFetched = Date.now();
                        logActivity('debug', `ExtraReducer: ${name}/createOne.fulfilled`);
                    }
                })
                .addCase(createOne.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Failed to create ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        logActivity('debug', `ExtraReducer: ${name}/createOne.rejected`, {
                            error: state.error
                        });
                    }
                })
                .addCase(deleteOne.pending, (state, action) => {
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.status = 'loading';
                        state.error = null;
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        logActivity('debug', `ExtraReducer: ${name}/deleteOne.pending`);
                    }
                })
                .addCase(deleteOne.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        // Optimistic update handled in `removeOptimisticUpdate`
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'succeeded';
                        logActivity('debug', `ExtraReducer: ${name}/deleteOne.fulfilled`);
                    }
                })
                .addCase(deleteOne.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Failed to delete ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        logActivity('debug', `ExtraReducer: ${name}/deleteOne.rejected`, {
                            error: state.error
                        });
                    }
                })
                .addCase(semanticSearchAI.pending, (state, action) => {
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.status = 'loading';
                        state.error = null;
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        logActivity('debug', `ExtraReducer: ${name}/semanticSearchAI.pending`);
                    }
                })
                .addCase(semanticSearchAI.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'succeeded';
                        logActivity('debug', `ExtraReducer: ${name}/semanticSearchAI.fulfilled`);
                    }
                })
                .addCase(semanticSearchAI.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.loading = false;
                        state.currentRequestId = null;
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Gemini AI semantic search failed for ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        logActivity('debug', `ExtraReducer: ${name}/semanticSearchAI.rejected`, {
                            error: state.error
                        });
                    }
                })
                .addCase(analyzeEntityForNormalizationAI.pending, (state, action) => {
                    // For AI-specific operations, might not need to set global 'loading' or 'currentRequestId'
                    // unless it's a critical blocking operation. Here, we'll keep it consistent.
                    if (!state.loading || state.currentRequestId !== action.meta.requestId) {
                        state.status = 'loading';
                        state.error = null;
                        state.loading = true;
                        state.currentRequestId = action.meta.requestId;
                        logActivity('debug', `ExtraReducer: ${name}/analyzeEntityForNormalizationAI.pending`);
                    }
                })
                .addCase(analyzeEntityForNormalizationAI.fulfilled, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.status = 'succeeded';
                        state.loading = false;
                        state.currentRequestId = null;
                        logActivity('debug', `ExtraReducer: ${name}/analyzeEntityForNormalizationAI.fulfilled`);
                    }
                })
                .addCase(analyzeEntityForNormalizationAI.rejected, (state, action) => {
                    if (state.loading && state.currentRequestId === action.meta.requestId) {
                        state.status = 'failed';
                        state.error = action.payload || new EntityApiError(action.error?.message || `Gemini AI normalization analysis failed for ${name}`, 'UNKNOWN_ERROR', action.error?.status || 500);
                        state.loading = false;
                        state.currentRequestId = null;
                        logActivity('debug', `ExtraReducer: ${name}/analyzeEntityForNormalizationAI.rejected`, {
                            error: state.error
                        });
                    }
                });
        },
    });

    // Explicitly add thunks to slice.actions for easier consumption and discoverability
    slice.actions.search = search;
    slice.actions.show = show;
    slice.actions.save = save;
    slice.actions.createOne = createOne;
    slice.actions.deleteOne = deleteOne;
    slice.actions.semanticSearchAI = semanticSearchAI;
    slice.actions.analyzeEntityForNormalizationAI = analyzeEntityForNormalizationAI;

    return {
        slice,
        adapter,
        selector, // The main comprehensive selector
        // Also export specific selectors for modularity and direct use
        simpleSelectors,
        queryStringSelector,
        fullQueryStringSelector,
        selectFilteredAndSortedEntities,
        selectEntityLoadingStatus,
    };
}