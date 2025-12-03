// types/models/personal/linked-account.ts
export interface LinkedAccount {
  id: string; // Institution ID
  name: string;
  mask: string; // Last 4 digits of account number
}