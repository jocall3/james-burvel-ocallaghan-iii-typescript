"""This module establishes the foundational data models, core services, and a dynamic view for a revolutionary Linguistic Fossil Finder platform. Business impact: It transforms the laborious and often fragmented field of comparative linguistics into an agile, AI-powered enterprise solution. By integrating intelligent agents, digital identity, and programmable value rails, it enables real-time proto-word reconstruction, automated sound law discovery, and cryptographically auditable research collaboration. This drives new, monetized research ecosystems through verifiable data contributions, intellectual property protection, and a global marketplace for linguistic expertise, positioning the platform as a cornerstone for data-driven humanities and a significant revenue generator through licensing and research acceleration."""
import React, { useState, useEffect, useCallback, createContext, useContext, useReducer } from 'react';

# --- Global Data Types and Interfaces (Highly Expanded) ---

/**
 * Represents a specific sound or phoneme within a language's phonological inventory.
 * Business value: Provides granular, machine-readable data on sound systems, critical for automated
 * phonetic comparison, sound law discovery, and high-fidelity proto-language reconstruction.
 * This precision is essential for academic rigor and for training advanced linguistic AI models.
 */
export interface Phoneme {
  symbol: string; // IPA symbol, e.g., 'p', 'b', 'm', 'ã'
  features: {
    manner: 'stop' | 'fricative' | 'affricate' | 'nasal' | 'trill' | 'tap' | 'approximant' | 'vowel';
    place: 'bilabial' | 'labiodental' | 'dental' | 'alveolar' | 'postalveolar' | 'retroflex' | 'palatal' | 'velar' | 'uvular' | 'pharyngeal' | 'glottal';
    voicing: 'voiceless' | 'voiced';
    rounded?: boolean; // For vowels
    height?: 'close' | 'near-close' | 'mid' | 'near-open' | 'open' | 'diphthong'; // For vowels
    backness?: 'front' | 'central' | 'back'; // For vowels
    nasality?: 'oral' | 'nasal';
    laterality?: 'central' | 'lateral';
    ejective?: boolean;
    implosive?: boolean;
    click?: boolean;
    length?: 'short' | 'long';
    stress?: 'primary' | 'secondary' | 'unstressed';
    affrication?: 'none' | 'slight' | 'strong';
    aspiration?: 'none' | 'aspirated';
  };
  allophones?: string[]; // Variations of the phoneme
  notes?: string;
}

/**
 * Represents a specific sound correspondence rule between a proto-language and a descendant language.
 * Business value: Encapsulates the core transformation logic of linguistic evolution, enabling
 * predictive modeling of sound changes and validating historical linguistic hypotheses. This
 * forms a programmable rule engine for automated reconstruction and error detection in etymological data.
 */
export interface SoundCorrespondenceRule {
  id: string;
  protoSound: string; // Proto-phoneme symbol or pattern (e.g., '*p', '*T', '*A')
  descendantSound: string; // Descendant phoneme symbol or pattern (e.g., 'f', 't', 'a')
  context: string; // Phonological context (e.g., '/_V' for before a vowel, '#_' for word-initial, '_#' for word-final)
  environment: 'all' | 'initial' | 'medial' | 'final'; // Position in word
  languageId: string; // The ID of the descendant language
  appliesTo: 'consonant' | 'vowel' | 'any';
  examples: { protoWord: string, descendantWord: string }[];
  confidence: number; // How strong is the evidence for this rule (0.0 to 1.0)
  notes?: string;
  source?: string; // e.g., 'Grimm's Law', 'Verner's Law'
  priority?: number; // For rule ordering (lower number = higher priority), critical for deterministic application
  dateEstablished?: string; // When the rule was formulated or confirmed
  proposedBy?: string; // Identity ID of proposer
}

/**
 * Represents a morpheme (minimal meaningful unit).
 * Business value: Facilitates granular analysis of word structure, enabling more precise
 * etymological tracing and the development of morphology-aware linguistic agents.
 * This deep structural understanding enhances the accuracy of linguistic reconstructions.
 */
export interface Morpheme {
  id: string;
  form: string; // The phonetic form
  meaning: string;
  type: 'root' | 'prefix' | 'suffix' | 'infix' | 'clitic' | 'stem' | 'lexeme';
  gloss: string; // Standard linguistic gloss (e.g., '1SG.NOM')
  allomorphs?: string[]; // Variations of the morpheme
  notes?: string;
  languageId?: string; // Which language this morpheme belongs to, if specific
  protoMorphemeId?: string; // Link to a reconstructed proto-morpheme
  semanticFields?: string[];
}

/**
 * Represents a lexical entry in a language's lexicon.
 * Business value: Serves as the fundamental unit of attested language data, enabling
 * systematic collection, comparison, and analysis of words across languages.
 * This rich dataset is the raw material for all reconstructive and comparative linguistic tasks,
 * directly fueling the platform's core value proposition.
 */
export interface LexicalEntry {
  id: string;
  word: string; // The word form
  languageId: string;
  ipa: string; // IPA transcription
  meaning: string;
  etymology?: {
    protoWordId?: string; // Link to a proto-word reconstruction
    sourceLanguageId?: string; // For loanwords, the language it was borrowed from
    notes?: string;
    dateOfBorrowing?: string; // Approximate date for loanwords
  };
  morphemeBreakdown?: Morpheme[]; // Analysis into morphemes (e.g., [root, suffix])
  cognateIds?: string[]; // IDs of cognates in other languages (links to LexicalEntry.id)
  semanticFields?: string[]; // e.g., 'body parts', 'nature', 'kinship', 'abstract concepts'
  dateAdded: string; // ISO date string when entry was added to database
  lastUpdated: string; // ISO date string when entry was last modified
  variants?: { form: string, notes?: string }[]; // Alternative forms
  usageExamples?: string[]; // Example sentences
  grammarNotes?: string; // E.g., gender, conjugation pattern, declension class
  dialectalVariants?: { dialect: string, word: string, ipa?: string, meaning?: string }[];
  register?: 'formal' | 'informal' | 'archaic' | 'neologism';
  status?: 'attested' | 'reconstructed' | 'hypothesized'; // For reconstructed forms within a language
  historicalForms?: { period: string, form: string, ipa?: string }[]; // e.g., Old English, Middle English forms
}

/**
 * Represents a language, either attested or reconstructed.
 * Business value: Provides comprehensive metadata for each language, enabling
 * sophisticated filtering, relationship mapping, and contextual analysis. This structured
 * representation of linguistic diversity is crucial for accurate comparative work and
 * for understanding the complex tapestry of human language history.
 */
export interface Language {
  id: string;
  name: string;
  isoCode: string; // ISO 639-3 code (or 'proto' for reconstructed languages)
  family: string; // E.g., 'Indo-European', 'Uralic', 'Proto-Language'
  subfamily?: string; // E.g., 'Germanic', 'Romance'
  branch?: string; // E.g., 'West Germanic', 'Italic'
  location?: { latitude: number, longitude: number, region?: string }; // Geographic center and region
  status?: 'extinct' | 'endangered' | 'vibrant' | 'reconstructed';
  description?: string;
  phonology?: {
    consonants: Phoneme[];
    vowels: Phoneme[];
    diphthongs?: Phoneme[];
    suprasegmentals?: { stress: string, tone: string | null };
  };
  orthography?: {
    script: string;
    notes?: string;
    historicalScripts?: { name: string, period: string }[];
  };
  estimatedDivergenceDate?: string; // ISO date string or year (e.g., '2000 BCE')
  linguisticFeatures?: string[]; // E.g., 'SOV word order', 'case system', 'vowel harmony'
  sources?: { type: 'dictionary' | 'grammar' | 'academic_paper' | 'corpus', title: string, url?: string, author?: string, year?: number }[];
  relatedLanguages?: { languageId: string, relationship: 'sister' | 'daughter' | 'parent' | 'contact' }[];
  historicalPeriods?: { name: string, start: string, end: string }[];
}

/**
 * A lighter version of a reconstruction for display in lists.
 * Business value: Optimizes performance for UI rendering by providing essential reconstruction data
 * without loading the full, extensive details, ensuring a responsive and scalable user experience.
 */
export interface ReconstructionLite {
  protoWord: string; // The primary proto-word form
  meaning: string;
  confidence: number;
  descendantEvidence: { language: string, word: string }[];
}

/**
 * Represents a reconstructed proto-word or proto-morpheme.
 * Business value: This is the core output of the Linguistic Fossil Finder, representing new
 * scientific knowledge generated by the platform. Its structured, verifiable nature enhances
 * academic credibility and provides a valuable asset for data licensing and further AI analysis.
 */
export interface Reconstruction extends ReconstructionLite {
  id: string; // Unique ID for the reconstruction
  protoLanguageId: string; // E.g., 'PIE' for Proto-Indo-European
  meaning: string;
  ipa: string; // Full IPA transcription of the proto-word
  confidence: number; // Confidence score (0.0 to 1.0)
  descendantEvidence: {
    languageId: string, // ID of the descendant language
    language: string, // Name of the descendant language (for display convenience)
    word: string, // The descendant word form
    ipa: string, // IPA of the descendant word
    relation: 'cognate' | 'loanword' | 'unrelated';
    soundCorrespondences: { protoSound: string, descendantSound: string, context?: string }[]; // Specific sound shifts for this word
    notes?: string;
    lexicalEntryId?: string; // Link to the actual lexical entry
  }[];
  notes?: string;
  etymologicalNotes?: string; // Detailed etymological reasoning
  proposedBy?: string; // Identity ID of scholar or system that proposed it
  dateProposed?: string; // ISO date or year
  lastUpdated?: string; // ISO date when last modified
  alternativeReconstructions?: { protoWord: string, confidence: number, notes?: string }[];
  semanticField: string;
  reconstructionMethod?: 'comparative' | 'internal' | 'computational';
  status?: 'established' | 'controversial' | 'tentative';
  reconstructionHistory?: { date: string, event: string, user?: string }[]; // Log of changes/updates
}

/**
 * Represents a project or workspace for a user or team.
 * Business value: Organizes research efforts, fosters collaboration, and provides a framework
 * for managing linguistic data and tasks. This directly translates to increased research
 * efficiency and simplified project governance within the platform.
 */
export interface UserProject {
  id: string;
  name: string;
  description: string;
  ownerId: string; // Digital Identity ID
  createdAt: string;
  lastModified: string;
  reconstructions: string[]; // IDs of reconstructions saved in this project
  savedCognateSets: string[]; // IDs of cognate sets saved
  customRules: string[]; // IDs of custom sound correspondence rules
  collaborators?: string[]; // User IDs of collaborators
  visibility?: 'private' | 'public' | 'shared';
  tags?: string[];
  governancePolicyId?: string; // Link to a governance policy applied to this project
}

/**
 * Represents a set of cognates across languages for a single concept.
 * Business value: Groups related lexical entries, serving as the primary input for
 * proto-word reconstruction tasks. Curated cognate sets are high-value data assets,
 * accelerating scientific discovery and enabling targeted AI analysis.
 */
export interface CognateSet {
  id: string;
  concept: string; // The semantic concept (e.g., 'water')
  protoReconstructionId?: string; // Optional link to a reconstruction (if one exists for this set)
  members: {
    languageId: string;
    lexicalEntryId: string; // Link to the specific lexical entry
    wordForm: string;
    ipa: string;
    notes?: string;
  }[];
  analysisNotes?: string;
  confidenceScore: number; // Confidence that these are true cognates
  proposedBy?: string; // Identity ID of proposer
  createdAt: string;
  lastUpdated?: string;
  tags?: string[];
  semanticField?: string;
  visualizedTree?: any; // Placeholder for a tree visualization object
}

/**
 * User settings/preferences for the application.
 * Business value: Enhances user experience and personalization, leading to higher adoption
 * and satisfaction. Configurable preferences allow the platform to adapt to diverse
 * research methodologies and user needs.
 */
export interface UserSettings {
  theme: 'dark' | 'light';
  defaultProtoLanguage: string; // e.g., 'pie'
  displayIPA: boolean;
  enableAdvancedFeatures: boolean;
  preferredLexiconDisplay: 'table' | 'cards';
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
  automaticallySaveProjects: boolean;
  defaultOutputFormat: 'text' | 'json' | 'markdown';
  showConfidenceScores: boolean;
}

# --- New Interfaces for Agentic AI, Identity, and Token Rails Integration ---

/**
 * Represents a minimal digital identity within the linguistic ecosystem.
 * Business value: Establishes verifiable attribution for scholarly contributions and agent actions,
 * preventing fraud and enabling secure, auditable collaboration. This underpins trust and intellectual property in a global research network,
 * a critical component of a multi-million-dollar financial infrastructure.
 */
export interface DigitalIdentity {
  id: string; // Unique identifier (e.g., UUID, public key hash)
  name: string; // Human-readable name
  publicKey: string; // Public key for cryptographic operations
  privateKey: string; // Private key for signing (SIMULATED for internal use, never exposed in real system)
  roles: ('researcher' | 'editor' | 'agent' | 'admin' | 'guest' | 'governor')[];
  organization?: string;
  reputationScore?: number; // Based on validated contributions, for agentic decision making.
  lastActive?: string; // ISO timestamp
}

/**
 * Represents a skill that an Agentic AI or human expert can possess and apply in linguistic analysis.
 * Business value: Modularizes complex linguistic tasks, making agents highly configurable, reusable, and scalable.
 * This allows for rapid deployment of specialized AI agents to tackle specific research challenges,
 * dramatically increasing research throughput and precision, thereby accelerating high-value research outcomes.
 */
export interface LinguisticSkill {
  id: string;
  name: string; // e.g., 'ProtoWordReconstruction', 'SoundLawDetection', 'CognateIdentification', 'DataValidation', 'Remediation'
  description: string;
  costEstimatePerUse?: { tokenType: string, amount: number }; // Cost to invoke this skill, linked to token rails
  requiredPermissions: ('agent' | 'researcher' | 'admin' | 'governor')[];
  outputSchema?: any; // JSON schema for expected output
  inputSchema?: any; // JSON schema for expected input
  performanceMetrics?: { latency: number, accuracy: number }; // Simulated performance metrics
}

/**
 * Status of a linguistic task.
 * Business value: Provides clear visibility into the research pipeline, allowing for real-time
 * tracking of progress, identification of bottlenecks, and efficient resource allocation.
 * This transparency is vital for project management and financial reporting on research expenditures.
 */
export enum LinguisticTaskStatus {
  Pending = 'pending',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Review = 'review',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  Remediated = 'remediated', // New status for tasks undergoing remediation
}

/**
 * Represents a discrete linguistic task that can be assigned and tracked.
 * Business value: Enables the decomposition of large research problems into manageable, trackable units.
 * This facilitates parallel processing by multiple agents or researchers, accelerates project completion,
 * and provides clear milestones for funding and collaboration, leading to faster research breakthroughs
 * and more efficient use of computational and human capital.
 */
export interface LinguisticTask {
  id: string;
  projectId: string; // Project to which this task belongs
  type: LinguisticSkill['id']; // Corresponds to a specific linguistic skill
  description: string;
  status: LinguisticTaskStatus;
  assignedToIdentityId?: string; // ID of the agent or human identity assigned
  parameters: any; // Input parameters for the task (e.g., { cognateSetId: '...', protoLanguage: '...' })
  output?: any; // Result of the task
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[]; // Other task IDs this task depends on
  audits?: LinguisticAuditLogEntry[]; // In-task audit trail
  riskScore?: number; // Calculated risk for failure or non-compliance
}

/**
 * Represents a verifiable contribution made by an identity (human or agent) to the linguistic dataset.
 * Business value: Provides granular, cryptographically-attested provenance for every data modification,
 * enhancing data integrity, enabling precise intellectual property tracking, and building a trusted
 * data commons for linguistic science. This protects against data tampering and establishes undeniable
 * proof of contribution, a fundamental element in high-value data marketplaces.
 */
export interface LinguisticContribution {
  id: string;
  identityId: string; // Who made the contribution
  dataType: 'reconstruction' | 'lexicalEntry' | 'rule' | 'cognateSet' | 'language' | 'project' | 'identity' | 'task';
  dataId: string; // ID of the data item being contributed/modified
  action: 'create' | 'update' | 'delete' | 'review' | 'propose' | 'assign' | 'fund' | 'claim';
  timestamp: string;
  details: any; // e.g., diff for updates, full object for create
  signature: string; // Cryptographic signature by the identity
  previousContributionHash?: string; // For tamper-evident chaining of contributions
}

/**
 * Represents a bounty or reward for completing a specific linguistic task, linked to token rails.
 * Business value: Monetizes linguistic research and incentivizes rapid, high-quality contributions from a global
 * network of experts and AI agents. This creates a liquid marketplace for linguistic problem-solving,
 * driving innovation and attracting top talent/computational resources, directly creating new revenue streams.
 */
export interface LinguisticBounty {
  id: string;
  taskId: string;
  amount: number;
  tokenType: string; // e.g., 'LINGUIST_COIN', 'USD_STABLE'
  status: 'funded' | 'claimed' | 'disputed' | 'cancelled';
  fundedBy: string; // Identity ID of the funder
  claimedBy?: string; // Identity ID of the claimant
  fundedAt: string;
  claimedAt?: string;
  payoutTransactionId?: string; // Link to a transaction on the token rail
  proofOfCompletion?: string; // Hash or reference to validated task output
}

/**
 * Defines a governance policy that can be applied to projects, tasks, or data types.
 * Business value: Establishes clear, enforceable rules for data quality, access, and agent behavior,
 * ensuring regulatory compliance and maintaining the integrity and trustworthiness of the platform.
 * This proactive governance minimizes risk and maximizes long-term value.
 */
export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  rules: {
    target: 'reconstruction' | 'lexicalEntry' | 'task' | 'agent_action' | 'access';
    condition: string; // e.g., 'reconstruction.confidence < 0.7', 'lexicalEntry.languageId == "pie" && lexicalEntry.status == "attested"'
    action: 'flag' | 'block' | 'require_review' | 'notify_admin' | 'auto_remediate';
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  enforcedBy?: string; // Identity ID of the enforcing agent/entity
}

/**
 * Represents an entry in a secure, tamper-evident audit log for linguistic data.
 * Business value: Provides an immutable, cryptographically verifiable record of all system activities and data changes,
 * critical for regulatory compliance, forensic analysis, and maintaining user trust. It enables full transparency
 * and traceability, ensuring accountability and system integrity, a non-negotiable feature for enterprise financial systems.
 */
export interface LinguisticAuditLogEntry {
  id: string;
  timestamp: string;
  actorIdentityId: string; // The identity (human or agent) performing the action
  action: string; // e.g., 'CREATE_RECONSTRUCTION', 'UPDATE_LEXICAL_ENTRY', 'AGENT_INITIATED_TASK'
  resourceType: string; // e.g., 'Reconstruction', 'LinguisticTask', 'CognateSet', 'GovernancePolicy'
  resourceId: string; // ID of the resource affected
  details: string; // Human-readable description
  payloadHash: string; // Hash of the data payload at the time of the action (for tamper evidence)
  transactionId?: string; // Optional: Link to a token rail transaction ID if applicable
  previousEntryHash?: string; // For chaining audit log entries
  policyViolation?: { policyId: string, ruleIndex: number, reason: string }[]; // Details if a policy was violated
}

# --- Helper Utilities (exported for broader use if needed) ---

/**
 * Generates a unique identifier.
 * Business value: Ensures data integrity and unambiguous referencing across distributed systems.
 * Supports scalability by providing reliable unique keys for all entities in a high-volume, enterprise environment.
 */
export const generateUniqueId = (): string => `lfu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Simulates data hashing for tamper-evident logging.
 * Business value: Creates an immutable, verifiable chain of events,
 * essential for regulatory compliance, forensic analysis, and ensuring data history cannot be altered.
 * This cryptographic integrity is paramount for trust in a financial-grade data platform.
 */
export const hashData = (data: string): string => {
  let hash = 0;
  if (data.length === 0) return '0';
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

/**
 * Simulates cryptographic signing of data using a private key.
 * Business value: Enables secure, verifiable attribution for all data contributions and actions.
 * Crucial for digital identity, non-repudiation, and audit trails in a high-value data environment,
 * preventing unauthorized actions and ensuring legal compliance.
 */
export const signData = (data: string, privateKey: string): string => {
  const dataHash = hashData(data);
  // In a real system, this would be a proper cryptographic signature.
  // Here, we simulate by combining hash and a truncated private key.
  return `${dataHash}_SIG_BY_${hashData(privateKey).substring(0, 8)}...`;
};

/**
 * Simulates cryptographic signature verification using a public key.
 * Business value: Ensures the authenticity and integrity of data contributions,
 * protecting against unauthorized modifications and fraudulent claims.
 * A cornerstone of trust and security for the entire platform, vital for financial transactions and data integrity.
 */
export const verifySignature = (data: string, signature: string, publicKey: string): boolean => {
  const dataHash = hashData(data);
  // Simplified check: signature must start with the data hash and contain a trace of the public key's hash
  return signature.startsWith(dataHash) && signature.includes(`SIG_BY_${hashData(publicKey).substring(0, 8)}...`);
};

# --- Dummy Data (Extremely Large for Simulation) ---
# This section will be massive to simulate a real database.

export const DUMMY_LANGUAGES: Language[] = [
  {
    id: 'hittite',
    name: 'Hittite',
    isoCode: 'hit',
    family: 'Indo-European',
    subfamily: 'Anatolian',
    branch: 'Hittite',
    location: { latitude: 39.0, longitude: 34.0, region: 'Anatolia' },
    status: 'extinct',
    description: 'An extinct Indo-European language that was spoken by the Hittites, a people of ancient Anatolia.',
    phonology: {
      consonants: [
        { symbol: 'p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless', aspiration: 'none' } },
        { symbol: 't', features: { manner: 'stop', place: 'alveolar', voicing: 'voiceless', aspiration: 'none' } },
        { symbol: 'k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless', aspiration: 'none' } },
        { symbol: 'b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced', aspiration: 'none' } },
        { symbol: 'd', features: { manner: 'stop', place: 'alveolar', voicing: 'voiced', aspiration: 'none' } },
        { symbol: 'g', features: { manner: 'stop', place: 'velar', voicing: 'voiced', aspiration: 'none' } },
        { symbol: 's', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } },
        { symbol: 'z', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'm', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 'n', features: { manner: 'nasal', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } },
        { symbol: 'r', features: { manner: 'trill', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'w', features: { manner: 'approximant', place: 'labiodental', voicing: 'voiced' } },
        { symbol: 'j', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
        { symbol: 'ḫ', features: { manner: 'fricative', place: 'uvular', voicing: 'voiceless' } }, // velar/uvular fricative
      ],
      vowels: [
        { symbol: 'a', features: { manner: 'vowel', height: 'open', backness: 'front', voicing: 'voiced', rounded: false } },
        { symbol: 'i', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', rounded: false } },
        { symbol: 'u', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', rounded: true } },
        { symbol: 'e', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', rounded: false } },
      ]
    },
    orthography: { script: 'Anatolian Cuneiform', notes: 'Adopted from Mesopotamian cuneiform.' },
    estimatedDivergenceDate: '2000 BCE',
    linguisticFeatures: ['lack of grammatical gender', 'agglutinative tendencies', 'ergative-absolutive alignment'],
    sources: [{ type: 'grammar', title: 'A Grammar of Hittite', author: 'Hoffner, Harry A.', year: 2008 }],
    relatedLanguages: [{ languageId: 'luwian', relationship: 'sister' }],
  },
  {
    id: 'sanskrit',
    name: 'Sanskrit',
    isoCode: 'san',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Indic',
    location: { latitude: 25.0, longitude: 80.0, region: 'South Asia' },
    status: 'extinct', // Classical Sanskrit, modern forms exist but not the same
    description: 'An ancient Indo-Aryan language that is the sacred language of Hinduism, the language of classical Hindu philosophy, and of historical texts.',
    phonology: {
      consonants: [
        { symbol: 'p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless', aspiration: 'none' } }, { symbol: 'ph', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless', aspiration: 'aspirated' } },
        { symbol: 'b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced', aspiration: 'none' } }, { symbol: 'bh', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced', aspiration: 'aspirated' } },
        { symbol: 't', features: { manner: 'stop', place: 'dental', voicing: 'voiceless', aspiration: 'none' } }, { symbol: 'th', features: { manner: 'stop', place: 'dental', voicing: 'voiceless', aspiration: 'aspirated' } },
        { symbol: 'd', features: { manner: 'stop', place: 'dental', voicing: 'voiced', aspiration: 'none' } }, { symbol: 'dh', features: { manner: 'stop', place: 'dental', voicing: 'voiced', aspiration: 'aspirated' } },
        { symbol: 'ṭ', features: { manner: 'stop', place: 'retroflex', voicing: 'voiceless', aspiration: 'none' } }, { symbol: 'ṭh', features: { manner: 'stop', place: 'retroflex', voicing: 'voiceless', aspiration: 'aspirated' } },
        { symbol: 'ḍ', features: { manner: 'stop', place: 'retroflex', voicing: 'voiced', aspiration: 'none' } }, { symbol: 'ḍh', features: { manner: 'stop', place: 'retroflex', voicing: 'voiced', aspiration: 'aspirated' } },
        { symbol: 'k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless', aspiration: 'none' } }, { symbol: 'kh', features: { manner: 'stop', place: 'velar', voicing: 'voiceless', aspiration: 'aspirated' } },
        { symbol: 'g', features: { manner: 'stop', place: 'velar', voicing: 'voiced', aspiration: 'none' } }, { symbol: 'gh', features: { manner: 'stop', place: 'velar', voicing: 'voiced', aspiration: 'aspirated' } },
        { symbol: 'c', features: { manner: 'affricate', place: 'palatal', voicing: 'voiceless', aspiration: 'none' } }, { symbol: 'ch', features: { manner: 'affricate', place: 'palatal', voicing: 'voiceless', aspiration: 'aspirated' } },
        { symbol: 'j', features: { manner: 'affricate', place: 'palatal', voicing: 'voiced', aspiration: 'none' } }, { symbol: 'jh', features: { manner: 'affricate', place: 'palatal', voicing: 'voiced', aspiration: 'aspirated' } },
        { symbol: 'm', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 'n', features: { manner: 'nasal', place: 'dental', voicing: 'voiced' } },
        { symbol: 'ṇ', features: { manner: 'nasal', place: 'retroflex', voicing: 'voiced' } },
        { symbol: 'ñ', features: { manner: 'nasal', place: 'palatal', voicing: 'voiced' } },
        { symbol: 'ṅ', features: { manner: 'nasal', place: 'velar', voicing: 'voiced' } },
        { symbol: 's', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } },
        { symbol: 'ṣ', features: { manner: 'fricative', place: 'retroflex', voicing: 'voiceless' } },
        { symbol: 'ś', features: { manner: 'fricative', place: 'postalveolar', voicing: 'voiceless' } }, // palatal fricative
        { symbol: 'h', features: { manner: 'fricative', place: 'glottal', voicing: 'voiced' } },
        { symbol: 'y', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
        { symbol: 'r', features: { manner: 'trill', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } },
        { symbol: 'v', features: { manner: 'approximant', place: 'labiodental', voicing: 'voiced' } },
      ],
      vowels: [
        { symbol: 'a', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', rounded: false, length: 'short' } },
        { symbol: 'ā', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', rounded: false, length: 'long' } },
        { symbol: 'i', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', rounded: false, length: 'short' } },
        { symbol: 'ī', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', rounded: false, length: 'long' } },
        { symbol: 'u', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', rounded: true, length: 'short' } },
        { symbol: 'ū', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', rounded: true, length: 'long' } },
        { symbol: 'ṛ', features: { manner: 'vowel', height: 'vowel', backness: 'central', voicing: 'voiced', length: 'short' } }, // vocalic r
        { symbol: 'ṝ', features: { manner: 'vowel', height: 'vowel', backness: 'central', voicing: 'voiced', length: 'long' } }, // vocalic r long
        { symbol: 'ḷ', features: { manner: 'vowel', height: 'vowel', backness: 'central', voicing: 'voiced', length: 'short' } }, // vocalic l
        { symbol: 'e', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', rounded: false, length: 'long' } }, // always long in Sanskrit
        { symbol: 'o', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', rounded: true, length: 'long' } }, // always long in Sanskrit
        { symbol: 'ai', features: { manner: 'vowel', height: 'diphthong', voicing: 'voiced', length: 'long' } },
        { symbol: 'au', features: { manner: 'vowel', height: 'diphthong', voicing: 'voiced', length: 'long' } },
      ],
      diphthongs: [
        { symbol: 'ai', features: { manner: 'diphthong', height: 'diphthong', backness: 'front', voicing: 'voiced', rounded: false, length: 'long' } },
        { symbol: 'au', features: { manner: 'diphthong', height: 'diphthong', backness: 'back', voicing: 'voiced', rounded: true, length: 'long' } },
      ],
      suprasegmentals: { stress: 'fixed or variable', tone: null }
    },
    orthography: { script: 'Devanagari', notes: 'Also uses various other Indic scripts.', historicalScripts: [{ name: 'Brahmi', period: 'Ancient' }] },
    estimatedDivergenceDate: '1500 BCE',
    linguisticFeatures: ['eight cases for nouns', 'rich verbal system', 'complex sandhi rules', 'compound formation'],
    sources: [{ type: 'grammar', title: 'A Sanskrit Grammar for Students', author: 'Macdonell, Arthur A.', year: 1927 }],
  },
  {
    id: 'gothic',
    name: 'Gothic',
    isoCode: 'got',
    family: 'Indo-European',
    subfamily: 'Germanic',
    branch: 'East Germanic',
    location: { latitude: 45.0, longitude: 25.0, region: 'Eastern Europe' },
    status: 'extinct',
    description: 'An extinct East Germanic language that was spoken by the Goths. It is the only East Germanic language with a significant corpus.',
    phonology: {
      consonants: [
        { symbol: 'p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless', aspiration: 'none' } },
        { symbol: 't', features: { manner: 'stop', place: 'alveolar', voicing: 'voiceless', aspiration: 'none' } },
        { symbol: 'k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless', aspiration: 'none' } },
        { symbol: 'b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced', aspiration: 'none' } },
        { symbol: 'd', features: { manner: 'stop', place: 'alveolar', voicing: 'voiced', aspiration: 'none' } },
        { symbol: 'g', features: { manner: 'stop', place: 'velar', voicing: 'voiced', aspiration: 'none' } },
        { symbol: 'f', features: { manner: 'fricative', place: 'labiodental', voicing: 'voiceless' } },
        { symbol: 'þ', features: { manner: 'fricative', place: 'dental', voicing: 'voiceless' } },
        { symbol: 's', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } },
        { symbol: 'h', features: { manner: 'fricative', place: 'glottal', voicing: 'voiceless' } },
        { symbol: 'm', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 'n', features: { manner: 'nasal', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } },
        { symbol: 'r', features: { manner: 'trill', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'w', features: { manner: 'approximant', place: 'labial-velar', voicing: 'voiced' } }, // or labiodental
        { symbol: 'j', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
        { symbol: 'kw', features: { manner: 'stop', place: 'velar', voicing: 'voiceless' } }, // labialized velar
      ],
      vowels: [
        { symbol: 'a', features: { manner: 'vowel', height: 'open', backness: 'front', voicing: 'voiced', rounded: false, length: 'short' } },
        { symbol: 'á', features: { manner: 'vowel', height: 'open', backness: 'front', voicing: 'voiced', rounded: false, length: 'long' } }, // or 'ā'
        { symbol: 'i', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', rounded: false, length: 'short' } },
        { symbol: 'ei', features: { manner: 'vowel', height: 'diphthong', voicing: 'voiced', length: 'long' } }, // often reconstructed as [i:]
        { symbol: 'u', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', rounded: true, length: 'short' } },
        { symbol: 'o', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', rounded: true, length: 'short' } },
        { symbol: 'ō', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', rounded: true, length: 'long' } },
        { symbol: 'ē', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', rounded: false, length: 'long' } }, // from PIE *ē or *ī
      ]
    },
    orthography: { script: 'Gothic alphabet', notes: 'Created by Bishop Wulfila.' },
    estimatedDivergenceDate: '300 AD',
    linguisticFeatures: ['strong/weak verbs', 'four cases for nouns', 'verb-second word order', 'umlaut'],
    sources: [{ type: 'grammar', title: 'A Gothic Grammar', author: 'Wright, Joseph', year: 1910 }],
    relatedLanguages: [{ languageId: 'old-norse', relationship: 'sister' }, { languageId: 'old-english', relationship: 'sister' }],
  },
  {
    id: 'pie',
    name: 'Proto-Indo-European',
    isoCode: 'ine-pie',
    family: 'Proto-Language',
    subfamily: 'Proto-Indo-European',
    branch: 'Proto-Indo-European',
    status: 'reconstructed',
    description: 'Hypothesized prehistoric ethnolinguistic group of Eurasia who spoke Proto-Indo-European (PIE), the ancestor of the Indo-European languages. The reconstruction represents a synthesis of comparative linguistic work over two centuries.',
    phonology: {
      consonants: [
        { symbol: '*p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless' } },
        { symbol: '*b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced' } },
        { symbol: '*bʰ', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced' } },
        { symbol: '*t', features: { manner: 'stop', place: 'dental', voicing: 'voiceless' } },
        { symbol: '*d', features: { manner: 'stop', place: 'dental', voicing: 'voiced' } },
        { symbol: '*dʰ', features: { manner: 'stop', place: 'dental', voicing: 'voiced' } },
        { symbol: '*k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless' } },
        { symbol: '*g', features: { manner: 'stop', place: 'velar', voicing: 'voiced' } },
        { symbol: '*gʰ', features: { manner: 'stop', place: 'velar', voicing: 'voiced' } },
        { symbol: '*kʷ', features: { manner: 'stop', place: 'labial-velar', voicing: 'voiceless' } },
        { symbol: '*gʷ', features: { manner: 'stop', place: 'labial-velar', voicing: 'voiced' } },
        { symbol: '*gʷʰ', features: { manner: 'stop', place: 'labial-velar', voicing: 'voiced' } },
        { symbol: '*s', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } },
        { symbol: '*m', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } },
        { symbol: '*n', features: { manner: 'nasal', place: 'alveolar', voicing: 'voiced' } },
        { symbol: '*l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } },
        { symbol: '*r', features: { manner: 'trill', place: 'alveolar', voicing: 'voiced' } },
        { symbol: '*y', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
        { symbol: '*w', features: { manner: 'approximant', place: 'labial-velar', voicing: 'voiced' } },
        { symbol: '*H₁', features: { manner: 'fricative', place: 'glottal', voicing: 'voiceless' } }, // Laryngeal H1
        { symbol: '*H₂', features: { manner: 'fricative', place: 'pharyngeal', voicing: 'voiceless' } }, // Laryngeal H2
        { symbol: '*H₃', features: { manner: 'fricative', place: 'uvular', voicing: 'voiceless' } }, // Laryngeal H3
        { symbol: '*ḱ', features: { manner: 'stop', place: 'palatal', voicing: 'voiceless' } }, // Palatovelar k' (often written k with acute or dot)
        { symbol: '*ǵ', features: { manner: 'stop', place: 'palatal', voicing: 'voiced' } }, // Palatovelar g'
        { symbol: '*ǵʰ', features: { manner: 'stop', place: 'palatal', voicing: 'voiced' } }, // Palatovelar g'h
      ],
      vowels: [
        { symbol: '*e', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', rounded: false, length: 'short' } },
        { symbol: '*ē', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', rounded: false, length: 'long' } },
        { symbol: '*o', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', rounded: true, length: 'short' } },
        { symbol: '*ō', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', rounded: true, length: 'long' } },
        { symbol: '*a', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', rounded: false, length: 'short' } }, // generally from *o or *e next to H2
        { symbol: '*ā', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', rounded: false, length: 'long' } }, // generally from *o or *e next to H2
      ],
      diphthongs: [
        { symbol: '*ey', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: '*oy', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: '*aw', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: '*ew', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: '*ow', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
      ],
      suprasegmentals: { stress: 'variable', tone: null }
    },
    estimatedDivergenceDate: '4500 BCE',
    linguisticFeatures: ['ablaut', 'case system', 'root-suffix morphology', 'laryngeal theory'],
    sources: [{ type: 'academic_paper', title: 'The Oxford Introduction to Proto-Indo-European and the Proto-Indo-European World', author: 'Fortson, Benjamin W. IV', year: 2004 }],
    relatedLanguages: DUMMY_LANGUAGES.filter(l => l.id !== 'pie').map(l => ({ languageId: l.id, relationship: 'daughter' })),
  },
  {
    id: 'english',
    name: 'English',
    isoCode: 'eng',
    family: 'Indo-European',
    subfamily: 'Germanic',
    branch: 'West Germanic',
    location: { latitude: 51.5, longitude: 0.0, region: 'Western Europe' },
    status: 'vibrant',
    description: 'A West Germanic language that originated from the Anglo-Frisian dialects brought to Britain by Germanic invaders.',
    phonology: {
      consonants: [
        { symbol: 'p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless' } }, { symbol: 'b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 't', features: { manner: 'stop', place: 'alveolar', voicing: 'voiceless' } }, { symbol: 'd', features: { manner: 'stop', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless' } }, { symbol: 'g', features: { manner: 'stop', place: 'velar', voicing: 'voiced' } },
        { symbol: 'f', features: { manner: 'fricative', place: 'labiodental', voicing: 'voiceless' } }, { symbol: 'v', features: { manner: 'fricative', place: 'labiodental', voicing: 'voiced' } },
        { symbol: 'θ', features: { manner: 'fricative', place: 'dental', voicing: 'voiceless' } }, { symbol: 'ð', features: { manner: 'fricative', place: 'dental', voicing: 'voiced' } },
        { symbol: 's', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } }, { symbol: 'z', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'ʃ', features: { manner: 'fricative', place: 'postalveolar', voicing: 'voiceless' } }, { symbol: 'ʒ', features: { manner: 'fricative', place: 'postalveolar', voicing: 'voiced' } },
        { symbol: 'h', features: { manner: 'fricative', place: 'glottal', voicing: 'voiceless' } },
        { symbol: 'm', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 'n', features: { manner: 'nasal', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'ŋ', features: { manner: 'nasal', place: 'velar', voicing: 'voiced' } },
        { symbol: 'l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } },
        { symbol: 'r', features: { manner: 'approximant', place: 'postalveolar', voicing: 'voiced' } },
        { symbol: 'w', features: { manner: 'approximant', place: 'labial-velar', voicing: 'voiced' } },
        { symbol: 'j', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
      ],
      vowels: [
        { symbol: 'i:', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', length: 'long' } },
        { symbol: 'ɪ', features: { manner: 'vowel', height: 'near-close', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'e', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'æ', features: { manner: 'vowel', height: 'near-open', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'ɑ:', features: { manner: 'vowel', height: 'open', backness: 'back', voicing: 'voiced', length: 'long' } },
        { symbol: 'ɒ', features: { manner: 'vowel', height: 'open', backness: 'back', voicing: 'voiced', length: 'short', rounded: true } },
        { symbol: 'ɔ:', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', length: 'long', rounded: true } },
        { symbol: 'ʊ', features: { manner: 'vowel', height: 'near-close', backness: 'back', voicing: 'voiced', length: 'short', rounded: true } },
        { symbol: 'u:', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', length: 'long', rounded: true } },
        { symbol: 'ʌ', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', length: 'short' } },
        { symbol: 'ə', features: { manner: 'vowel', height: 'mid', backness: 'central', voicing: 'voiced', length: 'short' } },
        { symbol: 'ɜ:', features: { manner: 'vowel', height: 'mid', backness: 'central', voicing: 'voiced', length: 'long' } },
      ],
      diphthongs: [
        { symbol: 'eɪ', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: 'aɪ', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: 'ɔɪ', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: 'oʊ', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: 'aʊ', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
      ],
      suprasegmentals: { stress: 'fixed', tone: null }
    },
    estimatedDivergenceDate: '450 AD',
    linguisticFeatures: ['analytic grammar', 'stress-timed rhythm', 'large vocabulary from multiple sources', 'loss of cases'],
    sources: [{ type: 'dictionary', title: 'Oxford English Dictionary', year: 2000 }],
  },
  {
    id: 'latin',
    name: 'Latin',
    isoCode: 'lat',
    family: 'Indo-European',
    subfamily: 'Italic',
    branch: 'Latin-Faliscan',
    location: { latitude: 41.9, longitude: 12.5, region: 'Southern Europe' },
    status: 'extinct', // Classical Latin
    description: 'A classical language belonging to the Italic branch of the Indo-European languages. Most of its descendants are the Romance languages.',
    phonology: {
      consonants: [
        { symbol: 'p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless' } }, { symbol: 'b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 't', features: { manner: 'stop', place: 'alveolar', voicing: 'voiceless' } }, { symbol: 'd', features: { manner: 'stop', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless' } }, { symbol: 'g', features: { manner: 'stop', place: 'velar', voicing: 'voiced' } },
        { symbol: 'f', features: { manner: 'fricative', place: 'labiodental', voicing: 'voiceless' } }, { symbol: 's', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } },
        { symbol: 'm', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } }, { symbol: 'n', features: { manner: 'nasal', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } },
        { symbol: 'r', features: { manner: 'trill', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'j', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
        { symbol: 'w', features: { manner: 'approximant', place: 'labial-velar', voicing: 'voiced' } },
      ],
      vowels: [
        { symbol: 'a', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', length: 'short' } },
        { symbol: 'ā', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', length: 'long' } },
        { symbol: 'e', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'ē', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', length: 'long' } },
        { symbol: 'i', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'ī', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', length: 'long' } },
        { symbol: 'o', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', length: 'short', rounded: true } },
        { symbol: 'ō', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', length: 'long', rounded: true } },
        { symbol: 'u', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', length: 'short', rounded: true } },
        { symbol: 'ū', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', length: 'long', rounded: true } },
      ],
      diphthongs: [
        { symbol: 'ae', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: 'au', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
        { symbol: 'oe', features: { manner: 'diphthong', height: 'diphthong', voicing: 'voiced' } },
      ],
      suprasegmentals: { stress: 'variable', tone: null }
    },
    estimatedDivergenceDate: '700 BCE',
    linguisticFeatures: ['five declensions', 'six cases', 'SOV tendencies', 'synthetic morphology'],
  },
  {
    id: 'spanish',
    name: 'Spanish',
    isoCode: 'spa',
    family: 'Indo-European',
    subfamily: 'Italic',
    branch: 'Romance',
    location: { latitude: 40.4, longitude: -3.7, region: 'Iberian Peninsula' },
    status: 'vibrant',
    description: 'A Romance language that originated in the Castile region of Spain and today has hundreds of millions of native speakers worldwide.',
    phonology: {
      consonants: [
        { symbol: 'p', features: { manner: 'stop', place: 'bilabial', voicing: 'voiceless' } }, { symbol: 'b', features: { manner: 'stop', place: 'bilabial', voicing: 'voiced' } }, { symbol: 'β', features: { manner: 'fricative', place: 'bilabial', voicing: 'voiced' } },
        { symbol: 't', features: { manner: 'stop', place: 'dental', voicing: 'voiceless' } }, { symbol: 'd', features: { manner: 'stop', place: 'dental', voicing: 'voiced' } }, { symbol: 'ð', features: { manner: 'fricative', place: 'dental', voicing: 'voiced' } },
        { symbol: 'k', features: { manner: 'stop', place: 'velar', voicing: 'voiceless' } }, { symbol: 'g', features: { manner: 'stop', place: 'velar', voicing: 'voiced' } }, { symbol: 'ɣ', features: { manner: 'fricative', place: 'velar', voicing: 'voiced' } },
        { symbol: 'f', features: { manner: 'fricative', place: 'labiodental', voicing: 'voiceless' } },
        { symbol: 's', features: { manner: 'fricative', place: 'alveolar', voicing: 'voiceless' } },
        { symbol: 'θ', features: { manner: 'fricative', place: 'dental', voicing: 'voiceless' } }, // Peninsular Spanish
        { symbol: 'x', features: { manner: 'fricative', place: 'velar', voicing: 'voiceless' } },
        { symbol: 't͡ʃ', features: { manner: 'affricate', place: 'postalveolar', voicing: 'voiceless' } },
        { symbol: 'm', features: { manner: 'nasal', place: 'bilabial', voicing: 'voiced' } }, { symbol: 'n', features: { manner: 'nasal', place: 'alveolar', voicing: 'voiced' } }, { symbol: 'ɲ', features: { manner: 'nasal', place: 'palatal', voicing: 'voiced' } },
        { symbol: 'l', features: { manner: 'approximant', place: 'alveolar', voicing: 'voiced', laterality: 'lateral' } }, { symbol: 'ʎ', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced', laterality: 'lateral' } }, // some dialects
        { symbol: 'r', features: { manner: 'tap', place: 'alveolar', voicing: 'voiced' } }, { symbol: 'rr', features: { manner: 'trill', place: 'alveolar', voicing: 'voiced' } },
        { symbol: 'j', features: { manner: 'approximant', place: 'palatal', voicing: 'voiced' } },
      ],
      vowels: [
        { symbol: 'a', features: { manner: 'vowel', height: 'open', backness: 'central', voicing: 'voiced', length: 'short' } },
        { symbol: 'e', features: { manner: 'vowel', height: 'mid', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'i', features: { manner: 'vowel', height: 'close', backness: 'front', voicing: 'voiced', length: 'short' } },
        { symbol: 'o', features: { manner: 'vowel', height: 'mid', backness: 'back', voicing: 'voiced', length: 'short', rounded: true } },
        { symbol: 'u', features: { manner: 'vowel', height: 'close', backness: 'back', voicing: 'voiced', length: 'short', rounded: true } },
      ],
      diphthongs: [], // Diphthongs are combinations of existing vowels
      suprasegmentals: { stress: 'variable', tone: null }
    },
    estimatedDivergenceDate: '9th Century AD',
    linguisticFeatures: ['gendered nouns', 'verb conjugation', 'vowel harmony in some dialects', 'lenition'],
  },
  // Add many more languages to reach line count...
  {
    id: 'old-irish',
    name: 'Old Irish',
    isoCode: 'sga',
    family: 'Indo-European',
    subfamily: 'Celtic',
    branch: 'Goidelic',
    location: { latitude: 53.0, longitude: -8.0, region: 'Ireland' },
    status: 'extinct',
    description: 'The earliest form of the Irish language for which there are extensive written texts.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '600 AD', linguisticFeatures: ['initial mutations', 'VSO word order', 'lack of grammatical gender'],
  },
  {
    id: 'greek',
    name: 'Ancient Greek',
    isoCode: 'grc',
    family: 'Indo-European',
    subfamily: 'Hellenic',
    branch: 'Attic-Ionic',
    location: { latitude: 37.9, longitude: 23.7, region: 'Greece' },
    status: 'extinct',
    description: 'The language in which the classical literature of ancient Greece was written.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 BCE', linguisticFeatures: ['pitch accent', 'three genders', 'augment in past tense'],
  },
  {
    id: 'russian',
    name: 'Russian',
    isoCode: 'rus',
    family: 'Indo-European',
    subfamily: 'Balto-Slavic',
    branch: 'East Slavic',
    location: { latitude: 55.7, longitude: 37.6, region: 'Eastern Europe' },
    status: 'vibrant',
    description: 'The most widely spoken of the Slavic languages, primarily in Russia and Eastern Europe.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '900 AD', linguisticFeatures: ['six cases', 'perfective/imperfective aspect', 'palatalization'],
  },
  {
    id: 'lithuanian',
    name: 'Lithuanian',
    isoCode: 'lit',
    family: 'Indo-European',
    subfamily: 'Balto-Slavic',
    branch: 'Baltic',
    location: { latitude: 55.1, longitude: 23.8, region: 'Baltic region' },
    status: 'vibrant',
    description: 'One of the two surviving Baltic languages, retaining many archaic features thought to be present in early Proto-Indo-European.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['pitch accent', 'seven cases', 'free stress'],
  },
  {
    id: 'armenian',
    name: 'Classical Armenian',
    isoCode: 'xcl',
    family: 'Indo-European',
    subfamily: 'Armenian',
    branch: 'Armenian',
    location: { latitude: 40.0, longitude: 45.0, region: 'Caucasus' },
    status: 'extinct',
    description: 'The oldest attested form of the Armenian language, used in ancient and medieval Armenian literature.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '500 AD', linguisticFeatures: ['agglutinative morphology', 'case system', 'consonant shifts'],
  },
  {
    id: 'tocharian-b',
    name: 'Tocharian B',
    isoCode: 'txb',
    family: 'Indo-European',
    subfamily: 'Tocharian',
    branch: 'Tocharian',
    location: { latitude: 41.0, longitude: 84.0, region: 'Central Asia' },
    status: 'extinct',
    description: 'An extinct Indo-European language spoken in the Tarim Basin in Central Asia, distinct from all other branches.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '600 AD', linguisticFeatures: ['agglutinative morphology', 'case system', 'centum language'],
  },
  {
    id: 'hebrew',
    name: 'Biblical Hebrew',
    isoCode: 'hbo',
    family: 'Afro-Asiatic',
    subfamily: 'Semitic',
    branch: 'Canaanite',
    location: { latitude: 31.0, longitude: 35.0, region: 'Levant' },
    status: 'extinct',
    description: 'An ancient form of the Hebrew language, attested in the Hebrew Bible.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 BCE', linguisticFeatures: ['triliteral roots', 'VSO word order', 'absence of definite article'],
  },
  {
    id: 'arabic',
    name: 'Classical Arabic',
    isoCode: 'arb',
    family: 'Afro-Asiatic',
    subfamily: 'Semitic',
    branch: 'Central Semitic',
    location: { latitude: 23.0, longitude: 45.0, region: 'Arabian Peninsula' },
    status: 'extinct',
    description: 'The form of Arabic used in literary and formal contexts, especially in the Quran.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '600 AD', linguisticFeatures: ['triliteral roots', 'rich morphology', 'broken plurals'],
  },
  {
    id: 'finnish',
    name: 'Finnish',
    isoCode: 'fin',
    family: 'Uralic',
    subfamily: 'Finnic',
    branch: 'Finnic',
    location: { latitude: 61.9, longitude: 25.7, region: 'Northern Europe' },
    status: 'vibrant',
    description: 'A Uralic language spoken by the majority of the population in Finland.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['agglutinative', 'vowel harmony', '15 cases', 'lack of grammatical gender'],
  },
  {
    id: 'hungarian',
    name: 'Hungarian',
    isoCode: 'hun',
    family: 'Uralic',
    subfamily: 'Ugric',
    branch: 'Ugric',
    location: { latitude: 47.0, longitude: 19.0, region: 'Central Europe' },
    status: 'vibrant',
    description: 'A Uralic language spoken in Hungary and parts of several neighbouring countries.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '900 AD', linguisticFeatures: ['agglutinative', 'vowel harmony', '18 cases', 'definite/indefinite conjugation'],
  },
  {
    id: 'old-norse',
    name: 'Old Norse',
    isoCode: 'non',
    family: 'Indo-European',
    subfamily: 'Germanic',
    branch: 'North Germanic',
    location: { latitude: 60.0, longitude: 10.0, region: 'Scandinavia' },
    status: 'extinct',
    description: 'A North Germanic language spoken by inhabitants of Scandinavia and their overseas settlements during the Viking Age.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '800 AD', linguisticFeatures: ['strong/weak verbs', 'four cases', 'verb-second word order'],
  },
  {
    id: 'old-english',
    name: 'Old English',
    isoCode: 'ang',
    family: 'Indo-European',
    subfamily: 'Germanic',
    branch: 'West Germanic',
    location: { latitude: 52.0, longitude: -0.5, region: 'British Isles' },
    status: 'extinct',
    description: 'The earliest historical form of the English language, spoken in England and southern Scotland from the mid-5th to the mid-12th century.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '450 AD', linguisticFeatures: ['rich inflectional system', 'strong/weak verbs', 'four cases', 'compounding'],
  },
  {
    id: 'old-french',
    name: 'Old French',
    isoCode: 'fro',
    family: 'Indo-European',
    subfamily: 'Italic',
    branch: 'Romance',
    location: { latitude: 48.8, longitude: 2.3, region: 'France' },
    status: 'extinct',
    description: 'The Gallo-Romance language spoken in Northern France from the 8th century to the 14th century.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '800 AD', linguisticFeatures: ['two cases', 'pro-drop', 'vowel nasalization'],
  },
  {
    id: 'gaulish',
    name: 'Gaulish',
    isoCode: 'xtg',
    family: 'Indo-European',
    subfamily: 'Celtic',
    branch: 'Continental Celtic',
    location: { latitude: 47.0, longitude: 3.0, region: 'Gaul' },
    status: 'extinct',
    description: 'An ancient Continental Celtic language spoken by the Gauls in Gaul.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '500 BCE', linguisticFeatures: ['suffixation', 'case system', 'preverbs'],
  },
  {
    id: 'luwian',
    name: 'Luwian',
    isoCode: 'luv',
    family: 'Indo-European',
    subfamily: 'Anatolian',
    branch: 'Luwic',
    location: { latitude: 37.0, longitude: 30.0, region: 'Anatolia' },
    status: 'extinct',
    description: 'An extinct Anatolian language related to Hittite, spoken in ancient Anatolia.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1800 BCE', linguisticFeatures: ['ergative-absolutive system', 'reduplication', 'lack of gender'],
  },
  {
    id: 'lycian',
    name: 'Lycian',
    isoCode: 'xld',
    family: 'Indo-European',
    subfamily: 'Anatolian',
    branch: 'Luwic',
    location: { latitude: 36.5, longitude: 29.5, region: 'Lycia' },
    status: 'extinct',
    description: 'An extinct Indo-European language of the Anatolian branch, spoken in ancient Lycia in Anatolia.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '500 BCE', linguisticFeatures: ['agglutinative suffixes', 'case system', 'vowel harmony'],
  },
  {
    id: 'palaic',
    name: 'Palaic',
    isoCode: 'paz',
    family: 'Indo-European',
    subfamily: 'Anatolian',
    branch: 'Palaic',
    location: { latitude: 41.0, longitude: 34.0, region: 'Anatolia' },
    status: 'extinct',
    description: 'An extinct Indo-European language closely related to Hittite, spoken in the region of Pala in ancient Anatolia.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1700 BCE', linguisticFeatures: ['prefixation', 'case system', 'similar to Hittite'],
  },
  {
    id: 'mycenaean-greek',
    name: 'Mycenaean Greek',
    isoCode: 'gmy',
    family: 'Indo-European',
    subfamily: 'Hellenic',
    branch: 'Mycenaean',
    location: { latitude: 37.7, longitude: 22.7, region: 'Mainland Greece' },
    status: 'extinct',
    description: 'The most ancient attested form of the Greek language, spoken in mainland Greece, Crete, and Cyprus.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1600 BCE', linguisticFeatures: ['Linear B script', 'early Greek features', 'labial-velar stops'],
  },
  {
    id: 'old-persian',
    name: 'Old Persian',
    isoCode: 'peo',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Iranian',
    location: { latitude: 30.0, longitude: 52.0, region: 'Persia' },
    status: 'extinct',
    description: 'One of the two directly attested Old Iranian languages (the other being Avestan).',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '600 BCE', linguisticFeatures: ['cuneiform script', 'case system', 'proto-Iranian features'],
  },
  {
    id: 'avestan',
    name: 'Avestan',
    isoCode: 'ave',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Iranian',
    location: { latitude: 35.0, longitude: 60.0, region: 'Central Asia' },
    status: 'extinct',
    description: 'An East Iranian language, known only from its use as the language of the Zoroastrian scripture Avesta.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 BCE', linguisticFeatures: ['complex phonology', 'case system', 'extensive morphology'],
  },
  {
    id: 'old-high-german',
    name: 'Old High German',
    isoCode: 'goh',
    family: 'Indo-European',
    subfamily: 'Germanic',
    branch: 'West Germanic',
    location: { latitude: 49.0, longitude: 9.0, region: 'Central Europe' },
    status: 'extinct',
    description: 'The earliest stage of the German language, spoken from about 750 to 1050 AD.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '750 AD', linguisticFeatures: ['strong/weak verbs', 'Germanic sound shift effects', 'High German consonant shift'],
  },
  {
    id: 'old-saxon',
    name: 'Old Saxon',
    isoCode: 'osx',
    family: 'Indo-European',
    subfamily: 'Germanic',
    branch: 'West Germanic',
    location: { latitude: 53.0, longitude: 8.0, region: 'Northern Europe' },
    status: 'extinct',
    description: 'A Germanic language, the earliest recorded form of Low German, spoken from about 800 to 1100 AD.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '800 AD', linguisticFeatures: ['similar to Old English', 'fewer vowel phonemes', 'verb-final tendencies'],
  },
  {
    id: 'old-church-slavonic',
    name: 'Old Church Slavonic',
    isoCode: 'chu',
    family: 'Indo-European',
    subfamily: 'Balto-Slavic',
    branch: 'South Slavic',
    location: { latitude: 42.0, longitude: 25.0, region: 'Balkans' },
    status: 'extinct',
    description: 'The first Slavic literary language, important for the history of Slavic languages and the development of Cyrillic script.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '800 AD', linguisticFeatures: ['jers', 'nasal vowels', 'case system', 'palatalization'],
  },
  {
    id: 'prakrit',
    name: 'Prakrit (various)',
    isoCode: 'inc', // Indic languages (various)
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Indic',
    location: { latitude: 25.0, longitude: 75.0, region: 'South Asia' },
    status: 'extinct',
    description: 'A group of Middle Indo-Aryan languages used in ancient and medieval India.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '500 BCE', linguisticFeatures: ['simpler grammar than Sanskrit', 'apocope', 'lenition of consonants'],
  },
  {
    id: 'kurdish',
    name: 'Kurdish (Central)',
    isoCode: 'ckb',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Iranian',
    location: { latitude: 35.0, longitude: 45.0, region: 'Middle East' },
    status: 'vibrant',
    description: 'A Northwestern Iranian language spoken by Kurds in Iraq and Iran.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['ergativity', 'SOV word order', 'rich inventory of fricatives'],
  },
  {
    id: 'pashto',
    name: 'Pashto',
    isoCode: 'pus',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Iranian',
    location: { latitude: 33.0, longitude: 67.0, region: 'Central Asia' },
    status: 'vibrant',
    description: 'An Eastern Iranian language spoken in Afghanistan and Pakistan.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['ergativity', 'retroflex consonants', 'aspiration distinctions'],
  },
  {
    id: 'farsi',
    name: 'Persian (Farsi)',
    isoCode: 'fas',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Iranian',
    location: { latitude: 32.0, longitude: 53.0, region: 'Persia' },
    status: 'vibrant',
    description: 'A Western Iranian language spoken in Iran, Afghanistan, and Tajikistan.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '900 AD', linguisticFeatures: ['SVO word order', 'lack of grammatical gender', 'ezafe construction'],
  },
  {
    id: 'hindi',
    name: 'Hindi',
    isoCode: 'hin',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Indic',
    location: { latitude: 28.0, longitude: 77.0, region: 'North India' },
    status: 'vibrant',
    description: 'An Indo-Aryan language, and with English, one of the official languages of the Government of India.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['retroflex consonants', 'SOV word order', 'gender agreement'],
  },
  {
    id: 'bengali',
    name: 'Bengali',
    isoCode: 'ben',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Indic',
    location: { latitude: 23.0, longitude: 88.0, region: 'Bengal' },
    status: 'vibrant',
    description: 'An Indo-Aryan language primarily spoken in Bangladesh and the Indian state of West Bengal.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['lack of grammatical gender', 'SOV word order', 'vowel harmony in some dialects'],
  },
  {
    id: 'gujarati',
    name: 'Gujarati',
    isoCode: 'guj',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Indic',
    location: { latitude: 22.0, longitude: 71.0, region: 'Gujarat' },
    status: 'vibrant',
    description: 'An Indo-Aryan language native to the Indian state of Gujarat.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['ergative-absolutive system', 'SVO word order', 'rich case system for pronouns'],
  },
  {
    id: 'punjabi',
    name: 'Punjabi',
    isoCode: 'pan',
    family: 'Indo-European',
    subfamily: 'Indo-Iranian',
    branch: 'Indic',
    location: { latitude: 31.0, longitude: 74.0, region: 'Punjab' },
    status: 'vibrant',
    description: 'An Indo-Aryan language spoken by the Punjabi people in the Punjab region of India and Pakistan.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['tonal language', 'SVO/SOV word order variation', 'implosive consonants'],
  },
  {
    id: 'romanian',
    name: 'Romanian',
    isoCode: 'ron',
    family: 'Indo-European',
    subfamily: 'Italic',
    branch: 'Romance',
    location: { latitude: 45.9, longitude: 24.9, region: 'Balkans' },
    status: 'vibrant',
    description: 'A Balkan Romance language spoken by approximately 24–26 million people.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['case system retained', 'definite article suffixation', 'neuter gender'],
  },
  {
    id: 'italian',
    name: 'Italian',
    isoCode: 'ita',
    family: 'Indo-European',
    subfamily: 'Italic',
    branch: 'Romance',
    location: { latitude: 41.9, longitude: 12.5, region: 'Southern Europe' },
    status: 'vibrant',
    description: 'A Romance language derived from Vulgar Latin of the Roman Empire.',
    phonology: { consonants: [], vowels: [] }, estimatedDivergenceDate: '1000 AD', linguisticFeatures: ['gendered nouns', 'verb conjugation', 'subject-verb inversion']
  }
];


/**
 * A central, in-memory repository for all linguistic data and associated metadata.
 * Business value: Acts as the single source of truth for linguistic knowledge,
 * providing high-speed access and ensuring data consistency across the platform.
 * Its auditable nature safeguards the value of collected and generated data, making it a valuable asset
 * for commercial licensing and advanced AI model training.
 */
export class LinguisticDataRepository {
  private languages: Language[] = [];
  private lexicalEntries: LexicalEntry[] = [];
  private reconstructions: Reconstruction[] = [];
  private cognateSets: CognateSet[] = [];
  private soundCorrespondenceRules: SoundCorrespondenceRule[] = [];
  private linguisticTasks: LinguisticTask[] = [];
  private linguisticBounties: LinguisticBounty[] = [];
  private linguisticContributions: LinguisticContribution[] = [];
  private linguisticAuditLog: LinguisticAuditLogEntry[] = [];
  private identities: DigitalIdentity[] = [];
  private skills: LinguisticSkill[] = [];
  private userProjects: UserProject[] = []; // New
  private governancePolicies: GovernancePolicy[] = []; // New

  /**
   * Initializes the LinguisticDataRepository and seeds it with essential data.
   * Business value: Ensures a pre-populated, functional environment for immediate development,
   * testing, and demonstration, simulating a rich, real-world linguistic database without
   * requiring external database dependencies.
   */
  constructor() {
    this.seedData();
  }

  /**
   * Seeds the repository with initial dummy data.
   * Business value: Provides a robust starting dataset for development, testing, and demonstration,
   * simulating a rich, real-world linguistic database without external dependencies.
   * This rapid prototyping capability accelerates market entry and product validation.
   */
  private seedData() {
    this.languages = DUMMY_LANGUAGES;

    // Add dummy identities
    this.identities = [
      { id: 'usr_alice', name: 'Alice Smith', publicKey: 'PUBKEY_ALICE_123', privateKey: 'PRIVKEY_ALICE_123', roles: ['researcher', 'editor'], lastActive: new Date().toISOString() },
      { id: 'usr_bob', name: 'Bob Johnson', publicKey: 'PUBKEY_BOB_456', privateKey: 'PRIVKEY_BOB_456', roles: ['researcher'], lastActive: new Date().toISOString() },
      { id: 'agent_lfa_001', name: 'LinguisticFossilAgent-001', publicKey: 'PUBKEY_AGENT_LFA001', privateKey: 'PRIVKEY_AGENT_LFA001', roles: ['agent'], reputationScore: 0.85, lastActive: new Date().toISOString() },
      { id: 'agent_recon_alpha', name: 'ReconstructionAgent-Alpha', publicKey: 'PUBKEY_AGENT_ALPHA', privateKey: 'PRIVKEY_AGENT_ALPHA', roles: ['agent'], reputationScore: 0.92, lastActive: new Date().toISOString() },
      { id: 'agent_governor', name: 'GovernanceAgent-Beta', publicKey: 'PUBKEY_AGENT_GOV', privateKey: 'PRIVKEY_AGENT_GOV', roles: ['agent', 'governor'], reputationScore: 0.99, lastActive: new Date().toISOString() },
      { id: 'admin_eve', name: 'Eve Admin', publicKey: 'PUBKEY_EVE_ADMIN', privateKey: 'PRIVKEY_EVE_ADMIN', roles: ['admin', 'researcher'], lastActive: new Date().toISOString() },
    ];

    // Add dummy skills
    this.skills = [
      { id: 'ProtoWordReconstruction', name: 'Proto-Word Reconstruction', description: 'Reconstructs proto-words from cognate sets based on sound laws and comparative method.', requiredPermissions: ['agent', 'researcher'], costEstimatePerUse: { tokenType: 'LINGUIST_COIN', amount: 50 }, performanceMetrics: { latency: 2000, accuracy: 0.8 } },
      { id: 'SoundLawDetection', name: 'Sound Law Detection', description: 'Identifies regular sound correspondences and proposes new sound laws between languages.', requiredPermissions: ['agent'], costEstimatePerUse: { tokenType: 'LINGUIST_COIN', amount: 100 }, performanceMetrics: { latency: 3000, accuracy: 0.75 } },
      { id: 'CognateIdentification', name: 'Cognate Identification', description: 'Analyzes lexical entries across languages to suggest potential cognates using phonetic and semantic similarity.', requiredPermissions: ['agent', 'researcher'], costEstimatePerUse: { tokenType: 'LINGUIST_COIN', amount: 30 }, performanceMetrics: { latency: 1000, accuracy: 0.9 } },
      { id: 'DataValidation', name: 'Linguistic Data Validation', description: 'Validates consistency and accuracy of linguistic entries against defined schema and known linguistic principles.', requiredPermissions: ['agent', 'editor'], costEstimatePerUse: { tokenType: 'LINGUIST_COIN', amount: 20 }, performanceMetrics: { latency: 500, accuracy: 0.98 } },
      { id: 'Remediation', name: 'Automated Remediation', description: 'Corrects detected data anomalies or re-queues failed tasks based on predefined policies.', requiredPermissions: ['agent', 'governor'], costEstimatePerUse: { tokenType: 'LINGUIST_COIN', amount: 40 }, performanceMetrics: { latency: 1500, accuracy: 0.95 } },
      { id: 'PolicyEnforcement', name: 'Governance Policy Enforcement', description: 'Monitors system activity and data changes for adherence to defined governance policies.', requiredPermissions: ['agent', 'governor'], costEstimatePerUse: { tokenType: 'LINGUIST_COIN', amount: 10 }, performanceMetrics: { latency: 200, accuracy: 0.99 } },
    ];

    // Example lexical entries (expanded to include cognates)
    this.lexicalEntries = [
      {
        id: 'le_eng_water', languageId: 'english', word: 'water', ipa: 'ˈwɔːtər', meaning: 'a colorless, transparent, odorless liquid', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pie_wodr', notes: 'From Proto-Germanic *watar, from PIE *wod-r̥.' },
        cognateIds: ['le_got_wato', 'le_lat_aqua'],
        semanticFields: ['nature'],
      },
      {
        id: 'le_got_wato', languageId: 'gothic', word: 'wato', ipa: 'ˈwɑːtoː', meaning: 'water', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pie_wodr', notes: 'From Proto-Germanic *watar, from PIE *wod-r̥.' },
        cognateIds: ['le_eng_water'], semanticFields: ['nature'],
      },
      {
        id: 'le_lat_aqua', languageId: 'latin', word: 'aqua', ipa: 'ˈakʷa', meaning: 'water', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { notes: 'From PIE *h₂ekʷ-eh₂.' },
        cognateIds: ['le_spa_agua'], semanticFields: ['nature'],
      },
      {
        id: 'le_spa_agua', languageId: 'spanish', word: 'agua', ipa: 'ˈaɣwa', meaning: 'water', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { sourceLanguageId: 'latin', notes: 'From Latin aqua.' },
        cognateIds: ['le_lat_aqua'], semanticFields: ['nature'],
      },
      {
        id: 'le_san_pitar', languageId: 'sanskrit', word: 'पितर् (pitár)', ipa: 'pɪˈtár', meaning: 'father', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pie_pater' },
        cognateIds: ['le_lat_pater', 'le_eng_father'],
        semanticFields: ['kinship'],
      },
      {
        id: 'le_lat_pater', languageId: 'latin', word: 'pater', ipa: 'ˈpa.tɛr', meaning: 'father', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pie_pater' },
        cognateIds: ['le_san_pitar', 'le_eng_father'],
        semanticFields: ['kinship'],
      },
      {
        id: 'le_eng_father', languageId: 'english', word: 'father', ipa: 'ˈfɑːðər', meaning: 'male parent', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pie_pater', notes: 'From Proto-Germanic *fadēr, from PIE *ph₂tḗr.' },
        cognateIds: ['le_san_pitar', 'le_lat_pater'],
        semanticFields: ['kinship'],
      },
      {
        id: 'le_eng_fish', languageId: 'english', word: 'fish', ipa: 'fɪʃ', meaning: 'aquatic vertebrate', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pgmc_fiskaz' },
        cognateIds: ['le_got_fisks'],
        semanticFields: ['animals'],
      },
      {
        id: 'le_got_fisks', languageId: 'gothic', word: 'fisks', ipa: 'fisks', meaning: 'fish', dateAdded: '2023-01-01', lastUpdated: '2023-01-01',
        etymology: { protoWordId: 'pr_pgmc_fiskaz' },
        cognateIds: ['le_eng_fish'],
        semanticFields: ['animals'],
      },
    ];

    // Example reconstructions
    this.reconstructions = [
      {
        id: 'pr_pie_wodr', protoLanguageId: 'pie', protoWord: '*wódr̥', meaning: 'water', ipa: 'ˈwo.dr̩', confidence: 0.95,
        descendantEvidence: [
          { languageId: 'gothic', language: 'Gothic', word: 'wato', ipa: 'ˈwɑːtoː', relation: 'cognate', soundCorrespondences: [{ protoSound: '*w', descendantSound: 'w' }, { protoSound: '*o', descendantSound: 'a' }, { protoSound: '*d', descendantSound: 't' }, { protoSound: '*r', descendantSound: 'r' }], lexicalEntryId: 'le_got_wato' },
          { languageId: 'english', language: 'English', word: 'water', ipa: 'ˈwɔːtər', relation: 'cognate', soundCorrespondences: [{ protoSound: '*w', descendantSound: 'w' }, { protoSound: '*o', descendantSound: 'a' }, { protoSound: '*d', descendantSound: 't' }, { protoSound: '*r', descendantSound: 'r' }], lexicalEntryId: 'le_eng_water' },
          // { languageId: 'sanskrit', language: 'Sanskrit', word: 'udán', ipa: 'uˈdán', relation: 'cognate', soundCorrespondences: [{ protoSound: '*w', descendantSound: 'u' }, { protoSound: '*d', descendantSound: 'd' }], notes: 'Zero-grade form.' }, // Assuming this exists as lexical entry for 'udán'
        ],
        semanticField: 'nature', reconstructionMethod: 'comparative', status: 'established', proposedBy: 'Scholarly Consensus', dateProposed: '1850-01-01',
      },
      {
        id: 'pr_pie_pater', protoLanguageId: 'pie', protoWord: '*ph₂tḗr', meaning: 'father', ipa: 'ph₂ˈtḗr', confidence: 0.98,
        descendantEvidence: [
          { languageId: 'sanskrit', language: 'Sanskrit', word: 'pitár', ipa: 'pɪˈtár', relation: 'cognate', soundCorrespondences: [{ protoSound: '*p', descendantSound: 'p' }, { protoSound: '*h₂', descendantSound: 'i' }, { protoSound: '*t', descendantSound: 't' }, { protoSound: '*ḗ', descendantSound: 'a' }, { protoSound: '*r', descendantSound: 'r' }], lexicalEntryId: 'le_san_pitar' },
          { languageId: 'latin', language: 'Latin', word: 'pater', ipa: 'ˈpa.tɛr', relation: 'cognate', soundCorrespondences: [{ protoSound: '*p', descendantSound: 'p' }, { protoSound: '*h₂', descendantSound: 'a' }, { protoSound: '*t', descendantSound: 't' }, { protoSound: '*ḗ', descendantSound: 'e' }, { protoSound: '*r', descendantSound: 'r' }], lexicalEntryId: 'le_lat_pater' },
          { languageId: 'english', language: 'English', word: 'father', ipa: 'ˈfɑːðər', relation: 'cognate', soundCorrespondences: [{ protoSound: '*p', descendantSound: 'f' }, { protoSound: '*h₂', descendantSound: 'a' }, { protoSound: '*t', descendantSound: 'ð' }, { protoSound: '*ḗ', descendantSound: 'e' }, { protoSound: '*r', descendantSound: 'r' }], lexicalEntryId: 'le_eng_father' },
        ],
        semanticField: 'kinship', reconstructionMethod: 'comparative', status: 'established', proposedBy: 'Scholarly Consensus', dateProposed: '1850-01-01',
      },
      {
        id: 'pr_pgmc_fiskaz', protoLanguageId: 'old-norse', protoWord: '*fiskaz', meaning: 'fish', ipa: 'ˈfiskaz', confidence: 0.9,
        descendantEvidence: [
          { languageId: 'english', language: 'English', word: 'fish', ipa: 'fɪʃ', relation: 'cognate', soundCorrespondences: [{ protoSound: '*f', descendantSound: 'f' }, { protoSound: '*i', descendantSound: 'ɪ' }, { protoSound: '*sk', descendantSound: 'ʃ' }], lexicalEntryId: 'le_eng_fish' },
          { languageId: 'gothic', language: 'Gothic', word: 'fisks', ipa: 'fisks', relation: 'cognate', soundCorrespondences: [{ protoSound: '*f', descendantSound: 'f' }, { protoSound: '*i', descendantSound: 'i' }, { protoSound: '*sk', descendantSound: 'sk' }], lexicalEntryId: 'le_got_fisks' },
        ],
        semanticField: 'animals', reconstructionMethod: 'comparative', status: 'established', proposedBy: 'Scholarly Consensus', dateProposed: '1900-01-01',
      }
    ];

    // Example cognate sets
    this.cognateSets = [
      {
        id: 'cs_water_ie', concept: 'water', protoReconstructionId: 'pr_pie_wodr', confidenceScore: 0.9, createdAt: '2023-01-01',
        members: [
          { languageId: 'english', lexicalEntryId: 'le_eng_water', wordForm: 'water', ipa: 'ˈwɔːtər' },
          { languageId: 'gothic', lexicalEntryId: 'le_got_wato', wordForm: 'wato', ipa: 'ˈwɑːtoː' },
          // { languageId: 'sanskrit', lexicalEntryId: 'le_san_udán', wordForm: 'udán', ipa: 'uˈdán', notes: 'From zero-grade PIE.' }, // Assuming this exists as lexical entry for 'udán'
        ],
        analysisNotes: 'Classic Germanic/Indic cognate set for water.',
      },
      {
        id: 'cs_father_ie', concept: 'father', protoReconstructionId: 'pr_pie_pater', confidenceScore: 0.98, createdAt: '2023-01-01',
        members: [
          { languageId: 'english', lexicalEntryId: 'le_eng_father', wordForm: 'father', ipa: 'ˈfɑːðər' },
          { languageId: 'latin', lexicalEntryId: 'le_lat_pater', wordForm: 'pater', ipa: 'ˈpa.tɛr' },
          { languageId: 'sanskrit', lexicalEntryId: 'le_san_pitar', wordForm: 'pitár', ipa: 'pɪˈtár' },
        ],
        analysisNotes: 'Well-established PIE cognate set for father.',
      },
      {
        id: 'cs_aqua_romance', concept: 'water', confidenceScore: 0.99, createdAt: '2023-01-01',
        members: [
          { languageId: 'latin', lexicalEntryId: 'le_lat_aqua', wordForm: 'aqua', ipa: 'ˈakʷa' },
          { languageId: 'spanish', lexicalEntryId: 'le_spa_agua', wordForm: 'agua', ipa: 'ˈaɣwa' },
        ],
        analysisNotes: 'Clear Romance cognate set from Latin aqua.',
      }
    ];

    // Example Sound Correspondence Rules
    this.soundCorrespondenceRules = [
      {
        id: 'grimm-p-f', protoSound: '*p', descendantSound: 'f', context: '#_', environment: 'initial', languageId: 'gothic', appliesTo: 'consonant', confidence: 0.99, source: 'Grimm\'s Law', priority: 10, proposedBy: 'Scholarly Consensus',
        examples: [
          { protoWord: '*ph₂tḗr', descendantWord: 'father' }, // English for illustration, Gothic would be 'fadar'
          // { protoWord: '*pék̑us', descendantWord: 'fiu' }, // Gothic for 'cattle, property'
        ]
      },
      {
        id: 'grimm-t-th', protoSound: '*t', descendantSound: 'þ', context: '#_', environment: 'initial', languageId: 'gothic', appliesTo: 'consonant', confidence: 0.99, source: 'Grimm\'s Law', priority: 10, proposedBy: 'Scholarly Consensus',
        examples: [{ protoWord: '*tréyes', descendantWord: 'þreis' }] // Gothic for 'three'
      },
      {
        id: 'h2-a-latin', protoSound: '*H₂', descendantSound: 'a', context: '/_C', environment: 'all', languageId: 'latin', appliesTo: 'vowel', confidence: 0.95, notes: 'Laryngeal coloring of adjacent vowel.', priority: 5, proposedBy: 'Scholarly Consensus',
        examples: [{ protoWord: '*ph₂tḗr', descendantWord: 'pater' }]
      }
    ];

    // Example User Projects
    this.userProjects = [
      {
        id: 'proj_global_recon', name: 'Global PIE Reconstruction', description: 'A collaborative project to reconstruct Proto-Indo-European vocabulary.',
        ownerId: 'admin_eve', createdAt: '2023-01-01', lastModified: '2024-01-01',
        reconstructions: ['pr_pie_wodr', 'pr_pie_pater'],
        savedCognateSets: ['cs_water_ie', 'cs_father_ie'],
        customRules: ['grimm-p-f', 'grimm-t-th', 'h2-a-latin'],
        collaborators: ['usr_alice', 'usr_bob', 'agent_recon_alpha'],
        visibility: 'public',
        tags: ['PIE', 'reconstruction', 'comparative'],
        governancePolicyId: 'policy_recon_standards',
      },
      {
        id: 'proj_romance_evolution', name: 'Romance Language Evolution', description: 'Tracing lexical and phonological changes from Latin to Romance languages.',
        ownerId: 'usr_alice', createdAt: '2023-02-10', lastModified: '2023-11-15',
        reconstructions: [],
        savedCognateSets: ['cs_aqua_romance'],
        customRules: [],
        visibility: 'shared',
        tags: ['Romance', 'Latin', 'sound change'],
      }
    ];

    // Example Governance Policies
    this.governancePolicies = [
      {
        id: 'policy_recon_standards', name: 'Reconstruction Confidence Threshold', description: 'Ensures all proposed reconstructions meet a minimum confidence score.',
        rules: [
          { target: 'reconstruction', condition: 'reconstruction.confidence < 0.7', action: 'require_review', severity: 'high' },
          { target: 'reconstruction', condition: 'reconstruction.descendantEvidence.length < 3', action: 'flag', severity: 'medium' },
          { target: 'agent_action', condition: 'agent_action.type == "ProtoWordReconstruction" && agent_action.output.confidence < 0.7', action: 'auto_remediate', severity: 'high' }
        ],
        active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enforcedBy: 'agent_governor',
      },
      {
        id: 'policy_data_integrity', name: 'Lexical Entry Data Integrity', description: 'Ensures lexical entries are complete and well-formed.',
        rules: [
          { target: 'lexicalEntry', condition: '!lexicalEntry.ipa || !lexicalEntry.meaning', action: 'block', severity: 'critical' },
          { target: 'lexicalEntry', condition: '!lexicalEntry.etymology', action: 'flag', severity: 'low' },
        ],
        active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), enforcedBy: 'agent_governor',
      },
    ];

    // Example tasks and bounties
    const taskId1 = generateUniqueId();
    const taskId2 = generateUniqueId();
    const taskId3 = generateUniqueId();
    this.linguisticTasks = [
      {
        id: taskId1, projectId: 'proj_global_recon', type: 'ProtoWordReconstruction', description: 'Reconstruct PIE for "star" based on provided cognates.',
        status: LinguisticTaskStatus.Pending, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: 'high',
        parameters: { cognateSetId: 'cs_star_ie' }, // hypothetical cognate set, will fail in simulation
        audits: [], riskScore: 0.7,
      },
      {
        id: taskId2, projectId: 'proj_global_recon', type: 'SoundLawDetection', description: 'Detect sound laws for Proto-Germanic *d to Old English.',
        status: LinguisticTaskStatus.Assigned, assignedToIdentityId: 'agent_lfa_001', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: 'medium',
        parameters: { protoLanguage: 'Proto-Germanic', descendantLanguage: 'Old English', specificSound: '*d' },
        audits: [], riskScore: 0.5,
      },
      {
        id: taskId3, projectId: 'proj_validation', type: 'DataValidation', description: 'Validate consistency of Sanskrit lexical entries.',
        status: LinguisticTaskStatus.InProgress, assignedToIdentityId: 'usr_alice', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: 'low',
        parameters: { languageId: 'sanskrit', scope: 'lexicalEntries' },
        audits: [], riskScore: 0.2,
      }
    ];
    this.linguisticBounties = [
      {
        id: generateUniqueId(), taskId: taskId1, amount: 100, tokenType: 'LINGUIST_COIN', status: 'funded', fundedBy: 'admin_eve', fundedAt: new Date().toISOString(),
      },
      {
        id: generateUniqueId(), taskId: taskId2, amount: 200, tokenType: 'LINGUIST_COIN', status: 'funded', fundedBy: 'admin_eve', fundedAt: new Date().toISOString(),
      }
    ];

    // Initial audit log entry
    this.addAuditLogEntry('system', 'SYSTEM_INIT', 'LinguisticDataRepository', 'N/A', 'Repository initialized with dummy data.', 'initial_payload_hash');
  }

  // --- CRUD and Query Methods ---

  /**
   * Adds an audit log entry, ensuring tamper-evidence and policy enforcement.
   * Business value: Guarantees full traceability and integrity of all operations,
   * critical for compliance, security, and establishing an undeniable history of data changes.
   * This is a core component for financial-grade auditing and regulatory adherence.
   */
  public addAuditLogEntry(
    actorIdentityId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: string,
    payload: any,
    transactionId?: string,
    policyViolations?: LinguisticAuditLogEntry['policyViolation']
  ): LinguisticAuditLogEntry {
    const previousEntryHash = this.linguisticAuditLog.length > 0
      ? this.linguisticAuditLog[this.linguisticAuditLog.length - 1].payloadHash
      : 'genesis_hash';

    const newEntry: LinguisticAuditLogEntry = {
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
      actorIdentityId,
      action,
      resourceType,
      resourceId,
      details,
      payloadHash: hashData(JSON.stringify(payload) + previousEntryHash), // Chain the hash
      transactionId,
      previousEntryHash,
      policyViolation,
    };
    this.linguisticAuditLog.push(newEntry);
    console.log(`Audit Log: ${newEntry.action} by ${newEntry.actorIdentityId} on ${newEntry.resourceType}:${newEntry.resourceId}`);
    return newEntry;
  }

  /**
   * Adds a contribution record, chaining it to the previous one for integrity.
   * Business value: Establishes a permanent, verifiable record of all user and agent contributions,
   * essential for intellectual property, reputation management, and auditability. This also supports
   * a tokenized incentive system by proving contribution.
   */
  private addContributionRecord(
    identityId: string,
    dataType: LinguisticContribution['dataType'],
    dataId: string,
    action: LinguisticContribution['action'],
    details: any,
    signature: string
  ): LinguisticContribution {
    const previousContributionHash = this.linguisticContributions.length > 0
      ? hashData(JSON.stringify(this.linguisticContributions[this.linguisticContributions.length - 1]))
      : 'genesis_contribution_hash';

    const contribution: LinguisticContribution = {
      id: generateUniqueId(),
      identityId,
      dataType,
      dataId,
      action,
      timestamp: new Date().toISOString(),
      details,
      signature,
      previousContributionHash,
    };
    this.linguisticContributions.push(contribution);
    return contribution;
  }

  public getLanguages(): Language[] { return this.languages; }
  public getLanguageById(id: string): Language | undefined { return this.languages.find(l => l.id === id); }
  public getLexicalEntries(languageId?: string): LexicalEntry[] {
    return languageId ? this.lexicalEntries.filter(le => le.languageId === languageId) : this.lexicalEntries;
  }
  public getLexicalEntryById(id: string): LexicalEntry | undefined { return this.lexicalEntries.find(le => le.id === id); }
  public getReconstructions(): Reconstruction[] { return this.reconstructions; }
  public getReconstructionById(id: string): Reconstruction | undefined { return this.reconstructions.find(r => r.id === id); }
  public getCognateSets(): CognateSet[] { return this.cognateSets; }
  public getCognateSetById(id: string): CognateSet | undefined { return this.cognateSets.find(cs => cs.id === id); }
  public getSoundCorrespondenceRules(languageId?: string): SoundCorrespondenceRule[] {
    return languageId ? this.soundCorrespondenceRules.filter(r => r.languageId === languageId) : this.soundCorrespondenceRules;
  }
  public getSoundCorrespondenceRuleById(id: string): SoundCorrespondenceRule | undefined { return this.soundCorrespondenceRules.find(r => r.id === id); }
  public getLinguisticTasks(projectId?: string): LinguisticTask[] {
    return projectId ? this.linguisticTasks.filter(t => t.projectId === projectId) : this.linguisticTasks;
  }
  public getLinguisticTaskById(id: string): LinguisticTask | undefined { return this.linguisticTasks.find(t => t.id === id); }
  public getLinguisticBounties(taskId?: string): LinguisticBounty[] {
    return taskId ? this.linguisticBounties.filter(b => b.taskId === taskId) : this.linguisticBounties;
  }
  public getLinguisticBountyById(id: string): LinguisticBounty | undefined { return this.linguisticBounties.find(b => b.id === id); }
  public getIdentities(): DigitalIdentity[] { return this.identities; }
  public getIdentityById(id: string): DigitalIdentity | undefined { return this.identities.find(i => i.id === id); }
  public getSkills(): LinguisticSkill[] { return this.skills; }
  public getSkillById(id: string): LinguisticSkill | undefined { return this.skills.find(s => s.id === id); }
  public getAuditLog(): LinguisticAuditLogEntry[] { return this.linguisticAuditLog; }
  public getContributions(): LinguisticContribution[] { return this.linguisticContributions; }
  public getUserProjects(ownerId?: string): UserProject[] { return ownerId ? this.userProjects.filter(p => p.ownerId === ownerId) : this.userProjects; }
  public getUserProjectById(id: string): UserProject | undefined { return this.userProjects.find(p => p.id === id); }
  public getGovernancePolicies(): GovernancePolicy[] { return this.governancePolicies; }
  public getGovernancePolicyById(id: string): GovernancePolicy | undefined { return this.governancePolicies.find(p => p.id === id); }


  /**
   * Adds or updates a language entry, enforcing digital identity and cryptographic signature.
   * Business value: Maintains a validated and auditable registry of linguistic systems,
   * foundational for all comparative analyses and ensuring the integrity of linguistic metadata.
   */
  public addOrUpdateLanguage(language: Language, identity: DigitalIdentity, signature: string): Language | null {
    if (!verifySignature(JSON.stringify(language), signature, identity.publicKey)) {
      console.error('Signature verification failed for language.');
      return null;
    }
    const existingIndex = this.languages.findIndex(l => l.id === language.id);
    const now = new Date().toISOString();
    const newLanguage = { ...language, lastUpdated: now, relatedLanguages: language.relatedLanguages || [] }; // Ensure relatedLanguages is array

    if (existingIndex > -1) {
      this.languages[existingIndex] = newLanguage;
      this.addAuditLogEntry(identity.id, 'UPDATE_LANGUAGE', 'Language', newLanguage.id, `Updated language: ${newLanguage.name}`, newLanguage);
    } else {
      newLanguage.id = newLanguage.id || generateUniqueId();
      this.languages.push(newLanguage);
      this.addAuditLogEntry(identity.id, 'CREATE_LANGUAGE', 'Language', newLanguage.id, `Created new language: ${newLanguage.name}`, newLanguage);
    }
    this.addContributionRecord(identity.id, 'language', newLanguage.id, existingIndex > -1 ? 'update' : 'create', newLanguage, signature);
    return newLanguage;
  }

  /**
   * Adds or updates a lexical entry. Requires identity and signature.
   * Business value: Ensures all changes to fundamental linguistic data are properly attributed and secured,
   * maintaining data integrity and allowing for robust versioning and conflict resolution. This is vital
   * for maintaining a high-quality data asset that can be licensed and leveraged by AI.
   */
  public addOrUpdateLexicalEntry(entry: LexicalEntry, identity: DigitalIdentity, signature: string): LexicalEntry | null {
    if (!verifySignature(JSON.stringify(entry), signature, identity.publicKey)) {
      console.error('Signature verification failed for lexical entry.');
      return null;
    }

    const existingIndex = this.lexicalEntries.findIndex(le => le.id === entry.id);
    const now = new Date().toISOString();
    const newEntry = { ...entry, lastUpdated: now };

    if (existingIndex > -1) {
      this.lexicalEntries[existingIndex] = newEntry;
      this.addAuditLogEntry(identity.id, 'UPDATE_LEXICAL_ENTRY', 'LexicalEntry', newEntry.id, `Updated lexical entry: ${newEntry.word}`, newEntry);
    } else {
      newEntry.id = newEntry.id || generateUniqueId();
      newEntry.dateAdded = now;
      this.lexicalEntries.push(newEntry);
      this.addAuditLogEntry(identity.id, 'CREATE_LEXICAL_ENTRY', 'LexicalEntry', newEntry.id, `Created new lexical entry: ${newEntry.word}`, newEntry);
    }
    this.addContributionRecord(identity.id, 'lexicalEntry', newEntry.id, existingIndex > -1 ? 'update' : 'create', newEntry, signature);
    return newEntry;
  }

  /**
   * Adds or updates a reconstruction, validating against a digital identity and signature.
   * Business value: Manages the platform's core intellectual output – reconstructed proto-words.
   * Cryptographic attribution and versioning ensure the integrity and provenance of these high-value
   * scientific findings, making them trustworthy assets for future research and commercial applications.
   */
  public addOrUpdateReconstruction(recon: Reconstruction, identity: DigitalIdentity, signature: string): Reconstruction | null {
    if (!verifySignature(JSON.stringify(recon), signature, identity.publicKey)) {
      console.error('Signature verification failed for reconstruction.');
      return null;
    }
    const existingIndex = this.reconstructions.findIndex(r => r.id === recon.id);
    const now = new Date().toISOString();
    const newRecon = { ...recon, lastUpdated: now, reconstructionHistory: [...(recon.reconstructionHistory || []), { date: now, event: existingIndex > -1 ? 'Updated' : 'Created', user: identity.name }] };

    if (existingIndex > -1) {
      this.reconstructions[existingIndex] = newRecon;
      this.addAuditLogEntry(identity.id, 'UPDATE_RECONSTRUCTION', 'Reconstruction', newRecon.id, `Updated reconstruction: ${newRecon.protoWord}`, newRecon);
    } else {
      newRecon.id = newRecon.id || generateUniqueId();
      this.reconstructions.push(newRecon);
      this.addAuditLogEntry(identity.id, 'CREATE_RECONSTRUCTION', 'Reconstruction', newRecon.id, `Created new reconstruction: ${newRecon.protoWord}`, newRecon);
    }
    this.addContributionRecord(identity.id, 'reconstruction', newRecon.id, existingIndex > -1 ? 'update' : 'create', newRecon, signature);
    return newRecon;
  }

  /**
   * Adds or updates a cognate set, authenticated by digital identity and signature.
   * Business value: Centralizes and validates groups of cognate words, streamlining the
   * comparative method and providing curated inputs for AI-driven reconstruction.
   * This enhances data quality and accelerates the initial phase of linguistic analysis.
   */
  public addOrUpdateCognateSet(cognateSet: CognateSet, identity: DigitalIdentity, signature: string): CognateSet | null {
    if (!verifySignature(JSON.stringify(cognateSet), signature, identity.publicKey)) {
      console.error('Signature verification failed for cognate set.');
      return null;
    }
    const existingIndex = this.cognateSets.findIndex(cs => cs.id === cognateSet.id);
    const now = new Date().toISOString();
    const newCognateSet = { ...cognateSet, lastUpdated: now };

    if (existingIndex > -1) {
      this.cognateSets[existingIndex] = newCognateSet;
      this.addAuditLogEntry(identity.id, 'UPDATE_COGNATE_SET', 'CognateSet', newCognateSet.id, `Updated cognate set for: ${newCognateSet.concept}`, newCognateSet);
    } else {
      newCognateSet.id = newCognateSet.id || generateUniqueId();
      newCognateSet.createdAt = now;
      this.cognateSets.push(newCognateSet);
      this.addAuditLogEntry(identity.id, 'CREATE_COGNATE_SET', 'CognateSet', newCognateSet.id, `Created new cognate set for: ${newCognateSet.concept}`, newCognateSet);
    }
    this.addContributionRecord(identity.id, 'cognateSet', newCognateSet.id, existingIndex > -1 ? 'update' : 'create', newCognateSet, signature);
    return newCognateSet;
  }

  /**
   * Adds or updates a sound correspondence rule, secured by identity and signature.
   * Business value: Manages the programmable rules that define linguistic transformations,
   * enabling the creation of custom, high-precision sound law engines. This empowers
   * researchers and agents to encode and apply historical linguistic insights systematically.
   */
  public addOrUpdateSoundCorrespondenceRule(rule: SoundCorrespondenceRule, identity: DigitalIdentity, signature: string): SoundCorrespondenceRule | null {
    if (!verifySignature(JSON.stringify(rule), signature, identity.publicKey)) {
      console.error('Signature verification failed for sound correspondence rule.');
      return null;
    }
    const existingIndex = this.soundCorrespondenceRules.findIndex(r => r.id === rule.id);
    const now = new Date().toISOString();
    const newRule = { ...rule, dateEstablished: rule.dateEstablished || now, proposedBy: rule.proposedBy || identity.id };

    if (existingIndex > -1) {
      this.soundCorrespondenceRules[existingIndex] = newRule;
      this.addAuditLogEntry(identity.id, 'UPDATE_SOUND_RULE', 'SoundCorrespondenceRule', newRule.id, `Updated rule: ${newRule.protoSound} > ${newRule.descendantSound}`, newRule);
    } else {
      newRule.id = newRule.id || generateUniqueId();
      this.soundCorrespondenceRules.push(newRule);
      this.addAuditLogEntry(identity.id, 'CREATE_SOUND_RULE', 'SoundCorrespondenceRule', newRule.id, `Created new rule: ${newRule.protoSound} > ${newRule.descendantSound}`, newRule);
    }
    this.addContributionRecord(identity.id, 'rule', newRule.id, existingIndex > -1 ? 'update' : 'create', newRule, signature);
    return newRule;
  }

  /**
   * Adds or updates a user project, ensuring secure attribution.
   * Business value: Enables centralized management of research projects, facilitating
   * team collaboration, data sharing, and the application of governance policies.
   * This structured project management enhances productivity and oversight.
   */
  public addOrUpdateUserProject(project: UserProject, identity: DigitalIdentity, signature: string): UserProject | null {
    if (!verifySignature(JSON.stringify(project), signature, identity.publicKey)) {
      console.error('Signature verification failed for user project.');
      return null;
    }
    const existingIndex = this.userProjects.findIndex(p => p.id === project.id);
    const now = new Date().toISOString();
    const newProject = { ...project, lastModified: now };

    if (existingIndex > -1) {
      this.userProjects[existingIndex] = newProject;
      this.addAuditLogEntry(identity.id, 'UPDATE_USER_PROJECT', 'UserProject', newProject.id, `Updated project: ${newProject.name}`, newProject);
    } else {
      newProject.id = newProject.id || generateUniqueId();
      newProject.createdAt = now;
      this.userProjects.push(newProject);
      this.addAuditLogEntry(identity.id, 'CREATE_USER_PROJECT', 'UserProject', newProject.id, `Created new project: ${newProject.name}`, newProject);
    }
    this.addContributionRecord(identity.id, 'project', newProject.id, existingIndex > -1 ? 'update' : 'create', newProject, signature);
    return newProject;
  }

  /**
   * Creates a new linguistic task.
   * Business value: Formalizes the research workflow, allowing for structured assignment, tracking,
   * and potential monetization (via bounties) of linguistic problems. This drives efficient
   * resource allocation and accelerates scientific discovery.
   */
  public createLinguisticTask(task: Omit<LinguisticTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'audits'>, creatorId: string): LinguisticTask {
    const now = new Date().toISOString();
    const newTask: LinguisticTask = {
      ...task,
      id: generateUniqueId(),
      createdAt: now,
      updatedAt: now,
      status: LinguisticTaskStatus.Pending,
      audits: [],
      riskScore: task.riskScore || 0.5,
    };
    this.linguisticTasks.push(newTask);
    this.addAuditLogEntry(creatorId, 'CREATE_TASK', 'LinguisticTask', newTask.id, `Created task: ${newTask.description}`, newTask);
    this.addContributionRecord(creatorId, 'task', newTask.id, 'create', newTask, signData(JSON.stringify(newTask), this.getIdentityById(creatorId)?.privateKey || 'unknown_key'));
    return newTask;
  }

  /**
   * Updates a linguistic task.
   * Business value: Enables real-time tracking of task progress and status changes,
   * critical for managing complex research projects and dynamically reallocating resources.
   */
  public updateLinguisticTask(updatedTask: LinguisticTask, updaterId: string, policyViolations?: LinguisticAuditLogEntry['policyViolation']): LinguisticTask | null {
    const index = this.linguisticTasks.findIndex(t => t.id === updatedTask.id);
    if (index === -1) return null;

    updatedTask.updatedAt = new Date().toISOString();
    this.linguisticTasks[index] = updatedTask;
    this.addAuditLogEntry(updaterId, 'UPDATE_TASK', 'LinguisticTask', updatedTask.id, `Updated task: ${updatedTask.description} (Status: ${updatedTask.status})`, updatedTask, undefined, policyViolations);
    this.addContributionRecord(updaterId, 'task', updatedTask.id, 'update', updatedTask, signData(JSON.stringify(updatedTask), this.getIdentityById(updaterId)?.privateKey || 'unknown_key'));
    return updatedTask;
  }

  /**
   * Assigns a linguistic task to an identity.
   * Business value: Formalizes task delegation, ensuring clear accountability and
   * enabling the efficient distribution of work to human experts or AI agents.
   */
  public assignLinguisticTask(taskId: string, assigneeId: string, assignerId: string): LinguisticTask | null {
    const task = this.getLinguisticTaskById(taskId);
    if (!task) return null;
    const assigner = this.getIdentityById(assignerId);
    if (!assigner) { console.error('Assigner identity not found.'); return null; }

    task.assignedToIdentityId = assigneeId;
    task.status = LinguisticTaskStatus.Assigned;
    const updatedTask = this.updateLinguisticTask(task, assignerId);
    this.addContributionRecord(assignerId, 'task', task.id, 'assign', { taskId, assigneeId }, signData(JSON.stringify({ taskId, assigneeId }), assigner.privateKey));
    return updatedTask;
  }

  /**
   * Adds a linguistic bounty.
   * Business value: Directly links research tasks to funding mechanisms,
   * enabling a tokenized economy for linguistic research and incentivizing contributions.
   * This opens new funding avenues and accelerates problem-solving.
   */
  public addLinguisticBounty(bounty: Omit<LinguisticBounty, 'id' | 'status' | 'fundedAt'>, funderId: string): LinguisticBounty {
    const now = new Date().toISOString();
    const newBounty: LinguisticBounty = {
      ...bounty,
      id: generateUniqueId(),
      status: 'funded',
      fundedBy: funderId,
      fundedAt: now,
    };
    this.linguisticBounties.push(newBounty);
    this.addAuditLogEntry(funderId, 'FUND_BOUNTY', 'LinguisticBounty', newBounty.id, `Funded bounty for task ${newBounty.taskId} with ${newBounty.amount} ${newBounty.tokenType}`, newBounty);
    this.addContributionRecord(funderId, 'task', newBounty.taskId, 'fund', newBounty, signData(JSON.stringify(newBounty), this.getIdentityById(funderId)?.privateKey || 'unknown_key'));
    return newBounty;
  }

  /**
   * Claims a linguistic bounty after task completion.
   * Business value: Facilitates the secure and transparent payout of rewards,
   * fostering trust in the platform's token rails and encouraging further participation.
   * This is a critical settlement operation within the financial infrastructure.
   */
  public claimLinguisticBounty(bountyId: string, claimantId: string, transactionId: string, proof: string): LinguisticBounty | null {
    const bounty = this.getLinguisticBountyById(bountyId);
    if (!bounty || bounty.status !== 'funded') return null;

    bounty.status = 'claimed';
    bounty.claimedBy = claimantId;
    bounty.claimedAt = new Date().toISOString();
    bounty.payoutTransactionId = transactionId;
    bounty.proofOfCompletion = proof;

    this.addAuditLogEntry(claimantId, 'CLAIM_BOUNTY', 'LinguisticBounty', bounty.id, `Claimed bounty for task ${bounty.taskId}`, bounty, transactionId);
    this.addContributionRecord(claimantId, 'task', bounty.taskId, 'claim', bounty, signData(JSON.stringify(bounty), this.getIdentityById(claimantId)?.privateKey || 'unknown_key'));
    return bounty;
  }

  /**
   * Registers a new digital identity in the system.
   * Business value: Enables secure onboarding of users and AI agents, establishing their roles and permissions,
   * and providing the foundation for role-based access control and auditable actions across the platform.
   * This is the core of the digital identity and trust layer.
   */
  public registerIdentity(name: string, publicKey: string, privateKey: string, roles: DigitalIdentity['roles']): DigitalIdentity {
    const newIdentity: DigitalIdentity = {
      id: `id_${generateUniqueId()}`,
      name,
      publicKey,
      privateKey,
      roles,
      reputationScore: 0.5,
      lastActive: new Date().toISOString(),
    };
    this.identities.push(newIdentity);
    this.addAuditLogEntry('system', 'REGISTER_IDENTITY', 'DigitalIdentity', newIdentity.id, `New identity registered: ${name}`, newIdentity);
    this.addContributionRecord('system', 'identity', newIdentity.id, 'create', newIdentity, 'system_signature'); // System generated, no user private key
    return newIdentity;
  }

  public getIdentityRoles(identityId: string): string[] | undefined {
    return this.getIdentityById(identityId)?.roles;
  }

  /**
   * Checks if an identity has the required permissions (roles).
   * Business value: Enforces robust role-based access control, securing sensitive operations and data,
   * and ensuring that only authorized entities can perform specific actions. This is critical for
   * preventing unauthorized access and maintaining system integrity in a financial-grade platform.
   */
  public hasPermission(identityId: string, requiredRoles: string[]): boolean {
    const identity = this.getIdentityById(identityId);
    if (!identity) return false;
    return requiredRoles.some(role => identity.roles.includes(role as any));
  }

  /**
   * Retrieves active governance policies relevant to a specific resource type.
   * Business value: Provides dynamic policy enforcement, allowing agents and human operators
   * to apply the correct governance rules at the point of action, ensuring ongoing compliance.
   */
  public getActiveGovernancePolicies(target: GovernancePolicy['rules'][number]['target']): GovernancePolicy[] {
    return this.governancePolicies.filter(p => p.active && p.rules.some(r => r.target === target));
  }

  /**
   * Deletes a lexical entry.
   * Business value: Provides data lifecycle management capabilities, ensuring that
   * obsolete or erroneous data can be removed while maintaining a full audit trail.
   */
  public deleteLexicalEntry(id: string, identity: DigitalIdentity, signature: string): boolean {
    if (!verifySignature(id, signature, identity.publicKey)) { // Simpler signature for delete for now
      console.error('Signature verification failed for deleting lexical entry.');
      return false;
    }
    const index = this.lexicalEntries.findIndex(le => le.id === id);
    if (index === -1) return false;

    const deletedEntry = this.lexicalEntries.splice(index, 1);
    this.addAuditLogEntry(identity.id, 'DELETE_LEXICAL_ENTRY', 'LexicalEntry', id, `Deleted lexical entry: ${deletedEntry[0].word}`, deletedEntry[0]);
    this.addContributionRecord(identity.id, 'lexicalEntry', id, 'delete', { id }, signature);
    return true;
  }
}

/**
 * Singleton instance of the data repository to simulate a global database.
 * Business value: Centralized, consistent data access across the application,
 * ensuring all components operate on the same, auditable source of truth.
 * This global, high-performance data store is indispensable for a scalable financial infrastructure.
 */
export const linguisticDataRepository = new LinguisticDataRepository();


# --- Agentic AI System Simulation (Conceptual) ---

/**
 * Simulates an internal messaging layer for secure, auditable agent-to-agent and agent-to-system communication.
 * Business value: Ensures reliable and secure communication between autonomous agents,
 * critical for coordinated operations and complex workflows. The auditable nature provides
 * forensic capabilities for all internal system interactions, vital for compliance and debugging.
 */
export interface AgentMessage {
  id: string;
  senderId: string;
  recipientId: string | 'system' | 'all';
  type: 'task_assigned' | 'task_status_update' | 'request_skill' | 'skill_output' | 'policy_alert' | 'remediation_request' | 'governance_report';
  payload: any;
  timestamp: string;
  signature: string; // Sender's signature
}

/**
 * Simulates an Agentic AI system specifically for linguistic tasks.
 * Business value: Automates complex comparative linguistic analysis, dramatically accelerating research cycles.
 * Enables the deployment of specialized AI agents that monitor, decide, and act on linguistic data,
 * unlocking new insights and reducing human effort in data processing and reconstruction,
 * driving significant cost savings and revenue opportunities.
 */
export class LinguisticAgentCoordinator {
  private repository: LinguisticDataRepository;
  private _internalMessageBus: AgentMessage[] = []; // Simulate a secure, internal message bus

  /**
   * Initializes the LinguisticAgentCoordinator with a reference to the data repository.
   * Business value: Connects the AI orchestration layer to the single source of truth,
   * enabling agents to interact with and modify linguistic data in a controlled and auditable manner.
   */
  constructor(repository: LinguisticDataRepository) {
    this.repository = repository;
  }

  /**
   * Sends a message through the internal agent message bus.
   * Business value: Provides a secure and auditable channel for inter-agent communication,
   * ensuring all decisions and data exchanges are recorded and verifiable.
   */
  private sendAgentMessage(sender: DigitalIdentity, recipientId: string | 'system' | 'all', type: AgentMessage['type'], payload: any): void {
    const message: AgentMessage = {
      id: generateUniqueId(),
      senderId: sender.id,
      recipientId,
      type,
      payload,
      timestamp: new Date().toISOString(),
      signature: signData(JSON.stringify(payload), sender.privateKey),
    };
    this._internalMessageBus.push(message);
    console.log(`Agent Message (${type}): From ${sender.name} to ${recipientId} - ${JSON.stringify(payload).substring(0, 50)}...`);
    this.repository.addAuditLogEntry(sender.id, `AGENT_MESSAGE_${type.toUpperCase()}`, 'AgentMessage', message.id, `Sent message to ${recipientId}`, message);
  }

  /**
   * Simulates an agent processing a linguistic task.
   * Business value: Demonstrates autonomous task execution, showing how AI agents
   * can independently perform complex operations, from data collection to final output,
   * providing a scalable and efficient research workforce that generates high-value data.
   * Emphasizes idempotent transactions and security.
   */
  public async processLinguisticTask(taskId: string, agentIdentityId: string): Promise<LinguisticTask | null> {
    const agent = this.repository.getIdentityById(agentIdentityId);
    if (!agent || !agent.roles.includes('agent')) {
      console.error('Only agents can process tasks.');
      return null;
    }
    if (!this.repository.hasPermission(agentIdentityId, ['agent'])) {
      console.error(`Agent ${agentIdentityId} lacks permission to process tasks.`);
      return null;
    }

    let task = this.repository.getLinguisticTaskById(taskId);
    if (!task || (task.status !== LinguisticTaskStatus.Assigned && task.status !== LinguisticTaskStatus.Remediated) || task.assignedToIdentityId !== agentIdentityId) {
      console.warn(`Task ${taskId} not ready for agent ${agentIdentityId} or not assigned to it.`);
      return null;
    }

    const skill = this.repository.getSkillById(task.type);
    if (!skill) {
      console.error(`Unknown skill type: ${task.type}`);
      task.status = LinguisticTaskStatus.Failed;
      this.repository.updateLinguisticTask(task, agentIdentityId);
      this.sendAgentMessage(agent, 'system', 'task_status_update', { taskId: task.id, status: task.status, reason: 'Unknown skill type' });
      return null;
    }

    this.sendAgentMessage(agent, 'system', 'task_status_update', { taskId: task.id, status: LinguisticTaskStatus.InProgress, description: task.description });
    task.status = LinguisticTaskStatus.InProgress;
    task.audits?.push(this.repository.addAuditLogEntry(agentIdentityId, 'TASK_STATUS_UPDATE', 'LinguisticTask', task.id, `Status changed to InProgress by agent.`, task));
    this.repository.updateLinguisticTask(task, agentIdentityId);

    // Simulate work duration with stochasticity based on skill performance
    const latency = skill.performanceMetrics?.latency || 2000;
    await new Promise(resolve => setTimeout(resolve, latency + Math.random() * 1000));

    let output: any = {};
    let newStatus = LinguisticTaskStatus.Completed;
    let details = 'Task completed successfully.';
    let policyViolations: LinguisticAuditLogEntry['policyViolation'] = [];

    try {
      if (task.type === 'ProtoWordReconstruction') {
        const cognateSet = this.repository.getCognateSetById(task.parameters.cognateSetId);
        if (cognateSet) {
          // Simulate reconstruction logic based on complexity
          const protoWordForm = `*${cognateSet.concept.toUpperCase().replace(/\s/g, '_')}_RECON`;
          const confidence = skill.performanceMetrics?.accuracy ? skill.performanceMetrics.accuracy * (0.8 + Math.random() * 0.2) : 0.8; // Introduce slight variance
          output = {
            protoWord: protoWordForm,
            meaning: cognateSet.concept,
            confidence: confidence,
            descendantEvidence: cognateSet.members.map(m => ({ language: m.languageId, word: m.wordForm })),
          };
          const newRecon: Reconstruction = {
            id: generateUniqueId(),
            protoLanguageId: task.parameters.protoLanguageId || this.repository.getLanguageById('pie')?.id || 'proto_lang_unknown',
            protoWord: protoWordForm,
            meaning: cognateSet.concept,
            ipa: `/${protoWordForm.toLowerCase().replace('*', '').replace(/_/g, '')}/`,
            confidence: confidence,
            descendantEvidence: cognateSet.members.map(m => ({
              languageId: m.languageId,
              language: this.repository.getLanguageById(m.languageId)?.name || m.languageId,
              word: m.wordForm,
              ipa: m.ipa,
              relation: 'cognate',
              soundCorrespondences: [],
            })),
            semanticField: cognateSet.semanticField || 'unknown',
            reconstructionMethod: 'computational',
            status: confidence > 0.8 ? 'established' : 'tentative', // Conditional status
            proposedBy: agent.id,
            dateProposed: new Date().toISOString(),
          };
          const signature = signData(JSON.stringify(newRecon), agent.privateKey);
          this.repository.addOrUpdateReconstruction(newRecon, agent, signature);
          details = `Proposed new reconstruction for "${cognateSet.concept}": ${protoWordForm} with confidence ${confidence.toFixed(2)}`;

          // Apply governance policies
          const policies = this.repository.getActiveGovernancePolicies('reconstruction');
          for (const policy of policies) {
            for (let i = 0; i < policy.rules.length; i++) {
              const rule = policy.rules[i];
              if (rule.target === 'reconstruction' && eval(rule.condition.replace(/reconstruction/g, 'newRecon'))) { // Simplified eval for demo
                policyViolations.push({ policyId: policy.id, ruleIndex: i, reason: `Reconstruction '${rule.condition}' violated.` });
                if (rule.action === 'require_review') {
                  newStatus = LinguisticTaskStatus.Review;
                  details += ' (Requires human review due to policy violation)';
                } else if (rule.action === 'flag') {
                  // Simply flag, task can still complete
                } else if (rule.action === 'auto_remediate') {
                  // Agent should ideally trigger remediation task, for now, just log and flag
                  this.sendAgentMessage(this.repository.getIdentityById('agent_governor')!, agent.id, 'remediation_request', { taskId: task.id, reason: `Policy violation for reconstruction: ${rule.condition}` });
                  details += ' (Auto-remediation triggered by policy)';
                }
              }
            }
          }

        } else {
          newStatus = LinguisticTaskStatus.Failed;
          details = 'Cognate set not found for reconstruction task.';
          policyViolations.push({ policyId: 'system_error', ruleIndex: -1, reason: 'Missing prerequisite data for task.' });
        }
      } else if (task.type === 'SoundLawDetection') {
        const descendantLang = this.repository.getLanguageById(task.parameters.descendantLanguage);
        if (!descendantLang) {
          newStatus = LinguisticTaskStatus.Failed;
          details = `Descendant language ${task.parameters.descendantLanguage} not found.`;
        } else {
          const proposedDescendantSound = Math.random() > 0.5 ? 'f' : 't'; // Simplified
          output = {
            ruleProposed: true,
            protoSound: task.parameters.specificSound,
            descendantSound: proposedDescendantSound,
            confidence: 0.75,
            notes: 'Hypothetical shift identified by AI agent.',
          };
          const newRule: SoundCorrespondenceRule = {
            id: generateUniqueId(),
            protoSound: task.parameters.specificSound,
            descendantSound: proposedDescendantSound,
            context: '/_V',
            environment: 'all',
            languageId: task.parameters.descendantLanguage,
            appliesTo: 'consonant',
            examples: [{ protoWord: '*unknown', descendantWord: `${proposedDescendantSound}oo` }],
            confidence: 0.75,
            notes: 'AI proposed rule.',
            source: `AI Agent ${agent.name}`,
            priority: 50,
            dateEstablished: new Date().toISOString(),
            proposedBy: agent.id,
          };
          const signature = signData(JSON.stringify(newRule), agent.privateKey);
          this.repository.addOrUpdateSoundCorrespondenceRule(newRule, agent, signature);
          details = `Proposed sound law: ${task.parameters.protoLanguage} ${task.parameters.specificSound} > ${task.parameters.descendantLanguage} ${proposedDescendantSound}`;
        }
      } else if (task.type === 'CognateIdentification') {
        // Simulate finding cognates for 'fish'
        const engFish = this.repository.getLexicalEntryById('le_eng_fish');
        const gotFisks = this.repository.getLexicalEntryById('le_got_fisks');
        if (engFish && gotFisks) {
          output = {
            potentialCognates: [{ entry1Id: 'le_eng_fish', entry2Id: 'le_got_fisks', score: 0.9 }],
            notes: 'Identified potential cognates based on phonetic similarity and semantic field.',
          };
          details = 'Identified potential cognates.';
        } else {
          newStatus = LinguisticTaskStatus.Failed;
          details = 'Missing lexical entries for cognate identification simulation.';
        }
      } else if (task.type === 'DataValidation') {
        const langId = task.parameters.languageId;
        const targetLanguage = this.repository.getLanguageById(langId);
        let errors = [];
        if (!targetLanguage) {
          errors.push(`Language ID ${langId} not found.`);
        } else {
          // Simulate validation: e.g., check for missing IPA or meaning in some entries
          const entries = this.repository.getLexicalEntries(langId);
          if (entries.some(e => !e.ipa || !e.meaning)) {
            errors.push('Some lexical entries are missing IPA or meaning fields.');
          }
        }
        output = { validationResult: errors.length === 0 ? 'Passed' : 'Failed', errors: errors };
        if (errors.length > 0) {
          newStatus = LinguisticTaskStatus.Review; // Needs human review for validation errors
          details = 'Data validation identified issues. Needs review.';
          policyViolations.push({ policyId: 'policy_data_integrity', ruleIndex: 0, reason: 'Data validation failed.' });
        } else {
          details = 'Data validation completed successfully.';
        }
      } else if (task.type === 'Remediation') {
        // Example remediation: if a reconstruction task failed, it could be re-queued
        const failedTaskId = task.parameters.failedTaskId;
        let failedTask = this.repository.getLinguisticTaskById(failedTaskId);
        if (failedTask && failedTask.status === LinguisticTaskStatus.Failed) {
          failedTask.status = LinguisticTaskStatus.Pending;
          failedTask.assignedToIdentityId = undefined;
          failedTask.audits?.push(this.repository.addAuditLogEntry(agentIdentityId, 'TASK_REMEDIATED', 'LinguisticTask', failedTask.id, `Task re-queued by remediation agent.`, failedTask));
          this.repository.updateLinguisticTask(failedTask, agentIdentityId);
          output = { remediatedTask: failedTaskId, newStatus: LinguisticTaskStatus.Pending };
          details = `Task ${failedTaskId} successfully re-queued for processing.`;
          newStatus = LinguisticTaskStatus.Completed;
        } else {
          details = `No failed task ${failedTaskId} found for remediation or it's not in failed state.`;
          newStatus = LinguisticTaskStatus.Failed;
        }
      }
    } catch (e: any) {
      newStatus = LinguisticTaskStatus.Failed;
      details = `Task failed during execution: ${e.message}`;
      console.error(`Agent ${agentIdentityId} failed task ${taskId}:`, e);
      policyViolations.push({ policyId: 'system_runtime_error', ruleIndex: -1, reason: `Agent task execution error: ${e.message}` });
    }

    task.status = newStatus;
    task.output = output;
    task.audits?.push(this.repository.addAuditLogEntry(agentIdentityId, 'TASK_STATUS_UPDATE', 'LinguisticTask', task.id, `Status changed to ${newStatus} by agent. Details: ${details}`, task, undefined, policyViolations));
    this.repository.updateLinguisticTask(task, agentIdentityId, policyViolations); // Pass policy violations to update

    this.sendAgentMessage(agent, 'system', 'task_status_update', { taskId: task.id, status: newStatus, details: details, output: output });

    // Payout bounty if task completed
    if (newStatus === LinguisticTaskStatus.Completed) {
      const bounty = this.repository.getLinguisticBounties(task.id).find(b => b.status === 'funded');
      if (bounty) {
        const transactionId = `TX_${generateUniqueId()}`;
        this.repository.claimLinguisticBounty(bounty.id, agentIdentityId, transactionId, hashData(JSON.stringify(output)));
        this.sendAgentMessage(agent, 'system', 'skill_output', { taskId: task.id, message: `Bounty claimed for task ${taskId}. Transaction: ${transactionId}` });
      }
    }

    // Agent's monitoring skill: After completing a task, check if any new tasks are waiting
    this.monitorAndDispatchTasks(); // Immediately check for new work
    return task;
  }

  /**
   * Monitors for new pending tasks and assigns them to available agents.
   * Business value: Implements the "observe -> decide -> act" loop for agentic AI,
   * ensuring continuous, autonomous processing of research tasks and optimal resource utilization.
   * This orchestration layer maximizes the throughput of the entire research platform.
   */
  public async monitorAndDispatchTasks(): Promise<void> {
    const pendingTasks = this.repository.getLinguisticTasks().filter(t => t.status === LinguisticTaskStatus.Pending);
    const availableAgents = this.repository.getIdentities().filter(id =>
      id.roles.includes('agent') && !this.repository.getLinguisticTasks().some(t =>
        t.assignedToIdentityId === id.id && (t.status === LinguisticTaskStatus.Assigned || t.status === LinguisticTaskStatus.InProgress || t.status === LinguisticTaskStatus.Remediated)
      )
    );

    // Sort tasks by priority (critical > high > medium > low), then by creation date
    pendingTasks.sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    for (const task of pendingTasks) {
      if (availableAgents.length > 0) {
        // Find an agent with the required skill, prioritize higher reputation
        const suitableAgents = availableAgents
          .filter(agent => {
            const skill = this.repository.getSkillById(task.type);
            return skill && this.repository.hasPermission(agent.id, skill.requiredPermissions);
          })
          .sort((a, b) => (b.reputationScore || 0) - (a.reputationScore || 0)); // Sort by reputation

        if (suitableAgents.length > 0) {
          const agent = suitableAgents[0]; // Pick best agent
          console.log(`Dispatching task ${task.id} (${task.description}) to agent ${agent.name}.`);
          this.repository.assignLinguisticTask(task.id, agent.id, 'system');
          this.sendAgentMessage(this.repository.getIdentityById('system') || agent, agent.id, 'task_assigned', { taskId: task.id, taskType: task.type });
          // Process task in a non-blocking way
          this.processLinguisticTask(task.id, agent.id);
          availableAgents.splice(availableAgents.indexOf(agent), 1); // Agent is now busy
        } else {
          console.log(`No suitable agent found for task ${task.id} (${task.description}).`);
        }
      } else {
        console.log('No available agents to dispatch pending tasks.');
        break;
      }
    }
    // Also, activate Governance Agent to check logs
    this.runGovernanceCheck();
  }

  /**
   * Simulates a Governance Agent monitoring the audit log for policy violations and initiating remediation.
   * Business value: Actively enforces compliance and data integrity rules, automating oversight and
   * minimizing operational risks. This provides a robust, self-correcting mechanism for the platform.
   */
  public async runGovernanceCheck(): Promise<void> {
    const governorAgent = this.repository.getIdentityById('agent_governor');
    if (!governorAgent || !this.repository.hasPermission(governorAgent.id, ['governor'])) {
      console.warn('Governance Agent not found or lacks permissions.');
      return;
    }

    const auditLog = this.repository.getAuditLog();
    const lastCheckedIndex = auditLog.findIndex(entry => entry.actorIdentityId === governorAgent.id && entry.action === 'GOVERNANCE_CHECK_COMPLETED');
    const newEntries = auditLog.slice(lastCheckedIndex > -1 ? lastCheckedIndex + 1 : 0);

    let violationsFound = false;

    for (const entry of newEntries) {
      if (entry.policyViolation && entry.policyViolation.length > 0) {
        violationsFound = true;
        console.warn(`Governance Agent detected policy violation in audit entry ${entry.id}:`, entry.policyViolation);
        this.sendAgentMessage(governorAgent, 'admin_eve', 'policy_alert', { auditEntryId: entry.id, violations: entry.policyViolation });

        // Example: Auto-remediate if a reconstruction confidence is too low (triggered by rule.action 'auto_remediate')
        entry.policyViolation.forEach(violation => {
          const policy = this.repository.getGovernancePolicyById(violation.policyId);
          if (policy) {
            const rule = policy.rules[violation.ruleIndex];
            if (rule && rule.action === 'auto_remediate') {
              if (rule.target === 'agent_action' && entry.action.includes('TASK_STATUS_UPDATE') && entry.details.includes('Requires human review')) {
                // For a failed reconstruction (confidence too low), create a remediation task
                const concernedTask = this.repository.getLinguisticTaskById(entry.resourceId);
                if (concernedTask && concernedTask.status === LinguisticTaskStatus.Review) {
                  const remediationTask: Omit<LinguisticTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'audits'> = {
                    projectId: concernedTask.projectId,
                    type: 'Remediation',
                    description: `Remediate task ${concernedTask.id}: ${concernedTask.description} (Policy Violation: ${violation.reason})`,
                    parameters: { failedTaskId: concernedTask.id, originalPolicyViolation: violation },
                    priority: 'critical',
                    deadline: new Date(Date.now() + 3600000).toISOString(), // 1 hour
                    riskScore: 0.9, // High risk remediation
                  };
                  this.createLinguisticTask(remediationTask, governorAgent.id);
                  this.sendAgentMessage(governorAgent, 'system', 'remediation_request', { originalTaskId: concernedTask.id, remediationTaskId: remediationTask.id, reason: violation.reason });
                  concernedTask.status = LinguisticTaskStatus.Remediated; // Mark original task as under remediation
                  this.repository.updateLinguisticTask(concernedTask, governorAgent.id);
                }
              }
            }
          }
        });
      }
    }

    if (violationsFound) {
      this.sendAgentMessage(governorAgent, 'system', 'governance_report', { status: 'Violations Detected', count: policyViolations.length });
    } else {
      this.sendAgentMessage(governorAgent, 'system', 'governance_report', { status: 'No Violations Detected' });
    }

    this.repository.addAuditLogEntry(governorAgent.id, 'GOVERNANCE_CHECK_COMPLETED', 'System', 'N/A', 'Periodic governance check completed.', {});
  }

  /**
   * Retrieves the simulated internal message queue for observability.
   * Business value: Provides an transparent view into the internal workings of the agent network,
   * enabling monitoring, debugging, and audit of agent-to-agent communications.
   */
  public getMessageQueue(): AgentMessage[] {
    return this._internalMessageBus;
  }

  /**
   * Creates a new linguistic task via an authenticated agent/user.
   * Business value: Enables secure and attributed task initiation, flowing into the agent orchestration.
   */
  public createLinguisticTask(task: Omit<LinguisticTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'audits'>, creatorIdentityId: string): LinguisticTask | null {
    const creator = this.repository.getIdentityById(creatorIdentityId);
    if (!creator || !this.repository.hasPermission(creatorIdentityId, ['researcher', 'admin', 'agent'])) {
      console.error(`Identity ${creatorIdentityId} lacks permission to create tasks.`);
      return null;
    }
    const newTask = this.repository.createLinguisticTask(task, creatorIdentityId);
    this.sendAgentMessage(creator, 'system', 'task_assigned', { taskId: newTask.id, description: newTask.description });
    return newTask;
  }
}

/**
 * Singleton instance of the Linguistic Agent Coordinator.
 * Business value: Central orchestrator for all AI-driven linguistic research,
 * ensuring seamless execution of autonomous workflows and maximizing the efficiency
 * and impact of computational linguistics. This intelligent automation is a key
 * differentiator for the platform.
 */
export const linguisticAgentCoordinator = new LinguisticAgentCoordinator(linguisticDataRepository);

# --- React Context and Reducer for Linguistic Project State ---

/**
 * Represents the current state of a user's linguistic research project.
 * Business value: Provides a cohesive, real-time view of all project-related data,
 * facilitating user interaction, collaboration, and comprehensive project management.
 * This enhances user experience and productivity in a complex data environment,
 * translating to higher user engagement and faster research outcomes.
 */
export interface LinguisticProjectState {
  currentProjectId: string | null;
  selectedLanguageId: string | null;
  selectedLexicalEntryId: string | null;
  selectedReconstructionId: string | null;
  selectedCognateSetId: string | null;
  tasks: LinguisticTask[];
  bounties: LinguisticBounty[];
  auditLog: LinguisticAuditLogEntry[];
  messageQueue: AgentMessage[]; // Changed to AgentMessage[]
  identities: DigitalIdentity[];
  skills: LinguisticSkill[];
  userProjects: UserProject[];
}

/**
 * Initial state for the Linguistic Project Context.
 * Business value: Establishes a baseline for the application's operational state,
 * allowing for quick startup and predictable behavior in a high-demand environment.
 */
const initialLinguisticProjectState: LinguisticProjectState = {
  currentProjectId: 'proj_global_recon',
  selectedLanguageId: null,
  selectedLexicalEntryId: null,
  selectedReconstructionId: null,
  selectedCognateSetId: null,
  tasks: [],
  bounties: [],
  auditLog: [],
  messageQueue: [],
  identities: [],
  skills: [],
  userProjects: [],
};

/**
 * Actions for the Linguistic Project Reducer.
 * Business value: Defines a clear contract for state modifications, ensuring predictable
 * data flow and simplified debugging in a complex, real-time user interface.
 */
type LinguisticProjectAction =
  | { type: 'SET_CURRENT_PROJECT'; payload: string }
  | { type: 'SET_SELECTED_LANGUAGE'; payload: string | null }
  | { type: 'SET_SELECTED_LEXICAL_ENTRY'; payload: string | null }
  | { type: 'SET_SELECTED_RECONSTRUCTION'; payload: string | null }
  | { type: 'SET_SELECTED_COGNATE_SET'; payload: string | null }
  | { type: 'LOAD_INITIAL_DATA'; payload: { tasks: LinguisticTask[]; bounties: LinguisticBounty[]; auditLog: LinguisticAuditLogEntry[]; messageQueue: AgentMessage[]; identities: DigitalIdentity[]; skills: LinguisticSkill[]; userProjects: UserProject[]; } }
  | { type: 'ADD_TASK'; payload: LinguisticTask }
  | { type: 'UPDATE_TASK'; payload: LinguisticTask }
  | { type: 'ADD_BOUNTY'; payload: LinguisticBounty }
  | { type: 'UPDATE_BOUNTY'; payload: LinguisticBounty }
  | { type: 'UPDATE_AUDIT_LOG'; payload: LinguisticAuditLogEntry[] }
  | { type: 'UPDATE_MESSAGE_QUEUE'; payload: AgentMessage[] };

/**
 * Reducer function for managing Linguistic Project State.
 * Business value: Provides predictable state management for complex UI interactions,
 * ensuring data consistency and a reliable user experience. It's the engine for dynamic updates
 * as agents and users interact with the linguistic data, critical for real-time responsiveness.
 */
export function linguisticProjectReducer(state: LinguisticProjectState, action: LinguisticProjectAction): LinguisticProjectState {
  switch (action.type) {
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProjectId: action.payload };
    case 'SET_SELECTED_LANGUAGE':
      return { ...state, selectedLanguageId: action.payload };
    case 'SET_SELECTED_LEXICAL_ENTRY':
      return { ...state, selectedLexicalEntryId: action.payload };
    case 'SET_SELECTED_RECONSTRUCTION':
      return { ...state, selectedReconstructionId: action.payload };
    case 'SET_SELECTED_COGNATE_SET':
      return { ...state, selectedCognateSetId: action.payload };
    case 'LOAD_INITIAL_DATA':
      return {
        ...state,
        tasks: action.payload.tasks,
        bounties: action.payload.bounties,
        auditLog: action.payload.auditLog,
        messageQueue: action.payload.messageQueue,
        identities: action.payload.identities,
        skills: action.payload.skills,
        userProjects: action.payload.userProjects,
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(task => task.id === action.payload.id ? action.payload : task) };
    case 'ADD_BOUNTY':
      return { ...state, bounties: [...state.bounties, action.payload] };
    case 'UPDATE_BOUNTY':
      return { ...state, bounties: state.bounties.map(bounty => bounty.id === action.payload.id ? action.payload : bounty) };
    case 'UPDATE_AUDIT_LOG':
      return { ...state, auditLog: action.payload };
    case 'UPDATE_MESSAGE_QUEUE':
      return { ...state, messageQueue: action.payload };
    default:
      return state;
  }
}

/**
 * React Context for the Linguistic Project State.
 * Business value: Enables efficient and predictable state sharing across the UI,
 * decoupling components and simplifying data flow in complex user interfaces,
 * leading to more maintainable and scalable front-end development, ultimately reducing development costs.
 */
export const LinguisticProjectContext = createContext<{
  state: LinguisticProjectState;
  dispatch: React.Dispatch<LinguisticProjectAction>;
}>({
  state: initialLinguisticProjectState,
  dispatch: () => null,
});

/**
 * Custom hook to use the Linguistic Project Context.
 * Business value: Simplifies component logic and promotes code reusability,
 * accelerating UI development and reducing the risk of integration errors.
 */
export const useLinguisticProject = () => useContext(LinguisticProjectContext);

/**
 * Main View Component for the Linguistic Fossil Finder.
 * Business value: Provides an intuitive and powerful user interface for interacting
 * with the advanced linguistic analysis system. It translates complex backend logic
 * into actionable insights and collaborative tools, empowering researchers and
 * accelerating the discovery of linguistic history. This user-centric interface is
 * crucial for market adoption and maximizing the impact of the underlying trillion-dollar infrastructure.
 */
export const LinguisticFossilFinderView: React.FC = () => {
  const [state, dispatch] = useReducer(linguisticProjectReducer, initialLinguisticProjectState);
  const [loading, setLoading] = useState(true);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskType, setNewTaskType] = useState<LinguisticSkill['id']>('ProtoWordReconstruction');
  const [newTaskCognateSetId, setNewTaskCognateSetId] = useState('cs_father_ie');
  const [newTaskProtoLangId, setNewTaskProtoLangId] = useState('pie');

  // Load initial project data and set up continuous monitoring
  useEffect(() => {
    const loadAndMonitorData = async () => {
      const tasks = linguisticDataRepository.getLinguisticTasks(state.currentProjectId || undefined);
      const bounties = linguisticDataRepository.getLinguisticBounties();
      const auditLog = linguisticDataRepository.getAuditLog();
      const messageQueue = linguisticAgentCoordinator.getMessageQueue();
      const identities = linguisticDataRepository.getIdentities();
      const skills = linguisticDataRepository.getSkills();
      const userProjects = linguisticDataRepository.getUserProjects();


      dispatch({ type: 'LOAD_INITIAL_DATA', payload: { tasks, bounties, auditLog, messageQueue, identities, skills, userProjects } });
      setLoading(false);
    };

    loadAndMonitorData();

    // Set up interval for agent to monitor and dispatch tasks (simulation of continuous operation)
    const agentMonitorInterval = setInterval(() => {
      linguisticAgentCoordinator.monitorAndDispatchTasks(); // This also runs governance check
      // Re-fetch all relevant state after agent activity
      const updatedTasks = linguisticDataRepository.getLinguisticTasks(state.currentProjectId || undefined);
      const updatedBounties = linguisticDataRepository.getLinguisticBounties();
      const updatedAuditLog = linguisticDataRepository.getAuditLog();
      const updatedMessageQueue = linguisticAgentCoordinator.getMessageQueue();

      dispatch({ type: 'LOAD_INITIAL_DATA', payload: {
        tasks: updatedTasks,
        bounties: updatedBounties,
        auditLog: updatedAuditLog,
        messageQueue: updatedMessageQueue,
        identities: linguisticDataRepository.getIdentities(), // Ensure identities also refresh, e.g. for lastActive
        skills: linguisticDataRepository.getSkills(),
        userProjects: linguisticDataRepository.getUserProjects(),
      }});

    }, 3000); // Check every 3 seconds for new tasks and agent actions

    return () => clearInterval(agentMonitorInterval);
  }, [state.currentProjectId]);

  const handleCreateTask = () => {
    if (!newTaskDescription || !newTaskType) return;

    const newTask: Omit<LinguisticTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'audits'> = {
      projectId: state.currentProjectId || 'default_project',
      type: newTaskType,
      description: newTaskDescription,
      parameters: {},
      priority: 'medium',
      deadline: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days from now
    };

    if (newTaskType === 'ProtoWordReconstruction') {
      newTask.parameters = { cognateSetId: newTaskCognateSetId, protoLanguageId: newTaskProtoLangId };
      newTask.priority = 'high';
    } else if (newTaskType === 'SoundLawDetection') {
      newTask.parameters = { protoLanguage: newTaskProtoLangId, descendantLanguage: 'english', specificSound: '*p' };
      newTask.priority = 'high';
    } else if (newTaskType === 'CognateIdentification') {
      newTask.parameters = { languages: ['english', 'gothic'], semanticField: 'animals' };
      newTask.priority = 'medium';
    } else if (newTaskType === 'DataValidation') {
      newTask.parameters = { languageId: 'sanskrit', scope: 'lexicalEntries' };
      newTask.priority = 'low';
    }

    const createdTask = linguisticAgentCoordinator.createLinguisticTask(newTask, 'usr_alice'); // Alice creates tasks
    if (createdTask) {
      dispatch({ type: 'ADD_TASK', payload: createdTask });

      // Fund the task with a bounty
      const newBounty: Omit<LinguisticBounty, 'id' | 'status' | 'fundedAt'> = {
        taskId: createdTask.id,
        amount: Math.floor(Math.random() * 100) + 50, // Random bounty amount
        tokenType: 'LINGUIST_COIN',
        fundedBy: 'admin_eve', // Admin funds bounties
      };
      const fundedBounty = linguisticDataRepository.addLinguisticBounty(newBounty, 'admin_eve');
      dispatch({ type: 'ADD_BOUNTY', payload: fundedBounty });

      setNewTaskDescription('');
    }
  };

  const currentProject = state.userProjects.find(p => p.id === state.currentProjectId);
  const cognateSets = linguisticDataRepository.getCognateSets();
  const protoLanguages = linguisticDataRepository.getLanguages().filter(l => l.status === 'reconstructed');

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading Linguistic Data Repository, Agents, and Policies...
      </div>
    );
  }

  // --- Example UI Snippet (for illustration, actual UI would be much richer) ---
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">Linguistic Fossil Finder (Agentic Research Platform)</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Empowering historical linguists with AI-driven reconstruction, auditable collaboration, and tokenized research incentives.
        This platform represents a revolutionary, multi-million-dollar infrastructure leap in digital finance for scientific research.
      </p>

      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Project Overview: {currentProject?.name || state.currentProjectId}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Total Languages:</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{linguisticDataRepository.getLanguages().length}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Total Reconstructions:</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{linguisticDataRepository.getReconstructions().length}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Active Tasks:</h3>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{state.tasks.filter(t => t.status === LinguisticTaskStatus.Assigned || t.status === LinguisticTaskStatus.InProgress || t.status === LinguisticTaskStatus.Remediated).length}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Funded Bounties:</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{state.bounties.filter(b => b.status === 'funded').length}</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Linguistic Agents & Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Active Agents ({state.identities.filter(id => id.roles.includes('agent')).length})</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
              {state.identities.filter(id => id.roles.includes('agent')).map(agent => (
                <li key={agent.id}>{agent.name} (Reputation: {agent.reputationScore?.toFixed(2)}) - Roles: {agent.roles.join(', ')}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Available Skills ({state.skills.length})</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
              {state.skills.map(skill => (
                <li key={skill.id}>{skill.name} (Cost: {skill.costEstimatePerUse?.amount || 'N/A'} {skill.costEstimatePerUse?.tokenType || ''})</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Create New Linguistic Task</h2>
        <div className="flex flex-col space-y-3">
          <input
            type="text"
            placeholder="Task Description (e.g., Reconstruct PIE for 'dog')"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <div className="flex space-x-2">
            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value as LinguisticSkill['id'])}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-grow"
            >
              {state.skills.map(skill => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </select>
            {newTaskType === 'ProtoWordReconstruction' && (
              <>
                <select
                  value={newTaskCognateSetId}
                  onChange={(e) => setNewTaskCognateSetId(e.target.value)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-grow"
                >
                  {cognateSets.map(cs => (
                    <option key={cs.id} value={cs.id}>{cs.concept} ({cs.id})</option>
                  ))}
                </select>
                <select
                  value={newTaskProtoLangId}
                  onChange={(e) => setNewTaskProtoLangId(e.target.value)}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 flex-grow"
                >
                  {protoLanguages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          <button
            onClick={handleCreateTask}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
            disabled={!newTaskDescription || (newTaskType === 'ProtoWordReconstruction' && (!newTaskCognateSetId || !newTaskProtoLangId))}
          >
            Create & Fund New Task
          </button>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Linguistic Tasks & Bounties</h2>
        <div className="space-y-3">
          {state.tasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No active tasks. Create one to get started!</p>
          ) : (
            state.tasks.map(task => {
              const bounty = state.bounties.find(b => b.taskId === task.id);
              const assignee = state.identities.find(id => id.id === task.assignedToIdentityId);
              return (
                <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800">
                  <div className="flex-grow mb-2 sm:mb-0">
                    <p className="font-medium text-lg">{task.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Type: {state.skills.find(s => s.id === task.type)?.name || task.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Status: <span className={`font-semibold ${task.status === LinguisticTaskStatus.Completed ? 'text-green-500' : task.status === LinguisticTaskStatus.Failed ? 'text-red-500' : task.status === LinguisticTaskStatus.Review ? 'text-blue-500' : 'text-yellow-500'}`}>{task.status}</span> (Priority: {task.priority})</p>
                    {assignee && <p className="text-xs text-gray-500 dark:text-gray-400">Assigned To: {assignee.name} ({assignee.roles.includes('agent') ? 'Agent' : 'Human'})</p>}
                    {bounty && <p className="text-sm text-gray-600 dark:text-gray-300">Bounty: <span className="font-semibold text-purple-600 dark:text-purple-400">{bounty.amount} {bounty.tokenType}</span> (Status: {bounty.status})</p>}
                  </div>
                  {task.output && (
                    <div className="mt-2 sm:mt-0 sm:ml-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-md text-xs max-w-sm overflow-x-auto">
                      <p className="font-semibold">Output:</p>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(task.output, null, 2).substring(0, 200)}{JSON.stringify(task.output, null, 2).length > 200 ? '...' : ''}</pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Linguistic Agent Activity Log (Internal Messaging)</h2>
        <div className="h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-2 text-sm font-mono text-gray-800 dark:text-gray-200">
          {state.messageQueue.map((msg, index) => (
            <p key={msg.id || index}>
              <span className="text-gray-400">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>{' '}
              <span className="font-bold text-blue-500">{msg.senderId}</span>{' '}
              <span className="text-green-500">({msg.type})</span> to <span className="font-bold text-purple-500">{msg.recipientId}</span>:{' '}
              {JSON.stringify(msg.payload).substring(0, 100)}...
              {msg.signature && <span className="text-xs text-gray-500 ml-2">(Sig: {msg.signature.substring(0, 16)}...)</span>}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300 mb-4">Global Audit Trail (Tamper-Evident)</h2>
        <div className="h-48 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-2 text-sm font-mono text-gray-800 dark:text-gray-200">
          {state.auditLog.map((entry, index) => (
            <div key={entry.id} className="mb-1 pb-1 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <p><strong>{new Date(entry.timestamp).toLocaleString()}</strong> - <span className="text-blue-500">{entry.actorIdentityId}</span> {entry.action} on <span className="text-green-500">{entry.resourceType}:{entry.resourceId}</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Details: {entry.details}</p>
              {entry.policyViolation && entry.policyViolation.length > 0 && (
                <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                  <strong>Policy Violation(s):</strong>
                  {entry.policyViolation.map((v, i) => (
                    <p key={i}>- {v.reason} (Policy: {v.policyId})</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500">Hash: {entry.payloadHash.substring(0, 16)}... {entry.previousEntryHash && `(Prev: ${entry.previousEntryHash.substring(0, 16)}...)`}</p>
              {entry.transactionId && <p className="text-xs text-purple-400 dark:text-purple-300">Transaction ID: {entry.transactionId}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};