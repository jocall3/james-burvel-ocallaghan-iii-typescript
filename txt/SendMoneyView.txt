// components/views/personal/SendMoneyView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Remitrax," a complete, multi-rail payment portal featuring advanced
// security simulations and demonstrating enterprise-level integration patterns.
// After a decade of upgrades, Remitrax is an unparalleled financial ecosystem.

import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import type { Transaction } from '../types';

// ================================================================================================
// GLOBAL REMITRAX PLATFORM WIDE TYPE DEFINITIONS
// Over a decade, Remitrax has become the central nervous system for financial transactions.
// These types reflect the highly advanced, multi-dimensional nature of its operations.
// ================================================================================================

export type PaymentRail = 'quantumpay' | 'cashapp' | 'swift_global' | 'blockchain_dlt' | 'interstellar_p2p' | 'neuro_link' | 'ai_contract_escrow';
export type ScanState = 'scanning' | 'success' | 'verifying' | 'error' | 'recalibrating' | 'quantum_sync';

export interface RemitraxRecipientProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  quantumTag?: string;
  cashtag?: string;
  swiftDetails?: { bankName: string; bic: string; accountNumber: string; };
  blockchainAddress?: string; // For DLT rail
  neuroLinkAddress?: string; // For Neuro-Link rail
  galacticP2PId?: string; // For Interstellar P2P
  preferredCurrency?: string;
  lastUsedDate?: string;
  trustScore?: number; // AI-driven trust assessment
  kycStatus?: 'verified' | 'pending' | 'unverified';
  blacklisted?: boolean;
}

export interface RemitraxCurrency {
  code: string; // e.g., 'USD', 'EUR', 'BTC', 'QNT' (QuantumCoin)
  name: string;
  symbol: string;
  isCrypto: boolean;
  conversionRate?: number; // Relative to a base, fetched live
  quantumFluctuationIndex?: number; // For advanced quantum currencies
}

export interface ScheduledPaymentRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'once_on_date' | 'conditional_event';
  startDate: string;
  endDate?: string; // For recurring payments
  executionCondition?: string; // e.g., 'if_balance_above_X', 'on_market_event_Y'
  nextExecutionDate?: string;
  maxExecutions?: number;
  triggerEventId?: string; // For AI-contract escrow
}

export interface AdvancedTransactionSettings {
  priority: 'low' | 'normal' | 'high' | 'ultra_quantum'; // Affects fees & speed
  carbonOffsetRatio: number; // User-defined offset percentage
  privacyLevel: 'standard' | 'enhanced' | 'fully_anonymous_dlt';
  receiptPreference: 'email' | 'blockchain_proof' | 'neuronal_link_receipt';
  notificationPreferences: { email: boolean; sms: boolean; push: boolean; holo_alert: boolean; };
  multiSignatureRequired?: boolean; // For corporate accounts
  escrowDetails?: { agentId: string; releaseCondition: string; };
  dynamicFeeOptimization?: 'auto' | 'manual';
}

export interface SecurityAuditResult {
  riskScore: number; // 0-100, higher is riskier
  fraudProbability: number; // 0-1, AI-driven
  amlCompliance: 'pass' | 'fail' | 'review';
  sanctionScreening: 'pass' | 'fail';
  quantumSignatureIntegrity: 'verified' | 'compromised' | 'pending';
  recommendations: string[];
}

// FIX: Added interface definition for component props.
interface SendMoneyViewProps {
  setActiveView: (view: View) => void;
}


// ================================================================================================
// ANIMATED UI SUB-COMPONENTS (Deeply Enhanced for future-proof UX)
// These provide a high-fidelity user experience during the security and DLT processing.
// ================================================================================================

/**
 * @description Renders an animated checkmark icon for success feedback.
 * The animation is pure CSS, making it lightweight and performant.
 * Expanded with holographic shimmer effect.
 */
export const AnimatedCheckmarkIcon: React.FC = () => (
    <>
        <svg className="h-24 w-24 transform scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <defs>
                <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <filter id="hologramGlow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="
                        1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 10 0
                    " result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="url(#checkmarkGradient)" filter="url(#hologramGlow)" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <style>{`
            .checkmark__circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 4;
                stroke-miterlimit: 10;
                fill: none;
                animation: stroke-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                box-shadow: 0 0 15px rgba(66, 255, 125, 0.7);
            }
            .checkmark__check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                stroke-width: 5;
                stroke: #fff;
                animation: stroke-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke-circle {
                100% { stroke-dashoffset: 0; }
            }
            @keyframes stroke-check {
                100% { stroke-dashoffset: 0; }
            }
        `}</style>
    </>
);

/**
 * @description Renders a futuristic "quantum ledger" animation to simulate
 * secure transaction processing. This enhances perceived security and trust.
 * Expanded with real-time data flow visualization.
 */
export const QuantumLedgerAnimation: React.FC = () => (
    <>
        <div className="quantum-ledger-container">
            <div className="quantum-grid-enhanced">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="quantum-block-enhanced" style={{ animationDelay: `${i * 0.08}s` }}></div>
                ))}
            </div>
            <div className="quantum-data-flow">
                <div className="data-packet" style={{ '--flow-delay': '0s' } as React.CSSProperties}></div>
                <div className="data-packet" style={{ '--flow-delay': '0.5s' } as React.CSSProperties}></div>
                <div className="data-packet" style={{ '--flow-delay': '1s' } as React.CSSProperties}></div>
                <div className="data-packet" style={{ '--flow-delay': '1.5s' } as React.CSSProperties}></div>
            </div>
            <div className="text-center mt-4 text-xs text-cyan-300 animate-pulse">
                Quantum Entanglement Protocol: Active
            </div>
        </div>
        <style>{`
            .quantum-ledger-container {
                position: relative;
                width: 150px;
                height: 150px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .quantum-grid-enhanced {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 6px;
                width: 120px;
                height: 120px;
                position: relative;
                z-index: 1;
            }
            .quantum-block-enhanced {
                background-color: rgba(6, 182, 212, 0.2);
                border: 1px solid #06b6d4;
                border-radius: 3px;
                animation: quantum-pulse 2s infinite ease-in-out forwards;
                box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
            }
            @keyframes quantum-pulse {
                0%, 100% { background-color: rgba(6, 182, 212, 0.2); transform: scale(1); box-shadow: 0 0 8px rgba(6, 182, 212, 0.5); }
                50% { background-color: rgba(165, 243, 252, 0.7); transform: scale(1.08); box-shadow: 0 0 15px rgba(165, 243, 252, 0.8); }
            }

            .quantum-data-flow {
                position: absolute;
                inset: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .data-packet {
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: linear-gradient(45deg, #0ef, #06b6d4);
                box-shadow: 0 0 5px #0ef, 0 0 10px #06b6d4;
                animation: data-flow-path 4s infinite linear var(--flow-delay);
                opacity: 0;
            }
            @keyframes data-flow-path {
                0% { transform: translate(-60px, -60px) scale(0.5); opacity: 0; }
                20% { opacity: 1; }
                50% { transform: translate(60px, 60px) scale(1.2); opacity: 1; }
                80% { opacity: 0; }
                100% { transform: translate(120px, 120px) scale(0.5); opacity: 0; }
            }
        `}</style>
    </>
);


/**
 * @description Visualizes the process of establishing a secure, quantum-resistant communication channel.
 */
export const QuantumChannelEstablishment: React.FC = () => (
    <>
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-purple-500 animate-spin-slow">
                <div className="w-16 h-16 rounded-full border-2 border-purple-400 animate-ping-once"></div>
                <div className="absolute w-8 h-8 bg-purple-600 rounded-full animate-pulse-fast"></div>
            </div>
            <p className="text-sm text-purple-300 animate-fade-in-out">Establishing Quantum Tunnel...</p>
        </div>
        <style>{`
            @keyframes spin-slow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes ping-once {
                0% { transform: scale(0.2); opacity: 0; }
                50% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.2); opacity: 0; }
            }
            @keyframes pulse-fast {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
            }
            @keyframes fade-in-out {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }
            .animate-spin-slow { animation: spin-slow 8s linear infinite; }
            .animate-ping-once { animation: ping-once 2s ease-out infinite; }
            .animate-pulse-fast { animation: pulse-fast 1.5s ease-in-out infinite; }
            .animate-fade-in-out { animation: fade-in-out 3s ease-in-out infinite; }
        `}</style>
    </>
);


/**
 * @description Displays real-time security audit results with visual indicators.
 */
export const SecurityAuditDisplay: React.FC<{ auditResult: SecurityAuditResult | null }> = ({ auditResult }) => {
    if (!auditResult) return (
        <div className="flex items-center space-x-2 text-yellow-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Performing real-time security audit...</span>
        </div>
    );

    const getStatusColor = (status: 'pass' | 'fail' | 'review') => {
        if (status === 'pass') return 'text-green-400';
        if (status === 'fail') return 'text-red-400';
        return 'text-yellow-400';
    };

    const getQuantumIntegrityColor = (status: 'verified' | 'compromised' | 'pending') => {
        if (status === 'verified') return 'text-cyan-400';
        if (status === 'compromised') return 'text-red-500';
        return 'text-purple-400';
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700">
            <h4 className="font-semibold text-lg text-white">Security Audit Report</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-400">Risk Score:</p><p className={`${auditResult.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{auditResult.riskScore}/100</p>
                <p className="text-gray-400">Fraud Probability:</p><p className={`${auditResult.fraudProbability > 0.3 ? 'text-red-400' : 'text-green-400'}`>{(auditResult.fraudProbability * 100).toFixed(2)}%</p>
                <p className="text-gray-400">AML Compliance:</p><p className={getStatusColor(auditResult.amlCompliance)}>{auditResult.amlCompliance}</p>
                <p className="text-gray-400">Sanction Screening:</p><p className={getStatusColor(auditResult.sanctionScreening)}>{auditResult.sanctionScreening}</p>
                <p className="text-gray-400">Quantum Signature:</p><p className={getQuantumIntegrityColor(auditResult.quantumSignatureIntegrity)}>{auditResult.quantumSignatureIntegrity}</p>
            </div>
            {auditResult.recommendations.length > 0 && (
                <div className="mt-2 text-sm text-yellow-300">
                    <p className="font-medium">Recommendations:</p>
                    <ul className="list-disc list-inside text-xs text-yellow-200">
                        {auditResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};


// ================================================================================================
// HIGH-FIDELITY BIOMETRIC & MULTI-FACTOR AUTHENTICATION MODAL
// Enhanced for advanced biometric modalities and multi-party confirmations.
// ================================================================================================

export const BiometricModal: React.FC<{
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
    amount: string;
    recipient: RemitraxRecipientProfile | string;
    paymentMethod: PaymentRail;
    securityContext: 'personal' | 'corporate' | 'regulatory';
    mfAuthMethods?: ('fingerprint' | 'voice' | 'retinal_scan' | 'neural_pattern')[]; // New
    approvalRequiredBy?: string[]; // For corporate multi-signature
}> = ({ isOpen, onSuccess, onClose, amount, recipient, paymentMethod, securityContext, mfAuthMethods = ['fingerprint'], approvalRequiredBy }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [verificationStep, setVerificationStep] = useState(0);
    const [biometricProgress, setBiometricProgress] = useState(0); // For progress bar
    const [activeAuthMethod, setActiveAuthMethod] = useState<'face' | 'fingerprint' | 'voice' | 'retinal_scan' | 'neural_pattern'>('face'); // Assume face for video for now

    const recipientName = typeof recipient === 'string' ? recipient : recipient.name;

    const verificationMessages = [
        `Heuristic API: Initializing secure channel with ${paymentMethod} rail...`,
        `Heuristic API: Validating ${recipientName}'s identity and trust score...`,
        'Heuristic API: Cross-referencing transaction against global fraud ledgers...',
        'Heuristic API: Executing transaction on secure DLT/Quantum ledger...',
        'Heuristic API: Confirming multi-party consensus and finalization...',
        'Heuristic API: Archiving cryptographic proof of transfer...'
    ];

    // Effect to manage camera stream and the multi-step verification flow.
    useEffect(() => {
        if (!isOpen) {
            setScanState('scanning');
            setVerificationStep(0);
            setBiometricProgress(0);
            return;
        };

        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                if (activeAuthMethod === 'face' || activeAuthMethod === 'retinal_scan') {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                }
                // Simulate other biometric sensors or external device integrations here
            } catch (err) {
                console.error("Biometric access denied:", err);
                setScanState('error');
            }
        };
        startCamera();

        // Simulate biometric scan progress
        const scanProgressInterval = setInterval(() => {
            setBiometricProgress(prev => Math.min(prev + Math.random() * 10, 100));
        }, 200);

        const successTimer = setTimeout(() => {
            setScanState('success');
            clearInterval(scanProgressInterval); // Stop progress once success
        }, 3000);
        
        const verifyTimer = setTimeout(() => setScanState('verifying'), 4000);
        const quantumSyncTimer = setTimeout(() => setScanState('quantum_sync'), 7500); // New state
        const successActionTimer = setTimeout(onSuccess, 12000); // Extended time for advanced verifications
        const closeTimer = setTimeout(onClose, 13000);

        return () => {
            clearTimeout(successTimer);
            clearTimeout(verifyTimer);
            clearTimeout(quantumSyncTimer);
            clearTimeout(successActionTimer);
            clearTimeout(closeTimer);
            clearInterval(scanProgressInterval);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen, onSuccess, onClose, activeAuthMethod]);
    
    // Effect to cycle through the verification messages.
    useEffect(() => {
        if (scanState === 'verifying' || scanState === 'quantum_sync') {
            const interval = setInterval(() => {
                setVerificationStep(prev => Math.min(prev + 1, verificationMessages.length - 1));
            }, 1500); // Slower for more detailed messages
            return () => clearInterval(interval);
        }
    }, [scanState, verificationMessages.length]);

    const getTitle = () => {
        switch (scanState) {
            case 'scanning': return `Scanning ${activeAuthMethod === 'face' ? 'Face' : activeAuthMethod === 'retinal_scan' ? 'Retina' : 'Biometrics'}`;
            case 'success': return 'Identity Confirmed: High-Security Clearance';
            case 'verifying': return 'Quantum Ledger & Global Compliance Verification';
            case 'quantum_sync': return 'Quantum Network Sync: Finalizing Transaction';
            case 'error': return 'Biometric Verification Failed';
            case 'recalibrating': return 'Recalibrating Biometric Sensors...';
        }
    }
    
    return (
        <div className={`fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 backdrop-blur-lg transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-900 rounded-t-3xl sm:rounded-3xl p-8 max-w-lg w-full text-center border-t sm:border-2 border-cyan-700 shadow-xl shadow-cyan-900/30 transition-transform duration-500 ease-out transform ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full scale-90'}`}>
                
                <h3 className="text-3xl font-extrabold text-white mb-4 leading-tight">{getTitle()}</h3>
                
                <div className="relative w-72 h-72 mx-auto rounded-full overflow-hidden border-4 border-cyan-600 mb-6 shadow-lg">
                    {activeAuthMethod === 'face' || activeAuthMethod === 'retinal_scan' ? (
                        <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-gray-500 text-lg">
                            {activeAuthMethod === 'fingerprint' && <i className="fas fa-fingerprint text-6xl animate-pulse"></i>}
                            {activeAuthMethod === 'voice' && <i className="fas fa-microphone-alt text-6xl animate-pulse"></i>}
                            {activeAuthMethod === 'neural_pattern' && <i className="fas fa-brain text-6xl animate-pulse"></i>}
                            {activeAuthMethod === 'retinal_scan' && <i className="fas fa-eye text-6xl animate-pulse"></i>}
                            <p className="absolute bottom-8">Authenticating {activeAuthMethod}...</p>
                        </div>
                    )}
                    
                    {scanState === 'scanning' && <div className="absolute inset-0 bg-grid-pattern-cyan animate-scan-holographic">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-cyan-400 opacity-70 blur-sm animate-scanner-line"></div>
                    </div>}
                    {scanState === 'success' && <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center"><AnimatedCheckmarkIcon /></div>}
                    {scanState === 'verifying' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><QuantumLedgerAnimation /></div>}
                    {scanState === 'quantum_sync' && <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center"><QuantumChannelEstablishment /></div>}
                    {scanState === 'error' && <div className="absolute inset-0 bg-red-700/70 flex items-center justify-center p-4"><p className="text-lg font-bold text-white">Biometric authentication failed. Please try again or use alternative methods.</p></div>}
                    {scanState === 'recalibrating' && <div className="absolute inset-0 bg-blue-700/70 flex items-center justify-center p-4"><p className="text-lg font-bold text-white">Sensor recalibration initiated. Standby...</p></div>}
                </div>

                {scanState === 'scanning' && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${biometricProgress}%` }}></div>
                    </div>
                )}

                <p className="text-gray-300 mt-2 text-md leading-relaxed">{scanState === 'verifying' || scanState === 'quantum_sync' ? verificationMessages[verificationStep] : `Sending $${amount} to ${recipientName} via ${paymentMethod}`}</p>
                
                {securityContext === 'corporate' && approvalRequiredBy && approvalRequiredBy.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-yellow-300 border border-yellow-600">
                        <p className="font-semibold">Multi-Signature Required:</p>
                        <p>Awaiting approval from: {approvalRequiredBy.join(', ')}</p>
                    </div>
                )}

                {mfAuthMethods.length > 1 && scanState === 'error' && (
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {mfAuthMethods.filter(method => method !== activeAuthMethod).map(method => (
                            <button key={method} onClick={() => { setActiveAuthMethod(method); setScanState('scanning'); setBiometricProgress(0); }} className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full text-sm font-medium transition-colors">
                                Try {method.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                )}

                {scanState === 'scanning' && <button onClick={onClose} className="mt-6 px-6 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-full text-base text-gray-300 transition-all duration-200">Cancel Transaction</button>}
            </div>
             <style>{`.bg-grid-pattern-cyan{background-image:linear-gradient(rgba(0,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.3) 1px,transparent 1px);background-size:2.5rem 2.5rem}.animate-scan-holographic{animation:scan-holographic-effect 2.5s linear infinite; background-position: 0 0;}.animate-scanner-line{animation:scanner-line-move 2.5s ease-in-out infinite alternate}.scanner-line-fade{animation:scanner-line-fade 2.5s ease-in-out infinite alternate}@keyframes scan-holographic-effect{0%{background-position:0 0}100%{background-position:0 -5rem}}@keyframes scanner-line-move{0%{transform:translate(-50%, 0) scaleX(0.2); opacity: 0;}20%{transform:translate(-50%, 25%) scaleX(1); opacity: 1;}80%{transform:translate(-50%, 75%) scaleX(1); opacity: 1;}100%{transform:translate(-50%, 100%) scaleX(0.2); opacity: 0;}}`}</style>
        </div>
    );
};


// ================================================================================================
// REMITRAX UI UTILITIES & AI-POWERED SUB-COMPONENTS
// These leverage advanced data analytics, AI, and user preferences for smart interactions.
// ================================================================================================

/**
 * @description Manages a comprehensive recipient address book with AI-driven suggestions and group management.
 */
export const RecipientSelector: React.FC<{
  selectedRecipient: RemitraxRecipientProfile | null;
  onSelect: (recipient: RemitraxRecipientProfile) => void;
  allRecipients: RemitraxRecipientProfile[];
  paymentMethod: PaymentRail;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}> = ({ selectedRecipient, onSelect, allRecipients, paymentMethod, searchTerm, onSearchChange }) => {
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [filteredRecipients, setFilteredRecipients] = useState<RemitraxRecipientProfile[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<RemitraxRecipientProfile[]>([]);

  useEffect(() => {
    // Simulate AI-driven suggestions based on payment method, frequency, and trust score
    const aiSuggest = allRecipients
      .filter(r => (paymentMethod === 'quantumpay' && r.quantumTag) || (paymentMethod === 'cashapp' && r.cashtag))
      .sort((a, b) => (b.lastUsedDate ? new Date(b.lastUsedDate).getTime() : 0) - (a.lastUsedDate ? new Date(a.lastUsedDate).getTime() : 0) || (b.trustScore || 0) - (a.trustScore || 0))
      .slice(0, 3); // Top 3 most relevant
    setAiSuggestions(aiSuggest);
  }, [allRecipients, paymentMethod]);

  useEffect(() => {
    // Filter recipients based on search term
    const termLower = searchTerm.toLowerCase();
    const filtered = allRecipients.filter(r =>
      r.name.toLowerCase().includes(termLower) ||
      (r.quantumTag && r.quantumTag.toLowerCase().includes(termLower)) ||
      (r.cashtag && r.cashtag.toLowerCase().includes(termLower)) ||
      (r.blockchainAddress && r.blockchainAddress.toLowerCase().includes(termLower))
    );
    setFilteredRecipients(filtered);
  }, [searchTerm, allRecipients]);


  const getRecipientIdentifier = (recipient: RemitraxRecipientProfile) => {
    switch (paymentMethod) {
      case 'quantumpay': return recipient.quantumTag || 'N/A';
      case 'cashapp': return recipient.cashtag || 'N/A';
      case 'blockchain_dlt': return recipient.blockchainAddress?.substring(0, 8) + '...' || 'N/A';
      case 'swift_global': return recipient.swiftDetails?.accountNumber || 'N/A';
      case 'interstellar_p2p': return recipient.galacticP2PId || 'N/A';
      case 'neuro_link': return recipient.neuroLinkAddress?.substring(0, 8) + '...' || 'N/A';
      default: return recipient.name;
    }
  };

  return (
    <div className="space-y-4">
      <label htmlFor="recipientSearch" className="block text-sm font-medium text-gray-300">Select Recipient or Enter ID</label>
      <div className="flex space-x-2">
        <input
          type="text"
          id="recipientSearch"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Enter Recipient's ${paymentMethod === 'quantumpay' ? '@QuantumTag' : paymentMethod === 'cashapp' ? '$Cashtag' : 'ID'} or Name`}
          className="flex-grow bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white placeholder-gray-500"
        />
        <button
          type="button"
          onClick={() => setShowAddressBook(true)}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center justify-center"
        >
          <i className="fas fa-address-book mr-2"></i> Address Book
        </button>
      </div>

      {selectedRecipient && (
        <div className="p-3 bg-gray-800 rounded-lg flex items-center justify-between border border-cyan-700">
          <div className="flex items-center space-x-3">
            <img src={selectedRecipient.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedRecipient.name}`} alt="Avatar" className="w-8 h-8 rounded-full" />
            <div>
              <p className="text-white font-medium">{selectedRecipient.name}</p>
              <p className="text-gray-400 text-xs">{getRecipientIdentifier(selectedRecipient)}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedRecipient.kycStatus === 'verified' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
            KYC {selectedRecipient.kycStatus}
          </span>
        </div>
      )}

      {!selectedRecipient && aiSuggestions.length > 0 && searchTerm === '' && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-400 mb-2">AI-Suggested Recipients:</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {aiSuggestions.map(rec => (
              <button
                key={rec.id}
                type="button"
                onClick={() => onSelect(rec)}
                className="flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
              >
                <img src={rec.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${rec.name}`} alt="Avatar" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-white text-sm font-medium">{rec.name}</p>
                  <p className="text-gray-400 text-xs">{getRecipientIdentifier(rec)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showAddressBook && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-xl border border-cyan-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-white">Address Book</h4>
              <button onClick={() => setShowAddressBook(false)} className="text-gray-400 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            <input
                type="text"
                placeholder="Search address book..."
                className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white mb-4"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredRecipients.map(rec => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => { onSelect(rec); setShowAddressBook(false); }}
                  className="flex items-center space-x-3 p-3 bg-gray-800 hover:bg-cyan-900/50 rounded-lg w-full text-left transition-colors border border-gray-700"
                >
                  <img src={rec.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${rec.name}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-white font-medium text-lg">{rec.name}</p>
                    <p className="text-gray-400 text-sm">{getRecipientIdentifier(rec)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${rec.kycStatus === 'verified' ? 'bg-green-700' : 'bg-yellow-700'}`}>
                        KYC: {rec.kycStatus}
                    </span>
                    {rec.trustScore && <span className="text-xs ml-2 text-cyan-400">Trust: {rec.trustScore.toFixed(1)}</span>}
                  </div>
                </button>
              ))}
              {filteredRecipients.length === 0 && <p className="text-center text-gray-500 py-4">No recipients found.</p>}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #334155; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #06b6d4; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0891b2; }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @description Provides advanced multi-currency conversion with real-time rates and DLT asset support.
 */
export const MultiCurrencyConverter: React.FC<{
  amount: string;
  onAmountChange: (amount: string) => void;
  sourceCurrency: RemitraxCurrency;
  onSourceCurrencyChange: (currency: RemitraxCurrency) => void;
  targetCurrency: RemitraxCurrency;
  onTargetCurrencyChange: (currency: RemitraxCurrency) => void;
  availableCurrencies: RemitraxCurrency[];
  convertedAmount: number | null;
  fxRate: number | null;
  isLoading: boolean;
  onToggleDynamicFee: (enabled: boolean) => void;
  dynamicFeeEnabled: boolean;
  carbonOffsetRatio: number;
  onCarbonOffsetChange: (ratio: number) => void;
}> = ({
  amount, onAmountChange, sourceCurrency, onSourceCurrencyChange, targetCurrency, onTargetCurrencyChange,
  availableCurrencies, convertedAmount, fxRate, isLoading, onToggleDynamicFee, dynamicFeeEnabled,
  carbonOffsetRatio, onCarbonOffsetChange
}) => {
  const [showCurrencySelector, setShowCurrencySelector] = useState<'source' | 'target' | null>(null);

  const filterCurrencies = (type: 'source' | 'target') => {
    return availableCurrencies.filter(curr => {
      if (type === 'source') return curr.code !== targetCurrency.code;
      if (type === 'target') return curr.code !== sourceCurrency.code;
      return true;
    });
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-inner">
      <h4 className="text-xl font-bold text-white mb-3">Currency Exchange & Settings</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sourceAmount" className="block text-sm font-medium text-gray-300">Amount to Send</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-gray-400">{sourceCurrency.symbol}</span>
            </div>
            <input
              type="number"
              id="sourceAmount"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-9 p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <label htmlFor="sourceCurrency" className="sr-only">Source Currency</label>
              <button
                type="button"
                onClick={() => setShowCurrencySelector('source')}
                className="h-full rounded-r-md border-l border-gray-600 bg-gray-700 pr-3 pl-2 text-gray-300 hover:text-white hover:bg-gray-600 focus:ring-cyan-500 focus:border-cyan-500 flex items-center"
              >
                {sourceCurrency.code} <i className="fas fa-chevron-down ml-2 text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300">Recipient Receives</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-gray-400">{targetCurrency.symbol}</span>
            </div>
            <input
              type="text"
              id="targetAmount"
              value={convertedAmount !== null ? convertedAmount.toFixed(sourceCurrency.isCrypto ? 8 : 2) : 'Calculating...'}
              readOnly
              className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-9 p-2 text-gray-300 cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <label htmlFor="targetCurrency" className="sr-only">Target Currency</label>
              <button
                type="button"
                onClick={() => setShowCurrencySelector('target')}
                className="h-full rounded-r-md border-l border-gray-600 bg-gray-700 pr-3 pl-2 text-gray-300 hover:text-white hover:bg-gray-600 focus:ring-cyan-500 focus:border-cyan-500 flex items-center"
              >
                {targetCurrency.code} <i className="fas fa-chevron-down ml-2 text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-cyan-400 text-sm text-center animate-pulse">Fetching real-time FX rates and DLT gas fees...</p>}
      {fxRate && !isLoading && (
        <p className="text-gray-400 text-sm text-center">
          Current FX Rate: 1 {sourceCurrency.code} = {fxRate.toFixed(sourceCurrency.isCrypto ? 8 : 4)} {targetCurrency.code}
          {sourceCurrency.isCrypto || targetCurrency.isCrypto ? <span className="ml-2 text-purple-400">(Includes estimated DLT network fees)</span> : ''}
        </p>
      )}
      
      <div className="flex items-center justify-between text-sm mt-4">
        <label htmlFor="dynamicFeeToggle" className="text-gray-300 cursor-pointer flex items-center">
          <input
            type="checkbox"
            id="dynamicFeeToggle"
            checked={dynamicFeeEnabled}
            onChange={(e) => onToggleDynamicFee(e.target.checked)}
            className="form-checkbox h-4 w-4 text-cyan-600 rounded mr-2 bg-gray-600 border-gray-500 focus:ring-cyan-500"
          />
          Dynamic Fee Optimization (AI)
        </label>
        <span className="text-gray-500">
            <i className="fas fa-info-circle mr-1"></i>Optimizes fees across rails.
        </span>
      </div>

      <div className="mt-4">
          <label htmlFor="carbonOffsetSlider" className="block text-sm font-medium text-gray-300 mb-2">Carbon Offset Contribution ({carbonOffsetRatio * 100}%)</label>
          <input
              type="range"
              id="carbonOffsetSlider"
              min="0"
              max="1"
              step="0.05"
              value={carbonOffsetRatio}
              onChange={(e) => onCarbonOffsetChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">Offset your transaction's environmental impact through certified green projects.</p>
      </div>


      {showCurrencySelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-xl border border-cyan-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold text-white">Select {showCurrencySelector === 'source' ? 'Source' : 'Target'} Currency</h4>
              <button onClick={() => setShowCurrencySelector(null)} className="text-gray-400 hover:text-white"><i className="fas fa-times"></i></button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {filterCurrencies(showCurrencySelector).map(curr => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    if (showCurrencySelector === 'source') onSourceCurrencyChange(curr);
                    else onTargetCurrencyChange(curr);
                    setShowCurrencySelector(null);
                  }}
                  className="flex items-center space-x-3 p-3 bg-gray-800 hover:bg-cyan-900/50 rounded-lg w-full text-left transition-colors border border-gray-700"
                >
                  <span className="text-white font-medium text-lg">{curr.code}</span>
                  <span className="text-gray-400 text-sm">{curr.name}</span>
                  {curr.isCrypto && <span className="ml-auto text-purple-400 text-xs">(DLT Asset)</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @description Configures advanced scheduling and conditional payment rules.
 */
export const AdvancedSchedulingPanel: React.FC<{
  scheduleRule: ScheduledPaymentRule;
  onRuleChange: (rule: Partial<ScheduledPaymentRule>) => void;
  isScheduled: boolean;
  onToggleSchedule: (enabled: boolean) => void;
}> = ({ scheduleRule, onRuleChange, isScheduled, onToggleSchedule }) => {
  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-inner">
      <h4 className="text-xl font-bold text-white mb-3">Advanced Scheduling & Automation</h4>

      <div className="flex items-center justify-between text-sm">
        <label htmlFor="scheduleToggle" className="text-gray-300 cursor-pointer flex items-center">
          <input
            type="checkbox"
            id="scheduleToggle"
            checked={isScheduled}
            onChange={(e) => onToggleSchedule(e.target.checked)}
            className="form-checkbox h-4 w-4 text-green-600 rounded mr-2 bg-gray-600 border-gray-500 focus:ring-green-500"
          />
          Enable Scheduled / Conditional Payment
        </label>
      </div>

      {isScheduled && (
        <div className="space-y-4 mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">Frequency</label>
            <select
              id="frequency"
              value={scheduleRule.frequency}
              onChange={(e) => onRuleChange({ frequency: e.target.value as ScheduledPaymentRule['frequency'] })}
              className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"
            >
              <option value="once_on_date">Once on Specific Date</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
              <option value="conditional_event">Conditional Event Trigger (AI Smart Contract)</option>
            </select>
          </div>

          {scheduleRule.frequency !== 'conditional_event' && (
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={scheduleRule.startDate}
                onChange={(e) => onRuleChange({ startDate: e.target.value })}
                className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"
              />
            </div>
          )}

          {scheduleRule.frequency !== 'once_on_date' && scheduleRule.frequency !== 'conditional_event' && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">End Date (Optional)</label>
              <input
                type="date"
                id="endDate"
                value={scheduleRule.endDate || ''}
                onChange={(e) => onRuleChange({ endDate: e.target.value || undefined })}
                className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"
              />
            </div>
          )}

          {scheduleRule.frequency === 'conditional_event' && (
            <div className="space-y-2">
              <label htmlFor="executionCondition" className="block text-sm font-medium text-gray-300">Execution Condition (AI-driven Smart Contract Logic)</label>
              <textarea
                id="executionCondition"
                value={scheduleRule.executionCondition || ''}
                onChange={(e) => onRuleChange({ executionCondition: e.target.value })}
                rows={3}
                placeholder="e.g., if_stock_price('AAPL') > 200 and_balance_above_X or on_supply_chain_milestone_Y"
                className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white resize-y"
              ></textarea>
              <p className="text-xs text-gray-500">Remitrax's AI will monitor this condition across integrated data feeds and execute autonomously.</p>
            </div>
          )}

          {scheduleRule.frequency !== 'once_on_date' && (
              <div>
                  <label htmlFor="maxExecutions" className="block text-sm font-medium text-gray-300">Maximum Executions (Optional)</label>
                  <input
                      type="number"
                      id="maxExecutions"
                      value={scheduleRule.maxExecutions || ''}
                      onChange={(e) => onRuleChange({ maxExecutions: parseInt(e.target.value) || undefined })}
                      placeholder="e.g., 10"
                      className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Limits the total number of times this payment will occur.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};


/**
 * @description Provides a detailed pre-transaction review and summary.
 */
export const TransactionReviewPanel: React.FC<{
    amount: string;
    sourceCurrency: RemitraxCurrency;
    targetCurrency: RemitraxCurrency;
    convertedAmount: number | null;
    fxRate: number | null;
    recipient: RemitraxRecipientProfile | null;
    paymentMethod: PaymentRail;
    remittanceInfo: string;
    isScheduled: boolean;
    scheduleRule: ScheduledPaymentRule | null;
    advancedSettings: AdvancedTransactionSettings;
    estimatedFees: number;
    totalAmountCharged: number;
    securityAudit: SecurityAuditResult | null;
}> = ({
    amount, sourceCurrency, targetCurrency, convertedAmount, fxRate, recipient, paymentMethod,
    remittanceInfo, isScheduled, scheduleRule, advancedSettings, estimatedFees, totalAmountCharged, securityAudit
}) => {
    if (!recipient) return null;

    const getPaymentMethodLabel = (method: PaymentRail) => {
        switch (method) {
            case 'quantumpay': return 'QuantumPay (Instant DLT)';
            case 'cashapp': return 'Cash App (P2P)';
            case 'swift_global': return 'SWIFT Global Wire';
            case 'blockchain_dlt': return 'Blockchain DLT (EVM/Custom)';
            case 'interstellar_p2p': return 'Interstellar P2P (Distributed Ledger)';
            case 'neuro_link': return 'Neuro-Link (Biometric/Neural)';
            case 'ai_contract_escrow': return 'AI Contract Escrow (Automated)';
        }
    };

    const getRecipientIdentifier = (rec: RemitraxRecipientProfile) => {
        switch (paymentMethod) {
            case 'quantumpay': return rec.quantumTag;
            case 'cashapp': return rec.cashtag;
            case 'swift_global': return rec.swiftDetails?.accountNumber;
            case 'blockchain_dlt': return rec.blockchainAddress;
            case 'interstellar_p2p': return rec.galacticP2PId;
            case 'neuro_link': return rec.neuroLinkAddress;
            case 'ai_contract_escrow': return rec.name; // AI contracts might use names or specific identifiers
            default: return rec.name;
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-cyan-700 shadow-lg space-y-4">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <i className="fas fa-file-invoice-dollar mr-3 text-cyan-400"></i> Transaction Summary & Audit
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <p className="text-gray-400">Recipient Name:</p><p className="text-white font-medium">{recipient.name}</p>
                <p className="text-gray-400">Recipient ID:</p><p className="text-cyan-300 break-all">{getRecipientIdentifier(recipient)}</p>
                <p className="text-gray-400">Payment Rail:</p><p className="text-white">{getPaymentMethodLabel(paymentMethod)}</p>
                <p className="text-gray-400">Amount Sent:</p><p className="text-white font-bold">{sourceCurrency.symbol} {parseFloat(amount).toFixed(sourceCurrency.isCrypto ? 8 : 2)} {sourceCurrency.code}</p>
                {convertedAmount !== null && (
                    <>
                        <p className="text-gray-400">Recipient Receives:</p><p className="text-green-400 font-bold">{targetCurrency.symbol} {convertedAmount.toFixed(targetCurrency.isCrypto ? 8 : 2)} {targetCurrency.code}</p>
                        <p className="text-gray-400">FX Rate:</p><p className="text-gray-300">1 {sourceCurrency.code} = {fxRate?.toFixed(targetCurrency.isCrypto ? 8 : 4) || 'N/A'} {targetCurrency.code}</p>
                    </>
                )}
                <p className="text-gray-400">Remittance Info:</p><p className="text-white italic">{remittanceInfo || 'N/A'}</p>
                <p className="text-gray-400">Estimated Fees:</p><p className="text-red-400">{sourceCurrency.symbol} {estimatedFees.toFixed(2)}</p>
                <p className="text-gray-400">Total Charged:</p><p className="text-white font-bold">{sourceCurrency.symbol} {totalAmountCharged.toFixed(2)}</p>
            </div>

            {isScheduled && scheduleRule && (
                <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <h5 className="font-semibold text-cyan-300 mb-2">Scheduled Payment Details:</h5>
                    <p className="text-gray-400 text-sm">Frequency: <span className="text-white">{scheduleRule.frequency.replace(/_/g, ' ').toUpperCase()}</span></p>
                    {scheduleRule.startDate && <p className="text-gray-400 text-sm">Start Date: <span className="text-white">{scheduleRule.startDate}</span></p>}
                    {scheduleRule.endDate && <p className="text-gray-400 text-sm">End Date: <span className="text-white">{scheduleRule.endDate}</span></p>}
                    {scheduleRule.executionCondition && <p className="text-gray-400 text-sm">Condition: <span className="text-white italic">{scheduleRule.executionCondition}</span></p>}
                </div>
            )}

            <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
                <h5 className="font-semibold text-cyan-300 mb-2">Advanced Settings:</h5>
                <p className="text-gray-400 text-sm">Priority: <span className="text-white">{advancedSettings.priority.replace(/_/g, ' ').toUpperCase()}</span></p>
                <p className="text-gray-400 text-sm">Carbon Offset: <span className="text-green-400">{advancedSettings.carbonOffsetRatio * 100}%</span></p>
                <p className="text-gray-400 text-sm">Privacy Level: <span className="text-white">{advancedSettings.privacyLevel.replace(/_/g, ' ').toUpperCase()}</span></p>
                {advancedSettings.multiSignatureRequired && <p className="text-gray-400 text-sm">Multi-Signature Required: <span className="text-yellow-400">Yes</span></p>}
                {advancedSettings.escrowDetails && <p className="text-gray-400 text-sm">Escrow Agent: <span className="text-white">{advancedSettings.escrowDetails.agentId}</span></p>}
            </div>

            <div className="mt-4">
                <SecurityAuditDisplay auditResult={securityAudit} />
            </div>
        </div>
    );
};

// ================================================================================================
// AI-POWERED CONTEXTUAL ASSISTANCE AND PREDICTIVE INTELLIGENCE
// Remitrax AI anticipates user needs and provides proactive guidance.
// ================================================================================================

export const AIRecommendationEngine: React.FC<{
    currentAmount: string;
    currentRecipientId: string;
    onSuggestAmount: (amount: string) => void;
    onSuggestRecipient: (recipient: RemitraxRecipientProfile) => void;
    allRecipients: RemitraxRecipientProfile[];
}> = ({ currentAmount, currentRecipientId, onSuggestAmount, onSuggestRecipient, allRecipients }) => {
    const [aiInsights, setAiInsights] = useState<{ amount?: string; recipient?: RemitraxRecipientProfile; message: string }[]>([]);

    useEffect(() => {
        const fetchInsights = async () => {
            // Simulate AI processing historical data, calendar, and recent interactions
            await new Promise(resolve => setTimeout(resolve, 1500)); // AI thinking...

            const insights: typeof aiInsights = [];

            // Example 1: Suggest amount based on last payment to this recipient
            if (currentRecipientId) {
                const recentPayments = [
                    { recipientId: currentRecipientId, amount: '150.00', date: '2023-10-20' },
                    { recipientId: 'rec_456', amount: '75.00', date: '2023-10-15' },
                ]; // Mock historical data
                const lastPayment = recentPayments.find(p => p.recipientId === currentRecipientId);
                if (lastPayment && currentAmount !== lastPayment.amount) {
                    insights.push({
                        amount: lastPayment.amount,
                        message: `You usually send ${lastPayment.amount} to this recipient.`,
                    });
                }
            }

            // Example 2: Suggest a recipient based on upcoming bills (calendar integration)
            const upcomingBills = [{ recipientId: 'rec_789', amount: '250.00', name: 'Utility Co.', due: '2023-11-05' }]; // Mock
            const billRecipient = allRecipients.find(r => r.id === upcomingBills[0]?.recipientId);
            if (billRecipient && !currentRecipientId) {
                insights.push({
                    recipient: billRecipient,
                    message: `Upcoming bill for ${billRecipient.name} due ${upcomingBills[0].due}.`,
                    amount: upcomingBills[0].amount
                });
            }

            // Example 3: General financial health check
            if (parseFloat(currentAmount || '0') > 1000) {
                insights.push({ message: "High value transaction detected. Consider multi-signature approval if applicable." });
            }

            setAiInsights(insights);
        };
        fetchInsights();
    }, [currentAmount, currentRecipientId, allRecipients]);

    if (aiInsights.length === 0) {
        return <p className="text-gray-500 text-sm italic animate-pulse">Remitrax AI is analyzing your financial patterns for optimal suggestions...</p>;
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-blue-700 shadow-inner space-y-3">
            <h4 className="flex items-center text-blue-300 font-semibold text-lg">
                <i className="fas fa-brain mr-2"></i> AI Assistant Insights
            </h4>
            {aiInsights.map((insight, index) => (
                <div key={index} className="text-sm text-gray-300 flex items-start">
                    <i className="fas fa-lightbulb text-blue-400 mr-2 mt-1"></i>
                    <span>
                        {insight.message}
                        {insight.amount && !currentAmount && (
                            <button onClick={() => onSuggestAmount(insight.amount!)} className="ml-2 text-cyan-400 hover:text-cyan-300 underline">
                                Use ${insight.amount}
                            </button>
                        )}
                        {insight.recipient && !currentRecipientId && (
                            <button onClick={() => onSuggestRecipient(insight.recipient!)} className="ml-2 text-cyan-400 hover:text-cyan-300 underline">
                                Select {insight.recipient.name}
                            </button>
                        )}
                    </span>
                </div>
            ))}
        </div>
    );
};


// ================================================================================================
// REMITRAX MAIN VIEW COMPONENT: SendMoneyView (The Universe)
// This is the nexus of all financial power, integrating all advanced features.
// ================================================================================================
const SendMoneyView: React.FC<SendMoneyViewProps> = ({ setActiveView }) => {
  const context = useContext(DataContext);
  if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
  const { addTransaction, userPreferences, fetchRecipients, fetchCurrencies, getUserSecurityProfile } = context; // Assuming DataContext is also expanded

  // CORE TRANSACTION STATE
  const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
  const [amount, setAmount] = useState('');
  const [remittanceInfo, setRemittanceInfo] = useState('');

  // RECIPIENT MANAGEMENT STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RemitraxRecipientProfile | null>(null);
  const [allRecipients, setAllRecipients] = useState<RemitraxRecipientProfile[]>([]);
  // Placeholder for new recipient input if not found
  const [newRecipientData, setNewRecipientData] = useState<{name: string, identifier: string, kycStatus: RemitraxRecipientProfile['kycStatus']}>({name: '', identifier: '', kycStatus: 'pending'});


  // CURRENCY & FX STATE
  const [sourceCurrency, setSourceCurrency] = useState<RemitraxCurrency>({ code: 'USD', name: 'US Dollar', symbol: '$', isCrypto: false });
  const [targetCurrency, setTargetCurrency] = useState<RemitraxCurrency>({ code: 'USD', name: 'US Dollar', symbol: '$', isCrypto: false });
  const [availableCurrencies, setAvailableCurrencies] = useState<RemitraxCurrency[]>([]);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [isLoadingFx, setIsLoadingFx] = useState(false);

  // ADVANCED SETTINGS STATE
  const [isScheduledPayment, setIsScheduledPayment] = useState(false);
  const [scheduleRule, setScheduleRule] = useState<ScheduledPaymentRule>({
    frequency: 'once_on_date',
    startDate: new Date().toISOString().split('T')[0],
  });
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedTransactionSettings>({
    priority: 'normal',
    carbonOffsetRatio: userPreferences?.defaultCarbonOffset || 0.1, // From user preferences
    privacyLevel: 'standard',
    notificationPreferences: { email: true, sms: false, push: true, holo_alert: false },
    dynamicFeeOptimization: 'auto',
  });
  const [estimatedFees, setEstimatedFees] = useState(0);

  // SECURITY & COMPLIANCE STATE
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [securityAuditResult, setSecurityAuditResult] = useState<SecurityAuditResult | null>(null);
  const [userSecurityProfile, setUserSecurityProfile] = useState<{mfAuthMethods: BiometricModal['mfAuthMethods']; approvalRequiredBy: BiometricModal['approvalRequiredBy']}>({
    mfAuthMethods: ['face', 'fingerprint'], // Default
    approvalRequiredBy: []
  });

  // AI & INTERACTIVE STATE
  const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Review, 3: Confirmation
  const totalSteps = 3;


  // ================================================================================================
  // LIFECYCLE EFFECTS AND DATA FETCHING
  // ================================================================================================

  // Load initial data: recipients, currencies, user security profile
  useEffect(() => {
    // Simulate fetching from global DataContext or API
    const loadInitialData = async () => {
        // Fetch recipients
        const fetchedRecipients: RemitraxRecipientProfile[] = [
            { id: 'rec_123', name: 'Alice Quantum', quantumTag: '@aliceq', cashtag: '$aliceq', preferredCurrency: 'QNT', lastUsedDate: '2023-10-25', trustScore: 95, kycStatus: 'verified', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alice' },
            { id: 'rec_456', name: 'Bob Cash', quantumTag: '@bobc', cashtag: '$bobc', preferredCurrency: 'USD', lastUsedDate: '2023-09-10', trustScore: 88, kycStatus: 'verified', avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Bob' },
            { id: 'rec_789', name: 'Corporate Account A', swiftDetails: { bankName: 'Global Bank Inc.', bic: 'GBIUSA33', accountNumber: '1234567890' }, preferredCurrency: 'EUR', kycStatus: 'verified', trustScore: 99, avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=CorpA' },
            { id: 'rec_101', name: 'DLT Wallet X', blockchainAddress: '0xabc123...', preferredCurrency: 'ETH', kycStatus: 'pending', trustScore: 70, avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DLT' },
        ];
        setAllRecipients(fetchedRecipients);

        // Fetch currencies
        const fetchedCurrencies: RemitraxCurrency[] = [
            { code: 'USD', name: 'US Dollar', symbol: '$', isCrypto: false },
            { code: 'EUR', name: 'Euro', symbol: '€', isCrypto: false },
            { code: 'GBP', name: 'British Pound', symbol: '£', isCrypto: false },
            { code: 'BTC', name: 'Bitcoin', symbol: '₿', isCrypto: true },
            { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', isCrypto: true },
            { code: 'QNT', name: 'QuantumCoin', symbol: '¤', isCrypto: true, quantumFluctuationIndex: 0.8 }, // Custom Quantum currency
            { code: 'GLD', name: 'Digital Gold', symbol: '⚜', isCrypto: true }, // Asset-backed DLT
            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', isCrypto: false },
            { code: 'CAD', name: 'Canadian Dollar', symbol: '$', isCrypto: false },
        ];
        setAvailableCurrencies(fetchedCurrencies);
        setSourceCurrency(fetchedCurrencies.find(c => c.code === 'USD') || fetchedCurrencies[0]);
        setTargetCurrency(fetchedCurrencies.find(c => c.code === 'USD') || fetchedCurrencies[0]);

        // Fetch user security profile (e.g., from `getUserSecurityProfile` in DataContext)
        // This would define which MFA methods are available/required and if multi-party approval is needed
        const security = await Promise.resolve({
            mfAuthMethods: ['face', 'fingerprint', 'voice'],
            approvalRequiredBy: [] // e.g., ['John Doe', 'Jane Smith'] for corporate
        });
        setUserSecurityProfile(security);
    };
    loadInitialData();
  }, [context]); // Assuming `context` provides data fetching functions


  // Recipient identification and pre-filling
  useEffect(() => {
    let identifiedRecipient: RemitraxRecipientProfile | undefined;
    if (searchTerm.startsWith('@')) { // QuantumTag
      identifiedRecipient = allRecipients.find(r => r.quantumTag === searchTerm);
    } else if (searchTerm.startsWith('$')) { // Cashtag
      identifiedRecipient = allRecipients.find(r => r.cashtag === searchTerm);
    } else if (searchTerm.length > 5 && (searchTerm.startsWith('0x') || searchTerm.length === 42)) { // Blockchain address heuristic
      identifiedRecipient = allRecipients.find(r => r.blockchainAddress === searchTerm);
      setPaymentMethod('blockchain_dlt');
    } else if (searchTerm.length > 0) { // Search by name
      identifiedRecipient = allRecipients.find(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setSelectedRecipient(identifiedRecipient || null);

    // If recipient has preferred currency, auto-select it for target
    if (identifiedRecipient?.preferredCurrency) {
        const preferred = availableCurrencies.find(c => c.code === identifiedRecipient.preferredCurrency);
        if (preferred) setTargetCurrency(preferred);
    }
  }, [searchTerm, allRecipients, availableCurrencies]);

  // FX Rate and Conversion Calculation
  useEffect(() => {
    if (parseFloat(amount) <= 0) {
      setConvertedAmount(null);
      setEstimatedFees(0);
      return;
    }

    setIsLoadingFx(true);
    // Simulate API call for FX rates and dynamic fee calculation
    const fetchConversion = async () => {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

      let rate = 1;
      if (sourceCurrency.code !== targetCurrency.code) {
          // Mock rates, real app would call an FX API
          const mockRates: { [key: string]: { [key: string]: number } } = {
              'USD': { 'EUR': 0.93, 'GBP': 0.81, 'BTC': 0.00003, 'QNT': 1000 },
              'EUR': { 'USD': 1.07, 'GBP': 0.86, 'BTC': 0.000028, 'QNT': 1070 },
              'BTC': { 'USD': 30000, 'EUR': 28000, 'QNT': 30000000 },
              'QNT': { 'USD': 0.001, 'EUR': 0.0009, 'BTC': 0.00000003 },
              // Add more as needed
          };
          rate = mockRates[sourceCurrency.code]?.[targetCurrency.code] || 1; // Default to 1 if no rate
      }
      setFxRate(rate);

      const parsedAmount = parseFloat(amount);
      const converted = parsedAmount * rate;
      setConvertedAmount(converted);

      // Dynamic Fee Calculation (AI-driven)
      let baseFee = parsedAmount * 0.005; // 0.5% base fee
      if (sourceCurrency.isCrypto || targetCurrency.isCrypto || paymentMethod === 'blockchain_dlt') {
        baseFee += 5; // Additional DLT network/gas fee simulation
      }
      if (advancedSettings.priority === 'high') baseFee *= 1.5;
      if (advancedSettings.priority === 'ultra_quantum') baseFee *= 2.5;
      if (advancedSettings.dynamicFeeOptimization === 'auto') {
          // AI optimizes for lowest fee / fastest speed combo
          baseFee = Math.max(baseFee * 0.8, 1); // Simulate AI finding a better route
      }
      setEstimatedFees(baseFee);
      setIsLoadingFx(false);
    };
    fetchConversion();
  }, [amount, sourceCurrency, targetCurrency, advancedSettings.priority, advancedSettings.dynamicFeeOptimization, paymentMethod]);


  // Real-time Security Audit
  useEffect(() => {
    const performAudit = async () => {
        setSecurityAuditResult(null); // Reset
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate audit time

        let riskScore = 0;
        let fraudProbability = 0.01;
        const recommendations: string[] = [];
        let amlCompliance: SecurityAuditResult['amlCompliance'] = 'pass';
        let sanctionScreening: SecurityAuditResult['sanctionScreening'] = 'pass';
        let quantumSignatureIntegrity: SecurityAuditResult['quantumSignatureIntegrity'] = 'verified';

        if (parseFloat(amount) > 5000) {
            riskScore += 20;
            fraudProbability += 0.1;
            recommendations.push("High transaction value detected. Consider additional verification.");
        }
        if (selectedRecipient && selectedRecipient.kycStatus !== 'verified') {
            riskScore += 30;
            fraudProbability += 0.2;
            amlCompliance = 'review';
            recommendations.push("Recipient KYC status is not 'verified'. Review recipient details.");
        }
        if (selectedRecipient && selectedRecipient.blacklisted) {
            riskScore = 100;
            fraudProbability = 0.99;
            amlCompliance = 'fail';
            sanctionScreening = 'fail';
            recommendations.push("Recipient is on a financial blacklist. Transaction blocked.");
        }
        if (paymentMethod === 'blockchain_dlt' && !sourceCurrency.isCrypto) {
            recommendations.push("Using DLT rail for fiat currency may incur higher conversion fees.");
        }
        if (paymentMethod === 'quantumpay' && selectedRecipient && !selectedRecipient.quantumTag) {
            quantumSignatureIntegrity = 'pending';
            recommendations.push("Recipient doesn't have a QuantumTag, QuantumPay may require fallback protocol.");
        }
        if (advancedSettings.priority === 'ultra_quantum' && paymentMethod !== 'quantumpay') {
            recommendations.push("Ultra Quantum priority is best suited for QuantumPay rail.");
        }
        
        // Add more complex AI-driven checks based on user behavior, geo-location, historical data etc.
        // Example: If user usually sends $50 and suddenly sends $5000, trigger warning.

        setSecurityAuditResult({
            riskScore: Math.min(riskScore, 100),
            fraudProbability: Math.min(fraudProbability, 0.99),
            amlCompliance,
            sanctionScreening,
            quantumSignatureIntegrity,
            recommendations,
        });
    };
    performAudit();
  }, [amount, selectedRecipient, paymentMethod, sourceCurrency, advancedSettings.priority]);


  // ================================================================================================
  // EVENT HANDLERS
  // ================================================================================================

  const getRecipientFinalIdentifier = () => {
      if (selectedRecipient) {
          switch (paymentMethod) {
              case 'quantumpay': return selectedRecipient.quantumTag || selectedRecipient.name;
              case 'cashapp': return selectedRecipient.cashtag || selectedRecipient.name;
              case 'swift_global': return selectedRecipient.swiftDetails?.accountNumber || selectedRecipient.name;
              case 'blockchain_dlt': return selectedRecipient.blockchainAddress || selectedRecipient.name;
              case 'interstellar_p2p': return selectedRecipient.galacticP2PId || selectedRecipient.name;
              case 'neuro_link': return selectedRecipient.neuroLinkAddress || selectedRecipient.name;
              case 'ai_contract_escrow': return selectedRecipient.name;
          }
      }
      // Fallback for manually entered IDs
      return searchTerm;
  };

  const isFormValid = parseFloat(amount) > 0 && (!!selectedRecipient || searchTerm.trim() !== '');
  const canProceedToReview = isFormValid && securityAuditResult?.fraudProbability < 0.5 && securityAuditResult?.sanctionScreening === 'pass';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === 1 && canProceedToReview) {
        setCurrentStep(2); // Move to review step
    } else if (currentStep === 2 && isFormValid && securityAuditResult?.amlCompliance === 'pass') {
        setShowBiometricModal(true); // Initiate biometric confirmation
    }
  };
  
  const handleBiometricSuccess = () => {
    const simulateApiCall = () => {
      console.log("%c--- REMITRAX QUANTUM-SECURE TRANSACTION INITIATED (ISO 20022 / DLT Compliant) ---", "color: cyan; font-weight: bold;");
      const transactionRequest = {
          protocolVersion: 'Remitrax_v1.7_QuantumLedger', // Reflects decade of upgrades
          transactionId: `RTX_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          senderAccountId: 'user_local_remitrax_id', // Placeholder, real ID from context
          recipient: {
              id: selectedRecipient?.id || 'new_recipient',
              identifier: getRecipientFinalIdentifier(),
              name: selectedRecipient?.name || newRecipientData.name,
              paymentMethod: paymentMethod,
              kycStatus: selectedRecipient?.kycStatus || newRecipientData.kycStatus,
          },
          amount: parseFloat(amount),
          sourceCurrency: sourceCurrency.code,
          targetCurrency: targetCurrency.code,
          convertedAmount: convertedAmount,
          fxRate: fxRate,
          remittanceInformation: remittanceInfo,
          fees: estimatedFees,
          totalCharged: parseFloat(amount) + estimatedFees,
          advancedSettings: advancedSettings,
          schedule: isScheduledPayment ? scheduleRule : undefined,
          securityAuditSnapshot: securityAuditResult,
          timestamp: new Date().toISOString(),
          carbonFootprintGenerated: 0.1 * parseFloat(amount), // Dynamic carbon calculation
          dltTransactionHash: paymentMethod === 'blockchain_dlt' || paymentMethod === 'quantumpay' ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined, // Simulated DLT hash
          quantumSignatureProof: paymentMethod === 'quantumpay' ? `QSP_${Math.random().toString(36).substring(2, 15)}` : undefined, // Simulated Quantum proof
      };
      console.log("Transaction Request Payload:", transactionRequest);
      console.log("----------------------------------------------------------------------------------");
      // In a real application, this would dispatch to a global transaction service.
      // E.g., context.sendTransaction(transactionRequest);
    };
    
    simulateApiCall();

    const newTx: Transaction = {
      id: `txn_${Date.now()}`,
      type: isScheduledPayment ? 'scheduled_expense' : 'expense',
      category: 'Transfer',
      description: `Payment to ${selectedRecipient?.name || searchTerm} via ${paymentMethod} (${remittanceInfo})`,
      amount: parseFloat(amount) + estimatedFees, // Record total amount charged including fees
      date: new Date().toISOString().split('T')[0],
      carbonFootprint: (parseFloat(amount) * advancedSettings.carbonOffsetRatio) + 0.1, // Adjusted for offset
      isScheduled: isScheduledPayment,
      scheduledRule: isScheduledPayment ? scheduleRule : undefined,
    };
    addTransaction(newTx); // Add to local context transactions
  };
  
  const handleBiometricClose = () => {
      setShowBiometricModal(false);
      // After a successful transaction, navigate to transactions view.
      // If it was cancelled or failed, stay on the send page.
      if (securityAuditResult?.amlCompliance === 'pass') { // Simplified check for success
        setTimeout(() => setActiveView(View.Transactions), 500);
      }
  };

  const handleRecipientSelection = useCallback((rec: RemitraxRecipientProfile) => {
    setSelectedRecipient(rec);
    setSearchTerm(rec.quantumTag || rec.cashtag || rec.name); // Prefill search for display
    // Auto-set payment method based on recipient's primary identifier
    if (rec.quantumTag) setPaymentMethod('quantumpay');
    else if (rec.cashtag) setPaymentMethod('cashapp');
    else if (rec.blockchainAddress) setPaymentMethod('blockchain_dlt');
    else if (rec.swiftDetails) setPaymentMethod('swift_global');
  }, []);

  const handleAISuggestAmount = (suggestedAmount: string) => {
    setAmount(suggestedAmount);
  };

  const handleAISuggestRecipient = (suggestedRecipient: RemitraxRecipientProfile) => {
    handleRecipientSelection(suggestedRecipient);
  };


  // ================================================================================================
  // RENDER LOGIC
  // ================================================================================================

  const renderCurrentStep = () => {
    switch (currentStep) {
        case 1: // Input Step
            return (
                <form onSubmit={handleSend} className="space-y-6">
                    <AIRecommendationEngine
                        currentAmount={amount}
                        currentRecipientId={selectedRecipient?.id || ''}
                        onSuggestAmount={handleAISuggestAmount}
                        onSuggestRecipient={handleAISuggestRecipient}
                        allRecipients={allRecipients}
                    />

                    <div className="p-1 bg-gray-900/50 rounded-lg flex mb-6 border border-gray-700">
                        {['quantumpay', 'cashapp', 'blockchain_dlt', 'swift_global', 'interstellar_p2p', 'neuro_link', 'ai_contract_escrow'].map(rail => (
                            <button
                                key={rail}
                                onClick={() => setPaymentMethod(rail as PaymentRail)}
                                type="button"
                                className={`flex-1 py-2.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap overflow-hidden text-ellipsis
                                ${paymentMethod === rail ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700/50'}`}
                            >
                                {rail.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>
                    
                    <RecipientSelector
                        selectedRecipient={selectedRecipient}
                        onSelect={handleRecipientSelection}
                        allRecipients={allRecipients}
                        paymentMethod={paymentMethod}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />

                    {(!selectedRecipient && searchTerm.trim() !== '' && searchTerm.length > 3) && (
                        <div className="mt-4 p-3 bg-yellow-900/40 border border-yellow-600 rounded-lg text-yellow-300 text-sm">
                            <p className="font-semibold">Recipient not found in address book.</p>
                            <p>Transaction will proceed using raw identifier. Consider adding to contacts.</p>
                            <input
                                type="text"
                                placeholder="Recipient Full Name (Optional)"
                                value={newRecipientData.name}
                                onChange={(e) => setNewRecipientData(prev => ({...prev, name: e.target.value}))}
                                className="mt-2 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white"
                            />
                        </div>
                    )}

                    <MultiCurrencyConverter
                        amount={amount}
                        onAmountChange={setAmount}
                        sourceCurrency={sourceCurrency}
                        onSourceCurrencyChange={setSourceCurrency}
                        targetCurrency={targetCurrency}
                        onTargetCurrencyChange={setTargetCurrency}
                        availableCurrencies={availableCurrencies}
                        convertedAmount={convertedAmount}
                        fxRate={fxRate}
                        isLoading={isLoadingFx}
                        dynamicFeeEnabled={advancedSettings.dynamicFeeOptimization === 'auto'}
                        onToggleDynamicFee={(enabled) => setAdvancedSettings(prev => ({ ...prev, dynamicFeeOptimization: enabled ? 'auto' : 'manual' }))}
                        carbonOffsetRatio={advancedSettings.carbonOffsetRatio}
                        onCarbonOffsetChange={(ratio) => setAdvancedSettings(prev => ({ ...prev, carbonOffsetRatio: ratio }))}
                    />
                    
                    <div>
                        <label htmlFor="remittanceInfo" className="block text-sm font-medium text-gray-300">Remittance Information (ISO 20022 / DLT Metadata)</label>
                        <input
                            type="text"
                            name="remittanceInfo"
                            value={remittanceInfo}
                            onChange={(e) => setRemittanceInfo(e.target.value)}
                            className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white placeholder-gray-500"
                            placeholder="Invoice #12345, Project X funding, personal gift"
                        />
                        <p className="text-xs text-gray-500 mt-1">This information is secured and transmitted with your payment for full transparency.</p>
                    </div>

                    <AdvancedSchedulingPanel
                        scheduleRule={scheduleRule}
                        onRuleChange={setScheduleRule}
                        isScheduled={isScheduledPayment}
                        onToggleSchedule={setIsScheduledPayment}
                    />

                    <SecurityAuditDisplay auditResult={securityAuditResult} />

                    <button
                        type="submit"
                        disabled={!canProceedToReview || isLoadingFx || !securityAuditResult}
                        className={`w-full py-4 text-lg font-bold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300
                            ${paymentMethod === 'quantumpay' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30' :
                              paymentMethod === 'cashapp' ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30' :
                              paymentMethod === 'blockchain_dlt' ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30' :
                              'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'}`}
                    >
                        {securityAuditResult?.recommendations.length > 0 && securityAuditResult.amlCompliance !== 'pass' ? 'Review & Resolve Issues' : 'Proceed to Transaction Review'}
                    </button>
                </form>
            );
        case 2: // Review Step
            return (
                <div className="space-y-6">
                    <TransactionReviewPanel
                        amount={amount}
                        sourceCurrency={sourceCurrency}
                        targetCurrency={targetCurrency}
                        convertedAmount={convertedAmount}
                        fxRate={fxRate}
                        recipient={selectedRecipient || { id: 'manual', name: newRecipientData.name || searchTerm, kycStatus: newRecipientData.kycStatus, avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${newRecipientData.name || searchTerm}` }}
                        paymentMethod={paymentMethod}
                        remittanceInfo={remittanceInfo}
                        isScheduled={isScheduledPayment}
                        scheduleRule={scheduleRule}
                        advancedSettings={advancedSettings}
                        estimatedFees={estimatedFees}
                        totalAmountCharged={parseFloat(amount) + estimatedFees}
                        securityAudit={securityAuditResult}
                    />
                    <div className="flex justify-between items-center mt-6">
                        <button onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-full text-base text-gray-300 transition-all duration-200 flex items-center">
                            <i className="fas fa-arrow-left mr-2"></i> Back to Edit
                        </button>
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!canProceedToReview || securityAuditResult?.amlCompliance !== 'pass'}
                            className={`px-8 py-4 text-lg font-bold text-white rounded-full transition-all duration-300 flex items-center justify-center
                                ${paymentMethod === 'quantumpay' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30' :
                                  paymentMethod === 'cashapp' ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30' :
                                  paymentMethod === 'blockchain_dlt' ? 'bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30' :
                                  'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Confirm & Authenticate <i className="fas fa-lock ml-2"></i>
                        </button>
                    </div>
                </div>
            );
        default: return null;
    }
  };
  
  return (
      <>
        <Card title={`Send Money (Remitrax) - Step ${currentStep} of ${totalSteps}`}>
            {renderCurrentStep()}
        </Card>
        <BiometricModal
            isOpen={showBiometricModal}
            onSuccess={handleBiometricSuccess}
            onClose={handleBiometricClose}
            amount={amount}
            recipient={selectedRecipient || searchTerm}
            paymentMethod={paymentMethod}
            securityContext={userSecurityProfile.approvalRequiredBy && userSecurityProfile.approvalRequiredBy.length > 0 ? 'corporate' : 'personal'}
            mfAuthMethods={userSecurityProfile.mfAuthMethods}
            approvalRequiredBy={userSecurityProfile.approvalRequiredBy}
        />
    </>
  );
};

export default SendMoneyView;