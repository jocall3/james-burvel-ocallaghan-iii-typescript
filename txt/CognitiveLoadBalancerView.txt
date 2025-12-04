import React, { useState, useEffect } from 'react';

/**
 * @interface CognitiveMetric
 * @description Defines the structure for a single cognitive load metric snapshot.
 * timestamp: ISO string of when the metric was recorded.
 * avgCognitiveLoad: Average cognitive load (0.0 to 1.0).
 * activeThrottles: List of feature names currently being throttled.
 */
interface CognitiveMetric {
  timestamp: string;
  avgCognitiveLoad: number; // 0.0 to 1.0
  activeThrottles: string[]; // Feature names being throttled
}

/**
 * @enum FeatureCategory
 * @description Categorizes features for better management and policy application.
 */
export enum FeatureCategory {
  Analytics = 'Analytics',
  Collaboration = 'Collaboration',
  DataEntry = 'Data Entry',
  Reporting = 'Reporting',
  Admin = 'Administration',
  Communication = 'Communication',
  Utility = 'Utility',
  Search = 'Search',
  Configuration = 'Configuration',
  Automation = 'Automation',
  Integrations = 'Integrations',
  Notifications = 'Notifications',
  UserManagement = 'User Management',
  PerformanceMonitoring = 'Performance Monitoring',
  Security = 'Security',
  DevelopmentTools = 'Development Tools',
  MachineLearning = 'Machine Learning',
  VirtualReality = 'Virtual Reality',
  AugmentedReality = 'Augmented Reality',
  Simulation = 'Simulation',
}

/**
 * @enum ThrottlingStrategy
 * @description Defines various strategies for applying throttling.
 */
export enum ThrottlingStrategy {
  StaticThreshold = 'Static Threshold',
  DynamicAdaptive = 'Dynamic Adaptive',
  PredictiveML = 'Predictive ML',
  UserSegmentSpecific = 'User Segment Specific',
  TimeBased = 'Time-Based',
  CapacityBased = 'Capacity-Based',
  PriorityBased = 'Priority-Based',
  FeatureDependency = 'Feature Dependency',
  RevenueImpact = 'Revenue Impact',
  ComplianceDriven = 'Compliance-Driven',
}

/**
 * @enum AlertSeverity
 * @description Levels of alert severity.
 */
export enum AlertSeverity {
  Info = 'Info',
  Warning = 'Warning',
  Critical = 'Critical',
  Emergency = 'Emergency',
}

/**
 * @enum UserSegment
 * @description Represents different user segments that might have distinct cognitive load profiles or throttling needs.
 */
export enum UserSegment {
  NewUser = 'New User',
  ExperiencedUser = 'Experienced User',
  PowerUser = 'Power User',
  Admin = 'Admin',
  Guest = 'Guest',
  Developer = 'Developer',
  Analyst = 'Analyst',
  Manager = 'Manager',
  Executive = 'Executive',
  ExternalPartner = 'External Partner',
  InternalSupport = 'Internal Support',
}

/**
 * @interface FeatureDefinition
 * @description Detailed definition of a feature within the application.
 * id: Unique identifier for the feature.
 * name: Display name of the feature.
 * description: A brief explanation of the feature.
 * category: Categorization of the feature.
 * cognitiveWeight: Estimated cognitive load impact of the feature (0.0 to 1.0, higher means more demanding).
 * baseThrottleThreshold: Default load threshold above which this feature *might* be throttled.
 * isActive: Whether the feature is currently enabled in the system.
 * dependencies: Other features this one depends on (for complex throttling).
 * impactMetrics: Metrics that quantify the business impact if this feature is throttled (e.g., 'conversion_rate', 'time_on_page').
 * recoveryTimeEstimate: Estimated time for user's cognitive load to recover after using this feature (in seconds).
 * lastUpdated: Timestamp of the last definition update.
 * ownerTeam: Team responsible for the feature.
 * rolloutStrategy: How the feature is rolled out (e.g., 'all_users', 'beta_testers').
 */
export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  cognitiveWeight: number; // 0.0 - 1.0, higher means more demanding
  baseThrottleThreshold: number; // e.g., 0.7
  isActive: boolean;
  dependencies: string[]; // IDs of other features it depends on
  impactMetrics: { name: string; value: number }[];
  recoveryTimeEstimate: number; // in seconds
  lastUpdated: string;
  ownerTeam: string;
  rolloutStrategy: 'all_users' | 'beta_testers' | 'segment_specific';
}

/**
 * @interface ThrottlingPolicy
 * @description Defines a specific policy for throttling features.
 * id: Unique identifier for the policy.
 * name: Name of the policy.
 * description: Explanation of the policy.
 * strategy: The algorithm or method used for throttling.
 * targetFeatureIds: Features to which this policy applies.
 * userSegments: Which user segments this policy applies to.
 * thresholdConfig: Configuration for thresholds (e.g., dynamic range, static value).
 * activationConditions: Rules for when this policy becomes active (e.g., system load, time of day).
 * deactivationConditions: Rules for when this policy stops.
 * priority: Order of application if multiple policies could apply.
 * lastModifiedBy: User who last modified the policy.
 * lastModifiedDate: Timestamp of last modification.
 * efficacyMetrics: Metrics used to evaluate the policy's effectiveness (e.g., 'reduced_load_avg', 'user_retention_rate').
 * A/BTestGroup: Optional A/B test group identifier for policy evaluation.
 */
export interface ThrottlingPolicy {
  id: string;
  name: string;
  description: string;
  strategy: ThrottlingStrategy;
  targetFeatureIds: string[];
  userSegments: UserSegment[];
  thresholdConfig: {
    minLoad?: number; // For dynamic strategies
    maxLoad?: number; // For dynamic strategies
    staticLoadThreshold?: number; // For static strategies
    durationThreshold?: number; // How long load must be high (seconds)
    cooldownPeriod?: number; // How long to wait after de-throttling (seconds)
  };
  activationConditions: string[]; // e.g., "system_cpu_gt_80", "time_of_day_between_9_17"
  deactivationConditions: string[]; // e.g., "system_cpu_lt_60"
  priority: number; // Lower number means higher priority
  isActive: boolean;
  lastModifiedBy: string;
  lastModifiedDate: string;
  efficacyMetrics: { name: string; targetValue: number }[];
  A_BTestGroup?: string;
}

/**
 * @interface AlertDefinition
 * @description Defines rules for generating system alerts.
 * id: Unique identifier for the alert definition.
 * name: Name of the alert.
 * description: What the alert signifies.
 * severity: How critical the alert is.
 * condition: Logic for triggering the alert (e.g., "avgCognitiveLoad > 0.9 for 5 minutes").
 * targetFeatures: Features related to this alert.
 * targetUserSegments: User segments affected by this alert.
 * notificationChannels: How to notify (e.g., "email", "slack", "pagerduty").
 * isActive: Whether the alert rule is active.
 * debouncePeriod: How long to wait before re-triggering the same alert (seconds).
 * autoResolveCondition: Condition for automatic resolution.
 */
export interface AlertDefinition {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  condition: string;
  targetFeatures: string[];
  targetUserSegments: UserSegment[];
  notificationChannels: string[];
  isActive: boolean;
  debouncePeriod: number;
  autoResolveCondition: string;
  escalationPolicyId?: string; // ID of an escalation policy
}

/**
 * @interface AlertInstance
 * @description Represents an active or resolved alert.
 * id: Unique identifier for this specific alert instance.
 * definitionId: The ID of the AlertDefinition that triggered this instance.
 * timestamp: When the alert was triggered.
 * resolvedTimestamp: When the alert was resolved (if applicable).
 * status: Current status ('active', 'resolved', 'acknowledged').
 * triggeredValue: The value that caused the alert to trigger.
 * context: Additional data relevant to the alert (e.g., affected users, system state).
 * assignedTo: User or team assigned to handle the alert.
 */
export interface AlertInstance {
  id: string;
  definitionId: string;
  timestamp: string;
  resolvedTimestamp?: string;
  status: 'active' | 'resolved' | 'acknowledged';
  triggeredValue: string;
  context: Record<string, any>;
  assignedTo?: string;
  notes: string[];
}

/**
 * @interface SystemHealthMetric
 * @description Represents various system health metrics that can influence or be influenced by cognitive load and throttling.
 * timestamp: When the metric was recorded.
 * cpuUsage: CPU utilization percentage.
 * memoryUsage: Memory utilization percentage.
 * networkLatency: Average network latency in ms.
 * databaseConnections: Number of active database connections.
 * errorRate: Application error rate.
 * queueDepth: Depth of message queues.
 * activeUsers: Number of currently active users.
 * backgroundTasks: Number of running background tasks.
 * diskIO: Disk I/O operations per second.
 * apiCallRate: Rate of API calls per second.
 */
export interface SystemHealthMetric {
  timestamp: string;
  cpuUsage: number; // 0-100%
  memoryUsage: number; // 0-100%
  networkLatency: number; // ms
  databaseConnections: number;
  errorRate: number; // errors per minute
  queueDepth: number;
  activeUsers: number;
  backgroundTasks: number;
  diskIO: number; // ops/sec
  apiCallRate: number; // calls/sec
}

/**
 * @interface UserInteractionLog
 * @description Logs specific user interactions, which can be correlated with cognitive load.
 * timestamp: Time of interaction.
 * userId: ID of the user.
 * featureId: ID of the feature interacted with.
 * interactionType: Type of interaction (e.g., 'click', 'input', 'view').
 * duration: Duration of interaction (ms).
 * cognitiveImpactEstimate: Estimated impact of this specific interaction on cognitive load.
 * relatedMetrics: Other relevant metrics at the time of interaction.
 */
export interface UserInteractionLog {
  timestamp: string;
  userId: string;
  featureId: string;
  interactionType: string;
  duration: number; // milliseconds
  cognitiveImpactEstimate: number;
  relatedMetrics: { metric: string; value: number }[];
}

/**
 * @interface HistoricalCognitiveData
 * @description Aggregated historical cognitive load data for reporting and analysis.
 * timestamp: Start of the aggregation period.
 * avgLoad: Average cognitive load during the period.
 * maxLoad: Maximum cognitive load during the period.
 * minLoad: Minimum cognitive load during the period.
 * activeThrottleDurations: Map of feature ID to total duration it was throttled in this period (seconds).
 * userSegmentBreakdown: Cognitive load metrics broken down by user segment.
 * featureContribution: Estimated contribution of each feature to the overall load.
 */
export interface HistoricalCognitiveData {
  timestamp: string;
  avgLoad: number;
  maxLoad: number;
  minLoad: number;
  activeThrottleDurations: Record<string, number>; // featureId -> seconds
  userSegmentBreakdown: Record<UserSegment, { avgLoad: number; userCount: number }>;
  featureContribution: Record<string, number>; // featureId -> estimated load contribution
}

/**
 * @interface PredictiveForecast
 * @description Forecasted cognitive load based on historical data and current trends.
 * timestamp: The time for which the forecast is made.
 * forecastedLoad: Predicted average cognitive load.
 * confidenceInterval: Upper and lower bounds of the prediction.
 * influencingFactors: Factors identified as strongly influencing the forecast.
 * recommendedActions: Proactive throttling suggestions.
 */
export interface PredictiveForecast {
  timestamp: string;
  forecastedLoad: number;
  confidenceInterval: [number, number]; // [lower, upper]
  influencingFactors: Record<string, number>; // factor -> influence score
  recommendedActions: { featureId: string; action: 'throttle' | 'ease'; rationale: string }[];
}

/**
 * @interface FeedbackLoopStatus
 * @description Status of the adaptive feedback loop for optimizing throttling policies.
 * lastEvaluationTimestamp: When the feedback loop last evaluated policies.
 * policiesEvaluated: IDs of policies evaluated.
 * proposedAdjustments: Suggested changes to policies based on evaluation.
 * efficacyScore: Overall score for current policies (0.0 - 1.0).
 * nextEvaluationDue: When the next evaluation is scheduled.
 */
export interface FeedbackLoopStatus {
  lastEvaluationTimestamp: string;
  policiesEvaluated: string[];
  proposedAdjustments: Record<string, string>; // policyId -> suggested change
  efficacyScore: number;
  nextEvaluationDue: string;
  statusMessage: string; // e.g., "Optimizing for user retention"
  optimizationGoal: string; // e.g., "minimize_avg_load", "maximize_feature_usage"
}

/**
 * @interface UserProfile
 * @description Represents a user's profile with cognitive load relevant attributes.
 * userId: Unique user ID.
 * segment: The user's assigned segment.
 * onboardingCompletion: Percentage of onboarding completed.
 * engagementScore: How engaged the user is.
 * recentCognitiveLoadHistory: A brief history of cognitive load for this user.
 * preferredLanguage: User's preferred language.
 * customThrottlePreferences: User-specific throttling overrides (e.g., "never throttle feature X").
 */
export interface UserProfile {
  userId: string;
  segment: UserSegment;
  onboardingCompletion: number;
  engagementScore: number;
  recentCognitiveLoadHistory: CognitiveMetric[];
  preferredLanguage: string;
  customThrottlePreferences: Record<string, 'throttle' | 'ease' | 'default'>;
  accountStatus: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
}

/**
 * @interface IntegrationConfig
 * @description Configuration for external system integrations.
 * id: Integration ID.
 * name: Integration name.
 * type: Type of integration (e.g., 'slack', 'datadog', 'jira').
 * status: Connection status.
 * settings: Specific settings for the integration (e.g., webhook URL).
 * lastTested: Timestamp of last successful test.
 */
export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'slack' | 'datadog' | 'jira' | 'email' | 'custom_webhook';
  status: 'connected' | 'disconnected' | 'error';
  settings: Record<string, string>;
  lastTested?: string;
}

// Utility Functions ---------------------------------------------------------------------------------------------------

/**
 * @function generateUUID
 * @description Generates a simple UUID for IDs.
 * @returns {string} A unique identifier string.
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * @function calculateAverage
 * @description Calculates the average of an array of numbers.
 * @param {number[]} data - Array of numbers.
 * @returns {number} The average.
 */
export const calculateAverage = (data: number[]): number => {
  if (data.length === 0) return 0;
  return data.reduce((sum, val) => sum + val, 0) / data.length;
};

/**
 * @function getLoadColorClass
 * @description Returns a Tailwind CSS class for load indication.
 * @param {number} load - The cognitive load value.
 * @returns {string} Tailwind CSS class.
 */
export const getLoadColorClass = (load: number): string => {
  if (load > 0.85) return 'text-red-500';
  if (load > 0.7) return 'text-orange-400';
  if (load > 0.5) return 'text-yellow-300';
  return 'text-green-400';
};

/**
 * @function throttleFeature
 * @description Simulates throttling a feature and logging the event.
 * @param {string} featureId - ID of the feature to throttle.
 * @param {string} reason - Reason for throttling.
 * @param {UserSegment[]} affectedSegments - User segments affected.
 * @returns {void}
 */
export const throttleFeature = (featureId: string, reason: string, affectedSegments: UserSegment[]): void => {
  console.log(`[ACTION] Throttling feature '${featureId}' due to: ${reason}. Affected segments: ${affectedSegments.join(', ')}`);
  // In a real app, this would dispatch an action to a backend service.
};

/**
 * @function easeFeatureThrottle
 * @description Simulates easing a throttled feature.
 * @param {string} featureId - ID of the feature to ease.
 * @param {string} reason - Reason for easing.
 * @returns {void}
 */
export const easeFeatureThrottle = (featureId: string, reason: string): void => {
  console.log(`[ACTION] Easing throttle on feature '${featureId}' due to: ${reason}.`);
  // In a real app, this would dispatch an action to a backend service.
};

/**
 * @function formatDuration
 * @description Formats a duration in seconds into a human-readable string.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Human-readable duration string.
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
};

/**
 * @function mockBackendAPI
 * @description A highly simplified mock API for simulating backend calls.
 * @param {string} endpoint - The API endpoint (e.g., 'features', 'policies').
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method - HTTP method.
 * @param {any} data - Request body data for POST/PUT.
 * @returns {Promise<any>} A promise resolving with mock data.
 */
export const mockBackendAPI = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result: any;
      switch (endpoint) {
        case 'features':
          result = mockFeatures;
          if (method === 'POST' && data) {
            const newFeature = { ...data, id: generateUUID(), lastUpdated: new Date().toISOString() };
            mockFeatures.push(newFeature);
            result = newFeature;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockFeatures.findIndex(f => f.id === data.id);
            if (index !== -1) {
              mockFeatures[index] = { ...mockFeatures[index], ...data, lastUpdated: new Date().toISOString() };
              result = mockFeatures[index];
            } else {
              result = { error: 'Feature not found' };
            }
          }
          break;
        case 'policies':
          result = mockThrottlingPolicies;
          if (method === 'POST' && data) {
            const newPolicy = { ...data, id: generateUUID(), lastModifiedDate: new Date().toISOString() };
            mockThrottlingPolicies.push(newPolicy);
            result = newPolicy;
          } else if (method === 'PUT' && data && data.id) {
            const index = mockThrottlingPolicies.findIndex(p => p.id === data.id);
            if (index !== -1) {
              mockThrottlingPolicies[index] = { ...mockThrottlingPolicies[index], ...data, lastModifiedDate: new Date().toISOString() };
              result = mockThrottlingPolicies[index];
            } else {
              result = { error: 'Policy not found' };
            }
          }
          break;
        case 'alerts/definitions':
          result = mockAlertDefinitions;
          if (method === 'POST' && data) {
            const newAlertDef = { ...data, id: generateUUID() };
            mockAlertDefinitions.push(newAlertDef);
            result = newAlertDef;
          }
          break;
        case 'alerts/instances':
          result = mockAlertInstances;
          break;
        case 'users':
          result = mockUserProfiles;
          break;
        case 'integrations':
          result = mockIntegrationConfigs;
          if (method === 'POST' && data) {
            const newIntegration = { ...data, id: generateUUID(), status: 'disconnected' };
            mockIntegrationConfigs.push(newIntegration);
            result = newIntegration;
          }
          break;
        case 'system_health':
          result = mockSystemHealthMetrics;
          break;
        case 'historical_data':
          result = mockHistoricalCognitiveData;
          break;
        case 'forecast':
          result = mockPredictiveForecast;
          break;
        case 'feedback_loop':
          result = mockFeedbackLoopStatus;
          break;
        default:
          result = { message: 'Mock API endpoint not found', endpoint, method, data };
      }
      resolve(result);
    }, 500); // Simulate network latency
  });
};

// Mock Data -----------------------------------------------------------------------------------------------------------

export const mockFeatures: FeatureDefinition[] = [
  {
    id: 'feat_adv_analytics', name: 'Advanced Analytics', description: 'Provides deep dive data analysis tools.', category: FeatureCategory.Analytics, cognitiveWeight: 0.9, baseThrottleThreshold: 0.8, isActive: true, dependencies: [], impactMetrics: [{ name: 'decision_quality', value: 0.8 }], recoveryTimeEstimate: 300, lastUpdated: '2023-01-15T10:00:00Z', ownerTeam: 'Data Science', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_realtime_collaboration', name: 'Realtime Collaboration', description: 'Enables live document editing and chat.', category: FeatureCategory.Collaboration, cognitiveWeight: 0.8, baseThrottleThreshold: 0.75, isActive: true, dependencies: [], impactMetrics: [{ name: 'team_productivity', value: 0.9 }], recoveryTimeEstimate: 240, lastUpdated: '2023-01-16T11:00:00Z', ownerTeam: 'Productivity Suite', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_task_management', name: 'Task Management', description: 'Organize and track tasks for projects.', category: FeatureCategory.Utility, cognitiveWeight: 0.5, baseThrottleThreshold: 0.6, isActive: true, dependencies: [], impactMetrics: [{ name: 'project_completion_rate', value: 0.7 }], recoveryTimeEstimate: 120, lastUpdated: '2023-01-17T09:30:00Z', ownerTeam: 'Core Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_reporting_dashboard', name: 'Custom Reporting Dashboard', description: 'Create and view personalized reports.', category: FeatureCategory.Reporting, cognitiveWeight: 0.7, baseThrottleThreshold: 0.7, isActive: true, dependencies: ['feat_adv_analytics'], impactMetrics: [{ name: 'data_insight_speed', value: 0.85 }], recoveryTimeEstimate: 180, lastUpdated: '2023-01-18T14:00:00Z', ownerTeam: 'Data Science', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_data_import', name: 'Data Import Wizard', description: 'Guided process for importing external data.', category: FeatureCategory.DataEntry, cognitiveWeight: 0.6, baseThrottleThreshold: 0.65, isActive: true, dependencies: [], impactMetrics: [{ name: 'data_onboarding_speed', value: 0.9 }], recoveryTimeEstimate: 90, lastUpdated: '2023-01-19T10:00:00Z', ownerTeam: 'Integrations', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_user_settings', name: 'User Profile Settings', description: 'Manage personal user information and preferences.', category: FeatureCategory.Admin, cognitiveWeight: 0.3, baseThrottleThreshold: 0.5, isActive: true, dependencies: [], impactMetrics: [{ name: 'user_satisfaction', value: 0.95 }], recoveryTimeEstimate: 60, lastUpdated: '2023-01-20T08:00:00Z', ownerTeam: 'Core Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_ai_assistant', name: 'AI Assistant', description: 'Provides intelligent suggestions and automation.', category: FeatureCategory.Automation, cognitiveWeight: 0.95, baseThrottleThreshold: 0.88, isActive: true, dependencies: [], impactMetrics: [{ name: 'user_efficiency', value: 0.92 }], recoveryTimeEstimate: 360, lastUpdated: '2023-01-21T16:00:00Z', ownerTeam: 'AI Research', rolloutStrategy: 'beta_testers'
  },
  {
    id: 'feat_realtime_notifications', name: 'Realtime Notifications', description: 'Instant alerts for critical events.', category: FeatureCategory.Notifications, cognitiveWeight: 0.4, baseThrottleThreshold: 0.6, isActive: true, dependencies: [], impactMetrics: [{ name: 'response_time', value: 0.8 }], recoveryTimeEstimate: 30, lastUpdated: '2023-01-22T09:00:00Z', ownerTeam: 'Notifications', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_search', name: 'Global Search', description: 'Search across all application data and features.', category: FeatureCategory.Search, cognitiveWeight: 0.55, baseThrottleThreshold: 0.6, isActive: true, dependencies: [], impactMetrics: [{ name: 'information_retrieval_speed', value: 0.88 }], recoveryTimeEstimate: 75, lastUpdated: '2023-01-23T11:00:00Z', ownerTeam: 'Core Platform', rolloutStrategy: 'all_users'
  },
  {
    id: 'feat_virtual_workspaces', name: 'Virtual Workspaces', description: 'Create isolated environments for specific projects.', category: FeatureCategory.Collaboration, cognitiveWeight: 0.85, baseThrottleThreshold: 0.82, isActive: true, dependencies: ['feat_realtime_collaboration'], impactMetrics: [{ name: 'team_focus', value: 0.91 }], recoveryTimeEstimate: 320, lastUpdated: '2023-01-24T13:00:00Z', ownerTeam: 'Productivity Suite', rolloutStrategy: 'all_users'
  },
];

export const mockThrottlingPolicies: ThrottlingPolicy[] = [
  {
    id: 'policy_high_load_general', name: 'High Load General Throttling', description: 'Activates when overall cognitive load is very high, impacting high-weight features.', strategy: ThrottlingStrategy.DynamicAdaptive, targetFeatureIds: ['feat_adv_analytics', 'feat_realtime_collaboration', 'feat_ai_assistant', 'feat_virtual_workspaces'], userSegments: [UserSegment.ExperiencedUser, UserSegment.Manager], thresholdConfig: { minLoad: 0.85, maxLoad: 0.95, durationThreshold: 60, cooldownPeriod: 300 }, activationConditions: ['avgCognitiveLoad_gt_0.85_for_60s'], deactivationConditions: ['avgCognitiveLoad_lt_0.75_for_120s'], priority: 1, isActive: true, lastModifiedBy: 'admin', lastModifiedDate: '2023-02-01T09:00:00Z', efficacyMetrics: [{ name: 'reduced_avg_load', targetValue: 0.1 }]
  },
  {
    id: 'policy_analytics_peak_hours', name: 'Analytics Peak Hours Throttling', description: 'Reduces analytics performance during peak business hours for non-priority users.', strategy: ThrottlingStrategy.TimeBased, targetFeatureIds: ['feat_adv_analytics', 'feat_reporting_dashboard'], userSegments: [UserSegment.NewUser, UserSegment.Guest], thresholdConfig: { staticLoadThreshold: 0.7 }, activationConditions: ['time_of_day_between_09_00_17_00_local', 'system_cpu_gt_70'], deactivationConditions: ['time_of_day_outside_09_00_17_00_local', 'system_cpu_lt_60'], priority: 2, isActive: true, lastModifiedBy: 'sys_ops', lastModifiedDate: '2023-02-05T14:30:00Z', efficacyMetrics: [{ name: 'core_feature_uptime', targetValue: 0.999 }]
  },
  {
    id: 'policy_new_user_protection', name: 'New User Load Protection', description: 'Prevents new users from being exposed to extremely high cognitive load features.', strategy: ThrottlingStrategy.UserSegmentSpecific, targetFeatureIds: ['feat_adv_analytics', 'feat_ai_assistant'], userSegments: [UserSegment.NewUser], thresholdConfig: { staticLoadThreshold: 0.7 }, activationConditions: ['user_segment_is_new_user', 'avgCognitiveLoad_gt_0.7'], deactivationConditions: ['user_segment_is_not_new_user', 'avgCognitiveLoad_lt_0.6'], priority: 0, isActive: true, lastModifiedBy: 'product_mgr', lastModifiedDate: '2023-02-10T10:00:00Z', efficacyMetrics: [{ name: 'new_user_retention', targetValue: 0.75 }]
  },
  {
    id: 'policy_dev_environment', name: 'Development Environment Throttling', description: 'More aggressive throttling in dev environments to simulate production load.', strategy: ThrottlingStrategy.StaticThreshold, targetFeatureIds: mockFeatures.map(f => f.id), userSegments: [UserSegment.Developer], thresholdConfig: { staticLoadThreshold: 0.6, durationThreshold: 10, cooldownPeriod: 60 }, activationConditions: ['environment_is_development'], deactivationConditions: ['environment_is_production'], priority: 99, isActive: true, lastModifiedBy: 'dev_ops', lastModifiedDate: '2023-02-12T15:00:00Z', efficacyMetrics: []
  },
];

export const mockAlertDefinitions: AlertDefinition[] = [
  {
    id: 'alert_critical_load', name: 'Critical Cognitive Load', description: 'Total average cognitive load exceeds critical threshold.', severity: AlertSeverity.Critical, condition: 'avgCognitiveLoad > 0.9 for 120s', targetFeatures: [], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 300, autoResolveCondition: 'avgCognitiveLoad < 0.8 for 300s', escalationPolicyId: 'esc_policy_tier1'
  },
  {
    id: 'alert_throttle_failure', name: 'Throttling Mechanism Failure', description: 'Throttling policies are active but load remains high.', severity: AlertSeverity.Emergency, condition: 'policiesActive_true AND avgCognitiveLoad > 0.95 for 60s', targetFeatures: [], targetUserSegments: [], notificationChannels: ['email', 'slack', 'pagerduty'], isActive: true, debouncePeriod: 180, autoResolveCondition: 'avgCognitiveLoad < 0.8 AND policiesActive_false_or_effective', escalationPolicyId: 'esc_policy_tier2'
  },
  {
    id: 'alert_feature_load_spike', name: 'Feature Specific Load Spike', description: 'A single feature is causing disproportionate cognitive load.', severity: AlertSeverity.Warning, condition: 'feature_adv_analytics_cognitiveContribution > 0.3 for 300s', targetFeatures: ['feat_adv_analytics'], targetUserSegments: [], notificationChannels: ['email', 'slack'], isActive: true, debouncePeriod: 600, autoResolveCondition: 'feature_adv_analytics_cognitiveContribution < 0.2', escalationPolicyId: 'esc_policy_tier1'
  },
  {
    id: 'alert_user_segment_distress', name: 'New User Segment Distress', description: 'New users experiencing sustained high cognitive load.', severity: AlertSeverity.Warning, condition: 'userSegment_NewUser_avgCognitiveLoad > 0.8 for 300s', targetFeatures: [], targetUserSegments: [UserSegment.NewUser], notificationChannels: ['email', 'slack'], isActive: true, debouncePeriod: 600, autoResolveCondition: 'userSegment_NewUser_avgCognitiveLoad < 0.7'
  },
];

export const mockAlertInstances: AlertInstance[] = [
  {
    id: 'alert_inst_001', definitionId: 'alert_critical_load', timestamp: '2023-03-01T10:00:00Z', status: 'active', triggeredValue: '0.92', context: { currentLoad: 0.92, activeThrottles: ['AdvancedAnalytics'] }, assignedTo: 'on-call-dev', notes: ['Investigating infrastructure capacity.']
  },
  {
    id: 'alert_inst_002', definitionId: 'alert_feature_load_spike', timestamp: '2023-03-01T09:30:00Z', resolvedTimestamp: '2023-03-01T09:45:00Z', status: 'resolved', triggeredValue: '0.35', context: { feature: 'feat_adv_analytics', affectedUsers: 15 }, assignedTo: 'data-science-team', notes: ['Identified large query, optimized.', 'Resolved automatically.']
  },
  {
    id: 'alert_inst_003', definitionId: 'alert_user_segment_distress', timestamp: '2023-03-02T11:15:00Z', status: 'acknowledged', triggeredValue: '0.81', context: { segment: 'New User', userCount: 200 }, assignedTo: 'product-team', notes: ['Monitoring impact of recent UI change.']
  },
];

export const mockSystemHealthMetrics: SystemHealthMetric[] = Array.from({ length: 20 }).map((_, i) => ({
  timestamp: new Date(Date.now() - (19 - i) * 5 * 1000).toISOString(),
  cpuUsage: Math.random() * 30 + 50, // 50-80%
  memoryUsage: Math.random() * 20 + 60, // 60-80%
  networkLatency: Math.random() * 50 + 20, // 20-70ms
  databaseConnections: Math.floor(Math.random() * 100 + 100), // 100-200
  errorRate: Math.random() * 0.5, // 0-0.5 errors/min
  queueDepth: Math.floor(Math.random() * 200),
  activeUsers: Math.floor(Math.random() * 1000 + 500),
  backgroundTasks: Math.floor(Math.random() * 50 + 10),
  diskIO: Math.floor(Math.random() * 500 + 200),
  apiCallRate: Math.floor(Math.random() * 1000 + 500),
}));

export const mockUserProfiles: UserProfile[] = Array.from({ length: 50 }).map((_, i) => ({
  userId: `user_${i + 1}`,
  segment: i % 3 === 0 ? UserSegment.NewUser : i % 5 === 0 ? UserSegment.Admin : UserSegment.ExperiencedUser,
  onboardingCompletion: i < 10 ? Math.floor(Math.random() * 90) : 100,
  engagementScore: Math.random(),
  recentCognitiveLoadHistory: [], // Populated dynamically or via another mock source
  preferredLanguage: i % 2 === 0 ? 'en-US' : 'es-ES',
  customThrottlePreferences: i % 7 === 0 ? { 'feat_adv_analytics': 'ease' } : {},
  accountStatus: i % 10 === 0 ? 'suspended' : 'active',
  lastActivity: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
}));

export const mockIntegrationConfigs: IntegrationConfig[] = [
  { id: 'int_slack', name: 'Slack Notifications', type: 'slack', status: 'connected', settings: { webhookUrl: 'https://hooks.slack.com/services/mock/mock' }, lastTested: '2023-03-01T08:00:00Z' },
  { id: 'int_pagerduty', name: 'PagerDuty On-Call', type: 'custom_webhook', status: 'connected', settings: { serviceKey: 'mock_key_pd' }, lastTested: '2023-03-01T08:05:00Z' },
  { id: 'int_datadog', name: 'Datadog Metrics', type: 'datadog', status: 'disconnected', settings: { apiKey: 'mock_key_dd' } },
  { id: 'int_email', name: 'Email Alerts', type: 'email', status: 'connected', settings: { smtpHost: 'smtp.mock.com', sender: 'alerts@mock.com' }, lastTested: '2023-03-01T08:10:00Z' },
];

export const mockHistoricalCognitiveData: HistoricalCognitiveData[] = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const avgLoad = Math.random() * 0.4 + 0.4; // 0.4 - 0.8
  return {
    timestamp: date.toISOString(),
    avgLoad: avgLoad,
    maxLoad: Math.min(avgLoad + Math.random() * 0.1, 1.0),
    minLoad: Math.max(avgLoad - Math.random() * 0.1, 0.0),
    activeThrottleDurations: {
      'feat_adv_analytics': avgLoad > 0.7 ? Math.floor(Math.random() * 3600) : 0,
      'feat_realtime_collaboration': avgLoad > 0.75 ? Math.floor(Math.random() * 2400) : 0,
    },
    userSegmentBreakdown: {
      [UserSegment.NewUser]: { avgLoad: Math.random() * 0.2 + avgLoad, userCount: Math.floor(Math.random() * 100) },
      [UserSegment.ExperiencedUser]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 500) },
      [UserSegment.Admin]: { avgLoad: Math.random() * 0.05 + avgLoad, userCount: Math.floor(Math.random() * 50) },
      [UserSegment.PowerUser]: { avgLoad: Math.random() * 0.15 + avgLoad, userCount: Math.floor(Math.random() * 150) },
      [UserSegment.Guest]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 20) },
      [UserSegment.Developer]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 30) },
      [UserSegment.Analyst]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 80) },
      [UserSegment.Manager]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 70) },
      [UserSegment.Executive]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 10) },
      [UserSegment.ExternalPartner]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 25) },
      [UserSegment.InternalSupport]: { avgLoad: Math.random() * 0.1 + avgLoad, userCount: Math.floor(Math.random() * 40) },
    },
    featureContribution: {
      'feat_adv_analytics': avgLoad * 0.3,
      'feat_realtime_collaboration': avgLoad * 0.25,
      'feat_task_management': avgLoad * 0.1,
      'feat_reporting_dashboard': avgLoad * 0.15,
      'feat_ai_assistant': avgLoad * 0.2,
    },
  };
});

export const mockPredictiveForecast: PredictiveForecast[] = Array.from({ length: 7 }).map((_, i) => {
  const date = new Date();
  date.setHours(date.getHours() + i * 4);
  const forecastedLoad = Math.random() * 0.3 + 0.5; // 0.5 - 0.8
  return {
    timestamp: date.toISOString(),
    forecastedLoad: forecastedLoad,
    confidenceInterval: [Math.max(0.0, forecastedLoad - 0.1), Math.min(1.0, forecastedLoad + 0.1)],
    influencingFactors: {
      'peak_hours_probability': Math.random(),
      'large_query_expected': Math.random() > 0.7 ? 1 : 0,
      'marketing_campaign_effect': Math.random() > 0.8 ? 0.5 : 0,
    },
    recommendedActions: forecastedLoad > 0.75 ? [{ featureId: 'feat_adv_analytics', action: 'throttle', rationale: 'Proactive reduction for forecasted peak.' }] : [],
  };
});

export const mockFeedbackLoopStatus: FeedbackLoopStatus = {
  lastEvaluationTimestamp: new Date().toISOString(),
  policiesEvaluated: mockThrottlingPolicies.map(p => p.id),
  proposedAdjustments: {},
  efficacyScore: 0.85,
  nextEvaluationDue: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  statusMessage: 'Optimizing for balanced performance and user satisfaction.',
  optimizationGoal: 'balance_load_and_usage',
};

// Data Hooks (simulating data fetching and state management) ---------------------------------------------------------

/**
 * @function useFeatureDefinitions
 * @description Hook to manage and fetch feature definitions.
 * @returns {{ features: FeatureDefinition[], loading: boolean, error: string | null, fetchFeatures: () => Promise<void>, addFeature: (feature: Partial<FeatureDefinition>) => Promise<void>, updateFeature: (feature: FeatureDefinition) => Promise<void> }}
 */
export const useFeatureDefinitions = () => {
  const [features, setFeatures] = useState<FeatureDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const data: FeatureDefinition[] = await mockBackendAPI('features', 'GET');
      setFeatures(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch features.');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = async (feature: Partial<FeatureDefinition>) => {
    try {
      const newFeature: FeatureDefinition = {
        id: generateUUID(),
        name: feature.name || 'New Feature',
        description: feature.description || '',
        category: feature.category || FeatureCategory.Utility,
        cognitiveWeight: feature.cognitiveWeight || 0.5,
        baseThrottleThreshold: feature.baseThrottleThreshold || 0.6,
        isActive: feature.isActive !== undefined ? feature.isActive : true,
        dependencies: feature.dependencies || [],
        impactMetrics: feature.impactMetrics || [],
        recoveryTimeEstimate: feature.recoveryTimeEstimate || 60,
        lastUpdated: new Date().toISOString(),
        ownerTeam: feature.ownerTeam || 'Unknown',
        rolloutStrategy: feature.rolloutStrategy || 'all_users',
      };
      const addedFeature: FeatureDefinition = await mockBackendAPI('features', 'POST', newFeature);
      setFeatures(prev => [...prev, addedFeature]);
      return addedFeature;
    } catch (err: any) {
      setError(err.message || 'Failed to add feature.');
      throw err;
    }
  };

  const updateFeature = async (feature: FeatureDefinition) => {
    try {
      const updatedFeature: FeatureDefinition = await mockBackendAPI('features', 'PUT', feature);
      setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
      return updatedFeature;
    } catch (err: any) {
      setError(err.message || 'Failed to update feature.');
      throw err;
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return { features, loading, error, fetchFeatures, addFeature, updateFeature };
};

/**
 * @function useThrottlingPolicies
 * @description Hook to manage and fetch throttling policies.
 * @returns {{ policies: ThrottlingPolicy[], loading: boolean, error: string | null, fetchPolicies: () => Promise<void>, addPolicy: (policy: Partial<ThrottlingPolicy>) => Promise<void>, updatePolicy: (policy: ThrottlingPolicy) => Promise<void> }}
 */
export const useThrottlingPolicies = () => {
  const [policies, setPolicies] = useState<ThrottlingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data: ThrottlingPolicy[] = await mockBackendAPI('policies', 'GET');
      setPolicies(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch policies.');
    } finally {
      setLoading(false);
    }
  };

  const addPolicy = async (policy: Partial<ThrottlingPolicy>) => {
    try {
      const newPolicy: ThrottlingPolicy = {
        id: generateUUID(),
        name: policy.name || 'New Policy',
        description: policy.description || '',
        strategy: policy.strategy || ThrottlingStrategy.StaticThreshold,
        targetFeatureIds: policy.targetFeatureIds || [],
        userSegments: policy.userSegments || [],
        thresholdConfig: policy.thresholdConfig || {},
        activationConditions: policy.activationConditions || [],
        deactivationConditions: policy.deactivationConditions || [],
        priority: policy.priority || 10,
        isActive: policy.isActive !== undefined ? policy.isActive : true,
        lastModifiedBy: 'admin',
        lastModifiedDate: new Date().toISOString(),
        efficacyMetrics: policy.efficacyMetrics || [],
      };
      const addedPolicy: ThrottlingPolicy = await mockBackendAPI('policies', 'POST', newPolicy);
      setPolicies(prev => [...prev, addedPolicy]);
      return addedPolicy;
    } catch (err: any) {
      setError(err.message || 'Failed to add policy.');
      throw err;
    }
  };

  const updatePolicy = async (policy: ThrottlingPolicy) => {
    try {
      const updatedPolicy: ThrottlingPolicy = await mockBackendAPI('policies', 'PUT', policy);
      setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
      return updatedPolicy;
    } catch (err: any) {
      setError(err.message || 'Failed to update policy.');
      throw err;
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return { policies, loading, error, fetchPolicies, addPolicy, updatePolicy };
};

/**
 * @function useAlerts
 * @description Hook to manage and fetch alert definitions and instances.
 * @returns {{ definitions: AlertDefinition[], instances: AlertInstance[], loading: boolean, error: string | null, fetchDefinitions: () => Promise<void>, fetchInstances: () => Promise<void>, createDefinition: (def: Partial<AlertDefinition>) => Promise<void>, updateInstance: (instance: AlertInstance) => Promise<void> }}
 */
export const useAlerts = () => {
  const [definitions, setDefinitions] = useState<AlertDefinition[]>([]);
  const [instances, setInstances] = useState<AlertInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDefinitions = async () => {
    setLoading(true);
    try {
      const data: AlertDefinition[] = await mockBackendAPI('alerts/definitions', 'GET');
      setDefinitions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alert definitions.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const data: AlertInstance[] = await mockBackendAPI('alerts/instances', 'GET');
      setInstances(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alert instances.');
    } finally {
      setLoading(false);
    }
  };

  const createDefinition = async (def: Partial<AlertDefinition>) => {
    try {
      const newDef: AlertDefinition = {
        id: generateUUID(),
        name: def.name || 'New Alert',
        description: def.description || '',
        severity: def.severity || AlertSeverity.Warning,
        condition: def.condition || 'avgCognitiveLoad > 0.8',
        targetFeatures: def.targetFeatures || [],
        targetUserSegments: def.targetUserSegments || [],
        notificationChannels: def.notificationChannels || ['email'],
        isActive: def.isActive !== undefined ? def.isActive : true,
        debouncePeriod: def.debouncePeriod || 300,
        autoResolveCondition: def.autoResolveCondition || 'avgCognitiveLoad < 0.7',
      };
      const addedDef: AlertDefinition = await mockBackendAPI('alerts/definitions', 'POST', newDef);
      setDefinitions(prev => [...prev, addedDef]);
      return addedDef;
    } catch (err: any) {
      setError(err.message || 'Failed to create alert definition.');
      throw err;
    }
  };

  const updateInstance = async (instance: AlertInstance) => {
    try {
      // Mock API doesn't support PUT for instances, so we'll just update local state
      setInstances(prev => prev.map(i => i.id === instance.id ? instance : i));
    } catch (err: any) {
      setError(err.message || 'Failed to update alert instance.');
      throw err;
    }
  };

  useEffect(() => {
    fetchDefinitions();
    fetchInstances();
  }, []);

  return { definitions, instances, loading, error, fetchDefinitions, fetchInstances, createDefinition, updateInstance };
};

/**
 * @function useSystemHealth
 * @description Hook to fetch real-time and historical system health metrics.
 * @returns {{ currentMetrics: SystemHealthMetric | null, history: SystemHealthMetric[], loading: boolean, error: string | null }}
 */
export const useSystemHealth = () => {
  const [currentMetrics, setCurrentMetrics] = useState<SystemHealthMetric | null>(null);
  const [history, setHistory] = useState<SystemHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    mockBackendAPI('system_health', 'GET').then((data: SystemHealthMetric[]) => {
      setHistory(data);
      if (data.length > 0) {
        setCurrentMetrics(data[data.length - 1]);
      }
      setLoading(false);
    }).catch(err => {
      setError(err.message || 'Failed to fetch system health data.');
      setLoading(false);
    });

    const interval = setInterval(() => {
      const newMetric: SystemHealthMetric = {
        timestamp: new Date().toISOString(),
        cpuUsage: Math.random() * 20 + 70, // Fluctuating high
        memoryUsage: Math.random() * 10 + 80,
        networkLatency: Math.random() * 30 + 10,
        databaseConnections: Math.floor(Math.random() * 50 + 150),
        errorRate: Math.random() * 0.8,
        queueDepth: Math.floor(Math.random() * 300),
        activeUsers: Math.floor(Math.random() * 1000 + 700),
        backgroundTasks: Math.floor(Math.random() * 20 + 30),
        diskIO: Math.floor(Math.random() * 300 + 400),
        apiCallRate: Math.floor(Math.random() * 800 + 1200),
      };
      setCurrentMetrics(newMetric);
      setHistory(prev => [...prev.slice(-19), newMetric]); // Keep last 20
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { currentMetrics, history, loading, error };
};

/**
 * @function useUserProfiles
 * @description Hook to manage and fetch user profiles.
 * @returns {{ users: UserProfile[], loading: boolean, error: string | null, fetchUsers: () => Promise<void> }}
 */
export const useUserProfiles = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data: UserProfile[] = await mockBackendAPI('users', 'GET');
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, fetchUsers };
};

/**
 * @function useHistoricalData
 * @description Hook to fetch historical cognitive load data.
 * @returns {{ history: HistoricalCognitiveData[], loading: boolean, error: string | null, fetchHistoricalData: () => Promise<void> }}
 */
export const useHistoricalData = () => {
  const [history, setHistory] = useState<HistoricalCognitiveData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const data: HistoricalCognitiveData[] = await mockBackendAPI('historical_data', 'GET');
      setHistory(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch historical data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  return { history, loading, error, fetchHistoricalData };
};

/**
 * @function usePredictiveAnalytics
 * @description Hook to fetch and manage predictive load forecasts.
 * @returns {{ forecast: PredictiveForecast[], loading: boolean, error: string | null, fetchForecast: () => Promise<void> }}
 */
export const usePredictiveAnalytics = () => {
  const [forecast, setForecast] = useState<PredictiveForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data: PredictiveForecast[] = await mockBackendAPI('forecast', 'GET');
      setForecast(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch forecast data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  return { forecast, loading, error, fetchForecast };
};

/**
 * @function useFeedbackLoop
 * @description Hook to fetch and manage feedback loop status.
 * @returns {{ status: FeedbackLoopStatus | null, loading: boolean, error: string | null, fetchStatus: () => Promise<void> }}
 */
export const useFeedbackLoop = () => {
  const [status, setStatus] = useState<FeedbackLoopStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data: FeedbackLoopStatus = await mockBackendAPI('feedback_loop', 'GET');
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedback loop status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return { status, loading, error, fetchStatus };
};

/**
 * @function useIntegrationConfigs
 * @description Hook to manage and fetch integration configurations.
 * @returns {{ configs: IntegrationConfig[], loading: boolean, error: string | null, fetchConfigs: () => Promise<void>, addConfig: (config: Partial<IntegrationConfig>) => Promise<void>, updateConfig: (config: IntegrationConfig) => Promise<void> }}
 */
export const useIntegrationConfigs = () => {
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const data: IntegrationConfig[] = await mockBackendAPI('integrations', 'GET');
      setConfigs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch integration configs.');
    } finally {
      setLoading(false);
    }
  };

  const addConfig = async (config: Partial<IntegrationConfig>) => {
    try {
      const newConfig: IntegrationConfig = {
        id: generateUUID(),
        name: config.name || 'New Integration',
        type: config.type || 'custom_webhook',
        status: 'disconnected',
        settings: config.settings || {},
        lastTested: undefined,
      };
      const addedConfig: IntegrationConfig = await mockBackendAPI('integrations', 'POST', newConfig);
      setConfigs(prev => [...prev, addedConfig]);
      return addedConfig;
    } catch (err: any) {
      setError(err.message || 'Failed to add integration config.');
      throw err;
    }
  };

  const updateConfig = async (config: IntegrationConfig) => {
    try {
      // Mock API doesn't support PUT for integrations, simulating local update
      setConfigs(prev => prev.map(c => c.id === config.id ? { ...c, ...config } : c));
      return config;
    } catch (err: any) {
      setError(err.message || 'Failed to update integration config.');
      throw err;
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return { configs, loading, error, fetchConfigs, addConfig, updateConfig };
};

// UI Components (Sub-views) -------------------------------------------------------------------------------------------

/**
 * @const CognitiveLoadGauge
 * @description A visual gauge component for displaying current cognitive load.
 * @param {{ load: number }} props - The current cognitive load (0.0 to 1.0).
 */
export const CognitiveLoadGauge: React.FC<{ load: number }> = ({ load }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (load * circumference);
  const loadColor = getLoadColorClass(load).replace('text-', '');

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className={`transition-all duration-500 ease-in-out ${loadColor}`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-xl font-bold ${getLoadColorClass(load)}`}
        >
          {(load * 100).toFixed(1)}%
        </text>
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12 text-center text-gray-400 text-sm">
        Avg. Load
      </div>
    </div>
  );
};

/**
 * @const FeatureStatusCard
 * @description Displays the status of individual features, including their cognitive weight and current throttling status.
 * @param {{ feature: FeatureDefinition, isThrottled: boolean }} props
 */
export const FeatureStatusCard: React.FC<{ feature: FeatureDefinition; isThrottled: boolean }> = ({ feature, isThrottled }) => {
  const loadColor = getLoadColorClass(feature.cognitiveWeight);
  return (
    <div className={`bg-gray-700 p-4 rounded-lg shadow-md flex flex-col justify-between ${isThrottled ? 'border border-orange-500' : ''}`}>
      <div>
        <h3 className="text-lg font-semibold text-white">{feature.name}</h3>
        <p className="text-sm text-gray-400 mb-2">{feature.description}</p>
        <div className="flex items-center text-sm">
          <span className="text-gray-300">Cognitive Weight: </span>
          <span className={`ml-2 font-bold ${loadColor}`}>{feature.cognitiveWeight.toFixed(2)}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-300">Base Threshold: </span>
          <span className="ml-2 text-blue-300">{feature.baseThrottleThreshold.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-3">
        {isThrottled ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-600 text-white">
            <span className="mr-1 animate-pulse">•</span> Throttled
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-700 text-green-100">
            Active
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * @const ThrottlingPoliciesTable
 * @description Displays a table of all defined throttling policies.
 * @param {{ policies: ThrottlingPolicy[], onEditPolicy: (policy: ThrottlingPolicy) => void }} props
 */
export const ThrottlingPoliciesTable: React.FC<{ policies: ThrottlingPolicy[]; onEditPolicy: (policy: ThrottlingPolicy) => void }> = ({ policies, onEditPolicy }) => {
  if (policies.length === 0) {
    return <p className="text-gray-400">No throttling policies defined.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Strategy</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Target Features</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User Segments</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {policies.map(policy => (
            <tr key={policy.id} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{policy.name}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.strategy}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.targetFeatureIds.map(id => mockFeatures.find(f => f.id === id)?.name || id).join(', ')}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.userSegments.join(', ') || 'All'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{policy.priority}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.isActive ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                  {policy.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditPolicy(policy)}
                  className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * @const AlertsList
 * @description Displays a list of active and recent alert instances.
 * @param {{ alerts: AlertInstance[], definitions: AlertDefinition[], onAcknowledge: (alert: AlertInstance) => void, onResolve: (alert: AlertInstance) => void }} props
 */
export const AlertsList: React.FC<{ alerts: AlertInstance[]; definitions: AlertDefinition[]; onAcknowledge: (alert: AlertInstance) => void; onResolve: (alert: AlertInstance) => void }> = ({ alerts, definitions, onAcknowledge, onResolve }) => {
  if (alerts.length === 0) {
    return <p className="text-gray-400">No active or recent alerts.</p>;
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.Critical: return 'bg-red-800 text-red-100';
      case AlertSeverity.Emergency: return 'bg-purple-800 text-purple-100';
      case AlertSeverity.Warning: return 'bg-yellow-600 text-yellow-100';
      case AlertSeverity.Info: return 'bg-blue-600 text-blue-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      {sortedAlerts.map(alert => {
        const definition = definitions.find(def => def.id === alert.definitionId);
        return (
          <div key={alert.id} className={`bg-gray-700 p-4 rounded-lg shadow-md border-l-4 ${alert.status === 'active' ? 'border-red-500' : alert.status === 'acknowledged' ? 'border-yellow-500' : 'border-green-500'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{definition?.name || 'Unknown Alert'}</h3>
                <p className="text-sm text-gray-400">{definition?.description || alert.context.message || 'No description available.'}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(definition?.severity || AlertSeverity.Info)}`}>
                  {definition?.severity || 'Info'}
                </span>
                <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-300">Status: <span className={`font-semibold ${alert.status === 'active' ? 'text-red-400' : alert.status === 'acknowledged' ? 'text-yellow-400' : 'text-green-400'}`}>{alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</span></span>
              <div className="space-x-2">
                {alert.status === 'active' && (
                  <>
                    <button
                      onClick={() => onAcknowledge(alert)}
                      className="text-blue-400 hover:text-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => onResolve(alert)}
                      className="text-green-400 hover:text-green-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Resolve
                    </button>
                  </>
                )}
                {alert.status === 'acknowledged' && (
                  <button
                    onClick={() => onResolve(alert)}
                    className="text-green-400 hover:text-green-600 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * @const SystemHealthSummaryCard
 * @description Displays key system health metrics in a card format.
 * @param {{ metrics: SystemHealthMetric | null }} props
 */
export const SystemHealthSummaryCard: React.FC<{ metrics: SystemHealthMetric | null }> = ({ metrics }) => {
  if (!metrics) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">Loading system health...</div>;
  }

  const getMetricColor = (value: number, threshold: number, reverse: boolean = false) => {
    if (reverse) return value < threshold ? 'text-green-400' : value < threshold * 1.2 ? 'text-yellow-400' : 'text-red-400';
    return value > threshold ? 'text-red-400' : value > threshold * 0.8 ? 'text-yellow-400' : 'text-green-400';
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">System Health Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">CPU:</span>
          <span className={`font-semibold ${getMetricColor(metrics.cpuUsage, 85)}`}>{metrics.cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Memory:</span>
          <span className={`font-semibold ${getMetricColor(metrics.memoryUsage, 80)}`}>{metrics.memoryUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Latency:</span>
          <span className={`font-semibold ${getMetricColor(metrics.networkLatency, 100)}`}>{metrics.networkLatency.toFixed(1)}ms</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Errors:</span>
          <span className={`font-semibold ${getMetricColor(metrics.errorRate, 1, true)}`}>{metrics.errorRate.toFixed(2)}/min</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Active Users:</span>
          <span className="font-semibold text-blue-400">{metrics.activeUsers}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">API Rate:</span>
          <span className="font-semibold text-blue-400">{metrics.apiCallRate.toFixed(0)}/s</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4 text-right">Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}</p>
    </div>
  );
};

/**
 * @const DataPoint
 * @description Represents a single data point for a chart, used by mock chart components.
 * @property {string} name - The label for the data point (e.g., timestamp, category name).
 * @property {number} value - The numeric value of the data point.
 */
interface DataPoint {
  name: string;
  value: number;
  [key: string]: any; // Allow for additional properties like 'avgLoad', 'maxLoad'
}

/**
 * @const MockLineChart
 * @description A highly simplified mock line chart component.
 * In a real application, this would use a charting library like Recharts or Chart.js.
 * @param {{ data: DataPoint[], dataKeys: string[], title: string, xAxisLabel: string, yAxisLabel: string }} props
 */
export const MockLineChart: React.FC<{ data: DataPoint[]; dataKeys: string[]; title: string; xAxisLabel: string; yAxisLabel: string }> = ({ data, dataKeys, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">No data for {title}.</div>;
  }

  // Simple min/max for scaling
  const allValues = data.flatMap(d => dataKeys.map(key => d[key]));
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const scaleY = (val: number) => {
    if (maxValue === minValue) return 50;
    return 100 - ((val - minValue) / (maxValue - minValue)) * 100;
  };

  const scaleX = (index: number) => (index / (data.length - 1)) * 100;

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="relative h-64 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute w-full h-full">
          {/* Y-axis labels (simplified) */}
          <text x="0" y="5" className="text-xs fill-gray-400">{maxValue.toFixed(2)}</text>
          <text x="0" y="95" className="text-xs fill-gray-400">{minValue.toFixed(2)}</text>

          {/* Lines */}
          {dataKeys.map((key, kIdx) => (
            <polyline
              key={key}
              fill="none"
              stroke={colors[kIdx % colors.length]}
              strokeWidth="2"
              points={data.map((d, i) => `${scaleX(i)},${scaleY(d[key])}`).join(' ')}
            />
          ))}
          {/* Points */}
          {dataKeys.map((key, kIdx) => (
            data.map((d, i) => (
              <circle
                key={`${key}-${i}`}
                cx={scaleX(i)}
                cy={scaleY(d[key])}
                r="1"
                fill={colors[kIdx % colors.length]}
              />
            ))
          ))}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{xAxisLabel} (Start)</span>
        <span>{xAxisLabel} (End)</span>
      </div>
      <div className="flex justify-center mt-4">
        {dataKeys.map((key, kIdx) => (
          <div key={key} className="flex items-center mr-4">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[kIdx % colors.length] }}></span>
            <span className="text-sm text-gray-300">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @const MockBarChart
 * @description A highly simplified mock bar chart component.
 * @param {{ data: DataPoint[], dataKey: string, title: string, xAxisLabel: string, yAxisLabel: string }} props
 */
export const MockBarChart: React.FC<{ data: DataPoint[]; dataKey: string; title: string; xAxisLabel: string; yAxisLabel: string }> = ({ data, dataKey, title, xAxisLabel, yAxisLabel }) => {
  if (!data || data.length === 0) {
    return <div className="bg-gray-800 p-4 rounded-lg text-center text-gray-400">No data for {title}.</div>;
  }

  const values = data.map(d => d[dataKey]);
  const maxValue = Math.max(...values, 0); // Ensure max is at least 0
  const barWidth = 80 / data.length; // Max 80% width to leave space

  const scaleY = (val: number) => {
    if (maxValue === 0) return 0;
    return (val / maxValue) * 100;
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <div className="relative h-64 w-full flex items-end pt-4">
        {data.map((d, i) => (
          <div
            key={d.name}
            className="flex-grow h-full flex flex-col justify-end items-center mx-1"
            style={{ width: `${barWidth}%` }}
          >
            <div
              className={`bg-blue-500 w-3/4 rounded-t-sm transition-all duration-500 ease-out`}
              style={{ height: `${scaleY(d[dataKey])}%` }}
            ></div>
            <span className="text-xs text-gray-400 mt-1">{d.name.substring(0, 5)}...</span>
            <span className="text-xs text-gray-300">{d[dataKey].toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>{xAxisLabel}</span>
        <span>{yAxisLabel}</span>
      </div>
    </div>
  );
};

/**
 * @const PredictiveForecastCard
 * @description Displays the next forecasted cognitive load and recommended actions.
 * @param {{ forecast: PredictiveForecast | null }} props
 */
export const PredictiveForecastCard: React.FC<{ forecast: PredictiveForecast | null }> = ({ forecast }) => {
  if (!forecast) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">No forecast available.</div>;
  }

  const loadColor = getLoadColorClass(forecast.forecastedLoad);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Predictive Load Forecast</h3>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-gray-400 text-sm">Forecasted Load ({new Date(forecast.timestamp).toLocaleTimeString()}):</p>
          <p className={`text-3xl font-bold ${loadColor}`}>{(forecast.forecastedLoad * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Confidence: {(forecast.confidenceInterval[0] * 100).toFixed(0)}% - {(forecast.confidenceInterval[1] * 100).toFixed(0)}%</p>
        </div>
        <div className="text-right">
          {forecast.recommendedActions.length > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-red-100">
              <span className="mr-1 animate-pulse">•</span> Action Recommended
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-700 text-green-100">
              No Immediate Action
            </span>
          )}
        </div>
      </div>
      {forecast.recommendedActions.length > 0 && (
        <div className="mt-4 border-t border-gray-600 pt-4">
          <p className="text-lg font-semibold text-red-300 mb-2">Recommended Actions:</p>
          <ul className="list-disc list-inside text-gray-300">
            {forecast.recommendedActions.map((action, index) => (
              <li key={index}>
                <span className="font-medium text-white">{action.action === 'throttle' ? 'Throttle' : 'Ease'} "{mockFeatures.find(f => f.id === action.featureId)?.name || action.featureId}"</span>: {action.rationale}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 border-t border-gray-600 pt-4">
        <p className="text-sm font-semibold text-gray-300 mb-2">Key Influencing Factors:</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
          {Object.entries(forecast.influencingFactors).map(([factor, value]) => (
            <div key={factor}>
              <span className="font-medium">{factor}:</span> <span className={`${value > 0.5 ? 'text-orange-300' : 'text-gray-400'}`}>{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * @const FeatureEditorForm
 * @description A form for editing or adding FeatureDefinition.
 * @param {{ feature?: FeatureDefinition; onSave: (feature: FeatureDefinition) => void; onCancel: () => void }} props
 */
export const FeatureEditorForm: React.FC<{ feature?: FeatureDefinition; onSave: (feature: FeatureDefinition) => void; onCancel: () => void }> = ({ feature, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FeatureDefinition>(
    feature || {
      id: generateUUID(), name: '', description: '', category: FeatureCategory.Utility, cognitiveWeight: 0.5,
      baseThrottleThreshold: 0.7, isActive: true, dependencies: [], impactMetrics: [], recoveryTimeEstimate: 60,
      lastUpdated: new Date().toISOString(), ownerTeam: '', rolloutStrategy: 'all_users'
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastUpdated: new Date().toISOString() });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{feature ? 'Edit Feature' : 'Add New Feature'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Feature Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
          <select
            id="category" name="category" value={formData.category} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(FeatureCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cognitiveWeight" className="block text-sm font-medium text-gray-300">Cognitive Weight (0.0-1.0)</label>
            <input
              type="number" id="cognitiveWeight" name="cognitiveWeight" value={formData.cognitiveWeight} onChange={handleChange}
              min="0" max="1" step="0.01" required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="baseThrottleThreshold" className="block text-sm font-medium text-gray-300">Base Throttle Threshold (0.0-1.0)</label>
            <input
              type="number" id="baseThrottleThreshold" name="baseThrottleThreshold" value={formData.baseThrottleThreshold} onChange={handleChange}
              min="0" max="1" step="0.01" required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="recoveryTimeEstimate" className="block text-sm font-medium text-gray-300">Recovery Time Estimate (seconds)</label>
          <input
            type="number" id="recoveryTimeEstimate" name="recoveryTimeEstimate" value={formData.recoveryTimeEstimate} onChange={handleChange}
            min="0" required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="ownerTeam" className="block text-sm font-medium text-gray-300">Owner Team</label>
          <input
            type="text" id="ownerTeam" name="ownerTeam" value={formData.ownerTeam} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="rolloutStrategy" className="block text-sm font-medium text-gray-300">Rollout Strategy</label>
          <select
            id="rolloutStrategy" name="rolloutStrategy" value={formData.rolloutStrategy} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all_users">All Users</option>
            <option value="beta_testers">Beta Testers</option>
            <option value="segment_specific">Segment Specific</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Feature
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * @const PolicyEditorForm
 * @description A form for editing or adding ThrottlingPolicy.
 * @param {{ policy?: ThrottlingPolicy; allFeatures: FeatureDefinition[]; onSave: (policy: ThrottlingPolicy) => void; onCancel: () => void }} props
 */
export const PolicyEditorForm: React.FC<{ policy?: ThrottlingPolicy; allFeatures: FeatureDefinition[]; onSave: (policy: ThrottlingPolicy) => void; onCancel: () => void }> = ({ policy, allFeatures, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ThrottlingPolicy>(
    policy || {
      id: generateUUID(), name: '', description: '', strategy: ThrottlingStrategy.StaticThreshold,
      targetFeatureIds: [], userSegments: [], thresholdConfig: { staticLoadThreshold: 0.7 },
      activationConditions: [], deactivationConditions: [], priority: 10, isActive: true,
      lastModifiedBy: 'admin', lastModifiedDate: new Date().toISOString(), efficacyMetrics: []
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const value = Array.from(options).filter(option => option.selected).map(option => option.value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThresholdConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      thresholdConfig: {
        ...prev.thresholdConfig,
        [name]: type === 'number' ? parseFloat(value) : value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, lastModifiedDate: new Date().toISOString() });
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-2xl font-bold text-white mb-6">{policy ? 'Edit Throttling Policy' : 'Add New Throttling Policy'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Policy Name</label>
          <input
            type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            id="description" name="description" value={formData.description} onChange={handleChange} rows={3}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="strategy" className="block text-sm font-medium text-gray-300">Strategy</label>
          <select
            id="strategy" name="strategy" value={formData.strategy} onChange={handleChange} required
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(ThrottlingStrategy).map(strat => (
              <option key={strat} value={strat}>{strat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="targetFeatureIds" className="block text-sm font-medium text-gray-300">Target Features</label>
          <select
            id="targetFeatureIds" name="targetFeatureIds" multiple value={formData.targetFeatureIds} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
          >
            {allFeatures.map(feat => (
              <option key={feat.id} value={feat.id}>{feat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="userSegments" className="block text-sm font-medium text-gray-300">Target User Segments</label>
          <select
            id="userSegments" name="userSegments" multiple value={formData.userSegments} onChange={handleMultiSelectChange}
            className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
          >
            {Object.values(UserSegment).map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority (lower is higher)</label>
            <input
              type="number" id="priority" name="priority" value={formData.priority} onChange={handleChange}
              min="0" required
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="staticLoadThreshold" className="block text-sm font-medium text-gray-300">Static Load Threshold</label>
            <input
              type="number" id="staticLoadThreshold" name="staticLoadThreshold" value={formData.thresholdConfig.staticLoadThreshold || ''} onChange={handleThresholdConfigChange}
              min="0" max="1" step="0.01"
              className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex items-center">
          <input
            id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">Is Active</label>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button" onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Policy
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * @const IntegrationConfigTable
 * @description Displays a table of all configured integrations.
 * @param {{ configs: IntegrationConfig[], onEditConfig: (config: IntegrationConfig) => void }} props
 */
export const IntegrationConfigTable: React.FC<{ configs: IntegrationConfig[]; onEditConfig: (config: IntegrationConfig) => void }> = ({ configs, onEditConfig }) => {
  if (configs.length === 0) {
    return <p className="text-gray-400">No integrations configured.</p>;
  }

  const getStatusColor = (status: IntegrationConfig['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-700 text-green-100';
      case 'disconnected': return 'bg-red-700 text-red-100';
      case 'error': return 'bg-orange-700 text-orange-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/50">
          <tr>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Tested</th>
            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {configs.map(config => (
            <tr key={config.id} className="hover:bg-gray-700">
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-white">{config.name}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{config.type}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(config.status)}`}>
                  {config.status.charAt(0).toUpperCase() + config.status.slice(1)}
                </span>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{config.lastTested ? new Date(config.lastTested).toLocaleString() : 'N/A'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEditConfig(config)}
                  className="text-indigo-400 hover:text-indigo-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => console.log(`Testing integration ${config.name}`)}
                  className="text-blue-400 hover:text-blue-600 ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Test
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * @const UserSegmentDistribution
 * @description Displays cognitive load distribution across user segments.
 * @param {{ historicalData: HistoricalCognitiveData[] }} props
 */
export const UserSegmentDistribution: React.FC<{ historicalData: HistoricalCognitiveData[] }> = ({ historicalData }) => {
  if (historicalData.length === 0) {
    return <p className="text-gray-400">No historical user segment data available.</p>;
  }

  // Get latest segment breakdown for a snapshot
  const latestData = historicalData[historicalData.length - 1];
  const segmentDataPoints: DataPoint[] = Object.entries(latestData.userSegmentBreakdown).map(([segment, metrics]) => ({
    name: segment,
    value: metrics.avgLoad,
    userCount: metrics.userCount,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">User Segment Load Distribution</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segmentDataPoints.map(dp => (
          <div key={dp.name} className="bg-gray-800 p-3 rounded-md flex flex-col justify-between">
            <h4 className="font-semibold text-white">{dp.name}</h4>
            <p className={`text-2xl font-bold ${getLoadColorClass(dp.value)}`}>{(dp.value * 100).toFixed(1)}%</p>
            <p className="text-sm text-gray-400">{dp.userCount} users</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * @const FeedbackLoopStatusCard
 * @description Displays the status of the adaptive feedback loop.
 * @param {{ status: FeedbackLoopStatus | null }} props
 */
export const FeedbackLoopStatusCard: React.FC<{ status: FeedbackLoopStatus | null }> = ({ status }) => {
  if (!status) {
    return <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-400">Loading feedback loop status...</div>;
  }

  const efficacyColor = getLoadColorClass(status.efficacyScore).replace('text-', '');

  return (
    <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Adaptive Feedback Loop</h3>
      <div className="mb-4">
        <p className="text-gray-400">Status Message:</p>
        <p className="text-lg text-white font-medium">{status.statusMessage}</p>
      </div>
      <div className="flex justify-between items-center mb-4 border-t border-gray-600 pt-4">
        <div>
          <p className="text-gray-400 text-sm">Last Evaluation:</p>
          <p className="text-white">{new Date(status.lastEvaluationTimestamp).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Next Evaluation:</p>
          <p className="text-white">{new Date(status.nextEvaluationDue).toLocaleString()}</p>
        </div>
      </div>
      <div className="mb-4 border-t border-gray-600 pt-4">
        <p className="text-gray-400 text-sm">Current Efficacy Score:</p>
        <div className="flex items-center">
          <span className={`text-4xl font-bold mr-2 ${efficacyColor}`}>{(status.efficacyScore * 100).toFixed(1)}</span>
          <span className={`text-xl ${efficacyColor}`}>%</span>
        </div>
        <p className="text-sm text-gray-500">Optimization Goal: {status.optimizationGoal.replace(/_/g, ' ')}</p>
      </div>
      {Object.keys(status.proposedAdjustments).length > 0 && (
        <div className="mt-4 border-t border-gray-600 pt-4">
          <p className="text-lg font-semibold text-blue-300 mb-2">Proposed Adjustments:</p>
          <ul className="list-disc list-inside text-gray-300">
            {Object.entries(status.proposedAdjustments).map(([policyId, adjustment]) => (
              <li key={policyId}>
                <span className="font-medium text-white">Policy "{mockThrottlingPolicies.find(p => p.id === policyId)?.name || policyId}":</span> {adjustment}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Review & Apply Optimizations
      </button>
    </div>
  );
};

// Main View Component -------------------------------------------------------------------------------------------------

/**
 * @const CognitiveLoadBalancerView
 * @description The main dashboard for monitoring and managing cognitive load balancing.
 * This component integrates various sub-components and hooks to provide a comprehensive view
 * of real-time metrics, historical data, feature management, throttling policies, alerts,
 * system health, and predictive analytics.
 */
const CognitiveLoadBalancerView: React.FC = () => {
  // Original state for real-time metrics
  const [metrics, setMetrics] = useState<CognitiveMetric[]>([]);

  // State for managing feature/policy editing modals
  const [showFeatureEditor, setShowFeatureEditor] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureDefinition | undefined>(undefined);
  const [showPolicyEditor, setShowPolicyEditor] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ThrottlingPolicy | undefined>(undefined);
  const [showIntegrationEditor, setShowIntegrationEditor] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | undefined>(undefined);

  // Custom hooks for data management
  const { features, loading: featuresLoading, error: featuresError, fetchFeatures, addFeature, updateFeature } = useFeatureDefinitions();
  const { policies, loading: policiesLoading, error: policiesError, fetchPolicies, addPolicy, updatePolicy } = useThrottlingPolicies();
  const { definitions: alertDefs, instances: alertInstances, loading: alertsLoading, error: alertsError, fetchInstances: fetchAlertInstances, updateInstance: updateAlertInstance } = useAlerts();
  const { currentMetrics: systemHealth, history: systemHealthHistory, loading: systemHealthLoading, error: systemHealthError } = useSystemHealth();
  const { users, loading: usersLoading, error: usersError } = useUserProfiles();
  const { history: historicalCognitiveData, loading: historicalLoading, error: historicalError } = useHistoricalData();
  const { forecast: predictiveForecasts, loading: forecastLoading, error: forecastError } = usePredictiveAnalytics();
  const { status: feedbackLoopStatus, loading: feedbackLoading, error: feedbackError } = useFeedbackLoop();
  const { configs: integrationConfigs, loading: integrationLoading, error: integrationError, addConfig, updateConfig } = useIntegrationConfigs();


  // MOCK WEBSOCKET for real-time cognitive metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const load = Math.random() * 0.4 + 0.5; // High load scenario
      const throttles: string[] = [];
      const currentTimestamp = new Date().toISOString();

      // Simulate throttling based on policies and current load
      const activePolicies = policies.filter(p => p.isActive);
      activePolicies.forEach(policy => {
        // Simple logic: if current load is above policy threshold, consider throttling features
        const featureNames = policy.targetFeatureIds.map(fid => features.find(f => f.id === fid)?.name || fid);
        if (load > (policy.thresholdConfig.staticLoadThreshold || 0.75)) {
          featureNames.forEach(fn => {
            if (!throttles.includes(fn)) {
              throttles.push(fn);
              throttleFeature(features.find(f => f.name === fn)?.id || fn, `Policy '${policy.name}'`, policy.userSegments);
            }
          });
        } else if (throttles.some(t => featureNames.includes(t))) {
          featureNames.forEach(fn => {
            if (throttles.includes(fn) && load < (policy.thresholdConfig.staticLoadThreshold || 0.75) - 0.1) {
              // Simulate easing if load drops significantly
              // In a real system, this would be more stateful
              easeFeatureThrottle(features.find(f => f.name === fn)?.id || fn, `Load dropped below policy '${policy.name}' threshold.`);
            }
          });
        }
      });

      const newMetric: CognitiveMetric = {
        timestamp: currentTimestamp,
        avgCognitiveLoad: load,
        activeThrottles: [...new Set(throttles)], // Unique throttled features
      };
      setMetrics(prev => [newMetric, ...prev.slice(0, 9)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [features, policies]); // Depend on features and policies to react to changes


  // Handlers for UI actions
  const handleEditFeature = (feature: FeatureDefinition) => {
    setEditingFeature(feature);
    setShowFeatureEditor(true);
  };

  const handleSaveFeature = async (feature: FeatureDefinition) => {
    if (feature.id && features.some(f => f.id === feature.id)) {
      await updateFeature(feature);
    } else {
      await addFeature(feature);
    }
    setShowFeatureEditor(false);
    setEditingFeature(undefined);
  };

  const handleEditPolicy = (policy: ThrottlingPolicy) => {
    setEditingPolicy(policy);
    setShowPolicyEditor(true);
  };

  const handleSavePolicy = async (policy: ThrottlingPolicy) => {
    if (policy.id && policies.some(p => p.id === policy.id)) {
      await updatePolicy(policy);
    } else {
      await addPolicy(policy);
    }
    setShowPolicyEditor(false);
    setEditingPolicy(undefined);
  };

  const handleAcknowledgeAlert = (alert: AlertInstance) => {
    const updatedAlert = { ...alert, status: 'acknowledged', notes: [...alert.notes, `Acknowledged by UI at ${new Date().toISOString()}`] };
    updateAlertInstance(updatedAlert);
  };

  const handleResolveAlert = (alert: AlertInstance) => {
    const updatedAlert = { ...alert, status: 'resolved', resolvedTimestamp: new Date().toISOString(), notes: [...alert.notes, `Resolved by UI at ${new Date().toISOString()}`] };
    updateAlertInstance(updatedAlert);
  };

  const handleEditIntegration = (config: IntegrationConfig) => {
    setEditingIntegration(config);
    setShowIntegrationEditor(true);
  };

  const handleSaveIntegration = async (config: IntegrationConfig) => {
    if (config.id && integrationConfigs.some(c => c.id === config.id)) {
      await updateConfig(config);
    } else {
      await addConfig(config);
    }
    setShowIntegrationEditor(false);
    setEditingIntegration(undefined);
  };

  // Derived state for dashboard
  const currentAvgLoad = metrics.length > 0 ? metrics[0].avgCognitiveLoad : 0;
  const currentThrottledFeatures = metrics.length > 0 ? metrics[0].activeThrottles : [];

  const historicalLoadDataForChart: DataPoint[] = historicalCognitiveData.slice(-15).map(data => ({
    name: new Date(data.timestamp).toLocaleDateString(),
    'Avg. Load': data.avgLoad,
    'Max Load': data.maxLoad,
  }));

  const systemCpuDataForChart: DataPoint[] = systemHealthHistory.slice(-15).map(data => ({
    name: new Date(data.timestamp).toLocaleTimeString(),
    'CPU Usage': data.cpuUsage,
    'Memory Usage': data.memoryUsage,
  }));

  const forecastedLoadDataForChart: DataPoint[] = predictiveForecasts.map(f => ({
    name: new Date(f.timestamp).toLocaleTimeString(),
    'Forecasted Load': f.forecastedLoad,
    'Upper Bound': f.confidenceInterval[1],
    'Lower Bound': f.confidenceInterval[0],
  }));

  const featureContributionDataForChart: DataPoint[] = historicalCognitiveData.length > 0
    ? Object.entries(historicalCognitiveData[historicalCognitiveData.length - 1].featureContribution).map(([featureId, contribution]) => ({
      name: features.find(f => f.id === featureId)?.name || featureId,
      value: contribution,
    })).filter(d => d.value > 0).sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
        Cognitive Load Balancer Dashboard
      </h1>
      <p className="mb-8 text-gray-400 text-center text-lg">
        Real-time monitoring and adaptive management of user cognitive load across features to optimize experience and system performance.
      </p>

      {/* Overview Section */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-lg shadow-xl flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-4 text-blue-300">Current Average Load</h2>
          <CognitiveLoadGauge load={currentAvgLoad} />
          <p className="mt-4 text-sm text-gray-400">Adaptive throttling in progress based on load.</p>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-blue-300">Active Throttles</h2>
          {currentThrottledFeatures.length > 0 ? (
            <ul className="list-disc list-inside text-lg text-orange-300 space-y-2">
              {currentThrottledFeatures.map((featureName, index) => (
                <li key={index} className="flex items-center">
                  <span className="animate-pulse mr-2 text-red-400">•</span>{featureName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-400 text-lg">No features currently throttled. Load is optimal.</p>
          )}
        </div>

        <SystemHealthSummaryCard metrics={systemHealth} />
      </section>

      {/* Real-time Metrics Table */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-5 text-blue-300">Real-time Cognitive Load Stream</h2>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left">
            <thead className="bg-gray-900/70 sticky top-0">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Avg. Cognitive Load</th>
                <th className="p-3">Throttled Features</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.timestamp} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-3 font-mono text-sm text-gray-300">{new Date(m.timestamp).toLocaleTimeString()}</td>
                  <td className={`p-3 font-bold ${getLoadColorClass(m.avgCognitiveLoad)}`}>
                    {(m.avgCognitiveLoad * 100).toFixed(1)}%
                  </td>
                  <td className="p-3 text-gray-300">{m.activeThrottles.join(', ') || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics & Insights */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-5 text-blue-300">Analytics & Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MockLineChart
            data={historicalLoadDataForChart}
            dataKeys={['Avg. Load', 'Max Load']}
            title="Historical Average Cognitive Load"
            xAxisLabel="Date"
            yAxisLabel="Load (%)"
          />
          <MockLineChart
            data={systemCpuDataForChart}
            dataKeys={['CPU Usage', 'Memory Usage']}
            title="System Resource Utilization"
            xAxisLabel="Time"
            yAxisLabel="Usage (%)"
          />
          <PredictiveForecastCard forecast={predictiveForecasts.length > 0 ? predictiveForecasts[0] : null} />
          <UserSegmentDistribution historicalData={historicalCognitiveData} />
          <MockBarChart
            data={featureContributionDataForChart}
            dataKey="value"
            title="Feature Cognitive Load Contribution (Latest)"
            xAxisLabel="Feature"
            yAxisLabel="Contribution (%)"
          />
          <FeedbackLoopStatusCard status={feedbackLoopStatus} />
        </div>
      </section>

      {/* Feature Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-blue-300">Feature Definitions</h2>
          <button
            onClick={() => { setEditingFeature(undefined); setShowFeatureEditor(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add New Feature
          </button>
        </div>
        {featuresLoading ? (
          <p className="text-gray-400">Loading features...</p>
        ) : featuresError ? (
          <p className="text-red-400">Error: {featuresError}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(feature => (
              <div key={feature.id} onClick={() => handleEditFeature(feature)} className="cursor-pointer">
                <FeatureStatusCard feature={feature} isThrottled={currentThrottledFeatures.includes(feature.name)} />
              </div>
            ))}
          </div>
        )}
        {showFeatureEditor && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <FeatureEditorForm
              feature={editingFeature}
              onSave={handleSaveFeature}
              onCancel={() => { setShowFeatureEditor(false); setEditingFeature(undefined); }}
            />
          </div>
        )}
      </section>

      {/* Throttling Policies Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-blue-300">Throttling Policies</h2>
          <button
            onClick={() => { setEditingPolicy(undefined); setShowPolicyEditor(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add New Policy
          </button>
        </div>
        {policiesLoading ? (
          <p className="text-gray-400">Loading policies...</p>
        ) : policiesError ? (
          <p className="text-red-400">Error: {policiesError}</p>
        ) : (
          <ThrottlingPoliciesTable policies={policies} onEditPolicy={handleEditPolicy} />
        )}
        {showPolicyEditor && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <PolicyEditorForm
              policy={editingPolicy}
              allFeatures={features}
              onSave={handleSavePolicy}
              onCancel={() => { setShowPolicyEditor(false); setEditingPolicy(undefined); }}
            />
          </div>
        )}
      </section>

      {/* Alerting System */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-blue-300">Active Alerts</h2>
          {/* Add alert definition button here if needed */}
        </div>
        {alertsLoading ? (
          <p className="text-gray-400">Loading alerts...</p>
        ) : alertsError ? (
          <p className="text-red-400">Error: {alertsError}</p>
        ) : (
          <AlertsList
            alerts={alertInstances}
            definitions={alertDefs}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
          />
        )}
      </section>

      {/* Integrations Management */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-blue-300">Integrations</h2>
          <button
            onClick={() => { setEditingIntegration(undefined); setShowIntegrationEditor(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add New Integration
          </button>
        </div>
        {integrationLoading ? (
          <p className="text-gray-400">Loading integrations...</p>
        ) : integrationError ? (
          <p className="text-red-400">Error: {integrationError}</p>
        ) : (
          <IntegrationConfigTable configs={integrationConfigs} onEditConfig={handleEditIntegration} />
        )}
        {showIntegrationEditor && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-lg mx-auto my-4">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
              </h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const target = e.target as typeof e.target & {
                  name: { value: string };
                  type: { value: IntegrationConfig['type'] };
                  webhookUrl?: { value: string };
                  apiKey?: { value: string };
                  smtpHost?: { value: string };
                  sender?: { value: string };
                  serviceKey?: { value: string };
                };
                const newConfig: Partial<IntegrationConfig> = {
                  ...editingIntegration,
                  name: target.name.value,
                  type: target.type.value,
                  settings: {},
                };
                if (target.webhookUrl) newConfig.settings!.webhookUrl = target.webhookUrl.value;
                if (target.apiKey) newConfig.settings!.apiKey = target.apiKey.value;
                if (target.smtpHost) newConfig.settings!.smtpHost = target.smtpHost.value;
                if (target.sender) newConfig.settings!.sender = target.sender.value;
                if (target.serviceKey) newConfig.settings!.serviceKey = target.serviceKey.value;
                await handleSaveIntegration(newConfig as IntegrationConfig);
              }} className="space-y-4">
                <div>
                  <label htmlFor="integrationName" className="block text-sm font-medium text-gray-300">Integration Name</label>
                  <input
                    type="text" id="integrationName" name="name" defaultValue={editingIntegration?.name || ''} required
                    className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="integrationType" className="block text-sm font-medium text-gray-300">Type</label>
                  <select
                    id="integrationType" name="type" defaultValue={editingIntegration?.type || 'custom_webhook'} required
                    className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="slack">Slack</option>
                    <option value="datadog">Datadog</option>
                    <option value="jira">Jira</option>
                    <option value="email">Email</option>
                    <option value="custom_webhook">Custom Webhook</option>
                  </select>
                </div>
                {editingIntegration?.type === 'slack' && (
                  <div>
                    <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-300">Webhook URL</label>
                    <input
                      type="url" id="webhookUrl" name="webhookUrl" defaultValue={editingIntegration?.settings.webhookUrl || ''}
                      className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                {editingIntegration?.type === 'datadog' && (
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">API Key</label>
                    <input
                      type="text" id="apiKey" name="apiKey" defaultValue={editingIntegration?.settings.apiKey || ''}
                      className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                {editingIntegration?.type === 'email' && (
                  <>
                    <div>
                      <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-300">SMTP Host</label>
                      <input
                        type="text" id="smtpHost" name="smtpHost" defaultValue={editingIntegration?.settings.smtpHost || ''}
                        className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="sender" className="block text-sm font-medium text-gray-300">Sender Email</label>
                      <input
                        type="email" id="sender" name="sender" defaultValue={editingIntegration?.settings.sender || ''}
                        className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}
                {editingIntegration?.type === 'custom_webhook' && (
                  <div>
                    <label htmlFor="serviceKey" className="block text-sm font-medium text-gray-300">Service Key/Endpoint</label>
                    <input
                      type="text" id="serviceKey" name="serviceKey" defaultValue={editingIntegration?.settings.serviceKey || ''}
                      className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button" onClick={() => { setShowIntegrationEditor(false); setEditingIntegration(undefined); }}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Integration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* User Profiles Placeholder */}
      <section className="mb-10 p-6 bg-gray-900/50 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-5 text-blue-300">User Profiles (Preview)</h2>
        {usersLoading ? (
          <p className="text-gray-400">Loading user profiles...</p>
        ) : usersError ? (
          <p className="text-red-400">Error: {usersError}</p>
        ) : (
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left">
              <thead className="bg-gray-900/70 sticky top-0">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Segment</th>
                  <th className="p-3">Engagement Score</th>
                  <th className="p-3">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 10).map(user => ( // Showing only a few for brevity
                  <tr key={user.userId} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-3 text-sm font-medium text-white">{user.userId}</td>
                    <td className="p-3 text-sm text-gray-300">{user.segment}</td>
                    <td className="p-3 text-sm text-gray-300">{(user.engagementScore * 100).toFixed(0)}%</td>
                    <td className="p-3 text-sm text-gray-300">{new Date(user.lastActivity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-right text-gray-500 mt-2 text-sm">...and {users.length - 10} more users.</p>
          </div>
        )}
      </section>

      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>&copy; 2023 Cognitive Load Management System. All rights reserved.</p>
        <p>Version 1.0.0 - Advanced Adaptive Cognitive Load Balancing</p>
      </footer>
    </div>
  );
};

export default CognitiveLoadBalancerView;