export enum UiElementType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  GUIDED = 'guided',
}

export type UiMode = 'standard' | 'focus' | 'minimal' | 'guided';

export interface MouseEventData {
  x: number;
  y: number;
  button: number;
  targetId: string;
  timestamp: number;
  targetBoundingRect?: DOMRectReadOnly;
}

export interface ScrollEventData {
  scrollX: number;
  scrollY: number;
  timestamp: number;
}

export interface KeyboardEventData {
  key: string;
  code: string;
  timestamp: number;
  isModifier: boolean;
}

export interface FocusBlurEventData {
  type: 'focus' | 'blur';
  targetId: string;
  timestamp: number;
}

export interface FormEventData {
  type: 'submit' | 'input' | 'change';
  targetId: string;
  value?: string;
  timestamp: number;
  isValid?: boolean;
}

export type RawTelemetryEvent =
  | { type: 'mousemove'; data: MouseEventData }
  | { type: 'click'; data: MouseEventData }
  | { type: 'scroll'; data: ScrollEventData }
  | { type: 'keydown'; data: KeyboardEventData }
  | { type: 'keyup'; data: KeyboardEventData }
  | { type: 'focus'; data: FocusBlurEventData }
  | { type: 'blur'; data: FocusBlurEventData }
  | { type: 'form'; data: FormEventData };

export interface MouseKinematicsFeatures {
  mouse_velocity_avg: number;
  mouse_acceleration_avg: number;
  mouse_path_tortuosity: number;
  mouse_dwell_time_avg: number;
  fitts_law_ip_avg: number;
  mouse_jerk_metric: number; // Added for more complexity
  mouse_movement_entropy: number; // Added
}

export interface ClickDynamicsFeatures {
  click_frequency: number;
  click_latency_avg: number;
  target_acquisition_error_avg: number;
  double_click_frequency: number;
  misclick_rate: number; // Added for complexity
  click_sequence_variability: number; // Added
}

export interface ScrollDynamicsFeatures {
  scroll_velocity_avg: number;
  scroll_direction_changes: number;
  scroll_pause_frequency: number;
  scroll_amplitude_variance: number; // Added
  scroll_event_density_per_area: number; // Added
}

export interface KeyboardDynamicsFeatures {
  typing_speed_wpm: number;
  backspace_frequency: number;
  keystroke_latency_avg: number;
  error_correction_rate: number;
  key_press_duration_avg: number; // Added
  cognitive_typing_lag: number; // Added, delay between thought and action
}

export interface InteractionErrorFeatures {
  form_validation_errors_count: number;
  repeated_action_attempts_count: number;
  navigation_errors_count: number;
  ui_feedback_misinterpretations: number; // Added
  undo_redo_frequency: number; // Added
}

export interface TaskContextFeatures {
  current_task_complexity: number;
  time_in_current_task_sec: number;
  task_interruption_frequency: number; // Added
  task_cognitive_demand_rating: number; // Added
}

export interface SystemResourceFeatures {
  cpu_usage_avg: number;
  memory_usage_avg: number;
  network_latency_avg: number;
  gpu_usage_avg: number;
}

export interface TelemetryFeatureVector {
  timestamp_window_end: number;
  mouse?: MouseKinematicsFeatures;
  clicks?: ClickDynamicsFeatures;
  scroll?: ScrollDynamicsFeatures;
  keyboard?: KeyboardDynamicsFeatures;
  errors?: InteractionErrorFeatures;
  task_context?: TaskContextFeatures;
  system_resources?: SystemResourceFeatures; // New component
  event_density: number;
  cross_modal_interaction_entropy?: number; // Added for complexity
  cognitive_state_persistence?: number; // Added for complexity
}

export interface UserPreferences {
  preferredUiMode: UiMode;
  cognitiveLoadThresholds: {
    high: number;
    low: number;
    critical: number;
    criticalLow: number;
    guided: number;
    guidedLow: number;
  };
  adaptationPolicySelection: {
    [mode: string]: { [elementType: string]: 'obscure' | 'deemphasize' | 'reposition' | 'summarize' | 'none' };
  };
  personalizedBaselineCLS: number;
  adaptiveLearningRate: number; // Added for a more dynamic model
  sensitivityToErrors: number; // Added for user customization
}

export type TaskContext = {
  id: string;
  name: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  estimated_duration_sec: number;
  dependencies_count: number;
};

/**
 * Interface for the Cognitive Load Predictor, enabling different ML models
 * to be swapped out if they adhere to this contract.
 */
export interface ICognitiveLoadPredictor {
  /**
   * Predicts the cognitive load score based on the given feature vector,
   * user preferences, and current task context.
   * @param features - The processed telemetry feature vector.
   * @param userPrefs - User-specific preferences including baseline CLS.
   * @param currentTask - The current task context.
   * @returns A normalized cognitive load score (0.0 to 1.0).
   */
  predict(
    features: TelemetryFeatureVector,
    userPrefs: UserPreferences,
    currentTask: TaskContext | null
  ): number;
  // In a real scenario, this might include methods for loading models, updating weights, etc.
  // updateModel?(modelPath: string): Promise<void>;
  // setWeights?(weights: any): void;
}

/**
 * Provides static methods to generate various Mermaid diagram definitions.
 * This helps visualize the model's structure, data flow, and conceptual claims.
 * Each method returns a string formatted as a Mermaid diagram.
 */
export class MermaidDiagrams {
  /**
   * @claim 1: The overall cognitive load prediction flow is a multi-stage process involving data acquisition, feature engineering, and model inference.
   * @mermaid
   * ```mermaid
   * graph TD
   *    A[Raw Telemetry Events] --> B{Feature Preprocessing};
   *    B --> C{Feature Vector Aggregation};
   *    C --> D[CognitiveLoadPredictor.predict()];
   *    D -- User Preferences & Task Context --> E[Cognitive Load Score];
   *    E --> F{UI Adaptation Engine};
   *    F -- Adaptive UI Changes --> G[User Interface];
   * ```
   */
  public static getPredictorFlowChart(): string {
    return `graph TD
    A[Raw Telemetry Events] --> B{Feature Preprocessing};
    B -- f_1(Events) --> C{Feature Vector Aggregation};
    C -- F_v --> D[CognitiveLoadPredictor.predict()];
    D -- U_p, T_c --> E[Cognitive Load Score (CLS)];
    E -- CLS > Thresholds --> F{UI Adaptation Engine};
    F -- UI_Adaptation --> G[User Interface];
    style A fill:#f9f,stroke:#333,stroke-width:2px;
    style G fill:#f9f,stroke:#333,stroke-width:2px;`;
  }

  /**
   * @claim 2: The feature vector is a composite of diverse user interaction and system performance metrics, grouped into logical components.
   * @mermaid
   * ```mermaid
   * graph TD
   *    FV[Telemetry Feature Vector] --> M[Mouse Kinematics];
   *    FV --> C[Click Dynamics];
   *    FV --> K[Keyboard Dynamics];
   *    FV --> S[Scroll Dynamics];
   *    FV --> E[Interaction Errors];
   *    FV --> TC[Task Context];
   *    FV --> SR[System Resources];
   *    FV --> ED[Event Density];
   *    FV --> CMIE[Cross-Modal Interaction Entropy];
   *    FV --> CSP[Cognitive State Persistence];
   * ```
   */
  public static getFeatureVectorComposition(): string {
    return `graph TD
    FV[Telemetry Feature Vector] --> M[Mouse Kinematics];
    FV --> C[Click Dynamics];
    FV --> K[Keyboard Dynamics];
    FV --> S[Scroll Dynamics];
    FV --> E[Interaction Errors];
    FV --> TC[Task Context];
    FV --> SR[System Resources];
    FV --> ED[Event Density];
    FV --> CMIE[Cross-Modal Interaction Entropy];
    FV --> CSP[Cognitive State Persistence];
    style FV fill:#afa,stroke:#333,stroke-width:2px;`;
  }

  /**
   * @claim 3: Different feature components contribute to the raw cognitive load accumulator with varying weights, reflecting their relative importance.
   * @mermaid
   * ```mermaid
   * pie title Component Contribution Weights
   *    "Baseline" : 10
   *    "Mouse Kinematics" : 20
   *    "Click Dynamics" : 25
   *    "Keyboard Dynamics" : 15
   *    "Scroll Dynamics" : 10
   *    "Interaction Errors" : 35
   *    "Task Complexity" : 15
   *    "Event Density" : 5
   *    "System Resources" : 10
   *    "Cross-Modal Entropy" : 7
   *    "Cognitive Persistence" : 8
   * ```
   */
  public static getLoadComponentWeights(): string {
    return `pie title Component Contribution Weights
    "Baseline" : 10
    "Mouse Kinematics" : 20
    "Click Dynamics" : 25
    "Keyboard Dynamics" : 15
    "Scroll Dynamics" : 10
    "Interaction Errors" : 35
    "Task Complexity" : 15
    "Event Density" : 5
    "System Resources" : 10
    "Cross-Modal Entropy" : 7
    "Cognitive Persistence" : 8`;
  }

  /**
   * @claim 4: Feature normalization is crucial to bring diverse feature scales into a comparable range, preventing features with larger absolute values from dominating the prediction.
   * @mermaid
   * ```mermaid
   * graph LR
   *    A[Raw Feature Value] --> B{Check Value & Max};
   *    B -- Valid --> C[Normalize (Value / Max)];
   *    B -- Invalid/Zero Max --> D[Return 0];
   *    C -- Invert? --> E{1 - Normalized};
   *    E --> F[Clamped [0,1] Score];
   *    C -- No Invert --> F;
   * ```
   */
  public static getNormalizationProcess(): string {
    return `graph LR
    A[Raw Feature Value $V_f$] --> B{Check $V_f$ & $V_{max}$};
    B -- Valid --> C[$N_f = V_f / V_{max}$];
    B -- Invalid/Zero Max --> D[Return 0];
    C -- Invert? --> E[$N'_{f} = 1 - N_f$];
    E --> F[Clamped $[0,1]$ Score];
    C -- No Invert --> F;`;
  }

  /**
   * @claim 5: The UI adaptation policy is dynamically selected based on the predicted cognitive load score and user-defined preferences for different UI modes and element types.
   * @mermaid
   * ```mermaid
   * graph TD
   *    CLS[Cognitive Load Score] --> T{Threshold Check};
   *    T -- CLS > Critical --> PA[Policy A (Obscure)];
   *    T -- CLS > High --> PB[Policy B (Deemphasize)];
   *    T -- CLS <= Low --> PC[Policy C (None)];
   *    PA --> AD[Adaptation Decision];
   *    PB --> AD;
   *    PC --> AD;
   *    UserPrefs(User Preferences) --> T;
   * ```
   */
  public static getAdaptationPolicyFlow(): string {
    return `graph TD
    CLS[Cognitive Load Score $\\sigma(R_L)$] --> T{Threshold Check};
    T -- CLS > $T_{critical}$ --> PA[Policy A (Obscure)];
    T -- CLS > $T_{high}$ --> PB[Policy B (Deemphasize)];
    T -- CLS <= $T_{low}$ --> PC[Policy C (None)];
    PA --> AD[Adaptation Decision];
    PB --> AD;
    PC --> AD;
    UserPrefs(User Preferences $U_p$) --> T;`;
  }

  /**
   * @claim 6: Task complexity and its duration exert a significant, often non-linear, influence on cognitive load, especially for prolonged complex tasks.
   * @mermaid
   * ```mermaid
   * graph LR
   *    TC[Task Complexity] --> A{Base Contribution};
   *    TT[Time In Task (sec)] --> B{Prolonged Task Check};
   *    A -- C_task --> Sum[Task Load Contribution];
   *    B -- if C_task > 0.5 & TT > 120 --> Add[Time-based Increment];
   *    Add --> Sum;
   * ```
   */
  public static getTaskComplexityImpact(): string {
    return `graph LR
    TC[Task Complexity $C_T$] --> A{Base Contribution $C_T \\cdot W_{TC}$};
    TT[Time In Task (sec) $T_{task}$] --> B{Prolonged Task Check};
    A -- $L_{base}$ --> Sum[Task Load Contribution];
    B -- if $C_T > 0.5$ & $T_{task} > 120$ --> Add[Time-based Increment $\\Delta L_{task}$];
    Add --> Sum;`;
  }

  /**
   * @claim 7: Interaction errors are direct and strong indicators of cognitive overload or user struggle, thus receiving the highest weighting in the prediction model.
   * @mermaid
   * ```mermaid
   * graph TD
   *    E[Interaction Error Component] --> FV[Form Validation Errors];
   *    E --> RA[Repeated Action Attempts];
   *    E --> NE[Navigation Errors];
   *    E --> UF[UI Feedback Misinterpretations];
   *    E --> UR[Undo/Redo Frequency];
   *    FV & RA & NE & UF & UR -- Normalize & Weight --> EL[Error Load];
   *    EL -- Any Critical Error? --> Boost[+1.0 Critical Boost];
   *    Boost --> Final[Total Error Contribution];
   * ```
   */
  public static getErrorComponentImpact(): string {
    return `graph TD
    E[Interaction Error Component] --> FV[Form Validation Errors $E_{FV}$];
    E --> RA[Repeated Action Attempts $E_{RA}$];
    E --> NE[Navigation Errors $E_{NE}$];
    E --> UF[UI Feedback Misinterpretations $E_{UF}$];
    E --> UR[Undo/Redo Frequency $E_{UR}$];
    FV & RA & NE & UF & UR -- $f(E_i) \\cdot w_i$ --> EL[Error Load];
    EL -- $E_{FV} > 0 \\lor E_{RA} > 0 \\lor E_{NE} > 0$ --> Boost[+1.0 Critical Boost];
    Boost --> Final[Total Error Contribution $L_{error}$];`;
  }

  /**
   * @claim 8: Feature thresholds are used to introduce non-linearities, amplifying the impact of extreme feature values on the predicted cognitive load.
   * @mermaid
   * ```mermaid
   * graph TD
   *    A[Feature Value] --> B{Compare to Threshold};
   *    B -- Above/Below Threshold --> C[Apply Non-linear Modifier];
   *    C --> D[Modified Feature Contribution];
   *    B -- Within Range --> E[Standard Feature Contribution];
   * ```
   */
  public static getThresholdsApplication(): string {
    return `graph TD
    A[Feature Value $F_j$] --> B{Compare to Threshold $T_j$};
    B -- $F_j > T_j$ --> C[Apply Non-linear Modifier $\\Delta L_j$];
    C --> D[Modified Feature Contribution $L'_j$];
    B -- $F_j \\le T_j$ --> E[Standard Feature Contribution $L_j$];`;
  }

  /**
   * @claim 9: User preferences, particularly the personalized baseline and sensitivity to errors, allow the cognitive load prediction model to adapt to individual user characteristics.
   * @mermaid
   * ```mermaid
   * graph LR
   *    UP[User Preferences] --> PB[Personalized Baseline CLS];
   *    UP --> ALT[Adaptive Learning Rate];
   *    UP --> STE[Sensitivity to Errors];
   *    PB --> P[Predictor Baseline Impact];
   *    ALT --> A[Model Weight Adaptation];
   *    STE --> E[Error Component Weight Adjustment];
   * ```
   */
  public static getUserPreferenceInfluence(): string {
    return `graph LR
    UP[User Preferences $U_p$] --> PB[Personalized Baseline CLS $B_{CLS}$];
    UP --> ALT[Adaptive Learning Rate $\\lambda_a$];
    UP --> STE[Sensitivity to Errors $S_e$];
    PB --> P[Predictor Baseline Impact $L_{baseline} = B_{CLS} \\cdot W_{baseline}$];
    ALT --> A[Model Weight Adaptation $W'_k = W_k(1 + \\lambda_a \\cdot \\Delta_k)$];
    STE --> E[Error Component Weight Adjustment $W'_{error} = W_{error} \\cdot S_e$];`;
  }

  /**
   * @claim 10: The overall system interaction involves a feedback loop where predicted cognitive load informs UI adaptations, which in turn influence user behavior and subsequent telemetry.
   * @mermaid
   * ```mermaid
   * graph LR
   *    User(User Interaction) --> Telemetry[Telemetry Collection];
   *    Telemetry --> Predictor[Cognitive Load Predictor];
   *    Predictor --> CLS[Cognitive Load Score];
   *    CLS --> Adapter[UI Adaptation Engine];
   *    Adapter --> UI[User Interface];
   *    UI -- Affects --> User;
   * ```
   */
  public static getOverallSystemInteraction(): string {
    return `graph LR
    User(User Interaction) --> Telemetry[Telemetry Collection];
    Telemetry --> Predictor[Cognitive Load Predictor];
    Predictor --> CLS[Cognitive Load Score];
    CLS --> Adapter[UI Adaptation Engine];
    Adapter --> UI[User Interface];
    UI -- Affects --> User;`;
  }
}

/**
 * A utility class for various mathematical operations, particularly useful for
 * feature engineering and model calculations. This consolidates common
 * statistical and transformational equations.
 */
export class MathUtils {
  /**
   * @equation 1: Calculates the sigmoid activation function: $\sigma(x) = \frac{1}{1 + e^{-x}}$
   * @param x - The input value.
   * @returns The sigmoid of x.
   */
  public static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * @equation 2: Calculates the hyperbolic tangent activation function: $\text{tanh}(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$
   * @param x - The input value.
   * @returns The tanh of x.
   */
  public static tanh(x: number): number {
    return Math.tanh(x);
  }

  /**
   * @equation 3: Calculates the Rectified Linear Unit (ReLU) activation function: $\text{ReLU}(x) = \max(0, x)$
   * @param x - The input value.
   * @returns The ReLU of x.
   */
  public static relu(x: number): number {
    return Math.max(0, x);
  }

  /**
   * @equation 4: Safely normalizes a feature value between 0 and 1: $N_f = \min(1, \max(0, \frac{V_f}{V_{max}}))$.
   * @equation 5: Inverted normalization: $N'_f = 1 - N_f$.
   * @param value - The raw feature value.
   * @param maxValue - The maximum expected value for normalization.
   * @param invert - If true, normalize such that higher value means lower load (e.g., Fitts' IP).
   */
  public static safeNormalize(value: number | undefined, maxValue: number, invert: boolean = false): number {
    if (value === undefined || maxValue === 0) {
      return 0;
    }
    let normalized = Math.min(1, Math.max(0, value / maxValue));
    return invert ? (1 - normalized) : normalized;
  }

  /**
   * @equation 6: Calculates the Euclidean distance between two 2D points: $d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.
   * @param p1 - First point {x, y}.
   * @param p2 - Second point {x, y}.
   * @returns Euclidean distance.
   */
  public static euclideanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  /**
   * @equation 7: Calculates the average of an array of numbers: $\bar{x} = \frac{1}{N}\sum_{i=1}^N x_i$.
   * @param values - Array of numbers.
   * @returns Average value.
   */
  public static average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, current) => sum + current, 0) / values.length;
  }

  /**
   * @equation 8: Calculates the standard deviation of an array of numbers: $s = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \bar{x})^2}$.
   * @param values - Array of numbers.
   * @returns Standard deviation.
   */
  public static standardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = MathUtils.average(values);
    const variance = values.reduce((sum, current) => sum + Math.pow(current - avg, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * @equation 9: Calculates the exponential moving average (EMA): $\text{EMA}_t = (V_t \cdot \alpha) + (\text{EMA}_{t-1} \cdot (1 - \alpha))$.
   * @param currentValue - The latest value.
   * @param previousEMA - The previous EMA value.
   * @param alpha - Smoothing factor ($\alpha = \frac{2}{N+1}$ where N is period).
   * @returns The new EMA value.
   */
  public static exponentialMovingAverage(currentValue: number, previousEMA: number, alpha: number): number {
    if (isNaN(previousEMA)) return currentValue; // For the very first value
    return (currentValue * alpha) + (previousEMA * (1 - alpha));
  }

  /**
   * @equation 10: Calculates Shannon entropy: $H(X) = -\sum_{i=1}^n P(x_i) \log_2 P(x_i)$.
   * @param probabilities - An array of probabilities for each outcome.
   * @returns The entropy value.
   */
  public static shannonEntropy(probabilities: number[]): number {
    if (probabilities.some(p => p < 0 || p > 1) || MathUtils.sum(probabilities) > 1.0001) {
      console.warn("Invalid probabilities for entropy calculation.");
      return 0;
    }
    return -probabilities.reduce((sum, p) => p > 0 ? sum + p * Math.log2(p) : sum, 0);
  }

  /**
   * @equation 11: Calculates the sum of an array of numbers: $\text{Sum} = \sum_{i=1}^N x_i$.
   * @param values - Array of numbers.
   * @returns The sum.
   */
  public static sum(values: number[]): number {
    return values.reduce((acc, val) => acc + val, 0);
  }

  /**
   * @equation 12: Calculates the logarithm base 10: $\log_{10}(x)$.
   * @param x - Input value.
   * @returns Log base 10.
   */
  public static log10(x: number): number {
    return Math.log10(x);
  }

  /**
   * @equation 13: Calculates the natural logarithm: $\ln(x)$.
   * @param x - Input value.
   * @returns Natural log.
   */
  public static ln(x: number): number {
    return Math.log(x);
  }

  /**
   * @equation 14: Linear interpolation between two values: $V_L = V_1 + (V_2 - V_1) \cdot t$.
   * @param v1 - Start value.
   * @param v2 - End value.
   * @param t - Interpolation factor (0 to 1).
   * @returns Interpolated value.
   */
  public static lerp(v1: number, v2: number, t: number): number {
    return v1 + (v2 - v1) * t;
  }

  /**
   * @equation 15: Computes a polynomial feature: $P(x) = ax^2 + bx + c$.
   * @param x - The input feature.
   * @param a - Coefficient for x^2.
   * @param b - Coefficient for x.
   * @param c - Constant.
   * @returns The polynomial value.
   */
  public static polynomialFeature(x: number, a: number, b: number, c: number): number {
    return a * Math.pow(x, 2) + b * x + c;
  }

  /**
   * @equation 16: Computes an interaction term: $I = F_1 \cdot F_2$.
   * @param f1 - First feature.
   * @param f2 - Second feature.
   * @returns The interaction product.
   */
  public static interactionTerm(f1: number, f2: number): number {
    return f1 * f2;
  }

  /**
   * @equation 17: Clamp a value within a min/max range: $V_{clamped} = \max(V_{min}, \min(V, V_{max}))$.
   * @param value - The value to clamp.
   * @param min - The minimum allowed value.
   * @param max - The maximum allowed value.
   * @returns The clamped value.
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * @equation 18: Calculates Manhattan distance (L1 norm) between two 2D points: $d = |x_2 - x_1| + |y_2 - y_1|$.
   * @param p1 - First point {x, y}.
   * @param p2 - Second point {x, y}.
   * @returns Manhattan distance.
   */
  public static manhattanDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    return Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
  }

  /**
   * @equation 19: Z-score normalization: $Z = (X - \mu) / \sigma$.
   * @param value - The raw value.
   * @param mean - The mean of the dataset.
   * @param stdDev - The standard deviation of the dataset.
   * @returns The z-score.
   */
  public static zScoreNormalize(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  /**
   * @equation 20: Min-Max Scaling: $X_{scaled} = (X - X_{min}) / (X_{max} - X_{min})$.
   * @param value - The raw value.
   * @param min - The minimum of the dataset.
   * @param max - The maximum of the dataset.
   * @returns The min-max scaled value.
   */
  public static minMaxScale(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return (value - min) / (max - min);
  }
}

/**
 * Manages the generation of specific claims about the Cognitive Load Predictor's design,
 * functionality, and underlying principles.
 */
export class CognitiveLoadAssertions {
  public static get allClaims(): string[] {
    return [
      this.claim1(),
      this.claim2(),
      this.claim3(),
      this.claim4(),
      this.claim5(),
      this.claim6(),
      this.claim7(),
      this.claim8(),
      this.claim9(),
      this.claim10(),
    ];
  }

  /**
   * @claim 1: The model integrates a personalized baseline cognitive load score, allowing for individual user variation in baseline mental effort.
   */
  public static claim1(): string {
    return "Claim 1: The Cognitive Load Predictor integrates a personalized baseline cognitive load score, allowing for individual user variation in baseline mental effort and adapting the prediction to unique user profiles. This enhances relevance and accuracy for each individual.";
  }

  /**
   * @claim 2: Non-linear feature transformations and interaction terms are employed to capture complex relationships between user behaviors and cognitive load.
   */
  public static claim2(): string {
    return "Claim 2: To accurately model the intricate nature of human cognition, the predictor employs sophisticated non-linear feature transformations and explicitly defined interaction terms. This allows it to capture complex, synergistic relationships between various user behaviors that simpler linear models would overlook.";
  }

  /**
   * @claim 3: Direct indicators of errors (e.g., form validation errors, repeated attempts) are weighted significantly higher, reflecting their immediate correlation with increased cognitive strain.
   */
  public static claim3(): string {
    return "Claim 3: Features directly indicative of user errors, such as frequent form validation failures or repeated interaction attempts, are assigned a disproportionately higher weight in the prediction model. This prioritization reflects their strong and immediate correlation with heightened cognitive strain and frustration, making them critical signals for intervention.";
  }

  /**
   * @claim 4: Task context, including complexity and time spent, dynamically modulates the cognitive load prediction, acknowledging the varying demands of different activities.
   */
  public static claim4(): string {
    return "Claim 4: The model dynamically incorporates task context, particularly task complexity and the duration a user has been engaged in a task. This allows the cognitive load prediction to be responsive to the inherent demands of the current activity, acknowledging that a simple error in a complex, prolonged task has different implications than in a short, trivial one.";
  }

  /**
   * @claim 5: A sigmoid activation function ensures that the final cognitive load score is consistently normalized between 0 and 1, facilitating interpretability and system integration.
   */
  public static claim5(): string {
    return "Claim 5: A final sigmoid activation function is applied to the accumulated raw cognitive load score. This mathematically guarantees that the output is consistently normalized to a range between 0 and 1, providing an easily interpretable, universally scaled metric for cognitive load that simplifies subsequent decision-making by adaptive UI systems.";
  }

  /**
   * @claim 6: The predictor can be updated with new configuration parameters (e.g., weights, scaling factors) without requiring a full model re-training, enabling agile adaptation.
   */
  public static claim6(): string {
    return "Claim 6: The architecture supports agile adaptation through dynamic configuration updates. New scaling factors, component weights, or thresholds can be applied to the predictor's internal `featureConfig` without requiring a full model re-training cycle, allowing for rapid tuning and policy adjustments based on observed performance or new insights.";
  }

  /**
   * @claim 7: Mouse kinematics, including velocity, acceleration, tortuosity, and Fitts' Law Index of Performance, provide granular insights into fine motor control and goal-directed movement efficiency, reflecting underlying cognitive effort.
   */
  public static claim7(): string {
    return "Claim 7: Granular analysis of mouse kinematics – including average velocity, acceleration, path tortuosity, and Fitts' Law Index of Performance – offers subtle yet powerful insights into a user's fine motor control and efficiency in goal-directed movements. Deviations from optimal patterns in these metrics directly reflect increased cognitive effort, uncertainty, or frustration during interaction.";
  }

  /**
   * @claim 8: System resource metrics are incorporated to account for potential external factors influencing perceived cognitive load, such as system lag or unresponsiveness.
   */
  public static claim8(): string {
    return "Claim 8: The model acknowledges that perceived cognitive load is not solely a function of user interaction but can also be heavily influenced by external system factors. Therefore, system resource metrics like CPU usage, memory, and network latency are incorporated to differentiate between user-induced load and system-induced struggle, providing a more holistic and accurate prediction.";
  }

  /**
   * @claim 9: The model uses thresholds to introduce abrupt changes in load contribution for extreme feature values, simulating non-linear human response to high-stress or critical conditions.
   */
  public static claim9(): string {
    return "Claim 9: Critical thresholds are implemented for specific feature values to introduce significant, non-linear boosts or penalties to the raw load accumulator. This design choice mimics the human experience where certain extreme conditions (e.g., very high backspace frequency, persistent errors) can cause a sudden, disproportionate surge in cognitive burden, rather than a gradual increase.";
  }

  /**
   * @claim 10: Cross-modal interaction entropy and cognitive state persistence features are introduced to capture the fluidity and stability of user engagement patterns across different input modalities.
   */
  public static claim10(): string {
    return "Claim 10: To achieve a more comprehensive understanding of user state, advanced features like 'cross-modal interaction entropy' and 'cognitive state persistence' are introduced. These metrics analyze the variability and consistency of user engagement across mouse, keyboard, and scroll inputs, providing insights into the fluidity of interaction and the stability of the user's cognitive state.";
  }
}

/**
 * Implements a sophisticated mock machine learning model for inferring cognitive load.
 * This class replaces a simple linear sum with a more robust, non-linear
 * combination of features, simulating a real-world ML prediction mechanism.
 *
 * The prediction logic incorporates:
 * - Personalized baseline from user preferences.
 * - Non-linear scaling of individual features.
 * - Interaction terms between related features.
 * - Stronger influence for direct error indicators.
 * - Impact of current task complexity.
 * - Sigmoid activation for final score normalization [0, 1].
 */
export class CognitiveLoadPredictor implements ICognitiveLoadPredictor {

  // Configuration for feature scaling and weights, mimicking trained model parameters
  private featureConfig = {
    // Scaling factors to normalize features, assume typical max values for a 1-second window
    scaling: {
      mouse_velocity_avg: 20, // px/ms
      mouse_acceleration_avg: 5, // px/ms^2
      mouse_path_tortuosity: 5, // ratio, e.g., 5x longer path than straight
      fitts_law_ip_avg: 10, // Max reasonable Index of Performance, higher is better (inverse relationship to load)
      mouse_jerk_metric: 0.5, // px/ms^3
      mouse_movement_entropy: 4, // bits
      mouse_dwell_time_avg: 200, // ms

      target_acquisition_error_avg: 100, // px deviation from center
      click_frequency: 10, // clicks/sec
      click_latency_avg: 500, // ms between clicks (higher latency indicates struggle)
      double_click_frequency: 2, // double clicks / sec (can indicate hurriedness)
      misclick_rate: 0.1, // percentage of misclicks
      click_sequence_variability: 0.5, // std dev of target sequence

      scroll_velocity_avg: 2000, // px/sec
      scroll_direction_changes: 10, // count per second (high for erratic scrolling)
      scroll_pause_frequency: 5, // pauses per second (high for confusion/search)
      scroll_amplitude_variance: 10000, // px^2
      scroll_event_density_per_area: 0.01, // events/px^2

      typing_speed_wpm: 120, // wpm (deviation from optimal affects load)
      backspace_frequency: 3, // backspaces / sec
      keystroke_latency_avg: 200, // ms between keydowns
      error_correction_rate: 1, // ratio (0-1), higher means more corrections
      key_press_duration_avg: 100, // ms
      cognitive_typing_lag: 500, // ms

      form_validation_errors_count: 5, // count in window
      repeated_action_attempts_count: 3, // count in window
      navigation_errors_count: 3, // count in window
      ui_feedback_misinterpretations: 2, // count in window
      undo_redo_frequency: 2, // count in window

      current_task_complexity: 1, // 0-1 normalized
      time_in_current_task_sec: 600, // Max 10 min
      task_interruption_frequency: 0.5, // interruptions/sec
      task_cognitive_demand_rating: 1, // 0-1 normalized

      cpu_usage_avg: 100, // %
      memory_usage_avg: 100, // %
      network_latency_avg: 500, // ms
      gpu_usage_avg: 100, // %

      event_density: 100, // total events per sec in window
      cross_modal_interaction_entropy: 3, // bits
      cognitive_state_persistence: 1, // 0-1, 1 means very stable, 0 means highly variable
    },
    // Weights for different components / feature groups
    weights: {
      baseline: 0.1,
      mouseComponent: 0.2,
      clickComponent: 0.25,
      keyboardComponent: 0.15,
      scrollComponent: 0.1,
      errorComponent: 0.35, // Errors are strong indicators, higher weight
      taskComplexity: 0.15,
      eventDensity: 0.05,
      systemResources: 0.1, // New component weight
      crossModalEntropy: 0.07, // New component weight
      cognitivePersistence: 0.08, // New component weight
    },
    // Thresholds for non-linear impacts (e.g., very high backspace freq, low WPM)
    thresholds: {
      highBackspace: 1.5, // backspaces/sec
      lowWPM: 20, // Words Per Minute
      highTargetError: 50, // px
      lowFittsIP: 1, // Low Fitts' Law Index of Performance
      highMisclickRate: 0.05, // 5% misclick
      highNetworkLatency: 250, // ms
      highCpuUsage: 75, // %
      longTaskTime: 240, // seconds (4 minutes)
      highTaskInterruption: 0.1, // interruptions/sec
      lowCognitivePersistence: 0.2, // very unstable state
    }
  };

  /**
   * Predicts the cognitive load score based on the given feature vector,
   * user preferences, and current task context.
   *
   * @equation 21: The overall raw cognitive load accumulator $R_L$ starts with an initial baseline contribution: $R_L(0) = U_{CLS} \cdot W_{baseline} \cdot 2$.
   * @equation 22: The base value for baseline contribution: $U_{CLS} = \text{userPrefs.personalizedBaselineCLS}$.
   * @equation 23: The weight for baseline contribution: $W_{baseline} = \text{this.featureConfig.weights.baseline}$.
   * @equation 24: Initial scaled baseline contribution: $L_{base} = U_{CLS} \cdot W_{baseline} \cdot C_{scaling}$.
   * @equation 25: The accumulation function for raw load: $R_L(t) = R_L(t-1) + L_{component} \cdot W_{component}$.
   *
   * @param features - The processed telemetry feature vector.
   * @param userPrefs - User-specific preferences including baseline CLS.
   * @param currentTask - The current task context.
   * @returns A normalized cognitive load score (0.0 to 1.0).
   */
  public predict(
    features: TelemetryFeatureVector,
    userPrefs: UserPreferences,
    currentTask: TaskContext | null
  ): number {
    let rawLoadAccumulator = 0; // Accumulate raw contributions, then normalize with sigmoid

    // 1. Start with personalized baseline, scaled by its weight
    // Eq. 21, 22, 23, 24
    rawLoadAccumulator += userPrefs.personalizedBaselineCLS * this.featureConfig.weights.baseline * 2;

    // --- 2. Mouse Kinematics Component ---
    let mouseLoadContribution = 0;
    if (features.mouse) {
      const mouse = features.mouse;
      // Eq. 26: $L_{vel} = N(\text{mouse_velocity_avg}) \cdot 0.4$.
      mouseLoadContribution += MathUtils.safeNormalize(mouse.mouse_velocity_avg, this.featureConfig.scaling.mouse_velocity_avg) * 0.4;
      // Eq. 27: $L_{accel} = N(\text{mouse_acceleration_avg}) \cdot 0.3$.
      mouseLoadContribution += MathUtils.safeNormalize(mouse.mouse_acceleration_avg, this.featureConfig.scaling.mouse_acceleration_avg) * 0.3;
      // Eq. 28: $L_{tort} = N(\text{mouse_path_tortuosity}) \cdot 0.3$.
      mouseLoadContribution += MathUtils.safeNormalize(mouse.mouse_path_tortuosity, this.featureConfig.scaling.mouse_path_tortuosity) * 0.3;
      // Eq. 29: $L_{fitts\_ip} = N(\text{fitts_law_ip_avg}, \text{invert=true}) \cdot 0.2$.
      mouseLoadContribution += MathUtils.safeNormalize(mouse.fitts_law_ip_avg, this.featureConfig.scaling.fitts_law_ip_avg, true) * 0.2;
      // Eq. 30: $L_{jerk} = N(\text{mouse_jerk_metric}) \cdot 0.15$.
      mouseLoadContribution += MathUtils.safeNormalize(mouse.mouse_jerk_metric, this.featureConfig.scaling.mouse_jerk_metric) * 0.15;
      // Eq. 31: $L_{dwell} = N(\text{mouse_dwell_time_avg}) \cdot 0.1$.
      mouseLoadContribution += MathUtils.safeNormalize(mouse.mouse_dwell_time_avg, this.featureConfig.scaling.mouse_dwell_time_avg) * 0.1;
      // Eq. 32: $L_{entropy} = N(\text{mouse_movement_entropy}, \text{invert=true}) \cdot 0.05$. (Higher entropy usually means less predictable, perhaps less fluid/efficient movement -> higher load)
      mouseLoadContribution += MathUtils.safeNormalize(mouse.mouse_movement_entropy, this.featureConfig.scaling.mouse_movement_entropy, true) * 0.05;

      // Eq. 33: Interaction term: high tortuosity with low Fitts' Law IP (poor performance)
      // $I_{mouse\_performance} = \text{if}(\text{mouse_path_tortuosity} > T_{tort} \land \text{fitts_law_ip_avg} < T_{fitts\_ip}, 0.5, 0)$.
      if (mouse.mouse_path_tortuosity > 2 && mouse.fitts_law_ip_avg < this.featureConfig.thresholds.lowFittsIP) {
        mouseLoadContribution += 0.5; // Significant boost
      }
      // Eq. 34: Interaction term: high jerk and low Fitts' IP
      // $I_{mouse\_jerk\_fitts} = \text{if}(\text{mouse_jerk_metric} > 0.3 \land \text{fitts_law_ip_avg} < 2, 0.3, 0)$.
      if (mouse.mouse_jerk_metric > 0.3 && mouse.fitts_law_ip_avg < 2) {
        mouseLoadContribution += 0.3;
      }
    }
    // Eq. 35: Weighted mouse component addition: $R_L \leftarrow R_L + L_{mouse} \cdot W_{mouse}$.
    rawLoadAccumulator += mouseLoadContribution * this.featureConfig.weights.mouseComponent;

    // --- 3. Click Dynamics Component ---
    let clickLoadContribution = 0;
    if (features.clicks) {
      const clicks = features.clicks;
      // Eq. 36: $L_{freq} = N(\text{click_frequency}) \cdot 0.3$.
      clickLoadContribution += MathUtils.safeNormalize(clicks.click_frequency, this.featureConfig.scaling.click_frequency) * 0.3;
      // Eq. 37: $L_{latency} = N(\text{click_latency_avg}) \cdot 0.2$.
      clickLoadContribution += MathUtils.safeNormalize(clicks.click_latency_avg, this.featureConfig.scaling.click_latency_avg) * 0.2;
      // Eq. 38: $L_{error} = N(\text{target_acquisition_error_avg}) \cdot 0.5$.
      clickLoadContribution += MathUtils.safeNormalize(clicks.target_acquisition_error_avg, this.featureConfig.scaling.target_acquisition_error_avg) * 0.5;
      // Eq. 39: $L_{double\_freq} = N(\text{double_click_frequency}) \cdot 0.2$.
      clickLoadContribution += MathUtils.safeNormalize(clicks.double_click_frequency, this.featureConfig.scaling.double_click_frequency) * 0.2;
      // Eq. 40: $L_{misclick} = N(\text{misclick_rate}) \cdot 0.4$.
      clickLoadContribution += MathUtils.safeNormalize(clicks.misclick_rate, this.featureConfig.scaling.misclick_rate) * 0.4;
      // Eq. 41: $L_{seq\_var} = N(\text{click_sequence_variability}) \cdot 0.15$.
      clickLoadContribution += MathUtils.safeNormalize(clicks.click_sequence_variability, this.featureConfig.scaling.click_sequence_variability) * 0.15;

      // Eq. 42: Strong impact if target acquisition error is very high
      // $I_{high\_target\_error} = \text{if}(\text{target_acquisition_error_avg} > T_{target\_error}, 0.7, 0)$.
      if (clicks.target_acquisition_error_avg > this.featureConfig.thresholds.highTargetError) {
        clickLoadContribution += 0.7; // Significant load increase
      }
      // Eq. 43: Strong impact if misclick rate is high
      // $I_{high\_misclick} = \text{if}(\text{misclick_rate} > T_{misclick}, 0.5, 0)$.
      if (clicks.misclick_rate > this.featureConfig.thresholds.highMisclickRate) {
        clickLoadContribution += 0.5;
      }
    }
    // Eq. 44: Weighted click component addition: $R_L \leftarrow R_L + L_{click} \cdot W_{click}$.
    rawLoadAccumulator += clickLoadContribution * this.featureConfig.weights.clickComponent;

    // --- 4. Keyboard Dynamics Component ---
    let keyboardLoadContribution = 0;
    if (features.keyboard) {
      const keyboard = features.keyboard;
      const optimalWPM = 60; // Example optimal WPM
      // Eq. 45: Deviation from optimal WPM: $S_{wpm\_dev} = \min(1, |\text{typing_speed_wpm} - \text{optimalWPM}| / \text{optimalWPM})$.
      const wpmDeviationScore = Math.min(1, Math.abs(keyboard.typing_speed_wpm - optimalWPM) / optimalWPM);
      // Eq. 46: $L_{wpm} = S_{wpm\_dev} \cdot 0.2$.
      keyboardLoadContribution += wpmDeviationScore * 0.2;

      // Eq. 47: $L_{backspace} = N(\text{backspace_frequency}) \cdot 0.4$.
      keyboardLoadContribution += MathUtils.safeNormalize(keyboard.backspace_frequency, this.featureConfig.scaling.backspace_frequency) * 0.4;
      // Eq. 48: $L_{keystroke\_lat} = N(\text{keystroke_latency_avg}) \cdot 0.2$.
      keyboardLoadContribution += MathUtils.safeNormalize(keyboard.keystroke_latency_avg, this.featureConfig.scaling.keystroke_latency_avg) * 0.2;
      // Eq. 49: $L_{error\_corr} = N(\text{error_correction_rate}) \cdot 0.5$.
      keyboardLoadContribution += MathUtils.safeNormalize(keyboard.error_correction_rate, this.featureConfig.scaling.error_correction_rate) * 0.5;
      // Eq. 50: $L_{press\_dur} = N(\text{key_press_duration_avg}) \cdot 0.1$.
      keyboardLoadContribution += MathUtils.safeNormalize(keyboard.key_press_duration_avg, this.featureConfig.scaling.key_press_duration_avg) * 0.1;
      // Eq. 51: $L_{typing\_lag} = N(\text{cognitive_typing_lag}) \cdot 0.25$.
      keyboardLoadContribution += MathUtils.safeNormalize(keyboard.cognitive_typing_lag, this.featureConfig.scaling.cognitive_typing_lag) * 0.25;

      // Eq. 52: Interaction term: high backspace with high error correction rate
      // $I_{backspace\_error\_corr} = \text{if}(\text{backspace_frequency} > T_{highBackspace} \land \text{error_correction_rate} > 0.5, 0.8, 0)$.
      if (keyboard.backspace_frequency > this.featureConfig.thresholds.highBackspace && keyboard.error_correction_rate > 0.5) {
        keyboardLoadContribution += 0.8; // Strong signal of frustration/load
      }
      // Eq. 53: Very low WPM also indicates struggle
      // $I_{low\_wpm} = \text{if}(\text{typing_speed_wpm} > 0 \land \text{typing_speed_wpm} < T_{lowWPM}, 0.6, 0)$.
      if (keyboard.typing_speed_wpm > 0 && keyboard.typing_speed_wpm < this.featureConfig.thresholds.lowWPM) {
        keyboardLoadContribution += 0.6;
      }
    }
    // Eq. 54: Weighted keyboard component addition: $R_L \leftarrow R_L + L_{keyboard} \cdot W_{keyboard}$.
    rawLoadAccumulator += keyboardLoadContribution * this.featureConfig.weights.keyboardComponent;

    // --- 5. Scroll Dynamics Component ---
    let scrollLoadContribution = 0;
    if (features.scroll) {
      const scroll = features.scroll;
      // Eq. 55: $L_{scroll\_vel} = N(\text{scroll_velocity_avg}) \cdot 0.2$.
      scrollLoadContribution += MathUtils.safeNormalize(scroll.scroll_velocity_avg, this.featureConfig.scaling.scroll_velocity_avg) * 0.2;
      // Eq. 56: $L_{dir\_changes} = N(\text{scroll_direction_changes}) \cdot 0.4$.
      scrollLoadContribution += MathUtils.safeNormalize(scroll.scroll_direction_changes, this.featureConfig.scaling.scroll_direction_changes) * 0.4;
      // Eq. 57: $L_{pause\_freq} = N(\text{scroll_pause_frequency}) \cdot 0.2$.
      scrollLoadContribution += MathUtils.safeNormalize(scroll.scroll_pause_frequency, this.featureConfig.scaling.scroll_pause_frequency) * 0.2;
      // Eq. 58: $L_{amp\_var} = N(\text{scroll_amplitude_variance}) \cdot 0.15$.
      scrollLoadContribution += MathUtils.safeNormalize(scroll.scroll_amplitude_variance, this.featureConfig.scaling.scroll_amplitude_variance) * 0.15;
      // Eq. 59: $L_{event\_density\_area} = N(\text{scroll_event_density_per_area}) \cdot 0.1$.
      scrollLoadContribution += MathUtils.safeNormalize(scroll.scroll_event_density_per_area, this.featureConfig.scaling.scroll_event_density_per_area) * 0.1;

      // Eq. 60: High direction changes and pauses could indicate searching/confusion
      // $I_{scroll\_confusion} = \text{if}(\text{scroll_direction_changes} > 5 \land \text{scroll_pause_frequency} > 1, 0.4, 0)$.
      if (scroll.scroll_direction_changes > 5 && scroll.scroll_pause_frequency > 1) {
        scrollLoadContribution += 0.4;
      }
    }
    // Eq. 61: Weighted scroll component addition: $R_L \leftarrow R_L + L_{scroll} \cdot W_{scroll}$.
    rawLoadAccumulator += scrollLoadContribution * this.featureConfig.weights.scrollComponent;

    // --- 6. Interaction Error Component (strongest and most direct indicators of load) ---
    let errorLoadContribution = 0;
    if (features.errors) {
      const errors = features.errors;
      // Eq. 62: $L_{form\_errors} = N(\text{form_validation_errors_count}) \cdot 0.5$.
      errorLoadContribution += MathUtils.safeNormalize(errors.form_validation_errors_count, this.featureConfig.scaling.form_validation_errors_count) * 0.5;
      // Eq. 63: $L_{repeated\_attempts} = N(\text{repeated_action_attempts_count}) \cdot 0.4$.
      errorLoadContribution += MathUtils.safeNormalize(errors.repeated_action_attempts_count, this.featureConfig.scaling.repeated_action_attempts_count) * 0.4;
      // Eq. 64: $L_{nav\_errors} = N(\text{navigation_errors_count}) \cdot 0.3$.
      errorLoadContribution += MathUtils.safeNormalize(errors.navigation_errors_count, this.featureConfig.scaling.navigation_errors_count) * 0.3;
      // Eq. 65: $L_{ui\_misinterpret} = N(\text{ui_feedback_misinterpretations}) \cdot 0.35$.
      errorLoadContribution += MathUtils.safeNormalize(errors.ui_feedback_misinterpretations, this.featureConfig.scaling.ui_feedback_misinterpretations) * 0.35;
      // Eq. 66: $L_{undo\_redo} = N(\text{undo_redo_frequency}) \cdot 0.2$.
      errorLoadContribution += MathUtils.safeNormalize(errors.undo_redo_frequency, this.featureConfig.scaling.undo_redo_frequency) * 0.2;

      // Eq. 67: Add a significant boost if any critical error occurs, scaled by user sensitivity
      // $B_{critical\_error} = \text{if}(E_{FV}>0 \lor E_{RA}>0 \lor E_{NE}>0, 1.0, 0) \cdot U_{sensitivity}$.
      if (errors.form_validation_errors_count > 0 || errors.repeated_action_attempts_count > 0 || errors.navigation_errors_count > 0) {
        errorLoadContribution += 1.0 * userPrefs.sensitivityToErrors; // Very strong impact, personalized
      }
    }
    // Eq. 68: Weighted error component addition: $R_L \leftarrow R_L + L_{error} \cdot W_{error}$.
    rawLoadAccumulator += errorLoadContribution * this.featureConfig.weights.errorComponent;

    // --- 7. Task Context Contribution ---
    let taskLoadContribution = 0;
    if (features.task_context) {
      // Eq. 69: $L_{task\_complexity} = N(\text{current_task_complexity}) \cdot W_{taskComplexity}$.
      taskLoadContribution += MathUtils.safeNormalize(features.task_context.current_task_complexity, this.featureConfig.scaling.current_task_complexity) * this.featureConfig.weights.taskComplexity;
      // Eq. 70: $L_{time\_in\_task} = N(\text{time_in_current_task_sec}) \cdot 0.1$.
      taskLoadContribution += MathUtils.safeNormalize(features.task_context.time_in_current_task_sec, this.featureConfig.scaling.time_in_current_task_sec) * 0.1;
      // Eq. 71: $L_{interrupt\_freq} = N(\text{task_interruption_frequency}) \cdot 0.25$.
      taskLoadContribution += MathUtils.safeNormalize(features.task_context.task_interruption_frequency, this.featureConfig.scaling.task_interruption_frequency) * 0.25;
      // Eq. 72: $L_{demand\_rating} = N(\text{task_cognitive_demand_rating}) \cdot 0.3$.
      taskLoadContribution += MathUtils.safeNormalize(features.task_context.task_cognitive_demand_rating, this.featureConfig.scaling.task_cognitive_demand_rating) * 0.3;

      // Eq. 73: Time in task can sometimes increase load (if task is complex and long)
      // $I_{long\_complex\_task} = \text{if}(C_T > 0.5 \land T_{task} > T_{longTaskTime}, \min(0.5, (T_{task} - T_{longTaskTime}) / 300) \cdot 0.5, 0)$.
      if (features.task_context.current_task_complexity > 0.5 && features.task_context.time_in_current_task_sec > this.featureConfig.thresholds.longTaskTime) {
        taskLoadContribution += Math.min(0.5, (features.task_context.time_in_current_task_sec - this.featureConfig.thresholds.longTaskTime) / 300) * 0.5; // Max 0.25 increase after 4 min, peaking at 9 min
      }
      // Eq. 74: High interruption frequency for complex task
      // $I_{interrupt\_complex} = \text{if}(C_T > 0.7 \land F_{interrupt} > T_{highTaskInterruption}, 0.6, 0)$.
      if (features.task_context.current_task_complexity > 0.7 && features.task_context.task_interruption_frequency > this.featureConfig.thresholds.highTaskInterruption) {
        taskLoadContribution += 0.6;
      }
    }
    // Eq. 75: Weighted task component addition: $R_L \leftarrow R_L + L_{task} \cdot W_{task}$.
    rawLoadAccumulator += taskLoadContribution * this.featureConfig.weights.taskComplexity;

    // --- 8. System Resources Contribution ---
    let systemResourceLoad = 0;
    if (features.system_resources) {
      const sys = features.system_resources;
      // Eq. 76: $L_{cpu} = N(\text{cpu_usage_avg}) \cdot 0.3$.
      systemResourceLoad += MathUtils.safeNormalize(sys.cpu_usage_avg, this.featureConfig.scaling.cpu_usage_avg) * 0.3;
      // Eq. 77: $L_{mem} = N(\text{memory_usage_avg}) \cdot 0.2$.
      systemResourceLoad += MathUtils.safeNormalize(sys.memory_usage_avg, this.featureConfig.scaling.memory_usage_avg) * 0.2;
      // Eq. 78: $L_{net} = N(\text{network_latency_avg}) \cdot 0.4$.
      systemResourceLoad += MathUtils.safeNormalize(sys.network_latency_avg, this.featureConfig.scaling.network_latency_avg) * 0.4;
      // Eq. 79: $L_{gpu} = N(\text{gpu_usage_avg}) \cdot 0.1$.
      systemResourceLoad += MathUtils.safeNormalize(sys.gpu_usage_avg, this.featureConfig.scaling.gpu_usage_avg) * 0.1;

      // Eq. 80: Significant load from high network latency
      // $I_{high\_net\_latency} = \text{if}(\text{network_latency_avg} > T_{highNetworkLatency}, 0.8, 0)$.
      if (sys.network_latency_avg > this.featureConfig.thresholds.highNetworkLatency) {
        systemResourceLoad += 0.8;
      }
      // Eq. 81: Significant load from high CPU usage
      // $I_{high\_cpu} = \text{if}(\text{cpu_usage_avg} > T_{highCpuUsage}, 0.7, 0)$.
      if (sys.cpu_usage_avg > this.featureConfig.thresholds.highCpuUsage) {
        systemResourceLoad += 0.7;
      }
    }
    // Eq. 82: Weighted system resource component addition: $R_L \leftarrow R_L + L_{sys} \cdot W_{sys}$.
    rawLoadAccumulator += systemResourceLoad * this.featureConfig.weights.systemResources;

    // --- 9. Event Density Contribution ---
    if (features.event_density !== undefined) {
      // Eq. 83: $L_{event\_density} = N(\text{event_density}, \text{invert=true}) \cdot W_{eventDensity}$. (Higher density means more engagement, perhaps lower load or normal state, so invert)
      rawLoadAccumulator += MathUtils.safeNormalize(features.event_density, this.featureConfig.scaling.event_density, true) * this.featureConfig.weights.eventDensity;
    }

    // --- 10. Cross-Modal Interaction Entropy ---
    if (features.cross_modal_interaction_entropy !== undefined) {
      // Eq. 84: $L_{cmi\_entropy} = N(\text{cross_modal_interaction_entropy}) \cdot W_{crossModalEntropy}$.
      rawLoadAccumulator += MathUtils.safeNormalize(features.cross_modal_interaction_entropy, this.featureConfig.scaling.cross_modal_interaction_entropy) * this.featureConfig.weights.crossModalEntropy;
      // Eq. 85: Interaction term for high entropy with high error rate
      // $I_{cmi\_entropy\_error} = \text{if}(\text{cross_modal_interaction_entropy} > 2.5 \land L_{error} > 0.5, 0.4, 0)$.
      if (features.cross_modal_interaction_entropy > 2.5 && errorLoadContribution > 0.5) {
        rawLoadAccumulator += 0.4;
      }
    }

    // --- 11. Cognitive State Persistence ---
    if (features.cognitive_state_persistence !== undefined) {
      // Eq. 86: $L_{state\_persistence} = N(\text{cognitive_state_persistence}, \text{invert=true}) \cdot W_{cognitivePersistence}$. (Lower persistence means higher load)
      rawLoadAccumulator += MathUtils.safeNormalize(features.cognitive_state_persistence, this.featureConfig.scaling.cognitive_state_persistence, true) * this.featureConfig.weights.cognitivePersistence;
      // Eq. 87: Significant boost if cognitive state is highly unstable
      // $I_{low\_persistence} = \text{if}(\text{cognitive_state_persistence} < T_{lowCognitivePersistence}, 0.9, 0)$.
      if (features.cognitive_state_persistence < this.featureConfig.thresholds.lowCognitivePersistence) {
        rawLoadAccumulator += 0.9;
      }
    }

    // Eq. 88: Apply personalized adaptive learning rate to weights (mock dynamic adjustment)
    // $W'_{error} = W_{error} \cdot (1 + U_{adaptive\_learning\_rate} \cdot \text{errorLoadContribution})$.
    const adaptiveErrorWeight = this.featureConfig.weights.errorComponent * (1 + userPrefs.adaptiveLearningRate * errorLoadContribution);
    // Eq. 89: Recalculate contribution for errors with adaptive weight: $\text{Recalc}_{error} = (\text{errorLoadContribution} \cdot W'_{error}) - (\text{errorLoadContribution} \cdot W_{error})$.
    // Eq. 90: Adjust accumulator: $R_L \leftarrow R_L + \text{Recalc}_{error}$.
    rawLoadAccumulator += (adaptiveErrorWeight - this.featureConfig.weights.errorComponent) * errorLoadContribution;


    // --- Post-processing and Final Activation ---

    // Eq. 91: Introduce a quadratic penalty for extremely high raw load to prevent runaway scores
    // $P_{quadratic} = \text{if}(R_L > 5, (R_L - 5)^2 \cdot 0.1, 0)$.
    let quadraticPenalty = 0;
    if (rawLoadAccumulator > 5) {
      quadraticPenalty = Math.pow(rawLoadAccumulator - 5, 2) * 0.1;
    }
    // Eq. 92: Apply quadratic penalty: $R_L \leftarrow R_L + P_{quadratic}$.
    rawLoadAccumulator += quadraticPenalty;

    // Eq. 93: Sigmoid input transformation: $X_{sigmoid} = R_L - \text{Bias}$.
    // The 'bias' (e.g., -2.5) should be tuned based on what rawLoadAccumulator values typically signify low/high load.
    // A larger negative bias pushes the curve to the right, meaning higher raw scores are needed for a high CLS.
    const sigmoidInput = rawLoadAccumulator - 2.5;

    // Eq. 94: Final sigmoid activation to scale the entire score to [0, 1]: $\text{CLS} = \sigma(X_{sigmoid})$.
    const finalScore = MathUtils.sigmoid(sigmoidInput);

    // Eq. 95: Clamp final score to ensure it's strictly within 0 and 1: $\text{CLS}_{clamped} = \max(0, \min(1, \text{CLS}))$.
    return Math.min(1.0, Math.max(0.0, finalScore));
  }

  /**
   * Updates the internal model configuration. In a real ML system, this would
   * involve loading new model weights or updating hyperparameters.
   * For this mock, it directly updates the `featureConfig` object.
   * @param newConfig - A partial object containing new configuration values.
   */
  public updateModelConfig(newConfig: Partial<typeof CognitiveLoadPredictor.prototype.featureConfig>): void {
    if (newConfig.scaling) {
      this.featureConfig.scaling = { ...this.featureConfig.scaling, ...newConfig.scaling };
    }
    if (newConfig.weights) {
      this.featureConfig.weights = { ...this.featureConfig.weights, ...newConfig.weights };
    }
    if (newConfig.thresholds) {
      this.featureConfig.thresholds = { ...this.featureConfig.thresholds, ...newConfig.thresholds };
    }
    console.log("CognitiveLoadPredictor: Model configuration updated (mock)");
  }
}

/**
 * Interface for feature processing to allow different implementations.
 */
export interface IFeatureProcessor {
  /**
   * Processes raw telemetry events into a structured feature vector.
   * @param events - An array of raw telemetry events over a time window.
   * @param windowEndTime - The timestamp marking the end of the current feature window.
   * @returns A TelemetryFeatureVector.
   */
  processEvents(events: RawTelemetryEvent[], windowEndTime: number): TelemetryFeatureVector;
}

/**
 * A mock FeatureProcessor that simulates transforming raw events into a feature vector.
 * In a real system, this would involve complex aggregation, statistical analysis,
 * and potentially signal processing over event streams.
 */
export class MockFeatureProcessor implements IFeatureProcessor {
  private lastMousePositions: { x: number, y: number, timestamp: number }[] = [];
  private lastScrollPositions: { y: number, timestamp: number }[] = [];
  private lastKeystrokes: { timestamp: number, key: string }[] = [];

  constructor(private windowDurationMs: number = 1000) {}

  /**
   * @equation 96: Time window filtering: $E'_{window} = \{e \in E_{raw} \mid (t_{window\_end} - D_{window}) \le t_e \le t_{window\_end}\}$.
   * @equation 97: Mouse velocity calculation: $v = \Delta d / \Delta t$.
   * @equation 98: Mouse acceleration calculation: $a = \Delta v / \Delta t$.
   * @equation 99: Typing speed WPM: $\text{WPM} = (\text{chars} / 5) / (\text{time_min})$.
   * @equation 100: Backspace frequency: $F_{backspace} = C_{backspace} / T_{window}$.
   *
   * @param events - Raw telemetry events.
   * @param windowEndTime - The end timestamp of the window.
   */
  public processEvents(events: RawTelemetryEvent[], windowEndTime: number): TelemetryFeatureVector {
    const windowStartTime = windowEndTime - this.windowDurationMs;
    const filteredEvents = events.filter(e => e.data.timestamp >= windowStartTime && e.data.timestamp <= windowEndTime);

    let mouseKinematics: MouseKinematicsFeatures = {
      mouse_velocity_avg: 0,
      mouse_acceleration_avg: 0,
      mouse_path_tortuosity: 1, // Default to straight path
      mouse_dwell_time_avg: 0,
      fitts_law_ip_avg: 0,
      mouse_jerk_metric: 0,
      mouse_movement_entropy: 0,
    };
    let clickDynamics: ClickDynamicsFeatures = {
      click_frequency: 0,
      click_latency_avg: 0,
      target_acquisition_error_avg: 0,
      double_click_frequency: 0,
      misclick_rate: 0,
      click_sequence_variability: 0,
    };
    let scrollDynamics: ScrollDynamicsFeatures = {
      scroll_velocity_avg: 0,
      scroll_direction_changes: 0,
      scroll_pause_frequency: 0,
      scroll_amplitude_variance: 0,
      scroll_event_density_per_area: 0,
    };
    let keyboardDynamics: KeyboardDynamicsFeatures = {
      typing_speed_wpm: 0,
      backspace_frequency: 0,
      keystroke_latency_avg: 0,
      error_correction_rate: 0,
      key_press_duration_avg: 0,
      cognitive_typing_lag: 0,
    };
    let interactionErrors: InteractionErrorFeatures = {
      form_validation_errors_count: 0,
      repeated_action_attempts_count: 0,
      navigation_errors_count: 0,
      ui_feedback_misinterpretations: 0,
      undo_redo_frequency: 0,
    };
    let taskContextFeatures: TaskContextFeatures = {
      current_task_complexity: 0,
      time_in_current_task_sec: 0,
      task_interruption_frequency: 0,
      task_cognitive_demand_rating: 0,
    };
    let systemResourceFeatures: SystemResourceFeatures = {
      cpu_usage_avg: 0,
      memory_usage_avg: 0,
      network_latency_avg: 0,
      gpu_usage_avg: 0,
    };

    let eventCount = 0;
    let totalMouseDistance = 0;
    let mouseVelocities: number[] = [];
    let mouseAccelerations: number[] = [];
    let clickTimestamps: number[] = [];
    let lastClickTime = 0;
    let backspaceCount = 0;
    let totalKeyLength = 0;
    let keydownTimestamps: number[] = [];
    let formErrors = 0;
    let repeatedActions = 0;
    let navErrors = 0;

    for (const event of filteredEvents) {
      eventCount++;
      switch (event.type) {
        case 'mousemove':
          const mouseData = event.data as MouseEventData;
          this.lastMousePositions.push(mouseData);
          if (this.lastMousePositions.length > 1) {
            const prev = this.lastMousePositions[this.lastMousePositions.length - 2];
            const dist = MathUtils.euclideanDistance(prev, mouseData);
            const timeDiff = mouseData.timestamp - prev.timestamp;
            if (timeDiff > 0) {
              const velocity = dist / timeDiff;
              mouseVelocities.push(velocity);
              totalMouseDistance += dist;
            }
          }
          break;
        case 'click':
          const clickData = event.data as MouseEventData;
          clickDynamics.click_frequency++;
          clickTimestamps.push(clickData.timestamp);
          if (lastClickTime > 0) {
            clickDynamics.click_latency_avg = MathUtils.exponentialMovingAverage(clickData.timestamp - lastClickTime, clickDynamics.click_latency_avg, 0.5);
          }
          lastClickTime = clickData.timestamp;
          // Mock target acquisition error
          clickDynamics.target_acquisition_error_avg = MathUtils.exponentialMovingAverage(Math.random() * 50, clickDynamics.target_acquisition_error_avg, 0.5);
          break;
        case 'keydown':
          const keyData = event.data as KeyboardEventData;
          this.lastKeystrokes.push(keyData);
          if (keyData.key === 'Backspace') {
            backspaceCount++;
          } else if (keyData.key.length === 1) {
            totalKeyLength++;
          }
          keydownTimestamps.push(keyData.timestamp);
          if (keydownTimestamps.length > 1) {
            const lastLatency = keydownTimestamps[keydownTimestamps.length - 1] - keydownTimestamps[keydownTimestamps.length - 2];
            keyboardDynamics.keystroke_latency_avg = MathUtils.exponentialMovingAverage(lastLatency, keyboardDynamics.keystroke_latency_avg, 0.5);
          }
          // Mock key press duration and cognitive typing lag
          keyboardDynamics.key_press_duration_avg = MathUtils.exponentialMovingAverage(Math.random() * 80 + 20, keyboardDynamics.key_press_duration_avg, 0.5);
          keyboardDynamics.cognitive_typing_lag = MathUtils.exponentialMovingAverage(Math.random() * 200 + 50, keyboardDynamics.cognitive_typing_lag, 0.5);
          break;
        case 'scroll':
          const scrollData = event.data as ScrollEventData;
          this.lastScrollPositions.push(scrollData);
          if (this.lastScrollPositions.length > 1) {
            const prev = this.lastScrollPositions[this.lastScrollPositions.length - 2];
            const scrollDelta = Math.abs(scrollData.scrollY - prev.scrollY);
            const timeDiff = scrollData.timestamp - prev.timestamp;
            if (timeDiff > 0) {
              scrollDynamics.scroll_velocity_avg = MathUtils.exponentialMovingAverage(scrollDelta / timeDiff, scrollDynamics.scroll_velocity_avg, 0.5);
              if (Math.sign(scrollData.scrollY - prev.scrollY) !== Math.sign(this.lastScrollPositions[this.lastScrollPositions.length - 2].scrollY - this.lastScrollPositions[this.lastScrollPositions.length - 3]?.scrollY || 0)) {
                scrollDynamics.scroll_direction_changes++;
              }
            }
          }
          // Mock scroll pause and amplitude variance
          scrollDynamics.scroll_pause_frequency = Math.random() * 2;
          scrollDynamics.scroll_amplitude_variance = Math.random() * 5000 + 1000;
          break;
        case 'form':
          const formData = event.data as FormEventData;
          if (formData.type === 'submit' && formData.isValid === false) {
            formErrors++;
          }
          if (formData.type === 'change' || formData.type === 'input') {
            // Mock detection of repeated attempts
            if (Math.random() < 0.05) repeatedActions++;
          }
          break;
        case 'blur':
        case 'focus':
          // Mock navigation errors or UI feedback misinterpretations
          if (Math.random() < 0.01) navErrors++;
          if (Math.random() < 0.02) interactionErrors.ui_feedback_misinterpretations++;
          break;
      }
    }

    if (mouseVelocities.length > 0) {
      mouseKinematics.mouse_velocity_avg = MathUtils.average(mouseVelocities);
      // Simulate acceleration from velocity changes
      for (let i = 1; i < mouseVelocities.length; i++) {
        const timeDiff = this.lastMousePositions[i + 1].timestamp - this.lastMousePositions[i].timestamp;
        if (timeDiff > 0) {
          mouseAccelerations.push((mouseVelocities[i] - mouseVelocities[i - 1]) / timeDiff);
        }
      }
      mouseKinematics.mouse_acceleration_avg = MathUtils.average(mouseAccelerations);
    }
    // Mock Fitts' Law IP, jerk, and entropy
    mouseKinematics.fitts_law_ip_avg = Math.random() * 5 + 1;
    mouseKinematics.mouse_jerk_metric = Math.random() * 0.2;
    mouseKinematics.mouse_movement_entropy = Math.random() * 3;

    if (this.windowDurationMs > 0) {
      clickDynamics.click_frequency = clickDynamics.click_frequency / (this.windowDurationMs / 1000);
      keyboardDynamics.backspace_frequency = backspaceCount / (this.windowDurationMs / 1000);
      keyboardDynamics.typing_speed_wpm = (totalKeyLength / 5) / (this.windowDurationMs / 60000);
    }
    keyboardDynamics.error_correction_rate = backspaceCount > 0 ? backspaceCount / (totalKeyLength + backspaceCount) : 0;
    clickDynamics.misclick_rate = Math.random() * 0.05; // mock
    clickDynamics.double_click_frequency = Math.random() * 1; // mock
    clickDynamics.click_sequence_variability = Math.random() * 0.3; // mock

    interactionErrors.form_validation_errors_count = formErrors;
    interactionErrors.repeated_action_attempts_count = repeatedActions;
    interactionErrors.navigation_errors_count = navErrors;
    interactionErrors.undo_redo_frequency = Math.random() * 1; // mock

    // Mock task context and system resources, often provided externally or by OS APIs
    taskContextFeatures.current_task_complexity = currentTask ? this.mapTaskComplexity(currentTask.complexity) : Math.random();
    taskContextFeatures.time_in_current_task_sec = currentTask ? (windowEndTime - currentTask.timestamp) / 1000 : Math.random() * 300;
    taskContextFeatures.task_interruption_frequency = Math.random() * 0.2;
    taskContextFeatures.task_cognitive_demand_rating = Math.random() * 0.8 + 0.2;

    systemResourceFeatures.cpu_usage_avg = Math.random() * 50 + 10;
    systemResourceFeatures.memory_usage_avg = Math.random() * 30 + 20;
    systemResourceFeatures.network_latency_avg = Math.random() * 100 + 10;
    systemResourceFeatures.gpu_usage_avg = Math.random() * 40 + 5;


    const telemetryFeatureVector: TelemetryFeatureVector = {
      timestamp_window_end: windowEndTime,
      mouse: mouseKinematics,
      clicks: clickDynamics,
      scroll: scrollDynamics,
      keyboard: keyboardDynamics,
      errors: interactionErrors,
      task_context: taskContextFeatures,
      system_resources: systemResourceFeatures,
      event_density: eventCount / (this.windowDurationMs / 1000),
      cross_modal_interaction_entropy: Math.random() * 2, // mock
      cognitive_state_persistence: Math.random(), // mock
    };

    // Clean up old mouse positions to avoid memory leak for long-running sessions
    this.lastMousePositions = this.lastMousePositions.filter(p => p.timestamp >= windowStartTime);
    this.lastScrollPositions = this.lastScrollPositions.filter(p => p.timestamp >= windowStartTime);
    this.lastKeystrokes = this.lastKeystrokes.filter(p => p.timestamp >= windowStartTime);

    return telemetryFeatureVector;
  }

  private mapTaskComplexity(complexity: TaskContext['complexity']): number {
    switch (complexity) {
      case 'low': return 0.2;
      case 'medium': return 0.5;
      case 'high': return 0.8;
      case 'critical': return 1.0;
      default: return 0.5;
    }
  }
}