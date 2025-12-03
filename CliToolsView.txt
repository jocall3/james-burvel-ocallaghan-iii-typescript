import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- Global Context for CLI State (Simulated) ---
export interface CliContextType {
    executeCommand: (command: string) => Promise<CliCommandOutput>;
    history: CliCommand[];
    addCommandToHistory: (command: CliCommand) => void;
    currentWorkingDirectory: string;
    changeDirectory: (path: string) => void;
    notifications: CliNotification[];
    addNotification: (notification: Omit<CliNotification, 'id' | 'timestamp' | 'isRead'>) => void;
    markNotificationAsRead: (id: string) => void;
    unreadNotificationCount: number;
}

const CliContext = createContext<CliContextType | undefined>(undefined);

export const useCli = () => {
    const context = useContext(CliContext);
    if (context === undefined) {
        throw new Error('useCli must be used within a CliProvider');
    }
    return context;
};

// --- Data Models & Types ---

// 1. Core CLI entities
export interface CliCommand {
    id: string;
    command: string;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
    output: string;
    durationMs: number;
    error?: string;
    contextPath?: string; // e.g., current working directory
    isAiGenerated?: boolean;
}

export interface CliCommandOutput {
    raw: string;
    parsed?: any; // JSON, table, etc.
    type: 'text' | 'json' | 'table' | 'error' | 'markdown' | 'chart' | 'clear';
    summary?: string;
    details?: string;
}

export interface CliScript {
    id: string;
    name: string;
    description: string;
    scriptContent: string; // The series of commands
    createdAt: string;
    updatedAt: string;
    tags: string[];
    author: string;
    isPublic: boolean;
    lastRun?: string;
    runCount: number;
    version: number;
}

export interface CliJob {
    id: string;
    scriptId: string;
    schedule: string; // e.g., "cron:0 0 * * *" or "once:YYYY-MM-DDTHH:MM:SS"
    status: 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
    lastRunAt?: string;
    nextRunAt?: string;
    logs: string[];
    createdAt: string;
    createdBy: string;
    repeatCount?: number;
    maxRetries: number;
    retryCount: number;
    description?: string;
    notificationEmails?: string[];
}

export interface CliPlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    commands: string[]; // List of commands this plugin adds
    isActive: boolean;
    installationDate: string;
    settingsSchema: any; // JSON schema for plugin settings
    author: string;
    repoUrl?: string;
    documentationLink?: string;
}

// 2. AI related entities
export interface AiChatInteraction {
    id: string;
    timestamp: string;
    role: 'user' | 'assistant';
    content: string;
    commandGenerated?: string;
    followUpSuggestions?: string[];
}

export interface AiCommandSuggestion {
    command: string;
    confidence: number;
    explanation: string;
    parameters: { name: string, description: string, required: boolean }[];
}

export interface AiModelConfig {
    id: string;
    name: string;
    provider: string; // e.g., 'google', 'openai'
    modelId: string; // e.g., 'gemini-pro', 'gpt-4'
    description: string;
    isActive: boolean;
    costPerToken?: number;
}

// 3. System and Monitoring
export interface CliResourceMetric {
    timestamp: string;
    metricType: 'api_calls' | 'db_queries' | 'cpu_usage' | 'memory_usage' | 'network_io';
    value: number;
    unit: string;
    context: string; // e.g., "demobank payments list"
    tags?: string[];
}

export interface CliAuditLog {
    id: string;
    timestamp: string;
    userId: string;
    action: string; // e.g., "EXECUTE_COMMAND", "SAVE_SCRIPT", "SCHEDULE_JOB"
    targetId?: string; // e.g., command ID, script ID
    details: string;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    error?: string;
    category: 'security' | 'operation' | 'configuration' | 'system';
}

export interface CliNotification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
    relatedJobId?: string;
    relatedCommandId?: string;
}

// 4. Component specific types
interface TerminalInputProps {
    onExecute: (command: string) => void;
    isLoading: boolean;
    commandHistory: string[];
    currentWorkingDirectory: string;
    autocompleteSuggestions: string[];
}

interface TerminalOutputProps {
    output: CliCommandOutput[];
    theme: string; // For dynamic styling based on theme
}

export interface CliSettingsData {
    aiModel: string;
    terminalTheme: 'dark' | 'light' | 'solarized-dark' | 'monokai';
    historyLimit: number;
    enableAutocomplete: boolean;
    notificationLevel: 'none' | 'info' | 'warning' | 'error';
    preferredOutputFormat: 'text' | 'json' | 'table';
    autoSaveScripts: boolean;
    defaultScriptTags: string[];
}

// --- Utility Functions (Embedded for line count) ---

/**
 * Generates a unique ID.
 * @returns A unique string.
 */
export const generateUniqueId = (prefix: string = 'id_'): string => `${prefix}${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

/**
 * Debounces a function call.
 * @param func The function to debounce.
 * @param delay The delay in milliseconds.
 * @returns A debounced version of the function.
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
        return new Promise(resolve => {
            clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), delay);
        });
    };
};

/**
 * Throttle a function call.
 * @param func The function to throttle.
 * @param limit The time limit in milliseconds.
 * @returns A throttled version of the function.
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;
    return function (this: any, ...args: Parameters<T>) {
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
            lastResult = func.apply(this, args);
        }
        return lastResult;
    };
};

/**
 * Parses a CLI command string into components (command, subcommands, flags).
 * A more robust parser than the previous simple one.
 * @param commandString The full command string.
 * @returns An object containing parsed components.
 */
export const parseCliCommand = (commandString: string) => {
    const parts = commandString.trim().split(/(?<=^|\s)(?:(?:--?\w+(?:=\S+)?)|(?:'[^']*')|(?:"[^"]*")|(?:\S+))/g).filter(Boolean).map(p => p.trim());
    let command = '';
    const subcommands: string[] = [];
    const flags: { [key: string]: string | boolean } = {};
    const args: string[] = []; // positional arguments

    let isCommandPart = true;
    for (const part of parts) {
        if (part.startsWith('--')) {
            const [key, value] = part.substring(2).split('=');
            flags[key] = value !== undefined ? value : true;
            isCommandPart = false;
        } else if (part.startsWith('-')) { // single-dash short flags, assume no value unless next part isn't a flag
            const key = part.substring(1);
            flags[key] = true; // For now, assume boolean. In a full parser, would need to check definition.
            isCommandPart = false;
        } else if (isCommandPart) {
            if (!command) {
                command = part;
            } else {
                subcommands.push(part);
            }
        } else {
            // After flags, everything else is a positional argument
            args.push(part.replace(/^['"]|['"]$/g, '')); // Remove quotes from arguments
        }
    }

    return { command, subcommands, flags, args };
};

/**
 * Formats JSON output for display.
 * @param json The JSON object.
 * @param indent The indentation level.
 * @returns A formatted JSON string.
 */
export const formatJson = (json: any, indent: number = 2): string => {
    try {
        return JSON.stringify(json, null, indent);
    } catch (e) {
        return String(json);
    }
};

/**
 * Simple syntax highlighter for CLI commands.
 * Extended for more keywords and better flag detection.
 * @param text The command text.
 * @returns React nodes with styled spans.
 */
export const highlightCliSyntax = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const keywords = ['demobank', 'payments', 'users', 'accounts', 'transactions', 'approve', 'list', 'create', 'update', 'delete', 'show', 'config', 'script', 'job', 'plugin', 'ai', 'audit', 'metrics', 'help', 'version', 'run', 'save', 'schedule', 'get', 'set', 'install', 'activate', 'deactivate'];
    const flagRegex = /(--?\w+)(?:=(?:(?:\"[^\"]*\")|(?:\'[^\']*\')|(?:\S+)))?/g; // Matches --flag=value or -f=value or --flag or -f
    const stringLiteralRegex = /"(.*?)"|'(.*?)'/g; // Matches "string" or 'string'

    let lastIndex = 0;
    const tokens: { value: string, type: 'keyword' | 'flag' | 'flag-value' | 'string' | 'text', index: number }[] = [];

    // Prioritize string literals
    let match;
    while ((match = stringLiteralRegex.exec(text)) !== null) {
        tokens.push({ value: match[0], type: 'string', index: match.index });
    }

    // Identify flags
    while ((match = flagRegex.exec(text)) !== null) {
        const fullMatch = match[0];
        const flagName = match[1];
        const flagValue = fullMatch.substring(flagName.length);
        tokens.push({ value: flagName, type: 'flag', index: match.index });
        if (flagValue) {
            tokens.push({ value: flagValue, type: 'flag-value', index: match.index + flagName.length });
        }
    }

    // Identify keywords
    const wordRegex = /\b\w+\b/g;
    while ((match = wordRegex.exec(text)) !== null) {
        if (keywords.includes(match[0])) {
            // Ensure this keyword isn't part of a flag or string already matched
            const isOverlap = tokens.some(token => token.index <= match.index && token.index + token.value.length > match.index);
            if (!isOverlap) {
                tokens.push({ value: match[0], type: 'keyword', index: match.index });
            }
        }
    }

    tokens.sort((a, b) => a.index - b.index);

    for (const token of tokens) {
        if (token.index > lastIndex) {
            parts.push(<span key={`text-${lastIndex}`} className="text-white">{text.substring(lastIndex, token.index)}</span>);
        }

        let className = 'text-white';
        if (token.type === 'keyword') className = 'text-purple-400 font-bold';
        else if (token.type === 'flag') className = 'text-blue-400';
        else if (token.type === 'flag-value') className = 'text-orange-400';
        else if (token.type === 'string') className = 'text-yellow-400';

        parts.push(<span key={`${token.type}-${token.index}`} className={className}>{token.value}</span>);
        lastIndex = token.index + token.value.length;
    }

    if (lastIndex < text.length) {
        parts.push(<span key={`text-${lastIndex}`} className="text-white">{text.substring(lastIndex)}</span>);
    }

    return parts;
};

/**
 * Simulates an API call to a backend service.
 * @param endpoint The API endpoint.
 * @param method The HTTP method.
 * @param body The request body.
 * @param delayMs Simulated network delay.
 * @returns A promise resolving to a simulated API response.
 */
const simulateApiCall = async (endpoint: string, method: string = 'GET', body?: any, delayMs: number = 300): Promise<any> => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`Simulating API call: ${method} ${endpoint}`, body);

            // Error scenarios
            if (endpoint.includes('/error')) {
                return resolve({ success: false, message: 'Simulated API error for requested endpoint.', status: 500 });
            }
            if (method === 'DELETE' && body?.id === 'non_existent') {
                return resolve({ success: false, message: 'Resource not found.', status: 404 });
            }

            // Authentication
            if (endpoint.includes('/auth/login')) {
                return resolve({ success: true, token: 'fake-jwt-token', user: { id: 'dev_user', name: 'Developer User', email: 'dev@demobank.com', role: 'admin' } });
            }

            // History
            if (endpoint.includes('/history')) {
                const dummyHistory: CliCommand[] = [
                    { id: generateUniqueId('h'), command: 'demobank payments list --status=pending', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'success', output: 'ID        AMOUNT\npo_001    100.00\npo_002    250.00', durationMs: 50, contextPath: '~' },
                    { id: generateUniqueId('h'), command: 'demobank payments approve po_001', timestamp: new Date(Date.now() - 1800000).toISOString(), status: 'success', output: '✓ Payment po_001 approved.', durationMs: 30, contextPath: '~' },
                    { id: generateUniqueId('h'), command: 'demobank users show dev_user', timestamp: new Date().toISOString(), status: 'success', output: formatJson({ id: 'dev_user', name: 'Developer User', email: 'dev@demobank.com', role: 'admin' }), durationMs: 70, contextPath: '~' },
                    { id: generateUniqueId('h'), command: 'demobank payments list --status=error', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'error', output: 'Error: Invalid status value \'error\'.', durationMs: 45, error: 'Invalid status value', contextPath: '~' },
                ];
                return resolve({ success: true, data: dummyHistory, total: dummyHistory.length });
            }

            // Scripts
            if (endpoint.includes('/scripts')) {
                const dummyScripts: CliScript[] = [
                    { id: 's1', name: 'Approve Small Payments', description: 'Approves all pending payments under $100.', scriptContent: 'demobank payments list --status=pending --amount-lte=100 --json | jq \'.[] | .id\' | xargs -I {} demobank payments approve {}', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString(), tags: ['payments', 'automation'], author: 'dev_user', isPublic: false, runCount: 5, version: 1 },
                    { id: 's2', name: 'Daily User Report', description: 'Generates a report of active users.', scriptContent: 'demobank users list --active --json > active_users.json', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString(), tags: ['users', 'reporting'], author: 'dev_user', isPublic: true, runCount: 12, version: 2 },
                ];
                if (method === 'POST') {
                    return resolve({ success: true, message: 'Script created.', data: { ...body, id: generateUniqueId('s') } });
                }
                if (method === 'PUT' && body?.id) {
                    return resolve({ success: true, message: 'Script updated.', data: body });
                }
                if (method === 'DELETE') {
                    return resolve({ success: true, message: 'Script deleted.' });
                }
                return resolve({ success: true, data: dummyScripts, total: dummyScripts.length });
            }

            // Jobs
            if (endpoint.includes('/jobs')) {
                const dummyJobs: CliJob[] = [
                    { id: 'j1', scriptId: 's1', schedule: 'cron:0 1 * * *', status: 'scheduled', lastRunAt: new Date(Date.now() - 3 * 3600000).toISOString(), nextRunAt: new Date(Date.now() + 21 * 3600000).toISOString(), logs: ['Job created', 'Script s1 triggered', 'Script s1 completed successfully'], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), createdBy: 'dev_user', maxRetries: 3, retryCount: 0, description: 'Automated daily payment approval' },
                ];
                if (method === 'POST') {
                    return resolve({ success: true, message: 'Job scheduled.', data: { ...body, id: generateUniqueId('j') } });
                }
                if (endpoint.includes('/cancel')) {
                    return resolve({ success: true, message: 'Job cancelled.' });
                }
                return resolve({ success: true, data: dummyJobs, total: dummyJobs.length });
            }

            // Plugins
            if (endpoint.includes('/plugins')) {
                const dummyPlugins: CliPlugin[] = [
                    { id: 'p1', name: 'Reporting Toolkit', version: '1.2.0', description: 'Adds advanced reporting commands.', commands: ['demobank report daily', 'demobank report monthly'], isActive: true, installationDate: new Date(Date.now() - 30 * 86400000).toISOString(), settingsSchema: { type: 'object', properties: { format: { type: 'string', enum: ['pdf', 'csv'] } } }, author: 'Demobank Devs' },
                    { id: 'p2', name: 'User Management Extension', version: '0.9.1', description: 'Experimental commands for user lifecycle management.', commands: ['demobank user suspend', 'demobank user reactivate'], isActive: false, installationDate: new Date(Date.now() - 10 * 86400000).toISOString(), settingsSchema: {}, author: 'Community' },
                ];
                if (method === 'POST') {
                    return resolve({ success: true, message: 'Plugin installed.', data: { ...body, id: generateUniqueId('p') } });
                }
                if (endpoint.includes('/toggle')) {
                    return resolve({ success: true, message: `Plugin status updated for ${body.isActive ? 'active' : 'inactive'}.` });
                }
                return resolve({ success: true, data: dummyPlugins, total: dummyPlugins.length });
            }

            // Audit Logs
            if (endpoint.includes('/audit')) {
                const dummyAuditLogs: CliAuditLog[] = [
                    { id: generateUniqueId('a'), timestamp: new Date(Date.now() - 10000).toISOString(), userId: 'dev_user', action: 'EXECUTE_COMMAND', targetId: 'h3', details: 'demobank users show dev_user', ipAddress: '127.0.0.1', userAgent: 'Chrome', success: true, category: 'operation' },
                    { id: generateUniqueId('a'), timestamp: new Date(Date.now() - 20000).toISOString(), userId: 'dev_user', action: 'SAVE_SCRIPT', targetId: 's1', details: 'Script "Approve Small Payments" created', ipAddress: '127.0.0.1', userAgent: 'Chrome', success: true, category: 'configuration' },
                    { id: generateUniqueId('a'), timestamp: new Date(Date.now() - 30000).toISOString(), userId: 'dev_user', action: 'LOGIN', details: 'User logged in', ipAddress: '127.0.0.1', userAgent: 'Firefox', success: true, category: 'security' },
                ];
                return resolve({ success: true, data: dummyAuditLogs, total: dummyAuditLogs.length });
            }

            // Notifications
            if (endpoint.includes('/notifications')) {
                const dummyNotifications: CliNotification[] = [
                    { id: generateUniqueId('n'), type: 'info', message: 'Welcome to the new CLI Dashboard!', timestamp: new Date().toISOString(), isRead: false },
                    { id: generateUniqueId('n'), type: 'warning', message: 'Payment processing job failed for j1.', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), isRead: true, link: '/jobs/j1', relatedJobId: 'j1' },
                ];
                return resolve({ success: true, data: dummyNotifications, total: dummyNotifications.length });
            }

            // Metrics
            if (endpoint.includes('/metrics')) {
                const now = Date.now();
                const dummyMetrics: CliResourceMetric[] = [
                    { timestamp: new Date(now - 60000).toISOString(), metricType: 'api_calls', value: Math.floor(Math.random() * 50) + 10, unit: 'calls/min', context: 'demobank payments list' },
                    { timestamp: new Date(now - 60000).toISOString(), metricType: 'db_queries', value: Math.floor(Math.random() * 100) + 20, unit: 'queries/min', context: 'demobank payments list' },
                    { timestamp: new Date(now - 30000).toISOString(), metricType: 'cpu_usage', value: parseFloat((Math.random() * 50 + 10).toFixed(1)), unit: '%', context: 'system' },
                    { timestamp: new Date(now - 30000).toISOString(), metricType: 'memory_usage', value: parseFloat((Math.random() * 300 + 100).toFixed(1)), unit: 'MB', context: 'system' },
                ];
                return resolve({ success: true, data: dummyMetrics });
            }

            // Settings
            if (endpoint.includes('/settings')) {
                if (method === 'PUT') {
                    return resolve({ success: true, message: 'Settings updated successfully.', data: body });
                }
                const defaultSettings: CliSettingsData = {
                    aiModel: 'gemini-pro',
                    terminalTheme: 'dark',
                    historyLimit: 50,
                    enableAutocomplete: true,
                    notificationLevel: 'info',
                    preferredOutputFormat: 'text',
                    autoSaveScripts: true,
                    defaultScriptTags: ['utility'],
                };
                return resolve({ success: true, data: defaultSettings });
            }

            // Default success response
            resolve({ success: true, message: 'Simulated success', data: body });
        }, delayMs);
    });
};

/**
 * Simulates execution of a demobank CLI command.
 * @param command The command string.
 * @returns A promise resolving to CliCommandOutput.
 */
const simulateCliCommandExecution = async (command: string): Promise<CliCommandOutput> => {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800)); // Simulate latency

    const commandLower = command.toLowerCase();
    let rawOutput: string;
    let parsedOutput: any | undefined;
    let outputType: CliCommandOutput['type'] = 'text';

    try {
        if (commandLower.includes('demobank payments list')) {
            const parsed = parseCliCommand(commandLower);
            const statusFilter = parsed.flags.status as string || 'pending';
            const amountLte = parsed.flags['amount-lte'] ? parseFloat(parsed.flags['amount-lte'] as string) : Infinity;
            const amountGte = parsed.flags['amount-gte'] ? parseFloat(parsed.flags['amount-gte'] as string) : -Infinity;
            const jsonFlag = parsed.flags.json === true;

            const payments = [
                { id: 'po_001', amount: 99.99, counterparty: 'Cloud Services Inc.', status: 'pending', created: '2023-01-01' },
                { id: 'po_002', amount: 250.00, counterparty: 'Supplier A', status: 'pending', created: '2023-01-05' },
                { id: 'po_003', amount: 1200.50, counterparty: 'Landlord Co.', status: 'approved', created: '2023-01-10' },
                { id: 'po_004', amount: 49.99, counterparty: 'Utility Co.', status: 'pending', created: '2023-01-15' },
                { id: 'po_005', amount: 500.00, counterparty: 'Vendor B', status: 'approved', created: '2023-01-20' },
                { id: 'po_006', amount: 75.00, counterparty: 'Telecom Ltd.', status: 'pending', created: '2023-01-22' },
            ];

            const filteredPayments = payments.filter(p =>
                (statusFilter === 'all' || p.status === statusFilter) &&
                p.amount >= amountGte &&
                p.amount <= amountLte
            );

            if (jsonFlag) {
                rawOutput = formatJson(filteredPayments);
                parsedOutput = filteredPayments;
                outputType = 'json';
            } else {
                rawOutput = 'ID        AMOUNT      COUNTERPARTY           STATUS    CREATED\n';
                rawOutput += '------------------------------------------------------------------\n';
                filteredPayments.forEach(p => {
                    rawOutput += `${p.id.padEnd(10)}${p.amount.toFixed(2).padEnd(12)}${p.counterparty.padEnd(23)}${p.status.padEnd(10)}${p.created}\n`;
                });
                outputType = 'table';
            }
        } else if (commandLower.includes('demobank payments approve')) {
            const idMatch = commandLower.match(/demobank payments approve (\w+)/);
            const paymentId = idMatch ? idMatch[1] : null;
            if (paymentId) {
                rawOutput = `✓ Payment order ${paymentId} approved.`;
            } else {
                rawOutput = `Error: Missing payment ID. Usage: demobank payments approve <payment_id>`;
                throw new Error(rawOutput);
            }
        } else if (commandLower.includes('demobank users show')) {
            const idMatch = commandLower.match(/demobank users show (\w+)/);
            const userId = idMatch ? idMatch[1] : 'dev_user';
            const user = {
                id: userId,
                name: userId === 'dev_user' ? 'Developer User' : 'Unknown User',
                email: `${userId}@demobank.com`,
                role: 'developer',
                status: 'active',
                lastLogin: new Date().toISOString(),
                permissions: ['payments:read', 'scripts:manage', 'jobs:view', `user:${userId}:manage`]
            };
            rawOutput = formatJson(user);
            parsedOutput = user;
            outputType = 'json';
        } else if (commandLower.includes('demobank config get')) {
            const keyMatch = commandLower.match(/demobank config get (\w+)/);
            const key = keyMatch ? keyMatch[1] : 'unknown';
            const config = {
                'api-endpoint': 'https://api.demobank.com/v1',
                'cli-version': '1.5.2',
                'default-currency': 'USD',
                'log-level': 'info',
                'region': 'us-east-1',
            };
            if (config[key as keyof typeof config]) {
                rawOutput = config[key as keyof typeof config];
            } else {
                rawOutput = `Error: Configuration key '${key}' not found.`;
                throw new Error(rawOutput);
            }
        } else if (commandLower.includes('demobank config set')) {
            const match = commandLower.match(/demobank config set (\w+)=(\S+)/);
            if (match) {
                const key = match[1];
                const value = match[2];
                rawOutput = `Configuration key '${key}' set to '${value}'. (Simulated)`;
            } else {
                rawOutput = `Error: Invalid usage. Usage: demobank config set <key>=<value>`;
                throw new Error(rawOutput);
            }
        } else if (commandLower.includes('ls') || commandLower.includes('dir')) {
            rawOutput = `scripts/\njobs/\nplugins/\nhistory.log\nconfig.json\nREADME.md\n`;
        } else if (commandLower.includes('cd')) {
            rawOutput = `Changed directory. (Simulated)`;
        } else if (commandLower.includes('help')) {
            rawOutput = `demobank CLI Help:
Available commands:
  payments     - Manage payment orders (list, approve, create, show).
  users        - Manage user accounts (list, create, show, update, delete).
  accounts     - Manage bank accounts.
  transactions - View transaction history.
  scripts      - Manage CLI scripts (list, save, run, delete).
  jobs         - Manage scheduled CLI jobs (list, schedule, cancel, show).
  config       - Manage CLI configuration (list, get, set, reset).
  plugins      - Manage CLI plugins (list, install, activate, deactivate, show).
  ai           - Interact with AI assistant (chat, generate, explain, debug).
  audit        - View audit logs (list, show, export).
  metrics      - View resource metrics (show, history).
  help         - Get help on commands.
  version      - Display CLI version.

Use 'demobank <command> --help' for more details.`;
        } else if (commandLower.includes('demobank ai chat')) {
            const messageMatch = commandLower.match(/--message "([^"]+)"|--message (\S+)/);
            const message = messageMatch ? (messageMatch[1] || messageMatch[2]) : 'Hello AI';
            rawOutput = `AI: I'm currently processing your request: "${message}". In a real scenario, I'd provide a detailed response or command suggestion.`;
        } else if (commandLower.includes('demobank script run')) {
            const scriptIdMatch = commandLower.match(/demobank script run (\w+)/);
            const scriptId = scriptIdMatch ? scriptIdMatch[1] : null;
            if (scriptId) {
                rawOutput = `Running script ${scriptId}... (Simulated)`;
            } else {
                rawOutput = `Error: Missing script ID. Usage: demobank script run <script_id>`;
                throw new Error(rawOutput);
            }
        } else if (commandLower.includes('clear')) {
            rawOutput = 'CLEAR_COMMAND_SIGNAL'; // Special signal for clearing terminal
            outputType = 'clear';
        } else if (commandLower.includes('demobank audit list')) {
            const response = await simulateApiCall('/api/audit', 'GET', null, 200);
            if (response.success) {
                rawOutput = formatJson(response.data.map((log: CliAuditLog) => ({ id: log.id, action: log.action, userId: log.userId, timestamp: log.timestamp.substring(11, 19), success: log.success })));
                parsedOutput = response.data;
                outputType = 'json';
            } else {
                rawOutput = `Error fetching audit logs: ${response.message}`;
                outputType = 'error';
            }
        }
        else {
            rawOutput = `Error: Command not found or not supported in simulation: "${command}". Try 'demobank payments list' or 'help'.`;
            throw new Error(rawOutput);
        }
    } catch (error: any) {
        rawOutput = error.message || `Unknown error during command execution: ${command}`;
        outputType = 'error';
    }

    const durationMs = Date.now() - (Date.now() - (200 + Math.random() * 800)); // approximate duration

    return {
        raw: rawOutput,
        parsed: parsedOutput,
        type: outputType,
        summary: rawOutput.split('\n')[0].substring(0, 100) + (rawOutput.length > 100 ? '...' : ''),
        details: rawOutput,
    };
};

// --- CLI Components ---

/**
 * Renders a single command output line in the terminal.
 * Handles different output types (text, JSON, table).
 */
export const CliOutputLine: React.FC<{ output: CliCommandOutput; theme: string }> = ({ output, theme }) => {
    const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
    const jsonColor = theme === 'light' ? 'text-blue-700' : 'text-cyan-300';
    const errorColor = theme === 'light' ? 'text-red-700' : 'text-red-400';
    const tableHeaderBg = theme === 'light' ? 'bg-gray-100' : 'bg-gray-800';
    const tableRowBg = theme === 'light' ? 'bg-white' : 'bg-gray-900';
    const tableBorder = theme === 'light' ? 'border-gray-300' : 'border-gray-800';
    const tableTextColor = theme === 'light' ? 'text-gray-800' : 'text-white';
    const tableHeaderTextColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

    const renderContent = () => {
        if (output.type === 'json' && output.parsed) {
            return (
                <pre className={`${jsonColor} whitespace-pre-wrap`}>
                    {formatJson(output.parsed)}
                </pre>
            );
        }
        if (output.type === 'table') {
            const lines = output.raw.split('\n');
            if (lines.length > 1) {
                const headers = lines[0].split(/\s{2,}/).filter(Boolean); // Split by 2+ spaces
                const data = lines.slice(2); // Skip header and separator

                return (
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${tableBorder} text-sm`}>
                            <thead>
                                <tr>
                                    {headers.map((h, i) => (
                                        <th key={i} className={`px-4 py-2 text-left text-xs font-medium ${tableHeaderTextColor} uppercase tracking-wider ${tableHeaderBg}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={`${tableRowBg} divide-y ${tableBorder}`}>
                                {data.map((line, rowIndex) => {
                                    const cells = line.split(/\s{2,}/).filter(Boolean);
                                    return (
                                        <tr key={rowIndex}>
                                            {cells.map((cell, cellIndex) => (
                                                <td key={cellIndex} className={`px-4 py-2 whitespace-nowrap ${tableTextColor}`}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            }
        }
        if (output.type === 'error') {
            return <p className={errorColor}>{output.raw}</p>;
        }
        return <p className={`${textColor} whitespace-pre-wrap`}>{highlightCliSyntax(output.raw)}</p>;
    };

    return (
        <div className="mt-1">
            {renderContent()}
        </div>
    );
};

/**
 * Displays the output history of the CLI terminal.
 */
export const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, theme }) => {
    const outputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const bgColor = theme === 'light' ? 'bg-gray-50' : 'bg-black';

    return (
        <div ref={outputRef} className={`flex-grow ${bgColor} p-4 rounded-b-lg font-mono text-sm overflow-y-auto custom-scrollbar`}>
            {output.map((out, index) => (
                <div key={index} className="mb-2">
                    <CliOutputLine output={out} theme={theme} />
                </div>
            ))}
        </div>
    );
};

/**
 * The input component for the CLI terminal, handles command entry and history.
 */
export const TerminalInput: React.FC<TerminalInputProps> = ({ onExecute, isLoading, commandHistory, currentWorkingDirectory, autocompleteSuggestions }) => {
    const [inputValue, setInputValue] = useState('');
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [suggestionIndex, setSuggestionIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const { notifications, addNotification } = useCli(); // Access notifications to add errors

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isLoading) return;

            const commandToExecute = suggestionIndex > -1 && autocompleteSuggestions[suggestionIndex]
                ? autocompleteSuggestions[suggestionIndex]
                : inputValue;

            if (commandToExecute.trim()) {
                onExecute(commandToExecute);
                setInputValue('');
                setHistoryIndex(-1); // Reset history index
                setSuggestionIndex(-1); // Reset suggestion index
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (autocompleteSuggestions.length > 0 && suggestionIndex < autocompleteSuggestions.length - 1) {
                const newIndex = suggestionIndex + 1;
                setSuggestionIndex(newIndex);
                setInputValue(autocompleteSuggestions[newIndex]);
            } else if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
                setSuggestionIndex(-1); // Clear suggestion index when navigating history
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (autocompleteSuggestions.length > 0 && suggestionIndex > 0) {
                const newIndex = suggestionIndex - 1;
                setSuggestionIndex(newIndex);
                setInputValue(autocompleteSuggestions[newIndex]);
            } else if (autocompleteSuggestions.length > 0 && suggestionIndex === 0) {
                 setSuggestionIndex(-1);
                 setInputValue(''); // Clear input if at the end of suggestions
            } else if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[commandHistory.length - 1 - newIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInputValue('');
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            if (autocompleteSuggestions.length > 0) {
                const nextSuggestionIndex = (suggestionIndex + 1) % autocompleteSuggestions.length;
                setSuggestionIndex(nextSuggestionIndex);
                setInputValue(autocompleteSuggestions[nextSuggestionIndex]);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setHistoryIndex(-1); // Reset history index on new input
        setSuggestionIndex(-1); // Reset suggestion index on new input
    };

    const promptText = isLoading ? 'Executing...' : `Enter command (${currentWorkingDirectory})`;

    return (
        <div className="relative">
            <div className="flex bg-gray-800 p-2 rounded-t-lg border-b border-gray-700">
                <span className="select-none text-green-400 mr-2 font-bold">{currentWorkingDirectory} $</span>
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-grow bg-transparent text-white focus:outline-none placeholder-gray-500"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={promptText}
                    disabled={isLoading}
                    spellCheck="false"
                />
            </div>
            {autocompleteSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-b-lg shadow-lg max-h-48 overflow-y-auto">
                    {autocompleteSuggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`px-4 py-2 text-sm text-gray-200 cursor-pointer hover:bg-cyan-700 ${index === suggestionIndex ? 'bg-cyan-700' : ''}`}
                            onClick={() => {
                                setInputValue(suggestion);
                                setSuggestionIndex(index);
                                inputRef.current?.focus();
                            }}
                        >
                            <span className="text-gray-500 mr-2">$</span> {highlightCliSyntax(suggestion)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * The main interactive CLI terminal component.
 */
export const CliTerminal: React.FC = () => {
    const { executeCommand, addCommandToHistory, currentWorkingDirectory, changeDirectory } = useCli();
    const [currentOutput, setCurrentOutput] = useState<CliCommandOutput[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
    const [cliSettings, setCliSettings] = useState<CliSettingsData | null>(null);

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            const response = await simulateApiCall('/api/settings', 'GET', null, 100);
            if (response.success) {
                setCliSettings(response.data);
            }
        };
        fetchSettings();
    }, []);

    const availableCommands = [
        'demobank payments list', 'demobank payments approve', 'demobank payments create', 'demobank payments show',
        'demobank users list', 'demobank users create', 'demobank users show', 'demobank users update', 'demobank users delete',
        'demobank config get', 'demobank config set', 'demobank help', 'demobank version', 'demobank script run',
        'demobank script save', 'demobank jobs schedule', 'demobank jobs list', 'demobank plugins list', 'demobank ai chat',
        'ls', 'cd', 'clear'
    ];

    const generateAutocomplete = useCallback(debounce((input: string) => {
        if (!cliSettings?.enableAutocomplete || !input) {
            setAutocompleteSuggestions([]);
            return;
        }
        const filtered = availableCommands.filter(cmd => cmd.startsWith(input));
        setAutocompleteSuggestions(filtered);
    }, 200), [cliSettings?.enableAutocomplete]);

    const handleCommandExecution = useCallback(async (command: string, isAiGenerated: boolean = false) => {
        setIsLoading(true);
        const startTime = Date.now();
        const commandId = generateUniqueId('cmd');

        // Update CLI history display first
        setCurrentOutput(prev => [...prev, { raw: `${currentWorkingDirectory} $ ${highlightCliSyntax(command).map(n => typeof n === 'string' ? n : n.props.children).join('')}`, type: 'text' }]);

        try {
            const result = await simulateCliCommandExecution(command);

            if (result.type === 'clear') {
                setCurrentOutput([]);
                // Still log the clear command in full history
                addCommandToHistory({
                    id: commandId,
                    command: command,
                    timestamp: new Date().toISOString(),
                    status: 'success',
                    output: 'Terminal cleared.',
                    durationMs: Date.now() - startTime,
                    contextPath: currentWorkingDirectory,
                    isAiGenerated: isAiGenerated,
                });
                return;
            }

            setCurrentOutput(prev => [...prev, result]);
            addCommandToHistory({
                id: commandId,
                command: command,
                timestamp: new Date().toISOString(),
                status: result.type === 'error' ? 'error' : 'success',
                output: result.summary || result.raw,
                durationMs: Date.now() - startTime,
                error: result.type === 'error' ? result.raw : undefined,
                contextPath: currentWorkingDirectory,
                isAiGenerated: isAiGenerated,
            });

            if (command.startsWith('cd ')) {
                const newPath = command.substring(3).trim();
                changeDirectory(newPath);
            }

        } catch (error: any) {
            const errorOutput: CliCommandOutput = {
                raw: error.message || 'Unknown error during command execution.',
                type: 'error',
                summary: 'Execution failed.',
                details: error.message,
            };
            setCurrentOutput(prev => [...prev, errorOutput]);
            addCommandToHistory({
                id: commandId,
                command: command,
                timestamp: new Date().toISOString(),
                status: 'error',
                output: errorOutput.summary || errorOutput.raw,
                durationMs: Date.now() - startTime,
                error: errorOutput.raw,
                contextPath: currentWorkingDirectory,
                isAiGenerated: isAiGenerated,
            });
        } finally {
            setIsLoading(false);
        }
    }, [addCommandToHistory, currentWorkingDirectory, changeDirectory, cliSettings]);

    return (
        <Card title="Interactive CLI Terminal" className="flex flex-col h-[500px]">
            <div className="flex-grow flex flex-col h-full">
                <TerminalInput
                    onExecute={handleCommandExecution}
                    isLoading={isLoading}
                    commandHistory={commandHistory} // Pass simple string history for input navigation
                    currentWorkingDirectory={currentWorkingDirectory}
                    autocompleteSuggestions={autocompleteSuggestions}
                />
                <TerminalOutput output={currentOutput} theme={cliSettings?.terminalTheme || 'dark'} />
            </div>
        </Card>
    );
};

/**
 * Component to display the history of executed commands.
 */
export const CliCommandHistory: React.FC = () => {
    const { history, executeCommand } = useCli();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
    const [cliSettings, setCliSettings] = useState<CliSettingsData | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const response = await simulateApiCall('/api/settings', 'GET', null, 100);
            if (response.success) {
                setCliSettings(response.data);
            }
        };
        fetchSettings();
    }, []);

    const filteredHistory = history
        .filter(cmd =>
            cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterStatus === 'all' || cmd.status === filterStatus)
        )
        .slice(-(cliSettings?.historyLimit || 50)) // Apply history limit from settings
        .reverse(); // Show most recent first

    const handleReRun = (command: string) => {
        executeCommand(command);
    };

    return (
        <Card title="Command History" className="h-[500px] flex flex-col">
            <div className="flex mb-4 space-x-2">
                <input
                    type="text"
                    placeholder="Search commands..."
                    className="flex-grow bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select
                    className="bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as 'all' | 'success' | 'error')}
                >
                    <option value="all">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                </select>
            </div>
            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {filteredHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No commands found.</p>
                ) : (
                    filteredHistory.map(cmd => (
                        <div key={cmd.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-cyan-600 transition duration-200 ease-in-out">
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-mono text-cyan-300 text-xs break-all mr-2">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${cmd.status === 'success' ? 'bg-green-500' : cmd.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                    {cmd.contextPath || '~'} $ {highlightCliSyntax(cmd.command)}
                                    {cmd.isAiGenerated && <span className="ml-2 text-purple-400 text-xs">(AI)</span>}
                                </p>
                                <button
                                    onClick={() => handleReRun(cmd.command)}
                                    className="ml-auto p-1 text-xs text-blue-400 hover:text-blue-200"
                                    title="Re-run command"
                                >
                                    &#x21BB; {/* Unicode for a refresh/redo arrow */}
                                </button>
                            </div>
                            <p className="text-gray-400 text-xs italic">
                                {new Date(cmd.timestamp).toLocaleString()} | Duration: {cmd.durationMs}ms
                            </p>
                            {cmd.output && (
                                <details className="mt-1 text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-300">Output Summary</summary>
                                    <pre className="mt-1 p-2 bg-gray-900 rounded overflow-x-auto text-gray-300 whitespace-pre-wrap">
                                        {cmd.output.length > 500 ? cmd.output.substring(0, 500) + '...' : cmd.output}
                                    </pre>
                                </details>
                            )}
                            {cmd.error && (
                                <details className="mt-1 text-xs text-red-400">
                                    <summary className="cursor-pointer hover:text-red-300">Error Details</summary>
                                    <pre className="mt-1 p-2 bg-gray-900 rounded overflow-x-auto text-red-300 whitespace-pre-wrap">
                                        {cmd.error}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

/**
 * A sophisticated script editor with features like saving, loading, and running scripts.
 */
export const CliScriptEditor: React.FC = () => {
    const { executeCommand, addNotification } = useCli();
    const [scripts, setScripts] = useState<CliScript[]>([]);
    const [currentScript, setCurrentScript] = useState<CliScript | null>(null);
    const [scriptContent, setScriptContent] = useState('');
    const [scriptName, setScriptName] = useState('');
    const [scriptDescription, setScriptDescription] = useState('');
    const [scriptTags, setScriptTags] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchScripts();
    }, []);

    const fetchScripts = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await simulateApiCall('/api/scripts', 'GET');
            if (response.success) {
                setScripts(response.data);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to fetch scripts.' });
                addNotification({ type: 'error', message: `Failed to fetch scripts: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error fetching scripts.' });
            addNotification({ type: 'error', message: `Error fetching scripts: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewScript = () => {
        setCurrentScript(null);
        setScriptContent('');
        setScriptName('');
        setScriptDescription('');
        setScriptTags('');
        setIsPublic(false);
        setMessage(null);
    };

    const handleLoadScript = (script: CliScript) => {
        setCurrentScript(script);
        setScriptContent(script.scriptContent);
        setScriptName(script.name);
        setScriptDescription(script.description);
        setScriptTags(script.tags.join(', '));
        setIsPublic(script.isPublic);
        setMessage(null);
    };

    const handleSaveScript = async () => {
        if (!scriptName.trim() || !scriptContent.trim()) {
            setMessage({ type: 'error', text: 'Script name and content cannot be empty.' });
            addNotification({ type: 'warning', message: 'Script name or content is empty. Cannot save.' });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        const tagsArray = scriptTags.split(',').map(tag => tag.trim()).filter(Boolean);
        const scriptData: CliScript = {
            id: currentScript?.id || generateUniqueId('s'),
            name: scriptName.trim(),
            description: scriptDescription.trim(),
            scriptContent: scriptContent,
            createdAt: currentScript?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: tagsArray,
            author: 'dev_user', // Placeholder, would come from auth context
            isPublic: isPublic,
            runCount: currentScript?.runCount || 0,
            version: (currentScript?.version || 0) + 1,
        };

        try {
            const method = currentScript ? 'PUT' : 'POST';
            const endpoint = currentScript ? `/api/scripts/${scriptData.id}` : '/api/scripts';
            const response = await simulateApiCall(endpoint, method, scriptData);

            if (response.success) {
                const successMessage = `Script "${scriptName}" ${currentScript ? 'updated' : 'saved'} successfully!`;
                setMessage({ type: 'success', text: successMessage });
                addNotification({ type: 'success', message: successMessage });
                if (!currentScript) {
                    scriptData.id = response.data.id || scriptData.id;
                    setScripts(prev => [...prev, scriptData]);
                } else {
                    setScripts(prev => prev.map(s => s.id === scriptData.id ? scriptData : s));
                }
                setCurrentScript(scriptData);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to save script.' });
                addNotification({ type: 'error', message: `Failed to save script: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error saving script.' });
            addNotification({ type: 'error', message: `Error saving script: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteScript = async (scriptId: string) => {
        if (!window.confirm('Are you sure you want to delete this script? This action cannot be undone.')) return;

        setIsLoading(true);
        setMessage(null);
        try {
            const response = await simulateApiCall(`/api/scripts/${scriptId}`, 'DELETE');
            if (response.success) {
                const successMessage = 'Script deleted successfully!';
                setMessage({ type: 'success', text: successMessage });
                addNotification({ type: 'info', message: successMessage });
                setScripts(prev => prev.filter(s => s.id !== scriptId));
                if (currentScript?.id === scriptId) {
                    handleNewScript();
                }
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to delete script.' });
                addNotification({ type: 'error', message: `Failed to delete script: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error deleting script.' });
            addNotification({ type: 'error', message: `Error deleting script: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunScript = async () => {
        if (!scriptContent.trim()) {
            setMessage({ type: 'error', text: 'Script content is empty. Nothing to run.' });
            addNotification({ type: 'warning', message: 'Attempted to run an empty script.' });
            return;
        }
        const commands = scriptContent.split('\n').map(cmd => cmd.trim()).filter(Boolean);
        const runMessage = `Running script "${scriptName || 'untitled'}" (${commands.length} commands)...`;
        setMessage({ type: 'info', text: runMessage });
        addNotification({ type: 'info', message: runMessage });

        let allSuccess = true;
        for (const cmd of commands) {
            try {
                await executeCommand(cmd);
                await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between commands
            } catch (error) {
                allSuccess = false;
                addNotification({ type: 'error', message: `Script "${scriptName}" failed on command: "${cmd}"` });
                break; // Stop on first error, or continue based on preference
            }
        }
        const finalMessage = allSuccess ? `Script "${scriptName || 'untitled'}" finished successfully.` : `Script "${scriptName || 'untitled'}" finished with errors.`;
        setMessage({ type: allSuccess ? 'success' : 'error', text: finalMessage });
        addNotification({ type: allSuccess ? 'success' : 'error', message: finalMessage });

        if (currentScript) {
            setScripts(prev => prev.map(s => s.id === currentScript.id ? { ...s, lastRun: new Date().toISOString(), runCount: s.runCount + 1 } : s));
        }
    };

    return (
        <Card title="CLI Script Editor" className="flex flex-col h-[600px]">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Script List */}
                <div className="md:col-span-1 bg-gray-800 p-4 rounded-lg flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-4">My Scripts</h3>
                    <button onClick={handleNewScript} className="mb-4 py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50 transition-colors duration-200" disabled={isLoading}>
                        + New Script
                    </button>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {isLoading && <p className="text-gray-500">Loading scripts...</p>}
                        {message?.type === 'error' && <p className="text-red-400">{message.text}</p>}
                        {scripts.length === 0 && !isLoading && <p className="text-gray-500">No scripts saved yet.</p>}
                        {scripts.map(script => (
                            <div key={script.id}
                                 className={`p-3 rounded-lg border cursor-pointer ${currentScript?.id === script.id ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 hover:border-gray-500 bg-gray-900/30'}`}
                                 onClick={() => handleLoadScript(script)}>
                                <h4 className="font-semibold text-white text-md">{script.name}</h4>
                                <p className="text-gray-400 text-xs truncate">{script.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                                    <span>Runs: {script.runCount}</span>
                                    {script.lastRun && <span>Last Run: {new Date(script.lastRun).toLocaleDateString()}</span>}
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteScript(script.id); }} className="text-red-400 hover:text-red-300 ml-auto transition-colors duration-200">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Script Editor */}
                <div className="md:col-span-2 flex flex-col bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">{currentScript ? `Edit Script: ${currentScript.name} (v${currentScript.version})` : 'New Script'}</h3>
                    {message && (
                        <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : message.type === 'info' ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="scriptName" className="block text-gray-400 text-sm mb-1">Script Name</label>
                        <input
                            type="text"
                            id="scriptName"
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={scriptName}
                            onChange={e => setScriptName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="scriptDescription" className="block text-gray-400 text-sm mb-1">Description</label>
                        <textarea
                            id="scriptDescription"
                            className="w-full h-16 bg-gray-700/50 p-2 rounded text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={scriptDescription}
                            onChange={e => setScriptDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="scriptTags" className="block text-gray-400 text-sm mb-1">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="scriptTags"
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={scriptTags}
                            onChange={e => setScriptTags(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mb-4 flex items-center">
                        <input
                            type="checkbox"
                            id="isPublic"
                            className="mr-2 h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                            checked={isPublic}
                            onChange={e => setIsPublic(e.target.checked)}
                            disabled={isLoading}
                        />
                        <label htmlFor="isPublic" className="text-gray-400 text-sm">Make Public (share with team)</label>
                    </div>

                    <label htmlFor="scriptContent" className="block text-gray-400 text-sm mb-1">Script Content (Commands per line)</label>
                    <textarea
                        id="scriptContent"
                        className="flex-grow w-full h-32 bg-gray-900/50 p-4 rounded-lg font-mono text-cyan-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                        value={scriptContent}
                        onChange={e => setScriptContent(e.target.value)}
                        placeholder="Enter CLI commands, one per line (e.g., 'demobank payments list --status=pending')..."
                        disabled={isLoading}
                        spellCheck="false"
                    />
                    <div className="mt-4 flex space-x-2">
                        <button onClick={handleSaveScript} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50 transition-colors duration-200" disabled={isLoading}>
                            {currentScript ? 'Update Script' : 'Save Script'}
                        </button>
                        <button onClick={handleRunScript} className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded text-white disabled:opacity-50 transition-colors duration-200" disabled={isLoading || !scriptContent.trim()}>
                            Run Script
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * Component for scheduling CLI scripts to run at specific times.
 */
export const CliJobScheduler: React.FC = () => {
    const { addNotification } = useCli();
    const [jobs, setJobs] = useState<CliJob[]>([]);
    const [scripts, setScripts] = useState<CliScript[]>([]); // To populate script dropdown
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    const [selectedScriptId, setSelectedScriptId] = useState('');
    const [scheduleType, setScheduleType] = useState<'once' | 'cron'>('once');
    const [onceDateTime, setOnceDateTime] = useState(''); // YYYY-MM-DDTHH:MM
    const [cronExpression, setCronExpression] = useState('0 0 * * *'); // Default daily at midnight
    const [jobDescription, setJobDescription] = useState('');
    const [notificationEmails, setNotificationEmails] = useState('');

    useEffect(() => {
        fetchJobsAndScripts();
    }, []);

    const fetchJobsAndScripts = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const jobsResponse = await simulateApiCall('/api/jobs', 'GET');
            const scriptsResponse = await simulateApiCall('/api/scripts', 'GET');

            if (jobsResponse.success) setJobs(jobsResponse.data);
            else addNotification({ type: 'error', message: `Failed to fetch jobs: ${jobsResponse.message || 'Unknown error.'}` });

            if (scriptsResponse.success) setScripts(scriptsResponse.data);
            else addNotification({ type: 'error', message: `Failed to fetch scripts: ${scriptsResponse.message || 'Unknown error.'}` });

            if (!jobsResponse.success && !scriptsResponse.success) {
                 setMessage({ type: 'error', text: 'Failed to fetch jobs and scripts.' });
            }

        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error fetching data.' });
            addNotification({ type: 'error', message: `Error fetching scheduler data: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateJob = async () => {
        if (!selectedScriptId) {
            setMessage({ type: 'error', text: 'Please select a script to schedule.' });
            addNotification({ type: 'warning', message: 'Attempted to schedule job without selecting a script.' });
            return;
        }

        let scheduleString = '';
        if (scheduleType === 'once') {
            if (!onceDateTime) {
                setMessage({ type: 'error', text: 'Please select a date and time for the one-time schedule.' });
                addNotification({ type: 'warning', message: 'One-time job requires a date and time.' });
                return;
            }
            if (new Date(onceDateTime).getTime() < Date.now()) {
                setMessage({ type: 'error', text: 'One-time schedule cannot be in the past.' });
                addNotification({ type: 'warning', message: 'One-time job date cannot be in the past.' });
                return;
            }
            scheduleString = `once:${new Date(onceDateTime).toISOString()}`; // Store ISO string
        } else { // cron
            if (!cronExpression.match(/^(\S+\s){4}\S+$/)) { // Basic cron validation
                 setMessage({ type: 'error', text: 'Invalid cron expression. Expected 5 parts (minute hour day-of-month month day-of-week).' });
                 addNotification({ type: 'warning', message: 'Invalid cron expression provided.' });
                 return;
            }
            scheduleString = `cron:${cronExpression}`;
        }

        setIsLoading(true);
        setMessage(null);

        const newJob: CliJob = {
            id: generateUniqueId('j'),
            scriptId: selectedScriptId,
            schedule: scheduleString,
            status: 'scheduled',
            lastRunAt: undefined,
            nextRunAt: scheduleType === 'once' ? new Date(onceDateTime).toISOString() : new Date(Date.now() + 3600000).toISOString(), // Placeholder for next run
            logs: ['Job created successfully.'],
            createdAt: new Date().toISOString(),
            createdBy: 'dev_user', // Placeholder
            maxRetries: 3,
            retryCount: 0,
            description: jobDescription.trim() || undefined,
            notificationEmails: notificationEmails.split(',').map(e => e.trim()).filter(Boolean),
        };

        try {
            const response = await simulateApiCall('/api/jobs', 'POST', newJob);
            if (response.success) {
                const scriptName = scripts.find(s => s.id === selectedScriptId)?.name;
                const successMessage = `Job for script "${scriptName}" scheduled successfully!`;
                setMessage({ type: 'success', text: successMessage });
                addNotification({ type: 'success', message: successMessage, relatedJobId: newJob.id });
                setJobs(prev => [...prev, newJob]);
                // Reset form
                setSelectedScriptId('');
                setOnceDateTime('');
                setCronExpression('0 0 * * *');
                setJobDescription('');
                setNotificationEmails('');
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to schedule job.' });
                addNotification({ type: 'error', message: `Failed to schedule job: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error scheduling job.' });
            addNotification({ type: 'error', message: `Error scheduling job: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const getScriptDisplayName = (scriptId: string) => {
        return scripts.find(s => s.id === scriptId)?.name || `Unknown Script (${scriptId})`;
    };

    const handleCancelJob = async (jobId: string) => {
        if (!window.confirm('Are you sure you want to cancel this job?')) return;

        setIsLoading(true);
        setMessage(null);
        try {
            const response = await simulateApiCall(`/api/jobs/${jobId}/cancel`, 'POST'); // Simulate cancel endpoint
            if (response.success) {
                const successMessage = 'Job cancelled successfully!';
                setMessage({ type: 'success', text: successMessage });
                addNotification({ type: 'info', message: successMessage, relatedJobId: jobId });
                setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status: 'cancelled' } : job));
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to cancel job.' });
                addNotification({ type: 'error', message: `Failed to cancel job: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error cancelling job.' });
            addNotification({ type: 'error', message: `Error cancelling job: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="CLI Job Scheduler" className="flex flex-col h-[700px]">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Schedule New Job */}
                <div className="flex flex-col bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">Schedule New Job</h3>
                    {message && (
                        <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : message.type === 'error' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="scriptSelect" className="block text-gray-400 text-sm mb-1">Select Script</label>
                        <select
                            id="scriptSelect"
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={selectedScriptId}
                            onChange={e => setSelectedScriptId(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">-- Select a Script --</option>
                            {scripts.map(script => (
                                <option key={script.id} value={script.id}>{script.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-400 text-sm mb-1">Schedule Type</label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-cyan-600"
                                    value="once"
                                    checked={scheduleType === 'once'}
                                    onChange={() => setScheduleType('once')}
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-white text-sm">One-Time</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio text-cyan-600"
                                    value="cron"
                                    checked={scheduleType === 'cron'}
                                    onChange={() => setScheduleType('cron')}
                                    disabled={isLoading}
                                />
                                <span className="ml-2 text-white text-sm">Cron Expression</span>
                            </label>
                        </div>
                    </div>

                    {scheduleType === 'once' && (
                        <div className="mb-4">
                            <label htmlFor="onceDateTime" className="block text-gray-400 text-sm mb-1">Date and Time</label>
                            <input
                                type="datetime-local"
                                id="onceDateTime"
                                className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                value={onceDateTime}
                                onChange={e => setOnceDateTime(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {scheduleType === 'cron' && (
                        <div className="mb-4">
                            <label htmlFor="cronExpression" className="block text-gray-400 text-sm mb-1">Cron Expression</label>
                            <input
                                type="text"
                                id="cronExpression"
                                className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                placeholder="e.g., 0 0 * * * (daily at midnight)"
                                value={cronExpression}
                                onChange={e => setCronExpression(e.target.value)}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Format: minute hour day-of-month month day-of-week
                                (<a href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Cron Guru</a>)
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <label htmlFor="jobDescription" className="block text-gray-400 text-sm mb-1">Job Description (Optional)</label>
                        <textarea
                            id="jobDescription"
                            className="w-full h-16 bg-gray-700/50 p-2 rounded text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="notificationEmails" className="block text-gray-400 text-sm mb-1">Notification Emails (comma-separated)</label>
                        <input
                            type="text"
                            id="notificationEmails"
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="user1@example.com, user2@example.com"
                            value={notificationEmails}
                            onChange={e => setNotificationEmails(e.target.value)}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">Receive email notifications on job completion or failure.</p>
                    </div>

                    <button
                        onClick={handleCreateJob}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50 mt-auto transition-colors duration-200"
                        disabled={isLoading || !selectedScriptId || (scheduleType === 'once' && !onceDateTime) || (scheduleType === 'cron' && !cronExpression)}
                    >
                        Schedule Job
                    </button>
                </div>

                {/* Scheduled Jobs List */}
                <div className="flex flex-col bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-white mb-4">Scheduled Jobs</h3>
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {isLoading && <p className="text-gray-500">Loading jobs...</p>}
                        {jobs.length === 0 && !isLoading && <p className="text-gray-500">No jobs scheduled yet.</p>}
                        {jobs.map(job => (
                            <div key={job.id} className="bg-gray-900/30 p-3 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-white text-md">{getScriptDisplayName(job.scriptId)}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'scheduled' ? 'bg-blue-600' : job.status === 'running' ? 'bg-yellow-600' : job.status === 'completed' ? 'bg-green-600' : job.status === 'failed' ? 'bg-red-600' : 'bg-gray-600'}`}>
                                        {job.status.toUpperCase()}
                                    </span>
                                </div>
                                {job.description && <p className="text-gray-500 text-xs italic mb-1">{job.description}</p>}
                                <p className="text-gray-400 text-xs mt-1">Schedule: {job.schedule.startsWith('cron:') ? `CRON: ${job.schedule.substring(5)}` : `ONCE: ${new Date(job.schedule.substring(5)).toLocaleString()}`}</p>
                                {job.lastRunAt && <p className="text-gray-400 text-xs">Last Run: {new Date(job.lastRunAt).toLocaleString()}</p>}
                                {job.nextRunAt && <p className="text-gray-400 text-xs">Next Run: {new Date(job.nextRunAt).toLocaleString()}</p>}
                                <p className="text-gray-500 text-xs mt-2">Created: {new Date(job.createdAt).toLocaleDateString()} by {job.createdBy}</p>
                                {job.status !== 'cancelled' && job.status !== 'completed' && job.status !== 'failed' && (
                                    <div className="mt-3 flex justify-end">
                                        <button onClick={() => handleCancelJob(job.id)} className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded transition-colors duration-200">Cancel Job</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

/**
 * A sophisticated AI Chat Assistant for generating, explaining, and debugging commands/scripts.
 */
export const AiChatAssistant: React.FC = () => {
    const { executeCommand, addNotification } = useCli();
    const [chatHistory, setChatHistory] = useState<AiChatInteraction[]>([]);
    const [currentAiPrompt, setCurrentAiPrompt] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const googleGenAI = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY as string }));
    const [selectedAiModel, setSelectedAiModel] = useState('gemini-pro');
    const [availableAiModels, setAvailableAiModels] = useState<AiModelConfig[]>([
        { id: 'm1', name: 'Gemini Pro', provider: 'google', modelId: 'gemini-pro', description: 'Google\'s balanced model for various tasks.', isActive: true, costPerToken: 0.0001 },
        { id: 'm2', name: 'Gemini 2.5 Flash', provider: 'google', modelId: 'gemini-2.5-flash', description: 'Faster, cost-effective model, good for quick responses.', isActive: true, costPerToken: 0.00005 },
        { id: 'm3', name: 'GPT-4 (Enterprise)', provider: 'openai', modelId: 'gpt-4', description: 'OpenAI\'s advanced reasoning model (Requires premium subscription).', isActive: false, costPerToken: 0.003 },
    ]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Load AI model from settings if available
    useEffect(() => {
        const fetchSettings = async () => {
            const response = await simulateApiCall('/api/settings', 'GET', null, 50);
            if (response.success) {
                setSelectedAiModel(response.data.aiModel);
            }
        };
        fetchSettings();
    }, []);

    const sendAiPrompt = async (promptText: string, specificRole?: 'scriptGeneration' | 'commandExplanation' | 'debuggingAssistance' | 'resourceOptimization') => {
        if (!promptText.trim()) return;

        const userInteraction: AiChatInteraction = {
            id: generateUniqueId('uai'),
            timestamp: new Date().toISOString(),
            role: 'user',
            content: promptText,
        };
        setChatHistory(prev => [...prev, userInteraction]);
        setCurrentAiPrompt('');
        setIsAiThinking(true);

        try {
            const aiModelInstance = googleGenAI.current.models.gemini(selectedAiModel);
            const systemInstructions = {
                scriptGeneration: `You are an AI specializing in generating multi-line Demobank CLI scripts. The user will describe a task, and you will provide a sequence of 'demobank' commands. Each command should be on a new line. Use appropriate flags like --json for programmatic output, and pipe commands when necessary. Format command suggestions as '` + "```demobank ...```" + `'.`,
                commandExplanation: `You are an AI specializing in explaining Demobank CLI commands. The user will provide a command, and you will explain its purpose, arguments, and common options.`,
                debuggingAssistance: `You are an AI assistant for debugging Demobank CLI commands and scripts. The user will provide a command/script and an error message or unexpected behavior. Your task is to analyze the input and suggest potential causes and troubleshooting steps.`,
                resourceOptimization: `You are an AI advisor for optimizing Demobank CLI operations. The user will describe a task or a slow command/script, and you will suggest ways to make it more efficient. Focus on reducing API calls, processing data locally, or using more specific filters.`,
            };
            const currentSystemInstruction = specificRole ? systemInstructions[specificRole] : `You are an expert Demobank CLI assistant. Your goal is to help users generate, explain, or debug Demobank CLI commands and scripts. Assume commands like 'demobank payments list --status=pending', 'demobank payments approve <id>', 'demobank users create --name="John Doe" --email="john@example.com" --role=customer', 'demobank config get api-endpoint', 'demobank script run s_my_script_id', 'demobank help payments'. Respond in a conversational tone. If a command can be generated, provide it clearly, optionally with an explanation and follow-up suggestions. If explaining a command, be concise. If debugging, ask for more context or suggest common issues. For complex requests, break them down. Format command suggestions as '` + "```demobank ...```" + `'. Provide follow-up suggestions in a bulleted list. If the prompt explicitly asks to run a command, just generate the command without extra conversation if possible.`;

            const fullPrompt = `${currentSystemInstruction}\nUser request: "${promptText}"`;
            
            const result = await aiModelInstance.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
            });
            const aiResponse = result.text;

            let commandGenerated: string | undefined;
            const commandMatch = aiResponse.match(/```(demobank\s.*?)```/s);
            if (commandMatch && commandMatch[1]) {
                commandGenerated = commandMatch[1].trim();
            }

            const assistantInteraction: AiChatInteraction = {
                id: generateUniqueId('aai'),
                timestamp: new Date().toISOString(),
                role: 'assistant',
                content: aiResponse,
                commandGenerated: commandGenerated,
                followUpSuggestions: aiResponse.includes('- ') ? aiResponse.split('\n').filter(line => line.startsWith('- ')).map(line => line.substring(2).trim()) : undefined,
            };
            setChatHistory(prev => [...prev, assistantInteraction]);
            addNotification({ type: 'info', message: 'AI Assistant responded to your query.' });

        } catch (error: any) {
            const errorInteraction: AiChatInteraction = {
                id: generateUniqueId('aai'),
                timestamp: new Date().toISOString(),
                role: 'assistant',
                content: `Error: Could not process your request. ${error.message || 'Please try again.'} (Selected model: ${selectedAiModel})`,
                followUpSuggestions: ['Check your API key configuration', 'Try a simpler prompt', 'Change AI model in settings'],
            };
            setChatHistory(prev => [...prev, errorInteraction]);
            addNotification({ type: 'error', message: `AI Assistant error: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsAiThinking(false);
        }
    };

    const handleExecuteAiCommand = async (command: string) => {
        const executionPrompt: AiChatInteraction = {
            id: generateUniqueId('uai'),
            timestamp: new Date().toISOString(),
            role: 'user',
            content: `Executing AI-generated command: ${command}`,
            commandGenerated: command,
        };
        setChatHistory(prev => [...prev, executionPrompt]);
        addNotification({ type: 'info', message: `Executing AI-generated command: ${command}` });
        await executeCommand(command); // Use the global executeCommand
    };

    const handleFollowUp = (suggestion: string) => {
        setCurrentAiPrompt(suggestion);
        // Automatically send follow-up if it's a direct command or query
        if (suggestion.startsWith('demobank') || suggestion.includes('generate') || suggestion.includes('explain')) {
            sendAiPrompt(suggestion);
        }
    };

    const renderChatMessage = (interaction: AiChatInteraction) => {
        const isUser = interaction.role === 'user';
        const msgClasses = `p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-blue-900/30 text-white self-end' : 'bg-gray-800 text-gray-200 self-start'}`;

        let content = interaction.content;
        // Simple markdown for commands and lists (more robust markdown parser could be used)
        content = content.replace(/```(demobank\s.*?)```/gs, (match, cmd) => {
            return `<div class="bg-gray-900/50 p-2 rounded mt-2 font-mono text-cyan-300 text-sm overflow-x-auto">
                        <span class="select-none text-gray-500 mr-2">$</span>${cmd}
                    </div>`;
        });
        content = content.replace(/^- (.*)$/gm, (match, item) => `<li>${item}</li>`);

        return (
            <div key={interaction.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={msgClasses}>
                    <p className="text-xs text-gray-500 mb-1">{isUser ? 'You' : 'AI Assistant'} at {new Date(interaction.timestamp).toLocaleTimeString()}</p>
                    <div className="text-sm prose prose-invert" dangerouslySetInnerHTML={{ __html: content }} />
                    {interaction.commandGenerated && (
                        <div className="mt-2 text-right">
                            <button
                                onClick={() => handleExecuteAiCommand(interaction.commandGenerated!)}
                                className="text-xs py-1 px-3 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50 transition-colors duration-200"
                                disabled={isAiThinking}
                            >
                                Run Command
                            </button>
                        </div>
                    )}
                    {interaction.followUpSuggestions && interaction.followUpSuggestions.length > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                            <strong>Suggestions:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {interaction.followUpSuggestions.map((sug, i) => (
                                    <span key={i} onClick={() => handleFollowUp(sug)} className="cursor-pointer bg-gray-700/50 hover:bg-gray-600/50 px-2 py-1 rounded-full text-xs transition-colors duration-200">
                                        {sug}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card title="AI Chat Assistant" className="flex flex-col h-[700px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Chat with AI</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>Model:</span>
                    <select
                        className="bg-gray-700/50 p-1 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={selectedAiModel}
                        onChange={(e) => {
                            const selected = availableAiModels.find(m => m.modelId === e.target.value);
                            if (selected && !selected.isActive) {
                                addNotification({ type: 'warning', message: `AI Model "${selected.name}" is inactive. Please activate it in settings.` });
                                return;
                            }
                            setSelectedAiModel(e.target.value);
                            addNotification({ type: 'info', message: `AI Model changed to ${selected?.name || e.target.value}.` });
                        }}
                        disabled={isAiThinking}
                    >
                        {availableAiModels.map(model => (
                            <option key={model.id} value={model.modelId} disabled={!model.isActive}>
                                {model.name} {model.isActive ? '' : '(Inactive)'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex-grow flex flex-col p-4 bg-gray-900/50 rounded-lg overflow-y-auto custom-scrollbar">
                {chatHistory.length === 0 ? (
                    <div className="flex-grow flex items-center justify-center text-gray-500 text-center">
                        Start a conversation with the AI assistant. Ask it to generate commands, explain syntax, or debug issues.
                        <br/>
                        Try: "List all pending payments" or "Explain demobank users create command"
                    </div>
                ) : (
                    chatHistory.map(renderChatMessage)
                )}
                {isAiThinking && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-800 text-gray-200 p-3 rounded-lg max-w-[80%] self-start text-sm">
                            <span className="dot-flashing"></span> AI is thinking...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex">
                <textarea
                    value={currentAiPrompt}
                    onChange={e => setCurrentAiPrompt(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendAiPrompt(currentAiPrompt);
                        }
                    }}
                    className="flex-grow h-20 bg-gray-700/50 p-2 rounded-l text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 custom-scrollbar"
                    placeholder="Ask the AI for a command, an explanation, or help debugging..."
                    disabled={isAiThinking}
                />
                <button
                    onClick={() => sendAiPrompt(currentAiPrompt)}
                    disabled={isAiThinking || !currentAiPrompt.trim()}
                    className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-r text-white disabled:opacity-50 transition-colors duration-200"
                >
                    Send
                </button>
            </div>
            {/* Minimal CSS for dot-flashing spinner */}
            <style jsx>{`
                .dot-flashing {
                    position: relative;
                    width: 5px;
                    height: 5px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: 0s;
                    display: inline-block;
                    margin-left: 5px;
                }
                .dot-flashing::before, .dot-flashing::after {
                    content: '';
                    display: inline-block;
                    position: absolute;
                    top: 0;
                }
                .dot-flashing::before {
                    left: -8px;
                    width: 5px;
                    height: 5px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: .2s;
                }
                .dot-flashing::after {
                    left: 8px;
                    width: 5px;
                    height: 5px;
                    border-radius: 5px;
                    background-color: #9880ff;
                    color: #9880ff;
                    animation: dotFlashing 1s infinite alternate;
                    animation-delay: .4s;
                }
                @keyframes dotFlashing {
                    0% { opacity: 0; }
                    50%, 100% { opacity: 1; }
                }
            `}</style>
        </Card>
    );
};


/**
 * Component to display and manage installed CLI plugins.
 */
export const CliPluginManager: React.FC = () => {
    const { addNotification } = useCli();
    const [plugins, setPlugins] = useState<CliPlugin[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [newPluginName, setNewPluginName] = useState('');

    useEffect(() => {
        fetchPlugins();
    }, []);

    const fetchPlugins = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await simulateApiCall('/api/plugins', 'GET');
            if (response.success) {
                setPlugins(response.data);
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to fetch plugins.' });
                addNotification({ type: 'error', message: `Failed to fetch plugins: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error fetching plugins.' });
            addNotification({ type: 'error', message: `Error fetching plugins: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePlugin = async (pluginId: string, newState: boolean) => {
        setIsLoading(true);
        setMessage(null);
        try {
            const response = await simulateApiCall(`/api/plugins/${pluginId}/toggle`, 'POST', { isActive: newState });
            if (response.success) {
                const successMessage = `Plugin ${newState ? 'activated' : 'deactivated'} successfully.`;
                setMessage({ type: 'success', text: successMessage });
                addNotification({ type: 'info', message: successMessage });
                setPlugins(prev => prev.map(p => p.id === pluginId ? { ...p, isActive: newState } : p));
            } else {
                setMessage({ type: 'error', text: response.message || `Failed to ${newState ? 'activate' : 'deactivate'} plugin.` });
                addNotification({ type: 'error', message: `Failed to toggle plugin status: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error toggling plugin.' });
            addNotification({ type: 'error', message: `Error toggling plugin status: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInstallPlugin = async () => {
        if (!newPluginName.trim()) {
            setMessage({ type: 'error', text: 'Plugin name cannot be empty.' });
            return;
        }
        if (plugins.some(p => p.name.toLowerCase() === newPluginName.trim().toLowerCase())) {
            setMessage({ type: 'warning', text: `Plugin "${newPluginName}" is already installed.` });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        try {
            const newPlugin: CliPlugin = {
                id: generateUniqueId('p'),
                name: newPluginName.trim(),
                version: '1.0.0',
                description: `A new plugin for ${newPluginName.trim()} functionality.`,
                commands: [`demobank ${newPluginName.toLowerCase().replace(/\s/g, '-')} new-command`],
                isActive: true,
                installationDate: new Date().toISOString(),
                settingsSchema: {},
                author: 'CLI Marketplace',
            };
            const response = await simulateApiCall('/api/plugins', 'POST', newPlugin);
            if (response.success) {
                const successMessage = `Plugin "${newPluginName}" installed successfully.`;
                setMessage({ type: 'success', text: successMessage });
                addNotification({ type: 'success', message: successMessage });
                setPlugins(prev => [...prev, newPlugin]);
                setNewPluginName('');
            } else {
                setMessage({ type: 'error', text: response.message || 'Failed to install plugin.' });
                addNotification({ type: 'error', message: `Failed to install plugin: ${response.message || 'Unknown error.'}` });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Error installing plugin.' });
            addNotification({ type: 'error', message: `Error installing plugin: ${error.message || 'Unknown error.'}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="CLI Plugin Manager" className="flex flex-col h-[500px]">
            <div className="flex-grow flex flex-col p-4 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Installed Plugins</h3>
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : message.type === 'error' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                        {message.text}
                    </div>
                )}
                {isLoading && <p className="text-gray-500">Loading plugins...</p>}
                {plugins.length === 0 && !isLoading && <p className="text-gray-500">No plugins installed.</p>}
                <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {plugins.map(plugin => (
                        <div key={plugin.id} className="bg-gray-900/30 p-3 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-white text-md">{plugin.name} <span className="text-gray-500 text-xs">v{plugin.version}</span></h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${plugin.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                                    {plugin.isActive ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs">{plugin.description}</p>
                            <p className="text-gray-500 text-xs mt-2">Commands: {plugin.commands.join(', ')}</p>
                            <p className="text-gray-500 text-xs">Author: {plugin.author} | Installed: {new Date(plugin.installationDate).toLocaleDateString()}</p>
                            <div className="mt-3 flex justify-end">
                                <button
                                    onClick={() => handleTogglePlugin(plugin.id, !plugin.isActive)}
                                    className={`text-sm px-2 py-1 rounded ${plugin.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} transition-colors duration-200`}
                                >
                                    {plugin.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Install New Plugin</h3>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Enter plugin name from marketplace..."
                        className="flex-grow bg-gray-700/50 p-2 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newPluginName}
                        onChange={(e) => setNewPluginName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleInstallPlugin();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleInstallPlugin}
                        className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded text-white disabled:opacity-50 transition-colors duration-200"
                        disabled={isLoading || !newPluginName.trim()}
                    >
                        Install Plugin
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Simulates installing a plugin by name. In a real app, this would query a plugin marketplace.</p>
            </div>
        </Card>
    );
};

/**
 * Provides a basic documentation viewer for CLI commands.
 */
export const CliDocumentationViewer: React.FC = () => {
    const [selectedCommand, setSelectedCommand] = useState<string>('demobank');
    const [isLoading, setIsLoading] = useState(false);
    const [documentationContent, setDocumentationContent] = useState<string | null>(null);

    const commands = [
        'demobank',
        'demobank payments',
        'demobank payments list',
        'demobank payments approve',
        'demobank users',
        'demobank users create',
        'demobank users show',
        'demobank scripts',
        'demobank scripts save',
        'demobank jobs',
        'demobank jobs schedule',
        'demobank config',
        'demobank config get',
        'demobank plugins',
        'demobank ai',
        'demobank audit',
        'demobank metrics',
        'demobank help',
        'demobank version',
    ];

    const fetchDocumentation = useCallback(async (cmd: string) => {
        setIsLoading(true);
        setDocumentationContent(null);
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 200)); // Simulate API call

        let content = '';
        switch (cmd) {
            case 'demobank':
                content = `# NAME
    \`demobank\` - Command-line interface for Demobank services.

# DESCRIPTION
    The 'demobank' CLI is a powerful tool to manage your bank's resources.
    It allows you to interact with payments, users, accounts, and more.

# COMMANDS
* \`payments\`    Manage payment orders.
* \`users\`       Manage user accounts.
* \`accounts\`    Manage bank accounts.
* \`transactions\` View transaction history.
* \`scripts\`     Manage CLI scripts.
* \`jobs\`        Manage scheduled CLI jobs.
* \`config\`      Manage CLI configuration.
* \`plugins\`     Manage CLI plugins.
* \`ai\`          Interact with AI assistant.
* \`audit\`       View audit logs.
* \`metrics\`     View resource metrics.
* \`help\`        Get help on commands.
* \`version\`     Display CLI version.

# SEE ALSO
    \`demobank help <command>\``;
                break;
            case 'demobank payments':
                content = `# NAME
    \`demobank payments\` - Manage payment orders.

# DESCRIPTION
    Provides subcommands to list, approve, create, and manage payment orders.

# SUBCOMMANDS
* \`list\`        List payment orders.
* \`approve\`     Approve a pending payment order.
* \`create\`      Create a new payment order.
* \`show\`        Show details of a specific payment order.

# SEE ALSO
    \`demobank payments list --help\`
    \`demobank payments approve --help\``;
                break;
            case 'demobank payments list':
                content = `# NAME
    \`demobank payments list\` - List payment orders.

# SYNOPSIS
    \`demobank payments list [--status=STATUS] [--amount-gte=AMOUNT] [--amount-lte=AMOUNT] [--counterparty=NAME] [--json]\`

# DESCRIPTION
    Retrieves a list of payment orders based on specified criteria.

# OPTIONS
* \`--status=STATUS\`
    Filter payments by status (e.g., \`pending\`, \`approved\`, \`rejected\`, \`all\`). Default is 'pending'.
* \`--amount-gte=AMOUNT\`
    Filter payments with amount greater than or equal to AMOUNT.
* \`--amount-lte=AMOUNT\`
    Filter payments with amount less than or equal to AMOUNT.
* \`--counterparty=NAME\`
    Filter payments by counterparty name.
* \`--json\`
    Output results in JSON format.

# EXAMPLES
    \`\`\`
    demobank payments list
    demobank payments list --status=approved
    demobank payments list --amount-lte=100 --status=pending --json
    demobank payments list --counterparty="Cloud Services Inc."
    \`\`\``;
                break;
            case 'demobank payments approve':
                content = `# NAME
    \`demobank payments approve\` - Approve a pending payment order.

# SYNOPSIS
    \`demobank payments approve <payment_id> [--reason=REASON] [--force]\`

# DESCRIPTION
    Approves a specific payment order that is currently in 'pending' status.
    This action typically requires appropriate permissions.

# ARGUMENTS
* \`payment_id\`
    The unique ID of the payment order to approve.

# OPTIONS
* \`--reason=REASON\`
    A short explanation for approving the payment.
* \`--force\`
    Force approval even if there are minor warnings.

# EXAMPLES
    \`\`\`
    demobank payments approve po_001
    demobank payments approve po_002 --reason="Emergency payment"
    \`\`\``;
                break;
            case 'demobank users':
                content = `# NAME
    \`demobank users\` - Manage user accounts.

# DESCRIPTION
    Provides subcommands to create, list, show, update, and delete user accounts.

# SUBCOMMANDS
* \`list\`        List user accounts.
* \`create\`      Create a new user account.
* \`show\`        Show details of a specific user.
* \`update\`      Update an existing user account.
* \`delete\`      Delete a user account.

# SEE ALSO
    \`demobank users list --help\``;
                break;
            case 'demobank users create':
                content = `# NAME
    \`demobank users create\` - Create a new user account.

# SYNOPSIS
    \`demobank users create --name=NAME --email=EMAIL --role=ROLE [--status=STATUS] [--password=PASSWORD]\`

# DESCRIPTION
    Creates a new user account in the Demobank system.

# OPTIONS
* \`--name=NAME\` (required)
    The full name of the user.
* \`--email=EMAIL\` (required)
    The primary email address of the user (must be unique).
* \`--role=ROLE\` (required)
    The role of the user (e.g., \`customer\`, \`employee\`, \`admin\`).
* \`--status=STATUS\`
    The initial status of the user (e.g., \`active\`, \`inactive\`, \`pending\`). Default is 'active'.
* \`--password=PASSWORD\`
    Initial password for the user. If not provided, a temporary one will be generated.

# EXAMPLES
    \`\`\`
    demobank users create --name="Jane Doe" --email="jane@example.com" --role=customer
    demobank users create --name="Admin User" --email="admin@demobank.com" --role=admin --password="SecurePass123"
    \`\`\``;
                break;
            case 'demobank users show':
                content = `# NAME
    \`demobank users show\` - Show details of a specific user.

# SYNOPSIS
    \`demobank users show <user_id> [--json]\`

# DESCRIPTION
    Retrieves and displays the detailed information for a given user ID.

# ARGUMENTS
* \`user_id\`
    The unique ID of the user to retrieve.

# OPTIONS
* \`--json\`
    Output results in JSON format.

# EXAMPLES
    \`\`\`
    demobank users show user_007
    demobank