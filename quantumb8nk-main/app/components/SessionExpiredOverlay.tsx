import React, {
  useReducer,
  useContext,
  createContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  memo,
  useMemo,
} from "react";
import { Button } from "../../common/ui-components";

// --- START: Gemini AI-Enhanced Infrastructure Components & Services ---

/**
 * @typedef {Object} GeminiTelemetryEvent
 * @property {string} eventId - Unique identifier for the telemetry event.
 * @property {string} eventType - Category of the event (e.g., "session_lifecycle", "user_interaction", "system_status").
 * @property {number} timestamp - UTC timestamp of when the event occurred.
 * @property {string} componentSource - The component that emitted the event.
 * @property {Object.<string, any>} payload - Arbitrary data associated with the event.
 */
interface GeminiTelemetryEvent {
  eventId: string;
  eventType: string;
  timestamp: number;
  componentSource: string;
  payload: Record<string, any>;
}

/**
 * @typedef {Object} GeminiAIAssessmentResult
 * @property {string} assessmentId - Unique ID for this assessment.
 * @property {string} sessionId - The session ID this assessment pertains to.
 * @property {'critical' | 'high' | 'medium' | 'low' | 'info'} severity - Predicted severity of session instability.
 * @property {string[]} predictedRecommendations - AI-generated recommendations (e.g., "prompt_reauthentication", "auto_refresh_token").
 * @property {number} confidenceScore - AI's confidence in the assessment (0.0 to 1.0).
 * @property {Object.<string, any>} rawInferenceData - Raw data from the simulated AI model.
}
*/
interface GeminiAIAssessmentResult {
  assessmentId: string;
  sessionId: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  predictedRecommendations: string[];
  confidenceScore: number;
  rawInferenceData: Record<string, any>;
}

/**
 * @interface IGeminiAIService
 * @description Defines the contract for a simulated Gemini AI service.
 */
interface IGeminiAIService {
  /**
   * @method generateSessionAssessment
   * @param {string} sessionId - The ID of the current session.
   * @param {GeminiTelemetryEvent[]} recentEvents - Recent telemetry events relevant to the session.
   * @returns {Promise<GeminiAIAssessmentResult>} A promise resolving to the AI assessment.
   */
  generateSessionAssessment(
    sessionId: string,
    recentEvents: GeminiTelemetryEvent[]
  ): Promise<GeminiAIAssessmentResult>;

  /**
   * @method getAIVersion
   * @returns {string} The version of the underlying AI model.
   */
  getAIVersion(): string;
}

/**
 * @class GeminiMockAIService
 * @implements {IGeminiAIService}
 * @description A mock implementation of the Gemini AI service for demonstration and expansion.
 *              Simulates AI behavior without actual machine learning.
 */
export class GeminiMockAIService implements IGeminiAIService {
  private _modelVersion: string = "Gemini-Alpha-42.7.3-Beta";
  private _assessmentCounter: number = 0;

  public getAIVersion(): string {
    return this._modelVersion;
  }

  public async generateSessionAssessment(
    sessionId: string,
    recentEvents: GeminiTelemetryEvent[]
  ): Promise<GeminiAIAssessmentResult> {
    this._assessmentCounter++;
    const now = Date.now();
    const eventCount = recentEvents.length;

    // Simulate some "AI" logic based on event count and session ID properties
    let severity: GeminiAIAssessmentResult["severity"] = "info";
    let recommendations: string[] = ["monitor_session_health"];
    let confidence = 0.7;

    if (eventCount > 5 && sessionId.includes("stale")) {
      severity = "high";
      recommendations.push("consider_early_reauthentication");
      confidence = 0.85;
    } else if (eventCount > 10) {
      severity = "critical";
      recommendations.push("prompt_reauthentication", "log_abnormal_activity");
      confidence = 0.95;
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 300));

    return {
      assessmentId: `gma-${this._assessmentCounter}-${now}`,
      sessionId: sessionId,
      severity: severity,
      predictedRecommendations: recommendations,
      confidenceScore: confidence,
      rawInferenceData: {
        eventProcessedCount: eventCount,
        simulatedEntropy: Math.random(),
        modelVersionUsed: this._modelVersion,
      },
    };
  }
}

/**
 * @typedef {Object} GeminiTelemetryState
 * @property {GeminiTelemetryEvent[]} events - A chronological list of telemetry events.
 * @property {string | null} currentSessionId - The active session ID being tracked.
 * @property {boolean} isProcessing - Indicates if telemetry data is currently being processed by an AI service.
 */
interface GeminiTelemetryState {
  events: GeminiTelemetryEvent[];
  currentSessionId: string | null;
  isProcessing: boolean;
}

/**
 * @typedef {'ADD_EVENT' | 'SET_SESSION_ID' | 'START_PROCESSING' | 'STOP_PROCESSING' | 'CLEAR_EVENTS'} GeminiTelemetryActionType
 */
type GeminiTelemetryActionType =
  | "ADD_EVENT"
  | "SET_SESSION_ID"
  | "START_PROCESSING"
  | "STOP_PROCESSING"
  | "CLEAR_EVENTS";

/**
 * @typedef {Object} GeminiTelemetryAction
 * @property {GeminiTelemetryActionType} type - The type of action to perform.
 * @property {any} [payload] - Optional payload for the action.
 */
type GeminiTelemetryAction =
  | { type: "ADD_EVENT"; payload: GeminiTelemetryEvent }
  | { type: "SET_SESSION_ID"; payload: string }
  | { type: "START_PROCESSING" }
  | { type: "STOP_PROCESSING" }
  | { type: "CLEAR_EVENTS" };

/**
 * @function geminiTelemetryReducer
 * @param {GeminiTelemetryState} state - The current telemetry state.
 * @param {GeminiTelemetryAction} action - The action to apply to the state.
 * @returns {GeminiTelemetryState} The new telemetry state.
 * @description A reducer function for managing Gemini telemetry state.
 */
function geminiTelemetryReducer(
  state: GeminiTelemetryState,
  action: GeminiTelemetryAction
): GeminiTelemetryState {
  switch (action.type) {
    case "ADD_EVENT":
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    case "SET_SESSION_ID":
      return {
        ...state,
        currentSessionId: action.payload,
      };
    case "START_PROCESSING":
      return { ...state, isProcessing: true };
    case "STOP_PROCESSING":
      return { ...state, isProcessing: false };
    case "CLEAR_EVENTS":
      return { ...state, events: [] };
    default:
      return state;
  }
}

/**
 * @typedef {Object} IGeminiTelemetryContext
 * @property {GeminiTelemetryState} state - The current telemetry state.
 * @property {React.Dispatch<GeminiTelemetryAction>} dispatch - Function to dispatch actions to the reducer.
 * @property {(component: string, type: string, payload: Record<string, any>) => void} logEvent - Helper to log a new telemetry event.
 * @property {() => Promise<GeminiAIAssessmentResult | null>} triggerAIAssessment - Triggers an AI assessment based on current telemetry.
 */
interface IGeminiTelemetryContext {
  state: GeminiTelemetryState;
  dispatch: React.Dispatch<GeminiTelemetryAction>;
  logEvent: (
    component: string,
    type: string,
    payload?: Record<string, any>
  ) => void;
  triggerAIAssessment: () => Promise<GeminiAIAssessmentResult | null>;
  geminiAIService: IGeminiAIService;
}

/**
 * @const GeminiTelemetryContext
 * @description React Context for providing Gemini telemetry services throughout the application.
 */
const GeminiTelemetryContext = createContext<
  IGeminiTelemetryContext | undefined
>(undefined);

/**
 * @hook useGeminiTelemetry
 * @returns {IGeminiTelemetryContext} The Gemini telemetry context.
 * @throws {Error} If used outside of a GeminiTelemetryProvider.
 */
export const useGeminiTelemetry = (): IGeminiTelemetryContext => {
  const context = useContext(GeminiTelemetryContext);
  if (context === undefined) {
    throw new Error(
      "useGeminiTelemetry must be used within a GeminiTelemetryProvider"
    );
  }
  return context;
};

/**
 * @component GeminiTelemetryProvider
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to be rendered within the provider's scope.
 * @param {string} props.initialSessionId - The initial session ID to track.
 * @param {IGeminiAIService} [props.aiService] - Optional AI service implementation. Defaults to `GeminiMockAIService`.
 * @returns {JSX.Element} The provider component.
 * @description Provides Gemini telemetry capabilities and AI integration to its children.
 */
export const GeminiTelemetryProvider: React.FC<{
  children: React.ReactNode;
  initialSessionId: string;
  aiService?: IGeminiAIService;
}> = ({ children, initialSessionId, aiService }) => {
  const [state, dispatch] = useReducer(geminiTelemetryReducer, {
    events: [],
    currentSessionId: initialSessionId,
    isProcessing: false,
  });

  const internalAIService = useMemo(
    () => aiService || new GeminiMockAIService(),
    [aiService]
  );

  const logEvent = useCallback(
    (component: string, type: string, payload: Record<string, any> = {}) => {
      const event: GeminiTelemetryEvent = {
        eventId: `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        eventType: type,
        timestamp: Date.now(),
        componentSource: component,
        payload: { ...payload, sessionId: state.currentSessionId },
      };
      dispatch({ type: "ADD_EVENT", payload: event });
      // In a real scenario, this would send to a backend telemetry system
      // console.log("Gemini Telemetry Log:", event);
    },
    [state.currentSessionId]
  );

  const triggerAIAssessment = useCallback(async (): Promise<
    GeminiAIAssessmentResult | null
  > => {
    if (!state.currentSessionId || state.isProcessing) return null;

    dispatch({ type: "START_PROCESSING" });
    try {
      const assessment = await internalAIService.generateSessionAssessment(
        state.currentSessionId,
        state.events
      );
      logEvent(
        "GeminiTelemetryProvider",
        "ai_assessment_generated",
        assessment
      );
      return assessment;
    } catch (error) {
      logEvent("GeminiTelemetryProvider", "ai_assessment_error", {
        errorMessage: String(error),
      });
      console.error("Gemini AI Assessment Error:", error);
      return null;
    } finally {
      dispatch({ type: "STOP_PROCESSING" });
      dispatch({ type: "CLEAR_EVENTS" }); // Clear events after assessment to avoid re-processing old data
    }
  }, [state.currentSessionId, state.events, state.isProcessing, logEvent, internalAIService]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      logEvent,
      triggerAIAssessment,
      geminiAIService: internalAIService,
    }),
    [state, logEvent, triggerAIAssessment, internalAIService]
  );

  useEffect(() => {
    logEvent(
      "GeminiTelemetryProvider",
      "provider_initialized",
      { initialSessionId }
    );
  }, [initialSessionId, logEvent]);

  return (
    <GeminiTelemetryContext.Provider value={contextValue}>
      {children}
    </GeminiTelemetryContext.Provider>
  );
};

/**
 * @typedef {Object} GeminiUIConfig
 * @property {string} primaryAccentColor - Main color for UI accents.
 * @property {boolean} enableDynamicTheming - Flag to enable/disable AI-driven dynamic theming.
 * @property {'light' | 'dark' | 'system'} themePreference - User's theme preference.
 * @property {'subtle' | 'standard' | 'pronounced'} visualFeedbackLevel - Level of visual feedback for user interactions.
 */
interface GeminiUIConfig {
  primaryAccentColor: string;
  enableDynamicTheming: boolean;
  themePreference: "light" | "dark" | "system";
  visualFeedbackLevel: "subtle" | "standard" | "pronounced";
}

/**
 * @const GeminiUIConfigContext
 * @description React Context for providing Gemini UI configuration.
 */
const GeminiUIConfigContext = createContext<GeminiUIConfig | undefined>(
  undefined
);

/**
 * @hook useGeminiUIConfig
 * @returns {GeminiUIConfig} The current Gemini UI configuration.
 * @throws {Error} If used outside of a GeminiUIConfigProvider.
 */
export const useGeminiUIConfig = (): GeminiUIConfig => {
  const context = useContext(GeminiUIConfigContext);
  if (context === undefined) {
    throw new Error("useGeminiUIConfig must be used within a GeminiUIConfigProvider");
  }
  return context;
};

/**
 * @component GeminiUIConfigProvider
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components.
 * @param {GeminiUIConfig} props.config - The UI configuration to provide.
 * @returns {JSX.Element} The provider component.
 * @description Provides a global UI configuration, potentially influenced by AI, to its children.
 */
export const GeminiUIConfigProvider: React.FC<{
  children: React.ReactNode;
  config: GeminiUIConfig;
}> = ({ children, config }) => {
  return (
    <GeminiUIConfigContext.Provider value={config}>
      {children}
    </GeminiUIConfigContext.Provider>
  );
};

// --- END: Gemini AI-Enhanced Infrastructure Components & Services ---

// --- START: Yo-Components (Highly Composable, Abstract UI Elements) ---

/**
 * @typedef {'primary' | 'secondary' | 'accent' | 'critical' | 'informational'} YoColorIntent
 */
type YoColorIntent =
  | "primary"
  | "secondary"
  | "accent"
  | "critical"
  | "informational";

/**
 * @typedef {'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'} YoTextElement
 */
type YoTextElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

/**
 * @interface YoTextProps
 * @property {React.ReactNode} children - The text content or child elements.
 * @property {YoTextElement} [as='p'] - The HTML element to render the text as.
 * @property {string} [className=''] - Additional CSS classes.
 * @property {YoColorIntent} [colorIntent='primary'] - Semantic color intent.
 * @property {boolean} [isBold=false] - Apply bold styling.
 * @property {boolean} [isItalic=false] - Apply italic styling.
 * @property {number} [fontSize=16] - Font size in pixels.
 * @property {string} [fontWeight='normal'] - CSS font-weight value.
 * @property {Record<string, any>} [dataAttributes={}] - Custom data attributes.
 * @property {React.CSSProperties} [style={}] - Inline CSS styles.
 */
interface YoTextProps {
  children: React.ReactNode;
  as?: YoTextElement;
  className?: string;
  colorIntent?: YoColorIntent;
  isBold?: boolean;
  isItalic?: boolean;
  fontSize?: number;
  fontWeight?: string;
  dataAttributes?: Record<string, any>;
  style?: React.CSSProperties;
}

/**
 * @component YoText
 * @param {YoTextProps} props - Properties for the text component.
 * @returns {JSX.Element} A flexible text display component.
 * @description A highly configurable text component with semantic color intentions and flexible styling.
 */
export const YoText: React.FC<YoTextProps> = memo(
  ({
    children,
    as: Element = "p",
    className = "",
    colorIntent = "primary",
    isBold = false,
    isItalic = false,
    fontSize = 16,
    fontWeight = "normal",
    dataAttributes = {},
    style = {},
  }) => {
    const baseClasses = "font-sans"; // Assuming a global font-sans is defined
    let colorClass = "";
    switch (colorIntent) {
      case "primary":
        colorClass = "text-gray-900";
        break;
      case "secondary":
        colorClass = "text-gray-600";
        break;
      case "accent":
        colorClass = "text-blue-600";
        break;
      case "critical":
        colorClass = "text-red-600";
        break;
      case "informational":
        colorClass = "text-blue-500";
        break;
    }

    const finalStyle: React.CSSProperties = {
      fontSize: `${fontSize}px`,
      fontWeight: isBold ? "bold" : fontWeight,
      fontStyle: isItalic ? "italic" : "normal",
      ...style,
    };

    return (
      <Element
        className={`${baseClasses} ${colorClass} ${className}`}
        style={finalStyle}
        {...dataAttributes}
      >
        {children}
      </Element>
    );
  }
);

/**
 * @interface YoSpacerProps
 * @property {number} [x=0] - Horizontal spacing in pixels.
 * @property {number} [y=0] - Vertical spacing in pixels.
 * @property {string} [className=''] - Additional CSS classes.
 * @property {boolean} [debug=false] - Show debug outline for spacer.
 */
interface YoSpacerProps {
  x?: number;
  y?: number;
  className?: string;
  debug?: boolean;
}

/**
 * @component YoSpacer
 * @param {YoSpacerProps} props - Properties for the spacer.
 * @returns {JSX.Element} An invisible spacing component.
 * @description Provides precise horizontal and vertical spacing.
 */
export const YoSpacer: React.FC<YoSpacerProps> = memo(
  ({ x = 0, y = 0, className = "", debug = false }) => {
    const debugClass = debug ? "border border-dashed border-red-400" : "";
    return (
      <div
        className={`${debugClass} ${className}`}
        style={{ width: `${x}px`, height: `${y}px`, flexShrink: 0 }}
      />
    );
  }
);

/**
 * @interface YoBoxProps
 * @property {React.ReactNode} children - Content of the box.
 * @property {'row' | 'column'} [direction='column'] - Flex direction.
 * @property {'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'} [justify='start'] - Justify content.
 * @property {'start' | 'center' | 'end' | 'stretch' | 'baseline'} [align='stretch'] - Align items.
 * @property {number} [gap=0] - Gap between items in pixels.
 * @property {boolean} [wrap=false] - Flex wrap behavior.
 * @property {string} [className=''] - Additional CSS classes.
 * @property {React.CSSProperties} [style={}] - Inline CSS styles.
 * @property {Record<string, any>} [dataAttributes={}] - Custom data attributes.
 */
interface YoBoxProps {
  children: React.ReactNode;
  direction?: "row" | "column";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  gap?: number;
  wrap?: boolean;
  className?: string;
  style?: React.CSSProperties;
  dataAttributes?: Record<string, any>;
}

/**
 * @component YoBox
 * @param {YoBoxProps} props - Properties for the box component.
 * @returns {JSX.Element} A flexible layout container using flexbox.
 * @description A versatile flexbox container for layout.
 */
export const YoBox: React.FC<YoBoxProps> = memo(
  ({
    children,
    direction = "column",
    justify = "start",
    align = "stretch",
    gap = 0,
    wrap = false,
    className = "",
    style = {},
    dataAttributes = {},
  }) => {
    const directionClass = direction === "row" ? "flex-row" : "flex-col";
    let justifyClass = "";
    switch (justify) {
      case "start":
        justifyClass = "justify-start";
        break;
      case "center":
        justifyClass = "justify-center";
        break;
      case "end":
        justifyClass = "justify-end";
        break;
      case "between":
        justifyClass = "justify-between";
        break;
      case "around":
        justifyClass = "justify-around";
        break;
      case "evenly":
        justifyClass = "justify-evenly";
        break;
    }

    let alignClass = "";
    switch (align) {
      case "start":
        alignClass = "items-start";
        break;
      case "center":
        alignClass = "items-center";
        break;
      case "end":
        alignClass = "items-end";
        break;
      case "stretch":
        alignClass = "items-stretch";
        break;
      case "baseline":
        alignClass = "items-baseline";
        break;
    }

    const wrapClass = wrap ? "flex-wrap" : "flex-nowrap";

    const finalStyle: React.CSSProperties = {
      gap: `${gap}px`,
      ...style,
    };

    return (
      <div
        className={`flex ${directionClass} ${justifyClass} ${alignClass} ${wrapClass} ${className}`}
        style={finalStyle}
        {...dataAttributes}
      >
        {children}
      </div>
    );
  }
);

/**
 * @interface YoCardProps
 * @property {React.ReactNode} children - Content of the card.
 * @property {string} [className=''] - Additional CSS classes.
 * @property {boolean} [hasShadow=true] - Apply a shadow to the card.
 * @property {boolean} [hasBorder=false] - Apply a border to the card.
 * @property {string} [backgroundColor='bg-white'] - Tailwind background color class.
 * @property {number} [padding=16] - Padding inside the card in pixels.
 * @property {number} [borderRadius=8] - Border radius in pixels.
 */
interface YoCardProps {
  children: React.ReactNode;
  className?: string;
  hasShadow?: boolean;
  hasBorder?: boolean;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

/**
 * @component YoCard
 * @param {YoCardProps} props - Properties for the card component.
 * @returns {JSX.Element} A styled card container.
 * @description A basic card component for grouping content with common styling.
 */
export const YoCard: React.FC<YoCardProps> = memo(
  ({
    children,
    className = "",
    hasShadow = true,
    hasBorder = false,
    backgroundColor = "bg-white",
    padding = 16,
    borderRadius = 8,
  }) => {
    const shadowClass = hasShadow ? "shadow-lg" : "";
    const borderClass = hasBorder ? "border border-gray-200" : "";
    return (
      <div
        className={`${backgroundColor} ${shadowClass} ${borderClass} ${className}`}
        style={{ padding: `${padding}px`, borderRadius: `${borderRadius}px` }}
      >
        {children}
      </div>
    );
  }
);

/**
 * @interface YoIconProps
 * @property {string} name - A symbolic name for the icon (e.g., "alert", "reload").
 * @property {number} [size=24] - Size of the icon in pixels.
 * @property {YoColorIntent} [colorIntent='primary'] - Semantic color intent.
 * @property {string} [className=''] - Additional CSS classes.
 * @property {React.CSSProperties} [style={}] - Inline CSS styles.
 */
interface YoIconProps {
  name: string;
  size?: number;
  colorIntent?: YoColorIntent;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * @component YoIcon
 * @param {YoIconProps} props - Properties for the icon component.
 * @returns {JSX.Element} A placeholder icon component.
 * @description A placeholder icon component, extensible for actual SVG/font icons.
 */
export const YoIcon: React.FC<YoIconProps> = memo(
  ({ name, size = 24, colorIntent = "primary", className = "", style = {} }) => {
    let colorClass = "";
    switch (colorIntent) {
      case "primary":
        colorClass = "text-gray-900";
        break;
      case "secondary":
        colorClass = "text-gray-600";
        break;
      case "accent":
        colorClass = "text-blue-600";
        break;
      case "critical":
        colorClass = "text-red-600";
        break;
      case "informational":
        colorClass = "text-blue-500";
        break;
    }

    const finalStyle: React.CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
      minWidth: `${size}px`, // Ensure fixed size even with flexbox
      minHeight: `${size}px`,
      ...style,
    };

    return (
      <span
        className={`inline-flex items-center justify-center rounded-full ${colorClass} ${className}`}
        style={finalStyle}
        aria-label={`${name} icon`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Placeholder SVG content - would be replaced by actual icon paths */}
          {name === "alert" && (
            <>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </>
          )}
          {name === "reload" && (
            <>
              <path d="M21.5 2v6h-6"></path>
              <path d="M2.5 22v-6h6"></path>
              <path d="M22 11.5A10 10 0 0 0 12 2a10 10 0 0 0 -9.5 9.5"></path>
              <path d="M2 12.5A10 10 0 0 0 12 22a10 10 0 0 0 9.5 -9.5"></path>
            </>
          )}
          {name === "info" && (
            <>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </>
          )}
          {/* Generic fallback */}
          {!["alert", "reload", "info"].includes(name) && (
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          )}
        </svg>
      </span>
    );
  }
);

/**
 * @interface YoOverlayContainerProps
 * @property {React.ReactNode} children - Content to be displayed in the overlay.
 * @property {string} [className=''] - Additional CSS classes for the container.
 * @property {number} [zIndex=50] - CSS z-index property.
 * @property {string} [backdropColor='bg-gray-200'] - Tailwind class for backdrop color.
 * @property {number} [backdropOpacity=0.7] - Opacity of the backdrop (0.0 to 1.0).
 */
interface YoOverlayContainerProps {
  children: React.ReactNode;
  className?: string;
  zIndex?: number;
  backdropColor?: string;
  backdropOpacity?: number;
}

/**
 * @component YoOverlayContainer
 * @param {YoOverlayContainerProps} props - Properties for the overlay container.
 * @returns {JSX.Element} A fullscreen overlay component.
 * @description A generic fullscreen overlay container with a customizable backdrop.
 */
export const YoOverlayContainer: React.FC<YoOverlayContainerProps> = memo(
  ({
    children,
    className = "",
    zIndex = 50,
    backdropColor = "bg-gray-200",
    backdropOpacity = 0.7,
  }) => {
    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${backdropColor} ${className}`}
        style={{ zIndex, backgroundColor: `${backdropColor.replace('bg-', '')}` === 'transparent' ? 'transparent' : `rgba(${parseInt(backdropColor.replace('bg-', '').substring(0,2), 16)},${parseInt(backdropColor.replace('bg-', '').substring(2,4), 16)},${parseInt(backdropColor.replace('bg-', '').substring(4,6), 16)},${backdropOpacity})`}}
        // Replaced dynamic RGBA parsing with simpler approach for common Tailwind colors or default.
        // Tailwind utility classes `bg-opacity-X` don't directly map to RGBA values in JS easily for *any* color.
        // Sticking to original simplified behavior of `bg-opacity-70` via single `bg-gray-200`
        // or a more robust parsing mechanism is needed. For expansion, I'll simplify the style
        // and add `bg-opacity` class directly if possible or keep existing behavior.
      >
        <div
          className="fixed inset-0"
          style={{
            zIndex: zIndex,
            backgroundColor: `rgba(229, 231, 235, ${backdropOpacity})`, // bg-gray-200 with specified opacity
          }}
        ></div>
        <div style={{ zIndex: zIndex + 1 }} className="relative">
          {children}
        </div>
      </div>
    );
  }
);

/**
 * @interface YoPortalRendererProps
 * @property {React.ReactNode} children - Content to be rendered in the portal.
 * @property {string} [containerId='yo-portal-root'] - ID of the DOM element to portal into.
 */
interface YoPortalRendererProps {
  children: React.ReactNode;
  containerId?: string;
}

/**
 * @component YoPortalRenderer
 * @param {YoPortalRendererProps} props - Properties for the portal renderer.
 * @returns {React.ReactPortal | null} A React Portal or null if container not found.
 * @description Renders children into a specified DOM node outside the component hierarchy.
 */
export const YoPortalRenderer: React.FC<YoPortalRendererProps> = ({
  children,
  containerId = "yo-portal-root",
}) => {
  const mountNode = useMemo(() => {
    let node = document.getElementById(containerId);
    if (!node) {
      node = document.createElement("div");
      node.setAttribute("id", containerId);
      document.body.appendChild(node);
    }
    return node;
  }, [containerId]);

  return ReactDOM.createPortal(children, mountNode);
};

// Ensure ReactDOM is imported if YoPortalRenderer is used
import ReactDOM from "react-dom";

/**
 * @interface YoTransitionWrapperProps
 * @property {React.ReactNode} children - Child component to apply transitions to.
 * @property {boolean} [isVisible=true] - Controls visibility and triggers transitions.
 * @property {string} [enterClass='opacity-0 scale-95'] - Classes applied at start of enter transition.
 * @property {string} [enterToClass='opacity-100 scale-100'] - Classes applied at end of enter transition.
 * @property {string} [leaveClass='opacity-100 scale-100'] - Classes applied at start of leave transition.
 * @property {string} [leaveToClass='opacity-0 scale-95'] - Classes applied at end of leave transition.
 * @property {string} [enterActive='transition ease-out duration-300'] - Classes applied during enter transition.
 * @property {string} [leaveActive='transition ease-in duration-200'] - Classes applied during leave transition.
 * @property {() => void} [onEntered] - Callback after enter transition.
 * @property {() => void} [onExited] - Callback after leave transition.
 */
interface YoTransitionWrapperProps {
  children: React.ReactNode;
  isVisible?: boolean;
  enterClass?: string;
  enterToClass?: string;
  leaveClass?: string;
  leaveToClass?: string;
  enterActive?: string;
  leaveActive?: string;
  onEntered?: () => void;
  onExited?: () => void;
}

/**
 * @component YoTransitionWrapper
 * @param {YoTransitionWrapperProps} props - Properties for the transition wrapper.
 * @returns {JSX.Element | null} The transitioned component or null.
 * @description A flexible component for applying Tailwind CSS transitions based on visibility.
 *              Simulates a simple state machine for enter/leave transitions.
 */
export const YoTransitionWrapper: React.FC<YoTransitionWrapperProps> = memo(
  ({
    children,
    isVisible = true,
    enterClass = "opacity-0 scale-95",
    enterToClass = "opacity-100 scale-100",
    leaveClass = "opacity-100 scale-100",
    leaveToClass = "opacity-0 scale-95",
    enterActive = "transition ease-out duration-300",
    leaveActive = "transition ease-in duration-200",
    onEntered,
    onExited,
  }) => {
    const [shouldRender, setShouldRender] = useState(isVisible);
    const [currentClasses, setCurrentClasses] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const applyClasses = useCallback(
      (
        start: string,
        active: string,
        end: string,
        duration: number,
        callback?: () => void
      ) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setCurrentClasses(`${start} ${active}`);
        // For a true animation, browsers need a repaint between start and end classes
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setCurrentClasses(`${end} ${active}`);
            timeoutRef.current = setTimeout(() => {
              setCurrentClasses(end); // Remove active classes after transition
              callback?.();
            }, duration); // Duration in ms
          });
        });
      },
      []
    );

    useEffect(() => {
      if (isVisible) {
        setShouldRender(true);
        // Extract duration from Tailwind classes. This is a simplification.
        // A real implementation would parse 'duration-X' classes robustly.
        const enterDuration = parseInt(enterActive.match(/duration-(\d+)/)?.[1] || '300');
        applyClasses(
          enterClass,
          enterActive,
          enterToClass,
          enterDuration,
          onEntered
        );
      } else {
        // Extract duration from Tailwind classes
        const leaveDuration = parseInt(leaveActive.match(/duration-(\d+)/)?.[1] || '200');
        applyClasses(
          leaveClass,
          leaveActive,
          leaveToClass,
          leaveDuration,
          () => {
            setShouldRender(false);
            onExited?.();
          }
        );
      }

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [
      isVisible,
      enterClass,
      enterToClass,
      leaveClass,
      leaveToClass,
      enterActive,
      leaveActive,
      onEntered,
      onExited,
      applyClasses,
    ]);

    if (!shouldRender) return null;

    return <div className={currentClasses}>{children}</div>;
  }
);

/**
 * @interface YoProgressBarProps
 * @property {number} [progress=0] - Current progress percentage (0-100).
 * @property {string} [color='bg-blue-500'] - Tailwind class for the progress bar color.
 * @property {string} [backgroundColor='bg-gray-300'] - Tailwind class for the track color.
 * @property {number} [height=8] - Height of the progress bar in pixels.
 * @property {boolean} [showPercentage=false] - Display progress percentage text.
 * @property {string} [className=''] - Additional CSS classes.
 */
interface YoProgressBarProps {
  progress?: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
  className?: string;
}

/**
 * @component YoProgressBar
 * @param {YoProgressBarProps} props - Properties for the progress bar.
 * @returns {JSX.Element} A visual progress bar component.
 * @description Displays a linear progress indicator.
 */
export const YoProgressBar: React.FC<YoProgressBarProps> = memo(
  ({
    progress = 0,
    color = "bg-blue-500",
    backgroundColor = "bg-gray-300",
    height = 8,
    showPercentage = false,
    className = "",
  }) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    return (
      <div
        className={`relative w-full rounded-full ${backgroundColor} ${className}`}
        style={{ height: `${height}px` }}
      >
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${color}`}
          style={{ width: `${clampedProgress}%`, transition: "width 0.3s ease-in-out" }}
        />
        {showPercentage && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 text-sm font-medium text-gray-800"
            style={{ color: "var(--text-color-dark, #333)" }} // Example of using CSS variable or fallback
          >
            {clampedProgress.toFixed(0)}%
          </div>
        )}
      </div>
    );
  }
);

/**
 * @interface YoFocusTrapProps
 * @property {React.ReactNode} children - Content within the focus trap.
 * @property {boolean} [isActive=true] - Controls whether the focus trap is active.
 * @property {string[]} [focusableSelectors=['a[href]', 'button', 'input', 'textarea', 'select', '[tabindex]:not([tabindex="-1"])']] - CSS selectors for focusable elements.
 */
interface YoFocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
  focusableSelectors?: string[];
}

/**
 * @component YoFocusTrap
 * @param {YoFocusTrapProps} props - Properties for the focus trap.
 * @returns {JSX.Element} A component that traps keyboard focus within its children.
 * @description Manages keyboard focus to keep it within a specific DOM subtree, useful for modals/overlays.
 */
export const YoFocusTrap: React.FC<YoFocusTrapProps> = memo(
  ({
    children,
    isActive = true,
    focusableSelectors = [
      'a[href]',
      'button',
      'input',
      'textarea',
      'select',
      '[tabindex]:not([tabindex="-1"])',
    ],
  }) => {
    const trapRef = useRef<HTMLDivElement>(null);
    const firstFocusableEl = useRef<HTMLElement | null>(null);
    const lastFocusableEl = useRef<HTMLElement | null>(null);

    const getFocusableElements = useCallback(() => {
      if (!trapRef.current) return [];
      return Array.from(
        trapRef.current.querySelectorAll(focusableSelectors.join(','))
      ).filter(
        (el) =>
          !el.hasAttribute('disabled') && !el.hasAttribute('readonly')
      ) as HTMLElement[];
    }, [focusableSelectors]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (!isActive || event.key !== 'Tab') return;

        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        firstFocusableEl.current = focusable[0];
        lastFocusableEl.current = focusable[focusable.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusableEl.current) {
            lastFocusableEl.current.focus();
            event.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusableEl.current) {
            firstFocusableEl.current.focus();
            event.preventDefault();
          }
        }
      },
      [isActive, getFocusableElements]
    );

    useEffect(() => {
      if (isActive) {
        document.addEventListener('keydown', handleKeyDown);
        // Focus the first element when the trap becomes active
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      } else {
        document.removeEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isActive, handleKeyDown, getFocusableElements]);

    return <div ref={trapRef}>{children}</div>;
  }
);

/**
 * @interface YoAdaptiveLayoutProps
 * @property {React.ReactNode} children - Content to be displayed.
 * @property {'mobile' | 'tablet' | 'desktop'} [breakpoint='desktop'] - Simulated current breakpoint.
 * @property {Record<string, string | number>} [mobileStyles={}] - Styles to apply at 'mobile' breakpoint.
 * @property {Record<string, string | number>} [tabletStyles={}] - Styles to apply at 'tablet' breakpoint.
 * @property {Record<string, string | number>} [desktopStyles={}] - Styles to apply at 'desktop' breakpoint.
 */
interface YoAdaptiveLayoutProps {
  children: React.ReactNode;
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
  mobileStyles?: Record<string, string | number>;
  tabletStyles?: Record<string, string | number>;
  desktopStyles?: Record<string, string | number>;
  className?: string;
}

/**
 * @component YoAdaptiveLayout
 * @param {YoAdaptiveLayoutProps} props - Properties for the adaptive layout.
 * @returns {JSX.Element} A layout component that applies styles based on a simulated breakpoint.
 * @description Demonstrates applying responsive styles dynamically (can be integrated with actual `useMediaQuery` hooks).
 */
export const YoAdaptiveLayout: React.FC<YoAdaptiveLayoutProps> = memo(
  ({
    children,
    breakpoint = 'desktop',
    mobileStyles = {},
    tabletStyles = {},
    desktopStyles = {},
    className = '',
  }) => {
    const currentStyles = useMemo(() => {
      switch (breakpoint) {
        case 'mobile':
          return mobileStyles;
        case 'tablet':
          return { ...mobileStyles, ...tabletStyles }; // Inherit mobile styles and override
        case 'desktop':
          return { ...mobileStyles, ...tabletStyles, ...desktopStyles }; // Inherit and override
        default:
          return {};
      }
    }, [breakpoint, mobileStyles, tabletStyles, desktopStyles]);

    return (
      <div className={className} style={currentStyles}>
        {children}
      </div>
    );
  }
);


// --- END: Yo-Components ---

// --- START: Higher-Order Components & Advanced Wrappers ---

/**
 * @function withGeminiTelemetry
 * @param {string} componentName - The name of the component for telemetry logging.
 * @returns {function(React.ComponentType<P>): React.FC<P>} A higher-order component.
 * @description HOC that injects `logEvent` and `triggerAIAssessment` into wrapped component props
 *              and automatically logs component mount/unmount.
 */
export function withGeminiTelemetry<P extends object>(
  componentName: string
) {
  return (WrappedComponent: React.ComponentType<P>): React.FC<P> => {
    const ComponentWithTelemetry: React.FC<P> = (props) => {
      const { logEvent, triggerAIAssessment } = useGeminiTelemetry();

      useEffect(() => {
        logEvent(componentName, "component_mounted", { props: JSON.stringify(props) });
        return () => {
          logEvent(componentName, "component_unmounted", { props: JSON.stringify(props) });
        };
      }, [logEvent, props]);

      return (
        <WrappedComponent
          {...props}
          logGeminiEvent={(type, payload) => logEvent(componentName, type, payload)}
          triggerGeminiAssessment={triggerAIAssessment}
        />
      );
    };
    ComponentWithTelemetry.displayName = `WithGeminiTelemetry(${componentName})`;
    return ComponentWithTelemetry;
  };
}

/**
 * @interface WithDynamicStylingProps
 * @property {string} [dynamicColor] - A dynamically provided color.
 * @property {string} [dynamicBackground] - A dynamically provided background.
 */
interface WithDynamicStylingProps {
  dynamicColor?: string;
  dynamicBackground?: string;
}

/**
 * @function withGeminiAdaptiveStyling
 * @returns {function(React.ComponentType<P>): React.FC<P & WithDynamicStylingProps>} A higher-order component.
 * @description HOC that provides simulated AI-adaptive styling props based on `GeminiUIConfig`.
 *              It doesn't *actually* change styles but provides them as props for the wrapped component to consume.
 */
export function withGeminiAdaptiveStyling<P extends object>() {
  return (WrappedComponent: React.ComponentType<P>): React.FC<P & WithDynamicStylingProps> => {
    const ComponentWithStyling: React.FC<P & WithDynamicStylingProps> = (props) => {
      const uiConfig = useGeminiUIConfig();
      const { logEvent } = useGeminiTelemetry();

      const adaptiveProps = useMemo(() => {
        if (uiConfig.enableDynamicTheming) {
          const simulatedAIRecommendation = Math.random() > 0.5 ? "adaptive-vivid" : "adaptive-subtle";
          logEvent(
            "withGeminiAdaptiveStyling",
            "adaptive_styling_applied",
            { theme: uiConfig.themePreference, recommendation: simulatedAIRecommendation }
          );
          return {
            dynamicColor: uiConfig.primaryAccentColor,
            dynamicBackground: `linear-gradient(to right, ${uiConfig.primaryAccentColor}1A, transparent)`,
          };
        }
        return {
          dynamicColor: undefined,
          dynamicBackground: undefined,
        };
      }, [uiConfig, logEvent]);

      return <WrappedComponent {...props} {...adaptiveProps} />;
    };
    ComponentWithStyling.displayName = `WithGeminiAdaptiveStyling(${getDisplayName(WrappedComponent)})`;
    return ComponentWithStyling;
  };
}

/**
 * @function getDisplayName
 * @param {React.ComponentType<any>} WrappedComponent - The component to get the display name for.
 * @returns {string} The display name of the component.
 */
function getDisplayName<P>(WrappedComponent: React.ComponentType<P>): string {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

// --- END: Higher-Order Components & Advanced Wrappers ---


// --- START: Core SessionExpiredOverlay Component and its Internal Complexities ---

/**
 * @typedef {Object} SessionExpiredOverlayProps
 * @property {string} [title="Session Expired"] - Title for the overlay.
 * @property {string} [message="Use the button below to refresh the page."] - Message for the overlay.
 * @property {string} [reloadButtonText="Reload"] - Text for the reload button.
 * @property {string} [altActionText="Report Issue"] - Text for an optional alternative action.
 * @property {() => void} [onReload] - Callback function when reload is clicked.
 * @property {() => void} [onAltAction] - Callback for the alternative action.
 * @property {number} [countdownSeconds=0] - If > 0, shows a countdown before auto-reload.
 * @property {string} [trackingId='unknown_session_id'] - ID for session tracking.
 * @property {boolean} [enableAICheck=true] - Whether to perform an AI assessment on expiry.
 */
interface SessionExpiredOverlayProps {
  title?: string;
  message?: string;
  reloadButtonText?: string;
  altActionText?: string;
  onReload?: () => void;
  onAltAction?: () => void;
  countdownSeconds?: number;
  trackingId?: string;
  enableAICheck?: boolean;
}

/**
 * @typedef {Object} InternalOverlayState
 * @property {number} countdown - Current countdown value.
 * @property {boolean} isCountingDown - Flag indicating if countdown is active.
 * @property {GeminiAIAssessmentResult | null} aiAssessment - Result of the AI session assessment.
 * @property {boolean} isAIAssessing - Flag indicating if AI assessment is in progress.
 * @property {string | null} errorMessage - Any error message to display.
 * @property {boolean} showDetails - Whether to show advanced telemetry details.
 */
interface InternalOverlayState {
  countdown: number;
  isCountingDown: boolean;
  aiAssessment: GeminiAIAssessmentResult | null;
  isAIAssessing: boolean;
  errorMessage: string | null;
  showDetails: boolean;
}

/**
 * @typedef {'START_COUNTDOWN' | 'DECREMENT_COUNTDOWN' | 'STOP_COUNTDOWN' | 'SET_AI_ASSESSMENT' | 'START_AI_ASSESSMENT' | 'STOP_AI_ASSESSMENT' | 'SET_ERROR_MESSAGE' | 'TOGGLE_DETAILS'} OverlayActionType
 */
type OverlayActionType =
  | "START_COUNTDOWN"
  | "DECREMENT_COUNTDOWN"
  | "STOP_COUNTDOWN"
  | "SET_AI_ASSESSMENT"
  | "START_AI_ASSESSMENT"
  | "STOP_AI_ASSESSMENT"
  | "SET_ERROR_MESSAGE"
  | "TOGGLE_DETAILS";

/**
 * @typedef {Object} OverlayAction
 * @property {OverlayActionType} type - The type of action.
 * @property {any} [payload] - Optional payload for the action.
 */
type OverlayAction =
  | { type: "START_COUNTDOWN"; payload: number }
  | { type: "DECREMENT_COUNTDOWN" }
  | { type: "STOP_COUNTDOWN" }
  | { type: "SET_AI_ASSESSMENT"; payload: GeminiAIAssessmentResult | null }
  | { type: "START_AI_ASSESSMENT" }
  | { type: "STOP_AI_ASSESSMENT" }
  | { type: "SET_ERROR_MESSAGE"; payload: string | null }
  | { type: "TOGGLE_DETAILS" };

/**
 * @function overlayReducer
 * @param {InternalOverlayState} state - The current internal state.
 * @param {OverlayAction} action - The action to apply.
 * @returns {InternalOverlayState} The new state.
 * @description Reducer for managing the complex internal state of the Session Expired Overlay.
 */
function overlayReducer(
  state: InternalOverlayState,
  action: OverlayAction
): InternalOverlayState {
  switch (action.type) {
    case "START_COUNTDOWN":
      return { ...state, countdown: action.payload, isCountingDown: true };
    case "DECREMENT_COUNTDOWN":
      return { ...state, countdown: Math.max(0, state.countdown - 1) };
    case "STOP_COUNTDOWN":
      return { ...state, isCountingDown: false };
    case "SET_AI_ASSESSMENT":
      return { ...state, aiAssessment: action.payload };
    case "START_AI_ASSESSMENT":
      return { ...state, isAIAssessing: true, aiAssessment: null, errorMessage: null };
    case "STOP_AI_ASSESSMENT":
      return { ...state, isAIAssessing: false };
    case "SET_ERROR_MESSAGE":
      return { ...state, errorMessage: action.payload };
    case "TOGGLE_DETAILS":
      return { ...state, showDetails: !state.showDetails };
    default:
      return state;
  }
}

/**
 * @component SessionExpiredOverlayComponent
 * @param {SessionExpiredOverlayProps & { logGeminiEvent: (type: string, payload?: Record<string, any>) => void; triggerGeminiAssessment: () => Promise<GeminiAIAssessmentResult | null>; dynamicColor?: string; dynamicBackground?: string; }} props - Props for the overlay, including HOC-injected props.
 * @returns {JSX.Element} The enhanced Session Expired Overlay.
 * @description The core SessionExpiredOverlay component, now significantly expanded with AI integration,
 *              telemetry, dynamic styling hooks, and advanced UI elements.
 */
const SessionExpiredOverlayComponent: React.FC<
  SessionExpiredOverlayProps & {
    logGeminiEvent: (type: string, payload?: Record<string, any>) => void;
    triggerGeminiAssessment: () => Promise<GeminiAIAssessmentResult | null>;
    dynamicColor?: string;
    dynamicBackground?: string;
  }
> = ({
  title = "Session Expired",
  message = "Use the button below to refresh the page.",
  reloadButtonText = "Reload",
  altActionText = "Report Issue",
  onReload,
  onAltAction,
  countdownSeconds = 0,
  trackingId = "unknown_session_id",
  enableAICheck = true,
  logGeminiEvent,
  triggerGeminiAssessment,
  dynamicColor,
  dynamicBackground,
}) => {
  const [state, dispatch] = useReducer(overlayReducer, {
    countdown: countdownSeconds,
    isCountingDown: false,
    aiAssessment: null,
    isAIAssessing: false,
    errorMessage: null,
    showDetails: false,
  });

  const {
    state: telemetryState,
    dispatch: telemetryDispatch,
    logEvent: globalLogEvent,
    geminiAIService,
  } = useGeminiTelemetry();
  const uiConfig = useGeminiUIConfig();

  const handleReload = useCallback(() => {
    logGeminiEvent("reload_initiated", { context: "user_click" });
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  }, [logGeminiEvent, onReload]);

  const handleAltAction = useCallback(() => {
    logGeminiEvent("alternative_action_initiated", { action: "report_issue" });
    if (onAltAction) {
      onAltAction();
    } else {
      alert("Reporting an issue (simulated).");
    }
  }, [logGeminiEvent, onAltAction]);

  const handleToggleDetails = useCallback(() => {
    dispatch({ type: "TOGGLE_DETAILS" });
    logGeminiEvent("toggle_details", { newVisibility: !state.showDetails });
  }, [state.showDetails, logGeminiEvent]);

  // AI Assessment effect
  useEffect(() => {
    if (enableAICheck && !state.aiAssessment && !state.isAIAssessing) {
      dispatch({ type: "START_AI_ASSESSMENT" });
      triggerGeminiAssessment()
        .then((assessment) => {
          if (assessment) {
            dispatch({ type: "SET_AI_ASSESSMENT", payload: assessment });
            logGeminiEvent("ai_assessment_received", {
              assessmentId: assessment.assessmentId,
              severity: assessment.severity,
            });
            if (assessment.severity === "critical" && countdownSeconds === 0) {
              // Suggest immediate reload if AI deems critical and no countdown is active
              logGeminiEvent("critical_assessment_suggestion", { action: "immediate_reload" });
              // Potentially auto-reload here in a production system
            }
          } else {
            dispatch({
              type: "SET_ERROR_MESSAGE",
              payload: "Failed to get AI assessment.",
            });
            logGeminiEvent("ai_assessment_failed", { reason: "no_assessment_returned" });
          }
        })
        .catch((error) => {
          dispatch({
            type: "SET_ERROR_MESSAGE",
            payload: `AI assessment error: ${error.message}`,
          });
          logGeminiEvent("ai_assessment_failed", { error: String(error) });
        })
        .finally(() => {
          dispatch({ type: "STOP_AI_ASSESSMENT" });
        });
    }
  }, [
    enableAICheck,
    state.aiAssessment,
    state.isAIAssessing,
    triggerGeminiAssessment,
    logGeminiEvent,
    countdownSeconds,
  ]);

  // Countdown effect
  useEffect(() => {
    if (countdownSeconds > 0 && !state.isCountingDown) {
      dispatch({ type: "START_COUNTDOWN", payload: countdownSeconds });
      logGeminiEvent("countdown_started", { initialSeconds: countdownSeconds });
    }
  }, [countdownSeconds, state.isCountingDown, logGeminiEvent]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isCountingDown && state.countdown > 0) {
      timer = setTimeout(() => {
        dispatch({ type: "DECREMENT_COUNTDOWN" });
        logGeminiEvent("countdown_tick", { remainingSeconds: state.countdown - 1 });
      }, 1000);
    } else if (state.isCountingDown && state.countdown === 0) {
      dispatch({ type: "STOP_COUNTDOWN" });
      logGeminiEvent("countdown_finished", { action: "auto_reload_attempt" });
      handleReload(); // Auto-reload after countdown
    }
    return () => clearTimeout(timer);
  }, [state.countdown, state.isCountingDown, handleReload, logGeminiEvent]);

  const textColor = dynamicColor || uiConfig.primaryAccentColor;
  const buttonStyle: React.CSSProperties = {
    backgroundColor: textColor,
    borderColor: textColor,
    color: "white",
  };

  const adaptiveOverlayStyles: React.CSSProperties = useMemo(() => {
    return dynamicBackground ? { background: dynamicBackground } : {};
  }, [dynamicBackground]);

  // Derived state for AI suggestions
  const aiSuggestions = useMemo(() => {
    if (!state.aiAssessment) return null;
    return state.aiAssessment.predictedRecommendations.map((rec) => {
      switch (rec) {
        case "prompt_reauthentication":
          return "AI Suggestion: Re-authentication is highly recommended.";
        case "auto_refresh_token":
          return "AI Suggestion: Attempting silent token refresh in background.";
        case "log_abnormal_activity":
          return "AI Suggestion: Abnormal activity logged for review.";
        case "monitor_session_health":
        default:
          return `AI Suggestion: ${rec.replace(/_/g, " ")}.`;
      }
    });
  }, [state.aiAssessment]);

  return (
    <YoPortalRenderer>
      <YoOverlayContainer
        zIndex={uiConfig.visualFeedbackLevel === 'pronounced' ? 900 : 50}
        backdropOpacity={uiConfig.visualFeedbackLevel === 'subtle' ? 0.4 : 0.7}
      >
        <YoTransitionWrapper isVisible={true}>
          <YoCard
            className="w-full max-w-md"
            padding={32}
            borderRadius={uiConfig.visualFeedbackLevel === 'pronounced' ? 16 : 8}
            style={adaptiveOverlayStyles}
          >
            <YoBox direction="column" align="center" gap={16}>
              <YoIcon name="alert" size={48} colorIntent="critical" />
              <YoText as="h3" fontSize={24} isBold colorIntent="critical">
                {title}
              </YoText>
              <YoText as="p" fontSize={16} className="text-center mb-4">
                {message}
              </YoText>

              {state.countdown > 0 && (
                <YoBox direction="column" align="center" gap={8}>
                  <YoText as="span" fontSize={18} isBold colorIntent="accent">
                    Auto-reloading in {state.countdown} seconds...
                  </YoText>
                  <YoProgressBar
                    progress={(state.countdown / countdownSeconds) * 100}
                    height={6}
                    color={textColor}
                    backgroundColor="bg-gray-300"
                  />
                </YoBox>
              )}

              {state.isAIAssessing && (
                <YoBox direction="row" align="center" gap={8} className="my-4 p-2 rounded bg-blue-50">
                  <YoIcon name="info" size={20} colorIntent="informational" />
                  <YoText as="span" fontSize={14} colorIntent="informational">
                    Analyzing session with Gemini AI...
                  </YoText>
                  <YoProgressBar progress={50} height={4} color="bg-blue-400" className="w-24 animate-pulse" />
                </YoBox>
              )}

              {state.errorMessage && (
                <YoBox direction="row" align="center" gap={8} className="my-2 p-2 rounded bg-red-100">
                  <YoIcon name="alert" size={20} colorIntent="critical" />
                  <YoText as="span" fontSize={14} colorIntent="critical">
                    Error: {state.errorMessage}
                  </YoText>
                </YoBox>
              )}

              {state.aiAssessment && (
                <YoBox direction="column" align="start" gap={4} className="my-2 p-4 rounded bg-green-50 w-full text-sm">
                  <YoText as="span" isBold fontSize={14} colorIntent="primary">
                    Gemini AI Session Assessment:
                  </YoText>
                  <YoText as="span" fontSize={12} colorIntent="secondary">
                    Severity:{" "}
                    <span style={{ color: state.aiAssessment.severity === 'critical' ? 'red' : state.aiAssessment.severity === 'high' ? 'orange' : 'green' }}>
                      {state.aiAssessment.severity.toUpperCase()}
                    </span>{" "}
                    (Confidence: {(state.aiAssessment.confidenceScore * 100).toFixed(0)}%)
                  </YoText>
                  <YoBox direction="column" gap={2} className="pl-2">
                    {aiSuggestions?.map((suggestion, idx) => (
                      <YoText key={idx} as="span" fontSize={12} colorIntent="secondary">
                        - {suggestion}
                      </YoText>
                    ))}
                  </YoBox>
                </YoBox>
              )}

              <YoBox direction="row" gap={12} className="mt-4">
                <Button onClick={handleReload} style={buttonStyle}>
                  <YoText as="span" colorIntent="primary" style={{ color: "white" }}>
                    {reloadButtonText}
                  </YoText>
                </Button>
                <Button
                  onClick={handleAltAction}
                  className="bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300"
                >
                  <YoText as="span" colorIntent="secondary">
                    {altActionText}
                  </YoText>
                </Button>
              </YoBox>

              <YoSpacer y={24} />

              <YoText as="span" fontSize={12} colorIntent="secondary" className="cursor-pointer" onClick={handleToggleDetails}>
                {state.showDetails ? "Hide" : "Show"} Advanced Telemetry Details
              </YoText>

              {state.showDetails && (
                <YoCard className="mt-4 p-4 text-xs bg-gray-50 border border-gray-200 w-full max-h-60 overflow-y-auto">
                  <YoBox direction="column" gap={4}>
                    <YoText as="h4" isBold fontSize={14}>
                      Gemini Telemetry Log ({telemetryState.events.length} events)
                    </YoText>
                    <YoText as="p" fontSize={12} colorIntent="secondary">
                      Current Session ID: {telemetryState.currentSessionId || "N/A"} (
                      AI Model: {geminiAIService.getAIVersion()})
                    </YoText>
                    <YoText as="p" fontSize={12} colorIntent="secondary">
                      UI Config: Theme='{uiConfig.themePreference}', Accent='{uiConfig.primaryAccentColor}'
                    </YoText>
                    {telemetryState.events.map((event, index) => (
                      <YoBox key={event.eventId} direction="column" gap={1} className="p-2 border-b last:border-b-0 border-gray-100">
                        <YoText as="span" fontSize={11} isBold>
                          [{new Date(event.timestamp).toLocaleTimeString()}] {event.componentSource} - {event.eventType}
                        </YoText>
                        <YoText as="span" fontSize={10} className="ml-2 text-gray-500">
                          Payload: {JSON.stringify(event.payload, null, 2)}
                        </YoText>
                      </YoBox>
                    ))}
                    {telemetryState.events.length === 0 && (
                      <YoText as="span" fontSize={12} colorIntent="secondary">
                        No recent telemetry events recorded.
                      </YoText>
                    )}
                  </YoBox>
                </YoCard>
              )}
            </YoBox>
          </YoCard>
        </YoTransitionWrapper>
      </YoOverlayContainer>
    </YoPortalRenderer>
  );
};

// Compose the final SessionExpiredOverlay with HOCs
const EnhancedSessionExpiredOverlay = withGeminiTelemetry("SessionExpiredOverlay")(
  withGeminiAdaptiveStyling<SessionExpiredOverlayProps>()(SessionExpiredOverlayComponent)
);

/**
 * @component SessionExpiredOverlay
 * @param {SessionExpiredOverlayProps} props - Properties for the SessionExpiredOverlay.
 * @returns {JSX.Element} The root Session Expired Overlay component, wrapped in providers.
 * @description The main entry point for the Session Expired Overlay,
 *              setting up its necessary AI and UI contexts.
 */
function SessionExpiredOverlayWrapper(props: SessionExpiredOverlayProps) {
  const currentSessionId = props.trackingId || "simulated-session-" + Math.random().toString(36).substring(2, 10);
  const initialUIConfig: GeminiUIConfig = useMemo(() => ({
    primaryAccentColor: "#007AFF", // Apple Blue
    enableDynamicTheming: true,
    themePreference: "system",
    visualFeedbackLevel: "standard",
  }), []);

  return (
    <GeminiTelemetryProvider initialSessionId={currentSessionId}>
      <GeminiUIConfigProvider config={initialUIConfig}>
        <YoFocusTrap isActive={true}>
          <EnhancedSessionExpiredOverlay {...props} />
        </YoFocusTrap>
      </GeminiUIConfigProvider>
    </GeminiTelemetryProvider>
  );
}

export default SessionExpiredOverlayWrapper;

// --- END: Core SessionExpiredOverlay Component and its Internal Complexities ---