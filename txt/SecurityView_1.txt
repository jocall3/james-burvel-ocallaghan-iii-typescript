// components/views/personal/SecurityView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import PlaidLinkButton from '../../PlaidLinkButton';

// ================================================================================================
// SVG ICONS
// ================================================================================================

/**
 * A versatile icon component for use throughout the security view.
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered SVG icon.
 */
export const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 2.083 9-2.083c0-5.922-3.824-11.026-9.382-13.984z" />
    </svg>
);

export const KeyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.873M15 7A6 6 0 002.377 8.373M15 7a2 2 0 00-2-2H9a2 2 0 00-2 2m12 11.5a1.5 1.5 0 01-3 0V17a1.5 1.5 0 01-3 0v-1.5a1.5 1.5 0 01-3 0V11a3 3 0 013-3h3a3 3 0 013 3v1.5a1.5 1.5 0 01-3 0V14a1.5 1.5 0 01-3 0v1.5a1.5 1.5 0 013 0v1.5a1.5 1.5 0 013 0z" />
    </svg>
);

export const DevicePhoneMobileIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
);

export const QrCodeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h4v4a2 2 0 002 2h4v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h4v-4a2 2 0 012-2h4V14a2 2 0 00-2-2" />
    </svg>
);

export const AtSymbolIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
);

export const BellIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const GlobeAltIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
    </svg>
);

export const DesktopComputerIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const CloudArrowDownIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a4 4 0 01-4-4V7a4 4 0 014-4h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17a4 4 0 01-4 4z" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const InformationCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ExclamationTriangleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Spinner: React.FC<{className?: string}> = ({ className = 'w-5 h-5' }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

export interface LoginActivity {
    id: string;
    device: string;
    location: string;
    ip: string;
    timestamp: string;
    isCurrent: boolean;
    userAgent: string;
}

export type TwoFactorMethodType = 'authenticator' | 'sms' | 'security_key';

export interface TwoFactorMethod {
    id: string;
    type: TwoFactorMethodType;
    name: string;
    addedOn: string;
    isPrimary: boolean;
}

export type ApiScope = 'read:transactions' | 'read:balance' | 'write:transfers' | 'read:portfolio';

export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    lastUsed: string | null;
    createdOn: string;
    scopes: ApiScope[];
}

export interface AuthorizedApp {
    id: string;
    name: string;
    logoUrl: string;
    description: string;
    scopes: string[];
    authorizedOn: string;
}

export interface SecurityNotificationSettings {
    newLogin: ('email' | 'sms' | 'push')[];
    failedLogin: ('email' | 'sms')[];
    passwordChange: ('email' | 'sms')[];
    apiKeyCreation: ('email')[];
}

export interface PasswordStrength {
    score: 0 | 1 | 2 | 3 | 4; // 0: very weak, 4: very strong
    feedback: {
        warning: string;
        suggestions: string[];
    };
}

export type ModalType = null | 'changePassword' | 'setup2fa' | 'generateApiKey' | 'revokeApiKey' | 'viewBackupCodes';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: number;
    type: ToastType;
    message: string;
}

// ================================================================================================
// MOCK DATA
// ================================================================================================

const MOCK_LOGIN_ACTIVITY: LoginActivity[] = [
    { id: '1', device: 'Chrome on macOS', location: 'New York, USA', ip: '192.168.1.1', timestamp: '2 minutes ago', isCurrent: true, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' },
    { id: '2', device: 'DemoBank App on iOS', location: 'New York, USA', ip: '172.16.0.1', timestamp: '3 days ago', isCurrent: false, userAgent: 'DemoBank/3.1.2 (iPhone; iOS 16.1.1; Scale/3.00)' },
    { id: '3', device: 'Chrome on Windows', location: 'Chicago, USA', ip: '10.0.0.1', timestamp: '1 week ago', isCurrent: false, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' },
    { id: '4', device: 'Firefox on Linux', location: 'San Francisco, USA', ip: '203.0.113.42', timestamp: '2 weeks ago', isCurrent: false, userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:107.0) Gecko/20100101 Firefox/107.0' },
    { id: '5', device: 'Safari on macOS', location: 'Miami, USA', ip: '198.51.100.8', timestamp: '1 month ago', isCurrent: false, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15' },
];

const MOCK_SECURITY_EVENTS = [
    { id: 'e1', type: 'Login', description: 'Successful login from Chrome on macOS', timestamp: '2 minutes ago', icon: 'login' },
    { id: 'e2', type: 'Setting Change', description: '2FA method "Authenticator App" was added', timestamp: '2 days ago', icon: 'setting' },
    { id: 'e3', type: 'Login', description: 'Successful login from DemoBank App on iOS', timestamp: '3 days ago', icon: 'login' },
    { id: 'e4', type: 'API Key', description: 'New API key created for "Staging-WebApp-Test"', timestamp: '4 days ago', icon: 'key' },
    { id: 'e5', type: 'Failed Login', description: 'Failed login attempt from 203.0.113.55', timestamp: '5 days ago', icon: 'failed' },
    { id: 'e6', type: 'Password Change', description: 'Password was successfully changed', timestamp: '1 week ago', icon: 'key' },
    { id: 'e7', type: 'Setting Change', description: 'Anti-Phishing code was updated', timestamp: '1 week ago', icon: 'setting' },
];

export const MOCK_2FA_METHODS: TwoFactorMethod[] = [
    { id: '2fa1', type: 'authenticator', name: 'Google Authenticator', addedOn: '2023-01-15', isPrimary: true },
    { id: '2fa2', type: 'sms', name: '***-***-1234', addedOn: '2022-11-20', isPrimary: false },
];

export const MOCK_API_KEYS: ApiKey[] = [
    { id: 'api1', name: 'Staging-WebApp-Test', prefix: 'sk_test_a1b2c3', lastUsed: '4 days ago', createdOn: '2023-03-10', scopes: ['read:transactions', 'read:balance'] },
    { id: 'api2', name: 'Production Data Scraper', prefix: 'sk_prod_x4y5z6', lastUsed: '2 hours ago', createdOn: '2023-01-01', scopes: ['read:transactions'] },
    { id: 'api3', name: 'Mobile App Key', prefix: 'pk_live_q7r8s9', lastUsed: null, createdOn: '2022-12-05', scopes: ['read:balance', 'write:transfers'] },
];

export const MOCK_AUTHORIZED_APPS: AuthorizedApp[] = [
    { id: 'app1', name: 'Mint', logoUrl: '/mint-logo.png', description: 'Personal finance and budgeting app.', scopes: ['Read transaction history', 'View account balances'], authorizedOn: '2023-02-20' },
    { id: 'app2', name: 'Wealthfront', logoUrl: '/wealthfront-logo.png', description: 'Automated investing service.', scopes: ['View portfolio', 'Transfer funds'], authorizedOn: '2023-01-05' },
];

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * Generates a cryptographically secure random string.
 * @param {number} length - The desired length of the string.
 * @returns {string} The generated random string.
 */
export const generateSecureString = (length: number): string => {
    const array = new Uint32Array(length / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

/**
 * Copies a string to the user's clipboard.
 * @param {string} text - The text to copy.
 * @returns {Promise<void>} A promise that resolves when the text is copied.
 */
export const copyToClipboard = (text: string): Promise<void> => {
    return navigator.clipboard.writeText(text);
};

/**
 * Calculates the strength of a password based on a set of criteria.
 * @param {string} password - The password to evaluate.
 * @returns {PasswordStrength} An object containing the strength score and feedback.
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback = { warning: '', suggestions: [] as string[] };

    if (!password) return { score: 0, feedback };

    if (password.length < 8) {
        feedback.warning = 'Password is too short.';
        feedback.suggestions.push('Use at least 8 characters.');
    } else {
        score++;
    }

    if (password.length > 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Normalize score to be out of 4
    score = Math.min(Math.floor(score / 1.25), 4);
    
    if (score < 2) {
        if (!/[A-Z]/.test(password)) feedback.suggestions.push('Add uppercase letters.');
        if (!/[0-9]/.test(password)) feedback.suggestions.push('Add numbers.');
        if (!/[^A-Za-z0-9]/.test(password)) feedback.suggestions.push('Add symbols (e.g., !@#$).');
    }

    return { score: score as PasswordStrength['score'], feedback };
};


// ================================================================================================
// UI PRIMITIVE COMPONENTS
// ================================================================================================

/**
 * A reusable modal component for security-related actions.
 */
export const SecurityModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-5">{children}</div>
                {footer && (
                    <div className="p-5 bg-gray-800/50 border-t border-gray-700 rounded-b-lg flex justify-end space-x-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * A component to display toast notifications.
 */
export const Toast: React.FC<{ toast: ToastMessage, onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    const colors = {
        success: 'bg-green-500/20 border-green-500 text-green-300',
        error: 'bg-red-500/20 border-red-500 text-red-300',
        info: 'bg-blue-500/20 border-blue-500 text-blue-300',
        warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    };

    const icons = {
        success: <CheckCircleIcon className="w-5 h-5" />,
        error: <XCircleIcon className="w-5 h-5" />,
        info: <InformationCircleIcon className="w-5 h-5" />,
        warning: <ExclamationTriangleIcon className="w-5 h-5" />,
    };

    return (
        <div className={`flex items-start p-4 mb-3 rounded-lg border shadow-lg text-sm ${colors[toast.type]}`}>
            <div className="mr-3">{icons[toast.type]}</div>
            <p className="flex-1">{toast.message}</p>
            <button onClick={() => onDismiss(toast.id)} className="ml-4 text-gray-400 hover:text-white">&times;</button>
        </div>
    );
}

/**
 * A container for toast notifications.
 */
export const ToastContainer: React.FC<{ toasts: ToastMessage[], onDismiss: (id: number) => void }> = ({ toasts, onDismiss }) => (
    <div className="fixed bottom-5 right-5 z-50 w-full max-w-sm">
        {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
    </div>
);


const EventIcon: React.FC<{type: string}> = ({type}) => {
    let path = "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"; // default
    if(type === 'login') path = "M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1m0-11V4a2 2 0 00-2-2h-3a2 2 0 00-2 2v1";
    if(type === 'setting') path = "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z";
    if(type === 'key') path = "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.623 5.873M15 7A6 6 0 002.377 8.373M15 7a2 2 0 00-2-2H9a2 2 0 00-2 2"
    if(type === 'failed') path = "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} /></svg>
};

// ================================================================================================
// FEATURE COMPONENTS
// ================================================================================================

/**
 * A form input field component with a label.
 */
export const FormInput: React.FC<{
    id: string;
    label: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    autoComplete?: string;
}> = ({ id, label, type, value, onChange, placeholder, autoComplete }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);

/**
 * A component for displaying and managing password changes.
 */
export const ChangePasswordSection: React.FC<{ addToast: (type: ToastType, message: string) => void }> = ({ addToast }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(calculatePasswordStrength(''));
    const [isChanging, setIsChanging] = useState(false);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pass = e.target.value;
        setNewPassword(pass);
        setPasswordStrength(calculatePasswordStrength(pass));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addToast('error', "New passwords do not match.");
            return;
        }
        if (passwordStrength.score < 2) {
            addToast('warning', "New password is too weak.");
            return;
        }
        setIsChanging(true);
        setTimeout(() => {
            setIsChanging(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordStrength(calculatePasswordStrength(''));
            addToast('success', "Password changed successfully.");
        }, 1500);
    };

    const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'];
    const strengthText = ['Very Weak', 'Weak', 'Okay', 'Strong', 'Very Strong'];

    return (
        <Card title="Change Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    id="currentPassword"
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                />
                <FormInput
                    id="newPassword"
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                />
                {newPassword && (
                    <div className="space-y-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-300 ${strengthColors[passwordStrength.score]}`}
                                style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            ></div>
                        </div>
                        <p className={`text-xs text-gray-400`}>Strength: {strengthText[passwordStrength.score]}</p>
                        {passwordStrength.feedback.suggestions.length > 0 && (
                             <ul className="text-xs text-gray-400 list-disc list-inside">
                                {passwordStrength.feedback.suggestions.map(s => <li key={s}>{s}</li>)}
                            </ul>
                        )}
                    </div>
                )}
                 <FormInput
                    id="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                />
                <div className="flex justify-end">
                    <button type="submit" disabled={isChanging || !currentPassword || !newPassword || !confirmPassword} className="btn btn-cyan disabled:opacity-50">
                        {isChanging ? <Spinner /> : "Update Password"}
                    </button>
                </div>
            </form>
        </Card>
    );
};

/**
 * Manages Two-Factor Authentication settings.
 */
export const TwoFactorAuthSection: React.FC<{ addToast: (type: ToastType, message: string) => void }> = ({ addToast }) => {
    const [methods, setMethods] = useState<TwoFactorMethod[]>(MOCK_2FA_METHODS);
    const [showSetup, setShowSetup] = useState<TwoFactorMethodType | null>(null);

    const removeMethod = (id: string) => {
        if (methods.length <= 1) {
            addToast('error', 'You must have at least one 2FA method enabled.');
            return;
        }
        setMethods(methods.filter(m => m.id !== id));
        addToast('success', '2FA method removed.');
    };
    
    const getMethodIcon = (type: TwoFactorMethodType) => {
        switch (type) {
            case 'authenticator': return <QrCodeIcon className="w-5 h-5 text-cyan-400"/>;
            case 'sms': return <DevicePhoneMobileIcon className="w-5 h-5 text-cyan-400"/>;
            case 'security_key': return <KeyIcon className="w-5 h-5 text-cyan-400"/>;
        }
    }

    return (
        <Card title="Two-Factor Authentication (2FA)">
            <p className="text-sm text-gray-400 mb-4">
                Add an extra layer of security to your account. Once configured, you will be required to enter a code from your device in addition to your password.
            </p>
            <div className="space-y-3">
                {methods.map(method => (
                    <div key={method.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            {getMethodIcon(method.type)}
                            <div>
                                <p className="font-semibold text-white">{method.name}</p>
                                <p className="text-xs text-gray-400">Added on {method.addedOn}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             {method.isPrimary && <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full">Primary</span>}
                            <button onClick={() => removeMethod(method.id)} className="text-gray-400 hover:text-red-400">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 border-t border-gray-700 pt-4 space-y-2">
                <h4 className="font-semibold text-gray-200 mb-2">Add a new method</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button className="p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg" onClick={() => addToast('info', 'Feature coming soon!')}>
                        <QrCodeIcon className="w-6 h-6 mb-2 text-cyan-400" />
                        <p className="font-semibold">Authenticator App</p>
                    </button>
                    <button className="p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg" onClick={() => addToast('info', 'Feature coming soon!')}>
                        <DevicePhoneMobileIcon className="w-6 h-6 mb-2 text-cyan-400" />
                        <p className="font-semibold">SMS Text Message</p>
                    </button>
                     <button className="p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg" onClick={() => addToast('info', 'Feature coming soon!')}>
                        <KeyIcon className="w-6 h-6 mb-2 text-cyan-400" />
                        <p className="font-semibold">Security Key</p>
                    </button>
                </div>
            </div>
        </Card>
    );
};

/**
 * Manages user login sessions.
 */
export const SessionManagerSection: React.FC<{ addToast: (type: ToastType, message: string) => void }> = ({ addToast }) => {
    const [sessions, setSessions] = useState(MOCK_LOGIN_ACTIVITY);
    const [isLoggingOut, setIsLoggingOut] = useState<string | null>(null);

    const getDeviceIcon = (userAgent: string) => {
        if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
            return <DevicePhoneMobileIcon className="w-8 h-8 text-gray-400" />;
        }
        return <DesktopComputerIcon className="w-8 h-8 text-gray-400" />;
    };

    const terminateSession = (id: string) => {
        setIsLoggingOut(id);
        setTimeout(() => {
            setSessions(sessions.filter(s => s.id !== id));
            setIsLoggingOut(null);
            addToast('success', 'Session terminated.');
        }, 1000);
    };

    const terminateAllOtherSessions = () => {
        setIsLoggingOut('all');
        setTimeout(() => {
            setSessions(sessions.filter(s => s.isCurrent));
            setIsLoggingOut(null);
            addToast('success', 'All other sessions have been terminated.');
        }, 1500);
    };

    return (
        <Card title="Active Sessions">
            <div className="space-y-4">
                {sessions.map(session => (
                    <div key={session.id} className="flex items-start space-x-4 p-3 border-b border-gray-700/60 last:border-b-0">
                        {getDeviceIcon(session.userAgent)}
                        <div className="flex-grow">
                            <p className="font-bold text-white">{session.device} {session.isCurrent && <span className="text-xs ml-2 text-green-400">(Current Session)</span>}</p>
                            <p className="text-sm text-gray-400">{session.location}</p>
                            <p className="text-xs text-gray-500">IP: {session.ip} &bull; Last active: {session.timestamp}</p>
                        </div>
                        {!session.isCurrent && (
                            <button 
                                onClick={() => terminateSession(session.id)} 
                                disabled={!!isLoggingOut}
                                className="btn btn-sm btn-outline-red"
                            >
                                {isLoggingOut === session.id ? <Spinner className="w-4 h-4" /> : "Sign Out"}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={terminateAllOtherSessions}
                    disabled={!!isLoggingOut}
                    className="btn btn-red"
                >
                     {isLoggingOut === 'all' ? <Spinner /> : "Sign Out of All Other Sessions"}
                </button>
            </div>
        </Card>
    );
};

/**
 * Manages API keys for developers.
 */
export const ApiKeyManagerSection: React.FC<{ addToast: (type: ToastType, message: string) => void }> = ({ addToast }) => {
    const [apiKeys, setApiKeys] = useState(MOCK_API_KEYS);
    
    const revokeKey = (id: string) => {
        setApiKeys(apiKeys.filter(key => key.id !== id));
        addToast('success', "API Key has been revoked.");
    };

    return (
        <Card title="API Keys">
            <p className="text-sm text-gray-400 mb-4">
                Manage API keys to access your account data programmatically. Treat your API keys like passwords and keep them secure.
            </p>
            <div className="space-y-3 mb-6">
                {apiKeys.map(key => (
                    <div key={key.id} className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="font-semibold text-white">{key.name}</p>
                                <p className="font-mono text-xs text-cyan-400">{key.prefix}••••••••</p>
                           </div>
                           <button onClick={() => revokeKey(key.id)} className="text-gray-400 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                           <p>Last used: {key.lastUsed || 'Never'}</p>
                           <div className="flex flex-wrap gap-1 mt-1">
                            {key.scopes.map(scope => <span key={scope} className="bg-gray-700 px-2 py-0.5 rounded-full text-xs">{scope}</span>)}
                           </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <button className="btn btn-cyan" onClick={() => addToast('info', 'Feature coming soon!')}>Generate New Key</button>
            </div>
        </Card>
    );
};

/**
 * Manages third-party applications authorized to access the account.
 */
export const AuthorizedAppsSection: React.FC<{ addToast: (type: ToastType, message: string) => void }> = ({ addToast }) => {
    const [apps, setApps] = useState(MOCK_AUTHORIZED_APPS);

    const revokeAccess = (id: string) => {
        setApps(apps.filter(app => app.id !== id));
        addToast('success', "Application access has been revoked.");
    };

    return (
        <Card title="Authorized Applications">
            <p className="text-sm text-gray-400 mb-4">
                Review and manage third-party applications you've connected to your account.
            </p>
             <div className="space-y-4">
                {apps.map(app => (
                    <div key={app.id} className="flex items-start space-x-4 p-3 border-b border-gray-700/60 last:border-b-0">
                        {/* Mock logo */}
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center font-bold text-xl text-white">{app.name.charAt(0)}</div>
                        <div className="flex-grow">
                            <p className="font-bold text-white">{app.name}</p>
                            <p className="text-sm text-gray-400">{app.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Authorized on: {app.authorizedOn}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {app.scopes.map(scope => <span key={scope} className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-1 rounded-full">{scope}</span>)}
                            </div>
                        </div>
                        <button onClick={() => revokeAccess(app.id)} className="btn btn-sm btn-outline-red">Revoke</button>
                    </div>
                ))}
            </div>
        </Card>
    );
};


// ================================================================================================
// MAIN VIEW COMPONENT: SecurityView (AegisVault)
// ================================================================================================

const SecurityView: React.FC = () => {
    const context = useContext(DataContext);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = React.useCallback((type: ToastType, message: string) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, type, message }]);
    }, []);

    const dismissToast = React.useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);
    
    if (!context) {
        throw new Error("SecurityView must be within a DataProvider.");
    }
    
    const { linkedAccounts, unlinkAccount, handlePlaidSuccess } = context;

    return (
        <div className="space-y-8">
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            <div>
                <h2 className="text-3xl font-bold text-white tracking-wider">Security & Access</h2>
                <p className="text-gray-400 mt-1">Manage your account's security settings, active sessions, and connections.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-8">
                    <ChangePasswordSection addToast={addToast} />
                    <TwoFactorAuthSection addToast={addToast} />
                    <SessionManagerSection addToast={addToast} />
                </div>
                {/* Right Column */}
                <div className="space-y-8">
                    <Card title="Security Event Timeline">
                        <div className="relative pl-6 max-h-96 overflow-y-auto">
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-700"></div>
                            {MOCK_SECURITY_EVENTS.map(event => (
                                <div key={event.id} className="relative pl-8 py-2">
                                    <div className={`absolute left-[-12px] top-3 w-6 h-6 rounded-full flex items-center justify-center ${event.type.includes('Failed') ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                        <EventIcon type={event.icon}/>
                                    </div>
                                    <p className="font-semibold text-white text-sm">{event.description}</p>
                                    <p className="text-xs text-gray-400">{event.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Linked Financial Accounts">
                        <div className="space-y-2">
                            {linkedAccounts.map(account => (
                                <div key={account.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                                    <div>
                                        <h4 className="font-semibold text-sm text-white">{account.name}</h4>
                                        <p className="text-xs text-gray-400">**** {account.mask}</p>
                                    </div>
                                    <button onClick={() => { unlinkAccount(account.id); addToast('success', `${account.name} has been unlinked.`); }} className="px-2 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-xs">Unlink</button>
                                </div>
                            ))}
                            {linkedAccounts.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No accounts linked.</p>}
                        </div>
                        <PlaidLinkButton onSuccess={handlePlaidSuccess} />
                    </Card>
                </div>
            </div>

            {/* Full Width Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ApiKeyManagerSection addToast={addToast} />
                <AuthorizedAppsSection addToast={addToast} />
            </div>

        </div>
    );
};

export default SecurityView;