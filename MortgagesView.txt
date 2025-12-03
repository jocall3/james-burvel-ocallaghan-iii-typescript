import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../../Card';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import faker from 'faker'; // Using faker for mock data generation

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- Contexts for Global State Management (Scalability) ---
interface MortgageAppContextType {
    currentUser: UserProfile | null;
    settings: AppSettings;
    notifications: Notification[];
    addNotification: (notification: Notification) => void;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    login: (user: UserProfile) => void;
    logout: () => void;
}

const MortgageAppContext = createContext<MortgageAppContextType | undefined>(undefined);

export const useMortgageApp = () => {
    const context = useContext(MortgageAppContext);
    if (context === undefined) {
        throw new Error('useMortgageApp must be used within a MortgageAppProvider');
    }
    return context;
};

// --- Data Models and Interfaces (Type Safety & Structure) ---

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'loan_officer' | 'underwriter' | 'servicing_agent' | 'portfolio_manager';
    permissions: string[];
    avatarUrl?: string;
}

export interface AppSettings {
    theme: 'dark' | 'light';
    currency: 'USD' | 'EUR' | 'GBP';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        inApp: boolean;
    };
    defaultPortfolioFilter: string;
}

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    timestamp: Date;
    read: boolean;
    link?: string;
}

export interface MortgageLoan {
    id: string;
    loanNumber: string;
    borrower: BorrowerProfile;
    property: PropertyDetails;
    loanDetails: LoanDetails;
    status: 'application' | 'pre_approved' | 'approved' | 'funded' | 'servicing' | 'defaulted' | 'refinanced' | 'paid_off';
    currentBalance: number;
    originalBalance: number;
    originationDate: Date;
    nextPaymentDate: Date;
    nextPaymentAmount: number;
    escrowBalance: number;
    loanOfficerId: string;
    underwriterId?: string;
    servicingAgentId?: string;
    notes: LoanNote[];
    documents: LoanDocument[];
    riskScore: number; // AI-driven risk score
    aiRecommendations: AiRecommendation[];
    valuationHistory: PropertyValuation[];
    paymentHistory: LoanPayment[];
    refinanceEligibility: RefinanceEligibility;
}

export interface BorrowerProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: Address;
    creditScore: number;
    income: number;
    employmentStatus: string;
    dependents: number;
    kycStatus: 'verified' | 'pending' | 'rejected';
}

export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export interface PropertyDetails {
    id: string;
    address: Address;
    propertyType: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'commercial';
    yearBuilt: number;
    squareFootage: number;
    bedrooms: number;
    bathrooms: number;
    zoning: string;
    currentValue: number; // AI-based valuation
    lastAppraisalDate?: Date;
    propertyTax: number; // Annual
    homeInsurance: number; // Annual
    lienStatus: 'clear' | 'encumbered';
}

export interface LoanDetails {
    loanType: 'fixed_rate' | 'adjustable_rate' | 'fha' | 'va' | 'usd_rural';
    interestRate: number; // Annual percentage rate
    termMonths: number;
    amortizationSchedule: AmortizationPayment[];
    emi: number; // Equated Monthly Installment
    closingCosts: number;
    originationFees: number;
    pmtInsurance?: number; // Private Mortgage Insurance
    isEscrowed: boolean;
}

export interface AmortizationPayment {
    month: number;
    principalPayment: number;
    interestPayment: number;
    remainingBalance: number;
    totalPayment: number;
}

export interface LoanNote {
    id: string;
    authorId: string;
    authorName: string;
    timestamp: Date;
    content: string;
}

export interface LoanDocument {
    id: string;
    fileName: string;
    documentType: 'application' | 'income_proof' | 'credit_report' | 'appraisal' | 'deed' | 'closing_disclosure' | 'other';
    uploadDate: Date;
    url: string;
    uploadedById: string;
}

export interface PropertyValuation {
    id: string;
    timestamp: Date;
    value: number;
    source: 'AI' | 'Appraisal' | 'Manual';
    analystId?: string;
}

export interface LoanPayment {
    id: string;
    paymentDate: Date;
    amount: number;
    principalPaid: number;
    interestPaid: number;
    escrowPaid: number;
    lateFeeApplied: number;
    isLate: boolean;
}

export interface RefinanceEligibility {
    isEligible: boolean;
    suggestedRate?: number;
    estimatedSavingsMonthly?: number;
    reasonCodes: string[]; // e.g., 'Lower_Rate_Available', 'Credit_Score_Improvement', 'Property_Value_Increase'
    lastChecked: Date;
}

export interface AiRecommendation {
    id: string;
    type: 'refinance_alert' | 'risk_mitigation' | 'cross_sell_opportunity' | 'portfolio_adjustment';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
    actionItems: string[];
    relatedLoanId?: string;
}

export interface MarketData {
    timestamp: Date;
    interestRate30YrFixed: number;
    interestRate15YrFixed: number;
    housingPriceIndex: number;
    inflationRate: number;
    gdpGrowth: number;
}

export interface PortfolioSummary {
    totalLoans: number;
    totalPortfolioValue: number;
    avgInterestRate: number;
    avgLTV: number;
    delinquencyRate: number;
    forecastedDefaults: number; // AI-driven
    topPerformers: string[]; // Loan IDs
    highRiskLoans: string[]; // Loan IDs
    geographicDistribution: { [state: string]: number };
    loanTypeDistribution: { [type: string]: number };
}

// --- Utility Functions (Reusable Logic) ---

export const formatCurrency = (amount: number, currency: 'USD' | 'EUR' | 'GBP' = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (date: Date, dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' = 'MM/DD/YYYY'): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    if (dateFormat === 'DD/MM/YYYY') {
        return new Intl.DateTimeFormat('en-GB', options).format(date);
    }
    return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const calculateLTV = (loanAmount: number, propertyValue: number): number => {
    if (propertyValue === 0) return 0;
    return (loanAmount / propertyValue) * 100;
};

export const generateAmortizationSchedule = (
    principal: number,
    annualInterestRate: number,
    loanTermMonths: number
): AmortizationPayment[] => {
    const monthlyInterestRate = annualInterestRate / 12 / 100;
    const amortizationSchedule: AmortizationPayment[] = [];

    if (monthlyInterestRate === 0) {
        // Handle zero interest rate case
        const monthlyPrincipal = principal / loanTermMonths;
        for (let month = 1; month <= loanTermMonths; month++) {
            amortizationSchedule.push({
                month,
                principalPayment: monthlyPrincipal,
                interestPayment: 0,
                remainingBalance: principal - (monthlyPrincipal * month),
                totalPayment: monthlyPrincipal,
            });
        }
        return amortizationSchedule;
    }

    const emi =
        principal *
        monthlyInterestRate /
        (1 - Math.pow(1 + monthlyInterestRate, -loanTermMonths));

    let remainingBalance = principal;

    for (let month = 1; month <= loanTermMonths; month++) {
        const interestPayment = remainingBalance * monthlyInterestRate;
        const principalPayment = emi - interestPayment;
        remainingBalance -= principalPayment;

        amortizationSchedule.push({
            month,
            principalPayment,
            interestPayment,
            remainingBalance: Math.max(0, remainingBalance), // Ensure balance doesn't go negative due to rounding
            totalPayment: emi,
        });
    }
    return amortizationSchedule;
};

// --- Mock Data Generators (for development and demonstration) ---

const generateMockAddress = (): Address => ({
    street: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.stateAbbr(),
    zipCode: faker.address.zipCode(),
    country: 'USA',
});

const generateMockPropertyDetails = (): PropertyDetails => ({
    id: faker.datatype.uuid(),
    address: generateMockAddress(),
    propertyType: faker.random.arrayElement(['single_family', 'multi_family', 'condo', 'townhouse']),
    yearBuilt: faker.datatype.number({ min: 1950, max: 2022 }),
    squareFootage: faker.datatype.number({ min: 800, max: 5000 }),
    bedrooms: faker.datatype.number({ min: 1, max: 6 }),
    bathrooms: faker.datatype.number({ min: 1, max: 5 }),
    zoning: faker.random.alphaNumeric(5).toUpperCase(),
    currentValue: faker.datatype.number({ min: 200000, max: 1500000 }),
    lastAppraisalDate: faker.date.recent(365),
    propertyTax: faker.datatype.number({ min: 2000, max: 15000 }),
    homeInsurance: faker.datatype.number({ min: 800, max: 4000 }),
    lienStatus: 'clear',
});

const generateMockBorrowerProfile = (): BorrowerProfile => ({
    id: faker.datatype.uuid(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    address: generateMockAddress(),
    creditScore: faker.datatype.number({ min: 600, max: 850 }),
    income: faker.datatype.number({ min: 50000, max: 300000 }),
    employmentStatus: faker.random.arrayElement(['employed', 'self-employed', 'retired']),
    dependents: faker.datatype.number({ min: 0, max: 5 }),
    kycStatus: faker.random.arrayElement(['verified', 'pending']),
});

const generateMockLoanDetails = (principal: number): LoanDetails => {
    const termMonths = faker.datatype.number({ min: 180, max: 360, precision: 12 });
    const annualRate = faker.datatype.float({ min: 2.5, max: 7.5, precision: 0.1 });
    const amortizationSchedule = generateAmortizationSchedule(principal, annualRate, termMonths);
    const emi = amortizationSchedule.length > 0 ? amortizationSchedule[0].totalPayment : 0;

    return {
        loanType: faker.random.arrayElement(['fixed_rate', 'adjustable_rate', 'fha', 'va']),
        interestRate: annualRate,
        termMonths: termMonths,
        amortizationSchedule: amortizationSchedule,
        emi: emi,
        closingCosts: faker.datatype.number({ min: 5000, max: 20000 }),
        originationFees: faker.datatype.number({ min: 0, max: 5000 }),
        pmtInsurance: faker.datatype.boolean() ? faker.datatype.number({ min: 50, max: 200 }) : undefined,
        isEscrowed: faker.datatype.boolean(),
    };
};

const generateMockLoanNote = (authorId: string, authorName: string): LoanNote => ({
    id: faker.datatype.uuid(),
    authorId: authorId,
    authorName: authorName,
    timestamp: faker.date.recent(30),
    content: faker.lorem.sentences(faker.datatype.number({ min: 1, max: 3 })),
});

const generateMockLoanDocument = (uploadedById: string): LoanDocument => ({
    id: faker.datatype.uuid(),
    fileName: faker.system.fileName(),
    documentType: faker.random.arrayElement(['application', 'income_proof', 'credit_report', 'appraisal', 'deed', 'closing_disclosure']),
    uploadDate: faker.date.recent(90),
    url: faker.internet.url(),
    uploadedById: uploadedById,
});

const generateMockPropertyValuation = (): PropertyValuation => ({
    id: faker.datatype.uuid(),
    timestamp: faker.date.recent(365),
    value: faker.datatype.number({ min: 250000, max: 1600000 }),
    source: faker.random.arrayElement(['AI', 'Appraisal', 'Manual']),
});

const generateMockLoanPayment = (loanId: string, originationDate: Date, emi: number, monthlyInterestRate: number, loanTermMonths: number): LoanPayment[] => {
    const payments: LoanPayment[] = [];
    let currentBalance = faker.datatype.number({ min: 100000, max: 400000 }); // Random starting balance for payments
    let paymentDate = new Date(originationDate);
    paymentDate.setMonth(paymentDate.getMonth() + 1); // First payment one month after origination

    const numPayments = faker.datatype.number({ min: 1, max: Math.min(loanTermMonths, 60) }); // Max 5 years of history

    for (let i = 0; i < numPayments; i++) {
        const principalPayment = faker.datatype.float({ min: emi * 0.3, max: emi * 0.7 });
        const interestPayment = emi - principalPayment;
        const escrowPaid = faker.datatype.number({ min: 100, max: 500 });
        const isLate = faker.datatype.boolean({ probability: 0.05 });
        const lateFee = isLate ? faker.datatype.number({ min: 25, max: 100 }) : 0;

        payments.push({
            id: faker.datatype.uuid(),
            paymentDate: new Date(paymentDate),
            amount: emi + lateFee + escrowPaid,
            principalPaid: principalPayment,
            interestPaid: interestPayment,
            escrowPaid: escrowPaid,
            lateFeeApplied: lateFee,
            isLate: isLate,
        });

        paymentDate.setMonth(paymentDate.getMonth() + 1);
    }
    return payments;
};

const generateMockRefinanceEligibility = (): RefinanceEligibility => ({
    isEligible: faker.datatype.boolean({ probability: 0.7 }),
    suggestedRate: faker.datatype.float({ min: 2.0, max: 6.0, precision: 0.1 }),
    estimatedSavingsMonthly: faker.datatype.number({ min: 50, max: 500 }),
    reasonCodes: faker.random.arrayElements(['Lower_Rate_Available', 'Credit_Score_Improvement', 'Property_Value_Increase', 'Market_Conditions'], faker.datatype.number({ min: 1, max: 3 })),
    lastChecked: faker.date.recent(30),
});

const generateMockAiRecommendation = (loanId: string): AiRecommendation => ({
    id: faker.datatype.uuid(),
    type: faker.random.arrayElement(['refinance_alert', 'risk_mitigation', 'cross_sell_opportunity', 'portfolio_adjustment']),
    severity: faker.random.arrayElement(['low', 'medium', 'high']),
    message: faker.lorem.sentence(),
    timestamp: faker.date.recent(7),
    actionItems: faker.random.arrayElements([faker.lorem.word(), faker.lorem.word()], faker.datatype.number({ min: 1, max: 3 })),
    relatedLoanId: loanId,
});

export const generateMockMortgageLoan = (loanOfficerId: string): MortgageLoan => {
    const borrower = generateMockBorrowerProfile();
    const property = generateMockPropertyDetails();
    const originalBalance = faker.datatype.number({ min: 150000, max: 1000000 });
    const loanDetails = generateMockLoanDetails(originalBalance);
    const originationDate = faker.date.past(5);

    const loan: MortgageLoan = {
        id: faker.datatype.uuid(),
        loanNumber: faker.finance.account(10),
        borrower: borrower,
        property: property,
        loanDetails: loanDetails,
        status: faker.random.arrayElement(['application', 'pre_approved', 'approved', 'funded', 'servicing', 'defaulted', 'refinanced', 'paid_off']),
        originalBalance: originalBalance,
        currentBalance: faker.datatype.number({ min: originalBalance * 0.2, max: originalBalance * 0.95 }),
        originationDate: originationDate,
        nextPaymentDate: faker.date.future(0.5, originationDate),
        nextPaymentAmount: loanDetails.emi + (loanDetails.isEscrowed ? faker.datatype.number({ min: 100, max: 500 }) : 0),
        escrowBalance: faker.datatype.number({ min: 0, max: 3000 }),
        loanOfficerId: loanOfficerId,
        underwriterId: faker.datatype.uuid(),
        servicingAgentId: faker.datatype.uuid(),
        notes: [generateMockLoanNote(loanOfficerId, `${faker.name.firstName()} ${faker.name.lastName()}`)],
        documents: [generateMockLoanDocument(loanOfficerId)],
        riskScore: faker.datatype.number({ min: 1, max: 100 }),
        aiRecommendations: [],
        valuationHistory: [generateMockPropertyValuation()],
        paymentHistory: [],
        refinanceEligibility: generateMockRefinanceEligibility(),
    };
    loan.aiRecommendations = [generateMockAiRecommendation(loan.id)];
    loan.paymentHistory = generateMockLoanPayment(loan.id, loan.originationDate, loan.loanDetails.emi, loan.loanDetails.interestRate / 100 / 12, loan.loanDetails.termMonths);
    return loan;
};

export const generateMockMarketData = (days: number): MarketData[] => {
    const data: MarketData[] = [];
    let currentDate = new Date();
    let base30Yr = 3.5;
    let base15Yr = 3.0;
    let baseHPI = 200;

    for (let i = 0; i < days; i++) {
        currentDate.setDate(currentDate.getDate() - 1);
        base30Yr += faker.datatype.float({ min: -0.05, max: 0.05, precision: 0.01 });
        base15Yr += faker.datatype.float({ min: -0.04, max: 0.04, precision: 0.01 });
        baseHPI += faker.datatype.float({ min: -1, max: 2, precision: 0.1 });

        data.unshift({
            timestamp: new Date(currentDate),
            interestRate30YrFixed: parseFloat(base30Yr.toFixed(2)),
            interestRate15YrFixed: parseFloat(base15Yr.toFixed(2)),
            housingPriceIndex: parseFloat(baseHPI.toFixed(1)),
            inflationRate: faker.datatype.float({ min: 1.5, max: 4.5, precision: 0.1 }),
            gdpGrowth: faker.datatype.float({ min: -1.0, max: 3.0, precision: 0.1 }),
        });
    }
    return data;
};

// --- Mock API Service Layer (Simulate Backend Interactions) ---

export const mockApiService = {
    fetchMortgageLoans: async (userId: string, filter?: string): Promise<MortgageLoan[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const loans = Array.from({ length: 50 }, () => generateMockMortgageLoan(userId));
                resolve(loans);
            }, 500);
        });
    },
    fetchLoanById: async (loanId: string): Promise<MortgageLoan | null> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockLoan = generateMockMortgageLoan(faker.datatype.uuid());
                if (mockLoan.id === loanId) { // Simulate finding by ID
                    resolve(mockLoan);
                } else { // Return a consistent one if not found, for demonstration
                    const consistentLoan = generateMockMortgageLoan(faker.datatype.uuid());
                    consistentLoan.id = loanId;
                    resolve(consistentLoan);
                }
            }, 300);
        });
    },
    updateLoanStatus: async (loanId: string, status: MortgageLoan['status']): Promise<MortgageLoan> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockLoan = generateMockMortgageLoan(faker.datatype.uuid()); // Simulate update by returning new object
                mockLoan.id = loanId;
                mockLoan.status = status;
                resolve(mockLoan);
            }, 300);
        });
    },
    fetchMarketData: async (period: '7d' | '30d' | '90d' | '1y'): Promise<MarketData[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let days = 0;
                switch (period) {
                    case '7d': days = 7; break;
                    case '30d': days = 30; break;
                    case '90d': days = 90; break;
                    case '1y': days = 365; break;
                }
                resolve(generateMockMarketData(days));
            }, 400);
        });
    },
    fetchPortfolioSummary: async (userId: string): Promise<PortfolioSummary> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const loans = Array.from({ length: 50 }, () => generateMockMortgageLoan(userId));
                const totalLoans = loans.length;
                const totalPortfolioValue = loans.reduce((sum, loan) => sum + loan.currentBalance, 0);
                const avgInterestRate = loans.reduce((sum, loan) => sum + loan.loanDetails.interestRate, 0) / totalLoans;
                const avgLTV = loans.reduce((sum, loan) => sum + calculateLTV(loan.currentBalance, loan.property.currentValue), 0) / totalLoans;
                const delinquencyRate = loans.filter(loan => loan.status === 'defaulted' || (loan.paymentHistory.length > 0 && loan.paymentHistory[loan.paymentHistory.length - 1].isLate)).length / totalLoans;
                const forecastedDefaults = faker.datatype.number({ min: 1, max: 5 });
                const topPerformers = faker.random.arrayElements(loans.map(l => l.id), 3);
                const highRiskLoans = faker.random.arrayElements(loans.filter(l => l.riskScore > 70).map(l => l.id), 5);

                const geographicDistribution: { [state: string]: number } = {};
                loans.forEach(loan => {
                    const state = loan.property.address.state;
                    geographicDistribution[state] = (geographicDistribution[state] || 0) + 1;
                });

                const loanTypeDistribution: { [type: string]: number } = {};
                loans.forEach(loan => {
                    const type = loan.loanDetails.loanType;
                    loanTypeDistribution[type] = (loanTypeDistribution[type] || 0) + 1;
                });

                resolve({
                    totalLoans,
                    totalPortfolioValue,
                    avgInterestRate,
                    avgLTV,
                    delinquencyRate: parseFloat(delinquencyRate.toFixed(2)),
                    forecastedDefaults,
                    topPerformers,
                    highRiskLoans,
                    geographicDistribution,
                    loanTypeDistribution,
                });
            }, 600);
        });
    },
    fetchAiRecommendations: async (userId: string, loanId?: string): Promise<AiRecommendation[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const recommendations = Array.from({ length: faker.datatype.number({ min: 5, max: 15 }) }, () => generateMockAiRecommendation(loanId || faker.datatype.uuid()));
                resolve(recommendations);
            }, 300);
        });
    },
    fetchUserProfile: async (userId: string): Promise<UserProfile> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: userId,
                    firstName: "Jane",
                    lastName: "Doe",
                    email: "jane.doe@megacorp.com",
                    role: "portfolio_manager",
                    permissions: ["view_all_loans", "manage_portfolio", "approve_refinance"],
                    avatarUrl: "https://i.pravatar.cc/150?img=3"
                });
            }, 200);
        });
    },
    fetchAppSettings: async (userId: string): Promise<AppSettings> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    theme: 'dark',
                    currency: 'USD',
                    dateFormat: 'MM/DD/YYYY',
                    notificationPreferences: {
                        email: true,
                        sms: false,
                        inApp: true,
                    },
                    defaultPortfolioFilter: 'all',
                });
            }, 200);
        });
    },
    saveAppSettings: async (userId: string, settings: AppSettings): Promise<AppSettings> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // In a real app, this would persist
                resolve(settings);
            }, 200);
        });
    },
    // Add other API methods as needed (e.g., addLoan, updateLoan, uploadDocument, processPayment, etc.)
};

// --- Custom Hooks (Encapsulate Component Logic) ---

export const useLoans = (userId: string, initialFilter?: string) => {
    const [loans, setLoans] = useState<MortgageLoan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>(initialFilter || 'all');

    const fetchLoans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await mockApiService.fetchMortgageLoans(userId, filter);
            setLoans(data);
        } catch (err) {
            setError('Failed to fetch mortgage loans.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId, filter]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const updateLoanStatus = useCallback(async (loanId: string, status: MortgageLoan['status']) => {
        try {
            const updatedLoan = await mockApiService.updateLoanStatus(loanId, status);
            setLoans(prevLoans => prevLoans.map(loan => loan.id === loanId ? updatedLoan : loan));
            return updatedLoan;
        } catch (err) {
            setError('Failed to update loan status.');
            console.error(err);
            throw err;
        }
    }, []);

    return { loans, loading, error, setFilter, updateLoanStatus, refreshLoans: fetchLoans };
};

export const useMarketData = (period: '7d' | '30d' | '90d' | '1y') => {
    const [marketData, setMarketData] = useState<MarketData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await mockApiService.fetchMarketData(period);
                setMarketData(data);
            } catch (err) {
                setError('Failed to fetch market data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    return { marketData, loading, error };
};

export const usePortfolioSummary = (userId: string) => {
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await mockApiService.fetchPortfolioSummary(userId);
                setSummary(data);
            } catch (err) {
                setError('Failed to fetch portfolio summary.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [userId]);

    return { summary, loading, error };
};

export const useAiRecommendations = (userId: string, loanId?: string) => {
    const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await mockApiService.fetchAiRecommendations(userId, loanId);
                setRecommendations(data);
            } catch (err) {
                setError('Failed to fetch AI recommendations.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [userId, loanId]);

    return { recommendations, loading, error };
};

// --- MortgageAppProvider for Global State ---
export const MortgageAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [settings, setSettings] = useState<AppSettings>({
        theme: 'dark',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        notificationPreferences: { email: true, sms: false, inApp: true },
        defaultPortfolioFilter: 'all',
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Simulate user login and fetching initial settings
        const initApp = async () => {
            const mockUserId = 'user-123'; // In a real app, this would come from auth
            const user = await mockApiService.fetchUserProfile(mockUserId);
            setCurrentUser(user);
            const userSettings = await mockApiService.fetchAppSettings(user.id);
            setSettings(userSettings);
        };
        initApp();
    }, []);

    const addNotification = useCallback((notification: Notification) => {
        setNotifications(prev => [...prev, { ...notification, id: faker.datatype.uuid(), timestamp: new Date(), read: false }]);
    }, []);

    const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
        if (currentUser) {
            const updated = await mockApiService.saveAppSettings(currentUser.id, { ...settings, ...newSettings });
            setSettings(updated);
            addNotification({ type: 'success', message: 'Settings updated successfully.', id: 'temp', timestamp: new Date(), read: false });
        }
    }, [currentUser, settings, addNotification]);

    const login = useCallback((user: UserProfile) => {
        setCurrentUser(user);
        // Fetch user-specific settings here in a real app
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        // Clear tokens, etc.
    }, []);

    const contextValue = useMemo(() => ({
        currentUser,
        settings,
        notifications,
        addNotification,
        updateSettings,
        login,
        logout,
    }), [currentUser, settings, notifications, addNotification, updateSettings, login, logout]);

    return (
        <MortgageAppContext.Provider value={contextValue}>
            {children}
        </MortgageAppContext.Provider>
    );
};

// --- UI Components (Modular & Reusable) ---

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-400">Loading...</p>
    </div>
);

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-800 p-3 rounded-lg text-white">
        <p className="font-bold">Error:</p>
        <p>{message}</p>
    </div>
);

export const NotificationCenter: React.FC = () => {
    const { notifications, addNotification } = useMortgageApp(); // Assuming a method to mark as read would exist

    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Simulate new notifications
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every 10 seconds
                const types: Notification['type'][] = ['info', 'warning', 'success'];
                const messages = [
                    'New loan application received: Jane Doe',
                    'High-risk alert for Loan #1234567890',
                    'Interest rate forecast updated: rates expected to rise.',
                    'Refinance opportunity detected for client John Smith!',
                    'Portfolio summary generated successfully.'
                ];
                addNotification({
                    id: 'temp',
                    message: faker.random.arrayElement(messages),
                    type: faker.random.arrayElement(types),
                    timestamp: new Date(),
                    read: false,
                });
            }
        }, 10000); // Every 10 seconds
        return () => clearInterval(interval);
    }, [addNotification]);


    if (notifications.length === 0 && !isOpen) return null;

    return (
        <div className="relative">
            <button
                className="relative p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="fas fa-bell text-white"></i>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-700">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-white">Notifications ({unreadCount} unread)</h3>
                        <button className="text-blue-400 text-sm hover:underline">Mark all as read</button>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="text-gray-400 p-4 text-center">No new notifications.</p>
                    ) : (
                        <ul>
                            {notifications.map((notification, index) => (
                                <li key={notification.id || index} className={`p-3 border-b border-gray-700 last:border-b-0 ${notification.read ? 'bg-gray-800' : 'bg-gray-700/50'}`}>
                                    <div className="flex justify-between items-start">
                                        <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white font-medium'}`}>
                                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${notification.type === 'info' ? 'bg-blue-500' : notification.type === 'warning' ? 'bg-yellow-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            {notification.message}
                                        </p>
                                        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatDate(notification.timestamp, 'MM/DD/YYYY')}</span>
                                    </div>
                                    {notification.link && (
                                        <a href={notification.link} className="text-blue-400 text-xs hover:underline mt-1 block">View Details</a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export const UserProfileDropdown: React.FC = () => {
    const { currentUser, logout, settings } = useMortgageApp();
    const [isOpen, setIsOpen] = useState(false);

    if (!currentUser) return null;

    return (
        <div className="relative">
            <button
                className="flex items-center space-x-2 text-white p-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                <img src={currentUser.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="User Avatar" className="w-8 h-8 rounded-full border border-gray-500" />
                <span className="hidden md:block">{currentUser.firstName}</span>
                <i className="fas fa-caret-down text-sm"></i>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700">
                    <div className="p-3 border-b border-gray-700">
                        <p className="text-white font-semibold">{currentUser.firstName} {currentUser.lastName}</p>
                        <p className="text-gray-400 text-sm">{currentUser.role.replace(/_/g, ' ').toUpperCase()}</p>
                    </div>
                    <ul className="py-1">
                        <li><a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile Settings</a></li>
                        <li><a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">App Settings</a></li>
                        <li><button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">Logout</button></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export const AppHeader: React.FC = () => {
    return (
        <header className="flex justify-between items-center py-4 px-6 bg-gray-900 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Mortgage Dashboard</h1>
            <div className="flex items-center space-x-4">
                <NotificationCenter />
                <UserProfileDropdown />
            </div>
        </header>
    );
};

export const MarketTrendChart: React.FC = () => {
    const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const { marketData, loading, error } = useMarketData(timePeriod);

    const data = useMemo(() => {
        const labels = marketData.map(d => formatDate(d.timestamp, 'MM/DD/YYYY'));
        const interestRates = marketData.map(d => d.interestRate30YrFixed);
        const hpi = marketData.map(d => d.housingPriceIndex);

        return {
            labels,
            datasets: [
                {
                    label: '30-Year Fixed Rate',
                    data: interestRates,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    yAxisID: 'y',
                    fill: false,
                    tension: 0.3
                },
                {
                    label: 'Housing Price Index',
                    data: hpi,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    yAxisID: 'y1',
                    fill: false,
                    tension: 0.3
                },
            ],
        };
    }, [marketData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'white',
                }
            },
            title: {
                display: true,
                text: 'Key Market Trends',
                color: 'white',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.dataset.yAxisID === 'y') {
                            label += `${context.raw}%`;
                        } else {
                            label += context.raw;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: 'rgb(156, 163, 175)' },
                grid: { color: 'rgba(255,255,255,0.1)' },
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Interest Rate (%)',
                    color: 'rgb(53, 162, 235)'
                },
                ticks: { color: 'rgb(53, 162, 235)' },
                grid: { color: 'rgba(255,255,255,0.1)' },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'Housing Price Index',
                    color: 'rgb(255, 99, 132)'
                },
                grid: {
                    drawOnChartArea: false, // only want the grid lines for the first dataset to show
                    color: 'rgba(255,255,255,0.1)'
                },
                ticks: { color: 'rgb(255, 99, 132)' },
            },
        },
    };

    return (
        <Card title="Market Trends & AI Forecast">
            <div className="flex justify-end space-x-2 mb-4">
                {['7d', '30d', '90d', '1y'].map(period => (
                    <button
                        key={period}
                        className={`px-3 py-1 text-sm rounded-md ${timePeriod === period ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        onClick={() => setTimePeriod(period as typeof timePeriod)}
                    >
                        {period.toUpperCase()}
                    </button>
                ))}
            </div>
            {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
                <div style={{ height: '300px' }}>
                    <Line data={data} options={options} />
                </div>
            )}
            <p className="text-gray-400 text-sm mt-4">AI models provide forward-looking insights on rate changes and property value shifts to guide your strategy.</p>
        </Card>
    );
};

export const AiRecommendationList: React.FC = () => {
    const { currentUser } = useMortgageApp();
    const { recommendations, loading, error } = useAiRecommendations(currentUser?.id || 'mock-user-id');

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (recommendations.length === 0) return <p className="text-gray-400">No AI recommendations at this time.</p>;

    return (
        <Card title="AI Insights & Actionable Recommendations">
            <ul className="space-y-3">
                {recommendations.map(rec => (
                    <li key={rec.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${rec.severity === 'high' ? 'bg-red-900 text-red-200' : rec.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' : 'bg-blue-900 text-blue-200'}`}>
                                {rec.severity.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-xs">{formatDate(rec.timestamp, 'MM/DD/YYYY')}</span>
                        </div>
                        <h4 className="font-semibold text-white mb-1">{rec.type.replace(/_/g, ' ')}</h4>
                        <p className="text-gray-300 text-sm">{rec.message}</p>
                        {rec.relatedLoanId && (
                            <p className="text-gray-400 text-xs mt-1">Related Loan: <a href={`/loans/${rec.relatedLoanId}`} className="text-blue-400 hover:underline">#{rec.relatedLoanId.substring(0, 8)}</a></p>
                        )}
                        {rec.actionItems.length > 0 && (
                            <div className="mt-2">
                                <p className="text-gray-400 text-sm font-medium">Action Items:</p>
                                <ul className="list-disc list-inside text-gray-300 text-sm pl-2">
                                    {rec.actionItems.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export const PortfolioOverview: React.FC = () => {
    const { currentUser } = useMortgageApp();
    const { summary, loading, error } = usePortfolioSummary(currentUser?.id || 'mock-user-id');
    const { settings } = useMortgageApp();

    const geographicData = useMemo(() => {
        if (!summary) return null;
        const labels = Object.keys(summary.geographicDistribution);
        const dataValues = Object.values(summary.geographicDistribution);
        return {
            labels: labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCF',
                        '#FFCCBC', '#BDBDBD', '#8D6E63', '#4DD0E1', '#F48FB1', '#AED581', '#FFD700'
                    ],
                    hoverBackgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#C9CBCF',
                        '#FFCCBC', '#BDBDBD', '#8D6E63', '#4DD0E1', '#F48FB1', '#AED581', '#FFD700'
                    ],
                },
            ],
        };
    }, [summary]);

    const loanTypeData = useMemo(() => {
        if (!summary) return null;
        const labels = Object.keys(summary.loanTypeDistribution).map(type => type.replace(/_/g, ' '));
        const dataValues = Object.values(summary.loanTypeDistribution);
        return {
            labels: labels,
            datasets: [
                {
                    data: dataValues,
                    backgroundColor: [
                        '#50C878', '#FFD700', '#AEC6CF', '#FF6961', '#7FFFD4'
                    ],
                    hoverBackgroundColor: [
                        '#50C878', '#FFD700', '#AEC6CF', '#FF6961', '#7FFFD4'
                    ],
                },
            ],
        };
    }, [summary]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: false,
            },
        },
    };


    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!summary) return null;

    return (
        <Card title="Portfolio Performance Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <p className="text-gray-400 text-sm">Total Loans</p>
                    <p className="text-white text-2xl font-bold">{summary.totalLoans}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <p className="text-gray-400 text-sm">Portfolio Value</p>
                    <p className="text-white text-2xl font-bold">{formatCurrency(summary.totalPortfolioValue, settings.currency)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <p className="text-gray-400 text-sm">Avg. Interest Rate</p>
                    <p className="text-white text-2xl font-bold">{summary.avgInterestRate.toFixed(2)}%</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <p className="text-gray-400 text-sm">Delinquency Rate</p>
                    <p className="text-white text-2xl font-bold text-yellow-400">{summary.delinquencyRate.toFixed(2)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <h3 className="text-white text-lg font-semibold mb-3">Geographic Distribution</h3>
                    {geographicData && (
                        <div style={{ height: '250px' }}>
                            <Doughnut data={geographicData} options={chartOptions} />
                        </div>
                    )}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <h3 className="text-white text-lg font-semibold mb-3">Loan Type Distribution</h3>
                    {loanTypeData && (
                        <div style={{ height: '250px' }}>
                            <Doughnut data={loanTypeData} options={chartOptions} />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <h3 className="text-white text-lg font-semibold mb-3">High-Risk Loans (AI-identified)</h3>
                    {summary.highRiskLoans.length > 0 ? (
                        <ul className="space-y-2">
                            {summary.highRiskLoans.map(loanId => (
                                <li key={loanId} className="flex items-center text-red-400">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    <a href={`/loans/${loanId}`} className="hover:underline text-sm">Loan ID: {loanId.substring(0, 8)}</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-sm">No high-risk loans identified at this time.</p>
                    )}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                    <h3 className="text-white text-lg font-semibold mb-3">Forecasted Defaults (Next 90 Days)</h3>
                    <p className="text-red-400 text-3xl font-bold">{summary.forecastedDefaults}</p>
                    <p className="text-gray-400 text-sm mt-2">Our AI predicts potential defaults, allowing for proactive intervention.</p>
                </div>
            </div>
        </Card>
    );
};

export const LoanListingTable: React.FC = () => {
    const { currentUser, settings } = useMortgageApp();
    const { loans, loading, error, setFilter, updateLoanStatus } = useLoans(currentUser?.id || 'mock-user-id');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLoan, setSelectedLoan] = useState<MortgageLoan | null>(null);

    const filteredLoans = useMemo(() => {
        return loans.filter(loan =>
            loan.borrower.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.borrower.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.property.address.zipCode.includes(searchTerm)
        );
    }, [loans, searchTerm]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Card title="All Mortgage Loans">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-3 md:space-y-0">
                <input
                    type="text"
                    placeholder="Search by borrower name, loan #, or zip..."
                    className="p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 w-full md:w-auto"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex space-x-2">
                    {/* Example filter buttons */}
                    <button onClick={() => setFilter('all')} className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">All</button>
                    <button onClick={() => setFilter('servicing')} className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Servicing</button>
                    <button onClick={() => setFilter('defaulted')} className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Defaulted</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Loan #</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Borrower</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Property Address</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current Balance</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Interest Rate</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Score</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {filteredLoans.map((loan) => (
                            <tr key={loan.id} className="hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{loan.loanNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{loan.borrower.firstName} {loan.borrower.lastName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{loan.property.address.city}, {loan.property.address.state}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(loan.currentBalance, settings.currency)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{loan.loanDetails.interestRate}%</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        loan.status === 'servicing' ? 'bg-green-100 text-green-800' :
                                        loan.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                                        loan.status === 'defaulted' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>{loan.status.replace(/_/g, ' ')}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{loan.riskScore}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => setSelectedLoan(loan)} className="text-blue-400 hover:text-blue-600 mr-3">View</button>
                                    <button onClick={() => updateLoanStatus(loan.id, 'defaulted')} className="text-red-400 hover:text-red-600">Flag</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedLoan && (
                <LoanDetailsModal loan={selectedLoan} onClose={() => setSelectedLoan(null)} />
            )}
        </Card>
    );
};

export const LoanDetailsModal: React.FC<{ loan: MortgageLoan; onClose: () => void }> = ({ loan, onClose }) => {
    const { settings } = useMortgageApp();
    const [activeTab, setActiveTab] = useState<'overview' | 'amortization' | 'payments' | 'documents' | 'notes'>('overview');

    const chartData = useMemo(() => {
        const principalBalances = loan.loanDetails.amortizationSchedule.map(p => p.remainingBalance);
        const labels = loan.loanDetails.amortizationSchedule.map(p => p.month);
        return {
            labels,
            datasets: [
                {
                    label: 'Remaining Balance',
                    data: principalBalances,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                },
            ],
        };
    }, [loan.loanDetails.amortizationSchedule]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'white'
                }
            },
            title: {
                display: true,
                text: 'Amortization Schedule',
                color: 'white'
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Month',
                    color: 'white'
                },
                ticks: { color: 'rgb(156, 163, 175)' },
                grid: { color: 'rgba(255,255,255,0.1)' },
            },
            y: {
                title: {
                    display: true,
                    text: 'Balance',
                    color: 'white'
                },
                ticks: {
                    color: 'rgb(156, 163, 175)',
                    callback: function(value: any) {
                        return formatCurrency(value, settings.currency);
                    }
                },
                grid: { color: 'rgba(255,255,255,0.1)' },
            },
        },
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">Loan Details: {loan.loanNumber}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex border-b border-gray-700">
                    {['overview', 'amortization', 'payments', 'documents', 'notes'].map(tab => (
                        <button
                            key={tab}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                            onClick={() => setActiveTab(tab as typeof activeTab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h4 className="text-xl font-semibold text-white">Borrower & Property Info</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-4 rounded-lg">
                                <div>
                                    <p className="text-gray-400">Borrower: <span className="text-white">{loan.borrower.firstName} {loan.borrower.lastName}</span></p>
                                    <p className="text-gray-400">Email: <span className="text-white">{loan.borrower.email}</span></p>
                                    <p className="text-gray-400">Credit Score: <span className="text-white">{loan.borrower.creditScore}</span></p>
                                    <p className="text-gray-400">Income: <span className="text-white">{formatCurrency(loan.borrower.income, settings.currency)}</span></p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Property Address: <span className="text-white">{loan.property.address.street}, {loan.property.address.city}, {loan.property.address.state} {loan.property.address.zipCode}</span></p>
                                    <p className="text-gray-400">Property Type: <span className="text-white">{loan.property.propertyType.replace(/_/g, ' ')}</span></p>
                                    <p className="text-gray-400">Current Value: <span className="text-white">{formatCurrency(loan.property.currentValue, settings.currency)}</span></p>
                                    <p className="text-gray-400">Year Built: <span className="text-white">{loan.property.yearBuilt}</span></p>
                                </div>
                            </div>

                            <h4 className="text-xl font-semibold text-white mt-6">Loan Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700 p-4 rounded-lg">
                                <div>
                                    <p className="text-gray-400">Original Balance: <span className="text-white">{formatCurrency(loan.originalBalance, settings.currency)}</span></p>
                                    <p className="text-gray-400">Current Balance: <span className="text-white">{formatCurrency(loan.currentBalance, settings.currency)}</span></p>
                                    <p className="text-gray-400">Interest Rate: <span className="text-white">{loan.loanDetails.interestRate}%</span></p>
                                    <p className="text-gray-400">Loan Type: <span className="text-white">{loan.loanDetails.loanType.replace(/_/g, ' ')}</span></p>
                                    <p className="text-gray-400">Term: <span className="text-white">{loan.loanDetails.termMonths} Months</span></p>
                                    <p className="text-gray-400">EMI: <span className="text-white">{formatCurrency(loan.loanDetails.emi, settings.currency)}</span></p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Origination Date: <span className="text-white">{formatDate(loan.originationDate, settings.dateFormat)}</span></p>
                                    <p className="text-gray-400">Next Payment Date: <span className="text-white">{formatDate(loan.nextPaymentDate, settings.dateFormat)}</span></p>
                                    <p className="text-gray-400">Next Payment Amount: <span className="text-white">{formatCurrency(loan.nextPaymentAmount, settings.currency)}</span></p>
                                    <p className="text-gray-400">Escrow Balance: <span className="text-white">{formatCurrency(loan.escrowBalance, settings.currency)}</span></p>
                                    <p className="text-gray-400">Status: <span className="text-white">{loan.status.replace(/_/g, ' ')}</span></p>
                                    <p className="text-gray-400">Risk Score: <span className="text-white font-bold">{loan.riskScore}</span></p>
                                </div>
                            </div>

                            {loan.refinanceEligibility.isEligible && (
                                <div className="mt-6 bg-blue-900/50 p-4 rounded-lg border border-blue-700">
                                    <h4 className="text-xl font-semibold text-blue-200 flex items-center">
                                        <i className="fas fa-magic mr-2"></i> Refinance Opportunity!
                                    </h4>
                                    <p className="text-blue-300 mt-2">
                                        This loan is eligible for refinancing with a suggested rate of <span className="font-bold">{loan.refinanceEligibility.suggestedRate}%</span>,
                                        potentially saving the borrower <span className="font-bold">{formatCurrency(loan.refinanceEligibility.estimatedSavingsMonthly || 0, settings.currency)}</span> per month.
                                    </p>
                                    <p className="text-blue-400 text-sm mt-1">Reasons: {loan.refinanceEligibility.reasonCodes.map(r => r.replace(/_/g, ' ')).join(', ')}</p>
                                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Explore Refinance Options</button>
                                </div>
                            )}

                             {loan.aiRecommendations.length > 0 && (
                                <div className="mt-6 bg-purple-900/50 p-4 rounded-lg border border-purple-700">
                                    <h4 className="text-xl font-semibold text-purple-200 flex items-center">
                                        <i className="fas fa-robot mr-2"></i> AI Recommendations
                                    </h4>
                                    <ul className="mt-2 space-y-2">
                                        {loan.aiRecommendations.map(rec => (
                                            <li key={rec.id} className="text-purple-300 text-sm">
                                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${rec.severity === 'high' ? 'bg-red-500' : rec.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                                                {rec.message} - <span className="text-purple-400">Action: {rec.actionItems.join(', ')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'amortization' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-semibold text-white mb-4">Amortization Schedule</h4>
                            <div style={{ height: '400px' }}>
                                <Line data={chartData} options={chartOptions} />
                            </div>
                            <div className="overflow-x-auto max-h-80 custom-scrollbar mt-4">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-gray-700 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Month</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Total Payment</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Principal</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Interest</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Remaining Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {loan.loanDetails.amortizationSchedule.map((p, index) => (
                                            <tr key={index} className="hover:bg-gray-700/50">
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{p.month}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{formatCurrency(p.totalPayment, settings.currency)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-300">{formatCurrency(p.principalPayment, settings.currency)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-red-300">{formatCurrency(p.interestPayment, settings.currency)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{formatCurrency(p.remainingBalance, settings.currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-semibold text-white mb-4">Payment History</h4>
                            {loan.paymentHistory.length === 0 ? (
                                <p className="text-gray-400">No payment history available.</p>
                            ) : (
                                <div className="overflow-x-auto max-h-96 custom-scrollbar">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-gray-700 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Principal</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Interest</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Escrow</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Late Fee</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700">
                                            {loan.paymentHistory.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-700/50">
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{formatDate(payment.paymentDate, settings.dateFormat)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{formatCurrency(payment.amount, settings.currency)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-green-300">{formatCurrency(payment.principalPaid, settings.currency)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-red-300">{formatCurrency(payment.interestPaid, settings.currency)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-300">{formatCurrency(payment.escrowPaid, settings.currency)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-yellow-300">{formatCurrency(payment.lateFeeApplied, settings.currency)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.isLate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {payment.isLate ? 'Late' : 'On Time'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-semibold text-white mb-4">Loan Documents</h4>
                            {loan.documents.length === 0 ? (
                                <p className="text-gray-400">No documents available.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {loan.documents.map((doc) => (
                                        <li key={doc.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                            <div>
                                                <p className="text-white font-medium">{doc.fileName}</p>
                                                <p className="text-gray-400 text-sm">Type: {doc.documentType.replace(/_/g, ' ')} | Uploaded: {formatDate(doc.uploadDate, settings.dateFormat)}</p>
                                            </div>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">View</a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Upload New Document</button>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-semibold text-white mb-4">Internal Notes</h4>
                            {loan.notes.length === 0 ? (
                                <p className="text-gray-400">No notes available.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {loan.notes.map((note) => (
                                        <li key={note.id} className="bg-gray-700 p-3 rounded-lg">
                                            <p className="text-white text-sm mb-1">{note.content}</p>
                                            <p className="text-gray-400 text-xs">By {note.authorName} on {formatDate(note.timestamp, settings.dateFormat)}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-4">
                                <textarea
                                    className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                    placeholder="Add a new note..."
                                ></textarea>
                                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Note</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main MortgagesView Component ---
const MortgagesView: React.FC = () => {
    return (
        <MortgageAppProvider>
            <div className="min-h-screen bg-gray-900 flex flex-col">
                <AppHeader />
                <main className="flex-1 p-6 space-y-6">
                    <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8">Mortgage Command Center <i className="fas fa-home ml-2 text-blue-400"></i></h2>

                    {/* Mission Briefing Section (Enhanced) */}
                    <Card title="Mission Brief: AI-Powered Mortgage Ecosystem">
                        <p className="text-gray-400 leading-relaxed">
                            Welcome to your advanced Mortgage Command Center. This comprehensive platform integrates mortgage origination, servicing, and portfolio management with cutting-edge AI.
                            Leverage AI-driven forecasting for interest rates, real-time property valuations, and predictive refinancing alerts to optimize your operations and client engagement.
                            Our system empowers you to make data-informed decisions, mitigate risks, and uncover new growth opportunities in a dynamic housing market.
                        </p>
                        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-4">
                            <span className="bg-blue-800 text-blue-200 text-xs px-2 py-1 rounded-full flex items-center"><i className="fas fa-robot mr-1"></i> AI-Driven Forecasting</span>
                            <span className="bg-green-800 text-green-200 text-xs px-2 py-1 rounded-full flex items-center"><i className="fas fa-chart-line mr-1"></i> Real-time Analytics</span>
                            <span className="bg-purple-800 text-purple-200 text-xs px-2 py-1 rounded-full flex items-center"><i className="fas fa-user-friends mr-1"></i> Enhanced Client Lifecycle</span>
                            <span className="bg-red-800 text-red-200 text-xs px-2 py-1 rounded-full flex items-center"><i className="fas fa-shield-alt mr-1"></i> Proactive Risk Management</span>
                        </div>
                    </Card>

                    {/* Key Metrics and AI Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MarketTrendChart />
                        <AiRecommendationList />
                    </div>

                    {/* Portfolio Overview */}
                    <PortfolioOverview />

                    {/* Loan Listing and Management */}
                    <LoanListingTable />

                    {/* Add more sections as needed, e.g., Application Pipeline, Delinquency Management, Document Workflow */}
                    <Card title="Advanced Features & Modules">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                                <i className="fas fa-cogs text-blue-400 text-2xl"></i>
                                <div>
                                    <h4 className="font-semibold text-white">Automated Underwriting Workflow</h4>
                                    <p className="text-gray-400 text-sm">Streamline application processing with AI-assisted document verification and rule-based decisioning.</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                                <i className="fas fa-bullhorn text-green-400 text-2xl"></i>
                                <div>
                                    <h4 className="font-semibold text-white">Client Engagement Hub</h4>
                                    <p className="text-gray-400 text-sm">Personalized communication, self-service portals, and AI-driven cross-selling.</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                                <i className="fas fa-file-invoice-dollar text-yellow-400 text-2xl"></i>
                                <div>
                                    <h4 className="font-semibold text-white">Delinquency Prediction & Management</h4>
                                    <p className="text-gray-400 text-sm">Predict potential defaults and automate early intervention strategies.</p>
                                </div>
                            </div>
                             <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                                <i className="fas fa-chart-pie text-red-400 text-2xl"></i>
                                <div>
                                    <h4 className="font-semibold text-white">Stress Testing & Scenario Analysis</h4>
                                    <p className="text-gray-400 text-sm">Simulate market downturns and interest rate shocks to assess portfolio resilience.</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                                <i className="fas fa-shield-alt text-purple-400 text-2xl"></i>
                                <div>
                                    <h4 className="font-semibold text-white">Regulatory Compliance Dashboard</h4>
                                    <p className="text-gray-400 text-sm">Monitor compliance with evolving mortgage regulations and generate audit reports.</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center space-x-3">
                                <i className="fas fa-hand-holding-usd text-teal-400 text-2xl"></i>
                                <div>
                                    <h4 className="font-semibold text-white">Secondary Market Analytics</h4>
                                    <p className="text-gray-400 text-sm">Analyze loan pools for securitization and optimize sales strategies.</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </main>
                <footer className="bg-gray-900 border-t border-gray-700 p-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} MegaCorp Mortgage. All rights reserved. Powered by AI.
                </footer>
            </div>
        </MortgageAppProvider>
    );
};

export default MortgagesView;