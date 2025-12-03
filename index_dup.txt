// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// FIX: Create a comprehensive barrel file to export all service modules.
export * from './api';
export * from './componentLoader';
// FIX: Explicitly export from dbService and database to resolve naming conflicts.
// Aliasing clearAllFiles from dbService to avoid conflict with database.ts
export { saveFile, getAllFiles, clearAllFiles as clearAllGeneratedFiles } from './dbService';
export * from './fileUtils';
export * from './geminiCore';
export * from './githubService';
export * from './pdfService';
export * from './pipelineTools';
export * from './taxonomyService';
export * from './telemetryService';
export * from './geminiService_story';
export * from './database';
export * from './fileSystemService';
export * from './geminiService';
export * from './terminalService';
export * from './omniStructService';


// --- Start of New Features and Enhancements ---

// Internal imports for the ServiceManager to reference the actual service implementations.
// These imports are for internal use within this barrel file to compose the ServiceManager,
// and do not alter the existing public export statements above.
import * as api from './api';
import * as componentLoader from './componentLoader';
import * as dbService from './dbService';
import * as fileUtils from './fileUtils';
import * as geminiCore from './geminiCore';
import * as githubService from './githubService';
import * as pdfService from './pdfService';
import * as pipelineTools from './pipelineTools';
import * as taxonomyService from './taxonomyService';
import * as telemetryService from './telemetryService';
import * as geminiService_story from './geminiService_story';
import * as database from './database';
import * as fileSystemService from './fileSystemService';
import * as geminiService from './geminiService';
import * as terminalService from './terminalService';
import * as omniStructService from './omniStructService';

/**
 * @interface IServiceManager
 * @description Defines the interface for the central service manager, providing access to all registered application services.
 * This ensures type safety and a clear API surface for consumers.
 */
export interface IServiceManager {
    readonly api: typeof api;
    readonly componentLoader: typeof componentLoader;
    readonly dbService: {
        saveFile: typeof dbService.saveFile;
        getAllFiles: typeof dbService.getAllFiles;
        clearAllGeneratedFiles: typeof dbService.clearAllFiles; // Aligned with the alias in exports
    };
    readonly fileUtils: typeof fileUtils;
    readonly geminiCore: typeof geminiCore;
    readonly githubService: typeof githubService;
    readonly pdfService: typeof pdfService;
    readonly pipelineTools: typeof pipelineTools;
    readonly taxonomyService: typeof taxonomyService;
    readonly telemetryService: typeof telemetryService;
    readonly geminiStoryService: typeof geminiService_story; // Renamed for consistency in manager
    readonly database: typeof database;
    readonly fileSystemService: typeof fileSystemService;
    readonly geminiService: typeof geminiService;
    readonly terminalService: typeof terminalService;
    readonly omniStructService: typeof omniStructService;

    /**
     * @method getService
     * @description Dynamically retrieves a service by its registered name.
     * @param serviceName - The name of the service to retrieve.
     * @returns The requested service module or object.
     */
    getService<K extends keyof Omit<IServiceManager, 'getService' | 'initializeAllServices' | 'shutdownAllServices'>>(serviceName: K): IServiceManager[K];

    /**
     * @method initializeAllServices
     * @description Triggers initialization logic for all registered services that support it.
     */
    initializeAllServices(): Promise<void>;

    /**
     * @method shutdownAllServices
     * @description Triggers shutdown/cleanup logic for all registered services that support it.
     */
    shutdownAllServices(): Promise<void>;
}

/**
 * @class ServiceManager
 * @description Implements a singleton pattern for managing and providing access to all core application services.
 * This class serves as a central registry, ensuring services are consistently accessed and,
 * if applicable, initialized once across the application lifecycle.
 *
 * Each service is exposed as a readonly property, ensuring immutable access to the service module/instance.
 */
export class ServiceManager implements IServiceManager {
    private static instance: ServiceManager;

    // Public readonly properties for each service, directly exposing the imported modules.
    // If services were classes, they would be instantiated here (e.g., `new ServiceClass()`).
    public readonly api = api;
    public readonly componentLoader = componentLoader;
    public readonly dbService = {
        saveFile: dbService.saveFile,
        getAllFiles: dbService.getAllFiles,
        clearAllGeneratedFiles: dbService.clearAllFiles,
    };
    public readonly fileUtils = fileUtils;
    public readonly geminiCore = geminiCore;
    public readonly githubService = githubService;
    public readonly pdfService = pdfService;
    public readonly pipelineTools = pipelineTools;
    public readonly taxonomyService = taxonomyService;
    public readonly telemetryService = telemetryService;
    public readonly geminiStoryService = geminiService_story;
    public readonly database = database;
    public readonly fileSystemService = fileSystemService;
    public readonly geminiService = geminiService;
    public readonly terminalService = terminalService;
    public readonly omniStructService = omniStructService;

    /**
     * @private constructor
     * @description Private constructor to enforce the singleton pattern.
     * Service setup logic, such as configuration loading or initial dependency injection,
     * could be performed here.
     */
    private constructor() {
        console.log('ServiceManager initialized: Central hub for application services.');
    }

    /**
     * @method getInstance
     * @description Provides the singleton instance of the ServiceManager.
     * Call this method to retrieve the single, shared instance of the ServiceManager.
     * @returns {ServiceManager} The single instance of the ServiceManager.
     */
    public static getInstance(): ServiceManager {
        if (!ServiceManager.instance) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    /**
     * @method getService
     * @description Dynamically retrieves a service by its registered name.
     * This method is useful for generic service access patterns, or when the specific
     * service needed is determined at runtime (e.g., from configuration).
     * @param {K} serviceName - The name of the service to retrieve (e.g., 'api', 'githubService').
     * @returns {IServiceManager[K]} The requested service module or object, fully typed.
     * @throws {Error} If the requested service name does not correspond to a registered service.
     */
    public getService<K extends keyof Omit<IServiceManager, 'getService' | 'initializeAllServices' | 'shutdownAllServices'>>(serviceName: K): IServiceManager[K] {
        if (this[serviceName]) {
            return this[serviceName];
        }
        throw new Error(`Service '${String(serviceName)}' not found in ServiceManager.`);
    }

    /**
     * @method initializeAllServices
     * @description Iterates through all managed services and calls an `initialize` or `init` method
     * if it exists and is a function. This provides a centralized point to bootstrap all services.
     * Services should expose an async `initialize()` method for this to be effective.
     */
    public async initializeAllServices(): Promise<void> {
        console.log('ServiceManager: Starting initialization of all registered services...');
        const serviceModules = Object.values(this)
            .filter(val => typeof val === 'object' && val !== null && 'initialize' in val && typeof val.initialize === 'function');

        for (const service of serviceModules) {
            try {
                await (service as { initialize: () => Promise<void> }).initialize();
                console.log(`ServiceManager: Initialized service: ${service.constructor.name || 'Anonymous Module'}`);
            } catch (error) {
                console.error(`ServiceManager: Failed to initialize service: ${service.constructor.name || 'Anonymous Module'}. Error:`, error);
                // Depending on criticality, you might want to throw here or continue.
            }
        }
        console.log('ServiceManager: All services initialization complete.');
    }

    /**
     * @method shutdownAllServices
     * @description Iterates through all managed services and calls a `shutdown` or `destroy` method
     * if it exists and is a function. This provides a centralized point for graceful termination and resource cleanup.
     * Services should expose an async `shutdown()` method for this to be effective.
     */
    public async shutdownAllServices(): Promise<void> {
        console.log('ServiceManager: Starting shutdown of all registered services...');
        const serviceModules = Object.values(this)
            .filter(val => typeof val === 'object' && val !== null && 'shutdown' in val && typeof val.shutdown === 'function');

        for (const service of serviceModules) {
            try {
                await (service as { shutdown: () => Promise<void> }).shutdown();
                console.log(`ServiceManager: Shut down service: ${service.constructor.name || 'Anonymous Module'}`);
            } catch (error) {
                console.error(`ServiceManager: Failed to shut down service: ${service.constructor.name || 'Anonymous Module'}. Error:`, error);
            }
        }
        console.log('ServiceManager: All services shutdown complete.');
    }
}

/**
 * @constant services
 * @description A globally accessible, singleton instance of the ServiceManager.
 * This provides a convenient and consistent way to access all services throughout the application.
 * Example usage: `services.githubService.fetchRepoDetails('my-repo')`.
 */
export const services: IServiceManager = ServiceManager.getInstance();


// --- Common Utility Types and Interfaces for Services ---
// These are added to enhance the barrel file as a central hub for service-related definitions,
// promoting consistency and 'Google quality' across the codebase.

/**
 * @typedef ServiceResponse
 * @template T - The type of the data returned by the service.
 * @description A generic structure for standardized service responses, including data, status, and optional messages.
 * This promotes consistent error handling and data presentation across all services.
 */
export type ServiceResponse<T = any> = {
    /** The actual data returned by the service, if successful. */
    data?: T;
    /** A boolean indicating if the service call was successful. */
    success: boolean;
    /** An optional message, typically for errors or informative responses. */
    message?: string;
    /** An optional numeric status code (e.g., HTTP status codes or custom codes). */
    statusCode?: number;
    /** An optional error object or message, providing more details on failures. */
    error?: Error | string | any;
};

/**
 * @interface IServiceConfig
 * @description A generic interface for service-specific configuration objects.
 * This can be extended by individual services to define their unique configuration parameters.
 */
export interface IServiceConfig {
    /** A unique identifier for the service instance. */
    id?: string;
    /** The base URL for API services, if applicable. */
    baseUrl?: string;
    /** API key or authentication token, for secure services. */
    apiKey?: string;
    /** Timeout in milliseconds for service operations. */
    timeoutMs?: number;
    /** Any other generic configuration property for flexibility. */
    [key: string]: any;
}

/**
 * @enum ServiceStatus
 * @description Enumerates possible lifecycle statuses for a service, useful for monitoring or health checks.
 */
export enum ServiceStatus {
    /** The service is not yet initialized or is inactive. */
    INACTIVE = 'INACTIVE',
    /** The service is currently initializing. */
    INITIALIZING = 'INITIALIZING',
    /** The service is fully operational and ready to handle requests. */
    ACTIVE = 'ACTIVE',
    /** The service encountered an error and is not functioning correctly. */
    ERROR = 'ERROR',
    /** The service is in the process of shutting down or being disposed. */
    SHUTTING_DOWN = 'SHUTTING_DOWN',
    /** The service has been fully shut down and is no longer available. */
    SHUTDOWN = 'SHUTDOWN',
}

/**
 * @interface IAuditable
 * @description Interface for entities or records that require auditing information,
 * such as creation and last update timestamps, and associated user IDs.
 * Promotes consistency in data models across services that persist information.
 */
export interface IAuditable {
    /** Timestamp when the entity was created. */
    createdAt: Date;
    /** User ID or identifier who created the entity, if available. */
    createdBy?: string;
    /** Timestamp when the entity was last updated. */
    updatedAt: Date;
    /** User ID or identifier who last updated the entity, if available. */
    updatedBy?: string;
}

/**
 * @function delay
 * @description A utility function to introduce an asynchronous delay (pause) for a specified number of milliseconds.
 * Useful for rate limiting, retry mechanisms, non-blocking waits, or UI presentation.
 * @param ms - The number of milliseconds to delay execution.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * @function generateUniqueId
 * @description Generates a universally unique identifier (UUID v4) using the Web Crypto API,
 * or a fallback if not available. Useful for identifying services, entities, or requests.
 * @returns {string} A new UUID string.
 */
export const generateUniqueId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID (e.g., older Node.js versions)
    // This is a simplified UUID-like generator, not cryptographically secure.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};