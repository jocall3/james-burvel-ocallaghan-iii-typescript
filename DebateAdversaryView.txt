import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// --- Data Models and Interfaces (Expanded) ---

/**
 * Represents a single turn in the debate. Expanded with more details for a real application.
 */
export interface DebateTurn {
  id: string; // Unique ID for the turn
  speaker: 'USER' | 'AI';
  text: string;
  timestamp: number; // Unix timestamp
  fallaciesDetected: FallacyDetectionResult[]; // Array of detected fallacies
  argumentStrengthScore?: number; // AI's assessment of argument strength (0-100)
  counterArgumentSuggestions?: string[]; // AI's suggestions for user
  sentimentScore?: { positive: number; neutral: number; negative: number }; // AI's sentiment analysis
  citedSources?: { url: string; title: string }[]; // Mock cited sources
  userFeedback?: { rating: number; comment: string }; // User feedback on AI turn
  aiResponseMetadata?: AIResponseMetadata; // Additional AI response metadata
  voiceClipUrl?: string; // URL to an AI-generated voice response clip
}

/**
 * Detailed information about a detected fallacy.
 */
export interface FallacyDetectionResult {
  fallacyType: string; // e.g., 'Anecdotal Fallacy', 'Ad Hominem'
  description: string; // Brief description of the fallacy instance
  confidence: number; // Confidence score (0-1)
  excerpt: string; // The specific part of the text that exhibits the fallacy
  correctionSuggestion?: string; // How to rephrase to avoid the fallacy
}

/**
 * Interface for AI response metadata, including model details and processing time.
 */
export interface AIResponseMetadata {
  modelUsed: string; // e.g., 'DebateBot-v3.2', 'LogicEngine-v1.0'
  processingTimeMs: number;
  tokensUsed: number;
  costEstimateUSD: number;
  debugInfo?: string; // For advanced debugging
}

/**
 * Represents an AI persona with its specific characteristics and debate strategy.
 */
export interface AIPersona {
  id: string;
  name: string;
  description: string;
  coreBeliefs: string[];
  debateStrategy: 'logical' | 'emotional' | 'sarcastic' | 'academic' | 'persuasive';
  knowledgeDomains: string[]; // e.g., 'Physics', 'Philosophy', 'Economics'
  speechStyle: string; // e.g., 'formal', 'colloquial', 'pedantic'
  avatarUrl: string;
  premiumFeature: boolean; // Indicates if persona is premium
  lastUsed: number; // Unix timestamp of last use
  creationDate: number; // Unix timestamp of creation
  performanceMetrics?: { winRate: number; avgFallaciesDetected: number }; // Simulated performance
  customizableOptions?: {
    tone: 'friendly' | 'neutral' | 'assertive';
    verbosity: 'concise' | 'balanced' | 'verbose';
  };
  specialAbilities?: string[]; // e.g., 'Deep Logic', 'Emotional Appeals', 'Historical Context'
}

/**
 * Represents a user profile, including settings and debate history summaries.
 */
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  settings: UserSettings;
  debateStats: DebateStats;
  favoritePersonas: string[]; // Array of persona IDs
  achievements: string[]; // e.g., 'First Debate Win', 'Master Logician'
  subscriptionTier: 'free' | 'premium' | 'enterprise';
  lastActivity: number;
  joinedDate: number;
}

/**
 * User-specific settings for the application.
 */
export interface UserSettings {
  defaultAIPersonaId: string;
  enableVoiceInput: boolean;
  enableVoiceOutput: boolean;
  autoSaveDebates: boolean;
  notificationPreferences: {
    newFallacyType: boolean;
    debateSummary: boolean;
    aiInsight: boolean;
  };
  theme: 'dark' | 'light';
  language: 'en' | 'es' | 'fr';
  textSize: 'small' | 'medium' | 'large';
  fallacyDetectionLevel: 'low' | 'medium' | 'high';
  argumentStrengthAnalysis: boolean;
  counterArgumentAssistance: boolean;
  aiResponseDelay: 'instant' | 'short' | 'medium' | 'long'; // Simulated delay
  showAIThinkingProcess: boolean; // For debugging/learning
}

/**
 * Aggregated statistics for a user's debates.
 */
export interface DebateStats {
  totalDebates: number;
  wins: number;
  losses: number;
  draws: number;
  avgFallaciesPerDebate: number;
  mostCommonFallacyDetected: string | null;
  longestDebateTurns: number;
  totalDebateTimeSeconds: number;
  favoriteTopics: string[];
  aiPersonaUsage: { [personaId: string]: number }; // Count of debates with each persona
  fallaciesCommitted: { [fallacyType: string]: number }; // Count of fallacies user committed
  fallaciesDetectedInAI: { [fallacyType: string]: number }; // Count of fallacies detected in AI
  averageUserArgumentLength: number;
  averageAIArgumentLength: number;
  lastDebateSummary?: DebateSummary;
}

/**
 * Defines a suggested debate topic.
 */
export interface SuggestedTopic {
  id: string;
  title: string;
  category: string; // e.g., 'Science', 'Politics', 'Ethics', 'Everyday'
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  keywords: string[];
  popularityScore: number;
  lastSuggested: number;
}

/**
 * Debate session configuration.
 */
export interface DebateConfig {
  topic: string;
  aiPersonaId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimitPerTurnSeconds: number | null; // Null for no limit
  fallacyHighlighting: boolean;
  aiAssistanceLevel: 'none' | 'basic' | 'advanced'; // For counter-arg, strength analysis
  voiceOutputEnabled: boolean;
  voiceInputEnabled: boolean;
  maxTurns?: number | null; // Null for no max turns
}

/**
 * Summary of a completed debate.
 */
export interface DebateSummary {
  debateId: string;
  topic: string;
  aiPersonaName: string;
  userFallacies: { fallacyType: string; count: number }[];
  aiFallacies: { fallacyType: string; count: number }[];
  totalTurns: number;
  durationSeconds: number;
  outcome: 'user_win' | 'ai_win' | 'draw' | 'undecided';
  keyInsights: string[];
  userSentimentTrend?: number[]; // Over time
  aiSentimentTrend?: number[]; // Over time
  performanceRating?: number; // 1-5 stars
}

// --- Constants and Global Data Structures (Extensive) ---

/**
 * Comprehensive list of logical fallacies with detailed descriptions and examples.
 * This structure simulates a backend database or a large configuration file.
 */
export const FALLACY_DEFINITIONS: { [key: string]: { name: string; description: string; example: string; types: string[] } } = {
  'Ad Hominem': {
    name: 'Ad Hominem',
    description: 'Attacking the person making the argument, rather than the argument itself.',
    example: "You can't trust anything she says about climate change; she's just a disgruntled former oil executive.",
    types: ['Abusive Ad Hominem', 'Circumstantial Ad Hominem', 'Tu Quoque']
  },
  'Straw Man': {
    name: 'Straw Man',
    description: 'Misrepresenting someone\'s argument to make it easier to attack.',
    example: 'Opponent: "We should relax alcohol laws." Me: "No, any society with unlimited access to intoxicants loses its work ethic and succumbs to hedonism."',
    types: ['Exaggeration', 'Simplification', 'Distortion']
  },
  'Appeal to Authority': {
    name: 'Appeal to Authority',
    description: 'Insisting that a claim is true simply because a valid authority or expert on the issue said it was true, without any other supporting evidence.',
    example: 'My doctor said that all vaccines are harmful, so they must be.',
    types: ['False Authority', 'Irrelevant Authority']
  },
  'Bandwagon Fallacy': {
    name: 'Bandwagon Fallacy',
    description: 'Claiming that something is true or good because many people believe it is.',
    example: 'Everyone is buying this new cryptocurrency, so it must be a good investment.',
    types: []
  },
  'Slippery Slope': {
    name: 'Slippery Slope',
    description: 'Asserting that a relatively small first step will inevitably lead to a chain of related (and often negative) events.',
    example: 'If we allow children to choose their bedtime, soon they\'ll be making all the rules and our household will descend into anarchy.',
    types: []
  },
  'Hasty Generalization': {
    name: 'Hasty Generalization',
    description: 'Making a broad claim based on a small or unrepresentative sample of observations.',
    example: 'My grandfather smoked a pack a day and lived to be 90, so smoking isn\'t bad for you.',
    types: []
  },
  'False Cause': {
    name: 'False Cause',
    description: 'Assuming that because two things happened in sequence, the first caused the second.',
    example: 'Since the new mayor took office, the crime rate has decreased. Clearly, the mayor is responsible for the decrease in crime.',
    types: ['Post Hoc Ergo Propter Hoc', 'Cum Hoc Ergo Propter Hoc']
  },
  'Appeal to Emotion': {
    name: 'Appeal to Emotion',
    description: 'Manipulating an emotional response in place of a valid or compelling argument.',
    example: 'Please don\'t give me a parking ticket, officer. I\'ve had a really terrible day, and this will just make it worse.',
    types: ['Appeal to Pity', 'Appeal to Fear']
  },
  'Red Herring': {
    name: 'Red Herring',
    description: 'Diverting attention from the main issue by introducing an irrelevant topic.',
    example: 'When asked about rising crime rates, the politician replied, "What about the need to protect our children\'s education?"',
    types: []
  },
  'Begging the Question': {
    name: 'Begging the Question',
    description: 'An argument\'s premise assumes the truth of its conclusion.',
    example: 'God exists because the Bible says so, and the Bible is true because it\'s the word of God.',
    types: ['Circular Reasoning']
  },
  'Fallacy of Composition': {
    name: 'Fallacy of Composition',
    description: 'Assuming that what is true for the parts is true for the whole.',
    example: 'Each player on the team is excellent, so the team itself must be excellent.',
    types: []
  },
  'Fallacy of Division': {
    name: 'Fallacy of