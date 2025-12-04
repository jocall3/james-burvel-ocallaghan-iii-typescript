import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

// Existing types
type CrisisType = 'DATA_BREACH' | 'PRODUCT_FAILURE' | 'EXECUTIVE_SCANDAL' | 'ENVIRONMENTAL_DISASTER' | 'FINANCIAL_MISCONDUCT' | 'SUPPLY_CHAIN_DISRUPTION' | 'CYBER_ATTACK' | 'PUBLIC_HEALTH_CRISIS';

export interface CommsPackage {
  pressRelease: string;
  internalMemo: string;
  twitterThread: string[];
  supportScript: string;
  faqDocument?: string;
  webStatement?: string;
  ceoStatement?: string;
  socialMediaGraphics?: string[]; // URLs or base64
  videoScript?: string;
}

// NEW TYPES AND INTERFACES (Thousands of lines)
export type UserRole = 'ADMIN' | 'CRISIS_MANAGER' | 'LEGAL_COUNSEL' | 'PR_SPECIALIST' | 'SUPPORT_MANAGER' | 'EXECUTIVE' | 'INCIDENT_RESPONDER' | 'ANALYST' | 'EDITOR' | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date;
  department: string;
  permissions: { [key: string]: boolean }; // e.g., { 'canApproveComms': true, 'canEditCrisis': false }
}

export interface Stakeholder {
  id: string;
  name: string;
  type: 'CUSTOMER' | 'EMPLOYEE' | 'INVESTOR' | 'MEDIA' | 'REGULATOR' | 'PARTNER' | 'PUBLIC' | 'GOVERNMENT';
  contactInfo: string; // email, phone, etc.
  keyMessage?: string; // specific message for this stakeholder group
  sentimentImpact: number; // -5 (very negative) to 5 (very positive)
  priority: number; // 1 (highest) to 5 (lowest)
  communicationChannels: string[]; // e.g., ['email', 'press-release', 'social-media']
}

export type CrisisSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CrisisStatus = 'IDENTIFIED' | 'ACTIVE' | 'MITIGATING' | 'REVIEW' | 'CLOSED';

export interface Crisis {
  id: string;
  title: string;
  type: CrisisType;
  description: string;
  severity: CrisisSeverity;
  status: CrisisStatus;
  identifiedAt: Date;
  lastUpdate: Date;
  estimatedResolutionTime?: Date;
  impactedAreas: string[]; // e.g., ['Customer Data', 'Product Performance', 'Brand Reputation']
  tags: string[]; // e.g., ['GDPR', 'Supply Chain', 'Financial']
  leadManagerId: string; // UserProfile ID
  assignedTeamIds: string[]; // UserProfile IDs
  generatedCommsPackages: CommsPackage[];
  relatedIncidents: IncidentLogEntry[];
  sentimentHistory: SentimentReport[];
  legalReviews: LegalAnalysisResult[];
  approvalWorkflow: CommsApprovalEntry[];
}

export interface IncidentLogEntry {
  id: string;
  timestamp: Date;
  description: string;
  reportedByUserId: string;
  severity: CrisisSeverity;
  actionTaken: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  relatedArtifacts?: string[]; // URLs to documents, screenshots
}

export type LegalRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LegalAnalysisResult {
  id: string;
  timestamp: Date;
  analyzedByUserId: string;
  summary: string;
  keyRisks: string[];
  recommendedActions: string[];
  complianceRequirements: string[]; // e.g., ['GDPR Article 33', 'CCPA Section 1798.82']
  potentialFinesMin?: number;
  potentialFinesMax?: number;
  legalRiskLevel: LegalRiskLevel;
  sensitiveDataInvolved: boolean;
}

export interface SentimentDataPoint {
  timestamp: Date;
  score: number; // -1 (negative) to 1 (positive)
  source: string; // e.g., 'Twitter', 'News', 'Internal Forums'
  keywords: string[];
  volume: number; // number of mentions
}

export interface SentimentReport {
  id: string;
  timestamp: Date;
  generatedByUserId: string;
  overallSentiment: number; // aggregated score
  sentimentTrend: SentimentDataPoint[];
  keyThemes: string[];
  topNegativeMentions: string[];
  topPositiveMentions: string[];
  recommendedPRActions: string[];
  sourceBreakdown: { source: string; percentage: number; }[];
}

export type CommsStatus = 'DRAFT' | 'PENDING_REVIEW' | 'IN_REVIEW' | 'REJECTED' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';

export interface CommsApprovalEntry {
  id: string;
  commsPackageId: string;
  version: number;
  status: CommsStatus;
  reviewerId: string; // UserProfile ID
  reviewTimestamp?: Date;
  comments?: string;
  requiredRole: UserRole;
}

export interface CrisisPlaybookEntry {
  id: string;
  crisisType: CrisisType;
  step: number;
  title: string;
  description: string;
  responsibleRoles: UserRole[];
  estimatedDurationMinutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  completionDate?: Date;
  notes?: string;
}

export interface CrisisSettings {
  autoGenerateComms: boolean;
  defaultApprovalWorkflow: UserRole[];
  notificationChannels: string[]; // e.g., ['email', 'slack', 'sms']
  sentimentMonitorIntervalMinutes: number;
  defaultTemplates: {
    [key in CrisisType]?: CommsPackage;
  };
}

// MOCK DATA GENERATORS (filling thousands of lines with helper functions)

const generateMockId = (prefix: string = 'mock_'): string => `${prefix}${Math.random().toString(36).substring(2, 15)}`;

export const mockUsers: UserProfile[] = [
  { id: 'user_admin', name: 'Alice Admin', email: 'alice@example.com', role: 'ADMIN', isActive: true, lastLogin: new Date(), department: 'IT', permissions: { canManageUsers: true, canEditAll: true, canApproveComms: true } },
  { id: 'user_cm', name: 'Bob CrisisManager', email: 'bob@example.com', role: 'CRISIS_MANAGER', isActive: true, lastLogin: new Date(), department: 'Operations', permissions: { canEditCrisis: true, canGenerateComms: true, canInitiateReview: true } },
  { id: 'user_legal', name: 'Carol Legal', email: 'carol@example.com', role: 'LEGAL_COUNSEL', isActive: true, lastLogin: new Date(), department: 'Legal', permissions: { canReviewLegal: true, canApproveComms: true } },
  { id: 'user_pr', name: 'David PR', email: 'david@example.com', role: 'PR_SPECIALIST', isActive: true, lastLogin: new Date(), department: 'Marketing', permissions: { canReviewComms: true, canEditComms: true } },
  { id: 'user_exec', name: 'Eve Executive', email: 'eve@example.com', role: 'EXECUTIVE', isActive: true, lastLogin: new Date(), department: 'Executive', permissions: { canApproveComms: true, canViewAll: true } },
  { id: 'user_ir', name: 'Frank IR', email: 'frank@example.com', role: 'INCIDENT_RESPONDER', isActive: true, lastLogin: new Date(), department: 'IT Security', permissions: { canAddIncidentLogs: true } },
  { id: 'user_analyst', name: 'Grace Analyst', email: 'grace@example.com', role: 'ANALYST', isActive: true, lastLogin: new Date(), department: 'Data', permissions: { canViewReports: true } },
  { id: 'user_editor', name: 'Henry Editor', email: 'henry@example.com', role: 'EDITOR', isActive: true, lastLogin: new Date(), department: 'Communications', permissions: { canEditComms: true, canGenerateComms: true } },
  { id: 'user_viewer', name: 'Ivy Viewer', email: 'ivy@example.com', role: 'VIEWER', isActive: true, lastLogin: new Date(), department: 'General', permissions: { canViewAll: true, canEditCrisis: false } },
];

export const getMockUser = (id: string): UserProfile | undefined => mockUsers.find(u => u.id === id);

export const mockStakeholders: Stakeholder[] = [
  { id: generateMockId('sh'), name: 'Key Customers', type: 'CUSTOMER', contactInfo: 'customer.support@example.com', sentimentImpact: -4, priority: 1, communicationChannels: ['email', 'web-statement'] },
  { id: generateMockId('sh'), name: 'All Employees', type: 'EMPLOYEE', contactInfo: 'internal@example.com', sentimentImpact: -3, priority: 1, communicationChannels: ['internal-memo', 'slack'] },
  { id: generateMockId('sh'), name: 'Shareholders', type: 'INVESTOR', contactInfo: 'ir@example.com', sentimentImpact: -5, priority: 1, communicationChannels: ['investor-relations-update'] },
  { id: generateMockId('sh'), name: 'Tech Press', type: 'MEDIA', contactInfo: 'tech@press.com', sentimentImpact: -4, priority: 2, communicationChannels: ['press-release', 'media-briefing'] },
  { id: generateMockId('sh'), name: 'GDPR Authority', type: 'REGULATOR', contactInfo: 'gdpr@gov.eu', sentimentImpact: -5, priority: 1, communicationChannels: ['regulatory-filing'] },
];

export const generateMockIncidentLogEntry = (crisisId: string, reporterId: string): IncidentLogEntry => ({
  id: generateMockId('inc'),
  timestamp: new Date(Date.now() - Math.random() * 86400000 * 7), // within last 7 days
  description: `Automated alert: Unusual activity detected on server ${Math.floor(Math.random() * 100)}.`,
  reportedByUserId: reporterId,
  severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as CrisisSeverity,
  actionTaken: `Alert acknowledged by Frank IR. Initial investigation started. System isolated.`,
  status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'][Math.floor(Math.random() * 3)] as any,
  relatedArtifacts: Math.random() > 0.5 ? [`https://example.com/log_${generateMockId()}.txt`] : undefined,
});

export const generateMockLegalAnalysis = (crisisId: string, analystId: string): LegalAnalysisResult => ({
  id: generateMockId('legal'),
  timestamp: new Date(),
  analyzedByUserId: analystId,
  summary: 'Preliminary legal assessment indicates potential for regulatory fines and reputational damage.',
  keyRisks: ['Data privacy violations', 'Breach of contract', 'Shareholder lawsuits', 'Regulatory non-compliance'],
  recommendedActions: ['Engage external counsel', 'Notify affected parties within 72 hours', 'Preserve all relevant data'],
  complianceRequirements: ['GDPR Article 33', 'CCPA Section 1798.82'],
  potentialFinesMin: Math.floor(Math.random() * 100000) * 100,
  potentialFinesMax: Math.floor(Math.random() * 5000000) * 100,
  legalRiskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as LegalRiskLevel,
  sensitiveDataInvolved: Math.random() > 0.3,
});

export const generateMockSentimentReport = (crisisId: string, generatorId: string): SentimentReport => {
  const now = new Date();
  const dataPoints: SentimentDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    dataPoints.push({
      timestamp: new Date(now.getTime() - i * 3600 * 1000),
      score: Math.random() * 2 - 1, // -1 to 1
      source: ['Twitter', 'News', 'Forums'][Math.floor(Math.random() * 3)],
      keywords: ['data breach', 'company X', 'security', 'hack'][Math.floor(Math.random() * 4)].split(' '),
      volume: Math.floor(Math.random() * 1000),
    });
  }

  const overallSentiment = dataPoints.reduce((sum, dp) => sum + dp.score, 0) / dataPoints.length;

  return {
    id: generateMockId('sent'),
    timestamp: now,
    generatedByUserId: generatorId,
    overallSentiment,
    sentimentTrend: dataPoints.reverse(),
    keyThemes: ['data security', 'customer trust', 'system vulnerability'],
    topNegativeMentions: ['"Unacceptable data breach!"', '"Losing trust in company X."', '"Why no immediate response?"'],
    topPositiveMentions: ['"Appreciate the transparency."', '"Hope they fix it soon."', '"Good to see a quick update."'],
    recommendedPRActions: ['Issue detailed FAQ', 'Monitor social media for keywords', 'Engage influencers for positive messaging'],
    sourceBreakdown: [
      { source: 'Twitter', percentage: Math.random() * 40 + 20 }, // 20-60%
      { source: 'News', percentage: Math.random() * 20 + 10 },    // 10-30%
      { source: 'Forums', percentage: Math.random() * 10 + 5 },   // 5-15%
    ].map(s => ({ ...s, percentage: parseFloat(s.percentage.toFixed(2)) })),
  };
};

export const generateMockCommsPackage = (type: CrisisType, facts: string): CommsPackage => {
  const comms: CommsPackage = {
    pressRelease: `FOR IMMEDIATE RELEASE: [Company] Addresses ${type.replace(/_/g, ' ')} Incident... based on: ${facts}`,
    internalMemo: `Team, This morning we identified a ${type.replace(/_/g, ' ')} incident. Here is what you need to know and our immediate next steps... based on: ${facts}`,
    twitterThread: [
      `1/ We recently identified a ${type.replace(/_/g, ' ')} incident. We are taking immediate action to address it.`,
      `2/ Our investigation is ongoing, and we will provide updates as they become available.`,
      `3/ Customer trust is our top priority. We are working tirelessly to secure our systems.`,
    ],
    supportScript: `Thank you for calling. I understand you have questions about the recent ${type.replace(/_/g, ' ')} notification. I can confirm we are investigating and will provide information directly to affected customers... based on: ${facts}`,
    faqDocument: `FAQ for ${type.replace(/_/g, ' ')}:\nQ: What happened?\nA: ...`,
    webStatement: `Official Website Statement: We deeply regret to inform you...`,
    ceoStatement: `A personal message from our CEO regarding the ${type.replace(/_/g, ' ')}: ...`,
  };
  if (Math.random() > 0.7) {
    comms.socialMediaGraphics = [`https://example.com/graphic_${generateMockId()}.png`, `https://example.com/graphic_${generateMockId()}.jpg`];
  }
  if (Math.random() > 0.8) {
    comms.videoScript = `(CEO on screen, somber tone) Hello, I'm [CEO Name]...`;
  }
  return comms;
};

export const generateMockCrisis = (id: string, type: CrisisType, facts: string, leadManagerId: string): Crisis => {
  const now = new Date();
  const incidentLogs = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => generateMockIncidentLogEntry(id, mockUsers[0].id));
  const sentimentHistory = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => generateMockSentimentReport(id, mockUsers[6].id));
  const legalReviews = Math.random() > 0.5 ? [generateMockLegalAnalysis(id, mockUsers[2].id)] : [];
  const commsPackage = generateMockCommsPackage(type, facts);
  const approvalWorkflow: CommsApprovalEntry[] = [
    { id: generateMockId('appr'), commsPackageId: generateMockId('comm'), version: 1, status: 'DRAFT', requiredRole: 'CRISIS_MANAGER', reviewerId: '' },
    { id: generateMockId('appr'), commsPackageId: generateMockId('comm'), version: 1, status: 'PENDING_REVIEW', requiredRole: 'PR_SPECIALIST', reviewerId: mockUsers[3].id, reviewTimestamp: new Date(), comments: 'Looks good for initial draft.' },
    { id: generateMockId('appr'), commsPackageId: generateMockId('comm'), version: 1, status: 'PENDING_REVIEW', requiredRole: 'LEGAL_COUNSEL', reviewerId: mockUsers[2].id },
    { id: generateMockId('appr'), commsPackageId: generateMockId('comm'), version: 1, status: 'PENDING_REVIEW', requiredRole: 'EXECUTIVE', reviewerId: mockUsers[4].id },
  ];

  return {
    id,
    title: `Crisis: ${type.replace(/_/g, ' ')}`,
    type,
    description: `Initial facts: ${facts}. A major incident has occurred impacting company operations.`,
    severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as CrisisSeverity,
    status: 'ACTIVE',
    identifiedAt: now,
    lastUpdate: now,
    impactedAreas: ['Customer Trust', 'Brand Reputation', 'Operations'],
    tags: ['Urgent', 'Public Facing'],
    leadManagerId,
    assignedTeamIds: ['user_cm', 'user_legal', 'user_pr', 'user_ir'],
    generatedCommsPackages: [commsPackage],
    relatedIncidents: incidentLogs,
    sentimentHistory,
    legalReviews,
    approvalWorkflow,
  };
};

export const mockCrisisSettings: CrisisSettings = {
  autoGenerateComms: true,
  defaultApprovalWorkflow: ['CRISIS_MANAGER', 'PR_SPECIALIST', 'LEGAL_COUNSEL', 'EXECUTIVE'],
  notificationChannels: ['email', 'slack'],
  sentimentMonitorIntervalMinutes: 30,
  defaultTemplates: {
    DATA_BREACH: {
      pressRelease: "DEFAULT DATA BREACH PRESS RELEASE: [Company] acknowledges a security incident affecting [Number] customers...",
      internalMemo: "DEFAULT DATA BREACH INTERNAL MEMO: Team, we're facing a data breach...",
      twitterThread: ["1/ Data breach detected.", "2/ Investigating."],
      supportScript: "DEFAULT DATA BREACH SUPPORT SCRIPT: I understand your concern about the data breach...",
    }
  }
};

// UI UTILITY COMPONENTS (many more lines)
export const CrisisStatusBadge: React.FC<{ status: CrisisStatus }> = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'IDENTIFIED': colorClass = 'bg-blue-600'; break;
    case 'ACTIVE': colorClass = 'bg-red-600 animate-pulse'; break;
    case 'MITIGATING': colorClass = 'bg-yellow-600'; break;
    case 'REVIEW': colorClass = 'bg-purple-600'; break;
    case 'CLOSED': colorClass = 'bg-green-600'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{status.replace(/_/g, ' ')}</span>;
};

export const CrisisSeverityBadge: React.FC<{ severity: CrisisSeverity }> = ({ severity }) => {
  let colorClass = '';
  switch (severity) {
    case 'LOW': colorClass = 'bg-green-500'; break;
    case 'MEDIUM': colorClass = 'bg-yellow-500'; break;
    case 'HIGH': colorClass = 'bg-orange-500'; break;
    case 'CRITICAL': colorClass = 'bg-red-700'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{severity}</span>;
};

export const UserAvatar: React.FC<{ user: UserProfile, size?: number }> = ({ user, size = 32 }) => {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const bgColor = useMemo(() => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const hash = Array.from(user.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, [user.id]);

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold ${bgColor}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
      title={user.name}
    >
      {initials}
    </div>
  );
};

export const CommsStatusBadge: React.FC<{ status: CommsStatus }> = ({ status }) => {
  let colorClass = '';
  switch (status) {
    case 'DRAFT': colorClass = 'bg-gray-500'; break;
    case 'PENDING_REVIEW': colorClass = 'bg-blue-500'; break;
    case 'IN_REVIEW': colorClass = 'bg-yellow-500'; break;
    case 'REJECTED': colorClass = 'bg-red-600'; break;
    case 'APPROVED': colorClass = 'bg-green-600'; break;
    case 'PUBLISHED': colorClass = 'bg-purple-600'; break;
    case 'ARCHIVED': colorClass = 'bg-gray-700'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{status.replace(/_/g, ' ')}</span>;
};

export const LegalRiskBadge: React.FC<{ risk: LegalRiskLevel }> = ({ risk }) => {
  let colorClass = '';
  switch (risk) {
    case 'LOW': colorClass = 'bg-green-500'; break;
    case 'MEDIUM': colorClass = 'bg-yellow-500'; break;
    case 'HIGH': colorClass = 'bg-orange-500'; break;
    case 'CRITICAL': colorClass = 'bg-red-700'; break;
    default: colorClass = 'bg-gray-500';
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} text-white`}>{risk}</span>;
};

// CHART COMPONENT (Simplified Mock for illustration, thousands of lines in real world)
interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export const AnalyticsChart: React.FC<{
  title: string;
  data: ChartDataPoint[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
}> = ({ title, data, type = 'bar', height = 200 }) => {
  const maxVal = Math.max(...data.map(d => Math.abs(d.value)));
  const minVal = Math.min(...data.map(d => d.value));

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md mb-4">
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <div className="flex items-end justify-around" style={{ height: height }}>
        {data.map((point, index) => (
          <div key={index} className="flex flex-col items-center mx-1">
            <div
              className={`w-8 rounded-t-sm ${point.color || (point.value >= 0 ? 'bg-cyan-500' : 'bg-red-500')}`}
              style={{ height: `${Math.max(0, point.value / maxVal * 80)}%` }} // Scale to 80% of height for bar
            ></div>
            <span className="text-xs mt-1 text-gray-300">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// CONTEXT FOR GLOBAL STATE (simulating a Redux-like store within one file)
interface CrisisContextType {
  currentCrisis: Crisis | null;
  setCurrentCrisis: React.Dispatch<React.SetStateAction<Crisis | null>>;
  allCrises: Crisis[];
  setAllCrises: React.Dispatch<React.SetStateAction<Crisis[]>>;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: CrisisSettings;
  updateSetting: (key: keyof CrisisSettings, value: any) => void;
  // Add many more shared state and actions
  addIncidentLogEntry: (entry: IncidentLogEntry) => Promise<void>;
  updateCrisisStatus: (crisisId: string, newStatus: CrisisStatus) => Promise<void>;
  addCommsPackageToCrisis: (crisisId: string, comms: CommsPackage) => Promise<void>;
  addLegalReviewToCrisis: (crisisId: string, review: LegalAnalysisResult) => Promise<void>;
  addSentimentReportToCrisis: (crisisId: string, report: SentimentReport) => Promise<void>;
  updateCommsApprovalStatus: (crisisId: string, commsPackageId: string, approvalEntryId: string, status: CommsStatus, reviewerId: string, comments?: string) => Promise<void>;
}

export const CrisisContext = createContext<CrisisContextType | undefined>(undefined);

export const CrisisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCrisis, setCurrentCrisis] = useState<Crisis | null>(null);
  const [allCrises, setAllCrises] = useState<Crisis[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUsers[0]); // Default to Admin
  const [settings, setSettings] = useState<CrisisSettings>(mockCrisisSettings);

  // Simulate loading crises from an API on mount
  useEffect(() => {
    // In a real app, this would be an API call
    const loadCrises = async () => {
      await new Promise(res => setTimeout(res, 500)); // Simulate API latency
      const loadedCrises = [
        generateMockCrisis('crisis_001', 'DATA_BREACH', '50k user emails exposed, no passwords. Discovered 8am today.', mockUsers[1].id),
        generateMockCrisis('crisis_002', 'PRODUCT_FAILURE', 'Major software bug impacting 10% of users, critical functionality affected.', mockUsers[1].id),
        generateMockCrisis('crisis_003', 'EXECUTIVE_SCANDAL', 'CEO alleged of insider trading. Media reports surfacing.', mockUsers[1].id),
      ];
      setAllCrises(loadedCrises);
      setCurrentCrisis(loadedCrises[0]); // Load first crisis by default
    };
    loadCrises();
  }, []);

  const updateSetting = useCallback((key: keyof CrisisSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, persist this to backend
    console.log(`Setting ${key} updated to ${value}`);
  }, []);

  const addIncidentLogEntry = useCallback(async (entry: IncidentLogEntry) => {
    return new Promise<void>(res => setTimeout(() => {
      setCurrentCrisis(prev => {
        if (!prev) return null;
        return {
          ...prev,
          relatedIncidents: [...prev.relatedIncidents, { ...entry, id: generateMockId('inc') }],
          lastUpdate: new Date(),
        };
      });
      console.log('Incident log added:', entry);
      res();
    }, 500));
  }, []);

  const updateCrisisStatus = useCallback(async (crisisId: string, newStatus: CrisisStatus) => {
    return new Promise<void>(res => setTimeout(() => {
      setAllCrises(prev => prev.map(c => c.id === crisisId ? { ...c, status: newStatus, lastUpdate: new Date() } : c));
      setCurrentCrisis(prev => prev?.id === crisisId ? { ...prev, status: newStatus, lastUpdate: new Date() } : prev);
      console.log(`Crisis ${crisisId} status updated to ${newStatus}`);
      res();
    }, 500));
  }, []);

  const addCommsPackageToCrisis = useCallback(async (crisisId: string, comms: CommsPackage) => {
    return new Promise<void>(res => setTimeout(() => {
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        const newCommsPackage = { ...comms, id: generateMockId('comms-pkg') };
        return {
          ...prev,
          generatedCommsPackages: [...prev.generatedCommsPackages, newCommsPackage],
          approvalWorkflow: [
            ...prev.approvalWorkflow,
            { id: generateMockId('appr'), commsPackageId: newCommsPackage.id!, version: (prev.generatedCommsPackages.length + 1), status: 'DRAFT', requiredRole: 'CRISIS_MANAGER', reviewerId: currentUser.id }
          ],
          lastUpdate: new Date(),
        };
      });
      console.log(`Comms package added to crisis ${crisisId}`);
      res();
    }, 500));
  }, [currentUser.id]);

  const addLegalReviewToCrisis = useCallback(async (crisisId: string, review: LegalAnalysisResult) => {
    return new Promise<void>(res => setTimeout(() => {
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        return {
          ...prev,
          legalReviews: [...prev.legalReviews, { ...review, id: generateMockId('legal') }],
          lastUpdate: new Date(),
        };
      });
      console.log(`Legal review added to crisis ${crisisId}`);
      res();
    }, 500));
  }, []);

  const addSentimentReportToCrisis = useCallback(async (crisisId: string, report: SentimentReport) => {
    return new Promise<void>(res => setTimeout(() => {
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;
        return {
          ...prev,
          sentimentHistory: [...prev.sentimentHistory, { ...report, id: generateMockId('sent') }],
          lastUpdate: new Date(),
        };
      });
      console.log(`Sentiment report added to crisis ${crisisId}`);
      res();
    }, 500));
  }, []);

  const updateCommsApprovalStatus = useCallback(async (crisisId: string, commsPackageId: string, approvalEntryId: string, status: CommsStatus, reviewerId: string, comments?: string) => {
    return new Promise<void>(res => setTimeout(() => {
      setCurrentCrisis(prev => {
        if (!prev || prev.id !== crisisId) return prev;

        const updatedWorkflow = prev.approvalWorkflow.map(entry => {
          if (entry.id === approvalEntryId) {
            return {
              ...entry,
              status,
              reviewerId,
              reviewTimestamp: new Date(),
              comments: comments || entry.comments,
            };
          }
          return entry;
        });

        // If approved, find the next approval step and set it to PENDING_REVIEW
        if (status === 'APPROVED') {
          const currentEntryIndex = updatedWorkflow.findIndex(entry => entry.id === approvalEntryId);
          if (currentEntryIndex !== -1) {
            // Find the next role in the default approval workflow
            const currentRequiredRoleIndex = settings.defaultApprovalWorkflow.indexOf(updatedWorkflow[currentEntryIndex].requiredRole);
            if (currentRequiredRoleIndex !== -1 && currentRequiredRoleIndex < settings.defaultApprovalWorkflow.length - 1) {
              const nextRequiredRole = settings.defaultApprovalWorkflow[currentRequiredRoleIndex + 1];
              const nextEntry = updatedWorkflow.find(entry => entry.commsPackageId === commsPackageId && entry.requiredRole === nextRequiredRole && entry.status === 'DRAFT');
              if (nextEntry) {
                nextEntry.status = 'PENDING_REVIEW';
              } else {
                // If no existing DRAFT entry, create a new one
                updatedWorkflow.push({
                  id: generateMockId('appr'),
                  commsPackageId,
                  version: updatedWorkflow[currentEntryIndex].version, // Use same version
                  status: 'PENDING_REVIEW',
                  requiredRole: nextRequiredRole,
                  reviewerId: '', // Awaiting next reviewer
                });
              }
            } else if (currentRequiredRoleIndex === settings.defaultApprovalWorkflow.length - 1) {
              // All approvals complete, mark comms package as ready for publishing
              // A real system would update the actual commsPackage status here
              console.log(`Comms package ${commsPackageId} for crisis ${crisisId} fully APPROVED.`);
            }
          }
        }

        return {
          ...prev,
          approvalWorkflow: updatedWorkflow,
          lastUpdate: new Date(),
        };
      });
      console.log(`Comms approval entry ${approvalEntryId} status updated to ${status}`);
      res();
    }, 500));
  }, [settings.defaultApprovalWorkflow]);

  const value = useMemo(() => ({
    currentCrisis,
    setCurrentCrisis,
    allCrises,
    setAllCrises,
    currentUser,
    setCurrentUser,
    settings,
    updateSetting,
    addIncidentLogEntry,
    updateCrisisStatus,
    addCommsPackageToCrisis,
    addLegalReviewToCrisis,
    addSentimentReportToCrisis,
    updateCommsApprovalStatus,
  }), [
    currentCrisis, allCrises, currentUser, settings, updateSetting, addIncidentLogEntry,
    updateCrisisStatus, addCommsPackageToCrisis, addLegalReviewToCrisis, addSentimentReportToCrisis,
    updateCommsApprovalStatus
  ]);

  return <CrisisContext.Provider value={value}>{children}</CrisisContext.Provider>;
};

export const useCrisisContext = () => {
  const context = useContext(CrisisContext);
  if (context === undefined) {
    throw new Error('useCrisisContext must be used within a CrisisProvider');
  }
  return context;
};

// CHILD COMPONENTS (many hundreds of lines each)

export const CrisisOverviewDashboard: React.FC = () => {
  const { currentCrisis, allCrises, currentUser, updateCrisisStatus } = useCrisisContext();
  const [filterStatus, setFilterStatus] = useState<CrisisStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCrises = useMemo(() => {
    let crises = allCrises;
    if (filterStatus !== 'ALL') {
      crises = crises.filter(c => c.status === filterStatus);
    }
    if (searchTerm) {
      crises = crises.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return crises;
  }, [allCrises, filterStatus, searchTerm]);

  const stats = useMemo(() => {
    const active = allCrises.filter(c => c.status === 'ACTIVE').length;
    const critical = allCrises.filter(c => c.severity === 'CRITICAL' && c.status !== 'CLOSED').length;
    const closed = allCrises.filter(c => c.status === 'CLOSED').length;
    const total = allCrises.length;
    return { active, critical, closed, total };
  }, [allCrises]);

  if (!currentUser) return <p>Please log in.</p>;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-3xl font-bold mb-4 flex items-center">
        Crisis Management Dashboard
        {currentCrisis && (
          <span className="ml-4 text-xl text-gray-400">
            - Current: {currentCrisis.title}
            <CrisisSeverityBadge severity={currentCrisis.severity} />
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Total Crises</p>
          <p className="text-4xl font-bold text-cyan-400">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Active Crises</p>
          <p className="text-4xl font-bold text-red-400">{stats.active}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Critical Alerts</p>
          <p className="text-4xl font-bold text-orange-400">{stats.critical}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <p className="text-gray-300">Closed Crises</p>
          <p className="text-4xl font-bold text-green-400">{stats.closed}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search crises..."
          className="p-2 bg-gray-600 rounded flex-grow"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as CrisisStatus | 'ALL')}
          className="p-2 bg-gray-600 rounded"
        >
          <option value="ALL">All Statuses</option>
          {Object.values(CrisisStatus).map(status => (
            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Crisis
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Update</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lead</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredCrises.map(crisis => (
              <tr key={crisis.id} className={currentCrisis?.id === crisis.id ? 'bg-gray-800' : ''}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{crisis.title}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{crisis.type.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <CrisisSeverityBadge severity={crisis.severity} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <CrisisStatusBadge status={crisis.status} />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{crisis.lastUpdate.toLocaleString()}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {getMockUser(crisis.leadManagerId) ? <UserAvatar user={getMockUser(crisis.leadManagerId)!} size={24} /> : 'N/A'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => { useCrisisContext().setCurrentCrisis(crisis); }}
                    className="text-cyan-500 hover:text-cyan-700 mr-2"
                  >
                    View
                  </button>
                  {(currentUser.role === 'ADMIN' || currentUser.role === 'CRISIS_MANAGER') && crisis.status !== 'CLOSED' && (
                    <button
                      onClick={() => updateCrisisStatus(crisis.id, 'CLOSED')}
                      className="text-green-500 hover:text-green-700"
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Recent Incident Alerts</h3>
        <ul className="space-y-3">
          {currentCrisis?.relatedIncidents.slice(0, 5).map(incident => (
            <li key={incident.id} className="bg-gray-800 p-3 rounded-lg flex items-center space-x-3">
              <span className="text-sm font-semibold text-red-400">[NEW ALERT]</span>
              <span className="text-gray-300 text-sm">{incident.timestamp.toLocaleString()}</span>
              <p className="text-white flex-grow">{incident.description}</p>
              <CrisisSeverityBadge severity={incident.severity} />
            </li>
          ))}
          {!currentCrisis?.relatedIncidents.length && <p className="text-gray-400">No recent incidents for this crisis.</p>}
        </ul>
      </div>
    </div>
  );
};

export const IncidentLogManager: React.FC = () => {
  const { currentCrisis, addIncidentLogEntry, currentUser } = useCrisisContext();
  const [newLogDescription, setNewLogDescription] = useState('');
  const [newLogSeverity, setNewLogSeverity] = useState<CrisisSeverity>('MEDIUM');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddLog = async () => {
    if (!currentCrisis || !newLogDescription) return;
    setIsAdding(true);
    const newEntry: IncidentLogEntry = {
      id: generateMockId('inc'), // Temp ID, will be replaced by backend
      timestamp: new Date(),
      description: newLogDescription,
      reportedByUserId: currentUser.id,
      severity: newLogSeverity,
      actionTaken: 'No immediate action logged.',
      status: 'OPEN',
    };
    await addIncidentLogEntry(newEntry);
    setNewLogDescription('');
    setIsAdding(false);
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to manage incidents.</p>;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Incident Log for {currentCrisis.title}</h2>

      {(currentUser.role === 'ADMIN' || currentUser.role === 'CRISIS_MANAGER' || currentUser.role === 'INCIDENT_RESPONDER') && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Add New Incident Log Entry</h3>
          <textarea
            value={newLogDescription}
            onChange={e => setNewLogDescription(e.target.value)}
            placeholder="Describe the incident (e.g., 'Server outage in EU-central region')."
            rows={3}
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white resize-y"
          />
          <div className="flex items-center space-x-3 mb-3">
            <label htmlFor="log-severity" className="text-gray-300">Severity:</label>
            <select
              id="log-severity"
              value={newLogSeverity}
              onChange={e => setNewLogSeverity(e.target.value as CrisisSeverity)}
              className="p-2 bg-gray-600 rounded"
            >
              {Object.values(CrisisSeverity).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleAddLog}
              disabled={isAdding || !newLogDescription}
              className="ml-auto p-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Log Entry'}
            </button>
          </div>
        </div>
      )}

      {currentCrisis.relatedIncidents.length === 0 ? (
        <p className="text-gray-400">No incident logs recorded for this crisis yet.</p>
      ) : (
        <div className="space-y-4">
          {currentCrisis.relatedIncidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(log => (
            <div key={log.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{log.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <CrisisSeverityBadge severity={log.severity} />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    log.status === 'OPEN' ? 'bg-red-500' : log.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>{log.status.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <p className="text-white text-md mb-2">{log.description}</p>
              <p className="text-gray-400 text-sm">Action Taken: {log.actionTaken}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                Reported by: {getMockUser(log.reportedByUserId)?.name || 'Unknown'}
                {log.relatedArtifacts && log.relatedArtifacts.length > 0 && (
                  <span className="ml-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {log.relatedArtifacts.length} Artifacts
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const StakeholderCommunicationManager: React.FC = () => {
  const { currentCrisis } = useCrisisContext();
  const [filterType, setFilterType] = useState<'ALL' | Stakeholder['type']>('ALL');

  const filteredStakeholders = useMemo(() => {
    if (filterType === 'ALL') {
      return mockStakeholders; // For simplicity, using mockStakeholders
    }
    return mockStakeholders.filter(s => s.type === filterType);
  }, [filterType]);

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to manage stakeholder communications.</p>;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Stakeholder Communication for {currentCrisis.title}</h2>

      <div className="mb-4 flex items-center space-x-3">
        <label htmlFor="stakeholder-type" className="text-gray-300">Filter by Type:</label>
        <select
          id="stakeholder-type"
          value={filterType}
          onChange={e => setFilterType(e.target.value as 'ALL' | Stakeholder['type'])}
          className="p-2 bg-gray-600 rounded"
        >
          <option value="ALL">All Types</option>
          {Object.values(mockStakeholders.reduce((acc, s) => ({ ...acc, [s.type]: s.type }), {} as { [key: string]: Stakeholder['type'] })).map(type => (
            <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className="ml-auto p-2 bg-cyan-600 hover:bg-cyan-700 rounded">Add New Stakeholder</button>
      </div>

      <div className="space-y-4">
        {filteredStakeholders.map(stakeholder => (
          <div key={stakeholder.id} className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-white">{stakeholder.name} ({stakeholder.type.replace(/_/g, ' ')})</h3>
              <p className="text-gray-300">Contact: {stakeholder.contactInfo}</p>
              {stakeholder.keyMessage && <p className="text-gray-400 mt-2 italic">"{stakeholder.keyMessage}"</p>}
              <div className="mt-2 text-sm text-gray-500">
                Channels: {stakeholder.communicationChannels.join(', ')}
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${stakeholder.sentimentImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                Sentiment Impact: {stakeholder.sentimentImpact > 0 ? '+' : ''}{stakeholder.sentimentImpact}
              </p>
              <p className="text-gray-400">Priority: {stakeholder.priority}</p>
              <button className="mt-2 text-sm text-cyan-500 hover:text-cyan-700">Customize Comms</button>
            </div>
          </div>
        ))}
        {filteredStakeholders.length === 0 && <p className="text-gray-400">No stakeholders found for selected filter.</p>}
      </div>
    </div>
  );
};

export const LegalReviewDashboard: React.FC = () => {
  const { currentCrisis, addLegalReviewToCrisis, currentUser } = useCrisisContext();
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newReviewSummary, setNewReviewSummary] = useState('');
  const [newReviewRisks, setNewReviewRisks] = useState(''); // Comma separated

  const handleAddReview = async () => {
    if (!currentCrisis || !newReviewSummary) return;
    setIsAddingReview(true);
    const mockReview = generateMockLegalAnalysis(currentCrisis.id, currentUser.id);
    const newReview: LegalAnalysisResult = {
      ...mockReview,
      summary: newReviewSummary,
      keyRisks: newReviewRisks.split(',').map(s => s.trim()).filter(Boolean),
      analyzedByUserId: currentUser.id,
    };
    await addLegalReviewToCrisis(newReview);
    setNewReviewSummary('');
    setNewReviewRisks('');
    setIsAddingReview(false);
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view legal reviews.</p>;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Legal Review for {currentCrisis.title}</h2>

      {(currentUser.role === 'ADMIN' || currentUser.role === 'LEGAL_COUNSEL') && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Add New Legal Analysis</h3>
          <textarea
            value={newReviewSummary}
            onChange={e => setNewReviewSummary(e.target.value)}
            placeholder="Summarize the legal analysis..."
            rows={3}
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white resize-y"
          />
          <input
            type="text"
            value={newReviewRisks}
            onChange={e => setNewReviewRisks(e.target.value)}
            placeholder="Key risks (comma-separated, e.g., 'GDPR fines, reputational damage')"
            className="w-full p-2 mb-3 bg-gray-600 rounded text-white"
          />
          <button
            onClick={handleAddReview}
            disabled={isAddingReview || !newReviewSummary}
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
          >
            {isAddingReview ? 'Adding...' : 'Add Legal Review'}
          </button>
        </div>
      )}

      {currentCrisis.legalReviews.length === 0 ? (
        <p className="text-gray-400">No legal reviews available for this crisis yet.</p>
      ) : (
        <div className="space-y-4">
          {currentCrisis.legalReviews.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map(review => (
            <div key={review.id} className="bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">{review.timestamp.toLocaleString()}</span>
                <div className="flex items-center space-x-2">
                  <LegalRiskBadge risk={review.legalRiskLevel} />
                  {review.sensitiveDataInvolved && (
                    <span className="text-red-400 text-xs font-semibold">Sensitive Data Involved</span>
                  )}
                </div>
              </div>
              <p className="text-white text-md font-semibold mb-1">{review.summary}</p>
              {review.keyRisks.length > 0 && (
                <p className="text-gray-400 text-sm mb-1">
                  <span className="font-semibold">Key Risks:</span> {review.keyRisks.join(', ')}
                </p>
              )}
              {review.recommendedActions.length > 0 && (
                <p className="text-gray-400 text-sm mb-1">
                  <span className="font-semibold">Recommended Actions:</span> {review.recommendedActions.join(', ')}
                </p>
              )}
              {review.complianceRequirements.length > 0 && (
                <p className="text-gray-400 text-sm mb-1">
                  <span className="font-semibold">Compliance:</span> {review.complianceRequirements.join(', ')}
                </p>
              )}
              {review.potentialFinesMin && review.potentialFinesMax && (
                <p className="text-gray-400 text-sm">
                  <span className="font-semibold">Potential Fines:</span> ${review.potentialFinesMin.toLocaleString()} - ${review.potentialFinesMax.toLocaleString()}
                </p>
              )}
              <div className="flex items-center mt-2 text-xs text-gray-500">
                Analyzed by: {getMockUser(review.analyzedByUserId)?.name || 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SentimentMonitoringDashboard: React.FC = () => {
  const { currentCrisis, addSentimentReportToCrisis, currentUser, settings } = useCrisisContext();
  const [isGeneratingSentiment, setIsGeneratingSentiment] = useState(false);

  const handleGenerateReport = async () => {
    if (!currentCrisis) return;
    setIsGeneratingSentiment(true);
    const newReport = generateMockSentimentReport(currentCrisis.id, currentUser.id);
    await addSentimentReportToCrisis(newReport);
    setIsGeneratingSentiment(false);
  };

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view sentiment reports.</p>;

  const latestReport = currentCrisis.sentimentHistory.length > 0
    ? currentCrisis.sentimentHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
    : null;

  const sentimentChartData = latestReport?.sentimentTrend
    .slice(0, 12) // Last 12 hours/data points
    .reverse()
    .map(dp => ({
      label: new Date(dp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: dp.score,
      color: dp.score >= 0.1 ? 'bg-green-500' : dp.score <= -0.1 ? 'bg-red-500' : 'bg-gray-500',
    })) || [];

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Sentiment Monitoring for {currentCrisis.title}</h2>

      {(currentUser.role === 'ADMIN' || currentUser.role === 'ANALYST' || currentUser.role === 'PR_SPECIALIST') && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-1">Generate New Sentiment Report</h3>
            <p className="text-gray-400 text-sm">Last updated {latestReport?.timestamp.toLocaleString() || 'N/A'}</p>
          </div>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingSentiment}
            className="p-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
          >
            {isGeneratingSentiment ? 'Analyzing...' : `Analyze Real-time Data (every ${settings.sentimentMonitorIntervalMinutes} min)`}
          </button>
        </div>
      )}

      {latestReport ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-300">Overall Sentiment</p>
              <p className={`text-5xl font-bold ${latestReport.overallSentiment > 0.1 ? 'text-green-400' : latestReport.overallSentiment < -0.1 ? 'text-red-400' : 'text-gray-400'}`}>
                {latestReport.overallSentiment.toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-300">Total Mentions (24h)</p>
              <p className="text-4xl font-bold text-cyan-400">
                {latestReport.sentimentTrend.reduce((sum, dp) => sum + dp.volume, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg text-center">
              <p className="text-gray-300">Key Themes</p>
              <p className="text-xl font-bold text-white">{latestReport.keyThemes.join(', ')}</p>
            </div>
          </div>

          <AnalyticsChart title="Sentiment Trend (Past 12 data points)" data={sentimentChartData} type="line" height={250} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Top Negative Mentions</h3>
              <ul className="space-y-2 bg-gray-800 p-4 rounded-lg">
                {latestReport.topNegativeMentions.map((mention, i) => (
                  <li key={i} className="text-red-300 text-sm">"{mention}"</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Top Positive Mentions</h3>
              <ul className="space-y-2 bg-gray-800 p-4 rounded-lg">
                {latestReport.topPositiveMentions.map((mention, i) => (
                  <li key={i} className="text-green-300 text-sm">"{mention}"</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Recommended PR Actions</h3>
            <ul className="space-y-2 list-disc list-inside bg-gray-800 p-4 rounded-lg">
              {latestReport.recommendedPRActions.map((action, i) => (
                <li key={i} className="text-gray-300 text-sm">{action}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">No sentiment reports generated for this crisis yet.</p>
      )}
    </div>
  );
};

export const CommsApprovalWorkflowPanel: React.FC = () => {
  const { currentCrisis, currentUser, updateCommsApprovalStatus } = useCrisisContext();

  if (!currentCrisis) return <p className="text-gray-400">Select a crisis to view comms approval workflow.</p>;

  const commsPackages = currentCrisis.generatedCommsPackages;

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Comms Approval Workflow for {currentCrisis.title}</h2>

      {commsPackages.length === 0 ? (
        <p className="text-gray-400">No communication packages generated yet for this crisis.</p>
      ) : (
        <div className="space-y-6">
          {commsPackages.map((commsPackage, pkgIndex) => (
            <div key={pkgIndex} className="bg-gray-800 p-5 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">Comms Package #{pkgIndex + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 p-3 rounded-md">
                  <h4 className="font-medium text-gray-300 mb-1">Press Release</h4>
                  <pre className="text-sm text-gray-400 whitespace-pre-wrap max-h-40 overflow-y-auto">{commsPackage.pressRelease}</pre>
                </div>
                <div className="bg-gray-900 p-3 rounded-md">
                  <h4 className="font-medium text-gray-300 mb-1">Twitter Thread (Snippet)</h4>
                  <pre className="text-sm text-gray-400 whitespace-pre-wrap max-h-40 overflow-y-auto">{commsPackage.twitterThread[0]}...</pre>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Approval Steps:</h4>
                <div className="space-y-3">
                  {currentCrisis.approvalWorkflow
                    .filter(entry => entry.commsPackageId === commsPackage.id) // Filter by the actual comms package ID if available, otherwise mock
                    .sort((a, b) => a.requiredRole.localeCompare(b.requiredRole)) // Simple sort for display
                    .map(entry => {
                      const reviewer = entry.reviewerId ? getMockUser(entry.reviewerId) : null;
                      const canApprove = (currentUser.role === 'ADMIN' || currentUser.role === entry.requiredRole) && entry.status === 'PENDING_REVIEW';
                      const isCurrentUserReviewer = currentUser.id === entry.reviewerId;

                      return (
                        <div key={entry.id} className="flex items-center space-x-3 p-3 bg-gray-900 rounded-md">
                          <CommsStatusBadge status={entry.status} />
                          <span className="text-gray-300 flex-grow">
                            {entry.requiredRole.replace(/_/g, ' ')} Review ({reviewer?.name || 'Awaiting reviewer'})
                          </span>
                          {entry.status === 'PENDING_REVIEW' && canApprove && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateCommsApprovalStatus(currentCrisis.id, commsPackage.id!, entry.id, 'APPROVED', currentUser.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50"
                                disabled={currentUser.role !== 'ADMIN' && currentUser.role !== entry.requiredRole}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateCommsApprovalStatus(currentCrisis.id, commsPackage.id!, entry.id, 'REJECTED', currentUser.id, 'Changes required.')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50"
                                disabled={currentUser.role !== 'ADMIN' && currentUser.role !== entry.requiredRole}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {(entry.status === 'APPROVED' || entry.status === 'REJECTED') && (
                            <span className="text-xs text-gray-500">
                              {entry.status} by {reviewer?.name} at {entry.reviewTimestamp?.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ReportingAndAnalyticsModule: React.FC = () => {
  const { allCrises, currentCrisis } = useCrisisContext();

  const crisisTypeData = useMemo(() => {
    const counts = allCrises.reduce((acc, crisis) => {
      acc[crisis.type] = (acc[crisis.type] || 0) + 1;
      return acc;
    }, {} as { [key in CrisisType]?: number });

    return Object.entries(counts).map(([type, value]) => ({
      label: type.replace(/_/g, ' '),
      value: value!,
      color: ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-cyan-500'][Math.floor(Math.random() * 6)]
    }));
  }, [allCrises]);

  const crisisSeverityData = useMemo(() => {
    const counts = allCrises.reduce((acc, crisis) => {
      acc[crisis.severity] = (acc[crisis.severity] || 0) + 1;
      return acc;
    }, {} as { [key in CrisisSeverity]?: number });

    return Object.entries(counts).map(([severity, value]) => ({
      label: severity,
      value: value!,
      color: { 'LOW': 'bg-green-500', 'MEDIUM': 'bg-yellow-500', 'HIGH': 'bg-orange-500', 'CRITICAL': 'bg-red-700' }[severity as CrisisSeverity]
    }));
  }, [allCrises]);

  const commsGeneratedData = useMemo(() => {
    const dailyCounts: { [date: string]: number } = {};
    allCrises.forEach(crisis => {
      crisis.generatedCommsPackages.forEach(() => {
        const dateKey = new Date(crisis.lastUpdate).toISOString().split('T')[0]; // Use lastUpdate for simplicity
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      });
    });

    return Object.entries(dailyCounts).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, value]) => ({
      label: new Date(date).toLocaleDateString(),
      value: value,
    }));
  }, [allCrises]);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">Reporting and Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart title="Crises by Type" data={crisisTypeData} type="pie" />
        <AnalyticsChart title="Crises by Severity" data={crisisSeverityData} type="bar" />
      </div>

      <div className="mt-6">
        <AnalyticsChart title="Communication Packages Generated Over Time" data={commsGeneratedData} type="line" height={300} />
      </div>

      {currentCrisis && (
        <div className="mt-8 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Current Crisis ({currentCrisis.title}) Performance</h3>
          <p className="text-gray-300">
            Time from Identification to Active: {(new Date(currentCrisis.identifiedAt).getTime() - currentCrisis.identifiedAt.getTime()) / (1000 * 60 * 60)}.  {/* Placeholder */}
          </p>
          <p className="text-gray-300">
            Number of Legal Reviews: {currentCrisis.legalReviews.length}
          </p>
          <p className="text-gray-300">
            Average Sentiment Score: {currentCrisis.sentimentHistory.length > 0 ? (currentCrisis.sentimentHistory.reduce((sum, s) => sum + s.overallSentiment, 0) / currentCrisis.sentimentHistory.length).toFixed(2) : 'N/A'}
          </p>
        </div>
      )}
    </div>
  );
};

export const SystemSettingsPanel: React.FC = () => {
  const { settings, updateSetting, currentUser } = useCrisisContext();

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">System Settings</h2>
        <p className="text-red-400">You do not have permission to view or modify system settings.</p>
      </div>
    );
  }

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value as UserRole);
    updateSetting('defaultApprovalWorkflow', selectedOptions);
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">System Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
          <label htmlFor="autoGenerateComms" className="text-lg text-gray-300">Auto-Generate Initial Comms</label>
          <input
            type="checkbox"
            id="autoGenerateComms"
            checked={settings.autoGenerateComms}
            onChange={e => updateSetting('autoGenerateComms', e.target.checked)}
            className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
          />
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <label htmlFor="sentimentMonitorInterval" className="block text-lg text-gray-300 mb-2">Sentiment Monitor Interval (minutes)</label>
          <input
            type="number"
            id="sentimentMonitorInterval"
            value={settings.sentimentMonitorIntervalMinutes}
            onChange={e => updateSetting('sentimentMonitorIntervalMinutes', parseInt(e.target.value) || 0)}
            min="5"
            max="1440"
            className="w-full p-2 bg-gray-600 rounded text-white"
          />
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <label htmlFor="defaultApprovalWorkflow" className="block text-lg text-gray-300 mb-2">Default Comms Approval Workflow</label>
          <select
            id="defaultApprovalWorkflow"
            multiple
            value={settings.defaultApprovalWorkflow}
            onChange={handleWorkflowChange}
            className="w-full p-2 bg-gray-600 rounded text-white min-h-[150px]"
            size={5}
          >
            {Object.values(UserRole).map(role => (
              <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <p className="text-sm text-gray-400 mt-2">Select roles in the order they should approve communications.</p>
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Notification Channels</h3>
          <div className="flex flex-wrap gap-4">
            {['email', 'slack', 'sms', 'teams'].map(channel => (
              <label key={channel} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notificationChannels.includes(channel)}
                  onChange={e => {
                    const newChannels = e.target.checked
                      ? [...settings.notificationChannels, channel]
                      : settings.notificationChannels.filter(c => c !== channel);
                    updateSetting('notificationChannels', newChannels);
                  }}
                  className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                />
                <span className="ml-2 text-gray-300">{channel.charAt(0).toUpperCase() + channel.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-3 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Default Comms Templates</h3>
          <p className="text-gray-400 mb-4">Customize boilerplate for specific crisis types.</p>
          {Object.values(CrisisType).map(type => (
            <div key={type} className="mb-4">
              <h4 className="font-semibold text-gray-200">{type.replace(/_/g, ' ')} Template</h4>
              <textarea
                value={settings.defaultTemplates[type]?.pressRelease || ''}
                onChange={e => updateSetting('defaultTemplates', { ...settings.defaultTemplates, [type]: { ...settings.defaultTemplates[type], pressRelease: e.target.value } })}
                placeholder={`Default Press Release for ${type.replace(/_/g, ' ')}...`}
                rows={2}
                className="w-full p-2 mt-1 bg-gray-600 rounded text-white resize-y"
              />
              {/* Could add more fields here like internalMemo, twitterThread etc. */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const UserManagementPanel: React.FC = () => {
  const { currentUser } = useCrisisContext();
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // In a real app, these would interact with a user API
  const handleSaveUser = (updatedUser: UserProfile) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setEditingUser(null);
    console.log('User saved:', updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      console.log('User deleted:', userId);
    }
  };

  const handleAddUser = (newUser: Omit<UserProfile, 'id' | 'lastLogin'>) => {
    const userWithId: UserProfile = {
      ...newUser,
      id: generateMockId('user'),
      lastLogin: new Date(),
    };
    setUsers(prev => [...prev, userWithId]);
    setShowAddUserModal(false);
    console.log('User added:', userWithId);
  };

  if (currentUser.role !== 'ADMIN' && !currentUser.permissions.canManageUsers) {
    return (
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <p className="text-red-400">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowAddUserModal(true)}
          className="p-2 bg-purple-600 hover:bg-purple-700 rounded"
        >
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{user.name}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{user.role.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => setEditingUser(user)} className="text-cyan-500 hover:text-cyan-700 mr-2">Edit</button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => setEditingUser(null)}
        />
      )}
      {showAddUserModal && (
        <AddUserModal
          onAdd={handleAddUser}
          onClose={() => setShowAddUserModal(false)}
        />
      )}
    </div>
  );
};

export const EditUserModal: React.FC<{ user: UserProfile; onSave: (user: UserProfile) => void; onClose: () => void }> = ({ user, onSave, onClose }) => {
  const [editedUser, setEditedUser] = useState(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-4">Edit User: {user.name}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Name</label>
            <input type="text" name="name" value={editedUser.name} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input type="email" name="email" value={editedUser.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Role</label>
            <select name="role" value={editedUser.role} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white">
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Department</label>
            <input type="text" name="department" value={editedUser.department} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={editedUser.isActive} onChange={handleChange} className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500" />
            <label className="ml-2 text-gray-300">Active</label>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Permissions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(user.permissions).map(perm => (
                <label key={perm} className="inline-flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name={perm}
                    checked={editedUser.permissions[perm] || false}
                    onChange={handlePermissionsChange}
                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm">{perm.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
          <button onClick={() => onSave(editedUser)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export const AddUserModal: React.FC<{ onAdd: (user: Omit<UserProfile, 'id' | 'lastLogin'>) => void; onClose: () => void }> = ({ onAdd, onClose }) => {
  const [newUser, setNewUser] = useState<Omit<UserProfile, 'id' | 'lastLogin'>>({
    name: '',
    email: '',
    role: 'VIEWER',
    isActive: true,
    department: '',
    permissions: {
      canViewAll: true,
      canEditCrisis: false,
      canGenerateComms: false,
      canReviewLegal: false,
      canReviewComms: false,
      canApproveComms: false,
      canAddIncidentLogs: false,
      canViewReports: false,
      canManageUsers: false,
      canEditAll: false,
      canInitiateReview: false
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked,
      },
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value as UserRole;
    let defaultPermissions: UserProfile['permissions'] = {
      canViewAll: true, canEditCrisis: false, canGenerateComms: false, canReviewLegal: false,
      canReviewComms: false, canApproveComms: false, canAddIncidentLogs: false,
      canViewReports: false, canManageUsers: false, canEditAll: false, canInitiateReview: false
    };

    switch (selectedRole) {
      case 'ADMIN':
        defaultPermissions = { ...defaultPermissions, canEditAll: true, canManageUsers: true, canApproveComms: true, canReviewLegal: true, canReviewComms: true, canGenerateComms: true, canEditCrisis: true, canAddIncidentLogs: true, canViewReports: true, canInitiateReview: true };
        break;
      case 'CRISIS_MANAGER':
        defaultPermissions = { ...defaultPermissions, canEditCrisis: true, canGenerateComms: true, canInitiateReview: true, canViewReports: true };
        break;
      case 'LEGAL_COUNSEL':
        defaultPermissions = { ...defaultPermissions, canReviewLegal: true, canApproveComms: true };
        break;
      case 'PR_SPECIALIST':
        defaultPermissions = { ...defaultPermissions, canReviewComms: true, canGenerateComms: true, canViewReports: true };
        break;
      case 'SUPPORT_MANAGER':
        defaultPermissions = { ...defaultPermissions, canViewAll: true };
        break;
      case 'EXECUTIVE':
        defaultPermissions = { ...defaultPermissions, canApproveComms: true, canViewAll: true };
        break;
      case 'INCIDENT_RESPONDER':
        defaultPermissions = { ...defaultPermissions, canAddIncidentLogs: true, canViewAll: true };
        break;
      case 'ANALYST':
        defaultPermissions = { ...defaultPermissions, canViewReports: true, canViewAll: true };
        break;
      case 'EDITOR':
        defaultPermissions = { ...defaultPermissions, canGenerateComms: true, canReviewComms: true };
        break;
      case 'VIEWER':
      defaultPermissions = { ...defaultPermissions, canViewAll: true };
      break;
    }
    setNewUser(prev => ({ ...prev, role: selectedRole, permissions: defaultPermissions }));
  };

  const isDisabled = !newUser.name || !newUser.email || !newUser.department;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg">
        <h3 className="text-2xl font-bold mb-4">Add New User</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Name</label>
            <input type="text" name="name" value={newUser.name} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input type="email" name="email" value={newUser.email} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Role</label>
            <select name="role" value={newUser.role} onChange={handleRoleChange} className="w-full p-2 bg-gray-700 rounded text-white">
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Department</label>
            <input type="text" name="department" value={newUser.department} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded text-white" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isActive" checked={newUser.isActive} onChange={handleChange} className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500" />
            <label className="ml-2 text-gray-300">Active</label>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Permissions</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(newUser.permissions).map(perm => (
                <label key={perm} className="inline-flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    name={perm}
                    checked={newUser.permissions[perm] || false}
                    onChange={handlePermissionsChange}
                    className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <span className="ml-2 text-sm">{perm.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white">Cancel</button>
          <button onClick={() => onAdd(newUser)} disabled={isDisabled} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white disabled:opacity-50">Add User</button>
        </div>
      </div>
    </div>
  );
};

// Main CrisisAIManagerView Component (expanded)
const CrisisAIManagerView: React.FC = () => {
  const { currentCrisis, setCurrentCrisis, allCrises, currentUser, addCommsPackageToCrisis } = useCrisisContext();

  const [crisisType, setCrisisType] = useState<CrisisType>(currentCrisis?.type || 'DATA_BREACH');
  const [facts, setFacts] = useState(currentCrisis?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [commsResult, setCommsResult] = useState<CommsPackage | null>(null); // Specific state for latest generated comms
  const [activeTab, setActiveTab] = useState<'comms' | 'dashboard' | 'incidents' | 'stakeholders' | 'legal' | 'sentiment' | 'workflow' | 'reports' | 'settings' | 'users'>('dashboard');

  useEffect(() => {
    if (currentCrisis) {
      setCrisisType(currentCrisis.type);
      setFacts(currentCrisis.description);
      // Display the latest comms package generated for the current crisis
      if (currentCrisis.generatedCommsPackages.length > 0) {
        setCommsResult(currentCrisis.generatedCommsPackages[currentCrisis.generatedCommsPackages.length - 1]);
      } else {
        setCommsResult(null);
      }
    } else {
      setCrisisType('DATA_BREACH');
      setFacts('');
      setCommsResult(null);
    }
  }, [currentCrisis]);

  const handleGenerateComms = async () => {
    if (!currentCrisis) {
      alert('Please select or create a crisis first.');
      return;
    }
    setIsLoading(true);
    setCommsResult(null);
    // MOCK API call to generate comms
    const response: CommsPackage = await new Promise(res => setTimeout(() => res(generateMockCommsPackage(crisisType, facts)), 2000));
    setCommsResult(response);
    await addCommsPackageToCrisis(currentCrisis.id, response); // Add to current crisis context
    setIsLoading(false);
  };

  const handleSaveCrisisDetails = async () => {
    if (!currentCrisis) return;
    setIsLoading(true); // Re-using loading for general actions
    await new Promise(res => setTimeout(res, 1000)); // Simulate API call
    setCurrentCrisis(prev => prev ? { ...prev, type: crisisType, description: facts, lastUpdate: new Date() } : null);
    setIsLoading(false);
    alert('Crisis details updated!');
  };

  if (!currentUser) {
    // Basic login/user selection for demonstration
    return (
      <div className="bg-gray-800 text-white p-6 rounded-lg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Select User Role</h1>
          <select
            value={currentUser.id}
            onChange={e => useCrisisContext().setCurrentUser(mockUsers.find(u => u.id === e.target.value)!)}
            className="w-full max-w-xs p-2 mb-4 bg-gray-700 rounded"
          >
            {mockUsers.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.role.replace(/_/g, ' ')})</option>
            ))}
          </select>
          <p>Please select a user to proceed.</p>
        </div>
      </div>
    );
  }

  return (
    <CrisisProvider>
      <div className="bg-gray-800 text-white p-6 rounded-lg min-h-screen flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold">Crisis AI Management System</h1>
          <div className="flex items-center space-x-3">
            <span className="text-gray-400">Logged in as:</span>
            <UserAvatar user={currentUser} />
            <span className="font-semibold">{currentUser.name} ({currentUser.role.replace(/_/g, ' ')})</span>
          </div>
        </div>

        <div className="flex mb-6 space-x-2">
          <select
            value={currentCrisis?.id || ''}
            onChange={e => setCurrentCrisis(allCrises.find(c => c.id === e.target.value) || null)}
            className="p-2 bg-gray-700 rounded text-white flex-grow"
          >
            <option value="">Select or Create Crisis</option>
            {allCrises.map(crisis => (
              <option key={crisis.id} value={crisis.id}>
                {crisis.title} - {crisis.status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <button className="p-2 bg-teal-600 hover:bg-teal-700 rounded">New Crisis</button>
        </div>

        <div className="flex mb-6 border-b border-gray-700 overflow-x-auto">
          {['dashboard', 'comms', 'incidents', 'stakeholders', 'legal', 'sentiment', 'workflow', 'reports', 'settings', 'users'].map(tab => (
            <button
              key={tab}
              className={`py-2 px-4 whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex-grow">
          {activeTab === 'dashboard' && <CrisisOverviewDashboard />}

          {activeTab === 'comms' && (
            <div className="bg-gray-700 p-6 rounded-lg shadow-xl mb-6">
              <h2 className="text-2xl font-bold mb-4">Crisis AI Communications Manager</h2>
              <select value={crisisType} onChange={e => setCrisisType(e.target.value as CrisisType)} className="w-full p-2 mb-4 bg-gray-600 rounded">
                {Object.values(CrisisType).map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <textarea
                value={facts}
                onChange={e => setFacts(e.target.value)}
                placeholder="Enter key facts (e.g., '50k user emails exposed, no passwords. Discovered 8am today.')"
                rows={4}
                className="w-full p-2 mb-4 bg-gray-600 rounded text-white resize-y"
              />
              <div className="flex space-x-4 mb-4">
                <button onClick={handleGenerateComms} disabled={isLoading || !currentCrisis} className="flex-grow p-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                  {isLoading ? 'Generating...' : 'Generate Unified Comms Package'}
                </button>
                <button onClick={handleSaveCrisisDetails} disabled={isLoading || !currentCrisis} className="flex-grow p-2 bg-yellow-600 hover:bg-yellow-700 rounded disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Crisis Details'}
                </button>
              </div>

              {isLoading && <p className="mt-4 text-cyan-300">Analyzing legal precedent and sentiment... drafting response...</p>}
              {commsResult && (
                <div className="mt-6 border-t border-gray-600 pt-4">
                  <h3 className="text-xl font-semibold mb-3">Latest Generated Communications Package</h3>
                  {Object.entries(commsResult).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <h4 className="text-lg font-semibold mb-1 text-gray-300">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h4>
                      <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
                        {Array.isArray(value) ? value.map((v, i) => <pre key={i} className="whitespace-pre-wrap text-sm text-gray-200 mb-1">{v}</pre>) : <pre className="whitespace-pre-wrap text-sm text-gray-200">{value as string}</pre>}
                      </div>
                    </div>
                  ))}
                  <button className="w-full p-2 mt-4 bg-purple-600 hover:bg-purple-700 rounded" onClick={() => setActiveTab('workflow')}>Proceed to Approval Workflow</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'incidents' && <IncidentLogManager />}
          {activeTab === 'stakeholders' && <StakeholderCommunicationManager />}
          {activeTab === 'legal' && <LegalReviewDashboard />}
          {activeTab === 'sentiment' && <SentimentMonitoringDashboard />}
          {activeTab === 'workflow' && <CommsApprovalWorkflowPanel />}
          {activeTab === 'reports' && <ReportingAndAnalyticsModule />}
          {activeTab === 'settings' && <SystemSettingsPanel />}
          {activeTab === 'users' && <UserManagementPanel />}
        </div>
      </div>
    </CrisisProvider>
  );
};

export default CrisisAIManagerView;
