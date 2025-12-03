import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'; // Added BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
import { FaUser, FaBox, FaShoppingCart, FaChartBar, FaCog, FaBell, FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaSave, FaListAlt, FaCalendarAlt, FaDollarSign, FaCreditCard, FaTruck, FaFileInvoice, FaTag, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaArrowRight, FaArrowLeft, FaSortUp, FaSortDown, FaFilter, FaRedo, FaUpload, FaDownload, FaPrint, FaEye, FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaSpinner, FaChevronDown, FaChevronUp, FaUsers, FaClipboardList, FaPercent } from 'react-icons/fa'; // Added many more icons

const salesData = [
    { name: 'Jan', sales: 120000 }, { name: 'Feb', sales: 150000 }, { name: 'Mar', sales: 180000 },
    { name: 'Apr', sales: 170000 }, { name: 'May', sales: 210000 }, { name: 'Jun', sales: 250000 },
];

const topProducts = [
    { id: 1, name: 'Quantum AI Subscription - Pro', sales: 85000, units: 170 },
    { id: 2, name: 'Data Factory - Enterprise Plan', sales: 65000, units: 13 },
    { id: 3, name: 'Compute Credits - 10k Block', sales: 50000, units: 500 },
];

// START: NEW CODE FOR REAL APPLICATION IN THE REAL WORLD

/**
 * =========================================================================
 *  SECTION 1: Core Utility Functions and Data Helpers
 * =========================================================================
 * This section defines fundamental helper functions for unique ID generation,
 * data formatting, asynchronous operations, and basic data manipulation.
 */

/**
 * Type alias for a unique identifier string.
 * This ensures consistency across all entity IDs within the application.
 */
export type EntityId = string;

/**
 * Generates a unique ID string using a combination of random numbers and base-36 encoding.
 * This is suitable for client-side unique ID generation for mock data.
 * In a real-world application, this would typically come from a backend service (UUID, sequence, etc.).
 * @returns {EntityId} A new unique identifier string.
 */
export const generateId = (): EntityId => `id_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Formats a number as currency using `Intl.NumberFormat` for internationalization.
 * Supports different currencies and locales.
 * @param {number} amount - The numeric value to be formatted as currency.
 * @param {string} currency - The three-letter ISO 4217 currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @param {string} locale - The locale string (e.g., 'en-US', 'de-DE'). Defaults to 'en-US'.
 * @returns {string} The formatted currency string, e.g., "$1,234.56".
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Formats a date object or date string into a human-readable string.
 * Uses `Intl.DateTimeFormat` for flexible and localized date formatting.
 * @param {Date | string} dateInput - The date object or string to format. If a string, it's parsed into a Date.
 * @param {Intl.DateTimeFormatOptions} options - Formatting options, such as `year`, `month`, `day`, `hour`, `minute`.
 * @param {string} locale - The locale string. Defaults to 'en-US'.
 * @returns {string} The formatted date string.
 */
export const formatDate = (
    dateInput: Date | string,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
    locale: string = 'en-US'
): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    // Handle invalid dates gracefully
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Formats a number with thousands separators for improved readability.
 * @param {number} value - The number to format.
 * @param {string} locale - The locale string. Defaults to 'en-US'.
 * @returns {string} The formatted number string, e.g., "120,000".
 */
export const formatNumber = (value: number, locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale).format(value);
};

/**
 * Capitalizes the first letter of a given string.
 * Useful for display purposes, e.g., status messages.
 * @param {string} str - The input string.
 * @returns {string} The string with its first letter capitalized.
 */
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Simulates a network delay using `setTimeout` to mimic asynchronous API calls.
 * This helps in observing loading states in the UI during development.
 * @param {number} ms - The delay duration in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Generates a random integer within a specified inclusive range.
 * @param {number} min - The minimum possible integer value (inclusive).
 * @param {number} max - The maximum possible integer value (inclusive).
 * @returns {number} A random integer between `min` and `max`.
 */
export const getRandomInt = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generates a random Date object between two specified dates.
 * Useful for mock data generation.
 * @param {Date} start - The earliest possible date.
 * @param {Date} end - The latest possible date.
 * @returns {Date} A random Date object.
 */
export const getRandomDate = (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Performs a deep clone of an object using JSON serialization.
 * This is a simple method suitable for objects that can be JSON-serialized (no functions, `Date` objects become strings, etc.).
 * @template T The type of the object to clone.
 * @param {T} obj - The object to be deep-cloned.
 * @returns {T} A deep copy of the input object.
 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * =========================================================================
 *  SECTION 2: Data Models and Interfaces
 * =========================================================================
 * This section defines the TypeScript interfaces for all major entities
 * and data structures used throughout the commerce application.
 */

/**
 * Represents a user of the commerce platform, typically an internal admin or employee.
 */
export interface User {
    id: EntityId;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'viewer' | 'customer'; // Defines user roles for access control
    createdAt: Date;
    lastLogin: Date;
    isActive: boolean; // Indicates if the user account is active
}

/**
 * Represents a customer of the commerce platform.
 * Includes personal details, address, and aggregate order statistics.
 */
export interface Customer {
    id: EntityId;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string; // Optional phone number
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    totalOrders: number; // Count of orders placed by this customer
    totalSpent: number; // Total money spent by this customer
    registrationDate: Date;
    lastActivity: Date; // Last time the customer interacted with the platform
    status: 'active' | 'inactive' | 'vip'; // Customer segmentation status
    notes?: string; // Internal notes about the customer
}

/**
 * Represents a product available in the catalog.
 * Details include pricing, inventory, categorization, and physical attributes.
 */
export interface Product {
    id: EntityId;
    name: string;
    description: string;
    price: number; // Selling price
    cost: number; // Cost of goods sold
    sku: string; // Stock Keeping Unit - unique identifier for the product
    category: string;
    stock: number; // Current quantity in inventory
    imageUrl: string;
    weightKg?: number; // Optional physical attribute
    dimensionsCm?: { length: number; width: number; height: number; }; // Optional physical attribute
    isActive: boolean; // Whether the product is available for sale
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Represents a single item within an order, linking to a product and specifying quantity and price.
 */
export interface OrderItem {
    productId: EntityId;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number; // quantity * unitPrice
}

/**
 * Defines possible statuses for an order, reflecting its current stage in the fulfillment process.
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

/**
 * Represents a customer order.
 * Contains customer info, items, financial breakdowns, shipping/billing, and status.
 */
export interface Order {
    id: EntityId;
    customerId: EntityId;
    customerName: string;
    orderDate: Date;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    totalAmount: number; // subtotal + shippingCost + taxAmount - discountAmount
    status: OrderStatus;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    billingAddress: