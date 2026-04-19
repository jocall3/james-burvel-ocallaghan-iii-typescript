// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

/**
 * Programmatically generate high-fidelity, commercially viable video content from text prompts, leveraging cutting-edge generative AI models for targeted marketing campaigns.
 */
export class Generate extends APIResource {
  /**
   * Submits a highly customized request to generate a video ad, allowing
   * fine-grained control over artistic style, aspect ratio, voiceover, background
   * music, target audience, and call-to-action elements for professional-grade
   * productions.
   *
   * @example
   * ```ts
   * const response = await client.ai.ads.generate.advanced({
   *   lengthSeconds: 30,
   *   prompt:
   *     "A professional ad showcasing 's corporate finance solutions, targeting business owners. Highlight security and efficiency.",
   *   style: 'Minimalist',
   *   aspectRatio: '16:9',
   *   audienceTarget: 'corporate',
   *   brandAssets: [
   *     'https://demobank.com/assets/corporate_logo.png',
   *   ],
   *   callToAction: {
   *     text: 'Learn more at DemoBank.com/business',
   *     url: 'https://demobank.com/business',
   *     displayTimeSeconds: 5,
   *   },
   *   voiceoverStyle: 'male_professional',
   *   voiceoverText:
   *     ': Your business, powered by intelligent finance.',
   * });
   * ```
   */
  advanced(body: GenerateAdvancedParams, options?: RequestOptions): APIPromise<GenerateAdvancedResponse> {
    return this._client.post('/ai/ads/generate/advanced', { body, ...options });
  }

  /**
   * Submits a request to generate a high-quality video ad using the advanced Veo 2.0
   * generative AI model. This is an asynchronous operation, suitable for standard ad
   * content creation.
   *
   * @example
   * ```ts
   * const response = await client.ai.ads.generate.standard({
   *   lengthSeconds: 15,
   *   prompt:
   *     "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
   *   style: 'Cinematic',
   *   aspectRatio: '16:9',
   *   brandColors: ['#0000FF', '#FFD700'],
   * });
   * ```
   */
  standard(body: GenerateStandardParams, options?: RequestOptions): APIPromise<GenerateStandardResponse> {
    return this._client.post('/ai/ads/generate', { body, ...options });
  }
}

export interface GenerateVideoRequest {
  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: unknown;

  /**
   * The textual prompt to guide the AI video generation.
   */
  prompt: unknown;

  /**
   * Artistic style of the video.
   */
  style: 'Cinematic' | 'Explainer' | 'Documentary' | 'Abstract' | 'Minimalist';

  /**
   * Aspect ratio of the video (e.g., 16:9 for widescreen, 9:16 for vertical shorts).
   */
  aspectRatio?: '16:9' | '9:16' | '1:1';

  /**
   * Optional: Hex color codes to influence the video's aesthetic.
   */
  brandColors?: Array<unknown> | null;

  /**
   * Optional: Additional keywords to guide the AI's content generation.
   */
  keywords?: Array<unknown> | null;
}

export interface GenerateAdvancedResponse {
  /**
   * Estimated time until advanced video generation is complete. May be longer than
   * standard generation.
   */
  estimatedCompletionTimeSeconds?: unknown;

  /**
   * The unique identifier for the advanced video generation operation.
   */
  operationId?: unknown;
}

export interface GenerateStandardResponse {
  /**
   * Estimated time until video generation is complete.
   */
  estimatedCompletionTimeSeconds?: unknown;

  /**
   * The unique identifier for the video generation operation.
   */
  operationId?: unknown;
}

export interface GenerateAdvancedParams {
  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: unknown;

  /**
   * The textual prompt to guide the AI video generation.
   */
  prompt: unknown;

  /**
   * Artistic style of the video.
   */
  style: 'Cinematic' | 'Explainer' | 'Documentary' | 'Abstract' | 'Minimalist';

  /**
   * Aspect ratio of the video (e.g., 16:9 for widescreen, 9:16 for vertical shorts).
   */
  aspectRatio?: '16:9' | '9:16' | '1:1';

  /**
   * Target audience for the ad, influencing tone and visuals.
   */
  audienceTarget?: 'general' | 'corporate' | 'investor' | 'youth' | null;

  /**
   * Genre of background music.
   */
  backgroundMusicGenre?: 'corporate' | 'uplifting' | 'ambient' | 'cinematic' | 'none' | null;

  /**
   * URLs to brand assets (e.g., logos, specific imagery) to be incorporated.
   */
  brandAssets?: Array<unknown> | null;

  /**
   * Optional: Hex color codes to influence the video's aesthetic.
   */
  brandColors?: Array<unknown> | null;

  /**
   * Call-to-action text and URL to be displayed.
   */
  callToAction?: GenerateAdvancedParams.CallToAction | null;

  /**
   * Optional: Additional keywords to guide the AI's content generation.
   */
  keywords?: Array<unknown> | null;

  /**
   * Style/tone for the AI voiceover.
   */
  voiceoverStyle?: 'male_professional' | 'female_friendly' | 'neutral_calm' | null;

  /**
   * Optional: Text for an AI-generated voiceover.
   */
  voiceoverText?: unknown;
}

export namespace GenerateAdvancedParams {
  /**
   * Call-to-action text and URL to be displayed.
   */
  export interface CallToAction {
    displayTimeSeconds?: unknown;

    text?: unknown;

    url?: unknown;
  }
}

export interface GenerateStandardParams {
  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: unknown;

  /**
   * The textual prompt to guide the AI video generation.
   */
  prompt: unknown;

  /**
   * Artistic style of the video.
   */
  style: 'Cinematic' | 'Explainer' | 'Documentary' | 'Abstract' | 'Minimalist';

  /**
   * Aspect ratio of the video (e.g., 16:9 for widescreen, 9:16 for vertical shorts).
   */
  aspectRatio?: '16:9' | '9:16' | '1:1';

  /**
   * Optional: Hex color codes to influence the video's aesthetic.
   */
  brandColors?: Array<unknown> | null;

  /**
   * Optional: Additional keywords to guide the AI's content generation.
   */
  keywords?: Array<unknown> | null;
}

export declare namespace Generate {
  export {
    type GenerateVideoRequest as GenerateVideoRequest,
    type GenerateAdvancedResponse as GenerateAdvancedResponse,
    type GenerateStandardResponse as GenerateStandardResponse,
    type GenerateAdvancedParams as GenerateAdvancedParams,
    type GenerateStandardParams as GenerateStandardParams,
  };
}
