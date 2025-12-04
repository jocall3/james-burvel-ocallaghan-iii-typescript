// types/models/personal/loan.ts
export interface Loan {
  id: string;
  name: string;
  outstandingBalance: number;
  monthlyPayment: number;
  nextPaymentDate: string;
}