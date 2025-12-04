// types/models/credit/credit-score.ts
export interface CreditScore {
  score: number;
  change: number; // Point change in the last period
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  totalCreditLimit?: number;
  totalCreditUsed?: number;
}