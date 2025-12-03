import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Card from '../../../Card';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

/**
 * @description Represents a generic address structure.
 */
export interface Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

/**
 * @description Defines the structure for a principal officer's personal information.
 */
export interface PrincipalOfficerInfo {
    fullName: string;
    email: string;
    dateOfBirth: string; // YYYY-MM-DD
    phoneNumber: string;
    ssnLast4: string; // Last 4 digits of SSN for verification
    address: Address;
}

/**
 * @description Defines the structure for business information.
 */
export interface BusinessInfo {
    businessName: string;
    businessType: 'sole_proprietorship' | 'llc' | 'c_corp' | 's_corp' | 'partnership' | 'non_profit';
    ein: string; // Employer Identification Number
    industry: string;
    website?: string;
    businessAddress: Address;
    formationDate: string; // YYYY-MM-DD
    annualRevenue: string; // Projected annual revenue
    employeesCount: string; // Number of employees
}

/**
 * @description Defines the structure for a beneficial owner.
 */
export interface BeneficialOwner {
    id: string; // Unique ID for each owner
    fullName: string;
    email: string;
    dateOfBirth: string;
    phoneNumber: string;
    ssnLast4: string;
    ownershipPercentage: number; // 0-100
    address: Address;
    identityDocument?: File | null;
}

/**
 * @description Represents the state of a file being uploaded.
 */
export interface FileUploadState {
    file: File | null;
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    errorMessage?: string;
}

/**
 * @description Defines the types of documents required for onboarding.
 */
export interface OnboardingDocuments {
    identityProof: FileUploadState; // Principal Officer's ID
    addressProof: FileUploadState; // Principal Officer's address proof
    businessRegistration?: FileUploadState; // Business registration document
    articlesOfIncorporation?: FileUploadState; // For Corps/LLCs
    operatingAgreement?: FileUploadState; // For LLCs/Partnerships
    einLetter?: FileUploadState; // IRS EIN confirmation letter
    financialStatements?: FileUploadState; // Optional: last 2 years financial statements
}

/**
 * @description Defines the available account types.
 */
export interface AccountType {
    id: string;
    name: string;
    description: string;
    features: string[];
    monthlyFee: number;
}

/**
 * @description Defines available additional services.
 */
export interface AdditionalService {
    id: string;
    name: string;
    description: string;
    monthlyCost: number;
    isOptional: boolean;
}

/**
 * @description Represents the state of the bank account linking process.
 */
export interface BankAccountLinkState {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    routingNumber: string;
    status: 'idle' | 'linking' | 'success' | 'error';
    errorMessage?: string;
}

/**
 * @description Defines the structure for compliance declarations.
 */
export interface ComplianceDeclaration {
    agreedToTerms: boolean;
    agreedToPrivacyPolicy: boolean;
    fatcaStatus: 'us_person' | 'non_us_person' | 'n_a';
    crsStatus: 'tax_resident' | 'not_tax_resident' | 'n_a';
    politicallyExposedPerson: boolean;
    sanctionedCountriesInvolvement: boolean;
}

/**
 * @description Defines the structure for user preferences.
 */
export interface UserPreferences {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingOptIn: boolean;
    dashboardTheme: 'light' | 'dark' | 'system';
    language: 'en' | 'es' | 'fr';
}

/**
 * @description Defines a team member with access to the dashboard.
 */
export interface TeamMember {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'finance' | 'operations' | 'viewer';
    status: 'invited' | 'active' | 'inactive';
}

/**
 * @description Defines an API Key configuration.
 */
export interface APIKey {
    id: string;
    name: string;
    key: string; // Masked for display
    permissions: string[];
    isActive: boolean;
    createdAt: string; // ISO date string
    lastUsedAt?: string; // ISO date string
}

/**
 * @description Defines a hardware product available for order.
 */
export interface HardwareProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    quantity: number; // For the order form
}

/**
 * @description Represents a simulated API response.
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
}

/**
 * @description Defines the complete onboarding form data structure.
 */
export interface OnboardingFormData {
    principalOfficer: PrincipalOfficerInfo;
    business: BusinessInfo;
    beneficialOwners: BeneficialOwner[];
    documents: OnboardingDocuments;
    selectedAccountTypeId: string;
    selectedServiceIds: string[];
    bankAccountLink: BankAccountLinkState;
    compliance: ComplianceDeclaration;
    userPreferences: UserPreferences;
    teamMembers: TeamMember[];
    apiKeys: APIKey[];
    hardwareOrder: HardwareProduct[];
    eSignatureAgreement: boolean;
    eSignatureText: string;
}

/**
 * @description Defines structure for validation errors.
 */
export type FormErrors<T> = {
    [K in keyof T]?: T[K] extends object ? FormErrors<T[K]> | string : string;
};

// ================================================================================================
// UTILITY FUNCTIONS (Exported for modularity)
// ================================================================================================

/**
 * @description Generic function to simulate an API call with a delay.
 * @param data - The data to be "sent" to the API.
 * @param delayMs - The delay in milliseconds.
 * @param successRate - Probability of success (0.0 to 1.0).
 * @returns A Promise that resolves with an ApiResponse.
 */
export const simulateApiCall = <T, U = any>(
    data: U,
    delayMs: number = 1000,
    successRate: number = 0.9
): Promise<ApiResponse<T>> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (Math.random() < successRate) {
                console.log("API Call Successful:", data);
                resolve({ success: true, data: data as unknown as T, message: "Operation successful" });
            } else {
                console.error("API Call Failed:", data);
                resolve({ success: false, message: "An unexpected error occurred. Please try again." });
            }
        }, delayMs);
    });
};

/**
 * @description Validates a given email address format.
 * @param email - The email string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * @description Validates if a string is not empty.
 * @param value - The string to validate.
 * @returns True if not empty, false otherwise.
 */
export const isNotEmpty = (value: string): boolean => {
    return value.trim().length > 0;
};

/**
 * @description Validates a date string in YYYY-MM-DD format.
 * @param dateString - The date string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidDate = (dateString: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10) === dateString;
};

/**
 * @description Validates if a string represents a positive number.
 * @param value - The string to validate.
 * @returns True if valid, false otherwise.
 */
export const isPositiveNumber = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
};

/**
 * @description Validates a US ZIP code format.
 * @param zipCode - The ZIP code string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidZipCode = (zipCode: string): boolean => {
    return /^\d{5}(?:[-\s]\d{4})?$/.test(zipCode);
};

/**
 * @description Validates a 10-digit phone number.
 * @param phoneNumber - The phone number string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
    return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phoneNumber);
};

/**
 * @description Formats a number to currency string.
 * @param amount - The number to format.
 * @param currency - The currency code (e.g., 'USD').
 * @param locale - The locale string (e.g., 'en-US').
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * @description Masks a string, showing only the last N characters.
 * @param input - The string to mask.
 * @param visibleLength - The number of characters to show at the end.
 * @param maskChar - The character to use for masking.
 * @returns Masked string.
 */
export const maskString = (input: string, visibleLength: number, maskChar: string = '*'): string => {
    if (input.length <= visibleLength) {
        return input;
    }
    return maskChar.repeat(input.length - visibleLength) + input.slice(-visibleLength);
};

/**
 * @description Generates a unique ID (simple UUID-like string).
 * @returns A unique ID string.
 */
export const generateUniqueId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * @description Calculates age from a date of birth string.
 * @param dobString - Date of birth in YYYY-MM-DD format.
 * @returns The age in years.
 */
export const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
};

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description A progress bar to visually indicate the user's position in the onboarding flow.
 */
export const OnboardingProgress: React.FC<{ currentStep: number; totalSteps: number; stepNames: string[] }> = ({ currentStep, totalSteps, stepNames }) => {
    const progressPercentage = ((currentStep) / (totalSteps - 1)) * 100;
    return (
        <div className="mb-8">
            <div className="relative pt-1">
                 <div className="flex mb-2 items-center justify-between">
                    <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-600 bg-cyan-200">{stepNames[currentStep]}</span></div>
                    <div className="text-right"><span className="text-xs font-semibold inline-block text-cyan-300">{currentStep + 1} of {totalSteps}</span></div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-cyan-200/20">
                    <div style={{ width: `${progressPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-cyan-500 transition-all duration-500"></div>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Displays validation errors for a form field.
 */
export const FieldError: React.FC<{ message?: string }> = ({ message }) => {
    if (!message) return null;
    return <p className="text-red-400 text-xs mt-1">{message}</p>;
};

/**
 * @description A reusable file dropzone component for the document upload step.
 * Manages its own internal state for file handling and progress simulation.
 */
export const DocumentDropzone: React.FC<{
    title: string;
    description?: string;
    allowedFileTypes?: string[];
    maxFileSizeMb?: number;
    uploadState: FileUploadState;
    onFileChange: (file: File | null) => void;
    onFileUploadStart: () => void;
    onFileUploadComplete: (state: FileUploadState) => void;
}> = ({ title, description, allowedFileTypes = ['image/*', 'application/pdf'], maxFileSizeMb = 10, uploadState, onFileChange, onFileUploadStart, onFileUploadComplete }) => {

    const handleFileSelect = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            const maxSizeBytes = maxFileSizeMb * 1024 * 1024;

            if (file.size > maxSizeBytes) {
                onFileUploadComplete({ file: null, progress: 0, status: 'error', errorMessage: `File size exceeds ${maxFileSizeMb}MB limit.` });
                return;
            }

            const fileTypeValid = allowedFileTypes.some(type => {
                if (type.endsWith('/*')) { // e.g., 'image/*'
                    return file.type.startsWith(type.slice(0, -1));
                }
                return file.type === type;
            });

            if (!fileTypeValid) {
                onFileUploadComplete({ file: null, progress: 0, status: 'error', errorMessage: `Invalid file type. Allowed: ${allowedFileTypes.map(t => t.split('/')[1] || t).join(', ')}` });
                return;
            }

            onFileUploadStart(); // Notify parent that upload is starting
            onFileChange(file); // Update parent form data with selected file

            // Simulate upload progress
            let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += 10;
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    onFileUploadComplete({ file, progress: 100, status: 'success' });
                } else {
                    onFileUploadComplete({ file, progress: currentProgress, status: 'uploading' });
                }
            }, 200);
        }
    };

    const handleRemoveFile = () => {
        onFileChange(null);
        onFileUploadComplete({ file: null, progress: 0, status: 'idle' });
    }

    const dropzoneClassName = `border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
        uploadState.status === 'error' ? 'border-red-500 bg-red-900/10' :
        uploadState.status === 'success' ? 'border-green-500 bg-green-900/10' :
        'border-gray-600 hover:border-cyan-500'
    }`;

    return (
        <div className={dropzoneClassName}>
            <h4 className="text-gray-300 font-semibold">{title}</h4>
            {description && <p className="text-sm text-gray-500 mt-1 mb-3">{description}</p>}

            {uploadState.status === 'idle' && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500">Drag & drop your file here or</p>
                    <input type="file" id={`file-upload-${title.replace(/\s/g, '-')}`} className="hidden" onChange={e => handleFileSelect(e.target.files)} accept={allowedFileTypes.join(',')} />
                    <label htmlFor={`file-upload-${title.replace(/\s/g, '-')}`} className="cursor-pointer text-cyan-400 hover:text-cyan-300 font-medium">browse to upload.</label>
                    <p className="text-xs text-gray-600 mt-1">Max {maxFileSizeMb}MB. {allowedFileTypes.map(t => t.split('/')[1] || t).join(', ').toUpperCase()} files.</p>
                </div>
            )}
            {(uploadState.status === 'uploading' || uploadState.status === 'success') && uploadState.file && (
                <div className="mt-4">
                    <p className="text-sm text-white truncate">{uploadState.file.name}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${uploadState.progress}%` }}></div>
                    </div>
                    {uploadState.status === 'success' && (
                        <div className="mt-2 text-green-400 text-sm font-semibold">
                            <span className="mr-1">✓</span> Uploaded successfully.
                            <button onClick={handleRemoveFile} className="text-xs text-gray-400 hover:underline ml-2">Remove</button>
                        </div>
                    )}
                </div>
            )}
            {uploadState.status === 'error' && (
                 <div className="mt-4 text-red-400">
                    <p className="text-sm font-semibold">✗ Upload failed: {uploadState.errorMessage || 'Unknown error.'}</p>
                    <button onClick={handleRemoveFile} className="text-xs text-gray-400 hover:underline mt-1">Retry</button>
                </div>
            )}
        </div>
    );
};

/**
 * @description A controlled input field with label and error display.
 */
export const ControlledInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    type?: string;
    error?: string;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
    textarea?: boolean;
    required?: boolean;
}> = ({ label, name, value, onChange, type = 'text', error, placeholder, className, readOnly, textarea, required }) => {
    const InputComponent = textarea ? 'textarea' : 'input';
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <InputComponent
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`mt-1 w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 ${className || ''} ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder={placeholder}
                readOnly={readOnly}
                rows={textarea ? 4 : undefined}
            />
            <FieldError message={error} />
        </div>
    );
};

/**
 * @description A controlled select field with label and error display.
 */
export const ControlledSelect: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string; disabled?: boolean }[];
    error?: string;
    className?: string;
    required?: boolean;
}> = ({ label, name, value, onChange, options, error, className, required }) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={`mt-1 w-full bg-gray-700/50 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500 ${className || ''}`}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
            </select>
            <FieldError message={error} />
        </div>
    );
};

/**
 * @description A controlled checkbox field with label and error display.
 */
export const ControlledCheckbox: React.FC<{
    label: React.ReactNode;
    name: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    className?: string;
    required?: boolean;
}> = ({ label, name, checked, onChange, error, className, required }) => {
    return (
        <div className={`flex items-start ${className || ''}`}>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="mt-1 h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                required={required}
            />
            <label htmlFor={name} className="ml-2 text-sm text-gray-300 cursor-pointer">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <FieldError message={error} />
        </div>
    );
};

/**
 * @description Renders a generic address form.
 */
export const AddressForm: React.FC<{
    address: Address;
    onChange: (field: keyof Address, value: string) => void;
    errors: FormErrors<Address>;
    prefix: string; // To differentiate field names if multiple addresses are on one page
    title?: string;
}> = ({ address, onChange, errors, prefix, title }) => {
    const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.name.replace(`${prefix}.`, '') as keyof Address, e.target.value);
    };

    const countryOptions = [
        { value: 'USA', label: 'United States' },
        { value: 'CAN', label: 'Canada' },
        { value: 'MEX', label: 'Mexico' },
        { value: 'GBR', label: 'United Kingdom' },
        { value: 'AUS', label: 'Australia' },
        { value: 'OTH', label: 'Other' },
    ];

    const usStates = [
        { value: '', label: 'Select State', disabled: true },
        { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' }, { value: 'AZ', label: 'Arizona' },
        { value: 'AR', label: 'Arkansas' }, { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
        { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' }, { value: 'FL', label: 'Florida' },
        { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
        { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
        { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
        { value: 'ME', label: 'Maine' }, { value: 'MD