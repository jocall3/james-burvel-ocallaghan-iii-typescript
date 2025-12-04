import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA
// ================================================================================================

export type FeedbackStatus = 'New' | 'Under Review' | 'Planned' | 'Shipped' | 'Archived' | 'Rejected';
export type FeedbackPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type UserRole = 'Admin' | 'Moderator' | 'Member' | 'Guest';

export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    role: UserRole;
    lastActive: string; // ISO date string
}

export interface Tag {
    id: string;
    name: string;
    color: string; // Tailwind color class or hex
    description?: string;
}

export interface Comment {
    id: string;
    userId: string;
    text: string;
    timestamp: string; // ISO date string
    parentId?: string; // For replies
    mentions?: string[]; // User IDs mentioned
    reactions?: { emoji: string; userId: string[] }[];
}

export interface Attachment {
    id: string;
    filename: string;
    filetype: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string; // ISO date string
    thumbnailUrl?: string;
}

export type ActivityType = 'created' | 'status_changed' | 'assigned' | 'priority_changed' | 'commented' | 'voted' | 'tag_added' | 'tag_removed' | 'attachment_added' | 'edited';

export interface ActivityLogEntry {
    id: string;
    feedbackId: string;
    userId: string;
    timestamp: string; // ISO date string
    type: ActivityType;
    details: string; // e.g., "changed status from New to Under Review"
    oldValue?: string;
    newValue?: string;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    feedbackIds: string[]; // Link to related feedback items
    status: 'Upcoming' | 'In Progress' | 'Completed' | 'On Hold';
    ownerId: string; // User ID
    productArea: string;
    keyMetrics?: string[]; // e.g., "Increased user engagement by 15%"
}

export interface FeedbackItem {
    id: string;
    title: string;
    description: string;
    submitterId: string;
    votes: number;
    status: FeedbackStatus;
    priority: FeedbackPriority;
    tags: string[]; // Tag IDs
    assignedToId?: string; // User ID of assignee
    comments: Comment[];
    attachments: Attachment[];
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    lastActivityAt: string; // ISO date string
    resolutionNotes?: string; // For Shipped/Rejected/Archived
}

export interface AnalyticsData {
    feedbackByStatus: { [key: string]: number };
    topTags: { tagId: string; count: number }[];
    feedbackVelocity: { date: string; new: number; shipped: number }[];
    sentimentDistribution: { positive: number; negative: number; neutral: number };
}

// --- MOCK USERS ---
export const MOCK_USERS: User[] = [
    { id: 'user123', name: 'Alice Smith', email: 'alice@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=1', role: 'Member', lastActive: '2023-10-26T10:00:00Z' },
    { id: 'user456', name: 'Bob Johnson', email: 'bob@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=2', role: 'Member', lastActive: '2023-10-26T10:05:00Z' },
    { id: 'user789', name: 'Charlie Brown', email: 'charlie@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=3', role: 'Member', lastActive: '2023-10-26T09:45:00Z' },
    { id: 'dev_team_lead', name: 'Dev Lead', email: 'dev.lead@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=4', role: 'Admin', lastActive: '2023-10-26T10:30:00Z' },
    { id: 'prod_manager', name: 'Product Manager', email: 'pm@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=5', role: 'Moderator', lastActive: '2023-10-26T11:00:00Z' },
    { id: 'user321', name: 'Diana Prince', email: 'diana@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=6', role: 'Member', lastActive: '2023-10-26T08:30:00Z' },
    { id: 'user654', name: 'Eve Adams', email: 'eve@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=7', role: 'Member', lastActive: '2023-10-26T07:00:00Z' },
    { id: 'corp_user_1', name: 'Corporate User', email: 'corp@example.com', avatarUrl: 'https://i.pravatar.cc/150?img=8', role: 'Guest', lastActive: '2023-10-25T17:00:00Z' },
];

// --- MOCK TAGS ---
export const MOCK_TAGS: Tag[] = [
    { id: 'tag-uiux', name: 'UI/UX', color: 'bg-indigo-500/20 text-indigo-200' },
    { id: 'tag-mobile', name: 'Mobile', color: 'bg-green-500/20 text-green-200' },
    { id: 'tag-integration', name: 'Integration', color: 'bg-yellow-500/20 text-yellow-200' },
    { id: 'tag-taxes', name: 'Taxes', color: 'bg-red-500/20 text-red-200' },
    { id: 'tag-budgets', name: 'Budgets', color: 'bg-purple-500/20 text-purple-200' },
    { id: 'tag-feature', name: 'Feature Request', color: 'bg-blue-500/20 text-blue-200' },
    { id: 'tag-ai', name: 'AI', color: 'bg-pink-500/20 text-pink-200' },
    { id: 'tag-gamification', name: 'Gamification', color: 'bg-teal-500/20 text-teal-200' },
    { id: 'tag-goals', name: 'Goals', color: 'bg-orange-500/20 text-orange-200' },
    { id: 'tag-performance', name: 'Performance', color: 'bg-cyan-500/20 text-cyan-200' },
    { id: 'tag-bug', name: 'Bug', color: 'bg-red-700/20 text-red-300' },
    { id: 'tag-security', name: 'Security', color: 'bg-gray-600/20 text-gray-300' },
];

// Helper to get user and tag details by ID
export const getUserById = (id: string) => MOCK_USERS.find(u => u.id === id);
export const getTagById = (id: string) => MOCK_TAGS.find(t => t.id === id);

// --- MOCK FEEDBACK ITEMS ---
export const MOCK_FEEDBACK_ITEMS: FeedbackItem[] = [
    {
        id: 'FB-1', title: 'Dark Mode for Mobile App', description: 'The web app has a great dark mode, but the mobile app is still light. It would be great to have consistency and reduce eye strain, especially at night.', submitterId: 'user123', votes: 152, status: 'Planned', tags: ['tag-uiux', 'tag-mobile', 'tag-feature'], assignedToId: 'prod_manager', priority: 'High',
        comments: [
            { id: 'c1', userId: 'dev_team_lead', text: 'Good suggestion. Slated for Q4 release. We need to define design specs for both iOS and Android.', timestamp: '2023-10-20T10:00:00Z' },
            { id: 'c2', userId: 'user123', text: 'Awesome! Glad to hear this is coming.', timestamp: '2023-10-20T11:00:00Z', parentId: 'c1' },
        ],
        attachments: [], createdAt: '2023-10-15T09:00:00Z', updatedAt: '2023-10-20T11:00:00Z', lastActivityAt: '2023-10-20T11:00:00Z'
    },
    {
        id: 'FB-2', title: 'Integrate with TaxBot Pro', description: 'I use TaxBot Pro for my taxes, and a direct integration would save me hours of manual data entry. CSV export is clunky for complex portfolios.', submitterId: 'user456', votes: 98, status: 'Under Review', tags: ['tag-integration', 'tag-taxes', 'tag-feature'], assignedToId: 'dev_team_lead', priority: 'Medium',
        comments: [
            { id: 'c3', userId: 'prod_manager', text: 'We\'re exploring partner APIs for this. TaxBot Pro is a common request.', timestamp: '2023-10-22T14:30:00Z' }
        ],
        attachments: [{ id: 'a1', filename: 'taxbot-export-example.csv', filetype: 'text/csv', url: '/mock-attachments/taxbot.csv', uploadedBy: 'user456', uploadedAt: '2023-10-18T16:00:00Z' }], createdAt: '2023-10-18T10:00:00Z', updatedAt: '2023-10-22T14:30:00Z', lastActivityAt: '2023-10-22T14:30:00Z'
    },
    {
        id: 'FB-3', title: 'More granular budget categories', description: 'I would like to create sub-categories for my budgets, like "Groceries > Farmer\'s Market" or "Dining Out > Fast Food". This helps me track spending more precisely.', submitterId: 'user789', votes: 210, status: 'New', tags: ['tag-budgets', 'tag-feature', 'tag-uiux'], priority: 'High',
        comments: [], attachments: [], createdAt: '2023-10-25T11:00:00Z', updatedAt: '2023-10-25T11:00:00Z', lastActivityAt: '2023-10-25T11:00:00Z'
    },
    {
        id: 'FB-4', title: 'AI Ad Studio Video Length', description: 'Can we have options for longer videos? Currently limited to 15s. 30 seconds would be great for platform ads like YouTube pre-rolls or longer Instagram stories.', submitterId: 'corp_user_1', votes: 75, status: 'New', tags: ['tag-ai', 'tag-feature'], assignedToId: 'prod_manager', priority: 'Medium',
        comments: [
            { id: 'c4', userId: 'prod_manager', text: '@dev_team_lead - feasibility check on extending video generation for AI Studio?', timestamp: '2023-10-26T09:00:00Z', mentions: ['dev_team_lead'] }
        ],
        attachments: [], createdAt: '2023-10-24T14:00:00Z', updatedAt: '2023-10-26T09:00:00Z', lastActivityAt: '2023-10-26T09:00:00Z'
    },
    {
        id: 'FB-5', title: 'Gamify savings goals', description: 'It would be cool to get badges or achievements for hitting savings milestones, like "First $1000 Saved" or "Consistent Saver for 3 Months".', submitterId: 'user321', votes: 180, status: 'Planned', tags: ['tag-gamification', 'tag-goals', 'tag-feature'], assignedToId: 'prod_manager', priority: 'High',
        comments: [{ id: 'c5', userId: 'prod_manager', text: 'Great idea for engagement! Looking into design concepts for this. ✨', timestamp: '2023-10-23T10:00:00Z' }],
        attachments: [], createdAt: '2023-10-21T08:00:00Z', updatedAt: '2023-10-23T10:00:00Z', lastActivityAt: '2023-10-23T10:00:00Z'
    },
    {
        id: 'FB-6', title: 'CSV Transaction Export', description: 'The transaction view is great, but I need to export my data to CSV for my accountant. The current PDF export is not machine-readable.', submitterId: 'user654', votes: 120, status: 'Shipped', tags: ['tag-feature', 'tag-taxes'], priority: 'Medium',
        comments: [{ id: 'c6', userId: 'dev_team_lead', text: 'This was shipped in v2.10.1! You can find the option under "Settings -> Data Export".', timestamp: '2023-10-10T15:00:00Z' }],
        attachments: [], createdAt: '2023-10-01T09:00:00Z', updatedAt: '2023-10-10T15:00:00Z', lastActivityAt: '2023-10-10T15:00:00Z', resolutionNotes: 'Implemented in version 2.10.1. Users can now export transactions directly to CSV.'
    },
    {
        id: 'FB-7', title: 'Performance Degradation on Dashboard', description: 'My dashboard is very slow to load when I have many widgets. It takes upwards of 10-15 seconds.', submitterId: 'user123', votes: 85, status: 'Under Review', tags: ['tag-performance', 'tag-bug'], assignedToId: 'dev_team_lead', priority: 'Critical',
        comments: [{ id: 'c7', userId: 'dev_team_lead', text: 'Thanks for reporting. We\'re investigating. Can you provide browser/OS details?', timestamp: '2023-10-26T10:00:00Z' }],
        attachments: [], createdAt: '2023-10-25T16:00:00Z', updatedAt: '2023-10-26T10:00:00Z', lastActivityAt: '2023-10-26T10:00:00Z'
    },
    {
        id: 'FB-8', title: 'Add QR Code Scanner for Receipts', description: 'It would be amazing to scan physical receipts directly into the app and have it parse the transaction details.', submitterId: 'user789', votes: 190, status: 'New', tags: ['tag-feature', 'tag-mobile', 'tag-ai'], priority: 'High',
        comments: [], attachments: [], createdAt: '2023-10-26T08:00:00Z', updatedAt: '2023-10-26T08:00:00Z', lastActivityAt: '2023-10-26T08:00:00Z'
    },
    {
        id: 'FB-9', title: 'Two-Factor Authentication (2FA) for Login', description: 'For better security, please implement 2FA using TOTP apps like Authy or Google Authenticator.', submitterId: 'user321', votes: 250, status: 'Planned', tags: ['tag-security', 'tag-feature'], assignedToId: 'dev_team_lead', priority: 'Critical',
        comments: [{ id: 'c8', userId: 'dev_team_lead', text: 'This is a high priority item on our security roadmap for Q1 next year.', timestamp: '2023-10-24T12:00:00Z' }],
        attachments: [], createdAt: '2023-10-20T10:00:00Z', updatedAt: '2023-10-24T12:00:00Z', lastActivityAt: '2023-10-24T12:00:00Z'
    },
    {
        id: 'FB-10', title: 'Refactor UI to use new component library', description: 'The current UI is inconsistent. We need to refactor it to use the new internal component library across all views.', submitterId: 'prod_manager', votes: 50, status: 'Archived', tags: ['tag-uiux', 'tag-performance'], assignedToId: 'dev_team_lead', priority: 'High',
        comments: [{ id: 'c9', userId: 'dev_team_lead', text: 'This has been completed as part of Project Phoenix.', timestamp: '2023-09-30T17:00:00Z' }],
        attachments: [], createdAt: '2023-09-01T09:00:00Z', updatedAt: '2023-09-30T17:00:00Z', lastActivityAt: '2023-09-30T17:00:00Z', resolutionNotes: 'UI refactor completed. Archiving this feedback item.'
    },
];

// --- MOCK ACTIVITY LOGS ---
export const MOCK_ACTIVITY_LOGS: ActivityLogEntry[] = [
    { id: 'al-1', feedbackId: 'FB-1', userId: 'user123', timestamp: '2023-10-15T09:00:00Z', type: 'created', details: 'Feedback item created' },
    { id: 'al-2', feedbackId: 'FB-1', userId: 'dev_team_lead', timestamp: '2023-10-20T10:00:00Z', type: 'commented', details: 'Added comment: "Good suggestion. Slated for Q4 release. We need to define design specs for both iOS and Android."' },
    { id: 'al-3', feedbackId: 'FB-1', userId: 'prod_manager', timestamp: '2023-10-20T10:30:00Z', type: 'status_changed', details: 'Changed status from New to Planned', oldValue: 'New', newValue: 'Planned' },
    { id: 'al-4', feedbackId: 'FB-1', userId: 'prod_manager', timestamp: '2023-10-20T10:35:00Z', type: 'assigned', details: 'Assigned to Product Manager', newValue: 'prod_manager' },
    { id: 'al-5', feedbackId: 'FB-1', userId: 'user123', timestamp: '2023-10-20T11:00:00Z', type: 'commented', details: 'Added comment: "Awesome! Glad to hear this is coming."' },

    { id: 'al-6', feedbackId: 'FB-2', userId: 'user456', timestamp: '2023-10-18T10:00:00Z', type: 'created', details: 'Feedback item created' },
    { id: 'al-7', feedbackId: 'FB-2', userId: 'user456', timestamp: '2023-10-18T16:00:00Z', type: 'attachment_added', details: 'Added attachment: taxbot-export-example.csv' },
    { id: 'al-8', feedbackId: 'FB-2', userId: 'prod_manager', timestamp: '2023-10-22T14:00:00Z', type: 'status_changed', details: 'Changed status from New to Under Review', oldValue: 'New', newValue: 'Under Review' },
    { id: 'al-9', feedbackId: 'FB-2', userId: 'prod_manager', timestamp: '2023-10-22T14:30:00Z', type: 'commented', details: 'Added comment: "We\'re exploring partner APIs for this. TaxBot Pro is a common request."' },

    { id: 'al-10', feedbackId: 'FB-3', userId: 'user789', timestamp: '2023-10-25T11:00:00Z', type: 'created', details: 'Feedback item created' },
    { id: 'al-11', feedbackId: 'FB-3', userId: 'user789', timestamp: '2023-10-25T11:05:00Z', type: 'voted', details: 'Voted on item' },
    { id: 'al-12', feedbackId: 'FB-3', userId: 'user123', timestamp: '2023-10-25T12:00:00Z', type: 'voted', details: 'Voted on item' },

    { id: 'al-13', feedbackId: 'FB-4', userId: 'corp_user_1', timestamp: '2023-10-24T14:00:00Z', type: 'created', details: 'Feedback item created' },
    { id: 'al-14', feedbackId: 'FB-4', userId: 'prod_manager', timestamp: '2023-10-26T09:00:00Z', type: 'commented', details: 'Added comment: "@dev_team_lead - feasibility check on extending video generation for AI Studio?"' },

    { id: 'al-15', feedbackId: 'FB-6', userId: 'user654', timestamp: '2023-10-01T09:00:00Z', type: 'created', details: 'Feedback item created' },
    { id: 'al-16', feedbackId: 'FB-6', userId: 'dev_team_lead', timestamp: '2023-10-10T15:00:00Z', type: 'status_changed', details: 'Changed status from New to Shipped', oldValue: 'New', newValue: 'Shipped' },
    { id: 'al-17', feedbackId: 'FB-6', userId: 'dev_team_lead', timestamp: '2023-10-10T15:05:00Z', type: 'commented', details: 'Added comment: "This was shipped in v2.10.1! You can find the option under \'Settings -> Data Export\'."' },

    { id: 'al-18', feedbackId: 'FB-7', userId: 'user123', timestamp: '2023-10-25T16:00:00Z', type: 'created', details: 'Feedback item created' },
    { id: 'al-19', feedbackId: 'FB-7', userId: 'dev_team_lead', timestamp: '2023-10-26T10:00:00Z', type: 'commented', details: 'Added comment: "Thanks for reporting. We\'re investigating. Can you provide browser/OS details?"' },
    { id: 'al-20', feedbackId: 'FB-7', userId: 'dev_team_lead', timestamp: '2023-10-26T10:05:00Z', type: 'status_changed', details: 'Changed status from New to Under Review', oldValue: 'New', newValue: 'Under Review' },
];

// --- MOCK ROADMAP ITEMS ---
export const MOCK_ROADMAP_ITEMS: RoadmapItem[] = [
    {
        id: 'RM-1', title: 'Mobile Dark Mode Release', description: 'Rollout of a consistent dark mode theme for both iOS and Android applications to enhance user experience during low-light conditions.',
        startDate: '2023-11-01T00:00:00Z', endDate: '2023-11-30T23:59:59Z', feedbackIds: ['FB-1'], status: 'In Progress', ownerId: 'prod_manager', productArea: 'Mobile App', keyMetrics: ['95% design consistency compliance', '20% increase in evening session duration']
    },
    {
        id: 'RM-2', title: 'Tax Integration with TaxBot Pro', description: 'Develop and deploy a direct API integration with TaxBot Pro for seamless data synchronization.',
        startDate: '2024-01-15T00:00:00Z', endDate: '2024-03-31T23:59:59Z', feedbackIds: ['FB-2'], status: 'Upcoming', ownerId: 'dev_team_lead', productArea: 'Integrations', keyMetrics: ['Reduce manual data entry support tickets by 30%', 'Achieve 4-star average user rating for integration']
    },
    {
        id: 'RM-3', title: 'Gamified Savings System', description: 'Introduce a badge and achievement system to encourage users to meet their financial savings goals.',
        startDate: '2023-12-01T00:00:00Z', endDate: '2024-01-15T23:59:59Z', feedbackIds: ['FB-5'], status: 'Planned', ownerId: 'prod_manager', productArea: 'Engagement', keyMetrics: ['10% increase in active savings goals', '5% increase in retention rate for new users']
    },
    {
        id: 'RM-4', title: 'Core Dashboard Performance Boost', description: 'Optimize database queries, frontend rendering, and API response times to improve dashboard loading speed significantly.',
        startDate: '2023-11-15T00:00:00Z', endDate: '2024-01-31T23:59:59Z', feedbackIds: ['FB-7'], status: 'In Progress', ownerId: 'dev_team_lead', productArea: 'Platform Core', keyMetrics: ['Dashboard load time < 3 seconds', 'Reduce average API response time by 50ms']
    },
];

export const COLUMNS: FeedbackStatus[] = ['New', 'Under Review', 'Planned', 'Shipped', 'Archived', 'Rejected'];
export const PRIORITIES: FeedbackPriority[] = ['Critical', 'High', 'Medium', 'Low'];

// ================================================================================================
// UTILITY FUNCTIONS & HOOKS
// ================================================================================================

export const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const timeAgo = (isoString: string) => {
    if (!isoString) return 'N/A';
    const seconds = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export const useUniqueId = (prefix: string = 'id-') => {
    const [id] = useState(() => `${prefix}${Math.random().toString(36).substr(2, 9)}`);
    return id;
};

export const useAIIntegration = () => {
    const [aiClient] = useState(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }));

    const analyzeSentiment = useCallback(async (title: string, description: string) => {
        try {
            const prompt = `Analyze the sentiment of this user feedback. Is it Positive, Negative, or Neutral? Provide a confidence score from 0 to 1. ONLY respond with JSON in the format: {"sentiment": "SentimentValue", "confidence": 0.X}. Feedback: "${title}. ${description}"`;
            const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim()); // Clean markdown code blocks
            return { sentiment: parsed.sentiment, confidence: parseFloat(parsed.confidence) * 100 };
        } catch (err) {
            console.error("AI Sentiment analysis failed:", err);
            return { sentiment: 'Neutral', confidence: 50 };
        }
    }, [aiClient]);

    const generateResponse = useCallback(async (feedback: FeedbackItem, context: string) => {
        try {
            const prompt = `Given the user feedback and current context, generate a helpful and empathetic response from a product team member. The response should be concise and address the user's main point.
Feedback Title: ${feedback.title}
Feedback Description: ${feedback.description}
Current Status: ${feedback.status}
Context: ${context}
Proposed Response:`;
            const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            console.error("AI Response generation failed:", err);
            return "Apologies, I'm having trouble generating a response right now. Please try again later.";
        }
    }, [aiClient]);

    const suggestTags = useCallback(async (title: string, description: string) => {
        try {
            const currentTags = MOCK_TAGS.map(t => t.name).join(', ');
            const prompt = `Based on the following feedback, suggest up to 3 relevant tags from this list: ${currentTags}. Return tags as a comma-separated string, e.g., "UI/UX, Mobile".
Feedback Title: ${title}
Feedback Description: ${description}
Suggested Tags:`;
            const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            return text.split(',').map(tag => tag.trim()).filter(tag => MOCK_TAGS.some(t => t.name === tag));
        } catch (err) {
            console.error("AI Tag suggestion failed:", err);
            return [];
        }
    }, [aiClient]);

    const summarizeFeedback = useCallback(async (feedback: FeedbackItem) => {
        try {
            const prompt = `Summarize the following feedback item, including its title, description, and the main points from its comments. Keep the summary under 100 words.
Feedback Title: ${feedback.title}
Description: ${feedback.description}
Comments: ${feedback.comments.map(c => `${getUserById(c.userId)?.name}: ${c.text}`).join('; ')}
Summary:`;
            const model = aiClient.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            console.error("AI Summarization failed:", err);
            return "Could not generate summary.";
        }
    }, [aiClient]);

    return { analyzeSentiment, generateResponse, suggestTags, summarizeFeedback };
};

// ================================================================================================
// SHARED UI COMPONENTS (e.g., Avatar, TagPill, Button)
// ================================================================================================

export const Avatar: React.FC<{ user: User; size?: 'sm' | 'md' | 'lg' }> = ({ user, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base',
    };
    return (
        <img
            src={user.avatarUrl}
            alt={user.name}
            title={user.name}
            className={`rounded-full object-cover ${sizeClasses[size]}`}
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=334155&color=fff&size=128`;
            }}
        />
    );
};

export const TagPill: React.FC<{ tagId: string; onRemove?: (tagId: string) => void; interactive?: boolean }> = ({ tagId, onRemove, interactive = false }) => {
    const tag = getTagById(tagId);
    if (!tag) return null;
    return (
        <span className={`${tag.color} px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1`}>
            {tag.name}
            {interactive && onRemove && (
                <button onClick={() => onRemove(tagId)} className="ml-1 -mr-1 text-white/70 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; loading?: boolean }> = ({
    children, variant = 'primary', size = 'md', loading = false, className = '', ...props
}) => {
    const baseClasses = "font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
    const variantClasses = {
        primary: "bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500",
        secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        ghost: "text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-gray-500"
    };
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-2.5 text-lg"
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : children}
        </button>
    );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" {...props} />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500" {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px]" {...props} />
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl ${sizeClasses[size]} w-full border border-gray-700`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// SUB-COMPONENTS (Detailed)
// ================================================================================================

export const CommentSection: React.FC<{ comments: Comment[]; feedbackId: string; currentUserId: string; onAddComment: (feedbackId: string, userId: string, text: string, parentId?: string) => void }> = ({ comments, feedbackId, currentUserId, onAddComment }) => {
    const [newCommentText, setNewCommentText] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null); // Comment ID being replied to

    const handleAddComment = () => {
        if (newCommentText.trim()) {
            onAddComment(feedbackId, currentUserId, newCommentText, replyTo || undefined);
            setNewCommentText('');
            setReplyTo(null);
        }
    };

    const rootComments = comments.filter(c => !c.parentId);

    const renderComment = (comment: Comment) => {
        const user = getUserById(comment.userId);
        const replies = comments.filter(c => c.parentId === comment.id);

        return (
            <div key={comment.id} className={`flex gap-3 ${comment.parentId ? 'ml-8 mt-4' : 'mt-4'}`}>
                {user && <Avatar user={user} size="sm" />}
                <div className="flex-1 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-200">{user?.name || 'Unknown User'}</span>
                        <span className="text-xs text-gray-500">{timeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {comment.text.split(' ').map((word, index) => {
                            if (word.startsWith('@') && MOCK_USERS.some(u => u.name.toLowerCase().replace(/\s/g, '') === word.substring(1).toLowerCase())) {
                                const mentionedUser = MOCK_USERS.find(u => u.name.toLowerCase().replace(/\s/g, '') === word.substring(1).toLowerCase());
                                return <span key={index} className="text-cyan-400 font-medium cursor-pointer hover:underline">@{mentionedUser?.name || word.substring(1)} </span>;
                            }
                            return <span key={index}>{word} </span>;
                        })}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                        <Button variant="ghost" size="sm" onClick={() => setReplyTo(comment.id)} className="p-1">Reply</Button>
                    </div>
                    {replies.map(renderComment)}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h4 className="font-semibold text-gray-200 border-t border-gray-700 pt-4 mt-6">Comments ({comments.length})</h4>
            <div className="max-h-60 overflow-y-auto pr-2">
                {rootComments.length > 0 ? (
                    rootComments.map(renderComment)
                ) : (
                    <p className="text-sm text-gray-500 mt-4">No comments yet. Be the first to add one!</p>
                )}
            </div>
            <div className="mt-4 border-t border-gray-700 pt-4">
                {replyTo && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                        Replying to {getUserById(comments.find(c => c.id === replyTo)?.userId || '')?.name}
                        <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="p-1 text-red-400">Cancel</Button>
                    </div>
                )}
                <Textarea
                    placeholder={replyTo ? 'Add a reply...' : 'Add a new comment...'}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="mb-2"
                />
                <Button onClick={handleAddComment} disabled={!newCommentText.trim()}>Add Comment</Button>
            </div>
        </div>
    );
};

export const ActivityLog: React.FC<{ logs: ActivityLogEntry[] }> = ({ logs }) => {
    return (
        <div>
            <h4 className="font-semibold text-gray-200 border-t border-gray-700 pt-4 mt-6">Activity Log ({logs.length})</h4>
            <div className="max-h-60 overflow-y-auto pr-2 mt-4 space-y-3">
                {logs.length > 0 ? (
                    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => {
                        const user = getUserById(log.userId);
                        return (
                            <div key={log.id} className="flex items-start gap-3 text-sm text-gray-400">
                                {user && <Avatar user={user} size="sm" />}
                                <div className="flex-1">
                                    <span className="font-medium text-gray-200">{user?.name || 'Unknown'}</span> {' '}
                                    <span className="text-gray-300">{log.details}</span>
                                    <span className="text-gray-500 block text-xs">{formatDate(log.timestamp)}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-gray-500">No activity yet.</p>
                )}
            </div>
        </div>
    );
};

export const AttachmentDisplay: React.FC<{ attachments: Attachment[]; onRemove?: (attachmentId: string) => void }> = ({ attachments, onRemove }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploading(true);
            const file = event.target.files[0];
            // Simulate upload
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log(`Mock uploaded: ${file.name}`);
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Clear input
            // In a real app, you'd add this to feedback item state
        }
    };

    return (
        <div>
            <h4 className="font-semibold text-gray-200 border-t border-gray-700 pt-4 mt-6">Attachments ({attachments.length})</h4>
            <div className="mt-4 space-y-3">
                {attachments.length > 0 ? (
                    attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                {att.filename} ({Math.round(Math.random() * 1000) / 100} MB)
                            </a>
                            {onRemove && (
                                <Button variant="ghost" size="sm" onClick={() => onRemove(att.id)} className="text-red-400 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </Button>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No attachments.</p>
                )}
            </div>
            <div className="mt-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="attachment-upload-input"
                    disabled={uploading}
                />
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} loading={uploading}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Attachment
                </Button>
            </div>
        </div>
    );
};

export const AICoPilotPanel: React.FC<{ feedback: FeedbackItem }> = ({ feedback }) => {
    const { analyzeSentiment, generateResponse, suggestTags, summarizeFeedback } = useAIIntegration();
    const [aiSentiment, setAiSentiment] = useState<{ sentiment: string; confidence: number } | null>(null);
    const [responsePrompt, setResponsePrompt] = useState('');
    const [generatedResponse, setGeneratedResponse] = useState<string | null>(null);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
    const [summary, setSummary] = useState<string | null>(null);

    const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const handleAnalyzeSentiment = useCallback(async () => {
        setIsLoadingSentiment(true);
        const result = await analyzeSentiment(feedback.title, feedback.description);
        setAiSentiment(result);
        setIsLoadingSentiment(false);
    }, [analyzeSentiment, feedback.title, feedback.description]);

    const handleGenerateResponse = useCallback(async () => {
        setIsLoadingResponse(true);
        const result = await generateResponse(feedback, responsePrompt);
        setGeneratedResponse(result);
        setIsLoadingResponse(false);
    }, [generateResponse, feedback, responsePrompt]);

    const handleSuggestTags = useCallback(async () => {
        setIsLoadingTags(true);
        const result = await suggestTags(feedback.title, feedback.description);
        setSuggestedTags(result);
        setIsLoadingTags(false);
    }, [suggestTags, feedback.title, feedback.description]);

    const handleSummarizeFeedback = useCallback(async () => {
        setIsLoadingSummary(true);
        const result = await summarizeFeedback(feedback);
        setSummary(result);
        setIsLoadingSummary(false);
    }, [summarizeFeedback, feedback]);

    useEffect(() => {
        // Reset AI states when feedback changes
        setAiSentiment(null);
        setGeneratedResponse(null);
        setSuggestedTags([]);
        setSummary(null);
        setResponsePrompt('');
    }, [feedback.id]);

    return (
        <Card title="AI Co-pilot" className="space-y-4">
            <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-200">Sentiment Analysis</h5>
                {!aiSentiment && !isLoadingSentiment && <Button size="sm" variant="secondary" onClick={handleAnalyzeSentiment}>Analyze Sentiment</Button>}
                {isLoadingSentiment && <p className="text-sm text-gray-400">Analyzing...</p>}
                {aiSentiment && <p className="text-sm font-semibold" style={{ color: aiSentiment.sentiment === 'Positive' ? '#22c55e' : aiSentiment.sentiment === 'Negative' ? '#ef4444' : '#e5e7eb' }}>{aiSentiment.sentiment} ({aiSentiment.confidence.toFixed(0)}%)</p>}
            </div>

            <div className="space-y-2 border-t border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-200">Suggested Response</h5>
                <Textarea
                    placeholder="Provide context for the AI, e.g., 'User is asking for an ETA'"
                    value={responsePrompt}
                    onChange={(e) => setResponsePrompt(e.target.value)}
                    rows={2}
                />
                <Button size="sm" variant="secondary" onClick={handleGenerateResponse} loading={isLoadingResponse} disabled={!responsePrompt.trim()}>Generate Response</Button>
                {generatedResponse && (
                    <div className="bg-gray-700/50 p-3 rounded-md text-sm text-gray-300 whitespace-pre-wrap">
                        {generatedResponse}
                    </div>
                )}
            </div>

            <div className="space-y-2 border-t border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-200">Tag Suggestions</h5>
                {!suggestedTags.length && !isLoadingTags && <Button size="sm" variant="secondary" onClick={handleSuggestTags}>Suggest Tags</Button>}
                {isLoadingTags && <p className="text-sm text-gray-400">Suggesting...</p>}
                {suggestedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {suggestedTags.map(tagName => {
                            const tag = MOCK_TAGS.find(t => t.name === tagName);
                            return tag ? <TagPill key={tag.id} tagId={tag.id} /> : null;
                        })}
                    </div>
                )}
            </div>

            <div className="space-y-2 border-t border-gray-700 pt-4">
                <h5 className="text-sm font-medium text-gray-200">Feedback Summary</h5>
                {!summary && !isLoadingSummary && <Button size="sm" variant="secondary" onClick={handleSummarizeFeedback}>Summarize Feedback</Button>}
                {isLoadingSummary && <p className="text-sm text-gray-400">Summarizing...</p>}
                {summary && (
                    <div className="bg-gray-700/50 p-3 rounded-md text-sm text-gray-300 whitespace-pre-wrap">
                        {summary}
                    </div>
                )}
            </div>
        </Card>
    );
};

export const FeedbackDetailModal: React.FC<{ item: FeedbackItem | null; onClose: () => void; onUpdateItem: (updatedItem: FeedbackItem, activityLog: ActivityLogEntry) => void; onAddComment: (feedbackId: string, userId: string, text: string, parentId?: string) => void }> = ({ item, onClose, onUpdateItem, onAddComment }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'ai-copilot'>('details');
    const [editMode, setEditMode] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedStatus, setEditedStatus] = useState<FeedbackStatus>('New');
    const [editedPriority, setEditedPriority] = useState<FeedbackPriority>('Medium');
    const [editedAssignee, setEditedAssignee] = useState<string | undefined>(undefined);
    const [editedTags, setEditedTags] = useState<string[]>([]);

    useEffect(() => {
        if (item) {
            setEditedTitle(item.title);
            setEditedDescription(item.description);
            setEditedStatus(item.status);
            setEditedPriority(item.priority);
            setEditedAssignee(item.assignedToId);
            setEditedTags(item.tags);
        }
    }, [item]);

    if (!item) return null;

    const allLogsForThisItem = MOCK_ACTIVITY_LOGS.filter(log => log.feedbackId === item.id);
    const submitter = getUserById(item.submitterId);
    const assignee = item.assignedToId ? getUserById(item.assignedToId) : null;

    const handleSaveEdits = () => {
        const updatedItem = { ...item, title: editedTitle, description: editedDescription, status: editedStatus, priority: editedPriority, assignedToId: editedAssignee, tags: editedTags, updatedAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() };
        let activityDetails = '';
        let activityType: ActivityType = 'edited';
        if (item.status !== editedStatus) {
            activityDetails = `Changed status from ${item.status} to ${editedStatus}`;
            activityType = 'status_changed';
        } else if (item.priority !== editedPriority) {
            activityDetails = `Changed priority from ${item.priority} to ${editedPriority}`;
            activityType = 'priority_changed';
        } else if (item.assignedToId !== editedAssignee) {
            activityDetails = `Assigned to ${getUserById(editedAssignee || '')?.name || 'Unassigned'}`;
            activityType = 'assigned';
        } else if (item.tags.join(',') !== editedTags.join(',')) {
            activityDetails = `Tags updated: ${item.tags.map(t => getTagById(t)?.name).join(', ')} -> ${editedTags.map(t => getTagById(t)?.name).join(', ')}`;
            activityType = 'tag_added'; // or removed
        } else {
            activityDetails = 'Edited feedback details';
        }

        const newLog: ActivityLogEntry = {
            id: useUniqueId('al-'), feedbackId: item.id, userId: 'dev_team_lead', // Assume a current user for action
            timestamp: new Date().toISOString(), type: activityType, details: activityDetails
        };
        onUpdateItem(updatedItem, newLog);
        setEditMode(false);
    };

    const handleAddTag = (tagId: string) => {
        if (!editedTags.includes(tagId)) {
            setEditedTags(prev => [...prev, tagId]);
        }
    };

    const handleRemoveTag = (tagId: string) => {
        setEditedTags(prev => prev.filter(t => t !== tagId));
    };

    const handleVote = () => {
        const newVotes = item.votes + 1; // Simplified, in real app, track user votes
        const updatedItem = { ...item, votes: newVotes, lastActivityAt: new Date().toISOString() };
        const newLog: ActivityLogEntry = {
            id: useUniqueId('al-'), feedbackId: item.id, userId: 'user123', // Mock voter
            timestamp: new Date().toISOString(), type: 'voted', details: 'Voted on item'
        };
        onUpdateItem(updatedItem, newLog);
    };


    return (
        <Modal isOpen={item !== null} onClose={onClose} title={editMode ? `Edit: ${item.title}` : item.title} size="lg">
            <div className="grid grid-cols-4 gap-6">
                <div className="col-span-3">
                    <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-2xl font-bold text-white">{editMode ? <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} /> : item.title}</h3>
                        {submitter && <p className="text-sm text-gray-400">Submitted by <span className="font-semibold text-gray-300">{submitter.name}</span></p>}
                    </div>

                    <div className="border-b border-gray-700 mb-4">
                        <nav className="flex space-x-4">
                            {['details', 'comments', 'activity', 'ai-copilot'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`py-2 px-3 text-sm font-medium border-b-2 ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300 mb-4">{editMode ? <Textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} /> : item.description}</p>
                            <AttachmentDisplay attachments={item.attachments} onRemove={editMode ? (id) => console.log('Remove attachment', id) : undefined} />
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <CommentSection comments={item.comments} feedbackId={item.id} currentUserId={'dev_team_lead'} onAddComment={onAddComment} />
                    )}

                    {activeTab === 'activity' && (
                        <ActivityLog logs={allLogsForThisItem} />
                    )}

                    {activeTab === 'ai-copilot' && (
                        <AICoPilotPanel feedback={item} />
                    )}
                </div>

                <div className="col-span-1 space-y-4">
                    <Card title="Details">
                        <div className="text-xs space-y-2">
                            <p><strong className="text-gray-400">Votes:</strong> {item.votes} <Button variant="ghost" size="sm" onClick={handleVote} className="ml-2 p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg> Vote</Button></p>
                            <p><strong className="text-gray-400">Status:</strong> {editMode ? (
                                <Select value={editedStatus} onChange={(e) => setEditedStatus(e.target.value as FeedbackStatus)}>
                                    {COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                                </Select>
                            ) : item.status}</p>
                            <p><strong className="text-gray-400">Priority:</strong> {editMode ? (
                                <Select value={editedPriority} onChange={(e) => setEditedPriority(e.target.value as FeedbackPriority)}>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </Select>
                            ) : item.priority}</p>
                            <p className="flex items-center gap-2"><strong className="text-gray-400">Assigned To:</strong>
                                {editMode ? (
                                    <Select value={editedAssignee || ''} onChange={(e) => setEditedAssignee(e.target.value || undefined)}>
                                        <option value="">Unassigned</option>
                                        {MOCK_USERS.filter(u => ['Admin', 'Moderator'].includes(u.role)).map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </Select>
                                ) : (assignee ? <div className="flex items-center gap-1"><Avatar user={assignee} size="sm" /> {assignee.name}</div> : 'Unassigned')}</p>
                            <p><strong className="text-gray-400">Submitted:</strong> {formatDate(item.createdAt)}</p>
                            <p><strong className="text-gray-400">Last Activity:</strong> {timeAgo(item.lastActivityAt)}</p>
                            <div>
                                <strong className="text-gray-400">Tags:</strong>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {editedTags.map(tId => <TagPill key={tId} tagId={tId} interactive={editMode} onRemove={handleRemoveTag} />)}
                                    {editMode && (
                                        <Select className="text-xs p-1 h-fit" onChange={(e) => handleAddTag(e.target.value)} value="">
                                            <option value="" disabled>Add Tag...</option>
                                            {MOCK_TAGS.filter(t => !editedTags.includes(t.id)).map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </Select>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                            {!editMode ? (
                                <Button variant="secondary" onClick={() => setEditMode(true)}>Edit</Button>
                            ) : (
                                <>
                                    <Button variant="ghost" onClick={() => { setEditMode(false); }} className="text-gray-400">Cancel</Button>
                                    <Button onClick={handleSaveEdits}>Save Changes</Button>
                                </>
                            )}
                        </div>
                    </Card>
                    {item.resolutionNotes && (
                        <Card title="Resolution Notes">
                            <p className="text-sm text-gray-300 italic">{item.resolutionNotes}</p>
                        </Card>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export const FeedbackCardComponent: React.FC<{ item: FeedbackItem; onClick: (item: FeedbackItem) => void }> = React.memo(({ item, onClick }) => {
    const submitter = getUserById(item.submitterId);
    const assignee = item.assignedToId ? getUserById(item.assignedToId) : null;

    return (
        <div key={item.id} onClick={() => onClick(item)} className="p-3 bg-gray-800/80 rounded-lg cursor-pointer border border-gray-700 hover:border-cyan-500 transition-all duration-200 shadow-md">
            <p className="text-sm font-semibold text-gray-200 mb-2">{item.title}</p>
            <p className="text-xs text-gray-400 mb-2 truncate">{item.description}</p>
            <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.slice(0, 2).map(tId => <TagPill key={tId} tagId={tId} />)}
            </div>
            <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                        {item.votes}
                    </span>
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        {item.comments.length}
                    </span>
                    {item.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13.5" /></svg>
                            {item.attachments.length}
                        </span>
                    )}
                </div>
                {assignee && <Avatar user={assignee} size="sm" />}
                {!assignee && submitter && <Avatar user={submitter} size="sm" />}
            </div>
        </div>
    );
});

export const FeedbackSubmissionForm: React.FC<{ onSubmit: (item: Omit<FeedbackItem, 'id' | 'votes' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>) => void; onClose: () => void }> = ({ onSubmit, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [priority, setPriority] = useState<FeedbackPriority>('Medium');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            alert('Title and Description are required!');
            return;
        }
        setSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSubmit({
            title, description, submitterId: 'user123', // Mock current user
            status: 'New', priority, tags: selectedTags
        });
        setSubmitting(false);
        onClose();
    };

    const handleAddTag = (tagId: string) => {
        if (!selectedTags.includes(tagId)) {
            setSelectedTags(prev => [...prev, tagId]);
        }
    };

    const handleRemoveTag = (tagId: string) => {
        setSelectedTags(prev => prev.filter(t => t !== tagId));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your feedback" required />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed information, screenshots, use cases, etc." rows={5} required />
            </div>
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <Select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as FeedbackPriority)}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {selectedTags.map(tId => <TagPill key={tId} tagId={tId} interactive onRemove={handleRemoveTag} />)}
                    <Select className="text-xs p-1 h-fit" onChange={(e) => handleAddTag(e.target.value)} value="">
                        <option value="" disabled>Add Tag...</option>
                        {MOCK_TAGS.filter(t => !selectedTags.includes(t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </Select>
                </div>
            </div>
            {/* <AttachmentUpload /> // Could add a dedicated attachment upload component here */}
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                <Button type="submit" loading={submitting}>Submit Feedback</Button>
            </div>
        </form>
    );
};

export const KanbanBoard: React.FC<{ columnsData: { status: FeedbackStatus; items: FeedbackItem[] }[]; onCardClick: (item: FeedbackItem) => void }> = ({ columnsData, onCardClick }) => {
    // This component would ideally handle drag-and-drop, but for simplicity here we just render columns and cards.
    return (
        <div className="flex gap-6 overflow-x-auto p-2">
            {columnsData.map(column => (
                <div key={column.status} className="w-80 flex-shrink-0 bg-gray-900/50 rounded-lg p-3 shadow-xl">
                    <h3 className="font-semibold text-white mb-4 px-2 text-lg border-b border-gray-700 pb-2">{column.status} ({column.items.length})</h3>
                    <div className="space-y-3 h-[65vh] overflow-y-auto pr-2">
                        {column.items.length > 0 ? (
                            column.items.map(item => (
                                <FeedbackCardComponent key={item.id} item={item} onClick={onCardClick} />
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10">No feedback items in this column.</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export const RoadmapView: React.FC<{ roadmapItems: RoadmapItem[]; feedbackItems: FeedbackItem[] }> = ({ roadmapItems, feedbackItems }) => {
    const [selectedRoadmapItem, setSelectedRoadmapItem] = useState<RoadmapItem | null>(null);

    const getFeedbackTitles = (ids: string[]) => {
        return ids.map(id => feedbackItems.find(f => f.id === id)?.title).filter(Boolean).join(', ');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Product Roadmap</h3>
            <div className="bg-gray-900/50 p-6 rounded-lg shadow-xl">
                {roadmapItems.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No roadmap items defined.</div>
                ) : (
                    <div className="relative border-l-2 border-cyan-700 pl-6 space-y-8">
                        {roadmapItems.sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(item => {
                            const owner = getUserById(item.ownerId);
                            return (
                                <div key={item.id} className="relative group cursor-pointer" onClick={() => setSelectedRoadmapItem(item)}>
                                    <span className="absolute -left-8 top-1 w-4 h-4 bg-cyan-500 rounded-full border-2 border-gray-900 group-hover:scale-125 transition-transform duration-200"></span>
                                    <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:border-cyan-500 border border-gray-700 transition-all duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-lg text-white">{item.title}</h4>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'Completed' ? 'bg-green-500/20 text-green-200' : item.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-200' : 'bg-blue-500/20 text-blue-200'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <span>{formatDate(item.startDate).split(',')[0]} - {formatDate(item.endDate).split(',')[0]}</span>
                                            {owner && <div className="flex items-center gap-1"><Avatar user={owner} size="sm" /> {owner.name}</div>}
                                        </div>
                                        {item.feedbackIds.length > 0 && (
                                            <p className="text-xs text-gray-500 mt-2">Related Feedback: {getFeedbackTitles(item.feedbackIds)}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal isOpen={selectedRoadmapItem !== null} onClose={() => setSelectedRoadmapItem(null)} title={selectedRoadmapItem?.title || ''} size="md">
                {selectedRoadmapItem && (
                    <div className="space-y-4 text-sm text-gray-300">
                        <p><strong className="text-gray-400">Description:</strong> {selectedRoadmapItem.description}</p>
                        <p><strong className="text-gray-400">Status:</strong> {selectedRoadmapItem.status}</p>
                        <p><strong className="text-gray-400">Timeline:</strong> {formatDate(selectedRoadmapItem.startDate)} - {formatDate(selectedRoadmapItem.endDate)}</p>
                        <p className="flex items-center gap-2"><strong className="text-gray-400">Owner:</strong>
                            {getUserById(selectedRoadmapItem.ownerId) && <Avatar user={getUserById(selectedRoadmapItem.ownerId)!} size="sm" />}
                            {getUserById(selectedRoadmapItem.ownerId)?.name || 'N/A'}
                        </p>
                        <p><strong className="text-gray-400">Product Area:</strong> {selectedRoadmapItem.productArea}</p>
                        {selectedRoadmapItem.keyMetrics && selectedRoadmapItem.keyMetrics.length > 0 && (
                            <div>
                                <strong className="text-gray-400">Key Metrics:</strong>
                                <ul className="list-disc list-inside ml-2">
                                    {selectedRoadmapItem.keyMetrics.map((metric, i) => <li key={i}>{metric}</li>)}
                                </ul>
                            </div>
                        )}
                        {selectedRoadmapItem.feedbackIds.length > 0 && (
                            <div>
                                <strong className="text-gray-400">Related Feedback Items:</strong>
                                <ul className="list-disc list-inside ml-2">
                                    {selectedRoadmapItem.feedbackIds.map(fbId => {
                                        const fb = feedbackItems.find(f => f.id === fbId);
                                        return fb ? <li key={fb.id} className="text-cyan-400 hover:underline cursor-pointer">{fb.title}</li> : null;
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export const AnalyticsDashboard: React.FC<{ feedbackItems: FeedbackItem[]; allUsers: User[]; allTags: Tag[] }> = ({ feedbackItems, allUsers, allTags }) => {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        // Mock data aggregation
        const feedbackByStatus: { [key: string]: number } = {};
        COLUMNS.forEach(status => feedbackByStatus[status] = 0);
        feedbackItems.forEach(item => {
            if (feedbackByStatus[item.status] !== undefined) {
                feedbackByStatus[item.status]++;
            }
        });

        const tagCounts: { [tagId: string]: number } = {};
        feedbackItems.forEach(item => {
            item.tags.forEach(tagId => {
                tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
            });
        });
        const topTags = Object.entries(tagCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([tagId, count]) => ({ tagId, count }));

        // Simplified sentiment distribution (will just mock based on general perception)
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        feedbackItems.forEach(() => { // random assignment for mock purposes
            const rand = Math.random();
            if (rand < 0.4) positiveCount++;
            else if (rand < 0.7) neutralCount++;
            else negativeCount++;
        });

        setAnalytics({
            feedbackByStatus,
            topTags,
            feedbackVelocity: [ // Mock velocity data for last 3 months
                { date: '2023-08', new: 10, shipped: 5 },
                { date: '2023-09', new: 15, shipped: 8 },
                { date: '2023-10', new: 20, shipped: 10 },
            ],
            sentimentDistribution: { positive: positiveCount, negative: negativeCount, neutral: neutralCount }
        });
    }, [feedbackItems]);

    if (!analytics) return <div className="text-center text-gray-500 py-10">Loading analytics...</div>;

    const totalFeedback = feedbackItems.length;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Feedback Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Feedback by Status">
                    <ul className="space-y-2 text-sm">
                        {Object.entries(analytics.feedbackByStatus).map(([status, count]) => (
                            <li key={status} className="flex justify-between items-center text-gray-300">
                                <span className="font-medium">{status}</span>
                                <span className="bg-gray-700 px-2 py-0.5 rounded-full text-xs">{count}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card title="Top 5 Tags">
                    <ul className="space-y-2 text-sm">
                        {analytics.topTags.slice(0, 5).map(({ tagId, count }) => {
                            const tag = allTags.find(t => t.id === tagId);
                            return tag ? (
                                <li key={tagId} className="flex justify-between items-center text-gray-300">
                                    <TagPill tagId={tagId} />
                                    <span className="bg-gray-700 px-2 py-0.5 rounded-full text-xs">{count}</span>
                                </li>
                            ) : null;
                        })}
                    </ul>
                </Card>

                <Card title="Sentiment Distribution">
                    <div className="flex items-center justify-around h-24">
                        <div className="text-center">
                            <span className="block text-green-500 text-2xl font-bold">{((analytics.sentimentDistribution.positive / totalFeedback) * 100).toFixed(0)}%</span>
                            <span className="text-sm text-gray-400">Positive</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-gray-400 text-2xl font-bold">{((analytics.sentimentDistribution.neutral / totalFeedback) * 100).toFixed(0)}%</span>
                            <span className="text-sm text-gray-400">Neutral</span>
                        </div>
                        <div className="text-center">
                            <span className="block text-red-500 text-2xl font-bold">{((analytics.sentimentDistribution.negative / totalFeedback) * 100).toFixed(0)}%</span>
                            <span className="text-sm text-gray-400">Negative</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">Based on AI Sentiment Analysis of feedback descriptions.</p>
                </Card>

                <Card title="Feedback Velocity (Last 3 Months)" className="lg:col-span-3">
                    <div className="flex justify-around items-end h-32 px-4">
                        {analytics.feedbackVelocity.map(entry => (
                            <div key={entry.date} className="flex-1 text-center relative">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 bg-cyan-600 rounded-t-md" style={{ height: `${entry.new * 3}px`, maxHeight: '100%' }}></div>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-x-4 w-4 bg-green-600 rounded-t-md" style={{ height: `${entry.shipped * 3}px`, maxHeight: '100%' }}></div>
                                <span className="absolute -bottom-6 text-xs text-gray-400 w-full left-0">{entry.date}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-4 mt-8 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-cyan-600 rounded-full"></span> New</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded-full"></span> Shipped</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export const GlobalSearch: React.FC<{ onSearch: (query: string) => void }> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = useCallback(() => {
        onSearch(searchQuery);
    }, [onSearch, searchQuery]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    return (
        <div className="flex items-center gap-2 max-w-lg w-full">
            <Input
                type="text"
                placeholder="Search feedback items, users, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
            />
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>Search</Button>
        </div>
    );
};

export const FilterPanel: React.FC<{
    currentFilters: { status?: FeedbackStatus; assigneeId?: string; tagIds?: string[]; priority?: FeedbackPriority; submitterId?: string };
    onFilterChange: (filters: { status?: FeedbackStatus; assigneeId?: string; tagIds?: string[]; priority?: FeedbackPriority; submitterId?: string }) => void;
    onResetFilters: () => void;
}> = ({ currentFilters, onFilterChange, onResetFilters }) => {
    const [showFilters, setShowFilters] = useState(false);

    const handleSelectChange = (key: keyof typeof currentFilters, value: string | string[] | undefined) => {
        onFilterChange({ ...currentFilters, [key]: value === '' ? undefined : value });
    };

    return (
        <div className="relative">
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters {Object.keys(currentFilters).filter(k => (currentFilters as any)[k]).length > 0 && `(${Object.keys(currentFilters).filter(k => (currentFilters as any)[k]).length})`}
            </Button>

            {showFilters && (
                <Card className="absolute top-full left-0 mt-2 z-10 w-80 shadow-lg p-4 space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <Select value={currentFilters.status || ''} onChange={(e) => handleSelectChange('status', e.target.value as FeedbackStatus)}>
                            <option value="">All Statuses</option>
                            {COLUMNS.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Assignee</label>
                        <Select value={currentFilters.assigneeId || ''} onChange={(e) => handleSelectChange('assigneeId', e.target.value)}>
                            <option value="">Any Assignee</option>
                            {MOCK_USERS.filter(u => ['Admin', 'Moderator'].includes(u.role)).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                        <Select value={currentFilters.priority || ''} onChange={(e) => handleSelectChange('priority', e.target.value as FeedbackPriority)}>
                            <option value="">Any Priority</option>
                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                        <Select
                            multiple
                            value={currentFilters.tagIds || []}
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions, (option) => option.value);
                                handleSelectChange('tagIds', options);
                            }}
                            className="h-24"
                        >
                            {MOCK_TAGS.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-gray-700 pt-3">
                        <Button variant="ghost" size="sm" onClick={onResetFilters}>Reset</Button>
                        <Button size="sm" onClick={() => setShowFilters(false)}>Apply</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export const AdminPanel: React.FC<{ allUsers: User[]; allTags: Tag[]; onAddTag: (name: string, color: string) => void; onRemoveTag: (tagId: string) => void }> = ({ allUsers, allTags, onAddTag, onRemoveTag }) => {
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('bg-gray-500/20 text-gray-200');

    const handleAddTag = () => {
        if (newTagName.trim()) {
            onAddTag(newTagName.trim(), newTagColor);
            setNewTagName('');
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-white">Admin Panel</h3>

            <Card title="User Management">
                <p className="text-sm text-gray-400 mb-4">Manage user roles and permissions. (Mocked: changes are not persistent)</p>
                <div className="max-h-60 overflow-y-auto pr-2">
                    <ul className="space-y-3">
                        {allUsers.map(user => (
                            <li key={user.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                                <div className="flex items-center gap-3">
                                    <Avatar user={user} size="sm" />
                                    <span className="text-gray-200 font-medium">{user.name}</span>
                                    <span className="text-xs text-gray-500">{user.email}</span>
                                </div>
                                <Select value={user.role} onChange={(e) => console.log(`Changed ${user.name}'s role to ${e.target.value}`)} className="w-32 text-xs p-1">
                                    {['Admin', 'Moderator', 'Member', 'Guest'].map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </Select>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>

            <Card title="Tag Management">
                <div className="mb-4">
                    <h4 className="font-semibold text-gray-200 mb-2">Create New Tag</h4>
                    <div className="flex gap-2">
                        <Input placeholder="New tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="flex-1" />
                        <Select value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="w-40">
                            <option value="bg-gray-500/20 text-gray-200">Gray</option>
                            <option value="bg-cyan-500/20 text-cyan-200">Cyan</option>
                            <option value="bg-indigo-500/20 text-indigo-200">Indigo</option>
                            <option value="bg-green-500/20 text-green-200">Green</option>
                            <option value="bg-yellow-500/20 text-yellow-200">Yellow</option>
                            <option value="bg-red-500/20 text-red-200">Red</option>
                            <option value="bg-purple-500/20 text-purple-200">Purple</option>
                        </Select>
                        <Button onClick={handleAddTag} disabled={!newTagName.trim()}>Add Tag</Button>
                    </div>
                </div>

                <h4 className="font-semibold text-gray-200 mb-2 border-t border-gray-700 pt-4">Existing Tags</h4>
                <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                        <TagPill key={tag.id} tagId={tag.id} interactive onRemove={onRemoveTag} />
                    ))}
                </div>
            </Card>
        </div>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT
// ================================================================================================

export type FeedbackViewMode = 'kanban' | 'roadmap' | 'analytics' | 'admin';

const FeedbackHubView: React.FC = () => {
    const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(MOCK_FEEDBACK_ITEMS);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityLogEntry[]>(MOCK_ACTIVITY_LOGS);
    const [allRoadmapItems, setAllRoadmapItems] = useState<RoadmapItem[]>(MOCK_ROADMAP_ITEMS);
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
    const [allTags, setAllTags] = useState<Tag[]>(MOCK_TAGS);

    const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [currentView, setCurrentView] = useState<FeedbackViewMode>('kanban');

    const [filters, setFilters] = useState<{
        status?: FeedbackStatus;
        assigneeId?: string;
        tagIds?: string[];
        priority?: FeedbackPriority;
        submitterId?: string;
        searchQuery?: string;
    }>({});
    const [sortBy, setSortBy] = useState<'votes' | 'recency' | 'priority'>('recency');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredAndSortedFeedback = useMemo(() => {
        let items = [...feedbackItems];

        // Apply search
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                MOCK_USERS.find(u => u.id === item.submitterId)?.name.toLowerCase().includes(query) ||
                item.tags.some(tagId => getTagById(tagId)?.name.toLowerCase().includes(query))
            );
        }

        // Apply filters
        if (filters.status) {
            items = items.filter(item => item.status === filters.status);
        }
        if (filters.assigneeId) {
            items = items.filter(item => item.assignedToId === filters.assigneeId);
        }
        if (filters.tagIds && filters.tagIds.length > 0) {
            items = items.filter(item => item.tags.some(tagId => filters.tagIds?.includes(tagId)));
        }
        if (filters.priority) {
            items = items.filter(item => item.priority === filters.priority);
        }
        if (filters.submitterId) {
            items = items.filter(item => item.submitterId === filters.submitterId);
        }

        // Apply sorting
        items.sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortBy) {
                case 'votes':
                    valA = a.votes;
                    valB = b.votes;
                    break;
                case 'recency':
                    valA = new Date(a.lastActivityAt || a.createdAt).getTime();
                    valB = new Date(b.lastActivityAt || b.createdAt).getTime();
                    break;
                case 'priority':
                    const priorityOrder = PRIORITIES.reduce((acc, p, i) => ({ ...acc, [p]: i }), {} as { [key in FeedbackPriority]: number });
                    valA = priorityOrder[a.priority];
                    valB = priorityOrder[b.priority];
                    break;
                default:
                    valA = 0;
                    valB = 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return items;
    }, [feedbackItems, filters, sortBy, sortOrder]);

    const columns = useMemo(() => {
        return COLUMNS.map(status => ({
            status,
            items: filteredAndSortedFeedback.filter(item => item.status === status)
        }));
    }, [filteredAndSortedFeedback]);

    const handleUpdateFeedbackItem = useCallback((updatedItem: FeedbackItem, activityLog: ActivityLogEntry) => {
        setFeedbackItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
        setAllActivityLogs(prevLogs => [...prevLogs, activityLog]);
    }, []);

    const handleAddComment = useCallback((feedbackId: string, userId: string, text: string, parentId?: string) => {
        const newComment: Comment = {
            id: useUniqueId('c-'), userId, text, timestamp: new Date().toISOString(), parentId
        };
        setFeedbackItems(prevItems =>
            prevItems.map(item =>
                item.id === feedbackId
                    ? { ...item, comments: [...item.comments, newComment], lastActivityAt: new Date().toISOString() }
                    : item
            )
        );
        const newLog: ActivityLogEntry = {
            id: useUniqueId('al-'), feedbackId, userId, timestamp: new Date().toISOString(), type: 'commented', details: `Added comment: "${text.substring(0, 50)}..."`
        };
        setAllActivityLogs(prevLogs => [...prevLogs, newLog]);
    }, []);

    const handleSubmitNewFeedback = useCallback((newFeedback: Omit<FeedbackItem, 'id' | 'votes' | 'comments' | 'attachments' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>) => {
        const id = useUniqueId('FB-');
        const now = new Date().toISOString();
        const fullNewItem: FeedbackItem = {
            ...newFeedback,
            id,
            votes: 1, // Auto-vote by submitter
            comments: [],
            attachments: [],
            createdAt: now,
            updatedAt: now,
            lastActivityAt: now,
        };
        setFeedbackItems(prevItems => [...prevItems, fullNewItem]);
        const newLog: ActivityLogEntry = {
            id: useUniqueId('al-'), feedbackId: id, userId: fullNewItem.submitterId, timestamp: now, type: 'created', details: 'Feedback item created'
        };
        setAllActivityLogs(prevLogs => [...prevLogs, newLog]);
    }, []);

    const handleSearch = useCallback((query: string) => {
        setFilters(prev => ({ ...prev, searchQuery: query }));
    }, []);

    const handleFilterChange = useCallback((newFilters: typeof filters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({});
    }, []);

    const handleAddTag = useCallback((name: string, color: string) => {
        const newTag: Tag = { id: useUniqueId('tag-'), name, color };
        setAllTags(prev => [...prev, newTag]);
    }, []);

    const handleRemoveTag = useCallback((tagId: string) => {
        setAllTags(prev => prev.filter(t => t.id !== tagId));
        // Also remove tag from any feedback items that use it
        setFeedbackItems(prevItems => prevItems.map(item => ({
            ...item,
            tags: item.tags.filter(t => t !== tagId)
        })));
    }, []);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Feedback Hub</h2>
                    <div className="flex items-center gap-4">
                        <GlobalSearch onSearch={handleSearch} />
                        <FilterPanel currentFilters={filters} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} />
                        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-32 text-sm p-2">
                            <option value="recency">Sort by Recency</option>
                            <option value="votes">Sort by Votes</option>
                            <option value="priority">Sort by Priority</option>
                        </Select>
                        <Button variant="secondary" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} size="sm">
                            {sortOrder === 'asc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4 4m0-4l-4-4m4 4v12" /></svg>
                            )}
                        </Button>
                        <Button onClick={() => setShowSubmitForm(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Submit Feedback
                        </Button>
                    </div>
                </div>

                <div className="border-b border-gray-700 mb-6">
                    <nav className="flex space-x-6">
                        {['kanban', 'roadmap', 'analytics', 'admin'].map(view => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view as FeedbackViewMode)}
                                className={`py-2 px-1 text-base font-medium border-b-2 ${currentView === view ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                {currentView === 'kanban' && (
                    <KanbanBoard columnsData={columns} onCardClick={setSelectedItem} />
                )}

                {currentView === 'roadmap' && (
                    <RoadmapView roadmapItems={allRoadmapItems} feedbackItems={feedbackItems} />
                )}

                {currentView === 'analytics' && (
                    <AnalyticsDashboard feedbackItems={feedbackItems} allUsers={allUsers} allTags={allTags} />
                )}

                {currentView === 'admin' && (
                    <AdminPanel allUsers={allUsers} allTags={allTags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
                )}
            </div>

            <FeedbackDetailModal
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                onUpdateItem={handleUpdateFeedbackItem}
                onAddComment={handleAddComment}
            />
            <Modal isOpen={showSubmitForm} onClose={() => setShowSubmitForm(false)} title="Submit New Feedback" size="sm">
                <FeedbackSubmissionForm onSubmit={handleSubmitNewFeedback} onClose={() => setShowSubmitForm(false)} />
            </Modal>
        </>
    );
};

export default FeedbackHubView;