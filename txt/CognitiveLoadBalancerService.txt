// --- Global Types/Interfaces ---
export enum UiElementType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  GUIDED = 'guided', // New type for elements specific to guided mode
  CRITICAL = 'critical', // For elements crucial for task completion
  INFORMATIONAL = 'informational', // For read-only content
  ACTIONABLE = 'actionable', // For buttons, links etc.
  VISUAL = 'visual', // For decorative elements
  UTILITY = 'utility', // For tools, settings
  FEEDBACK = 'feedback', // For notifications, alerts
}

export type UiMode = 'standard' | 'focus' | 'minimal' | 'guided' | 'adaptive' | 'hyperfocus' | 'low-distraction';

export interface MouseEventData {
  x: number;
  y: number;
  button: number;
  targetId: string;
  timestamp: number;
  targetBoundingRect?: DOMRectReadOnly; // For target acquisition error
  elementBoundingRects?: { [id: string]: DOMRectReadOnly }; // Capture context of visible elements
}

export interface ScrollEventData {
  scrollX: number;
  scrollY: number;
  timestamp: number;
  viewportHeight: number;
  documentHeight: number;
  scrollDeltaY?: number; // Calculated delta for richer analysis
}

export interface KeyboardEventData {
  key: string;
  code: string;
  timestamp: number;
  isModifier: boolean;
  targetId: string; // Which element received the key event
}

export interface FocusBlurEventData {
  type: 'focus' | 'blur';
  targetId: string;
  timestamp: number;
  duration?: number; // Duration of focus
}

export interface FormEventData {
  type: 'submit' | 'input' | 'change' | 'reset';
  targetId: string;
  value?: string;
  timestamp: number;
  isValid?: boolean; // For validation events
  validationMessage?: string;
}

export interface GazeEventData {
  x: number;
  y: number;
  timestamp: number;
  targetId: string; // Element under gaze
  fixationDuration?: number; // Duration of fixation if applicable
  saccadeAmplitude?: number; // Amplitude of saccade if applicable
}

export type RawTelemetryEvent =
  | { type: 'mousemove'; data: MouseEventData }
  | { type: 'click'; data: MouseEventData }
  | { type: 'scroll'; data: ScrollEventData }
  | { type: 'keydown'; data: KeyboardEventData }
  | { type: 'keyup'; data: KeyboardEventData }
  | { type: 'focus'; data: FocusBlurEventData }
  | { type: 'blur'; data: FocusBlurEventData }
  | { type: 'form'; data: FormEventData }
  | { type: 'gaze'; data: GazeEventData }; // New type for gaze tracking (mocked)

// --- Feature Vector Interfaces ---
export interface MouseKinematicsFeatures {
  mouse_velocity_avg: number; // avg px/ms
  mouse_acceleration_avg: number; // avg px/ms^2
  mouse_path_tortuosity: number; // deviation from straight line, 0-1
  mouse_dwell_time_avg: number; // avg ms over interactive elements
  fitts_law_ip_avg: number; // Index of Performance, higher is better
  mouse_jerk_avg: number; // avg px/ms^3
  mouse_entropy: number; // Shannon entropy of mouse positions
}

export interface ClickDynamicsFeatures {
  click_frequency: number; // clicks/sec
  click_latency_avg: number; // ms between clicks in a burst
  target_acquisition_error_avg: number; // px deviation from center
  double_click_frequency: number; // double clicks / sec
  click_burst_rate: number; // clicks in rapid succession / second
  click_precision_avg: number; // 1 - (target_acquisition_error_avg / target_size_avg)
}

export interface ScrollDynamicsFeatures {
  scroll_velocity_avg: number; // px/sec
  scroll_direction_changes: number; // count
  scroll_pause_frequency: number; // pauses / sec
  scroll_page_coverage_avg: number; // average % of page scrolled in a window
  scroll_intensity_score: number; // combination of velocity and delta
  scroll_backtracking_ratio: number; // ratio of scroll-up distance to total scroll distance
}

export interface KeyboardDynamicsFeatures {
  typing_speed_wpm: number;
  backspace_frequency: number; // backspaces / sec
  keystroke_latency_avg: number; // ms between keydowns
  error_correction_rate: number; // backspaces / keydowns (excluding modifiers)
  typing_burst_speed: number; // WPM in rapid typing bursts
  keystroke_entropy: number; // Shannon entropy of key presses
  modifier_key_frequency: number; // modifiers / sec, indicates complex operations
}

export interface InteractionErrorFeatures {
  form_validation_errors_count: number; // count
  repeated_action_attempts_count: number; // count of same action or element interaction
  navigation_errors_count: number; // e.g., dead links, rapid back/forward
  api_errors_count: number; // Count of user-triggered API errors (e.g., failed searches)
  task_reversal_count: number; // e.g. going back in a multi-step form after completion
}

export interface TaskContextFeatures {
  current_task_complexity: number; // derived from TaskContextManager
  time_in_current_task_sec: number;
  task_progress_ratio: number; // 0-1, how far along in a task
  subtask_switches: number; // count of switches between subtasks
  task_urgency_score: number; // derived from task metadata, 0-1
}

export interface GazeFeatures {
  fixation_frequency: number; // fixations / sec
  saccade_amplitude_avg: number; // avg px distance of saccades
  gaze_deviation_from_focus: number; // px deviation from central task element
  scan_path_tortuosity: number; // deviation from linear scan path
}

export interface TelemetryFeatureVector {
  timestamp_window_end: number;
  mouse?: MouseKinematicsFeatures;
  clicks?: ClickDynamicsFeatures;
  scroll?: ScrollDynamicsFeatures;
  keyboard?: KeyboardDynamicsFeatures;
  errors?: InteractionErrorFeatures;
  task_context?: TaskContextFeatures;
  gaze?: GazeFeatures; // New gaze features
  event_density: number; // total events per second in the window
  interaction_rate: number; // total user-generated events per second
}

// --- User Profile and Context Store ---
export interface UserPreferences {
  preferredUiMode: UiMode; // User can set a preferred default mode
  cognitiveLoadThresholds: {
    high: number;
    low: number;
    critical: number;
    criticalLow: number;
    guided: number;
    guidedLow: number;
    adaptiveHigh: number; // New threshold for adaptive mode
    adaptiveLow: number;  // New threshold for adaptive mode
  };
  adaptationPolicySelection: {
    [mode: string]: { [elementType: string]: 'obscure' | 'deemphasize' | 'reposition' | 'summarize' | 'none' | 'highlight' | 'expand' | 'contract' };
  };
  personalizedBaselineCLS: number; // User's typical resting CLS
  learningRate: number; // How quickly the user adapts, 0-1
  stressSensitivity: number; // How sensitive the user is to high load indicators, 0-1
  preferredAdaptationStyle: 'proactive' | 'reactive' | 'minimal'; // New preference
}

/**
 * @mermaid
 * graph TD
 *    A[User Actions/Telemetry] --> B(TelemetryAgent)
 *    B --> C{Event Buffer}
 *    C --> D[Feature Extraction]
 *    D --> E(CognitiveLoadEngine)
 *    E --> F[Predicted Load]
 *    F --> G(UserProfileService)
 *    G --> H{Adaptation Policy}
 *    H --> I[UI Adaptation]
 *    E --> J(AdaptiveThresholdManager)
 *    J --> G
 *    D --> K(TaskContextManager)
 */
/**
 * Claim 1: The UserProfileService acts as a central repository for individual user preferences and historical load profiles, enabling personalized adaptive UI behavior.
 * Claim 2: By integrating multiple telemetry streams, the system achieves a holistic understanding of user interaction patterns, leading to more accurate cognitive load assessments.
 */
export class UserProfileService {
  private static instance: UserProfileService;
  private currentPreferences: UserPreferences = {
    preferredUiMode: 'standard',
    cognitiveLoadThresholds: {
      high: 0.6,
      low: 0.4,
      critical: 0.8,
      criticalLow: 0.7,
      guided: 0.75,
      guidedLow: 0.65,
      adaptiveHigh: 0.68,
      adaptiveLow: 0.45,
    },
    adaptationPolicySelection: {}, // Default empty, managed by AdaptationPolicyManager
    personalizedBaselineCLS: 0.1, // Default baseline
    learningRate: 0.5,
    stressSensitivity: 0.7,
    preferredAdaptationStyle: 'reactive',
  };
  private loadHistoryStore: number[] = []; // Stores historical cognitive load values for user profiling
  private taskCompletionMetrics: Map<string, { successRate: number, avgTime: number }> = new Map(); // Stores success rates and times per task

  private constructor() {
    // Load from localStorage or backend in a real app
    const storedPrefs = typeof window !== 'undefined' ? localStorage.getItem('userCognitiveLoadPrefs') : null;
    if (storedPrefs) {
      this.currentPreferences = { ...this.currentPreferences, ...JSON.parse(storedPrefs) };
    }
    // Load historical data
    const storedLoadHistory = typeof window !== 'undefined' ? localStorage.getItem('userLoadHistory') : null;
    if (storedLoadHistory) {
        this.loadHistoryStore = JSON.parse(storedLoadHistory);
    }
  }

  public static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  public getPreferences(): UserPreferences {
    return { ...this.currentPreferences };
  }

  public updatePreferences(newPrefs: Partial<UserPreferences>): void {
    this.currentPreferences = { ...this.currentPreferences, ...newPrefs };
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCognitiveLoadPrefs', JSON.stringify(this.currentPreferences));
    }
  }

  public addLoadToHistory(load: number): void {
    this.loadHistoryStore.push(load);
    if (this.loadHistoryStore.length > 100) { // Keep a rolling window of history
        this.loadHistoryStore.shift();
    }
    if (typeof window !== 'undefined') {
        localStorage.setItem('userLoadHistory', JSON.stringify(this.loadHistoryStore));
    }
  }

  public getLoadHistory(): number[] {
      return [...this.loadHistoryStore];
  }

  public updateTaskCompletion(taskId: string, success: boolean, durationMs: number): void {
      const currentMetrics = this.taskCompletionMetrics.get(taskId) || { successRate: 0, avgTime: 0, count: 0 };
      const newCount = currentMetrics.count + 1;
      const newSuccessRate = ((currentMetrics.successRate * currentMetrics.count) + (success ? 1 : 0)) / newCount;
      const newAvgTime = ((currentMetrics.avgTime * currentMetrics.count) + durationMs) / newCount;
      this.taskCompletionMetrics.set(taskId, { successRate: newSuccessRate, avgTime: newAvgTime });
      // Math Equation 1: Success Rate Update
      // S_{new} = (S_{old} \times N_{old} + I_{success}) / (N_{old} + 1)
      // where S is success rate, N is count, I_success is 1 if success, 0 otherwise.
      // Math Equation 2: Average Time Update
      // T_{new} = (T_{old} \times N_{old} + D) / (N_{old} + 1)
      // where T is average time, D is current duration.
  }

  public getTaskCompletionMetrics(taskId: string): { successRate: number, avgTime: number } | undefined {
      return this.taskCompletionMetrics.get(taskId);
  }
}

// --- Task Context Manager ---
export type TaskContext = {
  id: string;
  name: string;
  complexity: 'low' | 'medium' | 'high' | 'critical' | 'dynamic';
  timestamp: number;
  expectedDurationMs?: number;
  progressSteps?: number;
  currentStep?: number;
  urgency?: 'low' | 'medium' | 'high';
};

/**
 * @mermaid
 * graph TD
 *    A[Application Initialization] --> B{setTask(task)}
 *    B --> C{Task Change Detected?}
 *    C -- Yes --> D[Notify Listeners]
 *    C -- No --> B
 *    D --> E(Current Task State)
 */
/**
 * Claim 3: The TaskContextManager provides a dynamic and granular understanding of the user's current goals, enabling context-aware load balancing.
 */
export class TaskContextManager {
  private static instance: TaskContextManager;
  private currentTask: TaskContext | null = null;
  private listeners: Set<(task: TaskContext | null) => void> = new Set();
  private userProfileService = UserProfileService.getInstance(); // For task completion metrics

  private constructor() {
    // Initialize with a default or infer from URL
    if (typeof performance !== 'undefined') {
      this.setTask({ id: 'app_init', name: 'Application Initialization', complexity: 'low', timestamp: performance.now(), urgency: 'low' });
    } else {
      this.setTask({ id: 'app_init', name: 'Application Initialization', complexity: 'low', timestamp: 0, urgency: 'low' });
    }
  }

  public static getInstance(): TaskContextManager {
    if (!TaskContextManager.instance) {
      TaskContextManager.instance = new TaskContextManager();
    }
    return TaskContextManager.instance;
  }

  public setTask(task: TaskContext | null): void {
    if (task && this.currentTask && task.id === this.currentTask.id && task.currentStep === this.currentTask.currentStep) return; // Avoid redundant updates
    const previousTask = this.currentTask;
    this.currentTask = task;

    if (previousTask && previousTask.id !== (task?.id || '')) {
        // Task completed or switched
        const duration = (performance.now() - previousTask.timestamp);
        // Assuming task completion if a new task is set or current task becomes null
        const success = true; // Placeholder: Real logic would determine success
        this.userProfileService.updateTaskCompletion(previousTask.id, success, duration);
    }

    this.listeners.forEach(listener => listener(this.currentTask));
    // console.log(`TaskContextManager: Current task set to ${task?.name || 'N/A'} (Complexity: ${task?.complexity || 'N/A'})`);
  }

  public getCurrentTask(): TaskContext | null {
    return this.currentTask;
  }

  public updateTaskProgress(currentStep: number, totalSteps?: number): void {
    if (this.currentTask) {
      this.currentTask = {
        ...this.currentTask,
        currentStep: currentStep,
        progressSteps: totalSteps || this.currentTask.progressSteps,
      };
      this.listeners.forEach(listener => listener(this.currentTask));
    }
  }

  public subscribe(listener: (task: TaskContext | null) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current task on subscription
    listener(this.currentTask);
    return () => this.listeners.delete(listener);
  }
}

// --- Interaction Error Logger ---
export interface InteractionError {
  id: string;
  type: 'validation' | 'repeatedAction' | 'navigation' | 'apiError' | 'systemError' | 'timeout';
  elementId?: string;
  message: string;
  timestamp: number;
  severity?: 'low' | 'medium' | 'high';
  context?: { [key: string]: any }; // Additional context for the error
}

/**
 * @mermaid
 * graph TD
 *    A[logError(error)] --> B{Errors Buffer}
 *    B --> C[Flush Interval]
 *    C -- Trigger --> D[flushBuffer()]
 *    D --> E[Notify Listeners]
 *    E --> F{Cleared Buffer}
 */
/**
 * Claim 4: The InteractionErrorLogger captures critical indicators of user frustration and difficulty, directly informing the cognitive load model.
 */
export class InteractionErrorLogger {
  private static instance: InteractionErrorLogger;
  public errorsBuffer: InteractionError[] = []; // Changed to public for TelemetryAgent access
  private listeners: Set<(errors: InteractionError[]) => void> = new Set();
  private readonly bufferFlushRateMs: number = 1000;
  private bufferFlushInterval: ReturnType<typeof setInterval> | null = null;
  private errorWindow: number = 5000; // Track errors in the last 5 seconds

  private constructor() {
    if (typeof setInterval !== 'undefined') {
      this.bufferFlushInterval = setInterval(this.flushBuffer, this.bufferFlushRateMs);
    }
  }

  public static getInstance(): InteractionErrorLogger {
    if (!InteractionErrorLogger.instance) {
      InteractionErrorLogger.instance = new InteractionErrorLogger();
    }
    return InteractionErrorLogger.instance;
  }

  public logError(error: Omit<InteractionError, 'id' | 'timestamp'>): void {
    if (typeof performance === 'undefined') return; // Skip if no performance API

    const newError: InteractionError = {
      id: `error-${performance.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: performance.now(),
      severity: error.severity || 'medium',
      ...error,
    };
    this.errorsBuffer.push(newError);
  }

  private flushBuffer = (): void => {
    // Only send errors that are still relevant within the errorWindow
    const relevantErrors = this.errorsBuffer.filter(err => performance.now() - err.timestamp < this.errorWindow);
    if (relevantErrors.length > 0) {
      this.listeners.forEach(listener => listener([...relevantErrors])); // Send a copy
    }
    // Remove old errors from the buffer for the next flush cycle
    this.errorsBuffer = relevantErrors;
  };

  public getRecentErrors(windowMs: number): InteractionError[] {
      const now = performance.now();
      return this.errorsBuffer.filter(err => now - err.timestamp <= windowMs);
  }

  public subscribe(listener: (errors: InteractionError[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public stop(): void {
    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
    }
  }
}

// --- UI Element Tracker (New Class) ---
export interface InteractiveUiElement {
  id: string;
  type: UiElementType;
  boundingRect: DOMRectReadOnly;
  isClickable: boolean;
  isFocusable: boolean;
  isInteractive: boolean;
}

export interface UiElementInteractionData {
    element: InteractiveUiElement;
    hoverEntryTimestamp: number;
    hoverExitTimestamp?: number;
    clicks: number;
    focusCount: number;
    inputCount: number;
    totalDwellTime: number; // Sum of hover durations
    lastInteractionTimestamp: number;
}

/**
 * @mermaid
 * graph TD
 *    A[UI Mutation Observer] --> B{registerElement(id, type, rect)}
 *    B --> C[Element Registry]
 *    D[TelemetryAgent Events] --> E{trackInteraction(event)}
 *    E --> F(Update Interaction Data)
 *    F --> G[Calculate Metrics: Dwell Time, Fitts's Law]
 *    G --> H[TelemetryFeatureVector]
 */
/**
 * Claim 5: The UiElementTracker provides granular interaction data for individual UI components, enabling precise Fitts's Law calculations and dwell time analysis.
 */
export class UiElementTracker {
    private static instance: UiElementTracker;
    private elementRegistry: Map<string, InteractiveUiElement> = new Map();
    private interactionMetrics: Map<string, UiElementInteractionData> = new Map();
    private activeHover: { elementId: string; timestamp: number } | null = null;

    private constructor() {}

    public static getInstance(): UiElementTracker {
        if (!UiElementTracker.instance) {
            UiElementTracker.instance = new UiElementTracker();
        }
        return UiElementTracker.instance;
    }

    public registerElement(id: string, type: UiElementType, rect: DOMRectReadOnly, isInteractive: boolean = true, isClickable: boolean = true, isFocusable: boolean = true): void {
        this.elementRegistry.set(id, { id, type, boundingRect: rect, isClickable, isFocusable, isInteractive });
        if (!this.interactionMetrics.has(id)) {
            this.interactionMetrics.set(id, {
                element: { id, type, boundingRect: rect, isClickable, isFocusable, isInteractive },
                hoverEntryTimestamp: 0,
                clicks: 0,
                focusCount: 0,
                inputCount: 0,
                totalDwellTime: 0,
                lastInteractionTimestamp: 0,
            });
        }
    }

    public unregisterElement(id: string): void {
        this.elementRegistry.delete(id);
        this.interactionMetrics.delete(id);
    }

    public getElement(id: string): InteractiveUiElement | undefined {
        return this.elementRegistry.get(id);
    }

    public getAllElements(): InteractiveUiElement[] {
        return Array.from(this.elementRegistry.values());
    }

    public trackMouseMove(event: MouseEventData): void {
        const timestamp = event.timestamp;
        const targetElementId = event.targetId;

        // Update hover tracking
        if (this.activeHover && this.activeHover.elementId !== targetElementId) {
            // Exited previous element
            this.trackHoverExit(this.activeHover.elementId, timestamp);
            this.activeHover = null;
        }

        if (targetElementId && this.elementRegistry.has(targetElementId) && !this.activeHover) {
            // Entered new element
            this.trackHoverEnter(targetElementId, timestamp);
        }
    }

    public trackHoverEnter(elementId: string, timestamp: number): void {
        const metrics = this.interactionMetrics.get(elementId);
        if (metrics && !this.activeHover) {
            metrics.hoverEntryTimestamp = timestamp;
            this.activeHover = { elementId, timestamp };
            this.interactionMetrics.set(elementId, metrics);
        }
    }

    public trackHoverExit(elementId: string, timestamp: number): void {
        const metrics = this.interactionMetrics.get(elementId);
        if (metrics && metrics.hoverEntryTimestamp > 0) {
            metrics.totalDwellTime += (timestamp - metrics.hoverEntryTimestamp);
            metrics.hoverEntryTimestamp = 0; // Reset
            this.interactionMetrics.set(elementId, metrics);
            if (this.activeHover && this.activeHover.elementId === elementId) {
                this.activeHover = null;
            }
        }
    }

    public trackClick(event: MouseEventData): void {
        const metrics = this.interactionMetrics.get(event.targetId);
        if (metrics) {
            metrics.clicks++;
            metrics.lastInteractionTimestamp = event.timestamp;
            this.interactionMetrics.set(event.targetId, metrics);
        }
    }

    public trackFocus(event: FocusBlurEventData): void {
        const metrics = this.interactionMetrics.get(event.targetId);
        if (metrics && event.type === 'focus') {
            metrics.focusCount++;
            metrics.lastInteractionTimestamp = event.timestamp;
            this.interactionMetrics.set(event.targetId, metrics);
        } else if (metrics && event.type === 'blur' && event.duration) {
            metrics.totalDwellTime += event.duration; // For focus-based dwell time on inputs
            this.interactionMetrics.set(event.targetId, metrics);
        }
    }

    public trackInput(event: FormEventData): void {
        const metrics = this.interactionMetrics.get(event.targetId);
        if (metrics) {
            metrics.inputCount++;
            metrics.lastInteractionTimestamp = event.timestamp;
            this.interactionMetrics.set(event.targetId, metrics);
        }
    }

    public getInteractionMetrics(elementId: string): UiElementInteractionData | undefined {
        return this.interactionMetrics.get(elementId);
    }

    public resetMetricsForWindow(): void {
        this.interactionMetrics.forEach(metrics => {
            metrics.clicks = 0;
            metrics.focusCount = 0;
            metrics.inputCount = 0;
            metrics.totalDwellTime = 0; // Only reset 'window' metrics
            metrics.hoverEntryTimestamp = 0; // Ensure active hover is reset if not exited
        });
        this.activeHover = null;
    }
}

// --- Core Telemetry Agent ---
/**
 * @mermaid
 * graph TD
 *    A[User Events] --> B{initListeners()}
 *    B --> C(Event Handlers)
 *    C --> D[addEvent(RawTelemetryEvent)]
 *    D --> E{eventBuffer}
 *    E --> F[bufferFlushInterval]
 *    F -- Trigger --> G(flushBuffer())
 *    G --> H[extractFeatures(events)]
 *    H --> I(featureProcessingCallback)
 */
/**
 * Claim 6: The TelemetryAgent operates with minimal overhead, passively collecting raw user interaction data and efficiently transforming it into rich feature vectors.
 */
export class TelemetryAgent {
  private eventBuffer: RawTelemetryEvent[] = [];
  private bufferInterval: ReturnType<typeof setInterval> | null = null;
  private readonly bufferFlushRateMs: number = 200; // Flush data every 200ms
  private readonly featureProcessingCallback: (features: TelemetryFeatureVector) => void;
  private lastMouseCoord: { x: number; y: number; timestamp: number } | null = null;
  private lastScrollY: { y: number; timestamp: number; viewportHeight: number; documentHeight: number } | null = null;
  private clickTimestamps: number[] = [];
  private keydownTimestamps: number[] = [];
  private lastKeyboardActivityTime: number = 0;
  private formInputTimes: Map<string, number> = new Map(); // track time spent on form fields
  private mouseMoveEventHistory: MouseEventData[] = []; // For velocity, acceleration, jerk
  private scrollEventHistory: ScrollEventData[] = []; // For scroll velocity, jerk, backtracking
  private keyboardEventHistory: KeyboardEventData[] = []; // For advanced keyboard dynamics
  private gazeEventHistory: GazeEventData[] = []; // For gaze features (mocked)

  private interactionErrorLogger = InteractionErrorLogger.getInstance();
  private taskContextManager = TaskContextManager.getInstance();
  private uiElementTracker = UiElementTracker.getInstance(); // New element tracker

  constructor(featureProcessingCallback: (features: TelemetryFeatureVector) => void) {
    this.featureProcessingCallback = featureProcessingCallback;
  }

  public initListeners(): void {
    if (typeof window === 'undefined' || typeof performance === 'undefined') return;

    window.addEventListener('mousemove', this.handleMouseMoveEvent, { passive: true });
    window.addEventListener('click', this.handleClickEvent, { passive: true });
    window.addEventListener('scroll', this.handleScrollEvent, { passive: true });
    window.addEventListener('keydown', this.handleKeyboardEvent, { passive: true });
    window.addEventListener('keyup', this.handleKeyboardEvent, { passive: true });
    window.addEventListener('focusin', this.handleFocusBlurEvent, { passive: true });
    window.addEventListener('focusout', this.handleFocusBlurEvent, { passive: true });
    window.addEventListener('input', this.handleFormEvent, { passive: true });
    window.addEventListener('change', this.handleFormEvent, { passive: true });
    window.addEventListener('submit', this.handleFormEvent, { passive: true }); // Captures form submission
    this.bufferInterval = setInterval(this.flushBuffer, this.bufferFlushRateMs);

    // Mock Gaze Event Listener
    if (Math.random() > 0.5) { // Simulate gaze tracking availability
        setInterval(this.mockGazeEvent, 50); // Emit mock gaze events
    }
  }

  private addEvent = (event: RawTelemetryEvent): void => {
    this.eventBuffer.push(event);
  };

  private handleMouseMoveEvent = (event: MouseEvent): void => {
    const timestamp = performance.now();
    const targetElement = event.target as HTMLElement;
    const data: MouseEventData = {
        x: event.clientX,
        y: event.clientY,
        button: event.button,
        targetId: targetElement?.id || '',
        timestamp,
        targetBoundingRect: targetElement?.getBoundingClientRect ? new DOMRectReadOnly(targetElement.getBoundingClientRect().x, targetElement.getBoundingClientRect().y, targetElement.getBoundingClientRect().width, targetElement.getBoundingClientRect().height) : undefined,
    };
    this.addEvent({ type: 'mousemove', data });
    this.mouseMoveEventHistory.push(data);
    this.uiElementTracker.trackMouseMove(data);
  };

  private handleClickEvent = (event: MouseEvent): void => {
    const timestamp = performance.now();
    const targetElement = event.target as HTMLElement;
    const data: MouseEventData = {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      targetId: targetElement?.id || '',
      timestamp,
      targetBoundingRect: targetElement?.getBoundingClientRect ? new DOMRectReadOnly(targetElement.getBoundingClientRect().x, targetElement.getBoundingClientRect().y, targetElement.getBoundingClientRect().width, targetElement.getBoundingClientRect().height) : undefined,
    };
    this.addEvent({ type: 'click', data });
    this.clickTimestamps.push(timestamp);
    this.uiElementTracker.trackClick(data);
  };

  private handleScrollEvent = (event: Event): void => {
    const timestamp = performance.now();
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    let scrollDeltaY = 0;
    if (this.lastScrollY) {
        scrollDeltaY = scrollY - this.lastScrollY.y;
    }
    const data: ScrollEventData = {
      scrollX: window.scrollX,
      scrollY: scrollY,
      timestamp,
      viewportHeight,
      documentHeight,
      scrollDeltaY,
    };
    this.addEvent({ type: 'scroll', data });
    this.scrollEventHistory.push(data);
    this.lastScrollY = data;
  };

  private handleKeyboardEvent = (event: KeyboardEvent): void => {
    const timestamp = performance.now();
    const targetElement = event.target as HTMLElement;
    const data: KeyboardEventData = {
        key: event.key,
        code: event.code,
        timestamp,
        isModifier: event.ctrlKey || event.shiftKey || event.altKey || event.metaKey,
        targetId: targetElement?.id || '',
    };
    this.addEvent({
      type: event.type === 'keydown' ? 'keydown' : 'keyup',
      data: data,
    });
    if (event.type === 'keydown') {
      this.keydownTimestamps.push(timestamp);
      this.lastKeyboardActivityTime = timestamp;
      this.keyboardEventHistory.push(data);
    }
  };

  private handleFocusBlurEvent = (event: FocusEvent): void => {
    const timestamp = performance.now();
    const targetId = (event.target as HTMLElement)?.id;
    const type = event.type === 'focusin' ? 'focus' : 'blur';
    const data: FocusBlurEventData = {
        type: type,
        targetId: targetId || '',
        timestamp,
    };
    this.addEvent({ type, data });

    if (targetId && (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      if (event.type === 'focusin') {
        this.formInputTimes.set(targetId, timestamp);
        this.uiElementTracker.trackFocus({ ...data, type: 'focus' });
      } else if (event.type === 'focusout' && this.formInputTimes.has(targetId)) {
        const focusTime = this.formInputTimes.get(targetId);
        if (focusTime) {
            const duration = timestamp - focusTime;
            this.uiElementTracker.trackFocus({ ...data, type: 'blur', duration });
        }
        this.formInputTimes.delete(targetId); // Clear after processing
      }
    }
  };

  private handleFormEvent = (event: Event): void => {
    const timestamp = performance.now();
    const targetElement = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFormElement;
    const type = event.type === 'submit' ? 'submit' : event.type === 'input' ? 'input' : 'change';

    // Basic validation check - would be more sophisticated in a real app
    let isValid: boolean | undefined = undefined;
    let validationMessage: string | undefined = undefined;
    if ('checkValidity' in targetElement && typeof targetElement.checkValidity === 'function') {
      isValid = targetElement.checkValidity();
      validationMessage = targetElement.validationMessage;
      if (!isValid && type === 'change') { // Log validation error on change if invalid
        this.interactionErrorLogger.logError({
          type: 'validation',
          elementId: targetElement.id || targetElement.name,
          message: `Form field validation failed: ${validationMessage}`,
          severity: 'medium'
        });
      }
    }

    const data: FormEventData = {
      type: type,
      targetId: targetElement?.id || targetElement?.name || '',
      value: 'value' in targetElement ? String(targetElement.value) : undefined,
      timestamp,
      isValid,
      validationMessage,
    };
    this.addEvent({ type: 'form', data });
    this.uiElementTracker.trackInput(data);
  };

  private mockGazeEvent = (): void => {
    // This is a highly simplified mock. Real gaze tracking requires hardware.
    // We simulate gaze near the current mouse position or a "task focus" area.
    if (typeof performance === 'undefined' || typeof document === 'undefined') return;

    const timestamp = performance.now();
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetId = '';

    // Simulate gaze around the current mouse position if available, else center
    if (this.lastMouseCoord) {
        x = this.lastMouseCoord.x + (Math.random() - 0.5) * 50; // Jitter around mouse
        y = this.lastMouseCoord.y + (Math.random() - 0.5) * 50;
        const element = document.elementFromPoint(x, y);
        targetId = element?.id || '';
    } else {
        const element = document.elementFromPoint(x, y);
        targetId = element?.id || '';
    }

    const data: GazeEventData = {
        x: Math.max(0, Math.min(window.innerWidth, x)),
        y: Math.max(0, Math.min(window.innerHeight, y)),
        timestamp,
        targetId,
        fixationDuration: Math.random() * 200 + 50, // 50-250ms
        saccadeAmplitude: Math.random() * 100 + 10, // 10-110px
    };
    this.addEvent({ type: 'gaze', data });
    this.gazeEventHistory.push(data);
  };

  /**
   * Math Equation 3: Euclidean Distance
   * D = sqrt((x2 - x1)^2 + (y2 - y1)^2)
   */
  private calculateDistance(p1: {x: number, y: number}, p2: {x: number, y: number}): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * Math Equation 4: Mouse Velocity
   * V = D / T
   * where D is distance, T is time delta.
   */
  private calculateMouseVelocity(p1: {x: number, y: number, timestamp: number}, p2: {x: number, y: number, timestamp: number}): number {
    const dist = this.calculateDistance(p1, p2);
    const timeDelta = p2.timestamp - p1.timestamp;
    return timeDelta > 0 ? dist / timeDelta : 0;
  }

  /**
   * Math Equation 5: Mouse Acceleration
   * A = (V2 - V1) / T
   * where V1, V2 are velocities, T is time delta.
   */
  private calculateMouseAcceleration(prevV: number, currentV: number, timeDelta: number): number {
    return timeDelta > 0 ? (currentV - prevV) / timeDelta : 0;
  }

  /**
   * Math Equation 6: Mouse Jerk (rate of change of acceleration)
   * J = (A2 - A1) / T
   * where A1, A2 are accelerations, T is time delta.
   */
  private calculateMouseJerk(prevA: number, currentA: number, timeDelta: number): number {
    return timeDelta > 0 ? (currentA - prevA) / timeDelta : 0;
  }

  /**
   * Math Equation 7: Mouse Path Tortuosity (Normalized Path Length)
   * T = L_path / L_straight
   * where L_path is total path length, L_straight is straight line distance from start to end.
   */
  private calculateMousePathTortuosity(events: MouseEventData[]): number {
    if (events.length < 3) return 0;
    let totalDistance = 0;
    for (let i = 1; i < events.length; i++) {
      totalDistance += this.calculateDistance(events[i - 1], events[i]);
    }
    const straightLineDistance = this.calculateDistance(events[0], events[events.length - 1]);
    return straightLineDistance > 0 ? totalDistance / straightLineDistance : 0; // Ratio > 1 indicates tortuosity
  }

  /**
   * Math Equation 8: Target Acquisition Error (Distance from click to target center)
   * E = sqrt((click_x - center_x)^2 + (click_y - center_y)^2)
   */
  private calculateTargetAcquisitionError(clicks: MouseEventData[]): number {
    let totalError = 0;
    let validClicks = 0;
    for (const click of clicks) {
      if (click.targetBoundingRect) {
        const rect = click.targetBoundingRect;
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const error = Math.sqrt(Math.pow(click.x - centerX, 2) + Math.pow(click.y - centerY, 2));
        totalError += error;
        validClicks++;
      }
    }
    return validClicks > 0 ? totalError / validClicks : 0;
  }

  /**
   * Math Equation 9: Click Precision
   * P = 1 - (E / (W_target + H_target)/2)
   * where E is acquisition error, W/H are target width/height. A value near 1 is precise.
   */
  private calculateClickPrecision(clicks: MouseEventData[]): number {
      let totalPrecision = 0;
      let validClicks = 0;
      for (const click of clicks) {
          if (click.targetBoundingRect) {
              const rect = click.targetBoundingRect;
              const error = this.calculateDistance(click, { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
              const avgTargetDim = (rect.width + rect.height) / 2;
              const precision = avgTargetDim > 0 ? 1 - (error / avgTargetDim) : 0; // Normalize error by target size
              totalPrecision += Math.max(0, precision); // Ensure precision is not negative
              validClicks++;
          }
      }
      return validClicks > 0 ? totalPrecision / validClicks : 0;
  }

  /**
   * Math Equation 10: Fitts's Law Index of Performance (IP)
   * IP = ID / MT = log2(2A/W) / MT
   * where ID is Index of Difficulty, A is amplitude (distance), W is width (target size), MT is Movement Time.
   * This is a simplified calculation, full Fitts's Law requires more precise measurements.
   */
  private calculateFittsLawIndex(clicks: MouseEventData[]): number {
      let totalIP = 0;
      let validPairs = 0;
      // This is a very rough approximation, typically Fitts's Law applies to sequences of actions towards targets.
      // For a real implementation, we'd need to identify target sequences and movement times.
      if (clicks.length < 2) return 0;

      for (let i = 1; i < clicks.length; i++) {
          const prevClick = clicks[i - 1];
          const currentClick = clicks[i];

          if (prevClick.targetBoundingRect && currentClick.targetBoundingRect) {
              const A = this.calculateDistance(prevClick, currentClick); // Amplitude = distance between clicks
              const W = currentClick.targetBoundingRect.width; // Width of the target clicked (simplified as width)
              const MT = currentClick.timestamp - prevClick.timestamp; // Movement Time

              if (A > 0 && W > 0 && MT > 0) {
                  // Index of Difficulty (ID) using Shannon Formulation
                  const ID = Math.log2(A / W + 1); // Often log2(2A/W) or log2(A/W + 1)
                  const IP = ID / (MT / 1000); // IP in bits/second (MT in seconds)
                  if (!isNaN(IP) && isFinite(IP)) {
                      totalIP += IP;
                      validPairs++;
                  }
              }
          }
      }
      return validPairs > 0 ? totalIP / validPairs : 0;
  }

  /**
   * Math Equation 11: Keystroke Entropy (Shannon Entropy)
   * H = -Sum(p_i * log2(p_i))
   * where p_i is the probability of character i.
   */
  private calculateKeystrokeEntropy(keydownEvents: KeyboardEventData[]): number {
    if (keydownEvents.length === 0) return 0;

    const charCounts: Map<string, number> = new Map();
    for (const event of keydownEvents) {
      if (!event.isModifier && event.key.length === 1) { // Only count printable characters
        charCounts.set(event.key, (charCounts.get(event.key) || 0) + 1);
      }
    }

    if (charCounts.size === 0) return 0;

    let entropy = 0;
    const totalChars = Array.from(charCounts.values()).reduce((sum, count) => sum + count, 0);

    charCounts.forEach(count => {
      const p = count / totalChars;
      entropy -= p * Math.log2(p);
    });
    return entropy;
  }

  /**
   * Math Equation 12: Scroll Jerk (Derivative of Scroll Acceleration)
   * J = (A_{curr} - A_{prev}) / T
   */
  private calculateScrollJerkiness(scrollEvents: ScrollEventData[]): number {
      if (scrollEvents.length < 4) return 0;
      let totalJerk = 0;
      let prevVelocity = 0;
      let prevAcceleration = 0;
      let count = 0;

      for (let i = 1; i < scrollEvents.length; i++) {
          const s1 = scrollEvents[i - 1];
          const s2 = scrollEvents[i];
          const timeDelta = s2.timestamp - s1.timestamp;
          if (timeDelta > 0) {
              const velocity = Math.abs(s2.scrollDeltaY || 0) / timeDelta;
              const acceleration = (velocity - prevVelocity) / timeDelta;
              totalJerk += Math.abs((acceleration - prevAcceleration) / timeDelta);
              prevVelocity = velocity;
              prevAcceleration = acceleration;
              count++;
          }
      }
      return count > 0 ? totalJerk / count : 0;
  }

  /**
   * Math Equation 13: Mouse Entropy
   * Based on spatial distribution of mouse movements.
   * Divide screen into a grid, calculate probabilities of being in each cell.
   */
  private calculateMouseEntropy(mouseMoveEvents: MouseEventData[]): number {
    if (mouseMoveEvents.length === 0 || typeof window === 'undefined') return 0;

    const gridCellsX = 10;
    const gridCellsY = 10;
    const cellWidth = window.innerWidth / gridCellsX;
    const cellHeight = window.innerHeight / gridCellsY;

    const cellCounts = new Map<string, number>();
    for (const event of mouseMoveEvents) {
      const cellX = Math.floor(event.x / cellWidth);
      const cellY = Math.floor(event.y / cellHeight);
      const cellId = `${cellX},${cellY}`;
      cellCounts.set(cellId, (cellCounts.get(cellId) || 0) + 1);
    }

    if (cellCounts.size === 0) return 0;

    let entropy = 0;
    const totalMoves = mouseMoveEvents.length;
    cellCounts.forEach(count => {
      const p = count / totalMoves;
      if (p > 0) entropy -= p * Math.log2(p);
    });
    return entropy;
  }

  /**
   * Math Equation 14: Scroll Backtracking Ratio
   * Ratio = L_up / L_total
   * where L_up is total upward scroll distance, L_total is total absolute scroll distance.
   */
  private calculateScrollBacktrackingRatio(scrollEvents: ScrollEventData[]): number {
      let totalDeltaY = 0;
      let totalUpScroll = 0;
      for (let i = 1; i < scrollEvents.length; i++) {
          const deltaY = scrollEvents[i].scrollY - scrollEvents[i-1].scrollY;
          totalDeltaY += Math.abs(deltaY);
          if (deltaY < 0) { // Scrolling up
              totalUpScroll += Math.abs(deltaY);
          }
      }
      return totalDeltaY > 0 ? totalUpScroll / totalDeltaY : 0;
  }

  /**
   * Math Equation 15: Gaze Deviation From Focus
   * D_gaze = Avg_i(Dist(Gaze_i, Target_centroid))
   * where Gaze_i is i-th gaze point, Target_centroid is center of main task element.
   * This would require knowing the 'main task element' which is context-dependent.
   */
  private calculateGazeDeviationFromFocus(gazeEvents: GazeEventData[], mainTargetRect?: DOMRectReadOnly): number {
      if (gazeEvents.length === 0 || !mainTargetRect) return 0;
      const targetCenterX = mainTargetRect.x + mainTargetRect.width / 2;
      const targetCenterY = mainTargetRect.y + mainTargetRect.height / 2;

      let totalDeviation = 0;
      for (const gaze of gazeEvents) {
          totalDeviation += this.calculateDistance(gaze, { x: targetCenterX, y: targetCenterY });
      }
      return totalDeviation / gazeEvents.length;
  }

  private extractFeatures = (events: RawTelemetryEvent[]): TelemetryFeatureVector => {
    if (typeof performance === 'undefined') {
        return { timestamp_window_end: Date.now(), event_density: 0, interaction_rate: 0 };
    }
    const windowStart = performance.now() - this.bufferFlushRateMs;
    const windowEnd = performance.now();
    const durationSeconds = this.bufferFlushRateMs / 1000;

    // Filter and categorize events for the current window
    const windowEvents = events.filter(event => event.data.timestamp >= windowStart);
    let mouseMoveEvents: MouseEventData[] = windowEvents.filter((e): e is { type: 'mousemove'; data: MouseEventData } => e.type === 'mousemove').map(e => e.data);
    let clickEvents: MouseEventData[] = windowEvents.filter((e): e is { type: 'click'; data: MouseEventData } => e.type === 'click').map(e => e.data);
    let scrollEvents: ScrollEventData[] = windowEvents.filter((e): e is { type: 'scroll'; data: ScrollEventData } => e.type === 'scroll').map(e => e.data);
    let keydownEvents: KeyboardEventData[] = windowEvents.filter((e): e is { type: 'keydown'; data: KeyboardEventData } => e.type === 'keydown').map(e => e.data);
    let keyupEvents: KeyboardEventData[] = windowEvents.filter((e): e is { type: 'keyup'; data: KeyboardEventData } => e.type === 'keyup').map(e => e.data);
    let formEvents: FormEventData[] = windowEvents.filter((e): e is { type: 'form'; data: FormEventData } => e.type === 'form').map(e => e.data);
    let gazeEvents: GazeEventData[] = windowEvents.filter((e): e is { type: 'gaze'; data: GazeEventData } => e.type === 'gaze').map(e => e.data);

    // --- Mouse Kinematics ---
    let totalMouseVelocity = 0;
    let totalMouseAcceleration = 0;
    let totalMouseJerk = 0;
    let prevMouseVelocity = 0;
    let prevMouseAcceleration = 0;
    if (mouseMoveEvents.length > 1) {
      for (let i = 1; i < mouseMoveEvents.length; i++) {
        const p1 = mouseMoveEvents[i - 1];
        const p2 = mouseMoveEvents[i];
        const timeDelta = p2.timestamp - p1.timestamp;
        if (timeDelta > 0) {
          const velocity = this.calculateMouseVelocity(p1, p2); // Math Equation 4
          totalMouseVelocity += velocity;
          const acceleration = this.calculateMouseAcceleration(prevMouseVelocity, velocity, timeDelta); // Math Equation 5
          totalMouseAcceleration += acceleration;
          totalMouseJerk += this.calculateMouseJerk(prevMouseAcceleration, acceleration, timeDelta); // Math Equation 6
          prevMouseVelocity = velocity;
          prevMouseAcceleration = acceleration;
        }
      }
    }
    const mouseDwellTimeAvg = Array.from(this.uiElementTracker.interactionMetrics.values())
                                .filter(m => m.element.isInteractive && m.totalDwellTime > 0)
                                .map(m => m.totalDwellTime)
                                .reduce((sum, time) => sum + time, 0) / (this.uiElementTracker.interactionMetrics.size || 1);


    // --- Click Dynamics ---
    let totalClickLatency = 0;
    let doubleClickCount = 0;
    let clickBurstCount = 0;
    const clickLatencyWindow = 500; // ms for double click or burst
    if (clickEvents.length > 1) {
      for (let i = 1; i < clickEvents.length; i++) {
        const latency = clickEvents[i].timestamp - clickEvents[i-1].timestamp;
        totalClickLatency += latency;
        if (latency < clickLatencyWindow) {
          doubleClickCount++;
          if (latency < 200) { // tighter threshold for burst
            clickBurstCount++;
          }
        }
      }
    }


    // --- Scroll Dynamics ---
    let totalScrollYDelta = 0;
    let scrollDirectionChanges = 0;
    let prevScrollYValue: number | null = null;
    let lastScrollDirection: 'up' | 'down' | null = null;
    let scrollPauseCount = 0;
    let totalPageCoverage = 0;
    let maxScrollPosition = 0;
    if (scrollEvents.length > 1) {
      for (let i = 1; i < scrollEvents.length; i++) {
        const s1 = scrollEvents[i - 1];
        const s2 = scrollEvents[i];
        const deltaY = s2.scrollY - s1.scrollY;
        if (Math.abs(deltaY) > 0) {
          totalScrollYDelta += Math.abs(deltaY);
          const currentDirection = deltaY > 0 ? 'down' : 'up';
          if (lastScrollDirection && currentDirection !== lastScrollDirection) {
            scrollDirectionChanges++;
          }
          lastScrollDirection = currentDirection;
        } else {
          if (prevScrollYValue !== null && prevScrollYValue === s2.scrollY) {
            scrollPauseCount++;
          }
        }
        prevScrollYValue = s2.scrollY;
        maxScrollPosition = Math.max(maxScrollPosition, s2.scrollY);
      }
      const initialScroll = scrollEvents[0].scrollY;
      const finalScroll = scrollEvents[scrollEvents.length - 1].scrollY;
      const totalDocumentHeight = scrollEvents[0].documentHeight - scrollEvents[0].viewportHeight;
      if (totalDocumentHeight > 0) {
          totalPageCoverage = (Math.abs(finalScroll - initialScroll) + scrollEvents[0].viewportHeight) / totalDocumentHeight;
          totalPageCoverage = Math.min(1, totalPageCoverage); // Clamp to 1
      }
    }
    const scrollIntensityScore = (totalScrollYDelta / durationSeconds) * (scrollDirectionChanges + 1); // Math Equation 16

    // --- Keyboard Dynamics ---
    let totalKeystrokeLatency = 0;
    let backspaceCount = 0;
    let wordCount = 0; // For WPM
    let lastTypedWordTime: number = 0;
    let nonModifierKeydownCount = 0;
    let modifierKeyCount = 0;
    if (keydownEvents.length > 0) {
      for (let i = 0; i < keydownEvents.length; i++) {
        const keyEvent = keydownEvents[i];
        if (keyEvent.isModifier) {
            modifierKeyCount++;
        } else {
          nonModifierKeydownCount++;
          if (i > 0 && !keydownEvents[i-1].isModifier) { // only count latency between non-modifier keys
            totalKeystrokeLatency += (keyEvent.timestamp - keydownEvents[i-1].timestamp);
          }
          if (keyEvent.key === 'Backspace') {
            backspaceCount++;
          } else if (keyEvent.key === ' ' && keyEvent.timestamp - lastTypedWordTime > 100) { // debounce words
            wordCount++;
            lastTypedWordTime = keyEvent.timestamp;
          }
        }
      }
    }
    const errorCorrectionRate = nonModifierKeydownCount > 0 ? backspaceCount / nonModifierKeydownCount : 0; // Math Equation 17
    const typingBurstSpeedWPM = (nonModifierKeydownCount > 5 && durationSeconds > 0) ? (nonModifierKeydownCount / 5) * (60 / durationSeconds) : 0; // Simplified burst WPM calculation. Math Equation 18

    // --- Interaction Errors (from IEL) ---
    const errorsInWindow = this.interactionErrorLogger.getRecentErrors(this.bufferFlushRateMs);
    let formValidationErrors = errorsInWindow.filter(err => err.type === 'validation').length;
    let repeatedActionAttempts = errorsInWindow.filter(err => err.type === 'repeatedAction').length;
    let navigationErrors = errorsInWindow.filter(err => err.type === 'navigation').length;
    let apiErrors = errorsInWindow.filter(err => err.type === 'apiError').length;
    let taskReversalCount = errorsInWindow.filter(err => err.type === 'repeatedAction' && err.message.includes('backtracking')).length; // Mock. Math Equation 19

    // Task Context
    const currentTask = this.taskContextManager.getCurrentTask();
    const taskComplexityMap: { [key in TaskContext['complexity']]: number } = {
      'low': 0.2, 'medium': 0.5, 'high': 0.7, 'critical': 0.9, 'dynamic': 0.6
    };
    const taskProgressRatio = (currentTask && currentTask.progressSteps && currentTask.currentStep !== undefined)
        ? (currentTask.currentStep / currentTask.progressSteps) : 0; // Math Equation 20
    const taskContextFeatures: TaskContextFeatures = {
      current_task_complexity: currentTask ? taskComplexityMap[currentTask.complexity] : 0,
      time_in_current_task_sec: currentTask ? (windowEnd - currentTask.timestamp) / 1000 : 0,
      task_progress_ratio: taskProgressRatio,
      subtask_switches: 0, // Requires more complex tracking
      task_urgency_score: currentTask?.urgency === 'high' ? 0.8 : (currentTask?.urgency === 'medium' ? 0.5 : 0.2), // Math Equation 21
    };


    // --- Gaze Features ---
    let totalFixationFrequency = 0;
    let totalSaccadeAmplitude = 0;
    let gazeDeviation = 0;
    let scanPathTortuosity = 0; // Requires more advanced algorithms

    if (gazeEvents.length > 0) {
        totalFixationFrequency = gazeEvents.filter(g => g.fixationDuration !== undefined && g.fixationDuration > 0).length / durationSeconds;
        totalSaccadeAmplitude = gazeEvents.filter(g => g.saccadeAmplitude !== undefined && g.saccadeAmplitude > 0).map(g => g.saccadeAmplitude || 0).reduce((sum, val) => sum + val, 0) / gazeEvents.length;
        // Mocking gaze deviation from focus, assuming currentTask might define a main target
        const mainTaskElement = currentTask ? this.uiElementTracker.getElement(currentTask.id) : null; // simplified
        gazeDeviation = this.calculateGazeDeviationFromFocus(gazeEvents, mainTaskElement?.boundingRect); // Math Equation 15
        scanPathTortuosity = this.calculateMousePathTortuosity(gazeEvents.map(g => ({...g, x:g.x, y:g.y, button:0}))); // Re-using mouse tortuosity func. Math Equation 22
    }


    const featureVector: TelemetryFeatureVector = {
      timestamp_window_end: windowEnd,
      event_density: windowEvents.length / durationSeconds,
      interaction_rate: (mouseMoveEvents.length + clickEvents.length + keydownEvents.length + scrollEvents.length + formEvents.length) / durationSeconds, // Math Equation 23
      task_context: taskContextFeatures,
    };

    if (mouseMoveEvents.length > 0) {
      featureVector.mouse = {
        mouse_velocity_avg: mouseMoveEvents.length > 1 ? totalMouseVelocity / (mouseMoveEvents.length - 1) : 0,
        mouse_acceleration_avg: mouseMoveEvents.length > 2 ? totalMouseAcceleration / (mouseMoveEvents.length - 2) : 0,
        mouse_path_tortuosity: this.calculateMousePathTortuosity(mouseMoveEvents), // Math Equation 7
        mouse_dwell_time_avg: mouseDwellTimeAvg,
        fitts_law_ip_avg: this.calculateFittsLawIndex(clickEvents), // Math Equation 10
        mouse_jerk_avg: mouseMoveEvents.length > 3 ? totalMouseJerk / (mouseMoveEvents.length - 3) : 0,
        mouse_entropy: this.calculateMouseEntropy(mouseMoveEvents), // Math Equation 13
      };
    }

    if (clickEvents.length > 0) {
      featureVector.clicks = {
        click_frequency: clickEvents.length / durationSeconds,
        click_latency_avg: clickEvents.length > 1 ? totalClickLatency / (clickEvents.length - 1) : 0,
        target_acquisition_error_avg: this.calculateTargetAcquisitionError(clickEvents), // Math Equation 8
        double_click_frequency: doubleClickCount / durationSeconds,
        click_burst_rate: clickBurstCount / durationSeconds,
        click_precision_avg: this.calculateClickPrecision(clickEvents), // Math Equation 9
      };
    }

    if (scrollEvents.length > 0) {
      featureVector.scroll = {
        scroll_velocity_avg: totalScrollYDelta / durationSeconds,
        scroll_direction_changes: scrollDirectionChanges,
        scroll_pause_frequency: scrollPauseCount / durationSeconds,
        scroll_page_coverage_avg: totalPageCoverage,
        scroll_intensity_score: scrollIntensityScore, // Math Equation 16
        scroll_backtracking_ratio: this.calculateScrollBacktrackingRatio(scrollEvents), // Math Equation 14
      };
    }

    if (keydownEvents.length > 0) {
      featureVector.keyboard = {
        typing_speed_wpm: wordCount / (durationSeconds / 60),
        backspace_frequency: backspaceCount / durationSeconds,
        keystroke_latency_avg: nonModifierKeydownCount > 1 ? totalKeystrokeLatency / (nonModifierKeydownCount - 1) : 0,
        error_correction_rate: errorCorrectionRate, // Math Equation 17
        typing_burst_speed: typingBurstSpeedWPM, // Math Equation 18
        keystroke_entropy: this.calculateKeystrokeEntropy(keydownEvents), // Math Equation 11
        modifier_key_frequency: modifierKeyCount / durationSeconds, // Math Equation 24
      };
    }

    featureVector.errors = {
      form_validation_errors_count: formValidationErrors,
      repeated_action_attempts_count: repeatedActionAttempts,
      navigation_errors_count: navigationErrors,
      api_errors_count: apiErrors,
      task_reversal_count: taskReversalCount, // Math Equation 19
    };

    if (gazeEvents.length > 0) {
        featureVector.gaze = {
            fixation_frequency: totalFixationFrequency,
            saccade_amplitude_avg: totalSaccadeAmplitude,
            gaze_deviation_from_focus: gazeDeviation, // Math Equation 15
            scan_path_tortuosity: scanPathTortuosity, // Math Equation 22
        };
    }

    // Clear event histories for the processed window.
    this.mouseMoveEventHistory = this.mouseMoveEventHistory.filter(e => e.timestamp >= windowEnd);
    this.scrollEventHistory = this.scrollEventHistory.filter(e => e.timestamp >= windowEnd);
    this.keyboardEventHistory = this.keyboardEventHistory.filter(e => e.timestamp >= windowEnd);
    this.gazeEventHistory = this.gazeEventHistory.filter(e => e.timestamp >= windowEnd);

    this.uiElementTracker.resetMetricsForWindow(); // Reset interaction metrics for the next window

    // Update last known states for next window (already done by flushing buffers in IEL)
    this.lastMouseCoord = mouseMoveEvents.length > 0 ? mouseMoveEvents[mouseMoveEvents.length - 1] : this.lastMouseCoord;
    this.lastScrollY = scrollEvents.length > 0 ? { y: scrollEvents[scrollEvents.length - 1].scrollY, timestamp: scrollEvents[scrollEvents.length - 1].timestamp, viewportHeight: scrollEvents[scrollEvents.length - 1].viewportHeight, documentHeight: scrollEvents[scrollEvents.length - 1].documentHeight } : this.lastScrollY;

    return featureVector;
  };

  private flushBuffer = (): void => {
    if (this.eventBuffer.length > 0) {
      const features = this.extractFeatures(this.eventBuffer);
      this.featureProcessingCallback(features);
      this.eventBuffer = []; // Clear buffer
    }
  };

  public stop(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.handleMouseMoveEvent);
      window.removeEventListener('click', this.handleClickEvent);
      window.removeEventListener('scroll', this.handleScrollEvent);
      window.removeEventListener('keydown', this.handleKeyboardEvent);
      window.removeEventListener('keyup', this.handleKeyboardEvent);
      window.removeEventListener('focusin', this.handleFocusBlurEvent);
      window.removeEventListener('focusout', this.handleFocusBlurEvent);
      window.removeEventListener('input', this.handleFormEvent);
      window.removeEventListener('change', this.handleFormEvent);
      window.removeEventListener('submit', this.handleFormEvent);
    }
    if (this.bufferInterval) {
      clearInterval(this.bufferInterval);
    }
    this.interactionErrorLogger.stop();
  }
}

// --- Predictive Analytics Service (New Class) ---
export class PredictiveAnalyticsService {
    private static instance: PredictiveAnalyticsService;
    private userProfileService = UserProfileService.getInstance();
    private loadHistory: number[] = [];

    private constructor() {}

    public static getInstance(): PredictiveAnalyticsService {
        if (!PredictiveAnalyticsService.instance) {
            PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
        }
        return PredictiveAnalyticsService.instance;
    }

    public updateLoadHistory(load: number): void {
        this.loadHistory.push(load);
        if (this.loadHistory.length > 50) { // Keep a rolling window
            this.loadHistory.shift();
        }
    }

    /**
     * Predicts the cognitive load for the next time window based on current features and recent history.
     * Uses a simplified autoregressive model with feature contributions.
     * Math Equation 25: Autoregressive Predictive Model for Cognitive Load
     * L_{t+1} = \alpha_0 + \sum_{i=1}^{P} \alpha_i L_{t-i+1} + \sum_{j=1}^{M} \beta_j F_{j,t} + \epsilon_t
     * where L is load, F are features, \alpha_i are autoregressive coefficients, \beta_j are feature weights, \epsilon_t is error.
     */
    public predictNextLoad(currentFeatures: TelemetryFeatureVector): number {
        if (this.loadHistory.length < 5) { // Not enough history for prediction
            return this.loadHistory.length > 0 ? this.loadHistory[this.loadHistory.length - 1] : this.userProfileService.getPreferences().personalizedBaselineCLS;
        }

        let predictedLoad = 0;
        const arCoefficients = [0.4, 0.2, 0.1, 0.05, 0.02]; // Autoregressive coefficients (mocked)
        const featureWeights = { // Simplified for prediction
            event_density: 0.01,
            mouse_velocity_avg: 0.02,
            mouse_acceleration_avg: 0.03,
            click_frequency: 0.01,
            target_acquisition_error_avg: 0.04,
            backspace_frequency: 0.05,
            error_correction_rate: 0.06,
            form_validation_errors_count: 0.1,
            current_task_complexity: 0.08,
            gaze_deviation_from_focus: 0.03,
        };

        // Autoregressive component
        for (let i = 0; i < arCoefficients.length && i < this.loadHistory.length; i++) {
            predictedLoad += arCoefficients[i] * this.loadHistory[this.loadHistory.length - 1 - i];
        }

        // Feature component
        if (currentFeatures.mouse) {
            predictedLoad += (currentFeatures.mouse.mouse_velocity_avg / 10) * featureWeights.mouse_velocity_avg;
            predictedLoad += (currentFeatures.mouse.mouse_acceleration_avg / 0.5) * featureWeights.mouse_acceleration_avg;
        }
        if (currentFeatures.clicks) {
            predictedLoad += (currentFeatures.clicks.click_frequency / 5) * featureWeights.click_frequency;
            predictedLoad += (currentFeatures.clicks.target_acquisition_error_avg / 50) * featureWeights.target_acquisition_error_avg;
        }
        if (currentFeatures.keyboard) {
            predictedLoad += (currentFeatures.keyboard.backspace_frequency / 2) * featureWeights.backspace_frequency;
            predictedLoad += (currentFeatures.keyboard.error_correction_rate * 2) * featureWeights.error_correction_rate;
        }
        if (currentFeatures.errors) {
            predictedLoad += (currentFeatures.errors.form_validation_errors_count * 0.5) * featureWeights.form_validation_errors_count;
        }
        if (currentFeatures.task_context) {
            predictedLoad += currentFeatures.task_context.current_task_complexity * featureWeights.current_task_complexity;
        }
        if (currentFeatures.gaze) {
            predictedLoad += (currentFeatures.gaze.gaze_deviation_from_focus / 100) * featureWeights.gaze_deviation_from_focus;
        }
        predictedLoad += (currentFeatures.event_density / 50) * featureWeights.event_density;

        // Clamp predicted load
        return Math.min(1.0, Math.max(0.0, predictedLoad));
    }

    /**
     * Math Equation 26: Risk Score Calculation
     * Risk = L_{predicted} \times C_{task} \times S_{user}
     * where L_{predicted} is predicted load, C_{task} is task complexity, S_{user} is user stress sensitivity.
     */
    public calculateRiskScore(predictedLoad: number, taskComplexity: number): number {
        const stressSensitivity = this.userProfileService.getPreferences().stressSensitivity;
        return predictedLoad * taskComplexity * stressSensitivity;
    }

    /**
     * Math Equation 27: Estimated Intervention Effectiveness
     * E = E_base \times (1 - L_{current}) \times (1 + S_{user})
     * where E_base is base effectiveness, L_{current} is current load, S_{user} is stress sensitivity.
     * This is a very simplified model.
     */
    public estimateInterventionEffectiveness(interventionType: 'minimal' | 'focus' | 'guided', currentLoad: number): number {
        const baseEffectiveness: { [key in typeof interventionType]: number } = {
            'minimal': 0.8,
            'focus': 0.6,
            'guided': 0.7,
        };
        const sensitivityFactor = 1 + (this.userProfileService.getPreferences().stressSensitivity * 0.5); // More sensitive user, higher impact
        return (baseEffectiveness[interventionType] || 0.5) * (1 - currentLoad) * sensitivityFactor;
    }
}

// --- Adaptive Threshold Manager (New Class) ---
export class AdaptiveThresholdManager {
    private static instance: AdaptiveThresholdManager;
    private userProfileService = UserProfileService.getInstance();
    private taskContextManager = TaskContextManager.getInstance();

    private constructor() {}

    public static getInstance(): AdaptiveThresholdManager {
        if (!AdaptiveThresholdManager.instance) {
            AdaptiveThresholdManager.instance = new AdaptiveThresholdManager();
        }
        return AdaptiveThresholdManager.instance;
    }

    /**
     * Dynamically adjusts cognitive load thresholds based on current task, user history, and preferences.
     * Math Equation 28: Dynamic Threshold Adjustment for 'High' Load
     * T_{high, new} = T_{high, base} + (C_{task} \times W_C) - (L_{baseline} \times W_L) + (P_{style} \times W_P)
     * where T_{high, base} is baseline high threshold, C_{task} is task complexity, W are weights, L_{baseline} is user baseline load, P_{style} is preferred adaptation style factor.
     */
    public adjustThresholds(currentLoad: number): UserPreferences['cognitiveLoadThresholds'] {
        const baseThresholds = this.userProfileService.getPreferences().cognitiveLoadThresholds;
        const currentTask = this.taskContextManager.getCurrentTask();
        const userBaseline = this.userProfileService.getPreferences().personalizedBaselineCLS;
        const learningRate = this.userProfileService.getPreferences().learningRate;
        const preferredStyle = this.userProfileService.getPreferences().preferredAdaptationStyle;

        let taskComplexityFactor = 0;
        if (currentTask) {
            const complexityMap: { [key in TaskContext['complexity']]: number } = {
                'low': -0.1, 'medium': 0, 'high': 0.1, 'critical': 0.2, 'dynamic': 0.05
            };
            taskComplexityFactor = complexityMap[currentTask.complexity];
        }

        let adaptationStyleFactor = 0;
        if (preferredStyle === 'proactive') adaptationStyleFactor = -0.05; // Lower thresholds for proactive adaptation
        else if (preferredStyle === 'minimal') adaptationStyleFactor = 0.05; // Higher thresholds for minimal intervention

        const adjustmentFactor = taskComplexityFactor - (userBaseline * 0.1) + adaptationStyleFactor; // Math Equation 29

        // Apply learning rate to make adjustments more gradual or aggressive
        const adjustedHigh = baseThresholds.high + (adjustmentFactor * learningRate);
        const adjustedLow = baseThresholds.low + (adjustmentFactor * learningRate);
        const adjustedCritical = baseThresholds.critical + (adjustmentFactor * 1.2 * learningRate);
        const adjustedCriticalLow = baseThresholds.criticalLow + (adjustmentFactor * 1.2 * learningRate);
        const adjustedGuided = baseThresholds.guided + (adjustmentFactor * learningRate);
        const adjustedGuidedLow = baseThresholds.guidedLow + (adjustmentFactor * learningRate);
        const adjustedAdaptiveHigh = baseThresholds.adaptiveHigh + (adjustmentFactor * 0.8 * learningRate);
        const adjustedAdaptiveLow = baseThresholds.adaptiveLow + (adjustmentFactor * 0.8 * learningRate);

        // Clamp thresholds between 0 and 1
        return {
            high: Math.min(0.9, Math.max(0.1, adjustedHigh)), // Math Equation 30
            low: Math.min(0.8, Math.max(0.05, adjustedLow)), // Math Equation 31
            critical: Math.min(0.95, Math.max(0.5, adjustedCritical)), // Math Equation 32
            criticalLow: Math.min(0.9, Math.max(0.4, adjustedCriticalLow)), // Math Equation 33
            guided: Math.min(0.9, Math.max(0.5, adjustedGuided)), // Math Equation 34
            guidedLow: Math.min(0.8, Math.max(0.4, adjustedGuidedLow)), // Math Equation 35
            adaptiveHigh: Math.min(0.85, Math.max(0.3, adjustedAdaptiveHigh)), // Math Equation 36
            adaptiveLow: Math.min(0.75, Math.max(0.2, adjustedAdaptiveLow)), // Math Equation 37
        };
    }

    /**
     * Math Equation 38: Threshold Hysteresis
     * To prevent rapid mode switching:
     * T_{up} = T_{base} + \delta
     * T_{down} = T_{base} - \delta
     * A mode change only occurs if load crosses T_up or T_down, not just T_base.
     */
    public applyHysteresis(threshold: number, currentMode: UiMode, targetMode: UiMode, hysteresisFactor: number = 0.02): { up: number, down: number } {
        if (currentMode === targetMode) { // If already in target mode, maintain current thresholds
            return { up: threshold, down: threshold };
        }
        // Increase threshold for entering 'higher' load mode, decrease for 'lower' load mode
        if (this.isModeHigherLoad(targetMode, currentMode)) {
            return { up: threshold + hysteresisFactor, down: threshold }; // Need to go higher to confirm
        } else {
            return { up: threshold, down: threshold - hysteresisFactor }; // Need to go lower to confirm
        }
    }

    private isModeHigherLoad(mode1: UiMode, mode2: UiMode): boolean {
        const modeOrder = ['minimal', 'hyperfocus', 'guided', 'focus', 'adaptive', 'low-distraction', 'standard'];
        return modeOrder.indexOf(mode1) < modeOrder.indexOf(mode2);
    }
}

// --- Cognitive Load Inference Engine ---
/**
 * @mermaid
 * graph TD
 *    A[TelemetryFeatureVector] --> B{processFeatures()}
 *    B --> C[latestFeatureVector]
 *    C --> D[predictionTimer]
 *    D -- Trigger --> E(inferLoad())
 *    E --> F[mockPredict(features)]
 *    F --> G[Apply Smoothing (EMA)]
 *    G --> H(onCognitiveLoadUpdate)
 *    H --> I[UserProfileService: addLoadToHistory]
 *    H --> J[PredictiveAnalyticsService: updateLoadHistory]
 */
/**
 * Claim 7: The CognitiveLoadEngine accurately infers real-time cognitive load by employing a sophisticated, multi-modal feature vector and a dynamically weighted prediction model.
 */
export class CognitiveLoadEngine {
  private latestFeatureVector: TelemetryFeatureVector | null = null;
  private loadHistory: number[] = []; // For internal smoothing
  private readonly historyLength: number = 20; // For smoothing
  private readonly predictionIntervalMs: number = 500;
  private predictionTimer: ReturnType<typeof setInterval> | null = null;
  private onCognitiveLoadUpdate: (load: number) => void;
  private userProfileService = UserProfileService.getInstance();
  private predictiveAnalyticsService = PredictiveAnalyticsService.getInstance(); // New service

  private _weights: { [key: string]: number } = {
    mouse_velocity_avg: 0.1, mouse_acceleration_avg: 0.15, mouse_path_tortuosity: 0.2, mouse_jerk_avg: 0.25, mouse_entropy: 0.15,
    click_frequency: 0.1, click_latency_avg: 0.15, target_acquisition_error_avg: 0.25, double_click_frequency: 0.1, click_burst_rate: 0.15, click_precision_avg: 0.2,
    scroll_velocity_avg: 0.05, scroll_direction_changes: 0.1, scroll_pause_frequency: 0.05, scroll_page_coverage_avg: 0.08, scroll_intensity_score: 0.12, scroll_backtracking_ratio: 0.2,
    typing_speed_wpm: 0.15, backspace_frequency: 0.3, keystroke_latency_avg: 0.1, error_correction_rate: 0.2, typing_burst_speed: 0.18, keystroke_entropy: 0.15, modifier_key_frequency: 0.1,
    form_validation_errors_count: 0.4, repeated_action_attempts_count: 0.3, navigation_errors_count: 0.2, api_errors_count: 0.25, task_reversal_count: 0.35,
    task_complexity: 0.2, time_in_task: 0.05, task_progress_ratio: 0.08, subtask_switches: 0.1, task_urgency_score: 0.15,
    event_density: 0.1, interaction_rate: 0.15,
    fixation_frequency: 0.1, saccade_amplitude_avg: 0.15, gaze_deviation_from_focus: 0.25, scan_path_tortuosity: 0.18,
  };

  constructor(onUpdate: (load: number) => void) {
    this.onCognitiveLoadUpdate = onUpdate;
    if (typeof setInterval !== 'undefined') {
      this.predictionTimer = setInterval(this.inferLoad, this.predictionIntervalMs);
    }
  }

  public processFeatures(featureVector: TelemetryFeatureVector): void {
    this.latestFeatureVector = featureVector;
  }

  /**
   * A more sophisticated mock machine learning model for cognitive load prediction.
   * This function simulates a weighted sum model with non-linear feature transformations.
   * Math Equation 39: Cognitive Load Prediction Model
   * CLS = B + \sum_{f \in Features} W_f \times T_f(V_f) + \sum_{i,j \in Interactions} W_{ij} \times I_{ij}(V_i, V_j)
   * where B is baseline, W_f are feature weights, T_f is non-linear transformation for feature f, V_f is feature value.
   * W_{ij} are interaction weights, I_{ij} is interaction term.
   */
  private mockPredict(features: TelemetryFeatureVector): number {
    const prefs = this.userProfileService.getPreferences();
    let score = prefs.personalizedBaselineCLS; // Start with baseline

    const weights = this._weights; // Use potentially updated weights

    // Math Equation 40: Non-linear transformation for feature (e.g., sigmoid or logarithmic scaling)
    const sigmoid = (x: number, k: number = 1, x0: number = 0) => 1 / (1 + Math.exp(-k * (x - x0))); // Math Equation 41
    const logScale = (x: number, c: number = 1) => Math.log1p(x / c); // Math Equation 42

    // Contribution from Mouse Features
    if (features.mouse) {
      score += sigmoid(features.mouse.mouse_velocity_avg / 5, 2, 0.5) * weights.mouse_velocity_avg; // Math Equation 43
      score += sigmoid(features.mouse.mouse_acceleration_avg / 0.2, 2, 0.5) * weights.mouse_acceleration_avg; // Math Equation 44
      score += sigmoid(features.mouse.mouse_path_tortuosity / 2, 2, 0.5) * weights.mouse_path_tortuosity; // Math Equation 45
      score += sigmoid(features.mouse.mouse_jerk_avg / 0.1, 2, 0.5) * weights.mouse_jerk_avg; // Math Equation 46
      score += sigmoid(features.mouse.mouse_entropy / 3, 2, 0.5) * weights.mouse_entropy; // Math Equation 47
      score += (1 - sigmoid(features.mouse.fitts_law_ip_avg / 5, 2, 1)) * weights.fitts_law_ip_avg; // Lower IP means higher load. Math Equation 48
    }

    // Contribution from Click Features
    if (features.clicks) {
      score += logScale(features.clicks.click_frequency / 2, 1) * weights.click_frequency; // Math Equation 49
      score += sigmoid(features.clicks.click_latency_avg / 150, 2, 0.5) * weights.click_latency_avg; // Higher latency -> higher load. Math Equation 50
      score += sigmoid(features.clicks.target_acquisition_error_avg / 30, 2, 0.5) * weights.target_acquisition_error_avg; // Larger error -> higher load. Math Equation 51
      score += sigmoid(features.clicks.double_click_frequency / 0.5, 2, 0.5) * weights.double_click_frequency; // Higher freq -> more hurried/stressed. Math Equation 52
      score += sigmoid(features.clicks.click_burst_rate / 1, 2, 0.5) * weights.click_burst_rate; // Math Equation 53
      score += (1 - sigmoid(features.clicks.click_precision_avg / 0.8, 2, 0.5)) * weights.click_precision_avg; // Lower precision -> higher load. Math Equation 54
    }

    // Contribution from Scroll Features
    if (features.scroll) {
      score += sigmoid(features.scroll.scroll_velocity_avg / 500, 2, 0.5) * weights.scroll_velocity_avg; // Math Equation 55
      score += logScale(features.scroll.scroll_direction_changes / 2, 1) * weights.scroll_direction_changes; // Math Equation 56
      score += logScale(features.scroll.scroll_pause_frequency / 1, 1) * weights.scroll_pause_frequency; // Math Equation 57
      score += (1 - sigmoid(features.scroll.scroll_page_coverage_avg / 0.5, 2, 0.5)) * weights.scroll_page_coverage_avg; // Low coverage could be confusion. Math Equation 58
      score += sigmoid(features.scroll.scroll_intensity_score / 1000, 2, 0.5) * weights.scroll_intensity_score; // Math Equation 59
      score += sigmoid(features.scroll.scroll_backtracking_ratio / 0.2, 2, 0.5) * weights.scroll_backtracking_ratio; // High backtracking -> confusion. Math Equation 60
    }

    // Contribution from Keyboard Features
    if (features.keyboard) {
      const optimalWPM = 60; // Assume ideal typing speed
      const wpmDeviation = Math.abs(features.keyboard.typing_speed_wpm - optimalWPM) / optimalWPM; // Math Equation 61
      score += sigmoid(wpmDeviation * 2, 2, 0.5) * weights.typing_speed_wpm; // Math Equation 62
      score += logScale(features.keyboard.backspace_frequency / 1, 1) * weights.backspace_frequency; // Math Equation 63
      score += sigmoid(features.keyboard.keystroke_latency_avg / 80, 2, 0.5) * weights.keystroke_latency_avg; // Math Equation 64
      score += sigmoid(features.keyboard.error_correction_rate * 3, 2, 0.5) * weights.error_correction_rate; // Math Equation 65
      score += (1 - sigmoid(features.keyboard.typing_burst_speed / 70, 2, 0.5)) * weights.typing_burst_speed; // Slow burst typing. Math Equation 66
      score += (1 - sigmoid(features.keyboard.keystroke_entropy / 4, 2, 0.5)) * weights.keystroke_entropy; // Low entropy could be repetitive errors. Math Equation 67
      score += sigmoid(features.keyboard.modifier_key_frequency / 1, 2, 0.5) * weights.modifier_key_frequency; // High modifier freq can imply complex operations. Math Equation 68
    }

    // Contribution from Error Features (strong indicators of load)
    if (features.errors) {
      score += logScale(features.errors.form_validation_errors_count * 0.8, 1) * weights.form_validation_errors_count; // Math Equation 69
      score += logScale(features.errors.repeated_action_attempts_count * 0.8, 1) * weights.repeated_action_attempts_count; // Math Equation 70
      score += logScale(features.errors.navigation_errors_count * 0.8, 1) * weights.navigation_errors_count; // Math Equation 71
      score += logScale(features.errors.api_errors_count * 0.8, 1) * weights.api_errors_count; // Math Equation 72
      score += logScale(features.errors.task_reversal_count * 0.8, 1) * weights.task_reversal_count; // Math Equation 73
    }

    // Contribution from Task Context
    if (features.task_context) {
      score += features.task_context.current_task_complexity * weights.task_complexity; // Linear contribution. Math Equation 74
      score += sigmoid(features.task_context.time_in_current_task_sec / 300, 2, 0.5) * weights.time_in_task; // Longer time -> higher load. Math Equation 75
      score += (1 - sigmoid(features.task_context.task_progress_ratio / 0.5, 2, 0.5)) * weights.task_progress_ratio; // Stalled progress implies load. Math Equation 76
      score += logScale(features.task_context.subtask_switches / 1, 1) * weights.subtask_switches; // Frequent switches implies load. Math Equation 77
      score += features.task_context.task_urgency_score * weights.task_urgency_score; // Urgency adds to perceived load. Math Equation 78
    }

    // Contribution from Gaze Features
    if (features.gaze) {
        score += sigmoid(features.gaze.fixation_frequency / 5, 2, 0.5) * weights.fixation_frequency; // Math Equation 79
        score += sigmoid(features.gaze.saccade_amplitude_avg / 50, 2, 0.5) * weights.saccade_amplitude_avg; // Math Equation 80
        score += sigmoid(features.gaze.gaze_deviation_from_focus / 50, 2, 0.5) * weights.gaze_deviation_from_focus; // Math Equation 81
        score += sigmoid(features.gaze.scan_path_tortuosity / 2, 2, 0.5) * weights.scan_path_tortuosity; // Math Equation 82
    }

    score += sigmoid(features.event_density / 40, 2, 0.5) * weights.event_density; // Very high event density or very low. Math Equation 83
    score += sigmoid(features.interaction_rate / 20, 2, 0.5) * weights.interaction_rate; // Math Equation 84

    // Interaction Term: High errors + High task complexity -> amplified load
    if (features.errors && features.task_context) {
        const errorSeverity = (features.errors.form_validation_errors_count + features.errors.repeated_action_attempts_count) > 0 ? 1 : 0;
        score += (errorSeverity * features.task_context.current_task_complexity * 0.1); // Math Equation 85
    }

    // Ensure score is within [0, 1]
    return Math.min(1.0, Math.max(0.0, score)); // Math Equation 86
  }

  private inferLoad = (): void => {
    if (!this.latestFeatureVector) {
      // If no new features, decay towards baseline or maintain last load
      const lastLoad = this.loadHistory.length > 0 ? this.loadHistory[this.loadHistory.length - 1] : this.userProfileService.getPreferences().personalizedBaselineCLS;
      const decayRate = 0.05; // Math Equation 87
      const decayedLoad = lastLoad * (1 - decayRate) + this.userProfileService.getPreferences().personalizedBaselineCLS * decayRate; // Math Equation 88
      this.loadHistory.push(decayedLoad);
      if (this.loadHistory.length > this.historyLength) {
        this.loadHistory.shift();
      }
      this.onCognitiveLoadUpdate(decayedLoad);
      this.userProfileService.addLoadToHistory(decayedLoad);
      this.predictiveAnalyticsService.updateLoadHistory(decayedLoad);
      return;
    }

    const rawLoad = this.mockPredict(this.latestFeatureVector);

    // Apply Exponential Moving Average for smoothing
    if (this.loadHistory.length === 0) {
      this.loadHistory.push(rawLoad);
    } else {
      const alpha = 2 / (this.historyLength + 1); // Smoothing factor. Math Equation 89
      const smoothed = this.loadHistory[this.loadHistory.length - 1] * (1 - alpha) + rawLoad * alpha; // Math Equation 90
      this.loadHistory.push(smoothed);
    }

    if (this.loadHistory.length > this.historyLength) {
      this.loadHistory.shift();
    }
    const currentSmoothedLoad = this.loadHistory[this.loadHistory.length - 1];

    this.onCognitiveLoadUpdate(currentSmoothedLoad);
    this.userProfileService.addLoadToHistory(currentSmoothedLoad); // Store load in user profile
    this.predictiveAnalyticsService.updateLoadHistory(currentSmoothedLoad); // Update predictive service
    this.latestFeatureVector = null; // Clear features processed
  };

  public updateModelWeights(newWeights: { [key: string]: number }): void {
    // In a real system, this would involve retraining or updating ML model parameters
    this._weights = { ...this._weights, ...newWeights };
    // Math Equation 91: Weight Update Rule (e.g., SGD)
    // W_{new} = W_{old} - \eta \nabla L(W)
    // Here we're just setting, but an actual learning mechanism would be here.
  }

  public stop(): void {
    if (this.predictionTimer) {
      clearInterval(this.predictionTimer);
    }
  }
}

// --- Adaptation Policy Manager ---
// This class defines concrete policies for UI elements based on the current UI mode.
/**
 * @mermaid
 * graph TD
 *    A[getCurrentUiMode] --> B{getPolicyForMode(mode, elementType)}
 *    B --> C{UserProfileService.getPreferences()}
 *    C --> D{Default Policies}
 *    D --> E[isVisible, className]
 *    E --> F[getUiElementState()]
 */
/**
 * Claim 8: The AdaptationPolicyManager dynamically translates inferred cognitive load into concrete UI adjustments, respecting user preferences and predefined adaptation strategies.
 */
export class AdaptationPolicyManager {
  private static instance: AdaptationPolicyManager;
  private userProfileService = UserProfileService.getInstance();
  private readonly defaultAdaptationPolicies: { [mode: string]: { [elementType: string]: 'obscure' | 'deemphasize' | 'reposition' | 'summarize' | 'none' | 'highlight' | 'expand' | 'contract' } } = {
    'standard': {
        [UiElementType.PRIMARY]: 'none', [UiElementType.SECONDARY]: 'none', [UiElementType.TERTIARY]: 'none',
        [UiElementType.GUIDED]: 'none', [UiElementType.CRITICAL]: 'none', [UiElementType.INFORMATIONAL]: 'none',
        [UiElementType.ACTIONABLE]: 'none', [UiElementType.VISUAL]: 'none', [UiElementType.UTILITY]: 'none',
        [UiElementType.FEEDBACK]: 'none',
    },
    'focus': {
        [UiElementType.PRIMARY]: 'none',
        [UiElementType.SECONDARY]: 'deemphasize',
        [UiElementType.TERTIARY]: 'obscure',
        [UiElementType.GUIDED]: 'none', // Guided elements should still be visible
        [UiElementType.CRITICAL]: 'highlight', // Highlight critical elements
        [UiElementType.INFORMATIONAL]: 'deemphasize',
        [UiElementType.ACTIONABLE]: 'none',
        [UiElementType.VISUAL]: 'obscure',
        [UiElementType.UTILITY]: 'deemphasize',
        [UiElementType.FEEDBACK]: 'highlight',
    },
    'minimal': {
        [UiElementType.PRIMARY]: 'none',
        [UiElementType.SECONDARY]: 'obscure',
        [UiElementType.TERTIARY]: 'obscure',
        [UiElementType.GUIDED]: 'obscure', // Even guided elements might be hidden
        [UiElementType.CRITICAL]: 'highlight',
        [UiElementType.INFORMATIONAL]: 'obscure',
        [UiElementType.ACTIONABLE]: 'none',
        [UiElementType.VISUAL]: 'obscure',
        [UiElementType.UTILITY]: 'obscure',
        [UiElementType.FEEDBACK]: 'highlight',
    },
    'guided': { // Emphasize guided elements, deemphasize others
        [UiElementType.PRIMARY]: 'none',
        [UiElementType.SECONDARY]: 'deemphasize',
        [UiElementType.TERTIARY]: 'obscure',
        [UiElementType.GUIDED]: 'highlight',
        [UiElementType.CRITICAL]: 'highlight',
        [UiElementType.INFORMATIONAL]: 'summarize',
        [UiElementType.ACTIONABLE]: 'none',
        [UiElementType.VISUAL]: 'deemphasize',
        [UiElementType.UTILITY]: 'deemphasize',
        [UiElementType.FEEDBACK]: 'highlight',
    },
    'adaptive': { // A blend, adapting based on criticality
        [UiElementType.PRIMARY]: 'none',
        [UiElementType.SECONDARY]: 'deemphasize',
        [UiElementType.TERTIARY]: 'summarize',
        [UiElementType.GUIDED]: 'none',
        [UiElementType.CRITICAL]: 'highlight',
        [UiElementType.INFORMATIONAL]: 'deemphasize',
        [UiElementType.ACTIONABLE]: 'none',
        [UiElementType.VISUAL]: 'deemphasize',
        [UiElementType.UTILITY]: 'deemphasize',
        [UiElementType.FEEDBACK]: 'highlight',
    },
    'hyperfocus': { // Extreme focus, similar to minimal but with strong highlighting for primary/critical
        [UiElementType.PRIMARY]: 'highlight',
        [UiElementType.SECONDARY]: 'obscure',
        [UiElementType.TERTIARY]: 'obscure',
        [UiElementType.GUIDED]: 'obscure',
        [UiElementType.CRITICAL]: 'highlight',
        [UiElementType.INFORMATIONAL]: 'obscure',
        [UiElementType.ACTIONABLE]: 'highlight',
        [UiElementType.VISUAL]: 'obscure',
        [UiElementType.UTILITY]: 'obscure',
        [UiElementType.FEEDBACK]: 'highlight',
    },
    'low-distraction': { // Softened focus, deemphasize without fully obscuring
        [UiElementType.PRIMARY]: 'none',
        [UiElementType.SECONDARY]: 'deemphasize',
        [UiElementType.TERTIARY]: 'deemphasize',
        [UiElementType.GUIDED]: 'none',
        [UiElementType.CRITICAL]: 'none',
        [UiElementType.INFORMATIONAL]: 'none',
        [UiElementType.ACTIONABLE]: 'none',
        [UiElementType.VISUAL]: 'deemphasize',
        [UiElementType.UTILITY]: 'deemphasize',
        [UiElementType.FEEDBACK]: 'none',
    },
  };

  private constructor() {}

  public static getInstance(): AdaptationPolicyManager {
    if (!AdaptationPolicyManager.instance) {
      AdaptationPolicyManager.instance = new AdaptationPolicyManager();
    }
    return AdaptationPolicyManager.instance;
  }

  // Define default or A/B testable policies.
  // In a real system, these would be fetched from a configuration service or derived from ML models.
  private getPolicyForMode(mode: UiMode, elementType: UiElementType) {
    // User-defined policies take precedence
    const userPolicy = this.userProfileService.getPreferences().adaptationPolicySelection[mode]?.[elementType];
    if (userPolicy) return userPolicy;

    // Default policies
    return this.defaultAdaptationPolicies[mode]?.[elementType] || 'none';
  }

  public getUiElementState(mode: UiMode, elementType: UiElementType): { isVisible: boolean; className: string; styleHint?: { [key: string]: string } } {
    const policy = this.getPolicyForMode(mode, elementType);
    let isVisible = true;
    let className = `${elementType.toLowerCase()}-element`;
    let styleHint: { [key: string]: string } = {};

    switch (policy) {
      case 'obscure':
        isVisible = false; // Completely hide
        styleHint = { display: 'none' }; // Math Equation 92: Display: none
        break;
      case 'deemphasize':
        className += ` mode-${mode}-deemphasize`;
        styleHint = { opacity: '0.4', filter: 'blur(2px)' }; // Math Equation 93: Opacity and Blur
        break;
      case 'reposition':
        className += ` mode-${mode}-reposition`; // Placeholder for repositioning logic
        styleHint = { order: '9999', margin: 'auto' }; // Math Equation 94: CSS Order and Margin
        break;
      case 'summarize':
        className += ` mode-${mode}-summarize`; // Placeholder for summarization logic
        styleHint = { fontSize: '0.8em', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }; // Math Equation 95: Summarization styling
        break;
      case 'highlight':
          className += ` mode-${mode}-highlight`;
          styleHint = { border: '2px solid var(--highlight-color, yellow)', boxShadow: '0 0 8px var(--highlight-color, yellow)' }; // Math Equation 96: Highlight styling
          break;
      case 'expand':
          className += ` mode-${mode}-expand`;
          styleHint = { transform: 'scale(1.05)', zIndex: '100' }; // Math Equation 97: Scale transformation
          break;
      case 'contract':
          className += ` mode-${mode}-contract`;
          styleHint = { transform: 'scale(0.95)', opacity: '0.8' }; // Math Equation 98: Scale transformation and opacity
          break;
      case 'none':
      default:
        // Default visibility and class name
        break;
    }

    return { isVisible, className, styleHint };
  }
}

// --- Cognitive Load Balancer Service ---
/**
 * @mermaid
 * graph TD
 *    A[start()] --> B(TelemetryAgent.initListeners())
 *    A --> C(CognitiveLoadEngine Prediction Timer)
 *    A --> D[Mode Transition Interval]
 *
 *    D -- Trigger --> E(checkUiModeTransition())
 *    E --> F{_cognitiveLoad vs _loadThresholds}
 *    F --> G{_currentTask Complexity}
 *    F & G --> H[Determine nextMode]
 *    H --> I{Sustained Load?}
 *    I -- Yes --> J[setUiMode(nextMode)]
 *    J --> K[Notify Mode Subscribers]
 *
 *    subgraph Telemetry Flow
 *        TelemetryAgent -- features --> CognitiveLoadEngine -- load --> CognitiveLoadBalancerService
 *    end
 */
/**
 * Claim 9: The CognitiveLoadBalancerService orchestrates a real-time, closed-loop feedback system, adapting the UI to maintain an optimal cognitive state for the user.
 * Claim 10: By leveraging predictive analytics and adaptive thresholds, the system can proactively mitigate potential overload, enhancing user experience and productivity.
 */
export class CognitiveLoadBalancerService {
  private static instance: CognitiveLoadBalancerService;

  private userProfileService: UserProfileService;
  private taskContextManager: TaskContextManager;
  private interactionErrorLogger: InteractionErrorLogger;
  private adaptationPolicyManager: AdaptationPolicyManager;
  private telemetryAgent: TelemetryAgent;
  private cognitiveLoadEngine: CognitiveLoadEngine;
  private predictiveAnalyticsService: PredictiveAnalyticsService; // New service
  private adaptiveThresholdManager: AdaptiveThresholdManager; // New manager
  private uiElementTracker: UiElementTracker; // New tracker

  private _cognitiveLoad: number = 0.0;
  private _predictedLoad: number = 0.0; // New: predicted future load
  private _uiMode: UiMode = 'standard';
  private _currentTask: TaskContext | null = null;
  private _loadThresholds: UserPreferences['cognitiveLoadThresholds']; // Dynamically adjusted

  private _sustainedLoadCounter: number = 0;
  private readonly _checkIntervalMs: number = 500;
  private readonly _sustainedLoadDurationMs: number = 1500;
  private _modeTransitionInterval: ReturnType<typeof setInterval> | null = null;

  private _loadSubscribers: Set<(load: number) => void> = new Set();
  private _predictedLoadSubscribers: Set<(load: number) => void> = new Set(); // New subscriber for predicted load
  private _modeSubscribers: Set<(mode: UiMode) => void> = new Set();
  private _taskSubscribers: Set<(task: TaskContext | null) => void> = new Set();
  private _thresholdSubscribers: Set<(thresholds: UserPreferences['cognitiveLoadThresholds']) => void> = new Set(); // New subscriber for adaptive thresholds

  private constructor() {
    this.userProfileService = UserProfileService.getInstance();
    this.taskContextManager = TaskContextManager.getInstance();
    this.interactionErrorLogger = InteractionErrorLogger.getInstance();
    this.adaptationPolicyManager = AdaptationPolicyManager.getInstance();
    this.predictiveAnalyticsService = PredictiveAnalyticsService.getInstance();
    this.adaptiveThresholdManager = AdaptiveThresholdManager.getInstance();
    this.uiElementTracker = UiElementTracker.getInstance();

    this._loadThresholds = this.userProfileService.getPreferences().cognitiveLoadThresholds; // Initial thresholds
    this.telemetryAgent = new TelemetryAgent(this._handleFeatureVector);
    this.cognitiveLoadEngine = new CognitiveLoadEngine(this._handleCognitiveLoad);

    this.taskContextManager.subscribe(this._handleTaskContext);
    // Initialize thresholds based on current context
    this._loadThresholds = this.adaptiveThresholdManager.adjustThresholds(this._cognitiveLoad);
  }

  public static getInstance(): CognitiveLoadBalancerService {
    if (!CognitiveLoadBalancerService.instance) {
      CognitiveLoadBalancerService.instance = new CognitiveLoadBalancerService();
    }
    return CognitiveLoadBalancerService.instance;
  }

  private _handleFeatureVector = (features: TelemetryFeatureVector): void => {
    this.cognitiveLoadEngine.processFeatures(features);
    // Also predict future load based on new features
    this._predictedLoad = this.predictiveAnalyticsService.predictNextLoad(features);
    this._predictedLoadSubscribers.forEach(callback => callback(this._predictedLoad));
    // Math Equation 99: Predicted load is a function of current features and history.
    // L_p = f(F_t, H_t)
  };

  private _handleCognitiveLoad = (load: number): void => {
    if (load !== this._cognitiveLoad) {
      this._cognitiveLoad = load;
      this._loadSubscribers.forEach(callback => callback(this._cognitiveLoad));
      // Dynamically adjust thresholds based on current load and other factors
      const newThresholds = this.adaptiveThresholdManager.adjustThresholds(this._cognitiveLoad);
      if (JSON.stringify(newThresholds) !== JSON.stringify(this._loadThresholds)) {
          this._loadThresholds = newThresholds;
          this._thresholdSubscribers.forEach(callback => callback(this._loadThresholds));
      }
    }
  };

  private _handleTaskContext = (task: TaskContext | null): void => {
    if (task !== this._currentTask) {
      this._currentTask = task;
      this._taskSubscribers.forEach(callback => callback(this._currentTask));
      // Re-evaluate thresholds when task context changes
      this._loadThresholds = this.adaptiveThresholdManager.adjustThresholds(this._cognitiveLoad);
      this._thresholdSubscribers.forEach(callback => callback(this._loadThresholds));
    }
  };

  private _setUiMode = (newMode: UiMode): void => {
    if (newMode !== this._uiMode) {
      this._uiMode = newMode;
      this._modeSubscribers.forEach(callback => callback(this._uiMode));
      // console.log(`UI Mode changed to: ${this._uiMode}`);
    }
  };

  /**
   * Math Equation 100: Mode Transition Logic
   * nextMode = f(CurrentLoad, PredictedLoad, Thresholds, TaskComplexity, UserPreferences, Hysteresis)
   */
  private _checkUiModeTransition = (): void => {
    const currentMode = this._uiMode;
    const cognitiveLoad = this._cognitiveLoad;
    const predictedLoad = this._predictedLoad; // Consider predicted load for proactive changes
    const thresholds = this._loadThresholds;
    const taskComplexity = this._currentTask?.complexity === 'critical' || this._currentTask?.complexity === 'high'; // Simplified check
    const userPreferredStyle = this.userProfileService.getPreferences().preferredAdaptationStyle;

    let nextMode: UiMode = currentMode;
    let transitionReason: string = 'stable';

    // Prioritize critical load states or explicit guided modes
    if (cognitiveLoad > thresholds.critical || predictedLoad > thresholds.critical + 0.05) { // Proactive critical
      if (currentMode !== 'minimal' && currentMode !== 'hyperfocus') {
        nextMode = 'minimal';
        transitionReason = 'critical_overload';
      }
    } else if (cognitiveLoad < thresholds.criticalLow && currentMode === 'minimal') {
      nextMode = 'focus';
      transitionReason = 'critical_recovery';
    } else if (cognitiveLoad > thresholds.guided && taskComplexity && currentMode !== 'guided') {
      nextMode = 'guided';
      transitionReason = 'task_guided_needed';
    } else if (cognitiveLoad < thresholds.guidedLow && currentMode === 'guided' && !taskComplexity) {
      nextMode = 'focus';
      transitionReason = 'guided_not_needed';
    }
    // Apply preferred adaptation style for general load balancing
    else if (userPreferredStyle === 'proactive') {
        if (predictedLoad > thresholds.adaptiveHigh && currentMode === 'standard') {
            nextMode = 'focus';
            transitionReason = 'proactive_high_load';
        } else if (predictedLoad < thresholds.adaptiveLow && (currentMode === 'focus' || currentMode === 'low-distraction')) {
            nextMode = 'standard';
            transitionReason = 'proactive_low_load';
        }
    }
    // Default reactive transitions
    if (nextMode === currentMode) { // Only if no higher priority transition occurred
        if (cognitiveLoad > thresholds.high && currentMode === 'standard') {
          nextMode = 'focus';
          transitionReason = 'reactive_high_load';
        } else if (cognitiveLoad < thresholds.low && (currentMode === 'focus' || currentMode === 'low-distraction')) {
          nextMode = 'standard';
          transitionReason = 'reactive_low_load';
        } else if (cognitiveLoad > thresholds.adaptiveHigh && currentMode === 'focus') {
            nextMode = 'hyperfocus';
            transitionReason = 'reactive_escalate_focus';
        } else if (cognitiveLoad < thresholds.adaptiveLow && currentMode === 'hyperfocus') {
            nextMode = 'focus';
            transitionReason = 'reactive_deescalate_hyperfocus';
        }
    }

    // Apply hysteresis to prevent rapid flickering between modes
    const { up: targetUpThreshold, down: targetDownThreshold } = this.adaptiveThresholdManager.applyHysteresis(
        nextMode === 'minimal' ? thresholds.critical : (nextMode === 'focus' ? thresholds.high : thresholds.low),
        currentMode,
        nextMode
    );

    let shouldTransition = false;
    if (nextMode !== currentMode) {
        // If we are trying to go to a higher-load mode (e.g., standard -> focus)
        if (this.adaptiveThresholdManager.isModeHigherLoad(nextMode, currentMode)) {
            if (cognitiveLoad > targetUpThreshold) {
                this._sustainedLoadCounter += this._checkIntervalMs;
                if (this._sustainedLoadCounter >= this._sustainedLoadDurationMs) {
                    shouldTransition = true;
                }
            } else {
                this._sustainedLoadCounter = 0; // Load dropped below threshold, reset counter
            }
        }
        // If we are trying to go to a lower-load mode (e.g., focus -> standard)
        else {
            if (cognitiveLoad < targetDownThreshold) {
                this._sustainedLoadCounter += this._checkIntervalMs;
                if (this._sustainedLoadCounter >= this._sustainedLoadDurationMs) {
                    shouldTransition = true;
                }
            } else {
                this._sustainedLoadCounter = 0; // Load rose above threshold, reset counter
            }
        }
    } else {
        this._sustainedLoadCounter = 0; // Reset if conditions for transition are no longer met
    }

    if (shouldTransition) {
        this._setUiMode(nextMode);
        this._sustainedLoadCounter = 0; // Reset after transition
    }
  };

  public start(): void {
    // console.log('CognitiveLoadBalancerService starting...');
    this.telemetryAgent.initListeners();
    if (typeof setInterval !== 'undefined') {
      this._modeTransitionInterval = setInterval(this._checkUiModeTransition, this._checkIntervalMs);
    }
    // Initial notifications
    this._loadSubscribers.forEach(callback => callback(this._cognitiveLoad));
    this._predictedLoadSubscribers.forEach(callback => callback(this._predictedLoad));
    this._modeSubscribers.forEach(callback => callback(this._uiMode));
    this._taskSubscribers.forEach(callback => callback(this._currentTask));
    this._thresholdSubscribers.forEach(callback => callback(this._loadThresholds));
  }

  public stop(): void {
    // console.log('CognitiveLoadBalancerService stopping...');
    this.telemetryAgent.stop();
    this.cognitiveLoadEngine.stop();
    this.interactionErrorLogger.stop();
    if (this._modeTransitionInterval) {
      clearInterval(this._modeTransitionInterval);
    }
    this._loadSubscribers.clear();
    this._predictedLoadSubscribers.clear();
    this._modeSubscribers.clear();
    this._taskSubscribers.clear();
    this._thresholdSubscribers.clear();
  }

  public getCognitiveLoad(): number {
    return this._cognitiveLoad;
  }

  public getPredictedCognitiveLoad(): number {
      return this._predictedLoad;
  }

  public getUiMode(): UiMode {
    return this._uiMode;
  }

  public getCurrentTask(): TaskContext | null {
    return this._currentTask;
  }

  public getCognitiveLoadThresholds(): UserPreferences['cognitiveLoadThresholds'] {
      return { ...this._loadThresholds };
  }

  public subscribeToLoad(callback: (load: number) => void): () => void {
    this._loadSubscribers.add(callback);
    callback(this._cognitiveLoad); // Immediate notification
    return () => this._loadSubscribers.delete(callback);
  }

  public subscribeToPredictedLoad(callback: (load: number) => void): () => void {
    this._predictedLoadSubscribers.add(callback);
    callback(this._predictedLoad); // Immediate notification
    return () => this._predictedLoadSubscribers.delete(callback);
  }

  public subscribeToUiMode(callback: (mode: UiMode) => void): () => void {
    this._modeSubscribers.add(callback);
    callback(this._uiMode); // Immediate notification
    return () => this._modeSubscribers.delete(callback);
  }

  public subscribeToTaskContext(callback: (task: TaskContext | null) => void): () => void {
    this._taskSubscribers.add(callback);
    callback(this._currentTask); // Immediate notification
    return () => this._taskSubscribers.delete(callback);
  }

  public subscribeToThresholds(callback: (thresholds: UserPreferences['cognitiveLoadThresholds']) => void): () => void {
      this._thresholdSubscribers.add(callback);
      callback(this._loadThresholds); // Immediate notification
      return () => this._thresholdSubscribers.delete(callback);
  }

  /**
   * Provides UI adaptation state for a given element type based on the current UI mode.
   * Frameworks can use this to apply dynamic styling or conditional rendering.
   * @param uiType The type of the UI element (e.g., PRIMARY, SECONDARY, TERTIARY).
   * @returns An object indicating visibility and appropriate CSS class name.
   */
  public getUiElementAdaptationState(uiType: UiElementType): { isVisible: boolean; className: string; styleHint?: { [key: string]: string } } {
    return this.adaptationPolicyManager.getUiElementState(this._uiMode, uiType);
  }

  // Expose Managers/Services for external interaction
  public getTaskContextManager(): TaskContextManager {
    return this.taskContextManager;
  }

  public getInteractionErrorLogger(): InteractionErrorLogger {
    return this.interactionErrorLogger;
  }

  public getUserProfileService(): UserProfileService {
    return this.userProfileService;
  }

  public getUiElementTracker(): UiElementTracker {
      return this.uiElementTracker;
  }

  public getPredictiveAnalyticsService(): PredictiveAnalyticsService {
      return this.predictiveAnalyticsService;
  }

  public getAdaptiveThresholdManager(): AdaptiveThresholdManager {
      return this.adaptiveThresholdManager;
  }
}