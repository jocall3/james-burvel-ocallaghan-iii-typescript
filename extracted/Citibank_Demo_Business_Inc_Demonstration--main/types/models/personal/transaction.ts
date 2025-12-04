// types/models/personal/transaction.ts
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  carbonFootprint?: number; // in kg CO₂
}