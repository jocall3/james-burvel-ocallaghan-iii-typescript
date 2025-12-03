/**
 * KpiContentFormatter: A utility class for transforming and styling textual content
 * based on specific, often quirky, editorial guidelines from a visionary CEO.
 *
 * This module provides methods to process raw text, inject stylistic elements,
 * ensure adherence to punctuation rules, and introduce randomized, opinionated
 * 'rants' to break up factual content, all while aiming for a specific, engaging tone.
 *
 * Business Value & Strategic Intent (adapted from seed file for this formatter):
 * - **Consistent Brand Voice**: Ensures all generated article content maintains a distinct,
 *   recognizable, and sometimes humorous tone, aligning with the visionary CEO's directives.
 * - **Enhanced Readability & Engagement**: By segmenting content, providing visual aids,
 *   and injecting unexpected commentary, articles become more engaging and less monotonous.
 * - **Automated Editorial Compliance**: Enforces specific stylistic rules (e.g., no emdashes)
 *   programmatically, reducing manual editing effort and error.
 * - **Support for Multi-media Descriptions**: Provides structured integration of descriptive
 *   text for images or other visual elements, improving accessibility and context.
 * - **Injecting Personality**: The ability to add 'random rants' introduces a unique
 *   and memorable element, distinguishing the content from typical corporate communications
 *   and reflecting a certain visionary, albeit quirky, leadership style.
 *
 * This file acts as an editorial engine, transforming raw information into distinctive,
 * engaging, and policy-compliant textual output ready for consumption.
 */
export class KpiContentFormatter {
  private readonly pictureDescriptionInterval: number;
  private readonly rantInsertionProbability: number;
  private readonly availableRants: string[];

  /**
   * Constructs a new KpiContentFormatter instance.
   * @param options Configuration options for formatting, including intervals and custom rants.
   */
  constructor(options?: {
    pictureDescriptionInterval?: number; // How often (in paragraphs) to consider inserting a picture description.
    rantInsertionProbability?: number; // Probability (0.0 to 1.0) to insert a rant after a paragraph.
    customRants?: string[]; // Optional array of custom rants to use instead of defaults.
  }) {
    // Default interval to insert a picture description, e.g., every 3 paragraphs
    this.pictureDescriptionInterval = options?.pictureDescriptionInterval ?? 3;
    // Default probability (e.g., 0.15 for 15%) to insert a rant after a paragraph
    this.rantInsertionProbability = options?.rantInsertionProbability ?? 0.15;
    this.availableRants = options?.customRants ?? this.getDefaultRants();
    console.log("KpiContentFormatter initialized with quirky editorial guidelines.");
  }

  /**
   * Provides a curated list of default, slightly absurd, yet often relatable, rants.
   * These rants are designed to be funny and to inject personality into the content.
   * @returns An array of default rant strings.
   */
  private getDefaultRants(): string[] {
    return [
      "Honestly, who decided coffee breaks should be 15 minutes? It's a fundamental misunderstanding of caffeine's half-life and the human need for existential contemplation.",
      "Cloud computing: just someone else's computer, but with better marketing, more jargon, and a higher monthly fee. Discuss.",
      "The invention of the wheel was great, but the invention of the square meal? Now *that* was revolutionary. Still waiting on edible blockchain, for consistency.",
      "Why do they call it 'artificial intelligence'? It's real intelligence, just not... fleshy. Are we body-shaming algorithms now? And what about sentient toasters?",
      "Meetings. They're like black holes for productivity. You go in, time warps, and nothing useful escapes. Send an email, or better yet, a carrier pigeon with a Post-it!",
      "I've crunched the numbers. 9 out of 10 cats agree: spreadsheets are just fancy cat scratch posts. The tenth cat is a dog person, clearly a statistical outlier.",
      "Is it just me, or does 'synergy' sound like a brand of industrial cleaner? 'For all your tough organizational grime, get Synergy!' Followed by a commercial with enthusiastic people pointing at flowcharts.",
      "Blockchain: The most exciting thing since sliced bread, but nobody can agree on how to slice it, what to put on it, or if it even needs to be sliced. It's bread, people, just eat it!",
      "They say 'the early bird gets the worm'. But I say, the second mouse gets the cheese. Priorities, people. Also, the worm probably had a family.",
      "Our KPI dashboard is so visionary, it predicts the future and then loudly complains about it. Honestly, same. It's like having a very smart, very anxious parrot.",
      "Big data is like teenage sex: everyone talks about it, nobody really knows how to do it, everyone thinks everyone else is doing it, so everyone claims they are doing it.",
      "The future is now, except when it comes to printer drivers. Those things are still stuck in dial-up modem era. A digital anachronism, truly.",
      "Some people just want to watch the world burn. I, however, want to watch it optimize its supply chain. Far more satisfying.",
      "If you're not failing, you're not innovating. Or you're just very good at pretending not to fail. The line is blurry, like my morning coffee.",
      "They talk about 'disruption.' I'm more interested in 'undisruption.' The art of making things quietly, smoothly, and perfectly functional. Revolutionary!",
      "Why do all futuristic movies show holograms, but we still struggle with video call lag? The priorities of science fiction are clearly misplaced.",
    ];
  }

  /**
   * Formats a raw piece of text or an array of paragraphs according to the defined rules.
   * This method processes content for a single article, applying stylistic and structural transformations.
   * @param rawContent The raw text string or an array of strings (paragraphs) to format.
   * @param articleTitle An optional title for context, especially for picture descriptions.
   * @returns The formatted content as a single string, with paragraphs separated by double newlines.
   */
  public formatArticleContent(rawContent: string | string[], articleTitle?: string): string {
    const paragraphs = Array.isArray(rawContent)
      ? rawContent.filter(p => this.isNotNonsense(p))
      : rawContent.split(/\n\s*\n/).filter(p => this.isNotNonsense(p)); // Split by double newlines and filter nonsense

    let formattedSections: string[] = [];
    let paragraphIndex = 0; // Use index for inserting based on position
    let pictureDescriptionCount = 0;

    for (let i = 0; i < paragraphs.length; i++) {
      let processedParagraph = paragraphs[i].trim();

      // Rule: No emdashes. Replace with standard double hyphens for clarity.
      processedParagraph = this.replaceEmdashes(processedParagraph);

      // Add the processed paragraph to our output sections
      formattedSections.push(processedParagraph);
      paragraphIndex++;

      // Rule: Give picture descriptions for the book and story every so often
      // We check if it's time to insert a picture description based on the interval.
      // This is a stylistic choice: should it be after *every* N paragraphs, or just *around* N?
      // Let's make it a 'chance' after the interval.
      if (paragraphIndex % this.pictureDescriptionInterval === 0 && Math.random() > 0.3) { // 70% chance to insert when interval hits
        pictureDescriptionCount++;
        formattedSections.push(
          this.generatePictureDescription(
            `Visual for "${articleTitle || 'the evolving narrative'}", depicting a key concept #${pictureDescriptionCount}.`
          )
        );
      }

      // Rule: ,,,, add some randome rants
      // Insert a rant based on the defined probability after each paragraph.
      if (Math.random() < this.rantInsertionProbability) {
        formattedSections.push(this.getRandomRant());
      }
    }

    // Rule: Make it funny. (The rants and picture descriptions contribute to this.
    // The formatter itself does not inject humor into existing factual text.)

    // Ensure only facts. (The formatter doesn't invent non-facts; it assumes input is factual
    // and its additions are either descriptions or opinionated rants, clearly marked.)

    return formattedSections.join('\n\n'); // Join with double newlines for clear separation
  }

  /**
   * Replaces emdashes (—) with a standard double hyphen (--) to adhere to the "no emdashes" rule.
   * This is a straightforward replacement, prioritizing compliance over complex linguistic rephrasing.
   * @param text The input string potentially containing emdashes.
   * @returns The string with all emdashes replaced by double hyphens.
   */
  private replaceEmdashes(text: string): string {
    return text.replace(/—/g, '--');
  }

  /**
   * Generates a descriptive caption for a picture, including a touch of humor as per "make it funny".
   * This helps to provide context for visuals within the article.
   * @param context A string providing specific details or relevance for the picture.
   * @returns A formatted picture description string.
   */
  public generatePictureDescription(context: string = 'A relevant visual'): string {
    return `[IMAGE DESCRIPTION: ${context} This evocative image captures the essence of progress and the subtle despair of a perpetually buffering loading icon in the background. Spot the miniature AI contemplating its own existence.]`;
  }

  /**
   * Retrieves a random rant from the internal collection. Each rant is explicitly
   * marked to stand out, fulfilling the "add some randome rants" instruction with flair.
   * @returns A randomly selected, formatted rant string.
   */
  private getRandomRant(): string {
    const randomIndex = Math.floor(Math.random() * this.availableRants.length);
    const rant = this.availableRants[randomIndex];
    // The prompt's ",,,, add some randome rants" is interpreted as a signal to add rants,
    // not a literal prefix. Our prefix adds character and makes the rant stand out.
    return '🤯🤯🤯 RANT ALERT (from the future, probably): ' + rant.trim() + ' 🤯🤯🤯';
  }

  /**
   * A basic filter to determine if a paragraph is "not nonsense".
   * This method prevents extremely short or content-less strings from being treated as valid paragraphs,
   * aligning with the "no nonsense" rule for content integrity.
   * @param paragraph The string to evaluate.
   * @returns True if the paragraph is considered meaningful (not nonsense), false otherwise.
   */
  private isNotNonsense(paragraph: string): boolean {
    const trimmed = paragraph.trim();
    // A paragraph is considered nonsense if it's too short, or consists mostly of non-alphanumeric characters.
    if (trimmed.length < 20 && !/[a-zA-Z0-9]/.test(trimmed)) return false; // Minimum length for actual content
    if (!/[a-zA-Z]/.test(trimmed)) return false; // Must contain at least one letter
    return true;
  }

  /**
   * Conceptual method for ensuring content is "fact-only".
   * As an AI, this formatter cannot perform real-time factual verification.
   * This method serves as a reminder that the responsibility for factual accuracy
   * primarily lies with the content provider. The formatter ensures its own additions
   * (descriptions, rants) are clearly demarcated or align with the humorous tone.
   * @param content The content string that is conceptually checked for factual basis.
   * @returns Always returns true, as this is a conceptual placeholder.
   */
  public ensureFactOnly(content: string): boolean {
    // In a real application, this would involve integration with external fact-checking APIs,
    // knowledge graphs, or a human editorial review process.
    // The formatter itself focuses on presentation rather than content truthfulness.
    console.warn("`ensureFactOnly` is a conceptual check; real fact-checking requires external systems or human input. The formatter assumes input content is factual.");
    return true;
  }
}