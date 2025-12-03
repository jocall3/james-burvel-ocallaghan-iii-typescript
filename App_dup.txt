// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import React, { Suspense, useCallback, useState, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LeftSidebar } from './components/LeftSidebar';
import { CommandPalette } from './components/CommandPalette';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { DesktopView } from './components/desktop/DesktopView';
import { Alchemist } from './alchemy/alchemist/compiler';
import exampleTsal from './alchemy/example.tsal?raw';
import { ActionManager } from './components/ActionManager';

// --- NEW TYPES AND INTERFACES ---
/**
 * @interface ExportedCommand
 * @description Represents a command that can be registered with the CommandRegistry.
 * This structure allows commands to be easily discovered, filtered, and executed.
 */
export interface ExportedCommand {
  id: string;
  name: string;
  description: string;
  icon?: string; // Optional icon identifier (e.g., 'terminal', 'bug', 'settings')
  handler: (args?: any) => void; // The function to execute when the command is called
  keywords?: string[]; // Additional terms for searching/filtering
  category?: string; // Grouping commands (e.g., 'System', 'Navigation', 'Tools')
  scope?: 'global' | 'contextual'; // Indicates if the command is always available or context-specific
  shortcut?: string; // Human-readable keyboard shortcut for documentation
}

/**
 * @interface Notification
 * @description Represents a transient notification message displayed to the user.
 * Notifications can have different types (info, success, warning, error) and optional actions.
 */
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // Milliseconds until auto-dismissed (0 for persistent), default 5000
  action?: { // Optional action button within the notification
    label: string;
    handler: () => void;
  };
}

/**
 * @interface WasmModule
 * @description Stores information about a compiled WebAssembly module, including its instance and exports.
 * This allows the application to interact with compiled Alchemist code.
 */
export interface WasmModule {
  id: string;
  name: string;
  instance: WebAssembly.Instance;
  exports: WebAssembly.Exports;
  sourceCode?: string; // The original Alchemist source for debugging or re-editing
}

// --- NEW SERVICE CLASSES (exported) ---

/**
 * @class CommandRegistry
 * @description Manages a central collection of application commands.
 * Components can register commands, and the Command Palette or other interfaces can discover and execute them.
 */
export class CommandRegistry {
  private commands: Map<string, ExportedCommand> = new Map();
  private listeners: Set<(commands: ExportedCommand[]) => void> = new Set(); // For reactive updates

  constructor() {
    console.log("[Service] CommandRegistry initialized.");
  }

  /**
   * Adds a listener for command registry updates.
   * @param listener The callback function to be called when commands change.
   * @returns An unsubscribe function.
   */
  public addListener(listener: (commands: ExportedCommand[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getAllCommands()); // Immediately notify with current state
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getAllCommands()));
  }

  /**
   * Registers a new command with the registry.
   * If a command with the same ID already exists, it will be overwritten.
   * @param command The command object to register.
   */
  public registerCommand(command: ExportedCommand): void {
    if (this.commands.has(command.id)) {
      console.warn(`Command with ID '${command.id}' already registered. Overwriting.`);
    }
    this.commands.set(command.id, command);
    this.notifyListeners();
    console.log(`[CommandRegistry] Command '${command.name}' (${command.id}) registered.`);
  }

  /**
   * Unregisters a command by its ID.
   * @param commandId The ID of the command to unregister.
   * @returns True if the command was unregistered, false otherwise.
   */
  public unregisterCommand(commandId: string): boolean {
    const wasDeleted = this.commands.delete(commandId);
    if (wasDeleted) {
      this.notifyListeners();
      console.log(`[CommandRegistry] Command '${commandId}' unregistered.`);
    }
    return wasDeleted;
  }

  /**
   * Retrieves a command by its ID.
   * @param commandId The ID of the command to retrieve.
   * @returns The command object, or undefined if not found.
   */
  public getCommand(commandId: string): ExportedCommand | undefined {
    return this.commands.get(commandId);
  }

  /**
   * Returns all registered commands.
   * @returns An array of all registered command objects.
   */
  public getAllCommands(): ExportedCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Executes a command by its ID.
   * Includes error handling and console logging for execution.
   * @param commandId The ID of the command to execute.
   * @param args Optional arguments to pass to the command handler.
   * @returns True if the command was executed, false if not found or an error occurred.
   */
  public executeCommand(commandId: string, args?: any): boolean {
    const command = this.commands.get(commandId);
    if (command) {
      console.log(`[CommandRegistry] Executing command: ${command.name} (${command.id}) with args:`, args);
      try {
        command.handler(args);
        return true;
      } catch (error) {
        console.error(`[CommandRegistry] Error executing command '${command.id}':`, error);
        return false;
      }
    }
    console.warn(`[CommandRegistry] Command with ID '${commandId}' not found.`);
    return false;
  }
}


/**
 * @class NotificationManager
 * @description Manages the lifecycle and display of application notifications.
 * It provides methods to show, remove, and listen for notification updates.
 */
export class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private nextId: number = 0;

  constructor() {
    console.log("[Service] NotificationManager initialized.");
  }

  /**
   * Adds a listener for notification updates.
   * @param listener The callback function to be called when notifications change.
   * @returns An unsubscribe function.
   */
  public addListener(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getNotifications()); // Immediately notify with current state
    return () => this.listeners.delete(listener); // Return an unsubscribe function
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getNotifications()));
  }

  /**
   * Displays a new notification to the user.
   * @param message The main message content of the notification.
   * @param type The type of notification (info, success, warning, error).
   * @param duration How long the notification should be displayed in milliseconds (0 for persistent).
   * @param action Optional action button to include in the notification.
   * @returns The unique ID of the created notification.
   */
  public showNotification(message: string, type: Notification['type'] = 'info', duration: number = 5000, action?: Notification['action']): string {
    const id = `notification-${this.nextId++}`;
    const newNotification: Notification = { id, message, type, duration, action };
    this.notifications.push(newNotification);
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => this.removeNotification(id), duration);
    }
    console.log(`[NotificationManager] Showing ${type} notification: "${message}"`);
    return id;
  }

  /**
   * Removes a notification by its ID.
   * @param id The ID of the notification to remove.
   * @returns True if the notification was removed, false otherwise.
   */
  public removeNotification(id: string): boolean {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.id !== id);
    if (this.notifications.length < initialLength) {
      this.notifyListeners();
      console.log(`[NotificationManager] Notification '${id}' removed.`);
      return true;
    }
    return false;
  }

  /**
   * Retrieves all currently active notifications.
   * @returns An array of current notifications.
   */
  public getNotifications(): Notification[] {
    return [...this.notifications]; // Return a shallow copy to prevent external modification
  }
}

/**
 * @class TelemetryService
 * @description A simulated telemetry service for logging application events and user interactions.
 * In a production application, this would send data to an analytics backend (e.g., Google Analytics, custom API).
 * For this demo, all data is logged to the console.
 */
export class TelemetryService {
  constructor() {
    console.log("[Service] TelemetryService initialized. (Logging to console)");
  }

  /**
   * Logs a generic event, useful for tracking custom metrics or actions.
   * @param eventName The name of the event (e.g., 'app_startup', 'api_call').
   * @param data Optional payload for the event, containing relevant context.
   */
  public logEvent(eventName: string, data?: object): void {
    console.groupCollapsed(`[TELEMETRY] Event: ${eventName}`);
    console.log('Timestamp:', new Date().toISOString());
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }

  /**
   * Tracks a user's navigation to a particular view or screen.
   * @param screenName The name of the screen or view being tracked.
   * @param path Optional URL path or route associated with the screen.
   */
  public trackPageView(screenName: string, path?: string): void {
    this.logEvent('page_view', { screenName, path });
  }

  /**
   * Logs an action taken by the user, such as a button click or feature activation.
   * @param actionName The name of the action (e.g., 'button_click', 'feature_launched').
   * @param component The component or context where the action occurred.
   * @param data Optional additional data relevant to the action.
   */
  public trackUserAction(actionName: string, component: string, data?: object): void {
    this.logEvent('user_action', { actionName, component, ...data });
  }

  /**
   * Logs an error that occurred within the application.
   * This helps in identifying and debugging issues in a production environment.
   * @param error The error object itself.
   * @param context The specific context where the error occurred (e.g., 'ComponentA.render', 'apiService.fetchData').
   * @param fatal Indicates whether the error is critical and may lead to application failure.
   */
  public logError(error: Error, context: string, fatal: boolean = false): void {
    console.groupCollapsed(`[TELEMETRY] Error: ${error.name} in ${context} (Fatal: ${fatal})`);
    console.error(error);
    if (error.stack) {
      console.log('Stack:', error.stack);
    }
    console.groupEnd();
    this.logEvent('app_error', {
      message: error.message,
      name: error.name,
      context,
      fatal,
      stack: error.stack,
    });
  }
}

/**
 * @class SystemMonitorService
 * @description Provides simulated system resource monitoring capabilities.
 * It periodically updates and broadcasts synthetic CPU, memory, and network statistics.
 * In a real application, this would typically integrate with actual browser APIs or a backend service.
 */
export class SystemMonitorService {
  private cpuUsage: number = Math.random() * 10 + 5; // Initial: 5-15%
  private memoryUsage: number = Math.random() * 200 + 500; // Initial: 500-700MB
  private networkStatus: 'online' | 'offline' = navigator.onLine ? 'online' : 'offline';
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(stats: { cpu: number; memory: number; network: 'online' | 'offline' }) => void> = new Set();

  constructor() {
    console.log("[Service] SystemMonitorService initialized.");
    this.startMonitoring();
    // Listen for actual browser network events
    window.addEventListener('online', this.handleNetworkChange);
    window.addEventListener('offline', this.handleNetworkChange);
  }

  private handleNetworkChange = () => {
    this.networkStatus = navigator.onLine ? 'online' : 'offline';
    this.notifyListeners();
  };

  private simulateUpdates = () => {
    // Simulate slight fluctuations for CPU and Memory
    this.cpuUsage = Math.max(0, Math.min(100, this.cpuUsage + (Math.random() - 0.5) * 5)); // +/- 2.5%
    this.memoryUsage = Math.max(100, Math.min(2000, this.memoryUsage + (Math.random() - 0.5) * 50)); // +/- 25MB
    this.notifyListeners();
  };

  private startMonitoring(): void {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(this.simulateUpdates, 3000); // Update every 3 seconds
    }
  }

  /**
   * Stops the simulated monitoring updates and removes network event listeners.
   */
  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    window.removeEventListener('online', this.handleNetworkChange);
    window.removeEventListener('offline', this.handleNetworkChange);
    console.log("[Service] SystemMonitorService stopped monitoring.");
  }

  /**
   * Adds a listener for system statistics updates.
   * The listener will be called immediately with current stats and then on every subsequent update.
   * @param listener The callback function to be called when stats change.
   * @returns An unsubscribe function that removes the listener.
   */
  public addListener(listener: (stats: { cpu: number; memory: number; network: 'online' | 'offline' }) => void): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentStats()); // Notify immediately with current state
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const currentStats = this.getCurrentStats();
    this.listeners.forEach(listener => listener(currentStats));
  }

  /**
   * Gets the current simulated system statistics.
   * @returns An object containing CPU usage (%), memory usage (MB), and network status.
   */
  public getCurrentStats(): { cpu: number; memory: number; network: 'online' | 'offline' } {
    return {
      cpu: parseFloat(this.cpuUsage.toFixed(1)),
      memory: parseFloat(this.memoryUsage.toFixed(1)),
      network: this.networkStatus,
    };
  }
}

/**
 * @class AlchemyService
 * @description Encapsulates the Alchemist WASM compilation and execution logic.
 * It acts as an interface for loading, compiling, storing, and executing WebAssembly modules.
 * Integrates with NotificationManager and TelemetryService for user feedback and logging.
 */
export class AlchemyService {
  private alchemist: Alchemist;
  private compiledModules: Map<string, WasmModule> = new Map();
  private notificationManager: NotificationManager;
  private telemetryService: TelemetryService;

  constructor(notificationManager: NotificationManager, telemetryService: TelemetryService) {
    this.alchemist = new Alchemist();
    this.notificationManager = notificationManager;
    this.telemetryService = telemetryService;
    console.log("[Service] AlchemyService initialized.");
  }

  /**
   * Compiles Alchemist source code into a WebAssembly module and stores it in the service's registry.
   * Provides notifications for compilation status and logs telemetry data.
   * @param id A unique identifier for the module (e.g., 'my-calculator-module').
   * @param sourceCode The Alchemist source code string.
   * @param name A human-readable name for the module, used in notifications.
   * @returns A Promise that resolves with the compiled WasmModule.
   */
  public async compileAndStore(id: string, sourceCode: string, name: string = `Module-${id}`): Promise<WasmModule> {
    this.telemetryService.trackUserAction('compile_wasm', 'AlchemyService', { moduleId: id, moduleName: name });
    this.notificationManager.showNotification(`Compiling module '${name}'...`, 'info', 3000);

    try {
      console.log(`[AlchemyService] Compiling Alchemist module '${name}' (ID: ${id})...`);
      const compilationResult = await this.alchemist.compile(sourceCode);
      const wasmModule: WasmModule = {
        id,
        name,
        instance: compilationResult.instance,
        exports: compilationResult.instance.exports,
        sourceCode,
      };
      this.compiledModules.set(id, wasmModule);
      this.notificationManager.showNotification(`Module '${name}' compiled successfully!`, 'success');
      this.telemetryService.logEvent('wasm_compile_success', { moduleId: id, moduleName: name });
      return wasmModule;
    } catch (error) {
      console.error(`[AlchemyService] Error compiling Alchemist module '${name}' (ID: ${id}):`, error);
      this.notificationManager.showNotification(`Failed to compile module '${name}'. See console for details.`, 'error', 0, {
        label: 'View Error',
        handler: () => console.error(error)
      });
      this.telemetryService.logError(error as Error, 'AlchemyService.compileAndStore', false);
      throw error;
    }
  }

  /**
   * Retrieves a compiled WasmModule by its ID.
   * @param id The unique identifier of the module.
   * @returns The WasmModule object, or undefined if not found.
   */
  public getModule(id: string): WasmModule | undefined {
    return this.compiledModules.get(id);
  }

  /**
   * Returns all currently loaded and compiled WasmModules.
   * @returns An array of WasmModule objects.
   */
  public getAllModules(): WasmModule[] {
    return Array.from(this.compiledModules.values());
  }

  /**
   * Executes a specific function from a compiled WASM module's exports.
   * Includes robust error handling and telemetry logging.
   * @param moduleId The ID of the WASM module.
   * @param functionName The name of the function to execute within the module's exports.
   * @param args Arguments to pass to the WASM function.
   * @returns The result of the WASM function execution.
   * @throws Error if the module or function is not found, or if execution fails.
   */
  public executeWasmFunction<T = any>(moduleId: string, functionName: string, ...args: any[]): T {
    const module = this.getModule(moduleId);
    if (!module) {
      const error = new Error(`WASM module with ID '${moduleId}' not found.`);
      this.notificationManager.showNotification(error.message, 'error');
      this.telemetryService.logError(error, 'AlchemyService.executeWasmFunction', false);
      throw error;
    }

    const func = module.exports[functionName] as (...args: any[]) => T;
    if (typeof func !== 'function') {
      const error = new Error(`Function '${functionName}' not found or not callable in module '${module.name}'.`);
      this.notificationManager.showNotification(error.message, 'error');
      this.telemetryService.logError(error, 'AlchemyService.executeWasmFunction', false);
      throw error;
    }

    this.telemetryService.trackUserAction('execute_wasm_function', 'AlchemyService', {
      moduleId,
      functionName,
      args: JSON.stringify(args)
    });
    console.log(`[AlchemyService] Executing WASM function '${functionName}' from module '${module.name}'...`);
    try {
      const result = func(...args);
      this.telemetryService.logEvent('wasm_function_executed', { moduleId, functionName, result });
      return result;
    } catch (error) {
      console.error(`[AlchemyService] Error during WASM function execution '${functionName}' in module '${module.name}':`, error);
      this.notificationManager.showNotification(`Error executing '${functionName}' in module '${module.name}'.`, 'error', 0, {
        label: 'View Error',
        handler: () => console.error(error)
      });
      this.telemetryService.logError(error as Error, `AlchemyService.executeWasmFunction:${functionName}`, false);
      throw error;
    }
  }
}

// --- NEW REACT COMPONENTS (exported) ---

/**
 * @const NotificationCenter
 * @description A React component responsible for displaying a list of active notifications.
 * It subscribes to the `NotificationManager` to reactively update its displayed notifications.
 */
export const NotificationCenter: React.FC<{ notificationManager: NotificationManager }> = ({ notificationManager }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to notification updates when component mounts
    const unsubscribe = notificationManager.addListener(setNotifications);
    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, [notificationManager]); // Re-run effect if notificationManager instance changes

  if (notifications.length === 0) return null; // Render nothing if no notifications are active

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-80 sm:w-96">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`relative p-3 pr-8 rounded-lg shadow-lg w-full transition-all duration-300 transform translate-x-0 opacity-100 flex flex-col
                      ${notification.type === 'info' ? 'bg-blue-600' : ''}
                      ${notification.type === 'success' ? 'bg-green-600' : ''}
                      ${notification.type === 'warning' ? 'bg-yellow-500 text-black' : ''}
                      ${notification.type === 'error' ? 'bg-red-600' : ''}
                      text-white pointer-events-auto`}
          role="alert" // ARIA role for accessibility
          aria-live="polite" // Announce changes to screen readers
        >
          <p className="text-sm font-medium pr-4">{notification.message}</p>
          {notification.action && (
            <button
              onClick={() => {
                notification.action?.handler(); // Execute the action handler
                notificationManager.removeNotification(notification.id); // Dismiss notification after action
              }}
              className="mt-2 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 self-start"
            >
              {notification.action.label}
            </button>
          )}
          <button
            onClick={() => notificationManager.removeNotification(notification.id)}
            className="absolute top-1 right-1 text-white opacity-70 hover:opacity-100 text-lg leading-none focus:outline-none"
            aria-label="Close notification"
            title="Dismiss notification"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};


/**
 * @const ThemeSwitcher
 * @description A React component that provides a user interface to toggle between light and dark themes.
 * It displays a sun or moon icon corresponding to the active theme.
 */
export const ThemeSwitcher: React.FC<{ currentTheme: 'light' | 'dark'; onToggle: () => void }> = ({ currentTheme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-md bg-transparent hover:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {currentTheme === 'dark' ? (
        // Sun icon for light mode (when current theme is dark, suggesting a switch to light)
        <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.275l.707-.707M6.07 18.07l-.707.707M18.07 18.07l.707.707M6.07 6.07l-.707-.707M12 18a6 6 0 110-12 6 6 0 010 12z"></path></svg>
      ) : (
        // Moon icon for dark mode (when current theme is light, suggesting a switch to dark)
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
      )}
    </button>
  );
};

/**
 * @const SystemStatusWidget
 * @description Displays simulated system performance metrics such as CPU usage, memory usage, and network status.
 * It subscribes to the `SystemMonitorService` for real-time (simulated) updates.
 */
export const SystemStatusWidget: React.FC<{ systemMonitorService: SystemMonitorService }> = ({ systemMonitorService }) => {
  const [stats, setStats] = useState({ cpu: 0, memory: 0, network: 'online' as 'online' | 'offline' });

  useEffect(() => {
    // Subscribe to system stats updates when component mounts
    const unsubscribe = systemMonitorService.addListener(setStats);
    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, [systemMonitorService]); // Re-run effect if systemMonitorService instance changes

  // Helper to determine network status color
  const getNetworkColor = (status: 'online' | 'offline') => {
    return status === 'online' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="flex items-center text-xs text-gray-400 dark:text-gray-300 gap-3">
      <div className="flex items-center" title="CPU Usage">
        <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-1-3m-6.25-16l-.25-1h10l-.25 1M6.75 4L7 3h10l.25 1M4 14l-.25-1h16l-.25 1"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a4 4 0 100-8 4 4 0 000 8z"></path></svg>
        <span>{stats.cpu.toFixed(1)}%</span>
      </div>
      <div className="flex items-center" title="Memory Usage">
        <svg className="w-4 h-4 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg> {/* Simpler RAM icon */}
        <span>{stats.memory.toFixed(1)} MB</span>
      </div>
      <div className="flex items-center" title="Network Status">
        <svg className={`w-4 h-4 mr-1 ${getNetworkColor(stats.network)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          {stats.network === 'online' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.828a4 4 0 010-5.656m6.364 0a4 4 0 010 5.656M12 12h.01"></path>
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path> // 'X' icon for offline
          )}
        </svg>
        <span className={getNetworkColor(stats.network)}>{stats.network}</span>
      </div>
    </div>
  );
};


// --- App Component ---
/**
 * @const App
 * @description The main application component that orchestrates all services and UI elements.
 * It initializes core services (CommandRegistry, NotificationManager, TelemetryService, SystemMonitorService, AlchemyService),
 * manages global UI states (command palette, voice commander, theme), and renders the primary application layout.
 */
export const App: React.FC = () => {
  const {
    isVoiceCommanderOpen,
    launchRequest,
    consumeLaunchRequest,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    updateWindow,
    windows,
    setVoiceCommanderOpen
  } = useAppStore();

  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => {
    // Initialize theme from localStorage or default to dark
    return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark';
  });

  // Instantiate services - these are designed as singletons for the App lifecycle
  // Using useState with a lazy initializer ensures they are only created once.
  const commandRegistry = useState(() => new CommandRegistry())[0];
  const notificationManager = useState(() => new NotificationManager())[0];
  const telemetryService = useState(() => new TelemetryService())[0];
  const systemMonitorService = useState(() => new SystemMonitorService())[0];
  const alchemyService = useState(() => new AlchemyService(notificationManager, telemetryService))[0];

  // Effect to apply theme class to the document root and update localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    document.documentElement.style.colorScheme = currentTheme; // Hint for browser UI (e.g., scrollbars)
    localStorage.setItem('app-theme', currentTheme); // Persist theme setting
    telemetryService.trackPageView('App', '/'); // Track initial app load
  }, [currentTheme, telemetryService]);

  // Callback to toggle the application theme
  const toggleTheme = useCallback(() => {
    setCurrentTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      telemetryService.trackUserAction('toggle_theme', 'App', { theme: newTheme });
      return newTheme;
    });
  }, [telemetryService]); // Dependency on telemetryService

  // Alchemist Proof-of-Concept enhanced to use AlchemyService for better management and notifications
  useEffect(() => {
    const runAlchemyProofOfConcept = async () => {
      telemetryService.logEvent('alchemy_poc_start', {});
      console.log("ðŸ”¥ Initializing Alchemist Engine via AlchemyService...");
      try {
        // Compile and store the example TSAL module using the new service
        const module = await alchemyService.compileAndStore("example-tsal-module", exampleTsal, "Example Tsal Module");

        const add = module.exports.add as (a: number, b: number) => number;
        if (typeof add !== 'function') {
          throw new Error("Exported 'add' function not found in Wasm module after compilation.");
        }

        const result = add(40, 2);
        console.log(`ðŸš€ Wasm execution result: add(40, 2) = ${result}`);
        if (result !== 42) {
          notificationManager.showNotification("VALIDATION FAILED! Alchemist test returned incorrect result.", 'error', 0);
          console.error("VALIDATION FAILED! The universe is broken.");
          telemetryService.logError(new Error("Alchemy PoC validation failed"), 'App.runAlchemyProofOfConcept', true);
        } else {
          notificationManager.showNotification("Alchemist PoC: Billion-dollar code confirmed. The machine is alive.", 'success');
          console.log("âœ¨ Billion-dollar code confirmed. The machine is alive.");
          telemetryService.logEvent('alchemy_poc_success', { result });
        }
      } catch (error) {
        notificationManager.showNotification(`Alchemy Engine Proof-of-Concept FAILED.`, 'error', 0, {
          label: 'View Error',
          handler: () => console.error(error)
        });
        console.error("â˜ ï¸  Alchemy Engine Proof-of-Concept FAILED:", error);
        telemetryService.logError(error as Error, 'App.runAlchemyProofOfConcept', true);
      }
    };
    runAlchemyProofOfConcept();
  }, [alchemyService, notificationManager, telemetryService]); // Dependencies for the Alchemist PoC

  // Callback to launch new features/windows
  const handleLaunchFeature = useCallback((featureId: string, props?: any) => {
    telemetryService.trackUserAction('launch_feature', 'App', { featureId, props: JSON.stringify(props) });
    openWindow(featureId, props); // Utilize useAppStore's openWindow
    setCommandPaletteOpen(false); // Close command palette after launching a feature
  }, [openWindow, telemetryService]);

  // Register core application commands with the CommandRegistry
  useEffect(() => {
    // A local variable to store commands for easy unregistration
    const registeredCommands: string[] = [];

    const registerAndTrack = (command: ExportedCommand) => {
      commandRegistry.registerCommand(command);
      registeredCommands.push(command.id);
    };

    registerAndTrack({
      id: 'open_command_palette',
      name: 'Open Command Palette',
      description: 'Access all commands and features',
      icon: 'command',
      handler: () => setCommandPaletteOpen(true),
      shortcut: 'Cmd+K / Ctrl+K',
      category: 'System'
    });
    registerAndTrack({
      id: 'toggle_voice_commander',
      name: 'Toggle Voice Commander',
      description: 'Activate or deactivate voice command mode',
      icon: 'microphone',
      handler: () => setVoiceCommanderOpen(prev => !prev),
      shortcut: 'Alt+V',
      category: 'System'
    });
    registerAndTrack({
      id: 'toggle_theme',
      name: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      icon: currentTheme === 'dark' ? 'sun' : 'moon',
      handler: toggleTheme,
      category: 'Settings'
    });
    registerAndTrack({
      id: 'show_notification_success',
      name: 'Show Success Notification',
      description: 'Trigger a sample success notification',
      icon: 'check',
      handler: () => notificationManager.showNotification('This is a sample success message!', 'success'),
      category: 'Developer Tools'
    });
    registerAndTrack({
      id: 'show_notification_error',
      name: 'Show Error Notification',
      description: 'Trigger a sample error notification',
      icon: 'alert',
      handler: () => notificationManager.showNotification('This is a sample error message!', 'error', 0, {
        label: 'Retry Action',
        handler: () => notificationManager.showNotification('Attempting retry...', 'info', 2000)
      }),
      category: 'Developer Tools'
    });
    registerAndTrack({
      id: 'run_example_wasm_add',
      name: 'Run Example WASM Add Function',
      description: 'Execute the `add` function from the compiled example Alchemist module (40 + 2).',
      icon: 'calculator',
      handler: () => {
        try {
          const result = alchemyService.executeWasmFunction('example-tsal-module', 'add', 40, 2);
          notificationManager.showNotification(`WASM add(40,2) result: ${result}`, 'info');
          console.log('WASM add(40,2) result:', result);
        } catch (e) {
          notificationManager.showNotification(`Failed to execute WASM function.`, 'error', 0, {
            label: 'View Error',
            handler: () => console.error('Error running example WASM add:', e)
          });
        }
      },
      category: 'Alchemy'
    });
    registerAndTrack({
      id: 'list_wasm_modules',
      name: 'List Loaded WASM Modules',
      description: 'Display currently loaded WebAssembly modules.',
      icon: 'code',
      handler: () => {
        const modules = alchemyService.getAllModules();
        if (modules.length > 0) {
          notificationManager.showNotification(`Loaded WASM Modules: ${modules.map(m => m.name).join(', ')}`, 'info', 7000);
          console.log('Loaded WASM Modules:', modules);
        } else {
          notificationManager.showNotification('No WASM modules currently loaded.', 'info', 3000);
        }
      },
      category: 'Alchemy'
    });
    registerAndTrack({
      id: 'view_system_status',
      name: 'View System Status',
      description: 'Display current CPU, Memory, and Network status in console.',
      icon: 'activity',
      handler: () => {
        const stats = systemMonitorService.getCurrentStats();
        notificationManager.showNotification(`System: CPU ${stats.cpu}%, Mem ${stats.memory}MB, Net ${stats.network}`, 'info', 5000);
        console.log('Current System Status:', stats);
      },
      category: 'System'
    });

    // Cleanup function: Unregister all commands when the component unmounts
    return () => {
      registeredCommands.forEach(id => commandRegistry.unregisterCommand(id));
      console.log("[CommandRegistry] All core commands unregistered.");
    };
  }, [commandRegistry, setVoiceCommanderOpen, toggleTheme, notificationManager, alchemyService, systemMonitorService, currentTheme]);

  // Effect to handle launch requests from the global store
  useEffect(() => {
    if (launchRequest) {
      handleLaunchFeature(launchRequest.featureId, launchRequest.props);
      consumeLaunchRequest(); // Clear the request after handling
    }
  }, [launchRequest, consumeLaunchRequest, handleLaunchFeature]);

  // Effect to handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // Prevent browser shortcuts
        setCommandPaletteOpen(k => !k);
        telemetryService.trackUserAction('shortcut_command_palette', 'App');
      }
      if (e.key.toLowerCase() === 'v' && e.altKey) {
        e.preventDefault(); // Prevent browser shortcuts
        setVoiceCommanderOpen(true);
        telemetryService.trackUserAction('shortcut_voice_commander', 'App');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setVoiceCommanderOpen, telemetryService]); // Dependencies for keyboard shortcuts

  // Cleanup: Stop SystemMonitorService when App component unmounts
  useEffect(() => {
    return () => {
      systemMonitorService.stopMonitoring();
    };
  }, [systemMonitorService]);

  return (
    <ErrorBoundary>
      {/* The main application container, applying theme classes */}
      <div className={`w-screen h-screen bg-background text-text-primary flex font-sans antialiased overflow-hidden ${currentTheme}`}>
        <LeftSidebar onLaunchFeature={handleLaunchFeature} />
        <main className="flex-1 relative">
          <DesktopView
            windows={Object.values(windows)}
            onLaunch={handleLaunchFeature}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={focusWindow}
            onUpdate={updateWindow}
          />
          <ActionManager />
          {/* Bottom right utility bar for system status and theme switch */}
          <div className="absolute bottom-0 right-0 p-4 flex items-center gap-4 z-40 bg-background-light bg-opacity-70 backdrop-blur-sm rounded-tl-lg shadow-lg">
            <SystemStatusWidget systemMonitorService={systemMonitorService} />
            <ThemeSwitcher currentTheme={currentTheme} onToggle={toggleTheme} />
          </div>
        </main>
        {/* Command Palette, now integrated with CommandRegistry */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onSelect={handleLaunchFeature} // Original feature launch capability
          commands={commandRegistry.getAllCommands()} // Provide all registered commands
          onExecuteCommand={(id, args) => { // Allow palette to execute commands directly
            commandRegistry.executeCommand(id, args);
            setCommandPaletteOpen(false); // Close palette after command execution
          }}
        />
        <VoiceCommandModal isOpen={isVoiceCommanderOpen} />
        <NotificationCenter notificationManager={notificationManager} /> {/* Global notification display */}
      </div>
    </ErrorBoundary>
  );
};
