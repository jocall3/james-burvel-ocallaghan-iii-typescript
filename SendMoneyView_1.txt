// components/views/personal/SendMoneyView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Remitrax," a complete, multi-rail payment portal featuring advanced
// security simulations and demonstrating enterprise-level integration patterns.

import React, { useState, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { View } from '../../../types';
import type { Transaction } from '../../../types';

// ================================================================================================
// EXPANDED TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION
// ================================================================================================

/** @enum {string} Defines the available payment rails. */
export enum PaymentRail {
  QuantumPay = 'quantumpay',
  CashApp = 'cashapp',
  Fedwire = 'fedwire',
  Swift = 'swift',
  Crypto = 'crypto',
}

/** @enum {string} Represents the current stage of the multi-step sending process. */
export enum SendFlowStage {
  AmountEntry = 'AMOUNT_ENTRY',
  RecipientSelect = 'RECIPIENT_SELECT',
  MethodAndDetails = 'METHOD_AND_DETAILS',
  ReviewAndConfirm = 'REVIEW_AND_CONFIRM',
  Authentication = 'AUTHENTICATION',
  Processing = 'PROCESSING',
  Complete = 'COMPLETE',
}

/** @enum {string} Defines possible statuses for recipient validation. */
export enum RecipientStatus {
  Unverified = 'UNVERIFIED',
  Verifying = 'VERIFYING',
  Verified = 'VERIFIED',
  Invalid = 'INVALID',
}

/** @enum {string} Represents the type of recurring payment frequency. */
export enum RecurrenceFrequency {
  None = 'none',
  Daily = 'daily',
  Weekly = 'weekly',
  BiWeekly = 'biweekly',
  Monthly = 'monthly',
}

/** @interface Defines the structure for a saved contact/recipient. */
export interface RecipientContact {
  id: string;
  name: string;
  avatarUrl?: string;
  paymentMethods: {
    [key in PaymentRail]?: string;
  };
}

/** @interface Holds details for a Fedwire (domestic) transfer. */
export interface FedwireDetails {
  routingNumber: string;
  accountNumber: string;
  recipientBank: string;
  memo: string;
}

/** @interface Holds details for a SWIFT (international) transfer. */
export interface SwiftDetails {
  swiftBic: string;
  iban: string;
  recipientBank: string;
  recipientAddress: string;
  intermediaryBank?: string;
  purposeOfPayment: string;
}

/** @interface Holds details for a cryptocurrency transfer. */
export interface CryptoDetails {
  walletAddress: string;
  network: 'Ethereum' | 'Polygon' | 'Solana';
  gasFeeEstimate: number; // in Gwei for ETH, etc.
}

/** @interface A comprehensive object holding the entire state of the payment form. */
export interface PaymentFormState {
  amount: string;
  sourceCurrency: 'USD';
  targetCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';
  selectedRecipientId?: string;
  customRecipientInput: string;
  recipientStatus: RecipientStatus;
  selectedRail: PaymentRail;
  remittanceInfo: string; // For QuantumPay/ISO20022
  isRecurring: boolean;
  recurrenceOptions: {
    frequency: RecurrenceFrequency;
    startDate: string;
    endDate?: string;
  };
  fedwireDetails: Partial<FedwireDetails>;
  swiftDetails: Partial<SwiftDetails>;
  cryptoDetails: Partial<CryptoDetails>;
}

/** @interface Represents a foreign exchange quote. */
export interface FxQuote {
  rate: number;
  expiresAt: number; // timestamp
}

/** @interface Represents the calculated fee structure for a transaction. */
export interface FeeBreakdown {
  processingFee: number;
  networkFee: number; // e.g., Gas fee for crypto, SWIFT fee
  fxSpread: number;
  totalFee: number;
}

/** @enum {string} The type of authentication being performed. */
export enum AuthMethod {
  Biometric = 'BIOMETRIC',
  Mfa = 'MFA',
}

type PaymentMethod = 'quantumpay' | 'cashapp'; // Maintained for compatibility
type ScanState = 'scanning' | 'success' | 'verifying' | 'error';

interface SendMoneyViewProps {
  setActiveView: (view: View) => void;
}


// ================================================================================================
// MOCK DATA & API SIMULATION LAYER
// Simulates backend services for a realistic development experience.
// ================================================================================================

/**
 * @description A collection of mock contacts for demonstration purposes.
 */
export const MOCK_CONTACTS: RecipientContact[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    paymentMethods: {
      [PaymentRail.QuantumPay]: '@alice_j',
      [PaymentRail.CashApp]: '$AliceJ',
      [PaymentRail.Crypto]: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Ethereum
    },
  },
  {
    id: 'c2',
    name: 'Bob Williams',
    avatarUrl: 'https://i.pravatar.cc/150?u=bob',
    paymentMethods: {
      [PaymentRail.QuantumPay]: '@bobbyw',
      [PaymentRail.Fedwire]: '021000021:123456789', // Routing:Account
    },
  },
  {
    id: 'c3',
    name: 'Charlie Brown',
    avatarUrl: 'https://i.pravatar.cc/150?u=charlie',
    paymentMethods: {
      [PaymentRail.CashApp]: '$CB_designs',
      [PaymentRail.Crypto]: 'So11111111111111111111111111111111111111112', // Solana
    },
  },
  {
    id: 'c4',
    name: 'Diana Prince',
    avatarUrl: 'https://i.pravatar.cc/150?u=diana',
    paymentMethods: {
      [PaymentRail.Swift]: 'DE89370400440532013000', // IBAN
    },
  },
];

/**
 * @class ApiServiceSimulator
 * @description A mock API service class that simulates network requests for various payment operations.
 * This demonstrates how a real application would interact with its backend.
 */
export class ApiServiceSimulator {
  private static latency = (ms: number) => new Promise(res => setTimeout(res, ms));

  /** Simulates validating a recipient's tag or address. */
  static async validateRecipient(identifier: string, rail: PaymentRail): Promise<{ isValid: boolean; name?: string }> {
    await this.latency(750);
    if (!identifier) return { isValid: false };
    switch (rail) {
      case PaymentRail.QuantumPay:
        return identifier.startsWith('@') ? { isValid: true, name: 'Quantum User' } : { isValid: false };
      case PaymentRail.CashApp:
        return identifier.startsWith('$') ? { isValid: true, name: 'Cash App User' } : { isValid: false };
      case PaymentRail.Crypto:
        return identifier.startsWith('0x') || identifier.length > 30 ? { isValid: true, name: 'Crypto Wallet' } : { isValid: false };
      default:
        return { isValid: true, name: 'Verified Account' }; // Assume others valid for demo
    }
  }

  /** Simulates fetching a real-time foreign exchange quote. */
  static async getFxQuote(from: string, to: string): Promise<FxQuote> {
    await this.latency(400);
    const baseRates: { [key: string]: number } = { EUR: 0.92, GBP: 0.79, JPY: 157.5, CAD: 1.37 };
    if (from === 'USD' && baseRates[to]) {
      // Add a tiny random fluctuation to simulate a live market
      const rate = baseRates[to] * (1 + (Math.random() - 0.5) * 0.005);
      return { rate, expiresAt: Date.now() + 30000 }; // Quote valid for 30 seconds
    }
    throw new Error('Invalid currency pair');
  }

  /** Simulates fetching the fee structure for a given transaction. */
  static async getFeeBreakdown(amount: number, rail: PaymentRail): Promise<FeeBreakdown> {
    await this.latency(500);
    let processingFee = 0;
    let networkFee = 0;
    switch (rail) {
      case PaymentRail.QuantumPay:
        processingFee = 0; // Free on-net transfers
        break;
      case PaymentRail.CashApp:
        processingFee = Math.max(0.25, amount * 0.015); // 1.5% fee
        break;
      case PaymentRail.Fedwire:
        processingFee = 25.00; // Flat fee
        break;
      case PaymentRail.Swift:
        processingFee = 45.00; // Higher flat fee for international
        networkFee = 15.00; // Correspondent bank charges
        break;

      case PaymentRail.Crypto:
        processingFee = amount * 0.005; // 0.5% service fee
        networkFee = 5.50; // Simulated flat gas fee in USD
        break;
    }
    const totalFee = processingFee + networkFee;
    return { processingFee, networkFee, fxSpread: 0, totalFee };
  }

  /** Simulates submitting the final, authorized transaction to the backend. */
  static async submitTransaction(payload: any): Promise<{ success: boolean; transactionId: string; confirmationCode: string }> {
    await this.latency(2000);
    console.log("%c--- SIMULATING SECURE BACKEND TRANSACTION SUBMISSION ---", "color: lime; font-weight: bold;");
    console.log("Payload:", payload);
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Generated Transaction ID:", transactionId);
    console.log("-----------------------------------------");
    // Simulate a random failure (10% chance)
    if (Math.random() < 0.1) {
        throw new Error("Transaction failed due to an intermittent network issue.");
    }
    return { success: true, transactionId, confirmationCode: `CONF-${Math.random().toString(36).substr(2, 12).toUpperCase()}` };
  }
}

// ================================================================================================
// ANIMATED UI SUB-COMPONENTS
// These provide a high-fidelity user experience during the security process.
// ================================================================================================

/**
 * @description Renders an animated checkmark icon for success feedback.
 * The animation is pure CSS, making it lightweight and performant.
 */
export const AnimatedCheckmarkIcon: React.FC = () => (
    <>
        <svg className="h-24 w-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <style>{`
            .checkmark__circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 3;
                stroke-miterlimit: 10;
                stroke: #4ade80;
                fill: none;
                animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .checkmark__check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                stroke-width: 4;
                stroke: #fff;
                animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke {
                100% { stroke-dashoffset: 0; }
            }
        `}</style>
    </>
);

/**
 * @description Renders a futuristic "quantum ledger" animation to simulate
 * secure transaction processing. This enhances perceived security and trust.
 */
export const QuantumLedgerAnimation: React.FC = () => (
    <>
        <div className="quantum-grid">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="quantum-block"></div>)}
        </div>
        <style>{`
            .quantum-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                width: 100px;
                height: 100px;
            }
            .quantum-block {
                background-color: rgba(6, 182, 212, 0.3);
                border: 1px solid #06b6d4;
                border-radius: 4px;
                animation: quantum-flash 2s infinite ease-in-out;
            }
            .quantum-block:nth-child(1) { animation-delay: 0.1s; }
            .quantum-block:nth-child(2) { animation-delay: 0.5s; }
            .quantum-block:nth-child(3) { animation-delay: 0.2s; }
            .quantum-block:nth-child(4) { animation-delay: 0.6s; }
            .quantum-block:nth-child(5) { animation-delay: 0.3s; }
            .quantum-block:nth-child(6) { animation-delay: 0.7s; }
            .quantum-block:nth-child(7) { animation-delay: 0.4s; }
            .quantum-block:nth-child(8) { animation-delay: 0.8s; }
            .quantum-block:nth-child(9) { animation-delay: 0.1s; }
            @keyframes quantum-flash {
                0%, 100% { background-color: rgba(6, 182, 212, 0.3); transform: scale(1); }
                50% { background-color: rgba(165, 243, 252, 0.8); transform: scale(1.05); }
            }
        `}</style>
    </>
);


// ================================================================================================
// HIGH-FIDELITY BIOMETRIC MODAL (Expanded)
// ================================================================================================

export const BiometricModal: React.FC<{
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
    amount: string;
    recipient: string;
    paymentMethod: string; // Made generic to support more rails
    rail: PaymentRail;
}> = ({ isOpen, onSuccess, onClose, amount, recipient, paymentMethod, rail }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [verificationStep, setVerificationStep] = useState(0);

    const getVerificationMessages = useCallback(() => {
        const baseMessages = [
            `Heuristic API: Validating recipient identity...`,
            'Heuristic API: Checking sufficient funds & compliance lists...',
            'Heuristic API: Executing transaction on secure ledger...',
            'Heuristic API: Confirming transfer...',
        ];
        switch(rail) {
            case PaymentRail.Fedwire:
                baseMessages[2] = 'Submitting payment instructions to Federal Reserve...';
                baseMessages[3] = 'Awaiting Fedwire confirmation...';
                break;
            case PaymentRail.Swift:
                baseMessages[2] = 'Transmitting SWIFT MT103 message...';
                baseMessages[3] = 'Awaiting acknowledgement from correspondent bank...';
                break;
            case PaymentRail.Crypto:
                baseMessages[2] = `Broadcasting transaction to ${'Ethereum'} network...`;
                baseMessages[3] = 'Awaiting on-chain confirmation...';
                break;
            default:
                break;
        }
        return baseMessages;
    }, [rail]);
    
    const verificationMessages = useMemo(() => getVerificationMessages(), [getVerificationMessages]);


    // Effect to manage camera stream and the multi-step verification flow.
    useEffect(() => {
        if (!isOpen) {
            setScanState('scanning');
            setVerificationStep(0);
            return;
        };

        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setScanState('error');
            }
        };
        startCamera();

        // Timers to simulate the multi-stage verification process.
        const successTimer = setTimeout(() => setScanState('success'), 3000);
        const verifyTimer = setTimeout(() => setScanState('verifying'), 4000);
        const successActionTimer = setTimeout(onSuccess, 8500);
        const closeTimer = setTimeout(onClose, 9500);

        return () => {
            clearTimeout(successTimer);
            clearTimeout(verifyTimer);
            clearTimeout(successActionTimer);
            clearTimeout(closeTimer);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen, onSuccess, onClose]);
    
    // Effect to cycle through the verification messages.
    useEffect(() => {
        if (scanState === 'verifying') {
            const interval = setInterval(() => {
                setVerificationStep(prev => Math.min(prev + 1, verificationMessages.length - 1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [scanState, verificationMessages.length]);

    const getTitle = () => {
        switch (scanState) {
            case 'scanning': return 'Scanning Face';
            case 'success': return 'Identity Confirmed';
            case 'verifying': return 'Quantum Ledger Verification';
            case 'error': return 'Verification Failed';
        }
    }
    
    return (
        <div className={`fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-800 rounded-t-2xl sm:rounded-2xl p-8 max-w-sm w-full text-center border-t sm:border border-gray-700 transition-transform duration-300 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-gray-600 mb-6">
                    <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video>
                    {scanState === 'scanning' && <div className="absolute inset-0 bg-grid-pattern animate-scan"></div>}
                    {scanState === 'success' && <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center"><AnimatedCheckmarkIcon /></div>}
                    {scanState === 'verifying' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><QuantumLedgerAnimation /></div>}
                    {scanState === 'error' && <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center p-4"><p>Camera not found. Cannot complete biometric verification.</p></div>}
                </div>
                <h3 className="text-2xl font-bold text-white">{getTitle()}</h3>
                <p className="text-gray-400 mt-2">{scanState === 'verifying' ? verificationMessages[verificationStep] : `Sending $${amount} to ${recipient} via ${paymentMethod}`}</p>
                {scanState === 'scanning' && <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300">Cancel</button>}
            </div>
             <style>{`.bg-grid-pattern{background-image:linear-gradient(rgba(0,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.2) 1px,transparent 1px);background-size:2rem 2rem}@keyframes scan-effect{0%{background-position:0 0}100%{background-position:0 -4rem}}.animate-scan{animation:scan-effect 1.5s linear infinite}`}</style>
        </div>
    );
};

// ================================================================================================
// COMPOSABLE UI SUB-COMPONENTS FOR THE PAYMENT FLOW
// ================================================================================================

/**
 * @description Renders a selector for the different payment rails.
 */
export const PaymentRailSelector: React.FC<{
    selected: PaymentRail;
    onSelect: (rail: PaymentRail) => void;
}> = ({ selected, onSelect }) => {
    const rails = [
        { id: PaymentRail.QuantumPay, name: 'QuantumPay', style: 'bg-cyan-600' },
        { id: PaymentRail.CashApp, name: 'Cash App', style: 'bg-green-600' },
        { id: PaymentRail.Fedwire, name: 'Wire', style: 'bg-blue-600' },
        { id: PaymentRail.Swift, name: 'International', style: 'bg-indigo-600' },
        { id: PaymentRail.Crypto, name: 'Crypto', style: 'bg-purple-600' },
    ];

    return (
        <div className="p-1 bg-gray-900/50 rounded-lg flex flex-wrap gap-1 mb-6">
            {rails.map(rail => (
                <button 
                    key={rail.id}
                    onClick={() => onSelect(rail.id)}
                    className={`flex-grow py-2.5 px-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${selected === rail.id ? `${rail.style} text-white shadow-lg` : 'text-gray-300 hover:bg-gray-700/50'}`}
                >
                    {rail.name}
                </button>
            ))}
        </div>
    );
};

/**
 * @description A dynamic input field for recipient details, including contact search and validation.
 */
export const RecipientInput: React.FC<{
    value: string;
    onChange: (value: string) => void;
    onSelectContact: (contact: RecipientContact) => void;
    status: RecipientStatus;
    rail: PaymentRail;
}> = ({ value, onChange, onSelectContact, status, rail }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredContacts, setFilteredContacts] = useState<RecipientContact[]>([]);
    
    useEffect(() => {
        if (searchTerm.length > 1) {
            setFilteredContacts(
                MOCK_CONTACTS.filter(c => 
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    Object.values(c.paymentMethods).some(pm => pm?.toLowerCase().includes(searchTerm.toLowerCase()))
                )
            );
        } else {
            setFilteredContacts([]);
        }
    }, [searchTerm]);

    const handleSelect = (contact: RecipientContact) => {
        onSelectContact(contact);
        setSearchTerm('');
        setFilteredContacts([]);
    };

    const getPlaceholder = () => {
        switch (rail) {
            case PaymentRail.QuantumPay: return '@the_future';
            case PaymentRail.CashApp: return '$new_beginnings';
            case PaymentRail.Fedwire: return 'Search contacts or enter Routing #';
            case PaymentRail.Swift: return 'Search contacts or enter IBAN';
            case PaymentRail.Crypto: return 'Search contacts or enter Wallet Address';
            default: return 'Enter recipient details';
        }
    };

    return (
        <div className="relative">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-300">Recipient</label>
            <div className="relative mt-1">
                <input
                    type="text"
                    name="recipient"
                    value={value}
                    onChange={(e) => { onChange(e.target.value); setSearchTerm(e.target.value); }}
                    className="w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white pr-10"
                    placeholder={getPlaceholder()}
                    aria-describedby="recipient-status"
                />
                <div id="recipient-status" className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                    {status === 'VERIFYING' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>}
                    {status === 'VERIFIED' && <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                    {status === 'INVALID' && <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                </div>
            </div>
            {filteredContacts.length > 0 && (
                <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 max-h-60 overflow-auto">
                    {filteredContacts.map(contact => (
                        <li key={contact.id} onClick={() => handleSelect(contact)} className="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                           <img src={contact.avatarUrl} alt={contact.name} className="w-8 h-8 rounded-full" />
                           <div>
                               <p className="text-white font-medium text-sm">{contact.name}</p>
                               <p className="text-gray-400 text-xs">{contact.paymentMethods[rail] || 'Select to add info'}</p>
                           </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


/**
 * @description Provides form inputs for Fedwire details.
 */
export const FedwireForm: React.FC<{
    details: Partial<FedwireDetails>;
    onChange: (field: keyof FedwireDetails, value: string) => void;
}> = ({ details, onChange }) => (
    <div className="space-y-4 pt-4 border-t border-gray-700/50 mt-4">
        <h4 className="text-md font-semibold text-cyan-300">Fedwire Details</h4>
        <div><label className="block text-sm font-medium text-gray-300">ABA Routing Number</label><input type="text" value={details.routingNumber || ''} onChange={e => onChange('routingNumber', e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" placeholder="9 digits"/></div>
        <div><label className="block text-sm font-medium text-gray-300">Account Number</label><input type="text" value={details.accountNumber || ''} onChange={e => onChange('accountNumber', e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-300">Receiving Bank Name</label><input type="text" value={details.recipientBank || ''} onChange={e => onChange('recipientBank', e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-300">Memo (Optional)</label><input type="text" value={details.memo || ''} onChange={e => onChange('memo', e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" /></div>
    </div>
);

// ================================================================================================
// CUSTOM HOOKS FOR STATE MANAGEMENT & LOGIC ABSTRACTION
// ================================================================================================

/**
 * @hook useDebounce
 * @description A simple hook to debounce a value, useful for API calls on user input.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

/**
 * @hook useRemitraxPaymentFlow
 * @description Manages the entire state and logic for the multi-step payment process.
 */
export const useRemitraxPaymentFlow = () => {
    const [formState, setFormState] = useState<PaymentFormState>({
        amount: '',
        sourceCurrency: 'USD',
        targetCurrency: 'USD',
        customRecipientInput: '',
        recipientStatus: RecipientStatus.Unverified,
        selectedRail: PaymentRail.QuantumPay,
        remittanceInfo: '',
        isRecurring: false,
        recurrenceOptions: { frequency: RecurrenceFrequency.None, startDate: new Date().toISOString().split('T')[0] },
        fedwireDetails: {},
        swiftDetails: {},
        cryptoDetails: {},
    });

    const debouncedRecipientInput = useDebounce(formState.customRecipientInput, 500);

    // Effect for recipient validation
    useEffect(() => {
        if (debouncedRecipientInput.trim() === '') {
            setFormState(s => ({ ...s, recipientStatus: RecipientStatus.Unverified }));
            return;
        }
        
        const validate = async () => {
            setFormState(s => ({ ...s, recipientStatus: RecipientStatus.Verifying }));
            const { isValid, name } = await ApiServiceSimulator.validateRecipient(debouncedRecipientInput, formState.selectedRail);
            if (isValid) {
                setFormState(s => ({ ...s, recipientStatus: RecipientStatus.Verified }));
                // In a real app, you might update a recipient name field here.
            } else {
                setFormState(s => ({ ...s, recipientStatus: RecipientStatus.Invalid }));
            }
        };

        validate();
    }, [debouncedRecipientInput, formState.selectedRail]);

    const setField = <K extends keyof PaymentFormState>(field: K, value: PaymentFormState[K]) => {
        setFormState(prevState => ({ ...prevState, [field]: value }));
    };

    const handleSelectContact = (contact: RecipientContact) => {
        const recipientIdentifier = contact.paymentMethods[formState.selectedRail];
        setFormState(s => ({
            ...s,
            selectedRecipientId: contact.id,
            customRecipientInput: recipientIdentifier || '',
            recipientStatus: recipientIdentifier ? RecipientStatus.Verified : RecipientStatus.Unverified,
        }));
    };

    const isFormValid = useMemo(() => {
        if (parseFloat(formState.amount) <= 0) return false;
        if (formState.recipientStatus !== RecipientStatus.Verified) return false;
        
        switch (formState.selectedRail) {
            case PaymentRail.Fedwire:
                return formState.fedwireDetails.accountNumber && formState.fedwireDetails.routingNumber?.length === 9 && formState.fedwireDetails.recipientBank;
            // Add validation for other rails...
            default:
                return true;
        }
    }, [formState]);

    const getRecipientDisplay = () => {
        if (formState.selectedRecipientId) {
            const contact = MOCK_CONTACTS.find(c => c.id === formState.selectedRecipientId);
            return contact?.name || formState.customRecipientInput;
        }
        return formState.customRecipientInput;
    };
    
    const getPaymentMethodName = () => {
        const names: Record<PaymentRail, string> = {
            [PaymentRail.QuantumPay]: 'QuantumPay',
            [PaymentRail.CashApp]: 'Cash App',
            [PaymentRail.Fedwire]: 'Fedwire',
            [PaymentRail.Swift]: 'SWIFT',
            [PaymentRail.Crypto]: 'Crypto',
        };
        return names[formState.selectedRail];
    };
    

    return { formState, setField, handleSelectContact, isFormValid, getRecipientDisplay, getPaymentMethodName };
};


// ================================================================================================
// MAIN VIEW COMPONENT: SendMoneyView (Remitrax - Enhanced)
// ================================================================================================
const SendMoneyView: React.FC<SendMoneyViewProps> = ({ setActiveView }) => {
  const context = useContext(DataContext);
  if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
  
  const { addTransaction } = context;
  const { formState, setField, handleSelectContact, isFormValid, getRecipientDisplay, getPaymentMethodName } = useRemitraxPaymentFlow();
  
  const [showModal, setShowModal] = useState(false);
  
  // Backwards compatibility for the original state logic where needed
  const paymentMethod: PaymentMethod = formState.selectedRail === 'quantumpay' ? 'quantumpay' : 'cashapp';
  const amount = formState.amount;
  const recipient = getRecipientDisplay();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) setShowModal(true);
  };
  
  const handleSuccess = () => {
    // Construct the payload for the simulated API call
    const transactionPayload = {
      amount: parseFloat(formState.amount),
      currency: formState.sourceCurrency,
      recipient: getRecipientDisplay(),
      rail: formState.selectedRail,
      details: {}, // Populate with specific rail details
      remittanceInfo: formState.remittanceInfo,
      scheduled: formState.isRecurring ? formState.recurrenceOptions : null,
    };

    // Simulate the API call
    ApiServiceSimulator.submitTransaction(transactionPayload)
      .then(response => {
        console.log("Transaction Succeeded:", response);
        const newTx: Omit<Transaction, 'id'> = {
          type: 'expense',
          category: 'Transfer',
          description: `Payment to ${getRecipientDisplay()}`,
          amount: parseFloat(formState.amount),
          date: new Date().toISOString().split('T')[0],
          carbonFootprint: 0.1, // This could be dynamically calculated based on rail
        };
        addTransaction(newTx);
      })
      .catch(error => {
        console.error("Transaction Failed:", error.message);
        // Here you would show an error toast to the user
      });
  };
  
  const handleClose = () => {
      setShowModal(false);
      setTimeout(() => setActiveView(View.Transactions), 350);
  };
  
  return (
      <>
        <Card title="Send Money (Remitrax)">
            <PaymentRailSelector 
                selected={formState.selectedRail}
                onSelect={(rail) => {
                    setField('selectedRail', rail);
                    // Clear recipient when rail changes to force re-validation
                    setField('customRecipientInput', ''); 
                    setField('recipientStatus', RecipientStatus.Unverified);
                    setField('selectedRecipientId', undefined);
                }}
            />
            
            <form onSubmit={handleSend} className="space-y-6">
                <RecipientInput
                    value={formState.customRecipientInput}
                    onChange={(value) => setField('customRecipientInput', value)}
                    onSelectContact={handleSelectContact}
                    status={formState.recipientStatus}
                    rail={formState.selectedRail}
                />

                 {formState.selectedRail === PaymentRail.QuantumPay && (
                    <div><label htmlFor="remittance" className="block text-sm font-medium text-gray-300">Remittance Info (ISO 20022)</label><input type="text" name="remittance" value={formState.remittanceInfo} onChange={(e) => setField('remittanceInfo', e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" placeholder="Invoice #12345"/></div>
                 )}

                 {formState.selectedRail === PaymentRail.Fedwire && (
                    <FedwireForm details={formState.fedwireDetails} onChange={(field, value) => setField('fedwireDetails', {...formState.fedwireDetails, [field]: value})} />
                 )}

                 {/* TODO: Add forms for SWIFT and Crypto rails here */}

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
                    <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-400">$</span></div><input type="number" name="amount" value={formState.amount} onChange={(e) => setField('amount', e.target.value)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-7 p-2 text-white" placeholder="0.00"/></div>
                </div>
                
                <button type="submit" disabled={!isFormValid} className={`w-full py-3 text-sm font-medium text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isFormValid ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-600'}`}>
                    Send with Biometric Confirmation
                </button>
            </form>
        </Card>
        
        <BiometricModal 
            isOpen={showModal} 
            onSuccess={handleSuccess} 
            onClose={handleClose} 
            amount={amount} 
            recipient={recipient}
            paymentMethod={getPaymentMethodName()}
            rail={formState.selectedRail}
        />
    </>
  );
};

export default SendMoneyView;
