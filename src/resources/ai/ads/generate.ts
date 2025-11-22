// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

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
   *   aspectRatio: '16:9',
   *   lengthSeconds: 30,
   *   prompt:
   *     "A professional ad showcasing 's corporate finance solutions, targeting business owners. Highlight security and efficiency.",
   *   style: 'Minimalist',
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
   *   aspectRatio: '16:9',
   *   lengthSeconds: 15,
   *   prompt:
   *     "A captivating ad featuring a young entrepreneur using 's AI tools to grow their startup. Focus on innovation and ease of use.",
   *   style: 'Cinematic',
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
   * Desired aspect ratio of the video (e.g., for YouTube, Instagram Reels).
   */
  aspectRatio: '16:9' | '9:16' | '1:1';

  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: number;

  /**
   * Textual description for the AI to generate the video content.
   */
  prompt: string;

  /**
   * Artistic style preference for the video.
   */
  style: 'Realistic' | 'Cinematic' | 'Animated' | 'Abstract' | 'Minimalist';

  /**
   * Optional list of brand hex colors to influence the video's aesthetic.
   */
  brandColors?: Array<string> | null;

  /**
   * Additional keywords to guide AI content generation.
   */
  keywords?: Array<string> | null;
}

export interface GenerateAdvancedResponse {
  /**
   * Estimated time until advanced video generation is complete. May be longer than
   * standard generation.
   */
  estimatedCompletionTimeSeconds?: number;

  /**
   * The unique identifier for the advanced video generation operation.
   */
  operationId?: string;
}

export interface GenerateStandardResponse {
  /**
   * Estimated time until video generation is complete.
   */
  estimatedCompletionTimeSeconds?: number;

  /**
   * The unique identifier for the video generation operation.
   */
  operationId?: string;
}

export interface GenerateAdvancedParams {
  /**
   * Desired aspect ratio of the video (e.g., for YouTube, Instagram Reels).
   */
  aspectRatio: '16:9' | '9:16' | '1:1';

  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: number;

  /**
   * Textual description for the AI to generate the video content.
   */
  prompt: string;

  /**
   * Artistic style preference for the video.
   */
  style: 'Realistic' | 'Cinematic' | 'Animated' | 'Abstract' | 'Minimalist';

  /**
   * Target audience to optimize messaging and visuals.
   */
  audienceTarget?: 'general' | 'young_adults' | 'corporate' | 'small_business' | 'investors' | null;

  /**
   * Desired background music style.
   */
  backgroundMusic?: 'upbeat' | 'calm' | 'dramatic' | 'none' | null;

  /**
   * URLs to brand assets (e.g., logos, specific imagery) to be incorporated.
   */
  brandAssets?: Array<string> | null;

  /**
   * Optional list of brand hex colors to influence the video's aesthetic.
   */
  brandColors?: Array<string> | null;

  /**
   * Details for an integrated call-to-action button or text overlay.
   */
  callToAction?: GenerateAdvancedParams.CallToAction | null;

  /**
   * Additional keywords to guide AI content generation.
   */
  keywords?: Array<string> | null;

  /**
   * Style of the AI-generated voiceover.
   */
  voiceoverStyle?: 'male_professional' | 'female_friendly' | 'neutral_calm' | null;

  /**
   * Specific text for a generated voiceover.
   */
  voiceoverText?: string | null;
}

export namespace GenerateAdvancedParams {
  /**
   * Details for an integrated call-to-action button or text overlay.
   */
  export interface CallToAction {
    displayTimeSeconds?: number;

    text?: string;

    url?: string;
  }
}

export interface GenerateStandardParams {
  /**
   * Desired aspect ratio of the video (e.g., for YouTube, Instagram Reels).
   */
  aspectRatio: '16:9' | '9:16' | '1:1';

  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: number;

  /**
   * Textual description for the AI to generate the video content.
   */
  prompt: string;

  /**
   * Artistic style preference for the video.
   */
  style: 'Realistic' | 'Cinematic' | 'Animated' | 'Abstract' | 'Minimalist';

  /**
   * Optional list of brand hex colors to influence the video's aesthetic.
   */
  brandColors?: Array<string> | null;

  /**
   * Additional keywords to guide AI content generation.
   */
  keywords?: Array<string> | null;
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
