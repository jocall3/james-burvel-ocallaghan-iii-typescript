// data/megadashboard.ts
// FIX: Import all necessary types for Mega Dashboard mock data.
import { 
    LoanApplication, MortgageAsset, ThreatIntelBrief, InsuranceClaim, RiskProfile, DataSet, DataLakeStat,
    SalesDeal, MarketingCampaign, GrowthMetric, Competitor, Benchmark,
    License, Disclosure, LegalDoc, SandboxExperiment, ConsentRecord,
    ContainerImage, ApiUsage, Incident, BackupJob, ApiKeyUsageLog
} from '../types';

export const MOCK_LOAN_APPLICATIONS: LoanApplication[] = [
    { id: 'loan-001', applicantName: 'John Doe', amount: 25000, type: 'Personal', status: 'Pending Review', dateSubmitted: '2024-07-23', riskScore: 680 },
    { id: 'loan-002', applicantName: 'Jane Smith', amount: 500000, type: 'Mortgage', status: 'Approved', dateSubmitted: '2024-07-22', riskScore: 780 },
    { id: 'loan-003', applicantName: 'QuantumLeap Inc.', amount: 100000, type: 'Business', status: 'Needs More Info', dateSubmitted: '2024-07-21', riskScore: 720 },
    { id: 'loan-004', applicantName: 'Alex Chen', amount: 15000, type: 'Auto', status: 'Denied', dateSubmitted: '2024-07-20', riskScore: 620 },
];

export const MOCK_MORTGAGE_ASSETS: MortgageAsset[] = [
    { id: 'mort-1', propertyAddress: '123 Main St', originalValue: 500000, currentValue: 550000, delinquencyStatus: 'Current' },
    { id: 'mort-2', propertyAddress: '456 Oak Ave', originalValue: 300000, currentValue: 320000, delinquencyStatus: '30 Days' },
    { id: 'mort-3', propertyAddress: '789 Pine Ln', originalValue: 750000, currentValue: 780000, delinquencyStatus: 'Current' },
];

export const MOCK_THREAT_INTEL: ThreatIntelBrief[] = [
    { id: 'threat-1', title: 'Phishing Campaign Targeting Financial Institutions', source: 'CrowdStrike', severity: 'High', timestamp: '2h ago' },
    { id: 'threat-2', title: 'New Zero-Day Exploit in Apache Struts', source: 'Mandiant', severity: 'Critical', timestamp: '8h ago' },
    { id: 'threat-3', title: 'Increase in DDoS Activity from Eastern Europe', source: 'Internal Honeypot', severity: 'Medium', timestamp: '1d ago' },
];

export const MOCK_INSURANCE_CLAIMS: InsuranceClaim[] = [
    { id: 'CLM-001', policyholder: 'Alex Chen', policyId: 'POL-A-123', claimType: 'Auto', amount: 2500, status: 'New', dateFiled: '2024-07-23', description: 'Front-end collision, bumper and headlight damage.' },
    { id: 'CLM-002', policyholder: 'Brenda Rodriguez', policyId: 'POL-P-456', claimType: 'Property', amount: 15000, status: 'Under Review', dateFiled: '2024-07-22', description: 'Water damage in basement from burst pipe.' },
    { id: 'CLM-003', policyholder: 'Charles Davis', policyId: 'POL-H-789', claimType: 'Health', amount: 850, status: 'Approved', dateFiled: '2024-07-21', description: 'Emergency room visit for minor injury.' },
    { id: 'CLM-004', policyholder: 'Diana Wells', policyId: 'POL-A-124', claimType: 'Auto', amount: 8000, status: 'New', dateFiled: '2024-07-23', description: 'Side impact collision, significant door damage and side airbag deployment.' },
];

export const MOCK_RISK_PROFILES: RiskProfile[] = [
    { id: 'user-1', name: 'John Doe', type: 'Individual', overallScore: 25, factors: { transaction: 20, identity: 15, behavioral: 30, network: 40 } },
    { id: 'corp-1', name: 'QuantumLeap Marketing', type: 'Business', overallScore: 85, factors: { transaction: 90, identity: 75, behavioral: 80, network: 95 } },
    { id: 'user-2', name: 'Jane Smith', type: 'Individual', overallScore: 10, factors: { transaction: 10, identity: 5, behavioral: 15, network: 10 } },
];

export const MOCK_DATA_CATALOG_ITEMS: DataSet[] = [
    { id: 'ds-1', name: 'transactions_clean', description: 'Cleaned and enriched customer transaction data.', owner: 'Finance Analytics', sensitivity: 'High', schema: [{name: 'transaction_id', type: 'string', description: 'Unique identifier'}, {name: 'amount_usd', type: 'float', description: 'Transaction amount in USD'}] },
    { id: 'ds-2', name: 'customer_360', description: 'Unified view of customer profiles and interactions.', owner: 'Marketing', sensitivity: 'High', schema: [{name: 'customer_id', type: 'string', description: 'Unique customer identifier'}, {name: 'ltv', type: 'float', description: 'Lifetime value of the customer'}] },
    { id: 'ds-3', name: 'web_logs_partitioned', description: 'Raw web server logs partitioned by day.', owner: 'Platform Engineering', sensitivity: 'Medium', schema: [{name: 'ip_address', type: 'string', description: 'User IP address'}, {name: 'timestamp', type: 'datetime', description: 'Event timestamp'}]},
];

export const MOCK_DATA_LAKE_STATS: DataLakeStat[] = [
    { name: 'Transactions', size: 1.2 }, { name: 'User Profiles', size: 0.8 },
    { name: 'Analytics Events', size: 5.5 }, { name: 'Application Logs', size: 12.8 },
    { name: 'Corporate Data', size: 2.1 },
];

// FIX: Add missing mock data constants for Mega Dashboard features.
// Mega Dashboard - Business
export const MOCK_SALES_DEALS: SalesDeal[] = [
    { id: 'deal-1', name: 'Quantum Corp - Expansion', stage: 'Proposal', value: 150000, closeDate: '2024-08-30', status: 'In Progress' },
    { id: 'deal-2', name: 'Cyberdyne Systems - Renewal', stage: 'Closed Won', value: 75000, closeDate: '2024-07-15', status: 'Closed Won' },
    { id: 'deal-3', name: 'NextGen Fintech - New Account', stage: 'Qualification', value: 50000, closeDate: '2024-09-15', status: 'In Progress' },
    { id: 'deal-4', name: 'Legacy Solutions - Upsell', stage: 'Prospecting', value: 25000, closeDate: '2024-09-01', status: 'In Progress' },

];

export const MOCK_MARKETING_CAMPAIGNS: MarketingCampaign[] = [
    { id: 'camp-1', name: 'Q3 Lead Gen', channel: 'PPC', cost: 25000, revenueGenerated: 125000 },
    { id: 'camp-2', name: 'Summer Social', channel: 'Social', cost: 15000, revenueGenerated: 95000 },
    { id: 'camp-3', name: 'Nexus Launch', channel: 'Email', cost: 5000, revenueGenerated: 45000 },
];

export const MOCK_GROWTH_METRICS: GrowthMetric[] = [
    { id: 'gm-1', name: 'User Acquisition', value: 12, period: 'WoW' },
    { id: 'gm-2', name: 'Activation Rate', value: 5, period: 'WoW' },
    { id: 'gm-3', name: 'Retention', value: 98, period: 'MoM' },
];

export const MOCK_COMPETITORS: Competitor[] = [
    { id: 'comp-1', name: 'FinFuture Inc.', marketShare: 22, lastFundingRound: 'Series C - $150M' },
    { id: 'comp-2', name: 'Bankable.io', marketShare: 18, lastFundingRound: 'Series B - $80M' },
];

export const MOCK_BENCHMARKS: Benchmark[] = [
    { id: 'bm-1', metric: 'Customer Acquisition Cost', ourValue: 120, industryAverage: 150 },
    { id: 'bm-2', metric: 'Lifetime Value', ourValue: 1250, industryAverage: 1100 },
];

// Mega Dashboard - Regulation
export const MOCK_LICENSES: License[] = [
    { id: 'lic-1', name: 'Money Transmitter License', jurisdiction: 'California', status: 'Active', expiryDate: '2025-12-31' },
    { id: 'lic-2', name: 'E-Money License', jurisdiction: 'United Kingdom', status: 'Active', expiryDate: '2026-06-30' },
];

export const MOCK_DISCLOSURES: Disclosure[] = [
    { id: 'disc-1', title: 'Q2 2024 Financial Disclosure', jurisdiction: 'USA - SEC', filingDate: '2024-07-30' },
    { id: 'disc-2', title: 'Data Privacy Policy Update', jurisdiction: 'EU - GDPR', filingDate: '2024-07-15' },
];

export const MOCK_LEGAL_DOCS: LegalDoc[] = [
    { id: 'doc-1', title: 'Terms of Service v3.5', type: 'Terms of Service', lastUpdated: '2024-07-01' },
    { id: 'doc-2', title: 'MSA - Quantum Corp', type: 'MSA', lastUpdated: '2024-06-15' },
];

export const MOCK_SANDBOX_EXPERIMENTS: SandboxExperiment[] = [
    { id: 'sbx-1', name: 'Real-time Payment Settlement Test', status: 'Completed', startDate: '2024-07-10' },
    { id: 'sbx-2', name: 'Biometric Authentication Flow v2', status: 'Running', startDate: '2024-07-20' },
];

export const MOCK_CONSENT_RECORDS: ConsentRecord[] = [
    { id: 'con-1', userId: 'user_visionary', consentType: 'Marketing', status: 'Granted', timestamp: '2024-01-15 10:00 AM' },
    { id: 'con-2', userId: 'user_visionary', consentType: 'Data Sharing', status: 'Granted', timestamp: '2024-01-15 10:00 AM' },
];

// Mega Dashboard - Infra & Ops
export const MOCK_CONTAINER_IMAGES: ContainerImage[] = [
    { id: 'img-1', repository: 'api-gateway', tag: 'prod-v1.25.3', size: '1.2 GB', lastPush: '2h ago', vulnerability: 'Low' },
    { id: 'img-2', repository: 'transactions-api', tag: 'prod-v2.10.1', size: '850 MB', lastPush: '8h ago', vulnerability: 'None' },
    { id: 'img-3', repository: 'ai-advisor-api', tag: 'prod-v1.8.2', size: '2.5 GB', lastPush: '2d ago', vulnerability: 'High' },
];

export const MOCK_API_USAGE: ApiUsage[] = [
    { endpoint: '/v1/transactions', calls24h: 850000, errorRate: 0.3, avgLatency: 85 },
    { endpoint: '/v1/ai/advisor', calls24h: 50000, errorRate: 1.2, avgLatency: 450 },
    { endpoint: '/v1/payments', calls24h: 120000, errorRate: 0.1, avgLatency: 110 },
];

export const MOCK_INCIDENTS: Incident[] = [
    { id: 'inc-1', title: 'API Gateway Latency Spike', severity: 'SEV2', status: 'Mitigated', startTime: '2024-07-23 08:00 AM' },
    { id: 'inc-2', title: 'Database Connectivity Issues - US-East-1', severity: 'SEV1', status: 'Investigating', startTime: '2024-07-24 10:30 AM' },
];

export const MOCK_BACKUP_JOBS: BackupJob[] = [
    { id: 'bak-1', service: 'Production DB (Primary)', status: 'Success', timestamp: '2024-07-24 02:00 AM', duration: '25 minutes' },
    { id: 'bak-2', service: 'Data Lake (Hot Storage)', status: 'Success', timestamp: '2024-07-24 03:00 AM', duration: '1.5 hours' },
    { id: 'bak-3', service: 'Event Store', status: 'Failed', timestamp: '2024-07-24 04:00 AM', duration: '5 minutes' },
];

export const MOCK_API_KEY_USAGE: ApiKeyUsageLog[] = Array.from({length: 50}, (_, i) => {
    const key = `db_sk_live_...${['XXXX', 'YYYY', 'ZZZZ'][i%3]}`;
    const status = Math.random() > 0.1 ? 200 : (Math.random() > 0.5 ? 401 : 500);
    return {
        id: `log-${i}`,
        apiKey: key,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        status: status,
        latencyMs: 50 + Math.random() * 150,
        ipAddress: `203.0.113.${i}`
    };
});