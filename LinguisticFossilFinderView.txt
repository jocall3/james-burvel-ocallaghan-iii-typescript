import React, { useState, useEffect, useCallback, createContext, useContext, useReducer } from 'react';

// --- Global Data Types and Interfaces (Highly Expanded) ---

/**
 * Represents a specific sound or phoneme.
 */
export interface Phoneme {
  symbol: string; // IPA symbol, e.g., 'p', 'b', 'm', 'aː'
  features: {
    manner: 'stop' | 'fricative' | 'affricate' | 'nasal' | 'trill' | 'tap' | 'approximant' | 'vowel';
    place: 'bilabial' | 'labiodental' | 'dental' | 'alveolar' | 'postalveolar' | 'retroflex' | 'palatal' | 'velar' | 'uvular' | 'pharyngeal' | 'glottal';
    voicing: 'voiceless' | 'voiced';
    rounded?: boolean; // For vowels
    height?: 'close' | 'near-close' | 'mid' | 'near-open' | 'open' | 'diphthong'; // For vowels
    backness?: 'front' | 'central' | 'back'; // For vowels
    // Additional features for more granular analysis
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
 * Represents a specific sound correspondence rule between a proto-language and a descendant.
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
  source?: string; // e.g., 'Grimm\'s Law', 'Verner\'s Law'
  priority?: number; // For rule ordering (lower number = higher priority)
  dateEstablished?: string; // When the rule was formulated or confirmed
}

/**
 * Represents a morpheme (minimal meaningful unit).
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
 * Represents a language.
 */
export interface Language {
  id: string;
  name: string;
  isoCode: string; // ISO 639-3 code
  family: string; // E.g., 'Indo-European', 'Uralic'
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
 * A lighter version for display in lists
 */
export interface ReconstructionLite {
  protoWord: string; // The primary proto-word form
  meaning: string;
  confidence: number;
  descendantEvidence: { language: string, word: string }[];
}

/**
 * Represents a reconstructed proto-word or proto-morpheme.
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
  proposedBy?: string; // Scholar or system that proposed it
  dateProposed?: string; // ISO date or year
  alternativeReconstructions?: { protoWord: string, confidence: number, notes?: string }[];
  semanticField: string;
  reconstructionMethod?: 'comparative' | 'internal' | 'computational';
  status?: 'established' | 'controversial' | 'tentative';
  reconstructionHistory?: { date: string, event: string, user?: string }[]; // Log of changes/updates
}

/**
 * Represents a project or workspace for a user.
 */
export interface UserProject {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  lastModified: string;
  reconstructions: string[]; // IDs of reconstructions saved in this project
  savedCognateSets: string[]; // IDs of cognate sets saved
  customRules: string[]; // IDs of custom sound correspondence rules
  collaborators?: string[]; // User IDs of collaborators
  visibility?: 'private' | 'public' | 'shared';
  tags?: string[];
}

/**
 * Represents a set of cognates across languages for a single concept.
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
  proposedBy?: string;
  createdAt: string;
  lastUpdated?: string;
  tags?: string[];
  semanticField?: string;
  visualizedTree?: any; // Placeholder for a tree visualization object
}

/**
 * User settings/preferences for the application.
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

// --- Dummy Data (Extremely Large for Simulation) ---
// This section will be massive to simulate a real database.

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
    phonology: { consonants: [], vowels: [] }, // Simplified for brevity in dummy data
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
    phonology: { consonants: [], vowels: [] }, // Simplified
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
    phonology: { consonants: [], vowels: [] }, // Simplified
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
    description: