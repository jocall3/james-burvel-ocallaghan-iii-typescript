/**
 * KpiRant.interface.ts: Capturing the Unfiltered Voice of KPI Observers
 *
 * This module defines the interface for a "KPI Rant" – a spontaneous, often opinionated,
 * and sometimes humorous commentary related to a specific Key Performance Indicator.
 * It's designed to capture the human element, frustrations, insights, and witty observations
 * that often accompany the cold hard data of KPIs.
 *
 * Business Value & Strategic Intent:
 * - **Humanizing Data**: Provides a channel to express qualitative feedback and sentiment
 *   that complements quantitative KPI values, adding rich context.
 * - **Uncovering Hidden Issues**: Rants can highlight underlying process inefficiencies,
 *   data quality problems, or cultural blockers that might not be immediately apparent
 *   from just looking at the numbers.
 * - **Fostering Engagement**: By giving stakeholders a voice, even for "rants," it encourages
 *   deeper engagement with KPI performance and promotes a culture of candid feedback.
 * - **Identifying Pain Points**: Aggregated rants can reveal common pain points or areas
 *   of confusion across teams, guiding improvements in data presentation, process design,
 *   or KPI definition clarity.
 * - **Adding Levity**: In a data-intensive environment, a touch of humor (as per the goal)
 *   can make engagement more enjoyable and reduce information fatigue.
 *
 * This file serves as the blueprint for structured, yet unbridled, commentary
 * that helps bridge the gap between abstract metrics and real-world sentiment.
 */

/**
 * Enumeration for the various tones a KPI rant can embody,
 * guiding the emotional or stylistic character of the commentary.
 */
export enum KpiRantTone {
  Frustrated = 'frustrated',
  Sarcastic = 'sarcastic',
  Humorous = 'humorous',
  Insightful = 'insightful',
  Confused = 'confused',
  Optimistic = 'optimistic',
  Cynical = 'cynical',
  Exasperated = 'exasperated',
  Whimsical = 'whimsical',
  Critical = 'critical',
  Bewildered = 'bewildered',
}

/**
 * Defines the structure for a spontaneous, opinionated commentary
 * related to a Key Performance Indicator.
 * This captures the human perspective, often with a dash of humor or frustration.
 */
export interface KpiRant {
  id: string; // Unique identifier for this specific rant (e.g., 'rant-20240726-001')
  kpiId: string; // The unique ID of the KPI this rant is directly associated with
  rantText: string; // The full, unedited text of the commentary or opinion. Must be factual and funny.
  subject: string; // A brief summary or specific focus of the rant (e.g., 'data latency', 'dashboard complexity', 'meeting overload').
  tone: KpiRantTone; // The emotional or stylistic tone of the rant, as defined by KpiRantTone.
  timestamp: string; // ISO 8601 date string indicating when the rant was originally recorded.
  author?: string; // Optional: The identifier of the person who delivered this rant.
  context?: { [key: string]: any }; // Optional: Additional contextual data relevant to the rant (e.g., 'team', 'project', 'department').
  tags?: string[]; // Optional: Keywords for filtering or categorization (e.g., 'data quality', 'process', 'management', 'ai-metrics').
  isPublic?: boolean; // Optional: Indicates if the rant is intended for public viewing or internal only.
}