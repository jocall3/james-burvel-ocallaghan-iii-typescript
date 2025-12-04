// types/models/ai/quantum-weaver-state.ts
import type { WeaverStage } from '../ui/weaver-stage';
import type { AIQuestion } from './ai-question';
import type { AIPlan } from './ai-plan';

export interface QuantumWeaverState {
    stage: WeaverStage;
    businessPlan: string;
    feedback: string;
    questions: AIQuestion[];
    loanAmount: number;
    coachingPlan: AIPlan | null;
    error: string | null;
}