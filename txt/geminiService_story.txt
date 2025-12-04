// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

import { GoogleGenAI, Type } from "@google/genai";
import type { StoryDocument, ChapterScaffold } from '../types';
import { ai, generateContent, streamContent, generateJson } from './geminiCore';

const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

const chapterScaffoldSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A compelling and relevant title for this chapter of the story." },
        pages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    ai_suggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "A brief, 1-2 sentence summary or key idea for this page. This will guide the user's writing."
                    },
                },
                required: ["ai_suggestions"],
            },
            description: "A breakdown of the chapter into several pages. Each page should have a summary/suggestion."
        }
    },
    required: ["title", "pages"],
};

// --- New Schemas for expanded functionality ---

export const storyOutlineSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The overarching title for the story." },
        logline: { type: Type.STRING, description: "A concise, compelling one-sentence summary of the entire story." },
        theme: { type: Type.STRING, description: "The central idea, message, or moral of the story." },
        protagonist: { type: Type.STRING, description: "Brief description of the main character (e.g., name, key trait, goal)." },
        antagonist: { type: Type.STRING, description: "Brief description of the opposing force or character." },
        setting: { type: Type.STRING, description: "The primary time and place where the story unfolds." },
        target_audience: { type: Type.STRING, description: "Who the story is primarily for (e.g., YA, Adult Fantasy, Children's)." },
        acts: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    act_number: { type: Type.NUMBER, description: "The act number (e.g., 1, 2, 3)." },
                    title: { type: Type.STRING, description: "A descriptive title for this act." },
                    summary: { type: Type.STRING, description: "A summary of the main events and progression within this act." },
                    key_plot_points: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Bullet points detailing major narrative beats, twists, or character developments within this act."
                    }
                },
                required: ["act_number", "title", "summary", "key_plot_points"]
            },
            description: "A breakdown of the story into traditional narrative acts (e.g., three-act structure)."
        },
        potential_chapters_summary: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of brief, high-level summaries that could serve as individual chapter ideas derived from the outline."
        }
    },
    required: ["title", "logline", "theme", "protagonist", "setting", "acts", "potential_chapters_summary"],
};

export const characterProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The character's full name." },
        role: { type: Type.STRING, description: "Their primary role in the story (e.g., protagonist, antagonist, mentor, sidekick)." },
        appearance: { type: Type.STRING, description: "A detailed physical description, including clothing style if relevant." },
        personality: { type: Type.STRING, description: "Key personality traits, quirks, and mannerisms." },
        backstory: { type: Type.STRING, description: "Brief but impactful past events or experiences relevant to the story." },
        motivations: { type: Type.STRING, description: "What drives the character's actions and desires throughout the story." },
        arc: { type: Type.STRING, description: "How the character changes or develops emotionally/psychologically throughout the story." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key positive attributes or skills." },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key flaws, vulnerabilities, or areas for growth." },
        dialogue_style: { type: Type.STRING, description: "How the character typically speaks (e.g., formal, witty, terse, verbose, uses slang)." },
        relationships: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key relationships with other characters." }
    },
    required: ["name", "role", "appearance", "personality", "motivations", "arc"],
};

export const worldElementSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Name of the world element (e.g., City of Eldoria, The Sunken Relic, Order of the Golden Dawn)." },
        type: { type: Type.STRING, description: "Type of element (e.g., Location, Artifact, Organization, Magic System, Species)." },
        description: { type: Type.STRING, description: "Detailed description of the element, its history, and its characteristics." },
        significance_to_story: { type: Type.STRING, description: "Why this element is important to the narrative, plot, or characters." },
        visual_description: { type: Type.STRING, description: "A rich, descriptive text suitable for generating an image of this element, focusing on key visual features." },
        key_features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points of notable characteristics or properties." }
    },
    required: ["name", "type", "description", "significance_to_story"],
};

export const critiqueSchema = {
    type: Type.OBJECT,
    properties: {
        overall_impression: { type: Type.STRING, description: "A general summary of the chapter's strengths and weaknesses." },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific positive aspects of the chapter (e.g., strong pacing, compelling character voice, vivid world-building, engaging dialogue)."
        },
        areas_for_improvement: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific, actionable suggestions for improving the chapter (e.g., clarify plot points, deepen character motivations, enhance sensory descriptions, resolve minor inconsistencies)."
        },
        plot_consistency_feedback: { type: Type.STRING, description: "Notes on any potential plot holes, inconsistencies, or areas where the narrative logic could be strengthened." },
        character_development_feedback: { type: Type.STRING, description: "Suggestions related to character arcs, motivations, believability, or opportunities for emotional depth." },
        pacing_feedback: { type: Type.STRING, description: "Comments on the flow, speed, and tension of the narrative; where it might drag or rush." },
        thematic_relevance_feedback: { type: Type.STRING, description: "Observations on how well the chapter connects to or develops the story's central themes." }
    },
    required: ["overall_impression", "strengths", "areas_for_improvement"],
};

// --- Existing Functions ---

export const generateStoryTitle = async (firstChunk: string): Promise<string> => {
    const prompt = `Based on the following text, generate a single, compelling title for a story. Return only the title as a plain string. Text: "${firstChunk.slice(0, 1000)}"`;
    const response = await generateContent(prompt, "You are a creative writer who excels at creating story titles.");
    return response.trim().replace(/"/g, '');
};

export const generateChapterFromChunk = async (pageChunks: string[], chapterNumber: number, totalChapters: number, storyTitle: string): Promise<ChapterScaffold> => {
    const context = `You are a master storyteller creating a story scaffold. The story is titled "${storyTitle}". This is for Chapter ${chapterNumber} of ${totalChapters}. Based on the following text, generate a chapter title and break it down into logical pages, each with a 1-2 sentence summary/suggestion.`;
    const fullText = pageChunks.join(' ');

    const prompt = `${context}\n\nFull text for this chapter:\n---\n${fullText}\n---`;
    
    const parsed = await generateJson<any>(prompt, "You are a helpful assistant that generates JSON.", chapterScaffoldSchema);
    
    return {
        id: crypto.randomUUID(),
        title: parsed.title,
        summary: 'AI summary will appear here.', // Placeholder, will be filled by generateChapterSummaries
        pages: parsed.pages.map((p: any, i: number) => ({
            id: crypto.randomUUID(),
            page_number: i + 1,
            page_text: '',
            ai_suggestions: p.ai_suggestions || ['AI suggestion failed to generate.'],
            images: [],
        })),
    };
};

export const expandPageTextStream = (existingText: string): AsyncGenerator<string> => {
    const prompt = `You are a creative writing assistant. Continue the following story text, adding another paragraph or two. Do not repeat the existing text. Existing text: "${existingText}"`;
    return streamContent(prompt, "You are a creative writing assistant.");
};

export const autoWritePageStream = (storyTitle: string, chapterTitle: string, pageSuggestion: string): AsyncGenerator<string> => {
    const prompt = `You are a ghostwriter. The story is "${storyTitle}", chapter is "${chapterTitle}". Write a full, engaging page (3-4 paragraphs) based on this key idea: "${pageSuggestion}"`;
    return streamContent(prompt, "You are a ghostwriter.");
};

export const generatePageImage = async (pageText: string, mood: string): Promise<string> => {
    const prompt = `Generate a professional, Forbes-quality magazine illustration for a story.
Style: ${mood}.
The scene is described as: "${pageText.slice(0, 500)}".
Focus on cinematic lighting, high detail, and a clear focal point. This is a masterpiece illustration.
Negative prompt: ugly, blurry, deformed, watermark, text, signature, amateurish.`;
    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: prompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '16:9' },
        });
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    } catch (e) {
        console.error("Image generation failed", e);
        return "";
    }
};

export const suggestNewChapterTitles = async (doc: StoryDocument): Promise<string[]> => {
    const prompt = `You are a book editor. Given the following chapter contents, suggest a new, more compelling title for each chapter. Return a JSON array of strings.
    
    Story Title: ${doc.title}
    Chapters:
    ${doc.chapters.map((c, i) => `Chapter ${i+1} Content: ${c.pages.map(p => p.page_text || p.ai_suggestions[0]).join(' ').slice(0, 500)}...`).join('\n')}
    `;
    return generateJson<string[]>(prompt, "You are a helpful assistant that generates JSON.", { type: Type.ARRAY, items: { type: Type.STRING } });
};

export const generateChapterSummaries = async (doc: StoryDocument): Promise<string[]> => {
     const prompt = `You are a book editor. For each chapter provided, write a concise 1-sentence summary. Return a JSON array of strings.
    
    Story Title: ${doc.title}
    Chapters:
    ${doc.chapters.map((c, i) => `Chapter ${i+1} Title: ${c.title}\nContent: ${c.pages.map(p => p.page_text || p.ai_suggestions[0]).join(' ').slice(0, 500)}...`).join('\n')}
    `;
    return generateJson<string[]>(prompt, "You are a helpful assistant that generates JSON.", { type: Type.ARRAY, items: { type: Type.STRING } });
};


// --- New Functions for expanded functionality ---

/**
 * Generates a high-level story outline based on an initial premise.
 * @param premise A brief initial idea or concept for the story.
 * @param genre The genre of the story (e.g., Fantasy, Sci-Fi, Thriller, Romance).
 * @returns A structured story outline including acts, key plot points, and character concepts.
 */
export const generateStoryOutline = async (premise: string, genre: string): Promise<typeof storyOutlineSchema['properties']> => {
    const prompt = `You are a professional story architect and screenwriter. Create a detailed story outline in a three-act structure.
    
    Premise: "${premise}"
    Genre: "${genre}"
    
    Focus on creating compelling plot points, character arcs, and thematic depth.
    The output should be a JSON object following the 'storyOutlineSchema'.`;
    
    return generateJson<typeof storyOutlineSchema['properties']>(prompt, "You are an expert story architect.", storyOutlineSchema);
};

/**
 * Generates a detailed character profile based on a brief description or role.
 * @param characterConcept A brief description of the character or their role (e.g., "a reluctant hero with a hidden past", "the cunning villain who manipulates from the shadows").
 * @param storyContext Optional: The title or a brief summary of the story for better context.
 * @returns A detailed character profile.
 */
export const generateCharacterProfile = async (characterConcept: string, storyContext?: string): Promise<typeof characterProfileSchema['properties']> => {
    const contextPrompt = storyContext ? ` for the story "${storyContext}"` : '';
    const prompt = `You are an expert character designer. Create a detailed character profile based on the following concept${contextPrompt}.
    
    Character Concept: "${characterConcept}"
    
    The output should be a JSON object following the 'characterProfileSchema'. Ensure the character is well-rounded and has potential for growth.`;
    
    return generateJson<typeof characterProfileSchema['properties']>(prompt, "You are an expert character designer.", characterProfileSchema);
};

/**
 * Generates a detailed description for a specific world-building element.
 * @param elementConcept A brief description of the element (e.g., "a floating city powered by magic", "a legendary sword with a dark curse").
 * @param elementType The type of element (e.g., "Location", "Artifact", "Magic System", "Organization", "Species").
 * @param storyContext Optional: The title or a brief summary of the story for better context.
 * @returns A detailed world element description.
 */
export const generateWorldElement = async (elementConcept: string, elementType: string, storyContext?: string): Promise<typeof worldElementSchema['properties']> => {
    const contextPrompt = storyContext ? ` for the story "${storyContext}"` : '';
    const prompt = `You are a master world-builder. Create a detailed description for a ${elementType.toLowerCase()} based on the following concept${contextPrompt}.
    
    Element Concept: "${elementConcept}"
    Element Type: "${elementType}"
    
    The output should be a JSON object following the 'worldElementSchema'. Focus on unique features, its history, and its importance to the narrative.`;
    
    return generateJson<typeof worldElementSchema['properties']>(prompt, "You are a master world-builder.", worldElementSchema);
};

/**
 * Rewrites a given text passage in a specified style or tone.
 * @param text The original text passage to rewrite.
 * @param desiredStyle The desired writing style or tone (e.g., "more descriptive and poetic", "fast-paced and suspenseful", "humorous and sarcastic", "formal and academic").
 * @returns An AsyncGenerator emitting the rewritten text.
 */
export const refineTextWithStyleStream = (text: string, desiredStyle: string): AsyncGenerator<string> => {
    const prompt = `You are a professional copyeditor and stylistic writer. Rewrite the following text to embody a "${desiredStyle}" style.
    
    Original Text:
    ---
    ${text}
    ---
    
    Focus on enhancing the language, imagery, and flow to match the requested style. Maintain the original meaning and core events.`;
    
    return streamContent(prompt, "You are a stylistic writing expert.");
};

/**
 * Generates a high-quality prompt for creating book cover art, based on story details.
 * This prompt is designed to be fed into an image generation model like `imagen-4.0`.
 * @param storyTitle The title of the story.
 * @param storyLogline A one-sentence summary of the story.
 * @param keyElements Key visual elements, characters, or scenes that should be depicted on the cover.
 * @param desiredMood The overall mood or atmosphere for the cover (e.g., "epic fantasy", "gritty sci-fi", "cozy mystery", "romantic drama").
 * @returns A highly detailed image generation prompt string.
 */
export const generateCoverArtPrompt = async (
    storyTitle: string,
    storyLogline: string,
    keyElements: string,
    desiredMood: string
): Promise<string> => {
    const prompt = `You are a professional book cover artist's assistant. Generate a single, highly detailed, visually rich prompt for an AI image generation model to create a stunning book cover.
    
    Story Title: "${storyTitle}"
    Story Logline: "${storyLogline}"
    Key Visual Elements: "${keyElements}"
    Desired Mood: "${desiredMood}"
    
    The prompt should be evocative, cinematic, and clearly describe the composition, lighting, color palette, and style.
    Include artistic references if appropriate. Focus on capturing the essence of the story.
    
    Example Structure: "A sweeping panoramic view of [setting], with [protagonist/key character] in the foreground, facing [challenge/antagonist]. Dramatic lighting, [color palette], [art style/mood]. High detail, cinematic, epic. Focus on [specific visual element]."
    
    Negative prompt: ugly, blurry, deformed, watermark, text, signature, amateurish, cartoon, childish.`;

    const response = await generateContent(prompt, "You are an expert AI image prompt engineer for book covers.");
    return response.trim();
};

/**
 * Generates book cover art using an image model based on a story's details.
 * This function utilizes the `generateCoverArtPrompt` internally.
 * @param storyTitle The title of the story.
 * @param storyLogline A one-sentence summary of the story.
 * @param keyElements Key visual elements, characters, or scenes for the cover.
 * @param desiredMood The overall mood or atmosphere for the cover.
 * @returns A base64 encoded image string (data URI) or an empty string if generation fails.
 */
export const generateCoverArt = async (
    storyTitle: string,
    storyLogline: string,
    keyElements: string,
    desiredMood: string
): Promise<string> => {
    const imageGenerationPrompt = await generateCoverArtPrompt(storyTitle, storyLogline, keyElements, desiredMood);

    try {
        const response = await ai.models.generateImages({
            model: imageModel,
            prompt: imageGenerationPrompt,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '2:3' }, // Standard book cover aspect ratio
        });
        return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    } catch (e) {
        console.error("Cover art generation failed", e);
        return "";
    }
};

/**
 * Provides constructive criticism and feedback on a specific chapter of a story.
 * @param chapterTitle The title of the chapter being critiqued.
 * @param chapterContent The full text content of the chapter.
 * @param storyContext Optional: The overall story title or summary for better contextual critique.
 * @returns A structured critique object.
 */
export const critiqueChapter = async (chapterTitle: string, chapterContent: string, storyContext?: string): Promise<typeof critiqueSchema['properties']> => {
    const contextPrompt = storyContext ? ` from the story "${storyContext}"` : '';
    const prompt = `You are a professional book editor and literary critic. Provide a detailed, constructive critique for the following chapter${contextPrompt}.
    
    Chapter Title: "${chapterTitle}"
    Chapter Content:
    ---
    ${chapterContent.slice(0, 4000)}
    ---
    
    Analyze the chapter for its strengths and areas for improvement, covering plot, character development, pacing, consistency, and thematic relevance.
    The output should be a JSON object following the 'critiqueSchema'.`;
    
    return generateJson<typeof critiqueSchema['properties']>(prompt, "You are a professional book editor.", critiqueSchema);
};

/**
 * Suggests potential plot twists or developments for a given story context.
 * @param storySummary A brief summary of the story so far.
 * @param charactersSummary A brief summary of key characters and their current state.
 * @param desiredImpact The desired impact of the twist (e.g., "increase tension", "reveal a secret", "introduce a new conflict").
 * @returns An array of string suggestions for plot twists.
 */
export const suggestPlotTwists = async (
    storySummary: string,
    charactersSummary: string,
    desiredImpact: string
): Promise<string[]> => {
    const prompt = `You are a master storyteller and plot strategist. Based on the following story context, suggest 3-5 compelling plot twists or significant developments that would achieve the desired impact.
    
    Story Summary: "${storySummary.slice(0, 1000)}"
    Characters Summary: "${charactersSummary.slice(0, 500)}"
    Desired Impact: "${desiredImpact}"
    
    Return a JSON array of strings, where each string is a distinct plot twist idea.`;
    
    return generateJson<string[]>(prompt, "You are a plot twist expert.", { type: Type.ARRAY, items: { type: Type.STRING } });
};

/**
 * Generates a title and short summary for a potential sequel, based on the current story document.
 * @param doc The complete StoryDocument object.
 * @returns A JSON object containing sequel title and summary.
 */
export const generateSequelConcept = async (doc: StoryDocument): Promise<{ sequel_title: string; sequel_summary: string; key_conflicts: string[] }> => {
    const storyEnding = doc.chapters[doc.chapters.length - 1]?.pages.slice(-2).map(p => p.page_text).join(' ') || 'The story concluded.';
    const prompt = `You are a creative writer specializing in series development. Given the following story and its ending, generate a compelling title and a 2-3 sentence summary for a potential sequel. Also, list 3 key conflicts or plot hooks for the sequel.
    
    Original Story Title: "${doc.title}"
    Original Story Logline: "${doc.logline || 'A great story.'}"
    Story Ending: "${storyEnding.slice(0, 1000)}"
    
    Return a JSON object with 'sequel_title' (string), 'sequel_summary' (string), and 'key_conflicts' (array of strings).`;

    const sequelSchema = {
        type: Type.OBJECT,
        properties: {
            sequel_title: { type: Type.STRING, description: "A compelling title for the sequel." },
            sequel_summary: { type: Type.STRING, description: "A brief summary of the sequel's premise." },
            key_conflicts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 key conflicts or plot hooks for the sequel."
            }
        },
        required: ["sequel_title", "sequel_summary", "key_conflicts"]
    };
    
    return generateJson<{ sequel_title: string; sequel_summary: string; key_conflicts: string[] }>(
        prompt,
        "You are an expert in narrative expansion and sequel development.",
        sequelSchema
    );
};