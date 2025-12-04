// types/models/ai/ml-model.ts
export interface MLModel {
    id: string;
    name: string;
    version: number;
    accuracy: number;
    status: 'Production' | 'Staging' | 'Archived' | 'Training';
    lastTrained: string;
    performanceHistory: { date: string; accuracy: number }[];
}