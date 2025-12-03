import React from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ComposedChart, CartesianGrid, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'; // Added ComposedChart, CartesianGrid, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis

// --- START OF NEW CODE ---

// SECTION 1: Interfaces and Types - Expanded significantly for more realism and detail
// This section will be extensive.

export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string;
    category: string;
    subCategory: string;
    brand: string;
    manufacturer: string;
    price: number;
    cost: number;
    markupPercentage: number;
    stock: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderQuantity: number;
    supplierId: string; // Foreign key to Vendor.id
    warehouseLocation: string; // Foreign key to Warehouse.id
    weight: number; // in kg
    dimensions: { length: number; width: number; height: number; unit: 'cm' | 'inch'; };
    isActive: boolean;
    imageUrl: string;
    barcode: string;
    taxRate: number; // as a decimal, e.g., 0.08 for 8%
    unitsSoldLastMonth: number;
    unitsSoldLastQuarter: number;
    averageRating: number; // out of 5
    reviewCount: number;
    warrantyMonths: number;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    leadTimeDays: number;
    seasonalityScore: number; // 0-1 (e.g., 0.8 means 80% more demand in peak season)
    hazardousMaterial: boolean;
    shelfLifeDays?: number; // For perishable goods
    batchNumber?: string; // For tracking specific production batches
    lastRestockDate?: string;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    shippingAddresses: Array<{ label: string; street: string; city: string; state: string; zip: string; country: string; }>; // Multiple shipping addresses
    companyName?: string;
    customerType: 'Individual' | 'Business';
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    lastOrderDate: string;
    firstOrderDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    paymentTerms: string; // e.g., 'Net 30', 'Due on receipt'
    creditLimit: number;
    accountBalance: number; // Positive means customer owes, negative means credit
    notes: string;
    segment: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'; // Customer segmentation
    preferredContactMethod: 'Email' | 'Phone' | 'SMS';
    marketingOptIn: boolean;
}

export interface Vendor {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    paymentTerms: string;
    creditDays: number;
    totalPurchased: number;
    lastPurchaseDate: string;
    productsSupplied: string[]; // Product IDs
    rawMaterialsSupplied: string[]; // RawMaterial IDs
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    contractStartDate: string;
    contractEndDate: string;
    rating: number; // out of 5
    onTimeDeliveryRate: number; // %
    qualityScore: number; // %
    notes: string;
    vendorCategory: 'Primary' | 'Secondary' | 'Tertiary';
    minimumOrderValue?: number;
}

export interface SalesOrder {
    id: string;
    customerId: string;
    customerName: string;
    orderDate: string;
    status: 'Draft' | 'Pending Approval' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'On Hold';
    totalAmount: number;
    items: { productId: string; productName: string; sku: string; quantity: number; unitPrice: number; total: number; }[];
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    billingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    shippingCost: number;
    taxRate: number; // applied to subtotal
    taxAmount: number;
    discountPercentage: number;
    discountAmount: number;
    subtotal: number;
    expectedDeliveryDate: string;
    actualDeliveryDate?: string;
    paymentStatus: 'Paid' | 'Pending' | 'Partially Paid' | 'Refunded' | 'Overdue';
    invoiceId?: string;
    salesRepId: string; // Employee ID
    notes: string;
    fulfillmentProgress: number; // 0-100%
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    channel: 'Online' | 'Direct' | 'Reseller';
}

export interface PurchaseOrder {
    id: string;
    vendorId: string;
    vendorName: string;
    orderDate: string;
    status: 'Draft' | 'Pending Approval' | 'Ordered' | 'Received' | 'Partially Received' | 'Cancelled' | 'On Hold';
    totalAmount: number;
    items: { productId: string; productName: string; quantity: number; unitPrice: number; total: number; }[];
    expectedDeliveryDate: string;
    actualDeliveryDate?: string;
    paymentTerms: string;
    invoiceId?: string;
    purchasingAgentId: string; // Employee ID
    notes: string;
    receivingProgress: number; // 0-100%
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    paymentStatus: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
}

export interface Invoice {
    id: string;
    orderId: string; // Can be SalesOrder or PurchaseOrder ID
    orderType: 'Sales' | 'Purchase';
    customerId?: string;
    customerName?: string;
    vendorId?: string;
    vendorName?: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    status: 'Paid' | 'Partially Paid' | 'Due' | 'Overdue' | 'Cancelled' | 'Refunded';
    paymentHistory: { date: string; amount: number; method: string; transactionId?: string; }[];
    lineItems: { description: string; quantity: number; unitPrice: number; total: number; productId?: string; }[];
    taxAmount: number;
    discountAmount: number;
    currency: string;
    notes: string;
    relatedDocumentIds: string[]; // e.g., shipment IDs, credit memos
}

export interface Shipment {
    id: string;
    orderId: string; // SalesOrder ID
    trackingNumber: string;
    carrier: string;
    serviceType: string; // e.g., 'Standard', 'Express', 'Freight'
    status: 'Pending' | 'Scheduled' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Failed Attempt' | 'Exception' | 'Cancelled';
    originAddress: { street: string; city: string; state: string; zip: string; country: string; };
    destinationAddress: { street: string; city: string; state: string; zip: string; country: string; };
    shippedDate: string;
    estimatedDeliveryDate: string;
    actualDeliveryDate?: string;
    itemsShipped: { productId: string; quantity: number; }[];
    cost: number;
    weight: number; // total weight
    dimensions: { length: number; width: number; height: number; unit: 'cm' | 'inch'; };
    notes: string;
    signatureRequired: boolean;
    packagingType: 'Box' | 'Pallet' | 'Envelope';
    lastUpdated: string; // Timestamp of last status update
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    hireDate: string;
    salary: number;
    status: 'Active' | 'On Leave' | 'Terminated' | 'Suspended';
    managerId?: string;
    managerName?: string;
    birthDate: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    employmentType: 'Full-time' | 'Part-time' | 'Contractor';
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
    annualLeaveDays: number;
    sickLeaveDays: number;
    leaveTakenYTD: number;
    performanceRating: number; // 1-5
    skills: string[];
    certifications: string[];
    employeeBenefits: { healthInsurance: boolean; dentalInsurance: boolean; retirementPlan: boolean; };
    lastPerformanceReview: string;
    nextPerformanceReview: string;
}

export interface FinancialTransaction {
    id: string;
    type: 'Revenue' | 'Expense' | 'Transfer' | 'Adjustment';
    category: string; // e.g., 'Sales', 'Rent', 'Salaries', 'Supplies', 'Bank Charges'
    subCategory?: string;
    amount: number;
    date: string;
    description: string;
    accountId: string; // e.g., 'Cash', 'Bank A', 'Bank B' (GLAccount ID)
    relatedEntityId?: string; // e.g., SalesOrder ID, PurchaseOrder ID, Invoice ID
    status: 'Cleared' | 'Pending' | 'Reconciled' | 'Voided';
    currency: string;
    notes: string;
    paymentMethod?: string; // 'Bank Transfer', 'Credit Card', 'Cash', 'Check'
    transactionRef?: string; // Bank transaction ID
    recordedBy: string; // Employee ID
}

export interface GLAccount {
    id: string;
    name: string;
    accountNumber: string;
    type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
    subType: string