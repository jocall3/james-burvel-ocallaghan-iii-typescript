// components/views/personal/CreditHealthView.tsx
import React, { useContext, useState, useEffect, useMemo, useCallback, useRef, Fragment } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, Sector, AreaChart, Area } from 'recharts';

// SECTION 1: ENHANCED TYPES AND INTERFACES
// =================================================================================================
// These types represent a comprehensive data model for a real-world credit health application.

/**
 * Defines the structure for a payment status in a payment history grid.
 */
export type PaymentStatus = 'OK' | '30' | '60' | '90' | '120+' | 'CO' | 'ND' | null;

/**
 * Represents a single month's payment history for a credit account.
 */
export interface PaymentHistoryEntry {
  month: string; // e.g., "Jan 2023"
  status: PaymentStatus;
}

/**
 * Enumeration of credit account types.
 */
export enum AccountType {
  CreditCard = 'Credit Card',
  Mortgage = 'Mortgage',
  AutoLoan = 'Auto Loan',
  StudentLoan = 'Student Loan',
  PersonalLoan = 'Personal Loan',
  LineOfCredit = 'Line of Credit',
  Collection = 'Collection Account',
  Other = 'Other'
}

/**
 * Represents a single credit account on a credit report.
 */
export interface CreditAccount {
  id: string;
  creditorName: string;
  accountNumber: string; // Masked
  type: AccountType;
  dateOpened: string;
  dateClosed?: string | null;
  status: 'Open' | 'Closed' | 'In Collection';
  balance: number;
  creditLimit?: number | null;
  monthlyPayment: number;
  paymentHistory: PaymentHistoryEntry[];
  highBalance: number;
  terms: string; // e.g., "36 months"
  responsibility: 'Individual' | 'Joint';
}

/**
 * Enumeration for types of credit inquiries.
 */
export enum InquiryType {
  Hard = 'Hard',
  Soft = 'Soft'
}

/**
 * Represents a credit inquiry on a report.
 */
export interface CreditInquiry {
  id: string;
  inquiryDate: string;
  creditorName: string;
  type: InquiryType;
}

/**
 * Enumeration for types of public records.
 */
export enum PublicRecordType {
  Bankruptcy = 'Bankruptcy',
  TaxLien = 'Tax Lien',
  CivilJudgment = 'Civil Judgment'
}

/**
 * Represents a public record on a credit report.
 */
export interface PublicRecord {
  id: string;
  recordDate: string;
  type: PublicRecordType;
  description: string;
  status: 'Filed' | 'Released' | 'Discharged';
}

/**
 * Represents the user's personal information on file.
 */
export interface PersonalInformation {
  name: string;
  currentAddress: string;
  previousAddresses: string[];
  employers: string[];
}

/**
 * The complete, detailed credit report structure.
 */
export interface FullCreditReport {
  reportDate: string;
  creditAccounts: CreditAccount[];
  creditInquiries: CreditInquiry[];
  publicRecords: PublicRecord[];
  personalInformation: PersonalInformation;
}

/**
 * Historical data point for credit score trends.
 */
export interface CreditScoreHistoryPoint {
  date: string; // "YYYY-MM"
  score: number;
}

/**
 * Defines the structure for a credit monitoring alert.
 */
export interface CreditAlert {
  id: string;
  date: string;
  severity: 'High' | 'Medium' | 'Low';
  category: 'New Account' | 'New Inquiry' | 'Address Change' | 'Late Payment' | 'High Utilization' | 'Public Record' | 'Fraud Alert';
  title: string;
  description: string;
  isRead: boolean;
}

/**
 * Scenarios available for the credit score simulator.
 */
export enum SimulationActionType {
  PayDownBalance = 'Pay down a credit card balance',
  GetNewCreditCard = 'Get a new credit card',
  GetNewLoan = 'Get a new loan',
  MissAPayment = 'Miss a payment',
  CloseOldestAccount = 'Close your oldest account',
  IncreaseCreditLimit = 'Get a credit limit increase'
}

/**
 * Represents a scenario to be run through the simulator.
 */
export interface SimulationScenario {
  action: SimulationActionType;
  amount?: number; // For balance paydown, new loan amount, etc.
  creditLimit?: number; // For new credit card
}

/**
 * The result of a credit score simulation.
 */
export interface SimulationResult {
  originalScore: number;
  projectedScore: number;
  scoreChange: number;
  analysis: string;
  impactedFactors: { name: string; impact: 'Positive' | 'Negative' | 'Neutral' }[];
}

/**
 * Structure for educational content articles.
 */
export interface EducationalArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: React.ReactNode;
}

/**
 * Structure for glossary terms.
 */
export interface GlossaryTerm {
    term: string;
    definition: string;
}

/**
 * Represents the full data context for the credit health view, extending the original context.
 */
export interface EnhancedCreditHealthData {
  fullReport: FullCreditReport;
  scoreHistory: CreditScoreHistoryPoint[];
  alerts: CreditAlert[];
}

// SECTION 2: SVG ICON COMPONENTS
// =================================================================================================
// Simple, handcrafted SVG components to avoid adding new library dependencies.

export const IconCreditCard: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 21z" />
    </svg>
);

export const IconHome: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

export const IconCar: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.875m-17.25 4.5h16.5M6 12V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v6" />
    </svg>
);

export const IconEducation: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" />
    </svg>
);

export const IconTrendingUp: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.75-.625m3.75.625V3.375" />
    </svg>
);

export const IconTrendingDown: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-3.75.625m3.75-.625V20.625" />
    </svg>
);

export const IconInfo: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

export const IconAlert: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const IconCheck: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// SECTION 3: UTILITY FUNCTIONS & MOCK DATA GENERATION
// =================================================================================================

/**
 * Formats a number as a currency string.
 * @param amount - The number to format.
 * @returns A string representing the amount in USD.
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Formats a date string into a more readable format.
 * @param dateString - A date string (e.g., "YYYY-MM-DD").
 * @returns A formatted date string (e.g., "Jan 1, 2023").
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC' // Prevent timezone shifts
    });
};

/**
 * Calculates the credit utilization percentage for a single account.
 * @param balance - The current balance.
 * @param creditLimit - The total credit limit.
 * @returns The utilization percentage, or 0 if limit is not applicable.
 */
export const calculateUtilization = (balance: number, creditLimit?: number | null): number => {
    if (!creditLimit || creditLimit === 0) return 0;
    return Math.round((balance / creditLimit) * 100);
};


/**
 * Generates mock historical credit score data for charting.
 * @param baseScore - The current score to work backwards from.
 * @param months - The number of months of history to generate.
 * @returns An array of CreditScoreHistoryPoint objects.
 */
export const generateMockScoreHistory = (baseScore: number, months: number = 24): CreditScoreHistoryPoint[] => {
    const history: CreditScoreHistoryPoint[] = [];
    let currentScore = baseScore;
    const today = new Date();
    for (let i = 0; i < months; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        history.push({ date: dateString, score: currentScore });
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10 change
        currentScore -= change;
        if (currentScore > 850) currentScore = 830 + Math.floor(Math.random() * 20);
        if (currentScore < 300) currentScore = 300 + Math.floor(Math.random() * 20);
    }
    return history.reverse();
};

/**
 * Generates a mock full credit report.
 * @returns A FullCreditReport object.
 */
export const generateMockFullCreditReport = (): FullCreditReport => {
    const generatePaymentHistory = (): PaymentHistoryEntry[] => {
        const history: PaymentHistoryEntry[] = [];
        const statuses: PaymentStatus[] = ['OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', '30', 'CO'];
        for (let i = 0; i < 36; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            history.push({
                month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
                status: Math.random() < 0.95 ? 'OK' : statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        return history.reverse();
    };

    return {
        reportDate: new Date().toISOString().split('T')[0],
        personalInformation: {
            name: "Jane Doe",
            currentAddress: "123 Main St, Anytown, USA 12345",
            previousAddresses: ["456 Oak Ave, Somecity, USA 67890"],
            employers: ["Current: Acme Corp", "Previous: Globex Inc."]
        },
        creditAccounts: [
            { id: 'acc1', creditorName: 'Capital Two', accountNumber: '...1234', type: AccountType.CreditCard, dateOpened: '2018-05-15', status: 'Open', balance: 1250, creditLimit: 5000, monthlyPayment: 50, highBalance: 2500, terms: "Revolving", responsibility: 'Individual', paymentHistory: generatePaymentHistory() },
            { id: 'acc2', creditorName: 'Anytown Mortgage', accountNumber: '...5678', type: AccountType.Mortgage, dateOpened: '2020-02-20', status: 'Open', balance: 250000, monthlyPayment: 1450, highBalance: 265000, terms: "360 months", responsibility: 'Joint', paymentHistory: generatePaymentHistory() },
            { id: 'acc3', creditorName: 'Auto Finance Co', accountNumber: '...9012', type: AccountType.AutoLoan, dateOpened: '2021-07-10', dateClosed: '2023-07-01', status: 'Closed', balance: 0, monthlyPayment: 450, highBalance: 25000, terms: "60 months", responsibility: 'Individual', paymentHistory: generatePaymentHistory() },
            { id: 'acc4', creditorName: 'Federal Student Loans', accountNumber: '...3456', type: AccountType.StudentLoan, dateOpened: '2012-08-30', status: 'Open', balance: 15000, monthlyPayment: 200, highBalance: 22000, terms: "120 months", responsibility: 'Individual', paymentHistory: generatePaymentHistory() },
            { id: 'acc5', creditorName: 'Medical Bill Collectors', accountNumber: '...7890', type: AccountType.Collection, dateOpened: '2022-11-01', status: 'In Collection', balance: 500, monthlyPayment: 0, highBalance: 500, terms: "N/A", responsibility: 'Individual', paymentHistory: [] },
        ],
        creditInquiries: [
            { id: 'inq1', inquiryDate: '2023-09-05', creditorName: 'Big Bank Credit Cards', type: InquiryType.Hard },
            { id: 'inq2', inquiryDate: '2023-03-12', creditorName: 'Car Dealership USA', type: InquiryType.Hard },
            { id: 'inq3', inquiryDate: '2023-10-01', creditorName: 'CreditHealthApp Check', type: InquiryType.Soft },
        ],
        publicRecords: [
            { id: 'pr1', recordDate: '2015-06-20', type: PublicRecordType.Bankruptcy, description: "Chapter 7 Bankruptcy", status: 'Discharged' }
        ]
    };
};

/**
 * Generates mock credit monitoring alerts.
 * @returns An array of CreditAlert objects.
 */
export const generateMockAlerts = (): CreditAlert[] => {
    return [
        { id: 'al1', date: '2023-10-25', severity: 'High', category: 'New Inquiry', title: 'New Hard Inquiry Detected', description: 'A new hard inquiry from "Big Bank Credit Cards" was posted to your credit report. If you did not authorize this, please take action immediately.', isRead: false },
        { id: 'al2', date: '2023-10-22', severity: 'Medium', category: 'High Utilization', title: 'Credit Card Utilization Increased', description: 'Your balance on Capital Two (...1234) increased to $1,250, bringing your utilization on that card to 25%. Overall utilization is now 15%.', isRead: false },
        { id: 'al3', date: '2023-10-15', severity: 'Low', category: 'Address Change', title: 'Address Information Updated', description: 'Your address was updated on your credit report. Please verify this is correct.', isRead: true },
        { id: 'al4', date: '2023-09-01', severity: 'High', category: 'Late Payment', title: '30-Day Late Payment Reported', description: 'A 30-day late payment was reported for your Auto Finance Co account for August 2023. This can significantly impact your score.', isRead: true },
    ];
};

/**
 * A complex, mock credit score simulation engine.
 * In a real application, this logic would live on a secure backend server.
 * This is an extensive simulation for demonstration purposes.
 */
export class CreditScoreSimulatorEngine {
    private baseScore: number;
    private report: FullCreditReport;
    private factors: { name: string, status: 'Excellent' | 'Good' | 'Fair' | 'Poor' }[];

    constructor(baseScore: number, report: FullCreditReport, factors: { name: string, status: 'Excellent' | 'Good' | 'Fair' | 'Poor' }[]) {
        this.baseScore = baseScore;
        this.report = report;
        this.factors = factors;
    }

    /**
     * Calculates the overall credit utilization from the report.
     * @returns A tuple of [totalBalance, totalLimit, utilizationPercentage].
     */
    private calculateOverallUtilization(): [number, number, number] {
        const revolvingAccounts = this.report.creditAccounts.filter(a => a.type === AccountType.CreditCard && a.status === 'Open' && a.creditLimit);
        const totalBalance = revolvingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalLimit = revolvingAccounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0);
        const utilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
        return [totalBalance, totalLimit, utilization];
    }

    /**
     * Calculates the average age of accounts.
     * @returns The average age in years.
     */
    private calculateAverageAgeOfAccounts(): number {
        if (this.report.creditAccounts.length === 0) return 0;
        const totalAgeInMonths = this.report.creditAccounts.reduce((sum, acc) => {
            const openDate = new Date(acc.dateOpened);
            const today = new Date();
            const ageInMonths = (today.getFullYear() - openDate.getFullYear()) * 12 + (today.getMonth() - openDate.getMonth());
            return sum + ageInMonths;
        }, 0);
        return (totalAgeInMonths / this.report.creditAccounts.length) / 12;
    }
    
    /**
     * Finds the oldest account's age.
     * @returns The age of the oldest account in years.
     */
    private findOldestAccountAge(): number {
        if (this.report.creditAccounts.length === 0) return 0;
        const oldestAccount = this.report.creditAccounts.reduce((oldest, current) => {
            return new Date(current.dateOpened) < new Date(oldest.dateOpened) ? current : oldest;
        });
        const openDate = new Date(oldestAccount.dateOpened);
        const today = new Date();
        return ((today.getTime() - openDate.getTime()) / (1000 * 3600 * 24 * 365.25));
    }


    /**
     * Main simulation runner.
     * @param scenario - The simulation scenario to run.
     * @returns A SimulationResult object.
     */
    public runSimulation(scenario: SimulationScenario): SimulationResult {
        let projectedScore = this.baseScore;
        let analysis = "";
        const impactedFactors: SimulationResult['impactedFactors'] = [];

        const [initialBalance, initialLimit, initialUtil] = this.calculateOverallUtilization();
        const initialAvgAge = this.calculateAverageAgeOfAccounts();

        switch (scenario.action) {
            case SimulationActionType.PayDownBalance: {
                const paydownAmount = scenario.amount || 0;
                const newBalance = Math.max(0, initialBalance - paydownAmount);
                const newUtil = initialLimit > 0 ? Math.round((newBalance / initialLimit) * 100) : 0;
                
                let scoreChange = 0;
                if (initialUtil >= 30 && newUtil < 30) scoreChange += Math.floor(Math.random() * 15) + 10; // 10-24 points
                if (initialUtil >= 10 && newUtil < 10) scoreChange += Math.floor(Math.random() * 10) + 5;  // 5-14 points
                if (initialUtil >= 50 && newUtil < 50) scoreChange += Math.floor(Math.random() * 20) + 15; // 15-34 points

                projectedScore += scoreChange;
                analysis = `Paying down your balance by ${formatCurrency(paydownAmount)} could lower your credit utilization from ${initialUtil}% to ${newUtil}%. Lower utilization is a key factor in improving your score.`;
                impactedFactors.push({ name: 'Credit Utilization', impact: 'Positive' });
                break;
            }
            case SimulationActionType.GetNewCreditCard: {
                const newLimit = scenario.creditLimit || 5000;
                const newTotalLimit = initialLimit + newLimit;
                const newUtil = newTotalLimit > 0 ? Math.round((initialBalance / newTotalLimit) * 100) : 0;
                
                let scoreChange = 0;
                // Negative impact from hard inquiry
                scoreChange -= Math.floor(Math.random() * 6) + 3; // 3-8 points
                // Negative impact from lower average age of accounts
                const newAvgAge = (initialAvgAge * this.report.creditAccounts.length) / (this.report.creditAccounts.length + 1);
                scoreChange -= Math.floor((initialAvgAge - newAvgAge) * 5); // Penalty for age reduction
                // Positive impact from lower utilization
                if (newUtil < initialUtil) {
                    scoreChange += Math.floor((initialUtil - newUtil) * 0.5);
                }

                projectedScore += scoreChange;
                analysis = `Opening a new card with a ${formatCurrency(newLimit)} limit would add a hard inquiry and lower your average account age, initially dropping your score. However, it would also decrease your overall utilization to ${newUtil}%, which could help your score in the long run.`;
                impactedFactors.push({ name: 'Hard Inquiries', impact: 'Negative' });
                impactedFactors.push({ name: 'Age of Credit History', impact: 'Negative' });
                impactedFactors.push({ name: 'Credit Utilization', impact: 'Positive' });
                break;
            }
            case SimulationActionType.MissAPayment: {
                let scoreChange = 0;
                if (this.baseScore > 780) scoreChange = -(Math.floor(Math.random() * 41) + 90); // 90-130 point drop
                else if (this.baseScore > 680) scoreChange = -(Math.floor(Math.random() * 31) + 60); // 60-90 point drop
                else scoreChange = -(Math.floor(Math.random() * 21) + 20); // 20-40 point drop

                projectedScore += scoreChange;
                analysis = `A single 30-day late payment can have a severe and long-lasting negative impact on your credit score. Payment history is the most important credit factor.`;
                impactedFactors.push({ name: 'Payment History', impact: 'Negative' });
                break;
            }
            case SimulationActionType.CloseOldestAccount: {
                const oldestAccountAge = this.findOldestAccountAge();
                let scoreChange = -Math.floor(oldestAccountAge * 2.5); // 2.5 points per year of age
                
                projectedScore += scoreChange;
                analysis = `Closing your oldest account would reduce the average age of your credit history, which is a key factor. This action typically has a negative impact on your score.`;
                impactedFactors.push({ name: 'Age of Credit History', impact: 'Negative' });
                break;
            }
            // ... Add other simulation cases here
            default:
                analysis = "This simulation is not yet implemented.";
        }

        return {
            originalScore: this.baseScore,
            projectedScore: Math.min(850, Math.max(300, Math.round(projectedScore))),
            scoreChange: Math.round(projectedScore - this.baseScore),
            analysis,
            impactedFactors
        };
    }
}


// SECTION 4: CUSTOM HOOKS
// =================================================================================================

/**
 * Custom hook to manage the full credit health data set.
 * In a real app, this would involve fetching data from an API.
 * Here, we use mock data generators.
 */
export const useEnhancedCreditData = (baseScore: number) => {
    const [data, setData] = useState<EnhancedCreditHealthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setData({
                fullReport: generateMockFullCreditReport(),
                scoreHistory: generateMockScoreHistory(baseScore),
                alerts: generateMockAlerts()
            });
            setIsLoading(false);
        }, 1500);
    }, [baseScore]);
    
    const markAlertAsRead = useCallback((alertId: string) => {
        setData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                alerts: prevData.alerts.map(alert => 
                    alert.id === alertId ? { ...alert, isRead: true } : alert
                )
            };
        });
    }, []);

    return { ...data, isLoading, markAlertAsRead };
};

// SECTION 5: UI SUB-COMPONENTS
// =================================================================================================

/**
 * A custom Tab component built from scratch.
 */
export const CustomTabs: React.FC<{
    tabs: { name: string, content: React.ReactNode }[];
    initialTab?: number;
}> = ({ tabs, initialTab = 0 }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <div>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(index)}
                            className={`${
                                activeTab === index
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="pt-6">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
};

/**
 * Component to display the user's credit score with a gauge-like chart.
 */
export const CreditScoreDisplayCard: React.FC<{ score: number; rating: string; }> = ({ score, rating }) => {
    const scorePercentage = (score - 300) / (850 - 300);
    const needleRotation = scorePercentage * 180 - 90;

    const getScoreColor = (s: number) => {
        if (s >= 800) return 'text-green-400';
        if (s >= 740) return 'text-green-500';
        if (s >= 670) return 'text-cyan-500';
        if (s >= 580) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <Card title="Your Credit Score" subtitle={`Rating: ${rating}`} className="lg:col-span-2">
            <div className="relative flex flex-col items-center justify-center h-full p-4">
                 <div className="w-full max-w-xs aspect-square">
                    <div className="relative w-full h-full">
                        <svg viewBox="0 0 100 50" className="w-full">
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#dc2626" strokeWidth="10" />
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="41.86" />
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#06b6d4" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="92.94" />
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="149.2" />
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="180.86" />
                        </svg>
                        <div
                            className="absolute bottom-0 left-1/2 w-0.5 h-1/2 bg-white origin-bottom transition-transform duration-1000 ease-out"
                            style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
                        >
                            <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>
                 <p className={`text-7xl font-bold text-center -mt-16 ${getScoreColor(score)}`}>{score}</p>
                 <div className="flex justify-between w-full max-w-xs text-xs text-gray-400 px-2 mt-2">
                     <span>300</span>
                     <span>Poor</span>
                     <span>Fair</span>
                     <span>Good</span>
                     <span>Excellent</span>
                     <span>850</span>
                 </div>
            </div>
        </Card>
    );
};


/**
 * Component for the Credit Factors Radar Chart.
 */
export const CreditFactorsRadarChart: React.FC<{ factors: { name: string; status: 'Excellent' | 'Good' | 'Fair' | 'Poor' }[] }> = ({ factors }) => {
    const statusToScore = (status: 'Excellent' | 'Good' | 'Fair' | 'Poor') => {
        const mapping = { 'Excellent': 100, 'Good': 75, 'Fair': 50, 'Poor': 25 };
        return mapping[status] || 0;
    };
    const chartData = factors.map(f => ({
        subject: f.name.replace(' History', '').replace('Credit ', ''),
        A: statusToScore(f.status),
        fullMark: 100
    }));

    return (
        <Card title="Credit Factor Analysis" className="lg:col-span-3">
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#4b5563" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#d1d5db', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Score" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

/**
 * Displays a list of credit factors with details.
 */
export const FactorsImpactingScore: React.FC<{ factors: { name: string; status: 'Excellent' | 'Good' | 'Fair' | 'Poor'; description: string }[] }> = ({ factors }) => {
    const StatusIndicator: React.FC<{ status: 'Excellent' | 'Good' | 'Fair' | 'Poor' }> = ({ status }) => {
        const colors = { Excellent: 'bg-green-500', Good: 'bg-cyan-500', Fair: 'bg-yellow-500', Poor: 'bg-red-500' };
        return <div className={`w-3 h-3 rounded-full ${colors[status]}`}></div>
    }

    return (
        <Card title="Factors Impacting Your Score">
            <div className="space-y-3">
                {factors.map(factor => (
                    <div key={factor.name} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-white">{factor.name}</h4>
                            <div className="flex items-center gap-2"><StatusIndicator status={factor.status} /><span className="text-sm text-gray-300">{factor.status}</span></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{factor.description}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

/**
 * The AI-powered tip card.
 */
export const AIPoweredTip: React.FC<{ insight: string; isLoading: boolean; onRefresh: () => void; }> = ({ insight, isLoading, onRefresh }) => (
    <Card title="AI-Powered Tip">
         <div className="flex flex-col justify-center items-center h-full text-center p-4 min-h-[80px]">
             {isLoading ? (
                 <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-cyan-400"></div>
                    <p>Analyzing...</p>
                 </div>
             ) : (
                <div className="w-full">
                    <p className="text-gray-300 italic">"{insight}"</p>
                    <button onClick={onRefresh} className="text-xs text-cyan-500 hover:text-cyan-400 mt-3">Get another tip</button>
                </div>
            )}
         </div>
    </Card>
);

/**
 * A chart showing credit score history over time.
 */
export const CreditScoreHistoryChart: React.FC<{ data: CreditScoreHistoryPoint[] }> = ({ data }) => {
    const [timeframe, setTimeframe] = useState(12); // months
    const filteredData = data.slice(-timeframe).map(d => ({
        ...d,
        date: new Date(d.date).toLocaleString('default', { month: 'short', year: '2-digit' })
    }));

    const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                    <p className="label text-white">{`${label}`}</p>
                    <p className="intro text-cyan-400">{`Score : ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <Card title="Score History">
            <div className="flex justify-end gap-2 mb-4">
                {[6, 12, 24].map(months => (
                    <button
                        key={months}
                        onClick={() => setTimeframe(months)}
                        className={`px-3 py-1 text-xs rounded-full ${timeframe === months ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                        {months}M
                    </button>
                ))}
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="date" tick={{ fill: '#d1d5db', fontSize: 10 }} />
                        <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{ fill: '#d1d5db', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="score" stroke="#06b6d4" fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

/**
 * A detailed credit simulator component.
 */
export const CreditSimulator: React.FC<{
    currentScore: number,
    report: FullCreditReport,
    factors: { name: string, status: 'Excellent' | 'Good' | 'Fair' | 'Poor' }[]
}> = ({ currentScore, report, factors }) => {
    const [scenario, setScenario] = useState<SimulationScenario>({ action: SimulationActionType.PayDownBalance, amount: 1000 });
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const simulatorEngine = useMemo(() => new CreditScoreSimulatorEngine(currentScore, report, factors), [currentScore, report, factors]);

    const handleSimulate = () => {
        setIsLoading(true);
        setResult(null);
        setTimeout(() => {
            const simResult = simulatorEngine.runSimulation(scenario);
            setResult(simResult);
            setIsLoading(false);
        }, 1000);
    };

    const renderScenarioInputs = () => {
        switch (scenario.action) {
            case SimulationActionType.PayDownBalance:
                return <input type="number" value={scenario.amount || ''} onChange={e => setScenario({...scenario, amount: Number(e.target.value)})} className="bg-gray-700 p-2 rounded w-full" placeholder="Amount to pay down" />;
            case SimulationActionType.GetNewCreditCard:
                return <input type="number" value={scenario.creditLimit || ''} onChange={e => setScenario({...scenario, creditLimit: Number(e.target.value)})} className="bg-gray-700 p-2 rounded w-full" placeholder="Estimated credit limit" />;
            // Add other inputs here...
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Score Simulator">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Choose a scenario</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Action</label>
                            <select
                                value={scenario.action}
                                onChange={e => {
                                    setResult(null);
                                    setScenario({ action: e.target.value as SimulationActionType });
                                }}
                                className="bg-gray-700 p-2 rounded w-full border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                            >
                                {Object.values(SimulationActionType).map(action => (
                                    <option key={action} value={action}>{action}</option>
                                ))}
                            </select>
                        </div>
                        {renderScenarioInputs()}
                        <button onClick={handleSimulate} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:bg-gray-500">
                            {isLoading ? 'Simulating...' : 'Simulate Score Change'}
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-800/50 p-4 rounded-lg">
                        {isLoading && <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>}
                        {!isLoading && result && (
                            <div className="text-center w-full">
                                <p className="text-gray-400">Projected Score</p>
                                <p className={`text-6xl font-bold ${result.scoreChange > 0 ? 'text-green-500' : result.scoreChange < 0 ? 'text-red-500' : 'text-white'}`}>{result.projectedScore}</p>
                                <div className={`flex items-center justify-center gap-1 font-semibold ${result.scoreChange > 0 ? 'text-green-500' : result.scoreChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {result.scoreChange > 0 ? <IconTrendingUp className="w-5 h-5"/> : result.scoreChange < 0 ? <IconTrendingDown className="w-5 h-5"/> : null}
                                    {result.scoreChange > 0 ? `+${result.scoreChange}` : result.scoreChange} points
                                </div>
                                <p className="text-xs text-gray-400 mt-4">{result.analysis}</p>
                                <div className="mt-4 space-y-1 text-left">
                                    <h4 className="text-sm font-semibold">Impacted Factors:</h4>
                                    {result.impactedFactors.map(f => (
                                       <div key={f.name} className="flex items-center text-xs">
                                           <span className={`mr-2 font-bold ${f.impact === 'Positive' ? 'text-green-500' : 'text-red-500'}`}>{f.impact}</span>
                                           <span>{f.name}</span>
                                       </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!isLoading && !result && (
                            <div className="text-center text-gray-500">
                                <IconInfo className="w-12 h-12 mx-auto mb-2"/>
                                <p>Your simulation results will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};


/**
 * A detailed view of the full credit report.
 */
export const FullCreditReportView: React.FC<{ report: FullCreditReport }> = ({ report }) => {
    const getAccountIcon = (type: AccountType) => {
        switch(type) {
            case AccountType.CreditCard: return <IconCreditCard className="w-6 h-6 text-cyan-400" />;
            case AccountType.Mortgage: return <IconHome className="w-6 h-6 text-green-400" />;
            case AccountType.AutoLoan: return <IconCar className="w-6 h-6 text-yellow-400" />;
            case AccountType.StudentLoan: return <IconEducation className="w-6 h-6 text-blue-400" />;
            default: return <IconInfo className="w-6 h-6 text-gray-400" />;
        }
    };
    
    const PaymentHistoryGrid: React.FC<{history: PaymentHistoryEntry[]}> = ({history}) => {
        const getStatusColor = (status: PaymentStatus) => {
            const colors: Record<string, string> = {
                OK: 'bg-green-500/70', '30': 'bg-yellow-500/70', '60': 'bg-orange-500/70',
                '90': 'bg-red-500/70', '120+': 'bg-red-700/70', 'CO': 'bg-red-900/70', 'ND': 'bg-gray-600/70',
            };
            return colors[status || 'ND'] || 'bg-gray-800';
        };
        return (
            <div className="mt-2">
                <div className="grid grid-cols-12 gap-1">
                    {history.slice(-12).map((entry, idx) => (
                        <div key={idx} className="text-center text-xs text-gray-400">{entry.month.split(' ')[0]}</div>
                    ))}
                </div>
                <div className="grid grid-cols-12 gap-1 mt-1">
                    {history.slice(-12).map((entry, idx) => (
                        <div key={idx} title={`${entry.month}: ${entry.status || 'No Data'}`} className={`h-4 rounded-sm ${getStatusColor(entry.status)}`}></div>
                    ))}
                </div>
            </div>
        );
    };

    const AccountsView = () => (
        <div className="space-y-4">
            {report.creditAccounts.map(acc => (
                <Card key={acc.id} className="p-4 bg-gray-800/50">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">{getAccountIcon(acc.type)}</div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-bold text-white">{acc.creditorName}</h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${acc.status === 'Open' ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}>{acc.status}</span>
                            </div>
                            <p className="text-sm text-gray-400">{acc.type} | Acct: {acc.accountNumber}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                <div><p className="text-xs text-gray-500">Balance</p><p className="font-semibold">{formatCurrency(acc.balance)}</p></div>
                                <div><p className="text-xs text-gray-500">Limit</p><p className="font-semibold">{acc.creditLimit ? formatCurrency(acc.creditLimit) : 'N/A'}</p></div>
                                <div><p className="text-xs text-gray-500">Utilization</p><p className="font-semibold">{calculateUtilization(acc.balance, acc.creditLimit)}%</p></div>
                                <div><p className="text-xs text-gray-500">Opened</p><p className="font-semibold">{formatDate(acc.dateOpened)}</p></div>
                            </div>
                            {acc.paymentHistory.length > 0 && <PaymentHistoryGrid history={acc.paymentHistory} />}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
    
    const InquiriesView = () => (
         <Card><div className="space-y-3 p-4">
            {report.creditInquiries.map(inq => (
                <div key={inq.id} className="p-3 bg-gray-800/50 rounded-lg flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-white">{inq.creditorName}</h4>
                        <p className="text-xs text-gray-400">{formatDate(inq.inquiryDate)}</p>
                    </div>
                    <span className={`text-sm font-medium ${inq.type === 'Hard' ? 'text-red-400' : 'text-gray-400'}`}>{inq.type}</span>
                </div>
            ))}
        </div></Card>
    );
    
    // ... similarly detailed views for Public Records and Personal Info
    const PublicRecordsView = () => (<Card>... Public Records ...</Card>);

    const tabs = [
        { name: 'Accounts', content: <AccountsView /> },
        { name: 'Inquiries', content: <InquiriesView /> },
        { name: 'Public Records', content: <PublicRecordsView /> },
    ];
    
    return <CustomTabs tabs={tabs} />;
};

/**
 * A component to display credit monitoring alerts.
 */
export const AlertsDashboard: React.FC<{ alerts: CreditAlert[]; onMarkRead: (id: string) => void }> = ({ alerts, onMarkRead }) => {
    const getAlertIcon = (category: CreditAlert['category'], severity: CreditAlert['severity']) => {
        const color = severity === 'High' ? 'text-red-500' : severity === 'Medium' ? 'text-yellow-500' : 'text-blue-500';
        // Placeholder for more specific icons
        return <IconAlert className={`w-6 h-6 ${color}`} />;
    };
    const unreadCount = alerts.filter(a => !a.isRead).length;

    return (
        <Card title="Credit Alerts" subtitle={unreadCount > 0 ? `${unreadCount} Unread` : 'All caught up!'}>
            <div className="space-y-3 max-h-96 overflow-y-auto p-1">
                {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg flex gap-3 transition-colors duration-300 ${alert.isRead ? 'bg-gray-800/30' : 'bg-cyan-900/30'}`}>
                        <div className="flex-shrink-0 pt-1">{getAlertIcon(alert.category, alert.severity)}</div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white">{alert.title}</h4>
                                <p className="text-xs text-gray-400">{formatDate(alert.date)}</p>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">{alert.description}</p>
                            {!alert.isRead && (
                                <button onClick={() => onMarkRead(alert.id)} className="text-xs text-cyan-400 hover:text-cyan-300 mt-2">Mark as read</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

/**
 * A hub for educational content about credit.
 */
export const CreditEducationHub: React.FC = () => {
    const articles: EducationalArticle[] = [
        {
            id: 'what-is-credit-score',
            title: 'What is a Credit Score?',
            category: 'Basics',
            summary: 'Learn the fundamentals of what a credit score is and why it matters.',
            content: (
                <div className="space-y-4 text-gray-300">
                    <p>A credit score is a three-digit number, typically ranging from 300 to 850, that represents your creditworthiness. Lenders, such as banks and credit card companies, use this number to evaluate the potential risk posed by lending money to you. A higher score indicates to lenders that you are more likely to repay your debts on time.</p>
                    <h3 className="text-xl font-semibold text-white pt-2">How are Credit Scores Calculated?</h3>
                    <p>While the exact formulas used by credit scoring models (like FICO® and VantageScore®) are proprietary, they all rely on the information in your credit reports. The main factors that influence your score are:</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li><strong>Payment History (35%):</strong> The most important factor. Making payments on time has the biggest positive impact. Late payments, collections, and bankruptcies have a significant negative impact.</li>
                        <li><strong>Amounts Owed / Credit Utilization (30%):</strong> This looks at how much of your available credit you're using. Keeping your credit card balances low compared to your credit limits is crucial.</li>
                        <li><strong>Length of Credit History (15%):</strong> A longer history of responsible credit management can improve your score. This includes the age of your oldest account and the average age of all your accounts.</li>
                        <li><strong>Credit Mix (10%):</strong> Lenders like to see that you can manage different types of credit, such as credit cards (revolving credit) and loans (installment credit).</li>
                        <li><strong>New Credit (10%):</strong> This includes recent hard inquiries and newly opened accounts. Opening too many new accounts in a short period can be seen as a risk.</li>
                    </ul>
                </div>
            )
        },
        // ... more articles
    ];
    const glossary: GlossaryTerm[] = [
        { term: 'Annual Percentage Rate (APR)', definition: 'The yearly interest rate charged for borrowing, including any fees or additional costs.' },
        { term: 'Credit Utilization Ratio', definition: 'The percentage of your available revolving credit that you are currently using. Calculated by dividing your total credit card balances by your total credit limits.' },
        { term: 'Hard Inquiry', definition: 'Occurs when a lender checks your credit report to make a lending decision. It can temporarily lower your credit score.' },
        { term: 'Soft Inquiry', definition: 'Occurs when you check your own credit or a company checks it for pre-screening purposes. It does not affect your credit score.' },
    ];
    
    const [activeArticle, setActiveArticle] = useState<EducationalArticle | null>(articles[0]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card title="Learn About Credit">
                    <div className="space-y-2 p-2">
                        {articles.map(article => (
                            <button key={article.id} onClick={() => setActiveArticle(article)} className={`w-full text-left p-3 rounded-md transition-colors ${activeArticle?.id === article.id ? 'bg-cyan-800/50' : 'hover:bg-gray-700/50'}`}>
                                <h4 className="font-semibold text-white">{article.title}</h4>
                                <p className="text-xs text-gray-400">{article.summary}</p>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <div className="p-6">
                        {activeArticle ? (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-4">{activeArticle.title}</h2>
                                {activeArticle.content}
                            </>
                        ) : <p>Select an article to read.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};


// SECTION 6: MAIN VIEW COMPONENT
// =================================================================================================

const CreditHealthView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CreditHealthView must be within a DataProvider.");
    const { creditScore, creditFactors } = context;

    // State for original AI insight feature
    const [insight, setInsight] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);
    
    // State for new enhanced features
    const { fullReport, scoreHistory, alerts, isLoading: isLoadingEnhancedData, markAlertAsRead } = useEnhancedCreditData(creditScore.score);
    
    const getAIInsight = useCallback(async () => {
        setIsLoadingInsight(true);
        try {
            // Using a more detailed prompt for better insights
            const prompt = `A user has a credit score of ${creditScore.score}. Their credit factors are: ${creditFactors.map(f => `${f.name}: ${f.status}`).join(', ')}. Key report data: Total credit card utilization is ${calculateUtilization(fullReport?.creditAccounts.filter(a => a.type === AccountType.CreditCard).reduce((sum, a) => sum + a.balance, 0), fullReport?.creditAccounts.filter(a => a.type === AccountType.CreditCard).reduce((sum, a) => sum + (a.creditLimit || 0), 0))}%. They have ${fullReport?.creditInquiries.filter(i => i.type === 'Hard').length} hard inquiries in the last 2 years. Their oldest account is ${fullReport ? Math.floor(new CreditScoreSimulatorEngine(creditScore.score, fullReport, creditFactors).findOldestAccountAge()) : 'N/A'} years old. Provide one concise, actionable tip (less than 30 words) to help them improve their score based on this combined information.`;
            // NOTE: The API key handling should be done on a secure backend in a real app.
            // This is a placeholder for frontend demonstration.
            if(process.env.API_KEY) {
                const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
                const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
                setInsight(response.text);
            } else {
                 setInsight("API Key not configured. Please set your Google GenAI API Key.");
            }
        } catch (err) {
            console.error("AI Insight Error:", err);
            setInsight("Could not generate a personalized tip at this time.");
        } finally { setIsLoadingInsight(false); }
    }, [creditScore.score, creditFactors, fullReport]);
    
    useEffect(() => { 
        if(fullReport) {
            getAIInsight() 
        }
    }, [fullReport, getAIInsight]);

    const SummaryView = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <CreditScoreDisplayCard score={creditScore.score} rating={creditScore.rating} />
                <CreditFactorsRadarChart factors={creditFactors} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <AIPoweredTip insight={insight} isLoading={isLoadingInsight} onRefresh={getAIInsight} />
                 {alerts && <AlertsDashboard alerts={alerts} onMarkRead={markAlertAsRead} />}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {scoreHistory && <CreditScoreHistoryChart data={scoreHistory} />}
                <FactorsImpactingScore factors={creditFactors} />
            </div>
        </div>
    );
    
    const mainTabs = [
        { name: 'Summary', content: isLoadingEnhancedData ? <p>Loading Credit Data...</p> : <SummaryView /> },
        { name: 'Full Report', content: isLoadingEnhancedData ? <p>Loading Report...</p> : fullReport ? <FullCreditReportView report={fullReport} /> : null },
        { name: 'Simulator', content: isLoadingEnhancedData ? <p>Loading Simulator...</p> : fullReport ? <CreditSimulator currentScore={creditScore.score} report={fullReport} factors={creditFactors} /> : null },
        { name: 'Learn', content: <CreditEducationHub /> }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Credit Health Dashboard</h2>
            <CustomTabs tabs={mainTabs} />
        </div>
    );
};

export default CreditHealthView;
