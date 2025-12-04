import React, { useState, useEffect, useCallback, useReducer, createContext, useContext } from 'react';

// --- Global Type Definitions and Interfaces (START) ---

/**
 * @typedef {string} SystemIdentifier - A unique string identifier for a chaotic system.
 * @typedef {string} UserIdentifier - A unique string identifier for a user.
 * @typedef {string} Timestamp - ISO 8601 formatted string for date and time.
 * @typedef {string} ScenarioIdentifier - A unique identifier for a simulation scenario.
 * @typedef {string} SimulationRunIdentifier - A unique identifier for a specific simulation execution.
 * @typedef {string} ModelVersion - A string indicating the version of a mathematical model used.
 */
export type SystemIdentifier = string;
export type UserIdentifier = string;
export type Timestamp = string;
export type ScenarioIdentifier = string;
export type SimulationRunIdentifier = string;
export type ModelVersion = string;

/**
 * Represents a single point of leverage within a chaotic system.
 * This interface has been significantly expanded to include more detail
 * necessary for real-world application, such as impact metrics,
 * reversibility, and associated risks.
 */
export interface LeveragePoint {
  /** A unique identifier for this leverage point. */
  id: string;
  /** A clear, actionable description of the intervention. */
  action: string;
  /** Estimated monetary cost of implementing the action. */
  cost: string;
  /** The probability (0-1) of achieving the desired outcome. */
  outcomeProbability: number;
  /** The estimated time frame from implementation to observable impact. */
  timeToImpact: string;
  /** A more detailed qualitative description of the action and its mechanism. */
  description: string;
  /** Potential positive secondary effects beyond the primary goal. */
  positiveSideEffects: string[];
  /** Potential negative unintended consequences. */
  negativeSideEffects: string[];
  /** The estimated magnitude of the desired impact (e.g., "5% increase"). */
  impactMagnitude: string;
  /** A confidence score (0-1) in the accuracy of the prediction for this leverage point. */
  predictionConfidence: number;
  /** The estimated effort required to implement the action (e.g., "Low", "Medium", "High", "Very High"). */
  implementationEffort: 'Low' | 'Medium' | 'High' | 'Very High';
  /** Indicates if the action is easily reversible if unintended consequences occur. */
  reversibility: 'High' | 'Medium' | 'Low' | 'Irreversible';
  /** Associated risks, categorized (e.g., financial, ecological, social). */
  risks: { category: string; severity: 'Low' | 'Medium' | 'High'; description: string }[];
  /** A list of necessary resources for implementation. */
  requiredResources: string[];
  /** Key stakeholders who would be affected or need to be involved. */
  stakeholders: { name: string; role: string; influence: 'Low' | 'Medium' | 'High' }[];
  /** Historical success rate of similar interventions, if available. */
  historicalSuccessRate?: number;
  /** Last updated timestamp for this leverage point analysis. */
  lastUpdated: Timestamp;
}

/**
 * Defines a parameter within a chaotic system, including its properties and ranges.
 */
export interface SystemParameter {
  /** Unique identifier for the parameter. */
  id: string;
  /** Display name of the parameter. */
  name: string;
  /** A brief description of what the parameter represents. */
  description: string;
  /** The current value of the parameter. */
  currentValue: number;
  /** The unit of measurement for the parameter (e.g., "Celsius", "ppm", "%). */
  unit: string;
  /** The minimum plausible value for the parameter. */
  minValue: number;
  /** The maximum plausible value for the parameter. */
  maxValue: number;
  /** Step size for UI controls or simulation increments. */
  step: number;
  /** Indicates if this parameter is a potential leverage point. */
  isLeverageCandidate: boolean;
  /** Data type of the parameter (e.g., 'number', 'boolean', 'enum'). */
  dataType: 'number' | 'boolean' | 'string' | 'enum';
  /** If dataType is 'enum', possible string values. */
  enumValues?: string[];
  /** A list of parameter dependencies. */
  dependencies?: { parameterId: string; type: 'influences' | 'is-influenced-by' }[];
}

/**
 * Represents an observable metric or output from the chaotic system.
 */
export interface SystemMetric {
  /** Unique identifier for the metric. */
  id: string;
  /** Display name of the metric. */
  name: string;
  /** A brief description of the metric. */
  description: string;
  /** The current observed value of the metric. */
  currentValue: number | string | boolean;
  /** The unit of measurement for the metric. */
  unit: string;
  /** The desired target range or value for this metric. */
  target?: { min?: number; max?: number; value?: number; unit: string };
  /** A history of values for this metric over time. */
  history: { timestamp: Timestamp; value: number | string | boolean }[];
  /** Thresholds for alerts (e.g., warning, critical). */
  alertThresholds?: {
    warning?: { operator: '>' | '<' | '=' | '!='; value: number | string };
    critical?: { operator: '>' | '<' | '=' | '!='; value: number | string };
  };
}

/**
 * Defines a specific feedback loop within the chaotic system.
 */
export interface FeedbackLoop {
  /** Unique identifier for the feedback loop. */
  id: string;
  /** Name of the feedback loop. */
  name: string;
  /** A description of the loop's mechanism. */
  description: string;
  /** Type of feedback: 'positive' (amplifying) or 'negative' (dampening). */
  type: 'positive' | 'negative';
  /** Source parameter/metric influencing the loop. */
  sourceId: string;
  /** Target parameter/metric influenced by the loop. */
  targetId: string;
  /** Strength of the feedback loop (e.g., a multiplier or impact factor). */
  strength: number;
  /** Delay in impact propagation for this loop (e.g., "1 week", "3 months"). */
  delay: string;
}

/**
 * Represents a complete definition of a chaotic system.
 * This includes its parameters, metrics, and feedback loops,
 * making it a robust model for analysis and simulation.
 */
export interface ChaoticSystemDefinition {
  /** Unique identifier for this system definition. */
  id: SystemIdentifier;
  /** User-defined name for the system (e.g., "Central Valley Rainfall System"). */
  name: string;
  /** A detailed description of the system and its boundaries. */
  description: string;
  /** Date and time when the system definition was created. */
  createdAt: Timestamp;
  /** Date and time when the system definition was last modified. */
  lastModified: Timestamp;
  /** Identifier of the user who owns/created this system definition. */
  ownerId: UserIdentifier;
  /** A list of parameters that define the state and behavior of the system. */
  parameters: SystemParameter[];
  /** A list of observable metrics derived from the system. */
  metrics: SystemMetric[];
  /** A list of identified feedback loops within the system. */
  feedbackLoops: FeedbackLoop[];
  /** Current status of the system (e.g., 'Active', 'Archived', 'Draft'). */
  status: 'Active' | 'Archived' | 'Draft' | 'Under Review';
  /** Versioning of the system definition schema. */
  schemaVersion: string;
  /** Tags for categorization or search. */
  tags: string[];
  /** Geographical or contextual scope of the system. */
  scope: string;
  /** External data sources used for this system (e.g., weather APIs, economic indicators). */
  externalDataSources: { name: string; url: string; lastSync: Timestamp }[];
  /** Access control settings for this system. */
  accessControl: {
    public: boolean;
    sharedWithUsers: UserIdentifier[];
    sharedWithGroups: string[];
  };
  /** Reference to the mathematical model used for simulation. */
  simulationModelRef: string;
  /** Model version used. */
  modelVersion: ModelVersion;
}

/**
 * Represents a single simulation run of a chaotic system.
 */
export interface SimulationRun {
  /** Unique identifier for this simulation run. */
  id: SimulationRunIdentifier;
  /** Identifier of the chaotic system definition used for this run. */
  systemId: SystemIdentifier;
  /** Identifier of the user who initiated the simulation. */
  initiatedBy: UserIdentifier;
  /** Timestamp when the simulation started. */
  startTime: Timestamp;
  /** Timestamp when the simulation finished. */
  endTime?: Timestamp;
  /** Status of the simulation run. */
  status: 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Canceled';
  /** Initial conditions (parameter values) at the start of the simulation. */
  initialConditions: { parameterId: string; value: number | string | boolean }[];
  /** Applied leverage points for this simulation run. */
  appliedLeveragePoints: { leveragePointId: string; timestamp: Timestamp; details: string }[];
  /** Duration of the simulation in simulated time units (e.g., "365 days"). */
  simulatedDuration: string;
  /** Results of the simulation, typically time-series data for metrics. */
  results: {
    metricId: string;
    data: { timeStep: number; value: number | string | boolean }[];
  }[];
  /** Any warnings or errors encountered during the simulation. */
  logMessages: { timestamp: Timestamp; level: 'info' | 'warn' | 'error'; message: string }[];
  /** Configuration settings used for the simulation (e.g., step size, number of iterations). */
  configuration: {
    timeStepSize: string; // e.g., "1 hour", "1 day"
    iterations: number;
    stochasticityFactor: number; // 0-1, how much randomness to introduce
    seed?: number; // For reproducible stochastic simulations
  };
  /** Associated scenario, if applicable. */
  scenarioId?: ScenarioIdentifier;
  /** Performance metrics of the simulation itself. */
  performanceMetrics: {
    cpuUsage: number; // %
    memoryUsage: number; // MB
    realTimeDurationMs: number;
  };
  /** Version of the simulation engine used. */
  engineVersion: string;
}

/**
 * Represents a scenario for comparing different leverage points or system configurations.
 */
export interface SimulationScenario {
  /** Unique identifier for the scenario. */
  id: ScenarioIdentifier;
  /** Name of the scenario. */
  name: string;
  /** Description of the scenario's purpose. */
  description: string;
  /** Identifier of the base system definition for this scenario. */
  baseSystemId: SystemIdentifier;
  /** User who created the scenario. */
  createdBy: UserIdentifier;
  /** Creation timestamp. */
  createdAt: Timestamp;
  /** Last modification timestamp. */
  lastModified: Timestamp;
  /** List of simulation runs included in this scenario. */
  simulationRuns: SimulationRunIdentifier[];
  /** Proposed leverage points for this scenario. */
  proposedLeveragePoints: LeveragePoint[];
  /** Comparison metrics to evaluate scenario success. */
  comparisonMetrics: { metricId: string; targetValue?: number; targetRange?: [number, number]; priority: 'High' | 'Medium' | 'Low' }[];
  /** Status of the scenario (e.g., 'Draft', 'Active', 'Completed'). */
  status: 'Draft' | 'Active' | 'Completed' | 'Archived';
  /** Notes or conclusions from the scenario analysis. */
  notes: string;
  /** Files or documents associated with the scenario (e.g., reports). */
  attachments: { fileName: string; url: string; uploadedAt: Timestamp }[];
}

/**
 * Represents a user of the system.
 */
export interface UserProfile {
  id: UserIdentifier;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  roles: ('admin' | 'analyst' | 'viewer')[];
  lastLogin: Timestamp;
  preferences: UserPreferences;
}

/**
 * User-specific preferences for the application.
 */
export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
    alertOnCritical: boolean;
    alertOnWarning: boolean;
  };
  defaultSystemView: 'dashboard' | 'simulation' | 'leverage';
  timezone: string;
  dateFormat: string;
  measurementUnits: {
    temperature: 'celsius' | 'fahrenheit';
    rainfall: 'mm' | 'inches';
    cost: 'USD' | 'EUR' | 'GBP';
  };
}

/**
 * Represents an alert or notification generated by the system.
 */
export interface SystemAlert {
  id: string;
  systemId: SystemIdentifier;
  metricId?: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  timestamp: Timestamp;
  isRead: boolean;
  actionRequired: boolean;
  severity: 'low' | 'medium' | 'high';
  source: 'monitoring' | 'simulation' | 'user-activity';
  details: { [key: string]: any };
}

/**
 * Represents an entry in the system's audit log.
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Timestamp;
  userId: UserIdentifier;
  action: string; // e.g., "CREATE_SYSTEM", "UPDATE_PARAMETER", "RUN_SIMULATION"
  entityType: 'SystemDefinition' | 'LeveragePoint' | 'SimulationRun' | 'UserProfile' | 'Scenario';
  entityId: string;
  changes: { field: string; oldValue: any; newValue: any }[];
  ipAddress: string;
  userAgent: string;
}

/**
 * Represents a charting configuration for visualizing simulation results or metric history.
 */
export interface ChartConfig {
  id: string;
  name: string;
  chartType: 'line' | 'bar' | 'scatter' | 'area';
  metricsToShow: string[]; // Array of metric IDs
  parametersToShow?: string[]; // Array of parameter IDs
  xAxisLabel: string;
  yAxisLabel: string;
  title: string;
  colorScheme: string[]; // e.g., ['#FF6384', '#36A2EB']
  interpolation: 'linear' | 'spline' | 'step';
  showLegend: boolean;
  showTooltips: boolean;
  zoomEnabled: boolean;
  timeRange?: [Timestamp, Timestamp];
}

/**
 * Represents the overall application state managed by the context.
 */
export interface AppState {
  currentUser: UserProfile | null;
  currentSystemId: SystemIdentifier | null;
  systems: ChaoticSystemDefinition[];
  leveragePoints: LeveragePoint[];
  simulationRuns: SimulationRun[];
  scenarios: SimulationScenario[];
  alerts: SystemAlert[];
  auditLogs: AuditLogEntry[];
  isLoading: boolean;
  error: string | null;
  // UI-specific state
  activeTab: 'overview' | 'definition' | 'simulate' | 'scenarios' | 'monitor' | 'settings' | 'audit' | 'help' | 'leverage';
  showSystemDefinitionModal: boolean;
  showLeveragePointModal: boolean;
  showSimulationRunModal: boolean;
  editingSystemId: SystemIdentifier | null;
  editingLeveragePointId: string | null;
  editingScenarioId: ScenarioIdentifier | null;
}

/**
 * Defines the available actions for the AppReducer.
 */
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_USER'; payload: UserProfile | null }
  | { type: 'SET_CURRENT_SYSTEM'; payload: SystemIdentifier | null }
  | { type: 'ADD_SYSTEM'; payload: ChaoticSystemDefinition }
  | { type: 'UPDATE_SYSTEM'; payload: ChaoticSystemDefinition }
  | { type: 'DELETE_SYSTEM'; payload: SystemIdentifier }
  | { type: 'SET_SYSTEMS'; payload: ChaoticSystemDefinition[] }
  | { type: 'ADD_LEVERAGE_POINT'; payload: LeveragePoint }
  | { type: 'UPDATE_LEVERAGE_POINT'; payload: LeveragePoint }
  | { type: 'DELETE_LEVERAGE_POINT'; payload: string }
  | { type: 'SET_LEVERAGE_POINTS'; payload: LeveragePoint[] }
  | { type: 'ADD_SIMULATION_RUN'; payload: SimulationRun }
  | { type: 'UPDATE_SIMULATION_RUN'; payload: SimulationRun }
  | { type: 'DELETE_SIMULATION_RUN'; payload: SimulationRunIdentifier }
  | { type: 'SET_SIMULATION_RUNS'; payload: SimulationRun[] }
  | { type: 'ADD_SCENARIO'; payload: SimulationScenario }
  | { type: 'UPDATE_SCENARIO'; payload: SimulationScenario }
  | { type: 'DELETE_SCENARIO'; payload: ScenarioIdentifier }
  | { type: 'SET_SCENARIOS'; payload: SimulationScenario[] }
  | { type: 'ADD_ALERT'; payload: SystemAlert }
  | { type: 'MARK_ALERT_AS_READ'; payload: string }
  | { type: 'SET_ALERTS'; payload: SystemAlert[] }
  | { type: 'ADD_AUDIT_LOG_ENTRY'; payload: AuditLogEntry }
  | { type: 'SET_AUDIT_LOGS'; payload: AuditLogEntry[] }
  | { type: 'SET_ACTIVE_TAB'; payload: AppState['activeTab'] }
  | { type: 'SHOW_SYSTEM_DEFINITION_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_SYSTEM_ID'; payload: SystemIdentifier | null }
  | { type: 'SHOW_LEVERAGE_POINT_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_LEVERAGE_POINT_ID'; payload: string | null }
  | { type: 'SHOW_SIMULATION_RUN_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_SCENARIO_ID'; payload: ScenarioIdentifier | null };

// --- Global Type Definitions and Interfaces (END) ---

// --- Constants and Enums (START) ---

/**
 * Defines the roles a user can have within the application.
 */
export enum UserRole {
  Admin = 'admin',
  Analyst = 'analyst',
  Viewer = 'viewer',
}

/**
 * Defines common alert severity levels.
 */
export enum AlertSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

/**
 * Defines common notification types.
 */
export enum NotificationType {
  Email = 'email',
  InApp = 'inApp',
  SMS = 'sms',
}

/**
 * Defines the various data types for system parameters.
 */
export enum ParameterDataType {
  Number = 'number',
  Boolean = 'boolean',
  String = 'string',
  Enum = 'enum',
}

/**
 * Default values and configurations.
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'dark',
  notificationSettings: {
    email: true,
    inApp: true,
    sms: false,
    alertOnCritical: true,
    alertOnWarning: true,
  },
  defaultSystemView: 'dashboard',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  measurementUnits: {
    temperature: 'celsius',
    rainfall: 'mm',
    cost: 'USD',
  },
};

export const MOCK_ADMIN_USER: UserProfile = {
  id: 'user-001-admin',
  username: 'admin_user',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  organization: 'Chaos Corp',
  roles: [UserRole.Admin, UserRole.Analyst],
  lastLogin: new Date().toISOString(),
  preferences: DEFAULT_USER_PREFERENCES,
};

export const INITIAL_APP_STATE: AppState = {
  currentUser: MOCK_ADMIN_USER, // Start with a logged-in mock user
  currentSystemId: null,
  systems: [],
  leveragePoints: [],
  simulationRuns: [],
  scenarios: [],
  alerts: [],
  auditLogs: [],
  isLoading: false,
  error: null,
  activeTab: 'overview',
  showSystemDefinitionModal: false,
  showLeveragePointModal: false,
  showSimulationRunModal: false,
  editingSystemId: null,
  editingLeveragePointId: null,
  editingScenarioId: null,
};

// --- Constants and Enums (END) ---

// --- Utility Functions (START) ---

/**
 * Generates a unique ID (UUID-like string).
 * @returns {string} A unique identifier.
 */
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Formats a timestamp string into a more readable format.
 * @param {Timestamp} timestamp - The ISO 8601 timestamp string.
 * @param {string} format - Optional format string (e.g., "YYYY-MM-DD HH:mm").
 * @returns {string} The formatted date string.
 */
export const formatTimestamp = (timestamp: Timestamp, format: string = 'YYYY-MM-DD HH:mm'): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  let formatted = format
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);

  return formatted;
};

/**
 * Calculates the difference between two timestamps in a human-readable format.
 * @param {Timestamp} start - Start timestamp.
 * @param {Timestamp} end - End timestamp.
 * @returns {string} Human-readable duration (e.g., "2 hours 15 minutes").
 */
export const getDuration = (start: Timestamp, end: Timestamp): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs < 0) return 'Invalid duration';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 > 1 ? 's' : ''}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`);
  if (seconds % 60 > 0 && parts.length === 0) parts.push(`${seconds % 60} second${seconds % 60 > 1 ? 's' : ''}`); // Only show seconds if no larger unit

  return parts.length > 0 ? parts.join(' ') : 'Less than a second';
};

/**
 * Deep clones an object to prevent mutation issues.
 * @param {T} obj - The object to clone.
 * @returns {T} A deep copy of the object.
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * Validates a SystemParameter object.
 * @param {SystemParameter} param - The parameter to validate.
 * @returns {string[]} An array of error messages, or empty if valid.
 */
export const validateSystemParameter = (param: SystemParameter): string[] => {
  const errors: string[] = [];
  if (!param.name || param.name.trim() === '') errors.push('Parameter name cannot be empty.');
  if (param.minValue >= param.maxValue) errors.push('Min value must be less than max value.');
  if (param.currentValue < param.minValue || param.currentValue > param.maxValue) errors.push('Current value must be within min/max range.');
  if (param.step <= 0) errors.push('Step value must be positive.');
  if (!param.unit || param.unit.trim() === '') errors.push('Parameter unit cannot be empty.');
  return errors;
};

/**
 * Validates a LeveragePoint object for completeness.
 * @param {LeveragePoint} lp - The leverage point to validate.
 * @returns {string[]} An array of error messages, or empty if valid.
 */
export const validateLeveragePoint = (lp: LeveragePoint): string[] => {
  const errors: string[] = [];
  if (!lp.action || lp.action.trim() === '') errors.push('Action description cannot be empty.');
  if (lp.outcomeProbability < 0 || lp.outcomeProbability > 1) errors.push('Outcome probability must be between 0 and 1.');
  if (lp.predictionConfidence < 0 || lp.predictionConfidence > 1) errors.push('Prediction confidence must be between 0 and 1.');
  if (!lp.cost || lp.cost.trim() === '') errors.push('Cost cannot be empty.');
  if (!lp.timeToImpact || lp.timeToImpact.trim() === '') errors.push('Time to impact cannot be empty.');
  if (!lp.description || lp.description.trim() === '') errors.push('Detailed description cannot be empty.');
  return errors;
};

/**
 * Helper function to generate mock historical data for metrics.
 * @param {number} numPoints - Number of data points to generate.
 * @param {number} startValue - Initial value for the metric.
 * @param {number} maxDelta - Maximum change per step.
 * @param {string} unit - Unit of the metric.
 * @returns {{ timestamp: Timestamp; value: number }[]} An array of historical data.
 */
export const generateMockHistoricalData = (
  numPoints: number,
  startValue: number,
  maxDelta: number,
  timeStepMs: number = 3600000 // 1 hour
): { timestamp: Timestamp; value: number }[] => {
  const data: { timestamp: Timestamp; value: number }[] = [];
  let currentValue = startValue;
  let currentTimestamp = Date.now() - numPoints * timeStepMs;

  for (let i = 0; i < numPoints; i++) {
    currentValue += (Math.random() - 0.5) * 2 * maxDelta;
    currentValue = Math.max(0, currentValue); // Ensure non-negative
    data.push({
      timestamp: new Date(currentTimestamp).toISOString(),
      value: parseFloat(currentValue.toFixed(2)),
    });
    currentTimestamp += timeStepMs;
  }
  return data;
};

/**
 * Converts an object to a query string.
 * @param {Record<string, any>} params - The object containing query parameters.
 * @returns {string} The formatted query string.
 */
export const objectToQueryString = (params: Record<string, any>): string => {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};

/**
 * Simulates a delay for async operations.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export const sleep = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

/**
 * Helper to safely parse JSON, returning null on error.
 * @param {string} jsonString - The string to parse.
 * @returns {any | null} The parsed object or null.
 */
export const safeJsonParse = <T>(jsonString: string): T | null => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

/**
 * Utility for basic input validation regex.
 */
export const validationRegex = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  systemName: /^[a-zA-Z0-9\s_-]{3,50}$/,
  identifier: /^[a-z0-9_-]+$/, // For IDs, no spaces
};

/**
 * Formats a number to a currency string.
 * @param {number} amount - The numeric amount.
 * @param {string} currencyCode - The ISO 4217 currency code (e.g., 'USD').
 * @param {string} locale - The BCP 47 language tag (e.g., 'en-US').
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount: number, currencyCode: string = 'USD', locale: string = 'en-US'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).format(amount);
};

/**
 * Calculates the Euclidean distance between two points in N-dimensional space.
 * Useful for comparing parameter sets or simulation states.
 * @param {number[]} p1 - First point coordinates.
 * @param {number[]} p2 - Second point coordinates.
 * @returns {number} The Euclidean distance.
 */
export const euclideanDistance = (p1: number[], p2: number[]): number => {
  if (p1.length !== p2.length) {
    throw new Error('Points must have the same number of dimensions.');
  }
  let sumOfSquares = 0;
  for (let i = 0; i < p1.length; i++) {
    sumOfSquares += Math.pow(p1[i] - p2[i], 2);
  }
  return Math.sqrt(sumOfSquares);
};

/**
 * Calculates the average of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The average.
 */
export const calculateAverage = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, current) => sum + current, 0) / arr.length;
};

/**
 * Calculates the standard deviation of an array of numbers.
 * @param {number[]} arr - The array of numbers.
 * @returns {number} The standard deviation.
 */
export const calculateStandardDeviation = (arr: number[]): number => {
  if (arr.length < 2) return 0;
  const mean = calculateAverage(arr);
  const variance = arr.reduce((sum, current) => sum + Math.pow(current - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

// --- Utility Functions (END) ---

// --- Mock API Services (START) ---
// These functions simulate API calls to a backend, including delays and error handling.

export const MOCK_SYSTEM_DEFINITIONS: ChaoticSystemDefinition[] = [
  {
    id: 'system-rain-cv',
    name: 'Central Valley Rainfall System',
    description: 'Models rainfall patterns and water availability in California\'s Central Valley, influenced by Sierra Nevada weather systems.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    lastModified: new Date(Date.now() - 3600000 * 3).toISOString(),
    ownerId: MOCK_ADMIN_USER.id,
    parameters: [
      { id: 'param-temp-ocean', name: 'Ocean Surface Temp (Pacific)', description: 'Average surface temperature of the Eastern Pacific, affecting atmospheric moisture.', currentValue: 18.5, unit: '°C', minValue: 10, maxValue: 25, step: 0.1, isLeverageCandidate: true, dataType: ParameterDataType.Number },
      { id: 'param-wind-speed', name: 'Prevailing Wind Speed', description: 'Average wind speed over the Pacific, influencing cloud movement.', currentValue: 12.0, unit: 'm/s', minValue: 5, maxValue: 30, step: 0.5, isLeverageCandidate: true, dataType: ParameterDataType.Number },
      { id: 'param-aerosol-conc', name: 'Atmospheric Aerosol Conc.', description: 'Concentration of aerosols, affecting cloud nucleation.', currentValue: 150, unit: 'µg/m³', minValue: 50, maxValue: 500, step: 5, isLeverageCandidate: true, dataType: ParameterDataType.Number },
      { id: 'param-cloud-seeding-budget', name: 'Cloud Seeding Budget', description: 'Annual budget allocated for cloud seeding operations.', currentValue: 100000, unit: 'USD', minValue: 0, maxValue: 1000000, step: 10000, isLeverageCandidate: true, dataType: ParameterDataType.Number },
      { id: 'param-crop-demand', name: 'Agricultural Water Demand', description: 'Overall water demand from agriculture in the Central Valley.', currentValue: 0.7, unit: 'ratio', minValue: 0.1, maxValue: 1.0, step: 0.05, isLeverageCandidate: false, dataType: ParameterDataType.Number },
    ],
    metrics: [
      { id: 'metric-rainfall', name: 'Monthly Rainfall (CV)', description: 'Average monthly rainfall in the Central Valley.', currentValue: 50, unit: 'mm', target: { min: 60, max: 80, unit: 'mm' }, history: generateMockHistoricalData(12, 45, 10, 3600000 * 24 * 30), alertThresholds: { warning: { operator: '<', value: 40 }, critical: { operator: '<', value: 20 } } },
      { id: 'metric-snowpack', name: 'Sierra Nevada Snowpack', description: 'Water equivalent of snowpack in the Sierra Nevada.', currentValue: 120, unit: 'cm', target: { min: 150, unit: 'cm' }, history: generateMockHistoricalData(12, 100, 20, 3600000 * 24 * 30) },
      { id: 'metric-reservoir-level', name: 'Major Reservoir Levels', description: 'Combined storage capacity percentage of key reservoirs.', currentValue: 0.65, unit: '%', target: { min: 0.7, unit: '%' }, history: generateMockHistoricalData(12, 0.6, 0.05, 3600000 * 24 * 30), alertThresholds: { warning: { operator: '<', value: 0.55 }, critical: { operator: '<', value: 0.4 } } },
      { id: 'metric-avg-temp', name: 'Average Air Temperature', description: 'Mean daily air temperature in the Central Valley.', currentValue: 22.5, unit: '°C', history: generateMockHistoricalData(12, 20, 5, 3600000 * 24 * 30) },
    ],
    feedbackLoops: [
      { id: 'loop-albedo-temp', name: 'Albedo-Temperature Feedback', description: 'Reduced snowpack leads to lower albedo, increasing ground absorption and temperature, further reducing snowpack.', type: 'positive', sourceId: 'metric-snowpack', targetId: 'metric-avg-temp', strength: 0.7, delay: '30 days' },
      { id: 'loop-irrigation-precip', name: 'Irrigation-Precipitation Feedback', description: 'Increased irrigation leads to higher local humidity, potentially increasing localized precipitation.', type: 'positive', sourceId: 'param-crop-demand', targetId: 'metric-rainfall', strength: 0.3, delay: '7 days' },
    ],
    status: 'Active',
    schemaVersion: '1.0.0',
    tags: ['water', 'agriculture', 'climate', 'california'],
    scope: 'California Central Valley & Sierra Nevada',
    externalDataSources: [
      { name: 'NOAA Weather API', url: 'https://api.noaa.gov/weather', lastSync: new Date().toISOString() },
      { name: 'California DWR', url: 'https://water.ca.gov', lastSync: new Date().toISOString() },
    ],
    accessControl: { public: false, sharedWithUsers: [], sharedWithGroups: ['analysts-group'] },
    simulationModelRef: 'chaotic-rainfall-model-v2.1',
    modelVersion: '2.1.0',
  },
  {
    id: 'system-market-volatility',
    name: 'Global Market Volatility Indicator',
    description: 'A simplified model for global market volatility influenced by various economic and geopolitical factors.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    lastModified: new Date(Date.now() - 3600000 * 2).toISOString(),
    ownerId: MOCK_ADMIN_USER.id,
    parameters: [
      { id: 'param-interest-rate', name: 'Global Interest Rate', description: 'Average global interest rate, impacts investment.', currentValue: 0.03, unit: '%', minValue: 0.005, maxValue: 0.1, step: 0.001, isLeverageCandidate: true, dataType: ParameterDataType.Number },
      { id: 'param-geopolitical-tension', name: 'Geopolitical Tension Index', description: 'An index reflecting global geopolitical stability.', currentValue: 0.6, unit: 'index', minValue: 0, maxValue: 1, step: 0.05, isLeverageCandidate: true, dataType: ParameterDataType.Number },
      { id: 'param-tech-innovation', name: 'Tech Innovation Pace', description: 'Rate of disruptive technological advancements.', currentValue: 0.8, unit: 'index', minValue: 0, maxValue: 1, step: 0.05, isLeverageCandidate: false, dataType: ParameterDataType.Number },
    ],
    metrics: [
      { id: 'metric-vix', name: 'VIX Index (Volatility)', description: 'The CBOE Volatility Index, a measure of market expectation of near-term volatility.', currentValue: 20, unit: 'points', target: { max: 15, unit: 'points' }, history: generateMockHistoricalData(24, 25, 5, 3600000 * 24 * 15), alertThresholds: { warning: { operator: '>', value: 25 }, critical: { operator: '>', value: 40 } } },
      { id: 'metric-gdp-growth', name: 'Global GDP Growth Rate', description: 'Annualized global GDP growth rate.', currentValue: 0.025, unit: '%', target: { min: 0.03, unit: '%' }, history: generateMockHistoricalData(24, 0.02, 0.005, 3600000 * 24 * 15) },
    ],
    feedbackLoops: [
      { id: 'loop-confidence-investment', name: 'Confidence-Investment Feedback', description: 'High market volatility reduces investor confidence, leading to less investment, further increasing volatility.', type: 'positive', sourceId: 'metric-vix', targetId: 'param-interest-rate', strength: 0.6, delay: '90 days' },
    ],
    status: 'Draft',
    schemaVersion: '1.0.0',
    tags: ['finance', 'economy', 'global'],
    scope: 'Global Financial Markets',
    externalDataSources: [
      { name: 'Bloomberg API', url: 'https://api.bloomberg.com', lastSync: new Date().toISOString() },
    ],
    accessControl: { public: false, sharedWithUsers: [], sharedWithGroups: [] },
    simulationModelRef: 'financial-chaos-model-v1.0',
    modelVersion: '1.0.0',
  },
];

export const MOCK_LEVERAGE_POINTS: LeveragePoint[] = [
  {
    id: 'lp-cloud-seed',
    action: "Seed clouds with silver iodide via 3 drone flights over the Sierra Nevada mountain range on Tuesday.",
    cost: "~$25,000 USD",
    outcomeProbability: 0.62,
    timeToImpact: "90-120 days",
    description: "Deployment of specialized drones to release silver iodide particles into suitable cloud formations, aiming to enhance ice crystal formation and precipitation efficiency.",
    positiveSideEffects: ["Increased natural water supply", "Reduced drought severity", "Hydroelectric power generation increase"],
    negativeSideEffects: ["Potential ecological impact of silver iodide (minimal at current concentrations)", "Public perception concerns", "Risk of unwanted precipitation in other areas"],
    impactMagnitude: "5-10% increase in Q4 rainfall",
    predictionConfidence: 0.75,
    implementationEffort: 'Medium',
    reversibility: 'High',
    risks: [{ category: 'Ecological', severity: 'Low', description: 'Trace amounts of silver iodide in water systems.' }],
    requiredResources: ["3x specialized drones", "Silver iodide cartridges", "Pilots & ground crew", "Meteorological support"],
    stakeholders: [{ name: 'CA DWR', role: 'Regulatory Body', influence: 'High' }, { name: 'Farmers', role: 'Beneficiary', influence: 'Medium' }],
    historicalSuccessRate: 0.68,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'lp-desert-solar-farms',
    action: "Deploy large-scale solar farms in desert regions to influence local atmospheric convection.",
    cost: "~$500,000,000 USD",
    outcomeProbability: 0.05,
    timeToImpact: "5-10 years",
    description: "Installation of vast solar panel arrays to significantly alter surface albedo and heat absorption, aiming to create local thermal updrafts that could influence regional air currents and moisture transport.",
    positiveSideEffects: ["Renewable energy generation", "Reduced carbon emissions", "Potential localized microclimate changes beneficial for some areas"],
    negativeSideEffects: ["Massive land use", "Habitat destruction in desert ecosystems", "High upfront capital cost", "Unpredictable atmospheric effects"],
    impactMagnitude: "Highly uncertain, potentially 0-2% change in regional rainfall",
    predictionConfidence: 0.1,
    implementationEffort: 'Very High',
    reversibility: 'Low',
    risks: [
      { category: 'Financial', severity: 'High', description: 'Extremely high investment with low probability of desired outcome.' },
      { category: 'Ecological', severity: 'High', description: 'Irreversible habitat loss and unknown ecosystem impacts.' },
      { category: 'Social', severity: 'Medium', description: 'Land acquisition conflicts and visual pollution.' },
    ],
    requiredResources: ["Thousands of acres of land", "Solar panel manufacturing & installation infrastructure", "Billions in funding", "Environmental impact assessments"],
    stakeholders: [{ name: 'Energy Companies', role: 'Investor/Operator', influence: 'High' }, { name: 'Environmental Groups', role: 'Opposition', influence: 'High' }],
    historicalSuccessRate: 0.01,
    lastUpdated: new Date().toISOString(),
  },
];

export const MOCK_SIMULATION_RUNS: SimulationRun[] = [
  {
    id: 'sim-001',
    systemId: 'system-rain-cv',
    initiatedBy: MOCK_ADMIN_USER.id,
    startTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'Completed',
    initialConditions: [
      { parameterId: 'param-temp-ocean', value: 18.0 },
      { parameterId: 'param-wind-speed', value: 10.0 },
    ],
    appliedLeveragePoints: [
      { leveragePointId: 'lp-cloud-seed', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), details: 'Initial cloud seeding effort.' },
    ],
    simulatedDuration: '180 days',
    results: [
      { metricId: 'metric-rainfall', data: generateMockHistoricalData(180, 50, 5, 3600000 * 24) },
      { metricId: 'metric-snowpack', data: generateMockHistoricalData(180, 100, 10, 3600000 * 24) },
    ],
    logMessages: [{ timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(), level: 'info', message: 'Simulation initialized successfully.' }],
    configuration: {
      timeStepSize: '1 day',
      iterations: 180,
      stochasticityFactor: 0.1,
      seed: 12345,
    },
    engineVersion: '1.0.0',
    performanceMetrics: { cpuUsage: 75, memoryUsage: 1024, realTimeDurationMs: 7200000 },
  },
];

export const MOCK_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scenario-drought-mitigation',
    name: 'Drought Mitigation Strategy Q4',
    description: 'Compares different cloud seeding intensities and timings to mitigate predicted Q4 drought.',
    baseSystemId: 'system-rain-cv',
    createdBy: MOCK_ADMIN_USER.id,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    lastModified: new Date(Date.now() - 3600000 * 1).toISOString(),
    simulationRuns: ['sim-001'],
    proposedLeveragePoints: [
      { ...MOCK_LEVERAGE_POINTS[0], id: 'lp-cloud-seed-scenario-A', action: 'Increased cloud seeding intensity (x1.5 budget)' },
      { ...MOCK_LEVERAGE_POINTS[0], id: 'lp-cloud-seed-scenario-B', action: 'Cloud seeding + forest management (burns)' },
    ],
    comparisonMetrics: [
      { metricId: 'metric-rainfall', targetRange: [60, 80], priority: 'High' },
      { metricId: 'metric-reservoir-level', targetValue: 0.75, priority: 'High' },
    ],
    status: 'Active',
    notes: 'Initial findings suggest increased seeding shows promise, but cost-benefit needs further analysis.',
    attachments: [],
  },
];

/**
 * Mock API for managing Chaotic System Definitions.
 */
export const SystemApiService = {
  async getSystems(): Promise<ChaoticSystemDefinition[]> {
    await sleep(800);
    return deepClone(MOCK_SYSTEM_DEFINITIONS);
  },

  async getSystemById(id: SystemIdentifier): Promise<ChaoticSystemDefinition | null> {
    await sleep(500);
    const system = MOCK_SYSTEM_DEFINITIONS.find(s => s.id === id);
    return system ? deepClone(system) : null;
  },

  async createSystem(system: ChaoticSystemDefinition): Promise<ChaoticSystemDefinition> {
    await sleep(1000);
    const newSystem = { ...