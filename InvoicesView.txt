import React, { useContext, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { Invoice, InvoiceStatus } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {
    ChevronLeftIcon, ChevronRightIcon,
    ArrowPathIcon, MagnifyingGlassIcon, PlusIcon, DocumentArrowDownIcon,
    EyeIcon, PencilSquareIcon, TrashIcon, CreditCardIcon, PrinterIcon,
    PaperAirplaneIcon, EllipsisVerticalIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, CalendarDaysIcon, FunnelIcon, AdjustmentsHorizontalIcon, CurrencyDollarIcon, TagIcon, BuildingOfficeIcon, UserIcon, ClockIcon, DocumentTextIcon, FolderOpenIcon
} from '@heroicons/react/24/outline'; // Importing more icons for a richer UI

// --- START: NEW TYPE DEFINITIONS ---
/**
 * @typedef {Object} CustomerContact
 * @property {string} name - Name of the contact person.
 * @property {string} email - Email of the contact person.
 * @property {string} phone - Phone number of the contact person.
 */
export type CustomerContact = {
    name: string;
    email: string;
    phone: string;
};

/**
 * @typedef {Object} Customer
 * @property {string} id - Unique identifier for the customer.
 * @property {string} name - Full name of the customer or company.
 * @property {string} email - Primary email address for the customer.
 * @property {string} phone - Primary phone number for the customer.
 * @property {string} addressLine1 - First line of the billing address.
 * @property {string} addressLine2 - Second line of the billing address (optional).
 * @property {string} city - City of the billing address.
 * @property {string} state - State/Province of the billing address.
 * @property {string} postalCode - Postal code of the billing address.
 * @property {string} country - Country of the billing address.
 * @property {CustomerContact[]} contacts - Array of contact persons for the customer.
 * @property {Date} createdAt - Timestamp when the customer was created.
 * @property {string} taxId - Tax identification number (optional).
 */
export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    contacts: CustomerContact[];
    createdAt: Date;
    taxId?: string;
};

/**
 * @typedef {Object} InvoiceLineItem
 * @property {string} id - Unique identifier for the line item.
 * @property {string} description - Description of the service or product.
 * @property {number} quantity - Quantity of the item.
 * @property {number} unitPrice - Price per unit.
 * @property {number} total - Total for this line item (quantity * unitPrice).
 * @property {string} productId - Optional product ID from an inventory system.
 */
export type InvoiceLineItem = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    productId?: string;
};

/**
 * @typedef {Object} PaymentRecord
 * @property {string} id - Unique identifier for the payment.
 * @property {string} invoiceId - ID of the invoice this payment is for.
 * @property {number} amount - Amount of the payment.
 * @property {Date} paymentDate - Date when the payment was received.
 * @property {string} paymentMethod - Method of payment (e.g., 'Bank Transfer', 'Credit Card', 'Cash').
 * @property {string} transactionId - Transaction reference ID (optional).
 * @property {string} notes - Any notes related to the payment.
 */
export type PaymentRecord = {
    id: string;
    invoiceId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Other';
    transactionId?: string;
    notes?: string;
};

/**
 * @typedef {Object} InvoiceActivity
 * @property {string} id - Unique identifier for the activity.
 * @property {string} userId - ID of the user who performed the activity.
 * @property {string} userName - Name of the user who performed the activity.
 * @property {Date} timestamp - When the activity occurred.
 * @property {string} action - Description of the action (e.g., 'Invoice Created', 'Status Changed to Paid', 'Payment Recorded').
 * @property {any} details - Additional details about the action (e.g., old and new status).
 */
export type InvoiceActivity = {
    id: string;
    userId: string;
    userName: string;
    timestamp: Date;
    action: string;
    details?: any;
};

// Extending the existing Invoice type with more fields for realism
declare module '../../../types' {
    export interface Invoice {
        customerId: string; // Link to a Customer
        issueDate: string; // Date invoice was issued
        lineItems: InvoiceLineItem[];
        subtotal: number;
        taxAmount: number;
        totalAmount: number; // Renamed from 'amount' for clarity, though original `amount` can be totalAmount
        currency: string; // e.g., 'USD', 'EUR'
        paymentTerms: string; // e.g., 'Net 30', 'Due on Receipt'
        notes?: string;
        purchaseOrderNumber?: string;
        payments: PaymentRecord[]; // Payments received for this invoice
        activities: InvoiceActivity[]; // Audit trail for this invoice
        dueDate: string; // Already exists but good to note
    }
}

/**
 * @typedef {'admin' | 'finance' | 'sales' | 'viewer'} UserRole - Defines different user roles for permission management.
 */
export type UserRole = 'admin' | 'finance' | 'sales' | 'viewer';

/**
 * @typedef {Object} UserContextType - Type for the simulated user context.
 * @property {string} id - User ID.
 * @property {string} name - User's name.
 * @property {string} email - User's email.
 * @property {UserRole} role - User's role.
 */
export type UserContextType = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

/**
 * @typedef {Object} Notification
 * @property {string} id - Unique ID for the notification.
 * @property {'success' | 'error' | 'info' | 'warning'} type - Type of notification.
 * @property {string} message - Message to display.
 * @property {boolean} dismissible - Whether the notification can be dismissed.
 * @property {number} duration - How long the notification should stay (ms), 0 for indefinite.
 */
export type Notification = {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    dismissible: boolean;
    duration: number;
};
// --- END: NEW TYPE DEFINITIONS ---

// --- START: MOCK DATA GENERATION ---
/**
 * Generates a unique ID string.
 * @returns {string} A unique ID.
 */
const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Generates a random date within a given range.
 * @param {Date} start - The start date.
 * @param {Date} end - The end date.
 * @returns {Date} A random date.
 */
const getRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generates a random full name.
 * @returns {string} A random full name.
 */
const getRandomName = (): string => {
    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Chris', 'Laura'];
    const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

/**
 * Generates random contact information.
 * @returns {CustomerContact} Random contact details.
 */
const generateRandomContact = (): CustomerContact => ({
    name: getRandomName(),
    email: `${generateId().substring(0, 8)}@example.com`,
    phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
});

/**
 * Generates a random customer object.
 * @returns {Customer} A randomly generated customer.
 */
export const generateMockCustomer = (): Customer => {
    const customerId = generateId();
    const name = getRandomName();
    return {
        id: customerId,
        name: `${name} Corp.`,
        email: `${name.toLowerCase().replace(' ', '.')}@${generateId().substring(0, 5)}.com`,
        phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        addressLine1: `${Math.floor(Math.random() * 1000) + 1} Main St`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'][Math.floor(Math.random() * 8)],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA'][Math.floor(Math.random() * 8)],
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'USA',
        contacts: [generateRandomContact(), generateRandomContact()],
        createdAt: getRandomDate(new Date(2020, 0, 1), new Date()),
        taxId: `TAX-${Math.floor(Math.random() * 900000) + 100000}`,
    };
};

/**
 * Generates a random invoice line item.
 * @returns {InvoiceLineItem} A randomly generated invoice line item.
 */
const generateRandomLineItem = (): InvoiceLineItem => {
    const quantity = Math.floor(Math.random() * 10) + 1;
    const unitPrice = parseFloat((Math.random() * 500 + 50).toFixed(2));
    const descriptionOptions = [
        'Consulting Services', 'Software Development', 'Project Management',
        'Cloud Hosting Fees', 'Maintenance Contract', 'Subscription Service',
        'Graphic Design', 'Data Entry', 'Technical Support', 'Hardware Purchase'
    ];
    return {
        id: generateId(),
        description: descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)],
        quantity,
        unitPrice,
        total: quantity * unitPrice,
        productId: `PROD-${Math.floor(Math.random() * 9000) + 1000}`,
    };
};

/**
 * Generates a random payment record for a given invoice.
 * @param {string} invoiceId - The ID of the invoice to associate the payment with.
 * @param {number} totalAmount - The total amount of the invoice.
 * @returns {PaymentRecord} A randomly generated payment record.
 */
const generateRandomPaymentRecord = (invoiceId: string, totalAmount: number): PaymentRecord => {
    const paymentMethods: PaymentRecord['paymentMethod'][] = ['Bank Transfer', 'Credit Card', 'Cash', 'Cheque'];
    const amountPaid = parseFloat((Math.random() * totalAmount * 0.8 + totalAmount * 0.2).toFixed(2)); // Pay between 20-100%
    return {
        id: generateId(),
        invoiceId: invoiceId,
        amount: Math.min(amountPaid, totalAmount), // Ensure payment doesn't exceed total
        paymentDate: getRandomDate(new Date(2023, 0, 1), new Date()),
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionId: `TRX-${Math.floor(Math.random() * 90000000) + 10000000}`,
        notes: Math.random() > 0.5 ? 'Partial payment received' : undefined,
    };
};

/**
 * Generates a random invoice activity.
 * @param {string} userId - The ID of the user performing the activity.
 * @param {string} userName - The name of the user performing the activity.
 * @returns {InvoiceActivity} A randomly generated invoice activity.
 */
const generateRandomInvoiceActivity = (userId: string, userName: string): InvoiceActivity => {
    const actions = [
        'Invoice Created', 'Status Changed to Unpaid', 'Status Changed to Overdue',
        'Status Changed to Paid', 'Payment Recorded', 'Invoice Updated', 'Invoice Voided'
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];
    let details: any = {};
    if (action.includes('Status Changed')) {
        const oldStatus = ['unpaid', 'overdue', 'paid'][Math.floor(Math.random() * 3)];
        const newStatus = action.split(' ')[3].toLowerCase();
        details = { oldStatus, newStatus };
    } else if (action === 'Payment Recorded') {
        details = { amount: parseFloat((Math.random() * 1000).toFixed(2)), method: 'Bank Transfer' };
    }
    return {
        id: generateId(),
        userId,
        userName,
        timestamp: getRandomDate(new Date(2023, 0, 1), new Date()),
        action,
        details,
    };
};

/**
 * Generates a mock invoice object.
 * @param {Customer} customer - The customer associated with this invoice.
 * @returns {Invoice} A randomly generated invoice.
 */
export const generateMockInvoice = (customer: Customer): Invoice => {
    const invoiceId = generateId();
    const issueDate = getRandomDate(new Date(2023, 0, 1), new Date());
    const dueDate = new Date(issueDate);
    dueDate.setDate(issueDate.getDate() + (Math.random() > 0.5 ? 30 : 15)); // Net 15 or Net 30
    const lineItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, generateRandomLineItem);
    const subtotal = parseFloat(lineItems.reduce((acc, item) => acc + item.total, 0).toFixed(2));
    const taxRate = Math.random() > 0.7 ? 0.08 : 0; // 30% chance of no tax
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
    const paymentTerms = Math.random() > 0.5 ? 'Net 30' : 'Net 15';

    let status: InvoiceStatus = 'unpaid';
    const today = new Date();
    if (dueDate.getTime() < today.getTime() && Math.random() > 0.3) { // 70% chance of overdue if past due
        status = 'overdue';
    }
    if (Math.random() > 0.6) { // 40% chance of being paid
        status = 'paid';
    }
    if (Math.random() > 0.95) { // 5% chance of being voided
        status = 'voided';
    }

    const payments: PaymentRecord[] = [];
    let currentPaidAmount = 0;
    if (status === 'paid') {
        const numPayments = Math.random() > 0.7 ? 1 : Math.floor(Math.random() * 2) + 1; // 70% single payment, 30% multiple
        for (let i = 0; i < numPayments; i++) {
            const remaining = totalAmount - currentPaidAmount;
            if (remaining <= 0) break;
            const paymentAmount = numPayments > 1 ? parseFloat((remaining * (Math.random() * 0.6 + 0.3)).toFixed(2)) : remaining; // If multiple, pay 30-90% of remaining
            payments.push(generateRandomPaymentRecord(invoiceId, paymentAmount));
            currentPaidAmount += paymentAmount;
            if (currentPaidAmount >= totalAmount * 0.99) break; // Consider paid if very close
        }
        payments[payments.length - 1].amount += (totalAmount - currentPaidAmount); // Ensure final payment covers remainder
        payments[payments.length - 1].amount = parseFloat(payments[payments.length - 1].amount.toFixed(2));
    } else if (Math.random() > 0.8 && totalAmount > 100) { // 20% chance of partial payment for unpaid/overdue
        const paymentAmount = parseFloat((totalAmount * (Math.random() * 0.4 + 0.1)).toFixed(2)); // Pay 10-50%
        payments.push(generateRandomPaymentRecord(invoiceId, paymentAmount));
    }

    const activities: InvoiceActivity[] = [];
    activities.push(generateRandomInvoiceActivity('user-1', 'Admin User'));
    if (status === 'paid' || status === 'overdue') {
        activities.push(generateRandomInvoiceActivity('user-2', 'Finance Team'));
    }
    if (status === 'paid') {
        activities.push(generateRandomInvoiceActivity('user-1', 'Admin User'));
    }

    return {
        id: invoiceId,
        invoiceNumber: `INV-${Math.floor(Math.random() * 900000) + 100000}`,
        counterpartyName: customer.name,
        customerId: customer.id,
        amount: totalAmount, // Original amount property
        totalAmount, // New detailed totalAmount
        subtotal,
        taxAmount,
        currency: 'USD',
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status,
        lineItems,
        paymentTerms,
        notes: Math.random() > 0.7 ? 'Please remit payment as soon as possible.' : undefined,
        purchaseOrderNumber: Math.random() > 0.6 ? `PO-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
        payments,
        activities,
    };
};

/**
 * Generates an array of mock customers and invoices.
 * @param {number} numCustomers - Number of customers to generate.
 * @param {number} numInvoicesPerCustomer - Average number of invoices per customer.
 * @returns {{mockCustomers: Customer[], mockInvoices: Invoice[]}} Generated mock data.
 */
export const generateLargeMockData = (numCustomers: number = 50, numInvoicesPerCustomer: number = 5): { mockCustomers: Customer[], mockInvoices: Invoice[] } => {
    const mockCustomers: Customer[] = [];
    const mockInvoices: Invoice[] = [];

    for (let i = 0; i < numCustomers; i++) {
        const customer = generateMockCustomer();
        mockCustomers.push(customer);
        const numInvoices = Math.floor(Math.random() * (numInvoicesPerCustomer * 2 - 1)) + 1; // 1 to (2*avg-1)
        for (let j = 0; j < numInvoices; j++) {
            mockInvoices.push(generateMockInvoice(customer));
        }
    }
    return { mockCustomers, mockInvoices };
};

// Simulate a very large dataset
const { mockCustomers, mockInvoices } = generateLargeMockData(200, 20); // 200 customers, avg 20 invoices each = 4000 invoices
// Update existing DataContext simulation with more detailed invoices and customers
// This would typically come from an API call or a global store.
// For this exercise, we simulate loading it once.
const mockDataContext = {
    invoices: mockInvoices,
    customers: mockCustomers, // Add customers to the mock context
    // Placeholder for other data types if needed
    // products: [],
    // users: []
};

// --- END: MOCK DATA GENERATION ---

// --- START: UTILITY FUNCTIONS ---
/**
 * Formats a number as currency.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency code (e.g., 'USD').
 * @param {string} locale - The locale string (e.g., 'en-US').
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Formats a date string into a more readable format.
 * @param {string} dateString - The date string (e.g., 'YYYY-MM-DD').
 * @param {string} locale - The locale string.
 * @param {Intl.DateTimeFormatOptions} options - Options for DateTimeFormat.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string, locale: string = 'en-US', options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid date
        return new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
};

/**
 * Calculates the total amount paid for an invoice.
 * @param {PaymentRecord[]} payments - Array of payment records.
 * @returns {number} The total amount paid.
 */
export const calculateTotalPaid = (payments: PaymentRecord[]): number => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
};

/**
 * Calculates the balance due for an invoice.
 * @param {Invoice} invoice - The invoice object.
 * @returns {number} The remaining balance due.
 */
export const calculateBalanceDue = (invoice: Invoice): number => {
    const totalPaid = calculateTotalPaid(invoice.payments);
    return parseFloat((invoice.totalAmount - totalPaid).toFixed(2));
};

/**
 * Debounces a function call.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

/**
 * Throttles a function call.
 * @param {Function} func - The function to throttle.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The throttled function.
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, delay: number) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>): void => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), delay);
        }
    };
};

/**
 * Deep clones an object.
 * @param {T} obj - The object to clone.
 * @returns {T} The cloned object.
 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Sorts an array of objects by a specified key.
 * @param {T[]} array - The array to sort.
 * @param {keyof T} key - The key to sort by.
 * @param {'asc' | 'desc'} order - The sort order.
 * @returns {T[]} The sorted array.
 */
export const sortArray = <T>(array: T[], key: keyof T, order: 'asc' | 'desc'): T[] => {
    return [...array].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];

        if (typeof valA === 'string' && typeof valB === 'string') {
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return order === 'asc' ? valA - valB : valB - valA;
        }
        // Fallback for other types or inconsistent types, treat as strings
        return order === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
};

/**
 * Generates a mock PDF content string.
 * In a real application, this would involve a PDF generation library or API.
 * @param {Invoice} invoice - The invoice data.
 * @returns {string} Mock PDF content.
 */
export const generateInvoicePdfContent = (invoice: Invoice): string => {
    const customer = mockCustomers.find(c => c.id === invoice.customerId);
    return `
        <h1>Invoice #${invoice.invoiceNumber}</h1>
        <p><strong>Issued:</strong> ${formatDate(invoice.issueDate)}</p>
        <p><strong>Due:</strong> ${formatDate(invoice.dueDate)}</p>
        <h2>Bill To:</h2>
        <p>${customer?.name || invoice.counterpartyName}</p>
        <p>${customer?.addressLine1}</p>
        <p>${customer?.city}, ${customer?.state} ${customer?.postalCode}</p>
        <p>${customer?.country}</p>
        <br/>
        <h2>Line Items:</h2>
        <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
            <tbody>
                ${invoice.lineItems.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>${formatCurrency(item.unitPrice)}</td>
                        <td>${formatCurrency(item.total)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <h3>Subtotal: ${formatCurrency(invoice.subtotal)}</h3>
        <h3>Tax (${(invoice.taxAmount / invoice.subtotal * 100).toFixed(2)}%): ${formatCurrency(invoice.taxAmount)}</h3>
        <h2>Total: ${formatCurrency(invoice.totalAmount, invoice.currency)}</h2>
        <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        <p><strong>Balance Due:</strong> ${formatCurrency(calculateBalanceDue(invoice))}</p>
    `;
};

/**
 * Checks if a user role has permission for a specific action.
 * @param {UserRole} userRole - The role of the current user.
 * @param {'view' | 'edit' | 'create' | 'delete' | 'pay' | 'void'} action - The action to check permission for.
 * @returns {boolean} True if the user has permission, false otherwise.
 */
export const hasPermission = (userRole: UserRole, action: 'view' | 'edit' | 'create' | 'delete' | 'pay' | 'void' | 'report'): boolean => {
    switch (action) {
        case 'view': return true; // Everyone can view
        case 'create':
        case 'edit':
        case 'pay':
            return userRole === 'admin' || userRole === 'finance' || userRole === 'sales';
        case 'delete':
        case 'void':
            return userRole === 'admin' || userRole === 'finance';
        case 'report':
            return userRole === 'admin' || userRole === 'finance' || userRole === 'sales';
        default: return false;
    }
};

// --- END: UTILITY FUNCTIONS ---


// --- START: CUSTOM HOOKS ---

/**
 * @typedef {Object} UsePaginationReturn
 * @property {T[]} paginatedData - The data for the current page.
 * @property {number} currentPage - The current page number (1-indexed).
 * @property {number} totalPages - The total number of pages.
 * @property {number} itemsPerPage - Number of items per page.
 * @property {Function} goToPage - Function to navigate to a specific page.
 * @property {Function} nextPage - Function to go to the next page.
 * @property {Function} prevPage - Function to go to the previous page.
 * @property {Function} setItemsPerPage - Function to change items per page.
 */
export function usePagination<T>(data: T[], initialItemsPerPage: number = 10) {
    const [itemsPerPage, _setItemsPerPage] = useState(initialItemsPerPage);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = useMemo(() => Math.ceil(data.length / itemsPerPage), [data.length, itemsPerPage]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, itemsPerPage]);

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        } else if (page < 1) {
            setCurrentPage(1);
        } else if (page > totalPages) {
            setCurrentPage(totalPages > 0 ? totalPages : 1); // If no data, totalPages can be 0, set to 1
        }
    }, [totalPages]);

    const nextPage = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, [totalPages]);

    const prevPage = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const setItemsPerPage = useCallback((count: number) => {
        _setItemsPerPage(count);
        setCurrentPage(1); // Reset to first page when items per page changes
    }, []);

    // Reset current page if data changes significantly (e.g., filter applied)
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (currentPage === 0 && totalPages === 0 && data.length > 0) {
            setCurrentPage(1); // If data appears for the first time
        } else if (data.length === 0) {
            setCurrentPage(1); // If no data, ensure page is 1
        }
    }, [data.length, totalPages, currentPage]);


    return {
        paginatedData,
        currentPage,
        totalPages,
        itemsPerPage,
        goToPage,
        nextPage,
        prevPage,
        setItemsPerPage,
    };
}

/**
 * @typedef {Object} UseSortReturn
 * @property {T[]} sortedData - The data sorted according to current settings.
 * @property {keyof T | null} sortKey - The current column key being sorted.
 * @property {'asc' | 'desc' | null} sortOrder - The current sort order.
 * @property {Function} requestSort - Function to toggle sorting for a given key.
 */
export function useSort<T>(data: T[]) {
    const [sortKey, setSortKey] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

    const sortedData = useMemo(() => {
        if (!sortKey || !sortOrder) return data;
        return sortArray(data, sortKey, sortOrder);
    }, [data, sortKey, sortOrder]);

    const requestSort = useCallback((key: keyof T) => {
        if (sortKey === key) {
            setSortOrder((prevOrder) => {
                if (prevOrder === 'asc') return 'desc';
                if (prevOrder === 'desc') return null; // Cycle to no sort
                return 'asc';
            });
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    }, [sortKey]);

    return { sortedData, sortKey, sortOrder, requestSort };
}

/**
 * @typedef {Object} UseSearchReturn
 * @property {string} searchTerm - The current search term.
 * @property {T[]} searchResults - The data filtered by the search term.
 * @property {Function} handleSearchChange - Event handler for search input.
 * @property {Function} setSearchTerm - Function to directly set the search term.
 */
export function useSearch<T>(data: T[], searchKeys: (keyof T)[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const searchResults = useMemo(() => {
        if (!debouncedSearchTerm) return data;
        const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
        return data.filter((item) =>
            searchKeys.some((key) =>
                String(item[key]).toLowerCase().includes(lowerCaseSearchTerm)
            )
        );
    }, [data, debouncedSearchTerm, searchKeys]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    return { searchTerm, searchResults, handleSearchChange, setSearchTerm };
}

/**
 * Custom hook for debouncing a value.
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} The debounced value.
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
 * Custom hook for managing modal state.
 * @returns {[boolean, Function, Function]} Tuple of `isOpen`, `openModal`, `closeModal`.
 */
export function useModal() {
    const [isOpen, setIsOpen] = useState(false);
    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);
    return [isOpen, openModal, closeModal] as const;
}

/**
 * Custom hook for a simulated authentication context.
 * In a real app, this would integrate with an actual auth system.
 * @returns {UserContextType} The current user's context.
 */
export function useAuth(): UserContextType {
    // For demonstration, we'll hardcode a user.
    // In a real app, this would come from a global auth state or a cookie/token.
    const [user, setUser] = useState<UserContextType>({
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin', // Can change this to 'finance', 'sales', 'viewer' to test permissions
    });

    // Simulate login/logout logic if needed for more complex scenarios
    // const login = (credentials) => { ... };
    // const logout = () => { setUser(null); };

    return user;
}

/**
 * Custom hook for managing application-wide notifications.
 * @returns {Object} An object containing notifications, add/remove functions.
 */
export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationIdCounter = useRef(0);

    const addNotification = useCallback((
        type: Notification['type'],
        message: string,
        dismissible: boolean = true,
        duration: number = 5000
    ) => {
        notificationIdCounter.current += 1;
        const id = `notification-${notificationIdCounter.current}`;
        const newNotification: Notification = { id, type, message, dismissible, duration };
        setNotifications((prev) => [...prev, newNotification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
        return id;
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return { notifications, addNotification, removeNotification };
}

// Global Notification Context (Simulated)
// In a larger app, this would be in its own file and provider.
const NotificationContext = React.createContext<{
    notifications: Notification[];
    addNotification: (type: Notification['type'], message: string, dismissible?: boolean, duration?: number) => string;
    removeNotification: (id: string) => void;
} | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const notificationState = useNotifications();
    return (
        <NotificationContext.Provider value={notificationState}>
            {children}
            <NotificationDisplay />
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};

// --- END: CUSTOM HOOKS ---


// --- START: SHARED COMPONENTS ---

/**
 * Generic Modal Component.
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to call when the modal should close.
 * @param {React.ReactNode} props.children - Modal content.
 * @param {string} [props.title] - Optional modal title.
 * @param {string} [props.className] - Optional custom class names for the modal content.
 * @returns {JSX.Element | null} The modal component.
 */
export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}> = ({ isOpen, onClose, children, title, className, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full w-full h-full' // For full screen modal
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-70 backdrop-blur-sm">
            <div className={`relative w-auto my-6 mx-auto ${sizeClasses[size]}`}>
                {/* Modal content */}
                <div className={`border-0 rounded-lg shadow-lg relative flex flex-col bg-gray-800 outline-none focus:outline-none ${className}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between p-5 border-b border-solid border-gray-700 rounded-t">
                        <h3 className="text-2xl font-semibold text-white">
                            {title}
                        </h3>
                        <button
                            className="p-1 ml-auto bg-transparent border-0 text-gray-400 opacity-70 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:text-white"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <span className="h-6 w-6 block text-2xl outline-none focus:outline-none">
                                ×
                            </span>
                        </button>
                    </div>
                    {/* Body */}
                    <div className="relative p-6 flex-auto text-gray-300">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Notification Display component.
 * Renders toast notifications.
 * @returns {JSX.Element} The notification display.
 */
export const NotificationDisplay: React.FC = () => {
    const { notifications, removeNotification } = useNotificationContext();

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
            case 'error': return <XCircleIcon className="h-5 w-5 text-red-400" />;
            case 'info': return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
            case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
            default: return null;
        }
    };

    const getColors = (type: Notification['type']) => {
        switch (type) {
            case 'success': return 'bg-green-800/80 border-green-700';
            case 'error': return 'bg-red-800/80 border-red-700';
            case 'info': return 'bg-blue-800/80 border-blue-700';
            case 'warning': return 'bg-yellow-800/80 border-yellow-700';
            default: return 'bg-gray-800/80 border-gray-700';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[100] space-y-3 pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`relative flex items-center p-4 pr-10 rounded-lg shadow-xl text-sm text-white border ${getColors(notification.type)} pointer-events-auto max-w-sm`}
                    role="alert"
                >
                    <div className="flex-shrink-0 mr-3">
                        {getIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                        {notification.message}
                    </div>
                    {notification.dismissible && (
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
                            aria-label="Dismiss notification"
                        >
                            <span className="sr-only">Dismiss</span>
                            <XCircleIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};


/**
 * Paginator Component for navigating through pages.
 * @param {Object} props - Component props.
 * @param {number} props.currentPage - The current page number.
 * @param {number} props.totalPages - The total number of pages.
 * @param {Function} props.goToPage - Function to navigate to a specific page.
 * @param {Function} props.nextPage - Function to go to the next page.
 * @param {Function} props.prevPage - Function to go to the previous page.
 * @param {number} props.itemsPerPage - Number of items per page.
 * @param {Function} props.setItemsPerPage - Function to change items per page.
 * @returns {JSX.Element} The paginator component.
 */
export const Paginator: React.FC<{
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    itemsPerPage: number;
    setItemsPerPage: (count: number) => void;
    totalItems: number;
}> = ({
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems
}) => {
    const pageNumbers = useMemo(() => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            if (currentPage > 2) pages.push(currentPage - 1);
            if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
            if (currentPage < totalPages - 1) pages.push(currentPage + 1);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);

            // Remove duplicates and ensure order
            const uniquePages = Array.from(new Set(pages));
            uniquePages.sort((a, b) => {
                if (a === '...') return 1;
                if (b === '...') return -1;
                return (a as number) - (b as number);
            });
            return uniquePages;
        }
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-900/50 rounded-b-lg">
            <div className="text-sm text-gray-400 mb-2 sm:mb-0">
                Showing{' '}
                <span className="font-medium text-white">
                    {(currentPage - 1) * itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium text-white">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                of{' '}
                <span className="font-medium text-white">{totalItems}</span>{' '}
                results
            </div>
            <div className="flex items-center space-x-3">
                <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                >
                    {[10, 25, 50, 100].map(size => (
                        <option key={size} value={size}>{size} / page</option>
                    ))}
                </select>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {pageNumbers.map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    onClick={() => goToPage(page as number)}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                        ? 'z-10 bg-cyan-600 border-cyan-500 text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </div>
    );
};

/**
 * Filter and Search Bar for tables.
 * @param {Object} props - Component props.
 * @param {string} props.searchTerm - The current search term.
 * @param {Function} props.onSearchChange - Callback for search input change.
 * @param {Function} props.onApplyFilters - Callback to apply filters.
 * @param {InvoiceStatus | 'all'} props.currentStatusFilter - Current status filter.
 * @param {Function} props.onStatusFilterChange - Callback for status filter change.
 * @param {string} props.startDate - Start date for date range filter.
 * @param {Function} props.onStartDateChange - Callback for start date change.
 * @param {string} props.endDate - End date for date range filter.
 * @param {Function} props.onEndDateChange - Callback for end date change.
 * @param {Customer[]} props.customers - List of customers for customer filter.
 * @param {string} props.selectedCustomerId - Currently selected customer ID.
 * @param {Function} props.onCustomerFilterChange - Callback for customer filter change.
 * @returns {JSX.Element} The filter and search bar component.
 */
export const InvoiceFiltersBar: React.FC<{
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onApplyFilters: () => void;
    currentStatusFilter: InvoiceStatus | 'all';
    onStatusFilterChange: (status: InvoiceStatus | 'all') => void;
    startDate: string;
    onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    endDate: string;
    onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    customers: Customer[];
    selectedCustomerId: string | 'all';
    onCustomerFilterChange: (customerId: string | 'all') => void;
}> = ({
    searchTerm, onSearchChange, onApplyFilters,
    currentStatusFilter, onStatusFilterChange,
    startDate, onStartDateChange, endDate, onEndDateChange,
    customers, selectedCustomerId, onCustomerFilterChange
}) => {
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    return (
        <div className="flex flex-col space-y-4 p-4 bg-gray-900/50 rounded-lg shadow-inner">
            <div className="flex flex-wrap items-center gap-4">
                {/* Search Input */}
                <div className="relative flex-grow min-w-[200px] max-w-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={onSearchChange}
                        className="block w-full pl-10 pr-4 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-lg border border-gray-700 flex-shrink-0">
                    {(['all', 'unpaid', 'paid', 'overdue', 'voided'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => onStatusFilterChange(status)}
                            className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-colors capitalize ${currentStatusFilter === status ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Advanced Filters Toggle */}
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium border border-gray-600 flex-shrink-0"
                >
                    <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                    Advanced Filters
                    {showAdvancedFilters ? <ChevronUpIcon className="ml-2 h-4 w-4" /> : <ChevronDownIcon className="ml-2 h-4 w-4" />}
                </button>

                {/* Apply Filters Button */}
                <button
                    onClick={onApplyFilters}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex-shrink-0"
                >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Apply Filters
                </button>
            </div>

            {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-700 pt-4 mt-4">
                    {/* Date Range Filter */}
                    <div>
                        <label htmlFor="startDate" className="block text-xs font-medium text-gray-400 mb-1">Issue Date Start</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={onStartDateChange}
                            className="block w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-xs font-medium text-gray-400 mb-1">Issue Date End</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={onEndDateChange}
                            className="block w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>

                    {/* Customer Filter */}
                    <div>
                        <label htmlFor="customerFilter" className="block text-xs font-medium text-gray-400 mb-1">Customer</label>
                        <select
                            id="customerFilter"
                            value={selectedCustomerId}
                            onChange={(e) => onCustomerFilterChange(e.target.value)}
                            className="block w-full px-3 py-2 text-sm text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="all">All Customers</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};

// Re-export StatusBadge component from original file
const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const colors = {
        unpaid: 'bg-cyan-500/20 text-cyan-300',
        paid: 'bg-green-500/20 text-green-300',
        overdue: 'bg-red-500/20 text-red-300',
        voided: 'bg-gray-500/20 text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${colors[status]}`}>{status}</span>;
};
export { StatusBadge }; // Export it

/**
 * ChevronDownIcon component from Heroicons.
 * (Included here to reduce external imports for this single file directive, for convenience)
 */
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

/**
 * ChevronUpIcon component from Heroicons.
 * (Included here to reduce external imports for this single file directive, for convenience)
 */
export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

/**
 * ThreeDotMenu Component for contextual actions.
 * @param {Object} props - Component props.
 * @param {Array<{ label: string; onClick: () => void; icon?: React.ReactNode; disabled?: boolean; className?: string }>} props.actions - Array of action objects.
 * @param {string} [props.buttonClassName] - Optional class for the menu button.
 * @param {string} [props.menuClassName] - Optional class for the dropdown menu.
 * @returns {JSX.Element} The three-dot menu component.
 */
export const ThreeDotMenu: React.FC<{
    actions: { label: string; onClick: () => void; icon?: React.ReactNode; disabled?: boolean; className?: string }[];
    buttonClassName?: string;
    menuClassName?: string;
}> = ({ actions, buttonClassName, menuClassName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <div>
                <button
                    type="button"
                    className={`inline-flex justify-center w-full rounded-md shadow-sm px-2 py-2 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${buttonClassName}`}
                    id="options-menu"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            {isOpen && (
                <div
                    className={`origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700 focus:outline-none z-20 ${menuClassName}`}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                >
                    <div className="py-1">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => { action.onClick(); setIsOpen(false); }}
                                disabled={action.disabled}
                                className={`group flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white ${action.className} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                role="menuitem"
                            >
                                {action.icon && <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white">{action.icon}</span>}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


/**
 * LoadingSpinner Component.
 * @param {Object} props - Component props.
 * @param {string} [props.className] - Optional custom class name.
 * @returns {JSX.Element} The loading spinner.
 */
export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`flex items-center justify-center ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * EmptyStateMessage Component.
 * @param {Object} props - Component props.
 * @param {string} props.title - Title of the empty state.
 * @param {string} props.description - Description of the empty state.
 * @param {React.ReactNode} [props.icon] - Optional icon to display.
 * @param {React.ReactNode} [props.actionButton] - Optional action button.
 * @returns {JSX.Element} The empty state message.
 */
export const EmptyStateMessage: React.FC<{
    title: string;
    description: string;
    icon?: React.ReactNode;
    actionButton?: React.ReactNode;
}> = ({ title, description, icon, actionButton }) => (
    <div className="text-center py-10 px-4 sm:px-6 lg:px-8 bg-gray-800 rounded-lg shadow-md">
        {icon && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-cyan-600/20 text-cyan-300 mb-4">
                {icon}
            </div>
        )}
        <h3 className="mt-2 text-lg font-medium text-white">{title}</h3>
        <p className="mt-1 text-sm text-gray-400">{description}</p>
        {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
);


/**
 * TableHeadSortable Component for sortable table headers.
 * @param {Object} props - Component props.
 * @param {string} props.children - The header text.
 * @param {boolean} props.isSortable - Whether the column is sortable.
 * @param {boolean} props.isActive - Whether this column is currently sorted.
 * @param {'asc' | 'desc' | null} props.sortOrder - The current sort order.
 * @param {Function} props.onClick - Callback for click event.
 * @returns {JSX.Element} The sortable table header.
 */
export const TableHeadSortable: React.FC<{
    children: React.ReactNode;
    isSortable: boolean;
    isActive: boolean;
    sortOrder: 'asc' | 'desc' | null;
    onClick: () => void;
}> = ({ children, isSortable, isActive, sortOrder, onClick }) => (
    <th scope="col" className="px-6 py-3">
        {isSortable ? (
            <button
                className="flex items-center gap-1 text-xs font-medium text-gray-300 uppercase hover:text-white"
                onClick={onClick}
            >
                {children}
                {isActive && sortOrder === 'asc' && <ChevronUpIcon className="h-3 w-3" />}
                {isActive && sortOrder === 'desc' && <ChevronDownIcon className="h-3 w-3" />}
                {!isActive && <ChevronDownIcon className="h-3 w-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
            </button>
        ) : (
            <span className="text-xs font-medium text-gray-300 uppercase">{children}</span>
        )}
    </th>
);

// --- END: SHARED COMPONENTS ---


// --- START: INVOICE SPECIFIC COMPONENTS ---

/**
 * InvoiceDetailModal Component: Displays comprehensive details of a single invoice.
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to call when the modal should close.
 * @param {Invoice} props.invoice - The invoice object to display.
 * @param {Customer[]} props.customers - List of all customers to find customer details.
 * @param {UserContextType} props.currentUser - The current authenticated user.
 * @param {Function} props.onEditInvoice - Callback to initiate invoice editing.
 * @param {Function} props.onRecordPayment - Callback to initiate payment recording.
 * @param {Function} props.onVoidInvoice - Callback to void an invoice.
 * @param {Function} props.onDeleteInvoice - Callback to delete an invoice.
 * @returns {JSX.Element | null} The invoice detail modal.
 */
export const InvoiceDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    customers: Customer[];
    currentUser: UserContextType;
    onEditInvoice: (invoice: Invoice) => void;
    onRecordPayment: (invoice: Invoice) => void;
    onVoidInvoice: (invoiceId: string) => void;
    onDeleteInvoice: (invoiceId: string) => void;
}> = ({
    isOpen, onClose, invoice, customers, currentUser,
    onEditInvoice, onRecordPayment, onVoidInvoice, onDeleteInvoice
}) => {
    if (!invoice) return null;

    const customer = useMemo(() => customers.find(c => c.id === invoice.customerId), [customers, invoice.customerId]);
    const balanceDue = calculateBalanceDue(invoice);
    const totalPaid = calculateTotalPaid(invoice.payments);

    const invoiceActions = useMemo(() => {
        const actions = [];
        if (hasPermission(currentUser.role, 'edit') && invoice.status !== 'voided' && invoice.status !== 'paid') {
            actions.push({ label: 'Edit Invoice', onClick: () => onEditInvoice(invoice), icon: <PencilSquareIcon /> });
        }
        if (hasPermission(currentUser.role, 'pay') && invoice.status !== 'paid' && invoice.status !== 'voided' && balanceDue > 0) {
            actions.push({ label: 'Record Payment', onClick: () => onRecordPayment(invoice), icon: <CreditCardIcon /> });
        }
        if (hasPermission(currentUser.role, 'view')) {
            actions.push({ label: 'Print/Download PDF', onClick: () => {
                alert(`Simulating PDF download for Invoice #${invoice.invoiceNumber}:\n\n${generateInvoicePdfContent(invoice)}`);
            }, icon: <PrinterIcon /> });
            actions.push({ label: 'Send Email Reminder', onClick: () => {
                alert(`Simulating email reminder sent for Invoice #${invoice.invoiceNumber} to ${customer?.email || 'N/A'}`);
            }, icon: <PaperAirplaneIcon /> });
        }
        if (hasPermission(currentUser.role, 'void') && invoice.status !== 'voided' && invoice.status !== 'paid') {
            actions.push({ label: 'Void Invoice', onClick: () => {
                if (window.confirm(`Are you sure you want to void Invoice #${invoice.invoiceNumber}? This action cannot be undone.`)) {
                    onVoidInvoice(invoice.id);
                    onClose();
                }
            }, icon: <XCircleIcon />, className: 'text-red-300 hover:text-red-200' });
        }
        if (hasPermission(currentUser.role, 'delete') && invoice.status === 'voided') { // Can only delete voided invoices
            actions.push({ label: 'Delete Invoice', onClick: () => {
                if (window.confirm(`Are you sure you want to permanently delete Invoice #${invoice.invoiceNumber}? This action cannot be undone.`)) {
                    onDeleteInvoice(invoice.id);
                    onClose();
                }
            }, icon: <TrashIcon />, className: 'text-red-500 hover:text-red-400' });
        }
        return actions;
    }, [invoice, currentUser.role, balanceDue, customer, onClose, onEditInvoice, onRecordPayment, onVoidInvoice, onDeleteInvoice]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Invoice Details: ${invoice.invoiceNumber}`} size="lg">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-gray-300">
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Summary */}
                    <Card>
                        <h4 className="text-xl font-semibold text-white mb-4">Summary</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                            <div>
                                <p className="text-sm text-gray-400">Invoice Number</p>
                                <p className="font-mono text-white">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Status</p>
                                <StatusBadge status={invoice.status} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Issue Date</p>
                                <p className="text-white">{formatDate(invoice.issueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Due Date</p>
                                <p className="text-white">{formatDate(invoice.dueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Payment Terms</p>
                                <p className="text-white">{invoice.paymentTerms}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Purchase Order</p>
                                <p className="text-white">{invoice.purchaseOrderNumber || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-gray-700 pt-4">
                            <div className="flex justify-between items-center text-lg font-medium text-white mb-2">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-medium text-white mb-2">
                                <span>Tax Amount:</span>
                                <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-cyan-400 mt-4">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-red-400 mt-2">
                                <span>Balance Due:</span>
                                <span>{formatCurrency(balanceDue, invoice.currency)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <h4 className="text-xl font-semibold text-white mb-4">Line Items</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Description</th>
                                        <th scope="col" className="px-6 py-3 text-center">Qty</th>
                                        <th scope="col" className="px-6 py-3 text-right">Unit Price</th>
                                        <th scope="col" className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.lineItems.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="px-6 py-3 font-medium text-white">{item.description}</td>
                                            <td className="px-6 py-3 text-center text-white">{item.quantity}</td>
                                            <td className="px-6 py-3 text-right font-mono text-white">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                                            <td className="px-6 py-3 text-right font-mono text-white">{formatCurrency(item.total, invoice.currency)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <h4 className="text-xl font-semibold text-white mb-4">Payment History ({formatCurrency(totalPaid, invoice.currency)} Paid)</h4>
                        {invoice.payments && invoice.payments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-400">
                                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Date</th>
                                            <th scope="col" className="px-6 py-3">Method</th>
                                            <th scope="col" className="px-6 py-3">Amount</th>
                                            <th scope="col" className="px-6 py-3">Transaction ID</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.payments.map((payment) => (
                                            <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                                <td className="px-6 py-3 text-white">{formatDate(payment.paymentDate.toISOString().split('T')[0])}</td>
                                                <td className="px-6 py-3 text-white">{payment.paymentMethod}</td>
                                                <td className="px-6 py-3 font-mono text-white">{formatCurrency(payment.amount, invoice.currency)}</td>
                                                <td className="px-6 py-3 text-white">{payment.transactionId || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-400">No payments recorded for this invoice.</p>
                        )}
                    </Card>

                </div>

                {/* Sidebar: Customer Info & Actions & Activity Log */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <h4 className="text-xl font-semibold text-white mb-4">Customer Information</h4>
                        {customer ? (
                            <div className="space-y-2">
                                <p className="text-white text-lg font-medium flex items-center"><BuildingOfficeIcon className="h-5 w-5 mr-2 text-cyan-400" />{customer.name}</p>
                                <p className="text-gray-400 flex items-center"><UserIcon className="h-4 w-4 mr-2 text-gray-500" />{customer.contacts[0]?.name || 'N/A'}</p>
                                <p className="text-gray-400 flex items-center"><EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500" />{customer.email}</p>
                                <p className="text-gray-400 flex items-center"><PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />{customer.phone}</p>
                                <p className="text-gray-400 flex items-center"><MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />{customer.addressLine1}, {customer.city}, {customer.state} {customer.postalCode}</p>
                                <p className="text-gray-400">{customer.country}</p>
                                <p className="text-gray-400 text-xs mt-2">Tax ID: {customer.taxId || 'N/A'}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400">Customer details not found.</p>
                        )}
                    </Card>

                    {/* Invoice Actions */}
                    {invoiceActions.length > 0 && (
                        <Card>
                            <h4 className="text-xl font-semibold text-white mb-4">Actions</h4>
                            <div className="space-y-3">
                                {invoiceActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        disabled={action.disabled}
                                        className={`w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-md text-sm font-medium transition-colors ${action.disabled ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'bg-gray-800 hover:bg-gray-700 text-white ' + (action.className || '')}`}
                                    >
                                        {action.icon && <span className="mr-2 h-5 w-5">{action.icon}</span>}
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Activity Log */}
                    <Card>
                        <h4 className="text-xl font-semibold text-white mb-4">Activity Log</h4>
                        {invoice.activities && invoice.activities.length > 0 ? (
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {invoice.activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start text-sm">
                                        <ClockIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0 mr-2" />
                                        <div>
                                            <p className="text-white font-medium">{activity.action}</p>
                                            <p className="text-gray-400 text-xs">
                                                By {activity.userName} on {formatDate(activity.timestamp.toISOString().split('T')[0], 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                            {activity.details && Object.keys(activity.details).length > 0 && (
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Details: {JSON.stringify(activity.details)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">No activity recorded for this invoice.</p>
                        )}
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

// Placeholder icons for InvoiceDetailModal and InvoiceForm to reduce imports
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.972l-7.5 4.281a1.125 1.125 0 0 1-1.12 0l-7.5-4.281A2.25 2.25 0 0 1 2.25 6.993V6.75m19.5 0a2.25 2.25 0 0 0-2.25-2.25H4.5A2.25 2.25 0 0 0 2.25 6.75m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.972l-7.5 4.281a1.125 1.125 0 0 1-1.12 0l-7.5-4.281A2.25 2.25 0 0 1 2.25 6.993V6.75" /></svg>);
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25V1.25a.75.75 0 0 0-.75-.75H12.75A2.25 2.25 0 0 0 10.5 2.25v.75m-6.75 3.75h-.75A.75.75 0 0 1 2.25 6v14.25c0 .414.336.75.75.75h14.25a.75.75 0 0 1 .75-.75V11.25M6.75 6.75a3 3 0 0 1 3-3h11.25a3 3 0 0 1 3 3v.75" /></svg>);
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>);


/**
 * InvoiceFormModal Component: For creating or editing an invoice.
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to call when the modal should close.
 * @param {Invoice | null} props.invoiceToEdit - The invoice object to edit (null for creation).
 * @param {Customer[]} props.customers - List of all customers.
 * @param {Function} props.onSaveInvoice - Callback to save the invoice.
 * @param {UserContextType} props.currentUser - The current authenticated user.
 * @returns {JSX.Element | null} The invoice form modal.
 */
export const InvoiceFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    invoiceToEdit: Invoice | null;
    customers: Customer[];
    onSaveInvoice: (invoice: Invoice) => void;
    currentUser: UserContextType;
}> = ({ isOpen, onClose, invoiceToEdit, customers, onSaveInvoice, currentUser }) => {
    const isNewInvoice = !invoiceToEdit;
    const { addNotification } = useNotificationContext();

    const initialLineItem: InvoiceLineItem = {
        id: generateId(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
    };

    const [formData, setFormData] = useState<Omit<Invoice, 'amount' | 'payments' | 'activities' | 'counterpartyName'>>(() => ({
        id: invoiceToEdit?.id || generateId(),
        invoiceNumber: invoiceToEdit?.invoiceNumber || '',
        customerId: invoiceToEdit?.customerId || '',
        issueDate: invoiceToEdit?.issueDate || new Date().toISOString().split('T')[0],
        dueDate: invoiceToEdit?.dueDate || new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        status: invoiceToEdit?.status || 'unpaid',
        lineItems: invoiceToEdit?.lineItems || [initialLineItem],
        subtotal: invoiceToEdit?.subtotal || 0,
        taxAmount: invoiceToEdit?.taxAmount || 0,
        totalAmount: invoiceToEdit?.totalAmount || 0,
        currency: invoiceToEdit?.currency || 'USD',
        paymentTerms: invoiceToEdit?.paymentTerms || 'Net 30',
        notes: invoiceToEdit?.notes || '',
        purchaseOrderNumber: invoiceToEdit?.purchaseOrderNumber || '',
    }));

    const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
    const [lineItemErrors, setLineItemErrors] = useState<Record<string, Partial<Record<keyof InvoiceLineItem, string>>>>({});

    useEffect(() => {
        if (isOpen && invoiceToEdit) {
            setFormData({
                id: invoiceToEdit.id,
                invoiceNumber: invoiceToEdit.invoiceNumber,
                customerId: invoiceToEdit.customerId,
                issueDate: invoiceToEdit.issueDate,
                dueDate: invoiceToEdit.dueDate,
                status: invoiceToEdit.status,
                lineItems: deepClone(invoiceToEdit.lineItems), // Deep clone for line items
                subtotal: invoiceToEdit.subtotal,
                taxAmount: invoiceToEdit.taxAmount,
                totalAmount: invoiceToEdit.totalAmount,
                currency: invoiceToEdit.currency,
                paymentTerms: invoiceToEdit.paymentTerms,
                notes: invoiceToEdit.notes || '',
                purchaseOrderNumber: invoiceToEdit.purchaseOrderNumber || '',
            });
            setFormErrors({});
            setLineItemErrors({});
        } else if (isOpen && !invoiceToEdit) {
            setFormData({
                id: generateId(),
                invoiceNumber: '',
                customerId: '',
                issueDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
                status: 'unpaid',
                lineItems: [initialLineItem],
                subtotal: 0,
                taxAmount: 0,
                totalAmount: 0,
                currency: 'USD',
                paymentTerms: 'Net 30',
                notes: '',
                purchaseOrderNumber: '',
            });
            setFormErrors({});
            setLineItemErrors({});
        }
    }, [isOpen, invoiceToEdit]);

    useEffect(() => {
        // Recalculate subtotal, tax, and total whenever line items or tax rate changes
        let newSubtotal = formData.lineItems.reduce((acc, item) => acc + item.total, 0);
        const taxRate = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TAX_RATE || '0.08'); // Example dynamic tax rate
        let newTaxAmount = newSubtotal * taxRate;

        // Round to 2 decimal places
        newSubtotal = parseFloat(newSubtotal.toFixed(2));
        newTaxAmount = parseFloat(newTaxAmount.toFixed(2));
        const newTotalAmount = parseFloat((newSubtotal + newTaxAmount).toFixed(2));

        if (newSubtotal !== formData.subtotal || newTaxAmount !== formData.taxAmount || newTotalAmount !== formData.totalAmount) {
            setFormData(prev => ({
                ...prev,
                subtotal: newSubtotal,
                taxAmount: newTaxAmount,
                totalAmount: newTotalAmount,
            }));
        }
    }, [formData.lineItems, formData.subtotal, formData.taxAmount, formData.totalAmount]);


    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name as keyof typeof formData]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }, [formErrors]);

    const handleLineItemChange = useCallback((id: string, field: keyof InvoiceLineItem, value: string | number) => {
        setFormData(prev => {
            const newLineItems = prev.lineItems.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    // Recalculate total for the line item
                    if (field === 'quantity' || field === 'unitPrice') {
                        const quantity = typeof updatedItem.quantity === 'number' ? updatedItem.quantity : parseFloat(String(updatedItem.quantity || 0));
                        const unitPrice = typeof updatedItem.unitPrice === 'number' ? updatedItem.unitPrice : parseFloat(String(updatedItem.unitPrice || 0));
                        updatedItem.total = parseFloat((quantity * unitPrice).toFixed(2));
                    }
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, lineItems: newLineItems };
        });

        if (lineItemErrors[id]?.[field as keyof InvoiceLineItem]) {
            setLineItemErrors(prev => ({
                ...prev,
                [id]: {
                    ...(prev[id] || {}),
                    [field]: undefined,
                },
            }));
        }
    }, [lineItemErrors]);

    const addLineItem = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            lineItems: [...prev.lineItems, { ...initialLineItem, id: generateId() }],
        }));
    }, []);

    const removeLineItem = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter(item => item.id !== id),
        }));
        setLineItemErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    }, []);

    const validateForm = useCallback(() => {
        const errors: Partial<Record<keyof typeof formData, string>> = {};
        const liErrors: Record<string, Partial<Record<keyof InvoiceLineItem, string>>> = {};
        let isValid = true;

        if (!formData.invoiceNumber.trim()) { errors.invoiceNumber = 'Invoice number is required.'; isValid = false; }
        if (!formData.customerId) { errors.customerId = 'Customer is required.'; isValid = false; }
        if (!formData.issueDate) { errors.issueDate = 'Issue date is required.'; isValid = false; }
        if (!formData.dueDate) { errors.dueDate = 'Due date is required.'; isValid = false; }
        if (new Date(formData.issueDate) > new Date(formData.dueDate)) { errors.dueDate = 'Due date cannot be before issue date.'; isValid = false; }

        if (formData.lineItems.length === 0) {
            errors.lineItems = 'At least one line item is required.';
            isValid = false;
        } else {
            formData.lineItems.forEach((item) => {
                const itemErrors: Partial<Record<keyof InvoiceLineItem, string>> = {};
                if (!item.description.trim()) { itemErrors.description = 'Description is required.'; isValid = false; }
                if (item.quantity <= 0) { itemErrors.quantity = 'Quantity must be positive.'; isValid = false; }
                if (item.unitPrice <= 0) { itemErrors.unitPrice = 'Unit price must be positive.'; isValid = false; }
                if (Object.keys(itemErrors).length > 0) {
                    liErrors[item.id] = itemErrors;
                }
            });
        }

        setFormErrors(errors);
        setLineItemErrors(liErrors);
        return isValid;
    }, [formData]);


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            addNotification('error', 'Please correct the errors in the form.', true, 5000);
            return;
        }

        const counterpartyName = customers.find(c => c.id === formData.customerId)?.name || 'Unknown Customer';

        const finalInvoice: Invoice = {
            ...formData,
            counterpartyName,
            amount: formData.totalAmount, // Map new totalAmount back to original 'amount' for DataContext
            payments: invoiceToEdit?.payments || [], // Keep existing payments for edit, empty for new
            activities: invoiceToEdit?.activities || [], // Keep existing activities for edit, empty for new
        };

        // Add an activity for creation/update
        const action = isNewInvoice ? 'Invoice Created' : 'Invoice Updated';
        finalInvoice.activities.push({
            id: generateId(),
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date(),
            action,
            details: { ...formData }, // Store a snapshot of changes
        });

        // Simulate API call
        // await api.invoices.save(finalInvoice);
        onSaveInvoice(finalInvoice); // Call the parent handler
        addNotification('success', `Invoice #${finalInvoice.invoiceNumber} ${isNewInvoice ? 'created' : 'updated'} successfully!`, true, 3000);
        onClose();
    }, [formData, validateForm, customers, isNewInvoice, invoiceToEdit, onSaveInvoice, onClose, currentUser, addNotification]);

    if (!hasPermission(currentUser.role, isNewInvoice ? 'create' : 'edit')) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Access Denied" size="sm">
                <p className="text-red-300">You do not have permission to {isNewInvoice ? 'create' : 'edit'} invoices.</p>
                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isNewInvoice ? 'Create New Invoice' : `Edit Invoice: ${formData.invoiceNumber}`} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Invoice Number */}
                    <div>
                        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-400 mb-1">Invoice Number <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="invoiceNumber"
                            name="invoiceNumber"
                            value={formData.invoiceNumber}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2 text-sm text-white bg-gray-700 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500 ${formErrors.invoiceNumber ? 'border-red-500' : 'border-gray-600'}`}
                            required
                        />
                        {formErrors.invoiceNumber && <p className="mt-1 text-xs text-red-400">{formErrors.invoiceNumber}</p>}
                    </div>

                    {/* Customer */}
                    <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-400 mb-1">Customer <span className="text-red-500">*</span></label>
                        <select
                            id="customerId"
                            name="customerId"
                            value={formData.customerId}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2 text-sm text-white bg-gray-700 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500 ${formErrors.customerId ? 'border-red-500' : 'border-gray-600'}`}
                            required
                        >
                            <option value="">Select a Customer</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                        {formErrors.customerId && <p className="mt-1 text-xs text-red-400">{formErrors.customerId}</p>}
                    </div>

                    {/* Issue Date */}
                    <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-400 mb-1">Issue Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            id="issueDate"
                            name="issueDate"
                            value={formData.issueDate}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2 text-sm text-white bg-gray-700 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500 ${formErrors.issueDate ? 'border-red-500' : 'border-gray-600'}`}
                            required
                        />
                        {formErrors.issueDate && <p className="mt-1 text-xs text-red-400">{formErrors.issueDate}</p>}
                    </div>

                    {/* Due Date */}
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-400 mb-1">Due Date <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2 text-sm text-white bg-gray-700 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500 ${formErrors.dueDate ? 'border-red-500' : 'border-gray-600'}`}
                            required
                        />
                        {formErrors.dueDate && <p className="mt-1 text-xs text-red-400">{formErrors.dueDate}</p>}
                    </div>

                    {/* Status */}
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`block w-full px-3 py-2 text-sm text-white bg-gray-700 border rounded-lg focus:ring-cyan-500 focus:border-cyan-500 ${formErrors.status ? 'border-red-500' : 'border-gray-600'}`}
                            disabled={!hasPermission(currentUser.role, 'admin') && !isNewInvoice} // Only admins can change status after creation
                        >
                            {(['unpaid', 'paid', 'overdue', 'voided'] as const).map(s => (
                                <option key={s} value={s} disabled={s === 'voided' && !hasPermission(currentUser.role, 'admin')}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                            ))}
                        </select>
                        {formErrors.status && <p className="mt-1 text-xs text-red-400