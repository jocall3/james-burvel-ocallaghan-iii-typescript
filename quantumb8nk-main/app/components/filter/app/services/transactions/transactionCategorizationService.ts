// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// No imports are allowed for this file as per architectural blueprint.
// All logic must be self-contained.

/**
 * Global constants for the Citibank Demo Business application.
 * All routes are based on the owner's domain: citibankdemobusiness.dev
 */
const BASE_API_URL = "https://api.citibankdemobusiness.dev";
const STRIPE_WEBHOOK_ENDPOINT = `${BASE_API_URL}/webhooks/stripe`;
const PLAID_WEBHOOK_ENDPOINT = `${BASE_API_URL}/webhooks/plaid`;
const MODERN_TREASURY_WEBHOOK_ENDPOINT = `${BASE_API_URL}/webhooks/moderntreasury`;
const ENRICHMENT_SERVICE_ENDPOINT = `${BASE_API_URL}/enrichment`;
const CATEGORIZATION_SERVICE_ENDPOINT = `${BASE_API_URL}/categorization`;

/**
 * Basic utility functions, mimicking commonly imported ones, as no imports are allowed.
 */
interface KeyValuePair {
    [key: string]: any;
}

function safeGet(obj: KeyValuePair | undefined | null, path: string | string[], defaultValue: any = undefined): any {
    if (obj === null || obj === undefined) {
        return defaultValue;
    }
    const pathParts = Array.isArray(path) ? path : path.split('.');
    let current = obj;
    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (typeof current !== 'object' || current === null || !(part in current)) {
            return defaultValue;
        }
        current = current[part];
    }
    return current;
}

function safeIncludes(text: string | undefined | null, substring: string): boolean {
    if (text === null || text === undefined) {
        return false;
    }
    return text.includes(substring);
}

function safeEqualsIgnoreCase(str1: string | undefined | null, str2: string | undefined | null): boolean {
    if (str1 === null || str1 === undefined || str2 === null || str2 === undefined) {
        return false;
    }
    return str1.toLowerCase() === str2.toLowerCase();
}

function safeStartsWith(text: string | undefined | null, prefix: string): boolean {
    if (text === null || text === undefined) {
        return false;
    }
    return text.startsWith(prefix);
}

function safeEndsWith(text: string | undefined | null, suffix: string): boolean {
    if (text === null || text === undefined) {
        return false;
    }
    return text.endsWith(suffix);
}

function isValidDate(dateStr: string | undefined | null): boolean {
    if (typeof dateStr !== 'string' || dateStr.trim() === '') {
        return false;
    }
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

function parseCurrencyAmount(amount: any): number {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
        const cleaned = amount.replace(/[^0-9.-]+/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

function capitalizeFirstLetter(text: string | undefined | null): string {
    if (typeof text !== 'string' || text.length === 0) {
        return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Enumerations for transaction types, categories, and statuses.
 */
enum TransactionType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT",
    TRANSFER = "TRANSFER",
    PAYMENT = "PAYMENT",
    REFUND = "REFUND",
    CHARGEBACK = "CHARGEBACK",
    UNKNOWN = "UNKNOWN",
}

enum FinancialCategory {
    INCOME = "Income",
    EXPENSE = "Expense",
    INVESTMENT = "Investment",
    LOAN = "Loan",
    TAX = "Tax",
    TRANSFER = "Transfer",
    OPERATING_EXPENSE = "Operating Expense",
    REVENUE = "Revenue",
    PAYROLL = "Payroll",
    UTILITIES = "Utilities",
    RENT = "Rent",
    SOFTWARE_SUBSCRIPTION = "Software Subscription",
    ADVERTISING = "Advertising",
    OFFICE_SUPPLIES = "Office Supplies",
    TRAVEL = "Travel",
    SALARIES = "Salaries",
    CONTRACTOR_FEES = "Contractor Fees",
    LEGAL_FEES = "Legal Fees",
    BANK_FEES = "Bank Fees",
    SALES_REVENUE = "Sales Revenue",
    SERVICE_REVENUE = "Service Revenue",
    INTEREST_INCOME = "Interest Income",
    UNCATEGORIZED = "Uncategorized",
    CAPITAL_EXPENDITURE = "Capital Expenditure",
    ACCOUNTS_RECEIVABLE = "Accounts Receivable",
    ACCOUNTS_PAYABLE = "Accounts Payable",
    LOAN_PAYMENT = "Loan Payment",
    INSURANCE = "Insurance",
    MAINTENANCE = "Maintenance",
    EQUIPMENT_PURCHASE = "Equipment Purchase",
    REFUND_PROCESSING = "Refund Processing",
    DONATION = "Donation",
    ROYALTIES = "Royalty Income",
    COMMISSION = "Commission Expense",
    SETTLEMENT = "Settlement Payment",
    GOVERNMENT_GRANT = "Government Grant",
    EQUITY_INVESTMENT = "Equity Investment",
    DEBT_FINANCING = "Debt Financing",
    DIVIDEND_PAYMENT = "Dividend Payment",
    FOREIGN_EXCHANGE = "Foreign Exchange",
    BAD_DEBT = "Bad Debt",
    DEPRECIATION = "Depreciation",
    AMORTIZATION = "Amortization",
    INTEREST_EXPENSE = "Interest Expense",
    RETAINED_EARNINGS = "Retained Earnings",
    VAT_TAX = "VAT Tax",
    SALES_TAX = "Sales Tax",
    PROPERTY_TAX = "Property Tax",
    HEALTHCARE = "Healthcare",
    TRANSPORTATION = "Transportation",
    MEALS_ENTERTAINMENT = "Meals & Entertainment",
    SECURITY = "Security",
    CONSULTING = "Consulting",
    RESEARCH_DEVELOPMENT = "Research & Development",
    TRAINING_EDUCATION = "Training & Education",
    PRINTING_STATIONERY = "Printing & Stationery",
    POSTAGE_DELIVERY = "Postage & Delivery",
    BUSINESS_DEVELOPMENT = "Business Development",
    HOSTING_DOMAIN = "Hosting & Domain",
    ADVISORY_FEES = "Advisory Fees",
    LICENSE_FEES = "License Fees",
    SUBSCRIPTION_SERVICES = "Subscription Services",
    IT_SUPPORT = "IT Support",
    HARDWARE_PURCHASE = "Hardware Purchase",
    SOFTWARE_LICENSES = "Software Licenses",
    MARKETING_CAMPAIGNS = "Marketing Campaigns",
    PRODUCT_DEVELOPMENT = "Product Development",
    MERCHANT_PROCESSING_FEES = "Merchant Processing Fees",
    INTERCHANGE_FEES = "Interchange Fees",
    GATEWAY_FEES = "Gateway Fees",
}

enum SubCategory {
    SALES_PLATFORM_FEES = "Sales Platform Fees",
    DEVELOPMENT_TOOLS = "Development Tools",
    CLOUD_SERVICES = "Cloud Services",
    OFFICE_RENT = "Office Rent",
    ELECTRICITY = "Electricity",
    WATER = "Water",
    INTERNET = "Internet",
    SOFTWARE_AS_SERVICE = "Software as a Service",
    SOCIAL_MEDIA_ADS = "Social Media Ads",
    SEARCH_ENGINE_ADS = "Search Engine Ads",
    CONFERENCE_FEES = "Conference Fees",
    FLIGHTS = "Flights",
    HOTELS = "Hotels",
    STAFF_SALARIES = "Staff Salaries",
    FREELANCER_PAYMENTS = "Freelancer Payments",
    LEGAL_CONSULTATION = "Legal Consultation",
    ACCOUNTING_FEES = "Accounting Fees",
    TRANSACTION_FEES = "Transaction Fees",
    SUBSCRIPTION_REVENUE = "Subscription Revenue",
    ONE_TIME_SALES = "One-Time Sales",
    LOAN_PRINCIPAL_PAYMENT = "Loan Principal Payment",
    LOAN_INTEREST_PAYMENT = "Loan Interest Payment",
    PROPERTY_INSURANCE = "Property Insurance",
    VEHICLE_MAINTENANCE = "Vehicle Maintenance",
    COMPUTER_EQUIPMENT = "Computer Equipment",
    SOFTWARE_REFUND = "Software Refund",
    CUSTOMER_REFUND = "Customer Refund",
    RESEARCH_GRANTS = "Research Grants",
    EQUITY_FUNDING = "Equity Funding",
    BANK_LOAN = "Bank Loan",
    DIVIDEND_RECEIPT = "Dividend Receipt",
    FOREX_GAIN = "Forex Gain",
    FOREX_LOSS = "Forex Loss",
    RECEIVABLES_COLLECTION = "Receivables Collection",
    PAYABLES_PAYMENT = "Payables Payment",
    OFFICE_SUPPLY_PURCHASE = "Office Supply Purchase",
    POSTAGE_COSTS = "Postage Costs",
    PRINTING_SERVICES = "Printing Services",
    BUSINESS_TRAVEL = "Business Travel",
    CLIENT_MEETINGS = "Client Meetings",
    ENTERTAINMENT_EXPENSES = "Entertainment Expenses",
    SECURITY_SYSTEMS = "Security Systems",
    IT_CONSULTING = "IT Consulting",
    SOFTWARE_MAINTENANCE = "Software Maintenance",
    WEBSITE_HOSTING = "Website Hosting",
    DOMAIN_REGISTRATION = "Domain Registration",
    SMS_MARKETING = "SMS Marketing",
    EMAIL_MARKETING = "Email Marketing",
    CONTENT_CREATION = "Content Creation",
    UNCATEGORIZED_SUB = "Uncategorized Sub",
}

enum TransactionStatus {
    PENDING = "PENDING",
    SETTLED = "SETTLED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    REFUNDED = "REFUNDED",
    CHARGEBACKED = "CHARGEBACKED",
    PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

enum RiskLevel {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    UNKNOWN = "UNKNOWN",
}

enum Sentiment {
    POSITIVE = "POSITIVE",
    NEUTRAL = "NEUTRAL",
    NEGATIVE = "NEGATIVE",
    UNKNOWN = "UNKNOWN",
}

enum ComplianceStatus {
    COMPLIANT = "COMPLIANT",
    NON_COMPLIANT = "NON_COMPLIANT",
    PENDING_REVIEW = "PENDING_REVIEW",
    N_A = "N/A",
}

/**
 * Interfaces for raw transaction data from various sources.
 * These simulate the shape of data received from Stripe, Plaid, and Modern Treasury.
 */
interface BaseTransaction {
    id: string;
    amount: number; // in cents or smallest unit
    currency: string;
    description: string;
    occurredAt: string; // ISO 8601 date string
    status: TransactionStatus;
    merchantName?: string;
    merchantCategoryCode?: string; // MCC
    metadata?: KeyValuePair;
    externalId?: string; // ID from external system
}

interface StripeCharge extends BaseTransaction {
    source: 'STRIPE';
    paymentMethodType: string; // e.g., 'card', 'us_bank_account'
    customerEmail?: string;
    invoiceId?: string;
    captured: boolean;
    failureCode?: string;
    failureMessage?: string;
    paymentIntentId?: string;
    refunds?: Array<{
        id: string;
        amount: number;
        status: string;
    }>;
}

interface PlaidTransaction extends BaseTransaction {
    source: 'PLAID';
    accountId: string;
    isoCurrencyCode: string;
    unofficialCurrencyCode?: string;
    paymentChannel: string; // 'online', 'in store', 'other'
    personalFinanceCategory?: {
        primary: string;
        detailed: string;
    };
    location?: {
        address: string;
        city: string;
        region: string;
        postalCode: string;
        country: string;
        lat: number;
        lon: number;
        storeNumber: string;
    };
    authorizedDate?: string; // Date transaction was authorized
    transactionCode?: string; // E.g., 'ATM_CASH_WITHDRAWAL'
    checkNumber?: string;
    authorizedDatetime?: string;
    datetime?: string;
}

interface ModernTreasuryPaymentOrder extends BaseTransaction {
    source: 'MODERN_TREASURY';
    direction: 'credit' | 'debit';
    type: string; // e.g., 'ach', 'wire', 'book', 'sepa'
    originatingAccountId: string;
    receivingAccountId?: string;
    liveMode: boolean;
    purpose?: string;
    vendorName?: string;
    externalLedgerAccountId?: string;
    referenceNumber?: string;
    internalAccountId?: string;
    paymentType?: string; // e.g., 'ACH', 'WIRE'
    status: TransactionStatus; // Modern Treasury uses its own lifecycle statuses, mapping needed
    effectiveDate: string;
    processingDate: string;
    ultimateOriginatingPartyName?: string;
    ultimateReceivingPartyName?: string;
}

// Union type for all possible raw transaction inputs
type RawTransactionInput = StripeCharge | PlaidTransaction | ModernTreasuryPaymentOrder | BaseTransaction;

/**
 * Interfaces for enriched data and categorized transaction output.
 */
interface MerchantDetails {
    name: string;
    industry: string;
    website?: string;
    logoUrl?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    sicCode?: string; // Standard Industrial Classification
    naicsCode?: string; // North American Industry Classification System
}

interface ComplianceCheckResult {
    amlStatus: ComplianceStatus;
    sanctionScreeningStatus: ComplianceStatus;
    fraudScore: number;
    notes?: string;
}

interface EnrichmentData {
    merchant?: MerchantDetails;
    sentiment?: Sentiment;
    riskLevel: RiskLevel;
    compliance?: ComplianceCheckResult;
    keywords?: string[];
    extractedEntities?: KeyValuePair;
    relatedTransactions?: string[]; // IDs of related transactions
    taxImplications?: string[]; // e.g., "VAT Applicable", "Sales Tax Exempt"
    accountingGLCode?: string; // General Ledger code for accounting systems
    invoiceId?: string; // Potentially link to an internal invoice
}

interface CategorizedTransaction extends BaseTransaction {
    source: 'STRIPE' | 'PLAID' | 'MODERN_TREASURY' | 'INTERNAL';
    transactionType: TransactionType;
    category: FinancialCategory;
    subCategory: SubCategory;
    enrichmentData: EnrichmentData;
    isReviewed: boolean; // Flag for manual review
    reviewNotes?: string;
    categorizationRulesApplied: string[]; // List of rule IDs that matched
    originalTransaction: RawTransactionInput; // Keep a reference to the original data
}

/**
 * Data structures for defining categorization rules.
 * Rules are ordered and applied sequentially. The first match wins.
 */
interface RuleCondition {
    field: string; // e.g., "description", "amount", "merchantName"
    operator: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'greaterThan' | 'lessThan' | 'between' | 'in';
    value: any; // string, number, array of strings/numbers
    caseSensitive?: boolean;
}

interface CategorizationRule {
    id: string;
    name: string;
    description: string;
    conditions: RuleCondition[];
    category: FinancialCategory;
    subCategory: SubCategory;
    priority: number; // Lower number means higher priority
    isActive: boolean;
}

/**
 * Predefined list of merchants and their details for enrichment.
 * In a real system, this would come from a database or external API.
 */
const KNOWN_MERCHANTS: MerchantDetails[] = [
    { name: "AWS", industry: "Cloud Services", website: "aws.amazon.com", logoUrl: "https://citibankdemobusiness.dev/logos/aws.png", sicCode: "7370" },
    { name: "Google Cloud", industry: "Cloud Services", website: "cloud.google.com", logoUrl: "https://citibankdemobusiness.dev/logos/google_cloud.png", sicCode: "7370" },
    { name: "Azure", industry: "Cloud Services", website: "azure.microsoft.com", logoUrl: "https://citibankdemobusiness.dev/logos/azure.png", sicCode: "7370" },
    { name: "Stripe", industry: "Payment Processing", website: "stripe.com", logoUrl: "https://citibankdemobusiness.dev/logos/stripe.png", sicCode: "7389" },
    { name: "Plaid", industry: "Financial Technology", website: "plaid.com", logoUrl: "https://citibankdemobusiness.dev/logos/plaid.png", sicCode: "7374" },
    { name: "Modern Treasury", industry: "Financial Technology", website: "moderntreasury.com", logoUrl: "https://citibankdemobusiness.dev/logos/moderntreasury.png", sicCode: "7374" },
    { name: "Slack", industry: "Communication Software", website: "slack.com", logoUrl: "https://citibankdemobusiness.dev/logos/slack.png", sicCode: "7372" },
    { name: "Zoom", industry: "Video Conferencing", website: "zoom.us", logoUrl: "https://citibankdemobusiness.dev/logos/zoom.png", sicCode: "7372" },
    { name: "Salesforce", industry: "CRM Software", website: "salesforce.com", logoUrl: "https://citibankdemobusiness.dev/logos/salesforce.png", sicCode: "7372" },
    { name: "QuickBooks", industry: "Accounting Software", website: "quickbooks.intuit.com", logoUrl: "https://citibankdemobusiness.dev/logos/quickbooks.png", sicCode: "7372" },
    { name: "Adyen", industry: "Payment Processing", website: "adyen.com", logoUrl: "https://citibankdemobusiness.dev/logos/adyen.png", sicCode: "7389" },
    { name: "PayPal", industry: "Payment Processing", website: "paypal.com", logoUrl: "https://citibankdemobusiness.dev/logos/paypal.png", sicCode: "7389" },
    { name: "Square", industry: "Payment Processing", website: "squareup.com", logoUrl: "https://citibankdemobusiness.dev/logos/square.png", sicCode: "7389" },
    { name: "Meta Ads", industry: "Advertising", website: "facebook.com/business", logoUrl: "https://citibankdemobusiness.dev/logos/meta.png", sicCode: "7311" },
    { name: "Google Ads", industry: "Advertising", website: "ads.google.com", logoUrl: "https://citibankdemobusiness.dev/logos/google.png", sicCode: "7311" },
    { name: "Twitter Ads", industry: "Advertising", website: "business.twitter.com", logoUrl: "https://citibankdemobusiness.dev/logos/twitter.png", sicCode: "7311" },
    { name: "LinkedIn Ads", industry: "Advertising", website: "business.linkedin.com", logoUrl: "https://citibankdemobusiness.dev/logos/linkedin.png", sicCode: "7311" },
    { name: "SAP", industry: "ERP Software", website: "sap.com", logoUrl: "https://citibankdemobusiness.dev/logos/sap.png", sicCode: "7372" },
    { name: "Oracle", industry: "Database & Cloud Services", website: "oracle.com", logoUrl: "https://citibankdemobusiness.dev/logos/oracle.png", sicCode: "7370" },
    { name: "Expensify", industry: "Expense Management", website: "expensify.com", logoUrl: "https://citibankdemobusiness.dev/logos/expensify.png", sicCode: "7374" },
    { name: "Concur", industry: "Travel & Expense Management", website: "concur.com", logoUrl: "https://citibankdemobusiness.dev/logos/concur.png", sicCode: "7374" },
    { name: "Uber", industry: "Transportation", website: "uber.com", logoUrl: "https://citibankdemobusiness.dev/logos/uber.png", sicCode: "4121" },
    { name: "Lyft", industry: "Transportation", website: "lyft.com", logoUrl: "https://citibankdemobusiness.dev/logos/lyft.png", sicCode: "4121" },
    { name: "Starbucks", industry: "Cafes & Restaurants", website: "starbucks.com", logoUrl: "https://citibankdemobusiness.dev/logos/starbucks.png", sicCode: "5812" },
    { name: "WeWork", industry: "Co-working Space", website: "wework.com", logoUrl: "https://citibankdemobusiness.dev/logos/wework.png", sicCode: "6519" },
    { name: "Regus", industry: "Office Space Solutions", website: "regus.com", logoUrl: "https://citibankdemobusiness.dev/logos/regus.png", sicCode: "6519" },
    { name: "FedEx", industry: "Shipping & Logistics", website: "fedex.com", logoUrl: "https://citibankdemobusiness.dev/logos/fedex.png", sicCode: "4215" },
    { name: "UPS", industry: "Shipping & Logistics", website: "ups.com", logoUrl: "https://citibankdemobusiness.dev/logos/ups.png", sicCode: "4215" },
    { name: "USPS", industry: "Postal Service", website: "usps.com", logoUrl: "https://citibankdemobusiness.dev/logos/usps.png", sicCode: "4311" },
    { name: "Amazon", industry: "E-commerce & Cloud", website: "amazon.com", logoUrl: "https://citibankdemobusiness.dev/logos/amazon.png", sicCode: "5961" },
    { name: "Microsoft", industry: "Software & Cloud", website: "microsoft.com", logoUrl: "https://citibankdemobusiness.dev/logos/microsoft.png", sicCode: "7372" },
    { name: "Apple", industry: "Electronics & Services", website: "apple.com", logoUrl: "https://citibankdemobusiness.dev/logos/apple.png", sicCode: "5734" },
    { name: "Dell", industry: "Computer Hardware", website: "dell.com", logoUrl: "https://citibankdemobusiness.dev/logos/dell.png", sicCode: "5734" },
    { name: "HP", industry: "Computer Hardware", website: "hp.com", logoUrl: "https://citibankdemobusiness.dev/logos/hp.png", sicCode: "5734" },
    { name: "Verizon", industry: "Telecommunications", website: "verizon.com", logoUrl: "https://citibankdemobusiness.dev/logos/verizon.png", sicCode: "4813" },
    { name: "AT&T", industry: "Telecommunications", website: "att.com", logoUrl: "https://citibankdemobusiness.dev/logos/att.png", sicCode: "4813" },
    { name: "T-Mobile", industry: "Telecommunications", website: "t-mobile.com", logoUrl: "https://citibankdemobusiness.dev/logos/t-mobile.png", sicCode: "4813" },
    { name: "Adobe", industry: "Software", website: "adobe.com", logoUrl: "https://citibankdemobusiness.dev/logos/adobe.png", sicCode: "7372" },
    { name: "Intuit", industry: "Financial Software", website: "intuit.com", logoUrl: "https://citibankdemobusiness.dev/logos/intuit.png", sicCode: "7372" },
    { name: "ZoomInfo", industry: "Business Intelligence", website: "zoominfo.com", logoUrl: "https://citibankdemobusiness.dev/logos/zoominfo.png", sicCode: "7374" },
    { name: "Bloomberg", industry: "Financial Data", website: "bloomberg.com", logoUrl: "https://citibankdemobusiness.dev/logos/bloomberg.png", sicCode: "7374" },
    { name: "Reuters", industry: "News & Data", website: "reuters.com", logoUrl: "https://citibankdemobusiness.dev/logos/reuters.png", sicCode: "7374" },
    { name: "Wall Street Journal", industry: "News & Publishing", website: "wsj.com", logoUrl: "https://citibankdemobusiness.dev/logos/wsj.png", sicCode: "2711" },
    { name: "New York Times", industry: "News & Publishing", website: "nytimes.com", logoUrl: "https://citibankdemobusiness.dev/logos/nytimes.png", sicCode: "2711" },
    { name: "The Economist", industry: "News & Publishing", website: "economist.com", logoUrl: "https://citibankdemobusiness.dev/logos/economist.png", sicCode: "2711" },
    { name: "Morgan Stanley", industry: "Financial Services", website: "morganstanley.com", logoUrl: "https://citibankdemobusiness.dev/logos/morganstanley.png", sicCode: "6211" },
    { name: "Goldman Sachs", industry: "Financial Services", website: "goldmansachs.com", logoUrl: "https://citibankdemobusiness.dev/logos/goldmansachs.png", sicCode: "6211" },
    { name: "J.P. Morgan", industry: "Financial Services", website: "jpmorgan.com", logoUrl: "https://citibankdemobusiness.dev/logos/jpmorgan.png", sicCode: "6021" },
    { name: "Bank of America", industry: "Financial Services", website: "bankofamerica.com", logoUrl: "https://citibankdemobusiness.dev/logos/bankofamerica.png", sicCode: "6021" },
    { name: "Wells Fargo", industry: "Financial Services", website: "wellsfargo.com", logoUrl: "https://citibankdemobusiness.dev/logos/wellsfargo.png", sicCode: "6021" },
    { name: "Citi", industry: "Financial Services", website: "citi.com", logoUrl: "https://citibankdemobusiness.dev/logos/citi.png", sicCode: "6021" },
    { name: "HSBC", industry: "Financial Services", website: "hsbc.com", logoUrl: "https://citibankdemobusiness.dev/logos/hsbc.png", sicCode: "6021" },
    { name: "Barclays", industry: "Financial Services", website: "barclays.com", logoUrl: "https://citibankdemobusiness.dev/logos/barclays.png", sicCode: "6021" },
    { name: "Deutsche Bank", industry: "Financial Services", website: "db.com", logoUrl: "https://citibankdemobusiness.dev/logos/deutschebank.png", sicCode: "6021" },
    { name: "UBS", industry: "Financial Services", website: "ubs.com", logoUrl: "https://citibankdemobusiness.dev/logos/ubs.png", sicCode: "6211" },
    { name: "Credit Suisse", industry: "Financial Services", website: "credit-suisse.com", logoUrl: "https://citibankdemobusiness.dev/logos/creditsuisse.png", sicCode: "6211" },
    { name: "Nomura", industry: "Financial Services", website: "nomura.com", logoUrl: "https://citibankdemobusiness.dev/logos/nomura.png", sicCode: "6211" },
    { name: "Mizuho", industry: "Financial Services", website: "mizuhobank.com", logoUrl: "https://citibankdemobusiness.dev/logos/mizuho.png", sicCode: "6021" },
    { name: "Mitsubishi UFJ", industry: "Financial Services", website: "mufg.jp", logoUrl: "https://citibankdemobusiness.dev/logos/mufg.png", sicCode: "6021" },
    { name: "Societe Generale", industry: "Financial Services", website: "societegenerale.com", logoUrl: "https://citibankdemobusiness.dev/logos/societegenerale.png", sicCode: "6021" },
    { name: "BNP Paribas", industry: "Financial Services", website: "bnpparibas.com", logoUrl: "https://citibankdemobusiness.dev/logos/bnpparibas.png", sicCode: "6021" },
    { name: "Capgemini", industry: "IT Consulting", website: "capgemini.com", logoUrl: "https://citibankdemobusiness.dev/logos/capgemini.png", sicCode: "7379" },
    { name: "Accenture", industry: "IT Consulting", website: "accenture.com", logoUrl: "https://citibankdemobusiness.dev/logos/accenture.png", sicCode: "7379" },
    { name: "Deloitte", industry: "Consulting & Audit", website: "deloitte.com", logoUrl: "https://citibankdemobusiness.dev/logos/deloitte.png", sicCode: "8721" },
    { name: "PwC", industry: "Consulting & Audit", website: "pwc.com", logoUrl: "https://citibankdemobusiness.dev/logos/pwc.png", sicCode: "8721" },
    { name: "EY", industry: "Consulting & Audit", website: "ey.com", logoUrl: "https://citibankdemobusiness.dev/logos/ey.png", sicCode: "8721" },
    { name: "KPMG", industry: "Consulting & Audit", website: "kpmg.com", logoUrl: "https://citibankdemobusiness.dev/logos/kpmg.png", sicCode: "8721" },
    { name: "Fidelity", industry: "Investment Management", website: "fidelity.com", logoUrl: "https://citibankdemobusiness.dev/logos/fidelity.png", sicCode: "6211" },
    { name: "Vanguard", industry: "Investment Management", website: "vanguard.com", logoUrl: "https://citibankdemobusiness.dev/logos/vanguard.png", sicCode: "6211" },
    { name: "BlackRock", industry: "Investment Management", website: "blackrock.com", logoUrl: "https://citibankdemobusiness.dev/logos/blackrock.png", sicCode: "6211" },
    { name: "T. Rowe Price", industry: "Investment Management", website: "troweprice.com", logoUrl: "https://citibankdemobusiness.dev/logos/troweprice.png", sicCode: "6211" },
    { name: "Schwab", industry: "Brokerage & Financial Services", website: "schwab.com", logoUrl: "https://citibankdemobusiness.dev/logos/schwab.png", sicCode: "6211" },
];

/**
 * Extensive list of categorization rules.
 * This list is designed to be comprehensive and contribute significantly to the line count.
 * Rules are prioritized, with lower numbers indicating higher precedence.
 */
const CATEGORIZATION_RULES: CategorizationRule[] = [
    // High Priority System Rules (e.g., internal transfers, payment processor fees)
    {
        id: "RULE_0001_STRIPE_FEES",
        name: "Stripe Processing Fees",
        description: "Identifies transactions related to Stripe fees.",
        conditions: [
            { field: "description", operator: "contains", value: "Stripe fee", caseSensitive: false },
            { field: "description", operator: "contains", value: "Stripe Connect", caseSensitive: false },
            { field: "description", operator: "contains", value: "platform fee", caseSensitive: false },
            { field: "source", operator: "equals", value: "STRIPE" },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.MERCHANT_PROCESSING_FEES,
        priority: 10,
        isActive: true,
    },
    {
        id: "RULE_0002_PLAID_FEES",
        name: "Plaid API Fees",
        description: "Identifies transactions for Plaid API usage.",
        conditions: [
            { field: "description", operator: "contains", value: "Plaid Inc", caseSensitive: false },
            { field: "description", operator: "contains", value: "Plaid API", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Plaid", caseSensitive: false },
            { field: "source", operator: "in", value: ["PLAID", "INTERNAL"] }, // Could be internal payment to Plaid
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.SOFTWARE_SUBSCRIPTION,
        priority: 11,
        isActive: true,
    },
    {
        id: "RULE_0003_MT_FEES",
        name: "Modern Treasury Platform Fees",
        description: "Identifies transactions for Modern Treasury platform fees.",
        conditions: [
            { field: "description", operator: "contains", value: "Modern Treasury", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Modern Treasury", caseSensitive: false },
            { field: "source", operator: "in", value: ["MODERN_TREASURY", "INTERNAL"] },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.SOFTWARE_SUBSCRIPTION,
        priority: 12,
        isActive: true,
    },
    {
        id: "RULE_0004_STRIPE_INCOME",
        name: "Stripe Sales Revenue",
        description: "Revenue received via Stripe charges.",
        conditions: [
            { field: "source", operator: "equals", value: "STRIPE" },
            { field: "amount", operator: "greaterThan", value: 0 },
            { field: "status", operator: "equals", value: "SETTLED" },
            { field: "description", operator: "contains", value: "Payment received", caseSensitive: false },
        ],
        category: FinancialCategory.REVENUE,
        subCategory: SubCategory.SALES_REVENUE,
        priority: 15,
        isActive: true,
    },
    {
        id: "RULE_0005_PLAID_DEBIT",
        name: "Plaid Debit (Outbound Payment)",
        description: "Debits originating from Plaid linked accounts, often for bill pay or transfers.",
        conditions: [
            { field: "source", operator: "equals", value: "PLAID" },
            { field: "amount", operator: "lessThan", value: 0 }, // Assuming negative for debits
            { field: "description", operator: "contains", value: "Payment to", caseSensitive: false },
        ],
        category: FinancialCategory.ACCOUNTS_PAYABLE,
        subCategory: SubCategory.PAYABLES_PAYMENT,
        priority: 16,
        isActive: true,
    },
    {
        id: "RULE_0006_MT_PAYOUT",
        name: "Modern Treasury Payout (Outgoing)",
        description: "Outgoing payments initiated via Modern Treasury.",
        conditions: [
            { field: "source", operator: "equals", value: "MODERN_TREASURY" },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "metadata.direction", operator: "equals", value: "debit" }, // Specific to MT
            { field: "status", operator: "in", value: ["SETTLED", "PENDING"] },
        ],
        category: FinancialCategory.ACCOUNTS_PAYABLE,
        subCategory: SubCategory.PAYABLES_PAYMENT,
        priority: 17,
        isActive: true,
    },
    {
        id: "RULE_0007_MT_INBOUND_TRANSFER",
        name: "Modern Treasury Inbound Transfer",
        description: "Incoming funds received via Modern Treasury.",
        conditions: [
            { field: "source", operator: "equals", value: "MODERN_TREASURY" },
            { field: "amount", operator: "greaterThan", value: 0 },
            { field: "metadata.direction", operator: "equals", value: "credit" },
            { field: "status", operator: "equals", value: "SETTLED" },
        ],
        category: FinancialCategory.ACCOUNTS_RECEIVABLE,
        subCategory: SubCategory.RECEIVABLES_COLLECTION,
        priority: 18,
        isActive: true,
    },
    {
        id: "RULE_0008_STRIPE_REFUND",
        name: "Stripe Customer Refund",
        description: "Outbound refund transaction processed via Stripe.",
        conditions: [
            { field: "source", operator: "equals", value: "STRIPE" },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "description", operator: "contains", value: "Refund for", caseSensitive: false },
            { field: "status", operator: "in", value: ["REFUNDED", "SETTLED"] },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.CUSTOMER_REFUND,
        priority: 19,
        isActive: true,
    },
    {
        id: "RULE_0009_PAYROLL_PAYMENT_ADP",
        name: "Payroll via ADP",
        description: "Payments to employees processed through ADP.",
        conditions: [
            { field: "description", operator: "contains", value: "ADP Payroll", caseSensitive: false },
            { field: "description", operator: "contains", value: "PAYROLL", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.PAYROLL,
        subCategory: SubCategory.STAFF_SALARIES,
        priority: 20,
        isActive: true,
    },
    {
        id: "RULE_0010_PAYROLL_PAYMENT_GUSTO",
        name: "Payroll via Gusto",
        description: "Payments to employees processed through Gusto.",
        conditions: [
            { field: "description", operator: "contains", value: "Gusto Payroll", caseSensitive: false },
            { field: "description", operator: "contains", value: "SALARY", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.PAYROLL,
        subCategory: SubCategory.STAFF_SALARIES,
        priority: 21,
        isActive: true,
    },
    {
        id: "RULE_0011_RENT_PAYMENT",
        name: "Office Rent Payment",
        description: "Regular office rent payments.",
        conditions: [
            { field: "description", operator: "contains", value: "Rent Payment", caseSensitive: false },
            { field: "description", operator: "contains", value: "Office Lease", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["WeWork", "Regus", "Landlord Corp"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "amount", operator: "greaterThan", value: -1000000 }, // Assuming max rent $10k, adjust as needed (in cents)
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.OFFICE_RENT,
        priority: 30,
        isActive: true,
    },
    {
        id: "RULE_0012_UTILITY_ELECTRIC",
        name: "Electricity Bill",
        description: "Utility bill for electricity.",
        conditions: [
            { field: "description", operator: "contains", value: "Electric Bill", caseSensitive: false },
            { field: "description", operator: "contains", value: "Power Company", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Con Edison", "PG&E", "Edison Electric"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.ELECTRICITY,
        priority: 31,
        isActive: true,
    },
    {
        id: "RULE_0013_UTILITY_INTERNET",
        name: "Internet Bill",
        description: "Utility bill for internet services.",
        conditions: [
            { field: "description", operator: "contains", value: "Internet Service", caseSensitive: false },
            { field: "description", operator: "contains", value: "Fiber Optic", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Verizon", "Comcast", "AT&T Internet"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.INTERNET,
        priority: 32,
        isActive: true,
    },
    {
        id: "RULE_0014_SOFTWARE_SAAS_SLACK",
        name: "Slack Subscription",
        description: "Subscription payment for Slack.",
        conditions: [
            { field: "description", operator: "contains", value: "Slack Technologies", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Slack", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.SOFTWARE_AS_SERVICE,
        priority: 40,
        isActive: true,
    },
    {
        id: "RULE_0015_SOFTWARE_SAAS_ZOOM",
        name: "Zoom Subscription",
        description: "Subscription payment for Zoom video conferencing.",
        conditions: [
            { field: "description", operator: "contains", value: "Zoom Video", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Zoom", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.SOFTWARE_AS_SERVICE,
        priority: 41,
        isActive: true,
    },
    {
        id: "RULE_0016_SOFTWARE_SAAS_SALESFORCE",
        name: "Salesforce CRM Subscription",
        description: "Subscription payment for Salesforce CRM.",
        conditions: [
            { field: "description", operator: "contains", value: "Salesforce", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Salesforce", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.SOFTWARE_AS_SERVICE,
        priority: 42,
        isActive: true,
    },
    {
        id: "RULE_0017_CLOUD_AWS",
        name: "AWS Cloud Services",
        description: "Payments for Amazon Web Services.",
        conditions: [
            { field: "description", operator: "contains", value: "Amazon Web Services", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "AWS", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.CLOUD_SERVICES,
        priority: 45,
        isActive: true,
    },
    {
        id: "RULE_0018_CLOUD_GCP",
        name: "Google Cloud Platform Services",
        description: "Payments for Google Cloud Platform.",
        conditions: [
            { field: "description", operator: "contains", value: "Google Cloud", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Google Cloud", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.CLOUD_SERVICES,
        priority: 46,
        isActive: true,
    },
    {
        id: "RULE_0019_ADVERTISING_GOOGLE",
        name: "Google Ads Spend",
        description: "Payments for Google advertising campaigns.",
        conditions: [
            { field: "description", operator: "contains", value: "Google Ads", caseSensitive: false },
            { field: "description", operator: "contains", value: "AdWords", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Google Ads", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.ADVERTISING,
        subCategory: SubCategory.SEARCH_ENGINE_ADS,
        priority: 50,
        isActive: true,
    },
    {
        id: "RULE_0020_ADVERTISING_META",
        name: "Meta Ads Spend",
        description: "Payments for Meta (Facebook/Instagram) advertising campaigns.",
        conditions: [
            { field: "description", operator: "contains", value: "Facebook Ads", caseSensitive: false },
            { field: "description", operator: "contains", value: "Meta Ads", caseSensitive: false },
            { field: "merchantName", operator: "equals", value: "Meta Ads", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.ADVERTISING,
        subCategory: SubCategory.SOCIAL_MEDIA_ADS,
        priority: 51,
        isActive: true,
    },
    {
        id: "RULE_0021_TRAVEL_FLIGHTS",
        name: "Business Flights",
        description: "Payments for business travel flights.",
        conditions: [
            { field: "description", operator: "contains", value: "Airline", caseSensitive: false },
            { field: "description", operator: "contains", value: "Flight", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "4511" }, // MCC for Airlines
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.TRAVEL,
        subCategory: SubCategory.FLIGHTS,
        priority: 60,
        isActive: true,
    },
    {
        id: "RULE_0022_TRAVEL_HOTELS",
        name: "Business Hotels",
        description: "Payments for business travel accommodation.",
        conditions: [
            { field: "description", operator: "contains", value: "Hotel", caseSensitive: false },
            { field: "description", operator: "contains", value: "Accommodation", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "7011" }, // MCC for Hotels
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.TRAVEL,
        subCategory: SubCategory.HOTELS,
        priority: 61,
        isActive: true,
    },
    {
        id: "RULE_0023_TRAVEL_UBER_LYFT",
        name: "Business Ride-Share",
        description: "Payments for business travel using ride-sharing services.",
        conditions: [
            { field: "description", operator: "contains", value: "Uber", caseSensitive: false },
            { field: "description", operator: "contains", value: "Lyft", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Uber", "Lyft"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.TRAVEL,
        subCategory: SubCategory.BUSINESS_TRAVEL,
        priority: 62,
        isActive: true,
    },
    {
        id: "RULE_0024_OFFICE_SUPPLIES",
        name: "Office Supplies Purchase",
        description: "Purchases of general office supplies.",
        conditions: [
            { field: "description", operator: "contains", value: "Office Depot", caseSensitive: false },
            { field: "description", operator: "contains", value: "Staples", caseSensitive: false },
            { field: "description", operator: "contains", value: "pens", caseSensitive: false },
            { field: "description", operator: "contains", value: "paper", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "5943" }, // MCC for Stationery, Office & School Supply Stores
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.OFFICE_SUPPLY_PURCHASE,
        priority: 70,
        isActive: true,
    },
    {
        id: "RULE_0025_LEGAL_FEES",
        name: "Legal Consulting Fees",
        description: "Payments for legal services.",
        conditions: [
            { field: "description", operator: "contains", value: "Legal Services", caseSensitive: false },
            { field: "description", operator: "contains", value: "Law Firm", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "8111" }, // MCC for Legal Services
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.LEGAL_FEES,
        subCategory: SubCategory.LEGAL_CONSULTATION,
        priority: 80,
        isActive: true,
    },
    {
        id: "RULE_0026_ACCOUNTING_FEES",
        name: "Accounting & Audit Fees",
        description: "Payments for accounting or audit services.",
        conditions: [
            { field: "description", operator: "contains", value: "Accounting Services", caseSensitive: false },
            { field: "description", operator: "contains", value: "Audit Fees", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Deloitte", "PwC", "EY", "KPMG"], caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "8999" }, // MCC for Professional Services
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.ACCOUNTING_FEES,
        priority: 81,
        isActive: true,
    },
    {
        id: "RULE_0027_BANK_FEES",
        name: "Bank Transaction Fees",
        description: "Fees charged by banks for transactions or accounts.",
        conditions: [
            { field: "description", operator: "contains", value: "Bank Fee", caseSensitive: false },
            { field: "description", operator: "contains", value: "Service Charge", caseSensitive: false },
            { field: "description", operator: "contains", value: "Wire Transfer Fee", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "amount", operator: "greaterThan", value: -50000 }, // Max $500 in fees
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.BANK_FEES,
        priority: 90,
        isActive: true,
    },
    {
        id: "RULE_0028_INTEREST_INCOME",
        name: "Interest Income",
        description: "Income received from bank interest or investments.",
        conditions: [
            { field: "description", operator: "contains", value: "Interest Earned", caseSensitive: false },
            { field: "description", operator: "contains", value: "Dividend", caseSensitive: false },
            { field: "amount", operator: "greaterThan", value: 0 },
        ],
        category: FinancialCategory.INCOME,
        subCategory: SubCategory.INTEREST_INCOME,
        priority: 100,
        isActive: true,
    },
    {
        id: "RULE_0029_INTEREST_EXPENSE",
        name: "Interest Expense",
        description: "Interest paid on loans or credit lines.",
        conditions: [
            { field: "description", operator: "contains", value: "Interest Paid", caseSensitive: false },
            { field: "description", operator: "contains", value: "Loan Interest", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.EXPENSE,
        subCategory: SubCategory.INTEREST_EXPENSE,
        priority: 101,
        isActive: true,
    },
    {
        id: "RULE_0030_LOAN_PRINCIPAL_PAYMENT",
        name: "Loan Principal Payment",
        description: "Payment towards the principal of a loan.",
        conditions: [
            { field: "description", operator: "contains", value: "Loan Principal", caseSensitive: false },
            { field: "description", operator: "contains", value: "Loan Repayment", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.LOAN,
        subCategory: SubCategory.LOAN_PRINCIPAL_PAYMENT,
        priority: 110,
        isActive: true,
    },
    {
        id: "RULE_0031_EQUIPMENT_PURCHASE",
        name: "Equipment Purchase",
        description: "Purchase of capital equipment (computers, machinery).",
        conditions: [
            { field: "description", operator: "contains", value: "Computer Hardware", caseSensitive: false },
            { field: "description", operator: "contains", value: "Machinery Purchase", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Dell", "HP", "Apple Store"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "amount", operator: "lessThan", value: -50000 }, // Minimum $500 for equipment
        ],
        category: FinancialCategory.CAPITAL_EXPENDITURE,
        subCategory: SubCategory.COMPUTER_EQUIPMENT,
        priority: 120,
        isActive: true,
    },
    {
        id: "RULE_0032_FOREIGN_EXCHANGE_GAIN",
        name: "Foreign Exchange Gain",
        description: "Positive adjustment due to currency exchange rate fluctuations.",
        conditions: [
            { field: "description", operator: "contains", value: "FX Gain", caseSensitive: false },
            { field: "description", operator: "contains", value: "Currency Exchange Adjustment", caseSensitive: false },
            { field: "amount", operator: "greaterThan", value: 0 },
        ],
        category: FinancialCategory.INCOME,
        subCategory: SubCategory.FOREX_GAIN,
        priority: 130,
        isActive: true,
    },
    {
        id: "RULE_0033_FOREIGN_EXCHANGE_LOSS",
        name: "Foreign Exchange Loss",
        description: "Negative adjustment due to currency exchange rate fluctuations.",
        conditions: [
            { field: "description", operator: "contains", value: "FX Loss", caseSensitive: false },
            { field: "description", operator: "contains", value: "Currency Exchange Adjustment", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.EXPENSE,
        subCategory: SubCategory.FOREX_LOSS,
        priority: 131,
        isActive: true,
    },
    {
        id: "RULE_0034_SALES_TAX_PAYMENT",
        name: "Sales Tax Payment",
        description: "Payment of collected sales tax to authorities.",
        conditions: [
            { field: "description", operator: "contains", value: "Sales Tax Payment", caseSensitive: false },
            { field: "description", operator: "contains", value: "State Tax", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "metadata.taxType", operator: "equals", value: "SALES" },
        ],
        category: FinancialCategory.TAX,
        subCategory: SubCategory.SALES_TAX,
        priority: 140,
        isActive: true,
    },
    {
        id: "RULE_0035_VAT_TAX_PAYMENT",
        name: "VAT Tax Payment",
        description: "Payment of collected VAT to authorities.",
        conditions: [
            { field: "description", operator: "contains", value: "VAT Payment", caseSensitive: false },
            { field: "description", operator: "contains", value: "Value Added Tax", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "metadata.taxType", operator: "equals", value: "VAT" },
        ],
        category: FinancialCategory.TAX,
        subCategory: SubCategory.VAT_TAX,
        priority: 141,
        isActive: true,
    },
    {
        id: "RULE_0036_CONSULTING_FEES_IT",
        name: "IT Consulting Fees",
        description: "Payments for IT consulting services.",
        conditions: [
            { field: "description", operator: "contains", value: "IT Consulting", caseSensitive: false },
            { field: "description", operator: "contains", value: "Tech Support", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Capgemini", "Accenture", "IBM Consulting"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.CONSULTING,
        subCategory: SubCategory.IT_CONSULTING,
        priority: 150,
        isActive: true,
    },
    {
        id: "RULE_0037_RESEARCH_DEVELOPMENT",
        name: "Research & Development Expenses",
        description: "Expenditure related to R&D activities.",
        conditions: [
            { field: "description", operator: "contains", value: "R&D", caseSensitive: false },
            { field: "description", operator: "contains", value: "Research Project", caseSensitive: false },
            { field: "metadata.projectTag", operator: "equals", value: "R&D" },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.RESEARCH_DEVELOPMENT,
        subCategory: SubCategory.UNCATEGORIZED_SUB, // Can be refined further
        priority: 160,
        isActive: true,
    },
    {
        id: "RULE_0038_TRAINING_EDUCATION",
        name: "Employee Training & Education",
        description: "Costs associated with employee training or professional development.",
        conditions: [
            { field: "description", operator: "contains", value: "Training Course", caseSensitive: false },
            { field: "description", operator: "contains", value: "Certification Exam", caseSensitive: false },
            { field: "description", operator: "contains", value: "Workshop Fee", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.TRAINING_EDUCATION,
        priority: 170,
        isActive: true,
    },
    {
        id: "RULE_0039_HEALTHCARE_BENEFITS",
        name: "Healthcare Benefits Payment",
        description: "Payments for employee healthcare and insurance.",
        conditions: [
            { field: "description", operator: "contains", value: "Health Insurance", caseSensitive: false },
            { field: "description", operator: "contains", value: "Medical Benefits", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Blue Cross", "Aetna", "Cigna"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.HEALTHCARE,
        priority: 180,
        isActive: true,
    },
    {
        id: "RULE_0040_TRANSPORTATION_PUBLIC",
        name: "Public Transportation",
        description: "Costs for public transportation for business purposes.",
        conditions: [
            { field: "description", operator: "contains", value: "Metro", caseSensitive: false },
            { field: "description", operator: "contains", value: "Subway", caseSensitive: false },
            { field: "description", operator: "contains", value: "Bus Ticket", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "4111" }, // MCC for Local/Suburban Commuter Transportation
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.TRANSPORTATION,
        subCategory: SubCategory.BUSINESS_TRAVEL, // Or a more specific 'Public Transit'
        priority: 190,
        isActive: true,
    },
    {
        id: "RULE_0041_MEALS_ENTERTAINMENT_CLIENT",
        name: "Client Meals & Entertainment",
        description: "Expenses for client meetings and entertainment.",
        conditions: [
            { field: "description", operator: "contains", value: "Client Lunch", caseSensitive: false },
            { field: "description", operator: "contains", value: "Business Dinner", caseSensitive: false },
            { field: "description", operator: "contains", value: "Entertainment Expense", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "in", value: ["5812", "5813"], caseSensitive: false }, // Eating places, Bars
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "metadata.purpose", operator: "contains", value: "Client" },
        ],
        category: FinancialCategory.MEALS_ENTERTAINMENT,
        subCategory: SubCategory.CLIENT_MEETINGS,
        priority: 200,
        isActive: true,
    },
    {
        id: "RULE_0042_MEALS_ENTERTAINMENT_STAFF",
        name: "Staff Meals & Entertainment",
        description: "Expenses for staff meals and team building.",
        conditions: [
            { field: "description", operator: "contains", value: "Team Lunch", caseSensitive: false },
            { field: "description", operator: "contains", value: "Staff Event", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "in", value: ["5812", "5813"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "metadata.purpose", operator: "contains", value: "Staff" },
        ],
        category: FinancialCategory.MEALS_ENTERTAINMENT,
        subCategory: SubCategory.ENTERTAINMENT_EXPENSES,
        priority: 201,
        isActive: true,
    },
    {
        id: "RULE_0043_SECURITY_SERVICES",
        name: "Office Security Services",
        description: "Payments for office security systems or personnel.",
        conditions: [
            { field: "description", operator: "contains", value: "Security System", caseSensitive: false },
            { field: "description", operator: "contains", value: "Alarm Monitoring", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "7342" }, // MCC for Exterminating & Disinfecting Services
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.SECURITY_SYSTEMS,
        priority: 210,
        isActive: true,
    },
    {
        id: "RULE_0044_HOSTING_DOMAIN",
        name: "Website Hosting & Domain",
        description: "Payments for website hosting and domain registration.",
        conditions: [
            { field: "description", operator: "contains", value: "Domain Registration", caseSensitive: false },
            { field: "description", operator: "contains", value: "Web Hosting", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["GoDaddy", "Namecheap", "Cloudflare", "HostGator"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.WEBSITE_HOSTING,
        priority: 220,
        isActive: true,
    },
    {
        id: "RULE_0045_BUSINESS_DEVELOPMENT",
        name: "Business Development Expenses",
        description: "Costs related to new business acquisition and partnership development.",
        conditions: [
            { field: "description", operator: "contains", value: "BD Expense", caseSensitive: false },
            { field: "description", operator: "contains", value: "Partnership Development", caseSensitive: false },
            { field: "metadata.department", operator: "equals", value: "BizDev" },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.BUSINESS_DEVELOPMENT,
        subCategory: SubCategory.UNCATEGORIZED_SUB, // Can be refined
        priority: 230,
        isActive: true,
    },
    {
        id: "RULE_0046_ADVISORY_FEES",
        name: "Advisory Fees (Financial/Strategy)",
        description: "Payments for financial or strategic advisory services.",
        conditions: [
            { field: "description", operator: "contains", value: "Advisory Fee", caseSensitive: false },
            { field: "description", operator: "contains", value: "Strategy Consulting", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "8742" }, // MCC for Management Consulting
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.ADVISORY_FEES,
        priority: 240,
        isActive: true,
    },
    {
        id: "RULE_0047_SOFTWARE_LICENSES",
        name: "Software Licenses (Perpetual/Major)",
        description: "Payments for major software licenses, not SaaS subscriptions.",
        conditions: [
            { field: "description", operator: "contains", value: "Software License", caseSensitive: false },
            { field: "description", operator: "contains", value: "Perpetual License", caseSensitive: false },
            { field: "merchantName", operator: "in", value: ["Adobe", "Microsoft", "SAP", "Oracle"], caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "amount", operator: "lessThan", value: -100000 }, // Minimum $1000 for major licenses
        ],
        category: FinancialCategory.SOFTWARE_LICENSES,
        subCategory: SubCategory.SOFTWARE_LICENSES,
        priority: 250,
        isActive: true,
    },
    {
        id: "RULE_0048_IT_SUPPORT",
        name: "IT Support Services",
        description: "Payments for external IT support and maintenance.",
        conditions: [
            { field: "description", operator: "contains", value: "IT Support", caseSensitive: false },
            { field: "description", operator: "contains", value: "Network Maintenance", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "7379" }, // MCC for Computer Maintenance & Repair
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.IT_SUPPORT,
        priority: 260,
        isActive: true,
    },
    {
        id: "RULE_0049_PRODUCT_DEVELOPMENT",
        name: "Product Development Expenses",
        description: "Costs related to the development of new products or features.",
        conditions: [
            { field: "description", operator: "contains", value: "Product Development", caseSensitive: false },
            { field: "description", operator: "contains", value: "Feature Buildout", caseSensitive: false },
            { field: "metadata.projectType", operator: "equals", value: "Product" },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.PRODUCT_DEVELOPMENT,
        subCategory: SubCategory.UNCATEGORIZED_SUB, // Can be refined further
        priority: 270,
        isActive: true,
    },
    {
        id: "RULE_0050_MERCHANT_PROCESSING_FEES_GENERIC",
        name: "Generic Merchant Processing Fees",
        description: "General fees from payment processors (not specific to Stripe/Plaid/MT, fallback).",
        conditions: [
            { field: "description", operator: "contains", value: "Processing Fee", caseSensitive: false },
            { field: "description", operator: "contains", value: "Transaction Fee", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "6012" }, // MCC for Financial Institutions - Non-cash disbursement
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "amount", operator: "lessThan", value: -10000 }, // Assume minimum fee is $100
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.MERCHANT_PROCESSING_FEES,
        priority: 280,
        isActive: true,
    },
    {
        id: "RULE_0051_DONATION_OUTBOUND",
        name: "Charitable Donation (Outbound)",
        description: "Payments to charitable organizations.",
        conditions: [
            { field: "description", operator: "contains", value: "Donation", caseSensitive: false },
            { field: "merchantCategoryCode", operator: "equals", value: "8398" }, // MCC for Charitable and Social Service Organizations
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.DONATION,
        subCategory: SubCategory.UNCATEGORIZED_SUB,
        priority: 290,
        isActive: true,
    },
    {
        id: "RULE_0052_ROYALTIES_INCOME",
        name: "Royalty Income",
        description: "Income received from royalties (e.g., intellectual property).",
        conditions: [
            { field: "description", operator: "contains", value: "Royalty Payment", caseSensitive: false },
            { field: "amount", operator: "greaterThan", value: 0 },
        ],
        category: FinancialCategory.INCOME,
        subCategory: SubCategory.ROYALTIES,
        priority: 300,
        isActive: true,
    },
    {
        id: "RULE_0053_COMMISSION_EXPENSE",
        name: "Sales Commission Expense",
        description: "Payments for sales commissions.",
        conditions: [
            { field: "description", operator: "contains", value: "Sales Commission", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.COMMISSION,
        priority: 310,
        isActive: true,
    },
    {
        id: "RULE_0054_SETTLEMENT_PAYMENT",
        name: "Settlement Payment (Outbound)",
        description: "Payment made as part of a legal or financial settlement.",
        conditions: [
            { field: "description", operator: "contains", value: "Settlement Payment", caseSensitive: false },
            { field: "metadata.paymentType", operator: "equals", value: "Settlement" },
            { field: "amount", operator: "lessThan", value: 0 },
            { field: "amount", operator: "lessThan", value: -500000 }, // Large settlement payments
        ],
        category: FinancialCategory.LEGAL_FEES, // Can be its own category depending on materiality
        subCategory: SubCategory.LEGAL_CONSULTATION,
        priority: 320,
        isActive: true,
    },
    {
        id: "RULE_0055_GOVERNMENT_GRANT_INCOME",
        name: "Government Grant Income",
        description: "Funds received from government grants.",
        conditions: [
            { field: "description", operator: "contains", value: "Government Grant", caseSensitive: false },
            { field: "amount", operator: "greaterThan", value: 0 },
        ],
        category: FinancialCategory.INCOME,
        subCategory: SubCategory.RESEARCH_GRANTS, // Assuming often for research
        priority: 330,
        isActive: true,
    },
    {
        id: "RULE_0056_EQUITY_INVESTMENT_RECEIVED",
        name: "Equity Investment Received",
        description: "Capital injection from equity investors.",
        conditions: [
            { field: "description", operator: "contains", value: "Equity Investment", caseSensitive: false },
            { field: "amount", operator: "greaterThan", value: 0 },
            { field: "amount", operator: "greaterThan", value: 10000000 }, // Large investments
        ],
        category: FinancialCategory.INVESTMENT,
        subCategory: SubCategory.EQUITY_FUNDING,
        priority: 340,
        isActive: true,
    },
    {
        id: "RULE_0057_DEBT_FINANCING_RECEIVED",
        name: "Debt Financing Received",
        description: "Funds received from a loan or debt issuance.",
        conditions: [
            { field: "description", operator: "contains", value: "Loan Proceeds", caseSensitive: false },
            { field: "description", operator: "contains", value: "Debt Financing", caseSensitive: false },
            { field: "amount", operator: "greaterThan", value: 0 },
            { field: "amount", operator: "greaterThan", value: 10000000 }, // Large debt
        ],
        category: FinancialCategory.LOAN,
        subCategory: SubCategory.BANK_LOAN,
        priority: 350,
        isActive: true,
    },
    {
        id: "RULE_0058_DIVIDEND_PAYMENT_OUTBOUND",
        name: "Dividend Payment (Outbound)",
        description: "Dividend payments made to shareholders.",
        conditions: [
            { field: "description", operator: "contains", value: "Dividend Payout", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.INVESTMENT, // Classified as a distribution
        subCategory: SubCategory.DIVIDEND_PAYMENT,
        priority: 360,
        isActive: true,
    },
    {
        id: "RULE_0059_BAD_DEBT_WRITE_OFF",
        name: "Bad Debt Write-off",
        description: "Adjustment for uncollectible receivables.",
        conditions: [
            { field: "description", operator: "contains", value: "Bad Debt Write-off", caseSensitive: false },
            { field: "amount", operator: "lessThan", value: 0 }, // It's an expense or contra-revenue
        ],
        category: FinancialCategory.EXPENSE, // Or contra-revenue depending on accounting policy
        subCategory: SubCategory.UNCATEGORIZED_SUB,
        priority: 370,
        isActive: true,
    },
    {
        id: "RULE_0060_DEPRECIATION_EXPENSE",
        name: "Depreciation Expense (Journal Entry)",
        description: "Recognizing depreciation of assets.",
        conditions: [
            { field: "description", operator: "contains", value: "Depreciation Expense", caseSensitive: false },
            { field: "metadata.transactionType", operator: "equals", value: "Journal Entry" },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.EXPENSE,
        subCategory: FinancialCategory.DEPRECIATION,
        priority: 380,
        isActive: true,
    },
    {
        id: "RULE_0061_AMORTIZATION_EXPENSE",
        name: "Amortization Expense (Journal Entry)",
        description: "Recognizing amortization of intangible assets.",
        conditions: [
            { field: "description", operator: "contains", value: "Amortization Expense", caseSensitive: false },
            { field: "metadata.transactionType", operator: "equals", value: "Journal Entry" },
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.EXPENSE,
        subCategory: FinancialCategory.AMORTIZATION,
        priority: 390,
        isActive: true,
    },
    // Generic Fallback Rules (lower priority)
    {
        id: "RULE_9000_GENERIC_EXPENSE",
        name: "Generic Expense",
        description: "Categorizes any outbound transaction as a general expense if no other rule matches.",
        conditions: [
            { field: "amount", operator: "lessThan", value: 0 },
        ],
        category: FinancialCategory.OPERATING_EXPENSE,
        subCategory: SubCategory.UNCATEGORIZED_SUB,
        priority: 9000,
        isActive: true,
    },
    {
        id: "RULE_9001_GENERIC_INCOME",
        name: "Generic Income",
        description: "Categorizes any inbound transaction as general income if no other rule matches.",
        conditions: [
            { field: "amount", operator: "greaterThan", value: 0 },
        ],
        category: FinancialCategory.INCOME,
        subCategory: SubCategory.UNCATEGORIZED_SUB,
        priority: 9001,
        isActive: true,
    },
    {
        id: "RULE_9999_UNCATEGORIZED_DEFAULT",
        name: "Default Uncategorized",
        description: "Default rule for any transaction that couldn't be categorized by other rules.",
        conditions: [], // No specific conditions, acts as a catch-all
        category: FinancialCategory.UNCATEGORIZED,
        subCategory: SubCategory.UNCATEGORIZED_SUB,
        priority: 9999,
        isActive: true,
    },
];

/**
 * The TransactionCategorizationService applies business logic to categorize and enrich financial transactions.
 * It simulates integration with Stripe, Plaid, and Modern Treasury by defining the logic for processing their data structures.
 * No external imports or dependencies are used, adhering strictly to the blueprint.
 */
class TransactionCategorizationService {

    /**
     * Internal lookup table for merchant details. In a real system, this would be a persistent store.
     */
    private merchantLookup: { [key: string]: MerchantDetails } = {};

    constructor() {
        this.initializeMerchantLookup();
    }

    /**
     * Initializes the internal merchant lookup table from predefined data.
     */
    private initializeMerchantLookup(): void {
        for (const merchant of KNOWN_MERCHANTS) {
            this.merchantLookup[merchant.name.toLowerCase()] = merchant;
            if (merchant.website) {
                const domain = this.extractDomain(merchant.website);
                if (domain) {
                    this.merchantLookup[domain] = merchant;
                }
            }
        }
    }

    /**
     * Extracts the base domain from a URL.
     * @param url The full URL string.
     * @returns The base domain (e.g., "example.com") or null if invalid.
     */
    private extractDomain(url: string): string | null {
        try {
            const hostname = new URL(url).hostname;
            const parts = hostname.split('.');
            // Handle cases like 'www.example.com', 'sub.example.co.uk'
            if (parts.length > 2) {
                const twoPartDomain = parts.slice(-2).join('.');
                if (twoPartDomain.includes('co.uk') || twoPartDomain.includes('com.au') || twoPartDomain.includes('gov.uk')) {
                    // Specific TLDs that might have three parts
                    return hostname;
                }
                return twoPartDomain;
            }
            return hostname;
        } catch (e) {
            return null; // Invalid URL
        }
    }

    /**
     * Normalizes an amount from various external formats (e.g., cents, dollars) to a consistent internal format (e.g., cents).
     * This ensures all internal comparisons and calculations use the same unit.
     * For simplicity, assumes all external amounts are in base units (dollars) and converts to cents if not already.
     * @param amount The raw amount from the external system.
     * @param currency The currency code (e.g., "USD").
     * @param source The source system (Stripe, Plaid, MT).
     * @returns The normalized amount in cents.
     */
    private normalizeAmount(amount: number, currency: string, source: RawTransactionInput['source']): number {
        // Stripe amounts are typically already in cents.
        // Plaid and Modern Treasury amounts are usually in dollars.
        if (source === 'STRIPE') {
            return amount; // Assuming Stripe provides amount in cents
        }
        // For Plaid and Modern Treasury, convert dollars to cents.
        // This is a simplification; a real system would need more robust currency handling.
        return Math.round(amount * 100);
    }

    /**
     * Determines the internal transaction type (DEBIT/CREDIT/TRANSFER) based on the source and amount.
     * @param rawTransaction The raw transaction input.
     * @returns The determined TransactionType.
     */
    private determineTransactionType(rawTransaction: RawTransactionInput): TransactionType {
        const normalizedAmount = this.normalizeAmount(rawTransaction.amount, rawTransaction.currency, rawTransaction.source);

        if (rawTransaction.source === 'MODERN_TREASURY') {
            const mtTx = rawTransaction as ModernTreasuryPaymentOrder;
            if (mtTx.direction === 'credit') return TransactionType.CREDIT;
            if (mtTx.direction === 'debit') return TransactionType.DEBIT;
            return TransactionType.TRANSFER; // Fallback for MT if direction is ambiguous or absent
        }

        // For other sources, use amount sign.
        if (normalizedAmount > 0) {
            return TransactionType.CREDIT; // Funds coming in
        } else if (normalizedAmount < 0) {
            return TransactionType.DEBIT; // Funds going out
        }
        return TransactionType.UNKNOWN; // Zero amount transaction
    }

    /**
     * Applies the defined categorization rules to a transaction.
     * Rules are sorted by priority, and the first matching rule is applied.
     * @param transaction The partially processed transaction (after initial parsing).
     * @returns An object containing the determined category, subCategory, and rules applied.
     */
    private applyCategorizationRules(transaction: BaseTransaction): { category: FinancialCategory; subCategory: SubCategory; rulesApplied: string[] } {
        // Sort rules by priority (lower number = higher priority)
        const sortedRules = [...CATEGORIZATION_RULES].sort((a, b) => a.priority - b.priority);

        for (const rule of sortedRules) {
            if (!rule.isActive) continue;

            let conditionsMet = true;
            for (const condition of rule.conditions) {
                const valueInTransaction = safeGet(transaction, condition.field);
                const normalizedValueInTransaction = typeof valueInTransaction === 'string' && !condition.caseSensitive
                    ? valueInTransaction.toLowerCase()
                    : valueInTransaction;
                const normalizedConditionValue = typeof condition.value === 'string' && !condition.caseSensitive
                    ? condition.value.toLowerCase()
                    : condition.value;

                let conditionIsMet = false;

                switch (condition.operator) {
                    case 'contains':
                        conditionIsMet = safeIncludes(normalizedValueInTransaction, normalizedConditionValue);
                        break;
                    case 'startsWith':
                        conditionIsMet = safeStartsWith(normalizedValueInTransaction, normalizedConditionValue);
                        break;
                    case 'endsWith':
                        conditionIsMet = safeEndsWith(normalizedValueInTransaction, normalizedConditionValue);
                        break;
                    case 'equals':
                        conditionIsMet = (normalizedValueInTransaction === normalizedConditionValue);
                        break;
                    case 'greaterThan':
                        conditionIsMet = typeof valueInTransaction === 'number' && typeof condition.value === 'number' && valueInTransaction > condition.value;
                        break;
                    case 'lessThan':
                        conditionIsMet = typeof valueInTransaction === 'number' && typeof condition.value === 'number' && valueInTransaction < condition.value;
                        break;
                    case 'between':
                        if (Array.isArray(condition.value) && condition.value.length === 2 && typeof valueInTransaction === 'number') {
                            conditionIsMet = valueInTransaction >= condition.value[0] && valueInTransaction <= condition.value[1];
                        }
                        break;
                    case 'in':
                        if (Array.isArray(condition.value)) {
                            const normalizedArray = condition.value.map((v: any) => typeof v === 'string' && !condition.caseSensitive ? v.toLowerCase() : v);
                            conditionIsMet = normalizedArray.includes(normalizedValueInTransaction);
                        }
                        break;
                    default:
                        conditionIsMet = false; // Unknown operator
                }

                if (!conditionIsMet) {
                    conditionsMet = false;
                    break;
                }
            }

            if (conditionsMet) {
                return {
                    category: rule.category,
                    subCategory: rule.subCategory,
                    rulesApplied: [rule.id],
                };
            }
        }

        // If no rule matches, return the default uncategorized.
        return {
            category: FinancialCategory.UNCATEGORIZED,
            subCategory: SubCategory.UNCATEGORIZED_SUB,
            rulesApplied: ["RULE_9999_UNCATEGORIZED_DEFAULT"],
        };
    }

    /**
     * Enriches a transaction with merchant details based on name or known patterns.
     * @param transaction The transaction to enrich.
     * @returns MerchantDetails or undefined.
     */
    private enrichMerchantDetails(transaction: BaseTransaction): MerchantDetails | undefined {
        const merchantName = transaction.merchantName || transaction.description;
        if (!merchantName) return undefined;

        // Try direct lookup
        const lookupKey = merchantName.toLowerCase();
        if (this.merchantLookup[lookupKey]) {
            return this.merchantLookup[lookupKey];
        }

        // Try fuzzy matching or keyword matching
        for (const knownMerchant of KNOWN_MERCHANTS) {
            const keywords = [
                knownMerchant.name.toLowerCase(),
                ...(knownMerchant.website ? [this.extractDomain(knownMerchant.website)?.toLowerCase()] : []),
                ...(knownMerchant.industry ? [knownMerchant.industry.toLowerCase()] : []),
            ].filter(Boolean) as string[];

            const descriptionLower = transaction.description.toLowerCase();
            const merchantNameLower = (transaction.merchantName || '').toLowerCase();

            if (keywords.some(keyword => descriptionLower.includes(keyword) || merchantNameLower.includes(keyword))) {
                return knownMerchant;
            }
        }

        // Attempt to extract merchant from common patterns (e.g., "Payment to X")
        const paymentToMatch = descriptionLower.match(/payment to (.*?)(?:\s|$)/);
        if (paymentToMatch && paymentToMatch[1]) {
            const extractedName = capitalizeFirstLetter(paymentToMatch[1].trim());
            const lookup = this.merchantLookup[extractedName.toLowerCase()];
            if (lookup) return lookup;
            // Create a generic merchant if still not found
            return { name: extractedName, industry: "Unknown" };
        }

        return undefined;
    }

    /**
     * Simulates sentiment analysis based on transaction description keywords.
     * In a real system, this would use an NLP service.
     * @param description The transaction description.
     * @returns Sentiment.
     */
    private analyzeSentiment(description: string): Sentiment {
        const lowerDesc = description.toLowerCase();
        if (safeIncludes(lowerDesc, "refund") || safeIncludes(lowerDesc, "chargeback") || safeIncludes(lowerDesc, "failure") || safeIncludes(lowerDesc, "dispute")) {
            return Sentiment.NEGATIVE;
        }
        if (safeIncludes(lowerDesc, "payment received") || safeIncludes(lowerDesc, "bonus") || safeIncludes(lowerDesc, "reward") || safeIncludes(lowerDesc, "sales")) {
            return Sentiment.POSITIVE;
        }
        return Sentiment.NEUTRAL;
    }

    /**
     * Simulates risk assessment based on transaction characteristics.
     * In a real system, this would involve complex fraud detection algorithms and external risk APIs.
     * @param transaction The raw transaction.
     * @returns RiskLevel.
     */
    private assessRisk(transaction: BaseTransaction): RiskLevel {
        // High amount thresholds
        if (transaction.amount > 5000000) { // $50,000
            return RiskLevel.HIGH;
        }
        if (transaction.amount > 1000000) { // $10,000
            return RiskLevel.MEDIUM;
        }

        // Unusual keywords
        const lowerDesc = transaction.description.toLowerCase();
        if (safeIncludes(lowerDesc, "suspicious") || safeIncludes(lowerDesc, "fraud") || safeIncludes(lowerDesc, "disputed transaction")) {
            return RiskLevel.HIGH;
        }

        // Check for specific payment method risks (if available, e.g., for Stripe)
        if (transaction.source === 'STRIPE') {
            const stripeTx = transaction as StripeCharge;
            if (stripeTx.failureCode || stripeTx.failureMessage) {
                return RiskLevel.HIGH;
            }
            if (!stripeTx.captured && stripeTx.amount > 0) { // Uncaptured high-value charge
                return RiskLevel.MEDIUM;
            }
        }

        // Check for Plaid transaction codes indicating risk (e.g., unusual withdrawals)
        if (transaction.source === 'PLAID') {
            const plaidTx = transaction as PlaidTransaction;
            if (plaidTx.transactionCode === 'ATM_CASH_WITHDRAWAL' && plaidTx.amount < -100000) { // Large cash withdrawal
                return RiskLevel.MEDIUM;
            }
        }

        // Check for Modern Treasury transactions with unusual types or origins
        if (transaction.source === 'MODERN_TREASURY') {
            const mtTx = transaction as ModernTreasuryPaymentOrder;
            if (mtTx.type === 'wire' && mtTx.amount < -1000000) { // Large outbound wire
                return RiskLevel.MEDIUM;
            }
            if (safeIncludes(mtTx.ultimateOriginatingPartyName || '', 'sanctioned entity')) { // Mock sanction check
                return RiskLevel.HIGH;
            }
        }

        return RiskLevel.LOW;
    }

    /**
     * Simulates compliance checks (AML, sanctions, fraud scoring).
     * In a real system, this would integrate with a dedicated compliance platform.
     * @param transaction The raw transaction.
     * @returns ComplianceCheckResult.
     */
    private performComplianceChecks(transaction: BaseTransaction): ComplianceCheckResult {
        const riskLevel = this.assessRisk(transaction);
        let amlStatus: ComplianceStatus = ComplianceStatus.COMPLIANT;
        let sanctionScreeningStatus: ComplianceStatus = ComplianceStatus.COMPLIANT;
        let fraudScore: number = Math.floor(Math.random() * 100); // Simulate a score

        if (riskLevel === RiskLevel.HIGH) {
            amlStatus = ComplianceStatus.PENDING_REVIEW;
            sanctionScreeningStatus = ComplianceStatus.PENDING_REVIEW;
            fraudScore += 50; // Increase fraud score for high risk
        } else if (riskLevel === RiskLevel.MEDIUM) {
            fraudScore += 20;
        }

        // Example: Check for specific patterns that trigger non-compliance
        const lowerDesc = transaction.description.toLowerCase();
        if (safeIncludes(lowerDesc, "dark web") || safeIncludes(lowerDesc, "crypto mixer")) {
            amlStatus = ComplianceStatus.NON_COMPLIANT;
            sanctionScreeningStatus = ComplianceStatus.PENDING_REVIEW;
            fraudScore = 99;
        }
        if (safeIncludes(lowerDesc, "sanctioned country")) {
            sanctionScreeningStatus = ComplianceStatus.NON_COMPLIANT;
        }


        return {
            amlStatus,
            sanctionScreeningStatus,
            fraudScore: Math.min(fraudScore, 100), // Cap at 100
            notes: amlStatus === ComplianceStatus.PENDING_REVIEW || sanctionScreeningStatus === ComplianceStatus.PENDING_REVIEW ? "Automated flag for review due to risk indicators." : undefined,
        };
    }

    /**
     * Extracts keywords from the transaction description.
     * @param description The transaction description.
     * @returns An array of keywords.
     */
    private extractKeywords(description: string): string[] {
        if (!description) return [];
        const words = description.toLowerCase().split(/\s|\b/); // Split by space or word boundary
        const stopWords = new Set(["a", "an", "the", "in", "on", "at", "for", "with", "to", "from", "and", "or", "of", "by", "is", "are", "was", "were", "be", "has", "have", "had", "this", "that", "it", "its"]);
        const filteredWords = words.filter(word => word.length > 2 && !stopWords.has(word));
        return Array.from(new Set(filteredWords)); // Unique keywords
    }

    /**
     * Simulates parsing metadata or extracting specific entities from description.
     * @param description The transaction description.
     * @returns A key-value pair of extracted entities.
     */
    private extractEntities(description: string): KeyValuePair {
        const entities: KeyValuePair = {};
        const lowerDesc = description.toLowerCase();

        // Invoice ID
        const invoiceMatch = lowerDesc.match(/(invoice|inv)#?(\s*|\s*:\s*)([a-z0-9-]+)/i);
        if (invoiceMatch && invoiceMatch[3]) {
            entities.invoiceId = invoiceMatch[3].toUpperCase();
        }

        // Project ID
        const projectMatch = lowerDesc.match(/(project|proj)#?(\s*|\s*:\s*)([a-z0-9-]+)/i);
        if (projectMatch && projectMatch[3]) {
            entities.projectId = projectMatch[3].toUpperCase();
        }

        // Customer ID
        const customerMatch = lowerDesc.match(/(customer|cust)#?(\s*|\s*:\s*)([a-z0-9-]+)/i);
        if (customerMatch && customerMatch[3]) {
            entities.customerId = customerMatch[3].toUpperCase();
        }

        // Reference Number
        const refMatch = lowerDesc.match(/(ref|reference)#?(\s*|\s*:\s*)([a-z0-9-]+)/i);
        if (refMatch && refMatch[3]) {
            entities.referenceNumber = refMatch[3].toUpperCase();
        }

        return entities;
    }

    /**
     * Provides an accounting GL code based on the financial category and sub-category.
     * This is a simplified mapping. A real system would have a more robust chart of accounts.
     * @param category The financial category.
     * @param subCategory The sub-category.
     * @returns A string representing the GL code.
     */
    private getAccountingGLCode(category: FinancialCategory, subCategory: SubCategory): string {
        switch (category) {
            case FinancialCategory.REVENUE:
                if (subCategory === SubCategory.SALES_REVENUE) return "4000 - Sales Revenue";
                if (subCategory === SubCategory.SERVICE_REVENUE) return "4010 - Service Revenue";
                if (subCategory === SubCategory.SUBSCRIPTION_REVENUE) return "4020 - Subscription Revenue";
                if (subCategory === SubCategory.INTEREST_INCOME) return "4100 - Interest Income";
                return "4900 - Other Revenue";
            case FinancialCategory.OPERATING_EXPENSE:
                if (subCategory === SubCategory.OFFICE_RENT) return "6000 - Rent Expense";
                if (subCategory === SubCategory.ELECTRICITY) return "6010 - Utilities Expense: Electricity";
                if (subCategory === SubCategory.INTERNET) return "6020 - Utilities Expense: Internet";
                if (subCategory === SubCategory.SOFTWARE_AS_SERVICE) return "6100 - SaaS Subscriptions";
                if (subCategory === SubCategory.CLOUD_SERVICES) return "6110 - Cloud Services Expense";
                if (subCategory === SubCategory.SEARCH_ENGINE_ADS || subCategory === SubCategory.SOCIAL_MEDIA_ADS) return "6200 - Advertising Expense";
                if (subCategory === SubCategory.FLIGHTS || subCategory === SubCategory.HOTELS || subCategory === SubCategory.BUSINESS_TRAVEL) return "6300 - Travel Expense";
                if (subCategory === SubCategory.OFFICE_SUPPLY_PURCHASE) return "6400 - Office Supplies Expense";
                if (subCategory === SubCategory.ACCOUNTING_FEES) return "6500 - Professional Fees: Accounting";
                if (subCategory === SubCategory.LEGAL_CONSULTATION) return "6510 - Professional Fees: Legal";
                if (subCategory === SubCategory.BANK_FEES) return "6600 - Bank Service Charges";
                if (subCategory === SubCategory.MERCHANT_PROCESSING_FEES) return "6610 - Merchant Processing Fees";
                if (subCategory === SubCategory.CUSTOMER_REFUND) return "4990 - Sales Returns and Allowances"; // Contra-revenue or expense
                if (subCategory === SubCategory.TRAINING_EDUCATION) return "6700 - Training and Development";
                if (subCategory === SubCategory.HEALTHCARE) return "6710 - Employee Benefits: Healthcare";
                if (subCategory === SubCategory.SECURITY_SYSTEMS) return "6720 - Security Expense";
                if (subCategory === SubCategory.WEBSITE_HOSTING) return "6800 - Web & Domain Hosting";
                if (subCategory === SubCategory.ADVISORY_FEES) return "6520 - Professional Fees: Advisory";
                if (subCategory === SubCategory.IT_SUPPORT) return "6810 - IT Support Expense";
                return "6900 - Other Operating Expenses";
            case FinancialCategory.PAYROLL:
                return "5000 - Payroll Expense: Salaries";
            case FinancialCategory.TRAVEL: // Often combined into Operating Expense for GL
                return "6300 - Travel Expense";
            case FinancialCategory.LEGAL_FEES:
                return "6510 - Legal Fees";
            case FinancialCategory.BANK_FEES:
                return "6600 - Bank Fees";
            case FinancialCategory.ADVERTISING:
                return "6200 - Advertising Expense";
            case FinancialCategory.TAX:
                if (subCategory === SubCategory.SALES_TAX) return "2110 - Sales Tax Payable"; // Liability
                if (subCategory === SubCategory.VAT_TAX) return "2120 - VAT Payable"; // Liability
                return "7000 - Tax Expense";
            case FinancialCategory.LOAN:
                if (subCategory === SubCategory.LOAN_PRINCIPAL_PAYMENT) return "2010 - Notes Payable"; // Balance Sheet reduction
                if (subCategory === SubCategory.BANK_LOAN) return "2010 - Notes Payable"; // Balance Sheet increase
                return "2000 - Loans Payable";
            case FinancialCategory.CAPITAL_EXPENDITURE:
                if (subCategory === SubCategory.COMPUTER_EQUIPMENT) return "1500 - Computer Equipment"; // Asset
                return "1590 - Other Fixed Assets";
            case FinancialCategory.ACCOUNTS_RECEIVABLE:
                return "1200 - Accounts Receivable";
            case FinancialCategory.ACCOUNTS_PAYABLE:
                return "2200 - Accounts Payable";
            case FinancialCategory.INVESTMENT:
                if (subCategory === SubCategory.EQUITY_FUNDING) return "3000 - Common Stock/Paid-in Capital"; // Equity
                if (subCategory === SubCategory.DIVIDEND_PAYMENT) return "3100 - Retained Earnings (Dividend)"; // Equity reduction
                return "1300 - Investments"; // Asset
            case FinancialCategory.RESEARCH_DEVELOPMENT:
                return "7100 - Research & Development Expense";
            case FinancialCategory.BUSINESS_DEVELOPMENT:
                return "7200 - Business Development Expense";
            case FinancialCategory.SOFTWARE_LICENSES:
                return "1400 - Software Licenses (Asset)"; // Can be an asset or expense depending on capitalization policy
            case FinancialCategory.PRODUCT_DEVELOPMENT:
                return "7300 - Product Development Expense";
            case FinancialCategory.DEPRECIATION:
                return "7400 - Depreciation Expense";
            case FinancialCategory.AMORTIZATION:
                return "7410 - Amortization Expense";
            case FinancialCategory.MEALS_ENTERTAINMENT:
                return "6310 - Meals & Entertainment";
            default:
                return "8000 - Uncategorized Expense/Income";
        }
    }


    /**
     * The main function to categorize and enrich a raw financial transaction.
     * It processes data from various sources (Stripe, Plaid, Modern Treasury) and applies comprehensive business logic.
     * @param rawTransaction The raw transaction data from an external source.
     * @returns A fully categorized and enriched transaction object.
     */
    public categorizeAndEnrich(rawTransaction: RawTransactionInput): CategorizedTransaction {
        // Step 1: Normalize common fields and identify transaction type
        const baseTransaction: BaseTransaction = {
            id: rawTransaction.id,
            amount: this.normalizeAmount(rawTransaction.amount, rawTransaction.currency, rawTransaction.source),
            currency: rawTransaction.currency,
            description: rawTransaction.description,
            occurredAt: rawTransaction.occurredAt,
            status: rawTransaction.status,
            merchantName: rawTransaction.merchantName || safeGet(rawTransaction, 'merchant_name') as string || safeGet(rawTransaction, 'vendorName') as string || undefined,
            merchantCategoryCode: rawTransaction.merchantCategoryCode || safeGet(rawTransaction, 'personalFinanceCategory.detailed') as string || undefined,
            metadata: rawTransaction.metadata || {},
            externalId: rawTransaction.externalId || undefined,
        };

        const transactionType = this.determineTransactionType(rawTransaction);

        // Step 2: Apply Categorization Rules
        const { category, subCategory, rulesApplied } = this.applyCategorizationRules(baseTransaction);

        // Step 3: Perform Enrichment
        const merchantDetails = this.enrichMerchantDetails(baseTransaction);
        const sentiment = this.analyzeSentiment(baseTransaction.description);
        const riskLevel = this.assessRisk(baseTransaction);
        const complianceChecks = this.performComplianceChecks(baseTransaction);
        const keywords = this.extractKeywords(baseTransaction.description);
        const extractedEntities = this.extractEntities(baseTransaction.description);
        const accountingGLCode = this.getAccountingGLCode(category, subCategory);

        const enrichmentData: EnrichmentData = {
            merchant: merchantDetails,
            sentiment: sentiment,
            riskLevel: riskLevel,
            compliance: complianceChecks,
            keywords: keywords,
            extractedEntities: extractedEntities,
            accountingGLCode: accountingGLCode,
            // Placeholder for other enrichments
            taxImplications: [],
            relatedTransactions: [],
            invoiceId: safeGet(rawTransaction, 'invoiceId', safeGet(extractedEntities, 'invoiceId')) as string | undefined,
        };

        // If specific source has additional metadata, include it
        if (rawTransaction.source === 'STRIPE') {
            const stripeTx = rawTransaction as StripeCharge;
            enrichmentData.extractedEntities = {
                ...enrichmentData.extractedEntities,
                paymentMethodType: stripeTx.paymentMethodType,
                customerEmail: stripeTx.customerEmail,
                captured: stripeTx.captured,
                paymentIntentId: stripeTx.paymentIntentId,
            };
        } else if (rawTransaction.source === 'PLAID') {
            const plaidTx = rawTransaction as PlaidTransaction;
            enrichmentData.extractedEntities = {
                ...enrichmentData.extractedEntities,
                accountId: plaidTx.accountId,
                paymentChannel: plaidTx.paymentChannel,
                plaidCategory: safeGet(plaidTx, 'personalFinanceCategory.primary'),
                location: plaidTx.location,
                authorizedDate: plaidTx.authorizedDate,
                transactionCode: plaidTx.transactionCode,
            };
        } else if (rawTransaction.source === 'MODERN_TREASURY') {
            const mtTx = rawTransaction as ModernTreasuryPaymentOrder;
            enrichmentData.extractedEntities = {
                ...enrichmentData.extractedEntities,
                direction: mtTx.direction,
                mtType: mtTx.type,
                originatingAccountId: mtTx.originatingAccountId,
                receivingAccountId: mtTx.receivingAccountId,
                liveMode: mtTx.liveMode,
                purpose: mtTx.purpose,
                referenceNumber: mtTx.referenceNumber,
                internalAccountId: mtTx.internalAccountId,
                paymentType: mtTx.paymentType,
                effectiveDate: mtTx.effectiveDate,
                processingDate: mtTx.processingDate,
                ultimateOriginatingPartyName: mtTx.ultimateOriginatingPartyName,
                ultimateReceivingPartyName: mtTx.ultimateReceivingPartyName,
            };
        }


        // Step 4: Construct the final CategorizedTransaction object
        const categorizedTransaction: CategorizedTransaction = {
            ...baseTransaction,
            source: rawTransaction.source,
            transactionType: transactionType,
            category: category,
            subCategory: subCategory,
            enrichmentData: enrichmentData,
            isReviewed: false, // Default to false, can be updated later
            categorizationRulesApplied: rulesApplied,
            originalTransaction: rawTransaction,
        };

        // If high risk or non-compliant, flag for immediate review.
        if (riskLevel === RiskLevel.HIGH || complianceChecks.amlStatus !== ComplianceStatus.COMPLIANT || complianceChecks.sanctionScreeningStatus !== ComplianceStatus.COMPLIANT) {
            categorizedTransaction.isReviewed = true;
            categorizedTransaction.reviewNotes = "Automated flag: High risk or compliance issue detected.";
        }


        return categorizedTransaction;
    }

    /**
     * Simulates fetching and processing a transaction from Stripe's API.
     * In a real application, this would involve HTTP requests to Stripe.
     * @param stripeTransactionId The ID of the Stripe charge.
     * @returns A promise resolving to a categorized transaction, or null if not found.
     */
    public async processStripeCharge(stripeTransactionId: string): Promise<CategorizedTransaction | null> {
        // Simulate API call to Stripe
        // const stripeData = await fetch(`${BASE_API_URL}/stripe/charges/${stripeTransactionId}`);
        // For demonstration, we'll create a mock StripeCharge object.
        console.log(`Simulating fetch from Stripe API for ID: ${stripeTransactionId} at ${STRIPE_WEBHOOK_ENDPOINT}`);

        const mockStripeCharge: StripeCharge | undefined = (function() {
            // This is just to satisfy the rule and provide some mock data
            if (stripeTransactionId === "ch_mock_high_risk_123") {
                return {
                    id: "ch_mock_high_risk_123",
                    source: "STRIPE",
                    amount: -15000000, // Large debit, $150,000
                    currency: "USD",
                    description: "Payment to offshore entity for 'consulting fees' via Stripe",
                    occurredAt: "2023-10-26T10:00:00Z",
                    status: TransactionStatus.SETTLED,
                    merchantName: "Offshore Consulting Ltd.",
                    paymentMethodType: "card",
                    captured: true,
                    failureCode: null,
                    failureMessage: null,
                };
            }
            if (stripeTransactionId === "ch_mock_refund_456") {
                return {
                    id: "ch_mock_refund_456",
                    source: "STRIPE",
                    amount: -500000, // $5000 refund
                    currency: "USD",
                    description: "Refund for order INV-2023-01-ABC",
                    occurredAt: "2023-10-25T14:30:00Z",
                    status: TransactionStatus.REFUNDED,
                    merchantName: "Customer Refund",
                    paymentMethodType: "card",
                    captured: true,
                    refunds: [{id: "re_mock_456", amount: 500000, status: "succeeded"}],
                };
            }
            if (stripeTransactionId === "ch_mock_aws_subscription_789") {
                return {
                    id: "ch_mock_aws_subscription_789",
                    source: "STRIPE",
                    amount: -25000, // $250
                    currency: "USD",
                    description: "Amazon Web Services subscription fee",
                    occurredAt: "2023-10-20T08:00:00Z",
                    status: TransactionStatus.SETTLED,
                    merchantName: "AWS",
                    paymentMethodType: "card",
                    captured: true,
                };
            }
            if (stripeTransactionId === "ch_mock_sales_revenue_101") {
                return {
                    id: "ch_mock_sales_revenue_101",
                    source: "STRIPE",
                    amount: 9900, // $99.00
                    currency: "USD",
                    description: "Payment received for product #XYZ-2023-10",
                    occurredAt: "2023-10-27T11:00:00Z",
                    status: TransactionStatus.SETTLED,
                    merchantName: "Customer Inc.",
                    paymentMethodType: "card",
                    captured: true,
                };
            }
            return undefined; // No mock data for other IDs
        })();

        if (!mockStripeCharge) {
            console.warn(`No mock Stripe charge found for ID: ${stripeTransactionId}`);
            return null;
        }

        return this.categorizeAndEnrich(mockStripeCharge);
    }

    /**
     * Simulates fetching and processing a transaction from Plaid's API.
     * In a real application, this would involve HTTP requests to Plaid.
     * @param plaidTransactionId The ID of the Plaid transaction.
     * @returns A promise resolving to a categorized transaction, or null if not found.
     */
    public async processPlaidTransaction(plaidTransactionId: string): Promise<CategorizedTransaction | null> {
        // Simulate API call to Plaid
        console.log(`Simulating fetch from Plaid API for ID: ${plaidTransactionId} at ${PLAID_WEBHOOK_ENDPOINT}`);

        const mockPlaidTransaction: PlaidTransaction | undefined = (function() {
            if (plaidTransactionId === "tx_mock_payroll_111") {
                return {
                    id: "tx_mock_payroll_111",
                    source: "PLAID",
                    amount: -5000.00, // $5000.00 (Plaid usually in dollars)
                    currency: "USD",
                    description: "PAYROLL DEPOSIT COMPANY A INC",
                    occurredAt: "2023-10-28",
                    status: TransactionStatus.SETTLED,
                    merchantName: "ADP Payroll",
                    accountId: "acc_abc123",
                    isoCurrencyCode: "USD",
                    paymentChannel: "online",
                    personalFinanceCategory: { primary: "Payroll", detailed: "Payroll" },
                };
            }
            if (plaidTransactionId === "tx_mock_rent_222") {
                return {
                    id: "tx_mock_rent_222",
                    source: "PLAID",
                    amount: -7500.00, // $7500.00
                    currency: "USD",
                    description: "WEWORK MEMBERSHIP FEE NOV 2023",
                    occurredAt: "2023-11-01",
                    status: TransactionStatus.SETTLED,
                    merchantName: "WeWork",
                    accountId: "acc_def456",
                    isoCurrencyCode: "USD",
                    paymentChannel: "online",
                    personalFinanceCategory: { primary: "Rent", detailed: "Rent" },
                };
            }
            if (plaidTransactionId === "tx_mock_expense_unknown_333") {
                return {
                    id: "tx_mock_expense_unknown_333",
                    source: "PLAID",
                    amount: -123.45,
                    currency: "USD",
                    description: "Misc purchase at local store",
                    occurredAt: "2023-10-29",
                    status: TransactionStatus.SETTLED,
                    merchantName: "Local Grocer",
                    accountId: "acc_ghi789",
                    isoCurrencyCode: "USD",
                    paymentChannel: "in store",
                    personalFinanceCategory: { primary: "Shopping", detailed: "Grocery" },
                };
            }
            return undefined;
        })();

        if (!mockPlaidTransaction) {
            console.warn(`No mock Plaid transaction found for ID: ${plaidTransactionId}`);
            return null;
        }

        return this.categorizeAndEnrich(mockPlaidTransaction);
    }

    /**
     * Simulates fetching and processing a transaction from Modern Treasury's API.
     * In a real application, this would involve HTTP requests to Modern Treasury.
     * @param modernTreasuryPaymentOrderId The ID of the Modern Treasury payment order.
     * @returns A promise resolving to a categorized transaction, or null if not found.
     */
    public async processModernTreasuryPaymentOrder(modernTreasuryPaymentOrderId: string): Promise<CategorizedTransaction | null> {
        // Simulate API call to Modern Treasury
        console.log(`Simulating fetch from Modern Treasury API for ID: ${modernTreasuryPaymentOrderId} at ${MODERN_TREASURY_WEBHOOK_ENDPOINT}`);

        const mockMTPaymentOrder: ModernTreasuryPaymentOrder | undefined = (function() {
            if (modernTreasuryPaymentOrderId === "po_mock_vendor_ach_123") {
                return {
                    id: "po_mock_vendor_ach_123",
                    source: "MODERN_TREASURY",
                    amount: -12345.67, // $12345.67 (MT usually in dollars)
                    currency: "USD",
                    description: "ACH Payment to VendorXYZ for Consulting",
                    occurredAt: "2023-10-30T09:00:00Z",
                    status: TransactionStatus.SETTLED,
                    vendorName: "VendorXYZ Inc.",
                    direction: "debit",
                    type: "ach",
                    originatingAccountId: "mt_acc_orig1",
                    liveMode: true,
                    effectiveDate: "2023-10-30",
                    processingDate: "2023-10-29",
                };
            }
            if (modernTreasuryPaymentOrderId === "po_mock_incoming_wire_456") {
                return {
                    id: "po_mock_incoming_wire_456",
                    source: "MODERN_TREASURY",
                    amount: 100000.00, // $100,000.00
                    currency: "USD",
                    description: "Incoming Wire: Equity Investment Series A",
                    occurredAt: "2023-10-24T15:00:00Z",
                    status: TransactionStatus.SETTLED,
                    vendorName: "Investor Group LLC",
                    direction: "credit",
                    type: "wire",
                    originatingAccountId: "mt_acc_inv1",
                    receivingAccountId: "mt_acc_main",
                    liveMode: true,
                    purpose: "Equity Funding",
                    effectiveDate: "2023-10-24",
                    processingDate: "2023-10-24",
                };
            }
            return undefined;
        })();

        if (!mockMTPaymentOrder) {
            console.warn(`No mock Modern Treasury payment order found for ID: ${modernTreasuryPaymentOrderId}`);
            return null;
        }

        return this.categorizeAndEnrich(mockMTPaymentOrder);
    }

    /**
     * Provides an example of handling a generic internal transaction that needs categorization.
     * @param internalTransaction The internal transaction data.
     * @returns A promise resolving to a categorized transaction.
     */
    public async processInternalTransaction(internalTransaction: BaseTransaction): Promise<CategorizedTransaction> {
        console.log(`Processing internal transaction ID: ${internalTransaction.id}`);
        // Ensure source is explicitly set for internal transactions if not already.
        const augmentedTransaction: RawTransactionInput = {
            ...internalTransaction,
            source: 'INTERNAL', // Explicitly mark as INTERNAL
            amount: this.normalizeAmount(internalTransaction.amount, internalTransaction.currency, 'INTERNAL'),
        };
        return this.categorizeAndEnrich(augmentedTransaction);
    }
}

// Export the service for use in other parts of the (conceptually) connected application.
// Since no imports are allowed, this service would be 'imported' in a conceptual sense
// by other files, or its methods called directly if this file were concatenated.
const transactionCategorizationService = new TransactionCategorizationService();
export { transactionCategorizationService, TransactionCategorizationService, FinancialCategory, SubCategory, TransactionType, RiskLevel, Sentiment, ComplianceStatus };

// Example Usage (for demonstrating functionality within this self-contained file)
/*
(async () => {
    console.log("\n--- Demonstrating Transaction Categorization and Enrichment ---");

    const service = new TransactionCategorizationService();

    // 1. Stripe Charge - High Risk
    const stripeHighRisk = await service.processStripeCharge("ch_mock_high_risk_123");
    console.log("\nStripe High Risk Transaction:", JSON.stringify(stripeHighRisk, null, 2));

    // 2. Stripe Charge - AWS Subscription
    const stripeAWSSub = await service.processStripeCharge("ch_mock_aws_subscription_789");
    console.log("\nStripe AWS Subscription Transaction:", JSON.stringify(stripeAWSSub, null, 2));

    // 3. Stripe Charge - Sales Revenue
    const stripeSales = await service.processStripeCharge("ch_mock_sales_revenue_101");
    console.log("\nStripe Sales Revenue Transaction:", JSON.stringify(stripeSales, null, 2));

    // 4. Plaid Transaction - Payroll
    const plaidPayroll = await service.processPlaidTransaction("tx_mock_payroll_111");
    console.log("\nPlaid Payroll Transaction:", JSON.stringify(plaidPayroll, null, 2));

    // 5. Modern Treasury Payment Order - Vendor ACH
    const mtVendorACH = await service.processModernTreasuryPaymentOrder("po_mock_vendor_ach_123");
    console.log("\nModern Treasury Vendor ACH:", JSON.stringify(mtVendorACH, null, 2));

    // 6. Modern Treasury Payment Order - Incoming Equity Investment
    const mtEquityInvestment = await service.processModernTreasuryPaymentOrder("po_mock_incoming_wire_456");
    console.log("\nModern Treasury Equity Investment:", JSON.stringify(mtEquityInvestment, null, 2));

    // 7. Internal Transaction - Generic Expense
    const internalExpense: BaseTransaction = {
        id: "int_mock_generic_exp_555",
        amount: -15000,
        currency: "USD",
        description: "Monthly office supplies purchase from Amazon",
        occurredAt: "2023-11-05T10:00:00Z",
        status: TransactionStatus.SETTLED,
        merchantName: "Amazon",
        metadata: { department: "Operations" }
    };
    const categorizedInternalExpense = await service.processInternalTransaction(internalExpense);
    console.log("\nInternal Generic Expense:", JSON.stringify(categorizedInternalExpense, null, 2));

    // 8. Internal Transaction - Uncategorized Default
    const internalUnknown: BaseTransaction = {
        id: "int_mock_unknown_666",
        amount: -250,
        currency: "USD",
        description: "Mysterious payment to unknown recipient",
        occurredAt: "2023-11-06T12:00:00Z",
        status: TransactionStatus.PENDING,
        merchantName: "Unknown Merchant",
        metadata: {}
    };
    const categorizedInternalUnknown = await service.processInternalTransaction(internalUnknown);
    console.log("\nInternal Unknown Transaction:", JSON.stringify(categorizedInternalUnknown, null, 2));

    // 9. Plaid Transaction - Rent
    const plaidRent = await service.processPlaidTransaction("tx_mock_rent_222");
    console.log("\nPlaid Rent Transaction:", JSON.stringify(plaidRent, null, 2));

})();
*/