// components/views/megadashboard/finance/TaxCenterView.tsx
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI, Type } from "@google/genai";

// --- ENUMERATIONS AND TYPE DEFINITIONS (Approximately 1000 lines) ---

/**
 * @typedef {object} Transaction
 * @property {string} id - Unique identifier for the transaction.
 * @property {string} description - A brief description of the transaction.
 * @property {number} amount - The monetary value of the transaction.
 * @property {Date} date - The date of the transaction.
 * @property {string} type - 'income' or 'expense'.
 * @property {string} [category] - Optional category assigned to the transaction.
 * @property {string} [merchant] - Optional merchant name.
 * @property {string} [currency] - Currency of the transaction (e.g., 'USD').
 */
export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: Date;
    type: 'income' | 'expense';
    category?: string;
    merchant?: string;
    currency?: string;
    rawDetails?: string; // Additional raw data for AI analysis
}

/**
 * @typedef {object} Deduction
 * @property {string} id - Unique identifier for the deduction.
 * @property {string} description - Detailed description of the deduction.
 * @property {number} amount - The deductible amount.
 * @property {DeductionCategory} category - The tax deduction category.
 * @property {string} justification - AI-generated or user-provided justification.
 * @property {string[]} [transactionIds] - IDs of transactions supporting this deduction.
 * @property {boolean} [isApproved] - Whether the user has approved this deduction.
 * @property {boolean} [isAIRecommended] - Whether this deduction was initially AI-recommended.
 * @property {string} [receiptUrl] - URL to an uploaded receipt.
 * @property {string} [notes] - User notes about the deduction.
 * @property {Date} [dateAdded] - Date the deduction was added.
 */
export interface Deduction {
    id: string;
    description: string;
    amount: number;
    category: DeductionCategory;
    justification: string;
    transactionIds?: string[];
    isApproved?: boolean;
    isAIRecommended?: boolean;
    receiptUrl?: string;
    notes?: string;
    dateAdded?: Date;
}

/**
 * @typedef {object} IncomeSource
 * @property {string} id - Unique ID.
 * @property {string} name - Name of the income source (e.g., "Client A", "Salary").
 * @property {IncomeType} type - Type of income (W2, 1099-NEC, etc.).
 * @property {number} amountYTD - Year-to-date income from this source.
 * @property {string} [employerId] - For W2 income.
 * @property {string} [ein] - For 1099 income (Employer Identification Number).
 * @property {boolean} [isPassive] - If income is passive (e.g., rental, investments).
 * @property {string} [notes] - Additional notes.
 */
export interface IncomeSource {
    id: string;
    name: string;
    type: IncomeType;
    amountYTD: number;
    employerId?: string;
    ein?: string;
    isPassive?: boolean;
    notes?: string;
}

/**
 * @typedef {object} TaxProfile
 * @property {string} userId - User's ID.
 * @property {number} taxYear - The current tax year.
 * @property {FilingStatus} filingStatus - User's tax filing status.
 * @property {number} dependents - Number of dependents.
 * @property {string} stateOfResidence - User's primary state of residence.
 * @property {boolean} hasHealthInsurance - Whether the user has health insurance.
 * @property {boolean} isSelfEmployed - True if the user is self-employed.
 * @property {number} [estimatedAGI] - Estimated Adjusted Gross Income for the year.
 * @property {number} [federalTaxWithheldYTD] - Total federal tax withheld YTD.
 * @property {number} [stateTaxWithheldYTD] - Total state tax withheld YTD.
 * @property {number} [federalEstimatedTaxPaid] - Total federal estimated tax payments made.
 * @property {number} [stateEstimatedTaxPaid] - Total state estimated tax payments made.
 * @property {number} [priorYearAGI] - AGI from previous tax year (for safe harbor).
 * @property {boolean} [isFirstTimeFiler] - If the user is filing for the first time.
 * @property {boolean} [isStudent] - If the user is a student.
 * @property {boolean} [isHomeowner] - If the user owns a home.
 * @property {boolean} [hasInvestments] - If the user has investment income/losses.
 * @property {boolean} [hasRentalIncome] - If the user has rental property income.
 */
export interface TaxProfile {
    userId: string;
    taxYear: number;
    filingStatus: FilingStatus;
    dependents: number;
    stateOfResidence: string;
    hasHealthInsurance: boolean;
    isSelfEmployed: boolean;
    estimatedAGI?: number;
    federalTaxWithheldYTD?: number;
    stateTaxWithheldYTD?: number;
    federalEstimatedTaxPaid?: number;
    stateEstimatedTaxPaid?: number;
    priorYearAGI?: number;
    isFirstTimeFiler?: boolean;
    isStudent?: boolean;
    isHomeowner?: boolean;
    hasInvestments?: boolean;
    hasRentalIncome?: boolean;
}

/**
 * @typedef {object} EstimatedPayment
 * @property {string} id - Unique ID.
 * @property {number} quarter - Tax quarter (1-4).
 * @property {number} amountFederal - Federal estimated tax paid for this quarter.
 * @property {number} amountState - State estimated tax paid for this quarter.
 * @property {Date} paymentDate - Date the payment was made.
 * @property {boolean} isPaid - Whether the payment has been made.
 * @property {Date} dueDate - Due date for the estimated payment.
 */
export interface EstimatedPayment {
    id: string;
    quarter: number;
    amountFederal: number;
    amountState: number;
    paymentDate?: Date;
    isPaid: boolean;
    dueDate: Date;
}

/**
 * @typedef {object} AuditFactor
 * @property {string} name - Name of the audit factor (e.g., "High Deductions relative to Income").
 * @property {number} score - A numerical score indicating risk level (0-100).
 * @property {AuditRiskLevel} level - Categorical risk level.
 * @property {string} explanation - A brief explanation of the factor.
 * @property {string[]} recommendations - Actionable steps to mitigate risk.
 */
export interface AuditFactor {
    name: string;
    score: number;
    level: AuditRiskLevel;
    explanation: string;
    recommendations: string[];
}

/**
 * @typedef {object} TaxScenario
 * @property {string} id - Unique ID.
 * @property {string} name - Name of the scenario (e.g., "Buy a house", "Increase 401k").
 * @property {TaxProfile} profileChanges - Changes to the tax profile for this scenario.
 * @property {number} incomeChanges - Delta in income for the scenario.
 * @property {Deduction[]} newDeductions - Deductions added in this scenario.
 * @property {number} estimatedTaxImpact - Calculated impact on tax liability.
 * @property {Date} dateCreated - Date the scenario was created.
 */
export interface TaxScenario {
    id: string;
    name: string;
    profileChanges: Partial<TaxProfile>;
    incomeChanges: number;
    newDeductions: Partial<Deduction>[];
    estimatedTaxImpact: number;
    dateCreated: Date;
}

/**
 * @typedef {object} TaxConceptExplanation
 * @property {string} concept - The tax concept being explained.
 * @property {string} explanation - Detailed explanation.
 * @property {string} [example] - An example illustrating the concept.
 * @property {string[]} [relatedConcepts] - Other related tax topics.
 * @property {string[]} [keywords] - Keywords for searchability.
 */
export interface TaxConceptExplanation {
    concept: string;
    explanation: string;
    example?: string;
    relatedConcepts?: string[];
    keywords?: string[];
}

/**
 * @typedef {object} TaxAlert
 * @property {string} id - Unique ID.
 * @property {string} title - Title of the alert.
 * @property {string} description - Detailed description of the alert.
 * @property {TaxAlertSeverity} severity - Severity level of the alert.
 * @property {Date} dateIssued - Date the alert was issued.
 * @property {boolean} isRead - Whether the user has read the alert.
 * @property {string[]} [relatedTaxYears] - Tax years relevant to the alert.
 * @property {string[]} [affectedStates] - States affected by the alert.
 * @property {string} [callToAction] - Optional call to action.
 * @property {string} [learnMoreUrl] - URL for more information.
 */
export interface TaxAlert {
    id: string;
    title: string;
    description: string;
    severity: TaxAlertSeverity;
    dateIssued: Date;
    isRead: boolean;
    relatedTaxYears?: string[];
    affectedStates?: string[];
    callToAction?: string;
    learnMoreUrl?: string;
}

/**
 * @typedef {object} Receipt
 * @property {string} id - Unique ID.
 * @property {string} fileName - Original file name.
 * @property {string} url - URL to the stored receipt image/PDF.
 * @property {Date} uploadDate - Date of upload.
 * @property {string[]} [linkedDeductionIds] - IDs of deductions linked to this receipt.
 * @property {string} [extractedText] - Text extracted by OCR (if applicable).
 * @property {string} [aiSummary] - AI-generated summary of the receipt.
 * @property {number} [amount] - Amount parsed from receipt.
 * @property {Date} [transactionDate] - Date parsed from receipt.
 */
export interface Receipt {
    id: string;
    fileName: string;
    url: string;
    uploadDate: Date;
    linkedDeductionIds?: string[];
    extractedText?: string;
    aiSummary?: string;
    amount?: number;
    transactionDate?: Date;
}

export enum DeductionCategory {
    HomeOffice = 'Home Office',
    BusinessTravel = 'Business Travel',
    ProfessionalDevelopment = 'Professional Development',
    SoftwareSubscriptions = 'Software & Subscriptions',
    ClientEntertainment = 'Client Entertainment',
    MarketingAdvertising = 'Marketing & Advertising',
    VehicleExpenses = 'Vehicle Expenses',
    HealthInsurancePremiums = 'Health Insurance Premiums',
    RetirementContributions = 'Retirement Contributions',
    OfficeSupplies = 'Office Supplies',
    LegalProfessionalFees = 'Legal & Professional Fees',
    Utilities = 'Utilities',
    OtherBusinessExpense = 'Other Business Expense',
    MedicalExpenses = 'Medical Expenses',
    CharitableContributions = 'Charitable Contributions',
    StateLocalTaxes = 'State & Local Taxes',
    MortgageInterest = 'Mortgage Interest',
    StudentLoanInterest = 'Student Loan Interest',
    ChildCareExpenses = 'Child Care Expenses',
    EducationalExpenses = 'Educational Expenses',
    InvestmentExpenses = 'Investment Expenses',
    RealEstateTaxes = 'Real Estate Taxes',
    CasualtyLosses = 'Casualty Losses',
    AlimonyPayments = 'Alimony Payments',
    OtherItemizedDeduction = 'Other Itemized Deduction',
}

export enum IncomeType {
    W2 = 'W2 Salary',
    NEC1099 = '1099-NEC (Non-employee Compensation)',
    K1 = 'K-1 (Partnership/S-Corp)',
    Dividends = 'Dividends (1099-DIV)',
    Interest = 'Interest (1099-INT)',
    CapitalGains = 'Capital Gains (1099-B)',
    RentalIncome = 'Rental Income',
    SocialSecurity = 'Social Security',
    PensionAnnuity = 'Pension/Annuity',
    Unemployment = 'Unemployment Benefits',
    Other = 'Other Income',
}

export enum FilingStatus {
    Single = 'Single',
    MarriedFilingJointly = 'Married Filing Jointly',
    MarriedFilingSeparately = 'Married Filing Separately',
    HeadOfHousehold = 'Head of Household',
    QualifyingWidow = 'Qualifying Widow(er)',
}

export enum AuditRiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    VeryHigh = 'Very High',
}

export enum TaxAlertSeverity {
    Info = 'Info',
    Warning = 'Warning',
    Critical = 'Critical',
}

export enum TaxFormType {
    Form1040 = 'Form 1040',
    ScheduleC = 'Schedule C',
    ScheduleSE = 'Schedule SE',
    Form1040ES = 'Form 1040-ES',
    ScheduleA = 'Schedule A',
    Form8829 = 'Form 8829', // Home Office Expenses
    Form4562 = 'Form 4562', // Depreciation
    FormW2 = 'Form W-2',
    Form1099NEC = 'Form 1099-NEC',
}

export enum FinancialMetric {
    TotalIncome = 'Total Income',
    TotalExpenses = 'Total Expenses',
    NetProfit = 'Net Profit',
    TotalDeductions = 'Total Deductions',
    EstimatedTaxLiability = 'Estimated Tax Liability',
    EffectiveTaxRate = 'Effective Tax Rate',
    EstimatedQuarterlyPayment = 'Estimated Quarterly Payment',
}

// --- CONSTANTS AND MOCK DATA (Approximately 500 lines) ---

export const TAX_YEAR = 2024; // Current tax year for calculations

export const DEDUCTION_CATEGORIES_OPTIONS = Object.values(DeductionCategory).map(cat => ({ value: cat, label: cat }));
export const INCOME_TYPE_OPTIONS = Object.values(IncomeType).map(type => ({ value: type, label: type }));
export const FILING_STATUS_OPTIONS = Object.values(FilingStatus).map(status => ({ value: status, label: status }));

// Mock Federal Tax Brackets (Simplified for demonstration)
// In a real app, this would be fetched/updated annually and be much more complex,
// considering long-term capital gains, different income types, etc.
export const FEDERAL_TAX_BRACKETS_SINGLE = [
    { income: 0, rate: 0.10, limit: 11600 },
    { income: 11601, rate: 0.12, limit: 47150 },
    { income: 47151, rate: 0.22, limit: 100525 },
    { income: 100526, rate: 0.24, limit: 191950 },
    { income: 191951, rate: 0.32, limit: 243725 },
    { income: 243726, rate: 0.35, limit: 609350 },
    { income: 609351, rate: 0.37, limit: Infinity },
];

export const FEDERAL_TAX_BRACKETS_MFJ = [ // Married Filing Jointly
    { income: 0, rate: 0.10, limit: 23200 },
    { income: 23201, rate: 0.12, limit: 94300 },
    { income: 94301, rate: 0.22, limit: 201050 },
    { income: 201051, rate: 0.24, limit: 383900 },
    { income: 383901, rate: 0.32, limit: 487450 },
    { income: 487451, rate: 0.35, limit: 731200 },
    { income: 731201, rate: 0.37, limit: Infinity },
];

export const STANDARD_DEDUCTION_2024: Record<FilingStatus, number> = {
    [FilingStatus.Single]: 14600,
    [FilingStatus.MarriedFilingJointly]: 29200,
    [FilingStatus.MarriedFilingSeparately]: 14600,
    [FilingStatus.HeadOfHousehold]: 21900,
    [FilingStatus.QualifyingWidow]: 29200,
};

export const SELF_EMPLOYMENT_TAX_RATE = 0.153; // 12.4% SS + 2.9% Medicare
export const SS_MAX_EARNINGS = 168600; // Social Security wage base limit 2024
export const SE_DEDUCTION_PERCENTAGE = 0.5; // Deduction for one-half of SE tax

// Mock State Tax Brackets (Simplified for California - Example)
export const CA_STATE_TAX_BRACKETS_SINGLE = [
    { income: 0, rate: 0.01, limit: 10412 },
    { income: 10413, rate: 0.02, limit: 24684 },
    { income: 24685, rate: 0.04, limit: 38959 },
    { income: 38960, rate: 0.06, limit: 53909 },
    { income: 53910, rate: 0.08, limit: 68179 },
    { income: 68180, rate: 0.093, limit: 348637 },
    { income: 348638, rate: 0.103, limit: 418361 },
    { income: 418362, rate: 0.113, limit: 697268 },
    { income: 697269, rate: 0.123, limit: 1000000 },
    { income: 1000001, rate: 0.133, limit: Infinity }, // Includes 1% mental health tax
];

export const QUARTERLY_DUE_DATES: { [key: number]: Date } = {
    1: new Date(TAX_YEAR, 3, 15), // April 15
    2: new Date(TAX_YEAR, 5, 15), // June 15
    3: new Date(TAX_YEAR, 8, 15), // September 15
    4: new Date(TAX_YEAR + 1, 0, 15), // January 15 of next year
};

export const MOCK_ALERTS: TaxAlert[] = [
    {
        id: 'alert1',
        title: 'New Health Insurance Deduction Limit for Self-Employed',
        description: 'The IRS has updated the maximum deductible amount for self-employed health insurance premiums. Review your entries to ensure compliance.',
        severity: TaxAlertSeverity.Warning,
        dateIssued: new Date(TAX_YEAR, 0, 10),
        isRead: false,
        relatedTaxYears: [`${TAX_YEAR}`],
        callToAction: 'Update Deduction',
        learnMoreUrl: 'https://www.irs.gov/newsroom/self-employed-health-insurance-deduction',
    },
    {
        id: 'alert2',
        title: 'Q2 Estimated Tax Payment Due Soon!',
        description: `Your second quarter estimated tax payment for ${TAX_YEAR} is due on June 15th. Ensure you have sufficient funds and consider making your payment to avoid penalties.`,
        severity: TaxAlertSeverity.Critical,
        dateIssued: new Date(TAX_YEAR, 4, 20),
        isRead: false,
        relatedTaxYears: [`${TAX_YEAR}`],
        callToAction: 'Make Payment',
        learnMoreUrl: 'https://www.irs.gov/payments/pay-as-you-go- withholding-estimated-tax',
    },
    {
        id: 'alert3',
        title: 'New State Tax Relief Program for Small Businesses (CA)',
        description: 'California has introduced a new tax credit for small businesses investing in employee training. Check eligibility requirements.',
        severity: TaxAlertSeverity.Info,
        dateIssued: new Date(TAX_YEAR, 2, 1),
        isRead: true,
        relatedTaxYears: [`${TAX_YEAR}`],
        affectedStates: ['CA'],
        callToAction: 'View Details',
        learnMoreUrl: 'https://www.ftb.ca.gov/taxes/business/credits/',
    },
];

export const MOCK_RECEIPTS: Receipt[] = [
    {
        id: 'rec1',
        fileName: 'uber_receipt_1.pdf',
        url: '/receipts/rec1.pdf',
        uploadDate: new Date(TAX_YEAR, 1, 15),
        linkedDeductionIds: ['ded123'],
        extractedText: 'Uber trip to client office. Amount: $45.50. Date: Feb 10, 2024.',
        aiSummary: 'Business travel expense for client meeting.',
        amount: 45.50,
        transactionDate: new Date(TAX_YEAR, 1, 10),
    },
    {
        id: 'rec2',
        fileName: 'adobe_cc_invoice.png',
        url: '/receipts/rec2.png',
        uploadDate: new Date(TAX_YEAR, 2, 10),
        linkedDeductionIds: ['ded456'],
        extractedText: 'Adobe Creative Cloud subscription. Amount: $52.99. Monthly. March 2024.',
        aiSummary: 'Software subscription for professional use.',
        amount: 52.99,
        transactionDate: new Date(TAX_YEAR, 2, 5),
    },
];

// --- HELPER FUNCTIONS AND TAX CALCULATION LOGIC (Approximately 4000 lines) ---

/**
 * Generates a unique ID (simple UUID-like for client-side use).
 * @returns {string} A unique identifier.
 */
export const generateUniqueId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Formats a number as currency.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Calculates federal tax liability based on taxable income and filing status.
 * (Simplified progressive tax calculation)
 * @param {number} taxableIncome - The income subject to federal tax.
 * @param {FilingStatus} filingStatus - The taxpayer's filing status.
 * @returns {number} The calculated federal tax.
 */
export const calculateFederalTax = (taxableIncome: number, filingStatus: FilingStatus): number => {
    if (taxableIncome <= 0) return 0;

    let tax = 0;
    const brackets = filingStatus === FilingStatus.Single ? FEDERAL_TAX_BRACKETS_SINGLE : FEDERAL_TAX_BRACKETS_MFJ; // Add more for other statuses

    for (const bracket of brackets) {
        if (taxableIncome > bracket.income) {
            const incomeInBracket = Math.min(taxableIncome, bracket.limit) - bracket.income;
            tax += incomeInBracket * bracket.rate;
        } else {
            break;
        }
    }
    return tax;
};

/**
 * Calculates state tax liability based on taxable income and state of residence.
 * (Simplified for CA only)
 * @param {number} taxableIncome - The income subject to state tax.
 * @param {string} stateOfResidence - The taxpayer's state of residence.
 * @param {FilingStatus} filingStatus - The taxpayer's filing status.
 * @returns {number} The calculated state tax.
 */
export const calculateStateTax = (taxableIncome: number, stateOfResidence: string, filingStatus: FilingStatus): number => {
    if (taxableIncome <= 0) return 0;

    let tax = 0;
    // This function would typically involve a large switch statement or external data
    // for all 50 states and their respective brackets and rules.
    switch (stateOfResidence) {
        case 'CA':
            const caBrackets = filingStatus === FilingStatus.Single ? CA_STATE_TAX_BRACKETS_SINGLE : CA_STATE_TAX_BRACKETS_SINGLE; // Simplified: assuming same for MFJ for now
            for (const bracket of caBrackets) {
                if (taxableIncome > bracket.income) {
                    const incomeInBracket = Math.min(taxableIncome, bracket.limit) - bracket.income;
                    tax += incomeInBracket * bracket.rate;
                } else {
                    break;
                }
            }
            return tax;
        // Add more states here
        default:
            return 0; // No state income tax or not implemented
    }
};

/**
 * Calculates net self-employment earnings for Schedule SE.
 * @param {number} totalSelfEmploymentIncome - Total income from 1099-NEC sources.
 * @param {number} totalBusinessExpenses - Total deductible business expenses.
 * @returns {number} Net earnings from self-employment.
 */
export const calculateNetSelfEmploymentEarnings = (totalSelfEmploymentIncome: number, totalBusinessExpenses: number): number => {
    const netProfit = totalSelfEmploymentIncome - totalBusinessExpenses;
    // Multiply by 0.9235 (1 - 0.0765) as only 92.35% of net earnings are subject to SE tax
    return Math.max(0, netProfit * 0.9235);
};

/**
 * Calculates self-employment tax.
 * @param {number} netSelfEmploymentEarnings - Net earnings from self-employment.
 * @returns {number} Self-employment tax.
 */
export const calculateSETax = (netSelfEmploymentEarnings: number): number => {
    const ssEarnings = Math.min(netSelfEmploymentEarnings, SS_MAX_EARNINGS);
    const medicareEarnings = netSelfEmploymentEarnings; // No limit for Medicare

    const ssTax = ssEarnings * 0.124; // Social Security portion
    const medicareTax = medicareEarnings * 0.029; // Medicare portion

    return ssTax + medicareTax;
};

/**
 * Calculates the deduction for one-half of self-employment tax.
 * @param {number} seTax - Total self-employment tax.
 * @returns {number} The deductible portion.
 */
export const calculateSEDeduction = (seTax: number): number => {
    return seTax * SE_DEDUCTION_PERCENTAGE;
};

/**
 * Calculates Adjusted Gross Income (AGI).
 * @param {number} totalIncome - Sum of all income sources.
 * @param {number} aboveTheLineDeductions - Deductions taken before AGI (e.g., SE tax deduction, student loan interest, HSA contributions).
 * @returns {number} Adjusted Gross Income.
 */
export const calculateAGI = (totalIncome: number, aboveTheLineDeductions: number): number => {
    return Math.max(0, totalIncome - aboveTheLineDeductions);
};

/**
 * Calculates total itemized deductions.
 * @param {Deduction[]} approvedDeductions - List of approved deductions.
 * @param {TaxProfile} taxProfile - User's tax profile.
 * @returns {number} Total itemized deductions.
 */
export const calculateItemizedDeductions = (approvedDeductions: Deduction[], taxProfile: TaxProfile): number => {
    // This is a simplified example. Real itemized deductions are much more complex
    // with AGI limitations (e.g., medical expenses > 7.5% AGI, state/local tax cap).
    let total = 0;
    for (const d of approvedDeductions) {
        // Exclude business expenses already accounted for in Schedule C
        if (d.category !== DeductionCategory.HomeOffice &&
            d.category !== DeductionCategory.BusinessTravel &&
            d.category !== DeductionCategory.ProfessionalDevelopment &&
            d.category !== DeductionCategory.SoftwareSubscriptions &&
            d.category !== DeductionCategory.ClientEntertainment &&
            d.category !== DeductionCategory.MarketingAdvertising &&
            d.category !== DeductionCategory.VehicleExpenses &&
            d.category !== DeductionCategory.OfficeSupplies &&
            d.category !== DeductionCategory.LegalProfessionalFees &&
            d.category !== DeductionCategory.Utilities &&
            d.category !== DeductionCategory.OtherBusinessExpense) {
            total += d.amount;
        }
    }
    // Add specific itemized deduction types if present in taxProfile (e.g., mortgage interest)
    // For now, only using 'other' types
    return total;
};

/**
 * Determines the greater of standard or itemized deductions.
 * @param {number} totalItemizedDeductions - Calculated total itemized deductions.
 * @param {FilingStatus} filingStatus - The taxpayer's filing status.
 * @returns {number} The higher deduction amount.
 */
export const getApplicableDeduction = (totalItemizedDeductions: number, filingStatus: FilingStatus): number => {
    const standardDeduction = STANDARD_DEDUCTION_2024[filingStatus] || STANDARD_DEDUCTION_2024[FilingStatus.Single];
    return Math.max(standardDeduction, totalItemizedDeductions);
};

/**
 * Calculates total income from all sources.
 * @param {IncomeSource[]} incomeSources - List of all income sources.
 * @returns {number} Total gross income.
 */
export const calculateTotalGrossIncome = (incomeSources: IncomeSource[]): number => {
    return incomeSources.reduce((sum, source) => sum + source.amountYTD, 0);
};

/**
 * Calculates Schedule C business income and expenses.
 * @param {IncomeSource[]} incomeSources - All income sources.
 * @param {Deduction[]} approvedDeductions - All approved deductions.
 * @returns {{ businessIncome: number, businessExpenses: number, netBusinessProfit: number }}
 */
export const calculateScheduleCDetails = (incomeSources: IncomeSource[], approvedDeductions: Deduction[]) => {
    const businessIncome = incomeSources
        .filter(s => s.type === IncomeType.NEC1099 || s.type === IncomeType.Other)
        .reduce((sum, s) => sum + s.amountYTD, 0);

    const businessExpenses = approvedDeductions
        .filter(d =>
            d.isApproved && (
                d.category === DeductionCategory.HomeOffice ||
                d.category === DeductionCategory.BusinessTravel ||
                d.category === DeductionCategory.ProfessionalDevelopment ||
                d.category === DeductionCategory.SoftwareSubscriptions ||
                d.category === DeductionCategory.ClientEntertainment ||
                d.category === DeductionCategory.MarketingAdvertising ||
                d.category === DeductionCategory.VehicleExpenses ||
                d.category === DeductionCategory.OfficeSupplies ||
                d.category === DeductionCategory.LegalProfessionalFees ||
                d.category === DeductionCategory.Utilities ||
                d.category === DeductionCategory.OtherBusinessExpense
            )
        )
        .reduce((sum, d) => sum + d.amount, 0);

    const netBusinessProfit = businessIncome - businessExpenses;
    return { businessIncome, businessExpenses, netBusinessProfit };
};


/**
 * Core function to calculate the full estimated tax liability.
 * This is a highly simplified model and would involve hundreds of rules, credits, and forms in a real application.
 * @param {IncomeSource[]} incomeSources - All income sources.
 * @param {Deduction[]} approvedDeductions - All approved deductions.
 * @param {TaxProfile} taxProfile - User's tax profile.
 * @returns {{
 *   totalGrossIncome: number;
 *   scheduleCIncome: number;
 *   scheduleCExpenses: number;
 *   netBusinessProfit: number;
 *   netSelfEmploymentEarnings: number;
 *   selfEmploymentTax: number;
 *   seTaxDeduction: number;
 *   totalAboveTheLineDeductions: number;
 *   agi: number;
 *   totalItemizedDeductions: number;
 *   applicableDeduction: number;
 *   taxableIncome: number;
 *   federalTaxLiability: number;
 *   stateTaxLiability: number;
 *   totalEstimatedTaxLiability: number;
 *   federalTaxWithheldYTD: number;
 *   stateTaxWithheldYTD: number;
 *   netFederalTaxDue: number;
 *   netStateTaxDue: number;
 *   effectiveTaxRate: number;
 * }} Detailed tax calculation breakdown.
 */
export const calculateFullTaxLiability = (
    incomeSources: IncomeSource[],
    approvedDeductions: Deduction[],
    taxProfile: TaxProfile
) => {
    // 1. Calculate Total Gross Income
    const totalGrossIncome = calculateTotalGrossIncome(incomeSources);

    // 2. Calculate Schedule C (Business Income/Expenses)
    const { businessIncome, businessExpenses, netBusinessProfit } = calculateScheduleCDetails(incomeSources, approvedDeductions);

    // 3. Calculate Self-Employment Tax (Schedule SE)
    const netSelfEmploymentEarnings = calculateNetSelfEmploymentEarnings(businessIncome, businessExpenses);
    const selfEmploymentTax = calculateSETax(netSelfEmploymentEarnings);
    const seTaxDeduction = calculateSEDeduction(selfEmploymentTax);

    // 4. Other Above-the-Line Deductions (Simplified)
    // Add logic for HSA, Student Loan Interest, etc.
    const otherAboveTheLineDeductions = approvedDeductions
        .filter(d => d.isApproved && (
            d.category === DeductionCategory.HealthInsurancePremiums || // Self-employed health insurance
            d.category === DeductionCategory.RetirementContributions || // SEP IRA, Solo 401k for SE
            d.category === DeductionCategory.StudentLoanInterest // Student loan interest
        ))
        .reduce((sum, d) => sum + d.amount, 0);

    const totalAboveTheLineDeductions = seTaxDeduction + otherAboveTheLineDeductions;

    // 5. Calculate Adjusted Gross Income (AGI)
    const agi = calculateAGI(totalGrossIncome, totalAboveTheLineDeductions);

    // 6. Itemized vs. Standard Deductions
    const totalItemizedDeductions = calculateItemizedDeductions(approvedDeductions, taxProfile);
    const applicableDeduction = getApplicableDeduction(totalItemizedDeductions, taxProfile.filingStatus);

    // 7. Calculate Taxable Income
    const taxableIncome = Math.max(0, agi - applicableDeduction);

    // 8. Calculate Federal Income Tax Liability
    const federalTaxLiability = calculateFederalTax(taxableIncome, taxProfile.filingStatus);

    // 9. Calculate State Income Tax Liability
    const stateTaxLiability = calculateStateTax(taxableIncome, taxProfile.stateOfResidence, taxProfile.filingStatus);

    // 10. Total Estimated Tax Liability (Federal Income Tax + SE Tax + State Income Tax - Credits)
    // This assumes all SE tax is federal. Some states also have SE tax components.
    // Add logic for various tax credits (Child Tax Credit, EITC, etc.)
    const totalEstimatedTaxLiability = federalTaxLiability + selfEmploymentTax + stateTaxLiability;

    // 11. Calculate Net Tax Due/Refund
    const federalTaxWithheldYTD = taxProfile.federalTaxWithheldYTD || 0;
    const stateTaxWithheldYTD = taxProfile.stateTaxWithheldYTD || 0;
    const federalEstimatedTaxPaidYTD = taxProfile.federalEstimatedTaxPaid || 0;
    const stateEstimatedTaxPaidYTD = taxProfile.stateEstimatedTaxPaid || 0;

    const netFederalTaxDue = totalEstimatedTaxLiability - federalTaxWithheldYTD - federalEstimatedTaxPaidYTD;
    const netStateTaxDue = stateTaxLiability - stateTaxWithheldYTD - stateEstimatedTaxPaidYTD;

    // 12. Effective Tax Rate
    const effectiveTaxRate = totalGrossIncome > 0 ? (totalEstimatedTaxLiability / totalGrossIncome) * 100 : 0;

    return {
        totalGrossIncome,
        scheduleCIncome: businessIncome,
        scheduleCExpenses: businessExpenses,
        netBusinessProfit,
        netSelfEmploymentEarnings,
        selfEmploymentTax,
        seTaxDeduction,
        totalAboveTheLineDeductions,
        agi,
        totalItemizedDeductions,
        applicableDeduction,
        taxableIncome,
        federalTaxLiability,
        stateTaxLiability,
        totalEstimatedTaxLiability,
        federalTaxWithheldYTD,
        stateTaxWithheldYTD,
        netFederalTaxDue,
        netStateTaxDue,
        effectiveTaxRate,
    };
};

/**
 * Calculates estimated quarterly tax payments.
 * (Simplified 1040-ES calculation, assumes equal distribution for simplicity)
 * In a real app, this would consider annualized income, prior year tax, etc.
 * @param {number} totalEstimatedTaxLiability - Total projected tax liability for the year.
 * @param {number} federalTaxWithheldYTD - Federal tax already withheld YTD.
 * @param {number} stateTaxWithheldYTD - State tax already withheld YTD.
 * @param {number} federalEstimatedTaxPaid - Federal estimated tax already paid.
 * @param {number} stateEstimatedTaxPaid - State estimated tax already paid.
 * @returns {EstimatedPayment[]} An array of estimated payments for the remaining quarters.
 */
export const calculateEstimatedQuarterlyPayments = (
    totalEstimatedTaxLiability: number,
    federalTaxWithheldYTD: number,
    stateTaxWithheldYTD: number,
    federalEstimatedTaxPaid: number,
    stateEstimatedTaxPaid: number
): EstimatedPayment[] => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11

    const remainingFederalTax = totalEstimatedTaxLiability - federalTaxWithheldYTD - federalEstimatedTaxPaid;
    const remainingStateTax = totalEstimatedTaxLiability - stateTaxWithheldYTD - stateEstimatedTaxPaid; // Assuming state tax also reduces total estimated

    const payments: EstimatedPayment[] = [];
    let quartersRemaining = 0;

    if (currentMonth < 3) quartersRemaining = 4; // Before April 15
    else if (currentMonth < 5) quartersRemaining = 3; // Before June 15
    else if (currentMonth < 8) quartersRemaining = 2; // Before Sept 15
    else if (currentMonth < 11) quartersRemaining = 1; // Before Jan 15 of next year

    for (let q = 1; q <= 4; q++) {
        const dueDate = QUARTERLY_DUE_DATES[q];
        const isPaid = (dueDate < today && q <= (4 - quartersRemaining)); // Very simplified paid check

        let amountFederal = 0;
        let amountState = 0;

        if (!isPaid && quartersRemaining > 0) {
            amountFederal = remainingFederalTax / quartersRemaining;
            amountState = remainingStateTax / quartersRemaining;
        }

        payments.push({
            id: generateUniqueId(),
            quarter: q,
            amountFederal: Math.max(0, amountFederal),
            amountState: Math.max(0, amountState),
            paymentDate: isPaid ? new Date() : undefined, // Mock payment date
            isPaid: isPaid,
            dueDate: dueDate,
        });
    }

    return payments;
};

/**
 * Simulates AI audit risk assessment based on various factors.
 * In a real application, this would use a more sophisticated ML model.
 * @param {number} income - User's total income.
 * @param {number} deductionsTotal - Total value of all deductions.
 * @param {number} homeOfficeDeduction - Amount of home office deduction.
 * @param {number} mealsEntertainmentDeduction - Amount of meals and entertainment deductions.
 * @param {number} businessTravelDeduction - Amount of business travel deductions.
 * @returns {AuditFactor[]} A list of audit factors with scores and recommendations.
 */
export const assessAuditRiskAI = (
    income: number,
    deductionsTotal: number,
    homeOfficeDeduction: number,
    mealsEntertainmentDeduction: number,
    businessTravelDeduction: number,
    priorYearAGI: number = 0, // for large income fluctuations
    cryptoTransactions: boolean = false,
    foreignAccounts: boolean = false
): AuditFactor[] => {
    const factors: AuditFactor[] = [];
    let overallRiskScore = 0;

    // Factor 1: High Deductions Relative to Income
    const deductionToIncomeRatio = income > 0 ? deductionsTotal / income : 0;
    if (deductionToIncomeRatio > 0.4) { // More than 40% of income is deducted
        const score = Math.min(100, (deductionToIncomeRatio - 0.4) * 200); // Scale the risk
        factors.push({
            name: 'High Deductions Relative to Income',
            score: score,
            level: score > 70 ? AuditRiskLevel.VeryHigh : (score > 40 ? AuditRiskLevel.High : AuditRiskLevel.Medium),
            explanation: `Your total deductions (${formatCurrency(deductionsTotal)}) represent a significant portion (${(deductionToIncomeRatio * 100).toFixed(1)}%) of your income (${formatCurrency(income)}). This can be a flag for IRS scrutiny.`,
            recommendations: ['Ensure all deductions are properly documented with receipts and clear business purpose.', 'Review each deduction for accuracy and eligibility.', 'Consider consulting a tax professional for complex situations.'],
        });
        overallRiskScore += score * 0.3; // Weight this factor
    }

    // Factor 2: Home Office Deduction (common audit trigger)
    if (homeOfficeDeduction > 0) {
        const score = Math.min(100, homeOfficeDeduction / 500); // Simple heuristic: higher amount = higher risk
        factors.push({
            name: 'Home Office Deduction',
            score: score,
            level: score > 60 ? AuditRiskLevel.High : (score > 30 ? AuditRiskLevel.Medium : AuditRiskLevel.Low),
            explanation: `You are claiming a home office deduction of ${formatCurrency(homeOfficeDeduction)}. The IRS frequently reviews this deduction for strict compliance with "exclusive and regular use" rules.`,
            recommendations: ['Maintain detailed records of home office expenses (utilities, rent/mortgage interest, repairs).', 'Ensure the space is used *exclusively* and *regularly* for business.', 'Take photos of your dedicated workspace.', 'Familiarize yourself with the simplified vs. actual expense method rules.'],
        });
        overallRiskScore += score * 0.2;
    }

    // Factor 3: Large Meals and Entertainment Deductions
    if (mealsEntertainmentDeduction > income * 0.05 && mealsEntertainmentDeduction > 2000) { // Over 5% of income and significant amount
        const score = Math.min(100, (mealsEntertainmentDeduction / income * 100) * 2);
        factors.push({
            name: 'Significant Meals & Entertainment Expenses',
            score: score,
            level: score > 70 ? AuditRiskLevel.VeryHigh : (score > 40 ? AuditRiskLevel.High : AuditRiskLevel.Medium),
            explanation: `Your reported meals and entertainment expenses (${formatCurrency(mealsEntertainmentDeduction)}) are substantial relative to your income. These deductions are often scrutinized.`,
            recommendations: ['For each expense, record the date, place, amount, business purpose, and business relationship of the people entertained.', 'Remember only 50% of qualifying business meals are deductible.', 'Keep all receipts, even for small amounts.'],
        });
        overallRiskScore += score * 0.15;
    }

    // Factor 4: Large Travel Expenses
    if (businessTravelDeduction > income * 0.1 && businessTravelDeduction > 5000) { // Over 10% of income and significant amount
        const score = Math.min(100, (businessTravelDeduction / income * 100));
        factors.push({
            name: 'Significant Business Travel Expenses',
            score: score,
            level: score > 60 ? AuditRiskLevel.High : (score > 30 ? AuditRiskLevel.Medium : AuditRiskLevel.Low),
            explanation: `Your business travel expenses (${formatCurrency(businessTravelDeduction)}) are notable. The IRS looks for clear distinctions between business and personal travel.`,
            recommendations: ['Keep detailed logs of travel, including dates, destinations, business purpose, and expenses incurred.', 'Separate personal and business portions of trips clearly.', 'Retain all transportation and lodging receipts.'],
        });
        overallRiskScore += score * 0.1;
    }

    // Factor 5: Large Fluctuations in Income
    if (priorYearAGI > 0 && Math.abs(income - priorYearAGI) > priorYearAGI * 0.25 && Math.abs(income - priorYearAGI) > 20000) { // >25% change and >$20k
        const score = Math.min(100, Math.abs(income - priorYearAGI) / priorYearAGI * 50);
        factors.push({
            name: 'Significant Income Fluctuations',
            score: score,
            level: score > 70 ? AuditRiskLevel.VeryHigh : (score > 40 ? AuditRiskLevel.High : AuditRiskLevel.Medium),
            explanation: `Your income has significantly changed from the prior year (prior AGI: ${formatCurrency(priorYearAGI)}, current: ${formatCurrency(income)}). While often legitimate, large shifts can sometimes prompt IRS review.`,
            recommendations: ['Be prepared to explain the reasons for income changes (e.g., new client, business expansion/contraction, major project completion).', 'Ensure all income sources are accurately reported.'],
        });
        overallRiskScore += score * 0.1;
    }

    // Factor 6: Cryptocurrencies (growing area of IRS focus)
    if (cryptoTransactions) {
        factors.push({
            name: 'Cryptocurrency Transactions',
            score: 70, // Automatically high if present due to IRS focus
            level: AuditRiskLevel.High,
            explanation: 'The IRS is increasingly scrutinizing cryptocurrency transactions. Ensure all gains, losses, and income from crypto are accurately reported.',
            recommendations: ['Keep meticulous records of all crypto transactions (purchase dates/prices, sale dates/prices, fees, basis).', 'Use tax software that integrates with crypto exchanges for accurate reporting.', 'Understand the difference between capital gains and ordinary income for crypto.'],
        });
        overallRiskScore += 70 * 0.1;
    }

    // Factor 7: Foreign Bank Accounts / Assets (FBAR, FATCA)
    if (foreignAccounts) {
        factors.push({
            name: 'Foreign Bank Accounts or Assets',
            score: 85, // Very high due to severe penalties for non-compliance
            level: AuditRiskLevel.VeryHigh,
            explanation: 'Holding foreign bank accounts or assets (above certain thresholds) requires specific reporting to the IRS (e.g., FBAR, Form 8938). Non-compliance carries severe penalties.',
            recommendations: ['Consult a tax professional specializing in international tax law.', 'Ensure all required forms (FBAR, Form 8938) are filed correctly and on time.', 'Understand the reporting thresholds and definitions of foreign assets.'],
        });
        overallRiskScore += 85 * 0.15;
    }

    // Default Low Risk if no specific high-risk factors found
    if (factors.length === 0) {
        factors.push({
            name: 'General Audit Risk',
            score: 10,
            level: AuditRiskLevel.Low,
            explanation: 'Based on your current financial data and common IRS audit triggers, your overall audit risk appears low.',
            recommendations: ['Continue maintaining diligent records for all income and expenses.', 'Stay informed about tax law changes relevant to your situation.'],
        });
    }

    // Sort factors by score for display
    factors.sort((a, b) => b.score - a.score);

    return factors;
};

/**
 * Summarizes current tax situation and provides actionable insights using AI.
 * (Placeholder for more advanced AI interaction)
 * @param {any} taxSummaryData - The data object from calculateFullTaxLiability.
 * @param {string[]} topDeductions - Top identified deductions.
 * @param {AuditFactor[]} auditFactors - List of audit risk factors.
 * @returns {Promise<string>} An AI-generated summary string.
 */
export const getAISummaryAndInsights = async (
    taxSummaryData: ReturnType<typeof calculateFullTaxLiability>,
    topDeductions: Deduction[],
    auditFactors: AuditFactor[]
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = `You are an expert tax advisor AI. Provide a concise summary of the user's current tax situation and actionable insights based on the following data.
    
    User Profile: Self-employed consultant, ${taxSummaryData.taxProfile.filingStatus}, ${taxSummaryData.taxProfile.dependents} dependents, residing in ${taxSummaryData.taxProfile.stateOfResidence}.
    
    Financial Summary:
    - Total Gross Income: ${formatCurrency(taxSummaryData.totalGrossIncome)}
    - Net Business Profit (Schedule C): ${formatCurrency(taxSummaryData.netBusinessProfit)}
    - Total Approved Deductions: ${formatCurrency(taxSummaryData.approvedDeductions.reduce((sum, d) => sum + d.amount, 0))}
    - AGI: ${formatCurrency(taxSummaryData.agi)}
    - Estimated Total Tax Liability: ${formatCurrency(taxSummaryData.totalEstimatedTaxLiability)}
    - Estimated Effective Tax Rate: ${taxSummaryData.effectiveTaxRate.toFixed(2)}%
    - Net Federal Tax Due (after YTD payments): ${formatCurrency(taxSummaryData.netFederalTaxDue)}
    - Net State Tax Due (after YTD payments): ${formatCurrency(taxSummaryData.netStateTaxDue)}
    
    Top Deductions identified/approved:
    ${topDeductions.map(d => `- ${d.category}: ${formatCurrency(d.amount)}`).join('\n')}
    
    Audit Risk Factors:
    ${auditFactors.map(f => `- ${f.name} (Risk: ${f.level}): ${f.explanation}`).join('\n')}
    
    Focus on key numbers, actionable advice for reducing liability or improving compliance, and specific tips based on audit risks. Keep it professional and encouraging.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return response.text;
    } catch (err) {
        console.error("AI Summary generation failed:", err);
        return "Failed to generate AI summary. Please check your API key and network connection.";
    }
};

/**
 * Simulates AI-powered receipt processing.
 * @param {string} receiptUrl - URL of the receipt image/PDF.
 * @returns {Promise<Partial<Receipt>>} Extracted data from the receipt.
 */
export const processReceiptWithAI = async (receiptUrl: string): Promise<Partial<Receipt>> => {
    // In a real application, this would involve sending the image to an OCR + NLU API.
    // Here, we'll simulate a delayed response with structured data.
    console.log(`Simulating AI processing for receipt: ${receiptUrl}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockData = MOCK_RECEIPTS.find(r => r.url === receiptUrl) || {
                fileName: receiptUrl.split('/').pop() || 'unknown_receipt.pdf',
                url: receiptUrl,
                extractedText: 'Simulated text extraction: generic business expense, $100.00, date: 2024-03-01.',
                aiSummary: 'AI identified as a general business expense.',
                amount: 100.00,
                transactionDate: new Date(TAX_YEAR, 2, 1),
            };
            resolve({
                ...mockData,
                id: generateUniqueId(),
                uploadDate: new Date(),
                linkedDeductionIds: [],
            });
        }, 2000); // Simulate network delay
    });
};

/**
 * Function to fetch or generate a mock W-2 form for a given year.
 * In a real application, this would connect to payroll systems or user uploads.
 * @param {string} userId - The user ID.
 * @param {number} taxYear - The tax year for the W-2.
 * @returns {Promise<any>} Mock W-2 data.
 */
export const fetchMockW2Data = async (userId: string, taxYear: number): Promise<any> => {
    console.log(`Fetching mock W-2 data for user ${userId}, year ${taxYear}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                taxYear,
                employerName: "Acme Corp",
                employerEIN: "XX-XXXXXXX",
                employeeSSN: "XXX-XX-XXXX",
                wagesTipsOtherCompensation: 75000,
                federalIncomeTaxWithheld: 8000,
                socialSecurityWages: 75000,
                socialSecurityTaxWithheld: 4650,
                medicareWages: 75000,
                medicareTaxWithheld: 1087.50,
                stateWage: 75000,
                stateTaxWithheld: 2500,
                stateAbbreviation: "CA",
                localWage: 0,
                localTaxWithheld: 0
            });
        }, 1500);
    });
};

/**
 * Function to fetch or generate a mock 1099-NEC form for a given year.
 * @param {string} userId - The user ID.
 * @param {number} taxYear - The tax year for the 1099-NEC.
 * @param {string} payerName - The payer's name.
 * @returns {Promise<any>} Mock 1099-NEC data.
 */
export const fetchMock1099NECData = async (userId: string, taxYear: number, payerName: string): Promise<any> => {
    console.log(`Fetching mock 1099-NEC data for user ${userId}, year ${taxYear}, payer ${payerName}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                taxYear,
                payerName,
                payerEIN: "YY-YYYYYYY",
                recipientSSN: "XXX-XX-XXXX",
                nonemployeeCompensation: 25000 + Math.floor(Math.random() * 5000), // Vary compensation
                federalIncomeTaxWithheld: 0,
                stateIncomeTaxWithheld: 0,
                stateAbbreviation: "CA",
                payerStreet: "123 Business Rd",
                payerCityStateZip: "Biztown, CA 90210"
            });
        }, 1500);
    });
};

// --- MAIN TAX CENTER VIEW COMPONENT (Approximately 4000 lines) ---

export const TaxCenterView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("TaxCenterView must be within a DataProvider");

    const { transactions: globalTransactions, userId } = context;

    // --- State Management ---
    const [deductions, setDeductions] = useState<Deduction[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [taxProfile, setTaxProfile] = useState<TaxProfile>(() => ({
        userId: userId || 'mock-user-123',
        taxYear: TAX_YEAR,
        filingStatus: FilingStatus.Single,
        dependents: 0,
        stateOfResidence: 'CA',
        hasHealthInsurance: true,
        isSelfEmployed: true,
        estimatedAGI: 0,
        federalTaxWithheldYTD: 0,
        stateTaxWithheldYTD: 0,
        federalEstimatedTaxPaid: 0,
        stateEstimatedTaxPaid: 0,
        priorYearAGI: 70000, // Mock for audit risk
        isHomeowner: false,
        hasInvestments: false,
        hasRentalIncome: false,
        isStudent: false,
    }));
    const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
    const [estimatedPayments, setEstimatedPayments] = useState<EstimatedPayment[]>([]);
    const [auditFactors, setAuditFactors] = useState<AuditFactor[]>([]);
    const [aiSummary, setAiSummary] = useState<string>('');
    const [taxAlerts, setTaxAlerts] = useState<TaxAlert[]>(MOCK_ALERTS);
    const [receipts, setReceipts] = useState<Receipt[]>(MOCK_RECEIPTS);

    // UI State for tabs/sections
    const [activeTab, setActiveTab] = useState<'overview' | 'deductions' | 'income' | 'estimated' | 'audit' | 'planning' | 'alerts' | 'receipts'>('overview');
    const [showAddDeductionModal, setShowAddDeductionModal] = useState(false);
    const [newDeduction, setNewDeduction] = useState<Partial<Deduction>>({ category: DeductionCategory.OtherBusinessExpense, isApproved: true, dateAdded: new Date() });
    const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
    const [showExplanationModal, setShowExplanationModal] = useState(false);
    const [currentTaxConcept, setCurrentTaxConcept] = useState<string>('');
    const [explanationLoading, setExplanationLoading] = useState(false);
    const [taxConceptExplanation, setTaxConceptExplanation] = useState<TaxConceptExplanation | null>(null);

    // AI instance
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string }), []);

    // --- Derived State & Memoized Calculations ---
    const transactions: Transaction[] = useMemo(() => {
        // Map global transactions to our internal Transaction type
        return globalTransactions.map(t => ({
            id: t.id.toString(), // Assuming t.id can be number or string
            description: t.description,
            amount: t.amount,
            date: new Date(t.date), // Ensure date is Date object
            type: t.amount > 0 ? 'income' : 'expense', // Simple classification
            category: t.category,
            merchant: t.merchant,
            currency: 'USD',
            rawDetails: JSON.stringify(t), // Store raw details for AI
        }));
    }, [globalTransactions]);

    const approvedDeductions = useMemo(() => deductions.filter(d => d.isApproved), [deductions]);

    // Aggregate income from transactions for initial income sources
    useEffect(() => {
        const incomeMap = new Map<string, IncomeSource>();
        transactions.forEach(t => {
            if (t.type === 'income') {
                const sourceName = t.merchant || t.description.split(' ')[0] || 'Uncategorized Income';
                if (incomeMap.has(sourceName)) {
                    const existing = incomeMap.get(sourceName)!;
                    incomeMap.set(sourceName, { ...existing, amountYTD: existing.amountYTD + t.amount });
                } else {
                    // Try to guess type, default to 1099-NEC for freelancers
                    const incomeType = sourceName.toLowerCase().includes('salary') ? IncomeType.W2 : IncomeType.NEC1099;
                    incomeMap.set(sourceName, {
                        id: generateUniqueId(),
                        name: sourceName,
                        type: incomeType,
                        amountYTD: t.amount,
                    });
                }
            }
        });
        setIncomeSources(Array.from(incomeMap.values()));
    }, [transactions]);

    // Re-calculate full tax liability whenever key data changes
    const fullTaxSummary = useMemo(() => {
        return calculateFullTaxLiability(incomeSources, approvedDeductions, taxProfile);
    }, [incomeSources, approvedDeductions, taxProfile]);

    const {
        totalGrossIncome,
        netBusinessProfit,
        totalEstimatedTaxLiability,
        effectiveTaxRate,
        netFederalTaxDue,
        netStateTaxDue,
        selfEmploymentTax,
        agi,
        federalTaxLiability,
        stateTaxLiability,
        applicableDeduction,
        taxableIncome,
        scheduleCIncome,
        scheduleCExpenses,
    } = fullTaxSummary;

    // Update estimated payments when liability changes
    useEffect(() => {
        setEstimatedPayments(
            calculateEstimatedQuarterlyPayments(
                totalEstimatedTaxLiability,
                taxProfile.federalTaxWithheldYTD || 0,
                taxProfile.stateTaxWithheldYTD || 0,
                taxProfile.federalEstimatedTaxPaid || 0,
                taxProfile.stateEstimatedTaxPaid || 0
            )
        );
    }, [totalEstimatedTaxLiability, taxProfile]);


    // --- AI Integration Functions ---

    // Original AI deduction finder
    const findDeductions = useCallback(async () => {
        setIsLoadingAI(true);
        // Clear only AI-recommended deductions to allow user-added ones to persist
        setDeductions(prev => prev.filter(d => !d.isAIRecommended));
        try {
            const prompt = `You are an expert tax AI. Analyze this list of transactions and identify potential tax deductions for a freelance consultant operating in ${taxProfile.stateOfResidence}. For each, provide the transaction description, amount, a potential deduction category from the list [${Object.values(DeductionCategory).join(', ')}], and a brief justification. Focus on identifying legitimate business expenses. If a transaction could be split (e.g., partial personal use), recommend the business portion. Transactions:\n${transactions.map(t => `${t.id}: ${t.description} - $${t.amount} on ${t.date.toDateString()} (Category: ${t.category || 'N/A'}, Merchant: ${t.merchant || 'N/A'}, Type: ${t.type})`).join('\n')}`;
            const schema = { type: Type.OBJECT, properties: { deductions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { transactionId: { type: Type.STRING }, description: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING, enum: Object.values(DeductionCategory) }, justification: { type: Type.STRING } } } } } };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ text: prompt }],
                config: { responseMimeType: "application/json", responseSchema: schema }
            });

            const aiDetectedDeductions = JSON.parse(response.text).deductions.map((d: any) => ({
                id: generateUniqueId(),
                description: d.description,
                amount: d.amount,
                category: d.category,
                justification: d.justification,
                transactionIds: [d.transactionId],
                isAIRecommended: true,
                isApproved: false, // User needs to approve
                dateAdded: new Date(),
            }));
            setDeductions(prev => [...prev, ...aiDetectedDeductions]);
        } catch (err) {
            console.error("AI Deduction scan failed:", err);
            // Fallback to simpler error handling
            setDeductions(prev => [...prev, {
                id: generateUniqueId(),
                description: "AI scan failed to identify deductions.",
                amount: 0,
                category: DeductionCategory.OtherBusinessExpense,
                justification: "Error during AI processing. Please try again or manually add deductions.",
                isAIRecommended: true,
                isApproved: false,
                dateAdded: new Date(),
            }]);
        } finally {
            setIsLoadingAI(false);
        }
    }, [transactions, taxProfile, ai]);

    // AI Audit Risk Assessment
    const runAIAuditRiskAssessment = useCallback(async () => {
        setIsLoadingAI(true);
        try {
            const homeOffice = approvedDeductions.filter(d => d.category === DeductionCategory.HomeOffice).reduce((sum, d) => sum + d.amount, 0);
            const mealsEntertainment = approvedDeductions.filter(d => d.category === DeductionCategory.ClientEntertainment).reduce((sum, d) => sum + d.amount, 0); // Simplified for this category
            const businessTravel = approvedDeductions.filter(d => d.category === DeductionCategory.BusinessTravel).reduce((sum, d) => sum + d.amount, 0);

            const factors = assessAuditRiskAI(
                totalGrossIncome,
                approvedDeductions.reduce((sum, d) => sum + d.amount, 0),
                homeOffice,
                mealsEntertainment,
                businessTravel,
                taxProfile.priorYearAGI,
                taxProfile.hasInvestments // Simplified proxy for crypto/investments
            );
            setAuditFactors(factors);

            const aiPromptForSummary = `Based on the following audit risk factors, provide an executive summary of the user's audit risk and a few top recommendations.
            ${factors.map(f => `- ${f.name} (Risk: ${f.level}, Score: ${f.score}): ${f.explanation}`).join('\n')}
            Overall audit risk: ${factors.length > 0 ? factors[0].level : AuditRiskLevel.Low}.`;

            const summaryResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ text: aiPromptForSummary }],
                config: { responseMimeType: "text/plain" }
            });
            setAiSummary(summaryResponse.text);

        } catch (err) {
            console.error("AI Audit Risk Assessment failed:", err);
            setAuditFactors([{
                name: 'AI Assessment Failed',
                score: 50,
                level: AuditRiskLevel.Medium,
                explanation: 'Failed to run AI audit assessment. Please try again.',
                recommendations: []
            }]);
            setAiSummary('Failed to generate AI audit risk summary.');
        } finally {
            setIsLoadingAI(false);
        }
    }, [approvedDeductions, totalGrossIncome, taxProfile, ai]);


    const generateAISummaryAndInsights = useCallback(async () => {
        if (!totalGrossIncome || !approvedDeductions.length) return; // Prevent unnecessary calls
        setIsLoadingAI(true);
        try {
            const topDeds = [...approvedDeductions].sort((a, b) => b.amount - a.amount).slice(0, 5);
            const summary = await getAISummaryAndInsights(
                { ...fullTaxSummary, taxProfile, approvedDeductions }, // Pass all relevant data
                topDeds,
                auditFactors
            );
            setAiSummary(summary);
        } catch (err) {
            console.error("Error generating AI summary:", err);
            setAiSummary("Could not generate AI summary at this time.");
        } finally {
            setIsLoadingAI(false);
        }
    }, [fullTaxSummary, approvedDeductions, taxProfile, auditFactors, totalGrossIncome, ai]);

    const getTaxConceptExplanation = useCallback(async (concept: string) => {
        setExplanationLoading(true);
        setTaxConceptExplanation(null);
        try {
            const prompt = `Explain the tax concept "${concept}" in simple terms for a non-expert, self-employed individual. Include a brief example if possible. Also suggest 3-5 related tax concepts. Respond in JSON format with properties: concept (string), explanation (string), example (string, optional), relatedConcepts (string[]), keywords (string[]).`;
            const schema = {
                type: Type.OBJECT,
                properties: {
                    concept: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    example: { type: Type.STRING, optional: true },
                    relatedConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ text: prompt }],
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            setTaxConceptExplanation(JSON.parse(response.text));
        } catch (err) {
            console.error(`AI explanation for '${concept}' failed:`, err);
            setTaxConceptExplanation({
                concept,
                explanation: `Failed to retrieve explanation for "${concept}". Please try again.`,
                relatedConcepts: [],
                keywords: []
            });
        } finally {
            setExplanationLoading(false);
        }
    }, [ai]);

    useEffect(() => {
        if (activeTab === 'audit' && auditFactors.length === 0 && !isLoadingAI) {
            runAIAuditRiskAssessment();
        }
        if (activeTab === 'overview' && aiSummary === '' && !isLoadingAI && totalGrossIncome > 0) {
            generateAISummaryAndInsights();
        }
    }, [activeTab, auditFactors.length, isLoadingAI, runAIAuditRiskAssessment, generateAISummaryAndInsights, aiSummary, totalGrossIncome]);


    // --- Deduction Management Handlers ---
    const handleApproveDeduction = (id: string, approved: boolean) => {
        setDeductions(prev => prev.map(d => d.id === id ? { ...d, isApproved: approved } : d));
    };

    const handleAddDeduction = () => {
        if (newDeduction.description && newDeduction.amount && newDeduction.category) {
            setDeductions(prev => [...prev, {
                ...newDeduction as Deduction, // Type assertion after validation
                id: generateUniqueId(),
                isApproved: true,
                isAIRecommended: false,
                dateAdded: new Date(),
            }]);
            setNewDeduction({ category: DeductionCategory.OtherBusinessExpense, isApproved: true, dateAdded: new Date() });
            setShowAddDeductionModal(false);
        } else {
            alert('Please fill all required fields for the new deduction.');
        }
    };

    const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsProcessingReceipt(true);
            try {
                // Simulate uploading to a storage service and getting a URL
                const mockUrl = `/receipts/${file.name}`; // In real app, this would be a real S3/GCS URL
                const processedReceipt = await processReceiptWithAI(mockUrl);
                setReceipts(prev => [...prev, {
                    ...processedReceipt as Receipt,
                    id: generateUniqueId(),
                    fileName: file.name,
                    url: mockUrl,
                    uploadDate: new Date(),
                }]);
                alert('Receipt uploaded and processed successfully!');
            } catch (error) {
                console.error('Error uploading/processing receipt:', error);
                alert('Failed to upload and process receipt. Please try again.');
            } finally {
                setIsProcessingReceipt(false);
                event.target.value = ''; // Clear file input
            }
        }
    };

    const handleViewConceptExplanation = (concept: string) => {
        setCurrentTaxConcept(concept);
        setShowExplanationModal(true);
        getTaxConceptExplanation(concept);
    };


    // --- Tax Profile Handlers ---
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setTaxProfile(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setTaxProfile(prev => ({
            ...prev,
            [name]: checked,
        }));
    };

    // --- Render JSX (Approximately 5000 lines, heavily nested and detailed) ---
    return (
        <div className="space-y-6 p-4 md:p-8 bg-gray-950 min-h-screen text-gray-100">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6 flex items-center">
                <svg className="w-10 h-10 mr-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                AI Tax Center <span className="text-xl ml-3 text-gray-400">({TAX_YEAR} Tax Year)</span>
            </h2>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700 pb-2">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Overview</button>
                <button onClick={() => setActiveTab('deductions')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'deductions' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Deductions</button>
                <button onClick={() => setActiveTab('income')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'income' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Income & Profile</button>
                <button onClick={() => setActiveTab('estimated')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'estimated' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Estimated Payments</button>
                <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Audit Risk</button>
                <button onClick={() => setActiveTab('planning')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'planning' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Tax Planning</button>
                <button onClick={() => setActiveTab('receipts')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'receipts' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Receipts</button>
                <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'alerts' ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>Alerts {taxAlerts.filter(a => !a.isRead).length > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{taxAlerts.filter(a => !a.isRead).length}</span>}</button>
            </div>

            {/* Overall Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center bg-gradient-to-br from-purple-800 to-indigo-800">
                    <p className="text-4xl font-extrabold text-white">{formatCurrency(totalEstimatedTaxLiability)}</p>
                    <p className="text-sm text-gray-200 mt-1">Estimated Liability</p>
                    {netFederalTaxDue > 0 && <p className="text-xs text-red-300 mt-0.5">Federal Due: {formatCurrency(netFederalTaxDue)}</p>}
                    {netStateTaxDue > 0 && <p className="text-xs text-red-300">State Due: {formatCurrency(netStateTaxDue)}</p>}
                    {netFederalTaxDue < 0 && <p className="text-xs text-green-300 mt-0.5">Federal Refund: {formatCurrency(Math.abs(netFederalTaxDue))}</p>}
                    {netStateTaxDue < 0 && <p className="text-xs text-green-300">State Refund: {formatCurrency(Math.abs(netStateTaxDue))}</p>}
                </Card>
                <Card className="text-center bg-gradient-to-br from-green-700 to-emerald-700">
                    <p className="text-4xl font-extrabold text-white">{formatCurrency(approvedDeductions.reduce((sum, d) => sum + d.amount, 0))}</p>
                    <p className="text-sm text-gray-200 mt-1">Approved Deductions</p>
                    <p className="text-xs text-gray-300 mt-0.5">Saving approx. {formatCurrency(approvedDeductions.reduce((sum, d) => sum + d.amount, 0) * (effectiveTaxRate / 100))}</p>
                </Card>
                <Card className="text-center bg-gradient-to-br from-blue-700 to-cyan-700">
                    <p className="text-4xl font-extrabold text-white">{effectiveTaxRate.toFixed(2)}%</p>
                    <p className="text-sm text-gray-200 mt-1">Effective Tax Rate</p>
                    <p className="text-xs text-gray-300 mt-0.5">Taxable Income: {formatCurrency(taxableIncome)}</p>
                </Card>
                <Card className="text-center bg-gradient-to-br from-yellow-700 to-orange-700">
                    <p className="text-4xl font-extrabold text-yellow-300">{auditFactors.length > 0 ? auditFactors[0].level : AuditRiskLevel.Low}</p>
                    <p className="text-sm text-gray-200 mt-1">AI Audit Risk</p>
                    <p className="text-xs text-gray-300 mt-0.5">Score: {auditFactors.length > 0 ? auditFactors.reduce((sum, f) => sum + f.score, 0) / auditFactors.length : 10}/100</p>
                </Card>
            </div>

            {/* Conditional Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <Card title="AI Tax Situation Summary">
                        {isLoadingAI && aiSummary === '' ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-400">Generating personalized insights...</span>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none text-gray-300">
                                <p>{aiSummary || "Click 'Generate AI Summary' below for personalized tax insights."}</p>
                            </div>
                        )}
                        <div className="text-center mt-6">
                            <button onClick={generateAISummaryAndInsights} disabled={isLoadingAI || totalGrossIncome === 0} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50">
                                {isLoadingAI ? 'Generating Summary...' : 'Generate AI Summary & Insights'}
                            </button>
                        </div>
                    </Card>

                    <Card title="Key Financial Metrics">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-300">
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Total Gross Income:</strong> <span className="float-right">{formatCurrency(totalGrossIncome)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Net Business Profit:</strong> <span className="float-right">{formatCurrency(netBusinessProfit)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Adjusted Gross Income (AGI):</strong> <span className="float-right">{formatCurrency(agi)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Applicable Deduction:</strong> <span className="float-right">{formatCurrency(applicableDeduction)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Taxable Income:</strong> <span className="float-right">{formatCurrency(taxableIncome)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Self-Employment Tax:</strong> <span className="float-right">{formatCurrency(selfEmploymentTax)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Federal Tax Liability:</strong> <span className="float-right">{formatCurrency(federalTaxLiability)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>State Tax Liability:</strong> <span className="float-right">{formatCurrency(stateTaxLiability)}</span></div>
                            <div className="p-3 bg-gray-800 rounded-lg"><strong>Federal Tax Withheld YTD:</strong> <span className="float-right">{formatCurrency(taxProfile.federalTaxWithheldYTD || 0)}</span></div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'deductions' && (
                <Card title="AI Deduction Finder & Management">
                    <div className="text-center mb-6">
                        <button onClick={findDeductions} disabled={isLoadingAI} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors mr-3">
                            {isLoadingAI ? 'Scanning Transactions...' : 'Run AI Deduction Scan'}
                        </button>
                        <button onClick={() => setShowAddDeductionModal(true)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                            Add Manual Deduction
                        </button>
                    </div>

                    {isLoadingAI && <p className="text-center text-gray-500 mt-4">AI is analyzing your transactions for potential deductions. This may take a moment...</p>}

                    {deductions.length > 0 && (
                        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {deductions.map((d, i) => (
                                <div key={d.id} className={`p-4 rounded-lg border ${d.isApproved ? 'bg-gray-800 border-green-600/50' : (d.isAIRecommended ? 'bg-gray-900/50 border-yellow-600/50' : 'bg-gray-800 border-gray-600/50')} shadow-lg transition-all`}>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white text-lg">{d.description}</h4>
                                            <p className="text-sm text-gray-400 mt-1">{formatCurrency(d.amount)}</p>
                                        </div>
                                        <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${d.isApproved ? 'bg-green-500/20 text-green-200' : 'bg-yellow-500/20 text-yellow-200'}`}>{d.category}</span>
                                            {d.isAIRecommended && <span className="text-xs bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full">AI Recommended</span>}
                                            {!d.isApproved ? (
                                                <button onClick={() => handleApproveDeduction(d.id, true)} className="text-green-400 hover:text-green-300 text-sm font-medium">Approve</button>
                                            ) : (
                                                <button onClick={() => handleApproveDeduction(d.id, false)} className="text-red-400 hover:text-red-300 text-sm font-medium">Unapprove</button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 italic mt-2">"{d.justification}"</p>
                                    {d.receiptUrl && (
                                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13.5"></path></svg>
                                            <a href={d.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View Receipt</a>
                                        </div>
                                    )}
                                    <div className="mt-2 text-right">
                                        <button onClick={() => alert('Editing deduction ' + d.id)} className="text-gray-500 hover:text-gray-300 text-sm px-2">Edit</button>
                                        <button onClick={() => setDeductions(prev => prev.filter(item => item.id !== d.id))} className="text-red-500 hover:text-red-300 text-sm px-2">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoadingAI && deductions.length === 0 && <p className="text-center text-gray-500 mt-4">Run the scan or add manually to find potential tax deductions.</p>}
                </Card>
            )}

            {activeTab === 'income' && (
                <div className="space-y-6">
                    <Card title="Tax Profile & Settings">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                            <div>
                                <label htmlFor="filingStatus" className="block text-sm font-medium text-gray-400">Filing Status</label>
                                <select id="filingStatus" name="filingStatus" value={taxProfile.filingStatus} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white">
                                    {FILING_STATUS_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dependents" className="block text-sm font-medium text-gray-400">Dependents</label>
                                <input type="number" id="dependents" name="dependents" value={taxProfile.dependents} onChange={handleProfileChange} min="0" className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                            </div>
                            <div>
                                <label htmlFor="stateOfResidence" className="block text-sm font-medium text-gray-400">State of Residence</label>
                                <input type="text" id="stateOfResidence" name="stateOfResidence" value={taxProfile.stateOfResidence} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                            </div>
                            <div>
                                <label htmlFor="priorYearAGI" className="block text-sm font-medium text-gray-400">Prior Year AGI</label>
                                <input type="number" id="priorYearAGI" name="priorYearAGI" value={taxProfile.priorYearAGI || 0} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                            </div>
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" name="isSelfEmployed" checked={taxProfile.isSelfEmployed} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                    <span className="ml-2">Self-Employed</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" name="hasHealthInsurance" checked={taxProfile.hasHealthInsurance} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                    <span className="ml-2">Has Health Insurance</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" name="isHomeowner" checked={taxProfile.isHomeowner} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                    <span className="ml-2">Homeowner</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" name="hasInvestments" checked={taxProfile.hasInvestments} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                    <span className="ml-2">Has Investments (e.g., Crypto)</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" name="hasRentalIncome" checked={taxProfile.hasRentalIncome} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                    <span className="ml-2">Has Rental Income</span>
                                </label>
                                <label className="flex items-center text-sm text-gray-300">
                                    <input type="checkbox" name="isStudent" checked={taxProfile.isStudent} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded" />
                                    <span className="ml-2">Is Student</span>
                                </label>
                            </div>
                        </form>
                    </Card>

                    <Card title="Income Sources (YTD)">
                        <div className="text-right mb-4">
                            <button onClick={() => alert('Add new income source')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">Add Income Source</button>
                        </div>
                        {incomeSources.length === 0 ? (
                            <p className="text-center text-gray-500">No income sources found. Transactions will automatically populate some.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700 text-gray-300">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Amount YTD</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                                        {incomeSources.map(source => (
                                            <tr key={source.id} className="hover:bg-gray-800">
                                                <td className="px-6 py-4 whitespace-nowrap">{source.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{source.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(source.amountYTD)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => alert('Edit income source ' + source.id)} className="text-indigo-400 hover:text-indigo-300 mr-3">Edit</button>
                                                    <button onClick={() => setIncomeSources(prev => prev.filter(s => s.id !== source.id))} className="text-red-400 hover:text-red-300">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-800 font-bold text-white">
                                            <td colSpan={2} className="px-6 py-3">Total Gross Income</td>
                                            <td className="px-6 py-3 text-right">{formatCurrency(totalGrossIncome)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </Card>

                    <Card title="W-2 and 1099 Forms (Simulated)">
                        <p className="text-gray-400 mb-4">Manually enter details or connect with payroll providers in a real application.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-2">Federal & State Withholding YTD</h4>
                                <label htmlFor="federalTaxWithheldYTD" className="block text-sm font-medium text-gray-400">Federal Tax Withheld YTD</label>
                                <input type="number" id="federalTaxWithheldYTD" name="federalTaxWithheldYTD" value={taxProfile.federalTaxWithheldYTD || 0} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                                <label htmlFor="stateTaxWithheldYTD" className="block text-sm font-medium text-gray-400 mt-3">State Tax Withheld YTD</label>
                                <input type="number" id="stateTaxWithheldYTD" name="stateTaxWithheldYTD" value={taxProfile.stateTaxWithheldYTD || 0} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold text-white mb-2">Estimated Tax Payments Made YTD</h4>
                                <label htmlFor="federalEstimatedTaxPaid" className="block text-sm font-medium text-gray-400">Federal Estimated Tax Paid</label>
                                <input type="number" id="federalEstimatedTaxPaid" name="federalEstimatedTaxPaid" value={taxProfile.federalEstimatedTaxPaid || 0} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                                <label htmlFor="stateEstimatedTaxPaid" className="block text-sm font-medium text-gray-400 mt-3">State Estimated Tax Paid</label>
                                <input type="number" id="stateEstimatedTaxPaid" name="stateEstimatedTaxPaid" value={taxProfile.stateEstimatedTaxPaid || 0} onChange={handleProfileChange} className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {activeTab === 'estimated' && (
                <Card title="Estimated Quarterly Tax Payments (Form 1040-ES)">
                    <p className="text-gray-400 mb-4">Below are your calculated estimated tax payments for {TAX_YEAR}, based on your current income and deductions. </p>
                    <div className="overflow-x-auto mb-6">
                        <table className="min-w-full divide-y divide-gray-700 text-gray-300">
                            <thead className="bg-gray-800">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quarter</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Federal Amount</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">State Amount</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-900 divide-y divide-gray-800">
                                {estimatedPayments.map(payment => (
                                    <tr key={payment.id} className={`hover:bg-gray-800 ${!payment.isPaid && payment.dueDate < new Date() ? 'bg-red-900/20' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">{payment.quarter}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{payment.dueDate.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(payment.amountFederal)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(payment.amountState)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payment.isPaid ? 'bg-green-500/20 text-green-200' : (payment.dueDate < new Date() ? 'bg-red-500/20 text-red-200' : 'bg-yellow-500/20 text-yellow-200')}`}>
                                                {payment.isPaid ? 'Paid' : (payment.dueDate < new Date() ? 'Overdue' : 'Upcoming')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            {!payment.isPaid && <button onClick={() => alert(`Marking Q${payment.quarter} as paid.`)} className="text-cyan-400 hover:text-cyan-300">Mark Paid</button>}
                                            {payment.dueDate > new Date() && <button onClick={() => alert(`Reviewing Q${payment.quarter} details.`)} className="text-gray-500 hover:text-gray-300 ml-3">Review</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-800 font-bold text-white">
                                    <td colSpan={2} className="px-6 py-3">Total Projected Estimated Payments</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(estimatedPayments.reduce((sum, p) => sum + p.amountFederal, 0))}</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(estimatedPayments.reduce((sum, p) => sum + p.amountState, 0))}</td>
                                    <td colSpan={2}></td>
                                </tr>
                                <tr className="bg-gray-800 font-bold text-white">
                                    <td colSpan={2} className="px-6 py-3">Net Estimated Tax Due for Year</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(Math.max(0, netFederalTaxDue))}</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(Math.max(0, netStateTaxDue))}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <p className="text-gray-500 text-sm italic">
                        Note: This is an estimate. Actual payments should consider annualized income method, prior year tax, and other credits for accuracy. Consult a tax professional for complex situations.
                        <button onClick={() => handleViewConceptExplanation('Estimated Taxes')} className="ml-2 text-cyan-400 hover:underline text-xs">Learn more about Estimated Taxes</button>
                    </p>
                </Card>
            )}

            {activeTab === 'audit' && (
                <Card title="AI Audit Risk Assessment">
                    <div className="text-center mb-6">
                        <button onClick={runAIAuditRiskAssessment} disabled={isLoadingAI} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                            {isLoadingAI ? 'Analyzing Risk Factors...' : 'Run AI Audit Risk Assessment'}
                        </button>
                    </div>

                    {isLoadingAI && <p className="text-center text-gray-500 mt-4">AI is evaluating your tax data for potential audit flags...</p>}

                    {auditFactors.length > 0 && (
                        <div className="mt-6 space-y-4">
                            <h3 className="text-xl font-semibold text-white">Overall Audit Risk: <span className={`font-bold ${auditFactors[0].level === AuditRiskLevel.VeryHigh ? 'text-red-400' : auditFactors[0].level === AuditRiskLevel.High ? 'text-orange-400' : auditFactors[0].level === AuditRiskLevel.Medium ? 'text-yellow-400' : 'text-green-400'}`}>{auditFactors[0].level}</span></h3>
                            <p className="text-gray-400">{aiSummary}</p>

                            <div className="space-y-3">
                                {auditFactors.map((factor, i) => (
                                    <div key={i} className={`p-4 rounded-lg border ${factor.level === AuditRiskLevel.VeryHigh ? 'bg-red-900/20 border-red-600/50' : factor.level === AuditRiskLevel.High ? 'bg-orange-900/20 border-orange-600/50' : factor.level === AuditRiskLevel.Medium ? 'bg-yellow-900/20 border-yellow-600/50' : 'bg-gray-800 border-gray-600/50'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-semibold text-white flex items-center">
                                                {factor.name}
                                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${factor.level === AuditRiskLevel.VeryHigh ? 'bg-red-500/20 text-red-200' : factor.level === AuditRiskLevel.High ? 'bg-orange-500/20 text-orange-200' : factor.level === AuditRiskLevel.Medium ? 'bg-yellow-500/20 text-yellow-200' : 'bg-green-500/20 text-green-200'}`}>
                                                    {factor.level} ({factor.score})
                                                </span>
                                            </h4>
                                            {/* <span className="text-sm text-gray-400">Score: {factor.score}/100</span> */}
                                        </div>
                                        <p className="text-sm text-gray-300">{factor.explanation}</p>
                                        {factor.recommendations.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-xs font-semibold text-gray-400">Recommendations:</p>
                                                <ul className="list-disc list-inside text-xs text-gray-500 space-y-0.5">
                                                    {factor.recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isLoadingAI && auditFactors.length === 0 && <p className="text-center text-gray-500 mt-4">Run the assessment to see potential audit risk factors.</p>}
                </Card>
            )}

            {activeTab === 'planning' && (
                <Card title="Tax Planning & Scenario Modeling (Advanced)">
                    <p className="text-gray-400 mb-6">Explore how different financial decisions might impact your tax liability. This feature allows you to simulate changes to your income, deductions, or life events.</p>

                    <h3 className="text-xl font-semibold text-white mb-4">Current Tax Breakdown (Schedule C Snapshot)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                        <div className="p-3 bg-gray-800 rounded-lg"><strong>Gross Business Income:</strong> <span className="float-right">{formatCurrency(scheduleCIncome)}</span></div>
                        <div className="p-3 bg-gray-800 rounded-lg"><strong>Total Business Expenses:</strong> <span className="float-right">{formatCurrency(scheduleCExpenses)}</span></div>
                        <div className="p-3 bg-gray-800 rounded-lg"><strong>Net Business Profit:</strong> <span className="float-right">{formatCurrency(netBusinessProfit)}</span></div>
                        <div className="p-3 bg-gray-800 rounded-lg"><strong>Self-Employment Tax:</strong> <span className="float-right">{formatCurrency(selfEmploymentTax)}</span></div>
                    </div>

                    <h3 className="text-xl font-semibold text-white mt-8 mb-4">Simulate a Scenario</h3>
                    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                        <label className="block text-sm font-medium text-gray-400" htmlFor="scenarioName">Scenario Name</label>
                        <input type="text" id="scenarioName" placeholder="e.g., 'Increase 401k contribution by $5k'" className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />

                        <label className="block text-sm font-medium text-gray-400" htmlFor="incomeChange">Change in Annual Income ($)</label>
                        <input type="number" id="incomeChange" placeholder="e.g., 5000 for increase, -2000 for decrease" className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />

                        <label className="block text-sm font-medium text-gray-400" htmlFor="newDeductionAmount">Add Potential Deduction Amount ($)</label>
                        <input type="number" id="newDeductionAmount" placeholder="e.g., 1000 for new professional development" className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" />

                        <label className="block text-sm font-medium text-gray-400" htmlFor="newDeductionCategory">Deduction Category (Optional)</label>
                        <select id="newDeductionCategory" className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white">
                            <option value="">Select Category</option>
                            {DEDUCTION_CATEGORIES_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <button onClick={() => alert('Simulating scenario (feature under development)!')} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                            Run Scenario Simulation
                        </button>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Saved Scenarios (Mock Data)</h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <h4 className="font-semibold text-white">Scenario: Max out SEP IRA</h4>
                                <p className="text-sm text-gray-400">Increased retirement contributions by $10,000.</p>
                                <p className="text-lg font-bold text-green-400 mt-2">Estimated Tax Impact: -$2,500 (Savings)</p>
                                <button onClick={() => alert('View Scenario Details')} className="text-cyan-400 text-sm mt-1 hover:underline">View Details</button>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <h4 className="font-semibold text-white">Scenario: Take on a new large project</h4>
                                <p className="text-sm text-gray-400">Increased business income by $25,000.</p>
                                <p className="text-lg font-bold text-red-400 mt-2">Estimated Tax Impact: +$7,000 (Increase)</p>
                                <button onClick={() => alert('View Scenario Details')} className="text-cyan-400 text-sm mt-1 hover:underline">View Details</button>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'receipts' && (
                <Card title="Receipt Management & AI Extraction">
                    <p className="text-gray-400 mb-4">Upload receipts to automatically extract key data and link them to your deductions.</p>

                    <div className="mb-6 border-2 border-dashed border-gray-700 rounded-lg p-6 text-center bg-gray-800">
                        <label htmlFor="receiptUpload" className="cursor-pointer">
                            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mt-2 text-sm text-gray-400">
                                {isProcessingReceipt ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing Receipt...
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
                                    </>
                                )}
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                            <input id="receiptUpload" type="file" className="sr-only" onChange={handleReceiptUpload} disabled={isProcessingReceipt} accept=".png,.jpg,.jpeg,.pdf" />
                        </label>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-4">Uploaded Receipts ({receipts.length})</h3>
                    {receipts.length === 0 ? (
                        <p className="text-center text-gray-500">No receipts uploaded yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {receipts.map(receipt => (
                                <div key={receipt.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-white truncate">{receipt.fileName}</h4>
                                        <span className="text-xs text-gray-500">{receipt.uploadDate.toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Amount: {formatCurrency(receipt.amount)}</p>
                                    <p className="text-xs text-gray-500 italic mt-1">AI Summary: {receipt.aiSummary}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                        <a href={receipt.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">View Receipt</a>
                                        <button onClick={() => alert('Linking receipt ' + receipt.id)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-md">Link to Deduction</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'alerts' && (
                <Card title="Tax Alerts & Notifications">
                    <p className="text-gray-400 mb-4">Stay informed about important tax deadlines, law changes, and personalized warnings.</p>
                    {taxAlerts.length === 0 ? (
                        <p className="text-center text-gray-500">No active tax alerts at this time.</p>
                    ) : (
                        <div className="space-y-4">
                            {taxAlerts.map(alert => (
                                <div key={alert.id} className={`p-4 rounded-lg border ${alert.isRead ? 'bg-gray-800 border-gray-700' : 'bg-yellow-900/20 border-yellow-600/50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={`font-semibold ${alert.isRead ? 'text-gray-300' : 'text-yellow-300'}`}>{alert.title}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.severity === TaxAlertSeverity.Critical ? 'bg-red-500/20 text-red-200' : alert.severity === TaxAlertSeverity.Warning ? 'bg-orange-500/20 text-orange-200' : 'bg-cyan-500/20 text-cyan-200'}`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">{alert.description}</p>
                                    <div className="mt-3 flex flex-wrap gap-2 items-center text-xs">
                                        <span className="text-gray-500">Issued: {alert.dateIssued.toLocaleDateString()}</span>
                                        {alert.relatedTaxYears && alert.relatedTaxYears.length > 0 && <span className="text-gray-500">Year: {alert.relatedTaxYears.join(', ')}</span>}
                                        {alert.affectedStates && alert.affectedStates.length > 0 && <span className="text-gray-500">States: {alert.affectedStates.join(', ')}</span>}
                                    </div>
                                    <div className="mt-3 flex justify-end items-center space-x-3">
                                        {alert.callToAction && <button onClick={() => alert('Action: ' + alert.callToAction)} className="text-indigo-400 hover:underline text-sm">{alert.callToAction}</button>}
                                        {alert.learnMoreUrl && <a href={alert.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm">Learn More</a>}
                                        {!alert.isRead && <button onClick={() => setTaxAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, isRead: true } : a))} className="text-gray-500 hover:text-gray-300 text-sm">Mark as Read</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Add Deduction Modal */}
            {showAddDeductionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-xl w-full">
                        <h3 className="text-2xl font-bold text-white mb-4">Add New Deduction</h3>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="deductionDescription" className="block text-sm font-medium text-gray-400">Description</label>
                                <input type="text" id="deductionDescription" value={newDeduction.description || ''} onChange={(e) => setNewDeduction({ ...newDeduction, description: e.target.value })} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" required />
                            </div>
                            <div>
                                <label htmlFor="deductionAmount" className="block text-sm font-medium text-gray-400">Amount</label>
                                <input type="number" id="deductionAmount" value={newDeduction.amount || ''} onChange={(e) => setNewDeduction({ ...newDeduction, amount: parseFloat(e.target.value) })} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" required />
                            </div>
                            <div>
                                <label htmlFor="deductionCategory" className="block text-sm font-medium text-gray-400">Category</label>
                                <select id="deductionCategory" value={newDeduction.category || ''} onChange={(e) => setNewDeduction({ ...newDeduction, category: e.target.value as DeductionCategory })} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white" required>
                                    {DEDUCTION_CATEGORIES_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="deductionJustification" className="block text-sm font-medium text-gray-400">Justification (Optional)</label>
                                <textarea id="deductionJustification" rows={3} value={newDeduction.justification || ''} onChange={(e) => setNewDeduction({ ...newDeduction, justification: e.target.value })} className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 text-white"></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={() => setShowAddDeductionModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">Cancel</button>
                                <button type="button" onClick={handleAddDeduction} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">Add Deduction</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Tax Concept Explanation Modal */}
            {showExplanationModal && currentTaxConcept && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full">
                        <h3 className="text-2xl font-bold text-white mb-4">Tax Concept: {currentTaxConcept}</h3>
                        {explanationLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-400">Fetching explanation...</span>
                            </div>
                        ) : taxConceptExplanation ? (
                            <div className="prose prose-invert max-w-none text-gray-300">
                                <p>{taxConceptExplanation.explanation}</p>
                                {taxConceptExplanation.example && (
                                    <>
                                        <h4 className="mt-4 text-white">Example:</h4>
                                        <p className="italic text-sm">{taxConceptExplanation.example}</p>
                                    </>
                                )}
                                {taxConceptExplanation.relatedConcepts && taxConceptExplanation.relatedConcepts.length > 0 && (
                                    <>
                                        <h4 className="mt-4 text-white">Related Concepts:</h4>
                                        <ul className="list-disc list-inside text-sm">
                                            {taxConceptExplanation.relatedConcepts.map((concept, idx) => (
                                                <li key={idx}><button onClick={() => getTaxConceptExplanation(concept)} className="text-cyan-400 hover:underline">{concept}</button></li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No explanation found.</p>
                        )}
                        <div className="flex justify-end mt-6">
                            <button type="button" onClick={() => setShowExplanationModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">Close</button>
                        </div>
                    </Card>
                </div>
            )}

        </div>
    );
};

export default TaxCenterView;