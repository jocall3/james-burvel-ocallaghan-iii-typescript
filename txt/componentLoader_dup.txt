```typescript
// Copyright James Burvel OÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢Callaghan III
// President Citibank Demo Business Inc.

import React, { lazy, Suspense, Component, ReactNode, useCallback, useEffect, useState, useRef } from 'react'; // Added useRef for LazyMount component

/**
 * Configuration options for the retry logic of `lazyWithRetry`.
 */
export interface RetryOptions {
    /** The maximum number of times to retry loading the component. Defaults to 3. */
    maxRetries?: number;
    /** The delay in milliseconds between retries. Defaults to 1000ms. */
    retryDelayMs?: number;
    /**
     * Optional callback function to be called on each retry attempt.
     * @param error The error that occurred during the loading attempt.
     * @param attempt The current retry attempt number (1-indexed).
     */
    onRetry?: (error: Error, attempt: number) => void;
    /**
     * Optional callback function to be called if all retries fail.
     * If not provided, a page reload will be triggered.
     * @param error The final error after all retries.
     */
    onAllRetriesFailed?: (error: Error) => void;
    /**
     * Optional unique version identifier for the component. If provided, and `lazyWithRetry` detects a
     * chunk load error, it might attempt to reload with a cache-busting mechanism specific to this version.
     * Note: Full cache-busting often requires build-time changes (e.g., unique chunk names)
     * but this can be used to inform custom `onAllRetriesFailed` logic.
     */
    componentVersion?: string;
}

/**
 * A wrapper around React.lazy to retry loading a component if it fails.
 * This is useful for handling "chunk load failed" errors that can occur
 * when a user has an old version of the site and a new version is deployed.
 *
 * @param componentImport A function that returns a dynamic import, e.g., () => import('./MyComponent')
 * @param exportName The named export of the component to be loaded.
 * @param retryOptions Optional configuration for retry behavior.
 * @returns A lazy-loaded React component.
 */
export const lazyWithRetry = <T extends React.ComponentType<any>>(
    componentImport: () => Promise<{ [key: string]: T }>,
    exportName: string,
    retryOptions?: RetryOptions
) => {
    const MAX_RETRIES = retryOptions?.maxRetries ?? 3;
    const RETRY_DELAY_MS = retryOptions?.retryDelayMs ?? 1000;

    return lazy(async () => {
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const module = await componentImport();
                if (module[exportName]) {
                    return { default: module[exportName] };
                }
                // This indicates a developer error (e.g., wrong export name), not a chunk load error.
                throw new Error(`Named export '${exportName}' not found in module.`);
            } catch (error: any) {
                console.error(`Component '${exportName}' load failed. Attempt ${i + 1}/${MAX_RETRIES}.`, error);

                retryOptions?.onRetry?.(error, i + 1);

                if (i < MAX_RETRIES - 1) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                } else {
                    if (retryOptions?.onAllRetriesFailed) {
                        retryOptions.onAllRetriesFailed(error);
                    } else {
                        // Default behavior after all retries fail: force a page reload.
                        // This is effective for stale chunk issues after new deployments.
                        console.error(`Failed to load component '${exportName}' after multiple retries. Reloading page.`);
                        window.location.reload();
                    }
                    // Re-throw the error to allow potential ErrorBoundaries to catch it,
                    // though a page reload will likely pre-empt this.
                    throw error;
                }
            }
        }
        // This line should theoretically not be reached, but included for robustness and type safety.
        throw new Error(`Component '${exportName}' failed to load and retries were exhausted unexpectedly.`);
    });
};

/**
 * Props for a robust Error Boundary component.
 */
export interface ErrorBoundaryProps {
    children: ReactNode;
    /**
     * A fallback UI to render when an error occurs.
     * Can be a ReactNode or a function that receives the error and component stack.
     */
    fallback?: ReactNode | ((error: Error, componentStack: string) => ReactNode);
    /**
     * Callback function invoked when an error is caught. Useful for logging errors to an external service.
     * @param error The error that was caught.
     * @param componentStack The component stack information.
     */
    onError?: (error: Error, componentStack: string, context?: Record<string, any>) => void;
    /** A unique identifier for this boundary instance, useful for distinguishing logs. */
    boundaryName?: string;
    /** Optional context object to be passed to the onError callback, useful for adding extra metadata to logs. */
    context?: Record<string, any>;
}

/**
 * State for the ErrorBoundary component.
 */
export interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: { componentStack: string } | null;
}

/**
 * Configuration for a global error reporter, to be used with `ErrorReporterProvider`.
 */
export interface GlobalErrorReporterConfig {
    /**
     * The primary function to call when an error is caught by any `ErrorBoundary` that
     * consumes this context. This takes precedence over individual `onError` props.
     * @param error The error object.
     * @param componentStack The component stack string.
     * @param context Additional metadata provided by the `ErrorBoundary` or its `props.context`.
     */
    reportError: (error: Error, componentStack: string, context?: Record<string, any>) => void;
    /**
     * Optional function to transform or filter errors before reporting.
     * Return `false` to prevent reporting.
     */
    shouldReportError?: (error: Error, componentStack: string, context?: Record<string, any>) => boolean;
    /**
     * Optional additional context that will be merged with the ErrorBoundary's context
     * before reporting.
     */
    globalContext?: Record<string, any>;
}

/**
 * React Context for global error reporting. Provides a way to centralize error reporting logic.
 */
export const ErrorReporterContext = React.createContext<GlobalErrorReporterConfig | undefined>(undefined);

/**
 * A React Provider component that makes a global error reporting configuration available
 * to all descendant `ErrorBoundary` components.
 *
 * @param props.config The configuration for the global error reporter.
 * @param props.children The children components to be rendered within the context.
 *
 * @example
 * <ErrorReporterProvider config={{ reportError: (err, stack, ctx) => myTelemetryService.logError(err, stack, ctx) }}>
 *   <AppRouter />
 * </ErrorReporterProvider>
 */
// FIX for "Expected > but found value" by removing React.FC generic type assertion
export const ErrorReporterProvider = ({ config, children }: { config: GlobalErrorReporterConfig; children: ReactNode }) => {
    return (
        <ErrorReporterContext.Provider value={config}>
            {children}
        </ErrorReporterContext.Provider>
    );
};

/**
 * A React hook to access the global error reporting configuration.
 * @returns The `GlobalErrorReporterConfig` or `undefined` if no provider is in scope.
 */
export function useErrorReporter(): GlobalErrorReporterConfig | undefined {
    return React.useContext(ErrorReporterContext);
}

/**
 * A robust Error Boundary component to catch JavaScript errors anywhere in its child component tree,
 * log those errors, and display a fallback UI. This prevents the entire application from crashing.
 *
 * It can also be configured to report errors to an external logging service via the `onError` prop,
 * or globally via `ErrorReporterProvider`.
 *
 * @example
 * <ErrorBoundary fallback={<p>Something went wrong!</p>} onError={(error, stack) => myLogger.log('Caught error:', error, stack)}>
 *   <MyPotentiallyBuggyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    // Add contextType to consume ErrorReporterContext
    public static contextType = ErrorReporterContext;
    public context!: React.ContextType<typeof ErrorReporterContext>;

    public state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    /**
     * This static lifecycle method is called after an error has been thrown by a descendant component.
     * It receives the error that was thrown as a parameter.
     * Use it to update state so the next render will show the fallback UI.
     */
    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error, errorInfo: null }; // errorInfo populated by componentDidCatch
    }

    /**
     * This lifecycle method is called after an error has been thrown by a descendant component.
     * It receives two parameters: the error and an object with `componentStack` key.
     * Use it for side-effects like error logging.
     */
    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo }); // Update state with component stack

        const logMessage = `ErrorBoundary: Caught an error in ${this.props.boundaryName || 'unnamed boundary'}.`;
        console.error(logMessage, error, errorInfo, { context: this.props.context });

        // Report error to the global reporter if available
        const globalReporter = this.context;
        if (globalReporter?.reportError) {
            const mergedContext = { ...globalReporter.globalContext, ...this.props.context, boundaryName: this.props.boundaryName };
            if (globalReporter.shouldReportError ? globalReporter.shouldReportError(error, errorInfo.componentStack, mergedContext) : true) {
                globalReporter.reportError(error, errorInfo.componentStack, mergedContext);
            }
        }

        // Also call the individual onError prop if provided (allows local logging in addition to global)
        if (this.props.onError) {
            this.props.onError(error, errorInfo.componentStack, this.props.context);
        }

        // Example: Integrate with a global error logging service if available
        // (window as any).globalErrorLogger?.report(error, errorInfo, { context: this.props.boundaryName, ...this.props.context });
    }

    public render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                if (typeof this.props.fallback === 'function') {
                    // Pass the actual error and stack to the fallback function
                    return this.props.fallback(this.state.error!, this.state.errorInfo?.componentStack || '');
                }
                return this.props.fallback;
            }
            // Default fallback if no custom one is provided
            return (
                <div style={{ padding: '20px', border: '1px solid red', color: 'red', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                    <h3>Application Error</h3>
                    <p>We're sorry, an unexpected error occurred. Please try refreshing the page or contact support.</p>
                    {/* Display error details only in development for debugging */}
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px', fontSize: '0.85em' }}>
                            <summary>Error Details</summary>
                            <p>{this.state.error && this.state.error.toString()}</p>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Options for `createRobustLazyComponent`, combining retry and error boundary configurations.
 */
export interface RobustLazyComponentOptions extends RetryOptions, Partial<Omit<ErrorBoundaryProps, 'children'>> {
    /** The fallback UI to display specifically while the component is loading via Suspense. */
    loadingFallback?: ReactNode;
    /** The fallback UI to display when a runtime error occurs. This overrides the default `ErrorBoundary` fallback.
     * Can be a ReactNode or a function that receives the error and component stack.
     */
    errorFallback?: ReactNode | ((error: Error, componentStack: string) => ReactNode);
    /** An optional unique key for the component, useful for preloading. */
    componentKey?: string;
    /** An optional variant name for the component, used for A/B testing or feature flags. */
    variant?: string;
}

/**
 * Creates a robustly loaded component that combines `lazyWithRetry`, `React.Suspense`, and `ErrorBoundary`.
 * This is the recommended way to load dynamic components in the application, providing resilience
 * against network failures, chunk load errors, and runtime component errors.
 *
 * @param componentImport A function that returns a dynamic import, e.g., () => import('./MyComponent')
 * @param exportName The named export of the component to be loaded.
 * @param options Configuration options for fallback, error boundary, and retry logic.
 * @returns A React component ready for rendering, with built-in loading and error handling.
 *
 * @example
 * const DashboardComponent = createRobustLazyComponent(
 *   () => import('./Dashboard'),
 *   'Dashboard',
 *   {
 *     loadingFallback: <div>Loading Dashboard...</div>,
 *     errorFallback: <ErrorCard component="Dashboard" />,
 *     boundaryName: 'DashboardPageError',
 *     onError: (error, stack) => console.log('Dashboard error:', error, stack),
 *     maxRetries: 5,
 *     componentKey: 'DashboardPage'
 *   }
 * );
 *
 * // Usage in a parent component:
 * <DashboardComponent userId="123" />
 */
export function createRobustLazyComponent<T extends React.ComponentType<any>>(
    componentImport: () => Promise<{ [key: string]: T }>,
    exportName: string,
    options?: RobustLazyComponentOptions
): React.ComponentType<React.ComponentProps<T>> {
    const defaultOptions: RobustLazyComponentOptions = {
        loadingFallback: null,
        errorFallback: null,
        boundaryName: `LazyComponentErrorBoundary-${exportName}`,
        ...options,
    };

    // Override the onAllRetriesFailed default to provide a more controlled error path if not specified
    const finalOnAllRetriesFailed = defaultOptions.onAllRetriesFailed || ((error) => {
        console.error(`Final loading failure for component '${exportName}'. Consider implementing a global error screen or specific fallback.`);
        // For scenarios where the root chunk fails, a reload is often the only path.
        // For individual components, more graceful error handling might be desired.
        // As a robust default, we still trigger reload if no specific handler is provided.
        window.location.reload();
    });

    const LazyComponent = lazyWithRetry(componentImport, exportName, {
        maxRetries: defaultOptions.maxRetries,
        retryDelayMs: defaultOptions.retryDelayMs,
        onRetry: defaultOptions.onRetry,
        onAllRetriesFailed: finalOnAllRetriesFailed,
        componentVersion: defaultOptions.componentVersion,
    });

    const RobustWrapper = (props: React.ComponentProps<T>) => {
        const errorBoundaryProps: ErrorBoundaryProps = {
            fallback: defaultOptions.errorFallback || defaultOptions.loadingFallback, // Prefer error-specific fallback, then loading fallback
            onError: defaultOptions.onError,
            boundaryName: defaultOptions.boundaryName,
            context: { componentKey: defaultOptions.componentKey, exportName, variant: defaultOptions.variant, ...defaultOptions.context },
        };

        return (
            <ErrorBoundary {...errorBoundaryProps}>
                <Suspense fallback={defaultOptions.loadingFallback}>
                    <LazyComponent {...props} />
                </Suspense>
            </ErrorBoundary>
        );
    };

    RobustWrapper.displayName = `RobustLazyComponent(${exportName}${options?.variant ? `-${options.variant}` : ''})`;
    return RobustWrapper;
}

/**
 * Global state for tracking multiple asynchronous loading operations.
 */
export interface GlobalLoadingState {
    /** A map of active loading keys to their start timestamps. */
    activeLoadings: Map<string, number>;
    /** Function to register a loading process. */
    startLoading: (key: string) => void;
    /** Function to unregister a loading process. */
    stopLoading: (key: string) => void;
    /** True if any loading process is active. */
    isLoading: boolean;
}

/**
 * React Context for global loading state.
 * Provides a way to centralize loading indicators across an application.
 */
export const LoadingContext = React.createContext<GlobalLoadingState>({
    activeLoadings: new Map(),
    startLoading: () => {},
    stopLoading: () => {},
    isLoading: false,
});

/**
 * A Provider component for managing and exposing a global loading state.
 * This allows multiple components to register their loading status, and a
 * global UI to react (e.g., show a loading spinner/progress bar).
 *
 * @example
 * <LoadingProvider>
 *   <GlobalSpinner /> // This component can consume `useLoadingState`
 *   <AppContent />
 * </LoadingProvider>
 */
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeLoadings, setActiveLoadings] = useState<Map<string, number>>(new Map());

    const startLoading = useCallback((key: string) => {
        setActiveLoadings(prev => {
            const newMap = new Map(prev);
            newMap.set(key, Date.now());
            return newMap;
        });
    }, []);

    const stopLoading = useCallback((key: string) => {
        setActiveLoadings(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
        });
    }, []);

    const isLoading = activeLoadings.size > 0;

    const contextValue = { activeLoadings, startLoading, stopLoading, isLoading };

    return (
        <LoadingContext.Provider value={contextValue}>
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * A React hook to access the global loading state and control functions.
 * Use this hook in components that need to indicate loading, or in a global UI
 * to show/hide a loading indicator.
 * @returns The `GlobalLoadingState` object.
 *
 * @example
 * function MyComponent() {
 *   const { startLoading, stopLoading, isLoading } = useLoadingState();
 *
 *   useEffect(() => {
 *     startLoading('myDataFetch');
 *     fetchData().then(() => stopLoading('myDataFetch'));
 *   }, []);
 *
 *   return isLoading ? <p>Loading data...</p> : <p>Data loaded.</p>;
 * }
 */
export function useLoadingState(): GlobalLoadingState {
    return React.useContext(LoadingContext);
}


type ComponentPreloadCache = Map<string, Promise<any>>;
const componentPreloadCache: ComponentPreloadCache = new Map();

/**
 * Preloads a lazy component by initiating its import process.
 * This can improve perceived performance for components that are likely to be used soon,
 * by fetching the component's code bundle in the background before it's actually rendered.
 *
 * @param componentKey A unique identifier for the component to preload.
 * @param componentImport A function that returns a dynamic import, e.g., () => import('./MyComponent')
 * @returns A Promise that resolves when the component module has been loaded.
 *          The promise is cached, so subsequent calls with the same key won't re-initiate the fetch.
 *
 * @example
 * // In an early stage of your application (e.g., after login, or on route hover):
 * preloadComponent('HomePage', () => import('./Home'));
 *
 * // Later, when rendering:
 * const HomePageComponent = createRobustLazyComponent(
 *   () => import('./Home'),
 *   'Home',
 *   { componentKey: 'HomePage', fallback: <LoadingSpinner /> }
 * );
 * <HomePageComponent /> // This will likely render instantly if preloaded successfully.
 */
export function preloadComponent(componentKey: string, componentImport: () => Promise<any>): Promise<any> {
    if (!componentPreloadCache.has(componentKey)) {
        const loadPromise = componentImport();
        componentPreloadCache.set(componentKey, loadPromise);
        // Remove from cache on failure to allow subsequent attempts, or for clearer error state
        loadPromise.catch(error => {
            console.error(`Failed to preload component '${componentKey}':`, error);
            componentPreloadCache.delete(componentKey);
        });
    }
    return componentPreloadCache.get(componentKey)!;
}

/**
 * Preloads a component when it becomes visible in the viewport.
 * Uses Intersection Observer API for efficient background loading.
 *
 * @param componentKey A unique identifier for the component to preload.
 * @param componentImport A function that returns a dynamic import.
 * @returns A React ref that should be attached to the element whose visibility triggers the preload.
 *
 * @example
 * const MyLazyComponent = createRobustLazyComponent(...);
 * const preloadRef = preloadComponentOnVisibility('MyLazyComponent', () => import('./MyLazyComponent'));
 *
 * return (
 *   <div>
 *     <div ref={preloadRef} style={{ minHeight: '100px' }}>
 *       {/* This area triggers preload when visible */}
 *     </div>
 *     <MyLazyComponent />
 *   </div>
 * );
 */
export function preloadComponentOnVisibility(
    componentKey: string,
    componentImport: () => Promise<any>
): React.RefCallback<HTMLElement> {
    const handleRef = useCallback((node: HTMLElement | null) => {
        if (!node) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    preloadComponent(componentKey, componentImport);
                    observer.disconnect(); // Stop observing once preloaded
                }
            });
        }, {
            rootMargin: '200px', // Start preloading 200px before it enters the viewport
            threshold: 0.1, // Trigger when 10% of the element is visible
        });

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [componentKey, componentImport]);

    return handleRef;
}

/**
 * Retrieves a component's import promise from the preload cache, or initiates loading if not present.
 * This function is an alternative to `preloadComponent` when you want to ensure a component
 * is being loaded, but don't strictly need to await the promise at the call site.
 *
 * @param componentKey A unique identifier for the component.
 * @param componentImportFactory A function that returns a dynamic import. This factory is called if the component is not in cache.
 * @returns A Promise that represents the loading of the component.
 */
export function getOrPreloadComponentImport(componentKey: string, componentImportFactory: () => Promise<any>): Promise<any> {
    if (componentPreloadCache.has(componentKey)) {
        return componentPreloadCache.get(componentKey)!;
    }
    return preloadComponent(componentKey, componentImportFactory);
}

/**
 * Represents the schema for a component's props, useful for runtime validation.
 * Can be any object where keys are prop names and values describe validation rules (e.g., Joi schema, Yup schema, or a simple type).
 */
export type ComponentPropsSchema<P extends object = any> = {
    [K in keyof P]?: any; // Define your schema structure here, e.g., Joi.object().keys(...)
};

/**
 * Interface for a registered component entry, including an optional props schema.
 */
export interface RegisteredComponentEntry {
    component: React.ComponentType<any>;
    schema?: ComponentPropsSchema;
    variantName?: string; // Added to indicate if it's a specific variant
}

type ExtendedComponentRegistry = Map<string, RegisteredComponentEntry>;
const globalExtendedComponentRegistry: ExtendedComponentRegistry = new Map();

// Helper to construct a component key, especially for variants
function getRegistryKey(key: string, variant?: string): string {
    return variant ? `${key}::${variant}` : key;
}

/**
 * Registers a React component (typically one created by `createRobustLazyComponent`) with a unique key.
 * This allows components to be referenced and retrieved by a string identifier,
 * facilitating dynamic component loading and rendering based on configurations,
 * feature flags, or content management systems.
 *
 * Optionally, a `variant` can be provided to register different versions of the same logical component.
 *
 * @param key The unique string key for the component (e.g., 'DashboardPage', 'ProductCard').
 * @param component The React component to register.
 * @param schema An optional schema to validate the props passed to this component dynamically.
 * @param variant An optional variant name (e.g., 'v2', 'abTest'). If provided, the component is registered as a variant.
 * @throws {Error} If a component with the same key (and variant if specified) is already registered.
 *
 * @example
 * // Registering a default component:
 * registerComponent('Dashboard', createRobustLazyComponent(() => import('./Dashboard'), 'Dashboard'));
 *
 * // Registering a variant of a component:
 * registerComponent('ProductCard', createRobustLazyComponent(() => import('./ProductCardV1'), 'ProductCard'), undefined, 'v1');
 * registerComponent('ProductCard', createRobustLazyComponent(() => import('./ProductCardV2'), 'ProductCard'), undefined, 'v2');
 */
export function registerComponent(key: string, component: React.ComponentType<any>, schema?: ComponentPropsSchema, variant?: string): void {
    const registryKey = getRegistryKey(key, variant);
    if (globalExtendedComponentRegistry.has(registryKey)) {
        throw new Error(`Component with key '${registryKey}' is already registered. Please use a unique key or variant.`);
    }
    globalExtendedComponentRegistry.set(registryKey, { component, schema, variantName: variant });
    console.debug(`Component '${registryKey}' registered successfully.`);
}

/**
 * Retrieves a previously registered React component by its key and optional variant from the global registry.
 *
 * @param key The unique string key of the component (e.g., 'DashboardPage').
 * @param variant An optional variant name to retrieve a specific version.
 * @returns The registered React component, or `undefined` if no component is found for the given key/variant.
 */
export function getRegisteredComponent(key: string, variant?: string): React.ComponentType<any> | undefined {
    return globalExtendedComponentRegistry.get(getRegistryKey(key, variant))?.component;
}

/**
 * Retrieves a previously registered React component entry (component and its schema) by its key and optional variant.
 *
 * @param key The unique string key of the component.
 * @param variant An optional variant name.
 * @returns The registered component entry, or `undefined`.
 */
export function getRegisteredComponentEntry(key: string, variant?: string): RegisteredComponentEntry | undefined {
    return globalExtendedComponentRegistry.get(getRegistryKey(key, variant));
}

/**
 * A React hook for dynamically retrieving a registered component.
 *
 * @param componentKey The key of the component to retrieve.
 * @param variant An optional variant name.
 * @returns The registered React component, or `undefined` if not found.
 */
export function useDynamicComponent(componentKey: string, variant?: string): React.ComponentType<any> | undefined {
    const [component, setComponent] = useState<React.ComponentType<any> | undefined>(undefined);

    useEffect(() => {
        setComponent(getRegisteredComponent(componentKey, variant));
    }, [componentKey, variant]);

    return component;
}

/**
 * A type for defining component configurations, used with `DynamicComponentRenderer`.
 */
export interface ComponentConfig {
    componentKey: string;
    variant?: string; // Added variant support
    props?: { [key: string]: any };
    /** Optional explicit `fallback` for this specific dynamic render if the component is not found. */
    fallback?: ReactNode;
    /** Optional `errorBoundaryProps` for a dedicated ErrorBoundary wrapping this specific dynamic render. */
    errorBoundaryProps?: Partial<ErrorBoundaryProps>;
    /** If true, and the component is not found, `null` will be returned instead of a warning message. */
    renderNullIfNotFound?: boolean;
}

/**
 * Dynamically loads and renders a component based on a configuration object.
 * This is a higher-level utility that leverages `getRegisteredComponent` and allows
 * for flexible rendering of components and their props based on external data.
 *
 * @param config The configuration object containing `componentKey` and `props`.
 * @param config.componentKey The key of the component to render, as registered via `registerComponent`.
 * @param config.variant Optional variant of the component to render.
 * @param config.props Optional props to pass to the component.
 * @returns The rendered React component or a fallback if not found/configured.
 *
 * @example
 * const componentConfig = {
 *   componentKey: 'Dashboard',
 *   props: { userId: '123', theme: 'dark' }
 * };
 *
 * <DynamicComponentRenderer config={componentConfig} />
 *
 * // With fallback for missing component:
 * <DynamicComponentRenderer
 *   config={{ componentKey: 'NonExistentComponent' }}
 *   options={{ fallback: <div>Component not found!</div> }}
 * />
 *
 * // With explicit null for missing component:
 * <DynamicComponentRenderer
 *   config={{ componentKey: 'NonExistentComponent', renderNullIfNotFound: true }}
 * /> // Renders null
 *
 * // With a specific variant:
 * <DynamicComponentRenderer config={{ componentKey: 'ProductCard', variant: 'v2', props: { productId: 'abc' } }} />
 */
export const DynamicComponentRenderer: React.FC<{
    config: ComponentConfig;
}> = ({ config }) => {
    const componentEntry = getRegisteredComponentEntry(config.componentKey, config.variant);

    if (!componentEntry || !componentEntry.component) {
        if (config.renderNullIfNotFound) {
            return null;
        }
        const displayKey = getRegistryKey(config.componentKey, config.variant);
        console.warn(`Attempted to render unregistered component: '${displayKey}'`);
        return (config.fallback || (
            <div style={{ color: 'orange', padding: '10px', border: '1px dashed orange', borderRadius: '4px' }}>
                Warning: Component '{displayKey}' not found in registry.
            </div>
        )) as React.ReactElement;
    }

    const ComponentToRender = componentEntry.component;
    let validatedProps = config.props;

    // Perform prop validation if a schema is provided
    if (componentEntry.schema && config.props) {
        try {
            // This is a simple example. In a real app, integrate with a robust validation library (Joi, Yup, Zod).
            // For now, it assumes schema values are simple predicate functions.
            for (const propName in componentEntry.schema) {
                if (Object.prototype.hasOwnProperty.call(componentEntry.schema, propName)) {
                    const validator = componentEntry.schema[propName];
                    if (typeof validator === 'function' && !validator(config.props[propName])) {
                        console.error(`DynamicComponentRenderer: Prop validation failed for component '${getRegistryKey(config.componentKey, config.variant)}'. Prop '${propName}' is invalid.`, config.props[propName]);
                        // Optionally throw or adjust props. For now, just log.
                    }
                }
            }
        } catch (validationError: any) {
            console.error(`DynamicComponentRenderer: Error during prop validation for component '${getRegistryKey(config.componentKey, config.variant)}':`, validationError);
            // Decide how to handle validation errors: render an error fallback, filter props, etc.
            // For now, continue with the potentially invalid props or strip them.
            // Example: validatedProps = {}; // Clear props on severe validation failure
        }
    }

    const componentElement = <ComponentToRender {...validatedProps} />;

    // Wrap with an optional ErrorBoundary if specified, for granular error handling.
    if (config.errorBoundaryProps) {
        return (
            <ErrorBoundary
                {...config.errorBoundaryProps}
                boundaryName={config.errorBoundaryProps.boundaryName || `DynamicRendererBoundary-${getRegistryKey(config.componentKey, config.variant)}`}
                context={{ componentKey: config.componentKey, variant: config.variant, ...config.errorBoundaryProps.context }}
            >
                {componentElement}
            </ErrorBoundary>
        );
    }

    return componentElement;
};

export interface LazyMountProps {
    /** The content to render. */
    children: ReactNode;
    /**
     * If true, children will be mounted immediately. Useful for toggling lazy behavior.
     * Defaults to false.
     */
    forceMount?: boolean;
    /**
     * Optional component to render while children are not mounted (e.g., a placeholder).
     * Defaults to `null`.
     */
    placeholder?: ReactNode;
    /**
     * Optional delay in milliseconds before mounting children, even after criteria are met.
     * Useful to debounce mounting or ensure smooth transitions. Defaults to 0.
     */
    delayMs?: number;
    /**
     * Options for the Intersection Observer. Only applies if `mountOnVisible` is true.
     */
    intersectionObserverOptions?: IntersectionObserverInit;
    /**
     * If true, children will mount when the component enters the viewport.
     * Defaults to false.
     */
    mountOnVisible?: boolean;
    /**
     * If true, children will mount after the specified `delayMs` has passed since render.
     * Defaults to false.
     */
    mountAfterDelay?: boolean;
}

/**
 * `LazyMount` defers the actual mounting and rendering of its children until
 * certain conditions are met, such as becoming visible in the viewport or after a delay.
 * This can significantly improve initial page load performance and perceived responsiveness
 * by avoiding rendering off-screen or non-critical components immediately.
 *
 * It uses an `IntersectionObserver` when `mountOnVisible` is true to detect visibility.
 * If no `placeholder` is provided with `mountOnVisible`, a minimal invisible `div` is rendered
 * to serve as the observation target.
 *
 * @example
 * // Mounts after 2 seconds
 * <LazyMount mountAfterDelay delayMs={2000} placeholder={<div>Loading content...</div>}>
 *   <HeavyComponent />
 * </LazyMount>
 *
 * @example
 * // Mounts when visible in viewport
 * <LazyMount mountOnVisible placeholder={<div style={{ height: '300px', background: '#f0f0f0' }}>Scroll down to load</div>}>
 *   <ImageGallery />
 * </LazyMount>
 *
 * @example
 * // Combining with `createRobustLazyComponent` for full lazy experience:
 * const LazyDashboard = createRobustLazyComponent(() => import('./Dashboard'), 'Dashboard');
 * <LazyMount mountOnVisible placeholder={<div>Dashboard placeholder</div>}>
 *   <LazyDashboard />
 * </LazyMount>
 */
export const LazyMount: React.FC<LazyMountProps> = ({
    children,
    forceMount = false,
    placeholder = null,
    delayMs = 0,
    intersectionObserverOptions,
    mountOnVisible = false,
    mountAfterDelay = false,
}) => {
    const [shouldMount, setShouldMount] = useState(false);
    const elementRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    // Effect for mounting after a delay
    useEffect(() => {
        if (forceMount) {
            setShouldMount(true);
            return;
        }

        if (mountAfterDelay && delayMs > 0 && !shouldMount) {
            timeoutRef.current = setTimeout(() => {
                setShouldMount(true);
            }, delayMs);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [forceMount, mountAfterDelay, delayMs, shouldMount]);

    // Effect for mounting on visibility
    useEffect(() => {
        if (forceMount || shouldMount || !mountOnVisible || !elementRef.current) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setShouldMount(true);
                    observer.disconnect();
                }
            });
        }, intersectionObserverOptions);

        observer.observe(elementRef.current);

        return () => {
            // Disconnect observer on component unmount or when dependencies change
            if (observer) {
                observer.disconnect();
            }
        };
    }, [forceMount, shouldMount, mountOnVisible, intersectionObserverOptions]);


    if (shouldMount || forceMount) {
        return <>{children}</>;
    }

    if (mountOnVisible) {
        // Create an observable element. If a placeholder is provided, it's rendered inside.
        // If no placeholder, a minimal invisible div is used for observation.
        const observableElement = (
            <div
                ref={elementRef}
                style={
                    placeholder === null
                        ? { minHeight: '1px', minWidth: '1px', overflow: 'hidden', pointerEvents: 'none' } // Minimal size for observation
                        : {} // Let the placeholder define the visual area
                }
            >
                {placeholder}
            </div>
        );
        return observableElement;
    }

    return <>{placeholder}</>;
};

// Expose a helper to clear the preload cache, primarily for testing or specific reset scenarios.
/**
 * Clears the internal component preload cache.
 * Use with caution, primarily for testing or scenarios where dynamic component re-evaluation is needed.
 */
export function clearComponentPreloadCache(): void {
    componentPreloadCache.clear();
    console.debug("Component preload cache cleared.");
}

// Expose a helper to clear the component registry, primarily for testing or specific reset scenarios.
/**
 * Clears the internal global component registry.
 * Use with caution, primarily for testing or scenarios where dynamic component re-registration is needed.
 */
export function clearComponentRegistry(): void {
    globalExtendedComponentRegistry.clear();
    console.debug("Global component registry cleared.");
}

/**
 * A utility to check if a component with a given key and optional variant is already registered.
 * @param key The component key to check.
 * @param variant An optional variant name.
 * @returns `true` if registered, `false` otherwise.
 */
export function isComponentRegistered(key: string, variant?: string): boolean {
    return globalExtendedComponentRegistry.has(getRegistryKey(key, variant));
}

/**
 * An advanced `useDynamicComponent` hook that also returns the component's schema and variant name.
 * @param componentKey The key of the component.
 * @param variant An optional variant name.
 * @returns An object containing the component and its schema, or `undefined` if not found.
 */
export function useDynamicComponentEntry(componentKey: string, variant?: string): RegisteredComponentEntry | undefined {
    const [entry, setEntry] = useState<RegisteredComponentEntry | undefined>(undefined);

    useEffect(() => {
        setEntry(getRegisteredComponentEntry(componentKey, variant));
    }, [componentKey, variant]);

    return entry;
}

// --- NEW FEATURE: FEATURE FLAG SYSTEM ---

/**
 * Configuration for a feature flag. Can be boolean, string, or number.
 */
export type FeatureFlagValue = boolean | string | number | undefined;

/**
 * Interface for the feature flag context.
 */
export interface FeatureFlagContextType {
    /** Map of feature flag keys to their values. */
    flags: Record<string, FeatureFlagValue>;
    /** Function to get a feature flag value, with an optional default. */
    getFlag: (key: string, defaultValue?: FeatureFlagValue) => FeatureFlagValue;
    /** Function to update a feature flag value dynamically. */
    setFlag: (key: string, value: FeatureFlagValue) => void;
}

/**
 * React Context for feature flag management.
 */
export const FeatureFlagContext = React.createContext<FeatureFlagContextType | undefined>(undefined);

/**
 * Props for the FeatureFlagProvider component.
 */
export interface FeatureFlagProviderProps {
    /** Initial feature flags. */
    initialFlags?: Record<string, FeatureFlagValue>;
    /** Children to render within the provider's scope. */
    children: ReactNode;
}

/**
 * A Provider component for managing and exposing feature flags to descendant components.
 * Allows centralizing feature flag configuration and dynamic updates.
 *
 * @example
 * <FeatureFlagProvider initialFlags={{ newDashboard: true, betaSearch: false }}>
 *   <App />
 * </FeatureFlagProvider>
 */
export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ initialFlags = {}, children }) => {
    const [flags, setFlags] = useState<Record<string, FeatureFlagValue>>(initialFlags);

    const getFlag = useCallback((key: string, defaultValue: FeatureFlagValue = false) => {
        return flags[key] !== undefined ? flags[key] : defaultValue;
    }, [flags]);

    const setFlag = useCallback((key: string, value: FeatureFlagValue) => {
        setFlags(prev => ({ ...prev, [key]: value }));
        console.debug(`Feature flag '${key}' updated to: ${value}`);
    }, []);

    const contextValue = { flags, getFlag, setFlag };

    return (
        <FeatureFlagContext.Provider value={contextValue}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

/**
 * A React hook to access feature flag values and management functions.
 * @returns The `FeatureFlagContextType` object, or `undefined` if not within a `FeatureFlagProvider`.
 *
 * @example
 * const { getFlag, setFlag } = useFeatureFlagContext();
 * const isNewDashboardEnabled = getFlag('newDashboard', false);
 *
 * function MyComponent() {
 *   const isBetaSearch = useFeatureFlag('betaSearch');
 *   return isBetaSearch ? <BetaSearch /> : <OldSearch />;
 * }
 */
export function useFeatureFlagContext(): FeatureFlagContextType {
    const context = React.useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
    }
    return context;
}

/**
 * A convenient hook to directly get a feature flag's boolean value.
 * @param key The key of the feature flag.
 * @param defaultValue The default value if the flag is not set (defaults to `false`).
 * @returns The boolean value of the feature flag.
 */
export function useFeatureFlag(key: string, defaultValue: boolean = false): boolean {
    const { getFlag } = useFeatureFlagContext();
    const value = getFlag(key, defaultValue);
    return typeof value === 'boolean' ? value : !!value; // Convert to boolean if it's string/number
}

/**
 * A component that conditionally renders its children based on a feature flag.
 * If the flag is enabled (truthy), children are rendered; otherwise, `fallback` is rendered.
 *
 * @param props.flagKey The key of the feature flag to check.
 * @param props.children The content to render if the flag is enabled.
 * @param props.fallback Optional content to render if the flag is disabled. Defaults to `null`.
 *
 * @example
 * <FeatureGate flagKey="newLayout">
 *   <NewLayout />
 * </FeatureGate>
 *
 * <FeatureGate flagKey="promoBanner" fallback={<span>No promo</span>}>
 *   <PromoBanner />
 * </FeatureGate>
 */
export const FeatureGate: React.FC<{ flagKey: string; children: ReactNode; fallback?: ReactNode }> = ({ flagKey, children, fallback = null }) => {
    const isEnabled = useFeatureFlag(flagKey);
    return <>{isEnabled ? children : fallback}</>;
};

// --- NEW FEATURE: GLOBAL MODAL/DIALOG SYSTEM ---

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Configuration options for a single modal instance.
 */
export interface ModalOptions {
    /** A unique ID for this modal instance, if not provided, one will be generated. */
    id?: string;
    /** The title of the modal, displayed in the header. */
    title?: ReactNode;
    /** The main content of the modal. */
    content: ReactNode;
    /** Optional footer actions (e.g., buttons). */
    footer?: ReactNode;
    /** Whether the modal can be closed by clicking outside or pressing Escape. Defaults to true. */
    closable?: boolean;
    /** Callback when the modal is requested to close. */
    onClose?: (id: string) => void;
    /** Size of the modal. */
    size?: ModalSize;
    /** Custom CSS class for the modal overlay. */
    overlayClassName?: string;
    /** Custom CSS class for the modal content container. */
    contentClassName?: string;
    /** If true, the modal will not have a standard header (title, close button). */
    hideHeader?: boolean;
    /** If true, the modal will not have a standard footer. */
    hideFooter?: boolean;
}

/**
 * Represents an active modal in the global state.
 */
export interface ActiveModal extends ModalOptions {
    id: string; // ID becomes mandatory once active
}

/**
 * Interface for the Modal Context.
 */
export interface ModalContextType {
    /** Opens a new modal. Returns the ID of the opened modal. */
    openModal: (options: ModalOptions) => string;
    /** Closes a specific modal by its ID. */
    closeModal: (id: string) => void;
    /** Closes all currently open modals. */
    closeAllModals: () => void;
    /** The list of currently active modals. */
    activeModals: ActiveModal[];
}

/**
 * React Context for global modal management.
 */
export const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

/**
 * A Provider component for managing and exposing modal state and functions.
 * It should typically wrap your entire application or a major section.
 *
 * @example
 * <ModalProvider>
 *   <GlobalModalContainer />
 *   <App />
 * </ModalProvider>
 */
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeModals, setActiveModals] = useState<ActiveModal[]>([]);
    const modalCounter = useRef(0);

    const openModal = useCallback((options: ModalOptions) => {
        const id = options.id || `modal-${modalCounter.current++}`;
        const newModal: ActiveModal = { ...options, id };
        setActiveModals(prev => [...prev, newModal]);
        return id;
    }, []);

    const closeModal = useCallback((id: string) => {
        setActiveModals(prev => {
            const modalToClose = prev.find(m => m.id === id);
            if (modalToClose && modalToClose.onClose) {
                modalToClose.onClose(id);
            }
            return prev.filter(modal => modal.id !== id);
        });
    }, []);

    const closeAllModals = useCallback(() => {
        setActiveModals(prev => {
            prev.forEach(modal => {
                if (modal.onClose) {
                    modal.onClose(modal.id);
                }
            });
            return [];
        });
    }, []);

    const contextValue = { openModal, closeModal, closeAllModals, activeModals };

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
        </ModalContext.Provider>
    );
};

/**
 * A React hook to access modal management functions.
 * @returns The `ModalContextType` object.
 *
 * @example
 * const { openModal, closeModal } = useModal();
 * openModal({ title: 'My Dialog', content: <p>Hello!</p> });
 */
export function useModal(): ModalContextType {
    const context = React.useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}

/**
 * A minimal, unstyled modal component for `GlobalModalContainer`.
 * Implement your actual modal UI components here or import from a UI library.
 */
const BasicModal: React.FC<{ modal: ActiveModal; onClose: (id: string) => void }> = ({ modal, onClose }) => {
    const handleClose = useCallback(() => {
        if (modal.closable !== false) {
            onClose(modal.id);
        }
    }, [modal.id, modal.closable, onClose]);

    // Handle Escape key to close
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && modal.closable !== false) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, modal.closable]);

    const sizeStyles: Record<ModalSize, React.CSSProperties> = {
        sm: { width: '300px' },
        md: { width: '500px' },
        lg: { width: '700px' },
        xl: { width: '900px' },
        full: { width: '95%', height: '95%' },
    };

    return (
        <div
            className={modal.overlayClassName}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                pointerEvents: modal.closable !== false ? 'auto' : 'none', // Allow clicks if closable
            }}
            onClick={modal.closable !== false ? handleClose : undefined} // Close on overlay click
        >
            <div
                className={modal.contentClassName}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    padding: '20px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    pointerEvents: 'auto', // Re-enable pointer events for modal content
                    ...sizeStyles[modal.size || 'md'],
                }}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {!modal.hideHeader && (modal.title || (modal.closable !== false && onClose)) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>{modal.title}</h3>
                        {modal.closable !== false && (
                            <button
                                onClick={handleClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5em',
                                    cursor: 'pointer',
                                    lineHeight: '1',
                                    padding: '0 5px',
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}
                <div style={{ paddingBottom: modal.footer ? '15px' : '0' }}>{modal.content}</div>
                {!modal.hideFooter && modal.footer && (
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {modal.footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * A component that renders all currently active modals managed by the `ModalProvider`.
 * This should typically be placed high in your component tree, often directly within `ModalProvider`.
 *
 * @example
 * <ModalProvider>
 *   <GlobalModalContainer /> // Renders modals here
 *   <App />
 * </ModalProvider>
 */
export const GlobalModalContainer: React.FC = () => {
    const { activeModals, closeModal } = useModal();

    if (activeModals.length === 0) {
        return null;
    }

    return (
        <>
            {activeModals.map((modal) => (
                <BasicModal key={modal.id} modal={modal} onClose={closeModal} />
            ))}
        </>
    );
};


// --- NEW FEATURE: GLOBAL TOAST/NOTIFICATION SYSTEM ---

export type ToastType = 'info' | 'success' | 'warning' | 'error';

/**
 * Configuration options for a single toast message.
 */
export interface ToastMessageOptions {
    /** A unique ID for this toast, if not provided, one will be generated. */
    id?: string;
    /** The type of toast, influencing its styling. */
    type?: ToastType;
    /** The content of the toast message. */
    message: ReactNode;
    /** Duration in milliseconds before the toast auto-dismisses. Set to 0 for permanent. Defaults to 5000ms. */
    duration?: number;
    /** Callback function when the toast is dismissed (either by timeout or user action). */
    onDismiss?: (id: string) => void;
    /** If true, a close button will be displayed. Defaults to true. */
    closable?: boolean;
    /** Custom CSS class for the toast container. */
    className?: string;
}

/**
 * Represents an active toast message in the global state.
 */
export interface ActiveToast extends ToastMessageOptions {
    id: string; // ID becomes mandatory once active
    type: ToastType; // Type becomes mandatory with default once active
    duration: number; // Duration becomes mandatory with default once active
}

/**
 * Interface for the Toast Context.
 */
export interface ToastContextType {
    /** Adds a new toast message. Returns the ID of the new toast. */
    addToast: (options: ToastMessageOptions) => string;
    /** Dismisses a specific toast message by its ID. */
    dismissToast: (id: string) => void;
}

/**
 * React Context for global toast management.
 */
export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

/**
 * A Provider component for managing and exposing toast messages.
 * It should typically wrap your entire application or a major section.
 *
 * @example
 * <ToastProvider>
 *   <GlobalToastContainer />
 *   <App />
 * </ToastProvider>
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);
    const toastCounter = useRef(0);

    const addToast = useCallback((options: ToastMessageOptions) => {
        const id = options.id || `toast-${toastCounter.current++}`;
        const newToast: ActiveToast = {
            ...options,
            id,
            type: options.type || 'info',
            duration: options.duration !== undefined ? options.duration : 5000,
            closable: options.closable !== undefined ? options.closable : true,
        };
        setActiveToasts(prev => [...prev, newToast]);
        return id;
    }, []);

    const dismissToast = useCallback((id: string) => {
        setActiveToasts(prev => {
            const toastToDismiss = prev.find(t => t.id === id);
            if (toastToDismiss && toastToDismiss.onDismiss) {
                toastToDismiss.onDismiss(id);
            }
            return prev.filter(toast => toast.id !== id);
        });
    }, []);

    const contextValue = { addToast, dismissToast };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
};

/**
 * A React hook to access toast management functions.
 * @returns The `ToastContextType` object.
 *
 * @example
 * const { addToast } = useToast();
 * addToast({ type: 'success', message: 'Item saved!' });
 */
export function useToast(): ToastContextType {
    const context = React.useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

/**
 * A minimal, unstyled toast component for `GlobalToastContainer`.
 * Implement your actual toast UI components here or import from a UI library.
 */
const BasicToast: React.FC<{ toast: ActiveToast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const timerRef = useRef<NodeJS.Timeout>();

    const handleDismiss = useCallback(() => {
        clearTimeout(timerRef.current!);
        onDismiss(toast.id);
    }, [toast.id, onDismiss]);

    useEffect(() => {
        if (toast.duration > 0) {
            timerRef.current = setTimeout(handleDismiss, toast.duration);
        }
        return () => clearTimeout(timerRef.current!);
    }, [toast.duration, handleDismiss]);

    const typeColors: Record<ToastType, { background: string; border: string; color: string }> = {
        info: { background: '#e0f7fa', border: '#00bcd4', color: '#006064' },
        success: { background: '#e8f5e9', border: '#4caf50', color: '#1b5e20' },
        warning: { background: '#fff8e1', border: '#ffc107', color: '#ff6f00' },
        error: { background: '#ffebee', border: '#f44336', color: '#b71c1c' },
    };

    const colors = typeColors[toast.type];

    return (
        <div
            className={toast.className}
            style={{
                ...colors,
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minWidth: '280px',
                maxWidth: '400px',
            }}
        >
            <div style={{ flexGrow: 1, marginRight: toast.closable ? '10px' : '0' }}>{toast.message}</div>
            {toast.closable && (
                <button
                    onClick={handleDismiss}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2em',
                        cursor: 'pointer',
                        lineHeight: '1',
                        color: colors.color,
                        padding: '0 5px',
                    }}
                >
                    &times;
                </button>
            )}
        </div>
    );
};

/**
 * A component that renders all currently active toast messages managed by the `ToastProvider`.
 * This should typically be placed high in your component tree, often directly within `ToastProvider`,
 * or at a fixed position on the screen (e.g., top-right).
 *
 * @example
 * <ToastProvider>
 *   <GlobalToastContainer /> // Renders toasts here
 *   <App />
 * </ToastProvider>
 */
export const GlobalToastContainer: React.FC<{ position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' }> = ({ position = 'top-right' }) => {
    const { activeToasts, dismissToast } = useToast();

    const containerStyles: React.CSSProperties = {
        position: 'fixed',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        pointerEvents: 'none', // Allow clicks to pass through if no toast
    };

    switch (position) {
        case 'top-right':
            containerStyles.top = 0;
            containerStyles.right = 0;
            containerStyles.alignItems = 'flex-end';
            break;
        case 'top-left':
            containerStyles.top = 0;
            containerStyles.left = 0;
            containerStyles.alignItems = 'flex-start';
            break;
        case 'bottom-right':
            containerStyles.bottom = 0;
            containerStyles.right = 0;
            containerStyles.alignItems = 'flex-end';
            containerStyles.flexDirection = 'column-reverse'; // Stack from bottom up
            break;
        case 'bottom-left':
            containerStyles.bottom = 0;
            containerStyles.left = 0;
            containerStyles.alignItems = 'flex-start';
            containerStyles.flexDirection = 'column-reverse'; // Stack from bottom up
            break;
        case 'top-center':
            containerStyles.top = 0;
            containerStyles.left = '50%';
            containerStyles.transform = 'translateX(-50%)';
            containerStyles.alignItems = 'center';
            break;
        case 'bottom-center':
            containerStyles.bottom = 0;
            containerStyles.left = '50%';
            containerStyles.transform = 'translateX(-50%)';
            containerStyles.alignItems = 'center';
            containerStyles.flexDirection = 'column-reverse';
            break;
    }

    if (activeToasts.length === 0) {
        return null;
    }

    return (
        <div style={containerStyles}>
            {activeToasts.map((toast) => (
                <div key={toast.id} style={{ pointerEvents: 'auto' }}> {/* Re-enable pointer events for individual toast */}
                    <BasicToast toast={toast} onDismiss={dismissToast} />
                </div>
            ))}
        </div>
    );
};

// --- NEW UTILITY HOOKS ---

/**
 * React hook that returns the previous value of a state or prop.
 *
 * @param value The current value.
 * @returns The previous value.
 *
 * @example
 * function Counter() {
 *   const [count, setCount] = useState(0);
 *   const prevCount = usePrevious(count);
 *
 *   return (
 *     <div>
 *       <p>Current: {count}, Previous: {prevCount}</p>
 *       <button onClick={() => setCount(count + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

/**
 * React hook for debouncing a value. The returned value will only update
 * after a specified delay since the last update of the input value.
 *
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 *
 * @example
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       console.log('Fetching results for:', debouncedSearchTerm);
 *       // Perform API call here
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * React hook for throttling a callback function.
 * The function will be called at most once within the specified `delay` period.
 *
 * @param callback The function to throttle.
 * @param delay The throttling delay in milliseconds.
 * @returns A throttled version of the callback function.
 *
 * @example
 * function ScrollComponent() {
 *   const handleScroll = () => console.log('Scrolled!');
 *   const throttledScroll = useThrottledCallback(handleScroll, 200);
 *
 *   useEffect(() => {
 *     window.addEventListener('scroll', throttledScroll);
 *     return () => window.removeEventListener('scroll', throttledScroll);
 *   }, [throttledScroll]);
 *
 *   return <div style={{ height: '2000px' }}>Scroll me!</div>;
 * }
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): T {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastArgsRef = useRef<any[]>();
    const lastThisRef = useRef<any>();
    const lastExecutionTimeRef = useRef(0);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const throttledCallback = useCallback(function(this: any, ...args: any[]) {
        const now = Date.now();
        lastArgsRef.current = args;
        lastThisRef.current = this;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (now - lastExecutionTimeRef.current > delay) {
            callbackRef.current.apply(this, args);
            lastExecutionTimeRef.current = now;
        } else {
            timeoutRef.current = setTimeout(() => {
                if (lastArgsRef.current && lastThisRef.current) {
                    callbackRef.current.apply(lastThisRef.current, lastArgsRef.current);
                    lastExecutionTimeRef.current = Date.now();
                    lastArgsRef.current = undefined;
                    lastThisRef.current = undefined;
                }
            }, delay - (now - lastExecutionTimeRef.current));
        }
    }, [delay]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [throttledCallback]);

    return throttledCallback as T;
}
```