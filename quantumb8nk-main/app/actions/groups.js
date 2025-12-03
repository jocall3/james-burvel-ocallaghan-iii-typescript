/**
 * @file This file manages group and role-related actions within the application.
 * It leverages advanced Gemini AI capabilities for various tasks including
 * validation, auditing, recommendation, and intelligent data processing,
 * aiming for a highly robust, scalable, and professional-grade system.
 *
 * @module GroupActions
 */

// DO NOT CHANGE OR REMOVE EXISTING IMPORT STATEMENTS
// (There are none in the original file, so this is a placeholder comment)

/**
 * @global
 * @external GeminiAPI
 * @description Assumes `window.gemini` is globally available and provides access to the Gemini AI API.
 */

// --- Configuration Constants ---

/**
 * @typedef {Object} GeminiModelConfig
 * @property {string} modelName - The name of the Gemini model to use (e.g., "gemini-pro").
 * @property {Object} generationConfig - Configuration for content generation.
 * @property {number} generationConfig.temperature - Controls the randomness of outputs.
 * @property {number} generationConfig.topK - Top-K sampling parameter.
 * @property {number} generationConfig.topP - Top-P sampling parameter.
 * @property {number} generationConfig.maxOutputTokens - Maximum number of tokens in the output.
 * @property {Array<Object>} safetySettings - Safety settings for content generation.
 */

/**
 * Default configuration for the Gemini AI model.
 * @type {GeminiModelConfig}
 */
const DEFAULT_GEMINI_CONFIG = {
    modelName: "gemini-pro",
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
    },
    safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
};

/**
 * API endpoints for group/role management.
 * @readonly
 * @enum {string}
 */
const API_ENDPOINTS = {
    BASE_SETTINGS_ROLES: "/settings/roles",
    ROLE_BY_ID: (id) => `/settings/roles/${id}`,
    GROUP_MEMBERS: (groupId) => `/settings/groups/${groupId}/members`,
    GROUP_AUDIT_LOGS: (groupId) => `/settings/groups/${groupId}/audit`,
    GROUP_DETAILS: (groupId) => `/settings/groups/${groupId}`,
    GROUP_LIST: "/settings/groups",
};

/**
 * Standardized status messages for Gemini AI responses.
 * @readonly
 * @enum {string}
 */
const GEMINI_STATUS = {
    SUCCESS: "success",
    ERROR: "error",
};

/**
 * Standardized error messages.
 * @readonly
 * @enum {string}
 */
const ERROR_MESSAGES = {
    UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
    NETWORK_ERROR: "Network error: Could not reach the server.",
    GEMINI_PARSE_ERROR: "Failed to parse Gemini model response. Invalid JSON format.",
    GEMINI_UNEXPECTED_RESPONSE: "An unexpected response format was received from the Gemini model.",
    GEMINI_API_ERROR: (message) => `Gemini API Error: ${message}`,
    INVALID_INPUT: "Invalid input provided.",
    OPERATION_FAILED: (operation) => `The ${operation} operation failed.`,
    NOT_FOUND: (entityType, id) => `${entityType} with ID ${id} not found.`,
};

/**
 * @typedef {Object} RoleData
 * @property {string} name - The name of the role.
 * @property {string} description - A description of the role.
 * @property {string[]} permissions - An array of permissions associated with the role.
 * @property {Object} [metadata] - Optional metadata for the role.
 */

/**
 * @typedef {Object} GroupData
 * @property {string} name - The name of the group.
 * @property {string} description - A description of the group.
 * @property {string[]} [roles] - Optional array of role IDs associated with the group.
 * @property {string[]} [memberIds] - Optional array of user IDs who are members of the group.
 * @property {Object} [settings] - Optional group-specific settings.
 */

/**
 * @typedef {Object} GeminiResponse
 * @property {string} status - "success" or "error".
 * @property {string} [id] - The ID of the created or updated entity.
 * @property {string} [message] - An error message.
 * @property {Object} [data] - Any additional data returned by Gemini.
 * @property {Array<Object>} [recommendations] - AI recommendations.
 * @property {Object} [analysis] - AI analysis results.
 */

// --- Utility and Helper Functions ---

/**
 * Standardized logging utility. In a real application, this would integrate with a robust logging service.
 * @param {string} level - The log level (e.g., 'info', 'warn', 'error').
 * @param {string} message - The log message.
 * @param {Object} [context] - Additional context for the log.
 */
function _log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level: level.toUpperCase(), message, context };
    if (process.env.NODE_ENV !== 'production') {
        console[level](`[GroupActions - ${level.toUpperCase()}] ${message}`, context);
    }
    // In a production environment, send this to a dedicated logging service
    // e.g., `sendToLoggingService(logEntry);`
}

/**
 * Parses the text response from the Gemini model, ensuring it's valid JSON.
 * @param {string} responseText - The raw text response from Gemini.
 * @returns {GeminiResponse} The parsed JSON object.
 * @throws {Error} If the response is not valid JSON or does not conform to expected structure.
 */
function _parseGeminiResponse(responseText) {
    try {
        const parsedResponse = JSON.parse(responseText);
        if (!parsedResponse || (parsedResponse.status !== GEMINI_STATUS.SUCCESS && parsedResponse.status !== GEMINI_STATUS.ERROR)) {
            _log('error', ERROR_MESSAGES.GEMINI_UNEXPECTED_RESPONSE, { responseText });
            throw new Error(ERROR_MESSAGES.GEMINI_UNEXPECTED_RESPONSE);
        }
        return parsedResponse;
    } catch (parseError) {
        _log('error', ERROR_MESSAGES.GEMINI_PARSE_ERROR, { responseText, parseError });
        throw new Error(`${ERROR_MESSAGES.GEMINI_PARSE_ERROR}: ${parseError.message}`);
    }
}

/**
 * Executes a Gemini model query with retry logic.
 * @param {string} prompt - The prompt to send to the Gemini model.
 * @param {GeminiModelConfig} [config=DEFAULT_GEMINI_CONFIG] - Configuration for the Gemini model.
 * @param {number} [retries=3] - Number of retry attempts.
 * @param {number} [delay=1000] - Delay in milliseconds between retries.
 * @returns {Promise<GeminiResponse>} The parsed Gemini response.
 * @throws {Error} If the Gemini API call fails after all retries.
 */
async function _executeGeminiQuery(prompt, config = DEFAULT_GEMINI_CONFIG, retries = 3, delay = 1000) {
    if (!window.gemini || typeof window.gemini.getGenerativeModel !== 'function') {
        _log('error', "Gemini API not initialized or available.");
        throw new Error("Gemini API is not available.");
    }

    for (let i = 0; i < retries; i++) {
        try {
            const model = window.gemini.getGenerativeModel({
                model: config.modelName,
                safetySettings: config.safetySettings,
                generationConfig: config.generationConfig,
            });
            _log('info', 'Sending prompt to Gemini model.', { attempt: i + 1, prompt: prompt.substring(0, 100) + '...' });
            const result = await model.generateContent(prompt);
            const responseText = await result.response.text();
            return _parseGeminiResponse(responseText);
        } catch (error) {
            _log('warn', `Gemini API call failed (attempt ${i + 1}/${retries}).`, { error: error.message });
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay * (i + 1))); // Exponential backoff
            } else {
                _log('error', `Gemini API call failed after ${retries} attempts.`, { finalError: error.message });
                throw new Error(ERROR_MESSAGES.GEMINI_API_ERROR(error.message));
            }
        }
    }
}

/**
 * Simulates a backend API call. In a real application, this would be `fetch` or an Axios instance.
 * For this exercise, it's a simple mock that always returns success or failure based on a slight delay.
 * @param {string} endpoint - The API endpoint.
 * @param {Object} options - Fetch options (method, body, headers).
 * @returns {Promise<Object>} A promise that resolves with a mock response or rejects with an error.
 */
async function _simulateBackendCall(endpoint, options) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success rate for simulation
                _log('info', `Simulated backend call successful for: ${endpoint}`, { options });
                resolve({
                    status: 200,
                    json: async () => ({
                        status: GEMINI_STATUS.SUCCESS,
                        message: "Operation successful (simulated).",
                        id: options.method === 'POST' ? `grp_${Date.now()}` : endpoint.split('/').pop(),
                        data: JSON.parse(options.body || '{}'),
                    })
                });
            } else {
                _log('error', `Simulated backend call failed for: ${endpoint}`, { options });
                reject(new Error(`Simulated server error for ${endpoint}`));
            }
        }, Math.random() * 500 + 200); // Simulate network latency
    });
}

// --- Core Group Management Service ---

/**
 * @class GroupManagementService
 * @description A comprehensive service for managing groups and roles,
 * leveraging Gemini AI for advanced capabilities. This class encapsulates
 * all business logic related to group operations.
 */
export class GroupManagementService {
    /**
     * Creates an instance of GroupManagementService.
     * @param {Object} [config={}] - Optional configuration for the service.
     * @param {GeminiModelConfig} [config.geminiConfig=DEFAULT_GEMINI_CONFIG] - Gemini model configuration.
     * @param {Function} [config.backendApiCaller=_simulateBackendCall] - Function to call backend APIs.
     */
    constructor(config = {}) {
        /** @private @type {GeminiModelConfig} */
        this._geminiConfig = config.geminiConfig || DEFAULT_GEMINI_CONFIG;
        /** @private @type {Function} */
        this._backendApiCaller = config.backendApiCaller || _simulateBackendCall;
        _log('info', 'GroupManagementService initialized.');
    }

    /**
     * Generates a Gemini prompt for role/group management operations.
     * @private
     * @param {string} actionDescription - A descriptive string of the action being performed.
     * @param {string} method - The HTTP method (e.g., "GET", "POST", "PATCH", "DELETE").
     * @param {string} targetEndpoint - The target API endpoint.
     * @param {Object} [payload={}] - The data payload for the operation.
     * @returns {string} The constructed Gemini prompt.
     */
    _generatePrompt(actionDescription, method, targetEndpoint, payload = {}) {
        return `You are an expert backend API for role and group management.
        Perform the following operation: ${actionDescription}.
        Method: ${method}
        Target Endpoint: ${targetEndpoint}
        Payload: ${JSON.stringify(payload)}

        Respond with a JSON object.
        If successful, the JSON must contain "status": "${GEMINI_STATUS.SUCCESS}" and relevant data (e.g., "id": "The ID of the updated or newly created entity (as a string)", "data": { ... }).
        If there is an error, the JSON must contain "status": "${GEMINI_STATUS.ERROR}" and "message": "A descriptive error message".
        Do not include any other text or formatting outside the JSON.`;
    }

    /**
     * Generic method to handle Gemini-driven CRUD operations.
     * @private
     * @param {string} actionDescription - Description for the Gemini prompt.
     * @param {string} method - HTTP method.
     * @param {string} endpoint - API endpoint.
     * @param {Object} [data={}] - Payload for the backend call.
     * @returns {Promise<GeminiResponse>} The parsed response from Gemini after processing the backend call result.
     * @throws {Error} If any step in the process fails.
     */
    async _performAIOperation(actionDescription, method, endpoint, data = {}) {
        try {
            const prompt = this._generatePrompt(actionDescription, method, endpoint, data);
            const geminiInitialResponse = await _executeGeminiQuery(prompt, this._geminiConfig);

            if (geminiInitialResponse.status === GEMINI_STATUS.ERROR) {
                _log('error', `Gemini pre-processing indicated an error for ${actionDescription}.`, { geminiMessage: geminiInitialResponse.message });
                throw new Error(geminiInitialResponse.message);
            }

            // Simulate backend interaction based on Gemini's "approval" or suggested data
            const backendResponse = await this._backendApiCaller(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const backendResult = await backendResponse.json();

            // Use Gemini to interpret and confirm the backend result
            const postProcessPrompt = `You just processed a backend operation for: ${actionDescription}.
            The backend API responded with: ${JSON.stringify(backendResult)}.
            Based on this, confirm the status of the operation.
            If successful, respond with {"status": "success", "id": "...", "message": "..."}.
            If an error occurred, respond with {"status": "error", "message": "..."}.
            Include any relevant data from the backend result in the 'data' field if status is 'success'.`;

            const geminiFinalResponse = await _executeGeminiQuery(postProcessPrompt, this._geminiConfig);

            if (geminiFinalResponse.status === GEMINI_STATUS.SUCCESS) {
                _log('info', `Operation '${actionDescription}' completed successfully via AI.`);
            } else {
                _log('error', `Operation '${actionDescription}' failed during AI post-processing.`, { geminiMessage: geminiFinalResponse.message });
                throw new Error(geminiFinalResponse.message || ERROR_MESSAGES.OPERATION_FAILED(actionDescription));
            }

            return geminiFinalResponse;

        } catch (error) {
            _log('error', `Failed to perform AI-driven operation '${actionDescription}'.`, { error: error.message });
            throw error;
        }
    }

    /**
     * Creates a new role with AI validation and enrichment.
     * @param {RoleData} roleData - The data for the new role.
     * @returns {Promise<GeminiResponse>} A promise that resolves with the AI-processed response.
     */
    async createRole(roleData) {
        _log('info', `Initiating role creation for: ${roleData.name}`);
        const validationPrompt = `You are a role definition validator and enricher.
        Given the following role data: ${JSON.stringify(roleData)}.
        1. Validate if 'name' and 'description' are present and reasonable.
        2. Suggest additional permissions if the provided ones are too generic for common enterprise roles (e.g., 'Admin', 'Editor', 'Viewer').
        3. Provide a brief summary of the role's expected impact.
        Respond with {"status": "success", "validatedData": {...}, "recommendations": [...], "impactSummary": "..."}
        or {"status": "error", "message": "reason for failure"}.`;

        const validationResult = await _executeGeminiQuery(validationPrompt, this._geminiConfig);
        if (validationResult.status === GEMINI_STATUS.ERROR) {
            throw new Error(`Role validation failed: ${validationResult.message}`);
        }

        const enrichedRoleData = { ...roleData, ...validationResult.validatedData };
        if (validationResult.recommendations && validationResult.recommendations.length > 0) {
            enrichedRoleData.permissions = [...new Set([...(enrichedRoleData.permissions || []), ...validationResult.recommendations])];
            _log('info', 'Role permissions enriched by AI.', { original: roleData.permissions, new: enrichedRoleData.permissions });
        }

        return this._performAIOperation(
            `create a new role with AI enrichment (name: ${enrichedRoleData.name})`,
            "POST",
            API_ENDPOINTS.BASE_SETTINGS_ROLES,
            enrichedRoleData
        );
    }

    /**
     * Updates an existing role with AI validation and change impact analysis.
     * @param {string} id - The ID of the role to update.
     * @param {RoleData} roleData - The updated role data.
     * @returns {Promise<GeminiResponse>} A promise that resolves with the AI-processed response.
     */
    async updateRole(id, roleData) {
        _log('info', `Initiating role update for ID: ${id}`);
        const impactAnalysisPrompt = `You are a role change impact analyst.
        An existing role with ID '${id}' is being updated with the following data: ${JSON.stringify(roleData)}.
        Analyze the potential impact of these changes on users and system security.
        Identify any critical changes in permissions.
        Respond with {"status": "success", "impactAnalysis": "...", "criticalChangesDetected": boolean}
        or {"status": "error", "message": "reason for failure"}.`;

        const impactResult = await _executeGeminiQuery(impactAnalysisPrompt, this._geminiConfig);
        if (impactResult.status === GEMINI_STATUS.ERROR) {
            throw new Error(`Role update impact analysis failed: ${impactResult.message}`);
        }

        if (impactResult.criticalChangesDetected) {
            _log('warn', `Critical changes detected for role ID ${id}: ${impactResult.impactAnalysis}`);
            // In a real system, this might trigger an approval workflow or additional warnings.
        }

        return this._performAIOperation(
            `update a role with ID ${id} and AI impact analysis`,
            "PATCH",
            API_ENDPOINTS.ROLE_BY_ID(id),
            roleData
        );
    }

    /**
     * Fetches details of a specific group, potentially enriching them with AI-generated insights.
     * @param {string} groupId - The ID of the group.
     * @returns {Promise<GeminiResponse>} A promise resolving with group details and AI insights.
     */
    async getGroupDetails(groupId) {
        _log('info', `Fetching group details for ID: ${groupId}`);
        const backendResponse = await this._backendApiCaller(API_ENDPOINTS.GROUP_DETAILS(groupId), { method: "GET" });
        const groupDetails = await backendResponse.json();

        const insightPrompt = `Analyze the following group details: ${JSON.stringify(groupDetails.data || groupDetails)}.
        Provide an AI-generated summary of the group's purpose, potential areas for optimization (e.g., redundant permissions, inactive members), and compliance risks.
        Respond with {"status": "success", "summary": "...", "optimizationAreas": [...], "complianceRisks": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const insights = await _executeGeminiQuery(insightPrompt, this._geminiConfig);
        if (insights.status === GEMINI_STATUS.ERROR) {
            _log('warn', `Failed to generate AI insights for group ${groupId}: ${insights.message}`);
            // Continue with raw details if AI fails, don't block.
            return { status: GEMINI_STATUS.SUCCESS, data: groupDetails.data || groupDetails, message: "Could not generate AI insights." };
        }

        return { status: GEMINI_STATUS.SUCCESS, data: { ...(groupDetails.data || groupDetails), aiInsights: insights } };
    }

    /**
     * Lists groups, allowing for AI-driven filtering or sorting recommendations.
     * @param {Object} [filterCriteria={}] - Criteria to filter groups (e.g., { name: 'Admin', minMembers: 5 }).
     * @returns {Promise<GeminiResponse>} A promise resolving with the list of groups, potentially AI-sorted.
     */
    async listGroups(filterCriteria = {}) {
        _log('info', `Listing groups with criteria: ${JSON.stringify(filterCriteria)}`);
        const backendResponse = await this._backendApiCaller(API_ENDPOINTS.GROUP_LIST, { method: "GET" });
        const allGroups = await backendResponse.json(); // Assuming { status: 'success', data: [...] }

        const aiFilterPrompt = `Given a list of groups: ${JSON.stringify(allGroups.data || allGroups)}.
        And the following filter criteria: ${JSON.stringify(filterCriteria)}.
        Filter and/or sort these groups based on the criteria, prioritizing security and efficiency.
        Respond with {"status": "success", "filteredGroups": [...], "aiSortingRationale": "..."}
        or {"status": "error", "message": "reason for failure"}.`;

        const aiResult = await _executeGeminiQuery(aiFilterPrompt, this._geminiConfig);
        if (aiResult.status === GEMINI_STATUS.ERROR) {
            _log('warn', `AI filtering/sorting failed, returning raw group list: ${aiResult.message}`);
            return { status: GEMINI_STATUS.SUCCESS, data: allGroups.data || allGroups, message: "AI filtering failed, returning unfiltered list." };
        }

        return { status: GEMINI_STATUS.SUCCESS, data: aiResult.filteredGroups, aiSortingRationale: aiResult.aiSortingRationale };
    }

    /**
     * Deletes a group after AI performs a pre-deletion impact analysis.
     * @param {string} groupId - The ID of the group to delete.
     * @returns {Promise<GeminiResponse>} A promise resolving with the deletion confirmation.
     */
    async deleteGroup(groupId) {
        _log('info', `Initiating deletion for group ID: ${groupId}`);
        const preDeletePrompt = `You are a system security expert.
        A request has been made to delete group with ID '${groupId}'.
        Simulate the potential impact of this deletion on system access, data integrity, and compliance.
        Highlight any critical dependencies or active users that might be affected.
        Respond with {"status": "success", "impactSummary": "...", "canProceed": boolean, "warnings": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const preDeleteAnalysis = await _executeGeminiQuery(preDeletePrompt, this._geminiConfig);
        if (preDeleteAnalysis.status === GEMINI_STATUS.ERROR) {
            throw new Error(`Pre-deletion analysis failed: ${preDeleteAnalysis.message}`);
        }
        if (!preDeleteAnalysis.canProceed) {
            _log('error', `Deletion of group ${groupId} blocked by AI due to potential high impact.`, { warnings: preDeleteAnalysis.warnings });
            throw new Error(`Deletion blocked: ${preDeleteAnalysis.impactSummary} Warnings: ${JSON.stringify(preDeleteAnalysis.warnings)}`);
        }
        _log('warn', `Pre-deletion analysis for group ${groupId}: ${preDeleteAnalysis.impactSummary}`);

        return this._performAIOperation(
            `delete group with ID ${groupId} after AI impact analysis`,
            "DELETE",
            API_ENDPOINTS.GROUP_DETAILS(groupId)
        );
    }

    /**
     * Assigns a user to a group after AI validation of the assignment's implications.
     * @param {string} groupId - The ID of the group.
     * @param {string} userId - The ID of the user to assign.
     * @param {Object} [assignmentContext={}] - Additional context for the assignment.
     * @returns {Promise<GeminiResponse>} A promise resolving with the assignment confirmation.
     */
    async assignUserToGroup(groupId, userId, assignmentContext = {}) {
        _log('info', `Attempting to assign user ${userId} to group ${groupId}.`);
        const validationPrompt = `You are an access control policy expert.
        A user with ID '${userId}' is being assigned to group with ID '${groupId}'.
        Consider the user's existing roles/permissions (assume an empty array if not provided) and the group's expected permissions.
        Evaluate if this assignment introduces any security risks (e.g., excessive permissions, conflict of interest) or violates compliance policies.
        Respond with {"status": "success", "validationResult": "...", "risksDetected": boolean, "suggestedMitigations": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const validationResult = await _executeGeminiQuery(validationPrompt, this._geminiConfig);
        if (validationResult.status === GEMINI_STATUS.ERROR) {
            throw new Error(`User assignment validation failed: ${validationResult.message}`);
        }
        if (validationResult.risksDetected) {
            _log('error', `Assignment of user ${userId} to group ${groupId} blocked due to AI-detected risks: ${validationResult.validationResult}`);
            throw new Error(`Assignment blocked: ${validationResult.validationResult}. Suggested mitigations: ${JSON.stringify(validationResult.suggestedMitigations)}`);
        }

        return this._performAIOperation(
            `assign user ${userId} to group ${groupId} with AI validation`,
            "POST",
            API_ENDPOINTS.GROUP_MEMBERS(groupId),
            { userId, ...assignmentContext }
        );
    }

    /**
     * Removes a user from a group, with AI confirming the operational impact.
     * @param {string} groupId - The ID of the group.
     * @param {string} userId - The ID of the user to remove.
     * @returns {Promise<GeminiResponse>} A promise resolving with the removal confirmation.
     */
    async removeUserFromGroup(groupId, userId) {
        _log('info', `Attempting to remove user ${userId} from group ${groupId}.`);
        const impactPrompt = `You are an operational impact analyst.
        User with ID '${userId}' is being removed from group '${groupId}'.
        Analyze the potential impact on ongoing projects, access to critical resources, and system functionality.
        Respond with {"status": "success", "impactSummary": "...", "canProceed": boolean, "warnings": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const impactAnalysis = await _executeGeminiQuery(impactPrompt, this._geminiConfig);
        if (impactAnalysis.status === GEMINI_STATUS.ERROR) {
            throw new Error(`User removal impact analysis failed: ${impactAnalysis.message}`);
        }
        if (!impactAnalysis.canProceed) {
            _log('warn', `Removal of user ${userId} from group ${groupId} has potential issues: ${impactAnalysis.impactSummary}`);
            // In a real app, this might be a soft block or require override. For now, it's a strong warning.
        }

        return this._performAIOperation(
            `remove user ${userId} from group ${groupId} with AI impact analysis`,
            "DELETE",
            `${API_ENDPOINTS.GROUP_MEMBERS(groupId)}/${userId}`
        );
    }

    /**
     * Generates a comprehensive AI-powered audit report for a specific group.
     * This might involve fetching audit logs and summarizing them.
     * @param {string} groupId - The ID of the group to audit.
     * @returns {Promise<GeminiResponse>} A promise resolving with the audit report.
     */
    async auditGroup(groupId) {
        _log('info', `Generating AI audit report for group ID: ${groupId}`);
        // Simulate fetching audit logs for the group
        const auditLogsResponse = await this._backendApiCaller(API_ENDPOINTS.GROUP_AUDIT_LOGS(groupId), { method: "GET" });
        const auditLogs = await auditLogsResponse.json(); // Assuming { status: 'success', data: [...] }

        const auditPrompt = `You are a cybersecurity auditor.
        Review the following audit logs and group details for group ID '${groupId}':
        Group Details: ${JSON.stringify(await this.getGroupDetails(groupId))}
        Audit Logs: ${JSON.stringify(auditLogs.data || auditLogs)}
        Generate a summary of all significant activities, identify any potential security vulnerabilities,
        compliance breaches, or anomalies. Suggest corrective actions.
        Respond with {"status": "success", "auditReport": "...", "findings": [...], "recommendations": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const auditResult = await _executeGeminiQuery(auditPrompt, this._geminiConfig);
        if (auditResult.status === GEMINI_STATUS.ERROR) {
            _log('error', `Failed to generate AI audit report for group ${groupId}: ${auditResult.message}`);
            throw new Error(`AI audit report generation failed: ${auditResult.message}`);
        }

        _log('info', `AI audit report generated for group ${groupId}.`, { findings: auditResult.findings.length });
        return auditResult;
    }

    /**
     * Recommends optimal permissions for a role based on its name and existing permissions,
     * leveraging AI to infer best practices and common patterns.
     * @param {string} roleName - The name of the role (e.g., "Marketing Manager", "Database Admin").
     * @param {string[]} [currentPermissions=[]] - Existing permissions for the role.
     * @returns {Promise<GeminiResponse>} A promise resolving with recommended permissions.
     */
    async recommendPermissions(roleName, currentPermissions = []) {
        _log('info', `Requesting AI permission recommendations for role: ${roleName}`);
        const prompt = `You are an expert in enterprise role-based access control (RBAC).
        Given a role name "${roleName}" and its current permissions: ${JSON.stringify(currentPermissions)}.
        Recommend a comprehensive set of permissions that are typical for this type of role in a modern enterprise,
        ensuring the principle of least privilege while enabling necessary functions.
        Also, identify any potentially conflicting or redundant permissions in the current set.
        Respond with {"status": "success", "recommendedPermissions": [...], "conflictsDetected": [...], "rationale": "..."}
        or {"status": "error", "message": "reason for failure"}.`;

        const result = await _executeGeminiQuery(prompt, this._geminiConfig);
        if (result.status === GEMINI_STATUS.ERROR) {
            _log('error', `AI permission recommendation failed for role ${roleName}: ${result.message}`);
            throw new Error(`Permission recommendation failed: ${result.message}`);
        }

        _log('info', `AI permission recommendations generated for role ${roleName}.`);
        return result;
    }

    /**
     * Validates group data against predefined or AI-inferred policy rules.
     * @param {GroupData} groupData - The data of the group to validate.
     * @param {Object[]} [policyRules=[]] - Optional array of explicit policy rules.
     * @returns {Promise<GeminiResponse>} A promise resolving with the validation result.
     */
    async validateGroupPolicy(groupData, policyRules = []) {
        _log('info', `Validating group policy for group: ${groupData.name}`);
        const prompt = `You are a compliance and policy enforcement AI.
        Validate the following group data: ${JSON.stringify(groupData)}.
        Against these explicit policy rules: ${JSON.stringify(policyRules)}.
        Additionally, infer general best practices for group management (e.g., naming conventions, minimum required fields, maximum number of members for critical groups).
        Identify any violations, warnings, or suggestions for improvement.
        Respond with {"status": "success", "isValid": boolean, "violations": [...], "warnings": [...], "suggestions": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const result = await _executeGeminiQuery(prompt, this._geminiConfig);
        if (result.status === GEMINI_STATUS.ERROR) {
            _log('error', `AI policy validation failed for group ${groupData.name}: ${result.message}`);
            throw new Error(`Policy validation failed: ${result.message}`);
        }

        _log('info', `AI policy validation completed for group ${groupData.name}. Is Valid: ${result.isValid}`);
        return result;
    }

    /**
     * Generates a concise, AI-powered summary for a group, detailing its purpose,
     * key members, associated roles, and recent activity.
     * @param {string} groupId - The ID of the group.
     * @returns {Promise<GeminiResponse>} A promise resolving with the group summary.
     */
    async generateGroupSummary(groupId) {
        _log('info', `Generating AI summary for group ID: ${groupId}`);
        // Fetch group details and potentially recent activity logs
        const groupDetailsResponse = await this._backendApiCaller(API_ENDPOINTS.GROUP_DETAILS(groupId), { method: "GET" });
        const groupDetails = await groupDetailsResponse.json();
        const auditLogsResponse = await this._backendApiCaller(API_ENDPOINTS.GROUP_AUDIT_LOGS(groupId), { method: "GET" });
        const auditLogs = await auditLogsResponse.json();

        const prompt = `You are an intelligent summarization engine for enterprise groups.
        Given the following group details: ${JSON.stringify(groupDetails.data || groupDetails)}
        And recent audit logs: ${JSON.stringify((auditLogs.data || []).slice(0, 5))} (top 5 recent logs for brevity).
        Generate a concise summary that includes:
        - The group's primary purpose.
        - Key associated roles/permissions.
        - Number of members.
        - Highlight of most recent significant activity.
        - Any notable security or compliance aspects.
        Respond with {"status": "success", "groupSummary": "..."}
        or {"status": "error", "message": "reason for failure"}.`;

        const result = await _executeGeminiQuery(prompt, this._geminiConfig);
        if (result.status === GEMINI_STATUS.ERROR) {
            _log('error', `AI group summary generation failed for group ${groupId}: ${result.message}`);
            throw new Error(`Group summary generation failed: ${result.message}`);
        }

        _log('info', `AI group summary generated for group ${groupId}.`);
        return result;
    }

    /**
     * Predicts the potential impact of a proposed change (e.g., adding a new permission,
     * changing a role description) on a specific group or the overall system.
     * @param {string} actionType - The type of action (e.g., "add_permission", "change_role_desc").
     * @param {string} entityId - The ID of the entity being changed (group or role ID).
     * @param {Object} proposedChanges - The data representing the proposed changes.
     * @returns {Promise<GeminiResponse>} A promise resolving with the impact prediction.
     */
    async predictImpact(actionType, entityId, proposedChanges) {
        _log('info', `Predicting impact for action "${actionType}" on entity ${entityId}.`);
        // Potentially fetch current state of the entity
        const currentState = await this.getGroupDetails(entityId).catch(() => ({})); // Or getRoleDetails

        const prompt = `You are a predictive analytics engine for access control systems.
        Given an action type "${actionType}" on entity ID "${entityId}",
        with proposed changes: ${JSON.stringify(proposedChanges)}.
        And the current state of the entity (if available): ${JSON.stringify(currentState.data || currentState)}.
        Predict the short-term and long-term impact on:
        - Security posture (e.g., new vulnerabilities, improved security).
        - Operational efficiency (e.g., simplified access, increased overhead).
        - Compliance adherence (e.g., new violations, improved compliance).
        - User experience (e.g., new capabilities, restricted access).
        Respond with {"status": "success", "predictedImpact": {...}, "confidenceScore": number, "potentialRisks": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const result = await _executeGeminiQuery(prompt, this._geminiConfig);
        if (result.status === GEMINI_STATUS.ERROR) {
            _log('error', `AI impact prediction failed for ${actionType} on ${entityId}: ${result.message}`);
            throw new Error(`Impact prediction failed: ${result.message}`);
        }

        _log('info', `AI impact prediction completed for ${actionType} on ${entityId} with confidence ${result.confidenceScore}.`);
        return result;
    }

    /**
     * Recommends merging two groups if AI determines there's significant overlap or efficiency gains.
     * @param {string} groupAId - The ID of the first group.
     * @param {string} groupBId - The ID of the second group.
     * @returns {Promise<GeminiResponse>} A promise resolving with the merge recommendation and rationale.
     */
    async recommendGroupMerge(groupAId, groupBId) {
        _log('info', `Evaluating merge recommendation for groups ${groupAId} and ${groupBId}.`);
        const groupADetails = await this.getGroupDetails(groupAId).catch(() => ({}));
        const groupBDetails = await this.getGroupDetails(groupBId).catch(() => ({}));

        const prompt = `You are an organizational structure optimization AI.
        Given details for Group A (${groupAId}): ${JSON.stringify(groupADetails.data || groupADetails)}
        And Group B (${groupBId}): ${JSON.stringify(groupBDetails.data || groupBDetails)}.
        Analyze their members, roles, permissions, and purpose.
        Determine if merging these two groups would lead to significant efficiency gains, reduced complexity, or improved security posture.
        If a merge is recommended, provide a detailed rationale, potential challenges, and a suggested merged group structure.
        Respond with {"status": "success", "recommendMerge": boolean, "rationale": "...", "mergedGroupSuggestion": {...}, "potentialChallenges": [...]}
        or {"status": "error", "message": "reason for failure"}.`;

        const result = await _executeGeminiQuery(prompt, this._geminiConfig);
        if (result.status === GEMINI_STATUS.ERROR) {
            _log('error', `AI group merge recommendation failed for ${groupAId} and ${groupBId}: ${result.message}`);
            throw new Error(`Group merge recommendation failed: ${result.message}`);
        }

        if (result.recommendMerge) {
            _log('info', `AI recommends merging groups ${groupAId} and ${groupBId}.`);
        } else {
            _log('info', `AI does NOT recommend merging groups ${groupAId} and ${groupBId}.`);
        }
        return result;
    }
}

/**
 * Singleton instance of GroupManagementService.
 * This ensures consistent configuration and state across the application.
 * @type {GroupManagementService}
 */
let _groupServiceInstance = null;

/**
 * Initializes the GroupManagementService. Must be called once before using other group actions.
 * @param {Object} [config={}] - Configuration for the service.
 * @returns {GroupManagementService} The initialized service instance.
 * @throws {Error} If the service is attempted to be re-initialized with different config.
 */
export function initializeGroupManagement(config = {}) {
    if (_groupServiceInstance) {
        _log('warn', 'GroupManagementService already initialized. Returning existing instance.');
        return _groupServiceInstance;
    }
    _groupServiceInstance = new GroupManagementService(config);
    return _groupServiceInstance;
}

/**
 * Retrieves the singleton instance of GroupManagementService.
 * @returns {GroupManagementService} The initialized service instance.
 * @throws {Error} If `initializeGroupManagement` has not been called yet.
 */
function _getGroupService() {
    if (!_groupServiceInstance) {
        _log('error', 'GroupManagementService has not been initialized. Call initializeGroupManagement() first.');
        throw new Error('GroupManagementService has not been initialized. Call initializeGroupManagement() first.');
    }
    return _groupServiceInstance;
}

// --- Exported Action Creators (Integrates with existing pattern) ---

/**
 * @typedef {function(string): void} DispatchFunction
 * A callback function typically used to dispatch success or error messages to the UI.
 */

/**
 * Updates an existing role or creates a new one, leveraging Gemini AI for validation and impact analysis.
 * This is the enhanced version of the original `updateGroup` function, now interacting with the `GroupManagementService`.
 * @param {string|null} id - The ID of the role to update. If null, a new role will be created.
 * @param {RoleData} data - The role data to be updated or created.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operations.
 * @param {DispatchFunction} dispatchError - Callback for failed operations.
 * @returns {Function} An async thunk function.
 */
export function updateGroup(id, data, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Attempting to ${id ? 'update' : 'create'} role.`);
        try {
            const groupService = _getGroupService();
            let response;
            if (id) {
                response = await groupService.updateRole(id, data);
            } else {
                response = await groupService.createRole(data);
            }

            if (response.status === GEMINI_STATUS.SUCCESS) {
                const newId = response.id || id; // Use newId if created, else existing id
                if (newId) {
                    window.location.href = `/settings/roles/${newId}`;
                }
                dispatchSuccess(response.message || "Operation successful!");
            } else {
                dispatchError(response.message || ERROR_MESSAGES.OPERATION_FAILED(id ? 'update role' : 'create role'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to ${id ? 'update' : 'create'} role: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Fetches group details and AI-generated insights for a given group ID.
 * @param {string} groupId - The ID of the group.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operations, receives `{ data: GroupData, aiInsights: Object }`.
 * @param {DispatchFunction} dispatchError - Callback for failed operations.
 * @returns {Function} An async thunk function.
 */
export function fetchGroupDetailsWithInsights(groupId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Fetching group details and AI insights for group ID: ${groupId}`);
        try {
            const groupService = _getGroupService();
            const response = await groupService.getGroupDetails(groupId);

            if (response.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(response.data);
            } else {
                dispatchError(response.message || ERROR_MESSAGES.NOT_FOUND('Group', groupId));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to fetch group details for ${groupId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Performs an AI-driven audit for a specific group and dispatches the report.
 * @param {string} groupId - The ID of the group to audit.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operations, receives the audit report object.
 * @param {DispatchFunction} dispatchError - Callback for failed operations.
 * @returns {Function} An async thunk function.
 */
export function performGroupAudit(groupId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Initiating AI group audit for group ID: ${groupId}`);
        try {
            const groupService = _getGroupService();
            const auditResult = await groupService.auditGroup(groupId);

            if (auditResult.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(auditResult); // Full auditResult contains report, findings, recommendations
            } else {
                dispatchError(auditResult.message || ERROR_MESSAGES.OPERATION_FAILED('group audit'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to perform group audit for ${groupId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Analyzes group structures across multiple groups based on specific criteria,
 * potentially identifying redundancies, compliance gaps, or optimization opportunities.
 * @param {Object} analysisCriteria - Criteria for the AI analysis (e.g., { minMembers: 10, commonPermissions: ['read_all'] }).
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operations, receives analysis results.
 * @param {DispatchFunction} dispatchError - Callback for failed operations.
 * @returns {Function} An async thunk function.
 */
export function analyzeGroupStructure(analysisCriteria, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Starting AI group structure analysis with criteria: ${JSON.stringify(analysisCriteria)}`);
        try {
            const groupService = _getGroupService();
            const allGroupsResponse = await groupService.listGroups({}); // Fetch all groups first

            if (allGroupsResponse.status === GEMINI_STATUS.ERROR) {
                throw new Error(allGroupsResponse.message || "Could not retrieve groups for analysis.");
            }

            const prompt = `You are a group structure optimization AI.
            Given the following list of groups: ${JSON.stringify(allGroupsResponse.data)}.
            And analysis criteria: ${JSON.stringify(analysisCriteria)}.
            Perform a comprehensive analysis to identify:
            1. Redundant groups (groups with similar members/permissions).
            2. Over-privileged groups.
            3. Under-privileged groups (missing critical permissions for their inferred purpose).
            4. Potential for consolidation or simplification.
            5. Anomalies or deviations from best practices.
            Respond with {"status": "success", "analysisResult": {...}, "optimizationSuggestions": [...], "criticalFindings": [...]}
            or {"status": "error", "message": "reason for failure"}.`;

            const aiAnalysis = await _executeGeminiQuery(prompt, groupService._geminiConfig);

            if (aiAnalysis.status === GEMINI_STATUS.SUCCESS) {
                _log('info', 'AI group structure analysis completed successfully.', { findingsCount: aiAnalysis.criticalFindings.length });
                dispatchSuccess(aiAnalysis);
            } else {
                dispatchError(aiAnalysis.message || ERROR_MESSAGES.OPERATION_FAILED('group structure analysis'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to analyze group structure: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Recommends if two specific groups should be merged, providing a detailed AI rationale.
 * @param {string} groupAId - The ID of the first group.
 * @param {string} groupBId - The ID of the second group.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operations, receives merge recommendation.
 * @param {DispatchFunction} dispatchError - Callback for failed operations.
 * @returns {Function} An async thunk function.
 */
export function recommendMergeGroups(groupAId, groupBId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Requesting AI merge recommendation for groups ${groupAId} and ${groupBId}.`);
        try {
            const groupService = _getGroupService();
            const mergeRecommendation = await groupService.recommendGroupMerge(groupAId, groupBId);

            if (mergeRecommendation.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(mergeRecommendation); // Contains recommendMerge, rationale, etc.
            } else {
                dispatchError(mergeRecommendation.message || ERROR_MESSAGES.OPERATION_FAILED('group merge recommendation'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to get merge recommendation for groups ${groupAId}, ${groupBId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Validates an access request for a user against a resource using AI to assess required permissions.
 * @param {string} userId - The ID of the requesting user.
 * @param {string} resourceId - The ID of the resource being accessed.
 * @param {string[]} requiredPermissions - The permissions explicitly required for this access.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful validation, receives access decision.
 * @param {DispatchFunction} dispatchError - Callback for failed validation.
 * @returns {Function} An async thunk function.
 */
export function validateAccessRequest(userId, resourceId, requiredPermissions, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Validating access request for user ${userId} to resource ${resourceId}.`);
        try {
            const groupService = _getGroupService();
            // In a real scenario, this would involve fetching user's current permissions
            // and resource's policies from a backend. For now, we'll simulate or infer.
            const userGroupsResponse = await groupService.listGroups({ memberId: userId }).catch(() => ({ data: [] }));
            const userGroups = userGroupsResponse.data || [];

            const prompt = `You are an access control decision engine.
            A user with ID '${userId}' is attempting to access resource '${resourceId}'.
            The resource explicitly requires these permissions: ${JSON.stringify(requiredPermissions)}.
            The user is a member of these groups (implying permissions from these groups): ${JSON.stringify(userGroups.map(g => ({ id: g.id, name: g.name, roles: g.roles })))}.
            Based on this information, determine if the user should be granted access.
            Provide a clear "accessGranted": boolean, and a "rationale".
            Also, identify if there's any policy deviation or an opportunity to refine permissions.
            Respond with {"status": "success", "accessGranted": boolean, "rationale": "...", "policyRefinements": [...]}
            or {"status": "error", "message": "reason for failure"}.`;

            const accessDecision = await _executeGeminiQuery(prompt, groupService._geminiConfig);

            if (accessDecision.status === GEMINI_STATUS.SUCCESS) {
                _log('info', `Access decision for user ${userId} to resource ${resourceId}: ${accessDecision.accessGranted ? 'GRANTED' : 'DENIED'}`);
                dispatchSuccess(accessDecision); // Contains accessGranted, rationale, etc.
            } else {
                dispatchError(accessDecision.message || ERROR_MESSAGES.OPERATION_FAILED('access request validation'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to validate access request for user ${userId} to resource ${resourceId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Deletes a group after AI confirms low impact.
 * @param {string} groupId - The ID of the group to delete.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful deletion.
 * @param {DispatchFunction} dispatchError - Callback for failed deletion.
 * @returns {Function} An async thunk function.
 */
export function deleteGroupWithAIConfirmation(groupId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Attempting AI-confirmed group deletion for ID: ${groupId}`);
        try {
            const groupService = _getGroupService();
            const response = await groupService.deleteGroup(groupId);

            if (response.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(response.message || `Group ${groupId} successfully deleted.`);
            } else {
                dispatchError(response.message || ERROR_MESSAGES.OPERATION_FAILED('delete group'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to delete group ${groupId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Assigns a user to a group, leveraging AI for pre-assignment risk assessment.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful assignment.
 * @param {DispatchFunction} dispatchError - Callback for failed assignment.
 * @returns {Function} An async thunk function.
 */
export function assignUserToGroupWithAIVetting(groupId, userId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Attempting AI-vetted assignment of user ${userId} to group ${groupId}.`);
        try {
            const groupService = _getGroupService();
            const response = await groupService.assignUserToGroup(groupId, userId);

            if (response.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(response.message || `User ${userId} successfully assigned to group ${groupId}.`);
            } else {
                dispatchError(response.message || ERROR_MESSAGES.OPERATION_FAILED('assign user to group'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to assign user ${userId} to group ${groupId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Removes a user from a group, with AI confirming the impact of the removal.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful removal.
 * @param {DispatchFunction} dispatchError - Callback for failed removal.
 * @returns {Function} An async thunk function.
 */
export function removeUserFromGroupWithAIVetting(groupId, userId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Attempting AI-vetted removal of user ${userId} from group ${groupId}.`);
        try {
            const groupService = _getGroupService();
            const response = await groupService.removeUserFromGroup(groupId, userId);

            if (response.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(response.message || `User ${userId} successfully removed from group ${groupId}.`);
            } else {
                dispatchError(response.message || ERROR_MESSAGES.OPERATION_FAILED('remove user from group'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to remove user ${userId} from group ${groupId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Generates an AI-powered summary for a group.
 * @param {string} groupId - The ID of the group.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operation, receives the summary string.
 * @param {DispatchFunction} dispatchError - Callback for failed operation.
 * @returns {Function} An async thunk function.
 */
export function getGroupAISummary(groupId, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Requesting AI summary for group ID: ${groupId}`);
        try {
            const groupService = _getGroupService();
            const response = await groupService.generateGroupSummary(groupId);

            if (response.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(response.groupSummary);
            } else {
                dispatchError(response.message || ERROR_MESSAGES.OPERATION_FAILED('generate group summary'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to get AI summary for group ${groupId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

/**
 * Predicts the impact of changes to a group or role using AI.
 * @param {string} actionType - The type of action (e.g., "add_permission").
 * @param {string} entityId - The ID of the group or role.
 * @param {Object} proposedChanges - The proposed changes.
 * @param {DispatchFunction} dispatchSuccess - Callback for successful operation, receives impact prediction.
 * @param {DispatchFunction} dispatchError - Callback for failed operation.
 * @returns {Function} An async thunk function.
 */
export function predictChangesImpact(actionType, entityId, proposedChanges, dispatchSuccess, dispatchError) {
    return async () => {
        _log('info', `Predicting impact of changes for entity ${entityId} (action: ${actionType}).`);
        try {
            const groupService = _getGroupService();
            const response = await groupService.predictImpact(actionType, entityId, proposedChanges);

            if (response.status === GEMINI_STATUS.SUCCESS) {
                dispatchSuccess(response.predictedImpact);
            } else {
                dispatchError(response.message || ERROR_MESSAGES.OPERATION_FAILED('predict changes impact'));
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
            _log('error', `Failed to predict impact for ${entityId}: ${errorMessage}`, { error });
            dispatchError(errorMessage);
        }
    };
}

// Example usage of initialization (could be in app's main entry point)
// initializeGroupManagement(); // Call this once at application startup.
// You could also pass a custom config like:
// initializeGroupManagement({
//     geminiConfig: {
//         modelName: "gemini-1.5-pro",
//         generationConfig: { temperature: 0.9, maxOutputTokens: 4096 },
//         safetySettings: [],
//     },
//     backendApiCaller: myCustomFetchWrapper, // If you have a different API client
// });