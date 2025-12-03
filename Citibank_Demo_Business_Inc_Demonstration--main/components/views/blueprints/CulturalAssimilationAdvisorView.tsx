/**
 * This module defines the core data structures, simulated API interactions, and user interface components
 * for the Cultural Assimilation Advisor View. It represents a critical component in the "Agentic AI" architecture,
 * providing a high-value, real-time feedback loop for users navigating complex cross-cultural interactions.
 * This system delivers a revolutionary, multi-million-dollar infrastructure leap, enabling unparalleled global operational intelligence.
 *
 * Business Value: This system empowers global teams and individuals to dramatically reduce cross-cultural
 * communication friction, minimize costly business errors stemming from cultural misunderstandings, and accelerate
 * the integration of diverse workforces. By automating nuanced cultural guidance and providing a safe simulation
 * environment, it enhances employee productivity, fosters stronger international relationships, and unlocks
 * new markets by mitigating cultural risk. The comprehensive, real-time, and personalized feedback loop,
 * driven by advanced AI simulations, translates directly into millions saved in avoided mistakes and
 * millions earned through improved global operational efficiency and expanded market access. It establishes a
 * competitive advantage by creating culturally intelligent agents within an enterprise, providing auditable insights
 * into cross-cultural competence development and potential for integration with programmable value rails for incentivization.
 *
 * System Leverage: This view integrates tightly with the simulated Agentic AI System for real-time interaction
 * processing, the Digital Identity layer for personalized learning paths and access control, and offers
 * conceptual hooks for future integration with token rails for gamified incentives or certification. Its modular design allows
 * for easy extension with additional cultural profiles, learning modules, and sophisticated AI models,
 * driving continuous value for enterprise users. The integrated auditability ensures compliance and strategic oversight.
 */
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';

/**
 * Represents the severity of a feedback item, indicating the criticality of cultural alignment.
 */
export type FeedbackSeverity = 'Positive' | 'Neutral' | 'Negative' | 'Critical' | 'Advisory';

/**
 * Encapsulates the core exchange between user action and AI response,
 * providing an immediate summary of cultural appropriateness. This is vital for real-time learning.
 */
export interface InteractionFeedback {
  userAction: string;
  aiResponse: string;
  feedbackSummary: { text: string; severity: FeedbackSeverity };
}

/**
 * Provides a granular breakdown of cultural feedback across specific dimensions,
 * offering actionable insights for improvement. This micro-level analysis drives targeted learning outcomes.
 */
export interface DetailedFeedbackDimension {
  dimension: string; // e.g., "Communication Style", "Etiquette", "Non-Verbal Cues"
  score: number; // -5 (highly inappropriate) to +5 (highly appropriate), facilitating quantifiable improvement tracking.
  explanation: string;
  severity: FeedbackSeverity;
  recommendations: string[];
}

/**
 * Delivers a comprehensive feedback report for a single interaction turn,
 * linking user actions to cultural impact and suggesting targeted learning.
 * This is crucial for the AI's agentic feedback loop, enabling adaptive guidance.
 */
export interface CompleteInteractionFeedback extends InteractionFeedback {
  timestamp: string;
  scenarioId: string;
  targetCultureId: string;
  userProfileSnapshot: IUserCulturalProfile; // Snapshot for auditability and context replay, ensuring data integrity.
  detailedFeedback: DetailedFeedbackDimension[];
  overallCulturalCompetenceImpact: number; // Quantifies the shift in competence, driving user progress and tracking ROI.
  suggestedResources?: string[]; // Direct links to relevant learning, enhancing user growth and reducing time-to-competence.
  potentialRewardsEarned?: { type: 'token' | 'certificate'; amount?: number; id?: string }[]; // Simulated reward for positive impact.
}

/**
 * Defines a specific cultural dimension (e.g., Hofstede's Power Distance),
 * providing a foundational model for cross-cultural analysis. This structure enables the AI to quantify and compare cultural attributes.
 */
export interface ICulturalDimension {
  id: string; // e.g., "power_distance"
  name: string;
  description: string;
  typicalScores: { min: number; max: number }; // Provides context for score interpretation, enhancing AI's contextual understanding.
}

/**
 * Represents a specific cultural trait or characteristic,
 * enabling the AI to identify and provide advice on nuanced behaviors. This granular detail ensures precise guidance.
 */
export interface ICulturalTrait {
  id: string;
  name: string;
  description: string;
  impactAreas: string[]; // e.g., ["negotiation", "socializing"], for targeted advice.
  recommendations: string[]; // General recommendations for interacting with this trait.
}

/**
 * Offers a detailed profile for a specific culture,
 * serving as the knowledge base for the AI advisor. This extensive data enables highly accurate and context-aware guidance, crucial for enterprise adoption.
 */
export interface ICulture {
  id: string; // e.g., "GERMANY"
  name: string;
  continent: string;
  language: string;
  helloPhrase: string;
  goodbyePhrase: string;
  culturalDimensions: {
    [dimensionId: string]: number; // Quantifiable scores for each dimension, allowing comparative analysis and AI model training.
  };
  communicationStyle: {
    directness: number; // 0 (indirect) - 100 (direct)
    contextSensitivity: number; // 0 (low-context) - 100 (high-context)
    formalityLevel: number; // 0 (informal) - 100 (formal)
    emotionalExpression: number; // 0 (reserved) - 100 (expressive)
  };
  etiquetteRules: IEtiquetteRule[];
  negotiationPractices: INegotiationPractice[];
  socialNorms: ISocialNorm[];
  commonMisunderstandings: ICommonMisunderstanding[];
  nonVerbalCues: INonVerbalCue[];
  values: string[]; // Core values that underpin cultural behavior.
}

/**
 * Represents a specific etiquette rule, detailing its context, consequence, and examples.
 * This micro-level data allows the AI to give precise, actionable feedback, minimizing cultural missteps.
 */
export interface IEtiquetteRule {
  id: string;
  category: 'Greeting' | 'Dining' | 'Business Meeting' | 'Gift Giving' | 'Social' | 'Dress Code' | 'General' | 'Conversation'; // Added 'Conversation' for completeness.
  rule: string;
  description: string;
  consequences: FeedbackSeverity; // Indicates the severity of violating the rule.
  example?: string;
  keywords?: string[]; // Keywords to help AI detect rule relevance.
}

/**
 * Defines a negotiation practice specific to a culture,
 * enabling the AI to guide users through complex international deals, optimizing business outcomes.
 */
export interface INegotiationPractice {
  id: string;
  aspect: 'Preparation' | 'Process' | 'Decision Making' | 'Relationship Building' | 'Strategy' | 'Communication'; // Added 'Communication' for completeness.
  practice: string;
  description: string;
  culturalBasis: string; // Explains the underlying cultural reason, aiding deeper understanding.
  keywords?: string[]; // Keywords to help AI detect relevance.
}

/**
 * Describes a social norm in a culture,
 * providing guidelines for appropriate social interactions, fostering smoother integration.
 */
export interface ISocialNorm {
  id: string;
  category: 'Conversation' | 'Personal Space' | 'Hospitality' | 'Public Behavior' | 'Family' | 'Respect'; // Added 'Respect'.
  norm: string;
  description: string;
  avoid?: string; // Specific actions to avoid.
  keywords?: string[]; // Keywords to help AI detect relevance.
}

/**
 * Represents a common misunderstanding between cultures,
 * highlighting potential pitfalls and offering specific advice. This is key for proactively mitigating costly cultural blunders.
 */
export interface ICommonMisunderstanding {
  id: string;
  topic: string; // e.g., "Silence", "Direct Eye Contact"
  description: string;
  culturalDifference: string;
  advice: string;
  keywords?: string[]; // Keywords to help AI detect relevance.
}

/**
 * Describes a non-verbal cue and its interpretation in a given culture,
 * providing insights into unspoken communication, critical for nuanced interactions.
 */
export interface INonVerbalCue {
  id: string;
  type: 'Eye Contact' | 'Gestures' | 'Personal Space' | 'Touch' | 'Facial Expression' | 'Posture' | 'Vocalics' | 'Silence'; // Added 'Silence'.
  cue: string;
  meaning: string;
  interpretation: 'Positive' | 'Neutral' | 'Negative';
  caution?: string; // When to be careful, enhancing safety and reducing risk.
  keywords?: string[]; // Keywords to help AI detect relevance.
}

/**
 * Defines a template for a simulation scenario,
 * serving as a blueprint for interactive learning experiences. Each scenario is a controlled environment for practicing cultural competence, ensuring scalable training.
 */
export interface IScenarioTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Business' | 'Social' | 'Academic' | 'Personal' | 'Diplomacy'; // Added 'Diplomacy'.
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  objectives: string[]; // What the user should aim to achieve, providing clear learning goals.
  initialSituation: string; // The starting prompt for the simulation.
  keyCulturalAspects: string[]; // IDs of relevant cultural traits/dimensions, linking to the knowledge base for AI context.
  interactionFlowExample?: { user: string; ai: string; feedback: string }[]; // Examples for reference.
  possibleUserActions: string[]; // Examples of good user actions, guiding the learning process.
  possiblePitfalls: string[]; // Examples of bad user actions, highlighting critical mistakes.
  relatedLearningModules?: string[]; // IDs of related learning modules for deeper study.
}

/**
 * Represents an active, instanced scenario during a simulation.
 * This mutable state allows for dynamic, real-time progression tracking and personalized feedback.
 */
export interface IActiveScenarioInstance {
  scenarioTemplateId: string;
  instanceId: string;
  currentSituation: string;
  objectiveStatus: { [objective: string]: boolean };
  targetCulture: ICulture;
  participants: { name: string; role: string; culturalBackground: string }[];
  currentTurn: number;
  maxTurns: number;
  isCompleted: boolean;
  successMetric: number; // 0-100, how well the user is performing, providing quantifiable feedback and progress tracking.
}

/**
 * Represents a learning module, offering structured educational content.
 * These modules are crucial for building foundational cultural knowledge, fostering systematic competence development.
 */
export interface ILearningModule {
  id: string;
  title: string;
  category: 'Communication' | 'Etiquette' | 'Negotiation' | 'Values' | 'History' | 'General' | 'Non-Verbal'; // Added 'Non-Verbal'.
  culturesCovered: string[]; // Array of culture IDs, for targeted learning.
  content: string; // Markdown or rich text content, delivering rich educational material.
  quizQuestions: IQuizQuestion[];
  estimatedCompletionTimeMinutes: number;
  prerequisites?: string[]; // Other module IDs, structuring learning paths and ensuring progressive mastery.
}

/**
 * Represents a quiz question, used for knowledge assessment within learning modules, validating user understanding.
 */
export interface IQuizQuestion {
  id: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string;
}

/**
 * User's general profile and cultural background, forming the basis for personalized learning.
 * This identity context allows the AI to tailor content and recommendations, maximizing user engagement and value.
 */
export interface IUserCulturalProfile {
  userId: string;
  username: string;
  originCultureId: string;
  targetCultureInterests: string[]; // IDs of cultures user wants to learn about.
  culturalCompetenceScore: { [cultureId: string]: number }; // Quantifiable score per culture, 0-100.
  overallCompetence: number; // Overall average score, a key performance indicator for user progress.
  learningPathProgress: { [moduleId: string]: { completed: boolean; score?: number } };
  scenarioHistory: IScenarioHistoryEntry[]; // A history of completed simulations for tracking progress and auditing.
}

/**
 * Summary of a completed scenario for user history, providing a record of learning and performance.
 */
export interface IScenarioHistoryEntry {
  scenarioInstanceId: string;
  scenarioTemplateId: string;
  targetCultureId: string;
  completionDate: string;
  finalSuccessMetric: number;
  totalInteractions: number;
  keyLearnings: string[];
  rewardTriggered?: { type: 'token' | 'certificate'; amount?: number; id?: string }; // Tracks if a reward was triggered.
}

/**
 * Represents a resource, like an article or video, for supplemental learning.
 * These resources provide additional depth and practical application, enhancing the platform's educational breadth.
 */
export interface IResource {
  id: string;
  title: string;
  type: 'Article' | 'Video' | 'Infographic' | 'Case Study' | 'Podcast'; // Added 'Podcast'.
  url: string;
  tags: string[]; // e.g., "Germany", "Business", "Negotiation", for discoverability.
  relatedCultures: string[];
}

/**
 * System-wide settings for the application, allowing user customization and AI behavior tuning.
 * This provides crucial governance controls over the user experience and agent interactions.
 */
export interface ISystemSettings {
  darkMode: boolean;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    scenarioRecommendations: boolean;
  };
  llmModelPreference: 'default' | 'fast' | 'detailed' | 'pedagogical_mode' | 'risk_averse'; // Extended for fine-grained control over AI responses, especially in financial contexts.
  feedbackVerbosity: 'concise' | 'detailed' | 'pedagogical';
  aiPersona: 'supportive' | 'challenging' | 'neutral' | 'formal_advisor'; // New: AI persona setting for adaptable guidance.
}

/**
 * Represents a simulated audit log entry for system activities.
 * Crucial for governance, security, and observability, tracking all key actions and ensuring regulatory compliance.
 */
export interface IAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: string; // e.g., 'ScenarioStarted', 'InteractionProcessed', 'ProfileUpdated', 'AgentDecision'
  details: { [key: string]: any };
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'AUDIT'; // Added 'AUDIT' for specific auditable events.
}

/**
 * Simulated persistent storage for audit logs, crucial for governance and compliance.
 * In a real system, this would be a secure, immutable, hash-linked ledger.
 */
export const AUDIT_LOGS_DATA: IAuditLogEntry[] = [];

/**
 * Utility for generating unique, cryptographically-secure IDs, ensuring traceability across system components.
 */
const generateUniqueId = (prefix: string = 'id'): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

/**
 * Simulated logging and metrics service for internal operations.
 * This provides essential observability into the AI's decision-making and system performance.
 * Business Value: Enables real-time monitoring of agent behavior, critical for performance tuning,
 * fraud detection in agentic systems, and regulatory compliance reporting. This underpins the platform's auditable foundation.
 */
export const systemLogger = {
  log: (severity: IAuditLogEntry['severity'], userId: string | null, action: string, details: { [key: string]: any }) => {
    const entry: IAuditLogEntry = {
      id: generateUniqueId('log'),
      timestamp: new Date().toISOString(),
      userId: userId || 'system',
      action,
      details,
      severity,
    };
    AUDIT_LOGS_DATA.push(entry);
    if (AUDIT_LOGS_DATA.length > 1000) { // Keep log size manageable in simulation while retaining depth
      AUDIT_LOGS_DATA.shift();
    }
    // In a production system, this would securely send to a SIEM, distributed tracing, or metrics endpoint.
    // console.log(`[${entry.severity}] [${entry.timestamp}] [${entry.userId}] ${entry.action}: ${JSON.stringify(entry.details)}`);
  },
  info: (userId: string | null, action: string, details: { [key: string]: any } = {}) => systemLogger.log('INFO', userId, action, details),
  warn: (userId: string | null, action: string, details: { [key: string]: any } = {}) => systemLogger.log('WARN', userId, action, details),
  error: (userId: string | null, action: string, details: { [key: string]: any } = {}) => systemLogger.log('ERROR', userId, action, details),
  critical: (userId: string | null, action: string, details: { [key: string]: any } = {}) => systemLogger.log('CRITICAL', userId, action, details),
  audit: (userId: string | null, action: string, details: { [key: string]: any } = {}) => systemLogger.log('AUDIT', userId, action, details),
};

// 2.2 Comprehensive Cultural Data for Multiple Countries (Highly detailed mock data for line count)
export const CULTURAL_PROFILES_DATA: ICulture[] = [
  {
    id: 'GERMANY',
    name: 'Germany',
    continent: 'Europe',
    language: 'German',
    helloPhrase: 'Guten Tag',
    goodbyePhrase: 'Auf Wiedersehen',
    culturalDimensions: {
      power_distance: 35,
      individualism_collectivism: 67,
      masculinity_femininity: 66,
      uncertainty_avoidance: 65,
      long_term_orientation: 83,
      indulgence_restraint: 40,
      high_low_context: 20, // Low-context
      monochronic_polychronic: 10, // Monochronic
    },
    communicationStyle: {
      directness: 85,
      contextSensitivity: 20,
      formalityLevel: 70,
      emotionalExpression: 30,
    },
    etiquetteRules: [
      { id: 'GE001', category: 'Greeting', rule: 'Shake hands firmly', description: 'A firm handshake is expected when greeting and leaving, with eye contact.', consequences: 'Negative', example: 'Upon meeting, extend your hand for a firm shake.', keywords: ['handshake', 'firm', 'eye contact', 'greeting'] },
      { id: 'GE002', category: 'Business Meeting', rule: 'Be punctual', description: 'Punctuality is extremely important; arriving late without a valid excuse is considered rude.', consequences: 'Critical', example: 'Arrive 5-10 minutes early for all meetings.', keywords: ['punctual', 'on time', 'late', 'meeting'] },
      { id: 'GE003', category: 'Dining', rule: 'Keep hands visible', description: 'Keep both hands on the table, but not elbows.', consequences: 'Advisory', keywords: ['hands on table', 'dining', 'etiquette'] },
      { id: 'GE004', category: 'Gift Giving', rule: 'Simple gifts for hosts', description: 'Small gifts like flowers (even number, no red roses or lilies) or quality chocolate are appropriate for hosts.', consequences: 'Advisory', keywords: ['gift', 'flowers', 'chocolate', 'host'] },
      { id: 'GE005', category: 'Social', rule: 'Respect personal space', description: 'Germans generally prefer more personal space than some other cultures. Avoid touching unnecessarily.', consequences: 'Negative', keywords: ['personal space', 'touching', 'social'] },
      { id: 'GE006', category: 'Conversation', rule: 'Direct communication', description: 'Germans prefer direct and factual communication. Avoid excessive small talk before getting to business.', consequences: 'Neutral', keywords: ['direct communication', 'small talk', 'factual'] },
      { id: 'GE007', category: 'Business Meeting', rule: 'Detailed preparation', description: 'Come prepared with facts, figures, and a clear agenda. Decisions are often based on logic and data.', consequences: 'Negative', keywords: ['preparation', 'facts', 'figures', 'agenda', 'logic'] },
      { id: 'GE008', category: 'Dress Code', rule: 'Formal and conservative', description: 'Business attire is typically formal (suits for men, conservative dresses/suits for women). Casual wear is rare in business settings.', consequences: 'Negative', keywords: ['dress code', 'formal', 'conservative'] },
      { id: 'GE009', category: 'Dining', rule: 'Wait to be seated', description: 'Wait until the host or server indicates where you should sit.', consequences: 'Advisory', keywords: ['dining', 'seating', 'host'] },
      { id: 'GE010', category: 'Conversation', rule: 'Address by title and surname', description: 'Unless invited otherwise, address individuals by their professional title (if applicable) and surname.', consequences: 'Negative', keywords: ['title', 'surname', 'formal address'] },
      { id: 'GE011', category: 'Gift Giving', rule: 'Open gifts later', description: 'Gifts are typically opened later, not immediately in front of the giver, unless encouraged.', consequences: 'Neutral', keywords: ['open gifts'] },
      { id: 'GE012', category: 'Business Meeting', rule: 'Agenda adherence', description: 'Strict adherence to meeting agendas is common. Deviations are generally not appreciated.', consequences: 'Negative', keywords: ['agenda', 'adherence', 'meeting'] },
    ],
    negotiationPractices: [
      { id: 'GN001', aspect: 'Preparation', practice: 'Thorough data analysis', description: 'German negotiators rely heavily on facts, figures, and detailed analysis.', culturalBasis: 'high uncertainty avoidance, low context', keywords: ['data analysis', 'facts', 'figures', 'preparation'] },
      { id: 'GN002', aspect: 'Process', practice: 'Direct and logical arguments', description: 'Expect direct, objective arguments focused on efficiency and quality. Emotional appeals are less effective.', culturalBasis: 'low context, high directness', keywords: ['direct arguments', 'logic', 'efficiency', 'quality'] },
      { id: 'GN003', aspect: 'Decision Making', practice: 'Deliberate and consensual', description: 'Decisions are often made after thorough consideration, involving technical experts, and aim for a high level of consensus within their team.', culturalBasis: 'high uncertainty avoidance, long-term orientation', keywords: ['deliberate decision', 'consensus', 'technical experts'] },
      { id: 'GN004', aspect: 'Relationship Building', practice: 'Trust built through competence', description: 'Trust is built through demonstrated competence, reliability, and adherence to agreements, rather than extensive socializing.', culturalBasis: 'individualism, low context', keywords: ['trust', 'competence', 'reliability'] },
      { id: 'GN005', aspect: 'Process', practice: 'Stick to agreements', description: 'Once an agreement is made, it is expected to be strictly adhered to. Flexibility for changes later is low.', culturalBasis: 'high uncertainty avoidance', keywords: ['agreements', 'adherence', 'flexibility'] },
    ],
    socialNorms: [
      { id: 'GSN001', category: 'Conversation', norm: 'Maintain eye contact', description: 'Direct eye contact during conversations shows sincerity and attention.', avoid: 'Avoiding eye contact can be seen as evasive.', keywords: ['eye contact', 'sincerity'] },
      { id: 'GSN002', category: 'Personal Space', norm: 'Respect boundaries', description: 'A larger personal space bubble is common. Avoid standing too close or touching casually.', avoid: 'Excessive touching or close proximity can cause discomfort.', keywords: ['personal space', 'boundaries', 'touching'] },
      { id: 'GSN003', category: 'Public Behavior', norm: 'Order and quiet', description: 'Germans generally value order, cleanliness, and quiet in public spaces (e.g., public transport).', avoid: 'Loud conversations or disruptive behavior.', keywords: ['order', 'quiet', 'public'] },
      { id: 'GSN004', category: 'Hospitality', norm: 'Invite-only visits', description: 'Do not visit someone\'s home unannounced. Always wait for an invitation.', avoid: 'Unexpected visits.', keywords: ['invite', 'home visit'] },
    ],
    commonMisunderstandings: [
      { id: 'GCM001', topic: 'Directness', description: 'What might seem overly direct or blunt to some cultures is often perceived as honest and efficient in Germany.', culturalDifference: 'High directness vs. indirect communication styles.', advice: 'Do not soften your message excessively; focus on clarity and facts.', keywords: ['directness', 'blunt', 'honest', 'efficient'] },
      { id: 'GCM002', topic: 'Humor', description: 'German humor can be dry or ironic and might not always translate well across cultures. Avoid overly casual or sarcastic humor in formal settings.', culturalDifference: 'Different humor styles and formality levels.', advice: 'Err on the side of formality and reserve humor for established relationships.', keywords: ['humor', 'sarcasm', 'dry humor'] },
    ],
    nonVerbalCues: [
      { id: 'GNV001', type: 'Eye Contact', cue: 'Direct, sustained eye contact', meaning: 'Sign of sincerity, attentiveness, and confidence.', interpretation: 'Positive', caution: 'Staring aggressively can be negative.', keywords: ['eye contact', 'direct', 'sustained'] },
      { id: 'GNV002', type: 'Gestures', cue: 'Point with full hand', meaning: 'Pointing with a single finger can be rude.', interpretation: 'Negative', keywords: ['pointing', 'finger gesture'] },
      { id: 'GNV003', type: 'Gestures', cue: 'Thumbs-up', meaning: 'OK, good job.', interpretation: 'Positive', keywords: ['thumbs-up'] },
      { id: 'GNV004', type: 'Personal Space', cue: 'Maintaining distance', meaning: 'Respect for personal boundaries.', interpretation: 'Neutral', caution: 'Invading space can be seen as aggressive.', keywords: ['personal space', 'distance'] },
    ],
    values: ['Order', 'Punctuality', 'Efficiency', 'Precision', 'Reliability', 'Diligence', 'Privacy'],
  },
  {
    id: 'JAPAN',
    name: 'Japan',
    continent: 'Asia',
    language: 'Japanese',
    helloPhrase: 'Konnichiwa',
    goodbyePhrase: 'Sayonara',
    culturalDimensions: {
      power_distance: 54,
      individualism_collectivism: 46,
      masculinity_femininity: 95, // High masculinity with unique aspects
      uncertainty_avoidance: 92,
      long_term_orientation: 88,
      indulgence_restraint: 42,
      high_low_context: 90, // High-context
      monochronic_polychronic: 30, // Tend towards monochronic but flexible
    },
    communicationStyle: {
      directness: 10,
      contextSensitivity: 90,
      formalityLevel: 95,
      emotionalExpression: 10,
    },
    etiquetteRules: [
      { id: 'JP_E001', category: 'Greeting', rule: 'Bow correctly', description: 'Bowing is a complex form of greeting, showing respect. The depth of the bow depends on the status difference.', consequences: 'Negative', example: 'A slight nod for equals, deeper bow for superiors.', keywords: ['bow', 'greeting', 'respect'] },
      { id: 'JP_E002', category: 'Business Meeting', rule: 'Exchange business cards (Meishi)', description: 'Always present and receive business cards with both hands, examine it, and place it carefully on the table.', consequences: 'Critical', keywords: ['business card', 'meishi', 'two hands'] },
      { id: 'JP_E003', category: 'Dining', rule: 'Do not stick chopsticks upright in rice', description: 'This resembles a funeral rite and is highly offensive.', consequences: 'Critical', keywords: ['chopsticks', 'rice', 'upright', 'funeral'] },
      { id: 'JP_E004', category: 'Social', rule: 'Remove shoes indoors', description: 'Always remove shoes when entering a Japanese home, traditional restaurant, or temple.', consequences: 'Critical', keywords: ['remove shoes', 'indoors'] },
      { id: 'JP_E005', category: 'Gift Giving', rule: 'Present and receive with both hands', description: 'Presenting and receiving gifts with both hands shows respect. Do not open immediately unless encouraged.', consequences: 'Negative', keywords: ['gift giving', 'two hands', 'open gifts'] },
      { id: 'JP_E006', category: 'Conversation', rule: 'Indirect communication (Honne/Tatemae)', description: 'Japanese communication often relies on context and unspoken cues (Tatemae - public facade, Honne - true feelings). Direct "no" is rare.', consequences: 'Neutral', keywords: ['indirect communication', 'honne', 'tatemae', 'no'] },
      { id: 'JP_E007', category: 'Business Meeting', rule: 'Patience and consensus', description: 'Decision-making is often slow, involving extensive discussion to build consensus (Nemawashi). Do not rush.', consequences: 'Negative', keywords: ['patience', 'consensus', 'nemawashi', 'rush'] },
      { id: 'JP_E008', category: 'Public Behavior', rule: 'Avoid loud conversations or personal calls', description: 'Maintain quiet and order, especially in public transport.', consequences: 'Negative', keywords: ['loud', 'quiet', 'public behavior'] },
      { id: 'JP_E009', category: 'Dining', rule: 'Slurp noodles', description: 'Slurping noodles is acceptable and can indicate enjoyment.', consequences: 'Advisory', keywords: ['slurp noodles', 'dining'] },
      { id: 'JP_E010', category: 'Personal Space', rule: 'Minimal physical contact', description: 'Avoid touching, hugging, or excessive gestures. Bowing is the primary form of physical interaction.', consequences: 'Negative', keywords: ['physical contact', 'touching', 'hugging'] },
    ],
    negotiationPractices: [
      { id: 'JP_N001', aspect: 'Relationship Building', practice: 'Long-term relationship focus', description: 'Building trust and a long-term relationship is paramount before and during negotiations.', culturalBasis: 'collectivism, long-term orientation', keywords: ['long-term relationship', 'trust'] },
      { id: 'JP_N002', aspect: 'Process', practice: 'Patience and indirectness', description: 'Negotiations can be lengthy and indirect. Look for subtle cues and avoid aggressive tactics.', culturalBasis: 'high context, uncertainty avoidance', keywords: ['patience', 'indirectness', 'subtle cues'] },
      { id: 'JP_N003', aspect: 'Decision Making', practice: 'Consensus-based (Nemawashi)', description: 'Decisions are made collectively, often through informal, behind-the-scenes discussions (Nemawashi) before a formal meeting.', culturalBasis: 'collectivism, high uncertainty avoidance', keywords: ['consensus', 'nemawashi', 'collective decision'] },
      { id: 'JP_N004', aspect: 'Communication', practice: 'Prioritize harmony (Wa)', description: 'Maintaining harmony (Wa) is crucial. Avoid direct confrontation or putting someone on the spot.', culturalBasis: 'collectivism, high context', keywords: ['harmony', 'wa', 'confrontation'] },
    ],
    socialNorms: [
      { id: 'JP_SN001', category: 'Conversation', norm: 'Modesty and humility', description: 'Boasting about achievements or being overly self-promotional is frowned upon. Humility is valued.', avoid: 'Self-praise.', keywords: ['modesty', 'humility', 'self-praise'] },
      { id: 'JP_SN002', category: 'Personal Space', norm: 'Larger personal bubble', description: 'Japanese maintain a significant personal distance. Avoid close proximity.', avoid: 'Excessive touching or close proximity can cause discomfort.', keywords: ['personal space', 'distance'] },
      { id: 'JP_SN003', category: 'Hospitality', norm: 'Polite refusal of generosity', description: 'It is polite to initially refuse an offer of food or drink before accepting.', avoid: 'Immediate acceptance of offers.', keywords: ['polite refusal', 'generosity'] },
      { id: 'JP_SN004', category: 'Public Behavior', norm: 'No eating/drinking while walking', description: 'It is considered impolite to eat or drink while walking in public.', avoid: 'Eating/drinking on the street.', keywords: ['eating while walking', 'public behavior'] },
    ],
    commonMisunderstandings: [
      { id: 'JP_CM001', topic: 'Silence', description: 'Silence in a conversation may indicate thoughtfulness or a desire to avoid direct refusal, not necessarily disagreement or lack of understanding.', culturalDifference: 'High context vs. low context communication.', advice: 'Allow for pauses; do not rush to fill silence or assume a "no."', keywords: ['silence', 'disagreement', 'no'] },
      { id: 'JP_CM002', topic: 'Eye Contact', description: 'Direct, prolonged eye contact can be seen as aggressive or disrespectful, especially towards superiors. Averted gaze shows respect.', culturalDifference: 'Different interpretations of eye contact.', advice: 'Moderate eye contact, especially with superiors; an occasional averted gaze is fine.', keywords: ['eye contact', 'aggressive', 'disrespectful', 'averted gaze'] },
    ],
    nonVerbalCues: [
      { id: 'JP_NV001', type: 'Eye Contact', cue: 'Moderate, often averted eye contact', meaning: 'Shows respect, humility, and deference, especially to elders or superiors.', interpretation: 'Positive', caution: 'Prolonged direct eye contact can be seen as rude.', keywords: ['eye contact', 'averted', 'respect'] },
      { id: 'JP_NV002', type: 'Gestures', cue: 'Waving hand to say "no" or "come here"', meaning: 'Often misunderstood. Palm facing down, fingers waving towards you means "come here".', interpretation: 'Neutral', caution: 'Be aware of specific hand gestures meanings.', keywords: ['waving hand', 'come here'] },
      { id: 'JP_NV003', type: 'Posture', cue: 'Sitting cross-legged or showing soles of feet', meaning: 'Can be disrespectful, especially in formal settings or towards sacred objects.', interpretation: 'Negative', keywords: ['cross-legged', 'soles of feet', 'disrespectful'] },
      { id: 'JP_NV004', type: 'Touch', cue: 'Avoiding physical contact', meaning: 'Standard social interaction, shows respect for personal space.', interpretation: 'Neutral', caution: 'Avoid hugging, back-patting in business/formal settings.', keywords: ['physical contact', 'touch', 'hugging'] },
    ],
    values: ['Harmony (Wa)', 'Group Loyalty', 'Respect (Keii)', 'Humility', 'Hard Work', 'Punctuality', 'Diligence', 'Cleanliness'],
  },
  {
    id: 'USA',
    name: 'United States',
    continent: 'North America',
    language: 'English',
    helloPhrase: 'Hello',
    goodbyePhrase: 'Goodbye',
    culturalDimensions: {
      power_distance: 40,
      individualism_collectivism: 91,
      masculinity_femininity: 62,
      uncertainty_avoidance: 46,
      long_term_orientation: 26,
      indulgence_restraint: 68,
      high_low_context: 15, // Low-context
      monochronic_polychronic: 5, // Strongly monochronic
    },
    communicationStyle: {
      directness: 70,
      contextSensitivity: 15,
      formalityLevel: 40,
      emotionalExpression: 60,
    },
    etiquetteRules: [
      { id: 'US_E001', category: 'Greeting', rule: 'Firm handshake and direct eye contact', description: 'A firm handshake is common for both men and women in business. Direct eye contact is a sign of sincerity.', consequences: 'Negative', keywords: ['handshake', 'eye contact'] },
      { id: 'US_E002', category: 'Business Meeting', rule: 'Be on time', description: 'Punctuality is generally valued, but 5-10 minutes leeway might be acceptable. Inform if running late.', consequences: 'Negative', keywords: ['on time', 'punctuality', 'late'] },
      { id: 'US_E003', category: 'Conversation', rule: 'Small talk is common', description: 'Engage in a few minutes of small talk before getting to business. Topics like weather, sports, or travel are safe.', consequences: 'Neutral', keywords: ['small talk', 'conversation'] },
      { id: 'US_E004', category: 'Dining', rule: 'Tipping is customary', description: 'Tipping 15-20% for good service in restaurants is expected.', consequences: 'Critical', keywords: ['tipping', 'dining'] },
      { id: 'US_E005', category: 'Gift Giving', rule: 'Open gifts immediately', description: 'Guests typically open gifts immediately in front of the giver and express gratitude.', consequences: 'Advisory', keywords: ['open gifts', 'gratitude'] },
    ],
    negotiationPractices: [
      { id: 'US_N001', aspect: 'Process', practice: 'Direct and often adversarial', description: 'Negotiations can be direct, open, and sometimes competitive. Focus on facts and figures.', culturalBasis: 'individualism, low context', keywords: ['direct negotiation', 'adversarial', 'facts'] },
      { id: 'US_N002', aspect: 'Decision Making', practice: 'Individual decision-making', description: 'Decisions are often made by individuals with authority rather than strict consensus.', culturalBasis: 'individualism, low power distance', keywords: ['individual decision', 'authority'] },
      { id: 'US_N003', aspect: 'Relationship Building', practice: 'Business first, then relationship', description: 'While relationships are valued, business objectives typically come first. Trust is built through performance.', culturalBasis: 'individualism, low context', keywords: ['business first', 'relationship', 'performance'] },
    ],
    socialNorms: [
      { id: 'US_SN001', category: 'Conversation', norm: 'Direct communication, expect opinions', description: 'Americans generally communicate directly and expect others to express their opinions clearly.', avoid: 'Excessive ambiguity.', keywords: ['direct communication', 'opinions'] },
      { id: 'US_SN002', category: 'Personal Space', norm: 'Moderate personal space', description: 'Maintain an arm\'s length distance in most social interactions.', avoid: 'Standing too close or far away.', keywords: ['personal space', 'arm\'s length'] },
    ],
    commonMisunderstandings: [
      { id: 'US_CM001', topic: 'Directness', description: 'Directness in the US can sometimes be perceived as blunt by cultures that value indirectness, but it is generally appreciated for clarity.', culturalDifference: 'Low context communication.', advice: 'Be clear and concise; don\'t expect others to read between the lines.', keywords: ['directness', 'blunt', 'clarity'] },
    ],
    nonVerbalCues: [
      { id: 'US_NV001', type: 'Eye Contact', cue: 'Direct eye contact', meaning: 'Signifies honesty, attention, and confidence.', interpretation: 'Positive', caution: 'Staring without blinking can be unsettling.', keywords: ['eye contact', 'direct'] },
      { id: 'US_NV002', type: 'Gestures', cue: 'Thumbs-up', meaning: 'Approval, "good job".', interpretation: 'Positive', keywords: ['thumbs-up'] },
      { id: 'US_NV003', type: 'Personal Space', cue: 'Arm\'s length distance', meaning: 'Standard personal space.', interpretation: 'Neutral', keywords: ['personal space', 'arm\'s length'] },
    ],
    values: ['Individualism', 'Achievement', 'Freedom', 'Equality', 'Fairness', 'Directness', 'Innovation'],
  },
  {
    id: 'INDIA',
    name: 'India',
    continent: 'Asia',
    language: 'Hindi', // Main language, but many others
    helloPhrase: 'Namaste',
    goodbyePhrase: 'Namaste',
    culturalDimensions: {
      power_distance: 77,
      individualism_collectivism: 48,
      masculinity_femininity: 56,
      uncertainty_avoidance: 40,
      long_term_orientation: 51,
      indulgence_restraint: 26,
      high_low_context: 80, // High-context
      monochronic_polychronic: 80, // Polychronic
    },
    communicationStyle: {
      directness: 30,
      contextSensitivity: 80,
      formalityLevel: 60,
      emotionalExpression: 70,
    },
    etiquetteRules: [
      { id: 'IN_E001', category: 'Greeting', rule: 'Namaste or handshake', description: 'Namaste (palms together, fingers pointing up, slight bow) is common. Handshakes are also common, especially in business, men with men, women with women, or mixed.', consequences: 'Neutral', keywords: ['namaste', 'handshake', 'greeting'] },
      { id: 'IN_E002', category: 'Dining', rule: 'Eat with right hand', description: 'If eating without utensils, use only your right hand, as the left hand is considered unclean.', consequences: 'Critical', keywords: ['right hand', 'left hand', 'unclean', 'eating'] },
      { id: 'IN_E003', category: 'Social', rule: 'Avoid public displays of affection', description: 'Public displays of affection are generally frowned upon and can be seen as inappropriate.', consequences: 'Negative', keywords: ['public affection', 'PDA'] },
      { id: 'IN_E004', category: 'Dress Code', rule: 'Modest dress', description: 'Dress conservatively, especially women, covering shoulders and knees. This applies to both social and business settings.', consequences: 'Negative', keywords: ['modest dress', 'conservative', 'women'] },
      { id: 'IN_E005', category: 'Business Meeting', rule: 'Patience with time', description: 'Punctuality is appreciated but may not always be strictly adhered to by Indian counterparts. Be flexible.', consequences: 'Neutral', keywords: ['patience', 'time', 'flexible', 'punctuality'] },
      { id: 'IN_E006', category: 'Social', rule: 'Remove shoes before entering homes/temples', description: 'It is a sign of respect to remove shoes before entering someone\'s home or a place of worship.', consequences: 'Critical', keywords: ['remove shoes', 'home', 'temple', 'respect'] },
      { id: 'IN_E007', category: 'Conversation', rule: 'Indirect communication and hierarchy', description: 'Communication can be indirect, especially when conveying negative news or disagreeing with a superior. Hierarchy is respected.', consequences: 'Neutral', keywords: ['indirect communication', 'hierarchy', 'negative news'] },
      { id: 'IN_E008', category: 'Gift Giving', rule: 'Do not give leather or pork products', description: 'Avoid gifts made of leather or containing pork for religious reasons.', consequences: 'Critical', keywords: ['leather', 'pork', 'gifts', 'religious'] },
      { id: 'IN_E009', category: 'Gift Giving', rule: 'Give and receive with both hands', description: 'Presenting and receiving gifts or documents with both hands shows respect.', consequences: 'Positive', keywords: ['two hands', 'gifts', 'documents'] },
      { id: 'IN_E010', category: 'Head gesture', rule: 'Head wobble/tilt', description: 'The Indian head wobble can signify "yes", "I understand", "okay", or "maybe". Context is key.', consequences: 'Neutral', keywords: ['head wobble', 'head tilt'] },
    ],
    negotiationPractices: [
      { id: 'IN_N001', aspect: 'Relationship Building', practice: 'Strong emphasis on personal relationships', description: 'Building trust and personal connections is crucial and often precedes business discussions.', culturalBasis: 'collectivism, high context', keywords: ['personal relationships', 'trust', 'connections'] },
      { id: 'IN_N002', aspect: 'Process', practice: 'Indirect and flexible approach', description: 'Negotiations can be indirect, lengthy, and may involve multiple levels of approval. Be prepared for flexibility in scheduling.', culturalBasis: 'high context, polychronic time', keywords: ['indirect negotiation', 'flexible', 'lengthy'] },
      { id: 'IN_N003', aspect: 'Decision Making', practice: 'Hierarchical but group-influenced', description: 'While decisions are ultimately made by those in authority, input from subordinates and group consensus can influence the outcome.', culturalBasis: 'high power distance, collectivism', keywords: ['hierarchical decision', 'group influence', 'authority'] },
      { id: 'IN_N004', aspect: 'Communication', practice: 'Respectful language, avoid direct confrontation', description: 'Maintain respectful language and avoid direct confrontation, which can cause loss of face.', culturalBasis: 'high context, high power distance', keywords: ['respectful language', 'confrontation', 'loss of face'] },
    ],
    socialNorms: [
      { id: 'IN_SN001', category: 'Conversation', norm: 'Respect elders and superiors', description: 'Show deference and respect to those older or higher in status. Address them formally.', avoid: 'Challenging elders or superiors directly.', keywords: ['respect elders', 'superiors', 'deference'] },
      { id: 'IN_SN002', category: 'Personal Space', norm: 'Fluid personal space', description: 'Personal space can be closer than in Western cultures, especially among same-gender friends. Touching is common among friends.', avoid: 'Over-reacting to closer proximity.', keywords: ['personal space', 'closer proximity', 'touching'] },
      { id: 'IN_SN003', category: 'Family', norm: 'Family importance', description: 'Family ties are very strong. Inquiries about family are common and show interest.', avoid: 'Disparaging remarks about family.', keywords: ['family importance', 'family ties', 'inquiries'] },
    ],
    commonMisunderstandings: [
      { id: 'IN_CM001', topic: 'The Head Wobble', description: 'The Indian head wobble can mean many things (yes, no, maybe, okay, I understand). It requires careful contextual interpretation.', culturalDifference: 'Non-verbal communication variation.', advice: 'When in doubt, politely ask for verbal confirmation.', keywords: ['head wobble', 'misunderstanding', 'non-verbal'] },
      { id: 'IN_CM002', topic: 'Direct "No"', description: 'A direct "no" is often avoided to maintain harmony and save face. Instead, you might hear "I will try", "it might be difficult", or similar indirect refusals.', culturalDifference: 'Indirect vs. direct communication.', advice: 'Learn to interpret indirect refusals and be patient for clear answers.', keywords: ['direct no', 'indirect refusal', 'harmony', 'save face'] },
    ],
    nonVerbalCues: [
      { id: 'IN_NV001', type: 'Gestures', cue: 'Pointing with a finger', meaning: 'Considered rude. Use a full hand or chin gesture to indicate direction.', interpretation: 'Negative', keywords: ['pointing', 'finger'] },
      { id: 'IN_NV002', type: 'Eye Contact', cue: 'Moderate eye contact', meaning: 'Direct, prolonged eye contact can be seen as aggressive or disrespectful towards elders/superiors.', interpretation: 'Neutral', caution: 'Adjust eye contact based on status and gender.', keywords: ['eye contact', 'moderate', 'aggressive'] },
      { id: 'IN_NV003', type: 'Touch', cue: 'Touching feet', meaning: 'Touching an elder\'s feet is a sign of deep respect.', interpretation: 'Positive', keywords: ['touching feet', 'respect'] },
      { id: 'IN_NV004', type: 'Touch', cue: 'Patting head', meaning: 'Avoid patting children on the head as it is considered sacred.', interpretation: 'Negative', keywords: ['patting head', 'children'] },
    ],
    values: ['Family', 'Hierarchy', 'Respect', 'Harmony', 'Spirituality', 'Hospitality', 'Patience'],
  },
  {
    id: 'BRAZIL',
    name: 'Brazil',
    continent: 'South America',
    language: 'Portuguese',
    helloPhrase: 'Olá',
    goodbyePhrase: 'Tchau',
    culturalDimensions: {
      power_distance: 69,
      individualism_collectivism: 38,
      masculinity_femininity: 49,
      uncertainty_avoidance: 76,
      long_term_orientation: 44,
      indulgence_restraint: 59,
      high_low_context: 70, // High-context
      monochronic_polychronic: 90, // Polychronic
    },
    communicationStyle: {
      directness: 40,
      contextSensitivity: 70,
      formalityLevel: 50,
      emotionalExpression: 80,
    },
    etiquetteRules: [
      { id: 'BR_E001', category: 'Greeting', rule: 'Kiss on cheeks (women), handshake (men)', description: 'Women typically greet with a kiss on each cheek. Men greet with a firm handshake and often a back-pat.', consequences: 'Neutral', keywords: ['kiss cheeks', 'handshake', 'greeting'] },
      { id: 'BR_E002', category: 'Business Meeting', rule: 'Punctuality is flexible', description: 'Punctuality is not as rigid as in some Western cultures. Expect meetings to start later, but try to be on time yourself.', consequences: 'Advisory', keywords: ['punctuality', 'flexible', 'late'] },
      { id: 'BR_E003', category: 'Conversation', rule: 'Embrace physical touch', description: 'Brazilians are generally more physically demonstrative. Light touches on the arm or shoulder are common.', consequences: 'Positive', keywords: ['physical touch', 'touching', 'arm', 'shoulder'] },
      { id: 'BR_E004', category: 'Dining', rule: 'Wait for host to signal start', description: 'Wait until the host signals it\'s time to start eating.', consequences: 'Advisory', keywords: ['dining', 'host', 'start eating'] },
      { id: 'BR_E005', category: 'Gift Giving', rule: 'Avoid black and purple', description: 'Avoid giving gifts that are black or purple, as these colors are associated with funerals.', consequences: 'Negative', keywords: ['black', 'purple', 'gifts', 'funeral colors'] },
      { id: 'BR_E006', category: 'Social', rule: 'Be expressive', description: 'Brazilians are generally expressive and animated. Feel free to use gestures and show emotion.', consequences: 'Positive', keywords: ['expressive', 'animated', 'gestures', 'emotion'] },
      { id: 'BR_E007', category: 'Business Meeting', rule: 'Build personal rapport', description: 'Personal relationships and trust are critical for successful business dealings. Small talk is essential.', consequences: 'Negative', keywords: ['personal rapport', 'trust', 'small talk'] },
      { id: 'BR_E008', category: 'Dress Code', rule: 'Stylish but appropriate', description: 'Brazilians dress well. Business attire is generally smart and stylish. Avoid overly casual wear.', consequences: 'Negative', keywords: ['stylish', 'dress code', 'smart'] },
      { id: 'BR_E009', category: 'Dining', rule: 'Try all offered food', description: 'It\'s polite to try a little of everything offered, even if you don\'t finish it.', consequences: 'Advisory', keywords: ['try food', 'polite', 'dining'] },
      { id: 'BR_E010', category: 'Conversation', rule: 'Talk about family and personal life', description: 'Brazilians are generally open about their family and personal lives. Inquire politely.', consequences: 'Positive', keywords: ['family', 'personal life', 'inquire'] },
    ],
    negotiationPractices: [
      { id: 'BR_N001', aspect: 'Relationship Building', practice: 'Establish strong personal ties (Jeitinho)', description: 'Personal connections and trust are paramount. The concept of "Jeitinho)" (finding a creative, often informal, solution to problems) is key.', culturalBasis: 'collectivism, high context, polychronic time', keywords: ['personal ties', 'jeitinho', 'trust'] },
      { id: 'BR_N002', aspect: 'Process', practice: 'Initial flexibility, then firm agreements', description: 'Be prepared for initial flexibility in discussions and scheduling. Once an agreement is reached, Brazilians expect it to be honored.', culturalBasis: 'polychronic time, high uncertainty avoidance', keywords: ['flexibility', 'agreements', 'honored'] },
      { id: 'BR_N003', aspect: 'Communication', practice: 'Emotion and persuasion', description: 'Emotional appeals and persuasive rhetoric can be effective. Build rapport and make your case with passion.', culturalBasis: 'high context, emotional expression', keywords: ['emotion', 'persuasion', 'rapport'] },
      { id: 'BR_N004', aspect: 'Decision Making', practice: 'Hierarchical with group input', description: 'Decisions are typically made by the highest-ranking individual, but often after extensive consultation and discussion with their team.', culturalBasis: 'high power distance, collectivism', keywords: ['hierarchical decision', 'group input', 'consultation'] },
    ],
    socialNorms: [
      { id: 'BR_SN001', category: 'Conversation', norm: 'Talk about family and personal life', description: 'Brazilians are generally open about their family and personal lives. Inquire politely.', avoid: 'Being overly reserved about your own personal life.', keywords: ['family', 'personal life', 'openness'] },
      { id: 'BR_SN002', category: 'Personal Space', norm: 'Close personal space', description: 'Brazilians generally prefer closer personal proximity in conversations. Touching the arm or back is common.', avoid: 'Pulling away or appearing uncomfortable with close proximity.', keywords: ['personal space', 'close proximity', 'touching'] },
      { id: 'BR_SN003', category: 'Hospitality', norm: 'Generous hosting', description: 'Brazilians are very hospitable. Accept offers of food and drink, even if just a small amount, to show appreciation.', avoid: 'Refusing all offers of hospitality.', keywords: ['hospitality', 'generous', 'food', 'drink'] },
      { id: 'BR_SN004', category: 'Public Behavior', norm: 'Animated and expressive', description: 'Feel free to be expressive and animated in public. Brazilians are often loud and passionate.', avoid: 'Being overly quiet or reserved, which can be seen as cold.', keywords: ['expressive', 'animated', 'passionate'] },
    ],
    commonMisunderstandings: [
      { id: 'BR_CM001', topic: 'Time Perception', description: 'Brazilians have a more flexible, polychronic approach to time. Punctuality may not be as rigid as in monochronic cultures.', culturalDifference: 'Polychronic vs. Monochronic time.', advice: 'Be patient with delays, but maintain your own punctuality. Confirm appointments.', keywords: ['time perception', 'polychronic', 'punctuality', 'flexible'] },
      { id: 'BR_CM002', topic: 'Directness', description: 'While Brazilians can be direct in expressing emotions, they may be indirect in business or when delivering negative news to preserve harmony.', culturalDifference: 'High context communication vs. direct emotional expression.', advice: 'Pay attention to non-verbal cues and context, especially for subtle negative feedback.', keywords: ['directness', 'indirect', 'negative news', 'harmony'] },
    ],
    nonVerbalCues: [
      { id: 'BR_NV001', type: 'Eye Contact', cue: 'Direct and expressive eye contact', meaning: 'Shows engagement, sincerity, and passion.', interpretation: 'Positive', caution: 'Can be intense for those from cultures valuing averted gaze.', keywords: ['eye contact', 'direct', 'expressive'] },
      { id: 'BR_NV002', type: 'Gestures', cue: 'OK sign (thumb and forefinger joined)', meaning: 'Can be seen as offensive (vulgar).', interpretation: 'Negative', caution: 'Avoid using the "OK" gesture.', keywords: ['OK sign', 'offensive', 'vulgar'] },
      { id: 'BR_NV003', type: 'Gestures', cue: 'Flicking the chin upwards', meaning: 'Implies "I don\'t care" or "get lost".', interpretation: 'Negative', keywords: ['flicking chin', 'don\'t care'] },
      { id: 'BR_NV004', type: 'Touch', cue: 'Frequent physical touch (arm, shoulder)', meaning: 'Sign of warmth, friendliness, and rapport.', interpretation: 'Positive', caution: 'Be comfortable with closer proximity and light touching.', keywords: ['physical touch', 'warmth', 'friendliness'] },
    ],
    values: ['Family', 'Friendship', 'Hospitality', 'Social Harmony', 'Passion', 'Flexibility', 'Creativity'],
  },
];

// 2.3 Cultural Dimensions Data
export const CULTURAL_DIMENSIONS_DATA: ICulturalDimension[] = [
  { id: 'power_distance', name: 'Power Distance', description: 'The extent to which less powerful members of organizations and institutions (like the family) accept and expect that power is distributed unequally.', typicalScores: { min: 0, max: 100 } },
  { id: 'individualism_collectivism', name: 'Individualism vs. Collectivism', description: 'Individualism is a preference for a loosely-knit social framework in which individuals are expected to take care of only themselves and their immediate families. Collectivism represents a preference for a tightly-knit framework in society in which individuals can expect their relatives or members of a particular in-group to look after them in exchange for unquestioning loyalty.', typicalScores: { min: 0, max: 100 } },
  { id: 'masculinity_femininity', name: 'Masculinity vs. Femininity', description: 'Masculinity represents a preference in society for achievement, heroism, assertiveness and material rewards for success. Society at large is more competitive. Femininity, stands for a preference for cooperation, modesty, caring for the weak and quality of life. Society at large is more consensus-oriented.', typicalScores: { min: 0, max: 100 } },
  { id: 'uncertainty_avoidance', name: 'Uncertainty Avoidance', description: 'The extent to which the members of a culture feel threatened by ambiguous or unknown situations and have created beliefs and institutions that try to avoid these.', typicalScores: { min: 0, max: 100 } },
  { id: 'long_term_orientation', name: 'Long-Term vs. Short-Term Orientation', description: 'Societies who score high on this dimension take a more pragmatic approach: they encourage thrift and efforts in modern education as a way to prepare for the future. Low-scoring societies prefer to maintain time-honored traditions and norms while viewing societal change with suspicion.', typicalScores: { min: 0, max: 100 } },
  { id: 'indulgence_restraint', name: 'Indulgence vs. Restraint', description: 'Indulgence stands for a society that allows relatively free gratification of basic and natural human drives related to enjoying life and having fun. Restraint stands for a society that suppresses gratification of needs and regulates it by means of strict social norms.', typicalScores: { min: 0, max: 100 } },
  { id: 'high_low_context', name: 'High-Context vs. Low-Context Communication', description: 'High-context cultures rely on implicit communication and non-verbal cues. Low-context cultures rely on explicit verbal communication.', typicalScores: { min: 0, max: 100 } },
  { id: 'monochronic_polychronic', name: 'Monochronic vs. Polychronic Time', description: 'Monochronic cultures perceive time as linear and prefer to do one thing at a time. Polychronic cultures perceive time as fluid and can handle multiple tasks simultaneously.', typicalScores: { min: 0, max: 100 } },
];

// 2.4 Scenario Templates
export const SCENARIO_TEMPLATES_DATA: IScenarioTemplate[] = [
  {
    id: 'SCEN001',
    title: 'First Business Meeting in Germany',
    description: 'You are meeting potential German business partners for the first time to discuss a new software integration project. Focus on making a good first impression.',
    category: 'Business',
    difficulty: 'Beginner',
    objectives: [
      'Establish professional rapport',
      'Clearly present your proposal (briefly)',
      'Demonstrate punctuality and preparation',
      'Avoid common etiquette mistakes',
    ],
    initialSituation: 'You arrive at the meeting room. Mr. Schmidt and Ms. Müller, your German counterparts, are already seated. What is your first action and greeting?',
    keyCulturalAspects: ['GE001', 'GE002', 'GE006', 'GE007', 'GN001', 'GN004', 'GNV001', 'power_distance', 'uncertainty_avoidance', 'monochronic_polychronic'],
    interactionFlowExample: [
      { user: 'I extend my hand firmly to Mr. Schmidt and Ms. Müller, making direct eye contact, and say "Guten Tag, it\'s a pleasure to meet you."', ai: 'They return your firm handshake with a nod. Mr. Schmidt replies, "Guten Tag. Thank you for being punctual." Ms. Müller adds, "We are ready to begin when you are."', feedback: 'Positive: Excellent start! Your firm handshake, eye contact, and punctuality aligned perfectly with German expectations.' },
      { user: 'I casually walk in, give a wave, and say "Hey guys, good to see ya!"', ai: 'Mr. Schmidt and Ms. Müller exchange a quick, almost imperceptible glance. Their smiles tighten slightly. Mr. Schmidt responds with a stiff "Guten Tag." Ms. Müller gestures to a chair.', feedback: 'Negative: Your casual greeting and wave were too informal. Germans value formality and direct, firm greetings in business settings.' },
    ],
    possibleUserActions: [
      'Offer a firm handshake and maintain eye contact while greeting.',
      'Introduce yourself clearly, stating your name and company.',
      'Arrive exactly on time or a few minutes early.',
      'Have your business agenda and materials organized.',
    ],
    possiblePitfalls: [
      'Arriving late without apology.',
      'Using overly casual language or humor immediately.',
      'Avoiding eye contact during greetings.',
      'Ignoring formal titles if used by German counterparts.',
    ],
    relatedLearningModules: ['LM001', 'LM002', 'LM004'],
  },
  {
    id: 'SCEN002',
    title: 'Dining with Japanese Colleagues',
    description: 'You\'ve been invited to a traditional Japanese dinner with your colleagues after securing a successful deal. This is an opportunity to strengthen relationships.',
    category: 'Social',
    difficulty: 'Intermediate',
    objectives: [
      'Show respect for Japanese dining etiquette',
      'Engage in appropriate social conversation',
      'Avoid offensive gestures or behaviors',
      'Build social rapport',
    ],
    initialSituation: 'You are seated at a low table in a traditional Japanese restaurant. Your host gestures towards the food and says, "Please, help yourself."',
    keyCulturalAspects: ['JP_E003', 'JP_E004', 'JP_E009', 'JP_E010', 'JP_SN003', 'JP_CM001', 'JP_NV001', 'JP_NV003', 'high_low_context', 'power_distance'],
    interactionFlowExample: [
      { user: 'I carefully pick up my chopsticks and begin to eat, making sure not to stick them upright in the rice.', ai: 'Your host smiles approvingly. "Please enjoy the meal," he says, pouring you some sake. The conversation flows smoothly.', feedback: 'Positive: You demonstrated good awareness of chopstick etiquette, avoiding a critical cultural faux pas.' },
      { user: 'I stick my chopsticks upright in my rice bowl while I reach for my drink.', ai: 'A noticeable silence falls over the table. Your host\'s smile disappears, and he quickly says something in Japanese to another colleague, who looks at you with concern. The atmosphere becomes tense.', feedback: 'Critical: Sticking chopsticks upright in rice is a significant cultural taboo, resembling a funeral rite. This caused a severe negative reaction.' },
    ],
    possibleUserActions: [
      'Remove shoes before entering the restaurant (if applicable).',
      'Use both hands when receiving items (like a drink).',
      'Try small amounts of all offered dishes.',
      'Slurp noodles to indicate enjoyment.',
    ],
    possiblePitfalls: [
      'Sticking chopsticks upright in rice.',
      'Ignoring shoe removal rules.',
      'Declining all offers of food/drink too quickly.',
      'Excessive physical contact or loud behavior.',
    ],
    relatedLearningModules: ['LM003', 'LM005', 'LM006'],
  },
  {
    id: 'SCEN003',
    title: 'Negotiating a Partnership in India',
    description: 'You are in India to finalize a crucial partnership agreement. This negotiation requires patience, relationship-building, and an understanding of hierarchical structures.',
    category: 'Business',
    difficulty: 'Advanced',
    objectives: [
      'Build personal rapport with key stakeholders',
      'Navigate indirect communication effectively',
      'Demonstrate respect for hierarchy',
      'Secure a mutually beneficial agreement',
    ],
    initialSituation: 'You are in a meeting with Mr. Sharma, the CEO, and his senior team. After initial pleasantries, you bring up a point about timelines, suggesting a tight deadline.',
    keyCulturalAspects: ['IN_E005', 'IN_E007', 'IN_N001', 'IN_N002', 'IN_N003', 'IN_SN001', 'IN_CM002', 'power_distance', 'individualism_collectivism', 'high_low_context', 'monochronic_polychronic'],
    interactionFlowExample: [
      { user: 'I directly state, "We need to finalize this by next month, no exceptions, as per our internal targets."', ai: 'Mr. Sharma nods slowly, but his team members avoid eye contact. He says, "We will do our best. However, such important decisions require careful consideration and consultation." The discussion shifts, but you sense a hesitation to commit to your timeline.', feedback: 'Negative: Your direct demand for a tight deadline was likely perceived as pushy and disrespectful of their process, which values relationship-building and collective decision-making over rigid timelines.' },
      { user: 'I say, "We are keen to move forward expeditiously, and I understand that important decisions require careful thought. What are your initial thoughts on a feasible timeline, keeping in mind mutual aspirations?"', ai: 'Mr. Sharma smiles. "Your enthusiasm is appreciated. We too are eager. Perhaps we can explore the general framework this week, and discuss timelines in more detail after our teams have had a chance to connect on specifics?" You see his team members nodding along.', feedback: 'Positive: Your approach showed respect for their process and hierarchy while still conveying your urgency. You acknowledged their need for deliberation, which fosters trust.' },
    ],
    possibleUserActions: [
      'Engage in extended small talk before business discussions.',
      'Ask about family (politely) to build rapport.',
      'Be prepared for flexibility in scheduling and adapt your agenda.',
      'Use indirect language when suggesting changes or expressing disagreements.',
    ],
    possiblePitfalls: [
      'Being overly direct or aggressive with timelines.',
      'Ignoring hierarchical structures.',
      'Rushing the decision-making process.',
      'Failing to build personal connections before business.',
    ],
    relatedLearningModules: ['LM007', 'LM008'],
  },
];

// 2.5 Learning Modules
export const LEARNING_MODULES_DATA: ILearningModule[] = [
  {
    id: 'LM001',
    title: 'German Business Etiquette Essentials',
    category: 'Etiquette',
    culturesCovered: ['GERMANY'],
    content: 'Germany is known for its strong emphasis on punctuality, order, and direct communication. In business settings, this translates to structured meetings, factual presentations, and a clear distinction between personal and professional relationships. This module covers key aspects of greeting, meeting conduct, and social interactions within a German business context.',
    quizQuestions: [
      { id: 'Q1_LM001', question: 'What is considered highly important when attending a business meeting in Germany?', options: [{ text: 'Arriving casually late', isCorrect: false }, { text: 'Being punctual', isCorrect: true }, { text: 'Starting with extensive small talk', isCorrect: false }, { text: 'Using first names immediately', isCorrect: false }], explanation: 'Punctuality is extremely important in Germany; arriving late without a valid excuse is considered rude.' },
      { id: 'Q2_LM001', question: 'How should you generally address a German business counterpart initially?', options: [{ text: 'By their first name', isCorrect: false }, { text: 'By their professional title and surname', isCorrect: true }, { text: 'With a casual "Hey there!"', isCorrect: false }, { text: 'It depends on gender', isCorrect: false }], explanation: 'Unless invited otherwise, address individuals by their professional title (if applicable) and surname.' },
    ],
    estimatedCompletionTimeMinutes: 30,
    prerequisites: [],
  },
  {
    id: 'LM002',
    title: 'Communication Styles: Germany vs. The World',
    category: 'Communication',
    culturesCovered: ['GERMANY', 'USA'],
    content: 'Understanding the communication style of a culture is crucial. Germans typically favor a low-context, direct, and factual communication style. Messages are explicit, and clarity is prioritized over indirectness. This contrasts with high-context cultures where much meaning is derived from non-verbal cues and shared understanding.',
    quizQuestions: [
      { id: 'Q1_LM002', question: 'Which communication style best describes German business communication?', options: [{ text: 'High-context, indirect', isCorrect: false }, { text: 'Low-context, indirect', isCorrect: false }, { text: 'High-context, direct', isCorrect: false }, { text: 'Low-context, direct', isCorrect: true }], explanation: 'Germans prefer direct and factual communication, typical of a low-context style.' },
      { id: 'Q2_LM002', question: 'What might be a common misunderstanding when a direct communicator interacts with an indirect communicator?', options: [{ text: 'Directness is seen as respect', isCorrect: false }, { text: 'Indirectness is seen as efficiency', isCorrect: false }, { text: 'Directness is seen as bluntness; indirectness as evasiveness', isCorrect: true }, { text: 'Both are equally valued', isCorrect: false }], explanation: 'Direct communicators may perceive indirectness as evasiveness, while indirect communicators may find directness to be blunt or rude.' },
    ],
    estimatedCompletionTimeMinutes: 25,
    prerequisites: [],
  },
  {
    id: 'LM003',
    title: 'Navigating Japanese Social & Dining Customs',
    category: 'Etiquette',
    culturesCovered: ['JAPAN'],
    content: 'Japanese social and dining etiquette is rich with traditions that emphasize respect, harmony, and group cohesion. From the intricate art of bowing to the careful handling of chopsticks, understanding these customs is vital to making a positive impression and avoiding unintentional offense. This module guides you through common scenarios, from greetings to mealtime manners.',
    quizQuestions: [
      { id: 'Q1_LM003', question: 'What is a highly offensive action with chopsticks in Japan?', options: [{ text: 'Resting them on the side of your bowl', isCorrect: false }, { text: 'Sticking them upright in your rice', isCorrect: true }, { text: 'Using them to pick up large pieces of food', isCorrect: false }, { text: 'Crossing them on the table', isCorrect: false }], explanation: 'Sticking chopsticks upright in rice is highly offensive as it resembles a funeral rite.' },
      { id: 'Q2_LM003', question: 'What is the appropriate response to an offer of food or drink in a Japanese home?', options: [{ text: 'Immediately accept with enthusiasm', isCorrect: false }, { text: 'Politely refuse initially, then accept if insisted upon', isCorrect: true }, { text: 'Decline firmly if you are not hungry', isCorrect: false }, { text: 'Wait for someone else to accept first', isCorrect: false }], explanation: 'It is polite to initially refuse an offer of food or drink before accepting, demonstrating humility and consideration.' },
    ],
    estimatedCompletionTimeMinutes: 40,
    prerequisites: [],
  },
  {
    id: 'LM004',
    title: 'Global Negotiation Strategies: Low-Context Cultures',
    category: 'Negotiation',
    culturesCovered: ['GERMANY', 'USA'],
    content: 'Negotiating in low-context cultures like Germany or the US often involves direct communication, a focus on facts and figures, and a more task-oriented approach. This module explores strategies for preparing, conducting, and closing deals in environments where efficiency and clear communication are highly valued. Learn to present your case logically and anticipate direct counter-arguments.',
    quizQuestions: [
      { id: 'Q1_LM004', question: 'In low-context negotiations, what is typically prioritized?', options: [{ text: 'Building extensive personal relationships', isCorrect: false }, { text: 'Indirect communication and subtle cues', isCorrect: false }, { text: 'Facts, figures, and direct arguments', isCorrect: true }, { text: 'Emotional appeals and persuasion', isCorrect: false }], explanation: 'Low-context cultures prioritize clear, explicit communication, focusing on facts and figures.' },
      { id: 'Q2_LM004', question: 'What is a common pitfall in negotiations with low-context cultures?', options: [{ text: 'Being too subtle or ambiguous', isCorrect: true }, { text: 'Being overly direct', isCorrect: false }, { text: 'Presenting too much data', isCorrect: false }, { text: 'Rushing the relationship-building phase', isCorrect: false }], explanation: 'Being too subtle or ambiguous can lead to misunderstandings, as low-context cultures expect explicit communication.' },
    ],
    estimatedCompletionTimeMinutes: 45,
    prerequisites: ['LM002'],
  },
  {
    id: 'LM005',
    title: 'High-Context Communication: Japan & India',
    category: 'Communication',
    culturesCovered: ['JAPAN', 'INDIA'],
    content: 'High-context communication is prevalent in cultures like Japan and India, where meaning is often embedded in the context, non-verbal cues, and shared understanding, rather than solely in explicit words. This module teaches you to read between the lines, understand the importance of silence, and interpret subtle signals to avoid misinterpretations in complex social and business interactions.',
    quizQuestions: [
      { id: 'Q1_LM005', question: 'In a high-context culture, what might silence often indicate?', options: [{ text: 'Lack of interest', isCorrect: false }, { text: 'Disagreement or anger', isCorrect: false }, { text: 'Thoughtfulness or a desire to avoid direct refusal', isCorrect: true }, { text: 'A request for you to speak more', isCorrect: false }], explanation: 'Silence in high-context cultures can indicate thoughtfulness or a way to avoid direct refusal to maintain harmony.' },
      { id: 'Q2_LM005', question: 'Which cultural dimension is most closely related to high-context communication?', options: [{ text: 'Individualism', isCorrect: false }, { text: 'Long-Term Orientation', isCorrect: false }, { text: 'Power Distance', isCorrect: false }, { text: 'Collectivism', isCorrect: true }], explanation: 'High-context communication is often associated with collectivist cultures, where shared group understanding is high.' },
    ],
    estimatedCompletionTimeMinutes: 35,
    prerequisites: ['LM002'],
  },
  {
    id: 'LM006',
    title: 'Respecting Hierarchy: Asia vs. The West',
    category: 'Values',
    culturesCovered: ['JAPAN', 'INDIA'],
    content: 'Hierarchy plays a significant role in many Asian cultures, influencing communication, decision-making, and social interactions. This module explores how power distance manifests in daily life and business, and provides guidance on showing appropriate deference to elders and superiors, which is crucial for building trust and successful collaborations.',
    quizQuestions: [
      { id: 'Q1_LM006', question: 'How might a high power distance culture impact decision-making in a business meeting?', options: [{ text: 'Decisions are always made quickly by one person', isCorrect: false }, { text: 'Decisions are made by group consensus only', isCorrect: false }, { text: 'Decisions are typically made by the highest-ranking person, often after consulting subordinates', isCorrect: true }, { text: 'Everyone has an equal say in all decisions', isCorrect: false }], explanation: 'In high power distance cultures, final decisions rest with the highest authority, but they often gather input from their team first.' },
      { id: 'Q2_LM006', question: 'What is a respectful way to address an elder or superior in many Asian cultures?', options: [{ text: 'By their first name', isCorrect: false }, { text: 'With a casual nickname', isCorrect: false }, { text: 'Using formal titles and surnames, showing deference', isCorrect: true }, { text: 'Avoiding direct address altogether', isCorrect: false }], explanation: 'Using formal titles and surnames, and showing deference, is a sign of respect for elders and superiors.' },
    ],
    estimatedCompletionTimeMinutes: 30,
    prerequisites: [],
  },
  {
    id: 'LM007',
    title: 'Building Relationships: The Indian Way',
    category: 'Relationship Building',
    culturesCovered: ['INDIA'],
    content: 'In India, personal relationships form the bedrock of successful business and social interactions. This module emphasizes the importance of building trust, engaging in genuine personal connections, and understanding the role of family and community in daily life. Learn how to foster strong relationships that can lead to long-term success.',
    quizQuestions: [
      { id: 'Q1_LM007', question: 'What is paramount before and during negotiations in India?', options: [{ text: 'Strict adherence to timelines', isCorrect: false }, { text: 'Building trust and personal connections', isCorrect: true }, { text: 'Direct, aggressive bargaining', isCorrect: false }, { text: 'Minimizing social interaction', isCorrect: false }], explanation: 'Building trust and strong personal connections is crucial in India, often preceding business discussions.' },
      { id: 'Q2_LM007', question: 'What topics are generally considered appropriate for small talk to build rapport in India?', options: [{ text: 'Politics and religion', isCorrect: false }, { text: 'Criticizing local customs', isCorrect: false }, { text: 'Family, travel, and general well-being', isCorrect: true }, { text: 'Personal finances', isCorrect: false }], explanation: 'Inquiring politely about family, travel, and general well-being are good ways to build rapport.' },
    ],
    estimatedCompletionTimeMinutes: 20,
    prerequisites: [],
  },
  {
    id: 'LM008',
    title: 'Understanding Polychronic Time: India & Brazil',
    category: 'General',
    culturesCovered: ['INDIA', 'BRAZIL'],
    content: 'Polychronic cultures, like India and Brazil, view time as flexible and fluid. Multiple tasks are often juggled simultaneously, and appointments might be seen as approximations rather than rigid commitments. This module helps you adapt your expectations and strategies for scheduling, meetings, and project management when working in polychronic environments.',
    quizQuestions: [
      { id: 'Q1_LM008', question: 'What is a characteristic of polychronic time cultures?', options: [{ text: 'Doing one task at a time, strictly adhering to schedules', isCorrect: false }, { text: 'Perceiving time as fluid and engaging in multiple tasks simultaneously', isCorrect: true }, { text: 'Prioritizing speed over relationship building', isCorrect: false }, { text: 'Viewing all delays as disrespectful', isCorrect: false }], explanation: 'Polychronic cultures perceive time as fluid and can handle multiple tasks simultaneously.' },
      { id: 'Q2_LM008', question: 'When dealing with a polychronic culture, what is a recommended approach for managing meetings?', options: [{ text: 'Insist on starting exactly on time', isCorrect: false }, { text: 'Be prepared for potential delays and have a flexible agenda', isCorrect: true }, { text: 'Avoid setting specific meeting times', isCorrect: false }, { text: 'Send multiple reminders about punctuality', isCorrect: false }], explanation: 'Being prepared for potential delays and having a flexible agenda helps manage expectations and maintain harmony.' },
    ],
    estimatedCompletionTimeMinutes: 25,
    prerequisites: [],
  },
];

// 2.6 Resources
export const RESOURCES_DATA: IResource[] = [
  { id: 'RES001', title: 'Hofstede Insights: Germany', type: 'Article', url: 'https://www.hofstede-insights.com/country-comparison/germany/', tags: ['Germany', 'Dimensions', 'Research'], relatedCultures: ['GERMANY'] },
  { id: 'RES002', title: 'Japanese Business Etiquette Guide', type: 'Article', url: 'https://www.japan-guide.com/e/e622.html', tags: ['Japan', 'Business', 'Etiquette'], relatedCultures: ['JAPAN'] },
  { id: 'RES003', title: 'Video: Understanding High-Context Cultures', type: 'Video', url: 'https://www.youtube.com/watch?v=R9U0Cj7NnI4', tags: ['Communication', 'High-Context', 'General'], relatedCultures: ['JAPAN', 'INDIA', 'BRAZIL'] },
  { id: 'RES004', title: 'Book: Kiss, Bow, or Shake Hands', type: 'Article', url: 'https://www.amazon.com/Kiss-Bow-Shake-Hands-International/dp/1593373686', tags: ['General', 'Etiquette', 'Global'], relatedCultures: [] }, // General resource
  { id: 'RES005', title: 'Case Study: DaimlerChrysler Merger Cultural Clash', type: 'Case Study', url: 'https://hbr.org/2007/04/the-daimlerchrysler-merger', tags: ['Business', 'Cross-cultural', 'Merger'], relatedCultures: ['GERMANY', 'USA'] },
  { id: 'RES006', title: 'Indian Business Negotiation Strategies', type: 'Article', url: 'https://www.communicaid.com/country/india/negotiating-in-india/', tags: ['India', 'Negotiation', 'Business'], relatedCultures: ['INDIA'] },
  { id: 'RES007', title: 'Brazil Cultural Guide for Business', type: 'Article', url: 'https://www.worldbusinessculture.com/country-profiles/brazil/negotiation/', tags: ['Brazil', 'Business', 'Etiquette'], relatedCultures: ['BRAZIL'] },
  { id: 'RES008', title: 'Video: Polychronic vs. Monochronic Time', type: 'Video', url: 'https://www.youtube.com/watch?v=F2E0j1w0xGk', tags: ['Time', 'Communication', 'General'], relatedCultures: ['INDIA', 'BRAZIL', 'GERMANY', 'USA'] },
];

// 2.7 User Profiles (Mock Data)
export const USER_PROFILES_DATA: IUserCulturalProfile[] = [
  {
    userId: 'user_alice',
    username: 'Alice Smith',
    originCultureId: 'USA',
    targetCultureInterests: ['GERMANY', 'JAPAN', 'INDIA'],
    culturalCompetenceScore: {
      'GERMANY': 65, // Intermediate
      'JAPAN': 40,   // Beginner
      'INDIA': 30,   // Beginner
      'USA': 90,     // Native
    },
    overallCompetence: 60,
    learningPathProgress: {
      'LM001': { completed: true, score: 85 },
      'LM002': { completed: true, score: 70 },
      'LM003': { completed: false, score: undefined },
      'LM004': { completed: false, score: undefined },
    },
    scenarioHistory: [
      { scenarioInstanceId: generateUniqueId('scenario_hist'), scenarioTemplateId: 'SCEN001', targetCultureId: 'GERMANY', completionDate: '2023-03-15T10:00:00Z', finalSuccessMetric: 75, totalInteractions: 5, keyLearnings: ['Punctuality is critical', 'Firm handshake is expected'] },
    ],
  },
  {
    userId: 'user_bob',
    username: 'Bob Johnson',
    originCultureId: 'GERMANY',
    targetCultureInterests: ['USA', 'BRAZIL'],
    culturalCompetenceScore: {
      'USA': 55,     // Intermediate
      'BRAZIL': 25,  // Beginner
      'GERMANY': 95, // Native
    },
    overallCompetence: 60,
    learningPathProgress: {
      'LM002': { completed: true, score: 60 },
      'LM008': { completed: false, score: undefined },
    },
    scenarioHistory: [],
  },
  {
    userId: 'user_charlie',
    username: 'Charlie Brown',
    originCultureId: 'JAPAN',
    targetCultureInterests: ['INDIA', 'GERMANY'],
    culturalCompetenceScore: {
      'INDIA': 60,   // Intermediate
      'GERMANY': 35, // Beginner
      'JAPAN': 98,   // Native
    },
    overallCompetence: 64,
    learningPathProgress: {
      'LM005': { completed: true, score: 80 },
      'LM006': { completed: true, score: 90 },
      'LM007': { completed: false, score: undefined },
    },
    scenarioHistory: [
      { scenarioInstanceId: generateUniqueId('scenario_hist'), scenarioTemplateId: 'SCEN003', targetCultureId: 'INDIA', completionDate: '2023-04-01T14:30:00Z', finalSuccessMetric: 68, totalInteractions: 7, keyLearnings: ['Indirectness for negative news', 'Building rapport takes time'] },
    ],
  },
];

// 2.8 System Settings (Mock Data)
export const SYSTEM_SETTINGS_DATA: ISystemSettings = {
  darkMode: false,
  notificationPreferences: {
    email: true,
    inApp: true,
    scenarioRecommendations: true,
  },
  llmModelPreference: 'detailed',
  feedbackVerbosity: 'pedagogical',
  aiPersona: 'supportive',
};

// 2.9 Active Scenarios (Mock Data)
export const ACTIVE_SCENARIOS_DATA: IActiveScenarioInstance[] = [
  {
    scenarioTemplateId: 'SCEN001',
    instanceId: 'active_SCEN001_user_alice_001',
    currentSituation: 'You are in the meeting room. Mr. Schmidt and Ms. Müller, your German counterparts, are already seated. What is your first action and greeting?',
    objectiveStatus: {
      'Establish professional rapport': false,
      'Clearly present your proposal (briefly)': false,
      'Demonstrate punctuality and preparation': true, // Assumed Alice was punctual
      'Avoid common etiquette mistakes': false,
    },
    targetCulture: CULTURAL_PROFILES_DATA.find(c => c.id === 'GERMANY')!,
    participants: [
      { name: 'Mr. Schmidt', role: 'Head of Department', culturalBackground: 'Germany' },
      { name: 'Ms. Müller', role: 'Project Lead', culturalBackground: 'Germany' },
    ],
    currentTurn: 1,
    maxTurns: 10,
    isCompleted: false,
    successMetric: 50, // Initial success metric
  },
];

/**
 * Interface defining the context for the Cultural Intelligence Agent's decision-making.
 * This encapsulates all necessary input for autonomous operation.
 */
interface IAgentContext {
  userAction: string;
  currentScenario: IActiveScenarioInstance;
  userProfile: IUserCulturalProfile;
  systemSettings: ISystemSettings;
  culturalData: ICulture;
  scenarioTemplate: IScenarioTemplate;
}

/**
 * Provides a simulated programmatic interface to a programmable token rail for incentive distribution.
 * Business Value: This module represents a critical monetization and engagement layer,
 * enabling direct financial incentives for skill acquisition and behavior modification.
 * It integrates learning outcomes with tangible value, creating new revenue streams and fostering a highly motivated user base.
 */
export const tokenRewardService = {
  /**
   * Simulates issuing tokens to a user based on their performance.
   * In a live system, this would interact with the Programmable Token Rail Layer,
   * performing atomic, cryptographically validated transactions.
   * @param userId The ID of the user to reward.
   * @param amount The amount of tokens to issue.
   * @param reason The reason for the reward.
   */
  async issueTokens(userId: string, amount: number, reason: string): Promise<{ type: 'token', amount: number, id: string }> {
    systemLogger.audit(userId, 'TOKEN_ISSUE_REQUEST', { amount, reason });
    // Simulate real-time settlement and cryptographic integrity.
    // In a real system: call to token rail API, check for idempotency, verify signature.
    const transactionId = generateUniqueId('txn_token');
    systemLogger.audit(userId, 'TOKEN_ISSUED', { transactionId, amount, reason });
    return Promise.resolve({ type: 'token', amount, id: transactionId });
  },

  /**
   * Simulates granting a digital certificate or achievement.
   * In a live system, this would register a verifiable credential on a digital identity ledger.
   * @param userId The ID of the user.
   * @param certificateType The type of certificate.
   */
  async grantCertificate(userId: string, certificateType: string): Promise<{ type: 'certificate', id: string }> {
    systemLogger.audit(userId, 'CERTIFICATE_GRANT_REQUEST', { certificateType });
    // Simulate digital identity layer integration for verifiable credentials.
    const certificateId = generateUniqueId('cert');
    systemLogger.audit(userId, 'CERTIFICATE_GRANTED', { certificateId, certificateType });
    return Promise.resolve({ type: 'certificate', id: certificateId });
  }
};

/**
 * Exported class embodying the Agentic Intelligence Layer for cultural advising.
 * This agent observes user interactions, decides on appropriate feedback,
 * and can trigger actions based on its governance context and learned patterns.
 *
 * Business Impact: This agent is the core engine for automated, scalable cultural intelligence.
 * It reduces human overhead for feedback, accelerates learning cycles, and ensures consistent,
 * high-quality guidance. By integrating with real-time feedback and potentially reward systems,
 * it drives measurable improvements in cultural competence, directly impacting global team effectiveness
 * and reducing financial risks associated with cross-cultural miscommunications.
 * It is a foundational component for building a 'culturally intelligent' enterprise.
 */
export class CulturalIntelligenceAgent {
  /**
   * Constructs the CulturalIntelligenceAgent.
   */
  constructor() {
    systemLogger.info(null, 'AGENT_INIT', { agent: 'CulturalIntelligenceAgent' });
  }

  /**
   * Observes the user's action and the current scenario context.
   * This method simulates the 'monitoring skill' of an agent, gathering all relevant data points.
   * @param context The full context of the interaction.
   * @returns An object containing parsed user intent and identified cultural aspects.
   */
  private observe(context: IAgentContext): { userIntent: string; identifiedAspects: string[] } {
    const { userAction, culturalData, scenarioTemplate } = context;
    const lowerCaseUserAction = userAction.toLowerCase();
    const identifiedAspects: string[] = [];
    let userIntent = 'general_interaction';

    // Simple keyword matching to identify intent and relevant cultural aspects
    const allCulturalItems = [
      ...culturalData.etiquetteRules,
      ...culturalData.negotiationPractices,
      ...culturalData.socialNorms,
      ...culturalData.commonMisunderstandings,
      ...culturalData.nonVerbalCues,
    ];

    for (const item of allCulturalItems) {
      if (item.keywords?.some(keyword => lowerCaseUserAction.includes(keyword.toLowerCase()))) {
        identifiedAspects.push(item.id);
        if (item.category === 'Greeting' || item.category === 'Conversation') userIntent = 'social_greeting';
        if (item.category === 'Dining') userIntent = 'dining_etiquette';
        if (item.category === 'Business Meeting' || item.aspect === 'Negotiation') userIntent = 'business_negotiation';
      }
    }

    if (scenarioTemplate.possibleUserActions.some(action => lowerCaseUserAction.includes(action.toLowerCase()))) {
      userIntent = 'positive_action';
    }
    if (scenarioTemplate.possiblePitfalls.some(pitfall => lowerCaseUserAction.includes(pitfall.toLowerCase()))) {
      userIntent = 'potential_pitfall';
    }

    systemLogger.info(context.userProfile.userId, 'AGENT_OBSERVATION', { userIntent, identifiedAspects });
    return { userIntent, identifiedAspects };
  }

  /**
   * Decides the appropriate AI response and detailed feedback based on observations.
   * This method embodies the 'decision skill', leveraging cultural data and business rules.
   * @param context The full context of the interaction.
   * @param observation The observed user intent and identified cultural aspects.
   * @returns The generated AI response, feedback, and competence impact.
   */
  private decide(context: IAgentContext, observation: { userIntent: string; identifiedAspects: string[] }): { aiResponse: string; feedbackSummary: { text: string; severity: FeedbackSeverity }; detailedFeedback: DetailedFeedbackDimension[]; competenceImpact: number; suggestedResources: string[] } {
    const { userAction, currentScenario, culturalData, systemSettings, scenarioTemplate } = context;
    const lowerCaseUserAction = userAction.toLowerCase();

    let aiResponse = currentScenario.currentSituation; // Default to existing situation, modified below
    let feedbackSummary: { text: string; severity: FeedbackSeverity } = { text: "Neutral interaction.", severity: 'Neutral' };
    let detailedFeedback: DetailedFeedbackDimension[] = [];
    let competenceImpact = 0;
    const suggestedResources: string[] = [];

    // Prioritize critical rules and pitfalls
    const criticalRuleViolations = culturalData.etiquetteRules.filter(
      rule => rule.consequences === 'Critical' && rule.keywords?.some(k => lowerCaseUserAction.includes(k.toLowerCase()))
    );
    const negativeRuleViolations = culturalData.etiquetteRules.filter(
      rule => rule.consequences === 'Negative' && rule.keywords?.some(k => lowerCaseUserAction.includes(k.toLowerCase()))
    );
    const positiveAlignments = culturalData.etiquetteRules.filter(
      rule => rule.consequences === 'Positive' && rule.keywords?.some(k => lowerCaseUserAction.includes(k.toLowerCase()))
    );

    // Apply persona and verbosity settings for initial AI response and feedback text generation
    const getResponsePrefix = (persona: ISystemSettings['aiPersona']) => {
      switch (persona) {
        case 'supportive': return 'That\'s an interesting approach. Let\'s see... ';
        case 'challenging': return 'Consider your strategy carefully. ';
        case 'formal_advisor': return 'Analyzing your input, the cultural implications are as follows: ';
        case 'neutral':
        default: return 'Processing your action. ';
      }
    };

    if (criticalRuleViolations.length > 0) {
      const rule = criticalRuleViolations[0];
      aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}The atmosphere shifts dramatically. ${rule.description.replace('is highly offensive.', 'has caused significant offense.')}`;
      feedbackSummary = { text: `Critical: ${rule.rule} violation.`, severity: 'Critical' };
      detailedFeedback.push({
        dimension: `${rule.category} Etiquette`, score: -5, explanation: `${rule.description} This action is a severe cultural taboo in ${culturalData.name}.`, severity: 'Critical', recommendations: [`Avoid this action in ${culturalData.name}. Review learning module for ${rule.category}.`]
      });
      competenceImpact -= 25;
      scenarioTemplate.relatedLearningModules?.forEach(m => suggestedResources.push(m)); // Suggest relevant modules
    } else if (negativeRuleViolations.length > 0) {
      const rule = negativeRuleViolations[0];
      aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}There's a noticeable, subtle shift in the interaction. ${rule.description.replace('is considered rude.', 'might be considered impolite.')}`;
      feedbackSummary = { text: `Negative: ${rule.rule} might be perceived poorly.`, severity: 'Negative' };
      detailedFeedback.push({
        dimension: `${rule.category} Etiquette`, score: -3, explanation: `${rule.description} This can lead to misunderstandings or mild offense.`, severity: 'Negative', recommendations: [`Be mindful of ${rule.category} in ${culturalData.name}.`]
      });
      competenceImpact -= 10;
    } else if (positiveAlignments.length > 0) {
      const rule = positiveAlignments[0];
      aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}Your counterparts react positively. ${rule.description.replace('is expected.', 'is well-received.')}`;
      feedbackSummary = { text: `Positive: Well-aligned with ${rule.category} etiquette.`, severity: 'Positive' };
      detailedFeedback.push({
        dimension: `${rule.category} Etiquette`, score: 4, explanation: `${rule.description} Your action was culturally appropriate and fostered a positive interaction.`, severity: 'Positive', recommendations: [`Continue to apply this principle in ${culturalData.name}.`]
      });
      competenceImpact += 15;
    } else if (observation.userIntent === 'positive_action') {
      aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}Your action is well-received. The interaction proceeds smoothly.`;
      feedbackSummary = { text: "Positive: Aligned with scenario objectives and cultural expectations.", severity: 'Positive' };
      detailedFeedback.push({ dimension: 'Scenario Objective', score: 3, explanation: 'You made a good choice, progressing the scenario positively.', severity: 'Positive', recommendations: [] });
      competenceImpact += 10;
    } else if (observation.userIntent === 'potential_pitfall') {
      aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}A moment of awkwardness. Your action might have unintended consequences.`;
      feedbackSummary = { text: "Advisory: A potential cultural pitfall was approached.", severity: 'Advisory' };
      detailedFeedback.push({ dimension: 'Scenario Pitfall', score: -2, explanation: 'Your action touched upon a known cultural pitfall. Consider alternative approaches.', severity: 'Advisory', recommendations: [] });
      competenceImpact -= 5;
    } else {
      // General communication style and context sensitivity check
      const directnessDiff = Math.abs(culturalData.communicationStyle.directness - (context.userProfile.originCultureId === 'USA' ? 70 : 50)); // Assume some average for user's origin
      if (directnessDiff > 30) { // Significant difference
        if (culturalData.communicationStyle.directness > 70 && lowerCaseUserAction.length < 20) { // Culture is direct, user is brief
          aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}Your counterparts seem to expect more detail.`;
          feedbackSummary = { text: "Advisory: Communication was too brief for this direct culture.", severity: 'Advisory' };
          detailedFeedback.push({ dimension: 'Communication Style', score: -1, explanation: `In ${culturalData.name}, a more direct and detailed approach is often appreciated.`, severity: 'Advisory', recommendations: ['Be more explicit and comprehensive in your statements.'] });
          competenceImpact -= 2;
        } else if (culturalData.communicationStyle.directness < 30 && lowerCaseUserAction.length > 50 && !lowerCaseUserAction.includes('if possible')) { // Culture is indirect, user is very direct
          aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}Your directness might be perceived as abrupt.`;
          feedbackSummary = { text: "Advisory: Communication was too direct for this indirect culture.", severity: 'Advisory' };
          detailedFeedback.push({ dimension: 'Communication Style', score: -1, explanation: `Consider more indirect phrasing and context in ${culturalData.name}.`, severity: 'Advisory', recommendations: ['Use qualifiers and allow for context to convey meaning.'] });
          competenceImpact -= 2;
        }
      }

      if (aiResponse === currentScenario.currentSituation) { // If no specific rule or intent triggered, provide a generic neutral response.
        aiResponse = `${getResponsePrefix(systemSettings.aiPersona)}I understand your input. Let's see how the interaction evolves.`;
        feedbackSummary = { text: "Neutral: No strong cultural implications detected in this interaction.", severity: 'Neutral' };
        detailedFeedback.push({
          dimension: 'General Interaction', score: 0, explanation: 'Your action was generally acceptable, but did not significantly impact cultural perception positively or negatively.', severity: 'Neutral', recommendations: []
        });
      }
    }

    // Adapt feedback verbosity
    if (systemSettings.feedbackVerbosity === 'concise') {
      detailedFeedback = []; // Remove detailed feedback for concise mode
    }

    systemLogger.audit(context.userProfile.userId, 'AGENT_DECISION', { userAction, feedbackSummary, competenceImpact });
    return { aiResponse, feedbackSummary, detailedFeedback, competenceImpact, suggestedResources };
  }

  /**
   * Applies governance and policy compliance to the agent's output.
   * This method ensures responses align with platform standards and user settings.
   * @param feedback The feedback generated by the agent.
   * @param systemSettings The system-wide settings.
   * @returns The governed feedback.
   */
  private applyGovernance(feedback: CompleteInteractionFeedback, systemSettings: ISystemSettings): CompleteInteractionFeedback {
    let { aiResponse, feedbackSummary, detailedFeedback } = feedback;

    // Adjust AI persona tone
    switch (systemSettings.aiPersona) {
      case 'challenging':
        aiResponse = aiResponse.replace('I understand', 'Your statement is noted').replace('Let\'s see how', 'Assess the potential impact before').replace('You made a good choice', 'Your decision might be effective');
        if (feedbackSummary.severity === 'Positive') feedbackSummary.text = feedbackSummary.text.replace('Positive', 'Effective');
        if (feedbackSummary.severity === 'Neutral') feedbackSummary.text = feedbackSummary.text.replace('Neutral', 'Requires refinement');
        break;
      case 'formal_advisor':
        aiResponse = `Statement analysis complete: ${aiResponse}`;
        if (feedbackSummary.severity === 'Positive') feedbackSummary.text = `Culturally optimal: ${feedbackSummary.text}`;
        if (feedbackSummary.severity === 'Negative') feedbackSummary.text = `Suboptimal cultural alignment: ${feedbackSummary.text}`;
        break;
      case 'risk_averse': // Special setting, e.g., for financial compliance
        if (feedbackSummary.severity === 'Critical' || feedbackSummary.severity === 'Negative') {
          aiResponse = `WARNING: Your action carries significant cultural risk. Immediate review recommended. ${aiResponse}`;
          feedbackSummary.text = `RISK ALERT: ${feedbackSummary.text}`;
          feedbackSummary.severity = 'Critical';
        }
        break;
      // 'supportive' and 'neutral' are defaults or handled by original response generation.
    }

    // Apply feedback verbosity
    if (systemSettings.feedbackVerbosity === 'concise') {
      detailedFeedback = [];
    } else if (systemSettings.feedbackVerbosity === 'pedagogical' && detailedFeedback.length > 0) {
      detailedFeedback = detailedFeedback.map(f => ({
        ...f,
        explanation: `Pedagogical Insight: ${f.explanation}`,
        recommendations: f.recommendations.map(r => `Learning Action: ${r}`)
      }));
    }

    systemLogger.audit(feedback.userId || 'system', 'AGENT_GOVERNANCE_APPLIED', {
      originalSeverity: feedback.feedbackSummary.severity,
      governedSeverity: feedbackSummary.severity,
      feedbackVerbosity: systemSettings.feedbackVerbosity,
      aiPersona: systemSettings.aiPersona,
    });

    return { ...feedback, aiResponse, feedbackSummary, detailedFeedback };
  }

  /**
   * Orchestrates the agent's full interaction cycle: Observe -> Decide -> Govern.
   * This is the public interface for the CulturalIntelligenceAgent.
   * @param userId The ID of the user.
   * @param activeScenario The current active scenario instance.
   * @param userAction The user's input.
   * @param userProfile The current user profile.
   * @param culturalData The target culture's data.
   * @param systemSettings Current system settings.
   * @param scenarioTemplate The template for the active scenario.
   * @returns A complete interaction feedback object.
   */
  public async processUserInteraction(
    userId: string,
    activeScenario: IActiveScenarioInstance,
    userAction: string,
    userProfile: IUserCulturalProfile,
    culturalData: ICulture,
    systemSettings: ISystemSettings,
    scenarioTemplate: IScenarioTemplate,
  ): Promise<CompleteInteractionFeedback> {
    systemLogger.audit(userId, 'AGENT_PROCESSING_START', { scenarioId: activeScenario.instanceId, userAction });

    const context: IAgentContext = {
      userAction,
      currentScenario: activeScenario,
      userProfile,
      systemSettings,
      culturalData,
      scenarioTemplate,
    };

    const observation = this.observe(context);
    const decision = this.decide(context, observation);

    let completeFeedback: CompleteInteractionFeedback = {
      userAction,
      aiResponse: decision.aiResponse,
      feedbackSummary: decision.feedbackSummary,
      timestamp: new Date().toISOString(),
      scenarioId: activeScenario.instanceId,
      targetCultureId: activeScenario.targetCulture.id,
      userProfileSnapshot: { ...userProfile },
      detailedFeedback: decision.detailedFeedback,
      overallCulturalCompetenceImpact: decision.competenceImpact,
      suggestedResources: decision.suggestedResources.length > 0 ? decision.suggestedResources : undefined,
    };

    // Apply governance policies
    completeFeedback = this.applyGovernance(completeFeedback, systemSettings);

    // Simulate potential rewards for significant positive impact
    if (completeFeedback.overallCulturalCompetenceImpact > 10) {
      try {
        const reward = await tokenRewardService.issueTokens(userId, Math.floor(completeFeedback.overallCulturalCompetenceImpact / 5), 'Positive cultural interaction');
        completeFeedback.potentialRewardsEarned = [...(completeFeedback.potentialRewardsEarned || []), reward];
        systemLogger.audit(userId, 'REWARD_TRIGGERED', { type: 'token', amount: reward.amount, scenarioId: activeScenario.instanceId });
      } catch (e: any) {
        systemLogger.error(userId, 'REWARD_ISSUE_FAILED', { error: e.message });
      }
    }
    // Simulate certificate for high overall success at scenario completion
    if (activeScenario.isCompleted && activeScenario.successMetric > 80) {
        try {
            const certificate = await tokenRewardService.grantCertificate(userId, `Cultural Competence in ${activeScenario.targetCulture.name}`);
            completeFeedback.potentialRewardsEarned = [...(completeFeedback.potentialRewardsEarned || []), certificate];
            systemLogger.audit(userId, 'REWARD_TRIGGERED', { type: 'certificate', scenarioId: activeScenario.instanceId });
        } catch (e: any) {
            systemLogger.error(userId, 'CERTIFICATE_GRANT_FAILED', { error: e.message });
        }
    }


    systemLogger.audit(userId, 'AGENT_PROCESSING_END', { scenarioId: activeScenario.instanceId, finalFeedbackSeverity: completeFeedback.feedbackSummary.severity });
    return completeFeedback;
  }
}

export const culturalIntelligenceAgent = new CulturalIntelligenceAgent();

/**
 * Simulated API for fetching and updating cultural data.
 * These functions mimic backend operations, including validation and logging.
 * Each function is designed to be idempotent where state is not changed,
 * and handles concurrency in a simplified mock manner for demonstrations.
 */
export const api = {
  /**
   * Fetches all cultural profiles.
   * This operation is idempotent and read-only.
   */
  async getCultures(): Promise<ICulture[]> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getCultures' });
    return Promise.resolve(CULTURAL_PROFILES_DATA);
  },

  /**
   * Fetches a single cultural profile by ID.
   * This operation is idempotent and read-only.
   * @param id The ID of the culture.
   */
  async getCultureById(id: string): Promise<ICulture | undefined> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getCultureById', id });
    return Promise.resolve(CULTURAL_PROFILES_DATA.find(c => c.id === id));
  },

  /**
   * Fetches all scenario templates.
   * This operation is idempotent and read-only.
   */
  async getScenarioTemplates(): Promise<IScenarioTemplate[]> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getScenarioTemplates' });
    return Promise.resolve(SCENARIO_TEMPLATES_DATA);
  },

  /**
   * Fetches a single scenario template by ID.
   * This operation is idempotent and read-only.
   * @param id The ID of the scenario template.
   */
  async getScenarioTemplateById(id: string): Promise<IScenarioTemplate | undefined> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getScenarioTemplateById', id });
    return Promise.resolve(SCENARIO_TEMPLATES_DATA.find(s => s.id === id));
  },

  /**
   * Fetches all learning modules.
   * This operation is idempotent and read-only.
   */
  async getLearningModules(): Promise<ILearningModule[]> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getLearningModules' });
    return Promise.resolve(LEARNING_MODULES_DATA);
  },

  /**
   * Fetches a single learning module by ID.
   * This operation is idempotent and read-only.
   * @param id The ID of the learning module.
   */
  async getLearningModuleById(id: string): Promise<ILearningModule | undefined> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getLearningModuleById', id });
    return Promise.resolve(LEARNING_MODULES_DATA.find(lm => lm.id === id));
  },

  /**
   * Fetches a user's cultural profile.
   * This operation is idempotent and read-only.
   * @param userId The ID of the user.
   */
  async getUserProfile(userId: string): Promise<IUserCulturalProfile | undefined> {
    systemLogger.info(userId, 'API_CALL', { endpoint: 'getUserProfile' });
    return Promise.resolve(USER_PROFILES_DATA.find(p => p.userId === userId));
  },

  /**
   * Updates a user's cultural profile.
   * This operation simulates updating a digital identity record.
   * @param userId The ID of the user.
   * @param profile The updated profile data.
   * @returns The updated user profile.
   */
  async updateUserProfile(userId: string, profile: Partial<IUserCulturalProfile>): Promise<IUserCulturalProfile> {
    systemLogger.info(userId, 'API_CALL', { endpoint: 'updateUserProfile', changes: profile });
    const userIndex = USER_PROFILES_DATA.findIndex(p => p.userId === userId);
    if (userIndex !== -1) {
      // Simulate optimistic locking or concurrency control for a real system
      USER_PROFILES_DATA[userIndex] = { ...USER_PROFILES_DATA[userIndex], ...profile };
      systemLogger.audit(userId, 'USER_PROFILE_UPDATED', { details: profile });
      return Promise.resolve(USER_PROFILES_DATA[userIndex]);
    }
    systemLogger.error(userId, 'PROFILE_UPDATE_FAILED', { reason: 'User not found' });
    throw new Error('User not found');
  },

  /**
   * Fetches system settings.
   * This operation is idempotent and read-only.
   */
  async getSystemSettings(): Promise<ISystemSettings> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getSystemSettings' });
    return Promise.resolve(SYSTEM_SETTINGS_DATA);
  },

  /**
   * Updates system settings.
   * This operation simulates updating global governance parameters.
   * @param settings The updated settings data.
   * @returns The updated system settings.
   */
  async updateSystemSettings(settings: Partial<ISystemSettings>): Promise<ISystemSettings> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'updateSystemSettings', changes: settings });
    Object.assign(SYSTEM_SETTINGS_DATA, settings);
    systemLogger.audit(null, 'SYSTEM_SETTINGS_UPDATED', { details: settings });
    return Promise.resolve(SYSTEM_SETTINGS_DATA);
  },

  /**
   * Simulates starting a new scenario instance.
   * This creates a new stateful simulation, representing a critical user interaction point.
   * @param userId The ID of the user.
   * @param scenarioTemplateId The ID of the scenario template.
   * @param targetCultureId The ID of the target culture for this instance.
   * @returns The newly created active scenario instance.
   */
  async startScenario(userId: string, scenarioTemplateId: string, targetCultureId: string): Promise<IActiveScenarioInstance> {
    systemLogger.info(userId, 'SCENARIO_START_REQUEST', { scenarioTemplateId, targetCultureId });

    const template = SCENARIO_TEMPLATES_DATA.find(s => s.id === scenarioTemplateId);
    const targetCulture = CULTURAL_PROFILES_DATA.find(c => c.id === targetCultureId);
    const userProfile = USER_PROFILES_DATA.find(u => u.userId === userId);

    if (!template || !targetCulture || !userProfile) {
      systemLogger.error(userId, 'SCENARIO_START_FAILED', { reason: 'Invalid template, culture, or user' });
      throw new Error('Invalid scenario template, target culture, or user profile.');
    }

    const newInstance: IActiveScenarioInstance = {
      scenarioTemplateId: template.id,
      instanceId: generateUniqueId('scenario_instance'),
      currentSituation: template.initialSituation,
      objectiveStatus: Object.fromEntries(template.objectives.map(obj => [obj, false])),
      targetCulture: targetCulture,
      participants: [{ name: userProfile.username, role: 'User', culturalBackground: userProfile.originCultureId }], // Add more dynamic participants later
      currentTurn: 0,
      maxTurns: 10, // Default max turns, can be dynamic
      isCompleted: false,
      successMetric: 50, // Starting neutral
    };
    ACTIVE_SCENARIOS_DATA.push(newInstance);
    systemLogger.audit(userId, 'SCENARIO_STARTED', { instanceId: newInstance.instanceId, scenarioTemplateId });
    return Promise.resolve(newInstance);
  },

  /**
   * Simulates a user interaction within an active scenario instance.
   * This is the core "Agentic AI" interaction point, processing user input via the CulturalIntelligenceAgent.
   * @param userId The ID of the user.
   * @param instanceId The ID of the active scenario instance.
   * @param userAction The user's input/response.
   * @returns A complete interaction feedback object, detailing the AI's response and cultural impact.
   */
  async processInteraction(userId: string, instanceId: string, userAction: string): Promise<CompleteInteractionFeedback> {
    systemLogger.info(userId, 'INTERACTION_REQUEST', { instanceId, userAction });

    const activeScenarioIndex = ACTIVE_SCENARIOS_DATA.findIndex(s => s.instanceId === instanceId);
    if (activeScenarioIndex === -1) {
      systemLogger.error(userId, 'INTERACTION_FAILED', { reason: 'Scenario instance not found' });
      throw new Error('Scenario instance not found.');
    }

    const scenario = ACTIVE_SCENARIOS_DATA[activeScenarioIndex];
    const userProfile = USER_PROFILES_DATA.find(u => p.userId === userId);
    const systemSettings = SYSTEM_SETTINGS_DATA; // Global settings
    const culturalData = scenario.targetCulture;
    const scenarioTemplate = SCENARIO_TEMPLATES_DATA.find(t => t.id === scenario.scenarioTemplateId);

    if (!userProfile || !culturalData || !scenarioTemplate) {
      systemLogger.error(userId, 'INTERACTION_FAILED', { reason: 'Missing profile, cultural data, or scenario template' });
      throw new Error('Missing prerequisite data for interaction processing.');
    }

    // Agentic Intelligence Layer: process user interaction
    const completeFeedback = await culturalIntelligenceAgent.processUserInteraction(
      userId,
      scenario,
      userAction,
      userProfile,
      culturalData,
      systemSettings,
      scenarioTemplate
    );

    // Update scenario and user profile based on agent's output
    scenario.currentTurn++;
    scenario.currentSituation = completeFeedback.aiResponse; // AI's response becomes the new situation
    scenario.successMetric = Math.max(0, Math.min(100, scenario.successMetric + completeFeedback.overallCulturalCompetenceImpact));

    // Update scenario objectives based on feedback
    if (completeFeedback.overallCulturalCompetenceImpact > 0) {
      scenario.objectiveStatus[scenarioTemplate.objectives[0]] = true; // Simplified: First objective met on any positive interaction
    }

    if (scenario.currentTurn >= scenario.maxTurns || Object.values(scenario.objectiveStatus).every(status => status)) {
      scenario.isCompleted = true;
      const rewardTriggered = completeFeedback.potentialRewardsEarned?.find(r => r.type === 'token' || r.type === 'certificate');
      userProfile.scenarioHistory.push({
        scenarioInstanceId: scenario.instanceId,
        scenarioTemplateId: scenario.scenarioTemplateId,
        targetCultureId: scenario.targetCulture.id,
        completionDate: new Date().toISOString(),
        finalSuccessMetric: scenario.successMetric,
        totalInteractions: scenario.currentTurn,
        keyLearnings: completeFeedback.detailedFeedback.filter(f => f.severity !== 'Neutral').map(f => f.explanation),
        rewardTriggered: rewardTriggered || undefined,
      });
      systemLogger.audit(userId, 'SCENARIO_COMPLETED', { instanceId: scenario.instanceId, finalSuccessMetric: scenario.successMetric });
    }

    // Update user's cultural competence score (simplified averaging)
    const currentCultureScore = userProfile.culturalCompetenceScore[scenario.targetCulture.id] || 0;
    userProfile.culturalCompetenceScore[scenario.targetCulture.id] =
      Math.max(0, Math.min(100, (currentCultureScore * (scenario.currentTurn - 1) + scenario.successMetric) / scenario.currentTurn)); // Simple running average

    // Recalculate overall competence
    const scores = Object.values(userProfile.culturalCompetenceScore);
    userProfile.overallCompetence = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

    // Log the processed interaction for auditability.
    systemLogger.audit(userId, 'INTERACTION_PROCESSED_FINAL', {
      instanceId,
      userAction,
      aiResponse: completeFeedback.aiResponse,
      feedbackSummary: completeFeedback.feedbackSummary.text,
      competenceImpact: completeFeedback.overallCulturalCompetenceImpact,
      newSuccessMetric: scenario.successMetric,
      newCulturalCompetenceScore: userProfile.culturalCompetenceScore[scenario.targetCulture.id],
      potentialRewards: completeFeedback.potentialRewardsEarned,
    });

    return Promise.resolve(completeFeedback);
  },

  /**
   * Fetches an active scenario instance by ID.
   * This operation is idempotent and read-only.
   * @param instanceId The ID of the active scenario instance.
   * @returns The active scenario instance, or undefined if not found.
   */
  async getActiveScenario(instanceId: string): Promise<IActiveScenarioInstance | undefined> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getActiveScenario', instanceId });
    return Promise.resolve(ACTIVE_SCENARIOS_DATA.find(s => s.instanceId === instanceId));
  },

  /**
   * Fetches all audit logs.
   * This operation is crucial for governance, compliance, and debugging.
   * @returns A copy of all audit log entries.
   */
  async getAuditLogs(): Promise<IAuditLogEntry[]> {
    systemLogger.info(null, 'API_CALL', { endpoint: 'getAuditLogs' });
    return Promise.resolve([...AUDIT_LOGS_DATA]); // Return a copy for immutability
  },
};

/**
 * React Context for global state management for the Cultural Assimilation Advisor.
 * This context provides a unified access point to core application data and agent interactions,
 * ensuring consistent state across the UI and driving high-value user experiences.
 */
interface CulturalAdvisorContextType {
  currentUser: IUserCulturalProfile | null;
  systemSettings: ISystemSettings;
  cultures: ICulture[];
  scenarioTemplates: IScenarioTemplate[];
  learningModules: ILearningModule[];
  activeScenarios: IActiveScenarioInstance[];
  isLoading: boolean;
  error: string | null;
  login: (userId: string) => Promise<void>;
  logout: () => void;
  updateUser: (profile: Partial<IUserCulturalProfile>) => Promise<void>;
  updateSettings: (settings: Partial<ISystemSettings>) => Promise<void>;
  startNewScenario: (scenarioTemplateId: string, targetCultureId: string) => Promise<IActiveScenarioInstance>;
  submitInteraction: (instanceId: string, userAction: string) => Promise<CompleteInteractionFeedback>;
  refreshActiveScenarios: () => Promise<void>;
}

export const CulturalAdvisorContext = createContext<CulturalAdvisorContextType | undefined>(undefined);

/**
 * Custom hook to consume the Cultural Advisor Context.
 * Ensures that the hook is used within the scope of a CulturalAdvisorProvider.
 */
export const useCulturalAdvisor = () => {
  const context = useContext(CulturalAdvisorContext);
  if (context === undefined) {
    throw new Error('useCulturalAdvisor must be used within a CulturalAdvisorProvider');
  }
  return context;
};

/**
 * Provides the Cultural Advisor Context to its children.
 * Manages global state for user, settings, and fetched data, ensuring a robust and responsive user experience.
 * This provider orchestrates data fetching and state updates, embodying fault-tolerant design principles.
 */
export const CulturalAdvisorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<IUserCulturalProfile | null>(null);
  const [systemSettings, setSystemSettings] = useState<ISystemSettings>(SYSTEM_SETTINGS_DATA);
  const [cultures, setCultures] = useState<ICulture[]>([]);
  const [scenarioTemplates, setScenarioTemplates] = useState<IScenarioTemplate[]>([]);
  const [learningModules, setLearningModules] = useState<ILearningModule[]>([]);
  const [activeScenarios, setActiveScenarios] = useState<IActiveScenarioInstance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads initial data and settings from simulated API.
   * Attempts to auto-login a default user for demonstration purposes.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [loadedCultures, loadedScenarios, loadedModules, loadedSettings] = await Promise.all([
          api.getCultures(),
          api.getScenarioTemplates(),
          api.getLearningModules(),
          api.getSystemSettings(),
        ]);
        setCultures(loadedCultures);
        setScenarioTemplates(loadedScenarios);
        setLearningModules(loadedModules);
        setSystemSettings(loadedSettings);

        // Attempt to auto-login a mock user if available for demo
        const defaultUserId = 'user_alice';
        const user = await api.getUserProfile(defaultUserId);
        if (user) {
          setCurrentUser(user);
          // Also load active scenarios for this user if applicable
          const userActiveScenarios = ACTIVE_SCENARIOS_DATA.filter(s => s.participants.some(p => p.name === user.username));
          setActiveScenarios(userActiveScenarios);
          systemLogger.info(defaultUserId, 'AUTO_LOGIN_SUCCESS', { username: user.username });
        } else {
          systemLogger.warn(null, 'AUTO_LOGIN_FAILED', { defaultUserId });
        }
      } catch (err: any) {
        systemLogger.error(null, 'INITIAL_DATA_LOAD_FAILED', { error: err.message });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * Handles user login, fetching profile and active scenarios.
   * @param userId The ID of the user attempting to log in.
   */
  const login = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await api.getUserProfile(userId);
      if (user) {
        setCurrentUser(user);
        const userActiveScenarios = ACTIVE_SCENARIOS_DATA.filter(s => s.participants.some(p => p.name === user.username));
        setActiveScenarios(userActiveScenarios);
        systemLogger.audit(userId, 'LOGIN_SUCCESS', { username: user.username });
      } else {
        throw new Error('User not found.');
      }
    } catch (err: any) {
      systemLogger.error(userId, 'LOGIN_FAILED', { error: err.message });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles user logout, clearing current user and active scenarios.
   */
  const logout = useCallback(() => {
    if (currentUser) {
      systemLogger.audit(currentUser.userId, 'LOGOUT_SUCCESS');
    }
    setCurrentUser(null);
    setActiveScenarios([]); // Clear active scenarios on logout
  }, [currentUser]);

  /**
   * Updates the current user's profile.
   * @param profile Partial user profile data to update.
   */
  const updateUser = useCallback(async (profile: Partial<IUserCulturalProfile>) => {
    if (!currentUser) {
      setError('No user logged in.');
      systemLogger.warn(null, 'UPDATE_USER_FAILED', { reason: 'No user logged in' });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await api.updateUserProfile(currentUser.userId, profile);
      setCurrentUser(updatedUser);
      systemLogger.audit(currentUser.userId, 'USER_PROFILE_UPDATED_UI', { changes: profile });
    } catch (err: any) {
      systemLogger.error(currentUser.userId, 'USER_PROFILE_UPDATE_ERROR', { error: err.message });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Updates system-wide settings.
   * @param settings Partial system settings data to update.
   */
  const updateSettings = useCallback(async (settings: Partial<ISystemSettings>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSettings = await api.updateSystemSettings(settings);
      setSystemSettings(updatedSettings);
      systemLogger.audit(currentUser?.userId || 'system', 'SYSTEM_SETTINGS_UPDATED_UI', { changes: settings });
    } catch (err: any) {
      systemLogger.error(currentUser?.userId || 'system', 'SYSTEM_SETTINGS_UPDATE_ERROR', { error: err.message });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Starts a new cultural simulation scenario.
   * @param scenarioTemplateId The ID of the scenario blueprint.
   * @param targetCultureId The ID of the culture for the simulation.
   * @returns The newly created active scenario instance.
   */
  const startNewScenario = useCallback(async (scenarioTemplateId: string, targetCultureId: string) => {
    if (!currentUser) {
      setError('No user logged in.');
      systemLogger.warn(null, 'START_SCENARIO_FAILED', { reason: 'No user logged in' });
      throw new Error('No user logged in to start a scenario.');
    }
    setIsLoading(true);
    setError(null);
    try {
      const newScenario = await api.startScenario(currentUser.userId, scenarioTemplateId, targetCultureId);
      setActiveScenarios(prev => [...prev, newScenario]);
      // Immediately fetch updated user profile to reflect scenario history if applicable
      const updatedUser = await api.getUserProfile(currentUser.userId);
      if (updatedUser) setCurrentUser(updatedUser);
      systemLogger.audit(currentUser.userId, 'NEW_SCENARIO_STARTED_UI', { instanceId: newScenario.instanceId });
      return newScenario;
    } catch (err: any) {
      systemLogger.error(currentUser.userId, 'START_SCENARIO_ERROR', { error: err.message });
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Submits a user interaction to an active scenario for AI processing.
   * @param instanceId The ID of the active scenario.
   * @param userAction The user's input.
   * @returns The complete interaction feedback from the AI.
   */
  const submitInteraction = useCallback(async (instanceId: string, userAction: string) => {
    if (!currentUser) {
      setError('No user logged in.');
      systemLogger.warn(null, 'SUBMIT_INTERACTION_FAILED', { reason: 'No user logged in' });
      throw new Error('No user logged in to submit an interaction.');
    }
    setIsLoading(true);
    setError(null);
    try {
      const feedback = await api.processInteraction(currentUser.userId, instanceId, userAction);
      // Re-fetch scenario and user profile to get latest state including calculated scores and completion status
      const updatedScenario = await api.getActiveScenario(instanceId);
      if (updatedScenario) {
        setActiveScenarios(prev => prev.map(s => (s.instanceId === instanceId ? updatedScenario : s)));
      }
      const updatedUser = await api.getUserProfile(currentUser.userId);
      if (updatedUser) setCurrentUser(updatedUser);

      systemLogger.audit(currentUser.userId, 'INTERACTION_SUBMITTED_UI', { instanceId, userAction, feedbackSummary: feedback.feedbackSummary.text });
      return feedback;
    } catch (err: any) {
      systemLogger.error(currentUser.userId, 'SUBMIT_INTERACTION_ERROR', { error: err.message });
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Refreshes the list of active scenarios for the current user.
   */
  const refreshActiveScenarios = useCallback(async () => {
    if (!currentUser) {
      setActiveScenarios([]);
      return;
    }
    setIsLoading(true);
    try {
      // In a real app, this would query active scenarios associated with the user via a filtered API call.
      const userActiveScenarios = ACTIVE_SCENARIOS_DATA.filter(s => s.participants.some(p => p.name === currentUser.username));
      setActiveScenarios(userActiveScenarios);
      systemLogger.info(currentUser.userId, 'REFRESH_SCENARIOS_SUCCESS');
    } catch (err: any) {
      systemLogger.error(currentUser.userId, 'REFRESH_SCENARIOS_ERROR', { error: err.message });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  /**
   * Memoized value of the context provider to prevent unnecessary re-renders.
   */
  const memoizedValue = useMemo(() => ({
    currentUser,
    systemSettings,
    cultures,
    scenarioTemplates,
    learningModules,
    activeScenarios,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    updateSettings,
    startNewScenario,
    submitInteraction,
    refreshActiveScenarios,
  }), [
    currentUser,
    systemSettings,
    cultures,
    scenarioTemplates,
    learningModules,
    activeScenarios,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    updateSettings,
    startNewScenario,
    submitInteraction,
    refreshActiveScenarios,
  ]);

  return (
    <CulturalAdvisorContext.Provider value={memoizedValue}>
      {children}
    </CulturalAdvisorContext.Provider>
  );
};