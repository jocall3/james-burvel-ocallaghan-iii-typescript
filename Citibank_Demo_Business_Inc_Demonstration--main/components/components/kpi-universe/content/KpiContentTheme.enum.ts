/**
 * KpiContentTheme.enum: Defines the thematic tone or style for content generation.
 *
 * This enumeration provides a standardized list of content themes,
 * allowing for categorization and selection of the desired tone
 * when generating articles, blogs, or descriptions.
 *
 * Business Value & Strategic Intent:
 * - **Content Consistency**: Ensures that generated content adheres to a predefined tone,
 *   maintaining brand voice and messaging consistency across various outputs.
 * - **Target Audience Alignment**: Enables content to be tailored to specific audience preferences
 *   or the intent of the communication (e.g., 'Funny' for engaging social posts,
 *   'Informative' for factual reports).
 * - **Automation of Tone**: Facilitates the automated generation of content with a specific
 *   thematic slant, crucial for large-scale content creation systems.
 * - **Content Strategy**: Supports a diverse content strategy by allowing easy toggling
 *   between different expressive styles.
 */
export enum KpiContentTheme {
  /**
   * Content is factual, objective, and aims to educate the reader.
   * Focuses on data, explanations, and straightforward presentation.
   */
  Informative = 'Informative',

  /**
   * Content is designed to entertain and amuse, often incorporating humor, wit,
   * and a light-hearted approach.
   */
  Funny = 'Funny',

  /**
   * Content expresses strong personal views, opinions, or subjective analyses.
   * May include persuasive arguments or commentary.
   */
  Opinionated = 'Opinionated',

  /**
   * Content is professional, formal, and adheres to business communication standards.
   * Often used for official reports, announcements, or corporate messaging.
   */
  Professional = 'Professional',

  /**
   * Content aims to inspire, motivate, or encourage the reader.
   * Often positive, forward-looking, and visionary in tone.
   */
  Inspirational = 'Inspirational',

  /**
   * Content adopts a storytelling approach, engaging the reader through narratives,
   * anecdotes, and character-driven scenarios.
   */
  Storytelling = 'Storytelling',

  /**
   * Content is designed to be concise, direct, and to the point,
   * avoiding unnecessary jargon or elaborate descriptions.
   */
  Direct = 'Direct',

  /**
   * Content focuses on critical analysis, highlighting issues, challenges, or risks.
   * Often used for thought leadership or problem-solving discussions.
   */
  Critical = 'Critical',

  /**
   * Content is designed to be provocative, challenge assumptions, or stimulate debate.
   * Aims to capture attention through unconventional perspectives.
   */
  Provocative = 'Provocative',

  /**
   * Content adopts a casual, friendly, and conversational style,
   * making it relatable and approachable for a broad audience.
   */
  Conversational = 'Conversational',

  /**
   * Content includes random, often unrelated, rants or digressions,
   * typically for comedic effect or to simulate unedited thought processes.
   * This is explicitly requested in the high-level goal and adds a unique, chaotic flavor.
   */
  RandomRants = 'RandomRants',
}