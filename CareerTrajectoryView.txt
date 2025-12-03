// components/views/blueprints/CareerTrajectoryView.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../Card'; // Keep existing import for Card
import { GoogleGenAI, Type } from "@google/genai"; // Keep existing import for GoogleGenAI

/**
 * =====================================================================================================================
 * =====================================================================================================================
 *  HIGHLY ADVANCED CAREER TRAJECTORY PLATFORM - CORE FILE
 *  This file has been expanded to simulate a comprehensive, self-contained career development application,
 *  incorporating thousands of lines of logic, data management, advanced AI interactions, and UI components.
 *  It aims to provide a "logical conclusion" to a career trajectory tool, designed to be called immediately
 *  upon app installation and provide a vast array of functionality without external backend dependencies.
 *
 *  Disclaimer: In a real-world production environment, this architecture would be distributed across
 *  multiple files, a dedicated backend, and a robust microservices infrastructure. This single-file
 *  implementation is for demonstration purposes as per the directive.
 * =====================================================================================================================
 * =====================================================================================================================
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
    // New fields for extended profile
    resumeText: string; // Stored here for easy access
    linkedInProfileUrl?: string;
    personalWebsiteUrl?: string;
    achievements: string[]; // Raw list of achievements
    careerVision: string; // Long-term vision
    preferredLearningStyles: string[]; // e.g., "Visual", "Auditory", "Kinesthetic"
}

export interface SkillAssessmentResult {
    skill: string;
    category: SkillCategory;
    currentLevel: number; // 1-5 scale
    targetLevel: number; // 1-5 scale
    gap: number; // targetLevel - currentLevel
    recommendations: LearningResource[];
    lastAssessed: string;
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
}

export interface AISuggestion {
    id: string;
    originalText: string;
    improvedText: string;
    rationale: string;
    category: 'Resume' | 'CoverLetter' | 'LinkedIn' | 'General' | 'Interview' | 'PerformanceReview' | 'Networking';
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
    eventType: 'JOB_APPLIED' | 'INTERVIEW_SCHEDULED' | 'GOAL_UPDATED' | 'PROFILE_CHANGED' | 'AI_TASK_COMPLETED' | 'SKILL_IMPROVED' | 'NEW_MENTOR_SUGGESTION';
    payload: any; // Generic payload for the event
    timestamp: string;
    processed: boolean;
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
}

export interface PersonalBrandStatement {
    id: string;
    statement: string;
    version: number;
    generatedDate: string;
    rationale: string;
    keywords: string[];
}

export interface DailyPlanItem {
    id: string;
    date: string; // ISO date string (YYYY-MM-DD)
    time: string; // e.g., "09:00 AM"
    activity: string;
    type: 'Learning' | 'Networking' | 'Job Search' | 'Project' | 'Goal' | 'Other';
    isCompleted: boolean;
    relatedEntityId?: string; // e.g., LearningResource ID, Goal ID
}


/**
 * ---------------------------------------------------------------------------------------------------------------------
 *  1.3: Utility Functions & Classes (Self-Contained)
 * ---------------------------------------------------------------------------------------------------------------------
 */

export const generateId = (): string => `_${Math.random().toString(36).substr(2, 9)}`;

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

export class CustomError extends Error {
    constructor(message: string, public code: string = 'GENERIC_ERROR') {
        super(message);
        this.name = 'CustomError';
    }
}

/**
 * Global Debounce utility for input fields.
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
        } catch (err: any) {
            setError(err);
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
 */
export class NotificationService {
    private notifications: Notification[] = [];
    private listeners: ((notifications: Notification[]) => void)[] = [];

    public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
        const newNotification: Notification = {
            ...notification,
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            read: false,
        };
        this.notifications.unshift(newNotification); // Add to beginning
        this.notifyListeners();
        // Persist notifications (e.g., in localStorage) - simplified for this example
        dataStore.setItem('notification', newNotification);
    }

    public getNotifications(): Notification[] {
        // In a real app, this would fetch from a persistent store,
        // here we just return the in-memory list for simplicity.
        // Also combine with persisted ones on initial load, but for simplicity here we just show what's added runtime.
        return this.notifications;
    }

    public markAsRead(id: string): void {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.notifyListeners();
            // In a real app, would update persistence here as well
            dataStore.setItem('notification', notification);
        }
    }

    public clearNotifications(): void {
        this.notifications = [];
        this.notifyListeners();
        dataStore.clearAll('notification');
    }

    public subscribe(listener: (notifications: Notification[]) => void): () => void {
        this.listeners.push(listener);
        // Immediately notify with current notifications upon subscription
        listener(this.getNotifications());
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach(listener => listener([...this.notifications]));
    }
}
export const notificationService = new NotificationService();


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

    public async receiveEvent(event: Omit<WebhookEvent, 'id' | 'timestamp' | 'processed'>): Promise<void> {
        const newEvent: WebhookEvent = {
            ...event,
            id: generateId(),
            timestamp: DateUtils.getNowISO(),
            processed: false,
        };
        this.eventQueue.push(newEvent);
        await this.processQueue();
    }

    private async processQueue(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            if (!event) continue;

            console.log(`Processing webhook event: ${event.eventType} (ID: ${event.id})`);
            try {
                await this.handleEvent(event);
                event.processed = true;
                console.log(`Webhook event ${event.id} processed successfully.`);
            } catch (error) {
                console.error(`Error processing webhook event ${event.id}:`, error);
                // Optionally re-queue with a delay or move to a dead-letter queue
                notificationService.addNotification({
                    type: 'error',
                    message: `Failed to process webhook event: ${event.eventType}. Error: ${(error as Error).message}`
                });
            }
        }
        this.processing = false;
    }

    private async handleEvent(event: WebhookEvent): Promise<void> {
        switch (event.eventType) {
            case 'JOB_APPLIED':
                // Simulate sending a follow-up reminder
                notificationService.addNotification({
                    type: 'info',
                    message: `Don't forget to follow up on your application for ${event.payload.jobTitle} at ${event.payload.company} in 7 days!`,
                    actionLink: `/applications/${event.payload.id}`
                });
                // Update internal application status or analytics
                // This would involve interacting with the dataStore or other internal APIs
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
                // Trigger AI re-evaluation for recommendations based on new profile
                notificationService.addNotification({
                    type: 'info',
                    message: `Your profile has been updated. Re-evaluating career recommendations...`
                });
                // Call a simulated internal AI API for re-evaluation
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
            default:
                console.warn(`Unknown webhook event type: ${event.eventType}`);
        }
        // In a real system, would save the processed webhook event status
    }
}
export const webhookProcessor = WebhookProcessor.getInstance();


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
 * simulating a more complex internal AI engine.
 */
export class CareerAIClient {
    private ai: GoogleGenAI;
    private currentModel: string;
    private apiKey: string;
    private defaultUserProfile: UserProfile; // To provide context even if real profile isn't loaded

    constructor(apiKey: string, defaultModel: string = AI_MODELS.balanced) {
        if (!apiKey) {
            throw new CustomError("API_KEY is not provided for CareerAIClient.", "API_KEY_MISSING");
        }
        this.apiKey = apiKey;
        this.ai = new GoogleGenAI({ apiKey });
        this.currentModel = defaultModel;
        this.defaultUserProfile = {
            id: 'default', name: 'AI User', email: 'ai@example.com', currentRole: 'Explorer', industry: 'General',
            yearsExperience: 0, careerStage: CareerStage.EntryLevel, skills: [], education: [], certifications: [],
            desiredRoles: [], desiredIndustry: 'Any', salaryExpectationMin: 0, salaryExpectationMax: 0,
            lastUpdated: DateUtils.getNowISO(), resumeText: '', achievements: [], careerVision: '', preferredLearningStyles: []
        };
    }

    public setModel(modelName: string): void {
        if (Object.values(AI_MODELS).includes(modelName)) {
            this.currentModel = modelName;
        } else {
            console.warn(`Invalid AI model specified: ${modelName}. Using default: ${this.currentModel}`);
        }
    }

    private async callGenerativeAI<T>(prompt: string, schema: any, model?: string): Promise<T> {
        const selectedModel = model || this.currentModel;
        try {
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

            // Attempt to parse JSON. Gemini sometimes returns markdown wrapped JSON.
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
     * AI method: Analyze Resume for a specific Job Description
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
     * AI method: Generate a tailored Cover Letter
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
     * AI method: Perform a Skill Gap Analysis
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
        // Assign generated IDs for resources, as AI doesn't always generate complex IDs
        response.skillGaps.forEach(gap => {
            gap.recommendations.forEach(rec => rec.id = rec.id || generateId());
            gap.lastAssessed = DateUtils.getNowISO(); // Ensure current date
        });
        return response.skillGaps;
    }

    /**
     * AI method: Generate Career Path Recommendations
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
     * AI method: Generate Interview Questions
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
     * AI method: Provide feedback on Interview Answers
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
     * AI method: Draft Salary Negotiation Script
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
     * AI method: Optimize LinkedIn Profile Summary
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
     * AI method: Generate Performance Review Preparation bullet points
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
     * AI method: Analyze Market Trends
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
     * AI method: Generate Networking Message/Email
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
     * AI method: Suggest Personal Project Ideas
     * @param userProfile The user's profile.
     * @param targetSkills Skills the user wants to develop.
     * @param careerGoal Focus career goal if any.
     * @returns A list of PersonalProject ideas.
     */
    public async suggestProjectIdeas(userProfile: UserProfile, targetSkills: string[], careerGoal?: string): Promise<Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'technologiesUsed' | 'endDate'>[]> {
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
     * AI method: Match Mentors to User Profile
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
     * AI method: Review Portfolio Item
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
     * AI method: Generate Content Ideas (e.g., blog posts, speaking topics)
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
     * AI method: Generate a Personal Brand Statement
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
        return {
            id: generateId(),
            statement: response.statement,
            version: 1, // Start at version 1
            generatedDate: DateUtils.getNowISO(),
            rationale: response.rationale,
            keywords: response.keywords
        };
    }

    /**
     * AI method: Generate Daily Career Development Plan
     * @param userProfile The user's profile.
     * @param goals A list of user's active goals.
     * @param skillsToDevelop Top 3 skills the user wants to focus on.
     * @param numberOfItems Number of daily activities to suggest.
     * @returns A list of DailyPlanItem suggestions.
     */
    public async generateDailyPlan(userProfile: UserProfile, goals: CareerGoal[], skillsToDevelop: string[], numberOfItems: number = 5): Promise<Omit<DailyPlanItem, 'id' | 'date' | 'isCompleted'>[]> {
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

    // Add more AI methods as needed to reach desired complexity and line count...
}

export let careerAIClient: CareerAIClient | null = null;
try {
    // API_KEY is expected to be present in process.env at build/runtime.
    // In a "self-contained" scenario, one might hardcode it (BAD PRACTICE) or expect it from an env file accessible locally.
    // For this demonstration, we assume process.env.API_KEY is available as per original code.
    // If not found, a dummy client might be created, but features will fail.
    const apiKey = process.env.AI_API_KEY || process.env.GOOGLE_API_KEY || ''; // Use a more specific key name
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
 */

const USER_ID = 'default_user_id'; // Hardcoded for single-user simulation

// 3.1 User Profile Management API
export const apiGetUserProfile = async (userId: string = USER_ID): Promise<UserProfile | null> => {
    return dataStore.getItem<UserProfile>('UserProfile', userId);
};

export const apiUpdateUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
    profile.lastUpdated = DateUtils.getNowISO();
    dataStore.setItem('UserProfile', profile);
    webhookProcessor.receiveEvent({ eventType: 'PROFILE_CHANGED', payload: profile });
    notificationService.addNotification({ type: 'success', message: 'User profile updated successfully!' });
    return profile;
};

export const apiInitializeUserProfile = async (userId: string = USER_ID): Promise<UserProfile> => {
    let profile = await apiGetUserProfile(userId);
    if (!profile) {
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
            preferredLearningStyles: ["Visual", "Kinesthetic"]
        };
        dataStore.setItem('UserProfile', profile);
    }
    return profile;
};

// 3.2 Resume & Cover Letter API
export const apiGenerateResumeSuggestions = async (resume: string, jobDesc: string): Promise<AISuggestion[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(resume) || !ValidationUtils.isNotNullOrEmpty(jobDesc)) {
        throw new CustomError("Resume and Job Description cannot be empty.", "INPUT_VALIDATION_ERROR");
    }
    const suggestions = await careerAIClient.analyzeResumeForJob(resume, jobDesc);
    notificationService.addNotification({ type: 'success', message: `Generated ${suggestions.length} resume suggestions.`, actionLink: `/resume` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Resume Suggestions', actionLink: `/resume` } });
    return suggestions;
};

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
    return coverLetter;
};

// 3.3 Skill & Career Pathing API
export const apiGetSkillGapAnalysis = async (userProfile: UserProfile, targetRoles: string[] | string): Promise<SkillAssessmentResult[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || (Array.isArray(targetRoles) && targetRoles.length === 0) || (!Array.isArray(targetRoles) && !ValidationUtils.isNotNullOrEmpty(targetRoles))) {
        throw new CustomError("Missing user profile or target roles for skill gap analysis.", "INPUT_VALIDATION_ERROR");
    }
    const results = await careerAIClient.getSkillGapAnalysis(userProfile, targetRoles);
    // Optionally persist new learning resources here
    results.forEach(gap => {
        gap.recommendations.forEach(res => {
            if (!dataStore.getItem('LearningResource', res.id)) { // Only add if not already present
                dataStore.setItem('LearningResource', { ...res, dateAdded: DateUtils.getNowISO() });
            }
        });
    });
    notificationService.addNotification({ type: 'success', message: `Skill gap analysis completed. Found ${results.length} skills.`, actionLink: `/skills` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Skill Gap Analysis', actionLink: `/skills` } });
    return results;
};

export const apiGetCareerPathRecommendations = async (userProfile: UserProfile, currentGoals: CareerGoal[]): Promise<CareerPathRecommendation[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile) {
        throw new CustomError("Missing user profile for career path recommendations.", "INPUT_VALIDATION_ERROR");
    }
    const recommendations = await careerAIClient.getCareerPathRecommendations(userProfile, currentGoals);
    // Optionally persist new learning resources from pathways
    recommendations.forEach(path => {
        path.pathways.forEach(p => {
            if (p.type !== RecommendationType.NetworkingEvent && ValidationUtils.isValidUrl(p.resource)) {
                // Simplified creation of learning resource from pathway
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
                    difficulty: "Intermediate", // Default
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
    return recommendations;
};

// 3.4 Job Application Tracking API
export const apiAddJobApplication = async (app: Omit<JobApplication, 'id' | 'createdAt' | 'lastUpdated' | 'contacts' | 'negotiationHistory' | 'feedbackReceived' | 'interviewDates'>): Promise<JobApplication> => {
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
    dataStore.setItem('JobApplication', newApp);
    webhookProcessor.receiveEvent({ eventType: 'JOB_APPLIED', payload: { id: newApp.id, jobTitle: newApp.jobTitle, company: newApp.company } });
    notificationService.addNotification({ type: 'success', message: `Application for ${newApp.jobTitle} at ${newApp.company} added.`, actionLink: `/applications/${newApp.id}` });
    return newApp;
};

export const apiUpdateJobApplication = async (app: JobApplication): Promise<JobApplication> => {
    app.lastUpdated = DateUtils.getNowISO();
    dataStore.setItem('JobApplication', app);
    if (app.status === JobApplicationStatus.Interviewing && app.interviewDates.length > 0) {
        webhookProcessor.receiveEvent({ eventType: 'INTERVIEW_SCHEDULED', payload: { role: app.jobTitle, company: app.company, interviewDate: app.interviewDates[0], applicationId: app.id } });
    }
    notificationService.addNotification({ type: 'success', message: `Application for ${app.jobTitle} updated.`, actionLink: `/applications/${app.id}` });
    return app;
};

export const apiGetAllJobApplications = async (): Promise<JobApplication[]> => {
    return dataStore.getAllItems<JobApplication>('JobApplication');
};

export const apiGetJobApplicationById = async (id: string): Promise<JobApplication | null> => {
    return dataStore.getItem<JobApplication>('JobApplication', id);
};

export const apiDeleteJobApplication = async (id: string): Promise<void> => {
    dataStore.removeItem('JobApplication', id);
    notificationService.addNotification({ type: 'info', message: 'Job application removed.' });
};


// 3.5 Career Goal Management API
export const apiAddCareerGoal = async (goal: Omit<CareerGoal, 'id' | 'createdAt' | 'lastUpdated' | 'progressNotes' | 'actionItems'>): Promise<CareerGoal> => {
    const newGoal: CareerGoal = {
        ...goal,
        id: generateId(),
        progressNotes: [],
        actionItems: [],
        createdAt: DateUtils.getNowISO(),
        lastUpdated: DateUtils.getNowISO(),
    };
    dataStore.setItem('CareerGoal', newGoal);
    notificationService.addNotification({ type: 'success', message: `Career goal "${newGoal.title}" added.`, actionLink: `/goals/${newGoal.id}` });
    return newGoal;
};

export const apiUpdateCareerGoal = async (goal: CareerGoal): Promise<CareerGoal> => {
    goal.lastUpdated = DateUtils.getNowISO();
    dataStore.setItem('CareerGoal', goal);
    webhookProcessor.receiveEvent({ eventType: 'GOAL_UPDATED', payload: { id: goal.id, title: goal.title, status: goal.status } });
    notificationService.addNotification({ type: 'success', message: `Career goal "${goal.title}" updated.`, actionLink: `/goals/${goal.id}` });
    return goal;
};

export const apiGetAllCareerGoals = async (): Promise<CareerGoal[]> => {
    return dataStore.getAllItems<CareerGoal>('CareerGoal');
};

export const apiGetCareerGoalById = async (id: string): Promise<CareerGoal | null> => {
    return dataStore.getItem<CareerGoal>('CareerGoal', id);
};

export const apiDeleteCareerGoal = async (id: string): Promise<void> => {
    dataStore.removeItem('CareerGoal', id);
    // Also remove related action items
    const allActionItems = dataStore.getAllItems<ActionItem>('ActionItem');
    allActionItems.filter(item => item.goalId === id).forEach(item => dataStore.removeItem('ActionItem', item.id));
    notificationService.addNotification({ type: 'info', message: 'Career goal and its action items removed.' });
};

// 3.5.1 Action Item Management API
export const apiAddActionItem = async (item: Omit<ActionItem, 'id'>): Promise<ActionItem> => {
    const newActionItem: ActionItem = {
        ...item,
        id: generateId(),
    };
    dataStore.setItem('ActionItem', newActionItem);
    // Update parent goal to include this action item (simplified, would be more complex in real app)
    const parentGoal = await apiGetCareerGoalById(item.goalId);
    if (parentGoal) {
        parentGoal.actionItems.push(newActionItem);
        await apiUpdateCareerGoal(parentGoal);
    }
    notificationService.addNotification({ type: 'success', message: `Action item "${TextUtils.truncate(item.description, 50)}" added.` });
    return newActionItem;
};

export const apiUpdateActionItem = async (item: ActionItem): Promise<ActionItem> => {
    dataStore.setItem('ActionItem', item);
    // Update parent goal if its action items array needs refresh
    const parentGoal = await apiGetCareerGoalById(item.goalId);
    if (parentGoal) {
        parentGoal.actionItems = parentGoal.actionItems.map(ai => ai.id === item.id ? item : ai);
        await apiUpdateCareerGoal(parentGoal);
    }
    notificationService.addNotification({ type: 'info', message: `Action item "${TextUtils.truncate(item.description, 50)}" updated.` });
    return item;
};

export const apiDeleteActionItem = async (id: string, goalId: string): Promise<void> => {
    dataStore.removeItem('ActionItem', id);
    const parentGoal = await apiGetCareerGoalById(goalId);
    if (parentGoal) {
        parentGoal.actionItems = parentGoal.actionItems.filter(ai => ai.id !== id);
        await apiUpdateCareerGoal(parentGoal);
    }
    notificationService.addNotification({ type: 'info', message: 'Action item removed.' });
};

export const apiGetAllActionItemsForGoal = async (goalId: string): Promise<ActionItem[]> => {
    return dataStore.getAllItems<ActionItem>('ActionItem').filter(item => item.goalId === goalId);
};


// 3.6 Interview Preparation API
export const apiStartInterviewSession = async (jobApplicationId: string, role: string, company: string, jobDescription: string, userProfile: UserProfile, stageType: InterviewStageType = InterviewStageType.Behavioral): Promise<InterviewSession> => {
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
    dataStore.setItem('InterviewSession', session);
    notificationService.addNotification({ type: 'info', message: `Interview session for ${role} started. Good luck!`, actionLink: `/interview/${session.id}` });
    return session;
};

export const apiSubmitInterviewAnswersAndGetFeedback = async (sessionId: string, questionsWithAnswers: { question: string; userAnswer: string; }[], jobDescription: string, userProfile: UserProfile): Promise<InterviewSession> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(sessionId) || questionsWithAnswers.length === 0 || !ValidationUtils.isNotNullOrEmpty(jobDescription) || !userProfile) {
        throw new CustomError("Missing session ID, answers, job description, or profile for feedback.", "INPUT_VALIDATION_ERROR");
    }

    const session = await dataStore.getItem<InterviewSession>('InterviewSession', sessionId);
    if (!session) throw new CustomError("Interview session not found.", "NOT_FOUND");

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

    dataStore.setItem('InterviewSession', session);
    notificationService.addNotification({ type: 'success', message: `Feedback for interview session "${session.role}" received.`, actionLink: `/interview/${session.id}` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Interview Feedback', actionLink: `/interview/${session.id}` } });
    return session;
};

export const apiGetAllInterviewSessions = async (): Promise<InterviewSession[]> => {
    return dataStore.getAllItems<InterviewSession>('InterviewSession');
};

export const apiGetInterviewSessionById = async (id: string): Promise<InterviewSession | null> => {
    return dataStore.getItem<InterviewSession>('InterviewSession', id);
};


// 3.7 Market Insights API
export const apiGetMarketTrends = async (industry: string, keywords: string[]): Promise<MarketTrend[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!ValidationUtils.isNotNullOrEmpty(industry)) {
        throw new CustomError("Industry cannot be empty for market trend analysis.", "INPUT_VALIDATION_ERROR");
    }
    const trends = await careerAIClient.getMarketTrends(industry, keywords);
    notificationService.addNotification({ type: 'info', message: `Fetched ${trends.length} market trends for ${industry}.`, actionLink: `/market` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Market Trend Analysis', actionLink: `/market` } });
    return trends;
};

// 3.8 Salary Negotiation API
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
    return script;
};

// 3.9 Personal Branding API
export const apiOptimizeLinkedInProfile = async (userProfile: UserProfile, desiredRoles: string[]): Promise<string> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || desiredRoles.length === 0) {
        throw new CustomError("Missing user profile or desired roles for LinkedIn optimization.", "INPUT_VALIDATION_ERROR");
    }
    const summary = await careerAIClient.optimizeLinkedInProfile(userProfile, desiredRoles);
    notificationService.addNotification({ type: 'success', message: 'LinkedIn summary optimized.', actionLink: `/branding` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'LinkedIn Profile Optimization', actionLink: `/branding` } });
    return summary;
};

export const apiGeneratePersonalBrandStatement = async (userProfile: UserProfile, desiredImpact: string): Promise<PersonalBrandStatement> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !ValidationUtils.isNotNullOrEmpty(desiredImpact)) {
        throw new CustomError("Missing user profile or desired impact for brand statement generation.", "INPUT_VALIDATION_ERROR");
    }
    const statement = await careerAIClient.generatePersonalBrandStatement(userProfile, desiredImpact);
    dataStore.setItem('PersonalBrandStatement', statement); // Persist the statement
    notificationService.addNotification({ type: 'success', message: 'Personal brand statement generated and saved.', actionLink: `/branding` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Personal Brand Statement', actionLink: `/branding` } });
    return statement;
};

export const apiGetLatestPersonalBrandStatement = async (userId: string = USER_ID): Promise<PersonalBrandStatement | null> => {
    const statements = dataStore.getAllItems<PersonalBrandStatement>('PersonalBrandStatement').filter(pbs => true); // In a multi-user app, filter by userId
    if (statements.length === 0) return null;
    return statements.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime())[0];
};


// 3.10 Performance Review API
export const apiPreparePerformanceReview = async (userProfile: UserProfile, achievements: string[]): Promise<string[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || achievements.length === 0) {
        throw new CustomError("Missing user profile or achievements for performance review preparation.", "INPUT_VALIDATION_ERROR");
    }
    const reviewPoints = await careerAIClient.preparePerformanceReview(userProfile, achievements);
    notificationService.addNotification({ type: 'success', message: 'Performance review points generated.', actionLink: `/review` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Performance Review Prep', actionLink: `/review` } });
    return reviewPoints;
};

// 3.11 Networking API
export const apiAddNetworkContact = async (contact: Omit<NetworkContact, 'id' | 'connectionDate' | 'lastContactDate'>): Promise<NetworkContact> => {
    const newContact: NetworkContact = {
        ...contact,
        id: generateId(),
        connectionDate: DateUtils.getNowISO(),
        lastContactDate: DateUtils.getNowISO(),
    };
    dataStore.setItem('NetworkContact', newContact);
    notificationService.addNotification({ type: 'success', message: `Added new contact: ${newContact.name}.`, actionLink: `/network` });
    return newContact;
};

export const apiUpdateNetworkContact = async (contact: NetworkContact): Promise<NetworkContact> => {
    dataStore.setItem('NetworkContact', contact);
    notificationService.addNotification({ type: 'success', message: `Updated contact: ${contact.name}.`, actionLink: `/network` });
    return contact;
};

export const apiGetAllNetworkContacts = async (): Promise<NetworkContact[]> => {
    return dataStore.getAllItems<NetworkContact>('NetworkContact');
};

export const apiDeleteNetworkContact = async (id: string): Promise<void> => {
    dataStore.removeItem('NetworkContact', id);
    notificationService.addNotification({ type: 'info', message: 'Network contact removed.' });
};

export const apiGenerateNetworkingMessage = async (userProfile: UserProfile, contact: NetworkContact, purpose: string): Promise<string> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !contact || !ValidationUtils.isNotNullOrEmpty(purpose)) {
        throw new CustomError("Missing profile, contact, or purpose for networking message.", "INPUT_VALIDATION_ERROR");
    }
    const message = await careerAIClient.generateNetworkingMessage(userProfile, contact, purpose);
    notificationService.addNotification({ type: 'success', message: 'Networking message generated.', actionLink: `/network` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Networking Message', actionLink: `/network` } });
    return message;
};

// 3.12 Project Management API
export const apiAddPersonalProject = async (project: Omit<PersonalProject, 'id' | 'createdAt' | 'lastUpdated'>): Promise<PersonalProject> => {
    const newProject: PersonalProject = {
        ...project,
        id: generateId(),
        createdAt: DateUtils.getNowISO(),
        lastUpdated: DateUtils.getNowISO(),
    };
    dataStore.setItem('PersonalProject', newProject);
    notificationService.addNotification({ type: 'success', message: `Project "${newProject.title}" added.`, actionLink: `/projects` });
    return newProject;
};

export const apiUpdatePersonalProject = async (project: PersonalProject): Promise<PersonalProject> => {
    project.lastUpdated = DateUtils.getNowISO();
    dataStore.setItem('PersonalProject', project);
    notificationService.addNotification({ type: 'success', message: `Project "${project.title}" updated.`, actionLink: `/projects` });
    return project;
};

export const apiGetAllPersonalProjects = async (): Promise<PersonalProject[]> => {
    return dataStore.getAllItems<PersonalProject>('PersonalProject');
};

export const apiDeletePersonalProject = async (id: string): Promise<void> => {
    dataStore.removeItem('PersonalProject', id);
    notificationService.addNotification({ type: 'info', message: 'Personal project removed.' });
};

export const apiSuggestPersonalProjectIdeas = async (userProfile: UserProfile, targetSkills: string[], careerGoal?: string): Promise<Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'technologiesUsed' | 'endDate'>[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || targetSkills.length === 0) {
        throw new CustomError("User profile and target skills are required for project ideas.", "INPUT_VALIDATION_ERROR");
    }
    const ideas = await careerAIClient.suggestProjectIdeas(userProfile, targetSkills, careerGoal);
    notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} project ideas.`, actionLink: `/projects` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Project Idea Generation', actionLink: `/projects` } });
    return ideas;
};

// 3.13 Mentorship API
export const apiAddMentorProfile = async (mentor: Omit<MentorProfile, 'id' | 'currentMentees' | 'isAvailable'>): Promise<MentorProfile> => {
    const newMentor: MentorProfile = {
        ...mentor,
        id: generateId(),
        currentMentees: [],
        isAvailable: true,
    };
    dataStore.setItem('MentorProfile', newMentor);
    notificationService.addNotification({ type: 'success', message: `Mentor "${newMentor.name}" added to database.` });
    return newMentor;
};

export const apiUpdateMentorProfile = async (mentor: MentorProfile): Promise<MentorProfile> => {
    dataStore.setItem('MentorProfile', mentor);
    notificationService.addNotification({ type: 'success', message: `Mentor "${mentor.name}" profile updated.` });
    return mentor;
};

export const apiGetAllMentorProfiles = async (): Promise<MentorProfile[]> => {
    return dataStore.getAllItems<MentorProfile>('MentorProfile');
};

export const apiGetMentorProfileById = async (id: string): Promise<MentorProfile | null> => {
    return dataStore.getItem<MentorProfile>('MentorProfile', id);
};

export const apiDeleteMentorProfile = async (id: string): Promise<void> => {
    dataStore.removeItem('MentorProfile', id);
    notificationService.addNotification({ type: 'info', message: 'Mentor profile removed.' });
};

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
    return matchedMentors;
};

export const apiScheduleMentorshipSession = async (mentorId: string, topic: string, durationMinutes: number): Promise<MentorshipSession> => {
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
    dataStore.setItem('MentorshipSession', newSession);

    // Update mentor and user profile to reflect new session
    mentor.currentMentees.push(userProfile.id); // Add mentee to mentor's list
    await apiUpdateMentorProfile(mentor);
    // In a real app, user profile would track sessions as well.

    notificationService.addNotification({ type: 'success', message: `Mentorship session with ${mentor.name} scheduled for ${DateUtils.formatDate(newSession.sessionDate)}.`, actionLink: `/mentorship/${newSession.id}` });
    return newSession;
};

export const apiUpdateMentorshipSession = async (session: MentorshipSession): Promise<MentorshipSession> => {
    dataStore.setItem('MentorshipSession', session);
    notificationService.addNotification({ type: 'success', message: `Mentorship session for "${session.topic}" updated.`, actionLink: `/mentorship/${session.id}` });
    return session;
};

export const apiGetAllMentorshipSessions = async (menteeId: string = USER_ID): Promise<MentorshipSession[]> => {
    return dataStore.getAllItems<MentorshipSession>('MentorshipSession').filter(session => session.menteeId === menteeId);
};

// 3.14 Learning Resources API
export const apiGetAllLearningResources = async (): Promise<LearningResource[]> => {
    return dataStore.getAllItems<LearningResource>('LearningResource');
};

export const apiAddLearningResource = async (resource: Omit<LearningResource, 'id' | 'dateAdded'>): Promise<LearningResource> => {
    const newResource: LearningResource = {
        ...resource,
        id: generateId(),
        dateAdded: DateUtils.getNowISO()
    };
    dataStore.setItem('LearningResource', newResource);
    notificationService.addNotification({ type: 'success', message: `Learning resource "${newResource.title}" added.` });
    return newResource;
};

export const apiUpdateLearningResource = async (resource: LearningResource): Promise<LearningResource> => {
    dataStore.setItem('LearningResource', resource);
    notificationService.addNotification({ type: 'success', message: `Learning resource "${resource.title}" updated.` });
    return resource;
};

export const apiDeleteLearningResource = async (id: string): Promise<void> => {
    dataStore.removeItem('LearningResource', id);
    notificationService.addNotification({ type: 'info', message: 'Learning resource removed.' });
};


// 3.15 Portfolio Management API
export const apiAddPortfolioItem = async (item: Omit<PortfolioItem, 'id'>): Promise<PortfolioItem> => {
    const newItem: PortfolioItem = {
        ...item,
        id: generateId(),
        date: item.date || DateUtils.getNowISO() // Ensure date is set
    };
    dataStore.setItem('PortfolioItem', newItem);
    notificationService.addNotification({ type: 'success', message: `Portfolio item "${newItem.title}" added.`, actionLink: `/portfolio` });
    return newItem;
};

export const apiUpdatePortfolioItem = async (item: PortfolioItem): Promise<PortfolioItem> => {
    dataStore.setItem('PortfolioItem', item);
    notificationService.addNotification({ type: 'success', message: `Portfolio item "${item.title}" updated.`, actionLink: `/portfolio` });
    return item;
};

export const apiGetAllPortfolioItems = async (): Promise<PortfolioItem[]> => {
    return dataStore.getAllItems<PortfolioItem>('PortfolioItem');
};

export const apiDeletePortfolioItem = async (id: string): Promise<void> => {
    dataStore.removeItem('PortfolioItem', id);
    notificationService.addNotification({ type: 'info', message: 'Portfolio item removed.' });
};

export const apiReviewPortfolioItem = async (item: PortfolioItem, userProfile: UserProfile, targetJobDescription?: string): Promise<AISuggestion[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !item) {
        throw new CustomError("User profile and portfolio item are required for review.", "INPUT_VALIDATION_ERROR");
    }
    const suggestions = await careerAIClient.reviewPortfolioItem(item, userProfile, targetJobDescription);
    notificationService.addNotification({ type: 'success', message: `Portfolio item "${item.title}" reviewed.`, actionLink: `/portfolio` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Portfolio Review', actionLink: `/portfolio` } });
    return suggestions;
};

// 3.16 Content Generation API
export const apiGenerateContentIdeas = async (userProfile: UserProfile, contentType: string, focusArea: string): Promise<{ title: string; outline: string; targetAudience: string; keywords: string[] }[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || !ValidationUtils.isNotNullOrEmpty(contentType) || !ValidationUtils.isNotNullOrEmpty(focusArea)) {
        throw new CustomError("User profile, content type, and focus area are required.", "INPUT_VALIDATION_ERROR");
    }
    const ideas = await careerAIClient.generateContentIdeas(userProfile, contentType, focusArea);
    notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} content ideas for ${focusArea}.`, actionLink: `/content` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Content Idea Generation', actionLink: `/content` } });
    return ideas;
};

// 3.17 Daily Planning API
export const apiGenerateDailyPlan = async (userProfile: UserProfile, goals: CareerGoal[], skillsToDevelop: string[], numberOfItems: number): Promise<DailyPlanItem[]> => {
    if (!careerAIClient) throw new CustomError("AI service not initialized.", "AI_SERVICE_UNAVAILABLE");
    if (!userProfile || skillsToDevelop.length === 0) {
        throw new CustomError("User profile and skills to develop are required for daily plan generation.", "INPUT_VALIDATION_ERROR");
    }
    const planItems = await careerAIClient.generateDailyPlan(userProfile, goals, skillsToDevelop, numberOfItems);
    const today = new Date().toISOString().substring(0, 10);
    const fullPlan: DailyPlanItem[] = planItems.map(item => ({
        ...item,
        id: generateId(),
        date: today,
        isCompleted: false
    }));
    fullPlan.forEach(item => dataStore.setItem('DailyPlanItem', item));
    notificationService.addNotification({ type: 'success', message: `Generated your daily plan for today!`, actionLink: `/daily-plan` });
    webhookProcessor.receiveEvent({ eventType: 'AI_TASK_COMPLETED', payload: { taskName: 'Daily Plan Generation', actionLink: `/daily-plan` } });
    return fullPlan;
};

export const apiGetDailyPlanForDate = async (date: string): Promise<DailyPlanItem[]> => {
    return dataStore.getAllItems<DailyPlanItem>('DailyPlanItem').filter(item => item.date === date)
        .sort((a, b) => a.time.localeCompare(b.time));
};

export const apiUpdateDailyPlanItem = async (item: DailyPlanItem): Promise<DailyPlanItem> => {
    dataStore.setItem('DailyPlanItem', item);
    notificationService.addNotification({ type: 'info', message: `Daily plan item "${TextUtils.truncate(item.activity, 50)}" updated.` });
    return item;
};

export const apiDeleteDailyPlanItem = async (id: string): Promise<void> => {
    dataStore.removeItem('DailyPlanItem', id);
    notificationService.addNotification({ type: 'info', message: 'Daily plan item removed.' });
};


/**
 * =====================================================================================================================
 *  SECTION 4: REACT COMPONENT - CAREER TRAJECTORY VIEW
 * =====================================================================================================================
 * This section contains the main React component, heavily expanded with UI elements and state management
 * to expose all the functionality defined in the preceding sections.
 */

export const CareerTrajectoryView: React.FC = () => {
    // -----------------------------------------------------------------------------------------------------------------
    //  4.1: Component-level State Management
    // -----------------------------------------------------------------------------------------------------------------
    const [activeTab, setActiveTab] = useState<string>('resume'); // 'resume', 'profile', 'goals', 'applications', 'interview', 'skills', 'market', 'branding', 'review', 'network', 'projects', 'mentorship', 'portfolio', 'content', 'daily-plan'

    // Core AI Analysis State (Resume & JD)
    const [resume, setResume] = useState<string>('');
    const [jobDesc, setJobDesc] = useState<string>('');
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // User Profile State
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileEditing, setIsProfileEditing] = useState<boolean>(false);
    const [aiModelPreference, setAiModelPreference] = useState<keyof typeof AI_MODELS>(AI_MODELS.balanced);

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
    const [suggestedProjectIdeas, setSuggestedProjectIdeas] = useState<Omit<PersonalProject, 'id' | 'startDate' | 'createdAt' | 'lastUpdated' | 'goalIds' | 'status' | 'technologiesUsed' | 'endDate'>[]>([]);
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


    // Global Notifications
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Refs for textareas to manage focus or content
    const resumeRef = useRef<HTMLTextAreaElement>(null);
    const jobDescRef = useRef<HTMLTextAreaElement>(null);


    // -----------------------------------------------------------------------------------------------------------------
    //  4.2: Lifecycle & Initial Data Loading
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const profile = await apiInitializeUserProfile();
                setUserProfile(profile);
                setResume(profile.resumeText || `Experience:\nSoftware Engineer at Acme Corp (2020-2024)\n- Worked on a team to build software.\n- Fixed bugs and improved performance.`);
                setJobDesc(`Job: Senior Software Engineer at Innovate Inc.\nRequirements:\n- 5+ years of experience.\n- Expertise in agile development and CI/CD pipelines.\n- Proven ability to mentor junior engineers.`);

                const applications = await apiGetAllJobApplications();
                setJobApplications(applications);

                const goals = await apiGetAllCareerGoals();
                setCareerGoals(goals);

                const sessions = await apiGetAllInterviewSessions();
                setInterviewSessions(sessions);

                const contacts = await apiGetAllNetworkContacts();
                setNetworkContacts(contacts);

                const projects = await apiGetAllPersonalProjects();
                setPersonalProjects(projects);

                const mentors = await apiGetAllMentorProfiles();
                setMentorProfiles(mentors);

                const sessionships = await apiGetAllMentorshipSessions();
                setMentorshipSessions(sessionships);

                const resources = await apiGetAllLearningResources();
                setLearningResources(resources);

                const portfolio = await apiGetAllPortfolioItems();
                setPortfolioItems(portfolio);

                const brandStatement = await apiGetLatestPersonalBrandStatement();
                setPersonalBrandStatement(brandStatement);

                const todayPlan = await apiGetDailyPlanForDate(new Date().toISOString().substring(0, 10));
                setDailyPlanItems(todayPlan);

            } catch (err) {
                console.error("Failed to load initial data:", err);
                setError(`Failed to load initial data: ${(err as Error).message}`);
                notificationService.addNotification({ type: 'error', message: `Initial data load failed: ${(err as Error).message}` });
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();

        // Subscribe to notifications
        const unsubscribe = notificationService.subscribe((newNotifications) => {
            setNotifications([...newNotifications]); // Ensure state update with new array
        });

        return () => unsubscribe();
    }, []);

    // Effect to update user profile's resume whenever the local resume state changes
    useEffect(() => {
        if (userProfile && resume !== userProfile.resumeText) {
            // Update profile resume text without immediate API call to avoid loops,
            // but mark it as needing save or prompt user to save.
            // For this exhaustive example, we simulate immediate persistence.
            const updatedProfile = { ...userProfile, resumeText: resume };
            dataStore.setItem('UserProfile', updatedProfile);
            setUserProfile(updatedProfile);
        }
    }, [resume, userProfile]);

    useEffect(() => {
        if (careerAIClient && userProfile?.id) {
            careerAIClient.setModel(userProfile.aiModelPreference || AI_MODELS.balanced);
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
        }
    }, [resume, jobDesc]);

    const handleProfileUpdate = useCallback(async () => {
        if (!userProfile) return;
        setIsSavingApplication(true); // Reusing for profile save
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
                updatedApp = await apiAddJobApplication(currentApplicationForm as Omit<JobApplication, 'id' | 'createdAt' | 'lastUpdated' | 'contacts' | 'negotiationHistory' | 'feedbackReceived' | 'interviewDates'>);
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
            // Use current resume or a summary from userProfile.resume
            const resumeSummary = TextUtils.truncate(userProfile.resumeText, 500); // Or use an AI call to summarize resume
            const generatedLetter = await apiGenerateCoverLetter(userProfile, app, resumeSummary);
            setCoverLetterContent(generatedLetter);
            // Optionally, update the application with the generated cover letter
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
                updatedGoal = await apiAddCareerGoal(currentGoalForm as Omit<CareerGoal, 'id' | 'createdAt' | 'lastUpdated' | 'progressNotes' | 'actionItems'>);
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
        }
    }, []);

    const handleAddOrUpdateActionItem = useCallback(async () => {
        if (!currentActionItemForm.description || !currentActionItemForm.dueDate || !currentActionItemForm.goalId) {
            setError("Description, Due Date, and parent Goal are required for an action item.");
            return;
        }

        setIsSavingGoal(true); // Reusing this for action items
        setError(null);
        try {
            let updatedItem: ActionItem;
            if (currentActionItemForm.id) {
                updatedItem = await apiUpdateActionItem(currentActionItemForm as ActionItem);
            } else {
                updatedItem = await apiAddActionItem(currentActionItemForm as Omit<ActionItem, 'id'>);
            }
            // Refresh goals or just the selected one
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
            // Refresh all learning resources in case new ones were generated
            setLearningResources(await apiGetAllLearningResources());
        } catch (err) {
            console.error("Skill analysis failed:", err);
            setError(`Skill analysis failed: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Skill analysis failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsAnalyzingSkills(false);
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
            // Refresh all learning resources in case new ones were generated for pathways
            setLearningResources(await apiGetAllLearningResources());
        } catch (err) {
            console.error("Career path generation failed:", err);
            setError(`Career path generation failed: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Career path generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingCareerPaths(false);
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
            setActiveTab('interview'); // Switch to interview tab
            notificationService.addNotification({ type: 'info', message: `Interview session for ${app.jobTitle} started.` });
        } catch (err) {
            console.error("Failed to start interview session:", err);
            setError(`Failed to start interview session: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Interview session start failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsStartingInterview(false);
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
                updatedContact = await apiAddNetworkContact(currentContactForm as Omit<NetworkContact, 'id' | 'connectionDate' | 'lastContactDate'>);
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
                startDate: currentProjectForm.startDate || DateUtils.getNowISO().substring(0, 10), // Default start date
                status: currentProjectForm.status || 'Idea',
                skillsDeveloped: currentProjectForm.skillsDeveloped || [],
                technologiesUsed: currentProjectForm.technologiesUsed || [],
                goalIds: currentProjectForm.goalIds || [],
            };

            if (projectToSave.id) {
                updatedProject = await apiUpdatePersonalProject(projectToSave as PersonalProject);
            } else {
                updatedProject = await apiAddPersonalProject(projectToSave as Omit<PersonalProject, 'id' | 'createdAt' | 'lastUpdated'>);
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
                updatedItem = await apiAddPortfolioItem(itemToSave as Omit<PortfolioItem, 'id'>);
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
            notificationService.addNotification({ type: 'success', message: `Generated ${ideas.length} content ideas!` });
        } catch (err) {
            console.error("Failed to generate content ideas:", err);
            setError(`Failed to generate content ideas: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Content idea generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingContentIdeas(false);
        }
    }, [userProfile, contentType, contentFocusArea]);

    const handleGenerateDailyPlan = useCallback(async () => {
        if (!userProfile || !ValidationUtils.isNotNullOrEmpty(dailyPlanSkillsToFocus)) {
            setError("User profile and skills to focus on are required for daily plan generation.");
            return;
        }
        const skillsArray = dailyPlanSkillsToFocus.split(',').map(s => s.trim()).filter(Boolean);
        if (skillsArray.length === 0) {
            setError("Please list at least one skill to focus on for your daily plan.");
            return;
        }
        setIsGeneratingDailyPlan(true);
        setDailyPlanItems([]);
        setError(null);
        try {
            const plan = await apiGenerateDailyPlan(userProfile, careerGoals, skillsArray, 5); // Default 5 items
            setDailyPlanItems(plan);
            setDailyPlanDate(new Date().toISOString().substring(0, 10)); // Set to today
            notificationService.addNotification({ type: 'success', message: 'Daily plan generated!' });
        } catch (err) {
            console.error("Failed to generate daily plan:", err);
            setError(`Failed to generate daily plan: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Daily plan generation failed: ${(err as CustomError).message || (err as Error).message}` });
        } finally {
            setIsGeneratingDailyPlan(false);
        }
    }, [userProfile, careerGoals, dailyPlanSkillsToFocus]);

    const handleToggleDailyPlanItemCompletion = useCallback(async (item: DailyPlanItem) => {
        setError(null);
        try {
            const updatedItem = { ...item, isCompleted: !item.isCompleted };
            await apiUpdateDailyPlanItem(updatedItem);
            setDailyPlanItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
        } catch (err) {
            console.error("Failed to update daily plan item:", err);
            setError(`Failed to update daily plan item: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Daily plan item update failed: ${(err as CustomError).message || (err as Error).message}` });
        }
    }, []);

    const handleChangeDailyPlanDate = useCallback(async (dateString: string) => {
        setDailyPlanDate(dateString);
        setError(null);
        try {
            const items = await apiGetDailyPlanForDate(dateString);
            setDailyPlanItems(items);
            notificationService.addNotification({ type: 'info', message: `Loaded daily plan for ${DateUtils.formatDate(dateString)}.` });
        } catch (err) {
            console.error("Failed to load daily plan for date:", err);
            setError(`Failed to load daily plan: ${(err as CustomError).message || (err as Error).message}`);
            notificationService.addNotification({ type: 'error', message: `Daily plan load failed: ${(err as CustomError).message || (err as Error).message}` });
        }
    }, []);


    // -----------------------------------------------------------------------------------------------------------------
    //  4.4: Memoized Components & UI Helpers
    // -----------------------------------------------------------------------------------------------------------------

    const NotificationTray: React.FC = useMemo(() => {
        return () => (
            <div className="fixed top-4 right-4 z-50 space-y-2 max-h-screen-75 overflow-y-auto max-w-sm">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`p-3 rounded-lg shadow-lg flex justify-between items-start text-sm ${
                            n.type === 'success' ? 'bg-green-600' :
                            n.type === 'info' ? 'bg-blue-600' :
                            n.type === 'warning' ? 'bg-yellow-600' :
                            'bg-red-600'
                        } text-white transition-opacity duration-300 ${n.read ? 'opacity-50' : ''}`}
                        role="alert"
                    >
                        <div className="flex-1">
                            <p>{n.message}</p>
                            <span className="text-gray-200 text-xs mt-1 block">({DateUtils.timeSince(n.timestamp)})</span>
                            {n.actionLink && (
                                <a href="#" onClick={() => setActiveTab(n.actionLink.split('/')[1])} className="text-white underline text-xs mt-1 block">View Details</a>
                            )}
                        </div>
                        <button onClick={() => notificationService.markAsRead(n.id)} className="ml-4 flex-shrink-0 text-white hover:text-gray-200 focus:outline-none">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
        );
    }, [notifications, setActiveTab]);

    const Navbar: React.FC = useMemo(() => {
        const tabs = [
            { id: 'resume', name: 'Resume & JD' },
            { id: 'profile', name: 'Profile' },
            { id: 'goals', name: 'Goals & Actions' },
            { id: 'applications', name: 'Applications' },
            { id: 'interview', name: 'Interview Prep' },
            { id: 'skills', name: 'Skills & Paths' },
            { id: 'market', name: 'Market Trends' },
            { id: 'branding', name: 'Branding' },
            { id: 'review', name: 'Performance Review' },
            { id: 'negotiation', name: 'Salary Negotiation' },
            { id: 'network', name: 'Networking' },
            { id: 'projects', name: 'Projects' },
            { id: 'mentorship', name: 'Mentorship' },
            { id: 'portfolio', name: 'Portfolio' },
            { id: 'content', name: 'Content Ideas' },
            { id: 'daily-plan', name: 'Daily Plan' },
        ];
        return () => (
            <nav className="mb-8 p-4 bg-gray-900 rounded-lg shadow-lg flex flex-wrap gap-2 justify-center sticky top-0 z-40 border-b border-gray-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.id
                                ? 'bg-cyan-700 text-white shadow-md'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </nav>
        );
    }, [activeTab]);

    const renderUserProfileSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Professional Profile</h2>
            <Card title="Edit Profile">
                <div className="space-y-4">
                    {userProfile ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-gray-400">Name</span>
                                    <input type="text" value={userProfile.name} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Email</span>
                                    <input type="email" value={userProfile.email} onChange={e => setUserProfile({ ...userProfile, email: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Current Role</span>
                                    <input type="text" value={userProfile.currentRole} onChange={e => setUserProfile({ ...userProfile, currentRole: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Industry</span>
                                    <input type="text" value={userProfile.industry} onChange={e => setUserProfile({ ...userProfile, industry: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Years Experience</span>
                                    <input type="number" value={userProfile.yearsExperience} onChange={e => setUserProfile({ ...userProfile, yearsExperience: parseInt(e.target.value) || 0 })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Career Stage</span>
                                    <select value={userProfile.careerStage} onChange={e => setUserProfile({ ...userProfile, careerStage: e.target.value as CareerStage })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75">
                                        {Object.values(CareerStage).map(stage => <option key={stage} value={stage}>{stage}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">LinkedIn Profile URL</span>
                                    <input type="url" value={userProfile.linkedInProfileUrl || ''} onChange={e => setUserProfile({ ...userProfile, linkedInProfileUrl: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Personal Website URL</span>
                                    <input type="url" value={userProfile.personalWebsiteUrl || ''} onChange={e => setUserProfile({ ...userProfile, personalWebsiteUrl: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                            </div>
                            <label className="block">
                                <span className="text-gray-400">Skills (comma-separated)</span>
                                <textarea value={userProfile.skills.join(', ')} onChange={e => setUserProfile({ ...userProfile, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} disabled={!isProfileEditing} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Education (one per line)</span>
                                <textarea value={userProfile.education.join('\n')} onChange={e => setUserProfile({ ...userProfile, education: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} disabled={!isProfileEditing} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Certifications (one per line)</span>
                                <textarea value={userProfile.certifications.join('\n')} onChange={e => setUserProfile({ ...userProfile, certifications: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })} disabled={!isProfileEditing} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Desired Roles (comma-separated)</span>
                                <textarea value={userProfile.desiredRoles.join(', ')} onChange={e => setUserProfile({ ...userProfile, desiredRoles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} disabled={!isProfileEditing} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Desired Industry</span>
                                <input type="text" value={userProfile.desiredIndustry} onChange={e => setUserProfile({ ...userProfile, desiredIndustry: e.target.value })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-gray-400">Salary Expectation Min ($)</span>
                                    <input type="number" value={userProfile.salaryExpectationMin} onChange={e => setUserProfile({ ...userProfile, salaryExpectationMin: parseInt(e.target.value) || 0 })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-400">Salary Expectation Max ($)</span>
                                    <input type="number" value={userProfile.salaryExpectationMax} onChange={e => setUserProfile({ ...userProfile, salaryExpectationMax: parseInt(e.target.value) || 0 })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                                </label>
                            </div>
                            <label className="block">
                                <span className="text-gray-400">Career Vision</span>
                                <textarea value={userProfile.careerVision || ''} onChange={e => setUserProfile({ ...userProfile, careerVision: e.target.value })} disabled={!isProfileEditing} className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Preferred Learning Styles (comma-separated)</span>
                                <input type="text" value={userProfile.preferredLearningStyles.join(', ')} onChange={e => setUserProfile({ ...userProfile, preferredLearningStyles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">AI Model Preference</span>
                                <select value={aiModelPreference} onChange={e => {
                                    setAiModelPreference(e.target.value as keyof typeof AI_MODELS);
                                    if (userProfile) setUserProfile({ ...userProfile, aiModelPreference: e.target.value as keyof typeof AI_MODELS });
                                    if (careerAIClient) careerAIClient.setModel(AI_MODELS[e.target.value as keyof typeof AI_MODELS]);
                                }} disabled={!isProfileEditing} className="w-full bg-gray-900/50 p-2 rounded text-sm disabled:opacity-75">
                                    {Object.entries(AI_MODELS).map(([key, value]) => <option key={key} value={key}>{TextUtils.toSentenceCase(key)} ({value})</option>)}
                                </select>
                            </label>

                            <div className="flex justify-end space-x-2 mt-4">
                                {isProfileEditing ? (
                                    <>
                                        <button onClick={() => { setIsProfileEditing(false); /* A more robust system would re-fetch to revert changes */ }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                                        <button onClick={handleProfileUpdate} disabled={isSavingApplication} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                                            {isSavingApplication ? 'Saving...' : 'Save Profile'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => setIsProfileEditing(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white">Edit Profile</button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-400">Loading profile...</p>
                    )}
                </div>
            </Card>
        </div>
    );

    const renderCareerGoalsSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Career Goals & Action Plan</h2>
            <div className="text-right">
                <button onClick={() => { setCurrentGoalForm({}); setShowAddGoalModal(true); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Add New Goal</button>
            </div>
            {careerGoals.length === 0 && !isLoading && <p className="text-gray-400">No career goals set yet. Add one to get started!</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {careerGoals.map(goal => (
                    <Card key={goal.id} title={goal.title}>
                        <p className="text-sm text-gray-300 mb-2">{TextUtils.truncate(goal.description, 100)}</p>
                        <p className="text-xs text-gray-400">Target Date: {DateUtils.formatDate(goal.targetDate)}</p>
                        <p className="text-xs text-gray-400">Status: <span className={`font-semibold ${goal.status === 'Completed' ? 'text-green-400' : goal.status === 'InProgress' ? 'text-blue-400' : 'text-yellow-400'}`}>{goal.status}</span></p>
                        <p className="text-xs text-gray-400">Priority: <span className={`${goal.priority === 'Critical' ? 'text-red-400' : goal.priority === 'High' ? 'text-orange-400' : 'text-gray-400'}`}>{goal.priority}</span></p>
                        {goal.relatedSkills.length > 0 && <p className="text-xs text-gray-400 mt-1">Skills: {TextUtils.truncate(goal.relatedSkills.join(', '), 60)}</p>}
                        {goal.actionItems.length > 0 && <p className="text-xs text-gray-400 mt-1">Action Items: {goal.actionItems.filter(ai => !ai.isCompleted).length} pending</p>}

                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            <button onClick={() => setSelectedGoal(goal)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">View Details</button>
                            <button onClick={() => { setCurrentGoalForm(goal); setShowAddGoalModal(true); }} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded">Edit</button>
                            <button onClick={() => handleDeleteGoal(goal.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Goal Modal */}
            {showAddGoalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={currentGoalForm.id ? "Edit Career Goal" : "Add New Career Goal"} className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <label className="block">
                                <span className="text-gray-400">Title</span>
                                <input type="text" value={currentGoalForm.title || ''} onChange={e => setCurrentGoalForm({ ...currentGoalForm, title: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Description</span>
                                <textarea value={currentGoalForm.description || ''} onChange={e => setCurrentGoalForm({ ...currentGoalForm, description: e.target.value })} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Target Date</span>
                                <input type="date" value={currentGoalForm.targetDate ? currentGoalForm.targetDate.substring(0, 10) : ''} onChange={e => setCurrentGoalForm({ ...currentGoalForm, targetDate: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Status</span>
                                <select value={currentGoalForm.status || GoalStatus.Pending} onChange={e => setCurrentGoalForm({ ...currentGoalForm, status: e.target.value as GoalStatus })} className="w-full bg-gray-900/50 p-2 rounded text-sm">
                                    {Object.values(GoalStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Priority</span>
                                <select value={currentGoalForm.priority || PriorityLevel.Medium} onChange={e => setCurrentGoalForm({ ...currentGoalForm, priority: e.target.value as PriorityLevel })} className="w-full bg-gray-900/50 p-2 rounded text-sm">
                                    {Object.values(PriorityLevel).map(priority => <option key={priority} value={priority}>{priority}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Related Skills (comma-separated)</span>
                                <input type="text" value={currentGoalForm.relatedSkills?.join(', ') || ''} onChange={e => setCurrentGoalForm({ ...currentGoalForm, relatedSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => setShowAddGoalModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                                <button onClick={handleAddOrUpdateGoal} disabled={isSavingGoal} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                                    {isSavingGoal ? 'Saving...' : (currentGoalForm.id ? 'Update Goal' : 'Add Goal')}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Goal Details & Action Items Modal */}
            {selectedGoal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={`${selectedGoal.title} - Details`} className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <p><strong>Description:</strong> {selectedGoal.description}</p>
                            <p><strong>Target Date:</strong> {DateUtils.formatDate(selectedGoal.targetDate)}</p>
                            <p><strong>Status:</strong> <span className={`font-semibold ${selectedGoal.status === GoalStatus.Completed ? 'text-green-400' : selectedGoal.status === GoalStatus.InProgress ? 'text-blue-400' : 'text-yellow-400'}`}>{selectedGoal.status}</span></p>
                            <p><strong>Priority:</strong> <span className={`${selectedGoal.priority === PriorityLevel.Critical ? 'text-red-400' : selectedGoal.priority === PriorityLevel.High ? 'text-orange-400' : 'text-gray-400'}`}>{selectedGoal.priority}</span></p>
                            {selectedGoal.relatedSkills.length > 0 && <p><strong>Related Skills:</strong> {selectedGoal.relatedSkills.join(', ')}</p>}
                            <p className="text-gray-500 text-xs">Last Updated: {DateUtils.formatDateTime(selectedGoal.lastUpdated)}</p>

                            <h3 className="text-xl font-bold mt-6 flex justify-between items-center">
                                Action Items ({selectedGoal.actionItems.filter(ai => !ai.isCompleted).length} Pending)
                                <button onClick={() => { setCurrentActionItemForm({ goalId: selectedGoal.id }); setShowAddActionItemModal(true); }} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm">Add Action Item</button>
                            </h3>
                            {selectedGoal.actionItems.length === 0 ? (
                                <p className="text-gray-400">No action items for this goal yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {selectedGoal.actionItems.sort((a,b) => (a.isCompleted === b.isCompleted) ? 0 : a.isCompleted ? 1 : -1).map(item => (
                                        <div key={item.id} className={`p-3 rounded-md flex items-center justify-between ${item.isCompleted ? 'bg-gray-800/50 text-gray-500 line-through' : 'bg-gray-900/50 border border-gray-700'}`}>
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.description}</p>
                                                <p className="text-xs text-gray-400">Due: {DateUtils.formatDate(item.dueDate)}</p>
                                            </div>
                                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                                                <button onClick={() => {
                                                    setCurrentActionItemForm(item);
                                                    setShowAddActionItemModal(true);
                                                }} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Edit</button>
                                                <button onClick={() => handleDeleteActionItem(item.id, item.goalId)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
                                                <button onClick={() => {
                                                    apiUpdateActionItem({ ...item, isCompleted: !item.isCompleted, completedDate: !item.isCompleted ? DateUtils.getNowISO() : undefined });
                                                    // Immediately update local state for responsiveness
                                                    setSelectedGoal(prev => prev ? { ...prev, actionItems: prev.actionItems.map(ai => ai.id === item.id ? { ...ai, isCompleted: !ai.isCompleted, completedDate: !item.isCompleted ? DateUtils.getNowISO() : undefined } : ai) } : prev);
                                                }} className={`px-2 py-1 ${item.isCompleted ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white text-xs rounded`}>
                                                    {item.isCompleted ? 'Mark Pending' : 'Mark Complete'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => setSelectedGoal(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Close</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add/Edit Action Item Modal */}
            {showAddActionItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={currentActionItemForm.id ? "Edit Action Item" : "Add New Action Item"} className="max-w-xl w-full">
                        <div className="space-y-4 text-white">
                            <label className="block">
                                <span className="text-gray-400">Description</span>
                                <input type="text" value={currentActionItemForm.description || ''} onChange={e => setCurrentActionItemForm({ ...currentActionItemForm, description: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Due Date</span>
                                <input type="date" value={currentActionItemForm.dueDate ? currentActionItemForm.dueDate.substring(0, 10) : ''} onChange={e => setCurrentActionItemForm({ ...currentActionItemForm, dueDate: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Notes (Optional)</span>
                                <textarea value={currentActionItemForm.notes || ''} onChange={e => setCurrentActionItemForm({ ...currentActionItemForm, notes: e.target.value })} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block flex items-center space-x-2">
                                <input type="checkbox" checked={currentActionItemForm.isCompleted || false} onChange={e => setCurrentActionItemForm({ ...currentActionItemForm, isCompleted: e.target.checked })} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-900/50 border-gray-700 rounded" />
                                <span className="text-gray-400">Completed</span>
                            </label>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => setShowAddActionItemModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                                <button onClick={handleAddOrUpdateActionItem} disabled={isSavingGoal} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                                    {isSavingGoal ? 'Saving...' : (currentActionItemForm.id ? 'Update Item' : 'Add Item')}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderJobApplicationsSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Job Applications</h2>
            <div className="text-right">
                <button onClick={() => { setCurrentApplicationForm({applicationDate: DateUtils.getNowISO().substring(0,10), status: JobApplicationStatus.Applied, resumeUsed: userProfile?.resumeText || ''}); setShowAddApplicationModal(true); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Add New Application</button>
            </div>
            {jobApplications.length === 0 && !isLoading && <p className="text-gray-400">No applications tracked yet. Add one!</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobApplications.map(app => (
                    <Card key={app.id} title={`${app.jobTitle} at ${app.company}`}>
                        <p className="text-sm text-gray-300 mb-2">Applied: {DateUtils.formatDate(app.applicationDate)}</p>
                        <p className="text-sm text-gray-300">Status: <span className={`font-semibold ${app.status === JobApplicationStatus.OfferReceived ? 'text-green-400' : app.status === JobApplicationStatus.Interviewing ? 'text-blue-400' : app.status === JobApplicationStatus.Rejected ? 'text-red-400' : 'text-yellow-400'}`}>{app.status}</span></p>
                        <p className="text-xs text-gray-400 mt-1">{TextUtils.truncate(app.notes, 100)}</p>
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            <button onClick={() => { setSelectedApplication(app); setCoverLetterContent(app.coverLetterUsed || ''); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Details</button>
                            <button onClick={() => handleGenerateCoverLetter(app)} disabled={isGeneratingCoverLetter || !userProfile} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded disabled:opacity-50">{isGeneratingCoverLetter ? 'Generating...' : 'Gen Cover Letter'}</button>
                            {(app.status === JobApplicationStatus.Applied || app.status === JobApplicationStatus.Interviewing) && (
                                <button onClick={() => handleStartInterview(app)} disabled={isStartingInterview || !userProfile} className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded disabled:opacity-50">{isStartingInterview ? 'Starting...' : 'Start Interview Prep'}</button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Application Modal */}
            {showAddApplicationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={currentApplicationForm.id ? "Edit Job Application" : "Add New Job Application"} className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <label className="block">
                                <span className="text-gray-400">Job Title</span>
                                <input type="text" value={currentApplicationForm.jobTitle || ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, jobTitle: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Company</span>
                                <input type="text" value={currentApplicationForm.company || ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, company: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Application Date</span>
                                <input type="date" value={currentApplicationForm.applicationDate ? currentApplicationForm.applicationDate.substring(0, 10) : ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, applicationDate: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Status</span>
                                <select value={currentApplicationForm.status || JobApplicationStatus.Applied} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, status: e.target.value as JobApplicationStatus })} className="w-full bg-gray-900/50 p-2 rounded text-sm">
                                    {Object.values(JobApplicationStatus).map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Job Posting Link</span>
                                <input type="url" value={currentApplicationForm.link || ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, link: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Job Description (full text)</span>
                                <textarea value={currentApplicationForm.jobDescription || ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, jobDescription: e.target.value })} className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Notes</span>
                                <textarea value={currentApplicationForm.notes || ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, notes: e.target.value })} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Resume Snapshot (Text)</span>
                                <textarea value={currentApplicationForm.resumeUsed || userProfile?.resumeText || ''} onChange={e => setCurrentApplicationForm({ ...currentApplicationForm, resumeUsed: e.target.value })} className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm" placeholder="Automatically populated from your profile resume, or paste specific version here" />
                            </label>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => {setShowAddApplicationModal(false); setSelectedApplication(null); setCoverLetterContent('');}} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                                <button onClick={handleAddOrUpdateApplication} disabled={isSavingApplication} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                                    {isSavingApplication ? 'Saving...' : (currentApplicationForm.id ? 'Update Application' : 'Add Application')}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Application Details & Cover Letter Viewer */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={`${selectedApplication.jobTitle} - Details`} className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <p><strong>Company:</strong> {selectedApplication.company}</p>
                            <p><strong>Status:</strong> {selectedApplication.status}</p>
                            <p><strong>Application Date:</strong> {DateUtils.formatDate(selectedApplication.applicationDate)}</p>
                            {selectedApplication.link && <p><strong>Job Link:</strong> <a href={selectedApplication.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{selectedApplication.link}</a></p>}
                            <p><strong>Notes:</strong> {selectedApplication.notes || 'N/A'}</p>
                            <div className="bg-gray-800 p-3 rounded-md">
                                <h4 className="font-semibold text-gray-300">Job Description:</h4>
                                <pre className="text-sm text-gray-200 whitespace-pre-wrap">{selectedApplication.jobDescription}</pre>
                            </div>

                            <h3 className="text-xl font-bold mt-6">Generated Cover Letter</h3>
                            {isGeneratingCoverLetter ? (
                                <p className="text-gray-400">Generating cover letter...</p>
                            ) : (
                                <div className="bg-gray-800 p-3 rounded-md">
                                    {coverLetterContent ? (
                                        <pre className="text-sm text-gray-200 whitespace-pre-wrap">{coverLetterContent}</pre>
                                    ) : (
                                        <p className="text-gray-400">No cover letter generated yet. Click "Gen Cover Letter" to create one.</p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => { setSelectedApplication(null); setCoverLetterContent(''); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Close</button>
                                <button onClick={() => { setCurrentApplicationForm(selectedApplication); setShowAddApplicationModal(true); setSelectedApplication(null); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">Edit Application</button>
                                <button onClick={() => { if (window.confirm('Are you sure you want to delete this application?')) { apiDeleteJobApplication(selectedApplication.id); setJobApplications(prev => prev.filter(app => app.id !== selectedApplication.id)); setSelectedApplication(null); setCoverLetterContent(''); } }} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white">Delete</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderSkillGapSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Skill Gap Analysis & Learning Paths</h2>
            <Card title="Analyze Skills">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Target Roles or Job Description (e.g., "Senior React Developer", "Manager")</span>
                        <textarea
                            value={skillGapTarget}
                            onChange={e => setSkillGapTarget(e.target.value)}
                            className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm"
                            placeholder="Enter target roles or paste a job description here..."
                        />
                    </label>
                    <div className="text-center">
                        <button
                            onClick={handleAnalyzeSkills}
                            disabled={isAnalyzingSkills || !userProfile || !ValidationUtils.isNotNullOrEmpty(skillGapTarget)}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50"
                        >
                            {isAnalyzingSkills ? 'Analyzing...' : 'Perform Skill Gap Analysis'}
                        </button>
                    </div>
                </div>
            </Card>

            {isAnalyzingSkills && <p className="text-gray-400">Analyzing skills...</p>}
            {skillGaps.length > 0 && (
                <Card title="Skill Gap Results">
                    <div className="space-y-4">
                        {skillGaps.map((skill, i) => (
                            <div key={i} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{skill.skill} <span className="text-xs text-gray-400 ml-2">({skill.category})</span></h3>
                                <p className="text-sm text-gray-300 mt-1">Current Level: {skill.currentLevel}/5 | Target Level: {skill.targetLevel}/5 | Gap: <span className={`${skill.gap > 0 ? 'text-red-400' : 'text-green-400'}`}>{skill.gap}</span></p>
                                {skill.gap > 0 && (
                                    <div className="mt-3">
                                        <p className="text-md font-medium text-blue-300">Recommendations to bridge gap:</p>
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                            {skill.recommendations.map((rec, idx) => (
                                                <li key={rec.id || idx} className="text-sm text-gray-300">
                                                    <a href={rec.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                        {rec.title} ({rec.type})
                                                    </a> - {rec.provider} ({rec.cost}, {rec.estimatedTime}) [Difficulty: {rec.difficulty}]
                                                    <p className="text-xs text-gray-500 ml-4">{TextUtils.truncate(rec.description, 100)}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <h3 className="text-xl font-bold text-white mt-8">Career Path Recommendations</h3>
            <Card title="Generate Career Paths">
                <p className="text-gray-400 mb-4">Leverage your profile and goals to get AI-powered career path suggestions.</p>
                <div className="text-center">
                    <button
                        onClick={handleGenerateCareerPaths}
                        disabled={isGeneratingCareerPaths || !userProfile}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white disabled:opacity-50"
                    >
                        {isGeneratingCareerPaths ? 'Generating...' : 'Generate Career Paths'}
                    </button>
                    {!userProfile && <p className="text-red-400 mt-2">Please complete your profile first.</p>}
                    {userProfile && careerGoals.length === 0 && <p className="text-yellow-400 mt-2">Add some career goals for better recommendations!</p>}
                </div>
            </Card>

            {isGeneratingCareerPaths && <p className="text-gray-400">Generating career paths...</p>}
            {careerPaths.length > 0 && (
                <Card title="Recommended Career Paths">
                    <div className="space-y-6">
                        {careerPaths.map((path, i) => (
                            <div key={path.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-xl font-semibold text-green-400">{path.role} <span className="text-sm text-gray-400">({path.industry})</span></h3>
                                <p className="text-sm text-gray-300 mt-2">{path.description}</p>
                                <p className="text-sm text-gray-300">Salary Range: {path.averageSalaryRange}</p>
                                <p className="text-sm text-gray-300">Growth Outlook: <span className={`${path.growthOutlook === 'Very High' ? 'text-green-500' : path.growthOutlook === 'High' ? 'text-yellow-500' : 'text-gray-400'}`}>{path.growthOutlook}</span></p>

                                <div className="mt-4">
                                    <p className="font-semibold text-white">Required Skills:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-300 ml-2">
                                        {path.requiredSkills.map((s, idx) => (
                                            <li key={idx}>{s.skill} ({s.category}, Level {s.level}/5)</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-4">
                                    <p className="font-semibold text-white">Pathways to achieve:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-300 ml-2">
                                        {path.pathways.map((p, idx) => (
                                            <li key={idx}><a href={ValidationUtils.isValidUrl(p.resource) ? p.resource : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{p.title}</a> ({p.type})</li>
                                        ))}
                                    </ul>
                                </div>
                                {path.potentialMentors && path.potentialMentors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold text-white">Potential Mentor Types:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-300 ml-2">
                                            {path.potentialMentors.map((m, idx) => <li key={idx}>{m}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {path.typicalCompanies && path.typicalCompanies.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold text-white">Typical Companies:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-300 ml-2">
                                            {path.typicalCompanies.map((c, idx) => <li key={idx}>{c}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            <Card title="Your Learning Resources">
                {learningResources.length === 0 ? (
                    <p className="text-gray-400">No learning resources yet. Analyze your skills or career paths to get recommendations.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {learningResources.map(resource => (
                            <div key={resource.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{resource.title}</h3>
                                <p className="text-sm text-gray-300 mt-1">{TextUtils.truncate(resource.description, 120)}</p>
                                <p className="text-xs text-gray-400">Type: {resource.type} | Cost: {resource.cost} | Est. Time: {resource.estimatedTime}</p>
                                <p className="text-xs text-gray-500">Provider: {resource.provider} | Difficulty: {resource.difficulty}</p>
                                {resource.link && (
                                    <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm mt-2 block">Access Resource</a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );

    const renderInterviewPrepSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Interview Preparation</h2>
            <Card title="Your Interview Sessions">
                <div className="space-y-4">
                    {interviewSessions.length === 0 && <p className="text-gray-400">No interview sessions recorded. Start one from your applications!</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {interviewSessions.map(session => (
                            <div key={session.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{session.role} at {session.company}</h3>
                                <p className="text-sm text-gray-400">Date: {DateUtils.formatDate(session.sessionDate)}</p>
                                <p className="text-sm text-gray-400">Type: {session.stageType}</p>
                                <p className="text-sm text-gray-400">Overall Score: <span className={`${session.score > 70 ? 'text-green-400' : session.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{session.score}/100</span></p>
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => { setSelectedInterviewSession(session); setCurrentInterviewQuestions(session.questionsAsked.map(q => ({ question: q.question, userAnswer: q.userAnswer }))); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">View Feedback</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {selectedInterviewSession && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={`Interview for ${selectedInterviewSession.role} at ${selectedInterviewSession.company}`} className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-6 text-white">
                            <h3 className="text-xl font-bold">Overall Feedback: <span className={`${selectedInterviewSession.score > 70 ? 'text-green-400' : selectedInterviewSession.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>{selectedInterviewSession.score}/100</span></h3>
                            <p className="text-gray-300">{selectedInterviewSession.overallFeedback}</p>

                            {selectedInterviewSession.strengths.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-green-400">Strengths:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {selectedInterviewSession.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                            {selectedInterviewSession.areasForImprovement.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-red-400">Areas for Improvement:</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-300">
                                        {selectedInterviewSession.areasForImprovement.map((a, i) => <li key={i}>{a}</li>)}
                                    </ul>
                                </div>
                            )}

                            <h3 className="text-xl font-bold mt-6">Question-by-Question Analysis:</h3>
                            <div className="space-y-4">
                                {selectedInterviewSession.questionsAsked.map((qa, i) => (
                                    <div key={i} className="p-3 bg-gray-800 rounded-lg">
                                        <p className="font-semibold text-cyan-400">Q: {qa.question}</p>
                                        <p className="text-sm text-gray-400 mt-1">Your Answer:</p>
                                        <pre className="text-sm text-gray-200 whitespace-pre-wrap">{qa.userAnswer}</pre>
                                        <p className="text-sm text-gray-400 mt-2">AI Feedback (Score: {qa.score}/10):</p>
                                        <pre className="text-sm text-gray-200 whitespace-pre-wrap">{qa.aiFeedback}</pre>
                                    </div>
                                ))}
                            </div>

                            {selectedInterviewSession.score === 0 && ( // Allow re-submission if no feedback received yet
                                <>
                                    <h3 className="text-xl font-bold mt-6">Continue Interview Simulation:</h3>
                                    <div className="space-y-4">
                                        {currentInterviewQuestions.map((q, i) => (
                                            <div key={i} className="p-3 bg-gray-800 rounded-lg">
                                                <label className="block">
                                                    <span className="text-cyan-400 font-semibold">Question {i + 1}: {q.question}</span>
                                                    <textarea
                                                        value={q.userAnswer}
                                                        onChange={e => {
                                                            const newQuestions = [...currentInterviewQuestions];
                                                            newQuestions[i] = { ...newQuestions[i], userAnswer: e.target.value };
                                                            setCurrentInterviewQuestions(newQuestions);
                                                        }}
                                                        className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm mt-1"
                                                        placeholder="Type your answer here..."
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-6">
                                        <button
                                            onClick={handleSubmitInterviewAnswers}
                                            disabled={isSubmittingAnswers || currentInterviewQuestions.some(q => !ValidationUtils.isNotNullOrEmpty(q.userAnswer))}
                                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50"
                                        >
                                            {isSubmittingAnswers ? 'Submitting Answers...' : 'Get AI Feedback'}
                                        </button>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-end mt-4">
                                <button onClick={() => setSelectedInterviewSession(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Close</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderMarketTrendsSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Market Trends & Insights</h2>
            <Card title="Fetch Latest Trends">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Industry</span>
                        <input
                            type="text"
                            value={marketTrendIndustry}
                            onChange={e => setMarketTrendIndustry(e.target.value)}
                            className="w-full bg-gray-900/50 p-2 rounded text-sm"
                            placeholder="e.g., Technology, Healthcare, Finance"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Keywords (comma-separated, optional)</span>
                        <input
                            type="text"
                            value={marketTrendKeywords}
                            onChange={e => setMarketTrendKeywords(e.target.value)}
                            className="w-full bg-gray-900/50 p-2 rounded text-sm"
                            placeholder="e.g., AI, Remote Work, Sustainability"
                        />
                    </label>
                    <div className="text-center">
                        <button
                            onClick={handleFetchMarketTrends}
                            disabled={isFetchingMarketTrends || !ValidationUtils.isNotNullOrEmpty(marketTrendIndustry)}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white disabled:opacity-50"
                        >
                            {isFetchingMarketTrends ? 'Fetching...' : 'Get Market Trends'}
                        </button>
                    </div>
                </div>
            </Card>

            {isFetchingMarketTrends && <p className="text-gray-400">Fetching market trends...</p>}
            {marketTrends.length > 0 && (
                <Card title="Current Market Insights">
                    <div className="space-y-4">
                        {marketTrends.map(trend => (
                            <div key={trend.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{trend.title}</h3>
                                <p className="text-sm text-gray-300 mt-1">{trend.description}</p>
                                <p className="text-sm text-gray-400 mt-2"><strong>Impact on Career:</strong> {trend.impactOnCareer}</p>
                                <p className="text-xs text-gray-500">Relevant Skills: {trend.relevantSkills.join(', ')}</p>
                                <p className="text-xs text-gray-500">Source: {trend.source} ({DateUtils.formatDate(trend.date)})</p>
                                {trend.suggestedActions && trend.suggestedActions.length > 0 && (
                                    <div className="mt-2">
                                        <p className="font-semibold text-blue-300">Suggested Actions:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-300 ml-2">
                                            {trend.suggestedActions.map((action, idx) => <li key={idx}>{action}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    const renderSalaryNegotiationSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Salary Negotiation Assistant</h2>
            <Card title="Generate Negotiation Script">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Job Title</span>
                        <input type="text" value={negotiationJobTitle} onChange={e => setNegotiationJobTitle(e.target.value)} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Company</span>
                        <input type="text" value={negotiationCompany} onChange={e => setNegotiationCompany(e.target.value)} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Initial Offer ($)</span>
                        <input type="number" value={negotiationInitialOffer} onChange={e => setNegotiationInitialOffer(parseFloat(e.target.value) || 0)} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Desired Salary ($)</span>
                        <input type="number" value={negotiationDesiredSalary} onChange={e => setNegotiationDesiredSalary(parseFloat(e.target.value) || 0)} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                    </label>
                    <div className="text-center">
                        <button
                            onClick={handleGenerateNegotiationScript}
                            disabled={isGeneratingNegotiationScript || !userProfile || negotiationDesiredSalary <= negotiationInitialOffer || !ValidationUtils.isNotNullOrEmpty(negotiationJobTitle)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white disabled:opacity-50"
                        >
                            {isGeneratingNegotiationScript ? 'Generating...' : 'Generate Negotiation Script'}
                        </button>
                    </div>
                </div>
            </Card>

            {isGeneratingNegotiationScript && <p className="text-gray-400">Generating script...</p>}
            {negotiationScript && (
                <Card title="Suggested Negotiation Script">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap p-3 bg-gray-900/50 rounded-lg">{negotiationScript}</pre>
                    <button onClick={() => navigator.clipboard.writeText(negotiationScript)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm">Copy to Clipboard</button>
                </Card>
            )}
        </div>
    );

    const renderPersonalBrandingSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Personal Branding & LinkedIn Optimization</h2>
            <Card title="Optimize LinkedIn Summary">
                <p className="text-gray-400 mb-4">Generate a professional and keyword-rich LinkedIn summary based on your profile and desired roles.</p>
                <div className="text-center">
                    <button
                        onClick={handleOptimizeLinkedIn}
                        disabled={isOptimizingLinkedIn || !userProfile || userProfile.desiredRoles.length === 0}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white disabled:opacity-50"
                    >
                        {isOptimizingLinkedIn ? 'Optimizing...' : 'Optimize LinkedIn Summary'}
                    </button>
                    {!userProfile && <p className="text-red-400 mt-2">Please complete your profile first.</p>}
                    {userProfile && userProfile.desiredRoles.length === 0 && <p className="text-yellow-400 mt-2">Add desired roles to your profile for better optimization.</p>}
                </div>
            </Card>

            {isOptimizingLinkedIn && <p className="text-gray-400">Optimizing LinkedIn summary...</p>}
            {linkedInSummary && (
                <Card title="Optimized LinkedIn Summary">
                    <pre className="text-sm text-gray-200 whitespace-pre-wrap p-3 bg-gray-900/50 rounded-lg">{linkedInSummary}</pre>
                    <button onClick={() => navigator.clipboard.writeText(linkedInSummary)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm">Copy to Clipboard</button>
                </Card>
            )}

            <Card title="Personal Brand Statement Generator">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Desired Impact / Perception</span>
                        <textarea
                            value={brandStatementDesiredImpact}
                            onChange={e => setBrandStatementDesiredImpact(e.target.value)}
                            className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm"
                            placeholder="e.g., 'Become a recognized innovator in sustainable technology', 'Be seen as a compassionate and effective leader'"
                        />
                    </label>
                    <div className="text-center">
                        <button
                            onClick={handleGenerateBrandStatement}
                            disabled={isGeneratingBrandStatement || !userProfile || !ValidationUtils.isNotNullOrEmpty(brandStatementDesiredImpact)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white disabled:opacity-50"
                        >
                            {isGeneratingBrandStatement ? 'Generating...' : 'Generate Brand Statement'}
                        </button>
                    </div>
                </div>
            </Card>
            {isGeneratingBrandStatement && <p className="text-gray-400">Generating personal brand statement...</p>}
            {personalBrandStatement && (
                <Card title="Your Personal Brand Statement">
                    <div className="space-y-2">
                        <p className="text-lg font-semibold text-cyan-300">"{personalBrandStatement.statement}"</p>
                        <p className="text-sm text-gray-300"><strong>Rationale:</strong> {personalBrandStatement.rationale}</p>
                        <p className="text-xs text-gray-400"><strong>Keywords:</strong> {personalBrandStatement.keywords.join(', ')}</p>
                        <p className="text-xs text-gray-500">Generated: {DateUtils.formatDateTime(personalBrandStatement.generatedDate)} (Version: {personalBrandStatement.version})</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(personalBrandStatement.statement)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm">Copy to Clipboard</button>
                </Card>
            )}
        </div>
    );

    const renderPerformanceReviewSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Performance Review Assistant</h2>
            <Card title="Prepare Performance Review Points">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Your Achievements (one per line, raw descriptions)</span>
                        <textarea
                            value={performanceAchievements}
                            onChange={e => setPerformanceAchievements(e.target.value)}
                            className="w-full h-48 bg-gray-900/50 p-2 rounded text-sm"
                            placeholder="e.g., Implemented new feature X. Helped team with project Y. Improved efficiency of process Z."
                        />
                    </label>
                    <div className="text-center">
                        <button
                            onClick={handlePreparePerformanceReview}
                            disabled={isPreparingReview || !userProfile || !ValidationUtils.isNotNullOrEmpty(performanceAchievements)}
                            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white disabled:opacity-50"
                        >
                            {isPreparingReview ? 'Preparing...' : 'Generate Review Points'}
                        </button>
                    </div>
                </div>
            </Card>

            {isPreparingReview && <p className="text-gray-400">Generating review points...</p>}
            {performanceReviewPoints.length > 0 && (
                <Card title="Suggested Performance Review Points">
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-200 p-3 bg-gray-900/50 rounded-lg">
                        {performanceReviewPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                        ))}
                    </ul>
                    <button onClick={() => navigator.clipboard.writeText(performanceReviewPoints.join('\n'))} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm">Copy to Clipboard</button>
                </Card>
            )}
        </div>
    );

    const renderNetworkingSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Professional Network</h2>
            <div className="text-right">
                <button onClick={() => { setCurrentContactForm({connectionDate: DateUtils.getNowISO().substring(0,10), lastContactDate: DateUtils.getNowISO().substring(0,10), relationshipStrength: 'Professional Connection', tags: []}); setShowAddContactModal(true); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Add New Contact</button>
            </div>
            {networkContacts.length === 0 && !isLoading && <p className="text-gray-400">No network contacts added yet. Start building your network!</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {networkContacts.map(contact => (
                    <Card key={contact.id} title={contact.name}>
                        <p className="text-sm text-gray-300 mb-2">{contact.role} at {contact.company}</p>
                        <p className="text-xs text-gray-400">Connection Date: {DateUtils.formatDate(contact.connectionDate)}</p>
                        <p className="text-xs text-gray-400">Last Contact: {DateUtils.formatDate(contact.lastContactDate)}</p>
                        <p className="text-xs text-gray-400">Strength: {contact.relationshipStrength}</p>
                        {contact.tags.length > 0 && <p className="text-xs text-gray-400">Tags: {contact.tags.join(', ')}</p>}
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            <button onClick={() => { setSelectedContactForMessage(contact); setNetworkingMessagePurpose(''); setGeneratedNetworkingMessage(''); }} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded">Gen Message</button>
                            <button onClick={() => { setCurrentContactForm(contact); setShowAddContactModal(true); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Edit</button>
                            <button onClick={() => handleDeleteContact(contact.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Contact Modal */}
            {showAddContactModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={currentContactForm.id ? "Edit Network Contact" : "Add New Network Contact"} className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <label className="block">
                                <span className="text-gray-400">Name</span>
                                <input type="text" value={currentContactForm.name || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, name: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Company</span>
                                <input type="text" value={currentContactForm.company || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, company: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Role</span>
                                <input type="text" value={currentContactForm.role || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, role: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Relationship Strength</span>
                                <select value={currentContactForm.relationshipStrength || 'Professional Connection'} onChange={e => setCurrentContactForm({ ...currentContactForm, relationshipStrength: e.target.value as NetworkContact['relationshipStrength'] })} className="w-full bg-gray-900/50 p-2 rounded text-sm">
                                    <option value="Acquaintance">Acquaintance</option>
                                    <option value="Professional Connection">Professional Connection</option>
                                    <option value="Strong Ally">Strong Ally</option>
                                    <option value="Mentor">Mentor</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Last Contact Date</span>
                                <input type="date" value={currentContactForm.lastContactDate ? currentContactForm.lastContactDate.substring(0, 10) : ''} onChange={e => setCurrentContactForm({ ...currentContactForm, lastContactDate: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Follow-up Date (Optional)</span>
                                <input type="date" value={currentContactForm.followUpDate ? currentContactForm.followUpDate.substring(0, 10) : ''} onChange={e => setCurrentContactForm({ ...currentContactForm, followUpDate: e.target.value || null })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Tags (comma-separated)</span>
                                <input type="text" value={currentContactForm.tags?.join(', ') || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">LinkedIn URL</span>
                                <input type="url" value={currentContactForm.linkedInUrl || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, linkedInUrl: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Email</span>
                                <input type="email" value={currentContactForm.email || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, email: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Phone (Optional)</span>
                                <input type="tel" value={currentContactForm.phone || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, phone: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Notes</span>
                                <textarea value={currentContactForm.notes || ''} onChange={e => setCurrentContactForm({ ...currentContactForm, notes: e.target.value })} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm" />
                            </label>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => setShowAddContactModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                                <button onClick={handleAddOrUpdateContact} disabled={isSavingContact} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                                    {isSavingContact ? 'Saving...' : (currentContactForm.id ? 'Update Contact' : 'Add Contact')}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Generate Networking Message Modal */}
            {selectedContactForMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={`Generate Message for ${selectedContactForMessage.name}`} className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <p className="text-gray-300"><strong>Contact:</strong> {selectedContactForMessage.role} at {selectedContactForMessage.company}</p>
                            <label className="block">
                                <span className="text-gray-400">Purpose of Message</span>
                                <textarea
                                    value={networkingMessagePurpose}
                                    onChange={e => setNetworkingMessagePurpose(e.target.value)}
                                    className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm"
                                    placeholder="e.g., 'Request an informational interview', 'Ask for a job referral for role X', 'Reconnect and share industry insights'"
                                />
                            </label>
                            <div className="text-center">
                                <button
                                    onClick={handleGenerateNetworkingMessage}
                                    disabled={isGeneratingNetworkingMessage || !userProfile || !ValidationUtils.isNotNullOrEmpty(networkingMessagePurpose)}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50"
                                >
                                    {isGeneratingNetworkingMessage ? 'Generating...' : 'Generate Message'}
                                </button>
                            </div>
                            {generatedNetworkingMessage && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-white">Generated Message:</h4>
                                    <pre className="text-sm text-gray-200 whitespace-pre-wrap p-3 bg-gray-900/50 rounded-lg">{generatedNetworkingMessage}</pre>
                                    <button onClick={() => navigator.clipboard.writeText(generatedNetworkingMessage)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm">Copy to Clipboard</button>
                                </div>
                            )}
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => { setSelectedContactForMessage(null); setNetworkingMessagePurpose(''); setGeneratedNetworkingMessage(''); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Close</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderProjectsSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Personal Projects</h2>
            <div className="text-right">
                <button onClick={() => { setCurrentProjectForm({startDate: DateUtils.getNowISO().substring(0,10), status: 'Idea', skillsDeveloped: [], technologiesUsed: [], goalIds: []}); setShowAddProjectModal(true); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white">Add New Project</button>
            </div>
            {personalProjects.length === 0 && !isLoading && <p className="text-gray-400">No personal projects added yet. Start building your portfolio!</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalProjects.map(project => (
                    <Card key={project.id} title={project.title}>
                        <p className="text-sm text-gray-300 mb-2">{TextUtils.truncate(project.description, 100)}</p>
                        <p className="text-xs text-gray-400">Status: {project.status}</p>
                        <p className="text-xs text-gray-400">Started: {DateUtils.formatDate(project.startDate)}</p>
                        {project.skillsDeveloped.length > 0 && <p className="text-xs text-gray-400">Skills: {TextUtils.truncate(project.skillsDeveloped.join(', '), 60)}</p>}
                        {project.technologiesUsed.length > 0 && <p className="text-xs text-gray-400">Tech: {TextUtils.truncate(project.technologiesUsed.join(', '), 60)}</p>}
                        <div className="mt-4 flex flex-wrap gap-2 justify-end">
                            {project.repositoryLink && <a href={project.repositoryLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Repo</a>}
                            {project.demoLink && <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">Demo</a>}
                            <button onClick={() => { setCurrentProjectForm(project); setShowAddProjectModal(true); }} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded">Edit</button>
                            <button onClick={() => handleDeleteProject(project.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded">Delete</button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add/Edit Project Modal */}
            {showAddProjectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card title={currentProjectForm.id ? "Edit Personal Project" : "Add New Personal Project"} className="max-w-xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="space-y-4 text-white">
                            <label className="block">
                                <span className="text-gray-400">Title</span>
                                <input type="text" value={currentProjectForm.title || ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, title: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Description</span>
                                <textarea value={currentProjectForm.description || ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, description: e.target.value })} className="w-full h-24 bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Status</span>
                                <select value={currentProjectForm.status || 'Idea'} onChange={e => setCurrentProjectForm({ ...currentProjectForm, status: e.target.value as PersonalProject['status'] })} className="w-full bg-gray-900/50 p-2 rounded text-sm">
                                    <option value="Idea">Idea</option>
                                    <option value="Planning">Planning</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Start Date</span>
                                <input type="date" value={currentProjectForm.startDate ? currentProjectForm.startDate.substring(0, 10) : ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, startDate: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">End Date (Optional)</span>
                                <input type="date" value={currentProjectForm.endDate ? currentProjectForm.endDate.substring(0, 10) : ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, endDate: e.target.value || undefined })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Skills Developed (comma-separated)</span>
                                <input type="text" value={currentProjectForm.skillsDeveloped?.join(', ') || ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, skillsDeveloped: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Technologies Used (comma-separated)</span>
                                <input type="text" value={currentProjectForm.technologiesUsed?.join(', ') || ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, technologiesUsed: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Repository Link (e.g., GitHub)</span>
                                <input type="url" value={currentProjectForm.repositoryLink || ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, repositoryLink: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Demo Link (Optional)</span>
                                <input type="url" value={currentProjectForm.demoLink || ''} onChange={e => setCurrentProjectForm({ ...currentProjectForm, demoLink: e.target.value })} className="w-full bg-gray-900/50 p-2 rounded text-sm" />
                            </label>
                            <label className="block">
                                <span className="text-gray-400">Related Career Goals (select all that apply)</span>
                                <select multiple value={currentProjectForm.goalIds || []} onChange={e => {
                                    const options = Array.from(e.target.selectedOptions, option => option.value);
                                    setCurrentProjectForm({ ...currentProjectForm, goalIds: options });
                                }} className="w-full h-32 bg-gray-900/50 p-2 rounded text-sm custom-scroll">
                                    {careerGoals.map(goal => (
                                        <option key={goal.id} value={goal.id}>{goal.title}</option>
                                    ))}
                                </select>
                            </label>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={() => setShowAddProjectModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">Cancel</button>
                                <button onClick={handleAddOrUpdateProject} disabled={isSavingProject} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white disabled:opacity-50">
                                    {isSavingProject ? 'Saving...' : (currentProjectForm.id ? 'Update Project' : 'Add Project')}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <Card title="Generate Project Ideas">
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-400">Skills to Develop (comma-separated, e.g., "React, Node.js, AWS")</span>
                        <input
                            type="text"
                            value={projectIdeaSkills}
                            onChange={e => setProjectIdeaSkills(e.target.value)}
                            className="w-full bg-gray-900/50 p-2 rounded text-sm"
                            placeholder="Enter skills you want to practice..."
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-400">Relate to Career Goal (Optional)</span>
                        <select
                            value={projectIdeaGoalId}
                            onChange={e => setProjectIdeaGoalId(e.target.value)}
                            className="w-full bg-gray-900/50 p-2 rounded text-sm"
                        >
                            <option value="">-- Select a Goal --</option>
                            {careerGoals.map(goal => (
                                <option key={goal.id} value={goal.id}>{goal.title}</option>
                            ))}
                        </select>
                    </label>
                    <div className="text-center">
                        <button
                            onClick={handleSuggestProjectIdeas}
                            disabled={isSuggestingProjectIdeas || !userProfile || !ValidationUtils.isNotNullOrEmpty(projectIdeaSkills)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50"
                        >
                            {isSuggestingProjectIdeas ? 'Generating Ideas...' : 'Suggest Project Ideas'}
                        </button>
                    </div>
                </div>
            </Card>

            {isSuggestingProjectIdeas && <p className="text-gray-400">Generating project ideas...</p>}
            {suggestedProjectIdeas.length > 0 && (
                <Card title="Suggested Project Ideas">
                    <div className="space-y-4">
                        {suggestedProjectIdeas.map((idea, i) => (
                            <div key={i} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
                                <p className="text-sm text-gray-300 mt-1">{idea.description}</p>
                                <p className="text-xs text-gray-400 mt-2"><strong>Skills:</strong> {idea.skillsDeveloped.join(', ')}</p>
                                <p className="text-xs text-gray-400"><strong>Technologies:</strong> {idea.technologiesUsed.join(', ')}</p>
                                <button onClick={() => { setCurrentProjectForm(idea); setShowAddProjectModal(true); }} className="mt-3 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded">Add to My Projects</button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );

    const renderMentorshipSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Mentorship Program</h2>
            <Card title="Find a Mentor">
                <p className="text-gray-400 mb-4">Let our AI match you with suitable mentors based on your profile and goals.</p>
                <div className="text-center">
                    <button
                        onClick={handleMatchMentors}
                        disabled={isMatchingMentors || !userProfile}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
                    >
                        {isMatchingMentors ? 'Matching...' : 'Find My Mentors'}
                    </button>
                </div>
            </Card>

            {isMatchingMentors && <p className="text-gray-400">Searching for mentor matches...</p>}
            {matchedMentors.length > 0 && (
                <Card title="Recommended Mentors">
                    <div className="space-y-4">
                        {matchedMentors.map(mentor => (
                            <div key={mentor.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h3 className="text-lg font-semibold text-white">{mentor.name} <span className="text-sm text-gray-400 ml-2">({mentor.currentRole})</span></h3>
                                <p className="text-sm text-gray-300 mt-1">{mentor.industry} - {mentor.yearsExperience} Years Exp.</p>
                                <p className="text-xs text-gray-400">Specialties: {mentor.specialties.join(', ')}</p>
                                <p className="text-xs text-gray-500">Bio: {TextUtils.truncate(mentor.bio, 150)}</p>
                                <div className="mt-3 flex flex-wrap gap-2 justify-end">
                                    {mentor.linkedInUrl && <a href={mentor.linkedInUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded">LinkedIn</a>}
                                    <button onClick={() => { setCurrentSessionMentorId(mentor.id); setCurrentSessionTopic('');