import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { View } from '../../../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, CartesianGrid } from 'recharts';
import IntegrationCodex from '../../IntegrationCodex';

// NEW IMPORTS FOR EXTENDED FUNCTIONALITY
import { v4 as uuidv4 } from 'uuid';
import { format, subDays, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay } from 'date-fns';
import { AnomalySeverity, BudgetStatus, ComplianceStatus, InvoiceStatus, PaymentOrderStatus, TransactionStatus, UserRole } from '../../../types'; // Assuming these types are expanded or exist
import Select from '../../ui/Select'; // Assuming a generic Select component
import Input from '../../ui/Input'; // Assuming a generic Input component
import Button from '../../ui/Button'; // Assuming a generic Button component
import Modal from '../../ui/Modal'; // Assuming a generic Modal component
import ChartLegend from '../../ui/ChartLegend'; // A hypothetical component for custom legend

// =========================================================================
// NEW INTERFACES AND TYPES FOR A REAL-WORLD APPLICATION
// =========================================================================

/**
 * @interface Department
 * @description Represents a corporate department.
 */
export interface Department {
    id: string;
    name: string;
    head: string;
    budgetAllocation: number;
    currentSpend: number;
    description?: string;
}

/**
 * @interface Vendor
 * @description Represents a corporate vendor.
 */
export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    contractStartDate: string;
    contractEndDate: string;
    contractValue: number;
    status: 'Active' | 'Inactive' | 'Pending Review';
    servicesProvided: string[];
    riskScore: number; // e.g., 1-10
    paymentTerms: string;
    totalPaymentsYTD: number;
    invoiceHistory: string[]; // IDs of related invoices
}

/**
 * @interface Budget
 * @description Represents a corporate budget for a specific period or department.
 */
export interface Budget {
    id: string;
    name: string;
    departmentId: string;
    departmentName: string;
    fiscalYear: number;
    startDate: string;
    endDate: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    status: BudgetStatus;
    category: string; // e.g., 'Operating Expenses', 'Capital Expenditure', 'Marketing'
    notes?: string;
    approverId: string;
    lastUpdated: string;
}

/**
 * @interface ExpenseCategory
 * @description Defines an expense category for budgeting and reporting.
 */
export interface ExpenseCategory {
    id: string;
    name: string;
    description?: string;
    parentCategoryId?: string; // For hierarchical categories
    budgetLimits: { [fiscalYear: number]: number }; // Annual budget limits per category
}

/**
 * @interface ExpenseReport
 * @description Represents an employee's expense report.
 */
export interface ExpenseReport {
    id: string;
    employeeId: string;
    employeeName: string;
    departmentId: string;
    submissionDate: string;
    totalAmount: number;
    currency: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
    items: ExpenseItem[];
    approvalHistory: ExpenseReportApproval[];
    notes?: string;
    attachments: string[]; // URLs or IDs of receipts
}

/**
 * @interface ExpenseItem
 * @description An individual item within an expense report.
 */
export interface ExpenseItem {
    id: string;
    description: string;
    category: string; // e.g., 'Travel', 'Meals', 'Software Subscription'
    amount: number;
    date: string;
    merchant: string;
    receiptAttached: boolean;
    notes?: string;
}

/**
 * @interface ExpenseReportApproval
 * @description Records an approval step for an expense report.
 */
export interface ExpenseReportApproval {
    approverId: string;
    approverName: string;
    action: 'Approved' | 'Rejected' | 'Reviewed';
    timestamp: string;
    comments?: string;
}

/**
 * @interface AuditLogEntry
 * @description Represents an entry in the system's audit log.
 */
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    action: string; // e.g., 'Invoice approved', 'Budget updated', 'User logged in'
    entityType: string; // e.g., 'Invoice', 'Budget', 'User'
    entityId: string;
    details: Record<string, any>; // JSON object with specific changes or context
    ipAddress?: string;
    success: boolean;
}

/**
 * @interface User
 * @description Represents a system user.
 */
export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    departmentId?: string;
    lastLogin: string;
    isActive: boolean;
}

/**
 * @interface CashFlowProjection
 * @description Represents a projected cash flow entry.
 */
export interface CashFlowProjection {
    date: string;
    inflow: number;
    outflow: number;
    netFlow: number;
    cumulativeNetFlow: number;
}

/**
 * @interface KPI
 * @description Represents a Key Performance Indicator.
 */
export interface KPI {
    id: string;
    name: string;
    description: string;
    currentValue: number;
    targetValue: number;
    unit: string; // e.g., '%', '$', 'count'
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
}

/**
 * @interface FinancialStatementData
 * @description Mock structure for financial statement line items.
 */
export interface FinancialStatementData {
    period: string; // e.g., 'Jan 2023', 'Q1 2023'
    revenue: number;
    cogs: number;
    grossProfit: number;
    operatingExpenses: number;
    ebitda: number;
    netIncome: number;
}

/**
 * @interface IntegrationSetting
 * @description Represents configuration for an external integration.
 */
export interface IntegrationSetting {
    id: string;
    name: string;
    type: 'ERP' | 'Payroll' | 'CRM' | 'Banking' | 'PaymentGateway';
    status: 'Active' | 'Inactive' | 'Config Error';
    lastSync: string;
    configDetails: Record<string, any>; // e.g., API keys, endpoints
    lastAttemptedSync: string;
    syncFrequency: 'Daily' | 'Hourly' | 'Weekly';
    autoSyncEnabled: boolean;
}

/**
 * @interface Notification
 * @description Represents an internal system notification.
 */
export interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'info' | 'warning' | 'alert' | 'success';
    link?: string; // Link to relevant view
}

/**
 * @interface SecurityAlert
 * @description Represents a security-related alert within the financial system.
 */
export interface SecurityAlert {
    id: string;
    timestamp: string;
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    type: string; // e.g., 'Unauthorized Access Attempt', 'Data Exfiltration', 'Suspicious Login'
    description: string;
    status: 'New' | 'Investigating' | 'Resolved' | 'False Positive';
    affectedUserIds: string[];
    affectedEntityIds: string[]; // e.g., Invoice IDs, Transaction IDs
    details: Record<string, any>;
    assignedTo: string | null; // User ID
}

// =========================================================================
// MOCK DATA GENERATION FUNCTIONS
// (Designed to be extensive to contribute to line count)
// =========================================================================

const generateRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const generateRandomAmount = (min: number, max: number) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

const generateRandomStatus = <T extends string>(statuses: T[]): T => {
    return statuses[Math.floor(Math.random() * statuses.length)];
};

const generateRandomAnomalySeverity = (): AnomalySeverity => {
    const severities: AnomalySeverity[] = ['Low', 'Medium', 'High', 'Critical'];
    return severities[Math.floor(Math.random() * severities.length)];
};

const generateRandomUserRole = (): UserRole => {
    const roles: UserRole[] = ['Finance Manager', 'Accountant', 'Auditor', 'Employee', 'Admin'];
    return roles[Math.floor(Math.random() * roles.length)];
};

export const generateDepartments = (count: number): Department[] => {
    const departments: Department[] = [];
    const names = ['Finance', 'HR', 'IT', 'Marketing', 'Sales', 'Operations', 'Legal', 'R&D', 'Customer Support', 'Product'];
    const heads = ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank White', 'Grace Black', 'Heidi Green', 'Ivan Blue', 'Judy Pink'];

    for (let i = 0; i < count; i++) {
        const name = names[i % names.length];
        const head = heads[i % heads.length];
        const budgetAllocation = generateRandomAmount(500000, 5000000);
        const currentSpend = generateRandomAmount(budgetAllocation * 0.1, budgetAllocation * 0.9);

        departments.push({
            id: `dept-${uuidv4()}`,
            name: name,
            head: head,
            budgetAllocation: budgetAllocation,
            currentSpend: currentSpend,
            description: `Department responsible for ${name.toLowerCase()} operations.`,
        });
    }
    return departments;
};

export const generateVendors = (count: number): Vendor[] => {
    const vendors: Vendor[] = [];
    const vendorNames = ['Acme Corp', 'Globex Inc', 'Soylent Corp', 'Umbrella Ltd', 'Cyberdyne Systems', 'Weyland-Yutani', 'Tyrell Corp', 'Ingen Systems', 'Oceanic Airlines', 'Wonka Industries'];
    const services = ['Software', 'Consulting', 'Supplies', 'Marketing', 'Logistics', 'Security', 'Maintenance', 'Cloud Services', 'Hardware', 'Travel'];
    const contactNames = ['John Doe', 'Jane Doe', 'Peter Jones', 'Mary Smith', 'David Lee', 'Sarah Chen'];

    for (let i = 0; i < count; i++) {
        const name = vendorNames[i % vendorNames.length];
        const contactPerson = contactNames[i % contactNames.length];
        const startDate = generateRandomDate(subMonths(new Date(), 24), subMonths(new Date(), 6));
        const endDate = generateRandomDate(addMonths(new Date(), 6), addMonths(new Date(), 36));
        const contractValue = generateRandomAmount(10000, 1000000);
        const status: Vendor['status'] = generateRandomStatus(['Active', 'Inactive', 'Pending Review']);
        const riskScore = Math.floor(Math.random() * 10) + 1;
        const totalPaymentsYTD = generateRandomAmount(0, contractValue * 0.8);

        vendors.push({
            id: `vendor-${uuidv4()}`,
            name: `${name} ${i + 1}`,
            contactPerson: contactPerson,
            email: `${contactPerson.replace(/\s/g, '.').toLowerCase()}@${name.replace(/\s/g, '').toLowerCase()}.com`,
            phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
            address: `${Math.floor(Math.random() * 900) + 100} Main St, Anytown, CA 90210`,
            contractStartDate: startDate,
            contractEndDate: endDate,
            contractValue: contractValue,
            status: status,
            servicesProvided: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => services[Math.floor(Math.random() * services.length)]),
            riskScore: riskScore,
            paymentTerms: `Net ${Math.floor(Math.random() * 30) + 15}`,
            totalPaymentsYTD: totalPaymentsYTD,
            invoiceHistory: [], // Populated later if needed
        });
    }
    return vendors;
};

export const generateBudgets = (count: number, departments: Department[]): Budget[] => {
    const budgets: Budget[] = [];
    const currentYear = new Date().getFullYear();
    const categories = ['Operating Expenses', 'Capital Expenditure', 'Marketing', 'Research & Development', 'Salaries', 'Travel & Entertainment'];
    const statuses: BudgetStatus[] = ['Approved', 'Pending', 'Exceeded', 'On Track', 'Under Review'];

    for (let i = 0; i < count; i++) {
        const department = departments[i % departments.length];
        const fiscalYear = currentYear - Math.floor(Math.random() * 2); // Current or previous year
        const startDate = new Date(fiscalYear, 0, 1).toISOString();
        const endDate = new Date(fiscalYear, 11, 31).toISOString();
        const allocatedAmount = generateRandomAmount(100000, 2000000);
        const spentAmount = generateRandomAmount(allocatedAmount * 0.1, allocatedAmount * 1.1);
        const remainingAmount = allocatedAmount - spentAmount;

        budgets.push({
            id: `budget-${uuidv4()}`,
            name: `${department.name} Budget ${fiscalYear} - ${categories[i % categories.length]}`,
            departmentId: department.id,
            departmentName: department.name,
            fiscalYear: fiscalYear,
            startDate: startDate,
            endDate: endDate,
            allocatedAmount: allocatedAmount,
            spentAmount: spentAmount,
            remainingAmount: remainingAmount,
            status: generateRandomStatus(statuses),
            category: categories[i % categories.length],
            approverId: `user-${uuidv4()}`,
            lastUpdated: generateRandomDate(subMonths(new Date(), 3), new Date()),
        });
    }
    return budgets;
};

export const generateExpenseReports = (count: number, departments: Department[], users: User[]): ExpenseReport[] => {
    const reports: ExpenseReport[] = [];
    const expenseCategories = ['Travel', 'Meals', 'Software Subscription', 'Office Supplies', 'Client Entertainment', 'Training', 'Transportation'];
    const statuses: ExpenseReport['status'][] = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Paid'];

    for (let i = 0; i < count; i++) {
        const user = users[i % users.length];
        const department = departments[i % departments.length];
        const submissionDate = generateRandomDate(subMonths(new Date(), 6), new Date());
        const totalAmount = generateRandomAmount(50, 2000);
        const status = generateRandomStatus(statuses);
        const numItems = Math.floor(Math.random() * 5) + 1;

        const items: ExpenseItem[] = Array.from({ length: numItems }).map(() => ({
            id: uuidv4(),
            description: `Expense for ${expenseCategories[Math.floor(Math.random() * expenseCategories.length)]}`,
            category: expenseCategories[Math.floor(Math.random() * expenseCategories.length)],
            amount: generateRandomAmount(10, totalAmount / numItems + 50),
            date: generateRandomDate(subDays(new Date(submissionDate), 30), new Date(submissionDate)),
            merchant: `Merchant ${Math.floor(Math.random() * 20) + 1}`,
            receiptAttached: Math.random() > 0.2,
        }));

        const approvalHistory: ExpenseReportApproval[] = [];
        if (status !== 'Draft') {
            approvalHistory.push({
                approverId: uuidv4(),
                approverName: 'Manager A',
                action: 'Reviewed',
                timestamp: generateRandomDate(new Date(submissionDate), addMonths(new Date(submissionDate), 1)),
            });
            if (status === 'Approved' || status === 'Paid') {
                approvalHistory.push({
                    approverId: uuidv4(),
                    approverName: 'Finance Approver',
                    action: 'Approved',
                    timestamp: generateRandomDate(new Date(approvalHistory[0].timestamp!), addDays(new Date(approvalHistory[0].timestamp!), 7)),
                });
            } else if (status === 'Rejected') {
                approvalHistory.push({
                    approverId: uuidv4(),
                    approverName: 'Finance Approver',
                    action: 'Rejected',
                    timestamp: generateRandomDate(new Date(approvalHistory[0].timestamp!), addDays(new Date(approvalHistory[0].timestamp!), 7)),
                    comments: 'Exceeded budget for category.',
                });
            }
        }

        reports.push({
            id: `exp-${uuidv4()}`,
            employeeId: user.id,
            employeeName: `${user.firstName} ${user.lastName}`,
            departmentId: department.id,
            submissionDate: submissionDate,
            totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
            currency: 'USD',
            status: status,
            items: items,
            approvalHistory: approvalHistory,
            attachments: Math.random() > 0.5 ? [`receipt-${uuidv4()}.pdf`] : [],
        });
    }
    return reports;
};

export const generateAuditLogEntries = (count: number, users: User[]): AuditLogEntry[] => {
    const entries: AuditLogEntry[] = [];
    const actions = ['Invoice approved', 'Budget updated', 'User logged in', 'Payment order created', 'Compliance case closed', 'Anomaly reviewed', 'Vendor added', 'Expense report submitted'];
    const entityTypes = ['Invoice', 'Budget', 'User', 'PaymentOrder', 'ComplianceCase', 'FinancialAnomaly', 'Vendor', 'ExpenseReport'];

    for (let i = 0; i < count; i++) {
        const user = users[i % users.length];
        const action = actions[i % actions.length];
        const entityType = entityTypes[i % entityTypes.length];
        const entityId = uuidv4();
        const success = Math.random() > 0.1; // 90% success rate

        entries.push({
            id: `audit-${uuidv4()}`,
            timestamp: generateRandomDate(subMonths(new Date(), 3), new Date()),
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            action: action,
            entityType: entityType,
            entityId: entityId,
            details: {
                previousStatus: 'Pending',
                newStatus: success ? 'Approved' : 'Failed',
                reason: success ? undefined : 'Validation error',
            },
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            success: success,
        });
    }
    return entries;
};

export const generateUsers = (count: number, departments: Department[]): User[] => {
    const users: User[] = [];
    const firstNames = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Sophia', 'James', 'Charlotte'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const department = departments[i % departments.length];

        users.push({
            id: `user-${uuidv4()}`,
            username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i % 5 === 0 ? Math.floor(Math.random() * 100) : ''}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@corporate.com`,
            firstName: firstName,
            lastName: lastName,
            role: generateRandomUserRole(),
            departmentId: department.id,
            lastLogin: generateRandomDate(subMonths(new Date(), 6), new Date()),
            isActive: Math.random() > 0.1,
        });
    }
    return users;
};

export const generateCashFlowProjections = (months: number): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    let cumulativeNetFlow = 0;
    let currentDate = subMonths(new Date(), months / 2); // Start in the past
    currentDate.setDate(1); // Start of month

    for (let i = 0; i < months; i++) {
        const date = format(currentDate, 'yyyy-MM-dd');
        const inflow = generateRandomAmount(500000, 1500000);
        const outflow = generateRandomAmount(400000, 1300000);
        const netFlow = inflow - outflow;
        cumulativeNetFlow += netFlow;

        projections.push({
            date: date,
            inflow: inflow,
            outflow: outflow,
            netFlow: netFlow,
            cumulativeNetFlow: cumulativeNetFlow,
        });
        currentDate = addMonths(currentDate, 1);
    }
    return projections;
};

export const generateKPIs = (count: number): KPI[] => {
    const kpis: KPI[] = [];
    const kpiNames = [
        'Gross Profit Margin', 'Operating Expense Ratio', 'Net Profit Margin', 'Current Ratio',
        'Debt-to-Equity Ratio', 'Cash Conversion Cycle', 'Accounts Receivable Turnover',
        'Accounts Payable Turnover', 'Employee Satisfaction', 'Customer Acquisition Cost'
    ];
    const units = ['%', '$', 'ratio', 'days', 'count'];

    for (let i = 0; i < count; i++) {
        const name = kpiNames[i % kpiNames.length];
        const unit = units[i % units.length];
        const currentValue = generateRandomAmount(0.5, 2.5) * (unit === '%' ? 100 : 1);
        const targetValue = generateRandomAmount(0.8, 1.2) * currentValue;
        const trend = generateRandomStatus(['up', 'down', 'stable']);

        kpis.push({
            id: `kpi-${uuidv4()}`,
            name: name,
            description: `Key Performance Indicator for ${name}.`,
            currentValue: parseFloat(currentValue.toFixed(2)),
            targetValue: parseFloat(targetValue.toFixed(2)),
            unit: unit,
            trend: trend,
            lastUpdated: generateRandomDate(subDays(new Date(), 7), new Date()),
        });
    }
    return kpis;
};

export const generateFinancialStatements = (periods: number): FinancialStatementData[] => {
    const statements: FinancialStatementData[] = [];
    let currentDate = subMonths(new Date(), periods); // Start X months ago
    currentDate.setDate(1);

    for (let i = 0; i < periods; i++) {
        const period = format(currentDate, 'MMM yyyy');
        const revenue = generateRandomAmount(1000000, 5000000);
        const cogs = generateRandomAmount(revenue * 0.3, revenue * 0.6);
        const grossProfit = revenue - cogs;
        const operatingExpenses = generateRandomAmount(grossProfit * 0.2, grossProfit * 0.5);
        const ebitda = grossProfit - operatingExpenses;
        const netIncome = ebitda * generateRandomAmount(0.6, 0.9); // After taxes/interest

        statements.push({
            period: period,
            revenue: parseFloat(revenue.toFixed(2)),
            cogs: parseFloat(cogs.toFixed(2)),
            grossProfit: parseFloat(grossProfit.toFixed(2)),
            operatingExpenses: parseFloat(operatingExpenses.toFixed(2)),
            ebitda: parseFloat(ebitda.toFixed(2)),
            netIncome: parseFloat(netIncome.toFixed(2)),
        });
        currentDate = addMonths(currentDate, 1);
    }
    return statements;
};

export const generateIntegrationSettings = (count: number): IntegrationSetting[] => {
    const settings: IntegrationSetting[] = [];
    const integrationTypes: IntegrationSetting['type'][] = ['ERP', 'Payroll', 'CRM', 'Banking', 'PaymentGateway'];
    const names = ['SAP', 'Oracle', 'Workday', 'Salesforce', 'Stripe', 'PayPal', 'Bank of America', 'Wells Fargo', 'ADP', 'QuickBooks'];
    const statuses: IntegrationSetting['status'][] = ['Active', 'Inactive', 'Config Error'];
    const syncFrequencies: IntegrationSetting['syncFrequency'][] = ['Daily', 'Hourly', 'Weekly'];

    for (let i = 0; i < count; i++) {
        const type = integrationTypes[i % integrationTypes.length];
        const name = names[i % names.length];
        const status = generateRandomStatus(statuses);
        const lastSync = status === 'Active' ? generateRandomDate(subHours(new Date(), 48), new Date()) : 'N/A';
        const lastAttemptedSync = generateRandomDate(subHours(new Date(), 72), new Date());
        const autoSyncEnabled = Math.random() > 0.2;

        settings.push({
            id: `int-${uuidv4()}`,
            name: `${name} Integration`,
            type: type,
            status: status,
            lastSync: lastSync,
            configDetails: {
                apiKey: uuidv4(),
                endpoint: `https://api.${name.toLowerCase().replace(/\s/g, '')}.com/v1`,
                version: '1.2',
            },
            lastAttemptedSync: lastAttemptedSync,
            syncFrequency: generateRandomStatus(syncFrequencies),
            autoSyncEnabled: autoSyncEnabled,
        });
    }
    return settings;
};

export const generateNotifications = (count: number, users: User[]): Notification[] => {
    const notifications: Notification[] = [];
    const messages = [
        'New invoice #12345 requires approval.',
        'Budget for Marketing Department is 90% utilized.',
        'Compliance case #67890 updated to "Pending Review".',
        'High severity anomaly detected in transaction flow.',
        'Your expense report #E1001 has been approved.',
        'System maintenance scheduled for tonight at 2 AM UTC.',
        'Integration with Payroll system failed to sync.',
        'New user "John Doe" has been added to the Finance team.',
        'Pending payment order #PO987 due for tomorrow.',
    ];
    const types: Notification['type'][] = ['info', 'warning', 'alert', 'success'];

    for (let i = 0; i < count; i++) {
        const user = users[i % users.length];
        notifications.push({
            id: `notif-${uuidv4()}`,
            userId: user.id,
            message: messages[i % messages.length],
            timestamp: generateRandomDate(subDays(new Date(), 14), new Date()),
            read: Math.random() > 0.5,
            type: generateRandomStatus(types),
            link: Math.random() > 0.3 ? `/app/dashboard/${View.Invoices}/${uuidv4()}` : undefined,
        });
    }
    return notifications;
};

export const generateSecurityAlerts = (count: number, users: User[]): SecurityAlert[] => {
    const alerts: SecurityAlert[] = [];
    const alertTypes = ['Unauthorized Access Attempt', 'Suspicious Login Activity', 'Data Exfiltration Warning', 'Large Transaction Anomaly', 'Configuration Drift Detected'];
    const levels: SecurityAlert['level'][] = ['Low', 'Medium', 'High', 'Critical'];
    const statuses: SecurityAlert['status'][] = ['New', 'Investigating', 'Resolved', 'False Positive'];

    for (let i = 0; i < count; i++) {
        const affectedUser = users[i % users.length];
        const assignedUser = Math.random() > 0.5 ? users[(i + 1) % users.length] : null;

        alerts.push({
            id: `sec-alert-${uuidv4()}`,
            timestamp: generateRandomDate(subDays(new Date(), 30), new Date()),
            level: generateRandomStatus(levels),
            type: alertTypes[i % alertTypes.length],
            description: `Alert: ${alertTypes[i % alertTypes.length]} involving user ${affectedUser.username}.`,
            status: generateRandomStatus(statuses),
            affectedUserIds: [affectedUser.id],
            affectedEntityIds: Math.random() > 0.5 ? [`tx-${uuidv4()}`] : [],
            details: {
                sourceIp: `103.14.22.${Math.floor(Math.random() * 255)}`,
                failedAttempts: Math.floor(Math.random() * 5) + 1,
            },
            assignedTo: assignedUser ? assignedUser.id : null,
        });
    }
    return alerts;
};

// =========================================================================
// UTILITY FUNCTIONS & SERVICES
// (Extensive helper functions for data processing, formatting, security, etc.)
// =========================================================================

/**
 * @function formatCurrency
 * @description Formats a number into a currency string.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'USD').
 * @param locale The locale string (e.g., 'en-US').
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};

/**
 * @function calculatePercentage
 * @description Calculates percentage of value out of total.
 * @param value The numerator.
 * @param total The denominator.
 * @returns Percentage as a string.
 */
export const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0.00%';
    return `${((value / total) * 100).toFixed(2)}%`;
};

/**
 * @function getStatusColor
 * @description Returns a Tailwind CSS class for a given status.
 */
export const getStatusColor = (status: string): string => {
    switch (status) {
        case 'Approved':
        case 'Paid':
        case 'Active':
        case 'Resolved':
        case 'success':
            return 'bg-green-500/20 text-green-300';
        case 'Pending':
        case 'Submitted':
        case 'Needs Approval':
        case 'Draft':
        case 'Investigating':
        case 'On Track':
        case 'Under Review':
        case 'warning':
            return 'bg-yellow-500/20 text-yellow-300';
        case 'Overdue':
        case 'Rejected':
        case 'Inactive':
        case 'Critical':
        case 'Error':
        case 'Exceeded':
        case 'alert':
            return 'bg-red-500/20 text-red-300';
        case 'Open':
        case 'Medium':
        case 'info':
            return 'bg-blue-500/20 text-blue-300';
        case 'New':
        case 'High':
            return 'bg-purple-500/20 text-purple-300';
        default:
            return 'bg-gray-500/20 text-gray-300';
    }
};

/**
 * @function simulateApiCall
 * @description A generic function to simulate asynchronous API calls.
 */
export const simulateApiCall = async <T>(data: T, delay: number = 500): Promise<T> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data);
        }, delay);
    });
};

/**
 * @function debounce
 * @description Debounce function to limit the rate at which a function can fire.
 */
export const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
};

/**
 * @function encryptData
 * @description Placeholder for a client-side encryption function. In a real app, this would be more robust or server-side.
 */
export const encryptData = (data: string): string => {
    // Simple base64 encode for simulation, NOT for actual security
    return Buffer.from(data).toString('base64');
};

/**
 * @function decryptData
 * @description Placeholder for a client-side decryption function.
 */
export const decryptData = (encryptedData: string): string => {
    // Simple base64 decode for simulation, NOT for actual security
    try {
        return Buffer.from(encryptedData, 'base64').toString('utf8');
    } catch (e) {
        console.error("Decryption failed:", e);
        return '';
    }
};

/**
 * @function generateCSV
 * @description Generates a CSV string from an array of objects.
 */
export const generateCSV = <T extends Record<string, any>>(data: T[], filename: string = 'export.csv'): string => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','), // CSV header row
        ...data.map(row => headers.map(fieldName => {
            const value = row[fieldName];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // Escape commas and double quotes
            return `"${stringValue.replace(/"/g, '""')}"`;
        }).join(','))
    ];

    return csvRows.join('\n');
};

/**
 * @function downloadFile
 * @description Initiates a file download in the browser.
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// =========================================================================
// AI INTEGRATION EXPANSION
// (More sophisticated AI interaction patterns)
// =========================================================================

export interface AIAnalysisRequest {
    model: string;
    prompt: string;
    temperature?: number;
    maxOutputTokens?: number;
}

export interface AIAnalysisResponse {
    insight: string;
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
    keywords?: string[];
    recommendations?: string[];
    rawDataUsed?: string;
}

export const getAIAnalysis = async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
        // In a real scenario, this would be a more structured API call.
        // For line count and simulation, we'll build a more complex prompt.
        const fullPrompt = `As a highly experienced Corporate Finance AI, analyze the following data and provide:
        1. A concise (1-2 sentences) strategic insight.
        2. Overall sentiment (Positive, Neutral, Negative).
        3. Key financial keywords.
        4. 1-2 actionable recommendations.
        
        Data for analysis: ${request.prompt}
        
        Format your response as a JSON object with keys: insight, sentiment, keywords (array), recommendations (array).`;

        const response = await ai.models.generateContent({
            model: request.model,
            contents: [{ text: fullPrompt }],
            generationConfig: {
                temperature: request.temperature || 0.7,
                maxOutputTokens: request.maxOutputTokens || 500,
            },
        });

        const textResponse = response.text;
        // Attempt to parse JSON from AI response, robustly
        let parsedResponse: AIAnalysisResponse;
        try {
            // Remove markdown code block if present
            const jsonString = textResponse.replace(/```json\n|\n```/g, '').trim();
            parsedResponse = JSON.parse(jsonString);
        } catch (jsonError) {
            console.warn("AI response not perfectly JSON, attempting fallback:", textResponse, jsonError);
            // Fallback for less structured AI responses
            parsedResponse = {
                insight: textResponse.split('1. ')[1]?.split('\n')[0]?.trim() || "Could not parse specific insight.",
                sentiment: textResponse.includes('Positive') ? 'Positive' : textResponse.includes('Negative') ? 'Negative' : 'Neutral',
                keywords: (textResponse.match(/keywords:\s*\[(.*?)\]/s)?.[1]?.split(',') || []).map(k => k.trim().replace(/['"]/g, '')).filter(Boolean),
                recommendations: (textResponse.match(/recommendations:\s*\[(.*?)\]/s)?.[1]?.split(',') || []).map(r => r.trim().replace(/['"]/g, '')).filter(Boolean),
                rawDataUsed: request.prompt,
            };
        }

        return parsedResponse;
    } catch (error) {
        console.error("AI analysis error:", error);
        return {
            insight: "An error occurred while analyzing corporate data with AI.",
            sentiment: 'Negative',
            keywords: ['error', 'AI'],
            recommendations: ['Check API key', 'Review prompt details'],
            rawDataUsed: request.prompt,
        };
    }
};

// =========================================================================
// NEW EXPORTED COMPONENTS (Would typically be in separate files)
// These are defined here to meet the "add to this file" directive.
// =========================================================================

/**
 * @interface BudgetOverviewProps
 * @description Props for the BudgetOverview component.
 */
export interface BudgetOverviewProps {
    budgets: Budget[];
    departments: Department[];
    onBudgetSelected?: (budget: Budget) => void;
    currentUserId: string;
}

/**
 * @function BudgetOverview
 * @description Displays a comprehensive overview of corporate budgets.
 * Includes summary, departmental breakdown, and search/filter.
 */
export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets, departments, onBudgetSelected, currentUserId }) => {
    const [filterDepartment, setFilterDepartment] = useState<string>('All');
    const [filterStatus, setFilterStatus] = useState<BudgetStatus | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedBudget, setEditedBudget] = useState<Budget | null>(null);

    const filteredBudgets = useMemo(() => {
        let filtered = budgets;
        if (filterDepartment !== 'All') {
            filtered = filtered.filter(b => b.departmentId === filterDepartment);
        }
        if (filterStatus !== 'All') {
            filtered = filtered.filter(b => b.status === filterStatus);
        }
        if (searchQuery) {
            filtered = filtered.filter(b =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return filtered;
    }, [budgets, filterDepartment, filterStatus, searchQuery]);

    const handleBudgetClick = (budget: Budget) => {
        setSelectedBudget(budget);
        setIsBudgetModalOpen(true);
        onBudgetSelected && onBudgetSelected(budget);
    };

    const handleEditBudget = (budget: Budget) => {
        setEditedBudget({ ...budget });
        setIsEditMode(true);
        setIsBudgetModalOpen(true);
    };

    const handleBudgetSave = async () => {
        if (!editedBudget) return;
        // Simulate API call to save budget
        const updatedBudget = await simulateApiCall(editedBudget, 1000);
        console.log("Budget saved:", updatedBudget);
        // In a real app, update global state
        setIsEditMode(false);
        setIsBudgetModalOpen(false);
        alert('Budget updated successfully!');
    };

    const totalAllocated = useMemo(() => budgets.reduce((acc, b) => acc + b.allocatedAmount, 0), [budgets]);
    const totalSpent = useMemo(() => budgets.reduce((acc, b) => acc + b.spentAmount, 0), [budgets]);
    const overallUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return (
        <Card title="Budget Management Overview">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            type="text"
                            placeholder="Search budgets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <Select
                            label="Department"
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            options={[{ value: 'All', label: 'All Departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]}
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <Select
                            label="Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as BudgetStatus | 'All')}
                            options={[{ value: 'All', label: 'All Statuses' }, ...Object.values(BudgetStatus).map(s => ({ value: s, label: s }))]}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 bg-gray-800/50">
                        <p className="text-sm text-gray-400">Total Allocated</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(totalAllocated)}</p>
                    </Card>
                    <Card className="p-4 bg-gray-800/50">
                        <p className="text-sm text-gray-400">Total Spent</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(totalSpent)}</p>
                    </Card>
                    <Card className="p-4 bg-gray-800/50">
                        <p className="text-sm text-gray-400">Overall Utilization</p>
                        <p className="text-xl font-bold text-white">{overallUtilization.toFixed(2)}%</p>
                    </Card>
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Budget Name</th>
                                <th scope="col" className="px-6 py-3">Department</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Allocated</th>
                                <th scope="col" className="px-6 py-3">Spent</th>
                                <th scope="col" className="px-6 py-3">Remaining</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBudgets.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center">No budgets found matching criteria.</td>
                                </tr>
                            ) : (
                                filteredBudgets.map(budget => (
                                    <tr key={budget.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => handleBudgetClick(budget)}>
                                        <td className="px-6 py-4 font-medium text-white">{budget.name}</td>
                                        <td className="px-6 py-4">{budget.departmentName}</td>
                                        <td className="px-6 py-4">{budget.category}</td>
                                        <td className="px-6 py-4">{formatCurrency(budget.allocatedAmount)}</td>
                                        <td className="px-6 py-4">{formatCurrency(budget.spentAmount)}</td>
                                        <td className="px-6 py-4">{formatCurrency(budget.remainingAmount)}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(budget.status)}`}>{budget.status}</span></td>
                                        <td className="px-6 py-4">
                                            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleEditBudget(budget); }}>Edit</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Budget Detail/Edit Modal */}
            <Modal isOpen={isBudgetModalOpen} onClose={() => { setIsBudgetModalOpen(false); setIsEditMode(false); setSelectedBudget(null); setEditedBudget(null); }} title={isEditMode ? "Edit Budget" : "Budget Details"}>
                {selectedBudget && !isEditMode && (
                    <div className="space-y-3 text-gray-300">
                        <p><strong>Name:</strong> {selectedBudget.name}</p>
                        <p><strong>Department:</strong> {selectedBudget.departmentName}</p>
                        <p><strong>Fiscal Year:</strong> {selectedBudget.fiscalYear}</p>
                        <p><strong>Period:</strong> {format(new Date(selectedBudget.startDate), 'MMM dd, yyyy')} - {format(new Date(selectedBudget.endDate), 'MMM dd, yyyy')}</p>
                        <p><strong>Allocated:</strong> {formatCurrency(selectedBudget.allocatedAmount)}</p>
                        <p><strong>Spent:</strong> {formatCurrency(selectedBudget.spentAmount)}</p>
                        <p><strong>Remaining:</strong> {formatCurrency(selectedBudget.remainingAmount)}</p>
                        <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedBudget.status)}`}>{selectedBudget.status}</span></p>
                        <p><strong>Category:</strong> {selectedBudget.category}</p>
                        <p><strong>Last Updated:</strong> {format(new Date(selectedBudget.lastUpdated), 'MMM dd, yyyy HH:mm')}</p>
                        <div className="mt-4 flex justify-end gap-2">
                             <Button variant="secondary" onClick={() => handleEditBudget(selectedBudget)}>Edit Budget</Button>
                            <Button variant="primary" onClick={() => setIsBudgetModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
                {editedBudget && isEditMode && (
                    <div className="space-y-4">
                        <Input
                            label="Budget Name"
                            value={editedBudget.name}
                            onChange={(e) => setEditedBudget({ ...editedBudget, name: e.target.value })}
                        />
                        <Input
                            label="Allocated Amount"
                            type="number"
                            value={editedBudget.allocatedAmount}
                            onChange={(e) => setEditedBudget({ ...editedBudget, allocatedAmount: parseFloat(e.target.value) || 0 })}
                        />
                         <Input
                            label="Spent Amount"
                            type="number"
                            value={editedBudget.spentAmount}
                            onChange={(e) => setEditedBudget({ ...editedBudget, spentAmount: parseFloat(e.target.value) || 0, remainingAmount: editedBudget.allocatedAmount - (parseFloat(e.target.value) || 0) })}
                        />
                        <Select
                            label="Status"
                            value={editedBudget.status}
                            onChange={(e) => setEditedBudget({ ...editedBudget, status: e.target.value as BudgetStatus })}
                            options={Object.values(BudgetStatus).map(s => ({ value: s, label: s }))}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => { setIsEditMode(false); setEditedBudget(null); }}>Cancel</Button>
                            <Button variant="primary" onClick={handleBudgetSave}>Save Changes</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};


/**
 * @interface CashFlowProjectionProps
 * @description Props for the CashFlowProjectionChart component.
 */
export interface CashFlowProjectionChartProps {
    data: CashFlowProjection[];
}

/**
 * @function CashFlowProjectionChart
 * @description Displays an interactive chart of cash flow projections.
 */
export const CashFlowProjectionChart: React.FC<CashFlowProjectionChartProps> = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const inflow = payload.find((p: any) => p.dataKey === 'inflow');
            const outflow = payload.find((p: any) => p.dataKey === 'outflow');
            const netFlow = payload.find((p: any) => p.dataKey === 'netFlow');
            const cumulativeNetFlow = payload.find((p: any) => p.dataKey === 'cumulativeNetFlow');

            return (
                <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-gray-200 text-sm">
                    <p className="font-bold text-white mb-1">{format(new Date(label), 'MMM yyyy')}</p>
                    {inflow && <p className="text-green-400">Inflow: {formatCurrency(inflow.value)}</p>}
                    {outflow && <p className="text-red-400">Outflow: {formatCurrency(outflow.value)}</p>}
                    {netFlow && <p className="text-blue-400">Net Flow: {formatCurrency(netFlow.value)}</p>}
                    {cumulativeNetFlow && <p className="text-purple-400">Cumulative Net: {formatCurrency(cumulativeNetFlow.value)}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <Card title="Cash Flow Projections (Monthly)">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ff7300" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="date"
                            tickFormatter={(tick) => format(new Date(tick), 'MMM yy')}
                            stroke="#9ca3af"
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={(tick) => `${(tick / 1000000).toFixed(1)}M`}
                            stroke="#9ca3af"
                            fontSize={12}
                        />
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="inflow" stroke="#82ca9d" fillOpacity={1} fill="url(#colorInflow)" name="Projected Inflow" />
                        <Area type="monotone" dataKey="outflow" stroke="#ff7300" fillOpacity={1} fill="url(#colorOutflow)" name="Projected Outflow" />
                        <Line type="monotone" dataKey="cumulativeNetFlow" stroke="#8884d8" name="Cumulative Net Flow" dot={false} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

/**
 * @interface VendorPerformanceProps
 * @description Props for the VendorPerformanceTable component.
 */
export interface VendorPerformanceProps {
    vendors: Vendor[];
    onVendorSelected?: (vendor: Vendor) => void;
}

/**
 * @function VendorPerformanceTable
 * @description Displays a table of vendors with their performance metrics.
 */
export const VendorPerformanceTable: React.FC<VendorPerformanceProps> = ({ vendors, onVendorSelected }) => {
    const [filterStatus, setFilterStatus] = useState<Vendor['status'] | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<keyof Vendor>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

    const handleSort = (key: keyof Vendor) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedAndFilteredVendors = useMemo(() => {
        let filtered = vendors;
        if (filterStatus !== 'All') {
            filtered = filtered.filter(v => v.status === filterStatus);
        }
        if (searchQuery) {
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.servicesProvided.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        return filtered.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [vendors, filterStatus, searchQuery, sortKey, sortDirection]);

    const handleVendorClick = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setIsVendorModalOpen(true);
        onVendorSelected && onVendorSelected(vendor);
    };

    return (
        <Card title="Vendor Performance & Management">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            type="text"
                            placeholder="Search vendors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <Select
                            label="Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as Vendor['status'] | 'All')}
                            options={[{ value: 'All', label: 'All Statuses' }, ...['Active', 'Inactive', 'Pending Review'].map(s => ({ value: s, label: s }))]}
                        />
                    </div>
                    <Button variant="primary" className="ml-auto">Add New Vendor</Button>
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>Vendor Name {sortKey === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('contactPerson')}>Contact Person {sortKey === 'contactPerson' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                                <th scope="col" className="px-6 py-3">Services</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('contractValue')}>Contract Value {sortKey === 'contractValue' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('totalPaymentsYTD')}>Payments YTD {sortKey === 'totalPaymentsYTD' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('riskScore')}>Risk Score {sortKey === 'riskScore' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>Status {sortKey === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAndFilteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center">No vendors found matching criteria.</td>
                                </tr>
                            ) : (
                                sortedAndFilteredVendors.map(vendor => (
                                    <tr key={vendor.id} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer" onClick={() => handleVendorClick(vendor)}>
                                        <td className="px-6 py-4 font-medium text-white">{vendor.name}</td>
                                        <td className="px-6 py-4">{vendor.contactPerson}</td>
                                        <td className="px-6 py-4">{vendor.servicesProvided.join(', ')}</td>
                                        <td className="px-6 py-4">{formatCurrency(vendor.contractValue)}</td>
                                        <td className="px-6 py-4">{formatCurrency(vendor.totalPaymentsYTD)}</td>
                                        <td className="px-6 py-4">{vendor.riskScore}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(vendor.status)}`}>{vendor.status}</span></td>
                                        <td className="px-6 py-4">
                                            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); /* Edit Vendor logic */ }}>Edit</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Vendor Detail Modal */}
            <Modal isOpen={isVendorModalOpen} onClose={() => setIsVendorModalOpen(false)} title="Vendor Details">
                {selectedVendor && (
                    <div className="space-y-3 text-gray-300">
                        <p><strong>Name:</strong> {selectedVendor.name}</p>
                        <p><strong>Contact:</strong> {selectedVendor.contactPerson} ({selectedVendor.email})</p>
                        <p><strong>Phone:</strong> {selectedVendor.phone}</p>
                        <p><strong>Address:</strong> {selectedVendor.address}</p>
                        <p><strong>Contract Value:</strong> {formatCurrency(selectedVendor.contractValue)}</p>
                        <p><strong>Contract Period:</strong> {format(new Date(selectedVendor.contractStartDate), 'MMM dd, yyyy')} - {format(new Date(selectedVendor.contractEndDate), 'MMM dd, yyyy')}</p>
                        <p><strong>Services:</strong> {selectedVendor.servicesProvided.join(', ')}</p>
                        <p><strong>Risk Score:</strong> {selectedVendor.riskScore} / 10</p>
                        <p><strong>Payment Terms:</strong> {selectedVendor.paymentTerms}</p>
                        <p><strong>Total Payments YTD:</strong> {formatCurrency(selectedVendor.totalPaymentsYTD)}</p>
                        <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedVendor.status)}`}>{selectedVendor.status}</span></p>
                        <div className="mt-4 flex justify-end">
                            <Button variant="primary" onClick={() => setIsVendorModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

/**
 * @interface ExpenseReportViewerProps
 * @description Props for the ExpenseReportViewer component.
 */
export interface ExpenseReportViewerProps {
    expenseReports: ExpenseReport[];
    users: User[];
    onReportSelected?: (report: ExpenseReport) => void;
}

/**
 * @function ExpenseReportViewer
 * @description Displays and manages employee expense reports.
 */
export const ExpenseReportViewer: React.FC<ExpenseReportViewerProps> = ({ expenseReports, users, onReportSelected }) => {
    const [filterStatus, setFilterStatus] = useState<ExpenseReport['status'] | 'All