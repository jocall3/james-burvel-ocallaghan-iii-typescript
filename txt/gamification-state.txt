// types/models/gamification/gamification-state.ts
export interface GamificationState {
    score: number;
    level: number;
    levelName: string;
    progress: number; // Percentage to next level
    credits: number;
}