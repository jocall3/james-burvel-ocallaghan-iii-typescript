// types/models/ai/ai-plan.ts
import type { AIPlanStep } from './ai-plan-step';

export interface AIPlan {
    title: string;
    summary: string;
    steps: AIPlanStep[];
}