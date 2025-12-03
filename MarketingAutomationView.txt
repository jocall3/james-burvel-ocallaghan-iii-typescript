import React, { useContext, useMemo, useState, useEffect, useCallback, createContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// --- New Imports for icons/utility (assuming they exist or are simple placeholders) ---
// Note: In a real project, these would be imported from a UI library like 'react-icons'
// For this exercise, we'll assume their availability or simple text rendering.
const IconPlus = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const IconEdit = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const IconDelete = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const IconCopy = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-4 4v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2h10a2 2 0 012 2z" /></svg>;
const IconCog = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconChartBar = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconFunnel = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconCheckCircle = () => <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const IconXCircle = () => <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const IconClock = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconCurrencyDollar = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L19 10.5M12 8V4m0 12v4m-5.463-2.634A9.999 9.999 0 0112 11c-1.11 0-2.08.402-2.592 1L5 10.5" /></svg>;
const IconUsers = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V8a2 2 0 00-2-2h-2m-4 5h4m-4 0v-2m4 2v2M12 8V4m0 16v-4m-6-2H4a2 2 0 01-2-2V7a2 2 0 012-2h2m4 5v-2m-4 2v2" /></svg>;
const IconMail = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>;
const IconShare = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.516 3.909a3 3 0 00.756-.992l2.454-7.362a1 1 0 00-.707-1.121 1 1 0 00-.974.225l-2.454 7.362a3 3 0 00-2.502 3.124M5 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.516 3.909a3 3 0 00.756-.992l2.454-7.362a1 1 0 00-.707-1.121 1 1 0 00-.974.225l-2.454 7.362a3 3 0 00-2.502 3.124" /></svg>;
const IconCalendar = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconLightBulb = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6 1.11l-.422.245M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7.414 2.586a2 2 0 112.828 0m-8.485 2.121H17.5" /></svg>;
const IconHashtag = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;
const IconPlay = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconStop = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10h6v4H9z" /></svg>;
const IconEye = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const IconPaperAirplane = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const IconTerminal = () => <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


// --- UTILITY FUNCTIONS AND INTERFACES (to be exported) ---

/**
 * @interface Pagination
 * @property {number} currentPage - The current page number.
 * @property {number} totalPages - The total number of pages.
 * @property {number} pageSize - The number of items per page.
 * @property {number} totalItems - The total number of items.
 */
export interface Pagination {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
}

/**
 * @function generatePaginationControls
 * @description Generates an array of page numbers for pagination controls.
 * @param {Pagination} pagination - Pagination object.
 * @returns {Array<number|string>} An array of page numbers or '...' for ellipses.
 */
export const generatePaginationControls = (pagination: Pagination): (number | string)[] => {
    const { currentPage, totalPages } = pagination;
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        pageNumbers.push(1);
        if (currentPage > 3) pageNumbers.push('...');
        if (currentPage > 2) pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        if (currentPage < totalPages - 1) pageNumbers.push(currentPage + 1);
        if (currentPage < totalPages - 2) pageNumbers.push('...');
        pageNumbers.push(totalPages);
    }
    return Array.from(new Set(pageNumbers)); // Remove duplicates
};

/**
 * @function formatDate
 * @description Formats a date string into a readable format.
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted date string.
 */
export const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/**
 * @function formatCurrency
 * @description Formats a number as a currency string.
 * @param {number} amount - The amount to format.
 * @param {string} currency - The currency symbol (e.g., 'USD').
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

/**
 * @function debounce
 * @description Debounces a function call.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>): void {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// --- DATA INTERFACES FOR NEW FEATURES (to be exported) ---

/**
 * @interface MarketingCampaignDetail
 * @augments {MarketingCampaign}
 * @property {string} campaignId - Unique identifier for the campaign.
 * @property {string} description - Detailed description of the campaign.
 * @property {string} channel - Primary marketing channel (e.g., 'Email', 'Social Media', 'PPC').
 * @property {string} objective - Main goal of the campaign (e.g., 'Lead Generation', 'Brand Awareness', 'Sales').
 * @property {Date} startDate - Campaign start date.
 * @property {Date} endDate - Campaign end date.
 * @property {number} budget - Total allocated budget for the campaign.
 * @property {string[]} audienceSegments - IDs of target audience segments.
 * @property {string[]} adCreatives - URLs or IDs of ad creatives used.
 * @property {string} status - Current status of the campaign ('Planned', 'Active', 'Paused', 'Completed').
 * @property {object} analytics - Detailed analytics data for the campaign.
 * @property {number} analytics.impressions - Number of times ads were shown.
 * @property {number} analytics.clicks - Number of clicks on ads.
 * @property {number} analytics.conversions - Number of desired actions taken.
 * @property {number} analytics.ctr - Click-Through Rate.
 * @property {number} analytics.cpa - Cost Per Acquisition.
 * @property {number} analytics.roi - Return on Investment.
 */
export interface MarketingCampaignDetail {
    campaignId: string;
    name: string;
    description: string;
    channel: 'Email' | 'Social Media' | 'PPC' | 'Content Marketing' | 'SEO' | 'Affiliate';
    objective: 'Lead Generation' | 'Brand Awareness' | 'Sales' | 'Customer Retention' | 'Engagement';
    startDate: Date;
    endDate: Date;
    budget: number;
    cost: number; // Existing property
    revenueGenerated: number; // Existing property
    audienceSegments: string[];
    adCreatives: string[];
    status: 'Planned' | 'Active' | 'Paused' | 'Completed' | 'Archived';
    analytics: {
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number; // (clicks / impressions) * 100
        cpa: number; // (cost / conversions)
        roi: number; // ((revenueGenerated - cost) / cost) * 100
    };
    notes?: string;
    owner?: string; // User ID
    tags?: string[];
}

/**
 * @interface AudienceSegment
 * @property {string} id - Unique segment ID.
 * @property {string} name - Name of the segment.
 * @property {string} description - Description of the segment.
 * @property {object[]} rules - Array of rules defining the segment.
 * @property {string} rules.field - Field to filter on (e.g., 'age', 'location', 'purchaseHistory').
 * @property {string} rules.operator - Comparison operator (e.g., 'equals', 'greaterThan', 'contains').
 * @property {string | number | string[]} rules.value - Value to compare against.
 * @property {number} estimatedSize - Estimated number of contacts in this segment.
 * @property {Date} createdAt - Date segment was created.
 * @property {Date} lastModified - Date segment was last modified.
 */
export interface AudienceSegment {
    id: string;
    name: string;
    description: string;
    rules: { field: string; operator: string; value: any }[];
    estimatedSize: number;
    createdAt: Date;
    lastModified: Date;
}

/**
 * @interface WorkflowNode
 * @property {string} id - Unique ID of the node.
 * @property {string} type - Type of node (e.g., 'trigger', 'action', 'condition').
 * @property {string} name - Display name of the node.
 * @property {object} properties - Configuration properties for the node.
 * @property {string[]} nextNodes - IDs of connected nodes.
 * @property {number} x - X coordinate for visual placement.
 * @property {number} y - Y coordinate for visual placement.
 */
export interface WorkflowNode {
    id: string;
    type: 'trigger' | 'action' | 'condition' | 'end';
    name: string;
    properties: any;
    nextNodes: string[]; // IDs of nodes this node connects to
    position: { x: number; y: number }; // For visual layout
}

/**
 * @interface MarketingWorkflow
 * @property {string} id - Unique workflow ID.
 * @property {string} name - Name of the workflow.
 * @property {string} description - Description of the workflow.
 * @property {WorkflowNode[]} nodes - Array of nodes in the workflow.
 * @property {string} status - Workflow status ('Draft', 'Active', 'Paused', 'Archived').
 * @property {Date} createdAt - Creation timestamp.
 * @property {Date} lastModified - Last modified timestamp.
 * @property {string} triggerType - The main trigger type (e.g., 'new_lead', 'purchase').
 * @property {boolean} isActive - Is the workflow currently active?
 */
export interface MarketingWorkflow {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    status: 'Draft' | 'Active' | 'Paused' | 'Archived';
    createdAt: Date;
    lastModified: Date;
    triggerType: string;
    isActive: boolean;
}

/**
 * @interface EmailTemplate
 * @property {string} id - Unique template ID.
 * @property {string} name - Template name.
 * @property {string} subject - Default email subject.
 * @property {string} htmlContent - HTML content of the email.
 * @property {string} plainTextContent - Plain text fallback.
 * @property {Date} createdAt - Creation date.
 * @property {Date} lastModified - Last modified date.
 * @property {string[]} tags - Categorization tags.
 */
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    plainTextContent: string;
    createdAt: Date;
    lastModified: Date;
    tags: string[];
}

/**
 * @interface EmailCampaign
 * @property {string} id - Unique email campaign ID.
 * @property {string} name - Campaign name.
 * @property {string} templateId - ID of the email template used.
 * @property {string} segmentId - ID of the audience segment targeted.
 * @property {string} senderEmail - Sender's email address.
 * @property {string} senderName - Sender's name.
 * @property {Date} scheduledSendTime - When the email is scheduled to send.
 * @property {string} status - Campaign status ('Draft', 'Scheduled', 'Sending', 'Sent', 'Cancelled').
 * @property {object} stats - Performance statistics.
 * @property {number} stats.sent - Number of emails sent.
 * @property {number} stats.opens - Number of unique opens.
 * @property {number} stats.clicks - Number of unique clicks.
 * @property {number} stats.bounces - Number of bounces.
 * @property {number} stats.unsubscribes - Number of unsubscribes.
 */
export interface EmailCampaign {
    id: string;
    name: string;
    templateId: string;
    segmentId: string;
    senderEmail: string;
    senderName: string;
    subject: string;
    scheduledSendTime: Date;
    status: 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Cancelled';
    stats: {
        sent: number;
        opens: number;
        clicks: number;
        bounces: number;
        unsubscribes: number;
    };
    createdAt: Date;
    lastModified: Date;
}

/**
 * @interface SocialPost
 * @property {string} id - Unique post ID.
 * @property {string} content - Text content of the post.
 * @property {string[]} imageUrls - Array of image URLs.
 * @property {string[]} videoUrls - Array of video URLs.
 * @property {'facebook' | 'twitter' | 'linkedin' | 'instagram'} platform - Social media platform.
 * @property {Date} scheduledTime - When the post is scheduled.
 * @property {string} status - Post status ('Draft', 'Scheduled', 'Posted', 'Failed').
 * @property {object} analytics - Post performance metrics.
 * @property {number} analytics.reach - Number of unique users who saw the post.
 * @property {number} analytics.engagement - Number of likes, comments, shares.
 * @property {number} analytics.impressions - Total number of times the post was seen.
 */
export interface SocialPost {
    id: string;
    content: string;
    imageUrls?: string[];
    videoUrls?: string[];
    platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram';
    scheduledTime: Date;
    status: 'Draft' | 'Scheduled' | 'Posted' | 'Failed';
    analytics?: {
        reach: number;
        engagement: number;
        impressions: number;
    };
    createdAt: Date;
    lastModified: Date;
}

/**
 * @interface ABTest
 * @property {string} id - Unique test ID.
 * @property {string} name - Test name.
 * @property {string} description - Description of what's being tested.
 * @property {'ad_copy' | 'landing_page' | 'email_subject'} type - Type of A/B test.
 * @property {string[]} variants - Array of variant IDs or content strings.
 * @property {number[]} trafficDistribution - Percentage distribution for each variant (sums to 100).
 * @property {string} primaryMetric - Metric to optimize for (e.g., 'conversions', 'CTR', 'revenue').
 * @property {Date} startDate - Test start date.
 * @property {Date} endDate - Test end date.
 * @property {string} status - Test status ('Planned', 'Running', 'Completed', 'Archived').
 * @property {object} results - Test results.
 * @property {object[]} results.variantResults - Performance for each variant.
 * @property {number} results.variantResults.conversions - Conversions for this variant.
 * @property {number} results.variantResults.impressions - Impressions for this variant.
 * @property {number} results.variantResults.ctr - CTR for this variant.
 * @property {string | null} results.winningVariantId - ID of the winning variant, if any.
 * @property {number | null} results.confidenceLevel - Statistical confidence.
 */
export interface ABTest {
    id: string;
    name: string;
    description: string;
    type: 'ad_copy' | 'landing_page' | 'email_subject' | 'email_body' | 'cta_button';
    variants: { id: string, name: string, content: string, trafficShare: number, meta?: any }[];
    primaryMetric: 'conversions' | 'clicks' | 'revenue' | 'signups';
    startDate: Date;
    endDate: Date | null;
    status: 'Planned' | 'Running' | 'Completed' | 'Archived';
    results?: {
        variantResults: {
            variantId: string;
            impressions: number;
            clicks: number;
            conversions: number;
            revenue?: number;
            ctr: number;
            conversionRate: number;
        }[];
        winningVariantId: string | null;
        confidenceLevel: number | null; // e.g., 95%
        conclusion: string;
    };
    createdAt: Date;
    lastModified: Date;
    campaignId?: string; // Link to a campaign
}

/**
 * @interface ContactProfile
 * @property {string} id - Unique contact ID.
 * @property {string} email - Contact's email address.
 * @property {string} firstName - First name.
 * @property {string} lastName - Last name.
 * @property {string} phone - Phone number.
 * @property {string} city - City.
 * @property {string} country - Country.
 * @property {Date} signUpDate - Date of signup.
 * @property {string[]} tags - Tags applied to the contact.
 * @property {string[]} segmentIds - IDs of segments this contact belongs to.
 * @property {number} leadScore - Current lead score.
 * @property {object} lastActivity - Last known interaction.
 * @property {Date} lastActivity.date - Date of last activity.
 * @property {string} lastActivity.type - Type of last activity (e.g., 'email_open', 'website_visit', 'purchase').
 */
export interface ContactProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    city?: string;
    country?: string;
    signUpDate: Date;
    tags: string[];
    segmentIds: string[];
    leadScore: number;
    lastActivity: {
        date: Date;
        type: string;
        details?: string;
    };
    purchaseHistory?: {
        orderId: string;
        date: Date;
        amount: number;
        items: string[];
    }[];
    websiteVisits?: {
        date: Date;
        page: string;
        duration: number; // in seconds
    }[];
}

/**
 * @interface Notification
 * @property {string} id - Unique notification ID.
 * @property {string} message - Notification message.
 * @property {string} type - Type of notification ('info', 'warning', 'error', 'success').
 * @property {boolean} read - Whether the notification has been read.
 * @property {Date} timestamp - When the notification was created.
 * @property {string} link - Optional link to related resource.
 */
export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    read: boolean;
    timestamp: Date;
    link?: string;
}

/**
 * @interface AuditLogEntry
 * @property {string} id - Unique log entry ID.
 * @property {Date} timestamp - When the event occurred.
 * @property {string} userId - ID of the user who performed the action.
 * @property {string} action - Description of the action (e.g., 'Created Campaign', 'Updated Segment').
 * @property {string} resourceType - Type of resource affected (e.g., 'Campaign', 'Segment').
 * @property {string} resourceId - ID of the resource affected.
 * @property {object} changes - JSON object detailing changes (e.g., old and new values).
 */
export interface AuditLogEntry {
    id: string;
    timestamp: Date;
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    changes?: Record<string, any>;
}

// --- DUMMY DATA GENERATION FUNCTIONS (to be exported) ---

let campaignIdCounter = 1000;
export const generateDummyCampaign = (namePrefix: string = "Campaign"): MarketingCampaignDetail => {
    const id = `CAM-${campaignIdCounter++}`;
    const startDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
    const endDate = new Date(startDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000); // Up to 60 days duration
    const budget = Math.round(Math.random() * 10000 + 500);
    const cost = budget * (0.5 + Math.random() * 0.5); // 50-100% of budget
    const revenue = cost * (0.8 + Math.random() * 2); // 80%-200% ROAS
    const impressions = Math.round(Math.random() * 100000 + 1000);
    const clicks = Math.round(impressions * (0.01 + Math.random() * 0.05)); // 1-6% CTR
    const conversions = Math.round(clicks * (0.005 + Math.random() * 0.02)); // 0.5-2.5% Conversion Rate
    const ctr = (clicks / impressions) * 100;
    const cpa = conversions > 0 ? (cost / conversions) : cost;
    const roi = ((revenue - cost) / cost) * 100;

    const channels = ['Email', 'Social Media', 'PPC', 'Content Marketing', 'SEO', 'Affiliate'];
    const objectives = ['Lead Generation', 'Brand Awareness', 'Sales', 'Customer Retention', 'Engagement'];
    const statuses = ['Planned', 'Active', 'Paused', 'Completed', 'Archived'];

    return {
        campaignId: id,
        name: `${namePrefix} ${campaignIdCounter - 1}`,
        description: `This is a detailed description for ${namePrefix} ${campaignIdCounter - 1}, targeting specific customer demographics to ${objectives[Math.floor(Math.random() * objectives.length)]}.`,
        channel: channels[Math.floor(Math.random() * channels.length)] as any,
        objective: objectives[Math.floor(Math.random() * objectives.length)] as any,
        startDate: startDate,
        endDate: endDate,
        budget: parseFloat(budget.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
        revenueGenerated: parseFloat(revenue.toFixed(2)),
        audienceSegments: [`SEG-${Math.floor(Math.random() * 5 + 1)}`],
        adCreatives: [`ad-creative-${Math.random().toString(36).substring(7)}`],
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        analytics: {
            impressions: impressions,
            clicks: clicks,
            conversions: conversions,
            ctr: parseFloat(ctr.toFixed(2)),
            cpa: parseFloat(cpa.toFixed(2)),
            roi: parseFloat(roi.toFixed(2)),
        },
        notes: `Initial planning notes: focus on value proposition and clear call to action.`,
        owner: `user-${Math.floor(Math.random() * 3 + 1)}`,
        tags: ['product-launch', 'holiday-sale', 'evergreen'][Math.floor(Math.random() * 3)].split(),
    };
};

let segmentIdCounter = 100;
export const generateDummySegment = (): AudienceSegment => {
    const id = `SEG-${segmentIdCounter++}`;
    const fields = ['age', 'location', 'purchaseHistory', 'websiteActivity', 'emailOpens'];
    const operators = ['equals', 'greaterThan', 'lessThan', 'contains', 'notContains'];
    const values = [25, 35, 'New York', 'California', 'purchased_X', 'visited_pricing_page', true, false];

    const rules = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        field: fields[Math.floor(Math.random() * fields.length)],
        operator: operators[Math.floor(Math.random() * operators.length)],
        value: values[Math.floor(Math.random() * values.length)],
    }));

    return {
        id: id,
        name: `Segment ${id}`,
        description: `Customers who ${rules.map(r => `${r.field} ${r.operator} ${r.value}`).join(' and ')}.`,
        rules: rules,
        estimatedSize: Math.floor(Math.random() * 50000) + 100,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    };
};

let workflowIdCounter = 1;
export const generateDummyWorkflow = (): MarketingWorkflow => {
    const id = `WF-${workflowIdCounter++}`;
    const statusOptions = ['Draft', 'Active', 'Paused', 'Archived'];
    const triggerTypes = ['New Lead Signup', 'Product Purchase', 'Cart Abandonment', 'Email Opened', 'Website Visit'];

    const nodes: WorkflowNode[] = [
        {
            id: 'node-start', type: 'trigger', name: 'Start Trigger',
            properties: { event: triggerTypes[Math.floor(Math.random() * triggerTypes.length)], details: 'customer signup' },
            nextNodes: ['node-email-welcome'], position: { x: 50, y: 50 }
        },
        {
            id: 'node-email-welcome', type: 'action', name: 'Send Welcome Email',
            properties: { templateId: 'TPL-001', delay: 'immediate' },
            nextNodes: ['node-condition-open'], position: { x: 250, y: 50 }
        },
        {
            id: 'node-condition-open', type: 'condition', name: 'Email Opened?',
            properties: { condition: 'email_opened', emailId: 'node-email-welcome', timeframe: '24h' },
            nextNodes: ['node-action-tag-engaged', 'node-action-followup'], position: { x: 450, y: 50 }
        },
        {
            id: 'node-action-tag-engaged', type: 'action', name: 'Add Engaged Tag',
            properties: { tag: 'engaged_lead' },
            nextNodes: ['node-end-success'], position: { x: 650, y: 0 }
        },
        {
            id: 'node-action-followup', type: 'action', name: 'Send Follow-up Email',
            properties: { templateId: 'TPL-002', delay: '1d' },
            nextNodes: ['node-end-followup'], position: { x: 650, y: 100 }
        },
        { id: 'node-end-success', type: 'end', name: 'End (Engaged)', properties: {}, nextNodes: [], position: { x: 850, y: 0 } },
        { id: 'node-end-followup', type: 'end', name: 'End (Follow-up)', properties: {}, nextNodes: [], position: { x: 850, y: 100 } },
    ];

    return {
        id: id,
        name: `Customer Onboarding ${id}`,
        description: `Automated journey for new signups based on initial engagement.`,
        nodes: nodes,
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)] as any,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        triggerType: triggerTypes[Math.floor(Math.random() * triggerTypes.length)],
        isActive: Math.random() > 0.5,
    };
};

let emailTemplateIdCounter = 1;
export const generateDummyEmailTemplate = (): EmailTemplate => {
    const id = `TPL-${emailTemplateIdCounter++}`;
    const names = ['Welcome Email', 'Product Update', 'Promotional Offer', 'Cart Reminder', 'Thank You'];
    const subjects = ['Welcome to Our Service!', 'New Features You\'ll Love', 'Exclusive Discount Just For You', 'Don\'t Forget Your Cart!', 'Thank You for Your Purchase'];
    const htmlContent = `<p>Hello {{contact.firstName}},</p><p>This is a beautiful email template for ${names[Math.floor(Math.random() * names.length)]}.</p><p>Best regards,<br>The Team</p>`;
    const plainTextContent = `Hello {{contact.firstName}},\n\nThis is a beautiful email template for ${names[Math.floor(Math.random() * names.length)]}.\n\nBest regards,\nThe Team`;
    const tags = [['welcome', 'onboarding'], ['product', 'update'], ['promo', 'sales'], ['cart', 'abandonment'], ['transactional']];

    return {
        id: id,
        name: names[Math.floor(Math.random() * names.length)],
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        htmlContent: htmlContent,
        plainTextContent: plainTextContent,
        createdAt: new Date(Date.now() - Math.random() * 200 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        tags: tags[Math.floor(Math.random() * tags.length)],
    };
};

let emailCampaignIdCounter = 1;
export const generateDummyEmailCampaign = (templateId: string, segmentId: string): EmailCampaign => {
    const id = `EMC-${emailCampaignIdCounter++}`;
    const names = ['Weekly Newsletter', 'New Feature Announce', 'Holiday Sale Blast', 'Engagement Drive'];
    const statuses = ['Draft', 'Scheduled', 'Sending', 'Sent', 'Cancelled'];

    const sent = Math.floor(Math.random() * 10000);
    const opens = Math.floor(sent * (0.1 + Math.random() * 0.3)); // 10-40% open rate
    const clicks = Math.floor(opens * (0.05 + Math.random() * 0.2)); // 5-25% click-to-open
    const bounces = Math.floor(sent * (0.01 + Math.random() * 0.03)); // 1-4% bounce rate
    const unsubscribes = Math.floor(opens * (0.001 + Math.random() * 0.01)); // 0.1-1.1% unsubscribe

    return {
        id: id,
        name: names[Math.floor(Math.random() * names.length)],
        templateId: templateId,
        segmentId: segmentId,
        senderEmail: 'marketing@example.com',
        senderName: 'Our Team',
        subject: `[Email Campaign] - ${names[Math.floor(Math.random() * names.length)]}`,
        scheduledSendTime: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 - 15 * 24 * 60 * 60 * 1000), // Some past, some future
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        stats: { sent, opens, clicks, bounces, unsubscribes },
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
    };
};

let socialPostIdCounter = 1;
export const generateDummySocialPost = (): SocialPost => {
    const id = `SP-${socialPostIdCounter++}`;
    const platforms = ['facebook', 'twitter', 'linkedin', 'instagram'];
    const statuses = ['Draft', 'Scheduled', 'Posted', 'Failed'];
    const contents = [
        "Exciting news! Our new feature is live. Check it out now! #product #update",
        "Happy Friday! What are your plans for the weekend? Let us know! #weekendvibes",
        "Behind the scenes at our office. Great teamwork makes the dream work! #companyculture",
        "Tip of the day: Optimize your marketing with these strategies. Link in bio!",
        "Flash Sale! Get 20% off all premium plans for a limited time. Don't miss out!",
    ];

    const scheduledTime = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000 - 15 * 24 * 60 * 60 * 1000); // Some past, some future
    const platform = platforms[Math.floor(Math.random() * platforms.length)] as any;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;

    const reach = status === 'Posted' ? Math.floor(Math.random() * 50000 + 100) : 0;
    const impressions = reach * (1 + Math.random() * 3);
    const engagement = status === 'Posted' ? Math.floor(Math.random() * reach * 0.05 + 1) : 0;

    return {
        id: id,
        content: contents[Math.floor(Math.random() * contents.length)],
        imageUrls: Math.random() > 0.5 ? [`https://via.placeholder.com/150?text=${platform}-${id}`] : [],
        platform: platform,
        scheduledTime: scheduledTime,
        status: status,
        analytics: { reach: reach, engagement: engagement, impressions: impressions },
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
    };
};

let abTestIdCounter = 1;
export const generateDummyABTest = (): ABTest => {
    const id = `ABT-${abTestIdCounter++}`;
    const types = ['ad_copy', 'landing_page', 'email_subject', 'cta_button'];
    const statuses = ['Planned', 'Running', 'Completed', 'Archived'];
    const metrics = ['conversions', 'clicks', 'revenue', 'signups'];

    const type = types[Math.floor(Math.random() * types.length)] as any;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const primaryMetric = metrics[Math.floor(Math.random() * metrics.length)] as any;

    const variantAContent = type === 'ad_copy' ? 'Catchy Headline A' : 'Landing Page Layout A';
    const variantBContent = type === 'ad_copy' ? 'Bold Headline B' : 'Landing Page Layout B';

    const impressionsA = status === 'Running' || status === 'Completed' ? Math.floor(Math.random() * 50000 + 1000) : 0;
    const clicksA = impressionsA > 0 ? Math.floor(impressionsA * (0.01 + Math.random() * 0.05)) : 0;
    const conversionsA = clicksA > 0 ? Math.floor(clicksA * (0.01 + Math.random() * 0.03)) : 0;
    const revenueA = conversionsA * (10 + Math.random() * 100);

    const impressionsB = status === 'Running' || status === 'Completed' ? Math.floor(Math.random() * 50000 + 1000) : 0;
    const clicksB = impressionsB > 0 ? Math.floor(impressionsB * (0.01 + Math.random() * 0.06)) : 0; // Slightly better variant B
    const conversionsB = clicksB > 0 ? Math.floor(clicksB * (0.015 + Math.random() * 0.04)) : 0; // Slightly better variant B
    const revenueB = conversionsB * (10 + Math.random() * 110);

    const variantResults = (status === 'Running' || status === 'Completed') ? [
        {
            variantId: `${id}-A`, impressions: impressionsA, clicks: clicksA, conversions: conversionsA, revenue: parseFloat(revenueA.toFixed(2)),
            ctr: clicksA / impressionsA * 100, conversionRate: conversionsA / clicksA * 100
        },
        {
            variantId: `${id}-B`, impressions: impressionsB, clicks: clicksB, conversions: conversionsB, revenue: parseFloat(revenueB.toFixed(2)),
            ctr: clicksB / impressionsB * 100, conversionRate: conversionsB / clicksB * 100
        },
    ] : [];

    let winningVariantId: string | null = null;
    let confidenceLevel: number | null = null;
    let conclusion: string = 'Test still running or no clear winner.';

    if (status === 'Completed' && variantResults.length === 2) {
        const primaryMetricA = variantResults[0][primaryMetric];
        const primaryMetricB = variantResults[1][primaryMetric];

        if (primaryMetricA > primaryMetricB * 1.05) { // 5% difference for significance
            winningVariantId = `${id}-A`;
            confidenceLevel = 0.95;
            conclusion = `Variant A won by significantly outperforming Variant B in ${primaryMetric}.`;
        } else if (primaryMetricB > primaryMetricA * 1.05) {
            winningVariantId = `${id}-B`;
            confidenceLevel = 0.95;
            conclusion = `Variant B won by significantly outperforming Variant A in ${primaryMetric}.`;
        } else {
            conclusion = `No statistically significant winner found for ${primaryMetric}.`;
        }
    }

    const startDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000);
    const endDate = status === 'Running' ? null : (status === 'Completed' ? new Date(startDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null);

    return {
        id: id,
        name: `A/B Test ${id}`,
        description: `Testing different ${type.replace(/_/g, ' ')} variants to improve ${primaryMetric}.`,
        type: type,
        variants: [
            { id: `${id}-A`, name: 'Variant A', content: variantAContent, trafficShare: 50 },
            { id: `${id}-B`, name: 'Variant B', content: variantBContent, trafficShare: 50 },
        ],
        trafficDistribution: [50, 50],
        primaryMetric: primaryMetric,
        startDate: startDate,
        endDate: endDate,
        status: status,
        results: {
            variantResults: variantResults,
            winningVariantId: winningVariantId,
            confidenceLevel: confidenceLevel,
            conclusion: conclusion,
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        campaignId: `CAM-${Math.floor(Math.random() * 5 + 1)}`,
    };
};

let contactIdCounter = 1;
export const generateDummyContact = (): ContactProfile => {
    const id = `CON-${contactIdCounter++}`;
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];
    const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'London', 'Paris', 'Berlin'];
    const countries = ['USA', 'UK', 'Canada', 'Germany', 'France', 'Australia'];
    const tags = ['prospect', 'customer', 'vip', 'inactive', 'newsletter'];
    const activityTypes = ['email_open', 'website_visit', 'purchase', 'form_submit', 'ad_click'];

    const signUpDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const lastActivityDate = new Date(signUpDate.getTime() + Math.random() * (Date.now() - signUpDate.getTime()));

    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags = Array.from({ length: numTags }).map(() => tags[Math.floor(Math.random() * tags.length)]);
    const uniqueTags = Array.from(new Set(selectedTags));

    const numSegments = Math.floor(Math.random() * 3);
    const segmentIds = Array.from({ length: numSegments }).map(() => `SEG-${Math.floor(Math.random() * 100) + 1}`);

    const purchaseHistory = Math.random() > 0.6 ? Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        orderId: `ORD-${Math.random().toString(36).substring(7)}`,
        date: new Date(lastActivityDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        amount: parseFloat((Math.random() * 500 + 20).toFixed(2)),
        items: [`Product ${Math.floor(Math.random() * 5 + 1)}`],
    })) : [];

    const websiteVisits = Math.random() > 0.5 ? Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(() => ({
        date: new Date(lastActivityDate.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000),
        page: ['/home', '/pricing', '/blog', '/contact', '/product'][Math.floor(Math.random() * 5)],
        duration: Math.floor(Math.random() * 300) + 30, // 30s to 330s
    })) : [];

    return {
        id: id,
        email: `${firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase()}.${lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}${contactIdCounter}@example.com`,
        firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
        phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        city: cities[Math.floor(Math.random() * cities.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        signUpDate: signUpDate,
        tags: uniqueTags,
        segmentIds: segmentIds,
        leadScore: Math.floor(Math.random() * 100),
        lastActivity: {
            date: lastActivityDate,
            type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
            details: `Contact activity on ${lastActivityDate.toDateString()}`,
        },
        purchaseHistory: purchaseHistory,
        websiteVisits: websiteVisits,
    };
};

let notificationIdCounter = 1;
export const generateDummyNotification = (): Notification => {
    const id = `NOT-${notificationIdCounter++}`;
    const types = ['info', 'warning', 'error', 'success'];
    const messages = [
        'Campaign "Summer Sale" started successfully.',
        'Audience segment "High-Value Leads" updated with 50 new contacts.',
        'Workflow "Onboarding Series" paused due to an error.',
        'Email campaign "Product Launch" sent to 10,000 subscribers.',
        'New lead signed up for your newsletter.',
        'Low budget alert: Campaign "Q4 PPC" has less than 10% budget remaining.'
    ];

    return {
        id: id,
        message: messages[Math.floor(Math.random() * messages.length)],
        type: types[Math.floor(Math.random() * types.length)] as any,
        read: Math.random() > 0.7,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        link: Math.random() > 0.5 ? `/app/marketing/campaigns/CAM-${Math.floor(Math.random() * 10)}` : undefined,
    };
};

let auditLogIdCounter = 1;
export const generateDummyAuditLogEntry = (): AuditLogEntry => {
    const id = `AUDIT-${auditLogIdCounter++}`;
    const users = ['user-1', 'user-2', 'user-3'];
    const actions = ['Created', 'Updated', 'Deleted', 'Activated', 'Deactivated', 'Scheduled'];
    const resourceTypes = ['Campaign', 'Segment', 'Workflow', 'Email Template', 'Social Post', 'AB Test'];
    const resourceIds = [`CAM-${Math.floor(Math.random() * 100)}`, `SEG-${Math.floor(Math.random() * 100)}`, `WF-${Math.floor(Math.random() * 10)}`];

    const action = actions[Math.floor(Math.random() * actions.length)];
    const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const resourceId = resourceIds[Math.floor(Math.random() * resourceIds.length)];

    let changes = undefined;
    if (action === 'Updated') {
        changes = {
            oldValue: { status: 'Paused', budget: 1000 },
            newValue: { status: 'Active', budget: 1500 }
        };
    }

    return {
        id: id,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        userId: users[Math.floor(Math.random() * users.length)],
        action: `${action} ${resourceType}`,
        resourceType: resourceType,
        resourceId: resourceId,
        changes: changes,
    };
};

// --- MOCK API FUNCTIONS (to be exported) ---
// Simulate API calls with artificial delays
export const mockApi = {
    getCampaigns: (): Promise<MarketingCampaignDetail[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingCampaigns = Array.isArray(globalThis.mockCampaigns) ? globalThis.mockCampaigns : [];
                if (existingCampaigns.length === 0) {
                    globalThis.mockCampaigns = Array.from({ length: 20 }).map(() => generateDummyCampaign());
                }
                resolve(globalThis.mockCampaigns);
            }, 500);
        });
    },
    getCampaignById: (id: string): Promise<MarketingCampaignDetail | undefined> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(globalThis.mockCampaigns.find((c: MarketingCampaignDetail) => c.campaignId === id));
            }, 300);
        });
    },
    saveCampaign: (campaign: MarketingCampaignDetail): Promise<MarketingCampaignDetail> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockCampaigns.findIndex((c: MarketingCampaignDetail) => c.campaignId === campaign.campaignId);
                if (index > -1) {
                    globalThis.mockCampaigns[index] = { ...globalThis.mockCampaigns[index], ...campaign, lastModified: new Date() };
                } else {
                    const newCampaign = { ...campaign, campaignId: `CAM-${campaignIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
                    globalThis.mockCampaigns.push(newCampaign);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newCampaign);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockCampaigns[index]);
            }, 700);
        });
    },
    deleteCampaign: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockCampaigns.length;
                globalThis.mockCampaigns = globalThis.mockCampaigns.filter((c: MarketingCampaignDetail) => c.campaignId !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockCampaigns.length < initialLength);
            }, 400);
        });
    },

    getSegments: (): Promise<AudienceSegment[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingSegments = Array.isArray(globalThis.mockSegments) ? globalThis.mockSegments : [];
                if (existingSegments.length === 0) {
                    globalThis.mockSegments = Array.from({ length: 10 }).map(() => generateDummySegment());
                }
                resolve(globalThis.mockSegments);
            }, 500);
        });
    },
    saveSegment: (segment: AudienceSegment): Promise<AudienceSegment> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockSegments.findIndex((s: AudienceSegment) => s.id === segment.id);
                if (index > -1) {
                    globalThis.mockSegments[index] = { ...globalThis.mockSegments[index], ...segment, lastModified: new Date() };
                } else {
                    const newSegment = { ...segment, id: `SEG-${segmentIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
                    globalThis.mockSegments.push(newSegment);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newSegment);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockSegments[index]);
            }, 700);
        });
    },
    deleteSegment: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockSegments.length;
                globalThis.mockSegments = globalThis.mockSegments.filter((s: AudienceSegment) => s.id !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockSegments.length < initialLength);
            }, 400);
        });
    },

    getWorkflows: (): Promise<MarketingWorkflow[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingWorkflows = Array.isArray(globalThis.mockWorkflows) ? globalThis.mockWorkflows : [];
                if (existingWorkflows.length === 0) {
                    globalThis.mockWorkflows = Array.from({ length: 5 }).map(() => generateDummyWorkflow());
                }
                resolve(globalThis.mockWorkflows);
            }, 500);
        });
    },
    saveWorkflow: (workflow: MarketingWorkflow): Promise<MarketingWorkflow> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockWorkflows.findIndex((w: MarketingWorkflow) => w.id === workflow.id);
                if (index > -1) {
                    globalThis.mockWorkflows[index] = { ...globalThis.mockWorkflows[index], ...workflow, lastModified: new Date() };
                } else {
                    const newWorkflow = { ...workflow, id: `WF-${workflowIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
                    globalThis.mockWorkflows.push(newWorkflow);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newWorkflow);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockWorkflows[index]);
            }, 700);
        });
    },
    deleteWorkflow: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockWorkflows.length;
                globalThis.mockWorkflows = globalThis.mockWorkflows.filter((w: MarketingWorkflow) => w.id !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockWorkflows.length < initialLength);
            }, 400);
        });
    },

    getEmailTemplates: (): Promise<EmailTemplate[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingTemplates = Array.isArray(globalThis.mockEmailTemplates) ? globalThis.mockEmailTemplates : [];
                if (existingTemplates.length === 0) {
                    globalThis.mockEmailTemplates = Array.from({ length: 15 }).map(() => generateDummyEmailTemplate());
                }
                resolve(globalThis.mockEmailTemplates);
            }, 500);
        });
    },
    getEmailCampaigns: (): Promise<EmailCampaign[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingEmailCampaigns = Array.isArray(globalThis.mockEmailCampaigns) ? globalThis.mockEmailCampaigns : [];
                if (existingEmailCampaigns.length === 0 && globalThis.mockEmailTemplates && globalThis.mockSegments) {
                    globalThis.mockEmailCampaigns = Array.from({ length: 10 }).map(() => generateDummyEmailCampaign(
                        globalThis.mockEmailTemplates[Math.floor(Math.random() * globalThis.mockEmailTemplates.length)].id,
                        globalThis.mockSegments[Math.floor(Math.random() * globalThis.mockSegments.length)].id
                    ));
                }
                resolve(globalThis.mockEmailCampaigns);
            }, 500);
        });
    },
    saveEmailCampaign: (campaign: EmailCampaign): Promise<EmailCampaign> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockEmailCampaigns.findIndex((c: EmailCampaign) => c.id === campaign.id);
                if (index > -1) {
                    globalThis.mockEmailCampaigns[index] = { ...globalThis.mockEmailCampaigns[index], ...campaign, lastModified: new Date() };
                } else {
                    const newCampaign = { ...campaign, id: `EMC-${emailCampaignIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
                    globalThis.mockEmailCampaigns.push(newCampaign);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newCampaign);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockEmailCampaigns[index]);
            }, 700);
        });
    },
    deleteEmailCampaign: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockEmailCampaigns.length;
                globalThis.mockEmailCampaigns = globalThis.mockEmailCampaigns.filter((c: EmailCampaign) => c.id !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockEmailCampaigns.length < initialLength);
            }, 400);
        });
    },

    getSocialPosts: (): Promise<SocialPost[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingPosts = Array.isArray(globalThis.mockSocialPosts) ? globalThis.mockSocialPosts : [];
                if (existingPosts.length === 0) {
                    globalThis.mockSocialPosts = Array.from({ length: 25 }).map(() => generateDummySocialPost());
                }
                resolve(globalThis.mockSocialPosts);
            }, 500);
        });
    },
    saveSocialPost: (post: SocialPost): Promise<SocialPost> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockSocialPosts.findIndex((p: SocialPost) => p.id === post.id);
                if (index > -1) {
                    globalThis.mockSocialPosts[index] = { ...globalThis.mockSocialPosts[index], ...post, lastModified: new Date() };
                } else {
                    const newPost = { ...post, id: `SP-${socialPostIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
                    globalThis.mockSocialPosts.push(newPost);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newPost);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockSocialPosts[index]);
            }, 700);
        });
    },
    deleteSocialPost: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockSocialPosts.length;
                globalThis.mockSocialPosts = globalThis.mockSocialPosts.filter((p: SocialPost) => p.id !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockSocialPosts.length < initialLength);
            }, 400);
        });
    },

    getABTests: (): Promise<ABTest[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingTests = Array.isArray(globalThis.mockABTests) ? globalThis.mockABTests : [];
                if (existingTests.length === 0) {
                    globalThis.mockABTests = Array.from({ length: 8 }).map(() => generateDummyABTest());
                }
                resolve(globalThis.mockABTests);
            }, 500);
        });
    },
    saveABTest: (test: ABTest): Promise<ABTest> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockABTests.findIndex((t: ABTest) => t.id === test.id);
                if (index > -1) {
                    globalThis.mockABTests[index] = { ...globalThis.mockABTests[index], ...test, lastModified: new Date() };
                } else {
                    const newTest = { ...test, id: `ABT-${abTestIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
                    globalThis.mockABTests.push(newTest);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newTest);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockABTests[index]);
            }, 700);
        });
    },
    deleteABTest: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockABTests.length;
                globalThis.mockABTests = globalThis.mockABTests.filter((t: ABTest) => t.id !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockABTests.length < initialLength);
            }, 400);
        });
    },

    getContacts: (): Promise<ContactProfile[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingContacts = Array.isArray(globalThis.mockContacts) ? globalThis.mockContacts : [];
                if (existingContacts.length === 0) {
                    globalThis.mockContacts = Array.from({ length: 50 }).map(() => generateDummyContact());
                }
                resolve(globalThis.mockContacts);
            }, 500);
        });
    },
    saveContact: (contact: ContactProfile): Promise<ContactProfile> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = globalThis.mockContacts.findIndex((c: ContactProfile) => c.id === contact.id);
                if (index > -1) {
                    globalThis.mockContacts[index] = { ...globalThis.mockContacts[index], ...contact };
                } else {
                    const newContact = { ...contact, id: `CON-${contactIdCounter++}`, signUpDate: new Date(), tags: [], leadScore: 0 };
                    globalThis.mockContacts.push(newContact);
                    globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                    resolve(newContact);
                    return;
                }
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockContacts[index]);
            }, 700);
        });
    },
    deleteContact: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = globalThis.mockContacts.length;
                globalThis.mockContacts = globalThis.mockContacts.filter((c: ContactProfile) => c.id !== id);
                globalThis.mockAuditLogs.push(generateDummyAuditLogEntry()); // Add audit log
                resolve(globalThis.mockContacts.length < initialLength);
            }, 400);
        });
    },

    getNotifications: (): Promise<Notification[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingNotifications = Array.isArray(globalThis.mockNotifications) ? globalThis.mockNotifications : [];
                if (existingNotifications.length === 0) {
                    globalThis.mockNotifications = Array.from({ length: 15 }).map(() => generateDummyNotification());
                }
                resolve(globalThis.mockNotifications);
            }, 300);
        });
    },
    markNotificationAsRead: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const notification = globalThis.mockNotifications.find((n: Notification) => n.id === id);
                if (notification) {
                    notification.read = true;
                    resolve(true);
                }
                resolve(false);
            }, 100);
        });
    },

    getAuditLogs: (): Promise<AuditLogEntry[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const existingLogs = Array.isArray(globalThis.mockAuditLogs) ? globalThis.mockAuditLogs : [];
                if (existingLogs.length === 0) {
                    globalThis.mockAuditLogs = Array.from({ length: 30 }).map(() => generateDummyAuditLogEntry());
                }
                resolve(globalThis.mockAuditLogs.sort((a: AuditLogEntry, b: AuditLogEntry) => b.timestamp.getTime() - a.timestamp.getTime()));
            }, 500);
        });
    },
};

// Ensure mock data exists globally once
if (typeof globalThis !== 'undefined') {
    if (!globalThis.mockCampaigns) globalThis.mockCampaigns = Array.from({ length: 20 }).map(() => generateDummyCampaign());
    if (!globalThis.mockSegments) globalThis.mockSegments = Array.from({ length: 10 }).map(() => generateDummySegment());
    if (!globalThis.mockWorkflows) globalThis.mockWorkflows = Array.from({ length: 5 }).map(() => generateDummyWorkflow());
    if (!globalThis.mockEmailTemplates) globalThis.mockEmailTemplates = Array.from({ length: 15 }).map(() => generateDummyEmailTemplate());
    if (!globalThis.mockEmailCampaigns && globalThis.mockEmailTemplates && globalThis.mockSegments) globalThis.mockEmailCampaigns = Array.from({ length: 10 }).map(() => generateDummyEmailCampaign(
        globalThis.mockEmailTemplates[Math.floor(Math.random() * globalThis.mockEmailTemplates.length)].id,
        globalThis.mockSegments[Math.floor(Math.random() * globalThis.mockSegments.length)].id
    ));
    if (!globalThis.mockSocialPosts) globalThis.mockSocialPosts = Array.from({ length: 25 }).map(() => generateDummySocialPost());
    if (!globalThis.mockABTests) globalThis.mockABTests = Array.from({ length: 8 }).map(() => generateDummyABTest());
    if (!globalThis.mockContacts) globalThis.mockContacts = Array.from({ length: 50 }).map(() => generateDummyContact());
    if (!globalThis.mockNotifications) globalThis.mockNotifications = Array.from({ length: 15 }).map(() => generateDummyNotification());
    if (!globalThis.mockAuditLogs) globalThis.mockAuditLogs = Array.from({ length: 30 }).map(() => generateDummyAuditLogEntry());
}

// Global state for a complex application should ideally use a state management library
// For the purpose of this exercise and staying within one file, we'll use React Context API.
export interface MarketingAutomationContextType {
    campaigns: MarketingCampaignDetail[];
    segments: AudienceSegment[];
    workflows: MarketingWorkflow[];
    emailTemplates: EmailTemplate[];
    emailCampaigns: EmailCampaign[];
    socialPosts: SocialPost[];
    abTests: ABTest[];
    contacts: ContactProfile[];
    notifications: Notification[];
    auditLogs: AuditLogEntry[];
    loadingState: {
        campaigns: boolean; segments: boolean; workflows: boolean;
        emailTemplates: boolean; emailCampaigns: boolean; socialPosts: boolean;
        abTests: boolean; contacts: boolean; notifications: boolean; auditLogs: boolean;
    };
    fetchCampaigns: () => Promise<void>;
    addOrUpdateCampaign: (campaign: MarketingCampaignDetail) => Promise<void>;
    deleteCampaign: (id: string) => Promise<void>;
    fetchSegments: () => Promise<void>;
    addOrUpdateSegment: (segment: AudienceSegment) => Promise<void>;
    deleteSegment: (id: string) => Promise<void>;
    fetchWorkflows: () => Promise<void>;
    addOrUpdateWorkflow: (workflow: MarketingWorkflow) => Promise<void>;
    deleteWorkflow: (id: string) => Promise<void>;
    fetchEmailTemplates: () => Promise<void>;
    fetchEmailCampaigns: () => Promise<void>;
    addOrUpdateEmailCampaign: (campaign: EmailCampaign) => Promise<void>;
    deleteEmailCampaign: (id: string) => Promise<void>;
    fetchSocialPosts: () => Promise<void>;
    addOrUpdateSocialPost: (post: SocialPost) => Promise<void>;
    deleteSocialPost: (id: string) => Promise<void>;
    fetchABTests: () => Promise<void>;
    addOrUpdateABTest: (test: ABTest) => Promise<void>;
    deleteABTest: (id: string) => Promise<void>;
    fetchContacts: () => Promise<void>;
    addOrUpdateContact: (contact: ContactProfile) => Promise<void>;
    deleteContact: (id: string) => Promise<void>;
    fetchNotifications: () => Promise<void>;
    markNotificationAsRead: (id: string) => Promise<void>;
    fetchAuditLogs: () => Promise<void>;
    getCampaignById: (id: string) => MarketingCampaignDetail | undefined;
    getSegmentById: (id: string) => AudienceSegment | undefined;
}

export const MarketingAutomationInternalContext = createContext<MarketingAutomationContextType | undefined>(undefined);

export const MarketingAutomationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [campaigns, setCampaigns] = useState<MarketingCampaignDetail[]>([]);
    const [segments, setSegments] = useState<AudienceSegment[]>([]);
    const [workflows, setWorkflows] = useState<MarketingWorkflow[]>([]);
    const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
    const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
    const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
    const [abTests, setABTests] = useState<ABTest[]>([]);
    const [contacts, setContacts] = useState<ContactProfile[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [loadingState, setLoadingState] = useState({
        campaigns: true, segments: true, workflows: true,
        emailTemplates: true, emailCampaigns: true, socialPosts: true,
        abTests: true, contacts: true, notifications: true, auditLogs: true,
    });

    const safeAsyncWrapper = useCallback(async <T>(
        loaderKey: keyof typeof loadingState,
        apiCall: () => Promise<T>,
        setter: React.Dispatch<React.SetStateAction<T>>,
        onSuccess?: (data: T) => void
    ) => {
        setLoadingState(prev => ({ ...prev, [loaderKey]: true }));
        try {
            const data = await apiCall();
            setter(data);
            if (onSuccess) onSuccess(data);
        } catch (error) {
            console.error(`Failed to fetch ${loaderKey}:`, error);
        } finally {
            setLoadingState(prev => ({ ...prev, [loaderKey]: false }));
        }
    }, []);

    // Fetchers
    const fetchCampaigns = useCallback(() => safeAsyncWrapper('campaigns', mockApi.getCampaigns, setCampaigns), [safeAsyncWrapper]);
    const fetchSegments = useCallback(() => safeAsyncWrapper('segments', mockApi.getSegments, setSegments), [safeAsyncWrapper]);
    const fetchWorkflows = useCallback(() => safeAsyncWrapper('workflows', mockApi.getWorkflows, setWorkflows), [safeAsyncWrapper]);
    const fetchEmailTemplates = useCallback(() => safeAsyncWrapper('emailTemplates', mockApi.getEmailTemplates, setEmailTemplates), [safeAsyncWrapper]);
    const fetchEmailCampaigns = useCallback(() => safeAsyncWrapper('emailCampaigns', mockApi.getEmailCampaigns, setEmailCampaigns), [safeAsyncWrapper]);
    const fetchSocialPosts = useCallback(() => safeAsyncWrapper('socialPosts', mockApi.getSocialPosts, setSocialPosts), [safeAsyncWrapper]);
    const fetchABTests = useCallback(() => safeAsyncWrapper('abTests', mockApi.getABTests, setABTests), [safeAsyncWrapper]);
    const fetchContacts = useCallback(() => safeAsyncWrapper('contacts', mockApi.getContacts, setContacts), [safeAsyncWrapper]);
    const fetchNotifications = useCallback(() => safeAsyncWrapper('notifications', mockApi.getNotifications, setNotifications), [safeAsyncWrapper]);
    const fetchAuditLogs = useCallback(() => safeAsyncWrapper('auditLogs', mockApi.getAuditLogs, setAuditLogs), [safeAsyncWrapper]);

    // Add/Update/Delete functions
    const addOrUpdateGeneric = useCallback(async <T extends { id: string }>(
        apiCall: (item: T) => Promise<T>,
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        item: T,
        resourceType: string,
        idKey: keyof T = 'id' as keyof T
    ) => {
        try {
            const updatedItem = await apiCall(item);
            setter(prev => {
                const index = prev.findIndex(i => i[idKey] === updatedItem[idKey]);
                if (index > -1) {
                    return [...prev.slice(0, index), updatedItem, ...prev.slice(index + 1)];
                } else {
                    return [...prev, updatedItem];
                }
            });
            fetchAuditLogs(); // Refresh audit logs on data change
            return updatedItem;
        } catch (error) {
            console.error(`Failed to save ${resourceType}:`, error);
            throw error;
        }
    }, [fetchAuditLogs]);

    const deleteGeneric = useCallback(async (
        apiCall: (id: string) => Promise<boolean>,
        setter: React.Dispatch<React.SetStateAction<any[]>>,
        id: string,
        resourceType: string,
        idKey: string = 'id'
    ) => {
        try {
            const success = await apiCall(id);
            if (success) {
                setter(prev => prev.filter(item => item[idKey] !== id));
                fetchAuditLogs(); // Refresh audit logs on data change
            }
            return success;
        } catch (error) {
            console.error(`Failed to delete ${resourceType}:`, error);
            throw error;
        }
    }, [fetchAuditLogs]);

    const addOrUpdateCampaign = useCallback((campaign: MarketingCampaignDetail) => addOrUpdateGeneric(mockApi.saveCampaign, setCampaigns, campaign, 'campaign', 'campaignId'), [addOrUpdateGeneric]);
    const deleteCampaign = useCallback((id: string) => deleteGeneric(mockApi.deleteCampaign, setCampaigns, id, 'campaign', 'campaignId'), [deleteGeneric]);

    const addOrUpdateSegment = useCallback((segment: AudienceSegment) => addOrUpdateGeneric(mockApi.saveSegment, setSegments, segment, 'segment'), [addOrUpdateGeneric]);
    const deleteSegment = useCallback((id: string) => deleteGeneric(mockApi.deleteSegment, setSegments, id, 'segment'), [deleteGeneric]);

    const addOrUpdateWorkflow = useCallback((workflow: MarketingWorkflow) => addOrUpdateGeneric(mockApi.saveWorkflow, setWorkflows, workflow, 'workflow'), [addOrUpdateGeneric]);
    const deleteWorkflow = useCallback((id: string) => deleteGeneric(mockApi.deleteWorkflow, setWorkflows, id, 'workflow'), [deleteGeneric]);

    const addOrUpdateEmailCampaign = useCallback((campaign: EmailCampaign) => addOrUpdateGeneric(mockApi.saveEmailCampaign, setEmailCampaigns, campaign, 'email campaign'), [addOrUpdateGeneric]);
    const deleteEmailCampaign = useCallback((id: string) => deleteGeneric(mockApi.deleteEmailCampaign, setEmailCampaigns, id, 'email campaign'), [deleteGeneric]);

    const addOrUpdateSocialPost = useCallback((post: SocialPost) => addOrUpdateGeneric(mockApi.saveSocialPost, setSocialPosts, post, 'social post'), [addOrUpdateGeneric]);
    const deleteSocialPost = useCallback((id: string) => deleteGeneric(mockApi.deleteSocialPost, setSocialPosts, id, 'social post'), [deleteGeneric]);

    const addOrUpdateABTest = useCallback((test: ABTest) => addOrUpdateGeneric(mockApi.saveABTest, setABTests, test, 'A/B test'), [addOrUpdateGeneric]);
    const deleteABTest = useCallback((id: string) => deleteGeneric(mockApi.deleteABTest, setABTests, id, 'A/B test'), [deleteGeneric]);

    const addOrUpdateContact = useCallback((contact: ContactProfile) => addOrUpdateGeneric(mockApi.saveContact, setContacts, contact, 'contact'), [addOrUpdateGeneric]);
    const deleteContact = useCallback((id: string) => deleteGeneric(mockApi.deleteContact, setContacts, id, 'contact'), [deleteGeneric]);

    const markNotificationAsRead = useCallback(async (id: string) => {
        try {
            const success = await mockApi.markNotificationAsRead(id);
            if (success) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    // Getters for specific items
    const getCampaignById = useCallback((id: string) => campaigns.find(c => c.campaignId === id), [campaigns]);
    const getSegmentById = useCallback((id: string) => segments.find(s => s.id === id), [segments]);

    useEffect(() => {
        fetchCampaigns();
        fetchSegments();
        fetchWorkflows();
        fetchEmailTemplates();
        fetchEmailCampaigns();
        fetchSocialPosts();
        fetchABTests();
        fetchContacts();
        fetchNotifications();
        fetchAuditLogs();
    }, [fetchCampaigns, fetchSegments, fetchWorkflows, fetchEmailTemplates, fetchEmailCampaigns, fetchSocialPosts, fetchABTests, fetchContacts, fetchNotifications, fetchAuditLogs]);


    const contextValue = useMemo(() => ({
        campaigns, segments, workflows, emailTemplates, emailCampaigns, socialPosts, abTests, contacts, notifications, auditLogs, loadingState,
        fetchCampaigns, addOrUpdateCampaign, deleteCampaign,
        fetchSegments, addOrUpdateSegment, deleteSegment,
        fetchWorkflows, addOrUpdateWorkflow, deleteWorkflow,
        fetchEmailTemplates, fetchEmailCampaigns, addOrUpdateEmailCampaign, deleteEmailCampaign,
        fetchSocialPosts, addOrUpdateSocialPost, deleteSocialPost,
        fetchABTests, addOrUpdateABTest, deleteABTest,
        fetchContacts, addOrUpdateContact, deleteContact,
        fetchNotifications, markNotificationAsRead,
        fetchAuditLogs,
        getCampaignById, getSegmentById,
    }), [
        campaigns, segments, workflows, emailTemplates, emailCampaigns, socialPosts, abTests, contacts, notifications, auditLogs, loadingState,
        fetchCampaigns, addOrUpdateCampaign, deleteCampaign,
        fetchSegments, addOrUpdateSegment, deleteSegment,
        fetchWorkflows, addOrUpdateWorkflow, deleteWorkflow,
        fetchEmailTemplates, fetchEmailCampaigns, addOrUpdateEmailCampaign, deleteEmailCampaign,
        fetchSocialPosts, addOrUpdateSocialPost, deleteSocialPost,
        fetchABTests, addOrUpdateABTest, deleteABTest,
        fetchContacts, addOrUpdateContact, deleteContact,
        fetchNotifications, markNotificationAsRead,
        fetchAuditLogs,
        getCampaignById, getSegmentById,
    ]);

    return (
        <MarketingAutomationInternalContext.Provider value={contextValue}>
            {children}
        </MarketingAutomationInternalContext.Provider>
    );
};

export const useMarketingAutomation = () => {
    const context = useContext(MarketingAutomationInternalContext);
    if (context === undefined) {
        throw new Error('useMarketingAutomation must be used within a MarketingAutomationProvider');
    }
    return context;
};

// --- COMMON UI COMPONENTS (exported for potential reuse, but defined here for line count) ---

/**
 * @function ExportedModal
 * @description Generic modal component.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Modal content.
 * @param {string} props.title - Modal title.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {() => void} props.onClose - Callback when modal is closed.
 */
export const ExportedModal: React.FC<{ children: React.ReactNode; title: string; isOpen: boolean; onClose: () => void; className?: string }> = ({ children, title, isOpen, onClose, className = '' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * @function ExportedTable
 * @description Generic table component with sorting and pagination.
 * @param {object} props - Component props.
 * @param {Array<object>} props.data - Array of data objects.
 * @param {Array<{key: string, label: string, render?: (item: any) => React.ReactNode}>} props.columns - Column definitions.
 * @param {string} [props.keyField='id'] - Key field for unique row identification.
 * @param {object} [props.pagination] - Pagination object.
 * @param {(page: number) => void} [props.onPageChange] - Callback for page change.
 * @param {(sortKey: string) => void} [props.onSort] - Callback for sort.
 * @param {string} [props.currentSortKey] - Current sort key.
 * @param {string} [props.sortDirection] - Current sort direction ('asc' | 'desc').
 */
export const ExportedTable: React.FC<{
    data: any[];
    columns: { key: string; label: string; render?: (item: any) => React.ReactNode; sortable?: boolean }[];
    keyField?: string;
    pagination?: Pagination;
    onPageChange?: (page: number) => void;
    onSort?: (sortKey: string) => void;
    currentSortKey?: string;
    sortDirection?: 'asc' | 'desc';
    isLoading?: boolean;
}> = ({ data, columns, keyField = 'id', pagination, onPageChange, onSort, currentSortKey, sortDirection, isLoading }) => {
    const pageControls = pagination ? generatePaginationControls(pagination) : [];

    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
            )}
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} scope="col" className="py-3 px-6">
                                {col.sortable ? (
                                    <button onClick={() => onSort && onSort(col.key)} className="flex items-center space-x-1">
                                        <span>{col.label}</span>
                                        {currentSortKey === col.key && (
                                            <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                                        )}
                                    </button>
                                ) : (
                                    col.label
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr className="bg-gray-800 border-b border-gray-700">
                            <td colSpan={columns.length} className="py-4 px-6 text-center text-gray-500">No data available</td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item[keyField] || index} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                                {columns.map(col => (
                                    <td key={col.key} className="py-4 px-6">
                                        {col.render ? col.render(item) : item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {pagination && onPageChange && (
                <nav className="flex justify-between items-center pt-4 bg-gray-800 p-4">
                    <span className="text-sm text-gray-400">
                        Showing <span className="font-semibold text-white">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to <span className="font-semibold text-white">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}</span> of <span className="font-semibold text-white">{pagination.totalItems}</span> entries
                    </span>
                    <ul className="inline-flex items-center -space-x-px">
                        <li>
                            <button
                                onClick={() => onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="block py-2 px-3 ml-0 leading-tight bg-gray-800 border border-gray-700 text-gray-400 rounded-l-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            </button>
                        </li>
                        {pageControls.map((page, index) => (
                            <li key={index}>
                                {typeof page === 'number' ? (
                                    <button
                                        onClick={() => onPageChange(page)}
                                        className={`py-2 px-3 leading-tight ${page === pagination.currentPage ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-400'} border border-gray-700 hover:bg-gray-700 hover:text-white`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span className="py-2 px-3 leading-tight bg-gray-800 border border-gray-700 text-gray-400">...</span>
                                )}
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={() => onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="block py-2 px-3 leading-tight bg-gray-800 border border-gray-700 text-gray-400 rounded-r-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="sr-only">Next</span>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

// --- CAMPAIGN MANAGEMENT FEATURES (to be exported) ---

/**
 * @function ExportedCampaignForm
 * @description Form for creating and editing marketing campaigns.
 */
export const ExportedCampaignForm: React.FC<{
    campaign?: MarketingCampaignDetail;
    onSave: (campaign: MarketingCampaignDetail) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ campaign, onSave, onCancel, isLoading }) => {
    const { segments, getSegmentById } = useMarketingAutomation();
    const [formData, setFormData] = useState<MarketingCampaignDetail>(
        campaign || {
            campaignId: '', name: '', description: '', channel: 'PPC', objective: 'Lead Generation',
            startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), budget: 0, cost: 0, revenueGenerated: 0,
            audienceSegments: [], adCreatives: [], status: 'Planned', analytics: { impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpa: 0, roi: 0 },
        }
    );

    useEffect(() => {
        if (campaign) setFormData(campaign);
    }, [campaign]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (type === 'number' || name === 'budget') ? parseFloat(value) || 0 : value,
        }));
    };

    const handleDateChange = (name: 'startDate' | 'endDate', dateString: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: new Date(dateString),
        }));
    };

    const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
        setFormData(prev => ({
            ...prev,
            audienceSegments: selectedOptions,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Campaign Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Channel</label>
                    <select name="channel" value={formData.channel} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="PPC">PPC</option>
                        <option value="Email">Email</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Content Marketing">Content Marketing</option>
                        <option value="SEO">SEO</option>
                        <option value="Affiliate">Affiliate</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Objective</label>
                    <select name="objective" value={formData.objective} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="Lead Generation">Lead Generation</option>
                        <option value="Brand Awareness">Brand Awareness</option>
                        <option value="Sales">Sales</option>
                        <option value="Customer Retention">Customer Retention</option>
                        <option value="Engagement">Engagement</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate.toISOString().split('T')[0]} onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate.toISOString().split('T')[0]} onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Budget ($)</label>
                <input type="number" name="budget" value={formData.budget} onChange={handleChange} required step="0.01"
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Target Audience Segments</label>
                <select multiple name="audienceSegments" value={formData.audienceSegments} onChange={handleSegmentChange}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500 h-24">
                    {segments.map(segment => (
                        <option key={segment.id} value={segment.id}>{segment.name} (Est. Size: {segment.estimatedSize.toLocaleString()})</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="Planned">Planned</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Saving...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
                </button>
            </div>
        </form>
    );
};

/**
 * @function ExportedCampaignList
 * @description Displays a list of marketing campaigns with CRUD actions.
 */
export const ExportedCampaignList: React.FC = () => {
    const { campaigns, loadingState, addOrUpdateCampaign, deleteCampaign, getSegmentById } = useMarketingAutomation();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaignDetail | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedCampaigns = useMemo(() => {
        let sorted = [...campaigns];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof MarketingCampaignDetail];
                const bVal = b[sortKey as keyof MarketingCampaignDetail];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return sorted;
    }, [campaigns, sortKey, sortDirection, searchTerm]);

    const paginatedCampaigns = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedCampaigns.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedCampaigns, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedCampaigns.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedCampaigns.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddCampaign = () => {
        setSelectedCampaign(undefined);
        setFormModalOpen(true);
    };

    const handleEditCampaign = (campaign: MarketingCampaignDetail) => {
        setSelectedCampaign(campaign);
        setFormModalOpen(true);
    };

    const handleSaveCampaign = async (campaignData: MarketingCampaignDetail) => {
        setIsSaving(true);
        try {
            await addOrUpdateCampaign(campaignData);
            setFormModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            await deleteCampaign(id);
        }
    };

    const campaignColumns = useMemo(() => [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'channel', label: 'Channel', sortable: true },
        { key: 'budget', label: 'Budget', sortable: true, render: (c: MarketingCampaignDetail) => formatCurrency(c.budget, 'USD') },
        { key: 'revenueGenerated', label: 'Revenue', sortable: true, render: (c: MarketingCampaignDetail) => formatCurrency(c.revenueGenerated, 'USD') },
        { key: 'startDate', label: 'Start Date', sortable: true, render: (c: MarketingCampaignDetail) => formatDate(c.startDate).split(',')[0] },
        { key: 'endDate', label: 'End Date', sortable: true, render: (c: MarketingCampaignDetail) => formatDate(c.endDate).split(',')[0] },
        {
            key: 'audienceSegments',
            label: 'Segments',
            render: (c: MarketingCampaignDetail) => c.audienceSegments.map(segId => getSegmentById(segId)?.name || 'N/A').join(', ')
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (c: MarketingCampaignDetail) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditCampaign(c)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    <button onClick={() => handleDeleteCampaign(c.campaignId)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], [getSegmentById]);

    return (
        <Card title="Campaign Management">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddCampaign} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Add New Campaign</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedCampaigns}
                columns={campaignColumns}
                keyField="campaignId"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.campaigns}
            />

            <ExportedModal
                title={selectedCampaign ? "Edit Campaign" : "Create New Campaign"}
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                className="max-w-3xl"
            >
                <ExportedCampaignForm
                    campaign={selectedCampaign}
                    onSave={handleSaveCampaign}
                    onCancel={() => setFormModalOpen(false)}
                    isLoading={isSaving}
                />
            </ExportedModal>
        </Card>
    );
};


/**
 * @function ExportedCampaignAnalytics
 * @description Displays detailed analytics for a selected campaign.
 */
export const ExportedCampaignAnalytics: React.FC<{ campaignId: string }> = ({ campaignId }) => {
    const { getCampaignById, loadingState } = useMarketingAutomation();
    const campaign = useMemo(() => getCampaignById(campaignId), [campaignId, getCampaignById]);

    if (loadingState.campaigns) {
        return <Card title="Campaign Analytics"><div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 inline-block"></div><p className="text-gray-400 mt-2">Loading campaign data...</p></div></Card>;
    }

    if (!campaign) {
        return <Card title="Campaign Analytics"><p className="text-red-400">Campaign not found.</p></Card>;
    }

    const { analytics, cost, revenueGenerated, budget } = campaign;
    const kpiData = [
        { name: 'Impressions', value: analytics.impressions, color: '#8884d8' },
        { name: 'Clicks', value: analytics.clicks, color: '#82ca9d' },
        { name: 'Conversions', value: analytics.conversions, color: '#ffc658' },
    ];

    const financialData = [
        { name: 'Budget', value: budget, fill: '#8884d8' },
        { name: 'Cost', value: cost, fill: '#ef4444' },
        { name: 'Revenue', value: revenueGenerated, fill: '#82ca9d' },
    ];

    const performanceMetrics = [
        { label: 'CTR', value: `${analytics.ctr.toFixed(2)}%`, description: 'Click-Through Rate' },
        { label: 'ROAS', value: `${analytics.roi.toFixed(1)}x`, description: 'Return on Ad Spend' },
        { label: 'CPA', value: formatCurrency(analytics.cpa), description: 'Cost Per Acquisition' },
    ];

    return (
        <Card title={`Analytics for: ${campaign.name}`}>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {performanceMetrics.map((metric, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg flex flex-col items-center">
                            <p className="text-xl font-bold text-white">{metric.value}</p>
                            <p className="text-sm text-gray-400 mt-1">{metric.label} <span className="text-xs">({metric.description})</span></p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Engagement Overview">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={kpiData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                                <Bar dataKey="value">
                                    {kpiData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Financial Performance">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={financialData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" formatter={(value) => formatCurrency(value, '')} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(value: number) => formatCurrency(value)} />
                                <Bar dataKey="value" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

// --- AUDIENCE SEGMENTATION FEATURES (to be exported) ---

/**
 * @function ExportedSegmentRuleBuilder
 * @description Component to build rules for an audience segment.
 */
export const ExportedSegmentRuleBuilder: React.FC<{
    rules: { field: string; operator: string; value: any }[];
    onChange: (rules: { field: string; operator: string; value: any }[]) => void;
}> = ({ rules, onChange }) => {
    const availableFields = [
        { id: 'emailOpens', name: 'Email Opens', type: 'number' },
        { id: 'purchaseHistory', name: 'Purchase History', type: 'boolean' },
        { id: 'lastActivity', name: 'Last Activity Type', type: 'string' },
        { id: 'leadScore', name: 'Lead Score', type: 'number' },
        { id: 'city', name: 'City', type: 'string' },
        { id: 'country', name: 'Country', type: 'string' },
        { id: 'tags', name: 'Tags', type: 'string-array' },
    ];

    const getOperatorsForFieldType = (type: string) => {
        switch (type) {
            case 'number': return ['equals', 'greaterThan', 'lessThan', 'between'];
            case 'boolean': return ['is'];
            case 'string': return ['equals', 'contains', 'startsWith', 'endsWith', 'notEquals'];
            case 'string-array': return ['containsAny', 'containsAll'];
            default: return ['equals'];
        }
    };

    const handleRuleChange = (index: number, key: string, value: any) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [key]: value };

        // Reset operator/value if field type changes
        if (key === 'field') {
            const field = availableFields.find(f => f.id === value);
            if (field) {
                newRules[index].operator = getOperatorsForFieldType(field.type)[0];
                newRules[index].value = ''; // Reset value
            }
        }
        onChange(newRules);
    };

    const addRule = () => {
        onChange([...rules, { field: availableFields[0].id, operator: getOperatorsForFieldType(availableFields[0].type)[0], value: '' }]);
    };

    const removeRule = (index: number) => {
        onChange(rules.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {rules.map((rule, index) => {
                const selectedField = availableFields.find(f => f.id === rule.field);
                const fieldType = selectedField?.type || 'string';
                const operators = getOperatorsForFieldType(fieldType);

                return (
                    <div key={index} className="flex flex-wrap items-center gap-2 p-3 bg-gray-700/50 rounded-md">
                        <select
                            value={rule.field}
                            onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
                            className="bg-gray-700 p-2 rounded-md border border-gray-600 text-white"
                        >
                            {availableFields.map(field => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                        </select>
                        <select
                            value={rule.operator}
                            onChange={(e) => handleRuleChange(index, 'operator', e.target.value)}
                            className="bg-gray-700 p-2 rounded-md border border-gray-600 text-white"
                        >
                            {operators.map(op => (
                                <option key={op} value={op}>{op}</option>
                            ))}
                        </select>
                        {(fieldType === 'string' || fieldType === 'string-array') && (
                            <input
                                type="text"
                                value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value}
                                onChange={(e) => handleRuleChange(index, 'value', fieldType === 'string-array' ? e.target.value.split(',').map(s => s.trim()) : e.target.value)}
                                placeholder={fieldType === 'string-array' ? 'Comma separated values' : 'Value'}
                                className="bg-gray-700 p-2 rounded-md border border-gray-600 text-white flex-grow"
                            />
                        )}
                        {fieldType === 'number' && (
                            <input
                                type="number"
                                value={rule.value}
                                onChange={(e) => handleRuleChange(index, 'value', parseFloat(e.target.value))}
                                className="bg-gray-700 p-2 rounded-md border border-gray-600 text-white"
                            />
                        )}
                        {fieldType === 'boolean' && (
                            <select
                                value={rule.value ? 'true' : 'false'}
                                onChange={(e) => handleRuleChange(index, 'value', e.target.value === 'true')}
                                className="bg-gray-700 p-2 rounded-md border border-gray-600 text-white"
                            >
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        )}
                        <button onClick={() => removeRule(index)} className="text-red-400 hover:text-red-300 ml-2">
                            <IconDelete />
                        </button>
                    </div>
                );
            })}
            <button onClick={addRule} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md text-sm flex items-center space-x-1">
                <IconPlus /> <span>Add Rule</span>
            </button>
        </div>
    );
};

/**
 * @function ExportedAudienceSegmentForm
 * @description Form for creating and editing audience segments.
 */
export const ExportedAudienceSegmentForm: React.FC<{
    segment?: AudienceSegment;
    onSave: (segment: AudienceSegment) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ segment, onSave, onCancel, isLoading }) => {
    const { contacts } = useMarketingAutomation();
    const [formData, setFormData] = useState<AudienceSegment>(
        segment || {
            id: '', name: '', description: '', rules: [], estimatedSize: 0,
            createdAt: new Date(), lastModified: new Date(),
        }
    );

    useEffect(() => {
        if (segment) setFormData(segment);
    }, [segment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRulesChange = (rules: { field: string; operator: string; value: any }[]) => {
        setFormData(prev => ({ ...prev, rules }));
    };

    const calculateEstimatedSize = useMemo(() => {
        // This is a simplified client-side estimation based on mock contacts
        // In a real app, this would be an API call or complex query.
        if (!contacts || contacts.length === 0 || formData.rules.length === 0) return 0;

        let matchedContacts = contacts;
        for (const rule of formData.rules) {
            matchedContacts = matchedContacts.filter(contact => {
                const contactValue = (contact as any)[rule.field]; // Access dynamically
                if (contactValue === undefined || rule.value === undefined) return false;

                switch (rule.operator) {
                    case 'equals': return contactValue === rule.value;
                    case 'greaterThan': return contactValue > rule.value;
                    case 'lessThan': return contactValue < rule.value;
                    case 'contains':
                        if (Array.isArray(contactValue)) return contactValue.includes(rule.value);
                        return String(contactValue).includes(String(rule.value));
                    case 'is': return contactValue === rule.value; // For booleans
                    default: return false;
                }
            });
        }
        return matchedContacts.length;
    }, [formData.rules, contacts]);

    useEffect(() => {
        setFormData(prev => ({ ...prev, estimatedSize: calculateEstimatedSize }));
    }, [calculateEstimatedSize]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Segment Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Rules</label>
                <ExportedSegmentRuleBuilder rules={formData.rules} onChange={handleRulesChange} />
            </div>
            <div className="bg-gray-700/50 p-3 rounded-md text-sm text-gray-300">
                Estimated Audience Size: <span className="font-semibold text-white">{formData.estimatedSize.toLocaleString()}</span> contacts
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Saving...' : (segment ? 'Update Segment' : 'Create Segment')}
                </button>
            </div>
        </form>
    );
};

/**
 * @function ExportedAudienceSegmentList
 * @description Displays a list of audience segments with CRUD actions.
 */
export const ExportedAudienceSegmentList: React.FC = () => {
    const { segments, loadingState, addOrUpdateSegment, deleteSegment } = useMarketingAutomation();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedSegment, setSelectedSegment] = useState<AudienceSegment | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedSegments = useMemo(() => {
        let sorted = [...segments];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof AudienceSegment];
                const bVal = b[sortKey as keyof AudienceSegment];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return sorted;
    }, [segments, sortKey, sortDirection, searchTerm]);

    const paginatedSegments = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedSegments.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedSegments, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedSegments.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedSegments.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddSegment = () => {
        setSelectedSegment(undefined);
        setFormModalOpen(true);
    };

    const handleEditSegment = (segment: AudienceSegment) => {
        setSelectedSegment(segment);
        setFormModalOpen(true);
    };

    const handleSaveSegment = async (segmentData: AudienceSegment) => {
        setIsSaving(true);
        try {
            await addOrUpdateSegment(segmentData);
            setFormModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSegment = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this segment?')) {
            await deleteSegment(id);
        }
    };

    const segmentColumns = useMemo(() => [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'description', label: 'Description', render: (s: AudienceSegment) => s.description.substring(0, 50) + '...' },
        { key: 'rules', label: 'Rules', render: (s: AudienceSegment) => `${s.rules.length} rules` },
        { key: 'estimatedSize', label: 'Est. Size', sortable: true, render: (s: AudienceSegment) => s.estimatedSize.toLocaleString() },
        { key: 'lastModified', label: 'Last Modified', sortable: true, render: (s: AudienceSegment) => formatDate(s.lastModified) },
        {
            key: 'actions',
            label: 'Actions',
            render: (s: AudienceSegment) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditSegment(s)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    <button onClick={() => handleDeleteSegment(s.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], []);

    return (
        <Card title="Audience Segments">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search segments..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddSegment} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Create New Segment</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedSegments}
                columns={segmentColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.segments}
            />

            <ExportedModal
                title={selectedSegment ? "Edit Audience Segment" : "Create New Audience Segment"}
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                className="max-w-3xl"
            >
                <ExportedAudienceSegmentForm
                    segment={selectedSegment}
                    onSave={handleSaveSegment}
                    onCancel={() => setFormModalOpen(false)}
                    isLoading={isSaving}
                />
            </ExportedModal>
        </Card>
    );
};

/**
 * @function ExportedLeadScoringRules
 * @description Component for defining lead scoring rules.
 */
export const ExportedLeadScoringRules: React.FC = () => {
    // This is a simplified version; in a real app, rules would be saved/loaded via API
    const [rules, setRules] = useState([
        { id: 1, event: 'Newsletter Signup', points: 10, description: 'Signed up for newsletter' },
        { id: 2, event: 'Product Page View', points: 5, description: 'Visited product page' },
        { id: 3, event: 'Demo Request', points: 25, description: 'Requested a demo' },
        { id: 4, event: 'Email Open', points: 2, description: 'Opened a marketing email' },
        { id: 5, event: 'Purchase', points: 50, description: 'Made a purchase' },
    ]);
    const [newEvent, setNewEvent] = useState({ event: '', points: 0, description: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleAddRule = async () => {
        if (newEvent.event && newEvent.points > 0) {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setRules(prev => [...prev, { ...newEvent, id: prev.length > 0 ? Math.max(...prev.map(r => r.id)) + 1 : 1 }]);
            setNewEvent({ event: '', points: 0, description: '' });
            setIsLoading(false);
        }
    };

    const handleDeleteRule = async (id: number) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setRules(prev => prev.filter(rule => rule.id !== id));
        setIsLoading(false);
    };

    const scoringColumns = useMemo(() => [
        { key: 'event', label: 'Event' },
        { key: 'description', label: 'Description' },
        { key: 'points', label: 'Points' },
        {
            key: 'actions', label: 'Actions', render: (rule: any) => (
                <button onClick={() => handleDeleteRule(rule.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
            )
        }
    ], []);

    return (
        <Card title="Lead Scoring Rules">
            <div className="space-y-4">
                <ExportedTable data={rules} columns={scoringColumns} isLoading={isLoading} />
                <div className="pt-4 border-t border-gray-700 space-y-3">
                    <h4 className="text-lg font-semibold text-white">Add New Rule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <input
                            type="text"
                            placeholder="Event Name (e.g., 'Website Visit')"
                            value={newEvent.event}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, event: e.target.value }))}
                            className="bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newEvent.description}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400"
                        />
                        <input
                            type="number"
                            placeholder="Points"
                            value={newEvent.points}
                            onChange={(e) => setNewEvent(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                            className="bg-gray-700/50 p-2 rounded border border-gray-600 text-white placeholder-gray-400"
                        />
                        <button onClick={handleAddRule} disabled={isLoading || !newEvent.event || !newEvent.description || newEvent.points <= 0}
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                            {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <IconPlus />} <span>Add Rule</span>
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- WORKFLOW AUTOMATION (JOURNEY BUILDER) FEATURES (to be exported) ---

/**
 * @function ExportedWorkflowEditor
 * @description Simplified visual editor for marketing workflows.
 * (This is a heavily simplified placeholder for a true drag-and-drop builder)
 */
export const ExportedWorkflowEditor: React.FC<{
    workflow: MarketingWorkflow;
    onUpdate: (workflow: MarketingWorkflow) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ workflow, onUpdate, onCancel, isLoading }) => {
    const [currentWorkflow, setCurrentWorkflow] = useState<MarketingWorkflow>(workflow);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    useEffect(() => {
        setCurrentWorkflow(workflow);
    }, [workflow]);

    const handleNodeChange = (nodeId: string, updates: Partial<WorkflowNode>) => {
        setCurrentWorkflow(prev => ({
            ...prev,
            nodes: prev.nodes.map(node =>
                node.id === nodeId ? { ...node, ...updates } : node
            ),
        }));
    };

    const handleWorkflowMetaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentWorkflow(prev => ({ ...prev, [name]: value }));
    };

    const nodeTypes = [
        { type: 'trigger', name: 'Trigger', icon: IconPlay },
        { type: 'action', name: 'Action', icon: IconPaperAirplane },
        { type: 'condition', name: 'Condition', icon: IconFunnel },
        { type: 'end', name: 'End', icon: IconStop },
    ];

    const NodeComponent: React.FC<{ node: WorkflowNode; onSelect: (id: string) => void; isSelected: boolean }> = ({ node, onSelect, isSelected }) => {
        const typeInfo = nodeTypes.find(t => t.type === node.type);
        const Icon = typeInfo?.icon || IconTerminal;
        return (
            <div
                className={`absolute p-3 rounded-lg shadow-md cursor-pointer ${isSelected ? 'border-2 border-cyan-500' : 'border border-gray-600'}
                    ${node.type === 'trigger' ? 'bg-green-700/50' : node.type === 'action' ? 'bg-blue-700/50' : node.type === 'condition' ? 'bg-yellow-700/50' : 'bg-gray-600/50'}`}
                style={{ left: node.position.x, top: node.position.y }}
                onClick={() => onSelect(node.id)}
            >
                <div className="flex items-center space-x-2 text-white">
                    <Icon />
                    <span>{node.name}</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">{node.properties.event || node.properties.action || 'Configure'}</p>
            </div>
        );
    };

    const renderNodeProperties = (node: WorkflowNode | undefined) => {
        if (!node) return <p className="text-gray-400">Select a node to view/edit properties.</p>;

        const handlePropertyChange = (key: string, value: any) => {
            handleNodeChange(node.id, { properties: { ...node.properties, [key]: value } });
        };

        return (
            <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">{node.name} Properties</h4>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Node Name</label>
                    <input type="text" value={node.name} onChange={(e) => handleNodeChange(node.id, { name: e.target.value })}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                </div>
                {node.type === 'trigger' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Trigger Event</label>
                        <select value={node.properties.event} onChange={(e) => handlePropertyChange('event', e.target.value)}
                            className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md">
                            <option value="New Lead Signup">New Lead Signup</option>
                            <option value="Product Purchase">Product Purchase</option>
                            <option value="Cart Abandonment">Cart Abandonment</option>
                        </select>
                    </div>
                )}
                {node.type === 'action' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Action Type</label>
                            <select value={node.properties.action} onChange={(e) => handlePropertyChange('action', e.target.value)}
                                className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md">
                                <option value="Send Email">Send Email</option>
                                <option value="Add Tag">Add Tag</option>
                                <option value="Update CRM">Update CRM</option>
                                <option value="Send SMS">Send SMS</option>
                            </select>
                        </div>
                        {node.properties.action === 'Send Email' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Email Template ID</label>
                                <input type="text" value={node.properties.templateId} onChange={(e) => handlePropertyChange('templateId', e.target.value)}
                                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Delay (e.g., "1d", "2h")</label>
                            <input type="text" value={node.properties.delay || ''} onChange={(e) => handlePropertyChange('delay', e.target.value)}
                                className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                        </div>
                    </div>
                )}
                {node.type === 'condition' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-400">Condition</label>
                            <input type="text" value={node.properties.condition} onChange={(e) => handlePropertyChange('condition', e.target.value)}
                                placeholder="e.g., email_opened, lead_score_gte_50"
                                className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                        </div>
                        <div className="flex space-x-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">If True (Next Node ID)</label>
                                <input type="text" value={node.nextNodes[0] || ''} onChange={(e) => handleNodeChange(node.id, { nextNodes: [e.target.value, node.nextNodes[1]] })}
                                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">If False (Next Node ID)</label>
                                <input type="text" value={node.nextNodes[1] || ''} onChange={(e) => handleNodeChange(node.id, { nextNodes: [node.nextNodes[0], e.target.value] })}
                                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => setSelectedNodeId(null)} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Close</button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[70vh] flex flex-col">
            <div className="flex-none p-4 border-b border-gray-700 text-gray-300">
                <h3 className="text-xl font-bold text-white mb-2">Workflow: {currentWorkflow.name}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Workflow Name</label>
                        <input type="text" name="name" value={currentWorkflow.name} onChange={handleWorkflowMetaChange}
                            className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <textarea name="description" value={currentWorkflow.description} onChange={handleWorkflowMetaChange} rows={1}
                            className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md"></textarea>
                    </div>
                </div>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                    <button type="button" onClick={() => onUpdate(currentWorkflow)} disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Saving...' : 'Save Workflow'}
                    </button>
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 relative bg-gray-900/40 border-r border-gray-700 overflow-auto">
                    {/* Simplified Workflow Canvas */}
                    <div className="relative w-[1200px] h-[600px]"> {/* Fixed size canvas for demo */}
                        {currentWorkflow.nodes.map(node => (
                            <NodeComponent
                                key={node.id}
                                node={node}
                                onSelect={setSelectedNodeId}
                                isSelected={selectedNodeId === node.id}
                            />
                        ))}
                        {/* Render lines between connected nodes (simplified, static positions for demo) */}
                        {currentWorkflow.nodes.map(node =>
                            node.nextNodes.map(nextNodeId => {
                                const nextNode = currentWorkflow.nodes.find(n => n.id === nextNodeId);
                                if (!nextNode) return null;

                                const startX = node.position.x + 100; // Assume node width 100
                                const startY = node.position.y + 25; // Assume node height 50, center Y
                                const endX = nextNode.position.x;
                                const endY = nextNode.position.y + 25;

                                return (
                                    <svg key={`${node.id}-${nextNodeId}`} className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
                                        <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#4b5563" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                        <defs>
                                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                                                <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
                                            </marker>
                                        </defs>
                                    </svg>
                                );
                            })
                        )}
                    </div>
                </div>
                <div className="flex-none w-80 bg-gray-800 p-4 overflow-y-auto">
                    {renderNodeProperties(currentWorkflow.nodes.find(n => n.id === selectedNodeId))}
                </div>
            </div>
        </div>
    );
};

/**
 * @function ExportedWorkflowList
 * @description Displays a list of marketing workflows with CRUD actions.
 */
export const ExportedWorkflowList: React.FC = () => {
    const { workflows, loadingState, addOrUpdateWorkflow, deleteWorkflow } = useMarketingAutomation();
    const [isEditorModalOpen, setEditorModalOpen] = useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = useState<MarketingWorkflow | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedWorkflows = useMemo(() => {
        let sorted = [...workflows];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof MarketingWorkflow];
                const bVal = b[sortKey as keyof MarketingWorkflow];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                    return sortDirection === 'asc' ? (aVal === bVal ? 0 : aVal ? -1 : 1) : (aVal === bVal ? 0 : aVal ? 1 : -1);
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(w =>
                w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.triggerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return sorted;
    }, [workflows, sortKey, sortDirection, searchTerm]);

    const paginatedWorkflows = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedWorkflows.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedWorkflows, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedWorkflows.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedWorkflows.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddWorkflow = () => {
        setSelectedWorkflow(generateDummyWorkflow()); // Pre-fill with a basic structure
        setEditorModalOpen(true);
    };

    const handleEditWorkflow = (workflow: MarketingWorkflow) => {
        setSelectedWorkflow(workflow);
        setEditorModalOpen(true);
    };

    const handleSaveWorkflow = async (workflowData: MarketingWorkflow) => {
        setIsSaving(true);
        try {
            await addOrUpdateWorkflow(workflowData);
            setEditorModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteWorkflow = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this workflow?')) {
            await deleteWorkflow(id);
        }
    };

    const workflowColumns = useMemo(() => [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'description', label: 'Description', render: (w: MarketingWorkflow) => w.description.substring(0, 50) + '...' },
        { key: 'triggerType', label: 'Trigger', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        {
            key: 'isActive', label: 'Active', sortable: true, render: (w: MarketingWorkflow) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${w.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {w.isActive ? 'Yes' : 'No'}
                </span>
            )
        },
        { key: 'lastModified', label: 'Last Modified', sortable: true, render: (w: MarketingWorkflow) => formatDate(w.lastModified) },
        {
            key: 'actions',
            label: 'Actions',
            render: (w: MarketingWorkflow) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditWorkflow(w)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    <button onClick={() => handleDeleteWorkflow(w.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], []);

    return (
        <Card title="Marketing Workflows">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddWorkflow} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Create New Workflow</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedWorkflows}
                columns={workflowColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.workflows}
            />

            <ExportedModal
                title={selectedWorkflow ? `Edit Workflow: ${selectedWorkflow.name}` : "Create New Workflow"}
                isOpen={isEditorModalOpen}
                onClose={() => setEditorModalOpen(false)}
                className="max-w-5xl h-[90vh] flex flex-col" // Added flex-col for internal layout
            >
                {selectedWorkflow && (
                    <ExportedWorkflowEditor
                        workflow={selectedWorkflow}
                        onUpdate={handleSaveWorkflow}
                        onCancel={() => setEditorModalOpen(false)}
                        isLoading={isSaving}
                    />
                )}
            </ExportedModal>
        </Card>
    );
};

// --- AI CONTENT GENERATION FEATURES (to be exported) ---

/**
 * @function ExportedAICopyGenerator
 * @description Enhanced AI ad copy generator with more options.
 */
export const ExportedAICopyGenerator: React.FC<{
    onGenerate: (copy: string) => void;
    isLoading: boolean;
    initialProductDesc?: string;
    adCopy?: string;
}> = ({ onGenerate, isLoading, initialProductDesc = '', adCopy }) => {
    const [productDesc, setProductDesc] = useState(initialProductDesc);
    const [contentType, setContentType] = useState<'headline' | 'body' | 'social' | 'email_subject' | 'blog_outline'>('headline');
    const [tone, setTone] = useState<'professional' | 'casual' | 'witty' | 'urgent' | 'empathetic'>('professional');
    const [length, setLength] = useState<'short' | 'medium' | 'long'>('short');
    const [keywords, setKeywords] = useState('');

    const handleGenerate = async () => {
        if (!productDesc.trim()) {
            alert('Please provide a product description.');
            return;
        }

        let prompt = `Generate `;
        switch (contentType) {
            case 'headline': prompt += `3 short, punchy ad copy headlines`; break;
            case 'body': prompt += `a compelling ad copy paragraph`; break;
            case 'social': prompt += `a social media post suitable for Twitter and Facebook`; break;
            case 'email_subject': prompt += `5 engaging email subject lines`; break;
            case 'blog_outline': prompt += `a blog post outline with 5 sections`; break;
        }

        prompt += ` for this product: "${productDesc}".`;
        prompt += ` The tone should be ${tone}.`;
        prompt += ` The length should be ${length}.`;
        if (keywords) prompt += ` Include these keywords: ${keywords}.`;
        prompt += ` Ensure the output is only the generated content, without conversational filler.`;

        onGenerate(prompt); // Pass the structured prompt for external execution
    };

    return (
        <div className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Product/Service Description</label>
                <textarea
                    value={productDesc}
                    onChange={e => setProductDesc(e.target.value)}
                    placeholder="E.g., Our new AI-powered savings tool that helps users find personalized discounts automatically."
                    rows={3}
                    className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Content Type</label>
                    <select value={contentType} onChange={e => setContentType(e.target.value as any)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="headline">Ad Headlines</option>
                        <option value="body">Ad Body Copy</option>
                        <option value="social">Social Media Post</option>
                        <option value="email_subject">Email Subject Lines</option>
                        <option value="blog_outline">Blog Outline</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Tone</label>
                    <select value={tone} onChange={e => setTone(e.target.value as any)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="witty">Witty</option>
                        <option value="urgent">Urgent</option>
                        <option value="empathetic">Empathetic</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Length</label>
                    <select value={length} onChange={e => setLength(e.target.value as any)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400">Keywords (comma-separated, optional)</label>
                <input
                    type="text"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="E.g., savings, AI, discounts, automate"
                    className="w-full bg-gray-700/50 p-2 rounded border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>

            <button onClick={handleGenerate} disabled={isLoading || !productDesc.trim()}
                className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50 flex items-center justify-center space-x-2 text-white font-medium">
                {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> <span>Generating...</span></> : <><IconLightBulb /> <span>Generate Content</span></>}
            </button>

            {adCopy && (
                <div className="p-3 bg-gray-900/50 rounded whitespace-pre-line text-sm text-gray-200">
                    <h4 className="font-semibold text-white mb-2">Generated Content:</h4>
                    {adCopy}
                </div>
            )}
        </div>
    );
};

// --- EMAIL MARKETING FEATURES (to be exported) ---

/**
 * @function ExportedEmailTemplateEditor
 * @description Basic editor for email templates.
 */
export const ExportedEmailTemplateEditor: React.FC<{
    template?: EmailTemplate;
    onSave: (template: EmailTemplate) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ template, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<EmailTemplate>(
        template || {
            id: '', name: '', subject: '', htmlContent: '<p>Hello {{contact.firstName}},</p><p>Write your email content here...</p><p>Regards,<br>Your Team</p>',
            plainTextContent: 'Hello {{contact.firstName}},\n\nWrite your email content here...\n\nRegards,\nYour Team',
            createdAt: new Date(), lastModified: new Date(), tags: [],
        }
    );

    useEffect(() => {
        if (template) setFormData(template);
        // Sync plain text content if HTML changes and plain text is default
        if (!template && formData.htmlContent.includes('Write your email content here')) {
            const htmlToPlainText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
            setFormData(prev => ({ ...prev, plainTextContent: htmlToPlainText(prev.htmlContent) }));
        }
    }, [template]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const html = e.target.value;
        const htmlToPlainText = (htmlString: string) => htmlString.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        setFormData(prev => ({ ...prev, htmlContent: html, plainTextContent: htmlToPlainText(html) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Template Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Subject Line</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">HTML Content (Basic HTML editor)</label>
                <textarea name="htmlContent" value={formData.htmlContent} onChange={handleHtmlChange} rows={10}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md font-mono focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                <p className="text-xs text-gray-500 mt-1">Use <code>{{ '{{contact.firstName}}' }}</code> for personalization.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Plain Text Content (Auto-generated)</label>
                <textarea name="plainTextContent" value={formData.plainTextContent} readOnly rows={5}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md font-mono text-gray-500"></textarea>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Saving...' : (template ? 'Update Template' : 'Create Template')}
                </button>
            </div>
        </form>
    );
};

/**
 * @function ExportedEmailTemplateList
 * @description Displays a list of email templates with CRUD actions.
 */
export const ExportedEmailTemplateList: React.FC = () => {
    const { emailTemplates, loadingState, fetchEmailTemplates } = useMarketingAutomation(); // No direct add/delete for templates yet, but good to have context
    const [isEditorModalOpen, setEditorModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false); // For simulate save
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const addOrUpdateTemplate = async (template: EmailTemplate) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
        if (template.id) {
            globalThis.mockEmailTemplates = globalThis.mockEmailTemplates.map((t: EmailTemplate) => t.id === template.id ? { ...t, ...template, lastModified: new Date() } : t);
        } else {
            const newTemplate = { ...template, id: `TPL-${emailTemplateIdCounter++}`, createdAt: new Date(), lastModified: new Date() };
            globalThis.mockEmailTemplates.push(newTemplate);
        }
        await fetchEmailTemplates();
        setIsLoading(false);
        setEditorModalOpen(false);
    };

    const deleteTemplate = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API call
            globalThis.mockEmailTemplates = globalThis.mockEmailTemplates.filter((t: EmailTemplate) => t.id !== id);
            await fetchEmailTemplates();
            setIsLoading(false);
        }
    };


    const filteredAndSortedTemplates = useMemo(() => {
        let sorted = [...emailTemplates];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof EmailTemplate];
                const bVal = b[sortKey as keyof EmailTemplate];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(t =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.htmlContent.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return sorted;
    }, [emailTemplates, sortKey, sortDirection, searchTerm]);

    const paginatedTemplates = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedTemplates.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedTemplates, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedTemplates.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedTemplates.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddTemplate = () => {
        setSelectedTemplate(undefined);
        setEditorModalOpen(true);
    };

    const handleEditTemplate = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setEditorModalOpen(true);
    };

    const templateColumns = useMemo(() => [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'subject', label: 'Subject', render: (t: EmailTemplate) => t.subject.substring(0, 70) + '...' },
        { key: 'tags', label: 'Tags', render: (t: EmailTemplate) => t.tags.join(', ') || 'N/A' },
        { key: 'lastModified', label: 'Last Modified', sortable: true, render: (t: EmailTemplate) => formatDate(t.lastModified) },
        {
            key: 'actions',
            label: 'Actions',
            render: (t: EmailTemplate) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditTemplate(t)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    <button onClick={() => deleteTemplate(t.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], []);

    return (
        <Card title="Email Templates">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddTemplate} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Create New Template</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedTemplates}
                columns={templateColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.emailTemplates}
            />

            <ExportedModal
                title={selectedTemplate ? "Edit Email Template" : "Create New Email Template"}
                isOpen={isEditorModalOpen}
                onClose={() => setEditorModalOpen(false)}
                className="max-w-4xl"
            >
                <ExportedEmailTemplateEditor
                    template={selectedTemplate}
                    onSave={addOrUpdateTemplate}
                    onCancel={() => setEditorModalOpen(false)}
                    isLoading={isLoading}
                />
            </ExportedModal>
        </Card>
    );
};

/**
 * @function ExportedEmailCampaignSender
 * @description Form for creating and scheduling email campaigns.
 */
export const ExportedEmailCampaignSender: React.FC<{
    campaign?: EmailCampaign;
    onSave: (campaign: EmailCampaign) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ campaign, onSave, onCancel, isLoading }) => {
    const { emailTemplates, segments } = useMarketingAutomation();
    const [formData, setFormData] = useState<EmailCampaign>(
        campaign || {
            id: '', name: '', templateId: '', segmentId: '', senderEmail: 'info@yourcompany.com', senderName: 'Your Company',
            subject: '', scheduledSendTime: new Date(Date.now() + 60 * 60 * 1000), status: 'Draft',
            stats: { sent: 0, opens: 0, clicks: 0, bounces: 0, unsubscribes: 0 }, createdAt: new Date(), lastModified: new Date(),
        }
    );

    useEffect(() => {
        if (campaign) {
            setFormData(campaign);
        }
    }, [campaign]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'templateId') {
            const selectedTemplate = emailTemplates.find(t => t.id === value);
            if (selectedTemplate) {
                setFormData(prev => ({ ...prev, subject: selectedTemplate.subject }));
            }
        }
    };

    const handleDateTimeChange = (dateString: string, timeString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const [hours, minutes] = timeString.split(':').map(Number);
        const newDate = new Date(year, month - 1, day, hours, minutes);
        setFormData(prev => ({ ...prev, scheduledSendTime: newDate }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const currentDateTime = new Date();
    const formattedDate = formData.scheduledSendTime.toISOString().split('T')[0];
    const formattedTime = formData.scheduledSendTime.toTimeString().substring(0, 5);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Campaign Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Email Template</label>
                <select name="templateId" value={formData.templateId} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="">Select a template</option>
                    {emailTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name} - {template.subject}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Subject Line</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Target Audience Segment</label>
                <select name="segmentId" value={formData.segmentId} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="">Select a segment</option>
                    {segments.map(segment => (
                        <option key={segment.id} value={segment.id}>{segment.name} (Est. Size: {segment.estimatedSize.toLocaleString()})</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Sender Name</label>
                    <input type="text" name="senderName" value={formData.senderName} onChange={handleChange} required
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Sender Email</label>
                    <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleChange} required
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Scheduled Send Date</label>
                    <input type="date" value={formattedDate} onChange={(e) => handleDateTimeChange(e.target.value, formattedTime)}
                        min={currentDateTime.toISOString().split('T')[0]}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Scheduled Send Time</label>
                    <input type="time" value={formattedTime} onChange={(e) => handleDateTimeChange(formattedDate, e.target.value)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Sending">Sending</option>
                    <option value="Sent">Sent</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Saving...' : (campaign ? 'Update Campaign' : 'Schedule Campaign')}
                </button>
            </div>
        </form>
    );
};

/**
 * @function ExportedEmailCampaignList
 * @description Displays a list of email campaigns with CRUD and stats.
 */
export const ExportedEmailCampaignList: React.FC = () => {
    const { emailCampaigns, loadingState, addOrUpdateEmailCampaign, deleteEmailCampaign, getSegmentById, emailTemplates } = useMarketingAutomation();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('scheduledSendTime');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const getTemplateName = useCallback((templateId: string) => {
        return emailTemplates.find(t => t.id === templateId)?.name || 'Unknown Template';
    }, [emailTemplates]);

    const filteredAndSortedCampaigns = useMemo(() => {
        let sorted = [...emailCampaigns];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof EmailCampaign];
                const bVal = b[sortKey as keyof EmailCampaign];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                getTemplateName(c.templateId).toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return sorted;
    }, [emailCampaigns, sortKey, sortDirection, searchTerm, getTemplateName]);

    const paginatedCampaigns = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedCampaigns.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedCampaigns, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedCampaigns.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedCampaigns.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddCampaign = () => {
        setSelectedCampaign(undefined);
        setFormModalOpen(true);
    };

    const handleEditCampaign = (campaign: EmailCampaign) => {
        setSelectedCampaign(campaign);
        setFormModalOpen(true);
    };

    const handleSaveCampaign = async (campaignData: EmailCampaign) => {
        setIsSaving(true);
        try {
            await addOrUpdateEmailCampaign(campaignData);
            setFormModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this email campaign?')) {
            await deleteEmailCampaign(id);
        }
    };

    const emailCampaignColumns = useMemo(() => [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'subject', label: 'Subject' },
        { key: 'templateId', label: 'Template', render: (c: EmailCampaign) => getTemplateName(c.templateId) },
        { key: 'segmentId', label: 'Segment', render: (c: EmailCampaign) => getSegmentById(c.segmentId)?.name || 'N/A' },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'scheduledSendTime', label: 'Scheduled', sortable: true, render: (c: EmailCampaign) => formatDate(c.scheduledSendTime) },
        { key: 'stats.sent', label: 'Sent', sortable: true, render: (c: EmailCampaign) => c.stats.sent.toLocaleString() },
        { key: 'stats.opens', label: 'Opens', sortable: true, render: (c: EmailCampaign) => c.stats.opens.toLocaleString() },
        { key: 'stats.clicks', label: 'Clicks', sortable: true, render: (c: EmailCampaign) => c.stats.clicks.toLocaleString() },
        {
            key: 'actions',
            label: 'Actions',
            render: (c: EmailCampaign) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditCampaign(c)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    <button onClick={() => handleDeleteCampaign(c.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], [getTemplateName, getSegmentById]);

    return (
        <Card title="Email Campaigns">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search email campaigns..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddCampaign} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Schedule New Email</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedCampaigns}
                columns={emailCampaignColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.emailCampaigns}
            />

            <ExportedModal
                title={selectedCampaign ? "Edit Email Campaign" : "Schedule New Email Campaign"}
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                className="max-w-3xl"
            >
                <ExportedEmailCampaignSender
                    campaign={selectedCampaign}
                    onSave={handleSaveCampaign}
                    onCancel={() => setFormModalOpen(false)}
                    isLoading={isSaving}
                />
            </ExportedModal>
        </Card>
    );
};

// --- SOCIAL MEDIA MANAGEMENT FEATURES (to be exported) ---

/**
 * @function ExportedSocialPostScheduler
 * @description Form for creating and scheduling social media posts.
 */
export const ExportedSocialPostScheduler: React.FC<{
    post?: SocialPost;
    onSave: (post: SocialPost) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ post, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<SocialPost>(
        post || {
            id: '', content: '', platform: 'facebook', scheduledTime: new Date(Date.now() + 60 * 60 * 1000), status: 'Draft',
            createdAt: new Date(), lastModified: new Date(),
        }
    );

    useEffect(() => {
        if (post) setFormData(post);
    }, [post]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateTimeChange = (dateString: string, timeString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const [hours, minutes] = timeString.split(':').map(Number);
        const newDate = new Date(year, month - 1, day, hours, minutes);
        setFormData(prev => ({ ...prev, scheduledTime: newDate }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const currentDateTime = new Date();
    const formattedDate = formData.scheduledTime.toISOString().split('T')[0];
    const formattedTime = formData.scheduledTime.toTimeString().substring(0, 5);

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Post Content</label>
                <textarea name="content" value={formData.content} onChange={handleChange} required rows={5} maxLength={280}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                <p className="text-xs text-gray-500 mt-1">{formData.content.length} / 280 (Twitter-like limit)</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Platform</label>
                <select name="platform" value={formData.platform} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                </select>
            </div>
            {/* Simplified image/video upload - in a real app, this would involve file inputs and storage */}
            <div>
                <label className="block text-sm font-medium text-gray-400">Image/Video URLs (comma-separated, optional)</label>
                <input
                    type="text"
                    name="imageUrls"
                    value={formData.imageUrls?.join(', ') || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrls: e.target.value.split(',').map(url => url.trim()).filter(Boolean) }))}
                    placeholder="e.g., https://example.com/image.jpg"
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Scheduled Date</label>
                    <input type="date" value={formattedDate} onChange={(e) => handleDateTimeChange(e.target.value, formattedTime)}
                        min={currentDateTime.toISOString().split('T')[0]}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Scheduled Time</label>
                    <input type="time" value={formattedTime} onChange={(e) => handleDateTimeChange(formattedDate, e.target.value)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Posted">Posted</option>
                    <option value="Failed">Failed</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Saving...' : (post ? 'Update Post' : 'Schedule Post')}
                </button>
            </div>
        </form>
    );
};

/**
 * @function ExportedSocialPostList
 * @description Displays a list of social media posts with CRUD and analytics.
 */
export const ExportedSocialPostList: React.FC = () => {
    const { socialPosts, loadingState, addOrUpdateSocialPost, deleteSocialPost } = useMarketingAutomation();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<SocialPost | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('scheduledTime');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedPosts = useMemo(() => {
        let sorted = [...socialPosts];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof SocialPost];
                const bVal = b[sortKey as keyof SocialPost];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(p =>
                p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return sorted;
    }, [socialPosts, sortKey, sortDirection, searchTerm]);

    const paginatedPosts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedPosts.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedPosts, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedPosts.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedPosts.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddPost = () => {
        setSelectedPost(undefined);
        setFormModalOpen(true);
    };

    const handleEditPost = (post: SocialPost) => {
        setSelectedPost(post);
        setFormModalOpen(true);
    };

    const handleSavePost = async (postData: SocialPost) => {
        setIsSaving(true);
        try {
            await addOrUpdateSocialPost(postData);
            setFormModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this social media post?')) {
            await deleteSocialPost(id);
        }
    };

    const socialPostColumns = useMemo(() => [
        { key: 'content', label: 'Content', render: (p: SocialPost) => p.content.substring(0, 50) + '...' },
        { key: 'platform', label: 'Platform', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'scheduledTime', label: 'Scheduled', sortable: true, render: (p: SocialPost) => formatDate(p.scheduledTime) },
        { key: 'analytics.reach', label: 'Reach', sortable: true, render: (p: SocialPost) => p.analytics?.reach?.toLocaleString() || 'N/A' },
        { key: 'analytics.engagement', label: 'Engagement', sortable: true, render: (p: SocialPost) => p.analytics?.engagement?.toLocaleString() || 'N/A' },
        {
            key: 'actions',
            label: 'Actions',
            render: (p: SocialPost) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditPost(p)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    <button onClick={() => handleDeletePost(p.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], []);

    return (
        <Card title="Social Media Posts">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddPost} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Schedule New Post</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedPosts}
                columns={socialPostColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.socialPosts}
            />

            <ExportedModal
                title={selectedPost ? "Edit Social Media Post" : "Schedule New Social Media Post"}
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                className="max-w-3xl"
            >
                <ExportedSocialPostScheduler
                    post={selectedPost}
                    onSave={handleSavePost}
                    onCancel={() => setFormModalOpen(false)}
                    isLoading={isSaving}
                />
            </ExportedModal>
        </Card>
    );
};

// --- A/B TESTING FRAMEWORK (to be exported) ---

/**
 * @function ExportedABTestForm
 * @description Form for creating and editing A/B tests.
 */
export const ExportedABTestForm: React.FC<{
    abTest?: ABTest;
    onSave: (test: ABTest) => void;
    onCancel: () => void;
    isLoading?: boolean;
}> = ({ abTest, onSave, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<ABTest>(
        abTest || {
            id: '', name: '', description: '', type: 'ad_copy',
            variants: [{ id: 'A', name: 'Variant A', content: '', trafficShare: 50 }, { id: 'B', name: 'Variant B', content: '', trafficShare: 50 }],
            trafficDistribution: [50, 50], primaryMetric: 'conversions',
            startDate: new Date(), endDate: null, status: 'Planned',
            createdAt: new Date(), lastModified: new Date(),
        }
    );

    useEffect(() => {
        if (abTest) setFormData(abTest);
    }, [abTest]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index: number, key: keyof ABTest['variants'][0], value: any) => {
        const newVariants = [...formData.variants];
        if (key === 'trafficShare') {
            const newShare = parseInt(value) || 0;
            if (newShare > 100) return; // Prevent over 100%
            const otherIndex = index === 0 ? 1 : 0;
            const remaining = 100 - newShare;
            newVariants[index] = { ...newVariants[index], [key]: newShare };
            newVariants[otherIndex] = { ...newVariants[otherIndex], [key]: remaining };
            setFormData(prev => ({ ...prev, variants: newVariants, trafficDistribution: newVariants.map(v => v.trafficShare) }));
        } else {
            newVariants[index] = { ...newVariants[index], [key]: value };
            setFormData(prev => ({ ...prev, variants: newVariants }));
        }
    };

    const handleDateChange = (name: 'startDate' | 'endDate', dateString: string) => {
        setFormData(prev => ({ ...prev, [name]: dateString ? new Date(dateString) : null }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">
            <div>
                <label className="block text-sm font-medium text-gray-400">Test Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={2}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Test Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="ad_copy">Ad Copy</option>
                        <option value="landing_page">Landing Page</option>
                        <option value="email_subject">Email Subject</option>
                        <option value="email_body">Email Body</option>
                        <option value="cta_button">CTA Button</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Primary Metric</label>
                    <select name="primaryMetric" value={formData.primaryMetric} onChange={handleChange}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                        <option value="conversions">Conversions</option>
                        <option value="clicks">Clicks</option>
                        <option value="revenue">Revenue</option>
                        <option value="signups">Sign-ups</option>
                    </select>
                </div>
            </div>

            <h4 className="text-md font-semibold text-white mt-4">Variants</h4>
            {formData.variants.map((variant, index) => (
                <div key={variant.id} className="p-3 bg-gray-700/50 rounded-md space-y-2">
                    <label className="block text-sm font-medium text-gray-400">{variant.name}</label>
                    <input
                        type="text"
                        value={variant.content}
                        onChange={(e) => handleVariantChange(index, 'content', e.target.value)}
                        placeholder={`${formData.type.replace(/_/g, ' ')} content for ${variant.name}`}
                        className="mt-1 block w-full bg-gray-700 p-2 border border-gray-600 rounded-md"
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Traffic Share (%)</label>
                        <input
                            type="number"
                            value={variant.trafficShare}
                            onChange={(e) => handleVariantChange(index, 'trafficShare', e.target.value)}
                            min="0" max="100"
                            className="mt-1 block w-full bg-gray-700 p-2 border border-gray-600 rounded-md"
                        />
                    </div>
                </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate.toISOString().split('T')[0]} onChange={(e) => handleDateChange('startDate', e.target.value)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">End Date (Optional)</label>
                    <input type="date" name="endDate" value={formData.endDate?.toISOString().split('T')[0] || ''} onChange={(e) => handleDateChange('endDate', e.target.value)}
                        className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Status</label>
                <select name="status" value={formData.status} onChange={handleChange}
                    className="mt-1 block w-full bg-gray-700/50 p-2 border border-gray-600 rounded-md focus:ring-cyan-500 focus:border-cyan-500">
                    <option value="Planned">Planned</option>
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 rounded-md border border-gray-600 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Saving...' : (abTest ? 'Update A/B Test' : 'Create A/B Test')}
                </button>
            </div>
        </form>
    );
};

/**
 * @function ExportedABTestResults
 * @description Displays the results of an A/B test.
 */
export const ExportedABTestResults: React.FC<{ abTest: ABTest }> = ({ abTest }) => {
    if (!abTest.results || abTest.status !== 'Completed') {
        return <p className="text-gray-400">A/B test results are not available or the test is not yet completed.</p>;
    }

    const { variantResults, winningVariantId, confidenceLevel, conclusion } = abTest.results;
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042']; // Colors for chart variants

    const chartData = variantResults.map(vr => ({
        name: abTest.variants.find(v => v.id === vr.variantId)?.name || 'Unknown',
        impressions: vr.impressions,
        clicks: vr.clicks,
        conversions: vr.conversions,
        revenue: vr.revenue || 0,
        ctr: vr.ctr,
        conversionRate: vr.conversionRate,
    }));

    return (
        <div className="space-y-6 text-gray-300">
            <h3 className="text-xl font-bold text-white">Results for: {abTest.name}</h3>
            <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-white mb-2">Conclusion:</p>
                <p>{conclusion}</p>
                {winningVariantId && (
                    <p className="mt-2">
                        Winning Variant: <span className="font-bold text-cyan-400">{abTest.variants.find(v => v.id === winningVariantId)?.name}</span>
                        {' '}(Confidence: {confidenceLevel ? `${(confidenceLevel * 100).toFixed(0)}%` : 'N/A'})
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {variantResults.map((vr, index) => {
                    const variant = abTest.variants.find(v => v.id === vr.variantId);
                    if (!variant) return null;
                    const isWinner = winningVariantId === variant.id;

                    return (
                        <Card key={variant.id} className={`${isWinner ? 'border-2 border-green-500 shadow-lg' : 'border border-gray-700'}`}>
                            <h4 className="text-lg font-semibold text-white flex items-center">
                                {isWinner && <IconCheckCircle className="text-green-500 mr-2" />}
                                {variant.name}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">{abTest.type.replace(/_/g, ' ')}: {variant.content}</p>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                <p><span className="text-gray-400">Impressions:</span> <span className="font-semibold text-white">{vr.impressions.toLocaleString()}</span></p>
                                <p><span className="text-gray-400">Clicks:</span> <span className="font-semibold text-white">{vr.clicks.toLocaleString()}</span></p>
                                <p><span className="text-gray-400">Conversions:</span> <span className="font-semibold text-white">{vr.conversions.toLocaleString()}</span></p>
                                <p><span className="text-gray-400">Revenue:</span> <span className="font-semibold text-white">{formatCurrency(vr.revenue || 0)}</span></p>
                                <p><span className="text-gray-400">CTR:</span> <span className="font-semibold text-white">{vr.ctr.toFixed(2)}%</span></p>
                                <p><span className="text-gray-400">Conversion Rate:</span> <span className="font-semibold text-white">{vr.conversionRate.toFixed(2)}%</span></p>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card title="Variant Performance Comparison">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis yAxisId="left" stroke="#9ca3af" label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" label={{ value: 'Rates (%)', angle: 90, position: 'insideRight', fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="impressions" fill={COLORS[0]} name="Impressions" />
                        <Bar yAxisId="left" dataKey="clicks" fill={COLORS[1]} name="Clicks" />
                        <Bar yAxisId="left" dataKey="conversions" fill={COLORS[2]} name="Conversions" />
                        <Line yAxisId="right" type="monotone" dataKey="ctr" stroke={COLORS[3]} dot={false} name="CTR (%)" />
                        <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#ff00ff" dot={false} name="Conversion Rate (%)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

/**
 * @function ExportedABTestList
 * @description Displays a list of A/B tests with CRUD actions.
 */
export const ExportedABTestList: React.FC = () => {
    const { abTests, loadingState, addOrUpdateABTest, deleteABTest } = useMarketingAutomation();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [selectedABTest, setSelectedABTest] = useState<ABTest | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [isResultsModalOpen, setResultsModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('startDate');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedTests = useMemo(() => {
        let sorted = [...abTests];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof ABTest];
                const bVal = b[sortKey as keyof ABTest];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(t =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return sorted;
    }, [abTests, sortKey, sortDirection, searchTerm]);

    const paginatedTests = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedTests.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedTests, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedTests.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedTests.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleAddTest = () => {
        setSelectedABTest(undefined);
        setFormModalOpen(true);
    };

    const handleEditTest = (test: ABTest) => {
        setSelectedABTest(test);
        setFormModalOpen(true);
    };

    const handleViewResults = (test: ABTest) => {
        setSelectedABTest(test);
        setResultsModalOpen(true);
    };

    const handleSaveTest = async (testData: ABTest) => {
        setIsSaving(true);
        try {
            await addOrUpdateABTest(testData);
            setFormModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTest = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this A/B test?')) {
            await deleteABTest(id);
        }
    };

    const abTestColumns = useMemo(() => [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'type', label: 'Type', sortable: true, render: (t: ABTest) => t.type.replace(/_/g, ' ') },
        { key: 'primaryMetric', label: 'Metric', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'startDate', label: 'Start Date', sortable: true, render: (t: ABTest) => formatDate(t.startDate).split(',')[0] },
        {
            key: 'winningVariant', label: 'Winner', render: (t: ABTest) =>
                t.status === 'Completed' && t.results?.winningVariantId ? (
                    <span className="text-green-400 font-semibold">{t.variants.find(v => v.id === t.results?.winningVariantId)?.name}</span>
                ) : t.status === 'Completed' ? <span className="text-gray-500">No Winner</span> : <span className="text-gray-500">N/A</span>
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (t: ABTest) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditTest(t)} className="text-cyan-500 hover:text-cyan-400"><IconEdit /></button>
                    {t.status === 'Completed' && (
                        <button onClick={() => handleViewResults(t)} className="text-blue-500 hover:text-blue-400"><IconChartBar /></button>
                    )}
                    <button onClick={() => handleDeleteTest(t.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
                </div>
            )
        },
    ], []);

    return (
        <Card title="A/B Tests">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search A/B tests..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleAddTest} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                    <IconPlus /> <span>Create New A/B Test</span>
                </button>
            </div>
            <ExportedTable
                data={paginatedTests}
                columns={abTestColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.abTests}
            />

            <ExportedModal
                title={selectedABTest ? "Edit A/B Test" : "Create New A/B Test"}
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                className="max-w-3xl"
            >
                <ExportedABTestForm
                    abTest={selectedABTest}
                    onSave={handleSaveTest}
                    onCancel={() => setFormModalOpen(false)}
                    isLoading={isSaving}
                />
            </ExportedModal>

            <ExportedModal
                title={`A/B Test Results: ${selectedABTest?.name}`}
                isOpen={isResultsModalOpen}
                onClose={() => setResultsModalOpen(false)}
                className="max-w-4xl"
            >
                {selectedABTest && <ExportedABTestResults abTest={selectedABTest} />}
            </ExportedModal>
        </Card>
    );
};

// --- CONTACT MANAGEMENT (LIGHT) (to be exported) ---

/**
 * @function ExportedContactList
 * @description Displays a list of contacts.
 */
export const ExportedContactList: React.FC = () => {
    const { contacts, loadingState, deleteContact, segments } = useMarketingAutomation();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey, setSortKey] = useState('lastName');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const getSegmentNames = useCallback((segmentIds: string[]) => {
        return segmentIds.map(id => segments.find(s => s.id === id)?.name || 'N/A').join(', ');
    }, [segments]);

    const filteredAndSortedContacts = useMemo(() => {
        let sorted = [...contacts];
        if (sortKey) {
            sorted.sort((a, b) => {
                const aVal = a[sortKey as keyof ContactProfile];
                const bVal = b[sortKey as keyof ContactProfile];

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                }
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                if (aVal instanceof Date && bVal instanceof Date) {
                    return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
                }
                return 0;
            });
        }

        if (searchTerm) {
            sorted = sorted.filter(c =>
                c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return sorted;
    }, [contacts, sortKey, sortDirection, searchTerm]);

    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedContacts.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedContacts, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredAndSortedContacts.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredAndSortedContacts.length };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handleSort = (key: string) => {
        if (key === sortKey) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            await deleteContact(id);
        }
    };

    const contactColumns = useMemo(() => [
        { key: 'firstName', label: 'First Name', sortable: true },
        { key: 'lastName', label: 'Last Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'city', label: 'City', sortable: true },
        { key: 'leadScore', label: 'Lead Score', sortable: true },
        { key: 'tags', label: 'Tags', render: (c: ContactProfile) => c.tags.join(', ') || 'N/A' },
        { key: 'segmentIds', label: 'Segments', render: (c: ContactProfile) => getSegmentNames(c.segmentIds) },
        { key: 'signUpDate', label: 'Signup Date', sortable: true, render: (c: ContactProfile) => formatDate(c.signUpDate).split(',')[0] },
        {
            key: 'actions',
            label: 'Actions',
            render: (c: ContactProfile) => (
                <button onClick={() => handleDeleteContact(c.id)} className="text-red-500 hover:text-red-400"><IconDelete /></button>
            )
        },
    ], [getSegmentNames]);

    return (
        <Card title="Contact Database">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            <ExportedTable
                data={paginatedContacts}
                columns={contactColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                onSort={handleSort}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.contacts}
            />
        </Card>
    );
};

// --- SYSTEM & AUDIT LOGS (to be exported) ---

/**
 * @function ExportedNotificationCenter
 * @description Displays a list of system notifications.
 */
export const ExportedNotificationCenter: React.FC = () => {
    const { notifications, loadingState, markNotificationAsRead } = useMarketingAutomation();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey] = useState('timestamp');
    const [sortDirection] = useState<'desc' | 'asc'>('desc');
    const [filterRead, setFilterRead] = useState<'all' | 'unread'>('unread');

    const filteredNotifications = useMemo(() => {
        let sorted = [...notifications];
        // Sort by timestamp desc by default
        sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (filterRead === 'unread') {
            sorted = sorted.filter(n => !n.read);
        }
        return sorted;
    }, [notifications, filterRead]);

    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredNotifications.slice(startIndex, startIndex + pageSize);
    }, [filteredNotifications, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredNotifications.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredNotifications.length };

    const handlePageChange = (page: number) => setCurrentPage(page);

    const notificationColumns = useMemo(() => [
        {
            key: 'read', label: 'Status', render: (n: Notification) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${n.read ? 'bg-gray-600 text-gray-300' : 'bg-blue-600 text-white'}`}>
                    {n.read ? 'Read' : 'New'}
                </span>
            )
        },
        {
            key: 'type', label: 'Type', render: (n: Notification) => (
                <span className={`capitalize ${n.type === 'error' ? 'text-red-400' : n.type === 'warning' ? 'text-yellow-400' : n.type === 'success' ? 'text-green-400' : 'text-cyan-400'}`}>
                    {n.type}
                </span>
            )
        },
        { key: 'message', label: 'Message' },
        { key: 'timestamp', label: 'Time', render: (n: Notification) => formatDate(n.timestamp) },
        {
            key: 'actions',
            label: 'Actions',
            render: (n: Notification) => (
                <div className="flex space-x-2">
                    {!n.read && (
                        <button onClick={() => markNotificationAsRead(n.id)} className="text-green-500 hover:text-green-400">Mark as Read</button>
                    )}
                    {n.link && (
                        <a href={n.link} className="text-blue-500 hover:text-blue-400">View</a>
                    )}
                </div>
            )
        },
    ], [markNotificationAsRead]);

    return (
        <Card title="Notification Center">
            <div className="mb-4 flex justify-between items-center">
                <div className="space-x-2">
                    <button
                        onClick={() => setFilterRead('all')}
                        className={`px-3 py-1 rounded-md text-sm ${filterRead === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterRead('unread')}
                        className={`px-3 py-1 rounded-md text-sm ${filterRead === 'unread' ? 'bg-cyan-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'}`}
                    >
                        Unread ({notifications.filter(n => !n.read).length})
                    </button>
                </div>
            </div>
            <ExportedTable
                data={paginatedNotifications}
                columns={notificationColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                currentSortKey={sortKey} // Sort is fixed by timestamp
                sortDirection={sortDirection}
                isLoading={loadingState.notifications}
            />
        </Card>
    );
};

/**
 * @function ExportedAuditLog
 * @description Displays system audit logs.
 */
export const ExportedAuditLog: React.FC = () => {
    const { auditLogs, loadingState } = useMarketingAutomation();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortKey] = useState('timestamp');
    const [sortDirection] = useState<'desc' | 'asc'>('desc'); // Always sort by newest first
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        let sorted = [...auditLogs];
        // Sort by timestamp desc by default
        sorted.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (searchTerm) {
            sorted = sorted.filter(log =>
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.userId.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return sorted;
    }, [auditLogs, searchTerm]);

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredLogs.slice(startIndex, startIndex + pageSize);
    }, [filteredLogs, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredLogs.length / pageSize);
    const pagination: Pagination = { currentPage, totalPages, pageSize, totalItems: filteredLogs.length };

    const handlePageChange = (page: number) => setCurrentPage(page);

    const auditLogColumns = useMemo(() => [
        { key: 'timestamp', label: 'Time', render: (log: AuditLogEntry) => formatDate(log.timestamp) },
        { key: 'userId', label: 'User' },
        { key: 'action', label: 'Action' },
        { key: 'resourceType', label: 'Resource Type' },
        { key: 'resourceId', label: 'Resource ID' },
        {
            key: 'changes', label: 'Changes', render: (log: AuditLogEntry) =>
                log.changes ? (
                    <span className="text-gray-400 hover:text-white cursor-pointer" title={JSON.stringify(log.changes, null, 2)}>
                        View Details
                    </span>
                ) : 'N/A'
        },
    ], []);

    return (
        <Card title="Audit Log">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="p-2 rounded bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            <ExportedTable
                data={paginatedLogs}
                columns={auditLogColumns}
                keyField="id"
                pagination={pagination}
                onPageChange={handlePageChange}
                currentSortKey={sortKey}
                sortDirection={sortDirection}
                isLoading={loadingState.auditLogs}
            />
        </Card>
    );
};

// --- MAIN MARKETING AUTOMATION VIEW (Original Component Expanded) ---
// The original MarketingAutomationView now integrates all the new features and sub-components.

const MarketingAutomationView: React.FC = () => {
    // Original DataContext, now supplemented by MarketingAutomationInternalContext
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("MarketingAutomationView must be within DataProvider");

    const { marketingCampaigns: oldMarketingCampaigns } = dataContext; // Original campaigns
    const { campaigns, loadingState, addOrUpdateCampaign, fetchCampaigns } = useMarketingAutomation(); // New data hook

    const [isCopyModalOpen, setCopyModalOpen] = useState(false);
    const [productDesc, setProductDesc] = useState("Our new AI-powered savings tool");
    const [adCopy, setAdCopy] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false); // Renamed to avoid conflict with shared loadingState

    // State for managing active tab/view
    const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'segments' | 'workflows' | 'emails' | 'social' | 'abtests' | 'contacts' | 'notifications' | 'audit'>('overview');

    const kpiData = useMemo(() => {
        // Use new campaigns data for comprehensive KPIs
        const totalLeads = campaigns.reduce((sum, c) => sum + (c.analytics?.conversions || 0), 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenueGenerated, 0);
        const totalCost = campaigns.reduce((sum, c) => sum + c.cost, 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + (c.analytics?.impressions || 0), 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + (c.analytics?.clicks || 0), 0);

        const roas = totalCost > 0 ? (totalRevenue / totalCost) : 0;
        const cpl = totalLeads > 0 ? (totalCost / totalLeads) : 0;
        const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

        return {
            leads: totalLeads,
            conversionRate: roas, // Using ROAS as conversion rate here for overall performance.
            cpc: cpl, // Using CPL for overall cost per lead.
            ctr: ctr,
        };
    }, [campaigns]);

    const handleGenerateCopy = async (prompt: string) => {
        setIsLoadingAI(true); setAdCopy('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Switched to 1.5-flash for potential robustness
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAdCopy(response.text());
        } catch (err) {
            console.error("AI Generation Error:", err);
            setAdCopy('Failed to generate copy. Please try again or check your API key/network connection.');
        } finally {
            setIsLoadingAI(false);
        }
    };

    const overviewCampaignChartData = useMemo(() => {
        // Aggregate campaigns by channel for a different view
        const channelDataMap = new Map<string, { name: string; revenue: number; cost: number; leads: number }>();
        campaigns.forEach(c => {
            const channel = c.channel || 'Other';
            if (!channelDataMap.has(channel)) {
                channelDataMap.set(channel, { name: channel, revenue: 0, cost: 0, leads: 0 });
            }
            const current = channelDataMap.get(channel)!;
            current.revenue += c.revenueGenerated;
            current.cost += c.cost;
            current.leads += (c.analytics?.conversions || 0);
        });
        return Array.from(channelDataMap.values());
    }, [campaigns]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0'];
    const statusPieData = useMemo(() => {
        const statusCounts = campaigns.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(statusCounts).map(([status, count]) => ({
            name: status,
            value: count,
        }));
    }, [campaigns]);


    return (
        <MarketingAutomationProvider>
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Marketing Automation Dashboard</h2>
                    <div className="flex space-x-3">
                        <button onClick={() => setCopyModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center space-x-2">
                            <IconLightBulb /> <span>AI Content Generator</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Overview
                        </button>
                        <button onClick={() => setActiveTab('campaigns')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'campaigns' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Campaigns
                        </button>
                        <button onClick={() => setActiveTab('segments')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'segments' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Audiences
                        </button>
                        <button onClick={() => setActiveTab('workflows')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'workflows' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Workflows
                        </button>
                        <button onClick={() => setActiveTab('emails')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'emails' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Email Marketing
                        </button>
                        <button onClick={() => setActiveTab('social')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'social' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Social Media
                        </button>
                        <button onClick={() => setActiveTab('abtests')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'abtests' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            A/B Testing
                        </button>
                        <button onClick={() => setActiveTab('contacts')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'contacts' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Contacts
                        </button>
                        <button onClick={() => setActiveTab('notifications')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                            Notifications
                        </button>
                        <button onClick={() => setActiveTab('audit')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'audit' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-