import React, { useState, useEffect, useReducer, useCallback, createContext, useContext, useRef } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- Utility Types and Constants ---
export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF" | "CNY" | "SEK" | "NZD" | "MXN" | "SGD" | "HKD" | "NOK" | "KRW" | "TRY" | "INR" | "RUB" | "ZAR" | "BRL" | "PLN" | "DKK" | "THB" | "IDR" | "HUF" | "CZK" | "ILS" | "PHP" | "MYR" | "RON" | "EGP" | "VND" | "PKR" | "KWD" | "QAR" | "OMR" | "BHD" | "SAR" | "AED" | "COP" | "CLP" | "PEN" | "ARS" | "CRC" | "DOP" | "GTQ" | "HNL" | "JMD" | "NIO" | "PAB" | "PYG" | "UYU" | "VEF" | "XOF" | "XAF" | "NGN" | "GHS" | "KES" | "TZS" | "UGX" | "ZMW" | "BWP" | "MUR" | "MGA" | "SLL" | "CDF" | "ETB" | "SCR" | "LKR" | "BDT" | "NPR" | "MVR" | "BTN" | "LAK" | "MMK" | "KHR" | "PGK" | "FJD" | "WST" | "VUV" | "TOP" | "SBD" | "AFN" | "ALL" | "DZD" | "AOA" | "XCD" | "AMD" | "AWG" | "AZN" | "BBD" | "BYN" | "BZD" | "BND" | "BIF" | "CVE" | "KYD" | "KMF" | "HRK" | "CUP" | "ANG" | "DJF" | "SVC" | "ERN" | "ETB" | "FKP" | "GMD" | "GEL" | "GIP" | "GTQ" | "GNF" | "GYD" | "HTG" | "HNL" | "ISK" | "IRR" | "IQD" | "JMD" | "JOD" | "KZT" | "KPW" | "KGS" | "LBP" | "LSL" | "LRD" | "LYD" | "MOP" | "MWK" | "MRO" | "MDL" | "MNT" | "MAD" | "MZN" | "NAD" | "NPR" | "NIO" | "PKR" | "PAB" | "PGK" | "PYG" | "QAR" | "RON" | "RWF" | "SHP" | "STD" | "WST" | "SAR" | "RSD" | "SCR" | "SLL" | "SGD" | "SBD" | "SOS" | "SSP" | "LKR" | "SDG" | "SRD" | "SZL" | "SYP" | "TWD" | "TJS" | "TZS" | "TOP" | "TTD" | "TND" | "TMT" | "UGX" | "UAH" | "UZS" | "VUV" | "VES" | "YER" | "ZMW" | "ZWL";
export type PaymentMethodType = "BANK_TRANSFER" | "WALLET" | "CARD" | "CASH_PICKUP" | "MOBILE_MONEY";
export type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | "ON_HOLD" | "REFUNDED";
export type ComplianceStatus = "PENDING" | "APPROVED" | "REJECTED" | "REQUIRES_REVIEW" | "SCREENING_FAILED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const ALL_CURRENCIES: CurrencyCode[] = [
    "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "SEK", "NZD", "MXN", "SGD", "HKD", "NOK", "KRW", "TRY", "INR", "RUB", "ZAR", "BRL", "PLN", "DKK", "THB", "IDR", "HUF", "CZK", "ILS", "PHP", "MYR", "RON", "EGP", "VND", "PKR", "KWD", "QAR", "OMR", "BHD", "SAR", "AED", "COP", "CLP", "PEN", "ARS", "CRC", "DOP", "GTQ", "HNL", "JMD", "NIO", "PAB", "PYG", "UYU", "VEF", "XOF", "XAF", "NGN", "GHS", "KES", "TZS", "UGX", "ZMW", "BWP", "MUR", "MGA", "SLL", "CDF", "ETB", "SCR", "LKR", "BDT", "NPR", "MVR", "BTN", "LAK", "MMK", "KHR", "PGK", "FJD", "WST", "VUV", "TOP", "SBD", "AFN", "ALL", "DZD", "AOA", "AMD", "AWG", "AZN", "BBD", "BYN", "BZD", "BND", "BIF", "CVE", "KYD", "KMF", "HRK", "CUP", "ANG", "DJF", "SVC", "ERN", "FKP", "GMD", "GEL", "GIP", "GNF", "GYD", "HTG", "ISK", "IRR", "IQD", "JOD", "KZT", "KPW", "KGS", "LBP", "LSL", "LRD", "LYD", "MOP", "MWK", "MRO", "MDL", "MNT", "MAD", "MZN", "NAD", "SHP", "STD", "RSD", "SDG", "SRD", "SZL", "SYP", "TWD", "TJS", "TMT", "UAH", "UZS", "VES", "YER", "ZWL"
];

export const PAYMENT_METHODS: { type: PaymentMethodType, name: string, supportedCurrencies: CurrencyCode[] }[] = [
    { type: "BANK_TRANSFER", name: "Bank Transfer", supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "BRL", "INR", "SGD", "JPY", "CNY", "AED", "SAR", "PHP", "MXN", "NGN", "ZAR", "KES", "GHS", "COP", "CLP", "PEN", "ARS", "EGP"] },
    { type: "WALLET", name: "Digital Wallet", supportedCurrencies: ["USD", "EUR", "GBP", "PHP", "INR", "SGD", "IDR", "MXN", "NGN", "KES", "GHS", "ZAR"] },
    { type: "CARD", name: "Credit/Debit Card", supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "SGD", "JPY", "MXN", "BRL", "INR"] },
    { type: "CASH_PICKUP", name: "Cash Pick-up", supportedCurrencies: ["PHP", "INR", "IDR", "MXN", "NGN", "KES", "GHS"] },
    { type: "MOBILE_MONEY", name: "Mobile Money", supportedCurrencies: ["KES", "GHS", "NGN", "UGX", "TZS", "ZMW", "RWF"] }
];

export const COUNTRIES_DATA: { code: string; name: string; currency: CurrencyCode; }[] = [
    { code: "US", name: "United States", currency: "USD" },
    { code: "GB", name: "United Kingdom", currency: "GBP" },
    { code: "DE", name: "Germany", currency: "EUR" },
    { code: "FR", name: "France", currency: "EUR" },
    { code: "CA", name: "Canada", currency: "CAD" },
    { code: "AU", name: "Australia", currency: "AUD" },
    { code: "BR", name: "Brazil", currency: "BRL" },
    { code: "IN", name: "India", currency: "INR" },
    { code: "PH", name: "Philippines", currency: "PHP" },
    { code: "MX", name: "Mexico", currency: "MXN" },
    { code: "NG", name: "Nigeria", currency: "NGN" },
    { code: "KE", name: "Kenya", currency: "KES" },
    { code: "GH", name: "Ghana", currency: "GHS" },
    { code: "ZA", name: "South Africa", currency: "ZAR" },
    { code: "AE", name: "United Arab Emirates", currency: "AED" },
    { code: "SA", name: "Saudi Arabia", currency: "SAR" },
    { code: "JP", name: "Japan", currency: "JPY" },
    { code: "CN", name: "China", currency: "CNY" },
    { code: "SG", name: "Singapore", currency: "SGD" },
    { code: "ID", name: "Indonesia", currency: "IDR" },
    { code: "PL", name: "Poland", currency: "PLN" },
    { code: "CH", name: "Switzerland", currency: "CHF" },
    { code: "SE", name: "Sweden", currency: "SEK" },
    { code: "NO", name: "Norway", currency: "NOK" },
    { code: "DK", name: "Denmark", currency: "DKK" },
    { code: "NZ", name: "New Zealand", currency: "NZD" },
    { code: "KR", name: "South Korea", currency: "KRW" },
    { code: "TR", name: "Turkey", currency: "TRY" },
    { code: "RU", name: "Russia", currency: "RUB" },
    { code: "CZ", name: "Czech Republic", currency: "CZK" },
    { code: "HU", name: "Hungary", currency: "HUF" },
    { code: "IL", name: "Israel", currency: "ILS" },
    { code: "EG", name: "Egypt", currency: "EGP" },
    { code: "VN", name: "Vietnam", currency: "VND" },
    { code: "PK", name: "Pakistan", currency: "PKR" },
    { code: "KW", name: "Kuwait", currency: "KWD" },
    { code: "QA", name: "Qatar", currency: "QAR" },
    { code: "OM", name: "Oman", currency: "OMR" },
    { code: "BH", name: "Bahrain", currency: "BHD" },
    { code: "CO", name: "Colombia", currency: "COP" },
    { code: "CL", name: "Chile", currency: "CLP" },
    { code: "PE", name: "Peru", currency: "PEN" },
    { code: "AR", name: "Argentina", currency: "ARS" },
    { code: "CR", name: "Costa Rica", currency: "CRC" },
    { code: "DO", name: "Dominican Republic", currency: "DOP" },
    { code: "GT", name: "Guatemala", currency: "GTQ" },
    { code: "HN", name: "Honduras", currency: "HNL" },
    { code: "JM", name: "Jamaica", currency: "JMD" },
    { code: "NI", name: "Nicaragua", currency: "NIO" },
    { code: "PA", name: "Panama", currency: "PAB" },
    { code: "PY", name: "Paraguay", currency: "PYG" },
    { code: "UY", name: "Uruguay", currency: "UYU" },
    { code: "VE", name: "Venezuela", currency: "VEF" },
    { code: "BW", name: "Botswana", currency: "BWP" },
    { code: "MU", name: "Mauritius", currency: "MUR" },
    { code: "MG", name: "Madagascar", currency: "MGA" },
    { code: "SL", name: "Sierra Leone", currency: "SLL" },
    { code: "CD", name: "DR Congo", currency: "CDF" },
    { code: "ET", name: "Ethiopia", currency: "ETB" },
    { code: "SC", name: "Seychelles", currency: "SCR" },
    { code: "LK", name: "Sri Lanka", currency: "LKR" },
    { code: "BD", name: "Bangladesh", currency: "BDT" },
    { code: "NP", name: "Nepal", currency: "NPR" },
    { code: "MV", name: "Maldives", currency: "MVR" },
    { code: "BT", name: "Bhutan", currency: "BTN" },
    { code: "LA", name: "Laos", currency: "LAK" },
    { code: "MM", name: "Myanmar", currency: "MMK" },
    { code: "KH", name: "Cambodia", currency: "KHR" },
    { code: "PG", name: "Papua New Guinea", currency: "PGK" },
    { code: "FJ", name: "Fiji", currency: "FJD" },
    { code: "WS", name: "Samoa", currency: "WST" },
    { code: "VU", name: "Vanuatu", currency: "VUV" },
    { code: "TO", name: "Tonga", currency: "TOP" },
    { code: "SB", name: "Solomon Islands", currency: "SBD" },
];

// --- Mock API Services ---

export interface Beneficiary {
    id: string;
    fullName: string;
    bankName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
    walletId?: string;
    mobileNumber?: string;
    address: string;
    country: string;
    currency: CurrencyCode;
    paymentMethodType: PaymentMethodType;
    kycStatus: ComplianceStatus;
    riskScore: RiskLevel;
    lastUpdated: string;
}

export interface BeneficiaryPayload {
    fullName: string;
    bankName: string;
    accountNumber: string;
    swiftCode?: string;
    iban?: string;
    walletId?: string;
    mobileNumber?: string;
    address: string;
    country: string;
    currency: CurrencyCode;
    paymentMethodType: PaymentMethodType;
}

export const beneficiaryService = {
    _beneficiaries: [] as Beneficiary[],
    _idCounter: 0,

    init: () => {
        if (beneficiaryService._beneficiaries.length === 0) {
            beneficiaryService._beneficiaries.push({
                id: `ben-${beneficiaryService._idCounter++}`,
                fullName: "Alice Wonderland",
                bankName: "First National Bank",
                accountNumber: "1234567890",
                swiftCode: "FNBBRA00",
                address: "Rua do Pix 123, São Paulo",
                country: "Brazil",
                currency: "BRL",
                paymentMethodType: "BANK_TRANSFER",
                kycStatus: "APPROVED",
                riskScore: "LOW",
                lastUpdated: new Date().toISOString()
            });
            beneficiaryService._beneficiaries.push({
                id: `ben-${beneficiaryService._idCounter++}`,
                fullName: "Bob The Builder",
                bankName: "Global Wallet Inc.",
                walletId: "bobbuilder@globalwallet.com",
                accountNumber: "N/A",
                address: "123 Digital Lane, Singapore",
                country: "Singapore",
                currency: "SGD",
                paymentMethodType: "WALLET",
                kycStatus: "APPROVED",
                riskScore: "LOW",
                lastUpdated: new Date().toISOString()
            });
            beneficiaryService._beneficiaries.push({
                id: `ben-${beneficiaryService._idCounter++}`,
                fullName: "Charlie Chaplin",
                bankName: "Rural Bank of Philippines",
                mobileNumber: "+639171234567",
                accountNumber: "N/A",
                address: "Street 456, Manila",
                country: "Philippines",
                currency: "PHP",
                paymentMethodType: "MOBILE_MONEY",
                kycStatus: "REQUIRES_REVIEW",
                riskScore: "MEDIUM",
                lastUpdated: new Date().toISOString()
            });
        }
    },

    getBeneficiaries: async (): Promise<Beneficiary[]> => {
        beneficiaryService.init();
        return new Promise(resolve => setTimeout(() => resolve([...beneficiaryService._beneficiaries]), 500));
    },

    getBeneficiaryById: async (id: string): Promise<Beneficiary | undefined> => {
        beneficiaryService.init();
        return new Promise(resolve => setTimeout(() => resolve(beneficiaryService._beneficiaries.find(b => b.id === id)), 300));
    },

    addBeneficiary: async (payload: BeneficiaryPayload): Promise<Beneficiary> => {
        beneficiaryService.init();
        return new Promise(resolve => setTimeout(() => {
            const newBeneficiary: Beneficiary = {
                ...payload,
                id: `ben-${beneficiaryService._idCounter++}`,
                kycStatus: "PENDING",
                riskScore: Math.random() < 0.1 ? "HIGH" : (Math.random() < 0.3 ? "MEDIUM" : "LOW"),
                lastUpdated: new Date().toISOString(),
                swiftCode: payload.paymentMethodType === "BANK_TRANSFER" ? (payload.swiftCode || `SWIFT${Math.floor(Math.random() * 900) + 100}${payload.country.substring(0,2).toUpperCase()}`) : undefined,
                iban: payload.paymentMethodType === "BANK_TRANSFER" && payload.currency === "EUR" ? (payload.iban || `IBAN${Math.floor(Math.random() * 900) + 100}${payload.country.substring(0,2).toUpperCase()}${Math.floor(Math.random() * 1000000000)}`) : undefined,
                walletId: payload.paymentMethodType === "WALLET" ? (payload.walletId || `${payload.fullName.replace(/\s/g, '').toLowerCase()}@wallet.com`) : undefined,
                mobileNumber: payload.paymentMethodType === "MOBILE_MONEY" || payload.paymentMethodType === "CASH_PICKUP" ? (payload.mobileNumber || `+${Math.floor(Math.random() * 90000000000) + 1000000000}`) : undefined,
            };
            beneficiaryService._beneficiaries.unshift(newBeneficiary);
            resolve(newBeneficiary);
        }, 800));
    },

    updateBeneficiary: async (id: string, payload: Partial<BeneficiaryPayload>): Promise<Beneficiary | undefined> => {
        beneficiaryService.init();
        return new Promise(resolve => setTimeout(() => {
            const index = beneficiaryService._beneficiaries.findIndex(b => b.id === id);
            if (index > -1) {
                const updatedBeneficiary = {
                    ...beneficiaryService._beneficiaries[index],
                    ...payload,
                    lastUpdated: new Date().toISOString(),
                    kycStatus: Math.random() < 0.05 ? "REQUIRES_REVIEW" : beneficiaryService._beneficiaries[index].kycStatus,
                    riskScore: Math.random() < 0.05 ? "HIGH" : beneficiaryService._beneficiaries[index].riskScore,
                };
                beneficiaryService._beneficiaries[index] = updatedBeneficiary;
                resolve(updatedBeneficiary);
            }
            resolve(undefined);
        }, 800));
    },

    deleteBeneficiary: async (id: string): Promise<boolean> => {
        beneficiaryService.init();
        return new Promise(resolve => setTimeout(() => {
            const initialLength = beneficiaryService._beneficiaries.length;
            beneficiaryService._beneficiaries = beneficiaryService._beneficiaries.filter(b => b.id !== id);
            resolve(beneficiaryService._beneficiaries.length < initialLength);
        }, 500));
    },

    performComplianceCheck: async (id: string): Promise<{ kycStatus: ComplianceStatus, riskScore: RiskLevel, details: string }> => {
        beneficiaryService.init();
        return new Promise(resolve => setTimeout(() => {
            const beneficiary = beneficiaryService._beneficiaries.find(b => b.id === id);
            if (!beneficiary) {
                resolve({ kycStatus: "REJECTED", riskScore: "CRITICAL", details: "Beneficiary not found." });
                return;
            }
            const random = Math.random();
            let newKycStatus: ComplianceStatus = "APPROVED";
            let newRiskScore: RiskLevel = "LOW";
            let details = "Initial screening passed.";

            if (beneficiary.riskScore === "HIGH" || random < 0.1) {
                newRiskScore = "HIGH";
                newKycStatus = "REQUIRES_REVIEW";
                details = "Flagged for enhanced due diligence (EDD) due to high-risk profile or country/jurisdiction concerns. Potential sanctions hit or adverse media found.";
            } else if (random < 0.3) {
                newRiskScore = "MEDIUM";
                newKycStatus = "REQUIRES_REVIEW";
                details = "Additional documentation required for KYC verification or transaction pattern anomaly.";
            }

            if (random < 0.02) {
                newKycStatus = "REJECTED";
                newRiskScore = "CRITICAL";
                details = "Beneficiary found on international sanctions list or critical fraud indicators detected.";
            }

            const index = beneficiaryService._beneficiaries.findIndex(b => b.id === id);
            if (index > -1) {
                beneficiaryService._beneficiaries[index].kycStatus = newKycStatus;
                beneficiaryService._beneficiaries[index].riskScore = newRiskScore;
                beneficiaryService._beneficiaries[index].lastUpdated = new Date().toISOString();
            }

            resolve({ kycStatus: newKycStatus, riskScore: newRiskScore, details });
        }, 1500));
    }
};

export interface Transaction {
    id: string;
    senderId: string;
    beneficiaryId: string;
    sendAmount: number;
    sendCurrency: CurrencyCode;
    receiveAmount: number;
    receiveCurrency: CurrencyCode;
    fxRate: number;
    fees: number;
    totalCharged: number;
    paymentMethodType: PaymentMethodType;
    status: TransactionStatus;
    createdAt: string;
    updatedAt: string;
    complianceChecks: {
        aml: boolean;
        kyc: boolean;
        sanctionsScreening: boolean;
        riskScore: RiskLevel;
        notes?: string;
    };
    trackingNumber: string;
}

export interface TransactionPayload {
    beneficiaryId: string;
    sendAmount: number;
    sendCurrency: CurrencyCode;
    receiveCurrency: CurrencyCode;
    paymentMethodType: PaymentMethodType;
}

export const transactionService = {
    _transactions: [] as Transaction[],
    _idCounter: 0,

    init: () => {
        if (transactionService._transactions.length === 0) {
            transactionService._transactions.push({
                id: `tx-${transactionService._idCounter++}`,
                senderId: "user-123",
                beneficiaryId: "ben-0",
                sendAmount: 1000,
                sendCurrency: "USD",
                receiveAmount: 5000,
                receiveCurrency: "BRL",
                fxRate: 5.0,
                fees: 15.0,
                totalCharged: 1015.0,
                paymentMethodType: "BANK_TRANSFER",
                status: "COMPLETED",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                complianceChecks: {
                    aml: true,
                    kyc: true,
                    sanctionsScreening: true,
                    riskScore: "LOW",
                },
                trackingNumber: `TRK${Math.floor(Math.random() * 900000) + 100000}`
            });
            transactionService._transactions.push({
                id: `tx-${transactionService._idCounter++}`,
                senderId: "user-123",
                beneficiaryId: "ben-1",
                sendAmount: 500,
                sendCurrency: "GBP",
                receiveAmount: 850,
                receiveCurrency: "SGD",
                fxRate: 1.7,
                fees: 8.0,
                totalCharged: 508.0,
                paymentMethodType: "WALLET",
                status: "PENDING",
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                complianceChecks: {
                    aml: true,
                    kyc: true,
                    sanctionsScreening: false,
                    riskScore: "MEDIUM",
                    notes: "Sanctions screening failed. Manual review required."
                },
                trackingNumber: `TRK${Math.floor(Math.random() * 900000) + 100000}`
            });
            transactionService._transactions.push({
                id: `tx-${transactionService._idCounter++}`,
                senderId: "user-123",
                beneficiaryId: "ben-0",
                sendAmount: 2500,
                sendCurrency: "EUR",
                receiveAmount: 13000,
                receiveCurrency: "BRL",
                fxRate: 5.2,
                fees: 25.0,
                totalCharged: 2525.0,
                paymentMethodType: "CARD",
                status: "FAILED",
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                complianceChecks: {
                    aml: true,
                    kyc: true,
                    sanctionsScreening: true,
                    riskScore: "LOW",
                },
                trackingNumber: `TRK${Math.floor(Math.random() * 900000) + 100000}`
            });
        }
    },

    getTransactions: async (filters?: { status?: TransactionStatus, beneficiaryId?: string }): Promise<Transaction[]> => {
        transactionService.init();
        return new Promise(resolve => setTimeout(() => {
            let result = [...transactionService._transactions];
            if (filters?.status) {
                result = result.filter(t => t.status === filters.status);
            }
            if (filters?.beneficiaryId) {
                result = result.filter(t => t.beneficiaryId === filters.beneficiaryId);
            }
            resolve(result.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }, 500));
    },

    getTransactionById: async (id: string): Promise<Transaction | undefined> => {
        transactionService.init();
        return new Promise(resolve => setTimeout(() => resolve(transactionService._transactions.find(t => t.id === id)), 300));
    },

    createTransaction: async (payload: TransactionPayload): Promise<Transaction> => {
        transactionService.init();
        return new Promise(async (resolve, reject) => {
            setTimeout(async () => {
                const beneficiary = await beneficiaryService.getBeneficiaryById(payload.beneficiaryId);
                if (!beneficiary) {
                    return reject(new Error("Beneficiary not found."));
                }

                const fxRate = (await fxService.getRate(payload.sendCurrency, payload.receiveCurrency))?.rate || 1.0;
                const fees = Math.max(5, payload.sendAmount * 0.01 + (payload.sendCurrency === "USD" ? 0 : 2));
                const receiveAmount = payload.sendAmount * fxRate;
                const totalCharged = payload.sendAmount + fees;

                const complianceResult = await beneficiaryService.performComplianceCheck(payload.beneficiaryId);
                let transactionStatus: TransactionStatus = "PENDING";
                let complianceNotes = complianceResult.details;
                let amlCheck = true;
                let kycCheck = complianceResult.kycStatus === "APPROVED";
                let sanctionsScreening = complianceResult.riskScore !== "CRITICAL";

                if (complianceResult.kycStatus === "REJECTED" || complianceResult.riskScore === "CRITICAL") {
                    transactionStatus = "FAILED";
                    amlCheck = false;
                } else if (complianceResult.kycStatus === "REQUIRES_REVIEW" || complianceResult.riskScore === "HIGH") {
                    transactionStatus = "ON_HOLD";
                } else {
                    if (Math.random() < 0.1) {
                        transactionStatus = "FAILED";
                        complianceNotes += " Payment gateway reported an error.";
                    } else if (Math.random() < 0.2) {
                        transactionStatus = "PROCESSING";
                    } else {
                        transactionStatus = "COMPLETED";
                    }
                }

                const newTransaction: Transaction = {
                    id: `tx-${transactionService._idCounter++}`,
                    senderId: "user-123",
                    beneficiaryId: payload.beneficiaryId,
                    sendAmount: payload.sendAmount,
                    sendCurrency: payload.sendCurrency,
                    receiveAmount: receiveAmount,
                    receiveCurrency: payload.receiveCurrency,
                    fxRate: fxRate,
                    fees: fees,
                    totalCharged: totalCharged,
                    paymentMethodType: payload.paymentMethodType,
                    status: transactionStatus,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    complianceChecks: {
                        aml: amlCheck,
                        kyc: kycCheck,
                        sanctionsScreening: sanctionsScreening,
                        riskScore: complianceResult.riskScore,
                        notes: complianceNotes
                    },
                    trackingNumber: `TRK${Math.floor(Math.random() * 900000) + 100000}`
                };
                transactionService._transactions.unshift(newTransaction);
                resolve(newTransaction);
            }, 1500);
        });
    },

    updateTransactionStatus: async (id: string, newStatus: TransactionStatus): Promise<Transaction | undefined> => {
        transactionService.init();
        return new Promise(resolve => setTimeout(() => {
            const index = transactionService._transactions.findIndex(t => t.id === id);
            if (index > -1) {
                const updatedTransaction = {
                    ...transactionService._transactions[index],
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                };
                transactionService._transactions[index] = updatedTransaction;
                resolve(updatedTransaction);
            }
            resolve(undefined);
        }, 500));
    }
};

export interface FXRate {
    from: CurrencyCode;
    to: CurrencyCode;
    rate: number;
    bid: number;
    ask: number;
    timestamp: string;
}

export const fxService = {
    _rates: new Map<string, FXRate>(),

    _generateMockRate: (from: CurrencyCode, to: CurrencyCode): FXRate => {
        const baseRates: { [key in CurrencyCode]?: number } = {
            "USD": 1.0, "EUR": 0.92, "GBP": 0.79, "JPY": 155.0, "AUD": 1.51, "CAD": 1.37, "CHF": 0.90, "CNY": 7.23,
            "INR": 83.5, "BRL": 5.12, "PHP": 58.0, "MXN": 16.9, "NGN": 1400.0, "KES": 130.0, "GHS": 14.5, "ZAR": 18.5,
            "SGD": 1.35, "AED": 3.67, "SAR": 3.75, "KRW": 1370.0, "THB": 36.5, "IDR": 16200.0, "VND": 25400.0
        };

        const rateFrom = baseRates[from] || 1.0;
        const rateTo = baseRates[to] || 1.0;

        const directRate = (rateTo / rateFrom);
        const fluctuation = (Math.random() * 0.02 - 0.01);
        const rate = directRate * (1 + fluctuation);
        const bid = rate * 0.998;
        const ask = rate * 1.002;

        return {
            from,
            to,
            rate: parseFloat(rate.toFixed(4)),
            bid: parseFloat(bid.toFixed(4)),
            ask: parseFloat(ask.toFixed(4)),
            timestamp: new Date().toISOString()
        };
    },

    getRate: async (from: CurrencyCode, to: CurrencyCode): Promise<FXRate | undefined> => {
        const key = `${from}_${to}`;
        if (from === to) {
            return { from, to, rate: 1.0, bid: 1.0, ask: 1.0, timestamp: new Date().toISOString() };
        }
        return new Promise(resolve => setTimeout(() => {
            let rate = fxService._rates.get(key);
            if (!rate || (new Date().getTime() - new Date(rate.timestamp).getTime() > 60 * 1000)) {
                rate = fxService._generateMockRate(from, to);
                fxService._rates.set(key, rate);
            }
            resolve(rate);
        }, 200));
    },

    getPopularRates: async (base: CurrencyCode, targets: CurrencyCode[]): Promise<FXRate[]> => {
        return Promise.all(targets.map(target => fxService.getRate(base, target).then(r => r!)));
    }
};

// --- Custom Hooks and Utilities ---

export const useFormValidation = <T extends Record<string, any>>(initialState: T, validationRules: { [K in keyof T]?: (value: T[K], allValues: T) => string | undefined }) => {
    const [values, setValues] = useState<T>(initialState);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
        if (validationRules[name as keyof T]) {
            const error = validationRules[name as keyof T]!(value as T[keyof T], { ...values, [name]: value } as T);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        if (validationRules[name as keyof T]) {
            const error = validationRules[name as keyof T]!(value as T[keyof T], values);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const validate = useCallback(() => {
        let formIsValid = true;
        const newErrors: Partial<Record<keyof T, string>> = {};
        const newTouched: Partial<Record<keyof T, boolean>> = {};

        for (const key in validationRules) {
            if (validationRules.hasOwnProperty(key)) {
                const error = validationRules[key]!(values[key], values);
                if (error) {
                    newErrors[key] = error;
                    formIsValid = false;
                }
                newTouched[key] = true;
            }
        }
        setErrors(newErrors);
        setTouched(newTouched);
        return formIsValid;
    }, [values, validationRules]);

    const resetForm = useCallback(() => {
        setValues(initialState);
        setErrors({});
        setTouched({});
    }, [initialState]);

    const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
        if (validationRules[field]) {
            const error = validationRules[field]!(value, { ...values, [field]: value } as T);
            setErrors(prev => ({ ...prev, [field]: error }));
        }
    }, [values, validationRules]);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validate,
        resetForm,
        setValue,
        setValues
    };
};

export const formatCurrency = (amount: number, currency: CurrencyCode, locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};

export const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

// --- UI Components ---

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    error?: string;
    touched?: boolean;
    containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, error, touched, containerClassName, ...props }) => (
    <div className={`form-group ${containerClassName || ''}`}>
        <label htmlFor={id} className="block text-gray-300 text-sm font-medium mb-1">
            {label}
        </label>
        <input
            id={id}
            name={id}
            {...props}
            className={`w-full bg-gray-700/50 p-2 rounded text-white border ${touched && error ? 'border-red-500' : 'border-gray-700'} focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500`}
        />
        {touched && error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
    </div>
);

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    options: { value: string; label: string; }[];
    error?: string;
    touched?: boolean;
    containerClassName?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, id, options, error, touched, containerClassName, ...props }) => (
    <div className={`form-group ${containerClassName || ''}`}>
        <label htmlFor={id} className="block text-gray-300 text-sm font-medium mb-1">
            {label}
        </label>
        <select
            id={id}
            name={id}
            {...props}
            className={`w-full bg-gray-700/50 p-2 rounded text-white border ${touched && error ? 'border-red-500' : 'border-gray-700'} focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        {touched && error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
    </div>
);

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
    error?: string;
    touched?: boolean;
    containerClassName?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, id, error, touched, containerClassName, ...props }) => (
    <div className={`form-group ${containerClassName || ''}`}>
        <label htmlFor={id} className="block text-gray-300 text-sm font-medium mb-1">
            {label}
        </label>
        <textarea
            id={id}
            name={id}
            {...props}
            className={`w-full bg-gray-700/50 p-2 rounded text-white border ${touched && error ? 'border-red-500' : 'border-gray-700'} focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 resize-y`}
        />
        {touched && error && <p className="mt-1 text-red-400 text-xs">{error}</p>}
    </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "outline";
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = "primary", isLoading, children, className, ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium transition ease-in-out duration-200";
    let variantStyle = "";
    switch (variant) {
        case "primary":
            variantStyle = "bg-cyan-600 hover:bg-cyan-700 text-white";
            break;
        case "secondary":
            variantStyle = "bg-gray-600 hover:bg-gray-700 text-white";
            break;
        case "danger":
            variantStyle = "bg-red-600 hover:bg-red-700 text-white";
            break;
        case "outline":
            variantStyle = "border border-gray-500 text-gray-300 hover:bg-gray-700";
            break;
    }
    return (
        <button
            className={`${baseStyle} ${variantStyle} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {children || 'Loading...'}
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string }> = ({ isOpen, onClose, title, children, className }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700 max-h-[90vh] flex flex-col ${className}`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export interface Notification {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
}

interface NotificationContextType {
    addNotification: (message: string, type: Notification['type'], duration?: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: Notification['type'], duration: number = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification: Notification = { id, message, type, duration };
        setNotifications(prev => [...prev, newNotification]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, duration);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[200] space-y-2 max-w-xs w-full">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`p-3 rounded-lg shadow-lg flex items-center justify-between text-white ${
                            notification.type === "success" ? "bg-green-600" :
                            notification.type === "error" ? "bg-red-600" :
                            notification.type === "info" ? "bg-blue-600" : "bg-yellow-600"
                        }`}
                    >
                        <span>{notification.message}</span>
                        <button onClick={() => removeNotification(notification.id)} className="ml-4 text-white opacity-75 hover:opacity-100">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// --- Main application sections ---

export const BeneficiaryManagementSection: React.FC = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { addNotification } = useNotification();

    const fetchBeneficiaries = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await beneficiaryService.getBeneficiaries();
            setBeneficiaries(data);
        } catch (error) {
            addNotification("Failed to load beneficiaries.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchBeneficiaries();
    }, [fetchBeneficiaries]);

    const handleAddEditBeneficiary = (beneficiary?: Beneficiary) => {
        setEditingBeneficiary(beneficiary || null);
        setIsAddEditModalOpen(true);
    };

    const handleSaveBeneficiary = async (payload: BeneficiaryPayload) => {
        try {
            if (editingBeneficiary) {
                await beneficiaryService.updateBeneficiary(editingBeneficiary.id, payload);
                addNotification("Beneficiary updated successfully!", "success");
            } else {
                await beneficiaryService.addBeneficiary(payload);
                addNotification("Beneficiary added successfully!", "success");
            }
            fetchBeneficiaries();
            setIsAddEditModalOpen(false);
        } catch (error) {
            addNotification(`Failed to save beneficiary: ${error instanceof Error ? error.message : String(error)}`, "error");
        }
    };

    const handleDeleteBeneficiary = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this beneficiary?")) return;
        try {
            await beneficiaryService.deleteBeneficiary(id);
            addNotification("Beneficiary deleted successfully!", "success");
            fetchBeneficiaries();
        } catch (error) {
            addNotification("Failed to delete beneficiary.", "error");
        }
    };

    const handlePerformComplianceCheck = async (beneficiaryId: string) => {
        addNotification("Initiating compliance check...", "info");
        try {
            const result = await beneficiaryService.performComplianceCheck(beneficiaryId);
            addNotification(`Compliance check completed. Status: ${result.kycStatus}. Risk: ${result.riskScore}.`, result.kycStatus === "APPROVED" ? "success" : "warning");
            fetchBeneficiaries();
        } catch (error) {
            addNotification("Failed to perform compliance check.", "error");
        }
    };

    const filteredBeneficiaries = beneficiaries.filter(b =>
        b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card title="Manage Beneficiaries">
            <div className="flex justify-between items-center mb-4">
                <InputField
                    id="searchBeneficiaries"
                    label="Search"
                    type="text"
                    placeholder="Search by name, country, or account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    containerClassName="flex-grow mr-4"
                />
                <Button onClick={() => handleAddEditBeneficiary()} variant="primary">Add New Beneficiary</Button>
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading beneficiaries...</div>
            ) : filteredBeneficiaries.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No beneficiaries found.</div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Full Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Country</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Method</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Account/ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">KYC Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Risk</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredBeneficiaries.map((ben) => (
                                <tr key={ben.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{ben.fullName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{ben.country} ({ben.currency})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{PAYMENT_METHODS.find(pm => pm.type === ben.paymentMethodType)?.name || ben.paymentMethodType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 truncate max-w-[150px]">
                                        {ben.paymentMethodType === "BANK_TRANSFER" ? ben.accountNumber : ben.walletId || ben.mobileNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            ben.kycStatus === "APPROVED" ? "bg-green-100 text-green-800" :
                                            ben.kycStatus === "REQUIRES_REVIEW" || ben.kycStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-red-100 text-red-800"
                                        } dark:${
                                            ben.kycStatus === "APPROVED" ? "bg-green-800 text-green-100" :
                                            ben.kycStatus === "REQUIRES_REVIEW" || ben.kycStatus === "PENDING" ? "bg-yellow-800 text-yellow-100" :
                                            "bg-red-800 text-red-100"
                                        }`}>{ben.kycStatus.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            ben.riskScore === "LOW" ? "bg-blue-100 text-blue-800" :
                                            ben.riskScore === "MEDIUM" ? "bg-orange-100 text-orange-800" :
                                            "bg-red-100 text-red-800"
                                        } dark:${
                                            ben.riskScore === "LOW" ? "bg-blue-800 text-blue-100" :
                                            ben.riskScore === "MEDIUM" ? "bg-orange-800 text-orange-100" :
                                            "bg-red-800 text-red-100"
                                        }`}>{ben.riskScore}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                                        <Button onClick={() => handleAddEditBeneficiary(ben)} variant="secondary" className="px-3 py-1 text-xs">Edit</Button>
                                        <Button onClick={() => handleDeleteBeneficiary(ben.id)} variant="danger" className="px-3 py-1 text-xs">Delete</Button>
                                        {ben.kycStatus !== "APPROVED" && (
                                            <Button onClick={() => handlePerformComplianceCheck(ben.id)} variant="outline" className="px-3 py-1 text-xs">Re-check Compliance</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddEditBeneficiaryModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveBeneficiary}
                beneficiary={editingBeneficiary}
            />
        </Card>
    );
};

interface AddEditBeneficiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: BeneficiaryPayload) => Promise<void>;
    beneficiary: Beneficiary | null;
}

export const AddEditBeneficiaryModal: React.FC<AddEditBeneficiaryModalProps> = ({ isOpen, onClose, onSave, beneficiary }) => {
    const isEditing = !!beneficiary;

    const validationRules = {
        fullName: (val: string) => !val ? "Full name is required." : undefined,
        country: (val: string) => !val || val === 'default' ? "Country is required." : undefined,
        currency: (val: CurrencyCode) => !val ? "Currency is required." : undefined,
        paymentMethodType: (val: PaymentMethodType) => !val || val === 'default' ? "Payment method is required." : undefined,
        bankName: (val: string, all: BeneficiaryPayload) => all.paymentMethodType === "BANK_TRANSFER" && !val ? "Bank name is required." : undefined,
        accountNumber: (val: string, all: BeneficiaryPayload) => all.paymentMethodType === "BANK_TRANSFER" && !val ? "Account number is required." : undefined,
        swiftCode: (val: string, all: BeneficiaryPayload) => all.paymentMethodType === "BANK_TRANSFER" && (!val || val.length < 8) ? "SWIFT/BIC is required (min 8 chars)." : undefined,
        iban: (val: string, all: BeneficiaryPayload) => all.paymentMethodType === "BANK_TRANSFER" && all.currency === "EUR" && (!val || val.length < 15) ? "IBAN is required for EUR bank transfers (min 15 chars)." : undefined,
        walletId: (val: string, all: BeneficiaryPayload) => all.paymentMethodType === "WALLET" && !val ? "Wallet ID/Email is required." : undefined,
        mobileNumber: (val: string, all: BeneficiaryPayload) => (all.paymentMethodType === "MOBILE_MONEY" || all.paymentMethodType === "CASH_PICKUP") && !val ? "Mobile number is required." : undefined,
        address: (val: string) => !val ? "Address is required." : undefined,
    };

    const initialFormState: BeneficiaryPayload = {
        fullName: '',
        bankName: '',
        accountNumber: '',
        swiftCode: '',
        iban: '',
        walletId: '',
        mobileNumber: '',
        address: '',
        country: 'default',
        currency: 'USD',
        paymentMethodType: 'default',
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validate,
        setValues,
        resetForm,
        setValue
    } = useFormValidation<BeneficiaryPayload>(initialFormState, validationRules);

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (beneficiary) {
            setValues({
                fullName: beneficiary.fullName,
                bankName: beneficiary.bankName || '',
                accountNumber: beneficiary.accountNumber || '',
                swiftCode: beneficiary.swiftCode || '',
                iban: beneficiary.iban || '',
                walletId: beneficiary.walletId || '',
                mobileNumber: beneficiary.mobileNumber || '',
                address: beneficiary.address,
                country: beneficiary.country,
                currency: beneficiary.currency,
                paymentMethodType: beneficiary.paymentMethodType,
            });
        } else {
            resetForm();
        }
    }, [beneficiary, isOpen, setValues, resetForm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsSaving(true);
            try {
                await onSave(values);
                onClose();
            } finally {
                setIsSaving(false);
            }
        }
    };

    const availablePaymentMethods = PAYMENT_METHODS.filter(pm =>
        pm.supportedCurrencies.includes(values.currency) &&
        COUNTRIES_DATA.some(countryData => countryData.name === values.country && pm.supportedCurrencies.includes(countryData.currency))
    );

    const selectedCountryData = COUNTRIES_DATA.find(c => c.name === values.country);
    useEffect(() => {
        if (selectedCountryData && values.currency !== selectedCountryData.currency) {
            setValue('currency', selectedCountryData.currency);
        }
    }, [values.country, selectedCountryData, setValue]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Beneficiary" : "Add New Beneficiary"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    id="fullName"
                    label="Full Name"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.fullName}
                    touched={touched.fullName}
                />
                <TextAreaField
                    id="address"
                    label="Address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.address}
                    touched={touched.address}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                        id="country"
                        label="Country"
                        value={values.country}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.country}
                        touched={touched.country}
                        options={[{ value: 'default', label: 'Select Country' }, ...COUNTRIES_DATA.map(c => ({ value: c.name, label: c.name }))]}
                    />
                    <SelectField
                        id="currency"
                        label="Receive Currency"
                        value={values.currency}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.currency}
                        touched={touched.currency}
                        options={ALL_CURRENCIES.map(c => ({ value: c, label: c }))}
                        disabled={!!selectedCountryData}
                        title={!!selectedCountryData ? `Currency is set by selected country (${selectedCountryData.currency})` : undefined}
                    />
                </div>
                <SelectField
                    id="paymentMethodType"
                    label="Payment Method"
                    value={values.paymentMethodType}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.paymentMethodType}
                    touched={touched.paymentMethodType}
                    options={[{ value: 'default', label: 'Select Payment Method' }, ...availablePaymentMethods.map(pm => ({ value: pm.type, label: pm.name }))]}
                    disabled={!values.currency || !values.country}
                />

                {values.paymentMethodType === "BANK_TRANSFER" && (
                    <>
                        <InputField
                            id="bankName"
                            label="Bank Name"
                            value={values.bankName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.bankName}
                            touched={touched.bankName}
                        />
                        <InputField
                            id="accountNumber"
                            label="Account Number"
                            value={values.accountNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.accountNumber}
                            touched={touched.accountNumber}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="swiftCode"
                                label="SWIFT/BIC Code"
                                value={values.swiftCode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.swiftCode}
                                touched={touched.swiftCode}
                                placeholder="E.g., FNBBRA00"
                            />
                            {values.currency === "EUR" && (
                                <InputField
                                    id="iban"
                                    label="IBAN"
                                    value={values.iban}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.iban}
                                    touched={touched.iban}
                                    placeholder="E.g., DE89370400440532013000"
                                />
                            )}
                        </div>
                    </>
                )}

                {(values.paymentMethodType === "WALLET" || values.paymentMethodType === "MOBILE_MONEY" || values.paymentMethodType === "CASH_PICKUP") && (
                    <>
                        {values.paymentMethodType === "WALLET" && (
                            <InputField
                                id="walletId"
                                label="Wallet ID / Email"
                                type="email"
                                value={values.walletId}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.walletId}
                                touched={touched.walletId}
                                placeholder="E.g., beneficiary@example.com"
                            />
                        )}
                        {(values.paymentMethodType === "MOBILE_MONEY" || values.paymentMethodType === "CASH_PICKUP") && (
                            <InputField
                                id="mobileNumber"
                                label="Mobile Number (with country code)"
                                type="tel"
                                value={values.mobileNumber}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.mobileNumber}
                                touched={touched.mobileNumber}
                                placeholder="E.g., +15551234567"
                            />
                        )}
                    </>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>
                        {isEditing ? "Save Changes" : "Add Beneficiary"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export const PaymentInitiationSection: React.FC = () => {
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [currentTransactionDetails, setCurrentTransactionDetails] = useState<Omit<Transaction, 'id' | 'senderId' | 'status' | 'createdAt' | 'updatedAt' | 'trackingNumber'> | null>(null);
    const { addNotification } = useNotification();

    const validationRules = {
        beneficiaryId: (val: string) => !val || val === 'default' ? "Beneficiary is required." : undefined,
        sendAmount: (val: number | string) => {
            const numVal = parseFloat(String(val));
            return isNaN(numVal) || numVal <= 0 ? "Amount must be a positive number." : undefined;
        },
        sendCurrency: (val: CurrencyCode) => !val ? "Send currency is required." : undefined,
        receiveCurrency: (val: CurrencyCode) => !val ? "Receive currency is required." : undefined,
        paymentMethodType: (val: PaymentMethodType) => !val || val === 'default' ? "Payment method is required." : undefined,
    };

    const initialFormState = {
        beneficiaryId: 'default',
        sendAmount: '',
        sendCurrency: 'USD' as CurrencyCode,
        receiveCurrency: 'default' as CurrencyCode,
        paymentMethodType: 'default' as PaymentMethodType,
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        validate,
        setValues,
        setValue,
        resetForm
    } = useFormValidation(initialFormState, validationRules);

    const [fxRate, setFxRate] = useState<FXRate | null>(null);
    const [calculatedFees, setCalculatedFees] = useState(0);
    const [estimatedReceiveAmount, setEstimatedReceiveAmount] = useState(0);
    const [isCalculatingFx, setIsCalculatingFx] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoadingBeneficiaries(true);
            try {
                const data = await beneficiaryService.getBeneficiaries();
                setBeneficiaries(data.filter(b => b.kycStatus === "APPROVED"));
            } catch (error) {
                addNotification("Failed to load beneficiaries for payment.", "error");
            } finally {
                setIsLoadingBeneficiaries(false);
            }
        };
        fetch();
    }, [addNotification]);

    useEffect(() => {
        const selectedBeneficiary = beneficiaries.find(b => b.id === values.beneficiaryId);
        if (selectedBeneficiary && values.receiveCurrency !== selectedBeneficiary.currency) {
            setValue('receiveCurrency', selectedBeneficiary.currency);
            setValue('paymentMethodType', selectedBeneficiary.paymentMethodType);
        } else if (!selectedBeneficiary && values.beneficiaryId !== 'default') {
            setValue('receiveCurrency', 'default' as CurrencyCode);
            setValue('paymentMethodType', 'default' as PaymentMethodType);
        }
    }, [values.beneficiaryId, beneficiaries, values.receiveCurrency, values.paymentMethodType, setValue]);

    useEffect(() => {
        const calculateFxAndFees = async () => {
            const sendAmountNum = parseFloat(String(values.sendAmount));
            if (!sendAmountNum || sendAmountNum <= 0 || !values.sendCurrency || !values.receiveCurrency || values.receiveCurrency === 'default') {
                setFxRate(null);
                setCalculatedFees(0);
                setEstimatedReceiveAmount(0);
                return;
            }

            setIsCalculatingFx(true);
            try {
                const rate = await fxService.getRate(values.sendCurrency, values.receiveCurrency);
                setFxRate(rate || null);

                const baseFee = Math.max(2, sendAmountNum * 0.005);
                const methodFee = values.paymentMethodType === "CARD" ? sendAmountNum * 0.015 : 0;
                const totalFees = parseFloat((baseFee + methodFee).toFixed(2));
                setCalculatedFees(totalFees);

                const estimatedReceive = rate ? sendAmountNum * rate.rate : 0;
                setEstimatedReceiveAmount(parseFloat(estimatedReceive.toFixed(2)));

            } catch (error) {
                addNotification("Failed to get FX rates or calculate fees.", "error");
                setFxRate(null);
                setCalculatedFees(0);
                setEstimatedReceiveAmount(0);
            } finally {
                setIsCalculatingFx(false);
            }
        };

        const handler = setTimeout(calculateFxAndFees, 500);
        return () => clearTimeout(handler);
    }, [values.sendAmount, values.sendCurrency, values.receiveCurrency, values.paymentMethodType, addNotification]);


    const handleInitiatePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            if (!fxRate || !estimatedReceiveAmount) {
                addNotification("Please wait for FX rates and fees to be calculated.", "warning");
                return;
            }
            const selectedBeneficiary = beneficiaries.find(b => b.id === values.beneficiaryId);
            if (!selectedBeneficiary) {
                addNotification("Selected beneficiary not found.", "error");
                return;
            }

            setCurrentTransactionDetails({
                beneficiaryId: selectedBeneficiary.id,
                sendAmount: parseFloat(String(values.sendAmount)),
                sendCurrency: values.sendCurrency,
                receiveAmount: estimatedReceiveAmount,
                receiveCurrency: values.receiveCurrency,
                fxRate: fxRate.rate,
                fees: calculatedFees,
                totalCharged: parseFloat(String(values.sendAmount)) + calculatedFees,
                paymentMethodType: values.paymentMethodType,
                complianceChecks: {
                    aml: true,
                    kyc: true,
                    sanctionsScreening: true,
                    riskScore: "LOW",
                }
            });
            setIsConfirmModalOpen(true);
        } else {
            addNotification("Please correct the errors in the form.", "error");
        }
    };

    const handleConfirmPayment = async () => {
        if (!currentTransactionDetails) return;

        setIsProcessingPayment(true);
        try {
            const newTransaction = await transactionService.createTransaction({
                beneficiaryId: currentTransactionDetails.beneficiaryId,
                sendAmount: currentTransactionDetails.sendAmount,
                sendCurrency: currentTransactionDetails.sendCurrency,
                receiveCurrency: currentTransactionDetails.receiveCurrency,
                paymentMethodType: currentTransactionDetails.paymentMethodType,
            });
            addNotification(`Payment initiated! Status: ${newTransaction.status}. Tracking: ${newTransaction.trackingNumber}`, "success");
            resetForm();
            setIsConfirmModalOpen(false);
        } catch (error) {
            addNotification(`Payment failed: ${error instanceof Error ? error.message : String(error)}`, "error");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const availableSendCurrencies = PAYMENT_METHODS.find(pm => pm.type === values.paymentMethodType)?.supportedCurrencies || ALL_CURRENCIES;

    return (
        <Card title="Initiate New Payment">
            <form onSubmit={handleInitiatePayment} className="space-y-6">
                {isLoadingBeneficiaries ? (
                    <div className="text-center text-gray-400">Loading beneficiaries...</div>
                ) : beneficiaries.length === 0 ? (
                    <div className="text-center text-gray-400">No approved beneficiaries found. <a href="#" onClick={() => addNotification("Please add and get your beneficiaries approved in the 'Manage Beneficiaries' section.", "info", 10000)} className="text-cyan-500 hover:underline">Add one?</a></div>
                ) : (
                    <>
                        <SelectField
                            id="beneficiaryId"
                            label="Recipient"
                            value={values.beneficiaryId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.beneficiaryId}
                            touched={touched.beneficiaryId}
                            options={[{ value: 'default', label: 'Select Recipient' }, ...beneficiaries.map(b => ({ value: b.id, label: `${b.fullName} (${b.country} - ${b.currency})` }))]}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="sendAmount"
                                label="You Send"
                                type="number"
                                value={values.sendAmount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.sendAmount}
                                touched={touched.sendAmount}
                                min="0.01"
                                step="0.01"
                                placeholder="Amount to send"
                            />
                            <SelectField
                                id="sendCurrency"
                                label="Send Currency"
                                value={values.sendCurrency}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.sendCurrency}
                                touched={touched.sendCurrency}
                                options={availableSendCurrencies.map(c => ({ value: c, label: c }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                id="paymentMethodType"
                                label="Payment Method"
                                value={values.paymentMethodType}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.paymentMethodType}
                                touched={touched.paymentMethodType}
                                options={[{ value: 'default', label: 'Select Payment Method' }, ...PAYMENT_METHODS.map(pm => ({ value: pm.type, label: pm.name }))]}
                                disabled={!values.beneficiaryId || values.beneficiaryId === 'default'}
                                title={!values.beneficiaryId || values.beneficiaryId === 'default' ? 'Please select a recipient first' : undefined}
                            />
                            <InputField
                                id="receiveCurrency"
                                label="Recipient Gets"
                                type="text"
                                value={values.receiveCurrency === 'default' ? '' : values.receiveCurrency}
                                readOnly
                                disabled
                                placeholder="Recipient currency"
                                title="Recipient currency is determined by the selected beneficiary"
                            />
                        </div>

                        <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                            <h4 className="text-lg font-semibold text-white">Summary</h4>
                            {isCalculatingFx ? (
                                <div className="text-gray-400">Calculating rates and fees...</div>
                            ) : (
                                <>
                                    <p className="flex justify-between text-gray-300 text-sm">
                                        <span>FX Rate:</span>
                                        <span>{fxRate ? `1 ${fxRate.from} = ${fxRate.rate} ${fxRate.to}` : 'N/A'}</span>
                                    </p>
                                    <p className="flex justify-between text-gray-300 text-sm">
                                        <span>Fees:</span>
                                        <span>{formatCurrency(calculatedFees, values.sendCurrency)}</span>
                                    </p>
                                    <p className="flex justify-between text-gray-300 text-sm font-bold border-t border-gray-600 pt-2">
                                        <span>Total to Pay:</span>
                                        <span>{formatCurrency(parseFloat(String(values.sendAmount)) + calculatedFees, values.sendCurrency)}</span>
                                    </p>
                                    <p className="flex justify-between text-gray-100 text-base font-bold">
                                        <span>Estimated Recipient Gets:</span>
                                        <span>{formatCurrency(estimatedReceiveAmount, values.receiveCurrency)}</span>
                                    </p>
                                </>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isCalculatingFx || isProcessingPayment}
                            disabled={isCalculatingFx || isProcessingPayment || !values.beneficiaryId || values.beneficiaryId === 'default' || !parseFloat(String(values.sendAmount)) || !fxRate}
                        >
                            {isProcessingPayment ? "Processing Payment..." : "Review & Send Payment"}
                        </Button>
                    </>
                )}
            </form>

            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Payment Details">
                {currentTransactionDetails && (
                    <div className="space-y-4 text-gray-300">
                        <p><strong>Recipient:</strong> {beneficiaries.find(b => b.id === currentTransactionDetails.beneficiaryId)?.fullName}</p>
                        <p><strong>You Send:</strong> {formatCurrency(currentTransactionDetails.sendAmount, currentTransactionDetails.sendCurrency)}</p>
                        <p><strong>Recipient Gets:</strong> {formatCurrency(currentTransactionDetails.receiveAmount, currentTransactionDetails.receiveCurrency)}</p>
                        <p><strong>FX Rate:</strong> 1 {currentTransactionDetails.sendCurrency} = {currentTransactionDetails.fxRate} {currentTransactionDetails.receiveCurrency}</p>
                        <p><strong>Fees:</strong> {formatCurrency(currentTransactionDetails.fees, currentTransactionDetails.sendCurrency)}</p>
                        <p className="text-lg font-bold text-white"><strong>Total Charged:</strong> {formatCurrency(currentTransactionDetails.totalCharged, currentTransactionDetails.sendCurrency)}</p>
                        <p><strong>Payment Method:</strong> {PAYMENT_METHODS.find(pm => pm.type === currentTransactionDetails.paymentMethodType)?.name}</p>
                        <p className="text-sm text-gray-400">
                            By confirming, you agree to the terms and conditions and authorize this payment. Once initiated, payments might not be reversible.
                            All transactions are subject to compliance checks.
                        </p>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsConfirmModalOpen(false)} disabled={isProcessingPayment}>Cancel</Button>
                            <Button type="button" variant="primary" onClick={handleConfirmPayment} isLoading={isProcessingPayment} disabled={isProcessingPayment}>
                                {isProcessingPayment ? "Sending..." : "Confirm & Send"}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export const TransactionHistorySection: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const { addNotification } = useNotification();

    const fetchTransactionsAndBeneficiaries = useCallback(async () => {
        setIsLoading(true);
        try {
            const [txData, benData] = await Promise.all([
                transactionService.getTransactions(),
                beneficiaryService.getBeneficiaries()
            ]);
            setTransactions(txData);
            setBeneficiaries(benData);
        } catch (error) {
            addNotification("Failed to load transaction history.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchTransactionsAndBeneficiaries();
    }, [fetchTransactionsAndBeneficiaries]);

    const getBeneficiaryName = (beneficiaryId: string) => {
        return beneficiaries.find(b => b.id === beneficiaryId)?.fullName || "Unknown Beneficiary";
    };

    const handleViewDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailsModalOpen(true);
    };

    const handleUpdateTransactionStatus = async (transactionId: string, newStatus: TransactionStatus) => {
        if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        addNotification(`Updating transaction ${transactionId} status to ${newStatus}...`, "info");
        try {
            await transactionService.updateTransactionStatus(transactionId, newStatus);
            addNotification("Transaction status updated!", "success");
            fetchTransactionsAndBeneficiaries();
        } catch (error) {
            addNotification("Failed to update transaction status.", "error");
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesStatus = filterStatus === 'ALL' || tx.status === filterStatus;
        const beneficiaryName = getBeneficiaryName(tx.beneficiaryId).toLowerCase();
        const matchesSearch = searchTerm === '' ||
                              tx.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              beneficiaryName.includes(searchTerm.toLowerCase()) ||
                              tx.sendCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              tx.receiveCurrency.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <Card title="Transaction History">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0 md:space-x-4">
                <InputField
                    id="searchTransactions"
                    label="Search"
                    type="text"
                    placeholder="Search by tracking, recipient, currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    containerClassName="flex-grow w-full md:w-auto"
                />
                <SelectField
                    id="filterStatus"
                    label="Status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'ALL')}
                    options={[{ value: 'ALL', label: 'All Statuses' }, ...Object.values(TransactionStatus).map(s => ({ value: s, label: s.replace(/_/g, ' ') }))]}
                    containerClassName="w-full md:w-auto"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-8 text-gray-400">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No transactions found matching criteria.</div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tracking #</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Recipient</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sent Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Received Amount</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">{tx.trackingNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{getBeneficiaryName(tx.beneficiaryId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(tx.sendAmount, tx.sendCurrency)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatCurrency(tx.receiveAmount, tx.receiveCurrency)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            tx.status === "COMPLETED" ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" :
                                            tx.status === "PENDING" || tx.status === "PROCESSING" || tx.status === "ON_HOLD" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100" :
                                            "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                        }`}>{tx.status.replace(/_/g, ' ')}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDateTime(tx.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                                        <Button onClick={() => handleViewDetails(tx)} variant="outline" className="px-3 py-1 text-xs">View Details</Button>
                                        {tx.status === "ON_HOLD" && (
                                            <Button onClick={() => handleUpdateTransactionStatus(tx.id, "PROCESSING")} variant="secondary" className="px-3 py-1 text-xs">Approve</Button>
                                        )}
                                        {tx.status === "PENDING" && (
                                            <Button onClick={() => handleUpdateTransactionStatus(tx.id, "CANCELLED")} variant="danger" className="px-3 py-1 text-xs">Cancel</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Transaction Details" className="max-w-2xl">
                {selectedTransaction ? (
                    <div className="space-y-4 text-gray-300">
                        <p><strong>Tracking Number:</strong> <span className="text-cyan-400">{selectedTransaction.trackingNumber}</span></p>
                        <p><strong>Recipient:</strong> {getBeneficiaryName(selectedTransaction.beneficiaryId)}</p>
                        <p><strong>Sent:</strong> {formatCurrency(selectedTransaction.sendAmount, selectedTransaction.sendCurrency)}</p>
                        <p><strong>Received:</strong> {formatCurrency(selectedTransaction.receiveAmount, selectedTransaction.receiveCurrency)}</p>
                        <p><strong>FX Rate:</strong> 1 {selectedTransaction.sendCurrency} = {selectedTransaction.fxRate} {selectedTransaction.receiveCurrency}</p>
                        <p><strong>Fees:</strong> {formatCurrency(selectedTransaction.fees, selectedTransaction.sendCurrency)}</p>
                        <p><strong>Total Charged:</strong> {formatCurrency(selectedTransaction.totalCharged, selectedTransaction.sendCurrency)}</p>
                        <p><strong>Payment Method:</strong> {PAYMENT_METHODS.find(pm => pm.type === selectedTransaction.paymentMethodType)?.name}</p>
                        <p><strong>Status:</strong> <span className={`font-semibold ${
                            selectedTransaction.status === "COMPLETED" ? "text-green-400" :
                            selectedTransaction.status === "PENDING" || selectedTransaction.status === "PROCESSING" || selectedTransaction.status === "ON_HOLD" ? "text-yellow-400" :
                            "text-red-400"
                        }`}>{selectedTransaction.status.replace(/_/g, ' ')}</span></p>
                        <p><strong>Initiated On:</strong> {formatDateTime(selectedTransaction.createdAt)}</p>
                        <p><strong>Last Updated:</strong> {formatDateTime(selectedTransaction.updatedAt)}</p>
                        <div className="border-t border-gray-700 pt-4 mt-4">
                            <h4 className="text-lg font-semibold text-white mb-2">Compliance Details</h4>
                            <p><strong>AML Check:</strong> <span className={selectedTransaction.complianceChecks.aml ? "text-green-400" : "text-red-400"}>{selectedTransaction.complianceChecks.aml ? 'Passed' : 'Failed'}</span></p>
                            <p><strong>KYC Check:</strong> <span className={selectedTransaction.complianceChecks.kyc ? "text-green-400" : "text-red-400"}>{selectedTransaction.complianceChecks.kyc ? 'Approved' : 'Pending/Rejected'}</span></p>
                            <p><strong>Sanctions Screening:</strong> <span className={selectedTransaction.complianceChecks.sanctionsScreening ? "text-green-400" : "text-red-400"}>{selectedTransaction.complianceChecks.sanctionsScreening ? 'Passed' : 'Failed'}</span></p>
                            <p><strong>Risk Score:</strong> <span className={`${
                                selectedTransaction.complianceChecks.riskScore === "LOW" ? "text-blue-400" :
                                selectedTransaction.complianceChecks.riskScore === "MEDIUM" ? "text-orange-400" :
                                "text-red-400"
                            } font-semibold`}>{selectedTransaction.complianceChecks.riskScore}</span></p>
                            {selectedTransaction.complianceChecks.notes && <p><strong>Notes:</strong> {selectedTransaction.complianceChecks.notes}</p>}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">No transaction selected.</p>
                )}
            </Modal>
        </Card>
    );
};

export const FXRatesDashboardSection: React.FC = () => {
    const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("USD");
    const [targetCurrencies, setTargetCurrencies] = useState<CurrencyCode[]>(["EUR", "GBP", "JPY", "CAD", "AUD", "BRL", "INR", "SGD", "MXN", "NGN"]);
    const [liveRates, setLiveRates] = useState<FXRate[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(true);
    const [selectedFromCurrency, setSelectedFromCurrency] = useState<CurrencyCode>("USD");
    const [selectedToCurrency, setSelectedToCurrency] = useState<CurrencyCode>("EUR");
    const [conversionAmount, setConversionAmount] = useState<number | string>(100);
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
    const [conversionRate, setConversionRate] = useState<FXRate | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const { addNotification } = useNotification();

    const fetchLiveRates = useCallback(async () => {
        setIsLoadingRates(true);
        try {
            const rates = await fxService.getPopularRates(baseCurrency, targetCurrencies);
            setLiveRates(rates);
        } catch (error) {
            addNotification("Failed to fetch live FX rates.", "error");
            setLiveRates([]);
        } finally {
            setIsLoadingRates(false);
        }
    }, [baseCurrency, targetCurrencies, addNotification]);

    useEffect(() => {
        fetchLiveRates();
        const interval = setInterval(fetchLiveRates, 60000);
        return () => clearInterval(interval);
    }, [fetchLiveRates]);

    useEffect(() => {
        const convert = async () => {
            const amount = parseFloat(String(conversionAmount));
            if (isNaN(amount) || amount <= 0 || !selectedFromCurrency || !selectedToCurrency) {
                setConvertedAmount(null);
                setConversionRate(null);
                return;
            }
            setIsConverting(true);
            try {
                const rate = await fxService.getRate(selectedFromCurrency, selectedToCurrency);
                if (rate) {
                    setConversionRate(rate);
                    setConvertedAmount(parseFloat((amount * rate.rate).toFixed(2)));
                } else {
                    setConvertedAmount(null);
                    setConversionRate(null);
                    addNotification("Could not get conversion rate.", "warning");
                }
            } catch (error) {
                addNotification("Error during currency conversion.", "error");
                setConvertedAmount(null);
                setConversionRate(null);
            } finally {
                setIsConverting(false);
            }
        };
        const handler = setTimeout(convert, 300);
        return () => clearTimeout(handler);
    }, [conversionAmount, selectedFromCurrency, selectedToCurrency, addNotification]);

    const handleAddTargetCurrency = (currency: CurrencyCode) => {
        if (!targetCurrencies.includes(currency) && currency !== baseCurrency) {
            setTargetCurrencies(prev => [...prev, currency]);
        }
    };

    const handleRemoveTargetCurrency = (currency: CurrencyCode) => {
        setTargetCurrencies(prev => prev.filter(c => c !== currency));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Live Exchange Rates">
                <div className="mb-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <SelectField
                        id="baseCurrency"
                        label="Base Currency"
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value as CurrencyCode)}
                        options={ALL_CURRENCIES.map(c => ({ value: c, label: c }))}
                        containerClassName="w-full sm:w-auto flex-grow"
                        className="p-1"
                    />
                    <div className="flex-grow w-full sm:w-auto">
                        <label htmlFor="addTargetCurrency" className="block text-gray-300 text-sm font-medium mb-1">Add Target Currency</label>
                        <select
                            id="addTargetCurrency"
                            className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-700 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            value=""
                            onChange={(e) => handleAddTargetCurrency(e.target.value as CurrencyCode)}
                        >
                            <option value="">Add more...</option>
                            {ALL_CURRENCIES.filter(c => c !== baseCurrency && !targetCurrencies.includes(c)).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {isLoadingRates ? (
                    <div className="text-center py-8 text-gray-400">Loading live rates...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {liveRates.map(rate => (
                            <div key={`${rate.from}-${rate.to}`} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center border border-gray-600">
                                <div>
                                    <p className="text-white font-semibold">{rate.from}/{rate.to}</p>
                                    <p className="text-sm text-gray-400">1 {rate.from} = {rate.rate} {rate.to}</p>
                                    <p className="text-xs text-gray-500">Bid: {rate.bid} / Ask: {rate.ask}</p>
                                </div>
                                <button onClick={() => handleRemoveTargetCurrency(rate.to)} className="text-gray-400 hover:text-red-400">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {liveRates.length === 0 && !isLoadingRates && <div className="text-center py-8 text-gray-400">No live rates available for selected currencies.</div>}
            </Card>

            <Card title="Currency Converter">
                <div className="space-y-4">
                    <InputField
                        id="conversionAmount"
                        label="Amount"
                        type="number"
                        value={conversionAmount}
                        onChange={(e) => setConversionAmount(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField
                            id="selectedFromCurrency"
                            label="From"
                            value={selectedFromCurrency}
                            onChange={(e) => setSelectedFromCurrency(e.target.value as CurrencyCode)}
                            options={ALL_CURRENCIES.map(c => ({ value: c, label: c }))}
                        />
                        <SelectField
                            id="selectedToCurrency"
                            label="To"
                            value={selectedToCurrency}
                            onChange={(e) => setSelectedToCurrency(e.target.value as CurrencyCode)}
                            options={ALL_CURRENCIES.map(c => ({ value: c, label: c }))}
                        />
                    </div>
                    <div className="bg-gray-700/50 p-4 rounded-lg space-y-2">
                        <h4 className="text-lg font-semibold text-white">Conversion Result</h4>
                        {isConverting ? (
                            <div className="text-gray-400">Converting...</div>
                        ) : convertedAmount !== null && conversionRate ? (
                            <>
                                <p className="flex justify-between text-gray-300 text-sm">
                                    <span>Rate:</span>
                                    <span>1 {conversionRate.from} = {conversionRate.rate} {conversionRate.to}</span>
                                </p>
                                <p className="flex justify-between text-gray-100 text-base font-bold">
                                    <span>Result:</span>
                                    <span>{formatCurrency(convertedAmount, selectedToCurrency)}</span>
                                </p>
                                <p className="text-xs text-gray-500">Last updated: {formatDateTime(conversionRate.timestamp)}</p>
                            </>
                        ) : (
                            <p className="text-gray-400">Enter amounts and select currencies to convert.</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export const ComplianceManagementSection: React.FC = () => {
    const [isAmlKycModalOpen, setIsAmlKycModalOpen] = useState(false);
    const [selectedCountryForAI, setSelectedCountryForAI] = useState("Brazil");
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingAISummary, setIsLoadingAISummary] = useState(false);

    const [complianceReports, setComplianceReports] = useState<{ id: string, country: string, type: string, date: string, status: string, summary: string }[]>([]);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        setComplianceReports([
            { id: 'rep-001', country: 'Brazil', type: 'AML/KYC Framework', date: '2023-10-15', status: 'Reviewed', summary: 'Brazilian financial regulations require robust AML/KYC for all cross-border transactions. Key focus on PEP screening and source of funds verification.' },
            { id: 'rep-002', country: 'Nigeria', type: 'Sanctions Screening', date: '2023-11-01', status: 'Pending Review', summary: 'Nigeria faces ongoing sanctions risks; enhanced screening for certain sectors is crucial. OFAC and UN sanctions lists must be regularly checked.' },
            { id: 'rep-003', country: 'Singapore', type: 'Data Privacy for Payments', date: '2023-12-10', status: 'Approved', summary: 'Singapore\'s PDPA mandates strict data privacy for customer payment information. Consent and secure storage are paramount.' },
        ]);
    }, []);

    const handleGenerateAISummary = async () => {
        setIsLoadingAISummary(true);
        setAiSummary('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
            const prompt = `Provide a detailed, high-level summary of the key AML (Anti-Money Laundering) and KYC (Know Your Customer) compliance considerations, including any specific regulatory bodies or common practices, for sending payments to "${selectedCountryForAI}". Focus on aspects relevant to financial institutions and cross-border transactions. Also mention potential sanctions risks or significant recent regulatory changes if applicable. Format as clear, concise paragraphs.`;
            const result = await ai.models.gemini.generateContent(prompt);
            const text = result.response.text();
            setAiSummary(text);
            addNotification(`AI compliance summary generated for ${selectedCountryForAI}.`, "success");
        } catch (err) {
            console.error("Error generating AI compliance summary:", err);
            setAiSummary("Error generating compliance summary. Please try again or check API key.");
            addNotification("Error generating AI compliance summary.", "error");
        } finally {
            setIsLoadingAISummary(false);
        }
    };

    const handleDownloadReport = (reportId: string) => {
        const report = complianceReports.find(r => r.id === reportId);
        if (report) {
            const content = `Compliance Report: ${report.type} for ${report.country}\nDate: ${report.date}\nStatus: ${report.status}\n\nSummary:\n${report.summary}`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance_report_${report.country}_${report.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification(`Downloading report: ${report.id}`, "info");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="AI Powered Compliance Assistant">
                <div className="space-y-4">
                    <p className="text-gray-400 text-sm">
                        Leverage AI to get instant insights into AML/KYC regulations for specific countries. This helps you understand local compliance landscapes quickly.
                    </p>
                    <InputField
                        id="countryForAI"
                        label="Target Country for AI Analysis"
                        value={selectedCountryForAI}
                        onChange={e => setSelectedCountryForAI(e.target.value)}
                        placeholder="E.g., Brazil, India, Nigeria"
                    />
                    <Button onClick={handleGenerateAISummary} isLoading={isLoadingAISummary} className="w-full">
                        {isLoadingAISummary ? 'Generating Summary...' : 'Generate AI Compliance Summary'}
                    </Button>
                    <div className="mt-4 p-4 bg-gray-700/50 rounded-lg min-h-[150px]">
                        <h4 className="text-lg font-semibold text-white mb-2">Summary for {selectedCountryForAI}</h4>
                        <div className="text-sm text-gray-300 whitespace-pre-line">
                            {isLoadingAISummary ? 'Thinking deeply about regulations...' : aiSummary || 'No summary generated yet.'}
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Compliance Reports & Documents">
                <p className="text-gray-400 text-sm mb-4">
                    Access and manage internal compliance reports, regulatory updates, and due diligence documents.
                </p>
                {isReportLoading ? (
                    <div className="text-center py-8 text-gray-400">Loading reports...</div>
                ) : complianceReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No compliance reports available.</div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Report ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Country/Scope</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {complianceReports.map(report => (
                                    <tr key={report.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-400">{report.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{report.country}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{report.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                report.status === "Approved" ? "bg-green-100 text-green-800" :
                                                report.status === "Reviewed" ? "bg-blue-100 text-blue-800" :
                                                "bg-yellow-100 text-yellow-800"
                                            } dark:${
                                                report.status === "Approved" ? "bg-green-800 text-green-100" :
                                                report.status === "Reviewed" ? "bg-blue-800 text-blue-100" :
                                                "bg-yellow-800 text-yellow-100"
                                            }`}>{report.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button onClick={() => handleDownloadReport(report.id)} variant="outline" className="px-3 py-1 text-xs">Download</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export const SettingsAndPreferencesSection: React.FC = () => {
    const [defaultSendCurrency, setDefaultSendCurrency] = useState<CurrencyCode>("USD");
    const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethodType | "">("");
    const [receiveRateAlerts, setReceiveRateAlerts] = useState(true);
    const [receiveTransactionNotifications, setReceiveTransactionNotifications] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotification();

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setDefaultSendCurrency(localStorage.getItem('defaultSendCurrency') as CurrencyCode || "USD");
            setPreferredPaymentMethod(localStorage.getItem('preferredPaymentMethod') as PaymentMethodType || "");
            setReceiveRateAlerts(localStorage.getItem('receiveRateAlerts') === 'true');
            setReceiveTransactionNotifications(localStorage.getItem('receiveTransactionNotifications') === 'true');
            setIsLoading(false);
        }, 500);
    }, []);

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            localStorage.setItem('defaultSendCurrency', defaultSendCurrency);
            localStorage.setItem('preferredPaymentMethod', preferredPaymentMethod);
            localStorage.setItem('receiveRateAlerts', String(receiveRateAlerts));
            localStorage.setItem('receiveTransactionNotifications', String(receiveTransactionNotifications));
            addNotification("Settings saved successfully!", "success");
        } catch (error) {
            addNotification("Failed to save settings.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="User Settings and Preferences">
            <div className="space-y-6">
                <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">Payment Defaults</h3>
                    <SelectField
                        id="defaultSendCurrency"
                        label="Default Send Currency"
                        value={defaultSendCurrency}
                        onChange={(e) => setDefaultSendCurrency(e.target.value as CurrencyCode)}
                        options={ALL_CURRENCIES.map(c => ({ value: c, label: c }))}
                        disabled={isLoading}
                    />
                    <SelectField
                        id="preferredPaymentMethod"
                        label="Preferred Payment Method"
                        value={preferredPaymentMethod}
                        onChange={(e) => setPreferredPaymentMethod(e.target.value as PaymentMethodType)}
                        options={[{ value: '', label: 'None' }, ...PAYMENT_METHODS.map(pm => ({ value: pm.type, label: pm.name }))]}
                        disabled={isLoading}
                    />
                </div>

                <div className="space-y-4 p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">Notification Settings</h3>
                    <div className="flex items-center justify-between">
                        <label htmlFor="receiveRateAlerts" className="text-gray-300 cursor-pointer">Receive FX Rate Alerts</label>
                        <input
                            type="checkbox"
                            id="receiveRateAlerts"
                            checked={receiveRateAlerts}
                            onChange={(e) => setReceiveRateAlerts(e.target.checked)}
                            className="h-5 w-5 text-cyan-600 rounded border-gray-600 focus:ring-cyan-500 bg-gray-800"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="receiveTransactionNotifications" className="text-gray-300 cursor-pointer">Receive Transaction Status Notifications</label>
                        <input
                            type="checkbox"
                            id="receiveTransactionNotifications"
                            checked={receiveTransactionNotifications}
                            onChange={(e) => setReceiveTransactionNotifications(e.target.checked)}
                            className="h-5 w-5 text-cyan-600 rounded border-gray-600 focus:ring-cyan-500 bg-gray-800"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <Button onClick={handleSaveSettings} isLoading={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save Settings"}
                </Button>
            </div>
        </Card>
    );
};


const CrossBorderPaymentsView: React.FC = () => {
    const [isComplianceModalOpen, setComplianceModalOpen] = useState(false);
    const [country, setCountry] = useState("Brazil");
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setSummary('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string });
            const prompt = `Provide a brief, high-level summary of the key AML and KYC compliance considerations for sending payments to "${country}".`;
            const response = await ai.models.gemini.generateContent(prompt);
            setSummary(response.response.text());
        } catch (err) {
            console.error("Error generating compliance summary in legacy modal:", err);
            setSummary("Error generating compliance summary.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NotificationProvider>
            <>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-white tracking-wider">Cross-Border Payments Dashboard</h2>
                        <div className="flex space-x-2">
                             <Button onClick={() => setComplianceModalOpen(true)} variant="outline">Legacy AI Compliance Summary</Button>
                            <Button onClick={() => console.log('View comprehensive analytics...')} variant="secondary">View Analytics</Button>
                        </div>
                    </div>

                    <PaymentInitiationSection />
                    <BeneficiaryManagementSection />
                    <TransactionHistorySection />
                    <FXRatesDashboardSection />
                    <ComplianceManagementSection />
                    <SettingsAndPreferencesSection />

                    {isComplianceModalOpen && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setComplianceModalOpen(false)}>
                            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Compliance Summary Generator (Legacy)</h3></div>
                                <div className="p-6 space-y-4">
                                    <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                    <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Summary'}</button>
                                    <Card title={`Compliance Summary for ${country}`}><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : summary}</div></Card>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
        </NotificationProvider>
    );
};

export default CrossBorderPaymentsView;