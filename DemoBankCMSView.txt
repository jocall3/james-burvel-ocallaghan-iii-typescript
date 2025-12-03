import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// --- START: NEW UTILITY TYPES AND INTERFACES ---

/**
 * Represents a single content item within the CMS.
 * @export
 */
export interface ContentItem {
    id: string;
    title: string;
    slug: string; // URL-friendly identifier
    type: "Blog Post" | "Page" | "Article" | "Press Release" | "Announcement" | "Product Description";
    status: "Draft" | "Pending Review" | "Published" | "Archived";
    authorId: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    publishedAt?: string; // ISO string, optional
    contentMarkdown: string; // Main content in Markdown
    summary: string; // Short summary for listings
    tags: string[]; // Keywords for search and categorization
    categories: string[]; // Hierarchical categorization
    featuredImageId?: string; // ID of a featured image from asset library
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
        canonicalUrl?: string;
    };
    versionHistory: ContentVersion[]; // Track changes
    comments: ContentComment[]; // Internal comments/reviews
    workflowStatus: "Created" | "Drafting" | "Reviewing" | "Approved" | "Rejected" | "Published";
    scheduledPublishDate?: string; // For future publication
    views?: number; // Simulated analytics
    shares?: number; // Simulated social shares
    likes?: number; // Simulated engagement
}

/**
 * Represents a historical version of a content item.
 * @export
 */
export interface ContentVersion {
    versionId: string;
    changedAt: string; // ISO string
    changedBy: string; // User ID
    changesSummary: string;
    contentSnapshot: string; // Full markdown content at this version
}

/**
 * Represents an internal comment or review on a content item.
 * @export
 */
export interface ContentComment {
    commentId: string;
    userId: string;
    username: string;
    commentText: string;
    commentedAt: string; // ISO string
    resolved: boolean;
    replies: ContentComment[]; // Nested replies
}

/**
 * Represents a user in the CMS with roles and permissions.
 * @export
 */
export interface User {
    id: string;
    username: string;
    email: string;
    role: "Admin" | "Editor" | "Contributor" | "Viewer";
    status: "Active" | "Inactive" | "Pending";
    lastLogin: string; // ISO string
    createdAt: string; // ISO string
    profilePictureUrl?: string;
    bio?: string;
    permissions: string[]; // e.g., ["can_publish_all", "can_edit_own_content"]
}

/**
 * Represents an asset (image, document, video) in the CMS.
 * @export
 */
export interface Asset {
    id: string;
    fileName: string;
    fileType: string; // e.g., "image/jpeg", "application/pdf"
    url: string; // URL to access the asset
    thumbnailUrl?: string; // Optional thumbnail
    altText?: string; // For accessibility
    description?: string;
    uploadedBy: string; // User ID
    uploadedAt: string; // ISO string
    size: number; // File size in bytes
    dimensions?: { width: number; height: number; }; // For images/videos
    tags: string[];
    usageCount: number; // How many content items use this asset
}

/**
 * Represents a system notification.
 * @export
 */
export interface Notification {
    id: string;
    type: "info" | "warning" | "error" | "success" | "alert";
    message: string;
    createdAt: string;
    read: boolean;
    link?: string; // Optional link to related content
    userId?: string; // If user-specific, otherwise global
}

/**
 * Represents CMS-wide settings.
 * @export
 */
export interface CMSSettings {
    siteName: string;
    siteUrl: string;
    defaultAuthorId: string;
    analyticsTrackingId?: string; // e.g., Google Analytics ID
    socialMediaLinks: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
    };
    contentTypes: { key: string; label: string; }[]; // Configurable content types
    workflowSteps: string[]; // Configurable workflow steps
}

/**
 * Represents a prompt history item for the AI writer.
 * @export
 */
export interface AIPromptHistory {
    id: string;
    prompt: string;
    generatedContent: string;
    timestamp: string;
    topic: string; // The topic extracted from the prompt
    type: "Blog Post" | "Article" | "Summary" | "Rewrite";
    status: "Success" | "Failed";
    durationMs: number;
}

// --- END: NEW UTILITY TYPES AND INTERFACES ---

// --- START: MOCK DATA AND MOCK API SERVICES ---

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/cmsData.ts
// The existing `contentItems` is expanded and made dynamic.

// A more realistic content store
const mockContentItems: ContentItem[] = [
    {
        id: "c001",
        title: "Q3 Earnings Report Summary for Investors",
        slug: "q3-earnings-report-summary",
        type: "Blog Post",
        status: "Published",
        authorId: "u001",
        createdAt: "2023-10-26T10:00:00Z",
        updatedAt: "2023-10-26T14:30:00Z",
        publishedAt: "2023-10-26T14:00:00Z",
        contentMarkdown: `# Q3 Earnings Report Summary\n\nThis quarter, DemoBank achieved significant milestones...`,
        summary: "An in-depth look at DemoBank's Q3 financial performance and market position.",
        tags: ["earnings", "finance", "investors", "report"],
        categories: ["Financial News", "Investor Relations"],
        featuredImageId: "a001",
        seo: {
            metaTitle: "DemoBank Q3 2023 Earnings Highlights",
            metaDescription: "Read the key takeaways from DemoBank's Q3 2023 earnings report.",
            keywords: ["Q3 earnings", "DemoBank finance", "investment report"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-10-26T10:00:00Z", changedBy: "u001", changesSummary: "Initial draft", contentSnapshot: "# Q3 Earnings Report Summary..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1250,
        shares: 89,
        likes: 210,
    },
    {
        id: "c002",
        title: "Welcome to The Nexus - Your Digital Banking Hub",
        slug: "welcome-to-the-nexus",
        type: "Page",
        status: "Published",
        authorId: "u002",
        createdAt: "2023-09-15T08:00:00Z",
        updatedAt: "2023-09-15T09:15:00Z",
        publishedAt: "2023-09-15T09:00:00Z",
        contentMarkdown: `# Welcome to The Nexus\n\nDiscover the future of banking with DemoBank's Nexus platform...`,
        summary: "Explore the features and benefits of DemoBank's new digital banking platform.",
        tags: ["digital banking", "nexus", "platform", "online services"],
        categories: ["Products & Services"],
        featuredImageId: "a002",
        seo: {
            metaTitle: "The Nexus - DemoBank's Digital Banking Platform",
            metaDescription: "Experience seamless online banking with The Nexus by DemoBank.",
            keywords: ["digital bank", "online finance", "banking app"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-09-15T08:00:00Z", changedBy: "u002", changesSummary: "Initial landing page content", contentSnapshot: "# Welcome to The Nexus..." }],
        comments: [],
        workflowStatus: "Published",
    },
    {
        id: "c003",
        title: "Understanding Fractional Reserve Banking",
        slug: "fractional-reserve-banking",
        type: "Article",
        status: "Draft",
        authorId: "u001",
        createdAt: "2023-10-01T11:00:00Z",
        updatedAt: "2023-10-01T11:00:00Z",
        contentMarkdown: `# Understanding Fractional Reserve Banking\n\nFractional-reserve banking is the most common form of banking...`,
        summary: "A primer on how fractional reserve banking works and its implications.",
        tags: ["economics", "banking", "finance education"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "What is Fractional Reserve Banking? DemoBank Explains",
            metaDescription: "Learn about the principles of fractional reserve banking with DemoBank's educational article.",
            keywords: ["fractional reserve", "banking system", "money creation"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-10-01T11:00:00Z", changedBy: "u001", changesSummary: "First draft", contentSnapshot: "# Understanding Fractional Reserve Banking..." }],
        comments: [
            { commentId: "com001", userId: "u003", username: "Jane Doe", commentText: "Needs more examples for clarity.", commentedAt: "2023-10-02T09:00:00Z", resolved: false, replies: [] }
        ],
        workflowStatus: "Drafting",
    },
    {
        id: "c004",
        title: "New Mortgage Rates Announced for Q4 2023",
        slug: "new-mortgage-rates-q4-2023",
        type: "Press Release",
        status: "Pending Review",
        authorId: "u002",
        createdAt: "2023-10-25T15:00:00Z",
        updatedAt: "2023-10-25T16:30:00Z",
        contentMarkdown: `# DemoBank Announces New Q4 2023 Mortgage Rates\n\nDemoBank is pleased to announce competitive mortgage rates...`,
        summary: "DemoBank releases updated mortgage rates for the fourth quarter of 2023.",
        tags: ["mortgage", "rates", "press release", "home loans"],
        categories: ["Financial News", "Products & Services"],
        seo: {
            metaTitle: "DemoBank Q4 2023 Mortgage Rates Update",
            metaDescription: "Find out about DemoBank's latest mortgage rate offerings for Q4 2023.",
            keywords: ["mortgage rates", "home loan rates", "DemoBank mortgages"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-10-25T15:00:00Z", changedBy: "u002", changesSummary: "Initial draft for review", contentSnapshot: "# DemoBank Announces New Q4 2023 Mortgage Rates..." }],
        comments: [
            { commentId: "com002", userId: "u001", username: "John Smith", commentText: "Confirm legal team approval before publishing.", commentedAt: "2023-10-26T09:00:00Z", resolved: false, replies: [] }
        ],
        workflowStatus: "Reviewing",
        scheduledPublishDate: "2023-11-01T09:00:00Z",
    },
    {
        id: "c005",
        title: "Top 5 Tips for First-Time Homebuyers",
        slug: "first-time-homebuyers-tips",
        type: "Blog Post",
        status: "Draft",
        authorId: "u003",
        createdAt: "2023-10-20T09:30:00Z",
        updatedAt: "2023-10-20T09:30:00Z",
        contentMarkdown: `# Top 5 Tips for First-Time Homebuyers\n\nBuying your first home is an exciting milestone...`,
        summary: "Essential advice for navigating the home-buying process for the first time.",
        tags: ["homebuyers", "real estate", "tips", "mortgage advice"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "First-Time Homebuyer Guide: 5 Essential Tips from DemoBank",
            metaDescription: "Get expert advice on buying your first home with DemoBank's top 5 tips.",
            keywords: ["first home buyer", "mortgage tips", "home buying guide"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-10-20T09:30:00Z", changedBy: "u003", changesSummary: "Initial outline", contentSnapshot: "# Top 5 Tips for First-Time Homebuyers..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    // Adding more mock content items to increase data and realism for features like search/filter/pagination
    {
        id: "c006",
        title: "Innovations in Digital Payments: A DemoBank Perspective",
        slug: "digital-payments-innovations",
        type: "Article",
        status: "Published",
        authorId: "u001",
        createdAt: "2023-08-01T13:00:00Z",
        updatedAt: "2023-08-01T15:00:00Z",
        publishedAt: "2023-08-01T14:30:00Z",
        contentMarkdown: `# Innovations in Digital Payments\n\nDigital payment solutions are evolving rapidly...`,
        summary: "DemoBank's insights into the latest trends and future of digital payment technologies.",
        tags: ["digital payments", "fintech", "innovation", "technology"],
        categories: ["Financial Technology"],
        seo: {
            metaTitle: "DemoBank on Digital Payment Innovations",
            metaDescription: "Explore the cutting-edge of digital payments with DemoBank's expert analysis.",
            keywords: ["fintech innovation", "mobile payments", "payment solutions"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-08-01T13:00:00Z", changedBy: "u001", changesSummary: "Initial draft", contentSnapshot: "# Innovations in Digital Payments..." }],
        comments: [],
        workflowStatus: "Published",
        views: 870,
        shares: 55,
        likes: 180,
    },
    {
        id: "c007",
        title: "Securing Your Digital Identity: Best Practices",
        slug: "digital-identity-security",
        type: "Blog Post",
        status: "Published",
        authorId: "u002",
        createdAt: "2023-09-05T10:00:00Z",
        updatedAt: "2023-09-05T11:00:00Z",
        publishedAt: "2023-09-05T10:45:00Z",
        contentMarkdown: `# Securing Your Digital Identity\n\nIn today's interconnected world, protecting your digital identity is paramount...`,
        summary: "Essential tips and practices from DemoBank to help you protect your digital identity online.",
        tags: ["security", "cybersecurity", "privacy", "digital safety"],
        categories: ["Security & Fraud"],
        seo: {
            metaTitle: "DemoBank's Guide to Digital Identity Security",
            metaDescription: "Learn how to protect your digital identity with best practices from DemoBank.",
            keywords: ["online security", "identity theft", "data protection"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-09-05T10:00:00Z", changedBy: "u002", changesSummary: "Initial draft", contentSnapshot: "# Securing Your Digital Identity..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1500,
        shares: 120,
        likes: 300,
    },
    {
        id: "c008",
        title: "Demystifying Investment Funds: ETFs vs. Mutual Funds",
        slug: "etfs-vs-mutual-funds",
        type: "Article",
        status: "Pending Review",
        authorId: "u003",
        createdAt: "2023-10-10T14:00:00Z",
        updatedAt: "2023-10-10T16:00:00Z",
        contentMarkdown: `# ETFs vs. Mutual Funds: A Comprehensive Comparison\n\nChoosing the right investment vehicle is crucial...`,
        summary: "A detailed comparison between Exchange Traded Funds (ETFs) and Mutual Funds for investors.",
        tags: ["investments", "ETFs", "mutual funds", "financial planning"],
        categories: ["Investment Guides"],
        seo: {
            metaTitle: "ETFs vs. Mutual Funds: Which is Right for You? | DemoBank",
            metaDescription: "Understand the differences and choose between ETFs and Mutual Funds with DemoBank's guide.",
            keywords: ["ETF comparison", "mutual fund investing", "investment strategies"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-10-10T14:00:00Z", changedBy: "u003", changesSummary: "Initial draft, awaiting expert review", contentSnapshot: "# ETFs vs. Mutual Funds..." }],
        comments: [
            { commentId: "com003", userId: "u001", username: "John Smith", commentText: "Add a section on tax implications for both.", commentedAt: "2023-10-11T10:00:00Z", resolved: false, replies: [] }
        ],
        workflowStatus: "Reviewing",
    },
    {
        id: "c009",
        title: "The Future of AI in Personal Finance",
        slug: "ai-in-personal-finance",
        type: "Blog Post",
        status: "Draft",
        authorId: "u001",
        createdAt: "2023-11-01T10:00:00Z",
        updatedAt: "2023-11-01T10:00:00Z",
        contentMarkdown: `# The Future of AI in Personal Finance\n\nArtificial Intelligence is rapidly transforming the financial landscape...`,
        summary: "Explore how AI is set to revolutionize personal finance management and advisory services.",
        tags: ["AI", "fintech", "personal finance", "future trends"],
        categories: ["Financial Technology"],
        seo: {
            metaTitle: "AI in Personal Finance: The Next Big Revolution by DemoBank",
            metaDescription: "Discover the impact of AI on personal finance management and future trends.",
            keywords: ["AI finance", "fintech AI", "personal finance automation"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-01T10:00:00Z", changedBy: "u001", changesSummary: "AI-generated initial draft", contentSnapshot: "# The Future of AI in Personal Finance..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    {
        id: "c010",
        title: "DemoBank's Commitment to Sustainable Investing",
        slug: "sustainable-investing",
        type: "Article",
        status: "Published",
        authorId: "u002",
        createdAt: "2023-07-20T09:00:00Z",
        updatedAt: "2023-07-20T11:00:00Z",
        publishedAt: "2023-07-20T10:30:00Z",
        contentMarkdown: `# Sustainable Investing at DemoBank\n\nAt DemoBank, we believe in finance that makes a positive impact...`,
        summary: "Learn about DemoBank's initiatives and options for sustainable and ethical investing.",
        tags: ["ESG", "sustainable investing", "ethical finance", "impact investing"],
        categories: ["Social Responsibility"],
        seo: {
            metaTitle: "Sustainable Investing with DemoBank: Make an Impact",
            metaDescription: "Discover DemoBank's sustainable investment options and commitment to ESG principles.",
            keywords: ["ESG investing", "green finance", "socially responsible investing"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-07-20T09:00:00Z", changedBy: "u002", changesSummary: "Initial draft", contentSnapshot: "# Sustainable Investing at DemoBank..." }],
        comments: [],
        workflowStatus: "Published",
        views: 950,
        shares: 70,
        likes: 250,
    },
    {
        id: "c011",
        title: "Understanding Your Credit Score: A Comprehensive Guide",
        slug: "understanding-credit-score",
        type: "Article",
        status: "Published",
        authorId: "u003",
        createdAt: "2023-06-10T11:00:00Z",
        updatedAt: "2023-06-10T13:00:00Z",
        publishedAt: "2023-06-10T12:00:00Z",
        contentMarkdown: `# Your Credit Score: What It Is and Why It Matters\n\nYour credit score is a three-digit number...`,
        summary: "DemoBank's guide to understanding, improving, and maintaining a healthy credit score.",
        tags: ["credit score", "credit report", "financial literacy", "loans"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "DemoBank's Guide to Understanding Your Credit Score",
            metaDescription: "Learn everything about credit scores, how they're calculated, and how to improve yours.",
            keywords: ["credit score explanation", "improve credit", "credit health"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-06-10T11:00:00Z", changedBy: "u003", changesSummary: "Initial draft", contentSnapshot: "# Your Credit Score: What It Is and Why It Matters..." }],
        comments: [],
        workflowStatus: "Published",
        views: 2100,
        shares: 180,
        likes: 450,
    },
    {
        id: "c012",
        title: "Latest Cybersecurity Threats and How DemoBank Protects You",
        slug: "cybersecurity-threats-demobank",
        type: "Blog Post",
        status: "Published",
        authorId: "u001",
        createdAt: "2023-09-20T14:00:00Z",
        updatedAt: "2023-09-20T16:00:00Z",
        publishedAt: "2023-09-20T15:30:00Z",
        contentMarkdown: `# Cybersecurity Threats and DemoBank's Protection\n\nThe digital landscape is constantly evolving...`,
        summary: "Stay informed about the latest cybersecurity threats and how DemoBank keeps your accounts safe.",
        tags: ["cybersecurity", "fraud prevention", "online safety", "bank security"],
        categories: ["Security & Fraud"],
        seo: {
            metaTitle: "DemoBank on Cybersecurity Threats & Your Protection",
            metaDescription: "Understand common cyber threats and DemoBank's robust security measures.",
            keywords: ["bank cybersecurity", "fraud protection", "online banking safety"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-09-20T14:00:00Z", changedBy: "u001", changesSummary: "Initial draft", contentSnapshot: "# Cybersecurity Threats and DemoBank's Protection..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1800,
        shares: 150,
        likes: 380,
    },
    {
        id: "c013",
        title: "Navigating Retirement Planning: A Step-by-Step Guide",
        slug: "retirement-planning-guide",
        type: "Article",
        status: "Draft",
        authorId: "u002",
        createdAt: "2023-11-05T10:00:00Z",
        updatedAt: "2023-11-05T12:00:00Z",
        contentMarkdown: `# Retirement Planning: Your Future Starts Now\n\nPlanning for retirement can seem daunting...`,
        summary: "A comprehensive guide from DemoBank to help you plan for a secure and comfortable retirement.",
        tags: ["retirement", "financial planning", "savings", "investing"],
        categories: ["Financial Education", "Investment Guides"],
        seo: {
            metaTitle: "DemoBank's Comprehensive Retirement Planning Guide",
            metaDescription: "Start planning for your retirement today with DemoBank's step-by-step guide and expert advice.",
            keywords: ["retirement savings", "pension planning", "financial independence"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-05T10:00:00Z", changedBy: "u002", changesSummary: "Initial draft outline", contentSnapshot: "# Retirement Planning: Your Future Starts Now..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    {
        id: "c014",
        title: "Maximizing Your Savings with DemoBank's High-Yield Accounts",
        slug: "high-yield-savings-accounts",
        type: "Product Description",
        status: "Published",
        authorId: "u003",
        createdAt: "2023-08-15T09:00:00Z",
        updatedAt: "2023-08-15T10:30:00Z",
        publishedAt: "2023-08-15T10:00:00Z",
        contentMarkdown: `# High-Yield Savings Accounts at DemoBank\n\nGrow your money faster with DemoBank's competitive high-yield savings accounts...`,
        summary: "Discover how DemoBank's high-yield savings accounts can help you achieve your financial goals.",
        tags: ["savings", "high-yield", "bank accounts", "interest rates"],
        categories: ["Products & Services"],
        seo: {
            metaTitle: "DemoBank High-Yield Savings Accounts: Grow Your Money",
            metaDescription: "Explore DemoBank's high-yield savings options and maximize your earnings.",
            keywords: ["best savings accounts", "high interest savings", "DemoBank savings"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-08-15T09:00:00Z", changedBy: "u003", changesSummary: "Initial product description", contentSnapshot: "# High-Yield Savings Accounts at DemoBank..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1100,
        shares: 60,
        likes: 200,
    },
    {
        id: "c015",
        title: "Annual Shareholder Meeting Announcement 2024",
        slug: "annual-shareholder-meeting-2024",
        type: "Announcement",
        status: "Published",
        authorId: "u001",
        createdAt: "2023-10-05T14:00:00Z",
        updatedAt: "2023-10-05T14:00:00Z",
        publishedAt: "2023-10-05T14:00:00Z",
        contentMarkdown: `# Annual Shareholder Meeting 2024\n\nDemoBank is pleased to announce its Annual Shareholder Meeting...`,
        summary: "Details regarding DemoBank's upcoming annual shareholder meeting for 2024.",
        tags: ["shareholder meeting", "corporate news", "announcement"],
        categories: ["Investor Relations"],
        seo: {
            metaTitle: "DemoBank 2024 Annual Shareholder Meeting Details",
            metaDescription: "Important information for shareholders about DemoBank's 2024 annual meeting.",
            keywords: ["shareholder event", "DemoBank investors", "corporate announcements"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-10-05T14:00:00Z", changedBy: "u001", changesSummary: "Initial announcement", contentSnapshot: "# Annual Shareholder Meeting 2024..." }],
        comments: [],
        workflowStatus: "Published",
        scheduledPublishDate: "2024-01-15T10:00:00Z", // Scheduled for future
    },
    {
        id: "c016",
        title: "Budgeting 101: Building a Strong Financial Foundation",
        slug: "budgeting-101",
        type: "Blog Post",
        status: "Draft",
        authorId: "u002",
        createdAt: "2023-11-10T09:00:00Z",
        updatedAt: "2023-11-10T09:00:00Z",
        contentMarkdown: `# Budgeting 101: Your First Steps to Financial Freedom\n\nA budget is more than just tracking expenses...`,
        summary: "A beginner's guide to creating and sticking to a budget for financial stability.",
        tags: ["budgeting", "personal finance", "money management", "financial tips"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "Budgeting 101: Build Your Financial Foundation with DemoBank",
            metaDescription: "Learn the basics of budgeting and take control of your finances with DemoBank's guide.",
            keywords: ["how to budget", "financial freedom", "money tips"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-10T09:00:00Z", changedBy: "u002", changesSummary: "Outline and initial content for budgeting", contentSnapshot: "# Budgeting 101: Your First Steps to Financial Freedom..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    // Adding more content for diverse filter/search results and pagination
    {
        id: "c017",
        title: "Credit Cards: Choosing the Right One for You",
        slug: "choosing-credit-card",
        type: "Article",
        status: "Published",
        authorId: "u003",
        createdAt: "2023-05-20T10:00:00Z",
        updatedAt: "2023-05-20T12:00:00Z",
        publishedAt: "2023-05-20T11:30:00Z",
        contentMarkdown: `# Credit Cards: Finding Your Perfect Match\n\nWith so many credit cards available...`,
        summary: "DemoBank's guide to understanding credit card types and choosing one that fits your needs.",
        tags: ["credit cards", "rewards cards", "cash back", "travel cards"],
        categories: ["Products & Services", "Financial Education"],
        seo: {
            metaTitle: "Choosing the Right Credit Card: DemoBank's Expert Advice",
            metaDescription: "Navigate the world of credit cards and find the best fit for your lifestyle with DemoBank.",
            keywords: ["best credit cards", "credit card comparison", "how to choose credit card"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-05-20T10:00:00Z", changedBy: "u003", changesSummary: "Initial draft on credit cards", contentSnapshot: "# Credit Cards: Finding Your Perfect Match..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1300,
        shares: 95,
        likes: 280,
    },
    {
        id: "c018",
        title: "Understanding and Managing Investment Risk",
        slug: "investment-risk-management",
        type: "Article",
        status: "Draft",
        authorId: "u001",
        createdAt: "2023-11-15T11:00:00Z",
        updatedAt: "2023-11-15T11:00:00Z",
        contentMarkdown: `# Investment Risk Management: A Prudent Approach\n\nInvesting inherently involves risk...`,
        summary: "A guide to identifying, understanding, and managing various types of investment risks.",
        tags: ["investment risk", "portfolio management", "risk assessment", "finance strategy"],
        categories: ["Investment Guides"],
        seo: {
            metaTitle: "Managing Investment Risk: A Guide from DemoBank",
            metaDescription: "Learn strategies to understand and manage investment risks for a more secure financial future.",
            keywords: ["investment risk management", "portfolio risk", "financial security"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-15T11:00:00Z", changedBy: "u001", changesSummary: "Initial outline and research notes", contentSnapshot: "# Investment Risk Management: A Prudent Approach..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    {
        id: "c019",
        title: "DemoBank's Holiday Season Financial Planning Tips",
        slug: "holiday-financial-tips",
        type: "Blog Post",
        status: "Pending Review",
        authorId: "u002",
        createdAt: "2023-11-08T14:00:00Z",
        updatedAt: "2023-11-08T15:30:00Z",
        contentMarkdown: `# Smart Financial Planning for the Holiday Season\n\nThe holiday season brings joy, but also potential financial strain...`,
        summary: "Practical tips from DemoBank to help you manage your finances during the holiday season.",
        tags: ["holiday budget", "seasonal finance", "spending tips", "saving"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "Holiday Financial Planning: Tips from DemoBank",
            metaDescription: "Manage your holiday spending wisely with DemoBank's financial planning tips.",
            keywords: ["holiday budget tips", "Christmas finance", "seasonal saving"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-08T14:00:00Z", changedBy: "u002", changesSummary: "Draft for holiday content", contentSnapshot: "# Smart Financial Planning for the Holiday Season..." }],
        comments: [],
        workflowStatus: "Reviewing",
        scheduledPublishDate: "2023-11-20T09:00:00Z",
    },
    {
        id: "c020",
        title: "Leveraging AI for Personalized Investment Advice",
        slug: "ai-personalized-investment",
        type: "Article",
        status: "Draft",
        authorId: "u001",
        createdAt: "2023-11-20T10:00:00Z",
        updatedAt: "2023-11-20T10:00:00Z",
        contentMarkdown: `# AI-Powered Personalized Investment Advice\n\nThe integration of Artificial Intelligence in investment advisory services...`,
        summary: "Exploring the potential of AI to offer tailored and dynamic investment recommendations.",
        tags: ["AI", "investing", "robo-advisor", "personal finance tech"],
        categories: ["Financial Technology", "Investment Guides"],
        seo: {
            metaTitle: "AI for Personalized Investment Advice: DemoBank's Vision",
            metaDescription: "Discover how AI is transforming investment advice, offering personalized strategies.",
            keywords: ["AI investment", "robo advisory", "personalized finance"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-20T10:00:00Z", changedBy: "u001", changesSummary: "Initial research notes for AI investment article", contentSnapshot: "# AI-Powered Personalized Investment Advice..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    {
        id: "c021",
        title: "The Importance of an Emergency Fund",
        slug: "emergency-fund-importance",
        type: "Blog Post",
        status: "Published",
        authorId: "u003",
        createdAt: "2023-04-10T09:00:00Z",
        updatedAt: "2023-04-10T11:00:00Z",
        publishedAt: "2023-04-10T10:30:00Z",
        contentMarkdown: `# Why You Need an Emergency Fund Now More Than Ever\n\nLife is full of unexpected events...`,
        summary: "Understand why an emergency fund is crucial for financial stability and how to build one.",
        tags: ["emergency fund", "savings", "financial planning", "financial security"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "Building an Emergency Fund: DemoBank's Essential Guide",
            metaDescription: "Learn the importance of an emergency fund and practical steps to build yours.",
            keywords: ["emergency savings", "financial buffer", "rainy day fund"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-04-10T09:00:00Z", changedBy: "u003", changesSummary: "Initial draft on emergency funds", contentSnapshot: "# Why You Need an Emergency Fund Now More Than Ever..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1600,
        shares: 110,
        likes: 320,
    },
    {
        id: "c022",
        title: "Understanding Different Types of Loans",
        slug: "types-of-loans",
        type: "Article",
        status: "Published",
        authorId: "u002",
        createdAt: "2023-07-01T10:00:00Z",
        updatedAt: "2023-07-01T12:00:00Z",
        publishedAt: "2023-07-01T11:30:00Z",
        contentMarkdown: `# Different Types of Loans: A Comprehensive Overview\n\nLoans are a common financial tool...`,
        summary: "A detailed breakdown of various loan types, their uses, and considerations from DemoBank.",
        tags: ["loans", "personal loans", "mortgage", "auto loan", "student loan"],
        categories: ["Financial Education", "Products & Services"],
        seo: {
            metaTitle: "Types of Loans Explained: DemoBank's Comprehensive Guide",
            metaDescription: "Understand the different types of loans available and find the best fit for your financial needs.",
            keywords: ["personal loan types", "mortgage options", "loan guide"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-07-01T10:00:00Z", changedBy: "u002", changesSummary: "Initial draft on loan types", contentSnapshot: "# Different Types of Loans: A Comprehensive Overview..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1450,
        shares: 90,
        likes: 290,
    },
    {
        id: "c023",
        title: "DemoBank's Commitment to Financial Literacy",
        slug: "financial-literacy-commitment",
        type: "Page",
        status: "Published",
        authorId: "u001",
        createdAt: "2023-01-15T09:00:00Z",
        updatedAt: "2023-01-15T10:00:00Z",
        publishedAt: "2023-01-15T09:30:00Z",
        contentMarkdown: `# DemoBank's Dedication to Financial Literacy\n\nAt DemoBank, we believe that financial literacy is the cornerstone of economic well-being...`,
        summary: "Learn about DemoBank's programs and resources aimed at improving financial literacy.",
        tags: ["financial literacy", "education", "community", "social responsibility"],
        categories: ["About Us", "Social Responsibility"],
        seo: {
            metaTitle: "DemoBank's Financial Literacy Programs and Resources",
            metaDescription: "Explore DemoBank's commitment to enhancing financial literacy in the community.",
            keywords: ["financial education programs", "community outreach", "DemoBank initiatives"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-01-15T09:00:00Z", changedBy: "u001", changesSummary: "Initial page content", contentSnapshot: "# DemoBank's Dedication to Financial Literacy..." }],
        comments: [],
        workflowStatus: "Published",
        views: 900,
        shares: 50,
        likes: 150,
    },
    {
        id: "c024",
        title: "How to Save for a Down Payment on a Home",
        slug: "save-down-payment-home",
        type: "Blog Post",
        status: "Draft",
        authorId: "u003",
        createdAt: "2023-11-25T08:00:00Z",
        updatedAt: "2023-11-25T08:00:00Z",
        contentMarkdown: `# Saving for Your Dream Home's Down Payment\n\nThe down payment is often the biggest hurdle for prospective homeowners...`,
        summary: "Practical strategies and tips for saving up a substantial down payment for your first home.",
        tags: ["down payment", "home buying", "savings goals", "real estate"],
        categories: ["Financial Education"],
        seo: {
            metaTitle: "Saving for a Down Payment: DemoBank's Expert Strategies",
            metaDescription: "Discover effective ways to save for a home down payment with DemoBank's financial guidance.",
            keywords: ["down payment savings", "first home savings", "real estate finance"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-25T08:00:00Z", changedBy: "u003", changesSummary: "Initial draft, focusing on savings strategies", contentSnapshot: "# Saving for Your Dream Home's Down Payment..." }],
        comments: [],
        workflowStatus: "Drafting",
    },
    {
        id: "c025",
        title: "Protecting Yourself from Online Scams",
        slug: "online-scams-protection",
        type: "Article",
        status: "Published",
        authorId: "u001",
        createdAt: "2023-08-20T11:00:00Z",
        updatedAt: "2023-08-20T13:00:00Z",
        publishedAt: "2023-08-20T12:30:00Z",
        contentMarkdown: `# Safeguarding Against Online Scams\n\nOnline scams are unfortunately prevalent...`,
        summary: "DemoBank provides essential tips and information to help you identify and protect yourself from various online scams.",
        tags: ["scams", "fraud", "online safety", "consumer protection"],
        categories: ["Security & Fraud"],
        seo: {
            metaTitle: "Protect Yourself from Online Scams: A Guide by DemoBank",
            metaDescription: "Learn how to recognize and avoid common online scams with DemoBank's comprehensive guide.",
            keywords: ["online fraud prevention", "scam awareness", "internet safety"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-08-20T11:00:00Z", changedBy: "u001", changesSummary: "Initial draft on online scams", contentSnapshot: "# Safeguarding Against Online Scams..." }],
        comments: [],
        workflowStatus: "Published",
        views: 1950,
        shares: 160,
        likes: 400,
    },
    {
        id: "c026",
        title: "Understanding Stock Market Volatility",
        slug: "stock-market-volatility",
        type: "Article",
        status: "Draft",
        authorId: "u002",
        createdAt: "2023-11-28T10:00:00Z",
        updatedAt: "2023-11-28T10:00:00Z",
        contentMarkdown: `# Stock Market Volatility: What It Means for Investors\n\nStock market volatility is a natural part of investing...`,
        summary: "An explanation of stock market volatility, its causes, and how investors can navigate it.",
        tags: ["stock market", "volatility", "investing", "market analysis"],
        categories: ["Investment Guides"],
        seo: {
            metaTitle: "Stock Market Volatility Explained: DemoBank Insights",
            metaDescription: "Understand stock market volatility and strategies to manage its impact on your investments.",
            keywords: ["market fluctuations", "investment risk", "stock market trends"],
        },
        versionHistory: [{ versionId: "v001", changedAt: "2023-11-28T10:00:00Z", changedBy: "u002", changesSummary: "Initial outline for market volatility article", contentSnapshot: "# Stock Market Volatility: What It Means for Investors..." }],
        comments: [],
        workflowStatus: "Drafting",
    }
];

// Mock Users
const mockUsers: User[] = [
    {
        id: "u001",
        username: "John Smith",
        email: "john.smith@demobank.com",
        role: "Admin",
        status: "Active",
        lastLogin: "2023-11-29T09:30:00Z",
        createdAt: "2022-01-01T08:00:00Z",
        profilePictureUrl: "https://via.placeholder.com/150/0000FF/FFFFFF?text=JS",
        bio: "Head of Content and Marketing. Oversees all CMS operations.",
        permissions: ["can_manage_all_content", "can_manage_users", "can_manage_assets", "can_manage_settings", "can_publish_all"]
    },
    {
        id: "u002",
        username: "Jane Doe",
        email: "jane.doe@demobank.com",
        role: "Editor",
        status: "Active",
        lastLogin: "2023-11-28T14:00:00Z",
        createdAt: "2022-03-15T10:00:00Z",
        profilePictureUrl: "https://via.placeholder.com/150/FF0000/FFFFFF?text=JD",
        bio: "Senior Editor responsible for financial news and product pages.",
        permissions: ["can_edit_all_content", "can_review_content", "can_publish_selected"]
    },
    {
        id: "u003",
        username: "Peter Jones",
        email: "peter.jones@demobank.com",
        role: "Contributor",
        status: "Active",
        lastLogin: "2023-11-29T11:00:00Z",
        createdAt: "2022-06-01T11:00:00Z",
        profilePictureUrl: "https://via.placeholder.com/150/00FF00/FFFFFF?text=PJ",
        bio: "Writes educational articles and blog posts on personal finance.",
        permissions: ["can_create_content", "can_edit_own_content", "can_submit_for_review"]
    },
    {
        id: "u004",
        username: "Alice Smith",
        email: "alice.smith@demobank.com",
        role: "Viewer",
        status: "Inactive", // Example of inactive user
        lastLogin: "2023-08-10T10:00:00Z",
        createdAt: "2023-01-20T13:00:00Z",
        profilePictureUrl: "https://via.placeholder.com/150/FFFF00/000000?text=AS",
        bio: "Observes content changes but has no editing permissions.",
        permissions: ["can_view_all_content"]
    }
];

// Mock Assets
const mockAssets: Asset[] = [
    {
        id: "a001",
        fileName: "q3_report_cover.jpg",
        fileType: "image/jpeg",
        url: "https://images.unsplash.com/photo-1543286386-77983610260f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1MjJ8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjByZXBvcnR8ZW58MHx8fHwxNzAxMDU0MTUwfDA&ixlib=rb-4.0.3&q=80&w=1080",
        thumbnailUrl: "https://images.unsplash.com/photo-1543286386-77983610260f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1MjJ8MHwxfHNlYXJjaHwxfHxmaW5hbmNpYWwlMjByZXBvcnR8ZW58MHx8fHwxNzAxMDU0MTUwfDA&ixlib=rb-4.0.3&q=80&w=200",
        altText: "Financial report cover page",
        description: "Cover image for the Q3 earnings report.",
        uploadedBy: "u001",
        uploadedAt: "2023-10-25T09:00:00Z",
        size: 250000,
        dimensions: { width: 1200, height: 800 },
        tags: ["finance", "report", "image"],
        usageCount: 1,
    },
    {
        id: "a002",
        fileName: "nexus_landing_banner.png",
        fileType: "image/png",
        url: "https://images.unsplash.com/photo-1628348398436-79b8c0a8e1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1MjJ8MHwxfHNlYXJjaHwxfHxkZXZpY2VzJTIwYmFua2luZ3xlbnwwfHx8fDE3MDExNDk1NjZ8MA&ixlib=rb-4.0.3&q=80&w=1080",
        thumbnailUrl: "https://images.unsplash.com/photo-1628348398436-79b8c0a8e1e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1MjJ8MHwxfHNlYXJjaHwxfHxkZXZpY2VzJTIwYmFua2luZ3xlbnwwfHx8fDE3MDExNDk1NjZ8MA&ixlib=rb-4.0.3&q=80&w=200",
        altText: "Digital banking devices",
        description: "Banner image for The Nexus landing page.",
        uploadedBy: "u002",
        uploadedAt: "2023-09-14T10:00:00Z",
        size: 500000,
        dimensions: { width: 1920, height: 1080 },
        tags: ["digital", "banking", "banner", "image"],
        usageCount: 1,
    },
    {
        id: "a003",
        fileName: "team_meeting.mp4",
        fileType: "video/mp4",
        url: "https://www.w3schools.com/html/mov_bbb.mp4", // Placeholder video
        thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87730e01e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1ODc1MjJ8MHwxfHNlYXJjaHwxfHxtZWV0aW5nfGVufDB8fHx8MTcwMTE0OTY3MHww&ixlib=rb-4.0.3&q=80&w=200",
        altText: "Team meeting discussing strategy",
        description: "Promotional video for internal use or upcoming campaign.",
        uploadedBy: "u001",
        uploadedAt: "2023-11-01T10:00:00Z",
        size: 15000000,
        dimensions: { width: 1280, height: 720 },
        tags: ["video", "marketing", "internal"],
        usageCount: 0,
    }
];

// Mock Notifications
const mockNotifications: Notification[] = [
    {
        id: "n001",
        type: "alert",
        message: "Content item 'New Mortgage Rates' is pending your review.",
        createdAt: "2023-11-29T10:00:00Z",
        read: false,
        link: "/cms/content/c004",
        userId: "u001"
    },
    {
        id: "n002",
        type: "info",
        message: "Your draft 'Understanding Credit Score' has been published.",
        createdAt: "2023-11-28T15:00:00Z",
        read: true,
        link: "/cms/content/c011",
        userId: "u003"
    },
    {
        id: "n003",
        type: "warning",
        message: "Asset 'team_meeting.mp4' has a broken link. Please check.",
        createdAt: "2023-11-27T11:00:00Z",
        read: false,
        link: "/cms/assets/a003",
        userId: "u001"
    }
];

// Mock CMS Settings
const mockCMSSettings: CMSSettings = {
    siteName: "DemoBank Marketing Hub",
    siteUrl: "https://www.demobank.com",
    defaultAuthorId: "u001",
    analyticsTrackingId: "UA-DEMOBANK-123",
    socialMediaLinks: {
        facebook: "https://facebook.com/demobank",
        twitter: "https://twitter.com/demobank",
        linkedin: "https://linkedin.com/company/demobank",
    },
    contentTypes: [
        { key: "Blog Post", label: "Blog Post" },
        { key: "Page", label: "Page" },
        { key: "Article", label: "Article" },
        { key: "Press Release", label: "Press Release" },
        { key: "Announcement", label: "Announcement" },
        { key: "Product Description", label: "Product Description" }
    ],
    workflowSteps: ["Created", "Drafting", "Reviewing", "Approved", "Rejected", "Published"]
};

// Mock API Service (simulated async operations)
/**
 * A mock API service to simulate backend interactions for a CMS.
 * All functions return Promises to mimic asynchronous network requests.
 * @export
 */
export const mockApiService = {
    /**
     * Fetches all content items.
     * @returns {Promise<ContentItem[]>}
     */
    fetchContent: (): Promise<ContentItem[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...mockContentItems]), 500));
    },
    /**
     * Fetches a single content item by ID.
     * @param {string} id
     * @returns {Promise<ContentItem | undefined>}
     */
    fetchContentById: (id: string): Promise<ContentItem | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(mockContentItems.find(item => item.id === id)), 300));
    },
    /**
     * Saves a content item (creates new or updates existing).
     * @param {ContentItem} content
     * @returns {Promise<ContentItem>}
     */
    saveContent: (content: ContentItem): Promise<ContentItem> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date().toISOString();
                if (content.id) {
                    const index = mockContentItems.findIndex(item => item.id === content.id);
                    if (index !== -1) {
                        const updatedContent = { ...mockContentItems[index], ...content, updatedAt: now };
                        mockContentItems[index] = updatedContent;
                        resolve(updatedContent);
                    } else {
                        // This case should ideally not happen for updates, but for robustness
                        const newContent = { ...content, id: `c${mockContentItems.length + 1}`, createdAt: now, updatedAt: now };
                        mockContentItems.push(newContent);
                        resolve(newContent);
                    }
                } else {
                    const newContent = { ...content, id: `c${mockContentItems.length + 1}`, createdAt: now, updatedAt: now };
                    mockContentItems.push(newContent);
                    resolve(newContent);
                }
            }, 500);
        });
    },
    /**
     * Deletes a content item by ID.
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    deleteContent: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = mockContentItems.length;
                mockContentItems = mockContentItems.filter(item => item.id !== id);
                resolve(mockContentItems.length < initialLength);
            }, 300);
        });
    },

    /**
     * Fetches all users.
     * @returns {Promise<User[]>}
     */
    fetchUsers: (): Promise<User[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...mockUsers]), 400));
    },
    /**
     * Fetches a single user by ID.
     * @param {string} id
     * @returns {Promise<User | undefined>}
     */
    fetchUserById: (id: string): Promise<User | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(mockUsers.find(user => user.id === id)), 200));
    },
    /**
     * Saves a user (creates new or updates existing).
     * @param {User} user
     * @returns {Promise<User>}
     */
    saveUser: (user: User): Promise<User> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date().toISOString();
                if (user.id) {
                    const index = mockUsers.findIndex(u => u.id === user.id);
                    if (index !== -1) {
                        const updatedUser = { ...mockUsers[index], ...user, updatedAt: now }; // updatedAt not in User interface but useful for mock
                        mockUsers[index] = updatedUser;
                        resolve(updatedUser);
                    } else {
                        const newUser = { ...user, id: `u${mockUsers.length + 1}`, createdAt: now };
                        mockUsers.push(newUser);
                        resolve(newUser);
                    }
                } else {
                    const newUser = { ...user, id: `u${mockUsers.length + 1}`, createdAt: now };
                    mockUsers.push(newUser);
                    resolve(newUser);
                }
            }, 400);
        });
    },
    /**
     * Deletes a user by ID.
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    deleteUser: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = mockUsers.length;
                mockUsers = mockUsers.filter(user => user.id !== id);
                resolve(mockUsers.length < initialLength);
            }, 300);
        });
    },

    /**
     * Fetches all assets.
     * @returns {Promise<Asset[]>}
     */
    fetchAssets: (): Promise<Asset[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...mockAssets]), 350));
    },
    /**
     * Fetches a single asset by ID.
     * @param {string} id
     * @returns {Promise<Asset | undefined>}
     */
    fetchAssetById: (id: string): Promise<Asset | undefined> => {
        return new Promise(resolve => setTimeout(() => resolve(mockAssets.find(asset => asset.id === id)), 250));
    },
    /**
     * Saves an asset (creates new or updates existing).
     * @param {Asset} asset
     * @returns {Promise<Asset>}
     */
    saveAsset: (asset: Asset): Promise<Asset> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date().toISOString();
                if (asset.id) {
                    const index = mockAssets.findIndex(a => a.id === asset.id);
                    if (index !== -1) {
                        const updatedAsset = { ...mockAssets[index], ...asset, uploadedAt: now }; // Re-update uploadedAt for simplicity of update
                        mockAssets[index] = updatedAsset;
                        resolve(updatedAsset);
                    } else {
                        const newAsset = { ...asset, id: `a${mockAssets.length + 1}`, uploadedAt: now };
                        mockAssets.push(newAsset);
                        resolve(newAsset);
                    }
                } else {
                    const newAsset = { ...asset, id: `a${mockAssets.length + 1}`, uploadedAt: now };
                    mockAssets.push(newAsset);
                    resolve(newAsset);
                }
            }, 400);
        });
    },
    /**
     * Deletes an asset by ID.
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    deleteAsset: (id: string): Promise<boolean> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const initialLength = mockAssets.length;
                mockAssets = mockAssets.filter(asset => asset.id !== id);
                resolve(mockAssets.length < initialLength);
            }, 300);
        });
    },

    /**
     * Fetches all notifications for a user or global ones.
     * @param {string | undefined} userId
     * @returns {Promise<Notification[]>}
     */
    fetchNotifications: (userId?: string): Promise<Notification[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const filtered = userId ? mockNotifications.filter(n => n.userId === userId || !n.userId) : mockNotifications;
                resolve([...filtered]);
            }, 300);
        });
    },
    /**
     * Marks a notification as read.
     * @param {string} id
     * @returns {Promise<Notification | undefined>}
     */
    markNotificationAsRead: (id: string): Promise<Notification | undefined> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = mockNotifications.findIndex(n => n.id === id);
                if (index !== -1) {
                    mockNotifications[index].read = true;
                    resolve(mockNotifications[index]);
                }
                resolve(undefined);
            }, 200);
        });
    },

    /**
     * Fetches CMS settings.
     * @returns {Promise<CMSSettings>}
     */
    fetchCMSSettings: (): Promise<CMSSettings> => {
        return new Promise(resolve => setTimeout(() => resolve({ ...mockCMSSettings }), 200));
    },
    /**
     * Saves CMS settings.
     * @param {CMSSettings} settings
     * @returns {Promise<CMSSettings>}
     */
    saveCMSSettings: (settings: CMSSettings): Promise<CMSSettings> => {
        return new Promise(resolve => {
            setTimeout(() => {
                Object.assign(mockCMSSettings, settings); // Deep copy for simplicity in mock
                resolve({ ...mockCMSSettings });
            }, 400);
        });
    },

    /**
     * Simulates AI content generation.
     * @param {string} topic
     * @param {object} options
     * @param {'casual' | 'formal' | 'informative' | 'persuasive'} options.tone
     * @param {'short' | 'medium' | 'long'} options.length
     * @param {'Blog Post' | 'Article' | 'Summary' | 'Rewrite'} options.contentType
     * @param {string} [options.targetAudience]
     * @returns {Promise<string>}
     */
    generateAIContent: async (topic: string, options: { tone: 'casual' | 'formal' | 'informative' | 'persuasive', length: 'short' | 'medium' | 'long', contentType: 'Blog Post' | 'Article' | 'Summary' | 'Rewrite', targetAudience?: string }): Promise<string> => {
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate AI processing time
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let fullPrompt = `Write a ${options.length} ${options.contentType} about the following topic: "${topic}".`;
            if (options.tone) fullPrompt += ` Use a ${options.tone} tone.`;
            if (options.targetAudience) fullPrompt += ` Tailor it for a ${options.targetAudience} audience.`;
            fullPrompt += ` Include a title, an introduction, multiple body paragraphs, and a conclusion. Use markdown for formatting.`;

            const modelName = options.length === 'long' ? 'gemini-1.5-flash-latest' : 'gemini-pro'; // Use a more powerful model for longer content
            const response = await ai.models.generateContent({ model: modelName, contents: [{ text: fullPrompt }] });
            const generatedText = response.response.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";

            const endTime = Date.now();
            const durationMs = endTime - startTime;
            // Add to AI history
            mockAIPromptHistory.push({
                id: `ai${mockAIPromptHistory.length + 1}`,
                prompt: fullPrompt,
                generatedContent: generatedText,
                timestamp: new Date().toISOString(),
                topic: topic,
                type: options.contentType,
                status: "Success",
                durationMs: durationMs
            });

            return generatedText;
        } catch (error) {
            console.error("AI Generation Error:", error);
            const endTime = Date.now();
            const durationMs = endTime - startTime;
            mockAIPromptHistory.push({
                id: `ai${mockAIPromptHistory.length + 1}`,
                prompt: topic,
                generatedContent: `Error: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date().toISOString(),
                topic: topic,
                type: options.contentType,
                status: "Failed",
                durationMs: durationMs
            });
            throw new Error("Could not generate content.");
        }
    },

    /**
     * Fetches AI prompt history.
     * @returns {Promise<AIPromptHistory[]>}
     */
    fetchAIPromptHistory: (): Promise<AIPromptHistory[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...mockAIPromptHistory]), 300));
    }
};

let mockAIPromptHistory: AIPromptHistory[] = []; // Initial empty history for AI

// --- END: MOCK DATA AND MOCK API SERVICES ---


// --- START: SHARED COMPONENTS & UTILITIES (Internal to this file for line count) ---

/**
 * A reusable modal component.
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {React.ReactNode} props.children
 * @param {string} [props.title]
 * @param {string} [props.size] - 'sm', 'md', 'lg', 'xl', 'max'
 * @returns {JSX.Element | null}
 */
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' | 'max' }> = ({ isOpen, onClose, children, title, size = 'md' }) => {
    if (!isOpen) return null;

    const modalSizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        max: "max-w-4xl" // Increased for larger forms/editors
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl ${modalSizeClasses[size]} w-full border border-gray-700`} onClick={e => e.stopPropagation()}>
                {title && (
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                )}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * A small loading spinner component.
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`inline-block animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent ${className}`} role="status">
        <span className="sr-only">Loading...</span>
    </div>
);

/**
 * A generic alert/toast notification component.
 * @param {object} props
 * @param {Notification} props.notification
 * @param {() => void} props.onClose
 * @returns {JSX.Element}
 */
const ToastNotification: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
    const bgColorClass = {
        info: "bg-blue-500",
        warning: "bg-yellow-500",
        error: "bg-red-500",
        success: "bg-green-500",
        alert: "bg-purple-500"
    }[notification.type];

    useEffect(() => {
        const timer = setTimeout(onClose, 5000); // Auto-dismiss after 5 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 ${bgColorClass} text-white p-4 rounded-lg shadow-xl flex items-center space-x-3 z-50`}>
            <span>{notification.message}</span>
            <button onClick={onClose} className="text-white opacity-70 hover:opacity-100">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
    );
};

/**
 * Format a date string to a human-readable format.
 * @param {string | undefined} dateString
 * @returns {string}
 */
export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return "Invalid Date";
    }
};

/**
 * A component to display a user's avatar and name.
 * @param {object} props
 * @param {User | undefined} props.user
 * @returns {JSX.Element}
 */
const UserAvatar: React.FC<{ user: User | undefined }> = ({ user }) => (
    <div className="flex items-center space-x-2">
        {user?.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
        ) : (
            <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white font-semibold">
                {user?.username ? user.username[0].toUpperCase() : 'U'}
            </div>
        )}
        <span className="text-white text-sm">{user?.username || 'Unknown User'}</span>
    </div>
);

/**
 * Component for a rich text editor (simplified Markdown for now).
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @returns {JSX.Element}
 */
const MarkdownEditor: React.FC<{ value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }> = ({ value, onChange, placeholder, rows = 15 }) => {
    return (
        <textarea
            className="w-full bg-gray-700/50 p-3 rounded text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 resize-y"
            rows={rows}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    );
};

// --- END: SHARED COMPONENTS & UTILITIES ---


const DemoBankCMSView: React.FC = () => {
    // --- START: GLOBAL CMS STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'users' | 'assets' | 'settings' | 'ai-writer' | 'notifications'>('dashboard');

    const [allContentItems, setAllContentItems] = useState<ContentItem[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [cmsSettings, setCmsSettings] = useState<CMSSettings>(mockCMSSettings); // Initial load from mock
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [aiPromptHistory, setAiPromptHistory] = useState<AIPromptHistory[]>([]);

    const [isLoadingCMSData, setIsLoadingCMSData] = useState(true);
    const [errorCMSData, setErrorCMSData] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("u001"); // Simulate logged-in user

    const loggedInUser = useMemo(() => allUsers.find(u => u.id === currentUserId), [allUsers, currentUserId]);

    const addToast = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Initial data fetch for all CMS sections
    useEffect(() => {
        const fetchAllCMSData = async () => {
            setIsLoadingCMSData(true);
            setErrorCMSData(null);
            try {
                const [content, users, assets, settings, aiHistory, userNotifications] = await Promise.all([
                    mockApiService.fetchContent(),
                    mockApiService.fetchUsers(),
                    mockApiService.fetchAssets(),
                    mockApiService.fetchCMSSettings(),
                    mockApiService.fetchAIPromptHistory(),
                    mockApiService.fetchNotifications(currentUserId)
                ]);
                setAllContentItems(content);
                setAllUsers(users);
                setAllAssets(assets);
                setCmsSettings(settings);
                setAiPromptHistory(aiHistory);
                setNotifications(userNotifications);
                addToast({ type: "success", message: "CMS data loaded successfully!", userId: currentUserId });
            } catch (error) {
                setErrorCMSData("Failed to load CMS data.");
                addToast({ type: "error", message: `Failed to load CMS data: ${error instanceof Error ? error.message : String(error)}`, userId: currentUserId });
            } finally {
                setIsLoadingCMSData(false);
            }
        };
        fetchAllCMSData();
    }, [currentUserId, addToast]); // currentUserId might change in a real app (e.g., login)


    // --- END: GLOBAL CMS STATE MANAGEMENT ---


    // --- START: AI CONTENT WRITER LOGIC ---
    const [isWriterOpen, setWriterOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('The future of AI in personal finance');
    const [aiGeneratedContent, setAiGeneratedContent] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiTone, setAiTone] = useState<'casual' | 'formal' | 'informative' | 'persuasive'>('informative');
    const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
    const [aiContentType, setAiContentType] = useState<'Blog Post' | 'Article' | 'Summary' | 'Rewrite'>('Blog Post');
    const [aiTargetAudience, setAiTargetAudience] = useState('');
    const [showAiHistory, setShowAiHistory] = useState(false);
    const [showSaveContentModal, setShowSaveContentModal] = useState(false);
    const [newContentTitle, setNewContentTitle] = useState('');
    const [newContentType, setNewContentType] = useState<ContentItem['type']>('Blog Post');

    const handleGenerateAI = async () => {
        if (!aiPrompt.trim()) {
            addToast({ type: "warning", message: "Please enter a topic for AI generation.", userId: currentUserId });
            return;
        }
        setIsAiLoading(true);
        setAiGeneratedContent('');
        try {
            const generated = await mockApiService.generateAIContent(aiPrompt, {
                tone: aiTone,
                length: aiLength,
                contentType: aiContentType,
                targetAudience: aiTargetAudience
            });
            setAiGeneratedContent(generated);
            addToast({ type: "success", message: "AI content generated successfully!", userId: currentUserId });
            // Refresh AI history
            const history = await mockApiService.fetchAIPromptHistory();
            setAiPromptHistory(history);
        } catch (error) {
            setAiGeneratedContent("Error: Could not generate content. Check API key or prompt.");
            addToast({ type: "error", message: `AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`, userId: currentUserId });
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSaveGeneratedContent = async () => {
        if (!newContentTitle.trim() || !aiGeneratedContent.trim()) {
            addToast({ type: "warning", message: "Title and content cannot be empty.", userId: currentUserId });
            return;
        }
        setIsAiLoading(true); // Re-use for saving operation
        try {
            const newContent: ContentItem = {
                id: '', // Will be generated by mock service
                title: newContentTitle,
                slug: newContentTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''),
                type: newContentType,
                status: 'Draft',
                authorId: currentUserId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                contentMarkdown: aiGeneratedContent,
                summary: aiGeneratedContent.substring(0, 150) + "...",
                tags: aiPrompt.split(' ').filter(t => t.length > 2).map(t => t.toLowerCase()),
                categories: [newContentType],
                seo: {
                    metaTitle: newContentTitle,
                    metaDescription: aiGeneratedContent.substring(0, 150),
                    keywords: aiPrompt.split(' ').filter(t => t.length > 2).map(t => t.toLowerCase())
                },
                versionHistory: [{
                    versionId: `v_initial_${Date.now()}`,
                    changedAt: new Date().toISOString(),
                    changedBy: currentUserId,
                    changesSummary: "AI Generated initial draft",
                    contentSnapshot: aiGeneratedContent
                }],
                comments: [],
                workflowStatus: 'Drafting'
            };
            const savedContent = await mockApiService.saveContent(newContent);
            setAllContentItems(prev => [...prev, savedContent]);
            setShowSaveContentModal(false);
            setWriterOpen(false); // Close writer after saving
            setNewContentTitle('');
            setAiGeneratedContent('');
            addToast({ type: "success", message: `Content '${savedContent.title}' saved as draft!`, userId: currentUserId });
            setActiveTab('content'); // Navigate to content library
        } catch (error) {
            addToast({ type: "error", message: `Failed to save generated content: ${error instanceof Error ? error.message : "Unknown error"}`, userId: currentUserId });
