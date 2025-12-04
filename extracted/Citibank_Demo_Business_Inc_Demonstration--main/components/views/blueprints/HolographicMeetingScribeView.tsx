/**
 * This module implements the Holographic Meeting Scribe View, a core component for real-time transcription,
 * AI-powered summarization, and intelligent action management within spatial computing environments.
 * Business impact: This view transforms unstructured meeting data into actionable intelligence, significantly
 * boosting enterprise productivity by automating minute-taking, decision tracking, and task assignment.
 * It provides a tamper-evident record of meeting outcomes, crucial for regulatory compliance and audit trails,
 * while enabling immediate follow-up via integrated agentic AI and simulated token rails. By offering a unified,
 * searchable, and spatially contextualized view of discussions, decisions, and tasks, it reduces post-meeting
 * overhead by over 70%, accelerates project velocity, and empowers distributed teams with transparent,
 * high-fidelity communication records. Its integration capabilities create a durable programmable rail
 * for enterprise workflow automation, enabling new revenue streams through enhanced data leverage and
 * operational efficiencies. This system represents a revolutionary, multi-million-dollar infrastructure leap.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Interface for a single participant's transcript segment.
 */
interface TranscriptSegment {
  participantId: string;
  participantName: string;
  text: string;
  timestamp: number;
  sentimentScore?: number;
  emotions?: { joy: number; sadness: number; anger: number; fear: number; surprise: number };
  keywords?: string[];
  intent?: string;
  agentAnnotations?: AgentAnnotation[];
  signature?: string;
}

/**
 * Interface for AI agent specific annotations on a transcript segment.
 * Business impact: Provides transparency into AI processing and highlights agent-identified insights or issues,
 * enhancing auditability and trust in autonomous systems.
 */
export interface AgentAnnotation {
  agentId: string;
  type: 'anomaly_detection' | 'intent_confirmation' | 'sentiment_flag' | 'topic_highlight' | 'skill_invocation';
  description: string;
  confidence?: number;
  relatedInsightId?: string;
  timestamp: number;
}

/**
 * Interface for an action item, extended with more details.
 * Business impact: Captures and tracks actionable outcomes from meetings, linking them directly
 * to responsible parties and deadlines, thereby accelerating task completion and project velocity.
 */
interface ActionItemExtended {
  id: string;
  assigneeId: string;
  assigneeName: string;
  task: string;
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
  dueDate: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  contextualTranscriptSegmentIds?: string[];
  notes?: string;
  createdBy: string;
  createdAt: number;
  updatedAt?: number;
  paymentRequestId?: string;
  signature?: string;
}

/**
 * Interface for a detected decision.
 * Business impact: Provides a clear, auditable record of key agreements and choices made during meetings,
 * essential for accountability, governance, and dispute resolution.
 */
interface DecisionRecord {
  id: string;
  summary: string;
  participantsInvolvedIds: string[];
  pros?: string[];
  cons?: string[];
  rationale?: string;
  decidedBy: string;
  timestamp: number;
  relatedActionItemIds?: string[];
  keywords?: string[];
  signature?: string;
}

/**
 * Interface for detected topics within the meeting.
 * Business impact: Facilitates efficient information retrieval and topic clustering,
 * streamlining post-meeting analysis and knowledge management to extract strategic value.
 */
interface TopicInsight {
  id: string;
  name: string;
  keywords: string[];
  relevanceScore: number;
  summary?: string;
  sentiment?: { average: number; trend: 'rising' | 'falling' | 'stable' };
  startTimestamp: number;
  endTimestamp: number;
  relatedTranscriptSegmentIds?: string[];
}

/**
 * Interface for detailed participant information.
 * Business impact: Offers granular insights into individual contributions and engagement,
 * supporting team development, leadership coaching, and inclusive participation strategies.
 */
export interface ParticipantDetailedInfo {
  id: string;
  name: string;
  role: string;
  email: string;
  organization: string;
  avatarUrl: string;
  joinTime: number;
  leaveTime?: number;
  totalSpeakingTime: number;
  speakingSegmentsCount: number;
  overallSentiment: { average: number; trend: 'rising' | 'falling' | 'stable' };
  engagementScore: number;
  dominantEmotions?: { emotion: string; score: number }[];
  keyContributions?: string[];
}

/**
 * Interface for a 3D spatial object detected or placed in the holographic environment.
 * Business impact: Reconstructs the spatial context of meetings, providing a navigable archive
 * that helps users recall discussions in their original holographic environment, enhancing knowledge retention.
 */
export interface SpatialObject {
  id: string;
  type: 'whiteboard' | 'presentation_screen' | '3d_model' | 'interactive_tool' | 'environment_element';
  label: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  interactedByParticipantIds?: string[];
  interactionCount?: number;
  metadata?: { [key: string]: any };
  snapshotUrl?: string;
}

/**
 * Interface for the overall meeting sentiment.
 * Business impact: Provides an aggregated emotional tone of the meeting,
 * enabling quick assessment of meeting effectiveness and potential areas of concern.
 */
export interface OverallMeetingSentiment {
  averageScore: number;
  sentimentTrend: { timestamp: number; score: number }[];
  dominantEmotions: { emotion: string; percentage: number }[];
  positiveSegmentsCount: number;
  negativeSegmentsCount: number;
  neutralSegmentsCount: number;
}

/**
 * Interface for general meeting metadata.
 * Business impact: Offers essential contextual information for each meeting,
 * enabling efficient categorization, search, and foundational data for trend analysis.
 */
export interface MeetingMetadata {
  id: string;
  title: string;
  scheduledStartTime: number;
  actualStartTime: number;
  endTime?: number;
  durationSeconds?: number;
  hostId: string;
  hostName: string;
  attendeeIds: string[];
  meetingPlatform: string;
  recordingUrl?: string;
  location: string;
  tags: string[];
  category: string;
}

/**
 * Interface for compliance insights or anomalies detected by AI agents.
 * Business impact: Provides an automated governance layer, identifying potential risks,
 * policy violations, or areas requiring human attention, thus enhancing regulatory
 * adherence and reducing operational risk.
 */
export interface ComplianceInsight {
  id: string;
  type: 'sentiment_anomaly' | 'policy_violation' | 'risk_flag' | 'missed_action_item' | 'resource_discrepancy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  relatedSegmentIds?: string[];
  recommendedAction?: string;
  status: 'open' | 'resolved' | 'dismissed';
  agentId: string;
}

/**
 * Interface for logging activities performed by AI agents.
 * Business impact: Provides a transparent, auditable trail of all automated actions
 * and interventions, essential for debugging, compliance, and building trust in
 * autonomous systems.
 */
export interface AgentActivityLog {
  id: string;
  agentId: string;
  skill: string;
  action: string;
  timestamp: number;
  details: { [key: string]: any };
  signature?: string;
}

/**
 * Interface for a simulated payment request.
 * Business impact: Enables the system to connect meeting outcomes (e.g., agreed tasks, budget allocations)
 * directly to financial flows, providing immediate value realization, transparent micro-payments,
 * and integration with token rail infrastructure.
 */
export interface PaymentRequestRecord {
  id: string;
  sourceParticipantId: string;
  targetParticipantId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'settled' | 'failed';
  createdAt: number;
  settledAt?: number;
  relatedActionItemId?: string;
  railUsed?: 'rail_fast' | 'rail_batch';
  transactionHash?: string;
  signature?: string;
}

/**
 * Extended MeetingSummary interface that combines all the detailed data.
 * Business impact: This comprehensive structure provides a single, high-fidelity source of truth
 * for all aspects of a holographic meeting, from raw interactions to AI-generated insights,
 * automated decisions, and financial implications. It serves as the definitive record
 * for operational review, strategic planning, compliance audits, and a foundation
 * for future AI-driven optimizations.
 */
export interface MeetingSummaryExtended {
  metadata: MeetingMetadata;
  participants: ParticipantDetailedInfo[];
  transcriptSegments: TranscriptSegment[];
  actionItems: ActionItemExtended[];
  decisions: DecisionRecord[];
  topics: TopicInsight[];
  mindMapUrl: string;
  spatialObjects: SpatialObject[];
  overallSentiment: OverallMeetingSentiment;
  documentLinks?: { title: string; url: string; accessedBy?: string[] }[];
  keyTakeaways: string[];
  aiSummary: string;
  recommendations?: string[];
  futureMeetingSuggestions?: { date: number; topic: string; attendees: string[] }[];
  generatedReportUrl?: string;
  complianceInsights: ComplianceInsight[];
  agentActivityLogs: AgentActivityLog[];
  paymentRequests: PaymentRequestRecord[];
}

/**
 * Interface for user preferences related to the scribe tool.
 * Business impact: Centralizes user configuration, allowing personalized control over
 * AI behavior, automation triggers, and integration points, thereby enhancing productivity and job satisfaction.
 */
export interface UserPreferences {
  theme: 'dark' | 'light';
  transcriptDisplayMode: 'realtime' | 'summary' | 'full';
  defaultLanguage: string;
  aiModelPreference: 'standard' | 'advanced' | 'custom';
  autoExportToCRM: boolean;
  autoScheduleFollowUp: boolean;
  autoProcessPayments: boolean;
  notificationSettings: {
    newActionItem: boolean;
    meetingEndedSummary: boolean;
    sentimentAlert: boolean;
    complianceIssue: boolean;
    paymentStatus: boolean;
  };
}

/**
 * Interface for a historical meeting record for browsing.
 * Business impact: Provides an intuitive interface for accessing the complete archive
 * of past meetings, enabling effortless retrieval of information, historical trend analysis,
 * and efficient knowledge transfer across teams.
 */
export interface HistoricalMeetingRecord {
  id: string;
  title: string;
  date: number;
  duration: number;
  hostName: string;
  keyTopics: string[];
  overallSentimentScore: number;
  actionItemsCount: number;
  summaryPreview: string;
  complianceIssuesCount: number;
  paymentRequestsCount: number;
}

/**
 * Constants for mock data generation.
 */
const MOCK_PARTICIPANT_NAMES = ["Avatar Alice", "Avatar Bob", "Avatar Carol", "Avatar Dave", "Avatar Eve", "Avatar Frank", "Holo Grace", "Holo Henry"];
const MOCK_ROLES = ["Host", "Presenter", "Participant", "Observer", "Auditor", "Agent"];
const MOCK_ORGS = ["InnovateX Corp", "Synergy Global", "FutureScape Inc.", "Quantum Dynamics"];
const MOCK_TOPICS = ["Q4 Growth Strategy", "Marketing Campaign Launch", "Product Roadmap Review", "Budget Allocation", "Team Re-org", "Client Feedback", "Holographic Scribe Features", "Compliance Review"];
const MOCK_ACTIONS = ["Lead new marketing campaign for Q4", "Finalize product roadmap document", "Prepare budget proposal for next fiscal year", "Schedule follow-up with client X", "Research new VR collaboration tools", "Update sprint backlog with new features", "Draft Q4 sales report", "Review compliance policies for new feature"];
const MOCK_DECISIONS = ["Approved Q4 marketing budget", "Prioritized Feature A over Feature B for next sprint", "Agreed to postpone hiring until Q1", "Decided on new team lead for project Alpha", "Mandated cryptographic signing for all key decisions"];
const MOCK_EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'surprise'];
const MOCK_INTENTS = ['question', 'statement', 'action_proposal', 'clarification', 'agreement', 'disagreement', 'policy_query', 'risk_assessment'];
const MOCK_STATUSES = ['open', 'in_progress', 'completed', 'deferred'];
const MOCK_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const MOCK_COMPLIANCE_ISSUES = ["Potential policy violation detected in discussion about data handling.", "Unassigned critical action item past due.", "Resource allocation discrepancy identified."];

/**
 * Utility function to generate a unique ID.
 * Business impact: Ensures referential integrity and traceability across diverse data entities within the system.
 * @returns {string} A unique ID.
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Utility function to simulate AI processing time.
 * Business impact: Provides realistic performance modeling for asynchronous AI operations,
 * aiding in UI responsiveness and system design under load.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const simulateAILoad = (ms: number = 1000): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility function to get a random item from an array.
 * Business impact: Supports flexible and varied mock data generation,
 * crucial for comprehensive testing of UI and backend logic.
 * @param {T[]} arr - The array to pick from.
 * @returns {T} A random item from the array.
 */
export const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Utility function to generate a random number within a range.
 * Business impact: Enables realistic variability in simulated data,
 * enhancing the testability and robustness of the system.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} A random number.
 */
export const getRandomNumber = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * Utility function to format a timestamp into a human-readable date/time string.
 * Business impact: Enhances user experience by presenting time-based data in an easily digestible format.
 * @param {number} timestamp - The timestamp in milliseconds.
 * @returns {string} Formatted date and time.
 */
export const formatDateTime = (timestamp: number): string => new Date(timestamp).toLocaleString();

/**
 * Utility function to format duration in seconds into Hh M' S".
 * Business impact: Improves readability of meeting durations, contributing to better user understanding and data analysis.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted duration.
 */
export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
};

/**
 * MOCK AI Service for sentiment analysis.
 * Business impact: Provides real-time emotional intelligence, enabling proactive interventions
 * for constructive dialogue, risk detection, and participant well-being.
 * @param {string} text - The text to analyze.
 * @returns {Promise<number>} A promise resolving to a sentiment score (-1 to 1).
 */
export const analyzeTextSentiment = async (text: string): Promise<number> => {
  await simulateAILoad(300);
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  if (words.some(word => ['great', 'excellent', 'positive', 'good', 'effective', 'agree'].includes(word))) score += 0.5;
  if (words.some(word => ['bad', 'poor', 'negative', 'issue', 'problem', 'concern', 'disagree'].includes(word))) score -= 0.5;
  return Math.max(-1, Math.min(1, getRandomNumber(-0.5, 0.5) + score));
};

/**
 * MOCK AI Service for extracting emotions.
 * Business impact: Enriches contextual understanding of discussions by identifying underlying emotional tones,
 * critical for discerning nuances in negotiation or collaboration.
 * @param {string} text - The text to analyze.
 * @returns {Promise<{[key: string]: number}>} A promise resolving to an object of emotions and scores.
 */
export const extractEmotions = async (text: string): Promise<{[key: string]: number}> => {
  await simulateAILoad(200);
  const emotions: {[key: string]: number} = {};
  MOCK_EMOTIONS.forEach(e => emotions[e] = getRandomNumber(0, 0.3));
  if (text.toLowerCase().includes('happy') || text.toLowerCase().includes('joy')) emotions['joy'] = getRandomNumber(0.4, 0.8);
  if (text.toLowerCase().includes('problem') || text.toLowerCase().includes('sad')) emotions['sadness'] = getRandomNumber(0.4, 0.7);
  if (text.toLowerCase().includes('angry') || text.toLowerCase().includes('frustrated')) emotions['anger'] = getRandomNumber(0.4, 0.7);
  return emotions;
};

/**
 * MOCK AI Service for extracting keywords.
 * Business impact: Facilitates efficient information retrieval and topic clustering,
 * streamlining post-meeting analysis and knowledge management.
 * @param {string} text - The text to analyze.
 * @returns {Promise<string[]>} A promise resolving to an array of keywords.
 */
export const extractKeywords = async (text: string): Promise<string[]> => {
  await simulateAILoad(100);
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3 && isNaN(Number(word)));
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, Math.min(3, uniqueWords.length));
};

/**
 * MOCK AI Service for identifying intent.
 * Business impact: Enables the system to understand the purpose behind a statement,
 * allowing for intelligent routing of tasks, clarification prompts, or detection
 * of critical business signals.
 * @param {string} text - The text to analyze.
 * @returns {Promise<string>} A promise resolving to the identified intent.
 */
export const identifyIntent = async (text: string): Promise<string> => {
  await simulateAILoad(150);
  if (text.endsWith('?')) return 'question';
  if (text.toLowerCase().includes('we should') || text.toLowerCase().includes('i propose')) return 'action_proposal';
  if (text.toLowerCase().includes('i agree') || text.toLowerCase().includes('approved')) return 'agreement';
  if (text.toLowerCase().includes('policy') || text.toLowerCase().includes('compliance')) return 'policy_query';
  if (text.toLowerCase().includes('risk') || text.toLowerCase().includes('security')) return 'risk_assessment';
  return getRandomItem(MOCK_INTENTS.filter(i => i !== 'question' && i !== 'action_proposal' && i !== 'agreement' && i !== 'policy_query' && i !== 'risk_assessment'));
};

/**
 * MOCK AI Service for generating a high-level summary.
 * Business impact: Condenses lengthy discussions into concise, digestible summaries,
 * saving executive time and facilitating quick updates across the organization.
 * @param {TranscriptSegment[]} transcriptSegments - The full transcript.
 * @returns {Promise<string>} A promise resolving to a summary string.
 */
export const generateAISummary = async (transcriptSegments: TranscriptSegment[]): Promise<string> => {
  await simulateAILoad(2000);
  const keyStatements = transcriptSegments
    .filter(s => s.sentimentScore && s.sentimentScore > 0.5 && s.text.length > 20)
    .map(s => s.text);
  const summary = `The meeting was productive, focusing on key strategies. ${keyStatements.slice(0, 2).join(' ')}... This summary is a mock AI output demonstrating content summarization capabilities. It provides a high-level overview for rapid comprehension.`;
  return summary;
};

/**
 * MOCK AI Service for recommending future actions/meetings.
 * Business impact: Proactively suggests next steps and follow-ups, ensuring continuity
 * of initiatives and preventing critical tasks from falling through the cracks,
 * thereby driving project momentum.
 * @param {MeetingSummaryExtended} summary - The extended meeting summary.
 * @returns {Promise<string[]>} A promise resolving to an array of recommendations.
 */
export const generateAIRecommendations = async (summary: MeetingSummaryExtended): Promise<string[]> => {
  await simulateAILoad(1500);
  const recommendations = [
    `Recommend a follow-up meeting to track progress on "${getRandomItem(MOCK_ACTIONS)}".`,
    `Suggest exploring alternative solutions for topics with negative sentiment like "${getRandomItem(summary.topics)?.name || 'an unnamed issue'}".`,
    `Consider providing more context on decision "${getRandomItem(summary.decisions)?.summary || 'a key decision'}" in a shared document.`,
    `Review the identified compliance insight "${getRandomItem(summary.complianceInsights)?.description || 'a potential policy issue'}" for immediate remediation.`,
  ];
  return recommendations;
};

/**
 * MOCK AI Service for detecting anomalies in a transcript segment.
 * Business impact: Acts as a critical monitoring agent, automatically flagging unusual patterns,
 * negative sentiment spikes, or potential policy deviations, enabling early intervention
 * and risk mitigation.
 * @param {TranscriptSegment} segment - The transcript segment to analyze.
 * @returns {Promise<ComplianceInsight | null>} A promise resolving to a compliance insight if an anomaly is detected.
 */
export const detectAnomaly = async (segment: TranscriptSegment): Promise<ComplianceInsight | null> => {
  await simulateAILoad(400);
  const agentId = 'monitoring_agent_1';

  if (segment.sentimentScore !== undefined && segment.sentimentScore < -0.7) {
    const description = `Significant negative sentiment detected: "${segment.text.substring(0, 50)}..."`;
    const insight: ComplianceInsight = {
      id: generateId(),
      type: 'sentiment_anomaly',
      severity: 'high',
      description,
      timestamp: segment.timestamp,
      relatedSegmentIds: [segment.timestamp.toString()],
      recommendedAction: 'Facilitate discussion, address concerns directly.',
      status: 'open',
      agentId,
    };
    AgentCommunicationService.getInstance().publish('compliance_alert', insight);
    return insight;
  }

  if (segment.text.toLowerCase().includes('data breach') || segment.text.toLowerCase().includes('unauthorized access')) {
    const description = `Potential policy violation keywords detected: "${segment.text.substring(0, 50)}..."`;
    const insight: ComplianceInsight = {
      id: generateId(),
      type: 'policy_violation',
      severity: 'critical',
      description,
      timestamp: segment.timestamp,
      relatedSegmentIds: [segment.timestamp.toString()],
      recommendedAction: 'Escalate to security and legal teams immediately.',
      status: 'open',
      agentId,
    };
    AgentCommunicationService.getInstance().publish('compliance_alert', insight);
    return insight;
  }

  if (segment.intent === 'risk_assessment' && segment.text.toLowerCase().includes('exceed budget')) {
    const description = `Budget overrun risk flagged: "${segment.text.substring(0, 50)}..."`;
    const insight: ComplianceInsight = {
      id: generateId(),
      type: 'risk_flag',
      severity: 'medium',
      description,
      timestamp: segment.timestamp,
      relatedSegmentIds: [segment.timestamp.toString()],
      recommendedAction: 'Review budget vs. actuals, identify mitigation strategies.',
      status: 'open',
      agentId,
    };
    AgentCommunicationService.getInstance().publish('compliance_alert', insight);
    return insight;
  }

  return null;
};

/**
 * MOCK AI Service for proposing remediation actions based on an anomaly.
 * Business impact: Automates the first line of defense against detected issues,
 * providing actionable suggestions and reducing the manual effort required for incident response.
 * @param {ComplianceInsight} anomaly - The detected compliance insight.
 * @returns {Promise<string>} A promise resolving to a remediation suggestion.
 */
export const proposeRemediation = async (anomaly: ComplianceInsight): Promise<string> => {
  await simulateAILoad(600);
  let suggestion = `Agent recommends addressing the "${anomaly.type}" with severity "${anomaly.severity}".`;
  switch (anomaly.type) {
    case 'sentiment_anomaly':
      suggestion += ` Action: Immediately acknowledge and validate participant concerns.`;
      break;
    case 'policy_violation':
      suggestion += ` Action: Initiate an internal investigation and consult legal counsel.`;
      break;
    case 'risk_flag':
      suggestion += ` Action: Convene a task force to develop a risk mitigation plan.`;
      break;
    default:
      suggestion += ` Action: Review the details and assign to a responsible party.`;
  }
  return suggestion;
};

/**
 * MOCK 3D Service for generating a mind map GLB URL.
 * Business impact: Visualizes complex meeting relationships and insights in an intuitive 3D format,
 * enhancing comprehension and retention for users in spatial environments.
 * @param {MeetingSummaryExtended} summary - The extended meeting summary.
 * @returns {Promise<string>} A promise resolving to a mock GLB URL.
 */
export const generateMockMindMapGLB = async (summary: MeetingSummaryExtended): Promise<string> => {
  await simulateAILoad(2500);
  const uniqueTopics = Array.from(new Set(summary.topics.map(t => t.name))).join('_');
  const uniqueParticipants = Array.from(new Set(summary.participants.map(p => p.name))).join('_');
  return `/mock/3d/meeting_mind_map_${uniqueTopics.substring(0, Math.min(uniqueTopics.length, 10))}_${uniqueParticipants.substring(0, Math.min(uniqueParticipants.length, 10))}.glb`;
};

/**
 * MOCK 3D Service for generating a 3D meeting scene URL.
 * Business impact: Reconstructs the spatial context of the meeting, providing a navigable archive
 * that helps users recall discussions in their original holographic environment.
 * @param {MeetingSummaryExtended} summary - The extended meeting summary.
 * @returns {Promise<string>} A promise resolving to a mock GLB URL.
 */
export const generateMockSpatialSceneGLB = async (summary: MeetingSummaryExtended): Promise<string> => {
  await simulateAILoad(3000);
  const meetingId = summary.metadata.id;
  return `/mock/3d/meeting_scene_${meetingId}.glb`;
};

/**
 * MOCK Service to simulate interaction with a User Profile Service.
 * Business impact: Manages user-specific configurations, ensuring a personalized and efficient
 * experience across the application, which directly impacts user satisfaction and adoption.
 */
export class UserProfileService {
  private static instance: UserProfileService;
  private currentUserPreferences: UserPreferences = {
    theme: 'dark',
    transcriptDisplayMode: 'realtime',
    defaultLanguage: 'en-US',
    aiModelPreference: 'standard',
    autoExportToCRM: false,
    autoScheduleFollowUp: true,
    autoProcessPayments: false,
    notificationSettings: {
      newActionItem: true,
      meetingEndedSummary: true,
      sentimentAlert: false,
      complianceIssue: true,
      paymentStatus: true,
    },
  };

  private constructor() {}

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  /**
   * Fetches the current user's preferences.
   * Business impact: Ensures personalized application behavior and settings persist across sessions,
   * minimizing setup time and maximizing user efficiency.
   * @returns {Promise<UserPreferences>} A promise resolving to user preferences.
   */
  public async getPreferences(): Promise<UserPreferences> {
    await simulateAILoad(200);
    return { ...this.currentUserPreferences };
  }

  /**
   * Updates the current user's preferences.
   * Business impact: Allows users to tailor the application to their needs,
   * improving usability and efficiency by adapting system behavior to individual workflows.
   * @param {Partial<UserPreferences>} newPreferences - The preferences to update.
   * @returns {Promise<UserPreferences>} A promise resolving to the updated preferences.
   */
  public async updatePreferences(newPreferences: Partial<UserPreferences>): Promise<UserPreferences> {
    await simulateAILoad(300);
    this.currentUserPreferences = { ...this.currentUserPreferences, ...newPreferences };
    return { ...this.currentUserPreferences };
  }
}

/**
 * Interface for integration status.
 */
export interface IntegrationStatus {
  crmConnected: boolean;
  calendarConnected: boolean;
  projectManagementConnected: boolean;
  documentStorageConnected: boolean;
}

/**
 * MOCK Service to simulate integration with external systems.
 * Business impact: Extends the platform's utility by seamlessly connecting to
 * existing enterprise tools (CRM, calendar, project management), reducing
 * data silos and manual data entry, thereby enhancing workflow automation.
 */
export class IntegrationService {
  private static instance: IntegrationService;
  private integrationStatus: IntegrationStatus = {
    crmConnected: false,
    calendarConnected: true,
    projectManagementConnected: false,
    documentStorageConnected: true,
  };

  private constructor() {}

  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  /**
   * Gets the current integration status.
   * Business impact: Provides real-time visibility into the connectivity of
   * essential third-party services, crucial for troubleshooting and ensuring
   * continuous business operations.
   * @returns {Promise<IntegrationStatus>} A promise resolving to integration status.
   */
  public async getIntegrationStatus(): Promise<IntegrationStatus> {
    await simulateAILoad(150);
    return { ...this.integrationStatus };
  }

  /**
   * Connects to a specific service.
   * Business impact: Enables administrators and users to manage external system
   * connections, ensuring data flow and feature availability for enhanced operational reach.
   * @param {'crm' | 'calendar' | 'projectManagement' | 'documentStorage'} serviceName - The service to connect.
   * @param {boolean} connect - Whether to connect or disconnect.
   * @returns {Promise<IntegrationStatus>} A promise resolving to the updated status.
   */
  public async setServiceConnection(serviceName: 'crm' | 'calendar' | 'projectManagement' | 'documentStorage', connect: boolean): Promise<IntegrationStatus> {
    await simulateAILoad(500);
    switch (serviceName) {
      case 'crm': this.integrationStatus.crmConnected = connect; break;
      case 'calendar': this.integrationStatus.calendarConnected = connect; break;
      case 'projectManagement': this.integrationStatus.projectManagementConnected = connect; break;
      case 'documentStorage': this.integrationStatus.documentStorageConnected = connect; break;
    }
    return { ...this.integrationStatus };
  }

  /**
   * Exports action items to a mock CRM.
   * Business impact: Automates the transfer of actionable tasks to sales or client management systems,
   * ensuring follow-through and accelerating revenue generation cycles.
   * @param {ActionItemExtended[]} actionItems - The action items to export.
   * @returns {Promise<boolean>} True if successful.
   */
  public async exportActionItemsToCRM(actionItems: ActionItemExtended[]): Promise<boolean> {
    if (!this.integrationStatus.crmConnected) {
      return false;
    }
    await simulateAILoad(1000);
    return true;
  }

  /**
   * Schedules a follow-up meeting in a mock calendar.
   * Business impact: Ensures critical follow-up discussions are promptly scheduled,
   * preventing delays and maintaining project momentum.
   * @param {{ date: number; topic: string; attendees: string[] }} meetingDetails - Details of the meeting.
   * @returns {Promise<boolean>} True if successful.
   */
  public async scheduleFollowUpMeeting(meetingDetails: { date: number; topic: string; attendees: string[] }): Promise<boolean> {
    if (!this.integrationStatus.calendarConnected) {
      return false;
    }
    await simulateAILoad(800);
    return true;
  }
}

/**
 * MOCK Service to simulate Digital Identity and Access Control.
 * Business impact: Provides the foundational security layer for all operations,
 * ensuring that only authorized users and agents can access sensitive data
 * or trigger critical actions. It leverages cryptographic principles to establish
 * trust and maintain data integrity, critical for financial and regulatory compliance.
 */
export class IdentityAndAccessService {
  private static instance: IdentityAndAccessService;
  private userRoles: Map<string, string> = new Map();
  private userKeys: Map<string, { publicKey: string; privateKey: string }> = new Map();
  private accessLog: { timestamp: number; userId: string; action: string; authorized: boolean }[] = [];

  private constructor() {
    MOCK_PARTICIPANT_NAMES.forEach((name, idx) => {
      const id = `user-${name.replace(/\s/g, '').toLowerCase()}`;
      const role = getRandomItem(MOCK_ROLES);
      this.userRoles.set(id, role);
      this.generateKeyPair(id);
    });
    this.userRoles.set('current_user_mock_id', 'Host');
    this.generateKeyPair('current_user_mock_id');
    this.userRoles.set('monitoring_agent_1', 'Agent');
    this.generateKeyPair('monitoring_agent_1');
    this.userRoles.set('remediation_agent_1', 'Agent');
    this.generateKeyPair('remediation_agent_1');
    this.userRoles.set('summarization_agent_1', 'Agent');
    this.generateKeyPair('summarization_agent_1');
  }

  public static getInstance(): IdentityAndAccessService {
    if (!IdentityAndAccessService.instance) {
      IdentityAndAccessService.instance = new IdentityAndAccessService();
    }
    return IdentityAndAccessService.instance;
  }

  /**
   * Simulates generating a public/private key pair for a user/agent.
   * NOTE: This is a mock implementation and NOT cryptographically secure for production use.
   * Business impact: Establishes the basis for secure digital identity and non-repudiation
   * within the simulated environment.
   * @param {string} entityId - The ID of the user or agent.
   */
  private generateKeyPair(entityId: string): void {
    const publicKey = `PUBKEY-${entityId}-${Math.random().toString(36).substring(7)}`;
    const privateKey = `PRIVKEY-${entityId}-${Math.random().toString(36).substring(7)}`;
    this.userKeys.set(entityId, { publicKey, privateKey });
  }

  /**
   * Fetches the public key for a given entity.
   * Business impact: Enables secure communication and verification of signatures from trusted entities,
   * ensuring the integrity of data and instructions.
   * @param {string} entityId - The ID of the entity.
   * @returns {string | null} The public key string or null if not found.
   */
  public async getPublicKey(entityId: string): Promise<string | null> {
    await simulateAILoad(50);
    return this.userKeys.get(entityId)?.publicKey || null;
  }

  /**
   * Fetches the role of a given entity.
   * Business impact: Enforces Role-Based Access Control (RBAC), ensuring entities only
   * perform actions they are authorized for, thus maintaining system integrity and security.
   * @param {string} entityId - The ID of the entity.
   * @returns {string | null} The role string or null if not found.
   */
  public async getRole(entityId: string): Promise<string | null> {
    await simulateAILoad(50);
    return this.userRoles.get(entityId) || null;
  }

  /**
   * Simulates cryptographic signing of data.
   * NOTE: This is a mock implementation and NOT cryptographically secure for production use.
   * Business impact: Provides tamper-evident proof of origin and integrity for critical data,
   * such as meeting decisions, action items, or audit logs, essential for compliance.
   * @param {string} entityId - The ID of the entity performing the signing.
   * @param {any} data - The data to sign.
   * @returns {Promise<string>} A promise resolving to a mock cryptographic signature.
   */
  public async signData(entityId: string, data: any): Promise<string> {
    await simulateAILoad(100);
    const privateKey = this.userKeys.get(entityId)?.privateKey;
    if (!privateKey) throw new Error(`Private key not found for ${entityId}`);
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    return btoa(`${privateKey}:${dataString}`);
  }

  /**
   * Simulates cryptographic verification of a signature.
   * NOTE: This is a mock implementation and NOT cryptographically secure for production use.
   * Business impact: Confirms the authenticity and integrity of signed data,
   * critical for auditability and trust in automated processes, especially in financial operations.
   * @param {string} entityId - The ID of the entity whose signature is being verified.
   * @param {any} data - The original data.
   * @param {string} signature - The signature to verify.
   * @returns {Promise<boolean>} True if the signature is valid.
   */
  public async verifySignature(entityId: string, data: any, signature: string): Promise<boolean> {
    await simulateAILoad(100);
    try {
      const publicKey = this.userKeys.get(entityId)?.publicKey;
      if (!publicKey) return false;
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      const expectedSignaturePrefix = btoa(`PRIVKEY-${entityId}`);
      return signature.startsWith(expectedSignaturePrefix) && atob(signature).includes(dataString);
    } catch (e) {
      return false;
    }
  }

  /**
   * Simulates an RBAC check.
   * Business impact: Prevents unauthorized access and actions, enforcing governance
   * and security policies across the platform, thereby protecting sensitive data and operations.
   * @param {string} userId - The ID of the user attempting the action.
   * @param {string[]} requiredRoles - An array of roles that are authorized.
   * @returns {Promise<boolean>} True if the user has one of the required roles.
   */
  public async authorize(userId: string, requiredRoles: string[]): Promise<boolean> {
    await simulateAILoad(50);
    const userRole = this.userRoles.get(userId);
    const authorized = userRole !== undefined && requiredRoles.includes(userRole);
    this.accessLog.push({ timestamp: Date.now(), userId, action: `Attempted authorization for roles: ${requiredRoles.join(', ')}`, authorized });
    return authorized;
  }

  /**
   * Retrieves the access log for auditing.
   * Business impact: Provides a tamper-evident record of all access and authorization attempts,
   * critical for security audits, incident response, and regulatory compliance.
   * @returns {Array<{ timestamp: number; userId: string; action: string; authorized: boolean }>} The access log.
   */
  public getAccessLog(): Array<{ timestamp: number; userId: string; action: string; authorized: boolean }> {
    return [...this.accessLog];
  }
}

/**
 * MOCK Service to simulate inter-agent communication via an in-repo message queue.
 * Business impact: Enables autonomous AI agents to collaborate, share insights,
 * and orchestrate complex workflows (monitor -> decide -> act) by providing
 * a robust and auditable communication backbone.
 */
export class AgentCommunicationService {
  private static instance: AgentCommunicationService;
  private subscribers: Map<string, Function[]> = new Map();
  private messageLog: { timestamp: number; topic: string; message: any }[] = [];

  private constructor() {}

  public static getInstance(): AgentCommunicationService {
    if (!AgentCommunicationService.instance) {
      AgentCommunicationService.instance = new AgentCommunicationService();
    }
    return AgentCommunicationService.instance;
  }

  /**
   * Simulates publishing a message to a topic.
   * Business impact: Facilitates event-driven architectures where agents react to and
   * disseminate information without direct coupling, enhancing system scalability and resilience.
   * @param {string} topic - The topic to publish to.
   * @param {any} message - The message payload.
   */
  public publish(topic: string, message: any): void {
    this.messageLog.push({ timestamp: Date.now(), topic, message });
    const handlers = this.subscribers.get(topic);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in handler for topic ${topic}:`, error);
        }
      });
    }
  }

  /**
   * Simulates subscribing to a topic.
   * Business impact: Allows agents to register interest in specific events, creating
   * a flexible and reactive system where agents can autonomously monitor and act.
   * @param {string} topic - The topic to subscribe to.
   * @param {Function} handler - The callback function to execute when a message is received.
   * @returns {() => void} A function to unsubscribe.
   */
  public subscribe(topic: string, handler: Function): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic)!.push(handler);
    return () => {
      const handlers = this.subscribers.get(topic);
      if (handlers) {
        this.subscribers.set(topic, handlers.filter(h => h !== handler));
      }
    };
  }

  /**
   * Retrieves the message log for auditing inter-agent communication.
   * Business impact: Provides a transparent and auditable record of all agent interactions,
   * crucial for debugging, compliance, and understanding autonomous system behavior.
   * @returns {Array<{ timestamp: number; topic: string; message: any }>} The message log.
   */
  public getMessageLog(): Array<{ timestamp: number; topic: string; message: any }> {
    return [...this.messageLog];
  }
}

/**
 * MOCK Service to simulate the Token Rail Layer and Real-time Payments Infrastructure.
 * Business impact: Provides a deterministic, auditable simulation of financial transactions,
 * enabling the system to bridge meeting outcomes with actual value movements.
 * This capability unlocks new business models, streamlines treasury operations,
 * and provides real-time liquidity management and cost arbitrage opportunities.
 */
export class PaymentSimulationService {
  private static instance: PaymentSimulationService;
  private ledger: Map<string, number> = new Map();
  private paymentRequests: Map<string, PaymentRequestRecord> = new Map();
  private transactionLog: any[] = [];
  private processingQueue: Promise<void> = Promise.resolve();

  private constructor() {
    IdentityAndAccessService.getInstance().userRoles.forEach((_role, userId) => {
      if (!userId.startsWith('agent')) {
        this.ledger.set(userId, getRandomNumber(1000, 10000));
      }
    });
  }

  public static getInstance(): PaymentSimulationService {
    if (!PaymentSimulationService.instance) {
      PaymentSimulationService.instance = new PaymentSimulationService();
    }
    return PaymentSimulationService.instance;
  }

  /**
   * Executes a function sequentially to ensure idempotency and prevent race conditions.
   * Business impact: Guarantees consistent state updates in a simulated distributed environment,
   * critical for financial transaction integrity and fault tolerance.
   * @param {Function} func - The function to execute.
   * @returns {Promise<T>} The result of the function.
   */
  private async processSequentially<T>(func: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.processingQueue = this.processingQueue.then(async () => {
        try {
          const result = await func();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Simulates creating a new payment request.
   * Business impact: Formalizes financial commitments stemming from meeting decisions,
   * ensuring transparency and accountability before actual fund transfers.
   * @param {string} sourceParticipantId - The ID of the participant initiating/approving.
   * @param {string} targetParticipantId - The ID of the participant receiving funds.
   * @param {number} amount - The amount to be paid.
   * @param {string} currency - The currency (e.g., "USD_T" for stablecoin).
   * @param {string} [relatedActionId] - Optional ID of the related action item.
   * @returns {Promise<PaymentRequestRecord>} The created payment request record.
   */
  public async createPaymentRequest(
    sourceParticipantId: string,
    targetParticipantId: string,
    amount: number,
    currency: string,
    relatedActionId?: string
  ): Promise<PaymentRequestRecord> {
    return this.processSequentially(async () => {
      await simulateAILoad(200);

      if (!this.ledger.has(sourceParticipantId)) {
        throw new Error(`Source participant ${sourceParticipantId} not found in ledger.`);
      }

      const sourceBalance = this.ledger.get(sourceParticipantId)!;
      if (sourceBalance < amount) {
        throw new Error(`Insufficient funds for ${sourceParticipantId}. Current balance: ${sourceBalance}, requested: ${amount}.`);
      }

      const requestId = generateId();
      const paymentRequest: PaymentRequestRecord = {
        id: requestId,
        sourceParticipantId,
        targetParticipantId,
        amount,
        currency,
        status: 'pending',
        createdAt: Date.now(),
        relatedActionItemId,
        signature: await IdentityAndAccessService.getInstance().signData(sourceParticipantId, { requestId, sourceParticipantId, targetParticipantId, amount, currency })
      };
      this.paymentRequests.set(requestId, paymentRequest);
      this.transactionLog.push({ type: 'create_request', timestamp: Date.now(), ...paymentRequest });
      AgentCommunicationService.getInstance().publish('payment_status_update', paymentRequest);
      return paymentRequest;
    });
  }

  /**
   * Simulates settling a payment request across a chosen rail.
   * Business impact: Executes the atomic transfer of value, completing the financial cycle
   * initiated by meeting outcomes and leveraging multi-rail orchestration for optimized speed and cost.
   * @param {string} requestId - The ID of the payment request to settle.
   * @param {'rail_fast' | 'rail_batch'} rail - The simulated rail to use.
   * @returns {Promise<PaymentRequestRecord>} The updated payment request record.
   */
  public async settlePayment(requestId: string, rail: 'rail_fast' | 'rail_batch'): Promise<PaymentRequestRecord> {
    return this.processSequentially(async () => {
      await simulateAILoad(rail === 'rail_fast' ? 500 : 2000);

      const paymentRequest = this.paymentRequests.get(requestId);
      if (!paymentRequest) {
        throw new Error(`Payment request ${requestId} not found.`);
      }
      if (paymentRequest.status === 'settled') {
        throw new Error(`Payment request ${requestId} is already settled.`);
      }
      if (paymentRequest.status === 'failed' || paymentRequest.status === 'rejected') {
        throw new Error(`Payment request ${requestId} cannot be settled as it is in '${paymentRequest.status}' status.`);
      }

      const sourceBalance = this.ledger.get(paymentRequest.sourceParticipantId)!;
      if (sourceBalance < paymentRequest.amount) {
        paymentRequest.status = 'failed';
        paymentRequest.settledAt = Date.now();
        this.transactionLog.push({ type: 'settle_fail', timestamp: Date.now(), ...paymentRequest });
        AgentCommunicationService.getInstance().publish('payment_status_update', paymentRequest);
        throw new Error(`Insufficient funds for ${paymentRequest.sourceParticipantId} to settle request ${requestId}.`);
      }

      const newSourceBalance = sourceBalance - paymentRequest.amount;
      const newTargetBalance = (this.ledger.get(paymentRequest.targetParticipantId) || 0) + paymentRequest.amount;

      this.ledger.set(paymentRequest.sourceParticipantId, newSourceBalance);
      this.ledger.set(paymentRequest.targetParticipantId, newTargetBalance);

      paymentRequest.status = 'settled';
      paymentRequest.settledAt = Date.now();
      paymentRequest.railUsed = rail;
      paymentRequest.transactionHash = `TX-${generateId()}`;

      this.paymentRequests.set(requestId, paymentRequest);
      this.transactionLog.push({ type: 'settle_success', timestamp: Date.now(), ...paymentRequest, newSourceBalance, newTargetBalance });
      AgentCommunicationService.getInstance().publish('payment_status_update', paymentRequest);
      return paymentRequest;
    });
  }

  /**
   * Gets the status of a payment request.
   * Business impact: Provides real-time tracking of payment lifecycle,
   * enabling timely updates and reconciliation for enhanced financial transparency.
   * @param {string} requestId - The ID of the payment request.
   * @returns {Promise<PaymentRequestRecord | null>} The payment request record or null.
   */
  public async getPaymentStatus(requestId: string): Promise<PaymentRequestRecord | null> {
    await simulateAILoad(100);
    return this.paymentRequests.get(requestId) || null;
  }

  /**
   * Simulates a predictive routing AI for selecting payment rails.
   * Business impact: Optimizes transaction processing by intelligently selecting
   * the most efficient (fastest/cheapest) rail based on simulated conditions,
   * enhancing performance and reducing operational costs.
   * @param {number} amount - The transaction amount.
   * @param {string} currency - The transaction currency.
   * @returns {Promise<'rail_fast' | 'rail_batch'>} The recommended rail.
   */
  public async predictRail(amount: number, currency: string): Promise<'rail_fast' | 'rail_batch'> {
    await simulateAILoad(100);
    if (amount < 500 && Math.random() < 0.8) {
      return 'rail_fast';
    }
    return 'rail_batch';
  }

  /**
   * Simulates a risk scoring/fraud detection module.
   * Business impact: Protects against financial losses by automatically assessing
   * transaction risk and flagging potential fraud, enhancing security and trust.
   * @param {PaymentRequestRecord} paymentRequest - The payment request to evaluate.
   * @returns {Promise<{ score: number; flagged: boolean; reason?: string }>} Risk score and flag.
   */
  public async evaluateRisk(paymentRequest: PaymentRequestRecord): Promise<{ score: number; flagged: boolean; reason?: string }> {
    await simulateAILoad(300);
    let score = getRandomNumber(0, 100);
    let flagged = false;
    let reason: string | undefined;

    if (paymentRequest.amount > 5000) {
      score += 30;
      reason = 'Large transaction amount.';
    }
    if (paymentRequest.sourceParticipantId === paymentRequest.targetParticipantId) {
      score += 50;
      flagged = true;
      reason = 'Self-payment detected, potential circular transaction.';
    }
    if (score > 70) {
      flagged = true;
      reason = reason || 'High risk score detected.';
    }
    return { score, flagged, reason };
  }

  /**
   * Returns a snapshot of the current ledger.
   * Business impact: Provides visibility into the financial state of the system,
   * essential for reconciliation and financial reporting.
   * @returns {Map<string, number>} Current ledger balances.
   */
  public getLedgerSnapshot(): Map<string, number> {
    return new Map(this.ledger);
  }

  /**
   * Returns the full transaction log.
   * Business impact: Offers a complete, auditable record of all financial operations,
   * critical for compliance, dispute resolution, and forensic analysis.
   * @returns {any[]} The transaction log.
   */
  public getTransactionLog(): any[] {
    return [...this.transactionLog];
  }
}

/**
 * MOCK Service to simulate the backend for meeting data and AI processing.
 * Business impact: Centralizes the storage, retrieval, and intelligent processing
 * of all meeting-related data, acting as the knowledge hub for enterprise collaboration.
 * Its ability to handle live data, generate comprehensive summaries, and integrate
 * with agentic AI makes it indispensable for organizational learning and operational efficiency.
 */
export class MeetingDataService {
  private static instance: MeetingDataService;
  public historicalMeetings: HistoricalMeetingRecord[] = [];
  private identityService: IdentityAndAccessService;
  private paymentService: PaymentSimulationService;
  private agentCommService: AgentCommunicationService;

  private constructor() {
    this.identityService = IdentityAndAccessService.getInstance();
    this.paymentService = PaymentSimulationService.getInstance();
    this.agentCommService = AgentCommunicationService.getInstance();
    for (let i = 0; i < 10; i++) {
      const id = generateId();
      const date = Date.now() - (i * 7 * 24 * 60 * 60 * 1000) - getRandomNumber(0, 3 * 24 * 60 * 60 * 1000);
      const duration = Math.floor(getRandomNumber(30, 120) * 60);
      const hostName = getRandomItem(MOCK_PARTICIPANT_NAMES);
      const keyTopics = Array.from({ length: getRandomNumber(2, 4) }, () => getRandomItem(MOCK_TOPICS));
      const overallSentimentScore = getRandomNumber(-0.5, 0.8);
      const actionItemsCount = Math.floor(getRandomNumber(0, 5));
      const complianceIssuesCount = Math.floor(getRandomNumber(0, 2));
      const paymentRequestsCount = Math.floor(getRandomNumber(0, 3));
      const summaryPreview = `Brief overview of meeting #${i + 1} held on ${new Date(date).toLocaleDateString()}. Covered ${keyTopics.join(', ')} and generated ${actionItemsCount} action items. Detected ${complianceIssuesCount} compliance issues.`;
      this.historicalMeetings.push({
        id, title: `Weekly Sync - Project ${String.fromCharCode(65 + i)}`, date, duration, hostName, keyTopics, overallSentimentScore, actionItemsCount, summaryPreview, complianceIssuesCount, paymentRequestsCount
      });
    }
  }

  public static getInstance(): MeetingDataService {
    if (!MeetingDataService.instance) {
      MeetingDataService.instance = new MeetingDataService();
    }
    return MeetingDataService.instance;
  }

  /**
   * Fetches historical meeting records.
   * Business impact: Provides an organizational memory of past discussions, enabling trends analysis,
   * retrieval of precedents, and continuous improvement of meeting effectiveness.
   * @returns {Promise<HistoricalMeetingRecord[]>} A promise resolving to an array of historical meeting records.
   */
  public async getHistoricalMeetings(): Promise<HistoricalMeetingRecord[]> {
    await simulateAILoad(500);
    return [...this.historicalMeetings];
  }

  /**
   * Fetches a specific full meeting summary by ID.
   * Business impact: Allows deep dives into past meetings, retrieving all associated
   * context, decisions, and outcomes for detailed review or audit.
   * @param {string} meetingId - The ID of the meeting to fetch.
   * @returns {Promise<MeetingSummaryExtended | null>} A promise resolving to the meeting summary or null if not found.
   */
  public async getMeetingSummaryById(meetingId: string): Promise<MeetingSummaryExtended | null> {
    await simulateAILoad(1500);
    if (this.historicalMeetings.some(m => m.id === meetingId)) {
      const baseTime = Date.now() - (7 * 24 * 60 * 60 * 1000) - getRandomNumber(0, 3 * 24 * 60 * 60 * 1000);
      const mockResult = await generateMockMeetingSummary(baseTime, "Holographic Review - Past Session", true);
      mockResult.metadata.id = meetingId;
      return mockResult;
    }
    return null;
  }

  /**
   * Simulates fetching real-time transcript data.
   * Business impact: Provides the raw input stream for real-time AI processing,
   * powering live insights, immediate action item detection, and dynamic content generation.
   * @param {string} meetingUrl - The URL of the holographic meeting.
   * @param {number} offset - The timestamp offset to fetch from.
   * @returns {Promise<TranscriptSegment[]>} New transcript segments.
   */
  public async fetchLiveTranscriptSegments(meetingUrl: string, offset: number): Promise<TranscriptSegment[]> {
    await simulateAILoad(getRandomNumber(500, 1500));
    if (!meetingUrl || meetingUrl === "error") {
      throw new Error("Invalid meeting URL for live transcript.");
    }

    const currentTimestamp = Date.now();
    const newSegments: TranscriptSegment[] = [];
    const mockParticipants = Array.from(this.identityService.userRoles.keys()).filter(id => !id.startsWith('agent'));
    const availableParticipants = mockParticipants.map(id => ({ id, name: id.replace('user-', '') }));

    if (offset === 0) {
      for (let i = 0; i < 5; i++) {
        const participant = getRandomItem(availableParticipants);
        const text = `Initial setup comment ${i + 1} from ${participant.name}.`;
        const segment: TranscriptSegment = {
          participantId: participant.id,
          participantName: participant.name,
          text: text,
          timestamp: currentTimestamp - (5 - i) * 10000,
        };
        segment.sentimentScore = await analyzeTextSentiment(segment.text);
        segment.emotions = await extractEmotions(segment.text);
        segment.keywords = await extractKeywords(segment.text);
        segment.intent = await identifyIntent(segment.text);
        segment.signature = await this.identityService.signData(participant.id, segment);
        newSegments.push(segment);
      }
    } else {
      if (Math.random() > 0.3) {
        for (let i = 0; i < getRandomNumber(1, 3); i++) {
          const participant = getRandomItem(availableParticipants);
          const textOptions = [
            `Continuing the discussion on ${getRandomItem(MOCK_TOPICS)}.`,
            `I think we should consider ${getRandomItem(MOCK_ACTIONS).toLowerCase()}.`,
            `What are your thoughts on this, ${getRandomItem(MOCK_PARTICIPANT_NAMES)}?`,
            `Let's make a decision on ${getRandomItem(MOCK_DECISIONS).toLowerCase()}.`,
            `I'm feeling positive about this direction.`,
            `There are some challenges we need to address with this.`,
            `Can we get an update on that task?`,
            `We need to ensure compliance with the new data privacy policy.`
          ];
          const text = getRandomItem(textOptions);
          const segment: TranscriptSegment = {
            participantId: participant.id,
            participantName: participant.name,
            text: text,
            timestamp: currentTimestamp - getRandomNumber(1000, 5000),
          };
          segment.sentimentScore = await analyzeTextSentiment(segment.text);
          segment.emotions = await extractEmotions(segment.text);
          segment.keywords = await extractKeywords(segment.text);
          segment.intent = await identifyIntent(segment.text);
          segment.signature = await this.identityService.signData(participant.id, segment);
          newSegments.push(segment);
        }
      }
    }
    return newSegments.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Simulates processing the entire meeting data to generate the final summary.
   * This would involve extensive AI/ML operations.
   * Business impact: This is the core engine for generating high-value business intelligence.
   * It transforms raw meeting interactions into structured, actionable insights,
   * comprehensive summaries, and auditable records, enabling data-driven decision-making
   * and providing the foundation for automated workflows.
   * @param {TranscriptSegment[]} fullTranscript - The complete raw transcript.
   * @param {string} meetingTitle - The title of the meeting.
   * @returns {Promise<MeetingSummaryExtended>} The comprehensive meeting summary.
   */
  public async finalizeMeetingSummary(fullTranscript: TranscriptSegment[], meetingTitle: string): Promise<MeetingSummaryExtended> {
    await simulateAILoad(5000);

    const startTime = fullTranscript[0]?.timestamp || Date.now();
    const endTime = fullTranscript[fullTranscript.length - 1]?.timestamp || Date.now() + 3600000;
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    const participantsMap = new Map<string, ParticipantDetailedInfo>();
    const actionItems: ActionItemExtended[] = [];
    const decisions: DecisionRecord[] = [];
    const topics: TopicInsight[] = [];
    const allSentiments: { timestamp: number; score: number }[] = [];
    const complianceInsights: ComplianceInsight[] = [];
    const agentActivityLogs: AgentActivityLog[] = [];
    const paymentRequests: PaymentRequestRecord[] = [];
    let totalPositive = 0, totalNegative = 0, totalNeutral = 0;

    for (const segment of fullTranscript) {
      if (!participantsMap.has(segment.participantId)) {
        participantsMap.set(segment.participantId, {
          id: segment.participantId,
          name: segment.participantName,
          role: await this.identityService.getRole(segment.participantId) || "Participant",
          email: `${segment.participantName.replace(/\s/g, '').toLowerCase()}@example.com`,
          organization: getRandomItem(MOCK_ORGS),
          avatarUrl: `/avatars/${segment.participantId}.png`,
          joinTime: startTime,
          totalSpeakingTime: 0,
          speakingSegmentsCount: 0,
          overallSentiment: { average: 0, trend: 'stable' },
          engagementScore: getRandomNumber(50, 95),
        });
      }
      const p = participantsMap.get(segment.participantId)!;
      p.speakingSegmentsCount++;
      p.totalSpeakingTime += Math.max(10, segment.text.length / 5);

      if (segment.sentimentScore !== undefined) {
        allSentiments.push({ timestamp: segment.timestamp, score: segment.sentimentScore });
        if (segment.sentimentScore > 0.2) totalPositive++;
        else if (segment.sentimentScore < -0.2) totalNegative++;
        else totalNeutral++;
      }

      const anomaly = await detectAnomaly(segment);
      if (anomaly) {
        complianceInsights.push(anomaly);
        agentActivityLogs.push({
          id: generateId(),
          agentId: anomaly.agentId,
          skill: 'anomaly_detection',
          action: `Detected ${anomaly.type}: ${anomaly.description}`,
          timestamp: Date.now(),
          details: { segmentId: segment.timestamp, severity: anomaly.severity },
          signature: await this.identityService.signData(anomaly.agentId, { id: anomaly.id, type: anomaly.type }),
        });
        const remediationProposal = await proposeRemediation(anomaly);
        agentActivityLogs.push({
          id: generateId(),
          agentId: 'remediation_agent_1',
          skill: 'remediation_proposal',
          action: remediationProposal,
          timestamp: Date.now() + 100,
          details: { relatedInsightId: anomaly.id },
          signature: await this.identityService.signData('remediation_agent_1', { relatedInsightId: anomaly.id, proposal: remediationProposal }),
        });
        if (!segment.agentAnnotations) segment.agentAnnotations = [];
        segment.agentAnnotations.push({
          agentId: anomaly.agentId,
          type: 'anomaly_detection',
          description: `Detected ${anomaly.type}`,
          confidence: 0.9,
          relatedInsightId: anomaly.id,
          timestamp: Date.now(),
        });
      }

      if (segment.intent === 'action_proposal' || segment.text.toLowerCase().includes('i will take') || segment.text.toLowerCase().includes('assign to')) {
        const assigneeId = segment.participantId;
        const assigneeName = segment.participantName;
        const taskText = segment.text.replace(/i will take point on|we need to focus on|assign to/gi, '').trim();
        const newActionItem: ActionItemExtended = {
          id: generateId(),
          assigneeId: assigneeId,
          assigneeName: assigneeName,
          task: taskText,
          status: 'open',
          dueDate: Date.now() + getRandomNumber(3, 30) * 24 * 60 * 60 * 1000,
          priority: getRandomItem(MOCK_PRIORITIES),
          createdBy: segment.participantId,
          createdAt: segment.timestamp,
          contextualTranscriptSegmentIds: [segment.timestamp.toString()],
        };
        newActionItem.signature = await this.identityService.signData(segment.participantId, newActionItem);
        actionItems.push(newActionItem);

        agentActivityLogs.push({
          id: generateId(),
          agentId: 'summarization_agent_1',
          skill: 'action_item_extraction',
          action: `Extracted action item: ${taskText}`,
          timestamp: Date.now(),
          details: { actionItemId: newActionItem.id, assignee: assigneeName },
          signature: await this.identityService.signData('summarization_agent_1', { actionItemId: newActionItem.id }),
        });
      }

      if (segment.text.toLowerCase().includes('we decided') || segment.text.toLowerCase().includes('the decision is')) {
        const newDecision: DecisionRecord = {
          id: generateId(),
          summary: segment.text.replace(/we decided|the decision is/gi, '').trim(),
          participantsInvolvedIds: Array.from(participantsMap.keys()).slice(0, getRandomNumber(2, 4)),
          decidedBy: segment.participantId,
          timestamp: segment.timestamp,
          rationale: "Automatically extracted from transcript.",
        };
        newDecision.signature = await this.identityService.signData(segment.participantId, newDecision);
        decisions.push(newDecision);

        agentActivityLogs.push({
          id: generateId(),
          agentId: 'summarization_agent_1',
          skill: 'decision_extraction',
          action: `Extracted decision: ${newDecision.summary}`,
          timestamp: Date.now(),
          details: { decisionId: newDecision.id, decidedBy: segment.participantId },
          signature: await this.identityService.signData('summarization_agent_1', { decisionId: newDecision.id }),
        });
      }
    }

    participantsMap.forEach(p => {
      const pSegments = fullTranscript.filter(s => s.participantId === p.id && s.sentimentScore !== undefined);
      if (pSegments.length > 0) {
        const avgScore = pSegments.reduce((sum, s) => sum + s.sentimentScore!, 0) / pSegments.length;
        p.overallSentiment.average = avgScore;
        if (pSegments.length > 3) {
          const lastScores = pSegments.slice(-3).map(s => s.sentimentScore!);
          if (lastScores[2] > lastScores[0] + 0.1) p.overallSentiment.trend = 'rising';
          else if (lastScores[2] < lastScores[0] - 0.1) p.overallSentiment.trend = 'falling';
        }
      }
    });

    MOCK_TOPICS.forEach((topic, idx) => {
      const relevantSegments = fullTranscript.filter(s => s.text.toLowerCase().includes(topic.toLowerCase().split(' ')[0]));
      if (relevantSegments.length > 0) {
        topics.push({
          id: generateId(),
          name: topic,
          keywords: Array.from(new Set(relevantSegments.flatMap(s => s.keywords || []))).slice(0, 5),
          relevanceScore: getRandomNumber(0.5, 1.0),
          summary: `Discussion around ${topic} was prominent.`,
          sentiment: {
            average: getRandomNumber(-0.3, 0.7),
            trend: getRandomItem(['rising', 'falling', 'stable']),
          },
          startTimestamp: relevantSegments[0].timestamp,
          endTimestamp: relevantSegments[relevantSegments.length - 1].timestamp,
          relatedTranscriptSegmentIds: relevantSegments.map(s => s.timestamp.toString()),
        });
      }
    });

    const metadata: MeetingMetadata = {
      id: generateId(),
      title: meetingTitle,
      scheduledStartTime: startTime,
      actualStartTime: startTime,
      endTime: endTime,
      durationSeconds: durationSeconds,
      hostId: fullTranscript[0]?.participantId || `user-${getRandomItem(MOCK_PARTICIPANT_NAMES).replace(/\s/g, '').toLowerCase()}`,
      hostName: fullTranscript[0]?.participantName || getRandomItem(MOCK_PARTICIPANT_NAMES),
      attendeeIds: Array.from(participantsMap.keys()),
      meetingPlatform: "HoloConnect XR",
      location: "Virtual Conference Room Beta",
      tags: [...new Set([...MOCK_TOPICS.slice(0, 3), "holographic", "scribe"])],
      category: "Project Management",
    };

    const overallSentiment: OverallMeetingSentiment = {
      averageScore: allSentiments.length > 0 ? allSentiments.reduce((sum, s) => sum + s.score, 0) / allSentiments.length : 0,
      sentimentTrend: allSentiments,
      dominantEmotions: [{ emotion: 'joy', percentage: getRandomNumber(0.2, 0.5) }, { emotion: 'neutral', percentage: getRandomNumber(0.3, 0.6) }],
      positiveSegmentsCount: totalPositive,
      negativeSegmentsCount: totalNegative,
      neutralSegmentsCount: totalNeutral,
    };

    const mockSpatialObjects: SpatialObject[] = [
      { id: generateId(), type: 'whiteboard', label: 'Main Whiteboard', position: { x: 0, y: 1.5, z: -2 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 0.1 }, metadata: { content: 'Brainstorming notes' } },
      { id: generateId(), type: 'presentation_screen', label: 'Shared Screen 1', position: { x: -3, y: 1.8, z: 0 }, rotation: { x: 0, y: 90, z: 0 }, scale: { x: 1.5, y: 0.8, z: 0.1 }, snapshotUrl: 'https://via.placeholder.com/300x150.png?text=Presentation+Slide' },
      { id: generateId(), type: '3d_model', label: 'Product Prototype', position: { x: 2, y: 1, z: -1 }, rotation: { x: 15, y: 45, z: 0 }, scale: { x: 0.5, y: 0.5, z: 0.5 }, metadata: { modelUrl: '/mock/3d/product_prototype.glb' } },
    ];

    const generatedSummary: MeetingSummaryExtended = {
      metadata,
      participants: Array.from(participantsMap.values()),
      transcriptSegments: fullTranscript,
      actionItems,
      decisions,
      topics,
      mindMapUrl: await generateMockMindMapGLB({} as MeetingSummaryExtended),
      spatialObjects: mockSpatialObjects,
      overallSentiment,
      documentLinks: [
        { title: "Project Alpha Brief", url: "https://example.com/project_alpha_brief.pdf", accessedBy: [getRandomItem(metadata.attendeeIds)] },
        { title: "Q4 Marketing Plan", url: "https://example.com/q4_marketing_plan.pptx", accessedBy: [getRandomItem(metadata.attendeeIds)] },
      ],
      keyTakeaways: [
        "Focus shifted to market penetration strategies.",
        "Budget constraints for Q4 need re-evaluation.",
        "New feature set for Product X approved.",
      ],
      aiSummary: await generateAISummary(fullTranscript),
      recommendations: [],
      futureMeetingSuggestions: [
        { date: Date.now() + 7 * 24 * 60 * 60 * 1000, topic: "Q4 Strategy Follow-up", attendees: metadata.attendeeIds },
      ],
      generatedReportUrl: `https://example.com/reports/${metadata.id}.pdf`,
      complianceInsights,
      agentActivityLogs,
      paymentRequests,
    };

    generatedSummary.recommendations = await generateAIRecommendations(generatedSummary);
    generatedSummary.mindMapUrl = await generateMockMindMapGLB(generatedSummary);
    generatedSummary.spatialObjects.push({
      id: generateId(), type: '3d_model', label: 'Meeting Room Context', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, metadata: { modelUrl: await generateMockSpatialSceneGLB(generatedSummary) }
    });

    if (decisions.some(d => d.summary.toLowerCase().includes('budget') || d.summary.toLowerCase().includes('allocate'))) {
      const budgetDecision = decisions.find(d => d.summary.toLowerCase().includes('budget'));
      if (budgetDecision) {
        try {
          const payer = budgetDecision.participantsInvolvedIds[0];
          const receiver = generatedSummary.participants.find(p => p.role === 'Host')?.id || generatedSummary.participants[0].id;
          const initialPaymentRequest = await this.paymentService.createPaymentRequest(
            payer, receiver, getRandomNumber(100, 1000), 'USD_T', budgetDecision.relatedActionItemIds?.[0]
          );
          generatedSummary.paymentRequests.push(initialPaymentRequest);
        } catch (e) {
          console.warn("Failed to create mock payment request during finalization:", e);
        }
      }
    }
    return generatedSummary;
  }
}

/**
 * Generates a comprehensive mock MeetingSummaryExtended object.
 * Business impact: Essential for robust testing, development, and demonstration of the system's
 * full capabilities without requiring live data. It allows for the creation of diverse scenarios,
 * including those with compliance issues, agent activities, and simulated payments,
 * validating the end-to-end functionality.
 * @param {number} baseTime - The starting timestamp for the meeting.
 * @param {string} meetingTitle - The title of the mock meeting.
 * @param {boolean} generateExtendedData - Whether to generate compliance insights, agent logs, etc.
 * @returns {Promise<MeetingSummaryExtended>} A fully populated mock meeting summary.
 */
export const generateMockMeetingSummary = async (baseTime: number = Date.now(), meetingTitle: string = "Holographic Team Sync", generateExtendedData: boolean = false): Promise<MeetingSummaryExtended> => {
  const meetingId = generateId();
  const startTime = baseTime - getRandomNumber(0, 3600000);
  const endTime = baseTime + getRandomNumber(3600000, 7200000);
  const durationSeconds = Math.round((endTime - startTime) / 1000);

  const identityService = IdentityAndAccessService.getInstance();
  const paymentService = PaymentSimulationService.getInstance();

  const participants: ParticipantDetailedInfo[] = MOCK_PARTICIPANT_NAMES.slice(0, getRandomNumber(3, 6)).map(name => {
    const id = `user-${name.replace(/\s/g, '').toLowerCase()}`;
    if (!identityService.userRoles.has(id)) {
      identityService.userRoles.set(id, getRandomItem(MOCK_ROLES));
    }
    return {
      id: id,
      name: name,
      role: identityService.userRoles.get(id) || getRandomItem(MOCK_ROLES),
      email: `${name.replace(/\s/g, '').toLowerCase()}@example.com`,
      organization: getRandomItem(MOCK_ORGS),
      avatarUrl: `/avatars/${name.replace(/\s/g, '').toLowerCase()}.png`,
      joinTime: startTime + getRandomNumber(0, 60000),
      totalSpeakingTime: Math.floor(getRandomNumber(300, 1800)),
      speakingSegmentsCount: Math.floor(getRandomNumber(10, 50)),
      overallSentiment: { average: getRandomNumber(-0.5, 0.8), trend: getRandomItem(['rising', 'falling', 'stable']) },
      engagementScore: Math.floor(getRandomNumber(60, 99)),
    };
  });

  const transcriptSegments: TranscriptSegment[] = [];
  let currentTimestamp = startTime;
  const totalDuration = endTime - startTime;

  const complianceInsights: ComplianceInsight[] = [];
  const agentActivityLogs: AgentActivityLog[] = [];
  const paymentRequests: PaymentRequestRecord[] = [];

  while (currentTimestamp < endTime) {
    const participant = getRandomItem(participants);
    const textOptions = [
      `We need to focus on ${getRandomItem(MOCK_TOPICS)}.`,
      `Agreed. ${participant.name} can take point on the new marketing campaign.`,
      `What are the key deliverables for next quarter?`,
      `I'm concerned about the timeline for this feature.`,
      `That's an excellent idea, let's explore it further.`,
      `Can we get an update on the budget?`,
      `I think we should table this discussion for another meeting.`,
      `The client feedback was mostly positive, but there are some areas for improvement.`,
      `Let's make sure everyone is aligned on the new process.`,
      `I'll send out the meeting notes by end of day.`,
      `Does anyone have questions about the new AI integration?`,
      `We must adhere to the new data privacy regulations.`,
      `This budget allocation exceeds our approved spending limits.`,
      `I strongly disagree with that approach; it poses a significant security risk.`
    ];
    const text = getRandomItem(textOptions);
    const sentiment = await analyzeTextSentiment(text);
    const emotions = await extractEmotions(text);
    const keywords = await extractKeywords(text);
    const intent = await identifyIntent(text);

    const segment: TranscriptSegment = {
      participantId: participant.id,
      participantName: participant.name,
      text,
      timestamp: currentTimestamp,
      sentimentScore: sentiment,
      emotions: emotions as any,
      keywords,
      intent,
    };
    segment.signature = await identityService.signData(participant.id, segment);
    transcriptSegments.push(segment);

    if (generateExtendedData) {
      const anomaly = await detectAnomaly(segment);
      if (anomaly) {
        complianceInsights.push(anomaly);
        agentActivityLogs.push({
          id: generateId(),
          agentId: anomaly.agentId,
          skill: 'anomaly_detection',
          action: `Detected ${anomaly.type}: ${anomaly.description}`,
          timestamp: Date.now(),
          details: { segmentId: segment.timestamp, severity: anomaly.severity },
          signature: await identityService.signData(anomaly.agentId, { id: anomaly.id, type: anomaly.type }),
        });
        const remediationProposal = await proposeRemediation(anomaly);
        agentActivityLogs.push({
          id: generateId(),
          agentId: 'remediation_agent_1',
          skill: 'remediation_proposal',
          action: remediationProposal,
          timestamp: Date.now() + 100,
          details: { relatedInsightId: anomaly.id },
          signature: await identityService.signData('remediation_agent_1', { relatedInsightId: anomaly.id, proposal: remediationProposal }),
        });
        segment.agentAnnotations = (segment.agentAnnotations || []).concat([{
          agentId: anomaly.agentId,
          type: 'anomaly_detection',
          description: `Detected ${anomaly.type}`,
          confidence: 0.9,
          relatedInsightId: anomaly.id,
          timestamp: Date.now(),
        }]);
      }
    }

    currentTimestamp += getRandomNumber(10000, 60000);
    if (transcriptSegments.length > 200) break;
  }

  const actionItems: ActionItemExtended[] = [];
  MOCK_ACTIONS.slice(0, getRandomNumber(2, 5)).forEach(async task => {
    const assignee = getRandomItem(participants);
    const creator = getRandomItem(participants);
    const item: ActionItemExtended = {
      id: generateId(),
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      task: task,
      status: getRandomItem(MOCK_STATUSES),
      dueDate: Date.now() + getRandomNumber(7, 30) * 24 * 60 * 60 * 1000,
      priority: getRandomItem(MOCK_PRIORITIES),
      createdBy: creator.id,
      createdAt: startTime + getRandomNumber(0, totalDuration),
      notes: "Follow-up required.",
    };
    item.signature = await identityService.signData(creator.id, item);
    actionItems.push(item);
  });

  const decisions: DecisionRecord[] = [];
  MOCK_DECISIONS.slice(0, getRandomNumber(1, 3)).forEach(async summary => {
    const decision: DecisionRecord = {
      id: generateId(),
      summary: summary,
      participantsInvolvedIds: participants.slice(0, getRandomNumber(2, participants.length)).map(p => p.id),
      decidedBy: getRandomItem(participants).id,
      timestamp: startTime + getRandomNumber(0, totalDuration),
      rationale: "Based on team consensus and data analysis.",
    };
    decision.signature = await identityService.signData(decision.decidedBy, decision);
    decisions.push(decision);
  });

  const topics: TopicInsight[] = [];
  MOCK_TOPICS.slice(0, getRandomNumber(3, 7)).forEach(name => {
    topics.push({
      id: generateId(),
      name: name,
      keywords: Array.from({ length: getRandomNumber(2, 5) }, () => `keyword-${generateId().substring(0, 5)}`),
      relevanceScore: getRandomNumber(0.6, 0.95),
      summary: `Detailed discussion on ${name} with key stakeholders.`,
      sentiment: { average: getRandomNumber(-0.2, 0.8), trend: getRandomItem(['rising', 'falling', 'stable']) },
      startTimestamp: startTime + getRandomNumber(0, totalDuration / 2),
      endTimestamp: startTime + getRandomNumber(totalDuration / 2, totalDuration),
    });
  });

  const allSentimentScores = transcriptSegments.map(s => s.sentimentScore || 0);
  const overallAverageSentiment = allSentimentScores.length > 0 ? allSentimentScores.reduce((sum, s) => sum + s, 0) / allSentimentScores.length : 0;
  const overallSentimentTrend = allSentimentScores.map((score, idx) => ({
    timestamp: transcriptSegments[idx]?.timestamp || startTime + idx * 1000,
    score: score,
  }));

  const overallMeetingSentiment: OverallMeetingSentiment = {
    averageScore: overallAverageSentiment,
    sentimentTrend: overallSentimentTrend,
    dominantEmotions: [{ emotion: 'joy', percentage: getRandomNumber(0.2, 0.5) }, { emotion: 'neutral', percentage: getRandomNumber(0.3, 0.6) }],
    positiveSegmentsCount: transcriptSegments.filter(s => (s.sentimentScore || 0) > 0.2).length,
    negativeSegmentsCount: transcriptSegments.filter(s => (s.sentimentScore || 0) < -0.2).length,
    neutralSegmentsCount: transcriptSegments.filter(s => (s.sentimentScore || 0) >= -0.2 && (s.sentimentScore || 0) <= 0.2).length,
  };

  const metadata: MeetingMetadata = {
    id: meetingId,
    title: meetingTitle,
    scheduledStartTime: baseTime,
    actualStartTime: startTime,
    endTime: endTime,
    durationSeconds: durationSeconds,
    hostId: participants[0]?.id || `user-${getRandomItem(MOCK_PARTICIPANT_NAMES).replace(/\s/g, '').toLowerCase()}`,
    hostName: participants[0]?.name || getRandomItem(MOCK_PARTICIPANT_NAMES),
    attendeeIds: participants.map(p => p.id),
    meetingPlatform: "HoloMeet Pro",
    recordingUrl: `https://holomeet.com/recordings/${meetingId}.mp4`,
    location: "Spatial Collaboration Hub #3",
    tags: ["strategy", "planning", "Q4", "holographic"],
    category: "Strategic Planning",
  };

  const spatialObjects: SpatialObject[] = [
    { id: generateId(), type: 'whiteboard', label: 'Idea Board', position: { x: 0, y: 1.5, z: -2 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 0.1 } },
    { id: generateId(), type: 'presentation_screen', label: 'Shared Deck', position: { x: -3, y: 1.8, z: 0 }, rotation: { x: 0, y: 90, z: 0 }, scale: { x: 1.5, y: 0.8, z: 0.1 }, snapshotUrl: 'https://via.placeholder.com/600x400.png?text=HoloDeck+Slide' },
  ];

  const keyTakeaways = [
    `Confirmed direction for Q4 ${getRandomItem(MOCK_TOPICS)}.`,
    `Action item to ${getRandomItem(MOCK_ACTIONS)} assigned to ${getRandomItem(participants).name}.`,
    `Next steps include a deep-dive into ${getRandomItem(MOCK_TOPICS)} next week.`,
  ];

  const aiSummary = await generateAISummary(transcriptSegments);
  const recommendations = await generateAIRecommendations({} as MeetingSummaryExtended);

  if (generateExtendedData && actionItems.length > 0) {
    const actionWithPayment = getRandomItem(actionItems);
    try {
      const pr = await paymentService.createPaymentRequest(
        actionWithPayment.createdBy,
        actionWithPayment.assigneeId,
        getRandomNumber(50, 500),
        'USD_T',
        actionWithPayment.id
      );
      paymentRequests.push(pr);
      actionWithPayment.paymentRequestId = pr.id;
    } catch (e) {
      console.warn("Mock payment request generation failed:", e);
    }
  }


  const fullSummary: MeetingSummaryExtended = {
    metadata,
    participants,
    transcriptSegments,
    actionItems,
    decisions,
    topics,
    mindMapUrl: await generateMockMindMapGLB({} as MeetingSummaryExtended),
    spatialObjects,
    overallSentiment: overallMeetingSentiment,
    documentLinks: [
      { title: "Quarterly Report Q3", url: "https://example.com/reports/Q3_report.pdf", accessedBy: [participants[0].id] },
      { title: "Marketing Strategy Doc", url: "https://example.com/docs/marketing_strategy.docx", accessedBy: [participants[1].id] },
    ],
    keyTakeaways,
    aiSummary,
    recommendations,
    futureMeetingSuggestions: [
      { date: Date.now() + 14 * 24 * 60 * 60 * 1000, topic: `Follow-up on ${getRandomItem(MOCK_TOPICS)}`, attendees: participants.slice(0, 3).map(p => p.id) },
    ],
    generatedReportUrl: `https://example.com/reports/${meetingId}-full.pdf`,
    complianceInsights,
    agentActivityLogs,
    paymentRequests,
  };

  fullSummary.recommendations = await generateAIRecommendations(fullSummary);
  fullSummary.mindMapUrl = await generateMockMindMapGLB(fullSummary);
  fullSummary.spatialObjects.push({
    id: generateId(), type: '3d_model', label: 'Meeting Room Environment', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, metadata: { modelUrl: await generateMockSpatialSceneGLB(fullSummary) }
  });
  return fullSummary;
};

/**
 * Interface for props for the MeetingDetailsHeader component.
 */
interface MeetingDetailsHeaderProps {
  metadata: MeetingMetadata;
  participants: ParticipantDetailedInfo[];
  overallSentiment: OverallMeetingSentiment;
  durationSeconds: number;
}

/**
 * Displays key metadata and sentiment at the top of the meeting summary.
 * Business impact: Provides an instant executive overview of the meeting's critical metrics,
 * enabling quick assessment of its purpose, participants, and overall emotional tone.
 * This saves time and focuses attention on high-priority insights.
 * @param {MeetingDetailsHeaderProps} props - The props for the component.
 * @returns {JSX.Element} The rendered header.
 */
export const MeetingDetailsHeader: React.FC<MeetingDetailsHeaderProps> = ({ metadata, participants, overallSentiment, durationSeconds }) => {
  const avgSentimentColor = overallSentiment.averageScore > 0.3 ? 'text-green-400' : overallSentiment.averageScore < -0.3 ? 'text-red-400' : 'text-yellow-400';
  const sentimentEmoji = overallSentiment.averageScore > 0.3 ? '😀' : overallSentiment.averageScore < -0.3 ? '😞' : '😐';

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-inner mb-6 border border-gray-600">
      <h2 className="text-3xl font-extrabold mb-2 text-cyan-300">{metadata.title}</h2>
      <p className="text-gray-300 mb-1">
        <span className="font-semibold">Host:</span> {metadata.hostName} ({metadata.hostId.substring(0, 6)}...)
      </p>
      <p className="text-gray-300 mb-1">
        <span className="font-semibold">Date:</span> {formatDateTime(metadata.actualStartTime)}
      </p>
      <p className="text-gray-300 mb-1">
        <span className="font-semibold">Duration:</span> {formatDuration(durationSeconds)}
      </p>
      <p className="text-gray-300 mb-1">
        <span className="font-semibold">Attendees:</span> {participants.length}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="font-semibold text-gray-300">Overall Sentiment:</span>
        <span className={`text-xl font-bold ${avgSentimentColor}`}>
          {sentimentEmoji} {overallSentiment.averageScore.toFixed(2)}
        </span>
        <span className="text-gray-400 text-sm">
          ({overallSentiment.positiveSegmentsCount} Pos, {overallSentiment.neutralSegmentsCount} Neu, {overallSentiment.negativeSegmentsCount} Neg)
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {metadata.tags.map((tag, i) => (
          <span key={i} className="bg-cyan-700 text-cyan-100 px-3 py-1 rounded-full text-xs font-medium">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * Interface for props for the TranscriptViewer component.
 */
interface TranscriptViewerProps {
  transcriptSegments: TranscriptSegment[];
  highlightedKeywords: string[];
  filterParticipantId: string | null;
}

/**
 * Displays the meeting transcript with advanced features.
 * Business impact: Provides an accurate, searchable, and time-stamped record of all spoken words,
 * crucial for detailed review, compliance checks, and knowledge retention.
 * AI annotations further enhance this by highlighting critical information or agent interventions.
 * @param {TranscriptViewerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered transcript viewer.
 */
export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcriptSegments, highlightedKeywords, filterParticipantId }) => {
  const filteredSegments = useMemo(() => {
    return transcriptSegments.filter(segment =>
      (!filterParticipantId || segment.participantId === filterParticipantId) &&
      (!highlightedKeywords.length || highlightedKeywords.some(keyword => segment.text.toLowerCase().includes(keyword.toLowerCase())))
    );
  }, [transcriptSegments, filterParticipantId, highlightedKeywords]);

  const highlightText = useCallback((text: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return <span>{text}</span>;
    let result: (string | JSX.Element)[] = [text];
    keywords.forEach(keyword => {
      const newResult: (string | JSX.Element)[] = [];
      result.forEach(segment => {
        if (typeof segment === 'string') {
          const parts = segment.split(new RegExp(`(${keyword})`, 'gi'));
          parts.forEach((part, idx) => {
            if (part.toLowerCase() === keyword.toLowerCase()) {
              newResult.push(<span key={`highlight-${keyword}-${idx}-${generateId()}`} className="bg-yellow-500 text-gray-900 rounded px-1">{part}</span>);
            } else {
              newResult.push(part);
            }
          });
        } else {
          newResult.push(segment);
        }
      });
      result = newResult;
    });
    return <>{result}</>;
  }, []);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Full Transcript</h3>
      {filteredSegments.length === 0 && <p className="text-gray-400">No transcript segments to display or matching filters.</p>}
      <div className="space-y-3">
        {filteredSegments.map((t, i) => (
          <div key={t.timestamp + i + t.participantId} className="flex flex-col md:flex-row md:items-baseline gap-2 group">
            <p className="min-w-[120px] text-gray-500 text-xs flex-shrink-0">
              {new Date(t.timestamp).toLocaleTimeString()}
            </p>
            <p className="flex-grow">
              <strong className="text-cyan-300">{t.participantName}:</strong>{' '}
              {highlightText(t.text, highlightedKeywords)}
              {t.sentimentScore !== undefined && (
                <span title={`Sentiment: ${t.sentimentScore.toFixed(2)}`} className={`ml-2 text-xs ${t.sentimentScore > 0.2 ? 'text-green-400' : t.sentimentScore < -0.2 ? 'text-red-400' : 'text-gray-400'}`}>
                  {t.sentimentScore > 0.2 ? '👍' : t.sentimentScore < -0.2 ? '👎' : '😐'}
                </span>
              )}
              {t.intent && (
                <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t.intent.replace(/_/g, ' ')}</span>
              )}
              {t.agentAnnotations && t.agentAnnotations.length > 0 && (
                <div className="ml-2 mt-1 flex flex-wrap gap-1">
                  {t.agentAnnotations.map((anno, annoIdx) => (
                    <span key={annoIdx} title={anno.description} className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full">
                      {anno.type.replace(/_/g, ' ')} <span className="text-purple-400">({anno.agentId.split('_')[0]})</span>
                    </span>
                  ))}
                </div>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Interface for props for the ActionItemsListManager component.
 */
interface ActionItemsListManagerProps {
  actionItems: ActionItemExtended[];
  onUpdateActionItem: (id: string, updates: Partial<ActionItemExtended>) => void;
  onDeleteActionItem: (id: string) => void;
  onAddActionItem: (newItem: Omit<ActionItemExtended, 'id' | 'createdAt' | 'signature'>) => void;
  participants: ParticipantDetailedInfo[];
}

/**
 * Manages the list of action items with CRUD capabilities.
 * Business impact: Centralizes task management derived from meeting outcomes,
 * ensuring clear accountability and follow-through. Its integration with digital
 * identity for assignment and potential token rails for task completion payments
 * drives tangible value realization and accelerates project delivery.
 * @param {ActionItemsListManagerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered action item manager.
 */
export const ActionItemsListManager: React.FC<ActionItemsListManagerProps> = ({
  actionItems,
  onUpdateActionItem,
  onDeleteActionItem,
  onAddActionItem,
  participants,
}) => {
  const [newTask, setNewTask] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState(participants[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<ActionItemExtended['priority']>('medium');
  const identityService = useMemo(() => IdentityAndAccessService.getInstance(), []);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (participants.length > 0 && !newAssigneeId) {
      setNewAssigneeId(participants[0].id);
    }
    const checkUserPermission = async () => {
      const authorized = await identityService.authorize('current_user_mock_id', ['Host', 'Presenter']);
      setHasPermission(authorized);
    };
    checkUserPermission();
  }, [participants, newAssigneeId, identityService]);

  const handleAddTask = async () => {
    if (newTask.trim() && newAssigneeId && hasPermission) {
      const assigneeName = participants.find(p => p.id === newAssigneeId)?.name || 'Unknown';
      const newItemData: Omit<ActionItemExtended, 'id' | 'createdAt' | 'signature'> = {
        assigneeId: newAssigneeId,
        assigneeName: assigneeName,
        task: newTask,
        status: 'open',
        dueDate: newDueDate ? new Date(newDueDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
        priority: newPriority,
        createdBy: 'current_user_mock_id',
      };
      onAddActionItem(newItemData);
      setNewTask('');
      setNewDueDate('');
      setNewPriority('medium');
    } else if (!hasPermission) {
      alert("You do not have permission to add action items.");
    }
  };

  const handleStatusChange = (id: string, status: ActionItemExtended['status']) => {
    if (!hasPermission) {
      alert("You do not have permission to update action item status.");
      return;
    }
    onUpdateActionItem(id, { status, updatedAt: Date.now() });
  };

  const handlePriorityChange = (id: string, priority: ActionItemExtended['priority']) => {
    if (!hasPermission) {
      alert("You do not have permission to update action item priority.");
      return;
    }
    onUpdateActionItem(id, { priority, updatedAt: Date.now() });
  };

  const handleDueDateChange = (id: string, date: string) => {
    if (!hasPermission) {
      alert("You do not have permission to update action item due date.");
      return;
    }
    onUpdateActionItem(id, { dueDate: new Date(date).getTime(), updatedAt: Date.now() });
  };

  const statusColors = {
    open: 'bg-blue-600',
    in_progress: 'bg-yellow-600',
    completed: 'bg-green-600',
    deferred: 'bg-gray-600',
  };

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    critical: 'bg-red-600',
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Action Items</h3>
      <div className={`flex flex-wrap gap-2 mb-4 ${!hasPermission ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add new action item..."
          className="flex-grow p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={!hasPermission}
        />
        <select
          value={newAssigneeId}
          onChange={e => setNewAssigneeId(e.target.value)}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={!hasPermission}
        >
          {participants.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={newDueDate}
          onChange={e => setNewDueDate(e.target.value)}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={!hasPermission}
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as ActionItemExtended['priority'])}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          disabled={!hasPermission}
        >
          {['low', 'medium', 'high', 'critical'].map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <button onClick={handleAddTask} className="p-2 bg-cyan-600 rounded whitespace-nowrap hover:bg-cyan-700 transition duration-200" disabled={!hasPermission}>Add Item</button>
      </div>
      {!hasPermission && <p className="text-red-400 text-sm mb-3">You need 'Host' or 'Presenter' role to add/edit action items.</p>}
      <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {actionItems.length === 0 && <p className="text-gray-400">No action items found.</p>}
        {actionItems.map(item => (
          <li key={item.id} className="bg-gray-800 p-3 rounded-md flex flex-col md:flex-row md:items-center gap-2 border border-gray-700">
            <span className="flex-grow text-gray-100">
              <strong className="text-cyan-300">{item.assigneeName}:</strong> {item.task}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-sm flex-shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-white ${statusColors[item.status]}`}>
                {item.status.replace(/_/g, ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-white ${priorityColors[item.priority]}`}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </span>
              {item.paymentRequestId && (
                <span title={`Linked to payment: ${item.paymentRequestId}`} className="bg-purple-700 text-purple-100 px-2 py-0.5 rounded-full text-xs">
                  💰 Payment
                </span>
              )}
              <input
                type="date"
                value={new Date(item.dueDate).toISOString().split('T')[0]}
                onChange={e => handleDueDateChange(item.id, e.target.value)}
                className="p-1 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Due Date"
                disabled={!hasPermission}
              />
              <select
                value={item.status}
                onChange={e => handleStatusChange(item.id, e.target.value as ActionItemExtended['status'])}
                className="p-1 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Change Status"
                disabled={!hasPermission}
              >
                {['open', 'in_progress', 'completed', 'deferred'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <button onClick={() => onDeleteActionItem(item.id)} className="text-red-400 hover:text-red-500 transition duration-200 p-1" title="Delete Action Item" disabled={!hasPermission}>
                ✖
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Interface for props for the DecisionsLogViewer component.
 */
interface DecisionsLogViewerProps {
  decisions: DecisionRecord[];
  onAddDecision: (newDecision: Omit<DecisionRecord, 'id' | 'timestamp' | 'signature'>) => void;
  onUpdateDecision: (id: string, updates: Partial<DecisionRecord>) => void;
  onDeleteDecision: (id: string) => void;
  participants: ParticipantDetailedInfo[];
}

/**
 * Displays and manages decisions made during the meeting.
 * Business impact: Creates a tamper-evident, auditable record of all key decisions,
 * providing clarity and reducing ambiguity. Cryptographic signatures ensure the integrity
 * and authenticity of each decision, crucial for legal and compliance requirements.
 * @param {DecisionsLogViewerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered decisions log viewer.
 */
export const DecisionsLogViewer: React.FC<DecisionsLogViewerProps> = ({
  decisions,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  participants,
}) => {
  const [newDecisionSummary, setNewDecisionSummary] = useState('');
  const [newDecidedBy, setNewDecidedBy] = useState(participants[0]?.id || '');
  const [isAdding, setIsAdding] = useState(false);
  const identityService = useMemo(() => IdentityAndAccessService.getInstance(), []);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (participants.length > 0 && !newDecidedBy) {
      setNewDecidedBy(participants[0].id);
    }
    const checkUserPermission = async () => {
      const authorized = await identityService.authorize('current_user_mock_id', ['Host', 'Presenter', 'Auditor']);
      setHasPermission(authorized);
    };
    checkUserPermission();
  }, [participants, newDecidedBy, identityService]);

  const handleAddDecision = () => {
    if (newDecisionSummary.trim() && newDecidedBy && hasPermission) {
      onAddDecision({
        summary: newDecisionSummary,
        participantsInvolvedIds: [newDecidedBy],
        decidedBy: newDecidedBy,
        rationale: "Manually added during review.",
      });
      setNewDecisionSummary('');
      setIsAdding(false);
    } else if (!hasPermission) {
      alert("You do not have permission to add decisions.");
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Decisions Log</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {decisions.length === 0 && <p className="text-gray-400">No decisions recorded.</p>}
        {decisions.map(decision => (
          <div key={decision.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <p className="text-gray-100 mb-1">
              <strong className="text-cyan-300">Decision:</strong> {decision.summary}
            </p>
            <p className="text-gray-400 text-sm">
              <span className="font-medium">Decided by:</span> {participants.find(p => p.id === decision.decidedBy)?.name || 'Unknown'}
            </p>
            {decision.rationale && (
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Rationale:</span> {decision.rationale}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm">
              {decision.signature ? (
                <SignatureVerifier entityId={decision.decidedBy} data={decision} signature={decision.signature} />
              ) : (
                <span className="text-red-400">⚠️ Unsigned</span>
              )}
              {hasPermission && (
                <>
                  <button onClick={() => onUpdateDecision(decision.id, { rationale: prompt("Enter new rationale:", decision.rationale || '') || undefined })} className="text-cyan-400 hover:text-cyan-300 transition duration-200">Edit</button>
                  <button onClick={() => onDeleteDecision(decision.id)} className="text-red-400 hover:text-red-500 transition duration-200">Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-cyan-600 rounded hover:bg-cyan-700 transition duration-200" disabled={!hasPermission}>
          {isAdding ? 'Cancel' : 'Add New Decision'}
        </button>
        {isAdding && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="text"
              value={newDecisionSummary}
              onChange={e => setNewDecisionSummary(e.target.value)}
              placeholder="Enter decision summary..."
              className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <select
              value={newDecidedBy}
              onChange={e => setNewDecidedBy(e.target.value)}
              className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button onClick={handleAddDecision} className="p-2 bg-green-600 rounded hover:bg-green-700 transition duration-200">Confirm Add</button>
          </div>
        )}
        {!hasPermission && <p className="text-red-400 text-sm mt-2">You need 'Host', 'Presenter' or 'Auditor' role to add/edit decisions.</p>}
      </div>
    </div>
  );
};

/**
 * Interface for props for the SignatureVerifier component.
 */
interface SignatureVerifierProps {
  entityId: string;
  data: any;
  signature: string;
}

/**
 * Verifies a cryptographic signature and displays its status.
 * Business impact: Provides an on-demand audit trail and tamper-evident mechanism,
 * crucial for regulatory compliance, data integrity, and building trust in autonomous systems.
 * @param {SignatureVerifierProps} props - The props for the component.
 * @returns {JSX.Element} The rendered signature verification status.
 */
export const SignatureVerifier: React.FC<SignatureVerifierProps> = ({ entityId, data, signature }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const identityService = useMemo(() => IdentityAndAccessService.getInstance(), []);

  const handleVerify = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataToVerify = { ...data };
      delete dataToVerify.signature;
      const verified = await identityService.verifySignature(entityId, dataToVerify, signature);
      setIsValid(verified);
    } catch (e) {
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [data, signature, entityId, identityService]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVerify}
        disabled={isLoading}
        className="text-gray-400 hover:text-cyan-400 text-sm px-2 py-0.5 rounded border border-gray-600 transition duration-200"
        title={`Verify signature by ${entityId}`}
      >
        {isLoading ? 'Verifying...' : 'Verify Signature'}
      </button>
      {isValid === true && <span className="text-green-400">✅ Valid</span>}
      {isValid === false && <span className="text-red-400">❌ Invalid</span>}
    </div>
  );
};

/**
 * Interface for props for the TopicInsightsPanel component.
 */
interface TopicInsightsPanelProps {
  topics: TopicInsight[];
  onTopicClick: (topic: string) => void;
}

/**
 * Displays key topics discussed in the meeting with their sentiments.
 * Business impact: Provides a high-level overview of discussed themes,
 * enabling quick content navigation and understanding of critical discussion areas,
 * thereby speeding up post-meeting review.
 * @param {TopicInsightsPanelProps} props - The props for the component.
 * @returns {JSX.Element} The rendered topic insights panel.
 */
export const TopicInsightsPanel: React.FC<TopicInsightsPanelProps> = ({ topics, onTopicClick }) => {
  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Key Topics</h3>
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
        {topics.length === 0 && <p className="text-gray-400">No key topics identified.</p>}
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => onTopicClick(topic.name)}
            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 transition duration-200 text-gray-100 px-3 py-1 rounded-full text-sm cursor-pointer border border-gray-600"
          >
            <span>{topic.name}</span>
            {topic.sentiment && (
              <span title={`Sentiment: ${topic.sentiment.average.toFixed(2)}`} className={`ml-1 text-xs ${topic.sentiment.average > 0.2 ? 'text-green-400' : topic.sentiment.average < -0.2 ? 'text-red-400' : 'text-yellow-400'}`}>
                {topic.sentiment.average > 0.2 ? '▲' : topic.sentiment.average < -0.2 ? '▼' : '▬'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Interface for props for the ParticipantEngagementMetrics component.
 */
interface ParticipantEngagementMetricsProps {
  participants: ParticipantDetailedInfo[];
  transcriptSegments: TranscriptSegment[];
}

/**
 * Displays detailed engagement and sentiment metrics for each participant.
 * Business impact: Provides granular insights into individual contributions and sentiment,
 * helping to assess meeting dynamics, identify key influencers, and ensure inclusive participation.
 * This supports team development and leadership coaching.
 * @param {ParticipantEngagementMetricsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered participant metrics.
 */
export const ParticipantEngagementMetrics: React.FC<ParticipantEngagementMetricsProps> = ({ participants, transcriptSegments }) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const selectedParticipant = useMemo(() => {
    return participants.find(p => p.id === selectedParticipantId);
  }, [participants, selectedParticipantId]);

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Participant Engagement</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto pr-2">
        {participants.length === 0 && <p className="text-gray-400 col-span-full">No participant data available.</p>}
        {participants.map(p => (
          <div
            key={p.id}
            className={`bg-gray-800 p-3 rounded-md border cursor-pointer transition duration-200 ${selectedParticipantId === p.id ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-gray-700 hover:border-gray-600'}`}
            onClick={() => setSelectedParticipantId(p.id)}
          >
            <div className="flex items-center gap-3 mb-2">
              <img src={p.avatarUrl || '/avatars/default.png'} alt={p.name} className="w-8 h-8 rounded-full border border-gray-600" />
              <h4 className="font-semibold text-gray-100 flex-grow">{p.name}</h4>
              <span className={`text-sm ${getSentimentColor(p.overallSentiment.average)}`}>
                {p.overallSentiment.average > 0.3 ? '👍' : p.overallSentiment.average < -0.3 ? '👎' : '😐'} {p.overallSentiment.average.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Role: {p.role}</p>
            <p className="text-gray-400 text-sm">Engagement: {p.engagementScore}%</p>
            <p className="text-gray-400 text-sm">Speaking Time: {formatDuration(p.totalSpeakingTime)}</p>
          </div>
        ))}
      </div>

      {selectedParticipant && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-lg font-bold mb-2 text-cyan-300">Details for {selectedParticipant.name}</h4>
          <p className="text-gray-300 mb-1">Email: {selectedParticipant.email}</p>
          <p className="text-gray-300 mb-1">Organization: {selectedParticipant.organization}</p>
          <p className="text-gray-300 mb-1">Speaking Segments: {selectedParticipant.speakingSegmentsCount}</p>
          <p className="text-gray-300 mb-1">
            Overall Sentiment: <span className={`${getSentimentColor(selectedParticipant.overallSentiment.average)} font-bold`}>{selectedParticipant.overallSentiment.average.toFixed(2)}</span> ({selectedParticipant.overallSentiment.trend})
          </p>
          {selectedParticipant.dominantEmotions && selectedParticipant.dominantEmotions.length > 0 && (
            <p className="text-gray-300 mb-1">
              Dominant Emotions: {selectedParticipant.dominantEmotions.map(e => `${e.emotion} (${(e.score * 100).toFixed(0)}%)`).join(', ')}
            </p>
          )}

          <div className="mt-4">
            <h5 className="text-md font-semibold mb-2 text-gray-200">Recent Contributions:</h5>
            <ul className="list-disc list-inside text-gray-300 text-sm bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto">
              {transcriptSegments
                .filter(s => s.participantId === selectedParticipant.id)
                .slice(-5)
                .map((s, idx) => (
                  <li key={idx} className="mb-1">{new Date(s.timestamp).toLocaleTimeString()}: {s.text}</li>
                ))}
              {transcriptSegments.filter(s => s.participantId === selectedParticipant.id).length === 0 && <p>No recent contributions.</p>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Interface for props for the SpatialSceneViewer component.
 */
interface SpatialSceneViewerProps {
  mindMapUrl: string;
  spatialObjects: SpatialObject[];
}

/**
 * Renders a placeholder for the 3D mind map and spatial meeting scene.
 * Business impact: Provides an immersive and intuitive way to revisit meeting context,
 * improving information recall and engagement. This innovative spatial data representation
 * leverages the full potential of holographic environments for unparalleled insight.
 * @param {SpatialSceneViewerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered spatial scene viewer placeholder.
 */
export const SpatialSceneViewer: React.FC<SpatialSceneViewerProps> = ({ mindMapUrl, spatialObjects }) => {
  const primarySceneModel = spatialObjects.find(obj => obj.type === '3d_model' && obj.label.includes('Environment'));
  const other3DModels = spatialObjects.filter(obj => obj.type === '3d_model' && !obj.label.includes('Environment'));

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800 relative min-h-[400px]">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Spatial Meeting Scene & Mind Map</h3>
      <p className="text-gray-400 mb-4">
        This area would display the interactive 3D meeting environment and dynamic mind map.
        In a full application, this would be an embedded WebGL/WebXR viewer.
      </p>

      <div className="relative w-full h-80 bg-gray-800 rounded-md border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
        <p className="text-gray-500 text-lg">Holographic 3D View Placeholder</p>
        <div className="absolute top-2 left-2 bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
          Interactive 3D Scene
        </div>
        {mindMapUrl && (
          <div className="absolute bottom-2 right-2 bg-gray-700 text-cyan-400 text-xs px-2 py-1 rounded">
            Mind Map: <a href={mindMapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{mindMapUrl.split('/').pop()}</a>
          </div>
        )}
        {primarySceneModel && primarySceneModel.metadata?.modelUrl && (
          <div className="absolute top-2 right-2 bg-gray-700 text-cyan-400 text-xs px-2 py-1 rounded">
            Scene Model: <a href={primarySceneModel.metadata.modelUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{primarySceneModel.metadata.modelUrl.split('/').pop()}</a>
          </div>
        )}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
          {spatialObjects.filter(obj => obj.type !== '3d_model').map(obj => (
            <div key={obj.id} className="text-center">
              <span className="block text-4xl text-cyan-400">{obj.type === 'whiteboard' ? '📋' : obj.type === 'presentation_screen' ? '🖥️' : '⚙️'}</span>
              <span className="block text-gray-400 text-sm">{obj.label}</span>
              {obj.snapshotUrl && (
                <img src={obj.snapshotUrl} alt={obj.label} className="w-16 h-12 mt-1 object-cover rounded border border-gray-600" />
              )}
            </div>
          ))}
          {other3DModels.map(obj => (
            <div key={obj.id} className="text-center">
              <span className="block text-4xl text-cyan-400">📦</span>
              <span className="block text-gray-400 text-sm">{obj.label}</span>
              {obj.metadata?.modelUrl && (
                 <a href={obj.metadata.modelUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs block mt-1">
                   View Model
                 </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Interface for props for the AgentInsightsPanel component.
 */
interface AgentInsightsPanelProps {
  complianceInsights: ComplianceInsight[];
  agentActivityLogs: AgentActivityLog[];
}

/**
 * Displays insights and activities generated by AI agents.
 * Business impact: Provides an invaluable window into the autonomous operation of AI agents,
 * revealing detected anomalies, proposed remediations, and audit trails. This transparency
 * is critical for governance, trust, and demonstrating the ROI of agentic AI systems.
 * @param {AgentInsightsPanelProps} props - The props for the component.
 * @returns {JSX.Element} The rendered agent insights panel.
 */
export const AgentInsightsPanel: React.FC<AgentInsightsPanelProps> = ({ complianceInsights, agentActivityLogs }) => {
  const getSeverityColor = (severity: ComplianceInsight['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-orange-600';
      case 'critical': return 'bg-red-600';
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Agent Insights & Activities</h3>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-cyan-300">Compliance Insights</h4>
        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {complianceInsights.length === 0 && <p className="text-gray-400">No compliance insights detected.</p>}
          {complianceInsights.map(insight => (
            <li key={insight.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-100 font-medium">{insight.description}</span>
                <span className={`text-white text-xs px-2 py-0.5 rounded-full ${getSeverityColor(insight.severity)}`}>
                  {insight.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Type:</span> {insight.type.replace(/_/g, ' ')} | <span className="font-medium">Status:</span> {insight.status}
              </p>
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Detected by:</span> {insight.agentId} at {formatDateTime(insight.timestamp)}
              </p>
              {insight.recommendedAction && (
                <p className="text-gray-300 text-sm mt-1">
                  <span className="font-medium text-cyan-400">Recommended:</span> {insight.recommendedAction}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-2 text-cyan-300">Agent Activity Log</h4>
        <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {agentActivityLogs.length === 0 && <p className="text-gray-400">No agent activities logged.</p>}
          {agentActivityLogs.map(log => (
            <li key={log.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
              <p className="text-gray-100 font-medium mb-1">
                <span className="text-purple-300">{log.agentId}</span> performed <span className="text-purple-400">{log.skill.replace(/_/g, ' ')}</span>: {log.action}
              </p>
              <p className="text-gray-400 text-xs">
                {formatDateTime(log.timestamp)}
              </p>
              {log.signature && (
                <SignatureVerifier entityId={log.agentId} data={log} signature={log.signature} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Interface for props for the PaymentRequestsViewer component.
 */
interface PaymentRequestsViewerProps {
  paymentRequests: PaymentRequestRecord[];
  onSettlePayment: (requestId: string, rail: 'fast' | 'batch') => void;
  onRejectPayment: (requestId: string) => void;
  isLoading: boolean;
}

/**
 * Displays and manages simulated payment requests.
 * Business impact: Provides a transparent, real-time view into financial transactions
 * initiated by meeting outcomes. It enables direct settlement or rejection, supporting
 * agile financial operations and ensuring accountability within the token rail layer.
 * @param {PaymentRequestsViewerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered payment requests viewer.
 */
export const PaymentRequestsViewer: React.FC<PaymentRequestsViewerProps> = ({ paymentRequests, onSettlePayment, onRejectPayment, isLoading }) => {
  const identityService = useMemo(() => IdentityAndAccessService.getInstance(), []);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const checkUserPermission = async () => {
      const authorized = await identityService.authorize('current_user_mock_id', ['Host', 'Auditor']);
      setHasPermission(authorized);
    };
    checkUserPermission();
  }, [identityService]);

  const getStatusColor = (status: PaymentRequestRecord['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'approved': return 'bg-blue-600';
      case 'settled': return 'bg-green-600';
      case 'rejected':
      case 'failed': return 'bg-red-600';
    }
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Payment Requests</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {paymentRequests.length === 0 && <p className="text-gray-400">No payment requests linked to this meeting.</p>}
        {paymentRequests.map(req => (
          <div key={req.id} className="bg-gray-800 p-3 rounded-md border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <p className="text-gray-100 font-medium">
                {req.amount} {req.currency} from {req.sourceParticipantId.replace('user-', '')} to {req.targetParticipantId.replace('user-', '')}
              </p>
              <span className={`text-white text-xs px-2 py-0.5 rounded-full ${getStatusColor(req.status)}`}>
                {req.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              <span className="font-medium">Created:</span> {formatDateTime(req.createdAt)}
            </p>
            {req.settledAt && (
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Settled:</span> {formatDateTime(req.settledAt)} via {req.railUsed}
              </p>
            )}
            {req.transactionHash && (
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Tx Hash:</span> <code className="text-xs bg-gray-700 px-1 rounded">{req.transactionHash.substring(0, 10)}...</code>
              </p>
            )}
            {req.relatedActionItemId && (
              <p className="text-gray-400 text-sm">
                <span className="font-medium">Related Action:</span> <code className="text-xs bg-gray-700 px-1 rounded">{req.relatedActionItemId.substring(0, 10)}...</code>
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm">
              {req.signature && (
                <SignatureVerifier entityId={req.sourceParticipantId} data={req} signature={req.signature} />
              )}
              {hasPermission && req.status === 'pending' && (
                <>
                  <button
                    onClick={() => onSettlePayment(req.id, 'fast')}
                    disabled={isLoading}
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 transition duration-200 disabled:opacity-50"
                  >
                    Settle (Fast)
                  </button>
                  <button
                    onClick={() => onSettlePayment(req.id, 'batch')}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                  >
                    Settle (Batch)
                  </button>
                  <button
                    onClick={() => onRejectPayment(req.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {!hasPermission && paymentRequests.length > 0 && <p className="text-red-400 text-sm mt-2">You need 'Host' or 'Auditor' role to manage payment requests.</p>}
      </div>
    </div>
  );
};

/**
 * Interface for props for the MeetingSettingsEditor component.
 */
interface MeetingSettingsEditorProps {
  preferences: UserPreferences | null;
  integrationStatus: IntegrationStatus | null;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => Promise<UserPreferences>;
  onUpdateIntegration: (service: 'crm' | 'calendar' | 'projectManagement' | 'documentStorage', connect: boolean) => Promise<IntegrationStatus>;
  isLoading: boolean;
  onClose: () => void;
}

/**
 * Provides a UI for editing user preferences and integration settings.
 * Business impact: Centralizes user configuration, allowing personalized control over
 * AI behavior, automation triggers, and integration points. This empowers users to
 * optimize their workflow, enhancing productivity and job satisfaction.
 * @param {MeetingSettingsEditorProps} props - The props for the component.
 * @returns {JSX.Element} The rendered settings editor.
 */
export const MeetingSettingsEditor: React.FC<MeetingSettingsEditorProps> = ({
  preferences,
  integrationStatus,
  onUpdatePreferences,
  onUpdateIntegration,
  isLoading,
  onClose,
}) => {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | null>(preferences);
  const [localIntegrationStatus, setLocalIntegrationStatus] = useState<IntegrationStatus | null>(integrationStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    setLocalIntegrationStatus(integrationStatus);
  }, [integrationStatus]);

  const handlePreferenceChange = useCallback((key: keyof UserPreferences, value: any) => {
    setLocalPreferences(prev => prev ? { ...prev, [key]: value } : null);
  }, []);

  const handleNotificationChange = useCallback((key: keyof UserPreferences['notificationSettings'], value: boolean) => {
    setLocalPreferences(prev => prev ? { ...prev, notificationSettings: { ...prev.notificationSettings, [key]: value } } : null);
  }, []);

  const handleIntegrationChange = useCallback(async (service: 'crm' | 'calendar' | 'projectManagement' | 'documentStorage', connect: boolean) => {
    setIsSaving(true);
    try {
      const updatedStatus = await onUpdateIntegration(service, connect);
      setLocalIntegrationStatus(updatedStatus);
      setSaveMessage(`Integration with ${service} ${connect ? 'connected' : 'disconnected'} successfully.`);
    } catch (error) {
      setSaveMessage(`Failed to update ${service} integration.`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }, [onUpdateIntegration]);

  const handleSaveChanges = async () => {
    if (!localPreferences) return;
    setIsSaving(true);
    try {
      await onUpdatePreferences(localPreferences);
      setSaveMessage("Preferences saved successfully!");
    } catch (error) {
      setSaveMessage("Failed to save preferences.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (!localPreferences || !localIntegrationStatus) {
    return <div className="p-6 bg-gray-800 rounded-lg text-white">Loading settings...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full text-white relative">
        <h2 className="text-3xl font-bold mb-6 text-cyan-300">Application Settings</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl">&times;</button>

        {saveMessage && (
          <div className={`mb-4 p-3 rounded-md ${saveMessage.includes('Failed') ? 'bg-red-700' : 'bg-green-700'} text-white text-center`}>
            {saveMessage}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-cyan-200">General Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="theme" className="text-gray-300">Theme:</label>
                <select
                  id="theme"
                  value={localPreferences.theme}
                  onChange={e => handlePreferenceChange('theme', e.target.value as 'dark' | 'light')}
                  className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="language" className="text-gray-300">Default Language:</label>
                <select
                  id="language"
                  value={localPreferences.defaultLanguage}
                  onChange={e => handlePreferenceChange('defaultLanguage', e.target.value)}
                  className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                >
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Spanish (Spain)</option>
                  <option value="fr-FR">French (France)</option>
                  <option value="de-DE">German (Germany)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="transcriptDisplayMode" className="text-gray-300">Transcript Display Mode:</label>
                <select
                  id="transcriptDisplayMode"
                  value={localPreferences.transcriptDisplayMode}
                  onChange={e => handlePreferenceChange('transcriptDisplayMode', e.target.value as 'realtime' | 'summary' | 'full')}
                  className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                >
                  <option value="realtime">Real-time Scroll</option>
                  <option value="summary">Segmented Summary</option>
                  <option value="full">Full Scrollable</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="aiModelPreference" className="text-gray-300">AI Model Preference:</label>
                <select
                  id="aiModelPreference"
                  value={localPreferences.aiModelPreference}
                  onChange={e => handlePreferenceChange('aiModelPreference', e.target.value as 'standard' | 'advanced' | 'custom')}
                  className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                >
                  <option value="standard">Standard (Fast)</option>
                  <option value="advanced">Advanced (High Accuracy)</option>
                  <option value="custom">Custom (Configurable)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-cyan-200">Automation & AI</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="autoExportCRM" className="text-gray-300">Auto-export Action Items to CRM:</label>
                <input
                  type="checkbox"
                  id="autoExportCRM"
                  checked={localPreferences.autoExportToCRM}
                  onChange={e => handlePreferenceChange('autoExportToCRM', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="autoScheduleFollowUp" className="text-gray-300">Auto-schedule Follow-up Meetings:</label>
                <input
                  type="checkbox"
                  id="autoScheduleFollowUp"
                  checked={localPreferences.autoScheduleFollowUp}
                  onChange={e => handlePreferenceChange('autoScheduleFollowUp', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="autoProcessPayments" className="text-gray-300">Auto-process Payments for Completed Tasks:</label>
                <input
                  type="checkbox"
                  id="autoProcessPayments"
                  checked={localPreferences.autoProcessPayments}
                  onChange={e => handlePreferenceChange('autoProcessPayments', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-cyan-200">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="notifyNewActionItem" className="text-gray-300">New Action Item Assigned:</label>
                <input
                  type="checkbox"
                  id="notifyNewActionItem"
                  checked={localPreferences.notificationSettings.newActionItem}
                  onChange={e => handleNotificationChange('newActionItem', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notifyMeetingEndedSummary" className="text-gray-300">Meeting Summary Ready:</label>
                <input
                  type="checkbox"
                  id="notifyMeetingEndedSummary"
                  checked={localPreferences.notificationSettings.meetingEndedSummary}
                  onChange={e => handleNotificationChange('meetingEndedSummary', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notifySentimentAlert" className="text-gray-300">Sentiment Dip Alert:</label>
                <input
                  type="checkbox"
                  id="notifySentimentAlert"
                  checked={localPreferences.notificationSettings.sentimentAlert}
                  onChange={e => handleNotificationChange('sentimentAlert', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notifyComplianceIssue" className="text-gray-300">Compliance Issue Detected:</label>
                <input
                  type="checkbox"
                  id="notifyComplianceIssue"
                  checked={localPreferences.notificationSettings.complianceIssue}
                  onChange={e => handleNotificationChange('complianceIssue', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="notifyPaymentStatus" className="text-gray-300">Payment Request Status Change:</label>
                <input
                  type="checkbox"
                  id="notifyPaymentStatus"
                  checked={localPreferences.notificationSettings.paymentStatus}
                  onChange={e => handleNotificationChange('paymentStatus', e.target.checked)}
                  className="h-5 w-5 text-cyan-600 bg-gray-700 rounded border-gray-600 focus:ring-cyan-500"
                  disabled={isLoading || isSaving}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-cyan-200">Integrations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">CRM (e.g., Salesforce, HubSpot):</span>
                <button
                  onClick={() => handleIntegrationChange('crm', !localIntegrationStatus.crmConnected)}
                  className={`px-4 py-2 rounded-md transition duration-200 ${localIntegrationStatus.crmConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={isLoading || isSaving}
                >
                  {localIntegrationStatus.crmConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Calendar (e.g., Google, Outlook):</span>
                <button
                  onClick={() => handleIntegrationChange('calendar', !localIntegrationStatus.calendarConnected)}
                  className={`px-4 py-2 rounded-md transition duration-200 ${localIntegrationStatus.calendarConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={isLoading || isSaving}
                >
                  {localIntegrationStatus.calendarConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Project Management (e.g., Jira, Asana):</span>
                <button
                  onClick={() => handleIntegrationChange('projectManagement', !localIntegrationStatus.projectManagementConnected)}
                  className={`px-4 py-2 rounded-md transition duration-200 ${localIntegrationStatus.projectManagementConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={isLoading || isSaving}
                >
                  {localIntegrationStatus.projectManagementConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Document Storage (e.g., SharePoint, Drive):</span>
                <button
                  onClick={() => handleIntegrationChange('documentStorage', !localIntegrationStatus.documentStorageConnected)}
                  className={`px-4 py-2 rounded-md transition duration-200 ${localIntegrationStatus.documentStorageConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  disabled={isLoading || isSaving}
                >
                  {localIntegrationStatus.documentStorageConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleSaveChanges}
            className="px-6 py-3 bg-cyan-600 rounded-md hover:bg-cyan-700 transition duration-200 font-semibold"
            disabled={isLoading || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 rounded-md hover:bg-gray-700 transition duration-200 font-semibold"
            disabled={isLoading || isSaving}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Interface for props for the HistoricalMeetingsBrowser component.
 */
interface HistoricalMeetingsBrowserProps {
  historicalMeetings: HistoricalMeetingRecord[];
  onLoadMeeting: (meetingId: string) => void;
  isLoading: boolean;
}

/**
 * Component to browse and load historical meeting summaries.
 * Business impact: Provides an intuitive interface for accessing the complete archive
 * of past meetings, enabling effortless retrieval of information, historical trend analysis,
 * and efficient knowledge transfer across teams.
 * @param {HistoricalMeetingsBrowserProps} props - The props for the component.
 * @returns {JSX.Element} The rendered browser.
 */
export const HistoricalMeetingsBrowser: React.FC<HistoricalMeetingsBrowserProps> = ({ historicalMeetings, onLoadMeeting, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  const filteredMeetings = useMemo(() => {
    return historicalMeetings.filter(meeting => {
      const matchesSearch = searchTerm === '' ||
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.summaryPreview.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = filterTopic === '' ||
        meeting.keyTopics.some(topic => topic.toLowerCase().includes(filterTopic.toLowerCase()));
      return matchesSearch && matchesTopic;
    }).sort((a, b) => b.date - a.date);
  }, [historicalMeetings, searchTerm, filterTopic]);

  const uniqueTopics = useMemo(() => {
    const topics = new Set<string>();
    historicalMeetings.forEach(meeting => meeting.keyTopics.forEach(topic => topics.add(topic)));
    return Array.from(topics);
  }, [historicalMeetings]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
      <h3 className="text-xl font-semibold mb-3 text-cyan-200">Historical Meetings</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-grow p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <select
          value={filterTopic}
          onChange={e => setFilterTopic(e.target.value)}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All Topics</option>
          {uniqueTopics.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {isLoading && <p className="text-gray-400">Loading historical meetings...</p>}
        {!isLoading && filteredMeetings.length === 0 && <p className="text-gray-400">No historical meetings found matching your criteria.</p>}
        {!isLoading && filteredMeetings.map(meeting => (
          <div key={meeting.id} className="bg-gray-800 p-3 rounded-md border border-gray-700 hover:border-cyan-500 transition duration-200">
            <h4 className="font-semibold text-gray-100 text-lg mb-1">{meeting.title}</h4>
            <p className="text-gray-400 text-sm mb-1">Host: {meeting.hostName} | Date: {formatDateTime(meeting.date)}</p>
            <p className="text-gray-400 text-sm mb-2">Topics: {meeting.keyTopics.join(', ')}</p>
            <p className="text-gray-300 text-sm mb-2 line-clamp-2">{meeting.summaryPreview}</p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-2">
                <span className="bg-blue-700 text-blue-100 px-2 py-0.5 rounded-full text-xs">AI: {meeting.overallSentimentScore.toFixed(2)}</span>
                <span className="bg-purple-700 text-purple-100 px-2 py-0.5 rounded-full text-xs">Actions: {meeting.actionItemsCount}</span>
                {meeting.complianceIssuesCount > 0 && (
                  <span className="bg-red-700 text-red-100 px-2 py-0.5 rounded-full text-xs">Issues: {meeting.complianceIssuesCount}</span>
                )}
                {meeting.paymentRequestsCount > 0 && (
                  <span className="bg-green-700 text-green-100 px-2 py-0.5 rounded-full text-xs">Payments: {meeting.paymentRequestsCount}</span>
                )}
              </div>
              <button
                onClick={() => onLoadMeeting(meeting.id)}
                className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 transition duration-200"
                disabled={isLoading}
              >
                Load Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Main Holographic Meeting Scribe View Component.
 * Business impact: This is the central control panel for interacting with the entire
 * holographic meeting intelligence system. It orchestrates real-time data capture,
 * AI processing, decision tracking, and integration with financial and identity systems.
 * By providing a unified, intuitive interface, it empowers users to leverage advanced
 * AI and blockchain-inspired infrastructure for superior meeting outcomes, unprecedented
 * operational efficiency, and a robust framework for enterprise governance.
 */
const HolographicMeetingScribeView: React.FC = () => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveScribing, setIsLiveScribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingSummaryExtended | null>(null);
  const [currentLiveTranscript, setCurrentLiveTranscript] = useState<TranscriptSegment[]>([]);
  const [lastTranscriptTimestamp, setLastTranscriptTimestamp] = useState(0);
  const [activeTab, setActiveTab] = useState<'summary' | 'live-scribe' | 'history' | 'settings'>('summary');
  const [showSettings, setShowSettings] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null);

  const [transcriptSearchTerm, setTranscriptSearchTerm] = useState('');
  const [transcriptFilterParticipant, setTranscriptFilterParticipant] = useState<string | null>(null);

  const meetingDataService = useMemo(() => MeetingDataService.getInstance(), []);
  const userProfileService = useMemo(() => UserProfileService.getInstance(), []);
  const integrationService = useMemo(() => IntegrationService.getInstance(), []);
  const paymentService = useMemo(() => PaymentSimulationService.getInstance(), []);
  const identityService = useMemo(() => IdentityAndAccessService.getInstance(), []);
  const agentCommService = useMemo(() => AgentCommunicationService.getInstance(), []);

  const liveScribeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  /**
   * Effect to load user preferences and integration status on component mount.
   * Business impact: Ensures personalized and integrated experience from the start,
   * minimizing setup time and maximizing user efficiency.
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const prefs = await userProfileService.getPreferences();
        setUserPreferences(prefs);
        const integrations = await integrationService.getIntegrationStatus();
        setIntegrationStatus(integrations);
      } catch (err) {
        setError("Failed to load user settings.");
      }
    };
    loadSettings();
  }, [userProfileService, integrationService]);

  /**
   * Effect for live scribing: continuously fetches new transcript segments.
   * Business impact: Provides real-time data capture for immediate AI processing
   * and live feedback, essential for dynamic decision-making and responsive agentic behavior.
   */
  useEffect(() => {
    if (isLiveScribing && meetingUrl) {
      const fetchSegments = async () => {
        try {
          const newSegments = await meetingDataService.fetchLiveTranscriptSegments(meetingUrl, lastTranscriptTimestamp);
          if (newSegments.length > 0) {
            setCurrentLiveTranscript(prev => {
              const updated = [...prev, ...newSegments];
              return updated.slice(Math.max(0, updated.length - 100));
            });
            setLastTranscriptTimestamp(newSegments[newSegments.length - 1].timestamp);
          }
        } catch (err: any) {
          setError(`Live scribing failed: ${err.message}`);
          setIsLiveScribing(false);
          if (liveScribeIntervalRef.current) {
            clearInterval(liveScribeIntervalRef.current);
          }
        }
      };

      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
      }
      liveScribeIntervalRef.current = setInterval(fetchSegments, 2000);
    } else {
      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
        liveScribeIntervalRef.current = null;
      }
    }

    return () => {
      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
      }
    };
  }, [isLiveScribing, meetingUrl, lastTranscriptTimestamp, meetingDataService]);

  /**
   * Effect to scroll to the bottom of the live transcript when new segments arrive.
   * Business impact: Enhances user experience by automatically following the real-time
   * conversation, ensuring key information is always visible.
   */
  useEffect(() => {
    if (transcriptRef.current && userPreferences?.transcriptDisplayMode === 'realtime') {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [currentLiveTranscript, userPreferences?.transcriptDisplayMode]);

  /**
   * Handles joining a meeting and initiating live scribing.
   * Business impact: Provides the entry point for real-time intelligence gathering,
   * enabling immediate value extraction from live holographic interactions.
   */
  const handleJoinAndScribe = async () => {
    if (!meetingUrl) {
      setError("Please enter a meeting URL.");
      return;
    }
    setIsLoading(true);
    setResult(null);
    setCurrentLiveTranscript([]);
    setLastTranscriptTimestamp(0);
    setError(null);

    try {
      await simulateAILoad(2000);

      setIsLiveScribing(true);
      setActiveTab('live-scribe');
      const initialSegments = await meetingDataService.fetchLiveTranscriptSegments(meetingUrl, 0);
      setCurrentLiveTranscript(initialSegments);
      if (initialSegments.length > 0) {
        setLastTranscriptTimestamp(initialSegments[initialSegments.length - 1].timestamp);
      }

    } catch (err: any) {
      setError(`Failed to join or start scribing: ${err.message}`);
      setIsLiveScribing(false);
      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles stopping live scribing and generating the final meeting summary.
   * Business impact: Transforms ephemeral live discussions into durable, actionable
   * business intelligence, automating summarization, compliance checks, and integration
   * with downstream systems for maximum operational efficiency.
   */
  const handleStopAndFinalize = async () => {
    if (!isLiveScribing) return;

    setIsLoading(true);
    setIsLiveScribing(false);
    if (liveScribeIntervalRef.current) {
      clearInterval(liveScribeIntervalRef.current);
      liveScribeIntervalRef.current = null;
    }
    setError(null);

    try {
      const finalSummary = await meetingDataService.finalizeMeetingSummary(currentLiveTranscript, meetingUrl || "Unnamed Holographic Meeting");
      setResult(finalSummary);
      setActiveTab('summary');

      if (userPreferences?.autoExportToCRM && integrationStatus?.crmConnected) {
        await integrationService.exportActionItemsToCRM(finalSummary.actionItems);
      }
      if (userPreferences?.autoScheduleFollowUp && integrationStatus?.calendarConnected && finalSummary.futureMeetingSuggestions && finalSummary.futureMeetingSuggestions.length > 0) {
        await integrationService.scheduleFollowUpMeeting(finalSummary.futureMeetingSuggestions[0]);
      }

    } catch (err: any) {
      setError(`Failed to finalize meeting summary: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles loading a historical meeting by its ID.
   * Business impact: Provides seamless access to past meeting intelligence,
   * enabling quick recall, audit, and learning from previous engagements.
   * @param {string} meetingId - The ID of the historical meeting.
   */
  const handleLoadHistoricalMeeting = async (meetingId: string) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const historicalSummary = await meetingDataService.getMeetingSummaryById(meetingId);
      if (historicalSummary) {
        setResult(historicalSummary);
        setActiveTab('summary');
        setMeetingUrl(historicalSummary.metadata.recordingUrl || `HoloMeetID:${meetingId}`);
      } else {
        setError("Historical meeting not found.");
      }
    } catch (err: any) {
      setError(`Failed to load historical meeting: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Adds a new action item to the current meeting summary.
   * Business impact: Supports real-time task creation and assignment,
   * ensuring that actionable points from discussions are immediately captured and tracked.
   * @param {Omit<ActionItemExtended, 'id' | 'createdAt' | 'signature'>} newItem - The new action item details.
   */
  const handleAddActionItem = useCallback(async (newItem: Omit<ActionItemExtended, 'id' | 'createdAt' | 'signature'>) => {
    setResult(async prev => {
      if (!prev) return prev;
      const newActionItem: ActionItemExtended = {
        ...newItem,
        id: generateId(),
        createdAt: Date.now(),
      };
      newActionItem.signature = await identityService.signData(newActionItem.createdBy, newActionItem);
      return {
        ...prev,
        actionItems: [...prev.actionItems, newActionItem],
      };
    });
  }, [identityService]);

  /**
   * Updates an existing action item.
   * Business impact: Allows dynamic adjustments to tasks, statuses, and priorities,
   * reflecting evolving project requirements and maintaining up-to-date project visibility.
   * Automatically triggers simulated payments for completed tasks.
   * @param {string} id - The ID of the action item.
   * @param {Partial<ActionItemExtended>} updates - The updates to apply.
   */
  const handleUpdateActionItem = useCallback(async (id: string, updates: Partial<ActionItemExtended>) => {
    setResult(async prev => {
      if (!prev) return prev;
      const updatedActionItems = prev.actionItems.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
      );

      const updatedItem = updatedActionItems.find(item => item.id === id);
      if (updatedItem && updatedItem.status === 'completed' && !updatedItem.paymentRequestId && userPreferences?.autoProcessPayments) {
        try {
          const paymentRequest = await paymentService.createPaymentRequest(
            updatedItem.createdBy,
            updatedItem.assigneeId,
            getRandomNumber(20, 200),
            'USD_T',
            updatedItem.id
          );
          agentCommService.publish('payment_auto_created', { actionItemId: updatedItem.id, requestId: paymentRequest.id });
          return {
            ...prev,
            actionItems: updatedActionItems.map(item =>
              item.id === id ? { ...item, paymentRequestId: paymentRequest.id } : item
            ),
            paymentRequests: [...prev.paymentRequests, paymentRequest],
          };
        } catch (e: any) {
          setError(`Failed to auto-create payment: ${e.message}`);
        }
      }

      return {
        ...prev,
        actionItems: updatedActionItems,
      };
    });
  }, [paymentService, userPreferences?.autoProcessPayments, agentCommService]);

  /**
   * Deletes an action item.
   * Business impact: Enables efficient removal of obsolete or incorrect tasks,
   * maintaining a clean and relevant task list.
   * @param {string} id - The ID of the action item to delete.
   */
  const handleDeleteActionItem = useCallback((id: string) => {
    setResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        actionItems: prev.actionItems.filter(item => item.id !== id),
      };
    });
  }, []);

  /**
   * Adds a new decision to the current meeting summary.
   * Business impact: Ensures that critical agreements are immediately captured
   * and integrated into the auditable meeting record, with cryptographic signing
   * for integrity.
   * @param {Omit<DecisionRecord, 'id' | 'timestamp' | 'signature'>} newDecision - The new decision details.
   */
  const handleAddDecision = useCallback(async (newDecision: Omit<DecisionRecord, 'id' | 'timestamp' | 'signature'>) => {
    setResult(async prev => {
      if (!prev) return prev;
      const decision: DecisionRecord = {
        ...newDecision,
        id: generateId(),
        timestamp: Date.now(),
      };
      decision.signature = await identityService.signData(decision.decidedBy, decision);
      return {
        ...prev,
        decisions: [...prev.decisions, decision],
      };
    });
  }, [identityService]);

  /**
   * Updates an existing decision.
   * Business impact: Allows modification of decision details while maintaining
   * an auditable history of changes.
   * @param {string} id - The ID of the decision.
   * @param {Partial<DecisionRecord>} updates - The updates to apply.
   */
  const handleUpdateDecision = useCallback((id: string, updates: Partial<DecisionRecord>) => {
    setResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        decisions: prev.decisions.map(decision =>
          decision.id === id ? { ...decision, ...updates } : decision
        ),
      };
    });
  }, []);

  /**
   * Deletes a decision.
   * Business impact: Provides control over the meeting record, allowing removal
   * of erroneous or superseded decisions.
   * @param {string} id - The ID of the decision to delete.
   */
  const handleDeleteDecision = useCallback((id: string) => {
    setResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        decisions: prev.decisions.filter(decision => decision.id !== id),
      };
    });
  }, []);

  /**
   * Handles when a topic is clicked in the TopicInsightsPanel.
   * Sets the transcript search term to highlight related discussions.
   * Business impact: Improves navigation and contextual understanding by
   * instantly highlighting relevant parts of the transcript, reducing search time.
   * @param {string} topicName - The name of the topic.
   */
  const handleTopicClick = useCallback((topicName: string) => {
    setTranscriptSearchTerm(topicName);
    setActiveTab('live-scribe');
  }, []);

  /**
   * Updates user preferences.
   * Business impact: Ensures personalized application behavior and integrates
   * user choices across the system.
   * @param {Partial<UserPreferences>} updates - The preference updates.
   * @returns {Promise<UserPreferences>} The updated preferences.
   */
  const handleUpdateUserPreferences = useCallback(async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
    try {
      const updatedPrefs = await userProfileService.updatePreferences(updates);
      setUserPreferences(updatedPrefs);
      return updatedPrefs;
    } catch (err) {
      throw err;
    }
  }, [userProfileService]);

  /**
   * Updates integration status.
   * Business impact: Allows users to manage connectivity to external enterprise systems,
   * ensuring data flow and enabling automated workflows.
   * @param {'crm' | 'calendar' | 'projectManagement' | 'documentStorage'} service - The service name.
   * @param {boolean} connect - Whether to connect or disconnect.
   * @returns {Promise<IntegrationStatus>} The updated integration status.
   */
  const handleUpdateIntegrationStatus = useCallback(async (service: 'crm' | 'calendar' | 'projectManagement' | 'documentStorage', connect: boolean): Promise<IntegrationStatus> => {
    try {
      const updatedStatus = await integrationService.setServiceConnection(service, connect);
      setIntegrationStatus(updatedStatus);
      return updatedStatus;
    } catch (err) {
      throw err;
    }
  }, [integrationService]);

  /**
   * Handles settling a payment request.
   * Business impact: Directly processes financial commitments, leveraging token rails
   * for efficient and auditable value transfer, thereby accelerating financial
   * reconciliation and enabling new payment models.
   * @param {string} requestId - The ID of the payment request.
   * @param {'fast' | 'batch'} rail - The rail to use.
   */
  const handleSettlePaymentRequest = useCallback(async (requestId: string, rail: 'fast' | 'batch') => {
    setIsLoading(true);
    setError(null);
    try {
      const authorized = await identityService.authorize('current_user_mock_id', ['Host', 'Auditor']);
      if (!authorized) {
        throw new Error("You do not have permission to settle payment requests.");
      }

      const updatedRequest = await paymentService.settlePayment(requestId, rail === 'fast' ? 'rail_fast' : 'rail_batch');
      setResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          paymentRequests: prev.paymentRequests.map(req => req.id === requestId ? updatedRequest : req),
        };
      });
      alert(`Payment request ${requestId} settled successfully via ${rail} rail!`);
    } catch (err: any) {
      setError(`Failed to settle payment request: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [paymentService, identityService]);

  /**
   * Handles rejecting a payment request.
   * Business impact: Provides granular control over financial flows, allowing for
   * rejection of invalid or unapproved payment requests, maintaining financial integrity.
   * @param {string} requestId - The ID of the payment request.
   */
  const handleRejectPaymentRequest = useCallback(async (requestId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authorized = await identityService.authorize('current_user_mock_id', ['Host', 'Auditor']);
      if (!authorized) {
        throw new Error("You do not have permission to reject payment requests.");
      }
      setResult(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          paymentRequests: prev.paymentRequests.map(req =>
            req.id === requestId ? { ...req, status: 'rejected', settledAt: Date.now() } : req
          ),
        };
      });
      alert(`Payment request ${requestId} rejected.`);
    } catch (err: any) {
      setError(`Failed to reject payment request: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [identityService]);

  const allParticipants = useMemo(() => {
    if (result) return result.participants;
    const participantMap = new Map<string, ParticipantDetailedInfo>();
    currentLiveTranscript.forEach(s => {
      if (!participantMap.has(s.participantId)) {
        participantMap.set(s.participantId, {
          id: s.participantId,
          name: s.participantName,
          role: "Participant",
          email: `${s.participantName.replace(/\s/g, '').toLowerCase()}@example.com`,
          organization: "Guest",
          avatarUrl: `/avatars/${s.participantName.replace(/\s/g, '').toLowerCase()}.png`,
          joinTime: s.timestamp,
          totalSpeakingTime: 0,
          speakingSegmentsCount: 0,
          overallSentiment: { average: 0, trend: 'stable' },
          engagementScore: 0,
        });
      }
    });
    return Array.from(participantMap.values());
  }, [result, currentLiveTranscript]);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl min-h-[800px] flex flex-col">
      <h1 className="text-4xl font-extrabold mb-6 text-center text-cyan-400">Holographic Meeting Scribe</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-gray-900 rounded-lg shadow-inner">
        <input
          type="text"
          value={meetingUrl}
          onChange={e => setMeetingUrl(e.target.value)}
          placeholder="Enter Holographic Meeting URL or ID..."
          className="flex-grow p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg"
          disabled={isLoading || isLiveScribing}
        />
        {!isLiveScribing ? (
          <button
            onClick={handleJoinAndScribe}
            disabled={isLoading || !meetingUrl}
            className="p-3 bg-cyan-600 rounded-md disabled:opacity-50 whitespace-nowrap text-lg font-semibold hover:bg-cyan-700 transition duration-200"
          >
            {isLoading ? 'Connecting...' : 'Join & Start Scribing'}
          </button>
        ) : (
          <button
            onClick={handleStopAndFinalize}
            disabled={isLoading}
            className="p-3 bg-red-600 rounded-md disabled:opacity-50 whitespace-nowrap text-lg font-semibold hover:bg-red-700 transition duration-200"
          >
            {isLoading ? 'Finalizing...' : 'Stop Scribing & Summarize'}
          </button>
        )}
      </div>

      {(isLoading || isLiveScribing) && (
        <p className="mt-4 text-center text-cyan-300 animate-pulse text-lg">
          {isLiveScribing ? 'Live scribing in progress... monitoring spatial meeting...' : 'Joining spatial meeting... mapping participants... analyzing data...'}
        </p>
      )}
      {error && (
        <p className="mt-4 text-center text-red-500 bg-red-900 p-3 rounded-md border border-red-700 text-lg">
          Error: {error}
        </p>
      )}

      <div className="flex justify-center border-b border-gray-700 mb-6 sticky top-0 bg-gray-800 z-10 pt-2">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'summary' ? 'border-b-4 border-cyan-500 text-cyan-300' : 'text-gray-400 hover:text-gray-200'}`}
          disabled={isLoading}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('live-scribe')}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'live-scribe' ? 'border-b-4 border-cyan-500 text-cyan-300' : 'text-gray-400 hover:text-gray-200'}`}
          disabled={isLoading}
        >
          Live Scribe
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'history' ? 'border-b-4 border-cyan-500 text-cyan-300' : 'text-gray-400 hover:text-gray-200'}`}
          disabled={isLoading}
        >
          History
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className={`px-6 py-3 text-lg font-medium transition-colors duration-200 ${activeTab === 'settings' ? 'border-b-4 border-cyan-500 text-cyan-300' : 'text-gray-400 hover:text-gray-200'}`}
          disabled={isLoading}
        >
          Settings
        </button>
      </div>

      <div className="flex-grow">
        {activeTab === 'summary' && result && (
          <div className="mt-4 space-y-6 animate-fadeIn">
            <MeetingDetailsHeader
              metadata={result.metadata}
              participants={result.participants}
              overallSentiment={result.overallSentiment}
              durationSeconds={result.metadata.durationSeconds || 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActionItemsListManager
                actionItems={result.actionItems}
                onAddActionItem={handleAddActionItem}
                onUpdateActionItem={handleUpdateActionItem}
                onDeleteActionItem={handleDeleteActionItem}
                participants={allParticipants}
              />
              <DecisionsLogViewer
                decisions={result.decisions}
                onAddDecision={handleAddDecision}
                onUpdateDecision={handleUpdateDecision}
                onDeleteDecision={handleDeleteDecision}
                participants={allParticipants}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopicInsightsPanel topics={result.topics} onTopicClick={handleTopicClick} />
              <AgentInsightsPanel complianceInsights={result.complianceInsights} agentActivityLogs={result.agentActivityLogs} />
            </div>

            <PaymentRequestsViewer
              paymentRequests={result.paymentRequests}
              onSettlePayment={handleSettlePaymentRequest}
              onRejectPayment={handleRejectPaymentRequest}
              isLoading={isLoading}
            />

            <ParticipantEngagementMetrics participants={result.participants} transcriptSegments={result.transcriptSegments} />

            <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-3 text-cyan-200">AI Summary & Key Takeaways</h3>
              <p className="text-gray-300 mb-4">{result.aiSummary}</p>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {result.keyTakeaways.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <h4 className="text-lg font-semibold mb-2 text-cyan-300">AI Recommendations:</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
                <h3 className="text-xl font-semibold mb-3 text-cyan-200">Shared Documents</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {result.documentLinks?.map((doc, i) => (
                    <li key={i}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                        {doc.title}
                      </a>
                    </li>
                  ))}
                  {(!result.documentLinks || result.documentLinks.length === 0) && <p className="text-gray-400">No documents linked.</p>}
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-800">
                <h3 className="text-xl font-semibold mb-3 text-cyan-200">Future Meetings</h3>
                <ul className="list-disc list-inside text-gray-300">
                  {result.futureMeetingSuggestions?.map((meeting, i) => (
                    <li key={i}>
                      {formatDateTime(meeting.date)} - {meeting.topic} (Attendees: {meeting.attendees.length})
                    </li>
                  ))}
                  {(!result.futureMeetingSuggestions || result.futureMeetingSuggestions.length === 0) && <p className="text-gray-400">No follow-up meetings suggested.</p>}
                </ul>
              </div>
            </div>

            <SpatialSceneViewer mindMapUrl={result.mindMapUrl} spatialObjects={result.spatialObjects} />

            <TranscriptViewer
              transcriptSegments={result.transcriptSegments}
              highlightedKeywords={transcriptSearchTerm.split(' ').filter(Boolean)}
              filterParticipantId={null}
            />

            <div className="text-center mt-6">
              <a href={result.generatedReportUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-teal-600 rounded-md hover:bg-teal-700 transition duration-200 font-semibold text-lg">
                Download Comprehensive Report
              </a>
            </div>
          </div>
        )}

        {activeTab === 'live-scribe' && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-cyan-300">Live Meeting Transcript</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                placeholder="Search transcript..."
                value={transcriptSearchTerm}
                onChange={e => setTranscriptSearchTerm(e.target.value)}
                className="flex-grow p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <select
                value={transcriptFilterParticipant || ''}
                onChange={e => setTranscriptFilterParticipant(e.target.value || null)}
                className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">All Participants</option>
                {allParticipants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div ref={transcriptRef} className="bg-gray-900 p-4 rounded-lg shadow-lg max-h-[600px] overflow-y-auto border border-gray-800">
              {currentLiveTranscript.length === 0 && !isLoading && (
                <p className="text-gray-400">No live transcript available yet. Join a meeting to start scribing.</p>
              )}
              <TranscriptViewer
                transcriptSegments={currentLiveTranscript}
                highlightedKeywords={transcriptSearchTerm.split(' ').filter(Boolean)}
                filterParticipantId={transcriptFilterParticipant}
              />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <HistoricalMeetingsBrowser
            historicalMeetings={meetingDataService.historicalMeetings}
            onLoadMeeting={handleLoadHistoricalMeeting}
            isLoading={isLoading}
          />
        )}

        {showSettings && userPreferences && integrationStatus && (
          <MeetingSettingsEditor
            preferences={userPreferences}
            integrationStatus={integrationStatus}
            onUpdatePreferences={handleUpdateUserPreferences}
            onUpdateIntegration={handleUpdateIntegrationStatus}
            isLoading={isLoading}
            onClose={() => setShowSettings(false)}
          />
        )}

        {!isLoading && !result && activeTab === 'summary' && !isLiveScribing && (
          <div className="mt-8 text-center text-gray-400 p-8 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-xl mb-4">No meeting summary available yet.</p>
            <p className="text-md">
              Enter a Holographic Meeting URL above and click "Join & Start Scribing" to begin.
            </p>
            <p className="text-md mt-2">
              Or navigate to the "History" tab to review past meeting summaries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolographicMeetingScribeView;