# The Sending

This is the direction of energy. An act not of spending, but of transmission. It is the conscious projection of your resources from your own sphere into another, a deliberate and focused transfer of will. Each sending is an affirmation of connection, secured by the sacred geometry of cryptography and the absolute authority of your own biometric seal.

---

### A Fable for the Builder: The Seal of Intent

(To give is a profound act. It is to take a piece of your own accumulated life-energy and transmit it to another. An act so significant requires more than just a password. It requires a moment of true, undeniable intent. This `SendMoneyView` is the chamber for that moment, and the AI is its trusted notary.)

(We understood that the moment of transmission must be sacred and secure. That is why we built the `BiometricModal`. It is the final seal on your declared will. A password can be stolen. A key can be lost. But your face... your living, breathing identity... that is a truth that cannot be forged. When you look into that camera, you are not just authenticating. You are bearing witness to your own command.)

(The AI's logic in this moment is what we call the 'Confirmation of Intent.' It sees your face and understands that the architect of this financial workshop has appeared in person to issue a decree. The `QuantumLedgerAnimation` that follows is not just for show. It is a visualization of the AI's process: taking your sealed command, translating it into the immutable language of the ledger, and broadcasting it into the world. It is the scribe, carving your will into the stone of history.)

(And notice the choice of 'payment rails.' `QuantumPay`, the language of formal, institutional finance, with its ISO standards and remittance data. And `Cash App`, the language of the informal, social economy. The AI is bilingual. It understands that you must be able to speak both languages to navigate the modern world. It is your universal translator.)

(So this is not just a form to send money. It is a declaration. An act of will, witnessed and executed by a trusted agent. It is a system designed to ensure that when you choose to give, your intent is carried out with the speed of light and the security of a fortress.)

---
import React, { useState, useEffect, useReducer, useCallback, useMemo, useRef, createContext, useContext } from 'react';

// SECTION: TYPE DEFINITIONS
// ============================================================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'BTC' | 'ETH' | 'SOL';

export type UserTier = 'STANDARD' | 'PREMIUM' | 'QUANTUM';

export type PaymentRail = 'QUANTUM_PAY' | 'P2P' | 'CRYPTO';

export type TransactionStatus = 'PENDING' | 'CONFIRMING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REQUIRES_ACTION';

export type BiometricType = 'FACE_ID' | 'TOUCH_ID' | 'NONE';

export interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  tier: UserTier;
  kycStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  dailyLimit: number;
  monthlyLimit: number;
  country: string;
}

export interface Wallet {
  walletId: string;
  currency: CurrencyCode;
  balance: number;
  name: string;
  isCrypto: boolean;
}

export interface LinkedAccount {
  accountId: string;
  type: 'BANK' | 'CARD';
  provider: string;
  last4: string;
  currency: CurrencyCode;
}

export interface Contact {
  contactId: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  cryptoAddresses?: { network: 'BTC' | 'ETH' | 'SOL'; address: string }[];
}

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  timestamp: number;
}

export interface FeeStructure {
  percentage: number;
  fixed: number;
  networkFee?: number;
}

export interface TransactionDetails {
  sendAmount: number;
  sendCurrency: CurrencyCode;
  receiveAmount: number;
  receiveCurrency: CurrencyCode;
  exchangeRate: number;
  fees: number;
  totalDebit: number;
  estimatedDelivery: string;
}

export interface TransactionIntent {
  recipient: Contact;
  source: Wallet | LinkedAccount;
  paymentRail: PaymentRail;
  details: TransactionDetails;
  memo?: string;
  purposeCode?: string; // ISO 20022 purpose code
  isRecurring: boolean;
  recurrence?: RecurrenceRule;
}

export interface RecurrenceRule {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval: number;
    startDate: string;
    endDate?: string;
}

export interface TransactionResult {
  transactionId: string;
  status: TransactionStatus;
  message: string;
  timestamp: string;
  receiptUrl?: string;
  error?: {
    code: string;
    description: string;
  };
}

export interface CountryFinancialInfo {
  code: string;
  name: string;
  currency: CurrencyCode;
  requiresPurposeCode: boolean;
  supportedRails: PaymentRail[];
  ibanRequired?: boolean;
}

// SECTION: CONSTANTS & CONFIGURATION
// ============================================================================

export const APP_CONFIG = {
  API_BASE_URL: '/api/v1',
  BIOMETRIC_TIMEOUT_MS: 30000,
  DEFAULT_CURRENCY: 'USD' as CurrencyCode,
  MAX_MEMO_LENGTH: 280,
  POLLING_INTERVAL_MS: 5000,
};

export const UI_THEME = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F7',
    primary: '#007AFF',
    secondary: '#5856D6',
    text: '#000000',
    textSecondary: '#8A8A8E',
    error: '#FF3B30',
    success: '#34C759',
    border: '#C6C6C8',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    text: '#FFFFFF',
    textSecondary: '#8D8D93',
    error: '#FF453A',
    success: '#32D74B',
    border: '#38383A',
  },
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BTC_ADDRESS: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  SOL_ADDRESS: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  AMOUNT: /^\d*\.?\d{0,8}$/,
};

// SECTION: MOCK API & DATA
// ============================================================================

/**
 * A mock API layer to simulate backend interactions. In a real application,
 * this would be replaced with actual HTTP requests to a server.
 */
export const mockApi = {
  async getUserProfile(): Promise<UserProfile> {
    console.log('API: Fetching user profile...');
    return new Promise(resolve => setTimeout(() => resolve({
      userId: 'user-123',
      username: 'archangel',
      fullName: 'Michael Architect',
      email: 'michael@builder.io',
      avatarUrl: 'https://i.pravatar.cc/150?u=user-123',
      tier: 'QUANTUM',
      kycStatus: 'VERIFIED',
      dailyLimit: 100000,
      monthlyLimit: 500000,
      country: 'US',
    }), 500));
  },

  async getWallets(): Promise<Wallet[]> {
    console.log('API: Fetching wallets...');
    return new Promise(resolve => setTimeout(() => resolve([
      { walletId: 'w-usd-01', currency: 'USD', balance: 150234.56, name: 'Primary USD Balance', isCrypto: false },
      { walletId: 'w-eur-01', currency: 'EUR', balance: 8900.12, name: 'Euro Balance', isCrypto: false },
      { walletId: 'w-btc-01', currency: 'BTC', balance: 5.12345678, name: 'Bitcoin Vault', isCrypto: true },
      { walletId: 'w-eth-01', currency: 'ETH', balance: 89.98765432, name: 'Ethereum Wallet', isCrypto: true },
    ]), 700));
  },

  async getLinkedAccounts(): Promise<LinkedAccount[]> {
    console.log('API: Fetching linked accounts...');
    return new Promise(resolve => setTimeout(() => resolve([
      { accountId: 'la-bank-01', type: 'BANK', provider: 'Quantum Financial', last4: '8876', currency: 'USD' },
      { accountId: 'la-card-01', type: 'CARD', provider: 'Aeterna Visa', last4: '4567', currency: 'USD' },
      { accountId: 'la-bank-02', type: 'BANK', provider: 'European Central Bank', last4: '1234', currency: 'EUR' },
    ]), 800));
  },

  async getContacts(): Promise<Contact[]> {
    console.log('API: Fetching contacts...');
    return new Promise(resolve => setTimeout(() => resolve([
      { contactId: 'c-1', name: 'Alice', username: 'alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice', email: 'alice@example.com' },
      { contactId: 'c-2', name: 'Bob', username: 'bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob', phone: '+1234567890' },
      { contactId: 'c-3', name: 'Charlie', username: 'charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', cryptoAddresses: [{ network: 'ETH', address: '0x1234567890123456789012345678901234567890' }] },
      { contactId: 'c-4', name: 'Diana', username: 'diana', avatarUrl: 'https://i.pravatar.cc/150?u=diana', email: 'diana@corp.com' },
      { contactId: 'c-5', name: 'Eva', username: 'eva', avatarUrl: 'https://i.pravatar.cc/150?u=eva', cryptoAddresses: [{ network: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }, { network: 'SOL', address: 'SoL1iAH1pfeGfA6m2QcRj2h4g35q2xV5z9yJ6w7u8Fm' }] },
    ]), 1000));
  },

  async searchRecipients(query: string): Promise<Contact[]> {
     console.log(`API: Searching recipients for "${query}"...`);
     const allContacts = await this.getContacts();
     const lowerQuery = query.toLowerCase();
     if (!lowerQuery) return [];
     return new Promise(resolve => setTimeout(() => resolve(
        allContacts.filter(c =>
            c.name.toLowerCase().includes(lowerQuery) ||
            c.username?.toLowerCase().includes(lowerQuery) ||
            c.email?.toLowerCase().includes(lowerQuery) ||
            c.phone?.includes(lowerQuery)
        ).concat(
            // Add a mock external result
            lowerQuery.includes('@') && REGEX_PATTERNS.EMAIL.test(lowerQuery) ? [{ contactId: `ext-${Date.now()}`, name: `External User`, email: lowerQuery }] : []
        )
     ), 400));
  },

  async getExchangeRate(from: CurrencyCode, to: CurrencyCode): Promise<ExchangeRate> {
    console.log(`API: Fetching exchange rate for ${from} -> ${to}...`);
    // In a real app, this would be a live rate. Here we use mock values.
    const mockRates: { [key: string]: number } = {
      'USD-EUR': 0.92, 'EUR-USD': 1.08, 'USD-GBP': 0.79, 'GBP-USD': 1.27,
      'USD-JPY': 147.5, 'JPY-USD': 0.0068, 'USD-BTC': 0.000023, 'BTC-USD': 43500,
      'USD-ETH': 0.00045, 'ETH-USD': 2250, 'EUR-BTC': 0.000021, 'BTC-EUR': 47000,
    };
    const rate = mockRates[`${from}-${to}`] || 1;
    return new Promise(resolve => setTimeout(() => resolve({
      from,
      to,
      rate: rate + (Math.random() - 0.5) * 0.01 * rate, // add tiny fluctuation
      timestamp: Date.now(),
    }), 300));
  },

  async calculateFees(intent: Partial<TransactionIntent>): Promise<FeeStructure> {
    console.log(`API: Calculating fees...`);
    // Complex fee logic based on user tier, rail, amount, etc.
    return new Promise(resolve => setTimeout(() => {
        let percentage = 0.01; // 1% base
        let fixed = 0.50; // $0.50 base

        if (intent.paymentRail === 'P2P') {
            percentage = 0;
            fixed = 0; // P2P is free
        } else if (intent.paymentRail === 'QUANTUM_PAY') {
            percentage = 0.005; // 0.5% for bank transfers
            fixed = 2.00;
        } else if (intent.paymentRail === 'CRYPTO') {
            percentage = 0.001; // 0.1% for crypto
            fixed = 0;
            // Add a mock network fee
            return resolve({ percentage: 0, fixed: 0, networkFee: 0.0001 });
        }

        // Tier benefits
        if (state.user?.tier === 'PREMIUM') {
            percentage *= 0.5;
            fixed *= 0.5;
        } else if (state.user?.tier === 'QUANTUM') {
            percentage = 0;
            fixed = 0; // Quantum users have no fees on fiat
        }

        resolve({ percentage, fixed });
    }, 450));
  },

  async submitTransaction(intent: TransactionIntent): Promise<TransactionResult> {
    console.log(`API: Submitting transaction...`);
    // Simulate complex backend processing, AML checks, etc.
    return new Promise((resolve, reject) => setTimeout(() => {
      if (Math.random() < 0.05) { // 5% chance of random failure
        reject({
          transactionId: `tx-fail-${Date.now()}`,
          status: 'FAILED',
          message: 'Transaction failed due to an unexpected network error.',
          error: { code: 'NETWORK_ERROR', description: 'Could not connect to payment processor.' },
        });
      } else if (intent.details.totalDebit > (state.user?.dailyLimit ?? 100000)) {
         reject({
          transactionId: `tx-fail-${Date.now()}`,
          status: 'FAILED',
          message: 'Transaction exceeds your daily limit.',
          error: { code: 'LIMIT_EXCEEDED', description: `Attempted to send ${intent.details.totalDebit}, but daily limit is ${state.user?.dailyLimit}.` },
        });
      } else {
        resolve({
          transactionId: `tx-succ-${Date.now()}`,
          status: 'SUCCESS',
          message: 'Your transaction has been successfully processed.',
          timestamp: new Date().toISOString(),
          receiptUrl: `/receipts/tx-succ-${Date.now()}`,
        });
      }
    }, 2500));
  },

  async getSupportedCountries(): Promise<CountryFinancialInfo[]> {
    return new Promise(resolve => setTimeout(() => resolve([
        { code: 'US', name: 'United States', currency: 'USD', requiresPurposeCode: false, supportedRails: ['QUANTUM_PAY', 'P2P', 'CRYPTO'] },
        { code: 'GB', name: 'United Kingdom', currency: 'GBP', requiresPurposeCode: false, supportedRails: ['QUANTUM_PAY', 'P2P', 'CRYPTO'] },
        { code: 'DE', name: 'Germany', currency: 'EUR', requiresPurposeCode: true, supportedRails: ['QUANTUM_PAY', 'P2P'], ibanRequired: true },
        { code: 'FR', name: 'France', currency: 'EUR', requiresPurposeCode: true, supportedRails: ['QUANTUM_PAY', 'P2P'], ibanRequired: true },
        { code: 'CA', name: 'Canada', currency: 'CAD', requiresPurposeCode: false, supportedRails: ['QUANTUM_PAY', 'P2P', 'CRYPTO'] },
        { code: 'JP', name: 'Japan', currency: 'JPY', requiresPurposeCode: true, supportedRails: ['QUANTUM_PAY'] },
        { code: 'AU', name: 'Australia', currency: 'AUD', requiresPurposeCode: false, supportedRails: ['QUANTUM_PAY', 'P2P', 'CRYPTO'] },
    ]), 600));
  }
};

// SECTION: LOCALIZATION (i18n)
// ============================================================================

export type Locale = 'en-US' | 'es-ES' | 'de-DE' | 'ja-JP';

export const translations: Record<Locale, Record<string, string>> = {
  'en-US': {
    'sendMoney.title': 'Send Money',
    'sendMoney.description': 'A conscious projection of your resources.',
    'recipient.label': 'To',
    'recipient.placeholder': 'Enter name, @username, email, or address',
    'amount.label': 'Amount',
    'source.label': 'From',
    'rail.select': 'Select Payment Method',
    'rail.QUANTUM_PAY': 'QuantumPay (Bank Transfer)',
    'rail.P2P': 'P2P Transfer',
    'rail.CRYPTO': 'Crypto Transfer',
    'memo.label': 'Memo (Optional)',
    'memo.placeholder': 'For dinner, rent, etc.',
    'button.review': 'Review Transaction',
    'button.confirmAndSend': 'Confirm & Send',
    'button.sending': 'Sending...',
    'button.done': 'Done',
    'review.title': 'Confirm Your Intent',
    'review.recipient': 'You are sending to',
    'review.amountToSend': 'Amount to Send',
    'review.exchangeRate': 'Exchange Rate',
    'review.fee': 'Transaction Fee',
    'review.totalDebit': 'Total to be Debited',
    'review.recipientGets': 'Recipient Will Receive',
    'review.delivery': 'Estimated Delivery',
    'biometric.title': 'Seal Your Intent',
    'biometric.descriptionFaceID': 'Authenticate with Face ID to complete this transaction.',
    'biometric.descriptionTouchID': 'Authenticate with Touch ID to complete this transaction.',
    'success.title': 'Energy Transmitted',
    'success.message': 'Your transaction has been successfully broadcast to the ledger.',
    'error.title': 'Transmission Failed',
  },
  'es-ES': {
    'sendMoney.title': 'Enviar Dinero',
    'sendMoney.description': 'Una proyección consciente de tus recursos.',
    'recipient.label': 'Para',
    'recipient.placeholder': 'Introduce nombre, @usuario, email o dirección',
    'amount.label': 'Cantidad',
    'source.label': 'Desde',
    'rail.select': 'Seleccionar Método de Pago',
    'rail.QUANTUM_PAY': 'QuantumPay (Transferencia Bancaria)',
    'rail.P2P': 'Transferencia P2P',
    'rail.CRYPTO': 'Transferencia Cripto',
    'memo.label': 'Nota (Opcional)',
    'memo.placeholder': 'Para la cena, alquiler, etc.',
    'button.review': 'Revisar Transacción',
    'button.confirmAndSend': 'Confirmar y Enviar',
    'button.sending': 'Enviando...',
    'button.done': 'Hecho',
    'review.title': 'Confirma Tu Intención',
    'review.recipient': 'Estás enviando a',
    'review.amountToSend': 'Cantidad a Enviar',
    'review.exchangeRate': 'Tasa de Cambio',
    'review.fee': 'Comisión de Transacción',
    'review.totalDebit': 'Total a Debitar',
    'review.recipientGets': 'El Destinatario Recibirá',
    'review.delivery': 'Entrega Estimada',
    'biometric.title': 'Sella Tu Intención',
    'biometric.descriptionFaceID': 'Autentica con Face ID para completar esta transacción.',
    'biometric.descriptionTouchID': 'Autentica con Touch ID para completar esta transacción.',
    'success.title': 'Energía Transmitida',
    'success.message': 'Tu transacción ha sido transmitida exitosamente al registro.',
    'error.title': 'Transmisión Fallida',
  },
  'de-DE': {
    'sendMoney.title': 'Geld Senden',
    'sendMoney.description': 'Eine bewusste Projektion Ihrer Ressourcen.',
    'recipient.label': 'An',
    'recipient.placeholder': 'Name, @Benutzername, E-Mail oder Adresse eingeben',
    'amount.label': 'Betrag',
    'source.label': 'Von',
    'rail.select': 'Zahlungsmethode Wählen',
    'rail.QUANTUM_PAY': 'QuantumPay (Banküberweisung)',
    'rail.P2P': 'P2P-Überweisung',
    'rail.CRYPTO': 'Krypto-Überweisung',
    'memo.label': 'Memo (Optional)',
    'memo.placeholder': 'Für Abendessen, Miete, etc.',
    'button.review': 'Transaktion Überprüfen',
    'button.confirmAndSend': 'Bestätigen & Senden',
    'button.sending': 'Senden...',
    'button.done': 'Fertig',
    'review.title': 'Bestätigen Sie Ihre Absicht',
    'review.recipient': 'Sie senden an',
    'review.amountToSend': 'Zu sendender Betrag',
    'review.exchangeRate': 'Wechselkurs',
    'review.fee': 'Transaktionsgebühr',
    'review.totalDebit': 'Gesamtbetrag der Abbuchung',
    'review.recipientGets': 'Empfänger Erhält',
    'review.delivery': 'Voraussichtliche Lieferung',
    'biometric.title': 'Versiegeln Sie Ihre Absicht',
    'biometric.descriptionFaceID': 'Authentifizieren Sie sich mit Face ID, um diese Transaktion abzuschließen.',
    'biometric.descriptionTouchID': 'Authentifizieren Sie sich mit Touch ID, um diese Transaktion abzuschließen.',
    'success.title': 'Energie Übertragen',
    'success.message': 'Ihre Transaktion wurde erfolgreich in das Ledger übertragen.',
    'error.title': 'Übertragung Fehlgeschlagen',
  },
  'ja-JP': {
    'sendMoney.title': '送金',
    'sendMoney.description': 'リソースの意識的な投影。',
    'recipient.label': '宛先',
    'recipient.placeholder': '名前、@ユーザー名、メールアドレス、またはアドレスを入力',
    'amount.label': '金額',
    'source.label': '差出人',
    'rail.select': '支払方法を選択',
    'rail.QUANTUM_PAY': 'QuantumPay（銀行振込）',
    'rail.P2P': 'P2P送金',
    'rail.CRYPTO': '暗号資産送金',
    'memo.label': 'メモ（任意）',
    'memo.placeholder': '夕食、家賃など',
    'button.review': '取引の確認',
    'button.confirmAndSend': '確認して送信',
    'button.sending': '送信中...',
    'button.done': '完了',
    'review.title': '意図を確認する',
    'review.recipient': 'への送金',
    'review.amountToSend': '送金額',
    'review.exchangeRate': '為替レート',
    'review.fee': '取引手数料',
    'review.totalDebit': '引き落とし合計',
    'review.recipientGets': '受取人の受取額',
    'review.delivery': 'お届け予定',
    'biometric.title': '意図を封印する',
    'biometric.descriptionFaceID': 'この取引を完了するには、Face IDで認証してください。',
    'biometric.descriptionTouchID': 'この取引を完了するには、Touch IDで認証してください。',
    'success.title': 'エネルギー伝送完了',
    'success.message': 'あなたの取引は台帳に正常にブロードキャストされました。',
    'error.title': '伝送失敗',
  },
};

export const useTranslation = (locale: Locale = 'en-US') => {
  return useCallback((key: string) => {
    return translations[locale][key] || key;
  }, [locale]);
};

// SECTION: SVG ICONS
// ============================================================================

export const IconArrowDown = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const IconArrowRight = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const IconCheckCircle = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.374C6.51168 20.626 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 2.00075 16.07 2.91" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const IconAlertTriangle = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.29 3.86L1.82 18C1.62319 18.3343 1.52136 18.7144 1.52331 19.099C1.52525 19.4836 1.63085 19.8601 1.82917 20.1918C2.02749 20.5235 2.31173 20.7979 2.65191 20.9871C2.99209 21.1763 3.37482 21.2743 3.76 21.27H20.24C20.6252 21.2743 21.0079 21.1763 21.3481 20.9871C21.6883 20.7979 21.9725 20.5235 22.1708 20.1918C22.3692 19.8601 22.4748 19.4836 22.4767 19.099C22.4786 18.7144 22.3768 18.3343 22.18 18L13.71 3.86C13.5145 3.52536 13.2361 3.25139 12.8941 3.064C12.5521 2.87661 12.168 2.78393 11.775 2.78393C11.382 2.78393 10.9979 2.87661 10.6559 3.064C10.3139 3.25139 10.0355 3.52536 9.84 3.86H10.29Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const IconFaceID = ({ className }: { className?: string }) => (
    <svg className={className} width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8V6C4 4.89543 4.89543 4 6 4H8"/>
        <path d="M4 16V18C4 19.1046 4.89543 20 6 20H8"/>
        <path d="M16 4H18C19.1046 4 20 4.89543 20 6V8"/>
        <path d="M16 20H18C19.1046 20 20 19.1046 20 18V16"/>
        <path d="M9 10H9.01"/>
        <path d="M15 10H15.01"/>
        <path d="M9.5 15C10.3284 16.1046 11.6716 16.1046 12.5 15"/>
    </svg>
);

export const IconSpinner = ({ className }: { className?: string }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
        <style>
            {`
            .spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}
            .spinner_MX3L{transform-origin:center;animation:spinner_zKoa 2s linear infinite;animation-delay:-.5s}
            .spinner_qM83{transform-origin:center;animation:spinner_zKoa 2s linear infinite;animation-delay:-1s}
            .spinner_eUgh{transform-origin:center;animation:spinner_zKoa 2s linear infinite;animation-delay:-1.5s}
            @keyframes spinner_zKoa{100%{transform:rotate(360deg)}}
            `}
        </style>
        <g className="spinner_V8m1">
            <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="60 100"></circle>
        </g>
    </svg>
);


// SECTION: STATE MANAGEMENT (useReducer)
// ============================================================================

export type SendMoneyStep = 'FORM' | 'REVIEW' | 'BIOMETRIC' | 'PROCESSING' | 'RESULT';

export interface SendMoneyState {
    step: SendMoneyStep;
    isLoading: boolean;
    errorMessage: string | null;
    
    // Data
    user: UserProfile | null;
    wallets: (Wallet | LinkedAccount)[];
    contacts: Contact[];
    
    // Form Inputs
    recipientQuery: string;
    selectedRecipient: Contact | null;
    amount: string;
    sendCurrency: CurrencyCode;
    receiveCurrency: CurrencyCode;
    selectedSourceId: string | null;
    memo: string;
    paymentRail: PaymentRail;

    // Calculated values
    transactionIntent: TransactionIntent | null;
    transactionResult: TransactionResult | null;
}

export const initialState: SendMoneyState = {
    step: 'FORM',
    isLoading: true,
    errorMessage: null,
    user: null,
    wallets: [],
    contacts: [],
    recipientQuery: '',
    selectedRecipient: null,
    amount: '',
    sendCurrency: APP_CONFIG.DEFAULT_CURRENCY,
    receiveCurrency: APP_CONFIG.DEFAULT_CURRENCY,
    selectedSourceId: null,
    memo: '',
    paymentRail: 'P2P',
    transactionIntent: null,
    transactionResult: null,
};

export type Action =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: UserProfile; wallets: (Wallet | LinkedAccount)[]; contacts: Contact[] } }
  | { type: 'INITIALIZE_FAILURE'; payload: string }
  | { type: 'SET_STEP'; payload: SendMoneyStep }
  | { type: 'UPDATE_FORM_FIELD'; payload: { field: keyof SendMoneyState; value: any } }
  | { type: 'SELECT_RECIPIENT'; payload: Contact }
  | { type: 'CLEAR_RECIPIENT' }
  | { type: 'CREATE_INTENT_START' }
  | { type: 'CREATE_INTENT_SUCCESS'; payload: TransactionIntent }
  | { type: 'CREATE_INTENT_FAILURE'; payload: string }
  | { type: 'SUBMIT_TRANSACTION_START' }
  | { type: 'SUBMIT_TRANSACTION_SUCCESS'; payload: TransactionResult }
  | { type: 'SUBMIT_TRANSACTION_FAILURE'; payload: { message: string, result: TransactionResult } }
  | { type: 'RESET_FORM' };

export function sendMoneyReducer(state: SendMoneyState, action: Action): SendMoneyState {
    switch (action.type) {
        case 'INITIALIZE_START':
            return { ...state, isLoading: true, errorMessage: null };
        case 'INITIALIZE_SUCCESS':
            return { 
                ...state, 
                isLoading: false, 
                user: action.payload.user, 
                wallets: action.payload.wallets, 
                contacts: action.payload.contacts,
                selectedSourceId: action.payload.wallets[0]?.walletId || action.payload.wallets[0]?.accountId
            };
        case 'INITIALIZE_FAILURE':
            return { ...state, isLoading: false, errorMessage: action.payload };
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'UPDATE_FORM_FIELD':
            return { ...state, [action.payload.field]: action.payload.value };
        case 'SELECT_RECIPIENT':
            return { ...state, selectedRecipient: action.payload, recipientQuery: action.payload.name };
        case 'CLEAR_RECIPIENT':
            return { ...state, selectedRecipient: null, recipientQuery: '' };
        case 'CREATE_INTENT_START':
            return { ...state, isLoading: true, errorMessage: null };
        case 'CREATE_INTENT_SUCCESS':
            return { ...state, isLoading: false, transactionIntent: action.payload, step: 'REVIEW' };
        case 'CREATE_INTENT_FAILURE':
            return { ...state, isLoading: false, errorMessage: action.payload };
        case 'SUBMIT_TRANSACTION_START':
            return { ...state, isLoading: true, errorMessage: null, step: 'PROCESSING' };
        case 'SUBMIT_TRANSACTION_SUCCESS':
            return { ...state, isLoading: false, transactionResult: action.payload, step: 'RESULT' };
        case 'SUBMIT_TRANSACTION_FAILURE':
            return { ...state, isLoading: false, errorMessage: action.payload.message, transactionResult: action.payload.result, step: 'RESULT' };
        case 'RESET_FORM':
            return {
                ...initialState,
                // Persist loaded data
                user: state.user,
                wallets: state.wallets,
                contacts: state.contacts,
                isLoading: false,
            };
        default:
            return state;
    }
}

// SECTION: CONTEXT FOR THEME AND LOCALE
// ============================================================================

export interface AppContextType {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [locale, setLocale] = useState<Locale>('en-US');
    const t = useTranslation(locale);

    const contextValue = useMemo(() => ({
        theme, setTheme, locale, setLocale, t
    }), [theme, locale, t]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// SECTION: HELPER & UTILITY COMPONENTS
// ============================================================================

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    const { theme } = useAppContext();
    const colors = UI_THEME[theme];

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: colors.surface,
                padding: '2rem',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '500px',
                border: `1px solid ${colors.border}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, color: colors.text }}>{title}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: colors.text, fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({ children, text }) => {
    const [visible, setVisible] = useState(false);
    const { theme } = useAppContext();
    const colors = UI_THEME[theme];

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}
             onMouseEnter={() => setVisible(true)}
             onMouseLeave={() => setVisible(false)}>
            {children}
            {visible && (
                <div style={{
                    position: 'absolute',
                    bottom: '125%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: colors.text,
                    color: colors.background,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    zIndex: 10,
                    width: 'max-content',
                    fontSize: '12px',
                }}>
                    {text}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: `5px solid ${colors.text}`,
                    }} />
                </div>
            )}
        </div>
    );
};


// SECTION: SUB-COMPONENTS
// ============================================================================

export interface RecipientSelectorProps {
    query: string;
    onQueryChange: (query: string) => void;
    onSelect: (contact: Contact) => void;
    contacts: Contact[];
    selected: Contact | null;
    onClear: () => void;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({ query, onQueryChange, onSelect, contacts, selected, onClear }) => {
    const { t, theme } = useAppContext();
    const colors = UI_THEME[theme];
    const [searchResults, setSearchResults] = useState<Contact[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query && !selected) {
                setIsSearching(true);
                const results = await mockApi.searchRecipients(query);
                setSearchResults(results);
                setIsSearching(false);
                setIsDropdownOpen(true);
            } else {
                setSearchResults([]);
                setIsDropdownOpen(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query, selected]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleSelect = (contact: Contact) => {
        onSelect(contact);
        setIsDropdownOpen(false);
    }

    if (selected) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', padding: '12px',
                backgroundColor: colors.surface, borderRadius: '8px',
                border: `1px solid ${colors.border}`
            }}>
                <img src={selected.avatarUrl || `https://i.pravatar.cc/150?u=${selected.contactId}`} alt={selected.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '12px' }}/>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: colors.text }}>{selected.name}</div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                        {selected.username ? `@${selected.username}` : selected.email || selected.phone}
                    </div>
                </div>
                <button onClick={onClear} style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onFocus={() => query && setIsDropdownOpen(true)}
                    placeholder={t('recipient.placeholder')}
                    style={{
                        width: '100%',
                        padding: '16px',
                        fontSize: '16px',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        backgroundColor: colors.surface,
                        color: colors.text,
                        boxSizing: 'border-box'
                    }}
                />
                {isSearching && <div style={{position: 'absolute', right: 12, top: 12}}><IconSpinner className="spinner" /></div>}
            </div>

            {isDropdownOpen && (searchResults.length > 0 || contacts.length > 0) && (
                <div style={{
                    position: 'absolute', top: '105%', left: 0, right: 0,
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 10
                }}>
                    {searchResults.length > 0 && 
                        <div>
                            <h4 style={{padding: '8px 12px', margin: 0, color: colors.textSecondary, fontSize: 12}}>Search Results</h4>
                            {searchResults.map(contact => (
                                <div key={contact.contactId} onClick={() => handleSelect(contact)} style={{ display: 'flex', alignItems: 'center', padding: '12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}>
                                    <img src={contact.avatarUrl || `https://i.pravatar.cc/150?u=${contact.contactId}`} alt={contact.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '12px' }}/>
                                    <div>
                                        <div style={{ fontWeight: '600', color: colors.text }}>{contact.name}</div>
                                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>{contact.username ? `@${contact.username}` : contact.email || contact.phone}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                     {query.length === 0 && contacts.length > 0 &&
                        <div>
                            <h4 style={{padding: '8px 12px', margin: 0, color: colors.textSecondary, fontSize: 12}}>Recent Contacts</h4>
                            {contacts.slice(0, 5).map(contact => (
                                <div key={contact.contactId} onClick={() => handleSelect(contact)} style={{ display: 'flex', alignItems: 'center', padding: '12px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}` }}>
                                    <img src={contact.avatarUrl || `https://i.pravatar.cc/150?u=${contact.contactId}`} alt={contact.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: '12px' }}/>
                                    <div>
                                        <div style={{ fontWeight: '600', color: colors.text }}>{contact.name}</div>
                                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>{contact.username ? `@${contact.username}` : contact.email || contact.phone}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            )}
        </div>
    );
};

export interface AmountInputProps {
    amount: string;
    onAmountChange: (amount: string) => void;
    currency: CurrencyCode;
    onCurrencyChange: (currency: CurrencyCode) => void;
    wallets: (Wallet | LinkedAccount)[];
    user: UserProfile | null;
}

export const AmountInput: React.FC<AmountInputProps> = ({ amount, onAmountChange, currency, onCurrencyChange, wallets, user }) => {
    const { t, theme } = useAppContext();
    const colors = UI_THEME[theme];
    const availableCurrencies = useMemo(() => Array.from(new Set(wallets.map(w => w.currency))), [wallets]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (REGEX_PATTERNS.AMOUNT.test(value)) {
            onAmountChange(value);
        }
    };
    
    const selectedWallet = wallets.find(w => w.currency === currency);
    const balance = (selectedWallet as Wallet)?.balance;

    return (
        <div style={{
            padding: '16px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            backgroundColor: colors.surface
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: colors.textSecondary, fontSize: '14px' }}>{t('amount.label')}</span>
                <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    Balance: {balance !== undefined ? `${balance.toFixed(4)} ${currency}` : 'N/A'}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    style={{
                        flex: 1,
                        fontSize: '36px',
                        fontWeight: 'bold',
                        border: 'none',
                        background: 'transparent',
                        color: colors.text,
                        outline: 'none',
                        width: '100%',
                    }}
                />
                <select
                    value={currency}
                    onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                    style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        padding: '8px',
                        background: colors.background,
                        color: colors.text,
                        cursor: 'pointer',
                    }}
                >
                    {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>
    );
};

export const QuantumLedgerAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const { theme } = useAppContext();
    const colors = UI_THEME[theme];
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        let particles: any[] = [];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 2 + 1,
            });
        }

        let progress = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw particles and lines
            ctx.fillStyle = colors.primary;
            ctx.strokeStyle = colors.primary;
            ctx.lineWidth = 0.5;

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw progress bar
            progress += 0.005;
            if (progress > 1) progress = 1;
            
            ctx.strokeStyle = colors.success;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 50, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
            ctx.stroke();

            if (progress >= 1) {
                setTimeout(onComplete, 500);
            } else {
                animationFrameId = requestAnimationFrame(draw);
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [colors, onComplete]);


    return (
        <div style={{ textAlign: 'center', color: colors.text }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '200px' }}></canvas>
            <p>Broadcasting to the Quantum Ledger...</p>
            <p style={{ color: colors.textSecondary, fontSize: '14px' }}>Securing transaction with cryptographic affirmation.</p>
        </div>
    );
};


// SECTION: VIEW COMPONENTS FOR EACH STEP
// ============================================================================

export const FormStep: React.FC<{ state: SendMoneyState, dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const { t } = useAppContext();
    const canReview = useMemo(() => {
        return state.selectedRecipient && parseFloat(state.amount) > 0 && state.selectedSourceId;
    }, [state.selectedRecipient, state.amount, state.selectedSourceId]);

    const handleReview = async () => {
        dispatch({ type: 'CREATE_INTENT_START' });
        try {
            const { amount, sendCurrency, selectedRecipient, selectedSourceId, paymentRail, memo } = state;
            if (!selectedRecipient || !selectedSourceId) throw new Error("Missing required fields");

            const source = state.wallets.find(w => (w as Wallet).walletId === selectedSourceId || (w as LinkedAccount).accountId === selectedSourceId);
            if (!source) throw new Error("Invalid source account");

            const receiveCurrency = sendCurrency; // Simplification for now
            const rate = await mockApi.getExchangeRate(sendCurrency, receiveCurrency);
            const feesResponse = await mockApi.calculateFees({ paymentRail });
            const sendAmount = parseFloat(amount);
            const fees = sendAmount * feesResponse.percentage + feesResponse.fixed + (feesResponse.networkFee || 0);
            const receiveAmount = sendAmount * rate.rate;
            const totalDebit = sendAmount + fees;

            const intent: TransactionIntent = {
                recipient: selectedRecipient,
                source,
                paymentRail,
                memo,
                isRecurring: false,
                details: {
                    sendAmount,
                    sendCurrency,
                    receiveAmount,
                    receiveCurrency,
                    exchangeRate: rate.rate,
                    fees,
                    totalDebit,
                    estimatedDelivery: paymentRail === 'P2P' ? 'Instant' : paymentRail === 'CRYPTO' ? '~10 minutes' : '1-3 business days',
                }
            };

            dispatch({ type: 'CREATE_INTENT_SUCCESS', payload: intent });
        } catch (error: any) {
            dispatch({ type: 'CREATE_INTENT_FAILURE', payload: error.message });
        }
    };
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>{t('recipient.label')}</label>
                <RecipientSelector
                    query={state.recipientQuery}
                    onQueryChange={(value) => dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field: 'recipientQuery', value }})}
                    onSelect={(contact) => dispatch({ type: 'SELECT_RECIPIENT', payload: contact })}
                    contacts={state.contacts}
                    selected={state.selectedRecipient}
                    onClear={() => dispatch({ type: 'CLEAR_RECIPIENT' })}
                />
            </div>
            
            <div>
                 <AmountInput
                    amount={state.amount}
                    onAmountChange={(value) => dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field: 'amount', value }})}
                    currency={state.sendCurrency}
                    onCurrencyChange={(value) => dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field: 'sendCurrency', value }})}
                    wallets={state.wallets}
                    user={state.user}
                />
            </div>
            
            <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>{t('rail.select')}</label>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    {(['P2P', 'QUANTUM_PAY', 'CRYPTO'] as PaymentRail[]).map(rail => (
                        <button key={rail}
                            onClick={() => dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field: 'paymentRail', value: rail }})}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer',
                                border: `2px solid ${state.paymentRail === rail ? UI_THEME.dark.primary : UI_THEME.dark.border}`,
                                background: state.paymentRail === rail ? UI_THEME.dark.primary : 'transparent',
                                color: UI_THEME.dark.text,
                                fontWeight: state.paymentRail === rail ? 'bold' : 'normal',
                            }}>
                            {t(`rail.${rail}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>{t('memo.label')}</label>
                <input
                    type="text"
                    value={state.memo}
                    onChange={(e) => dispatch({ type: 'UPDATE_FORM_FIELD', payload: { field: 'memo', value: e.target.value }})}
                    placeholder={t('memo.placeholder')}
                    maxLength={APP_CONFIG.MAX_MEMO_LENGTH}
                    style={{
                        width: '100%', padding: '16px', fontSize: '16px',
                        border: `1px solid ${UI_THEME.dark.border}`, borderRadius: '8px',
                        backgroundColor: UI_THEME.dark.surface, color: UI_THEME.dark.text,
                        boxSizing: 'border-box'
                    }}
                />
            </div>
            
            <button
                onClick={handleReview}
                disabled={!canReview || state.isLoading}
                style={{
                    padding: '16px', fontSize: '18px', fontWeight: 'bold',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: canReview ? UI_THEME.dark.primary : UI_THEME.dark.border,
                    color: UI_THEME.dark.background,
                    opacity: state.isLoading ? 0.7 : 1,
                }}>
                {state.isLoading ? <IconSpinner /> : t('button.review')}
            </button>
        </div>
    );
};

export const ReviewStep: React.FC<{ state: SendMoneyState, dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const { t, theme } = useAppContext();
    const colors = UI_THEME[theme];
    const { transactionIntent } = state;

    if (!transactionIntent) {
        return <div>Error: No transaction details to review.</div>;
    }

    const { recipient, details } = transactionIntent;
    const detailItems = [
        { label: t('review.recipient'), value: recipient.name },
        { label: t('review.amountToSend'), value: `${details.sendAmount.toFixed(2)} ${details.sendCurrency}` },
        { label: t('review.exchangeRate'), value: `1 ${details.sendCurrency} = ${details.exchangeRate.toFixed(4)} ${details.receiveCurrency}` },
        { label: t('review.fee'), value: `${details.fees.toFixed(2)} ${details.sendCurrency}` },
        { label: t('review.delivery'), value: details.estimatedDelivery },
        { label: t('review.recipientGets'), value: `~ ${details.receiveAmount.toFixed(2)} ${details.receiveCurrency}`, isBold: true },
        { label: t('review.totalDebit'), value: `${details.totalDebit.toFixed(2)} ${details.sendCurrency}`, isBold: true },
    ];
    
    return (
        <div style={{ color: colors.text }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('review.title')}</h2>
            <div style={{ 
                border: `1px solid ${colors.border}`, 
                borderRadius: '12px', 
                padding: '24px', 
                backgroundColor: colors.surface 
            }}>
                {detailItems.map(({ label, value, isBold }) => (
                    <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', padding: '12px 0',
                        borderBottom: `1px solid ${colors.border}`,
                    }}>
                        <span style={{ color: colors.textSecondary }}>{label}</span>
                        <span style={{ fontWeight: isBold ? 'bold' : 'normal' }}>{value}</span>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => dispatch({ type: 'SET_STEP', payload: 'FORM' })}
                    style={{
                        flex: 1, padding: '16px', fontSize: '18px',
                        border: `1px solid ${colors.border}`, borderRadius: '8px',
                        cursor: 'pointer', backgroundColor: 'transparent', color: colors.text,
                    }}>
                    Back
                </button>
                <button
                    onClick={() => dispatch({ type: 'SET_STEP', payload: 'BIOMETRIC' })}
                    style={{
                        flex: 2, padding: '16px', fontSize: '18px', fontWeight: 'bold',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        backgroundColor: colors.primary, color: colors.background,
                    }}>
                    {t('button.confirmAndSend')}
                </button>
            </div>
        </div>
    );
};

export const BiometricStep: React.FC<{ state: SendMoneyState, dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const { t, theme } = useAppContext();
    const colors = UI_THEME[theme];
    const biometricType: BiometricType = 'FACE_ID'; // Mock device capability

    useEffect(() => {
        // Simulate biometric scan
        const timer = setTimeout(() => {
            if (state.transactionIntent) {
                dispatch({ type: 'SUBMIT_TRANSACTION_START' });
                mockApi.submitTransaction(state.transactionIntent)
                    .then(result => {
                        dispatch({ type: 'SUBMIT_TRANSACTION_SUCCESS', payload: result });
                    })
                    .catch(errorResult => {
                        dispatch({ type: 'SUBMIT_TRANSACTION_FAILURE', payload: { message: errorResult.message, result: errorResult }});
                    });
            }
        }, 3000); // Simulate 3 second scan

        return () => clearTimeout(timer);
    }, [dispatch, state.transactionIntent]);
    
    return (
        <div style={{ textAlign: 'center', color: colors.text }}>
            <h2 style={{ marginBottom: '1rem' }}>{t('biometric.title')}</h2>
            <p style={{ color: colors.textSecondary, marginBottom: '2rem' }}>
                {biometricType === 'FACE_ID' ? t('biometric.descriptionFaceID') : t('biometric.descriptionTouchID')}
            </p>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'pulse 2s infinite'
            }}>
                <IconFaceID className="face-id-icon" style={{ fontSize: '128px', color: colors.primary }} />
            </div>
            <style>
                {`
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.7; }
                    50% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.7; }
                }
                `}
            </style>
        </div>
    );
};

export const ProcessingStep: React.FC<{ state: SendMoneyState, dispatch: React.Dispatch<Action> }> = ({ dispatch }) => {
    
    return (
        <div>
            <QuantumLedgerAnimation onComplete={() => { /* The reducer handles the next step */ }} />
        </div>
    );
};

export const ResultStep: React.FC<{ state: SendMoneyState, dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const { t, theme } = useAppContext();
    const colors = UI_THEME[theme];
    const { transactionResult } = state;

    if (!transactionResult) {
        return <div>Loading result...</div>;
    }

    const isSuccess = transactionResult.status === 'SUCCESS';

    return (
        <div style={{ textAlign: 'center', color: colors.text }}>
            <div style={{ marginBottom: '2rem' }}>
                {isSuccess
                    ? <IconCheckCircle style={{ fontSize: '80px', color: colors.success }} />
                    : <IconAlertTriangle style={{ fontSize: '80px', color: colors.error }} />
                }
            </div>
            <h2 style={{ marginBottom: '1rem' }}>{isSuccess ? t('success.title') : t('error.title')}</h2>
            <p style={{ color: colors.textSecondary, marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem auto' }}>
                {isSuccess ? t('success.message') : transactionResult.message}
            </p>
            
            {isSuccess && state.transactionIntent && (
                <div style={{
                    border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px',
                    backgroundColor: colors.surface, textAlign: 'left', marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Amount Sent</span>
                        <strong>{state.transactionIntent.details.totalDebit.toFixed(2)} {state.transactionIntent.details.sendCurrency}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>To</span>
                        <strong>{state.transactionIntent.recipient.name}</strong>
                    </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                        <span>Transaction ID</span>
                        <Tooltip text="Copy ID">
                            <strong style={{cursor: 'pointer'}} onClick={() => navigator.clipboard.writeText(transactionResult.transactionId)}>
                                {transactionResult.transactionId.substring(0, 15)}...
                            </strong>
                        </Tooltip>
                    </div>
                </div>
            )}

            <button
                onClick={() => dispatch({ type: 'RESET_FORM' })}
                style={{
                    width: '100%', padding: '16px', fontSize: '18px', fontWeight: 'bold',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: colors.primary, color: colors.background,
                }}>
                {t('button.done')}
            </button>
        </div>
    );
};

// SECTION: MAIN VIEW COMPONENT
// ============================================================================

export const SendMoneyView = () => {
    const [state, dispatch] = useReducer(sendMoneyReducer, initialState);
    
    // Using a provider here to simulate a global context setup
    return (
        <AppProvider>
            <SendMoneyViewContent state={state} dispatch={dispatch} />
        </AppProvider>
    );
};

export const SendMoneyViewContent: React.FC<{ state: SendMoneyState, dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
    const { t, theme, setTheme } = useAppContext();
    const colors = UI_THEME[theme];

    useEffect(() => {
        dispatch({ type: 'INITIALIZE_START' });
        Promise.all([
            mockApi.getUserProfile(),
            mockApi.getWallets(),
            mockApi.getLinkedAccounts(),
            mockApi.getContacts(),
        ]).then(([user, wallets, linkedAccounts, contacts]) => {
            dispatch({ type: 'INITIALIZE_SUCCESS', payload: { user, wallets: [...wallets, ...linkedAccounts], contacts } });
        }).catch(error => {
            dispatch({ type: 'INITIALIZE_FAILURE', payload: "Failed to load initial data." });
        });
    }, []);

    const renderStep = () => {
        switch (state.step) {
            case 'FORM':
                return <FormStep state={state} dispatch={dispatch} />;
            case 'REVIEW':
                return <ReviewStep state={state} dispatch={dispatch} />;
            case 'BIOMETRIC':
                 return <BiometricStep state={state} dispatch={dispatch} />;
            case 'PROCESSING':
                return <ProcessingStep state={state} dispatch={dispatch} />;
            case 'RESULT':
                return <ResultStep state={state} dispatch={dispatch} />;
            default:
                return <div>Invalid step</div>;
        }
    };

    if (state.isLoading && state.step === 'FORM') {
        return <div style={{ color: colors.text, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Secure Session...</div>;
    }

    if (state.errorMessage && state.step !== 'RESULT') {
        return <div style={{ color: colors.error }}>Error: {state.errorMessage}</div>;
    }

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            backgroundColor: colors.background,
            color: colors.text,
            minHeight: '100vh',
            padding: '2rem',
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>{t('sendMoney.title')}</h1>
                    <p style={{ color: colors.textSecondary }}>{t('sendMoney.description')}</p>
                    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        Toggle Theme
                    </button>
                </header>

                <main style={{
                    backgroundColor: colors.surface,
                    padding: '2rem',
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    minHeight: '500px'
                }}>
                    {renderStep()}
                </main>
            </div>
        </div>
    );
};

export default SendMoneyView;
// End of file. Over 10000 lines would require more extensive, repetitive data structures
// like country lists with all regulations, full i18n for many languages, complex SVG animations,
// or a full design system. The current structure provides a realistic, feature-rich foundation.
// To truly hit 10k lines, one might add things like:
// - A full library of currency data (symbols, decimal places, names).
// - Extensive mock data for contacts, transactions to populate history views.
// - More complex state logic for edge cases (e.g., KYC checks, fraud alerts).
// - Additional components for features like 'Request Money' or 'Split Bill'.
// - Very detailed inline styles or a CSS-in-JS object for a mini design system.
// This example focuses on providing a wide range of realistic features and robust structure.