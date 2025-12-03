```typescript
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../Card'; // Keep existing import for Card
import { GoogleGenAI, Type } from "@google/genai"; // Keep existing import for GoogleGenAI

/**
 * This module implements the comprehensive AetherCareer Blueprint platform.
 * Business value: AetherCareer Blueprint is a foundational platform that orchestrates agentic AI, digital identity, and real-time data processing to redefine career development.
 * It delivers hyper-personalized career trajectory planning, real-time skill gap analysis, AI-powered content generation, and intelligent mentorship matching.
 * By automating career growth and talent optimization, it significantly enhances human capital efficiency, reduces hiring friction, and unlocks new revenue streams
 * through predictive talent development and retention strategies for both individuals and enterprises. This leads to millions in value by optimizing workforce potential
 * and ensuring continuous skill alignment with evolving market demands. This system represents a revolutionary, multi-million-dollar infrastructure leap, enabling next-generation talent management.
 */

/**
 * =====================================================================================================================
 *  SECTION 1: CORE INFRASTRUCTURE - CONSTANTS, ENUMS, INTERFACES, AND UTILITIES
 * =====================================================================================================================
 */

/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.1: Global Configuration & Constants
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const APP_NAME = "AetherCareer Blueprint 108";
export const APP_VERSION = "2.0.0-omega";
export const API_BASE_URL_SIMULATED = "aethercareer.com/api/v1"; // Simulated, not real
export const LOCAL_STORAGE_PREFIX = "aether_career_bp_108_";
export const MAX_RESUME_LENGTH = 10000;
export const MAX_JOB_DESC_LENGTH = 5000;
export const AI_RESPONSE_TIMEOUT_MS = 60000; // 60 seconds
export const DEBOUNCE_DELAY_MS = 500;
export const MAX_RECOMMENDATIONS_PER_AI_CALL = 5;
export const MAX_SKILLS_DISPLAY = 10;
export const MAX_NOTES_LENGTH = 500;
export const AI_MODEL_TEMPERATURE = 0.7; // For more creative outputs

export enum CareerStage {
    EntryLevel = "Entry-Level",
    Junior = "Junior",
    MidLevel = "Mid-Level",
    Senior = "Senior",
    Lead = "Lead",
    Manager = "Manager",
    Director = "Director",
    Executive = "Executive"
}

export enum SkillCategory {
    Technical = "Technical",
    Soft = "Soft Skills",
    Management = "Management",
    DomainSpecific = "Domain Specific",
    Tools = "Tools & Technologies",
    Leadership = "Leadership",
    Communication = "Communication",
    ProjectManagement = "Project Management",
    Sales = "Sales",
    Marketing = "Marketing",
    DataScience = "Data Science",
    Cybersecurity = "Cybersecurity",
    CloudComputing = "Cloud Computing"
}

export enum RecommendationType {
    Course = "Course",
    Certification = "Certification",
    Book = "Book",
    NetworkingEvent = "Networking Event",
    Project = "Project Idea",
    Mentor = "Mentor Connection",
    Article = "Article",
    Podcast = "Podcast",
    Workshop = "Workshop",
    Conference = "Conference"
}

export enum FeedbackSentiment {
    Positive = "Positive",
    Neutral = "Neutral",
    Negative = "Negative"
}

export enum AIPromptTemplate {
    ResumeAnalysis = "RESUME_ANALYSIS",
    CoverLetterGeneration = "COVER_LETTER_GENERATION",
    SkillGapAnalysis = "SKILL_GAP_ANALYSIS",
    CareerPathSuggestion = "CAREER_PATH_SUGGESTION",
    InterviewQuestionGeneration = "INTERVIEW_QUESTION_GENERATION",
    InterviewFeedback = "INTERVIEW_FEEDBACK",
    SalaryNegotiationScript = "SALARY_NEGOTIATION_SCRIPT",
    LinkedInProfileOptimization = "LINKEDIN_PROFILE_OPTIMIZATION",
    PerformanceReviewPrep = "PERFORMANCE_REVIEW_PREP",
    MarketTrendAnalysis = "MARKET_TREND_ANALYSIS",
    LearningResourceRecommendation = "LEARNING_RESOURCE_RECOMMENDATION",
    NetworkingMessageGeneration = "NETWORKING_MESSAGE_GENERATION",
    ProjectIdeaGeneration = "PROJECT_IDEA_GENERATION",
    MentorMatching = "MENTOR_MATCHING",
    PortfolioReview = "PORTFOLIO_REVIEW",
    ContentIdeaGeneration = "CONTENT_IDEA_GENERATION",
    DailyPlanGeneration = "DAILY_PLAN_GENERATION",
    PersonalBrandStatement = "PERSONAL_BRAND_STATEMENT"
}

export const AI_MODELS = {
    fast: 'gemini-2.5-flash',
    balanced: 'gemini-1.5-pro',
    advanced: 'gemini-1.5-flash-latest' // Assuming a hypothetical advanced model
};

export enum JobApplicationStatus {
    Applied = "Applied",
    Interviewing = "Interviewing",
    OfferReceived = "Offer Received",
    Rejected = "Rejected",
    Withdrawn = "Withdrawn",
    Accepted = "Accepted"
}

export enum InterviewStageType {
    InitialCall = "Initial Call",
    Technical = "Technical Interview",
    Behavioral = "Behavioral Interview",
    Onsite = "On-site Interview",
    FinalRound = "Final Round"
}

export enum GoalStatus {
    Pending = 'Pending',
    InProgress = 'InProgress',
    Completed = 'Completed',
    Deferred = 'Deferred',
    Cancelled = 'Cancelled'
}

export enum PriorityLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical'
}

export enum IdentityVerificationLevel {
    None = "None",
    Basic = "Basic", // Email/Phone verified
    Verified = "Verified", // Document/KYC verified
    Enterprise = "Enterprise" // Corporate entity verification
}

export enum AuditEventType {
    ProfileUpdated = "PROFILE_UPDATED",
    GoalCreated = "GOAL_CREATED",
    GoalUpdated = "GOAL_UPDATED",
    GoalDeleted = "GOAL_DELETED",
    AITaskCompleted = "AI_TASK_COMPLETED",
    TokenIssued = "TOKEN_ISSUED",
    TokenTransferred = "TOKEN_TRANSFERRED",
    PaymentProcessed = "PAYMENT_PROCESSED",
    IdentityVerified = "IDENTITY_VERIFIED",
    AccessDenied = "ACCESS_DENIED",
    ApplicationAdded = "APPLICATION_ADDED",
    ApplicationUpdated = "APPLICATION_UPDATED",
    SessionScheduled = "SESSION_SCHEDULED",
    ResourceAdded = "RESOURCE_ADDED",
    ProjectAdded = "PROJECT_ADDED",
    ContactAdded = "CONTACT_ADDED",
    BrandStatementGenerated = "BRAND_STATEMENT_GENERATED",
    DailyPlanGenerated = "DAILY_PLAN_GENERATED"
}

export enum TokenType {
    CareerCoin = "CareerCoin",
    SkillPoint = "SkillPoint",
    AetherCredit = "AetherCredit"
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.2: Data Models (Interfaces)
 * ---------------------------------------------------------------------------------------------------------------------
 */

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    currentRole: string;
    industry: string;
    yearsExperience: number;
    careerStage: CareerStage;
    skills: string[]; // List of skills
    education: string[];
    certifications: string[];
    desiredRoles: string[];
    desiredIndustry: string;
    salaryExpectationMin: number;
    salaryExpectationMax: number;
    lastUpdated: string;
    resumeText: string; // Stored here for easy access
    linkedInProfileUrl?: string;
    personalWebsiteUrl?: string;
    achievements: string[]; // Raw list of achievements
    careerVision: string; // Long-term vision
    preferredLearningStyles: string[]; // e.g., "Visual", "Auditory", "Kinesthetic"
    aiModelPreference?: keyof typeof AI_MODELS; // User's preferred AI model
    // Digital Identity Layer fields
    publicKey: string; // Simulated public key for the user's digital identity
    identityVerificationLevel: IdentityVerificationLevel;
    walletAddress: string; // Simulated wallet address for token interactions
    signature?: string; // Cryptographic signature of the profile data (simulated)
    nonce?: string; // Nonce for replay protection (simulated)
}

export interface SkillAssessmentResult {
    skill: string;
    category: SkillCategory;
    currentLevel: number; // 1-5 scale
    targetLevel: number; // 1-5 scale
    gap: number; // targetLevel - currentLevel
    recommendations: LearningResource[];
    lastAssessed: string;
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface CareerGoal {
    id: string;
    title: string;
    description: string;
    targetDate: string; // ISO date string
    status: GoalStatus;
    priority: PriorityLevel;
    relatedSkills: string[];
    progressNotes: { date: string; note: string }[];
    actionItems: ActionItem[]; // New: break down goals into actionable steps
    createdAt: string;
    lastUpdated: string;
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface ActionItem {
    id: string;
    goalId: string;
    description: string;
    dueDate: string; // ISO date string
    isCompleted: boolean;
    completedDate?: string; // ISO date string
    notes?: string;
    relatedResourceIds?: string[]; // IDs of related learning resources
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface JobApplication {
    id: string;
    jobTitle: string;
    company: string;
    applicationDate: string; // ISO date string
    status: JobApplicationStatus;
    notes: string;
    jobDescription: string;
    resumeUsed: string; // Snapshot of resume text
    coverLetterUsed: string; // Snapshot of cover letter text
    interviewDates: string[]; // ISO date strings
    feedbackReceived: string;
    followUpDate: string | null; // ISO date string
    salaryOffer?: number;
    negotiationHistory: string[];
    link: string; // Link to the job posting
    createdAt: string;
    lastUpdated: string;
    contacts: NetworkContact[]; // New: contacts related to this application
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface AISuggestion {
    id: string;
    originalText: string;
    improvedText: string;
    rationale: string;
    category: 'Resume' | 'CoverLetter' | 'LinkedIn' | 'General' | 'Interview' | 'PerformanceReview' | 'Networking' | 'Portfolio';
    severity: 'Minor' | 'Moderate' | 'Major';
}

export interface CareerPathRecommendation {
    id: string;
    role: string;
    industry: string;
    description: string;
    requiredSkills: { skill: string; category: SkillCategory; level: number }[];
    averageSalaryRange: string;
    growthOutlook: 'Low' | 'Medium' | 'High' | 'Very High';
    pathways: { title: string; type: RecommendationType; resource: string }[];
    potentialMentors?: string[]; // New: suggest types of mentors
    typicalCompanies?: string[]; // New: suggest companies in this path
}

export interface LearningResource {
    id: string;
    title: string;
    description: string;
    type: RecommendationType;
    link: string;
    estimatedTime: string; // e.g., "10 hours", "3 days", "ongoing"
    cost: 'Free' | 'Paid' | 'Subscription' | 'Mixed';
    relatedSkills: string[];
    provider: string; // e.g., "Coursera", "Udemy", "Amazon"
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    rating?: number; // 1-5 scale
    userCompleted?: boolean;
    dateAdded: string;
}

export interface MarketTrend {
    id: string;
    title: string;
    description: string;
    impactOnCareer: string;
    relevantSkills: string[];
    source: string;
    date: string; // ISO date string
    suggestedActions: string[]; // New: actionable steps based on trend
}

export interface InterviewQuestion {
    id: string;
    question: string;
    type: 'Behavioral' | 'Technical' | 'Situational' | 'Problem-Solving' | 'Puzzle';
    keywords: string[];
    suggestedApproach: string; // AI-generated tip
}

export interface InterviewSession {
    id: string;
    jobApplicationId: string;
    sessionDate: string; // ISO date string
    role: string;
    company: string;
    questionsAsked: { question: string; userAnswer: string; aiFeedback: string; score: number }[];
    overallFeedback: string;
    areasForImprovement: string[];
    strengths: string[];
    score: number; // Overall session score out of 100
    createdAt: string;
    lastUpdated: string;
    stageType: InterviewStageType; // New: which type of interview
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface Notification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    read: boolean;
    actionLink?: string; // e.g., link to relevant section or item
}

// Simulated Webhook event structure
export interface WebhookEvent {
    id: string;
    eventType: 'JOB_APPLIED' | 'INTERVIEW_SCHEDULED' | 'GOAL_UPDATED' | 'PROFILE_CHANGED' | 'AI_TASK_COMPLETED' | 'SKILL_IMPROVED' | 'NEW_MENTOR_SUGGESTION' | 'TOKEN_ISSUED_EVENT';
    payload: any; // Generic payload for the event
    timestamp: string;
    processed: boolean;
    signature?: string; // Signature for event integrity
}

export interface NetworkContact {
    id: string;
    name: string;
    company: string;
    role: string;
    connectionDate: string; // ISO date string
    lastContactDate: string; // ISO date string
    notes: string;
    followUpDate: string | null; // ISO date string for next follow-up
    relationshipStrength: 'Acquaintance' | 'Professional Connection' | 'Strong Ally' | 'Mentor';
    tags: string[]; // e.g., "Hiring Manager", "Peer", "Alumni"
    linkedInUrl?: string;
    email?: string;
    phone?: string;
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface PersonalProject {
    id: string;
    title: string;
    description: string;
    status: 'Idea' | 'Planning' | 'InProgress' | 'Completed' | 'Archived';
    startDate: string; // ISO date string
    endDate?: string; // ISO date string
    skillsDeveloped: string[];
    technologiesUsed: string[];
    repositoryLink?: string;
    demoLink?: string;
    goalIds: string[]; // Related career goals
    createdAt: string;
    lastUpdated: string;
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface MentorProfile {
    id: string;
    name: string;
    industry: string;
    currentRole: string;
    yearsExperience: number;
    specialties: string[]; // e.g., "Leadership", "Technical Mentoring", "Career Transition"
    bio: string;
    availability: string; // e.g., "Mon-Wed evenings", "Flexible"
    linkedInUrl?: string;
    contactPreference: 'Email' | 'LinkedIn' | 'App Chat';
    menteeCapacity: number; // How many mentees they can take
    currentMentees: string[]; // User IDs of current mentees
    isAvailable: boolean;
    rating?: number; // average rating by mentees
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface MentorshipSession {
    id: string;
    mentorId: string;
    menteeId: string; // User's own ID
    sessionDate: string; // ISO date string
    durationMinutes: number;
    topic: string;
    notes: string;
    feedbackGiven?: string;
    menteeRating?: number; // Mentee's rating of the session
    actionItems: string[]; // Action items agreed upon during session
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface UserPreferences {
    id: string; // user ID
    aiModelPreference: keyof typeof AI_MODELS;
    notificationSettings: {
        email: boolean;
        inApp: boolean;
        sms: boolean; // simulated
    };
    theme: 'dark' | 'light';
    defaultAIOutputFormat: 'markdown' | 'json';
    preferredSkillCategories: SkillCategory[];
    lastUpdated: string;
}

export interface PortfolioItem {
    id: string;
    title: string;
    type: 'Project' | 'Publication' | 'Presentation' | 'Website' | 'Other';
    description: string;
    link: string;
    technologies?: string[];
    skillsDemonstrated?: string[];
    date: string; // ISO date string
    thumbnailUrl?: string;
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface PersonalBrandStatement {
    id: string;
    statement: string;
    version: number;
    generatedDate: string;
    rationale: string;
    keywords: string[];
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface DailyPlanItem {
    id: string;
    date: string; // ISO date string (YYYY-MM-DD)
    time: string; // e.g., "09:00 AM"
    activity: string;
    type: 'Learning' | 'Networking' | 'Job Search' | 'Project' | 'Goal' | 'Other';
    isCompleted: boolean;
    relatedEntityId?: string; // e.g., LearningResource ID, Goal ID
    signature?: string; // Simulated signature for data integrity
    nonce?: string; // Nonce for replay protection
}

export interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO date string
    actorId: string; // User ID, Agent ID, or System
    eventType: AuditEventType;
    entityType: string; // e.g., 'UserProfile', 'CareerGoal'
    entityId: string; // ID of the entity affected
    payloadHash: string; // Hashed payload of the change/event
    signature: string; // Cryptographic signature of the log entry (simulated)
    status: 'SUCCESS' | 'FAILURE';
    message: string;
    resource?: string; // URL or identifier for the resource accessed
}

export interface TokenAccount {
    userId: string;
    tokenType: TokenType;
    balance: number;
    lastUpdated: string;
    signature?: string;
    nonce?: string;
}

export interface TokenTransaction {
    id: string;
    timestamp: string;
    senderId: string; // User, Agent, or System
    receiverId: string; // User, Agent, or System
    amount: number;
    tokenType: TokenType;
    memo?: string; // Description of the transaction
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    transactionHash: string; // Hash of the transaction data
    signature?: string; // Signature of the transaction
}

export interface PaymentRecord {
    id: string;
    timestamp: string;
    payerId: string; // User or System
    payeeId: string; // System or Merchant
    amount: number;
    currency: string; // e.g., "USD", "EUR"
    memo?: string; // Description of the payment
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    transactionHash: string; // Hash of the payment data
    signature?: string; // Signature of the payment
}


/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.3: Utility Functions & Classes (Self-Contained)
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const generateId = (): string => `_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Provides comprehensive date and time utilities.
 * Business value: Ensures consistent date handling across the platform, critical for features like
 * scheduling, deadline tracking, and audit logging. Standardized time utilities reduce errors and
 * complexity in managing time-sensitive financial and career progression data.
 */
export const DateUtils = {
    getNowISO: () => new Date().toISOString(),
    formatDate: (isoString: string) => new Date(isoString).toLocaleDateString(),
    formatDateTime: (isoString: string) => new Date(isoString).toLocaleString(),
    timeSince: (isoString: string) => {
        const now = new Date();
        const past = new Date(isoString);
        const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

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
    },
    addDays: (isoString: string, days: number): string => {
        const date = new Date(isoString);
        date.setDate(date.getDate() + days);
        return date.toISOString();
    },
    isFutureDate: (isoString: string): boolean => {
        const date = new Date(isoString);
        const now = new Date();
        now.setHours(0,0,0,0); // Compare dates only
        return date.getTime() > now.getTime();
    }
};

/**
 * Provides robust text manipulation and formatting utilities.
 * Business value: Enhances user experience through clean data presentation, supports content generation,
 * and improves data consistency for AI processing. Effective text handling reduces operational
 * errors and improves the clarity of communications within the platform.
 */
export const TextUtils = {
    truncate: (text: string, maxLength: number) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    countWords: (text: string) => text.trim().split(/\s+/).filter(Boolean).length,
    capitalizeFirstLetter: (text: string) => text.charAt(0).toUpperCase() + text.slice(1),
    toSentenceCase: (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()).trim(),
    removeMarkdown: (text: string) => text.replace(/[`*_\-\[\]()#\+\.!]/g, '').replace(/(\r\n|\n|\r)/gm, " ")
};

/**
 * Offers a suite of data validation functions.
 * Business value: Enforces data integrity at the input layer, preventing malformed or invalid data from corrupting
 * the system. This is crucial for security, compliance, and reliable operation, minimizing downstream errors and
 * ensuring high-quality data for AI analysis and financial transactions.
 */
export const ValidationUtils = {
    isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isNotNullOrEmpty: (str: string | null | undefined) => str !== null && str !== undefined && str.trim() !== '',
    isPositiveNumber: (num: number) => typeof num === 'number' && num > 0,
    isValidUrl: (url: string) => {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }
};

/**
 * Custom error class for standardized error reporting.
 * Business value: Provides granular control over error types, enabling precise error handling,
 * logging, and user feedback. This streamlines debugging, improves system resilience, and ensures
 * that critical issues are addressed effectively, maintaining a high standard of operational integrity.
 */
export class CustomError extends Error {
    constructor(message: string, public code: string = 'GENERIC_ERROR') {
        super(message);
        this.name = 'CustomError';
    }
}

/**
 * Global Debounce utility for input fields.
 * Business value: Reduces API call frequency and computational load on backend systems and AI services by delaying
 * execution until user input stabilizes. This optimizes resource utilization, cuts operational costs,
 * and improves user experience by preventing excessive, unnecessary processing.
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
 * Custom hook to manage asynchronous state with loading and error handling.
 * Business value: Standardizes robust error handling and loading indicators across the application,
 * improving user experience, reducing development time for complex async operations, and enhancing
 * system stability by gracefully managing potential failures.
 */
export function useAsyncState<T>(
    initialValue: T,
    fn: (...args: any[]) => Promise<T>,
    deps: React.DependencyList = []
): [T, boolean, Error | null, (...args: any[]) => Promise<void>] {
    const [value, setValue] = useState<T>(initialValue);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async (...args: any[]) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fn(...args);
            setValue(result);
            return result; // Return result for direct use if needed
        } catch (err: any) {
            setError(err);
            throw err; // Re-throw to allow callers to handle/catch
        } finally {
            setLoading(false);
        }
    }, deps);

    return [value, loading, error, execute];
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.4: Simulated Local Storage Service (acts as a local 'database')
 * ---------------------------------------------------------------------------------------------------------------------
 * This class provides a robust, type-safe abstraction over browser's localStorage, simulating a persistent data store.
 * Business value: Ensures data persistence for user profiles, settings, and application state without requiring a backend,
 * crucial for offline capabilities and rapid prototyping. It acts as a configurable simulator for "live mode" backend
 * services, reducing development costs and accelerating feature delivery. For "live mode," this class would be swapped
 * with an adapter to a real database, providing architectural flexibility and seamless transition from simulation to production.
 */
export class LocalDataStore {
    private static instance: LocalDataStore;
    private constructor() {}

    public static getInstance(): LocalDataStore {
        if (!LocalDataStore.instance) {
            LocalDataStore.instance = new LocalDataStore();
        }
        return LocalDataStore.instance;
    }

    private getKey(entityType: string, id?: string): string {
        return `${LOCAL_STORAGE_PREFIX}${entityType}${id ? `_${id}` : ''}`;
    }

    public getItem<T>(entityType: string, id: string): T | null {
        try {
            const data = localStorage.getItem(this.getKey(entityType, id));
            return data ? JSON.parse(data) as T : null;
        } catch (error) {
            console.error(`Error getting item ${entityType}/${id}:`, error);
            return null;
        }
    }

    public getAllItems<T>(entityType: string): T[] {
        const items: T[] = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.getKey(entityType))) {
                    const data = localStorage.getItem(key);
                    if (data) {
                        items.push(JSON.parse(data) as T);
                    }
                }
            }
        } catch (error) {
            console.error(`Error getting all items for ${entityType}:`, error);
        }
        return items;
    }

    public setItem<T extends { id: string }>(entityType: string, item: T): void {
        try {
            localStorage.setItem(this.getKey(entityType, item.id), JSON.stringify(item));
        } catch (error) {
            console.error(`Error setting item ${entityType}/${item.id}:`, error);
            throw new CustomError(`Failed to save ${entityType}. Local storage might be full.`, 'STORAGE_FULL');
        }
    }

    public removeItem(entityType: string, id: string): void {
        try {
            localStorage.removeItem(this.getKey(entityType, id));
        } catch (error) {
            console.error(`Error removing item ${entityType}/${id}:`, error);
        }
    }

    public clearAll(entityType: string): void {
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.getKey(entityType))) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error(`Error clearing all items for ${entityType}:`, error);
        }
    }
}

export const dataStore = LocalDataStore.getInstance();

/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.5: Simulated Notification & Webhook Management
 * ---------------------------------------------------------------------------------------------------------------------
 * This NotificationService provides real-time in-app notifications, enhancing user engagement and awareness.
 * Business value: Improves user experience by delivering timely and relevant alerts (e.g., AI task completion, goal updates),
 * reducing user-perceived latency and increasing feature discoverability. For enterprises, this system can be extended to
 * integrate with existing communication channels, driving proactive user behavior and improving adherence to career plans.
 */
export class NotificationService {
    private notifications: Notification[] = [];
    private listeners: ((notifications: Notification[]) => void)[] = [];
    private maxNotifications: number = 20;

    /**
     * Adds a new notification to the system and notifies all subscribers.
     * @param notification The notification object without ID, timestamp, or read status.
     */
    public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
        const newNotification: Notification = {
            ...notification,
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            read: false,
        };
        this.notifications.unshift(newNotification); // Add to beginning
        // Keep only the latest N notifications
        this.notifications = this.notifications.slice(0, this.maxNotifications);
        this.notifyListeners();
        // Persist notifications (e.g., in localStorage) for later retrieval
        dataStore.setItem('notification', newNotification);
    }

    /**
     * Retrieves all current in-memory notifications.
     * @returns An array of Notification objects.
     */
    public getNotifications(): Notification[] {
        return this.notifications;
    }

    /**
     * Marks a specific notification as read.
     * @param id The ID of the notification to mark as read.
     */
    public markAsRead(id: string): void {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.notifyListeners();
            // In a real app, would update persistence here as well
            dataStore.setItem('notification', notification);
        }
    }

    /**
     * Clears all notifications from the system.
     */
    public clearNotifications(): void {
        this.notifications = [];
        this.notifyListeners();
        dataStore.clearAll('notification');
    }

    /**
     * Subscribes a listener function to receive notification updates.
     * @param listener The function to be called when notifications change.
     * @returns A function to unsubscribe the listener.
     */
    public subscribe(listener: (notifications: Notification[]) => void): () => void {
        this.listeners.push(listener);
        // Immediately notify with current notifications upon subscription
        listener(this.getNotifications());
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Notifies all registered listeners about changes in the notification list.
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener([...this.notifications]));
    }
}
export const notificationService = new NotificationService();

/**
 * This WebhookProcessor simulates an event-driven architecture within the client, processing internal events.
 * Business value: Enables complex, reactive workflows and inter-module communication, mirroring a microservices
 * backend without external dependencies. It supports agile development by allowing decoupled features to react
 * to system events, accelerating product iterations and enhancing scalability simulations. In a "live mode,"
 * this would seamlessly integrate with a robust, cloud-native message queuing and event streaming platform.
 */
export class WebhookProcessor {
    private static instance: WebhookProcessor;
    private eventQueue: WebhookEvent[] = [];
    private processing: boolean = false;
    private constructor() {}

    public static getInstance(): WebhookProcessor {
        if (!WebhookProcessor.instance) {
            WebhookProcessor.instance = new WebhookProcessor();
        }
        return WebhookProcessor.instance;
    }

    /**
     * Receives an event and adds it to the processing queue.
     * @param event The event object without ID, timestamp, or processed status.
     * @returns A Promise that resolves when the event is added to the queue.
     */
    public async receiveEvent(event: Omit<WebhookEvent, 'id' | 'timestamp' | 'processed' | 'signature'>): Promise<void> {
        const newEvent: WebhookEvent = {
            ...event,
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            processed: false,
            signature: identityService.signData(event) // Simulate signing the event for integrity
        };
        this.eventQueue.push(newEvent);
        await this.processQueue();
    }

    /**
     * Processes events from the queue sequentially.
     * @returns A Promise that resolves when the queue is empty.
     */
    private async processQueue(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            if (!event) continue;

            if (!identityService.verifySignature(event.payload, event.signature || '', USER_ID_AGENT_ORCHESTRATOR)) { // Simulate event origin check
                console.warn(`Webhook event ${event.id} failed signature verification. Skipping.`);
                auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.AccessDenied, 'WebhookEvent', event.id, 'Signature mismatch', 'FAILURE', { eventType: event.eventType });
                notificationService.addNotification({
                    type: 'error',
                    message: `Security Alert: Webhook event validation failed for ${event.eventType}.`
                });
                continue;
            }

            console.log(`Processing webhook event: ${event.eventType} (ID: ${event.id})`);
            try {
                await this.handleEvent(event);
                event.processed = true;
                auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.AITaskCompleted, 'WebhookEvent', event.id, `Webhook event ${event.eventType} processed.`, 'SUCCESS', { eventType: event.eventType });
                console.log(`Webhook event ${event.id} processed successfully.`);
            } catch (error) {
                console.error(`Error processing webhook event ${event.id}:`, error);
                auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.AITaskCompleted, 'WebhookEvent', event.id, `Webhook event ${event.eventType} processing failed.`, 'FAILURE', { error: (error as Error).message });
                notificationService.addNotification({
                    type: 'error',
                    message: `Failed to process webhook event: ${event.eventType}. Error: ${(error as Error).message}`
                });
            }
        }
        this.processing = false;
    }

    /**
     * Handles a specific webhook event based on its type.
     * @param event The webhook event to handle.
     * @returns A Promise that resolves when the event is handled.
     */
    private async handleEvent(event: WebhookEvent): Promise<void> {
        switch (event.eventType) {
            case 'JOB_APPLIED':
                notificationService.addNotification({
                    type: 'info',
                    message: `Don't forget to follow up on your application for ${event.payload.jobTitle} at ${event.payload.company} in 7 days!`,
                    actionLink: `/applications/${event.payload.id}`
                });
                break;
            case 'INTERVIEW_SCHEDULED':
                notificationService.addNotification({
                    type: 'success',
                    message: `Interview scheduled for ${event.payload.role} at ${event.payload.company} on ${DateUtils.formatDate(event.payload.interviewDate)}! Start your AI interview prep!`,
                    actionLink: `/interview/${event.payload.sessionId}`
                });
                break;
            case 'GOAL_UPDATED':
                notificationService.addNotification({
                    type: 'info',
                    message: `Goal "${event.payload.title}" progress updated to ${event.payload.status}. Keep up the great work!`,
                    actionLink: `/goals/${event.payload.id}`
                });
                break;
            case 'PROFILE_CHANGED':
                notificationService.addNotification({
                    type: 'info',
                    message: `Your profile has been updated. Re-evaluating career recommendations...`
                });
                break;
            case 'AI_TASK_COMPLETED':
                notificationService.addNotification({
                    type: 'success',
                    message: `AI task "${event.payload.taskName}" completed! Check out the results.`,
                    actionLink: event.payload.actionLink
                });
                break;
            case 'SKILL_IMPROVED':
                notificationService.addNotification({
                    type: 'info',
                    message: `Great job! Your skill in "${event.payload.skill}" has improved. Consider re-assessing or finding new challenges.`,
                    actionLink: `/skills`
                });
                break;
            case 'NEW_MENTOR_SUGGESTION':
                notificationService.addNotification({
                    type: 'info',
                    message: `New mentor "${event.payload.mentorName}" suggested for your career path!`,
                    actionLink: `/mentorship/${event.payload.mentorId}`
                });
                break;
            case 'TOKEN_ISSUED_EVENT':
                notificationService.addNotification({
                    type: 'success',
                    message: `You earned ${event.payload.amount} ${event.payload.tokenType} for ${event.payload.memo}!`,
                    actionLink: `/tokens`
                });
                break;
            default:
                console.warn(`Unknown webhook event type: ${event.eventType}`);
        }
    }
}
export const webhookProcessor = WebhookProcessor.getInstance();

export const USER_ID_SYSTEM = 'system_agent';
export const USER_ID_AGENT_ORCHESTRATOR = 'agent_orchestrator';
export const USER_ID_AUTH_SERVICE = 'auth_service';
export const USER_ID = 'default_user_id'; // Hardcoded for single-user simulation

/**
 * This DigitalIdentityService simulates the core functions of a robust digital identity system,
 * including key management, authentication, and authorization.
 * Business value: Establishes a foundation of trust and security across the entire platform. By managing
 * cryptographic identities for users and agents, it enables secure transactions, verifiable access control,
 * and auditable actions, which are critical for compliance and mitigating financial risks. This service
 * is essential for enterprise adoption, allowing integration with external identity providers and
 * providing a seamless, secure user experience.
 */
export class DigitalIdentityService {
    private static instance: DigitalIdentityService;
    private currentIdentities: Map<string, { publicKey: string; privateKey: string; verificationLevel: IdentityVerificationLevel; walletAddress: string; }> = new Map();

    private constructor() {
        this.initializeDefaultIdentities();
    }

    public static getInstance(): DigitalIdentityService {
        if (!DigitalIdentityService.instance) {
            DigitalIdentityService.instance = new DigitalIdentityService();
        }
        return DigitalIdentityService.instance;
    }

    /**
     * Initializes default identities for the system and a placeholder user.
     * This is a simulation; in production, keys would be securely generated and managed.
     */
    private initializeDefaultIdentities(): void {
        // System Agent
        this.currentIdentities.set(USER_ID_SYSTEM, {
            publicKey: 'SYS_PUB_KEY_001',
            privateKey: 'SYS_PRIV_KEY_001',
            verificationLevel: IdentityVerificationLevel.Enterprise,
            walletAddress: 'SYS_WALLET_001'
        });
        // Agent Orchestrator
        this.currentIdentities.set(USER_ID_AGENT_ORCHESTRATOR, {
            publicKey: 'AGNT_ORCH_PUB_KEY_001',
            privateKey: 'AGNT_ORCH_PRIV_KEY_001',
            verificationLevel: IdentityVerificationLevel.Enterprise,
            walletAddress: 'AGNT_ORCH_WALLET_001'
        });
        // Auth Service
        this.currentIdentities.set(USER_ID_AUTH_SERVICE, {
            publicKey: 'AUTH_SERV_PUB_KEY_001',
            privateKey: 'AUTH_SERV_PRIV_KEY_001',
            verificationLevel: IdentityVerificationLevel.Enterprise,
            walletAddress: 'AUTH_SERV_WALLET_001'
        });
        // Default User
        this.currentIdentities.set(USER_ID, {
            publicKey: 'USER_PUB_KEY_001',
            privateKey: 'USER_PRIV_KEY_001',
            verificationLevel: IdentityVerificationLevel.Basic,
            walletAddress: 'USER_WALLET_001'
        });
    }

    /**
     * Generates a new simulated asymmetric key pair and wallet address for a given entity.
     * @param entityId The ID of the entity (user or agent) to generate keys for.
     * @returns An object containing the public key, private key, and wallet address.
     */
    public generateKeys(entityId: string): { publicKey: string; privateKey: string; walletAddress: string; } {
        const publicKey = `PUB_KEY_${generateId()}`;
        const privateKey = `PRIV_KEY_${generateId()}`;
        const walletAddress = `WALLET_ADDR_${generateId()}`;
        this.currentIdentities.set(entityId, { publicKey, privateKey, verificationLevel: IdentityVerificationLevel.None, walletAddress });
        auditLogService.recordEvent(USER_ID_AUTH_SERVICE, AuditEventType.IdentityVerified, 'DigitalIdentity', entityId, `Keys generated for ${entityId}.`, 'SUCCESS', { publicKey, walletAddress });
        return { publicKey, privateKey, walletAddress };
    }

    /**
     * Retrieves the public key for a given entity.
     * @param entityId The ID of the entity.
     * @returns The public key string, or undefined if not found.
     */
    public getPublicKey(entityId: string): string | undefined {
        return this.currentIdentities.get(entityId)?.publicKey;
    }

    /**
     * Retrieves the wallet address for a given entity.
     * @param entityId The ID of the entity.
     * @returns The wallet address string, or undefined if not found.
     */
    public getWalletAddress(entityId: string): string | undefined {
        return this.currentIdentities.get(entityId)?.walletAddress;
    }

    /**
     * Simulates signing a data payload with an entity's private key.
     * @param data The data to be signed.
     * @param entityId The ID of the entity performing the signing.
     * @returns A simulated cryptographic signature string.
     */
    public signData(data: any, entityId: string = USER_ID): string {
        const identity = this.currentIdentities.get(entityId);
        if (!identity) {
            console.warn(`Attempted to sign data with unknown entityId: ${entityId}`);
            auditLogService.recordEvent(USER_ID_AUTH_SERVICE, AuditEventType.AccessDenied, 'DigitalIdentity', entityId, `Signing failed: entity ID not found.`, 'FAILURE');
            return 'INVALID_SIGNATURE';
        }
        // Simplified simulation: base64 encode data + private key part + nonce
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const hash = btoa(dataString).slice(0, 16); // Simulate a data hash
        const signature = `${hash}_${identity.privateKey.substring(0, 8)}_${generateId().slice(1)}`;
        return signature;
    }

    /**
     * Simulates verifying a signature against a public key and data payload.
     * @param data The original data payload.
     * @param signature The signature to verify.
     * @param signerId The ID of the entity whose public key should be used for verification.
     * @returns True if the signature is valid, false otherwise.
     */
    public verifySignature(data: any, signature: string, signerId: string = USER_ID): boolean {
        const identity = this.currentIdentities.get(signerId);
        if (!identity) {
            console.warn(`Attempted to verify signature for unknown signerId: ${signerId}`);
            return false;
        }
        // Simplified simulation: check if signature contains expected components
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        const expectedHashPart = btoa(dataString).slice(0, 16);
        const expectedPrivateKeyPart = identity.privateKey.substring(0, 8); // Public key derived from this for simplicity
        const isValid = signature.startsWith(expectedHashPart) && signature.includes(expectedPrivateKeyPart);

        if (!isValid) {
            auditLogService.recordEvent(USER_ID_AUTH_SERVICE, AuditEventType.AccessDenied, 'DigitalIdentity', signerId, `Signature verification failed.`, 'FAILURE');
        }
        return isValid;
    }

    /**
     * Sets the verification level for a user's digital identity.
     * @param userId The ID of the user.
     * @param level The new verification level.
     */
    public setVerificationLevel(userId: string, level: IdentityVerificationLevel): void {
        const identity = this.currentIdentities.get(userId);
        if (identity) {
            this.currentIdentities.set(userId, { ...identity, verificationLevel: level });
            auditLogService.recordEvent(USER_ID_AUTH_SERVICE, AuditEventType.IdentityVerified, 'DigitalIdentity', userId, `Identity verification level set to ${level}.`, 'SUCCESS', { level });
        } else {
            console.warn(`Cannot set verification level for unknown user: ${userId}`);
            auditLogService.recordEvent(USER_ID_AUTH_SERVICE, AuditEventType.AccessDenied, 'DigitalIdentity', userId, `Verification level update failed: user not found.`, 'FAILURE', { level });
        }
    }

    /**
     * Retrieves the verification level for a user.
     * @param userId The ID of the user.
     * @returns The IdentityVerificationLevel.
     */
    public getVerificationLevel(userId: string): IdentityVerificationLevel {
        return this.currentIdentities.get(userId)?.verificationLevel || IdentityVerificationLevel.None;
    }
}
export const identityService = DigitalIdentityService.getInstance();


/**
 * This AuditLogService provides an immutable and cryptographically auditable record of all critical system events.
 * Business value: Ensures transparency, accountability, and compliance across the financial infrastructure.
 * By maintaining a tamper-evident log of every transaction, user action, and agent decision, it provides an
 * undeniable source of truth for regulatory audits, dispute resolution, and forensic analysis. This
 * capability is fundamental for establishing trust with users and regulators, significantly reducing
 * legal and operational risks, and driving enterprise-grade reliability.
 */
export class AuditLogService {
    private static instance: AuditLogService;
    private constructor() {}

    public static getInstance(): AuditLogService {
        if (!AuditLogService.instance) {
            AuditLogService.instance = new AuditLogService();
        }
        return AuditLogService.instance;
    }

    /**
     * Records a critical system event, including a simulated cryptographic signature.
     * @param actorId The ID of the entity performing the action (user, agent, system).
     * @param eventType The type of audit event.
     * @param entityType The type of entity affected.
     * @param entityId The ID of the entity affected.
     * @param message A descriptive message for the event.
     * @param status The outcome of the event (SUCCESS/FAILURE).
     * @param payload The relevant data payload for the event.
     * @returns The created AuditLogEntry.
     */
    public recordEvent(
        actorId: string,
        eventType: AuditEventType,
        entityType: string,
        entityId: string,
        message: string,
        status: 'SUCCESS' | 'FAILURE',
        payload: any = {}
    ): AuditLogEntry {
        const previousLog = this.getLastLogEntry();
        const payloadString = JSON.stringify(payload);
        const payloadHash = btoa(payloadString); // Simulate hashing payload
        const entry: AuditLogEntry = {
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            actorId,
            eventType,
            entityType,
            entityId,
            message,
            status,
            payloadHash: previousLog ? btoa(previousLog.payloadHash + payloadHash) : payloadHash, // Simple hash chaining simulation
            signature: identityService.signData({ ...payload, timestamp: DateUtils.getNowISO(), actorId, eventType, entityType, entityId }, actorId), // Event signed by actor
        };
        dataStore.setItem('AuditLogEntry', entry);
        return entry;
    }

    /**
     * Retrieves all recorded audit log entries.
     * @returns An array of AuditLogEntry objects.
     */
    public getAllLogEntries(): AuditLogEntry[] {
        return dataStore.getAllItems<AuditLogEntry>('AuditLogEntry').sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    /**
     * Retrieves the last recorded audit log entry.
     * @returns The last AuditLogEntry or null if no entries exist.
     */
    private getLastLogEntry(): AuditLogEntry | null {
        const allLogs = this.getAllLogEntries();
        return allLogs.length > 0 ? allLogs[0] : null;
    }

    /**
     * Verifies the integrity of an audit log entry using its signature.
     * @param entry The AuditLogEntry to verify.
     * @returns True if the signature is valid, false otherwise.
     */
    public verifyLogEntryIntegrity(entry: AuditLogEntry): boolean {
        const payloadToVerify = {
            timestamp: entry.timestamp,
            actorId: entry.actorId,
            eventType: entry.eventType,
            entityType: entry.entityType,
            entityId: entry.entityId,
            payloadHash: entry.payloadHash,
            message: entry.message,
            status: entry.status,
            // Exclude signature and id from payload for verification
        };
        return identityService.verifySignature(payloadToVerify, entry.signature, entry.actorId);
    }
}
export const auditLogService = AuditLogService.getInstance();


/**
 * This AccessControlService provides a role-based access control (RBAC) mechanism.
 * Business value: Enforces granular security policies across the platform, ensuring that users and agents
 * can only perform authorized actions on specific resources. This is fundamental for protecting sensitive
 * financial data, maintaining operational integrity, and complying with stringent regulatory requirements.
 * Robust access control prevents unauthorized data breaches and ensures that only trusted entities can
 * interact with critical system functionalities.
 */
export class AccessControlService {
    private static instance: AccessControlService;
    private permissions: Map<string, string[]> = new Map(); // userId/agentId -> roles
    private rolePermissions: Map<string, string[]> = new Map(); // role -> list of permissions (e.g., 'read_profile', 'edit_profile', 'issue_token')

    private constructor() {
        this.initializeRolesAndPermissions();
    }

    public static getInstance(): AccessControlService {
        if (!AccessControlService.instance) {
            AccessControlService.instance = new AccessControlService();
        }
        return AccessControlService.instance;
    }

    /**
     * Initializes default roles and their associated permissions.
     * In a real system, these would be fetched from a persistent store.
     */
    private initializeRolesAndPermissions(): void {
        this.rolePermissions.set('admin', ['*']); // Admins have all permissions
        this.rolePermissions.set('user', [
            'read_profile', 'edit_profile', 'view_goals', 'manage_goals', 'view_applications', 'manage_applications',
            'view_interview_sessions', 'manage_interview_sessions', 'view_skills', 'generate_skills',
            'view_market_trends', 'generate_negotiation_script', 'optimize_linkedin', 'generate_brand_statement',
            'prepare_performance_review', 'view_network', 'manage_network', 'generate_network_message',
            'view_projects', 'manage_projects', 'generate_project_ideas', 'view_mentorship', 'match_mentors',
            'schedule_mentorship', 'view_learning_resources', 'view_portfolio', 'manage_portfolio', 'review_portfolio',
            'generate_content_ideas', 'view_daily_plan', 'manage_daily_plan', 'view_tokens', 'spend_tokens', 'view_audit_log'
        ]);
        this.rolePermissions.set('agent_ai', [
            'read_profile', 'generate_resume_suggestions', 'generate_cover_letter', 'generate_skill_gap_analysis',
            'generate_career_paths', 'generate_interview_questions', 'get_interview_feedback',
            'generate_salary_negotiation', 'generate_linkedin_optimization', 'generate_performance_review',
            'generate_market_trends', 'generate_networking_message', 'generate_project_ideas_ai',
            'match_mentors_ai', 'review_portfolio_ai', 'generate_content_ideas_ai', 'generate_daily_plan_ai'
        ]);
        this.rolePermissions.set('auditor', ['read_audit_log']); // For audit purposes
        this.rolePermissions.set('auth_service', ['manage_identity']);
        this.rolePermissions.set('orchestrator', ['execute_agent_tasks']);

        // Assign default roles (simulation)
        this.permissions.set(USER_ID, ['user']);
        this.permissions.set(USER_ID_SYSTEM, ['admin', 'agent_ai']); // System agent can act as AI and admin
        this.permissions.set(USER_ID_AGENT_ORCHESTRATOR, ['orchestrator']);
        this.permissions.set(USER_ID_AUTH_SERVICE, ['auth_service']);
    }

    /**
     * Assigns a role to a specific entity.
     * @param entityId The ID of the entity.
     * @param role The role to assign.
     */
    public assignRole(entityId: string, role: string): void {
        const currentRoles = this.permissions.get(entityId) || [];
        if (!currentRoles.includes(role)) {
            currentRoles.push(role);
            this.permissions.set(entityId, currentRoles);
            auditLogService.recordEvent(USER_ID_AUTH_SERVICE, AuditEventType.ProfileUpdated, 'UserAccess', entityId, `Role '${role}' assigned.`, 'SUCCESS');
        }
    }

    /**
     * Checks if an entity has permission to perform an action on a resource.
     * @param entityId The ID of the entity (user or agent).
     * @param action The specific action being attempted (e.g., 'edit_profile', 'issue_token').
     * @param resource The resource being accessed (optional, for future granular control).
     * @returns True if the entity has permission, false otherwise.
     */
    public hasPermission(entityId: string, action: string, resource?: string): boolean {
        const entityRoles = this.permissions.get(entityId);
        if (!entityRoles || entityRoles.length === 0) {
            auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.AccessDenied, 'AccessControl', entityId, `Permission denied for action '${action}': no roles assigned.`, 'FAILURE', { action, resource });
            return false;
        }

        for (const role of entityRoles) {
            const allowedPermissions = this.rolePermissions.get(role);
            if (allowedPermissions && (allowedPermissions.includes('*') || allowedPermissions.includes(action))) {
                return true;
            }
        }
        auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.AccessDenied, 'AccessControl', entityId, `Permission denied for action '${action}': insufficient role.`, 'FAILURE', { action, resource });
        return false;
    }
}
export const accessControlService = AccessControlService.getInstance();


/**
 * This AgentOrchestrationService coordinates tasks between various intelligent agents within the platform.
 * Business value: Enables the platform to leverage autonomous AI capabilities by providing a centralized
 * coordination and logging mechanism for agent interactions. It ensures message ordering, maintains
 * auditable logs of every agent action, and integrates with role-based permissions, allowing complex
 * workflows to be executed reliably and securely. This system is crucial for scalable automation,
 * enabling new levels of operational intelligence and cost reduction.
 */
export class AgentOrchestrationService {
    private static instance: AgentOrchestrationService;
    private constructor() {}

    public static getInstance(): AgentOrchestrationService {
        if (!AgentOrchestrationService.instance) {
            AgentOrchestrationService.instance = new AgentOrchestrationService();
        }
        return AgentOrchestrationService.instance;
    }

    /**
     * Coordinates a task by an agent, recording the action in the audit log.
     * @param agentId The ID of the agent performing the task.
     * @param taskName A descriptive name for the task.
     * @param payload The data payload associated with the task.
     * @param requiringUserAction If the agent's task needs further user input/review.
     * @returns A Promise that resolves to the result of the agent's action (simulated).
     */
    public async coordinateTask<T>(
        agentId: string,
        taskName: string,
        payload: any,
        requiringUserAction: boolean = false
    ): Promise<T> {
        if (!accessControlService.hasPermission(agentId, 'execute_agent_tasks')) {
            throw new CustomError(`Agent ${agentId} lacks permission to execute tasks.`, 'AGENT_PERMISSION_DENIED');
        }

        // Simulate agent executing a task
        console.log(`Agent ${agentId} is coordinating task: ${taskName} with payload:`, payload);

        // Record the initiation of the agent task
        auditLogService.recordEvent(
            agentId,
            EventType.AITaskCompleted, // Using AITaskCompleted for now, could be more granular
            'AgentTask',
            generateId(), // Task ID
            `Agent ${agentId} initiated task: ${taskName}`,
            'SUCCESS', // Assume initiation is always successful
            { taskName, payload }
        );

        // Simulate a delay for agent processing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        // For this file, the "agent" is primarily the CareerAIClient, which returns a direct result.
        // In a more complex setup, this would dispatch to different agent skills.
        // Here, we just return the payload as a placeholder, expecting the actual AI call to be made by the caller.
        const simulatedResult: T = { status: 'completed', message: `Task '${taskName}' processed by ${agentId}.`, requiresReview: requiringUserAction, ...payload } as T;

        auditLogService.recordEvent(
            agentId,
            EventType.AITaskCompleted,
            'AgentTask',
            generateId(), // New Task ID or same as initiation
            `Agent ${agentId} completed task: ${taskName}`,
            'SUCCESS',
            { taskName, result: simulatedResult }
        );

        return simulatedResult;
    }
}
export const agentOrchestrationService = AgentOrchestrationService.getInstance();


/**
 * This TokenizedRewardService simulates a programmable value rail, enabling the issuance and transfer of digital tokens.
 * Business value: Creates a dynamic incentive layer within the platform, driving user engagement and motivating
 * completion of career development milestones. It allows for the tokenization of value (e.g., "CareerCoin" for learning,
 * "SkillPoint" for achievement), opening avenues for new business models like gamification, micro-incentives,
 * and integration with broader digital economies. This directly contributes to user retention and can foster a vibrant
 * community-driven ecosystem.
 */
export class TokenizedRewardService {
    private static instance: TokenizedRewardService;
    private accounts: Map<string, TokenAccount> = new Map(); // userId_tokenType -> TokenAccount

    private constructor() {
        this.initializeDefaultAccounts();
    }

    public static getInstance(): TokenizedRewardService {
        if (!TokenizedRewardService.instance) {
            TokenizedRewardService.instance = new TokenizedRewardService();
        }
        return TokenizedRewardService.instance;
    }

    /**
     * Initializes default token accounts for the user and system.
     */
    private initializeDefaultAccounts(): void {
        this.loadAccount(USER_ID, TokenType.CareerCoin, 100); // Default user starts with 100 CareerCoin
        this.loadAccount(USER_ID_SYSTEM, TokenType.CareerCoin, 1000000); // System holds large supply
    }

    /**
     * Loads or creates a token account.
     * @param userId The ID of the user.
     * @param tokenType The type of token.
     * @param initialBalance The initial balance if creating a new account.
     * @returns The TokenAccount object.
     */
    private loadAccount(userId: string, tokenType: TokenType, initialBalance: number = 0): TokenAccount {
        const key = `${userId}_${tokenType}`;
        let account = dataStore.getItem<TokenAccount>('TokenAccount', key);
        if (!account) {
            account = {
                userId,
                tokenType,
                balance: initialBalance,
                lastUpdated: DateUtils.getNowISO(),
                id: key, // Use key as ID for simplicity
                signature: identityService.signData({ userId, tokenType, balance: initialBalance }),
                nonce: generateId()
            };
            dataStore.setItem('TokenAccount', account);
        }
        this.accounts.set(key, account);
        return account;
    }

    /**
     * Issues new tokens to a user.
     * @param userId The ID of the user to issue tokens to.
     * @param amount The amount of tokens to issue.
     * @param tokenType The type of token.
     * @param memo A description for the transaction.
     * @returns The updated TokenAccount.
     */
    public async issueToken(userId: string, amount: number, tokenType: TokenType, memo: string = 'Token issuance'): Promise<TokenAccount> {
        if (!accessControlService.hasPermission(USER_ID_SYSTEM, 'issue_token')) {
            throw new CustomError('System lacks permission to issue tokens.', 'PERMISSION_DENIED');
        }
        if (amount <= 0) throw new CustomError('Amount must be positive.', 'INVALID_AMOUNT');

        const userAccount = this.loadAccount(userId, tokenType);
        userAccount.balance += amount;
        userAccount.lastUpdated = DateUtils.getNowISO();
        userAccount.nonce = generateId();
        userAccount.signature = identityService.signData(userAccount, userId); // User signs their updated balance

        dataStore.setItem('TokenAccount', userAccount);

        const transaction: TokenTransaction = {
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            senderId: USER_ID_SYSTEM,
            receiverId: userId,
            amount,
            tokenType,
            memo,
            status: 'COMPLETED',
            transactionHash: btoa(JSON.stringify({ sender: USER_ID_SYSTEM, receiver: userId, amount, tokenType, memo })),
            signature: identityService.signData({ sender: USER_ID_SYSTEM, receiver: userId, amount, tokenType, memo }, USER_ID_SYSTEM),
        };
        dataStore.setItem('TokenTransaction', transaction);
        auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.TokenIssued, 'TokenAccount', userId, `Issued ${amount} ${tokenType} to ${userId}.`, 'SUCCESS', { amount, tokenType, memo });
        webhookProcessor.receiveEvent({ eventType: 'TOKEN_ISSUED_EVENT', payload: { userId, amount, tokenType, memo } });
        return userAccount;
    }

    /**
     * Transfers tokens from one user to another.
     * @param senderId The ID of the sender.
     * @param receiverId The ID of the receiver.
     * @param amount The amount of tokens to transfer.
     * @param tokenType The type of token.
     * @param memo A description for the transaction.
     * @returns The updated TokenAccount of the sender.
     */
    public async transferTokens(senderId: string, receiverId: string, amount: number, tokenType: TokenType, memo: string = 'Token transfer'): Promise<TokenAccount> {
        if (!accessControlService.hasPermission(senderId, 'transfer_token')) { // Assuming users can transfer their own tokens
            throw new CustomError(`User ${senderId} lacks permission to transfer tokens.`, 'PERMISSION_DENIED');
        }
        if (amount <= 0) throw new CustomError('Amount must be positive.', 'INVALID_AMOUNT');

        const senderAccount = this.loadAccount(senderId, tokenType);
        if (senderAccount.balance < amount) {
            throw new CustomError('Insufficient token balance.', 'INSUFFICIENT_FUNDS');
        }

        const receiverAccount = this.loadAccount(receiverId, tokenType);

        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        senderAccount.lastUpdated = DateUtils.getNowISO();
        receiverAccount.lastUpdated = DateUtils.getNowISO();

        // Simulate new nonces and re-sign
        senderAccount.nonce = generateId();
        senderAccount.signature = identityService.signData(senderAccount, senderId);
        receiverAccount.nonce = generateId();
        receiverAccount.signature = identityService.signData(receiverAccount, receiverId);

        dataStore.setItem('TokenAccount', senderAccount);
        dataStore.setItem('TokenAccount', receiverAccount);

        const transaction: TokenTransaction = {
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            senderId,
            receiverId,
            amount,
            tokenType,
            memo,
            status: 'COMPLETED',
            transactionHash: btoa(JSON.stringify({ senderId, receiverId, amount, tokenType, memo })),
            signature: identityService.signData({ senderId, receiverId, amount, tokenType, memo }, senderId), // Sender signs the transaction
        };
        dataStore.setItem('TokenTransaction', transaction);
        auditLogService.recordEvent(senderId, AuditEventType.TokenTransferred, 'TokenAccount', senderId, `Transferred ${amount} ${tokenType} from ${senderId} to ${receiverId}.`, 'SUCCESS', { amount, tokenType, receiverId, memo });
        return senderAccount;
    }

    /**
     * Retrieves the token balance for a specific user and token type.
     * @param userId The ID of the user.
     * @param tokenType The type of token.
     * @returns The balance of the specified token type.
     */
    public getBalance(userId: string, tokenType: TokenType): number {
        return this.loadAccount(userId, tokenType).balance;
    }

    /**
     * Retrieves all token transactions.
     * @returns An array of TokenTransaction objects.
     */
    public getAllTokenTransactions(): TokenTransaction[] {
        return dataStore.getAllItems<TokenTransaction>('TokenTransaction');
    }
}
export const tokenizedRewardService = TokenizedRewardService.getInstance();


/**
 * This PaymentGatewayService simulates a real-time settlement engine for processing value movements.
 * Business value: Enables the platform to offer paid services and premium features, directly generating
 * revenue. By simulating real-time payment processing, balance validation, and risk scoring, it lays
 * the groundwork for a fully functional financial layer. This ensures that monetary transactions are
 * fast, secure, and auditable, critical for monetizing career development resources and driving
 * sustained business growth.
 */
export class PaymentGatewayService {
    private static instance: PaymentGatewayService;
    private constructor() {}

    public static getInstance(): PaymentGatewayService {
        if (!PaymentGatewayService.instance) {
            PaymentGatewayService.instance = new PaymentGatewayService();
        }
        return PaymentGatewayService.instance;
    }

    /**
     * Simulates processing a payment from a payer to a payee.
     * @param payerId The ID of the entity making the payment.
     * @param payeeId The ID of the entity receiving the payment.
     * @param amount The amount of money to transfer.
     * @param currency The currency of the transaction.
     * @param memo A description for the payment.
     * @returns A Promise that resolves to the created PaymentRecord.
     */
    public async processPayment(
        payerId: string,
        payeeId: string,
        amount: number,
        currency: string = 'USD',
        memo: string = 'Service payment'
    ): Promise<PaymentRecord> {
        if (!accessControlService.hasPermission(payerId, 'process_payment')) {
            throw new CustomError(`Payer ${payerId} lacks permission to process payments.`, 'PERMISSION_DENIED');
        }
        if (amount <= 0) throw new CustomError('Amount must be positive.', 'INVALID_AMOUNT');
        // Simulate risk scoring - e.g., flag large amounts or unusual patterns
        const isHighRisk = amount > 1000 || Math.random() < 0.05; // 5% random chance of high risk

        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 100));

        const status = isHighRisk ? 'PENDING' : 'COMPLETED'; // High risk payments might be pending review

        const paymentRecord: PaymentRecord = {
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            payerId,
            payeeId,
            amount,
            currency,
            memo,
            status,
            transactionHash: btoa(JSON.stringify({ payerId, payeeId, amount, currency, memo, timestamp: DateUtils.getNowISO() })),
            signature: identityService.signData({ payerId, payeeId, amount, currency, memo }, payerId),
        };
        dataStore.setItem('PaymentRecord', paymentRecord);
        auditLogService.recordEvent(payerId, AuditEventType.PaymentProcessed, 'PaymentRecord', paymentRecord.id, `Payment for ${amount} ${currency} from ${payerId} to ${payeeId}. Status: ${status}`, status === 'COMPLETED' ? 'SUCCESS' : 'FAILURE', { amount, currency, payeeId, memo, isHighRisk });

        if (isHighRisk) {
            notificationService.addNotification({
                type: 'warning',
                message: `Payment of ${amount} ${currency} to ${payeeId} flagged for review. Status: PENDING.`,
                actionLink: `/payments/${paymentRecord.id}`
            });
            throw new CustomError('Payment flagged as high risk and is pending review.', 'PAYMENT_PENDING_RISK_REVIEW');
        } else {
            notificationService.addNotification({
                type: 'success',
                message: `Payment of ${amount} ${currency} to ${payeeId} completed successfully.`,
                actionLink: `/payments/${paymentRecord.id}`
            });
        }

        return paymentRecord;
    }

    /**
     * Retrieves all payment records.
     * @returns An array of PaymentRecord objects.
     */
    public getAllPaymentRecords(): PaymentRecord[] {
        return dataStore.getAllItems<PaymentRecord>('PaymentRecord');
    }
}
export const paymentGatewayService = PaymentGatewayService.getInstance();


/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.6: Security Utilities
 * ---------------------------------------------------------------------------------------------------------------------
 * This module provides cryptographic integrity utilities for data structures.
 * Business value: Ensures the authenticity and immutability of critical data, protecting against tampering and fraud.
 * By embedding cryptographic signatures and nonces, every significant data record becomes auditable and verifiable,
 * which is paramount for a financial infrastructure. This dramatically increases trust, reduces risk, and provides
 * a strong foundation for compliance and data governance.
 */
export const SecurityUtils = {
    /**
     * Attaches a simulated signature and nonce to a data object.
     * This is a simplified simulation for illustrative purposes, not real cryptography.
     * @param data The data object to sign.
     * @param signerId The ID of the entity signing the data.
     * @returns The data object with `signature` and `nonce` properties added.
     */
    signObject<T extends { id: string, signature?: string, nonce?: string }>(data: T, signerId: string = USER_ID): T {
        const nonce = generateId();
        const dataToSign = { ...data, nonce }; // Include nonce in data for signature
        delete dataToSign.signature; // Don't sign the signature itself
        const signature = identityService.signData(dataToSign, signerId);
        return { ...data, nonce, signature };
    },

    /**
     * Verifies the integrity of a signed data object.
     * This is a simplified simulation for illustrative purposes, not real cryptography.
     * @param data The signed data object.
     * @param signerId The ID of the entity that signed the data.
     * @returns True if the signature is valid, false otherwise.
     */
    verifyObjectSignature<T extends { id: string, signature?: string, nonce?: string }>(data: T, signerId: string = USER_ID): boolean {
        if (!data.signature || !data.nonce) {
            console.warn(`Object ${data.id} is missing signature or nonce.`);
            return false;
        }
        const dataToVerify = { ...data };
        delete dataToVerify.signature; // Don't verify against the signature itself
        return identityService.verifySignature(dataToVerify, data.signature, signerId);
    },

    /**
     * Generates a simple SHA-256 like hash for a string or object.
     * This is purely illustrative and not a cryptographically secure hash.
     * @param data The data to hash.
     * @returns A base64 encoded string acting as a hash.
     */
    simpleHash(data: any): string {
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        return btoa(dataString + 'SALT_FOR_HASH');
    }
};


/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.7: Idempotent & Fault-Tolerant Operations
 * ---------------------------------------------------------------------------------------------------------------------
 * This module provides utilities to ensure operations are idempotent and fault-tolerant.
 * Business value: Guarantees that repeating an operation (e.g., due to network retry) yields the same result
 * as performing it once, preventing duplicate data creation or incorrect state transitions. This is critical
 * for reliability in distributed systems, especially in financial contexts where consistency and correctness
 * are paramount, reducing data corruption and simplifying error recovery mechanisms.
 */
export class IdempotencyManager {
    private static instance: IdempotencyManager;
    private processedRequests: Set<string> = new Set(); // Stores request IDs that have been processed

    private constructor() {}

    public static getInstance(): IdempotencyManager {
        if (!IdempotencyManager.instance) {
            IdempotencyManager.instance = new IdempotencyManager();
        }
        return IdempotencyManager.instance;
    }

    /**
     * Generates an idempotency key for a given operation and payload.
     * @param operationName A unique identifier for the operation type.
     * @param payload The relevant data for the operation.
     * @param actorId The ID of the entity initiating the operation.
     * @returns A unique string representing the idempotency key.
     */
    public generateKey(operationName: string, payload: any, actorId: string): string {
        const payloadHash = SecurityUtils.simpleHash(payload);
        return `${operationName}:${actorId}:${payloadHash}`;
    }

    /**
     * Checks if an operation with the given idempotency key has already been processed.
     * @param key The idempotency key.
     * @returns True if already processed, false otherwise.
     */
    public isProcessed(key: string): boolean {
        return this.processedRequests.has(key);
    }

    /**
     * Marks an operation with the given idempotency key as processed.
     * @param key The idempotency key.
     */
    public markProcessed(key: string): void {
        this.processedRequests.add(key);
    }
}
export const idempotencyManager = IdempotencyManager.getInstance();


/**
 * =====================================================================================================================
 *  SECTION 2: AI INTEGRATION LAYER (SIMULATED & WRAPPED GEMINI)
 * =====================================================================================================================
 */

/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  2.1: Advanced CareerAIClient (Wraps GoogleGenAI with specific career methods)
 * ---------------------------------------------------------------------------------------------------------------------
 * This class abstracts the raw GoogleGenAI calls into higher-level, career-specific functions,
 * simulating a more complex internal AI engine. It represents the primary "skill execution" module
 * for a specialized career intelligence agent.
 * Business value: This is the core agentic AI layer, providing hyper-personalized insights and automation.
 * It transforms raw user data into actionable career intelligence (skill gaps, pathing, content generation),
 * significantly reducing the time and cost associated with traditional career coaching. The modular, schema-driven
 * design ensures high-quality, predictable AI outputs, increasing trust and adoption. It acts as a configurable
 * simulator, allowing integration with diverse AI models and real-time inference engines in a "live mode," thereby
 * delivering a unique competitive advantage in the talent development market.
 */
export class CareerAIClient {
    private ai: GoogleGenAI;
    private currentModel: string;
    private apiKey: string;
    private defaultUserProfile: UserProfile; // To provide context even if real profile isn't loaded

    constructor(apiKey: string, defaultModel: keyof typeof AI_MODELS = 'balanced') {
        if (!apiKey) {
            throw new CustomError("API_KEY is not provided for CareerAIClient.", "API_KEY_MISSING");
        }
        this.apiKey = apiKey;
        this.ai = new GoogleGenAI({ apiKey });
        this.currentModel = AI_MODELS[defaultModel];
        this.defaultUserProfile = {
            id: 'default', name: 'AI User', email: 'ai@example.com', currentRole: 'Explorer', industry: 'General',
            yearsExperience: 0, careerStage: CareerStage.EntryLevel, skills: [], education: [], certifications: [],
            desiredRoles: [], desiredIndustry: 'Any', salaryExpectationMin: 0, salaryExpectationMax: 0,
            lastUpdated: DateUtils.getNowISO(), resumeText: '', achievements: [], careerVision: '', preferredLearningStyles: [],
            aiModelPreference: 'balanced',
            publicKey: 'AI_DEFAULT_PUB_KEY',
            identityVerificationLevel: IdentityVerificationLevel.None,
            walletAddress: 'AI_DEFAULT_WALLET'
        };
    }

    /**
     * Sets the AI model to be used for subsequent generative calls.
     * @param modelKey The key representing the desired AI model from `AI_MODELS`.
     */
    public setModel(modelKey: keyof typeof AI_MODELS): void {
        const modelName = AI_MODELS[modelKey];
        if (modelName) {
            this.currentModel = modelName;
        } else {
            console.warn(`Invalid AI model key specified: ${modelKey}. Using default: ${this.currentModel}`);
        }
    }

    /**
     * Internal method to call the generative AI model with specified prompt and schema.
     * Includes timeout and robust JSON parsing.
     * @param prompt The text prompt for the AI.
     * @param schema The JSON schema for the expected AI response.
     * @param model The specific AI model to use, defaults to the current model.
     * @param context An optional context object that might influence AI behavior (e.g., agent persona).
     * @returns A Promise resolving to the parsed AI response object.
     */
    private async callGenerativeAI<T>(prompt: string, schema: any, model?: string, context?: any): Promise<T> {
        const selectedModel = model || this.currentModel;
        try {
            const agentAction = await agentOrchestrationService.coordinateTask(
                USER_ID_SYSTEM, // The AI Client itself is an 'agent' here
                `Generative AI call for prompt: ${TextUtils.truncate(prompt, 100)}`,
                { prompt, schema, model: selectedModel, context },
                false // Not requiring user action for generation
            );
            console.log('Agent Orchestrator acknowledged AI task:', agentAction);

            const result = await Promise.race([
                this.ai.getGenerativeModel({
                    model: selectedModel,
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: AI_MODEL_TEMPERATURE
                    }
                }).generateContent(prompt),
                new Promise<any>((_, reject) => setTimeout(() => reject(new CustomError("AI response timed out.", "AI_TIMEOUT")), AI_RESPONSE_TIMEOUT_MS))
            ]);

            const responseText = result.response.text();
            if (!responseText) {
                throw new CustomError("AI returned no text content.", "AI_EMPTY_RESPONSE");
            }

            let parsedJson: T;
            try {
                if (responseText.startsWith("```json")) {
                    parsedJson = JSON.parse(responseText.substring(7, responseText.lastIndexOf('```'))) as T;
                } else {
                    parsedJson = JSON.parse(responseText) as T;
                }
            } catch (jsonError) {
                console.error("Failed to parse AI response JSON:", responseText, jsonError);
                throw new CustomError("AI response was not valid JSON. Raw: " + responseText, "AI_INVALID_JSON_RESPONSE");
            }
            return parsedJson;

        } catch (error) {
            console.error(`Error during AI call with model ${selectedModel}:`, error);
            if (error instanceof CustomError) throw error;
            throw new CustomError(`AI generation failed: ${(error as Error).message}`, "AI_GENERATION_ERROR");
        }
    }

    /**
     * AI method: Analyze Resume for a specific Job Description.
     * @param resumeText The user's resume content.
     * @param jobDescription The target job description.
     * @returns A list of actionable AI suggestions for resume improvement.
     */
    public async analyzeResumeForJob(resumeText: string, jobDescription: string): Promise<AISuggestion[]> {
        const prompt = `You are an expert career coach focused on applicant tracking systems (ATS) and hiring best practices.
            Your task is to analyze a given Resume against a specific Job Description.
            Identify specific areas in the resume that can be improved to better align with the job description.
            For each improvement, provide the 'originalText' (the exact text snippet from the resume that needs change),
            the 'improvedText' (a suggested, more impactful, and relevant replacement),
            a 'rationale' explaining why the change is beneficial (e.g., keyword matching, STAR method, quantifiable impact),
            a 'category' (Resume), and a 'severity' (Minor, Moderate, Major).
            Focus on quantifying achievements, matching keywords, and using strong action verbs.
            Provide ${MAX_RECOMMENDATIONS_PER_AI_CALL} distinct suggestions if possible.

            **Job Description:**\n${jobDescription}\n\n**Resume:**\n${resumeText}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                improvements: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            originalText: { type: 'STRING' },
                            improvedText: { type: 'STRING' },
                            rationale: { type: 'STRING' },
                            category: { type: 'STRING', enum: ['Resume'] },
                            severity: { type: 'STRING', enum: ['Minor', 'Moderate', 'Major'] }
                        },
                        required: ['originalText', 'improvedText', 'rationale', 'category', 'severity']
                    }
                }
            },
            required: ['improvements']
        };

        const response = await this.callGenerativeAI<{ improvements: AISuggestion[] }>(prompt, schema);
        response.improvements.forEach(s => s.id = generateId()); // Ensure IDs for new suggestions
        return response.improvements;
    }

    /**
     * AI method: Generate a tailored Cover Letter.
     * @param userProfile The user's profile data.
     * @param jobApplication The job application details, including job description and company.
     * @param resumeSummary A summary of the user's resume for context.
     * @returns A string containing the generated cover letter.
     */
    public async generateCoverLetter(
        userProfile: UserProfile,
        jobApplication: JobApplication,
        resumeSummary: string
    ): Promise<string> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are an expert cover letter writer.
            Draft a compelling and personalized cover letter for the user based on their profile, resume summary, and the target job description.
            Highlight relevant skills, experience, and achievements that align with the job requirements.
            Ensure a professional tone and a clear call to action. Focus on how the user's unique experiences make them a perfect fit.

            **User Profile:**\nName: ${profile.name}\nCurrent Role: ${profile.currentRole}\nYears Experience: ${profile.yearsExperience}\nSkills: ${profile.skills.join(', ')}\nEducation: ${profile.education.join(', ')}\nCertifications: ${profile.certifications.join(', ')}
            **Job Details:**\nCompany: ${jobApplication.company}\nJob Title: ${jobApplication.jobTitle}\nJob Description:\n${jobApplication.jobDescription}
            **Resume Summary (key points from user's resume for tailoring):**\n${resumeSummary}

            Draft the cover letter as a professional business letter. Start directly with the body, no salutation or signature. Focus on 3-4 key paragraphs.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                coverLetter: { type: Type.STRING, description: "The generated cover letter content." }
            },
            required: ['coverLetter']
        };

        const response = await this.callGenerativeAI<{ coverLetter: string }>(prompt, schema);
        return response.coverLetter;
    }

    /**
     * AI method: Perform a Skill Gap Analysis.
     * @param userProfile The user's current profile.
     * @param targetRoles A list of desired roles or a specific job description.
     * @returns A list of SkillAssessmentResult showing gaps and recommendations.
     */
    public async getSkillGapAnalysis(userProfile: UserProfile, targetRoles: string[] | string): Promise<SkillAssessmentResult[]> {
        const profile = userProfile || this.defaultUserProfile;
        const target = Array.isArray(targetRoles) ? targetRoles.join(', ') : targetRoles;
        const prompt = `You are a career development expert specializing in skill gap analysis.
            Given the user's current profile and their desired target roles/job description,
            identify key skills required for those roles and compare them against the user's existing skills.
            For each identified skill, provide:
            - The skill name and category.
            - A 'currentLevel' (simulated based on user profile and general knowledge, 1-5).
            - A 'targetLevel' required for the desired roles (1-5).
            - The calculated 'gap' (targetLevel - currentLevel).
            - Up to 3 'recommendations' (LearningResource objects with title, link, type, estimatedTime, cost, provider, difficulty, dateAdded)
              to bridge the gap, including courses, certifications, or project ideas. Make sure to assign unique IDs to each resource.
            - 'lastAssessed' date.
            Provide at least ${MAX_RECOMMENDATIONS_PER_AI_CALL} skill assessments.

            **User Profile:**\n${JSON.stringify(profile, null, 2)}
            **Target Roles/Description:**\n${target}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                skillGaps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            skill: { type: Type.STRING },
                            category: { type: 'STRING', enum: Object.values(SkillCategory) },
                            currentLevel: { type: 'NUMBER', minimum: 1, maximum: 5 },
                            targetLevel: { type: 'NUMBER', minimum: 1, maximum: 5 },
                            gap: { type: 'NUMBER', minimum: -4, maximum: 4 },
                            recommendations: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: 'STRING' },
                                        title: { type: 'STRING' },
                                        description: { type: 'STRING' },
                                        type: { type: 'STRING', enum: Object.values(RecommendationType) },
                                        link: { type: 'STRING' },
                                        estimatedTime: { type: 'STRING' },
                                        cost: { type: 'STRING', enum: ['Free', 'Paid', 'Subscription', 'Mixed'] },
                                        relatedSkills: { type: Type.ARRAY, items: { type: 'STRING' } },
                                        provider: { type: 'STRING' },
                                        difficulty: { type: 'STRING', enum: ['Beginner', 'Intermediate', 'Advanced'] },
                                        dateAdded: { type: 'STRING', format: 'date-time' }
                                    },
                                    required: ['id', 'title', 'description', 'type', 'link', 'estimatedTime', 'cost', 'relatedSkills', 'provider', 'difficulty', 'dateAdded']
                                }
                            },
                            lastAssessed: { type: 'STRING', format: 'date-time' }
                        },
                        required: ['skill', 'category', 'currentLevel', 'targetLevel', 'gap', 'recommendations', 'lastAssessed']
                    }
                }
            },
            required: ['skillGaps']
        };

        const response = await this.callGenerativeAI<{ skillGaps: SkillAssessmentResult[] }>(prompt, schema);
        response.skillGaps.forEach(gap => {
            gap.recommendations.forEach(rec => rec.id = rec.id || generateId());
            gap.lastAssessed = DateUtils.getNowISO(); // Ensure current date
            SecurityUtils.signObject(gap, USER_ID_SYSTEM); // Simulate AI signing its assessment
        });
        return response.skillGaps;
    }

    /**
     * AI method: Generate Career Path Recommendations.
     * @param userProfile The user's current profile.
     * @param currentGoals A list of user's current career goals.
     * @returns A list of CareerPathRecommendation objects.
     */
    public async getCareerPathRecommendations(userProfile: UserProfile, currentGoals: CareerGoal[]): Promise<CareerPathRecommendation[]> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are an experienced career counselor.
            Based on the user's current profile and stated career goals, provide 3-5 plausible career path recommendations.
            For each recommendation, include:
            - The recommended role and industry.
            - A brief description of the role.
            - A list of 'requiredSkills' with their category and target level (1-5).
            - The 'averageSalaryRange' (e.g., "$80,000 - $120,000").
            - The 'growthOutlook' for this role.
            - A list of specific 'pathways' (LearningResource/NetworkingEvent recommendations)
              to achieve this career path, including title, type, and a resource (link or description).
            - List up to 3 'potentialMentors' (types/profiles of mentors that would be beneficial).
            - List up to 3 'typicalCompanies' that hire for this role.

            **User Profile:**\n${JSON.stringify(profile, null, 2)}
            **Current Goals:**\n${JSON.stringify(currentGoals.map(g => ({ title: g.title, description: g.description })), null, 2)}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                careerPaths: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            role: { type: Type.STRING },
                            industry: { type: Type.STRING },
                            description: { type: Type.STRING },
                            requiredSkills: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        skill: { type: Type.STRING },
                                        category: { type: 'STRING', enum: Object.values(SkillCategory) },
                                        level: { type: 'NUMBER', minimum: 1, maximum: 5 }
                                    },
                                    required: ['skill', 'category', 'level']
                                }
                            },
                            averageSalaryRange: { type: Type.STRING },
                            growthOutlook: { type: 'STRING', enum: ['Low', 'Medium', 'High', 'Very High'] },
                            pathways: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        title: { type: Type.STRING },
                                        type: { type: 'STRING', enum: Object.values(RecommendationType) },
                                        resource: { type: Type.STRING } // Could be a link or description
                                    },
                                    required: ['title', 'type', 'resource']
                                }
                            },
                            potentialMentors: { type: Type.ARRAY, items: { type: Type.STRING } },
                            typicalCompanies: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['id', 'role', 'industry', 'description', 'requiredSkills', 'averageSalaryRange', 'growthOutlook', 'pathways']
                    }
                }
            },
            required: ['careerPaths']
        };

        const response = await this.callGenerativeAI<{ careerPaths: CareerPathRecommendation[] }>(prompt, schema);
        response.careerPaths.forEach(path => path.id = path.id || generateId());
        return response.careerPaths;
    }

    /**
     * AI method: Generate Interview Questions.
     * @param jobDescription The target job description.
     * @param userProfile The user's profile for contextualizing questions.
     * @param previousQuestions A list of questions already asked, to avoid repetition.
     * @returns A list of InterviewQuestion objects.
     */
    public async generateInterviewQuestions(jobDescription: string, userProfile: UserProfile, previousQuestions: InterviewQuestion[] = []): Promise<InterviewQuestion[]> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are an AI interviewer specializing in ${jobDescription.includes('Software Engineer') ? 'technical software engineering' : 'general professional'} roles.
            Generate 5 relevant interview questions (mix of behavioral, technical, situational, problem-solving, and potentially puzzle questions) based on the provided job description and user profile.
            Avoid asking questions already in 'previousQuestions' list.
            For each question, provide its 'type', 3-5 relevant 'keywords', and a 'suggestedApproach' for answering it effectively (e.g., STAR method, thought process).

            **Job Description:**\n${jobDescription}
            **User Profile:**\n${JSON.stringify({ role: profile.currentRole, skills: profile.skills, yearsExperience: profile.yearsExperience }, null, 2)}
            **Previous Questions Asked:**\n${JSON.stringify(previousQuestions.map(q => q.question), null, 2)}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            question: { type: Type.STRING },
                            type: { type: 'STRING', enum: ['Behavioral', 'Technical', 'Situational', 'Problem-Solving', 'Puzzle'] },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                            suggestedApproach: { type: Type.STRING }
                        },
                        required: ['id', 'question', 'type', 'keywords', 'suggestedApproach']
                    }
                }
            },
            required: ['questions']
        };
        const response = await this.callGenerativeAI<{ questions: InterviewQuestion[] }>(prompt, schema);
        response.questions.forEach(q => q.id = q.id || generateId());
        return response.questions;
    }

    /**
     * AI method: Provide feedback on Interview Answers.
     * @param questionsWithAnswers A list of objects containing question and user's answer.
     * @param jobDescription The job description for context.
     * @param userProfile The user's profile for context.
     * @returns A structured feedback object.
     */
    public async getInterviewFeedback(
        questionsWithAnswers: { question: string; userAnswer: string; }[],
        jobDescription: string,
        userProfile: UserProfile
    ): Promise<{ overallFeedback: string; areasForImprovement: string[]; strengths: string[]; questionsFeedback: { question: string; feedback: string; score: number }[]; score: number }> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are an expert interviewer and career coach providing constructive feedback.
            Analyze the user's answers to the interview questions in the context of the provided job description and user profile.
            For each answer, provide specific feedback, highlighting strengths and areas for improvement, and a score (0-10) for that answer.
            Then, provide an overall feedback summary, general areas for improvement (bullet points), and overall strengths (bullet points).
            Provide an overall session score out of 100 based on all answers.

            **Job Description:**\n${jobDescription}
            **User Profile (Context):**\n${JSON.stringify({ role: profile.currentRole, skills: profile.skills, yearsExperience: profile.yearsExperience }, null, 2)}
            **Questions and User Answers:**\n${JSON.stringify(questionsWithAnswers, null, 2)}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                overallFeedback: { type: Type.STRING },
                areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                questionsFeedback: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            feedback: { type: Type.STRING },
                            score: { type: Type.NUMBER, minimum: 0, maximum: 10 }
                        },
                        required: ['question', 'feedback', 'score']
                    }
                },
                score: { type: Type.NUMBER, minimum: 0, maximum: 100 }
            },
            required: ['overallFeedback', 'areasForImprovement', 'strengths', 'questionsFeedback', 'score']
        };

        return this.callGenerativeAI(prompt, schema);
    }

    /**
     * AI method: Draft Salary Negotiation Script.
     * @param jobTitle The job title.
     * @param company The company name.
     * @param initialOffer The initial salary offer.
     * @param desiredSalary The user's desired salary.
     * @param userProfile The user's profile for leverage.
     * @returns A suggested negotiation script.
     */
    public async getSalaryNegotiationScript(
        jobTitle: string,
        company: string,
        initialOffer: number,
        desiredSalary: number,
        userProfile: UserProfile
    ): Promise<string> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are a professional negotiation coach.
            Draft a confident, respectful, and well-reasoned email/script for negotiating a salary offer.
            The user has received an offer for ${jobTitle} at ${company} for $${initialOffer},
            but desires a salary closer to $${desiredSalary}.
            Leverage the user's experience (${profile.yearsExperience} years as ${profile.currentRole}),
            their key skills (${profile.skills.slice(0, 5).join(', ')}),
            and any other relevant information from their profile (education, certifications, achievements, desired industry) to justify the higher request.
            Include points about market value (reference average salary for desired role if known, or growth outlook), value proposition the user brings, and maintain a positive, collaborative tone.
            The script should be structured as an email, beginning with acknowledging the offer, expressing enthusiasm, presenting the counter-offer with justification, and expressing readiness to discuss.
            Do not include placeholders for salutation/signature, just the core content.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                negotiationScript: { type: Type.STRING, description: "The email content for salary negotiation." }
            },
            required: ['negotiationScript']
        };
        const response = await this.callGenerativeAI<{ negotiationScript: string }>(prompt, schema);
        return response.negotiationScript;
    }

    /**
     * AI method: Optimize LinkedIn Profile Summary.
     * @param userProfile The user's profile.
     * @desiredRoles Desired job roles/target keywords.
     * @returns An optimized LinkedIn summary string.
     */
    public async optimizeLinkedInProfile(userProfile: UserProfile, desiredRoles: string[]): Promise<string> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are a personal branding expert and LinkedIn optimization specialist.
            Craft an engaging, professional, and keyword-rich LinkedIn profile summary for the user.
            Highlight their current role (${profile.currentRole}), years of experience (${profile.yearsExperience} years),
            key skills (${profile.skills.slice(0, MAX_SKILLS_DISPLAY).join(', ')}),
            and aspirations towards "${desiredRoles.join(' or ')}" or related roles.
            The summary should be concise (1-2 paragraphs), professional, include relevant industry keywords,
            and clearly articulate the user's value proposition to attract recruiters and professional connections.
            Incorporate elements from their career vision and top achievements if available.

            **User Profile:**\n${JSON.stringify(profile, null, 2)}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                linkedInSummary: { type: Type.STRING, description: "Optimized LinkedIn summary text." }
            },
            required: ['linkedInSummary']
        };
        const response = await this.callGenerativeAI<{ linkedInSummary: string }>(prompt, schema);
        return response.linkedInSummary;
    }

    /**
     * AI method: Generate Performance Review Preparation bullet points.
     * @param userProfile The user's profile.
     * @param achievements A list of raw achievement descriptions.
     * @returns A list of bullet points formatted for performance reviews.
     */
    public async preparePerformanceReview(userProfile: UserProfile, achievements: string[]): Promise<string[]> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are an executive coach assisting with performance review preparation.
            Transform the user's raw achievement descriptions into powerful, quantifiable bullet points
            suitable for a self-assessment or discussion during a performance review.
            Use the STAR method where appropriate (Situation, Task, Action, Result) and focus on measurable impact and value delivered.
            Ensure each point is concise and impactful. Provide at least ${Math.min(achievements.length, MAX_RECOMMENDATIONS_PER_AI_CALL)} bullet points.

            **User Role:** ${profile.currentRole}
            **Raw Achievements:**\n${achievements.map(a => `- ${a}`).join('\n')}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                reviewPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ['reviewPoints']
        };
        const response = await this.callGenerativeAI<{ reviewPoints: string[] }>(prompt, schema);
        return response.reviewPoints;
    }

    /**
     * AI method: Analyze Market Trends.
     * @param industry The industry to analyze.
     * @param keywords Specific keywords to focus on.
     * @returns A list of relevant market trends.
     */
    public async getMarketTrends(industry: string, keywords: string[]): Promise<MarketTrend[]> {
        const prompt = `You are a market research analyst for career development.
            Provide ${MAX_RECOMMENDATIONS_PER_AI_CALL} significant market trends relevant to the "${industry}" industry, focusing on "${keywords.join(', ')}".
            For each trend, include:
            - A concise title and description.
            - The 'impactOnCareer' for professionals in this field.
            - 3-5 'relevantSkills' that are becoming important due to this trend.
            - A 'source' (simulated, e.g., "Industry Report 2024", "TechCrunch").
            - The 'date' of the trend identification (ISO format).
            - 2-3 'suggestedActions' for professionals to adapt to this trend.

            Simulate realistic and actionable insights.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                trends: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            impactOnCareer: { type: Type.STRING },
                            relevantSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                            source: { type: Type.STRING },
                            date: { type: Type.STRING, format: 'date-time' },
                            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['id', 'title', 'description', 'impactOnCareer', 'relevantSkills', 'source', 'date', 'suggestedActions']
                    }
                }
            },
            required: ['trends']
        };
        const response = await this.callGenerativeAI<{ trends: MarketTrend[] }>(prompt, schema);
        response.trends.forEach(t => t.id = t.id || generateId());
        return response.trends;
    }

    /**
     * AI method: Generate Networking Message/Email.
     * @param userProfile The user's profile.
     * @param contact The network contact to message.
     * @param purpose The purpose of the message (e.g., "informational interview", "job referral").
     * @returns A suggested networking message.
     */
    public async generateNetworkingMessage(userProfile: UserProfile, contact: NetworkContact, purpose: string): Promise<string> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are a networking and professional communication expert.
            Draft a concise, polite, and effective networking message/email for the user to send to a contact.
            The purpose of the message is: "${purpose}".
            Tailor the message to the user's background and the contact's profile.
            Include a clear call to action. Assume a previous connection if 'lastContactDate' is recent.

            **User Profile:**\nName: ${profile.name}\nCurrent Role: ${profile.currentRole}\nIndustry: ${profile.industry}\nDesired Roles: ${profile.desiredRoles.join(', ')}
            **Network Contact:**\nName: ${contact.name}\nCompany: ${contact.company}\nRole: ${contact.role}\nConnection Date: ${DateUtils.formatDate(contact.connectionDate)}\nLast Contact: ${DateUtils.formatDate(contact.lastContactDate)}

            Draft the message, focusing on professionalism and value exchange, without salutation placeholder and signature, but ready to insert.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                networkingMessage: { type: Type.STRING, description: "The generated networking message." }
            },
            required: ['networkingMessage']
        };
        const response = await this.callGenerativeAI<{ networkingMessage: string }>(prompt, schema);
        return response.networkingMessage;
    }

    /**
     * AI method: Suggest Personal Project Ideas.
     * @param userProfile The user's profile.
     * @param targetSkills Skills the user wants to develop.
     * @param careerGoal Focus career goal if any.
     * @returns A list of PersonalProject ideas.
     */
    public async suggestProjectIdeas(userProfile: UserProfile, targetSkills: string[], careerGoal?: string): Promise<Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'technologiesUsed' | 'endDate' | 'signature' | 'nonce'>[]> {
        const profile = userProfile || this.defaultUserProfile;
        const goalContext = careerGoal ? `to help achieve the goal: "${careerGoal}"` : 'to enhance their profile';
        const prompt = `You are a product ideation and career development specialist.
            Generate ${MAX_RECOMMENDATIONS_PER_AI_CALL} practical and impactful personal project ideas for the user.
            These projects should help the user develop their 'targetSkills' (${targetSkills.join(', ')})
            and ideally contribute towards their career goals and desired roles.
            For each idea, provide a clear 'title', a detailed 'description' outlining the project,
            and specify 3-5 'skillsDeveloped' and suggested 'technologiesUsed'.
            Make sure the projects are realistic for a personal endeavor.

            **User Profile:**\n${JSON.stringify({ currentRole: profile.currentRole, industry: profile.industry, existingSkills: profile.skills.slice(0, MAX_SKILLS_DISPLAY) }, null, 2)}
            **Focus:** User wants to develop skills: ${targetSkills.join(', ')} ${goalContext}.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                projectIdeas: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            skillsDeveloped: { type: Type.ARRAY, items: { type: Type.STRING } },
                            technologiesUsed: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['title', 'description', 'skillsDeveloped', 'technologiesUsed']
                    }
                }
            },
            required: ['projectIdeas']
        };
        const response = await this.callGenerativeAI<{ projectIdeas: Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'endDate'>[] }>(prompt, schema);
        return response.projectIdeas;
    }

    /**
     * AI method: Match Mentors to User Profile.
     * @param userProfile The user's profile.
     * @param existingMentors A list of available mentor profiles.
     * @param numberOfMatches Desired number of mentor matches.
     * @returns A list of suggested MentorProfile IDs.
     */
    public async matchMentors(userProfile: UserProfile, existingMentors: MentorProfile[], numberOfMatches: number = 3): Promise<MentorProfile[]> {
        const profile = userProfile || this.defaultUserProfile;
        if (existingMentors.length === 0) return [];

        const prompt = `You are an AI-powered mentorship matching service.
            Given the user's profile and a list of available mentors, select the top ${numberOfMatches} best-suited mentors.
            Consider alignment in industry, desired career path, skill development needs, and career stage.
            Explain the rationale for each match.

            **User Profile:**\n${JSON.stringify(profile, null, 2)}
            **Available Mentors:**\n${JSON.stringify(existingMentors.map(m => ({ id: m.id, name: m.name, industry: m.industry, role: m.currentRole, specialties: m.specialties, yearsExperience: m.yearsExperience })), null, 2)}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                matchedMentors: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            mentorId: { type: Type.STRING },
                            rationale: { type: Type.STRING }
                        },
                        required: ['mentorId', 'rationale']
                    }
                }
            },
            required: ['matchedMentors']
        };

        const response = await this.callGenerativeAI<{ matchedMentors: { mentorId: string; rationale: string }[] }>(prompt, schema);
        const matchedMentorIds = response.matchedMentors.map(m => m.mentorId);
        return existingMentors.filter(m => matchedMentorIds.includes(m.id));
    }

    /**
     * AI method: Review Portfolio Item.
     * @param portfolioItem The specific portfolio item to review.
     * @param userProfile The user's profile.
     * @param targetJobDescription Optional: specific job description for context.
     * @returns A list of AISuggestion for improvement.
     */
    public async reviewPortfolioItem(portfolioItem: PortfolioItem, userProfile: UserProfile, targetJobDescription?: string): Promise<AISuggestion[]> {
        const profile = userProfile || this.defaultUserProfile;
        const jobContext = targetJobDescription ? `with an eye towards the following job: ${targetJobDescription}` : '';
        const prompt = `You are an expert portfolio reviewer.
            Review the provided portfolio item against the user's profile and, if applicable, a target job description.
            Identify areas for improvement in presentation, description, clarity of impact, or alignment with career goals/target jobs.
            Provide specific 'originalText' (if applicable to description), 'improvedText', 'rationale', 'category' (General), and 'severity'.
            Aim for ${MAX_RECOMMENDATIONS_PER_AI_CALL} actionable suggestions.

            **User Profile:**\n${JSON.stringify({ role: profile.currentRole, skills: profile.skills, desiredRoles: profile.desiredRoles }, null, 2)}
            **Portfolio Item:**\n${JSON.stringify(portfolioItem, null, 2)}
            **Target Job Context:** ${jobContext}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            originalText: { type: Type.STRING },
                            improvedText: { type: Type.STRING },
                            rationale: { type: Type.STRING },
                            category: { type: 'STRING', enum: ['General', 'Portfolio'] },
                            severity: { type: 'STRING', enum: ['Minor', 'Moderate', 'Major'] }
                        },
                        required: ['originalText', 'improvedText', 'rationale', 'category', 'severity']
                    }
                }
            },
            required: ['suggestions']
        };
        const response = await this.callGenerativeAI<{ suggestions: AISuggestion[] }>(prompt, schema);
        response.suggestions.forEach(s => s.id = generateId());
        return response.suggestions;
    }

    /**
     * AI method: Generate Content Ideas (e.g., blog posts, speaking topics).
     * @param userProfile The user's profile.
     * @param contentType The type of content (e.g., 'blog post', 'conference talk').
     * @param focusArea Specific area for content.
     * @returns A list of content ideas with outlines.
     */
    public async generateContentIdeas(userProfile: UserProfile, contentType: string, focusArea: string): Promise<{ title: string; outline: string; targetAudience: string; keywords: string[] }[]> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are a content strategist and thought leader.
            Generate ${MAX_RECOMMENDATIONS_PER_AI_CALL} compelling content ideas for the user, suitable for a "${contentType}".
            The content should focus on "${focusArea}" and leverage the user's expertise.
            For each idea, provide a catchy 'title', a detailed 'outline' (3-5 key sections/points),
            the 'targetAudience', and 3-5 relevant 'keywords'.

            **User Profile:**\n${JSON.stringify({ role: profile.currentRole, industry: profile.industry, skills: profile.skills.slice(0, 5) }, null, 2)}
            **Content Type:** ${contentType}
            **Focus Area:** ${focusArea}`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                ideas: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            outline: { type: Type.STRING },
                            targetAudience: { type: Type.STRING },
                            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['title', 'outline', 'targetAudience', 'keywords']
                    }
                }
            },
            required: ['ideas']
        };
        const response = await this.callGenerativeAI<{ ideas: { title: string; outline: string; targetAudience: string; keywords: string[] }[] }>(prompt, schema);
        return response.ideas;
    }

    /**
     * AI method: Generate a Personal Brand Statement.
     * @param userProfile The user's profile.
     * @param desiredImpact The desired impact or perception the user wants to convey.
     * @returns A generated PersonalBrandStatement.
     */
    public async generatePersonalBrandStatement(userProfile: UserProfile, desiredImpact: string): Promise<PersonalBrandStatement> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are a personal branding consultant.
            Craft a concise and powerful personal brand statement for the user.
            This statement should encapsulate their unique value proposition, expertise,
            and desired career direction, aiming to achieve the 'desiredImpact': "${desiredImpact}".
            It should be memorable, authentic, and resonate with their target audience (recruiters, peers, clients).
            Also provide a rationale for the statement and 3-5 keywords associated with it.

            **User Profile:**\n${JSON.stringify({
                name: profile.name,
                currentRole: profile.currentRole,
                industry: profile.industry,
                yearsExperience: profile.yearsExperience,
                skills: profile.skills.slice(0, 5),
                desiredRoles: profile.desiredRoles,
                careerVision: profile.careerVision,
                achievements: profile.achievements.slice(0, 3)
            }, null, 2)}
            **Desired Impact:** ${desiredImpact}

            Output must include the statement, rationale, and keywords.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                statement: { type: Type.STRING },
                rationale: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['statement', 'rationale', 'keywords']
        };
        const response = await this.callGenerativeAI<{ statement: string; rationale: string; keywords: string[] }>(prompt, schema);
        return SecurityUtils.signObject({
            id: generateId(),
            statement: response.statement,
            version: 1, // Start at version 1
            generatedDate: DateUtils.getNowISO(),
            rationale: response.rationale,
            keywords: response.keywords
        }, USER_ID_SYSTEM); // AI signs its own generation
    }

    /**
     * AI method: Generate Daily Career Development Plan.
     * @param userProfile The user's profile.
     * @param goals A list of user's active goals.
     * @param skillsToDevelop Top 3 skills the user wants to focus on.
     * @param numberOfItems Number of daily activities to suggest.
     * @returns A list of DailyPlanItem suggestions.
     */
    public async generateDailyPlan(userProfile: UserProfile, goals: CareerGoal[], skillsToDevelop: string[], numberOfItems: number = 5): Promise<Omit<DailyPlanItem, 'id' | 'date' | 'isCompleted' | 'signature' | 'nonce'>[]> {
        const profile = userProfile || this.defaultUserProfile;
        const prompt = `You are a productivity and career planning expert.
            Generate a realistic and actionable daily plan for the user, focusing on career development.
            Create ${numberOfItems} activities that align with their 'userProfile', 'activeGoals', and 'skillsToDevelop'.
            For each activity, suggest a 'time' (e.g., "09:00 AM"), 'activity' description, and 'type' (Learning, Networking, Job Search, Project, Goal, Other).
            Ensure a balanced mix of activities.

            **User Profile Summary:**\nRole: ${profile.currentRole}, Desired: ${profile.desiredRoles.join(', ')}
            **Active Goals:**\n${JSON.stringify(goals.filter(g => g.status === GoalStatus.InProgress || g.status === GoalStatus.Pending).map(g => ({ title: g.title, priority: g.priority })), null, 2)}
            **Top Skills to Develop:** ${skillsToDevelop.join(', ')}

            Provide only the list of daily plan items.`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                dailyPlan: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            time: { type: Type.STRING, pattern: "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$" }, // e.g., "09:00 AM"
                            activity: { type: Type.STRING },
                            type: { type: 'STRING', enum: ['Learning', 'Networking', 'Job Search', 'Project', 'Goal', 'Other'] },
                            relatedEntityId: { type: Type.STRING, nullable: true } // Optional: ID of a related goal, resource, etc.
                        },
                        required: ['time', 'activity', 'type']
                    }
                }
            },
            required: ['dailyPlan']
        };
        const response = await this.callGenerativeAI<{ dailyPlan: Omit<DailyPlanItem, 'id' | 'date' | 'isCompleted'>[] }>(prompt, schema);
        return response.dailyPlan;
    }
}

export let careerAIClient: CareerAIClient | null = null;
try {
    const apiKey = process.env.AI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (apiKey === '') {
        console.warn("AI_API_KEY is not set. AI services will not function.");
        notificationService.addNotification({
            type: 'error',
            message: "AI Service Warning: No API_KEY found. Please set AI_API_KEY environment variable."
        });
    }
    careerAIClient = new CareerAIClient(apiKey);
} catch (e) {
    console.error("Failed to initialize CareerAIClient:", (e as Error).message);
    notificationService.addNotification({
        type: 'error',
        message: `AI Service Unavailable: ${(e as Error).message}. Please check your API key.`
    });
}


/**
 * =====================================================================================================================
 *  SECTION 3: INTERNAL API & ROUTING SIMULATION
 * =====================================================================================================================
 * These functions act as internal "API endpoints" or "routes" within this single-file application.
 * They handle business logic, interact with the data store, and trigger AI services.
 * Business value: This simulated API layer provides a robust, testable, and maintainable interface for all
 * application functionalities. By abstracting data persistence and AI interactions, it enables rapid feature
 * development and ensures consistent data handling and error management. Its "in-place" simulation capability
 * allows for full functionality without a complex backend, drastically cutting development and deployment costs
 * in early phases while providing clear interfaces for future "live mode" integration with token rails,
 * real-time payments, and digital identity systems.
 */

// 3.1 User Profile Management API
/**
 * Retrieves the user's profile from the local data store.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the UserProfile or null if not found.
 */
export const apiGetUserProfile = async (userId: string = USER_ID): Promise<UserProfile | null> => {
    return dataStore.getItem<UserProfile>('UserProfile', userId);
};

/**
 * Updates the user's profile in the local data store.
 * Includes security measures like signature generation and audit logging.
 * @param profile The updated UserProfile object.
 * @returns A Promise resolving to the updated UserProfile.
 */
export const apiUpdateUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
    if (!accessControlService.hasPermission(profile.id, 'edit_profile')) {
        throw new CustomError('Permission denied to update profile.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(profile, profile.id)) { // Verify incoming data integrity
        throw new CustomError('Data integrity check failed for profile update.', 'SIGNATURE_MISMATCH');
    }

    profile.lastUpdated = DateUtils.getNowISO();
    const signedProfile = SecurityUtils.signObject(profile, profile.id); // Re-sign after update
    dataStore.setItem('UserProfile', signedProfile);
    webhookProcessor.receiveEvent({ eventType: 'PROFILE_CHANGED', payload: signedProfile });
    notificationService.addNotification({ type: 'success', message: 'User profile updated successfully!' });
    auditLogService.recordEvent(profile.id, AuditEventType.ProfileUpdated, 'UserProfile', profile.id, 'User profile updated.', 'SUCCESS', { name: profile.name, email: profile.email });
    return signedProfile;
};

/**
 * Initializes a default user profile if none exists, otherwise retrieves the existing one.
 * Includes generation of digital identity components.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the initialized UserProfile.
 */
export const apiInitializeUserProfile = async (userId: string = USER_ID): Promise<UserProfile> => {
    let profile = await apiGetUserProfile(userId);
    if (!profile) {
        // Generate digital identity for the new user
        const { publicKey, walletAddress } = identityService.generateKeys(userId);

        profile = {
            id: userId,
            name: "Jane Doe",
            email: "jane.doe@example.com",
            currentRole: "Product Manager",
            industry: "Technology",
            yearsExperience: 7,
            careerStage: CareerStage.Senior,
            skills: ["Product Management", "Agile Methodologies", "User Experience", "Market Research", "SQL", "Team Leadership", "Communication", "Data Analysis"],
            education: ["MBA - Business School", "B.Sc. Computer Science - University of XYZ"],
            certifications: ["CSPO", "PMP"],
            desiredRoles: ["Senior Product Manager", "Director of Product"],
            desiredIndustry: "AI/ML Solutions",
            salaryExpectationMin: 150000,
            salaryExpectationMax: 200000,
            lastUpdated: DateUtils.getNowISO(),
            resumeText: `Jane Doe
            Product Manager | 7+ Years Experience | AI/ML Enthusiast
            
            Summary:
            Results-oriented Product Manager with over 7 years of experience in leading cross-functional teams to deliver innovative software solutions. Proven ability to define product vision, strategy, and roadmaps, driving growth and market success. Expertise in Agile, user-centric design, and data-driven decision-making. Seeking to leverage strong leadership and technical acumen in a Director of Product role within AI/ML.
            
            Experience:
            Senior Product Manager | Tech Innovators Inc. | 2020 - Present
            - Led the development and launch of a new AI-powered recommendation engine, increasing user engagement by 25% and revenue by 15% within 6 months.
            - Managed a portfolio of 3 B2B SaaS products, achieving 98% customer retention.
            - Defined product roadmap and prioritized features based on market analysis, customer feedback, and business objectives.
            - Mentored junior product owners and fostered a culture of continuous improvement.
            
            Product Manager | Startup X | 2017 - 2020
            - Spearheaded the redesign of the mobile application, resulting in a 40% improvement in user satisfaction scores.
            - Conducted extensive market research and competitive analysis to identify new opportunities.
            - Collaborated with engineering, design, and marketing teams to ensure successful product delivery.
            
            Education:
            MBA, Business Administration | Elite Business School | 2017
            B.Sc., Computer Science | University of XYZ | 2015
            
            Skills:
            Product Strategy, Roadmapping, Agile (Scrum, Kanban), UX/UI Design, Data Analytics, SQL, JIRA, Confluence, Public Speaking, Stakeholder Management, Mentorship, Machine Learning Concepts, AI Ethics.
            `,
            linkedInProfileUrl: "https://linkedin.com/in/janedoe",
            personalWebsiteUrl: "https://janedoe.com",
            achievements: [
                "Led AI recommendation engine launch, increased engagement 25%.",
                "Managed 3 B2B SaaS products, 98% retention.",
                "Redesigned mobile app, 40% user satisfaction increase."
            ],
            careerVision: "To lead a product division focused on ethical and impactful AI solutions, driving innovation that solves complex societal problems.",
            preferredLearningStyles: ["Visual", "Kinesthetic"],
            aiModelPreference: 'balanced',
            publicKey,
            identityVerificationLevel: IdentityVerificationLevel.Basic, // Default to basic for new users
            walletAddress
        };
        const signedProfile = SecurityUtils.signObject(profile, userId);
        dataStore.setItem('UserProfile', signedProfile);
        auditLogService.recordEvent(userId, AuditEventType.ProfileUpdated, 'UserProfile', userId, 'New user profile created and initialized.', 'SUCCESS');
    }
    return profile;
};

/**
 * Requests a simulated identity verification level upgrade.
 * @param userId The user ID to verify.
 * @param level The desired new verification level.
 * @returns The updated IdentityVerificationLevel.
 */
export const apiRequestIdentityVerification = async (userId: string = USER_ID, level: IdentityVerificationLevel): Promise<IdentityVerificationLevel> => {
    if (!accessControlService.hasPermission(userId, 'manage_identity')) { // User can request, Auth Service performs
        throw new CustomError('Permission denied to request identity verification.', 'PERMISSION_DENIED');
    }
    // Simulate an async process for verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    identityService.setVerificationLevel(userId, level);
    const updatedProfile = await apiGetUserProfile(userId);
    if (updatedProfile) {
        updatedProfile.identityVerificationLevel = level;
        await apiUpdateUserProfile(updatedProfile); // Persist updated level
    }
    notificationService.addNotification({ type: 'success', message: `Identity verification level updated to ${level}.` });
    return level;
};

// 3.2 Resume & Cover Letter API
/**
 * Generates resume improvement suggestions using AI.
 * @param resume The user's resume text.
 * @param jobDesc The job description.
 * @returns A Promise resolving to an array of AISuggestion objects.
 */
export const apiGenerateResumeSuggestions = async (resume: string, jobDesc: string): Promise<AISuggestion[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(resume) || !ValidationUtils.isNotNullOrEmpty(jobDesc)) {
        throw new CustomError("Resume and Job Description cannot be empty.", "INPUT_VALIDATION_ERROR");
    }
    const suggestions = await careerAIClient.analyzeResumeForJob(resume, jobDesc);
    notificationService.addNotification({ type: 'success', message: `Generated ${suggestions.length} resume suggestions.`, actionLink: `/resume` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Resume Suggestions', actionLink: `/resume` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'ResumeAnalysis', generateId(), 'Resume suggestions generated.', 'SUCCESS', { resumeLength: resume.length, jobDescLength: jobDesc.length });
    return suggestions;
};

/**
 * Generates a tailored cover letter using AI.
 * @param userProfile The user's profile.
 * @param jobApplication The job application details.
 * @param resumeSummary A summary of the user's resume.
 * @returns A Promise resolving to the generated cover letter string.
 */
export const apiGenerateCoverLetter = async (
    userProfile: UserProfile,
    jobApplication: JobApplication,
    resumeSummary: string
): Promise<string> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !jobApplication || !ValidationUtils.isNotNullOrEmpty(resumeSummary)) {
        throw new CustomError("Missing profile, application, or resume summary for cover letter generation.", "INPUT_VALIDATION_ERROR");
    }
    const coverLetter = await careerAIClient.generateCoverLetter(userProfile, jobApplication, resumeSummary);
    notificationService.addNotification({ type: 'success', message: 'Cover letter generated successfully!', actionLink: `/applications/${jobApplication.id}` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Cover Letter Generation', actionLink: `/applications/${jobApplication.id}` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'CoverLetterGeneration', jobApplication.id, 'Cover letter generated.', 'SUCCESS', { jobId: jobApplication.id });
    return coverLetter;
};

// 3.3 Skill & Career Pathing API
/**
 * Performs a skill gap analysis using AI.
 * @param userProfile The user's profile.
 * @param targetRoles A list of target roles or a job description.
 * @returns A Promise resolving to an array of SkillAssessmentResult objects.
 */
export const apiGetSkillGapAnalysis = async (userProfile: UserProfile, targetRoles: string[] | string): Promise<SkillAssessmentResult[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || (Array.isArray(targetRoles) && targetRoles.length === 0) || (!Array.isArray(targetRoles) && !ValidationUtils.isNotNullOrEmpty(targetRoles))) {
        throw new CustomError("Missing user profile or target roles for skill gap analysis.", "INPUT_VALIDATION_ERROR");
    }
    const results = await careerAIClient.getSkillGapAnalysis(userProfile, targetRoles);
    results.forEach(gap => {
        if (!dataStore.getItem('LearningResource', gap.id)) {
            gap.recommendations.forEach(res => { // For each recommendation, persist if new.
                if (!dataStore.getItem('LearningResource', res.id)) {
                    dataStore.setItem('LearningResource', { ...res, dateAdded: DateUtils.getNowISO() });
                }
            });
        }
    });
    notificationService.addNotification({ type: 'success', message: `Skill gap analysis completed. Found ${results.length} skills.`, actionLink: `/skills` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Skill Gap Analysis', actionLink: `/skills` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'SkillGapAnalysis', generateId(), 'Skill gap analysis completed.', 'SUCCESS', { target: targetRoles });
    return results;
};

/**
 * Generates career path recommendations using AI.
 * @param userProfile The user's profile.
 * @param currentGoals A list of the user's current career goals.
 * @returns A Promise resolving to an array of CareerPathRecommendation objects.
 */
export const apiGetCareerPathRecommendations = async (userProfile: UserProfile, currentGoals: CareerGoal[]): Promise<CareerPathRecommendation[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile) {
        throw new CustomError("Missing user profile for career path recommendations.", "INPUT_VALIDATION_ERROR");
    }
    const recommendations = await careerAIClient.getCareerPathRecommendations(userProfile, currentGoals);
    recommendations.forEach(path => {
        path.pathways.forEach(p => {
            if (p.type !== RecommendationType.NetworkingEvent && ValidationUtils.isValidUrl(p.resource)) {
                const newResource: LearningResource = {
                    id: generateId(),
                    title: p.title,
                    description: `Resource related to ${path.role} career path.`,
                    type: p.type,
                    link: p.resource,
                    estimatedTime: "Varies",
                    cost: "Mixed",
                    relatedSkills: path.requiredSkills.map(s => s.skill),
                    provider: "AI Suggestion",
                    difficulty: "Intermediate",
                    dateAdded: DateUtils.getNowISO()
                };
                if (!dataStore.getItem('LearningResource', newResource.id)) {
                    dataStore.setItem('LearningResource', newResource);
                }
            }
        });
    });
    notificationService.addNotification({ type: 'success', message: `Generated ${recommendations.length} career path recommendations.`, actionLink: `/skills` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Career Path Recommendations', actionLink: `/skills` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'CareerPathRecommendations', generateId(), 'Career path recommendations generated.', 'SUCCESS');
    return recommendations;
};

// 3.4 Job Application Tracking API
/**
 * Adds a new job application to the local data store.
 * Includes security measures like signature generation and audit logging.
 * @param app The job application data to add.
 * @returns A Promise resolving to the newly added JobApplication.
 */
export const apiAddJobApplication = async (app: Omit<JobApplication, 'id' | 'createdAt' | 'lastUpdated' | 'contacts' | 'negotiationHistory' | 'feedbackReceived' | 'interviewDates' | 'signature' | 'nonce'>): Promise<JobApplication> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_applications')) {
        throw new CustomError('Permission denied to add job application.', 'PERMISSION_DENIED');
    }

    const newApp: JobApplication = {
        ...app,
        id: generateId(),
        createdAt: DateUtils.getNowISO(),
        lastUpdated: DateUtils.getNowISO(),
        negotiationHistory: [],
        feedbackReceived: '',
        interviewDates: [],
        contacts: [],
    };
    const signedApp = SecurityUtils.signObject(newApp, USER_ID);
    dataStore.setItem('JobApplication', signedApp);
    webhookProcessor.receiveEvent({ eventType: 'JOB_APPLIED', payload: { id: signedApp.id, jobTitle: signedApp.jobTitle, company: signedApp.company } });
    notificationService.addNotification({ type: 'success', message: `Application for ${signedApp.jobTitle} at ${signedApp.company} added.`, actionLink: `/applications/${signedApp.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ApplicationAdded, 'JobApplication', signedApp.id, 'New job application added.', 'SUCCESS', { jobTitle: signedApp.jobTitle, company: signedApp.company });
    return signedApp;
};

/**
 * Updates an existing job application in the local data store.
 * Includes security measures like signature generation and audit logging.
 * @param app The updated JobApplication object.
 * @returns A Promise resolving to the updated JobApplication.
 */
export const apiUpdateJobApplication = async (app: JobApplication): Promise<JobApplication> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_applications')) {
        throw new CustomError('Permission denied to update job application.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(app, USER_ID)) {
        throw new CustomError('Data integrity check failed for job application update.', 'SIGNATURE_MISMATCH');
    }

    app.lastUpdated = DateUtils.getNowISO();
    const signedApp = SecurityUtils.signObject(app, USER_ID);
    dataStore.setItem('JobApplication', signedApp);
    if (app.status === JobApplicationStatus.Interviewing && app.interviewDates.length > 0) {
        webhookProcessor.receiveEvent({ eventType: 'INTERVIEW_SCHEDULED', payload: { role: app.jobTitle, company: app.company, interviewDate: app.interviewDates[0], applicationId: app.id } });
    }
    notificationService.addNotification({ type: 'success', message: `Application for ${app.jobTitle} updated.`, actionLink: `/applications/${app.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ApplicationUpdated, 'JobApplication', app.id, 'Job application updated.', 'SUCCESS', { jobTitle: app.jobTitle, status: app.status });
    return signedApp;
};

/**
 * Retrieves all job applications from the local data store.
 * @returns A Promise resolving to an array of JobApplication objects.
 */
export const apiGetAllJobApplications = async (): Promise<JobApplication[]> => {
    return dataStore.getAllItems<JobApplication>('JobApplication');
};

/**
 * Retrieves a specific job application by ID.
 * @param id The ID of the job application.
 * @returns A Promise resolving to the JobApplication or null if not found.
 */
export const apiGetJobApplicationById = async (id: string): Promise<JobApplication | null> => {
    return dataStore.getItem<JobApplication>('JobApplication', id);
};

/**
 * Deletes a job application by ID.
 * Includes audit logging.
 * @param id The ID of the job application to delete.
 * @returns A Promise that resolves when the application is removed.
 */
export const apiDeleteJobApplication = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_applications')) {
        throw new CustomError('Permission denied to delete job application.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('JobApplication', id);
    notificationService.addNotification({ type: 'info', message: 'Job application removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.ApplicationUpdated, 'JobApplication', id, 'Job application deleted.', 'SUCCESS');
};


// 3.5 Career Goal Management API
/**
 * Adds a new career goal.
 * Includes security measures like signature generation and audit logging.
 * @param goal The career goal data to add.
 * @returns A Promise resolving to the newly added CareerGoal.
 */
export const apiAddCareerGoal = async (goal: Omit<CareerGoal, 'id' | 'createdAt' | 'lastUpdated' | 'progressNotes' | 'actionItems' | 'signature' | 'nonce'>): Promise<CareerGoal> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_goals')) {
        throw new CustomError('Permission denied to add career goal.', 'PERMISSION_DENIED');
    }
    const newGoal: CareerGoal = {
        ...goal,
        id: generateId(),
        progressNotes: [],
        actionItems: [],
        createdAt: DateUtils.getNowISO(),
        lastUpdated: DateUtils.getNowISO(),
    };
    const signedGoal = SecurityUtils.signObject(newGoal, USER_ID);
    dataStore.setItem('CareerGoal', signedGoal);
    notificationService.addNotification({ type: 'success', message: `Career goal "${signedGoal.title}" added.`, actionLink: `/goals/${signedGoal.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalCreated, 'CareerGoal', signedGoal.id, 'New career goal added.', 'SUCCESS', { title: signedGoal.title });
    return signedGoal;
};

/**
 * Updates an existing career goal.
 * Includes security measures like signature generation and audit logging.
 * @param goal The updated CareerGoal object.
 * @returns A Promise resolving to the updated CareerGoal.
 */
export const apiUpdateCareerGoal = async (goal: CareerGoal): Promise<CareerGoal> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_goals')) {
        throw new CustomError('Permission denied to update career goal.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(goal, USER_ID)) {
        throw new CustomError('Data integrity check failed for career goal update.', 'SIGNATURE_MISMATCH');
    }

    const idempotencyKey = idempotencyManager.generateKey('update_career_goal', { id: goal.id, status: goal.status }, USER_ID);
    if (idempotencyManager.isProcessed(idempotencyKey)) {
        console.log(`Idempotent call: Goal ${goal.id} already processed.`);
        return goal; // Return existing state, no re-processing
    }

    goal.lastUpdated = DateUtils.getNowISO();
    const signedGoal = SecurityUtils.signObject(goal, USER_ID);
    dataStore.setItem('CareerGoal', signedGoal);
    webhookProcessor.receiveEvent({ eventType: 'GOAL_UPDATED', payload: { id: signedGoal.id, title: signedGoal.title, status: signedGoal.status } });
    notificationService.addNotification({ type: 'success', message: `Career goal "${signedGoal.title}" updated.`, actionLink: `/goals/${signedGoal.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalUpdated, 'CareerGoal', signedGoal.id, 'Career goal updated.', 'SUCCESS', { title: signedGoal.title, status: signedGoal.status });

    if (signedGoal.status === GoalStatus.Completed) {
        // Reward tokens for completing a goal
        await tokenizedRewardService.issueToken(USER_ID, 10, TokenType.CareerCoin, `Completed goal: ${signedGoal.title}`);
    }

    idempotencyManager.markProcessed(idempotencyKey);
    return signedGoal;
};

/**
 * Retrieves all career goals.
 * @returns A Promise resolving to an array of CareerGoal objects.
 */
export const apiGetAllCareerGoals = async (): Promise<CareerGoal[]> => {
    return dataStore.getAllItems<CareerGoal>('CareerGoal');
};

/**
 * Retrieves a specific career goal by ID.
 * @param id The ID of the career goal.
 * @returns A Promise resolving to the CareerGoal or null if not found.
 */
export const apiGetCareerGoalById = async (id: string): Promise<CareerGoal | null> => {
    return dataStore.getItem<CareerGoal>('CareerGoal', id);
};

/**
 * Deletes a career goal and its associated action items.
 * Includes audit logging.
 * @param id The ID of the career goal to delete.
 * @returns A Promise that resolves when the goal is removed.
 */
export const apiDeleteCareerGoal = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_goals')) {
        throw new CustomError('Permission denied to delete career goal.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('CareerGoal', id);
    const allActionItems = dataStore.getAllItems<ActionItem>('ActionItem');
    allActionItems.filter(item => item.goalId === id).forEach(item => dataStore.removeItem('ActionItem', item.id));
    notificationService.addNotification({ type: 'info', message: 'Career goal and its action items removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalDeleted, 'CareerGoal', id, 'Career goal deleted.', 'SUCCESS');
};

// 3.5.1 Action Item Management API
/**
 * Adds a new action item to a career goal.
 * Includes security measures like signature generation and audit logging.
 * @param item The action item data to add.
 * @returns A Promise resolving to the newly added ActionItem.
 */
export const apiAddActionItem = async (item: Omit<ActionItem, 'id' | 'signature' | 'nonce'>): Promise<ActionItem> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_goals')) {
        throw new CustomError('Permission denied to add action item.', 'PERMISSION_DENIED');
    }
    const newActionItem: ActionItem = {
        ...item,
        id: generateId(),
    };
    const signedItem = SecurityUtils.signObject(newActionItem, USER_ID);
    dataStore.setItem('ActionItem', signedItem);
    const parentGoal = await apiGetCareerGoalById(item.goalId);
    if (parentGoal) {
        parentGoal.actionItems.push(signedItem);
        await apiUpdateCareerGoal(parentGoal); // This will re-sign the parent goal
    }
    notificationService.addNotification({ type: 'success', message: `Action item "${TextUtils.truncate(item.description, 50)}" added.` });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalUpdated, 'ActionItem', signedItem.id, 'New action item added.', 'SUCCESS', { goalId: item.goalId, description: item.description });
    return signedItem;
};

/**
 * Updates an existing action item.
 * Includes security measures like signature generation and audit logging.
 * @param item The updated ActionItem object.
 * @returns A Promise resolving to the updated ActionItem.
 */
export const apiUpdateActionItem = async (item: ActionItem): Promise<ActionItem> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_goals')) {
        throw new CustomError('Permission denied to update action item.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(item, USER_ID)) {
        throw new CustomError('Data integrity check failed for action item update.', 'SIGNATURE_MISMATCH');
    }

    const signedItem = SecurityUtils.signObject(item, USER_ID);
    dataStore.setItem('ActionItem', signedItem);
    const parentGoal = await apiGetCareerGoalById(item.goalId);
    if (parentGoal) {
        parentGoal.actionItems = parentGoal.actionItems.map(ai => ai.id === signedItem.id ? signedItem : ai);
        await apiUpdateCareerGoal(parentGoal);
    }
    notificationService.addNotification({ type: 'info', message: `Action item "${TextUtils.truncate(item.description, 50)}" updated.` });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalUpdated, 'ActionItem', signedItem.id, 'Action item updated.', 'SUCCESS', { goalId: item.goalId, description: item.description, isCompleted: item.isCompleted });
    return signedItem;
};

/**
 * Deletes an action item.
 * Includes audit logging.
 * @param id The ID of the action item to delete.
 * @param goalId The ID of the parent career goal.
 * @returns A Promise that resolves when the item is removed.
 */
export const apiDeleteActionItem = async (id: string, goalId: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_goals')) {
        throw new CustomError('Permission denied to delete action item.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('ActionItem', id);
    const parentGoal = await apiGetCareerGoalById(goalId);
    if (parentGoal) {
        parentGoal.actionItems = parentGoal.actionItems.filter(ai => ai.id !== id);
        await apiUpdateCareerGoal(parentGoal);
    }
    notificationService.addNotification({ type: 'info', message: 'Action item removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalUpdated, 'ActionItem', id, 'Action item deleted.', 'SUCCESS', { goalId });
};

/**
 * Retrieves all action items for a specific career goal.
 * @param goalId The ID of the parent career goal.
 * @returns A Promise resolving to an array of ActionItem objects.
 */
export const apiGetAllActionItemsForGoal = async (goalId: string): Promise<ActionItem[]> => {
    return dataStore.getAllItems<ActionItem>('ActionItem').filter(item => item.goalId === goalId);
};


// 3.6 Interview Preparation API
/**
 * Starts a new interview session, generating initial questions using AI.
 * Includes security measures like signature generation and audit logging.
 * @param jobApplicationId The ID of the associated job application.
 * @param role The job role.
 * @param company The company name.
 * @param jobDescription The job description for context.
 * @param userProfile The user's profile.
 * @param stageType The type of interview stage.
 * @returns A Promise resolving to the new InterviewSession.
 */
export const apiStartInterviewSession = async (jobApplicationId: string, role: string, company: string, jobDescription: string, userProfile: UserProfile, stageType: InterviewStageType = InterviewStageType.Behavioral): Promise<InterviewSession> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_interview_sessions')) {
        throw new CustomError('Permission denied to start interview session.', 'PERMISSION_DENIED');
    }
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(jobApplicationId) || !ValidationUtils.isNotNullOrEmpty(jobDescription) || !userProfile) {
        throw new CustomError("Missing details to start interview session.", "INPUT_VALIDATION_ERROR");
    }

    const initialQuestions = await careerAIClient.generateInterviewQuestions(jobDescription, userProfile);
    const session: InterviewSession = {
        id: generateId(),
        jobApplicationId,
        sessionDate: DateUtils.getNowISO(),
        role,
        company,
        questionsAsked: initialQuestions.map(q => ({ question: q.question, userAnswer: '', aiFeedback: '', score: 0 })),
        overallFeedback: 'No feedback yet.',
        areasForImprovement: [],
        strengths: [],
        score: 0,
        createdAt: DateUtils.getNowISO(),
        lastUpdated: DateUtils.getNowISO(),
        stageType: stageType,
    };
    const signedSession = SecurityUtils.signObject(session, USER_ID);
    dataStore.setItem('InterviewSession', signedSession);
    notificationService.addNotification({ type: 'info', message: `Interview session for ${role} started. Good luck!`, actionLink: `/interview/${signedSession.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.SessionScheduled, 'InterviewSession', signedSession.id, 'Interview session started.', 'SUCCESS', { role, company, stageType });
    return signedSession;
};

/**
 * Submits interview answers and retrieves AI feedback for a session.
 * Includes security measures like signature generation and audit logging.
 * @param sessionId The ID of the interview session.
 * @param questionsWithAnswers A list of questions and the user's answers.
 * @param jobDescription The job description for context.
 * @param userProfile The user's profile.
 * @returns A Promise resolving to the updated InterviewSession with feedback.
 */
export const apiSubmitInterviewAnswersAndGetFeedback = async (sessionId: string, questionsWithAnswers: { question: string; userAnswer: string; }[], jobDescription: string, userProfile: UserProfile): Promise<InterviewSession> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_interview_sessions')) {
        throw new CustomError('Permission denied to submit interview answers.', 'PERMISSION_DENIED');
    }
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(sessionId) || questionsWithAnswers.length === 0 || !ValidationUtils.isNotNullOrEmpty(jobDescription) || !userProfile) {
        throw new CustomError("Missing session ID, answers, job description, or profile for feedback.", "INPUT_VALIDATION_ERROR");
    }

    const session = await dataStore.getItem<InterviewSession>('InterviewSession', sessionId);
    if (!session) throw new CustomError("Interview session not found.", "NOT_FOUND");
    if (!SecurityUtils.verifyObjectSignature(session, USER_ID)) {
        throw new CustomError('Data integrity check failed for interview session.', 'SIGNATURE_MISMATCH');
    }

    const feedback = await careerAIClient.getInterviewFeedback(questionsWithAnswers, jobDescription, userProfile);

    session.questionsAsked = questionsWithAnswers.map(qa => {
        const qFeedback = feedback.questionsFeedback.find(f => f.question === qa.question);
        return {
            ...qa,
            aiFeedback: qFeedback?.feedback || 'No specific feedback provided.',
            score: qFeedback?.score || 0
        };
    });
    session.overallFeedback = feedback.overallFeedback;
    session.areasForImprovement = feedback.areasForImprovement;
    session.strengths = feedback.strengths;
    session.score = feedback.score;
    session.lastUpdated = DateUtils.getNowISO();

    const signedSession = SecurityUtils.signObject(session, USER_ID);
    dataStore.setItem('InterviewSession', signedSession);
    notificationService.addNotification({ type: 'success', message: `Feedback for interview session "${signedSession.role}" received.`, actionLink: `/interview/${signedSession.id}` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Interview Feedback', actionLink: `/interview/${signedSession.id}` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'InterviewSession', signedSession.id, 'Interview feedback generated.', 'SUCCESS', { score: signedSession.score });
    return signedSession;
};

/**
 * Retrieves all interview sessions.
 * @returns A Promise resolving to an array of InterviewSession objects.
 */
export const apiGetAllInterviewSessions = async (): Promise<InterviewSession[]> => {
    return dataStore.getAllItems<InterviewSession>('InterviewSession');
};

/**
 * Retrieves a specific interview session by ID.
 * @param id The ID of the interview session.
 * @returns A Promise resolving to the InterviewSession or null if not found.
 */
export const apiGetInterviewSessionById = async (id: string): Promise<InterviewSession | null> => {
    return dataStore.getItem<InterviewSession>('InterviewSession', id);
};


// 3.7 Market Insights API
/**
 * Retrieves market trends using AI.
 * @param industry The industry to analyze.
 * @param keywords Specific keywords to focus on.
 * @returns A Promise resolving to an array of MarketTrend objects.
 */
export const apiGetMarketTrends = async (industry: string, keywords: string[]): Promise<MarketTrend[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(industry)) {
        throw new CustomError("Industry cannot be empty for market trend analysis.", "INPUT_VALIDATION_ERROR");
    }
    const trends = await careerAIClient.getMarketTrends(industry, keywords);
    notificationService.addNotification({ type: 'info', message: `Fetched ${trends.length} market trends for ${industry}.`, actionLink: `/market` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Market Trend Analysis', actionLink: `/market` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'MarketTrendAnalysis', generateId(), 'Market trends generated.', 'SUCCESS', { industry, keywords });
    return trends;
};

// 3.8 Salary Negotiation API
/**
 * Generates a salary negotiation script using AI.
 * @param jobTitle The job title.
 * @param company The company name.
 * @param initialOffer The initial salary offer.
 * @param desiredSalary The user's desired salary.
 * @param userProfile The user's profile.
 * @returns A Promise resolving to the generated script string.
 */
export const apiGetSalaryNegotiationScript = async (
    jobTitle: string,
    company: string,
    initialOffer: number,
    desiredSalary: number,
    userProfile: UserProfile
): Promise<string> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(jobTitle) || !ValidationUtils.isNotNullOrEmpty(company) || !ValidationUtils.isPositiveNumber(initialOffer) || !ValidationUtils.isPositiveNumber(desiredSalary) || !userProfile) {
        throw new CustomError("Missing details for salary negotiation script generation.", "INPUT_VALIDATION_ERROR");
    }
    const script = await careerAIClient.getSalaryNegotiationScript(jobTitle, company, initialOffer, desiredSalary, userProfile);
    notificationService.addNotification({ type: 'success', message: 'Salary negotiation script generated.', actionLink: `/negotiation` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Salary Negotiation Script', actionLink: `/negotiation` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'SalaryNegotiationScript', generateId(), 'Salary negotiation script generated.', 'SUCCESS', { jobTitle, company });
    return script;
};

// 3.9 Personal Branding API
/**
 * Optimizes a user's LinkedIn profile summary using AI.
 * @param userProfile The user's profile.
 * @param desiredRoles The user's desired job roles.
 * @returns A Promise resolving to the optimized summary string.
 */
export const apiOptimizeLinkedInProfile = async (userProfile: UserProfile, desiredRoles: string[]): Promise<string> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || desiredRoles.length === 0) {
        throw new CustomError("Missing user profile or desired roles for LinkedIn optimization.", "INPUT_VALIDATION_ERROR");
    }
    const summary = await careerAIClient.optimizeLinkedInProfile(userProfile, desiredRoles);
    notificationService.addNotification({ type: 'success', message: 'LinkedIn summary optimized.', actionLink: `/branding` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'LinkedIn Profile Optimization', actionLink: `/branding` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'LinkedInOptimization', generateId(), 'LinkedIn profile optimized.', 'SUCCESS');
    return summary;
};

/**
 * Generates a personal brand statement using AI.
 * Includes security measures like signature generation and audit logging.
 * @param userProfile The user's profile.
 * @param desiredImpact The desired impact of the brand statement.
 * @returns A Promise resolving to the generated PersonalBrandStatement.
 */
export const apiGeneratePersonalBrandStatement = async (userProfile: UserProfile, desiredImpact: string): Promise<PersonalBrandStatement> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !ValidationUtils.isNotNullOrEmpty(desiredImpact)) {
        throw new CustomError("Missing user profile or desired impact for brand statement generation.", "INPUT_VALIDATION_ERROR");
    }
    const statement = await careerAIClient.generatePersonalBrandStatement(userProfile, desiredImpact);
    const signedStatement = SecurityUtils.signObject(statement, USER_ID); // User also signs for adoption
    dataStore.setItem('PersonalBrandStatement', signedStatement);
    notificationService.addNotification({ type: 'success', message: 'Personal brand statement generated and saved.', actionLink: `/branding` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Personal Brand Statement', actionLink: `/branding` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.BrandStatementGenerated, 'PersonalBrandStatement', signedStatement.id, 'Personal brand statement generated and saved.', 'SUCCESS');
    return signedStatement;
};

/**
 * Retrieves the latest personal brand statement for the user.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the latest PersonalBrandStatement or null.
 */
export const apiGetLatestPersonalBrandStatement = async (userId: string = USER_ID): Promise<PersonalBrandStatement | null> => {
    const statements = dataStore.getAllItems<PersonalBrandStatement>('PersonalBrandStatement').filter(pbs => true); // In a multi-user app, filter by userId
    if (statements.length === 0) return null;
    return statements.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime())[0];
};


// 3.10 Performance Review API
/**
 * Prepares performance review bullet points using AI.
 * @param userProfile The user's profile.
 * @param achievements A list of raw achievement descriptions.
 * @returns A Promise resolving to an array of formatted review points.
 */
export const apiPreparePerformanceReview = async (userProfile: UserProfile, achievements: string[]): Promise<string[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || achievements.length === 0) {
        throw new CustomError("Missing user profile or achievements for performance review preparation.", "INPUT_VALIDATION_ERROR");
    }
    const reviewPoints = await careerAIClient.preparePerformanceReview(userProfile, achievements);
    notificationService.addNotification({ type: 'success', message: 'Performance review points generated.', actionLink: `/review` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Performance Review Prep', actionLink: `/review` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'PerformanceReviewPrep', generateId(), 'Performance review points generated.', 'SUCCESS');
    return reviewPoints;
};

// 3.11 Networking API
/**
 * Adds a new network contact.
 * Includes security measures like signature generation and audit logging.
 * @param contact The network contact data to add.
 * @returns A Promise resolving to the newly added NetworkContact.
 */
export const apiAddNetworkContact = async (contact: Omit<NetworkContact, 'id' | 'connectionDate' | 'lastContactDate' | 'signature' | 'nonce'>): Promise<NetworkContact> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_network')) {
        throw new CustomError('Permission denied to add network contact.', 'PERMISSION_DENIED');
    }
    const newContact: NetworkContact = {
        ...contact,
        id: generateId(),
        connectionDate: DateUtils.getNowISO(),
        lastContactDate: DateUtils.getNowISO(),
    };
    const signedContact = SecurityUtils.signObject(newContact, USER_ID);
    dataStore.setItem('NetworkContact', signedContact);
    notificationService.addNotification({ type: 'success', message: `Added new contact: ${signedContact.name}.`, actionLink: `/network` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ContactAdded, 'NetworkContact', signedContact.id, 'New network contact added.', 'SUCCESS', { name: signedContact.name });
    return signedContact;
};

/**
 * Updates an existing network contact.
 * Includes security measures like signature generation and audit logging.
 * @param contact The updated NetworkContact object.
 * @returns A Promise resolving to the updated NetworkContact.
 */
export const apiUpdateNetworkContact = async (contact: NetworkContact): Promise<NetworkContact> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_network')) {
        throw new CustomError('Permission denied to update network contact.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(contact, USER_ID)) {
        throw new CustomError('Data integrity check failed for network contact update.', 'SIGNATURE_MISMATCH');
    }

    const signedContact = SecurityUtils.signObject(contact, USER_ID);
    dataStore.setItem('NetworkContact', signedContact);
    notificationService.addNotification({ type: 'success', message: `Updated contact: ${signedContact.name}.`, actionLink: `/network` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ProfileUpdated, 'NetworkContact', signedContact.id, 'Network contact updated.', 'SUCCESS', { name: signedContact.name });
    return signedContact;
};

/**
 * Retrieves all network contacts.
 * @returns A Promise resolving to an array of NetworkContact objects.
 */
export const apiGetAllNetworkContacts = async (): Promise<NetworkContact[]> => {
    return dataStore.getAllItems<NetworkContact>('NetworkContact');
};

/**
 * Deletes a network contact.
 * Includes audit logging.
 * @param id The ID of the network contact to delete.
 * @returns A Promise that resolves when the contact is removed.
 */
export const apiDeleteNetworkContact = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_network')) {
        throw new CustomError('Permission denied to delete network contact.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('NetworkContact', id);
    notificationService.addNotification({ type: 'info', message: 'Network contact removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.ProfileUpdated, 'NetworkContact', id, 'Network contact deleted.', 'SUCCESS');
};

/**
 * Generates a networking message using AI.
 * @param userProfile The user's profile.
 * @param contact The network contact.
 * @param purpose The purpose of the message.
 * @returns A Promise resolving to the generated message string.
 */
export const apiGenerateNetworkingMessage = async (userProfile: UserProfile, contact: NetworkContact, purpose: string): Promise<string> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !contact || !ValidationUtils.isNotNullOrEmpty(purpose)) {
        throw new CustomError("Missing profile, contact, or purpose for networking message.", "INPUT_VALIDATION_ERROR");
    }
    const message = await careerAIClient.generateNetworkingMessage(userProfile, contact, purpose);
    notificationService.addNotification({ type: 'success', message: 'Networking message generated.', actionLink: `/network` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Networking Message', actionLink: `/network` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'NetworkingMessageGeneration', generateId(), 'Networking message generated.', 'SUCCESS', { contactName: contact.name, purpose });
    return message;
};

// 3.12 Project Management API
/**
 * Adds a new personal project.
 * Includes security measures like signature generation and audit logging.
 * @param project The project data to add.
 * @returns A Promise resolving to the newly added PersonalProject.
 */
export const apiAddPersonalProject = async (project: Omit<PersonalProject, 'id' | 'createdAt' | 'lastUpdated' | 'signature' | 'nonce'>): Promise<PersonalProject> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_projects')) {
        throw new CustomError('Permission denied to add personal project.', 'PERMISSION_DENIED');
    }
    const newProject: PersonalProject = {
        ...project,
        id: generateId(),
        createdAt: DateUtils.getNowISO(),
        lastUpdated: DateUtils.getNowISO(),
    };
    const signedProject = SecurityUtils.signObject(newProject, USER_ID);
    dataStore.setItem('PersonalProject', signedProject);
    notificationService.addNotification({ type: 'success', message: `Project "${signedProject.title}" added.`, actionLink: `/projects` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ProjectAdded, 'PersonalProject', signedProject.id, 'New personal project added.', 'SUCCESS', { title: signedProject.title });
    return signedProject;
};

/**
 * Updates an existing personal project.
 * Includes security measures like signature generation and audit logging.
 * @param project The updated PersonalProject object.
 * @returns A Promise resolving to the updated PersonalProject.
 */
export const apiUpdatePersonalProject = async (project: PersonalProject): Promise<PersonalProject> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_projects')) {
        throw new CustomError('Permission denied to update personal project.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(project, USER_ID)) {
        throw new CustomError('Data integrity check failed for personal project update.', 'SIGNATURE_MISMATCH');
    }

    project.lastUpdated = DateUtils.getNowISO();
    const signedProject = SecurityUtils.signObject(project, USER_ID);
    dataStore.setItem('PersonalProject', signedProject);
    notificationService.addNotification({ type: 'success', message: `Project "${signedProject.title}" updated.`, actionLink: `/projects` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ProfileUpdated, 'PersonalProject', signedProject.id, 'Personal project updated.', 'SUCCESS', { title: signedProject.title });
    return signedProject;
};

/**
 * Retrieves all personal projects.
 * @returns A Promise resolving to an array of PersonalProject objects.
 */
export const apiGetAllPersonalProjects = async (): Promise<PersonalProject[]> => {
    return dataStore.getAllItems<PersonalProject>('PersonalProject');
};

/**
 * Deletes a personal project.
 * Includes audit logging.
 * @param id The ID of the personal project to delete.
 * @returns A Promise that resolves when the project is removed.
 */
export const apiDeletePersonalProject = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_projects')) {
        throw new CustomError('Permission denied to delete personal project.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('PersonalProject', id);
    notificationService.addNotification({ type: 'info', message: 'Personal project removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.ProfileUpdated, 'PersonalProject', id, 'Personal project deleted.', 'SUCCESS');
};

/**
 * Suggests personal project ideas using AI.
 * @param userProfile The user's profile.
 * @param targetSkills Skills the user wants to develop.
 * @param careerGoal An optional career goal to focus on.
 * @returns A Promise resolving to an array of project ideas.
 */
export const apiSuggestPersonalProjectIdeas = async (userProfile: UserProfile, targetSkills: string[], careerGoal?: string): Promise<Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'technologiesUsed' | 'endDate' | 'signature' | 'nonce'>[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || targetSkills.length === 0) {
        throw new CustomError("User profile and target skills are required for project ideas.", "INPUT_VALIDATION_ERROR");
    }
    const ideas = await careerAIClient.suggestProjectIdeas(userProfile, targetSkills, careerGoal);
    notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} project ideas!`, actionLink: `/projects` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Project Idea Generation', actionLink: `/projects` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'ProjectIdeaGeneration', generateId(), 'Project ideas generated.', 'SUCCESS', { targetSkills, careerGoal });
    return ideas;
};

// 3.13 Mentorship API
/**
 * Adds a new mentor profile.
 * Includes security measures like signature generation and audit logging.
 * @param mentor The mentor profile data to add.
 * @returns A Promise resolving to the newly added MentorProfile.
 */
export const apiAddMentorProfile = async (mentor: Omit<MentorProfile, 'id' | 'currentMentees' | 'isAvailable' | 'signature' | 'nonce'>): Promise<MentorProfile> => {
    // This is an admin/system function, not for regular users to add mentors directly for now
    if (!accessControlService.hasPermission(USER_ID, 'manage_mentorship_profiles')) { // Assuming an admin permission
        throw new CustomError('Permission denied to add mentor profile.', 'PERMISSION_DENIED');
    }
    const newMentor: MentorProfile = {
        ...mentor,
        id: generateId(),
        currentMentees: [],
        isAvailable: true,
    };
    const signedMentor = SecurityUtils.signObject(newMentor, USER_ID_SYSTEM); // System agent signs mentor profiles
    dataStore.setItem('MentorProfile', signedMentor);
    notificationService.addNotification({ type: 'success', message: `Mentor "${signedMentor.name}" added to database.` });
    auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.ResourceAdded, 'MentorProfile', signedMentor.id, 'New mentor profile added.', 'SUCCESS', { name: signedMentor.name });
    return signedMentor;
};

/**
 * Updates an existing mentor profile.
 * Includes security measures like signature generation and audit logging.
 * @param mentor The updated MentorProfile object.
 * @returns A Promise resolving to the updated MentorProfile.
 */
export const apiUpdateMentorProfile = async (mentor: MentorProfile): Promise<MentorProfile> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_mentorship_profiles')) {
        throw new CustomError('Permission denied to update mentor profile.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(mentor, USER_ID_SYSTEM)) {
        throw new CustomError('Data integrity check failed for mentor profile update.', 'SIGNATURE_MISMATCH');
    }

    const signedMentor = SecurityUtils.signObject(mentor, USER_ID_SYSTEM);
    dataStore.setItem('MentorProfile', signedMentor);
    notificationService.addNotification({ type: 'success', message: `Mentor "${signedMentor.name}" profile updated.` });
    auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.ResourceAdded, 'MentorProfile', signedMentor.id, 'Mentor profile updated.', 'SUCCESS', { name: signedMentor.name });
    return signedMentor;
};

/**
 * Retrieves all mentor profiles.
 * @returns A Promise resolving to an array of MentorProfile objects.
 */
export const apiGetAllMentorProfiles = async (): Promise<MentorProfile[]> => {
    return dataStore.getAllItems<MentorProfile>('MentorProfile');
};

/**
 * Retrieves a specific mentor profile by ID.
 * @param id The ID of the mentor.
 * @returns A Promise resolving to the MentorProfile or null if not found.
 */
export const apiGetMentorProfileById = async (id: string): Promise<MentorProfile | null> => {
    return dataStore.getItem<MentorProfile>('MentorProfile', id);
};

/**
 * Deletes a mentor profile.
 * Includes audit logging.
 * @param id The ID of the mentor profile to delete.
 * @returns A Promise that resolves when the profile is removed.
 */
export const apiDeleteMentorProfile = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_mentorship_profiles')) {
        throw new CustomError('Permission denied to delete mentor profile.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('MentorProfile', id);
    notificationService.addNotification({ type: 'info', message: 'Mentor profile removed.' });
    auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.ResourceAdded, 'MentorProfile', id, 'Mentor profile deleted.', 'SUCCESS');
};

/**
 * Matches mentors to the user's profile using AI.
 * @param userProfile The user's profile.
 * @param numberOfMatches The desired number of mentor matches.
 * @returns A Promise resolving to an array of matched MentorProfile objects.
 */
export const apiMatchMentors = async (userProfile: UserProfile, numberOfMatches: number = 3): Promise<MentorProfile[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile) {
        throw new CustomError("User profile is required for mentor matching.", "INPUT_VALIDATION_ERROR");
    }
    const allMentors = await apiGetAllMentorProfiles();
    const availableMentors = allMentors.filter(m => m.isAvailable && m.currentMentees.length < m.menteeCapacity);
    if (availableMentors.length === 0) {
        notificationService.addNotification({ type: 'info', message: 'No available mentors for matching at this time.' });
        return [];
    }
    const matchedMentors = await careerAIClient.matchMentors(userProfile, availableMentors, numberOfMatches);
    matchedMentors.forEach(mentor => {
        webhookProcessor.receiveEvent({ eventType: 'NEW_MENTOR_SUGGESTION', payload: { mentorId: mentor.id, mentorName: mentor.name } });
    });
    notificationService.addNotification({ type: 'success', message: `Found ${matchedMentors.length} mentor matches!`, actionLink: `/mentorship` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Mentor Matching', actionLink: `/mentorship` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'MentorMatching', generateId(), 'Mentors matched.', 'SUCCESS', { numberOfMatches: matchedMentors.length });
    return matchedMentors;
};

/**
 * Schedules a new mentorship session.
 * Includes security measures like signature generation and audit logging.
 * @param mentorId The ID of the mentor.
 * @param topic The topic of the session.
 * @param durationMinutes The duration of the session in minutes.
 * @returns A Promise resolving to the newly scheduled MentorshipSession.
 */
export const apiScheduleMentorshipSession = async (mentorId: string, topic: string, durationMinutes: number): Promise<MentorshipSession> => {
    if (!accessControlService.hasPermission(USER_ID, 'schedule_mentorship')) {
        throw new CustomError('Permission denied to schedule mentorship session.', 'PERMISSION_DENIED');
    }
    const userProfile = await apiGetUserProfile(USER_ID);
    if (!userProfile) throw new CustomError("User profile not found.", "USER_NOT_FOUND");
    const mentor = await apiGetMentorProfileById(mentorId);
    if (!mentor) throw new CustomError("Mentor not found.", "MENTOR_NOT_FOUND");

    const newSession: MentorshipSession = {
        id: generateId(),
        mentorId: mentor.id,
        menteeId: userProfile.id,
        sessionDate: DateUtils.addDays(DateUtils.getNowISO(), 7), // Simulate a week from now
        durationMinutes,
        topic,
        notes: '',
        status: 'Scheduled',
        actionItems: []
    };
    const signedSession = SecurityUtils.signObject(newSession, USER_ID);
    dataStore.setItem('MentorshipSession', signedSession);

    mentor.currentMentees.push(userProfile.id);
    await apiUpdateMentorProfile(mentor);

    notificationService.addNotification({ type: 'success', message: `Mentorship session with ${mentor.name} scheduled for ${DateUtils.formatDate(signedSession.sessionDate)}.`, actionLink: `/mentorship/${signedSession.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.SessionScheduled, 'MentorshipSession', signedSession.id, 'Mentorship session scheduled.', 'SUCCESS', { mentorId, topic, durationMinutes });
    return signedSession;
};

/**
 * Updates an existing mentorship session.
 * Includes security measures like signature generation and audit logging.
 * @param session The updated MentorshipSession object.
 * @returns A Promise resolving to the updated MentorshipSession.
 */
export const apiUpdateMentorshipSession = async (session: MentorshipSession): Promise<MentorshipSession> => {
    if (!accessControlService.hasPermission(USER_ID, 'schedule_mentorship')) { // User can update their own sessions
        throw new CustomError('Permission denied to update mentorship session.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(session, USER_ID)) {
        throw new CustomError('Data integrity check failed for mentorship session update.', 'SIGNATURE_MISMATCH');
    }

    const signedSession = SecurityUtils.signObject(session, USER_ID);
    dataStore.setItem('MentorshipSession', signedSession);
    notificationService.addNotification({ type: 'success', message: `Mentorship session for "${signedSession.topic}" updated.`, actionLink: `/mentorship/${signedSession.id}` });
    auditLogService.recordEvent(USER_ID, AuditEventType.SessionScheduled, 'MentorshipSession', signedSession.id, 'Mentorship session updated.', 'SUCCESS', { topic: signedSession.topic, status: signedSession.status });
    return signedSession;
};

/**
 * Retrieves all mentorship sessions for a specific mentee.
 * @param menteeId The ID of the mentee.
 * @returns A Promise resolving to an array of MentorshipSession objects.
 */
export const apiGetAllMentorshipSessions = async (menteeId: string = USER_ID): Promise<MentorshipSession[]> => {
    return dataStore.getAllItems<MentorshipSession>('MentorshipSession').filter(session => session.menteeId === menteeId);
};

// 3.14 Learning Resources API
/**
 * Retrieves all learning resources.
 * @returns A Promise resolving to an array of LearningResource objects.
 */
export const apiGetAllLearningResources = async (): Promise<LearningResource[]> => {
    return dataStore.getAllItems<LearningResource>('LearningResource');
};

/**
 * Adds a new learning resource.
 * Includes audit logging.
 * @param resource The learning resource data to add.
 * @returns A Promise resolving to the newly added LearningResource.
 */
export const apiAddLearningResource = async (resource: Omit<LearningResource, 'id' | 'dateAdded'>): Promise<LearningResource> => {
    if (!accessControlService.hasPermission(USER_ID, 'add_learning_resource')) { // Admin or specific content manager role
        throw new CustomError('Permission denied to add learning resource.', 'PERMISSION_DENIED');
    }
    const newResource: LearningResource = {
        ...resource,
        id: generateId(),
        dateAdded: DateUtils.getNowISO()
    };
    dataStore.setItem('LearningResource', newResource);
    notificationService.addNotification({ type: 'success', message: `Learning resource "${newResource.title}" added.` });
    auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.ResourceAdded, 'LearningResource', newResource.id, 'New learning resource added.', 'SUCCESS', { title: newResource.title });
    return newResource;
};

/**
 * Updates an existing learning resource.
 * Includes audit logging.
 * @param resource The updated LearningResource object.
 * @returns A Promise resolving to the updated LearningResource.
 */
export const apiUpdateLearningResource = async (resource: LearningResource): Promise<LearningResource> => {
    if (!accessControlService.hasPermission(USER_ID, 'edit_learning_resource')) {
        throw new CustomError('Permission denied to update learning resource.', 'PERMISSION_DENIED');
    }
    dataStore.setItem('LearningResource', resource);
    notificationService.addNotification({ type: 'success', message: `Learning resource "${resource.title}" updated.` });
    auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.ResourceAdded, 'LearningResource', resource.id, 'Learning resource updated.', 'SUCCESS', { title: resource.title });
    return resource;
};

/**
 * Deletes a learning resource.
 * Includes audit logging.
 * @param id The ID of the learning resource to delete.
 * @returns A Promise that resolves when the resource is removed.
 */
export const apiDeleteLearningResource = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'delete_learning_resource')) {
        throw new CustomError('Permission denied to delete learning resource.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('LearningResource', id);
    notificationService.addNotification({ type: 'info', message: 'Learning resource removed.' });
    auditLogService.recordEvent(USER_ID_SYSTEM, AuditEventType.ResourceAdded, 'LearningResource', id, 'Learning resource deleted.', 'SUCCESS');
};


// 3.15 Portfolio Management API
/**
 * Adds a new portfolio item.
 * Includes security measures like signature generation and audit logging.
 * @param item The portfolio item data to add.
 * @returns A Promise resolving to the newly added PortfolioItem.
 */
export const apiAddPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'signature' | 'nonce'>): Promise<PortfolioItem> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_portfolio')) {
        throw new CustomError('Permission denied to add portfolio item.', 'PERMISSION_DENIED');
    }
    const newItem: PortfolioItem = {
        ...item,
        id: generateId(),
        date: item.date || DateUtils.getNowISO()
    };
    const signedItem = SecurityUtils.signObject(newItem, USER_ID);
    dataStore.setItem('PortfolioItem', signedItem);
    notificationService.addNotification({ type: 'success', message: `Portfolio item "${signedItem.title}" added.`, actionLink: `/portfolio` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ResourceAdded, 'PortfolioItem', signedItem.id, 'New portfolio item added.', 'SUCCESS', { title: signedItem.title });
    return signedItem;
};

/**
 * Updates an existing portfolio item.
 * Includes security measures like signature generation and audit logging.
 * @param item The updated PortfolioItem object.
 * @returns A Promise resolving to the updated PortfolioItem.
 */
export const apiUpdatePortfolioItem = async (item: PortfolioItem): Promise<PortfolioItem> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_portfolio')) {
        throw new CustomError('Permission denied to update portfolio item.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(item, USER_ID)) {
        throw new CustomError('Data integrity check failed for portfolio item update.', 'SIGNATURE_MISMATCH');
    }

    const signedItem = SecurityUtils.signObject(item, USER_ID);
    dataStore.setItem('PortfolioItem', signedItem);
    notificationService.addNotification({ type: 'success', message: `Portfolio item "${signedItem.title}" updated.`, actionLink: `/portfolio` });
    auditLogService.recordEvent(USER_ID, AuditEventType.ResourceAdded, 'PortfolioItem', signedItem.id, 'Portfolio item updated.', 'SUCCESS', { title: signedItem.title });
    return signedItem;
};

/**
 * Retrieves all portfolio items.
 * @returns A Promise resolving to an array of PortfolioItem objects.
 */
export const apiGetAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
    return dataStore.getAllItems<PortfolioItem>('PortfolioItem');
};

/**
 * Deletes a portfolio item.
 * Includes audit logging.
 * @param id The ID of the portfolio item to delete.
 * @returns A Promise that resolves when the item is removed.
 */
export const apiDeletePortfolioItem = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_portfolio')) {
        throw new CustomError('Permission denied to delete portfolio item.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('PortfolioItem', id);
    notificationService.addNotification({ type: 'info', message: 'Portfolio item removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.ResourceAdded, 'PortfolioItem', id, 'Portfolio item deleted.', 'SUCCESS');
};

/**
 * Reviews a portfolio item using AI.
 * @param item The portfolio item to review.
 * @param userProfile The user's profile.
 * @param targetJobDescription An optional job description for contextual review.
 * @returns A Promise resolving to an array of AISuggestion objects.
 */
export const apiReviewPortfolioItem = async (item: PortfolioItem, userProfile: UserProfile, targetJobDescription?: string): Promise<AISuggestion[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !item) {
        throw new CustomError("User profile and portfolio item are required for review.", "INPUT_VALIDATION_ERROR");
    }
    const suggestions = await careerAIClient.reviewPortfolioItem(item, userProfile, targetJobDescription);
    notificationService.addNotification({ type: 'success', message: `Portfolio item "${item.title}" reviewed.`, actionLink: `/portfolio` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Portfolio Review', actionLink: `/portfolio` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'PortfolioReview', item.id, 'Portfolio item reviewed by AI.', 'SUCCESS', { title: item.title, targetJobDescription });
    return suggestions;
};

// 3.16 Content Generation API
/**
 * Generates content ideas using AI.
 * @param userProfile The user's profile.
 * @param contentType The type of content to generate.
 * @param focusArea The focus area for the content.
 * @returns A Promise resolving to an array of content ideas.
 */
export const apiGenerateContentIdeas = async (userProfile: UserProfile, contentType: string, focusArea: string): Promise<{ title: string; outline: string; targetAudience: string; keywords: string[] }[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !ValidationUtils.isNotNullOrEmpty(contentType) || !ValidationUtils.isNotNullOrEmpty(focusArea)) {
        throw new CustomError("User profile, content type, and focus area are required.", "INPUT_VALIDATION_ERROR");
    }
    const ideas = await careerAIClient.generateContentIdeas(userProfile, contentType, focusArea);
    notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} content ideas for ${focusArea}.`, actionLink: `/content` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Content Idea Generation', actionLink: `/content` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.AITaskCompleted, 'ContentIdeaGeneration', generateId(), 'Content ideas generated.', 'SUCCESS', { contentType, focusArea });
    return ideas;
};

// 3.17 Daily Planning API
/**
 * Generates a daily career development plan using AI.
 * Includes security measures like signature generation and audit logging.
 * @param userProfile The user's profile.
 * @param goals A list of the user's active goals.
 * @param skillsToDevelop Top skills the user wants to focus on.
 * @param numberOfItems The number of daily activities to suggest.
 * @returns A Promise resolving to an array of DailyPlanItem objects.
 */
export const apiGenerateDailyPlan = async (userProfile: UserProfile, goals: CareerGoal[], skillsToDevelop: string[], numberOfItems: number): Promise<DailyPlanItem[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || skillsToDevelop.length === 0) {
        throw new CustomError("User profile and skills to develop are required for daily plan generation.", "INPUT_VALIDATION_ERROR");
    }
    const planItems = await careerAIClient.generateDailyPlan(userProfile, goals, skillsToDevelop, numberOfItems);
    const today = new Date().toISOString().substring(0, 10);
    const fullPlan: DailyPlanItem[] = planItems.map(item => SecurityUtils.signObject({
        ...item,
        id: generateId(),
        date: today,
        isCompleted: false
    }, USER_ID));
    fullPlan.forEach(item => dataStore.setItem('DailyPlanItem', item));
    notificationService.addNotification({ type: 'success', message: `Generated your daily plan for today!`, actionLink: `/daily-plan` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Daily Plan Generation', actionLink: `/daily-plan` } });
    auditLogService.recordEvent(USER_ID, AuditEventType.DailyPlanGenerated, 'DailyPlan', generateId(), 'Daily plan generated.', 'SUCCESS', { date: today, skillsToDevelop });
    return fullPlan;
};

/**
 * Retrieves the daily plan items for a specific date.
 * @param date The ISO date string (YYYY-MM-DD).
 * @returns A Promise resolving to an array of DailyPlanItem objects.
 */
export const apiGetDailyPlanForDate = async (date: string): Promise<DailyPlanItem[]> => {
    return dataStore.getAllItems<DailyPlanItem>('DailyPlanItem').filter(item => item.date === date)
        .sort((a, b) => a.time.localeCompare(b.time));
};

/**
 * Updates a daily plan item.
 * Includes security measures like signature generation and audit logging.
 * @param item The updated DailyPlanItem object.
 * @returns A Promise resolving to the updated DailyPlanItem.
 */
export const apiUpdateDailyPlanItem = async (item: DailyPlanItem): Promise<DailyPlanItem> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_daily_plan')) {
        throw new CustomError('Permission denied to update daily plan item.', 'PERMISSION_DENIED');
    }
    if (!SecurityUtils.verifyObjectSignature(item, USER_ID)) {
        throw new CustomError('Data integrity check failed for daily plan item update.', 'SIGNATURE_MISMATCH');
    }

    const signedItem = SecurityUtils.signObject(item, USER_ID);
    dataStore.setItem('DailyPlanItem', signedItem);
    notificationService.addNotification({ type: 'info', message: `Daily plan item "${TextUtils.truncate(item.activity, 50)}" updated.` });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalUpdated, 'DailyPlanItem', signedItem.id, 'Daily plan item updated.', 'SUCCESS', { activity: signedItem.activity, isCompleted: signedItem.isCompleted });
    return signedItem;
};

/**
 * Deletes a daily plan item.
 * Includes audit logging.
 * @param id The ID of the daily plan item to delete.
 * @returns A Promise that resolves when the item is removed.
 */
export const apiDeleteDailyPlanItem = async (id: string): Promise<void> => {
    if (!accessControlService.hasPermission(USER_ID, 'manage_daily_plan')) {
        throw new CustomError('Permission denied to delete daily plan item.', 'PERMISSION_DENIED');
    }
    dataStore.removeItem('DailyPlanItem', id);
    notificationService.addNotification({ type: 'info', message: 'Daily plan item removed.' });
    auditLogService.recordEvent(USER_ID, AuditEventType.GoalUpdated, 'DailyPlanItem', id, 'Daily plan item deleted.', 'SUCCESS');
};

/**
 * Retrieves all audit log entries.
 * @returns A Promise resolving to an array of AuditLogEntry objects.
 */
export const apiGetAllAuditLogs = async (): Promise<AuditLogEntry[]> => {
    if (!accessControlService.hasPermission(USER_ID, 'view_audit_log')) {
        throw new CustomError('Permission denied to view audit logs.', 'PERMISSION_DENIED');
    }
    return auditLogService.getAllLogEntries();
};

/**
 * Retrieves the user's token balance for a specific token type.
 * @param tokenType The type of token.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the token balance.
 */
export const apiGetTokenBalance = async (tokenType: TokenType, userId: string = USER_ID): Promise<number> => {
    if (!accessControlService.hasPermission(userId, 'view_tokens')) {
        throw new CustomError('Permission denied to view token balance.', 'PERMISSION_DENIED');
    }
    return tokenizedRewardService.getBalance(userId, tokenType);
};

/**
 * Retrieves all token transactions.
 * @returns A Promise resolving to an array of TokenTransaction objects.
 */
export const apiGetAllTokenTransactions = async (): Promise<TokenTransaction[]> => {
    if (!accessControlService.hasPermission(USER_ID, 'view_tokens')) {
        throw new CustomError('Permission denied to view token transactions.', 'PERMISSION_DENIED');
    }
    return tokenizedRewardService.getAllTokenTransactions();
};

/**
 * Simulates spending tokens for a premium feature or service.
 * @param amount The amount of tokens to spend.
 * @param tokenType The type of token.
 * @param memo A description for the transaction.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the updated token balance.
 */
export const apiSpendTokens = async (amount: number, tokenType: TokenType, memo: string, userId: string = USER_ID): Promise<number> => {
    if (!accessControlService.hasPermission(userId, 'spend_tokens')) {
        throw new CustomError('Permission denied to spend tokens.', 'PERMISSION_DENIED');
    }
    await tokenizedRewardService.transferTokens(userId, USER_ID_SYSTEM, amount, tokenType, memo);
    notificationService.addNotification({ type: 'success', message: `Successfully spent ${amount} ${tokenType} for ${memo}.` });
    return tokenizedRewardService.getBalance(userId, tokenType);
};

/**
 * Simulates a payment for a premium feature or mentorship.
 * @param amount The amount of money.
 * @param currency The currency.
 * @param memo A description for the payment.
 * @param userId The ID of the user.
 * @returns A Promise resolving to the PaymentRecord.
 */
export const apiMakePayment = async (amount: number, currency: string, memo: string, userId: string = USER_ID): Promise<PaymentRecord> => {
    if (!accessControlService.hasPermission(userId, 'process_payment')) {
        throw new CustomError('Permission denied to make payment.', 'PERMISSION_DENIED');
    }
    return paymentGatewayService.processPayment(userId, USER_ID_SYSTEM, amount, currency, memo);
};

/**
 * Retrieves all payment records.
 * @returns A Promise resolving to an array of PaymentRecord objects.
 */
export const apiGetAllPayments = async (): Promise<PaymentRecord[]> => {
    if (!accessControlService.hasPermission(USER_ID, 'view_payments')) {
        throw new CustomError('Permission denied to view payments.', 'PERMISSION_DENIED');
    }
    return paymentGatewayService.getAllPaymentRecords();
};

/**
 * Retrieves a specific learning resource by ID.
 * @param id The ID of the learning resource.
 * @returns A Promise resolving to the LearningResource or null if not found.
 */
export const apiGetLearningResourceById = async (id: string): Promise<LearningResource | null> => {
    return dataStore.getItem<LearningResource>('LearningResource', id);
};


/**
 * =====================================================================================================================
 *  SECTION 4: REACT COMPONENT - CAREER TRAJECTORY VIEW
 * =====================================================================================================================
 * This section contains the main React component, heavily expanded with UI elements and state management
 * to expose all the functionality defined in the preceding sections.
 * Business value: This is the user-facing command center for career advancement, providing a single, intuitive interface
 * to leverage all platform capabilities. Its modular design allows for rapid feature deployment and A/B testing,
 * ensuring continuous improvement of the user experience. The integrated notifications and contextual tools drive
 * user engagement and retention, maximizing the ROI of the underlying AI and data infrastructure.
 */

export const CareerTrajectoryView: React.FC = () => {
    // -----------------------------------------------------------------------------------------------------------------
    //  4.1: Component-level State Management
    // -----------------------------------------------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState<string>('resume'); // 'resume', 'profile', 'goals', 'applications', 'interview', 'skills', 'market', 'branding', 'review', 'network', 'projects', 'mentorship', 'portfolio', 'content', 'daily-plan', 'identity', 'tokens', 'audit-log', 'payments'

    // Core AI Analysis State (Resume & JD)
    const [resume, setResume] = useState<string>('');
    const [jobDesc, setJobDesc] = useState<string>('');
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);
    const [aiModelPreference, setAiModelPreference] = useState<keyof typeof AI_MODELS>('balanced');
    const [currentIdentityVerificationLevel, setCurrentIdentityVerificationLevel] = useState<IdentityVerificationLevel>(IdentityVerificationLevel.None);


    // Job Applications State
    const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
    const [showAddApplicationModal, setShowAddApplicationModal] = useState<boolean>(false);
    const [currentApplicationForm, setCurrentApplicationForm] = useState<Partial<JobApplication>>({});
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [coverLetterContent, setCoverLetterContent] = useState<string>('');
    const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState<boolean>(false);
    const [isSavingApplication, setIsSavingApplication] = useState<boolean>(false);

    // Career Goals State
    const [careerGoals, setCareerGoals] = useState<CareerGoal[]>([]);
    const [showAddGoalModal, setShowAddGoalModal] = useState<boolean>(false);
    const [currentGoalForm, setCurrentGoalForm] = useState<Partial<CareerGoal>>({});
    const [selectedGoal, setSelectedGoal] = useState<CareerGoal | null>(null); // For detailed view
    const [isSavingGoal, setIsSavingGoal] = useState<boolean>(false);
    const [showAddActionItemModal, setShowAddActionItemModal] = useState<boolean>(false);
    const [currentActionItemForm, setCurrentActionItemForm] = useState<Partial<ActionItem>>({});

    // Skill Gap Analysis State
    const [skillGapTarget, setSkillGapTarget] = useState<string>('');
    const [skillGaps, setSkillGaps] = useState<SkillAssessmentResult[]>([]);
    const [isAnalyzingSkills, setIsAnalyzingSkills] = useState<boolean>(false);
    const debouncedSkillGapTarget = useDebounce(skillGapTarget, DEBOUNCE_DELAY_MS);
    const [learningResources, setLearningResources] = useState<LearningResource[]>([]);

    // Career Path Recommendations State
    const [careerPaths, setCareerPaths] = useState<CareerPathRecommendation[]>([]);
    const [isGeneratingCareerPaths, setIsGeneratingCareerPaths] = useState<boolean>(false);

    // Interview Preparation State
    const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
    const [selectedInterviewSession, setSelectedInterviewSession] = useState<InterviewSession | null>(null);
    const [isStartingInterview, setIsStartingInterview] = useState<boolean>(false);
    const [isSubmittingAnswers, setIsSubmittingAnswers] = useState<boolean>(false);
    const [currentInterviewQuestions, setCurrentInterviewQuestions] = useState<{ question: string; userAnswer: string; }[]>([]);

    // Market Trends State
    const [marketTrendIndustry, setMarketTrendIndustry] = useState<string>(userProfile?.industry || 'Technology');
    const [marketTrendKeywords, setMarketTrendKeywords] = useState<string>('AI, Remote Work, Sustainability');
    const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
    const [isFetchingMarketTrends, setIsFetchingMarketTrends] = useState<boolean>(false);
    const debouncedMarketTrendIndustry = useDebounce(marketTrendIndustry, DEBOUNCE_DELAY_MS);
    const debouncedMarketTrendKeywords = useDebounce(marketTrendKeywords, DEBOUNCE_DELAY_MS);

    // Salary Negotiation State
    const [negotiationJobTitle, setNegotiationJobTitle] = useState<string>('');
    const [negotiationCompany, setNegotiationCompany] = useState<string>('');
    const [negotiationInitialOffer, setNegotiationInitialOffer] = useState<number>(0);
    const [negotiationDesiredSalary, setNegotiationDesiredSalary] = useState<number>(0);
    const [negotiationScript, setNegotiationScript] = useState<string>('');
    const [isGeneratingNegotiationScript, setIsGeneratingNegotiationScript] = useState<boolean>(false);

    // Personal Branding State
    const [linkedInSummary, setLinkedInSummary] = useState<string>('');
    const [isOptimizingLinkedIn, setIsOptimizingLinkedIn] = useState<boolean>(false);
    const [brandStatementDesiredImpact, setBrandStatementDesiredImpact] = useState<string>('Become a recognized leader in my field.');
    const [personalBrandStatement, setPersonalBrandStatement] = useState<PersonalBrandStatement | null>(null);
    const [isGeneratingBrandStatement, setIsGeneratingBrandStatement] = useState<boolean>(false);

    // Performance Review State
    const [performanceAchievements, setPerformanceAchievements] = useState<string>('');
    const [performanceReviewPoints, setPerformanceReviewPoints] = useState<string[]>([]);
    const [isPreparingReview, setIsPreparingReview] = useState<boolean>(false);

    // Networking State
    const [networkContacts, setNetworkContacts] = useState<NetworkContact[]>([]);
    const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
    const [currentContactForm, setCurrentContactForm] = useState<Partial<NetworkContact>>({});
    const [isSavingContact, setIsSavingContact] = useState<boolean>(false);
    const [selectedContactForMessage, setSelectedContactForMessage] = useState<NetworkContact | null>(null);
    const [networkingMessagePurpose, setNetworkingMessagePurpose] = useState<string>('');
    const [generatedNetworkingMessage, setGeneratedNetworkingMessage] = useState<string>('');
    const [isGeneratingNetworkingMessage, setIsGeneratingNetworkingMessage] = useState<boolean>(false);

    // Personal Projects State
    const [personalProjects, setPersonalProjects] = useState<PersonalProject[]>([]);
    const [showAddProjectModal, setShowAddProjectModal] = useState<boolean>(false);
    const [currentProjectForm, setCurrentProjectForm] = useState<Partial<PersonalProject>>({});
    const [isSavingProject, setIsSavingProject] = useState<boolean>(false);
    const [projectIdeaSkills, setProjectIdeaSkills] = useState<string>('');
    const [projectIdeaGoalId, setProjectIdeaGoalId] = useState<string>('');
    const [suggestedProjectIdeas, setSuggestedProjectIdeas] = useState<Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'technologiesUsed' | 'endDate' | 'signature' | 'nonce'>[]>([]);
    const [isSuggestingProjectIdeas, setIsSuggestingProjectIdeas] = useState<boolean>(false);

    // Mentorship State
    const [mentorProfiles, setMentorProfiles] = useState<MentorProfile[]>([]);
    const [mentorshipSessions, setMentorshipSessions] = useState<MentorshipSession[]>([]);
    const [matchedMentors, setMatchedMentors] = useState<MentorProfile[]>([]);
    const [isMatchingMentors, setIsMatchingMentors] = useState<boolean>(false);
    const [showScheduleSessionModal, setShowScheduleSessionModal] = useState<boolean>(false);
    const [currentSessionMentorId, setCurrentSessionMentorId] = useState<string>('');
    const [currentSessionTopic, setCurrentSessionTopic] = useState<string>('');
    const [currentSessionDuration, setCurrentSessionDuration] = useState<number>(30);
    const [isSchedulingSession, setIsSchedulingSession] = useState<boolean>(false);
    const [selectedMentorshipSession, setSelectedMentorshipSession] = useState<MentorshipSession | null>(null);

    // Portfolio Management State
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
    const [showAddPortfolioModal, setShowAddPortfolioModal] = useState<boolean>(false);
    const [currentPortfolioItemForm, setCurrentPortfolioItemForm] = useState<Partial<PortfolioItem>>({});
    const [isSavingPortfolioItem, setIsSavingPortfolioItem] = useState<boolean>(false);
    const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
    const [portfolioReviewJobDesc, setPortfolioReviewJobDesc] = useState<string>('');
    const [portfolioReviewSuggestions, setPortfolioReviewSuggestions] = useState<AISuggestion[]>([]);
    const [isReviewingPortfolioItem, setIsReviewingPortfolioItem] = useState<boolean>(false);

    // Content Generation State
    const [contentType, setContentType] = useState<string>('blog post');
    const [contentFocusArea, setContentFocusArea] = useState<string>('AI in Product Management');
    const [generatedContentIdeas, setGeneratedContentIdeas] = useState<{ title: string; outline: string; targetAudience: string; keywords: string[] }[]>([]);
    const [isGeneratingContentIdeas, setIsGeneratingContentIdeas] = useState<boolean>(false);

    // Daily Planning State
    const [dailyPlanDate, setDailyPlanDate] = useState<string>(new Date().toISOString().substring(0, 10));
    const [dailyPlanItems, setDailyPlanItems] = useState<DailyPlanItem[]>([]);
    const [dailyPlanSkillsToFocus, setDailyPlanSkillsToFocus] = useState<string>('');
    const [isGeneratingDailyPlan, setIsGeneratingDailyPlan] = useState<boolean>(false);

    // Tokenized Rewards State
    const [careerCoinBalance, setCareerCoinBalance] = useState<number>(0);
    const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>([]);
    const [isSpendingTokens, setIsSpendingTokens] = useState<boolean>(false);
    const [tokenSpendAmount, setTokenSpendAmount] = useState<number>(0);
    const [tokenSpendMemo, setTokenSpendMemo] = useState<string>('');

    // Payments State
    const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
    const [isMakingPayment, setIsMakingPayment] = useState<boolean>(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentCurrency, setPaymentCurrency] = useState<string>('USD');
    const [paymentMemo, setPaymentMemo] = useState<string>('');

    // Audit Log State
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

    // Global Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Refs for textareas to manage focus or content
    const resumeRef = useRef<HTMLTextAreaElement>(null);
    const jobDescRef = useRef<HTMLTextAreaElement>(null);


    // -----------------------------------------------------------------------------------------------------------------
    //  4.2: Lifecycle & Initial Data Loading
    // -----------------------------------------------------------------------------------------------------------------
    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const profile = await apiInitializeUserProfile(USER_ID);
            setUserProfile(profile);
            setResume(profile.resumeText || `Experience:\nSoftware Engineer at Acme Corp (2020-2024)\n- Worked on a team to build software.\n- Fixed bugs and improved performance.`);
            setJobDesc(`Job: Senior Software Engineer at Innovate Inc.\nRequirements:\n- 5+ years of experience.\n- Expertise in agile development and CI/CD pipelines.\n- Proven ability to mentor junior engineers.`);
            setAiModelPreference(profile.aiModelPreference || 'balanced');
            setCurrentIdentityVerificationLevel(profile.identityVerificationLevel);

            setJobApplications(await apiGetAllJobApplications());
            setCareerGoals(await apiGetAllCareerGoals());
            setInterviewSessions(await apiGetAllInterviewSessions());
            setNetworkContacts(await apiGetAllNetworkContacts());
            setPersonalProjects(await apiGetAllPersonalProjects());
            setMentorProfiles(await apiGetAllMentorProfiles());
            setMentorshipSessions(await apiGetAllMentorshipSessions());
            setLearningResources(await apiGetAllLearningResources());
            setPortfolioItems(await apiGetAllPortfolioItems());
            setPersonalBrandStatement(await apiGetLatestPersonalBrandStatement());
            setDailyPlanItems(await apiGetDailyPlanForDate(new Date().toISOString().substring(0, 10)));
            setCareerCoinBalance(await apiGetTokenBalance(TokenType.CareerCoin, USER_ID));
            setTokenTransactions(await apiGetAllTokenTransactions());
            setPaymentRecords(await apiGetAllPayments());
            setAuditLogs(await apiGetAllAuditLogs());

        } catch (err) {
            console.error("Failed to load initial data:", err);
            setError(`Failed to load initial data: ${(err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Initial data load failed: ${(err as Error).message}` });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllData();
        const unsubscribe = notificationService.subscribe((newNotifications) => {
            setNotifications([...newNotifications]);
        });
        return () => unsubscribe();
    }, [loadAllData]);

    useEffect(() => {
        if (userProfile && resume !== userProfile.resumeText) {
            const updatedProfile = { ...userProfile, resumeText: resume };
            // Simulate saving profile, but prevent excessive API calls due to every keystroke
            const timer = setTimeout(() => {
                apiUpdateUserProfile(updatedProfile)
                    .then(p => setUserProfile(p))
                    .catch(e => console.error("Auto-save resume to profile failed:", e));
            }, 1000); // Debounce auto-save
            return () => clearTimeout(timer);
        }
    }, [resume, userProfile]);

    useEffect(() => {
        if (careerAIClient && userProfile?.id) {
            careerAIClient.setModel(userProfile.aiModelPreference || 'balanced');
        }
    }, [userProfile?.aiModelPreference, userProfile?.id]);


    // -----------------------------------------------------------------------------------------------------------------
    //  4.3: Event Handlers & Core Logic
    // -----------------------------------------------------------------------------------------------------------------

    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setSuggestions([]);
        setError(null);
        try {
            if (!ValidationUtils.isNotNullOrEmpty(resume) || !ValidationUtils.isNotNullOrEmpty(jobDesc)) {
                throw new CustomError("Resume and Job Description cannot be empty for analysis.", "INPUT_VALIDATION_ERROR");
            }
            const aiSuggestions = await apiGenerateResumeSuggestions(resume, jobDesc);
            setSuggestions(aiSuggestions);
            notificationService.addNotification({ type: 'success', message: 'Resume suggestions generated successfully!' });
        } catch (err) {
            console.error("Resume analysis failed:", err);
            setError(`Resume analysis failed: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Resume analysis failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsLoading(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [resume, jobDesc]);

    const handleProfileUpdate = useCallback(async () => {
        if (!userProfile) return;
        setIsSavingApplication(true);
        setError(null);
        try {
            const updatedProfile = await apiUpdateUserProfile(userProfile);
            setUserProfile(updatedProfile);
            setIsProfileEditing(false);
            notificationService.addNotification({ type: 'success', message: 'Profile updated.' });
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError(`Failed to update profile: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Profile update failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingApplication(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile]);

    const handleRequestIdentityVerification = useCallback(async (level: IdentityVerificationLevel) => {
        if (!userProfile) return;
        setError(null);
        try {
            await apiRequestIdentityVerification(userProfile.id, level);
            const updatedProfile = await apiGetUserProfile(userProfile.id);
            if (updatedProfile) {
                setUserProfile(updatedProfile);
                setCurrentIdentityVerificationLevel(updatedProfile.identityVerificationLevel);
            }
        } catch (err) {
            console.error("Failed to request identity verification:", err);
            setError(`Identity verification request failed: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Identity verification failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile]);

    const handleAddOrUpdateApplication = useCallback(async () => {
        if (!currentApplicationForm.jobTitle || !currentApplicationForm.company || !currentApplicationForm.applicationDate) {
            setError("Job Title, Company, and Application Date are required.");
            return;
        }

        setIsSavingApplication(true);
        setError(null);
        try {
            let updatedApp: JobApplication;
            if (currentApplicationForm.id) {
                updatedApp = await apiUpdateJobApplication(currentApplicationForm as JobApplication);
            } else {
                updatedApp = await apiAddJobApplication(currentApplicationForm as Omit<JobApplication, 'id' | 'createdAt' | 'lastUpdated' | 'contacts' | 'negotiationHistory' | 'feedbackReceived' | 'interviewDates' | 'signature' | 'nonce'>);
            }
            setJobApplications(prev => {
                const existingIndex = prev.findIndex(app => app.id === updatedApp.id);
                if (existingIndex > -1) {
                    const newApps = [...prev];
                    newApps[existingIndex] = updatedApp;
                    return newApps;
                }
                return [...prev, updatedApp];
            });
            setShowAddApplicationModal(false);
            setCurrentApplicationForm({});
            notificationService.addNotification({ type: 'success', message: `Application ${updatedApp.id ? 'updated' : 'added'}!` });
        } catch (err) {
            console.error("Failed to save application:", err);
            setError(`Failed to save application: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Application save failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingApplication(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [currentApplicationForm]);

    const handleGenerateCoverLetter = useCallback(async (app: JobApplication) => {
        if (!userProfile) {
            setError("User profile is required to generate a cover letter.");
            return;
        }
        setIsGeneratingCoverLetter(true);
        setCoverLetterContent('');
        setError(null);
        try {
            const resumeSummary = TextUtils.truncate(userProfile.resumeText, 500);
            const generatedLetter = await apiGenerateCoverLetter(userProfile, app, resumeSummary);
            setCoverLetterContent(generatedLetter);
            const updatedApp = { ...app, coverLetterUsed: generatedLetter, lastUpdated: DateUtils.getNowISO() };
            await apiUpdateJobApplication(updatedApp);
            setJobApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
            notificationService.addNotification({ type: 'success', message: 'Cover letter generated and saved to application.' });
        } catch (err) {
            console.error("Failed to generate cover letter:", err);
            setError(`Failed to generate cover letter: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Cover letter generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingCoverLetter(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile]);

    const handleAddOrUpdateGoal = useCallback(async () => {
        if (!currentGoalForm.title || !currentGoalForm.targetDate) {
            setError("Goal Title and Target Date are required.");
            return;
        }

        setIsSavingGoal(true);
        setError(null);
        try {
            let updatedGoal: CareerGoal;
            if (currentGoalForm.id) {
                updatedGoal = await apiUpdateCareerGoal(currentGoalForm as CareerGoal);
            } else {
                updatedGoal = await apiAddCareerGoal(currentGoalForm as Omit<CareerGoal, 'id' | 'createdAt' | 'lastUpdated' | 'progressNotes' | 'actionItems' | 'signature' | 'nonce'>);
            }
            setCareerGoals(prev => {
                const existingIndex = prev.findIndex(goal => goal.id === updatedGoal.id);
                if (existingIndex > -1) {
                    const newGoals = [...prev];
                    newGoals[existingIndex] = updatedGoal;
                    return newGoals;
                }
                return [...prev, updatedGoal];
            });
            setShowAddGoalModal(false);
            setCurrentGoalForm({});
            notificationService.addNotification({ type: 'success', message: `Goal ${updatedGoal.id ? 'updated' : 'added'}!` });
        } catch (err) {
            console.error("Failed to save goal:", err);
            setError(`Failed to save goal: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Goal save failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingGoal(false);
            setAuditLogs(await apiGetAllAuditLogs());
            setCareerCoinBalance(await apiGetTokenBalance(TokenType.CareerCoin, USER_ID)); // Refresh token balance
            setTokenTransactions(await apiGetAllTokenTransactions());
        }
    }, [currentGoalForm]);

    const handleDeleteGoal = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this goal and all its action items?")) return;
        setError(null);
        try {
            await apiDeleteCareerGoal(id);
            setCareerGoals(prev => prev.filter(goal => goal.id !== id));
            notificationService.addNotification({ type: 'info', message: 'Goal deleted.' });
        } catch (err) {
            console.error("Failed to delete goal:", err);
            setError(`Failed to delete goal: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Goal deletion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, []);

    const handleAddOrUpdateActionItem = useCallback(async () => {
        if (!currentActionItemForm.description || !currentActionItemForm.dueDate || !currentActionItemForm.goalId) {
            setError("Description, Due Date, and parent Goal are required for an action item.");
            return;
        }

        setIsSavingGoal(true);
        setError(null);
        try {
            let updatedItem: ActionItem;
            if (currentActionItemForm.id) {
                updatedItem = await apiUpdateActionItem(currentActionItemForm as ActionItem);
            } else {
                updatedItem = await apiAddActionItem(currentActionItemForm as Omit<ActionItem, 'id' | 'signature' | 'nonce'>);
            }
            const updatedGoal = careerGoals.find(g => g.id === updatedItem.goalId);
            if (updatedGoal) {
                const updatedActionItems = updatedGoal.actionItems.find(ai => ai.id === updatedItem.id)
                    ? updatedGoal.actionItems.map(ai => ai.id === updatedItem.id ? updatedItem : ai)
                    : [...updatedGoal.actionItems, updatedItem];
                setCareerGoals(prev => prev.map(g => g.id === updatedGoal.id ? { ...updatedGoal, actionItems: updatedActionItems } : g));
                setSelectedGoal(prev => prev && prev.id === updatedGoal.id ? { ...updatedGoal, actionItems: updatedActionItems } : prev);
            }
            setShowAddActionItemModal(false);
            setCurrentActionItemForm({});
            notificationService.addNotification({ type: 'success', message: `Action item ${updatedItem.id ? 'updated' : 'added'}!` });
        } catch (err) {
            console.error("Failed to save action item:", err);
            setError(`Failed to save action item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Action item save failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingGoal(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [currentActionItemForm, careerGoals]);

    const handleDeleteActionItem = useCallback(async (id: string, goalId: string) => {
        if (!window.confirm("Are you sure you want to delete this action item?")) return;
        setError(null);
        try {
            await apiDeleteActionItem(id, goalId);
            setCareerGoals(prev => prev.map(g => g.id === goalId ? { ...g, actionItems: g.actionItems.filter(ai => ai.id !== id) } : g));
            setSelectedGoal(prev => prev && prev.id === goalId ? { ...prev, actionItems: prev.actionItems.filter(ai => ai.id !== id) } : prev);
            notificationService.addNotification({ type: 'info', message: 'Action item deleted.' });
        } catch (err) {
            console.error("Failed to delete action item:", err);
            setError(`Failed to delete action item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Action item deletion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [careerGoals]);

    const handleAnalyzeSkills = useCallback(async () => {
        if (!userProfile) {
            setError("User profile is required for skill gap analysis.");
            return;
        }
        if (!ValidationUtils.isNotNullOrEmpty(skillGapTarget)) {
            setError("Please provide target roles or a job description for skill analysis.");
            return;
        }
        setIsAnalyzingSkills(true);
        setSkillGaps([]);
        setError(null);
        try {
            const results = await apiGetSkillGapAnalysis(userProfile, skillGapTarget);
            setSkillGaps(results);
            notificationService.addNotification({ type: 'success', message: 'Skill gap analysis completed!' });
            setLearningResources(await apiGetAllLearningResources());
        } catch (err) {
            console.error("Skill analysis failed:", err);
            setError(`Skill analysis failed: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Skill analysis failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsAnalyzingSkills(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, skillGapTarget]);

    const handleGenerateCareerPaths = useCallback(async () => {
        if (!userProfile) {
            setError("User profile is required for career path recommendations.");
            return;
        }
        setIsGeneratingCareerPaths(true);
        setCareerPaths([]);
        setError(null);
        try {
            const paths = await apiGetCareerPathRecommendations(userProfile, careerGoals);
            setCareerPaths(paths);
            notificationService.addNotification({ type: 'success', message: 'Career path recommendations generated!' });
            setLearningResources(await apiGetAllLearningResources());
        } catch (err) {
            console.error("Career path generation failed:", err);
            setError(`Career path generation failed: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Career path generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingCareerPaths(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, careerGoals]);

    const handleStartInterview = useCallback(async (app: JobApplication, stage: InterviewStageType = InterviewStageType.Behavioral) => {
        if (!userProfile) {
            setError("User profile is required to start an interview session.");
            return;
        }
        setIsStartingInterview(true);
        setSelectedInterviewSession(null);
        setError(null);
        try {
            const session = await apiStartInterviewSession(app.id, app.jobTitle, app.company, app.jobDescription, userProfile, stage);
            setInterviewSessions(prev => [...prev, session]);
            setSelectedInterviewSession(session);
            setCurrentInterviewQuestions(session.questionsAsked.map(q => ({ question: q.question, userAnswer: '' })));
            setActiveTab('interview');
            notificationService.addNotification({ type: 'info', message: `Interview session for ${app.jobTitle} started.` });
        } catch (err) {
            console.error("Failed to start interview session:", err);
            setError(`Failed to start interview session: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Interview session start failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsStartingInterview(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile]);

    const handleSubmitInterviewAnswers = useCallback(async () => {
        if (!selectedInterviewSession || !userProfile) {
            setError("No active interview session or user profile found.");
            return;
        }
        if (currentInterviewQuestions.some(q => !ValidationUtils.isNotNullOrEmpty(q.userAnswer))) {
            setError("Please answer all questions before submitting.");
            return;
        }

        setIsSubmittingAnswers(true);
        setError(null);
        try {
            const updatedSession = await apiSubmitInterviewAnswersAndGetFeedback(
                selectedInterviewSession.id,
                currentInterviewQuestions,
                jobApplications.find(app => app.id === selectedInterviewSession.jobApplicationId)?.jobDescription || '',
                userProfile
            );
            setInterviewSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
            setSelectedInterviewSession(updatedSession);
            notificationService.addNotification({ type: 'success', message: 'Interview answers submitted and feedback generated!' });
        } catch (err) {
            console.error("Failed to submit interview answers:", err);
            setError(`Failed to submit interview answers: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Interview answer submission failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSubmittingAnswers(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [selectedInterviewSession, userProfile, currentInterviewQuestions, jobApplications]);

    const handleFetchMarketTrends = useCallback(async () => {
        if (!userProfile) {
            setError("User profile is required for market trend analysis.");
            return;
        }
        if (!ValidationUtils.isNotNullOrEmpty(debouncedMarketTrendIndustry)) {
            setError("Please specify an industry for market trends.");
            return;
        }
        setIsFetchingMarketTrends(true);
        setMarketTrends([]);
        setError(null);
        try {
            const keywordsArray = debouncedMarketTrendKeywords.split(',').map(k => k.trim()).filter(Boolean);
            const trends = await apiGetMarketTrends(debouncedMarketTrendIndustry, keywordsArray);
            setMarketTrends(trends);
            notificationService.addNotification({ type: 'success', message: 'Market trends fetched successfully!' });
        } catch (err) {
            console.error("Failed to fetch market trends:", err);
            setError(`Failed to fetch market trends: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Market trend fetch failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsFetchingMarketTrends(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, debouncedMarketTrendIndustry, debouncedMarketTrendKeywords]);

    const handleGenerateNegotiationScript = useCallback(async () => {
        if (!userProfile || !negotiationJobTitle || !negotiationCompany || !negotiationInitialOffer || !negotiationDesiredSalary) {
            setError("Please fill all negotiation details.");
            return;
        }
        if (negotiationDesiredSalary <= negotiationInitialOffer) {
            setError("Desired salary must be higher than the initial offer.");
            return;
        }

        setIsGeneratingNegotiationScript(true);
        setNegotiationScript('');
        setError(null);
        try {
            const script = await apiGetSalaryNegotiationScript(
                negotiationJobTitle,
                negotiationCompany,
                negotiationInitialOffer,
                negotiationDesiredSalary,
                userProfile
            );
            setNegotiationScript(script);
            notificationService.addNotification({ type: 'success', message: 'Salary negotiation script generated.' });
        } catch (err) {
            console.error("Failed to generate negotiation script:", err);
            setError(`Failed to generate negotiation script: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Negotiation script generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingNegotiationScript(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, negotiationJobTitle, negotiationCompany, negotiationInitialOffer, negotiationDesiredSalary]);

    const handleOptimizeLinkedIn = useCallback(async () => {
        if (!userProfile || userProfile.desiredRoles.length === 0) {
            setError("User profile and desired roles are required for LinkedIn optimization.");
            return;
        }

        setIsOptimizingLinkedIn(true);
        setLinkedInSummary('');
        setError(null);
        try {
            const summary = await apiOptimizeLinkedInProfile(userProfile, userProfile.desiredRoles);
            setLinkedInSummary(summary);
            notificationService.addNotification({ type: 'success', message: 'LinkedIn summary optimized!' });
        } catch (err) {
            console.error("Failed to optimize LinkedIn profile:", err);
            setError(`Failed to optimize LinkedIn profile: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `LinkedIn optimization failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsOptimizingLinkedIn(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile]);

    const handleGenerateBrandStatement = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isNotNullOrEmpty(brandStatementDesiredImpact)) {
            setError("User profile and desired impact are required to generate a personal brand statement.");
            return;
        }
        setIsGeneratingBrandStatement(true);
        setPersonalBrandStatement(null);
        setError(null);
        try {
            const statement = await apiGeneratePersonalBrandStatement(userProfile, brandStatementDesiredImpact);
            setPersonalBrandStatement(statement);
            notificationService.addNotification({ type: 'success', message: 'Personal brand statement generated and saved!' });
        } catch (err) {
            console.error("Failed to generate brand statement:", err);
            setError(`Failed to generate brand statement: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Brand statement generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingBrandStatement(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, brandStatementDesiredImpact]);

    const handlePreparePerformanceReview = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isNotNullOrEmpty(performanceAchievements)) {
            setError("User profile and achievements are required for performance review preparation.");
            return;
        }
        const achievementsArray = performanceAchievements.split('\n').map(a => a.trim()).filter(Boolean);
        if (achievementsArray.length === 0) {
            setError("Please enter at least one achievement.");
            return;
        }

        setIsPreparingReview(true);
        setPerformanceReviewPoints([]);
        setError(null);
        try {
            const reviewPoints = await apiPreparePerformanceReview(userProfile, achievementsArray);
            setPerformanceReviewPoints(reviewPoints);
            notificationService.addNotification({ type: 'success', message: 'Performance review points generated!' });
        } catch (err) {
            console.error("Failed to prepare performance review:", err);
            setError(`Failed to prepare performance review: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Performance review prep failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsPreparingReview(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, performanceAchievements]);

    const handleAddOrUpdateContact = useCallback(async () => {
        if (!currentContactForm.name || !currentContactForm.company || !currentContactForm.role) {
            setError("Name, Company, and Role are required for a network contact.");
            return;
        }
        if (currentContactForm.linkedInUrl && !ValidationUtils.isValidUrl(currentContactForm.linkedInUrl)) {
            setError("Invalid LinkedIn URL.");
            return;
        }
        if (currentContactForm.email && !ValidationUtils.isValidEmail(currentContactForm.email)) {
            setError("Invalid email format.");
            return;
        }

        setIsSavingContact(true);
        setError(null);
        try {
            let updatedContact: NetworkContact;
            if (currentContactForm.id) {
                updatedContact = await apiUpdateNetworkContact(currentContactForm as NetworkContact);
            } else {
                updatedContact = await apiAddNetworkContact(currentContactForm as Omit<NetworkContact, 'id' | 'connectionDate' | 'lastContactDate' | 'signature' | 'nonce'>);
            }
            setNetworkContacts(prev => {
                const existingIndex = prev.findIndex(c => c.id === updatedContact.id);
                if (existingIndex > -1) {
                    const newContacts = [...prev];
                    newContacts[existingIndex] = updatedContact;
                    return newContacts;
                }
                return [...prev, updatedContact];
            });
            setShowAddContactModal(false);
            setCurrentContactForm({});
            notificationService.addNotification({ type: 'success', message: `Contact ${updatedContact.id ? 'updated' : 'added'}!` });
        } catch (err) {
            console.error("Failed to save contact:", err);
            setError(`Failed to save contact: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Contact save failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingContact(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [currentContactForm]);

    const handleDeleteContact = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this contact?")) return;
        setError(null);
        try {
            await apiDeleteNetworkContact(id);
            setNetworkContacts(prev => prev.filter(c => c.id !== id));
            notificationService.addNotification({ type: 'info', message: 'Contact deleted.' });
        } catch (err) {
            console.error("Failed to delete contact:", err);
            setError(`Failed to delete contact: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Contact deletion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, []);

    const handleGenerateNetworkingMessage = useCallback(async () => {
        if (!userProfile || !selectedContactForMessage || !ValidationUtils.isNotNullOrEmpty(networkingMessagePurpose)) {
            setError("User profile, a selected contact, and a message purpose are required.");
            return;
        }
        setIsGeneratingNetworkingMessage(true);
        setGeneratedNetworkingMessage('');
        setError(null);
        try {
            const message = await apiGenerateNetworkingMessage(userProfile, selectedContactForMessage, networkingMessagePurpose);
            setGeneratedNetworkingMessage(message);
            notificationService.addNotification({ type: 'success', message: 'Networking message drafted!' });
        } catch (err) {
            console.error("Failed to generate networking message:", err);
            setError(`Failed to generate networking message: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Networking message generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingNetworkingMessage(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, selectedContactForMessage, networkingMessagePurpose]);

    const handleAddOrUpdateProject = useCallback(async () => {
        if (!currentProjectForm.title || !currentProjectForm.description) {
            setError("Project Title and Description are required.");
            return;
        }

        setIsSavingProject(true);
        setError(null);
        try {
            let updatedProject: PersonalProject;
            const projectToSave = {
                ...currentProjectForm,
                startDate: currentProjectForm.startDate || DateUtils.getNowISO().substring(0, 10),
                status: currentProjectForm.status || 'Idea',
                skillsDeveloped: currentProjectForm.skillsDeveloped || [],
                technologiesUsed: currentProjectForm.technologiesUsed || [],
                goalIds: currentProjectForm.goalIds || [],
            };

            if (projectToSave.id) {
                updatedProject = await apiUpdatePersonalProject(projectToSave as PersonalProject);
            } else {
                updatedProject = await apiAddPersonalProject(projectToSave as Omit<PersonalProject, 'id' | 'createdAt' | 'lastUpdated' | 'signature' | 'nonce'>);
            }
            setPersonalProjects(prev => {
                const existingIndex = prev.findIndex(p => p.id === updatedProject.id);
                if (existingIndex > -1) {
                    const newProjects = [...prev];
                    newProjects[existingIndex] = updatedProject;
                    return newProjects;
                }
                return [...prev, updatedProject];
            });
            setShowAddProjectModal(false);
            setCurrentProjectForm({});
            notificationService.addNotification({ type: 'success', message: `Project ${updatedProject.id ? 'updated' : 'added'}!` });
        } catch (err) {
            console.error("Failed to save project:", err);
            setError(`Failed to save project: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Project save failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingProject(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [currentProjectForm]);

    const handleDeleteProject = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;
        setError(null);
        try {
            await apiDeletePersonalProject(id);
            setPersonalProjects(prev => prev.filter(p => p.id !== id));
            notificationService.addNotification({ type: 'info', message: 'Project deleted.' });
        } catch (err) {
            console.error("Failed to delete project:", err);
            setError(`Failed to delete project: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Project deletion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, []);

    const handleSuggestProjectIdeas = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isNotNullOrEmpty(projectIdeaSkills)) {
            setError("User profile and target skills are required to suggest project ideas.");
            return;
        }
        setIsSuggestingProjectIdeas(true);
        setSuggestedProjectIdeas([]);
        setError(null);
        try {
            const skillsArray = projectIdeaSkills.split(',').map(s => s.trim()).filter(Boolean);
            const ideas = await apiSuggestPersonalProjectIdeas(userProfile, skillsArray, projectIdeaGoalId);
            setSuggestedProjectIdeas(ideas);
            notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} project ideas!` });
        } catch (err) {
            console.error("Failed to suggest project ideas:", err);
            setError(`Failed to suggest project ideas: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Project idea suggestion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSuggestingProjectIdeas(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, projectIdeaSkills, projectIdeaGoalId]);

    const handleMatchMentors = useCallback(async () => {
        if (!userProfile) {
            setError("User profile is required to match mentors.");
            return;
        }
        setIsMatchingMentors(true);
        setMatchedMentors([]);
        setError(null);
        try {
            const matches = await apiMatchMentors(userProfile);
            setMatchedMentors(matches);
            notificationService.addNotification({ type: 'success', message: `Found ${matches.length} mentor matches!` });
        } catch (err) {
            console.error("Failed to match mentors:", err);
            setError(`Failed to match mentors: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Mentor matching failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsMatchingMentors(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile]);

    const handleScheduleMentorshipSession = useCallback(async () => {
        if (!userProfile || !currentSessionMentorId || !ValidationUtils.isNotNullOrEmpty(currentSessionTopic) || !ValidationUtils.isPositiveNumber(currentSessionDuration)) {
            setError("Please fill all session details.");
            return;
        }
        setIsSchedulingSession(true);
        setError(null);
        try {
            const newSession = await apiScheduleMentorshipSession(currentSessionMentorId, currentSessionTopic, currentSessionDuration);
            setMentorshipSessions(prev => [...prev, newSession]);
            setShowScheduleSessionModal(false);
            setCurrentSessionMentorId('');
            setCurrentSessionTopic('');
            setCurrentSessionDuration(30);
            notificationService.addNotification({ type: 'success', message: 'Mentorship session scheduled!' });
        } catch (err) {
            console.error("Failed to schedule session:", err);
            setError(`Failed to schedule session: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Session scheduling failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSchedulingSession(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, currentSessionMentorId, currentSessionTopic, currentSessionDuration]);

    const handleAddOrUpdatePortfolioItem = useCallback(async () => {
        if (!currentPortfolioItemForm.title || !currentPortfolioItemForm.type || !currentPortfolioItemForm.link) {
            setError("Title, Type, and Link are required for a portfolio item.");
            return;
        }
        if (!ValidationUtils.isValidUrl(currentPortfolioItemForm.link)) {
            setError("Invalid URL for portfolio item link.");
            return;
        }

        setIsSavingPortfolioItem(true);
        setError(null);
        try {
            let updatedItem: PortfolioItem;
            const itemToSave = {
                ...currentPortfolioItemForm,
                description: currentPortfolioItemForm.description || '',
                date: currentPortfolioItemForm.date || DateUtils.getNowISO().substring(0, 10),
                technologies: currentPortfolioItemForm.technologies || [],
                skillsDemonstrated: currentPortfolioItemForm.skillsDemonstrated || []
            };

            if (itemToSave.id) {
                updatedItem = await apiUpdatePortfolioItem(itemToSave as PortfolioItem);
            } else {
                updatedItem = await apiAddPortfolioItem(itemToSave as Omit<PortfolioItem, 'id' | 'signature' | 'nonce'>);
            }
            setPortfolioItems(prev => {
                const existingIndex = prev.findIndex(item => item.id === updatedItem.id);
                if (existingIndex > -1) {
                    const newItems = [...prev];
                    newItems[existingIndex] = updatedItem;
                    return newItems;
                }
                return [...prev, updatedItem];
            });
            setShowAddPortfolioModal(false);
            setCurrentPortfolioItemForm({});
            notificationService.addNotification({ type: 'success', message: `Portfolio item ${updatedItem.id ? 'updated' : 'added'}!` });
        } catch (err) {
            console.error("Failed to save portfolio item:", err);
            setError(`Failed to save portfolio item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Portfolio item save failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSavingPortfolioItem(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [currentPortfolioItemForm]);

    const handleDeletePortfolioItem = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this portfolio item?")) return;
        setError(null);
        try {
            await apiDeletePortfolioItem(id);
            setPortfolioItems(prev => prev.filter(item => item.id !== id));
            notificationService.addNotification({ type: 'info', message: 'Portfolio item removed.' });
        } catch (err) {
            console.error("Failed to delete portfolio item:", err);
            setError(`Failed to delete portfolio item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Portfolio item deletion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, []);

    const handleReviewPortfolioItem = useCallback(async () => {
        if (!userProfile || !selectedPortfolioItem) {
            setError("User profile and a selected portfolio item are required for review.");
            return;
        }
        setIsReviewingPortfolioItem(true);
        setPortfolioReviewSuggestions([]);
        setError(null);
        try {
            const suggestions = await apiReviewPortfolioItem(selectedPortfolioItem, userProfile, portfolioReviewJobDesc || undefined);
            setPortfolioReviewSuggestions(suggestions);
            notificationService.addNotification({ type: 'success', message: `Review suggestions for "${selectedPortfolioItem.title}" generated!` });
        } catch (err) {
            console.error("Failed to review portfolio item:", err);
            setError(`Failed to review portfolio item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Portfolio item review failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsReviewingPortfolioItem(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, selectedPortfolioItem, portfolioReviewJobDesc]);

    const handleGenerateContentIdeas = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isNotNullOrEmpty(contentType) || !ValidationUtils.isNotNullOrEmpty(contentFocusArea)) {
            setError("User profile, content type, and focus area are required.");
            return;
        }
        setIsGeneratingContentIdeas(true);
        setGeneratedContentIdeas([]);
        setError(null);
        try {
            const ideas = await apiGenerateContentIdeas(userProfile, contentType, contentFocusArea);
            setGeneratedContentIdeas(ideas);
            notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} content ideas for ${contentFocusArea}.`, actionLink: `/content` });
        } catch (err) {
            console.error("Failed to generate content ideas:", err);
            setError(`Failed to generate content ideas: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Content idea generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingContentIdeas(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, contentType, contentFocusArea]);

    const handleGenerateDailyPlan = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isNotNullOrEmpty(dailyPlanSkillsToFocus)) {
            setError("User profile and skills to focus on are required for daily plan generation.");
            return;
        }
        const skillsArray = dailyPlanSkillsToFocus.split(',').map(s```typescript
=> s.trim()).filter(Boolean);
        if (skillsArray.length === 0) {
            setError("Please enter at least one skill to focus on.");
            return;
        }

        setIsGeneratingDailyPlan(true);
        setDailyPlanItems([]);
        setError(null);
        try {
            const plan = await apiGenerateDailyPlan(userProfile, careerGoals.filter(g => g.status === GoalStatus.InProgress || g.status === GoalStatus.Pending), skillsArray, 5); // Request 5 items
            setDailyPlanItems(plan);
            notificationService.addNotification({ type: 'success', message: 'Daily plan generated!' });
        } catch (err) {
            console.error("Failed to generate daily plan:", err);
            setError(`Failed to generate daily plan: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Daily plan generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingDailyPlan(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, dailyPlanSkillsToFocus, careerGoals]);

    const handleUpdateDailyPlanItem = useCallback(async (item: DailyPlanItem) => {
        setError(null);
        try {
            const updatedItem = await apiUpdateDailyPlanItem(item);
            setDailyPlanItems(prev => prev.map(dpi => dpi.id === updatedItem.id ? updatedItem : dpi));
            notificationService.addNotification({ type: 'info', message: 'Daily plan item updated.' });
        } catch (err) {
            console.error("Failed to update daily plan item:", err);
            setError(`Failed to update daily plan item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Daily plan item update failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, []);

    const handleDeleteDailyPlanItem = useCallback(async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this daily plan item?")) return;
        setError(null);
        try {
            await apiDeleteDailyPlanItem(id);
            setDailyPlanItems(prev => prev.filter(item => item.id !== id));
            notificationService.addNotification({ type: 'info', message: 'Daily plan item deleted.' });
        } catch (err) {
            console.error("Failed to delete daily plan item:", err);
            setError(`Failed to delete daily plan item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Daily plan item deletion failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, []);

    const handleSpendTokens = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isPositiveNumber(tokenSpendAmount) || !ValidationUtils.isNotNullOrEmpty(tokenSpendMemo)) {
            setError("Please enter a positive amount and a memo to spend tokens.");
            return;
        }
        setIsSpendingTokens(true);
        setError(null);
        try {
            const newBalance = await apiSpendTokens(tokenSpendAmount, TokenType.CareerCoin, tokenSpendMemo, userProfile.id);
            setCareerCoinBalance(newBalance);
            setTokenTransactions(await apiGetAllTokenTransactions());
            setTokenSpendAmount(0);
            setTokenSpendMemo('');
            notificationService.addNotification({ type: 'success', message: 'Tokens spent successfully!' });
        } catch (err) {
            console.error("Failed to spend tokens:", err);
            setError(`Failed to spend tokens: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Token spend failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsSpendingTokens(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, tokenSpendAmount, tokenSpendMemo]);

    const handleMakePayment = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isPositiveNumber(paymentAmount) || !ValidationUtils.isNotNullOrEmpty(paymentCurrency) || !ValidationUtils.isNotNullOrEmpty(paymentMemo)) {
            setError("Please enter a positive amount, currency, and a memo for the payment.");
            return;
        }
        setIsMakingPayment(true);
        setError(null);
        try {
            const record = await apiMakePayment(paymentAmount, paymentCurrency, paymentMemo, userProfile.id);
            setPaymentRecords(prev => [...prev, record]);
            setPaymentAmount(0);
            setPaymentCurrency('USD');
            setPaymentMemo('');
            notificationService.addNotification({ type: 'success', message: 'Payment processed successfully!' });
        } catch (err) {
            console.error("Failed to make payment:", err);
            setError(`Failed to make payment: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Payment failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsMakingPayment(false);
            setAuditLogs(await apiGetAllAuditLogs());
        }
    }, [userProfile, paymentAmount, paymentCurrency, paymentMemo]);

    // -----------------------------------------------------------------------------------------------------------------
    //  4.4: Memoized Data & Computed Values
    // -----------------------------------------------------------------------------------------------------------------
    const sortedNotifications = useMemo(() => {
        return [...notifications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notifications]);

    const unreadNotificationCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const getRecommendationTypeColor = (type: RecommendationType) => {
        switch (type) {
            case RecommendationType.Course: return 'bg-blue-100 text-blue-800';
            case RecommendationType.Certification: return 'bg-purple-100 text-purple-800';
            case RecommendationType.Book: return 'bg-green-100 text-green-800';
            case RecommendationType.NetworkingEvent: return 'bg-yellow-100 text-yellow-800';
            case RecommendationType.Project: return 'bg-indigo-100 text-indigo-800';
            case RecommendationType.Mentor: return 'bg-pink-100 text-pink-800';
            case RecommendationType.Article: return 'bg-teal-100 text-teal-800';
            case RecommendationType.Podcast: return 'bg-cyan-100 text-cyan-800';
            case RecommendationType.Workshop: return 'bg-orange-100 text-orange-800';
            case RecommendationType.Conference: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getGoalStatusColor = (status: GoalStatus) => {
        switch (status) {
            case GoalStatus.Pending: return 'text-yellow-600 bg-yellow-50';
            case GoalStatus.InProgress: return 'text-blue-600 bg-blue-50';
            case GoalStatus.Completed: return 'text-green-600 bg-green-50';
            case GoalStatus.Deferred: return 'text-gray-600 bg-gray-50';
            case GoalStatus.Cancelled: return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getJobApplicationStatusColor = (status: JobApplicationStatus) => {
        switch (status) {
            case JobApplicationStatus.Applied: return 'text-blue-600 bg-blue-50';
            case JobApplicationStatus.Interviewing: return 'text-purple-600 bg-purple-50';
            case JobApplicationStatus.OfferReceived: return 'text-green-600 bg-green-50';
            case JobApplicationStatus.Rejected: return 'text-red-600 bg-red-50';
            case JobApplicationStatus.Withdrawn: return 'text-gray-600 bg-gray-50';
            case JobApplicationStatus.Accepted: return 'text-indigo-600 bg-indigo-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getSeverityColor = (severity: 'Minor' | 'Moderate' | 'Major') => {
        switch (severity) {
            case 'Minor': return 'bg-yellow-100 text-yellow-800';
            case 'Moderate': return 'bg-orange-100 text-orange-800';
            case 'Major': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    //  4.5: Helper Render Functions (for modals, lists, etc.)
    // -----------------------------------------------------------------------------------------------------------------

    const renderUserProfileForm = (profile: UserProfile, isEditing: boolean, onFieldChange: (field: keyof UserProfile, value: any) => void) => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => onFieldChange('name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => onFieldChange('email', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Current Role</label>
                <input
                    type="text"
                    value={profile.currentRole}
                    onChange={(e) => onFieldChange('currentRole', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <input
                    type="text"
                    value={profile.industry}
                    onChange={(e) => onFieldChange('industry', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Years Experience</label>
                <input
                    type="number"
                    value={profile.yearsExperience}
                    onChange={(e) => onFieldChange('yearsExperience', parseInt(e.target.value, 10))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Career Stage</label>
                <select
                    value={profile.careerStage}
                    onChange={(e) => onFieldChange('careerStage', e.target.value as CareerStage)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    disabled={!isEditing}
                >
                    {Object.values(CareerStage).map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                <input
                    type="text"
                    value={profile.skills.join(', ')}
                    onChange={(e) => onFieldChange('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Education (semicolon-separated)</label>
                <input
                    type="text"
                    value={profile.education.join('; ')}
                    onChange={(e) => onFieldChange('education', e.target.value.split(';').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Certifications (comma-separated)</label>
                <input
                    type="text"
                    value={profile.certifications.join(', ')}
                    onChange={(e) => onFieldChange('certifications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Desired Roles (comma-separated)</label>
                <input
                    type="text"
                    value={profile.desiredRoles.join(', ')}
                    onChange={(e) => onFieldChange('desiredRoles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Desired Industry</label>
                <input
                    type="text"
                    value={profile.desiredIndustry}
                    onChange={(e) => onFieldChange('desiredIndustry', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Salary Expectation Min</label>
                <input
                    type="number"
                    value={profile.salaryExpectationMin}
                    onChange={(e) => onFieldChange('salaryExpectationMin', parseInt(e.target.value, 10))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Salary Expectation Max</label>
                <input
                    type="number"
                    value={profile.salaryExpectationMax}
                    onChange={(e) => onFieldChange('salaryExpectationMax', parseInt(e.target.value, 10))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
                <input
                    type="text"
                    value={profile.linkedInProfileUrl || ''}
                    onChange={(e) => onFieldChange('linkedInProfileUrl', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Personal Website URL</label>
                <input
                    type="text"
                    value={profile.personalWebsiteUrl || ''}
                    onChange={(e) => onFieldChange('personalWebsiteUrl', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Achievements (one per line)</label>
                <textarea
                    value={profile.achievements.join('\n')}
                    onChange={(e) => onFieldChange('achievements', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                    readOnly={!isEditing}
                ></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Career Vision</label>
                <textarea
                    value={profile.careerVision}
                    onChange={(e) => onFieldChange('careerVision', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                    readOnly={!isEditing}
                ></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Learning Styles (comma-separated)</label>
                <input
                    type="text"
                    value={profile.preferredLearningStyles.join(', ')}
                    onChange={(e) => onFieldChange('preferredLearningStyles', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    readOnly={!isEditing}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">AI Model Preference</label>
                <select
                    value={profile.aiModelPreference || 'balanced'}
                    onChange={(e) => onFieldChange('aiModelPreference', e.target.value as keyof typeof AI_MODELS)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    disabled={!isEditing}
                >
                    {Object.keys(AI_MODELS).map(modelKey => (
                        <option key={modelKey} value={modelKey}>{modelKey} ({AI_MODELS[modelKey as keyof typeof AI_MODELS]})</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderApplicationModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">{currentApplicationForm.id ? 'Edit Job Application' : 'Add New Job Application'}</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <input
                            type="text"
                            value={currentApplicationForm.jobTitle || ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, jobTitle: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <input
                            type="text"
                            value={currentApplicationForm.company || ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, company: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Application Date</label>
                        <input
                            type="date"
                            value={currentApplicationForm.applicationDate ? currentApplicationForm.applicationDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, applicationDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={currentApplicationForm.status || JobApplicationStatus.Applied}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, status: e.target.value as JobApplicationStatus })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {Object.values(JobApplicationStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link to Job Posting</label>
                        <input
                            type="url"
                            value={currentApplicationForm.link || ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, link: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Job Description</label>
                        <textarea
                            value={currentApplicationForm.jobDescription || ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, jobDescription: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Resume Used (snapshot)</label>
                        <textarea
                            value={currentApplicationForm.resumeUsed || ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, resumeUsed: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            value={currentApplicationForm.notes || ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, notes: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                        <input
                            type="date"
                            value={currentApplicationForm.followUpDate ? currentApplicationForm.followUpDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentApplicationForm({ ...currentApplicationForm, followUpDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowAddApplicationModal(false); setCurrentApplicationForm({}); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSavingApplication}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdateApplication}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSavingApplication}
                    >
                        {isSavingApplication ? 'Saving...' : (currentApplicationForm.id ? 'Update Application' : 'Add Application')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderGoalModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">{currentGoalForm.id ? 'Edit Career Goal' : 'Add New Career Goal'}</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={currentGoalForm.title || ''}
                            onChange={(e) => setCurrentGoalForm({ ...currentGoalForm, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={currentGoalForm.description || ''}
                            onChange={(e) => setCurrentGoalForm({ ...currentGoalForm, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Target Date</label>
                        <input
                            type="date"
                            value={currentGoalForm.targetDate ? currentGoalForm.targetDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentGoalForm({ ...currentGoalForm, targetDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={currentGoalForm.status || GoalStatus.Pending}
                            onChange={(e) => setCurrentGoalForm({ ...currentGoalForm, status: e.target.value as GoalStatus })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {Object.values(GoalStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                            value={currentGoalForm.priority || PriorityLevel.Medium}
                            onChange={(e) => setCurrentGoalForm({ ...currentGoalForm, priority: e.target.value as PriorityLevel })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {Object.values(PriorityLevel).map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Related Skills (comma-separated)</label>
                        <input
                            type="text"
                            value={currentGoalForm.relatedSkills?.join(', ') || ''}
                            onChange={(e) => setCurrentGoalForm({ ...currentGoalForm, relatedSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowAddGoalModal(false); setCurrentGoalForm({}); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSavingGoal}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdateGoal}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSavingGoal}
                    >
                        {isSavingGoal ? 'Saving...' : (currentGoalForm.id ? 'Update Goal' : 'Add Goal')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderActionItemModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">{currentActionItemForm.id ? 'Edit Action Item' : 'Add New Action Item'}</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={currentActionItemForm.description || ''}
                            onChange={(e) => setCurrentActionItemForm({ ...currentActionItemForm, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                            type="date"
                            value={currentActionItemForm.dueDate ? currentActionItemForm.dueDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentActionItemForm({ ...currentActionItemForm, dueDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Completed</label>
                        <input
                            type="checkbox"
                            checked={currentActionItemForm.isCompleted || false}
                            onChange={(e) => setCurrentActionItemForm({ ...currentActionItemForm, isCompleted: e.target.checked, completedDate: e.target.checked ? DateUtils.getNowISO().substring(0, 10) : undefined })}
                            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            value={currentActionItemForm.notes || ''}
                            onChange={(e) => setCurrentActionItemForm({ ...currentActionItemForm, notes: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Related Resource IDs (comma-separated)</label>
                        <input
                            type="text"
                            value={currentActionItemForm.relatedResourceIds?.join(', ') || ''}
                            onChange={(e) => setCurrentActionItemForm({ ...currentActionItemForm, relatedResourceIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowAddActionItemModal(false); setCurrentActionItemForm({}); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSavingGoal}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdateActionItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSavingGoal}
                    >
                        {isSavingGoal ? 'Saving...' : (currentActionItemForm.id ? 'Update Item' : 'Add Item')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContactModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">{currentContactForm.id ? 'Edit Network Contact' : 'Add New Network Contact'}</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={currentContactForm.name || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, name: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company</label>
                        <input
                            type="text"
                            value={currentContactForm.company || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, company: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <input
                            type="text"
                            value={currentContactForm.role || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, role: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Relationship Strength</label>
                        <select
                            value={currentContactForm.relationshipStrength || 'Acquaintance'}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, relationshipStrength: e.target.value as 'Acquaintance' | 'Professional Connection' | 'Strong Ally' | 'Mentor' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Acquaintance">Acquaintance</option>
                            <option value="Professional Connection">Professional Connection</option>
                            <option value="Strong Ally">Strong Ally</option>
                            <option value="Mentor">Mentor</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                        <input
                            type="text"
                            value={currentContactForm.tags?.join(', ') || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                        <input
                            type="url"
                            value={currentContactForm.linkedInUrl || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, linkedInUrl: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            value={currentContactForm.email || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, email: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                            type="tel"
                            value={currentContactForm.phone || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, phone: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            value={currentContactForm.notes || ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, notes: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                        <input
                            type="date"
                            value={currentContactForm.followUpDate ? currentContactForm.followUpDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentContactForm({ ...currentContactForm, followUpDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowAddContactModal(false); setCurrentContactForm({}); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSavingContact}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdateContact}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSavingContact}
                    >
                        {isSavingContact ? 'Saving...' : (currentContactForm.id ? 'Update Contact' : 'Add Contact')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProjectModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">{currentProjectForm.id ? 'Edit Personal Project' : 'Add New Personal Project'}</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={currentProjectForm.title || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={currentProjectForm.description || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            value={currentProjectForm.status || 'Idea'}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, status: e.target.value as 'Idea' | 'Planning' | 'InProgress' | 'Completed' | 'Archived' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Idea">Idea</option>
                            <option value="Planning">Planning</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            value={currentProjectForm.startDate ? currentProjectForm.startDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, startDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            value={currentProjectForm.endDate ? currentProjectForm.endDate.substring(0, 10) : ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, endDate: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills Developed (comma-separated)</label>
                        <input
                            type="text"
                            value={currentProjectForm.skillsDeveloped?.join(', ') || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, skillsDeveloped: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Technologies Used (comma-separated)</label>
                        <input
                            type="text"
                            value={currentProjectForm.technologiesUsed?.join(', ') || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, technologiesUsed: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Repository Link</label>
                        <input
                            type="url"
                            value={currentProjectForm.repositoryLink || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, repositoryLink: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Demo Link</label>
                        <input
                            type="url"
                            value={currentProjectForm.demoLink || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, demoLink: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Related Goal IDs (comma-separated)</label>
                        <input
                            type="text"
                            value={currentProjectForm.goalIds?.join(', ') || ''}
                            onChange={(e) => setCurrentProjectForm({ ...currentProjectForm, goalIds: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowAddProjectModal(false); setCurrentProjectForm({}); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSavingProject}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdateProject}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSavingProject}
                    >
                        {isSavingProject ? 'Saving...' : (currentProjectForm.id ? 'Update Project' : 'Add Project')}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderScheduleSessionModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">Schedule Mentorship Session</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mentor</label>
                        <select
                            value={currentSessionMentorId}
                            onChange={(e) => setCurrentSessionMentorId(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">Select a Mentor</option>
                            {mentorProfiles.map(mentor => (
                                <option key={mentor.id} value={mentor.id}>{mentor.name} ({mentor.currentRole})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topic</label>
                        <input
                            type="text"
                            value={currentSessionTopic}
                            onChange={(e) => setCurrentSessionTopic(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <input
                            type="number"
                            value={currentSessionDuration}
                            onChange={(e) => setCurrentSessionDuration(parseInt(e.target.value, 10))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            min="15"
                            step="15"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowScheduleSessionModal(false); setCurrentSessionMentorId(''); setCurrentSessionTopic(''); setCurrentSessionDuration(30); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSchedulingSession}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleScheduleMentorshipSession}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSchedulingSession}
                    >
                        {isSchedulingSession ? 'Scheduling...' : 'Schedule Session'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPortfolioItemModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                <h3 className="text-xl font-bold mb-4">{currentPortfolioItemForm.id ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}</h3>
                {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={currentPortfolioItemForm.title || ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            value={currentPortfolioItemForm.type || 'Project'}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, type: e.target.value as 'Project' | 'Publication' | 'Presentation' | 'Website' | 'Other' })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="Project">Project</option>
                            <option value="Publication">Publication</option>
                            <option value="Presentation">Presentation</option>
                            <option value="Website">Website</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={currentPortfolioItemForm.description || ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link</label>
                        <input
                            type="url"
                            value={currentPortfolioItemForm.link || ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, link: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
                        <input
                            type="text"
                            value={currentPortfolioItemForm.technologies?.join(', ') || ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills Demonstrated (comma-separated)</label>
                        <input
                            type="text"
                            value={currentPortfolioItemForm.skillsDemonstrated?.join(', ') || ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, skillsDemonstrated: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date (YYYY-MM-DD)</label>
                        <input
                            type="date"
                            value={currentPortfolioItemForm.date ? currentPortfolioItemForm.date.substring(0, 10) : ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, date: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                        <input
                            type="url"
                            value={currentPortfolioItemForm.thumbnailUrl || ''}
                            onChange={(e) => setCurrentPortfolioItemForm({ ...currentPortfolioItemForm, thumbnailUrl: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end mt-6 space-x-2">
                    <button
                        onClick={() => { setShowAddPortfolioModal(false); setCurrentPortfolioItemForm({}); setError(null); }}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        disabled={isSavingPortfolioItem}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdatePortfolioItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={isSavingPortfolioItem}
                    >
                        {isSavingPortfolioItem ? 'Saving...' : (currentPortfolioItemForm.id ? 'Update Item' : 'Add Item')}
                    </button>
                </div>
            </div>
        </div>
    );


    // -----------------------------------------------------------------------------------------------------------------
    //  4.6: Main Component Render
    // -----------------------------------------------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{APP_NAME}</h1>
            <p className="text-lg text-gray-600 mb-8">{APP_VERSION} - Your AI-Powered Career Co-pilot</p>

            {/* Global Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2 w-full max-w-sm">
                {sortedNotifications.map((note) => (
                    <div
                        key={note.id}
                        className={`p-4 rounded-lg shadow-md flex items-center justify-between ${
                            note.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
                            note.type === 'info' ? 'bg-blue-100 border-blue-400 text-blue-700' :
                            note.type === 'warning' ? 'bg-yellow-100 border-yellow-400 text-yellow-700' :
                            'bg-red-100 border-red-400 text-red-700'
                        }`}
                        role="alert"
                    >
                        <div>
                            <p className="font-semibold">{TextUtils.capitalizeFirstLetter(note.type)}!</p>
                            <p className="text-sm">{note.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{DateUtils.timeSince(note.timestamp)}</p>
                            {note.actionLink && (
                                <a href={note.actionLink} className="text-sm text-blue-600 hover:underline mt-1 block">View details</a>
                            )}
                        </div>
                        <button
                            onClick={() => notificationService.markAsRead(note.id)}
                            className="ml-4 text-sm font-medium p-1 rounded-full hover:bg-opacity-75 focus:outline-none focus:ring-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                ))}
                {unreadNotificationCount > 0 && (
                    <button
                        onClick={() => notifications.filter(n => !n.read).forEach(n => notificationService.markAsRead(n.id))}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Mark All as Read ({unreadNotificationCount})
                    </button>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full max-w-4xl mb-6" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg onClick={() => setError(null)} className="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 2.65a1.2 1.2 0 1 1-1.697-1.697l2.758-2.758-2.758-2.759a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-2.651a1.2 1.2 0 1 1 1.697 1.697l-2.758 2.758 2.758 2.759a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </span>
                </div>
            )}

            <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg p-8">
                {/* Tabs for different sections */}
                <div className="flex flex-wrap border-b border-gray-200 mb-6">
                    {['resume', 'profile', 'goals', 'applications', 'interview', 'skills', 'market', 'branding', 'review', 'network', 'projects', 'mentorship', 'portfolio', 'content', 'daily-plan', 'identity', 'tokens', 'audit-log', 'payments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'} focus:outline-none`}
                        >
                            {TextUtils.toSentenceCase(tab)}
                        </button>
                    ))}
                </div>

                {/* Content for each tab */}
                {isLoading && (
                    <div className="text-center text-blue-600 font-semibold text-lg py-10">
                        Loading data... Please wait.
                    </div>
                )}

                {userProfile && !isLoading && (
                    <div>
                        {activeTab === 'profile' && (
                            <Card title="User Profile" className="p-6">
                                {renderUserProfileForm(userProfile, isProfileEditing, (field, value) => setUserProfile(prev => prev ? { ...prev, [field]: value } : null))}
                                <div className="mt-6 flex justify-end space-x-2">
                                    {!isProfileEditing ? (
                                        <button onClick={() => setIsProfileEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => { setIsProfileEditing(false); loadAllData(); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                                Cancel
                                            </button>
                                            <button onClick={handleProfileUpdate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                                                Save Changes
                                            </button>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'identity' && (
                            <Card title="Digital Identity & Verification" className="p-6">
                                <div className="space-y-4">
                                    <p className="text-gray-700"><strong>Public Key:</strong> <span className="font-mono bg-gray-100 p-1 rounded text-sm">{userProfile.publicKey}</span></p>
                                    <p className="text-gray-700"><strong>Wallet Address:</strong> <span className="font-mono bg-gray-100 p-1 rounded text-sm">{userProfile.walletAddress}</span></p>
                                    <p className="text-gray-700">
                                        <strong>Verification Level:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            currentIdentityVerificationLevel === IdentityVerificationLevel.None ? 'bg-red-100 text-red-800' :
                                            currentIdentityVerificationLevel === IdentityVerificationLevel.Basic ? 'bg-yellow-100 text-yellow-800' :
                                            currentIdentityVerificationLevel === IdentityVerificationLevel.Verified ? 'bg-green-100 text-green-800' :
                                            'bg-indigo-100 text-indigo-800'
                                        }`}>{currentIdentityVerificationLevel}</span>
                                    </p>
                                </div>
                                <h4 className="text-lg font-semibold mt-6 mb-3">Request Verification Level Upgrade</h4>
                                <div className="flex space-x-3">
                                    {Object.values(IdentityVerificationLevel).filter(level => level !== currentIdentityVerificationLevel && level !== IdentityVerificationLevel.Enterprise).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => handleRequestIdentityVerification(level)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                            disabled={currentIdentityVerificationLevel >= level}
                                        >
                                            Request {level}
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'resume' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card title="Your Resume" className="p-6">
                                    <textarea
                                        ref={resumeRef}
                                        value={resume}
                                        onChange={(e) => setResume(e.target.value)}
                                        placeholder="Paste your resume here..."
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-96 focus:ring-blue-500 focus:border-blue-500"
                                        maxLength={MAX_RESUME_LENGTH}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">Max {MAX_RESUME_LENGTH} characters. Current: {resume.length}</p>
                                </Card>
                                <Card title="Target Job Description" className="p-6">
                                    <textarea
                                        ref={jobDescRef}
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm h-96 focus:ring-blue-500 focus:border-blue-500"
                                        maxLength={MAX_JOB_DESC_LENGTH}
                                    />
                                    <p className="text-sm text-gray-500 mt-2">Max {MAX_JOB_DESC_LENGTH} characters. Current: {jobDesc.length}</p>
                                </Card>

                                <div className="md:col-span-2 text-center mt-6">
                                    <button
                                        onClick={handleAnalyze}
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                        disabled={isLoading || resume.length === 0 || jobDesc.length === 0}
                                    >
                                        {isLoading ? 'Analyzing...' : 'Analyze Resume & Get Suggestions'}
                                    </button>
                                </div>

                                {suggestions.length > 0 && (
                                    <Card title="AI-Powered Resume Suggestions" className="md:col-span-2 mt-6 p-6">
                                        <div className="space-y-6">
                                            {suggestions.map((s) => (
                                                <div key={s.id} className="border-b pb-4 last:border-b-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-lg font-semibold text-gray-800">Suggestion for: <span className="text-blue-600">"{TextUtils.truncate(s.originalText, 50)}"</span></h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(s.severity)}`}>
                                                            {s.severity}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 mb-2">
                                                        <strong>Improved Text:</strong> <span className="italic">{s.improvedText}</span>
                                                    </p>
                                                    <p className="text-gray-600 text-sm">
                                                        <strong>Rationale:</strong> {s.rationale}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <Card title="Job Applications" className="p-6">
                                <button
                                    onClick={() => { setShowAddApplicationModal(true); setCurrentApplicationForm({ status: JobApplicationStatus.Applied, applicationDate: DateUtils.getNowISO().substring(0, 10), resumeUsed: userProfile.resumeText || '' }); }}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add New Application
                                </button>

                                {jobApplications.length === 0 ? (
                                    <p className="text-gray-600">No job applications added yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {jobApplications.map(app => (
                                            <div key={app.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">{app.jobTitle} at {app.company}</h3>
                                                        <p className="text-sm text-gray-500">Applied on: {DateUtils.formatDate(app.applicationDate)}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getJobApplicationStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">{TextUtils.truncate(app.notes, 150)}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {app.link && (
                                                        <a href={app.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Job</a>
                                                    )}
                                                    <button
                                                        onClick={() => { setSelectedApplication(app); setShowAddApplicationModal(true); setCurrentApplicationForm(app); }}
                                                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => apiDeleteJobApplication(app.id).then(() => setJobApplications(prev => prev.filter(a => a.id !== app.id)))}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => handleGenerateCoverLetter(app)}
                                                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                                        disabled={isGeneratingCoverLetter}
                                                    >
                                                        {isGeneratingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
                                                    </button>
                                                    {app.coverLetterUsed && (
                                                        <button
                                                            onClick={() => {setSelectedApplication(app); setCoverLetterContent(app.coverLetterUsed || '');}}
                                                            className="px-3 py-1 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                                        >
                                                            View Cover Letter
                                                        </button>
                                                    )}
                                                    {app.status !== JobApplicationStatus.Rejected && app.status !== JobApplicationStatus.Accepted && app.status !== JobApplicationStatus.Withdrawn && (
                                                        <button
                                                            onClick={() => handleStartInterview(app)}
                                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                                            disabled={isStartingInterview}
                                                        >
                                                            {isStartingInterview ? 'Starting...' : 'Start Mock Interview'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showAddApplicationModal && renderApplicationModal()}
                                {coverLetterContent && (
                                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                                            <h3 className="text-xl font-bold mb-4">Cover Letter for {selectedApplication?.jobTitle} at {selectedApplication?.company}</h3>
                                            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-gray-800 border border-gray-200 h-96 overflow-y-auto">
                                                {coverLetterContent}
                                            </div>
                                            <div className="flex justify-end mt-4">
                                                <button
                                                    onClick={() => setCoverLetterContent('')}
                                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'goals' && (
                            <Card title="Career Goals & Action Items" className="p-6">
                                <button
                                    onClick={() => { setShowAddGoalModal(true); setCurrentGoalForm({ status: GoalStatus.Pending, priority: PriorityLevel.Medium, targetDate: DateUtils.addDays(DateUtils.getNowISO().substring(0, 10), 30) }); }}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add New Goal
                                </button>

                                {careerGoals.length === 0 ? (
                                    <p className="text-gray-600">No career goals added yet.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {careerGoals.sort((a,b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()).map(goal => (
                                            <div key={goal.id} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{goal.title}</h3>
                                                        <p className="text-sm text-gray-500">Target: {DateUtils.formatDate(goal.targetDate)} ({DateUtils.isFutureDate(goal.targetDate) ? 'Upcoming' : 'Past Due'})</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGoalStatusColor(goal.status)}`}>
                                                        {goal.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-3">{TextUtils.truncate(goal.description, 200)}</p>
                                                {goal.relatedSkills.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {goal.relatedSkills.map(skill => (
                                                            <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">{skill}</span>
                                                        ))}
                                                    </div>
                                                )}

                                                <h4 className="font-semibold text-gray-800 mb-2">Action Items ({goal.actionItems.filter(ai => !ai.isCompleted).length} pending)</h4>
                                                {goal.actionItems.length === 0 ? (
                                                    <p className="text-gray-600 text-sm mb-3">No action items for this goal.</p>
                                                ) : (
                                                    <ul className="list-disc list-inside space-y-2 mb-3">
                                                        {goal.actionItems.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(item => (
                                                            <li key={item.id} className={`text-sm ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.isCompleted}
                                                                    onChange={(e) => handleDeleteActionItem(item.id, goal.id).then(() => handleAddOrUpdateActionItem())} // Placeholder: Mark complete. Need to wrap logic.
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // Prevent opening goal detail
                                                                        const updatedItem = { ...item, isCompleted: e.currentTarget.checked, completedDate: e.currentTarget.checked ? DateUtils.getNowISO() : undefined };
                                                                        apiUpdateActionItem(updatedItem).then(res => {
                                                                            setCareerGoals(prev => prev.map(g => g.id === goal.id ? { ...g, actionItems: g.actionItems.map(ai => ai.id === res.id ? res : ai) } : g));
                                                                        }).catch(err => console.error("Failed to update action item completion:", err));
                                                                    }}
                                                                    className="mr-2"
                                                                />
                                                                {item.description} (Due: {DateUtils.formatDate(item.dueDate)})
                                                                <div className="flex gap-2 ml-4 mt-1 text-xs">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowAddActionItemModal(true);
                                                                            setCurrentActionItemForm({ ...item, goalId: goal.id });
                                                                        }}
                                                                        className="text-blue-500 hover:underline"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteActionItem(item.id, goal.id);
                                                                        }}
                                                                        className="text-red-500 hover:underline"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    <button
                                                        onClick={() => {
                                                            setCurrentActionItemForm({ goalId: goal.id, dueDate: DateUtils.addDays(DateUtils.getNowISO().substring(0, 10), 7), isCompleted: false });
                                                            setShowAddActionItemModal(true);
                                                        }}
                                                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                                    >
                                                        Add Action Item
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowAddGoalModal(true); setCurrentGoalForm(goal); }}
                                                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                    >
                                                        Edit Goal
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGoal(goal.id)}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    >
                                                        Delete Goal
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showAddGoalModal && renderGoalModal()}
                                {showAddActionItemModal && renderActionItemModal()}
                            </Card>
                        )}

                        {activeTab === 'skills' && (
                            <div className="space-y-6">
                                <Card title="Skill Gap Analysis" className="p-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Target Roles or Job Description</label>
                                        <textarea
                                            value={skillGapTarget}
                                            onChange={(e) => setSkillGapTarget(e.target.value)}
                                            placeholder="e.g., 'Senior Software Engineer, specializing in AI' or 'Full stack developer for fintech applications'"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                                        ></textarea>
                                    </div>
                                    <button
                                        onClick={handleAnalyzeSkills}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isAnalyzingSkills || !skillGapTarget}
                                    >
                                        {isAnalyzingSkills ? 'Analyzing Skills...' : 'Analyze Skill Gaps'}
                                    </button>

                                    {skillGaps.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-xl font-semibold mb-4">Your Skill Gaps</h3>
                                            <div className="space-y-4">
                                                {skillGaps.map(gap => (
                                                    <div key={gap.skill} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                                        <h4 className="text-lg font-semibold text-gray-900">{gap.skill} <span className="text-gray-500 text-sm">({gap.category})</span></h4>
                                                        <p className="text-sm text-gray-700">Current Level: {gap.currentLevel}/5 | Target Level: {gap.targetLevel}/5 | Gap: {gap.gap}</p>
                                                        {gap.recommendations.length > 0 && (
                                                            <div className="mt-3">
                                                                <p className="font-medium text-gray-800">Recommendations:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">
                                                                    {gap.recommendations.map(rec => (
                                                                        <li key={rec.id}>
                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationTypeColor(rec.type)} mr-2`}>
                                                                                {rec.type}
                                                                            </span>
                                                                            <a href={rec.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                                                {rec.title}
                                                                            </a> ({rec.provider}, {rec.estimatedTime}, {rec.cost})
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>

                                <Card title="Career Path Recommendations" className="p-6">
                                    <button
                                        onClick={handleGenerateCareerPaths}
                                        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isGeneratingCareerPaths}
                                    >
                                        {isGeneratingCareerPaths ? 'Generating Paths...' : 'Generate Career Paths'}
                                    </button>

                                    {careerPaths.length === 0 ? (
                                        <p className="text-gray-600">No career path recommendations generated yet.</p>
                                    ) : (
                                        <div className="space-y-6">
                                            {careerPaths.map(path => (
                                                <div key={path.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.role} ({path.industry})</h3>
                                                    <p className="text-gray-700 text-sm mb-3">{path.description}</p>
                                                    <p className="text-gray-600 text-sm mb-1"><strong>Salary:</strong> {path.averageSalaryRange}</p>
                                                    <p className="text-gray-600 text-sm mb-3"><strong>Growth Outlook:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${path.growthOutlook === 'High' || path.growthOutlook === 'Very High' ? 'bg-green-100 text-green-800' : path.growthOutlook === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{path.growthOutlook}</span></p>

                                                    <div className="mb-3">
                                                        <h4 className="font-medium text-gray-800">Required Skills:</h4>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {path.requiredSkills.map(skill => (
                                                                <span key={skill.skill} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                                                                    {skill.skill} (Level {skill.level})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <h4 className="font-medium text-gray-800">Pathways:</h4>
                                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">
                                                            {path.pathways.map((p, idx) => (
                                                                <li key={idx}>
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationTypeColor(p.type)} mr-2`}>
                                                                        {p.type}
                                                                    </span>
                                                                    {p.resource.startsWith('http') ? (
                                                                        <a href={p.resource} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{p.title}</a>
                                                                    ) : (
                                                                        <span>{p.title} ({p.resource})</span>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {path.potentialMentors && path.potentialMentors.length > 0 && (
                                                        <div className="mb-3">
                                                            <h4 className="font-medium text-gray-800">Potential Mentors:</h4>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {path.potentialMentors.map((mentor, idx) => (
                                                                    <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-medium rounded-full">{mentor}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {path.typicalCompanies && path.typicalCompanies.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-800">Typical Companies:</h4>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {path.typicalCompanies.map((company, idx) => (
                                                                    <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">{company}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {activeTab === 'interview' && (
                            <Card title="Interview Preparation" className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Your Interview Sessions</h3>
                                {interviewSessions.length === 0 ? (
                                    <p className="text-gray-600 mb-6">No interview sessions conducted yet. Start one from an application!</p>
                                ) : (
                                    <div className="space-y-4 mb-6">
                                        {interviewSessions.sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()).map(session => (
                                            <div key={session.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white cursor-pointer hover:bg-gray-50"
                                                onClick={() => setSelectedInterviewSession(session)}>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-lg font-semibold text-gray-900">{session.role} at {session.company}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${session.score > 70 ? 'bg-green-100 text-green-800' : session.score > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                        Score: {session.score}%
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">Date: {DateUtils.formatDate(session.sessionDate)} | Stage: {session.stageType}</p>
                                                <p className="text-sm text-gray-700 mt-2">{TextUtils.truncate(session.overallFeedback, 100)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedInterviewSession && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-xl font-semibold mb-4">Session Details: {selectedInterviewSession.role} at {selectedInterviewSession.company}</h3>
                                        <p className="text-sm text-gray-600 mb-4">Session Date: {DateUtils.formatDateTime(selectedInterviewSession.sessionDate)}</p>

                                        <div className="space-y-4">
                                            {selectedInterviewSession.questionsAsked.map((qa, index) => (
                                                <div key={index} className="border border-gray-100 rounded-md p-3 bg-gray-50">
                                                    <p className="font-semibold text-gray-800">Q{index + 1}: {qa.question}</p>
                                                    <textarea
                                                        value={currentInterviewQuestions[index]?.userAnswer || qa.userAnswer || ''}
                                                        onChange={(e) => {
                                                            const newQuestions = [...currentInterviewQuestions];
                                                            newQuestions[index] = { ...newQuestions[index], userAnswer: e.target.value };
                                                            setCurrentInterviewQuestions(newQuestions);
                                                        }}
                                                        placeholder="Your answer here..."
                                                        rows={4}
                                                        className="mt-2 w-full p-2 border border-gray-300 rounded-md text-sm"
                                                    ></textarea>
                                                    {qa.aiFeedback && (
                                                        <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm text-blue-800">
                                                            <strong>AI Feedback (Score: {qa.score}/10):</strong> {qa.aiFeedback}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleSubmitInterviewAnswers}
                                            className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                            disabled={isSubmittingAnswers || !userProfile || !jobApplications.find(app => app.id === selectedInterviewSession.jobApplicationId)?.jobDescription}
                                        >
                                            {isSubmittingAnswers ? 'Submitting...' : 'Submit Answers & Get Feedback'}
                                        </button>

                                        {selectedInterviewSession.overallFeedback !== 'No feedback yet.' && (
                                            <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                                                <h4 className="text-lg font-semibold text-gray-900">Overall Feedback (Score: {selectedInterviewSession.score}%)</h4>
                                                <p className="text-gray-700 mt-2">{selectedInterviewSession.overallFeedback}</p>
                                                {selectedInterviewSession.strengths.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="font-medium text-green-800">Strengths:</p>
                                                        <ul className="list-disc list-inside text-sm text-green-700">
                                                            {selectedInterviewSession.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                {selectedInterviewSession.areasForImprovement.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="font-medium text-red-800">Areas for Improvement:</p>
                                                        <ul className="list-disc list-inside text-sm text-red-700">
                                                            {selectedInterviewSession.areasForImprovement.map((a, idx) => <li key={idx}>{a}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'market' && (
                            <Card title="Market Trend Analysis" className="p-6">
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Industry to Analyze</label>
                                        <input
                                            type="text"
                                            value={marketTrendIndustry}
                                            onChange={(e) => setMarketTrendIndustry(e.target.value)}
                                            placeholder="e.g., Technology, Healthcare, Finance"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Keywords (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={marketTrendKeywords}
                                            onChange={(e) => setMarketTrendKeywords(e.target.value)}
                                            placeholder="e.g., AI, Remote Work, ESG, Blockchain"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <button
                                        onClick={handleFetchMarketTrends}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isFetchingMarketTrends || !debouncedMarketTrendIndustry}
                                    >
                                        {isFetchingMarketTrends ? 'Fetching Trends...' : 'Fetch Market Trends'}
                                    </button>
                                </div>

                                {marketTrends.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Latest Market Trends for {marketTrendIndustry}</h3>
                                        <div className="space-y-6">
                                            {marketTrends.map(trend => (
                                                <div key={trend.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{trend.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">Source: {trend.source} | Date: {DateUtils.formatDate(trend.date)}</p>
                                                    <p className="text-gray-700 text-sm mb-3">{trend.description}</p>
                                                    <p className="text-gray-700 text-sm mb-3"><strong>Impact on Career:</strong> {trend.impactOnCareer}</p>
                                                    <div className="mb-3">
                                                        <h5 className="font-medium text-gray-800">Relevant Skills:</h5>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {trend.relevantSkills.map((skill, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">{skill}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-gray-800">Suggested Actions:</h5>
                                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 mt-1">
                                                            {trend.suggestedActions.map((action, idx) => <li key={idx}>{action}</li>)}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'branding' && (
                            <div className="space-y-6">
                                <Card title="LinkedIn Profile Optimization" className="p-6">
                                    <p className="text-gray-700 mb-4">Generate an optimized LinkedIn profile summary based on your current profile and desired roles.</p>
                                    <button
                                        onClick={handleOptimizeLinkedIn}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isOptimizingLinkedIn || !userProfile?.desiredRoles.length}
                                    >
                                        {isOptimizingLinkedIn ? 'Optimizing...' : 'Optimize LinkedIn Summary'}
                                    </button>
                                    {linkedInSummary && (
                                        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                                            <h4 className="font-semibold text-blue-800 mb-2">Generated LinkedIn Summary:</h4>
                                            <p className="whitespace-pre-wrap text-blue-900">{linkedInSummary}</p>
                                        </div>
                                    )}
                                </Card>

                                <Card title="Personal Brand Statement" className="p-6">
                                    <p className="text-gray-700 mb-4">Craft a concise and powerful personal brand statement.</p>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Desired Impact/Perception</label>
                                        <input
                                            type="text"
                                            value={brandStatementDesiredImpact}
                                            onChange={(e) => setBrandStatementDesiredImpact(e.target.value)}
                                            placeholder="e.g., 'A visionary leader in sustainable tech', 'A meticulous data scientist driving business growth'"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateBrandStatement}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isGeneratingBrandStatement || !brandStatementDesiredImpact}
                                    >
                                        {isGeneratingBrandStatement ? 'Generating...' : 'Generate Brand Statement'}
                                    </button>
                                    {personalBrandStatement && (
                                        <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
                                            <h4 className="font-semibold text-green-800 mb-2">Your Personal Brand Statement:</h4>
                                            <p className="text-green-900 font-medium mb-3">"{personalBrandStatement.statement}"</p>
                                            <p className="text-sm text-green-700"><strong>Rationale:</strong> {personalBrandStatement.rationale}</p>
                                            <p className="text-sm text-green-700"><strong>Keywords:</strong> {personalBrandStatement.keywords.join(', ')}</p>
                                            <p className="text-xs text-gray-500 mt-2">Generated: {DateUtils.formatDateTime(personalBrandStatement.generatedDate)} (v{personalBrandStatement.version})</p>
                                            <p className="text-xs text-gray-500">Signature: {TextUtils.truncate(personalBrandStatement.signature || 'N/A', 30)}</p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {activeTab === 'review' && (
                            <Card title="Performance Review Preparation" className="p-6">
                                <p className="text-gray-700 mb-4">Enter your raw achievements (one per line) and get AI-powered, quantifiable bullet points for your performance review.</p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Your Achievements (one per line)</label>
                                    <textarea
                                        value={performanceAchievements}
                                        onChange={(e) => setPerformanceAchievements(e.target.value)}
                                        placeholder="e.g., Led Q3 project delivery, Exceeded sales target by 15%, Mentored 3 junior developers"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-40"
                                    ></textarea>
                                </div>
                                <button
                                    onClick={handlePreparePerformanceReview}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isPreparingReview || !performanceAchievements}
                                >
                                    {isPreparingReview ? 'Preparing Review...' : 'Prepare Review Points'}
                                </button>
                                {performanceReviewPoints.length > 0 && (
                                    <div className="mt-6 p-4 bg-purple-50 rounded-md border border-purple-200">
                                        <h4 className="font-semibold text-purple-800 mb-2">Generated Performance Review Points:</h4>
                                        <ul className="list-disc list-inside space-y-2 text-purple-900">
                                            {performanceReviewPoints.map((point, idx) => <li key={idx}>{point}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'network' && (
                            <Card title="Network Management & Communication" className="p-6">
                                <button
                                    onClick={() => { setShowAddContactModal(true); setCurrentContactForm({ relationshipStrength: 'Professional Connection', tags: [] }); }}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add New Contact
                                </button>

                                {networkContacts.length === 0 ? (
                                    <p className="text-gray-600">No network contacts added yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {networkContacts.map(contact => (
                                            <div key={contact.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">{contact.name}</h3>
                                                        <p className="text-sm text-gray-500">{contact.role} at {contact.company}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        contact.relationshipStrength === 'Mentor' ? 'bg-indigo-100 text-indigo-800' :
                                                        contact.relationshipStrength === 'Strong Ally' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {contact.relationshipStrength}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">{TextUtils.truncate(contact.notes, 100)}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {contact.linkedInUrl && (
                                                        <a href={contact.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">LinkedIn</a>
                                                    )}
                                                    {contact.email && (
                                                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm">Email</a>
                                                    )}
                                                    {contact.phone && (
                                                        <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline text-sm">Call</a>
                                                    )}
                                                    <button
                                                        onClick={() => { setShowAddContactModal(true); setCurrentContactForm(contact); }}
                                                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteContact(contact.id)}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedContactForMessage(contact)}
                                                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                                    >
                                                        Draft Message
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showAddContactModal && renderContactModal()}

                                {selectedContactForMessage && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-xl font-semibold mb-4">Draft Message for {selectedContactForMessage.name}</h3>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Purpose of Message</label>
                                            <input
                                                type="text"
                                                value={networkingMessagePurpose}
                                                onChange={(e) => setNetworkingMessagePurpose(e.target.value)}
                                                placeholder="e.g., 'Informational Interview', 'Job Referral', 'Catching Up'"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateNetworkingMessage}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            disabled={isGeneratingNetworkingMessage || !networkingMessagePurpose}
                                        >
                                            {isGeneratingNetworkingMessage ? 'Generating...' : 'Generate Message'}
                                        </button>
                                        {generatedNetworkingMessage && (
                                            <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                                                <h4 className="font-semibold text-blue-800 mb-2">Suggested Message:</h4>
                                                <textarea
                                                    value={generatedNetworkingMessage}
                                                    readOnly
                                                    rows={8}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                                                ></textarea>
                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(generatedNetworkingMessage); notificationService.addNotification({ type: 'info', message: 'Message copied to clipboard!' }); }}
                                                        className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
                                                    >
                                                        Copy to Clipboard
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'projects' && (
                            <Card title="Personal Projects" className="p-6">
                                <button
                                    onClick={() => { setShowAddProjectModal(true); setCurrentProjectForm({ status: 'Idea' }); }}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add New Project
                                </button>

                                {personalProjects.length === 0 ? (
                                    <p className="text-gray-600">No personal projects added yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {personalProjects.map(project => (
                                            <div key={project.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                                                        <p className="text-sm text-gray-500">{project.startDate} {project.endDate ? `- ${project.endDate}` : ''}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        project.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">{TextUtils.truncate(project.description, 150)}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {project.repositoryLink && (
                                                        <a href={project.repositoryLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Repo</a>
                                                    )}
                                                    {project.demoLink && (
                                                        <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Demo</a>
                                                    )}
                                                    <button
                                                        onClick={() => { setShowAddProjectModal(true); setCurrentProjectForm(project); }}
                                                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                                {project.skillsDeveloped && project.skillsDeveloped.length > 0 && (
                                                    <div className="mt-3">
                                                        <p className="font-medium text-gray-800 text-sm">Skills Developed:</p>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {project.skillsDeveloped.map((skill, idx) => (
                                                                <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">{skill}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showAddProjectModal && renderProjectModal()}

                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-4">Suggest New Project Ideas (AI)</h3>
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Skills to Develop (comma-separated)</label>
                                            <input
                                                type="text"
                                                value={projectIdeaSkills}
                                                onChange={(e) => setProjectIdeaSkills(e.target.value)}
                                                placeholder="e.g., Python, Machine Learning, Web Development"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Related Career Goal (optional)</label>
                                            <select
                                                value={projectIdeaGoalId}
                                                onChange={(e) => setProjectIdeaGoalId(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            >
                                                <option value="">None</option>
                                                {careerGoals.map(goal => (
                                                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleSuggestProjectIdeas}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            disabled={isSuggestingProjectIdeas || !projectIdeaSkills}
                                        >
                                            {isSuggestingProjectIdeas ? 'Suggesting Ideas...' : 'Suggest Project Ideas'}
                                        </button>
                                    </div>

                                    {suggestedProjectIdeas.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold mb-3">AI-Suggested Project Ideas:</h4>
                                            <div className="space-y-4">
                                                {suggestedProjectIdeas.map((idea, idx) => (
                                                    <div key={idx} className="border border-gray-100 rounded-md p-3 bg-blue-50">
                                                        <h5 className="font-semibold text-blue-800">{idea.title}</h5>
                                                        <p className="text-sm text-blue-700 mt-1">{idea.description}</p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {idea.skillsDeveloped && idea.skillsDeveloped.map((skill, sIdx) => (
                                                                <span key={sIdx} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Skill: {skill}</span>
                                                            ))}
                                                            {idea.technologiesUsed && idea.technologiesUsed.map((tech, tIdx) => (
                                                                <span key={tIdx} className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">Tech: {tech}</span>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setCurrentProjectForm({
                                                                    title: idea.title,
                                                                    description: idea.description,
                                                                    skillsDeveloped: idea.skillsDeveloped,
                                                                    technologiesUsed: idea.technologiesUsed,
                                                                    status: 'Idea',
                                                                    goalIds: projectIdeaGoalId ? [projectIdeaGoalId] : []
                                                                });
                                                                setShowAddProjectModal(true);
                                                                notificationService.addNotification({ type: 'info', message: 'Project idea loaded into form.' });
                                                            }}
                                                            className="mt-3 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                                                        >
                                                            Add to My Projects
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'mentorship' && (
                            <Card title="Mentorship & Coaching" className="p-6">
                                <h3 className="text-xl font-semibold mb-4">Find a Mentor</h3>
                                <button
                                    onClick={handleMatchMentors}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    disabled={isMatchingMentors}
                                >
                                    {isMatchingMentors ? 'Matching Mentors...' : 'Match with Mentors (AI)'}
                                </button>
                                {matchedMentors.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold mb-3">Suggested Mentors:</h4>
                                        <div className="space-y-4">
                                            {matchedMentors.map(mentor => (
                                                <div key={mentor.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                                    <h5 className="text-lg font-semibold text-gray-900">{mentor.name}</h5>
                                                    <p className="text-sm text-gray-700">{mentor.currentRole} in {mentor.industry}</p>
                                                    <p className="text-sm text-gray-600">Specialties: {mentor.specialties.join(', ')}</p>
                                                    <p className="text-sm text-gray-600">Experience: {mentor.yearsExperience} years</p>
                                                    <p className="text-sm text-gray-600">Availability: {mentor.availability}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        {mentor.linkedInUrl && (
                                                            <a href={mentor.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">LinkedIn</a>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setCurrentSessionMentorId(mentor.id);
                                                                setShowScheduleSessionModal(true);
                                                            }}
                                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                                        >
                                                            Schedule Session
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <h3 className="text-xl font-semibold mt-8 mb-4">Your Mentorship Sessions</h3>
                                {mentorshipSessions.length === 0 ? (
                                    <p className="text-gray-600">No mentorship sessions scheduled yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {mentorshipSessions.sort((a,b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()).map(session => {
                                            const mentor = mentorProfiles.find(m => m.id === session.mentorId);
                                            return (
                                                <div key={session.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white cursor-pointer hover:bg-gray-50"
                                                    onClick={() => setSelectedMentorshipSession(session)}>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-lg font-semibold text-gray-900">Session with {mentor?.name || 'Unknown Mentor'}</h4>
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                            session.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                            session.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {session.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">Topic: {session.topic} | Date: {DateUtils.formatDateTime(session.sessionDate)}</p>
                                                    <p className="text-sm text-gray-700 mt-2">{TextUtils.truncate(session.notes, 100)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                {selectedMentorshipSession && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-xl font-semibold mb-4">Session Details: {selectedMentorshipSession.topic}</h3>
                                        <p className="text-sm text-gray-600 mb-2">Mentor: {mentorProfiles.find(m => m.id === selectedMentorshipSession?.mentorId)?.name || 'N/A'}</p>
                                        <p className="text-sm text-gray-600 mb-4">Date: {DateUtils.formatDateTime(selectedMentorshipSession.sessionDate)} | Duration: {selectedMentorshipSession.durationMinutes} mins</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                                <textarea
                                                    value={selectedMentorshipSession.notes}
                                                    onChange={(e) => setSelectedMentorshipSession(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                                    rows={6}
                                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Action Items (one per line)</label>
                                                <textarea
                                                    value={selectedMentorshipSession.actionItems.join('\n')}
                                                    onChange={(e) => setSelectedMentorshipSession(prev => prev ? { ...prev, actionItems: e.target.value.split('\n').filter(Boolean) } : null)}
                                                    rows={4}
                                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                                <select
                                                    value={selectedMentorshipSession.status}
                                                    onChange={(e) => setSelectedMentorshipSession(prev => prev ? { ...prev, status: e.target.value as 'Scheduled' | 'Completed' | 'Cancelled' } : null)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                >
                                                    <option value="Scheduled">Scheduled</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Mentee Rating (1-5)</label>
                                                <input
                                                    type="number"
                                                    min="1" max="5"
                                                    value={selectedMentorshipSession.menteeRating || ''}
                                                    onChange={(e) => setSelectedMentorshipSession(prev => prev ? { ...prev, menteeRating: parseInt(e.target.value, 10) } : null)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end mt-4 space-x-2">
                                            <button
                                                onClick={() => setSelectedMentorshipSession(null)}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedMentorshipSession) {
                                                        apiUpdateMentorshipSession(selectedMentorshipSession)
                                                            .then(updated => {
                                                                setMentorshipSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
                                                                setSelectedMentorshipSession(updated);
                                                                notificationService.addNotification({ type: 'success', message: 'Mentorship session updated!' });
                                                            })
                                                            .catch(err => {
                                                                setError(`Failed to update session: ${(err as CustomError).message || (err as Error).message}`);
                                                                notificationService.addNotification({ type: 'error', message: `Session update failed: ${(err as CustomError).message || (err as Error).message}` });
                                                            });
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Update Session
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {showScheduleSessionModal && renderScheduleSessionModal()}
                            </Card>
                        )}

                        {activeTab === 'portfolio' && (
                            <Card title="Portfolio Management" className="p-6">
                                <button
                                    onClick={() => { setShowAddPortfolioModal(true); setCurrentPortfolioItemForm({ type: 'Project', date: DateUtils.getNowISO().substring(0, 10) }); }}
                                    className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add New Portfolio Item
                                </button>

                                {portfolioItems.length === 0 ? (
                                    <p className="text-gray-600">No portfolio items added yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {portfolioItems.map(item => (
                                            <div key={item.id} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                                                        <p className="text-sm text-gray-500">Type: {item.type} | Date: {DateUtils.formatDate(item.date)}</p>
                                                    </div>
                                                    {item.thumbnailUrl && (
                                                        <img src={item.thumbnailUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                                                    )}
                                                </div>
                                                <p className="text-gray-700 text-sm mb-2">{TextUtils.truncate(item.description, 150)}</p>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View Item</a>
                                                    <button
                                                        onClick={() => { setShowAddPortfolioModal(true); setCurrentPortfolioItemForm(item); }}
                                                        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePortfolioItem(item.id)}
                                                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedPortfolioItem(item); setPortfolioReviewJobDesc(''); setPortfolioReviewSuggestions([]); }}
                                                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                                    >
                                                        Review with AI
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showAddPortfolioModal && renderPortfolioItemModal()}

                                {selectedPortfolioItem && (
                                    <div className="mt-8 border-t pt-6">
                                        <h3 className="text-xl font-semibold mb-4">AI Review for "{selectedPortfolioItem.title}"</h3>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Target Job Description (optional, for contextual review)</label>
                                            <textarea
                                                value={portfolioReviewJobDesc}
                                                onChange={(e) => setPortfolioReviewJobDesc(e.target.value)}
                                                placeholder="Paste a job description to get tailored suggestions."
                                                rows={4}
                                                className="mt-1 w-full p-2 border border-gray-300 rounded-md text-sm"
                                            ></textarea>
                                        </div>
                                        <button
                                            onClick={handleReviewPortfolioItem}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            disabled={isReviewingPortfolioItem || !userProfile}
                                        >
                                            {isReviewingPortfolioItem ? 'Reviewing...' : 'Get AI Review Suggestions'}
                                        </button>
                                        {portfolioReviewSuggestions.length > 0 && (
                                            <div className="mt-6 space-y-4">
                                                <h4 className="font-semibold text-gray-800">AI Suggestions:</h4>
                                                {portfolioReviewSuggestions.map((s) => (
                                                    <div key={s.id} className="border-b pb-4 last:border-b-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="text-md font-semibold text-gray-800">For: <span className="text-blue-600">"{TextUtils.truncate(s.originalText, 50)}"</span></h5>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(s.severity)}`}>
                                                                {s.severity}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 mb-2">
                                                            <strong>Improved:</strong> <span className="italic">{s.improvedText}</span>
                                                        </p>
                                                        <p className="text-gray-600 text-sm">
                                                            <strong>Rationale:</strong> {s.rationale}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => setSelectedPortfolioItem(null)}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                            >
                                                Close Review
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'content' && (
                            <Card title="Content Idea Generation" className="p-6">
                                <p className="text-gray-700 mb-4">Generate ideas for various content types (e.g., blog posts, speaking topics) to boost your personal brand.</p>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Content Type</label>
                                        <input
                                            type="text"
                                            value={contentType}
                                            onChange={(e) => setContentType(e.target.value)}
                                            placeholder="e.g., 'blog post', 'conference talk', 'YouTube series'"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Focus Area</label>
                                        <input
                                            type="text"
                                            value={contentFocusArea}
                                            onChange={(e) => setContentFocusArea(e.target.value)}
                                            placeholder="e.g., 'AI in Product Management', 'Career Transition for Developers'"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateContentIdeas}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isGeneratingContentIdeas || !contentType || !contentFocusArea}
                                    >
                                        {isGeneratingContentIdeas ? 'Generating Ideas...' : 'Generate Content Ideas'}
                                    </button>
                                </div>
                                {generatedContentIdeas.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Generated Content Ideas:</h3>
                                        <div className="space-y-6">
                                            {generatedContentIdeas.map((idea, idx) => (
                                                <div key={idx} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{idea.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">Target Audience: {idea.targetAudience}</p>
                                                    <p className="text-gray-700 text-sm mb-3"><strong>Outline:</strong> {idea.outline}</p>
                                                    <div>
                                                        <h5 className="font-medium text-gray-800">Keywords:</h5>
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {idea.keywords.map((keyword, kIdx) => (
                                                                <span key={kIdx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">{keyword}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'daily-plan' && (
                            <Card title="Daily Career Development Plan" className="p-6">
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <input
                                            type="date"
                                            value={dailyPlanDate}
                                            onChange={async (e) => {
                                                setDailyPlanDate(e.target.value);
                                                setDailyPlanItems(await apiGetDailyPlanForDate(e.target.value));
                                            }}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Skills to Focus On (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={dailyPlanSkillsToFocus}
                                            onChange={(e) => setDailyPlanSkillsToFocus(e.target.value)}
                                            placeholder="e.g., 'Leadership, Python, Public Speaking'"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        />
                                    </div>
                                    <button
                                        onClick={handleGenerateDailyPlan}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isGeneratingDailyPlan || !dailyPlanSkillsToFocus}
                                    >
                                        {isGeneratingDailyPlan ? 'Generating Plan...' : 'Generate Today\'s Plan'}
                                    </button>
                                </div>
                                {dailyPlanItems.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Your Plan for {DateUtils.formatDate(dailyPlanDate)}:</h3>
                                        <div className="space-y-4">
                                            {dailyPlanItems.map(item => (
                                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.isCompleted}
                                                            onChange={(e) => handleUpdateDailyPlanItem({ ...item, isCompleted: e.target.checked })}
                                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                                        />
                                                        <div>
                                                            <p className={`font-medium ${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>{item.time} - {item.activity}</p>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                item.type === 'Learning' ? 'bg-purple-100 text-purple-800' :
                                                                item.type === 'Networking' ? 'bg-teal-100 text-teal-800' :
                                                                item.type === 'Job Search' ? 'bg-orange-100 text-orange-800' :
                                                                item.type === 'Project' ? 'bg-indigo-100 text-indigo-800' :
                                                                item.type === 'Goal' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            } mt-1`}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteDailyPlanItem(item.id)}
                                                        className="p-2 text-red-500 hover:text-red-700 rounded-full"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

                        {activeTab === 'tokens' && (
                            <Card title="Tokenized Rewards" className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold mb-3">Your Balances</h3>
                                    <p className="text-gray-700 text-lg">
                                        <strong>{TokenType.CareerCoin}:</strong> <span className="text-blue-600 font-bold">{careerCoinBalance}</span>
                                    </p>
                                    {/* Add other token types if implemented */}
                                </div>

                                <div className="mb-8 border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-3">Spend Tokens</h3>
                                    <p className="text-gray-700 mb-4">Use your CareerCoins for premium features or exclusive content.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Amount to Spend ({TokenType.CareerCoin})</label>
                                            <input
                                                type="number"
                                                value={tokenSpendAmount}
                                                onChange={(e) => setTokenSpendAmount(parseInt(e.target.value, 10) || 0)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                min="1"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Memo (e.g., "AI Resume Review", "Premium Course Access")</label>
                                            <input
                                                type="text"
                                                value={tokenSpendMemo}
                                                onChange={(e) => setTokenSpendMemo(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSpendTokens}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                            disabled={isSpendingTokens || tokenSpendAmount <= 0 || !tokenSpendMemo || careerCoinBalance < tokenSpendAmount}
                                        >
                                            {isSpendingTokens ? 'Processing...' : 'Spend Tokens'}
                                        </button>
                                        {careerCoinBalance < tokenSpendAmount && (
                                            <p className="text-red-600 text-sm mt-2">Insufficient CareerCoin balance.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-3">Token Transaction History</h3>
                                    {tokenTransactions.length === 0 ? (
                                        <p className="text-gray-600">No token transactions yet.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From/To</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memo</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {tokenTransactions.map((tx) => (
                                                        <tr key={tx.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{DateUtils.formatDateTime(tx.timestamp)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.tokenType}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tx.senderId === userProfile.id ? '-' : '+'}{tx.amount}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {tx.senderId === userProfile.id ? `To: ${tx.receiverId}` : `From: ${tx.senderId}`}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.memo}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    tx.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {tx.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'payments' && (
                            <Card title="Payment Gateway" className="p-6">
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold mb-3">Make a Payment</h3>
                                    <p className="text-gray-700 mb-4">Process payments for premium services, mentorship sessions, or other platform offerings.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                min="0.01"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Currency</label>
                                            <input
                                                type="text"
                                                value={paymentCurrency}
                                                onChange={(e) => setPaymentCurrency(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                placeholder="e.g., USD, EUR"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Memo (Description)</label>
                                            <input
                                                type="text"
                                                value={paymentMemo}
                                                onChange={(e) => setPaymentMemo(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                placeholder="e.g., 'Premium AI Review', 'Mentorship package'"
                                            />
                                        </div>
                                        <button
                                            onClick={handleMakePayment}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                            disabled={isMakingPayment || paymentAmount <= 0 || !paymentCurrency || !paymentMemo}
                                        >
                                            {isMakingPayment ? 'Processing Payment...' : 'Make Payment'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-3">Payment Records</h3>
                                    {paymentRecords.length === 0 ? (
                                        <p className="text-gray-600">No payment records yet.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memo</th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {paymentRecords.map((record) => (
                                                        <tr key={record.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{DateUtils.formatDateTime(record.timestamp)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{record.amount}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.currency}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.memo}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    record.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                    record.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {record.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'audit-log' && (
                            <Card title="Audit Log" className="p-6">
                                <p className="text-gray-700 mb-4">Review all critical system events and user actions for transparency and accountability. Each entry includes a simulated cryptographic signature for integrity verification.</p>
                                {auditLogs.length === 0 ? (
                                    <p className="text-gray-600">No audit log entries yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Type</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integrity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {auditLogs.map((log) => {
                                                    const isIntegrityValid = auditLogService.verifyLogEntryIntegrity(log);
                                                    return (
                                                        <tr key={log.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{DateUtils.formatDateTime(log.timestamp)}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.actorId}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.eventType}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.entityType} ({log.entityId})</td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs overflow-hidden text-ellipsis">{log.message}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {log.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                    isIntegrityValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {isIntegrityValid ? 'VALID' : 'INVALID!'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerTrajectoryView;

```