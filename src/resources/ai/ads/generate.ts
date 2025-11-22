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
   * Aspect ratio of the video (e.g., 16:9 for landscape, 9:16 for portrait).
   */
  aspectRatio: '16:9' | '9:16' | '1:1';

  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: number;

  /**
   * The text prompt describing the desired video content.
   */
  prompt: string;

  /**
   * Artistic style of the video.
   */
  style: 'Cinematic' | 'Documentary' | 'Explainer' | 'Animated' | 'Minimalist' | 'Energetic';

  /**
   * Optional: Brand hex color codes to influence visual palette.
   */
  brandColors?: Array<string> | null;

  /**
   * Optional: Preferred genre for background music.
   */
  musicGenre?: string | null;
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
   * Aspect ratio of the video (e.g., 16:9 for landscape, 9:16 for portrait).
   */
  aspectRatio: '16:9' | '9:16' | '1:1';

  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: number;

  /**
   * The text prompt describing the desired video content.
   */
  prompt: string;

  /**
   * Artistic style of the video.
   */
  style: 'Cinematic' | 'Documentary' | 'Explainer' | 'Animated' | 'Minimalist' | 'Energetic';

  /**
   * Optional: Target audience to influence tone and content.
   */
  audienceTarget?: 'general' | 'young_adult' | 'corporate' | 'small_business' | 'investors' | null;

  /**
   * Optional: Volume level for background music (0-1).
   */
  backgroundMusicVolume?: number | null;

  /**
   * Optional: URLs to brand assets (e.g., logo, specific imagery) for AI to
   * incorporate.
   */
  brandAssets?: Array<string> | null;

  /**
   * Optional: Brand hex color codes to influence visual palette.
   */
  brandColors?: Array<string> | null;

  /**
   * Optional: Details for a call-to-action overlay at the end of the video.
   */
  callToAction?: GenerateAdvancedParams.CallToAction | null;

  /**
   * Optional: Preferred genre for background music.
   */
  musicGenre?: string | null;

  /**
   * Optional: Style of the AI-generated voiceover.
   */
  voiceoverStyle?: 'male_professional' | 'female_friendly' | 'neutral_narrator' | null;

  /**
   * Optional: Custom voiceover script for the video.
   */
  voiceoverText?: string | null;
}

export namespace GenerateAdvancedParams {
  /**
   * Optional: Details for a call-to-action overlay at the end of the video.
   */
  export interface CallToAction {
    /**
     * Text to display for the call to action.
     */
    text: string;

    /**
     * URL to link to when the call to action is clicked.
     */
    url: string;

    /**
     * Duration in seconds to display the CTA at the end of the video.
     */
    displayTimeSeconds?: number | null;
  }
}

export interface GenerateStandardParams {
  /**
   * Aspect ratio of the video (e.g., 16:9 for landscape, 9:16 for portrait).
   */
  aspectRatio: '16:9' | '9:16' | '1:1';

  /**
   * Desired length of the video in seconds.
   */
  lengthSeconds: number;

  /**
   * The text prompt describing the desired video content.
   */
  prompt: string;

  /**
   * Artistic style of the video.
   */
  style: 'Cinematic' | 'Documentary' | 'Explainer' | 'Animated' | 'Minimalist' | 'Energetic';

  /**
   * Optional: Brand hex color codes to influence visual palette.
   */
  brandColors?: Array<string> | null;

  /**
   * Optional: Preferred genre for background music.
   */
  musicGenre?: string | null;
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
