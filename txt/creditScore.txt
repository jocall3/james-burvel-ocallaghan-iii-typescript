// data/creditScore.ts

// This is the singular, powerful number that represents the Visionary's standing
// in the traditional financial world. It is a measure of trust, a reflection of
// past promises kept. This data point is the heart of the Credit Health view,
// a critical vital sign for the AI diagnostician to analyze. Its value and rating
// are set to be strong but not perfect, providing an immediate opportunity for
// the AI to offer meaningful advice for improvement.

import type { CreditScore } from '../types';

/**
 * @description An object containing the user's mock credit score information.
 * It includes the numerical score, the recent change in points, and a qualitative
 * rating. This data is central to the Credit Health view and the Credit Score
 * Monitor widget on the Dashboard.
 */
export const MOCK_CREDIT_SCORE: CreditScore = {
    score: 780,
    change: 5,
    rating: 'Excellent',
};
