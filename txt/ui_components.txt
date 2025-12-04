import React, { useState, useEffect, useCallback, useRef, CSSProperties, useMemo } from 'react';

/**
 * @module ui_components
 * @description This module encapsulates the foundational client-side user interface components and
 * rendering methodologies mandated by the architectural blueprint for the ontological transmutation
 * of subjective aesthetic intent into dynamic, persistently rendered user interface backgrounds.
 * It provides a robust, adaptable, and performant framework for interacting with the generative AI
 * system and displaying its outputs.
 */

/**
 * @typedef {Object} OverlaySettings
 * @property {number} opacity - The base opacity of the overlay, ranging from 0.0 to 1.0.
 * @property {string} color - The base color of the overlay (e.g., "#000000" or "rgba(0,0,0,0.5)").
 * @property {number} blurRadius - The blur strength in pixels applied to the background image, ranging from 0 to 20.
 * @property {boolean} autoAdjust - Flag indicating if the overlay should dynamically adapt to background luminosity for optimal readability.
 */

/**
 * @typedef {Object} BackgroundConfig
 * @property {string} url - The CDN URL or Data URI of the high-fidelity generated image.
 * @property {string} prompt - The original natural language prompt that produced this background.
 * @property {string} [lowFidelityPreviewUrl] - A URL or Data URI for a lightweight, low-fidelity preview.
 * @property {number} [generationTimestamp] - Unix timestamp of when the image was generated.
 * @property {Object} [metadata] - Additional metadata associated with the generated image.
 */

/**
 * @typedef {Object} PromptValidationFeedback
 * @property {number} qualityScore - A composite metric (0.0-1.0) indicating prompt quality (Q_prompt(p_raw)).
 * @property {'Safe' | 'Flagged' | 'Blocked'} safetyStatus - The content safety classification (F_safety(p_raw)).
 * @property {string[]} suggestions - An array of suggested refinements for the prompt (PCCA-derived).
 * @property {string | null} errorMessage - An error message if the prompt is blocked or invalid.
 */

/**
 * @typedef {Object} SystemStatus
 * @property {string} message - A descriptive status message (e.g., "Interpreting prompt...", "Generating image...").
 * @property {number} percentage - Progress as a percentage (0-100).
 * @property {boolean} isLoading - True if an operation is in progress.
 */

/**
 * @constant {number} TRANSITION_DURATION_MS - The default duration for background transitions in milliseconds.
 * This parameter governs the `\tau_{trans}` in `Opacity(t) = easeInOut(t/\tau_{trans})`.
 */
const TRANSITION_DURATION_MS = 1200;

/**
 * @constant {number} PARALLAX_DEPTH_FACTOR - The scaling factor for parallax movement, `D_{factor}`.
 * A higher value means the background moves more significantly relative to scroll.
 */
const PARALLAX_DEPTH_FACTOR = 0.15;

/**
 * @constant {number} WCAG_MIN_CONTRAST_RATIO - The minimum contrast ratio mandated by WCAG AA for standard text.
 * `CR \ge 4.5`.
 */
const WCAG_MIN_CONTRAST_RATIO = 4.5;

/**
 * @constant {number} EEM_FPS_THRESHOLD - Frames Per Second threshold below which the Energy Efficiency Monitor (EEM)
 * will trigger adaptive rendering adjustments.
 */
const EEM_FPS_THRESHOLD = 30;

/**
 * @function hexToRgb
 * @description Converts a hexadecimal color string to an RGB array.
 * @param {string} hex - The hexadecimal color string (e.g., "#RRGGBB").
 * @returns {number[]} An array `[R, G, B]` where each component is 0-255.
 */
const hexToRgb = (hex: string): number[] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

/**
 * @function getLuminance
 * @description Calculates the relative luminance of an RGB color, as per WCAG guidelines.
 * `L = 0.2126 * R_sRGB + 0.7152 * G_sRGB + 0.0722 * B_sRGB`.
 * @param {number[]} rgb - An array `[R, G, B]` where each component is 0-255.
 * @returns {number} The luminance value, ranging from 0.0 to 1.0.
 */
const getLuminance = (rgb: number[]): number => {
  const sRGB = rgb.map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * @function calculateOverlayOpacity
 * @description Dynamically determines the optimal overlay opacity `\alpha_{overlay}` based on background
 * luminosity `L_{bg}` to ensure text readability compliant with WCAG.
 * `\alpha_{overlay} = f_{adjust}(L_{bg})`.
 * @param {number} backgroundLuminance - The luminance of the background image.
 * @param {number} overlayBaseOpacity - The user-defined base opacity for the overlay.
 * @param {string} overlayBaseColor - The user-defined base color for the overlay.
 * @param {string} foregroundTextColor - The color of the text displayed over the background (e.g., "#FFFFFF").
 * @returns {number} The adjusted opacity for the overlay.
 */
const calculateOverlayOpacity = (
  backgroundLuminance: number,
  overlayBaseOpacity: number,
  overlayBaseColor: string,
  foregroundTextColor: string
): number => {
  if (!overlayBaseColor || !foregroundTextColor) return overlayBaseOpacity;

  const textRgb = hexToRgb(foregroundTextColor);
  const overlayRgb = hexToRgb(overlayBaseColor);
  const textLuminance = getLuminance(textRgb);

  let currentOpacity = overlayBaseOpacity;
  let iterations = 0;
  const maxIterations = 50;
  const step = 0.01;

  while (iterations < maxIterations) {
    // Calculate the blended background color luminance with current overlay opacity
    const blendedRgb = overlayRgb.map(
      (c, i) =>
        (c * currentOpacity + getLluminanceForComponent(backgroundLuminance) * (1 - currentOpacity))
    );
    const blendedLuminance = getLuminance(blendedRgb);

    const contrast =
      (Math.max(textLuminance, blendedLuminance) + 0.05) /
      (Math.min(textLuminance, blendedLuminance) + 0.05);

    if (contrast >= WCAG_MIN_CONTRAST_RATIO) {
      return currentOpacity;
    }

    currentOpacity = Math.min(1.0, currentOpacity + step);
    if (currentOpacity === 1.0 && contrast < WCAG_MIN_CONTRAST_RATIO) {
      return 1.0; // Cannot meet contrast, max out opacity
    }
    iterations++;
  }
  return overlayBaseOpacity; // Fallback
};

/**
 * @function getLluminanceForComponent
 * @description Helper to estimate an sRGB component from overall luminance (simplified heuristic).
 * This is not a precise inverse of getLuminance but serves for approximate blending.
 * @param {number} luminance - The overall luminance (0-1).
 * @returns {number} A heuristic sRGB component value (0-1).
 */
const getLluminanceForComponent = (luminance: number): number => {
  return luminance <= 0.03928 ? luminance * 12.92 : 1.055 * Math.pow(luminance, 1 / 2.4) - 0.055;
};

/**
 * @interface DynamicBackgroundContainerProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 * @property {BackgroundConfig | null} backgroundConfig - The configuration for the current background image.
 * @property {OverlaySettings} [overlaySettings] - Configuration for dynamic overlays, ensuring readability.
 * @property {boolean} [parallaxEnabled=false] - If true, applies a subtle parallax scrolling effect (`P_{bg}(S_{pos}) = S_{pos} \cdot D_{factor}`).
 * @property {boolean} [interactiveEnabled=false] - If true, activates subtle interactive background elements (e.g., animations).
 * @property {string} [foregroundTextColor='#FFFFFF'] - The expected color of text rendered over this background, for contrast calculation.
 */
interface DynamicBackgroundContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundConfig: BackgroundConfig | null;
  overlaySettings?: OverlaySettings;
  parallaxEnabled?: boolean;
  interactiveEnabled?: boolean;
  foregroundTextColor?: string;
}

/**
 * @component DynamicBackgroundContainer
 * @description A foundational React component responsible for rendering and managing the dynamic GUI background.
 * It integrates the functionalities of the Client-Side Rendering and Application Layer (CRAL),
 * Adaptive UI Rendering Subsystem (AUIRS), and interacts with the Energy Efficiency Monitor (EEM)
 * logic for adaptive performance. This component orchestrates seamless transitions, parallax effects,
 * and intelligent overlays.
 *
 * This component's operational flow adheres to the mathematical framework of `\mathcal{F}_{RENDER}`,
 * dynamically updating `DOM.style.setProperty('background-image', 'url(' + I_{CDN\_URL} + ')')`
 * and applying `\mathcal{T}_{smooth}`, `\mathcal{O}_{adjust}`, and `\mathcal{A}_{comply}`.
 */
export const DynamicBackgroundContainer: React.FC<DynamicBackgroundContainerProps> = ({
  backgroundConfig,
  overlaySettings,
  parallaxEnabled = false,
  interactiveEnabled = false,
  foregroundTextColor = '#FFFFFF',
  className,
  children,
  ...rest
}) => {
  const [currentBackgroundUrl, setCurrentBackgroundUrl] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(60); // Initialize with a reasonable default

  /**
   * @method updateBackground
   * @description Manages the asynchronous update of the background image, implementing `\mathcal{T}_{smooth}`.
   * This involves a fade-out/fade-in sequence to provide a visually pleasing transition.
   */
  const updateBackground = useCallback((newUrl: string | null) => {
    if (newUrl === currentBackgroundUrl) return;

    if (!newUrl) {
      setCurrentBackgroundUrl(null);
      return;
    }

    setTransitioning(true);
    if (backgroundRef.current) {
      backgroundRef.current.style.opacity = '0';
    }

    const timeoutId = setTimeout(() => {
      setCurrentBackgroundUrl(newUrl);
      if (backgroundRef.current) {
        backgroundRef.current.style.opacity = '1';
      }
      setTransitioning(false);
    }, TRANSITION_DURATION_MS); // Half the duration for fade-out, then new image appears, then fades in

    return () => clearTimeout(timeoutId);
  }, [currentBackgroundUrl]);

  useEffect(() => {
    updateBackground(backgroundConfig?.url || null);
  }, [backgroundConfig, updateBackground]);

  /**
   * @method handleScroll
   * @description Implements the `Parallax Scrolling Effect` (`P_{bg}(S_{pos}) = S_{pos} \cdot D_{factor}`).
   * Adjusts the `background-position-y` based on the scroll position.
   */
  const handleScroll = useCallback(() => {
    if (parallaxEnabled && backgroundRef.current) {
      const scrollY = window.scrollY;
      backgroundRef.current.style.backgroundPositionY = `${-scrollY * PARALLAX_DEPTH_FACTOR}px`;
    }
  }, [parallaxEnabled]);

  useEffect(() => {
    if (parallaxEnabled) {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial position setup
    } else {
      window.removeEventListener('scroll', handleScroll);
      if (backgroundRef.current) {
        backgroundRef.current.style.backgroundPositionY = 'center'; // Reset if disabled
      }
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallaxEnabled, handleScroll]);

  /**
   * @method estimateFPS
   * @description Energy Efficiency Monitor (EEM) component. Recursively requests animation frames
   * to estimate real-time frames per second (`N_{frames}`) and dynamically adjusts rendering fidelity.
   * If `P_{device} > P_{threshold}` (approximated by `N_{frames} < EEM_FPS_THRESHOLD`),
   * it suggests reducing `N_{frames}` or `C_{complexity}` (e.g., by increasing blur or reducing animation steps).
   */
  const estimateFPS = useCallback((currentTime: number) => {
    frameCountRef.current++;
    const delta = currentTime - lastFrameTimeRef.current;

    if (delta > 1000) { // Update FPS every second
      fpsRef.current = Math.round((frameCountRef.current * 1000) / delta);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = currentTime;

      // EEM logic: Dynamically adjust fidelity based on FPS
      if (fpsRef.current < EEM_FPS_THRESHOLD && overlayRef.current) {
        // Example: Increase blur or opacity to reduce perceived complexity
        const currentBlur = parseFloat(overlayRef.current.style.backdropFilter?.match(/blur\((\d+)px\)/)?.[1] || '0');
        if (currentBlur < 10) { // Limit max blur for readability
          overlayRef.current.style.backdropFilter = `blur(${currentBlur + 1}px)`;
          overlayRef.current.style.webkitBackdropFilter = `blur(${currentBlur + 1}px)`;
          // Log or send telemetry: UI_update(status_message, progress_percentage)
          console.warn(`EEM: Low FPS detected (${fpsRef.current}fps). Increasing blur to mitigate.`);
        }
      } else if (fpsRef.current > EEM_FPS_THRESHOLD + 10 && overlayRef.current) {
        // If performance recovers, gradually reduce adjustments
        const currentBlur = parseFloat(overlayRef.current.style.backdropFilter?.match(/blur\((\d+)px\)/)?.[1] || '0');
        if (currentBlur > 0) {
          overlayRef.current.style.backdropFilter = `blur(${Math.max(0, currentBlur - 1)}px)`;
          overlayRef.current.style.webkitBackdropFilter = `blur(${Math.max(0, currentBlur - 1)}px)`;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(estimateFPS);
  }, []);

  useEffect(() => {
    // Start EEM monitoring if interactive features are enabled or complex overlays are used
    if (interactiveEnabled || (overlaySettings?.autoAdjust && overlaySettings.blurRadius > 0)) {
      lastFrameTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(estimateFPS);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [interactiveEnabled, overlaySettings?.autoAdjust, overlaySettings?.blurRadius, estimateFPS]);

  /**
   * @method backgroundLuminance - Computed property to derive background luminance for overlay adjustments.
   * This is a placeholder; real implementation would require client-side image analysis or backend-derived metadata.
   */
  const backgroundLuminance = useMemo(() => {
    // In a production system, this would come from CAMM metadata or a client-side quick analysis
    // For this example, we'll assume a default or derive it from a simple heuristic
    if (!backgroundConfig?.url) return 0.5; // Default for no background

    // A simple heuristic: if URL has 'dark' or 'night', assume lower luminance
    if (backgroundConfig.url.toLowerCase().includes('dark') || backgroundConfig.url.toLowerCase().includes('night')) {
      return 0.2;
    }
    // if URL has 'light' or 'day', assume higher luminance
    if (backgroundConfig.url.toLowerCase().includes('light') || backgroundConfig.url.toLowerCase().includes('day')) {
      return 0.8;
    }
    return 0.5; // Neutral default
  }, [backgroundConfig?.url]);

  /**
   * @method adjustedOverlayStyle - Computes the dynamic overlay adjustments (`\mathcal{O}_{adjust}`).
   * It ensures optimal readability of text and visibility of UI elements, adapting to the dominant
   * colors and luminosity `L_{bg}` of the generated image based on WCAG principles.
   * `\alpha_{overlay} = f_{adjust}(L_{bg})`. `\sigma_{blur} = g_{adjust}(C_{complexity})`.
   */
  const adjustedOverlayStyle: CSSProperties = useMemo(() => {
    if (!overlaySettings) return {};

    let actualOpacity = overlaySettings.opacity;
    let actualBlur = overlaySettings.blurRadius;

    if (overlaySettings.autoAdjust) {
      actualOpacity = calculateOverlayOpacity(
        backgroundLuminance,
        overlaySettings.opacity,
        overlaySettings.color || '#000000',
        foregroundTextColor
      );
      // Example for adaptive blur: higher blur for more complex/noisy backgrounds
      // This would typically come from CAMM's aesthetic scoring C_complexity.
      // For now, a simple heuristic:
      if (fpsRef.current < EEM_FPS_THRESHOLD) {
          actualBlur = Math.min(20, actualBlur + (EEM_FPS_THRESHOLD - fpsRef.current) * 0.5); // Increase blur on low FPS
      } else {
          actualBlur = overlaySettings.blurRadius; // Revert to base blur on good performance
      }
    }

    return {
      backgroundColor: `rgba(${hexToRgb(overlaySettings.color || '#000000').join(',')}, ${actualOpacity})`,
      backdropFilter: `blur(${actualBlur}px)`,
      WebkitBackdropFilter: `blur(${actualBlur}px)`, // For Safari compatibility
      transition: `opacity ${TRANSITION_DURATION_MS / 2}ms ease-in-out, backdrop-filter ${TRANSITION_DURATION_MS / 2}ms ease-in-out`,
    };
  }, [overlaySettings, backgroundLuminance, foregroundTextColor]);

  const backgroundStyle: CSSProperties = {
    backgroundImage: currentBackgroundUrl ? `url("${currentBackgroundUrl}")` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: parallaxEnabled ? 'center top' : 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: parallaxEnabled ? 'fixed' : 'scroll',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -2, // Below the overlay and content
    transition: `opacity ${TRANSITION_DURATION_MS}ms ease-in-out`,
    opacity: transitioning ? 0 : 1, // Controlled by updateBackground method
  };

  const interactiveElementStyle: CSSProperties = useMemo(() => {
    if (!interactiveEnabled) return {};
    // A simple interactive element example: a subtle, slow-moving gradient overlay
    // In a full implementation, this might involve WebGL or Canvas animations
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1, // Above background, below main overlay
      background: 'linear-gradient(45deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.02) 100%)',
      animation: 'subtle-shift 20s infinite alternate linear',
      pointerEvents: 'none',
      opacity: fpsRef.current < EEM_FPS_THRESHOLD ? 0.3 : 1, // EEM-driven adjustment
    };
  }, [interactiveEnabled]);

  return (
    <div className={`dynamic-background-container ${className || ''}`} {...rest} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <style>{`
        @keyframes subtle-shift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>
      <div ref={backgroundRef} style={backgroundStyle} />
      {overlaySettings && (
        <div
          ref={overlayRef}
          className="dynamic-background-overlay"
          style={{
            ...adjustedOverlayStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1, // Above background, below content
            pointerEvents: 'none', // Ensure it doesn't block interactions
          }}
        />
      )}
      {interactiveEnabled && (
        <div style={interactiveElementStyle} />
      )}
      <div className="content-layer" style={{ position: 'relative', zIndex: 0, width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * @interface PromptInputFormProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 * @property {string} promptValue - The current value of the prompt input field.
 * @property {(prompt: string) => void} onPromptChange - Callback for when the prompt value changes.
 * @property {() => void} onSubmitPrompt - Callback for when the prompt is submitted.
 * @property {PromptValidationFeedback | null} validationFeedback - Real-time feedback from SPVS.
 * @property {BackgroundConfig | null} visualFeedbackPreview - Low-fidelity visual preview from VFL.
 * @property {string[]} [suggestedPrompts] - Suggestions from PHRE or PCCA.
 * @property {SystemStatus} systemStatus - Current status of the generation system.
 */
interface PromptInputFormProps extends React.HTMLAttributes<HTMLDivElement> {
  promptValue: string;
  onPromptChange: (prompt: string) => void;
  onSubmitPrompt: () => void;
  validationFeedback: PromptValidationFeedback | null;
  visualFeedbackPreview: BackgroundConfig | null;
  suggestedPrompts?: string[];
  systemStatus: SystemStatus;
}

/**
 * @component PromptInputForm
 * @description A comprehensive React component for user prompt acquisition and feedback.
 * This component integrates the User Interaction and Prompt Acquisition Module (UIPAM)
 * functionalities, including real-time semantic validation feedback (SPVS), prompt
 * co-creation assistance (PCCA) suggestions, and low-fidelity visual feedback (VFL).
 * It represents the primary textual interface for the user to articulate their subjective aesthetic intent.
 */
export const PromptInputForm: React.FC<PromptInputFormProps> = ({
  promptValue,
  onPromptChange,
  onSubmitPrompt,
  validationFeedback,
  visualFeedbackPreview,
  suggestedPrompts,
  systemStatus,
  className,
  ...rest
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validationFeedback?.safetyStatus === 'Blocked' || systemStatus.isLoading) {
      console.warn("Attempted to submit a blocked or currently processing prompt.");
      return;
    }
    onSubmitPrompt();
  }, [onSubmitPrompt, validationFeedback?.safetyStatus, systemStatus.isLoading]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onPromptChange(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onPromptChange]);

  const validationClass = validationFeedback ?
    (validationFeedback.safetyStatus === 'Blocked' ? 'prompt-blocked' :
      validationFeedback.safetyStatus === 'Flagged' ? 'prompt-flagged' :
      validationFeedback.qualityScore < 0.5 ? 'prompt-low-quality' : 'prompt-valid') : '';

  return (
    <div className={`prompt-input-form ${className || ''}`} {...rest}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label htmlFor="prompt-input" style={{ fontWeight: 'bold' }}>
          Articulate Your Aesthetic Intent:
        </label>
        <textarea
          id="prompt-input"
          ref={inputRef}
          value={promptValue}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g., 'A hyperrealistic ethereal forest at dawn, with luminous bioluminescent flora and a subtle mist, rendered in an Impressionistic style.'"
          rows={5}
          style={{ width: '100%', padding: '10px', border: `1px solid ${validationClass === 'prompt-blocked' ? 'red' : 'lightgray'}`, borderRadius: '4px' }}
          disabled={systemStatus.isLoading}
        />
        {validationFeedback && (
          <div className={`feedback-message ${validationClass}`} style={{ fontSize: '0.9em' }}>
            {validationFeedback.errorMessage && <p style={{ color: 'red' }}>Error: {validationFeedback.errorMessage}</p>}
            {validationFeedback.safetyStatus === 'Blocked' && <p style={{ color: 'red' }}>Content Blocked: This prompt violates policy guidelines.</p>}
            {validationFeedback.safetyStatus === 'Flagged' && <p style={{ color: 'orange' }}>Content Flagged: Review for potential policy violations.</p>}
            {validationFeedback.safetyStatus === 'Safe' && validationFeedback.qualityScore >= 0.5 && <p style={{ color: 'green' }}>Prompt Quality: {Math.round(validationFeedback.qualityScore * 100)}% - Ready for generation.</p>}
            {validationFeedback.qualityScore < 0.5 && validationFeedback.safetyStatus !== 'Blocked' && <p style={{ color: 'goldenrod' }}>Prompt Quality: {Math.round(validationFeedback.qualityScore * 100)}% - Consider refinements for better output.</p>}
          </div>
        )}

        {suggestedPrompts && suggestedPrompts.length > 0 && (
          <div className="prompt-suggestions" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
            <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>Suggestions:</span>
            {suggestedPrompts.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSuggestionClick(s)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '15px',
                  border: '1px solid #007bff',
                  background: '#e7f3ff',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '0.8em',
                  opacity: systemStatus.isLoading ? 0.6 : 1
                }}
                disabled={systemStatus.isLoading}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {visualFeedbackPreview?.lowFidelityPreviewUrl && (
          <div className="visual-feedback-loop" style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9em', marginBottom: '5px' }}>Visual Feedback Loop (VFL) Preview:</p>
            <img
              src={visualFeedbackPreview.lowFidelityPreviewUrl}
              alt="Low-fidelity preview"
              style={{ width: '100%', maxWidth: '200px', height: 'auto', borderRadius: '4px', border: '1px dashed #ccc' }}
            />
            <p style={{ fontSize: '0.75em', color: '#666', marginTop: '5px' }}>
              Note: This is a lightweight, conceptual representation and not the final high-fidelity output.
            </p>
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1em',
            marginTop: '15px',
            opacity: (validationFeedback?.safetyStatus === 'Blocked' || systemStatus.isLoading) ? 0.6 : 1
          }}
          disabled={validationFeedback?.safetyStatus === 'Blocked' || systemStatus.isLoading}
        >
          {systemStatus.isLoading ? systemStatus.message : 'Generate Dynamic Background'}
        </button>
        {systemStatus.isLoading && (
          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '4px', height: '10px', marginTop: '5px' }}>
            <div
              style={{
                width: `${systemStatus.percentage}%`,
                height: '100%',
                backgroundColor: '#28a745',
                borderRadius: '4px',
                transition: 'width 0.5s ease-in-out'
              }}
            />
          </div>
        )}
      </form>
    </div>
  );
};

/**
 * @interface PromptHistorySelectorProps
 * @extends React.HTMLAttributes<HTMLDivElement>
 * @property {BackgroundConfig[]} historyItems - An array of previously generated background configurations.
 * @property {(prompt: string) => void} onSelectPrompt - Callback function when a historical prompt is selected.
 * @property {() => void} [onClearHistory] - Optional callback to clear history.
 */
interface PromptHistorySelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  historyItems: BackgroundConfig[];
  onSelectPrompt: (prompt: string) => void;
  onClearHistory?: () => void;
}

/**
 * @component PromptHistorySelector
 * @description Provides an interface for users to review, reapply, or manage their previously
 * generated backgrounds and associated prompts. This component embodies elements of the
 * Prompt History and Recommendation Engine (PHRE) from the UIPAM, allowing for `re-selection`
 * and exploration of `Prompt Versioning System PVS` concepts.
 */
export const PromptHistorySelector: React.FC<PromptHistorySelectorProps> = ({
  historyItems,
  onSelectPrompt,
  onClearHistory,
  className,
  ...rest
}) => {
  return (
    <div className={`prompt-history-selector ${className || ''}`} {...rest} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>Your Aesthetic History</h3>
      {historyItems.length === 0 ? (
        <p style={{ color: '#666' }}>No past generations found. Your journey into personalized aesthetics awaits.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
          {historyItems.map((item, index) => (
            <div
              key={item.generationTimestamp || index}
              onClick={() => onSelectPrompt(item.prompt)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '220px', // Fixed height for consistent layout
                backgroundColor: '#fff',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                <img
                  src={item.url || item.lowFidelityPreviewUrl || 'https://via.placeholder.com/180x100?text=No+Image'}
                  alt={`Generated background for: ${item.prompt}`}
                  style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                />
                <p style={{ padding: '8px', fontSize: '0.85em', color: '#555', wordBreak: 'break-word', lineHeight: '1.3' }}>
                  {item.prompt.substring(0, 70)}{item.prompt.length > 70 ? '...' : ''}
                </p>
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7em', color: '#888' }}>
                  {item.generationTimestamp ? new Date(item.generationTimestamp).toLocaleDateString() : 'N/A'}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectPrompt(item.prompt); }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '3px',
                    border: '1px solid #007bff',
                    backgroundColor: 'transparent',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: '0.75em',
                    fontWeight: 'bold'
                  }}
                >
                  Reapply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {onClearHistory && historyItems.length > 0 && (
        <button
          onClick={onClearHistory}
          style={{
            marginTop: '20px',
            padding: '8px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em'
          }}
        >
          Clear History
        </button>
      )}
    </div>
  );
};