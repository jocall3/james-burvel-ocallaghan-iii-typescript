import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { PayRun, PayRunStatus } from '../../../types';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'; // Added CartesianGrid
import { Fragment } from 'react'; // Needed for Transition

// --- NEW TYPE DEFINITIONS (Substantially expanded for a real application) ---

// Employee Management
export interface EmployeePersonal {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    nationality: string;
    ssn: string; // Social Security Number - masked for display
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface EmployeeEmployment {
    employeeId: string;
    departmentId: string; // Link to Department
    position: string;
    hireDate: string; // YYYY-MM-DD
    terminationDate?: string; // YYYY-MM-DD
    status: 'Active' | 'On Leave' | 'Terminated';
    employeeType: 'Full-time' | 'Part-time' | 'Contractor';
    workLocation: string; // e.g., 'Remote', 'Office - NYC', 'Office - SF'
    managerId?: string; // Link to another Employee
}

export interface EmployeeCompensation {
    salaryType: 'Salary' | 'Hourly' | 'Commission';
    basePayRate: number; // Annual salary or hourly rate
    payFrequency: 'Weekly' | 'Bi-Weekly' | 'Semi-Monthly' | 'Monthly';
    overtimeEligible: boolean;
    commissionRate?: number; // Percentage
    bonusEligible: boolean;
    annualBonusTarget?: number; // Target percentage of base salary
    effectiveDate: string; // When this compensation structure became effective
}

export interface EmployeeTaxInfo {
    taxId: string; // W-4 / W-9 / equivalent identifier
    federalFilingStatus: 'Single' | 'Married Filing Jointly' | 'Married Filing Separately' | 'Head of Household' | 'Qualifying Widow(er)';
    federalAllowances: number;
    additionalFederalWithholding: number;
    stateTaxJurisdiction: string; // e.g., 'CA', 'NY'
    stateFilingStatus?: string;
    stateAllowances?: number;
    additionalStateWithholding?: number;
    localTaxJurisdiction?: string; // e.g., 'NYC'
    exemptFromFederalTax: boolean;
    exemptFromStateTax: boolean;
}

export interface EmployeeBenefitEnrollment {
    id: string; // Unique ID for this specific enrollment
    benefitId: string; // Link to Benefit
    enrollmentDate: string; // YYYY-MM-DD
    coverageType: 'Employee Only' | 'Employee + Spouse' | 'Employee + Children' | 'Family';
    employeeContribution: number; // Amount employee pays per pay period
    companyContribution: number; // Amount company pays per pay period
    status: 'Active' | 'Pending' | 'Waived';
}

export interface EmployeeDeduction {
    id: string; // Unique ID for this specific deduction
    deductionId: string; // Link to DeductionType
    amount: number; // Fixed amount or percentage (need to clarify with DeductionType)
    frequency: 'Per Pay Period' | 'One-Time';
    startDate: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
    isPreTax: boolean;
}

export interface EmployeePTO {
    ptoPolicyId: string; // Link to PTOPolicy
    accruedHours: number;
    usedHours: number;
    availableHours: number;
    lastUpdated: string;
}

export interface Employee {
    id: string;
    personal: EmployeePersonal;
    employment: EmployeeEmployment;
    compensation: EmployeeCompensation;
    taxInfo: EmployeeTaxInfo;
    benefits: EmployeeBenefitEnrollment[];
    deductions: EmployeeDeduction[];
    pto: EmployeePTO[];
    createdAt: string;
    updatedAt: string;
}

// Deduction and Benefit Configuration
export interface DeductionType {
    id: string;
    name: string;
    description: string;
    type: 'Medical' | 'Dental' | 'Vision' | '401K' | 'HSA' | 'FSA' | 'Life Insurance' | 'Loan Repayment' | 'Garnishments' | 'Other';
    isPreTax: boolean;
    employeeContributionType: 'Fixed Amount' | 'Percentage of Gross' | 'Percentage of Net';
    defaultAmountOrRate: number; // Default amount or percentage
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface BenefitType {
    id: string;
    name: string;
    description: string;
    category: 'Health' | 'Retirement' | 'Insurance' | 'Wellness' | 'Other';
    provider: string; // e.g., 'Blue Cross Blue Shield', 'Fidelity'
    costPerEmployee: number; // Company's cost per employee (per pay period/month)
    employeeCostShare: number; // Employee's typical share (percentage or fixed)
    requiresEnrollment: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PTOPolicy {
    id: string;
    name: string;
    type: 'Vacation' | 'Sick Leave' | 'Personal Leave' | 'Floating Holiday';
    accrualRate: number; // Hours per pay period or per year
    accrualFrequency: 'Per Pay Period' | 'Annually' | 'Monthly';
    maxAccrual?: number; // Max hours an employee can accrue
    rolloverPolicy: 'None' | 'Partial' | 'Full';
    rolloverLimit?: number; // Max hours to rollover
    active: boolean;
}

// Timesheet Management
export interface TimesheetEntry {
    id: string;
    employeeId: string;
    payPeriodId: string; // Link to specific PayRun period
    date: string; // YYYY-MM-DD
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    breakDuration: number; // Minutes
    hoursWorked: number; // Calculated
    overtimeHours: number; // Calculated
    doubleTimeHours: number; // Calculated
    status: 'Pending' | 'Approved' | 'Rejected' | 'Submitted';
    submittedBy: string; // Employee ID
    approvedBy?: string; // Manager ID
    submissionDate: string; // YYYY-MM-DD HH:MM
    approvalDate?: string; // YYYY-MM-DD HH:MM
    notes?: string;
}

// Reporting
export interface PayrollReport {
    id: string;
    name: string;
    type: 'Gross-to-Net' | 'Department Costs' | 'Tax Summary' | 'Benefit Costs' | 'Custom';
    parameters: any; // Dynamic object for report filters
    generatedDate: string;
    data: any[]; // The actual report data
    // status: 'Generated' | 'Failed';
    // generatedBy: string; // User ID
}

// Audit Log
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: string; // e.g., 'PAYROLL_RUN_INITIATED', 'EMPLOYEE_UPDATED', 'DEDUCTION_ADDED'
    entityType: string; // e.g., 'PayRun', 'Employee', 'DeductionType'
    entityId: string;
    details: string; // JSON string of changes or description
}

// Payroll Settings
export interface PayrollSettings {
    id: string;
    companyName: string;
    federalEIN: string;
    stateTaxId: string;
    defaultPayFrequency: 'Weekly' | 'Bi-Weekly' | 'Semi-Monthly' | 'Monthly';
    payrollCutoffDay: number; // Day of month for monthly, or day of week for weekly
    defaultPayDateOffset: number; // Days after period end
    bankAccountId: string; // Masked
    autoApproveTimesheets: boolean;
    allowEmployeeSelfService: boolean;
    emailNotificationsEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

// --- CONTEXT EXTENSION (Simulated) ---
// For a real app, DataContext would provide these. We'll mock them internally.
export interface EnhancedDataContextType {
    payRuns: PayRun[];
    employees: Employee[];
    deductionTypes: DeductionType[];
    benefitTypes: BenefitType[];
    ptoPolicies: PTOPolicy[];
    timesheetEntries: TimesheetEntry[];
    auditLogs: AuditLogEntry[];
    payrollSettings: PayrollSettings | null;

    // Actions (mocked)
    addEmployee: (employee: Employee) => Promise<void>;
    updateEmployee: (employee: Employee) => Promise<void>;
    deleteEmployee: (employeeId: string) => Promise<void>;
    addDeductionType: (deduction: DeductionType) => Promise<void>;
    updateDeductionType: (deduction: DeductionType) => Promise<void>;
    deleteDeductionType: (deductionId: string) => Promise<void>;
    addBenefitType: (benefit: BenefitType) => Promise<void>;
    updateBenefitType: (benefit: BenefitType) => Promise<void>;
    deleteBenefitType: (benefitId: string) => Promise<void>;
    addPTOPolicy: (policy: PTOPolicy) => Promise<void>;
    updatePTOPolicy: (policy: PTOPolicy) => Promise<void>;
    deletePTOPolicy: (policyId: string) => Promise<void>;
    addTimesheetEntry: (entry: TimesheetEntry) => Promise<void>;
    updateTimesheetEntry: (entry: TimesheetEntry) => Promise<void>;
    approveTimesheetEntry: (entryId: string, approvedBy: string) => Promise<void>;
    rejectTimesheetEntry: (entryId: string, rejectedBy: string, reason: string) => Promise<void>;
    updatePayrollSettings: (settings: PayrollSettings) => Promise<void>;
    addAuditLog: (log: AuditLogEntry) => Promise<void>;
    executePayRun: (payRunId: string) => Promise<void>; // Simulate
}

// Mock Data Context provider to extend the existing one for demonstration purposes
// In a real app, DataContext.tsx would be updated
export const MockDataContext = React.createContext<EnhancedDataContextType | undefined>(undefined);

// --- HELPER FUNCTIONS & UTILITIES ---

export const generateUniqueId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const formatCurrency = (amount: number, currency: string = 'USD', minimumFractionDigits: number = 2): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits, maximumFractionDigits: minimumFractionDigits + 2 }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export const maskSSN = (ssn: string): string => {
    if (!ssn || ssn.length !== 9) return 'XXX-XX-XXXX';
    return `XXX-XX-${ssn.substring(5)}`;
};

export const calculateGrossPay = (employee: Employee, timesheetEntries: TimesheetEntry[]): number => {
    let grossPay = 0;
    const { compensation } = employee;

    if (compensation.salaryType === 'Salary') {
        const annualSalary = compensation.basePayRate;
        switch (compensation.payFrequency) {
            case 'Weekly': grossPay = annualSalary / 52; break;
            case 'Bi-Weekly': grossPay = annualSalary / 26; break;
            case 'Semi-Monthly': grossPay = annualSalary / 24; break;
            case 'Monthly': grossPay = annualSalary / 12; break;
            default: grossPay = annualSalary / 26; break; // Default to bi-weekly
        }
    } else if (compensation.salaryType === 'Hourly') {
        const relevantTimesheets = timesheetEntries.filter(t => t.employeeId === employee.id && t.status === 'Approved'); // Assuming current period
        const totalRegularHours = relevantTimesheets.reduce((sum, t) => sum + t.hoursWorked, 0);
        const totalOvertimeHours = relevantTimesheets.reduce((sum, t) => sum + t.overtimeHours, 0);
        const totalDoubleTimeHours = relevantTimesheets.reduce((sum, t) => sum + t.doubleTimeHours, 0);

        grossPay = (totalRegularHours * compensation.basePayRate) +
                   (totalOvertimeHours * compensation.basePayRate * 1.5) +
                   (totalDoubleTimeHours * compensation.basePayRate * 2);
    }
    // Add commission logic here if applicable
    if (compensation.salaryType === 'Commission' && compensation.commissionRate) {
        // This would require actual sales data integration, let's simplify for now
        // For example, if we had a mock 'salesData' parameter
        const mockSales = Math.random() * 10000; // Mock sales for demonstration
        grossPay += mockSales * (compensation.commissionRate / 100);
    }

    return grossPay;
};

export const calculateDeductions = (employee: Employee, grossPay: number, deductionTypes: DeductionType[], benefitTypes: BenefitType[]): { preTax: number, postTax: number, total: number, breakdown: { id: string, name: string, amount: number }[] } => {
    let preTaxDeductions = 0;
    let postTaxDeductions = 0;
    const breakdown: { id: string, name: string, amount: number }[] = [];

    employee.deductions.forEach(empDeduction => {
        const type = deductionTypes.find(dt => dt.id === empDeduction.deductionId);
        if (!type || !type.active) return;

        let amount = 0;
        if (type.employeeContributionType === 'Fixed Amount') {
            amount = empDeduction.amount;
        } else if (type.employeeContributionType === 'Percentage of Gross') {
            amount = grossPay * (empDeduction.amount / 100);
        } else if (type.employeeContributionType === 'Percentage of Net') {
            // Net calculation is iterative with taxes, simplifying for now
            amount = grossPay * (empDeduction.amount / 100); // Placeholder, real logic is more complex
        }

        if (type.isPreTax) {
            preTaxDeductions += amount;
        } else {
            postTaxDeductions += amount;
        }
        breakdown.push({ id: type.id, name: type.name, amount });
    });

    // Add benefit contributions as deductions
    employee.benefits.forEach(empBenefit => {
        const benefitType = benefitTypes.find(bt => bt.id === empBenefit.benefitId);
        if (benefitType && empBenefit.status === 'Active') {
            // Assuming employeeContribution is per pay period
            const amount = empBenefit.employeeContribution;
            // Most health/retirement benefits are pre-tax, but depends on plan
            const isPreTaxBenefit = benefitType.category === 'Health' || benefitType.category === 'Retirement' || benefitType.category === 'FSA' || benefitType.category === 'HSA'; // Simplified
            if (isPreTaxBenefit) {
                preTaxDeductions += amount;
            } else {
                postTaxDeductions += amount;
            }
            breakdown.push({ id: benefitType.id, name: benefitType.name, amount });
        }
    });

    return { preTax: preTaxDeductions, postTax: postTaxDeductions, total: preTaxDeductions + postTaxDeductions, breakdown };
};

// Simplified Tax Calculation (highly complex in real-world, this is illustrative)
export const calculateTaxes = (
    employee: Employee,
    taxableGross: number,
    payFrequency: string,
    stateTaxJurisdiction: string, // 'CA', 'NY', etc.
    payrollSettings: PayrollSettings | null
): { federalTax: number, stateTax: number, localTax: number, totalTax: number } => {
    let federalTax = 0;
    let stateTax = 0;
    let localTax = 0;

    if (!payrollSettings) return { federalTax: 0, stateTax: 0, localTax: 0, totalTax: 0 };
    if (employee.taxInfo.exemptFromFederalTax) federalTax = 0;
    if (employee.taxInfo.exemptFromStateTax) stateTax = 0;

    // Federal Tax (FICA - Social Security & Medicare, Federal Income Tax)
    // This is a highly simplified mock. Real-world involves tax tables, W4 forms, etc.
    const payPeriodsPerYear = (payFrequency === 'Weekly' ? 52 : payFrequency === 'Bi-Weekly' ? 26 : payFrequency === 'Semi-Monthly' ? 24 : 12);
    const annualizedTaxableGross = taxableGross * payPeriodsPerYear;

    // FICA - Social Security (6.2% up to annual limit, e.g., $168,600 for 2024)
    const socialSecurityLimit = 168600; // Example 2024 limit
    federalTax += Math.min(taxableGross, Math.max(0, socialSecurityLimit - (employee.taxInfo.federalAllowances * 1000)) / payPeriodsPerYear) * 0.062; // Simplified allowance reduction

    // FICA - Medicare (1.45% no limit, plus additional 0.9% for high earners)
    federalTax += taxableGross * 0.0145;
    if (annualizedTaxableGross > 200000) { // simplified high earner check for additional medicare
        federalTax += taxableGross * 0.009;
    }

    // Federal Income Tax (very simplified)
    // This would use IRS tax tables based on filing status and allowances
    let federalIncomeTaxRate = 0.15; // Example flat rate
    if (employee.taxInfo.federalFilingStatus === 'Married Filing Jointly') federalIncomeTaxRate = 0.12;
    if (employee.taxInfo.federalAllowances > 0) federalIncomeTaxRate = Math.max(0, federalIncomeTaxRate - (employee.taxInfo.federalAllowances * 0.01));
    federalTax += taxableGross * federalIncomeTaxRate;
    federalTax += employee.taxInfo.additionalFederalWithholding;

    // State Tax (extremely simplified)
    // In reality, this requires specific state tax tables and rules
    if (!employee.taxInfo.exemptFromStateTax) {
        if (stateTaxJurisdiction === 'CA') {
            stateTax = taxableGross * 0.05; // Example CA rate
            if (employee.taxInfo.additionalStateWithholding) stateTax += employee.taxInfo.additionalStateWithholding;
        } else if (stateTaxJurisdiction === 'NY') {
            stateTax = taxableGross * 0.04; // Example NY rate
            if (employee.taxInfo.additionalStateWithholding) stateTax += employee.taxInfo.additionalStateWithholding;
        }
        // No state tax for states like TX, FL, WA etc. (simplified)
    }


    // Local Tax (extremely simplified, e.g., NYC)
    if (employee.taxInfo.localTaxJurisdiction === 'NYC') {
        localTax = taxableGross * 00.01; // Example NYC rate
    }

    return { federalTax: Math.max(0, federalTax), stateTax: Math.max(0, stateTax), localTax: Math.max(0, localTax), totalTax: Math.max(0, federalTax + stateTax + localTax) };
};

export const calculateNetPay = (
    employee: Employee,
    timesheetEntries: TimesheetEntry[],
    deductionTypes: DeductionType[],
    benefitTypes: BenefitType[],
    payrollSettings: PayrollSettings | null
): { grossPay: number, preTaxDeductions: number, taxableGross: number, federalTax: number, stateTax: number, localTax: number, postTaxDeductions: number, netPay: number, breakdown: any } => {
    const grossPay = calculateGrossPay(employee, timesheetEntries);
    const { preTax: preTaxDeductions, breakdown: deductionBreakdown } = calculateDeductions(employee, grossPay, deductionTypes, benefitTypes);
    const taxableGross = grossPay - preTaxDeductions;

    const { federalTax, stateTax, localTax, totalTax } = calculateTaxes(
        employee,
        taxableGross,
        employee.compensation.payFrequency,
        employee.taxInfo.stateTaxJurisdiction,
        payrollSettings
    );

    // Recalculate post-tax deductions using the *remaining* gross for percentage-of-net deductions, if any.
    // For simplicity, we assume percentage-of-net is rare or handled by prior calculations, or fixed.
    const { postTax: postTaxDeductions } = calculateDeductions(employee, grossPay, deductionTypes, benefitTypes); // This needs to be smarter, will use the first calculated value for now.

    const netPay = grossPay - preTaxDeductions - totalTax - postTaxDeductions;

    return {
        grossPay,
        preTaxDeductions,
        taxableGross,
        federalTax,
        stateTax,
        localTax,
        postTaxDeductions,
        netPay,
        breakdown: {
            deductions: deductionBreakdown,
            taxes: { federal: federalTax, state: stateTax, local: localTax }
        }
    };
};

// --- MOCK DATA GENERATION (for initial state) ---
export const generateMockEmployees = (count: number = 50): Employee[] => {
    const employees: Employee[] = [];
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Product'];
    const positions = ['Software Engineer', 'Sales Manager', 'Marketing Specialist', 'HR Generalist', 'Accountant', 'Product Manager'];
    const states = ['CA', 'NY', 'TX', 'WA', 'FL', 'IL'];
    const genders = ['Male', 'Female', 'Non-binary'] as const;
    const maritalStatuses = ['Single', 'Married'] as const;
    const payFrequencies = ['Bi-Weekly', 'Monthly'] as const;
    const salaryTypes = ['Salary', 'Hourly'] as const;

    for (let i = 0; i < count; i++) {
        const id = `EMP${1000 + i}`;
        const firstName = `Employee${i}`;
        const lastName = `Lastname${i}`;
        const department = departments[i % departments.length];
        const position = positions[i % positions.length];
        const hireDate = new Date(2018 + (i % 5), i % 12, (i % 28) + 1).toISOString().split('T')[0];
        const status = i % 10 === 0 ? 'On Leave' : 'Active';
        const employeeType = i % 5 === 0 ? 'Contractor' : 'Full-time';
        const basePayRate = employeeType === 'Full-time' ? (50000 + i * 1000) : (25 + i * 5); // Annual or Hourly
        const payFrequency = payFrequencies[i % payFrequencies.length];
        const salaryType = employeeType === 'Full-time' ? salaryTypes[0] : salaryTypes[1];
        const state = states[i % states.length];

        const employee: Employee = {
            id: id,
            personal: {
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: new Date(1980 + (i % 15), i % 12, (i % 28) + 1).toISOString().split('T')[0],
                gender: genders[i % genders.length],
                maritalStatus: maritalStatuses[i % maritalStatuses.length],
                nationality: 'USA',
                ssn: `999-99-${String(1000 + i).padStart(4, '0')}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                phone: `(555) 123-${String(4000 + i).padStart(4, '0')}`,
                addressLine1: `${100 + i} Main St`,
                city: `${state}town`,
                state: state,
                zipCode: `${90210 + i}`,
                country: 'USA',
            },
            employment: {
                employeeId: id,
                departmentId: `DEPT${i % departments.length}`,
                position: position,
                hireDate: hireDate,
                status: status,
                employeeType: employeeType,
                workLocation: i % 2 === 0 ? 'Remote' : `Office - ${state}`,
            },
            compensation: {
                salaryType: salaryType,
                basePayRate: basePayRate,
                payFrequency: payFrequency,
                overtimeEligible: salaryType === 'Hourly',
                bonusEligible: salaryType === 'Salary',
                annualBonusTarget: salaryType === 'Salary' ? 0.10 + (i % 5) * 0.01 : undefined,
                effectiveDate: hireDate,
            },
            taxInfo: {
                taxId: `W4-${id}`,
                federalFilingStatus: i % 3 === 0 ? 'Married Filing Jointly' : 'Single',
                federalAllowances: i % 2,
                additionalFederalWithholding: (i % 5) * 10,
                stateTaxJurisdiction: state,
                stateFilingStatus: 'Single',
                stateAllowances: i % 1,
                additionalStateWithholding: (i % 3) * 5,
                exemptFromFederalTax: false,
                exemptFromStateTax: false,
            },
            benefits: [], // Populated later
            deductions: [], // Populated later
            pto: [], // Populated later
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        employees.push(employee);
    }
    return employees;
};

export const generateMockDeductionTypes = (): DeductionType[] => [
    { id: 'DED001', name: 'Medical Premium', description: 'Employee contribution to health insurance', type: 'Medical', isPreTax: true, employeeContributionType: 'Fixed Amount', defaultAmountOrRate: 150, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'DED002', name: 'Dental Premium', description: 'Employee contribution to dental insurance', type: 'Dental', isPreTax: true, employeeContributionType: 'Fixed Amount', defaultAmountOrRate: 30, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'DED003', name: '401K Contribution', description: 'Employee 401K pre-tax contribution', type: '401K', isPreTax: true, employeeContributionType: 'Percentage of Gross', defaultAmountOrRate: 5, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'DED004', name: 'Roth 401K', description: 'Employee Roth 401K post-tax contribution', type: '401K', isPreTax: false, employeeContributionType: 'Percentage of Gross', defaultAmountOrRate: 3, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'DED005', name: 'Loan Repayment', description: 'Employee personal loan repayment', type: 'Loan Repayment', isPreTax: false, employeeContributionType: 'Fixed Amount', defaultAmountOrRate: 100, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'DED006', name: 'Life Insurance', description: 'Supplemental life insurance', type: 'Life Insurance', isPreTax: false, employeeContributionType: 'Fixed Amount', defaultAmountOrRate: 20, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const generateMockBenefitTypes = (): BenefitType[] => [
    { id: 'BEN001', name: 'Health Insurance (PPO)', description: 'Comprehensive PPO health plan', category: 'Health', provider: 'HealthCo', costPerEmployee: 500, employeeCostShare: 0.3, requiresEnrollment: true, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'BEN002', name: 'Dental Insurance', description: 'Basic dental coverage', category: 'Health', provider: 'DentalCare', costPerEmployee: 50, employeeCostShare: 0.2, requiresEnrollment: true, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'BEN003', name: '401K Matching', description: 'Company 401K match up to 3%', category: 'Retirement', provider: 'Fidelity', costPerEmployee: 100, employeeCostShare: 0, requiresEnrollment: false, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'BEN004', name: 'Life Insurance (Basic)', description: 'Company paid basic life insurance', category: 'Insurance', provider: 'LifeSecure', costPerEmployee: 25, employeeCostShare: 0, requiresEnrollment: false, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const generateMockPTOPolicies = (): PTOPolicy[] => [
    { id: 'PTO001', name: 'Standard Vacation', type: 'Vacation', accrualRate: 3.33, accrualFrequency: 'Bi-Weekly', maxAccrual: 160, rolloverPolicy: 'Partial', rolloverLimit: 40, active: true },
    { id: 'PTO002', name: 'Sick Leave', type: 'Sick Leave', accrualRate: 1.5, accrualFrequency: 'Bi-Weekly', maxAccrual: 80, rolloverPolicy: 'None', active: true },
    { id: 'PTO003', name: 'Floating Holiday', type: 'Floating Holiday', accrualRate: 0, accrualFrequency: 'Annually', maxAccrual: 16, rolloverPolicy: 'None', active: true },
];

export const generateMockTimesheetEntries = (employees: Employee[], payRuns: PayRun[]): TimesheetEntry[] => {
    const timesheets: TimesheetEntry[] = [];
    const latestPayRun = payRuns.find(p => p.status === 'Pending' || p.status === 'Processing');
    if (!latestPayRun) return [];

    const periodStart = new Date(latestPayRun.periodStart);
    const periodEnd = new Date(latestPayRun.periodEnd);

    employees.filter(emp => emp.compensation.salaryType === 'Hourly').forEach(employee => {
        let currentDate = new Date(periodStart);
        while (currentDate <= periodEnd) {
            // Only add entries for weekdays
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) { // 0 = Sunday, 6 = Saturday
                const hoursWorked = 8;
                const overtimeHours = Math.random() < 0.1 ? Math.floor(Math.random() * 4) : 0; // 10% chance of overtime
                const doubleTimeHours = Math.random() < 0.02 ? Math.floor(Math.random() * 2) : 0; // 2% chance of double time

                timesheets.push({
                    id: generateUniqueId(),
                    employeeId: employee.id,
                    payPeriodId: latestPayRun.id,
                    date: currentDate.toISOString().split('T')[0],
                    startTime: '09:00',
                    endTime: '17:00',
                    breakDuration: 30,
                    hoursWorked: hoursWorked,
                    overtimeHours: overtimeHours,
                    doubleTimeHours: doubleTimeHours,
                    status: Math.random() < 0.8 ? 'Approved' : 'Pending', // 80% approved
                    submittedBy: employee.id,
                    approvedBy: Math.random() < 0.8 ? 'MANAGER001' : undefined,
                    submissionDate: new Date().toISOString(),
                    approvalDate: Math.random() < 0.8 ? new Date().toISOString() : undefined,
                    notes: overtimeHours > 0 ? 'Worked on critical bug fix' : undefined,
                });
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
    });
    return timesheets;
};

export const generateMockPayrollSettings = (): PayrollSettings => ({
    id: 'SETTINGS001',
    companyName: 'Acme Corp',
    federalEIN: 'XX-XXXXXXX',
    stateTaxId: 'XXXXXXX',
    defaultPayFrequency: 'Bi-Weekly',
    payrollCutoffDay: 15, // Not used for bi-weekly, but for monthly
    defaultPayDateOffset: 3, // 3 days after period end
    bankAccountId: '****1234',
    autoApproveTimesheets: false,
    allowEmployeeSelfService: true,
    emailNotificationsEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

export const addInitialDeductionsAndBenefitsToEmployees = (employees: Employee[], deductionTypes: DeductionType[], benefitTypes: BenefitType[]): Employee[] => {
    return employees.map(emp => {
        // Assign some default deductions
        const assignedDeductions: EmployeeDeduction[] = [];
        if (emp.compensation.salaryType === 'Salary') {
            assignedDeductions.push({ id: generateUniqueId(), deductionId: 'DED001', amount: 150, frequency: 'Per Pay Period', startDate: emp.employment.hireDate, isPreTax: true });
            assignedDeductions.push({ id: generateUniqueId(), deductionId: 'DED003', amount: 5, frequency: 'Per Pay Period', startDate: emp.employment.hireDate, isPreTax: true });
        } else {
            assignedDeductions.push({ id: generateUniqueId(), deductionId: 'DED002', amount: 30, frequency: 'Per Pay Period', startDate: emp.employment.hireDate, isPreTax: true });
        }

        // Assign some default benefits
        const assignedBenefits: EmployeeBenefitEnrollment[] = [];
        if (emp.employment.employeeType === 'Full-time') {
            assignedBenefits.push({ id: generateUniqueId(), benefitId: 'BEN001', enrollmentDate: emp.employment.hireDate, coverageType: 'Employee Only', employeeContribution: 150, companyContribution: 350, status: 'Active' });
            assignedBenefits.push({ id: generateUniqueId(), benefitId: 'BEN002', enrollmentDate: emp.employment.hireDate, coverageType: 'Employee Only', employeeContribution: 20, companyContribution: 30, status: 'Active' });
        }

        // Assign PTO based on policy
        const assignedPTO: EmployeePTO[] = [
            { ptoPolicyId: 'PTO001', accruedHours: 80, usedHours: 20, availableHours: 60, lastUpdated: new Date().toISOString() },
            { ptoPolicyId: 'PTO002', accruedHours: 40, usedHours: 5, availableHours: 35, lastUpdated: new Date().toISOString() },
        ];


        return {
            ...emp,
            deductions: assignedDeductions,
            benefits: assignedBenefits,
            pto: assignedPTO,
        };
    });
};

// --- DATA PROVIDER REPLACEMENT / ENHANCEMENT ---
// This would ideally be in DataContext.tsx, but for a single file expansion,
// we'll simulate the enhanced context directly within this file, as if it's the provider.
// This is a large block of state management for the "real world" aspect.
export const useEnhancedPayrollData = (initialPayRuns: PayRun[]) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [deductionTypes, setDeductionTypes] = useState<DeductionType[]>(generateMockDeductionTypes());
    const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>(generateMockBenefitTypes());
    const [ptoPolicies, setPtoPolicies] = useState<PTOPolicy[]>(generateMockPTOPolicies());
    const [timesheetEntries, setTimesheetEntries] = useState<TimesheetEntry[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(generateMockPayrollSettings());
    const [payRuns, setPayRuns] = useState<PayRun[]>(initialPayRuns);

    // Initialize employees and timesheets after initial payRuns are available
    useEffect(() => {
        const initialEmployees = generateMockEmployees(50);
        const employeesWithBenefits = addInitialDeductionsAndBenefitsToEmployees(initialEmployees, deductionTypes, benefitTypes);
        setEmployees(employeesWithBenefits);
        // Only generate timesheets once employees are set
        setTimesheetEntries(generateMockTimesheetEntries(employeesWithBenefits, initialPayRuns));
    }, [initialPayRuns, deductionTypes, benefitTypes]);


    const addAuditLog = useCallback(async (log: AuditLogEntry) => {
        // Simulate API call
        console.log("Adding audit log:", log);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
        setAuditLogs(prev => [log, ...prev].slice(0, 500)); // Keep last 500 logs
    }, []);

    const addEmployee = useCallback(async (newEmployee: Employee) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        setEmployees(prev => [...prev, newEmployee]);
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'SYSTEM', action: 'EMPLOYEE_ADDED', entityType: 'Employee', entityId: newEmployee.id, details: JSON.stringify(newEmployee) });
    }, [addAuditLog]);

    const updateEmployee = useCallback(async (updatedEmployee: Employee) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'SYSTEM', action: 'EMPLOYEE_UPDATED', entityType: 'Employee', entityId: updatedEmployee.id, details: JSON.stringify(updatedEmployee) });
    }, [addAuditLog]);

    const deleteEmployee = useCallback(async (employeeId: string) => {
        await new Promise(resolve => setTimeout(resolve, 200));
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'SYSTEM', action: 'EMPLOYEE_DELETED', entityType: 'Employee', entityId: employeeId, details: `Employee ${employeeId} removed.` });
    }, [addAuditLog]);

    export const addDeductionType = useCallback(async (newDeduction: DeductionType) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setDeductionTypes(prev => [...prev, newDeduction]);
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'DEDUCTION_TYPE_ADDED', entityType: 'DeductionType', entityId: newDeduction.id, details: JSON.stringify(newDeduction) });
    }, [addAuditLog]);

    export const updateDeductionType = useCallback(async (updatedDeduction: DeductionType) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setDeductionTypes(prev => prev.map(dt => dt.id === updatedDeduction.id ? updatedDeduction : dt));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'DEDUCTION_TYPE_UPDATED', entityType: 'DeductionType', entityId: updatedDeduction.id, details: JSON.stringify(updatedDeduction) });
    }, [addAuditLog]);

    export const deleteDeductionType = useCallback(async (deductionId: string) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setDeductionTypes(prev => prev.filter(dt => dt.id !== deductionId));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'DEDUCTION_TYPE_DELETED', entityType: 'DeductionType', entityId: deductionId, details: `DeductionType ${deductionId} removed.` });
    }, [addAuditLog]);

    export const addBenefitType = useCallback(async (newBenefit: BenefitType) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setBenefitTypes(prev => [...prev, newBenefit]);
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'BENEFIT_TYPE_ADDED', entityType: 'BenefitType', entityId: newBenefit.id, details: JSON.stringify(newBenefit) });
    }, [addAuditLog]);

    export const updateBenefitType = useCallback(async (updatedBenefit: BenefitType) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setBenefitTypes(prev => prev.map(bt => bt.id === updatedBenefit.id ? updatedBenefit : bt));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'BENEFIT_TYPE_UPDATED', entityType: 'BenefitType', entityId: updatedBenefit.id, details: JSON.stringify(updatedBenefit) });
    }, [addAuditLog]);

    export const deleteBenefitType = useCallback(async (benefitId: string) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setBenefitTypes(prev => prev.filter(bt => bt.id !== benefitId));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'BENEFIT_TYPE_DELETED', entityType: 'BenefitType', entityId: benefitId, details: `BenefitType ${benefitId} removed.` });
    }, [addAuditLog]);

    export const addPTOPolicy = useCallback(async (newPolicy: PTOPolicy) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setPtoPolicies(prev => [...prev, newPolicy]);
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'PTO_POLICY_ADDED', entityType: 'PTOPolicy', entityId: newPolicy.id, details: JSON.stringify(newPolicy) });
    }, [addAuditLog]);

    export const updatePTOPolicy = useCallback(async (updatedPolicy: PTOPolicy) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setPtoPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'PTO_POLICY_UPDATED', entityType: 'PTOPolicy', entityId: updatedPolicy.id, details: JSON.stringify(updatedPolicy) });
    }, [addAuditLog]);

    export const deletePTOPolicy = useCallback(async (policyId: string) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setPtoPolicies(prev => prev.filter(p => p.id !== policyId));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'PTO_POLICY_DELETED', entityType: 'PTOPolicy', entityId: policyId, details: `PTOPolicy ${policyId} removed.` });
    }, [addAuditLog]);

    export const addTimesheetEntry = useCallback(async (newEntry: TimesheetEntry) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setTimesheetEntries(prev => [...prev, newEntry]);
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: newEntry.submittedBy, action: 'TIMESHEET_SUBMITTED', entityType: 'TimesheetEntry', entityId: newEntry.id, details: JSON.stringify(newEntry) });
    }, [addAuditLog]);

    export const updateTimesheetEntry = useCallback(async (updatedEntry: TimesheetEntry) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setTimesheetEntries(prev => prev.map(ts => ts.id === updatedEntry.id ? updatedEntry : ts));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'SYSTEM', action: 'TIMESHEET_UPDATED', entityType: 'TimesheetEntry', entityId: updatedEntry.id, details: JSON.stringify(updatedEntry) });
    }, [addAuditLog]);

    export const approveTimesheetEntry = useCallback(async (entryId: string, approvedBy: string) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setTimesheetEntries(prev => prev.map(ts => ts.id === entryId ? { ...ts, status: 'Approved', approvedBy, approvalDate: new Date().toISOString() } : ts));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: approvedBy, action: 'TIMESHEET_APPROVED', entityType: 'TimesheetEntry', entityId: entryId, details: `Timesheet ${entryId} approved by ${approvedBy}` });
    }, [addAuditLog]);

    export const rejectTimesheetEntry = useCallback(async (entryId: string, rejectedBy: string, reason: string) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setTimesheetEntries(prev => prev.map(ts => ts.id === entryId ? { ...ts, status: 'Rejected', approvedBy: rejectedBy, approvalDate: new Date().toISOString(), notes: `Rejected: ${reason}` } : ts));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: rejectedBy, action: 'TIMESHEET_REJECTED', entityType: 'TimesheetEntry', entityId: entryId, details: `Timesheet ${entryId} rejected by ${rejectedBy} with reason: ${reason}` });
    }, [addAuditLog]);

    export const updatePayrollSettings = useCallback(async (newSettings: PayrollSettings) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 200));
        setPayrollSettings(newSettings);
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'ADMIN', action: 'PAYROLL_SETTINGS_UPDATED', entityType: 'PayrollSettings', entityId: newSettings.id, details: JSON.stringify(newSettings) });
    }, [addAuditLog]);

    export const executePayRun = useCallback(async (payRunId: string) => { // Exported
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
        setPayRuns(prev => prev.map(pr => pr.id === payRunId ? { ...pr, status: 'Paid', processDate: new Date().toISOString() } : pr));
        await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'SYSTEM', action: 'PAYROLL_RUN_EXECUTED', entityType: 'PayRun', entityId: payRunId, details: `Pay run ${payRunId} completed.` });
        // After pay run, generate a new pending one for next period
        const latestRun = payRuns.find(pr => pr.id === payRunId);
        if (latestRun) {
            const newPayRunDate = new Date(latestRun.payDate);
            newPayRunDate.setDate(newPayRunDate.getDate() + (latestRun.payFrequency === 'Bi-Weekly' ? 14 : 30)); // Simple increment
            const newPeriodStart = new Date(latestRun.periodEnd);
            newPeriodStart.setDate(newPeriodStart.getDate() + 1);
            const newPeriodEnd = new Date(newPayRunDate);
            newPeriodEnd.setDate(newPayRunDate.getDate() - (payrollSettings?.defaultPayDateOffset || 3)); // Assume pay date is 3 days after period end

            // Recalculate total amount for the new run based on current employees and timesheets
            let newTotalAmount = 0;
            let newEmployeeCount = 0;

            const relevantTimesheetsForNextRun = timesheetEntries.filter(ts => {
                const tsDate = new Date(ts.date);
                return tsDate >= newPeriodStart && tsDate <= newPeriodEnd && ts.status === 'Approved';
            });

            employees.forEach(emp => {
                newEmployeeCount++;
                const { netPay } = calculateNetPay(emp, relevantTimesheetsForNextRun, deductionTypes, benefitTypes, payrollSettings);
                newTotalAmount += netPay;
            });

            const newPayRun: PayRun = {
                id: generateUniqueId(),
                name: `Payroll ${newPayRunDate.getFullYear()}-${newPayRunDate.getMonth() + 1}-${newPayRunDate.getDate()}`,
                payDate: newPayRunDate.toISOString().split('T')[0],
                periodStart: newPeriodStart.toISOString().split('T')[0],
                periodEnd: newPeriodEnd.toISOString().split('T')[0],
                totalAmount: Math.round(newTotalAmount),
                employeeCount: employees.length,
                status: 'Pending',
                payFrequency: payrollSettings?.defaultPayFrequency || 'Bi-Weekly',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setPayRuns(prev => [...prev, newPayRun]);
            await addAuditLog({ id: generateUniqueId(), timestamp: new Date().toISOString(), userId: 'SYSTEM', action: 'PAYROLL_RUN_GENERATED', entityType: 'PayRun', entityId: newPayRun.id, details: `New pay run ${newPayRun.id} generated.` });
        }
    }, [addAuditLog, employees, timesheetEntries, deductionTypes, benefitTypes, payrollSettings, payRuns]); // Added payRuns to dependency array

    return {
        payRuns,
        employees,
        deductionTypes,
        benefitTypes,
        ptoPolicies,
        timesheetEntries,
        auditLogs,
        payrollSettings,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDeductionType,
        updateDeductionType,
        deleteDeductionType,
        addBenefitType,
        updateBenefitType,
        deleteBenefitType,
        addPTOPolicy,
        updatePTOPolicy,
        deletePTOPolicy,
        addTimesheetEntry,
        updateTimesheetEntry,
        approveTimesheetEntry,
        rejectTimesheetEntry,
        updatePayrollSettings,
        addAuditLog,
        executePayRun,
    };
};

// --- NEW COMPONENTS / SECTIONS ---

// Utility for rendering various input types
interface InputFieldProps {
    id: string;
    label: string;
    type?: string;
    value: string | number | boolean | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    textarea?: boolean;
    min?: number;
    max?: number;
    step?: number;
    readOnly?: boolean;
    className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    options,
    textarea = false,
    min,
    max,
    step,
    readOnly = false,
    className = '',
}) => (
    <div className="flex flex-col mb-4">
        <label htmlFor={id} className="text-sm font-medium text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {textarea ? (
            <textarea
                id={id}
                value={value as string}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={4}
                readOnly={readOnly}
                className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${readOnly ? 'bg-gray-700/50 cursor-not-allowed' : ''} ${className}`}
            />
        ) : options ? (
            <select
                id={id}
                value={value as string}
                onChange={onChange}
                required={required}
                disabled={readOnly}
                className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 ${readOnly ? 'bg-gray-700/50 cursor-not-allowed' : ''} ${className}`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                id={id}
                value={type === 'checkbox' ? undefined : value as string | number}
                checked={type === 'checkbox' ? (value as boolean) : undefined}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                step={step}
                readOnly={readOnly && type !== 'checkbox'} // Checkboxes can be disabled
                disabled={readOnly && type === 'checkbox'}
                className={`w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${readOnly ? 'bg-gray-700/50 cursor-not-allowed' : ''} ${className}`}
            />
        )}
    </div>
);

// Generic Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
    noBackgroundDismiss?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, noBackgroundDismiss = false }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" onClick={noBackgroundDismiss ? undefined : onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full ${className || ''}`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


// --- EMPLOYEE MANAGEMENT SECTION ---

// Form for adding/editing an employee
interface EmployeeFormProps {
    employee?: Employee;
    onSave: (employee: Employee) => void;
    onCancel: () => void;
    isLoading: boolean;
    deductionTypes: DeductionType[];
    benefitTypes: BenefitType[];
    ptoPolicies: PTOPolicy[];
    allEmployees: Employee[]; // For manager selection
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
    employee: initialEmployee, onSave, onCancel, isLoading,
    deductionTypes, benefitTypes, ptoPolicies, allEmployees
}) => {
    const isEditing = !!initialEmployee;
    const [employee, setEmployee] = useState<Employee>(initialEmployee || {
        id: generateUniqueId(),
        personal: {
            firstName: '', lastName: '', dateOfBirth: '', gender: 'Prefer not to say', maritalStatus: 'Single', nationality: 'USA', ssn: '',
            email: '', phone: '', addressLine1: '', city: '', state: '', zipCode: '', country: 'USA',
        },
        employment: {
            employeeId: '', departmentId: '', position: '', hireDate: new Date().toISOString().split('T')[0], status: 'Active',
            employeeType: 'Full-time', workLocation: 'Office - NYC',
        },
        compensation: {
            salaryType: 'Salary', basePayRate: 0, payFrequency: 'Bi-Weekly', overtimeEligible: false, bonusEligible: false, effectiveDate: new Date().toISOString().split('T')[0],
        },
        taxInfo: {
            taxId: '', federalFilingStatus: 'Single', federalAllowances: 0, additionalFederalWithholding: 0,
            stateTaxJurisdiction: 'NY', exemptFromFederalTax: false, exemptFromStateTax: false,
        },
        benefits: [], deductions: [], pto: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });

    // Populate default values for new employees
    useEffect(() => {
        if (!isEditing) {
            setEmployee(prev => ({
                ...prev,
                employment: { ...prev.employment, employeeId: `EMP${Math.floor(Math.random() * 100000)}` },
                // Add default deductions/benefits for new employees
                deductions: [
                    { id: generateUniqueId(), deductionId: 'DED001', amount: 150, frequency: 'Per Pay Period', startDate: prev.employment.hireDate, isPreTax: true },
                    { id: generateUniqueId(), deductionId: 'DED003', amount: 5, frequency: 'Per Pay Period', startDate: prev.employment.hireDate, isPreTax: true },
                ].filter(d => deductionTypes.some(dt => dt.id === d.deductionId && dt.active)), // Only add if deduction type exists and is active
                benefits: [
                    { id: generateUniqueId(), benefitId: 'BEN001', enrollmentDate: prev.employment.hireDate, coverageType: 'Employee Only', employeeContribution: 150, companyContribution: 350, status: 'Active' },
                ].filter(b => benefitTypes.some(bt => bt.id === b.benefitId && bt.active)), // Only add if benefit type exists and is active
                pto: ptoPolicies.map(policy => ({
                    ptoPolicyId: policy.id,
                    accruedHours: 0,
                    usedHours: 0,
                    availableHours: 0,
                    lastUpdated: new Date().toISOString(),
                }))
            }));
        }
    }, [isEditing, ptoPolicies, deductionTypes, benefitTypes]);

    const handleChange = useCallback((section: keyof Employee, field: string, value: any) => {
        setEmployee(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    const handleCompensationChange = useCallback((field: string, value: any) => {
        setEmployee(prev => {
            const newCompensation = { ...prev.compensation, [field]: value };
            if (field === 'salaryType') {
                newCompensation.overtimeEligible = value === 'Hourly';
                if (value === 'Hourly') {
                    newCompensation.annualBonusTarget = undefined;
                    newCompensation.bonusEligible = false;
                    newCompensation.commissionRate = undefined;
                } else if (value === 'Salary') {
                    newCompensation.bonusEligible = true; // Default to true for salary
                    newCompensation.commissionRate = undefined;
                } else if (value === 'Commission') {
                    newCompensation.overtimeEligible = false;
                    newCompensation.bonusEligible = false; // Commissions usually replace bonuses
                }
            }
            return {
                ...prev,
                compensation: newCompensation,
                updatedAt: new Date().toISOString(),
            };
        });
    }, []);

    const handleTaxInfoChange = useCallback((field: string, value: any) => {
        setEmployee(prev => ({
            ...prev,
            taxInfo: {
                ...prev.taxInfo,
                [field]: value,
            },
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    const handleDeductionChange = useCallback((index: number, field: keyof EmployeeDeduction, value: any) => {
        setEmployee(prev => {
            const newDeductions = [...prev.deductions];
            newDeductions[index] = { ...newDeductions[index], [field]: value };
            return { ...prev, deductions: newDeductions, updatedAt: new Date().toISOString() };
        });
    }, []);

    const addDeduction = useCallback(() => {
        setEmployee(prev => ({
            ...prev,
            deductions: [...prev.deductions, { id: generateUniqueId(), deductionId: '', amount: 0, frequency: 'Per Pay Period', startDate: new Date().toISOString().split('T')[0], isPreTax: true }],
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    const removeDeduction = useCallback((index: number) => {
        setEmployee(prev => ({
            ...prev,
            deductions: prev.deductions.filter((_, i) => i !== index),
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    const handleBenefitChange = useCallback((index: number, field: keyof EmployeeBenefitEnrollment, value: any) => {
        setEmployee(prev => {
            const newBenefits = [...prev.benefits];
            newBenefits[index] = { ...newBenefits[index], [field]: value };
            return { ...prev, benefits: newBenefits, updatedAt: new Date().toISOString() };
        });
    }, []);

    const addBenefit = useCallback(() => {
        setEmployee(prev => ({
            ...prev,
            benefits: [...prev.benefits, { id: generateUniqueId(), benefitId: '', enrollmentDate: new Date().toISOString().split('T')[0], coverageType: 'Employee Only', employeeContribution: 0, companyContribution: 0, status: 'Pending' }],
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    const removeBenefit = useCallback((index: number) => {
        setEmployee(prev => ({
            ...prev,
            benefits: prev.benefits.filter((_, i) => i !== index),
            updatedAt: new Date().toISOString(),
        }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(employee);
    };

    const departmentOptions = useMemo(() => ([
        { value: 'DEPT0', label: 'Engineering' },
        { value: 'DEPT1', label: 'Sales' },
        { value: 'DEPT2', label: 'Marketing' },
        { value: 'DEPT3', label: 'HR' },
        { value: 'DEPT4', label: 'Finance' },
        { value: 'DEPT5', label: 'Product' },
    ]), []);

    const managerOptions = useMemo(() => ([
        { value: '', label: 'None' },
        ...allEmployees.filter(e => e.id !== employee.id).map(emp => ({ value: emp.id, label: `${emp.personal.firstName} ${emp.personal.lastName}` }))
    ]), [allEmployees, employee.id]);

    const stateOptions = useMemo(() => ([
        { value: '', label: 'Select State' },
        { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
        { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' }, { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
        { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
        { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
        { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana