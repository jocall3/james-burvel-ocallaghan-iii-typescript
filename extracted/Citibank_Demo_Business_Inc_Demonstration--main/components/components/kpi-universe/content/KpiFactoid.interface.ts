/**
 * KpiFactoid.interface.ts
 *
 * Defines a concise, factual statement or observation related to a specific Key Performance Indicator,
 * often highlighting an interesting data point, trend, or implication, with an optional humorous twist.
 *
 * This interface is designed to make complex KPI data more digestible, engaging, and shareable,
 * aligning with a visionary CEO's desire for communication that is both informative and memorable.
 *
 * Business Value & Strategic Intent:
 * - **Enhance Engagement**: Transforms raw data into captivating, bite-sized facts that grab attention.
 * - **Spark Insight**: Delivers quick, actionable insights or surprising revelations to encourage deeper data exploration.
 * - **Improve Data Literacy**: Simplifies complex metrics into understandable narratives for a broader audience.
 * - **Humanize Metrics**: Infuses analytical data with personality and wit, making it relatable and enjoyable,
 *   moving beyond purely academic reporting.
 * - **Support Storytelling**: Provides ready-made content for presentations, internal communications, and external
 *   marketing materials, fostering a culture of data-driven storytelling.
 * - **Visual Context**: Allows for the inclusion of visual elements that complement the factoid, aiding comprehension
 *   and engagement.
 *
 * This file serves as a blueprint for extracting and presenting the most compelling aspects of KPI performance,
 * ensuring that data communicates effectively and entertainingly.
 */

/**
 * Defines the structure for a concise, factual statement related to a KPI,
 * with an optional humorous element and visual reference.
 */
export interface KpiFactoid {
  id: string; // Unique identifier for the factoid (e.g., 'FRI_Q1_SURPRISE')
  kpiId: string; // The ID of the KPI this factoid is directly related to (e.g., 'FUT_READ_SCORE')
  factText: string; // The core, concise, and factual statement (e.g., 'Our Future Readiness Index jumped 15% this quarter, largely thanks to quantum resilience investments.')
  category?: 'trend' | 'benchmark' | 'impact' | 'prediction' | 'anomaly' | 'comparison' | 'general' | 'achievement' | 'challenge'; // Categorization of the factoid for easier filtering or thematic grouping
  source?: string; // Optional source or context where the fact was derived (e.g., 'Q3 Performance Review', 'AI Analytics Report', 'Market Benchmarking Study')
  timestamp?: string; // Optional ISO 8601 date string indicating when this factoid was relevant or generated
  tags?: string[]; // Keywords for filtering or enhanced search (e.g., 'positive', 'unexpected', 'actionable', 'funny', 'strategic')
  humorousObservation?: string; // An optional, concise, and lighthearted comment or "rant" related to the fact. No emdashes, just good, clean fun. (e.g., 'Who knew quantum computing could be so good for morale? Definitely not our CFO, probably.')
  relatedDashboardId?: string; // Optional ID of a dashboard where more detailed context or visualization for this factoid can be found
  imageUrl?: string; // Optional URL for an image or graphic that visually complements the factoid. This could be a chart, icon, or even a humorous graphic.
  imageDescription?: string; // A brief textual description for the associated image, for accessibility and context.
}