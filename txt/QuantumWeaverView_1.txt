// components/views/platform/QuantumWeaverView.tsx
import React, { useState, useContext, useEffect, useReducer, createContext, useCallback, useRef, useMemo } from 'react';
import { WeaverStage, AIPlan, AIQuestion } from '../../../types';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// NEW: ENHANCED TYPES & INTERFACES FOR A REAL-WORLD APPLICATION
// ================================================================================================

export type KPIKey = 'mrr' | 'cac' | 'ltv' | 'churn' | 'user_growth';

export interface KPI {
    key: KPIKey;
    name: string;
    value: number;
    trend: number; // Percentage change
    unit: 'currency' | 'percentage' | 'integer';
    description: string;
}

export interface CoachingStep extends AIPlan['steps'][0] {
    id: string;
    status: 'pending' | 'in_progress' | 'completed';
    subtasks: { id: string; text: string; completed: boolean }[];
    notes?: string;
}

export interface EnhancedCoachingPlan extends AIPlan {
    steps: CoachingStep[];
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'plato';
    text: string;
    timestamp: number;
    isLoading?: boolean;
}

export interface WeaverState {
    stage: WeaverStage;
    businessPlan: string;
    feedback: string;
    questions: AIQuestion[];
    userAnswers: string[];
    rejectionReason: string | null;
    loanAmount: number;
    coachingPlan: EnhancedCoachingPlan | null;
    kpis: KPI[];
    chatHistory: ChatMessage[];
    error: string | null;
    isStateHydrated: boolean;
}

export type WeaverAction =
    | { type: 'START_ANALYSIS'; payload: { plan: string } }
    | { type: 'ANALYSIS_FAILED'; payload: { error: string } }
    | { type: 'ANALYSIS_SUCCEEDED'; payload: { feedback: string; questions: AIQuestion[] } }
    | { type: 'START_TEST_SUBMISSION'; payload: { answers: string[] } }
    | { type: 'TEST_PASSED'; payload: { loanAmount: number; coachingPlan: AIPlan } }
    | { type: 'TEST_FAILED'; payload: { reason: string } }
    | { type: 'FINALIZATION_FAILED'; payload: { error: string } }
    | { type: 'RETRY_FROM_ERROR' }
    | { type: 'RESET_PROCESS' }
    | { type: 'TOGGLE_COACHING_STEP'; payload: { stepId: string } }
    | { type: 'TOGGLE_SUBTASK'; payload: { stepId: string; subtaskId: string } }
    | { type: 'ADD_CHAT_MESSAGE'; payload: { message: ChatMessage } }
    | { type: 'RECEIVE_CHAT_RESPONSE'; payload: { message: ChatMessage } }
    | { type: 'STREAM_CHAT_RESPONSE'; payload: { messagePart: string } }
    | { type: 'FINISH_CHAT_STREAM' }
    | { type: 'UPDATE_KPIS'; payload: { kpis: KPI[] } }
    | { type: 'HYDRATE_STATE'; payload: { state: Partial<WeaverState> } };

// ================================================================================================
// NEW: MOCK API CLIENT & UTILITIES
// ================================================================================================

export class WeaverAPIClient {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        if (!apiKey) {
            console.error("QuantumWeaver: API key is missing. AI features will be disabled.");
            this.ai = {} as GoogleGenAI; // Avoid crashing the app
        } else {
            this.ai = new GoogleGenAI({ apiKey });
        }
    }

    private async generate(prompt: string, schema: any) {
        if (!this.ai.models) {
             throw new Error("AI Client not initialized. Please check your API key.");
        }
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        return JSON.parse(response.text);
    }

    public async analyzePitch(plan: string) {
        const prompt = `You are Plato, an AI venture capitalist. Analyze this business plan with a critical but encouraging tone. Provide brief initial feedback (2-3 sentences) and 3 insightful follow-up questions for the founder across different domains (e.g., Market, Product, Finance). Plan: "${plan}"`;
        const schema = {
            type: Type.OBJECT, properties: {
                feedback: { type: Type.STRING },
                questions: { type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        question: { type: Type.STRING }, category: { type: Type.STRING }
                    }
                }}
            }
        };
        return this.generate(prompt, schema);
    }
    
    public async evaluateAnswers(plan: string, questions: AIQuestion[], answers: string[]) {
        const qaPairs = questions.map((q, i) => `Q: ${q.question}\nA: ${answers[i]}`).join('\n\n');
        const prompt = `You are Plato, an AI venture capitalist. The founder has submitted a business plan and answered your follow-up questions. Based on their answers, decide if you will fund them. If yes, respond with "APPROVED". If no, provide a concise, constructive reason for rejection (3-4 sentences). \n\nOriginal Plan: "${plan}"\n\n${qaPairs}`;
        const schema = {
            type: Type.OBJECT, properties: {
                decision: { type: Type.STRING, enum: ['APPROVED', 'REJECTED'] },
                reason: { type: Type.STRING }
            }
        };
        return this.generate(prompt, schema);
    }

    public async generateFundingPackage(plan: string) {
        const prompt = `This business plan has been approved for seed funding. Your task is to act as Plato, an AI VC.
1.  Determine an appropriate seed funding amount (between $75,000 and $350,000, in increments of $5000).
2.  Create a detailed 4-step coaching plan. Each step needs a title, a detailed description, a realistic timeline, and 3 actionable subtasks.
Original Plan: "${plan}"`;
        const schema = {
            type: Type.OBJECT, properties: {
                loanAmount: { type: Type.NUMBER },
                coachingPlan: { type: Type.OBJECT, properties: {
                    title: { type: Type.STRING }, summary: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: { 
                            title: { type: Type.STRING }, 
                            description: { type: Type.STRING }, 
                            timeline: { type: Type.STRING },
                            subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }}
                }}
            }
        };
        return this.generate(prompt, schema);
    }
    
    public async getMentorshipAdvice(plan: string, chatHistory: ChatMessage[], userQuery: string) {
        const history = chatHistory.map(m => `${m.sender === 'user' ? 'Founder' : 'Plato'}: ${m.text}`).join('\n');
        const prompt = `You are Plato, an AI business mentor. A founder you've funded needs advice. Provide a helpful, concise, and actionable response.
        
        Original Business Plan: "${plan}"
        
        Conversation History:
        ${history}
        
        Founder's New Question: "${userQuery}"`;
        
        // This is a simple text generation, no JSON schema needed
        if (!this.ai.models) {
             throw new Error("AI Client not initialized.");
        }
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    }
}

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// ================================================================================================
// NEW: ICONS LIBRARY
// ================================================================================================

export const Icon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
    const icons: { [key: string]: JSX.Element } = {
        'check': <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
        'send': <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
        'bulb': <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
        'chart': <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,