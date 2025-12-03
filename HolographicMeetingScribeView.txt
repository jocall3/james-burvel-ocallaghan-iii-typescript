import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Interface for a single participant's transcript segment.
 */
interface TranscriptSegment {
  participantId: string;
  participantName: string;
  text: string;
  timestamp: number; // Milliseconds from start of meeting
  sentimentScore?: number; // -1 (negative) to 1 (positive)
  emotions?: { joy: number; sadness: number; anger: number; fear: number; surprise: number };
  keywords?: string[];
  intent?: string; // e.g., "question", "statement", "action_proposal"
}

/**
 * Interface for an action item, extended with more details.
 */
interface ActionItemExtended {
  id: string;
  assigneeId: string;
  assigneeName: string;
  task: string;
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
  dueDate: number; // Timestamp
  priority: 'low' | 'medium' | 'high' | 'critical';
  contextualTranscriptSegmentIds?: string[]; // IDs of transcript segments related to this action item
  notes?: string;
  createdBy: string; // Participant ID who proposed it
  createdAt: number; // Timestamp
  updatedAt?: number;
}

/**
 * Interface for a detected decision.
 */
interface DecisionRecord {
  id: string;
  summary: string;
  participantsInvolvedIds: string[];
  pros?: string[];
  cons?: string[];
  rationale?: string;
  decidedBy: string; // Participant ID who made the final call, or "consensus"
  timestamp: number; // When the decision was made/recorded
  relatedActionItemIds?: string[];
  keywords?: string[];
}

/**
 * Interface for detected topics within the meeting.
 */
interface TopicInsight {
  id: string;
  name: string;
  keywords: string[];
  relevanceScore: number; // 0-1
  summary?: string;
  sentiment?: { average: number; trend: 'rising' | 'falling' | 'stable' };
  startTimestamp: number;
  endTimestamp: number;
  relatedTranscriptSegmentIds?: string[];
}

/**
 * Interface for detailed participant information.
 */
export interface ParticipantDetailedInfo {
  id: string;
  name: string;
  role: string; // e.g., "Host", "Guest", "Presenter"
  email: string;
  organization: string;
  avatarUrl: string;
  joinTime: number;
  leaveTime?: number;
  totalSpeakingTime: number; // in seconds
  speakingSegmentsCount: number;
  overallSentiment: { average: number; trend: 'rising' | 'falling' | 'stable' };
  engagementScore: number; // 0-100
  dominantEmotions?: { emotion: string; score: number }[];
  keyContributions?: string[]; // Summarized contributions
}

/**
 * Interface for a 3D spatial object detected or placed in the holographic environment.
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
  metadata?: { [key: string]: any }; // e.g., URL for a presentation, content for a whiteboard
  snapshotUrl?: string; // URL to a 2D rendering of the object
}

/**
 * Interface for the overall meeting sentiment.
 */
export interface OverallMeetingSentiment {
  averageScore: number; // -1 to 1
  sentimentTrend: { timestamp: number; score: number }[];
  dominantEmotions: { emotion: string; percentage: number }[];
  positiveSegmentsCount: number;
  negativeSegmentsCount: number;
  neutralSegmentsCount: number;
}

/**
 * Interface for general meeting metadata.
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
  meetingPlatform: string; // e.g., "Microsoft Mesh", "Meta Horizon Workrooms"
  recordingUrl?: string; // URL to the raw recording if available
  location: string; // Virtual room name/ID
  tags: string[];
  category: string; // e.g., "Project Sync", "Brainstorm", "Client Review"
}

/**
 * Extended MeetingSummary interface that combines all the detailed data.
 */
export interface MeetingSummaryExtended {
  metadata: MeetingMetadata;
  participants: ParticipantDetailedInfo[];
  transcriptSegments: TranscriptSegment[];
  actionItems: ActionItemExtended[];
  decisions: DecisionRecord[];
  topics: TopicInsight[];
  mindMapUrl: string; // URL to a 3D model (GLB/GLTF)
  spatialObjects: SpatialObject[];
  overallSentiment: OverallMeetingSentiment;
  documentLinks?: { title: string; url: string; accessedBy?: string[] }[];
  keyTakeaways: string[];
  aiSummary: string; // A high-level AI-generated summary
  recommendations?: string[]; // AI-generated recommendations based on meeting
  futureMeetingSuggestions?: { date: number; topic: string; attendees: string[] }[];
  generatedReportUrl?: string; // URL to a comprehensive report
}

/**
 * Interface for user preferences related to the scribe tool.
 */
export interface UserPreferences {
  theme: 'dark' | 'light';
  transcriptDisplayMode: 'realtime' | 'summary' | 'full';
  defaultLanguage: string;
  aiModelPreference: 'standard' | 'advanced' | 'custom';
  autoExportToCRM: boolean;
  autoScheduleFollowUp: boolean;
  notificationSettings: {
    newActionItem: boolean;
    meetingEndedSummary: boolean;
    sentimentAlert: boolean;
  };
}

/**
 * Interface for a historical meeting record for browsing.
 */
export interface HistoricalMeetingRecord {
  id: string;
  title: string;
  date: number; // Timestamp
  duration: number; // Seconds
  hostName: string;
  keyTopics: string[];
  overallSentimentScore: number;
  actionItemsCount: number;
  summaryPreview: string;
}

/**
 * Constants for mock data generation.
 */
const MOCK_PARTICIPANT_NAMES = ["Avatar Alice", "Avatar Bob", "Avatar Carol", "Avatar Dave", "Avatar Eve", "Avatar Frank", "Holo Grace", "Holo Henry"];
const MOCK_ROLES = ["Host", "Presenter", "Participant", "Observer"];
const MOCK_ORGS = ["InnovateX Corp", "Synergy Global", "FutureScape Inc.", "Quantum Dynamics"];
const MOCK_TOPICS = ["Q4 Growth Strategy", "Marketing Campaign Launch", "Product Roadmap Review", "Budget Allocation", "Team Re-org", "Client Feedback", "Holographic Scribe Features"];
const MOCK_ACTIONS = ["Lead new marketing campaign for Q4", "Finalize product roadmap document", "Prepare budget proposal for next fiscal year", "Schedule follow-up with client X", "Research new VR collaboration tools", "Update sprint backlog with new features", "Draft Q4 sales report"];
const MOCK_DECISIONS = ["Approved Q4 marketing budget", "Prioritized Feature A over Feature B for next sprint", "Agreed to postpone hiring until Q1", "Decided on new team lead for project Alpha"];
const MOCK_EMOTIONS = ['joy', 'sadness', 'anger', 'fear', 'surprise'];
const MOCK_INTENTS = ['question', 'statement', 'action_proposal', 'clarification', 'agreement', 'disagreement'];
const MOCK_STATUSES = ['open', 'in_progress', 'completed', 'deferred'];
const MOCK_PRIORITIES = ['low', 'medium', 'high', 'critical'];

/**
 * Utility function to generate a unique ID.
 * @returns {string} A unique ID.
 */
export const generateId = (): string => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Utility function to simulate AI processing time.
 * @param {number} ms - Milliseconds to delay.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const simulateAILoad = (ms: number = 1000): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Utility function to get a random item from an array.
 * @param {T[]} arr - The array to pick from.
 * @returns {T} A random item from the array.
 */
export const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Utility function to generate a random number within a range.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} A random number.
 */
export const getRandomNumber = (min: number, max: number): number => Math.random() * (max - min) + min;

/**
 * Utility function to format a timestamp into a human-readable date/time string.
 * @param {number} timestamp - The timestamp in milliseconds.
 * @returns {string} Formatted date and time.
 */
export const formatDateTime = (timestamp: number): string => new Date(timestamp).toLocaleString();

/**
 * Utility function to format duration in seconds into Hh M' S".
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
 * @param {string} text - The text to analyze.
 * @returns {Promise<number>} A promise resolving to a sentiment score (-1 to 1).
 */
export const analyzeTextSentiment = async (text: string): Promise<number> => {
  await simulateAILoad(300);
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  if (words.some(word => ['great', 'excellent', 'positive', 'good', 'effective'].includes(word))) score += 0.5;
  if (words.some(word => ['bad', 'poor', 'negative', 'issue', 'problem'].includes(word))) score -= 0.5;
  return Math.max(-1, Math.min(1, getRandomNumber(-0.5, 0.5) + score));
};

/**
 * MOCK AI Service for extracting emotions.
 * @param {string} text - The text to analyze.
 * @returns {Promise<{[key: string]: number}>} A promise resolving to an object of emotions and scores.
 */
export const extractEmotions = async (text: string): Promise<{[key: string]: number}> => {
  await simulateAILoad(200);
  const emotions: {[key: string]: number} = {};
  MOCK_EMOTIONS.forEach(e => emotions[e] = getRandomNumber(0, 0.3));
  if (text.toLowerCase().includes('happy')) emotions['joy'] = getRandomNumber(0.4, 0.8);
  if (text.toLowerCase().includes('problem')) emotions['sadness'] = getRandomNumber(0.4, 0.7);
  return emotions;
};

/**
 * MOCK AI Service for extracting keywords.
 * @param {string} text - The text to analyze.
 * @returns {Promise<string[]>} A promise resolving to an array of keywords.
 */
export const extractKeywords = async (text: string): Promise<string[]> => {
  await simulateAILoad(100);
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
  const uniqueWords = Array.from(new Set(words));
  return uniqueWords.slice(0, Math.min(3, uniqueWords.length));
};

/**
 * MOCK AI Service for identifying intent.
 * @param {string} text - The text to analyze.
 * @returns {Promise<string>} A promise resolving to the identified intent.
 */
export const identifyIntent = async (text: string): Promise<string> => {
  await simulateAILoad(150);
  if (text.endsWith('?')) return 'question';
  if (text.toLowerCase().includes('we should')) return 'action_proposal';
  if (text.toLowerCase().includes('i agree')) return 'agreement';
  return getRandomItem(MOCK_INTENTS.filter(i => i !== 'question' && i !== 'action_proposal' && i !== 'agreement'));
};

/**
 * MOCK AI Service for generating a high-level summary.
 * @param {TranscriptSegment[]} transcriptSegments - The full transcript.
 * @returns {Promise<string>} A promise resolving to a summary string.
 */
export const generateAISummary = async (transcriptSegments: TranscriptSegment[]): Promise<string> => {
  await simulateAILoad(2000);
  const keyStatements = transcriptSegments
    .filter(s => s.sentimentScore && s.sentimentScore > 0.5 && s.text.length > 20)
    .map(s => s.text);
  const summary = `The meeting was productive, focusing on key strategies. ${keyStatements.slice(0, 2).join(' ')}... This summary is a mock AI output demonstrating content summarization capabilities.`;
  return summary;
};

/**
 * MOCK AI Service for recommending future actions/meetings.
 * @param {MeetingSummaryExtended} summary - The extended meeting summary.
 * @returns {Promise<string[]>} A promise resolving to an array of recommendations.
 */
export const generateAIRecommendations = async (summary: MeetingSummaryExtended): Promise<string[]> => {
  await simulateAILoad(1500);
  const recommendations = [
    `Recommend a follow-up meeting to track progress on "${getRandomItem(MOCK_ACTIONS)}".`,
    `Suggest exploring alternative solutions for topics with negative sentiment like "${getRandomItem(summary.topics)?.name || 'an unnamed issue'}".`,
    `Consider providing more context on decision "${getRandomItem(summary.decisions)?.summary || 'a key decision'}" in a shared document.`,
  ];
  return recommendations;
};

/**
 * MOCK 3D Service for generating a mind map GLB URL.
 * In a real app, this would involve processing data and interacting with a 3D rendering engine.
 * @param {MeetingSummaryExtended} summary - The extended meeting summary.
 * @returns {Promise<string>} A promise resolving to a mock GLB URL.
 */
export const generateMockMindMapGLB = async (summary: MeetingSummaryExtended): Promise<string> => {
  await simulateAILoad(2500); // Simulate complex 3D generation
  // In a real scenario, this would generate a GLB file dynamically based on topics, action items, etc.
  // For now, we return a static mock URL.
  const uniqueTopics = Array.from(new Set(summary.topics.map(t => t.name))).join('_');
  const uniqueParticipants = Array.from(new Set(summary.participants.map(p => p.name))).join('_');
  return `/mock/3d/meeting_mind_map_${uniqueTopics.substring(0, 10)}_${uniqueParticipants.substring(0, 10)}.glb`;
};

/**
 * MOCK 3D Service for generating a 3D meeting scene URL.
 * This would represent the spatial context of the meeting.
 * @param {MeetingSummaryExtended} summary - The extended meeting summary.
 * @returns {Promise<string>} A promise resolving to a mock GLB URL.
 */
export const generateMockSpatialSceneGLB = async (summary: MeetingSummaryExtended): Promise<string> => {
  await simulateAILoad(3000); // Simulate complex 3D scene generation
  const meetingId = summary.metadata.id;
  return `/mock/3d/meeting_scene_${meetingId}.glb`;
};

/**
 * MOCK Service to simulate interaction with a User Profile Service.
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
    notificationSettings: {
      newActionItem: true,
      meetingEndedSummary: true,
      sentimentAlert: false,
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
   * @returns {Promise<UserPreferences>} A promise resolving to user preferences.
   */
  public async getPreferences(): Promise<UserPreferences> {
    await simulateAILoad(200); // Simulate network delay
    console.log('Fetching user preferences:', this.currentUserPreferences);
    return { ...this.currentUserPreferences };
  }

  /**
   * Updates the current user's preferences.
   * @param {Partial<UserPreferences>} newPreferences - The preferences to update.
   * @returns {Promise<UserPreferences>} A promise resolving to the updated preferences.
   */
  public async updatePreferences(newPreferences: Partial<UserPreferences>): Promise<UserPreferences> {
    await simulateAILoad(300); // Simulate network delay
    this.currentUserPreferences = { ...this.currentUserPreferences, ...newPreferences };
    console.log('Updated user preferences:', this.currentUserPreferences);
    return { ...this.currentUserPreferences };
  }
}

/**
 * MOCK Service to simulate integration with external systems.
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
   * @returns {Promise<IntegrationStatus>} A promise resolving to integration status.
   */
  public async getIntegrationStatus(): Promise<IntegrationStatus> {
    await simulateAILoad(150);
    return { ...this.integrationStatus };
  }

  /**
   * Connects to a specific service.
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
    console.log(`Service ${serviceName} connection updated to ${connect}. Current status:`, this.integrationStatus);
    return { ...this.integrationStatus };
  }

  /**
   * Exports action items to a mock CRM.
   * @param {ActionItemExtended[]} actionItems - The action items to export.
   * @returns {Promise<boolean>} True if successful.
   */
  public async exportActionItemsToCRM(actionItems: ActionItemExtended[]): Promise<boolean> {
    if (!this.integrationStatus.crmConnected) {
      console.warn("CRM not connected. Cannot export action items.");
      return false;
    }
    await simulateAILoad(1000);
    console.log("Exported action items to CRM:", actionItems.map(ai => ai.task));
    return true;
  }

  /**
   * Schedules a follow-up meeting in a mock calendar.
   * @param {{ date: number; topic: string; attendees: string[] }} meetingDetails - Details of the meeting.
   * @returns {Promise<boolean>} True if successful.
   */
  public async scheduleFollowUpMeeting(meetingDetails: { date: number; topic: string; attendees: string[] }): Promise<boolean> {
    if (!this.integrationStatus.calendarConnected) {
      console.warn("Calendar not connected. Cannot schedule follow-up.");
      return false;
    }
    await simulateAILoad(800);
    console.log("Scheduled follow-up meeting:", meetingDetails);
    return true;
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
 * MOCK Service to simulate the backend for meeting data and AI processing.
 */
export class MeetingDataService {
  private static instance: MeetingDataService;
  private historicalMeetings: HistoricalMeetingRecord[] = [];

  private constructor() {
    // Generate some mock historical meetings
    for (let i = 0; i < 10; i++) {
      const id = generateId();
      const date = Date.now() - (i * 7 * 24 * 60 * 60 * 1000) - getRandomNumber(0, 3 * 24 * 60 * 60 * 1000); // Past meetings
      const duration = Math.floor(getRandomNumber(30, 120) * 60);
      const hostName = getRandomItem(MOCK_PARTICIPANT_NAMES);
      const keyTopics = Array.from({ length: getRandomNumber(2, 4) }, () => getRandomItem(MOCK_TOPICS));
      const overallSentimentScore = getRandomNumber(-0.5, 0.8);
      const actionItemsCount = Math.floor(getRandomNumber(0, 5));
      const summaryPreview = `Brief overview of meeting #${i + 1} held on ${new Date(date).toLocaleDateString()}. Covered ${keyTopics.join(', ')} and generated ${actionItemsCount} action items.`;
      this.historicalMeetings.push({
        id, title: `Weekly Sync - Project ${String.fromCharCode(65 + i)}`, date, duration, hostName, keyTopics, overallSentimentScore, actionItemsCount, summaryPreview
      });
    }
    console.log('Initialized with historical meetings:', this.historicalMeetings.length);
  }

  public static getInstance(): MeetingDataService {
    if (!MeetingDataService.instance) {
      MeetingDataService.instance = new MeetingDataService();
    }
    return MeetingDataService.instance;
  }

  /**
   * Fetches historical meeting records.
   * @returns {Promise<HistoricalMeetingRecord[]>} A promise resolving to an array of historical meeting records.
   */
  public async getHistoricalMeetings(): Promise<HistoricalMeetingRecord[]> {
    await simulateAILoad(500);
    return [...this.historicalMeetings];
  }

  /**
   * Fetches a specific full meeting summary by ID.
   * @param {string} meetingId - The ID of the meeting to fetch.
   * @returns {Promise<MeetingSummaryExtended | null>} A promise resolving to the meeting summary or null if not found.
   */
  public async getMeetingSummaryById(meetingId: string): Promise<MeetingSummaryExtended | null> {
    await simulateAILoad(1500); // Simulate fetching complex data
    // For now, only mock for the current meeting, or return a placeholder for historical
    if (this.historicalMeetings.some(m => m.id === meetingId)) {
      console.log(`Simulating retrieval of historical meeting ${meetingId}. Generating full mock data.`);
      const baseTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // A week ago
      const mockResult = await generateMockMeetingSummary(baseTime, "Holographic Review - Past Session");
      mockResult.metadata.id = meetingId;
      return mockResult;
    }
    return null; // Not found
  }

  /**
   * Simulates fetching real-time transcript data.
   * In a real scenario, this would be a WebSocket or long-polling.
   * @param {string} meetingUrl - The URL of the holographic meeting.
   * @param {number} offset - The timestamp offset to fetch from.
   * @returns {Promise<TranscriptSegment[]>} New transcript segments.
   */
  public async fetchLiveTranscriptSegments(meetingUrl: string, offset: number): Promise<TranscriptSegment[]> {
    await simulateAILoad(getRandomNumber(500, 1500)); // Simulate async streaming
    if (!meetingUrl || meetingUrl === "error") {
      throw new Error("Invalid meeting URL for live transcript.");
    }

    const currentTimestamp = Date.now();
    const newSegments: TranscriptSegment[] = [];
    const participants = MOCK_PARTICIPANT_NAMES.map(name => ({ id: generateId(), name }));

    if (offset === 0) { // First fetch, add some initial data
      for (let i = 0; i < 5; i++) {
        const participant = getRandomItem(participants);
        const text = `Initial setup comment ${i + 1} from ${participant.name}.`;
        const segment: TranscriptSegment = {
          participantId: participant.id,
          participantName: participant.name,
          text: text,
          timestamp: currentTimestamp - (5 - i) * 10000, // 10s intervals
        };
        segment.sentimentScore = await analyzeTextSentiment(segment.text);
        segment.emotions = await extractEmotions(segment.text);
        segment.keywords = await extractKeywords(segment.text);
        segment.intent = await identifyIntent(segment.text);
        newSegments.push(segment);
      }
    } else {
      // Simulate new segments coming in
      if (Math.random() > 0.3) { // Not every poll gets new data
        for (let i = 0; i < getRandomNumber(1, 3); i++) {
          const participant = getRandomItem(participants);
          const textOptions = [
            `Continuing the discussion on ${getRandomItem(MOCK_TOPICS)}.`,
            `I think we should consider ${getRandomItem(MOCK_ACTIONS).toLowerCase()}.`,
            `What are your thoughts on this, ${getRandomItem(MOCK_PARTICIPANT_NAMES)}?`,
            `Let's make a decision on ${getRandomItem(MOCK_DECISIONS).toLowerCase()}.`,
            `I'm feeling positive about this direction.`,
            `There are some challenges we need to address with this.`,
            `Can we get an update on that task?`,
          ];
          const text = getRandomItem(textOptions);
          const segment: TranscriptSegment = {
            participantId: participant.id,
            participantName: participant.name,
            text: text,
            timestamp: currentTimestamp - getRandomNumber(1000, 5000), // Simulate recent entry
          };
          segment.sentimentScore = await analyzeTextSentiment(segment.text);
          segment.emotions = await extractEmotions(segment.text);
          segment.keywords = await extractKeywords(segment.text);
          segment.intent = await identifyIntent(segment.text);
          newSegments.push(segment);
        }
      }
    }
    return newSegments.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Simulates processing the entire meeting data to generate the final summary.
   * This would involve extensive AI/ML operations.
   * @param {TranscriptSegment[]} fullTranscript - The complete raw transcript.
   * @param {string} meetingTitle - The title of the meeting.
   * @returns {Promise<MeetingSummaryExtended>} The comprehensive meeting summary.
   */
  public async finalizeMeetingSummary(fullTranscript: TranscriptSegment[], meetingTitle: string): Promise<MeetingSummaryExtended> {
    console.log("Finalizing meeting summary with extensive AI processing...");
    await simulateAILoad(5000); // Simulate heavy AI processing

    const startTime = fullTranscript[0]?.timestamp || Date.now();
    const endTime = fullTranscript[fullTranscript.length - 1]?.timestamp || Date.now() + 3600000; // Assume 1 hour if no transcript
    const durationSeconds = Math.round((endTime - startTime) / 1000);

    const participantsMap = new Map<string, ParticipantDetailedInfo>();
    const actionItems: ActionItemExtended[] = [];
    const decisions: DecisionRecord[] = [];
    const topics: TopicInsight[] = [];
    const allSentiments: { timestamp: number; score: number }[] = [];
    let totalPositive = 0, totalNegative = 0, totalNeutral = 0;

    // Process transcript segments for participants, sentiment, etc.
    for (const segment of fullTranscript) {
      if (!participantsMap.has(segment.participantId)) {
        participantsMap.set(segment.participantId, {
          id: segment.participantId,
          name: segment.participantName,
          role: getRandomItem(MOCK_ROLES),
          email: `${segment.participantName.replace(/\s/g, '').toLowerCase()}@example.com`,
          organization: getRandomItem(MOCK_ORGS),
          avatarUrl: `/avatars/${segment.participantId}.png`,
          joinTime: startTime, // Simplistic: all join at start for mock
          totalSpeakingTime: 0,
          speakingSegmentsCount: 0,
          overallSentiment: { average: 0, trend: 'stable' },
          engagementScore: getRandomNumber(50, 95),
        });
      }
      const p = participantsMap.get(segment.participantId)!;
      p.speakingSegmentsCount++;
      p.totalSpeakingTime += Math.max(10, segment.text.length / 5); // Estimate speaking time

      if (segment.sentimentScore !== undefined) {
        allSentiments.push({ timestamp: segment.timestamp, score: segment.sentimentScore });
        if (segment.sentimentScore > 0.2) totalPositive++;
        else if (segment.sentimentScore < -0.2) totalNegative++;
        else totalNeutral++;
      }

      // Mock action item extraction
      if (segment.intent === 'action_proposal' || segment.text.toLowerCase().includes('i will take')) {
        actionItems.push({
          id: generateId(),
          assigneeId: segment.participantId,
          assigneeName: segment.participantName,
          task: segment.text.replace(/i will take point on|we need to focus on/gi, '').trim(),
          status: getRandomItem(MOCK_STATUSES),
          dueDate: Date.now() + getRandomNumber(3, 30) * 24 * 60 * 60 * 1000,
          priority: getRandomItem(MOCK_PRIORITIES),
          createdBy: segment.participantId,
          createdAt: segment.timestamp,
          contextualTranscriptSegmentIds: [generateId()], // simplified
        });
      }

      // Mock decision extraction
      if (segment.text.toLowerCase().includes('we decided') || segment.text.toLowerCase().includes('the decision is')) {
        decisions.push({
          id: generateId(),
          summary: segment.text.replace(/we decided|the decision is/gi, '').trim(),
          participantsInvolvedIds: Array.from(participantsMap.keys()).slice(0, getRandomNumber(2, 4)),
          decidedBy: segment.participantId,
          timestamp: segment.timestamp,
        });
      }
    }

    // Aggregate participant sentiments
    participantsMap.forEach(p => {
      const pSegments = fullTranscript.filter(s => s.participantId === p.id && s.sentimentScore !== undefined);
      if (pSegments.length > 0) {
        const avgScore = pSegments.reduce((sum, s) => sum + s.sentimentScore!, 0) / pSegments.length;
        p.overallSentiment.average = avgScore;
        // Simple trend calculation
        if (pSegments.length > 3) {
          const lastScores = pSegments.slice(-3).map(s => s.sentimentScore!);
          if (lastScores[2] > lastScores[0] + 0.1) p.overallSentiment.trend = 'rising';
          else if (lastScores[2] < lastScores[0] - 0.1) p.overallSentiment.trend = 'falling';
        }
      }
    });

    // Mock topic generation
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
          relatedTranscriptSegmentIds: relevantSegments.map(s => generateId()), // Simplified
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
      hostId: fullTranscript[0]?.participantId || generateId(),
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
      mindMapUrl: await generateMockMindMapGLB({} as MeetingSummaryExtended), // Passed empty, as the mock generates static for now
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
      recommendations: [], // Will be filled later
      futureMeetingSuggestions: [
        { date: Date.now() + 7 * 24 * 60 * 60 * 1000, topic: "Q4 Strategy Follow-up", attendees: metadata.attendeeIds },
      ],
      generatedReportUrl: `https://example.com/reports/${metadata.id}.pdf`,
    };

    generatedSummary.recommendations = await generateAIRecommendations(generatedSummary);
    generatedSummary.mindMapUrl = await generateMockMindMapGLB(generatedSummary); // Re-generate with proper summary
    generatedSummary.spatialObjects.push({
      id: generateId(), type: '3d_model', label: 'Meeting Room Context', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, metadata: { modelUrl: await generateMockSpatialSceneGLB(generatedSummary) }
    });

    console.log("Finalized Meeting Summary:", generatedSummary);
    return generatedSummary;
  }
}

/**
 * Generates a comprehensive mock MeetingSummaryExtended object.
 * This function will create a very detailed, simulated meeting result.
 * @param {number} baseTime - The starting timestamp for the meeting.
 * @param {string} meetingTitle - The title of the mock meeting.
 * @returns {Promise<MeetingSummaryExtended>} A fully populated mock meeting summary.
 */
export const generateMockMeetingSummary = async (baseTime: number = Date.now(), meetingTitle: string = "Holographic Team Sync"): Promise<MeetingSummaryExtended> => {
  const meetingId = generateId();
  const startTime = baseTime - getRandomNumber(0, 3600000); // Up to 1 hour before baseTime
  const endTime = baseTime + getRandomNumber(3600000, 7200000); // 1-2 hours after baseTime
  const durationSeconds = Math.round((endTime - startTime) / 1000);

  const participants: ParticipantDetailedInfo[] = MOCK_PARTICIPANT_NAMES.slice(0, getRandomNumber(3, 6)).map(name => ({
    id: generateId(),
    name: name,
    role: getRandomItem(MOCK_ROLES),
    email: `${name.replace(/\s/g, '').toLowerCase()}@example.com`,
    organization: getRandomItem(MOCK_ORGS),
    avatarUrl: `/avatars/${name.replace(/\s/g, '').toLowerCase()}.png`,
    joinTime: startTime + getRandomNumber(0, 60000), // Joined within first minute
    totalSpeakingTime: Math.floor(getRandomNumber(300, 1800)), // 5-30 mins
    speakingSegmentsCount: Math.floor(getRandomNumber(10, 50)),
    overallSentiment: { average: getRandomNumber(-0.5, 0.8), trend: getRandomItem(['rising', 'falling', 'stable']) },
    engagementScore: Math.floor(getRandomNumber(60, 99)),
  }));

  const transcriptSegments: TranscriptSegment[] = [];
  let currentTimestamp = startTime;
  const totalDuration = endTime - startTime;

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
      `Does anyone have questions about the new AI integration?`
    ];
    const text = getRandomItem(textOptions);
    const sentiment = await analyzeTextSentiment(text);
    const emotions = await extractEmotions(text);
    const keywords = await extractKeywords(text);
    const intent = await identifyIntent(text);

    transcriptSegments.push({
      participantId: participant.id,
      participantName: participant.name,
      text,
      timestamp: currentTimestamp,
      sentimentScore: sentiment,
      emotions: emotions as any, // Type assertion for mock
      keywords,
      intent,
    });
    currentTimestamp += getRandomNumber(10000, 60000); // Add 10-60 seconds
    if (transcriptSegments.length > 200) break; // Cap for mock data generation
  }

  const actionItems: ActionItemExtended[] = [];
  MOCK_ACTIONS.slice(0, getRandomNumber(2, 5)).forEach(task => {
    const assignee = getRandomItem(participants);
    const creator = getRandomItem(participants);
    actionItems.push({
      id: generateId(),
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      task: task,
      status: getRandomItem(MOCK_STATUSES),
      dueDate: Date.now() + getRandomNumber(7, 30) * 24 * 60 * 60 * 1000, // 1-4 weeks from now
      priority: getRandomItem(MOCK_PRIORITIES),
      createdBy: creator.id,
      createdAt: startTime + getRandomNumber(0, totalDuration),
      notes: "Follow-up required.",
    });
  });

  const decisions: DecisionRecord[] = [];
  MOCK_DECISIONS.slice(0, getRandomNumber(1, 3)).forEach(summary => {
    decisions.push({
      id: generateId(),
      summary: summary,
      participantsInvolvedIds: participants.slice(0, getRandomNumber(2, participants.length)).map(p => p.id),
      decidedBy: getRandomItem(participants).id,
      timestamp: startTime + getRandomNumber(0, totalDuration),
      rationale: "Based on team consensus and data analysis.",
    });
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
    hostId: participants[0]?.id || generateId(),
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
  const recommendations = await generateAIRecommendations({} as MeetingSummaryExtended); // Mocked, as full summary is not yet built

  const fullSummary: MeetingSummaryExtended = {
    metadata,
    participants,
    transcriptSegments,
    actionItems,
    decisions,
    topics,
    mindMapUrl: await generateMockMindMapGLB({} as MeetingSummaryExtended), // Placeholder, will regenerate after all data is available
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
  };

  // Re-generate mind map and spatial scene GLB with the full summary data
  fullSummary.mindMapUrl = await generateMockMindMapGLB(fullSummary);
  fullSummary.spatialObjects.push({
    id: generateId(), type: '3d_model', label: 'Meeting Room Environment', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, metadata: { modelUrl: await generateMockSpatialSceneGLB(fullSummary) }
  });


  console.log('Generated mock meeting summary:', fullSummary);
  return fullSummary;
};

// --- Sub-components for better UI structure within this massive file ---

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
 * @param {MeetingDetailsHeaderProps} props - The props for the component.
 * @returns {JSX.Element} The rendered header.
 */
export const MeetingDetailsHeader: React.FC<MeetingDetailsHeaderProps> = ({ metadata, participants, overallSentiment, durationSeconds }) => {
  const avgSentimentColor = overallSentiment.averageScore > 0.3 ? 'text-green-400' : overallSentiment.averageScore < -0.3 ? 'text-red-400' : 'text-yellow-400';
  const sentimentEmoji = overallSentiment.averageScore > 0.3 ? '😊' : overallSentiment.averageScore < -0.3 ? '😠' : '😐';

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
 * @param {TranscriptViewerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered transcript viewer.
 */
export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcriptSegments, highlightedKeywords, filterParticipantId }) => {
  const filteredSegments = useMemo(() => {
    return transcriptSegments.filter(segment =>
      !filterParticipantId || segment.participantId === filterParticipantId
    );
  }, [transcriptSegments, filterParticipantId]);

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
              newResult.push(<span key={`highlight-${keyword}-${idx}`} className="bg-yellow-500 text-gray-900 rounded px-1">{part}</span>);
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
          <div key={t.timestamp + i} className="flex flex-col md:flex-row md:items-baseline gap-2">
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
  onAddActionItem: (newItem: Omit<ActionItemExtended, 'id' | 'createdAt'>) => void;
  participants: ParticipantDetailedInfo[];
}

/**
 * Manages the list of action items with CRUD capabilities.
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

  useEffect(() => {
    if (participants.length > 0 && !newAssigneeId) {
      setNewAssigneeId(participants[0].id);
    }
  }, [participants, newAssigneeId]);

  const handleAddTask = () => {
    if (newTask.trim() && newAssigneeId) {
      const assigneeName = participants.find(p => p.id === newAssigneeId)?.name || 'Unknown';
      onAddActionItem({
        assigneeId: newAssigneeId,
        assigneeName: assigneeName,
        task: newTask,
        status: 'open',
        dueDate: newDueDate ? new Date(newDueDate).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1000,
        priority: newPriority,
        createdBy: 'current_user_mock_id', // Mock current user
      });
      setNewTask('');
      setNewDueDate('');
      setNewPriority('medium');
    }
  };

  const handleStatusChange = (id: string, status: ActionItemExtended['status']) => {
    onUpdateActionItem(id, { status, updatedAt: Date.now() });
  };

  const handlePriorityChange = (id: string, priority: ActionItemExtended['priority']) => {
    onUpdateActionItem(id, { priority, updatedAt: Date.now() });
  };

  const handleDueDateChange = (id: string, date: string) => {
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
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Add new action item..."
          className="flex-grow p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <select
          value={newAssigneeId}
          onChange={e => setNewAssigneeId(e.target.value)}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value as ActionItemExtended['priority'])}
          className="p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          {['low', 'medium', 'high', 'critical'].map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <button onClick={handleAddTask} className="p-2 bg-cyan-600 rounded whitespace-nowrap hover:bg-cyan-700 transition duration-200">Add Item</button>
      </div>
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
              <input
                type="date"
                value={new Date(item.dueDate).toISOString().split('T')[0]}
                onChange={e => handleDueDateChange(item.id, e.target.value)}
                className="p-1 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Due Date"
              />
              <select
                value={item.status}
                onChange={e => handleStatusChange(item.id, e.target.value as ActionItemExtended['status'])}
                className="p-1 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                title="Change Status"
              >
                {['open', 'in_progress', 'completed', 'deferred'].map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <button onClick={() => onDeleteActionItem(item.id)} className="text-red-400 hover:text-red-500 transition duration-200 p-1" title="Delete Action Item">
                ✕
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
  onAddDecision: (newDecision: Omit<DecisionRecord, 'id' | 'timestamp'>) => void;
  onUpdateDecision: (id: string, updates: Partial<DecisionRecord>) => void;
  onDeleteDecision: (id: string) => void;
  participants: ParticipantDetailedInfo[];
}

/**
 * Displays and manages decisions made during the meeting.
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

  useEffect(() => {
    if (participants.length > 0 && !newDecidedBy) {
      setNewDecidedBy(participants[0].id);
    }
  }, [participants, newDecidedBy]);

  const handleAddDecision = () => {
    if (newDecisionSummary.trim() && newDecidedBy) {
      onAddDecision({
        summary: newDecisionSummary,
        participantsInvolvedIds: [newDecidedBy],
        decidedBy: newDecidedBy,
        rationale: "Manually added during review.",
      });
      setNewDecisionSummary('');
      setIsAdding(false);
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
            <div className="flex gap-2 mt-2 text-sm">
              <button onClick={() => onUpdateDecision(decision.id, { rationale: prompt("Enter new rationale:", decision.rationale || '') || undefined })} className="text-cyan-400 hover:text-cyan-300 transition duration-200">Edit</button>
              <button onClick={() => onDeleteDecision(decision.id)} className="text-red-400 hover:text-red-500 transition duration-200">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <button onClick={() => setIsAdding(!isAdding)} className="p-2 bg-cyan-600 rounded hover:bg-cyan-700 transition duration-200">
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
      </div>
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
 * @param {ParticipantEngagementMetricsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered participant metrics.
 */
export const ParticipantEngagementMetrics: React.FC<ParticipantEngagementMetricsProps> = ({ participants, transcriptSegments }) => {
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const selectedParticipant = useMemo(() => {
    return participants.find(p => p.id === selectedParticipantId);
  }, [participants, selectedParticipantId]);

  const participantSpeakingTimeData = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    participants.forEach(p => data.push({ name: p.name, value: p.totalSpeakingTime }));
    return data.sort((a, b) => b.value - a.value);
  }, [participants]);

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
                .slice(-5) // Show last 5 contributions
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
 * In a real application, this would embed a complex 3D viewer (e.g., A-Frame, Three.js, Babylon.js).
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

      {/* Mock 3D Viewer Area */}
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

        {/* Mock for other spatial objects within the scene */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4">
          {spatialObjects.filter(obj => obj.type !== '3d_model').map(obj => (
            <div key={obj.id} className="text-center">
              <span className="block text-4xl text-cyan-400">{obj.type === 'whiteboard' ? '📝' : obj.type === 'presentation_screen' ? '📺' : '⚙️'}</span>
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
      console.error('Integration update error:', error);
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
      console.error('Preference save error:', error);
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
          {/* General Preferences */}
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

          {/* Automation & AI */}
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
            </div>
          </div>

          {/* Notification Settings */}
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
            </div>
          </div>

          {/* Integrations */}
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
    }).sort((a, b) => b.date - a.date); // Sort by most recent first
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

  // State for TranscriptViewer filters
  const [transcriptSearchTerm, setTranscriptSearchTerm] = useState('');
  const [transcriptFilterParticipant, setTranscriptFilterParticipant] = useState<string | null>(null);

  // Service instances
  const meetingDataService = useMemo(() => MeetingDataService.getInstance(), []);
  const userProfileService = useMemo(() => UserProfileService.getInstance(), []);
  const integrationService = useMemo(() => IntegrationService.getInstance(), []);

  const liveScribeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null); // For auto-scrolling live transcript

  // --- Effect Hooks ---

  /**
   * Effect to load user preferences and integration status on component mount.
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const prefs = await userProfileService.getPreferences();
        setUserPreferences(prefs);
        const integrations = await integrationService.getIntegrationStatus();
        setIntegrationStatus(integrations);
      } catch (err) {
        console.error("Failed to load user settings:", err);
        setError("Failed to load user settings.");
      }
    };
    loadSettings();
  }, [userProfileService, integrationService]);

  /**
   * Effect for live scribing: continuously fetches new transcript segments.
   */
  useEffect(() => {
    if (isLiveScribing && meetingUrl) {
      const fetchSegments = async () => {
        try {
          const newSegments = await meetingDataService.fetchLiveTranscriptSegments(meetingUrl, lastTranscriptTimestamp);
          if (newSegments.length > 0) {
            setCurrentLiveTranscript(prev => {
              const updated = [...prev, ...newSegments];
              // Keep transcript size reasonable for display, maybe last 100 segments
              return updated.slice(Math.max(0, updated.length - 100));
            });
            setLastTranscriptTimestamp(newSegments[newSegments.length - 1].timestamp);
          }
        } catch (err: any) {
          console.error("Live scribing error:", err);
          setError(`Live scribing failed: ${err.message}`);
          setIsLiveScribing(false);
          if (liveScribeIntervalRef.current) {
            clearInterval(liveScribeIntervalRef.current);
          }
        }
      };

      // Clear any existing interval before setting a new one
      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
      }
      liveScribeIntervalRef.current = setInterval(fetchSegments, 2000); // Poll every 2 seconds
    } else {
      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
        liveScribeIntervalRef.current = null;
      }
    }

    // Cleanup on unmount or when live scribing stops
    return () => {
      if (liveScribeIntervalRef.current) {
        clearInterval(liveScribeIntervalRef.current);
      }
    };
  }, [isLiveScribing, meetingUrl, lastTranscriptTimestamp, meetingDataService]);

  /**
   * Effect to scroll to the bottom of the live transcript when new segments arrive.
   */
  useEffect(() => {
    if (transcriptRef.current && userPreferences?.transcriptDisplayMode === 'realtime') {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [currentLiveTranscript, userPreferences?.transcriptDisplayMode]);

  // --- Handlers for main actions ---

  /**
   * Handles joining a meeting and initiating live scribing.
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
      // Simulate initial setup and connection to the holographic meeting
      await simulateAILoad(2000);
      console.log(`Successfully connected to holographic meeting: ${meetingUrl}`);

      // Start live scribing
      setIsLiveScribing(true);
      setActiveTab('live-scribe');
      // For the mock, we'll immediately fetch some initial segments.
      // The useEffect above will handle subsequent fetches.
      const initialSegments = await meetingDataService.fetchLiveTranscriptSegments(meetingUrl, 0);
      setCurrentLiveTranscript(initialSegments);
      if (initialSegments.length > 0) {
        setLastTranscriptTimestamp(initialSegments[initialSegments.length - 1].timestamp);
      }

    } catch (err: any) {
      setError(`Failed to join or start scribing: ${err.message}`);
      console.error(err);
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
      console.log("Stopping live scribing and finalizing summary...");
      const finalSummary = await meetingDataService.finalizeMeetingSummary(currentLiveTranscript, meetingUrl || "Unnamed Holographic Meeting");
      setResult(finalSummary);
      setActiveTab('summary');

      // Attempt auto-exports based on user preferences
      if (userPreferences?.autoExportToCRM && integrationStatus?.crmConnected) {
        await integrationService.exportActionItemsToCRM(finalSummary.actionItems);
      }
      if (userPreferences?.autoScheduleFollowUp && integrationStatus?.calendarConnected && finalSummary.futureMeetingSuggestions && finalSummary.futureMeetingSuggestions.length > 0) {
        await integrationService.scheduleFollowUpMeeting(finalSummary.futureMeetingSuggestions[0]);
      }

    } catch (err: any) {
      setError(`Failed to finalize meeting summary: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles loading a historical meeting by its ID.
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
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for Action Items, Decisions ---

  /**
   * Adds a new action item to the current meeting summary.
   * @param {Omit<ActionItemExtended, 'id' | 'createdAt'>} newItem - The new action item details.
   */
  const handleAddActionItem = useCallback((newItem: Omit<ActionItemExtended, 'id' | 'createdAt'>) => {
    setResult(prev => {
      if (!prev) return prev;
      const newActionItem: ActionItemExtended = {
        ...newItem,
        id: generateId(),
        createdAt: Date.now(),
      };
      return {
        ...prev,
        actionItems: [...prev.actionItems, newActionItem],
      };
    });
  }, []);

  /**
   * Updates an existing action item.
   * @param {string} id - The ID of the action item.
   * @param {Partial<ActionItemExtended>} updates - The updates to apply.
   */
  const handleUpdateActionItem = useCallback((id: string, updates: Partial<ActionItemExtended>) => {
    setResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        actionItems: prev.actionItems.map(item =>
          item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
        ),
      };
    });
  }, []);

  /**
   * Deletes an action item.
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
   * @param {Omit<DecisionRecord, 'id' | 'timestamp'>} newDecision - The new decision details.
   */
  const handleAddDecision = useCallback((newDecision: Omit<DecisionRecord, 'id' | 'timestamp'>) => {
    setResult(prev => {
      if (!prev) return prev;
      const decision: DecisionRecord = {
        ...newDecision,
        id: generateId(),
        timestamp: Date.now(),
      };
      return {
        ...prev,
        decisions: [...prev.decisions, decision],
      };
    });
  }, []);

  /**
   * Updates an existing decision.
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
   * Handler for when a topic is clicked in the TopicInsightsPanel.
   * Sets the transcript search term to highlight related discussions.
   * @param {string} topicName - The name of the topic.
   */
  const handleTopicClick = useCallback((topicName: string) => {
    setTranscriptSearchTerm(topicName);
    setActiveTab('live-scribe'); // Switch to live-scribe tab to show transcript
  }, []);

  /**
   * Updates user preferences.
   * @param {Partial<UserPreferences>} updates - The preference updates.
   * @returns {Promise<UserPreferences>} The updated preferences.
   */
  const handleUpdateUserPreferences = useCallback(async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
    try {
      const updatedPrefs = await userProfileService.updatePreferences(updates);
      setUserPreferences(updatedPrefs);
      return updatedPrefs;
    } catch (err) {
      console.error("Failed to save preferences:", err);
      throw err;
    }
  }, [userProfileService]);

  /**
   * Updates integration status.
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
      console.error(`Failed to update ${service} integration:`, err);
      throw err;
    }
  }, [integrationService]);

  const allParticipants = useMemo(() => {
    if (result) return result.participants;
    // Extract from live transcript if summary not available
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

      {/* Main Input and Action Buttons */}
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

      {/* Loading and Error Messages */}
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

      {/* Navigation Tabs */}
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

      {/* Content Area based on Active Tab */}
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

            <TopicInsightsPanel topics={result.topics} onTopicClick={handleTopicClick} />
            <ParticipantEngagementMetrics participants={result.participants} transcriptSegments={result.transcriptSegments} />

            {/* AI Summary and Key Takeaways */}
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

            {/* Documents and Future Meetings */}
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

            {/* Spatial Scene and Mind Map */}
            <SpatialSceneViewer mindMapUrl={result.mindMapUrl} spatialObjects={result.spatialObjects} />

            {/* Raw Transcript (if not in live-scribe tab) */}
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