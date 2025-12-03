/*
Yo listen up listen close this file is legend
It holds the secrets of finances ascending
We talk serious business we talk big data plays
Catching anomalies in a million different ways
This code right here it aint for the weak or the faint
It is the brain the heart the digital paint
Only the architect the true master mind
Can navigate these depths leave no stone behind
It is a saga of numbers a mystery unfolds
More than mere logic this story it holds
So step back observe respect the deep knowing
For what lies within keeps the global money flowing
*/

// Re-using core utilities following the style from the seed file.
// generateUUID is defined locally to ensure self-containment for this new service file.
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * @interface RawInsight
 * @description Represents a single raw insight or takeaway extracted from source materials.
 */
export interface RawInsight {
    id: string;
    title: string; // A concise title for the insight (e.g., "Remote Work Boosts Productivity")
    summary: string; // The core finding or surprising fact (e.g., "Contrary to fears, many found remote work more efficient.")
    relevance: string; // Explanation of why it's surprising, counter-intuitive, or impactful (e.g., "Challenges the belief that office is always best.")
    sourceQuote?: string; // An optional powerful quote directly from the source material
}

/**
 * @interface GeneratedBlogTakeaway
 * @description Represents a single structured takeaway section for the blog post.
 */
export interface GeneratedBlogTakeaway {
    subheading: string;
    content: string; // Main explanation of the concept, in short paragraphs
    analysis: string; // Reflection on why it's interesting or important, complementing the content
    quote?: string; // A powerful quote, if available, formatted for a blockquote
}

/**
 * @interface GeneratedBlogPost
 * @description Represents the complete structured content of a synthesized blog post.
 */
export interface GeneratedBlogPost {
    headline: string;
    introduction: string;
    takeaways: GeneratedBlogTakeaway[];
    conclusion: string;
    fullContentMarkdown: string; // The complete blog post assembled in Markdown format
}

/**
 * @class MockGenAIService
 * @description A mock service to simulate AI content generation. In a real application,
 * this would interface directly with a large language model client (e.g., GoogleGenAI as suggested by seed).
 * It provides placeholder text based on prompt keywords to simulate content synthesis.
 */
class MockGenAIService {
    private generateDelay = 200; // Simulate network latency

    /**
     * @method generateText
     * @description Simulates generating text based on a given prompt.
     * @param {string} prompt - The prompt to send to the AI model.
     * @returns {Promise<string>} A promise that resolves with the generated text.
     */
    public async generateText(prompt: string): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => {
                // Simplified mock responses based on keywords in the prompt to mimic the requested output structure.
                if (prompt.includes("click-worthy headline")) {
                    resolve("Mind-Blown! 5 Counter-Intuitive Truths That Will Reshape Your Worldview");
                } else if (prompt.includes("hook the reader") && prompt.includes("relatable problem")) {
                    resolve(
                        "We've all been there: confidently holding onto a belief, only for new evidence to swoop in and shatter our assumptions. It's unsettling, yet incredibly liberating. Today, we're diving into some fascinating findings that challenge the very fabric of conventional wisdom and offer a fresh perspective on how things truly work. Get ready to have your mind gently (or perhaps not-so-gently) expanded."
                    );
                } else if (prompt.includes("subheading for the takeaway") && prompt.includes("from insight:")) {
                    const insightTitle = prompt.match(/from insight: "([^"]+)"/)?.[1] || "An Unexpected Revelation";
                    resolve(`**${insightTitle}: Defying Expectations**`);
                } else if (prompt.includes("explain the concept") && prompt.includes("analysis of its importance") && prompt.includes("takeaway:")) {
                    const insightSummary = prompt.match(/takeaway summary: "([^"]+)"/)?.[1] || "A truly surprising phenomenon.";
                    const insightRelevance = prompt.match(/relevance: "([^"]+)"/)?.[1] || "Its profound impact cannot be overstated.";
                    
                    resolve(
                        `Let's unpack this: "${insightSummary}". This isn't just a quirky fact; it fundamentally shifts how we understand certain dynamics. Its simplicity belies its profound truth, making us question what we've always taken for granted.\n\n` +
                        `Why is this so interesting? Because "${insightRelevance}". It empowers us to approach challenges with a more nuanced, effective mindset, moving beyond outdated paradigms.`
                    );
                } else if (prompt.includes("brief, forward-looking summary") && prompt.includes("leaves the reader with a final thought-provoking question")) {
                    resolve(
                        "The journey through these counter-intuitive insights reminds us that growth often begins at the edge of our comfort zone. By questioning the obvious, we open doors to innovation and deeper understanding. So, as you go about your day, ask yourself: What other 'truths' might be cleverly disguised assumptions, waiting for us to uncover their true nature?"
                    );
                } else {
                    resolve("This is a generic generated text response based on the prompt.");
                }
            }, this.generateDelay);
        });
    }
}

const mockGenAIService = new MockGenAIService();

/**
 * @class BlogContentSynthesizer
 * @description A service responsible for synthesizing raw insights into a structured, engaging blog post.
 * It leverages AI-like generation (via MockGenAIService) to craft compelling narratives,
 * a conversational yet intelligent tone, and a highly scannable listicle format.
 */
export class BlogContentSynthesizer {

    /**
     * @method synthesizeBlogPost
     * @description Distills raw insights into a full blog post following a specific format and tone,
     * as defined in the architectural blueprint.
     * @param {RawInsight[]} insights - An array of raw insights to be transformed into blog takeaways.
     *                                   It is expected that these are the "top most surprising,
     *                                   counter-intuitive, or impactful" takeaways.
     * @returns {Promise<GeneratedBlogPost>} A promise that resolves with the structured blog post content.
     * @throws {Error} If no insights are provided.
     */
    public async synthesizeBlogPost(insights: RawInsight[]): Promise<GeneratedBlogPost> {
        if (!insights || insights.length === 0) {
            throw new Error("No insights provided to synthesize a blog post. Please provide at least one RawInsight.");
        }

        // 1. Craft a compelling, click-worthy headline
        const headlinePrompt = `Act as a thoughtful writer and synthesizer of ideas for a popular online publishing platform. Craft a compelling, click-worthy headline for a blog post based on these key surprising, counter-intuitive, or impactful insights: ${insights.map(i => i.title).join(', ')}. The writing style should be clean, accessible, and employ a conversational yet intelligent tone.`;
        const headline = await mockGenAIService.generateText(headlinePrompt);

        // 2. Begin with a short introduction that hooks the reader
        const introPrompt = `For a blog post titled "${headline}", write a short introduction that hooks the reader by establishing a relatable problem or curiosity. The introduction should lead into the discussion of top surprising, counter-intuitive, or impactful takeaways. Maintain a conversational yet intelligent tone.`;
        const introduction = await mockGenAIService.generateText(introPrompt);

        // 3. Present each takeaway as a distinct section in a listicle format
        const blogTakeaways: GeneratedBlogTakeaway[] = [];
        for (const insight of insights) {
            // Generate a clear, bolded subheading
            const subheadingPrompt = `Generate a clear, bolded subheading for a blog post section based on the takeaway titled "${insight.title}" from this core finding: "${insight.summary}". Make it highly scannable and engaging.`;
            const subheading = await mockGenAIService.generateText(subheadingPrompt);

            // Generate content (short paragraphs explaining, analysis/reflection)
            const contentAndAnalysisPrompt = `For a blog post section, explain the concept of "${insight.summary}" in short, accessible paragraphs. Then, offer a brief analysis or a reflection on why this point is so interesting or important, considering its specific relevance: "${insight.relevance}". The writing style should be clean, accessible, and employ a conversational yet intelligent tone.`;
            const contentAndAnalysis = await mockGenAIService.generateText(contentAndAnalysisPrompt);

            // Attempt to split content and analysis if the mock AI response provided both
            const paragraphs = contentAndAnalysis.split('\n\n').filter(Boolean);
            const content = paragraphs.length > 0 ? paragraphs[0] : insight.summary; // Use first paragraph as content
            const analysis = paragraphs.length > 1 ? paragraphs.slice(1).join('\n\n') : insight.relevance; // Use remaining as analysis

            blogTakeaways.push({
                subheading: subheading,
                content: content,
                analysis: analysis,
                quote: insight.sourceQuote, // Include the optional source quote
            });
        }

        // 4. Conclude the post with a brief, forward-looking summary
        const conclusionPrompt = `For a blog post with the headline "${headline}" and introduction "${introduction}", and discussing key insights like: ${insights.map(i => i.title).join(', ')}, write a brief, forward-looking summary. The conclusion should leave the reader with a final thought-provoking question or a powerful takeaway. Maintain a conversational yet intelligent tone.`;
        const conclusion = await mockGenAIService.generateText(conclusionPrompt);

        // 5. Assemble the full content in Markdown format for easy display
        let fullContentMarkdown = `# ${headline}\n\n`;
        fullContentMarkdown += `${introduction}\n\n`;

        blogTakeaways.forEach(takeaway => {
            fullContentMarkdown += `${takeaway.subheading}\n\n`; // Subheading is assumed to be already bolded by AI mock
            fullContentMarkdown += `${takeaway.content}\n\n`;
            if (takeaway.quote) {
                fullContentMarkdown += `> "${takeaway.quote}"\n\n`; // Markdown for blockquote
            }
            fullContentMarkdown += `${takeaway.analysis}\n\n`;
        });

        fullContentMarkdown += conclusion;

        return {
            headline,
            introduction,
            takeaways: blogTakeaways,
            conclusion,
            fullContentMarkdown,
        };
    }
}