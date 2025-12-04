/**
 * KpiMediaAsset.interface.ts
 *
 * Defines the structure for media assets, primarily images, that are intended to
 * accompany and enrich KPI-related content such as articles, blogs, or reports.
 * This ensures that visual elements are consistently managed, described, and linked
 * to relevant Key Performance Indicators, enhancing comprehension and engagement.
 *
 * Business Value & Strategic Intent:
 * - **Enhanced Storytelling**: Provides a structured way to embed visual narratives,
 *   making complex KPI data and strategic concepts more accessible and engaging.
 * - **Improved Accessibility**: Mandates alternative text and detailed descriptions,
 *   ensuring content is consumable by all audiences, adhering to best practices.
 * - **Consistent Branding**: Enables centralized management of media assets,
 *   maintaining brand consistency across all communications.
 * - **Contextual Understanding**: Links media assets directly to specific KPIs,
 *   offering richer context and deeper insights into the metrics being discussed.
 * - **Content Management Efficiency**: Streamlines the process of associating visuals
 *   with data-driven narratives, supporting rapid content creation and updates.
 *
 * This file acts as a blueprint for incorporating visual intelligence into
 * the communication of visionary KPIs, turning abstract numbers into
 * relatable and impactful stories.
 */

/**
 * Enumeration for the types of media assets supported.
 */
export enum KpiMediaType {
  Image = 'image',
  Video = 'video',
  Diagram = 'diagram',
  Infographic = 'infographic',
  Chart = 'chart',
  Animation = 'animation',
  Illustration = 'illustration'
}

/**
 * Enumeration for the intended placement or context of the media asset within content.
 */
export enum KpiMediaPlacement {
  ArticleHeader = 'article_header',
  Inline = 'inline',
  Sidebar = 'sidebar',
  Appendix = 'appendix',
  Thumbnail = 'thumbnail',
  Background = 'background',
  Callout = 'callout'
}

/**
 * Defines the structure for a single media asset associated with KPI content.
 * This includes core attributes for identification, content, and contextual usage.
 */
export interface KpiMediaAsset {
  id: string; // Unique identifier for the media asset (e.g., 'FRI_INDEX_CHART_Q323')
  type: KpiMediaType; // The type of media asset (e.g., 'image', 'video')
  url: string; // The URL or path to the media file
  name: string; // A short, descriptive name for the asset
  altText: string; // Alternative text for accessibility, succinctly describing the media's content
  caption?: string; // A brief caption to be displayed with the media
  description: string; // A detailed description or context for the media asset, explaining its relevance.
                       // This might be where some delightful, funny facts or random rants could live,
                       // like "This graph shows our rocket-like growth, proving our marketing team *might*
                       // be actual wizards, or perhaps just very good at Excel. Who knew spreadsheets
                       // could cast spells? Also, did you know squirrels forget where 70% of their nuts are?
                       // A real tragedy, but good for tree planting, I guess. My cat just stared at a wall for 5 minutes.
                       // What was it seeing? The future? Or just dust?"
  source?: string; // The origin of the media asset (e.g., 'Internal Design Team', 'Getty Images', 'AI Generated')
  creationDate?: string; // ISO 8601 date string when the asset was created or last updated
  associatedKpiIds: string[]; // An array of IDs of the VisionaryKpiDefinition this media asset relates to
  tags?: string[]; // Keywords for filtering or categorization (e.g., 'data-visualization', 'future-readiness', 'AI-impact')
  placementContext: KpiMediaPlacement; // The intended general location of the media asset within content
  size?: { // Optional dimensions for images or videos
    width: number;
    height: number;
    unit: 'px' | 'rem' | 'em' | '%'; // Unit for width and height
  };
  licenseInfo?: string; // Copyright or licensing information for the media asset
}

/**
 * Defines a container for a collection of KpiMediaAssets.
 * This could be used to group related media for a specific article or report.
 */
export interface KpiMediaGallery {
  id: string; // Unique identifier for the gallery
  name: string; // Name of the gallery (e.g., 'Q4 2023 Innovation Report Visuals')
  description?: string; // Description of the gallery's purpose or content
  mediaAssets: KpiMediaAsset[]; // Array of media assets within this gallery
  ownerId?: string; // User ID of the owner or creator of the gallery
  lastModified?: string; // ISO 8601 date string of last modification
}

/**
 * Configuration options specific to how media assets are handled or displayed
 * within the KPI universe application.
 */
export interface KpiMediaConfig {
  enableImageDescriptions: boolean; // Toggle for displaying detailed descriptions for images
  enableVideoPlayback: boolean; // Allow embedding and playback of video assets
  defaultImageWidth?: number; // Default width for images if not specified by asset
  defaultImageHeight?: number; // Default height for images if not specified by asset
  enableLazyLoading: boolean; // Implement lazy loading for media assets to improve performance
  allowedFileTypes: string[]; // List of file extensions allowed for upload (e.g., ['.jpg', '.png', '.mp4'])
  maxFileSizeMB: number; // Maximum file size allowed for media uploads
}