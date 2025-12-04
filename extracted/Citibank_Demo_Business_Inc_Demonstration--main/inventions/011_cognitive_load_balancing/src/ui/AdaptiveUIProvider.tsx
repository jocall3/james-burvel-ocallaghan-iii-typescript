import React, { useState, useEffect, useContext, createContext, useCallback, useRef } from 'react';

// --- Global Types/Interfaces ---
export enum UiElementType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  GUIDED = 'guided', // New type for elements specific to guided mode
  CRITICAL_ACTION = 'critical_action', // For high-importance, high-impact actions
  NAV_GLOBAL = 'nav_global', // Global navigation elements
  HINT_CONTEXTUAL = 'hint_contextual', // Context-specific help or hints
  FEEDBACK_NOTIFICATION = 'feedback_notification', // Alerts, success/error messages
  DYNAMIC_CONTENT = 'dynamic_content', // Content that might change often
}

export type UiMode = 'standard' | 'focus' | 'minimal' | 'guided' | 'crisis' | 'recovery'; // Added crisis and recovery modes

export interface MouseEventData {
  x: number;
  y: number;
  button: number;
  targetId: string;
  timestamp: number;
  targetBoundingRect?: DOMRectReadOnly; // For target acquisition error
  pressure?: number; // Advanced input: e.g., from a pressure-sensitive surface
  hoverDuration?: number; // Duration of hover before click
}

export interface ScrollEventData {
  scrollX: number;
  scrollY: number;
  timestamp: number;
  scrollDeltaY: number; // Delta from last scroll event
  scrollVelocity: number; // px/ms
  viewportHeight: number;
  documentHeight: number;
}

export interface KeyboardEventData {
  key: string;
  code: string;
  timestamp: number;
  isModifier: boolean;
  repeat: boolean; // Is it a key repeat event?
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface FocusBlurEventData {
  type: 'focus' | 'blur';
  targetId: string;
  timestamp: number;
  durationMs?: number; // Time element was focused
  interactionCount?: number; // Number of interactions while focused
}

export interface FormEventData {
  type: 'submit' | 'input' | 'change' | 'validation_attempt' | 'reset'; // Added validation_attempt, reset
  targetId: string;
  value?: string;
  timestamp: number;
  isValid?: boolean; // For validation events
  validationMessage?: string;
}

export interface GazeEventData { // New: Mock Gaze Tracking Data
  x: number;
  y: number;
  timestamp: number;
  targetElementId?: string;
  pupilDilation?: number; // Example biometric
  gazeStability?: number; // Variance of gaze points over a short window
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
  | { type: 'gaze'; data: GazeEventData }; // New gaze event type

// --- Feature Vector Interfaces ---
export interface MouseKinematicsFeatures {
  mouse_velocity_avg: number; // avg px/ms
  mouse_acceleration_avg: number; // avg px/ms^2
  mouse_path_tortuosity: number; // deviation from straight line, 0-1 (higher indicates less direct path)
  mouse_dwell_time_avg: number; // avg ms over interactive elements
  fitts_law_ip_avg: number; // Index of Performance, higher is better
  mouse_smoothness_index: number; // Inverse of abrupt changes, 0-1 (1 is perfectly smooth)
  mouse_travel_distance_total: number; // Total distance covered
}

export interface ClickDynamicsFeatures {
  click_frequency: number; // clicks/sec
  click_latency_avg: number; // ms between clicks in a burst
  target_acquisition_error_avg: number; // px deviation from center
  double_click_frequency: number; // double clicks / sec
  click_pressure_avg: number; // avg pressure if available
  error_click_rate: number; // Clicks that result in immediate error or navigation bounce
}

export interface ScrollDynamicsFeatures {
  scroll_velocity_avg: number; // px/sec
  scroll_direction_changes: number; // count
  scroll_pause_frequency: number; // pauses / sec (prolonged stops)
  scroll_jerk_avg: number; // Rate of change of acceleration
  scroll_coverage_ratio: number; // Percentage of document scrolled
}

export interface KeyboardDynamicsFeatures {
  typing_speed_wpm: number;
  backspace_frequency: number; // backspaces / sec
  keystroke_latency_avg: number; // ms between keydowns
  error_correction_rate: number; // backspaces / keydowns (excluding modifiers)
  typing_burst_rate: number; // Number of continuous typing bursts per second
  modifier_key_usage_ratio: number; // Ratio of modifier keys to content keys
}

export interface FocusDynamicsFeatures {
  refocus_frequency: number; // How often focus changes / sec
  element_dwell_time_avg: number; // Avg time spent on focused elements
  blur_rate: number; // How often elements lose focus unexpectedly
}

export interface FormInteractionFeatures {
  form_validation_errors_count: number; // count of explicit validation errors
  form_submission_rate: number; // submissions / sec
  form_abandonment_rate: number; // forms started but not submitted (in window)
  form_interaction_time_avg: number; // avg time per form field
}

export interface InteractionErrorFeatures {
  form_validation_errors_count: number; // count
  repeated_action_attempts_count: number; // count of same action or element interaction
  navigation_errors_count: number; // e.g., dead links, rapid back/forward
  api_errors_count: number; // New: backend API errors
  system_ui_errors_count: number; // New: client-side UI errors/crashes
}

export interface GazeTrackingFeatures { // New: Gaze features
  gaze_deviation_avg: number; // Average deviation from intended target
  pupil_dilation_avg: number; // Average pupil dilation over window
  fixation_frequency: number; // Number of stable gaze points per second
  saccade_velocity_avg: number; // Average velocity of eye movements between fixations
}

export interface TaskContextFeatures {
  current_task_complexity: number; // derived from TaskContextManager
  time_in_current_task_sec: number;
  task_switches_count: number; // Number of task context changes
  task_completion_status: number; // 0=incomplete, 1=complete (requires external tracking)
}

export interface UserEngagementFeatures { // New: Overall engagement
  active_interaction_ratio: number; // % of time spent interacting vs. idle
  idle_duration_avg: number; // Average idle time between interactions
  frustration_index_proxy: number; // Derived from a combination of errors, rapid clicks, high tortuosity
}

export interface TelemetryFeatureVector {
  timestamp_window_end: number;
  window_duration_ms: number;
  mouse?: MouseKinematicsFeatures;
  clicks?: ClickDynamicsFeatures;
  scroll?: ScrollDynamicsFeatures;
  keyboard?: KeyboardDynamicsFeatures;
  focus?: FocusDynamicsFeatures; // New
  forms?: FormInteractionFeatures; // New
  errors?: InteractionErrorFeatures;
  gaze?: GazeTrackingFeatures; // New
  task_context?: TaskContextFeatures;
  engagement?: UserEngagementFeatures; // New
  event_density: number; // total events per second in the window
  ui_mode_context: UiMode; // The UI mode active during this window
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
    crisis: number; // New
    recovery: number; // New
  };
  adaptationPolicySelection: {
    [mode: string]: { [elementType: string]: 'obscure' | 'deemphasize' | 'reposition' | 'summarize' | 'highlight' | 'segment' | 'none' }; // Added highlight, segment
  };
  personalizedBaselineCLS: number; // User's typical resting CLS
  sensitivityToErrors: number; // User's preference for how quickly errors trigger load response (0-1)
  preferenceForGuidance: number; // User's preference for guided mode activation (0-1)
  a_b_test_group: string; // For A/B testing different adaptation strategies
}

/**
 * Claim 1: User Profile Service enhances personalization.
 * "By centralizing user preferences and historical interaction data, the UserProfileService enables a highly personalized adaptive UI experience, moving beyond one-size-fits-all designs to cater to individual cognitive capacities and learning styles."
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
      crisis: 0.9,
      recovery: 0.55,
    },
    adaptationPolicySelection: {}, // Default empty, managed by AdaptationPolicyManager
    personalizedBaselineCLS: 0.1, // Default baseline
    sensitivityToErrors: 0.7,
    preferenceForGuidance: 0.8,
    a_b_test_group: 'control', // Default
  };

  private constructor() {
    // Load from localStorage or backend in a real app
    const storedPrefs = localStorage.getItem('userCognitiveLoadPrefs');
    if (storedPrefs) {
      try {
        this.currentPreferences = { ...this.currentPreferences, ...JSON.parse(storedPrefs) };
      } catch (e) {
        console.error("Failed to parse user preferences from localStorage:", e);
        // Fallback to default preferences
      }
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
    localStorage.setItem('userCognitiveLoadPrefs', JSON.stringify(this.currentPreferences));
    console.log("User preferences updated:", newPrefs);
  }

  public async loadPreferencesFromServer(userId: string): Promise<void> {
    // Mock API call
    console.log(`Fetching preferences for user ${userId} from server...`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const serverPrefs: Partial<UserPreferences> = {
      a_b_test_group: Math.random() > 0.5 ? 'experiment-A' : 'experiment-B',
      personalizedBaselineCLS: Math.random() * 0.2 + 0.05, // Random baseline
    };
    this.updatePreferences(serverPrefs);
    console.log("Preferences loaded from server:", serverPrefs);
  }
}

// --- Task Context Manager ---
export type TaskContext = {
  id: string;
  name: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'immediate'; // New: Task urgency
  timestamp: number;
  durationEstimateMs?: number; // Estimated time to complete task
  progressPercentage?: number; // Task progress
  associatedElements?: string[]; // IDs of UI elements relevant to this task
};

/**
 * Mermaid Diagram 1: Task Context State Machine
 * Illustrates the lifecycle of a task and how its state transitions are managed.
 */
export const TASK_CONTEXT_STATE_MACHINE_MERMAID = `
graph LR
    A[Idle] --> B{Task Initiated};
    B --> C[Active Task]
    C --> D{Task Update (Progress/Complexity)};
    D --> C;
    C --> E{Task Completion};
    C --> F{Task Abandoned/Error};
    E --> A;
    F --> A;
    subgraph Task Attributes
        C -- id, name, complexity --> C;
        C -- urgency, durationEstimateMs --> C;
    end
`;

export class TaskContextManager {
  private static instance: TaskContextManager;
  private currentTask: TaskContext | null = null;
  private listeners: Set<(task: TaskContext | null) => void> = new Set();
  private taskHistory: TaskContext[] = []; // Track recently completed tasks
  private maxTaskHistoryLength: number = 10;

  private constructor() {
    // Initialize with a default or infer from URL
    this.setTask({ id: 'app_init', name: 'Application Initialization', complexity: 'low', urgency: 'low', timestamp: performance.now() });
  }

  public static getInstance(): TaskContextManager {
    if (!TaskContextManager.instance) {
      TaskContextManager.instance = new TaskContextManager();
    }
    return TaskContextManager.instance;
  }

  /**
   * Claim 2: Proactive Task Adaptation.
   * "The TaskContextManager plays a crucial role in proactive adaptation by providing contextual information (e.g., complexity, urgency) to the CognitiveLoadEngine, allowing the UI to prepare for anticipated load changes rather than solely reacting to observed user behavior."
   */
  public setTask(task: TaskContext | null): void {
    if (task && this.currentTask && task.id === this.currentTask.id) {
      // If the task ID is the same, just update attributes if they changed
      if (JSON.stringify(task) !== JSON.stringify(this.currentTask)) {
        this.currentTask = { ...this.currentTask, ...task, timestamp: performance.now() }; // Update timestamp for 'time in task'
        this.listeners.forEach(listener => listener(this.currentTask));
        console.log(`TaskContextManager: Task attributes updated for ${task?.name || 'N/A'}`);
      }
      return;
    }

    // New task or clearing task
    if (this.currentTask) {
      // Before setting a new task, "complete" the old one for history
      this.taskHistory.push({ ...this.currentTask, progressPercentage: 100 });
      if (this.taskHistory.length > this.maxTaskHistoryLength) {
        this.taskHistory.shift();
      }
    }
    this.currentTask = task;
    this.listeners.forEach(listener => listener(this.currentTask));
    console.log(`TaskContextManager: Current task set to ${task?.name || 'N/A'} (Complexity: ${task?.complexity || 'N/A'}, Urgency: ${task?.urgency || 'N/A'})`);
  }

  public getCurrentTask(): TaskContext | null {
    return this.currentTask;
  }

  public getTaskHistory(): TaskContext[] {
    return [...this.taskHistory];
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
  type: 'validation' | 'repeatedAction' | 'navigation' | 'apiError' | 'clientRuntime' | 'businessLogic'; // Added clientRuntime, businessLogic
  elementId?: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical'; // New: error severity
  errorCode?: string; // New: specific error code
  contextPath?: string; // New: where the error occurred in the UI flow
}

export class InteractionErrorLogger {
  private static instance: InteractionErrorLogger;
  private errorsBuffer: InteractionError[] = [];
  private listeners: Set<(errors: InteractionError[]) => void> = new Set();
  private readonly bufferFlushRateMs: number = 1000;
  private bufferFlushInterval: ReturnType<typeof setInterval> | null = null;
  private maxBufferSize: number = 50; // To prevent memory overflow for errors

  private constructor() {
    this.bufferFlushInterval = setInterval(this.flushBuffer, this.bufferFlushRateMs);
  }

  public static getInstance(): InteractionErrorLogger {
    if (!InteractionErrorLogger.instance) {
      InteractionErrorLogger.instance = new InteractionErrorLogger();
    }
    return InteractionErrorLogger.instance;
  }

  public logError(error: Omit<InteractionError, 'id' | 'timestamp'>): void {
    const newError: InteractionError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: performance.now(),
      ...error,
    };
    this.errorsBuffer.push(newError);
    if (this.errorsBuffer.length > this.maxBufferSize) {
      this.errorsBuffer.shift(); // Remove oldest error if buffer is full
    }
    console.warn(`InteractionErrorLogger: Logged error - ${newError.message} (Type: ${newError.type}, Severity: ${newError.severity})`);
  }

  private flushBuffer = (): void => {
    if (this.errorsBuffer.length > 0) {
      this.listeners.forEach(listener => listener([...this.errorsBuffer])); // Send a copy
      this.errorsBuffer = []; // Clear after notifying
    }
  };

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

/**
 * Exported Constant for Mouse Kinematics Equations.
 * Equation 1-10: Detailed Mouse Kinematics Calculations.
 */
export const MOUSE_KINEMATICS_EQUATIONS = `
// 1. Instantaneous Velocity (Euclidean Distance / Time Delta)
// V_i = sqrt((x_i - x_{i-1})^2 + (y_i - y_{i-1})^2) / (t_i - t_{i-1})
//
// 2. Average Velocity over N events:
// V_avg = (1/N) * sum(V_i) for i=1 to N
//
// 3. Instantaneous Acceleration:
// A_i = (V_i - V_{i-1}) / (t_i - t_{i-1})
//
// 4. Average Acceleration over N events:
// A_avg = (1/N) * sum(A_i) for i=1 to N
//
// 5. Path Tortuosity (Normalized path length):
// Tortuosity = (Sum of segment lengths) / (Straight-line distance from start to end)
// Segment Length L_i = sqrt((x_i - x_{i-1})^2 + (y_i - y_{i-1})^2)
// Straight Line Distance S_total = sqrt((x_N - x_0)^2 + (y_N - y_0)^2)
// Tortuosity Index = (sum(L_i)) / S_total  (where sum(L_i) is total path length)
//
// 6. Fitts's Law Index of Performance (IP) for a target:
// IP = log2(2A/W) / MT
// Where: A = Amplitude (distance to target center)
//        W = Width of target (or smaller dimension of target bounding box)
//        MT = Movement Time (time taken to acquire target)
// We estimate MT as time from mouse movement initiation to click.
//
// 7. Mouse Smoothness Index (MSI - simplified proxy):
// MSI = 1 - (sum(abs(A_i))) / (sum(V_i) * Max_Accel_Scale)
// A proxy for how jerky mouse movements are. Lower sum of absolute accelerations means smoother.
// Max_Accel_Scale is a normalization factor.
//
// 8. Total Mouse Travel Distance:
// D_total = sum(L_i) for i=1 to N
//
// 9. Dwell Time Estimation (over a UI element, requires element tracking):
// D_dwell_avg = (1/M) * sum(D_element_j) for j=1 to M elements
// This requires `MouseEventData.targetId` and `MouseEventData.hoverDuration`.
//
// 10. Mouse Activity Ratio:
// MAR = (Number of mousemove events) / (Window Duration in ms)
`;

/**
 * Exported Constant for Keyboard Dynamics Equations.
 * Equation 11-20: Keyboard Typing and Error Dynamics.
 */
export const KEYBOARD_DYNAMICS_EQUATIONS = `
// 11. Typing Speed (Words Per Minute):
// WPM = (Total characters / 5) / (Window Duration in minutes)
//
// 12. Keystroke Latency (Time between keydowns):
// KL_avg = (1 / (N-1)) * sum(t_i - t_{i-1}) for i=1 to N (non-modifier keys)
//
// 13. Backspace Frequency:
// BF = (Number of backspace keydowns) / (Window Duration in seconds)
//
// 14. Error Correction Rate:
// ECR = (Number of backspace keydowns) / (Number of non-modifier keydowns)
//
// 15. Typing Burst Rate:
// TBR = (Number of typing bursts) / (Window Duration in seconds)
// A burst is a sequence of keydowns with inter-key latency < 200ms.
//
// 16. Modifier Key Usage Ratio:
// MKUR = (Number of modifier keydowns) / (Total keydowns)
//
// 17. Pause Before Typing (Post-idle):
// PBT_avg = (1/K) * sum(Idle_Time_Before_First_Key_k)
//
// 18. Typing Rhythm Irregularity (Standard Deviation of Keystroke Latencies):
// TRI = stddev(t_i - t_{i-1}) for non-modifier keys
//
// 19. Repeated Keystroke Frequency (e.g., holding a key):
// RKF = (Number of keydown events with 'repeat' flag) / (Window Duration in seconds)
//
// 20. Character Delete Ratio (using backspace or delete key):
// CDR = (Number of delete-like keydowns) / (Total non-modifier keydowns)
`;

/**
 * Exported Constant for Gaze Tracking Equations (Mock).
 * Equation 21-30: Gaze Dynamics and Biometric Indicators.
 */
export const GAZE_TRACKING_EQUATIONS = `
// 21. Gaze Fixation Count:
// Fixations = Count of stable gaze points within a defined radius (e.g., 50px) for > 100ms
//
// 22. Fixation Frequency:
// FF = Fixations / (Window Duration in seconds)
//
// 23. Saccade Velocity:
// SV_i = distance(Gaze_i, Gaze_{i-1}) / (t_i - t_{i-1}) during saccade (non-fixation)
// SV_avg = (1/N) * sum(SV_i)
//
// 24. Average Pupil Dilation:
// PD_avg = (1/N) * sum(Pupil_Dilation_i)
//
// 25. Gaze Deviation from Target:
// GD_avg = (1/M) * sum(Euclidean_Distance(Gaze_point, Target_Center)) for M gaze points on target.
//
// 26. Gaze Path Length:
// GPL = sum(Euclidean_Distance(Gaze_i, Gaze_{i-1}))
//
// 27. Scan Path Area:
// SPA = Area of convex hull of gaze points within a window (requires computational geometry).
//
// 28. Gaze Entropy (mock):
// Ge = -sum(P_i * log(P_i)) where P_i is probability of gaze in region i.
//
// 29. Blink Rate:
// BR = Number of blinks / (Window Duration in seconds) (requires external blink detection)
//
// 30. Gaze Stability Index:
// GSI = 1 / (stddev(gaze_x) + stddev(gaze_y))
`;

/**
 * Exported Constant for Scroll Dynamics Equations.
 * Equation 31-40: Scroll Behavior Analytics.
 */
export const SCROLL_DYNAMICS_EQUATIONS = `
// 31. Scroll Velocity (Vertical):
// SV_v = abs(ScrollY_i - ScrollY_{i-1}) / (t_i - t_{i-1})
// SV_avg = (1/N) * sum(SV_v_i)
//
// 32. Scroll Acceleration:
// SA_i = (SV_v_i - SV_v_{i-1}) / (t_i - t_{i-1})
// SA_avg = (1/N) * sum(SA_i)
//
// 33. Scroll Jerk (Rate of change of acceleration):
// SJ_i = (SA_i - SA_{i-1}) / (t_i - t_{i-1})
// SJ_avg = (1/N) * sum(SJ_i)
//
// 34. Scroll Direction Changes:
// SDC = Count of (direction_i != direction_{i-1})
//
// 35. Scroll Pause Frequency:
// SPF = Number of pauses (deltaY=0 for > threshold) / (Window Duration in seconds)
//
// 36. Scroll Depth Ratio:
// SDR = (Max ScrollY reached) / (Document Height - Viewport Height)
//
// 37. Scroll Coverage Ratio:
// SCR = (Unique scrolled pixels range) / (Document Height - Viewport Height)
//
// 38. Page Scroll Rate (Time to scroll full page):
// PSR = (Document Height - Viewport Height) / SV_avg (if continuously scrolling)
//
// 39. Scroll Event Density:
// SED = Number of scroll events / (Window Duration in seconds)
//
// 40. Bidirectional Scroll Index:
// BSI = (Number of up scrolls > threshold) / (Number of total scrolls > threshold)
`;

/**
 * Exported Constant for Interaction Error Metrics Equations.
 * Equation 41-50: Error Quantification and Severity.
 */
export const INTERACTION_ERROR_EQUATIONS = `
// 41. Form Validation Error Rate:
// FVER = (Number of form validation errors) / (Number of form input events)
//
// 42. Repeated Action Attempt Frequency:
// RAAF = (Number of repeated action attempts) / (Window Duration in seconds)
//
// 43. Navigation Error Ratio:
// NER = (Number of navigation errors) / (Number of click events on navigation elements)
//
// 44. API Error Impact Score (mock):
// API_EIS = sum(Severity_of_API_error * Weight_for_API_error)
//
// 45. Client Runtime Error Frequency:
// CREF = (Number of clientRuntime errors) / (Window Duration in seconds)
//
// 46. Error Burst Index:
// EBI = Number of error clusters (multiple errors within short time)
//
// 47. Time to Error Resolution:
// TTER_avg = (1/N) * sum(Time_between_error_occurrence_and_next_successful_action_on_same_element)
//
// 48. Severity Weighted Error Score:
// SWES = sum(Error_Severity_Value_i) / Max_Possible_Severity_Score_in_Window
//
// 49. Cognitive Friction Index (proxy using errors):
// CFI = (FVER * W_form + RAAF * W_repeat + NER * W_nav + CREF * W_client)
// W are weights for each error type.
//
// 50. Error-related Interaction Delta:
// EID = (Post-error event density) - (Pre-error event density)
`;

/**
 * Exported Constant for Task Context and Engagement Equations.
 * Equation 51-60: Task Dynamics and User Engagement.
 */
export const TASK_ENGAGEMENT_EQUATIONS = `
// 51. Task Complexity Score (normalized):
// TCS = f(Task_Complexity_enum) (e.g., low=0.2, medium=0.5, high=0.7, critical=0.9)
//
// 52. Time in Current Task:
// TCT = Current_Timestamp - Task_Start_Timestamp
//
// 53. Task Switch Frequency:
// TSF = Number of task changes / (Window Duration in seconds)
//
// 54. Task Progress Pace:
// TPP = (Current Progress Percentage) / TCT (normalized)
//
// 55. Active Interaction Ratio:
// AIR = (Sum of active interaction times) / (Window Duration)
// Active interaction time = time mouse/keyboard events occurred.
//
// 56. Idle Duration Frequency:
// IDF = Number of idle periods (> 2 sec without interaction) / (Window Duration in seconds)
//
// 57. Frustration Index Proxy:
// FIP = (Click_Frequency_High_Threshold) + (Backspace_Frequency_High_Threshold) + (Target_Acquisition_Error_High_Threshold)
//
// 58. User Retention Score (mock):
// URS = 1 - (Number of task abandonments) / (Number of task starts)
//
// 59. Task Completion Rate:
// TCR = (Number of tasks completed) / (Number of tasks started)
//
// 60. Cognitive Demand Fluctuation Index:
// CDFI = stddev(Cognitive_Load_History_Window)
`;

/**
 * Exported Constant for General Statistical and Utility Equations.
 * Equation 61-100: General Math, Normalization, and Predictive Model Components.
 */
export const GENERAL_MATH_AND_MODEL_EQUATIONS = `
// 61. Mean (Average):
// μ = (1/N) * sum(x_i)
//
// 62. Variance:
// σ^2 = (1/N) * sum((x_i - μ)^2)
//
// 63. Standard Deviation:
// σ = sqrt(σ^2)
//
// 64. Min-Max Normalization:
// x_normalized = (x - min(x)) / (max(x) - min(x))
//
// 65. Z-Score Normalization:
// x_normalized = (x - μ) / σ
//
// 66. Exponential Moving Average (EMA):
// EMA_t = α * x_t + (1 - α) * EMA_{t-1}
// Where α = 2 / (N + 1) for N-period EMA
//
// 67. Weighted Average:
// WA = sum(w_i * x_i) / sum(w_i)
//
// 68. Sigmoid Activation Function (for feature scaling):
// σ(x) = 1 / (1 + e^(-x))
//
// 69. Hyperbolic Tangent (tanh) Activation Function:
// tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
//
// 70. Euclidean Distance:
// d = sqrt((x2 - x1)^2 + (y2 - y1)^2)
//
// 71. Manhattan Distance:
// d = abs(x2 - x1) + abs(y2 - y1)
//
// 72. Cosine Similarity:
// cos(θ) = (A · B) / (||A|| ||B||)
//
// 73. Bayesian Probability (simplified for event P(A|B)):
// P(A|B) = P(B|A) * P(A) / P(B)
//
// 74. Fuzzy Membership Function (Triangular):
// μ(x) = (x - a) / (b - a)  if a <= x <= b
// μ(x) = (c - x) / (c - b)  if b <= x <= c
// μ(x) = 0 otherwise (a < b < c)
//
// 75. Fuzzy Membership Function (Trapezoidal):
// Similar to triangular, but with a flat top for a range.
//
// 76. Kalman Filter (simplified state prediction):
// x_k = F_k * x_{k-1} + B_k * u_k
// P_k = F_k * P_{k-1} * F_k^T + Q_k
// (Where x is state vector, P is covariance matrix, F is state transition, B is control input model, Q is process noise)
//
// 77. Load Threshold Adaptation (Simple Exponential Decay):
// Threshold_next = Threshold_current * e^(-k * time_since_last_adaptation)
//
// 78. Hysteresis Threshold Logic:
// If CL > Upper_Threshold and Mode = Low, then switch to High.
// If CL < Lower_Threshold and Mode = High, then switch to Low.
// Upper_Threshold > Lower_Threshold to prevent rapid switching.
//
// 79. Cumulative Sum (CUSUM) for change detection:
// C_t^+ = max(0, C_{t-1}^+ + x_t - μ_0 - K)
// C_t^- = min(0, C_{t-1}^- + x_t - μ_0 + K)
//
// 80. Logistic Regression Probability:
// P(Y=1|X) = 1 / (1 + e^(-(β0 + β1X1 + ... + βnXn)))
//
// 81. Entropy (Information Theory - simplified for a distribution):
// H(X) = - sum(p(x) log2 p(x))
//
// 82. Gini Impurity (for decision trees):
// G = 1 - sum(p_i^2)
//
// 83. Root Mean Square Error (RMSE):
// RMSE = sqrt((1/N) * sum((y_pred_i - y_true_i)^2))
//
// 84. R-squared (Coefficient of Determination):
// R^2 = 1 - (SS_res / SS_tot)
//
// 85. Mahalanobis Distance (for anomaly detection):
// D_M(x) = sqrt((x - μ)^T Σ^(-1) (x - μ))
//
// 86. Feature Importance Score (e.g., from a tree model):
// FIS_j = sum (gain from splits on feature j)
//
// 87. Inverse Distance Weighting:
// f(x) = sum(w_i * f_i) / sum(w_i) where w_i = 1 / d(x, x_i)^p
//
// 88. Moving Average Convergence Divergence (MACD) - time series analysis:
// MACD = EMA_short - EMA_long
// Signal Line = EMA_of_MACD
//
// 89. Spectral Centroid (feature of a time series frequency distribution):
// SC = sum(f_k * Magnitude_k) / sum(Magnitude_k)
//
// 90. Autocorrelation Function (ACF) - identifies repeating patterns:
// R(k) = E[(X_t - μ)(X_{t+k} - μ)] / σ^2
//
// 91. Perceived Difficulty Score (PDS) - A heuristic:
// PDS = (Error_Rate * W_error) + (Task_Complexity_Factor * W_task) + (Time_in_Task_Deviation * W_time)
//
// 92. Resource Demand Index (RDI) - based on interaction density:
// RDI = (Event_Density * W_event) + (Avg_Kinematic_Energy * W_energy)
//
// 93. Adaptive Weight Update (Gradient Descent principle for a single weight):
// w_new = w_old - η * dL/dw
//
// 94. Cognitive Dissonance Metric (CDM) - mock:
// CDM = (Observed_Load - Expected_Load)^2
//
// 95. Bayesian Information Criterion (BIC) for model selection:
// BIC = n * log(MSE) + k * log(n)
//
// 96. Akaike Information Criterion (AIC) for model selection:
// AIC = n * log(MSE) + 2k
//
// 97. Cross-Entropy Loss (for classification tasks):
// L = - sum(y_i * log(p_i) + (1 - y_i) * log(1 - p_i))
//
// 98. L1 Regularization (Lasso):
// Cost = Sum_of_Squares_Error + λ * sum(abs(β_j))
//
// 99. L2 Regularization (Ridge):
// Cost = Sum_of_Squares_Error + λ * sum(β_j^2)
//
// 100. Learning Rate Schedule (e.g., exponential decay):
// η_t = η_0 * e^(-k * t)
`;


// --- Core Telemetry Agent ---
export class TelemetryAgent {
  private eventBuffer: RawTelemetryEvent[] = [];
  private bufferInterval: ReturnType<typeof setInterval> | null = null;
  private readonly bufferFlushRateMs: number = 200; // Flush data every 200ms
  private readonly featureProcessingCallback: (features: TelemetryFeatureVector) => void;
  private lastMouseCoord: { x: number; y: number; timestamp: number } | null = null;
  private lastScrollEvent: ScrollEventData | null = null;
  private clickTimestamps: number[] = [];
  private keydownTimestamps: { key: string; timestamp: number; isModifier: boolean }[] = [];
  private formFieldFocusDurations: Map<string, { startTime: number; totalDuration: number; interactions: number }> = new Map();
  private lastErrorCount: number = 0; // for error feature comparison

  private focusTimestamps: Map<string, number> = new Map(); // targetId -> focus timestamp
  private blurEventTimestamps: Map<string, number> = new Map(); // targetId -> blur timestamp

  private interactionErrorLogger = InteractionErrorLogger.getInstance();
  private taskContextManager = TaskContextManager.getInstance();

  private mouseMovementsHistory: { x: number; y: number; timestamp: number }[] = [];
  private readonly mouseHistoryWindowMs = 1000; // Keep 1 second of mouse history for advanced features

  constructor(featureProcessingCallback: (features: TelemetryFeatureVector) => void) {
    this.featureProcessingCallback = featureProcessingCallback;
    this.initListeners();
  }

  /**
   * Claim 3: Comprehensive Telemetry for Behavioral Insight.
   * "The TelemetryAgent captures a broad spectrum of raw user interaction events, providing a foundational data layer that is critical for deriving high-fidelity behavioral features. This comprehensive capture ensures that subtle cues of cognitive state are not missed."
   */
  private initListeners(): void {
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
    // window.addEventListener('gaze', this.handleGazeEvent, { passive: true }); // Mock Gaze, would need specialized hardware/lib

    this.bufferInterval = setInterval(this.flushBuffer, this.bufferFlushRateMs);
  }

  private addEvent = (event: RawTelemetryEvent): void => {
    this.eventBuffer.push(event);
  };

  private handleMouseMoveEvent = (event: MouseEvent): void => {
    const timestamp = performance.now();
    const data: MouseEventData = {
      x: event.clientX,
      y: event.clientY,
      button: event.button,
      targetId: (event.target as HTMLElement)?.id || '',
      timestamp,
      pressure: 0.5, // Mock pressure data
    };
    this.addEvent({ type: 'mousemove', data });

    this.mouseMovementsHistory.push({ x: event.clientX, y: event.clientY, timestamp });
    // Keep history window limited
    while (this.mouseMovementsHistory.length > 0 && this.mouseMovementsHistory[0].timestamp < timestamp - this.mouseHistoryWindowMs) {
      this.mouseMovementsHistory.shift();
    }
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
      pressure: 1.0, // Mock click pressure
    };
    this.addEvent({ type: 'click', data });
    this.clickTimestamps.push(timestamp);
  };

  private handleScrollEvent = (event: Event): void => {
    const timestamp = performance.now();
    const scrollDeltaY = this.lastScrollEvent ? window.scrollY - this.lastScrollEvent.scrollY : 0;
    const timeDelta = this.lastScrollEvent ? timestamp - this.lastScrollEvent.timestamp : 0;
    const scrollVelocity = timeDelta > 0 ? Math.abs(scrollDeltaY) / timeDelta : 0;

    const data: ScrollEventData = {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      timestamp,
      scrollDeltaY,
      scrollVelocity,
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
    };
    this.addEvent({ type: 'scroll', data });
    this.lastScrollEvent = data;
  };

  private handleKeyboardEvent = (event: KeyboardEvent): void => {
    const timestamp = performance.now();
    const isModifier = event.ctrlKey || event.shiftKey || event.altKey || event.metaKey;
    const data: KeyboardEventData = {
      key: event.key,
      code: event.code,
      timestamp,
      isModifier,
      repeat: event.repeat,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    };

    this.addEvent({ type: event.type === 'keydown' ? 'keydown' : 'keyup', data });
    if (event.type === 'keydown') {
      this.keydownTimestamps.push({ key: event.key, timestamp, isModifier });
    }
  };

  private handleFocusBlurEvent = (event: FocusEvent): void => {
    const timestamp = performance.now();
    const targetId = (event.target as HTMLElement)?.id;
    if (!targetId) return;

    if (event.type === 'focusin') {
      this.focusTimestamps.set(targetId, timestamp);
      // For form fields, track interaction duration
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) {
        this.formFieldFocusDurations.set(targetId, {
          startTime: timestamp,
          totalDuration: 0,
          interactions: 0
        });
      }
    } else { // focusout
      const focusStartTime = this.focusTimestamps.get(targetId);
      let durationMs: number | undefined = undefined;
      if (focusStartTime) {
        durationMs = timestamp - focusStartTime;
        this.focusTimestamps.delete(targetId);
      }
      this.blurEventTimestamps.set(targetId, timestamp); // Record blur for potential re-focus latency

      // For form fields, update total duration
      const formStats = this.formFieldFocusDurations.get(targetId);
      if (formStats) {
        formStats.totalDuration += (timestamp - formStats.startTime);
        this.formFieldFocusDurations.set(targetId, { ...formStats, startTime: timestamp }); // Update start time if re-focused later
      }

      this.addEvent({
        type: 'blur',
        data: {
          type: 'blur',
          targetId: targetId,
          timestamp,
          durationMs,
          interactionCount: formStats?.interactions, // Capture interactions for focused form field
        },
      });
    }

    this.addEvent({
      type: event.type === 'focusin' ? 'focus' : 'blur',
      data: {
        type: event.type === 'focusin' ? 'focus' : 'blur',
        targetId: targetId || '',
        timestamp,
        durationMs: event.type === 'focusin' ? undefined : timestamp - (this.focusTimestamps.get(targetId) || timestamp),
      },
    });
  };

  private handleFormEvent = (event: Event): void => {
    const timestamp = performance.now();
    const targetElement = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLFormElement;
    const type = event.type === 'submit' ? 'submit' : event.type === 'input' ? 'input' : event.type === 'change' ? 'change' : 'validation_attempt'; // Assuming other form events map

    const targetId = targetElement?.id || targetElement?.name || '';
    if (targetId) {
      const formStats = this.formFieldFocusDurations.get(targetId);
      if (formStats) {
        formStats.interactions++; // Increment interaction count
        this.formFieldFocusDurations.set(targetId, formStats);
      }
    }

    let isValid: boolean | undefined = undefined;
    let validationMessage: string | undefined = undefined;
    if ('checkValidity' in targetElement && typeof targetElement.checkValidity === 'function') {
      isValid = targetElement.checkValidity();
      validationMessage = targetElement.validationMessage;
      if (!isValid && (type === 'change' || type === 'submit')) {
        this.interactionErrorLogger.logError({
          type: 'validation',
          elementId: targetId,
          message: `Form field validation failed: ${validationMessage}`,
          severity: 'medium',
          errorCode: 'FORM_VALIDATION_ERROR',
          contextPath: window.location.pathname,
        });
      }
    }

    this.addEvent({
      type: 'form',
      data: {
        type: type,
        targetId: targetId,
        value: 'value' in targetElement ? String(targetElement.value) : undefined,
        timestamp,
        isValid,
        validationMessage,
      },
    });
  };

  // Mock Gaze Event Handler
  // private handleGazeEvent = (event: CustomEvent<{ x: number; y: number; pupilDilation: number; gazeStability: number }>): void => {
  //   const timestamp = performance.now();
  //   const { x, y, pupilDilation, gazeStability } = event.detail;
  //   // Determine targetElementId based on x, y coordinates
  //   const targetElement = document.elementFromPoint(x, y);
  //   this.addEvent({
  //     type: 'gaze',
  //     data: {
  //       x, y, timestamp,
  //       targetElementId: targetElement?.id || '',
  //       pupilDilation,
  //       gazeStability,
  //     }
  //   });
  // };

  private calculateMouseSmoothnessIndex(mouseMoveEvents: MouseEventData[]): number {
    if (mouseMoveEvents.length < 3) return 0;
    let totalAbsAcceleration = 0;
    let totalVelocity = 0;
    let prevVelocity = 0;

    for (let i = 1; i < mouseMoveEvents.length; i++) {
      const p1 = mouseMoveEvents[i - 1];
      const p2 = mouseMoveEvents[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const timeDelta = p2.timestamp - p1.timestamp;

      if (timeDelta > 0) {
        const velocity = distance / timeDelta;
        totalVelocity += velocity;
        const acceleration = (velocity - prevVelocity) / timeDelta;
        totalAbsAcceleration += Math.abs(acceleration);
        prevVelocity = velocity;
      }
    }

    // Simplified MSI: Inverse of average absolute acceleration, normalized
    // Eq. 7: Mouse Smoothness Index (MSI - simplified proxy)
    // MSI = 1 - (sum(abs(A_i))) / (sum(V_i) * Max_Accel_Scale)
    const avgAbsAcceleration = totalAbsAcceleration / (mouseMoveEvents.length - 2);
    const maxExpectedAcceleration = 2.0; // A heuristic max px/ms^2
    const smoothness = 1 - Math.min(1, avgAbsAcceleration / maxExpectedAcceleration); // Clamped between 0 and 1
    return smoothness;
  }

  private calculateMouseAcceleration(prevV: number, currentV: number, timeDelta: number): number {
    // Eq. 3: Instantaneous Acceleration
    return timeDelta > 0 ? (currentV - prevV) / timeDelta : 0;
  }

  private calculateMousePathTortuosity(events: MouseEventData[]): number {
    // Eq. 5: Path Tortuosity
    if (events.length < 2) return 0;
    let totalDistance = 0;
    for (let i = 1; i < events.length; i++) {
      const p1 = events[i - 1];
      const p2 = events[i];
      totalDistance += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)); // Eq. 1: Segment Length
    }
    const start = events[0];
    const end = events[events.length - 1];
    const straightLineDistance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)); // Eq. 70: Euclidean Distance

    return straightLineDistance > 0 ? totalDistance / straightLineDistance : 0; // Ratio > 1 indicates tortuosity
  }

  private calculateTargetAcquisitionError(clicks: MouseEventData[]): number {
    // Eq. 25: Gaze Deviation from Target (conceptually similar for clicks)
    let totalError = 0;
    let validClicks = 0;
    for (const click of clicks) {
      if (click.targetBoundingRect) {
        const rect = click.targetBoundingRect;
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const error = Math.sqrt(Math.pow(click.x - centerX, 2) + Math.pow(click.y - centerY, 2)); // Eq. 70: Euclidean Distance
        totalError += error;
        validClicks++;
      }
    }
    return validClicks > 0 ? totalError / validClicks : 0;
  }

  private calculateFittsLawIP(clicks: MouseEventData[]): number {
    // Eq. 6: Fitts's Law Index of Performance (simplified)
    if (clicks.length < 2) return 0;
    let totalIP = 0;
    let validIPs = 0;

    for (let i = 1; i < clicks.length; i++) {
      const prevClick = clicks[i - 1];
      const currentClick = clicks[i];

      if (prevClick.targetBoundingRect && currentClick.targetBoundingRect) {
        const prevRect = prevClick.targetBoundingRect;
        const currentRect = currentClick.targetBoundingRect;

        // Amplitude (A): Distance between centers of previous target and current target
        const A = Math.sqrt(
          Math.pow((currentRect.x + currentRect.width / 2) - (prevRect.x + prevRect.width / 2), 2) +
          Math.pow((currentRect.y + currentRect.height / 2) - (prevRect.y + prevRect.height / 2), 2)
        );

        // Width (W): Width of the target being acquired (current target)
        const W = currentRect.width; // Using width, could be min(width, height)

        // Movement Time (MT): Time between the two clicks
        const MT = currentClick.timestamp - prevClick.timestamp;

        if (A > 0 && W > 0 && MT > 0) {
          const IP = Math.log2(2 * A / W) / (MT / 1000); // Convert MT to seconds for common IP units
          if (!isNaN(IP) && isFinite(IP)) {
            totalIP += IP;
            validIPs++;
          }
        }
      }
    }
    return validIPs > 0 ? totalIP / validIPs : 0;
  }

  private extractFeatures = (events: RawTelemetryEvent[], currentUiMode: UiMode): TelemetryFeatureVector => {
    const windowEnd = performance.now();
    const windowStart = windowEnd - this.bufferFlushRateMs;
    const durationSeconds = this.bufferFlushRateMs / 1000;

    let mouseMoveEvents: MouseEventData[] = [];
    let clickEvents: MouseEventData[] = [];
    let scrollEvents: ScrollEventData[] = [];
    let keydownEvents: KeyboardEventData[] = [];
    let keyupEvents: KeyboardEventData[] = [];
    let focusEvents: FocusBlurEventData[] = [];
    let blurEvents: FocusBlurEventData[] = [];
    let formEvents: FormEventData[] = [];
    let gazeEvents: GazeEventData[] = [];

    // Filter events for the current window and categorize
    for (const event of events) {
      if (event.data.timestamp < windowStart) continue;

      switch (event.type) {
        case 'mousemove': mouseMoveEvents.push(event.data); break;
        case 'click': clickEvents.push(event.data); break;
        case 'scroll': scrollEvents.push(event.data); break;
        case 'keydown': keydownEvents.push(event.data); break;
        case 'keyup': keyupEvents.push(event.data); break;
        case 'focus': focusEvents.push(event.data); break;
        case 'blur': blurEvents.push(event.data); break;
        case 'form': formEvents.push(event.data); break;
        case 'gaze': gazeEvents.push(event.data); break;
      }
    }

    // --- Mouse Kinematics ---
    let totalMouseVelocity = 0;
    let totalMouseAcceleration = 0;
    let prevMouseVelocity = 0;
    let totalMouseTravelDistance = 0;
    let totalClickPressure = 0;
    if (mouseMoveEvents.length > 1) {
      for (let i = 1; i < mouseMoveEvents.length; i++) {
        const p1 = mouseMoveEvents[i - 1];
        const p2 = mouseMoveEvents[i];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        totalMouseTravelDistance += distance; // Eq. 8: Total Mouse Travel Distance
        const timeDelta = p2.timestamp - p1.timestamp;
        if (timeDelta > 0) {
          const velocity = distance / timeDelta; // px/ms (Eq. 1: Instantaneous Velocity)
          totalMouseVelocity += velocity;
          totalMouseAcceleration += this.calculateMouseAcceleration(prevMouseVelocity, velocity, timeDelta); // Eq. 3: Instantaneous Acceleration
          prevMouseVelocity = velocity;
        }
      }
    }
    if (clickEvents.length > 0) {
      totalClickPressure = clickEvents.reduce((sum, c) => sum + (c.pressure || 0), 0);
    }

    // --- Click Dynamics ---
    let totalClickLatency = 0;
    let doubleClickCount = 0;
    let errorClickCount = 0; // Clicks associated with an immediate error
    if (clickEvents.length > 1) {
      for (let i = 1; i < clickEvents.length; i++) {
        const latency = clickEvents[i].timestamp - clickEvents[i - 1].timestamp;
        totalClickLatency += latency; // Eq. 12: Keystroke Latency (applied to clicks)
        if (latency < 500) { // arbitrary threshold for potential double click
          doubleClickCount++;
        }
        // Check for immediate errors after click
        const errorsAfterClick = this.interactionErrorLogger.errorsBuffer.filter(e =>
          e.timestamp > clickEvents[i].timestamp && e.timestamp < clickEvents[i].timestamp + 200 // within 200ms after click
        );
        if (errorsAfterClick.length > 0) errorClickCount++;
      }
    }

    // --- Scroll Dynamics ---
    let totalScrollYDelta = 0;
    let scrollDirectionChanges = 0;
    let lastScrollDirection: 'up' | 'down' | null = null;
    let scrollPauseCount = 0;
    let totalScrollJerk = 0;
    let prevScrollVelocity = 0;
    let prevScrollAcceleration = 0;
    let minScrollY = Number.MAX_VALUE;
    let maxScrollY = Number.MIN_VALUE;

    if (scrollEvents.length > 1) {
      for (let i = 1; i < scrollEvents.length; i++) {
        const s1 = scrollEvents[i - 1];
        const s2 = scrollEvents[i];
        const deltaY = s2.scrollY - s1.scrollY;
        const timeDelta = s2.timestamp - s1.timestamp;

        if (Math.abs(deltaY) > 0 && timeDelta > 0) {
          totalScrollYDelta += Math.abs(deltaY);
          minScrollY = Math.min(minScrollY, s2.scrollY);
          maxScrollY = Math.max(maxScrollY, s2.scrollY);

          const currentDirection = deltaY > 0 ? 'down' : 'up';
          if (lastScrollDirection && currentDirection !== lastScrollDirection) {
            scrollDirectionChanges++; // Eq. 34: Scroll Direction Changes
          }
          lastScrollDirection = currentDirection;

          const currentScrollVelocity = Math.abs(deltaY) / timeDelta; // px/ms (Eq. 31: Scroll Velocity)
          const currentScrollAcceleration = (currentScrollVelocity - prevScrollVelocity) / timeDelta; // Eq. 32: Scroll Acceleration
          const currentScrollJerk = (currentScrollAcceleration - prevScrollAcceleration) / timeDelta; // Eq. 33: Scroll Jerk
          totalScrollJerk += Math.abs(currentScrollJerk);

          prevScrollVelocity = currentScrollVelocity;
          prevScrollAcceleration = currentScrollAcceleration;
        } else if (Math.abs(deltaY) === 0 && timeDelta > 200) { // Consider a pause if no movement for > 200ms
          scrollPauseCount++; // Eq. 35: Scroll Pause Frequency
        }
      }
    }

    // --- Keyboard Dynamics ---
    let totalKeystrokeLatency = 0;
    let backspaceCount = 0;
    let wordCount = 0;
    let lastTypedWordTime: number = 0;
    let nonModifierKeydownCount = 0;
    let modifierKeydownCount = 0;
    let typingBursts = 0;
    let lastKeystrokeTime: number | null = null;

    if (keydownEvents.length > 0) {
      for (let i = 0; i < keydownEvents.length; i++) {
        const keyEvent = keydownEvents[i];
        if (keyEvent.isModifier) {
          modifierKeydownCount++;
        } else {
          nonModifierKeydownCount++;
          if (lastKeystrokeTime !== null) {
            totalKeystrokeLatency += (keyEvent.timestamp - lastKeystrokeTime); // Eq. 12: Keystroke Latency
            if (keyEvent.timestamp - lastKeystrokeTime > 200) { // Burst ends
              typingBursts++;
            }
          } else {
            typingBursts++; // First key in a potential burst
          }

          if (keyEvent.key === 'Backspace') {
            backspaceCount++; // Eq. 13: Backspace Frequency
          } else if (keyEvent.key === ' ' && keyEvent.timestamp - lastTypedWordTime > 100) { // Debounce words
            wordCount++; // For WPM
            lastTypedWordTime = keyEvent.timestamp;
          }
          lastKeystrokeTime = keyEvent.timestamp;
        }
      }
    }
    const errorCorrectionRate = nonModifierKeydownCount > 0 ? backspaceCount / nonModifierKeydownCount : 0; // Eq. 14: Error Correction Rate

    // --- Focus Dynamics ---
    let refocusFrequency = 0;
    let elementDwellTimeSum = 0;
    let elementDwellCount = 0;
    let blurRate = 0;

    focusEvents.forEach(f => {
      const blurTime = blurEvents.find(b => b.targetId === f.targetId && b.timestamp > f.timestamp)?.timestamp;
      if (blurTime) {
        elementDwellTimeSum += (blurTime - f.timestamp);
        elementDwellCount++;
      }
      // Consider a refocus if an element gets focus shortly after being blurred
      const lastBlur = this.blurEventTimestamps.get(f.targetId);
      if (lastBlur && f.timestamp - lastBlur < 500) { // Refocus within 500ms
        refocusFrequency++;
      }
    });
    // Blur rate can be proxied by count of blur events / window duration.
    blurRate = blurEvents.length / durationSeconds;


    // --- Form Interaction Features ---
    let totalFormValidationErrors = formEvents.filter(e => e.type === 'form' && e.isValid === false).length;
    let formSubmissionCount = formEvents.filter(e => e.type === 'submit').length;
    let formAbandonmentCount = 0; // Hard to calculate purely from window events, needs form lifecycle tracking
    let totalFormFieldInteractionTime = 0;
    let uniqueFormFieldsInteracted = new Set<string>();

    this.formFieldFocusDurations.forEach((stats, id) => {
      // If a field was still focused when window ended, add current duration
      const currentFocusStartTime = stats.startTime;
      const effectiveDuration = (this.focusTimestamps.has(id) && currentFocusStartTime > windowStart)
        ? stats.totalDuration + (windowEnd - currentFocusStartTime) : stats.totalDuration;
      totalFormFieldInteractionTime += effectiveDuration;
      if (effectiveDuration > 0) uniqueFormFieldsInteracted.add(id);
    });

    // --- Interaction Errors (from IEL) ---
    const errorsInWindow = this.interactionErrorLogger.errorsBuffer.filter(err => err.timestamp >= windowStart);
    let formValidationErrors = errorsInWindow.filter(err => err.type === 'validation').length; // Eq. 41: Form Validation Error Rate (count here)
    let repeatedActionAttempts = errorsInWindow.filter(err => err.type === 'repeatedAction').length; // Eq. 42: Repeated Action Attempt Frequency (count here)
    let navigationErrors = errorsInWindow.filter(err => err.type === 'navigation').length; // Eq. 43: Navigation Error Ratio (count here)
    let apiErrors = errorsInWindow.filter(err => err.type === 'apiError').length;
    let clientRuntimeErrors = errorsInWindow.filter(err => err.type === 'clientRuntime').length;


    // --- Gaze Tracking Features (Mock) ---
    let gazeDeviationAvg = 0;
    let pupilDilationAvg = 0;
    let fixationFrequency = 0;
    let saccadeVelocityAvg = 0;
    if (gazeEvents.length > 0) {
      pupilDilationAvg = gazeEvents.reduce((sum, g) => sum + (g.pupilDilation || 0), 0) / gazeEvents.length; // Eq. 24: Average Pupil Dilation
      // Mock other gaze features
      gazeDeviationAvg = Math.random() * 10;
      fixationFrequency = gazeEvents.length / durationSeconds * 0.5; // Simulate 50% being fixations
      saccadeVelocityAvg = Math.random() * 50;
    }

    // Task Context
    const currentTask = this.taskContextManager.getCurrentTask();
    const taskComplexityMap: { [key in TaskContext['complexity']]: number } = {
      'low': 0.2, 'medium': 0.5, 'high': 0.7, 'critical': 0.9
    };
    const taskContextFeatures: TaskContextFeatures = {
      current_task_complexity: currentTask ? taskComplexityMap[currentTask.complexity] : 0, // Eq. 51: Task Complexity Score
      time_in_current_task_sec: currentTask ? (windowEnd - currentTask.timestamp) / 1000 : 0, // Eq. 52: Time in Current Task
      task_switches_count: this.taskContextManager.getTaskHistory().filter(t => t.timestamp >= windowStart).length, // Eq. 53: Task Switch Frequency
      task_completion_status: currentTask?.progressPercentage === 100 ? 1 : 0,
    };

    // User Engagement Features
    const totalEventCount = events.length;
    const activeInteractionRatio = totalEventCount > 0 ? 1 : 0; // Simplistic: any event means active
    const idleDurationAvg = activeInteractionRatio === 0 ? durationSeconds : 0; // If no events, assume idle
    const frustrationIndexProxy = (formValidationErrors * 0.2 + repeatedActionAttempts * 0.3 + errorClickCount * 0.1); // Eq. 57: Frustration Index Proxy

    const featureVector: TelemetryFeatureVector = {
      timestamp_window_end: windowEnd,
      window_duration_ms: this.bufferFlushRateMs,
      event_density: totalEventCount / durationSeconds,
      task_context: taskContextFeatures,
      engagement: {
        active_interaction_ratio: activeInteractionRatio, // Eq. 55: Active Interaction Ratio
        idle_duration_avg: idleDurationAvg, // Eq. 56: Idle Duration Frequency (simplified)
        frustration_index_proxy: frustrationIndexProxy,
      },
      ui_mode_context: currentUiMode, // Include the UI mode during this feature window
    };

    if (mouseMoveEvents.length > 0) {
      featureVector.mouse = {
        mouse_velocity_avg: mouseMoveEvents.length > 1 ? totalMouseVelocity / (mouseMoveEvents.length - 1) : 0, // Eq. 2: Average Velocity
        mouse_acceleration_avg: mouseMoveEvents.length > 2 ? totalMouseAcceleration / (mouseMoveEvents.length - 2) : 0, // Eq. 4: Average Acceleration
        mouse_path_tortuosity: this.calculateMousePathTortuosity(mouseMoveEvents), // Eq. 5: Path Tortuosity
        mouse_dwell_time_avg: 0, // Requires more complex tracking
        fitts_law_ip_avg: this.calculateFittsLawIP(clickEvents), // Eq. 6: Fitts's Law Index of Performance
        mouse_smoothness_index: this.calculateMouseSmoothnessIndex(mouseMoveEvents), // Eq. 7: Mouse Smoothness Index
        mouse_travel_distance_total: totalMouseTravelDistance, // Eq. 8: Total Mouse Travel Distance
      };
    }

    if (clickEvents.length > 0) {
      featureVector.clicks = {
        click_frequency: clickEvents.length / durationSeconds,
        click_latency_avg: clickEvents.length > 1 ? totalClickLatency / (clickEvents.length - 1) : 0,
        target_acquisition_error_avg: this.calculateTargetAcquisitionError(clickEvents),
        double_click_frequency: doubleClickCount / durationSeconds,
        click_pressure_avg: clickEvents.length > 0 ? totalClickPressure / clickEvents.length : 0,
        error_click_rate: errorClickCount / clickEvents.length,
      };
    }

    if (scrollEvents.length > 0) {
      const scrollRange = maxScrollY - minScrollY;
      const documentScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      featureVector.scroll = {
        scroll_velocity_avg: totalScrollYDelta / durationSeconds, // Eq. 31: Scroll Velocity Avg
        scroll_direction_changes: scrollDirectionChanges, // Eq. 34: Scroll Direction Changes
        scroll_pause_frequency: scrollPauseCount / durationSeconds, // Eq. 35: Scroll Pause Frequency
        scroll_jerk_avg: scrollEvents.length > 2 ? totalScrollJerk / (scrollEvents.length - 2) : 0, // Eq. 33: Scroll Jerk Avg
        scroll_coverage_ratio: documentScrollHeight > 0 ? scrollRange / documentScrollHeight : 0, // Eq. 37: Scroll Coverage Ratio
      };
    }

    if (keydownEvents.length > 0) {
      featureVector.keyboard = {
        typing_speed_wpm: wordCount / (durationSeconds / 60), // Eq. 11: Typing Speed (WPM)
        backspace_frequency: backspaceCount / durationSeconds, // Eq. 13: Backspace Frequency
        keystroke_latency_avg: nonModifierKeydownCount > 1 ? totalKeystrokeLatency / (nonModifierKeydownCount - 1) : 0, // Eq. 12: Keystroke Latency Avg
        error_correction_rate: errorCorrectionRate, // Eq. 14: Error Correction Rate
        typing_burst_rate: typingBursts / durationSeconds, // Eq. 15: Typing Burst Rate
        modifier_key_usage_ratio: totalEventCount > 0 ? modifierKeydownCount / totalEventCount : 0, // Eq. 16: Modifier Key Usage Ratio
      };
    }

    if (focusEvents.length > 0 || blurEvents.length > 0) {
      featureVector.focus = {
        refocus_frequency: refocusFrequency / durationSeconds,
        element_dwell_time_avg: elementDwellCount > 0 ? elementDwellTimeSum / elementDwellCount : 0,
        blur_rate: blurRate,
      };
    }

    if (formEvents.length > 0) {
      featureVector.forms = {
        form_validation_errors_count: totalFormValidationErrors,
        form_submission_rate: formSubmissionCount / durationSeconds,
        form_abandonment_rate: formAbandonmentCount, // More complex calculation
        form_interaction_time_avg: uniqueFormFieldsInteracted.size > 0 ? totalFormFieldInteractionTime / uniqueFormFieldsInteracted.size : 0,
      };
    }

    featureVector.errors = {
      form_validation_errors_count: formValidationErrors, // Eq. 41
      repeated_action_attempts_count: repeatedActionAttempts, // Eq. 42
      navigation_errors_count: navigationErrors, // Eq. 43
      api_errors_count: apiErrors,
      system_ui_errors_count: clientRuntimeErrors,
    };

    if (gazeEvents.length > 0) {
      featureVector.gaze = {
        gaze_deviation_avg: gazeDeviationAvg, // Eq. 25
        pupil_dilation_avg: pupilDilationAvg, // Eq. 24
        fixation_frequency: fixationFrequency, // Eq. 22
        saccade_velocity_avg: saccadeVelocityAvg, // Eq. 23
      };
    }

    return featureVector;
  };

  private flushBuffer = (): void => {
    if (this.eventBuffer.length > 0) {
      // Pass the current UI mode to feature extraction for contextual insights
      const currentUiMode = UserProfileService.getInstance().getPreferences().preferredUiMode; // Or fetch current from provider if available
      const features = this.extractFeatures(this.eventBuffer, currentUiMode);
      this.featureProcessingCallback(features);
      this.eventBuffer = []; // Clear buffer
    }
  };

  public stop(): void {
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
    // window.removeEventListener('gaze', this.handleGazeEvent);
    if (this.bufferInterval) {
      clearInterval(this.bufferInterval);
    }
    this.interactionErrorLogger.stop();
    console.log("TelemetryAgent stopped.");
  }
}

/**
 * Mermaid Diagram 2: Telemetry Data Flow
 * Shows how raw events are captured, buffered, processed into features, and fed to the inference engine.
 */
export const TELEMETRY_DATA_FLOW_MERMAID = `
graph TD
    A[Raw User Events (Mouse, Keyboard, Scroll, Form, Gaze)] --> B{TelemetryAgent Listeners};
    B --> C[Event Buffer];
    C -- Flush (every ${TelemetryAgent['prototype']['bufferFlushRateMs']}ms) --> D[Feature Extraction Algorithm];
    D -- TelemetryFeatureVector --> E[CognitiveLoadEngine];
    E -- Cognitive Load Score --> F[AdaptiveUIProvider];
    F -- UI Mode & Policies --> G[Rendered UI Elements];
    D --> H[InteractionErrorLogger (for error-related features)];
    D --> I[TaskContextManager (for task-related features)];
`;

/**
 * Mermaid Diagram 3: Cognitive Load Prediction Model Architecture (Simplified)
 * High-level view of the mock ML model within the CognitiveLoadEngine.
 */
export const COGNITIVE_LOAD_MODEL_ARCHITECTURE_MERMAID = `
graph LR
    subgraph Feature Engineering
        A[Raw Telemetry Events] --> B[Feature Extraction (TelemetryAgent)];
        B -- TelemetryFeatureVector --> C[Feature Normalization & Transformation];
    end

    subgraph Cognitive Load Prediction
        C -- Weighted Features --> D{Linear Combination / Weighted Sum};
        D -- Sigmoid/Logit --> E[Raw Load Score (0-1)];
        E -- Historical Smoothing (EMA) --> F[Smoothed Cognitive Load];
        F -- Adaptive Thresholds --> G[UI Mode Decision];
    end

    subgraph Feedback & Adaptation
        G -- Selected UI Mode --> H[AdaptationPolicyManager];
        H -- UI Element State --> I[Adaptive UI];
        I --> J[User Interaction];
        J --> A;
        K[User Preferences (UserProfileService)] --> G;
        L[Task Context (TaskContextManager)] --> G;
    end
`;

/**
 * Claim 4: The CognitiveLoadEngine leverages a multi-modal feature vector.
 * "By incorporating diverse features from mouse kinematics, keyboard dynamics, scroll behavior, interaction errors, task context, and even (mock) gaze data, the CognitiveLoadEngine forms a holistic view of user engagement, leading to a more robust and accurate cognitive load prediction."
 */
// --- Cognitive Load Inference Engine ---
export class CognitiveLoadEngine {
  private latestFeatureVector: TelemetryFeatureVector | null = null;
  private loadHistory: number[] = [];
  private readonly historyLength: number = 20; // For smoothing
  private readonly predictionIntervalMs: number = 500;
  private predictionTimer: ReturnType<typeof setInterval> | null = null;
  private onCognitiveLoadUpdate: (load: number) => void;
  private userProfileService = UserProfileService.getInstance();
  private taskContextManager = TaskContextManager.getInstance();

  private modelWeights: { [key: string]: number } = {
    mouse_velocity_avg: 0.05, mouse_acceleration_avg: 0.07, mouse_path_tortuosity: 0.1, mouse_smoothness_index: -0.05, mouse_travel_distance_total: 0.01,
    click_frequency: 0.08, click_latency_avg: 0.1, target_acquisition_error_avg: 0.15, double_click_frequency: 0.05, click_pressure_avg: -0.02, error_click_rate: 0.2,
    scroll_velocity_avg: 0.03, scroll_direction_changes: 0.08, scroll_pause_frequency: 0.04, scroll_jerk_avg: 0.06, scroll_coverage_ratio: -0.01,
    typing_speed_wpm_deviation: 0.07, backspace_frequency: 0.18, keystroke_latency_avg: 0.08, error_correction_rate: 0.15, typing_burst_rate: 0.04, modifier_key_usage_ratio: -0.03,
    refocus_frequency: 0.1, element_dwell_time_avg: -0.05, blur_rate: 0.07,
    form_validation_errors_count: 0.25, form_submission_rate: -0.05, form_abandonment_rate: 0.2, form_interaction_time_avg: -0.03,
    repeated_action_attempts_count: 0.2, navigation_errors_count: 0.15, api_errors_count: 0.3, system_ui_errors_count: 0.35,
    gaze_deviation_avg: 0.12, pupil_dilation_avg: 0.15, fixation_frequency: -0.05, saccade_velocity_avg: 0.08,
    task_complexity: 0.1, time_in_task: 0.02, task_switches_count: 0.09, task_completion_status: -0.05,
    active_interaction_ratio: -0.03, idle_duration_avg: 0.05, frustration_index_proxy: 0.25,
    event_density: 0.05,
    baseline_offset: 0.0
  };

  constructor(onUpdate: (load: number) => void) {
    this.onCognitiveLoadUpdate = onUpdate;
    this.predictionTimer = setInterval(this.inferLoad, this.predictionIntervalMs);
  }

  public processFeatures(featureVector: TelemetryFeatureVector): void {
    this.latestFeatureVector = featureVector;
  }

  // Normalization function (Min-Max scaling for features, Eq. 64)
  private normalizeFeature(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }

  // Sigmoid activation function (Eq. 68)
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // A more sophisticated mock machine learning model for cognitive load prediction
  private mockPredict(features: TelemetryFeatureVector): number {
    const prefs = this.userProfileService.getPreferences();
    let rawScore = prefs.personalizedBaselineCLS + this.modelWeights.baseline_offset; // Eq. 91: Perceived Difficulty Score (PDS) foundation

    // Feature normalization and weighted sum (Eq. 67: Weighted Average, Eq. 80: Logistic Regression Probability principle)
    // Applying min-max normalization where appropriate, and then weighting
    // Many equation references here, as each calculation step is an equation.

    // Mouse Kinematics Features (Eq. 1-8 referenced in TelemetryAgent)
    if (features.mouse) {
      const v_norm = this.normalizeFeature(features.mouse.mouse_velocity_avg, 0, 10); // Eq. 64
      const a_norm = this.normalizeFeature(features.mouse.mouse_acceleration_avg, 0, 1);
      const t_norm = this.normalizeFeature(features.mouse.mouse_path_tortuosity, 1, 5); // Tortuosity starts at 1
      const s_norm = this.normalizeFeature(features.mouse.mouse_smoothness_index, 0, 1);
      const d_norm = this.normalizeFeature(features.mouse.mouse_travel_distance_total, 0, 1000);

      rawScore += v_norm * this.modelWeights.mouse_velocity_avg;
      rawScore += a_norm * this.modelWeights.mouse_acceleration_avg;
      rawScore += t_norm * this.modelWeights.mouse_path_tortuosity;
      rawScore += (1 - s_norm) * this.modelWeights.mouse_smoothness_index; // Smoother is good (negative weight)
      rawScore += d_norm * this.modelWeights.mouse_travel_distance_total;
    }

    // Click Dynamics Features (Eq. from TelemetryAgent)
    if (features.clicks) {
      const cf_norm = this.normalizeFeature(features.clicks.click_frequency, 0, 5);
      const cl_norm = this.normalizeFeature(features.clicks.click_latency_avg, 0, 500);
      const ta_norm = this.normalizeFeature(features.clicks.target_acquisition_error_avg, 0, 50);
      const dc_norm = this.normalizeFeature(features.clicks.double_click_frequency, 0, 2);
      const cp_norm = this.normalizeFeature(features.clicks.click_pressure_avg, 0, 1);
      const ec_norm = this.normalizeFeature(features.clicks.error_click_rate, 0, 1);

      rawScore += cf_norm * this.modelWeights.click_frequency;
      rawScore += cl_norm * this.modelWeights.click_latency_avg;
      rawScore += ta_norm * this.modelWeights.target_acquisition_error_avg;
      rawScore += dc_norm * this.modelWeights.double_click_frequency;
      rawScore += (1 - cp_norm) * this.modelWeights.click_pressure_avg; // Higher pressure -> more stressed (negative weight for current model)
      rawScore += ec_norm * this.modelWeights.error_click_rate;
    }

    // Scroll Dynamics Features (Eq. 31-40)
    if (features.scroll) {
      const sv_norm = this.normalizeFeature(features.scroll.scroll_velocity_avg, 0, 2000);
      const sdc_norm = this.normalizeFeature(features.scroll.scroll_direction_changes, 0, 10);
      const spf_norm = this.normalizeFeature(features.scroll.scroll_pause_frequency, 0, 5);
      const sj_norm = this.normalizeFeature(features.scroll.scroll_jerk_avg, 0, 1);
      const scr_norm = this.normalizeFeature(features.scroll.scroll_coverage_ratio, 0, 1);

      rawScore += sv_norm * this.modelWeights.scroll_velocity_avg;
      rawScore += sdc_norm * this.modelWeights.scroll_direction_changes;
      rawScore += spf_norm * this.modelWeights.scroll_pause_frequency;
      rawScore += sj_norm * this.modelWeights.scroll_jerk_avg;
      rawScore += scr_norm * this.modelWeights.scroll_coverage_ratio; // Scrolling less might indicate issues, or completion (ambiguous feature)
    }

    // Keyboard Dynamics Features (Eq. 11-20)
    if (features.keyboard) {
      const optimalWPM = 60; // Eq. 11: WPM benchmark
      const wpmDeviation = Math.abs(features.keyboard.typing_speed_wpm - optimalWPM) / optimalWPM;
      const wpm_norm = this.normalizeFeature(wpmDeviation, 0, 1);

      const bf_norm = this.normalizeFeature(features.keyboard.backspace_frequency, 0, 2);
      const kl_norm = this.normalizeFeature(features.keyboard.keystroke_latency_avg, 0, 500);
      const erc_norm = this.normalizeFeature(features.keyboard.error_correction_rate, 0, 1);
      const tbr_norm = this.normalizeFeature(features.keyboard.typing_burst_rate, 0, 5);
      const mku_norm = this.normalizeFeature(features.keyboard.modifier_key_usage_ratio, 0, 1);

      rawScore += wpm_norm * this.modelWeights.typing_speed_wpm_deviation;
      rawScore += bf_norm * this.modelWeights.backspace_frequency;
      rawScore += kl_norm * this.modelWeights.keystroke_latency_avg;
      rawScore += erc_norm * this.modelWeights.error_correction_rate;
      rawScore += tbr_norm * this.modelWeights.typing_burst_rate;
      rawScore += (1 - mku_norm) * this.modelWeights.modifier_key_usage_ratio; // High modifier usage might be power user (negative weight)
    }

    // Focus Dynamics Features
    if (features.focus) {
      const rf_norm = this.normalizeFeature(features.focus.refocus_frequency, 0, 5);
      const edt_norm = this.normalizeFeature(features.focus.element_dwell_time_avg, 0, 10000);
      const br_norm = this.normalizeFeature(features.focus.blur_rate, 0, 1);

      rawScore += rf_norm * this.modelWeights.refocus_frequency;
      rawScore += (1 - edt_norm) * this.modelWeights.element_dwell_time_avg; // Longer dwell time means less frequent refocus
      rawScore += br_norm * this.modelWeights.blur_rate;
    }

    // Form Interaction Features
    if (features.forms) {
      const fve_norm = this.normalizeFeature(features.forms.form_validation_errors_count, 0, 5);
      const fsr_norm = this.normalizeFeature(features.forms.form_submission_rate, 0, 1);
      const far_norm = this.normalizeFeature(features.forms.form_abandonment_rate, 0, 1);
      const fit_norm = this.normalizeFeature(features.forms.form_interaction_time_avg, 0, 5000);

      rawScore += fve_norm * this.modelWeights.form_validation_errors_count;
      rawScore += (1 - fsr_norm) * this.modelWeights.form_submission_rate; // Successful submission reduces load
      rawScore += far_norm * this.modelWeights.form_abandonment_rate;
      rawScore += (1 - fit_norm) * this.modelWeights.form_interaction_time_avg; // Slower average interaction might indicate difficulty
    }

    // Error Features (strong indicators of load) (Eq. 41-50)
    if (features.errors) {
      const fve_count_norm = this.normalizeFeature(features.errors.form_validation_errors_count, 0, 3);
      const raa_count_norm = this.normalizeFeature(features.errors.repeated_action_attempts_count, 0, 3);
      const ne_count_norm = this.normalizeFeature(features.errors.navigation_errors_count, 0, 2);
      const api_count_norm = this.normalizeFeature(features.errors.api_errors_count, 0, 1);
      const sui_count_norm = this.normalizeFeature(features.errors.system_ui_errors_count, 0, 1);

      rawScore += fve_count_norm * this.modelWeights.form_validation_errors_count * prefs.sensitivityToErrors;
      rawScore += raa_count_norm * this.modelWeights.repeated_action_attempts_count * prefs.sensitivityToErrors;
      rawScore += ne_count_norm * this.modelWeights.navigation_errors_count * prefs.sensitivityToErrors;
      rawScore += api_count_norm * this.modelWeights.api_errors_count * prefs.sensitivityToErrors;
      rawScore += sui_count_norm * this.modelWeights.system_ui_errors_count * prefs.sensitivityToErrors;
    }

    // Gaze Tracking Features (Eq. 21-30)
    if (features.gaze) {
      const gd_norm = this.normalizeFeature(features.gaze.gaze_deviation_avg, 0, 50);
      const pd_norm = this.normalizeFeature(features.gaze.pupil_dilation_avg, 0, 5); // Assuming some unit for dilation
      const ff_norm = this.normalizeFeature(features.gaze.fixation_frequency, 0, 10);
      const sv_norm = this.normalizeFeature(features.gaze.saccade_velocity_avg, 0, 200);

      rawScore += gd_norm * this.modelWeights.gaze_deviation_avg;
      rawScore += pd_norm * this.modelWeights.pupil_dilation_avg;
      rawScore += (1 - ff_norm) * this.modelWeights.fixation_frequency; // High fixation freq means focused (negative weight)
      rawScore += sv_norm * this.modelWeights.saccade_velocity_avg;
    }

    // Task Context (Eq. 51-54)
    if (features.task_context && features.task_context.current_task_complexity > 0) {
      const tc_norm = features.task_context.current_task_complexity; // Already normalized
      const tt_norm = this.normalizeFeature(features.task_context.time_in_current_task_sec, 0, 600);
      const ts_norm = this.normalizeFeature(features.task_context.task_switches_count, 0, 3);
      const tcs_norm = features.task_context.task_completion_status;

      rawScore += tc_norm * this.modelWeights.task_complexity;
      rawScore += tt_norm * this.modelWeights.time_in_task;
      rawScore += ts_norm * this.modelWeights.task_switches_count;
      rawScore += (1 - tcs_norm) * this.modelWeights.task_completion_status; // Completed task reduces load
    }

    // Engagement Features (Eq. 55-57)
    if (features.engagement) {
      const air_norm = this.normalizeFeature(features.engagement.active_interaction_ratio, 0, 1);
      const id_norm = this.normalizeFeature(features.engagement.idle_duration_avg, 0, 30);
      const fi_norm = this.normalizeFeature(features.engagement.frustration_index_proxy, 0, 10);

      rawScore += (1 - air_norm) * this.modelWeights.active_interaction_ratio; // High interaction ratio indicates engagement, so less load
      rawScore += id_norm * this.modelWeights.idle_duration_avg;
      rawScore += fi_norm * this.modelWeights.frustration_index_proxy;
    }

    const ed_norm = this.normalizeFeature(features.event_density, 0, 100); // Eq. 92: Resource Demand Index (RDI)
    rawScore += ed_norm * this.modelWeights.event_density;

    // Apply Sigmoid to ensure score is within [0, 1] after linear combination. Eq. 68
    let finalLoad = this.sigmoid(rawScore * 2 - 1); // Scale rawScore to roughly -5 to 5 for sigmoid input

    // Adjust based on UI mode context (e.g., if in minimal, load might feel lower)
    // This forms part of the cognitive dissonance metric (Eq. 94)
    if (features.ui_mode_context === 'minimal' || features.ui_mode_context === 'guided') {
      finalLoad *= 0.95; // Small reduction if system is already trying to help
    } else if (features.ui_mode_context === 'crisis') {
      finalLoad *= 1.05; // Crisis mode means high load, so amplify
    }

    return Math.min(1.0, Math.max(0.0, finalLoad));
  }

  private inferLoad = (): void => {
    if (!this.latestFeatureVector) {
      const lastLoad = this.loadHistory.length > 0 ? this.loadHistory[this.loadHistory.length - 1] : this.userProfileService.getPreferences().personalizedBaselineCLS;
      this.onCognitiveLoadUpdate(lastLoad);
      return;
    }

    const rawLoad = this.mockPredict(this.latestFeatureVector);

    // Apply Exponential Moving Average for smoothing (Eq. 66)
    if (this.loadHistory.length === 0) {
      this.loadHistory.push(rawLoad);
    } else {
      const alpha = 2 / (this.historyLength + 1); // Smoothing factor
      const smoothed = this.loadHistory[this.loadHistory.length - 1] * (1 - alpha) + rawLoad * alpha;
      this.loadHistory.push(smoothed);
    }

    if (this.loadHistory.length > this.historyLength) {
      this.loadHistory.shift();
    }
    const currentSmoothedLoad = this.loadHistory[this.loadHistory.length - 1];

    this.onCognitiveLoadUpdate(currentSmoothedLoad);
    this.latestFeatureVector = null; // Clear features processed
  };

  /**
   * Claim 5: Adaptive Model Refinement through Feedback.
   * "The CognitiveLoadEngine is designed for continuous learning, allowing for dynamic updates to its predictive model weights. This facilitates an adaptive feedback loop where user feedback or A/B testing results can iteratively improve the accuracy of cognitive load predictions."
   */
  public updateModelWeights(newWeights: Partial<{ [key: string]: number }>): void {
    // In a real system, this would involve retraining or updating ML model parameters.
    // Eq. 93: Adaptive Weight Update (conceptual basis)
    this.modelWeights = { ...this.modelWeights, ...newWeights };
    console.log('CognitiveLoadEngine: Model weights updated.');
  }

  public stop(): void {
    if (this.predictionTimer) {
      clearInterval(this.predictionTimer);
    }
    console.log("CognitiveLoadEngine stopped.");
  }
}

/**
 * Mermaid Diagram 4: UI Adaptation Decision Flow
 * Outlines how UI mode and element states are determined.
 */
export const UI_ADAPTATION_DECISION_FLOW_MERMAID = `
graph TD
    A[Current Cognitive Load Score] --> B{Compare to Load Thresholds (UserProfileService)};
    C[Current Task Context (TaskContextManager)] --> B;
    D[Current UI Mode] --> B;
    B -- Hysteresis & Sustained Load Logic --> E[New UI Mode];
    E --> F[AdaptationPolicyManager];
    G[UI Element Type] --> F;
    F --> H{Get UI Element State (isVisible, className)};
    H --> I[Rendered UI Component];
`;

/**
 * Claim 6: Context-Aware Adaptation Policies.
 * "The AdaptationPolicyManager ensures that UI changes are not arbitrary but are driven by context-aware rules. It combines general mode-based policies with user-specific preferences and real-time element types to deliver highly targeted and effective interface modifications."
 */
// --- Adaptation Policy Manager ---
// This class defines concrete policies for UI elements based on the current UI mode.
export class AdaptationPolicyManager {
  private static instance: AdaptationPolicyManager;
  private userProfileService = UserProfileService.getInstance();

  private constructor() {}

  public static getInstance(): AdaptationPolicyManager {
    if (!AdaptationPolicyManager.instance) {
      AdaptationPolicyManager.instance = new AdaptationPolicyManager();
    }
    return AdaptationPolicyManager.instance;
  }

  // Define default or A/B testable policies.
  // In a real system, these would be fetched from a configuration service or derived from ML models.
  private getPolicyForMode(mode: UiMode, elementType: UiElementType): 'obscure' | 'deemphasize' | 'reposition' | 'summarize' | 'highlight' | 'segment' | 'none' {
    // User-defined policies take precedence
    const userPolicy = this.userProfileService.getPreferences().adaptationPolicySelection[mode]?.[elementType];
    if (userPolicy) return userPolicy;

    // Default policies based on mode and element type
    switch (mode) {
      case 'standard':
        return 'none'; // All visible, fully interactive
      case 'focus':
        if (elementType === UiElementType.SECONDARY) return 'deemphasize';
        if (elementType === UiElementType.TERTIARY) return 'obscure';
        if (elementType === UiElementType.HINT_CONTEXTUAL) return 'highlight'; // Highlight relevant hints
        return 'none';
      case 'minimal':
        if (elementType === UiElementType.SECONDARY || elementType === UiElementType.TERTIARY || elementType === UiElementType.DYNAMIC_CONTENT) return 'obscure';
        if (elementType === UiElementType.CRITICAL_ACTION) return 'highlight'; // Ensure critical actions are visible
        return 'none'; // Primary and global nav elements still shown
      case 'guided': // New mode
        if (elementType === UiElementType.SECONDARY || elementType === UiElementType.TERTIARY || elementType === UiElementType.DYNAMIC_CONTENT) return 'obscure';
        if (elementType === UiElementType.GUIDED) return 'highlight'; // Guided elements are prominent
        if (elementType === UiElementType.PRIMARY) return 'deemphasize'; // Primary might be deemphasized to focus on guided path
        if (elementType === UiElementType.CRITICAL_ACTION) return 'segment'; // Segment to break down complex actions
        return 'none';
      case 'crisis': // New: Extreme load, only critical actions and emergency info
        if (elementType === UiElementType.CRITICAL_ACTION || elementType === UiElementType.FEEDBACK_NOTIFICATION) return 'highlight';
        if (elementType === UiElementType.PRIMARY || elementType === UiElementType.NAV_GLOBAL) return 'summarize'; // Summarize nav
        return 'obscure'; // Hide almost everything else
      case 'recovery': // New: Transition mode after crisis, gradually restore UI
        if (elementType === UiElementType.CRITICAL_ACTION || elementType === UiElementType.FEEDBACK_NOTIFICATION) return 'none';
        if (elementType === UiElementType.PRIMARY || elementType === UiElementType.NAV_GLOBAL) return 'none';
        if (elementType === UiElementType.SECONDARY) return 'deemphasize'; // Re-introduce secondary elements but deemphasized
        return 'obscure';
      default:
        return 'none';
    }
  }

  public getUiElementState(mode: UiMode, elementType: UiElementType): { isVisible: boolean; className: string; adaptationStrategy: string } {
    const policy = this.getPolicyForMode(mode, elementType);
    let isVisible = true;
    let className = `${elementType}-element`;
    let adaptationStrategy = policy;

    switch (policy) {
      case 'obscure':
        isVisible = false; // Completely hide
        break;
      case 'deemphasize':
        className += ` mode-${mode}-deemphasize`;
        break;
      case 'reposition':
        className += ` mode-${mode}-reposition`; // Placeholder for repositioning logic
        // Repositioning would often require direct DOM manipulation or complex CSS Flex/Grid changes
        break;
      case 'summarize':
        className += ` mode-${mode}-summarize`; // Placeholder for summarization logic (e.g., replace a detailed list with a single link)
        break;
      case 'highlight':
        className += ` mode-${mode}-highlight`;
        break;
      case 'segment':
        className += ` mode-${mode}-segment`; // Break down complex components into smaller steps
        break;
      case 'none':
      default:
        // Default visibility and class name
        break;
    }

    return { isVisible, className, adaptationStrategy };
  }
}


/**
 * Mermaid Diagram 5: Global System Architecture
 * Overview of how all major components interact.
 */
export const GLOBAL_SYSTEM_ARCHITECTURE_MERMAID = `
graph LR
    subgraph User Interaction Layer
        A[User Input (Mouse, Keyboard, Gaze)] --> B[UI Components (AdaptableComponent)];
        B -- Renders UI based on --> C[AdaptiveUIProvider Context];
    end

    subgraph Telemetry & Feature Extraction
        A --> D[TelemetryAgent];
        D -- RawTelemetryEvent Buffer --> E[TelemetryAgent.flushBuffer()];
        E -- TelemetryFeatureVector --> F[CognitiveLoadEngine];
    end

    subgraph Cognitive Load Management
        F -- Cognitive Load Score --> C;
        C -- UI Mode Transitions --> G[AdaptationPolicyManager];
        G -- Adaptation Rules & Styles --> B;
    end

    subgraph Contextual Services
        H[UserProfileService] -- Preferences & Thresholds --> C;
        H --> G;
        I[TaskContextManager] -- Current Task --> C;
        I --> F;
        J[InteractionErrorLogger] -- Errors --> F;
        D --> J;
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px;
    style C fill:#ccf,stroke:#333,stroke-width:2px;
    style F fill:#cfc,stroke:#333,stroke-width:2px;
`;

/**
 * Mermaid Diagram 6: UI Component Lifecycle with Adaptation
 * How individual components interact with the AdaptiveUIProvider.
 */
export const UI_COMPONENT_LIFECYCLE_MERMAID = `
sequenceDiagram
    participant C as AdaptiveUIProvider
    participant H as useCognitiveLoadBalancer
    participant E as AdaptableComponent
    participant EL as UI Element (e.g., div, button)

    E->>H: useUiElement(id, uiType)
    H->>C: registerUiElement(id, uiType)
    C-->>H: Returns isVisible, className, uiMode
    H-->>E: Returns isVisible, className
    E->>EL: Render (or null if not visible) with className

    loop Cognitive Load Changes
        C->>C: CognitiveLoadEngine.onCognitiveLoadUpdate(load)
        C->>C: Recalculate uiMode based on load & thresholds
        C->>H: Notify useCognitiveLoadBalancer consumers (React re-render)
        H->>E: Trigger re-render
        E->>C: isElementVisible(id, uiType), getUiModeClassName(uiType)
        C-->>E: Returns updated isVisible, className
        E->>EL: Re-render with new state/classes
    end

    E->>H: Component Unmount
    H->>C: unregisterUiElement(id)
`;


// --- Adaptive UI Orchestrator (React Context/Hook) ---
interface CognitiveLoadContextType {
  cognitiveLoad: number;
  uiMode: UiMode;
  setUiMode: React.Dispatch<React.SetStateAction<UiMode>>; // Exposed for potential explicit user override or debug
  currentTask: TaskContext | null; // Expose current task
  registerUiElement: (id: string, uiType: UiElementType) => void;
  unregisterUiElement: (id: string) => void;
  isElementVisible: (id: string, uiType: UiElementType) => boolean;
  getUiModeClassName: (uiType: UiElementType) => string;
  getUiElementAdaptationStrategy: (uiType: UiElementType) => string; // New: expose strategy
}

const CognitiveLoadContext = createContext<CognitiveLoadContextType | undefined>(undefined);

// Hook to provide cognitive load and UI mode throughout the application
export const useCognitiveLoadBalancer = (): CognitiveLoadContextType => {
  const context = useContext(CognitiveLoadContext);
  if (context === undefined) {
    throw new Error('useCognitiveLoadBalancer must be used within a CognitiveLoadProvider');
  }
  return context;
};

/**
 * Claim 7: Seamless Integration with React Components.
 * "The `useUiElement` hook provides a declarative and idiomatic React interface for components to become adaptive. By simply specifying an ID and a UI type, components can automatically respond to global cognitive load changes without complex manual state management."
 */
// Hook for individual UI elements to adapt
export const useUiElement = (id: string, uiType: UiElementType) => {
  const { registerUiElement, unregisterUiElement, isElementVisible, getUiModeClassName, getUiElementAdaptationStrategy } = useCognitiveLoadBalancer();

  useEffect(() => {
    registerUiElement(id, uiType);
    return () => {
      unregisterUiElement(id);
    };
  }, [id, uiType, registerUiElement, unregisterUiElement]);

  const isVisible = isElementVisible(id, uiType);
  const className = getUiModeClassName(uiType);
  const adaptationStrategy = getUiElementAdaptationStrategy(uiType);

  return { isVisible, className, adaptationStrategy };
};


/**
 * Mermaid Diagram 7: UI Mode State Transitions
 * Illustrates the state machine for UI mode changes based on cognitive load.
 */
export const UI_MODE_STATE_TRANSITIONS_MERMAID = `
stateDiagram-v2
    [*] --> Standard

    Standard --> Focus : cognitiveLoad > loadThresholds.high
    Focus --> Standard : cognitiveLoad < loadThresholds.low

    Focus --> Guided : cognitiveLoad > loadThresholds.guided AND taskComplexity
    Guided --> Focus : cognitiveLoad < loadThresholds.guidedLow OR NOT taskComplexity

    Focus --> Minimal : cognitiveLoad > loadThresholds.critical
    Standard --> Minimal : cognitiveLoad > loadThresholds.critical
    Minimal --> Focus : cognitiveLoad < loadThresholds.criticalLow

    Minimal --> Crisis : cognitiveLoad > loadThresholds.crisis AND sustainedCriticalLoad
    Crisis --> Recovery : cognitiveLoad < loadThresholds.recovery AND externalIntervention/resolution
    Recovery --> Standard : cognitiveLoad < loadThresholds.low
    Recovery --> Focus : cognitiveLoad < loadThresholds.high
`;

// Provider component for the Cognitive Load Balancing system
export const CognitiveLoadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(0.0);
  const [uiMode, setUiMode] = useState<UiMode>('standard');
  const [currentTask, setCurrentTask] = useState<TaskContext | null>(null);

  const registeredUiElements = useRef(new Map<string, UiElementType>());
  const userProfileService = UserProfileService.getInstance();
  const taskContextManager = TaskContextManager.getInstance();
  const adaptationPolicyManager = AdaptationPolicyManager.getInstance();

  const loadThresholds = userProfileService.getPreferences().cognitiveLoadThresholds;
  const sustainedLoadCounter = useRef(0);
  const sustainedLoadDurationMs = 1500; // Eq. 78: Hysteresis Threshold Logic
  const checkIntervalMs = 500;

  // Initialize Telemetry Agent and Cognitive Load Engine
  useEffect(() => {
    let telemetryAgent: TelemetryAgent | null = null;
    let cognitiveLoadEngine: CognitiveLoadEngine | null = null;

    const featureProcessingCallback = (features: TelemetryFeatureVector) => {
      cognitiveLoadEngine?.processFeatures(features);
    };

    telemetryAgent = new TelemetryAgent(featureProcessingCallback);
    cognitiveLoadEngine = new CognitiveLoadEngine(setCognitiveLoad);

    // Subscribe to task context changes
    const unsubscribeTask = taskContextManager.subscribe(setCurrentTask);

    return () => {
      telemetryAgent?.stop();
      cognitiveLoadEngine?.stop();
      unsubscribeTask();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Effect to manage UI mode transitions based on cognitive load with hysteresis and sustained duration
  useEffect(() => {
    const interval = setInterval(() => {
      const currentMode = uiMode;
      const taskComplexityHigh = currentTask?.complexity === 'critical' || currentTask?.complexity === 'high';
      const taskUrgencyImmediate = currentTask?.urgency === 'immediate';

      let newMode: UiMode = currentMode;
      let shouldTransition = false;

      // Eq. 78: Hysteresis Threshold Logic applied here.
      // Priority: Crisis > Minimal > Guided > Focus > Standard

      // CRISIS mode: Highest priority
      if (cognitiveLoad >= loadThresholds.crisis && currentMode !== 'crisis') {
        newMode = 'crisis';
        shouldTransition = true;
      } else if (cognitiveLoad < loadThresholds.recovery && currentMode === 'crisis') {
        newMode = 'recovery'; // Transition from Crisis to Recovery
        shouldTransition = true;
      } else if (cognitiveLoad >= loadThresholds.critical && currentMode !== 'minimal' && currentMode !== 'crisis') {
        newMode = 'minimal';
        shouldTransition = true;
      } else if (cognitiveLoad < loadThresholds.criticalLow && currentMode === 'minimal') {
        newMode = 'focus'; // From minimal, step down to focus
        shouldTransition = true;
      } else if (cognitiveLoad >= loadThresholds.guided && taskComplexityHigh && prefs.preferenceForGuidance > 0.5 && currentMode !== 'guided' && currentMode !== 'minimal' && currentMode !== 'crisis') {
        // High load AND complex task AND user prefers guidance -> Guided mode
        newMode = 'guided';
        shouldTransition = true;
      } else if (cognitiveLoad < loadThresholds.guidedLow && currentMode === 'guided') {
        // Low load or task no longer complex -> revert from Guided
        newMode = 'focus'; // Typically Guided -> Focus, then Focus -> Standard
        shouldTransition = true;
      } else if (cognitiveLoad >= loadThresholds.high && currentMode === 'standard') {
        newMode = 'focus';
        shouldTransition = true;
      } else if (cognitiveLoad < loadThresholds.low && currentMode === 'focus') {
        newMode = 'standard';
        shouldTransition = true;
      } else if (cognitiveLoad < loadThresholds.recovery && currentMode === 'recovery') {
        // Post-crisis recovery, back to normal load
        newMode = 'standard';
        shouldTransition = true;
      }

      if (shouldTransition && newMode !== currentMode) {
        sustainedLoadCounter.current += checkIntervalMs;
        if (sustainedLoadCounter.current >= sustainedLoadDurationMs) {
          setUiMode(newMode);
          sustainedLoadCounter.current = 0; // Reset after successful transition
          console.log(`UI Mode Transition: ${currentMode} -> ${newMode} (Cognitive Load: ${cognitiveLoad.toFixed(2)})`);
        }
      } else {
        sustainedLoadCounter.current = 0; // Reset counter if conditions change or load is not sustained
      }
    }, checkIntervalMs);

    const prefs = userProfileService.getPreferences(); // Current preferences

    return () => clearInterval(interval);
  }, [cognitiveLoad, uiMode, currentTask, loadThresholds, sustainedLoadDurationMs, userProfileService]);

  const registerUiElement = useCallback((id: string, type: UiElementType) => {
    registeredUiElements.current.set(id, type);
  }, []);

  const unregisterUiElement = useCallback((id: string) => {
    registeredUiElements.current.delete(id);
  }, []);

  const isElementVisible = useCallback((id: string, type: UiElementType): boolean => {
    const { isVisible } = adaptationPolicyManager.getUiElementState(uiMode, type);
    return isVisible;
  }, [uiMode, adaptationPolicyManager]);

  const getUiModeClassName = useCallback((uiType: UiElementType): string => {
    const { className } = adaptationPolicyManager.getUiElementState(uiMode, uiType);
    return className;
  }, [uiMode, adaptationPolicyManager]);

  const getUiElementAdaptationStrategy = useCallback((uiType: UiElementType): string => {
    const { adaptationStrategy } = adaptationPolicyManager.getUiElementState(uiMode, uiType);
    return adaptationStrategy;
  }, [uiMode, adaptationPolicyManager]);

  const contextValue = {
    cognitiveLoad,
    uiMode,
    setUiMode,
    currentTask,
    registerUiElement,
    unregisterUiElement,
    isElementVisible,
    getUiModeClassName,
    getUiElementAdaptationStrategy,
  };

  /**
   * Claim 8: The AdaptiveUIProvider acts as the central orchestration hub.
   * "By encapsulating the core logic for telemetry, cognitive load inference, and UI adaptation, the CognitiveLoadProvider establishes itself as the central orchestration hub, enabling a decoupled yet synchronized adaptive UI system across the entire application."
   */
  return (
    <CognitiveLoadContext.Provider value={contextValue}>
      <div className={`app-container mode-${uiMode}`}>
        {children}
        {/* Global styles for UI modes, dynamically inserted */}
        <style>{`
          .app-container.mode-focus .secondary-element.mode-focus-deemphasize {
            opacity: 0.15;
            pointer-events: none; /* Disable interaction */
            filter: blur(2px) grayscale(80%);
            transition: opacity 0.5s ease-in-out, filter 0.5s ease-in-out;
          }
          .app-container.mode-minimal .secondary-element,
          .app-container.mode-guided .secondary-element {
            opacity: 0;
            pointer-events: none;
            height: 0;
            overflow: hidden;
            margin: 0;
            padding: 0;
            transition: opacity 0.5s ease-in-out, height 0.5s ease-in-out, margin 0.5s ease-in-out, padding 0.5s ease-in-out;
          }
          .app-container.mode-focus .tertiary-element,
          .app-container.mode-minimal .tertiary-element,
          .app-container.mode-guided .tertiary-element {
            display: none; /* Fully hide tertiary elements */
            transition: display 0.5s ease-in-out;
          }
          .app-container.mode-guided .guided-element,
          .app-container.mode-guided .guided-element.mode-guided-highlight {
            border: 2px solid #28a745;
            background-color: #e6ffed;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            box-shadow: 0 0 8px rgba(40, 167, 69, 0.5);
            transition: all 0.3s ease-in-out;
          }
          .app-container.mode-crisis .critical_action-element.mode-crisis-highlight {
            border: 3px solid #dc3545;
            background-color: #fff0f0;
            color: #dc3545;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(220, 53, 69, 0.7);
            animation: pulse-red 1.5s infinite;
            transition: all 0.3s ease-in-out;
          }
          @keyframes pulse-red {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(220, 53, 69, 0.7); }
            50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(220, 53, 69, 0.9); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(220, 53, 69, 0.7); }
          }
          .app-container.mode-crisis .primary-element.mode-crisis-summarize,
          .app-container.mode-crisis .nav_global-element.mode-crisis-summarize {
            font-size: 0.8em;
            padding: 5px;
            height: auto; /* Allow height to adjust */
            min-height: auto;
            overflow: hidden;
            background: #ffebeb;
            border: 1px dashed #dc3545;
            transition: all 0.3s ease-in-out;
            /* Placeholder for actual summarization logic */
          }
          .app-container.mode-recovery .secondary-element.mode-recovery-deemphasize {
            opacity: 0.5;
            pointer-events: auto; /* Re-enable interaction */
            filter: blur(1px) grayscale(50%);
            transition: opacity 1s ease-in-out, filter 1s ease-in-out;
          }
          /* Add more sophisticated styling rules as needed for different modes and element types */
        `}</style>
      </div>
    </CognitiveLoadContext.Provider>
  );
};

// Component that adapts based on the UI mode
export const AdaptableComponent: React.FC<{ id: string; uiType?: UiElementType; children: React.ReactNode }> = ({ id, uiType = UiElementType.PRIMARY, children }) => {
  const { isVisible, className, adaptationStrategy } = useUiElement(id, uiType);

  if (!isVisible) return null;

  // Additional rendering logic based on adaptationStrategy could go here
  if (adaptationStrategy === 'summarize' && uiType === UiElementType.PRIMARY) {
    return <div id={id} className={className} style={{ /* More summarization styling */ }}>Summary of {id}</div>;
  }
  if (adaptationStrategy === 'segment' && uiType === UiElementType.CRITICAL_ACTION) {
    // This would ideally involve breaking down the `children` prop into steps
    return (
      <div id={id} className={className} style={{ border: '1px dashed #007bff', padding: '10px', margin: '10px', borderRadius: '5px' }}>
        <p>Action {id} segmented into smaller steps:</p>
        {children} {/* Children could be an action button, which then becomes part of a step */}
        <button style={{ marginTop: '5px', padding: '5px 10px', background: '#007bff', color: 'white' }}>Next Step</button>
      </div>
    );
  }

  return <div id={id} className={className}>{children}</div>;
};

/**
 * Mermaid Diagram 8: User Feedback Loop
 * How user input, system adaptation, and preferences form a feedback loop.
 */
export const USER_FEEDBACK_LOOP_MERMAID = `
graph LR
    A[User Preferences (UserProfileService)] --> B[AdaptiveUIProvider.setUiMode()];
    B --> C[AdaptationPolicyManager];
    C --> D[Rendered UI (AdaptableComponent)];
    D --> E[User Interaction];
    E --> F[TelemetryAgent (collects data)];
    F --> G[CognitiveLoadEngine (predicts load)];
    G --> B;
    H[User Feedback (Explicit Ratings)] --> A;
    I[A/B Test Results] --> G;
`;

/**
 * Mermaid Diagram 9: Data & Service Interactions
 * Detailed view of data flow between services.
 */
export const DATA_SERVICE_INTERACTIONS_MERMAID = `
graph LR
    subgraph Data Sources
        RAW[Raw User Events]
        EXT[External Task Data]
        USER_PREFS[User Preferences Store]
    end

    subgraph Core Services
        T[TelemetryAgent]
        C[CognitiveLoadEngine]
        A[AdaptationPolicyManager]
        U[UserProfileService]
        TK[TaskContextManager]
        E[InteractionErrorLogger]
    end

    RAW -- captures --> T
    T -- buffers & extracts features --> C
    C -- inferred load --> AdaptiveUIProvider
    AdaptiveUIProvider -- uses --> A
    A -- applies policies --> UI Components

    TK -- sets task context --> C
    TK -- sets task context --> AdaptiveUIProvider
    RAW -- logs errors --> E
    E -- error features --> C

    USER_PREFS -- loads/saves --> U
    U -- provides preferences --> C
    U -- provides preferences --> A
    U -- provides preferences --> AdaptiveUIProvider

    EXT -- updates --> TK
`;

/**
 * Mermaid Diagram 10: Advanced Adaptive UI Features
 * Illustrates potential future extensions and integrations.
 */
export const ADVANCED_ADAPTIVE_FEATURES_MERMAID = `
graph TD
    A[Core Adaptive UI System] --> B[Personalized Learning Paths];
    A --> C[Proactive Information Delivery];
    A --> D[Real-time A/B Testing Infrastructure];
    A --> E[Multi-modal Input Integration (Voice, Gesture)];
    A --> F[Contextual Recommender Systems];
    A --> G[Emotion Detection (from Gaze/Facial Expression)];
    A --> H[Long-term User Behavior Modeling];
    A --> I[Adaptive Micro-Interactions (tooltips, animations)];
    B --> J[Skill Level Adaptation];
    F --> K[Relevant Content/Tools];
    G --> L[Fine-grained Emotional State Adjustment];
    H --> M[Predictive Task Completion];
`;

/**
 * Claim 9: Privacy-Preserving Telemetry.
 * "While collecting extensive telemetry, the system adheres to privacy-by-design principles, emphasizing local processing of sensitive data, anonymization where necessary, and transparent data usage policies to build user trust in adaptive experiences."
 */

/**
 * Claim 10: Enhanced User Control and Transparency.
 * "To foster trust and user acceptance, the Adaptive UI system provides users with granular control over adaptation settings and transparent explanations of how UI changes are made, empowering them to customize their experience and understand the system's rationale."
 */

// Example usage of the provider and adaptable components
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cognitiveLoad, uiMode, currentTask, setUiMode } = useCognitiveLoadBalancer();
  const taskContextManager = TaskContextManager.getInstance();
  const interactionErrorLogger = InteractionErrorLogger.getInstance();
  const userProfileService = UserProfileService.getInstance();

  const handleSetTask = (taskName: string, complexity: TaskContext['complexity'], urgency: TaskContext['urgency'] = 'medium') => {
    taskContextManager.setTask({
      id: taskName.toLowerCase().replace(/\s/g, '-'),
      name: taskName,
      complexity: complexity,
      urgency: urgency,
      timestamp: performance.now(),
    });
  };

  const simulateFormError = () => {
    interactionErrorLogger.logError({
      type: 'validation',
      elementId: 'user-input',
      message: 'Simulated form validation error: Input cannot be empty.',
      severity: 'medium',
      errorCode: 'USR_001',
      contextPath: '/dashboard/main',
    });
    alert('Simulated a form validation error. This should contribute to cognitive load!');
  };

  const simulateApiError = () => {
    interactionErrorLogger.logError({
      type: 'apiError',
      elementId: 'process-transaction-btn',
      message: 'Simulated API error: Transaction failed due to server timeout.',
      severity: 'high',
      errorCode: 'API_504',
      contextPath: '/dashboard/transactions',
    });
    alert('Simulated an API error. This will significantly increase cognitive load!');
  };

  const simulateClientRuntimeError = () => {
    interactionErrorLogger.logError({
      type: 'clientRuntime',
      elementId: 'optional-widget',
      message: 'Simulated client-side UI error: Component failed to render.',
      severity: 'critical',
      errorCode: 'RND_003',
      contextPath: '/dashboard/widgets',
    });
    alert('Simulated a critical client-side error!');
  };

  return (
    <>
      <header style={{ padding: '10px', background: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc' }}>
        <AdaptableComponent id="main-logo" uiType={UiElementType.PRIMARY}>
          <h1>Demo Bank</h1>
        </AdaptableComponent>
        <AdaptableComponent id="user-info" uiType={UiElementType.SECONDARY}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>User: John Doe (Mode: {uiMode})</span>
            <button className="user-profile-button" style={{ marginLeft: '10px', padding: '5px 10px' }} onClick={() => alert('User Profile')}>Profile</button>
            <button className="debug-mode-toggle" style={{ marginLeft: '10px', padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '4px' }}
                    onClick={() => {
                      const newMode = uiMode === 'standard' ? 'focus' : uiMode === 'focus' ? 'minimal' : uiMode === 'minimal' ? 'guided' : uiMode === 'guided' ? 'crisis' : 'standard';
                      setUiMode(newMode);
                      alert(`Forced UI Mode to: ${newMode}`);
                    }}>
              Force Mode: {uiMode}
            </button>
          </div>
        </AdaptableComponent>
        <AdaptableComponent id="global-nav-buttons" uiType={UiElementType.NAV_GLOBAL}>
          <nav>
            <button className="nav-button" style={{ margin: '0 5px', padding: '5px 10px' }}>Dashboard</button>
            <button className="nav-button" style={{ margin: '0 5px', padding: '5px 10px' }}>Accounts</button>
            <button className="nav-button" style={{ margin: '0 5px', padding: '5px 10px' }}>Transfers</button>
          </nav>
        </AdaptableComponent>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}> {/* Adjusted height for header/footer */}
        <AdaptableComponent id="sidebar" uiType={UiElementType.SECONDARY}>
          <aside style={{ width: '200px', padding: '20px', background: '#e0e0e0', borderRight: '1px solid #ccc' }}>
            <h3>Secondary Menu</h3>
            <ul>
              <li><a href="#settings">Settings</a></li>
              <li><a href="#reports">Reports</a></li>
              <li><a href="#support">Support</a></li>
            </ul>
            <AdaptableComponent id="sidebar-ad" uiType={UiElementType.TERTIARY}>
              <div style={{ background: '#ccc', padding: '10px', marginTop: '20px', fontSize: '0.8em', textAlign: 'center' }}>
                Promotion: Get 0.5% Cashback!
              </div>
            </AdaptableComponent>
            <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
              <h4>Task Context Controls (Demo)</h4>
              <button onClick={() => handleSetTask('Browse Products', 'medium')} style={{ margin: '5px', padding: '5px' }}>Browse</button>
              <button onClick={() => handleSetTask('Complete Payment', 'critical', 'immediate')} style={{ margin: '5px', padding: '5px' }}>Payment</button>
              <button onClick={() => handleSetTask('Review Statement', 'low')} style={{ margin: '5px', padding: '5px' }}>Review</button>
              <button onClick={() => taskContextManager.setTask(null)} style={{ margin: '5px', padding: '5px' }}>Clear Task</button>
            </div>
            <AdaptableComponent id="contextual-hint" uiType={UiElementType.HINT_CONTEXTUAL}>
              <div style={{ background: '#f8d7da', border: '1px solid #dc3545', padding: '8px', borderRadius: '4px', marginTop: '15px', color: '#721c24' }}>
                Tip: Remember to verify transaction details before confirming!
              </div>
            </AdaptableComponent>
          </aside>
        </AdaptableComponent>

        <main style={{ flexGrow: 1, padding: '20px', background: '#f9f9f9' }}>
          <h2>Current Cognitive Load: {cognitiveLoad.toFixed(2)} (UI Mode: {uiMode})</h2>
          <h3>Current Task: {currentTask?.name || 'N/A'} (Complexity: {currentTask?.complexity || 'N/A'}, Urgency: {currentTask?.urgency || 'N/A'})</h3>
          <p>This is the main content area. Interact with the application to observe UI adaptation.</p>
          <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fff' }}>
            <label htmlFor="user-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Type here rapidly to increase load:</label>
            <input id="user-input" type="text" placeholder="Start typing..." style={{ margin: '10px 0', padding: '8px', width: '300px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <button onClick={simulateFormError} style={{ marginLeft: '10px', padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Simulate Form Error
            </button>
          </div>
          <AdaptableComponent id="process-transaction-action" uiType={UiElementType.CRITICAL_ACTION}>
            <button
              style={{ margin: '10px 0', padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              onClick={() => console.log('Primary Action: Transaction Processed!')}>
              Process Transaction
            </button>
          </AdaptableComponent>
          <button onClick={simulateApiError} style={{ marginLeft: '10px', padding: '8px 12px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Simulate API Error
          </button>
          <button onClick={simulateClientRuntimeError} style={{ marginLeft: '10px', padding: '8px 12px', background: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Simulate Client Error
          </button>

          <AdaptableComponent id="optional-widget" uiType={UiElementType.SECONDARY}>
            <div style={{ background: '#f0f8ff', padding: '15px', border: '1px solid #add8e6', borderRadius: '5px', marginTop: '20px' }}>
              <h4>Optional Widget: Quick Stats</h4>
              <p>Balance: $12,345.67</p>
              <p>Last Login: 2 hours ago</p>
            </div>
          </AdaptableComponent>

          {uiMode === 'guided' && (
            <AdaptableComponent id="guided-steps" uiType={UiElementType.GUIDED}>
              <div style={{ background: '#e6ffed', padding: '20px', border: '2px solid #28a745', borderRadius: '5px', marginTop: '20px' }}>
                <h3>Step-by-Step Guidance for {currentTask?.name || 'Your Task'}</h3>
                <p>1. Review account details.</p>
                <p>2. Confirm recipient information.</p>
                <p>3. Authorize with your password.</p>
                <button style={{ marginTop: '10px', padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                  Next Step
                </button>
              </div>
            </AdaptableComponent>
          )}

          <AdaptableComponent id="dynamic-news-feed" uiType={UiElementType.DYNAMIC_CONTENT}>
            <div style={{ background: '#fcfcfc', border: '1px dashed #ddd', padding: '10px', marginTop: '20px', borderRadius: '5px' }}>
              <h4>Market News</h4>
              <p>Stock market up 0.5% today...</p>
              <small>Click to expand for more details.</small>
            </div>
          </AdaptableComponent>

          <div style={{ height: '500px', background: '#fafafa', overflowY: 'scroll', border: '1px solid #ddd', marginTop: '20px', resize: 'vertical' }}>
            <p style={{ position: 'sticky', top: 0, background: '#e9ecef', padding: '8px', borderBottom: '1px solid #ddd', zIndex: 1 }}>
              Scrollable Content: Scroll quickly up and down to simulate load from navigation/exploration.
            </p>
            {Array.from({ length: 50 }).map((_, i) => (
              <p key={i} style={{ padding: '5px 0', borderBottom: i < 49 ? '1px dotted #eee' : 'none' }}>Item {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            ))}
          </div>
        </main>
      </div>

      <AdaptableComponent id="footer" uiType={UiElementType.SECONDARY}>
        <footer style={{ padding: '15px', background: '#f0f0f0', textAlign: 'center', borderTop: '1px solid #ccc' }}>
          &copy; 2024 Demo Bank. All rights reserved.
          <AdaptableComponent id="privacy-link" uiType={UiElementType.TERTIARY}>
            <span style={{ marginLeft: '20px', fontSize: '0.9em' }}><a href="#privacy">Privacy Policy</a></span>
          </AdaptableComponent>
        </footer>
      </AdaptableComponent>
    </>
  );
};

// Main application entry point
export const RootApp: React.FC = () => (
  <CognitiveLoadProvider>
    <AppLayout>
      {/* Children of AppLayout are rendered within the main content area */}
    </AppLayout>
  </CognitiveLoadProvider>
);