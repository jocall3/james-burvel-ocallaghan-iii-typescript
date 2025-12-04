// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @fileoverview The Permission Module for the Alchemy Ethics Blueprint.
 * Provides a runtime security gatekeeper for sensitive operations.
 * This module is designed to be robust, secure, and extensible, incorporating
 * features like persistent storage, time-limited permissions, policy enforcement,
 * comprehensive logging, and batch operations.
 */

// Expanded types for more granular control over permissions and resources.
export type PermissionType = 'read' | 'write' | 'execute' | 'network' | 'admin' | 'access_location' | 'access_camera' | 'access_microphone' | 'access_contacts';
export type ResourceType = 'FileSystem' | 'API' | 'DOM' | 'Geolocation' | 'Camera' | 'Microphone' | 'Storage' | 'Database' | 'Contacts';
export type PermissionState = 'granted' | 'denied' | 'prompt';
export type PermissionScope = 'session' | 'persistent' | 'once'; // New: Defines how long a permission lasts

/**
 * @interface PermissionStatus
 * Represents the current state and metadata of a granted or denied permission.
 */
export interface PermissionStatus {
    state: PermissionState;
    grantedAt: Date; // When the permission was last granted or explicitly denied.
    expirationDate?: Date; // Optional: When the permission automatically expires.
    scope: PermissionScope; // The intended scope (session, persistent, once).
    // Future expansion: potentially add module/user ID, specific resource path, etc.
}

/**
 * @interface PermissionEvent
 * Defines the structure for logging permission-related actions for auditing purposes.
 */
export interface PermissionEvent {
    timestamp: Date;
    actor?: string; // Optional: The identifier of the entity performing the action (e.g., 'ModuleX', 'UserY').
    action: 'request' | 'grant' | 'deny' | 'revoke' | 'check' | 'policy_override' | 'admin_action' | 'expired';
    permission: PermissionType;
    resource: ResourceType;
    outcome: boolean | PermissionState | string; // True/False for grant/deny, or state for check, or a descriptive string.
    details?: string; // Additional context or notes for the event.
}

/**
 * @class PermissionLogger
 * Manages and stores a comprehensive log of all permission-related events.
 * This is crucial for auditing, debugging, and understanding security posture.
 * Logs are persisted to localStorage.
 */
export class PermissionLogger {
    private logs: PermissionEvent[];
    private static readonly LOCAL_STORAGE_KEY = 'alchemy_permission_logs';
    private static readonly MAX_LOG_ENTRIES = 1000; // Cap log size to prevent excessive storage use

    constructor() {
        this.logs = this.loadLogs();
        console.log("[PermissionLogger] Initialized. Loaded %d logs.", this.logs.length);
    }

    /**
     * Loads permission logs from localStorage.
     * Handles potential parsing errors and reconstructs Date objects.
     * @returns An array of PermissionEvent objects.
     */
    private loadLogs(): PermissionEvent[] {
        try {
            const storedLogs = localStorage.getItem(PermissionLogger.LOCAL_STORAGE_KEY);
            if (storedLogs) {
                const parsedLogs: PermissionEvent[] = JSON.parse(storedLogs);
                // Ensure Date objects are correctly re-instantiated
                return parsedLogs.map(log => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
            }
        } catch (e) {
            console.error("[PermissionLogger] Failed to load logs from localStorage:", e);
        }
        return [];
    }

    /**
     * Saves the current permission logs to localStorage.
     * Implements basic log rotation to keep the log size manageable.
     */
    private saveLogs(): void {
        try {
            // Trim logs if they exceed the maximum size
            if (this.logs.length > PermissionLogger.MAX_LOG_ENTRIES) {
                this.logs = this.logs.slice(this.logs.length - PermissionLogger.MAX_LOG_ENTRIES / 2); // Keep half the max size
            }
            localStorage.setItem(PermissionLogger.LOCAL_STORAGE_KEY, JSON.stringify(this.logs));
        } catch (e) {
            console.error("[PermissionLogger] Failed to save logs to localStorage:", e);
        }
    }

    /**
     * Records a new permission event, adding it to the log and persisting it.
     * @param event The permission event to record.
     */
    public record(event: PermissionEvent): void {
        this.logs.push(event);
        this.saveLogs();
    }

    /**
     * Retrieves all recorded permission events.
     * @returns A shallow copy of the array of permission events, ensuring immutability of the internal state.
     */
    public getLogs(): PermissionEvent[] {
        return [...this.logs];
    }

    /**
     * Clears all stored permission logs from both memory and localStorage.
     */
    public clearLogs(): void {
        this.logs = [];
        this.saveLogs();
        console.log("[PermissionLogger] All logs cleared.");
    }
}

/**
 * @class PermissionPolicyManager
 * Manages predefined security policies that can influence how permissions are granted or denied.
 * Policies provide a declarative way to enforce organizational or application-level security rules,
 * acting as default behaviors or strict overrides for user-facing prompts.
 */
export class PermissionPolicyManager {
    // Policies are functions that take permission/resource and potentially current status,
    // and return 'granted', 'denied', 'prompt', or 'null' (if the policy doesn't apply).
    private policies: Map<string, (permission: PermissionType, resource: ResourceType, currentStatus?: PermissionStatus) => PermissionState | null>;

    constructor() {
        this.policies = new Map();
        this.applyDefaultPolicies();
        console.log("[PermissionPolicyManager] Initialized.");
    }

    /**
     * Applies a set of default security policies.
     * These can be configured based on application requirements.
     */
    private applyDefaultPolicies(): void {
        // Example: Always deny 'admin' permission to 'DOM' resources for AI modules.
        this.definePolicy('denyAdminDOMForAI', (p, r) => {
            if (p === 'admin' && r === 'DOM') return 'denied';
            return null; // Return null if this policy doesn't apply
        });

        // Example: Always grant 'read' access to 'Storage' (e.g., for non-sensitive data)
        this.definePolicy('grantReadStorageByDefault', (p, r) => {
            if (p === 'read' && r === 'Storage') return 'granted';
            return null;
        });

        // Example: Always deny any `execute` permission for `FileSystem` by default.
        this.definePolicy('denyExecuteFileSystem', (p, r) => {
            if (p === 'execute' && r === 'FileSystem') return 'denied';
            return null;
        });

        // Example: Always require a prompt for Geolocation access, even if previously granted.
        this.definePolicy('alwaysPromptGeolocation', (p, r) => {
            if (r === 'Geolocation') return 'prompt';
            return null;
        });

        // Example: Restrict network access to specific API types based on naming convention
        this.definePolicy('restrictNetworkToKnownAPIs', (p, r) => {
            if (p === 'network' && r === 'API') {
                // In a real system, you'd check specific API endpoints or domain.
                // For this stub, let's just say "network:API" is generally prompted unless explicitly allowed.
                // This policy might be refined to check `details` if passed to the policy.
                return 'prompt'; // Always prompt for generic API network access.
            }
            return null;
        });
    }

    /**
     * Defines a new security policy.
     * Policies are functions that take permission/resource and potentially current status,
     * and return 'granted', 'denied', 'prompt', or 'null' (if the policy doesn't apply).
     * Policies defined later might override the intent of earlier policies, depending on
     * how `evaluatePolicies` is implemented.
     * @param name A unique name for the policy.
     * @param policyFunction The policy logic.
     */
    public definePolicy(name: string, policyFunction: (permission: PermissionType, resource: ResourceType, currentStatus?: PermissionStatus) => PermissionState | null): void {
        if (this.policies.has(name)) {
            console.warn(`[PermissionPolicyManager] Policy '${name}' already exists and will be overwritten.`);
        }
        this.policies.set(name, policyFunction);
        console.log(`[PermissionPolicyManager] Policy '${name}' defined.`);
    }

    /**
     * Removes an existing policy by its name.
     * @param name The name of the policy to remove.
     * @returns True if the policy was found and removed, false otherwise.
     */
    public removePolicy(name: string): boolean {
        const existed = this.policies.delete(name);
        if (existed) {
            console.log(`[PermissionPolicyManager] Policy '${name}' removed.`);
        } else {
            console.warn(`[PermissionPolicyManager] Policy '${name}' not found.`);
        }
        return existed;
    }

    /**
     * Evaluates all active policies for a given permission and resource.
     * Policies are evaluated in the order they were defined (or could be prioritized).
     * The first policy that returns a non-null state determines the outcome,
     * effectively overriding subsequent policies.
     * @param permission The type of permission.
     * @param resource The resource type.
     * @param currentStatus Optional: The current known status of the permission.
     * @returns A PermissionState if a policy applies, otherwise null, indicating no policy decision.
     */
    public evaluatePolicies(permission: PermissionType, resource: ResourceType, currentStatus?: PermissionStatus): PermissionState | null {
        for (const [name, policyFunc] of this.policies) {
            const result = policyFunc(permission, resource, currentStatus);
            if (result !== null) {
                console.debug(`[PermissionPolicyManager] Policy '${name}' returned '${result}' for ${permission}:${resource}`);
                return result;
            }
        }
        return null;
    }

    /**
     * Lists the names of all currently defined policies.
     * @returns An array of policy names.
     */
    public listPolicies(): string[] {
        return Array.from(this.policies.keys());
    }
}


/**
 * @class PermissionModule
 * Provides a sophisticated runtime security gatekeeper for sensitive operations.
 * This module offers:
 * - Persistent permission storage (via localStorage).
 * - Time-limited and scoped permission grants.
 * - Integration with a `PermissionPolicyManager` for declarative security rules.
 * - Integration with a `PermissionLogger` for comprehensive auditing.
 * - Batch operations for requesting and checking multiple permissions efficiently.
 */
export class PermissionModule {
    private permissionStore: Map<string, PermissionStatus>;
    private logger: PermissionLogger;
    private policyManager: PermissionPolicyManager;
    private static readonly LOCAL_STORAGE_KEY = 'alchemy_permissions';

    constructor(logger?: PermissionLogger, policyManager?: PermissionPolicyManager) {
        this.permissionStore = new Map();
        // Use provided instances or create new ones for logging and policy management.
        this.logger = logger || new PermissionLogger();
        this.policyManager = policyManager || new PermissionPolicyManager();
        this.loadPermissions();
        console.log("[PermissionModule] Initialized. Loaded %d permissions.", this.permissionStore.size);
    }

    /**
     * Loads saved permissions from localStorage and initializes the permission store.
     * Handles deserialization of Date objects.
     */
    private loadPermissions(): void {
        try {
            const storedPermissions = localStorage.getItem(PermissionModule.LOCAL_STORAGE_KEY);
            if (storedPermissions) {
                const parsedPermissions: Record<string, PermissionStatus> = JSON.parse(storedPermissions);
                for (const key in parsedPermissions) {
                    const status = parsedPermissions[key];
                    // Reconstruct Date objects from string representation
                    const grantedAt = new Date(status.grantedAt);
                    const expirationDate = status.expirationDate ? new Date(status.expirationDate) : undefined;

                    // Only load permissions that are still valid (not expired)
                    if (this.isPermissionValid({ ...status, grantedAt, expirationDate })) {
                        this.permissionStore.set(key, { ...status, grantedAt, expirationDate });
                    } else if (status.state === 'granted' && expirationDate && expirationDate.getTime() < Date.now()) {
                        // Log auto-expiration for auditing
                        this.logger.record({
                            timestamp: new Date(),
                            action: 'expired',
                            permission: key.split(':')[0] as PermissionType,
                            resource: key.split(':')[1] as ResourceType,
                            outcome: 'denied',
                            details: `Permission '${key}' expired automatically on load.`
                        });
                    }
                }
            }
        } catch (e) {
            console.error("[PermissionModule] Failed to load permissions from localStorage:", e);
        }
    }

    /**
     * Saves the current state of permissions to localStorage.
     * Automatically filters out expired permissions before saving.
     */
    private savePermissions(): void {
        try {
            const serializablePermissions: Record<string, PermissionStatus> = {};
            this.permissionStore.forEach((status, key) => {
                if (this.isPermissionValid(status)) {
                    serializablePermissions[key] = status;
                } else if (status.state === 'granted' && status.expirationDate && status.expirationDate.getTime() < Date.now()) {
                    // Log auto-expiration if it wasn't already caught by check/request
                    this.logger.record({
                        timestamp: new Date(),
                        action: 'expired',
                        permission: key.split(':')[0] as PermissionType,
                        resource: key.split(':')[1] as ResourceType,
                        outcome: 'denied',
                        details: `Permission '${key}' expired and removed during save.`
                    });
                    this.permissionStore.delete(key); // Ensure it's removed from in-memory store too
                }
            });
            localStorage.setItem(PermissionModule.LOCAL_STORAGE_KEY, JSON.stringify(serializablePermissions));
        } catch (e) {
            console.error("[PermissionModule] Failed to save permissions to localStorage:", e);
        }
    }

    /**
     * Generates a unique string key for a permission and resource pair.
     * @param permission The type of permission.
     * @param resource The type of resource.
     * @returns A string in the format "permission:resource".
     */
    private getKey(permission: PermissionType, resource: ResourceType): string {
        return `${permission}:${resource}`;
    }

    /**
     * Provides a descriptive implication message for a given permission and resource,
     * used in user-facing prompts to explain the potential impact of granting access.
     * @param permission The type of permission.
     * @param resource The type of resource.
     * @returns A human-readable string explaining the permission's implication.
     */
    private getPermissionImplication(permission: PermissionType, resource: ResourceType): string {
        switch (`${permission}:${resource}`) {
            case 'read:FileSystem': return 'Read files and directories from your local disk.';
            case 'write:FileSystem': return 'Create, modify, and delete files and directories on your local disk. This is highly sensitive.';
            case 'execute:FileSystem': return 'Execute programs or scripts from your local disk. This is extremely sensitive and can compromise your system.';
            case 'network:API': return 'Make network requests to external servers, which could send your data or fetch information from the internet.';
            case 'read:DOM': return 'Read the content, structure, and potentially sensitive information from the current web page.';
            case 'write:DOM': return 'Modify the content and structure of the current web page (e.g., inject scripts, change UI, alter user input).';
            case 'access_location:Geolocation': return 'Access your precise geographical location data.';
            case 'access_camera:Camera': return 'Access your device\'s camera, potentially recording video or taking photos.';
            case 'access_microphone:Microphone': return 'Access your device\'s microphone, potentially recording audio.';
            case 'read:Storage': return 'Read data stored locally in your browser (e.g., localStorage, IndexedDB, Web SQL).';
            case 'write:Storage': return 'Write, modify, or delete data in local browser storage (e.g., localStorage, IndexedDB, Web SQL).';
            case 'read:Database': return 'Read data from local or remote databases that this application has access to.';
            case 'write:Database': return 'Write, modify, or delete data in local or remote databases. This can lead to data loss or corruption.';
            case 'admin:Database': return 'Perform administrative operations on databases, including schema changes, user management, or full data dumps. Highly critical.';
            case 'admin:API': return 'Perform administrative operations via external APIs, potentially changing server settings, user accounts, or critical application configurations. Highly critical.';
            case 'access_contacts:Contacts': return 'Access your device\'s contact list, including names, phone numbers, and email addresses.';
            default: return `Perform a sensitive operation related to "${permission}" on "${resource}". Specific implications may vary.`;
        }
    }

    /**
     * Determines if a given permission status is currently valid (granted and not expired).
     * @param status The permission status object to check.
     * @returns True if the permission is granted and has not expired, false otherwise.
     */
    private isPermissionValid(status: PermissionStatus | undefined): boolean {
        if (!status || status.state !== 'granted') {
            return false;
        }
        if (status.expirationDate && status.expirationDate.getTime() < Date.now()) {
            // Permission has expired
            return false;
        }
        return true;
    }

    /**
     * Requests permission from the user for a specific operation.
     * This method simulates a user-facing consent dialog, integrates with permission policies,
     * and handles time-limited grants and persistence.
     * @param permission The type of permission being requested.
     * @param resource The resource the permission applies to.
     * @param scope How long the permission should last if granted. Defaults to 'session'.
     *              - 'session': Lasts until the browser session ends or explicitly revoked.
     *              - 'persistent': Lasts across sessions, until explicitly revoked or expires.
     *              - 'once': Granted for a single immediate use, then implicitly revoked.
     * @param expiryInMinutes Optional: If specified, the permission will automatically expire after this duration.
     * @param actor Optional: The entity (e.g., module ID, user name) requesting the permission for logging.
     * @returns A promise that resolves to true if permission is granted, false otherwise.
     */
    public async request(
        permission: PermissionType,
        resource: ResourceType,
        scope: PermissionScope = 'session',
        expiryInMinutes?: number,
        actor?: string
    ): Promise<boolean> {
        const key = this.getKey(permission, resource);
        let currentStatus = this.permissionStore.get(key);
        let granted = false;
        let finalState: PermissionState = 'denied';
        let promptRequired = true;

        this.logger.record({
            timestamp: new Date(),
            actor,
            action: 'request',
            permission,
            resource,
            outcome: 'pending',
            details: `Initial request for ${key} with scope: ${scope}, expiry: ${expiryInMinutes ? `${expiryInMinutes} min` : 'indefinite'}.`
        });

        // 1. Check existing permission status from store
        if (this.isPermissionValid(currentStatus)) {
            if (scope === 'once') {
                // If requesting 'once' and an active general grant exists, we still want to confirm
                // unless policy explicitly bypasses. This ensures explicit single-use requests are honored.
                promptRequired = true;
            } else {
                // For 'session' or 'persistent' requests, if already valid, no prompt needed.
                finalState = 'granted';
                granted = true;
                promptRequired = false;
            }
        }

        // 2. Evaluate policies (policies can override existing status or force a prompt/deny)
        const policyOutcome = this.policyManager.evaluatePolicies(permission, resource, currentStatus);
        if (policyOutcome) {
            console.debug(`[PermissionModule] Policy override for ${key}: ${policyOutcome}`);
            this.logger.record({
                timestamp: new Date(),
                actor,
                action: 'policy_override',
                permission,
                resource,
                outcome: policyOutcome,
                details: `Policy changed outcome from ${finalState} to ${policyOutcome}.`
            });
            finalState = policyOutcome;
            granted = policyOutcome === 'granted';
            promptRequired = policyOutcome === 'prompt';
        }

        // 3. If final state is 'denied' (by policy or default) and no prompt is forced, then deny.
        if (finalState === 'denied' && !promptRequired) {
            this.logger.record({
                timestamp: new Date(),
                actor,
                action: 'deny',
                permission,
                resource,
                outcome: 'denied',
                details: 'Denied immediately by policy or no valid prior grant, no prompt shown.'
            });
            return false;
        }

        // 4. If prompt is required (by initial state, policy, or explicit 'once' request), show UI.
        if (promptRequired) {
            console.log(`[PermissionModule] Prompting user for '${permission}' permission for resource '${resource}'...`);

            // STUB: This would trigger a real UI element in a production application.
            // For now, using window.confirm for simulation.
            const promptMessage = `An AI-generated module${actor ? ` (${actor})` : ''} is requesting permission to "${permission}" the "${resource}".\n\nThis could allow it to:\n- ${this.getPermissionImplication(permission, resource)}\n\nDo you allow this action?`;
            
            // In a more advanced system, this would be an async UI call returning a specific state (e.g., 'always', 'once', 'deny')
            granted = window.confirm(promptMessage);
            finalState = granted ? 'granted' : 'denied';
        }

        // 5. Update permission store and log the final outcome
        if (finalState === 'granted') {
            let expirationDate: Date | undefined;
            if (expiryInMinutes) {
                expirationDate = new Date(Date.now() + expiryInMinutes * 60 * 1000);
            } else if (scope === 'session') {
                expirationDate = undefined; // Session permissions default to no explicit expiry, implicitly expire with session.
            } else if (scope === 'persistent') {
                expirationDate = undefined; // Persistent permissions without expiryInMinutes are indefinite.
            }

            if (scope !== 'once') { // 'once' grants are not persistently stored
                this.permissionStore.set(key, {
                    state: 'granted',
                    grantedAt: new Date(),
                    expirationDate: expirationDate,
                    scope: scope
                });
                this.savePermissions(); // Persist changes
            }

            this.logger.record({
                timestamp: new Date(),
                actor,
                action: 'grant',
                permission,
                resource,
                outcome: 'granted',
                details: `Permission '${key}' granted. Scope: ${scope}, Expires: ${expirationDate ? expirationDate.toLocaleString() : 'Never'}.`
            });
        } else {
            // If denied, store it (unless it was a 'once' request) to prevent immediate re-prompt
            // if the user chose to deny 'always' for this session/persistent scope.
            if (scope !== 'once') {
                this.permissionStore.set(key, {
                    state: 'denied',
                    grantedAt: new Date(), // Records when it was denied
                    scope: scope
                });
                this.savePermissions(); // Persist changes
            }
            this.logger.record({
                timestamp: new Date(),
                actor,
                action: 'deny',
                permission,
                resource,
                outcome: 'denied',
                details: `Permission '${key}' denied by user or policy.`
            });
        }
        console.log(`[PermissionModule] Final outcome for '${key}' was ${finalState}.`);
        return finalState === 'granted';
    }

    /**
     * Checks if a specific permission has already been granted and is currently valid,
     * without prompting the user. This method respects policies and checks for expiration.
     * @param permission The type of permission.
     * @param resource The resource the permission applies to.
     * @param actor Optional: The entity checking the permission (for logging).
     * @returns True if permission is granted and valid, false otherwise.
     */
    public check(permission: PermissionType, resource: ResourceType, actor?: string): boolean {
        const key = this.getKey(permission, resource);
        const currentStatus = this.permissionStore.get(key);
        let checkOutcome = false;
        let details = 'Not granted or expired.';

        // 1. Evaluate policies first - a policy can force a 'denied' or 'granted' even if the store says otherwise.
        const policyOutcome = this.policyManager.evaluatePolicies(permission, resource, currentStatus);
        if (policyOutcome === 'denied') {
            details = 'Denied by policy during check.';
            checkOutcome = false;
        } else if (policyOutcome === 'granted') {
            details = 'Granted by policy during check.';
            checkOutcome = true;
        } else {
            // 2. If no policy makes a definitive decision, check the internal store.
            checkOutcome = this.isPermissionValid(currentStatus);
            if (checkOutcome) {
                details = 'Permission valid from store.';
            } else if (currentStatus?.state === 'denied') {
                details = 'Previously denied and still active.';
            }
        }

        this.logger.record({
            timestamp: new Date(),
            actor,
            action: 'check',
            permission,
            resource,
            outcome: checkOutcome,
            details: details
        });

        return checkOutcome;
    }

    /**
     * Revokes a previously granted permission. This sets the permission state to 'denied'
     * and effectively expires it immediately, preventing future access until re-granted.
     * @param permission The type of permission to revoke.
     * @param resource The resource the permission applies to.
     * @param actor Optional: The entity revoking the permission (for logging).
     */
    public revoke(permission: PermissionType, resource: ResourceType, actor?: string): void {
        const key = this.getKey(permission, resource);
        if (this.permissionStore.has(key)) {
            const oldStatus = this.permissionStore.get(key);
            this.permissionStore.set(key, {
                state: 'denied',
                grantedAt: oldStatus?.grantedAt || new Date(), // Keep original granted date or set new if it was a denial
                scope: oldStatus?.scope || 'session', // Retain original scope or default
                expirationDate: new Date() // Mark as expired now
            });
            this.savePermissions(); // Persist changes
            console.log(`[PermissionModule] Revoked '${permission}' permission for resource '${resource}'.`);
            this.logger.record({
                timestamp: new Date(),
                actor,
                action: 'revoke',
                permission,
                resource,
                outcome: 'denied',
                details: 'Permission explicitly revoked by user or system.'
            });
        } else {
            console.warn(`[PermissionModule] Attempted to revoke non-existent or already denied permission for '${key}'.`);
            this.logger.record({
                timestamp: new Date(),
                actor,
                action: 'revoke',
                permission,
                resource,
                outcome: 'no_change',
                details: 'Attempted to revoke non-existent permission. No change made.'
            });
        }
    }

    /**
     * Requests multiple permissions in a batch. Each request within the batch is processed
     * individually using the `request` method to ensure policies, scopes, and expirations
     * are correctly applied.
     * @param requests An array of permission/resource pairs, optionally including scope and expiry.
     * @param actor Optional: The entity requesting the permissions (for logging).
     * @returns A promise that resolves to a Map where keys are 'permission:resource' strings and values are boolean (granted/denied).
     */
    public async requestBatch(
        requests: Array<{ permission: PermissionType; resource: ResourceType; scope?: PermissionScope; expiryInMinutes?: number; }>,
        actor?: string
    ): Promise<Map<string, boolean>> {
        const results = new Map<string, boolean>();
        if (requests.length === 0) {
            return results;
        }

        // Process distinct requests to avoid redundant prompts for the same permission/resource in one batch
        const distinctRequestsMap = new Map<string, { permission: PermissionType; resource: ResourceType; scope: PermissionScope; expiryInMinutes?: number; }>();
        for (const req of requests) {
            const key = this.getKey(req.permission, req.resource);
            if (!distinctRequestsMap.has(key)) {
                distinctRequestsMap.set(key, { ...req, scope: req.scope || 'session' });
            }
        }

        console.log(`[PermissionModule] Starting batch permission request for ${distinctRequestsMap.size} distinct items.`);
        this.logger.record({
            timestamp: new Date(),
            actor,
            action: 'request',
            permission: 'batch',
            resource: 'multiple',
            outcome: 'pending',
            details: `Batch request for: ${Array.from(distinctRequestsMap.keys()).join(', ')}`
        });

        for (const [key, req] of distinctRequestsMap.entries()) {
            const granted = await this.request(req.permission, req.resource, req.scope, req.expiryInMinutes, actor);
            results.set(key, granted);
        }

        this.logger.record({
            timestamp: new Date(),
            actor,
            action: 'grant/deny',
            permission: 'batch',
            resource: 'multiple',
            outcome: 'completed',
            details: `Batch request complete. Results: ${JSON.stringify(Object.fromEntries(results))}`
        });
        console.log(`[PermissionModule] Batch permission request complete.`);
        return results;
    }

    /**
     * Checks multiple permissions in a batch without prompting the user.
     * @param checks An array of permission/resource pairs to check.
     * @param actor Optional: The entity checking the permissions (for logging).
     * @returns A Map where keys are 'permission:resource' strings and values are boolean (granted/denied).
     */
    public checkBatch(
        checks: Array<{ permission: PermissionType; resource: ResourceType; }>,
        actor?: string
    ): Map<string, boolean> {
        const results = new Map<string, boolean>();
        if (checks.length === 0) {
            return results;
        }

        // Process distinct checks to avoid redundant checks for the same permission/resource
        const distinctCheckKeys = new Set<string>();
        for (const checkItem of checks) {
            const key = this.getKey(checkItem.permission, checkItem.resource);
            if (!distinctCheckKeys.has(key)) {
                results.set(key, this.check(checkItem.permission, checkItem.resource, actor));
                distinctCheckKeys.add(key);
            }
        }

        this.logger.record({
            timestamp: new Date(),
            actor,
            action: 'check',
            permission: 'batch',
            resource: 'multiple',
            outcome: 'completed',
            details: `Batch check complete. Results: ${JSON.stringify(Object.fromEntries(results))}`
        });

        return results;
    }

    /**
     * Retrieves the current, raw PermissionStatus object for a specific permission.
     * This allows inspecting details like `grantedAt` or `expirationDate`.
     * @param permission The type of permission.
     * @param resource The resource the permission applies to.
     * @returns The PermissionStatus object, or undefined if no status is recorded.
     */
    public getPermissionStatus(permission: PermissionType, resource: ResourceType): PermissionStatus | undefined {
        const key = this.getKey(permission, resource);
        return this.permissionStore.get(key);
    }

    /**
     * Resets all stored permissions, clearing them from both memory and persistent storage.
     * This is primarily for development, testing, or administrative functions.
     */
    public resetAllPermissions(): void {
        this.permissionStore.clear();
        this.savePermissions(); // Clears localStorage
        this.logger.record({
            timestamp: new Date(),
            action: 'admin_action',
            permission: 'admin',
            resource: 'PermissionModule',
            outcome: 'success',
            details: 'All permissions reset by administrative action.'
        });
        console.log("[PermissionModule] All stored permissions have been reset.");
    }
}

// You might export a singleton instance of PermissionModule, PermissionLogger, and PermissionPolicyManager
// if they are intended to be globally accessible throughout your application.
// For this task, keeping them as exported classes allows for more flexible instantiation.
// Example of a singleton pattern (if desired for the entire app):
/*
export const permissionLogger = new PermissionLogger();
export const permissionPolicyManager = new PermissionPolicyManager();
export const permissionModule = new PermissionModule(permissionLogger, permissionPolicyManager);
*/