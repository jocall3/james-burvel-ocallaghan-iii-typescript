// types/ai.ts
import { WeaverStage } from './ui';

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  chartData?: { name: string; value: number }[];
}

export interface AIQuestion {
    id: string;
    question: string;
    category: string;
}

export interface QuantumWeaverState {
    stage: WeaverStage;
    businessPlan: string;
    feedback: string;
    questions: AIQuestion[];
    loanAmount: number;
    coachingPlan: AIPlan | null;
    error: string | null;
}

export interface AIPlanStep {
    title: string;
    description: string;
    timeline: string;
}

export interface AIPlan {
    title: string;
    summary: string;
    steps: AIPlanStep[];
}

export interface AIGoalPlanStep {
    title: string;
    description: string;
    category: 'Savings' | 'Budgeting' | 'Investing' | 'Income';
}

export interface AIGoalPlan {
    feasibilitySummary: string;
    monthlyContribution: number;
    steps: AIGoalPlanStep[];
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  aiJustification: string;
}

export interface DetectedSubscription {
  name: string;
  estimatedAmount: number;
  lastCharged: string;
}

export interface MLModel {
    id: string;
    name: string;
    version: number;
    accuracy: number;
    status: 'Production' | 'Staging' | 'Archived' | 'Training';
    lastTrained: string;
    performanceHistory: { date: string; accuracy: number }[];
}