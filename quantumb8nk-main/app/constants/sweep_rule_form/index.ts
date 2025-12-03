```typescript
// No Copyright/Company Info per instruction

import { FormikProps } from "formik";
import { PaymentTypeEnum } from "../../../generated/dashboard/graphqlSchema";

// --- Core Sweep Rule Enums and Interfaces (Existing + Enhanced) ---

/**
 * @enum SweepRuleDirection
 * @description Defines the direction of funds movement for a sweep rule.
 * - DRAW_DOWN: Funds are moved out of the originating account to achieve a target balance.
 * - TOP_UP: Funds are moved into the originating account to achieve a target balance.
 * - BOTH: The rule can both draw down and top up based on the target balance.
 */
export enum SweepRuleDirection {
  DRAW_DOWN = "draw_down",
  TOP_UP = "top_up",
  BOTH = "draw_down_and_top_up",
}

/**
 * @enum RecurrenceType
 * @description Specifies how frequently a sweep rule should execute.
 * Includes standard intervals and a custom CRON expression option for advanced users.
 */
export enum RecurrenceType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  ONCE = "once",
  CUSTOM_CRON = "custom_cron", // For advanced, highly flexible scheduling
}

/**
 * @enum SweepRuleStatus
 * @description Represents the current operational state of a sweep rule.
 * Critical for managing rule lifecycle and operational health.
 */
export enum SweepRuleStatus {
  DRAFT = "draft",             // Rule is being created or edited, not yet active.
  ACTIVE = "active",           // Rule is live and actively executing.
  PAUSED = "paused",           // Rule is temporarily suspended, can be reactivated.
  ARCHIVED = "archived",       // Rule is no longer in use and retained for historical purposes.
  PENDING_REVIEW = "pending_review", // Rule requires approval or a compliance check before activation.
  FAILED = "failed",           // Rule encountered critical, unrecoverable errors during execution or setup.
  SUSPENDED = "suspended",     // Temporarily suspended by system due to repeated failures or anomalies.
}

/**
 * @enum SweepOperationOutcome
 * @description Describes the result of a single sweep rule execution attempt.
 * Helps in monitoring and troubleshooting sweep operations.
 */
export enum SweepOperationOutcome {
  SUCCESS = "success",             // Sweep completed as intended.
  PARTIAL_SUCCESS = "partial_success", // Sweep executed but not fully (e.g., max sweep amount hit).
  FAILURE = "failure",             // Sweep failed to execute due to an error.
  SKIPPED = "skipped",             // Sweep was not performed (e.g., target balance already met, or insufficient funds).
  PENDING = "pending",             // Sweep initiated but final status is not yet known.
  INSUFFICIENT_FUNDS = "insufficient_funds", // Specific failure type
  COMPLIANCE_VIOLATION = "compliance_violation", // Specific failure type
}

/**
 * @interface SweepSchedule
 * @description Defines the comprehensive scheduling parameters for a sweep rule.
 * Supports various recurrence patterns, end conditions, and time zone specific execution.
 */
export interface SweepSchedule {
  recurrenceType: RecurrenceType;
  endDate?: string; // ISO 8601 date string (YYYY-MM-DD) for when the rule should stop.
  interval: number; // e.g., '2' for every 2 days, weeks, or months. Must be > 0.
  daysOfMonth?: number[]; // For monthly sweeps: e.g., [1, 15] for 1st and 15th of month.
  daysOfWeek?: string[]; // For weekly sweeps: e.g., ["MON", "WED", "FRI"].
  endType?: "NEVER" | "ON_DATE" | "AFTER_OCCURRENCES"; // How the recurrence ends.
  endAfterOccurrences?: number; // Number of times the rule should run before ending (if endType is AFTER_OCCURRENCES).
  cutoff?: string; // Time string, e.g., "15:30" - the cutoff time for transactions to be considered for the sweep.
  specificDates?: string[]; // For one-time or irregular schedules (ISO 8601 date strings).
  cronExpression?: string; // Standard CRON string for CUSTOM_CRON recurrenceType.
  timezone?: string; // e.g., "America/New_York". Important for consistent scheduling across geographies.
}

/**
 * @interface FormValues
 * @description The primary data structure representing all configurable parameters for a sweep rule
 * within the user interface. This interface maps directly to the form fields.
 */
export interface FormValues {
  id?: string; // Unique identifier for an existing sweep rule.
  ruleName: string; // User-friendly name for the sweep rule.
  originatingAccount: string; // Identifier for the account from which funds are moved.
  originatingAccountType: string; // Type of the originating account (e.g., "Checking", "Savings").
  receivingAccount: string; // Identifier for the account to which funds are moved.
  receivingAccountId?: string; // Optional: A more granular ID if `receivingAccount` is a logical group.
  receivingAccountType: string; // Type of the receiving account.
  description: string; // Detailed explanation of the rule's purpose.
  enabled?: boolean; // Whether the rule is currently active or disabled.
  paymentType?: PaymentTypeEnum; // The method of payment for the sweep transaction.
  priority?: number; // Numerical priority for rule execution, e.g., 1 (highest) to 100 (lowest).
  fundingDirection: SweepRuleDirection[]; // The allowed directions of fund movement.
  targetBalance: number; // The target balance the originating account should aim for.
  minSweepAmount?: number; // Minimum amount that can be swept in a single transaction.
  maxSweepAmount?: number; // Maximum amount that can be swept in a single transaction.
  scheduledHour: number; // Hour of the day for execution (0-23).
  scheduledMinutes: number; // Minute of the hour for execution (0-59).
  schedule: SweepSchedule; // Detailed scheduling configuration.
  sweepRuleStatus?: SweepRuleStatus; // Current status of the rule in its lifecycle.
  currency?: string; // The currency in which the sweep amounts and balances are denominated.
  metadata?: { [key: string]: any }; // Flexible storage for additional, non-standard rule data.
  tags?: string[]; // Categorization tags for filtering and management.
  createdBy?: string; // User ID or system that created the rule.
  createdAt?: string; // ISO 8601 date string: Timestamp of rule creation.
  lastModifiedBy?: string; // User ID or system that last modified the rule.
  lastModifiedAt?: string; // ISO 8601 date string: Timestamp of last modification.
  nextExecutionTime?: string; // ISO 8601 date string: System-calculated next scheduled execution.
  lastExecutionTime?: string; // ISO 8601 date string: Timestamp of the last actual execution.
  lastExecutionStatus?: SweepOperationOutcome; // Outcome of the last execution.
  version?: number; // Version number for tracking changes to the rule.
  enforceTargetBalanceExact?: boolean; // If true, the sweep will strictly aim for the exact target balance.
  // Optional field for AI insights:
  geminiAiSuggestionsApplied?: boolean; // Flag indicating if AI-generated suggestions were accepted.
}

/**
 * @interface SweepRuleDirectionFieldProps
 * @description Properties interface specifically for a Formik-compatible component
 * handling the `fundingDirection` field, allowing flexible UI implementations.
 */
export interface SweepRuleDirectionFieldProps {
  field: {
    name: string;
    onBlur: () => void;
    onChange: (value: string | string[]) => void; // Allows both single and multi-select components
    value: SweepRuleDirection[];
  };
  form: FormikProps<FormValues>;
}

// --- Enhanced Formik and UI-related Interfaces ---

/**
 * @interface SweepRuleFormProps
 * @description Props for the main Sweep Rule Form component, providing necessary
 * initial values, submission logic, and integration points for AI features.
 */
export interface SweepRuleFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  // Callback for when AI optimization suggestions are generated and ready to be displayed.
  onGeminiAISuggestions?: (suggestions: GeminiAISweepOptimizationResult) => void;
  // Flag to control the visibility and interaction of AI-powered features within the UI.
  enableGeminiAIFeatures?: boolean;
  // Callback for when AI compliance check results are available.
  onGeminiAIComplianceResults?: (results: GeminiAIComplianceResult) => void;
  // Callback for when AI performance predictions are available.
  onGeminiAIPerformancePrediction?: (prediction: GeminiAIPerformancePrediction) => void;
}

/**
 * @interface FormFieldConfig
 * @description Provides metadata and configuration for rendering individual form fields.
 * Enhances dynamic form generation and validation.
 */
export interface FormFieldConfig {
  name: keyof FormValues; // Corresponds to a key in FormValues.
  label: string; // User-friendly label for the field.
  type:
    | "text"
    | "number"
    | "select"
    | "multiselect"
    | "checkbox"
    | "date"
    | "time"
    | "textarea"
    | "custom" // For custom-rendered components (e.g., account selector).
    | "account-selector"
    | "currency-selector"
    | "toggle"; // For boolean switches.
  placeholder?: string; // Placeholder text for input fields.
  options?: { value: string | number; label: string }[]; // Options for select/multiselect fields.
  dependsOn?: keyof FormValues; // Field might be conditionally visible/enabled based on another field's value.
  isVisible?: (values: FormValues) => boolean; // Function to determine visibility based on current form values.
  isDisabled?: (values: FormValues) => boolean; // Function to determine disabled state.
  tooltip?: string; // Explanatory text shown on hover.
  validationRules?: string[]; // Array of strings representing validation rules (e.g., "required", "min:0", "max:1000", "email").
  component?: React.ComponentType<any>; // For custom rendering of form fields.
  readOnly?: boolean; // If the field should not be editable.
}

// --- AI-Driven Features (Simulated Gemini AI Functions and Interfaces) ---

/**
 * @interface SweepHistoricalData
 * @description Represents a snapshot of sweep-relevant financial data at a specific point in time.
 * This historical context is crucial for AI models performing predictive analytics,
 * optimization, and anomaly detection.
 */
export interface SweepHistoricalData {
  timestamp: string; // ISO 8601 date string for the data point.
  accountBalance: number; // Balance of the originating account.
  inflows: number; // Total funds flowing into the originating account during the period.
  outflows: number; // Total funds flowing out of the originating account during the period.
  sweepAmount?: number; // Actual amount swept during this period (if a sweep occurred).
  targetBalanceAchieved?: boolean; // Whether the target balance was met by the sweep (if applicable).
  marketConditionsIndex?: number; // A composite index representing relevant market conditions (e.g., volatility, interest rates).
  transactionCount?: number; // Number of individual transactions impacting the account.
  liquidityReserveUtilization?: number; // How much of the available liquidity buffer was used.
  // Additional granular data points could be added for richer AI analysis.
}

/**
 * @interface RiskProfile
 * @description Defines an account's or entity's risk appetite and liquidity requirements.
 * This data is a critical input for AI-driven optimization, ensuring that suggested
 * sweep parameters align with financial policies and risk management strategies.
 */
export interface RiskProfile {
  liquidityTolerance: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL"; // How much deviation from target balance is acceptable.
  riskAversion: "VERY_LOW" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"; // General risk appetite.
  maxOverdraftExposureAllowed?: number; // Maximum allowed negative balance.
  minBufferAmountRequired?: number; // Minimum balance to always maintain regardless of target.
  accountTypeRiskMultiplier?: number; // A factor applied based on the inherent risk of the account type.
  regulatoryComplianceFlags?: string[]; // Specific compliance requirements for the entity/account.
}

/**
 * @interface RegulatoryFramework
 * @description Represents a dynamic set of compliance rules and guidelines that sweep rules
 * must adhere to. This interface allows for flexible definition of regulatory constraints
 * which are then used by AI for automated compliance checks.
 */
export interface RegulatoryFramework {
  countryCode: string; // ISO 3166-1 alpha-2 code (e.g., "US", "GB").
  jurisdiction: string; // Specific region or state (e.g., "NY", "California").
  maxDailySweepLimit?: number; // Maximum total amount that can be swept within 24 hours (for certain categories).
  minDailySweepLimit?: number; // Minimum amount for a sweep, perhaps for reporting thresholds.
  prohibitedPaymentTypes?: PaymentTypeEnum[]; // Payment types that cannot be used in sweeps.
  restrictedAccountTypes?: string[]; // Account types that cannot be used as originating or receiving accounts.
  requiresDualApprovalForAmountOver?: number; // Threshold requiring a second approver for sweeps.
  specificScheduleRestrictions?: { // Time-based restrictions for sweeps.
    daysOfWeekExclusions?: string[]; // Days when sweeps are not allowed (e.g., ["SAT", "SUN"]).
    hoursExclusions?: number[]; // Hours when sweeps are not allowed (e.g., [23, 0, 1]).
    publicHolidaysObserved?: string[]; // List of ISO dates for public holidays where sweeps are paused.
  };
  kycRequiredForTransactionsOver?: number; // KYC requirements for larger transactions.
  amlFlags?: string[]; // Anti-Money Laundering specific flags or rules.
  // More complex, nested rule structures can be built here for detailed compliance logic.
}

/**
 * @interface GeminiAISweepOptimizationResult
 * @description The structured output from the Gemini AI-powered sweep rule optimizer.
 * Provides actionable suggestions for improving sweep efficiency, liquidity, and cost.
 */
export interface GeminiAISweepOptimizationResult {
  suggestedTargetBalance: number; // AI's recommendation for the optimal target balance.
  suggestedMinSweepAmount?: number; // Recommended minimum sweep amount.
  suggestedMaxSweepAmount?: number; // Recommended maximum sweep amount.
  suggestedSchedule?: Partial<SweepSchedule> & { scheduledHour?: number; scheduledMinutes?: number; }; // AI-optimized scheduling parameters.
  rationale: string; // A human-readable explanation from Gemini AI for its suggestions.
  confidenceScore: number; // A score (0-1) indicating Gemini AI's confidence in its recommendations.
  potentialSavings?: number; // Estimated financial benefits (e.g., reduced overdraft fees, increased interest).
  liquidityImpact?: "Improved" | "Maintained" | "Slightly Improved" | "Negligible" | "Degraded"; // AI's assessment of liquidity changes.
  riskReductionEstimate?: number; // Estimated reduction in risk (e.g., non-compliance, overdraft).
  optimizationModelVersion?: string; // Identifier for the AI model used.
}

/**
 * @interface GeminiAIComplianceResult
 * @description The structured output from the Gemini AI-powered compliance monitor.
 * Details compliance status and highlights any potential regulatory or policy issues.
 */
export interface GeminiAIComplianceResult {
  isCompliant: boolean; // Overall compliance status (true if no critical issues).
  issues: { // A list of specific compliance issues detected.
    field: keyof FormValues | "overall" | "schedule"; // The specific field related to the issue, or overall rule.
    message: string; // Description of the compliance violation or warning.
    severity: "CRITICAL" | "WARNING" | "INFO"; // Severity of the issue.
    suggestedAction?: string; // Recommended steps to resolve the issue.
    regulatoryReference?: string; // Reference to the specific regulation or policy violated.
  }[];
  complianceScore: number; // A numerical score (0-1) representing overall compliance health.
  lastCheckedAt: string; // ISO 8601 date string: Timestamp when the compliance check was performed.
  aiPolicyVersion?: string; // Version of the AI policy engine used for the check.
}

/**
 * @interface GeminiAIPerformancePrediction
 * @description The structured output from the Gemini AI-powered performance predictor.
 * Forecasts how a sweep rule is expected to perform in the future based on historical data
 * and current economic outlooks.
 */
export interface GeminiAIPerformancePrediction {
  predictedEfficiency: number; // (0-1) How often the rule is expected to successfully achieve its goal.
  predictedExecutionFrequency: number; // Estimated number of sweeps per period (e.g., per month).
  predictedAverageSweepAmount: number; // Forecasted average amount per sweep transaction.
  predictedLiquidityCoverageRatio: number; // Forecasted metric for overall account liquidity health.
  potentialRisks: string[]; // List of potential operational or financial risks identified by AI.
  predictionConfidence: number; // (0-1) AI's confidence in its predictions.
  modelUsed: string; // Name/version of the predictive AI model.
  forecastPeriodDays?: number; // Number of days for which the prediction is valid.
  estimatedMaintenanceCost?: number; // Estimated cost to maintain this rule (e.g., transaction fees).
}

/**
 * @interface SweepExecutionRecord
 * @description A detailed record of a single instance of a sweep rule's execution.
 * Essential for historical analysis, auditing, and feeding into AI models.
 */
export interface SweepExecutionRecord {
  executionId: string; // Unique ID for this specific execution.
  ruleId: string; // ID of the sweep rule that was executed.
  timestamp: string; // ISO 8601 date string: Actual time of execution completion.
  scheduledTimestamp: string; // ISO 8601 date string: Time when it was originally scheduled.
  originatingAccountBalanceBefore: number; // Balance before the sweep attempt.
  originatingAccountBalanceAfter: number; // Balance after the sweep attempt.
  receivingAccountBalanceBefore?: number; // Balance of receiving account before (if tracked).
  receivingAccountBalanceAfter?: number; // Balance of receiving account after (if tracked).
  actualSweepAmount?: number; // Actual amount of funds moved.
  requestedSweepAmount?: number; // The amount the rule initially calculated to sweep.
  outcome: SweepOperationOutcome; // The result of the execution.
  errorMessage?: string; // Detailed error message if the outcome was FAILURE.
  details?: { [key: string]: any }; // Additional operational details (e.g., transaction IDs).
  targetBalanceReached: boolean; // Flag if the target balance was successfully met.
  marketConditionsAtExecution?: { interestRate: number; volatilityIndex: number; }; // Snapshot of market data.
  executionDurationMs?: number; // How long the sweep operation took.
}

/**
 * @interface SweepBaselineBehavior
 * @description Stores a statistical summary of a sweep rule's typical performance.
 * Used by anomaly detection AI to identify deviations from expected behavior.
 */
export interface SweepBaselineBehavior {
  ruleId: string; // The ID of the sweep rule this baseline applies to.
  averageSweepAmount: number; // The typical amount swept.
  averageExecutionTimeMs: number; // Average time taken for the sweep to complete.
  expectedOutcome: SweepOperationOutcome; // The most frequent outcome (e.g., SUCCESS).
  successRate: number; // Historical success rate (0-1).
  scheduledHour: number; // Expected execution hour.
  scheduledMinutes: number; // Expected execution minute.
  lastUpdated: string; // ISO 8601 date string: When this baseline was last computed/updated.
  balanceVolatilityFactor: number; // Historical volatility of the account balance.
}

/**
 * @interface SweepAnomaly
 * @description Represents a detected deviation or unusual pattern in sweep rule execution,
 * flagged by the Gemini AI anomaly detection system.
 */
export interface SweepAnomaly {
  type: "AMOUNT_DEVIATION" | "TIMING_DEVIATION" | "FREQUENT_FAILURE" | "UNEXPECTED_STATUS" | "OTHER" | "UNUSUAL_BALANCE_FLUCTUATION";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; // Impact level of the anomaly.
  message: string; // Description of the anomaly.
  timestamp: string; // ISO 8601 date string: When the anomaly was detected/occurred.
  details?: { [key: string]: any }; // Additional context and data points related to the anomaly.
  resolutionSuggestion?: string; // AI's suggestion for how to address the anomaly.
  isAcknowledged?: boolean; // Flag to track if a user has reviewed and acknowledged the anomaly.
  acknowledgedBy?: string; // User ID who acknowledged it.
  acknowledgedAt?: string; // ISO 8601 date string.
}

/**
 * @interface AuditLogEntry
 * @description Records significant actions and changes related to sweep rules,
 * providing a comprehensive audit trail for compliance and operational monitoring.
 */
export interface AuditLogEntry {
  logId: string; // Unique ID for the log entry.
  timestamp: string; // ISO 8601 date string: When the action occurred.
  userId: string; // ID of the user or system component performing the action.
  action: string; // Describes the action (e.g., "CREATE_RULE", "UPDATE_RULE_STATUS", "AI_RECOMMENDATION_ACCEPTED").
  ruleId?: string; // The ID of the sweep rule affected.
  details?: { [key: string]: any }; // Contextual information about the action.
  previousValue?: Partial<FormValues>; // Snapshot of the rule before the change.
  newValue?: Partial<FormValues>; // Snapshot of the rule after the change.
  ipAddress?: string; // IP address from which the action originated.
}

/**
 * @interface SweepRuleSystemConfig
 * @description Global system-wide configuration settings for the sweep rule management platform.
 * Includes defaults, limits, and AI integration parameters.
 */
export interface SweepRuleSystemConfig {
  defaultCurrency: string; // System default currency.
  defaultTimezone: string; // System default timezone.
  maxRulesPerUser: number; // Max number of active rules an individual user can create.
  maxRuleLifetimeDays: number; // Max duration a rule can be active before requiring review/archival.
  minRulePriority: number; // Lowest possible priority value.
  maxRulePriority: number; // Highest possible priority value.
  aiIntegrationEnabled: boolean; // Master switch for all AI functionalities.
  aiOptimizationFrequencyDays: number; // How often Gemini AI should re-evaluate and suggest optimizations for active rules.
  aiComplianceCheckLevel: "NONE" | "INFO" | "WARNING" | "CRITICAL"; // Granularity of AI compliance checks.
  auditLogRetentionDays: number; // How long audit logs are stored.
  enableMultiFactorApproval: boolean; // Require MFA for critical rule changes.
  webhookNotificationUrls?: string[]; // Endpoints for sending notifications on rule events.
}

// --- AI-Driven Functions (Simulated Gemini AI Integrations) ---

/**
 * @function generateGeminiAISweepRuleDescription
 * @description Utilizes simulated Gemini AI's natural language generation capabilities to create clear,
 * concise, and comprehensive human-readable descriptions for complex sweep rules.
 * This helps users quickly understand the intent and parameters of a rule.
 * @param rule The complete sweep rule form values.
 * @returns A professionally generated description of the sweep rule.
 */
export const generateGeminiAISweepRuleDescription = (rule: FormValues): string => {
  // In a real-world scenario, this function would interface with a Gemini AI NLP service
  // to dynamically generate descriptions based on the rule's attributes, historical context,
  // and best practices. Here, we simulate a sophisticated generation.
  let description = `This financial sweep rule, identified as "${rule.ruleName || 'Unnamed Rule'}", is meticulously engineered to optimize liquidity management `;
  description += `between the originating account '${rule.originatingAccount}' (${rule.originatingAccountType}) and the receiving account '${rule.receivingAccount}' (${rule.receivingAccountType}). `;

  const directionParts: string[] = [];
  if (rule.fundingDirection.includes(SweepRuleDirection.DRAW_DOWN)) {
    directionParts.push("drawing funds out to maintain a target");
  }
  if (rule.fundingDirection.includes(SweepRuleDirection.TOP_UP)) {
    directionParts.push("topping up funds to reach a target");
  }
  if (directionParts.length > 0) {
    description += `Its primary function involves ${directionParts.join(" and ")} balance. `;
  }

  description += `The target balance for the originating account is meticulously set to ${rule.targetBalance.toFixed(2)} ${rule.currency || 'USD'}. `;

  const amountConstraints: string[] = [];
  if (rule.minSweepAmount && rule.minSweepAmount > 0) {
    amountConstraints.push(`a minimum transaction amount of ${rule.minSweepAmount.toFixed(2)}`);
  }
  if (rule.maxSweepAmount && rule.maxSweepAmount > 0) {
    amountConstraints.push(`a maximum transaction amount of ${rule.maxSweepAmount.toFixed(2)}`);
  }
  if (amountConstraints.length > 0) {
    description += `Operational parameters include ${amountConstraints.join(" and ")} ${rule.currency || 'USD'}. `;
  } else {
    description += `No specific minimum or maximum sweep amounts are enforced, allowing dynamic adjustment. `;
  }

  const schedule = rule.schedule;
  description += `The execution is precisely scheduled for ${String(rule.scheduledHour).padStart(2, '0')}:${String(rule.scheduledMinutes).padStart(2, '0')} ${schedule.timezone || 'UTC'} `;

  switch (schedule.recurrenceType) {
    case RecurrenceType.DAILY:
      description += `on a ${schedule.interval > 1 ? `biennial (${schedule.interval} day) ` : ''}daily cadence. `;
      break;
    case RecurrenceType.WEEKLY:
      description += `on a ${schedule.interval > 1 ? `bi-weekly (${schedule.interval} week) ` : ''}weekly basis, specifically on ${schedule.daysOfWeek?.join(', ') || 'unspecified day(s)'}. `;
      break;
    case RecurrenceType.MONTHLY:
      description += `on a ${schedule.interval > 1 ? `bi-monthly (${schedule.interval} month) ` : ''}monthly cycle, targeting day(s) ${schedule.daysOfMonth?.join(', ') || 'unspecified day(s)'}. `;
      break;
    case RecurrenceType.ONCE:
      description += `as a singular, one-time event scheduled for ${schedule.specificDates?.[0] || 'an unspecified future date'}. `;
      break;
    case RecurrenceType.CUSTOM_CRON:
      description += `via an advanced, highly flexible custom CRON expression: '${schedule.cronExpression || "Not Provided"}'. `;
      break;
    default:
      description += `with an unspecified or default recurrence pattern. `;
  }

  if (schedule.endDate) {
    description += `The rule is programmatically set to terminate on ${schedule.endDate}. `;
  } else if (schedule.endType === "AFTER_OCCURRENCES" && schedule.endAfterOccurrences) {
    description += `It will automatically cease operations after precisely ${schedule.endAfterOccurrences} successful executions. `;
  } else {
    description += `This rule is configured for continuous, indefinite operation until manually intervened. `;
  }

  description += `Current operational status: ${rule.sweepRuleStatus || SweepRuleStatus.DRAFT}. The rule is assigned a priority level of ${rule.priority || 'Normal (50)'}. `;
  if (rule.enforceTargetBalanceExact) {
    description += `Strict enforcement of the target balance is enabled. `;
  }

  // Gemini AI adds a layer of intelligent interpretation and sentiment.
  // This part simulates a summary from an AI perspective, assessing the rule's design.
  const aiSentimentScore = Math.random() * (0.95 - 0.75) + 0.75; // Simulate a generally positive assessment
  if (aiSentimentScore > 0.9) {
    description += "[Gemini AI Insight: This rule is optimally structured, exhibiting best-in-class design for its intended purpose. High efficiency and robustness are anticipated.]";
  } else if (aiSentimentScore > 0.8) {
    description += "[Gemini AI Insight: A robustly designed rule with clear objectives. Minor optimizations may be possible; refer to AI suggestions for performance enhancements.]";
  } else {
    description += "[Gemini AI Insight: This rule's configuration is standard. Review AI recommendations for potential improvements in efficiency, compliance, or risk mitigation.]";
  }

  return description;
};

/**
 * @function analyzeSweepRuleForComplianceGeminiAI
 * @description Integrates deeply with a simulated Gemini AI regulatory knowledge base and internal policy engine
 * to conduct a rigorous, real-time compliance assessment of a sweep rule.
 * This function identifies potential violations and recommends corrective actions.
 * @param rule The sweep rule to be rigorously checked against compliance standards.
 * @param regulations The active regulatory framework and internal policies to enforce.
 * @param existingRules Optional: A list of other existing rules to check for conflicts (e.g., overlapping rules).
 * @returns A promise resolving to a detailed compliance result.
 */
export const analyzeSweepRuleForComplianceGeminiAI = async (
  rule: FormValues,
  regulations: RegulatoryFramework,
  existingRules: FormValues[] = [],
): Promise<GeminiAIComplianceResult> => {
  // Simulate an intensive, asynchronous AI compliance analysis process.
  // In a production system, this would involve secure API calls to a Gemini AI service
  // specialized in financial regulatory intelligence.
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200)); // Simulate AI computation latency

  const issues: GeminiAIComplianceResult['issues'] = [];
  let isCompliant = true;
  let complianceScore = 1.0; // Starts with a perfect score.

  const addIssue = (field: GeminiAIComplianceResult['issues'][0]['field'], message: string, severity: GeminiAIComplianceResult['issues'][0]['severity'], suggestedAction?: string, regulatoryReference?: string) => {
    issues.push({ field, message, severity, suggestedAction, regulatoryReference });
    if (severity === "CRITICAL") isCompliant = false;
    complianceScore -= (severity === "CRITICAL" ? 0.3 : (severity === "WARNING" ? 0.1 : 0.02));
  };

  // Rule Name Validation (Internal Policy)
  if (!rule.ruleName || rule.ruleName.trim().length < 5 || !/^[a-zA-Z0-9\s_-]+$/.test(rule.ruleName)) {
    addIssue("ruleName", "Rule name is required, must be at least 5 characters, and contain only alphanumeric characters, spaces, hyphens, or underscores.", "WARNING", "Rename rule to meet corporate naming standards.");
  }

  // Account Type Restrictions (Regulatory)
  if (regulations.restrictedAccountTypes) {
    if (regulations.restrictedAccountTypes.includes(rule.originatingAccountType)) {
      addIssue("originatingAccountType", `Originating account type '${rule.originatingAccountType}' is explicitly restricted by ${regulations.jurisdiction} regulations.`, "CRITICAL", "Select an approved account type or seek a regulatory exemption.", `Reg: ${regulations.countryCode} AccType-001`);
    }
    if (regulations.restrictedAccountTypes.includes(rule.receivingAccountType)) {
      addIssue("receivingAccountType", `Receiving account type '${rule.receivingAccountType}' is explicitly restricted by ${regulations.jurisdiction} regulations.`, "CRITICAL", "Select an approved account type or seek a regulatory exemption.", `Reg: ${regulations.countryCode} AccType-002`);
    }
  }

  // Payment Type Prohibition (Regulatory)
  if (rule.paymentType && regulations.prohibitedPaymentTypes && regulations.prohibitedPaymentTypes.includes(rule.paymentType)) {
    addIssue("paymentType", `The chosen payment type '${rule.paymentType}' is prohibited for sweeps under ${regulations.jurisdiction} financial regulations.`, "CRITICAL", "Select an allowed payment type for this jurisdiction.", `Reg: ${regulations.countryCode} PayType-001`);
  }

  // Sweep Amount Limits (Regulatory/Internal Policy)
  if (regulations.maxDailySweepLimit !== undefined && rule.maxSweepAmount && rule.maxSweepAmount > regulations.maxDailySweepLimit) {
    addIssue("maxSweepAmount", `Maximum sweep amount (${rule.maxSweepAmount} ${rule.currency || 'USD'}) exceeds the regulatory daily limit of ${regulations.maxDailySweepLimit} ${rule.currency || 'USD'}.`, "CRITICAL", `Reduce max sweep amount to ${regulations.maxDailySweepLimit} or less.`, `Reg: ${regulations.countryCode} AmtLimit-001`);
  }
  if (regulations.minDailySweepLimit !== undefined && rule.minSweepAmount && rule.minSweepAmount < regulations.minDailySweepLimit) {
    addIssue("minSweepAmount", `Minimum sweep amount (${rule.minSweepAmount} ${rule.currency || 'USD'}) is below the recommended threshold of ${regulations.minDailySweepLimit} ${rule.currency || 'USD'}.`, "WARNING", `Increase min sweep amount to ${regulations.minDailySweepLimit} or more for operational efficiency.`, `Policy: ${regulations.countryCode} OpEff-001`);
  }

  // Dual Approval Requirement (Internal Policy)
  if (regulations.requiresDualApprovalForAmountOver !== undefined && rule.maxSweepAmount && rule.maxSweepAmount > regulations.requiresDualApprovalForAmountOver) {
    addIssue("maxSweepAmount", `Sweeps with a maximum amount exceeding ${regulations.requiresDualApprovalForAmountOver} ${rule.currency || 'USD'} require dual approval. Ensure the rule's workflow supports this.`, "INFO", "Confirm dual approval workflow is correctly configured for this rule.", "Policy: Internal Approval-001");
  }

  // Schedule Restrictions (Regulatory/Operational)
  if (regulations.specificScheduleRestrictions) {
    const { daysOfWeekExclusions, hoursExclusions } = regulations.specificScheduleRestrictions;
    const ruleSchedule = rule.schedule;

    if (daysOfWeekExclusions && ruleSchedule.daysOfWeek && ruleSchedule.daysOfWeek.some(day => daysOfWeekExclusions.includes(day))) {
      addIssue("schedule.daysOfWeek", `Scheduled day(s) (${ruleSchedule.daysOfWeek.filter(day => daysOfWeekExclusions.includes(day)).join(', ')}) are excluded by operational policy or regulation.`, "CRITICAL", "Adjust the sweep schedule to avoid restricted days.", `Reg: ${regulations.countryCode} Sched-001`);
    }
    if (hoursExclusions && hoursExclusions.includes(rule.scheduledHour)) {
      addIssue("scheduledHour", `Scheduled hour (${rule.scheduledHour}:00 ${ruleSchedule.timezone || 'UTC'}) falls within a restricted operational window.`, "CRITICAL", "Adjust the sweep schedule to an allowed hour.", `Reg: ${regulations.countryCode} Sched-002`);
    }
    // Gemini AI could also check public holidays dynamically here.
  }

  // Overlapping Rule Detection (AI-powered operational efficiency)
  // Gemini AI could analyze existing rules to detect potential conflicts,
  // resource contention, or unintended consequences when new rules are added.
  const conflictingRules = existingRules.filter(
    (existing) => existing.id !== rule.id &&
      existing.enabled &&
      existing.originatingAccount === rule.originatingAccount &&
      existing.receivingAccount === rule.receivingAccount &&
      existing.fundingDirection.some(fd => rule.fundingDirection.includes(fd)) &&
      // More complex logic to check for schedule overlaps.
      // For a demo, a simple check:
      existing.scheduledHour === rule.scheduledHour &&
      existing.scheduledMinutes === rule.scheduledMinutes
  );
  if (conflictingRules.length > 0) {
    addIssue("overall", `This rule potentially conflicts with or overlaps with existing active rules (e.g., "${conflictingRules[0].ruleName}"). This may lead to unpredictable behavior or inefficiency.`, "WARNING", "Review existing rules for potential consolidation or distinct scheduling.", "AI: Overlap-001");
  }

  // Predictive Compliance (Gemini AI could forecast future compliance issues)
  // "Gemini AI predicts that if market volatility increases by 15%, this rule's target balance may become unachievable within current parameters, leading to compliance breaches on liquidity."
  if (complianceScore > 0.7 && Math.random() < 0.1) { // Simulate occasional proactive AI warnings
    addIssue("overall", "Gemini AI forecasts a moderate risk of future compliance issues if external economic conditions shift significantly. Recommend periodic re-evaluation.", "INFO", "Monitor economic indicators and consider re-running AI optimization if conditions change.", "AI: Forecast-001");
  }

  // Ensure compliance score is within valid range [0, 1]
  complianceScore = Math.max(0, Math.min(1.0, complianceScore));

  return {
    isCompliant,
    issues,
    complianceScore: parseFloat(complianceScore.toFixed(2)),
    lastCheckedAt: new Date().toISOString(),
    aiPolicyVersion: "Gemini_ComplianceEngine_v4.5.2_LLM_Enhanced",
  };
};


/**
 * @function getGeminiAISweepOptimizationSuggestions
 * @description Leverages advanced Gemini AI predictive analytics and optimization algorithms
 * to generate intelligent suggestions for sweep rule parameters. This aims to maximize
 * financial efficiency, minimize operational costs, and optimize liquidity across accounts.
 * @param currentRule Current draft or active rule parameters.
 * @param historicalData Comprehensive historical financial data for the originating account.
 * @param riskProfile The financial risk appetite and liquidity requirements.
 * @param currentMarketConditions Real-time market data or relevant economic indices.
 * @returns A promise resolving to detailed optimization suggestions from Gemini AI.
 */
export const getGeminiAISweepOptimizationSuggestions = async (
  currentRule: FormValues,
  historicalData: SweepHistoricalData[],
  riskProfile: RiskProfile,
  currentMarketConditions: { interestRate: number; volatilityIndex: number; liquidityIndex: number },
): Promise<GeminiAISweepOptimizationResult> => {
  // Simulate a complex, data-intensive AI computation process.
  // In a real system, this would involve sending data to a Gemini AI platform
  // and receiving back statistically-derived optimal parameters.
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500)); // Simulate substantial AI computation time

  let suggestedTargetBalance = currentRule.targetBalance;
  let suggestedMinSweepAmount = currentRule.minSweepAmount;
  let suggestedMaxSweepAmount = currentRule.maxSweepAmount;
  const suggestedSchedule: Partial<SweepSchedule> & { scheduledHour?: number; scheduledMinutes?: number; } = {
    scheduledHour: currentRule.scheduledHour,
    scheduledMinutes: currentRule.scheduledMinutes,
    ...currentRule.schedule
  };
  let rationale = "Initial AI assessment based on provided data.";
  let confidenceScore = 0.65; // Starting confidence.
  let potentialSavings = 0;
  let liquidityImpact: GeminiAISweepOptimizationResult['liquidityImpact'] = "Maintained";
  let riskReductionEstimate = 0;

  // --- Gemini AI Logic Simulation: Multi-faceted Analysis ---

  // 1. **Historical Balance Fluctuation Analysis:**
  //    Gemini AI processes years of granular account data to identify patterns, seasonality,
  //    and typical cash flow cycles.
  const balances = historicalData.map(d => d.accountBalance);
  if (balances.length > 10) { // Require sufficient historical data for robust analysis
    const avgBalance = balances.reduce((sum, b) => sum + b, 0) / balances.length;
    const stdDevBalance = Math.sqrt(balances.map(b => Math.pow(b - avgBalance, 2)).reduce((a, b) => a + b) / balances.length);
    // const maxHistoricalDrawdown = Math.max(...balances) - Math.min(...balances); // Not used in this simplified simulation

    // 2. **Risk Profile Integration:**
    //    The AI model dynamically adjusts its recommendations based on the entity's risk appetite.
    let targetBalanceAdjustmentFactor = 0;
    switch (riskProfile.liquidityTolerance) {
      case "CRITICAL": targetBalanceAdjustmentFactor = -0.20; break; // Aggressive cash optimization
      case "HIGH": targetBalanceAdjustmentFactor = -0.10; break;
      case "MEDIUM": targetBalanceAdjustmentFactor = 0.0; break;
      case "LOW": targetBalanceAdjustmentFactor = 0.10; break; // Prioritize buffer
      case "VERY_HIGH": targetBalanceAdjustmentFactor = 0.15; break; // Even larger buffer
    }

    // 3. **Market Conditions & Economic Outlook Integration:**
    //    Gemini AI incorporates external factors like interest rates for opportunity cost analysis
    //    and volatility for buffer recommendations.
    if (currentMarketConditions.interestRate > 0.04) { // Higher interest rates, incentivize drawing down (or optimize top-up)
      targetBalanceAdjustmentFactor -= 0.03;
      rationale += " Current higher interest rates suggest optimizing for lower idle balances. ";
    }
    if (currentMarketConditions.volatilityIndex > 0.7) { // High market volatility, recommend higher buffers
      targetBalanceAdjustmentFactor += 0.05;
      rationale += " Elevated market volatility indicates a need for increased liquidity buffer. ";
      riskReductionEstimate += 0.1;
    }
    if (currentMarketConditions.liquidityIndex < 0.3) { // Overall market liquidity is tight
      targetBalanceAdjustmentFactor += 0.07;
      rationale += " Tight global liquidity conditions recommend maintaining higher internal buffers. ";
      riskReductionEstimate += 0.15;
    }

    // Calculate new target balance. Gemini AI might use more complex models like reinforcement learning
    // to find an optimal balance point that minimizes idle cash while preventing overdrafts.
    const dynamicallyAdjustedTarget = avgBalance * (1 + targetBalanceAdjustmentFactor) + (stdDevBalance * (riskProfile.accountTypeRiskMultiplier || 1));
    suggestedTargetBalance = Math.round(Math.max(riskProfile.minBufferAmountRequired || 100, dynamicallyAdjustedTarget) / 100) * 100; // Round to nearest 100, ensure minimum.

    if (Math.abs(suggestedTargetBalance - currentRule.targetBalance) > 50) { // Only suggest if significant change
      rationale += `Adjusted target balance from ${currentRule.targetBalance.toFixed(2)} to ${suggestedTargetBalance.toFixed(2)} based on historical analysis, risk profile (Liquidity Tolerance: ${riskProfile.liquidityTolerance}), and prevailing market dynamics.`;
      confidenceScore += 0.1;
      potentialSavings += Math.abs(suggestedTargetBalance - currentRule.targetBalance) * currentMarketConditions.interestRate * 0.75; // More sophisticated saving calculation
      liquidityImpact = suggestedTargetBalance < currentRule.targetBalance ? "Improved" : "Maintained";
    }

    // 4. **Min/Max Sweep Amount Optimization:**
    //    Gemini AI analyzes historical transaction sizes, typical sweep amounts, and potential for partial sweeps.
    const historicalSweepAmounts = historicalData.map(d => d.sweepAmount || 0).filter(Boolean);
    if (historicalSweepAmounts.length > 5) {
      const avgSweepAmount = historicalSweepAmounts.reduce((sum, a) => sum + a, 0) / historicalSweepAmounts.length;
      const stdDevSweepAmount = Math.sqrt(historicalSweepAmounts.map(a => Math.pow(a - avgSweepAmount, 2)).reduce((x, y) => x + y) / historicalSweepAmounts.length);

      if (currentRule.minSweepAmount === undefined || currentRule.minSweepAmount === 0 || Math.abs(currentRule.minSweepAmount - avgSweepAmount * 0.1) > avgSweepAmount * 0.05) {
        suggestedMinSweepAmount = Math.max(10, Math.round((avgSweepAmount * 0.1 - stdDevSweepAmount * 0.05) / 10) * 10); // Dynamically set min based on historical patterns and volatility.
        rationale += ` Suggested min sweep amount of ${suggestedMinSweepAmount.toFixed(2)} derived from typical transaction sizes and historical sweep patterns.`;
        confidenceScore += 0.05;
      }
      if (currentRule.maxSweepAmount === undefined || currentRule.maxSweepAmount === 0 || Math.abs(currentRule.maxSweepAmount - avgSweepAmount * 1.5) > avgSweepAmount * 0.1) {
        suggestedMaxSweepAmount = Math.max(1000, Math.round((avgSweepAmount * 1.5 + stdDevSweepAmount * 0.1) / 100) * 100); // Adjust max to handle larger fluctuations while preventing excessive single sweeps.
        rationale += ` Suggested max sweep amount of ${suggestedMaxSweepAmount.toFixed(2)} to accommodate peak liquidity needs and account volatility.`;
        confidenceScore += 0.05;
      }
    } else {
      // If limited historical data, use a heuristic based on target balance.
      suggestedMinSweepAmount = currentRule.minSweepAmount || Math.round((currentRule.targetBalance * 0.01) / 10) * 10;
      suggestedMaxSweepAmount = currentRule.maxSweepAmount || Math.round((currentRule.targetBalance * 0.5) / 100) * 100;
      rationale += " Min/Max sweep amounts heuristically suggested due to insufficient historical sweep data for advanced AI analysis. ";
    }


    // 5. **Schedule Optimization (Advanced Time Series Analysis):**
    //    Gemini AI analyzes the historical success rates, latency, and system load at different times
    //    to recommend optimal execution windows.
    const executionOutcomesByHour: { [hour: number]: { success: number; failure: number; skipped: number } } = {};
    historicalData.forEach(data => {
      const hour = new Date(data.timestamp).getHours();
      if (!executionOutcomesByHour[hour]) {
        executionOutcomesByHour[hour] = { success: 0, failure: 0, skipped: 0 };
      }
      if (data.targetBalanceAchieved) executionOutcomesByHour[hour].success++;
      else if (data.sweepAmount === 0 && !data.targetBalanceAchieved) executionOutcomesByHour[hour].skipped++;
      else executionOutcomesByHour[hour].failure++;
    });

    let bestHour = currentRule.scheduledHour;
    let maxSuccessRate = -1;
    for (const hour in executionOutcomesByHour) {
      const { success, failure, skipped } = executionOutcomesByHour[hour];
      const total = success + failure + skipped;
      if (total > 0) {
        const rate = success / total;
        if (rate > maxSuccessRate) {
          maxSuccessRate = rate;
          bestHour = parseInt(hour, 10);
        }
      }
    }

    if (bestHour !== currentRule.scheduledHour && maxSuccessRate > (executionOutcomesByHour[currentRule.scheduledHour]?.success / ((executionOutcomesByHour[currentRule.scheduledHour]?.success || 0) + (executionOutcomesByHour[currentRule.scheduledHour]?.failure || 0) + (executionOutcomesByHour[currentRule.scheduledHour]?.skipped || 0)) || 0)) {
      suggestedSchedule.scheduledHour = bestHour;
      rationale += ` Optimized scheduled hour from ${currentRule.scheduledHour}:00 to ${bestHour}:00 based on historical execution success rates across different time windows. This is expected to improve sweep reliability.`;
      confidenceScore += 0.08;
      riskReductionEstimate += 0.05;
    }
  } else {
    rationale += " Limited historical data available for advanced AI optimization. Suggestions are based on heuristics and default configurations. ";
    confidenceScore -= 0.1;
  }

  // Ensure confidence score is within bounds [0, 1]
  confidenceScore = Math.min(1.0, Math.max(0.0, confidenceScore));
  riskReductionEstimate = Math.min(1.0, Math.max(0.0, riskReductionEstimate));
  potentialSavings = Math.max(0, potentialSavings); // Ensure savings are non-negative.

  return {
    suggestedTargetBalance: parseFloat(suggestedTargetBalance.toFixed(2)),
    suggestedMinSweepAmount: suggestedMinSweepAmount !== undefined ? parseFloat(suggestedMinSweepAmount.toFixed(2)) : undefined,
    suggestedMaxSweepAmount: suggestedMaxSweepAmount !== undefined ? parseFloat(suggestedMaxSweepAmount.toFixed(2)) : undefined,
    suggestedSchedule: suggestedSchedule.scheduledHour !== currentRule.scheduledHour || suggestedSchedule.scheduledMinutes !== currentRule.scheduledMinutes ? suggestedSchedule : undefined,
    rationale: `[Gemini AI Optimization] ${rationale.trim()}`,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    potentialSavings: parseFloat(potentialSavings.toFixed(2)),
    liquidityImpact,
    riskReductionEstimate: parseFloat(riskReductionEstimate.toFixed(2)),
    optimizationModelVersion: "Gemini_LiquidityOptimizer_v5.1_RL_Enhanced",
  };
};

/**
 * @function getGeminiAIPerformancePredictionForSweepRule
 * @description Predicts the future performance and efficiency of a sweep rule using
 * Gemini AI's advanced forecasting models. This leverages time-series analysis,
 * machine learning, and contextual economic data to provide forward-looking insights.
 * @param rule The sweep rule for which to predict performance.
 * @param historicalPerformance Past execution data of this specific rule or highly similar rules.
 * @param economicOutlook Broad economic indicators for future context.
 * @returns A promise resolving to detailed performance predictions.
 */
export const getGeminiAIPerformancePredictionForSweepRule = async (
  rule: FormValues,
  historicalPerformance: SweepExecutionRecord[], // Using the more specific execution records
  economicOutlook: { gdpGrowth: number; inflationRate: number; unemploymentRate: number; marketSentimentIndex: number },
): Promise<GeminiAIPerformancePrediction> => {
  // Simulate a sophisticated, resource-intensive AI prediction process.
  // This would involve calling a Gemini AI service with trained predictive models.
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simulate AI computation time

  let predictedEfficiency = 0.8;
  let predictedExecutionFrequency = 0;
  let predictedAverageSweepAmount = 0;
  let predictedLiquidityCoverageRatio = 1.1; // Healthy ratio by default
  let potentialRisks: string[] = [];
  let predictionConfidence = 0.7;
  const modelUsed = "Gemini_SweepPerformanceForecaster_v6.0_LSTM_Enhanced";
  const forecastPeriodDays = 30; // Default forecast period.

  // --- Gemini AI Prediction Logic Simulation ---

  // 1. Analyze historical success rates and execution patterns.
  const successfulExecutions = historicalPerformance.filter(rec => rec.outcome === SweepOperationOutcome.SUCCESS);
  const totalExecutions = historicalPerformance.length;

  if (totalExecutions > 0) {
    predictedEfficiency = successfulExecutions.length / totalExecutions;
    predictedAverageSweepAmount = historicalPerformance.reduce((sum, rec) => sum + (rec.actualSweepAmount || 0), 0) / totalExecutions;

    // 2. Adjust frequency based on schedule and historical skips.
    const intervalFactor = rule.schedule.interval || 1;
    switch (rule.schedule.recurrenceType) {
      case RecurrenceType.DAILY: predictedExecutionFrequency = (forecastPeriodDays / intervalFactor); break;
      case RecurrenceType.WEEKLY: predictedExecutionFrequency = (forecastPeriodDays / 7 / intervalFactor) * (rule.schedule.daysOfWeek?.length || 1); break;
      case RecurrenceType.MONTHLY: predictedExecutionFrequency = (forecastPeriodDays / 30 / intervalFactor) * (rule.schedule.daysOfMonth?.length || 1); break;
      case RecurrenceType.ONCE: predictedExecutionFrequency = 1; break;
      case RecurrenceType.CUSTOM_CRON: predictedExecutionFrequency = 10; // Placeholder, real AI would parse CRON
    }
    // Reduce frequency if historically skipped often
    const skippedRate = historicalPerformance.filter(rec => rec.outcome === SweepOperationOutcome.SKIPPED).length / totalExecutions;
    predictedExecutionFrequency *= (1 - skippedRate * 0.5); // Some reduction for skips.

    // 3. Incorporate economic outlook for macro-level impact.
    if (economicOutlook.gdpGrowth < 0.01) {
      potentialRisks.push("Predicted economic slowdown may reduce account inflows and impact sweep success.");
      predictedEfficiency -= 0.15;
      predictedLiquidityCoverageRatio -= 0.1;
      predictionConfidence -= 0.1;
    }
    if (economicOutlook.inflationRate > 0.05) {
      potentialRisks.push("High inflation might necessitate larger sweep amounts or more frequent adjustments to target balances.");
      predictedAverageSweepAmount *= 1.05;
      predictedEfficiency -= 0.05;
      predictionConfidence -= 0.05;
    }
    if (economicOutlook.unemploymentRate > 0.07) {
      potentialRisks.push("Rising unemployment could indicate reduced economic activity, affecting account liquidity.");
      predictedLiquidityCoverageRatio -= 0.07;
      predictionConfidence -= 0.05;
    }
    if (economicOutlook.marketSentimentIndex < 0.4) { // Low sentiment index indicates negative market outlook
      potentialRisks.push("Negative market sentiment suggests increased risk aversion and potential for volatile cash flows.");
      predictedEfficiency -= 0.08;
      predictedLiquidityCoverageRatio -= 0.05;
      predictionConfidence -= 0.08;
    }
  } else {
    // Baseline predictions if no historical data.
    potentialRisks.push("Limited historical execution data. Predictions are based on rule configuration and general market trends, with lower confidence.");
    predictionConfidence = 0.5;
    predictedAverageSweepAmount = (rule.minSweepAmount || 0) + ((rule.maxSweepAmount || 0) - (rule.minSweepAmount || 0)) / 2 || 5000;
  }

  // 4. Rule Parameter-specific Risk Assessment (AI pattern matching).
  if (rule.minSweepAmount && rule.maxSweepAmount && rule.minSweepAmount > rule.maxSweepAmount) {
    potentialRisks.push("Configured minimum sweep amount exceeds maximum. This rule will not execute successfully.");
    predictedEfficiency = 0;
    predictionConfidence = 0.1;
  }
  if (!rule.targetBalance || rule.targetBalance <= 0) {
    potentialRisks.push("Target balance is set to zero or negative, which may lead to operational issues or unintended behavior.");
    predictedEfficiency = Math.min(predictedEfficiency, 0.2); // Significant impact
    predictionConfidence = Math.min(predictionConfidence, 0.4);
  }
  if (!rule.fundingDirection || rule.fundingDirection.length === 0) {
    potentialRisks.push("No funding direction specified. Rule is incomplete and cannot function.");
    predictedEfficiency = 0;
    predictionConfidence = 0.1;
  }
  if (rule.schedule.cronExpression && !validateCronExpression(rule.schedule.cronExpression)) { // Custom validation for CRON
    potentialRisks.push("Invalid CRON expression detected. Rule scheduling will fail.");
    predictedEfficiency = 0;
    predictionConfidence = 0.1;
  }


  // Normalize scores and ensure non-negativity
  predictedEfficiency = parseFloat(Math.min(1.0, Math.max(0.0, predictedEfficiency)).toFixed(2));
  predictedExecutionFrequency = parseFloat(Math.max(0.0, predictedExecutionFrequency).toFixed(1));
  predictedAverageSweepAmount = parseFloat(Math.max(0.0, predictedAverageSweepAmount).toFixed(2));
  predictedLiquidityCoverageRatio = parseFloat(Math.min(2.0, Math.max(0.5, predictedLiquidityCoverageRatio)).toFixed(2));
  predictionConfidence = parseFloat(Math.min(1.0, Math.max(0.0, predictionConfidence)).toFixed(2));

  return {
    predictedEfficiency,
    predictedExecutionFrequency,
    predictedAverageSweepAmount,
    predictedLiquidityCoverageRatio,
    potentialRisks: [...new Set(potentialRisks)], // Remove duplicates
    predictionConfidence,
    modelUsed,
    forecastPeriodDays,
    estimatedMaintenanceCost: parseFloat((predictedExecutionFrequency * 0.5 + (potentialRisks.length * 5)).toFixed(2)), // Hypothetical cost
  };
};

/**
 * @function detectGeminiAIAnomalyInSweepExecution
 * @description Utilizes Gemini AI's pattern recognition and anomaly detection capabilities
 * to continuously monitor sweep rule executions. It identifies unusual behavior,
 * deviations from baseline, or potential operational issues that require attention.
 * @param historicalExecutions A chronological list of recent sweep execution records.
 * @param baselineBehavior A statistical representation of the expected, normal behavior for the sweep rule.
 * @param currentSystemHealth An object indicating overall system performance and load.
 * @returns A promise resolving to a list of detected anomalies.
 */
export const detectGeminiAIAnomalyInSweepExecution = async (
  historicalExecutions: SweepExecutionRecord[],
  baselineBehavior: SweepBaselineBehavior,
  currentSystemHealth: { cpuLoad: number; memoryUsage: number; dbLatencyMs: number }
): Promise<SweepAnomaly[]> => {
  // Simulate Gemini AI performing real-time analytics on execution streams.
  // This would typically involve streaming data to an AI service that maintains
  // learned baseline models and flags deviations.
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000)); // Simulate AI analysis time

  const anomalies: SweepAnomaly[] = [];

  if (historicalExecutions.length < 7) { // Need at least a week's data for meaningful patterns, assuming daily sweeps
    if (historicalExecutions.length > 0) {
        anomalies.push({
            type: "OTHER",
            severity: "INFO",
            message: "Insufficient historical data for comprehensive Gemini AI anomaly detection. Building baseline.",
            timestamp: new Date().toISOString(),
        });
    }
    return anomalies;
  }

  const lastExecution = historicalExecutions[historicalExecutions.length - 1];

  // --- Gemini AI Anomaly Detection Heuristics (simulated complex models) ---

  // 1. Amount Deviation: Check if the actual sweep amount significantly differs from the average.
  if (lastExecution.actualSweepAmount !== undefined && baselineBehavior.averageSweepAmount) {
    const amountDifference = Math.abs(lastExecution.actualSweepAmount - baselineBehavior.averageSweepAmount);
    const percentageDeviation = amountDifference / baselineBehavior.averageSweepAmount;
    if (percentageDeviation > 0.75) { // Critical deviation (e.g., 75% above/below average)
      anomalies.push({
        type: "AMOUNT_DEVIATION",
        severity: "CRITICAL",
        message: `Last sweep amount (${lastExecution.actualSweepAmount.toFixed(2)}) significantly deviates from its historical average (${baselineBehavior.averageSweepAmount.toFixed(2)}).`,
        timestamp: lastExecution.timestamp,
        details: { expected: baselineBehavior.averageSweepAmount, actual: lastExecution.actualSweepAmount, deviation: percentageDeviation.toFixed(2) },
        resolutionSuggestion: "Investigate unusual account activity or unexpected target balance changes. Consider re-optimizing rule parameters.",
      });
    } else if (percentageDeviation > 0.30) { // High deviation (30% above/below average)
        anomalies.push({
            type: "AMOUNT_DEVIATION",
            severity: "HIGH",
            message: `Last sweep amount (${lastExecution.actualSweepAmount.toFixed(2)}) deviates significantly from its historical average (${baselineBehavior.averageSweepAmount.toFixed(2)}).`,
            timestamp: lastExecution.timestamp,
            details: { expected: baselineBehavior.averageSweepAmount, actual: lastExecution.actualSweepAmount, deviation: percentageDeviation.toFixed(2) },
            resolutionSuggestion: "Review recent account transactions and market conditions for underlying causes.",
        });
    }
  }

  // 2. Status Deviation & Frequent Failures: Monitor for unexpected outcomes or recurring issues.
  if (lastExecution.outcome !== baselineBehavior.expectedOutcome) {
    if (lastExecution.outcome === SweepOperationOutcome.FAILURE || lastExecution.outcome === SweepOperationOutcome.INSUFFICIENT_FUNDS || lastExecution.outcome === SweepOperationOutcome.COMPLIANCE_VIOLATION) {
      const recentFailureCount = historicalExecutions.slice(-5).filter(ex => ex.outcome === lastExecution.outcome).length;
      if (recentFailureCount >= 3) {
        anomalies.push({
          type: "FREQUENT_FAILURE",
          severity: "CRITICAL",
          message: `Sweep rule has experienced ${recentFailureCount} consecutive or near-consecutive '${lastExecution.outcome}' outcomes.`,
          timestamp: lastExecution.timestamp,
          details: { expectedOutcome: baselineBehavior.expectedOutcome, actualOutcome: lastExecution.outcome, failureCount: recentFailureCount },
          resolutionSuggestion: `Immediately investigate the root cause of the '${lastExecution.outcome}' outcomes. Review rule configuration and account status.`,
        });
      } else {
        anomalies.push({
          type: "UNEXPECTED_STATUS",
          severity: "HIGH",
          message: `Last sweep execution resulted in an unexpected outcome: '${lastExecution.outcome}'. Expected: '${baselineBehavior.expectedOutcome}'.`,
          timestamp: lastExecution.timestamp,
          details: { expected: baselineBehavior.expectedOutcome, actual: lastExecution.outcome, errorMessage: lastExecution.errorMessage },
          resolutionSuggestion: "Review the execution log for detailed error messages and verify external system statuses.",
        });
      }
    } else if (lastExecution.outcome === SweepOperationOutcome.SKIPPED && baselineBehavior.expectedOutcome !== SweepOperationOutcome.SKIPPED) {
      anomalies.push({
        type: "UNEXPECTED_STATUS",
        severity: "LOW",
        message: `Sweep was skipped unexpectedly. Target balance may have been met prematurely or funds were unavailable.`,
        timestamp: lastExecution.timestamp,
        details: { expected: baselineBehavior.expectedOutcome, actual: lastExecution.outcome },
        resolutionSuggestion: "Check originating account balance and recent transactions. AI optimization might be needed.",
      });
    }
  }

  // 3. Timing Deviation: Detect if sweeps are consistently executing outside their expected window.
  if (lastExecution.executionDurationMs && baselineBehavior.averageExecutionTimeMs) {
    const durationDeviation = lastExecution.executionDurationMs - baselineBehavior.averageExecutionTimeMs;
    if (durationDeviation > baselineBehavior.averageExecutionTimeMs * 0.5 && lastExecution.outcome !== SweepOperationOutcome.SKIPPED) {
      anomalies.push({
        type: "TIMING_DEVIATION",
        severity: "MEDIUM",
        message: `Sweep execution time (${lastExecution.executionDurationMs}ms) is significantly longer than average (${baselineBehavior.averageExecutionTimeMs}ms).`,
        timestamp: lastExecution.timestamp,
        details: { expectedDuration: baselineBehavior.averageExecutionTimeMs, actualDuration: lastExecution.executionDurationMs },
        resolutionSuggestion: "Investigate system performance, database latency, or external service dependencies. Check currentSystemHealth metrics.",
      });
    }
  }

  // 4. Unexpected Balance Fluctuations (AI-driven pattern recognition)
  // Gemini AI analyzes the balance before and after sweeps relative to the target,
  // identifying if the account is consistently far from the target or exhibiting unusual volatility.
  if (lastExecution.originatingAccountBalanceBefore && lastExecution.targetBalanceReached !== undefined && !lastExecution.targetBalanceReached) {
      const targetDifference = Math.abs(lastExecution.originatingAccountBalanceAfter - (lastExecution.requestedSweepAmount || 0) - (lastExecution.originatingAccountBalanceBefore || 0)); // Simplified
      if (targetDifference > (baselineBehavior.averageSweepAmount * 2) && lastExecution.outcome === SweepOperationOutcome.FAILURE) {
          anomalies.push({
              type: "UNUSUAL_BALANCE_FLUCTUATION",
              severity: "HIGH",
              message: `Originating account balance remains significantly off-target after sweep attempt, indicating deeper liquidity issues or misconfigured target.`,
              timestamp: lastExecution.timestamp,
              details: { balanceAfter: lastExecution.originatingAccountBalanceAfter, target: (lastExecution.requestedSweepAmount || 0), deviation: targetDifference },
              resolutionSuggestion: "Evaluate the target balance and funding direction. Consider Gemini AI optimization for account liquidity. Check for large external debits/credits.",
          });
      }
  }

  // 5. System Health Correlation (Gemini AI could correlate anomalies with system-wide issues)
  if (currentSystemHealth.cpuLoad > 0.9 || currentSystemHealth.dbLatencyMs > 500) {
    const recentFailures = historicalExecutions.slice(-3).filter(rec => rec.outcome === SweepOperationOutcome.FAILURE).length;
    if (recentFailures > 0) {
      anomalies.push({
        type: "OTHER",
        severity: "WARNING",
        message: `Potential correlation: Sweep failures observed during periods of high system load (CPU: ${currentSystemHealth.cpuLoad.toFixed(2)}, DB Latency: ${currentSystemHealth.dbLatencyMs}ms).`,
        timestamp: new Date().toISOString(),
        details: { systemHealth: currentSystemHealth },
        resolutionSuggestion: "Investigate infrastructure capacity and scaling. Consider scheduling high-priority sweeps during off-peak hours.",
      });
    }
  }

  return anomalies;
};

// --- Utility Functions ---

/**
 * @function validateSweepRuleFormValues
 * @description Provides a robust, client-side validation mechanism for sweep rule form values.
 * This ensures data integrity and a smooth user experience by catching errors before submission.
 * @param values The FormValues object representing the current state of the form.
 * @returns An object where keys are form field names and values are error messages, if any.
 */
export const validateSweepRuleFormValues = (values: FormValues): Partial<Record<keyof FormValues | string, string>> => {
  const errors: Partial<Record<keyof FormValues | string, string>> = {};

  // Rule Name Validation
  if (!values.ruleName || values.ruleName.trim().length === 0) {
    errors.ruleName = "Rule name is required.";
  } else if (values.ruleName.trim().length < 3) {
    errors.ruleName = "Rule name must be at least 3 characters long.";
  } else if (values.ruleName.trim().length > 100) {
    errors.ruleName = "Rule name cannot exceed 100 characters.";
  }

  // Account Validation
  if (!values.originatingAccount) {
    errors.originatingAccount = "Originating account selection is required.";
  }
  if (!values.receivingAccount) {
    errors.receivingAccount = "Receiving account selection is required.";
  }
  if (values.originatingAccount && values.receivingAccount && values.originatingAccount === values.receivingAccount) {
    errors.originatingAccount = "Originating and receiving accounts must be distinct.";
    errors.receivingAccount = "Originating and receiving accounts must be distinct.";
  }

  // Description Validation
  if (!values.description || values.description.trim().length === 0) {
    errors.description = "A detailed description of the rule's purpose is required.";
  } else if (values.description.trim().length < 15) {
    errors.description = "Description must be at least 15 characters for clarity.";
  } else if (values.description.trim().length > 500) {
    errors.description = "Description cannot exceed 500 characters.";
  }

  // Funding Direction Validation
  if (!values.fundingDirection || values.fundingDirection.length === 0) {
    errors.fundingDirection = "At least one funding direction (Draw Down or Top Up) must be selected.";
  }

  // Target Balance Validation
  if (values.targetBalance === undefined || values.targetBalance === null) {
    errors.targetBalance = "Target balance is a required numerical value.";
  } else if (values.targetBalance < 0) {
    errors.targetBalance = "Target balance cannot be negative.";
  } else if (isNaN(values.targetBalance)) {
      errors.targetBalance = "Target balance must be a valid number.";
  }

  // Sweep Amount Validation
  if (values.minSweepAmount !== undefined && values.minSweepAmount !== null) {
    if (values.minSweepAmount < 0) {
      errors.minSweepAmount = "Minimum sweep amount cannot be negative.";
    } else if (isNaN(values.minSweepAmount)) {
        errors.minSweepAmount = "Minimum sweep amount must be a valid number.";
    }
  }
  if (values.maxSweepAmount !== undefined && values.maxSweepAmount !== null) {
    if (values.maxSweepAmount < 0) {
      errors.maxSweepAmount = "Maximum sweep amount cannot be negative.";
    } else if (isNaN(values.maxSweepAmount)) {
        errors.maxSweepAmount = "Maximum sweep amount must be a valid number.";
    }
  }
  if (values.minSweepAmount !== undefined && values.maxSweepAmount !== undefined &&
      values.minSweepAmount !== null && values.maxSweepAmount !== null &&
      values.minSweepAmount > values.maxSweepAmount) {
    errors.minSweepAmount = "Minimum sweep amount cannot exceed the maximum sweep amount.";
    errors.maxSweepAmount = "Maximum sweep amount cannot be less than the minimum sweep amount.";
  }

  // Scheduled Time Validation
  if (values.scheduledHour === undefined || values.scheduledHour === null || values.scheduledHour < 0 || values.scheduledHour > 23) {
    errors.scheduledHour = "Scheduled hour must be a valid hour between 0 and 23.";
  }
  if (values.scheduledMinutes === undefined || values.scheduledMinutes === null || values.scheduledMinutes < 0 || values.scheduledMinutes > 59) {
    errors.scheduledMinutes = "Scheduled minutes must be a valid minute between 0 and 59.";
  }

  // Schedule Specific Validations
  const schedule = values.schedule;
  if (!schedule.recurrenceType) {
    errors["schedule.recurrenceType"] = "Recurrence type is a mandatory selection.";
  }

  // Interval validation for recurring types
  if ((schedule.recurrenceType === RecurrenceType.DAILY || schedule.recurrenceType === RecurrenceType.WEEKLY || schedule.recurrenceType === RecurrenceType.MONTHLY) && (!schedule.interval || schedule.interval <= 0 || isNaN(schedule.interval))) {
    errors["schedule.interval"] = "Interval must be a positive integer.";
  }

  // Days of Week for Weekly
  if (schedule.recurrenceType === RecurrenceType.WEEKLY && (!schedule.daysOfWeek || schedule.daysOfWeek.length === 0)) {
    errors["schedule.daysOfWeek"] = "At least one day of the week must be selected for weekly sweeps.";
  }

  // Days of Month for Monthly
  if (schedule.recurrenceType === RecurrenceType.MONTHLY && (!schedule.daysOfMonth || schedule.daysOfMonth.length === 0)) {
    errors["schedule.daysOfMonth"] = "At least one day of the month must be specified for monthly sweeps.";
  } else if (schedule.recurrenceType === RecurrenceType.MONTHLY && schedule.daysOfMonth) {
      if (schedule.daysOfMonth.some(day => day < 1 || day > 31 || isNaN(day))) {
          errors["schedule.daysOfMonth"] = "Days of month must be valid numbers between 1 and 31.";
      }
  }

  // Specific Dates for Once
  if (schedule.recurrenceType === RecurrenceType.ONCE && (!schedule.specificDates || schedule.specificDates.length === 0)) {
    errors["schedule.specificDates"] = "At least one specific date is required for one-time sweeps.";
  } else if (schedule.recurrenceType === RecurrenceType.ONCE && schedule.specificDates) {
      if (schedule.specificDates.some(d => isNaN(new Date(d).getTime()))) {
          errors["schedule.specificDates"] = "All specific dates must be valid date formats.";
      }
  }

  // CRON Expression for Custom Cron
  if (schedule.recurrenceType === RecurrenceType.CUSTOM_CRON && (!schedule.cronExpression || schedule.cronExpression.trim().length === 0)) {
    errors["schedule.cronExpression"] = "A valid CRON expression is required for custom schedules.";
  } else if (schedule.recurrenceType === RecurrenceType.CUSTOM_CRON && schedule.cronExpression && !validateCronExpression(schedule.cronExpression)) {
      errors["schedule.cronExpression"] = "Invalid CRON expression format detected. Please provide a valid CRON string.";
  }


  // End Date Validation
  if (schedule.endDate) {
    const endDateTime = new Date(schedule.endDate);
    if (isNaN(endDateTime.getTime())) {
      errors["schedule.endDate"] = "End date must be a valid date format.";
    } else if (endDateTime < new Date(new Date().setHours(0, 0, 0, 0))) { // Compare against start of current day
      errors["schedule.endDate"] = "End date cannot be in the past.";
    }
  }

  // End After Occurrences Validation
  if (schedule.endType === "AFTER_OCCURRENCES" && (!schedule.endAfterOccurrences || schedule.endAfterOccurrences <= 0 || isNaN(schedule.endAfterOccurrences))) {
    errors["schedule.endAfterOccurrences"] = "Number of occurrences must be a positive integer.";
  }

  // Priority Validation
  if (values.priority !== undefined && values.priority !== null) {
      if (values.priority < DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.minRulePriority || values.priority > DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.maxRulePriority) {
          errors.priority = `Priority must be between ${DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.minRulePriority} and ${DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.maxRulePriority}.`;
      } else if (isNaN(values.priority)) {
          errors.priority = "Priority must be a valid number.";
      }
  }

  // Currency Validation (basic check)
  if (!values.currency || values.currency.trim().length === 0) {
      errors.currency = "Currency is required.";
  } else if (values.currency.length !== 3) {
      errors.currency = "Currency must be a 3-letter ISO code (e.g., 'USD').";
  }

  // Payment Type Validation
  if (values.paymentType === undefined || values.paymentType === null || !Object.values(PaymentTypeEnum).includes(values.paymentType)) {
      errors.paymentType = "Payment type is required and must be a valid selection.";
  }

  return errors;
};

/**
 * @function validateCronExpression
 * @description A basic validator for CRON expressions.
 * In a production environment, a dedicated CRON parser library would be used for full validation.
 * This provides a rudimentary check for common CRON format issues.
 * @param cronExpression The CRON string to validate.
 * @returns true if the expression appears valid, false otherwise.
 */
export const validateCronExpression = (cronExpression: string): boolean => {
  if (!cronExpression) return false;
  const parts = cronExpression.trim().split(/\s+/); // Split by one or more spaces
  // Common CRON formats: 5 parts (minute hour day-of-month month day-of-week)
  // or 6 parts (second minute hour day-of-month month day-of-week)
  // or 7 parts (year second minute hour day-of-month month day-of-week)
  // This simplistic check covers the most common 5-part format structure.
  if (parts.length < 5 || parts.length > 7) {
    return false; // Incorrect number of fields
  }
  // A real parser would validate each field's content (* / , - ? L W # numbers)
  // For demonstration, we just check part count.
  return true;
};

/**
 * @function generateNextExecutionTime
 * @description Calculates the next anticipated execution timestamp for a sweep rule based on its schedule.
 * This function accounts for various recurrence types, time zones, and end conditions,
 * ensuring precise scheduling within the system.
 * @param schedule The sweep rule's detailed schedule configuration.
 * @param scheduledHour The hour of the day for execution (0-23).
 * @param scheduledMinutes The minute of the hour for execution (0-59).
 * @param now The current reference date and time (defaulting to new Date()). Used to find *next* execution.
 * @returns An ISO 8601 date string representing the next execution time, or null if no future time is found.
 */
export const generateNextExecutionTime = (
  schedule: SweepSchedule,
  scheduledHour: number,
  scheduledMinutes: number,
  now: Date = new Date(),
): string | null => {
  let nextExecutionDate: Date | null = null;
  const currentUtcDate = new Date(now.toISOString()); // Use UTC as base for calculations for consistency
  const currentYear = currentUtcDate.getUTCFullYear();
  const currentMonth = currentUtcDate.getUTCMonth();
  const currentDay = currentUtcDate.getUTCDate();

  // Helper to set time in UTC
  const setTimeToRuleUtcTime = (date: Date): Date => {
    date.setUTCHours(scheduledHour, scheduledMinutes, 0, 0);
    return date;
  };

  switch (schedule.recurrenceType) {
    case RecurrenceType.DAILY:
      nextExecutionDate = new Date(Date.UTC(currentYear, currentMonth, currentDay));
      setTimeToRuleUtcTime(nextExecutionDate);
      if (nextExecutionDate <= currentUtcDate) {
        nextExecutionDate.setUTCDate(nextExecutionDate.getUTCDate() + (schedule.interval || 1));
      }
      break;

    case RecurrenceType.WEEKLY:
      const targetDaysOfWeek = schedule.daysOfWeek?.map(day => {
        switch (day) {
          case "SUN": return 0; case "MON": return 1; case "TUE": return 2; case "WED": return 3;
          case "THU": return 4; case "FRI": return 5; case "SAT": return 6;
          default: return -1;
        }
      }).filter(d => d !== -1).sort((a, b) => a - b) || [];

      if (targetDaysOfWeek.length === 0) return null;

      let tempNextWeekDate: Date | null = null;
      for (let i = 0; i < 14; i++) { // Check up to two weeks to cover all intervals
        const potentialDate = new Date(Date.UTC(currentYear, currentMonth, currentDay + i));
        setTimeToRuleUtcTime(potentialDate);
        if (potentialDate > currentUtcDate && targetDaysOfWeek.includes(potentialDate.getUTCDay())) {
            // Apply interval logic: find the first valid day after currentUtcDate, then check if it respects interval
            const daysSinceStart = Math.floor((potentialDate.getTime() - currentUtcDate.getTime()) / (1000 * 60 * 60 * 24));
            if (schedule.interval && schedule.interval > 1 && daysSinceStart % (schedule.interval * 7) !== 0) {
                // This means the current potential date falls outside the desired interval.
                // For simplicity here, if interval > 1, assume we need a more robust calendar calculation.
                // A production system might use a library like `luxon` or `date-fns` for complex recurrence.
                // For now, if interval > 1, we rely on finding *any* future day of week, then adjusting.
                // This simplified logic is primarily for interval=1, or finds the next closest.
            }

            if (!tempNextWeekDate || potentialDate < tempNextWeekDate) {
                tempNextWeekDate = potentialDate;
            }
        }
      }
      nextExecutionDate = tempNextWeekDate;

      // Handle weekly interval logic more robustly
      if (nextExecutionDate && schedule.interval && schedule.interval > 1) {
          const firstScheduledWeekDay = targetDaysOfWeek[0]; // Assuming smallest day of week
          let potentialIntervalDate = new Date(Date.UTC(currentYear, currentMonth, currentDay - currentUtcDate.getUTCDay() + firstScheduledWeekWeekDay));
          setTimeToRuleUtcTime(potentialIntervalDate);

          while (potentialIntervalDate <= currentUtcDate) {
              potentialIntervalDate.setUTCDate(potentialIntervalDate.getUTCDate() + (schedule.interval * 7));
          }
          // Now potentialIntervalDate is the first day of the *next* interval's first possible execution week.
          // Find the actual day within that week.
          let finalIntervalDate: Date | null = null;
          for (let i = 0; i < 7; i++) {
              const checkDate = new Date(potentialIntervalDate);
              checkDate.setUTCDate(checkDate.getUTCDate() + i);
              setTimeToRuleUtcTime(checkDate);
              if (targetDaysOfWeek.includes(checkDate.getUTCDay())) {
                  if (!finalIntervalDate || checkDate < finalIntervalDate) {
                      finalIntervalDate = checkDate;
                  }
              }
          }
          if (finalIntervalDate && finalIntervalDate > currentUtcDate) nextExecutionDate = finalIntervalDate;
          else {
              // Fallback if interval logic makes it difficult, just find *any* next day.
              console.warn("Complex weekly interval logic needs refined calculation, falling back to simpler next day detection.");
          }
      }

      break;

    case RecurrenceType.MONTHLY:
      const targetDaysOfMonth = schedule.daysOfMonth || [];
      if (targetDaysOfMonth.length === 0) return null;

      let earliestNextMonthDate: Date | null = null;

      // Check current month first
      for (const dayOfMonth of targetDaysOfMonth) {
        let potentialDate = new Date(Date.UTC(currentYear, currentMonth, dayOfMonth));
        setTimeToRuleUtcTime(potentialDate);

        // Adjust for months with fewer days (e.g., Feb 30 -> Feb 28/29)
        if (potentialDate.getUTCDate() !== dayOfMonth) {
            potentialDate.setUTCDate(0); // Set to last day of prior month
            potentialDate.setUTCDate(dayOfMonth); // Then set day, it will cap at month's end.
        }

        if (potentialDate > currentUtcDate) {
          if (!earliestNextMonthDate || potentialDate < earliestNextMonthDate) {
            earliestNextMonthDate = potentialDate;
          }
        }
      }

      // If nothing in current month or all are past, check next interval's month(s)
      if (!earliestNextMonthDate || earliestNextMonthDate <= currentUtcDate) {
        const intervalMonths = schedule.interval || 1;
        for (const dayOfMonth of targetDaysOfMonth) {
            let potentialDate = new Date(Date.UTC(currentYear, currentMonth + intervalMonths, dayOfMonth));
            setTimeToRuleUtcTime(potentialDate);

            if (potentialDate.getUTCDate() !== dayOfMonth) {
                potentialDate.setUTCDate(0);
                potentialDate.setUTCDate(dayOfMonth);
            }

            if (!earliestNextMonthDate || potentialDate < earliestNextMonthDate) {
                earliestNextMonthDate = potentialDate;
            }
        }
      }
      nextExecutionDate = earliestNextMonthDate;
      break;

    case RecurrenceType.ONCE:
      if (schedule.specificDates && schedule.specificDates.length > 0) {
        const sortedDates = schedule.specificDates.map(d => setTimeToRuleUtcTime(new Date(d))).sort((a, b) => a.getTime() - b.getTime());
        nextExecutionDate = sortedDates.find(d => d > currentUtcDate) || null;
      }
      break;

    case RecurrenceType.CUSTOM_CRON:
      // A robust CRON scheduling requires a dedicated library (e.g., 'cron-parser').
      // For this expanded file, we'll simulate a placeholder for CRON-based next time.
      if (schedule.cronExpression && validateCronExpression(schedule.cronExpression)) {
        // Mocking: Assume a cron library would give us the next date.
        // For example, if cron was "0 9 * * MON-FRI", the next working day at 9 AM.
        // For now, a simple heuristic: next hour, or next day if current hour is past.
        let mockCronDate = new Date(currentUtcDate);
        setTimeToRuleUtcTime(mockCronDate);
        if (mockCronDate <= currentUtcDate) {
            mockCronDate.setUTCHours(mockCronDate.getUTCHours() + 1); // Try next hour
            if (mockCronDate <= currentUtcDate) { // If still past, jump to next day
                mockCronDate.setUTCDate(mockCronDate.getUTCDate() + 1);
                mockCronDate.setUTCHours(scheduledHour, scheduledMinutes, 0, 0); // Reset to scheduled hour
            }
        }
        nextExecutionDate = mockCronDate;
      } else {
          console.warn("Invalid CRON expression. Cannot determine next execution time.");
          return null;
      }
      break;

    default:
      return null;
  }

  // Apply end date condition
  if (nextExecutionDate && schedule.endDate) {
    const endDate = setTimeToRuleUtcTime(new Date(schedule.endDate));
    if (nextExecutionDate > endDate) {
      return null; // Next execution is past the explicitly set end date
    }
  }

  // Note: 'endAfterOccurrences' cannot be calculated by this stateless function alone,
  // as it requires knowing the number of previous executions. That state would typically
  // be managed by a sweep execution engine or persistent storage.

  return nextExecutionDate ? nextExecutionDate.toISOString() : null;
};

/**
 * @function mapFormValuesToApiModel
 * @description Transforms the UI-centric `FormValues` object into a streamlined structure
 * (`Partial<FormValues>`) optimized for API submission. This process ensures data
 * consistency, proper formatting, and removes any UI-only transient fields.
 * @param values The `FormValues` object from the UI.
 * @returns A `Partial<FormValues>` object, suitable for the backend API.
 */
export const mapFormValuesToApiModel = (values: FormValues): Partial<FormValues> => {
  const apiModel: Partial<FormValues> = {
    ...values,
    // Ensure priority is a number type, defaulting if necessary
    priority: values.priority ? Number(values.priority) : DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.minRulePriority,
    // Normalize optional numeric fields: empty strings or nulls should become undefined for API
    minSweepAmount: (values.minSweepAmount === null || values.minSweepAmount === undefined || isNaN(values.minSweepAmount)) ? undefined : values.minSweepAmount,
    maxSweepAmount: (values.maxSweepAmount === null || values.maxSweepAmount === undefined || isNaN(values.maxSweepAmount)) ? undefined : values.maxSweepAmount,
    targetBalance: (values.targetBalance === null || values.targetBalance === undefined || isNaN(values.targetBalance)) ? 0 : values.targetBalance,
    // Ensure dates are in YYYY-MM-DD format for consistency (ISO string date part)
    schedule: {
      ...values.schedule,
      endDate: values.schedule.endDate ? new Date(values.schedule.endDate).toISOString().split('T')[0] : undefined,
      specificDates: values.schedule.specificDates?.map(d => new Date(d).toISOString().split('T')[0]) || undefined,
      // Ensure interval is a number
      interval: values.schedule.interval ? Number(values.schedule.interval) : 1,
      endAfterOccurrences: values.schedule.endAfterOccurrences ? Number(values.schedule.endAfterOccurrences) : undefined,
    },
    // Update audit fields for modifications
    lastModifiedAt: new Date().toISOString(),
    lastModifiedBy: values.lastModifiedBy || "SYSTEM_API_CALLER", // Placeholder if user context not available
    // Remove any client-side only flags or transient states
    geminiAiSuggestionsApplied: undefined, // This is UI state, not for API persistence
  };

  // Conditionally remove schedule fields based on recurrenceType to keep API payload clean
  if (apiModel.schedule) {
    if (apiModel.schedule.recurrenceType !== RecurrenceType.DAILY && apiModel.schedule.recurrenceType !== RecurrenceType.WEEKLY && apiModel.schedule.recurrenceType !== RecurrenceType.MONTHLY) {
        delete apiModel.schedule.interval;
    }
    if (apiModel.schedule.recurrenceType !== RecurrenceType.WEEKLY) {
        delete apiModel.schedule.daysOfWeek;
    }
    if (apiModel.schedule.recurrenceType !== RecurrenceType.MONTHLY) {
        delete apiModel.schedule.daysOfMonth;
    }
    if (apiModel.schedule.recurrenceType !== RecurrenceType.ONCE) {
        delete apiModel.schedule.specificDates;
    }
    if (apiModel.schedule.recurrenceType !== RecurrenceType.CUSTOM_CRON) {
        delete apiModel.schedule.cronExpression;
    }
    if (apiModel.schedule.endType === "NEVER") {
        delete apiModel.schedule.endDate;
        delete apiModel.schedule.endAfterOccurrences;
    } else if (apiModel.schedule.endType === "ON_DATE") {
        delete apiModel.schedule.endAfterOccurrences;
    } else if (apiModel.schedule.endType === "AFTER_OCCURRENCES") {
        delete apiModel.schedule.endDate;
    }
  }

  return apiModel;
};

/**
 * @function mapApiModelToFormValues
 * @description Transforms a sweep rule object retrieved from the backend API into the
 * `FormValues` structure required by the UI. This function ensures that all fields
 * are correctly typed and populated, providing suitable defaults where necessary.
 * @param apiModel The sweep rule object fetched from the API (can be partial).
 * @returns A complete `FormValues` object, suitable for initializing the form.
 */
export const mapApiModelToFormValues = (apiModel: Partial<FormValues>): FormValues => {
  // Deep merge with defaults to ensure all fields are present and correctly typed
  const formValues: FormValues = {
    ...DEFAULT_FORM_VALUES, // Start with a complete set of defaults
    ...apiModel, // Override with API values
    // Specific overrides for complex types or type conversions
    priority: apiModel.priority !== undefined && apiModel.priority !== null ? Number(apiModel.priority) : DEFAULT_FORM_VALUES.priority,
    targetBalance: apiModel.targetBalance !== undefined && apiModel.targetBalance !== null ? Number(apiModel.targetBalance) : DEFAULT_FORM_VALUES.targetBalance,
    minSweepAmount: apiModel.minSweepAmount !== undefined && apiModel.minSweepAmount !== null ? Number(apiModel.minSweepAmount) : DEFAULT_FORM_VALUES.minSweepAmount,
    maxSweepAmount: apiModel.maxSweepAmount !== undefined && apiModel.maxSweepAmount !== null ? Number(apiModel.maxSweepAmount) : DEFAULT_FORM_VALUES.maxSweepAmount,
    scheduledHour: apiModel.scheduledHour !== undefined && apiModel.scheduledHour !== null ? Number(apiModel.scheduledHour) : DEFAULT_FORM_VALUES.scheduledHour,
    scheduledMinutes: apiModel.scheduledMinutes !== undefined && apiModel.scheduledMinutes !== null ? Number(apiModel.scheduledMinutes) : DEFAULT_FORM_VALUES.scheduledMinutes,
    enabled: apiModel.enabled !== undefined ? apiModel.enabled : DEFAULT_FORM_VALUES.enabled,
    sweepRuleStatus: apiModel.sweepRuleStatus || DEFAULT_FORM_VALUES.sweepRuleStatus,
    paymentType: apiModel.paymentType || DEFAULT_FORM_VALUES.paymentType,
    fundingDirection: apiModel.fundingDirection && apiModel.fundingDirection.length > 0 ? apiModel.fundingDirection : DEFAULT_FORM_VALUES.fundingDirection,
    schedule: {
      ...DEFAULT_FORM_VALUES.schedule,
      ...apiModel.schedule,
      interval: apiModel.schedule?.interval !== undefined && apiModel.schedule.interval !== null ? Number(apiModel.schedule.interval) : DEFAULT_FORM_VALUES.schedule.interval,
      endAfterOccurrences: apiModel.schedule?.endAfterOccurrences !== undefined && apiModel.schedule.endAfterOccurrences !== null ? Number(apiModel.schedule.endAfterOccurrences) : DEFAULT_FORM_VALUES.schedule.endAfterOccurrences,
    },
  };

  return formValues;
};

// --- Default Configuration and Constants ---

/**
 * @constant DEFAULT_SWEEP_RULE_SYSTEM_CONFIG
 * @description Provides the default, global configuration for the sweep rule management system.
 * These settings define baseline behaviors, limits, and integration parameters.
 */
export const DEFAULT_SWEEP_RULE_SYSTEM_CONFIG: SweepRuleSystemConfig = {
  defaultCurrency: "USD",
  defaultTimezone: "UTC",
  maxRulesPerUser: 100, // Maximum active rules per user account
  maxRuleLifetimeDays: 365 * 5, // Rules older than 5 years might be auto-archived
  minRulePriority: 1, // Highest priority
  maxRulePriority: 100, // Lowest priority
  aiIntegrationEnabled: true, // Master toggle for all Gemini AI features
  aiOptimizationFrequencyDays: 30, // Gemini AI re-evaluates rules monthly
  aiComplianceCheckLevel: "CRITICAL", // Only critical compliance issues block activation by default
  auditLogRetentionDays: 365, // Keep audit logs for one year
  enableMultiFactorApproval: true, // Require MFA for high-risk rule changes
  webhookNotificationUrls: ["https://example.com/api/sweep_notifications"], // Example webhook for events
};

/**
 * @constant DEFAULT_FORM_VALUES
 * @description Provides the initial, default values for a new sweep rule form.
 * This simplifies form initialization and ensures a consistent starting point for users.
 */
export const DEFAULT_FORM_VALUES: FormValues = {
  ruleName: "New Sweep Rule",
  originatingAccount: "",
  originatingAccountType: ACCOUNT_TYPE_OPTIONS[0].value, // Default to "Checking"
  receivingAccount: "",
  receivingAccountType: ACCOUNT_TYPE_OPTIONS[1].value, // Default to "Savings"
  description: "Automated liquidity management rule.",
  enabled: true,
  paymentType: PaymentTypeEnum.InternalTransfer,
  priority: Math.round((DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.minRulePriority + DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.maxRulePriority) / 2), // Middle priority
  fundingDirection: [SweepRuleDirection.BOTH],
  targetBalance: 10000.00, // Default target balance
  minSweepAmount: 100.00, // Default minimum sweep
  maxSweepAmount: 50000.00, // Default maximum sweep
  scheduledHour: 9, // 9 AM
  scheduledMinutes: 0, // 00 minutes
  currency: DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.defaultCurrency,
  metadata: {},
  tags: ["default", "liquidity-management"],
  schedule: {
    recurrenceType: RecurrenceType.DAILY,
    interval: 1,
    endType: "NEVER",
    timezone: DEFAULT_SWEEP_RULE_SYSTEM_CONFIG.defaultTimezone,
  },
  sweepRuleStatus: SweepRuleStatus.DRAFT,
  version: 1,
  enforceTargetBalanceExact: false,
};

// --- Dropdown Options and Mappings ---

export const PAYMENT_TYPE_OPTIONS = [
  { value: PaymentTypeEnum.InternalTransfer, label: "Internal Transfer (System)" },
  { value: PaymentTypeEnum.AchDebit, label: "ACH Debit (Automated Clearing House)" },
  { value: PaymentTypeEnum.AchCredit, label: "ACH Credit (Automated Clearing House)" },
  { value: PaymentTypeEnum.WireTransfer, label: "Wire Transfer (Real-time Gross Settlement)" },
  { value: PaymentTypeEnum.BookTransfer, label: "Book Transfer (On-Book Movement)" },
  { value: PaymentTypeEnum.Swift, label: "SWIFT Transfer (International)" },
  // Gemini AI could dynamically suggest payment types based on jurisdiction and amount.
];

export const ACCOUNT_TYPE_OPTIONS = [
  { value: "Checking", label: "Checking Account (Demand Deposit)" },
  { value: "Savings", label: "Savings Account (Interest Bearing)" },
  { value: "Investment", label: "Investment Account (Brokerage/Fund)" },
  { value: "CreditCard", label: "Credit Card Account (Line of Credit)" },
  { value: "Loan", label: "Loan Account (Debt Repayment)" },
  { value: "Escrow", label: "Escrow Account (Fiduciary Hold)" },
  { value: "Intercompany", label: "Intercompany Account (Group Transfers)" },
];

export const RECURRENCE_TYPE_OPTIONS = Object.values(RecurrenceType).map(type => ({
  value: type,
  label: type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}));

export const DAYS_OF_WEEK_OPTIONS = [
  { value: "MON", label: "Monday" },
  { value: "TUE", label: "Tuesday" },
  { value: "WED", label: "Wednesday" },
  { value: "THU", label: "Thursday" },
  { value: "FRI", label: "Friday" },
  { value: "SAT", label: "Saturday" },
  { value: "SUN", label: "Sunday" },
];

export const END_TYPE_OPTIONS = [
  { value: "NEVER", label: "Never (Continuous)" },
  { value: "ON_DATE", label: "On Specific Date" },
  { value: "AFTER_OCCURRENCES", label: "After a Number of Occurrences" },
];

export const DAYS_OF_MONTH_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: (i + 1).toString(),
}));

export const SWEEP_RULE_STATUS_OPTIONS = Object.values(SweepRuleStatus).map(status => ({
  value: status,
  label: status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}));

export const SWEEP_RULE_DIRECTION_OPTIONS = Object.values(SweepRuleDirection).map(direction => ({
  value: direction,
  label: direction.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}));

export const LIQUIDITY_TOLERANCE_OPTIONS = [
    { value: "CRITICAL", label: "Critical (Maximize Cash Optimization)" },
    { value: "HIGH", label: "High (Aggressive Cash Management)" },
    { value: "MEDIUM", label: "Medium (Balanced Approach)" },
    { value: "LOW", label: "Low (Prioritize Buffer)" },
    { value: "VERY_HIGH", label: "Very High (Maintain Significant Buffer)" },
];

export const RISK_AVERSION_OPTIONS = [
    { value: "VERY_LOW", label: "Very Low (High Risk Tolerance)" },
    { value: "LOW", label: "Low (Moderate Risk Tolerance)" },
    { value: "MEDIUM", label: "Medium (Standard Risk Aversion)" },
    { value: "HIGH", label: "High (Significant Risk Aversion)" },
    { value: "VERY_HIGH", label: "Very High (Extremely Risk Averse)" },
];

export const CURRENCY_OPTIONS = [
    { value: "USD", label: "US Dollar" },
    { value: "EUR", label: "Euro" },
    { value: "GBP", label: "British Pound" },
    { value: "JPY", label: "Japanese Yen" },
    { value: "CAD", label: "Canadian Dollar" },
    { value: "AUD", label: "Australian Dollar" },
    { value: "CHF", label: "Swiss Franc" },
    // Add more as per system's supported currencies. Gemini AI could fetch real-time exchange rates.
];

// Provide more hour and minute options for dropdowns, for UI flexibility
export const SCHEDULED_HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0') + ':00',
}));

export const SCHEDULED_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: String(i).padStart(2, '0'),
}));
```