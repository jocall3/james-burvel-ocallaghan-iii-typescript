// types/models/megadashboard.ts

export type LoanApplicationStatus = 'Pending Review' | 'Approved' | 'Denied' | 'Needs More Info';

export interface LoanApplication {
    id: string;
    applicantName: string;
    amount: number;
    type: 'Personal' | 'Mortgage' | 'Auto' | 'Business';
    status: LoanApplicationStatus;
    dateSubmitted: string;
    riskScore: number;
}

export interface MortgageAsset {
    id: string;
    propertyAddress: string;
    originalValue: number;
    currentValue: number;
    delinquencyStatus: 'Current' | '30 Days' | '60 Days' | '90+ Days';
}

export interface ThreatIntelBrief {
    id: string;
    title: string;
    source: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    timestamp: string;
}

// Added for new views
export type ClaimStatus = 'New' | 'Under Review' | 'Approved' | 'Denied';

export interface InsuranceClaim {
    id: string;
    policyholder: string;
    policyId: string;
    claimType: 'Auto' | 'Property' | 'Health';
    amount: number;
    status: ClaimStatus;
    dateFiled: string;
    description: string;
}

export interface RiskProfile {
    id: string;
    name: string;
    type: 'Individual' | 'Business';
    overallScore: number; // 0-100, higher is riskier
    factors: {
        transaction: number;
        identity: number;
        behavioral: number;
        network: number;
    };
}

export interface DataSet {
    id: string;
    name: string;
    description: string;
    owner: string;
    sensitivity: 'Low' | 'Medium' | 'High';
    schema: { name: string; type: string; description: string }[];
}

export interface DataLakeStat {
    name: string;
    size: number; // in PB
}

// FIX: Add missing type definitions for Mega Dashboard features.
// Mega Dashboard - Business
export interface SalesDeal {
    id: string;
    name: string;
    stage: 'Prospecting' | 'Qualification' | 'Proposal' | 'Closed Won' | 'Closed Lost';
    value: number;
    closeDate: string;
    status: 'In Progress' | 'Closed Won' | 'Closed Lost';
}

export interface MarketingCampaign {
    id: string;
    name: string;
    channel: 'Email' | 'Social' | 'PPC';
    cost: number;
    revenueGenerated: number;
}

export interface GrowthMetric {
    id: string;
    name: 'User Acquisition' | 'Activation Rate' | 'Retention';
    value: number;
    period: string; // e.g., 'WoW', 'MoM'
}

export interface Competitor {
    id: string;
    name: string;
    marketShare: number;
    lastFundingRound: string;
}

export interface Benchmark {
    id: string;
    metric: string;
    ourValue: number;
    industryAverage: number;
}

// Mega Dashboard - Regulation
export interface License {
    id: string;
    name: string;
    jurisdiction: string;
    status: 'Active' | 'Expired' | 'Pending Renewal';
    expiryDate: string;
}

export interface Disclosure {
    id: string;
    title: string;
    jurisdiction: string;
    filingDate: string;
}

export interface LegalDoc {
    id: string;
    title: string;
    type: 'MSA' | 'NDA' | 'Terms of Service';
    lastUpdated: string;
}

export interface SandboxExperiment {
    id: string;
    name: string;
    status: 'Running' | 'Completed' | 'Failed';
    startDate: string;
}

export interface ConsentRecord {
    id: string;
    userId: string;
    consentType: 'Marketing' | 'Data Sharing';
    status: 'Granted' | 'Revoked';
    timestamp: string;
}

// Mega Dashboard - Infra & Ops
export interface ContainerImage {
    id: string;
    repository: string;
    tag: string;
    size: string;
    lastPush: string;
    vulnerability: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ApiUsage {
    endpoint: string;
    calls24h: number;
    errorRate: number;
    avgLatency: number;
}

export interface Incident {
    id: string;
    title: string;
    severity: 'SEV1' | 'SEV2' | 'SEV3';
    status: 'Investigating' | 'Mitigated' | 'Resolved';
    startTime: string;
}

export interface BackupJob {
    id: string;
    service: string;
    status: 'Success' | 'Failed';
    timestamp: string;
    duration: string; // e.g., '15 minutes'
}

export interface ApiKeyUsageLog {
    id: string;
    apiKey: string;
    timestamp: string;
    status: number;
    latencyMs: number;
    ipAddress: string;
}