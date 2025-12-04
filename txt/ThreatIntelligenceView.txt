import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../../Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, SearchIcon, FilterIcon, RefreshIcon, PlayIcon, PauseIcon, StopIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon, InfoIcon, TargetIcon, EyeIcon, ZapIcon, LockIcon, ShieldIcon, DatabaseIcon, ServerIcon, CloudIcon, SettingsIcon, UserIcon, UsersIcon, GlobeIcon, BellIcon, MailIcon, ClockIcon, CalendarIcon, EditIcon, Trash2Icon, FileTextIcon, DownloadIcon, UploadIcon, CodeIcon, GitPullRequestIcon, TerminalIcon, CpuIcon, ActivityIcon, TrendingUpIcon, AlertOctagonIcon, BugIcon, HardDriveIcon, WifiIcon, MapPinIcon, MessageSquareIcon, BookmarkIcon, StarIcon, ThumbsUpIcon, ThumbsDownIcon, Share2Icon, LinkIcon, ExternalLinkIcon, ListIcon, GridIcon, LayoutDashboardIcon, SlidersIcon, TrendingDownIcon, UserPlusIcon, UserXIcon, KeyIcon, BoxIcon, BriefcaseIcon, DollarSignIcon, PercentIcon, GiftIcon, CreditCardIcon, LandmarkIcon, LayersIcon, PackageIcon, PhoneIcon, PrinterIcon, PuzzleIcon, RepeatIcon, RouterIcon, RssIcon, SaveIcon, ScissorsIcon, ScrollTextIcon, SendIcon, ShieldOffIcon, ShoppingBagIcon, ShoppingCartIcon, SitemapIcon, SpeakerIcon, SquareIcon, StickyNoteIcon, SunriseIcon, SunsetIcon, TabletIcon, TagIcon, TagsIcon, TextCursorIcon, ThermometerIcon, ThumbsUp, ThumbsDown, ToggleLeftIcon, ToggleRightIcon, ToolIcon, TrendingUp, TruckIcon, UmbrellaIcon, UnderlineIcon, UnlockIcon, UploadCloudIcon, UserCheckIcon, UserMinusIcon, UserX, VariableIcon, VideoIcon, Volume1Icon, Volume2Icon, VolumeXIcon, WalletIcon, WatchIcon, WebhookIcon, WheatIcon, WifiOffIcon, WindIcon, WineIcon, WrenchIcon, XIcon, ZapOffIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';

// --- Utility Types and Interfaces ---
interface ThreatActor {
    id: string;
    name: string;
    description: string;
    origin: string;
    motives: string[];
    techniques: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    lastActivity: string; // ISO date string
    tags: string[];
    associatedCampaigns: string[];
    mitigationStrategies: string[];
    confidence: number; // 0-100
    indicatorsOfCompromise: IoC[];
}

interface IoC {
    id: string;
    type: 'IP' | 'Domain' | 'Hash' | 'URL' | 'Email' | 'FilePath' | 'Mutex' | 'RegistryKey';
    value: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    timestamp: string; // ISO date string
    firstSeen: string;
    lastSeen: string;
    tags: string[];
    confidence: number;
    description?: string;
}

interface Vulnerability {
    cveId: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cvssScore: number;
    publishedDate: string; // ISO date string
    updatedDate: string; // ISO date string
    exploitAvailable: boolean;
    patchAvailable: boolean;
    affectedProducts: string[];
    references: string[];
    tags: string[];
    remediationSteps: string[];
}

interface AttackSimulationResult {
    id: string;
    name: string;
    startTime: string; // ISO date string
    endTime: string; // ISO date string
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    targetSystem: string;
    attackVector: string;
    adversaryEmulation: string; // e.g., "APT29"
    detectionRate: number; // 0-100%
    preventionRate: number; // 0-100%
    vulnerabilitiesExploited: string[]; // CVE IDs
    mitigationRecommendations: string[];
    reportUrl: string;
    logs: string[];
    riskScoreChange: number; // e.g., -5 (improvement) or +10 (degradation)
    tags: string[];
}

interface ThreatReport {
    id: string;
    title: string;
    author: string;
    publishDate: string; // ISO date string
    summary: string;
    fullReportContent: string;
    tags: string[];
    relatedIoCs: IoC[];
    relatedActors: ThreatActor[];
    relatedVulnerabilities: Vulnerability[];
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
}

interface GlobalThreatSummary {
    totalActiveThreatActors: number;
    criticalVulnerabilities: number;
    newIoCsLast24h: number;
    ongoingCampaigns: number;
    sectorSpecificThreats: { [key: string]: number };
    topAttacksToday: { type: string; count: number }[];
    globalRiskScore: number; // 0-100
}

interface AIModelConfig {
    id: string;
    name: string;
    description: string;
    modelType: 'prediction' | 'detection' | 'simulation' | 'generative';
    status: 'active' | 'inactive' | 'training' | 'error';
    lastTrained: string;
    performanceMetrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    };
    inputFeatures: string[];
    outputSchema: string;
    version: string;
    tags: string[];
}

interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    type: 'network' | 'endpoint' | 'access' | 'data' | 'application';
    status: 'active' | 'inactive' | 'draft';
    lastUpdatedBy: string;
    lastUpdatedDate: string;
    rules: string[]; // Simplified for example
    enforcementPoints: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    complianceStandards: string[];
}

interface Asset {
    id: string;
    name: string;
    type: 'server' | 'database' | 'application' | 'network_device' | 'cloud_instance';
    ipAddress: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
    lastScanned: string;
    vulnerabilities: string[]; // CVE IDs
    associatedPolicies: string[]; // Policy IDs
    tags: string[];
    status: 'online' | 'offline' | 'compromised';
    geolocation: string;
    firmwareVersion?: string;
    osVersion?: string;
    installedSoftware?: string[];
}

interface UserBehaviorAnomaly {
    id: string;
    userId: string;
    username: string;
    anomalyType: 'login' | 'data_access' | 'resource_usage' | 'privilege_escalation';
    timestamp: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    status: 'new' | 'investigating' | 'resolved' | 'false_positive';
    associatedIoCs: IoC[];
    suggestedAction: string;
}

interface IncidentResponsePlaybook {
    id: string;
    name: string;
    description: string;
    triggerCondition: string; // e.g., "Critical Alert from SIEM"
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
    steps: { order: number; action: string; assignee: string; status: 'todo' | 'in_progress' | 'completed' }[];
    lastUpdated: string;
    ownerTeam: string;
    tags: string[];
}

interface DataPrivacyRegulation {
    id: string;
    name: string;
    jurisdiction: string;
    description: string;
    keyRequirements: string[];
    complianceStatus: 'compliant' | 'non-compliant' | 'partial';
    lastAuditDate: string;
    riskOfNonCompliance: 'low' | 'medium' | 'high';
}

interface EventLog {
    id: string;
    timestamp: string;
    source: string;
    eventType: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    tags: string[];
    associatedIoC?: IoC;
    userId?: string;
    assetId?: string;
    details?: Record<string, any>;
}

interface ThreatFeedSource {
    id: string;
    name: string;
    url: string;
    format: string;
    lastIngested: string;
    status: 'active' | 'inactive' | 'error';
    refreshInterval: number; // in minutes
    category: 'OSINT' | 'commercial' | 'internal' | 'darkweb';
    confidenceScore: number; // 0-100, reliability of the source
}

// --- Dummy Data Generation Functions (for simulation) ---
const generateRandomId = () => Math.random().toString(36).substring(2, 15);
const getRandomDate = () => new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString();
const getRandomSeverity = (): 'low' | 'medium' | 'high' | 'critical' => ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any;
const getRandomStatus = (): 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' => ['pending', 'running', 'completed', 'failed', 'cancelled'][Math.floor(Math.random() * 5)] as any;

const generateDummyIoC = (count: number = 10): IoC[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    type: ['IP', 'Domain', 'Hash', 'URL', 'Email', 'FilePath'][Math.floor(Math.random() * 6)] as any,
    value: Math.random() < 0.5 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : `malicious-domain-${generateRandomId()}.com`,
    severity: getRandomSeverity(),
    source: `Feed-${Math.floor(Math.random() * 5) + 1}`,
    timestamp: getRandomDate(),
    firstSeen: getRandomDate(),
    lastSeen: getRandomDate(),
    tags: ['malware', 'phishing', 'ransomware', 'apt', 'exploit'].filter(() => Math.random() > 0.5),
    confidence: Math.floor(Math.random() * 100),
    description: `IoC description for ${generateRandomId()}`,
}));

const generateDummyThreatActor = (count: number = 5): ThreatActor[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `APT Group ${Math.floor(Math.random() * 100)}`,
    description: `Sophisticated threat actor group with a focus on ${Math.random() < 0.5 ? 'financial espionage' : 'critical infrastructure disruption'}.`,
    origin: ['Russia', 'China', 'North Korea', 'Iran', 'Eastern Europe'][Math.floor(Math.random() * 5)],
    motives: ['espionage', 'financial gain', 'sabotage', 'activism'].filter(() => Math.random() > 0.3),
    techniques: ['spear phishing', 'supply chain attacks', 'zero-day exploits', 'ransomware'].filter(() => Math.random() > 0.4),
    severity: getRandomSeverity(),
    lastActivity: getRandomDate(),
    tags: ['nation-state', 'criminal', 'insider'].filter(() => Math.random() > 0.5),
    associatedCampaigns: [`Campaign-${generateRandomId()}`, `Campaign-${generateRandomId()}`].filter(() => Math.random() > 0.5),
    mitigationStrategies: ['Enhanced MFA', 'Network Segmentation', 'Endpoint Detection'].filter(() => Math.random() > 0.5),
    confidence: Math.floor(Math.random() * 100),
    indicatorsOfCompromise: generateDummyIoC(Math.floor(Math.random() * 5)),
}));

const generateDummyVulnerability = (count: number = 15): Vulnerability[] => Array.from({ length: count }).map(() => ({
    cveId: `CVE-2023-${Math.floor(Math.random() * 10000)}`,
    name: `Vulnerability ${generateRandomId().substring(0, 8)}`,
    description: `A critical vulnerability found in ${Math.random() < 0.5 ? 'web servers' : 'operating systems'}.`,
    severity: getRandomSeverity(),
    cvssScore: parseFloat((Math.random() * (10 - 4) + 4).toFixed(1)),
    publishedDate: getRandomDate(),
    updatedDate: getRandomDate(),
    exploitAvailable: Math.random() > 0.3,
    patchAvailable: Math.random() > 0.6,
    affectedProducts: ['Apache HTTP Server', 'OpenSSL', 'Windows Server', 'Linux Kernel'].filter(() => Math.random() > 0.5),
    references: [`https://nvd.nist.gov/vuln/detail/${generateRandomId()}`],
    tags: ['web', 'server', 'os', 'cloud'].filter(() => Math.random() > 0.5),
    remediationSteps: ['Apply patch', 'Upgrade software', 'Implement WAF rules'].filter(() => Math.random() > 0.5),
}));

const generateDummySimulationResult = (count: number = 7): AttackSimulationResult[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `Red-Team Sim ${generateRandomId().substring(0, 8)}`,
    startTime: getRandomDate(),
    endTime: getRandomDate(),
    status: getRandomStatus(),
    targetSystem: ['Production API', 'Internal Database', 'Employee Workstations'][Math.floor(Math.random() * 3)],
    attackVector: ['Phishing Campaign', 'Web Application Exploit', 'Supply Chain Attack'][Math.floor(Math.random() * 3)],
    adversaryEmulation: ['APT29', 'FIN7', 'DarkSide'][Math.floor(Math.random() * 3)],
    detectionRate: Math.floor(Math.random() * 100),
    preventionRate: Math.floor(Math.random() * 100),
    vulnerabilitiesExploited: generateDummyVulnerability(Math.floor(Math.random() * 3)).map(v => v.cveId),
    mitigationRecommendations: ['Update WAF rules', 'Patch specific CVEs', 'Enhance EDR'].filter(() => Math.random() > 0.5),
    reportUrl: `/reports/sim-${generateRandomId()}.pdf`,
    logs: [`Log entry ${generateRandomId()}`, `Log entry ${generateRandomId()}`],
    riskScoreChange: Math.random() < 0.5 ? Math.floor(Math.random() * -10) : Math.floor(Math.random() * 10),
    tags: ['automated', 'critical', 'monthly'].filter(() => Math.random() > 0.5),
}));

const generateDummyThreatReport = (count: number = 8): ThreatReport[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    title: `Threat Report: ${generateRandomId().substring(0, 12)} - ${['New Malware Variant', 'Phishing Campaign Analysis', 'APT Activity Update'][Math.floor(Math.random() * 3)]}`,
    author: `Analyst ${generateRandomId().substring(0, 4)}`,
    publishDate: getRandomDate(),
    summary: `This report details the discovery of a new threat, its characteristics, and potential impact.`,
    fullReportContent: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    tags: ['malware', 'phishing', 'APT', 'exploit', 'industry-specific'].filter(() => Math.random() > 0.4),
    relatedIoCs: generateDummyIoC(Math.floor(Math.random() * 3)),
    relatedActors: generateDummyThreatActor(Math.floor(Math.random() * 2)),
    relatedVulnerabilities: generateDummyVulnerability(Math.floor(Math.random() * 2)),
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
    confidence: Math.floor(Math.random() * 100),
}));

const generateDummyAIModelConfig = (count: number = 5): AIModelConfig[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `AI Model ${generateRandomId().substring(0, 8)}`,
    description: `An AI model for ${['threat prediction', 'vulnerability detection', 'anomaly detection', 'attack simulation'][Math.floor(Math.random() * 4)]}.`,
    modelType: ['prediction', 'detection', 'simulation', 'generative'][Math.floor(Math.random() * 4)] as any,
    status: ['active', 'inactive', 'training', 'error'][Math.floor(Math.random() * 4)] as any,
    lastTrained: getRandomDate(),
    performanceMetrics: {
        accuracy: parseFloat((Math.random() * (0.99 - 0.7) + 0.7).toFixed(2)),
        precision: parseFloat((Math.random() * (0.99 - 0.7) + 0.7).toFixed(2)),
        recall: parseFloat((Math.random() * (0.99 - 0.7) + 0.7).toFixed(2)),
        f1Score: parseFloat((Math.random() * (0.99 - 0.7) + 0.7).toFixed(2)),
    },
    inputFeatures: ['network_logs', 'endpoint_telemetry', 'threat_feed_data', 'user_activity'].filter(() => Math.random() > 0.5),
    outputSchema: `{ "threat_level": "number", "target_asset": "string" }`,
    version: `v1.${Math.floor(Math.random() * 10)}`,
    tags: ['deep learning', 'machine learning', 'nlp', 'graph analysis'].filter(() => Math.random() > 0.5),
}));

const generateDummySecurityPolicy = (count: number = 10): SecurityPolicy[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `Policy ${generateRandomId().substring(0, 8)}`,
    description: `Security policy for ${['network access', 'data encryption', 'endpoint protection', 'application security'][Math.floor(Math.random() * 4)]}.`,
    type: ['network', 'endpoint', 'access', 'data', 'application'][Math.floor(Math.random() * 5)] as any,
    status: ['active', 'inactive', 'draft'][Math.floor(Math.random() * 3)] as any,
    lastUpdatedBy: `User-${Math.floor(Math.random() * 5) + 1}`,
    lastUpdatedDate: getRandomDate(),
    rules: [`Rule-${generateRandomId()}`, `Rule-${generateRandomId()}`],
    enforcementPoints: ['Firewall', 'EDR', 'IAM', 'WAF'].filter(() => Math.random() > 0.5),
    riskLevel: getRandomSeverity(),
    complianceStandards: ['GDPR', 'HIPAA', 'ISO27001', 'PCI-DSS'].filter(() => Math.random() > 0.5),
}));

const generateDummyAsset = (count: number = 20): Asset[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `Asset-${generateRandomId().substring(0, 8)}`,
    type: ['server', 'database', 'application', 'network_device', 'cloud_instance'][Math.floor(Math.random() * 5)] as any,
    ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    criticality: getRandomSeverity(),
    owner: `Team-${Math.floor(Math.random() * 3) + 1}`,
    lastScanned: getRandomDate(),
    vulnerabilities: generateDummyVulnerability(Math.floor(Math.random() * 3)).map(v => v.cveId),
    associatedPolicies: generateDummySecurityPolicy(Math.floor(Math.random() * 2)).map(p => p.id),
    tags: ['prod', 'dev', 'internal', 'external', 'hr'].filter(() => Math.random() > 0.5),
    status: ['online', 'offline', 'compromised'][Math.floor(Math.random() * 3)] as any,
    geolocation: ['US-East', 'EU-West', 'APAC-South'][Math.floor(Math.random() * 3)],
    firmwareVersion: Math.random() < 0.5 ? `v${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}` : undefined,
    osVersion: Math.random() < 0.5 ? `Linux Ubuntu 22.04` : `Windows Server 2022`,
    installedSoftware: ['Apache', 'Nginx', 'MongoDB', 'PostgreSQL', 'Node.js', 'Python'].filter(() => Math.random() > 0.6),
}));

const generateDummyUserBehaviorAnomaly = (count: number = 10): UserBehaviorAnomaly[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    userId: `user-${Math.floor(Math.random() * 1000)}`,
    username: `jsmith${Math.floor(Math.random() * 10)}`,
    anomalyType: ['login', 'data_access', 'resource_usage', 'privilege_escalation'][Math.floor(Math.random() * 4)] as any,
    timestamp: getRandomDate(),
    description: `Unusual activity detected: ${['failed login attempts', 'large data transfer', 'access to sensitive files', 'unauthorized privilege change'][Math.floor(Math.random() * 4)]}`,
    severity: getRandomSeverity(),
    confidence: Math.floor(Math.random() * 100),
    status: ['new', 'investigating', 'resolved', 'false_positive'][Math.floor(Math.random() * 4)] as any,
    associatedIoCs: generateDummyIoC(Math.floor(Math.random() * 2)),
    suggestedAction: ['Block user', 'Reset password', 'Forensic investigation'].filter(() => Math.random() > 0.5).join(', '),
}));

const generateDummyIncidentResponsePlaybook = (count: number = 5): IncidentResponsePlaybook[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `Playbook: ${['Phishing Incident', 'Data Breach', 'DDoS Attack', 'Malware Outbreak'][Math.floor(Math.random() * 4)]}`,
    description: `Steps to follow for a ${['phishing', 'data breach', 'DDoS', 'malware'][Math.floor(Math.random() * 4)]} incident.`,
    triggerCondition: `Critical Alert: ${['Phishing Detected', 'Unauthorized Data Exfil', 'High Network Traffic', 'New Malware Signature'][Math.floor(Math.random() * 4)]}`,
    severityLevel: getRandomSeverity(),
    steps: Array.from({ length: Math.floor(Math.random() * 5) + 3 }).map((_, i) => ({
        order: i + 1,
        action: `Step ${i + 1}: ${['Isolate system', 'Notify legal', 'Analyze logs', 'Restore backup', 'Communicate externally'][Math.floor(Math.random() * 5)]}`,
        assignee: `Team ${Math.floor(Math.random() * 3) + 1}`,
        status: ['todo', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as any,
    })),
    lastUpdated: getRandomDate(),
    ownerTeam: `Team-${Math.floor(Math.random() * 3) + 1}`,
    tags: ['automation', 'critical', 'compliance'].filter(() => Math.random() > 0.5),
}));

const generateDummyDataPrivacyRegulation = (count: number = 5): DataPrivacyRegulation[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: ['GDPR', 'CCPA', 'HIPAA', 'LGPD', 'NIST-CSF'][Math.floor(Math.random() * 5)],
    jurisdiction: ['EU', 'California, USA', 'USA', 'Brazil', 'Global'][Math.floor(Math.random() * 5)],
    description: `Regulation concerning data privacy and security.`,
    keyRequirements: ['Data minimization', 'Consent management', 'Right to be forgotten', 'Breach notification'].filter(() => Math.random() > 0.4),
    complianceStatus: ['compliant', 'non-compliant', 'partial'][Math.floor(Math.random() * 3)] as any,
    lastAuditDate: getRandomDate(),
    riskOfNonCompliance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
}));

const generateDummyEventLog = (count: number = 50): EventLog[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    timestamp: getRandomDate(),
    source: ['firewall', 'siem', 'edr', 'cloud-logs'][Math.floor(Math.random() * 4)],
    eventType: ['login_failure', 'data_exfiltration', 'malware_alert', 'policy_violation', 'system_restart'][Math.floor(Math.random() * 5)],
    message: `Event message for ${generateRandomId()}`,
    severity: ['info', 'warning', 'error', 'critical'][Math.floor(Math.random() * 4)] as any,
    tags: ['network', 'endpoint', 'security'].filter(() => Math.random() > 0.5),
    associatedIoC: Math.random() < 0.3 ? generateDummyIoC(1)[0] : undefined,
    userId: Math.random() < 0.5 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
    assetId: Math.random() < 0.5 ? `asset-${Math.floor(Math.random() * 50)}` : undefined,
    details: Math.random() < 0.4 ? { ip: `192.168.1.${Math.floor(Math.random() * 255)}`, port: Math.floor(Math.random() * 65535) } : undefined,
}));

const generateDummyThreatFeedSource = (count: number = 8): ThreatFeedSource[] => Array.from({ length: count }).map(() => ({
    id: generateRandomId(),
    name: `Feed-${generateRandomId().substring(0, 8)}`,
    url: `https://threatfeed.example.com/${generateRandomId()}`,
    format: ['STIX/TAXII', 'MISP', 'CSV', 'JSON'][Math.floor(Math.random() * 4)],
    lastIngested: getRandomDate(),
    status: ['active', 'inactive', 'error'][Math.floor(Math.random() * 3)] as any,
    refreshInterval: [5, 15, 30, 60, 240, 1440][Math.floor(Math.random() * 6)],
    category: ['OSINT', 'commercial', 'internal', 'darkweb'][Math.floor(Math.random() * 4)] as any,
    confidenceScore: Math.floor(Math.random() * 100),
}));


// --- Dummy Global State Context ---
interface ThreatIntelligenceContextType {
    ioCs: IoC[];
    threatActors: ThreatActor[];
    vulnerabilities: Vulnerability[];
    attackSimulations: AttackSimulationResult[];
    threatReports: ThreatReport[];
    aiModelConfigs: AIModelConfig[];
    securityPolicies: SecurityPolicy[];
    assets: Asset[];
    userAnomalies: UserBehaviorAnomaly[];
    incidentPlaybooks: IncidentResponsePlaybook[];
    privacyRegulations: DataPrivacyRegulation[];
    eventLogs: EventLog[];
    threatFeedSources: ThreatFeedSource[];
    globalSummary: GlobalThreatSummary;
    refreshData: () => void;
    addIoC: (ioc: IoC) => void;
    updateIoC: (ioc: IoC) => void;
    deleteIoC: (id: string) => void;
    // ... more actions for other entities
}

const ThreatIntelligenceContext = createContext<ThreatIntelligenceContextType | undefined>(undefined);

export const ThreatIntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ioCs, setIoCs] = useState<IoC[]>([]);
    const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [attackSimulations, setAttackSimulations] = useState<AttackSimulationResult[]>([]);
    const [threatReports, setThreatReports] = useState<ThreatReport[]>([]);
    const [aiModelConfigs, setAiModelConfigs] = useState<AIModelConfig[]>([]);
    const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [userAnomalies, setUserAnomalies] = useState<UserBehaviorAnomaly[]>([]);
    const [incidentPlaybooks, setIncidentPlaybooks] = useState<IncidentResponsePlaybook[]>([]);
    const [privacyRegulations, setPrivacyRegulations] = useState<DataPrivacyRegulation[]>([]);
    const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
    const [threatFeedSources, setThreatFeedSources] = useState<ThreatFeedSource[]>([]);
    const [globalSummary, setGlobalSummary] = useState<GlobalThreatSummary>({
        totalActiveThreatActors: 0,
        criticalVulnerabilities: 0,
        newIoCsLast24h: 0,
        ongoingCampaigns: 0,
        sectorSpecificThreats: {},
        topAttacksToday: [],
        globalRiskScore: 0,
    });

    const refreshData = useCallback(() => {
        // Simulate API calls
        setIoCs(generateDummyIoC(50));
        setThreatActors(generateDummyThreatActor(10));
        setVulnerabilities(generateDummyVulnerability(30));
        setAttackSimulations(generateDummySimulationResult(15));
        setThreatReports(generateDummyThreatReport(20));
        setAiModelConfigs(generateDummyAIModelConfig(8));
        setSecurityPolicies(generateDummySecurityPolicy(20));
        setAssets(generateDummyAsset(50));
        setUserAnomalies(generateDummyUserBehaviorAnomaly(25));
        setIncidentPlaybooks(generateDummyIncidentResponsePlaybook(10));
        setPrivacyRegulations(generateDummyDataPrivacyRegulation(7));
        setEventLogs(generateDummyEventLog(200));
        setThreatFeedSources(generateDummyThreatFeedSource(10));

        // Update global summary based on fresh data
        const newIoCs24h = ioCs.filter(ioc => (new Date().getTime() - new Date(ioc.timestamp).getTime()) < 24 * 60 * 60 * 1000).length;
        const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical').length;
        const activeActors = threatActors.filter(ta => (new Date().getTime() - new Date(ta.lastActivity).getTime()) < 30 * 24 * 60 * 60 * 1000).length;
        const uniqueCampaigns = new Set(threatActors.flatMap(ta => ta.associatedCampaigns)).size;

        const sectorThreats: { [key: string]: number } = {};
        threatActors.forEach(ta => ta.tags.forEach(tag => {
            if (tag.includes('industry')) { // Simplified tag-to-sector mapping
                sectorThreats[tag] = (sectorThreats[tag] || 0) + 1;
            }
        }));

        const topAttacks: { [key: string]: number } = {};
        ioCs.forEach(ioc => {
            const attackType = ioc.tags.includes('phishing') ? 'Phishing' : ioc.tags.includes('ransomware') ? 'Ransomware' : 'Malware';
            topAttacks[attackType] = (topAttacks[attackType] || 0) + 1;
        });
        const sortedTopAttacks = Object.entries(topAttacks)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 3)
            .map(([type, count]) => ({ type, count }));

        const calculateGlobalRiskScore = (): number => {
            const iocImpact = ioCs.filter(ioc => ioc.severity === 'critical').length * 2 + ioCs.filter(ioc => ioc.severity === 'high').length;
            const actorImpact = threatActors.filter(ta => ta.severity === 'critical').length * 3 + threatActors.filter(ta => ta.severity === 'high').length * 1.5;
            const vulnImpact = vulnerabilities.filter(v => v.severity === 'critical' && v.exploitAvailable).length * 4 + vulnerabilities.filter(v => v.severity === 'high' && v.exploitAvailable).length * 2;
            const anomalyImpact = userAnomalies.filter(ua => ua.severity === 'critical' && ua.status !== 'false_positive').length * 2;
            const simulationRisk = attackSimulations.reduce((acc, sim) => acc + (100 - sim.preventionRate) * (sim.vulnerabilitiesExploited.length > 0 ? 1 : 0.5), 0) / (attackSimulations.length || 1);

            let totalScore = iocImpact + actorImpact + vulnImpact + anomalyImpact + simulationRisk;
            totalScore = Math.min(100, Math.max(0, totalScore / 10)); // Scale to 0-100

            return parseFloat(totalScore.toFixed(1));
        };

        setGlobalSummary({
            totalActiveThreatActors: activeActors,
            criticalVulnerabilities: criticalVulns,
            newIoCsLast24h: newIoCs24h,
            ongoingCampaigns: uniqueCampaigns,
            sectorSpecificThreats: sectorThreats,
            topAttacksToday: sortedTopAttacks,
            globalRiskScore: calculateGlobalRiskScore(),
        });
    }, [ioCs, vulnerabilities, threatActors, userAnomalies, attackSimulations]); // Add relevant dependencies

    useEffect(() => {
        refreshData();
        const intervalId = setInterval(refreshData, 5 * 60 * 1000); // Refresh every 5 minutes
        return () => clearInterval(intervalId);
    }, [refreshData]);

    const addIoC = useCallback((ioc: IoC) => setIoCs(prev => [...prev, ioc]), []);
    const updateIoC = useCallback((updatedIoc: IoC) => setIoCs(prev => prev.map(ioc => ioc.id === updatedIoc.id ? updatedIoc : ioc)), []);
    const deleteIoC = useCallback((id: string) => setIoCs(prev => prev.filter(ioc => ioc.id !== id)), []);

    const contextValue = useMemo(() => ({
        ioCs, threatActors, vulnerabilities, attackSimulations, threatReports, aiModelConfigs,
        securityPolicies, assets, userAnomalies, incidentPlaybooks, privacyRegulations, eventLogs,
        threatFeedSources, globalSummary, refreshData, addIoC, updateIoC, deleteIoC
    }), [ioCs, threatActors, vulnerabilities, attackSimulations, threatReports, aiModelConfigs,
        securityPolicies, assets, userAnomalies, incidentPlaybooks, privacyRegulations, eventLogs,
        threatFeedSources, globalSummary, refreshData, addIoC, updateIoC, deleteIoC]);

    return (
        <ThreatIntelligenceContext.Provider value={contextValue}>
            {children}
        </ThreatIntelligenceContext.Provider>
    );
};

export const useThreatIntelligence = () => {
    const context = useContext(ThreatIntelligenceContext);
    if (context === undefined) {
        throw new Error('useThreatIntelligence must be used within a ThreatIntelligenceProvider');
    }
    return context;
};

// --- Reusable UI Components ---

interface SectionHeaderProps {
    title: string;
    description: string;
    icon: React.ElementType;
    onRefresh?: () => void;
    showRefresh?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, icon: Icon, onRefresh, showRefresh = true }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center">
            <Icon className="h-8 w-8 text-purple-400 mr-3" />
            <div>
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>
        </div>
        {showRefresh && onRefresh && (
            <button
                onClick={onRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
                <RefreshIcon className="h-5 w-5 mr-2" /> Refresh
            </button>
        )}
    </div>
);

interface FilterableTableProps<T> {
    data: T[];
    columns: { header: string; accessor: keyof T; render?: (item: T) => React.ReactNode }[];
    title: string;
    initialSortBy?: keyof T;
    initialSortDirection?: 'asc' | 'desc';
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    actionButtons?: (item: T) => React.ReactNode;
}

export const FilterableTable = <T extends { id?: string | number }>({
    data,
    columns,
    title,
    initialSortBy,
    initialSortDirection = 'asc',
    searchPlaceholder = "Search...",
    onRowClick,
    actionButtons
}: FilterableTableProps<T>) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof T | undefined>(initialSortBy);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredData = useMemo(() => {
        return data.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const sortedData = useMemo(() => {
        if (!sortBy) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            // Fallback for other types
            return 0;
        });
    }, [filteredData, sortBy, sortDirection]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, itemsPerPage]);

    const handleSort = (columnAccessor: keyof T) => {
        if (sortBy === columnAccessor) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(columnAccessor);
            setSortDirection('asc');
        }
    };

    const getSortIndicator = (columnAccessor: keyof T) => {
        if (sortBy === columnAccessor) {
            return sortDirection === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />;
        }
        return null;
    };

    return (
        <Card title={title}>
            <div className="mb-4 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                <div className="flex items-center w-full md:w-1/2 relative">
                    <SearchIcon className="absolute left-3 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Items per page:</span>
                    <select
                        className="bg-gray-700 border border-gray-600 rounded-md text-white py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                        {[5, 10, 25, 50, 100].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={String(col.accessor)}
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                                    onClick={() => handleSort(col.accessor)}
                                >
                                    <div className="flex items-center">
                                        {col.header}
                                        {getSortIndicator(col.accessor)}
                                    </div>
                                </th>
                            ))}
                            {actionButtons && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actionButtons ? 1 : 0)} className="px-6 py-4 text-center text-gray-400">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((item, rowIndex) => (
                                <tr
                                    key={item.id || rowIndex}
                                    className={`hover:bg-gray-800 transition duration-150 ease-in-out ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map(col => (
                                        <td key={String(col.accessor)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {col.render ? col.render(item) : String(item[col.accessor])}
                                        </td>
                                    ))}
                                    {actionButtons && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {actionButtons(item)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                <span className="text-sm text-gray-400">
                    Showing {Math.min(sortedData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(sortedData.length, currentPage * itemsPerPage)} of {sortedData.length} entries
                </span>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                        const pageNum = index + 1;
                        if (totalPages <= 5 || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2) || pageNum === 1 || pageNum === totalPages) {
                            if ((pageNum === currentPage - 3 && pageNum > 1) || (pageNum === currentPage + 3 && pageNum < totalPages)) {
                                return <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>;
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        }
                        return null;
                    })}
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </Card>
    );
};

interface DetailPanelProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex justify-end">
            <div className="relative w-full md:w-1/2 lg:w-1/3 bg-gray-800 shadow-xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h3 className="text-2xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition duration-200">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Loading data...</span>
    </div>
);

// --- Dashboard Widgets ---

export const GlobalThreatSummaryWidget: React.FC = () => {
    const { globalSummary, refreshData } = useThreatIntelligence();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [globalSummary]);

    const dataPoints = useMemo(() => [
        { label: "Active Threat Actors", value: globalSummary.totalActiveThreatActors, icon: UsersIcon, color: "text-red-400" },
        { label: "Critical Vulnerabilities", value: globalSummary.criticalVulnerabilities, icon: AlertOctagonIcon, color: "text-yellow-400" },
        { label: "New IoCs (24h)", value: globalSummary.newIoCsLast24h, icon: PlusIcon, color: "text-blue-400" },
        { label: "Ongoing Campaigns", value: globalSummary.ongoingCampaigns, icon: TargetIcon, color: "text-green-400" },
    ], [globalSummary]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#AF19FF', '#FF0000'];

    if (isLoading) return <LoadingSpinner />;

    return (
        <Card title="Global Threat Summary" className="col-span-1 md:col-span-3 lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {dataPoints.map((item, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-700 rounded-md shadow-md">
                        <item.icon className={`h-8 w-8 mr-3 ${item.color}`} />
                        <div>
                            <p className="text-xl font-bold text-white">{item.value}</p>
                            <p className="text-sm text-gray-400">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center"><TrendingUpIcon className="h-5 w-5 mr-2 text-blue-400" />Global Risk Score: <span className="ml-2 text-xl font-bold" style={{ color: globalSummary.globalRiskScore > 70 ? '#EF4444' : globalSummary.globalRiskScore > 40 ? '#F59E0B' : '#34D399' }}>{globalSummary.globalRiskScore}</span></h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart
                            data={[{ name: 'Score', value: globalSummary.globalRiskScore }]} // Dynamic data for real-time would be better
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <XAxis dataKey="name" stroke="#6b7280" />
                            <YAxis domain={[0, 100]} stroke="#6b7280" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#e5e7eb' }} />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <p className="text-gray-400 text-sm mt-2">Overall platform risk level, calculated from aggregated threat data. </p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center"><ZapIcon className="h-5 w-5 mr-2 text-yellow-400" />Top Attack Types Today</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={globalSummary.topAttacksToday}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="type"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {globalSummary.topAttacksToday.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#e5e7eb' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button
                    onClick={refreshData}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                    <RefreshIcon className="h-5 w-5 mr-2" /> Refresh Data
                </button>
            </div>
        </Card>
    );
};

export const IoCThreatFeedWidget: React.FC = () => {
    const { ioCs, addIoC, updateIoC, deleteIoC } = useThreatIntelligence();
    const [selectedIoC, setSelectedIoC] = useState<IoC | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formState, setFormState] = useState<Partial<IoC>>({});

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveIoC = () => {
        if (isAddingNew) {
            addIoC({
                id: generateRandomId(),
                timestamp: new Date().toISOString(),
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                tags: (formState.tags as string[] | undefined) || [],
                confidence: formState.confidence || 0,
                description: formState.description || '',
                ...formState
            } as IoC);
        } else if (selectedIoC) {
            updateIoC({ ...selectedIoC, ...formState });
        }
        setSelectedIoC(null);
        setIsAddingNew(false);
        setFormState({});
    };

    const handleCancelEdit = () => {
        setSelectedIoC(null);
        setIsAddingNew(false);
        setFormState({});
    };

    const IoCDetailPanelContent: React.FC<{ ioc: IoC }> = ({ ioc }) => (
        <>
            <p className="text-gray-300 mb-4">{ioc.description || "No description available."}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Type:</span> <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{ioc.type}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Value:</span> <span className="font-mono text-purple-300 break-all">{ioc.value}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Severity:</span> <span className={`px-2 py-1 text-xs rounded-full ${ioc.severity === 'critical' ? 'bg-red-500' : ioc.severity === 'high' ? 'bg-orange-500' : ioc.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{ioc.severity}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Confidence:</span> <span className="text-white">{ioc.confidence}%</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Source:</span> <span className="text-white">{ioc.source}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">First Seen:</span> <span className="text-gray-400">{new Date(ioc.firstSeen).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Seen:</span> <span className="text-gray-400">{new Date(ioc.lastSeen).toLocaleString()}</span></div>
                <div>
                    <span className="font-semibold text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {ioc.tags.map(tag => (
                            <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <button
                    onClick={() => { setFormState(ioc); setIsAddingNew(false); }}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300"
                >
                    <EditIcon className="h-4 w-4 mr-2" /> Edit
                </button>
                <button
                    onClick={() => { if (window.confirm(`Are you sure you want to delete IoC: ${ioc.value}?`)) deleteIoC(ioc.id); setSelectedIoC(null); }}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
                >
                    <Trash2Icon className="h-4 w-4 mr-2" /> Delete
                </button>
            </div>
        </>
    );

    const IoCForm: React.FC = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="type">Type</label>
                <select
                    id="type"
                    name="type"
                    value={formState.type || ''}
                    onChange={handleFormChange}
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    required
                >
                    <option value="">Select Type</option>
                    {['IP', 'Domain', 'Hash', 'URL', 'Email', 'FilePath', 'Mutex', 'RegistryKey'].map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="value">Value</label>
                <input
                    type="text"
                    id="value"
                    name="value"
                    value={formState.value || ''}
                    onChange={handleFormChange}
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="severity">Severity</label>
                <select
                    id="severity"
                    name="severity"
                    value={formState.severity || ''}
                    onChange={handleFormChange}
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    required
                >
                    <option value="">Select Severity</option>
                    {['low', 'medium', 'high', 'critical'].map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="source">Source</label>
                <input
                    type="text"
                    id="source"
                    name="source"
                    value={formState.source || ''}
                    onChange={handleFormChange}
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confidence">Confidence (%)</label>
                <input
                    type="number"
                    id="confidence"
                    name="confidence"
                    value={formState.confidence || 0}
                    onChange={handleFormChange}
                    min="0"
                    max="100"
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formState.description || ''}
                    onChange={handleFormChange}
                    rows={3}
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                ></textarea>
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="tags">Tags (comma-separated)</label>
                <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={(formState.tags as string[] || []).join(', ')}
                    onChange={(e) => setFormState(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) }))}
                    className="bg-gray-700 border border-gray-600 rounded-md text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                />
            </div>

            <div className="flex justify-end space-x-2 mt-6">
                <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-300"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveIoC}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                    Save IoC
                </button>
            </div>
        </div>
    );

    const iocColumns = useMemo(() => [
        { header: "Type", accessor: "type" },
        { header: "Value", accessor: "value", render: (ioc: IoC) => <span className="font-mono text-purple-300 break-all">{ioc.value}</span> },
        { header: "Severity", accessor: "severity", render: (ioc: IoC) => (
            <span className={`px-2 py-1 text-xs rounded-full ${ioc.severity === 'critical' ? 'bg-red-500' : ioc.severity === 'high' ? 'bg-orange-500' : ioc.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {ioc.severity}
            </span>
        )},
        { header: "Confidence", accessor: "confidence", render: (ioc: IoC) => `${ioc.confidence}%` },
        { header: "Source", accessor: "source" },
        { header: "Last Seen", accessor: "lastSeen", render: (ioc: IoC) => new Date(ioc.lastSeen).toLocaleDateString() },
    ], []);

    return (
        <Card title="Indicators of Compromise (IoCs)" className="col-span-1 md:col-span-3">
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => { setIsAddingNew(true); setFormState({}); setSelectedIoC(null); }}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 ease-in-out"
                >
                    <PlusIcon className="h-5 w-5 mr-2" /> Add New IoC
                </button>
            </div>
            <FilterableTable
                data={ioCs}
                columns={iocColumns}
                title="IoC List"
                initialSortBy="lastSeen"
                initialSortDirection="desc"
                searchPlaceholder="Search IoCs..."
                onRowClick={setSelectedIoC}
                actionButtons={(ioc) => (
                    <div className="flex space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); setFormState(ioc); setIsAddingNew(false); }} className="text-purple-400 hover:text-purple-300"><EditIcon className="h-4 w-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete ${ioc.value}?`)) deleteIoC(ioc.id); }} className="text-red-400 hover:text-red-300"><Trash2Icon className="h-4 w-4" /></button>
                    </div>
                )}
            />

            {(selectedIoC || isAddingNew || (formState.id && !isAddingNew)) && (
                <DetailPanel title={isAddingNew ? "Add New IoC" : (formState.id ? `Edit IoC: ${formState.value}` : `IoC Details: ${selectedIoC?.value}`)} onClose={handleCancelEdit}>
                    {isAddingNew || formState.id ? <IoCForm /> : (selectedIoC && <IoCDetailPanelContent ioc={selectedIoC} />)}
                </DetailPanel>
            )}
        </Card>
    );
};

export const ThreatActorProfiling: React.FC = () => {
    const { threatActors } = useThreatIntelligence();
    const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);

    const actorColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Origin", accessor: "origin" },
        { header: "Motives", accessor: "motives", render: (actor: ThreatActor) => actor.motives.join(', ') },
        { header: "Severity", accessor: "severity", render: (actor: ThreatActor) => (
            <span className={`px-2 py-1 text-xs rounded-full ${actor.severity === 'critical' ? 'bg-red-500' : actor.severity === 'high' ? 'bg-orange-500' : actor.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {actor.severity}
            </span>
        )},
        { header: "Last Activity", accessor: "lastActivity", render: (actor: ThreatActor) => new Date(actor.lastActivity).toLocaleDateString() },
        { header: "Confidence", accessor: "confidence", render: (actor: ThreatActor) => `${actor.confidence}%` },
    ], []);

    const ActorDetailPanelContent: React.FC<{ actor: ThreatActor }> = ({ actor }) => (
        <>
            <p className="text-gray-300 mb-4">{actor.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Origin:</span> <span className="text-white">{actor.origin}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Severity:</span> <span className={`px-2 py-1 text-xs rounded-full ${actor.severity === 'critical' ? 'bg-red-500' : actor.severity === 'high' ? 'bg-orange-500' : actor.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{actor.severity}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Confidence:</span> <span className="text-white">{actor.confidence}%</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Activity:</span> <span className="text-gray-400">{new Date(actor.lastActivity).toLocaleString()}</span></div>
                <div>
                    <span className="font-semibold text-gray-300">Motives:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {actor.motives.map(m => <span key={m} className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">{m}</span>)}
                    </div>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Techniques:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {actor.techniques.map(t => <span key={t} className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">{t}</span>)}
                    </div>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Associated Campaigns:</span>
                    <ul className="list-disc list-inside text-gray-400 mt-1 pl-4">
                        {actor.associatedCampaigns.map(c => <li key={c}>{c}</li>)}
                    </ul>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Mitigation Strategies:</span>
                    <ul className="list-disc list-inside text-gray-400 mt-1 pl-4">
                        {actor.mitigationStrategies.map(m => <li key={m}>{m}</li>)}
                    </ul>
                </div>
                {actor.indicatorsOfCompromise.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Related IoCs:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {actor.indicatorsOfCompromise.map(ioc => (
                                <li key={ioc.id}>{ioc.type}: {ioc.value} <span className="text-xs text-gray-500">({ioc.severity})</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {/* Add edit/delete functionality here similar to IoC if needed */}
        </>
    );

    return (
        <Card title="Threat Actor Profiling" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={threatActors}
                columns={actorColumns}
                title="Known Threat Actors"
                initialSortBy="lastActivity"
                initialSortDirection="desc"
                searchPlaceholder="Search threat actors..."
                onRowClick={setSelectedActor}
            />

            {selectedActor && (
                <DetailPanel title={`Threat Actor: ${selectedActor.name}`} onClose={() => setSelectedActor(null)}>
                    <ActorDetailPanelContent actor={selectedActor} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const VulnerabilityManagement: React.FC = () => {
    const { vulnerabilities } = useThreatIntelligence();
    const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);

    const vulnColumns = useMemo(() => [
        { header: "CVE ID", accessor: "cveId" },
        { header: "Name", accessor: "name" },
        { header: "Severity", accessor: "severity", render: (vuln: Vulnerability) => (
            <span className={`px-2 py-1 text-xs rounded-full ${vuln.severity === 'critical' ? 'bg-red-500' : vuln.severity === 'high' ? 'bg-orange-500' : vuln.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {vuln.severity}
            </span>
        )},
        { header: "CVSS Score", accessor: "cvssScore" },
        { header: "Exploit Available", accessor: "exploitAvailable", render: (vuln: Vulnerability) => vuln.exploitAvailable ? <CheckCircleIcon className="h-5 w-5 text-red-500" /> : <XCircleIcon className="h-5 w-5 text-green-500" /> },
        { header: "Patch Available", accessor: "patchAvailable", render: (vuln: Vulnerability) => vuln.patchAvailable ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <AlertTriangleIcon className="h-5 w-5 text-yellow-500" /> },
        { header: "Published Date", accessor: "publishedDate", render: (vuln: Vulnerability) => new Date(vuln.publishedDate).toLocaleDateString() },
    ], []);

    const VulnDetailPanelContent: React.FC<{ vuln: Vulnerability }> = ({ vuln }) => (
        <>
            <p className="text-gray-300 mb-4">{vuln.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">CVE ID:</span> <span className="text-white font-mono">{vuln.cveId}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Severity:</span> <span className={`px-2 py-1 text-xs rounded-full ${vuln.severity === 'critical' ? 'bg-red-500' : vuln.severity === 'high' ? 'bg-orange-500' : vuln.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{vuln.severity}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">CVSS Score:</span> <span className="text-white text-lg font-bold">{vuln.cvssScore}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Exploit Available:</span> {vuln.exploitAvailable ? <CheckCircleIcon className="h-5 w-5 text-red-500" /> : <XCircleIcon className="h-5 w-5 text-green-500" />}</div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Patch Available:</span> {vuln.patchAvailable ? <CheckCircleIcon className="h-5 w-5 text-green-500" /> : <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />}</div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Published:</span> <span className="text-gray-400">{new Date(vuln.publishedDate).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Updated:</span> <span className="text-gray-400">{new Date(vuln.updatedDate).toLocaleString()}</span></div>
                <div>
                    <span className="font-semibold text-gray-300">Affected Products:</span>
                    <ul className="list-disc list-inside text-gray-400 mt-1 pl-4">
                        {vuln.affectedProducts.map(p => <li key={p}>{p}</li>)}
                    </ul>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Remediation Steps:</span>
                    <ul className="list-disc list-inside text-gray-400 mt-1 pl-4">
                        {vuln.remediationSteps.map(step => <li key={step}>{step}</li>)}
                    </ul>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">References:</span>
                    <ul className="list-disc list-inside text-blue-400 mt-1 pl-4">
                        {vuln.references.map(ref => <li key={ref}><a href={ref} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">{ref} <ExternalLinkIcon className="h-4 w-4 ml-1" /></a></li>)}
                    </ul>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {vuln.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <Card title="Vulnerability Management" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={vulnerabilities}
                columns={vulnColumns}
                title="Known Vulnerabilities"
                initialSortBy="cvssScore"
                initialSortDirection="desc"
                searchPlaceholder="Search vulnerabilities..."
                onRowClick={setSelectedVuln}
            />

            {selectedVuln && (
                <DetailPanel title={`Vulnerability: ${selectedVuln.cveId}`} onClose={() => setSelectedVuln(null)}>
                    <VulnDetailPanelContent vuln={selectedVuln} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const AttackSurfaceManagement: React.FC = () => {
    const { assets, vulnerabilities } = useThreatIntelligence();
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    const assetColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Type", accessor: "type" },
        { header: "IP Address", accessor: "ipAddress" },
        { header: "Criticality", accessor: "criticality", render: (asset: Asset) => (
            <span className={`px-2 py-1 text-xs rounded-full ${asset.criticality === 'critical' ? 'bg-red-500' : asset.criticality === 'high' ? 'bg-orange-500' : asset.criticality === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {asset.criticality}
            </span>
        )},
        { header: "Status", accessor: "status", render: (asset: Asset) => (
            <span className={`px-2 py-1 text-xs rounded-full ${asset.status === 'compromised' ? 'bg-red-500' : asset.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                {asset.status}
            </span>
        )},
        { header: "Last Scanned", accessor: "lastScanned", render: (asset: Asset) => new Date(asset.lastScanned).toLocaleDateString() },
        { header: "Vulnerabilities", accessor: "vulnerabilities", render: (asset: Asset) => (
            <span className={`font-bold ${asset.vulnerabilities.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {asset.vulnerabilities.length}
            </span>
        )},
    ], []);

    const AssetDetailPanelContent: React.FC<{ asset: Asset }> = ({ asset }) => {
        const assetVulns = vulnerabilities.filter(v => asset.vulnerabilities.includes(v.cveId));
        return (
            <>
                <p className="text-gray-300 mb-4">Detailed information about the asset, its configuration, and associated risks.</p>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Type:</span> <span className="text-white">{asset.type}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">IP Address:</span> <span className="text-white font-mono">{asset.ipAddress}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Criticality:</span> <span className={`px-2 py-1 text-xs rounded-full ${asset.criticality === 'critical' ? 'bg-red-500' : asset.criticality === 'high' ? 'bg-orange-500' : asset.criticality === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{asset.criticality}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Owner:</span> <span className="text-white">{asset.owner}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${asset.status === 'compromised' ? 'bg-red-500' : asset.status === 'online' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>{asset.status}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Geolocation:</span> <span className="text-white">{asset.geolocation}</span></div>
                    <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Scanned:</span> <span className="text-gray-400">{new Date(asset.lastScanned).toLocaleString()}</span></div>
                    {asset.osVersion && <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">OS Version:</span> <span className="text-white">{asset.osVersion}</span></div>}
                    {asset.firmwareVersion && <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Firmware:</span> <span className="text-white">{asset.firmwareVersion}</span></div>}
                    {asset.installedSoftware && asset.installedSoftware.length > 0 && (
                        <div>
                            <span className="font-semibold text-gray-300">Installed Software:</span>
                            <ul className="list-disc list-inside text-gray-400 mt-1 pl-4">
                                {asset.installedSoftware.map(sw => <li key={sw}>{sw}</li>)}
                            </ul>
                        </div>
                    )}
                    {assetVulns.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-white">Associated Vulnerabilities ({assetVulns.length}):</h4>
                            <ul className="list-disc list-inside text-red-400 pl-4">
                                {assetVulns.map(v => (
                                    <li key={v.cveId} className="hover:underline cursor-pointer" onClick={() => {/* Future: navigate to vuln detail */}}>
                                        {v.cveId} - {v.name} <span className="text-xs text-gray-500">({v.severity}, CVSS: {v.cvssScore})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </>
        );
    };

    return (
        <Card title="Attack Surface Management" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={assets}
                columns={assetColumns}
                title="Asset Inventory"
                initialSortBy="criticality"
                initialSortDirection="desc"
                searchPlaceholder="Search assets..."
                onRowClick={setSelectedAsset}
            />

            {selectedAsset && (
                <DetailPanel title={`Asset Details: ${selectedAsset.name}`} onClose={() => setSelectedAsset(null)}>
                    <AssetDetailPanelContent asset={selectedAsset} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const RedTeamSimulationDashboard: React.FC = () => {
    const { attackSimulations } = useThreatIntelligence();
    const [selectedSimulation, setSelectedSimulation] = useState<AttackSimulationResult | null>(null);

    const simulationColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Target System", accessor: "targetSystem" },
        { header: "Adversary", accessor: "adversaryEmulation" },
        { header: "Status", accessor: "status", render: (sim: AttackSimulationResult) => (
            <span className={`px-2 py-1 text-xs rounded-full ${sim.status === 'completed' ? 'bg-green-500' : sim.status === 'failed' ? 'bg-red-500' : sim.status === 'running' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                {sim.status}
            </span>
        )},
        { header: "Detection Rate", accessor: "detectionRate", render: (sim: AttackSimulationResult) => `${sim.detectionRate}%` },
        { header: "Prevention Rate", accessor: "preventionRate", render: (sim: AttackSimulationResult) => `${sim.preventionRate}%` },
        { header: "End Time", accessor: "endTime", render: (sim: AttackSimulationResult) => new Date(sim.endTime).toLocaleDateString() },
        { header: "Risk Score Change", accessor: "riskScoreChange", render: (sim: AttackSimulationResult) => (
            <span className={sim.riskScoreChange < 0 ? 'text-green-400' : sim.riskScoreChange > 0 ? 'text-red-400' : 'text-gray-400'}>
                {sim.riskScoreChange > 0 ? '+' : ''}{sim.riskScoreChange}
            </span>
        )},
    ], []);

    const SimulationDetailPanelContent: React.FC<{ simulation: AttackSimulationResult }> = ({ simulation }) => (
        <>
            <p className="text-gray-300 mb-4">Detailed results and recommendations from the simulated attack.</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Target System:</span> <span className="text-white">{simulation.targetSystem}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Attack Vector:</span> <span className="text-white">{simulation.attackVector}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Adversary Emulation:</span> <span className="text-white">{simulation.adversaryEmulation}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${simulation.status === 'completed' ? 'bg-green-500' : simulation.status === 'failed' ? 'bg-red-500' : simulation.status === 'running' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>{simulation.status}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Detection Rate:</span> <span className="text-white font-bold">{simulation.detectionRate}%</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Prevention Rate:</span> <span className="text-white font-bold">{simulation.preventionRate}%</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Risk Score Change:</span> <span className={simulation.riskScoreChange < 0 ? 'text-green-400 font-bold' : simulation.riskScoreChange > 0 ? 'text-red-400 font-bold' : 'text-gray-400 font-bold'}>{simulation.riskScoreChange > 0 ? '+' : ''}{simulation.riskScoreChange}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Start Time:</span> <span className="text-gray-400">{new Date(simulation.startTime).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">End Time:</span> <span className="text-gray-400">{new Date(simulation.endTime).toLocaleString()}</span></div>
                {simulation.vulnerabilitiesExploited.length > 0 && (
                    <div>
                        <span className="font-semibold text-gray-300">Vulnerabilities Exploited:</span>
                        <ul className="list-disc list-inside text-red-400 mt-1 pl-4">
                            {simulation.vulnerabilitiesExploited.map(cve => <li key={cve}>{cve}</li>)}
                        </ul>
                    </div>
                )}
                <div>
                    <span className="font-semibold text-gray-300">Mitigation Recommendations:</span>
                    <ul className="list-disc list-inside text-gray-400 mt-1 pl-4">
                        {simulation.mitigationRecommendations.map(rec => <li key={rec}>{rec}</li>)}
                    </ul>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Report:</span>
                    <a href={simulation.reportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center mt-1"><FileTextIcon className="h-4 w-4 mr-2" /> View Full Report <ExternalLinkIcon className="h-4 w-4 ml-1" /></a>
                </div>
                {simulation.logs.length > 0 && (
                    <div className="mt-4">
                        <span className="font-semibold text-gray-300">Simulation Logs (Excerpts):</span>
                        <div className="bg-gray-700 text-gray-300 p-3 rounded-md max-h-40 overflow-y-auto font-mono text-xs mt-1">
                            {simulation.logs.map((log, i) => <p key={i}>{log}</p>)}
                        </div>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <Card title="Red-Team Simulation Dashboard" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={attackSimulations}
                columns={simulationColumns}
                title="Simulation Results"
                initialSortBy="endTime"
                initialSortDirection="desc"
                searchPlaceholder="Search simulations..."
                onRowClick={setSelectedSimulation}
            />

            {selectedSimulation && (
                <DetailPanel title={`Simulation: ${selectedSimulation.name}`} onClose={() => setSelectedSimulation(null)}>
                    <SimulationDetailPanelContent simulation={selectedSimulation} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const AITrainingAndPerformance: React.FC = () => {
    const { aiModelConfigs } = useThreatIntelligence();
    const [selectedModel, setSelectedModel] = useState<AIModelConfig | null>(null);

    const modelColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Type", accessor: "modelType" },
        { header: "Status", accessor: "status", render: (model: AIModelConfig) => (
            <span className={`px-2 py-1 text-xs rounded-full ${model.status === 'active' ? 'bg-green-500' : model.status === 'training' ? 'bg-blue-500' : model.status === 'error' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
                {model.status}
            </span>
        )},
        { header: "Accuracy", accessor: "performanceMetrics", render: (model: AIModelConfig) => `${(model.performanceMetrics.accuracy * 100).toFixed(1)}%` },
        { header: "Last Trained", accessor: "lastTrained", render: (model: AIModelConfig) => new Date(model.lastTrained).toLocaleDateString() },
        { header: "Version", accessor: "version" },
    ], []);

    const ModelDetailPanelContent: React.FC<{ model: AIModelConfig }> = ({ model }) => (
        <>
            <p className="text-gray-300 mb-4">{model.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Model Type:</span> <span className="text-white">{model.modelType}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${model.status === 'active' ? 'bg-green-500' : model.status === 'training' ? 'bg-blue-500' : model.status === 'error' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>{model.status}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Version:</span> <span className="text-white">{model.version}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Trained:</span> <span className="text-gray-400">{new Date(model.lastTrained).toLocaleString()}</span></div>

                <div className="mt-4">
                    <h4 className="font-semibold text-white">Performance Metrics:</h4>
                    <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <p>Accuracy: <span className="font-bold text-white">{(model.performanceMetrics.accuracy * 100).toFixed(1)}%</span></p>
                        <p>Precision: <span className="font-bold text-white">{(model.performanceMetrics.precision * 100).toFixed(1)}%</span></p>
                        <p>Recall: <span className="font-bold text-white">{(model.performanceMetrics.recall * 100).toFixed(1)}%</span></p>
                        <p>F1 Score: <span className="font-bold text-white">{(model.performanceMetrics.f1Score * 100).toFixed(1)}%</span></p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart outerRadius={90} data={[
                            { subject: 'Accuracy', A: model.performanceMetrics.accuracy * 100, fullMark: 100 },
                            { subject: 'Precision', A: model.performanceMetrics.precision * 100, fullMark: 100 },
                            { subject: 'Recall', A: model.performanceMetrics.recall * 100, fullMark: 100 },
                            { subject: 'F1 Score', A: model.performanceMetrics.f1Score * 100, fullMark: 100 },
                        ]}>
                            <PolarGrid stroke="#4b5563" />
                            <PolarAngleAxis dataKey="subject" stroke="#e5e7eb" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" />
                            <Radar name={model.name} dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} itemStyle={{ color: '#e5e7eb' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Input Features:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {model.inputFeatures.map(f => <span key={f} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{f}</span>)}
                    </div>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Output Schema:</span>
                    <p className="bg-gray-700 text-gray-300 p-2 rounded-md font-mono text-xs mt-1">{model.outputSchema}</p>
                </div>
                <div>
                    <span className="font-semibold text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {model.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                    <PlayIcon className="h-4 w-4 mr-2" /> Re-train Model
                </button>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300">
                    <SettingsIcon className="h-4 w-4 mr-2" /> Configure
                </button>
            </div>
        </>
    );

    return (
        <Card title="AI Model Training & Performance" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={aiModelConfigs}
                columns={modelColumns}
                title="AI Models"
                initialSortBy="performanceMetrics"
                initialSortDirection="desc"
                searchPlaceholder="Search AI models..."
                onRowClick={setSelectedModel}
            />

            {selectedModel && (
                <DetailPanel title={`AI Model: ${selectedModel.name}`} onClose={() => setSelectedModel(null)}>
                    <ModelDetailPanelContent model={selectedModel} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const ThreatReportsAndAnalysis: React.FC = () => {
    const { threatReports } = useThreatIntelligence();
    const [selectedReport, setSelectedReport] = useState<ThreatReport | null>(null);

    const reportColumns = useMemo(() => [
        { header: "Title", accessor: "title" },
        { header: "Author", accessor: "author" },
        { header: "Publish Date", accessor: "publishDate", render: (report: ThreatReport) => new Date(report.publishDate).toLocaleDateString() },
        { header: "Sentiment", accessor: "sentiment", render: (report: ThreatReport) => (
            <span className={`px-2 py-1 text-xs rounded-full ${report.sentiment === 'negative' ? 'bg-red-500' : report.sentiment === 'positive' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                {report.sentiment}
            </span>
        )},
        { header: "Confidence", accessor: "confidence", render: (report: ThreatReport) => `${report.confidence}%` },
    ], []);

    const ReportDetailPanelContent: React.FC<{ report: ThreatReport }> = ({ report }) => (
        <>
            <p className="text-gray-300 italic mb-4">{report.summary}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Author:</span> <span className="text-white">{report.author}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Publish Date:</span> <span className="text-gray-400">{new Date(report.publishDate).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Sentiment:</span> <span className={`px-2 py-1 text-xs rounded-full ${report.sentiment === 'negative' ? 'bg-red-500' : report.sentiment === 'positive' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>{report.sentiment}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Confidence:</span> <span className="text-white">{report.confidence}%</span></div>

                <div className="mt-4">
                    <h4 className="font-semibold text-white">Full Report Content:</h4>
                    <div className="bg-gray-700 text-gray-300 p-3 rounded-md max-h-60 overflow-y-auto custom-scrollbar text-sm">
                        {report.fullReportContent}
                    </div>
                </div>

                {report.relatedIoCs.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Related IoCs:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {report.relatedIoCs.map(ioc => (
                                <li key={ioc.id}>{ioc.type}: {ioc.value} <span className="text-xs text-gray-500">({ioc.severity})</span></li>
                            ))}
                        </ul>
                    </div>
                )}
                {report.relatedActors.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Related Threat Actors:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {report.relatedActors.map(actor => <li key={actor.id}>{actor.name} <span className="text-xs text-gray-500">({actor.origin})</span></li>)}
                        </ul>
                    </div>
                )}
                {report.relatedVulnerabilities.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Related Vulnerabilities:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {report.relatedVulnerabilities.map(vuln => <li key={vuln.cveId}>{vuln.cveId}: {vuln.name} <span className="text-xs text-gray-500">({vuln.severity})</span></li>)}
                        </ul>
                    </div>
                )}
                <div>
                    <span className="font-semibold text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {report.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                    <DownloadIcon className="h-4 w-4 mr-2" /> Download Report
                </button>
            </div>
        </>
    );

    return (
        <Card title="Threat Reports & Analysis" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={threatReports}
                columns={reportColumns}
                title="Threat Reports"
                initialSortBy="publishDate"
                initialSortDirection="desc"
                searchPlaceholder="Search reports..."
                onRowClick={setSelectedReport}
            />

            {selectedReport && (
                <DetailPanel title={`Threat Report: ${selectedReport.title}`} onClose={() => setSelectedReport(null)}>
                    <ReportDetailPanelContent report={selectedReport} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const SecurityPolicyDashboard: React.FC = () => {
    const { securityPolicies } = useThreatIntelligence();
    const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null);

    const policyColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Type", accessor: "type" },
        { header: "Status", accessor: "status", render: (policy: SecurityPolicy) => (
            <span className={`px-2 py-1 text-xs rounded-full ${policy.status === 'active' ? 'bg-green-500' : policy.status === 'inactive' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
                {policy.status}
            </span>
        )},
        { header: "Risk Level", accessor: "riskLevel", render: (policy: SecurityPolicy) => (
            <span className={`px-2 py-1 text-xs rounded-full ${policy.riskLevel === 'critical' ? 'bg-red-500' : policy.riskLevel === 'high' ? 'bg-orange-500' : policy.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {policy.riskLevel}
            </span>
        )},
        { header: "Last Updated", accessor: "lastUpdatedDate", render: (policy: SecurityPolicy) => new Date(policy.lastUpdatedDate).toLocaleDateString() },
        { header: "Compliance", accessor: "complianceStandards", render: (policy: SecurityPolicy) => policy.complianceStandards.join(', ') || 'N/A' },
    ], []);

    const PolicyDetailPanelContent: React.FC<{ policy: SecurityPolicy }> = ({ policy }) => (
        <>
            <p className="text-gray-300 mb-4">{policy.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Type:</span> <span className="text-white">{policy.type}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${policy.status === 'active' ? 'bg-green-500' : policy.status === 'inactive' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>{policy.status}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Risk Level:</span> <span className={`px-2 py-1 text-xs rounded-full ${policy.riskLevel === 'critical' ? 'bg-red-500' : policy.riskLevel === 'high' ? 'bg-orange-500' : policy.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{policy.riskLevel}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Updated By:</span> <span className="text-white">{policy.lastUpdatedBy}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Updated Date:</span> <span className="text-gray-400">{new Date(policy.lastUpdatedDate).toLocaleString()}</span></div>

                {policy.rules.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Policy Rules:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {policy.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                        </ul>
                    </div>
                )}
                {policy.enforcementPoints.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Enforcement Points:</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {policy.enforcementPoints.map(ep => <span key={ep} className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full">{ep}</span>)}
                        </div>
                    </div>
                )}
                {policy.complianceStandards.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Compliance Standards:</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {policy.complianceStandards.map(cs => <span key={cs} className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full">{cs}</span>)}
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300">
                    <EditIcon className="h-4 w-4 mr-2" /> Edit Policy
                </button>
            </div>
        </>
    );

    return (
        <Card title="Security Policy Dashboard" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={securityPolicies}
                columns={policyColumns}
                title="Security Policies"
                initialSortBy="lastUpdatedDate"
                initialSortDirection="desc"
                searchPlaceholder="Search policies..."
                onRowClick={setSelectedPolicy}
            />

            {selectedPolicy && (
                <DetailPanel title={`Policy: ${selectedPolicy.name}`} onClose={() => setSelectedPolicy(null)}>
                    <PolicyDetailPanelContent policy={selectedPolicy} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const UserBehaviorAnalytics: React.FC = () => {
    const { userAnomalies } = useThreatIntelligence();
    const [selectedAnomaly, setSelectedAnomaly] = useState<UserBehaviorAnomaly | null>(null);

    const anomalyColumns = useMemo(() => [
        { header: "User ID", accessor: "userId" },
        { header: "Username", accessor: "username" },
        { header: "Anomaly Type", accessor: "anomalyType" },
        { header: "Severity", accessor: "severity", render: (anomaly: UserBehaviorAnomaly) => (
            <span className={`px-2 py-1 text-xs rounded-full ${anomaly.severity === 'critical' ? 'bg-red-500' : anomaly.severity === 'high' ? 'bg-orange-500' : anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {anomaly.severity}
            </span>
        )},
        { header: "Confidence", accessor: "confidence", render: (anomaly: UserBehaviorAnomaly) => `${anomaly.confidence}%` },
        { header: "Status", accessor: "status", render: (anomaly: UserBehaviorAnomaly) => (
            <span className={`px-2 py-1 text-xs rounded-full ${anomaly.status === 'new' ? 'bg-blue-500' : anomaly.status === 'investigating' ? 'bg-yellow-500' : anomaly.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                {anomaly.status}
            </span>
        )},
        { header: "Timestamp", accessor: "timestamp", render: (anomaly: UserBehaviorAnomaly) => new Date(anomaly.timestamp).toLocaleString() },
    ], []);

    const AnomalyDetailPanelContent: React.FC<{ anomaly: UserBehaviorAnomaly }> = ({ anomaly }) => (
        <>
            <p className="text-gray-300 italic mb-4">{anomaly.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">User ID:</span> <span className="text-white">{anomaly.userId}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Username:</span> <span className="text-white">{anomaly.username}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Anomaly Type:</span> <span className="text-white">{anomaly.anomalyType}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Severity:</span> <span className={`px-2 py-1 text-xs rounded-full ${anomaly.severity === 'critical' ? 'bg-red-500' : anomaly.severity === 'high' ? 'bg-orange-500' : anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{anomaly.severity}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Confidence:</span> <span className="text-white">{anomaly.confidence}%</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${anomaly.status === 'new' ? 'bg-blue-500' : anomaly.status === 'investigating' ? 'bg-yellow-500' : anomaly.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>{anomaly.status}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Timestamp:</span> <span className="text-gray-400">{new Date(anomaly.timestamp).toLocaleString()}</span></div>
                {anomaly.suggestedAction && <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Suggested Action:</span> <span className="text-white">{anomaly.suggestedAction}</span></div>}

                {anomaly.associatedIoCs.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Associated IoCs:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {anomaly.associatedIoCs.map(ioc => (
                                <li key={ioc.id}>{ioc.type}: {ioc.value} <span className="text-xs text-gray-500">({ioc.severity})</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition duration-300">
                    <EyeIcon className="h-4 w-4 mr-2" /> Investigate
                </button>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300">
                    <CheckCircleIcon className="h-4 w-4 mr-2" /> Resolve
                </button>
                <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300">
                    <XCircleIcon className="h-4 w-4 mr-2" /> Mark False Positive
                </button>
            </div>
        </>
    );

    return (
        <Card title="User Behavior Analytics (UBA)" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={userAnomalies}
                columns={anomalyColumns}
                title="User Anomalies"
                initialSortBy="timestamp"
                initialSortDirection="desc"
                searchPlaceholder="Search anomalies..."
                onRowClick={setSelectedAnomaly}
            />

            {selectedAnomaly && (
                <DetailPanel title={`User Anomaly: ${selectedAnomaly.username}`} onClose={() => setSelectedAnomaly(null)}>
                    <AnomalyDetailPanelContent anomaly={selectedAnomaly} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const IncidentResponsePlaybooks: React.FC = () => {
    const { incidentPlaybooks } = useThreatIntelligence();
    const [selectedPlaybook, setSelectedPlaybook] = useState<IncidentResponsePlaybook | null>(null);

    const playbookColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Trigger Condition", accessor: "triggerCondition" },
        { header: "Severity", accessor: "severityLevel", render: (pb: IncidentResponsePlaybook) => (
            <span className={`px-2 py-1 text-xs rounded-full ${pb.severityLevel === 'critical' ? 'bg-red-500' : pb.severityLevel === 'high' ? 'bg-orange-500' : pb.severityLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {pb.severityLevel}
            </span>
        )},
        { header: "Owner Team", accessor: "ownerTeam" },
        { header: "Last Updated", accessor: "lastUpdated", render: (pb: IncidentResponsePlaybook) => new Date(pb.lastUpdated).toLocaleDateString() },
    ], []);

    const PlaybookDetailPanelContent: React.FC<{ playbook: IncidentResponsePlaybook }> = ({ playbook }) => (
        <>
            <p className="text-gray-300 italic mb-4">{playbook.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Trigger:</span> <span className="text-white">{playbook.triggerCondition}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Severity:</span> <span className={`px-2 py-1 text-xs rounded-full ${playbook.severityLevel === 'critical' ? 'bg-red-500' : playbook.severityLevel === 'high' ? 'bg-orange-500' : playbook.severityLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{playbook.severityLevel}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Owner Team:</span> <span className="text-white">{playbook.ownerTeam}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Updated:</span> <span className="text-gray-400">{new Date(playbook.lastUpdated).toLocaleString()}</span></div>

                {playbook.steps.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Execution Steps:</h4>
                        <ol className="list-decimal list-inside text-gray-400 pl-4">
                            {playbook.steps.map((step, i) => (
                                <li key={i} className="mb-1">
                                    <span className={`font-semibold ${step.status === 'completed' ? 'text-green-400' : step.status === 'in_progress' ? 'text-blue-400' : 'text-gray-400'}`}>
                                        Step {step.order}: {step.action}
                                    </span>
                                    <span className="ml-2 text-xs">({step.assignee} - {step.status})</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
                <div>
                    <span className="font-semibold text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {playbook.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                    <PlayIcon className="h-4 w-4 mr-2" /> Initiate Playbook
                </button>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300">
                    <EditIcon className="h-4 w-4 mr-2" /> Edit Playbook
                </button>
            </div>
        </>
    );

    return (
        <Card title="Incident Response Playbooks" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={incidentPlaybooks}
                columns={playbookColumns}
                title="Available Playbooks"
                initialSortBy="name"
                initialSortDirection="asc"
                searchPlaceholder="Search playbooks..."
                onRowClick={setSelectedPlaybook}
            />

            {selectedPlaybook && (
                <DetailPanel title={`Playbook: ${selectedPlaybook.name}`} onClose={() => setSelectedPlaybook(null)}>
                    <PlaybookDetailPanelContent playbook={selectedPlaybook} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const ComplianceAndPrivacy: React.FC = () => {
    const { privacyRegulations } = useThreatIntelligence();
    const [selectedRegulation, setSelectedRegulation] = useState<DataPrivacyRegulation | null>(null);

    const regulationColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "Jurisdiction", accessor: "jurisdiction" },
        { header: "Compliance Status", accessor: "complianceStatus", render: (reg: DataPrivacyRegulation) => (
            <span className={`px-2 py-1 text-xs rounded-full ${reg.complianceStatus === 'compliant' ? 'bg-green-500' : reg.complianceStatus === 'non-compliant' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
                {reg.complianceStatus}
            </span>
        )},
        { header: "Risk of Non-Compliance", accessor: "riskOfNonCompliance", render: (reg: DataPrivacyRegulation) => (
            <span className={`px-2 py-1 text-xs rounded-full ${reg.riskOfNonCompliance === 'high' ? 'bg-red-500' : reg.riskOfNonCompliance === 'medium' ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
                {reg.riskOfNonCompliance}
            </span>
        )},
        { header: "Last Audit", accessor: "lastAuditDate", render: (reg: DataPrivacyRegulation) => new Date(reg.lastAuditDate).toLocaleDateString() },
    ], []);

    const RegulationDetailPanelContent: React.FC<{ regulation: DataPrivacyRegulation }> = ({ regulation }) => (
        <>
            <p className="text-gray-300 italic mb-4">{regulation.description}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Name:</span> <span className="text-white">{regulation.name}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Jurisdiction:</span> <span className="text-white">{regulation.jurisdiction}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Compliance Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${regulation.complianceStatus === 'compliant' ? 'bg-green-500' : regulation.complianceStatus === 'non-compliant' ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>{regulation.complianceStatus}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Risk of Non-Compliance:</span> <span className={`px-2 py-1 text-xs rounded-full ${regulation.riskOfNonCompliance === 'high' ? 'bg-red-500' : regulation.riskOfNonCompliance === 'medium' ? 'bg-orange-500' : 'bg-green-500'} text-white`}>{regulation.riskOfNonCompliance}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Audit Date:</span> <span className="text-gray-400">{new Date(regulation.lastAuditDate).toLocaleString()}</span></div>

                {regulation.keyRequirements.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Key Requirements:</h4>
                        <ul className="list-disc list-inside text-gray-400 pl-4">
                            {regulation.keyRequirements.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300">
                    <CheckCircleIcon className="h-4 w-4 mr-2" /> Update Compliance
                </button>
            </div>
        </>
    );

    return (
        <Card title="Compliance & Privacy" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={privacyRegulations}
                columns={regulationColumns}
                title="Data Privacy Regulations"
                initialSortBy="name"
                initialSortDirection="asc"
                searchPlaceholder="Search regulations..."
                onRowClick={setSelectedRegulation}
            />

            {selectedRegulation && (
                <DetailPanel title={`Regulation: ${selectedRegulation.name}`} onClose={() => setSelectedRegulation(null)}>
                    <RegulationDetailPanelContent regulation={selectedRegulation} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const EventLogMonitoring: React.FC = () => {
    const { eventLogs } = useThreatIntelligence();
    const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);

    const logColumns = useMemo(() => [
        { header: "Timestamp", accessor: "timestamp", render: (log: EventLog) => new Date(log.timestamp).toLocaleString() },
        { header: "Source", accessor: "source" },
        { header: "Event Type", accessor: "eventType" },
        { header: "Severity", accessor: "severity", render: (log: EventLog) => (
            <span className={`px-2 py-1 text-xs rounded-full ${log.severity === 'critical' ? 'bg-red-500' : log.severity === 'error' ? 'bg-orange-500' : log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>
                {log.severity}
            </span>
        )},
        { header: "Message", accessor: "message" },
        { header: "User ID", accessor: "userId", render: (log: EventLog) => log.userId || 'N/A' },
        { header: "Asset ID", accessor: "assetId", render: (log: EventLog) => log.assetId || 'N/A' },
    ], []);

    const LogDetailPanelContent: React.FC<{ log: EventLog }> = ({ log }) => (
        <>
            <p className="text-gray-300 italic mb-4">{log.message}</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Timestamp:</span> <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Source:</span> <span className="text-white">{log.source}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Event Type:</span> <span className="text-white">{log.eventType}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Severity:</span> <span className={`px-2 py-1 text-xs rounded-full ${log.severity === 'critical' ? 'bg-red-500' : log.severity === 'error' ? 'bg-orange-500' : log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'} text-white`}>{log.severity}</span></div>
                {log.userId && <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">User ID:</span> <span className="text-white">{log.userId}</span></div>}
                {log.assetId && <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Asset ID:</span> <span className="text-white">{log.assetId}</span></div>}
                {log.associatedIoC && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Associated IoC:</h4>
                        <p className="text-gray-400 ml-4">{log.associatedIoC.type}: {log.associatedIoC.value} <span className="text-xs text-gray-500">({log.associatedIoC.severity})</span></p>
                    </div>
                )}
                {log.details && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-white">Details:</h4>
                        <pre className="bg-gray-700 text-gray-300 p-3 rounded-md max-h-40 overflow-y-auto font-mono text-xs mt-1">
                            {JSON.stringify(log.details, null, 2)}
                        </pre>
                    </div>
                )}
                <div>
                    <span className="font-semibold text-gray-300">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {log.tags.map(tag => <span key={tag} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                    <SearchIcon className="h-4 w-4 mr-2" /> Investigate Event
                </button>
            </div>
        </>
    );

    return (
        <Card title="Event Log Monitoring" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={eventLogs}
                columns={logColumns}
                title="Recent Events"
                initialSortBy="timestamp"
                initialSortDirection="desc"
                searchPlaceholder="Search logs..."
                onRowClick={setSelectedLog}
            />

            {selectedLog && (
                <DetailPanel title={`Event Log: ${selectedLog.eventType}`} onClose={() => setSelectedLog(null)}>
                    <LogDetailPanelContent log={selectedLog} />
                </DetailPanel>
            )}
        </Card>
    );
};

export const ThreatFeedConfiguration: React.FC = () => {
    const { threatFeedSources } = useThreatIntelligence();
    const [selectedFeed, setSelectedFeed] = useState<ThreatFeedSource | null>(null);

    const feedColumns = useMemo(() => [
        { header: "Name", accessor: "name" },
        { header: "URL", accessor: "url", render: (feed: ThreatFeedSource) => <a href={feed.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{feed.url}</a> },
        { header: "Category", accessor: "category" },
        { header: "Status", accessor: "status", render: (feed: ThreatFeedSource) => (
            <span className={`px-2 py-1 text-xs rounded-full ${feed.status === 'active' ? 'bg-green-500' : feed.status === 'error' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
                {feed.status}
            </span>
        )},
        { header: "Last Ingested", accessor: "lastIngested", render: (feed: ThreatFeedSource) => new Date(feed.lastIngested).toLocaleString() },
        { header: "Refresh Interval", accessor: "refreshInterval", render: (feed: ThreatFeedSource) => `${feed.refreshInterval} min` },
        { header: "Confidence Score", accessor: "confidenceScore", render: (feed: ThreatFeedSource) => `${feed.confidenceScore}%` },
    ], []);

    const FeedDetailPanelContent: React.FC<{ feed: ThreatFeedSource }> = ({ feed }) => (
        <>
            <p className="text-gray-300 italic mb-4">Configuration details and status for this external threat intelligence feed.</p>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">URL:</span> <a href={feed.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center">{feed.url} <ExternalLinkIcon className="h-4 w-4 ml-1" /></a></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Format:</span> <span className="text-white">{feed.format}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Category:</span> <span className="text-white">{feed.category}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded-full ${feed.status === 'active' ? 'bg-green-500' : feed.status === 'error' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>{feed.status}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Last Ingested:</span> <span className="text-gray-400">{new Date(feed.lastIngested).toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Refresh Interval:</span> <span className="text-white">{feed.refreshInterval} minutes</span></div>
                <div className="flex justify-between items-center text-gray-300"><span className="font-semibold">Confidence Score:</span> <span className="text-white">{feed.confidenceScore}%</span></div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                    <RefreshIcon className="h-4 w-4 mr-2" /> Manual Sync
                </button>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300">
                    <SettingsIcon className="h-4 w-4 mr-2" /> Configure
                </button>
            </div>
        </>
    );

    return (
        <Card title="Threat Feed Configuration" className="col-span-1 md:col-span-3">
            <FilterableTable
                data={threatFeedSources}
                columns={feedColumns}
                title="Configured Threat Feeds"
                initialSortBy="name"
                initialSortDirection="asc"
                searchPlaceholder="Search feeds..."
                onRowClick={setSelectedFeed}
            />

            {selectedFeed && (
                <DetailPanel title={`Threat Feed: ${selectedFeed.name}`} onClose={() => setSelectedFeed(null)}>
                    <FeedDetailPanelContent feed={selectedFeed} />
                </DetailPanel>
            )}
        </Card>
    );
};


// --- Main ThreatIntelligenceView Component ---
const ThreatIntelligenceView: React.FC = () => {
    const { refreshData } = useThreatIntelligence();

    return (
        <ThreatIntelligenceProvider>
            <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
                <SectionHeader
                    title="Threat Intelligence Matrix"
                    description="A proactive security command center that aggregates global threat intelligence and uses proprietary AI to predict and mitigate potential attacks."
                    icon={ShieldIcon}
                    onRefresh={refreshData}
                />

                <GlobalThreatSummaryWidget />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <Card title="Global Threat Forecasting" className="col-span-1">
                        <div className="flex items-center text-gray-400">
                            <CloudIcon className="h-6 w-6 mr-2 text-blue-400" />
                            <p>Our AI models predict emerging global cyber threats and their potential impact on the financial sector, allowing you to prepare defenses in advance.</p>
                        </div>
                    </Card>
                    <Card title="Automated Attack Surface Scans" className="col-span-1">
                        <div className="flex items-center text-gray-400">
                            <TargetIcon className="h-6 w-6 mr-2 text-red-400" />
                            <p>Continuously scan the platform for new vulnerabilities and misconfigurations using AI that thinks like an attacker.</p>
                        </div>
                    </Card>
                    <Card title="Generative Red-Team Simulations" className="col-span-1">
                        <div className="flex items-center text-gray-400">
                            <ZapIcon className="h-6 w-6 mr-2 text-yellow-400" />
                            <p>Use AI to generate and execute sophisticated, novel adversary attack simulations to continuously test and validate your defenses.</p>
                        </div>
                    </Card>
                    <Card title="Automated Incident Response" className="col-span-1">
                        <div className="flex items-center text-gray-400">
                            <ActivityIcon className="h-6 w-6 mr-2 text-green-400" />
                            <p>Automated playbooks triggered by high-severity threats for rapid, pre-approved incident containment and remediation.</p>
                        </div>
                    </Card>
                </div>

                <IoCThreatFeedWidget />
                <ThreatActorProfiling />
                <VulnerabilityManagement />
                <AttackSurfaceManagement />
                <RedTeamSimulationDashboard />
                <AITrainingAndPerformance />
                <ThreatReportsAndAnalysis />
                <SecurityPolicyDashboard />
                <UserBehaviorAnalytics />
                <IncidentResponsePlaybooks />
                <ComplianceAndPrivacy />
                <EventLogMonitoring />
                <ThreatFeedConfiguration />

                {/* Additional Placeholder Sections (could be expanded further) */}
                <SectionHeader
                    title="Advanced Threat Hunting"
                    description="Leverage AI-driven queries and behavioral analytics to proactively search for stealthy threats."
                    icon={SearchIcon}
                    showRefresh={false}
                />
                <Card title="Threat Hunting Workbench">
                    <p className="text-gray-400">Integrate with SIEM/EDR, build complex queries, visualize threat paths, and automate hunting playbooks.</p>
                    <div className="flex justify-end mt-4">
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
                            <TerminalIcon className="h-5 w-5 mr-2" /> Launch Workbench
                        </button>
                    </div>
                </Card>

                <SectionHeader
                    title="Security Posture Management"
                    description="Gain continuous visibility into your security posture and identify areas for improvement."
                    icon={SlidersIcon}
                    showRefresh={false}
                />
                <Card title="Security Scorecard & Recommendations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Overall Posture Score</h4>
                            <div className="text-5xl font-bold text-green-400">85%</div>
                            <p className="text-gray-400">Based on vulnerabilities, misconfigurations, and compliance adherence.</p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-2">Top 3 Recommendations</h4>
                            <ul className="list-disc list-inside text-gray-400 space-y-2">
                                <li>Prioritize patching of 5 critical CVEs affecting production servers.</li>
                                <li>Review and enforce MFA policies for all administrative accounts.</li>
                                <li>Segment critical database networks from general access.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300">
                            <SettingsIcon className="h-5 w-5 mr-2" /> View Full Report
                        </button>
                    </div>
                </Card>

            </div>
        </ThreatIntelligenceProvider>
    );
};

export default ThreatIntelligenceView;