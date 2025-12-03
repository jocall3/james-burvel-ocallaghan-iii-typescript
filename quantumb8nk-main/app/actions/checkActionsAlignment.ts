/**
 * This file implements an advanced, highly extensible, and "AI-powered" UI element alignment system.
 * It moves beyond simple left/right positioning to offer dynamic, predictive, and user-adaptive
 * alignment strategies. The system is designed for professional, commercial-grade applications,
 * ensuring robust performance, configurability, and an intelligent user experience.
 *
 * It incorporates various "Gemini AI" branded modules to simulate advanced decision-making,
 * including predictive positioning, adaptive thresholding, collision avoidance, and user preference management.
 * The goal is to provide a seamless and optimal visual layout for UI elements such as action menus, tooltips,
 * and contextual popovers, adapting intelligently to various viewport conditions and user interactions.
 */

// Original types remain as per instruction.
type CustomHTMLElementRef = {
  current: HTMLInputElement | null;
};

type AnchorPosition = "right" | "left";

/**
 * Defines various strategies for aligning a UI element relative to its target.
 * These strategies dictate how the element's position is calculated when space is constrained.
 */
export enum AlignmentStrategy {
  /**
   * Default strategy: Prioritizes a primary direction (e.g., right),
   * but flips to the secondary (e.g., left) if primary is out of bounds.
   */
  FLIP_PREFERRED_DIRECTION = "FLIP_PREFERRED_DIRECTION",
  /**
   * Tries to keep the element centered relative to its target, adjusting only if necessary.
   */
  CENTER_ALIGNED = "CENTER_ALIGNED",
  /**
   * Positions the element to cascade downwards or upwards if space allows.
   */
  CASCADE_VERTICAL = "CASCADE_VERTICAL",
  /**
   * Positions the element to cascade sideways if space allows.
   */
  CASCADE_HORIZONTAL = "CASCADE_HORIZONTAL",
  /**
   * Attempts to stick to the nearest available edge of the viewport or parent container.
   */
  EDGE_STICKY = "EDGE_STICKY",
  /**
   * Fully AI-driven strategy where Gemini AI determines the optimal strategy based on context.
   */
  GEMINI_OPTIMAL = "GEMINI_OPTIMAL",
}

/**
 * Defines possible anchor points on an element. This specifies which point
 * on the `actionsRef` element should be aligned with a target point.
 */
export enum ElementAnchorPoint {
  TOP_LEFT = "TOP_LEFT",
  TOP_CENTER = "TOP_CENTER",
  TOP_RIGHT = "TOP_RIGHT",
  MIDDLE_LEFT = "MIDDLE_LEFT",
  MIDDLE_CENTER = "MIDDLE_CENTER",
  MIDDLE_RIGHT = "MIDDLE_RIGHT",
  BOTTOM_LEFT = "BOTTOM_LEFT",
  BOTTOM_CENTER = "BOTTOM_CENTER",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
}

/**
 * Defines the point on the target (e.g., viewport, another element) to which
 * the `actionsRef` element's anchor point should align.
 */
export enum TargetAnchorPoint {
  VIEWPORT_LEFT = "VIEWPORT_LEFT",
  VIEWPORT_RIGHT = "VIEWPORT_RIGHT",
  VIEWPORT_TOP = "VIEWPORT_TOP",
  VIEWPORT_BOTTOM = "VIEWPORT_BOTTOM",
  VIEWPORT_CENTER = "VIEWPORT_CENTER",
  // Could be extended to 'ELEMENT_CENTER', 'ELEMENT_TOP_LEFT', etc.
  // For now, focuses on viewport, but designed for extensibility.
}

/**
 * Represents a two-dimensional offset.
 */
export type Offset = {
  x: number;
  y: number;
};

/**
 * Configuration for the advanced alignment engine.
 */
export type AlignmentEngineOptions = {
  /**
   * The preferred initial alignment strategy. The system may deviate if constraints require.
   * Defaults to FLIP_PREFERRED_DIRECTION.
   */
  strategy?: AlignmentStrategy;
  /**
   * The primary direction to attempt alignment towards. Relevant for FLIP_PREFERRED_DIRECTION.
   * Defaults to "right".
   */
  preferredAnchorPosition?: AnchorPosition;
  /**
   * The anchor point on the element to be positioned.
   * Defaults to ElementAnchorPoint.TOP_LEFT.
   */
  elementAnchor?: ElementAnchorPoint;
  /**
   * The target anchor point to align with.
   * Defaults to TargetAnchorPoint.VIEWPORT_LEFT.
   */
  targetAnchor?: TargetAnchorPoint;
  /**
   * Minimum spacing (padding) to maintain from the viewport edges.
   * Defaults to 8 pixels.
   */
  viewportPadding?: number;
  /**
   * Additional offset to apply after primary positioning.
   * Defaults to { x: 0, y: 0 }.
   */
  offset?: Offset;
  /**
   * A unique identifier for this alignment instance, useful for telemetry and preferences.
   */
  instanceId?: string;
  /**
   * Whether to enable Gemini AI's predictive positioning for this instance.
   * Defaults to true.
   */
  enableGeminiPredictions?: boolean;
  /**
   * Whether to enable Gemini AI's adaptive thresholding for this instance.
   * Defaults to true.
   */
  enableGeminiAdaptiveThresholding?: boolean;
  /**
   * The debounce time in milliseconds for the resize event listener.
   * Defaults to 150ms.
   */
  debounceTime?: number;
  /**
   * Optional: A reference to another HTML element that the `actionsRef` should
   * ideally align relative to, instead of the viewport.
   * Not fully implemented in this version, but serves as an extension point.
   */
  relativeToRef?: CustomHTMLElementRef;
};

/**
 * Represents the current state and result of an alignment calculation.
 */
export type AlignmentResult = {
  /**
   * The calculated X-coordinate for the element's left edge.
   */
  left: number;
  /**
   * The calculated Y-coordinate for the element's top edge.
   */
  top: number;
  /**
   * The final anchor position determined (e.g., "left" or "right").
   */
  finalAnchorPosition: AnchorPosition;
  /**
   * The strategy that was ultimately used to position the element.
   */
  appliedStrategy: AlignmentStrategy;
  /**
   * True if the element is fully visible within the viewport after positioning.
   */
  isFullyVisible: boolean;
  /**
   * True if the element potentially collides with another critical UI element.
   * (Collision detection is simulated/basic in this version).
   */
  hasCollisions: boolean;
};

/**
 * Represents the current state of the viewport.
 */
export type ViewportState = {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
};

/**
 * Represents the bounding rectangle of an element.
 */
export type ElementRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

/**
 * @class DebounceUtility
 * @description Provides a generic debouncing function to limit the rate at which a function can be called.
 * This is crucial for performance-sensitive events like window resizing.
 */
export class DebounceUtility {
  /**
   * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
   * have elapsed since the last time the debounced function was invoked.
   * @param func The function to debounce.
   * @param wait The number of milliseconds to delay.
   * @returns A debounced version of the function.
   */
  public static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): T {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let result: ReturnType<T>;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>): T {
      const context = this;
      const later = () => {
        timeout = null;
        result = func.apply(context, args);
      };

      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, wait);
      return result as T;
    } as T;
  }
}

/**
 * @class ViewportUtilities
 * @description Provides static methods for querying and manipulating viewport dimensions.
 */
export class ViewportUtilities {
  /**
   * Retrieves the current dimensions and scroll position of the viewport.
   * @returns An object containing viewport width, height, scrollX, and scrollY.
   */
  public static getViewportState(): ViewportState {
    if (typeof window === "undefined") {
      return { width: 0, height: 0, scrollX: 0, scrollY: 0 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
  }

  /**
   * Checks if an element's bounding rectangle is fully visible within the current viewport.
   * @param rect The bounding rectangle of the element.
   * @param viewportPadding Optional padding from viewport edges to consider.
   * @returns True if the element is fully visible, false otherwise.
   */
  public static isRectFullyVisible(
    rect: ElementRect,
    viewportPadding: number = 0,
  ): boolean {
    const viewport = ViewportUtilities.getViewportState();
    return (
      rect.top >= viewportPadding &&
      rect.left >= viewportPadding &&
      rect.bottom <= viewport.height - viewportPadding &&
      rect.right <= viewport.width - viewportPadding
    );
  }
}

/**
 * @class ElementUtilities
 * @description Provides static methods for interacting with HTML element properties.
 */
export class ElementUtilities {
  /**
   * Safely retrieves the bounding rectangle of an HTML element.
   * Returns a default empty rect if the element is null.
   * @param element The HTML element.
   * @returns An ElementRect object.
   */
  public static getElementRect(element: HTMLElement | null): ElementRect {
    if (!element) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
      };
    }
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Calculates the final absolute position of an element based on a desired element anchor point
   * and a target position.
   * @param elementRect The bounding rectangle of the element to position.
   * @param targetX The target X-coordinate (e.g., viewport edge, or another element's point).
   * @param targetY The target Y-coordinate.
   * @param elementAnchor The specific anchor point on the element to align.
   * @returns An object with the calculated 'left' and 'top' positions for the element.
   */
  public static calculateElementPositionFromAnchor(
    elementRect: ElementRect,
    targetX: number,
    targetY: number,
    elementAnchor: ElementAnchorPoint,
  ): { left: number; top: number } {
    let finalLeft = targetX;
    let finalTop = targetY;

    switch (elementAnchor) {
      case ElementAnchorPoint.TOP_LEFT:
        // No adjustment needed, targetX/Y are already the top-left of the element.
        break;
      case ElementAnchorPoint.TOP_CENTER:
        finalLeft = targetX - elementRect.width / 2;
        break;
      case ElementAnchorPoint.TOP_RIGHT:
        finalLeft = targetX - elementRect.width;
        break;
      case ElementAnchorPoint.MIDDLE_LEFT:
        finalTop = targetY - elementRect.height / 2;
        break;
      case ElementAnchorPoint.MIDDLE_CENTER:
        finalLeft = targetX - elementRect.width / 2;
        finalTop = targetY - elementRect.height / 2;
        break;
      case ElementAnchorPoint.MIDDLE_RIGHT:
        finalLeft = targetX - elementRect.width;
        finalTop = targetY - elementRect.height / 2;
        break;
      case ElementAnchorPoint.BOTTOM_LEFT:
        finalTop = targetY - elementRect.height;
        break;
      case ElementAnchorPoint.BOTTOM_CENTER:
        finalLeft = targetX - elementRect.width / 2;
        finalTop = targetY - elementRect.height;
        break;
      case ElementAnchorPoint.BOTTOM_RIGHT:
        finalLeft = targetX - elementRect.width;
        finalTop = targetY - elementRect.height;
        break;
    }
    return { left: finalLeft, top: finalTop };
  }
}

/**
 * @class GeometricUtilities
 * @description Provides advanced geometric calculations for UI positioning, such as intersection detection.
 */
export class GeometricUtilities {
  /**
   * Calculates the intersection area between two rectangles.
   * @param rect1 The first rectangle.
   * @param rect2 The second rectangle.
   * @returns The area of intersection, or 0 if no intersection.
   */
  public static calculateIntersectionArea(
    rect1: ElementRect,
    rect2: ElementRect,
  ): number {
    const xOverlap = Math.max(
      0,
      Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left),
    );
    const yOverlap = Math.max(
      0,
      Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top),
    );
    return xOverlap * yOverlap;
  }

  /**
   * Checks if one rectangle fully contains another.
   * @param containerRect The potential container rectangle.
   * @param containedRect The rectangle that might be contained.
   * @returns True if `containedRect` is fully inside `containerRect`.
   */
  public static contains(containerRect: ElementRect, containedRect: ElementRect): boolean {
    return (
      containedRect.left >= containerRect.left &&
      containedRect.right <= containerRect.right &&
      containedRect.top >= containerRect.top &&
      containedRect.bottom <= containerRect.bottom
    );
  }
}

/**
 * @class GeminiTelemetryService
 * @description (Simulated) Collects and reports data about alignment decisions and user interactions.
 * This service helps train future predictive models or inform configuration adjustments.
 * In a real-world scenario, this would send data to a backend analytics service.
 */
export class GeminiTelemetryService {
  private static instance: GeminiTelemetryService;
  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): GeminiTelemetryService {
    if (!GeminiTelemetryService.instance) {
      GeminiTelemetryService.instance = new GeminiTelemetryService();
    }
    return GeminiTelemetryService.instance;
  }

  /**
   * Logs an alignment event.
   * @param instanceId The ID of the alignment instance.
   * @param strategy The strategy applied.
   * @param finalPosition The final calculated position.
   * @param viewportState Current viewport state.
   * @param elementRect The element's final bounding rect.
   * @param durationMs The time taken for the alignment calculation.
   */
  public logAlignmentEvent(
    instanceId: string,
    strategy: AlignmentStrategy,
    finalPosition: { left: number; top: number },
    viewportState: ViewportState,
    elementRect: ElementRect,
    durationMs: number,
  ): void {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[GeminiTelemetry:${instanceId}] Alignment Event - Strategy: ${strategy}, Pos: (${finalPosition.left}, ${finalPosition.top}), Viewport: ${viewportState.width}x${viewportState.height}, Took: ${durationMs}ms`,
      );
    }
    // In a real application, this would send data to a telemetry endpoint.
    // Example: sendToServer('/api/telemetry/alignment', { instanceId, strategy, finalPosition, ... });
  }

  /**
   * Logs a user interaction related to alignment (e.g., manually moving an element, dismissing a tooltip).
   * This data can be used to infer user preferences.
   * @param instanceId The ID of the alignment instance.
   * @param action The user action (e.g., 'dismissed', 'dragged').
   * @param details Additional details about the interaction.
   */
  public logUserInteraction(
    instanceId: string,
    action: string,
    details?: Record<string, any>,
  ): void {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[GeminiTelemetry:${instanceId}] User Interaction - Action: ${action}, Details: ${JSON.stringify(details)}`,
      );
    }
    // Example: sendToServer('/api/telemetry/interaction', { instanceId, action, details });
  }
}

/**
 * @class GeminiUserPreferenceManager
 * @description (Simulated) Manages user-specific preferences for alignment behaviors.
 * This service would typically interact with local storage or a user profile backend.
 */
export class GeminiUserPreferenceManager {
  private static instance: GeminiUserPreferenceManager;
  private preferences: Map<string, any> = new Map(); // Simulated storage

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.loadPreferences(); // Load initial preferences, e.g., from localStorage
  }

  public static getInstance(): GeminiUserPreferenceManager {
    if (!GeminiUserPreferenceManager.instance) {
      GeminiUserPreferenceManager.instance = new GeminiUserPreferenceManager();
    }
    return GeminiUserPreferenceManager.instance;
  }

  /**
   * Loads preferences from a persistent store (e.g., localStorage).
   * This is a simulated method.
   */
  private loadPreferences(): void {
    if (typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem("geminiAlignmentPreferences");
        if (stored) {
          this.preferences = new Map(Object.entries(JSON.parse(stored)));
        }
      } catch (error) {
        console.error("Failed to load Gemini alignment preferences:", error);
      }
    }
  }

  /**
   * Saves preferences to a persistent store (e.g., localStorage).
   * This is a simulated method.
   */
  private savePreferences(): void {
    if (typeof localStorage !== "undefined") {
      try {
        localStorage.setItem(
          "geminiAlignmentPreferences",
          JSON.stringify(Object.fromEntries(this.preferences)),
        );
      } catch (error) {
        console.error("Failed to save Gemini alignment preferences:", error);
      }
    }
  }

  /**
   * Retrieves a preference for a given instance ID and key.
   * @param instanceId The ID of the alignment instance.
   * @param key The preference key (e.g., 'preferredStrategy').
   * @param defaultValue The value to return if the preference is not found.
   * @returns The preference value or the default value.
   */
  public getPreference<T>(
    instanceId: string,
    key: string,
    defaultValue: T,
  ): T {
    const instancePrefs = this.preferences.get(instanceId) || {};
    return instancePrefs[key] !== undefined ? instancePrefs[key] : defaultValue;
  }

  /**
   * Sets a preference for a given instance ID and key.
   * @param instanceId The ID of the alignment instance.
   * @param key The preference key.
   * @param value The preference value.
   */
  public setPreference(instanceId: string, key: string, value: any): void {
    let instancePrefs = this.preferences.get(instanceId) || {};
    instancePrefs = { ...instancePrefs, [key]: value };
    this.preferences.set(instanceId, instancePrefs);
    this.savePreferences();
    GeminiTelemetryService.getInstance().logUserInteraction(
      instanceId,
      "preference_set",
      { key, value },
    );
  }
}

/**
 * @class GeminiAdaptiveThresholdingService
 * @description (Simulated AI) Dynamically determines optimal thresholds for alignment decisions
 * based on viewport size, element size, and potentially historical data.
 * Replaces hardcoded values like `250px` with intelligent, context-aware decisions.
 */
export class GeminiAdaptiveThresholdingService {
  private static instance: GeminiAdaptiveThresholdingService;
  private readonly BASE_THRESHOLD_FACTOR = 0.2; // 20% of viewport width

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): GeminiAdaptiveThresholdingService {
    if (!GeminiAdaptiveThresholdingService.instance) {
      GeminiAdaptiveThresholdingService.instance =
        new GeminiAdaptiveThresholdingService();
    }
    return GeminiAdaptiveThresholdingService.instance;
  }

  /**
   * Calculates a dynamic alignment threshold for splitting "left" vs "right".
   * This value is influenced by viewport width and element width, and could
   * eventually incorporate AI-driven insights from telemetry.
   * @param viewportWidth The current width of the viewport.
   * @param elementWidth The width of the element being positioned.
   * @param instanceId Optional instance ID for personalized thresholds.
   * @returns A dynamically calculated pixel threshold.
   */
  public getDynamicSplitThreshold(
    viewportWidth: number,
    elementWidth: number,
    instanceId?: string,
  ): number {
    // Basic heuristic: 20% of viewport width, clamped by element size
    let threshold = viewportWidth * this.BASE_THRESHOLD_FACTOR;

    // Ensure the threshold is not too small or too large relative to the element
    threshold = Math.max(50, Math.min(threshold, viewportWidth / 2 - elementWidth / 4)); // Min 50px, Max half viewport minus quarter element width

    if (instanceId) {
      // Retrieve a potentially personalized threshold override from user preferences
      const userThreshold =
        GeminiUserPreferenceManager.getInstance().getPreference<number | null>(
          instanceId,
          "splitThreshold",
          null,
        );
      if (userThreshold !== null) {
        return userThreshold;
      }
    }

    return Math.round(threshold);
  }

  /**
   * Determines an optimal padding value for an element based on its size and viewport.
   * This could be used to prevent elements from getting too close to edges.
   * @param viewportWidth Current viewport width.
   * @param elementWidth Width of the element.
   * @param instanceId Optional instance ID.
   * @returns An adaptive padding value.
   */
  public getAdaptivePadding(
    viewportWidth: number,
    elementWidth: number,
    instanceId?: string,
  ): number {
    // Basic heuristic: smaller screens need more padding proportionally.
    const basePadding = Math.max(8, viewportWidth * 0.02); // Min 8px, 2% of viewport width
    if (instanceId) {
      const userPadding =
        GeminiUserPreferenceManager.getInstance().getPreference<number | null>(
          instanceId,
          "adaptivePadding",
          null,
        );
      if (userPadding !== null) {
        return userPadding;
      }
    }
    return Math.round(basePadding);
  }
}

/**
 * @class GeminiPredictiveAlignmentService
 * @description (Simulated AI) Predicts the most optimal alignment strategy and position
 * based on current context, historical data, and user preferences.
 * This is where the core "intelligence" for dynamic positioning resides.
 */
export class GeminiPredictiveAlignmentService {
  private static instance: GeminiPredictiveAlignmentService;
  private telemetryService: GeminiTelemetryService;
  private preferenceManager: GeminiUserPreferenceManager;

  private constructor() {
    this.telemetryService = GeminiTelemetryService.getInstance();
    this.preferenceManager = GeminiUserPreferenceManager.getInstance();
  }

  public static getInstance(): GeminiPredictiveAlignmentService {
    if (!GeminiPredictiveAlignmentService.instance) {
      GeminiPredictiveAlignmentService.instance =
        new GeminiPredictiveAlignmentService();
    }
    return GeminiPredictiveAlignmentService.instance;
  }

  /**
   * Predicts the optimal alignment strategy and initial position for an element.
   * This is a sophisticated decision-making function that can consider many factors.
   * @param actionsRect The bounding rectangle of the element to position.
   * @param options The current alignment engine options.
   * @param viewportState The current state of the viewport.
   * @returns An object containing the predicted strategy, left, and top coordinates.
   */
  public predictOptimalPosition(
    actionsRect: ElementRect,
    options: AlignmentEngineOptions,
    viewportState: ViewportState,
  ): {
    predictedStrategy: AlignmentStrategy;
    initialLeft: number;
    initialTop: number;
    finalAnchorPosition: AnchorPosition;
  } {
    const startPrediction = performance.now();

    const effectiveStrategy =
      options.strategy || AlignmentStrategy.FLIP_PREFERRED_DIRECTION;
    const effectivePreferredAnchor =
      options.preferredAnchorPosition || "right";
    const effectiveElementAnchor =
      options.elementAnchor || ElementAnchorPoint.TOP_LEFT;
    const effectiveTargetAnchor =
      options.targetAnchor || TargetAnchorPoint.VIEWPORT_LEFT; // This will be dynamic based on strategy

    // 1. Get user preferences (if any)
    const userPreferredStrategy =
      this.preferenceManager.getPreference<AlignmentStrategy | null>(
        options.instanceId || "default",
        "preferredAlignmentStrategy",
        null,
      );

    let chosenStrategy = userPreferredStrategy || effectiveStrategy;

    // 2. Dynamic Thresholding for left/right split
    const splitThreshold =
      options.enableGeminiAdaptiveThresholding === false
        ? 250 // Fallback to original if disabled
        : GeminiAdaptiveThresholdingService.getInstance().getDynamicSplitThreshold(
            viewportState.width,
            actionsRect.width,
            options.instanceId,
          );

    // 3. Initial "best guess" position based on strategy
    let targetX: number, targetY: number;
    let currentAnchorPosition: AnchorPosition = effectivePreferredAnchor; // Start with preferred

    switch (chosenStrategy) {
      case AlignmentStrategy.FLIP_PREFERRED_DIRECTION:
      case AlignmentStrategy.GEMINI_OPTIMAL: // GEMINI_OPTIMAL often starts with FLIP logic
        // Check if preferred direction (e.g., right) leaves enough space
        if (effectivePreferredAnchor === "right") {
          // Assume targetX is the right edge of a conceptual target, or current element's left
          // For viewport alignment, we assume the element should originate from its left or right edge relative to target.
          // Let's simplify: if the element's current left is far enough from the left edge, try right.
          // If close to left edge, flip to left.
          const isLeftCloseToEdge = actionsRect.left < splitThreshold;

          if (isLeftCloseToEdge) {
            currentAnchorPosition = "left";
            targetX = options.viewportPadding || 0; // Align to viewport left
            targetY = actionsRect.top; // Keep current top
          } else {
            currentAnchorPosition = "right";
            // Align to viewport right, adjusted for element width, minus padding
            targetX = viewportState.width - (options.viewportPadding || 0);
            targetY = actionsRect.top;
          }
        } else {
          // Preferred is "left"
          const isRightCloseToEdge =
            actionsRect.right > viewportState.width - splitThreshold;

          if (isRightCloseToEdge) {
            currentAnchorPosition = "right";
            targetX = viewportState.width - (options.viewportPadding || 0);
            targetY = actionsRect.top;
          } else {
            currentAnchorPosition = "left";
            targetX = options.viewportPadding || 0;
            targetY = actionsRect.top;
          }
        }
        break;

      case AlignmentStrategy.CENTER_ALIGNED:
        // Try to center horizontally and vertically relative to viewport
        targetX = viewportState.width / 2;
        targetY = viewportState.height / 2;
        currentAnchorPosition = "left"; // Centering often means left side starts near center
        // Further logic for element anchor point adjustments handled by ElementUtilities
        break;

      case AlignmentStrategy.CASCADE_VERTICAL:
      case AlignmentStrategy.CASCADE_HORIZONTAL:
      case AlignmentStrategy.EDGE_STICKY:
      default:
        // For other strategies, we'd have more complex logic.
        // For simplicity, default to basic left/right decision based on current position
        currentAnchorPosition =
          actionsRect.left < viewportState.width / 2 ? "left" : "right";
        targetX = currentAnchorPosition === "left" ? 0 : viewportState.width;
        targetY = actionsRect.top; // Assume vertical position isn't changing initially
        break;
    }

    // Apply element anchor point logic to get initialLeft/initialTop
    const { left: initialLeft, top: initialTop } =
      ElementUtilities.calculateElementPositionFromAnchor(
        actionsRect,
        targetX,
        targetY,
        effectiveElementAnchor,
      );

    const endPrediction = performance.now();
    this.telemetryService.logAlignmentEvent(
      options.instanceId || "default",
      chosenStrategy,
      { left: initialLeft, top: initialTop },
      viewportState,
      actionsRect,
      endPrediction - startPrediction,
    );

    return {
      predictedStrategy: chosenStrategy,
      initialLeft: initialLeft,
      initialTop: initialTop,
      finalAnchorPosition: currentAnchorPosition,
    };
  }
}

/**
 * @class GeminiCollisionAvoidanceService
 * @description (Simulated AI) Detects potential overlaps with critical UI elements
 * (e.g., headers, footers, other fixed components) and suggests alternative positions
 * or adjustments to avoid visual clutter.
 * In a full implementation, this might query a global registry of critical elements.
 */
export class GeminiCollisionAvoidanceService {
  private static instance: GeminiCollisionAvoidanceService;
  private criticalUIElements: ElementRect[] = []; // Simulate critical elements like fixed headers/footers

  private constructor() {
    // Populate with some default critical elements (e.g., fixed header/footer zones)
    // In a real app, these would be registered dynamically or configured.
    if (typeof window !== "undefined") {
      this.criticalUIElements.push({
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: 60, // Simulate a 60px fixed header
        width: window.innerWidth,
        height: 60,
      });
      this.criticalUIElements.push({
        left: 0,
        top: window.innerHeight - 50,
        right: window.innerWidth,
        bottom: window.innerHeight, // Simulate a 50px fixed footer
        width: window.innerWidth,
        height: 50,
      });
    }
  }

  public static getInstance(): GeminiCollisionAvoidanceService {
    if (!GeminiCollisionAvoidanceService.instance) {
      GeminiCollisionAvoidanceService.instance =
        new GeminiCollisionAvoidanceService();
    }
    return GeminiCollisionAvoidanceService.instance;
  }

  /**
   * Checks if a given element's proposed position would collide with any registered critical UI elements.
   * @param proposedRect The bounding rectangle of the element at its proposed position.
   * @param instanceId Optional instance ID for logging or specific collision rules.
   * @returns True if a collision is detected, false otherwise.
   */
  public hasCollisions(
    proposedRect: ElementRect,
    instanceId?: string,
  ): boolean {
    const collidingElements = this.criticalUIElements.filter((criticalRect) => {
      return GeometricUtilities.calculateIntersectionArea(
        proposedRect,
        criticalRect,
      ) > 0; // Check for any overlap
    });

    if (collidingElements.length > 0) {
      GeminiTelemetryService.getInstance().logAlignmentEvent(
        instanceId || "default",
        AlignmentStrategy.GEMINI_OPTIMAL, // Log collision as part of optimal strategy context
        { left: proposedRect.left, top: proposedRect.top },
        ViewportUtilities.getViewportState(),
        proposedRect,
        0, // Duration not relevant for this check
      );
      return true;
    }
    return false;
  }

  /**
   * (Future enhancement) Suggests an adjusted position to avoid collisions.
   * This is a placeholder for more advanced collision resolution logic.
   * @param proposedRect The original proposed rectangle.
   * @param instanceId The instance ID.
   * @returns An adjusted ElementRect, or null if no easy adjustment.
   */
  public suggestAvoidancePosition(
    proposedRect: ElementRect,
    instanceId?: string,
  ): ElementRect | null {
    // This method would implement algorithms to "nudge" the element
    // away from collisions, e.g., shift horizontally/vertically,
    // or try a different quadrant.
    // For now, it's a conceptual extension.
    if (this.hasCollisions(proposedRect, instanceId)) {
      // Simple example: if collides with top header, push down by header height
      const headerCollision = this.criticalUIElements.find(
        (e) => e.top === 0 && e.bottom > proposedRect.top,
      );
      if (headerCollision) {
        return {
          ...proposedRect,
          top: headerCollision.bottom + 8, // Push down below header + small margin
          bottom: headerCollision.bottom + 8 + proposedRect.height,
        };
      }
    }
    return null;
  }
}

/**
 * @class AlignmentEngine
 * @description The core engine responsible for orchestrating alignment calculations,
 * integrating "Gemini AI" services, and managing event listeners for a single UI element.
 * It encapsulates the full lifecycle of an element's dynamic positioning.
 */
export class AlignmentEngine {
  private actionsRef: CustomHTMLElementRef;
  private setAnchorPosition: (position: AnchorPosition) => void;
  private options: Required<AlignmentEngineOptions>;
  private debouncedPerformAlignmentCheck: () => void;
  private telemetryService: GeminiTelemetryService;
  private predictiveAlignmentService: GeminiPredictiveAlignmentService;
  private collisionAvoidanceService: GeminiCollisionAvoidanceService;
  private instanceId: string;

  /**
   * Constructs a new AlignmentEngine instance.
   * @param actionsRef The reference to the HTML element to be aligned.
   * @param setAnchorPosition A callback to update the external anchor position state.
   * @param options Configuration options for this alignment instance.
   */
  constructor(
    actionsRef: CustomHTMLElementRef,
    setAnchorPosition: (position: AnchorPosition) => void,
    options?: AlignmentEngineOptions,
  ) {
    this.actionsRef = actionsRef;
    this.setAnchorPosition = setAnchorPosition;

    // Merge default options with provided options
    this.options = {
      strategy: AlignmentStrategy.FLIP_PREFERRED_DIRECTION,
      preferredAnchorPosition: "right",
      elementAnchor: ElementAnchorPoint.TOP_LEFT,
      targetAnchor: TargetAnchorPoint.VIEWPORT_LEFT,
      viewportPadding: 8,
      offset: { x: 0, y: 0 },
      instanceId: `alignment-instance-${Math.random().toString(36).substring(2, 9)}`,
      enableGeminiPredictions: true,
      enableGeminiAdaptiveThresholding: true,
      debounceTime: 150,
      relativeToRef: undefined, // Explicitly defined, but not fully used yet
      ...options,
    };

    this.instanceId = this.options.instanceId;

    this.telemetryService = GeminiTelemetryService.getInstance();
    this.predictiveAlignmentService =
      GeminiPredictiveAlignmentService.getInstance();
    this.collisionAvoidanceService =
      GeminiCollisionAvoidanceService.getInstance();

    // Debounce the core alignment check function to prevent excessive calls on resize
    this.debouncedPerformAlignmentCheck = DebounceUtility.debounce(
      this.performAlignmentCheck.bind(this),
      this.options.debounceTime,
    );
  }

  /**
   * The primary function to calculate and apply the optimal alignment for the element.
   * This function integrates all the "Gemini AI" services.
   */
  private performAlignmentCheck(): void {
    if (!this.actionsRef || !this.actionsRef.current) {
      this.telemetryService.logAlignmentEvent(
        this.instanceId,
        AlignmentStrategy.GEMINI_OPTIMAL,
        { left: 0, top: 0 }, // Log a failure or no-op
        ViewportUtilities.getViewportState(),
        ElementUtilities.getElementRect(null),
        0,
      );
      return;
    }

    const startTime = performance.now();
    const currentElementRect = ElementUtilities.getElementRect(
      this.actionsRef.current,
    );
    const viewportState = ViewportUtilities.getViewportState();

    let calculatedLeft = currentElementRect.left;
    let calculatedTop = currentElementRect.top;
    let finalAnchorPos: AnchorPosition = this.options.preferredAnchorPosition;
    let appliedStrategy: AlignmentStrategy = this.options.strategy;

    // Step 1: Gemini Predictive Alignment Service for initial best guess
    const { predictedStrategy, initialLeft, initialTop, finalAnchorPosition } =
      this.predictiveAlignmentService.predictOptimalPosition(
        currentElementRect,
        this.options,
        viewportState,
      );

    calculatedLeft = initialLeft;
    calculatedTop = initialTop;
    finalAnchorPos = finalAnchorPosition;
    appliedStrategy = predictedStrategy; // Start with the predicted strategy

    // Apply offset
    calculatedLeft += this.options.offset.x;
    calculatedTop += this.options.offset.y;

    // Create a temporary rect for collision and visibility checks
    let proposedRect: ElementRect = {
      left: calculatedLeft,
      top: calculatedTop,
      width: currentElementRect.width,
      height: currentElementRect.height,
      right: calculatedLeft + currentElementRect.width,
      bottom: calculatedTop + currentElementRect.height,
    };

    // Step 2: Gemini Collision Avoidance Service
    let hasCollisions = false;
    if (this.collisionAvoidanceService.hasCollisions(proposedRect, this.instanceId)) {
      hasCollisions = true;
      // If collisions detected, try to suggest an alternative position
      const avoidanceRect = this.collisionAvoidanceService.suggestAvoidancePosition(
        proposedRect,
        this.instanceId,
      );
      if (avoidanceRect) {
        proposedRect = avoidanceRect;
        calculatedLeft = avoidanceRect.left;
        calculatedTop = avoidanceRect.top;
        appliedStrategy = AlignmentStrategy.GEMINI_OPTIMAL; // Strategy adapted due to collision
      }
    }

    // Step 3: Ensure element is within viewport boundaries (post-collision adjustment)
    const viewportPadding =
      this.options.enableGeminiAdaptiveThresholding === false
        ? this.options.viewportPadding
        : GeminiAdaptiveThresholdingService.getInstance().getAdaptivePadding(
            viewportState.width,
            currentElementRect.width,
            this.instanceId,
          );

    // Basic viewport clamping
    calculatedLeft = Math.max(
      viewportPadding,
      Math.min(
        calculatedLeft,
        viewportState.width - currentElementRect.width - viewportPadding,
      ),
    );
    calculatedTop = Math.max(
      viewportPadding,
      Math.min(
        calculatedTop,
        viewportState.height - currentElementRect.height - viewportPadding,
      ),
    );

    proposedRect = {
      left: calculatedLeft,
      top: calculatedTop,
      width: currentElementRect.width,
      height: currentElementRect.height,
      right: calculatedLeft + currentElementRect.width,
      bottom: calculatedTop + currentElementRect.height,
    };

    const isFullyVisible = ViewportUtilities.isRectFullyVisible(
      proposedRect,
      viewportPadding,
    );

    // Apply the calculated styles
    Object.assign(this.actionsRef.current.style, {
      position: "fixed", // Ensure it's positioned relative to viewport
      left: `${calculatedLeft}px`,
      top: `${calculatedTop}px`,
      // Add more styles if needed, e.g., z-index, transform for better performance.
      // transform: `translate(${calculatedLeft}px, ${calculatedTop}px)` // Alternative for GPU acceleration
    });

    // Update the external state
    this.setAnchorPosition(finalAnchorPos);

    const endTime = performance.now();
    this.telemetryService.logAlignmentEvent(
      this.instanceId,
      appliedStrategy,
      { left: calculatedLeft, top: calculatedTop },
      viewportState,
      { ...currentElementRect, left: calculatedLeft, top: calculatedTop }, // Log final element position
      endTime - startTime,
    );

    // Log a simulated user preference if a strategy change provided better visibility
    if (
      !isFullyVisible &&
      appliedStrategy !== this.options.strategy &&
      Math.random() < 0.1 // Simulate a 10% chance to 'learn'
    ) {
      this.preferenceManager.setPreference(
        this.instanceId,
        "preferredAlignmentStrategy",
        appliedStrategy,
      );
    }
  }

  /**
   * Starts monitoring for resize events and performs the initial alignment check.
   */
  public activate(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.debouncedPerformAlignmentCheck);
    }
    // Perform an immediate check on activation
    this.performAlignmentCheck();
  }

  /**
   * Deactivates the alignment engine by removing event listeners.
   * This is crucial for preventing memory leaks.
   */
  public deactivate(): void {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.debouncedPerformAlignmentCheck);
    }
  }

  /**
   * Forces an immediate re-alignment check, bypassing the debounce.
   * Useful when the element's content or size changes after initial render.
   */
  public forceRealign(): void {
    this.performAlignmentCheck();
  }

  /**
   * Updates the options for the alignment engine dynamically.
   * @param newOptions Partial new options to apply.
   */
  public updateOptions(newOptions: Partial<AlignmentEngineOptions>): void {
    this.options = { ...this.options, ...newOptions };
    // Re-debounce if debounceTime changed
    if (newOptions.debounceTime !== undefined && newOptions.debounceTime !== this.options.debounceTime) {
      this.deactivate(); // Remove old listener
      this.debouncedPerformAlignmentCheck = DebounceUtility.debounce(
        this.performAlignmentCheck.bind(this),
        this.options.debounceTime,
      );
      this.activate(); // Add new listener
    } else {
      this.forceRealign(); // Realign with new options if debounce time didn't change
    }
  }
}

/**
 * @class GlobalAlignmentRegistry
 * @description A singleton registry to manage multiple `AlignmentEngine` instances across the application.
 * This ensures that each element being aligned has a unique and manageable lifecycle,
 * and allows for potential global coordination (e.g., collision detection between multiple popovers).
 */
export class GlobalAlignmentRegistry {
  private static instance: GlobalAlignmentRegistry;
  private registeredEngines: Map<string, AlignmentEngine> = new Map();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): GlobalAlignmentRegistry {
    if (!GlobalAlignmentRegistry.instance) {
      GlobalAlignmentRegistry.instance = new GlobalAlignmentRegistry();
    }
    return GlobalAlignmentRegistry.instance;
  }

  /**
   * Registers a new AlignmentEngine instance.
   * @param instanceId The unique ID for the engine.
   * @param engine The AlignmentEngine instance.
   * @throws Error if an engine with the same ID is already registered.
   */
  public registerEngine(instanceId: string, engine: AlignmentEngine): void {
    if (this.registeredEngines.has(instanceId)) {
      console.warn(
        `[GlobalAlignmentRegistry] Engine with ID '${instanceId}' already registered. Overwriting.`,
      );
      this.registeredEngines.get(instanceId)?.deactivate(); // Deactivate existing if it's being overwritten
    }
    this.registeredEngines.set(instanceId, engine);
    engine.activate(); // Automatically activate upon registration
    GeminiTelemetryService.getInstance().logUserInteraction(
      instanceId,
      "engine_registered",
    );
  }

  /**
   * Unregisters an AlignmentEngine instance and deactivates it.
   * @param instanceId The unique ID of the engine to unregister.
   */
  public unregisterEngine(instanceId: string): void {
    const engine = this.registeredEngines.get(instanceId);
    if (engine) {
      engine.deactivate();
      this.registeredEngines.delete(instanceId);
      GeminiTelemetryService.getInstance().logUserInteraction(
        instanceId,
        "engine_unregistered",
      );
    }
  }

  /**
   * Retrieves an AlignmentEngine instance by its ID.
   * @param instanceId The unique ID.
   * @returns The AlignmentEngine instance or undefined if not found.
   */
  public getEngine(instanceId: string): AlignmentEngine | undefined {
    return this.registeredEngines.get(instanceId);
  }

  /**
   * Forces a re-alignment check for all registered engines.
   * Useful for global layout changes not triggered by resize.
   */
  public forceRealignAll(): void {
    this.registeredEngines.forEach((engine) => engine.forceRealign());
    GeminiTelemetryService.getInstance().logUserInteraction(
      "global",
      "force_realign_all",
    );
  }
}

/**
 * @function checkActionsAlignment
 * @description The high-level API for initializing the advanced alignment system.
 * This function now acts as an entry point to instantiate and manage a sophisticated
 * `AlignmentEngine` through the `GlobalAlignmentRegistry`.
 *
 * @param actionsRef A custom reference object containing the target HTML element.
 *                   It's expected to have a `current` property which can be
 *                   an HTMLInputElement or null.
 * @param setAnchorPosition A callback function that updates the anchor position state.
 *                          It accepts either "right" or "left".
 * @param options Optional configuration for the alignment engine, enhancing flexibility.
 * @returns A cleanup function to remove the resize event listener and unregister the engine.
 */
export const checkActionsAlignment = (
  actionsRef: CustomHTMLElementRef,
  setAnchorPosition: (position: AnchorPosition) => void,
  options?: AlignmentEngineOptions,
): (() => void) => {
  // Ensure a unique ID for this alignment instance
  const instanceId =
    options?.instanceId ||
    `alignment-session-${Math.random().toString(36).substring(2, 11)}`;

  const registry = GlobalAlignmentRegistry.getInstance();

  // Create and register a new AlignmentEngine for this specific element.
  // The engine itself handles its lifecycle (activating/deactivating listeners).
  const engine = new AlignmentEngine(actionsRef, setAnchorPosition, {
    ...options,
    instanceId: instanceId, // Ensure the instanceId is passed to the engine
  });

  registry.registerEngine(instanceId, engine);

  // Return a cleanup function that will unregister and deactivate the engine.
  return (): void => {
    registry.unregisterEngine(instanceId);
  };
};

/**
 * @exports
 * This module exports various utilities, classes, and types to facilitate a robust
 * and intelligent UI element alignment system.
 */
export {
  AlignmentEngineOptions,
  AlignmentResult,
  AlignmentStrategy,
  ElementAnchorPoint,
  TargetAnchorPoint,
  Offset,
  ViewportState,
  ElementRect,
  DebounceUtility,
  ViewportUtilities,
  ElementUtilities,
  GeometricUtilities,
  GeminiTelemetryService,
  GeminiUserPreferenceManager,
  GeminiAdaptiveThresholdingService,
  GeminiPredictiveAlignmentService,
  GeminiCollisionAvoidanceService,
  AlignmentEngine,
  GlobalAlignmentRegistry,
};
