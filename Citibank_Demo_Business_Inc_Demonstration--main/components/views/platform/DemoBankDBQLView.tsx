import React, { useState } from 'react';
import Card from '../../Card';

// Add new imports as needed for React features
import { useEffect, useCallback, useMemo, useRef } from 'react';

// SECTION 1: INTERFACES AND TYPES
// =====================================================================================================================
// Interfaces for DBQL structure, mock data, and application state.
// This section will define types for database schemas, query results, history, user settings, etc.

export interface DBQLColumn {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
    enum?: string[]; // For enum types
    description: string;
    isNullable?: boolean;
    isPrimaryKey?: boolean;
    isIndexed?: boolean;
}

export interface DBQLTable {
    name: string;
    columns: DBQLColumn[];
    description: string;
    exampleRowCount: number;
}

export interface DBQLSchema {
    tables: DBQLTable[];
}

export interface DBQLQueryResult {
    headers: string[];
    rows: (string | number | boolean | null)[][];
    queryTimeMs?: number;
    rowCount?: number;
    error?: string;
    isCached?: boolean;
}

export interface QueryHistoryEntry {
    id: string;
    query: string;
    timestamp: string;
    status: 'success' | 'error';
    durationMs: number;
    rowCount?: number;
    errorDetails?: string;
}

export interface QueryFavoriteEntry {
    id: string;
    name: string;
    query: string;
    description?: string;
    createdAt: string;
    tags?: string[];
}

export interface UserPreferences {
    theme: 'dark' | 'light';
    editorFontSize: number;
    autoRunDelayMs: number;
    enableQueryCaching: boolean;
    showLineNumbers: boolean;
    resultPageSize: number;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: string;
    read: boolean;
    action?: {
        label: string;
        callback: () => void;
    };
}

export interface ChartDataSeries {
    name: string;
    data: { x: any, y: number }[];
    type: 'bar' | 'line' | 'area' | 'pie';
}

export interface ChartConfig {
    title: string;
    type: 'bar' | 'line' | 'area' | 'pie';
    xAxisLabel?: string;
    yAxisLabel?: string;
    dataSeries: ChartDataSeries[];
}

// SECTION 2: CONSTANTS AND CONFIGURATION
// =====================================================================================================================
// Centralized definitions for messages, default settings, and application-wide configurations.

export const APP_NAME = "Demo Bank DBQL Explorer";
export const DEFAULT_EDITOR_FONT_SIZE = 14;
export const DEFAULT_RESULT_PAGE_SIZE = 10;
export const MAX_QUERY_HISTORY_ENTRIES = 50;
export const MOCK_API_LATENCY_MS = 800; // Base latency for mock API calls
export const MOCK_ERROR_RATE_PERCENT = 5; // 5% chance of a mock query error

export const SYNTAX_HIGHLIGHT_KEYWORDS = ['FROM', 'SELECT', 'WHERE', 'AND', 'OR', 'ORDER', 'BY', 'DESC', 'ASC', 'LIMIT', 'OFFSET', 'GROUP', 'JOIN', 'ON', 'GET', 'INSERT', 'UPDATE', 'DELETE', 'VALUES', 'SET', 'INTO'];
export const SYNTAX_HIGHLIGHT_OPERATORS = ['=', '>', '<', '>=', '<=', '!=', 'LIKE', 'IN', 'IS', 'NOT', '+', '-', '*', '/'];
export const SYNTAX_HIGHLIGHT_FUNCTIONS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DATE', 'NOW', 'UPPER', 'LOWER'];

export const DBQL_ERROR_MESSAGES = {
    SYNTAX_ERROR: "Syntax Error: The query provided does not follow DBQL rules.",
    TABLE_NOT_FOUND: "Semantic Error: One or more tables in the query do not exist.",
    COLUMN_NOT_FOUND: "Semantic Error: One or more columns in the query do not exist in the specified table(s).",
    PERMISSION_DENIED: "Authorization Error: You do not have permission to perform this query.",
    QUERY_TIMEOUT: "Execution Error: The query timed out. Please try a simpler query or adjust parameters.",
    GENERIC_ERROR: "An unexpected error occurred during query execution.",
    EMPTY_QUERY: "Query cannot be empty. Please enter a DBQL statement.",
    INVALID_LIMIT: "LIMIT clause must be a positive integer."
};

export const MOCK_SCHEMA: DBQLSchema = {
    tables: [
        {
            name: 'accounts',
            description: 'Customer bank accounts information.',
            exampleRowCount: 1500,
            columns: [
                { name: 'id', type: 'string', description: 'Unique account identifier', isPrimaryKey: true, isIndexed: true },
                { name: 'name', type: 'string', description: 'Account name (e.g., "Main Checking")', isIndexed: true },
                { name: 'type', type: 'enum', enum: ['Checking', 'Savings', 'Credit Card', 'Loan'], description: 'Type of account', isIndexed: true },
                { name: 'balance', type: 'number', description: 'Current account balance' },
                { name: 'currency', type: 'string', description: 'Currency code (e.g., USD, EUR)', isIndexed: true },
                { name: 'status', type: 'enum', enum: ['Active', 'Inactive', 'Closed'], description: 'Account status', isIndexed: true },
                { name: 'openedDate', type: 'date', description: 'Date the account was opened' },
                { name: 'customerId', type: 'string', description: 'Foreign key to customers table', isIndexed: true },
            ],
        },
        {
            name: 'transactions',
            description: 'Financial transactions for all accounts.',
            exampleRowCount: 500000,
            columns: [
                { name: 'id', type: 'string', description: 'Unique transaction identifier', isPrimaryKey: true, isIndexed: true },
                { name: 'accountId', type: 'string', description: 'ID of the associated account', isIndexed: true },
                { name: 'date', type: 'date', description: 'Date and time of the transaction' },
                { name: 'description', type: 'string', description: 'Brief description of the transaction' },
                { name: 'amount', type: 'number', description: 'Transaction amount' },
                { name: 'type', type: 'enum', enum: ['Credit', 'Debit'], description: 'Type of transaction (credit or debit)', isIndexed: true },
                { name: 'category', type: 'enum', enum: ['Shopping', 'Food', 'Transport', 'Bills', 'Salary', 'Investment', 'Other', 'Entertainment', 'Healthcare', 'Utilities'], description: 'Transaction category', isIndexed: true },
                { name: 'merchant', type: 'string', description: 'Name of the merchant involved' },
                { name: 'status', type: 'enum', enum: ['Completed', 'Pending', 'Failed', 'Refunded'], description: 'Transaction status', isIndexed: true },
            ],
        },
        {
            name: 'customers',
            description: 'Customer demographic and contact information.',
            exampleRowCount: 10000,
            columns: [
                { name: 'id', type: 'string', description: 'Unique customer identifier', isPrimaryKey: true, isIndexed: true },
                { name: 'firstName', type: 'string', description: 'Customer first name' },
                { name: 'lastName', type: 'string', description: 'Customer last name' },
                { name: 'email', type: 'string', description: 'Customer email address', isIndexed: true },
                { name: 'phone', type: 'string', description: 'Customer phone number' },
                { name: 'address', type: 'string', description: 'Customer street address' },
                { name: 'city', type: 'string', description: 'Customer city' },
                { name: 'country', type: 'string', description: 'Customer country', isIndexed: true },
                { name: 'dateJoined', type: 'date', description: 'Date the customer joined the bank' },
                { name: 'loyaltyLevel', type: 'enum', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], description: 'Customer loyalty program level', isIndexed: true },
            ],
        },
        {
            name: 'anomalies',
            description: 'Detected suspicious or unusual activities.',
            exampleRowCount: 2000,
            columns: [
                { name: 'id', type: 'string', description: 'Unique anomaly identifier', isPrimaryKey: true, isIndexed: true },
                { name: 'transactionId', type: 'string', isNullable: true, description: 'Optional: ID of the associated transaction', isIndexed: true },
                { name: 'accountId', type: 'string', isNullable: true, description: 'Optional: ID of the associated account', isIndexed: true },
                { name: 'type', type: 'enum', enum: ['Fraud', 'Unusual Activity', 'System Error', 'Large Transaction'], description: 'Type of anomaly', isIndexed: true },
                { name: 'severity', type: 'enum', enum: ['Low', 'Medium', 'High', 'Critical'], description: 'Severity level of the anomaly', isIndexed: true },
                { name: 'details', type: 'string', description: 'Detailed description of the anomaly' },
                { name: 'riskScore', type: 'number', description: 'Calculated risk score' },
                { name: 'detectionDate', type: 'date', description: 'Date and time the anomaly was detected' },
                { name: 'status', type: 'enum', enum: ['Detected', 'Under Review', 'Resolved', 'False Positive', 'Escalated'], description: 'Current status of the anomaly', isIndexed: true },
            ],
        },
        {
            name: 'loans',
            description: 'Loan accounts and their details.',
            exampleRowCount: 500,
            columns: [
                { name: 'id', type: 'string', description: 'Unique loan identifier', isPrimaryKey: true, isIndexed: true },
                { name: 'customerId', type: 'string', description: 'Foreign key to customers table', isIndexed: true },
                { name: 'accountId', type: 'string', description: 'Associated bank account for payments/disbursement', isIndexed: true },
                { name: 'amount', type: 'number', description: 'Original loan amount' },
                { name: 'interestRate', type: 'number', description: 'Annual interest rate' },
                { name: 'termMonths', type: 'number', description: 'Loan term in months' },
                { name: 'startDate', type: 'date', description: 'Loan disbursement date' },
                { name: 'endDate', type: 'date', description: 'Expected loan end date' },
                { name: 'status', type: 'enum', enum: ['Approved', 'Disbursed', 'Repaid', 'Defaulted', 'Pending'], description: 'Current status of the loan', isIndexed: true },
                { name: 'outstandingBalance', type: 'number', description: 'Remaining balance on the loan' },
                { name: 'nextPaymentDate', type: 'date', description: 'Date of the next scheduled payment' },
                { name: 'paymentFrequency', type: 'enum', enum: ['Monthly', 'Bi-Weekly'], description: 'How often payments are made' },
            ],
        },
    ],
};

// SECTION 3: UTILITY FUNCTIONS
// =====================================================================================================================
// Helper functions for common tasks like data generation, ID generation, query parsing, validation, and formatting.

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'date-time' = 'date-time'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid Date';

    switch (format) {
        case 'short': return d.toLocaleDateString();
        case 'long': return d.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        case 'date-time': return d.toLocaleString();
        default: return d.toISOString();
    }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// Simulated DBQL Parser (simplified for demo purposes)
export const DBQLParser = {
    /**
     * Attempts to parse a DBQL query into its components.
     * This is a highly simplified parser and not robust for production.
     * @param query The DBQL query string.
     * @returns An object representing the parsed query or null if parsing fails.
     */
    parse: (query: string): { type: 'SELECT' | 'GET' | 'INSERT' | 'UPDATE' | 'DELETE', table: string, fields?: string[], conditions?: string, orderBy?: { field: string, direction: 'ASC' | 'DESC' }, limit?: number, values?: (string | number | boolean)[], updates?: Record<string, any> } | null => {
        const upperQuery = query.toUpperCase().trim();

        // SELECT / GET
        const selectMatch = upperQuery.match(/FROM\s+(\w+)\s+(SELECT|GET)\s+([\w,\s\*]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)\s+(ASC|DESC))?(?:\s+LIMIT\s+(\d+))?/);
        if (selectMatch) {
            const [, table, type, fieldsStr, conditions, orderByField, orderByDirection, limit] = selectMatch;
            const fields = fieldsStr.split(',').map(f => f.trim()).filter(Boolean);
            return {
                type: type as 'SELECT' | 'GET',
                table,
                fields: fields.includes('*') ? ['*'] : fields,
                conditions,
                orderBy: orderByField ? { field: orderByField, direction: (orderByDirection || 'ASC') as 'ASC' | 'DESC' } : undefined,
                limit: limit ? parseInt(limit, 10) : undefined
            };
        }

        // INSERT (very basic)
        const insertMatch = upperQuery.match(/INSERT INTO\s+(\w+)\s+VALUES\s*\((.+?)\)/i);
        if (insertMatch) {
            const [, table, valuesStr] = insertMatch;
            const values = valuesStr.split(',').map(s => {
                const trimmed = s.trim();
                if (trimmed.startsWith("'") && trimmed.endsWith("'")) return trimmed.slice(1, -1); // Remove quotes for strings
                if (!isNaN(Number(trimmed))) return Number(trimmed); // Parse numbers
                if (trimmed.toLowerCase() === 'true') return true;
                if (trimmed.toLowerCase() === 'false') return false;
                if (trimmed.toLowerCase() === 'null') return null;
                return trimmed; // Fallback for other types or unquoted strings
            }).filter(Boolean);
            return {
                type: 'INSERT',
                table,
                values: values as (string | number | boolean)[]
            };
        }

        // UPDATE (very basic)
        const updateMatch = upperQuery.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?/i);
        if (updateMatch) {
            const [, table, setClause, conditions] = updateMatch;
            const updates: Record<string, any> = {};
            setClause.split(',').forEach(part => {
                const [key, value] = part.split('=').map(s => s.trim());
                if (key && value) {
                    const parsedValue = value.replace(/^['"]|['"]$/g, ''); // rudimentary parsing
                    updates[key] = !isNaN(Number(parsedValue)) ? Number(parsedValue) : parsedValue;
                }
            });
            return {
                type: 'UPDATE',
                table,
                updates,
                conditions
            };
        }

        // DELETE (very basic)
        const deleteMatch = upperQuery.match(/DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?/i);
        if (deleteMatch) {
            const [, table, conditions] = deleteMatch;
            return {
                type: 'DELETE',
                table,
                conditions
            };
        }

        return null;
    },

    /**
     * Provides autocompletion suggestions based on the current query fragment.
     * @param query The current query string.
     * @param cursorPosition The current cursor position.
     * @param schema The database schema.
     * @returns An array of suggestion strings.
     */
    getSuggestions: (query: string, cursorPosition: number, schema: DBQLSchema): string[] => {
        const suggestions: Set<string> = new Set();
        const textBeforeCursor = query.substring(0, cursorPosition);
        const currentFragmentMatch = textBeforeCursor.match(/[\w\d]*$/); // Last word before cursor
        const currentFragment = currentFragmentMatch ? currentFragmentMatch[0].toLowerCase() : '';

        // Keyword suggestions
        SYNTAX_HIGHLIGHT_KEYWORDS.forEach(kw => {
            if (kw.toLowerCase().startsWith(currentFragment)) {
                suggestions.add(kw);
            }
        });

        // Table name suggestions
        schema.tables.forEach(table => {
            if (table.name.toLowerCase().startsWith(currentFragment)) {
                suggestions.add(table.name);
            }
        });

        // Column name suggestions (context-aware, but simplified)
        const fromMatch = textBeforeCursor.toUpperCase().match(/FROM\s+(\w+)\s*$/); // Trying to get table name right before cursor
        let currentTableName: string | undefined;
        if (fromMatch) {
            currentTableName = fromMatch[1];
        } else {
            // Broader check for table name anywhere in the FROM clause
            const anyFromMatch = query.toUpperCase().match(/FROM\s+(\w+)/);
            if (anyFromMatch) currentTableName = anyFromMatch[1];
        }

        if (currentTableName) {
            const table = schema.tables.find(t => t.name.toUpperCase() === currentTableName);
            if (table) {
                table.columns.forEach(col => {
                    if (col.name.toLowerCase().startsWith(currentFragment)) {
                        suggestions.add(col.name);
                    }
                });
            }
        }
        
        // Function suggestions
        SYNTAX_HIGHLIGHT_FUNCTIONS.forEach(func => {
            if (func.toLowerCase().startsWith(currentFragment)) {
                suggestions.add(func + '('); // Suggest with opening paren
            }
        });

        return Array.from(suggestions).sort();
    }
};

// Simulated DBQL Validator
export const DBQLValidator = {
    /**
     * Validates a parsed query against the schema.
     * @param parsedQuery The parsed query object.
     * @param schema The database schema.
     * @returns True if valid, false otherwise.
     */
    validate: (parsedQuery: ReturnType<typeof DBQLParser.parse>, schema: DBQLSchema): { isValid: boolean, error?: string } => {
        if (!parsedQuery) {
            return { isValid: false, error: DBQL_ERROR_MESSAGES.SYNTAX_ERROR };
        }

        const table = schema.tables.find(t => t.name.toLowerCase() === parsedQuery.table.toLowerCase());
        if (!table) {
            return { isValid: false, error: DBQL_ERROR_MESSAGES.TABLE_NOT_FOUND };
        }

        const tableColumnNames = new Set(table.columns.map(c => c.name.toLowerCase()));

        // Validate fields for SELECT/GET
        if (parsedQuery.type === 'SELECT' || parsedQuery.type === 'GET') {
            if (parsedQuery.fields && !parsedQuery.fields.includes('*')) {
                for (const field of parsedQuery.fields) {
                    if (!tableColumnNames.has(field.toLowerCase())) {
                        return { isValid: false, error: `${DBQL_ERROR_MESSAGES.COLUMN_NOT_FOUND}: '${field}' in table '${table.name}'.` };
                    }
                }
            }
        }
        
        // Basic condition parsing and validation
        if (parsedQuery.conditions) {
            // Simplified: check for existence of column names in conditions, ignoring operators and literals
            const conditionTokens = parsedQuery.conditions.split(/['"\s.()=><!+\-*/]+/); // Split by operators, spaces, quotes, parens
            for (const token of conditionTokens) {
                const trimmedToken = token.trim();
                if (!trimmedToken) continue;

                if (SYNTAX_HIGHLIGHT_KEYWORDS.includes(trimmedToken.toUpperCase()) ||
                    SYNTAX_HIGHLIGHT_OPERATORS.includes(trimmedToken.toUpperCase()) ||
                    SYNTAX_HIGHLIGHT_FUNCTIONS.some(f => trimmedToken.toUpperCase().startsWith(f))) {
                    continue; // Skip keywords, operators, and functions
                }
                
                // If it's not a number and not a quoted string, assume it's a column and validate
                if (!(/^\d+(\.\d+)?$/.test(trimmedToken) || trimmedToken.startsWith("'") || trimmedToken.startsWith('"'))) {
                    if (!tableColumnNames.has(trimmedToken.toLowerCase())) {
                        return { isValid: false, error: `${DBQL_ERROR_MESSAGES.COLUMN_NOT_FOUND}: '${trimmedToken}' in table '${table.name}' within WHERE clause.` };
                    }
                }
            }
        }

        // Validate ORDER BY field
        if (parsedQuery.orderBy) {
            if (!tableColumnNames.has(parsedQuery.orderBy!.field.toLowerCase())) {
                return { isValid: false, error: `${DBQL_ERROR_MESSAGES.COLUMN_NOT_FOUND}: '${parsedQuery.orderBy.field}' in table '${table.name}' for ORDER BY clause.` };
            }
        }

        // Validate LIMIT
        if (parsedQuery.limit && parsedQuery.limit <= 0) {
            return { isValid: false, error: DBQL_ERROR_MESSAGES.INVALID_LIMIT };
        }

        return { isValid: true };
    }
};

// SECTION 4: MOCK DATABASE & API SERVICES
// =====================================================================================================================
// This section simulates a backend API interaction for fetching data, executing queries,
// and managing other application-specific data like history and favorites.

export class MockAuthService {
    private static isAuthenticated: boolean = true; // Assume authenticated by default
    private static userRole: 'admin' | 'user' = 'admin';

    static login(username: string, password: string): Promise<boolean> {
        return new Promise(resolve => {
            setTimeout(() => {
                if (username === 'admin' && password === 'password') {
                    MockAuthService.isAuthenticated = true;
                    MockAuthService.userRole = 'admin';
                    resolve(true);
                } else if (username === 'user' && password === 'password') {
                    MockAuthService.isAuthenticated = true;
                    MockAuthService.userRole = 'user';
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, MOCK_API_LATENCY_MS / 2);
        });
    }

    static logout(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                MockAuthService.isAuthenticated = false;
                MockAuthService.userRole = 'user'; // Default role for unauthenticated
                resolve();
            }, MOCK_API_LATENCY_MS / 2);
        });
    }

    static checkAuth(): boolean {
        return MockAuthService.isAuthenticated;
    }

    static getUserRole(): 'admin' | 'user' {
        return MockAuthService.userRole;
    }
}

export class MockDBService {
    private static _data: Record<string, any[]> = {};
    private static _initialized: boolean = false;
    private static _queryCache: Map<string, DBQLQueryResult> = new Map();

    private static generateRandomData(): void {
        if (MockDBService._initialized) return;

        // Helper to generate random dates
        const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());

        // Accounts
        const accounts: any[] = [];
        const accountTypes = MOCK_SCHEMA.tables.find(t => t.name === 'accounts')?.columns.find(c => c.name === 'type')?.enum || [];
        const accountStatuses = MOCK_SCHEMA.tables.find(t => t.name === 'accounts')?.columns.find(c => c.name === 'status')?.enum || [];
        for (let i = 0; i < 1500; i++) {
            const id = generateUUID();
            accounts.push({
                id: id,
                name: `Account ${i + 1}`,
                type: accountTypes[Math.floor(Math.random() * accountTypes.length)],
                balance: parseFloat((Math.random() * 100000).toFixed(2)),
                currency: 'USD',
                status: accountStatuses[Math.floor(Math.random() * accountStatuses.length)],
                openedDate: getRandomDate(fiveYearsAgo, oneYearAgo).toISOString().split('T')[0],
                customerId: `cust-${Math.floor(Math.random() * 10000)}` // Will link to customers later
            });
        }
        MockDBService._data['accounts'] = accounts;

        // Customers
        const customers: any[] = [];
        const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
        const loyaltyLevels = MOCK_SCHEMA.tables.find(t => t.name === 'customers')?.columns.find(c => c.name === 'loyaltyLevel')?.enum || [];
        for (let i = 0; i < 10000; i++) {
            const id = `cust-${i}`;
            customers.push({
                id: id,
                firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
                lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
                email: `user${i}@example.com`,
                phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                address: `${Math.floor(Math.random() * 999) + 1} Main St`,
                city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
                country: 'USA',
                dateJoined: getRandomDate(fiveYearsAgo, oneYearAgo).toISOString().split('T')[0],
                loyaltyLevel: loyaltyLevels[Math.floor(Math.random() * loyaltyLevels.length)],
            });
        }
        MockDBService._data['customers'] = customers;

        // Update customerId for accounts
        MockDBService._data['accounts'].forEach(acc => {
            acc.customerId = customers[Math.floor(Math.random() * customers.length)].id;
        });

        // Transactions
        const transactions: any[] = [];
        const transactionTypes = MOCK_SCHEMA.tables.find(t => t.name === 'transactions')?.columns.find(c => c.name === 'type')?.enum || [];
        const categories = MOCK_SCHEMA.tables.find(t => t.name === 'transactions')?.columns.find(c => c.name === 'category')?.enum || [];
        const merchants = ['Amazon', 'Walmart', 'Starbucks', 'Netflix', 'Shell', 'Local Grocer', 'Online Store', 'Pharmacy', 'Restaurant'];
        const transactionStatuses = MOCK_SCHEMA.tables.find(t => t.name === 'transactions')?.columns.find(c => c.name === 'status')?.enum || [];

        for (let i = 0; i < 50000; i++) { // Generating fewer for initial load
            const account = accounts[Math.floor(Math.random() * accounts.length)];
            const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
            const amount = parseFloat((Math.random() * 1000).toFixed(2));
            transactions.push({
                id: generateUUID(),
                accountId: account.id,
                date: getRandomDate(oneYearAgo, today).toISOString(),
                description: `${type} for ${merchants[Math.floor(Math.random() * merchants.length)]}`,
                amount: type === 'Debit' ? -amount : amount,
                type: type,
                category: categories[Math.floor(Math.random() * categories.length)],
                merchant: merchants[Math.floor(Math.random() * merchants.length)],
                status: transactionStatuses[Math.floor(Math.random() * transactionStatuses.length)],
            });
        }
        MockDBService._data['transactions'] = transactions;

        // Anomalies
        const anomalies: any[] = [];
        const anomalyTypes = MOCK_SCHEMA.tables.find(t => t.name === 'anomalies')?.columns.find(c => c.name === 'type')?.enum || [];
        const anomalySeverities = MOCK_SCHEMA.tables.find(t => t.name === 'anomalies')?.columns.find(c => c.name === 'severity')?.enum || [];
        const anomalyStatuses = MOCK_SCHEMA.tables.find(t => t.name === 'anomalies')?.columns.find(c => c.name === 'status')?.enum || [];
        for (let i = 2000; i > 0; i--) { // Generating 2000 anomalies
            const transaction = transactions[Math.floor(Math.random() * transactions.length)];
            anomalies.push({
                id: generateUUID(),
                transactionId: Math.random() > 0.3 ? transaction.id : null, // Not all anomalies linked to specific transaction
                accountId: Math.random() > 0.1 ? transaction.accountId : accounts[Math.floor(Math.random() * accounts.length)].id,
                type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
                severity: anomalySeverities[Math.floor(Math.random() * anomalySeverities.length)],
                details: `Unusual activity detected for transaction ${transaction.id || ''}.`,
                riskScore: Math.floor(Math.random() * 100) + 1,
                detectionDate: getRandomDate(new Date(oneYearAgo.getTime() + (today.getTime() - oneYearAgo.getTime()) / 2), today).toISOString(),
                status: anomalyStatuses[Math.floor(Math.random() * anomalyStatuses.length)],
            });
        }
        MockDBService._data['anomalies'] = anomalies;

        // Loans
        const loans: any[] = [];
        const loanStatuses = MOCK_SCHEMA.tables.find(t => t.name === 'loans')?.columns.find(c => c.name === 'status')?.enum || [];
        const paymentFrequencies = MOCK_SCHEMA.tables.find(t => t.name === 'loans')?.columns.find(c => c.name === 'paymentFrequency')?.enum || [];
        for (let i = 0; i < 500; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const customerAccounts = accounts.filter(a => a.customerId === customer.id);
            const associatedAccountId = customerAccounts.length > 0 ? customerAccounts[Math.floor(Math.random() * customerAccounts.length)].id : accounts[Math.floor(Math.random() * accounts.length)].id;
            const amount = parseFloat((Math.random() * 100000 + 5000).toFixed(2));
            const termMonths = [12, 24, 36, 48, 60, 120, 180, 240, 360][Math.floor(Math.random() * 9)];
            const startDate = getRandomDate(fiveYearsAgo, today);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + termMonths, startDate.getDate());
            const outstandingBalance = parseFloat((amount * (0.2 + Math.random() * 0.8)).toFixed(2)); // Remaining balance
            loans.push({
                id: generateUUID(),
                customerId: customer.id,
                accountId: associatedAccountId,
                amount: amount,
                interestRate: parseFloat((Math.random() * 10).toFixed(2)),
                termMonths: termMonths,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                status: loanStatuses[Math.floor(Math.random() * loanStatuses.length)],
                outstandingBalance: outstandingBalance,
                nextPaymentDate: getRandomDate(today, new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())).toISOString().split('T')[0],
                paymentFrequency: paymentFrequencies[Math.floor(Math.random() * paymentFrequencies.length)],
            });
        }
        MockDBService._data['loans'] = loans;

        MockDBService._initialized = true;
        console.log("Mock database initialized with data.");
    }

    /**
     * Helper to safely evaluate conditions. This is still not production-safe.
     */
    private static evaluateCondition(row: any, conditionString: string, tableName: string): boolean {
        let evalString = conditionString;
        const tableSchema = MOCK_SCHEMA.tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        const columnNames = tableSchema ? tableSchema.columns.map(c => c.name) : [];

        // Replace column names with row['columnName']
        for (const colName of columnNames) {
            evalString = evalString.replace(new RegExp(`\\b${colName}\\b`, 'g'), `row['${colName}']`);
        }

        // Replace SQL operators with JS operators
        evalString = evalString.replace(/=\s*'([^']+)'/g, " === '$1'");
        evalString = evalString.replace(/=\s*(\d+(\.\d+)?)/g, " === $1");
        evalString = evalString.replace(/!=\s*'([^']+)'/g, " !== '$1'");
        evalString = evalString.replace(/!=\s*(\d+(\.\d+)?)/g, " !== $1");
        evalString = evalString.replace(/<\s*(\d+(\.\d+)?)/g, " < $1");
        evalString = evalString.replace(/>\s*(\d+(\.\d+)?)/g, " > $1");
        evalString = evalString.replace(/<=\s*(\d+(\.\d+)?)/g, " <= $1");
        evalString = evalString.replace(/>=\s*(\d+(\.\d+)?)/g, " >= $1");
        evalString = evalString.replace(/LIKE\s*'([^']+)'/gi, ".toString().toLowerCase().includes('$1'.toLowerCase())");
        evalString = evalString.replace(/\bIS\s+NOT\s+NULL\b/gi, " !== null && $1 !== undefined");
        evalString = evalString.replace(/\bIS\s+NULL\b/gi, " === null || $1 === undefined");
        evalString = evalString.replace(/\bAND\b/gi, " && ");
        evalString = evalString.replace(/\bOR\b/gi, " || ");

        // Basic date string comparison assuming ISO format and comparing as timestamps
        evalString = evalString.replace(/new Date\((row\['[^']+?'\])\)/g, `(new Date($1)).getTime()`);
        evalString = evalString.replace(/new Date\('([^']+)'\)/g, `(new Date('$1')).getTime()`);


        try {
            return eval(evalString);
        } catch (e) {
            console.error("Error evaluating condition string:", evalString, e);
            return false;
        }
    }


    /**
     * Executes a DBQL query against the mock data.
     * @param query The DBQL query string.
     * @param enableCache If true, tries to fetch from cache or stores result in cache.
     * @returns A promise resolving to DBQLQueryResult.
     */
    static async executeQuery(query: string, enableCache: boolean = false): Promise<DBQLQueryResult> {
        if (!MockDBService._initialized) {
            MockDBService.generateRandomData();
        }

        const startTime = performance.now();
        const mockLatency = MOCK_API_LATENCY_MS + Math.random() * 500; // Add some variability
        await new Promise(resolve => setTimeout(resolve, mockLatency));

        if (enableCache) {
            const cachedResult = MockDBService._queryCache.get(query);
            if (cachedResult) {
                console.log(`Cache hit for query: ${query}`);
                return { ...cachedResult, queryTimeMs: performance.now() - startTime, isCached: true };
            }
        }

        // Simulate random errors
        if (Math.random() * 100 < MOCK_ERROR_RATE_PERCENT) {
            const errorTypes = Object.values(DBQL_ERROR_MESSAGES);
            return {
                headers: [],
                rows: [],
                error: errorTypes[Math.floor(Math.random() * errorTypes.length)],
                queryTimeMs: performance.now() - startTime,
            };
        }

        const parsedQuery = DBQLParser.parse(query);
        const validationResult = DBQLValidator.validate(parsedQuery, MOCK_SCHEMA);

        if (!validationResult.isValid) {
            return {
                headers: [],
                rows: [],
                error: validationResult.error || DBQL_ERROR_MESSAGES.GENERIC_ERROR,
                queryTimeMs: performance.now() - startTime,
            };
        }

        if (!parsedQuery) {
            return {
                headers: [],
                rows: [],
                error: DBQL_ERROR_MESSAGES.SYNTAX_ERROR,
                queryTimeMs: performance.now() - startTime,
            };
        }

        const tableName = parsedQuery.table.toLowerCase();
        let tableData = MockDBService._data[tableName];

        if (!tableData) {
            return {
                headers: [],
                rows: [],
                error: DBQL_ERROR_MESSAGES.TABLE_NOT_FOUND,
                queryTimeMs: performance.now() - startTime,
            };
        }

        // Handle DML operations
        if (parsedQuery.type === 'INSERT') {
            if (!MockAuthService.checkAuth() || MockAuthService.getUserRole() !== 'admin') {
                return { headers: [], rows: [], error: DBQL_ERROR_MESSAGES.PERMISSION_DENIED, queryTimeMs: performance.now() - startTime };
            }
            const tableSchema = MOCK_SCHEMA.tables.find(t => t.name.toLowerCase() === tableName);
            if (!tableSchema || !parsedQuery.values || parsedQuery.values.length !== tableSchema.columns.length) {
                return { headers: [], rows: [], error: `INSERT error: Mismatched column count or no schema for ${tableName}.`, queryTimeMs: performance.now() - startTime };
            }
            const newRecord: Record<string, any> = { id: generateUUID(), createdAt: new Date().toISOString() };
            tableSchema.columns.forEach((col, index) => {
                newRecord[col.name] = parsedQuery.values![index];
            });
            await MockDBService.createRecord(tableName, newRecord);
            return { headers: ['status'], rows: [['Record inserted successfully']], queryTimeMs: performance.now() - startTime, rowCount: 1 };
        }

        if (parsedQuery.type === 'UPDATE') {
            if (!MockAuthService.checkAuth() || MockAuthService.getUserRole() !== 'admin') {
                return { headers: [], rows: [], error: DBQL_ERROR_MESSAGES.PERMISSION_DENIED, queryTimeMs: performance.now() - startTime };
            }
            let updatedCount = 0;
            const recordsToUpdate = tableData.filter(row => parsedQuery.conditions ? MockDBService.evaluateCondition(row, parsedQuery.conditions!, tableName) : true);
            for (const record of recordsToUpdate) {
                try {
                    await MockDBService.updateRecord(tableName, record.id, parsedQuery.updates || {});
                    updatedCount++;
                } catch (e) {
                    console.error("Error updating record:", e);
                }
            }
            return { headers: ['status', 'count'], rows: [['Records updated successfully', updatedCount]], queryTimeMs: performance.now() - startTime, rowCount: updatedCount };
        }

        if (parsedQuery.type === 'DELETE') {
            if (!MockAuthService.checkAuth() || MockAuthService.getUserRole() !== 'admin') {
                return { headers: [], rows: [], error: DBQL_ERROR_MESSAGES.PERMISSION_DENIED, queryTimeMs: performance.now() - startTime };
            }
            let deletedCount = 0;
            const initialDataLength = tableData.length;
            MockDBService._data[tableName] = tableData.filter(row => {
                if (parsedQuery.conditions && MockDBService.evaluateCondition(row, parsedQuery.conditions!, tableName)) {
                    deletedCount++;
                    return false; // exclude this row
                }
                return true; // keep this row
            });
            return { headers: ['status', 'count'], rows: [['Records deleted successfully', deletedCount]], queryTimeMs: performance.now() - startTime, rowCount: deletedCount };
        }

        // Handle SELECT/GET
        let filteredData = [...tableData]; // shallow copy to manipulate

        // Apply WHERE clause (simplified)
        if (parsedQuery.conditions) {
            try {
                filteredData = filteredData.filter(row => MockDBService.evaluateCondition(row, parsedQuery.conditions!, tableName));
            } catch (e: any) {
                console.error("Error evaluating WHERE clause:", e);
                return {
                    headers: [],
                    rows: [],
                    error: `Error in WHERE clause evaluation: ${e.message}`,
                    queryTimeMs: performance.now() - startTime,
                };
            }
        }

        // Apply ORDER BY
        if (parsedQuery.orderBy) {
            const { field, direction } = parsedQuery.orderBy;
            filteredData.sort((a, b) => {
                const valA = a[field];
                const valB = b[field];
                if (valA < valB) return direction === 'ASC' ? -1 : 1;
                if (valA > valB) return direction === 'ASC' ? 1 : -1;
                return 0;
            });
        }

        let headers: string[] = [];
        let rows: (string | number | boolean | null)[][] = [];

        // Apply SELECT/GET fields
        if (parsedQuery.fields && parsedQuery.fields[0] !== '*') {
            headers = parsedQuery.fields;
            rows = filteredData.map(row => headers.map(header => row[header]));
        } else {
            // Select all fields, dynamically get headers from schema
            const tableSchema = MOCK_SCHEMA.tables.find(t => t.name.toLowerCase() === parsedQuery.table.toLowerCase());
            headers = tableSchema ? tableSchema.columns.map(c => c.name) : (filteredData.length > 0 ? Object.keys(filteredData[0]) : []);
            rows = filteredData.map(row => headers.map(header => row[header] !== undefined ? row[header] : null));
        }

        // Apply LIMIT
        if (parsedQuery.limit !== undefined) {
            rows = rows.slice(0, parsedQuery.limit);
        }

        const result: DBQLQueryResult = {
            headers,
            rows,
            queryTimeMs: performance.now() - startTime,
            rowCount: rows.length,
            isCached: false,
        };

        if (enableCache) {
            MockDBService._queryCache.set(query, result);
        }

        return result;
    }

    // Generic CRUD operations for more interactive features (simulated)
    static async createRecord(tableName: string, record: Record<string, any>): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS));
        if (Math.random() * 100 < MOCK_ERROR_RATE_PERCENT * 2) { // Higher error rate for write ops
            throw new Error(`Failed to create record in ${tableName}.`);
        }
        const newRecord = { id: generateUUID(), ...record, createdAt: new Date().toISOString() };
        if (!MockDBService._data[tableName]) {
            MockDBService._data[tableName] = [];
        }
        MockDBService._data[tableName].push(newRecord);
        return newRecord;
    }

    static async updateRecord(tableName: string, id: string, updates: Record<string, any>): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS));
        if (Math.random() * 100 < MOCK_ERROR_RATE_PERCENT * 2) {
            throw new Error(`Failed to update record ${id} in ${tableName}.`);
        }
        const index = MockDBService._data[tableName]?.findIndex(r => r.id === id);
        if (index === undefined || index === -1) {
            throw new Error(`Record ${id} not found in ${tableName}.`);
        }
        MockDBService._data[tableName][index] = { ...MockDBService._data[tableName][index], ...updates, updatedAt: new Date().toISOString() };
        return MockDBService._data[tableName][index];
    }

    static async deleteRecord(tableName: string, id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS));
        if (Math.random() * 100 < MOCK_ERROR_RATE_PERCENT * 2) {
            throw new Error(`Failed to delete record ${id} from ${tableName}.`);
        }
        const initialLength = MockDBService._data[tableName]?.length || 0;
        MockDBService._data[tableName] = MockDBService._data[tableName]?.filter(r => r.id !== id);
        return (MockDBService._data[tableName]?.length || 0) < initialLength;
    }

    static async getTableData(tableName: string, limit: number = DEFAULT_RESULT_PAGE_SIZE, offset: number = 0): Promise<{ data: any[], total: number }> {
        if (!MockDBService._initialized) {
            MockDBService.generateRandomData();
        }
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS));
        const data = MockDBService._data[tableName] || [];
        return {
            data: data.slice(offset, offset + limit),
            total: data.length
        };
    }
}

export class MockPreferenceService {
    private static _preferences: UserPreferences = {
        theme: 'dark',
        editorFontSize: DEFAULT_EDITOR_FONT_SIZE,
        autoRunDelayMs: 0,
        enableQueryCaching: true,
        showLineNumbers: true,
        resultPageSize: DEFAULT_RESULT_PAGE_SIZE,
    };

    static async getPreferences(): Promise<UserPreferences> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        return { ...MockPreferenceService._preferences };
    }

    static async savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        MockPreferenceService._preferences = { ...MockPreferenceService._preferences, ...prefs };
        return { ...MockPreferenceService._preferences };
    }
}

export class MockHistoryService {
    private static _history: QueryHistoryEntry[] = [];

    static async getHistory(): Promise<QueryHistoryEntry[]> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        return [...MockHistoryService._history].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    static async addEntry(entry: Omit<QueryHistoryEntry, 'id' | 'timestamp'>): Promise<QueryHistoryEntry> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        const newEntry: QueryHistoryEntry = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            ...entry
        };
        MockHistoryService._history.unshift(newEntry); // Add to beginning
        if (MockHistoryService._history.length > MAX_QUERY_HISTORY_ENTRIES) {
            MockHistoryService._history.pop(); // Trim oldest entry
        }
        return newEntry;
    }

    static async clearHistory(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        MockHistoryService._history = [];
    }
}

export class MockFavoriteService {
    private static _favorites: QueryFavoriteEntry[] = [
        { id: generateUUID(), name: "High Value Transactions", query: "FROM transactions SELECT description, amount, date WHERE amount > 5000 ORDER BY date DESC LIMIT 20;", createdAt: new Date().toISOString(), tags: ['financial', 'overview'] },
        { id: generateUUID(), name: "Fraudulent Anomalies (High Severity)", query: "FROM anomalies SELECT * WHERE type = 'Fraud' AND severity = 'High' ORDER BY detectionDate DESC;", createdAt: new Date().toISOString(), tags: ['security', 'risk'] },
        { id: generateUUID(), name: "All Active Accounts", query: "FROM accounts SELECT id, name, balance, type WHERE status = 'Active';", createdAt: new Date().toISOString(), tags: ['accounts'] }
    ];

    static async getFavorites(): Promise<QueryFavoriteEntry[]> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        return [...MockFavoriteService._favorites].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    static async addFavorite(entry: Omit<QueryFavoriteEntry, 'id' | 'createdAt'>): Promise<QueryFavoriteEntry> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        const newEntry: QueryFavoriteEntry = {
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            ...entry
        };
        MockFavoriteService._favorites.unshift(newEntry);
        return newEntry;
    }

    static async removeFavorite(id: string): Promise<boolean> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 4));
        const initialLength = MockFavoriteService._favorites.length;
        MockFavoriteService._favorites = MockFavoriteService._favorites.filter(fav => fav.id !== id);
        return MockFavoriteService._favorites.length < initialLength;
    }
}

export class MockNotificationService {
    private static _notifications: Notification[] = [];
    private static _listeners: Set<(notifications: Notification[]) => void> = new Set();

    static async getNotifications(): Promise<Notification[]> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 8));
        return [...MockNotificationService._notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    static pushNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
        const newNotification: Notification = {
            id: generateUUID(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        MockNotificationService._notifications.unshift(newNotification);
        // Notify listeners
        MockNotificationService._listeners.forEach(cb => cb([...MockNotificationService._notifications]));
    }

    static async markAsRead(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 8));
        const notification = MockNotificationService._notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            MockNotificationService._listeners.forEach(cb => cb([...MockNotificationService._notifications]));
        }
    }

    static async clearAllNotifications(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_LATENCY_MS / 8));
        MockNotificationService._notifications = [];
        MockNotificationService._listeners.forEach(cb => cb([]));
    }

    static subscribe(callback: (notifications: Notification[]) => void): () => void {
        MockNotificationService._listeners.add(callback);
        // Immediately provide current notifications
        callback([...MockNotificationService._notifications]);
        return () => MockNotificationService._listeners.delete(callback);
    }
}

// SECTION 5: REUSABLE UI COMPONENTS
// =====================================================================================================================
// These are smaller, self-contained components that encapsulate specific UI functionality.

export interface AutocompleteProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
    currentValue: string;
    cursorPosition: number;
    editorRef: React.RefObject<HTMLTextAreaElement>;
}

export const Autocomplete: React.FC<AutocompleteProps> = React.memo(({ suggestions, onSelect, currentValue, cursorPosition, editorRef }) => {
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        setSelectedIndex(-1); // Reset on new suggestions
    }, [suggestions]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!suggestions.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' && selectedIndex !== -1) {
            e.preventDefault();
            onSelect(suggestions[selectedIndex]);
        }
    }, [suggestions, selectedIndex, onSelect]);

    useEffect(() => {
        // Attach keydown listener to the document to catch events outside the editor if needed,
        // or more specifically to the editor's parent if the editor is not focused.
        // For simplicity, we assume the editor component will pass these events up or manage focus.
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        // Scroll selected item into view
        if (listRef.current && selectedIndex !== -1) {
            const selectedItem = listRef.current.children[selectedIndex] as HTMLLIElement;
            selectedItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    if (!suggestions.length) return null;

    // Calculate approximate position of the cursor
    const getCursorVisualPosition = () => {
        const editor = editorRef.current;
        if (!editor) return { top: 0, left: 0 };

        // Create a temporary element to measure text
        const tempSpan = document.createElement('span');
        tempSpan.style.whiteSpace = 'pre-wrap';
        tempSpan.style.wordBreak = 'break-all';
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.fontFamily = getComputedStyle(editor).fontFamily;
        tempSpan.style.fontSize = getComputedStyle(editor).fontSize;
        tempSpan.style.lineHeight = getComputedStyle(editor).lineHeight;
        tempSpan.style.padding = getComputedStyle(editor).padding;
        tempSpan.style.border = getComputedStyle(editor).border;
        tempSpan.style.boxSizing = getComputedStyle(editor).boxSizing;
        tempSpan.style.width = editor.clientWidth + 'px'; // Match editor width for wrapping
        tempSpan.style.height = 'auto';

        const textBefore = currentValue.substring(0, cursorPosition);
        tempSpan.textContent = textBefore;

        document.body.appendChild(tempSpan);
        const { offsetWidth: textWidth, offsetHeight: textHeight } = tempSpan;
        document.body.removeChild(tempSpan);

        const editorRect = editor.getBoundingClientRect();
        // A rough estimate for multiline text. For a real editor, you'd use a library or more complex geometry.
        const charWidth = editorRect.width / (currentValue.split('\n')[0].length || 1); // Avg char width
        const lineNumber = (textBefore.match(/\n/g) || []).length;
        const lineStart = textBefore.lastIndexOf('\n') === -1 ? 0 : textBefore.lastIndexOf('\n') + 1;
        const charsInLine = textBefore.length - lineStart;
        const linesScrolled = editor.scrollTop / parseFloat(getComputedStyle(editor).lineHeight); // Number of lines scrolled
        
        const top = editorRect.top + (lineNumber * parseFloat(getComputedStyle(editor).lineHeight)) - editor.scrollTop;
        const left = editorRect.left + (charsInLine * charWidth); // This is very simplistic for wrapping text

        return { top, left };
    };

    const position = getCursorVisualPosition();
    // Adjust position to be relative to the editor's parent for absolute positioning
    const editorRect = editorRef.current?.getBoundingClientRect();
    const parentRect = editorRef.current?.parentElement?.getBoundingClientRect();

    if (!editorRect || !parentRect) return null;

    const relativeLeft = position.left - parentRect.left;
    const relativeTop = position.top - parentRect.top + editorRect.height; // Position below editor

    return (
        <div
            className="absolute z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto"
            style={{ top: relativeTop + 5, left: relativeLeft }}
        >
            <ul ref={listRef} className="py-1 text-sm text-gray-200 autocomplete-list">
                {suggestions.map((suggestion, index) => (
                    <li
                        key={suggestion}
                        className={`px-4 py-2 cursor-pointer ${index === selectedIndex ? 'bg-cyan-700' : 'hover:bg-gray-700'}`}
                        onClick={() => onSelect(suggestion)}
                    >
                        {suggestion}
                    </li>
                ))}
            </ul>
        </div>
    );
});


export interface CustomCodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    onRunQuery: (query: string) => void;
    isLoading: boolean;
    preferences: UserPreferences;
    error: string | null;
    schema: DBQLSchema;
}

export const CustomCodeEditor: React.FC<CustomCodeEditorProps> = React.memo(({
    value, onChange, onRunQuery, isLoading, preferences, error, schema
}) => {
    const [cursorPosition, setCursorPosition] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        setCursorPosition(e.target.selectionStart);
        setShowSuggestions(true); // Always try to show suggestions on change
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && e.shiftKey && !isLoading) {
            e.preventDefault();
            onRunQuery(value);
            setShowSuggestions(false); // Hide suggestions after running query
        }

        // Handle autocomplete navigation if suggestions are shown
        if (showSuggestions && suggestions.length > 0) {
            // The Autocomplete component uses document.addEventListener for its own key events.
            // If Enter is pressed and a suggestion is selected, it handles it.
            // We just need to prevent the default behavior here if the autocomplete is active.
            if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
        }
    }, [isLoading, onRunQuery, value, showSuggestions, suggestions.length]);

    const handleSelectSuggestion = useCallback((suggestion: string) => {
        if (!editorRef.current) return;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const textAfterCursor = value.substring(cursorPosition);

        const lastWordMatch = textBeforeCursor.match(/[\w\d]*$/); // Match the last word fragment
        const lastWord = lastWordMatch ? lastWordMatch[0] : '';

        const newText = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length) + suggestion + ' ' + textAfterCursor;
        const newCursorPos = textBeforeCursor.length - lastWord.length + suggestion.length + 1;

        onChange(newText);
        setCursorPosition(newCursorPos);
        setShowSuggestions(false);

        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.selectionStart = newCursorPos;
                editorRef.current.selectionEnd = newCursorPos;
            }
        }, 0);

    }, [value, cursorPosition, onChange]);

    useEffect(() => {
        if (showSuggestions) {
            const newSuggestions = DBQLParser.getSuggestions(value, cursorPosition, schema);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [value, cursorPosition, showSuggestions, schema]);

    // Simple syntax highlighter
    const highlightedQuery = useMemo(() => {
        const tokens = value.split(/(\s+|[,;().=><!+\-*/])/g) // Split by common delimiters
            .filter(Boolean); // Remove empty strings from split

        return tokens.map((token, i) => {
                const upperToken = token.toUpperCase();
                if (SYNTAX_HIGHLIGHT_KEYWORDS.includes(upperToken)) {
                    return <span key={`${token}-${i}`} className="text-cyan-400 font-bold">{token}</span>;
                }
                if (SYNTAX_HIGHLIGHT_OPERATORS.includes(upperToken)) {
                    return <span key={`${token}-${i}`} className="text-yellow-400">{token}</span>;
                }
                if (SYNTAX_HIGHLIGHT_FUNCTIONS.some(f => upperToken.startsWith(f))) {
                    return <span key={`${token}-${i}`} className="text-purple-400">{token}</span>;
                }
                if (MOCK_SCHEMA.tables.some(t => t.name.toLowerCase() === token.toLowerCase())) {
                    return <span key={`${token}-${i}`} className="text-green-400">{token}</span>;
                }
                // Check if it's a column name (simplified, would need context)
                if (MOCK_SCHEMA.tables.some(table => table.columns.some(col => col.name.toLowerCase() === token.toLowerCase()))) {
                    return <span key={`${token}-${i}`} className="text-orange-400">{token}</span>;
                }
                // String literals
                if (token.startsWith("'") && token.endsWith("'")) {
                    return <span key={`${token}-${i}`} className="text-lime-400">{token}</span>;
                }
                // Numbers
                if (!isNaN(Number(token)) && token.trim() !== '') {
                    return <span key={`${token}-${i}`} className="text-pink-400">{token}</span>;
                }
                return <span key={`${token}-${i}`} className="text-white">{token}</span>;
            });
    }, [value]);


    return (
        <div ref={containerRef} className="relative bg-gray-900 rounded-lg border border-gray-700 font-mono text-sm">
            {preferences.showLineNumbers && (
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-800/50 rounded-l-lg py-4 px-2 text-right text-gray-500 text-xs select-none pointer-events-none">
                    {value.split('\n').map((_, i) => (
                        <div key={i} style={{ lineHeight: `${preferences.editorFontSize * 1.5}px` }}>{i + 1}</div>
                    ))}
                </div>
            )}
            <div
                className={`relative h-48 overflow-auto whitespace-pre-wrap p-4 ${preferences.showLineNumbers ? 'ml-10' : ''}`}
                style={{ fontSize: preferences.editorFontSize }}
            >
                {/* Overlay for syntax highlighting */}
                <pre
                    className="absolute inset-0 p-4 pointer-events-none z-10 text-white"
                    style={{ fontSize: preferences.editorFontSize, lineHeight: `${preferences.editorFontSize * 1.5}px` }}
                >
                    {highlightedQuery}
                </pre>
                {/* Actual textarea for input */}
                <textarea
                    ref={editorRef}
                    className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none outline-none z-20"
                    value={value}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                    onKeyUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                    onMouseUp={(e) => setCursorPosition(e.currentTarget.selectionStart)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestion
                    onFocus={() => setShowSuggestions(true)}
                    style={{ fontSize: preferences.editorFontSize, lineHeight: `${preferences.editorFontSize * 1.5}px` }}
                    spellCheck="false"
                />
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <Autocomplete
                    suggestions={suggestions}
                    onSelect={handleSelectSuggestion}
                    currentValue={value}
                    cursorPosition={cursorPosition}
                    editorRef={editorRef}
                />
            )}
            {error && <div className="p-2 text-red-400 text-xs bg-red-900/30 rounded-b-lg border-t border-red-700">{error}</div>}
            <button onClick={() => onRunQuery(value)} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-b-lg disabled:opacity-50">
                {isLoading ? 'Running...' : 'Run Query (Shift+Enter)'}
            </button>
        </div>
    );
});

export interface PaginatedTableProps {
    data: (string | number | boolean | null)[][];
    headers: string[];
    pageSize: number;
    title?: string;
    onRowClick?: (rowData: (string | number | boolean | null)[], rowIndex: number) => void;
}

export const PaginatedTable: React.FC<PaginatedTableProps> = React.memo(({ data, headers, pageSize, title, onRowClick }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return data.filter(row =>
            row.some(cell => String(cell).toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [data, searchTerm]);

    const sortedData = useMemo(() => {
        if (!sortColumn) return filteredData;
        const columnIndex = headers.indexOf(sortColumn);
        if (columnIndex === -1) return filteredData;

        return [...filteredData].sort((a, b) => {
            const valA = a[columnIndex];
            const valB = b[columnIndex];

            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }
            // Fallback for other types or mixed types
            const strA = String(valA);
            const strB = String(valB);
            return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
    }, [filteredData, sortColumn, sortDirection, headers]);

    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (columnName: string) => {
        if (sortColumn === columnName) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(columnName);
            setSortDirection('asc');
        }
    };

    useEffect(() => {
        setCurrentPage(1); // Reset page on data/filter/sort changes
    }, [data, searchTerm, sortColumn, sortDirection]);

    return (
        <div className="space-y-4">
            {title && <h3 className="text-xl font-semibold text-white">{title}</h3>}
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search results..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 flex-grow"
                />
                <div className="flex items-center space-x-2 text-gray-300">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50"
                    >
                        &lt; Prev
                    </button>
                    <span>Page {currentPage} of {totalPages === 0 ? 1 : totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50"
                    >
                        Next &gt;
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                        <tr>
                            {headers.map((h: string) => (
                                <th
                                    key={h}
                                    scope="col"
                                    className="px-6 py-3 cursor-pointer hover:bg-gray-800"
                                    onClick={() => handleSort(h)}
                                >
                                    {h}
                                    {sortColumn === h && (
                                        <span className="ml-1">
                                            {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                                        </span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                                    No results found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row: any[], i: number) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-800 hover:bg-gray-800/50"
                                    onClick={() => onRowClick && onRowClick(row, (currentPage - 1) * pageSize + i)}
                                >
                                    {row.map((cell, j) => (
                                        <td key={j} className="px-6 py-4 font-mono text-white">
                                            {typeof cell === 'number' && headers[j].toLowerCase().includes('amount') ? formatCurrency(cell) : String(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = React.memo(({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const modalWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }[size];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75" onClick={onClose}>
            <div
                className={`bg-gray-900 rounded-lg shadow-xl p-6 ${modalWidthClass} w-full m-4 border border-gray-700`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
                        &times;
                    </button>
                </div>
                <div className="py-4">
                    {children}
                </div>
                {/* Optional: Add a footer here for actions */}
            </div>
        </div>
    );
});

export interface NotificationToastProps {
    notification: Notification;
    onClose: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = React.memo(({ notification, onClose }) => {
    const bgColor = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-orange-600',
    }[notification.type];

    const icon = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '!',
    }[notification.type];

    useEffect(() => {
        if (notification.type !== 'error') { // Auto-dismiss non-error notifications
            const timer = setTimeout(() => {
                onClose(notification.id);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.id, notification.type, onClose]);

    return (
        <div className={`flex items-center p-4 rounded-lg shadow-md mb-2 ${bgColor} text-white`}>
            <span className="text-2xl mr-3">{icon}</span>
            <div className="flex-grow">
                <p className="font-semibold">{notification.type.toUpperCase()}</p>
                <p className="text-sm">{notification.message}</p>
                {notification.action && (
                    <button
                        className="text-xs mt-1 underline hover:text-gray-200"
                        onClick={() => { notification.action?.callback(); onClose(notification.id); }}
                    >
                        {notification.action.label}
                    </button>
                )}
            </div>
            <button onClick={() => onClose(notification.id)} className="ml-4 text-white hover:opacity-75">
                &times;
            </button>
        </div>
    );
});

export const NotificationStack: React.FC = React.memo(() => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const unsubscribe = MockNotificationService.subscribe(setNotifications);
        return () => unsubscribe();
    }, []);

    const handleCloseNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        MockNotificationService.markAsRead(id);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-[200] space-y-2 w-72">
            {notifications.filter(n => !n.read).map(n => (
                <NotificationToast key={n.id} notification={n} onClose={handleCloseNotification} />
            ))}
        </div>
    );
});


// SECTION 6: FEATURE-SPECIFIC COMPONENTS (exported for potential reusability or direct access)
// =====================================================================================================================
// These components represent significant functional areas of the DBQL Explorer.

export const QueryHistoryPanel: React.FC<{ onSelectQuery: (query: string) => void }> = React.memo(({ onSelectQuery }) => {
    const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        const data = await MockHistoryService.getHistory();
        setHistory(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleClearHistory = useCallback(async () => {
        if (window.confirm("Are you sure you want to clear all query history?")) {
            await MockHistoryService.clearHistory();
            MockNotificationService.pushNotification({ type: 'success', message: 'Query history cleared.' });
            fetchHistory();
        }
    }, [fetchHistory]);

    if (isLoading) {
        return <p className="text-center text-gray-400">Loading history...</p>;
    }

    return (
        <Card title="Query History" className="flex-1 min-w-[300px]">
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.length === 0 ? (
                    <p className="text-gray-500 text-sm">No query history yet.</p>
                ) : (
                    history.map(entry => (
                        <div key={entry.id} className="p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors duration-200">
                            <button onClick={() => onSelectQuery(entry.query)} className="text-left w-full">
                                <p className="font-mono text-xs text-gray-300 truncate">{entry.query}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {formatDate(entry.timestamp, 'short')} - {entry.durationMs.toFixed(0)}ms - {entry.rowCount || 0} rows
                                    {entry.status === 'error' && <span className="text-red-400 ml-2"> (Error)</span>}
                                </p>
                            </button>
                        </div>
                    ))
                )}
            </div>
            {history.length > 0 && (
                <button onClick={handleClearHistory} className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm">
                    Clear History
                </button>
            )}
        </Card>
    );
});

export const QueryFavoritesPanel: React.FC<{ onSelectQuery: (query: string) => void }> = React.memo(({ onSelectQuery }) => {
    const [favorites, setFavorites] = useState<QueryFavoriteEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFavName, setNewFavName] = useState('');
    const [newFavQuery, setNewFavQuery] = useState('');
    const [newFavDescription, setNewFavDescription] = useState('');

    const fetchFavorites = useCallback(async () => {
        setIsLoading(true);
        const data = await MockFavoriteService.getFavorites();
        setFavorites(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    const handleAddFavorite = useCallback(async () => {
        if (!newFavName || !newFavQuery) {
            MockNotificationService.pushNotification({ type: 'warning', message: 'Favorite name and query cannot be empty.' });
            return;
        }
        try {
            await MockFavoriteService.addFavorite({
                name: newFavName,
                query: newFavQuery,
                description: newFavDescription,
            });
            MockNotificationService.pushNotification({ type: 'success', message: `Favorite '${newFavName}' added.` });
            setNewFavName('');
            setNewFavQuery('');
            setNewFavDescription('');
            setShowAddModal(false);
            fetchFavorites();
        } catch (error: any) {
            MockNotificationService.pushNotification({ type: 'error', message: `Failed to add favorite: ${error.message}` });
        }
    }, [newFavName, newFavQuery, newFavDescription, fetchFavorites]);

    const handleRemoveFavorite = useCallback(async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove favorite '${name}'?`)) {
            try {
                await MockFavoriteService.removeFavorite(id);
                MockNotificationService.pushNotification({ type: 'success', message: `Favorite '${name}' removed.` });
                fetchFavorites();
            } catch (error: any) {
                MockNotificationService.pushNotification({ type: 'error', message: `Failed to remove favorite: ${error.message}` });
            }
        }
    }, [fetchFavorites]);

    if (isLoading) {
        return <p className="text-center text-gray-400">Loading favorites...</p>;
    }

    return (
        <Card title="Favorite Queries" className="flex-1 min-w-[300px]">
            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
                {favorites.length === 0 ? (
                    <p className="text-gray-500 text-sm">No favorite queries saved yet.</p>
                ) : (
                    favorites.map(entry => (
                        <div key={entry.id} className="p-3 bg-gray-700/50 rounded-lg flex items-center justify-between hover:bg-gray-700 transition-colors duration-200">
                            <button onClick={() => onSelectQuery(entry.query)} className="text-left flex-grow mr-4">
                                <p className="font-semibold text-gray-200 truncate">{entry.name}</p>
                                <p className="font-mono text-xs text-gray-400 truncate mt-1">{entry.query}</p>
                                {entry.description && <p className="text-gray-500 text-xs mt-1">{entry.description}</p>}
                                {entry.tags && entry.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {entry.tags.map(tag => (
                                            <span key={tag} className="bg-cyan-800/30 text-cyan-300 text-xs px-2 py-1 rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </button>
                            <button onClick={() => handleRemoveFavorite(entry.id, entry.name)} className="text-red-400 hover:text-red-300 p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm1 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
            <button onClick={() => setShowAddModal(true)} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
                Add New Favorite
            </button>

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Favorite Query" size="sm">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="favName" className="block text-gray-300 text-sm font-bold mb-2">Favorite Name</label>
                        <input
                            type="text"
                            id="favName"
                            value={newFavName}
                            onChange={(e) => setNewFavName(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500"
                            placeholder="e.g., Today's Top Spenders"
                        />
                    </div>
                    <div>
                        <label htmlFor="favQuery" className="block text-gray-300 text-sm font-bold mb-2">DBQL Query</label>
                        <textarea
                            id="favQuery"
                            value={newFavQuery}
                            onChange={(e) => setNewFavQuery(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 h-24 font-mono text-xs"
                            placeholder="FROM transactions SELECT description, amount LIMIT 5;"
                        />
                    </div>
                    <div>
                        <label htmlFor="favDescription" className="block text-gray-300 text-sm font-bold mb-2">Description (Optional)</label>
                        <textarea
                            id="favDescription"
                            value={newFavDescription}
                            onChange={(e) => setNewFavDescription(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500 h-20 text-xs"
                            placeholder="A brief description of what this query does."
                        />
                    </div>
                    <button onClick={handleAddFavorite} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">
                        Save Favorite
                    </button>
                </div>
            </Modal>
        </Card>
    );
});

export const SchemaBrowser: React.FC<{ onSelectTable?: (tableName: string) => void, onSelectColumn?: (tableName: string, columnName: string) => void }> = React.memo(({ onSelectTable, onSelectColumn }) => {
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    const schema = MOCK_SCHEMA;

    return (
        <Card title="Schema Browser" className="flex-1 min-w-[300px]">
            <div className="space-y-4">
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {schema.tables.map(table => (
                        <li key={table.name}>
                            <button
                                onClick={() => {
                                    setSelectedTable(prev => prev === table.name ? null : table.name);
                                    onSelectTable?.(table.name);
                                }}
                                className={`w-full text-left p-2 rounded-md transition-colors duration-200 ${selectedTable === table.name ? 'bg-cyan-800/50 text-cyan-200' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'}`}
                            >
                                <span className="font-bold">{table.name}</span> <span className="text-gray-500 text-xs">({table.exampleRowCount} rows)</span>
                                <p className="text-xs text-gray-400 mt-1">{table.description}</p>
                            </button>
                            {selectedTable === table.name && (
                                <ul className="ml-4 mt-2 space-y-1">
                                    {table.columns.map(column => (
                                        <li key={column.name}>
                                            <button
                                                onClick={() => onSelectColumn?.(table.name, column.name)}
                                                className="w-full text-left text-xs p-1 rounded-md hover:bg-gray-800 text-gray-400"
                                            >
                                                <span className="font-mono">{column.name}</span>: <span className="text-purple-400">{column.type}</span>
                                                {column.isPrimaryKey && <span className="ml-1 text-yellow-400">(PK)</span>}
                                                {column.isIndexed && <span className="ml-1 text-blue-400">(IDX)</span>}
                                                {column.isNullable && <span className="ml-1 text-gray-500">(Nullable)</span>}
                                                <p className="text-xs text-gray-500 mt-0.5 ml-3">{column.description}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
});

export const DataViewer: React.FC<{ tableName: string | null }> = React.memo(({ tableName }) => {
    const [tableData, setTableData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const preferences = { resultPageSize: DEFAULT_RESULT_PAGE_SIZE }; // Using default for now, could come from preferences state

    const fetchTableData = useCallback(async (name: string, page: number) => {
        setIsLoading(true);
        try {
            const offset = (page - 1) * preferences.resultPageSize;
            const { data, total } = await MockDBService.getTableData(name, preferences.resultPageSize, offset);
            setTableData(data);
            setTotalRecords(total);
        } catch (error: any) {
            MockNotificationService.pushNotification({ type: 'error', message: `Failed to fetch data for ${name}: ${error.message}` });
            setTableData([]);
            setTotalRecords(0);
        } finally {
            setIsLoading(false);
        }
    }, [preferences.resultPageSize]);

    useEffect(() => {
        if (tableName) {
            setCurrentPage(1); // Reset page when table changes
            fetchTableData(tableName, 1);
        } else {
            setTableData([]);
            setTotalRecords(0);
        }
    }, [tableName, fetchTableData]);

    const headers = tableName ? MOCK_SCHEMA.tables.find(t => t.name === tableName)?.columns.map(c => c.name) || [] : [];
    const rows = tableData.map(row => headers.map(header => row[header]));

    if (!tableName) {
        return <p className="text-center text-gray-500">Select a table from the Schema Browser to view its data.</p>;
    }

    if (isLoading) {
        return <p className="text-center text-gray-400">Loading data for {tableName}...</p>;
    }

    const totalPages = Math.ceil(totalRecords / preferences.resultPageSize);

    return (
        <Card title={`Data for: ${tableName}`} className="flex-1">
            <PaginatedTable
                headers={headers}
                data={rows}
                pageSize={preferences.resultPageSize}
            />
            <div className="flex justify-end items-center space-x-2 mt-4 text-gray-300">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50"
                >
                    &lt; Prev
                </button>
                <span>Page {currentPage} of {totalPages === 0 ? 1 : totalPages}</span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 rounded-md bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50"
                >
                    Next &gt;
                </button>
            </div>
        </Card>
    );
});


export const QueryResultCharts: React.FC<{ results: DBQLQueryResult | null }> = React.memo(({ results }) => {
    const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);

    const generateChartData = useCallback((res: DBQLQueryResult): ChartConfig[] => {
        if (!res || res.rows.length === 0 || res.headers.length < 2) return [];

        const configs: ChartConfig[] = [];
        const numericColumns: { name: string, index: number }[] = [];
        const categoricalColumns: { name: string, index: number }[] = [];

        res.headers.forEach((header, index) => {
            const firstRowValue = res.rows[0][index];
            if (typeof firstRowValue === 'number') {
                numericColumns.push({ name: header, index });
            } else if (typeof firstRowValue === 'string' || typeof firstRowValue === 'boolean') {
                categoricalColumns.push({ name: header, index });
            }
        });

        // Example 1: Bar chart for counts of a categorical column
        if (categoricalColumns.length > 0) {
            const catCol = categoricalColumns[0];
            const counts = res.rows.reduce((acc, row) => {
                const value = String(row[catCol.index]);
                acc[value] = (acc[value] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            configs.push({
                title: `Count by ${catCol.name}`,
                type: 'bar',
                xAxisLabel: catCol.name,
                yAxisLabel: 'Count',
                dataSeries: [{
                    name: 'Count',
                    type: 'bar',
                    data: Object.entries(counts).map(([x, y]) => ({ x, y }))
                }]
            });
        }

        // Example 2: Line chart for a numeric column over time (if date column exists)
        const dateColumn = categoricalColumns.find(c => c.name.toLowerCase().includes('date') || c.name.toLowerCase().includes('time'));
        if (dateColumn && numericColumns.length > 0) {
            const numCol = numericColumns[0];
            const timeSeriesData: { [date: string]: number[] } = {};

            res.rows.forEach(row => {
                const dateStr = formatDate(row[dateColumn.index] as string, 'short'); // Group by date
                const value = row[numCol.index] as number;
                if (!timeSeriesData[dateStr]) {
                    timeSeriesData[dateStr] = [];
                }
                timeSeriesData[dateStr].push(value);
            });

            const aggregatedData = Object.entries(timeSeriesData)
                .map(([date, values]) => ({
                    x: date,
                    y: values.reduce((sum, val) => sum + val, 0) / values.length // Average per day
                }))
                .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

            configs.push({
                title: `Average ${numCol.name} over time`,
                type: 'line',
                xAxisLabel: 'Date',
                yAxisLabel: `Average ${numCol.name}`,
                dataSeries: [{
                    name: `Average ${numCol.name}`,
                    type: 'line',
                    data: aggregatedData
                }]
            });
        }

        // Example 3: Pie chart for distribution of a categorical column with numeric measure (e.g., sum of amount by category)
        if (categoricalColumns.length > 0 && numericColumns.length > 0) {
            const catCol = categoricalColumns[0];
            const numCol = numericColumns[0];
            const aggregatedSums = res.rows.reduce((acc, row) => {
                const category = String(row[catCol.index]);
                const value = row[numCol.index] as number;
                acc[category] = (acc[category] || 0) + (isNaN(value) ? 0 : value);
                return acc;
            }, {} as Record<string, number>);

            configs.push({
                title: `Distribution of ${numCol.name} by ${catCol.name}`,
                type: 'pie',
                dataSeries: [{
                    name: numCol.name,
                    type: 'pie',
                    data: Object.entries(aggregatedSums).map(([x, y]) => ({ x, y }))
                }]
            });
        }

        return configs;
    }, []);

    useEffect(() => {
        setChartConfigs(generateChartData(results!));
    }, [results, generateChartData]);

    if (!results || results.rows.length === 0 || results.headers.length < 2) {
        return <p className="text-center text-gray-500">Run a query with at least two columns and some data to generate charts.</p>;
    }

    if (chartConfigs.length === 0) {
        return <p className="text-center text-gray-500">No suitable data for charts found in results.</p>;
    }

    // This is a placeholder for a charting library integration.
    // In a real app, you would use Chart.js, Recharts, ApexCharts, etc.
    const renderChartPlaceholder = (config: ChartConfig) => (
        <div key={config.title} className="bg-gray-800 p-4 rounded-lg shadow-md mb-4 border border-gray-700">
            <h4 className="text-lg font-semibold text-white mb-3">{config.title} ({config.type.toUpperCase()} Chart)</h4>
            <div className="h-64 flex items-center justify-center bg-gray-900 text-gray-600 text-sm italic rounded-md border border-gray-700 border-dashed">
                <p>
                    [Chart Placeholder for {config.title}]<br/>
                    Data Points: {config.dataSeries.map(s => s.data.length).reduce((a,b) => a+b, 0)}<br/>
                    (Integrate a charting library like Chart.js or Recharts here)
                </p>
                {/* Example of what data would look like: */}
                {/* <pre className="text-xs max-h-40 overflow-auto">{JSON.stringify(config.dataSeries, null, 2)}</pre> */}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {chartConfigs.map(renderChartPlaceholder)}
        </div>
    );
});

export const SettingsPanel: React.FC<{ preferences: UserPreferences, onSavePreferences: (prefs: Partial<UserPreferences>) => void }> = React.memo(({ preferences, onSavePreferences }) => {
    const [currentPrefs, setCurrentPrefs] = useState<UserPreferences>(preferences);

    useEffect(() => {
        setCurrentPrefs(preferences);
    }, [preferences]);

    const handleChange = (key: keyof UserPreferences, value: any) => {
        setCurrentPrefs(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        try {
            await onSavePreferences(currentPrefs);
            MockNotificationService.pushNotification({ type: 'success', message: 'Preferences saved successfully.' });
        } catch (error: any) {
            MockNotificationService.pushNotification({ type: 'error', message: `Failed to save preferences: ${error.message}` });
        }
    };

    return (
        <Card title="User Settings" className="flex-1 min-w-[300px]">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Editor Settings</h3>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="editorFontSize" className="block text-gray-300 text-sm mb-1">Font Size:</label>
                            <input
                                id="editorFontSize"
                                type="number"
                                min="10" max="24" step="1"
                                value={currentPrefs.editorFontSize}
                                onChange={(e) => handleChange('editorFontSize', parseInt(e.target.value))}
                                className="p-2 bg-gray-800 text-white rounded-md border border-gray-700 w-24"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                id="showLineNumbers"
                                type="checkbox"
                                checked={currentPrefs.showLineNumbers}
                                onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                                className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor="showLineNumbers" className="ml-2 text-gray-300 text-sm">Show Line Numbers</label>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Query Execution</h3>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <input
                                id="enableQueryCaching"
                                type="checkbox"
                                checked={currentPrefs.enableQueryCaching}
                                onChange={(e) => handleChange('enableQueryCaching', e.target.checked)}
                                className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                            />
                            <label htmlFor="enableQueryCaching" className="ml-2 text-gray-300 text-sm">Enable Query Caching</label>
                        </div>
                        <div>
                            <label htmlFor="autoRunDelay" className="block text-gray-300 text-sm mb-1">Auto-run Delay (ms, 0 for off):</label>
                            <input
                                id="autoRunDelay"
                                type="number"
                                min="0" max="5000" step="100"
                                value={currentPrefs.autoRunDelayMs}
                                onChange={(e) => handleChange('autoRunDelayMs', parseInt(e.target.value))}
                                className="p-2 bg-gray-800 text-white rounded-md border border-gray-700 w-32"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Results View</h3>
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="resultPageSize" className="block text-gray-300 text-sm mb-1">Results Per Page:</label>
                            <input
                                id="resultPageSize"
                                type="number"
                                min="5" max="50" step="5"
                                value={currentPrefs.resultPageSize}
                                onChange={(e) => handleChange('resultPageSize', parseInt(e.target.value))}
                                className="p-2 bg-gray-800 text-white rounded-md border border-gray-700 w-24"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-800">
                    <button onClick={handleSave} className="py-2 px-6 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">
                        Save Changes
                    </button>
                </div>
            </div>
        </Card>
    );
});


// SECTION 7: MAIN APPLICATION COMPONENT
// =====================================================================================================================
// The main DemoBankDBQLView component, expanded with new state and integrations.

const exampleQueries = [ // Expanded example queries
    "FROM transactions SELECT description, amount, category WHERE amount > 100 AND category = 'Shopping' ORDER BY date DESC LIMIT 10;",
    "FROM accounts GET balance, type, name, status WHERE status = 'Active' ORDER BY balance DESC;",
    "FROM anomalies SELECT severity, details, type, detectionDate WHERE riskScore > 80 AND type = 'Fraud' ORDER BY detectionDate DESC LIMIT 5;",
    "FROM customers SELECT firstName, lastName, email, loyaltyLevel WHERE loyaltyLevel = 'Gold' OR loyaltyLevel = 'Platinum' LIMIT 15;",
    "FROM loans SELECT customerId, amount, outstandingBalance, interestRate WHERE status = 'Defaulted';",
    "INSERT INTO accounts VALUES ('acc-new-1', 'New Savings Account', 'Savings', 1500.00, 'USD', 'Active', '2023-10-26', 'cust-5');",
    "UPDATE accounts SET balance = 1200.00 WHERE id = 'acc-new-1';",
    "DELETE FROM accounts WHERE id = 'acc-new-1';"
];

export const DemoBankDBQLView: React.FC = () => {
    const [query, setQuery] = useState(exampleQueries[0]);
    const [results, setResults] = useState<DBQLQueryResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [queryError, setQueryError] = useState<string | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences>({
        theme: 'dark', // Initial default, will load from service
        editorFontSize: DEFAULT_EDITOR_FONT_SIZE,
        autoRunDelayMs: 0,
        enableQueryCaching: true,
        showLineNumbers: true,
        resultPageSize: DEFAULT_RESULT_PAGE_SIZE,
    });
    const [activeTab, setActiveTab] = useState<'results' | 'charts' | 'history' | 'favorites' | 'schema' | 'data' | 'settings'>('results');
    const [dataViewerTableName, setDataViewerTableName] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(MockAuthService.checkAuth());
    const [userRole, setUserRole] = useState(MockAuthService.getUserRole());

    // Load preferences on mount
    useEffect(() => {
        const loadPreferences = async () => {
            const loadedPrefs = await MockPreferenceService.getPreferences();
            setPreferences(loadedPrefs);
        };
        loadPreferences();

        // Initial mock data generation
        MockDBService.executeQuery("FROM accounts SELECT id LIMIT 1", false).then(() => {
            MockNotificationService.pushNotification({ type: 'info', message: 'Mock database initialized.' });
        }).catch(err => {
            MockNotificationService.pushNotification({ type: 'error', message: `Mock DB init error: ${err.message}` });
        });
    }, []);

    const handleSavePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
        const updatedPrefs = await MockPreferenceService.savePreferences(newPrefs);
        setPreferences(updatedPrefs);
    }, []);

    const runQuery = useCallback(async (queryToRun: string) => {
        if (!queryToRun.trim()) {
            setQueryError(DBQL_ERROR_MESSAGES.EMPTY_QUERY);
            MockNotificationService.pushNotification({ type: 'warning', message: DBQL_ERROR_MESSAGES.EMPTY_QUERY });
            setResults(null);
            return;
        }

        if (!isAuthenticated) {
            setQueryError(DBQL_ERROR_MESSAGES.PERMISSION_DENIED);
            MockNotificationService.pushNotification({ type: 'error', message: DBQL_ERROR_MESSAGES.PERMISSION_DENIED });
            setResults(null);
            return;
        }

        setIsLoading(true);
        setResults(null);
        setQueryError(null);
        setActiveTab('results'); // Switch to results tab automatically

        const startTime = performance.now();
        try {
            const queryResult = await MockDBService.executeQuery(queryToRun, preferences.enableQueryCaching);

            if (queryResult.error) {
                setQueryError(queryResult.error);
                setResults(null);
                MockNotificationService.pushNotification({ type: 'error', message: queryResult.error });
                MockHistoryService.addEntry({
                    query: queryToRun,
                    status: 'error',
                    durationMs: performance.now() - startTime,
                    errorDetails: queryResult.error,
                });
            } else {
                setResults(queryResult);
                MockNotificationService.pushNotification({
                    type: 'success',
                    message: `Query successful! ${queryResult.rowCount || 0} rows in ${queryResult.queryTimeMs?.toFixed(0) || 0}ms.`,
                    action: queryResult.isCached ? { label: 'Cached', callback: () => alert('Result loaded from cache!') } : undefined,
                });
                MockHistoryService.addEntry({
                    query: queryToRun,
                    status: 'success',
                    durationMs: performance.now() - startTime,
                    rowCount: queryResult.rowCount,
                });
            }
        } catch (err: any) {
            setQueryError(err.message || DBQL_ERROR_MESSAGES.GENERIC_ERROR);
            setResults(null);
            MockNotificationService.pushNotification({ type: 'error', message: err.message || DBQL_ERROR_MESSAGES.GENERIC_ERROR });
            MockHistoryService.addEntry({
                query: queryToRun,
                status: 'error',
                durationMs: performance.now() - startTime,
                errorDetails: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, preferences.enableQueryCaching]);

    // Auto-run query feature
    useEffect(() => {
        if (preferences.autoRunDelayMs > 0 && query.trim() !== '') {
            const handler = setTimeout(() => {
                runQuery(query);
            }, preferences.autoRunDelayMs);
            return () => clearTimeout(handler);
        }
    }, [query, preferences.autoRunDelayMs, runQuery]);

    const handleSelectHistoryQuery = useCallback((historyQuery: string) => {
        setQuery(historyQuery);
        setActiveTab('results'); // Go back to results to see the query run if auto-run is on, or just update editor
    }, []);

    const handleSelectFavoriteQuery = useCallback((favoriteQuery: string) => {
        setQuery(favoriteQuery);
        setActiveTab('results'); // Go back to results
    }, []);

    const handleTableSelectedFromSchema = useCallback((tableName: string) => {
        setDataViewerTableName(tableName);
        setActiveTab('data');
    }, []);

    const handleColumnSelectedFromSchema = useCallback((tableName: string, columnName: string) => {
        // Example: insert column name into query
        setQuery(prev => {
            const currentQuery = prev.toUpperCase();
            if (currentQuery.includes('FROM') && currentQuery.includes('SELECT')) {
                 const selectClauseMatch = currentQuery.match(/SELECT\s+([\w,\s\*]+)/);
                 if (selectClauseMatch) {
                     const existingFields = selectClauseMatch[1].trim();
                     if (existingFields === '*') {
                         return prev.replace(/\s+\*\s*/i, ` ${columnName} `);
                     } else if (!existingFields.split(',').map(f => f.trim().toLowerCase()).includes(columnName.toLowerCase())) {
                          return prev.replace(selectClauseMatch[1], `${existingFields}, ${columnName}`);
                     }
                 }
            }
            return `FROM ${tableName} SELECT ${columnName} LIMIT 10;`;
        });
        setActiveTab('results');
    }, []);

    const handleLogin = async (username: string, password: string) => {
        const success = await MockAuthService.login(username, password);
        if (success) {
            setIsAuthenticated(true);
            setUserRole(MockAuthService.getUserRole());
            MockNotificationService.pushNotification({ type: 'success', message: `Logged in as ${username}. Role: ${MockAuthService.getUserRole()}` });
        } else {
            MockNotificationService.pushNotification({ type: 'error', message: 'Invalid username or password.' });
        }
        return success;
    };

    const handleLogout = async () => {
        await MockAuthService.logout();
        setIsAuthenticated(false);
        setUserRole('user');
        MockNotificationService.pushNotification({ type: 'info', message: 'Logged out successfully.' });
    };

    // A login modal component if not authenticated
    const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [loginLoading, setLoginLoading] = useState(false);

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoginLoading(true);
            const success = await handleLogin(username, password);
            setLoginLoading(false);
            if (success) onClose();
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Login to DBQL Explorer" size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500"
                            placeholder="admin or user"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-bold mb-2">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-cyan-500"
                            placeholder="password"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50"
                    >
                        {loginLoading ? 'Logging in...' : 'Login'}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">Hint: Try username "admin" or "user" with password "password"</p>
                </form>
            </Modal>
        );
    };

    const [showLoginModal, setShowLoginModal] = useState(false);
    useEffect(() => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
        } else {
            setShowLoginModal(false);
        }
    }, [isAuthenticated]);

    return (
        <div className="space-y-6 max-w-screen-xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-white tracking-wider flex justify-between items-center">
                <span>{APP_NAME}</span>
                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-sm text-gray-400">Welcome, {userRole}</span>
                            <button onClick={handleLogout} className="text-sm py-1 px-3 bg-red-600 hover:bg-red-700 rounded-md text-white">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setShowLoginModal(true)} className="text-sm py-1 px-3 bg-green-600 hover:bg-green-700 rounded-md text-white">
                            Login
                        </button>
                    )}
                </div>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div className="lg:col-span-2 xl:col-span-3">
                    <CustomCodeEditor
                        value={query}
                        onChange={setQuery}
                        onRunQuery={runQuery}
                        isLoading={isLoading}
                        preferences={preferences}
                        error={queryError}
                        schema={MOCK_SCHEMA}
                    />
                </div>
                <div className="lg:col-span-1 xl:col-span-1 flex flex-col space-y-6">
                    <Card title="Example Queries">
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {exampleQueries.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setQuery(q)}
                                    className="w-full text-left p-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs font-mono text-gray-300 truncate"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </Card>
                    <Card title="Quick Actions">
                        <div className="space-y-2">
                            <button onClick={() => setShowLoginModal(true)} disabled={isAuthenticated} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 text-sm">
                                {isAuthenticated ? 'Logged In' : 'Switch User / Login'}
                            </button>
                            <button onClick={() => setActiveTab('settings')} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                                Open Settings
                            </button>
                            <button onClick={() => MockNotificationService.pushNotification({ type: 'info', message: 'This is a test info message!', action: { label: 'Click Me', callback: () => alert('Hello!') } })} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                                Test Notification
                            </button>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex bg-gray-800 rounded-lg shadow-md border border-gray-700 mb-6 sticky top-0 z-40">
                <TabButton label="Results" isActive={activeTab === 'results'} onClick={() => setActiveTab('results')} />
                <TabButton label="Charts" isActive={activeTab === 'charts'} onClick={() => setActiveTab('charts')} />
                <TabButton label="History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                <TabButton label="Favorites" isActive={activeTab === 'favorites'} onClick={() => setActiveTab('favorites')} />
                <TabButton label="Schema" isActive={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
                <TabButton label="Data Viewer" isActive={activeTab === 'data'} onClick={() => setActiveTab('data')} />
                <TabButton label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>

            <div>
                {activeTab === 'results' && (
                    <Card title="Query Results">
                        {isLoading && <p className="text-center text-gray-400">Executing query...</p>}
                        {queryError && <p className="text-center text-red-400 bg-red-900/30 p-4 rounded-lg">{queryError}</p>}
                        {results && results.rows.length > 0 && (
                            <PaginatedTable
                                headers={results.headers}
                                data={results.rows}
                                pageSize={preferences.resultPageSize}
                                title={`Found ${results.rowCount} records in ${results.queryTimeMs?.toFixed(2) || 0}ms ${results.isCached ? '(cached)' : ''}`}
                                onRowClick={(rowData, rowIndex) => MockNotificationService.pushNotification({ type: 'info', message: `Clicked row ${rowIndex}: ${JSON.stringify(rowData).substring(0, 100)}...` })}
                            />
                        )}
                        {!isLoading && !queryError && (!results || results.rows.length === 0) && <p className="text-center text-gray-500">Query results will appear here. No results or empty query.</p>}
                    </Card>
                )}

                {activeTab === 'charts' && (
                    <Card title="Query Result Visualizations">
                        <QueryResultCharts results={results} />
                    </Card>
                )}

                {activeTab === 'history' && <QueryHistoryPanel onSelectQuery={handleSelectHistoryQuery} />}
                {activeTab === 'favorites' && <QueryFavoritesPanel onSelectQuery={handleSelectFavoriteQuery} />}
                {activeTab === 'schema' && <SchemaBrowser onSelectTable={handleTableSelectedFromSchema} onSelectColumn={handleColumnSelectedFromSchema} />}
                {activeTab === 'data' && <DataViewer tableName={dataViewerTableName} />}
                {activeTab === 'settings' && <SettingsPanel preferences={preferences} onSavePreferences={handleSavePreferences} />}
            </div>

            <NotificationStack />
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
    );
};

export default DemoBankDBQLView;

export const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = React.memo(({ label, isActive, onClick }) => (
    <button
        className={`flex-1 py-3 px-4 text-center text-sm font-medium rounded-t-lg transition-colors duration-200
                   ${isActive ? 'bg-gray-900 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
        onClick={onClick}
    >
        {label}
    </button>
));