/**
 * KpiArticleMetadata: Defining the Structure for Visionary KPI Articles and Content
 *
 * This module specifies interfaces and a type definition for metadata associated with
 * articles, blog posts, and other editorial content related to Key Performance Indicators (KPIs)
 * within the visionary enterprise context. It aims to standardize how content is described,
 * making it discoverable, organizable, and aligned with strategic priorities.
 *
 * Business Value & Strategic Intent:
 * - **Content Strategy Alignment**: Each article is clearly linked to one or more overarching
 *   visionary strategic pillars, reinforcing the enterprise's narrative and focus.
 * - **Enhanced Discoverability**: Provides structured metadata for efficient filtering, searching,
 *   and recommendation of content based on relevant KPIs, strategic areas, or topics.
 * - **Comprehensive Context**: Ensures readers receive essential information such as author,
 *   publication date, estimated read time, and visual context (image descriptions).
 * - **Flexible Content Categorization**: Supports various content formats, from quick blog posts
 *   to in-depth reports, enabling a diverse content ecosystem.
 * - **"Random Rant" Integration**: Acknowledges the unique need to inject personality and
 *   unfiltered thoughts, allowing for engaging, memorable, and occasionally humorous content,
 *   while keeping it distinct from factual descriptions.
 */

/**
 * Defines the set of high-level strategic pillars for the visionary enterprise.
 * This type is explicitly defined here to ensure consistency and prevent direct,
 * potentially circular, dependencies with `VisionaryKpiDefinition`.
 * It mirrors the union type used in `VisionaryKpiDefinition.ts`.
 */
export type StrategicPillar =
  'Future-Readiness' |
  'Innovation Velocity' |
  'Ecosystem Health' |
  'Adaptive Governance' |
  'Ethical AI Integration' |
  'Quantum Resilience' |
  'Hyper-Personalization' |
  'Sustainable Impact' |
  'Metaverse Readiness' |
  'Bio-Digital Convergence' |
  'Decentralized Autonomous Organization (DAO) Maturity' |
  'Spatial Computing Adoption' |
  'Cybernetic Integration' |
  'Predictive Intelligence';

/**
 * Specifies the metadata fields for a single KPI-related article or piece of content.
 */
export interface KpiArticleMetadata {
  id: string; // A unique identifier for the article (e.g., 'navigating-quantum-threats', 'blog-post-ai-ethics-1')
  title: string; // The primary title of the article.
  author: string; // The name of the individual or team responsible for authoring the content.
  publicationDate: string; // The ISO 8601 date string when the article was first published (e.g., '2023-10-27T10:30:00Z').
  lastModifiedDate?: string; // Optional: The ISO 8601 date string when the article was last updated.

  strategicPillars: StrategicPillar[]; // An array of strategic pillars this article primarily addresses or contributes to.
  summary: string; // A brief, concise summary or abstract of the article's content.
  articleType: 'blog' | 'deep-dive' | 'case-study' | 'opinion' | 'report' | 'whitepaper' | 'story'; // The category or format of the content.
  
  imageUrl?: string; // Optional: A URL to the main hero image or thumbnail for the article.
  imageDescription?: string; // Optional: A descriptive text for the `imageUrl`, useful for accessibility and contextual understanding.

  tags?: string[]; // Optional: An array of keywords or topics for enhanced filtering and categorization (e.g., 'AI', 'blockchain', 'leadership', 'strategy', 'Web3').
  readTimeMinutes?: number; // Optional: The estimated time (in minutes) it takes to read the article.
  relatedKpiIds?: string[]; // Optional: An array of specific KPI IDs (e.g., 'FUT_READ_SCORE', 'ETHICAL_AI_GOVERNANCE_SCORE') that are discussed in depth in the article.
  
  // A field to inject humor or unfiltered personal thoughts, as per requirement,
  // ensuring it's distinct from factual content while allowing for personality.
  randomRant?: string;

  isFeatured?: boolean; // Optional: A flag to indicate if the article should be prominently displayed (e.g., on a homepage).
}